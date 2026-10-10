; starter/main.asm - Coroutine Scheduler
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
