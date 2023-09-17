---
title: OSTEP 30 Condition Variables
author: Seungil Kim
description: 특정 조건이 참이 될 때까지 기다리기 위해 컨디션 변수(conditional variable)를 활용해보자
postSlug: OSTEP 30 Condition Variables
featured: false
tags:
  - os
  - cs
pubDatetime: 2023-09-18T01:17:29+09:00
---
# OSTEP 30 Condition Variables

우리가 배운 '락' 하나만 가지고는 제대로 병행 프로그램을 작성할 수 없다. 쓰레드가 계속 진행하기 전에 **특정 조건**이 만족되었는지 검사가 필요한 경우가 있다. 예를 들면 자식 쓰레드가 작업을 끝냈는지 여부를 알 필요가 있다. 이런 걸 어떻게 구현할 수 있을까?

```c
volatile int done = 0;

void *child(void *arg) {
	printf(“child\n ”);
	done = 1;
	return NULL;
}

int main(int argc, char *argv[]) {
	printf(“parent: begin\n ”);
	pthread_t c;
	Pthread_create(&c, NULL, child, NULL);
	while (done == 0)
	; // spin
	printf(“parent: end\n ”);
	return 0;
}
```
이렇게 공유 변수로 구현할 수 있다 하지만 부모 쓰레드가 `spin` 하면서 자원을 낭비하고 있다. 이 방법 대신 부모 쓰레드가 특정 조건이 만족될때까지 **잠자면서 기다리는 것**이 더 좋다.
## Table of Contents

## 1. 정의와 루틴들


