# 백준 13489번 Vještica

[문제 링크](https://www.acmicpc.net/problem/13489)

노드 개수를 최소화시키기 위해 각 단어간 prefix를 최대한 겹치게 만들면 된다. 순서는 상관 없으므로 알파벳의 개수를 세서, 겹치는 만큼 prefix로 만들자. 

단어가 최대 16개이므로, 단어 사용 여부를 bit로 표현할 수 있다.
$dp[mask]$는 $mask$에 해당하는 단어들로 만들 수 있는 Trie의 최소 노드의 수 라고 정의하면, 다음과 같은 점화식을 세울 수 있다. 

$dp[mask] = min(dp[mask], dp[sub] + dp[mask \oplus sub] - cnt)$


$sub$는 현재 선택한 단어들의 부분집합이고, $cnt$는 현재 선택한 단어들의 최대 prefix 길이다.

```cpp
#include <bits/stdc++.h>

using namespace std;
using ll = long long;

int N, cache[1<<16], sz[16], words[16][26];
string s[16];

int get_cnt(int mask) {
    vector<int> acnt(26, 2e9);
    for (int i = 0; i < 16; i++) {
        if ((mask&(1<<i)) == 0) continue;
        for (int j = 0; j < 26; j++) {
            acnt[j] = min(acnt[j], words[i][j]);
        }
    }
    int ret = 0;
    for (int i = 0; i < 26; i++) {
        ret += acnt[i];
    }
    return ret;
}

int solve(int mask) {
    int& ret = cache[mask];
    if (ret != -1) return ret;
    int cnt = get_cnt(mask);
    if (((mask-1)&mask) == 0) return ret = cnt;

    ret = 2e9;
    // iterate through all of its submasks
    for (int sub = (mask-1)&mask; sub > 0; sub = (sub-1)&mask) {
        ret = min(ret, solve(sub) + solve(mask^sub) - cnt);
    }
    return ret;
}

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    cin >> N;
    for (int i = 0; i < N; i++) {
        cin >> s[i];
        for (auto c : s[i]) {
            words[i][c-'a']++;
        }
    }

    memset(cache, -1, sizeof(cache));
    cout << solve((1<<N)-1) + 1 << '\n';

    return 0;
}
```

주어진 $mask$에서 모든 $submask$를 구하는 방법을 알아야 한다.
[[비트마스크]]에서 알아보도록 하자.
