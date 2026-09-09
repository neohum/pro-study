// 06-arena — 아레나·풀 메모리 할당자 (starter)
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <stdalign.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

[[maybe_unused]] constexpr size_t ARENA_DEFAULT_CAP = 1'024;
[[maybe_unused]] constexpr int MAX_LINE = 1'024;

// ---------------------------------------------------------------------------
// TODO(step-1): 메모리 정렬과 align_up
// 정렬 단위(align)는 2의 거듭제곱이어야 하며, 비트 연산으로 올림 정렬한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static inline bool is_power_of_two(size_t n) {
    (void)n;
    return true; // TODO(step-1)
}

[[maybe_unused]] static inline uintptr_t align_up(uintptr_t ptr, size_t align) {
    (void)ptr;
    (void)align;
    return ptr; // TODO(step-1)
}

// ---------------------------------------------------------------------------
// TODO(step-2): 아레나 할당자와 일괄 리셋
// 큰 버퍼를 한 번에 확보하고, offset을 전진시키며 할당한다. 리셋은 offset = 0이다.
// ---------------------------------------------------------------------------
typedef struct Arena {
    char *buffer;
    size_t offset;
    size_t capacity;
} Arena;

[[maybe_unused]] static Arena *arena_new(size_t capacity) {
    (void)capacity;
    return nullptr; // TODO(step-2)
}

[[maybe_unused]] static void arena_free(Arena *a) {
    (void)a;
    // TODO(step-2)
}

[[maybe_unused]] static void arena_reset(Arena *a) {
    (void)a;
    // TODO(step-2)
}

[[maybe_unused]] static void *arena_alloc(Arena *a, size_t size, size_t align, size_t *out_offset) {
    (void)a;
    (void)size;
    (void)align;
    (void)out_offset;
    return nullptr; // TODO(step-2)
}

// ---------------------------------------------------------------------------
// TODO(step-3): 풀 할당자 초기화와 프리리스트
// 동일한 크기의 청크들을 미리 할당하고, 사용 가능한 청크 인덱스를 스택/리스트로 관리한다.
// ---------------------------------------------------------------------------
typedef struct Pool {
    char *buffer;
    size_t chunk_size;
    size_t chunk_count;
    size_t used;
    int *free_stack;
    int free_top;
    bool *is_allocated;
} Pool;

[[maybe_unused]] static Pool *pool_new(size_t chunk_size, size_t chunk_count) {
    (void)chunk_size;
    (void)chunk_count;
    return nullptr; // TODO(step-3)
}

[[maybe_unused]] static void pool_free_all(Pool *p) {
    (void)p;
    // TODO(step-3)
}

// ---------------------------------------------------------------------------
// TODO(step-4): 풀 청크 할당과 반환
// 프리리스트에서 꺼내어 청크 번호를 반환하고, 반환 시 다시 프리리스트에 넣는다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static int pool_alloc(Pool *p) {
    (void)p;
    return -1; // TODO(step-4)
}

[[maybe_unused]] static bool pool_free(Pool *p, int id) {
    (void)p;
    (void)id;
    return false; // TODO(step-4)
}

// ---------------------------------------------------------------------------
// TODO(step-5): 벤치마크 및 명령 처리 루프
// 표준 입력에서 한 줄씩 명령을 읽어 아레나와 풀 함수를 호출한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static void bench_arena(int count, size_t size) {
    (void)count;
    (void)size;
    // TODO(step-5)
}

[[maybe_unused]] static void bench_malloc(int count, size_t size) {
    (void)count;
    (void)size;
    // TODO(step-5)
}

int main(void) {
    char line[MAX_LINE];
    // TODO(step-5): fgets 루프로 명령어를 처리한다.
    while (fgets(line, sizeof(line), stdin) != nullptr) {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0') {
            continue;
        }
    }
    return 0;
}
