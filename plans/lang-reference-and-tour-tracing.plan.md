---
plan: lang-reference-and-tour-tracing
status: approved
risk: medium
owner: neohum
---
# Plan: 다국어 문법·함수 레퍼런스 및 Go Tour 기반 필사 학습 시스템 구축

## Intent
pro-study에서 지원하는 6개 프로그래밍 언어(C23, Go, Rust, Python, TypeScript, JavaScript)의 **핵심 문법과 표준 라이브러리 함수 레퍼런스**를 구축하고, **A Tour of Go (go.dev/tour)의 전 챕터를 수집·정제하여 웹과 Android E-ink 단말기에서 직접 코드를 따라 쓰며 체화하는 '코드 필사(Code Tracing) 전용 학습 시스템'**을 구현한다.

## Non-goals
- 외부 원격 클라우드 기반 Go 코드 실행 샌드박스 서버 구축 (학습자의 로컬 Go 툴체인 및 로컬 pro-study 실행 환경을 활용)
- Go 외 타 언어의 타사 유료 교육 자료 무단 스크래핑 (Go는 공식 오픈소스 `golang/website` 투어를 수록하고, 타 언어는 실전 표준 문법/함수 치트시트 제공)
- 화려한 애니메이션 캔버스 그래픽 도구 탑재 (E-ink 잔상 방지를 위한 고대비 모노크롬 필사 뷰어 및 웹 키보드 타이핑 인터페이스에 집중)

## Steps

### Step 1: tour-go-content-ingest
- Goal: 공식 `golang/website` 저장소의 Tour of Go 전체 아티클과 예제 코드를 수집·정제하여 pro-study 학습용 데이터셋(`courses/tour-go/`)으로 추출하는 인제스트 파이프라인을 구축한다.
- Files: scripts/ingest-tour-go.ts, courses/tour-go/manifest.json, courses/tour-go/lessons.json
- Acceptance: AC-1: Basics, FlowControl, MoreTypes, Methods, Generics, Concurrency 6대 챕터의 모든 레슨 텍스트와 실행 가능한 `.go` 소스 코드가 구조화된 JSON 데이터셋으로 생성된다.
- Acceptance: AC-2: 수집된 모든 Go 코드 파일이 문법 오류 없이 검증되고, 각 레슨에 한국어 학습 가이드와 핵심 함수 설명이 포함된다.
- Tests: node scripts/ingest-tour-go.ts ; test -f courses/tour-go/manifest.json
- Risk: low
- Complexity: medium

### Step 2: lang-grammar-and-function-reference
- Goal: 6개 프로그래밍 언어(C23, Go, Rust, Python, TypeScript, JavaScript)의 핵심 문법 요약 및 표준 라이브러리 주요 함수 레퍼런스 데이터셋을 체계적으로 구축한다.
- Files: content/reference/c.json, content/reference/go.json, content/reference/rust.json, content/reference/python.json, content/reference/typescript.json, content/reference/javascript.json, projects/_schema/reference.schema.json, scripts/verify-references.ts
- Acceptance: AC-1: 6개 언어 각각 기본 문법(변수/타입, 연산자, 제어문, 함수/클로저, 자료구조/객체, 동시성/비동기)과 자주 쓰이는 표준 라이브러리 함수 최소 20개 이상의 설명과 예제 코드가 수록된다.
- Acceptance: AC-2: 정의된 JSON 스키마 검증기(`scripts/verify-references.ts`)를 100% 통과한다.
- Tests: node scripts/verify-references.ts
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 3: web-reference-and-tracing-ui
- Goal: pro-study 로컬 웹 사이트(`site/`)에 6개 언어 문법/함수 레퍼런스 페이지(`/ref`)와 Go Tour 코드를 한 줄씩 키보드로 따라 칠 수 있는 인터랙티브 웹 필사 뷰어(`/trace/go`)를 구현한다.
- Files: site/internal/reference/reference.go, site/internal/tour/tour.go, site/main.go, site/web/templates/reference.html, site/web/templates/trace.html, site/web/static/app.js, site/web/static/app.css
- Acceptance: AC-1: `/ref` 및 `/ref/{lang}` 페이지에서 언어별 문법과 함수 설명을 검색/필터링하여 열람할 수 있다.
- Acceptance: AC-2: `/trace/go` 페이지에서 Tour of Go 코드를 열고 실시간 키보드 입력 매칭, 타이핑 진행률, 코드 복사 및 로컬 실행 테스트가 동작한다.
- Tests: go -C site test ./...
- Risk: medium
- Complexity: medium

### Step 4: android-eink-tracing-and-reference
- Goal: Android E-ink 전용 앱에 문법/함수 레퍼런스 열람 탭과 A Tour of Go 고대비 필사(Ghost 폰트 위 스타일러스 덧쓰기 및 가이드 격자선) 모드를 통합하고 APK(v1.2.0)를 빌드한다.
- Files: android-app/app/src/main/java/com/prostudy/eink/MainActivity.kt, android-app/app/src/main/java/com/prostudy/eink/ui/tracing/TourTraceActivity.kt, android-app/app/src/main/java/com/prostudy/eink/data/TourRepository.kt, android-app/app/src/main/res/layout/activity_trace.xml, scripts/package-android-assets.js, scripts/build-apk.ps1
- Acceptance: AC-1: `package-android-assets.js`를 통해 Go Tour 필사 콘텐츠와 6개 언어 레퍼런스가 Android `assets/`로 자동 패키징된다.
- Acceptance: AC-2: Android 앱에서 Tour of Go 챕터를 선택해 E-ink 고대비 필사 모드로 열람하고 스타일러스/손가락 터치 제어가 정상 작동한다.
- Acceptance: AC-3: `scripts/build-apk.ps1`을 통해 `build/pro-study-v1.2.0.apk` 생성이 성공한다.
- Tests: pwsh -ExecutionPolicy Bypass -File scripts/build-apk.ps1
- Risk: medium
- Complexity: medium

### Step 5: evidence-and-documentation
- Goal: 다국어 문법/함수 레퍼런스 및 Go Tour 필사 시스템 구축에 대한 검증 증거(Evidence) 작성과 사용자 학습 가이드 문서를 갱신한다.
- Files: docs/tour-tracing.md, README.md, evidence/20260922-lang-reference-and-tour-tracing/README.md
- Acceptance: AC-1: 필수 4대 섹션(WHAT WAS TESTED, WHAT WAS OBSERVED, WHY IT IS ENOUGH, WHAT WAS OMITTED)이 작성된 증거 디렉터리가 생성된다.
- Acceptance: AC-2: 저장소 메인 `README.md`에 문법/함수 레퍼런스 및 Tour of Go 필사 학습 가이드 링크가 추가된다.
- Tests: test -f docs/tour-tracing.md ; test -f evidence/20260922-lang-reference-and-tour-tracing/README.md
- Risk: low
- Complexity: low

## Verification
- **Tier 1 (정적 검사)**:
  - `node scripts/loop/plan-doc.ts check lang-reference-and-tour-tracing` 통과
  - `node scripts/verify-references.ts` 스키마 적합성 검사 통과
- **Tier 2 (단위/통합 테스트)**:
  - `go -C site test ./...` 웹 라우트 및 핸들러 테스트 100% 통과
  - `pwsh scripts/verify-projects.ps1 -All` 60개 전체 프로젝트 검증 통과 유지
- **Tier 3 (실행 및 시각 검증)**:
  - 로컬 웹 서버(`site/`) 실행 후 `/ref` 및 `/trace/go` 화면 렌더링 확인
  - Android Gradle 빌드로 `build/pro-study-v1.2.0.apk` 생성 및 에셋 번들링 무결성 확인

## Reviewer topology
- Builder: codex (또는 agy)
- Reviewer: claude
- Challenge: on (Tier 2/3 변경 시 독립 프로바이더 교차 검증)
