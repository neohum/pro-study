# mmap 기반 메모리 풀 & 아레나 할당기 (mmap Linear Arena & Bump Allocator)

## 📌 프로젝트 개요
OS 커널의 `sys_mmap` 시스템 콜로 4KB 페이지 단위 가상 메모리를 획득하고, 16바이트 정렬을 보장하는 초고속 범프 포인터(Bump pointer) 아레나를 구축합니다.
