; starter/main.asm - ELF64 Parser
default rel
global main

section .text
main:
    push rbp
    mov rbp, rsp
    ; TODO(step-1): 0x7F454C46 매직 바이트 검증
    ; TODO(step-2): e_shoff, e_shnum 섹션 헤더 순회
    ; TODO(step-3): .shstrtab 문자열 역참조 및 심볼 출력
    xor eax, eax
    leave
    ret
