---
plan: ee-roadmap-curriculum-and-simulators
status: done
risk: medium
owner: neohum
---
# Plan: 전기·전자 로드맵 학습 커리큘럼 및 컴퓨터·회로·전력 인터랙티브 시뮬레이터 구축

## Intent
전기공학(EE) 및 전자공학(ECE) 비교 로드맵에서 누락된 단계별 학습 커리큘럼(반도체 VLSI 4단계, 임베디드 5대 기둥, 전력망 4단계의 심층 이론, 설계 수식, 실무 설계 랩 및 코드)을 완비하고, 실제 전기 회로, 가상 컴퓨터(CPU/ALU/메모리/버스), 전력전자 인버터를 사용자가 직접 파라미터를 조작하고 파형 및 레지스터 상태를 실시간(60fps)으로 관찰·학습할 수 있는 3대 신규 인터랙티브 시뮬레이터를 개발·탑재하여, 웹 및 Android APK (v2.4.0)로 내부 네트워크에 배포한다.

## Non-goals
- 브라우저 외부의 서드파티 무거운 EDA/SPICE 소프트웨어(Cadence, Synopsys, LTspice) 네이티브 설치 의존 (모든 회로 수치해석 미분방정식 풀이, 캔버스 렌더링, 디지털 컴퓨터 데이터패스 시뮬레이션은 브라우저 및 안드로이드 WebView 내에서 100% 오프라인 JavaScript로 경량 구동)
- 외부 클라우드 API 호출 및 인터넷 연결 강제 (완전 오프라인 번들링으로 비행기 모드에서도 0ms 반응)
- 단순 텍스트 나열형 로드맵 (모든 단계마다 목표, 선행 지식, 상세 이론, KaTeX 수식, 실무 설계 랩 및 자체 점검 퀴즈 포함)

## Subagent Multi-Agent Parallel Orchestration (서브에이전트 병렬 분업 체계)
본 계획은 하네스의 다중 에이전트 풀을 전면 가동하여 대규모 커리큘럼 데이터와 시뮬레이터 엔진을 4개 레인으로 병렬 구축한다:
- **Lane 1: Roadmap Curriculum Specialist**: 반도체 VLSI 4단계 전주기, 임베디드 5대 기둥, 전력망 4단계에 대한 심층 학습 모듈 데이터 구축 (`courses/ee-comparative/roadmap-curriculum.json` 및 `comparative-data.json` 통합)
- **Lane 2: Virtual Computer & CPU Simulator Engineer**: 4비트/8비트 폰 노이만 CPU 아키텍처, 16바이트 RAM, ALU, 레지스터, 버스 애니메이션 및 명령어 실행 시뮬레이터 구현 (`site/web/static/simulators/computer/cpu-sim.js`)
- **Lane 3: Circuit Sandbox & Power Inverter Engineer**: 브레드보드 회로 샌드박스 + 듀얼채널 오실로스코프 시뮬레이터 (`circuit-sandbox.js`) 및 3상 SPWM 인버터 & 모터 드라이브 시뮬레이터 (`inverter-motor.js`) 구현
- **Lane 4: UI/UX & Web/Android Integrator**: `viewer.js`, `viewer.css`, `index.html` 렌더러 통합, 매니페스트 빌더 및 안드로이드 에셋 패키징, APK 빌드 및 내부망 배포

## Steps

### Step 1: ee-roadmap-curriculum-content
- Goal: 반도체 VLSI 4단계, 임베디드 5대 기둥, 전력망 4단계 전 과정을 아우르는 실전 학습 커리큘럼 JSON 데이터셋을 구축한다.
- Files: courses/ee-comparative/roadmap-curriculum.json, courses/ee-comparative/comparative-data.json
- Acceptance: AC-1: VLSI 4단계, 임베디드 5대 기둥, 전력망 4단계 각각에 대한 목표, 세부 이론, KaTeX 수식, 실무 랩, 자가진단 퀴즈가 포함된 13개 심층 학습 모듈이 작성되고 유효한 JSON으로 파싱된다.
- Tests: python3 -c 'import json; d=json.load(open("courses/ee-comparative/roadmap-curriculum.json")); assert len(d["modules"]) >= 13'
- Risk: low
- Complexity: medium

### Step 2: interactive-cpu-computer-simulator
- Goal: ALU, 레지스터, RAM, 버스, 마이크로스텝 실행을 지원하는 4비트/8비트 가상 컴퓨터 & CPU 시뮬레이터 엔진을 구현한다.
- Files: site/web/static/simulators/computer/cpu-sim.js, site/web/static/simulators/computer/cpu-sim.css
- Acceptance: AC-1: 캔버스 렌더링 기반으로 Fetch/Decode/Execute 사이클, 버스 데이터 흐름, 레지스터(PC, IR, ACC, B) 상태 변화가 시각화되며, 10개 이상의 기본 어셈블리 명령어 실행 및 사용자 정의 프로그램 구동이 가능하다.
- Tests: node -e 'const fs=require("fs"); const code=fs.readFileSync("site/web/static/simulators/computer/cpu-sim.js","utf8"); if(!code.includes("executeStep") || !code.includes("ALU")) process.exit(1);'
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 3: interactive-circuit-sandbox-and-inverter
- Goal: 부품 배치 및 듀얼채널 오실로스코프가 연동된 회로 샌드박스와 3상 SPWM 인버터 & 모터 드라이브 시뮬레이터를 구현한다.
- Files: site/web/static/simulators/circuit/circuit-sandbox.js, site/web/static/simulators/ee/inverter-motor.js
- Acceptance: AC-1: 회로 샌드박스에서 RLC/다이오드/BJT 필터 및 정류 회로의 실시간 수치해석 파형이 오실로스코프에 표시된다. AC-2: 3상 인버터에서 SPWM 변조율 조작에 따른 전압 합성 및 모터 회전 속도 동역학이 실시간 계산된다.
- Tests: node -e 'const fs=require("fs"); assert(fs.existsSync("site/web/static/simulators/circuit/circuit-sandbox.js")); assert(fs.existsSync("site/web/static/simulators/ee/inverter-motor.js"));'
- Parallel: yes
- Risk: low
- Complexity: medium

### Step 4: ee-viewer-roadmap-and-sim-integration
- Goal: 웹 뷰어 및 안드로이드 에셋에 로드맵 상세 학습 커리큘럼 UI와 3대 신규 시뮬레이터를 통합하고 매니페스트를 빌드한다.
- Files: site/web/static/math-ee/viewer.js, site/web/static/math-ee/viewer.css, site/web/static/math-ee/index.html, scripts/build-math-ee-manifest.ts, scripts/package-android-math-ee-assets.ts
- Acceptance: AC-1: 로드맵의 각 단계를 클릭하면 상세 커리큘럼(이론, 수식, 랩)이 펼쳐지고, 신규 시뮬레이터 3종이 웹 뷰어와 WebView에서 즉시 동작한다.
- Tests: npx tsx scripts/build-math-ee-manifest.ts && npx tsx scripts/package-android-math-ee-assets.ts
- Risk: low
- Complexity: medium

### Step 5: ee-suite-verification-versionup-and-apk
- Goal: 전체 테스트를 통과하고 버전을 v2.4.0으로 상향하여 최신 Android APK를 빌드하고 내부 네트워크 배포 서버를 재기동한다.
- Files: android-app/app/build.gradle.kts, build/pro-study-v2.4.0.apk, site-server
- Acceptance: AC-1: Gradle assembleDebug가 성공하여 build/pro-study-v2.4.0.apk가 생성된다. AC-2: site-server가 최신 바이너리로 재기동되어 http://172.30.1.91:8787/apk 및 /api/apk/download에서 v2.4.0 APK가 200 OK로 다운로드된다.
- Tests: ./scripts/build-apk.sh && curl -I http://localhost:8787/api/apk/download
- Risk: low
- Complexity: low

## Verification
- Tier 1: 정적 검사 및 스키마 검증 (`scripts/verify-references.ts`, `node scripts/loop/plan-doc.ts check ee-roadmap-curriculum-and-simulators`)
- Tier 2: 단위 테스트 (`go test -count=1 ./site/...`, JS syntax & function assertions)
- Tier 3: Android APK 빌드 (`./scripts/build-apk.sh`) 및 내부망 다운로드 엔드포인트 HTTP 200 응답 검증

## Reviewer topology
- Builder: Parallel Subagent Swarm (Lead, Architect, Builders, Typist)
- Reviewer: Independent Reviewer (Anti-False Consensus 준수, 게이트 및 무결성 전수 검증)
