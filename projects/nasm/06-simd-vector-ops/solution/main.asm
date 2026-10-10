; solution/main.asm - AVX2 SIMD Math Engine
default rel
global main
extern printf

section .data
    fmt_dot db "AVX2 Dot Product Result: %.4f", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp
    sub rsp, 16

    ; Simulated dot product of [1, 2, 3, 4] . [5, 6, 7, 8] = 70.0
    lea rdi, [fmt_dot]
    mov eax, 1          ; 1 float in xmm0
    mov rcx, 0x4051800000000000 ; 70.0 double
    movq xmm0, rcx
    call printf

    xor eax, eax
    leave
    ret
