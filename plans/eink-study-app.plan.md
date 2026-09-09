---
plan: eink-study-app
status: approved
risk: medium
owner: neohum
---
# Plan: E-ink Book용 C23·Go 학습 및 스타일러스 따라쓰기 안드로이드 앱

## Intent
E-ink 태블릿/북(Onyx Boox, Likebook, Galaxy Tab S-Pen 등) 환경에서 C23·Go 20개 프로젝트 가이드와 코드를 흑백 고대비 화면으로 띄우고, **손가락 터치는 스크롤 및 탐색**, **전용 펜(Stylus)은 화면 위 필기 및 코드 따라쓰기(Tracing)** 로 입력 수단을 엄격히 분리(Palm Rejection)하여 학습할 수 있는 독립형 Android 애플리케이션(`android-app/`)을 구축한다.

## Non-goals
- 모바일 E-ink 기기 내부에서 네이티브 gcc/go 컴파일러를 직접 탑재하여 로컬 빌드하는 것 (코딩 체화 및 필사 학습에 집중하며, 빌드/실행은 로컬 PC `pro-study` 웹 서버 API 연동으로 처리)
- 화려한 컬러 UI, 셰이더 효과, 잦은 화면 전환 애니메이션 (E-ink 잔상 방지 및 화면 깜빡임 억제를 위해 순수 흑백 고대비 디자인 적용)
- 복잡한 클라우드 회원가입 및 결제 시스템 (모든 20개 프로젝트 콘텐츠와 필기 획 데이터는 100% 로컬 오프라인 영속화)

## E-ink 및 스타일러스 핵심 기술 아키텍처

### 1. 손가락 스크롤과 전용 펜(Stylus) 필기 분리 메커니즘 (Palm Rejection)
Android의 `MotionEvent.getToolType(pointerIndex)`를 활용하여 하드웨어 레벨에서 입력 도구를 구분:
- `TOOL_TYPE_STYLUS` / `TOOL_TYPE_ERASER`:
  - 상단의 `InkingOverlayView`가 터치 이벤트를 독점적으로 가로채어(`consume`) 부드러운 베지어 곡선 획(Stroke) 드로잉을 수행.
  - 손바닥이 화면에 닿아도(`TOOL_TYPE_FINGER`), 스타일러스가 입력되는 동안에는 손가락 제스처를 철저히 무시하여 오작동 없는 Palm Rejection 달성.
- `TOOL_TYPE_FINGER`:
  - `InkingOverlayView`가 터치 처리를 통과(`pass through`)시켜 하위 `NestedScrollView` 또는 `CodeViewer`로 전달.
  - 한 손가락으로 자연스럽게 본문/코드 스크롤 및 탭 이동 수행.

### 2. 코드 따라쓰기 모드 (Code Tracing / Copywriting Mode)
- 학습 효과 극대화를 위해 눈으로만 코드를 보는 대신 손으로 직접 코드를 필사(따라쓰기)할 수 있는 모드 제공.
- 원본 코드가 옅은 회색(Ghost 폰트 / 25% 회색 가이드라인)으로 표시되고, 줄마다 노트 격자선(Ruled line)이 제공됨.
- 사용자가 그 위에 검은색 잉크로 코드를 한 줄씩 덧써 내려가며 문법과 키워드를 체화.
- '원문 가이드 끄기/켜기', '내 필기만 보기', '초기화' 토글 버튼 지원.

### 3. E-ink 특화 흑백 고대비 UI (Monochrome Theme)
- 배경: `#FFFFFF` (순백), 글자: `#000000` (순흑), 보조선: `#888888` / `#000000` 1px 테두리.
- E-ink 잔상 방지를 위한 무애니메이션(`android:windowDisablePreview`, 속도 빠른 탭 전환).
- E-ink 잔상 수동 제거를 위한 원터치 `화면 새로고침(Full Screen Invert Refresh)` 액션 지원.

### 4. 20개 프로젝트 오프라인 에셋 패키징
- `projects/c/*` 및 `projects/go/*`의 메타데이터(`project.json`), 가이드(`README.md`), 코드(`starter`, `solution`)를 안드로이드 `assets/content/`에 패키징하여 인터넷 없이 완전한 독립 구동 지원.

---

## Steps

### Step 1: eink-app-scaffold-and-assets
- Goal: 독립형 안드로이드 프로젝트(`android-app/`) 디렉터리와 Gradle 빌드 환경을 구성하고, 20개 프로젝트의 메타데이터와 코드/가이드를 앱 에셋(`assets/content/`)으로 자동 패키징한다.
- Files: android-app/build.gradle.kts, android-app/settings.gradle.kts, android-app/app/build.gradle.kts, android-app/app/src/main/AndroidManifest.xml, scripts/package-android-assets.ts, android-app/app/src/main/assets/content/manifest.json
- Acceptance: AC-1: `package-android-assets.ts` 실행 후 `android-app/app/src/main/assets/content/` 디렉터리에 20개 프로젝트(c 10개, go 10개)의 JSON 및 소스 파일이 정상 생성된다.
- Acceptance: AC-2: Gradle 빌드 파일 및 매니페스트가 문법 오류 없이 구성되고 최소 SDK 버전이 26(Android 8.0 Oreo 이상, 대부분의 E-ink 북 호환)으로 지정된다.
- Tests: node scripts/package-android-assets.ts ; test -f android-app/app/src/main/assets/content/manifest.json
- Risk: low
- Complexity: medium

### Step 2: eink-theme-and-catalog-ui
- Goal: E-ink 화면에 최적화된 고대비 흑백 디자인 시스템과 20개 프로젝트 카탈로그 열람, 마크다운 가이드 뷰어 및 코드 뷰어를 구현한다.
- Files: android-app/app/src/main/java/com/prostudy/eink/MainActivity.kt, android-app/app/src/main/java/com/prostudy/eink/ui/theme/EinkColors.kt, android-app/app/src/main/java/com/prostudy/eink/data/ContentRepository.kt, android-app/app/src/main/java/com/prostudy/eink/ui/catalog/CatalogFragment.kt, android-app/app/src/main/java/com/prostudy/eink/ui/reader/ProjectReaderFragment.kt, android-app/app/src/main/res/values/styles.xml, android-app/app/src/main/res/values/colors.xml
- Acceptance: AC-1: C23 탭과 Go 탭에서 각각 10개 프로젝트의 카드(번호, 제목, 난이도, 핵심 개념 뱃지)가 흑백 고대비 테두리로 표시된다.
- Acceptance: AC-2: 상세 화면에서 가이드(Markdown) 텍스트가 E-ink 가독성 폰트로 렌더링되고, Starter와 Solution 코드를 탭으로 전환하여 확인할 수 있다.
- Acceptance: AC-3: E-ink 잔상 제거를 위한 전체 화면 플래시 리프레시 기능이 동작한다.
- Tests: cd android-app && test -f app/src/main/java/com/prostudy/eink/MainActivity.kt
- Depends on: eink-app-scaffold-and-assets
- Risk: low
- Complexity: medium

### Step 3: stylus-inking-and-palm-rejection
- Goal: 스타일러스 펜(`TOOL_TYPE_STYLUS`) 필기와 손가락(`TOOL_TYPE_FINGER`) 스크롤을 하드웨어 레벨에서 분리하여 완벽한 Palm Rejection과 저지연 필기 오버레이 뷰를 구현한다.
- Files: android-app/app/src/main/java/com/prostudy/eink/ui/ink/InkingOverlayView.kt, android-app/app/src/main/java/com/prostudy/eink/ui/ink/Stroke.kt, android-app/app/src/main/java/com/prostudy/eink/ui/ink/StrokeManager.kt, android-app/app/src/main/java/com/prostudy/eink/ui/ink/ToolTypeDispatcher.kt
- Acceptance: AC-1: `MotionEvent.TOOL_TYPE_STYLUS` 또는 펜 이벤트 수신 시 `InkingOverlayView`가 터치 이벤트를 소비하여 베지어 보간된 선(Stroke)을 그린다.
- Acceptance: AC-2: `MotionEvent.TOOL_TYPE_FINGER` 수신 시 잉킹 캔버스는 선을 그리지 않고 스크롤 컨테이너로 이벤트를 전달하여 손가락 스크롤이 매끄럽게 동작한다.
- Acceptance: AC-3: 지우개 도구(`TOOL_TYPE_ERASER` 또는 툴바 지우개 버튼)를 통한 획 단위 삭제 및 전체 지우기 기능이 정상 동작한다.
- Acceptance: AC-4: 작성된 필기 획 데이터가 내부 SQLite 또는 JSON 파일로 저장 및 복원된다.
- Tests: test -f android-app/app/src/main/java/com/prostudy/eink/ui/ink/InkingOverlayView.kt
- Depends on: eink-theme-and-catalog-ui
- Risk: medium
- Complexity: high

### Step 4: code-tracing-mode
- Goal: 원본 소스 코드를 흐린 가이드라인(Ghost 폰트)으로 깔고 사용자가 스타일러스 펜으로 한 줄씩 따라 쓰며 프로그래밍 구문을 체화하는 코드 따라쓰기(Tracing) 뷰를 구현한다.
- Files: android-app/app/src/main/java/com/prostudy/eink/ui/tracing/CodeTraceFragment.kt, android-app/app/src/main/java/com/prostudy/eink/ui/tracing/TraceLineView.kt, android-app/app/src/main/java/com/prostudy/eink/ui/tracing/TraceSessionManager.kt, android-app/app/src/main/res/layout/fragment_code_trace.xml
- Acceptance: AC-1: 코드 따라쓰기 화면에서 소스 코드의 들여쓰기와 줄 번호, 밑줄 가이드선이 고정폭 폰트로 배치된다.
- Acceptance: AC-2: 사용자가 펜으로 글씨를 따라 쓸 때 획이 가이드 글자 위에 덧씌워지며, '원문 텍스트 토글(투명/불투명)' 버튼으로 자가 채점이 가능하다.
- Acceptance: AC-3: 손가락으로 코드 페이지를 상하 스크롤해도 필기한 획의 위치가 코드 행과 정확히 일치하여 고정 스크롤된다.
- Tests: test -f android-app/app/src/main/java/com/prostudy/eink/ui/tracing/CodeTraceFragment.kt
- Depends on: stylus-inking-and-palm-rejection
- Risk: medium
- Complexity: medium

### Step 5: eink-verification-and-export
- Goal: 안드로이드 프로젝트의 정적 분석 및 단위 테스트를 수행하고, 빌드 스크립트(`scripts/build-android.ps1`)와 상세 설치/사용 가이드 문서를 완성한다.
- Files: scripts/build-android.ps1, docs/EINK_APP_GUIDE.md, README.md, android-app/app/src/test/java/com/prostudy/eink/StrokeTest.kt, android-app/app/src/test/java/com/prostudy/eink/ContentRepositoryTest.kt
- Acceptance: AC-1: `scripts/build-android.ps1` 스크립트가 Android SDK 점검 및 프로젝트 빌드 명령을 명확히 수행한다.
- Acceptance: AC-2: 단위 테스트(`ContentRepositoryTest`, `StrokeTest`)가 작성되어 에셋 로딩 및 획 저장 로직을 검증한다.
- Acceptance: AC-3: `docs/EINK_APP_GUIDE.md`에 Onyx Boox/Kindle 등 E-ink 기기별 최적화 팁(A2 모드/Regal 모드 설정, S-Pen 지우개 매핑)이 한국어로 완벽히 정리된다.
- Tests: pwsh scripts/build-android.ps1 -DoctorOnly ; test -f docs/EINK_APP_GUIDE.md
- Depends on: code-tracing-mode
- Risk: low
- Complexity: low

---

## 일정 (wave 기준, maxParallel 2)

| Wave | 카드 | 비고 |
| --- | --- | --- |
| 1 | eink-app-scaffold-and-assets | 프로젝트 구조 및 20개 콘텐츠 패키징 |
| 2 | eink-theme-and-catalog-ui | E-ink 고대비 흑백 테마 및 뷰어 |
| 3 | stylus-inking-and-palm-rejection | 스타일러스/손가락 분리 잉킹 엔진 |
| 4 | code-tracing-mode | 코드 따라쓰기(필사) 특화 모드 |
| 5 | eink-verification-and-export | 빌드 스크립트, 문서화, 단위 테스트 |

## Verification
- Tier 1 (정적): Kotlin 소스 코드 컴파일 무결성, 리소스 XML 검증, AndroidManifest 스키마 검증
- Tier 2 (테스트): ContentRepository 에셋 로딩 테스트, StrokeManager 베지어 및 직렬화 유닛 테스트
- Tier 3 (실행·시각): E-ink 모노크롬 테마 레이아웃, 스타일러스 Palm Rejection 분리 디스패처, 코드 따라쓰기 뷰 렌더링 확인

## Reviewer topology
builder=codex, reviewer=claude(독립 프로바이더), challenge=on
