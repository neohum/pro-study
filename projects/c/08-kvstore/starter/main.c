// 08-kvstore — 파일 기반 Key-Value 저장소 (starter)
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include "map.h"

#include <errno.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(__has_builtin) && __has_builtin(__builtin_unreachable)
#define unreachable() __builtin_unreachable()
#else
#define unreachable() abort()
#endif

[[maybe_unused]] constexpr uint32_t RECORD_MAGIC = 0x4B565354; // 'KVST'
constexpr int MAX_LINE = 1'024;

// C23: _BitInt — 정확한 비트 너비를 지정하는 정수 타입
typedef unsigned _BitInt(8) RecordFlag;

typedef enum RecordType : uint8_t {
    REC_SET = 1,
    REC_DEL = 2,
} RecordType;

#pragma pack(push, 1)
typedef struct RecordHeader {
    uint32_t magic;
    uint8_t type;
    uint32_t key_len;
    uint32_t val_len;
} RecordHeader;
#pragma pack(pop)

// ---------------------------------------------------------------------------
// TODO(step-1): 바이너리 레코드 헤더와 KV 저장소 구조체
// DB 파일 포인터와 인메모리 해시맵(Map) 인덱스를 보유하는 KVStore 구조체를 정의한다.
// ---------------------------------------------------------------------------
typedef struct KVStore {
    FILE *fp;
    char path[256];
    Map *index;
} KVStore;

[[maybe_unused]] static KVStore *store_open(const char *path) {
    (void)path;
    return nullptr; // TODO(step-1)
}

[[maybe_unused]] static void store_close(KVStore *store) {
    (void)store;
    // TODO(step-1)
}

// ---------------------------------------------------------------------------
// TODO(step-2): Append-only 로그 쓰기와 인메모리 인덱스
// 파일 끝(SEEK_END)에 레코드를 순차 추가하고 인메모리 맵(index)에 오프셋을 기록한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static bool store_set(KVStore *store, const char *key, const char *val) {
    (void)store;
    (void)key;
    (void)val;
    return false; // TODO(step-2)
}

[[maybe_unused]] static bool store_del(KVStore *store, const char *key) {
    (void)store;
    (void)key;
    return false; // TODO(step-2)
}

// ---------------------------------------------------------------------------
// TODO(step-3): 키 조회와 파일 오프셋 시크
// 인메모리 맵에서 오프셋을 찾고, fseek(SEEK_SET)으로 디스크에서 값을 읽어온다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static bool store_get(KVStore *store, const char *key, char **out_val) {
    (void)store;
    (void)key;
    (void)out_val;
    return false; // TODO(step-3)
}

// ---------------------------------------------------------------------------
// TODO(step-4): 크래시 복구 및 순차 로그 재생
// 파일의 0번 오프셋부터 끝까지 순차 스캔하여 유효 레코드로 인메모리 인덱스를 복원한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static void store_recover(KVStore *store) {
    (void)store;
    // TODO(step-4)
}

// ---------------------------------------------------------------------------
// TODO(step-5): 로그 컴팩션과 CLI 명령 루프
// 유효한 최신 키만 새 파일에 복사하여 디스크 공간을 회수하고 표준 입력을 처리한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static bool store_compact(KVStore *store) {
    (void)store;
    return false; // TODO(step-5)
}

int main(int argc, char *argv[]) {
    (void)argc;
    (void)argv;

    char line[MAX_LINE];
    // TODO(step-5): CLI 명령 처리 루프
    while (fgets(line, sizeof(line), stdin) != nullptr) {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0') {
            continue;
        }
    }
    return 0;
}
