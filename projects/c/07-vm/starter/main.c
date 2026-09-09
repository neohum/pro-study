// 07-vm — 스택 기반 바이트코드 가상 머신 (starter)
//
// 가이드의 "단계별 구현"과 아래 TODO(step-N) 주석이 1:1로 대응한다.
// 각 단계를 끝낼 때마다 빌드해서 경고가 없는지 확인하자.
#include <ctype.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

constexpr int STACK_CAP = 256;
constexpr size_t CODE_CAP = 4'096;
constexpr int MAX_LINES = 512;
constexpr int MAX_LINE = 1'024;
constexpr int MAX_LABELS = 64;

// ---------------------------------------------------------------------------
// TODO(step-1): OpCode 열거형과 VM 스택 기본 연산
// C23 enum : uint8_t로 1바이트 명령어 코드를 정의하고, push/pop 기본 스택 연산을 구현한다.
// ---------------------------------------------------------------------------
typedef enum OpCode : uint8_t {
    OP_NOP = 0,
    OP_PUSH,
    OP_POP,
    OP_DUP,
    OP_ADD,
    OP_SUB,
    OP_MUL,
    OP_DIV,
    OP_MOD,
    OP_NEG,
    OP_PRINT,
    OP_DUMP,
    OP_JMP,
    OP_JZ,
    OP_HALT,
} OpCode;

typedef struct VM {
    int64_t stack[STACK_CAP];
    int sp;
    uint8_t code[CODE_CAP];
    size_t code_len;
    size_t ip;
} VM;

[[maybe_unused]] static void vm_init(VM *vm) {
    (void)vm;
    // TODO(step-1)
}

[[maybe_unused]] static bool vm_push(VM *vm, int64_t val) {
    (void)vm;
    (void)val;
    return false; // TODO(step-1)
}

[[maybe_unused]] static bool vm_pop(VM *vm, int64_t *out) {
    (void)vm;
    (void)out;
    return false; // TODO(step-1)
}

// ---------------------------------------------------------------------------
// TODO(step-2): 산술 연산자와 예외 처리
// 스택에서 두 피연산자를 pop하여 연산 후 push한다. 0으로 나누기는 오류 처리한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static bool vm_binop(VM *vm, OpCode op) {
    (void)vm;
    (void)op;
    return false; // TODO(step-2)
}

[[maybe_unused]] static bool vm_neg(VM *vm) {
    (void)vm;
    return false; // TODO(step-2)
}

// ---------------------------------------------------------------------------
// TODO(step-3): 스택 제어 및 분기 명령어
// 스택의 원소들을 순서대로 출력하는 vm_dump 및 조건/무조건 분기 처리를 위한 기반을 마련한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static void vm_dump(const VM *vm) {
    (void)vm;
    // TODO(step-3)
}

// ---------------------------------------------------------------------------
// TODO(step-4): 텍스트 어셈블러와 라벨 해석
// 텍스트 명령어를 읽어 바이트 배열(code)에 적재하고 라벨 위치를 계산한다.
// ---------------------------------------------------------------------------
typedef struct Label {
    char name[32];
    size_t offset;
} Label;

typedef struct Assembler {
    Label labels[MAX_LABELS];
    int label_count;
} Assembler;

[[maybe_unused]] static bool assemble_program(VM *vm, char lines[MAX_LINES][MAX_LINE], int line_count) {
    (void)vm;
    (void)lines;
    (void)line_count;
    return false; // TODO(step-4)
}

// ---------------------------------------------------------------------------
// TODO(step-5): 디스패치 루프 및 실행 드라이버
// 바이트코드를 순차 실행하며 switch-case로 명령어를 디스패치하는 루프를 작성한다.
// ---------------------------------------------------------------------------
[[maybe_unused]] static void vm_run(VM *vm) {
    (void)vm;
    // TODO(step-5)
}

int main(void) {
    char buf[MAX_LINE];
    // TODO(step-5): 입력 루프 처리
    while (fgets(buf, sizeof(buf), stdin) != nullptr) {
        buf[strcspn(buf, "\r\n")] = '\0';
        if (buf[0] == '\0') {
            continue;
        }
    }
    return 0;
}
