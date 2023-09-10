---
title: SELECT
author: Seungil Kim
pubDatetime: 2023-07-02T12:01:40.000Z
tags:
  - cs
  - database
featured: false
description: ''
postSlug: SELECT
---
# SELECT

```SQL
SELECT(DISTINCT) 컬럼명(ALIAS)
FROM 테이블명
WHERE 조건식
GROUP BY 컬럼명
HAVING 조건식
ORDER BY 컬럼명 혹은 표현식 (ASC 혹은 DESC)
```

`WHERE`로 먼저 조건을 걸고, `GROUP BY`로 그룹을 나누고, 나눈 그룹에서 또 `HAVING`으로 조건 걸기.
