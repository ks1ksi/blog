---
title: SELECT
date created: 일요일, 7월 2일 2023, 9:01:40 오후
date modified: 수요일, 8월 9일 2023, 12:30:00 오전
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