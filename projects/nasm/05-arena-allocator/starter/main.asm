; starter/main.asm - Arena Allocator
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): sys_mmap 기반 메모리 청크 확보
    ; TODO(step-2): (ptr + 15) & -16 정렬 마스크 적용
    ; TODO(step-3): 범프 포인터 전진 및 O(1) 리셋
    xor eax, eax
    leave
    ret
