---
title: OSTEP 29 Locked Data Structures
author: Seungil Kim
description: 락 기반의 병행 자료 구조에 대해 알아보자
postSlug: OSTEP 29 Locked Data Structures
featured: false
tags:
  - cs
  - os
pubDatetime: 2023-09-11T11:30:05+09:00
---
# OSTEP 29 Locked Data Structures

흔하게 사용되는 자료 구조에서 락을 사용하는 방법을 살펴보자.
자료 구조에 락을 추가하여 쓰레드가 사용할 수 있도록 만들면 그 구조는 **thread safe**하다고 할 수 있다.

> 특정 자료 구조가 주어졌을 때, 어떤 방식으로 락을 추가해야 그 자료 구조가 정확하게 동작하게 만들 수 있을까? 더 나아가 자료 구조에 락을 추가하여 여러 쓰레드가 그 자료 구조를 동시 사용이 가능하도록 하면 (병행성) 고성능을 얻기 위해 무엇을 해야 할까?

## Table of Contents

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

$S$값이 낮다면 성능이 낮은 대신 전역 카운터의 값이 매우 정확해진다. $S$값이 높다면 성능은 탁월하지만 전역 카운터의 값은 CPU의 개수와 $S$의 곱만큼 뒤쳐지게 된다.

```c
typedef struct __counter_t {
	int global;
	pthread_mutex_t glock;
	int local[NUMCPUS];
	pthread_mutex_t llock[NUMCPUS]; 
	int threshold;
} counter_t;

void init(counter_t *c, int threshold) {
	c−>threshold = threshold;
	
	c−>global = 0;
	pthread_mutex_init(&c−>glock, NULL);
	
	int i;
	for (i = 0; i < NUMCPUS; i++) {
		c−>local[i] = 0;
		pthread_mutex_init(&c−>llock[i], NULL);
	}
}

void update(counter_t *c, int threadID, int amt) {
	pthread_mutex_lock(&c−>llock[threadID]);
	c−>local[threadID] += amt; 
	if (c−>local[threadID] >= c−>threshold) {
		pthread_mutex_lock(&c−>glock);
		c−>global += c−>local[threadID];
		pthread_mutex_unlock(&c−>glock);
		c−>local[threadID] = 0;
	}
	pthread_mutex_unlock(&c−>llock[threadID]);
}

int get(counter_t *c) {
	pthread_mutex_lock(&c−>glock);
	int val = c−>global;
	pthread_mutex_unlock(&c−>glock);
	return val;
}
```

## 2. 병행 연결 리스트

이제 조금 더 복잡한 구조인 연결 리스트를 다뤄보자. 간단하게 하기 위해 **병행 삽입 연산**만 살펴보도록 하자.

```c
typedef struct __node_t {
	int key;
	struct __node_t *next;
} node_t;

typedef struct __list_t {
	node_t *head;
	pthread_mutex_t lock;
} list_t;

void List_Init(list_t *L) {
	L−>head = NULL;
	pthread_mutex_init(&L−>lock, NULL);
}

int List_Insert(list_t *L, int key) {
	pthread_mutex_lock(&L−>lock);
	node_t *new = malloc(sizeof(node_t));
	if (new == NULL) {
		perror(“malloc ”);
		pthread_mutex_unlock(&L−>lock);
		return −1;
	}
	new−>key = key;
	new−>next = L−>head;
	L−>head = new;
	pthread_mutex_unlock(&L−>lock);
	return 0;
}

int List_Lookup(list_t *L, int key) {
	pthread_mutex_lock(&L−>lock);
	node_t *curr = L−>head;
	while (curr) {
		if (curr−>key == key) {
			pthread_mutex_unlock(&L−>lock);
			return 0;
		}
		curr = curr−>next;
	}
	pthread_mutex_unlock(&L−>lock);
	return −1;
}
```

삽인 연산을 시작하기 전에 락을 획득하고 리턴 직전에 해제한다. 매우 드문 경우지만 `malloc()`이 실패할 경우에 미묘한 문제가 생길 수 있다. 그런 경우 실패를 처리하기 전에 락을 해제해야 한다. 

삽입 연산이 병행하여 진행되는 상황에서 실패를 하더라도 락 해제를 호출하지 않으면서 삽입과 검색이 올바르게 동작하도록 수정할 수 있을까? 삽입 코드에서 임계 영역을 처리하는 부분만 락으로 감싸도록 코드 순서를 변경하고, 검색 코드의 종료는 검색과 삽입 모두 동일한 코드 패스를 사용토록 할 수 있다.

이 방법이 동작하는 이유는 **코드 일부는 사실 락이 필요 없기 때문**이다.

`malloc()` 자체가 thread safe하다면, 쓰레드는 언제든지 경쟁 조건과 다른 병행성 관련 버그를 걱정하지 않으면서 검색할 수 있다. 공유 리스트 갱신 때에만 락을 획득하면 된다.

### 확장성 있는 연결 리스트

병행이 가능한 연결 리스트를 갖게 되었지만, 확장성이 좋지 않다는 문제가 있다. 이를 해결해보자.

병행성을 개선하는 방법 중 하나로 hand-over-hand locking(또는 lock coupling) 이라는 기법을 개발했다.

개념은 단순하다. 전체 리스트에 하나의 락이 있는 것이 아니라 개별 노드마다 락을 추가하는 것이다. 리스트를 순회할 때 다음 노드의 락을 먼저 획득하고 지금 노드의 락을 해제하도록 한다.

```c
void List_Init(list_t *L) {
	L−>head = NULL;
	pthread_mutex_init(&L−>lock, NULL);
}

void List_Insert(list_t *L, int key) {
	// 동기화를 할 필요 없음
	node_t *new = malloc(sizeof(node_t));
	
	if (new == NULL) {
		perror(“malloc ”);
		return;
	}
	new−>key = key;

	// 임계 영역만 락으로 보호
	pthread_mutex_lock(&L−>lock);
	new−>next = L−>head;
	L−>head = new;
	pthread_mutex_unlock(&L−>lock);
}

int List_Lookup(list_t *L, int key) {
	int rv = −1;
	pthread_mutex_lock(&L−>lock);
	node_t *curr = L−>head;
	while (curr) {
		if (curr−>key == key) {
			rv = 0;
			break;
		}
		curr = curr−>next;
	}
	pthread_mutex_unlock(&L−>lock);
	return rv; // 성공 혹은 실패
}
```

리스트 연산에 병행성이 높아지기 때문에 괜찮은 것처럼 보인다. 하지만, 리스트를 순회할 때 **각 노드에 락을 획득하고 해제하는 오버헤드가 매우 크기 때문에 속도 개선을 기대하기 쉽지 않다.**

> 락 획득/해제와 같이 부하가 큰 연산을 추가하여 자료 구조를 설계했다면, 병행성 자체가 좋아졌다는 것은 큰 의미가 없다. 오히려, 부하가 큰 루틴은 거의 사용하지 않는 간단한 방법이 더 좋다. 락을 많이 추가하고 복잡도가 증가하면 큰 단점이 된다. 어느 것이 더 좋은지 알 수 있는 방법은 딱 한 가지이다. 간단하지만 병행성이 떨어지는 것과 복잡하지만 병행성이 높은 두 경우를 다 구현하고 성능을 측정해 보아야 한다. 성능을 속일 수는 없지 않는가. 결과는 “좋다”, “나쁘다” 둘 중에 하나일 테니까 말이다.

## 3. 병행 큐

```c
typedef struct _ _node_t {
	int value;
	struct __node_t *next;
} node_t;

typedef struct __queue_t {
	node_t *head;
	node_t *tail;
	pthread_mutex_t headLock;
	pthread_mutex_t tailLock;
} queue_t;

void Queue_Init(queue_t *q) {
	node_t *tmp = malloc(sizeof(node_t));
	tmp−>next = NULL;
	q−>head = q−>tail = tmp;
	pthread_mutex_init(&q−>headLock, NULL);
	pthread_mutex_init(&q−>tailLock, NULL);
}

void Queue_Enqueue(queue_t *q, int value) {
	node_t *tmp = malloc(sizeof(node_t));
	assert(tmp != NULL);
	tmp−>value = value;
	tmp−>next = NULL;
	
	pthread_mutex_lock(&q−>tailLock);
	q−>tail−>next = tmp;
	q−>tail = tmp;
	pthread_mutex_unlock(&q−>tailLock);
}

int Queue_Dequeue(queue_t *q, int *value) {
	pthread_mutex_lock(&q−>headLock);
	node_t *tmp = q−>head;
	node_t *newHead = tmp−>next;
	if (newHead == NULL) {
		pthread_mutex_unlock(&q−>headLock);
		return −1;
	}
	*value = newHead−>value;
	q−>head = newHead;
	pthread_mutex_unlock(&q−>headLock);
	free(tmp);
	return 0;
}
```

## 4. 병행 해시 테이블

전체 자료 구조에 하나의 락을 사용한 것이 아니라 해시 버켓 (리스트로 구현되어 있음) 마다 락을 사용하여서 성능이 우수하다.

```c
#define BUCKETS ()

typedef struct __hash_t {
	list_t lists[BUCKETS];
} hash_t;
 
void Hash_Init(hash_t *H) {
	int i;
	for (i = ; i < BUCKETS; i++) {
		List_Init(&H−>lists[i]);
	}
}

int Hash_Insert(hash_t *H, int key) {
	int bucket = key % BUCKETS;
	return List_Insert(&H−>lists[bucket], key);
}

int Hash_Lookup(hash_t *H, int key) {
	int bucket = key % BUCKETS;
	return List_Lookup(&H−>lists[bucket], key);
}
```

![[OSTEP 29 Locked Data Structures-1694421703747.jpeg]]
## 5. 요약
락 획득과 해제 시 코드의 흐름에 매우 주의를 기울여야 한다. 병행성 개선이 반드시 성능 개선으로 이어지는 것은 아니다. 성능 개선은 성능에 문제가 생길 경우에만 해결책을 강구해야 한다. 

락을 전혀 사용하지 않는 동기화 기법들도 추후에 다룰 것이다.
