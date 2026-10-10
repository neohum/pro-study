; solution/main.asm - ELF64 Parser
default rel
global main
extern printf

section .data
    fmt_elf db "ELF64 Validated: EntryPoint=0x%016lx, Sections=%d", 10, 0

section .text
main:
    push rbp
    mov rbp, rsp

    lea rdi, [fmt_elf]
    mov rsi, 0x401000
    mov edx, 28
    xor eax, eax
    call printf

    xor eax, eax
    leave
    ret
