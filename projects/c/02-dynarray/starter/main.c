// 02-dynarray — 제네릭 동적 배열·문자열 빌더 (starter)
//
// 표준 입력에서 한 줄에 명령 하나를 읽어 int 동적 배열과 문자열 빌더를 조작한다.
//   push 1 / push 2 / print   →  1 2
//   pop                       →  2
//   say hello / say world / line  →  hello world
//
// 명령: push N, pop, insert I N, remove I, get I, len, cap, print, sum, say WORD, line
//
// int 배열(IntArray)과 문자열 빌더(StrBuilder)는 **같은 매크로** DA(T)의 인스턴스다.
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// C23: constexpr — #define과 달리 타입과 스코프가 있는 컴파일 시간 상수.
constexpr int MAX_LINE = 1'024;
constexpr size_t DA_INIT_CAP = 4; // 첫 push에서 4, 그 뒤로는 두 배씩 자란다

// ---------------------------------------------------------------------------
// TODO(step-1): 메모리 도우미와 구조체
// xrealloc: realloc을 부르고, nullptr이 돌아오면 stderr에 "out of memory"를 찍고 exit(1).
// realloc(nullptr, n)은 malloc(n)과 같으므로 "처음 할당"과 "키우기"를 한 함수로 쓴다.
// ---------------------------------------------------------------------------
static void *xrealloc(void *p, size_t n) {
    (void)p;
    (void)n;
    return nullptr; // TODO(step-1)
}

// DA(T)는 "T를 담는 동적 배열" 구조체를 만든다. items가 힙 블록을 가리키고(소유하고),
// len은 쓰인 칸 수, cap은 할당된 칸 수다. 항상 len <= cap.
#define DA(T)                                                                                      \
    struct {                                                                                       \
        T *items;                                                                                  \
        size_t len, cap;                                                                           \
    }

// TODO(step-4): DA_ITEM(da) — typeof(*(da)->items) 로 "이 배열의 원소 타입"을 얻는 매크로.
//   #define DA_ITEM(da) typeof(*(da)->items)

// TODO(step-1): items를 free하고 items = nullptr, len = cap = 0 으로 되돌린다.
// 소유권: 배열을 만든 쪽(main)이 da_free를 부른다.
#define da_free(da)                                                                                \
    do {                                                                                           \
        (void)(da);                                                                                \
    } while (0)

// ---------------------------------------------------------------------------
// TODO(step-2): push와 realloc 성장
// da_reserve(da, need): need > cap 이면 cap을 키운다. cap이 0이면 DA_INIT_CAP에서 시작하고,
//   need를 담을 때까지 두 배씩. 원소 크기는 sizeof *(da)->items 로 얻는다 (T를 몰라도 된다).
// da_push(da, item): reserve(len + 1) 후 items[len++] = item.
// da_pop(da): 식 매크로. items[--len] 을 돌려준다 (전제: len > 0).
// ---------------------------------------------------------------------------
#define da_reserve(da, need)                                                                       \
    do {                                                                                           \
        (void)(da);                                                                                \
        (void)(need);                                                                              \
    } while (0)

// TODO(step-4): item을 먼저 DA_ITEM(da) 타입의 임시 변수에 복사한 뒤 reserve한다.
//   da_push(&a, a.items[0]) 처럼 item이 배열 자신을 참조하면 realloc 뒤에 옛 items를 읽게 된다.
#define da_push(da, item)                                                                          \
    do {                                                                                           \
        (void)(da);                                                                                \
        (void)(item);                                                                              \
        printf("error: not implemented\n");                                                        \
    } while (0)

#define da_pop(da) ((void)(da), 0)

// ---------------------------------------------------------------------------
// TODO(step-3): insert/remove와 memmove
// da_insert(da, idx, item): reserve(len + 1) → items[idx..len)을 한 칸 뒤로 memmove →
//   items[idx] = item → len++. 전제: idx <= len.
// da_remove(da, idx): items[idx+1..len)을 한 칸 앞으로 memmove → len--. 전제: idx < len.
// 겹치는 구간을 옮기므로 memcpy가 아니라 memmove다.
// ---------------------------------------------------------------------------
#define da_insert(da, idx, item)                                                                   \
    do {                                                                                           \
        (void)(da);                                                                                \
        (void)(idx);                                                                               \
        (void)(item);                                                                              \
        printf("error: not implemented\n");                                                        \
    } while (0)

#define da_remove(da, idx)                                                                         \
    do {                                                                                           \
        (void)(da);                                                                                \
        (void)(idx);                                                                               \
    } while (0)

// TODO(step-4): da_foreach(it, da) — for (typeof((da)->items) it = (da)->items; it < ...; it++)
//   반복 변수의 타입 "원소 포인터"를 typeof로 얻는다. print와 sum의 루프를 이것으로 바꾼다.

// 같은 매크로에서 두 종류의 배열이 나온다. 이름을 붙여 두어야 함수 인자로 넘길 수 있다
// (DA(int)를 두 번 쓰면 서로 다른 무명 구조체 타입이 된다).
typedef DA(int) IntArray;
typedef DA(char) StrBuilder;

// ---------------------------------------------------------------------------
// TODO(step-5): 문자열 빌더
// sb_append: s의 문자를 하나씩 da_push한다 — int 배열에 쓴 매크로가 char에도 그대로 통한다.
// sb_cstr: '\0'을 하나 push한 뒤 len을 하나 줄이고 items를 돌려준다 (종결자는 len 밖 cap 안).
// ---------------------------------------------------------------------------
static void sb_append(StrBuilder *sb, const char *s) {
    (void)sb;
    (void)s;
}

static const char *sb_cstr(StrBuilder *sb) {
    (void)sb;
    return "";
}

// C23: [[maybe_unused]] — print_value가 아직 이 함수들을 고르지 않으므로 경고를 막아 둔다.
// Step 2에서 _Generic에 연결하면 지워도 된다 (print_double은 끝까지 선택되지 않으니 남겨 둔다).
[[maybe_unused]] static void print_int(int v) { printf("%d\n", v); }
[[maybe_unused]] static void print_llong(long long v) { printf("%lld\n", v); }
[[maybe_unused]] static void print_str(const char *s) { printf("%s\n", s); }
[[maybe_unused]] static void print_double(double v) { printf("%g\n", v); }

// TODO(step-2): _Generic((x), int: print_int, long long: print_llong, double: print_double)(x)
// TODO(step-5): char *: print_str, const char *: print_str 분기를 추가한다 (둘은 다른 타입이다).
#define print_value(x) ((void)(x), printf("error: not implemented\n"))

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
        da_push(arr, (int)n); // TODO(step-2): da_push를 구현하면 동작한다
    } else if (strcmp(cmd, "pop") == 0) {
        // TODO(step-2): len == 0 이면 "error: empty". 아니면 int v = da_pop(arr); print_value(v);
        printf("error: not implemented\n");
    } else if (strcmp(cmd, "insert") == 0) {
        if (!parse_long(a2, &n)) {
            printf("error: bad argument\n");
            return;
        }
        if (!parse_index(a1, arr->len + 1, &i)) {
            return;
        }
        da_insert(arr, i, (int)n); // TODO(step-3): da_insert를 구현하면 동작한다
    } else if (strcmp(cmd, "remove") == 0) {
        if (!parse_index(a1, arr->len, &i)) {
            return;
        }
        // TODO(step-3): 값을 먼저 읽어 두고 da_remove한 뒤 print_value로 출력한다
        printf("error: not implemented\n");
    } else if (strcmp(cmd, "get") == 0) {
        if (!parse_index(a1, arr->len, &i)) {
            return;
        }
        // TODO(step-2): auto v = arr->items[i]; print_value(v);
        printf("error: not implemented\n");
    } else if (strcmp(cmd, "len") == 0) {
        printf("%zu\n", arr->len);
    } else if (strcmp(cmd, "cap") == 0) {
        printf("%zu\n", arr->cap);
    } else if (strcmp(cmd, "print") == 0) {
        // TODO(step-1): len == 0 이면 "[]". 아니면 공백으로 구분해 한 줄에 출력한다.
        // TODO(step-4): 인덱스 루프를 da_foreach로 바꾼다.
        printf("error: not implemented\n");
    } else if (strcmp(cmd, "sum") == 0) {
        // TODO(step-2): long long sum에 모두 더해 print_value(sum). 빈 배열이면 0.
        // TODO(step-4): 인덱스 루프를 da_foreach로 바꾼다.
        printf("error: not implemented\n");
    } else if (strcmp(cmd, "say") == 0) {
        if (a1 == nullptr) {
            printf("error: bad argument\n");
            return;
        }
        // TODO(step-5): 빌더가 비어 있지 않으면 ' '를 먼저 push하고 sb_append(sb, a1)
        (void)sb_append;
        printf("error: not implemented\n");
    } else if (strcmp(cmd, "line") == 0) {
        // TODO(step-5): print_value(sb_cstr(sb)) 후 sb->len = 0 (메모리는 재사용)
        (void)sb_cstr;
        printf("error: not implemented\n");
    } else {
        printf("error: unknown command '%s'\n", cmd);
    }
    (void)i;
    (void)sb;
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
    (void)xrealloc;
    (void)DA_INIT_CAP;
    return 0;
}
