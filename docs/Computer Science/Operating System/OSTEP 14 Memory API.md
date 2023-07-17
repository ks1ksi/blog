# OSTEP 14 Memory API

## 1. 메모리 공간의 종류

C 프로그램이 실행되면, 두 가지 유형의 메모리 공간이 할당된다.
- stack 메모리
    - 컴파일러에 의해 암묵적으로 할당과 반환이 이루어짐

```c
void func() {
    int x; // 스택에 int 형을 선언
    // rest of code
}
```

