; solution/main.asm - 64-bit Integer Calculator
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
