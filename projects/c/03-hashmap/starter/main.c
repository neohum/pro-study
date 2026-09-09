// 03-hashmap — 오픈 어드레싱 해시맵 (starter)
//
// FNV-1a 해시, 선형 탐사(linear probing), 툼스톤 삭제, 동적 리사이즈를 구현하는
// 문자열 키 → int64_t 값 해시맵 CLI 명령 처리기다.
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <errno.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

constexpr int MAX_LINE = 1'024;
constexpr size_t INITIAL_CAP = 16;

typedef enum SlotState : unsigned char {
    S_EMPTY,
    S_USED,
    S_DEAD, // 툼스톤: 삭제된 자리 (탐사 중단 방지)
} SlotState;

typedef struct Slot {
    char *key;
    int64_t value;
    SlotState state;
} Slot;

typedef struct Map {
    Slot *slots;
    size_t cap;  // 항상 2의 거듭제곱 (인덱스 = hash & (cap - 1))
    size_t used; // S_USED 개수
    size_t dead; // S_DEAD 개수
} Map;

// MinGW gcc의 C23 모드에서 strdup 누락 대비
[[maybe_unused]] static char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != nullptr) {
        memcpy(p, s, n);
    }
    return p;
}

[[nodiscard]] static Map *map_new(void) {
    Map *m = calloc(1, sizeof *m);
    if (m == nullptr) {
        return nullptr;
    }
    m->slots = calloc(INITIAL_CAP, sizeof *m->slots);
    if (m->slots == nullptr) {
        free(m);
        return nullptr;
    }
    m->cap = INITIAL_CAP;
    return m;
}

static void map_free(Map *m) {
    if (m == nullptr) {
        return;
    }
    for (size_t i = 0; i < m->cap; i++) {
        if (m->slots[i].state == S_USED) {
            free(m->slots[i].key);
        }
    }
    free(m->slots);
    free(m);
}

// ---------------------------------------------------------------------------
// TODO(step-1): FNV-1a 해시 함수
// 문자열 s의 각 바이트를 순회하며 64비트 FNV-1a 해시를 계산한다.
// 초기값(offset basis): 0xcbf29ce484222325ULL
// 소수(prime): 0x100000001b3ULL
// 각 바이트마다: h = (h ^ byte) * prime
// ---------------------------------------------------------------------------
static uint64_t hash_str(const char *s) {
    (void)s;
    return 0;
}

// ---------------------------------------------------------------------------
// TODO(step-2): 선형 탐사와 슬롯 탐색
// hash_str(key) & (m->cap - 1)에서 시작해 빈 슬롯(S_EMPTY)이 나올 때까지 (i + 1) & (m->cap - 1)로 순회한다.
// S_DEAD를 만나면 first_dead가 가리키는 곳에 첫 툼스톤 위치를 기록해 재활용할 수 있게 한다.
// key가 일치하는 S_USED 슬롯을 찾으면 즉시 해당 슬롯을 반환한다.
// ---------------------------------------------------------------------------
static Slot *find_slot(const Map *m, const char *key, Slot **first_dead) {
    (void)m;
    (void)key;
    (void)first_dead;
    return nullptr;
}

// ---------------------------------------------------------------------------
// TODO(step-3): 삽입(set)과 조회(get)
// map_set: find_slot으로 자리를 찾아 새 키를 dup_str로 복사해 저장하거나 기존 값을 갱신한다.
// map_get: find_slot으로 키를 찾아 S_USED 상태이면 *out에 값을 복사하고 true를 반환한다.
// ---------------------------------------------------------------------------
[[nodiscard]] static bool map_set(Map *m, const char *key, int64_t value) {
    (void)m;
    (void)key;
    (void)value;
    return false;
}

[[nodiscard]] static bool map_get(const Map *m, const char *key, int64_t *out) {
    (void)m;
    (void)key;
    (void)out;
    return false;
}

// ---------------------------------------------------------------------------
// TODO(step-4): 툼스톤 삭제(del)와 동적 리사이즈(rehash)
// rehash: 새 용량의 slots를 calloc하고 기존 S_USED 슬롯들을 새 테이블로 다시 삽입(재해시)한다.
// map_del: 키를 찾아 S_DEAD 상태(툼스톤)로 변경하고 키 문자열을 free한다.
// ---------------------------------------------------------------------------
static bool rehash(Map *m, size_t new_cap) {
    (void)m;
    (void)new_cap;
    return false;
}

static bool map_del(Map *m, const char *key) {
    (void)m;
    (void)key;
    return false;
}

[[nodiscard]] static size_t map_len(const Map *m) {
    return m->used;
}

[[nodiscard]] static size_t map_cap(const Map *m) {
    return m->cap;
}

static bool parse_int64(const char *s, int64_t *out) {
    if (s == nullptr || *s == '\0') {
        return false;
    }
    char *end = nullptr;
    errno = 0;
    long long v = strtoll(s, &end, 10);
    if (errno != 0 || *end != '\0' || end == s) {
        return false;
    }
    *out = (int64_t)v;
    return true;
}

// ---------------------------------------------------------------------------
// TODO(step-5): 명령 처리기 REPL
// set, get, del, len, cap 명령을 파싱하고 적절한 함수를 호출한다.
// 인자 개수나 포맷이 잘못되면 "error: bad argument\n",
// 키가 없으면 "error: not found\n", 알 수 없는 명령은 "error: unknown command '<cmd>'\n"을 출력한다.
// ---------------------------------------------------------------------------
static void run_command(Map *m, const char *cmd, const char *a1, const char *a2, int token_count) {
    (void)m;
    (void)cmd;
    (void)a1;
    (void)a2;
    (void)token_count;
    printf("error: not implemented\n");
}

int main(void) {
    Map *m = map_new();
    if (m == nullptr) {
        fprintf(stderr, "out of memory\n");
        return 1;
    }
    (void)hash_str("");
    (void)find_slot(m, "", nullptr);
    (void)map_set(m, "", 0);
    int64_t dummy = 0;
    (void)map_get(m, "", &dummy);
    (void)rehash(m, INITIAL_CAP);
    (void)map_del(m, "");
    (void)map_len(m);
    (void)map_cap(m);
    (void)parse_int64("", &dummy);

    char line[MAX_LINE];
    while (fgets(line, sizeof line, stdin) != nullptr) {
        char cmd[64] = "", a1[128] = "", a2[128] = "", extra[64] = "";
        int n = sscanf(line, "%63s %127s %127s %63s", cmd, a1, a2, extra);
        if (n < 1) {
            continue;
        }
        run_command(m, cmd, n >= 2 ? a1 : nullptr, n >= 3 ? a2 : nullptr, n);
    }
    map_free(m);
    return 0;
}
