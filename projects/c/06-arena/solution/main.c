// 06-arena — 아레나·풀 메모리 할당자 (solution)
//
// 표준 입력에서 한 줄씩 명령을 읽어 아레나 및 풀 할당자를 조작한다.
//   arena_alloc 16 8       → alloc: offset 0 size 16 align 8
//   arena_stats            → arena: used 16 / 1024 bytes
//   arena_reset            → arena: reset
//   pool_init 32 4         → pool: init 4 chunks of 32 bytes
//   pool_alloc             → pool alloc: chunk 0
//   pool_free 0            → pool free: chunk 0
//
// C23: alignof, alignas, nullptr, constexpr, [[nodiscard]], auto, typeof
#include <stdalign.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

constexpr size_t ARENA_DEFAULT_CAP = 1'024;
constexpr int MAX_LINE = 1'024;

// ---- Step 1: 메모리 정렬과 align_up ----
static inline bool is_power_of_two(size_t n) {
    return n > 0 && (n & (n - 1)) == 0;
}

static inline uintptr_t align_up(uintptr_t ptr, size_t align) {
    return (ptr + (align - 1)) & ~(uintptr_t)(align - 1);
}

// ---- Step 2: 아레나 할당자와 일괄 리셋 ----
typedef struct Arena {
    char *buffer;
    size_t offset;
    size_t capacity;
} Arena;

[[nodiscard]] static Arena *arena_new(size_t capacity) {
    Arena *a = malloc(sizeof(Arena));
    if (a == nullptr) {
        return nullptr;
    }
    a->buffer = malloc(capacity);
    if (a->buffer == nullptr) {
        free(a);
        return nullptr;
    }
    a->offset = 0;
    a->capacity = capacity;
    return a;
}

static void arena_free(Arena *a) {
    if (a != nullptr) {
        free(a->buffer);
        free(a);
    }
}

static void arena_reset(Arena *a) {
    if (a != nullptr) {
        a->offset = 0;
    }
}

[[nodiscard]] static void *arena_alloc(Arena *a, size_t size, size_t align, size_t *out_offset) {
    if (a == nullptr || size == 0) {
        return nullptr;
    }
    if (align == 0 || !is_power_of_two(align)) {
        align = alignof(max_align_t);
    }
    size_t aligned_offset = (a->offset + (align - 1)) & ~(align - 1);
    if (aligned_offset + size > a->capacity) {
        return nullptr;
    }
    void *ptr = a->buffer + aligned_offset;
    a->offset = aligned_offset + size;
    if (out_offset != nullptr) {
        *out_offset = aligned_offset;
    }
    return ptr;
}

// ---- Step 3: 풀 할당자 초기화와 프리리스트 ----
typedef struct Pool {
    char *buffer;
    size_t chunk_size;
    size_t chunk_count;
    size_t used;
    int *free_stack;
    int free_top;
    bool *is_allocated;
} Pool;

[[nodiscard]] static Pool *pool_new(size_t chunk_size, size_t chunk_count) {
    Pool *p = malloc(sizeof(Pool));
    if (p == nullptr) {
        return nullptr;
    }
    if (chunk_size < sizeof(void *)) {
        chunk_size = sizeof(void *);
    }
    p->chunk_size = chunk_size;
    p->chunk_count = chunk_count;
    p->used = 0;
    p->buffer = malloc(chunk_size * chunk_count);
    p->free_stack = malloc(chunk_count * sizeof(int));
    p->is_allocated = calloc(chunk_count, sizeof(bool));
    if (p->buffer == nullptr || p->free_stack == nullptr || p->is_allocated == nullptr) {
        free(p->buffer);
        free(p->free_stack);
        free(p->is_allocated);
        free(p);
        return nullptr;
    }
    for (size_t i = 0; i < chunk_count; i++) {
        p->free_stack[i] = (int)(chunk_count - 1 - i);
    }
    p->free_top = (int)chunk_count;
    return p;
}

static void pool_free_all(Pool *p) {
    if (p != nullptr) {
        free(p->buffer);
        free(p->free_stack);
        free(p->is_allocated);
        free(p);
    }
}

// ---- Step 4: 풀 청크 할당과 반환 ----
static int pool_alloc(Pool *p) {
    if (p == nullptr || p->free_top <= 0) {
        return -1;
    }
    int id = p->free_stack[--p->free_top];
    p->is_allocated[id] = true;
    p->used++;
    return id;
}

static bool pool_free(Pool *p, int id) {
    if (p == nullptr || id < 0 || (size_t)id >= p->chunk_count || !p->is_allocated[id]) {
        return false;
    }
    p->is_allocated[id] = false;
    p->free_stack[p->free_top++] = id;
    p->used--;
    return true;
}

// ---- Step 5: 벤치마크 및 명령 처리 루프 ----
static void bench_arena(int count, size_t size) {
    size_t total_bytes = (size_t)count * size;
    Arena *temp = arena_new(total_bytes + 1'024);
    if (temp != nullptr) {
        for (int i = 0; i < count; i++) {
            size_t off = 0;
            (void)arena_alloc(temp, size, alignof(max_align_t), &off);
        }
        arena_reset(temp);
        arena_free(temp);
    }
    printf("bench arena: %d allocations (%zu bytes) ok\n", count, total_bytes);
}

static void bench_malloc(int count, size_t size) {
    size_t total_bytes = (size_t)count * size;
    void **ptrs = malloc(count * sizeof(void *));
    if (ptrs != nullptr) {
        for (int i = 0; i < count; i++) {
            ptrs[i] = malloc(size);
        }
        for (int i = 0; i < count; i++) {
            free(ptrs[i]);
        }
        free(ptrs);
    }
    printf("bench malloc: %d allocations (%zu bytes) ok\n", count, total_bytes);
}

int main(void) {
    Arena *arena = arena_new(ARENA_DEFAULT_CAP);
    Pool *pool = nullptr;
    char line[MAX_LINE];

    while (fgets(line, sizeof(line), stdin) != nullptr) {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0') {
            continue;
        }

        if (strncmp(line, "arena_alloc ", 12) == 0) {
            size_t size = 0;
            size_t align = 0;
            int matched = sscanf(line + 12, "%zu %zu", &size, &align);
            if (matched < 2 || align == 0) {
                align = alignof(max_align_t);
            }
            size_t off = 0;
            void *ptr = arena_alloc(arena, size, align, &off);
            if (ptr == nullptr) {
                printf("error: out of memory\n");
            } else {
                printf("alloc: offset %zu size %zu align %zu\n", off, size, align);
            }
        } else if (strcmp(line, "arena_reset") == 0) {
            arena_reset(arena);
            printf("arena: reset\n");
        } else if (strcmp(line, "arena_stats") == 0) {
            printf("arena: used %zu / %zu bytes\n", arena->offset, arena->capacity);
        } else if (strncmp(line, "pool_init ", 10) == 0) {
            size_t chunk_size = 0;
            size_t chunk_count = 0;
            if (sscanf(line + 10, "%zu %zu", &chunk_size, &chunk_count) == 2) {
                if (pool != nullptr) {
                    pool_free_all(pool);
                }
                pool = pool_new(chunk_size, chunk_count);
                printf("pool: init %zu chunks of %zu bytes\n", chunk_count, chunk_size);
            }
        } else if (strcmp(line, "pool_alloc") == 0) {
            int id = pool_alloc(pool);
            if (id < 0) {
                printf("error: pool full\n");
            } else {
                printf("pool alloc: chunk %d\n", id);
            }
        } else if (strncmp(line, "pool_free ", 10) == 0) {
            int id = -1;
            if (sscanf(line + 10, "%d", &id) == 1) {
                if (pool_free(pool, id)) {
                    printf("pool free: chunk %d\n", id);
                } else {
                    printf("error: invalid chunk\n");
                }
            }
        } else if (strcmp(line, "pool_stats") == 0) {
            if (pool != nullptr) {
                printf("pool: used %zu / %zu chunks\n", pool->used, pool->chunk_count);
            }
        } else if (strncmp(line, "bench arena ", 12) == 0) {
            int count = 0;
            size_t size = 0;
            if (sscanf(line + 12, "%d %zu", &count, &size) == 2) {
                bench_arena(count, size);
            }
        } else if (strncmp(line, "bench malloc ", 13) == 0) {
            int count = 0;
            size_t size = 0;
            if (sscanf(line + 13, "%d %zu", &count, &size) == 2) {
                bench_malloc(count, size);
            }
        }
    }

    if (pool != nullptr) {
        pool_free_all(pool);
    }
    arena_free(arena);
    return 0;
}
