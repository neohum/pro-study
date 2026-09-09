// 08-kvstore — 파일 기반 Key-Value 저장소 (solution)
//
// Append-only 바이너리 로그 파일과 인메모리 해시 인덱스(Bitcask 아키텍처)를 결합한 KV 저장소.
// 쓰기는 항상 파일 끝에 순차 기록되고, 읽기는 인메모리 인덱스로 위치를 찾아 1회 디스크 탐색으로 처리한다.
//
// C23: _BitInt, unreachable(), nullptr, constexpr, [[nodiscard]], auto
#include "map.h"

#include <ctype.h>
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

constexpr uint32_t RECORD_MAGIC = 0x4B565354; // 'KVST'
constexpr int MAX_LINE = 1'024;

// C23: _BitInt — 정확한 비트 너비를 지정하는 정수 타입
[[maybe_unused]] typedef unsigned _BitInt(8) RecordFlag;

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

// ---- Step 1: 바이너리 레코드 헤더와 KV 저장소 구조체 ----
typedef struct KVStore {
    FILE *fp;
    char path[256];
    Map *index;
} KVStore;

// ---- Step 4: 크래시 복구 및 순차 로그 재생 ----
static void store_recover(KVStore *store) {
    if (store->index != nullptr) {
        map_free(store->index);
    }
    store->index = map_new();
    if (store->fp == nullptr) {
        return;
    }

    fseek(store->fp, 0, SEEK_SET);
    while (true) {
        int64_t offset = ftell(store->fp);
        RecordHeader hdr;
        if (fread(&hdr, sizeof(hdr), 1, store->fp) != 1) {
            break;
        }
        if (hdr.magic != RECORD_MAGIC) {
            // 크래시나 불완전 쓰기로 인한 손상 감지 시 재생 중단
            break;
        }

        char *key = malloc(hdr.key_len + 1);
        if (key == nullptr) {
            break;
        }
        if (fread(key, 1, hdr.key_len, store->fp) != hdr.key_len) {
            free(key);
            break;
        }
        key[hdr.key_len] = '\0';

        if (hdr.type == REC_SET) {
            fseek(store->fp, hdr.val_len, SEEK_CUR);
            (void)map_put(store->index, key, offset);
        } else if (hdr.type == REC_DEL) {
            map_del(store->index, key);
        }
        free(key);
    }
}

[[nodiscard]] static KVStore *store_open(const char *path) {
    KVStore *store = calloc(1, sizeof(KVStore));
    if (store == nullptr) {
        return nullptr;
    }
    strncpy(store->path, path, sizeof(store->path) - 1);

    store->fp = fopen(path, "r+b");
    if (store->fp == nullptr) {
        store->fp = fopen(path, "w+b");
    }
    if (store->fp == nullptr) {
        free(store);
        return nullptr;
    }

    store_recover(store);
    return store;
}

static void store_close(KVStore *store) {
    if (store != nullptr) {
        if (store->fp != nullptr) {
            fflush(store->fp);
            fclose(store->fp);
        }
        if (store->index != nullptr) {
            map_free(store->index);
        }
        free(store);
    }
}

// ---- Step 2: Append-only 로그 쓰기와 인메모리 인덱스 ----
static bool store_set(KVStore *store, const char *key, const char *val) {
    fseek(store->fp, 0, SEEK_END);
    int64_t offset = ftell(store->fp);

    RecordHeader hdr = {
        .magic = RECORD_MAGIC,
        .type = REC_SET,
        .key_len = (uint32_t)strlen(key),
        .val_len = (uint32_t)strlen(val),
    };

    if (fwrite(&hdr, sizeof(hdr), 1, store->fp) != 1) {
        return false;
    }
    if (fwrite(key, 1, hdr.key_len, store->fp) != hdr.key_len) {
        return false;
    }
    if (fwrite(val, 1, hdr.val_len, store->fp) != hdr.val_len) {
        return false;
    }
    fflush(store->fp);

    (void)map_put(store->index, key, offset);
    return true;
}

static bool store_del(KVStore *store, const char *key) {
    int64_t offset = 0;
    if (!map_get(store->index, key, &offset)) {
        return false;
    }

    fseek(store->fp, 0, SEEK_END);
    RecordHeader hdr = {
        .magic = RECORD_MAGIC,
        .type = REC_DEL,
        .key_len = (uint32_t)strlen(key),
        .val_len = 0,
    };

    if (fwrite(&hdr, sizeof(hdr), 1, store->fp) != 1) {
        return false;
    }
    if (fwrite(key, 1, hdr.key_len, store->fp) != hdr.key_len) {
        return false;
    }
    fflush(store->fp);

    map_del(store->index, key);
    return true;
}

// ---- Step 3: 키 조회와 파일 오프셋 시크 ----
static bool store_get(KVStore *store, const char *key, char **out_val) {
    int64_t offset = 0;
    if (!map_get(store->index, key, &offset)) {
        return false;
    }

    fseek(store->fp, offset, SEEK_SET);
    RecordHeader hdr;
    if (fread(&hdr, sizeof(hdr), 1, store->fp) != 1) {
        return false;
    }
    fseek(store->fp, hdr.key_len, SEEK_CUR);

    char *val = malloc(hdr.val_len + 1);
    if (val == nullptr) {
        return false;
    }
    if (fread(val, 1, hdr.val_len, store->fp) != hdr.val_len) {
        free(val);
        return false;
    }
    val[hdr.val_len] = '\0';
    *out_val = val;
    return true;
}

// ---- Step 5: 로그 컴팩션과 CLI 명령 루프 ----
typedef struct CompactContext {
    KVStore *store;
    FILE *cfp;
    Map *new_index;
} CompactContext;

static bool compact_visitor(const char *key, int64_t old_offset, void *ctx) {
    CompactContext *cc = ctx;
    fseek(cc->store->fp, old_offset, SEEK_SET);
    RecordHeader hdr;
    if (fread(&hdr, sizeof(hdr), 1, cc->store->fp) != 1) {
        return true;
    }
    fseek(cc->store->fp, hdr.key_len, SEEK_CUR);

    char *val = malloc(hdr.val_len);
    if (val == nullptr) {
        return true;
    }
    if (fread(val, 1, hdr.val_len, cc->store->fp) != hdr.val_len) {
        free(val);
        return true;
    }

    int64_t new_offset = ftell(cc->cfp);
    RecordHeader new_hdr = {
        .magic = RECORD_MAGIC,
        .type = REC_SET,
        .key_len = (uint32_t)strlen(key),
        .val_len = hdr.val_len,
    };
    fwrite(&new_hdr, sizeof(new_hdr), 1, cc->cfp);
    fwrite(key, 1, new_hdr.key_len, cc->cfp);
    fwrite(val, 1, new_hdr.val_len, cc->cfp);
    free(val);

    (void)map_put(cc->new_index, key, new_offset);
    return true;
}

static bool store_compact(KVStore *store) {
    char compact_path[300];
    snprintf(compact_path, sizeof(compact_path), "%s.compact", store->path);

    FILE *cfp = fopen(compact_path, "w+b");
    if (cfp == nullptr) {
        return false;
    }

    Map *new_index = map_new();
    if (new_index == nullptr) {
        fclose(cfp);
        return false;
    }

    CompactContext ctx = {
        .store = store,
        .cfp = cfp,
        .new_index = new_index,
    };

    map_each(store->index, compact_visitor, &ctx);

    fflush(cfp);
    fclose(cfp);
    fflush(store->fp);
    fclose(store->fp);

    remove(store->path);
    if (rename(compact_path, store->path) != 0) {
        // 복구 실패 방어
    }

    store->fp = fopen(store->path, "r+b");
    map_free(store->index);
    store->index = new_index;
    return true;
}

int main(int argc, char *argv[]) {
    const char *db_path = "data.db";
    if (argc > 1 && argv[1][0] != '\0') {
        db_path = argv[1];
    }

    KVStore *store = store_open(db_path);
    if (store == nullptr) {
        fprintf(stderr, "failed to open database: %s\n", db_path);
        return 1;
    }

    char line[MAX_LINE];
    while (fgets(line, sizeof(line), stdin) != nullptr) {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0') {
            continue;
        }

        char cmd[32];
        if (sscanf(line, "%31s", cmd) != 1) {
            continue;
        }

        if (strcmp(cmd, "set") == 0) {
            char key[256];
            char val[512];
            int n = 0;
            if (sscanf(line, "%*s %255s %n", key, &n) >= 1 && n > 0) {
                char *v = line + n;
                while (isspace((unsigned char)*v)) {
                    v++;
                }
                strncpy(val, v, sizeof(val) - 1);
                val[sizeof(val) - 1] = '\0';
                if (store_set(store, key, val)) {
                    printf("ok\n");
                }
            }
        } else if (strcmp(cmd, "get") == 0) {
            char key[256];
            if (sscanf(line, "%*s %255s", key) == 1) {
                char *val = nullptr;
                if (store_get(store, key, &val)) {
                    printf("%s\n", val);
                    free(val);
                } else {
                    printf("error: not found\n");
                }
            }
        } else if (strcmp(cmd, "del") == 0) {
            char key[256];
            if (sscanf(line, "%*s %255s", key) == 1) {
                if (store_del(store, key)) {
                    printf("ok\n");
                } else {
                    printf("error: not found\n");
                }
            }
        } else if (strcmp(cmd, "len") == 0) {
            printf("%zu\n", map_len(store->index));
        } else if (strcmp(cmd, "reopen") == 0) {
            store_recover(store);
            printf("reopened: %zu keys\n", map_len(store->index));
        } else if (strcmp(cmd, "compact") == 0) {
            if (store_compact(store)) {
                printf("compacted %zu keys\n", map_len(store->index));
            }
        }
    }

    store_close(store);
    return 0;
}
