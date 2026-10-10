; starter/main.asm - String Toolkit
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): repne scasb로 길이 측정
    ; TODO(step-2): 대소문자 변환 및 역순 정렬
    ; TODO(step-3): 16진수 덤프 출력
    xor eax, eax
    leave
    ret
