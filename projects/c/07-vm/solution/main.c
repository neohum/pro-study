// 07-vm — 스택 기반 바이트코드 가상 머신 (solution)
//
// 바이트코드 명령어와 스택을 기반으로 동작하는 가상 머신.
// 텍스트 어셈블리를 바이트코드로 컴파일하여 디스패치 루프에서 실행한다.
//
// C23: enum : uint8_t, nullptr, constexpr, [[nodiscard]], auto
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

// ---- Step 1: OpCode 열거형과 VM 스택 기본 연산 ----
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

static void vm_init(VM *vm) {
    vm->sp = 0;
    vm->code_len = 0;
    vm->ip = 0;
}

[[nodiscard]] static bool vm_push(VM *vm, int64_t val) {
    if (vm->sp >= STACK_CAP) {
        printf("error: stack overflow\n");
        return false;
    }
    vm->stack[vm->sp++] = val;
    return true;
}

[[nodiscard]] static bool vm_pop(VM *vm, int64_t *out) {
    if (vm->sp <= 0) {
        printf("error: stack underflow\n");
        return false;
    }
    *out = vm->stack[--vm->sp];
    return true;
}

// ---- Step 2: 산술 연산자와 예외 처리 ----
[[nodiscard]] static bool vm_binop(VM *vm, OpCode op) {
    int64_t b = 0, a = 0;
    if (!vm_pop(vm, &b) || !vm_pop(vm, &a)) {
        return false;
    }
    int64_t res = 0;
    switch (op) {
    case OP_ADD:
        res = a + b;
        break;
    case OP_SUB:
        res = a - b;
        break;
    case OP_MUL:
        res = a * b;
        break;
    case OP_DIV:
        if (b == 0) {
            printf("error: division by zero\n");
            return false;
        }
        res = a / b;
        break;
    case OP_MOD:
        if (b == 0) {
            printf("error: modulo by zero\n");
            return false;
        }
        res = a % b;
        break;
    default:
        return false;
    }
    return vm_push(vm, res);
}

[[nodiscard]] static bool vm_neg(VM *vm) {
    int64_t a = 0;
    if (!vm_pop(vm, &a)) {
        return false;
    }
    return vm_push(vm, -a);
}

// ---- Step 3: 스택 제어 및 분기 명령어 ----
static void vm_dump(const VM *vm) {
    printf("[");
    for (int i = 0; i < vm->sp; i++) {
        if (i > 0) {
            printf(" ");
        }
        printf("%lld", (long long)vm->stack[i]);
    }
    printf("]\n");
}

// ---- Step 4: 텍스트 어셈블러와 라벨 해석 ----
typedef struct Label {
    char name[32];
    size_t offset;
} Label;

typedef struct Assembler {
    Label labels[MAX_LABELS];
    int label_count;
} Assembler;

static void asm_init(Assembler *as) {
    as->label_count = 0;
}

static void asm_add_label(Assembler *as, const char *name, size_t offset) {
    if (as->label_count < MAX_LABELS) {
        strncpy(as->labels[as->label_count].name, name, 31);
        as->labels[as->label_count].name[31] = '\0';
        as->labels[as->label_count].offset = offset;
        as->label_count++;
    }
}

static int32_t asm_resolve_target(const Assembler *as, const char *target_str) {
    for (int i = 0; i < as->label_count; i++) {
        if (strcmp(as->labels[i].name, target_str) == 0) {
            return (int32_t)as->labels[i].offset;
        }
    }
    return (int32_t)atoi(target_str);
}

static bool assemble_program(VM *vm, char lines[MAX_LINES][MAX_LINE], int line_count) {
    Assembler as;
    asm_init(&as);
    vm->code_len = 0;

    // Pass 1: 라벨 위치 계산
    size_t cur_offset = 0;
    for (int i = 0; i < line_count; i++) {
        char *line = lines[i];
        while (isspace((unsigned char)*line)) {
            line++;
        }
        if (*line == '\0' || *line == ';') {
            continue;
        }
        size_t len = strlen(line);
        if (line[len - 1] == ':') {
            char name[32];
            size_t n = len - 1 < 31 ? len - 1 : 31;
            strncpy(name, line, n);
            name[n] = '\0';
            asm_add_label(&as, name, cur_offset);
            continue;
        }
        char mnemonic[32];
        if (sscanf(line, "%31s", mnemonic) != 1) {
            continue;
        }
        if (strcmp(mnemonic, "push") == 0) {
            cur_offset += 1 + sizeof(int64_t);
        } else if (strcmp(mnemonic, "jmp") == 0 || strcmp(mnemonic, "jz") == 0) {
            cur_offset += 1 + sizeof(int32_t);
        } else {
            cur_offset += 1;
        }
    }

    // Pass 2: 바이트코드 방출
    for (int i = 0; i < line_count; i++) {
        char *line = lines[i];
        while (isspace((unsigned char)*line)) {
            line++;
        }
        if (*line == '\0' || *line == ';') {
            continue;
        }
        size_t len = strlen(line);
        if (line[len - 1] == ':') {
            continue;
        }
        char mnemonic[32];
        if (sscanf(line, "%31s", mnemonic) != 1) {
            continue;
        }
        if (strcmp(mnemonic, "push") == 0) {
            int64_t val = 0;
            char *p = line + 4;
            while (isspace((unsigned char)*p)) {
                p++;
            }
            val = (int64_t)strtoll(p, nullptr, 0);
            vm->code[vm->code_len++] = (uint8_t)OP_PUSH;
            memcpy(&vm->code[vm->code_len], &val, sizeof(int64_t));
            vm->code_len += sizeof(int64_t);
        } else if (strcmp(mnemonic, "pop") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_POP;
        } else if (strcmp(mnemonic, "dup") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_DUP;
        } else if (strcmp(mnemonic, "add") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_ADD;
        } else if (strcmp(mnemonic, "sub") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_SUB;
        } else if (strcmp(mnemonic, "mul") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_MUL;
        } else if (strcmp(mnemonic, "div") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_DIV;
        } else if (strcmp(mnemonic, "mod") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_MOD;
        } else if (strcmp(mnemonic, "neg") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_NEG;
        } else if (strcmp(mnemonic, "print") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_PRINT;
        } else if (strcmp(mnemonic, "dump") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_DUMP;
        } else if (strcmp(mnemonic, "jmp") == 0) {
            char target_str[32];
            sscanf(line, "%*s %31s", target_str);
            int32_t target = asm_resolve_target(&as, target_str);
            vm->code[vm->code_len++] = (uint8_t)OP_JMP;
            memcpy(&vm->code[vm->code_len], &target, sizeof(int32_t));
            vm->code_len += sizeof(int32_t);
        } else if (strcmp(mnemonic, "jz") == 0) {
            char target_str[32];
            sscanf(line, "%*s %31s", target_str);
            int32_t target = asm_resolve_target(&as, target_str);
            vm->code[vm->code_len++] = (uint8_t)OP_JZ;
            memcpy(&vm->code[vm->code_len], &target, sizeof(int32_t));
            vm->code_len += sizeof(int32_t);
        } else if (strcmp(mnemonic, "halt") == 0) {
            vm->code[vm->code_len++] = (uint8_t)OP_HALT;
        }
    }
    return true;
}

// ---- Step 5: 디스패치 루프 및 실행 드라이버 ----
static void vm_run(VM *vm) {
    vm->ip = 0;
    while (vm->ip < vm->code_len) {
        uint8_t op = vm->code[vm->ip++];
        switch ((OpCode)op) {
        case OP_NOP:
            break;
        case OP_PUSH: {
            int64_t val = 0;
            memcpy(&val, &vm->code[vm->ip], sizeof(int64_t));
            vm->ip += sizeof(int64_t);
            if (!vm_push(vm, val)) {
                return;
            }
            break;
        }
        case OP_POP: {
            int64_t val = 0;
            if (!vm_pop(vm, &val)) {
                return;
            }
            break;
        }
        case OP_DUP: {
            if (vm->sp <= 0) {
                printf("error: stack underflow\n");
                return;
            }
            if (!vm_push(vm, vm->stack[vm->sp - 1])) {
                return;
            }
            break;
        }
        case OP_ADD:
        case OP_SUB:
        case OP_MUL:
        case OP_DIV:
        case OP_MOD:
            if (!vm_binop(vm, (OpCode)op)) {
                return;
            }
            break;
        case OP_NEG:
            if (!vm_neg(vm)) {
                return;
            }
            break;
        case OP_PRINT: {
            int64_t val = 0;
            if (!vm_pop(vm, &val)) {
                return;
            }
            printf("%lld\n", (long long)val);
            break;
        }
        case OP_DUMP:
            vm_dump(vm);
            break;
        case OP_JMP: {
            int32_t target = 0;
            memcpy(&target, &vm->code[vm->ip], sizeof(int32_t));
            vm->ip = (size_t)target;
            break;
        }
        case OP_JZ: {
            int32_t target = 0;
            memcpy(&target, &vm->code[vm->ip], sizeof(int32_t));
            vm->ip += sizeof(int32_t);
            int64_t cond = 0;
            if (!vm_pop(vm, &cond)) {
                return;
            }
            if (cond == 0) {
                vm->ip = (size_t)target;
            }
            break;
        }
        case OP_HALT:
            return;
        }
    }
}

int main(void) {
    VM vm;
    vm_init(&vm);

    static char lines[MAX_LINES][MAX_LINE];
    int line_count = 0;
    bool has_explicit_run = false;

    char buf[MAX_LINE];
    while (fgets(buf, sizeof(buf), stdin) != nullptr) {
        buf[strcspn(buf, "\r\n")] = '\0';
        char *p = buf;
        while (isspace((unsigned char)*p)) {
            p++;
        }
        if (*p == '\0') {
            continue;
        }

        if (strcmp(p, "run") == 0) {
            has_explicit_run = true;
            if (assemble_program(&vm, lines, line_count)) {
                vm_run(&vm);
            }
            line_count = 0;
        } else if (strcmp(p, "reset") == 0) {
            vm_init(&vm);
            line_count = 0;
        } else {
            if (line_count < MAX_LINES) {
                strncpy(lines[line_count], p, MAX_LINE - 1);
                lines[line_count][MAX_LINE - 1] = '\0';
                line_count++;
            }
        }
    }

    // 파일 끝(EOF) 도달 시, 아직 run을 부르지 않은 잔여 코드가 있으면 자동 실행
    if (!has_explicit_run && line_count > 0) {
        if (assemble_program(&vm, lines, line_count)) {
            vm_run(&vm);
        }
    }

    return 0;
}
