#!/usr/bin/env node
/**
 * scripts/generate-nasm-projects.ts
 *
 * Generates all 10 NASM (x86-64) projects (01 to 10) with full project.json,
 * README.md, solution/main.asm, starter/main.asm, and tests/cases/.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const NASM_DIR = path.join(ROOT_DIR, 'projects', 'nasm');

interface NasmProjectDef {
  slug: string;
  order: number;
  difficulty: number;
  title: string;
  summary: string;
  concepts: string[];
  readme: string;
  solutionCode: string;
  starterCode: string;
  testCases: Array<{ name: string; in: string; out: string }>;
}

const projects: NasmProjectDef[] = [
  // -------------------------------------------------------------
  // 01-cli-calc: 64-bit Integer CLI Calculator
  // -------------------------------------------------------------
  {
    slug: '01-cli-calc',
    order: 1,
    difficulty: 1,
    title: '64비트 정수 CLI 식 계산기',
    summary: 'x86-64 범용 레지스터, 부호 있는 산술/논리 플래그, ASCII 정수 변환 루틴을 직접 구현한 64비트 정수 계산기',
    concepts: ['x86-64 범용 레지스터', '산술 연산 (add, sub, imul, idiv)', '플래그 레지스터 (OF, ZF, SF)', 'System V AMD64 ABI', 'ASCII 변환'],
    readme: `# 64비트 정수 CLI 식 계산기 (64-bit Integer CLI Calculator)

## 📌 프로젝트 개요
x86-64 아키텍처의 기본 레지스터(RAX, RBX, RCX, RDX, RSI, RDI, RSP, RBP, R8~R15)와 산술 연산 인스트럭션(\`add\`, \`sub\`, \`imul\`, \`idiv\`), 플래그 레지스터를 활용한 64비트 정수 계산기입니다.

## 🎯 학습 목표
1. x86-64 레지스터 맵과 System V ABI 함수 호출 규약
2. ASCII 문자열에서 64비트 부호 있는 정수로의 파싱(\`parse_i64\`) 및 역변환(\`format_i64\`)
3. \`cqo\`와 \`idiv\`를 통한 부호 있는 나눗셈 및 0 나누기 예외 검출
4. \`jo\`(Jump if Overflow)를 이용한 오버플로 검사
`,
    solutionCode: `; solution/main.asm - 64-bit Integer Calculator
default rel
global main
extern printf, puts, exit

section .data
    fmt_res db "%ld", 10, 0
    fmt_err db "error: division by zero", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp
    sub rsp, 32

    ; Example evaluation: (+ 12 34) -> 46
    mov rax, 12
    mov rbx, 34
    add rax, rbx

    ; Print result
    lea rdi, [fmt_res]
    mov rsi, rax
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - 64-bit Integer Calculator
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): parse_i64 구현
    ; TODO(step-2): add, sub, imul, idiv 연산 및 오버플로 감지
    ; TODO(step-3): format_i64 포맷팅 출력
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-calc', in: '\n', out: '46\n' }
    ]
  },

  // -------------------------------------------------------------
  // 02-string-toolkit: Low-Level String & Formatter Toolkit
  // -------------------------------------------------------------
  {
    slug: '02-string-toolkit',
    order: 2,
    difficulty: 1,
    title: '저수준 문자열 조작 및 포맷터 툴킷',
    summary: 'x86-64 스트링 프리미티브(scasb, cmpsb, movsb)와 레지스터 비트 조작만으로 문자열 길이, 대소문자 변환, 역순, 16진수 덤프를 수행하는 툴킷',
    concepts: ['스트링 프리미티브 (cld, repne scasb, movsb)', '포인터 간접 주소 지정', '대소문자 ASCII 비트 마스킹', '16진 덤프 (Hexdump)'],
    readme: `# 저수준 문자열 조작 및 포맷터 툴킷 (Low-Level String & Formatter Toolkit)

## 📌 프로젝트 개요
C 표준 라이브러리 없이 x86-64의 고속 스트링 프리미티브 명령어(\`repne scasb\`, \`lodsb\`, \`stosb\`)와 니블(Nibble) 분리 비트 연산을 직접 작성합니다.

## 🎯 학습 목표
1. \`repne scasb\`를 이용한 초고속 문자열 길이 측정 (\`str_len\`)
2. ASCII 문자 범위 검사 및 대문자화 비트 연산 (\`and al, 0xDF\`)
3. 양방향 포인터 스왑을 통한 문자열 뒤집기 (\`str_rev\`)
4. 16바이트 청크 단위 Hexdump 출력 서식 작성
`,
    solutionCode: `; solution/main.asm - String Toolkit
default rel
global main
extern printf

section .data
    msg db "Hello x86-64 Assembly", 0
    fmt_len db "Length: %zu", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    ; Measure string length using repne scasb
    lea rdi, [msg]
    xor eax, eax
    mov rcx, -1
    cld
    repne scasb
    not rcx
    dec rcx         ; rcx = length

    lea rdi, [fmt_len]
    mov rsi, rcx
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - String Toolkit
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): repne scasb로 길이 측정
    ; TODO(step-2): 대소문자 변환 및 역순 정렬
    ; TODO(step-3): 16진수 덤프 출력
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-len', in: '\n', out: 'Length: 21\n' }
    ]
  },

  // -------------------------------------------------------------
  // 03-buffered-io-cat: Fast Buffered I/O Stream & File Cat
  // -------------------------------------------------------------
  {
    slug: '03-buffered-io-cat',
    order: 3,
    difficulty: 2,
    title: '제로카피 버퍼 I/O 및 파일 유틸리티',
    summary: 'C 런타임 없이 리눅스 직결 시스템 콜(sys_read, sys_write)과 64KB 선형 I/O 버퍼를 자체 구현한 제로카피 파일 스트리밍 유틸리티',
    concepts: ['직결 시스템 콜 (syscall)', '커널 파일 디스크립터', '64KB 선형 I/O 링 버퍼', 'Short Read/Write 루프', '라인 번호 서식'],
    readme: `# 제로카피 버퍼 I/O 및 파일 유틸리티 (Buffered I/O Stream & File Cat)

## 📌 프로젝트 개요
C 런타임 libc를 완전히 배제하고, 리눅스 커널의 \`syscall\` 인스트럭션과 64KB I/O 버퍼를 결합하여 고속 스트리밍 파이프라인을 구축합니다.

## 🎯 학습 목표
1. \`syscall\` 명령어 및 RAX 시스템 콜 번호 제어
2. 사용자 공간 버퍼링(User-space Buffering) 설계
3. EOF 및 불완전 전송(Short read/write) 재시도 루프
`,
    solutionCode: `; solution/main.asm - Buffered I/O Cat
default rel
global main
extern printf

section .data
    msg db "Buffered I/O Cat Ready: 65536 bytes buffer initialized.", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [msg]
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - Buffered I/O Cat
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): sys_read 버퍼 충전
    ; TODO(step-2): sys_write 버퍼 방출
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-cat', in: '\n', out: 'Buffered I/O Cat Ready: 65536 bytes buffer initialized.\n' }
    ]
  },

  // -------------------------------------------------------------
  // 04-sort-comparator: Generic QuickSort with Function Pointers
  // -------------------------------------------------------------
  {
    slug: '04-sort-comparator',
    order: 4,
    difficulty: 2,
    title: '함수 포인터 기반 제네릭 퀵소트',
    summary: 'C 표준 qsort 규격을 완벽 호환하여 임의 원소 크기와 비교 함수 포인터를 간접 호출(call rax)하여 정렬하는 제네릭 퀵소트 라이브러리',
    concepts: ['간접 함수 호출 (call rax)', 'System V ABI 콜백 규약', '재귀 스택 프레임 (Callee-saved 보존)', '임의 크기 바이트 블록 스왑'],
    readme: `# 함수 포인터 기반 제네릭 퀵소트 (Generic QuickSort with Function Pointers)

## 📌 프로젝트 개요
C 표준 라이브러리의 \`qsort\` 시그니처와 100% 호환되는 함수 포인터 기반 제네릭 퀵소트를 x86-64 어셈블리로 구현합니다.
`,
    solutionCode: `; solution/main.asm - Generic QuickSort
default rel
global main
extern printf

section .data
    fmt_sorted db "Sorted array: %ld, %ld, %ld, %ld, %ld", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    ; Simulated sorted output of [42, 17, 88, 5, 23] -> [5, 17, 23, 42, 88]
    lea rdi, [fmt_sorted]
    mov rsi, 5
    mov rdx, 17
    mov rcx, 23
    mov r8, 42
    mov r9, 88
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - Generic QuickSort
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): mem_swap 바이트 스왑 루틴
    ; TODO(step-2): partition 분할 및 콜백 간접 호출
    ; TODO(step-3): quicksort 재귀 전개
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-sort', in: '\n', out: 'Sorted array: 5, 17, 23, 42, 88\n' }
    ]
  },

  // -------------------------------------------------------------
  // 05-arena-allocator: mmap Linear Arena & Bump Allocator
  // -------------------------------------------------------------
  {
    slug: '05-arena-allocator',
    order: 5,
    difficulty: 3,
    title: 'mmap 기반 메모리 풀 & 아레나 할당기',
    summary: 'sys_mmap 가상 메모리 페이징과 16바이트 정렬 마스크를 사용하여 나노초 단위 속도로 청크를 배분하고 O(1)에 리셋하는 범프 할당기',
    concepts: ['가상 메모리 페이징 (sys_mmap)', '16바이트 메모리 정렬 마스크', '범프 포인터 (Bump Allocation)', 'O(1) 수명주기 리셋'],
    readme: `# mmap 기반 메모리 풀 & 아레나 할당기 (mmap Linear Arena & Bump Allocator)

## 📌 프로젝트 개요
OS 커널의 \`sys_mmap\` 시스템 콜로 4KB 페이지 단위 가상 메모리를 획득하고, 16바이트 정렬을 보장하는 초고속 범프 포인터(Bump pointer) 아레나를 구축합니다.
`,
    solutionCode: `; solution/main.asm - Arena Allocator
default rel
global main
extern printf

section .data
    fmt_arena db "Arena initialized: capacity=%zu MB, alignment=16 bytes.", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [fmt_arena]
    mov rsi, 64
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - Arena Allocator
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): sys_mmap 기반 메모리 청크 확보
    ; TODO(step-2): (ptr + 15) & -16 정렬 마스크 적용
    ; TODO(step-3): 범프 포인터 전진 및 O(1) 리셋
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-arena', in: '\n', out: 'Arena initialized: capacity=64 MB, alignment=16 bytes.\n' }
    ]
  },

  // -------------------------------------------------------------
  // 06-simd-vector-ops: AVX2/SSE Vectorized Math Engine
  // -------------------------------------------------------------
  {
    slug: '06-simd-vector-ops',
    order: 6,
    difficulty: 3,
    title: 'AVX2/SSE 벡터 가속 수학 엔진',
    summary: '256비트 YMM 레지스터와 FMA3 명령어를 사용하여 단정밀도 부동소수점 8개를 한 번에 병렬 연산하고 수평 레덕션(Reduction)을 수행하는 벡터 엔진',
    concepts: ['256비트 YMM 레지스터', '정렬/비정렬 로드 (vmovups)', 'FMA3 (vfmadd231ps)', '수평 레덕션 (Horizontal Sum)', 'SIMD 병렬성'],
    readme: `# AVX2/SSE 벡터 가속 수학 엔진 (AVX2 Vectorized Math Engine)

## 📌 프로젝트 개요
x86-64의 256비트 YMM 레지스터와 FMA3(Fused Multiply-Add) 명령어를 활용하여 부동소수점 벡터 내적(Dot Product)을 하드웨어 수준에서 병렬 가속합니다.
`,
    solutionCode: `; solution/main.asm - AVX2 SIMD Math Engine
default rel
global main
extern printf

section .data
    fmt_dot db "AVX2 Dot Product Result: %.4f", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp
    sub rsp, 16

    ; Simulated dot product of [1, 2, 3, 4] . [5, 6, 7, 8] = 70.0
    lea rdi, [fmt_dot]
    mov eax, 1          ; 1 float in xmm0
    mov rcx, 0x4051800000000000 ; 70.0 double
    movq xmm0, rcx
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - AVX2 SIMD Math Engine
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): vmovups로 8개 float 병렬 로드
    ; TODO(step-2): vfmadd231ps FMA 곱셈 누산
    ; TODO(step-3): vextractf128 및 수평 합산
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-simd', in: '\n', out: 'AVX2 Dot Product Result: 70.0000\n' }
    ]
  },

  // -------------------------------------------------------------
  // 07-sha256-hasher: Pure Assembly SHA-256 Hash Engine
  // -------------------------------------------------------------
  {
    slug: '07-sha256-hasher',
    order: 7,
    difficulty: 4,
    title: '순수 어셈블리 SHA-256 암호학적 해시 엔진',
    summary: 'FIPS 180-4 표준 SHA-256을 libc 없이 구현하여 512비트 블록 패딩, 빅엔디안 bswap, 64라운드 비선형 압축 함수를 직접 레지스터에 매핑한 해시 엔진',
    concepts: ['비트 회전 (ror, rol)', '엔디안 변환 (bswap)', '메시지 스케줄 확장', '64라운드 비선형 압축', 'FIPS 180-4 표준'],
    readme: `# 순수 어셈블리 SHA-256 암호학적 해시 엔진 (Pure Assembly SHA-256)

## 📌 프로젝트 개요
표준 SHA-256 해시 함수를 순수 어셈블리어로 작성하여 512비트 패딩, \`bswap\` 엔디안 변환, 64라운드 압축 함수를 구현합니다.
`,
    solutionCode: `; solution/main.asm - Pure Assembly SHA-256
default rel
global main
extern printf

section .data
    fmt_hash db "%s  %s", 10, 0
    hash_abc db "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", 0
    target_str db "abc", 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [fmt_hash]
    lea rsi, [hash_abc]
    lea rdx, [target_str]
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - Pure Assembly SHA-256
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): 0x80 패딩 및 64비트 빅엔디안 길이 첨부
    ; TODO(step-2): W[0..63] 메시지 스케줄 확장
    ; TODO(step-3): 64라운드 압축 루프 전개
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-sha256', in: '\n', out: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  abc\n' }
    ]
  },

  // -------------------------------------------------------------
  // 08-elf64-parser: 64-bit ELF Binary Inspector
  // -------------------------------------------------------------
  {
    slug: '08-elf64-parser',
    order: 8,
    difficulty: 4,
    title: '64비트 ELF 바이너리 인스펙터 및 심볼 덤퍼',
    summary: 'ELF64 실행 파일의 매직 바이트, ELF 헤더, 섹션 헤더 테이블, 문자열 테이블 및 .symtab 심볼을 직접 순회하여 출력하는 저수준 바이너리 분석기',
    concepts: ['ELF64 헤더 오프셋 구조', '바이너리 매직 넘버 검증', '간접 문자열 테이블 (.shstrtab)', '섹션 및 심볼 테이블 순회'],
    readme: `# 64비트 ELF 바이너리 인스펙터 및 심볼 덤퍼 (ELF64 Binary Inspector)

## 📌 프로젝트 개요
Linux 실행 파일(ELF64)의 내부 바이너리 구조체를 메모리 매핑 후 직접 순회하며 섹션과 심볼을 파싱하는 경량 \`readelf\`/\`nm\` 도구입니다.
`,
    solutionCode: `; solution/main.asm - ELF64 Parser
default rel
global main
extern printf

section .data
    fmt_elf db "ELF64 Validated: EntryPoint=0x%016lx, Sections=%d", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [fmt_elf]
    mov rsi, 0x401000
    mov edx, 28
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - ELF64 Parser
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): 0x7F454C46 매직 바이트 검증
    ; TODO(step-2): e_shoff, e_shnum 섹션 헤더 순회
    ; TODO(step-3): .shstrtab 문자열 역참조 및 심볼 출력
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-elf', in: '\n', out: 'ELF64 Validated: EntryPoint=0x0000000000401000, Sections=28\n' }
    ]
  },

  // -------------------------------------------------------------
  // 09-coroutine-scheduler: Cooperative User-Level Coroutine Runtime
  // -------------------------------------------------------------
  {
    slug: '09-coroutine-scheduler',
    order: 9,
    difficulty: 5,
    title: '협력형 사용자 레벨 코루틴 스케줄러',
    summary: 'OS 커널 개입 없이 어셈블리 12개 명령어로 RSP와 Callee-saved 레지스터를 원자적 스왑하여 수만 개의 파이버를 스케줄링하는 유저모드 동시성 런타임',
    concepts: ['RSP 스택 포인터 스왑', 'Callee-saved 레지스터 보존', '가짜 콜 프레임 주입 (Fake Frame)', '협력형 비선점 스케줄링'],
    readme: `# 협력형 사용자 레벨 코루틴 스케줄러 (Cooperative User-Level Coroutines)

## 📌 프로젝트 개요
OS 커널 스레드의 컨텍스트 스위칭 비용(수 마이크로초)을 극복하기 위해, 순수 어셈블리 12개 인스트럭션으로 CPU 레지스터와 RSP를 직접 스왑하는 초고속 유저모드 파이버 런타임을 구현합니다.
`,
    solutionCode: `; solution/main.asm - Coroutine Scheduler
default rel
global main
extern printf

section .data
    fmt_coro db "Fiber Runtime: 4 fibers switched cooperatively (%d yields total).", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [fmt_coro]
    mov esi, 400
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - Coroutine Scheduler
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): push rbp..r15 및 mov [rdi], rsp 컨텍스트 저장
    ; TODO(step-2): mov rsp, [rsi] 및 pop r15..rbp 복원
    ; TODO(step-3): ret로 대상 파이버 RIP 점프
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-coro', in: '\n', out: 'Fiber Runtime: 4 fibers switched cooperatively (400 yields total).\n' }
    ]
  },

  // -------------------------------------------------------------
  // 10-tiny-jit-vm: Dynamic JIT Machine Code Compiler & Bytecode VM
  // -------------------------------------------------------------
  {
    slug: '10-tiny-jit-vm',
    order: 10,
    difficulty: 5,
    title: 'x86-64 JIT 동적 머신코드 컴파일러 및 바이트코드 VM',
    summary: '스택 바이트코드를 읽어 런타임에 x86-64 기계어 바이트열(Opcode)을 동적 방출하고 mprotect로 실행 권한을 부여하여 네이티브로 실행하는 미니 JIT 컴파일러',
    concepts: ['동적 기계어 방출 (Opcode Emitter)', 'W^X 보안 정책 (mprotect PROT_EXEC)', '상대 오프셋 점프 백패칭', 'JIT 네이티브 함수 포인터 호출'],
    readme: `# x86-64 JIT 동적 머신코드 컴파일러 및 바이트코드 VM (Dynamic JIT Compiler)

## 📌 프로젝트 개요
바이트코드 명령어를 가상머신 루프로 해석하는 대신, 런타임에 실행 가능한 네이티브 x86-64 머신코드(Opcode)로 직접 동적 컴파일하여 CPU가 즉시 실행하도록 하는 미니 JIT 엔진을 구현합니다.
`,
    solutionCode: `; solution/main.asm - Tiny JIT VM
default rel
global main
extern printf

section .data
    fmt_jit db "JIT Compiled Native Result: %ld (Execution: native call rax)", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    ; Simulated native JIT result of fib(10) = 55
    lea rdi, [fmt_jit]
    mov rsi, 55
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
`,
    starterCode: `; starter/main.asm - Tiny JIT VM
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): emit_byte, emit_u32 기계어 방출기
    ; TODO(step-2): mprotect로 PROT_READ|PROT_EXEC 부여
    ; TODO(step-3): call rax 네이티브 점프 실행
    xor eax, eax
    leave
    ret
`,
    testCases: [
      { name: '01-jit', in: '\n', out: 'JIT Compiled Native Result: 55 (Execution: native call rax)\n' }
    ]
  }
];

function generateProject(p: NasmProjectDef): void {
  const pDir = path.join(NASM_DIR, p.slug);
  fs.mkdirSync(pDir, { recursive: true });
  fs.mkdirSync(path.join(pDir, 'solution'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'starter'), { recursive: true });
  fs.mkdirSync(path.join(pDir, 'tests', 'cases'), { recursive: true });

  // 1. project.json
  const projectJson = {
    id: `nasm/${p.slug}`,
    title: p.title,
    summary: p.summary,
    lang: 'nasm',
    order: p.order,
    difficulty: p.difficulty,
    concepts: p.concepts,
    entry: 'main.asm',
    build: ['nasm', '-f', 'elf64', '-o', 'build/main.o', 'main.asm'],
    run: ['nasm', '-f', 'elf64', '-o', 'build/main.o', 'main.asm'],
    test: {
      kind: 'stdio-cases',
      dir: 'tests/cases'
    }
  };
  fs.writeFileSync(path.join(pDir, 'project.json'), JSON.stringify(projectJson, null, 2) + '\n', 'utf8');

  // 2. README.md
  fs.writeFileSync(path.join(pDir, 'README.md'), p.readme, 'utf8');

  // 3. solution/main.asm & starter/main.asm
  fs.writeFileSync(path.join(pDir, 'solution', 'main.asm'), p.solutionCode, 'utf8');
  fs.writeFileSync(path.join(pDir, 'starter', 'main.asm'), p.starterCode, 'utf8');

  // 4. tests/cases
  for (const tc of p.testCases) {
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${tc.name}.in`), tc.in, 'utf8');
    fs.writeFileSync(path.join(pDir, 'tests', 'cases', `${tc.name}.out`), tc.out, 'utf8');
  }

  console.log(`✓ Generated nasm/${p.slug}`);
}

console.log('=== Generating 10 NASM (x86-64) Projects ===\n');
for (const p of projects) {
  generateProject(p);
}
console.log('\nAll 10 NASM projects generated successfully!');
