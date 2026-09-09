// 09-threadpool — 스레드풀 작업 큐 (starter)
//
// POSIX pthread 뮤텍스와 조건 변수를 활용한 고정 크기 스레드풀 및 작업 큐.
// 메인 스레드가 작업을 제출하면 워커 스레드들이 병렬로 작업을 실행하고,
// 결과를 동기화 버퍼에 모아 작업 ID 오름차순으로 정렬하여 출력한다.
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// C23: constexpr 컴파일 시간 상수
constexpr size_t MAX_LINE = 1'024;
constexpr size_t DEFAULT_QUEUE_CAP = 16;
constexpr size_t DEFAULT_THREADS = 4;

// C23: 밑바탕 타입을 지정한 enum
typedef enum OpType : unsigned char {
    OP_SUM,
    OP_FIB,
    OP_PRIME,
    OP_REVERSE,
} OpType;

typedef struct Task {
    int id;
    OpType op;
    long long arg;
    char str_arg[64];
} Task;

typedef struct TaskResult {
    int id;
    OpType op;
    long long num_result;
    char str_result[128];
} TaskResult;

// ---------------------------------------------------------------------------
// TODO(step-1): 원형 작업 큐 (Circular FIFO Queue)
// 고정 배열 items를 head와 tail 인덱스로 순환하는 원형 버퍼를 구현한다.
// - queue_init: items 동적 할당 및 인덱스 초기화
// - queue_destroy: items 해제
// - queue_push: 버퍼가 꽉 찼으면 false, 아니면 tail에 넣고 카운트 증가
// - queue_pop: 버퍼가 비었으면 false, 아니면 head에서 꺼내고 카운트 감소
// ---------------------------------------------------------------------------
typedef struct Queue {
    Task *items;
    size_t head;
    size_t tail;
    size_t count;
    size_t capacity;
} Queue;

[[maybe_unused]] static void queue_init(Queue *q, size_t capacity) {
    (void)q;
    (void)capacity;
}

[[maybe_unused]] static void queue_destroy(Queue *q) {
    (void)q;
}

[[maybe_unused]] [[nodiscard]] static bool queue_push(Queue *q, Task task) {
    (void)q;
    (void)task;
    return false;
}

[[maybe_unused]] [[nodiscard]] static bool queue_pop(Queue *q, Task *out) {
    (void)q;
    (void)out;
    return false;
}

// ---------------------------------------------------------------------------
// 작업 연산 도우미
// ---------------------------------------------------------------------------
static long long eval_sum(long long n) {
    if (n <= 0) return 0;
    return n * (n + 1) / 2;
}

static long long eval_fib(long long n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    long long a = 0, b = 1;
    for (long long i = 2; i <= n; i++) {
        long long next = a + b;
        a = b;
        b = next;
    }
    return b;
}

static long long eval_prime(long long n) {
    if (n < 2) return 0;
    long long count = 0;
    for (long long i = 2; i <= n; i++) {
        bool is_prime = true;
        for (long long d = 2; d * d <= i; d++) {
            if (i % d == 0) {
                is_prime = false;
                break;
            }
        }
        if (is_prime) count++;
    }
    return count;
}

static void eval_reverse(const char *src, char *dst, size_t dst_size) {
    size_t len = strlen(src);
    if (len >= dst_size) {
        len = dst_size - 1;
    }
    for (size_t i = 0; i < len; i++) {
        dst[i] = src[len - 1 - i];
    }
    dst[len] = '\0';
}

static TaskResult execute_task(const Task *task) {
    TaskResult res = {
        .id = task->id,
        .op = task->op,
        .num_result = 0,
        .str_result = {0},
    };
    switch (task->op) {
    case OP_SUM:
        res.num_result = eval_sum(task->arg);
        break;
    case OP_FIB:
        res.num_result = eval_fib(task->arg);
        break;
    case OP_PRIME:
        res.num_result = eval_prime(task->arg);
        break;
    case OP_REVERSE:
        eval_reverse(task->str_arg, res.str_result, sizeof(res.str_result));
        break;
    }
    return res;
}

// ---------------------------------------------------------------------------
// TODO(step-2): 스레드풀 생성과 워커 스레드 루프
// - ThreadPool 구조체: 워커 스레드 배열, 작업 큐, lock(뮤텍스), 조건 변수 3개
//   (not_empty, not_full, all_done), working_count, shutdown 플래그
// - worker_loop:
//   1) lock 획득
//   2) 큐가 비어있고 !shutdown 이면 not_empty 대기 (while 루프)
//   3) shutdown이고 큐가 비었으면 탈출
//   4) queue_pop 성공 시 working_count 증가 및 not_full 시그널
//   5) lock 해제
//   6) execute_task 호출 (락 밖에서 실행!)
//   7) lock 획득 후 record_result 및 working_count 감소
//   8) 큐가 비고 working_count == 0 이면 all_done 브로드캐스트
//   9) lock 해제
// ---------------------------------------------------------------------------
typedef struct ThreadPool {
    pthread_t *threads;
    size_t thread_count;
    Queue queue;
    pthread_mutex_t lock;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
    pthread_cond_t all_done;
    size_t working_count;
    bool shutdown;

    TaskResult *results;
    size_t result_count;
    size_t result_capacity;
} ThreadPool;

static void record_result(ThreadPool *pool, TaskResult res) {
    if (pool->result_count >= pool->result_capacity) {
        size_t new_cap = pool->result_capacity == 0 ? 16 : pool->result_capacity * 2;
        TaskResult *new_res = (TaskResult *)realloc(pool->results, new_cap * sizeof(TaskResult));
        if (new_res == nullptr) return;
        pool->results = new_res;
        pool->result_capacity = new_cap;
    }
    pool->results[pool->result_count++] = res;
}

static void *worker_loop(void *arg) {
    (void)arg;
    (void)record_result;
    (void)execute_task;
    return nullptr;
}

[[nodiscard]] static ThreadPool *threadpool_create(size_t threads, size_t queue_cap) {
    (void)threads;
    (void)queue_cap;
    (void)worker_loop;
    return nullptr;
}

// ---------------------------------------------------------------------------
// TODO(step-3): 작업 제출과 생산자 동기화
// - lock 획득 후 shutdown 검사
// - 큐가 꽉 차 있으면 not_full 조건 변수 대기 (while 루프)
// - queue_push 로 작업 추가 후 not_empty 시그널 전송
// - lock 해제 후 true 반환
// ---------------------------------------------------------------------------
[[nodiscard]] static bool threadpool_submit(ThreadPool *pool, Task task) {
    (void)pool;
    (void)task;
    return false;
}

// ---------------------------------------------------------------------------
// TODO(step-4): 작업 완료 대기 및 결과 취합
// - lock 획득 후 queue.count > 0 || working_count > 0 인 동안 all_done 대기
// - 수집된 results를 compare_results로 qsort 정렬
// - print_result로 출력 후 result_count를 0으로 리셋
// - lock 해제
// ---------------------------------------------------------------------------
static int compare_results(const void *a, const void *b) {
    const TaskResult *ra = (const TaskResult *)a;
    const TaskResult *rb = (const TaskResult *)b;
    if (ra->id < rb->id) return -1;
    if (ra->id > rb->id) return 1;
    return 0;
}

static void print_result(const TaskResult *res) {
    if (res->op == OP_REVERSE) {
        printf("result %d: %s\n", res->id, res->str_result);
    } else {
        printf("result %d: %lld\n", res->id, res->num_result);
    }
}

static void threadpool_wait(ThreadPool *pool) {
    (void)pool;
    (void)compare_results;
    (void)print_result;
}

// ---------------------------------------------------------------------------
// TODO(step-5): 스레드풀 정상 종료 및 REPL 인터페이스
// - threadpool_destroy:
//   1) shutdown = true 설정 후 not_empty, not_full 브로드캐스트
//   2) 모든 워커 스레드 pthread_join
//   3) 큐, 결과 배열, 동기화 객체 정리 및 free
// - main:
//   표준 입력에서 한 줄씩 읽어 pool, submit, wait, status, shutdown 명령 처리
// ---------------------------------------------------------------------------
static void threadpool_destroy(ThreadPool *pool) {
    (void)pool;
}

int main(void) {
    ThreadPool *pool = nullptr;
    char line[MAX_LINE];

    while (fgets(line, sizeof(line), stdin) != nullptr) {
        char *p = line;
        while (*p == ' ' || *p == '\t') p++;
        if (*p == '\0' || *p == '\n' || *p == '\r' || *p == '#') {
            continue;
        }

        char cmd[32];
        if (sscanf(p, "%31s", cmd) != 1) {
            continue;
        }

        if (strcmp(cmd, "pool") == 0) {
            size_t th = DEFAULT_THREADS;
            size_t cap = DEFAULT_QUEUE_CAP;
            if (sscanf(p, "%*s %zu %zu", &th, &cap) < 2) {
                printf("error: invalid arguments\n");
                continue;
            }
            if (pool != nullptr) {
                threadpool_destroy(pool);
            }
            pool = threadpool_create(th, cap);
            printf("pool created: threads=%zu, queue=%zu\n", th, cap);
        } else if (strcmp(cmd, "submit") == 0) {
            if (pool == nullptr) {
                pool = threadpool_create(DEFAULT_THREADS, DEFAULT_QUEUE_CAP);
            }
            int id = 0;
            char op_str[32] = {0};
            char arg_str[64] = {0};
            if (sscanf(p, "%*s %d %31s %63s", &id, op_str, arg_str) < 3) {
                printf("error: invalid arguments\n");
                continue;
            }
            Task task = {0};
            task.id = id;
            if (strcmp(op_str, "sum") == 0) {
                task.op = OP_SUM;
                task.arg = atoll(arg_str);
            } else if (strcmp(op_str, "fib") == 0) {
                task.op = OP_FIB;
                task.arg = atoll(arg_str);
            } else if (strcmp(op_str, "prime") == 0) {
                task.op = OP_PRIME;
                task.arg = atoll(arg_str);
            } else if (strcmp(op_str, "reverse") == 0) {
                task.op = OP_REVERSE;
                strncpy(task.str_arg, arg_str, sizeof(task.str_arg) - 1);
            } else {
                printf("error: unknown op '%s'\n", op_str);
                continue;
            }
            if (threadpool_submit(pool, task)) {
                printf("submitted %d\n", id);
            } else {
                printf("error: submit failed\n");
            }
        } else if (strcmp(cmd, "wait") == 0) {
            if (pool != nullptr) {
                threadpool_wait(pool);
            }
        } else if (strcmp(cmd, "status") == 0) {
            if (pool != nullptr) {
                printf("status: queue=%zu/%zu, working=%zu\n",
                       pool->queue.count, pool->queue.capacity, pool->working_count);
            } else {
                printf("status: no pool\n");
            }
        } else if (strcmp(cmd, "shutdown") == 0) {
            if (pool != nullptr) {
                threadpool_destroy(pool);
                pool = nullptr;
                printf("pool shutdown\n");
            }
        } else {
            printf("error: unknown command\n");
        }
    }

    if (pool != nullptr) {
        threadpool_destroy(pool);
    }
    return 0;
}
