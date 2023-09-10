---
title: JPA
author: Seungil Kim
pubDatetime: 2023-07-02T12:01:40.000Z
tags: []
featured: false
description: ''
postSlug: JPA
---
# JPA

## N:1 양방향
- N쪽에 외래키 존재. **연관관계의 주인.**
- 연관관계 주인 엔티티에 `@ManyToOne`, `@JoinColumn(name = "FK")`으로 매핑
- 반대쪽에는 `@OneToMany(mappedBy = "___")`

## 1:1 양방향
- 더 자주 조회하는 쪽에 FK 넣기. 연관관계의 주인.
- 연관관계 주인 엔티티에 `@OneToOne, @JoinColumn(name = "FK")`
- 반대쪽에 `@OneToOne(mappedBy = "___")`

## N:M 양방향
- 1:N, N:1로 풀어내기

## 모든 연관관계는 지연로딩으로 설정
- `@OneToOne, @ManyToOne` 관계는 기본이 즉시로딩(EAGER) 이므로 직접 지연로딩(LAZY) 으로 설정해주어야 한다. (N+1 문제 방지)

## 컬렉션은 필드 초기화
- `null`문제에서 안전하다.
- 하이버네이트는 엔티티를 영속화할 때 컬렉션을 감싸서 하이버네이트가 제공하는 내장 컬렉션으로 변경한다. 임의의 메서드에서 컬렉션을 잘못 생성하면, 하이버네이트 내부 메커니즘에 문제가 발생할 수 있다. 
- 따라서 필드 레벨에서 생성하는 것이 가장 안전하고, 코드도 간결하다. 

## mappedBy
- 연관관계의 주인이 반대쪽에 있고, 자기 자신을 `"___"`라고 참조하고 있다는 의미.
- mappedBy 없이 그냥 연관관계 설정시 조인 테이블 생김. 조인 테이블 없이 FK 사용하고싶으면 연관관계 주인 반대쪽에 mappedBy 사용.

## cascade
- 원래 하나하나 다 영속성 컨텍스트에 추가해줘야 함.
- 상위 엔티티에서 하위 엔티티로 영속 상태 전파.
- ex) User를 지웠을 때, User가 쓴 글도 모두 지우고 싶다면 ?

## @Transactional
- 메소드가 시작할 때 트랜잭션 `begin()`, 메서드가 종료될 때 트랜잭션 `commit()`.
- 중간에 예외 발생시 트랜잭션 `rollback()`.
- `readOnly=true` : 데이터의 변경이 없는 읽기 전용 메서드에 사용, 영속성 컨텍스트를 플러시 하지 않으므로 약간의 성능 향상(읽기 전용에는 다 적용)
- By default, CRUD methods on repository instances inherited from [`SimpleJpaRepository`](https://docs.spring.io/spring-data/data-jpa/docs/current/api/org/springframework/data/jpa/repository/support/SimpleJpaRepository.html) are transactional. For read operations, the transaction configuration `readOnly` flag is set to `true`. All others are configured with a plain `@Transactional` so that default transaction configuration applies.
- 중첩되면 기본적으로 하나의 트랜잭션으로 처리.
- `@Service` 계층에서 `@Transactional`을 달아서 여러 Repository를 사용하는 코드가 하나의 트랜잭션으로 처리가 되도록 할 수 있다.

## 연관관계 편의 메서드
- DB에 `flush`되기 전에도 양방향으로 묶여 있는 자료의 일관성을 지키기 위해 작성.
