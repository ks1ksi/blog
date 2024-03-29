---
author: Seungil Kim
description: ""
featured: false
postSlug: OSTEP 18 Introduction to Paging
pubDatetime: 2023-08-01T10:29:17.000Z
tags:
  - cs
  - os
title: OSTEP 18 Introduction to Paging
---
# OSTEP 18 Introduction to Paging

운영체제는 거의 모든 공간 관리 문제를 해결할 때 두 가지 중 하나를 사용한다.
첫 번째는 가상 메모리의 세그멘테이션 처럼 *가변 크기의 조각들*로 분할하는 것이다. 이 해결책은 태생적 문제인 **단편화**를 가지고 있다.
두 번째 방법은 공간을 *동일 크기의 조각들*으로 분할하는 것이다. 가상 메모리에서 이를 **페이징(paging)** 이라고 부른다.

프로세스의 주소 공간을 몇 개의 가변 크기 논리 세그먼트 (코드, 힙, 스택) 으로 나누는 것이 아니라 고정 크기의 단위로 나눈다. 이 고정 크기 단위를 **페이지(page)** 라고 부른다.
이에 상응하여 물리 메모리도 **페이지 프레임(page frame)** 이라고 불리는 고정 크기 슬롯 배열이라고 생각한다. 이 프레임 각각은 하나의 가상 메모리 페이지를 저장할 수 있다.

> 페이지를 사용하여 어떻게 메모리를 가상화할 수 있을까?
> 세그멘테이션의 문제점을 해결하면서 공간과 시간 오버헤드를 최소로 해보자.


## 1. 간단한 예제 및 개요

총 크기가 64바이트이고, 4개의 16바이트 페이지로 구성된 작은 주소 공간을 상상해보자. 

![[OSTEP 18 Introduction to Paging-1690876518081.jpeg]]

물리 메모리는 8개의 페이지 프레임을 가지고 있는 128 바이트라고 가정해보자.

![[OSTEP 18 Introduction to Paging-1690876562630.jpeg]]

이렇게 가상 주소 공간의 페이지들은 물리 메모리 전체에 분산 배치되어 있다. 또, 운영체제가 자신을 위해 물리 메모리의 페이지 프레임을 사용할 수 있다.

**페이징**은 이전 방식에 비해 많은 장점을 가지고 있다. 프로세스의 주소 공간 사용 방식과는 상관 없이 유연하고 효율적으로 주소 공간 개념을 지원할 수 잇다. 힙과 스택이 어디로 커지는지, 어떻게 사용되는지 알 필요가 없다.

또 다른 장점은 빈 공간 관리의 단순함이다. 예를 들어 64바이트 주소 공간을 8페이지 물리 메모리에 배치하기를 원한다면, 비어 있는 4개의 페이지만 찾으면 된다. 아마 운영체제는 이를 위해 모든 비어 있는 페이지의 **빈 공간 리스트**를 유지하고 리스트의 첫 네 개 페이지를 선택할 것이다.

주소 공간의 각 가상 페이지에 대한 물리 메모리 위치 기록을 위해, 운영체제는 *프로세스*마다 **페이지 테이블** 이라는 자료 구조를 유지한다. 페이지 테이블의 주요 역할은 주소 공간의 가상 페이지 주소 변환 정보를 저장하는 것이다. 

64바이트 주소 공간을 가진 프로세스가 다음 메모리 접근을 수행한다고 가정하자

``` asm
movl <virtual address>, %eax
```

주소 `<virtual address>`의 데이터를 `eax` 레지스터에 탑재하는 데 집중하자. 프로세스가 생성한 가상 주소의 변환을 위해 먼저 *가상 주소*를 **가상 페이지 번호(virtual page number, VPN)** 와 페이지 내의 **오프셋** 두 개의 구성 요소로 분할한다. 

이 예시에서는 가상 주소 공간의 크기가 64바이트이기 때문에 가상 주소는 6개의 비트가 필요하다. $2^6 = 64$ 

![[OSTEP 18 Introduction to Paging-1690878110052.jpeg]]

Va5는 가상 주소의 최상위 비트이며, Va0은 가상 주소의 최하위 비트이다. 페이지 크기가 16바이트 이기 때문에, 다음과 같이 나눌 수 있다. 64바이트 주소 공간에서 16바이트 페이지 4개 중 1개를 선택해야 하기 때문에 우리는 **2비트 가상 페이지 번호 (VPN)** 이 필요하다. 나머지 비트는 페이지 내에서 우리가 원하는 바이트의 위치를 나타낸다. 이것을 오프셋이라고 부른다.

``` asm
movl 21, %eax
```

가상 주소 21을 이진 형식으로 변환하면 010101이고, 이를 가상 페이지 번호와 오프셋으로 나눈다.

![[OSTEP 18 Introduction to Paging-1690878278570.jpeg]]

가상 주소 21은 가상 페이지 01번의 0101번째 바이트가 된다.

이 가상 페이지 번호를 가지고 실제 물리 프레임 어디에 저장되어 있는지 찾을 수 있다.

![[OSTEP 18 Introduction to Paging-1691519804168.jpeg]]

오프셋은 동일하고, 가상 주소 01을 물리 주소 111로 변환했다.

> 물리 프레임 번호: (physical frame number, PFN)
> 물리 페이지 번호: (physical page number, PPN)

## 2. 페이지 테이블은 어디에 저장되는가

페이지 테이블은 매우 커질 수 있다. 4KB 크기의 페이지를 가지는 전형적인 32비트 주소 공간을 생각해 보자. 이 가상 주소는 20비트의 VPN과 12비트의 오프셋으로 구성된다. $2^{12}=4096$

20비트 VPN은 운영체제가 각 프로세스를 위해 관리해야 하는 변환의 개수가 $2^{20}$개 라는 것을 의미한다. 물리 주소로의 변환 정보와 다른 필요한 정보를 저장하기 위하여 페이지 테이블 항목(page table entry, PTE)마다 4바이트가 필요하다고 가정하면, 각 페이지 테이블을 저장하기 위해 프로세스마다 4MB의 메모리가 필요하게 된다. 프로세스 100개가 실행중이라면 400MB의 메모리가 필요할 것이다.

페이지 테이블이 매우 크기 때문에 현재 실행 중인 프로세스의 페이지 테이블을 MMU가 아닌 메모리에 저장할 것이다. 
당분간 운영체제가 관리하는 물리 메모리에 페이지 테이블이 상주한다고 가정하자. 페이지 테이블은 가상 메모리에 저장될 수 있고 디스크에 스왑될 수도 있지만 복잡하니까 일단 무시하자. 
운영체제 메모리 영역 (PFN 0)에 페이지 테이블이 존재한다고 하자.

![[OSTEP 18 Introduction to Paging-1690879405984.jpeg]]

## 3. 페이지 테이블에는 실제로 무엇이 있는가

페이지 테이블은 가상 주소를 물리 주소로 매핑하는데 사용되는 자료 구조이다. 가장 간단한 형태는 선형 페이지 테이블(linear page table)이다. 단순한 배열이다. 
운영체제는 원하는 물리 프레임 번호(PFN)를 찾기 위하여 가상 페이지 번호(VPN)로 배열의 항목에 접근하고, 그 항목의 페이지 테이블 항목(PTE)을 검색한다.

각 PTE에는 여러 비트가 존재한다. 

![[OSTEP 18 Introduction to Paging-1690879517425.jpeg]]

Valid bit은 특정 변환의 유효 여부를 나타내는 역할을 한다. 프로그램이 실행을 시작할 때 할당되지 않은 주소 공간이 무효로 표시되며, 프로세스가 이 무효 메모리를 접근하려고 하면 운영체제에 트랩을 발생시킨다.

Protection bit은 페이지가 읽을 수 있는지, 쓸 수 있는지, 또는 실행될 수 있는지를 표시하는 역할을 한다. Protection bit가 허용하지 않는 방식으로 페이지에 접근하려고 하면 운영체제에 트랩을 생성한다.

Present bit은 이 페이지가 물리 메모리에 있는지 혹은 디스크에 있는지(즉, 스왑 아웃되었는지)를 가리키는 역할을 한다.

Dirty bit은 메모리에 반입된 후 페이지가 변경되었는지 여부를 나타내는 역할을 한다.

Reference bit(또는 Accessed bit)는 페이지가 접근되었는지를 추적하기 위해 사용되는 역할을 한다. 이 비트는 어떤 페이지가 인기가 있는지 결정하여 메모리에 유지되어야 하는 페이지를 결정하는 데에도 유용하다. 나중에 페이지 교체 장에서 자세히 다룬다.

Read/Write bit은 이 페이지에 쓰기가 허용되는지를 결정하는 역할을 한다.

User/Supervisor bit은 사용자 모드 프로세스가 페이지에 액세스 할 수 있는지를 결정하는 역할을 한다.

PWT, PCD, PAT, G 비트는 이 페이지에 대한 하드웨어 캐시의 동작을 결정하는 역할을 한다.

## 4. 페이징: 너무 느림

페이징은 느리다. 가상 주소를 물리 주소로 변환하는데 오래 걸린다.

1. 프로세스의 페이지 테이블을 살펴 본다
2. 페이지 테이블의 정보를 통해 주소를 변환한다
3. 실제 메모리에서 데이터를 가져온다

하드웨어는 현재 실행중인 프로세스에 대한 page table 위치를 알아야 한다. 

```c
// 가상 주소에서 vpn만 추출한다.
VPN = (VirtualAddress & VPN_MASK) >> SHIFT

// Page table 주소에 vpn 값으로 현재 접근하는 프로세스의 PTE 찾는다.
PTEAddr = PageTableBaseRegister + (VPN * sizeof(PTE))

// 가상 주소에서 offset만 추출한다.
offset = VirtualAddress & OFFSET_MASK

// offset과 PFN 값으로 실제 메모리 주소를 얻는다.
PhysAddr = (PFN << SHIFT) | offset
```

이러한 순서로 실제 메모리 주소를 얻는데 굉장히 복잡하다.
모든 메모리 참조에 대해 먼저 페이지 테이블에서 변환 정보를 반입해야 하기 때문에 반드시 한 번의 추가적인 메모리 참조가 필요하고, 이는 프로세스를 2배 이상 느려지게 한다.

![[OSTEP 18 Introduction to Paging-1690880418810.jpeg]]

## 5. 메모리 트레이스

간단한 메모리 액세스 예시를 통해 페이징을 사용했을 때 발생하는 모든 메모리 접근을 살펴보자.

```c
int array[1000];
for (i = 0; i < 1000; i++) {
    array[i] = 0;
}
```

```shell
gcc -o array array.c -Wall -O
./array
```

```asm
1 0x1024 movl $0x0, (%edi,%eax,4)
2 0x1028 incl %eax
3 0x102c cmpl $0x03e8,%eax
4 0x1030 jne 0x1024

```

1. `0x1024 movl $0x0, (%edi,%eax,4)`: 이 명령은 0x0 (즉, 0)을 메모리 위치 (%edi,%eax,4)로 이동시키라는 명령입니다. 여기서 (%edi,%eax,4)는 주소 계산 방식을 나타내는데, 이는 edi 레지스터의 값과 eax 레지스터의 값에 4를 곱한 것을 더한 위치를 가리킵니다. 이 경우, 이것은 배열의 i번째 위치를 가리키는 포인터라고 볼 수 있습니다.

2. `0x1028 incl %eax`: 이 명령은 eax 레지스터의 값을 1 증가시키는 명령입니다. 이 명령은 for 루프에서 i를 증가시키는 것과 같은 역할을 합니다.

3. `0x102c cmpl $0x03e8,%eax`: 이 명령은 eax 레지스터의 값과 0x03e8 (즉, 1000)을 비교하는 명령입니다. 이 명령은 for 루프의 종료 조건 (즉, i < 1000)과 동일합니다.

4. `0x1030 jne 0x1024`: 이 명령은 "jump if not equal"의 줄임말로, 만약 eax 레지스터의 값과 1000이 같지 않다면 (즉, i가 1000보다 작다면) 주소 0x1024 (즉, 첫 번째 명령어)로 점프하라는 명령입니다. 이것은 for 루프의 내용을 반복하기 위한 것입니다. 만약 i가 1000이라면, 이 명령은 점프하지 않고 계속 진행하여 루프를 종료합니다.

이 예시를 직접 수행해보자.

프로세스의 가상 주소는 64KB이고 page 크기는 1KB라고 가정하자. 수행하기 위해 알아야 하는 것은 page table의 내용과 실제 메모리의 주소이다. 
VPN 1페이지에 코드에 대한 정보가 있고, 이것은 PFN 4로 연결된다고 가정한다. array 의 VPN은 39, 40, 41, 42이고 각각의 PFN은 7, 8, 9, 10이다.

![[OSTEP 18 Introduction to Paging-1691519842728.jpeg]]

코드가 실행될 때 명령어 fetch는 두 개의 메모리 참조를 생성한다.
1. page table에 대한 메모리 참조
2. 명령어에 대한 참조

5번의 반복 메모리 접근을 나타낸 그림이다. 한 번의 반복을 위해 10번의 메모리 접근이 발생하는 것이다. 이를 최적화하는 방법은 없을까?

