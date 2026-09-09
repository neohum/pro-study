// 02-dynarray — 제네릭 동적 배열·문자열 빌더 (solution)
//
// 표준 입력에서 한 줄에 명령 하나를 읽어 int 동적 배열과 문자열 빌더를 조작한다.
//   push 1 / push 2 / print   →  1 2
//   pop                       →  2
//   pop / pop                 →  1, error: empty
//   say hello / say world / line  →  hello world
//
// int 배열(IntArray)과 문자열 빌더(StrBuilder)는 **같은 매크로** DA(T)의 인스턴스다.
// 원소 타입이 달라도 da_push, da_insert, da_remove가 그대로 동작한다 — C23 typeof 덕분이다.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// C23: constexpr — #define과 달리 타입과 스코프가 있는 컴파일 시간 상수.
constexpr int MAX_LINE = 1'024;
constexpr size_t DA_INIT_CAP = 4; // 첫 push에서 4, 그 뒤로는 두 배씩 자란다

// ---- Step 1: 메모리 도우미와 구조체 ----
// realloc(nullptr, n)은 malloc(n)과 같다. 그래서 "처음 할당"과 "키우기"를 한 함수로 쓴다.
// 실패하면 여기서 끝낸다 — 호출하는 쪽마다 nullptr 검사를 반복하지 않기 위해서다.
static void *xrealloc(void *p, size_t n) {
    void *q = realloc(p, n);
    if (q == nullptr) { // C23: nullptr
        fprintf(stderr, "out of memory\n");
        exit(1);
    }
    return q;
}

// DA(T)는 "T를 담는 동적 배열" 구조체를 만든다. items가 힙 블록을 가리키고(소유하고),
// len은 쓰인 칸 수, cap은 할당된 칸 수다. 항상 len <= cap.
#define DA(T)                                                                                      \
    struct {                                                                                       \
        T *items;                                                                                  \
        size_t len, cap;                                                                           \
    }

// C23: typeof — 식의 타입을 그대로 타입 이름으로 쓴다. *(da)->items는 원소 하나이므로
// DA_ITEM(da)는 "이 배열의 원소 타입"이 된다. 매크로가 T를 몰라도 원소 타입의 변수를 만들 수 있다.
#define DA_ITEM(da) typeof(*(da)->items)

// 소유권: 배열을 만든 쪽이 da_free를 부른다. 해제 후에는 다시 빈 배열이다(재사용 가능).
#define da_free(da)                                                                                \
    do {                                                                                           \
        free((da)->items);                                                                         \
        (da)->items = nullptr;                                                                     \
        (da)->len = (da)->cap = 0;                                                                 \
    } while (0)

// ---- Step 2: push와 realloc 성장 ----
// need칸이 들어갈 만큼 cap을 키운다. 두 배씩 키우면 push n번의 복사 총량이 2n을 넘지 않는다
// (분할 상환 O(1)). sizeof *(da)->items로 원소 크기를 얻으므로 T를 몰라도 된다.
#define da_reserve(da, need)                                                                       \
    do {                                                                                           \
        if ((need) > (da)->cap) {                                                                  \
            size_t da_cap_ = (da)->cap ? (da)->cap : DA_INIT_CAP;                                  \
            while (da_cap_ < (need)) {                                                             \
                da_cap_ *= 2;                                                                      \
            }                                                                                      \
            (da)->items = xrealloc((da)->items, da_cap_ * sizeof *(da)->items);                    \
            (da)->cap = da_cap_;                                                                   \
        }                                                                                          \
    } while (0)

// ---- Step 4: typeof 기반 제네릭 매크로 ----
// item을 먼저 원소 타입의 임시 변수에 복사한 뒤 reserve한다. 순서가 중요하다:
// da_push(&a, a.items[0])처럼 item이 배열 자신을 참조하면, realloc 뒤에 옛 items를 읽어
// 해제된 메모리를 만지게 된다. typeof 없이는 이 임시 변수를 만들 수 없었다.
#define da_push(da, item)                                                                          \
    do {                                                                                           \
        DA_ITEM(da) da_tmp_ = (item);                                                              \
        da_reserve((da), (da)->len + 1);                                                           \
        (da)->items[(da)->len++] = da_tmp_;                                                        \
    } while (0)

// 마지막 원소를 꺼낸다. 식 매크로이므로 값으로 쓸 수 있다. 전제: len > 0.
#define da_pop(da) ((da)->items[--(da)->len])

// ---- Step 3: insert/remove와 memmove ----
// idx 뒤 원소들을 한 칸 밀고 빈자리에 넣는다. 겹치는 구간을 옮기므로 memcpy가 아니라 memmove다.
// 전제: idx <= len (idx == len이면 push와 같다).
#define da_insert(da, idx, item)                                                                   \
    do {                                                                                           \
        DA_ITEM(da) da_tmp_ = (item);                                                              \
        size_t da_i_ = (idx);                                                                      \
        da_reserve((da), (da)->len + 1);                                                           \
        memmove((da)->items + da_i_ + 1, (da)->items + da_i_,                                      \
                ((da)->len - da_i_) * sizeof *(da)->items);                                        \
        (da)->items[da_i_] = da_tmp_;                                                              \
        (da)->len++;                                                                               \
    } while (0)

// idx 뒤 원소들을 한 칸 당긴다. 전제: idx < len. 값이 필요하면 호출 전에 읽어 둔다.
#define da_remove(da, idx)                                                                         \
    do {                                                                                           \
        size_t da_i_ = (idx);                                                                      \
        memmove((da)->items + da_i_, (da)->items + da_i_ + 1,                                      \
                ((da)->len - da_i_ - 1) * sizeof *(da)->items);                                    \
        (da)->len--;                                                                               \
    } while (0)

// 순회. 반복 변수 it의 타입 "원소 포인터"를 typeof로 얻는다 — 이것도 typeof 없이는 못 쓴다.
// items가 nullptr일 때 len은 0이므로 루프는 한 번도 돌지 않는다.
#define da_foreach(it, da)                                                                         \
    for (typeof((da)->items) it = (da)->items; it < (da)->items + (da)->len; it++)

// 같은 매크로에서 두 종류의 배열이 나온다. 이름을 붙여 두어야 함수 인자로 넘길 수 있다
// (DA(int)를 두 번 쓰면 서로 다른 무명 구조체 타입이 된다).
typedef DA(int) IntArray;
typedef DA(char) StrBuilder;

// ---- Step 5: 문자열 빌더와 _Generic ----
static void sb_append(StrBuilder *sb, const char *s) {
    for (; *s; s++) {
        da_push(sb, *s);
    }
}

// C 문자열로 보기 위해 '\0'을 하나 밀어 넣고 len은 되돌린다. 종결자는 len 밖 cap 안에 산다.
static const char *sb_cstr(StrBuilder *sb) {
    da_push(sb, '\0');
    sb->len--;
    return sb->items;
}

static void print_int(int v) { printf("%d\n", v); }
static void print_llong(long long v) { printf("%lld\n", v); }
static void print_str(const char *s) { printf("%s\n", s); }
// C23: [[maybe_unused]] — 이 프로그램에서는 double을 출력할 일이 없어 선택되지 않는 분기다.
// gcc는 조용하지만 clang처럼 선택되지 않은 _Generic 분기를 "미사용"으로 보는 컴파일러가 있다.
[[maybe_unused]] static void print_double(double v) { printf("%g\n", v); }

// C11 _Generic: 인자의 타입으로 함수를 고른다. 매칭되는 타입이 없으면 컴파일 에러다.
// char *와 const char *는 서로 다른 타입이므로 둘 다 적어야 한다.
#define print_value(x)                                                                             \
    _Generic((x),                                                                                  \
        int: print_int,                                                                            \
        long long: print_llong,                                                                    \
        double: print_double,                                                                      \
        char *: print_str,                                                                         \
        const char *: print_str)(x)

// ---- 명령 처리 ----
// C23: [[nodiscard]] — 파싱 성공 여부를 무시하면 경고가 난다.
[[nodiscard]] static bool parse_long(const char *s, long *out) {
    if (s == nullptr) {
        return false;
    }
    char *end = nullptr;
    long v = strtol(s, &end, 10);
    if (end == s || *end != '\0') {
        return false;
    }
    *out = v;
    return true;
}

// 인덱스 인자를 읽어 0 <= i < limit 인지 검사한다. limit은 get/remove면 len, insert면 len + 1.
[[nodiscard]] static bool parse_index(const char *s, size_t limit, size_t *out) {
    long v = 0;
    if (!parse_long(s, &v)) {
        printf("error: bad argument\n");
        return false;
    }
    if (v < 0 || (size_t)v >= limit) {
        printf("error: index out of range\n");
        return false;
    }
    *out = (size_t)v;
    return true;
}

static void run_command(IntArray *arr, StrBuilder *sb, const char *cmd, const char *a1,
                        const char *a2) {
    long n = 0;
    size_t i = 0;
    if (strcmp(cmd, "push") == 0) {
        if (!parse_long(a1, &n)) {
            printf("error: bad argument\n");
            return;
        }
        da_push(arr, (int)n);
    } else if (strcmp(cmd, "pop") == 0) {
        if (arr->len == 0) {
            printf("error: empty\n");
            return;
        }
        int v = da_pop(arr);
        print_value(v);
    } else if (strcmp(cmd, "insert") == 0) {
        if (!parse_long(a2, &n)) {
            printf("error: bad argument\n");
            return;
        }
        if (!parse_index(a1, arr->len + 1, &i)) {
            return;
        }
        da_insert(arr, i, (int)n);
    } else if (strcmp(cmd, "remove") == 0) {
        if (!parse_index(a1, arr->len, &i)) {
            return;
        }
        int v = arr->items[i];
        da_remove(arr, i);
        print_value(v);
    } else if (strcmp(cmd, "get") == 0) {
        if (!parse_index(a1, arr->len, &i)) {
            return;
        }
        auto v = arr->items[i]; // C23: auto — 원소 타입(int)으로 추론
        print_value(v);
    } else if (strcmp(cmd, "len") == 0) {
        printf("%zu\n", arr->len);
    } else if (strcmp(cmd, "cap") == 0) {
        printf("%zu\n", arr->cap);
    } else if (strcmp(cmd, "print") == 0) {
        if (arr->len == 0) {
            printf("[]\n");
            return;
        }
        da_foreach(it, arr) {
            printf(it == arr->items ? "%d" : " %d", *it);
        }
        printf("\n");
    } else if (strcmp(cmd, "sum") == 0) {
        long long sum = 0;
        da_foreach(it, arr) {
            sum += *it;
        }
        print_value(sum);
    } else if (strcmp(cmd, "say") == 0) {
        if (a1 == nullptr) {
            printf("error: bad argument\n");
            return;
        }
        if (sb->len > 0) {
            da_push(sb, ' ');
        }
        sb_append(sb, a1);
    } else if (strcmp(cmd, "line") == 0) {
        print_value(sb_cstr(sb));
        sb->len = 0; // 비우기: 메모리는 그대로 두고 다음 문장에 재사용한다
    } else {
        printf("error: unknown command '%s'\n", cmd);
    }
}

int main(void) {
    IntArray arr = {};  // C23: 빈 초기화자 {} — 모든 멤버를 0/nullptr로
    StrBuilder sb = {}; // 두 배열 모두 여기서 만들었으니 여기서 해제한다
    char line[MAX_LINE];
    while (fgets(line, sizeof line, stdin) != nullptr) {
        char cmd[32] = "", a1[64] = "", a2[64] = "";
        int n = sscanf(line, "%31s %63s %63s", cmd, a1, a2);
        if (n < 1) {
            continue; // 빈 줄
        }
        run_command(&arr, &sb, cmd, n >= 2 ? a1 : nullptr, n >= 3 ? a2 : nullptr);
    }
    da_free(&arr);
    da_free(&sb);
    return 0;
}
