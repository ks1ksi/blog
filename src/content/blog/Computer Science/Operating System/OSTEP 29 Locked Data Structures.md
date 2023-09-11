---
title: OSTEP 29 Locked Data Structures
author: Seungil Kim
description: 락 기반의 병행 자료 구조에 대해 알아보자
postSlug: OSTEP 29 Locked Data Structures
featured: false
tags: []
pubDatetime: 2023-09-11T11:30:05+09:00
---
# OSTEP 29 Locked Data Structures

흔하게 사용되는 자료 구조에서 락을 사용하는 방법을 살펴보자.
자료 구조에 락을 추가하여 쓰레드가 사용할 수 있도록 만들면 그 구조는 **thread safe**하다고 할 수 있다.

> 특정 자료 구조가 주어졌을 때, 어떤 방식으로 락을 추가해야 그 자료 구조가 정확하게 동작하게 만들 수 있을까? 더 나아가 자료 구조에 락을 추가하여 여러 쓰레드가 그 자료 구조를 동시 사용이 가능하도록 하면 (병행성) 고성능을 얻기 위해 무엇을 해야 할까?

## 1. 병행 카운터

카운터는 가장 간단한 자료 구조 중 하나이다. 병행이 불가능한 카운터를 먼저 보자.

```c
typedef struct _ _counter_t {
	int value;
} counter_t;

void init(counter_t *c) {
	c−>value = 0;
}

void increment(counter_t *c) {
	c−>value++;
}

void decrement(counter_t *c) {
c−>value−−;
}

int get(counter_t *c) {
	return c−>value;
}
```
### 간단하지만 확장성이 없음

위에서 정의한 카운터르 어떻게 하면 **thread safe**하게 만들 수 있을까?

```c
typedef struct _ _counter_t {
	int value;
	pthread_mutex_t lock;
} counter_t;

void init(counter_t *c) {
	c−>value = 0;
	Pthread_mutex_init(&c−>lock, NULL);
}
 
void increment(counter_t *c) {
	Pthread_mutex_lock(&c−>lock);
	c−>value++;
	Pthread_mutex_unlock(&c−>lock);
}

void decrement(counter_t *c) {
	Pthread_mutex_lock(&c−>lock);
	c−>value−−;
	Pthread_mutex_unlock(&c−>lock);
}

int get(counter_t *c) {
	Pthread_mutex_lock(&c−>lock);
	int rc = c−>value;
	Pthread_mutex_unlock(&c−>lock);
	return rc;
}
```

이 카운터는 가장 간단하고 기본적인 병행 자료 구조의 보편적인 디자인 패턴을 따른 것이다. 자료 구조를 조작하는 루틴을 호출할 때 **락을 추가**하였고, 그 호출문이 리턴될 때 **락이 해제**되도록 하였다.

이 방식은 **Monitor**를 사용하여 만든 자료 구조와 유사하다. 모니터 기법은 객체에 대한 메소드를 호출하고 리턴할 때 자동적으로 락을 획득하고 해제한다. 

이제 제대로 동작하는 병행 자료 구조를 가지게 되었지만, 성능이 문제다. 이번 장에서는 성능 최적화를 다룰 것이다. 

각 쓰레드가 특정 횟수만큼 공유 카운터를 증가시키는 벤치마크를 실행하였다. 

![[OSTEP 29 Locked Data Structures-1694400264405.jpeg]]

1개에서 4개의 쓰레드를 사용하여 카운터를 백만 번 증가시켰을 때 총 걸린 시간을 나타낸 것이다. **precise**라고 표시된 선에서 동기화된 카운터의 확장성이 떨어지는 것을 볼 수 있다. 

이상적으로는 하나의 쓰레드가 하나의 CPU에서 작업을 끝내는 것처럼 멀티프로세서에서 실행되는 쓰레드들도 빠르게 작업을 처리하고 싶을 것이다(완벽한 확장성: perfect scaling). 

### 확장성 있는 카운팅

확장 가능한 카운터가 없으면 Linux의 몇몇 작업은 멀티코어 기기에서 심각한 확장성 문제를 겪을 수 있다고 한다.

여러 기법 중 하나인 **엉성한 카운터(sloppy counter)** 를 소개한다.

엉성한 카운터는 하나의 논리적 카운터로 표현되는데, CPU 코어마다 존재하는 하나의 물리적인 지역 카운터와 하나의 전역 카운터로 구성되어 있다. 어떤 기기가 네 개의 CPU를 가지고 있다면 그 시스템은 네 개의 지역 카운터와 하나의 전역 카운터를 가지고 있는 것이다. 이 카운터들 외에도, 지역 카운터를 위한 락들과 전역 카운터를 위한 락이 존재한다.

기본 개념은 다음과 같다. 

쓰레드는 지역 카운터를 증가시킨다. 이 지역 카운터는 지역 락에 의해 보호된다. 각 CPU는 저마다 지역 카운터를 갖기 때문에 CPU들에 분산되어 있는 쓰레드들은 지역 카운터를 경쟁 없이 갱신할 수 있다. 그러므로 카운터 갱신은 확장성이 있다.

쓰레드가 카운터의 값을 읽을 수 있기 때문에 전역 카운터를 최신으로 갱신해야 한다. 최신 값으로 갱신하기 위해서 지역 카운터의 값은 주기적으로 전역 카운터로 전달되는데, 이때 전역 락을 사용하여 지역 카운터의 값을 전역 카운터의 값에 더하고, 그 지역 카운터의 값은 0으로 초기화한다.

지역에서 전역으로 값을 전달하는 빈도는 정해 놓은 $S$ 값에 의해서 결정된다. $S$의 값이 작을 수록 확장성 없는 카운터처럼 동작하고, 커질수록 전역 카운터의 값은 실제 값과 차이가 있게 된다.

![[OSTEP 29 Locked Data Structures-1694400794159.jpeg]]

이 예제에서는 한계치를 5로 설정했고, 4개의 CPU에 각각의 지역 카운터 $L_1$ ... $L_4$ 를 갱신하는 쓰레드들이 있다. 전역 카운터의 값 $G$도 나타내었다. 지역 카운터가 한계치 $S$에 도달하면 그 값은 전역 카운터에 반영되고 지역 카운터의 값은 초기화된다. 

![[OSTEP 29 Locked Data Structures-1694400927480.jpeg]]



