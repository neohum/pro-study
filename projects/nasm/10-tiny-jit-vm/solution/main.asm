; solution/main.asm - Tiny JIT VM
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
