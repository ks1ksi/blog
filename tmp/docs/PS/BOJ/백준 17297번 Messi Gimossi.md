---
title: 백준 17297번 Messi Gimossi
date created: 일요일, 7월 2일 2023, 9:01:40 오후
date modified: 수요일, 8월 9일 2023, 12:30:08 오전
---
# 백준 17297번 Messi Gimossi

[문제 링크](https://www.acmicpc.net/problem/17297)

$M$이 최대 $2^{30}-1$이므로 완전탐색을 돌릴 순 없다. $messi(N)$은 $messi(N-1)$ 뒤에 $messi(N-2)$를 이어 붙인 문자열이다. 따라서 주어진 $m$보다 큰 $messi(N)$을 찾고, $M$번째 글자가 $messi(N-1)$에 포함되어 있는지 $messi(N-2)$에 포함되어 있는지 확인한다. 그렇게 $M$과 $N$을 줄여 나갈 수 있다. 공백을 만나면 출력하고 바로 종료한다.

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    ll m;
    cin >> m;

    vector<ll> messi = {5, 13};

    for (int i = 2; i < 50; i++) {
        ll next = messi[i-1] + messi[i-2] + 1;
        messi.emplace_back(next);
    }

    int idx = lower_bound(messi.begin(), messi.end(), m) - messi.begin();

    while (idx != 0 && idx != 1) {
        if (m <= messi[idx-1]) {
            idx--;
        }
        else if (m == messi[idx-1] + 1) {
            cout << "Messi Messi Gimossi\n";
            return 0;
        }
        else {
            m -= (messi[idx-1] + 1);
            idx -= 2;
        }
    }

    string s = "Messi Gimossi";
    m--;
    char c = s[m];
    if (c == ' ') cout << "Messi Messi Gimossi\n";
    else cout << c << '\n';

    return 0;
}
```

메시의 2022 월드컵 우승을 축하합니다.