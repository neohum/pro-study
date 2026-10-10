---
plan: math-ee-curriculum-suite
status: approved
risk: medium
owner: neohum
---
# Plan: 수학 전 분야 기호·엄밀 증명 및 전기·전자공학 기초부터 실전 인터랙티브 시뮬레이션 커리큘럼 구축

## Intent
수학, 전기공학, 전자공학의 3대 핵심 이공계 영역을 아우르는 마스터 학습 콘텐츠 및 인터랙티브 시뮬레이션 시스템을 구축한다:
1. **수학 기호 백과 및 핵심 정리 증명**: 컴퓨터 코드용 ASCII 기호(`*`, `^`, `sqrt`, `!=`)나 raw LaTeX 텍스트 노출을 전면 배제하고, 실제 출판 인쇄물 수준의 정밀 조판 수식 기호($\int, \oint, \sum, \nabla, \in, \forall, \exists, \mathbb{R}$ 등)를 사용하여 10대 수학 영역 전반의 기호 기원, 엄밀한 공리적 정의, 용법, 한/영 수식 낭독 텍스트를 집대성하고, 피타고라스 정리부터 오일러 공식, 미적분학 기본정리, 중심극한정리에 이르는 12대 핵심 수학 이론에 대한 비약 없는 단계별 엄밀 증명과 직관적 해설을 제공한다.
2. **전기공학(EE) 기초부터 실전까지 + 4대 시뮬레이션**: 전자기학, DC/AC 회로해석, RLC 과도현상, 페이저 해석, 3상 교류 전력, 변압기/전기기기, 시퀀스 제어/실무 설비에 이르는 8개 모듈 커리큘럼과 함께, 브라우저와 안드로이드 앱에서 파라미터 조작에 따라 실시간 60fps로 계산·렌더링되는 4대 인터랙티브 회로 시뮬레이터(RLC 과도현상 오실로스코프, AC 페이저/전력 삼각형, 3상 Y-Δ 결선, 릴레이 시퀀스 로직)를 탑재한다.
3. **전자공학 기초부터 실전까지 + 4대 시뮬레이션**: 반도체 물성, 다이오드 정류, BJT/MOSFET 트랜지스터 증폭/스위칭, OP-Amp 아날로그 회로, 능동필터, 디지털 논리회로, 마이크로컨트롤러/임베디드 통신, PCB 설계에 이르는 8개 모듈 커리큘럼과 함께, 4대 인터랙티브 시뮬레이터(LogicSim 디지털 논리회로, OP-Amp/능동필터 Bode Plot, 트랜지스터 V-I 특성 및 부하선, 555 타이머 펄스 발진기)를 탑재한다.
4. **서브에이전트 풀 병렬 분업**: Lead, Architect, Researcher, Explorer, Builder, Typist, Reviewer 등 에이전트 하네스 풀을 적극 활용하여 데이터 구축과 시뮬레이터 엔진 개발을 5개 Wave의 병렬 파이프라인으로 처리하고, 웹(`site/`) 및 안드로이드 E-ink/스마트폰 앱(`android-app/`)에서 100% 오프라인 독립 구동되도록 완성한다.

## Non-goals
- 화면에 `*`, `^`, `sqrt()`, `!=`, `inf` 등 컴퓨터 프로그래밍식 ASCII 기호나 미변환 raw LaTeX 코드가 노출되는 형태 (모든 수식은 KaTeX 기반 실제 수학 조판 기호로 완벽 렌더링)
- 외부 클라우드 API 또는 서드파티 회로 시뮬레이션 서버 의존 (모든 회로 수치해석 미분방정식 풀이, 캔버스 렌더링, 디지털 논리 엔진은 클라이언트 브라우저 및 안드로이드 WebView 내에서 100% 로컬 자바스크립트로 완전 오프라인 구동)
- 단순 시험 대비용 단답형 계산 문제 풀이 위주의 파편화된 콘텐츠 (수학적 원리 규명, 엄밀한 증명, 수학과 공학의 연결, 직관적 실시간 시뮬레이션 조작 중심)
- 네트워크 연결 필수 요구 (모든 조판 폰트, 시뮬레이터 스크립트, 데이터셋은 로컬 에셋에 완전 내장되어 비행기 모드에서도 0ms 레이턴시로 오프라인 구동)

## Subagent Multi-Agent Parallel Orchestration (서브에이전트 병렬 분업 체계)
본 계획은 하네스의 다중 에이전트(Subagents) 풀을 전면 가동하여 대규모 콘텐츠와 시뮬레이터를 병렬로 구축한다:
- **Lead** (`claude`): 전체 커리큘럼 아키텍처 조율, 카드별 인수 조건(AC) 검증, 전체 파이프라인 수렴 총괄
- **Architect** (`claude` / `agy`): 수학 조판 스키마, 회로 수치해석(RK4) 엔진 규격, 시뮬레이션 캔버스 렌더링 파이프라인 설계
- **Researcher** (`agy` / `claude`): ISO 80000-2 수학 기호 표준 체계, IEEE 회로 표준 기호, 대학 표준 공학 교재(Boylestad, Sedra/Smith, Alexander/Sadiku) 레퍼런스 데이터 전수 매핑
- **Explorer** (`agy`): 기존 `courses/` 구조, KaTeX 조판 엔진 및 안드로이드 Kotlin 웹뷰 브릿지 정합성 분석
- **Builder** (`codex` / `claude`): 실제 JSON 콘텐츠 구축, Canvas 기반 인터랙티브 시뮬레이터 엔진 구현, 웹 UI 및 안드로이드 액티비티 개발
- **Typist** (`codex`): 기계적 데이터 변환, 수식 정적 검증 스크립트 실행, 안드로이드 assets 번들링 및 패키징 자동화
- **Reviewer** (`claude` / `agy`, 독립 교차 검증): 수학 조판 무결성, 키르히호프/맥스웰 수치해석 오차 한계, 60fps 렌더링 반응성 및 하네스 품질 게이트 독립 감사 (Anti-False Consensus 준수)

## Curriculum & Simulation Architecture

### 1. 수학 기호 백과 (10대 영역 100여 개 기호)
- **기초 산술 및 대수**: 사칙연산자($+, -, \times, \div$), 관계자($=, \ne, \approx, \equiv, \propto, <, >, \le, \ge$), 괄호와 절댓값($(\cdot), [\cdot], \{\cdot\}, |\cdot|$), 비례와 팩토리얼($:, ::, !$)
- **집합론 및 수 체계**: 원소와 부분집합($\in, \notin, \subset, \subseteq, \supset$), 집합 연산($\cup, \cap, \setminus, \times, \emptyset$), 수 체계($\mathbb{N}, \mathbb{Z}, \mathbb{Q}, \mathbb{R}, \mathbb{C}$), 무한과 기수($\infty, \aleph_0, \aleph_1$)
- **수리논리학**: 한정기호($\forall, \exists, \exists!$), 논리 연결자($\neg, \land, \lor, \oplus$), 조건문($\implies, \iff$), 증명 및 귀결($\vdash, \vDash, \therefore, \because, \blacksquare, \text{Q.E.D.}$)
- **해석학 및 미적분학**: 극한과 증분($\lim_{x \to a}, \Delta x, dx$), 도함수와 편미분($\frac{df}{dx}, f'(x), \dot{x}, \partial f/\partial x$), 적분($\int, \oint, \iint, \iiint$), 벡터 미적분($\nabla, \nabla \cdot, \nabla \times, \Delta$), 점근 표기법($\mathcal{O}, o, \Omega, \Theta$)
- **선형대수학 및 텐서**: 벡터와 행렬($\vec{v}, \mathbf{x}, \mathbf{A}, \mathbf{I}_n$), 행렬 연산($\mathbf{A}^T, \mathbf{A}^H, \mathbf{A}^{-1}, \det(\mathbf{A}), \operatorname{tr}(\mathbf{A})$), 내적/외적($\langle u, v \rangle, u \cdot v, u \times v, \otimes, \oplus$), 노름($\|\mathbf{x}\|_2, \|\mathbf{A}\|_F$)
- **기하학 및 삼각법**: 각과 도형($\angle, \triangle, \square, \parallel, \perp, \cong, \sim$), 각도 단위($^\circ, \text{rad}, \pi, \theta, \phi$), 삼각함수($\sin, \cos, \tan, \sec, \csc, \cot$), 쌍곡선함수($\sinh, \cosh, \tanh$)
- **확률 및 통계학**: 확률과 기댓값($P(A), P(A|B), E[X], \operatorname{Var}(X), \operatorname{Cov}(X,Y)$), 모수 및 통계량($\mu, \sigma, \sigma^2, \bar{x}, s^2, \rho$), 분포 기호($X \sim \mathcal{N}(\mu, \sigma^2), \text{Bin}(n,p), \text{Poisson}(\lambda), \chi^2$), 가설검정($H_0, H_1, \alpha, p\text{-value}$)
- **정수론 및 이산수학**: 약수와 배수($a \mid b, a \nmid b, \gcd(a,b), \operatorname{lcm}(a,b)$), 모듈러 합동($a \equiv b \pmod m$), 특수함수($\phi(n), \mu(n), \tau(n), \sigma(n)$), 조합 기호($\binom{n}{k}, P(n,k), S(n,k)$)
- **추상대수학 (군·환·체)**: 동형 및 준동형($\cong, \approx, \ker(\phi), \operatorname{Im}(\phi)$), 잉여류 및 직합($G/H, R/I, G \oplus H, G \otimes H$), 대수 구조($\mathbb{F}_q, \mathbb{Z}_p, \text{GL}(n, \mathbb{R}), S_n$)
- **위상수학 및 현대수학**: 개집합과 폐포($\tau, \overline{A}, A^\circ, \partial A$), 위상 동형($X \cong Y$), 호모토피/호몰로지($\pi_1(X), H_n(X)$)

### 2. 수학 12대 핵심 이론 단계별 엄밀 증명
1. **피타고라스 정리 ($a^2 + b^2 = c^2$)**: 유클리드 기하학적 면적 분할 증명 및 대수적 직각삼각형 4개 배치 증명
2. **소수의 무한성**: 유클리드의 귀류법 (유한 가정 시 $N = p_1 p_2 \cdots p_k + 1$의 새로운 소인수 유도)
3. **$\sqrt{2}$의 무리수성**: 기약분수 $\frac{p}{q}$ 가정 후 짝수성 모순을 통한 귀류법 증명
4. **미적분학의 기본정리 (FTC 1 & 2)**: 연속함수 적분 도함수의 극한 및 평균값 정리(MVT)를 통한 정적분 계산 증명
5. **오일러 공식 ($e^{i\theta} = \cos\theta + i\sin\theta$)**: Maclaurin 테일러 급수 전개 대조 증명 및 미분방정식 $\frac{dy}{d\theta} = iy$ 풀이 증명
6. **코시-슈바르츠 부등식 ($(\sum a_i b_i)^2 \le (\sum a_i^2)(\sum b_i^2)$)**: 실함수 $f(t) = \sum (a_i t + b_i)^2 \ge 0$의 이차 다항식 판별식 $D \le 0$ 증명
7. **중심극한정리 (CLT)**: 독립동일분포(i.i.d.) 확률변수 표준화 합의 적률생성함수(MGF) 테일러 전개와 표준정규분포 수렴 증명
8. **페르마의 소정리 ($a^{p-1} \equiv 1 \pmod p$)**: 법 $p$에 대한 기약잉여계 순열 곱셈 및 잉여류 불변성 증명
9. **바젤 문제 ($\sum_{n=1}^\infty \frac{1}{n^2} = \frac{\pi^2}{6}$)**: 오일러의 $\frac{\sin x}{x}$ 무한곱 근-계수 관계와 테일러 급수 $x^2$ 계수 비교 증명
10. **칸토어의 대각선 논법 (실수의 비가산성)**: 구간 $(0,1)$ 실수 나열 가정 후 대각선 성분 변형으로 무모순 귀류법 증명
11. **선형대수 랭크-퇴화차수 정리 ($\dim(V) = \operatorname{rank}(T) + \operatorname{nullity}(T)$)**: 핵($\ker T$)의 기저 확장과 상($\operatorname{Im} T$) 기저 간의 선형독립성 증명
12. **산술의 기본정리 (소인수분해의 유일성)**: 유클리드 보조정리($p \mid ab \implies p \mid a \lor p \mid b$)와 최소 반례를 통한 귀납법 증명

### 3. 전기공학 (EE) 8개 모듈 및 4대 시뮬레이터
- **모듈 1: 전자기학 기초**: 전하, 쿨롱 법칙, 전계/전위, 가우스 법칙, 앙페르 법칙, 패러데이 전자기 유도, 맥스웰 방정식의 물리적 의미
- **모듈 2: 직류(DC) 회로 해석**: 옴의 법칙, KCL/KVL, 분압/분류 법칙, 망로/마디 해석법, 테브난 및 노턴 등가회로, 중첩의 원리, 최대전력 전달조건
- **모듈 3: 과도 현상과 에너지 저장 소자**: 커패시터($C$)와 인덕터($L$)의 V-I 특성, 1차 RC/RL 회로 시정수($\tau$), 2차 RLC 회로 감쇠(과감쇠, 임계감쇠, 저감쇠) 미분방정식 풀이
- **모듈 4: 교류(AC) 정현파 및 페이저 해석**: 정현파 주파수, 각속도, 실효값(RMS), 복소 페이저(Phasor), 임피던스($Z = R + jX$)와 어드미턴스($Y$), 위상차
- **모듈 5: 교류 전력 및 공진 회로**: 유효전력($P$), 무효전력($Q$), 피상전력($S$), 복소전력, 역률($\cos\theta$) 개선, RLC 직렬/병렬 공진 주파수 및 Q-factor
- **모듈 6: 3상 교류 전력 및 전력 계통**: 3상 교류 생성 원리, Y결선과 $\Delta$결선의 전압/전류 관계, 3상 전력 계산, 중성선 전류, 변압기 전압비/전류비 및 임피던스 변환
- **모듈 7: 전기기기 및 모터 제어**: 직류기(DC 모터/발전기) 토크-속도 특성, 3상 유도 전동기 원리(회전자계, 슬립), 동기기, 인버터(VFD/PWM) 속도 제어
- **모듈 8: 실전 전기설비 및 시퀀스/안전**: 릴레이 접점(a접점, b접점), 자기유지 회로, 인터록 회로, PLC 제어 기초, 접지 시스템(TN/TT/IT), 차단기(MCCB, ELCB) 동작, 한국전기설비규정(KEC) 핵심
- **인터랙티브 시뮬레이터 4종**:
  1. *RLC 과도현상 및 오실로스코프 시뮬레이터*: $R, L, C, V_{in}$, 구동신호(Step/Sine/Square) 조작에 따른 전압/전류 감쇠 파형 실시간 렌더링
  2. *AC 페이저 및 전력 삼각형 시뮬레이터*: 복소평면 상에서 전압/전류 페이저 회전, 유효/무효/피상전력 벡터 합성 및 역률 개선 콘덴서 효과 실시간 계산
  3. *3상 Y-$\Delta$ 결선 및 변압기 시뮬레이터*: 선간/상전압 위상 관계 및 부하 불평형 시 중성점 전류와 벡터 궤적 동적 시각화
  4. *릴레이 시퀀스 제어 인터랙티브 시뮬레이터*: 푸시버튼, 릴레이, 램프, 모터를 마우스/터치로 조작하여 자기유지 및 정역 인터록 동작을 실시간 모의 실행

### 4. 전자공학 8개 모듈 및 4대 시뮬레이터
- **모듈 1: 반도체 물리 기초**: 진성/외인성 반도체, 에너지 밴드갭, 페르미 준위, 드리프트와 확산 전류, PN 접합 다이오드 공핍층과 내장 전위
- **모듈 2: 다이오드 회로 및 정류기**: 쇼클리 다이오드 방정식, 순방향/역방향 특성, 반파/전파 정류기, 브리지 정류회로, 평활 커패시터 리플, 제너 다이오드 정전압원, 클리퍼/클램퍼
- **모듈 3: BJT 트랜지스터와 증폭기**: NPN/PNP 구조, 활성/포화/차단 모드, 공통 이미터(CE) 증폭기, DC 바이어스 회로(전압분배 바이어스), 소신호 하이브리드-$\pi$ 모델, 직류 부하선 해석
- **모듈 4: MOSFET 회로와 CMOS**: NMOS/PMOS 물리 구조, 문턱전압($V_{th}$), 트라이오드/포화 영역 전류식, 소신호 증폭기(CS), CMOS 인버터 동작 및 동적 전력 소모
- **모듈 5: OP-Amp 아날로그 연산 회로**: 이상적 OP-Amp 특성(가상 단락, 가상 접지), 반전/비반전 증폭기, 버퍼, 가산기, 차동 증폭기, 적분기/미분기, 계측 증폭기(In-Amp)
- **모듈 6: 능동 필터 및 신호 발진기**: 1차/2차 저역(LPF)/고역(HPF)/대역통과(BPF) 능동 필터, Butterworth 응답, 555 타이머(비안정/단안정 멀티바이브레이터), 빈 브리지(Wien-bridge) 정현파 발진기
- **모듈 7: 디지털 논리 회로 기초**: 불 대수 정리, 기본 게이트(AND, OR, NOT, NAND, NOR, XOR), 카르노 맵 최소화, 가산기(Half/Full), MUX/DEMUX, 래치와 플립플롭(SR, D, JK, T), 동기식/비동기식 카운터
- **모듈 8: 마이크로컨트롤러 및 임베디드 실전**: ADC(표본화, 양자화, 부호화, SAR), DAC, 직렬 통신 프로토콜(UART, SPI, I2C), 센서 인터페이싱, PWM 모터 제어, 실전 PCB 설계 원칙
- **인터랙티브 시뮬레이터 4종**:
  1. *LogicSim 디지털 논리 회로 시뮬레이터*: 캔버스 상에서 게이트, 스위치, 클록, 플립플롭, 7세그먼트를 연결하여 0/1 논리 신호 전파를 실시간 시뮬레이션
  2. *OP-Amp 및 능동필터 Bode Plot 시뮬레이터*: 증폭기 및 능동 LPF/HPF의 부품값($R, C$) 조절에 따른 주파수 응답 크기(dB) 및 위상 선도 실시간 플롯
  3. *BJT/MOSFET 트랜지스터 특성 곡선 & 부하선 시뮬레이터*: $V_{GS}, V_{DS}, V_{CE}, I_B$ 조작에 따른 특성 곡선 및 동작점(Q-point) 이동, 클리핑 왜곡 시각화
  4. *555 타이머 펄스 발생기 시뮬레이터*: 저항/커패시터 조정에 따른 타이머 내부 충방전 전압 파형 및 출력 PWM 주파수/듀티비 실시간 오실로스코프 관찰

---

## Steps

### Step 1: math-ee-schema-and-validators
- Goal: 수학 기호 10개 범주, 12대 수학 증명, 전기공학 8개 모듈, 전자공학 8개 모듈 및 시뮬레이션 파라미터를 규정하는 통합 JSON 스키마와 자동 검증기(`scripts/verify-math-ee.ts`)를 구축한다.
- Files: courses/math-symbols/_schema/symbol.schema.json, courses/math-symbols/_schema/theorem.schema.json, courses/electrical-eng/_schema/module.schema.json, courses/electronics-eng/_schema/module.schema.json, scripts/verify-math-ee.ts
- Acceptance: AC-1: 수학 기호 조판 메타데이터(KaTeX 수식, 어원, 엄밀 정의, 용법, 한/영 낭독 텍스트), 수학 증명(공리, 논리 전개 단계, 핵심 수식), 전기/전자 모듈(핵심 방정식, 실무 노트, 시뮬레이터 연동 규격)의 JSON Schema가 수립된다.
- Acceptance: AC-2: `scripts/verify-math-ee.ts --schema-only` 명령이 모든 스키마의 구문 및 유효성을 100% 검증하고 종료 코드 0을 반환한다.
- Tests: npx tsx scripts/verify-math-ee.ts --schema-only
- Agent: codex
- Reviewer: claude
- Risk: low
- Complexity: medium

### Step 2: math-symbols-encyclopedia-content
- Goal: 기초 산술부터 집합론, 수리논리, 미적분학, 선형대수, 기하학, 확률통계, 정수론까지 10대 수학 영역 전반의 필수 기호에 대해 컴퓨터식 표기를 배제한 실 수학 조판 수식, 역사, 엄밀한 공리적 정의, 용법, 한/영 낭독 텍스트를 담은 기호 백과 데이터셋을 구축한다.
- Files: courses/math-symbols/manifest.json, courses/math-symbols/categories/arithmetic.json, courses/math-symbols/categories/set-logic.json, courses/math-symbols/categories/calculus-analysis.json, courses/math-symbols/categories/linear-algebra.json, courses/math-symbols/categories/geometry-topology.json, courses/math-symbols/categories/probability-statistics.json, courses/math-symbols/categories/algebra-number-theory.json
- Acceptance: AC-1: 7개 세부 카테고리 파일에 100개 이상의 수학 기호에 대한 KaTeX 표준 조판 수식, 한국어/영어 정식 명칭, 발음 낭독문("How to read in English"), 역사적 배경, 공리적 정의, 적용 예시가 완비된다.
- Acceptance: AC-2: raw LaTeX나 ASCII 컴퓨터 연산자 노출 없이 표준 조판 형식으로 렌더링 검증되며 `scripts/verify-math-ee.ts --symbols`를 통과한다.
- Tests: npx tsx scripts/verify-math-ee.ts --symbols
- Parallel: yes
- Depends on: math-ee-schema-and-validators
- Agent: claude
- Reviewer: agy
- Risk: low
- Complexity: high

### Step 3: math-theorems-rigorous-proofs-content
- Goal: 피타고라스 정리, 오일러 공식, 미적분학 기본정리, 코시-슈바르츠 부등식, 중심극한정리 등 수학사의 12대 핵심 이론에 대한 단계별 엄밀한 증명과 직관적 해설 및 핵심 수식 조판 데이터를 구축한다.
- Files: courses/math-symbols/theorems/pythagorean.json, courses/math-symbols/theorems/primes-infinitude.json, courses/math-symbols/theorems/sqrt2-irrational.json, courses/math-symbols/theorems/fundamental-calculus.json, courses/math-symbols/theorems/euler-identity.json, courses/math-symbols/theorems/cauchy-schwarz.json, courses/math-symbols/theorems/central-limit.json, courses/math-symbols/theorems/fermat-little.json, courses/math-symbols/theorems/basel-problem.json, courses/math-symbols/theorems/cantor-diagonal.json, courses/math-symbols/theorems/rank-nullity.json, courses/math-symbols/theorems/arithmetic-fundamental.json
- Acceptance: AC-1: 12대 수학 정리에 대해 기본 전제(가정), 직관적 핵심 아이디어, 논리적 비약 없는 단계별 수식 유도(Step-by-step Proof), 결론의 의의가 모두 작성된다.
- Acceptance: AC-2: 모든 수식은 인쇄 교과서 수준의 KaTeX 조판 형식으로 구성되며 `scripts/verify-math-ee.ts --theorems` 검증을 100% 통과한다.
- Tests: npx tsx scripts/verify-math-ee.ts --theorems
- Parallel: yes
- Depends on: math-ee-schema-and-validators
- Agent: agy
- Reviewer: claude
- Risk: low
- Complexity: high

### Step 4: electrical-engineering-course-content
- Goal: 전자기학 기초부터 DC/AC 회로이론, RLC 과도현상, 페이저 해석, 3상 교류 전력, 전기기기 및 시퀀스/안전 설비까지 8개 모듈의 체계적 학습 데이터를 구축한다.
- Files: courses/electrical-eng/manifest.json, courses/electrical-eng/modules/01-electromagnetics.json, courses/electrical-eng/modules/02-dc-circuits.json, courses/electrical-eng/modules/03-transient-rlc.json, courses/electrical-eng/modules/04-ac-phasor.json, courses/electrical-eng/modules/05-ac-power-resonance.json, courses/electrical-eng/modules/06-three-phase-systems.json, courses/electrical-eng/modules/07-electric-machines.json, courses/electrical-eng/modules/08-sequence-and-safety.json
- Acceptance: AC-1: 8개 모듈 전체에 대해 기본 개념 설명, 지배 방정식(맥스웰, KCL/KVL, 임피던스, 전력 삼각형), 실무 응용 팁, 시뮬레이터 연동 설정 파라미터가 완비된다.
- Acceptance: AC-2: `scripts/verify-math-ee.ts --electrical` 명령을 실행하여 모든 모듈의 수식 조판, 한/영 전문용어 대조, 스키마 유효성이 완벽히 검증된다.
- Tests: npx tsx scripts/verify-math-ee.ts --electrical
- Parallel: yes
- Depends on: math-ee-schema-and-validators
- Agent: codex
- Reviewer: claude
- Risk: low
- Complexity: high

### Step 5: electronic-engineering-course-content
- Goal: 반도체 물성, 다이오드, BJT/MOSFET 트랜지스터, OP-Amp 아날로그 연산회로, 능동필터, 디지털 논리회로, 임베디드 인터페이싱까지 8개 모듈의 체계적 학습 데이터를 구축한다.
- Files: courses/electronics-eng/manifest.json, courses/electronics-eng/modules/01-semiconductor-physics.json, courses/electronics-eng/modules/02-diodes-rectifiers.json, courses/electronics-eng/modules/03-bjt-amplifiers.json, courses/electronics-eng/modules/04-mosfet-circuits.json, courses/electronics-eng/modules/05-opamp-circuits.json, courses/electronics-eng/modules/06-active-filters-oscillators.json, courses/electronics-eng/modules/07-digital-logic.json, courses/electronics-eng/modules/08-embedded-interfacing.json
- Acceptance: AC-1: 8개 모듈 전체에 대해 소자 동작 물리, 소신호 등가 모델, 입출력 특성식, 디지털 논리 진리표, 임베디드 통신 타이밍도 메타데이터가 완비된다.
- Acceptance: AC-2: `scripts/verify-math-ee.ts --electronics` 명령을 통해 모든 수식 조판 및 회로 다이어그램 스펙의 무결성이 100% 검증된다.
- Tests: npx tsx scripts/verify-math-ee.ts --electronics
- Parallel: yes
- Depends on: math-ee-schema-and-validators
- Agent: codex
- Reviewer: claude
- Risk: low
- Complexity: high

### Step 6: electrical-circuit-simulators-engine
- Goal: 전기공학 4대 인터랙티브 시뮬레이터(RLC 과도현상 오실로스코프, AC 페이저 및 전력 삼각형, 3상 Y-Δ 결선, 릴레이 시퀀스 로직) 수치해석 엔진 및 60fps Canvas 렌더러를 개발한다.
- Files: site/web/static/simulators/ee/rlc-transient.js, site/web/static/simulators/ee/phasor-power.js, site/web/static/simulators/ee/three-phase.js, site/web/static/simulators/ee/relay-sequence.js, site/web/static/simulators/ee/ee-sim-core.js, tests/ee-simulators.test.ts
- Acceptance: AC-1: RLC 과도응답 2차 미분방정식 수치 적분(RK4) 결과가 이론적 해석해와 1% 오차 이내로 일치하고, 슬라이더 변경 시 60fps로 전압/전류 파형이 갱신된다.
- Acceptance: AC-2: 복소평면 페이저 다이어그램 및 3상 Y-Δ 부하 변동 시 상전압/선간전압/전력 벡터가 실시간으로 동적 렌더링된다.
- Acceptance: AC-3: 릴레이 시퀀스 시뮬레이터에서 푸시버튼 클릭 시 자기유지 및 인터록 회로의 통전 경로와 램프 점등이 실시간으로 상태 전파된다.
- Acceptance: AC-4: `tests/ee-simulators.test.ts` 단위 테스트가 100% 통과한다.
- Tests: npx tsx tests/ee-simulators.test.ts
- Parallel: yes
- Depends on: electrical-engineering-course-content
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 7: electronics-interactive-simulators-engine
- Goal: 전자공학 4대 인터랙티브 시뮬레이터(LogicSim 디지털 논리 회로, OP-Amp/능동필터 Bode Plot, 트랜지스터 V-I 특성/부하선, 555 타이머 펄스) 엔진 및 캔버스 UI를 개발한다.
- Files: site/web/static/simulators/electronics/logic-sim.js, site/web/static/simulators/electronics/opamp-bode.js, site/web/static/simulators/electronics/transistor-curves.js, site/web/static/simulators/electronics/timer555.js, site/web/static/simulators/electronics/electronics-sim-core.js, tests/electronics-simulators.test.ts
- Acceptance: AC-1: LogicSim 엔진에서 기본 게이트(AND, OR, NOT, XOR 등) 및 플립플롭 연결 시 전파 지연 및 논리 상태(0/1)가 실시간으로 전파된다.
- Acceptance: AC-2: OP-Amp 능동 필터 회로의 부품값 변경에 따른 주파수 응답 크기(dB) 및 위상 선도(Bode Plot)가 복소 전달함수 기반으로 정확히 플롯된다.
- Acceptance: AC-3: BJT/MOSFET $V_{GS}, V_{DS}, V_{CE}$ 제어에 따른 포화/선형 동작점 이동과 부하선 왜곡이 실시간 렌더링된다.
- Acceptance: AC-4: `tests/electronics-simulators.test.ts` 단위 테스트가 100% 통과한다.
- Tests: npx tsx tests/electronics-simulators.test.ts
- Parallel: yes
- Depends on: electronic-engineering-course-content
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 8: web-interactive-viewer-integration
- Goal: 수학 기호 백과, 12대 수학 증명, 전기·전자공학 16개 모듈 및 8대 인터랙티브 시뮬레이터를 일체형으로 탐색·학습할 수 있는 반응형 웹 통합 뷰어를 구축한다.
- Files: site/web/static/math-ee/index.html, site/web/static/math-ee/viewer.css, site/web/static/math-ee/viewer.js, site/web/static/math-ee/manifest.json, scripts/verify-web-viewer.ts
- Acceptance: AC-1: 수학 기호 실시간 검색/영역별 필터링, 증명 단계별 토글, 전기/전자 강좌 탭 전환 및 내장 시뮬레이터 인터랙션이 브라우저에서 오류 없이 동작한다.
- Acceptance: AC-2: 모바일 뷰포트(360px)부터 데스크톱(1920px)까지 반응형 레이아웃이 지원되며 모든 수식이 KaTeX로 완벽히 렌더링된다.
- Acceptance: AC-3: `scripts/verify-web-viewer.ts` 정적 유효성 검증을 100% 통과한다.
- Tests: npx tsx scripts/verify-web-viewer.ts
- Parallel: yes
- Depends on: math-symbols-encyclopedia-content, math-theorems-rigorous-proofs-content, electrical-circuit-simulators-engine, electronics-interactive-simulators-engine
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 9: android-offline-ee-bundle-and-activity
- Goal: 수학 기호 백과, 수학 증명, 전기·전자공학 콘텐츠 및 8종 시뮬레이터 에셋을 안드로이드 오프라인 디렉터리로 번들링하고, 전용 액티비티(`MathEEViewerActivity`) 및 메인 화면 연동을 완성한다.
- Files: scripts/package-android-math-ee-assets.ts, android-app/app/src/main/assets/math-ee/manifest.json, android-app/app/src/main/assets/math-ee/viewer.html, android-app/app/src/main/java/com/prostudy/eink/ui/mathee/MathEEViewerActivity.kt, android-app/app/src/main/res/layout/activity_math_ee_viewer.xml, android-app/app/src/main/java/com/prostudy/eink/MainActivity.kt, android-app/app/src/main/AndroidManifest.xml
- Acceptance: AC-1: 번들링 스크립트가 수학 기호, 증명, 전기/전자 16개 모듈 데이터와 8대 시뮬레이터를 `android-app/app/src/main/assets/math-ee/`에 100% 무결하게 패키징한다.
- Acceptance: AC-2: `MainActivity`에 [⚡ 전기·전자 & 수학] 진입 버튼이 추가되고 클릭 시 `MathEEViewerActivity`가 실행되어 오프라인 비행기 모드에서도 0ms로 구동된다.
- Acceptance: AC-3: 안드로이드 코틀린 컴파일이 오류 없이 성공한다.
- Tests: ./android-app/gradlew -p android-app compileDebugKotlin
- Parallel: yes
- Depends on: web-interactive-viewer-integration
- Agent: codex
- Reviewer: claude
- Risk: medium
- Complexity: high

### Step 10: math-ee-verification-and-evidence
- Goal: 3계층 하네스 게이트(정적 검사, 회로 수치해석/조판 단위 테스트, 안드로이드 빌드 및 시뮬레이터 스크린샷 캡처)를 실행하고 최종 검증 증거 보고서를 생성한다.
- Files: evidence/20261010-math-ee-curriculum-suite/README.md, evidence/20261010-math-ee-curriculum-suite/verification_log.txt, scripts/verify-math-ee.ts
- Acceptance: AC-1: 수학 기호 조판, 12대 수학 증명, 16개 전기/전자 모듈, 8대 시뮬레이터의 단위/통합 테스트가 100% PASS한다.
- Acceptance: AC-2: 안드로이드 앱 빌드가 성공하고, 수식 조판 및 시뮬레이터 동작 화면 캡처가 포함된 4대 필수 섹션 README 증거 문서가 완성된다.
- Tests: npx tsx scripts/verify-math-ee.ts --all
- Parallel: no
- Depends on: android-offline-ee-bundle-and-activity
- Agent: claude
- Reviewer: agy
- Risk: low
- Complexity: medium

---

## Verification
- **Tier 1 (정적 검사 & 스키마 검증)**:
  - `npx tsx scripts/verify-math-ee.ts --all`: JSON 스키마 유효성, raw LaTeX/ASCII 기호 잔존 여부, KaTeX 조판 문법 검사
- **Tier 2 (수치해석 단위/통합 테스트)**:
  - `npx tsx tests/ee-simulators.test.ts`: RLC 미분방정식 RK4 수치해석 및 페이저 계산 오차 검증 (<1%)
  - `npx tsx tests/electronics-simulators.test.ts`: LogicSim 논리 전파 및 OP-Amp Bode Plot 복소 전달함수 검증
- **Tier 3 (실행 및 렌더링 시각 증거)**:
  - `./android-app/gradlew -p android-app compileDebugKotlin`: 안드로이드 네이티브 앱 컴파일 검증
  - 웹 브라우저 및 안드로이드 에뮬레이터에서 8대 시뮬레이터 실시간 구동 및 수식 조판 스크린샷 캡처 (`evidence/20261010-math-ee-curriculum-suite/`)

## Reviewer topology
- **Multi-lane Cross-Review (Anti-False Consensus Enforcement)**:
  - 데이터 및 시뮬레이터 빌더가 `codex`인 경우 리뷰어는 `claude`가 수행
  - 수학 기호 및 증명 콘텐츠 빌더가 `claude`인 경우 리뷰어는 `agy`가 수행
  - 수학 이론 및 검증 빌더가 `agy`인 경우 리뷰어는 `claude`가 수행
- 모든 머지는 PR 생성 후 독립 리뷰어의 사인오프를 거쳐 Squash Merge로 진행됨
