; starter/main.asm - AVX2 SIMD Math Engine
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): vmovups로 8개 float 병렬 로드
    ; TODO(step-2): vfmadd231ps FMA 곱셈 누산
    ; TODO(step-3): vextractf128 및 수평 합산
    xor eax, eax
    leave
    ret
