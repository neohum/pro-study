// 09-threadpool — 스레드풀 작업 큐 (solution)
//
// POSIX pthread 뮤텍스와 조건 변수를 활용한 고정 크기 스레드풀 및 작업 큐.
// 메인 스레드가 작업을 제출하면 워커 스레드들이 병렬로 작업을 실행하고,
// 결과를 동기화 버퍼에 모아 작업 ID 오름차순으로 정렬하여 출력한다.

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
// Step 1: 원형 작업 큐 (Circular FIFO Queue)
// ---------------------------------------------------------------------------
typedef struct Queue {
    Task *items;
    size_t head;
    size_t tail;
    size_t count;
    size_t capacity;
} Queue;

static void queue_init(Queue *q, size_t capacity) {
    q->items = (Task *)malloc(capacity * sizeof(Task));
    q->head = 0;
    q->tail = 0;
    q->count = 0;
    q->capacity = capacity;
}

static void queue_destroy(Queue *q) {
    free(q->items);
    q->items = nullptr;
    q->head = 0;
    q->tail = 0;
    q->count = 0;
    q->capacity = 0;
}

[[nodiscard]] static bool queue_push(Queue *q, Task task) {
    if (q->count >= q->capacity) {
        return false;
    }
    q->items[q->tail] = task;
    q->tail = (q->tail + 1) % q->capacity;
    q->count++;
    return true;
}

[[nodiscard]] static bool queue_pop(Queue *q, Task *out) {
    if (q->count == 0) {
        return false;
    }
    *out = q->items[q->head];
    q->head = (q->head + 1) % q->capacity;
    q->count--;
    return true;
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
// Step 2: 스레드풀 구조체와 워커 루프
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
    ThreadPool *pool = (ThreadPool *)arg;
    while (true) {
        pthread_mutex_lock(&pool->lock);
        while (pool->queue.count == 0 && !pool->shutdown) {
            pthread_cond_wait(&pool->not_empty, &pool->lock);
        }
        if (pool->shutdown && pool->queue.count == 0) {
            pthread_mutex_unlock(&pool->lock);
            break;
        }

        Task task;
        bool ok = queue_pop(&pool->queue, &task);
        if (ok) {
            pool->working_count++;
            pthread_cond_signal(&pool->not_full);
        }
        pthread_mutex_unlock(&pool->lock);

        if (!ok) continue;

        // 락 밖에서 실행 (Fine-Grained)
        TaskResult res = execute_task(&task);

        // 결과 기록 및 완료 확인
        pthread_mutex_lock(&pool->lock);
        record_result(pool, res);
        pool->working_count--;
        if (pool->queue.count == 0 && pool->working_count == 0) {
            pthread_cond_broadcast(&pool->all_done);
        }
        pthread_mutex_unlock(&pool->lock);
    }
    return nullptr;
}

[[nodiscard]] static ThreadPool *threadpool_create(size_t threads, size_t queue_cap) {
    ThreadPool *pool = (ThreadPool *)calloc(1, sizeof(ThreadPool));
    if (pool == nullptr) return nullptr;

    pool->thread_count = threads;
    pool->threads = (pthread_t *)malloc(threads * sizeof(pthread_t));
    if (pool->threads == nullptr) {
        free(pool);
        return nullptr;
    }

    queue_init(&pool->queue, queue_cap);
    pthread_mutex_init(&pool->lock, nullptr);
    pthread_cond_init(&pool->not_empty, nullptr);
    pthread_cond_init(&pool->not_full, nullptr);
    pthread_cond_init(&pool->all_done, nullptr);

    pool->working_count = 0;
    pool->shutdown = false;
    pool->results = nullptr;
    pool->result_count = 0;
    pool->result_capacity = 0;

    for (size_t i = 0; i < threads; i++) {
        pthread_create(&pool->threads[i], nullptr, worker_loop, pool);
    }
    return pool;
}

// ---------------------------------------------------------------------------
// Step 3: 작업 제출과 생산자 동기화
// ---------------------------------------------------------------------------
[[nodiscard]] static bool threadpool_submit(ThreadPool *pool, Task task) {
    if (pool == nullptr) return false;
    pthread_mutex_lock(&pool->lock);
    if (pool->shutdown) {
        pthread_mutex_unlock(&pool->lock);
        return false;
    }
    while (pool->queue.count == pool->queue.capacity && !pool->shutdown) {
        pthread_cond_wait(&pool->not_full, &pool->lock);
    }
    if (pool->shutdown) {
        pthread_mutex_unlock(&pool->lock);
        return false;
    }

    (void)queue_push(&pool->queue, task);
    pthread_cond_signal(&pool->not_empty);
    pthread_mutex_unlock(&pool->lock);
    return true;
}

// ---------------------------------------------------------------------------
// Step 4: 작업 완료 대기 및 결과 취합
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
    if (pool == nullptr) return;
    pthread_mutex_lock(&pool->lock);
    while (pool->queue.count > 0 || pool->working_count > 0) {
        pthread_cond_wait(&pool->all_done, &pool->lock);
    }
    qsort(pool->results, pool->result_count, sizeof(TaskResult), compare_results);
    for (size_t i = 0; i < pool->result_count; i++) {
        print_result(&pool->results[i]);
    }
    printf("done: %zu tasks\n", pool->result_count);
    pool->result_count = 0;
    pthread_mutex_unlock(&pool->lock);
}

// ---------------------------------------------------------------------------
// Step 5: 스레드풀 정상 종료 및 REPL 인터페이스
// ---------------------------------------------------------------------------
static void threadpool_destroy(ThreadPool *pool) {
    if (pool == nullptr) return;
    pthread_mutex_lock(&pool->lock);
    pool->shutdown = true;
    pthread_cond_broadcast(&pool->not_empty);
    pthread_cond_broadcast(&pool->not_full);
    pthread_mutex_unlock(&pool->lock);

    for (size_t i = 0; i < pool->thread_count; i++) {
        pthread_join(pool->threads[i], nullptr);
    }

    free(pool->threads);
    queue_destroy(&pool->queue);
    free(pool->results);
    pthread_mutex_destroy(&pool->lock);
    pthread_cond_destroy(&pool->not_empty);
    pthread_cond_destroy(&pool->not_full);
    pthread_cond_destroy(&pool->all_done);
    free(pool);
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
                pthread_mutex_lock(&pool->lock);
                printf("status: queue=%zu/%zu, working=%zu\n",
                       pool->queue.count, pool->queue.capacity, pool->working_count);
                pthread_mutex_unlock(&pool->lock);
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
