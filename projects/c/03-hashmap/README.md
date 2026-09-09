# 03. 오픈 어드레싱 해시맵

## 무엇을 만드는가

표준 입력에서 한 줄에 명령 하나를 읽어 문자열 키와 64비트 정수 값을 관리하는 개방 주소법(open addressing) 해시맵 CLI 도구다.
FNV-1a 해시 함수, 선형 탐사(linear probing), 삭제 시 탐사 체인이 끊어지지 않게 하는 툼스톤(tombstone), 적재율 75% 기준 동적 재해시(rehash)를 구현한다.

```
$ build/app.exe
set score 100
get score
100
len
1
cap
16
del score
get score
error: not found
```

## 왜 이 프로젝트인가

해시맵은 거의 모든 프로그래밍 언어의 기본 내장 컬렉션(Go의 `map`, Python의 `dict`, Java의 `HashMap`)이다.
체이닝(Chaining, 연결 리스트) 방식은 메모리 할당 빈도가 높고 캐시 지역성이 떨어지는 반면,
개방 주소법(Open Addressing)은 단일 연속 배열 안에 모든 데이터를 배치해 현대 CPU 캐시에 매우 친화적이다.

이 프로젝트에서는 충돌 해결을 위한 선형 탐사, 삭제 시 탐사 체인을 보존하는 툼스톤(`S_DEAD`) 기법,
그리고 배열이 찰 때 용량을 2배로 늘리며 툼스톤을 청소하는 재해시(Rehash)를 직접 구현한다.
여기서 만든 해시맵은 8번 KV 저장소(인메모리 인덱스)와 10번 웹 서버의 라우팅 테이블에서 핵심 부품으로 사용된다.

## 핵심 개념

### FNV-1a 해시 함수

FNV-1a(Fowler–Noll–Vo)는 단순하면서도 바이트 분포가 고르고 구현이 매우 간결한 64비트 비암호학적 해시 함수다.
초기 오프셋에 매 바이트를 XOR하고 소수를 곱하는 연산을 반복한다.

```c
static uint64_t hash_str(const char *s) {
    uint64_t h = 0xcbf29ce484222325ULL; // FNV offset basis
    for (; *s; s++) {
        h ^= (unsigned char)*s;
        h *= 0x100000001b3ULL;          // FNV prime
    }
    return h;
}
```

### 개방 주소법과 선형 탐사

해시 충돌이 발생했을 때 다른 버킷에 연결 리스트를 다는 대신, 같은 배열의 다음 빈 슬롯(`(i + 1) & (cap - 1)`)을 순차적으로 찾아간다.
배열 용량(`cap`)을 항상 2의 거듭제곱으로 유지하면 나머지 연산(`% cap`)을 빠른 비트 AND(`& (cap - 1)`)로 대체할 수 있다.

```c
size_t i = hash_str(key) & (m->cap - 1);
for (;;) {
    Slot *s = &m->slots[i];
    if (s->state == S_EMPTY || strcmp(s->key, key) == 0) return s;
    i = (i + 1) & (m->cap - 1);
}
```

### 툼스톤(Tombstone) 삭제

선형 탐사에서 원소를 단순히 빈 슬롯(`S_EMPTY`)으로 초기화하면, 그 뒤에 충돌로 밀려난 다른 키들의 탐사 경로가 끊겨 버린다.
따라서 삭제된 자리는 툼스톤(`S_DEAD`)으로 표시해 탐사는 계속 통과시키고, 새로운 원소 삽입 시에는 이 자리를 재활용한다.

### 적재율(Load Factor)과 동적 리사이즈

배열에 데이터가 차오를수록 선형 탐사 횟수가 급증해 성능이 $O(N)$으로 퇴화한다.
사용 중인 슬롯(`used`)과 툼스톤(`dead`)의 합이 전체 용량의 75%를 초과하면 용량을 2배로 늘려 새 배열을 할당하고,
유효한 키들만 다시 해싱하여 옮긴다(`rehash`). 이 과정에서 모든 툼스톤이 제거된다.

### C23: constexpr, nullptr, enum : type

C23의 고정 크기 enum 문법(`enum : unsigned char`)으로 슬롯 상태의 메모리 낭비를 줄이고,
`nullptr`와 `constexpr`를 활용해 타입 안전성과 가독성을 높인다.

```c
typedef enum SlotState : unsigned char { S_EMPTY, S_USED, S_DEAD } SlotState;
constexpr size_t INITIAL_CAP = 16;
```

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석과 아래 단계가 1:1로 대응한다. 각 단계마다 빌드 경고가 0개인지 확인하자.

### Step 1: 구조체와 FNV-1a 해시 함수

문자열 키의 64비트 FNV-1a 해시를 계산하는 `hash_str`을 구현한다.
초기값 `0xcbf29ce484222325ULL`과 소수 `0x100000001b3ULL`을 사용하여 각 바이트를 누적 연산한다.

확인: `gcc -std=c23 -Wall -Wextra -g -o build/app.exe main.c`로 경고 없이 컴파일되는지 확인한다.

### Step 2: 선형 탐사와 슬롯 탐색

`find_slot` 함수를 작성한다. 해시값으로 시작 인덱스를 계산하고, 빈 슬롯(`S_EMPTY`)을 만나거나 일치하는 키를 찾을 때까지 선형 탐사를 수행한다.
탐사 중 처음 만난 `S_DEAD` 슬롯 위치를 `first_dead` 포인터에 기록해 둔다.

확인: 키 검색 시 DEAD 슬롯을 건너뛰고 탐사가 이어지는지 로직을 점검한다.

### Step 3: 삽입(set)과 조회(get)

`map_set`과 `map_get`을 구현한다.
- `map_set`: 키가 이미 존재하면 값을 덮어쓴다. 새 키라면 탐사 중 발견한 첫 번째 `S_DEAD` 자리를 우선 재활용하고, 없으면 빈 슬롯에 새 키를 복사(`dup_str`)하여 넣는다.
- `map_get`: 키가 존재하고 `S_USED` 상태이면 `*out`에 값을 쓰고 `true`를 반환한다.

확인: 단일 키 삽입 후 조회가 정상 동작하는지 확인한다.

### Step 4: 툼스톤 삭제(del)와 동적 리사이즈(rehash)

`map_del`과 `rehash`를 구현한다.
- `map_del`: 키 슬롯을 찾아 키 메모리를 해제하고 상태를 `S_DEAD`로 바꾼다 (`used` 감소, `dead` 증가).
- `rehash`: 적재율이 75%를 넘기면 새 용량으로 재해시한다. `S_USED`인 슬롯만 새 배열에 재배치하여 툼스톤을 모두 정리한다.

확인: 삭제 후 `len`이 감소하고, `get` 시 `error: not found`가 출력되는지 확인한다.

### Step 5: 명령 처리기 REPL

표준 입력에서 한 줄씩 명령을 읽어 분기하는 `run_command`를 작성한다.
`set <key> <val>`, `get <key>`, `del <key>`, `len`, `cap` 명령을 처리하고, 인자가 잘못되면 `error: bad argument`, 알 수 없는 명령은 `error: unknown command '<cmd>'`를 출력한다.

확인: `tests/cases/`의 테스트 케이스를 통과하는지 검증한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `del` 후 다른 키 `get`이 실패함 | 슬롯을 `S_EMPTY`로 초기화해 탐사 체인이 끊김 | 삭제 시 슬롯 상태를 반드시 `S_DEAD`로 설정 |
| 많은 삽입 후 무한 루프 발생 | 적재율 검사 없이 배열이 100% 찼을 때 선형 탐사 종료 조건 불만족 | 적재율 75% 초과 시 반드시 `rehash` 수행 |
| `strdup` 컴파일 에러 | MinGW C23 표준 모드에서 POSIX 함수 미제공 | `malloc` + `memcpy`로 직접 구현한 `dup_str` 사용 |
| 잘못된 인자에서 비정상 종료 | `strtoll` 에러 체크 미비 | `errno == 0 && *end == '\0'` 검증 추가 |

## 더 나아가기

- `Robin Hood 해시`: 탐사 거리가 긴 원소를 우선 배치하여 최악 탐사 거리를 단축해 보자.
- `이차 탐사(Quadratic Probing)`: 1차 클러스터링을 줄이기 위해 탐사 간격을 $1, 4, 9, \dots$로 늘려 보자.
- 문자열 외에 임의의 포인터나 구조체를 값으로 저장하는 제네릭 해시맵으로 확장해 보자.

## 참고

- FNV Hash Specification: <http://www.isthe.com/chongo/tech/comp/fnv/>
- Open Addressing on Wikipedia: <https://en.wikipedia.org/wiki/Open_addressing>
- C23 표준 초안 N3220: 열거형 고정 타입(6.7.2.2), `nullptr`(7.21.1)
