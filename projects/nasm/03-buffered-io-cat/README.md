# 제로카피 버퍼 I/O 및 파일 유틸리티 (Buffered I/O Stream & File Cat)

## 📌 프로젝트 개요
C 런타임 libc를 완전히 배제하고, 리눅스 커널의 `syscall` 인스트럭션과 64KB I/O 버퍼를 결합하여 고속 스트리밍 파이프라인을 구축합니다.

## 🎯 학습 목표
1. `syscall` 명령어 및 RAX 시스템 콜 번호 제어
2. 사용자 공간 버퍼링(User-space Buffering) 설계
3. EOF 및 불완전 전송(Short read/write) 재시도 루프
