---
title: OSTEP 38 Redundant Disk Arrays (RAID)
author: Seungil Kim
description: ""
postSlug: OSTEP 38 Redundant Disk Arrays (RAID)
featured: false
tags:
  - cs
  - os
pubDatetime: 2023-10-30T20:11:24+09:00
---
# OSTEP 38 Redundant Disk Arrays (RAID)

RAID는 여러 개의 디스크를 조화롭게 사용하여 고속이면서 대용량의 신뢰할 수 있는 디스크 시스템을 만드는 기술이다. 하나의 디스크처럼 보이지만 사실은 여러 개의 디스크와 메모리, 시스템을 관리하기 위한 하나 또는 그 이상의 프로세서로 이루어진 복잡한 기계이다.

RAID는 단일 디스크에 비해 여러 장점들을 제공한다. 첫 번째는 **성능**이다. 디스크 여러 개를 병렬으로 사용하면 I/O 시간이 크게 개선된다. 또 다른 장점은 **용량**이다. 여러 디스크를 사용해서 용량을 늘릴 수 있다. 마지막 장점은 **신뢰성**이다. 데이터 중복 기술을 사용해서 RAID는 디스크 고장이 전혀 없던 것 처럼 데이터를 잃지 않을 수 있다. 

호스트 시스템은 RAID를 그저 거대한 디스크로 인식한다. 운영체제와 클라이언트 응용 프로그램은 코드 한 줄 바꾸지 않고 RAID를 사용할 수 있다. 이 투명성은 RAID가 확산되는데 기여하였다.
## Table of Contents

## 인터페이스와 RAID의 내부

