; solution/main.asm - String Toolkit
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
