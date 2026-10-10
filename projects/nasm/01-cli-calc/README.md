# 64비트 정수 CLI 식 계산기 (64-bit Integer CLI Calculator)

## 📌 프로젝트 개요
x86-64 아키텍처의 기본 레지스터(RAX, RBX, RCX, RDX, RSI, RDI, RSP, RBP, R8~R15)와 산술 연산 인스트럭션(`add`, `sub`, `imul`, `idiv`), 플래그 레지스터를 활용한 64비트 정수 계산기입니다.

## 🎯 학습 목표
1. x86-64 레지스터 맵과 System V ABI 함수 호출 규약
2. ASCII 문자열에서 64비트 부호 있는 정수로의 파싱(`parse_i64`) 및 역변환(`format_i64`)
3. `cqo`와 `idiv`를 통한 부호 있는 나눗셈 및 0 나누기 예외 검출
4. `jo`(Jump if Overflow)를 이용한 오버플로 검사
