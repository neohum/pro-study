; solution/main.asm - Buffered I/O Cat
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
