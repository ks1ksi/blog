---
author: Seungil Kim
description: ""
featured: false
postSlug: OSTEP 08 Multi-level Feedback Queue, MLFQ
pubDatetime: 2023-07-02T12:01:40.000Z
tags:
  - cs
  - os
title: OSTEP 08 Multi-level Feedback Queue, MLFQ
---
# OSTEP 08 Multi-level Feedback Queue, MLFQ

## Introduction

MLFQ가 해결하고자 하는 문제는 두 가지이다.

1. 짧은 작업을 먼저 실행시켜 **반환 시간**을 최적화하고자 한다.
2. 대화형 사용자에게 응답이 빠른 시스템이라는 느낌을 주도록 **응답 시간**을 최적화하고자 한다.

어떻게 하면 작업의 실행 시간에 대한 선행 정보 없이 응답 시간과 반환 시간을 동시에 최소화할 수 있을까?

## 1. MLFQ: 기본 규칙

MLFQ는 여러 개의 큐로 구성되며, 각 큐에는 다른 우선순위가 부여된다. 실행 준비가 된 프로세스는 이 중 하나의 큐에 존재하며, MLFQ는 실행할 프로세스를 결정하기 위해 우선순위를 사용한다. 같은 우선순위를 가진 작업들 사이에서는 라운드 로빈 스케줄링 알고리즘이 사용된다.

MLFQ의 두 가지 기본 규칙은 다음과 같다:

- 규칙 1: Priority(A) > Priority(B) 이면, A가 실행된다 (B는 실행되지 않는다).
- 규칙 2: Priority(A) = Priority(B) 이면, A와 B는 **RR 방식**으로 실행된다.

![[OSTEP 08 Multi-level Feedback Queue, MLFQ-1687808739461.jpeg]]

## 2. 시도 1: 우선순위의 변경

MLFQ는 작업의 우선순위를 동적으로 변경한다. 작업이 키보드 입력을 기다리며 반복적으로 CPU를 양보하면 MLFQ는 해당 작업의 우선순위를 높게 유지한다. 반면에 작업이 긴 시간 동안 CPU를 집중적으로 사용하면 MLFQ는 해당 작업의 우선순위를 낮춘다.

우선순위 변경에 대한 추가 규칙은 다음과 같다:

- 규칙 3: **작업이 시스템에 진입하면, 가장 높은 우선순위**, 즉 맨 위의 큐에 놓여진다.
- 규칙 4a: **주어진 타임 슬라이스를 모두 사용하면 우선순위는 낮아진다**. 즉, 한 단계 아래 큐로 이동한다.
- 규칙 4b: **타임 슬라이스를 소진하기 전에 CPU를 양도하면 같은 우선순위를 유지**한다.

### 예시 1: 한 개의 긴 실행 시간을 가진 작업

![[OSTEP 08 Multi-level Feedback Queue, MLFQ-1687808781509.jpeg]]

긴 실행 시간을 가진 작업이 도착했을 때, 작업은 최고 우선순위로 진입한다. 타임 슬라이스가 지나면 스케줄러는 작업의 우선순위를 한 단계 낮추어 해당 작업을 아래 큐로 이동시킨다. 이 과정이 반복되어 작업은 결국 가장 낮은 우선순위를 가지게 된다.

### 예시 2: 짧은 작업과 함께

![[OSTEP 08 Multi-level Feedback Queue, MLFQ-1687808800094.jpeg]]

2개의 작업이 존재하는 경우를 가정해보자. A는 오래 실행되는 CPU 위주 작업이고 B는 짧은 대화형 작업이다. A는 이미 실행 중이고 B는 이제 도착했다고 가정하면, B는 높은 우선순위를 부여받아 빨리 실행되고 바로 종료된다. 이후에 A는 낮은 우선순위에서 실행을 재개한다.

### 예시 3: 입출력 작업에 대해서는 어떻게?

![[OSTEP 08 Multi-level Feedback Queue, MLFQ-1687808844209.jpeg]]

입출력 작업을 수행하는 경우, **프로세스가 타임 슬라이스를 소진하기 전에 CPU를 양도하면 같은 우선순위를 유지하게 된다.** 이 규칙은 대화형 작업이 키보드나 마우스로부터 사용자 입력을 대기하며 자주 입출력을 수행하면 타임 슬라이스가 종료되기 전에 CPU를 양도하게 될 것이라는 점을 반영한 것이다. 이 경우, MLFQ는 해당 작업을 빠르게 실행시키기 위해 우선순위를 높게 유지한다.

### 현재 MLFQ의 문제점

1. 기아 상태가 발생할 수 있다. 시스템에 대화형 작업이 많이 존재하면, 그들이 모든 CPU 시간을 소모하고, 긴 실행 시간 작업은 CPU 시간을 할당받지 못하여 굶어 죽는다.
2. 스케줄러가 자신에게 유리하게 작동하도록 프로그램을 다시 작성할 수 있다. 타임 슬라이스가 끝나기 전에 아무 입출력 요청을 내려 CPU를 양도하도록 짠다면?
3. 프로그램이 시간 흐름에 따라 특성이 바뀔 수 있다. (CPU 위주 작업 -> 대화형 작업)

## 3. 시도 2: 우선순위 상향 조정

새로운 규칙은 다음과 같다.

규칙 5: 일정 기간 S가 지나면, 시스템의 모든 작업을 최상위 큐로 이동시킨다.

새 규칙은 두 가지 문제를 한 번에 해결한다. 

1. 프로세스는 굶지 않는다는 것을 보장받는다. 최상위 큐에 존재하는 동안 작업은 다른 높은 우선순위 작업들과 라운드 로빈 방식으로 CPU를 공유하게 되고 서비스를 받게 된다. 
2. CPU 위주의 작업이 대화형 작업으로 특성이 변할 경우 우선순위 상향을 통해 스케줄러가 변경된 특성에 적합한 스케줄링 방법을 적용한다.

## 4. 시도 3: 더 나은 시간 측정

스케줄러를 자신에게 유리하게 동작시키는 것을 어떻게 막을 수 있는가?
규칙 4를 재정의하자.

규칙 4: 주어진 단계에서 시간 할당량을 소진하면 (CPU를 몇 번 양도하였는지 상관없이), 우선순위는 낮아진다 (즉, 아래 단계의 큐로 이동한다).

![[OSTEP 08 Multi-level Feedback Queue, MLFQ-1687809290188.jpeg]]

방지책이 마련되면 프로세스의 입출력 행동과 무관하게 아래 단계 큐로 천천히 이동하게 되어 CPU를 자기 몫 이상으로 사용할 수 없게 된다.

## 5. MLFQ 조정과 다른 쟁점들

몇 개의 큐가 존재해야 하는가? 큐당 타임 슬라이스의 크기는 얼마로 해야 하는가? 기아를 피하고 변화된 행동을 반영하기 위하여 얼마나 자주 우선순위가 상향 조정되어야 하는가?

큐의 우선순위에 따라 타임 슬라이스의 크기를 다르게 설정한다.

![[OSTEP 08 Multi-level Feedback Queue, MLFQ-1687809532148.jpeg]]

Solaris의 MLFQ 구현 테이블의 기본 값

- 큐의 개수는 60
- 각 큐의 타임 슬라이스 크기는 가장 높은 우선순위 큐가 20ms 에서 가장 낮은 우선순위 큐가 수백ms 까지 천천히 증가
- 우선순위 상향 조정은 약 1초 마다 일어난다.

## 6. 요약

- 규칙 1 : 우선순위 (A)> 우선순위 (B) 일 경우, A가 실행, B는 실행되지 않는다. 
- 규칙 2 : 우선순위 (A) = 우선순위 (B), A와 B는 RR 방식으로 실행된다. 
- 규칙 3 : 작업이 시스템에 들어가면 최상위 큐에 배치된다. 
- 규칙 4 : 작업이 지정된 단계에서 배정받은 시간을 소진하면 (CPU를 포기한 횟수와 상관없이), 작업의 우선순위는 감소한다 (즉, 한 단계 아래 큐로 이동한다).
- 규칙 5 : 일정 주기 S가 지난 후, 시스템의 모든 작없을 최상위 큐로 이동시킨다.

[[OSTEP 교재]] 참고
