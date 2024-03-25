---
author: Seungil Kim
description: ""
featured: true
postSlug: 2022 SKKU 프로그래밍 대회 in 소프트의 밤
pubDatetime: 2023-07-02T12:01:40.000Z
tags:
  - ps
  - skku
title: 2022 SKKU 프로그래밍 대회 in 소프트의 밤
---
# 2022 SKKU 프로그래밍 대회 in 소프트의 밤

![[2022 SKKU 프로그래밍 대회 in 소프트의 밤-1673535718388.jpeg]]

![[2022 SKKU 프로그래밍 대회 in 소프트의 밤-1673535724808.jpeg]]

2022년 10월 27일에 진행한 SKKU 프로그래밍 대회.
하나정도는 더 풀어볼만 했는데 막판에 집중력을 잃고 4솔.. ~~(이론상 입선)~~
그래도 올해 초에 참가했던 대회보다는 한 문제 더 풀었다.
내년에는 5솔 이상 하고 10등 안에 들 수 있지 않을까?

## A 안녕 클레오파트라 세상에서 제일가는 포테이토칩
[문제 링크](https://www.acmicpc.net/problem/25904)

내야 하는 목소리 $X$를 1씩 늘리면서 확인해보면 된다. $N$번 사람까지 도달한 경우 1번 사람부터 다시 진행할 수 있도록 인덱스를 바꿔준다.

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    int n, x;
    cin >> n >> x;
    vector<int> v(n);
    for (auto& num : v) {
        cin >> num;
    }

    int cur = 0;
    while (1) {
        if (v[cur] < x) {
            cout << cur+1 << '\n';
            break;
        }
        cur++;
        x++;
        if (cur == n) cur = 0;
    }

    return 0;
}
```

## B 장인은 도구를 탓하지 않는다
[문제 링크](https://www.acmicpc.net/problem/25905)

망치 9개를 사용하면 되고, 곱셈 연산이므로 순서에 관계없이 강화 확률이 가장 낮은 망치를 제외한 나머지 망치 9개를 선택하면 된다. 

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;
using ld = long double;

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);
    cout << fixed << setprecision(7);

    vector<ld> v(10);
    for (auto& x : v) {
        cin >> x;
    }
    sort(v.begin(), v.end());

    ld ans = 1e9;
    for (int i = 1; i < 10; i++) {
        ans = ans * v[i] / i;
    }

    cout << ans << '\n';

    return 0;
}
```

## C 수렵의 시간이다!
[문제 링크](https://www.acmicpc.net/problem/25906)

현재 가진 돈으로 착용할 수 있는 모든 방어구의 조합을 시도한다. 이 때 ***방어구를 착용하지 못하는 경우***도 고려해야 한다. 입력받은 방어구에 아무런 효과도 없고 가격도 0인 더미 방어구 한개씩을 추가해주면 편하게 구현할 수 있다. 
만약 강화까지 가능하다면, 현재 착용한 방어구에 대해 전부 시도해본다. 스킬 레벨 증가량을 올릴 스킬과 내릴 스킬도 전부 시도해본다.
실수할 여지가 굉장히 많은 문제다.

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int t, k;
vector<vector<int>> skills(5);
vector<vector<pair<int, vector<int>>>> items(3);

int calculate(int money, pair<int, vector<int>> &item1, pair<int, vector<int>> &item2, pair<int, vector<int>> &item3) {
    int tc = item1.first + item2.first + item3.first;
    if (tc > money) return -1;

    int ret = 0;
    vector<int>lv(5);
    for (int i = 0; i < 5; i++) {
        lv[i] = item1.second[i] + item2.second[i] + item3.second[i];
        ret += skills[i][min((int)skills[i].size()-1, lv[i])];
    }

    if (money - k >= tc) {
        for (int i = 0; i < 5; i++) { // down
            if (!lv[i]) continue;
            lv[i]--;
            for (int j = 0; j < 5; j++) { // up
                if (i == j) continue;
                lv[j]++;
                int tmp = 0;
                for (int k = 0; k < 5; k++) {
                    tmp += skills[k][min((int)skills[k].size()-1, lv[k])];
                }
                ret = max(ret, tmp);
                lv[j]--;
            }
            lv[i]++;
        }
    }

    return ret;
}

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    cin >> t >> k;

    for (auto& v : skills) {
        int sz;
        cin >> sz;
        v.push_back(0);
        for (int i = 0; i < sz; i++) {
            int x;
            cin >> x;
            v.push_back(x);
        }
    }
    
    for (auto& v : items) {
        int sz;
        cin >> sz;
        v.resize(sz+1);

        v[0].first = 0;
        for (int i = 0; i < 5; i++) {
            v[0].second.push_back(0);
        }

        for (int i = 1; i <= sz; i++) {
            cin >> v[i].first;
        }

        for (int i = 1; i <= sz; i++) {
            for (int j = 0; j < 5; j++) {
                int x;
                cin >> x;
                v[i].second.push_back(x);
            }
        }
    }

    int ans = 0;

    for (int i = 0; i < items[0].size(); i++) {
        for (int j = 0; j < items[1].size(); j++) {
            for (int k = 0; k < items[2].size(); k++) {
                ans = max(ans, calculate(t, items[0][i], items[1][j], items[2][k]));
            }
        }
    }

    cout << ans << '\n';

    return 0;
}
```

## D 양과 늑대
[문제 링크](https://www.acmicpc.net/problem/25907)

첫 번째 날에는 항상 양이 도착하고, 마지막 날에는 항상 늑대의 수가 양의 수보다 많고, 하루에 늑대 혹은 양이 한 마리씩 도착하기 때문에 1번째 날부터 $N$번째 날중 적어도 하루 이상 늑대와 양의 수가 같아진다. 
- $lo <= hi$이고,  $mid = (lo+hi)/2$라 하자. 
- $mid$번째 날에 양과 늑대의 수가 같다면 $mid$번째 날이 정답이다.
- $mid$번쨰 날에 양이 더 많다면, $mid+1$번째 날과 $hi$번째 날 사이에 정답이 존재한다.
- $mid$번째 날에 늑대가 더 많다면 $lo$번째 날과 $mid-1$번째 날 사이에 정답이 존재한다.
인터랙티브 문제라 출력 이후 버퍼를 `flush` 해야 한다.

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    int n;
    cin >> n;

    int lo = 1, hi = n, cnt;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        cout << "? " << mid << endl;
        cin >> cnt;

        if (cnt*2 > mid) lo = mid + 1;
        else if (cnt*2 < mid) hi = mid - 1;
        else {
            cout << "! " << mid << endl;
            break;
        }
    }
    
    return 0;
}
```

## E 수열의 합
[문제 링크](https://www.acmicpc.net/problem/25908)

 $\sum_{i=S}^{T}{a_i}$는 $\sum_{i=1}^{T}{a_i}$ - $\sum_{i=1}^{S-1}{a_i}$ 이므로 $\sum_{i=1}^{N}{a_i}$ 을 구하면 된다. 
 어떤 양의 정수 $d$는 $\sum_{i=1}^{N}{a_i}$에 **$1$과 $N$ 사이에 존재하는 $d$의 배수의 개수만큼** 기여한다. 홀수이면 $(-1) \times \lfloor \frac{N}{d} \rfloor$ 만큼, 짝수이면 $(1) \times \lfloor \frac{N}{d} \rfloor$ 만큼 기여한다. 배수를 일일히 구하면 시간 초과를 받을 수 있다. 

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int solve(int n) {
    int ret = 0;
    for (int i = 1; i <= n; i++) {
        int x = (i%2) ? -1 : 1;
        ret += (n/i)*x;
    }
    return ret;
}

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    int s, t;
    cin >> s >> t;
    cout << solve(t) - solve(s-1) << '\n';

    return 0;
}
```

## F 수확의 계절이다!
[문제 링크](https://www.acmicpc.net/problem/25909)

$x$를 고정시켜 놓고, 주어진 입력을 따라가면 총 몇 개의 작물을 수확할 수 있는지 나온다. Parametric Search 가능. 세트 수 $\times$ 진행 횟수 $= M$이 최대 $1,000,000$이므로 매번 길을 따라가면 시간 초과를 받게 되고, 미리 좌표마다 언제 도착하는지 전처리를 할 필요가 있다.
$-1,000,000 \le x \le 1,000,000$이고, $-1,000,000 \le y \le 1,000,000$라서 2차원 배열을 만들 수 없다. `map`에 좌표와 방문 시점을 기록한다. 매번 2차원 배열에 기록했는데 `map`을 쓰는 방식도 알아둬야겠다. 

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    int n, k;
    cin >> n >> k;
    vector<pair<char, int>> v(n);

    for (auto& [a, b] : v) {
        cin >> a >> b;
    }

    map<pair<int, int>, vector<int>> m;
    map<char, pair<int, int>> mm;
    mm['N'] = {1, 0};
    mm['S'] = {-1, 0};
    mm['E'] = {0, 1};
    mm['W'] = {0, -1};

    int y = 0, x = 0, t = 0;
    for (auto& [a, b] : v) {
        auto& [dy, dx] = mm[a];
        for (int i = 0; i < b; i++) {
            y += dy;
            x += dx;
            m[{y, x}].emplace_back(++t);
        }
    }

    int lo = 0, hi = 1000000;
    while (lo <= hi) {
        int cnt = 0;
        int mid = (lo + hi) / 2;
        for (auto& [p, v] : m) {
            for (int i = 0; i < v.size()-1; i++) {
                for (int j = i+1; j < v.size(); j++) {
                    if (v[j] - v[i] < mid) continue;
                    else {
                        cnt++;
                        i = j-1;
                        break;
                    }
                }
            }
        }
        if (cnt < k) hi = mid - 1;
        else lo = mid + 1;
    }

    cout << hi << '\n';

    return 0;
}
```
