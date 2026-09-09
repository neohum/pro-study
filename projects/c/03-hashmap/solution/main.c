// 03-hashmap — 오픈 어드레싱 해시맵 (solution)
//
// FNV-1a 해시, 선형 탐사(linear probing), 툼스톤 삭제, 동적 리사이즈를 구현하는
// 문자열 키 → int64_t 값 해시맵 CLI 명령 처리기다.
//
// 명령:
//   set <key> <val>  키에 정수 값 저장 (이미 있으면 갱신, 성공 시 무출력)
//   get <key>        키의 값을 출력 (없으면 error: not found)
//   del <key>        키 삭제 (툼스톤 표시, 성공 시 무출력, 없으면 error: not found)
//   len              저장된 활성 키 개수 출력
//   cap              현재 버킷 배열 용량 출력
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

// FNV-1a 64비트 해시 함수
static uint64_t hash_str(const char *s) {
    uint64_t h = 0xcbf29ce484222325ULL;
    for (; *s; s++) {
        h ^= (unsigned char)*s;
        h *= 0x100000001b3ULL;
    }
    return h;
}

// MinGW gcc의 C23 모드에서 strdup 누락 대비
static char *dup_str(const char *s) {
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

// 빈 슬롯이 나올 때까지 선형 탐사. DEAD 슬롯은 건너뛰되(뒤에 같은 키가 있을 수 있음),
// 첫 DEAD 슬롯 위치를 first_dead에 기록해 새 삽입 시 재활용할 수 있게 한다.
static Slot *find_slot(const Map *m, const char *key, Slot **first_dead) {
    size_t i = hash_str(key) & (m->cap - 1);
    Slot *dead = nullptr;
    for (;;) {
        Slot *s = &m->slots[i];
        if (s->state == S_EMPTY) {
            if (first_dead != nullptr) {
                *first_dead = dead;
            }
            return s;
        }
        if (s->state == S_DEAD) {
            if (dead == nullptr) {
                dead = s;
            }
        } else if (strcmp(s->key, key) == 0) {
            if (first_dead != nullptr) {
                *first_dead = nullptr;
            }
            return s;
        }
        i = (i + 1) & (m->cap - 1);
    }
}

// USED 슬롯만 새 테이블로 재해시하여 이전. DEAD 슬롯은 정리된다.
static bool rehash(Map *m, size_t new_cap) {
    Slot *old = m->slots;
    size_t old_cap = m->cap;
    Slot *fresh = calloc(new_cap, sizeof *fresh);
    if (fresh == nullptr) {
        return false;
    }
    m->slots = fresh;
    m->cap = new_cap;
    m->dead = 0;
    for (size_t i = 0; i < old_cap; i++) {
        if (old[i].state == S_USED) {
            Slot *s = find_slot(m, old[i].key, nullptr);
            *s = old[i];
        }
    }
    free(old);
    return true;
}

[[nodiscard]] static bool map_set(Map *m, const char *key, int64_t value) {
    // 적재율(used + dead)이 75%를 넘으면 리사이즈 또는 정리
    if ((m->used + m->dead + 1) * 4 > m->cap * 3) {
        size_t new_cap = (m->used + 1) * 2 > m->cap ? m->cap * 2 : m->cap;
        if (!rehash(m, new_cap)) {
            return false;
        }
    }
    Slot *dead = nullptr;
    Slot *s = find_slot(m, key, &dead);
    if (s->state == S_USED) {
        s->value = value;
        return true;
    }
    if (dead != nullptr) {
        s = dead;
        m->dead--;
    }
    char *copy = dup_str(key);
    if (copy == nullptr) {
        return false;
    }
    *s = (Slot){.key = copy, .value = value, .state = S_USED};
    m->used++;
    return true;
}

[[nodiscard]] static bool map_get(const Map *m, const char *key, int64_t *out) {
    if (m->cap == 0) {
        return false;
    }
    Slot *s = find_slot(m, key, nullptr);
    if (s->state != S_USED) {
        return false;
    }
    *out = s->value;
    return true;
}

static bool map_del(Map *m, const char *key) {
    if (m->cap == 0) {
        return false;
    }
    Slot *s = find_slot(m, key, nullptr);
    if (s->state != S_USED) {
        return false;
    }
    free(s->key);
    *s = (Slot){.state = S_DEAD};
    m->used--;
    m->dead++;
    return true;
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

static void run_command(Map *m, const char *cmd, const char *a1, const char *a2, int token_count) {
    if (strcmp(cmd, "set") == 0) {
        if (token_count != 3 || a1 == nullptr || a2 == nullptr) {
            printf("error: bad argument\n");
            return;
        }
        int64_t val = 0;
        if (!parse_int64(a2, &val)) {
            printf("error: bad argument\n");
            return;
        }
        if (!map_set(m, a1, val)) {
            printf("error: out of memory\n");
        }
    } else if (strcmp(cmd, "get") == 0) {
        if (token_count != 2 || a1 == nullptr) {
            printf("error: bad argument\n");
            return;
        }
        int64_t val = 0;
        if (map_get(m, a1, &val)) {
            printf("%lld\n", (long long)val);
        } else {
            printf("error: not found\n");
        }
    } else if (strcmp(cmd, "del") == 0) {
        if (token_count != 2 || a1 == nullptr) {
            printf("error: bad argument\n");
            return;
        }
        if (map_del(m, a1)) {
            // 성공 시 무출력
        } else {
            printf("error: not found\n");
        }
    } else if (strcmp(cmd, "len") == 0) {
        if (token_count != 1) {
            printf("error: bad argument\n");
            return;
        }
        printf("%zu\n", map_len(m));
    } else if (strcmp(cmd, "cap") == 0) {
        if (token_count != 1) {
            printf("error: bad argument\n");
            return;
        }
        printf("%zu\n", map_cap(m));
    } else {
        printf("error: unknown command '%s'\n", cmd);
    }
}

int main(void) {
    Map *m = map_new();
    if (m == nullptr) {
        fprintf(stderr, "out of memory\n");
        return 1;
    }
    char line[MAX_LINE];
    while (fgets(line, sizeof line, stdin) != nullptr) {
        char cmd[64] = "", a1[128] = "", a2[128] = "", extra[64] = "";
        int n = sscanf(line, "%63s %127s %127s %63s", cmd, a1, a2, extra);
        if (n < 1) {
            continue; // 빈 줄
        }
        if (n > 3) {
            if (strcmp(cmd, "set") == 0 || strcmp(cmd, "get") == 0 ||
                strcmp(cmd, "del") == 0 || strcmp(cmd, "len") == 0 || strcmp(cmd, "cap") == 0) {
                printf("error: bad argument\n");
                continue;
            }
        }
        run_command(m, cmd, n >= 2 ? a1 : nullptr, n >= 3 ? a2 : nullptr, n);
    }
    map_free(m);
    return 0;
}
