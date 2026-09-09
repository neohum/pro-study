// map.h — 문자열 키 → int64_t 값 개방 주소법 해시맵 (03-hashmap에서 가져옴)
//
// 08-kvstore는 이 맵을 "키 → 파일 오프셋" 인덱스로 쓴다. 키는 맵이 복사해 소유하고,
// 삭제는 슬롯을 DEAD로 표시하는 툼스톤 방식이다 — 로그 파일의 툼스톤과 같은 아이디어다.
#ifndef MAP_H
#define MAP_H

#include <stddef.h>
#include <stdint.h>

typedef struct Map Map;

// 방문 콜백. false를 돌려주면 순회를 멈춘다.
typedef bool (*MapVisit)(const char *key, int64_t value, void *ctx);

[[nodiscard]] Map *map_new(void);
void map_free(Map *m);

// 있으면 값을 바꾸고, 없으면 넣는다. 메모리 부족이면 false.
[[nodiscard]] bool map_put(Map *m, const char *key, int64_t value);
// 찾으면 *out에 값을 쓰고 true.
[[nodiscard]] bool map_get(const Map *m, const char *key, int64_t *out);
// 지웠으면 true, 없었으면 false.
bool map_del(Map *m, const char *key);
[[nodiscard]] size_t map_len(const Map *m);
// 순서는 정해져 있지 않다. 정렬이 필요하면 호출자가 모아서 qsort 한다.
void map_each(const Map *m, MapVisit visit, void *ctx);

#endif
