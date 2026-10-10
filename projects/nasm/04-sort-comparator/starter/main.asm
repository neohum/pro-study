; starter/main.asm - Generic QuickSort
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): mem_swap 바이트 스왑 루틴
    ; TODO(step-2): partition 분할 및 콜백 간접 호출
    ; TODO(step-3): quicksort 재귀 전개
    xor eax, eax
    leave
    ret
