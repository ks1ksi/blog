---
title: Bulk Insert
author: Seungil Kim
pubDatetime: 2023-07-02T12:01:40.000Z
tags: []
featured: false
description: ''
ogImage: ''
postSlug: Bulk Insert
---
# Bulk Insert

![[JPA Bulk Insert-1674903588761.jpeg]]

교내 학생들이 푼 백준 문제를 모두 DB에 넣는 배치 프로그램을 작성했는데 속도가 너무 느리다. 이를 개선해보자.

우선 PK 생성 전략이 TABLE으로 되어 있어서,  IDENTITY로 변경했다. 키 생성 전용 테이블을 하나 만들어서 데이터베이스 시퀸스를 흉내내는 전략인데, 최적화 되어있지 않은 테이블을 직접 사용하기 때문에 성능이 나오지 않는다. IDENTITY 전략은 기본 키 생성을 데이터베이스에 위임하는 전략이다. (DDL로 기본키에 AUTO_INCREMENT 걸기)

이렇게 하면 JPA로 BATCH INSERT를 할 수없다. 잠시 JPA를 놓아주고 JDBC를 사용해보자.

```java
package skku.skkujoon.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import skku.skkujoon.domain.Problem;
import skku.skkujoon.domain.User;

import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;

/**
 * Only for batch insert
 * @author ks1ksi
 */

@Repository
@RequiredArgsConstructor
public class JdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public void insertUsers(List<User> users) {
        String sql = "insert into user (handle, bio, solved_count, tier, rating, ranking, global_rank) values (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.batchUpdate(sql,
                users,
                users.size(),
                (ps, u) -> {
                    ps.setString(1, u.getHandle());
                    ps.setString(2, u.getBio());
                    ps.setInt(3, u.getSolvedCount());
                    ps.setInt(4, u.getTier());
                    ps.setInt(5, u.getRating());
                    ps.setInt(6, u.getRanking());
                    ps.setInt(7, u.getGlobalRank());
                });
    }

    public void insertProblems(List<Problem> problems) {
        String sql = "insert into problem (problem_number, title_ko, level, solved_by_skku, solvable, partial) values (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.batchUpdate(sql,
                problems,
                problems.size(),
                (ps, p) -> {
                    ps.setLong(1, p.getProblemNumber());
                    ps.setString(2, p.getTitleKo());
                    ps.setInt(3, p.getLevel());
                    ps.setInt(4, p.getSolvedBySkku());
                    ps.setBoolean(5, p.isSolvable());
                    ps.setBoolean(6, p.isPartial());
                });
    }

    public void insertUserProblems(User user, List<Problem> problems) {
        String sql = "insert into user_problem (user_id, problem_id) values (?, ?)";
        jdbcTemplate.batchUpdate(sql,
                problems,
                problems.size(),
                (ps, p) -> {
                    ps.setLong(1, user.getId());
                    ps.setLong(2, p.getId());
                });
    }

    public void updateProblems(List<Problem> problems) {
        String sql = "update problem set solved_by_skku = solved_by_skku + 1 where problem_id = ?";
        jdbcTemplate.batchUpdate(sql,
                problems,
                problems.size(),
                (ps, p) -> {
                    ps.setLong(1, p.getId());
                });
    }

}

```

![[Bulk Insert-1674963763722.jpeg]]

7시간 넘게 걸리던걸 1시간으로 줄였다. solved.ac api 호출 제한이 있어서 시간을 더 줄이기는 힘들 것 같다.
