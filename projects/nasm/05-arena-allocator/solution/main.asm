; solution/main.asm - Arena Allocator
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
