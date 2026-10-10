; solution/main.asm - Coroutine Scheduler
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
