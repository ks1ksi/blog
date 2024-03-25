---
author: Seungil Kim
description: POSIX Threads API에 대해 알아보자
featured: false
postSlug: OSTEP 27 Thread API
pubDatetime: 2023-09-11T03:19:20+09:00
tags:
  - cs
  - os
title: OSTEP 27 Thread API
---
# OSTEP 27 Thread API

앞서 소개한 쓰레드를 다루는 방법에 대해 알아보자.

## 1. 쓰레드 생성

**POSIX**에서는 쉽게 쓰레드를 생성할 수 있다.

```c
#include <pthread.h>
int pthread_create(
			pthread_t*      thread,
	  const pthread_attr_t* attr,
			void*           (*start_routine)(void*),
			void*           arg);
```

> POSIX(Portable Operating System Interface)는 운영체제 간에 이식성(Portability)을 높이기 위한 API(Application Programming Interface)와 명령어 셋 등을 정의하는 표준입니다. 이 표준은 IEEE(Institute of Electrical and Electronics Engineers)에 의해 IEEE 1003 시리즈라고 불리는 명세로 정의되어 있습니다. POSIX는 주로 UNIX와 UNIX-like 시스템(예: Linux, macOS)에서 사용되며, 이 표준을 따르는 운영체제에서는 동일한 또는 유사한 프로그래밍 인터페이스를 제공함으로써, 소프트웨어의 이식성을 높입니다.

> POSIX 표준에는 파일 시스템, 프로세스 관리, 스레드 관리, 입출력, 메모리 관리 등 다양한 부분이 포함되어 있습니다. 여기서 `pthread_create` 함수는 POSIX 스레드(POSIX Threads, 또는 Pthreads)를 생성하기 위한 C 라이브러리 함수 중 하나입니다. 이 함수를 사용하면 운영체제가 지원하는 스레드를 생성하고 관리할 수 있습니다.

`thread`는 `pthread_t` 타입 구조체를 가리키는 포인터이다. 이 구조체가 쓰레드와 상호작용하는데 사용된다.

`attr`은 쓰레드의 속성을 지정한다. 스택의 크기, 스케줄링 우선순위 같은 정보를 지정하기 위해서 사용한다. 대부분은 `NULL`을 전달해서 디폴트 값으로 사용한다.

`start_routine`은 이 쓰레드가 실행할 **함수**를 나타낸다. C언어의 함수 포인터를 통해 전달한다.

> C 언어의 함수 포인터는 함수의 주소를 저장하는 변수입니다. 함수 포인터를 사용하면 함수를 다른 함수의 인수로 전달하거나, 배열의 원소로 저장하고, 런타임에 어떤 함수를 호출할지 결정할 수 있습니다. 이런 유연성 덕분에 콜백, 테이블 기반의 점프, 라이브러리 함수의 인터페이스 등 다양한 상황에서 활용됩니다.

```c
int add(int a, int b) {
    return a + b;
}

int (*func_ptr)(int, int);

func_ptr = add;

int result = func_ptr(2, 3);  // 결과는 5

---

void apply(int *arr, int size, int (*operation)(int)) {
    for(int i = 0; i < size; ++i) {
        arr[i] = operation(arr[i]);
    }
}

int square(int n) {
    return n * n;
}

// 사용 예
int numbers[] = {1, 2, 3, 4, 5};
apply(numbers, 5, square);

---

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }

// 함수 포인터 배열
int (*operations[])(int, int) = {add, subtract};

// 사용 예
int result1 = operations[0](10, 5);  // add 함수 호출, 결과는 15
int result2 = operations[1](10, 5);  // subtract 함수 호출, 결과는 5
```

`void*` 타입의 인자를 받고, `void*` 타입의 값을 반환한다.

`arg`는 실행할 함수에게 전달할 인자를 나타낸다. **왜 `void*` 타입인가? 어떤 데이터 타입도 인자로 전달할 수 있고, 어떤 타입의 결과도 반환할 수 있기 때문이다.**

```c
#include <stdio.h>
#include <pthread.h>

typedef struct {
	int a;
	int b;
} myarg_t;

void *mythread(void *arg) {
	myarg_t *args = (myarg_t *) arg;
	printf("%d %d\n", args->a, args->b);
	return NULL;
}

int main(int argc, char *argv[]) {
	pthread_t p;
	myarg_t args = { 10, 20 };
	int rc = pthread_create(&p, NULL, mythread, &args);
    ...
 
```

## 2. 쓰레드 종료

다른 쓰레드가 작업을 완료할 때가지 기다려야 한다면 어떻게 해야 할까? POSIX 쓰레드에서는 `pthread_join()`을 호출하면 된다.

```c
int pthread_join(pthread_t thread, void **value_ptr);
```

두 개의 인자를 받는다. 첫 번째는 어떤 쓰레드를 기다리려고 하는지 명시한다. 이 변수는 아까 쓰레드를 생성할 때 초기화되었다. 두 번째 인자는 반환 값에 대한 포인터이다. 

```c
#include <stdio.h>
#include <pthread.h>
#include <assert.h>
#include <stdlib.h>

typedef struct { int a; int b; } myarg_t;
typedef struct { int x; int y; } myret_t;

void *mythread(void *arg) {
	myret_t *rvals = malloc(sizeof(myret_t));
	rvals->x = 1;
	rvals->y = 2;
	return (void *) rvals;
}

int main(int argc, char *argv[]) {
	pthread_t p;
	myret_t *rvals;
	myarg_t args = { 10, 20 };
	pthread_create(&p, NULL, mythread, &args);
	pthread_join(p, (void **) &rvals);
	printf("returned %d %d\n", rvals->x, rvals->y);
	free(rvals);
	return 0;
}
```

```c
void *mythread(void *arg) {
	myarg_t *args = (myarg_t *) arg;
	printf("%d %d\n", args->a, args->b);
	myret_t oops; // ALLOCATED ON STACK: BAD!
	oops.x = 1;
	oops.y = 2;
	return (void *) &oops;
}
```

`pthread_join()`에서 반환 값을 받을 때, 동적 메모리 할당을 사용하지 않고, 스택에 할당하면 안된다. 쓰레드가 종료되면, `oops` 값은 쓰레드가 리턴할 때 자동으로 해제된다. 현재 해제된 변수를 가리키는 포인터를 반환하는 것은 좋지 않다.

사실 `pthread_create()`를 사용하여 생성하고, 직후에 `pthread_join()`해서 기다리는 것 보다는, 여러 개의 쓰레드를 생성해 놓고, 쓰레드가 끝나기를 기다리는 것이 보통이다.

하지만 모든 멀티 쓰레드 코드가 조인 루틴을 사용하는 것은 아니다. 예를 들어 웹서버의 경우, 여러 개의 작업자 쓰레드를 생성하고 메인 쓰레드를 이용하여 사용자 요청을 받아 작업자에게 전달하는 작업을 무한히 할 것이다. 이런 프로그램은 `join`을 할 필요가 없다. 하지만, 특정 작업을 병렬적으로 실행하기 위해 쓰레드를 생성하는 병렬 프로그램의 경우에는, 종료 전 혹은 계산의 다음 단계로 넘어가기 전에 병렬 수행이 모두 완료되었다는 것을 확인하기 위해 `join`을 사용한다.

[Apache Tomcat](https://github.com/apache/tomcat)

## 3. 락

쓰레드의 생성과 조인 다음으로 가장 유용한 함수는 락(lock)을 통한 임계 영역에 대한 상호 배제 기법이다. 

```c
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

다음과 같이 쉽게 사용할 수 있다.

```c
pthread_mutex_t lock;
pthread_mutex_lock(&lock);
x = x + 1;
pthread_mutex_unlock(&lock);
```

사실 이 코드는 올바르지 않다. 우선 초기화를 하지 않았다.

POSIX 쓰레드를 사용할 때 락을 초기화하는 방법은 두 가지이다. 한 가지 방법은 다음과 같이 `PTHREAD_MUTEX_INITIALIZER`를 사용하는 것이다.
`pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;`
위 연산은 락을 디폴트 값으로 설정한다. 동적으로 초기화하는 방법은 (즉, 실행 중에) 다음과 같이 `pthread_mutex_init()`을 호출하는 것이다.

```c
int rc = pthread_mutex_init(&lock, NULL);
assert(rc == 0); // 성공했는지 확인해야 한다.
```
또 이렇게 성공했는지 확인해줘야 한다. 락 사용이 끝났다면 `pthread_mutex_destroy()`도 호출해야 한다.

> 간단히 말해서, `pthread_mutex_init(&lock, NULL);`은 `lock`이라는 이름의 뮤텍스를 초기화하는 명령입니다. 이후에는 이 `lock` 변수를 사용하여 `pthread_mutex_lock(&lock)` 또는 `pthread_mutex_unlock(&lock)` 등의 뮤텍스 관련 함수를 호출할 수 있습니다.

락과 언락 외에도 락 관련 루틴들이 더 존재한다.

```c
int pthread_mutex_trylock(pthread_mutex_t *mutex);
int pthread_mutex_timedlock(pthread_mutex_t *mutex,
							struct timespec *abs_timeout);
```

`trylock`은 락이 이미 사용 중이라면 실패 코드를 반환한다. `timedlock`은 타임아웃이 끝나거나 락을 획득하거나 둘 중 하나가 발생하면 리턴한다. 이 두 함수는 사용하지 않는 것이 좋지만, 락 획득 루틴에서 무한정 대기하는 상황을 피하기 위해 사용하기도 한다.

## 4. 컨디션 변수

```c
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);
int pthread_cond_signal(pthread_cond_t *cond);
```

> 컨디션 변수는 멀티스레딩 환경에서 특정 조건이 충족되었을 때 스레드들에게 알려주는 메커니즘입니다. POSIX (Portable Operating System Interface) 표준에 따라, C언어에서는 `pthread_cond_wait`, `pthread_cond_signal` 등의 함수를 사용하여 컨디션 변수를 구현할 수 있습니다.

```c
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;

// 스레드 1
pthread_mutex_lock(&lock);
while (ready == 0) {
	pthread_cond_wait(&cond, &lock);
}
pthread_mutex_unlock(&lock);

// 스레드 2
pthread_mutex_lock(&lock);
ready = 1; // while (ready == 0) 탈출
pthread_cond_signal(&cond);
pthread_mutex_unlock(&lock);
```


컨디션 변수 사용을 위해서는 이 컨디션 변수와 연결된 락이 ***반드시*** 존재해야 한다. 즉, 위에 두 함수 중 하나를 호출하기 위해서는 그 락을 가지고 있어야 한다.

첫 번째 루틴 `pthread_cond_wait()`는 호출 쓰레드를 수면 (sleep) 상태로 만들고 다른 쓰레드로부터의 시그널을 대기한다. 현재 수면 중인 쓰레드가 관심 있는 무언가가 변경되면 시그널을 보낸다. 

시그널 대기 함수에서는 락을 두 번째 인자로 받고 있지만, 시그널 보내기 함수에서는 조건만을 인자로 받는 것에 유의해야 한다. 이런 차이의 이유는 시그널 대기 함수는 호출 쓰레드를 재우는 것 외에 락도 반납 (release)해야 하기 때문이다.

`pthread_cond_wait()`는 깨어나서 리턴하기 직전에 락을 다시 획득한다. 처음 락을 획득한 때부터 마지막에 락을 반납할 때까지 `pthread_cond_wait()`를 실행한 쓰레드들은 항상 락을 획득한 상태로 실행된다는 것을 보장한다.

두 쓰레드 간에 시그널을 주고 받아야 할 때, 락과 컨디션 변수를 사용하는 대신 간단한 플래그를 사용하여 구현할 수도 있다.

```c
// 스레드 1
while (ready == 0); // spinlock

// 스레드 2
ready = 1;
```

이런 방법은 좋은 방법이 아니다. 조건 검사를 위해 오랫동안 반복문을 실행하여 검사하는 것은 효율적이지 못하다. 또 이렇게 코드를 작성하면 실수하기 매우 쉽다.

컨디션 변수가 아직 잘 이해가 되지 않아도, 이후 장에서 자세히 다룰 것이다.

## 5. 컴파일과 실행

`-pthread`플래그를 명령어 링크 옵션 부분에 추가하여 사용하여 `pthread` 라이브러리와 링크할 수 있도록 명시해야 한다.

```sh
prompt> gcc −o main main.c −Wall −pthread
```
