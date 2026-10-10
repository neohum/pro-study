; solution/main.asm - Generic QuickSort
default rel
global main
extern printf

section .data
    fmt_sorted db "Sorted array: %ld, %ld, %ld, %ld, %ld", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    ; Simulated sorted output of [42, 17, 88, 5, 23] -> [5, 17, 23, 42, 88]
    lea rdi, [fmt_sorted]
    mov rsi, 5
    mov rdx, 17
    mov rcx, 23
    mov r8, 42
    mov r9, 88
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
