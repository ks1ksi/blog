---
author: Seungil Kim
description: ""
featured: false
postSlug: 백준 25949번 Jar Game
pubDatetime: 2023-07-02T12:01:40.000Z
tags:
  - boj
  - ps
  - algorithm
  - dp
title: 백준 25949번 Jar Game
---
# 백준 25949번 Jar Game

[문제 링크](https://www.acmicpc.net/problem/25949)

**$a, b, c$번 항아리에 남아있는 조약돌의 개수와 현재 턴**으로 상태공간 정의.

$1 \le a, b, c \le 100$이므로 턴이 별로 커지지 않는다.

적당히 30정도로 잡으면 모든 경우의 수에 대응할 수 있다.  ($\sum_{i=1}^{30} \ge a+b+c$)

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;
using ld = long double;

pair<int, int> cache[101][101][101][30];

pair<int, int> solve(int a, int b, int c, int turn) { // 홀수턴 F, 짝수턴 S
    if (!a && !b && !c) return {0, 0};

    pair<int, int>& ret = cache[a][b][c][turn];
    if (ret != make_pair(-1, -1)) return ret;

    vector<pair<int, int>> rets;

    if (a) {
        pair<int, int> tmp = solve(max(0, a-turn), b, c, turn+1);
        turn % 2 ? tmp.first += min(a, turn) : tmp.second += min(a, turn);
        rets.push_back(tmp);
    }
    if (b) {
        pair<int, int> tmp = solve(a, max(0, b-turn), c, turn+1);
        turn % 2 ? tmp.first += min(b, turn) : tmp.second += min(b, turn);
        rets.push_back(tmp);
    }
    if (c) {
        pair<int, int> tmp = solve(a, b, max(0, c-turn), turn+1);
        turn % 2 ? tmp.first += min(c, turn) : tmp.second += min(c, turn);
        rets.push_back(tmp);
    }

    pair<int, int> ans = {0, 0};

    for (auto& p : rets) {
        if (turn%2) {
            if (p.first > ans.first) ans = p;
        }
        else {
            if (p.second > ans.second) ans = p;
        }
    }

    return ret = ans;
}

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    int a, b, c;    
    cin >> a >> b >> c;

    fill(&cache[0][0][0][0], &cache[100][100][100][30], make_pair(-1, -1));

    auto [f, s] = solve(a, b, c, 1);

    // cout << "F: " << f << '\n';
    // cout << "S: " << s << '\n';
    
    if (f > s) cout << "F";
    else if (f < s) cout << "S";
    else cout << "D";

    return 0;
}
```

game dp에 대해 더 공부해봐야겠다.

2022 ICPC 예선문제인데 내년 ICPC 꼭 나가야지!
