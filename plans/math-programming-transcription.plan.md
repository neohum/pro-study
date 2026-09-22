---
plan: math-programming-transcription
status: approved
risk: medium
owner: neohum
---
# Plan: 6개 언어(C23·Go·Rust·Python·TS·JS) 기반 초중고-대학 CS 수학 필사 및 진도 체크 시스템 구축

## Intent
대한민국 초·중·고 교육과정(2022/2015 개정)의 수학적 기초부터 대학 수준 컴퓨터공학 수학(선형대수학, 이산수학/암호학, 다변수 미적분/최적화, 확률통계/정보이론, 수치해석)까지를 **pro-study 플랫폼의 6개 전 언어(C23, Go, Rust, Python, TypeScript, JavaScript)**로 1:1 매핑하여 체화하는 **수식-코드 2중 필사(Dual-Track Transcription) 및 3단계 진단 평가 시스템**을 구축한다. 학습자는 선호하는 언어로 탭을 전환하며 수식의 기저 원리가 시스템 프로그래밍(C/Rust), 동시성/백엔드(Go), 데이터/AI(Python), 웹/타입 안전성(TypeScript/JavaScript)에서 어떻게 구현되는지 비교 학습하고, 개념 퀴즈(Level 1) - 수식 빈칸 유도(Level 2) - 6개 언어 자동 채점 테스트(Level 3)로 실시간 진도를 측정한다.

## Non-goals
- 초등 저학년 단순 사칙연산 반복 드릴 (중학교 1학년 소인수분해 및 유클리드 호제법부터 시작)
- 프로그래밍과 무관한 수능 킬러 문항용 특수 테크닉 (순수 CS/알고리즘 연계 수학 원리에 집중)
- 외부 서드파티 블랙박스 라이브러리(NumPy, Eigen, ndarray 등) 의존 (모든 수학 공식은 6개 언어 각각의 순수 표준 라이브러리 및 언어 내장 프리미티브로 직접 구현하여 필사)
- 외부 클라우드 채점 서버 의존 (로컬 pro-study 테스트 러너 및 브라우저/E-ink 로컬 평가로 완결)

## Steps

### Step 1: math-curriculum-schema-and-manifest
- Goal: 중등부터 대학 CS 수학까지 7대 Stage, 40개 세부 모듈의 전체 커리큘럼 명세(`manifest.json`), 6개 언어(C23, Go, Rust, Python, TypeScript, JavaScript) 코드 블록을 지원하는 메타데이터 JSON 스키마, 수식-코드 필사 인터페이스 규격을 설계한다.
- Files: courses/math-cs/manifest.json, courses/math-cs/_schema/math-course.schema.json, scripts/verify-math-courses.ts
- Acceptance: AC-1: Stage 1(중등 기초 5개), Stage 2(고교 공통 6개), Stage 3(고교 심화 8개), Stage 4(선형대수 7개), Stage 5(이산수학/암호 6개), Stage 6(다변수/최적화 5개), Stage 7(통계/수치 3개) 총 40개 모듈의 선행 조건, 수식 정의, 6개 언어(C, Go, Rust, Python, TS, JS) 구현 명세가 매니페스트에 선언된다.
- Acceptance: AC-2: JSON 스키마 검증 스크립트(`scripts/verify-math-courses.ts`)가 작성되어 매니페스트 및 6개 언어 지원 무결성을 100% 통과한다.
- Tests: npx tsx scripts/verify-math-courses.ts
- Agent: codex
- Model: pro
- Reviewer: claude
- Risk: low
- Complexity: medium

### Step 2: k12-math-foundation-content
- Goal: 중학교 과정부터 고등학교 공통수학, 대수, 미적분, 확률과 통계, 기하에 이르는 19개 모듈의 수학 개념 해설, LaTeX 수식 필사 노트, 6개 언어(C23, Go, Rust, Python, TS, JS) 순수 표준 구현 코드를 구축한다.
- Files: courses/math-cs/stage1-middle/lessons.json, courses/math-cs/stage2-common-high/lessons.json, courses/math-cs/stage3-advanced-high/lessons.json
- Acceptance: AC-1: 유클리드 호제법, 소인수분해, 2D/3D 거리 공식, 비트마스크 집합 연산, 순열/조합 재귀, 다항식 롤링 해시, 1D 경사하강법, 사다리꼴 수치적분 등 19개 모듈의 수식과 6개 언어별 코드가 구축된다.
- Acceptance: AC-2: 모든 수식은 KaTeX/LaTeX 유효성 검사를 통과하고, 6개 언어 코드는 각 언어 표준 툴체인으로 컴파일/실행된다.
- Tests: npx tsx scripts/verify-math-courses.ts --stage k12
- Agent: agy
- Model: flash
- Reviewer: claude
- Risk: low
- Complexity: medium

### Step 3: college-cs-core-math-content
- Goal: 프로그래밍 및 AI의 핵심인 대학 수학(선형대수학 7개 모듈, 이산수학 및 암호학 6개 모듈)의 엄밀한 수식 유도와 6개 언어(C23, Go, Rust, Python, TS, JS) 순수 알고리즘 코드를 구축한다.
- Files: courses/math-cs/stage4-linear-algebra/lessons.json, courses/math-cs/stage5-discrete-math/lessons.json
- Acceptance: AC-1: 가우스 소거법, 행렬식, 고유값/고유벡터, SVD(특이값 분해), 3D 아핀 변환 행렬, 정규직교화, 명제 논리 SAT 솔버, 다익스트라/A*, RSA 공개키 암호 모듈러 연산 등이 6개 언어로 완벽히 매핑된다.
- Acceptance: AC-2: 6개 언어의 선형대수 및 이산수학 알고리즘이 부동소수점 오차 한계($\epsilon < 10^{-6}$) 내에서 수치적으로 일치한다.
- Tests: npx tsx scripts/verify-math-courses.ts --stage college-core
- Agent: codex
- Model: pro
- Reviewer: claude
- Parallel: yes
- Risk: medium
- Complexity: high

### Step 4: college-cs-advanced-math-content
- Goal: 머신러닝·최적화·데이터 엔지니어링을 위한 다변수 미적분학, 최적화 이론, 확률통계/정보이론, 수치해석 8개 모듈의 콘텐츠를 6개 언어(C23, Go, Rust, Python, TS, JS)로 구축한다.
- Files: courses/math-cs/stage6-optimization/lessons.json, courses/math-cs/stage7-stats-numerical/lessons.json
- Acceptance: AC-1: 그래디언트 벡터, 야코비안/헤시안, 자동 미분(Autograd) 원리, Adam 옵티마이저, 마르코프 체인 PageRank, 샤논 엔트로피 및 크로스 엔트로피, IEEE 754 부동소수점 비트 파싱, 뉴턴-랩슨법이 6개 언어로 구현된다.
- Acceptance: AC-2: 수치적 불안정성(Zero Division, Catastrophic Cancellation)에 대한 안전 가드가 6개 언어 구현체 모두에 포함된다.
- Tests: npx tsx scripts/verify-math-courses.ts --stage college-adv
- Agent: codex
- Model: pro
- Reviewer: claude
- Parallel: yes
- Risk: medium
- Complexity: high

### Step 5: math-checkpoints-and-test-suites
- Goal: 40개 전체 모듈에 대해 개념 확인 퀴즈(Level 1, 총 200문항), 수식 빈칸 완성 문제(Level 2), 6개 언어(C23, Go, Rust, Python, TS, JS) 자동 채점 단위 테스트 스위트(Level 3)를 생성한다.
- Files: courses/math-cs/quizzes/checkpoint-quizzes.json, courses/math-cs/derivations/fill-blanks.json, courses/math-cs/tests/test_mastery_suite.ts
- Acceptance: AC-1: 각 모듈당 5개의 객관식/단답형 개념 퀴즈와 정답 해설이 완비된다.
- Acceptance: AC-2: 수식의 핵심 중간 전개식을 채우는 유도 문제와 정답 KaTeX 패턴이 정의된다.
- Acceptance: AC-3: 학습자가 선택한 언어(C, Go, Rust, Python, TS, JS)로 작성한 코드를 로컬에서 검증하는 자동 채점 러너가 완비된다.
- Tests: npx tsx courses/math-cs/tests/test_mastery_suite.ts
- Depends on: k12-math-foundation-content, college-cs-core-math-content, college-cs-advanced-math-content
- Agent: agy
- Model: flash
- Reviewer: claude
- Risk: low
- Complexity: medium

### Step 6: web-tracing-and-progress-platform
- Goal: pro-study 로컬 웹 사이트(`site/`)에 수학 커리큘럼 뷰어(`/math`), 6개 언어 탭 전환형 수식-코드 인터랙티브 2중 필사기(`/trace/math?lang={c|go|rust|python|typescript|javascript}`), 3단계 진단 평가 풀이 및 진도율 체크 대시보드(`/math/progress`)를 구현한다.
- Files: site/internal/math/math_handler.go, site/internal/math/progress_store.go, site/web/templates/math.html, site/web/templates/trace_math.html, site/web/templates/math_progress.html, site/web/static/math.css, site/web/static/math.js
- Acceptance: AC-1: `/math`에서 7대 Stage 40개 모듈의 학습 로드맵과 KaTeX 수식이 선명하게 렌더링된다.
- Acceptance: AC-2: `/trace/math`에서 상단 수식(Ghost LaTeX)과 하단 코드 뷰어에서 6개 언어 탭을 클릭하여 원하는 언어로 즉시 전환하며 타이핑 필사할 수 있다.
- Acceptance: AC-3: `/math/progress`에서 언어별 풀이 상태, 퀴즈 제출, 빈칸 채우기, 코드 실행 채점 결과가 SQLite에 영구 기록되고 진도율(%)과 도메인 레이더 차트가 갱신된다.
- Tests: go -C site test ./...
- Agent: codex
- Model: pro
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 7: android-eink-math-stylus-support
- Goal: E-ink 태블릿 앱(`android-app/`)에 수학 필사 모듈을 추가하여, E-ink 고대비 흑백 화면에서 수식과 6개 언어 코드를 스타일러스 펜으로 덧쓰고 오프라인 진도를 체크할 수 있도록 APK(v1.3.0)를 빌드한다.
- Files: android-app/app/src/main/java/com/prostudy/eink/ui/tracing/MathTraceActivity.kt, android-app/app/src/main/java/com/prostudy/eink/ui/progress/MathProgressActivity.kt, android-app/app/src/main/java/com/prostudy/eink/data/MathRepository.kt, scripts/package-android-assets.js, scripts/build-apk.ps1
- Acceptance: AC-1: `package-android-assets.js`가 40개 수학 모듈 에셋(6개 언어 코드 포함)을 안드로이드 `assets/math-cs/`로 번들링한다.
- Acceptance: AC-2: E-ink 단말기에서 펜 손글씨 수식 덧쓰기 모드(Ghost Font + 격자 가이드)와 언어 선택 드롭다운, 레슨 완료 체크 기능이 정상 동작한다.
- Acceptance: AC-3: `build/pro-study-v1.3.0.apk` 빌드가 정상 완료된다.
- Tests: pwsh -ExecutionPolicy Bypass -File scripts/build-apk.ps1
- Agent: codex
- Model: pro
- Reviewer: claude
- Parallel: yes
- Risk: medium
- Complexity: medium

### Step 8: math-evidence-and-documentation
- Goal: 6개 언어 기반 수학 필사 시스템 및 진도 체크 플랫폼 구축 결과에 대한 검증 증거(Evidence)와 학습자 가이드 문서를 완성한다.
- Files: docs/math-cs-curriculum.md, docs/math-tracing-guide.md, README.md, evidence/20260922-math-programming-transcription/README.md
- Acceptance: AC-1: 4대 필수 섹션(WHAT WAS TESTED, WHAT WAS OBSERVED, WHY IT IS ENOUGH, WHAT WAS OMITTED)을 포함한 증거 문서가 생성된다.
- Acceptance: AC-2: 6개 언어로 비교하는 수학-프로그래밍 연계 가이드 문서가 추가되고 메인 `README.md`에 링크된다.
- Tests: test -f docs/math-cs-curriculum.md ; test -f evidence/20260922-math-programming-transcription/README.md
- Depends on: web-tracing-and-progress-platform, android-eink-math-stylus-support
- Agent: claude
- Model: pro
- Reviewer: agy
- Risk: low
- Complexity: low

## Verification
- **Tier 1 (정적 검사)**:
  - `node scripts/loop/plan-doc.ts check math-programming-transcription` 계획서 검증 통과
  - `npx tsx scripts/verify-math-courses.ts` JSON 스키마 및 6개 언어 코드/수식 무결성 검증 통과
- **Tier 2 (단위/통합 테스트)**:
  - `npx tsx courses/math-cs/tests/test_mastery_suite.ts` 40개 모듈 x 6개 언어 단위 테스트 검증 통과
  - `go -C site test ./...` 웹 핸들러 및 진도 저장소 테스트 100% 통과
- **Tier 3 (실행 및 시각 검증)**:
  - 로컬 웹 서버(`site/`) 실행 후 `/math`, `/trace/math`(6개 언어 탭 전환), `/math/progress` 인터랙티브 UI 확인
  - Android APK 빌드(`build/pro-study-v1.3.0.apk`) 및 E-ink 단말기 수식 필사 캔버스 렌더링 확인

## Reviewer topology
- Builder: codex (또는 agy)
- Reviewer: claude
- Challenge: on (Tier 2/3 변경 시 독립 프로바이더 교차 검증)
