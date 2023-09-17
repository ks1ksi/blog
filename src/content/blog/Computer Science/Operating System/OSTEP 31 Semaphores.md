---
title: OSTEP 31 Semaphores
author: Seungil Kim
description: Edsger Dijkstra의 세마포어 동기화 기법에 대해 알아보자
postSlug: OSTEP 31 Semaphores
featured: false
tags:
  - os
  - cs
pubDatetime: 2023-09-18T01:17:56+09:00
---
# OSTEP 31 Semaphores

다양한 범주의 병행성 문제 해결을 위해서는 락과 조건 변수 둘 다 필요하다. 이번 장에서 다룰 ***세마포어는 락과 컨디션 변수로 모두 사용할 수 있다.***

> 핵심 질문 : 세마포어를 어떻게 사용하는가
락과 컨디션 변수 대신에 세마포어를 사용하는 방법은 무엇인가? 세마포어의 정의는 무엇인가? 이진 세마포어는 무엇인가? 락과 컨디션 변수를 사용하여 세마포어를 만드는 것이 가능한가? 그 반대로 세마포어를 사용하여 락과 조건 변수를 만드는 것이 가능한가?

## Table of Contents

## 1. 세마포어: 정의

세마포어는 정수 값을 갖는 객체로서 두 개의 루틴으로 조작할 수 있다. POSIX 표준에서 이 두 개의 루틴은 `sem_wait()`, `sem_post()`이다. 세마포어는 초깃값에 의해 동작이 결정되기 때문에 사용 전에 초기화를 해야 한다.

```c
#include <semaphore.h>
sem_t s;
sem_init(&s, 0, 1);
```

세마포어 `s`를 선언 후 3번째 인자로 1을 전달하여 세마포어의 값을 1로 초기화한다. `sem_init()`의 두 번째 인자는 모든 예제에서 0이다. 이 값은 같은 프로세스 내의 쓰레드 간에 세마포어를 공유한다는 뜻이다. 다른 값을 사용하는 예시 (다른 프로세스간 동기화 제공) 는 docs를 읽어보자.

초기화된 후에는 `sem_wait()`, `sem_post()`라는 함수를 호출하여 세마포어를 다룰 수 있다.

```c
int sem_wait(sem_t *s) {
	decrement the value of semaphore s by one;
	wait if value of semaphore s is negative;
}

int sem_post(sem_t *s) {
	increment the value of semaphore s by one;
	if there are one or more threads waiting, wake one;
}
```

1. `sem_wait()` 함수는 즉시 리턴하거나 (세마포어의 값이 1 이상이면), 아니면 해당 세마포어 값이 1 이상이 될 때까지 호출자를 대기시킨다. 다수의 쓰레드들이 `sem_wait()`을 호출할 수 있기 때문에, 대기큐에는 다수의 쓰레드가 존재할 수 있다. 대기하는 법에는 회전과 재우기 두 가지가 있다는 것을 기억하자.
2. `sem_post()` 함수는 대기하지 않는다. 세마포어 값을 증가시키고 대기 중인 쓰레드 중 하나를 깨운다. 
3. 세마포어가 음수라면 그 값은 현재 대기 중인 쓰레드의 개수와 같다.

이 두 개의 함수는 atomic하게 실행된다고 가정한다. 

## 2. 이진 세마포어 (락)


