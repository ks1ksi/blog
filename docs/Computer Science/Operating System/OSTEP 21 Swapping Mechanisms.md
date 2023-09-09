---
title: "OSTEP 21 Swapping: Mechanisms"
date created: 화요일, 8월 8일 2023, 3:49:51 오후
date modified: 수요일, 8월 9일 2023, 12:30:08 오전
---
# OSTEP 21 Swapping: Mechanisms

지금까지는 가상 주소 공간이 비현실적으로 작아 모두 물리 메모리에 탑재가 가능하다고 가정했다. 즉, 실행 중인 프로세스의 전체 주소 공간이 메모리에 탑재된 것으로 가정했다. 이제 이 가정을 완화해보자.

다수 프로세스들의 큰 주소 공간을 지원하기 위해, 주소 공간 중 현재 필요하지 않는 일부를 보관해 둘 공간이 필요하다. 일반적으로 그 공간은 메모리 공간보다 용량은 크고, 속도는 느릴 것이다. HDD 혹은 SSD가 될 것이다.

> 운영체제는 어떻게 크고 느린 HDD, SSD를 사용하면서 마치 커다란 가상 주소 공간이 있는 것처럼 할 수 있을까?

주소 공간이 충분히 크면, 프로그램을 위한 충분한 메모리 공간이 있는지 걱정할 필요가 없다, 그냥 필요할 때 메모리 할당을 운영체제에게 요구하기만 하면 된다. 운영체제가 이런 가상 환경을 제공하면 프로그램 입장에서 매우 편해진다.

이와 반대로, 예전에는 메모리 오버레이라는 개념이 존재했다. 프로그래머가 코드 또는 데이터의 일부를 메모리에 수동으로 탑재하고 제거했다. 함수 호출이나 데이터에 접근할 때마다 코드 또는 데이터를 먼저 메모리에 탑재해야 하는 불편함이 있었다.

멀티프로그래밍 시스템, 즉 **동시에** 여러 프로그램들을 실행시키는 시스템이 발명되면서, 많은 프로세스들의 페이지를 물리 메모리에 전부 저장하는 것이 불가능하게 되었다. 실제 물리 메모리보다 더 많은 용량의 메모리가 필요하게 되었다. 현대 가상 메모리가 이를 어떻게 수행하는지 지금부터 알아보자. 

## 1. 스왑 공간

우선 디스크에 페이지들을 저장할 수 있는 일정 공간을 확보해야 한다. 이 용도의 공간을 **스왑 공간(swap space)** 이라고 한다. 메모리 페이지를 읽어서 이곳에 쓰고 *(swap out)*, 여기서 페이지를 읽어서 메모리에 탑재 *(swap in)* 시키기 때문이다. 스왑 공간의 입출력 단위는 페이지라고 가정한다. 운영체제는 스왑 공간에 있는 모든 페이지들의 **디스크 주소**를 기억해야 한다.

스왑 공간의 크기는 시스템이 사용할 수 있는 메모리 페이지의 최대 수를 결정하기 때문에 중요하다. 일단 스왑 공간의 크기는 매우 크다고 가정하자.

![[OSTEP 21 Swapping Mechanisms-1691479560583.jpeg]]

물리 메모리에는 4개의 페이지, 스왑 공간에는 8개의 페이지가 존재한다. 물리 메모리는 프로세스 0, 1, 2가 공유하고 있다. 유효한 페이지 몇 개만 메모리에 올려 놓았고, 나머지는 디스크에 스왑 아웃되어 있다. 3번 프로세스는 모든 페이지가 스왑 아웃 되어 있는 것으로 보아 현재 실행중이 아니다.

스왑 공간에만 스왑을 할 수 있는 것은 아니다. 물리 메모리가 추가 공간을 확보해야 할 때, 코드 영역의 페이지들이 차지하는 물리 페이지는 즉시 다른 페이지가 사용할 수 있다. 코드가 저장되어 있는 파일 시스템 영역이 스왑 목적으로 사용되는 것이다. 해당 페이지들은 디스크에 원본이 있기 때문에, 언제든지 스왑 인이 가능하기 때문이다.

## 2. Present Bit 

이제 페이지 스왑을 위한 기능을 다룰 차례다. 하드웨어 기반 TLB를 사용하는 시스템을 가정할 것이다.

메모리가 참조되는 과정을 remind 해보자. 
1. 프로세스가 가상 메모리 참조를 생성한다 (명령어 탑재, 데이터 접근 등)
2. 하드웨어는 메모리에서 원하는 데이터를 가져오기 전에, 우선 가상 주소를 물리 주소로 변환한다. 
    1. 가상주소에서 VPN을 추출한 후에 TLB에 해당 정보가 있는지 검사한다. (TLB 히트) 만약 성공하면 물리 주소를 얻은 뒤에 메모리로 가져온다.
    2. 만약 VPN을 TLB에서 찾을 수 없다면 (TLB 미스), 하드웨어는 페이지 테이블의 메모리 주소를 파악하고 (페이지 테이블 베이스 레지스터 사용), VPN을 인덱스로 하여 원하는 페이지 테이블 항목 (PTE) 를 추출한다. 
    3. 해당 페이지 테이블 항목이 유효하고, 관련 페이지가 물리 메모리에 존재하면 하드웨어는 PTE에서 PFN 정보를 추출하고 그 정보를 TLB에 탑재한다.
    4. 탑재 후 명령어를 재실행한다. 이번에는 TLB 히트이다.

페이지가 디스크로 스왑되는 것을 가능하게 하려면 많은 기법들이 추가되어야 한다.
하드웨어가 PTE에서 해당 페이지가 물리 메모리에 존재하지 않는다는 것을 표현해야 한다. **present bit**를 사용하여 각 페이지 테이블 항복에 어떤 페이지가 존재하는지를 표현한다. present bit가 1로 설정되어 있으면, 물리 메모리에 해당 페이지가 존재한다는 것이고, 위에서 설명한 대로 작동한다. 하지만 0으로 설정되어 있으면 메모리에 해당 페이지가 존재하지 않고 디스크 어딘가에 존재한다는 것을 나타낸다.

물리 메모리에 존재하지 않는 페이지 참조를 **페이지 폴트 (page fault)** 라 한다. 페이지 폴트가 발생하면 이 페이지 폴트를 처리하기 위해 운영체제로 제어권이 넘어간다. 즉, 페이지 폴트 핸들러가 실행된다. 

## 3. 페이지 폴트

TLB 처리 방법에 따라 두 종류의 시스템으로 나눌 수 있다. 하드웨어 기반 TLB 시스템, 소프트웨어 기반 TLB 시스템. 두 종류 모두 페이지 폴트가 발생하면 **운영체제**가 그 처리를 담당한다. 운영체제의 페이지 폴트 핸들러가 그 처리 메커니즘을 규정한다.

만약 요청된 페이지가 메모리에 없고, 디스크로 스왑되었다면, 운영체제는 해당 페이지를 메모리로 스왑해 온다. 그렇다면 *원하는 페이지의 위치를 어떻게 파악할까?*

많은 시스템들에서 해당 페이지의 스왑 공간사에서의 위치를 페이지 테이블에 저장한다. 운영체제는 PFN과 같은 PTE 비트들을 페이지의 디스크 주소를 나타내는 데 사용할 수 있다. 페이지 폴트 발생 시 운영체제는 페이지 테이블 항목에서 페이지의 디스크 상 위치를 파악하여 메모리로 탑재한다. 

디스크 IO가 완료되면 운영체제는 해당 PTE의 PFN 값을 탑재된 페이지의 메모리 위치로 갱신한다. 이 작업이 완료되면 페이지 폴트를 발생시킨 명령어가 **재실행**된다. 재실행으로 인해 TLB 미스가 발생할 수 있다. TLB 미스 처리 과정에서 TLB 값이 갱신되고, 최종적으로 마지막 재실행 시에 TLB에서 주소 변환 정보를 찾아 이를 통해 물리 주소에서 원하는 데이터나 명령어를 가져온다. 

IO 전송 중에는 해당 프로세스가 **blocked** 상태가 된다는 것에 유의해야 한다. 페이지 폴트 처리 시 운영체제는 다른 프로세스를 실행할 수 있다. 한 프로세스의 IO작업 (페이지 폴트 등) 은 오래 걸리는 일이기 때문에 IO작업과 다른 프로세스의 실행을 중첩시키는 방식을 통해 하드웨어를 효율적으로 사용한다. 

## 4. 메모리에 빈 공간이 없으면?

위 설명에서, page in을 위한 메모리가 충분하다고 가정했다. 메모리에 여유 공간이 없다면 어떻게 해야 할까?

메모리에 탑재하고자 하는 페이지를 위한 공간을 확보하기 위해, 다른 페이지들을 먼저 page out 하려고 할 수 있다. 이 교체 페이지를 선택하는 것을 **페이지 교체 정책 (page replacement policy) 라고 한다.** 

좋은 페이지 교체 정책을 위해 많은 노력이 있었다. 잘못된 교체 정책을 선택하면, 프로그램이 메모리 속도가 아니라 디스크 속도로 실행될 수 있기 때문이다. 다음 장에서 교체 정책에 대해 자세히 다룰 것이다.

## 5. 페이지 폴트의 처리

![[OSTEP 21 Swapping Mechanisms-1691483926992.jpeg]]

![[OSTEP 21 Swapping Mechanisms-1691483933676.jpeg]]

## 6. 교체는 언제 일어나는가

지금까지는 메모리에 여유 공간이 고갈된 후에 교체 알고리즘이 작동하는 것을 가정하였다. 하지만 이 방법은 효율적이지 못하다. 또, 운영체제는 항상 어느 정도의 여유 메모리 공간을 확보하고 있어야 한다. 이를 위해 대부분의 운영체제들은 여유 공간에 관련된 최댓값과 최솟값 (high watermark HW, low watermark LW) 을 설정하여 교체 알고리즘에 활용한다.

운영체제가 여유 공간의 크기가 최솟값보다 작아지면 여유 공간 확보를 담당하는 백그라운드 쓰레드가 실행되고, 여유 공간의 크기가 최댓값에 이를 때까지 페이지를 제거한다. 이를 일반적으로 스왑 데몬 또는 페이지 데몬이라고 불린다.