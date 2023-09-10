---
title: JOIN
author: Seungil Kim
pubDatetime: 2023-07-02T12:01:40.000Z
tags: []
featured: false
description: ''
ogImage: ''
postSlug: JOIN
---
# JOIN

## Cross Join
```sql
select * from table1, table2
```

- `join` 조건 생략. 데카르트 곱.

## Natural Join
```sql
select * from departments
natural join locations
```

- 두 테이블에 공통 컬럼이 있는 경우 묵시적으로 조인.
- 컬럼명 겹쳐서 엉뚱한 결과가 나올 수 있으니 주의.

## Inner Join
```sql
select * from employees e
inner join departments d
on(e.department_id = d.department_id)
```

- `inner` 키워드 생략 가능.
- **ANSI** 표준 문법.
- `on` 절에 조인 조건 작성.(`where` 절에도 작성 가능)
- 컬럼명이 같은 경우 다음과 같이 `using` 절을 사용해도 무방함.
```sql
select * from employees
inner join departments
using(department_id)
```

### Oracle 방식
```sql
select t1.col1, t1.col2, t2.col1
from table1 t1, table2 t2
where t1.col3 = t2.col3
```

- `from` 절에 필요로 하는 테이블을 모두 적는다. (`alias` 사용 가능)
- 적절한 조건을 `where` 절에 부여한다. 

## Outer Join
```sql
select *
from employees e
left outer join departments d
on(e.department_id = d.department_id)
```

- `left(right) outer join`: 왼쪽(오른쪽)의 모든 튜플은 결과 테이블에 나타남.
- `full outer join`: 양쪽 모두 결과 테이블에 나타남.
- `outer` 키워드 생략 가능.

## Self Join
```sql
select e.name as '사원 이름', m.name as '상사 이름'
from employees e
join employees m
on(e.manager_id = m.employee_id)
```

- 같은 테이블에 `alias` 다르게 주고 `join`
