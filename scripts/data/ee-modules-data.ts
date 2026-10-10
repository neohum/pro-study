import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.resolve(__dirname, '..', '..', 'courses', 'electrical-eng');
const modulesDir = path.join(baseDir, 'modules');
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
}

export const eeModules = [
  {
    id: "ee-01",
    order: 1,
    domain: "전기공학 전자기초",
    titleKo: "전자기학 기초 및 맥스웰 방정식",
    titleEn: "Electromagnetics Fundamentals & Maxwell's Equations",
    file: "modules/01-electromagnetics.json",
    overview: "전하의 정전기적 상호작용부터 전류가 유도하는 자기장, 시간에 따라 변화하는 전자계의 상호 유도 현상과 맥스웰 4대 방정식의 물리적 본질을 학습합니다.",
    coreConcepts: [
      {
        titleKo: "쿨롱의 법칙과 전계",
        titleEn: "Coulomb's Law and Electric Field",
        principle: "두 점전하 사이에 작용하는 정전기력은 두 전하량의 곱에 비례하고 거리의 제곱에 반비례하며, 전하는 주변 공간에 전계(Electric Field)를 형성한다.",
        equations: [
          {
            name: "쿨롱의 힘 (Coulomb's Force)",
            typesetMath: "\\mathbf{F} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2} \\hat{\\mathbf{r}}",
            explanation: "진공 유전율 epsilon_0 하에서 두 전하 사이의 정전기적 인력/척력 벡터"
          },
          {
            name: "전계와 전위의 관계",
            typesetMath: "\\mathbf{E} = -\\nabla V",
            explanation: "전계는 전위(Electric Potential)의 음의 공간 기울기(Gradient)"
          }
        ]
      },
      {
        titleKo: "가우스 법칙 (전기장과 자기장)",
        titleEn: "Gauss's Laws",
        principle: "임의의 폐곡면을 통과하는 전기 선속은 내부 총전하량에 비례하며, 자기 홀극(Magnetic Monopole)은 존재하지 않으므로 닫힌 면을 통과하는 알짜 자기 선속은 항상 0이다.",
        equations: [
          {
            name: "가우스 법칙 (전기장)",
            typesetMath: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}, \\quad \\oint_{\\partial V} \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}",
            explanation: "전하가 전기장의 원천(발산원)임을 규정"
          },
          {
            name: "가우스 법칙 (자기장)",
            typesetMath: "\\nabla \\cdot \\mathbf{B} = 0, \\quad \\oint_{\\partial V} \\mathbf{B} \\cdot d\\mathbf{A} = 0",
            explanation: "자기력선은 항상 닫힌 루프를 형성하며 자하(자기 단극자)가 없음"
          }
        ]
      },
      {
        titleKo: "패러데이 유도 법칙과 앙페르-맥스웰 법칙",
        titleEn: "Faraday's Law and Ampere-Maxwell Law",
        principle: "시간에 따라 변화하는 자기장은 전기장을 회전시키며(전자기 유도), 전도 전류뿐만 아니라 시간에 따라 변화하는 전기장(변위 전류) 역시 자기장을 회전시킨다.",
        equations: [
          {
            name: "패러데이 전자기 유도",
            typesetMath: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}",
            explanation: "자속의 시간 변화율이 유도 기전력(회전 전계)을 발생시킴"
          },
          {
            name: "앙페르-맥스웰 법칙",
            typesetMath: "\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}",
            explanation: "전류밀도 J와 변위전류가 자기장을 생성하여 전자기파 전파 가능"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "변압기 및 무선 전력 전송의 결합 원리",
        practicalContext: "변압기 1차 코일의 교류 전류가 철심 내에 교번 자속을 형성하고, 패러데이 법칙에 의해 2차 코일에 기전력이 유도되어 전기에너지가 절연된 상태로 전달됨.",
        engineeringNote: "철심 내 맴돌이 전류(와전류, Eddy Current) 손실을 줄이기 위해 규소강판을 얇게 적층(Lamination)하여 사용함."
      }
    ],
    simulationRef: {
      id: "sim-em-field",
      type: "em-field",
      title: "정전계 및 자계 시각화 시뮬레이터",
      initialParams: { q1: 1.0, q2: -1.0, distance: 2.0 },
      keyFormulas: ["E = k*q/r^2", "V = k*q/r"]
    },
    summary: "맥스웰 방정식은 전하와 전류가 전기장과 자기장을 어떻게 생성하고 상호작용하는지 규명하며, 빛이 전자기파임을 증명한 전기공학의 대원칙입니다."
  },
  {
    id: "ee-02",
    order: 2,
    domain: "직류 회로 이론",
    titleKo: "직류(DC) 회로 해석 및 등가망 이론",
    titleEn: "DC Circuit Analysis & Network Theorems",
    file: "modules/02-dc-circuits.json",
    overview: "옴의 법칙, 키르히호프의 전류/전압 법칙(KCL/KVL), 중첩의 원리, 테브난 및 노턴의 등가 회로를 통하여 복잡한 직류 회로망을 해석하는 체계적 기법을 습득합니다.",
    coreConcepts: [
      {
        titleKo: "옴의 법칙과 줄의 법칙",
        titleEn: "Ohm's Law & Joule's Heating",
        principle: "도체에 흐르는 전류는 양단 전압에 비례하고 저항에 반비례하며, 저항에 전류가 흐르면 열에너지로 전력이 소모된다.",
        equations: [
          {
            name: "옴의 법칙 (Ohm's Law)",
            typesetMath: "V = I R, \\quad I = \\frac{V}{R}, \\quad R = \\frac{V}{I}",
            explanation: "전압, 전류, 저항의 기본 비례 관계"
          },
          {
            name: "직류 전력 (DC Power)",
            typesetMath: "P = V I = I^2 R = \\frac{V^2}{R}",
            explanation: "단위 시간당 저항체에서 열로 방출되는 전력 (와트, W)"
          }
        ]
      },
      {
        titleKo: "키르히호프 법칙 (KCL과 KVL)",
        titleEn: "Kirchhoff's Current & Voltage Laws",
        principle: "전하량 보존 법칙에 의해 마디로 들어오는 전류의 합은 나가는 전류의 합과 같으며(KCL), 에너지 보존 법칙에 의해 임의의 폐회로를 따라 전위차를 모두 더하면 0이 된다(KVL).",
        equations: [
          {
            name: "KCL (Kirchhoff's Current Law)",
            typesetMath: "\\sum_{k=1}^n I_k = 0",
            explanation: "임의의 접속점(Node)에서 유입/유출 전류의 대수적 합은 0"
          },
          {
            name: "KVL (Kirchhoff's Voltage Law)",
            typesetMath: "\\sum_{k=1}^m V_k = 0",
            explanation: "임의의 폐루프(Loop)를 일주하는 전압 상승과 강하의 총합은 0"
          }
        ]
      },
      {
        titleKo: "테브난 및 노턴 등가 회로",
        titleEn: "Thevenin & Norton Equivalent Circuits",
        principle: "아무리 복잡한 선형 저항 회로망이라도 부하 단자에서 바라보면 하나의 전압원과 직렬 저항(테브난), 또는 하나의 전류원과 병렬 저항(노턴)으로 완벽히 치환할 수 있다.",
        equations: [
          {
            name: "테브난 등가 회로 (Thevenin)",
            typesetMath: "V_{\\text{Th}} = V_{\\text{oc}}, \\quad R_{\\text{Th}} = \\frac{V_{\\text{oc}}}{I_{\\text{sc}}}",
            explanation: "개방단자 전압과 단락 전류의 비로 등가 저항 산출"
          },
          {
            name: "최대 전력 전달 조건 (Maximum Power Transfer)",
            typesetMath: "R_L = R_{\\text{Th}} \\implies P_{\\max} = \\frac{V_{\\text{Th}}^2}{4 R_{\\text{Th}}}",
            explanation: "부하 저항이 내부 테브난 저항과 같을 때 부하에 최대 전력 전달"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "배터리 내부 저항 및 전압 강하 측정",
        practicalContext: "전원 장치는 이상적이지 않고 내부 저항을 가지므로, 대전류 부하가 연결되면 단자 전압이 V_terminal = E - I*R_int로 강하함.",
        engineeringNote: "자동차 시동 시 헤드라이트가 순간 어두워지는 현상이 전형적인 배터리 내부 저항에 의한 전압 강하 사례임."
      }
    ],
    simulationRef: {
      id: "sim-dc-circuit",
      type: "dc-network",
      title: "DC 브리지 회로 및 테브난 등가 시뮬레이터",
      initialParams: { Vs: 12.0, R1: 100, R2: 220, R3: 330, R4: 470, RL: 150 },
      keyFormulas: ["Vth = Vs*(R2/(R1+R2) - R4/(R3+R4))", "Rth = R1||R2 + R3||R4"]
    },
    summary: "선형 직류 회로망은 KCL, KVL 및 테브난 등가 정리를 적용하여 복잡성에 상관없이 항상 단일 원천-부하 방정식으로 단순화하여 정확히 해석할 수 있습니다."
  },
  {
    id: "ee-03",
    order: 3,
    domain: "과도 현상 및 에너지 소자",
    titleKo: "RLC 과도 현상과 시정수 해석",
    titleEn: "RLC Circuit Transients & Time Constant Analysis",
    file: "modules/03-transient-rlc.json",
    overview: "커패시터의 전계 에너지 축적, 인덕터의 자계 에너지 축적 특성과 1차 RC/RL 회로의 지수적 충방전 시정수(τ), 2차 RLC 회로의 과도응답(과감쇠, 임계감쇠, 저감쇠) 2계 미분방정식을 깊이 탐구합니다.",
    coreConcepts: [
      {
        titleKo: "커패시터와 인덕터의 V-I 미적분 관계",
        titleEn: "V-I Differential Equations of C and L",
        principle: "커패시터는 전압의 급격한 변화에 저항하며 전류는 전압의 미분에 비례하고, 인덕터는 전류의 급격한 변화에 저항하여 역기전력을 발생시킨다.",
        equations: [
          {
            name: "커패시터 전류식",
            typesetMath: "i_C(t) = C \\frac{dv_C(t)}{dt}, \\quad v_C(t) = \\frac{1}{C}\\int_0^t i_C(\\tau)d\\tau + v_C(0)",
            explanation: "커패시터 양단 전압은 불연속적으로 급변할 수 없음"
          },
          {
            name: "인덕터 전압식",
            typesetMath: "v_L(t) = L \\frac{di_L(t)}{dt}, \\quad i_L(t) = \\frac{1}{L}\\int_0^t v_L(\\tau)d\\tau + i_L(0)",
            explanation: "인덕터에 흐르는 전류는 불연속적으로 급변할 수 없음"
          }
        ]
      },
      {
        titleKo: "1차 RC 및 RL 회로의 충방전 시정수(τ)",
        titleEn: "First-Order RC and RL Time Constant",
        principle: "1차 미분방정식을 풀면 과도응답은 자연지수 감쇠 곡선 e^(-t/τ)를 따르며, 시정수 τ(초)는 최종 목표값의 63.2%에 도달하는 시간이다.",
        equations: [
          {
            name: "RC 회로 충전 전압",
            typesetMath: "v_C(t) = V_s \\left( 1 - e^{-t / \\tau} \\right) \\quad (\\tau = R C)",
            explanation: "5시정수(5τ) 경과 시 99.3% 도달하여 정상상태 간주"
          },
          {
            name: "RL 회로 방전 전류",
            typesetMath: "i_L(t) = I_0 e^{-t / \\tau} \\quad \\left(\\tau = \\frac{L}{R}\\right)",
            explanation: "인덕터 전류의 지수적 감소 곡선"
          }
        ]
      },
      {
        titleKo: "2차 RLC 회로의 감쇠 분류",
        titleEn: "Second-Order RLC Transient Response",
        principle: "RLC 직렬 회로는 2계 미분방정식 d^2v/dt^2 + 2α dv/dt + ω_0^2 v = 0을 따르며, 감쇠계수 α와 고유각진동수 ω_0의 상대적 크기에 따라 3가지 감쇠 상태로 나뉜다.",
        equations: [
          {
            name: "2차 특성방정식",
            typesetMath: "s^2 + 2\\alpha s + \\omega_0^2 = 0 \\quad \\left(\\alpha = \\frac{R}{2L}, \\; \\omega_0 = \\frac{1}{\\sqrt{LC}}\\right)",
            explanation: "특성근 s = -alpha +- sqrt(alpha^2 - omega_0^2)"
          },
          {
            name: "감쇠 상태 분류",
            typesetMath: "\\begin{cases} \\alpha > \\omega_0 & \\text{과감쇠 (Overdamped: 진동 없음, 느린 수렴)} \\\\ \\alpha = \\omega_0 & \\text{임계감쇠 (Critically Damped: 최단 시간 수렴)} \\\\ \\alpha < \\omega_0 & \\text{저감쇠 (Underdamped: 감쇠 진동 파형)} \\end{cases}",
            explanation: "Q factor 및 댐핑비에 따른 과도 파형의 극적인 변화"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "스위칭 서지(Surge) 흡수 및 스너버(Snubber) 회로",
        practicalContext: "인덕티브 부하(릴레이 코일, 모터)를 스위치로 차단할 때 v_L = L*(di/dt)에 의해 수천 볼트의 고전압 아크가 발생하여 소자가 파괴될 수 있으므로, RC 스너버나 플라이백 다이오드를 병렬 연결하여 감쇠 과도상태로 서지를 흡수함.",
        engineeringNote: "계측기 오실로스코프 프로브 보정(Probe Compensation)도 임계감쇠 상태를 맞추어 방형파 왜곡을 없애는 대표적 응용임."
      }
    ],
    simulationRef: {
      id: "sim-rlc-transient",
      type: "rlc-transient",
      title: "RLC 과도현상 및 오실로스코프 시뮬레이터",
      initialParams: { R: 20.0, L: 0.1, C: 0.0001, Vin: 10.0, waveType: "step" },
      keyFormulas: ["alpha = R / (2*L)", "omega0 = 1 / sqrt(L*C)", "v(t) = Vin*(1 - exp(-alpha*t)*(cos(wd*t) + (alpha/wd)*sin(wd*t)))"]
    },
    summary: "에너지 저장 소자(L, C)는 전압과 전류의 시간 미분 관계를 형성하며, RLC 회로의 과도 응답은 미분방정식의 특성근에 의해 과감쇠, 임계감쇠, 저감쇠 진동으로 결정됩니다."
  },
  {
    id: "ee-04",
    order: 4,
    domain: "교류 회로 및 페이저",
    titleKo: "정현파 교류 및 복소 페이저(Phasor) 해석",
    titleEn: "Sinusoidal AC & Complex Phasor Analysis",
    file: "modules/04-ac-phasor.json",
    overview: "단순 정현파 교류 신호의 실효값(RMS), 각주파수, 복소 페이저(Phasor) 변환 및 복소 임피던스(Z = R + jX)를 이용해 미분방정식을 대수 방정식으로 치환하는 현대 교류 회로 해석의 핵심을 학습합니다.",
    coreConcepts: [
      {
        titleKo: "정현파 교류와 실효값 (RMS)",
        titleEn: "Sinusoidal AC and Root-Mean-Square",
        principle: "교류는 전압과 전류의 방향과 크기가 시간에 따라 주기적으로 변하며, 직류와 동일한 열 효과를 내는 유효 에너지 등가 전압을 실효값(RMS)이라 한다.",
        equations: [
          {
            name: "정현파 전압 순시치",
            typesetMath: "v(t) = V_m \\cos(\\omega t + \\phi) \\quad (\\omega = 2\\pi f)",
            explanation: "최댓값 V_m, 각주파수 omega, 초기위상각 phi"
          },
          {
            name: "실효값 (RMS, Root-Mean-Square)",
            typesetMath: "V_{\\text{rms}} = \\sqrt{\\frac{1}{T}\\int_0^T v^2(t)\\,dt} = \\frac{V_m}{\\sqrt{2}} \\approx 0.707 V_m",
            explanation: "대한민국 가정용 교류 220V는 실효값이며 최댓값은 약 311V임"
          }
        ]
      },
      {
        titleKo: "페이저(Phasor) 변환과 오일러 항등식",
        titleEn: "Phasor Transform and Complex Frequency Domain",
        principle: "오일러 공식을 이용하여 시간에 종속적인 정현파 cos(ωt + φ)를 복소평면의 회전 벡터 V_m e^(jφ) e^(jωt)로 표현하고, 공통 회전인자 e^(jωt)를 생략하여 주파수 영역의 정적 페이저 V로 변환한다.",
        equations: [
          {
            name: "페이저 표현 (Phasor Representation)",
            typesetMath: "\\mathbf{V} = V_{\\text{rms}} \\angle \\phi = V_{\\text{rms}} e^{j\\phi} = V_{\\text{rms}} (\\cos\\phi + j\\sin\\phi)",
            explanation: "전기공학에서는 허수 단위를 전류 기호 i와 구분하기 위해 j를 사용함"
          },
          {
            name: "시간 미분의 페이저 변환",
            typesetMath: "\\frac{d}{dt} \\longleftrightarrow j\\omega, \\quad \\int dt \\longleftrightarrow \\frac{1}{j\\omega}",
            explanation: "미분방정식을 단순한 복소수 대수 곱셈/나눗셈으로 변환하는 마법의 도구"
          }
        ]
      },
      {
        titleKo: "복소 임피던스(Z)와 리액턴스(X)",
        titleEn: "Complex Impedance & Reactance",
        principle: "교류 회로에서 전류의 흐름을 방해하는 총체적 저항 성분을 임피던스(Impedance, Z)라 하며, 저항(R)과 위상을 90도 회전시키는 유도성/용량성 리액턴스(X)의 복소수 합으로 정의된다.",
        equations: [
          {
            name: "복소 임피던스 정의",
            typesetMath: "\\mathbf{Z} = R + jX = |\\mathbf{Z}| e^{j\\theta} \\quad (|\\mathbf{Z}| = \\sqrt{R^2 + X^2}, \\; \\theta = \\arctan(X/R))",
            explanation: "저항 R(실수부)과 리액턴스 X(허수부)"
          },
          {
            name: "L과 C의 리액턴스",
            typesetMath: "Z_L = j\\omega L = j X_L \\; (X_L = \\omega L), \\quad Z_C = \\frac{1}{j\\omega C} = -j X_C \\; \\left(X_C = \\frac{1}{\\omega C}\\right)",
            explanation: "인덕터는 전압이 전류보다 90도 앞서고(진상), 커패시터는 전압이 전류보다 90도 뒤짐(지상)"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "교류 오디오 크로스오버 및 노이즈 필터링",
        practicalContext: "주파수에 따라 임피던스가 달라지는 원리(고주파에서 X_L은 커지고 X_C는 작아짐)를 활용하여, 저음은 우퍼 스피커(L 직렬 통과)로 보내고 고음은 트위터 스피커(C 직렬 통과)로 분리함.",
        engineeringNote: "임피던스 매칭(Impedance Matching)을 통해 오디오 앰프와 스피커 사이의 반사 손실 없이 최대 전력을 전달함."
      }
    ],
    simulationRef: {
      id: "sim-phasor-power",
      type: "phasor-power",
      title: "AC 페이저 및 전력 삼각형 시뮬레이터",
      initialParams: { Vrms: 220, frequency: 60, R: 10, L: 0.05, C: 0.00005 },
      keyFormulas: ["XL = 2*pi*f*L", "XC = 1/(2*pi*f*C)", "Z = sqrt(R^2 + (XL - XC)^2)", "I = V/Z", "theta = atan((XL-XC)/R)"]
    },
    summary: "페이저 변환은 복잡한 시간 영역의 교류 미분방정식을 복소평면 상의 대수적 옴의 법칙(V = I*Z)으로 변환하여 신속하고 정확한 교류 회로 해석을 가능하게 합니다."
  },
  {
    id: "ee-05",
    order: 5,
    domain: "교류 전력 및 공진",
    titleKo: "교류 전력, 역률 개선 및 RLC 공진 회로",
    titleEn: "AC Power, Power Factor Correction & Resonance",
    file: "modules/05-ac-power-resonance.json",
    overview: "유효전력(P), 무효전력(Q), 피상전력(S)으로 구성되는 복소 전력 삼각형, 산업 현장의 송배전 효율을 극대화하는 역률 개선(Power Factor Correction), 직렬/병렬 RLC 공진 현상을 분석합니다.",
    coreConcepts: [
      {
        titleKo: "교류 전력 3총사: 유효, 무효, 피상전력",
        titleEn: "Active, Reactive, and Apparent Power",
        principle: "교류에서는 저항에서 열이나 일로 실제 소비되는 유효전력(P)과, L과 C 사이에서 에너지를 주기적으로 주고받기만 하는 무효전력(Q)이 존재하며, 둘의 벡터 합을 피상전력(S)이라 한다.",
        equations: [
          {
            name: "복소 전력 (Complex Power)",
            typesetMath: "\\mathbf{S} = \\mathbf{V} \\mathbf{I}^* = P + jQ = |\\mathbf{S}| e^{j\\theta}",
            explanation: "복소수 전력 표현 (I*는 켤레 전류 페이저)"
          },
          {
            name: "전력의 크기 및 단위",
            typesetMath: "P = V_{\\text{rms}} I_{\\text{rms}} \\cos\\theta \\; [\\text{W}], \\quad Q = V_{\\text{rms}} I_{\\text{rms}} \\sin\\theta \\; [\\text{VAR}], \\quad S = V_{\\text{rms}} I_{\\text{rms}} \\; [\\text{VA}]",
            explanation: "유효전력(와트 W), 무효전력(바 VAR), 피상전력(볼트암페어 VA)"
          }
        ]
      },
      {
        titleKo: "역률(Power Factor)과 진상 커패시터 역률 개선",
        titleEn: "Power Factor & Capacitor Correction",
        principle: "역률 cosθ는 공급된 전체 피상전력 중 실제 유효하게 일하는 전력의 비율이다. 모터 등 유도성 부하(지상 역률)에 병렬로 진상 커패시터를 설치하면 유도성 무효전력을 상쇄하여 선로 전류와 송전 손실을 극적으로 감소시킨다.",
        equations: [
          {
            name: "역률 공식",
            typesetMath: "\\text{PF} = \\cos\\theta = \\frac{P}{S} = \\frac{P}{\\sqrt{P^2 + Q^2}}",
            explanation: "전압과 전류의 위상차 세타의 코사인 값"
          },
          {
            name: "역률 개선 필요 커패시터 용량(Q_C)",
            typesetMath: "Q_C = P (\\tan\\theta_1 - \\tan\\theta_2) = \\omega C V^2",
            explanation: "역률을 cos theta_1에서 cos theta_2로 개선하기 위한 진상용량"
          }
        ]
      },
      {
        titleKo: "RLC 직렬 및 병렬 공진",
        titleEn: "Series and Parallel Resonance",
        principle: "유도 리액턴스와 용량 리액턴스의 크기가 같아져(X_L = X_C) 허수부가 완전히 상쇄되는 특정 주파수를 공진 주파수(Resonant Frequency)라 하며, 직렬 공진 시 임피던스는 최소가 되고 전류는 최대가 된다.",
        equations: [
          {
            name: "공진 주파수 공식",
            typesetMath: "f_0 = \\frac{1}{2\\pi \\sqrt{LC}}, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}",
            explanation: "L과 C의 값에 의해 결정되는 고유 진동 주파수"
          },
          {
            name: "품질 계수 (Quality Factor, Q)",
            typesetMath: "Q = \\frac{\\omega_0 L}{R} = \\frac{1}{\\omega_0 C R} = \\frac{f_0}{\\text{BW}}",
            explanation: "공진의 날카로움(선택도) 및 대역폭(Bandwidth)과의 관계"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "공장 변전실 진상 콘덴서 설치 및 한전 전기요금 할인",
        practicalContext: "공장의 수많은 전동기는 유도성 부하이므로 역률이 0.7~0.8로 낮음. 병렬 진상 커패시터 뱅크를 설치해 역률을 0.95 이상으로 올리면 선로 손실(I^2*R)이 줄고 한전 역률 요금 할인을 적용받음.",
        engineeringNote: "과보상(Over-compensation) 시 페란티 현상(Ferranti effect)으로 수전단 전압이 송전단보다 높아져 설비가 소손될 수 있으므로 자동 역률 제어기(APFC)를 사용함."
      }
    ],
    simulationRef: {
      id: "sim-phasor-power",
      type: "phasor-power",
      title: "AC 페이저 및 전력 삼각형 시뮬레이터",
      initialParams: { P: 1000, QL: 800, QC: 400, V: 220 },
      keyFormulas: ["Q_net = QL - QC", "S = sqrt(P^2 + Q_net^2)", "PF = P / S"]
    },
    summary: "교류 전력은 P, Q, S의 삼각 기하학적 관계를 가지며, 역률 개선은 송배전 효율의 핵심이고, 공진 현상은 무선 주파수 튜닝과 필터의 기반이 됩니다."
  },
  {
    id: "ee-06",
    order: 6,
    domain: "3상 교류 및 전력 계통",
    titleKo: "3상 교류 전력 및 변압기 계통 해석",
    titleEn: "Three-Phase Power Systems & Transformers",
    file: "modules/06-three-phase-systems.json",
    overview: "현대 대규모 발전, 송전, 배전의 표준인 3상 교류(Y결선 및 Δ결선)의 선간/상전압·전류 위상 관계, 3상 평형 전력 수식, 변압기의 권수비 및 임피던스 변환 원리를 학습합니다.",
    coreConcepts: [
      {
        titleKo: "3상 교류 생성 및 위상차 120°",
        titleEn: "Three-Phase Generation (120° Phase Shift)",
        principle: "공간적으로 120도 각도로 배치된 3개의 권선 내부에서 자계가 회전하면 시간적으로 120도의 위상차를 갖는 동일 크기의 3상 정현파 기전력(A상, B상, C상)이 발생한다.",
        equations: [
          {
            name: "평형 3상 전압",
            typesetMath: "v_a(t) = V_m \\cos(\\omega t), \\; v_b(t) = V_m \\cos(\\omega t - 120^\\circ), \\; v_c(t) = V_m \\cos(\\omega t - 240^\\circ)",
            explanation: "어느 순간에나 세 상의 순시 전압 합은 0: v_a + v_b + v_c = 0"
          }
        ]
      },
      {
        titleKo: "Y(와이) 결선과 Δ(델타) 결선",
        titleEn: "Wye (Y) and Delta (Δ) Connections",
        principle: "Y결선에서는 선간전압이 상전압의 루트 3배이고 30도 앞서며, 델타결선에서는 선전류가 상전류의 루트 3배이고 30도 뒤진다.",
        equations: [
          {
            name: "Y결선 (성형 결선)",
            typesetMath: "V_L = \\sqrt{3} V_p \\angle 30^\\circ, \\quad I_L = I_p",
            explanation: "상전압 220V일 때 선간전압은 220 * sqrt(3) = 380V (한국 동력 표준)"
          },
          {
            name: "Δ결선 (환상 결선)",
            typesetMath: "V_L = V_p, \\quad I_L = \\sqrt{3} I_p \\angle -30^\\circ",
            explanation: "선간전압은 상전압과 같고 선전류가 상전류의 sqrt(3)배"
          },
          {
            name: "평형 3상 전력 총합",
            typesetMath: "P_{\\text{3\\phi}} = 3 V_p I_p \\cos\\theta = \\sqrt{3} V_L I_L \\cos\\theta",
            explanation: "결선 방식에 관계없이 선간전압과 선전류로 표현한 동일 공식"
          }
        ]
      },
      {
        titleKo: "이상적 변압기 권수비와 임피던스 변환",
        titleEn: "Ideal Transformer & Impedance Reflection",
        principle: "1차측 권선수와 2차측 권선수의 비에 따라 전압은 비례하여 승압/강압되고 전류는 반비례하며, 2차 부하 임피던스는 권수비의 제곱에 비례하여 1차측으로 반사된다.",
        equations: [
          {
            name: "변압기 권수비 (Turns Ratio)",
            typesetMath: "a = \\frac{N_1}{N_2} = \\frac{V_1}{V_2} = \\frac{I_2}{I_1}",
            explanation: "에너지 보존: V1 * I1 = V2 * I2"
          },
          {
            name: "임피던스 변환 (Impedance Reflection)",
            typesetMath: "Z'_L = a^2 Z_L = \\left(\\frac{N_1}{N_2}\\right)^2 Z_L",
            explanation: "1차측에서 바라본 2차 부하의 등가 임피던스"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "초고압 송전(765kV, 345kV)과 송전 손실 1/a^2 감소",
        practicalContext: "동일한 전력 P를 보낼 때 전압 V를 a배 올리면 전류 I는 1/a로 줄어들고, 송전선로의 저항 손실 P_loss = I^2*R은 (1/a)^2으로 격감함. 이것이 테슬라의 교류 승압 송전이 에디슨의 직류를 이긴 핵심 이유임.",
        engineeringNote: "3상 평형 시스템은 중성선(Neutral line) 전류가 0이 되므로 구리 도선의 소모량을 단상에 비해 25% 절감할 수 있음."
      }
    ],
    simulationRef: {
      id: "sim-three-phase",
      type: "three-phase",
      title: "3상 교류 Y-Δ 결선 및 변압기 시뮬레이터",
      initialParams: { Vphase: 220, frequency: 60, connection: "Y", loadZ: 10 },
      keyFormulas: ["Vline = sqrt(3)*Vphase", "P_total = sqrt(3)*Vline*Iline*cos(theta)"]
    },
    summary: "3상 교류는 평형 상태에서 순간 전력 공급이 일정하여 맥동이 없고 구리 도선을 획기적으로 절약할 수 있어 전 세계 전력 인프라의 표준입니다."
  },
  {
    id: "ee-07",
    order: 7,
    domain: "전기기기 및 모터 제어",
    titleKo: "전기기기: 직류기, 유도 전동기 및 모터 제어",
    titleEn: "Electric Machines: DC Motors, Induction Motors & VFD",
    file: "modules/07-electric-machines.json",
    overview: "플레밍의 왼손/오른손 법칙을 기반으로 하는 전자기적 동력 변환 원리, 직류 전동기의 토크-속도 제어, 3상 유도 전동기의 회전자계와 슬립(Slip), 인버터(VFD)를 통한 가변속 제어를 학습합니다.",
    coreConcepts: [
      {
        titleKo: "로렌츠 힘과 전자기 동력 변환",
        titleEn: "Lorentz Force and Electromechanical Energy Conversion",
        principle: "자기장 B 내에서 전류 I가 흐르는 도선은 힘 F = I(L x B)을 받아 회전하고(전동기 모드), 자기장 내에서 도선이 속도 v로 움직이면 기전력 E = v x B가 유도된다(발전기 모드).",
        equations: [
          {
            name: "전자기 토크 (Torque)",
            typesetMath: "T = K_t \\Phi I_a",
            explanation: "자속 Phi와 전기자 전류 I_a의 곱에 비례하는 회전 토크"
          },
          {
            name: "역기전력 (Back-EMF)",
            typesetMath: "E_b = K_e \\Phi \\omega_m",
            explanation: "모터 회전속도 omega_m에 비례하여 인가 전압에 대항하는 역전압"
          }
        ]
      },
      {
        titleKo: "3상 유도 전동기와 회전자계",
        titleEn: "Induction Motors and Rotating Magnetic Field",
        principle: "3상 고정자 권선에 120도 위상차의 교류 전류가 흐르면 공간적으로 일정한 크기로 회전하는 회전자계가 형성되며, 회전자는 이 자계를 따라가기 위해 슬립(Slip, s)을 발생시키며 유도 전류로 토크를 생성한다.",
        equations: [
          {
            name: "동기 속도 (Synchronous Speed)",
            typesetMath: "N_s = \\frac{120 f}{P} \\; [\\text{rpm}]",
            explanation: "전원 주파수 f와 전동기 극수 P에 의해 결정되는 회전자계 속도"
          },
          {
            name: "슬립 (Slip)",
            typesetMath: "s = \\frac{N_s - N}{N_s} \\quad (0 < s < 1)",
            explanation: "회전자 속도 N과 동기속도 N_s 사이의 상대적 지연 비율"
          }
        ]
      },
      {
        titleKo: "인버터(VFD)와 V/f 일정 제어",
        titleEn: "Variable Frequency Drives (VFD) and V/f Control",
        principle: "유도 전동기의 속도를 제어하기 위해 인버터는 주파수 f를 가변시키는데, 이때 자속 포화를 방지하고 정격 토크를 유지하기 위해 전압과 주파수의 비(V/f)를 일정하게 유지한다.",
        equations: [
          {
            name: "V/f 일정 법칙",
            typesetMath: "\\frac{V}{f} = \\text{const} \\implies \\Phi_m \\approx \\text{const}",
            explanation: "기저 주파수 이하에서 최대 토크 유지 제어"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "전기차(EV) 구동 모터 및 엘리베이터 인버터 제어",
        practicalContext: "전기차는 영구자석 동기모터(PMSM) 또는 유도전동기를 인버터의 공간벡터 PWM(SVPWM) 기법으로 초당 수천 번 스위칭하여 정지 상태에서부터 최대 토크를 부드럽게 발휘함.",
        engineeringNote: "감속 시 회생 제동(Regenerative Braking)을 통해 운동에너지를 전기에너지로 회수하여 배터리를 충전함."
      }
    ],
    simulationRef: {
      id: "sim-motor-torque",
      type: "motor-control",
      title: "유도 전동기 토크-속도 곡선 시뮬레이터",
      initialParams: { f: 60, poles: 4, V: 380, R2: 0.5, X2: 1.5 },
      keyFormulas: ["Ns = 120*f/P", "Torque = (3/omega_s) * (V^2 * (R2/s)) / ((R1 + R2/s)^2 + (X1 + X2)^2)"]
    },
    summary: "전기기기는 전자기 유도와 로렌츠 힘을 이용해 전기와 역학적 동력을 상호 변환하며, 인버터 전력전자는 모터의 속도와 토크를 정밀하게 제어합니다."
  },
  {
    id: "ee-08",
    order: 8,
    domain: "실전 전기설비 및 시퀀스",
    titleKo: "실무 시퀀스 제어, 접지 및 전기안전 규정(KEC)",
    titleEn: "Relay Sequence Control, Grounding & Electrical Safety",
    file: "modules/08-sequence-and-safety.json",
    overview: "산업 플랜트와 빌딩 제어의 핵심인 릴레이 시퀀스(자기유지, 인터록 회로), 배전 차단기(MCCB, ELCB), 인체 감전 보호 접지 계통(TN, TT, IT) 및 한국전기설비규정(KEC) 핵심을 체득합니다.",
    coreConcepts: [
      {
        titleKo: "릴레이 시퀀스 기초: a접점, b접점, 자기유지",
        titleEn: "Relay Contacts & Self-Holding Circuit",
        principle: "푸시버튼을 누르면 릴레이 코일이 여자되어 a접점(Normally Open)이 닫히고, 버튼에서 손을 떼어도 릴레이 자체 a접점을 통해 통전 상태를 유지하는 것이 자기유지(Self-Holding) 회로이다.",
        equations: [
          {
            name: "자기유지 논리식",
            typesetMath: "R = (\\text{PB}_{\\text{start}} + R) \\cdot \\overline{\\text{PB}_{\\text{stop}}}",
            explanation: "기동 버튼을 누르거나 릴레이가 켜져 있고 정지 버튼이 안 눌렸을 때 유지"
          },
          {
            name: "인터록 회로 (Interlock)",
            typesetMath: "R_1 = \\text{PB}_1 \\cdot \\overline{R_2}, \\quad R_2 = \\text{PB}_2 \\cdot \\overline{R_1}",
            explanation: "모터 정역회전 시 단락 사고를 막기 위해 상대방 b접점을 직렬로 걸어 동시 투입 방지"
          }
        ]
      },
      {
        titleKo: "인체 감전 메커니즘과 누전차단기(ELCB)",
        titleEn: "Electric Shock & Residual Current Circuit Breakers",
        principle: "인체에 30mA 이상의 교류 전류가 수십 밀리초 이상 흐르면 심실세동(Ventricular Fibrillation)이 발생하여 사망에 이를 수 있다. 누전차단기는 영상변류기(ZCT)로 왕복 전류 차이를 감지해 0.03초 이내에 차단한다.",
        equations: [
          {
            name: "영상전류 누전 감지",
            typesetMath: "I_{\\Delta n} = |\\mathbf{I}_{\\text{hot}} + \\mathbf{I}_{\\text{neutral}}| > 30\\text{ mA} \\implies \\text{Trip within } 0.03\\text{ s}",
            explanation: "정상 시 왕복 전류 합은 0이나 누전 시 지락전류만큼 차이 발생"
          }
        ]
      },
      {
        titleKo: "접지 시스템의 분류 (TN, TT, IT 계통)",
        titleEn: "Grounding Systems (TN, TT, IT according to KEC)",
        principle: "한국전기설비규정(KEC) 국제표준(IEC 60364)에 따른 3대 접지 방식: 계통 전원측 접지(T/I)와 전기기기 외함 접지(N/T)의 결선 방식에 따라 고장 전류 경로와 차단 특성이 달라진다.",
        equations: [
          {
            name: "지락 고장 전압",
            typesetMath: "V_{\\text{touch}} = I_{\\text{fault}} \\times R_{\\text{ground}} \\le 50\\text{ V}",
            explanation: "인체 허용 접촉 전압 50V 이하로 억제하는 접지 저항 설계"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "공장 모터 정역회전 및 비상정지 시퀀스 구성",
        practicalContext: "컨베이어 벨트나 크레인 모터에서 정회전과 역회전 접촉기(MC1, MC2)가 동시에 들어가면 380V 단선 단락(Short) 폭발 사고가 나므로, 전기적 인터록(상대방 b접점 직렬)과 기계적 인터록(기계적 빗장)의 2중 안전장치를 필수 구성함.",
        engineeringNote: "비상정지(Emergency Stop) 스위치는 접점이 고장 나 떨어져도 안전하게 차단되도록 항상 b접점(Fail-Safe 원칙)으로 결선함."
      }
    ],
    simulationRef: {
      id: "sim-relay-sequence",
      type: "relay-sequence",
      title: "릴레이 시퀀스 제어 인터랙티브 시뮬레이터",
      initialParams: { pbStart: false, pbStop: false, relayState: false, lampState: false },
      keyFormulas: ["Relay = (PB_start || Relay) && !PB_stop", "Lamp = Relay"]
    },
    summary: "릴레이 시퀀스는 산업 자동화 제어의 뼈대이며, Fail-Safe 원칙, 누전차단기, KEC 규격 접지 시스템은 인명과 설비를 보호하는 전기 실무의 최우선 가치입니다."
  }
];

// Write individual modules
for (const m of eeModules) {
  const filePath = path.join(modulesDir, `${path.basename(m.file)}`);
  fs.writeFileSync(filePath, JSON.stringify(m, null, 2), 'utf8');
  console.log(`Generated EE module: ${path.basename(m.file)}`);
}

// Write manifest
const manifest = {
  title: "전기공학 마스터 커리큘럼 (Electrical Engineering Curriculum)",
  description: "전자기학 기초부터 직류/교류 회로이론, RLC 과도현상, 페이저 해석, 3상 전력, 전기기기 및 실무 시퀀스/안전설비까지 8단계 정밀 학습",
  totalModules: eeModules.length,
  modules: eeModules.map(m => ({
    id: m.id,
    order: m.order,
    domain: m.domain,
    titleKo: m.titleKo,
    titleEn: m.titleEn,
    file: m.file,
    simId: m.simulationRef.id
  }))
};

fs.writeFileSync(path.join(baseDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`\n🎉 Successfully generated EE manifest and all ${eeModules.length} module files.\n`);
