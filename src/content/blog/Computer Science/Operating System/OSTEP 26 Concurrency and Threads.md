---
title: OSTEP 26 Concurrency and Threads
author: Seungil Kim
description: 병행성에 대해 알아보자
postSlug: OSTEP 26 Concurrency and Threads
featured: false
tags:
  - cs
  - os
pubDatetime: 2023-09-11T01:09:18+09:00
---
# OSTEP 26 Concurrency and Threads

이번 장에서는 프로세스를 위한 새로운 개념인 **쓰레드 (Thread) 를 소개한다.**
프로그램에서 한 순간에 하나의 명령어만을 실행하는 (단일 Program Counter) 고전적인 관점에서 벗어나, 멀티 쓰레드 프로그램은 **하나 이상의 실행 지점 (독립적으로 불러들여지고 실행될 수 있는 여러 개의 Program Counter 값)** 을 가지고 있다.

각 쓰레드는 프로세스와 유사하지만 **쓰레드끼리 주소 공간을 공유하기 때문에 동일한 값에 접근할 수 있다.**

하나의 쓰레드의 상태는 프로세스와 유사하게 어디서 명령어들을 불러올지 추적하는 PC와 연산을 위한 레지스터를 가지고 있다. 두 개의 쓰레드가 하나의 프로세서에서 실행 중이라면 두 번째 쓰레드는 **문맥 교환**을 통해 첫 번째 쓰레드와 교체되어야 한다. 첫 번째 쓰레드가 사용하던 레지스터를 저장하고, 두 번째 쓰레드가 사용하던 레지스터의 내용으로 돌려놓는다는 점에서 프로세스의 문맥 교환과 유사하다.

프로세스가 **프로세스 제어 블럭 (PCB)** 에 저장하듯, 프로세스의 쓰레드들의 상태를 저장하기 위해 **쓰레드 제어 블럭 (TCB)** 가 필요하다. 가장 큰 차이점은 **쓰레드 간 문맥 교환에서는 주소 공간을 그대로 사용한다**는 점이다.

쓰레드와 프로세스의 또 다른 차이는 **스택**에 있다. 멀티 쓰레드 프로세스의 경우에는, 각 쓰레드가 독립적으로 실행되며, 주소 공간에는 **쓰레드마다 스택이 할당되어 있다.**

![[OSTEP 26 Concurrency and Threads-1694363175880.jpeg]]

오른쪽 주소 공간에는 두 개의 스택이 존재한다. 스택에서 할당되는 변수들이나 매개변수, 리턴값 등은 **해당 쓰레드의 스택인 쓰레드-로컬 저장소(Thread-local storage)** 에 저장된다. 

쓰레드-로컬 저장소로 인해 정교한 주소 공간의 배치가 무너져버렸다. 스택 사이에 빈 공간이 생겨버렸다. 스택의 크기가 아주 크지 않아도 되기 때문에 대부분의 경우는 문제가 되지 않는다. 재귀 호출을 많이 하면 문제가 생길 수 있다.

## 예제: 쓰레드 생성

"A", "B"를 출력하는 독립적인 두 개의 쓰레드를 만들어보자.

```c
#include <stdio.h>
#include <assert.h>
#include <pthread.h>
#include "common.h"
#include "common_threads.h"

void *mythread(void *arg) {
	printf("%s\n", (char *) arg);
	return NULL;
}

int main(int argc, char *argv[]) {
	pthread_t p1, p2;
	int rc;
	printf("main: begin\n");
	pthread_create(&p1, NULL, mythread, "A");
	pthread_create(&p2, NULL, mythread, "B");
	// join waits for the threads to finish
	pthread_join(p1, NULL);
	pthread_join(p2, NULL);
	printf("main: end\n");
	return 0;
}
```

`mythread()` 함수를 실행할 두 개의 쓰레드를 생성한다. 스케줄러가 어떻게 하느냐에 달려있긴 하지만, 쓰레드가 생성되면 즉시 실행될 수도 있고, 준비 상태에서 실행은 되지 않을 수도 있다.

두 개의 쓰레드를 생성한 후에 메인 쓰레드는 `pthread_join()`을 호출하여 특정 쓰레드의 동작의 종료를 대기한다.

![[OSTEP 26 Concurrency and Threads-1694363842948.jpeg]]
![[OSTEP 26 Concurrency and Threads-1694363849892.jpeg]]

이렇게 실행 순서는 여러 가지로 나올 수 있다. 쓰레드 1이 쓰레드 2보다 먼저 생성된 경우라도, 스케줄러가 쓰레드 2를 먼저 실행하면 "B"가 "A"보다 먼저 출력될 수도 있다.

쓰레드의 생성이 함수의 호출과 유사하게 보인다. 함수 호출에서는 함수 실행 후에 호출자 (caller) 에게 리턴하는 반면, 쓰레드의 생성에서는 실행할 명령어들을 갖고 있는 새로운 쓰레드가 생성되고, 생성된 쓰레드는 caller와는 별개로 실행된다. 쓰레드 생성 함수가 리턴되기 전에 쓰레드가 실행될 수도 있고, 리턴된 이후에 쓰레드가 실행될 수도 있다.

이렇게 쓰레드는 **언제 실행되는지 알기 어렵다.**

## 2. 훨씬 더 어려운 이유: 데이터의 공유

전역 공유 변수를 갱신하는 두 개의 쓰레드에 대한 예제를 살펴보자.

```c
#include <stdio.h>
#include <pthread.h>
#include "ommon.h"
#include "common_threads.h"
static volatile int counter = 0;

// mythread()
// Simply adds 1 to counter repeatedly, in a loop
// No, this is not how you would add 10,000,000 to
// a counter, but it shows the problem nicely.

void *mythread(void *arg) {
	printf("%s: begin\n", (char *) arg);
	int i;
	for (i = 0; i < 1e7; i++) {
		counter = counter + 1;
	}
	printf("%s: done\n", (char *) arg);
	return NULL;
}

// main()
//
// Just launches two threads (pthread_create)
// and then waits for them (pthread_join)

int main(int argc, char *argv[]) {
	pthread_t p1, p2;
	printf("main: begin (counter = %d)\n", counter);
	pthread_create(&p1, NULL, mythread, "A");
	pthread_create(&p2, NULL, mythread, "B");
	// join waits for the threads to finish
	pthread_join(p1, NULL);
	pthread_join(p2, NULL);
	printf("main: done with both (counter = %d)\n",
	counter);
	return 0;
}
```

