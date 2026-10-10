; starter/main.asm - 64-bit Integer Calculator
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
