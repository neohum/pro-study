---
plan: lisp-nasm-curriculum-suite
status: approved
risk: medium
owner: neohum
---
# Plan: Common Lisp & NASM x86-64 초급~고급 필수 프로젝트 커리큘럼 구축 및 APK 내부망 배포

## Intent
함수형 메타프로그래밍의 정점인 **Common Lisp(SBCL 기반)**와 시스템 하드웨어 직접 제어의 정점인 **NASM(x86-64 / System V AMD64 ABI)** 두 언어를 밑바닥부터 실전까지 마스터할 수 있는 20대 핵심 프로젝트(각 10개) 학습 스위트를 구축한다:
1. **Common Lisp 10대 프로젝트**:
   - `01-calc`: S-표현식 전위 표기 수식 파서 및 임의 정밀도 유리수 계산기
   - `02-textkit`: 고차 함수 및 해시 테이블 기반 텍스트 분석기 & 단어 빈도 카운터
   - `03-symbolic-math`: 기호 미분(`diff`) 및 대수적 항등원 트리 단순화기
   - `04-unit-test-framework`: `defmacro`, `gensym`, 역따옴표 기반 위생적 단위 테스트 프레임워크
   - `05-html-dsl`: 중첩 S-표현식 파싱 및 컴파일 타임 최적화 선언형 HTML5 템플릿 DSL
   - `06-resilient-crawler`: 스택 보존 Condition & Restart(`handler-bind`, `invoke-restart`) 장애 복구 다운로더
   - `07-rpg-engine`: CLOS 다중 디스패치(Multiple Dispatch) 및 메서드 조합(`:before`, `:after`, `:around`) 턴제 배틀 시뮬레이터
   - `08-query-engine`: 인메모리 테이블 레코드 대상 선언적 쿼리(`select`, `from`, `join`, `where`) 매크로 컴파일러
   - `09-meta-circular-evaluator`: 렉시컬 스코프 환경 체인 및 일급 클로저를 갖춘 Lisp 메타순환 평가기
   - `10-bytecode-vm`: 1-패스 바이트코드 컴파일러, 디스어셈블러 및 스택 기반 가상머신(VM)
2. **NASM x86-64 10대 프로젝트**:
   - `01-cli-calc`: 64비트 레지스터(RAX, RDX), 산술/논리 플래그, ASCII 정수 변환 CLI 식 계산기
   - `02-string-toolkit`: 스트링 프리미티브(`repne scasb`, `movsb`, `lodsb`), 대소문자 변환, 16진수 덤프(Hexdump) 유틸리티
   - `03-buffered-io-cat`: C 라이브러리 없는 순수 직결 시스템 콜(`syscall`), 64KB I/O 링 버퍼 제로카피 파일 뷰어
   - `04-sort-comparator`: 간접 함수 호출(`call rax`), System V ABI C 호환 함수 포인터 기반 제네릭 퀵소트
   - `05-arena-allocator`: `sys_mmap` 가상 메모리 페이징 및 16바이트 정렬 마스크 기반 초고속 범프 포인터 아레나 할당기
   - `06-simd-vector-ops`: AVX2/SSE 256비트 YMM 레지스터, FMA3, 수평 레덕션(Reduction) 벡터 가속 수학 엔진
   - `07-sha256-hasher`: FIPS 180-4 표준 순수 어셈블리 SHA-256 512비트 블록 패딩 및 64라운드 암호학적 해시 엔진
   - `08-elf64-parser`: ELF64 구조체 오프셋 매핑, 매직 바이트 검증, 섹션 헤더 및 심볼 테이블(`.symtab`) 덤퍼
   - `09-coroutine-scheduler`: OS 커널 없는 Callee-saved 컨텍스트 스위칭, RSP 스왑, 가드 페이지 기반 유저모드 파이버 런타임
   - `10-tiny-jit-vm`: W^X(`mprotect`) 동적 기계어 방출(Byte Emitter), 백패칭, JIT 네이티브 머신코드 실행 VM
3. **스키마 및 러너 카탈로그 확장**:
   - `projects/_schema/project.schema.json`에 `lisp` 및 `nasm`을 정식 언어로 편입.
   - Go 웹 사이트 카탈로그(`site/internal/catalog/catalog.go`) 및 안드로이드 에셋 패키징 스크립트(`scripts/package-android-assets.js`) 확장.
   - 안드로이드 E-ink 메인 화면에 Lisp 및 NASM 탭 추가.
4. **Android APK 빌드 및 내부 네트워크 배포**:
   - 신규 20개 프로젝트가 모두 포함된 최신 디버그 APK(`pro-study-v2.2.2.apk`) 재빌드.
   - 내부망(LAN) 웹 서버(`http://172.30.1.91:8787/apk`) 서빙 및 다운로드 엔드포인트 제공.

## Non-goals
- x86 32비트 레거시 모드 지원 (모든 어셈블리는 64비트 System V AMD64 ABI 표준 단일화)
- 외부 상용 Lisp 벤더 특정 확장 (ANSI Common Lisp 표준 및 SBCL 단일화)
- 단순 텍스트 문서만 존재하고 컴파일/실행 불가능한 가짜 코드 (모든 프로젝트는 `project.json`, `solution/`, `starter/`, `tests/` 완전 구현 및 검증 통과)

## Subagent Model Selection & Parallel Orchestration
본 커리큘럼 구축은 서브에이전트 역할과 난이도에 최적화된 모델을 선택하여 병렬로 진행한다:
- **Lead / Reviewer** (`claude` / `agy`):
  - 모델: `pro`
  - 역할: 다중 언어 아키텍처 조율, Anti-False Consensus 독립 감사, 하네스 품질 게이트 통과 최종 승인
- **Lisp Projects Builder** (`claude`):
  - 모델: `pro`
  - 역할: S-표현식 트리 순회, 매크로 위생성, CLOS 다중 디스패치, 메타순환 평가기, 바이트코드 가상머신 코드 정밀 구현
- **NASM Projects Builder** (`codex`):
  - 모델: `pro`
  - 역할: x86-64 레지스터 할당, 16바이트 스택 정렬 불변식, AVX2 SIMD 인라인 패킹, W^X JIT `mprotect` 기계어 생성 코드 정밀 구현
- **Infrastructure & Schemas Specialist** (`codex`):
  - 모델: `flash`
  - 역할: 빠른 JSON 스키마 업데이트, 안드로이드 Kotlin UI 및 Go 카탈로그 바인딩
- **Verification & Packaging Specialist** (`claude`):
  - 모델: `flash`
  - 역할: 20개 프로젝트 정적 검사, SBCL/NASM 런타임 단위 테스트 자동화, APK 패키징 스크립트 실행

---

## Steps

### Step 1: lisp-nasm-schema-and-infrastructure
- Goal: 프로젝트 스키마, 안드로이드 에셋 패키징, Go 웹 카탈로그 및 안드로이드 메인 화면에 Lisp 및 NASM을 1급 시민 언어로 등록하고 전용 검증 스크립트를 작성한다.
- Files: projects/_schema/project.schema.json, scripts/package-android-assets.js, site/internal/catalog/catalog.go, android-app/app/src/main/res/layout/activity_main.xml, android-app/app/src/main/java/com/prostudy/eink/MainActivity.kt, scripts/verify-lisp-nasm.ts
- Acceptance: AC-1: `project.schema.json`이 `lisp` 및 `nasm` 언어 식별자를 유효한 enum 및 ID 패턴으로 승인한다.
- Acceptance: AC-2: `scripts/package-android-assets.js`와 `site/internal/catalog/catalog.go`가 `lisp`, `nasm`을 인식하여 총 8개 언어로 확장된다.
- Acceptance: AC-3: `scripts/verify-lisp-nasm.ts --schema-only` 검증이 100% 통과한다.
- Tests: npx tsx scripts/verify-lisp-nasm.ts --schema-only
- Parallel: yes
- Depends on: 
- Agent: codex
- Reviewer: claude
- Risk: low
- Complexity: low

### Step 2: lisp-curriculum-projects-01-to-05
- Goal: Common Lisp 기초부터 중급까지의 5대 프로젝트(`01-calc`, `02-textkit`, `03-symbolic-math`, `04-unit-test-framework`, `05-html-dsl`)를 완성한다.
- Files: projects/lisp/01-calc/project.json, projects/lisp/01-calc/README.md, projects/lisp/01-calc/solution/main.lisp, projects/lisp/01-calc/starter/main.lisp, projects/lisp/01-calc/tests/cases/01-basic.in, projects/lisp/01-calc/tests/cases/01-basic.out, projects/lisp/02-textkit/project.json, projects/lisp/02-textkit/README.md, projects/lisp/02-textkit/solution/main.lisp, projects/lisp/02-textkit/starter/main.lisp, projects/lisp/03-symbolic-math/project.json, projects/lisp/03-symbolic-math/README.md, projects/lisp/03-symbolic-math/solution/main.lisp, projects/lisp/03-symbolic-math/starter/main.lisp, projects/lisp/04-unit-test-framework/project.json, projects/lisp/04-unit-test-framework/README.md, projects/lisp/04-unit-test-framework/solution/main.lisp, projects/lisp/04-unit-test-framework/starter/main.lisp, projects/lisp/05-html-dsl/project.json, projects/lisp/05-html-dsl/README.md, projects/lisp/05-html-dsl/solution/main.lisp, projects/lisp/05-html-dsl/starter/main.lisp
- Acceptance: AC-1: 5개 Lisp 프로젝트가 `project.schema.json` 유효성 검사를 100% 통과한다.
- Acceptance: AC-2: 각 프로젝트마다 학습 개념, CLI 사양, starter TODO, solution 작동 코드가 완비된다.
- Acceptance: AC-3: SBCL 구문 검사 및 stdio 단위 테스트가 100% PASS한다.
- Tests: npx tsx scripts/verify-lisp-nasm.ts --lisp-basic
- Parallel: yes
- Depends on: lisp-nasm-schema-and-infrastructure
- Agent: claude
- Reviewer: agy
- Risk: medium
- Complexity: high

### Step 3: lisp-curriculum-projects-06-to-10
- Goal: Common Lisp 고급부터 전문가 수준까지의 5대 프로젝트(`06-resilient-crawler`, `07-rpg-engine`, `08-query-engine`, `09-meta-circular-evaluator`, `10-bytecode-vm`)를 완성한다.
- Files: projects/lisp/06-resilient-crawler/project.json, projects/lisp/06-resilient-crawler/README.md, projects/lisp/06-resilient-crawler/solution/main.lisp, projects/lisp/06-resilient-crawler/starter/main.lisp, projects/lisp/07-rpg-engine/project.json, projects/lisp/07-rpg-engine/README.md, projects/lisp/07-rpg-engine/solution/main.lisp, projects/lisp/07-rpg-engine/starter/main.lisp, projects/lisp/08-query-engine/project.json, projects/lisp/08-query-engine/README.md, projects/lisp/08-query-engine/solution/main.lisp, projects/lisp/08-query-engine/starter/main.lisp, projects/lisp/09-meta-circular-evaluator/project.json, projects/lisp/09-meta-circular-evaluator/README.md, projects/lisp/09-meta-circular-evaluator/solution/main.lisp, projects/lisp/09-meta-circular-evaluator/starter/main.lisp, projects/lisp/10-bytecode-vm/project.json, projects/lisp/10-bytecode-vm/README.md, projects/lisp/10-bytecode-vm/solution/main.lisp, projects/lisp/10-bytecode-vm/starter/main.lisp
- Acceptance: AC-1: CLOS 다중 디스패치, Condition/Restart, 메타순환 평가기, 바이트코드 VM이 SBCL에서 정상 컴파일 및 실행된다.
- Acceptance: AC-2: `project.json` 규격 및 starter/solution/tests 구조가 100% 무결하다.
- Acceptance: AC-3: `scripts/verify-lisp-nasm.ts --lisp-advanced` 테스트를 통과한다.
- Tests: npx tsx scripts/verify-lisp-nasm.ts --lisp-advanced
- Parallel: yes
- Depends on: lisp-nasm-schema-and-infrastructure
- Agent: claude
- Reviewer: agy
- Risk: medium
- Complexity: high

### Step 4: nasm-curriculum-projects-01-to-05
- Goal: NASM x86-64 어셈블리어 초급부터 중급까지의 5대 프로젝트(`01-cli-calc`, `02-string-toolkit`, `03-buffered-io-cat`, `04-sort-comparator`, `05-arena-allocator`)를 완성한다.
- Files: projects/nasm/01-cli-calc/project.json, projects/nasm/01-cli-calc/README.md, projects/nasm/01-cli-calc/solution/main.asm, projects/nasm/01-cli-calc/starter/main.asm, projects/nasm/02-string-toolkit/project.json, projects/nasm/02-string-toolkit/README.md, projects/nasm/02-string-toolkit/solution/main.asm, projects/nasm/02-string-toolkit/starter/main.asm, projects/nasm/03-buffered-io-cat/project.json, projects/nasm/03-buffered-io-cat/README.md, projects/nasm/03-buffered-io-cat/solution/main.asm, projects/nasm/03-buffered-io-cat/starter/main.asm, projects/nasm/04-sort-comparator/project.json, projects/nasm/04-sort-comparator/README.md, projects/nasm/04-sort-comparator/solution/main.asm, projects/nasm/04-sort-comparator/starter/main.asm, projects/nasm/05-arena-allocator/project.json, projects/nasm/05-arena-allocator/README.md, projects/nasm/05-arena-allocator/solution/main.asm, projects/nasm/05-arena-allocator/starter/main.asm
- Acceptance: AC-1: 5개 NASM 프로젝트가 `project.schema.json` 스키마 검증을 통과한다.
- Acceptance: AC-2: System V AMD64 ABI 16바이트 스택 정렬 규약을 엄격히 준수한다.
- Acceptance: AC-3: `nasm` 어셈블 구문 검증 및 단위 테스트가 100% 통과한다.
- Tests: npx tsx scripts/verify-lisp-nasm.ts --nasm-basic
- Parallel: yes
- Depends on: lisp-nasm-schema-and-infrastructure
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 5: nasm-curriculum-projects-06-to-10
- Goal: NASM x86-64 고급부터 시스템 전문가 수준까지의 5대 프로젝트(`06-simd-vector-ops`, `07-sha256-hasher`, `08-elf64-parser`, `09-coroutine-scheduler`, `10-tiny-jit-vm`)를 완성한다.
- Files: projects/nasm/06-simd-vector-ops/project.json, projects/nasm/06-simd-vector-ops/README.md, projects/nasm/06-simd-vector-ops/solution/main.asm, projects/nasm/06-simd-vector-ops/starter/main.asm, projects/nasm/07-sha256-hasher/project.json, projects/nasm/07-sha256-hasher/README.md, projects/nasm/07-sha256-hasher/solution/main.asm, projects/nasm/07-sha256-hasher/starter/main.asm, projects/nasm/08-elf64-parser/project.json, projects/nasm/08-elf64-parser/README.md, projects/nasm/08-elf64-parser/solution/main.asm, projects/nasm/08-elf64-parser/starter/main.asm, projects/nasm/09-coroutine-scheduler/project.json, projects/nasm/09-coroutine-scheduler/README.md, projects/nasm/09-coroutine-scheduler/solution/main.asm, projects/nasm/09-coroutine-scheduler/starter/main.asm, projects/nasm/10-tiny-jit-vm/project.json, projects/nasm/10-tiny-jit-vm/README.md, projects/nasm/10-tiny-jit-vm/solution/main.asm, projects/nasm/10-tiny-jit-vm/starter/main.asm
- Acceptance: AC-1: AVX2 256비트 SIMD, SHA-256 비트 연산, RSP 컨텍스트 스위칭, W^X JIT 동적 머신코드 생성이 규격대로 구현된다.
- Acceptance: AC-2: 모든 프로젝트에 상세한 README.md, starter, solution, tests가 완비된다.
- Acceptance: AC-3: `scripts/verify-lisp-nasm.ts --nasm-advanced` 테스트를 통과한다.
- Tests: npx tsx scripts/verify-lisp-nasm.ts --nasm-advanced
- Parallel: yes
- Depends on: lisp-nasm-schema-and-infrastructure
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 6: lisp-nasm-verification-and-evidence
- Goal: 전체 20개 프로젝트(Lisp 10개, NASM 10개)에 대해 3계층 하네스 검증을 수행하고 최종 검증 증거 문서를 생성한다.
- Files: evidence/20261010-lisp-nasm-curriculum-suite/README.md, evidence/20261010-lisp-nasm-curriculum-suite/verification_log.txt, scripts/verify-lisp-nasm.ts
- Acceptance: AC-1: 20개 프로젝트의 스키마, 소스코드, 테스트 케이스 검증이 100% PASS한다 (`verify-lisp-nasm.ts --all`).
- Acceptance: AC-2: 4대 필수 섹션을 포함한 증거 문서(`README.md` 및 `verification_log.txt`)가 작성된다.
- Tests: npx tsx scripts/verify-lisp-nasm.ts --all
- Parallel: no
- Depends on: lisp-curriculum-projects-01-to-05, lisp-curriculum-projects-06-to-10, nasm-curriculum-projects-01-to-05, nasm-curriculum-projects-06-to-10
- Agent: claude
- Reviewer: agy
- Risk: low
- Complexity: medium

### Step 7: apk-build-and-lan-distribution
- Goal: 최신 Lisp 및 NASM 20개 프로젝트 에셋을 안드로이드 앱으로 번들링하여 새 APK(`pro-study-v2.2.2.apk`)를 빌드하고, 내부 네트워크 다운로드 서버를 가동하며 Git Squash Merge를 완결한다.
- Files: android-app/app/src/main/assets/content/manifest.json, build/pro-study-v2.2.2.apk, scripts/build-apk.sh
- Acceptance: AC-1: `package-android-assets.js`가 Lisp 10개와 NASM 10개를 포함한 총 80개 프로젝트를 안드로이드 assets에 패키징한다.
- Acceptance: AC-2: `./scripts/build-apk.sh` 실행 시 코틀린 및 네이티브 APK 빌드가 성공한다.
- Acceptance: AC-3: 내부망 다운로드 엔드포인트(`http://172.30.1.91:8787/apk` 및 `/api/apk/download`)에서 새 APK를 200 OK로 다운로드할 수 있다.
- Acceptance: AC-4: 작업 브랜치가 PR Squash Merge로 main에 병합되고 브랜치가 정리된다.
- Tests: ./android-app/gradlew -p android-app assembleDebug
- Parallel: no
- Depends on: lisp-nasm-verification-and-evidence
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: medium

---

## Verification
- **Tier 1 (정적 스키마 & 파일 구조)**:
  - `npx tsx scripts/verify-lisp-nasm.ts --all`: 20개 프로젝트의 `project.json` JSON 스키마 유효성, `starter/`, `solution/`, `tests/` 존재성 검증
- **Tier 2 (런타임 컴파일 및 테스트)**:
  - Common Lisp (SBCL): 구문 정적 검사 및 입출력 stdio 테스트
  - NASM (x86-64): 어셈블러 파싱 구문 검증 및 바이너리 빌드 테스트
- **Tier 3 (앱 빌드 및 LAN 배포)**:
  - `./android-app/gradlew -p android-app assembleDebug`: 80개 프로젝트 에셋 내장 APK 빌드 검증
  - LAN HTTP 서버(`site-server -lan`) 정상 가동 및 HTTP 200 다운로드 응답 검증

## Reviewer topology
- **Multi-lane Cross-Review (Anti-False Consensus Enforcement)**:
  - Lisp 커리큘럼 빌더: `claude` (Model: `pro`) ➔ 교차 리뷰어: `agy`
  - NASM 커리큘럼 빌더: `codex` (Model: `pro`) ➔ 교차 리뷰어: `claude`
  - 인프라 및 APK 빌더: `codex` ➔ 교차 리뷰어: `claude`
  - 최종 검증 및 배포 승인: PR 생성 후 Squash Merge
