; starter/main.asm - Buffered I/O Cat
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): sys_read 버퍼 충전
    ; TODO(step-2): sys_write 버퍼 방출
    xor eax, eax
    leave
    ret
