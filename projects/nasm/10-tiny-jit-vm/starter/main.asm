; starter/main.asm - Tiny JIT VM
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
