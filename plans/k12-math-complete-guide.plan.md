---
plan: k12-math-complete-guide
status: approved
risk: medium
owner: neohum
---
# Plan: 중1부터 고3까지 수학 전체 안드로이드 앱 내장 컨텐츠 제작 (시각화·조판수식·문제10선·영어낭독)

## Intent
대한민국 중학교 1학년부터 고등학교 3학년까지 정규 수학 교육과정(2022 및 2015 개정) 전체를 관통하는 **총 70개 핵심 개념 유닛**을 **안드로이드 앱(`android-app/`) 내의 완전한 오프라인 로컬 에셋 컨텐츠**로 제작한다. 각 유닛은 **(1) 원리를 직관적으로 체화하는 동적 SVG/Canvas 애니메이션(움직이는 이미지)**, **(2) 본질을 꿰뚫는 명쾌한 기본 개념 설명**, **(3) 컴퓨터 텍스트나 raw LaTeX 코드가 화면에 노출되지 않고 실제 교과서와 동일하게 완벽 조판된 수학 기호**, **(4) 각 개념 이해를 위해 난이도 순으로 정밀 설계된 10개의 점진적 문제와 비약 없는 단계별 상세 풀이(총 700문항)**, **(5) 글로벌 전공서 및 수식 낭독을 위한 영문 공식 명칭·발음기호 및 수식 영어 낭독법(How to read in English)과 안드로이드 네이티브 TTS 음성 재생**을 일체형으로 탑재하여, E-ink 태블릿 및 스마트폰에서 인터넷 연결 없이도 언제 어디서나 스스로 완벽히 학습할 수 있는 전용 뷰어와 최신 APK를 완성한다.

## Non-goals
- 온라인 네트워크 의존 (모든 수식 폰트, 애니메이션 스크립트, 70개 유닛 데이터는 안드로이드 `assets/math/`에 100% 내장되어 비행기 모드에서도 완벽 구동)
- 화면에 `x^2`, `*`, `sqrt()` 같은 컴퓨터 기호나 `\frac{a}{b}`, `\sqrt{x}` 같은 raw LaTeX 코드가 노출되는 형태 (모든 수식은 조판 엔진을 거쳐 실제 인쇄된 것과 같은 정밀 조판 수학 기호로만 렌더링)
- 단순 사칙연산 반복이나 시험용 킬러 문항 풀이 편법 (수학의 기저 원리 이해와 개념 체화에 집중)
- 외부 서드파티 클라우드 음성 API 의존 (안드로이드 내장 Native TextToSpeech 엔진과 로컬 JavaScript Interface 연동으로 오프라인 발음 지원)

## Curriculum Architecture in Android App (70 Core Units)
- **중1 과정 (8 유닛)**: 소인수분해와 공약수·공배수 / 정수와 유리수의 연산 / 문자와 식 / 일차방정식 / 좌표평면과 그래프 / 기본 도형과 작도·합동 / 평면도형(원·부채꼴) / 입체도형과 통계(자료의 정리)
- **중2 과정 (8 유닛)**: 유리수와 순환소수 / 지수법칙과 다항식 계산 / 일차부등식과 연립부등식 / 연립일차방정식 / 일차함수와 직선의 방정식 / 삼각형의 성질(외심·내심) / 사각형의 성질 / 닮음과 피타고라스 정리·확률
- **중3 과정 (8 유닛)**: 제곱근과 실수 / 근호 계산과 곱셈공식·인수분해 / 이차방정식과 근의 공식 / 이차함수와 그래프 / 삼각비($\sin, \cos, \tan$) / 삼각비의 응용 / 원의 성질(원주각·접선) / 대푯값과 산포도(표준편차)
- **고1 공통수학 (10 유닛)**: 다항식의 연산과 항등식 / 나머지정리와 인수분해 / 복소수와 이차방정식 판별식 / 이차함수와 이차부등식 / 여러 가지 방정식·연립방정식 / 순열과 조합 / 행렬과 그 연산(2022 개정) / 평면좌표와 직선·원의 방정식 / 도형의 이동과 절대부등식 / 함수(합성·역함수)와 유리·무리함수
- **고2 대수 [수학 I] (8 유닛)**: 지수와 거듭제곱근 / 로그와 상용로그 / 지수함수·로그함수의 그래프와 응용 / 호도법과 부채꼴 / 삼각함수의 정의(단위원)와 그래프 / 사인법칙과 코사인법칙 / 등차수열과 등비수열 / 수열의 합($\sum$)과 수학적 귀납법
- **고2 미적분 I [수학 II] (8 유닛)**: 함수의 극한(부정형 해석) / 함수의 연속성과 사잇값 정리 / 미분계수(접선의 기울기)와 도함수 / 접선의 방정식과 평균값 정리 / 함수의 극대·극소와 고차함수 그래프 개형 / 도함수의 활용(최대최소, 속도·가속도) / 부정적분과 정적분(미적분의 기본정리) / 정적분의 활용(넓이와 위치·거리)
- **고3 확률과 통계 (6 유닛)**: 중복순열·원순열·중복조합 / 이항정리와 파스칼의 삼각형 / 조건부확률과 독립시행 / 이산확률변수와 이항분포 / 연속확률변수와 정규분포 / 통계적 추정과 신뢰구간
- **고3 미적분 II [선택 미적분] (8 유닛)**: 수열의 극한과 무한등비급수 / 지수·로그함수의 극한과 $e$ / 삼각함수의 덧셈정리와 극한 / 여러 가지 미분법(몫, 합성, 역함수, 매개변수) / 도함수의 활용(변곡점과 그래프 그리기) / 여러 가지 적분법(치환적분, 부분적분) / 정적분과 급수(구분구적법) / 부피와 곡선의 길이
- **고3 기하 (6 유닛)**: 포물선, 타원, 쌍곡선(이차곡선) / 평면벡터의 연산과 위치벡터 / 벡터의 내적과 도형의 방정식 / 공간도형과 삼수선의 정리 / 정사영과 이면각 / 공간좌표와 구의 방정식

## Steps

### Step 1: k12-math-curriculum-schema-and-manifest
- Goal: 중1부터 고3까지 70개 핵심 유닛의 전체 커리큘럼 명세(`manifest.json`), JSON 스키마, 조판 수식 규격, 동적 애니메이션 파라미터, 영어 낭독문, 10문항 단계별 풀이 데이터 모델을 수립하고 자동 검증기(`scripts/verify-k12-math.ts`)를 작성한다.
- Files: courses/k12-math/manifest.json, courses/k12-math/_schema/unit.schema.json, scripts/verify-k12-math.ts
- Acceptance: AC-1: 중학교 24개 유닛, 고등학교 46개 유닛 총 70개 유닛의 계통 구조가 `manifest.json`에 선언된다.
- Acceptance: AC-2: `scripts/verify-k12-math.ts`가 작성되어 각 유닛 파일의 스키마 적합성, 실제 조판 수식 문법, 10개 문제/풀이 완비성, 영어 낭독문의 유효성을 100% 자동 검증한다.
- Tests: npx tsx scripts/verify-k12-math.ts --schema-only
- Risk: low
- Complexity: medium

### Step 2: k12-math-middle-school-content
- Goal: 중학교 1~3학년 24개 유닛에 대해 (1) 개념 해설, (2) 동적 SVG 애니메이션 파라미터, (3) 인쇄 조판 수학 기호, (4) 영문 명칭 및 수식 영어 낭독문, (5) 개념 이해용 점진적 10선 문제 및 5단계 상세 풀이(총 240문항)를 구축한다.
- Files: courses/k12-math/middle-1/*.json, courses/k12-math/middle-2/*.json, courses/k12-math/middle-3/*.json
- Acceptance: AC-1: 소인수분해, 일차/이차방정식, 함수 그래프, 삼각형/사각형 성질, 피타고라스 정리, 삼각비 등 24개 유닛 데이터가 완비된다.
- Acceptance: AC-2: 수식은 컴퓨터식이나 raw LaTeX가 아닌 조판 기호로 명시되며, 각 유닛마다 수식 영어 읽기 텍스트와 10개의 점진적 문제 및 단계별 풀이가 포함된다.
- Tests: npx tsx scripts/verify-k12-math.ts --grade middle
- Risk: low
- Complexity: high

### Step 3: k12-math-high-common-content
- Goal: 고등학교 1학년 공통수학 1·2 10개 유닛에 대해 개념 설명, 기하·대수 결합 동적 시각화, 조판 수식, 영어 낭독문, 10단계 개념 문제 및 상세 풀이(총 100문항)를 구축한다.
- Files: courses/k12-math/high-common/*.json
- Acceptance: AC-1: 다항식, 복소수, 이차방정식·부등식, 순열·조합, 2022 개정 필수 행렬, 원의 방정식, 도형의 이동, 집합·명제, 유리·무리함수 10개 유닛이 완비된다.
- Acceptance: AC-2: 10개 유닛 각각에 대해 10문항(총 100문항)의 문제와 개념 길잡이, 단계별 풀이, 정답, 함정 노트가 빠짐없이 작성된다.
- Tests: npx tsx scripts/verify-k12-math.ts --grade high-common
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 4: k12-math-high-algebra-calculus1-content
- Goal: 고등학교 2학년 대수(수학 I, 8유닛) 및 미적분 I(수학 II, 8유닛) 총 16개 유닛에 대해 단위원 회전, 접선 수렴, 리만합 수렴 등의 동적 애니메이션 파라미터와 조판 수식, 영어 낭독문, 10단계 개념 문제(총 160문항)를 구축한다.
- Files: courses/k12-math/high-algebra/*.json, courses/k12-math/high-calculus1/*.json
- Acceptance: AC-1: 지수·로그함수, 삼각함수, 사인·코사인법칙, 수열 합($\sum$), 극한, 연속, 도함수와 3·4차 함수 그래프, 정적분과 넓이 16개 유닛이 완비된다.
- Acceptance: AC-2: 미분계수 할선의 접선 수렴, 정적분 구분구적법 수렴 등 핵심 애니메이션 정의와 영문 수식 낭독 텍스트가 정확히 명시된다.
- Tests: npx tsx scripts/verify-k12-math.ts --grade high-core
- Parallel: yes
- Risk: medium
- Complexity: high

### Step 5: k12-math-high-advanced-content
- Goal: 고등학교 3학년 확률과 통계(6유닛), 미적분 II(8유닛), 기하(6유닛) 총 20개 유닛에 대해 원뿔곡선, 3차원 공간좌표, 정규분포 곡선, 치환·부분적분 등의 시각화, 조판 수식, 영어 낭독문, 10단계 개념 문제(총 200문항)를 구축한다.
- Files: courses/k12-math/high-prob-stat/*.json, courses/k12-math/high-calculus2/*.json, courses/k12-math/high-geometry/*.json
- Acceptance: AC-1: 확통, 선택 미적분, 기하 20개 유닛의 콘텐츠가 모두 작성되어 중1~고3 총 70개 유닛(700문제)이 완성된다.
- Acceptance: AC-2: 모든 수학 기호가 표준 조판 형식으로 렌더링 검증되고, 영어 수식 읽기("the integral of f of x from a to b" 등)가 정확히 매핑된다.
- Tests: npx tsx scripts/verify-k12-math.ts --grade high-advanced
- Parallel: yes
- Risk: medium
- Complexity: high

### Step 6: android-offline-math-assets-bundle
- Goal: 70개 전체 수학 유닛 데이터, 오프라인 KaTeX 조판 엔진 및 폰트 파일, 반응형 SVG/Canvas 애니메이션 렌더러, 영어 수식 낭독 스크립트를 안드로이드 앱의 `android-app/app/src/main/assets/math/`로 자동 번들링하는 빌더 스크립트(`scripts/package-android-math-assets.ts`)를 작성하고 패키징한다.
- Files: scripts/package-android-math-assets.ts, android-app/app/src/main/assets/math/manifest.json, android-app/app/src/main/assets/math/viewer.html, android-app/app/src/main/assets/math/katex/katex.min.css, android-app/app/src/main/assets/math/katex/katex.min.js
- Acceptance: AC-1: 번들링 스크립트가 70개 유닛 데이터와 오프라인 조판 에셋(KaTeX CSS/JS/Fonts)을 `android-app` 에셋 디렉터리로 100% 무결하게 복사·생성한다.
- Acceptance: AC-2: 네트워크가 완전히 차단된 비행기 모드에서도 모든 조판 수식과 애니메이션이 로컬에서 0ms로 렌더링된다.
- Tests: npx tsx scripts/package-android-math-assets.ts
- Risk: low
- Complexity: medium

### Step 7: android-math-viewer-activity-and-tts
- Goal: 안드로이드 앱에 중1~고3 수학 전용 오프라인 뷰어 액티비티(`MathViewerActivity`)를 구현하고, 단원 선택 계통 트리 다이얼로그, E-ink 최적화 모노크롬 테마, 안드로이드 네이티브 `TextToSpeech` 연동(`AndroidTTS` JavascriptInterface) 및 `MainActivity` 연동을 완성한다.
- Files: android-app/app/src/main/java/com/prostudy/eink/ui/math/MathViewerActivity.kt, android-app/app/src/main/res/layout/activity_math_viewer.xml, android-app/app/src/main/java/com/prostudy/eink/MainActivity.kt, android-app/app/src/main/AndroidManifest.xml
- Acceptance: AC-1: 메인 화면의 [📐 수학학습] 버튼 클릭 시 `MathViewerActivity`가 열리며 중1부터 고3까지 70개 유닛을 단원 선택 메뉴에서 즉시 전환하며 학습할 수 있다.
- Acceptance: AC-2: 화면 상단에 움직이는 애니메이션이 재생되고, 본문에는 종이 교과서 스타일의 실제 조판 수학 기호가 선명하게 표시된다.
- Acceptance: AC-3: 각 공식 아래 영문 수식 읽기 옆의 [🔊 Listen] 버튼을 누르면 안드로이드 내장 TTS가 원어민 발음으로 수식을 읽어준다.
- Acceptance: AC-4: 10개 문제가 펼치기/접기 아코디언으로 제공되어 문제 확인 후 터치하면 단계별 상세 풀이와 함정 노트가 펼쳐진다.
- Tests: ./android-app/gradlew -p android-app compileDebugKotlin
- Depends on: k12-math-curriculum-schema-and-manifest, k12-math-middle-school-content, k12-math-high-common-content, k12-math-high-algebra-calculus1-content, k12-math-high-advanced-content, android-offline-math-assets-bundle
- Risk: medium
- Complexity: high

### Step 8: android-math-apk-build-and-verification
- Goal: 70개 전체 유닛 로컬 컨텐츠와 오프라인 뷰어가 탑재된 최신 안드로이드 APK(v1.1.0)를 빌드하고, 에셋 무결성 검증, 빌드 아티팩트 산출, 로컬 서버(`0.0.0.0:8787`) 배포 및 시각적 증거(스크린샷)를 기록한다.
- Files: android-app/app/build.gradle.kts, evidence/k12-math-complete-guide/README.md
- Acceptance: AC-1: `./gradlew assembleDebug`가 에러 없이 성공하여 70개 수학 유닛이 내장된 `app-debug.apk`가 생성된다.
- Acceptance: AC-2: APK 버전이 1.1.0 (versionCode 9)로 승격되고, 로컬 다운로드 서버(`http://localhost:8787/apk`)에서 즉시 다운로드 가능하다.
- Acceptance: AC-3: 실제 안드로이드 디바이스 또는 렌더링 검증 화면(애니메이션, 조판 수식, 10선 문제 풀이, 영어 발음 TTS) 스크린샷이 `evidence/`에 완비된다.
- Tests: cd android-app && ./gradlew assembleDebug
- Risk: low
- Complexity: medium

## Verification
- **Tier 1 (정적 검사)**: `npx tsx scripts/verify-k12-math.ts`로 70개 유닛 파일, 700문항, 조판 수식 유효성, 영어 낭독문 100% 정적 검사.
- **Tier 2 (단위/빌드 테스트)**: `scripts/package-android-math-assets.ts` 실행 후 Android Gradle 컴파일(`compileDebugKotlin`) 무결성 확인.
- **Tier 3 (실행 및 시각 검증)**: 안드로이드 APK 빌드 후 오프라인 환경에서 `MathViewerActivity`를 실행하여 70개 단원 계통 네비게이션, SVG 애니메이션 재생, 조판 수식 미려도, 영어 TTS 수식 발음 출력, 10개 문제 아코디언 풀이 동작 확인 및 증거 캡처.

## Reviewer topology
- Builder: Codex (안드로이드 액티비티, 로컬 번들링 파이프라인, 데이터 스키마)
- Explorer: AGY (70개 유닛 애니메이션 SVG/Canvas 로직 및 E-ink 고대비 조판 최적화)
- Reviewer: Claude (수학 교육과정 적합성, 조판 수식 무결성, 영어 수식 낭독법 감수 및 최종 사인오프)
