// 05-json — 재귀 하강 JSON 파서·직렬화기 (solution)
//
// 태그드 유니언으로 null, bool, number, string, array, object의 6가지 타입을 표현하고,
// 재귀 하강 파서로 JSON 문자열을 AST로 변환한 뒤, 직렬화(compact/pretty)하여 출력한다.
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

// ---- Step 1: 메모리 관리 (생성 및 재귀 해제) ----
static JsonValue *json_new(JsonType type) {
    JsonValue *v = calloc(1, sizeof *v);
    if (v != nullptr) {
        v->type = type;
    }
    return v;
}

static void json_free(JsonValue *v) {
    if (v == nullptr) {
        return;
    }
    switch (v->type) {
    case JSON_STRING:
        free(v->string);
        break;
    case JSON_ARRAY:
        for (size_t i = 0; i < v->array.len; i++) {
            json_free(v->array.items[i]);
        }
        free(v->array.items);
        break;
    case JSON_OBJECT:
        for (size_t i = 0; i < v->object.len; i++) {
            free(v->object.items[i].key);
            json_free(v->object.items[i].value);
        }
        free(v->object.items);
        break;
    default:
        break;
    }
    free(v);
}

// ---- Step 2 & 3: 재귀 하강 파서 ----
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

static JsonValue *parse_value(Parser *p);

// Step 2: 원시 타입 파싱
static JsonValue *parse_null(Parser *p) {
    if (strncmp(p->src + p->pos, "null", 4) == 0) {
        p->pos += 4;
        return json_new(JSON_NULL);
    }
    fail(p, "expected 'null'");
    return nullptr;
}

static JsonValue *parse_bool(Parser *p) {
    if (strncmp(p->src + p->pos, "true", 4) == 0) {
        p->pos += 4;
        JsonValue *v = json_new(JSON_BOOL);
        if (v != nullptr) {
            v->boolean = true;
        }
        return v;
    }
    if (strncmp(p->src + p->pos, "false", 5) == 0) {
        p->pos += 5;
        JsonValue *v = json_new(JSON_BOOL);
        if (v != nullptr) {
            v->boolean = false;
        }
        return v;
    }
    fail(p, "expected 'true' or 'false'");
    return nullptr;
}

static char *parse_raw_string(Parser *p) {
    if (p->src[p->pos] != '"') {
        fail(p, "expected '\"'");
        return nullptr;
    }
    p->pos++;
    size_t cap = 32;
    size_t len = 0;
    char *buf = malloc(cap);
    if (buf == nullptr) {
        return nullptr;
    }

    while (p->src[p->pos] != '\0' && p->src[p->pos] != '"') {
        char c = p->src[p->pos++];
        if (c == '\\') {
            char esc = p->src[p->pos++];
            switch (esc) {
            case '"': c = '"'; break;
            case '\\': c = '\\'; break;
            case '/': c = '/'; break;
            case 'b': c = '\b'; break;
            case 'f': c = '\f'; break;
            case 'n': c = '\n'; break;
            case 'r': c = '\r'; break;
            case 't': c = '\t'; break;
            case 'u': {
                unsigned int cp = 0;
                for (int i = 0; i < 4; i++) {
                    char h = p->src[p->pos++];
                    cp <<= 4;
                    if (h >= '0' && h <= '9') cp |= (h - '0');
                    else if (h >= 'a' && h <= 'f') cp |= (h - 'a' + 10);
                    else if (h >= 'A' && h <= 'F') cp |= (h - 'A' + 10);
                    else {
                        fail(p, "bad unicode escape");
                        free(buf);
                        return nullptr;
                    }
                }
                if (cp < 0x80) {
                    c = (char)cp;
                } else {
                    if (len + 4 >= cap) {
                        cap *= 2;
                        buf = realloc(buf, cap);
                    }
                    if (cp < 0x800) {
                        buf[len++] = (char)(0xC0 | (cp >> 6));
                        buf[len++] = (char)(0x80 | (cp & 0x3F));
                    } else {
                        buf[len++] = (char)(0xE0 | (cp >> 12));
                        buf[len++] = (char)(0x80 | ((cp >> 6) & 0x3F));
                        buf[len++] = (char)(0x80 | (cp & 0x3F));
                    }
                    continue;
                }
                break;
            }
            default:
                fail(p, "invalid escape sequence");
                free(buf);
                return nullptr;
            }
        }
        if (len + 2 >= cap) {
            cap *= 2;
            buf = realloc(buf, cap);
        }
        buf[len++] = c;
    }

    if (p->src[p->pos] != '"') {
        fail(p, "unterminated string");
        free(buf);
        return nullptr;
    }
    p->pos++;
    buf[len] = '\0';
    return buf;
}

static JsonValue *parse_number(Parser *p) {
    const char *start = p->src + p->pos;
    char *end = nullptr;
    double val = strtod(start, &end);
    if (end == start) {
        fail(p, "invalid number");
        return nullptr;
    }
    p->pos = (size_t)(end - p->src);
    JsonValue *v = json_new(JSON_NUMBER);
    if (v != nullptr) {
        v->number = val;
    }
    return v;
}

// Step 3: 복합 타입 파싱 (array, object)
static JsonValue *parse_array(Parser *p) {
    if (p->src[p->pos] != '[') {
        fail(p, "expected '['");
        return nullptr;
    }
    p->pos++;
    JsonValue *arr = json_new(JSON_ARRAY);
    skip_ws(p);
    if (p->src[p->pos] == ']') {
        p->pos++;
        return arr;
    }
    for (;;) {
        skip_ws(p);
        JsonValue *elem = parse_value(p);
        if (elem == nullptr || p->error != nullptr) {
            json_free(arr);
            return nullptr;
        }
        if (arr->array.len + 1 > arr->array.cap) {
            size_t ncap = arr->array.cap ? arr->array.cap * 2 : 4;
            arr->array.items = realloc(arr->array.items, ncap * sizeof *arr->array.items);
            arr->array.cap = ncap;
        }
        arr->array.items[arr->array.len++] = elem;

        skip_ws(p);
        if (p->src[p->pos] == ',') {
            p->pos++;
            skip_ws(p);
            if (p->src[p->pos] == ']') {
                fail(p, "trailing comma not allowed");
                json_free(arr);
                return nullptr;
            }
        } else if (p->src[p->pos] == ']') {
            p->pos++;
            break;
        } else {
            fail(p, "expected ',' or ']'");
            json_free(arr);
            return nullptr;
        }
    }
    return arr;
}

static JsonValue *parse_object(Parser *p) {
    if (p->src[p->pos] != '{') {
        fail(p, "expected '{'");
        return nullptr;
    }
    p->pos++;
    JsonValue *obj = json_new(JSON_OBJECT);
    skip_ws(p);
    if (p->src[p->pos] == '}') {
        p->pos++;
        return obj;
    }
    for (;;) {
        skip_ws(p);
        if (p->src[p->pos] != '"') {
            fail(p, "expected string key");
            json_free(obj);
            return nullptr;
        }
        char *key = parse_raw_string(p);
        if (key == nullptr || p->error != nullptr) {
            json_free(obj);
            return nullptr;
        }
        skip_ws(p);
        if (p->src[p->pos] != ':') {
            fail(p, "expected ':' after key");
            free(key);
            json_free(obj);
            return nullptr;
        }
        p->pos++;
        skip_ws(p);
        JsonValue *val = parse_value(p);
        if (val == nullptr || p->error != nullptr) {
            free(key);
            json_free(obj);
            return nullptr;
        }
        if (obj->object.len + 1 > obj->object.cap) {
            size_t ncap = obj->object.cap ? obj->object.cap * 2 : 4;
            obj->object.items = realloc(obj->object.items, ncap * sizeof *obj->object.items);
            obj->object.cap = ncap;
        }
        obj->object.items[obj->object.len++] = (JsonMember){.key = key, .value = val};

        skip_ws(p);
        if (p->src[p->pos] == ',') {
            p->pos++;
            skip_ws(p);
            if (p->src[p->pos] == '}') {
                fail(p, "trailing comma not allowed");
                json_free(obj);
                return nullptr;
            }
        } else if (p->src[p->pos] == '}') {
            p->pos++;
            break;
        } else {
            fail(p, "expected ',' or '}'");
            json_free(obj);
            return nullptr;
        }
    }
    return obj;
}

static JsonValue *parse_value(Parser *p) {
    skip_ws(p);
    char c = p->src[p->pos];
    if (c == 'n') return parse_null(p);
    if (c == 't' || c == 'f') return parse_bool(p);
    if (c == '"') {
        char *s = parse_raw_string(p);
        if (s == nullptr) return nullptr;
        JsonValue *v = json_new(JSON_STRING);
        if (v != nullptr) v->string = s;
        return v;
    }
    if (c == '[') return parse_array(p);
    if (c == '{') return parse_object(p);
    if (c == '-' || (c >= '0' && c <= '9')) return parse_number(p);
    fail(p, "unexpected character");
    return nullptr;
}

// ---- Step 4: JSON 직렬화기 (Stringify) ----
typedef struct StrBuf {
    char *data;
    size_t len;
    size_t cap;
} StrBuf;

static void buf_putc(StrBuf *b, char c) {
    if (b->len + 2 > b->cap) {
        size_t ncap = b->cap ? b->cap * 2 : 64;
        b->data = realloc(b->data, ncap);
        b->cap = ncap;
    }
    b->data[b->len++] = c;
    b->data[b->len] = '\0';
}

static void buf_puts(StrBuf *b, const char *s) {
    size_t slen = strlen(s);
    if (b->len + slen + 1 > b->cap) {
        size_t ncap = b->cap ? b->cap * 2 : 64;
        while (ncap < b->len + slen + 1) ncap *= 2;
        b->data = realloc(b->data, ncap);
        b->cap = ncap;
    }
    memcpy(b->data + b->len, s, slen);
    b->len += slen;
    b->data[b->len] = '\0';
}

static void stringify_string(StrBuf *b, const char *s) {
    buf_putc(b, '"');
    for (; *s; s++) {
        switch (*s) {
        case '"': buf_puts(b, "\\\""); break;
        case '\\': buf_puts(b, "\\\\"); break;
        case '\b': buf_puts(b, "\\b"); break;
        case '\f': buf_puts(b, "\\f"); break;
        case '\n': buf_puts(b, "\\n"); break;
        case '\r': buf_puts(b, "\\r"); break;
        case '\t': buf_puts(b, "\\t"); break;
        default:
            if ((unsigned char)*s < 0x20) {
                char tmp[8];
                snprintf(tmp, sizeof tmp, "\\u%04x", (unsigned char)*s);
                buf_puts(b, tmp);
            } else {
                buf_putc(b, *s);
            }
            break;
        }
    }
    buf_putc(b, '"');
}

static void indent(StrBuf *b, int level) {
    buf_putc(b, '\n');
    for (int i = 0; i < level * 2; i++) {
        buf_putc(b, ' ');
    }
}

static void stringify_value(StrBuf *b, const JsonValue *v, bool pretty, int depth) {
    if (v == nullptr) {
        buf_puts(b, "null");
        return;
    }
    char tmp[64];
    switch (v->type) {
    case JSON_NULL:
        buf_puts(b, "null");
        break;
    case JSON_BOOL:
        buf_puts(b, v->boolean ? "true" : "false");
        break;
    case JSON_NUMBER:
        if (v->number == (double)(long long)v->number && fabs(v->number) < 1e15) {
            snprintf(tmp, sizeof tmp, "%lld", (long long)v->number);
        } else {
            snprintf(tmp, sizeof tmp, "%g", v->number);
        }
        buf_puts(b, tmp);
        break;
    case JSON_STRING:
        stringify_string(b, v->string);
        break;
    case JSON_ARRAY:
        if (v->array.len == 0) {
            buf_puts(b, "[]");
        } else {
            buf_putc(b, '[');
            for (size_t i = 0; i < v->array.len; i++) {
                if (pretty) indent(b, depth + 1);
                stringify_value(b, v->array.items[i], pretty, depth + 1);
                if (i + 1 < v->array.len) buf_putc(b, ',');
            }
            if (pretty) indent(b, depth);
            buf_putc(b, ']');
        }
        break;
    case JSON_OBJECT:
        if (v->object.len == 0) {
            buf_puts(b, "{}");
        } else {
            buf_putc(b, '{');
            for (size_t i = 0; i < v->object.len; i++) {
                if (pretty) indent(b, depth + 1);
                stringify_string(b, v->object.items[i].key);
                buf_puts(b, pretty ? ": " : ":");
                stringify_value(b, v->object.items[i].value, pretty, depth + 1);
                if (i + 1 < v->object.len) buf_putc(b, ',');
            }
            if (pretty) indent(b, depth);
            buf_putc(b, '}');
        }
        break;
    }
}

static char *json_stringify(const JsonValue *v, bool pretty) {
    StrBuf b = {};
    stringify_value(&b, v, pretty, 0);
    return b.data;
}

// ---- Step 5: CLI 입력 읽기 및 메인 함수 ----
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
