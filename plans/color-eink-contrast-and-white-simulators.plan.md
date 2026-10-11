---
plan: color-eink-contrast-and-white-simulators
status: approved
risk: medium
owner: neohum
---
# Plan: Color E-ink 고대비 최적화, 버튼 클릭 시인성 개선 및 시뮬레이터 순백 테마 전환

## Intent
Color E-ink 디스플레이(저채도, 고스팅, 잔상 특성) 환경에서 일부 컴포넌트나 버튼이 흐리거나 클릭 후 글자가 보이지 않는 문제(예: `ReferenceActivity`에서 탭 버튼 클릭 시 흰색 바탕에 흰색 글자가 되어 글자가 사라지는 결함)를 전면 수정하고, 모든 시뮬레이터(CPU 컴퓨터, 회로 샌드박스, 3상 인버터 & 모터, EE/전자공학 8종)를 순백(#ffffff) 기본 테마로 전환하여 선명한 외곽선(1.5px~2px solid #0f172a)과 고대비 폰트를 적용하고 색상은 파형, LED, 회로 상태 등 필수 지점에만 한정 적용한다. 작업을 병렬 서브에이전트로 수행한 후 종합 검증, 버전업(v2.5.0), Android APK 빌드 및 내부 네트워크 배포를 완결한다.

## Non-goals
- 저대비 파스텔톤 다크 테마 유지 (모든 시뮬레이터 캔버스와 래퍼는 순백 #ffffff 배경과 흑백 기반 고대비로 통일)
- 클릭 시 글자 색상 누락 또는 투명 처리 방치 (모든 버튼은 선택/비선택 시 명확한 1.5dp 이상 테두리와 고대비 반전/폰트 색상 강제)

## Steps

### Step 1: math-ee-viewer-eink-contrast
- Goal: 웹 뷰어 및 안드로이드 WebView의 탭, 버튼, 코드 블록, 퀴즈, 드로어에 선명한 외곽선과 고대비 스타일을 적용한다.
- Files: site/web/static/math-ee/viewer.css, site/web/static/math-ee/viewer.js, site/web/static/math-ee/index.html
- Acceptance: AC-1: 모든 탭 버튼(.tab-btn), 커리큘럼 토글 버튼, 퀴즈 버튼이 순백 배경에 1.5px 진한 외곽선을 가지며 활성화 시 반전(#0f172a 배경에 #ffffff 글자)되어 텍스트가 절대 사라지지 않는다. AC-2: 코드 블록(.lab-code)이 어두운 슬레이트에서 밝은 흰색 배경에 진한 외곽선 및 검은 글자로 전환된다.
- Tests: node -c site/web/static/math-ee/viewer.js
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 2: cpu-simulator-white-eink-theme
- Goal: 8-bit Virtual Computer & CPU 시뮬레이터의 캔버스와 UI 패널을 순백 테마 및 선명한 외곽선 구조로 전면 전환한다.
- Files: site/web/static/simulators/computer/cpu-sim.css, site/web/static/simulators/computer/cpu-sim.js
- Acceptance: AC-1: CPU 캔버스 배경이 #ffffff로 설정되고 모든 모듈(PC, MAR, RAM, IR, ACC, ALU, B, OUT)이 흰색 바탕에 2px 검은 외곽선과 검은 텍스트를 가진다. AC-2: 8비트 공통 버스와 시퀀서 바가 E-ink에서 잔상 없는 고대비로 표시되고 LED 꺼짐은 밝은 회색 테두리, 켜짐만 원색으로 표시된다.
- Tests: node -c site/web/static/simulators/computer/cpu-sim.js
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 3: circuit-sandbox-white-eink-theme
- Goal: 회로 샌드박스 및 2채널 가상 오실로스코프를 순백 테마와 선명한 레티클 눈금으로 전환한다.
- Files: site/web/static/simulators/circuit/circuit-sandbox.js
- Acceptance: AC-1: 오실로스코프 화면이 어두운 인광 CRT에서 순백 #ffffff 배경으로 전환되고 눈금선이 연회색(#cbd5e1), 입력/출력 트레이스가 고대비 앰버(#b45309) 및 로열블루(#1d4ed8)로 선명하게 표시된다. AC-2: 회로도와 부품, 계측 메트릭 박스가 흰색 배경과 진한 외곽선으로 렌더링된다.
- Tests: node -c site/web/static/simulators/circuit/circuit-sandbox.js
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 4: inverter-and-ee-simulators-white-eink
- Goal: 3상 인버터 모터 시뮬레이터 및 8대 전기·전자 시뮬레이터의 캔버스를 순백 배경 및 외곽선 컴포넌트로 전환한다.
- Files: site/web/static/simulators/ee/inverter-motor.js, site/web/static/simulators/electronics/timer555.js, site/web/static/simulators/ee/relay-sequence.js, site/web/static/simulators/electronics/logic-sim.js
- Acceptance: AC-1: 인버터 브리지, 실시간 PWM 파형, 모터 페이저 3개 캔버스가 모두 순백 #ffffff 배경으로 전환되고 3상 전압이 고대비 적/녹/청으로 선명히 구분된다. AC-2: 555 타이머, 릴레이 시퀀스, 로직 회로 시뮬레이터가 어두운 배경 없이 흑백 외곽선 기반으로 동작한다.
- Tests: node -c site/web/static/simulators/ee/inverter-motor.js
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 5: android-native-button-visibility-and-apk
- Goal: 안드로이드 네이티브 앱의 버튼 클릭 시 글자 색상 사라짐 결함을 완전 해결하고 외곽선 버튼 드로어블을 적용한 뒤 v2.5.0 APK를 빌드한다.
- Files: android-app/app/src/main/res/drawable/bg_eink_button_selected.xml, android-app/app/src/main/res/drawable/bg_eink_button_unselected.xml, android-app/app/src/main/java/com/prostudy/eink/ui/reference/ReferenceActivity.kt, android-app/app/build.gradle.kts
- Acceptance: AC-1: ReferenceActivity에서 언어 탭이나 문법/함수 모드 버튼을 클릭했을 때 글자가 사라지지 않고 선명한 흑백 반전 상태를 유지한다. AC-2: v2.5.0 APK가 성공적으로 빌드되어 내부 네트워크(172.30.1.91:8787/apk)에서 다운로드 가능하다.
- Tests: ./scripts/build-apk.sh
- Risk: low
- Complexity: medium
