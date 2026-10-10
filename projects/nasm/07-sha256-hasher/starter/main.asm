; starter/main.asm - Pure Assembly SHA-256
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): 0x80 패딩 및 64비트 빅엔디안 길이 첨부
    ; TODO(step-2): W[0..63] 메시지 스케줄 확장
    ; TODO(step-3): 64라운드 압축 루프 전개
    xor eax, eax
    leave
    ret
