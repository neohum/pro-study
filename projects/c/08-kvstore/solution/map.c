// map.c — 선형 탐사(linear probing) 개방 주소법 해시맵 (03-hashmap에서 가져옴)
#include "map.h"

#include <stdlib.h>
#include <string.h>

typedef enum SlotState : unsigned char { S_EMPTY, S_USED, S_DEAD } SlotState;

typedef struct Slot {
    char *key; // S_USED일 때만 유효. 맵이 소유한다.
    int64_t value;
    SlotState state;
} Slot;

struct Map {
    Slot *slots;
    size_t cap;  // 항상 2의 거듭제곱 → 인덱스는 hash & (cap - 1)
    size_t used; // S_USED 슬롯 수
    size_t dead; // S_DEAD 슬롯 수 (rehash 때 정리된다)
};

constexpr size_t MAP_INITIAL_CAP = 16;

// FNV-1a 64비트. 짧은 문자열에 빠르고 분포가 고르다.
static uint64_t hash_str(const char *s) {
    uint64_t h = 0xcbf29ce484222325ULL;
    for (; *s; s++) {
        h ^= (unsigned char)*s;
        h *= 0x100000001b3ULL;
    }
    return h;
}

// 이 MinGW에는 strdup이 POSIX 확장이라 -std=c23에서 선언되지 않는다. 직접 만든다.
static char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p != nullptr) {
        memcpy(p, s, n);
    }
    return p;
}

Map *map_new(void) {
    Map *m = calloc(1, sizeof *m);
    if (m == nullptr) {
        return nullptr;
    }
    m->slots = calloc(MAP_INITIAL_CAP, sizeof *m->slots);
    if (m->slots == nullptr) {
        free(m);
        return nullptr;
    }
    m->cap = MAP_INITIAL_CAP;
    return m;
}

void map_free(Map *m) {
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

// 빈 슬롯이 나올 때까지 선형 탐사. DEAD 슬롯은 건너뛰되(그 뒤에 같은 키가 있을 수 있다)
// 첫 DEAD 위치를 기억해 두면 삽입 때 재활용할 수 있다.
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

// USED 슬롯만 새 테이블로 옮긴다. DEAD는 여기서 사라진다.
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

bool map_put(Map *m, const char *key, int64_t value) {
    // 적재율(used + dead)이 3/4을 넘기 전에 키운다. dead가 많으면 같은 크기로 정리만 한다.
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

bool map_get(const Map *m, const char *key, int64_t *out) {
    Slot *s = find_slot(m, key, nullptr);
    if (s->state != S_USED) {
        return false;
    }
    *out = s->value;
    return true;
}

bool map_del(Map *m, const char *key) {
    Slot *s = find_slot(m, key, nullptr);
    if (s->state != S_USED) {
        return false;
    }
    free(s->key);
    *s = (Slot){.state = S_DEAD}; // 툼스톤: 탐사 체인이 끊기지 않게 EMPTY로 되돌리지 않는다
    m->used--;
    m->dead++;
    return true;
}

size_t map_len(const Map *m) {
    return m->used;
}

void map_each(const Map *m, MapVisit visit, void *ctx) {
    for (size_t i = 0; i < m->cap; i++) {
        const Slot *s = &m->slots[i];
        if (s->state == S_USED && !visit(s->key, s->value, ctx)) {
            return;
        }
    }
}
