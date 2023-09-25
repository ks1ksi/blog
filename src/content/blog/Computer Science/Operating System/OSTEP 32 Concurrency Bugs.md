---
title: OSTEP 32 Concurrency Bugs
author: Seungil Kim
description: 일반적인 병행성 관련 오류에 대해 알아보자
postSlug: OSTEP 32 Concurrency Bugs
featured: false
tags:
  - os
  - cs
pubDatetime: 2023-09-25T16:40:33+09:00
---
# OSTEP 32 Concurrency Bugs

> 병행성 버그는 몇 개의 전형적인 패턴을 가지고 있다. 어떤 경우를 피해야 올바른 병행 코드를 작성할 수 있는지 알아보자

## Table of Contents

## 1. 오류의 종류

현대 응용 프로그램에는 어떤 병행성 오류가 있을까? 다음은 Lu의 연구 결과이다.

![[OSTEP 32 Concurrency Bugs-1695629446329.jpeg]]

이런 종류의 오류 (비 교착 상태와 교착 상태) 들에 대해 좀 더 자세히 알아보자. 

## 2. 비 교착 상태 오류

Lu의 연구 결과에 따르면, 비 교착 상태 오류가 병행성 관련 오류의 과반수를 차지한다. 비 교착 상태 오류의 분류 중 대표적인 **원자성 위반** 오류와 **순서 위반** 오류를 살펴보자.

### 원자성 위반 오류 (atomicity violation)

첫 번째로 만나게 되는 문제는 원자성 위반 오류이다. 

```c
// Thread 1::
if (thd−>proc_info) {
	. . .
	fputs(thd−>proc_info, . . . ) ;
	. . .
}

// Thread 2::
thd−>proc_info = NULL;
```

이 예제에서 `thd` 자료 구조의 `proc_info` 필드를 두 개의 다른 쓰레드가 접근한다. 첫 번째 쓰레드는 그 값이 `NULL`인지 검사하고 값을 출력한다. 두 번째 쓰레드는 값을 `NULL`으로 설정한다.

첫 번째 쓰레드가 검사를 완료한 후, `fputs()`를 호출하기 직전에 인터럽트로 인해 두 번째 쓰레드가 실행되어 값이 `NULL`로 설정될 수 있다. 때문에 `fputs()` 함수는 `NULL` 포인터 역참조를 하게 되어 프로그램은 크래시될 것이다.

> 다수의 메모리 참조 연산들 간에 있어 예상했던 직렬성(serializability)이 보장되지 않았다. 즉 코드의 일부에 원자성이 요구되었으나, 실행 시에 그 원자성이 위반되었다.

현재 예제 코드는 `proc_info` 필드의 `NULL` 값 검사와 `fputs()` 호출 시 `proc_info`를 인자로 사용하는 동작이 원자적으로 실행되는 것 (atomicity assumption)을 가정했다. 이 가정이 깨지면, 코드는 의도한 대로 작동하지 않는다.

코드를 어떻게 수정하면 작동할까? 락을 추가하여 어느 쓰레드든 `proc_info` 필드 접근 시 `proc_info_lock` 이라는 락 변수를 획득하도록 한다. 이 자료 구조를 사용하는 다른 모든 코드들도 락으로 보호해야 한다.

```c
pthread_mutex_t proc_info_lock = PTHREAD_MUTEX_INITIALIZER;

// Thread 1::
pthread_mutex_lock(&proc_info_lock);
if (thd−>proc_info) {
	. . .
	fputs(thd−>proc_info, . . . ) ;
	. . .
}
pthread_mutex_unlock(&proc_info_lock);

// Thread 2::
pthread_mutex_lock(&proc_info_lock);
thd−>proc_info = NULL;
pthread_mutex_unlock(&proc_info_lock);
```

### 순서 위반 오류 (order violation) 

다음은 순서 위반 오류이다. 아래 예시 코드에서 어떤 부분에 오류가 있는지 한번 찾아보자.

```c
// Thread 1::
void init() {
	. . .
	mThread = PR_CreateThread(mMain, . . . ) ;
	. . .
}

// Thread 2::
void mMain ( . . . ) {
	. . .
	mState = mThread−>State;
	. . .
}
```

이 코드에서 쓰레드 2의 코드는 `mThread` 변수가 이미 초기화 + `NULL`이 아님을 가정하고 있다. 하지만 만약 쓰레드 1이 먼저 실행되지 않았다면, 쓰레드 2는 `NULL` 포인터를 사용하기 때문에 크래쉬될 것이다. 초기화되지 않아 `NULL`이 아닌 임의의 메모리 주소를 접근하게 되면 더 이상한 일이 발상할 것이다.

> 두 개의 (그룹의) 메모리 참조 간의 순서가 바뀌었다. 즉, A가 항상 B보다 먼저 실행되어야 하지만 실행 중에 그 순서가 지켜지지 않았다.

이러한 오류를 수정하는 방법은 순서를 강제하는 것이다. 앞에서 논의했던, **컨디션 변수**를 도입해서 순서를 강제해보자. 

```c
pthread_mutex_t mtLock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t mtCond = PTHREAD_COND_INITIALIZER;
int mtInit = 0;

// Thread 1::
void init() {
	. . .
	mThread = PR_CreateThread(mMain, . . . ) ;
	
	// 쓰레드가 생성되었다는 것을 알리는 시그널 전달
	pthread_mutex_lock(&mtLock);
	mtInit = 1;
	pthread_cond_signal(&mtCond);
	pthread_mutex_unlock(&mtLock);
	. . .
}

// Thread 2::
void mMain ( . . . ) {
	. . .
	// 쓰레드가 초기화되기를 기다린다
	pthread_mutex_lock(&mtLock);
	while (mtInit == 0)
		pthread_cond_wait(&mtCond, &mtLock);
	pthread_mutex_unlock(&mtLock);
	
	mState = mThread−>State;
	. . .
}
```

`mtLock`라는 락, 그에 대한 컨디션 변수 `mtCond`, 그리고 상태 변수 `mtInit`을 추가했다. 초기화 코드가 실행되면 `mtInit`의 상태를 1로 설정하고 초기화를 완료했다고 시그널을 발생시킨다. 만약 쓰레드 2가 이 시점 전에 실행된다면 상태가 변경되기를 대기한다. 이후에 다시 쓰레드 2가 실행되면 상태 값 초기화 여부를 검사한 후, (`mtInit`이 1로 설정되었는지 검사한 후) 올바르게 계속 진행한다. 

이렇게 쓰레드 간의 순서가 문제가 되는 경우는 컨디션 변수 (또는 세마포어) 를 사용하여 해결할 수 있다.

### 정리

비 교착 상태 오류의 대부분(97%)은 원자성 또는 순서 위반에 대한 것이었다. 이러한 오류 패턴들을 유의하면 관련 오류들을 좀 더 줄일 수 있다.

## 3. 교착 상태 오류

복잡한 락 프로토콜을 사용하는 다수의 병행 시스템에서 **교착 상태(deadlock)** 라는 고전적 문제가 발생한다. 예를 들어 락 L1을 갖고 있는 쓰레드 2가 락 L1이 해제되기를 기다리고 있을 때 교착 상태가 발생한다. 교착 상태가 발생할 가능성이 있는 코드를 다음에 나타내었다.
```c
Thread 1:     Thread 2:
lock(L1);     lock(L2);
lock(L2);     lock(L1);
```

쓰레드 1이 락 L1을 획득한 후에 문맥 교환이 발생하여 쓰레드 2가 실행되고, 이 때 쓰레드 2가 락 L2를 획득하고 락 L1을 획득하려고 시도하면 교착 상태가 발생한다.

각 쓰레드가 상대방이 소유하고 있는 락을 대기하고 있기 때문에 누구도 실행할 수 없게 된다.
![[OSTEP 32 Concurrency Bugs-1695639772958.jpeg]]

### 교착 상태는 왜 발생하는가 

쓰레드 1과 2가 락을 같은 순서로 획득하도록 코드를 작성하면 교착 상태는 절대 발생하지 않는다. 이렇게 간단하게 해결할 수 있는데 교착 상태는 왜 발생할까?

코드가 많아지면서 구성 요소 간에 복잡한 의존성이 발생하기 때문이다. 운영체제를 예로 들면, 가상 메모리 시스템이 디스크 블럭을 가져오기 위해 파일 시스템에 접근한다. 파일 시스템은 디스크 블럭을 메모리에 탑재하기 위해 메모리 페이지를 확보해야 하고, 이를 위해 가상 메모리 시스템에 접근한다.

또 다른 이유는 **캡슐화**이다. 소프트웨어 모듈화가 개발을 쉽게 하기 때문에 상세한 구현 내용은 감추도록 구현한다. 하지만 이런 모듈화 때문에 교착 상태가 일어날 수 있다.

자바의 `Vector` 클래스를 예로 들면,

```java
Vector v1, v2;
v1.addAll(v2);
```

이 메소드는 `v1`에 대한 락 뿐만 아니라 `v2`에 대한 락도 획득해야 한다. 하지만 어떤 쓰레드가 `v2.addAll(v1)`을 호출하면 교착 상태가 일어날 수 있다.

### 교착 상태 발생 조건

교착 상태가 발생하기 위해서는 네 가지 조건이 충족되어야 한다.

- **상호 배제 (Mutual Exclusion)**: 쓰레드가 자신이 필요로 하는 자원에 대한 독자적인 제어권을 주장한다 (예, 쓰레드가 락을 획득함).
- **점유 및 대기 (Hold-and-wait)**: 쓰레드가 자신에게 할당된 자원 (예 : 이미 획득한 락)을 점유한 채로 다른 자원 (예 : 획득하고자 하는 락)을 대기한다.
- **비 선점 (No preemption)**: 자원 (락)을 점유하고 있는 쓰레드로부터 자원을 강제적 으로 빼앗을 수 없다.
- **순환 대기 (Circular wait)**: 각 쓰레드는 다음 쓰레드가 요청한 하나 또는 그 이상의 자원 (락)을 갖고 있는 쓰레드들의 순환 고리가 있다.

이 네 조건 중 하나라도 만족시키지 않는다면, 교착 상태는 발생하지 않는다. 

### 교착 상태의 예방

#### 순환 대기

