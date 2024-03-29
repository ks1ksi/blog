---
author: Seungil Kim
description: 디스크의 상세한 동작을 이해해보자
featured: false
postSlug: OSTEP 37 Hard Disk Drives
pubDatetime: 2023-10-10T03:59:01+09:00
tags:
  - os
  - cs
title: OSTEP 37 Hard Disk Drives
---
# OSTEP 37 Hard Disk Drives

파일 시스템 기술은 거의 대부분 하드 디스크 드라이브의 동작에 기반을 두고 개발되었다. 디스크를 관리하는 파일 시스템 소프트웨어를 구현하기 전에 디스크의 상세한 동작을 이해하는 것이 중요하다.

> 디스크에 데이터를 어떻게 저장하고 접근하는가?

## Table of Contents

## 1. 인터페이스

우선 현대 디스크 드라이브의 인터페이스부터 이해해보자. 모든 현대 드라이브의 기본적인 인터페이스는 단순하다. 드라이브는 읽고 쓸 수 있는 매우 많은 수의 섹터 (512 byte 블럭)들로 이루어져 있다. 디스크 위의 $n$개의 섹터들은 $0$부터 $n-1$까지의 이름이 붙어 있다. 그렇기 때문에 디스크를 섹터들의 배열로 볼 수 있고, $0$부터 $n-1$이 드라이브의 **주소 공간**이 된다. 

멀티 섹터 작업도 가능하다. 사실 많은 파일 시스템들이 한 번에 4KB 또는 그 이상을 읽거나 쓴다. 하지만 드라이브 제조사는 하나의 512 byte 쓰기만 *원자적*이라고 보장한다. 

디스크 드라이브 사용자들은 몇 가지 가정을 한다. 인터페이스에 명시되어 있지는 않다. (계약 불문율)

1. 드라이브의 주소 공간에서 가깝게 배치되어 있는 두 개의 블럭을 접근하는 것은, 멀리 떨어져 있는 두 개의 블럭을 접근하는 것보다 빠르다고 가정한다. 
2. 연속적인 청크의 블럭을 접근하는 것 (순차 접근) 이 가장 빠르다. 어떤 랜덤 접근 패턴보다도 매우 빠르다.

## 2. 기본 구조

원형의 딱딱한 표면을 가지고 있는 **플래터(platter)** 에, 자기적 성질을 변형하여 데이터를 지속시킨다. 디스크는 하나 또는 그 이상의 플래터를 갖고 있으며, 각각은 2개의 표면을 갖고 있다. 이런 플래터는 대체적으로 단단한 알루미늄같은 물질로 만들어지며, **드라이브의 전원이 나가더라도 비트를 드라이브에 영구적으로 저장**하기 위해 **얇은 자성 층**이 입혀져 있다.

플래터들은 **회전축(spindle)** 이라는 것으로 고정되어 있다. 모터에 연결되어 있어 플래터를 일정한 속도로 회전시킨다. 회전 속도는 7200RPM ~ 15000RPM 정도이다. 만약 10000RPM의 속도로 드라이브가 회전한다면, 드라이브가 한 바퀴 회전하는 데 걸리는 시간은 6ms이다.

각 표면에 동심원을 따라 배치되어 있는 **섹터(sector)** 들 위에 데이터가 부호화된다. 이 때 동심원 하나를 **트랙(track)** 이라고 한다. 표면에는 수많은 트랙들이 서로 촘촘하게 붙어 있다. 수백 개의 트랙들이 모여야 사람의 머리카락 두께 정도가 된다.

표면 위를 읽거나 쓸 때에는 디스크의 자기적 패턴을 감지하거나 (읽거나) 변형을 유도하는 (쓰는) 기계적 장치가 필요하다. 읽기와 쓰기 동작은 **디스크 헤드(disk head)** 라는 것을 통해 할 수 있으며 각 표면마다 그런 헤드가 하나씩 존재한다. 디스크 헤드는 **디스크 암(disk arm)** 에 연결이 되어 있으며 이것을 통해서 헤드가 원하는 트랙 위에 위치하도록 이동시킬 수 있다.

## 3. 간단한 디스크 드라이브

디스크가 어떻게 동작하는지 이해하기 위해 한 트랙씩 모형을 만들어 보자.

![[OSTEP 37 Hard Disk Drives-1696879418338.jpeg]]

이 트랙에는 12개의 섹터가 있고 각 섹터는 512바이트의 크기를 갖고 있으며 주소 영역은 0부터 11까지로 이루어져 있다. 

![[OSTEP 37 Hard Disk Drives-1696879480625.jpeg]]

이렇게 디스크 헤드를를 붙여서 섹터에 무엇인가를 읽거나 쓸 수 있다.

### 단일 트랙 지연 시간: 회전 지연

트랙이 하나 뿐인 이 간단한 디스크에서 요청이 어떻게 처리될까? 디스크가 돌아서 디스크 헤드 아래에 원하는 섹터가 위치하기를 기다리면 된다.

이런 기다림은 **회전 지연(rotation delay)** 이라고 불린다.

### 멀티 트랙: 탐색 시간

현대 디스크들은 수백만 개의 트랙을 가지고 있다.

![[OSTEP 37 Hard Disk Drives-1696880050395.jpeg]]

이 그림에서 헤드는 가장 안쪽의 트랙에 위치하고 있다. 드라이브가 지정된 섹터들을 접근하는 방식을 이해해보자. 만약 섹터 11번처럼 멀리 떨어져 있는 섹터에 대한 요청을 받으면 어떻게 할까?

이 읽기 요청을 처리하기 위해, 드라이브는 디스크 암을 먼저 올바른 트랙 위에 위치시킨다. 이 과정을 **탐색(seek)** 이라고 한다. 회전과 더불어 탐색은 가장 비싼 디스크 동작 중 하나이다.

탐색은 여러 단계로 이루어져 있다.

1. 가속: 디스크 암이 움직이기 시작한다.
2. 활주: 디스크 암이 최고 속도로 움직인다.
3. 감속: 디스크 암의 속도가 줄어든다.
4. 안정화: 정확한 트랙 위에 헤드가 위치한다.

안정화 시간은 매우 중요하며 0.5~2ms 정도로 오래 걸린다.

탐색 과정에서 디스크 암이 원하는 트랙 위로 이동하는 동안, 플래터 역시 회전한다. 이 경우 3개의 섹터만큼 이동하였다. 섹터 9번이 디스크 헤드 아래로 지나가고 있다. 약간의 회전 지연 후 11번 섹터를 찾아 전송을 완료할 수 있게 될 것이다.

섹터 11번이 디스크 헤드를 지나가게 되면, I/O의 마지막 단계인 **전송**이 이루어져, 표면 위의 데이터를 읽거나 쓰게 된다. 이제 I/O 시간은 탐색과 회전 지연 동안 기다린 후 전송한다는 전체 윤곽이 그려졌다.

### 그 외 세부 사항

많은 드라이브는 **트랙 비틀림(track skew)** 이라 불리는 기술을 사용해서 트랙의 경계를 지나 순차적으로 존해는 섹터들을 올바르게 읽을 수 있도록 한다.

![[OSTEP 37 Hard Disk Drives-1696880165840.jpeg]]

연속적인 트랙에서 데이터를 읽거나 쓸 때, 헤드가 한 트랙에서 다음 트랙으로 이동하는 시간을 고려하여, 다음 트랙의 시작 섹터를 해당 딜레이만큼 "skew"한다. 여기서는 2개 뒤로 skew 되어 있다.

이런 skew가 없다면 헤드가 다음 트랙으로 넘어갔을 때 다음에 읽어야 하는 블럭이 이미 헤드를 지나쳤을 수도 있어 거의 한 바퀴에 해당하는 회전 지연을 감수해야 한다.

또, 바깥 측에 공간이 더 많다는 구조적 이유 때문에, 바깥 트랙들에는 안쪽 트랙들보다 더 많은 섹터가 존재한다. 이를 multi zoned 디스크 드라이브 라고 부른다.

마지막으로, 디스크 드라이브에 **캐시(트랙 버퍼)** 가 존재한다. 디스크에서 하나의 섹터를 읽을 때 드라이브가 그 트랙 위의 모든 섹터를 다 읽어서 캐시에 저장할 수 있다. 

쓰기의 경우, 메모리에 데이터가 기록된 시점에 쓰기가 완료되었다고 할지, 디스크에 실제로 기록되었을 때 완료가 되었다고 할지를 정할 수 있다. 전자는 **write-back**, 후자는 **write-through** 라고 부른다.

write-back 캐싱을 사용할 경우 드라이버가 더 빠른 것 처럼 보이지만 정합성에 문제가 생길 수도 있다.

## 4. I/O 시간 계산

간단한 분석으로 디스크의 성능을 구할 수 있다.

세 개의 항으로 이루어진 다음 식으로, **I/O 시간**을 나타낼 수 있다.

$$T_{I/O} = T_{seek} + T_{rotation} + T_{transfer}$$

**I/O의 속도**는 다음의 식과 같이 간단하게 나타낼 수 있다.

$$R_{I/O} = \frac{Size_{Transfer}}{T_{I/O}}$$

두 개의 워크로드가 있다고 가정하자. 

하나는 **랜덤 워크로드**로 디스크에 4KB의 작은 읽기 요청을 발생시킨다. 랜덤 워크로드는 DBMS 등에서 흔하게 사용된다.

다른 하나는 **순차 워크로드**로서 헤드의 이동 없이 디스크에 연속되어 있는 여러개의 섹터를 단순히 읽는 것이다. 순차 접근 패턴 역시 흔하기 때문에 마찬가지로 중요한 워크로드이다.

![[OSTEP 37 Hard Disk Drives-1696882282416.jpeg]]

하나는 고성능 드라이브, 빠르게 회전하도록 설계되어 있어 낮은 탐색 시간과 빠른 데이터 전송 속도를 가지고 있다.
다른 하나는 용량, 속도는 낮지만 주어진 공간에 가능한 많은 비트를 저장한다.

그림에 나타난 드라이브의 값들을 사용하여 앞에서 정리한 두 개의 워크로드가 얼마나 잘 동작하는지를 계산해 볼 수 있다. 먼저 랜덤 워크로드의 경우를 살펴보자. 랜덤한 디스크의 위치에서 4 KB씩 읽기가 발생한다고 했을 때 Cheetah에서 각 읽기가 얼마나 오래 걸릴지를 다음의 식처럼 계산할 수 있다.

$T_{seek} = 4ms$, $T_{rotation} = 2ms$, $T_{transfer} = 30 us$ 이고, 따라서 $T_{I/O}$는 약 $6ms$가 된다. (전송 시간 무시)

회전 시간은 RPM으로 쉽게 구할 수 있다. 한 바퀴 도는 데 $4ms$ 걸리고, 평균적으로 절반 정도 회전하기 때문에 $2ms$로 계산했다.

그러므로 $R_{I/O}$는 0.66 MB/s가 된다.

같은 방식으로 계산하면 Barracuda의 $T_{I/O}$는 약 $13.2ms$, $R_{I/O}$는 0.31 MB/s이다.

이제 순차 워크로드를 살펴보자. 아주 긴 시간의 전송 전에 한 번의 탐색과 회전이 있다고 가정해 보자. 논의하기 쉽도록 전송할 데이터의 크기는 100 MB라고 하자. 그러면 Barracuda와 Cheetah의 $T_{I/O}$는 각각 $800 ms$와 $950 ms$가 된다. I/O의 속도는 드라이브의 최고 전송 속도인 125 MB/s와 105 MB/s와 거의 비슷하게 된다. 

![[OSTEP 37 Hard Disk Drives-1696882925270.jpeg]]

이 그림은 몇 가지 중요한 사실을 알려준다. 첫 번째 가장 중요한 사실은 랜덤 워크로드와 순차 워크로드의 드라이브 간 성능 차이가 크다는 것이다. Cheetah의 경우에는 거의 200배 이상 차이 나고, Barracuda의 경우 300배 이상 차이가 난다. 이렇게 컴퓨터 역사 상 가장 분명한 디자인 팁에 이르게 된다.

두 번째는 좀 더 미묘한데 “성능” 위주의 드라이브와 저사양의 “용량” 위주의 드라이브 간의 성능 차이가 상당히 크다는 것이다. 이러한 이유로 (또한 다른 이유로) 전자를 위해서는 비싼 돈을 들이는 데 주저하지 않으면서도 후자를 구하기 위해서는 가능한 싸게 사려고 한다.

## 5. 디스크 스케줄링

I/O의 비용이 크기 때문에 역사적으로 운영체제는 디스크에게 요청되는 I/O의 순서를 결정하는 데 중요한 역할을 했다. 

**디스크 스케줄러**는 요청을 보고 다음에 어떤 I/O를 처리할지 결정하였다.

각 작업의 길이가 얼마나 될지 알 수 없는 작업 스케줄링과는 다르게, 디스크 스케줄링의 경우 요청 작업이 얼마나 걸릴지를 꽤 정확하게 예측할 수 있다. 따라서 greedy하게 처리할 수 있는 가장 빠른 요청을 선택할 수 있다.

즉 디스크 스케줄러는 **SJF(shortest job first)** 원칙을 따르려고 노력한다.
기억이 잘 나지 않으면 [[OSTEP 07 CPU Scheduling]] 파트를 다시 읽어보자.

### 최단 탐색 시간 우선(Shortest-seek-time-first, SSTF)

초기에는 이 방법을 사용했다. 트랙을 기준으로 I/O 요청 큐를 정렬하여 가장 가까운 트랙의 요청이 우선 처리되도록 하였다. 예를 들어, 현재 헤드가 안쪽 트랙에 위치해 있고, 가운데 트랙의 섹터와 바깥 트랙의 섹터에 대한 요척을 받으면, 가운데 트랙의 요청을 먼저 처리하고, 완료된 후 바깥 트랙의 요청을 처리한다.

하지만 SSTF가 만능은 아니다. 드라이브의 구조는 호스트 OS에게 공개되어 있지 않고, 운영체제는 그저 블럭들의 배열로만 인식한다. 때문에 가장 가까운 블럭 우선(Nearest-block-first, NBF) 방식을 사용하면 된다.

더 큰 문제는 기아 현상이다. 계속 안쪽 트랙에만 지속적으로 요청이 발생되면, 바깥 트랙은 읽을 수 없게 된다.
기아 현상을 해결해보자.
### Elevator (a.k.a. SCAN or C-SCAN)

SCAN이라고 불렸던 이 알고리즘은 트랙의 순서에 따라 디스크를 앞뒤로 가로지르며 요청을 서비스한다. 디스크를 한 번 가로지르는 것을 sweep 이라고 부르자. 따라서 어떤 요청이 이번 스위프에 이미 지나간 트랙에 대해 들어온다면, 다음 번 스위프에 처리되도록 큐에서 대기한다.

![[OSTEP 37 Hard Disk Drives-1696884828781.jpeg]]

F-SCAN은 스위프하는 동안 큐를 동결시켜 멀리 떨어져 있는 요청에 대한 기아 현상을 없애는 방법이다.

![[OSTEP 37 Hard Disk Drives-1696885005945.jpeg]]

C-SCAN(Circular SCAN) 알고리즘은 디스크를 가로질러 양방향으로 스위핑하는 대신에 외부에서 내부로만 스위핑한 다음 외부 트랙에서 재설정하여 다시 시작한다.

![[OSTEP 37 Hard Disk Drives-1696884834206.jpeg]]

***이 기법들은 회전을 무시한다.*** 따라서 최적은 아니다.
### 최단 위치 잡기 우선(shortest positioning time first) - SPTF

최단 접근 시간 우선(shortest access time first) 이라고도 불리는 기법이다. 어떤 섹터로 접근하는게 가장 빠를까?

![[OSTEP 37 Hard Disk Drives-1696885123195.jpeg]]

헤드가 섹터 30번에 위치해 있는데, 스케줄러는 다음 요청을 처리하기 위해 8번 섹터로 가야할까 아니면 16번 섹터로 가야할까? 정답은 **상황에 따라 다르다**.

여기서 상황에 의존적인 이유는 **탐색에 걸리는 시간과 회전에 걸리는 시간이 다르기 때문이다.**

때문에 SPTF가 성능을 개선시킬 수 있다. 하지만 트랙의 경계가 어디인지, 현재 디스크 헤드가 어디인지(회전의 관점에서)를 정확히 할 수 없기 때문에 운영체제에서 이를 구현하기는 어렵고, 드라이브 내부에서 실행된다.

### 다른 쟁점들

> 디스크 스케줄링은 현대 시스템에서 어느 부분이 담당해야 하는가?

예전에는 운영체제가 모든 것을 결정하였다. 

현대 시스템에서, 디스크는 대기 중인 여러 개의 요청들을 수용할 수 있으며 복잡한 내부 스케줄러를 자체적으로 가지고 있다. 이 스케줄러는 디스크 컨트롤러 내부에 있기 때문에 헤드의 정확한 위치도 알 수 있을 뿐만 아니라 그 외의 필요한 정보들도 알 수 있다. 그래서 **SPTF** 방식을 정밀하게 구현할 수 있다.

디스크 스케줄러가 수행하는 또 다른 중요한 작업은 **I/O 병합**이다. 33번, 8번, 34번을 읽는 연속된 요청이 있을 때, 33번과 34번을 읽는 요청을 병합하여 두 블럭 길이의 요청으로 만든다. 디스크로 내려보내는 요청의 개수를 줄여 오버헤드를 줄일 수 있다. 

**병합을 위해 얼마나 기다려야 하는가**도 고민해볼 문제 중 하나이다.

## 6. 요약

전자공학과 재료공학과 화이팅~
