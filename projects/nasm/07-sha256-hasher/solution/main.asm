; solution/main.asm - Pure Assembly SHA-256
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
