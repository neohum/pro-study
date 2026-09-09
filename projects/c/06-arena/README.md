# 06. 아레나·풀 메모리 할당자

## 무엇을 만드는가

정렬(`alignas`/`alignof`)을 고려한 고속 연속 메모리 할당자(아레나)와 고정 크기 청크를 재사용하는 풀(Pool) 할당자를 구현한다. 개별 `free` 호출 비용 없이 단 한 번의 포인터 초기화로 모든 객체를 회수하는 아레나와, 메모리 단편화 없이 동일 크기 블록을 O(1)에 할당/반환하는 풀 할당자의 동작을 명령어로 확인한다.

```
$ build/app.exe
arena_alloc 16 8
alloc: offset 0 size 16 align 8
arena_alloc 32 16
alloc: offset 16 size 32 align 16
arena_stats
arena: used 48 / 1024 bytes
arena_reset
arena: reset
pool_init 32 4
pool: init 4 chunks of 32 bytes
pool_alloc
pool alloc: chunk 0
pool_free 0
pool free: chunk 0
```

## 왜 이 프로젝트인가

게임 엔진, 컴파일러, 고성능 네트워크 서버는 수만 개의 작은 객체를 매 프레임/요청마다 만들고 없앤다. 표준 `malloc`/`free`는 범용 힙 관리 오버헤드와 락 경합, 외부 단편화(External Fragmentation) 문제를 일으킨다.

아레나(Arena)는 "생명주기가 같은 객체들을 큰 버퍼에 범프 포인터(`offset`)로 연달아 채우고, 끝날 때 한 번에 리셋"하는 가장 빠르고 단순한 전략이다. 풀(Pool) 할당자는 동일 크기 블록을 프리리스트로 관리하여 단편화를 완전히 방지한다. 이 프로젝트를 통해 하드웨어 메모리 정렬 규칙과 포인터 산술의 원리를 체득한다.

## 핵심 개념

### 메모리 정렬(Alignment)과 포인터 산술

CPU는 주소가 특정 배수(2, 4, 8, 16 바이트 등)일 때 가장 빠르게 접근하거나, 비정렬 접근 시 하드웨어 결함(Fault)을 낸다. C23에서는 `<stdalign.h>` 없이도 `alignof`와 `alignas`가 표준 키워드다.

정렬 단위 $A$가 2의 거듭제곱일 때 올림 정렬 공식은 비트 마스킹으로 계산된다:
$$\text{aligned} = (ptr + (A - 1)) \ \& \ \sim(A - 1)$$

```c
static inline uintptr_t align_up(uintptr_t ptr, size_t align) {
    return (ptr + (align - 1)) & ~(uintptr_t)(align - 1);
}
```

### 아레나 할당자: 범프 포인터와 O(1) 리셋

아레나는 미리 큰 메모리 블록(`capacity`)을 잡고, 요청이 들어올 때마다 정렬된 오프셋을 전진(bump)시킨다. 개별 블록 헤더나 메타데이터가 필요 없어 할당이 몇 번의 덧셈/비트 연산으로 끝난다. 수거는 `offset = 0`으로 끝난다.

```c
typedef struct Arena {
    char *buffer;
    size_t offset;
    size_t capacity;
} Arena;
```

### 풀 할당자: 프리리스트를 통한 O(1) 할당·반환

모든 객체의 크기가 같을 때, 사용하지 않는 청크의 인덱스나 포인터를 스택/리스트 구조로 엮어 둔다(`Free List`). 할당은 팝, 반환은 푸시로 동작하며 외부 단편화가 전혀 발생하지 않는다.

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다. 단계마다 빌드해서 경고가 0개인지 확인하자.

### Step 1: 메모리 정렬과 align_up

`is_power_of_two`로 정렬 크기가 2의 거듭제곱인지 검사하고, `align_up`에서 비트 연산을 사용해 주어진 주소/오프셋을 `align` 배수로 올림 정렬한다.

확인: `is_power_of_two(8) == true`, `align_up(5, 4) == 8` 계산 결과 확인.

### Step 2: 아레나 할당자와 일괄 리셋

`arena_new`로 버퍼를 확보하고, `arena_alloc`에서 요청 크기와 정렬 크기를 반영하여 `offset`을 전진시킨다. 남은 용량이 모자라면 `nullptr`를 반환한다. `arena_reset`은 `offset = 0`으로 되돌린다.

확인: `arena_alloc 16 8` 후 `arena_stats`로 사용 바이트가 출력되는지 확인.

### Step 3: 풀 할당자 초기화와 프리리스트

`pool_new`에서 전체 청크 버퍼와 함께 가용 인덱스를 담는 `free_stack`, 할당 여부를 추적하는 불리언 배열을 초기화한다.

확인: `pool_init 32 4` 실행 후 오류 없이 초기화 완료 메시지가 나오는지 확인.

### Step 4: 풀 청크 할당과 반환

`pool_alloc`은 `free_stack`에서 인덱스 하나를 꺼내어 할당 상태로 바꾸고 반환한다. 빈 슬롯이 없으면 -1을 돌려준다. `pool_free`는 유효 범위 검사 및 이중 반환(Double Free) 검사 후 다시 `free_stack`에 삽입한다.

확인: `pool_alloc`으로 청크 번호가 0, 1 순서로 나오는지 확인.

### Step 5: 벤치마크 및 명령 처리 루프

표준 입력에서 한 줄씩 명령어를 읽어 파싱하는 REPL을 구성한다. `bench arena <count> <size>`와 `bench malloc <count> <size>`를 통해 수천 번의 할당 후 일괄 해제 성능 차이를 체험한다.

확인: 모든 테스트 케이스(`tests/cases/01-*.in`)가 통과하는지 검증.

## 막혔을 때

| 증상 | 원인 |
| --- | --- |
| `align_up` 결과가 엉뚱한 큰 수 | `align`이 2의 거듭제곱이 아니거나, 부호 있는 정수 연산으로 인한 언더플로 |
| 아레나 할당 후 다음 할당 오프셋이 맞지 않음 | `aligned_offset`에 `size`를 더해야 하는데 원본 `offset`에 더함 |
| `pool_free` 호출 시 세그폴트 | 청크 번호가 음수이거나 청크 개수 이상인 경우에 대한 인덱스 범위 체크 누락 |
| starter 빌드 경고 발생 | 사용하지 않은 함수 및 매개변수를 `(void)param;`으로 처리하지 않음 |

## 더 나아가기

- 아레나 마커(`arena_mark` / `arena_rewind`)를 추가하여 특정 시점으로 부분 롤백하는 기능 구현.
- C23의 속성 `[[nodiscard]]`를 모든 할당 함수 반환값에 적용하여 메모리 누수 방지 강화.
- 가변 크기 블록을 처리하는 버디 메모리 할당자(Buddy Allocator)로 확장.

## 참고

- C23 표준 초안 N3220: 6.7.5 정렬 지정자(`alignas`), 6.5.3.4 `alignof`
- Sean Barrett: *Memory Allocation Strategies* (Arena & Temp Allocators)
- Chris Wellons: *Untangling Lifetimes: The Arena Allocator*
