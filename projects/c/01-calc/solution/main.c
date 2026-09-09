// 01-calc — 재귀 하강 계산기 (solution)
//
// 표준 입력에서 한 줄씩 식을 읽어 정수 결과를 출력한다.
//   1 + 2 * (3 - 1)   →  5
//   0b1010 + 0x1F     →  41
//   1'000'000 / 1'000 →  1000
//   1 / 0             →  error: division by zero
//
// 문법 (재귀 하강 파서가 그대로 함수가 된다):
//   expr   := term   (('+' | '-') term)*
//   term   := factor (('*' | '/' | '%') factor)*
//   factor := NUMBER | '(' expr ')' | '-' factor | '+' factor
#include <ctype.h>
#include <stdio.h>
#include <string.h>

// C23: constexpr — 컴파일 시간 상수. #define과 달리 타입이 있고 스코프를 따른다.
constexpr int MAX_LINE = 1'024; // C23: 자리 구분자 '

// C23: enum의 밑바탕 타입을 직접 지정할 수 있다.
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
    if (p->error == nullptr) { // C23: nullptr — (void*)0보다 타입이 분명하다
        p->error = msg;
    }
}

// ---- Step 2: 숫자 리터럴 ----
// 10진수 외에 0b(2진), 0x(16진)과 자리 구분자 '를 받는다. C23 소스 코드가 허용하는
// 표기를 계산기 입력에서도 똑같이 허용하는 것이 목표다.
static int digit_value(char c, int base) {
    int v;
    if (c >= '0' && c <= '9') {
        v = c - '0';
    } else if (c >= 'a' && c <= 'f') {
        v = c - 'a' + 10;
    } else if (c >= 'A' && c <= 'F') {
        v = c - 'A' + 10;
    } else {
        return -1;
    }
    return v < base ? v : -1;
}

static Token lex_number(Parser *p) {
    int base = 10;
    const char *s = p->src;
    if (s[p->pos] == '0' && (s[p->pos + 1] == 'b' || s[p->pos + 1] == 'B')) {
        base = 2;
        p->pos += 2;
    } else if (s[p->pos] == '0' && (s[p->pos + 1] == 'x' || s[p->pos + 1] == 'X')) {
        base = 16;
        p->pos += 2;
    }
    long long value = 0;
    bool any = false; // C23: bool/true/false는 이제 키워드다 (<stdbool.h> 불필요)
    for (;;) {
        char c = s[p->pos];
        if (c == '\'') { // 자리 구분자는 값에 영향이 없다
            p->pos++;
            continue;
        }
        int d = digit_value(c, base);
        if (d < 0) {
            break;
        }
        value = value * base + d;
        any = true;
        p->pos++;
    }
    if (!any) {
        fail(p, "malformed number");
    }
    return (Token){.kind = T_NUM, .value = value};
}

// ---- Step 1: 토크나이저 ----
static Token next_token(Parser *p) {
    const char *s = p->src;
    while (isspace((unsigned char)s[p->pos])) {
        p->pos++;
    }
    char c = s[p->pos];
    if (c == '\0') {
        return (Token){.kind = T_END};
    }
    if (isdigit((unsigned char)c)) {
        return lex_number(p);
    }
    p->pos++;
    switch (c) {
    case '+': return (Token){.kind = T_PLUS};
    case '-': return (Token){.kind = T_MINUS};
    case '*': return (Token){.kind = T_STAR};
    case '/': return (Token){.kind = T_SLASH};
    case '%': return (Token){.kind = T_PERCENT};
    case '(': return (Token){.kind = T_LPAREN};
    case ')': return (Token){.kind = T_RPAREN};
    default:
        fail(p, "unexpected character");
        return (Token){.kind = T_BAD};
    }
}

static void advance(Parser *p) {
    p->cur = next_token(p);
}

// ---- Step 3: 파서 ----
// 각 함수는 문법 규칙 하나를 담당한다. 함수가 서로를 부르는 모양이 곧 문법의 모양이다.
// C23: [[nodiscard]] — 결과를 버리면 컴파일러가 경고한다. 값을 계산해 놓고 잊는 실수를 막는다.
[[nodiscard]] static long long parse_expr(Parser *p);

[[nodiscard]] static long long parse_factor(Parser *p) {
    switch (p->cur.kind) {
    case T_NUM: {
        long long v = p->cur.value;
        advance(p);
        return v;
    }
    case T_LPAREN: {
        advance(p);
        long long v = parse_expr(p);
        if (p->cur.kind != T_RPAREN) {
            fail(p, "expected ')'");
            return 0;
        }
        advance(p);
        return v;
    }
    case T_MINUS:
        advance(p);
        return -parse_factor(p);
    case T_PLUS:
        advance(p);
        return parse_factor(p);
    case T_END:
        fail(p, "unexpected end of input");
        return 0;
    default:
        fail(p, "unexpected token");
        return 0;
    }
}

[[nodiscard]] static long long parse_term(Parser *p) {
    long long left = parse_factor(p);
    while (p->cur.kind == T_STAR || p->cur.kind == T_SLASH || p->cur.kind == T_PERCENT) {
        // C23: auto — 초기화 식에서 타입을 추론한다. 여기서는 TokenKind.
        auto op = p->cur.kind;
        advance(p);
        long long right = parse_factor(p);
        if (p->error != nullptr) {
            return 0;
        }
        if (op == T_STAR) {
            left *= right;
        } else {
            if (right == 0) { // ---- Step 4: 에러 처리 ----
                fail(p, "division by zero");
                return 0;
            }
            left = (op == T_SLASH) ? left / right : left % right;
        }
    }
    return left;
}

[[nodiscard]] static long long parse_expr(Parser *p) {
    long long left = parse_term(p);
    while (p->cur.kind == T_PLUS || p->cur.kind == T_MINUS) {
        auto op = p->cur.kind;
        advance(p);
        long long right = parse_term(p);
        left = (op == T_PLUS) ? left + right : left - right;
    }
    return left;
}

// evaluate는 한 줄을 계산한다. 성공하면 true와 *out, 실패하면 false와 *err.
[[nodiscard]] static bool evaluate(const char *line, long long *out, const char **err) {
    Parser p = {.src = line, .pos = 0, .error = nullptr};
    advance(&p);
    long long v = parse_expr(&p);
    if (p.error == nullptr && p.cur.kind != T_END) {
        fail(&p, "trailing input"); // "1 2"처럼 식이 끝났는데 뭔가 남아 있다
    }
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

// ---- Step 5: REPL 루프 ----
int main(void) {
    char line[MAX_LINE];
    while (fgets(line, sizeof line, stdin) != nullptr) {
        if (is_blank(line)) {
            continue;
        }
        long long value = 0;
        const char *err = nullptr;
        if (evaluate(line, &value, &err)) {
            printf("%lld\n", value);
        } else {
            printf("error: %s\n", err);
        }
    }
    return 0;
}
