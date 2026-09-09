// 01-calc — 재귀 하강 계산기 (starter)
//
// 표준 입력에서 한 줄씩 식을 읽어 정수 결과를 출력한다.
//   1 + 2 * (3 - 1)   →  5
//   1 / 0             →  error: division by zero
//
// 문법:
//   expr   := term   (('+' | '-') term)*
//   term   := factor (('*' | '/' | '%') factor)*
//   factor := NUMBER | '(' expr ')' | '-' factor | '+' factor
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <ctype.h>
#include <stdio.h>
#include <string.h>

// C23: constexpr — 타입이 있는 컴파일 시간 상수. 1'024의 '는 자리 구분자다.
constexpr int MAX_LINE = 1'024;

// C23: enum의 밑바탕 타입 지정
typedef enum TokenKind : unsigned char {
    T_NUM,
    T_PLUS,
    T_MINUS,
    T_STAR,
    T_SLASH,
    T_PERCENT,
    T_LPAREN,
    T_RPAREN,
    T_END, // 줄 끝
    T_BAD, // 알 수 없는 문자
} TokenKind;

typedef struct Token {
    TokenKind kind;
    long long value; // T_NUM일 때만 의미 있음
} Token;

typedef struct Parser {
    const char *src;
    size_t pos;
    Token cur;         // 현재 토큰 (한 개 미리 읽기)
    const char *error; // nullptr이면 정상. 첫 번째 에러만 기억한다.
} Parser;

static void fail(Parser *p, const char *msg) {
    if (p->error == nullptr) {
        p->error = msg;
    }
}

// ---------------------------------------------------------------------------
// TODO(step-2): 숫자 리터럴
// 10진수뿐 아니라 0b1010(2진), 0x1F(16진), 1'000'000(자리 구분자)을 읽어야 한다.
// 힌트: 접두사로 base를 정하고, '는 건너뛰고, digit_value가 -1을 주면 멈춘다.
// ---------------------------------------------------------------------------
static int digit_value(char c, int base) {
    (void)c;
    (void)base;
    return -1; // TODO(step-2)
}

static Token lex_number(Parser *p) {
    (void)digit_value;
    fail(p, "not implemented"); // TODO(step-2): 이 줄을 지우고 구현한다
    return (Token){.kind = T_NUM, .value = 0};
}

// ---------------------------------------------------------------------------
// TODO(step-1): 토크나이저
// 공백을 건너뛰고 한 문자를 보고 토큰 종류를 정한다. 숫자면 lex_number에 맡긴다.
// '+'는 예시로 채워 두었다. 나머지 연산자와 괄호, 줄 끝(T_END), 그 외(T_BAD)를 처리한다.
// ---------------------------------------------------------------------------
static Token next_token(Parser *p) {
    const char *s = p->src;
    while (isspace((unsigned char)s[p->pos])) {
        p->pos++;
    }
    char c = s[p->pos];
    if (isdigit((unsigned char)c)) {
        return lex_number(p);
    }
    p->pos++;
    switch (c) {
    case '+': return (Token){.kind = T_PLUS};
    // TODO(step-1): '-', '*', '/', '%', '(', ')'
    default:
        // TODO(step-1): '\0'이면 T_END, 그 외에는 fail(p, "unexpected character") 후 T_BAD
        return (Token){.kind = T_BAD};
    }
}

static void advance(Parser *p) {
    p->cur = next_token(p);
}

// ---------------------------------------------------------------------------
// TODO(step-3): 파서
// 문법 규칙 하나가 함수 하나다. factor는 숫자·괄호·단항 부호, term은 * / %, expr은 + -.
// C23: [[nodiscard]] 덕분에 결과를 버리는 호출은 경고가 난다.
// ---------------------------------------------------------------------------
[[nodiscard]] static long long parse_expr(Parser *p);

[[nodiscard]] static long long parse_factor(Parser *p) {
    // TODO(step-3): T_NUM → 값, T_LPAREN → expr 뒤에 ')' 확인, T_MINUS → -factor, T_PLUS → factor
    // TODO(step-4): T_END면 "unexpected end of input", 그 외 "unexpected token"
    fail(p, "not implemented");
    return 0;
}

[[nodiscard]] static long long parse_term(Parser *p) {
    // TODO(step-3): factor를 읽고, * / % 가 이어지는 동안 오른쪽 factor와 결합한다.
    // TODO(step-4): 나누기·나머지에서 오른쪽이 0이면 fail(p, "division by zero")
    return parse_factor(p);
}

[[nodiscard]] static long long parse_expr(Parser *p) {
    // TODO(step-3): term을 읽고, + - 가 이어지는 동안 오른쪽 term과 결합한다.
    return parse_term(p);
}

// evaluate는 한 줄을 계산한다. 성공하면 true와 *out, 실패하면 false와 *err.
[[nodiscard]] static bool evaluate(const char *line, long long *out, const char **err) {
    Parser p = {.src = line, .pos = 0, .error = nullptr};
    advance(&p);
    long long v = parse_expr(&p);
    // TODO(step-4): 에러가 없는데 p.cur.kind가 T_END가 아니면 "trailing input"
    if (p.error != nullptr) {
        *err = p.error;
        return false;
    }
    *out = v;
    return true;
}

static bool is_blank(const char *s) {
    for (; *s; s++) {
        if (!isspace((unsigned char)*s)) {
            return false;
        }
    }
    return true;
}

// ---------------------------------------------------------------------------
// TODO(step-5): REPL 루프
// fgets로 한 줄씩 읽고, 빈 줄은 건너뛰고, evaluate 결과를 "%lld\n" 또는 "error: %s\n"으로 출력한다.
// ---------------------------------------------------------------------------
int main(void) {
    char line[MAX_LINE];
    if (fgets(line, sizeof line, stdin) != nullptr) {
        long long value = 0;
        const char *err = nullptr;
        if (is_blank(line)) {
            return 0;
        }
        if (evaluate(line, &value, &err)) {
            printf("%lld\n", value);
        } else {
            printf("error: %s\n", err);
        }
    }
    return 0;
}
