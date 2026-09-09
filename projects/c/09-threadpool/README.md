# 09. 스레드풀 작업 큐

## 무엇을 만드는가

POSIX pthread를 활용하여 고정된 개수의 워커 스레드가 원형 링 버퍼 큐(FIFO)에서 작업을
가져와 병렬로 실행하고, 동기화된 결과 버퍼에 결과를 기록한 뒤 안전하게 회수하는 **스레드풀(Thread Pool)**을 만든다.

표준 입력에서 한 줄씩 명령을 받아 작업을 제출(`submit`), 완료 대기(`wait`), 상태 조회(`status`),
종료(`shutdown`)한다:

```
$ build/app.exe
pool 4 8
pool created: threads=4, queue=8
submit 1 fib 10
submitted 1
submit 2 sum 100
submitted 2
submit 3 prime 30
submitted 3
submit 4 reverse hello_world
submitted 4
wait
result 1: 55
result 2: 5050
result 3: 10
result 4: dlrow_olleh
done: 4 tasks
shutdown
pool shutdown
```

워커들이 병렬로 비동기 실행되더라도, `wait` 호출 시 각 작업의 결과는 작업 ID 순서대로
안전하고 결정적(deterministic)으로 정렬되어 출력된다.

## 왜 이 프로젝트인가

스레드를 매 작업마다 생성(`pthread_create`)하고 소멸(`pthread_join`)하는 것은 커널 컨텍스트
스위칭과 스택 할당 비용이 매우 크다. 현대 백엔드 서버와 고성능 엔진(DB, 런타임, 웹 서버)은
스레드풀을 두어 스레드를 재사용하고 시스템 자원 고갈을 방지한다.

이 프로젝트는 동시성 프로그래밍의 3대 핵심 난제를 직접 해결한다:
1. **생산자-소비자 패턴**: 메인 스레드가 작업을 넣고 워커들이 가져가는 동기화.
2. **조건 변수(Condition Variable)의 바른 사용**: `while` 루프로 허위 깨어남(spurious wakeup) 방지.
3. **경쟁 상태(Race Condition) 없는 상태 전이와 종료**: 실행 중인 작업과 큐의 잔여 작업을 안전하게 비우는 그레이스풀 셧다운(Graceful Shutdown).

C23의 `nullptr`, `constexpr`, `auto`, `[[nodiscard]]`, `enum : unsigned char`를 적용하여
현대적이고 안전한 멀티스레드 C 코드를 작성한다.

## 핵심 개념

### 생산자-소비자 패턴과 조건 변수

뮤텍스(`pthread_mutex_t`)만으로는 "큐가 비었을 때 대기"하거나 "큐가 꽉 찼을 때 대기"하는 동작을
효율적으로 구현할 수 없다. 비지 웨이팅(busy-waiting)을 피하기 위해 조건 변수(`pthread_cond_t`)를 사용한다.

```c
// 소비자(워커 스레드): 큐가 비어 있으면 잠든다
pthread_mutex_lock(&pool->lock);
while (pool->queue.count == 0 && !pool->shutdown) {
    pthread_cond_wait(&pool->not_empty, &pool->lock);
}
// 큐에서 꺼낸 뒤 공간이 생겼음을 생산자에게 알림
pthread_cond_signal(&pool->not_full);
pthread_mutex_unlock(&pool->lock);
```

> **규칙**: `pthread_cond_wait`는 반드시 `while` 루프 안에서 호출해야 한다. 시그널을 받고 깨어났더라도
> 다른 스레드가 먼저 작업을 가로챘을 수 있고, OS 커널 수준의 Spurious Wakeup이 발생할 수 있기 때문이다.

### 원형 링 버퍼 (Circular Ring Buffer)

작업 큐는 고정 크기 배열을 순환하는 원형 버퍼로 구현한다. `head`는 꺼내는 위치, `tail`은
삽입하는 위치다. 원소 삽입 시 `tail = (tail + 1) % capacity`, 추출 시 `head = (head + 1) % capacity`로
$O(1)$의 효율적인 큐 연산을 수행한다.

```c
typedef struct Queue {
    Task *items;
    size_t head;
    size_t tail;
    size_t count;
    size_t capacity;
} Queue;
```

### 세 가지 조건 변수의 협력

스레드풀은 세 가지 조건 변수가 맞물려 동작한다:
- `not_empty`: 큐에 작업이 들어왔음을 워커 스레드에게 알림 (소비자 깨움).
- `not_full`: 큐에서 작업이 빠져나가 빈 공간이 생겼음을 생산자(메인 스레드)에게 알림.
- `all_done`: 큐의 잔여 작업과 실행 중인 워커 수가 모두 0이 되었음을 `wait` 호출자에게 알림.

### 락 밖에서 실행하기 (Fine-Grained Locking)

가장 흔한 실수는 작업을 실행하는 동안 뮤텍스를 쥐고 있는 것이다. 그러면 워커가 아무리 많아도
단 하나의 스레드만 실행되어 병렬성의 이점이 사라진다.
작업을 큐에서 꺼낸 즉시 **뮤텍스를 해제한 뒤 연산을 수행**하고, 결과를 저장할 때만 다시 락을 잡아야 한다.

### C23 기능 활용

```c
constexpr size_t DEFAULT_QUEUE_CAP = 16;
constexpr size_t DEFAULT_THREADS = 4;
typedef enum OpType : unsigned char {
    OP_SUM,
    OP_FIB,
    OP_PRIME,
    OP_REVERSE,
} OpType;
[[nodiscard]] static bool queue_push(Queue *q, Task task);
```

## 단계별 구현

`starter/main.c`의 `TODO(step-N)` 주석이 아래 단계와 1:1이다.
단계마다 빌드하여 경고가 없는지 확인하자.

### Step 1: 원형 작업 큐
`Queue` 구조체의 초기화(`queue_init`), 해제(`queue_destroy`), 삽입(`queue_push`), 추출(`queue_pop`)을 구현한다.
버퍼가 꽉 찼을 때 `queue_push`는 `false`를 반환하고, 비었을 때 `queue_pop`은 `false`를 반환해야 한다.

확인: `gcc -std=c23 -Wall -Wextra -g -o build/app.exe main.c` 빌드가 경고 없이 통과한다.

### Step 2: 스레드풀 생성과 워커 스레드 루프
`ThreadPool` 구조체를 할당하고 뮤텍스와 세 조건 변수(`not_empty`, `not_full`, `all_done`)를 초기화한다.
`pthread_create`로 워커 스레드들을 생성하고, `worker_loop`에서 `not_empty`를 기다리며 작업을 꺼내
락을 푼 상태에서 실행(`execute_task`)하도록 작성한다.

확인: 스레드 생성 루프가 정상 동작하고 워커들이 대기 상태로 진입한다.

### Step 3: 작업 제출과 생산자 동기화
`threadpool_submit`을 구현한다. 큐가 꽉 차 있으면 `not_full` 조건 변수로 대기한다.
작업이 큐에 들어가면 `pthread_cond_signal(&pool->not_empty)`로 쉬고 있는 워커 중 하나를 깨운다.

확인: `submit` 명령이 큐에 작업을 정상적으로 밀어 넣는다.

### Step 4: 작업 완료 대기 및 결과 취합
`threadpool_wait`를 구현한다. 큐에 남아 있는 작업 수(`count`)와 현재 실행 중인 워커 수(`working_count`)가
모두 0이 될 때까지 `all_done` 조건 변수를 대기한다.
대기가 끝나면 수집된 결과들을 작업 ID 순으로 `qsort` 정렬하여 출력하고 결과를 비운다.

확인: 여러 작업을 동시에 실행해도 `wait` 시 ID 순서대로 결과가 결정적으로 출력된다.

### Step 5: 스레드풀 정상 종료 및 REPL 인터페이스
`threadpool_destroy`에서 `shutdown` 플래그를 세우고 `pthread_cond_broadcast`로 모든 워커를 깨운 뒤,
`pthread_join`으로 모든 스레드가 종료되기를 기다려 메모리와 동기화 객체를 정리한다.
`main` 함수에 표준 입력 명령(`pool`, `submit`, `wait`, `status`, `shutdown`)을 처리하는 REPL을 연결한다.

확인: `[테스트]`를 실행하여 모든 케이스가 통과하는지 확인한다.

## 막혔을 때

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `undefined reference to pthread_create` | 링크 옵션 누락 | MinGW gcc에서 `-pthread` 또는 `<pthread.h>` 링크 상태 확인 |
| `wait`에서 영원히 멈춤(데드락) | `working_count` 갱신 누락 | 워커가 작업을 마칠 때 `working_count--` 후 `count==0 && working==0`이면 `all_done` 시그널 전송 |
| 결과가 간헐적으로 깨지거나 섞임 | 결과 버퍼 락 누락 | `record_result` 호출 시 `pool->lock`을 획득하고 결과를 기록해야 함 |
| `shutdown` 후 프로그램이 종료되지 않음 | 워커가 `pthread_cond_wait`에서 멈춤 | `shutdown = true` 설정 후 `pthread_cond_broadcast(&pool->not_empty)`로 모든 워커를 깨움 |
| 순서가 매번 달라져 테스트 실패 | 정렬 누락 | `threadpool_wait`에서 `qsort`를 이용해 작업 ID 오름차순으로 결과를 정렬 후 출력 |

## 더 나아가기

- **작업 취소(Cancellation)**: 큐에 아직 대기 중인 특정 ID의 작업을 취소하는 `cancel <id>` 명령을 구현해 보자.
- **동적 스레드풀 크기 조절**: 대기 큐의 길이에 따라 워커 스레드 수를 동적으로 늘리거나 줄이는 오토스케일링을 추가해 보자.
- **우선순위 큐**: FIFO 대신 우선순위 힙(Heap) 기반 작업 큐로 변경하여 긴급 작업을 먼저 처리하게 해 보자.

## 참고

- POSIX Threads Programming (LLNL Tutorial): <https://hpc-tutorials.llnl.gov/posix/>
- C23 표준 (ISO/IEC 9899:2024 N3220): 7.21.1 `nullptr`, 6.7.1 `constexpr`, 6.7.13 Attributes
- *Programming with POSIX Threads* by David R. Butenhof
