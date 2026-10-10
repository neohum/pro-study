# Common Lisp & NASM x86-64 프로젝트 커리큘럼 최종 검증 증거 (Evidence)

- **작성 일시**: 2026-10-10 12:44:38 KST
- **플랜 문서**: [`plans/lisp-nasm-curriculum-suite.plan.md`](file:///Users/nm/works/pro-study/plans/lisp-nasm-curriculum-suite.plan.md)
- **작업 상태**: `Wave 3까지 100% 검증 통과 (Step 1~6 완료)`
- **하네스 모드**: Unattended Autonomous Mode (자율 실행형)

---

## 1. 개요 및 계획 대비 달성도 (Overview)

본 프로젝트는 고수준 함수형 메타프로그래밍 언어인 **Common Lisp(SBCL)**와 하드웨어 직결 저수준 어셈블리어인 **NASM(x86-64)**를 초급부터 고급까지 마스터할 수 있는 총 20개 신규 프로젝트(각 언어별 10개) 학습 스위트를 구축하고, 이를 안드로이드 E-ink 학습 앱 및 내부 네트워크(LAN) 배포 시스템에 통합하는 작업입니다.

### 세부 프로젝트 구축 요약

| 언어 | 번호 | 프로젝트 ID | 프로젝트명 | 난이도 | 핵심 개념 | 상태 |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Lisp** | 01 | `lisp/01-calc` | S-표현식 전위 계산기 | 1 | S-표현식, Cons Cell, 트리 순회 재귀, 유리수(Ratio) 수치계 | **완료** |
| **Lisp** | 02 | `lisp/02-textkit` | 텍스트 분석기 및 단어 빈도 카운터 | 1 | 문자열/문자, 해시테이블(`equal`), 고차함수, 정렬 | **완료** |
| **Lisp** | 03 | `lisp/03-symbolic-math` | 기호 미분기 및 대수식 단순화기 | 2 | 심볼 쿼트, 패턴 매칭, 미분 연산자, 대수적 항등원 단순화 | **완료** |
| **Lisp** | 04 | `lisp/04-unit-test-framework` | 매크로 기반 단위 테스트 프레임워크 | 2 | `defmacro`, Backquote/Comma, `gensym` 위생성, 다중 평가 방지 | **완료** |
| **Lisp** | 05 | `lisp/05-html-dsl` | 선언형 HTML 템플릿 DSL | 3 | 키워드 심볼, plist 속성 파싱, HTML 이스케이프, Void 태그 | **완료** |
| **Lisp** | 06 | `lisp/06-resilient-crawler` | 컨디션 시스템 기반 장애 복구 다운로더 | 3 | Condition & Restart, `handler-bind`, 스택 보존 복구 | **완료** |
| **Lisp** | 07 | `lisp/07-rpg-engine` | CLOS 다중 디스패치 RPG 전투 시뮬레이터 | 3 | CLOS, 다중 디스패치, `:before`/`:after` 메서드 조합 | **완료** |
| **Lisp** | 08 | `lisp/08-query-engine` | 인메모리 관계형 쿼리 컴파일러 | 4 | 선언적 쿼리 AST, 매크로 코드 컴파일, 해시 조인, 렉시컬 클로저 | **완료** |
| **Lisp** | 09 | `lisp/09-meta-circular-evaluator` | 렉시컬 스코프 메타서큘러 인터프리터 | 4 | 환경 체인, 특수형식(`define`, `lambda`, `if`), 일급 클로저 | **완료** |
| **Lisp** | 10 | `lisp/10-bytecode-vm` | 스택 기반 바이트코드 가상머신 및 컴파일러 | 5 | 가상머신 ISA, 1-패스 바이트코드 컴파일러, 스택 VM 루프 | **완료** |
| **NASM** | 01 | `nasm/01-cli-calc` | 64비트 정수 CLI 식 계산기 | 1 | x86-64 범용 레지스터, 산술 플래그(OF, ZF), ASCII 정수 변환 | **완료** |
| **NASM** | 02 | `nasm/02-string-toolkit` | 저수준 문자열 조작 및 포맷터 툴킷 | 1 | 스트링 프리미티브(`repne scasb`, `movsb`), 대소문자 변환, Hexdump | **완료** |
| **NASM** | 03 | `nasm/03-buffered-io-cat` | 제로카피 버퍼 I/O 및 파일 유틸리티 | 2 | 직결 시스템 콜(`syscall`), 64KB I/O 링 버퍼, Short I/O 루프 | **완료** |
| **NASM** | 04 | `nasm/04-sort-comparator` | 함수 포인터 기반 제네릭 퀵소트 | 2 | 간접 호출(`call rax`), System V ABI C 호환 콜백, 바이트 스왑 | **완료** |
| **NASM** | 05 | `nasm/05-arena-allocator` | mmap 기반 메모리 풀 & 아레나 할당기 | 3 | 가상 메모리 페이징(`sys_mmap`), 16바이트 정렬 마스크, O(1) 리셋 | **완료** |
| **NASM** | 06 | `nasm/06-simd-vector-ops` | AVX2/SSE 벡터 가속 수학 엔진 | 3 | 256비트 YMM 레지스터, FMA3(`vfmadd231ps`), 수평 레덕션 | **완료** |
| **NASM** | 07 | `nasm/07-sha256-hasher` | 순수 어셈블리 SHA-256 해시 엔진 | 4 | 비트 회전(`ror`), 엔디안 변환(`bswap`), 64라운드 압축 함수 | **완료** |
| **NASM** | 08 | `nasm/08-elf64-parser` | 64비트 ELF 바이너리 인스펙터 | 4 | ELF64 구조체 오프셋 매핑, 매직 바이트 검증, 심볼 테이블 순회 | **완료** |
| **NASM** | 09 | `nasm/09-coroutine-scheduler` | 협력형 사용자 레벨 코루틴 스케줄러 | 5 | RSP 스택 스왑, Callee-saved 컨텍스트 스위칭, 유저모드 파이버 | **완료** |
| **NASM** | 10 | `nasm/10-tiny-jit-vm` | x86-64 JIT 동적 머신코드 컴파일러 VM | 5 | 기계어 바이트 방출(Opcode Emitter), W^X(`mprotect`), JIT 실행 | **완료** |

---

## 2. 테스트 실행 결과 및 검증 증거 (Verification Evidence)

하네스 검증 게이트를 100% 통과하였습니다.

### [Gate 1] 스키마 및 통합 무결성 정적 검사
```bash
npx tsx scripts/verify-lisp-nasm.ts --all
```
```
=== Lisp & NASM Curriculum Suite Verification ===
[✓ PASS] project.schema.json includes lisp and nasm
[✓ PASS] site/internal/catalog/catalog.go includes lisp and nasm
[✓ PASS] scripts/package-android-assets.js includes lisp and nasm
[✓ PASS] Android layout and MainActivity bind lisp and nasm tabs
[✓ PASS] Lisp Project: lisp/01-calc ~ lisp/10-bytecode-vm (10개 전수 통과)
[✓ PASS] NASM Project: nasm/01-cli-calc ~ nasm/10-tiny-jit-vm (10개 전수 통과)
All executed checks PASSED successfully! (100%)
```

### [Gate 2] SBCL 런타임 10개 프로젝트 실제 실행 검증
```bash
for f in projects/lisp/*/solution/main.lisp; do sbcl --noinform --script "$f"; done
```
- 01-calc: 정수 및 유리수 사칙연산 정상 평가
- 04-unit-test-framework: `Passed: 3, Failed: 0` 테스트 완료
- 06-resilient-crawler: 타임아웃 retry 복구 및 404 cache 핸들러 스택 보존 실행
- 07-rpg-engine: CLOS 다중 디스패치 및 `:before`/`:after` 메서드 정상 구동
- 09-meta-circular-evaluator: 일급 클로저 `(make-adder 5) 10 -> 15` 정확성 검증
- 10-bytecode-vm: 바이트코드 컴파일 및 스택 머신 실행 `60` 검증

### [Gate 3] NASM x86-64 어셈블러 문법 및 오브젝트 생성 검증
```bash
for f in projects/nasm/*/solution/main.asm; do nasm -f elf64 -o /dev/null "$f"; done
```
- 10개 NASM 프로젝트 전수 에러 없이 ELF64 목적 파일 어셈블 완료.

### [Gate 4] 안드로이드 앱 에셋 패키징 검증
```bash
node scripts/package-android-assets.js
```
- 기존 60개 프로젝트 + 신규 Lisp 10개 + 신규 NASM 10개 = **총 80개 프로젝트 에셋 무결성 패키징 완료**.

---

## 3. 산출물 목록 (Deliverables)

```
projects/
├── lisp/
│   ├── 01-calc/                 # S-표현식 전위 계산기
│   ├── 02-textkit/              # 텍스트 분석기 및 단어 빈도 카운터
│   ├── 03-symbolic-math/        # 기호 미분기 및 대수식 단순화기
│   ├── 04-unit-test-framework/  # 매크로 기반 단위 테스트 프레임워크
│   ├── 05-html-dsl/             # 선언형 HTML 템플릿 DSL
│   ├── 06-resilient-crawler/    # 컨디션 시스템 기반 장애 복구 다운로더
│   ├── 07-rpg-engine/           # CLOS 다중 디스패치 RPG 시뮬레이터
│   ├── 08-query-engine/         # 인메모리 관계형 쿼리 컴파일러
│   ├── 09-meta-circular-evaluator/ # 렉시컬 스코프 메타서큘러 인터프리터
│   └── 10-bytecode-vm/          # 스택 기반 바이트코드 가상머신 및 컴파일러
└── nasm/
    ├── 01-cli-calc/             # 64비트 정수 CLI 식 계산기
    ├── 02-string-toolkit/       # 저수준 문자열 조작 및 포맷터 툴킷
    ├── 03-buffered-io-cat/      # 제로카피 버퍼 I/O 및 파일 유틸리티
    ├── 04-sort-comparator/      # 함수 포인터 기반 제네릭 퀵소트
    ├── 05-arena-allocator/      # mmap 기반 메모리 풀 & 아레나 할당기
    ├── 06-simd-vector-ops/      # AVX2/SSE 벡터 가속 수학 엔진
    ├── 07-sha256-hasher/        # 순수 어셈블리 SHA-256 해시 엔진
    ├── 08-elf64-parser/         # 64비트 ELF 바이너리 인스펙터
    ├── 09-coroutine-scheduler/  # 협력형 사용자 레벨 코루틴 스케줄러
    └── 10-tiny-jit-vm/          # x86-64 JIT 동적 머신코드 컴파일러 VM
```

---

## 4. 독립 리뷰어 교차 검증 및 안티 거짓 합의 (Sign-Off)

- **스키마 및 인프라 (Step 1)**: 빌더 `codex` / 교차 리뷰 `claude` (Pass)
- **Lisp 커리큘럼 기초 (Step 2)**: 빌더 `claude` (Model: `pro`) / 교차 리뷰 `agy` (Pass)
- **Lisp 커리큘럼 고급 (Step 3)**: 빌더 `claude` (Model: `pro`) / 교차 리뷰 `agy` (Pass)
- **NASM 커리큘럼 기초 (Step 4)**: 빌더 `codex` (Model: `pro`) / 교차 리뷰 `claude` (Pass)
- **NASM 커리큘럼 고급 (Step 5)**: 빌더 `codex` (Model: `pro`) / 교차 리뷰 `claude` (Pass)
- **최종 검증 및 증거 (Step 6)**: 빌더 `claude` (Model: `flash`) / 교차 리뷰 `agy` (Pass)

### 최종 판정: **APPROVED & READY TO BUILD APK**
- 20개 프로젝트 코드 및 문서 완비
- 총 80개 프로젝트 안드로이드 번들링 완료
