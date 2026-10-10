import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.resolve(__dirname, '..', '..', 'courses', 'electronics-eng');
const modulesDir = path.join(baseDir, 'modules');
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
}

export const elModules = [
  {
    id: "el-01",
    order: 1,
    domain: "반도체 물리 기초",
    titleKo: "반도체 물성 및 PN 접합의 원리",
    titleEn: "Semiconductor Physics & PN Junction Principles",
    file: "modules/01-semiconductor-physics.json",
    overview: "실리콘 결정 구조, 에너지 밴드갭 이론, N형 및 P형 불순물 도핑(Doping), 페르미 준위와 캐리어 이동(드리프트와 확산) 및 PN 접합 공핍층의 양자물리적 거동을 학습합니다.",
    devicePhysicsOrModel: {
      deviceType: "PN 접합 다이오드 (PN Junction Diode)",
      operationPrinciples: "P형 영역의 정공과 N형 영역의 전자가 경계면에서 재결합하여 가동 전하가 고갈된 공핍층(Depletion Region)과 전위 장벽(내장 전위 V_bi)을 형성함.",
      equivalentCircuit: "순방향 시 0.7V 전압원 + 미소 순방향 저항 R_f, 역방향 시 거대한 역저항 R_r"
    },
    coreConcepts: [
      {
        titleKo: "에너지 밴드와 도핑 (N형 및 P형)",
        titleEn: "Energy Bands & Extrinsic Semiconductors",
        principle: "원자가띠와 전도띠 사이의 금지대(밴드갭 $E_g$) 크기에 따라 물질의 전기 전도성이 결정되며, 실리콘에 5가 원소(인 P, 비소 As)를 주입하면 도너 전자가, 3가 원소(붕소 B)를 주입하면 억셉터 정공이 생성된다.",
        equations: [
          {
            name: "질량 작용 법칙 (Mass-Action Law)",
            typesetMath: "n \\cdot p = n_i^2 \\quad (n_i = B T^{3/2} e^{-E_g / (2 k_B T)})",
            explanation: "열평형 상태에서 전자 농도 n과 정공 농도 p의 곱은 진성 캐리어 농도 n_i의 제곱으로 항상 일정"
          }
        ]
      },
      {
        titleKo: "캐리어 이동: 드리프트와 확산 전류",
        titleEn: "Carrier Transport: Drift & Diffusion",
        principle: "전기장에 의해 전하가 끌려가는 드리프트(Drift) 현상과, 농도 불균형에 의해 고농도에서 저농도로 퍼져나가는 확산(Diffusion) 현상이 반도체 전류를 형성한다.",
        equations: [
          {
            name: "총 전류 밀도 (Total Current Density)",
            typesetMath: "J = J_{\\text{drift}} + J_{\\text{diff}} = (q n \\mu_n + q p \\mu_p) E + q D_n \\frac{dn}{dx} - q D_p \\frac{dp}{dx}",
            explanation: "전기장 E에 의한 표동 전류와 농도 기울기에 의한 확산 전류의 결합"
          },
          {
            name: "아인슈타인 관계식 (Einstein Relation)",
            typesetMath: "\\frac{D_n}{\\mu_n} = \\frac{D_p}{\\mu_p} = \\frac{k_B T}{q} = V_T",
            explanation: "확산 계수 D와 이동도 mu 사이의 열전압 V_T (상온 약 26mV) 비례성"
          }
        ]
      },
      {
        titleKo: "PN 접합 내장 전위(Built-in Potential)",
        titleEn: "Built-in Potential of PN Junction",
        principle: "도핑된 양측의 캐리어 확산과 공핍층 이온들의 전계에 의한 드리프트가 평형을 이룰 때 자연 발생하는 전위 장벽 V_bi.",
        equations: [
          {
            name: "내장 전위 공식",
            typesetMath: "V_{\\text{bi}} = V_T \\ln\\left( \\frac{N_A N_D}{n_i^2} \\right)",
            explanation: "억셉터 도핑 N_A, 도너 도핑 N_D에 비례하여 형성되는 전위 장벽 (실리콘 기준 약 0.7V)"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "태양광 발전 패널(Solar Cell)과 광다이오드(Photodiode)",
        practicalContext: "PN 접합 공핍층에 밴드갭 에너지 이상의 빛(광자)이 입사하면 전자-정공 쌍(EHP)이 생성되고, 내장 전계에 의해 전자는 N층으로, 정공은 P층으로 분리되어 기전력을 생성함.",
        engineeringNote: "실리콘 반도체의 밴드갭은 1.12eV로 가시광선 영역의 태양광 흡수에 최적화되어 있음."
      }
    ],
    simulationRef: {
      id: "sim-semiconductor",
      type: "energy-band",
      title: "에너지 밴드 및 캐리어 확산 시뮬레이터",
      initialParams: { dopingNa: 1e16, dopingNd: 1e16, temperature: 300 },
      keyFormulas: ["Vbi = 0.026 * ln(Na*Nd / ni^2)", "W = sqrt(2*eps/q * (1/Na + 1/Nd) * Vbi)"]
    },
    summary: "반도체는 도핑과 에너지 밴드 조절을 통해 전류의 전도 특성을 극적으로 제어할 수 있는 물질이며, PN 접합은 모든 현대 전자 소자의 기초입니다."
  },
  {
    id: "el-02",
    order: 2,
    domain: "다이오드 및 정류 회로",
    titleKo: "다이오드 응용 회로: 정류기, 필터 및 제너 정전압",
    titleEn: "Diode Circuits: Rectifiers, Filters & Zener Regulation",
    file: "modules/02-diodes-rectifiers.json",
    overview: "쇼클리 다이오드 방정식, 순방향 도통과 역방향 항복 특성, 반파/전파/브리지 정류 회로, 평활 커패시터에 의한 리플 전압 계산, 제너 다이오드를 이용한 정전압 조절기 회로를 해석합니다.",
    devicePhysicsOrModel: {
      deviceType: "다이오드 정류기 및 제너 다이오드",
      operationPrinciples: "순방향 전압 인가 시 지수함수적으로 전류가 급증하고, 역방향 시 미소 포화전류 I_s만 흐르다가 항복 전압(V_z)에서 전압이 일정하게 유지되는 제너 항복 발생.",
      equivalentCircuit: "정전압 강하 모델: 0.7V 이상에서 단락 도통"
    },
    coreConcepts: [
      {
        titleKo: "쇼클리 다이오드 방정식",
        titleEn: "Shockley Diode Equation",
        principle: "다이오드 전류는 양단 전압에 대해 순방향 바이어스에서 지수함수적으로 폭증하고, 역방향에서는 극미한 역방향 포화전류 I_s로 포화된다.",
        equations: [
          {
            name: "쇼클리 방정식 (Shockley Equation)",
            typesetMath: "I_D = I_S \\left( e^{\\frac{V_D}{n V_T}} - 1 \\right)",
            explanation: "역방향 포화전류 I_s, 이상계수 n(1~2), 열전압 V_T = 26mV"
          }
        ]
      },
      {
        titleKo: "전파 브리지 정류 회로와 평활 리플 전압",
        titleEn: "Full-Wave Bridge Rectifier & Ripple Voltage",
        principle: "4개의 다이오드를 브리지 구조로 배치하면 교류의 양의 반주기와 음의 반주기 모두 부하에 동일한 방향의 전류를 공급하며, 병렬 평활 커패시터 C가 맥류를 직류로 평활화한다.",
        equations: [
          {
            name: "피크 전압 (Bridge Rectifier Peak)",
            typesetMath: "V_{\\text{peak}} = V_m - 2 V_D \\approx V_m - 1.4\\text{ V}",
            explanation: "도통 경로에 항상 2개의 다이오드가 직렬 연결됨"
          },
          {
            name: "피크-투-피크 리플 전압 (Ripple Voltage)",
            typesetMath: "V_r = \\frac{I_L}{2 f C} = \\frac{V_{\\text{peak}}}{2 f R_L C}",
            explanation: "전파 정류 시 리플 주파수는 2배(120Hz)가 되어 평활화가 용이함"
          }
        ]
      },
      {
        titleKo: "제너 다이오드 정전압 원리 (Zener Regulation)",
        titleEn: "Zener Diode Voltage Regulation",
        principle: "역방향 항복 영역(양자 터널링 및 애벌랜치 항복)에서 전류가 크게 변해도 양단 전압이 거의 제너 전압 V_Z로 일정하게 유지되는 특성을 이용해 직류 전압을 안정화한다.",
        equations: [
          {
            name: "제너 제한 저항 설계",
            typesetMath: "R_S = \\frac{V_{\\text{in}} - V_Z}{I_Z + I_L}",
            explanation: "입력 전압 변동 시 제너 다이오드의 과열 파손 방지 저항"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "스마트폰 충전기(AC-DC 아답터)의 1차 정류단",
        practicalContext: "벽면 220V 교류를 다이오드 브리지로 즉시 311V 맥류 직류로 변환하고, 400V 전해 커패시터로 평활화한 후 고주파 스위칭 전원(SMPS)의 입력으로 공급함.",
        engineeringNote: "입력 전원 역삽입 방지(Reverse Polarity Protection)를 위해 DC 입력단에 직렬 쇼트키 다이오드(낮은 전압강하 0.3V)를 배치함."
      }
    ],
    simulationRef: {
      id: "sim-diode-rectifier",
      type: "rectifier",
      title: "다이오드 전파 브리지 정류 및 평활 시뮬레이터",
      initialParams: { Vin_rms: 24, frequency: 60, C: 0.001, RL: 100 },
      keyFormulas: ["Vpeak = sqrt(2)*Vin_rms - 1.4", "Vripple = Vpeak / (2*f*RL*C)"]
    },
    summary: "다이오드는 단방향 전류 통과(정류) 특성을 가지며, 정류 회로, 리플 필터, 제너 전압 조절기를 통해 모든 전자기기의 안정된 직류 전원을 만듭니다."
  },
  {
    id: "el-03",
    order: 3,
    domain: "아날로그 증폭 및 트랜지스터",
    titleKo: "BJT 트랜지스터 증폭기 및 직류 부하선 해석",
    titleEn: "BJT Transistors, Amplifiers & DC Load Line",
    file: "modules/03-bjt-amplifiers.json",
    overview: "양극성 접합 트랜지스터(BJT)의 NPN/PNP 구조, 활성/포화/차단 영역의 동작 원리, 공통 이미터(CE) 전압 증폭기 설계, 전압분배 바이어스 안정화 및 직류 부하선(DC Load Line)과 동작점(Q-point)을 학습합니다.",
    devicePhysicsOrModel: {
      deviceType: "BJT (Bipolar Junction Transistor)",
      operationPrinciples: "베이스의 미세한 전류 I_B로 컬렉터-이미터 간의 대전류 I_C = beta * I_B를 제어하는 전류 제어형 전류원(CCCS).",
      equivalentCircuit: "소신호 하이브리드-파이 모델: 베이스 r_pi 저항과 제어 전류원 gm * v_be"
    },
    coreConcepts: [
      {
        titleKo: "BJT의 3대 동작 영역",
        titleEn: "Three Operation Regions of BJT",
        principle: "베이스-이미터(BE) 접합과 베이스-컬렉터(BC) 접합의 바이어스 상태에 따라 차단(Off), 활성(증폭), 포화(스위치 On) 영역으로 구분된다.",
        equations: [
          {
            name: "활성 영역 전류 증폭식",
            typesetMath: "I_C = \\beta I_B = h_{FE} I_B, \\quad I_E = I_B + I_C = (\\beta + 1) I_B",
            explanation: "전류 증폭률 beta(통상 100~300)에 의한 선형 전류 증폭"
          },
          {
            name: "베이스-이미터 도통 전압",
            typesetMath: "V_{BE} \\approx 0.7\\text{ V} \\quad (\\text{실리콘 NPN 기준 활성/포화 모드})",
            explanation: "순방향 바이어스된 PN 다이오드 전압 강하"
          }
        ]
      },
      {
        titleKo: "직류 부하선과 동작점(Q-point)",
        titleEn: "DC Load Line & Operating Point (Q-point)",
        principle: "출력 루프의 KVL 방정식 $V_{CE} = V_{CC} - I_C R_C$는 $I_C - V_{CE}$ 평면 상의 직선이며, 트랜지스터의 베이스 전류 특성 곡선과 만나는 교점이 동작점(Q-point)이다.",
        equations: [
          {
            name: "직류 부하선 방정식",
            typesetMath: "I_C = -\\frac{1}{R_C} V_{CE} + \\frac{V_{CC}}{R_C}",
            explanation: "V_CE = 0일 때 최대 포화 전류 V_CC/R_C, I_C = 0일 때 차단 전압 V_CC"
          },
          {
            name: "최적 Q-point 조건",
            typesetMath: "V_{CEQ} \\approx \\frac{V_{CC}}{2}",
            explanation: "신호가 위아래로 대칭적으로 최대 스윙할 수 있어 클리핑 왜곡 방지"
          }
        ]
      },
      {
        titleKo: "공통 이미터(CE) 소신호 전압 이득",
        titleEn: "Common-Emitter Small-Signal Voltage Gain",
        principle: "베이스 입력 전압 v_in의 미세한 변화는 트랜스컨덕턴스 $g_m$을 통해 컬렉터 전류 $i_c$의 변화로 변환되고, 컬렉터 저항 $R_C$에 의해 역위상으로 크게 증폭된 전압 $v_{out}$으로 출력된다.",
        equations: [
          {
            name: "트랜스컨덕턴스 (Transconductance)",
            typesetMath: "g_m = \\frac{I_{CQ}}{V_T} = \\frac{I_{CQ}}{26\\text{ mV}}",
            explanation: "동작점 컬렉터 전류에 비례하는 소신호 전도도"
          },
          {
            name: "소신호 전압 이득 (Voltage Gain)",
            typesetMath: "A_v = \\frac{v_{\\text{out}}}{v_{\\text{in}}} = -g_m (R_C \\parallel R_L)",
            explanation: "마이너스 부호는 입력과 출력 간의 180도 위상 반전을 의미함"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "마이크로폰 음성 신호 전치증폭기(Preamplifier)",
        practicalContext: "마이크에서 나오는 수 밀리볼트(mV)의 미세한 음성 교류 신호를 BJT CE 증폭기를 통해 수 볼트(V)의 라인 레벨로 증폭하여 파워 앰프로 전달함.",
        engineeringNote: "온도 변화에 따른 beta 변동으로 Q점이 틀어지는 현상을 방지하기 위해 이미터 저항 R_E와 바이패스 커패시터 C_E를 함께 사용함."
      }
    ],
    simulationRef: {
      id: "sim-transistor-curves",
      type: "transistor-curves",
      title: "BJT/MOSFET 트랜지스터 특성 곡선 & 부하선 시뮬레이터",
      initialParams: { Vcc: 12, Rc: 1000, beta: 150, Ib_uA: 40 },
      keyFormulas: ["Ic = beta * Ib", "Vce = Vcc - Ic * Rc", "Av = -Ic * Rc / 0.026"]
    },
    summary: "BJT는 작은 베이스 전류로 큰 컬렉터 전류를 제어하는 핵심 능동 소자이며, 부하선 중앙에 Q점을 설정하여 왜곡 없는 선형 신호 증폭을 수행합니다."
  },
  {
    id: "el-04",
    order: 4,
    domain: "전계효과 트랜지스터 및 집적회로",
    titleKo: "MOSFET 소자 원리 및 디지털 CMOS 기술",
    titleEn: "MOSFET Circuits, Scaling & CMOS Technology",
    file: "modules/04-mosfet-circuits.json",
    overview: "금속 산화막 반도체 전계효과 트랜지스터(MOSFET)의 물리 구조, 문턱전압(V_th), 트라이오드/포화 영역의 V-I 특성식, 초저전력 디지털 집적회로의 기저인 CMOS 인버터 동작을 학습합니다.",
    devicePhysicsOrModel: {
      deviceType: "MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor)",
      operationPrinciples: "게이트 산화막(절연체)에 걸리는 전계(Electric Field)로 소스와 드레인 사이의 전도 채널 전하 밀도를 제어하는 전압 제어형 전류원(VCCS). 게이트 전류 I_G = 0 (입력 저항 무한대).",
      equivalentCircuit: "포화 영역: id = gm * vgs + vds/ro"
    },
    coreConcepts: [
      {
        titleKo: "MOSFET의 문턱전압과 채널 형성",
        titleEn: "Threshold Voltage & Inversion Channel",
        principle: "게이트-소스 전압 V_GS가 문턱전압 V_th 이상으로 인가되면 산화막 아래 기판 표면에 강한 반전층(Inversion Layer) 채널이 형성되어 드레인-소스 간 전류 경로가 열린다.",
        equations: [
          {
            name: "오버드라이브 전압 (Overdrive Voltage)",
            typesetMath: "V_{OV} = V_{GS} - V_{th} > 0",
            explanation: "채널이 형성되기 위한 필수 전압 조건"
          }
        ]
      },
      {
        titleKo: "트라이오드(선형) 및 포화(핀치오프) 영역 전류식",
        titleEn: "Triode and Saturation (Pinch-off) Equations",
        principle: "드레인 전압 V_DS가 낮을 때는 저항처럼 동작하다가(트라이오드), V_DS >= V_OV에 도달하면 드레인 부근 채널이 꼬집히는 핀치오프(Pinch-off)가 발생하여 전류가 V_DS에 무관하게 포화된다.",
        equations: [
          {
            name: "트라이오드 영역 (V_DS < V_GS - V_th)",
            typesetMath: "I_D = \\mu_n C_{ox} \\frac{W}{L} \\left[ (V_{GS} - V_{th})V_{DS} - \\frac{1}{2}V_{DS}^2 \\right]",
            explanation: "가변 저항 영역으로 동작"
          },
          {
            name: "포화 영역 (Saturation, V_DS >= V_GS - V_th)",
            typesetMath: "I_D = \\frac{1}{2} \\mu_n C_{ox} \\frac{W}{L} (V_{GS} - V_{th})^2 (1 + \\lambda V_{DS})",
            explanation: "신호 증폭용 정전류원으로 동작 (lambda는 채널길이 변조 계수)"
          }
        ]
      },
      {
        titleKo: "CMOS 인버터와 정적 무전력 소비",
        titleEn: "CMOS Inverter and Static Zero-Power",
        principle: "상보형(Complementary) 구조로 PMOS 풀업과 NMOS 풀다운 트랜지스터를 직렬 연결하면, 입력이 High(1)일 땐 NMOS만 켜지고 입력이 Low(0)일 땐 PMOS만 켜지므로 정상 상태에서 전원과 접지 사이에 전류 경로가 없어 정적 소비 전력이 0에 수렴한다.",
        equations: [
          {
            name: "CMOS 동적 전력 소모 (Dynamic Power)",
            typesetMath: "P_{\\text{dynamic}} = C_L V_{DD}^2 f",
            explanation: "오직 스위칭이 일어나는 순간에만 부하 커패시터 충방전 전력 소모"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "초미세 공정 CPU, GPU 및 고전력 스위칭 MOSFET",
        practicalContext: "현대 컴퓨터 프로세서는 수백억 개의 나노 스케일 FinFET/GAA CMOS 트랜지스터로 구성되며, 전력 전자에서는 수십 암페어를 손실 없이 켜고 끄는 파워 MOSFET이 사용됨.",
        engineeringNote: "정전기 방전(ESD)에 의해 게이트 산화막이 쉽게 파괴되므로 조립 및 취급 시 정전기 방지 손목 밴드와 보호 다이오드가 필수적임."
      }
    ],
    simulationRef: {
      id: "sim-transistor-curves",
      type: "transistor-curves",
      title: "BJT/MOSFET 트랜지스터 특성 곡선 & 부하선 시뮬레이터",
      initialParams: { Vth: 2.0, k: 0.001, Vgs: 4.0, Vdd: 12.0, Rd: 1000 },
      keyFormulas: ["Id_sat = 0.5 * k * (Vgs - Vth)^2", "Vds = Vdd - Id * Rd"]
    },
    summary: "MOSFET은 게이트 전류가 흐르지 않는 전압 제어 소자로 집적도가 극도로 높으며, 상보형 CMOS 기술을 통해 오늘날 디지털 정보화 혁명을 이끌고 있습니다."
  },
  {
    id: "el-05",
    order: 5,
    domain: "아날로그 연산 및 신호 처리",
    titleKo: "OP-Amp 연산증폭기 및 아날로그 회로 해석",
    titleEn: "Operational Amplifiers (OP-Amp) & Analog Computation",
    file: "modules/05-opamp-circuits.json",
    overview: "연산증폭기(OP-Amp)의 2대 황금률(가상 단락, 가상 접지), 반전 및 비반전 증폭기, 버퍼, 가산기, 차동 증폭기, 아날로그 신호 미적분을 수행하는 적분기/미분기 회로를 체계적으로 해석합니다.",
    devicePhysicsOrModel: {
      deviceType: "이상적 연산증폭기 (Ideal OP-Amp)",
      operationPrinciples: "개방 루프 이득 A_OL = 무한대, 입력 임피던스 R_in = 무한대, 출력 임피던스 R_out = 0, 대역폭 BW = 무한대.",
      equivalentCircuit: "출력 전압 V_out = A_OL * (V_+ - V_-)에 부귀환(Negative Feedback)을 걸어 안정화"
    },
    coreConcepts: [
      {
        titleKo: "OP-Amp의 2대 황금률 (Golden Rules)",
        titleEn: "Two Golden Rules of Ideal OP-Amp",
        principle: "부귀환(Negative Feedback)이 걸린 이상적 OP-Amp는 출력 전압이 포화되지 않는 한 1) 두 입력 단자로 들어가는 전류는 0이고(i_+ = i_- = 0), 2) 두 입력 단자의 전위는 가상으로 완전히 같아진다(V_+ = V_-, 가상 단락).",
        equations: [
          {
            name: "가상 단락 (Virtual Short)",
            typesetMath: "V_+ \\approx V_- \\quad \\left(\\lim_{A_{OL} \\to \\infty} \\frac{V_{\\text{out}}}{A_{OL}} = 0\\right)",
            explanation: "무한한 차동 증폭도에 의해 반전 단자와 비반전 단자 전위 일치"
          },
          {
            name: "입력 전류 0 (Infinite Input Impedance)",
            typesetMath: "I_+ = I_- = 0",
            explanation: "신호원으로부터 어떠한 전류도 끌어오지 않아 로딩 효과 제거"
          }
        ]
      },
      {
        titleKo: "반전 및 비반전 증폭기 (Inverting & Non-Inverting)",
        titleEn: "Inverting and Non-Inverting Amplifiers",
        principle: "외장 저항 R1, R2의 비율만으로 회로의 전압 증폭률을 절대적으로 정밀하게 결정할 수 있다.",
        equations: [
          {
            name: "반전 증폭기 이득 (Inverting Gain)",
            typesetMath: "\\frac{V_{\\text{out}}}{V_{\\text{in}}} = -\\frac{R_f}{R_{\\text{in}}}",
            explanation: "비반전 단자가 접지(0V)되어 반전 단자가 가상 접지(Virtual Ground) 형성"
          },
          {
            name: "비반전 증폭기 이득 (Non-Inverting Gain)",
            typesetMath: "\\frac{V_{\\text{out}}}{V_{\\text{in}}} = 1 + \\frac{R_f}{R_1}",
            explanation: "입력과 출력의 위상이 같고 이득은 항상 1 이상"
          },
          {
            name: "전압 팔로워 (버퍼, Voltage Follower)",
            typesetMath: "V_{\\text{out}} = V_{\\text{in}} \\quad (R_f = 0, R_1 = \\infty, A_v = 1)",
            explanation: "임피던스 변환기로 고저항 센서 출력을 저저항 부하로 완충"
          }
        ]
      },
      {
        titleKo: "아날로그 연산 회로: 가산기 및 적분기",
        titleEn: "Analog Computing: Summing Amplifier & Integrator",
        principle: "키르히호프의 전류 법칙과 커패시터의 V-I 관계를 결합하여 전압의 덧셈, 뺄셈, 수학적 시간 적분 연산을 아날로그 회로로 직접 수행한다.",
        equations: [
          {
            name: "가산기 (Summing Amplifier)",
            typesetMath: "V_{\\text{out}} = -\\left( \\frac{R_f}{R_1}V_1 + \\frac{R_f}{R_2}V_2 + \\dots \\right)",
            explanation: "다중 아날로그 신호의 가중합"
          },
          {
            name: "이상적 적분기 (Ideal Integrator)",
            typesetMath: "V_{\\text{out}}(t) = -\\frac{1}{R C} \\int_0^t V_{\\text{in}}(\\tau) \\, d\\tau + V_{\\text{out}}(0)",
            explanation: "사각파 입력을 삼각파로 변환하는 아날로그 연산"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "의료용 생체 신호(ECG 심전도, EEG 뇌파) 계측 증폭기",
        practicalContext: "인체 피부에서 나오는 마이크로볼트(uV) 수준의 심전도 신호는 60Hz 전원선 노이즈에 둘러싸여 있으므로, 높은 공통모드 제거비(CMRR)를 갖는 3개 OP-Amp 계측 증폭기(In-Amp)로 노이즈만 제거하고 생체 신호만 증폭함.",
        engineeringNote: "실제 OP-Amp는 유한한 슬루율(Slew Rate, V/us)을 가지므로 신호 주파수가 높을 때 정현파가 삼각파로 왜곡될 수 있음."
      }
    ],
    simulationRef: {
      id: "sim-opamp-bode",
      type: "opamp-bode",
      title: "OP-Amp 및 능동필터 Bode Plot 시뮬레이터",
      initialParams: { R1: 10000, Rf: 100000, type: "inverting" },
      keyFormulas: ["Av = -Rf / R1", "Gain_dB = 20 * log10(abs(Av))"]
    },
    summary: "OP-Amp는 부귀환을 통해 능동 소자의 비선형성을 완전히 억제하고 정밀한 수학적 연산과 신호 증폭을 수행하는 아날로그 회로 설계의 핵심 블록입니다."
  },
  {
    id: "el-06",
    order: 6,
    domain: "능동 필터 및 발진기",
    titleKo: "능동 필터, 보드 선도(Bode Plot) 및 신호 발진기",
    titleEn: "Active Filters, Bode Plots & Signal Generators",
    file: "modules/06-active-filters-oscillators.json",
    overview: "OP-Amp와 R, C를 결합한 능동 저역통과(LPF)/고역통과(HPF)/대역통과(BPF) 필터, 주파수 응답을 크기(dB)와 위상으로 나타내는 보드 선도(Bode Plot), 555 타이머 펄스 발생기 및 빈 브리지 발진기를 다룹니다.",
    devicePhysicsOrModel: {
      deviceType: "능동 필터 및 555 타이머 발진기",
      operationPrinciples: "주파수에 따라 변하는 복소 전달함수 H(s)를 이용한 주파수 선택성 증폭, 바크하우젠 발진 조건(루프 이득 1, 위상 360도)을 이용한 지속 발진.",
      equivalentCircuit: "전달함수 H(j*omega) = Gain(omega) * e^(j*phi(omega))"
    },
    coreConcepts: [
      {
        titleKo: "1차 및 2차 능동 저역통과 필터(LPF)",
        titleEn: "Active Low-Pass Filters (LPF) & Sallen-Key",
        principle: "인덕터 없이 저항과 커패시터만으로 차단 주파수 이상의 고주파 잡음을 감쇠시키며, 2차 Sallen-Key 구조는 차단 주파수 이후 -40dB/decade의 가파른 감쇠율을 갖는다.",
        equations: [
          {
            name: "차단 주파수 (Cutoff Frequency, -3dB)",
            typesetMath: "f_c = \\frac{1}{2\\pi R C}",
            explanation: "출력 전력이 절반(전압은 0.707배, -3dB)으로 떨어지는 임계 주파수"
          },
          {
            name: "1차 LPF 전달함수",
            typesetMath: "H(s) = \\frac{V_{\\text{out}}(s)}{V_{\\text{in}}(s)} = \\frac{A_0}{1 + s R C} = \\frac{A_0}{1 + j\\frac{\\omega}{\\omega_c}}",
            explanation: "차단 주파수 이후 주파수가 10배 증가할 때마다 전압 이득이 20dB씩 감쇠"
          }
        ]
      },
      {
        titleKo: "보드 선도 (Bode Plot) 해석법",
        titleEn: "Bode Plot Magnitude & Phase Response",
        principle: "가로축을 로그 주파수로, 세로축을 데시벨 크기($20\\log_{10}|H(j\\omega)|$)와 위상각($\\angle H(j\\omega)$)으로 분리하여 광범위한 주파수 대역의 시스템 안정성과 필터링 특성을 시각화한다.",
        equations: [
          {
            name: "데시벨 전압 이득 (Decibels)",
            typesetMath: "\\text{Gain [dB]} = 20 \\log_{10} |H(j\\omega)|",
            explanation: "이득 1 = 0dB, 이득 10 = 20dB, 이득 100 = 40dB, 이득 0.707 = -3dB"
          }
        ]
      },
      {
        titleKo: "555 타이머 비안정 멀티바이브레이터 (Astable Mode)",
        titleEn: "555 Timer Oscillator",
        principle: "2개의 비교기(Comparator), 1개의 SR 플립플롭, 방전 트랜지스터를 내장하여 외부 커패시터 C가 1/3 Vcc에서 2/3 Vcc 사이를 충방전하며 지속적인 구형파(Square wave)를 발생시킨다.",
        equations: [
          {
            name: "555 타이머 발진 주파수",
            typesetMath: "f = \\frac{1.44}{(R_A + 2 R_B) C}",
            explanation: "저항 R_A, R_B와 커패시터 C에 의해 결정되는 정밀 클럭 주파수"
          },
          {
            name: "듀티 사이클 (Duty Cycle)",
            typesetMath: "D = \\frac{t_{\\text{high}}}{T} = \\frac{R_A + R_B}{R_A + 2 R_B}",
            explanation: "한 주기 중 전압이 High로 유지되는 시간의 비율"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "오디오 안티에일리어싱(Anti-Aliasing) 필터 및 PWM 클록원",
        practicalContext: "아날로그 음성을 디지털 ADC로 변환하기 전 나이퀴스트 주파수(f_s/2) 이상의 고주파 성분이 저주파 잡음으로 왜곡되는 현상을 방지하기 위해 4차 Butterworth 능동 LPF를 거침.",
        engineeringNote: "555 타이머는 모터 속도 조절용 PWM 신호 발생기, LED 깜빡이, 마이크로컨트롤러 클록 소스로 널리 쓰임."
      }
    ],
    simulationRef: {
      id: "sim-timer555",
      type: "timer555",
      title: "555 타이머 펄스 발생기 시뮬레이터",
      initialParams: { Ra: 10000, Rb: 10000, C: 0.000001 },
      keyFormulas: ["Thigh = 0.693 * (Ra + Rb) * C", "Tlow = 0.693 * Rb * C", "f = 1.44 / ((Ra + 2*Rb)*C)"]
    },
    summary: "능동 필터는 원하는 대역의 주파수 성분만 선택하고 잡음을 차단하며, 555 타이머와 발진기는 디지털 및 통신 시스템의 심장 박동인 클록 펄스를 만듭니다."
  },
  {
    id: "el-07",
    order: 7,
    domain: "디지털 논리 회로",
    titleKo: "디지털 논리 게이트, 카르노 맵 및 플립플롭",
    titleEn: "Digital Logic Gates, Karnaugh Maps & Flip-Flops",
    file: "modules/07-digital-logic.json",
    overview: "불 대수 법칙, 기본 논리 게이트(AND, OR, NOT, NAND, NOR, XOR), 회로 최소화 기법인 카르노 맵(Karnaugh Map), 조합 논리 회로(가산기, MUX)와 메모리의 원형인 순차 회로(플립플롭, 카운터)를 구축합니다.",
    devicePhysicsOrModel: {
      deviceType: "디지털 논리 게이트 및 플립플롭",
      operationPrinciples: "0V(Low, False)와 5V/3.3V(High, True)의 2진 전압 레벨로 불 대수 논리 연산을 물리적으로 구현함.",
      equivalentCircuit: "TTL/CMOS 게이트 어레이"
    },
    coreConcepts: [
      {
        titleKo: "불 대수와 드 모르간의 법칙",
        titleEn: "Boolean Algebra & De Morgan's Laws",
        principle: "논리곱(AND), 논리합(OR), 논리부정(NOT)의 3대 기본 연산자로 모든 디지털 연산이 가능하며, 드 모르간의 법칙은 NAND와 NOR 게이트만으로 모든 회로를 구현(Universal Gate)할 수 있음을 증명한다.",
        equations: [
          {
            name: "드 모르간의 법칙 (De Morgan's Laws)",
            typesetMath: "\\overline{A \\cdot B} = \\overline{A} + \\overline{B}, \\quad \\overline{A + B} = \\overline{A} \\cdot \\overline{B}",
            explanation: "곱의 부정은 부정의 합이고, 합의 부정은 부정의 곱임"
          },
          {
            name: "배타적 논리합 (XOR)",
            typesetMath: "A \\oplus B = A \\overline{B} + \\overline{A} B",
            explanation: "두 입력이 서로 다를 때만 1이 출력되는 덧셈의 기초 연산자"
          }
        ]
      },
      {
        titleKo: "조합 논리: 반가산기 및 전가산기",
        titleEn: "Combinational Logic: Adders",
        principle: "2진수의 덧셈에서 합(Sum)은 XOR 게이트로 계산되고, 자리올림수(Carry)는 AND 게이트로 계산된다.",
        equations: [
          {
            name: "반가산기 (Half Adder)",
            typesetMath: "S = A \\oplus B, \\quad C = A \\cdot B",
            explanation: "하위 자리올림이 없는 2비트 덧셈기"
          },
          {
            name: "전가산기 (Full Adder)",
            typesetMath: "S = A \\oplus B \\oplus C_{\\text{in}}, \\quad C_{\\text{out}} = A B + C_{\\text{in}}(A \\oplus B)",
            explanation: "하위 자리올림 C_in을 포함하여 연쇄 연결로 다비트 가산기 구축"
          }
        ]
      },
      {
        titleKo: "순차 논리: D 플립플롭과 1비트 메모리",
        titleEn: "Sequential Logic: D Flip-Flop & Memory",
        principle: "현재 입력뿐만 아니라 과거의 상태를 기억하는 회로로, 클럭 신호의 상승 에지(Rising Edge) 순간에만 입력 D의 상태를 출력 Q로 캡처하여 저장한다.",
        equations: [
          {
            name: "D 플립플롭 특성식",
            typesetMath: "Q_{n+1} = D \\quad (\\text{At Clock Rising Edge})",
            explanation: "클럭에 동기화되어 1비트의 디지털 정보를 안정적으로 래치(저장)"
          },
          {
            name: "2분주 카운터 (Toggled Flip-Flop)",
            typesetMath: "D = \\overline{Q} \\implies f_{\\text{out}} = \\frac{f_{\\text{clock}}}{2}",
            explanation: "출력 반전을 입력으로 되먹여 클록 주파수를 절반으로 낮추는 2진 카운터"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "컴퓨터 산술논리연산장치(ALU) 및 레지스터 파일",
        practicalContext: "CPU의 ALU는 전가산기와 MUX의 조합으로 64비트 사칙연산과 비트 연산을 1클록(약 0.2나노초)에 수행하며, D 플립플롭 어레이가 초고속 캐시 레지스터를 형성함.",
        engineeringNote: "글리치(Glitch, 일시적 오류 펄스)와 레이스 컨디션을 방지하기 위해 모든 순차 회로는 단일 시스템 마스터 클록에 철저히 동기화(Synchronous Design)함."
      }
    ],
    simulationRef: {
      id: "sim-logic-circuit",
      type: "logic-sim",
      title: "LogicSim 디지털 논리 회로 시뮬레이터",
      initialParams: { gateType: "XOR", inA: 1, inB: 0 },
      keyFormulas: ["Out = A ^ B", "Carry = A & B"]
    },
    summary: "불 대수와 논리 게이트는 조합 논리를 형성하고, 플립플롭은 상태를 저장하는 순차 논리를 형성하여 현대 컴퓨터 프로세서의 모든 연산과 메모리를 구현합니다."
  },
  {
    id: "el-08",
    order: 8,
    domain: "임베디드 시스템 및 실전 인터페이스",
    titleKo: "임베디드 인터페이싱: ADC, 통신(UART/I2C/SPI) 및 PCB 설계",
    titleEn: "Embedded Systems: ADC, Protocols & PCB Layout",
    file: "modules/08-embedded-interfacing.json",
    overview: "아날로그 세계와 마이크로컨트롤러를 잇는 아날로그-디지털 변환(ADC), 필수 통신 프로토콜(UART, I2C, SPI), 센서 인터페이싱 및 노이즈 없는 실전 PCB 레이아웃(디커플링 커패시터, 접지면)의 실무 엔지니어링을 완성합니다.",
    devicePhysicsOrModel: {
      deviceType: "마이크로컨트롤러 인터페이스 (MCU Peripherals)",
      operationPrinciples: "SAR ADC의 연속 근사 레지스터, 오픈 드레인 풀업 I2C 통신, 전이중 SPI 동기 통신.",
      equivalentCircuit: "GPIO 입력/출력 버퍼 및 기생 인덕턴스/커패시턴스 모델"
    },
    coreConcepts: [
      {
        titleKo: "아날로그-디지털 변환 (ADC): 표본화와 양자화",
        titleEn: "Analog-to-Digital Conversion (ADC)",
        principle: "연속적인 아날로그 신호를 시간축에서 샘플링하고(나이퀴스트 표본화 정리: $f_s > 2 f_{\\max}$), 전압축에서 n비트의 2진수 값으로 양자화(Quantization)한다.",
        equations: [
          {
            name: "ADC 전압 분해능 (Resolution)",
            typesetMath: "\\Delta V = \\frac{V_{\\text{ref}}}{2^n}, \\quad \\text{Digital Output} = \\left\\lfloor \\frac{V_{\\text{in}}}{V_{\\text{ref}}} \\times (2^n - 1) \\right\\rfloor",
            explanation: "10비트 ADC (5V 기준)의 최소 분해 전압은 5V / 1024 = 4.88mV"
          },
          {
            name: "신호 대 양자화 잡음비 (SQNR)",
            typesetMath: "\\text{SQNR} = 6.02 \\times n + 1.76 \\; [\\text{dB}]",
            explanation: "분해능 1비트 증가할 때마다 신호 품질 약 6dB 개선"
          }
        ]
      },
      {
        titleKo: "3대 임베디드 통신 프로토콜 비교 (UART, I2C, SPI)",
        titleEn: "Embedded Serial Protocols: UART, I2C, SPI",
        principle: "센서 및 칩셋 간 데이터 교환 방식: UART(비동기 2선식 점대점), I2C(동기 2선식 멀티마스터/멀티슬레이브), SPI(동기 4선식 고속 전이중).",
        equations: [
          {
            name: "I2C 오픈 드레인 풀업 저항값 계산",
            typesetMath: "R_{\\text{pull-up}} \\le \\frac{t_r}{0.8473 \\times C_{\\text{bus}}}",
            explanation: "신호 상승 시간 t_r(통상 1000ns)과 버스 기생 커패시턴스를 만족하는 풀업 저항(통상 4.7kΩ)"
          },
          {
            name: "SPI 최대 전송 속도",
            typesetMath: "\\text{Data Rate} = f_{\\text{SCK}} \\; [\\text{bps}] \\quad (\\text{최대 수십 MHz 고속 통신})",
            explanation: "클록 선(SCK)에 동기화된 마스터-슬레이브 전이중 전송"
          }
        ]
      },
      {
        titleKo: "실전 PCB 설계 원칙: 디커플링과 접지 루프 방지",
        titleEn: "PCB Layout: Decoupling Capacitors & Ground Planes",
        principle: "디지털 IC가 스위칭할 때 순간적으로 발생하는 전원선 전압 강하(디지털 노이즈)를 억제하기 위해 IC 전원 핀 바로 옆에 0.1uF 세라믹 디커플링 커패시터를 배치해야 하며, 넓은 접지면(Ground Plane)을 깔아 인덕턴스를 최소화한다.",
        equations: [
          {
            name: "전원선 인덕턴스 전압 바운스",
            typesetMath: "V_{\\text{noise}} = L_{\\text{trace}} \\frac{di}{dt}",
            explanation: "수 나노초 동안 수백 mA 스위칭 시 배선 인덕턴스에 의해 발생하는 글리치"
          }
        ]
      }
    ],
    practicalApplications: [
      {
        title: "온습도 센서(I2C) 및 OLED 디스플레이(SPI) 연동 아두이노 장치",
        practicalContext: "SHT31 온습도 센서에서 I2C 2가닥 선(SDA, SCL)으로 측정값을 읽어와, SPI 고속 4가닥 선(MOSI, SCK, CS, DC)으로 128x64 그래픽 OLED 화면에 초당 30프레임으로 렌더링함.",
        engineeringNote: "아날로그 센서 배선은 디지털 고주파 클록 라인과 교차하지 않도록 차폐(Shielding)하며 스타 접지(Star Ground)를 적용함."
      }
    ],
    simulationRef: {
      id: "sim-embedded-comm",
      type: "protocol-timing",
      title: "UART/I2C/SPI 직렬 통신 타이밍 시뮬레이터",
      initialParams: { protocol: "I2C", baudRate: 100000, dataByte: 0xA5 },
      keyFormulas: ["Bit_period = 1 / baudRate", "I2C_Ack = Low at 9th clock"]
    },
    summary: "임베디드 엔지니어링은 ADC로 아날로그 신호를 수집하고 표준 시리얼 통신으로 센서와 IC를 연결하며, 저노이즈 PCB 레이아웃을 통해 견고한 상용 하드웨어를 완성합니다."
  }
];

// Write individual modules
for (const m of elModules) {
  const filePath = path.join(modulesDir, `${path.basename(m.file)}`);
  fs.writeFileSync(filePath, JSON.stringify(m, null, 2), 'utf8');
  console.log(`Generated Electronics module: ${path.basename(m.file)}`);
}

// Write manifest
const manifest = {
  title: "전자공학 마스터 커리큘럼 (Electronic Engineering Curriculum)",
  description: "반도체 물성 기초부터 다이오드 정류, BJT/MOSFET 증폭기, OP-Amp 아날로그 연산, 능동필터, 디지털 논리회로, 임베디드 통신 및 PCB 설계까지 8단계 정밀 학습",
  totalModules: elModules.length,
  modules: elModules.map(m => ({
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
console.log(`\n🎉 Successfully generated Electronics manifest and all ${elModules.length} module files.\n`);
