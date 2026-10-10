# 저수준 문자열 조작 및 포맷터 툴킷 (Low-Level String & Formatter Toolkit)

## 📌 프로젝트 개요
C 표준 라이브러리 없이 x86-64의 고속 스트링 프리미티브 명령어(`repne scasb`, `lodsb`, `stosb`)와 니블(Nibble) 분리 비트 연산을 직접 작성합니다.

## 🎯 학습 목표
1. `repne scasb`를 이용한 초고속 문자열 길이 측정 (`str_len`)
2. ASCII 문자 범위 검사 및 대문자화 비트 연산 (`and al, 0xDF`)
3. 양방향 포인터 스왑을 통한 문자열 뒤집기 (`str_rev`)
4. 16바이트 청크 단위 Hexdump 출력 서식 작성
