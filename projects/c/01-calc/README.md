# 01. 재귀 하강 계산기

## 무엇을 만드는가

표준 입력에서 한 줄에 식 하나를 읽어 정수 결과를 출력하는 계산기다. 우선순위, 괄호,
단항 부호, 나머지 연산, 그리고 C23 소스 코드가 허용하는 숫자 표기(`0b1010`, `0x1F`,
`1'000'000`)를 그대로 받는다.

```
$ build/app.exe
1 + 2 * (3 - 1)
5
0b1010 + 0x1F
41
1'000'000 / 1'000
1000
1 / 0
error: division by zero
```

## 왜 이 프로젝트인가

계산기는 "문자열 → 토큰 → 트리 → 값"이라는 모든 언어 처리기의 뼈대를 200줄 안에
보여 준다. 여기서 만든 토크나이저와 재귀 하강 파서는 5번 JSON 파서, 7번 바이트코드
VM의 어셈블러, 그리고 Go 9번 인터프리터에서 그대로 다시 쓰인다.

동시에 C23이 바꾼 "일상 문법"을 한 파일에서 전부 만난다: `bool`/`true`/`false`가
키워드가 됐고, `nullptr`가 생겼고, `constexpr`와 `auto`가 들어왔고, `[[nodiscard]]`
같은 속성 문법이 표준이 됐다.

## 핵심 개념

### 토크나이저와 한 토큰 미리 읽기

파서는 문자를 직접 보지 않는다. `next_token`이 공백을 건너뛰고 "지금 문자가 무엇인가"를
`Token`으로 바꿔 주면, 파서는 `p->cur`에 놓인 **현재 토큰 하나**만 보고 결정한다.
이 "한 개 미리 읽기(lookahead 1)"가 재귀 하강 파서를 단순하게 만드는 핵심이다.

```c
typedef struct Parser {
    const char *src;
    size_t pos;
    Token cur;          // 현재 토큰
    const char *error;  // nullptr이면 정상
} Parser;

static void advance(Parser *p) { p->cur = next_token(p); }
```

### 재귀 하강: 문법 규칙 = 함수

```
expr   := term   (('+' | '-') term)*
term   := factor (('*' | '/' | '%') factor)*
factor := NUMBER | '(' expr ')' | '-' factor | '+' factor
```

규칙마다 함수 하나를 만든다. `expr`이 `term`을 부르고 `term`이 `factor`를 부르며,
`factor`가 괄호를 만나면 다시 `expr`을 부른다. 이 **재귀**가 괄호 중첩을 공짜로
처리한다. 우선순위는 함수 호출 깊이로 표현된다: 더 깊은 함수가 더 먼저 결합한다.

```c
[[nodiscard]] static long long parse_term(Parser *p) {
    long long left = parse_factor(p);
    while (p->cur.kind == T_STAR || p->cur.kind == T_SLASH || p->cur.kind == T_PERCENT) {
        auto op = p->cur.kind;      // C23 auto: TokenKind로 추론
        advance(p);
        long long right = parse_factor(p);
        /* op에 따라 left를 갱신 */
    }
    return left;
}
```

### C23: `bool`, `nullptr`, `constexpr`, `auto`

| 이전 | C23 | 왜 좋아졌나 |
| --- | --- | --- |
| `#include <stdbool.h>` 후 `bool` | `bool`, `true`, `false`가 키워드 | 헤더 없이 어디서나 쓴다 |
| `NULL` (`(void*)0` 또는 `0`) | `nullptr` (타입 `nullptr_t`) | `int`와 헷갈리지 않고 `_Generic`에서 구분된다 |
| `#define MAX 1024` | `constexpr int MAX = 1024;` | 타입·스코프가 있고 디버거에 보인다 |
| `TokenKind op = p->cur.kind;` | `auto op = p->cur.kind;` | 타입이 바뀌어도 코드가 따라간다 |

```c
constexpr int MAX_LINE = 1'024;   // 자리 구분자 '도 C23
int *p = nullptr;
```

### C23: 숫자 리터럴 — `0b`, `'`

C23은 2진 리터럴 `0b1010`과 자리 구분자 `1'000'000`을 표준으로 넣었다. 이 프로젝트의
`lex_number`는 계산기 입력에서도 같은 표기를 받는다. 구현은 간단하다: 접두사로
`base`를 고르고, `'`는 건너뛰고, `digit_value`가 `-1`을 주면 멈춘다.

### C23: 속성 `[[nodiscard]]`와 `enum : type`

```c
[[nodiscard]] static long long parse_expr(Parser *p);   // 결과를 버리면 경고
typedef enum TokenKind : unsigned char { T_NUM, T_PLUS, /* … */ } TokenKind;
```

`[[...]]` 속성 문법이 표준이 됐다. `[[nodiscard]]`는 "값을 계산해 놓고 잊는" 버그를
컴파일 시간에 잡는다. `enum : unsigned char`는 열거형의 크기를 1바이트로 고정한다 —
7번 VM에서 명령어 바이트를 정의할 때 다시 쓴다.

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다. 단계마다 빌드해서
경고가 0개인지 확인하고, 다음 단계로 넘어가자. `[테스트]`는 5단계까지 끝나야 통과한다.

### Step 1: 토크나이저

`next_token`의 `switch`에 `-`, `*`, `/`, `%`, `(`, `)`를 채운다. `'\0'`이면 `T_END`,
그 외 문자는 `fail(p, "unexpected character")` 뒤 `T_BAD`를 돌려준다.

확인: 빌드가 되고, 아직은 모든 입력에 `error: not implemented`가 나온다.

### Step 2: 숫자 리터럴

`digit_value(c, base)`가 `'0'~'9'`, `'a'~'f'`, `'A'~'F'`를 값으로 바꾸되 `base` 이상이면
`-1`을 주게 한다. `lex_number`에서 `0b`/`0x` 접두사를 보고 base를 정하고, 루프에서
`'`는 건너뛰고 자릿수를 누적한다. 자릿수가 하나도 없으면 `"malformed number"`.

확인: `fail(p, "not implemented")` 줄을 지웠는지 확인한다.

### Step 3: 파서

`parse_factor`: `T_NUM`이면 값을 돌려주고 `advance`. `T_LPAREN`이면 `advance` 후
`parse_expr`, 그다음 `T_RPAREN`이 아니면 `"expected ')'"`. `T_MINUS`는 `-parse_factor(p)`,
`T_PLUS`는 `parse_factor(p)`.

`parse_term`, `parse_expr`: 위 "재귀 하강" 절의 모양대로 `while` 루프를 채운다.

확인: 임시로 `main`에 `1 + 2 * 3`을 넣고 `7`이 나오면 된다.

### Step 4: 에러 처리

- `parse_factor`에서 `T_END`면 `"unexpected end of input"`, 그 외 예상 밖 토큰은 `"unexpected token"`
- `parse_term`에서 오른쪽 피연산자가 0인 `/`, `%`는 `"division by zero"`
- `evaluate`에서 파싱이 끝났는데 `p.cur.kind != T_END`면 `"trailing input"` (`1 2` 같은 입력)

에러 메시지는 테스트가 문자열 그대로 비교하므로 정확히 적는다.

### Step 5: REPL 루프

`main`을 `while (fgets(...) != nullptr)` 루프로 바꾸고 빈 줄은 건너뛴다. 이제
`[테스트]`를 눌러 6개 케이스가 모두 통과하는지 본다.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `error: 'nullptr' undeclared` | `-std=c23`이 빠졌다. `.vscode/tasks.json`의 빌드 태스크나 `Ctrl+Shift+B`를 쓴다 |
| `warning: ignoring return value ... [[nodiscard]]` | `parse_*` 결과를 변수에 받지 않았다. 의도한 거라면 `(void)`로 명시한다 |
| `1 + 2 * 3`이 `9`가 나온다 | `parse_expr`이 `parse_factor`를 직접 부르고 있다. `term`을 거쳐야 우선순위가 생긴다 |
| `-5 + 2`가 `-7` | 단항 `-`가 `factor`가 아니라 `expr` 전체에 걸렸다 |
| `(1 + 2`에서 무한 루프 | `T_END`에서 `advance`를 계속 부르고 있다. `T_END`는 소비하지 않는다 |
| `0x1F`가 `0`으로 나온다 | `digit_value`가 `base`를 무시하거나 대문자를 처리하지 않는다 |
| 테스트가 `\r` 때문에 실패하는 것 같다 | 러너는 CRLF와 꼬리 공백을 무시하고 비교한다. 실제 값이 다른 것이다 |

## 더 나아가기

- 거듭제곱 `^`를 **오른쪽 결합**으로 추가해 보자 (`2 ^ 3 ^ 2` = 512). 재귀 하강에서 오른쪽 결합은 `while` 대신 재귀 호출 하나로 표현된다.
- 변수 대입 `x = 3 * 4`와 참조를 추가해 보자. 3번 해시맵 프로젝트를 끝내면 심볼 테이블로 연결된다.
- `long long` 오버플로를 `__builtin_add_overflow`로 감지해 `"overflow"` 에러를 내 보자.

## 참고

- C23 표준 초안 N3220: 6.4.4.1 정수 상수(자리 구분자·2진), 6.7.1 `constexpr`, 6.7.13 속성, 7.21.1 `nullptr`
- gcc 15 C23 지원 현황: <https://gcc.gnu.org/projects/c-status.html>
- 재귀 하강 파서의 고전 설명: *Crafting Interpreters* 6장 (Parsing Expressions)
