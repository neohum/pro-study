// 05-json — 재귀 하강 JSON 파서·직렬화기 (starter)
//
// 태그드 유니언으로 null, bool, number, string, array, object의 6가지 타입을 표현하고,
// 재귀 하강 파서로 JSON 문자열을 AST로 변환한 뒤, 직렬화(compact/pretty)하여 출력한다.
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum JsonType : unsigned char {
    JSON_NULL,
    JSON_BOOL,
    JSON_NUMBER,
    JSON_STRING,
    JSON_ARRAY,
    JSON_OBJECT,
} JsonType;

typedef struct JsonValue JsonValue;

typedef struct JsonMember {
    char *key;
    JsonValue *value;
} JsonMember;

// C23 익명 공용체(anonymous union)를 사용한 태그드 유니언 구조체
struct JsonValue {
    JsonType type;
    union {
        bool boolean;
        double number;
        char *string;
        struct {
            JsonValue **items;
            size_t len;
            size_t cap;
        } array;
        struct {
            JsonMember *items;
            size_t len;
            size_t cap;
        } object;
    };
};

// ---------------------------------------------------------------------------
// TODO(step-1): 태그드 유니언 자료구조와 메모리 관리
// json_new: JsonType에 따라 calloc으로 메모리를 할당한다.
// json_free: JsonType에 따라 문자열, 배열 원소, 객체 키/값을 재귀적으로 free한다.
// ---------------------------------------------------------------------------
static JsonValue *json_new(JsonType type) {
    JsonValue *v = calloc(1, sizeof *v);
    if (v != nullptr) {
        v->type = type;
    }
    return v;
}

static void json_free(JsonValue *v) {
    (void)v;
}

typedef struct Parser {
    const char *src;
    size_t pos;
    const char *error;
} Parser;

static void fail(Parser *p, const char *msg) {
    if (p->error == nullptr) {
        p->error = msg;
    }
}

static void skip_ws(Parser *p) {
    while (p->src[p->pos] != '\0' &&
           (p->src[p->pos] == ' ' || p->src[p->pos] == '\t' ||
            p->src[p->pos] == '\n' || p->src[p->pos] == '\r')) {
        p->pos++;
    }
}

// ---------------------------------------------------------------------------
// TODO(step-2): 원시 타입 파싱
// parse_null: "null" 토큰 검사
// parse_bool: "true", "false" 토큰 검사
// parse_number: 부호, 정수부, 소수부, 지수부를 포함하는 숫자를 strtod로 파싱
// parse_raw_string: 큰따옴표 사이의 문자열 및 이스케이프(\", \\, \n, \t, \uXXXX 등) 처리
// ---------------------------------------------------------------------------
static JsonValue *parse_null(Parser *p) {
    (void)p;
    return nullptr;
}

static JsonValue *parse_bool(Parser *p) {
    (void)p;
    return nullptr;
}

static JsonValue *parse_number(Parser *p) {
    (void)p;
    return nullptr;
}

static char *parse_raw_string(Parser *p) {
    (void)p;
    return nullptr;
}

// ---------------------------------------------------------------------------
// TODO(step-3): 복합 타입 파싱 (array, object) 및 에러 전파
// parse_array: '[' 로 시작하여 쉼표로 구분된 값들을 파싱하고 ']' 로 닫음 (후행 쉼표 금지)
// parse_object: '{' 로 시작하여 "key": value 쌍들을 파싱하고 '}' 로 닫음
// parse_value: 다음 문자를 보고 적절한 parse_* 함수를 호출하는 재귀 하강 분기점
// ---------------------------------------------------------------------------
static JsonValue *parse_value(Parser *p);

static JsonValue *parse_array(Parser *p) {
    (void)p;
    return nullptr;
}

static JsonValue *parse_object(Parser *p) {
    (void)p;
    return nullptr;
}

static JsonValue *parse_value(Parser *p) {
    (void)p;
    (void)parse_null(p);
    (void)parse_bool(p);
    (void)parse_number(p);
    (void)parse_raw_string(p);
    (void)parse_array(p);
    (void)parse_object(p);
    json_free(json_new(JSON_NULL));
    fail(p, "not implemented");
    return nullptr;
}

// ---------------------------------------------------------------------------
// TODO(step-4): JSON 직렬화기 (Stringify)
// AST를 순회하며 문자열 버퍼에 JSON 포맷으로 출력한다.
// pretty가 true이면 들여쓰기(2칸)와 개행을 넣고, false이면 공백 없는 컴팩트 형식으로 출력한다.
// ---------------------------------------------------------------------------
static char *json_stringify(const JsonValue *v, bool pretty) {
    (void)v;
    (void)pretty;
    return nullptr;
}

static char *read_all_stdin(void) {
    size_t cap = 1'024;
    size_t len = 0;
    char *buf = malloc(cap);
    if (buf == nullptr) return nullptr;
    int c;
    while ((c = fgetc(stdin)) != EOF) {
        if (len + 2 > cap) {
            cap *= 2;
            buf = realloc(buf, cap);
        }
        buf[len++] = (char)c;
    }
    buf[len] = '\0';
    return buf;
}

// ---------------------------------------------------------------------------
// TODO(step-5): CLI 인터페이스 및 입출력 통합
// -p/--pretty 옵션을 파싱하고 stdin에서 전체 입력을 읽어 파싱 후 직렬화하여 출력한다.
// 파싱 에러 발생 시 "error: <메시지>\n" 형식으로 출력한다.
// ---------------------------------------------------------------------------
int main(int argc, char **argv) {
    bool pretty = false;
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-p") == 0 || strcmp(argv[i], "--pretty") == 0) {
            pretty = true;
        }
    }

    char *src = read_all_stdin();
    if (src == nullptr) {
        printf("error: failed to read input\n");
        return 1;
    }

    Parser p = {.src = src, .pos = 0, .error = nullptr};
    JsonValue *root = parse_value(&p);
    if (root != nullptr && p.error == nullptr) {
        skip_ws(&p);
        if (p.src[p.pos] != '\0') {
            fail(&p, "trailing characters");
            json_free(root);
            root = nullptr;
        }
    }

    if (root == nullptr || p.error != nullptr) {
        printf("error: %s\n", p.error ? p.error : "parse failed");
        free(src);
        return 0;
    }

    char *out = json_stringify(root, pretty);
    if (out != nullptr) {
        printf("%s\n", out);
        free(out);
    }
    json_free(root);
    free(src);
    return 0;
}
