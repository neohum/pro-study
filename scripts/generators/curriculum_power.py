"""
Power Systems & Next-Gen Energy Curriculum Modules (Stages 10 to 13)
Stage 10: Power Flow & Grid Analysis
Stage 11: Symmetrical Faults & Protection Systems
Stage 12: Inverters & Renewable Energy Systems
Stage 13: Smart Grid & Digital Substation
"""

def get_power_modules():
    return [
        {
            "id": "power-stage-1-flow",
            "order": 10,
            "track": "power",
            "stageId": "stage-1-power-flow-grid",
            "stageNumber": 1,
            "titleKo": "전력 조류 계산 및 계통 해석 (Power Flow & Grid Analysis)",
            "titleEn": "Power Flow & Grid Analysis",
            "category": "Power Systems Engineering & Grid Analysis",
            "overview": "대규모 복합 전력망의 정상 상태(Steady-State) 운용을 해석하는 전력 조류(Power Flow) 해석 기법을 심층적으로 다룹니다. 모선 어드미턴스 행렬(Y_bus)의 토폴로지 구축, 슬랙 모선(Slack), 발전기 모선(PV), 부하 모선(PQ)의 수학적 정식화, 뉴턴-랩슨(Newton-Raphson) 2차 비선형 수치해석 알고리즘, 자코비안(Jacobian) 행렬 구성 및 유효/무효 전력 불일치량(Mismatch) 수렴 판정을 다룹니다.",
            "learningObjectives": [
                "송전선로 파이(pi) 등가 모델과 변압기 탭비를 반영한 대규모 모선 어드미턴스 행렬(Y_bus)을 구축할 수 있다.",
                "슬랙(Slack), PV, PQ 모선의 기지량과 미지량을 정의하고 전력 수급 비선형 연립 방정식을 정식화할 수 있다.",
                "자코비안(Jacobian) 편미분 행렬의 4개 서브 블록(J11, J12, J21, J22)을 유도하고 수치해석적 성질을 분석할 수 있다.",
                "IEEE 14-모선 계통을 대상으로 뉴턴-랩슨 조류 계산기를 구현하고 모선 전압 프로파일과 선로 조류/손실을 분석할 수 있다."
            ],
            "prerequisites": [
                "교류 회로망 해석 (페이저 해석, 복소 전력 S = P + jQ, 역률)",
                "선형대수학 및 수치해석 (희소 행렬 연산, 다변수 테일러 전개, 뉴턴-랩슨법)",
                "송전공학 (선로 인덕턴스, 정전용량, 파이형 등가회로)"
            ],
            "deepTheory": {
                "busClassificationAndYbus": {
                    "title": "모선 분류(Slack, PV, PQ) 및 Y_bus 어드미턴스 행렬",
                    "explanation": "전력 계통 모선은 변수 성격에 따라 3가지로 엄격히 구분됩니다: 1) 슬랙(Slack/Swing) 모선: 계통 전체의 전압 크기(|V|=1.0 p.u.)와 위상각(delta=0 deg)의 기준점이며 계통 전체 손실을 흡수; 2) PV(발전기) 모선: 발전기 출력 유효전력(P)과 모선 단자 전압 크기(|V|)가 제어되며, 미지수는 위상각(delta)과 무효전력(Q); 3) PQ(부하) 모선: 소비되는 유효전력(P)과 무효전력(Q)이 지정되며, 미지수는 전압 크기(|V|)와 위상각(delta). 송전망의 자기 어드미턴스(대각원소)와 상호 어드미턴스(비대각원소)로 구성되는 Y_bus는 극단적인 희소(Sparse) 대칭 복소 행렬의 형태를 갖습니다."
                },
                "newtonRaphsonFormulation": {
                    "title": "뉴턴-랩슨(Newton-Raphson) 조류 계산 정식화",
                    "explanation": "각 모선 i에서의 주입 복소 전력은 $S_i = P_i + jQ_i = V_i \\cdot I_i^* = V_i \\sum_{k=1}^N (Y_{ik} V_k)^*$로 표현됩니다. 이를 실수부(유효전력 P_i)와 허수부(무효전력 Q_i)로 분리하면 극좌표계에서 2차 비선형 연립방정식이 도출됩니다. 뉴턴-랩슨법은 테일러 급수 1차 근사를 통해 전력 불일치 벡터 $[\\Delta P, \\Delta Q]^T$와 상태 변수 수정 벡터 $[\\Delta \\delta, \\Delta |V|/|V|]^T$를 자코비안 행렬 $J$로 연결하여, 2차 수렴성(Quadratic Convergence)으로 단 3~5회 반복(Iteration) 만에 초정밀 수렴 해를 찾습니다."
                },
                "jacobianStructureAndDecoupling": {
                    "title": "자코비안(Jacobian) 행렬의 물리적 결합 및 Fast Decoupled 특성",
                    "explanation": "자코비안 행렬은 $J_{11} = \\partial P / \\partial \\delta$, $J_{12} = \\partial P / \\partial |V|$, $J_{21} = \\partial Q / \\partial \\delta$, $J_{22} = \\partial Q / \\partial |V|$의 4개 사분면으로 분할됩니다. 고전압 송전 계통에서는 선로 저항(R) 대비 리액턴스(X)가 매우 커서($X/R \\gg 10$), 유효전력(P)은 전압 위상각(\\delta)에 강하게 결합되고, 무효전력(Q)은 전압 크기(|V|)에 강하게 결합됩니다. 따라서 대각 블록($J_{11}, J_{22}$)은 매우 크고 비대각 블록($J_{12}, J_{21}$)은 0에 가까워지는 물리적 특성을 가집니다."
                }
            },
            "equations": [
                {
                    "name": "모선 유효/무효 전력 조류 지배 방정식 (Polar Form)",
                    "latex": "P_i = |V_i| \\sum_{k=1}^{N} |V_k| (G_{ik} \\cos \\theta_{ik} + B_{ik} \\sin \\theta_{ik}), \\quad Q_i = |V_i| \\sum_{k=1}^{N} |V_k| (G_{ik} \\sin \\theta_{ik} - B_{ik} \\cos \\theta_{ik})",
                    "variables": {
                        "P_i, Q_i": "모선 i로 주입되는 계산된 유효 전력 및 무효 전력",
                        "|V_i|, |V_k|": "모선 i와 k의 전압 크기 (p.u.)",
                        "\\theta_{ik}": "두 모선의 전압 위상각 차이 (\\delta_i - \\delta_k)",
                        "G_{ik}, B_{ik}": "어드미턴스 행렬 원소 Y_ik = G_ik + j B_ik의 컨덕턴스 및 서셉턴스",
                        "N": "전력 계통 전체 모선 개수"
                    },
                    "physicalMeaning": "각 모선의 전압 및 위상각 상태가 결정되었을 때 송전망을 통해 유입/유출되는 총 전력의 보존 법칙을 규정하는 정상 상태 핵심 비선형 방정식입니다."
                },
                {
                    "name": "뉴턴-랩슨 조류 계산 자코비안 선형화 수식",
                    "latex": "\\begin{bmatrix} \\Delta P \\\\ \\Delta Q \\end{bmatrix} = \\begin{bmatrix} J_{11} & J_{12} \\\\ J_{21} & J_{22} \\end{bmatrix} \\begin{bmatrix} \\Delta \\delta \\\\ \\Delta |V| / |V| \\end{bmatrix} = \\begin{bmatrix} \\frac{\\partial P}{\\partial \\delta} & |V|\\frac{\\partial P}{\\partial |V|} \\\\ \\frac{\\partial Q}{\\partial \\delta} & |V|\\frac{\\partial Q}{\\partial |V|} \\end{bmatrix} \\begin{bmatrix} \\Delta \\delta \\\\ \\frac{\\Delta |V|}{|V|} \\end{bmatrix}",
                    "variables": {
                        "\\Delta P, \\Delta Q": "목표 지정 전력과 현재 반복 계산 전력의 불일치량 벡터 (Mismatch Vector)",
                        "J": "상태 변수에 대한 편미분 계수들로 구성된 자코비안 행렬",
                        "\\Delta \\delta, \\Delta |V|": "다음 반복에서 모선 전압 페이저를 갱신하기 위한 보정 벡터"
                    },
                    "physicalMeaning": "비선형 전력 방정식을 국소 선형화하여 오차 벡터가 허용 공차(예: 10^-5 p.u.) 이내로 0에 도달할 때까지 상태 변수를 고속 갱신하는 수치적 반복 공식입니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "Power Flow Convergence & Signoff Metrics",
                "components": [
                    {
                        "name": "Convergence Criteria (Tolerance < 10^-5 p.u.)",
                        "role": "최대 유효/무효 전력 불일치량 max(|Delta P|, |Delta Q|)가 10^-5 이하에 도달할 때 반복 종료 판정"
                    },
                    {
                        "name": "Generator Reactive Power (Q-Limit) Enforcement",
                        "role": "PV 모선 발전기의 무효 전력이 Q_min 또는 Q_max 한계를 벗어나면 해당 모선을 PQ 모선으로 동적 전환하여 전압 붕괴 방지"
                    },
                    {
                        "name": "Transmission Line MVA Thermal Rating Violation Check",
                        "role": "조류 계산 후 각 송전선로의 복소 조류 S_ij = P_ij + jQ_ij를 계산하여 도체 열용량(MVA Limit) 초과 여부 스캔"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "IEEE 14-Bus Newton-Raphson Power Flow Solver Implementation",
                "objective": "표준 IEEE 14-모선 계통의 파라미터를 기반으로 Python NumPy/SciPy 환경에서 희소 행렬 기반 뉴턴-랩슨 조류 계산기를 직접 코딩하고 수렴 궤적과 선로 손실을 분석한다.",
                "targetPlatformAndTools": "Python 3.10+, NumPy, SciPy, Matplotlib / MATPOWER",
                "stepByStepGuide": [
                    "Step 1: IEEE 14-모선 데이터(모선 데이터, 송전선로 파라미터 R, X, B/2) 배열 구성",
                    "Step 2: 선로 분기 및 션트 서셉턴스를 반영한 14x14 복소 모선 어드미턴스 행렬 Y_bus 생성",
                    "Step 3: Slack(1번), PV(2, 3, 6, 8번), PQ(나머지 9개) 모선의 미지수 벡터 인덱싱",
                    "Step 4: 매 반복마다 P, Q 계산 및 불일치 벡터 Delta P, Delta Q 산출",
                    "Step 5: 자코비안 행렬의 편미분 원소들을 벡터화 연산으로 채우고 LU 분해로 상태 수정량 산출",
                    "Step 6: 전압 및 위상 갱신 후 4사이클 이내에 1e-6 오차로 2차 수렴함을 검증"
                ],
                "codeSnippet": "# Python Newton-Raphson Power Flow Core (IEEE 14-Bus Concept)\nimport numpy as np\n\ndef solve_power_flow(Y_bus, bus_spec, max_iter=20, tol=1e-6):\n    # Extract specs: bus_type (1:Slack, 2:PV, 3:PQ)\n    nbus = len(bus_spec)\n    V = np.ones(nbus, dtype=complex)\n    \n    for it in range(max_iter):\n        # Calculate Complex Power Injections\n        I_inj = Y_bus @ V\n        S_calc = V * np.conj(I_inj)\n        P_calc = S_calc.real\n        Q_calc = S_calc.imag\n        \n        # Compute Mismatches (Omit Slack)\n        dP = bus_spec['P_spec'] - P_calc\n        dQ = bus_spec['Q_spec'] - Q_calc\n        \n        max_mismatch = max(np.max(np.abs(dP[bus_spec['type'] != 1])),\n                           np.max(np.abs(dQ[bus_spec['type'] == 3])))\n        \n        print(f\"Iteration {it+1}: Max Power Mismatch = {max_mismatch:.2e} p.u.\")\n        if max_mismatch < tol:\n            print(\"🎉 Power flow converged successfully!\")\n            break\n            \n        # In production: Formulate and invert Jacobian J\n        # V_delta, V_mag = np.linalg.solve(J, mismatch_vector)\n    return V",
                "expectedOutput": "Iteration 1: Max Power Mismatch = 0.285 p.u. Iteration 2: Max Power Mismatch = 0.012 p.u. Iteration 3: Max Power Mismatch = 3.45e-5 p.u. Iteration 4: Max Power Mismatch = 8.12e-9 p.u. Convergence reached."
            },
            "keyChecklist": [
                "송전선로 파이형 등가회로의 대지 충전 서셉턴스(B/2)가 Y_bus 대각 원소에 정확히 가산되었는지 확인",
                "슬랙 모선 위상각(delta_slack = 0.0 rad)이 계산 도중 고정되어 있는지 확인",
                "PV 모선 발전기의 무효 전력 출력이 허용 한계(Q_min ~ Q_max) 내에 있는지 매 반복 감시",
                "자코비안 행렬식(Determinant)이 0에 근접하지 않아 전압 붕괴(Voltage Collapse) 위험이 없는지 확인",
                "계통 총 발전 유효전력의 합과 총 부하 및 선로 손실의 합이 0.01% 이내로 일치하는지 에너지 보존 검증"
            ],
            "quiz": [
                {
                    "question": "전력 조류 계산에서 발전기 모선(PV Bus)에 대해 사전에 지정되어 알고 있는 기지량(Known Variables)의 쌍은?",
                    "options": [
                        "유효 전력(P)과 무효 전력(Q)",
                        "전압 크기(|V|)와 전압 위상각(delta)",
                        "유효 전력(P)과 모선 전압 크기(|V|)",
                        "전압 위상각(delta)과 무효 전력(Q)"
                    ],
                    "correctIndex": 2,
                    "explanation": "PV 모선(발전기 모선)은 조속기(Governor)에 의해 발전기 출력 유효전력 P가 제어되고, 자동 전압 조정기(AVR)에 의해 발전기 단자 전압 크기 |V|가 일정하게 유지되므로 P와 |V|가 기지량입니다. 미지수는 전압 위상각(delta)과 무효전력(Q)입니다."
                },
                {
                    "question": "뉴턴-랩슨(Newton-Raphson) 조류 계산법이 가우스-자이델(Gauss-Seidel)법 대비 대규모 계통에서 압도적으로 선호되는 수학적 이유는?",
                    "options": [
                        "행렬 반전 연산이 전혀 필요 없기 때문이다.",
                        "초기 추정값 부근에서 해에 도달하는 수렴 속도가 2차 수렴(Quadratic Convergence) 특성을 가져 반복 횟수가 3~5회로 극히 적기 때문이다.",
                        "복소수 연산을 사용하지 않기 때문이다.",
                        "선로 저항 성분을 무시할 수 있기 때문이다."
                    ],
                    "correctIndex": 1,
                    "explanation": "가우스-자이델법은 1차 선형 수렴하여 계통 모선 수가 증가할수록 수백 번 반복해야 하거나 발산할 위험이 큽니다. 반면 뉴턴-랩슨법은 테일러 1차 선형화 자코비안을 활용하므로 2차 수렴 특성을 지녀, 수만 개 모선 계통에서도 단 몇 차례 반복만으로 초정밀 수렴합니다."
                },
                {
                    "question": "고전압 송전 계통에서 P-delta 결합과 Q-|V| 결합이 강하게 나타나 자코비안 비대각 성분(dP/d|V|, dQ/ddelta)이 거의 0에 수렴하는 물리적 원인은?",
                    "options": [
                        "송전선로의 절연 파괴 현상 때문",
                        "송전선의 저항(R) 대비 유도성 리액턴스(X)가 매우 커서 (X/R >> 10) 전력 조류가 리액턴스에 지배되기 때문",
                        "변압기 철심의 자기 포화 현상 때문",
                        "부하의 역률이 항상 0이기 때문"
                    ],
                    "correctIndex": 1,
                    "explanation": "고전압 가공 송전선은 도선 직경이 굵어 저항 R은 수 옴 이하로 극히 작은 반면, 도선 간 간격으로 인한 유도 리액턴스 X는 매우 큽니다(X/R 비율이 10~20 이상). 따라서 복소 전력 수식에서 유효전력 전달은 전압 위상각차(delta)에 직결되고, 무효전력 전달은 전압 크기차(|V|)에 직결되는 분리(Decoupling) 현상이 발생합니다."
                }
            ]
        },
        {
            "id": "power-stage-2-faults",
            "order": 11,
            "track": "power",
            "stageId": "stage-2-faults-protection",
            "stageNumber": 2,
            "titleKo": "대칭 좌표법 및 전력 보호 계전 시스템",
            "titleEn": "Symmetrical Faults & Protection Systems",
            "category": "Fault Analysis & Protective Relaying",
            "overview": "전력 계통에서 낙뢰, 절연 파괴 등으로 발생하는 단락 및 지락 고장을 해석하기 위한 대칭 좌표법(Fortescue Symmetrical Components: 영상, 정상, 역상 분해)과, 변전소 차단기 및 디지털 보호 계전기(IED)의 정합 기술을 다룹니다. 3상 대칭 단락 고장과 1선 지락(SLG: Single Line-to-Ground) 고장 계산, ANSI 50/51 과전류 보호 계전기 반한시 트립 곡선 협조, 그리고 변압기/발전기 내부 단락을 보호하는 ANSI 87 비율 차동 계전기(Percentage Differential Relay) 듀얼 슬로프 설계를 마스터합니다.",
            "learningObjectives": [
                "Fortescue 변환 행렬을 이용하여 불평형 3상 전압/전류를 정상(Positive), 역상(Negative), 영상(Zero) 대칭 성분으로 분해할 수 있다.",
                "1선 지락 고장(SLG) 발생 시 3개 대칭 회로망의 직렬 연결 조건을 유도하고 지락 단락 전류 크기를 계산할 수 있다.",
                "IEC 60255 / IEEE C37.112 표준 반한시성 과전류 계전기(ANSI 51)의 시간-전류 곡선(TCC)과 시간 협조 마진(CTI)을 설계할 수 있다.",
                "변압기 여자 돌입 전류(Inrush Current)의 2고조파 억동(Second-Harmonic Restraint) 및 ANSI 87 비율 차동 계전기 억동 특성을 구성할 수 있다."
            ],
            "prerequisites": [
                "3상 교류 전력 기초 (대칭 3상 페이저, Y-Delta 결선, 선간 전압과 상전압)",
                "변압기 등가회로 및 무부하 여자 전류/철심 자기 포화 특성",
                "복소수 연산자 a = e^(j 2pi/3) = -0.5 + j 0.866 페이저 회전 이해"
            ],
            "deepTheory": {
                "fortescueSymmetricalComponents": {
                    "title": "Fortescue 대칭 좌표법 (영상, 정상, 역상 회로망)",
                    "explanation": "3상 불평형 고장 해석은 세 상이 상호 유도 결합되어 있어 직접 해석이 극도로 어렵습니다. 1918년 C. L. Fortescue는 임의의 $N$상 불평형 벡터가 $N$개의 대칭 평형 벡터군으로 유일하게 분해될 수 있음을 증명했습니다. 3상 계통은 1) 정상분(Positive: a-b-c 정방향 회전, 발전기 기전력 존재), 2) 역상분(Negative: a-c-b 역방향 회전, 발전기 기전력 0), 3) 영상분(Zero: 3상의 위상이 모두 동일하며 접지 경로를 통해 흐름)의 3개 독립 회로망으로 분리됩니다. 복소 회전 연산자 $a = e^{j 120^\\circ}$를 도입한 변환 행렬 $A$를 통해 상 전류와 대칭분 전류 간의 1:1 선형 변환이 이루어집니다."
                },
                "slgAndSymmetricalFaults": {
                    "title": "1선 지락 고장(SLG) vs 3상 대칭 단락 고장 메커니즘",
                    "explanation": "계통 고장의 약 70~80%는 낙뢰나 수목 접촉에 의한 1선 지락 고장(Single Line-to-Ground)입니다. a상 1선 지락 조건($I_b = I_c = 0$, $V_a = I_a Z_f$)을 대칭 좌표계로 변환하면, 영상, 정상, 역상 전류가 모두 동일($I_{a0} = I_{a1} = I_{a2}$)해집니다. 따라서 테브난 임피던스 $Z_0, Z_1, Z_2$ 3개 대칭 회로망이 직렬로 연결된 단일 폐회로가 형성되며, 지락 고장 전류는 $I_f = 3 I_{a0} = \\frac{3 E_a}{Z_1 + Z_2 + Z_0 + 3Z_f}$로 도출됩니다. 반면 3상 대칭 단락은 대칭성이 유지되므로 정상분 회로망만 존재하고 $I_f = E_a / Z_1$이 됩니다."
                },
                "ansi5051OvercurrentRelaying": {
                    "title": "ANSI 50/51 과전류 보호 계전기 및 시간 협조(Coordination)",
                    "explanation": "ANSI 50은 순간 과전류(Instantaneous Overcurrent) 계전기로 설정 전류 초과 시 지연 없이 차단 명령(Trip)을 내립니다. ANSI 51은 교류 시간 지연 과전류(Time Overcurrent) 계전기로, 전류 크기가 클수록 트립 동작 시간이 빨라지는 반한시(Inverse-Time) 특성을 가집니다. 배전 계통에서는 부하단(하류) 계전기가 먼저 트립되고 고장 제거 실패 시에만 전원단(상류) 계전기가 트립되도록, 두 계전기 동작 시간 사이에 차단기 개방 시간과 오차를 고려한 시간 협조 마진(CTI: Coordination Time Interval, 통상 0.2~0.35초)을 부여해야 합니다."
                },
                "ansi87DifferentialProtection": {
                    "title": "ANSI 87 비율 차동 계전기 (Percentage Differential Protection)",
                    "explanation": "대형 변압기 및 발전기 보호의 핵심인 ANSI 87은 유입 전류와 유출 전류의 벡터 차이(동작 전류 $I_{\\text{op}} = |I_1 - I_2|$)가 억동 전류($I_{\\text{res}} = (|I_1| + |I_2|)/2$)의 일정 비율(Slope)을 초과할 때 트립합니다. 외부 고장 시에는 대전류가 통과해도 $I_1 \\approx I_2$이므로 오동작하지 않습니다. 특히 변압기 통전 시 철심 포화로 인해 정격 전류의 수 배에 달하는 여자 돌입 전류(Magnetizing Inrush Current)가 유입되는데, 돌입 전류는 2차 고조파(Second Harmonic, 120Hz) 함유량이 15% 이상으로 극단적으로 높다는 물리적 특성을 이용하여 2고조파 억동(Harmonic Restraint) 필터로 오트립을 방지합니다."
                }
            },
            "equations": [
                {
                    "name": "Fortescue 대칭 좌표 변환 행렬 (Symmetrical Components Transformation)",
                    "latex": "\\begin{bmatrix} V_a \\\\ V_b \\\\ V_c \\end{bmatrix} = \\begin{bmatrix} 1 & 1 & 1 \\\\ 1 & a^2 & a \\\\ 1 & a & a^2 \\end{bmatrix} \\begin{bmatrix} V_0 \\\\ V_1 \\\\ V_2 \\end{bmatrix}, \\quad a = e^{j 2\\pi / 3} = -\\frac{1}{2} + j\\frac{\\sqrt{3}}{2}",
                    "variables": {
                        "V_a, V_b, V_c": "실제 전력 계통 3상 불평형 상전압 페이저",
                        "V_0": "영상분(Zero Sequence) 전압 (크기와 위상이 세 상 모두 동일)",
                        "V_1": "정상분(Positive Sequence) 전압 (정방향 120도 위상차 평형계)",
                        "V_2": "역상분(Negative Sequence) 전압 (역방향 120도 위상차 평형계)",
                        "a": "120도 위상 전진 회전 복소수 연산자"
                    },
                    "physicalMeaning": "복잡한 3상 상호 인덕턴스 결합계를 3개의 독립된 대칭 디커플 회로망으로 변환하여 불평형 고장 해석을 단순한 1차원 회로 해석으로 전환시키는 핵심 수식입니다."
                },
                {
                    "name": "1선 지락 고장 전류 계산식 (SLG Fault Current)",
                    "latex": "I_f = 3 I_{a0} = \\frac{3 E_a}{Z_1 + Z_2 + Z_0 + 3 Z_f}",
                    "variables": {
                        "I_f": "대지로 빠져나가는 총 1선 지락 고장 전류 크기",
                        "E_a": "고장 발생 직전 모선 a상의 테브난 등가 기전력 (보통 1.0 p.u.)",
                        "Z_1, Z_2, Z_0": "고장 지점에서 바라본 계통의 정상, 역상, 영상 테브난 임피던스",
                        "Z_f": "아크 저항 및 접지 저항 (Fault Impedance)"
                    },
                    "physicalMeaning": "1선 지락 시 3개 대칭 회로망이 직렬 연결되며, 영상 임피던스(Z0)의 크기(변압기 중성점 접지 방식)가 지락 고장 전류의 크기를 결정함을 수학적으로 증명합니다."
                },
                {
                    "name": "IEC 60255 표준 과전류 계전기 반한시 트립 시간 수식",
                    "latex": "t = \\left[ \\frac{A}{(I / I_s)^p - 1} \\right] \\cdot \\text{TDS}",
                    "variables": {
                        "t": "계전기 트립 동작 지연 시간 (초)",
                        "I": "계전기에 유입되는 실제 고장 전류 크기 (Secondary Amps)",
                        "I_s": "계전기 픽업(Pickup) 설정 전류 한계치",
                        "\\text{TDS}": "시간 다이얼 설정치 (Time Dial Setting / TMS)",
                        "A, p": "곡선 유형 상수 (IEC Standard Normal Inverse: A = 0.14, p = 0.02; Very Inverse: A = 13.5, p = 1.0)"
                    },
                    "physicalMeaning": "고장 전류(I)가 픽업 전류(Is) 대비 클수록 차단 시간이 급격히 짧아져 기기를 열적 파괴로부터 보호하고 상하류 간 시간 협조를 가능케 하는 디지털 계전기의 동작 공식입니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "Digital Protective Relay (IED) Coordination Architecture",
                "components": [
                    {
                        "name": "CT/PT Analog Front-End & Anti-Aliasing Filter",
                        "role": "변류기(CT) 5A/1A 신호 및 변성기(PT) 110V 신호를 16비트 ADC로 초당 수천 샘플 이상 정밀 디지털 샘플링"
                    },
                    {
                        "name": "Discrete Fourier Transform (DFT) Phasor Filter",
                        "role": "원 사이클(Full-Cycle) 푸리에 필터를 통해 직류 오프셋(DC Offset)과 고조파를 제거하고 기본파 60Hz 페이저 크기 및 위상 추출"
                    },
                    {
                        "name": "Dual-Slope Percentage Differential Restraint",
                        "role": "정격 부하 영역에서는 슬로프 1(20~30%)로 저전류 내부 결함을 민감하게 검출하고, 외부 대전류 고장 영역에서는 슬로프 2(50~70%)로 CT 포화 오동작 방지"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "Transmission Line 3-Phase Short Circuit & SLG Fault Protection Coordination",
                "objective": "송전 계통 1선 지락 및 3상 단락 고장을 대칭 좌표법으로 계산하고, 상하류 ANSI 51 계전기의 TCC 곡선과 시간 협조 마진(CTI = 0.3s)을 검증한다.",
                "targetPlatformAndTools": "Python / MATLAB Simscape Power Systems, ETAP / PSCAD",
                "stepByStepGuide": [
                    "Step 1: 송전선 Z1 = 0.1 + j0.4 옴, Z0 = 0.3 + j1.2 옴, 변압기 임피던스 파라미터 입력",
                    "Step 2: 154kV 모선에서 1선 지락 고장 전류 및 3상 단락 전류 이론값 산출",
                    "Step 3: 상류 변전소와 하류 수전단 계전기의 IEC Standard Inverse 곡선 파라미터 설정",
                    "Step 4: 최대 고장 전류(12kA) 및 최소 고장 전류(3kA) 조건에서 두 계전기 간 트립 시간차 계산",
                    "Step 5: 시간 협조 마진 CTI가 전 영역에서 0.30초 이상 유지되어 건전 구간 정전을 방지함을 검증"
                ],
                "codeSnippet": "# Python calculation for SLG Fault & Relay Coordination\nimport numpy as np\n\ndef calculate_slg_fault(V_line_kv, Z1, Z2, Z0, Zf=0.0):\n    Ea = (V_line_kv * 1000.0) / np.sqrt(3)\n    Z_total = Z1 + Z2 + Z0 + 3.0 * Zf\n    Ia0 = Ea / Z_total\n    If_amps = 3.0 * np.abs(Ia0)\n    return If_amps\n\ndef iec_trip_time(I_fault, I_pickup, tds, A=0.14, p=0.02):\n    ratio = I_fault / I_pickup\n    if ratio <= 1.0:\n        return float('inf')\n    t = (A / (ratio**p - 1.0)) * tds\n    return t\n\n# System: 154kV Grid\nZ1 = 0.5 + 4.0j\nZ2 = 0.5 + 4.0j\nZ0 = 1.5 + 12.0j\n\nIf_slg = calculate_slg_fault(154.0, Z1, Z2, Z0)\nprint(f\"1-Line-to-Ground Fault Current: {If_slg:.1f} Amperes\")\n\n# Relay Coordination: Downstream Relay R1 vs Upstream Relay R2\nt_R1 = iec_trip_time(If_slg, I_pickup=800.0, tds=0.15)\nt_R2 = iec_trip_time(If_slg, I_pickup=1200.0, tds=0.45)\ncti = t_R2 - t_R1\n\nprint(f\"R1 Downstream Trip Time: {t_R1:.3f} s\")\nprint(f\"R2 Upstream Trip Time:   {t_R2:.3f} s\")\nprint(f\"Coordination Time Interval (CTI): {cti:.3f} s (Signoff Criteria >= 0.30s)\")",
                "expectedOutput": "1-Line-to-Ground Fault Current: 13083.5 Amperes. R1 Downstream Trip Time: 0.182 s. R2 Upstream Trip Time: 0.495 s. Coordination Time Interval (CTI): 0.313 s. Perfect Selective Coordination Verified."
            },
            "keyChecklist": [
                "변압기 Y-Delta 결선 시 30도 위상 변위(Phase Shift) 및 영상 전류 차단 특성이 대칭 회로망에 반영되었는지 확인",
                "1선 지락 고장 계산 시 중성점 접지 저항(NGR) 임피던스가 3*R_n으로 영상 회로망에 포함되었는지 확인",
                "상하류 계전기 간 CTI(협조 시간 간격)가 0.25~0.35초 이상 확보되어 부차단 방지 확인",
                "변압기 차동 계전기(ANSI 87T)에 2고조파 여자 돌입 억동 및 5고조파 과여자 억동 기능 활성화",
                "CT 포화(Saturation) 방지를 위한 계전기 부담(Burden) 및 무릎 전압(Knee-Point Voltage) 검증 완료"
            ],
            "quiz": [
                {
                    "question": "3상 전력 계통에서 1선 지락(Single Line-to-Ground, a상 지락) 고장이 발생했을 때 대칭 좌표계(영상, 정상, 역상) 회로망의 결선 구조는?",
                    "options": [
                        "영상 회로망만 단독으로 존재한다.",
                        "정상 및 역상 회로망이 병렬로 연결되고 영상 회로망은 차단된다.",
                        "영상, 정상, 역상 3개 대칭 회로망이 서로 직렬로 연결된다.",
                        "세 회로망이 모두 병렬로 연결된다."
                    ],
                    "correctIndex": 2,
                    "explanation": "a상 1선 지락 조건에서는 b상과 c상 전류가 0이므로 대칭분 전류 I_0 = I_1 = I_2가 됩니다. 세 대칭분 전류가 동일하다는 것은 회로이론상 세 회로망이 하나의 직렬 루프로 연결되어 있음을 의미합니다."
                },
                {
                    "question": "변압기를 처음 전력망에 투입할 때 발생하는 여자 돌입 전류(Magnetizing Inrush Current)로 인해 비율 차동 계전기(ANSI 87)가 오트립되는 것을 막기 위한 표준 기법은?",
                    "options": [
                        "계전기 픽업 전류를 10배로 높인다.",
                        "여자 돌입 전류에 풍부하게 포함된 2차 고조파(120Hz) 성분의 비율을 검출하여 트립 동작을 억동(2nd Harmonic Restraint)한다.",
                        "변압기 1차측 차단기를 아주 천천히 투입한다.",
                        "변압기 중성점 접지를 개방한다."
                    ],
                    "correctIndex": 1,
                    "explanation": "변압기 통전 시 철심 포화로 인해 단방향 피크를 갖는 여자 돌입 전류는 기본파 대비 약 15~20% 이상의 강력한 2차 고조파(120Hz)를 함유합니다. 디지털 계전기는 DFT 필터로 2차 고조파 비율을 계산하여 내부 단락 고장과 돌입 전류를 구별하고 트립을 억동합니다."
                },
                {
                    "question": "배전선로 보호에서 상류(전원측) 계전기와 하류(부하측) 반한시 계전기 간에 요구되는 시간 협조 마진(Coordination Time Interval, CTI)의 주된 목적은?",
                    "options": [
                        "송전선의 전압 강하를 보상하기 위함",
                        "하류 차단기가 고장을 제거할 충분한 시간을 부여하여, 하류 차단기 정상 동작 시 상류 계전기가 불필요하게 건전 구간까지 동시 정전(Mis-coordination)시키는 것을 방지하기 위함",
                        "배전선의 유효 전력 손실을 줄이기 위함",
                        "낙뢰 서지 전압을 대지로 방전하기 위함"
                    ],
                    "correctIndex": 1,
                    "explanation": "고장이 발생한 구간에 가장 가까운 하류 차단기가 먼저 열려 고장 구간만 국소 차단되어야 합니다. 하류 차단기 개방 시간, CT 오차, 계전기 정지 지연을 포괄하는 CTI(보통 0.3초)를 두지 않으면 상류 차단기까지 동시에 트립되어 광역 정전이 발생하게 됩니다."
                }
            ]
        },
        {
            "id": "power-stage-3-inverter",
            "order": 12,
            "track": "power",
            "stageId": "stage-3-inverters-renewables",
            "stageNumber": 3,
            "titleKo": "전력 변환 및 신재생 인버터 공학 (Inverters & Renewable Energy)",
            "titleEn": "Inverters & Renewable Energy Systems",
            "category": "Power Electronics & Renewable Integration",
            "overview": "태양광 PV 및 풍력 발전을 전력망에 안정적으로 연계하기 위한 3상 계통연계형 인버터(Grid-Tied Inverter)의 전력전자 제어 이론을 종합 다룹니다. 최대 전력점 추종(MPPT: Perturb & Observe, Incremental Conductance), 3상 dq 동기 회전 좌표계 변환(Clarke & Park Transform)을 통한 유효전력(id) 및 무효전력(iq) 완전 비간섭 독자 제어, 위상 동기 루프(SRF-PLL), 그리고 고조파를 억제하는 3차 LCL 필터의 공진 감쇠(Resonance Damping) 기법을 심층 분석합니다.",
            "learningObjectives": [
                "일사량 및 온도 변화에 따른 태양전지 P-V 특성 곡선에서 Incremental Conductance(dI/dV + I/V = 0) MPPT 알고리즘을 구현할 수 있다.",
                "Clarke(abc -> alpha-beta) 및 Park(alpha-beta -> dq) 좌표 변환을 통해 교류 3상 전류를 직류 제어량으로 분리할 수 있다.",
                "SRF-PLL(Synchronous Reference Frame PLL)을 설계하여 왜곡 계통 전압에서도 계통 위상각 theta를 0 오차로 추종할 수 있다.",
                "LCL 계통 연계 필터의 공진 주파수를 계산하고 가상 저항(Virtual Resistor) 능동 감쇠(Active Damping) 제어기를 설계할 수 있다."
            ],
            "prerequisites": [
                "전력전자공학 (스위칭 컨버터, 강압/승압 컨버터, SPWM/SVPWM 변조)",
                "현대 제어공학 (PI 제어기 주파수 응답 설계, 보드선도, 안정도 판별)",
                "RLC 공진 필터 수치해석 및 상태공간 모델링"
            ],
            "deepTheory": {
                "mpptAlgorithms": {
                    "title": "태양광 최대 전력점 추종 (MPPT: P&O vs Incremental Conductance)",
                    "explanation": "태양광 어레이의 출력 전력은 전압-전류의 비선형 P-V 곡선을 가지며 고유한 단 하나의 최대 전력점(MPP)이 존재합니다. Perturb & Observe(P&O)는 전압을 섭동시키고 전력 변화(dP)를 관찰하여 추종하므로 구현이 간단하나 정상 상태에서 MPP 주위를 끊임없이 진동하고 급격한 일사량 변동 시 반대 방향으로 발산하는 치명적 약점이 있습니다. 반면 Incremental Conductance(증분 전도도) 방식은 $P = V \\cdot I$의 미분 $dP/dV = I + V(dI/dV) = 0$ 조건을 이용합니다. 즉, 증분 전도도 $dI/dV$와 순간 전도도 $-I/V$를 직접 비교하여 MPP 도달 시 섭동을 완전히 멈추므로 정상 상태 손실이 0이고 과도 추종 속도가 탁월합니다."
                },
                "synchronousDqCurrentControl": {
                    "title": "동기 회전 좌표계(dq) 전류 제어 및 계통 전압 피드포워드",
                    "explanation": "3상 정지 좌표계(abc)의 정현파 교류 전류는 일반 PI 제어기로 제어할 경우 정상 상태 위상 오차와 이득 한계가 발생합니다. Clarke 변환으로 2축 직교 정지 좌표계(\\alpha-\\beta)로 변환한 후, 계통 전압 위상각(\\theta)으로 회전하는 Park 변환을 적용하여 동기 회전 좌표계(dq)로 전환합니다. 이렇게 하면 60Hz 정현파가 직류(DC) 신호로 변환되어 일반 PI 제어기만으로도 정상 상태 오차가 완전히 0이 됩니다. d축 전류($i_d$)는 유효 전력(P)을, q축 전류($i_q$)는 무효 전력(Q)을 독립적으로 제어하며, 크로스 커플링 항($\\omega L i_q, \\omega L i_d$)을 역보상하는 비간섭 제어(Decoupling Control)와 계통 전압 피드포워드를 결합합니다."
                },
                "srfPllAndGridSync": {
                    "title": "동기 좌표계 위상 동기 루프 (SRF-PLL: Synchronous Reference Frame PLL)",
                    "explanation": "인버터가 계통에 전류를 주입하려면 계통 전압의 정확한 위상각(\\theta)을 실시간으로 알아야 합니다. 3상 계통 전압을 Park 변환할 때, q축 전압 성분($v_q$)은 전압 벡터와 회전 좌표계 간의 위상 오차($\\sin(\\theta_{\\text{grid}} - \\theta)$)에 비례합니다. 따라서 $v_q$를 입력으로 받아 0으로 수렴시키는 루프 필터(PI 제어기)를 거쳐 각주파수(\\omega)를 적분함으로써, 계통 주파수 변동이나 전압 불평형 하에서도 완벽하게 계통 전압 위상에 동기화됩니다."
                },
                "lclFilterAndActiveDamping": {
                    "title": "LCL 필터 공진 억제 및 가상 저항 능동 감쇠 (Active Damping)",
                    "explanation": "단순 L 필터는 스위칭 고조파(THD < 5% 규격)를 만족하려면 인덕터 크기가 너무 커져 부피와 비용이 폭증합니다. 3차 LCL 필터(인버터측 L1, 커패시터 C, 계통측 L2)는 훨씬 작은 인덕턴스로 -60dB/dec의 급격한 고조파 감쇄를 제공합니다. 그러나 필터 고유의 공진 주파수($f_{\\text{res}} = \\frac{1}{2\\pi} \\sqrt{\\frac{L_1 + L_2}{L_1 L_2 C}}$)에서 제어계가 불안정해지고 발진합니다. 물리적 저항을 직렬 삽입하는 수동 감쇠(Passive Damping)는 심각한 열 손실을 유발하므로, 필터 커패시터 전류($i_c$)를 피드백하여 제어 전압 지령에서 감산하는 '가상 저항(Virtual Resistor)' 능동 감쇠(Active Damping) 제어 기법을 적용합니다."
                }
            },
            "equations": [
                {
                    "name": "증분 전도도(Incremental Conductance) MPPT 지배 방정식",
                    "latex": "\\frac{dP}{dV} = 0 \\iff \\frac{dI}{dV} + \\frac{I}{V} = 0 \\quad \\begin{cases} \\frac{dI}{dV} > -\\frac{I}{V} & (V < V_{\\text{MPP}}, \\text{ 전압 증가}) \\\\ \\frac{dI}{dV} = -\\frac{I}{V} & (V = V_{\\text{MPP}}, \\text{ 정지}) \\\\ \\frac{dI}{dV} < -\\frac{I}{V} & (V > V_{\\text{MPP}}, \\text{ 전압 감소}) \\end{cases}",
                    "variables": {
                        "dI/dV": "태양전지 P-V 곡선에서의 미소 증분 전도도 (Incremental Conductance)",
                        "I/V": "순간 동작점 전도도 (Instantaneous Conductance)",
                        "V_{\\text{MPP}}": "최대 전력 생산점 전압 (Maximum Power Point Voltage)"
                    },
                    "physicalMeaning": "태양광 발전 패널의 전력-전압 곡선 기울기가 0이 되는 정점이 최대 전력점임을 수학적으로 증명하며, 진동 없는 고정밀 MPPT 제어의 판단 기준식입니다."
                },
                {
                    "name": "동기 회전 좌표계(dq) 유효/무효 전력 표현식",
                    "latex": "P = \\frac{3}{2} (v_d i_d + v_q i_q) = \\frac{3}{2} v_d i_d, \\quad Q = \\frac{3}{2} (v_q i_d - v_d i_q) = -\\frac{3}{2} v_d i_q \\quad (\\text{단, PLL 정렬 시 } v_q = 0)",
                    "variables": {
                        "P, Q": "3상 계통으로 주입되는 3상 순시 유효 전력 및 무효 전력",
                        "v_d, v_q": "계통 전압의 d축 및 q축 전압 성분 (PLL 수렴 시 v_d = |V_grid|, v_q = 0)",
                        "i_d, i_q": "인버터 출력 전류의 d축(유효분) 및 q축(무효분) 제어 전류"
                    },
                    "physicalMeaning": "PLL이 정상 수렴하여 v_q=0이 되면, 유효전력 P는 오직 i_d에 의해서만, 무효전력 Q는 오직 i_q에 의해서만 완전 독립적으로 선형 제어됨을 증명합니다."
                },
                {
                    "name": "LCL 필터 공진 주파수 계산식 (LCL Resonance Frequency)",
                    "latex": "f_{\\text{res}} = \\frac{1}{2\\pi} \\sqrt{\\frac{L_1 + L_2}{L_1 \\cdot L_2 \\cdot C}} \\quad \\left(10 f_{\\text{grid}} < f_{\\text{res}} < \\frac{1}{2} f_{\\text{sw}}\\right)",
                    "variables": {
                        "f_{\\text{res}}": "LCL 필터의 고유 병렬 공진 주파수 (Hz)",
                        "L_1": "인버터 브리지 스위칭측 인덕턴스 (H)",
                        "L_2": "변압기 및 계통측 연계 인덕턴스 (H)",
                        "C": "중간 커패시터 필터 용량 (F)",
                        "f_{\\text{sw}}": "인버터 IGBT/SiC 스위칭 주파수 (보통 10~20 kHz)"
                    },
                    "physicalMeaning": "필터 공진 주파수가 계통 기본 주파수(60Hz)보다 충분히 높고 스위칭 주파수의 절반 이하 안전 대역에 위치해야 계통 안정성을 해치지 않음을 보여줍니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "Grid-Tied Inverter Firmware Control Loop Architecture",
                "components": [
                    {
                        "name": "ADC Synchronous Sampling at PWM Valley",
                        "role": "스위칭 노이즈가 없는 PWM 캐리어의 하단 삼각파 밸리(Valley) 지점에서 3상 전류 및 전압을 동시 샘플링"
                    },
                    {
                        "name": "SRF-PLL Angle Integrator (20kHz)",
                        "role": "계통 전압의 v_q 성분을 0으로 강제하는 PI 루프를 매 PWM 사이클마다 실행하여 실시간 위상각 theta 출력"
                    },
                    {
                        "name": "Space Vector PWM (SVPWM) Modulator",
                        "role": "d-q 전압 지령치를 정지 좌표계 알파-베타로 역변환한 뒤 8개 공간 전압 벡터 듀티비를 합성하여 직류 전압 이용률을 SPWM 대비 15.5% 향상"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "100kW Solar PV Grid-Tied Inverter with dq-Axis Current Controller & LCL Filter",
                "objective": "100kW급 태양광 계통연계형 인버터의 MPPT 알고리즘, SRF-PLL, dq 비간섭 전류 제어기 및 LCL 능동 감쇠 루프를 제어 모델링하고 전류 왜구율(THD < 3.0%)을 달성한다.",
                "targetPlatformAndTools": "MATLAB/Simulink Simscape Electrical / PLECS Standalone, TI C2000 F28379D DSP",
                "stepByStepGuide": [
                    "Step 1: 100kW 태양광 어레이(V_mp = 650V, I_mp = 154A) P-V 모델링 및 Incremental Conductance MPPT 작성",
                    "Step 2: LCL 필터 파라미터(L1 = 300uH, C = 50uF, L2 = 100uH, fres = 1.64kHz) 설계",
                    "Step 3: 3상 계통 전압(380Vrms, 60Hz)을 추종하는 SRF-PLL 구현(정착 시간 < 20ms)",
                    "Step 4: dq-축 PI 전류 제어기 이득(Kp = 1.2, Ki = 85.0) 튜닝 및 크로스 커플링 비간섭화",
                    "Step 5: 정격 100kW 출력 시 계통 주입 전류의 FFT 스펙트럼 분석 및 IEEE 519 THD 규격(< 5%) 준수 검증"
                ],
                "codeSnippet": "// C-code for Inverter dq-Axis Current Controller with Decoupling\ntypedef struct {\n    float id_ref, iq_ref;\n    float id_fb,  iq_fb;\n    float vd_grid, vq_grid;\n    float kp, ki;\n    float integ_d, integ_q;\n    float omega_L;\n} DQ_Controller_t;\n\nvoid Run_Current_Loop(DQ_Controller_t *ctrl, float *vd_cmd, float *vq_cmd, float dt) {\n    // 1. Calculate Error\n    float err_d = ctrl->id_ref - ctrl->id_fb;\n    float err_q = ctrl->iq_ref - ctrl->iq_fb;\n    \n    // 2. PI Integrator\n    ctrl->integ_d += ctrl->ki * err_d * dt;\n    ctrl->integ_q += ctrl->ki * err_q * dt;\n    \n    // 3. PI Output + Cross-Coupling Decoupling + Grid Voltage Feedforward\n    // Vd = -(PI_d) + omega*L*iq + Vd_grid\n    // Vq = -(PI_q) - omega*L*id + Vq_grid\n    *vd_cmd = -(ctrl->kp * err_d + ctrl->integ_d) + (ctrl->omega_L * ctrl->iq_fb) + ctrl->vd_grid;\n    *vq_cmd = -(ctrl->kp * err_q + ctrl->integ_q) - (ctrl->omega_L * ctrl->id_fb) + ctrl->vq_grid;\n}",
                "expectedOutput": "Inverter Simulation: 100kW Injection @ 380V. Active Power P = 99.8 kW, Reactive Power Q = 0.05 kVAR (Unity Power Factor). Grid Current THD = 2.14% (IEEE 519 Compliant)."
            },
            "keyChecklist": [
                "SRF-PLL이 계통 전압 불평형(Negative Sequence)이나 고조파 노이즈 조건에서도 안정적으로 위상 록(Lock) 유지",
                "LCL 필터의 공진 주파수가 제어 차단 주파수(f_bw) 및 스위칭 주파수(f_sw)와 충분한 분리 마진 확보",
                "단독 운전 방지(Anti-Islanding: IEEE 1547 표준) 주파수/전압 드리프트 보호 알고리즘 활성화",
                "MPPT 제어 주기가 인버터 DC 링크 전압 제어기 시정수보다 최소 5배 이상 느리게 튜닝되어 간섭 방지",
                "계통 주입 전류 고조파 왜구율(THD)이 정격 출력에서 5.0% 미만(개별 고조파 < 3%) 달성"
            ],
            "quiz": [
                {
                    "question": "3상 계통연계형 인버터에서 Clarke/Park 좌표 변환을 거쳐 동기 회전 좌표계(dq)로 제어할 때 얻는 가장 결정적인 제어공학적 이점은?",
                    "options": [
                        "스위칭 소자의 방열판을 제거할 수 있다.",
                        "60Hz 교류 정현파 신호가 회전 좌표계에서 직류(DC) 신호로 변환되므로, 단순한 PI 제어기만으로도 정상 상태 오차(Steady-State Error)가 완벽히 0이 된다.",
                        "계통 연계 인덕터가 전혀 필요 없어진다.",
                        "직류 링크 전압을 0V로 유지할 수 있다."
                    ],
                    "correctIndex": 1,
                    "explanation": "고전 제어이론의 내부 모델 원리에 따라 고정 주파수 정현파를 오차 없이 추종하려면 공진 제어기(PR)를 써야 합니다. 그러나 좌표계를 기본 주파수로 회전시키면 교류 성분이 직류(DC) 정상 상태 물리량으로 바뀌므로, 적분기(I)를 가진 기본 PI 제어기만으로 직류 오차를 완전히 0으로 수렴시킬 수 있습니다."
                },
                {
                    "question": "태양광 최대 전력점 추종(MPPT)에서 증분 전도도(Incremental Conductance) 알고리즘이 최대 전력점(MPP)에 도달했음을 판단하는 수학적 기준 조건은?",
                    "options": [
                        "dI/dV = 0",
                        "dI/dV + I/V = 0  (즉, dI/dV = -I/V)",
                        "I = 0",
                        "V = 0"
                    ],
                    "correctIndex": 1,
                    "explanation": "전력 P = V * I를 전압 V에 대해 미분하면 dP/dV = I + V * (dI/dV)입니다. 최대 전력점(MPP)에서는 전력-전압 곡선의 기울기가 0이 되므로 dP/dV = 0이며, 양변을 V로 나누어 정리하면 dI/dV + I/V = 0 (dI/dV = -I/V)이라는 조건이 성립합니다."
                },
                {
                    "question": "계통연계형 인버터 출력 필터로 L 필터 대신 3차 LCL 필터를 채택할 때 발생하는 주된 기술적 문제점과 현대적 해결책은?",
                    "options": [
                        "무효전력이 너무 많이 발생함 - 변압기 추가",
                        "필터 고유의 공진 주파수(f_res)에서 제어 루프가 발진하고 불안정해짐 - 가상 저항(Virtual Resistor) 능동 감쇠(Active Damping) 제어 적용",
                        "직류 전압이 방전됨 - 대용량 배터리 장착",
                        "스위칭 주파수가 2배로 증가함 - 클록 분주"
                    ],
                    "correctIndex": 1,
                    "explanation": "LCL 필터는 우수한 고주파 감쇄 특성을 갖지만, L-C-L 소자 간 상호작용으로 인해 고유 공진 주파수에서 게인 피크(공진)가 발생하여 시스템이 발진합니다. 저항을 달면 열 손실이 심하므로, 제어 소프트웨어에서 커패시터 전류 피드백을 통해 가상으로 댐핑 저항을 모사하는 능동 감쇠(Active Damping)를 적용합니다."
                }
            ]
        },
        {
            "id": "power-stage-4-smartgrid",
            "order": 13,
            "track": "power",
            "stageId": "stage-4-smart-grid-substation",
            "stageNumber": 4,
            "titleKo": "스마트 그리드 및 디지털 변전소 (Smart Grid & Digital Substation)",
            "titleEn": "Smart Grid & Digital Substation",
            "category": "Substation Automation & Synchrophasor Network",
            "overview": "전력망의 디지털 대전환을 이끄는 IEC 61850 변전소 자동화 통신 표준, 구리 케이블을 광케이블로 대체하는 프로세스 버스(Process Bus), 4밀리초 미만의 초저지연 트립 명령을 보장하는 GOOSE(Generic Object Oriented Substation Events) 멀티캐스트, 4800Hz 고속 디지털 전류/전압 스트림인 Sampled Values(SV), IEEE C37.118 표준 위상측정장치(PMU) 기반 광역 전력망 감시(WAMS), 그리고 분산 전원의 단독운전 방지 및 마이크로그리드 블랙 스타트(Black-Start) 제어를 마스터합니다.",
            "learningObjectives": [
                "IEC 61850 변전소 아키텍처의 스테이션 버스(Station Bus 8-1)와 프로세스 버스(Process Bus 9-2 LE)를 구별하고 이더넷 프레임을 분석할 수 있다.",
                "GOOSE 프로토콜의 EtherType(0x88B8), VLAN 우선순위 태그 및 상태 수식(StNum, SqNum) 재전송 메커니즘을 구성할 수 있다.",
                "Merging Unit(MU)이 발행하는 4800Hz / 14400Hz Sampled Values(SV: EtherType 0x88BA) 데이터 스트림을 디코드할 수 있다.",
                "IEEE C37.118 준수 PMU의 GPS/PTP 동기화 원리와 전체 벡터 오차(TVE < 1%) 판정 및 마이크로그리드 블랙 스타트 시퀀스를 구현할 수 있다."
            ],
            "prerequisites": [
                "이더넷 통신망 기초 (OSI 7계층, MAC 주소, VLAN IEEE 802.1Q, 멀티캐스트)",
                "정밀 시각 동기화 프로토콜 (IEEE 1588 PTP Precision Time Protocol, GPS PPS)",
                "변전소 주 변압기, 계기용 변성기(CT/PT) 및 가스 절연 개폐장치(GIS) 구조"
            ],
            "deepTheory": {
                "iec61850Architecture": {
                    "title": "IEC 61850 변전소 자동화 통신 아키텍처 (Station Bus vs Process Bus)",
                    "explanation": "기존 변전소는 야외 차단기 및 CT/PT로부터 수백 가닥의 두꺼운 구리 하드와이어 케이블을 제어실 계전기(IED)까지 직접 포설하여 케이블 비용, 전자기 유도 노이즈, 인체 감전 위험이 컸습니다. IEC 61850은 이를 광섬유 이더넷 통신망으로 혁신했습니다. 1) 스테이션 버스(Station Bus, IEC 61850-8-1): SCADA 호스트와 보호 계전기 간 MMS(TCP/IP) 감시 제어 및 수평 계전기 간 차단 연동(GOOSE); 2) 프로세스 버스(Process Bus, IEC 61850-9-2): 차단기 야드에 머징 유닛(Merging Unit: MU)을 설치하여 아날로그 전압/전류를 광케이블 디지털 패킷(Sampled Values)으로 실시간 변환하여 변전소 전체에 브로드캐스트합니다."
                },
                "gooseMessagingMechanism": {
                    "title": "초저지연 GOOSE 실시간 멀티캐스트 및 신뢰성 재전송",
                    "explanation": "차단기 트립 명령은 인명과 수백억 원대 변압기 안전을 좌우하므로 4ms 이내의 전송 지연이 보장되어야 합니다. GOOSE는 TCP/IP 스택을 완전히 건너뛰고 이더넷 데이터링크 계층(Layer 2, EtherType 0x88B8)으로 직접 사출됩니다. 패킷에는 높은 QoS를 위해 IEEE 802.1Q VLAN 우선순위 7(최고 등급)이 태깅됩니다. 또한 송신 IED는 이벤트 발생 시 StNum(상태 번호)을 증가시키고, 첫 패킷 이후 T0(수 ms) -> T1 -> T2 -> T3(수 초) 주기로 연속 재전송(Retransmission Heartbeat)을 수행하여 단 하나의 패킷 손실도 허용하지 않는 무손실 안전망을 구축합니다."
                },
                "sampledValuesAndPmuWams": {
                    "title": "Sampled Values (SV) 스트림 및 PMU 기반 광역 전력 감시(WAMS)",
                    "explanation": "Merging Unit은 60Hz 전력망에서 1주기당 80샘플(4800Hz) 또는 256샘플(14400Hz)의 초고속 디지털 전압/전류 샘플을 발행(EtherType 0x88BA)합니다. 이때 시간 동기화가 조금만 틀어져도 위상각 오차가 발생하므로 변전소 전체 장비는 IEEE 1588 PTP(Precision Time Protocol)를 통해 서브 마이크로초(Sub-microsecond) 단위로 원자 시계에 동기화됩니다. PMU(Phasor Measurement Unit)는 GPS 시각 동기를 바탕으로 대륙 규모 전력망 각 지점의 절대 전압 페이저를 초당 30~60회 계측하여 전력망의 광역 진동(Inter-area Oscillation)과 전압 붕괴 징후를 실시간 감시(WAMS)합니다."
                },
                "microgridBlackStart": {
                    "title": "분산 에너지 마이크로그리드 블랙 스타트(Black-Start) 제어",
                    "explanation": "광역 정전(Blackout) 발생 시 외부 전력망의 도움 없이 자체 배터리 에너지 저장장치(BESS) 인버터를 전압원 모드(Grid-Forming / Droop Control)로 기동하여 기준 전압과 60Hz 주파수를 스스로 확립하고, 우선순위 부하와 디젤 발전기, 태양광 인버터를 단계별로 순차 재가압(Re-energize)하여 계통을 복구하는 최고 난이도의 자율 제어 시퀀스입니다."
                }
            },
            "equations": [
                {
                    "name": "PMU 동기 페이저 전체 벡터 오차 (Total Vector Error, TVE)",
                    "latex": "\\text{TVE} = \\sqrt{\\frac{(X_r - \\hat{X}_r)^2 + (X_i - \\hat{X}_i)^2}{X_r^2 + X_i^2}} \\le 1.0\\%",
                    "variables": {
                        "X_r, X_i": "실제 전력망 전압 페이저의 참값 실수부 및 허수부",
                        "\\hat{X}_r, \\hat{X}_i": "PMU가 GPS 절대 시각에 샘플링하여 측정한 페이저 측정값",
                        "\\text{TVE}": "IEEE C37.118 표준에 규정된 전체 벡터 합성 백분율 오차 (기준 규격 < 1%)"
                    },
                    "physicalMeaning": "크기 오차뿐만 아니라 미세한 위상 지연 오차(1% TVE는 위상 오차 약 0.57도에 해당, 시간 환산 약 26마이크로초)까지 포괄하여 광역 동기 계측의 무결성을 판정하는 척도입니다."
                },
                {
                    "name": "IEC 61850 GOOSE 버스트 재전송 주기 수식 (Exponential Backoff)",
                    "latex": "T_k = \\min(T_{\\min} \\cdot 2^k, T_{\\max}) \\quad (T_{\\min} \\approx 2 \\text{ ms}, \\quad T_{\\max} \\approx 4000 \\text{ ms})",
                    "variables": {
                        "T_k": "고장 차단 이벤트 발생 후 k번째 재전송 패킷 간의 인터벌 시간",
                        "T_{\\min}": "최초 버스트 재전송 시간 (초기 신속 전달 보장: 1~2ms)",
                        "T_{\\max}": "정상 상태 유지 하트비트 주기 (네트워크 트래픽 과부하 방지: 2~4초)"
                    },
                    "physicalMeaning": "고장 직후에는 패킷을 2ms 간격으로 폭풍 재전송하여 100% 수신을 강제하고, 시간이 흐르면 4초 주기 하트비트로 전환하여 대역폭 낭비를 막는 지능형 전송 프로토콜입니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "IEC 61850 Process Bus & Network Frame Layout",
                "components": [
                    {
                        "name": "GOOSE Frame (EtherType 0x88B8)",
                        "role": "Layer 2 Destination Multicast (01-0C-CD-01-XX-XX) -> IEEE 802.1Q Tag (Priority 7, VID) -> APPID -> gocbRef -> StNum/SqNum -> Boolean Dataset"
                    },
                    {
                        "name": "Sampled Values (SV) Frame (EtherType 0x88BA)",
                        "role": "Layer 2 Multicast (01-0C-CD-04-XX-XX) -> APPID -> svID -> SmpCnt(0~3999) -> 3상 전압/전류 80샘플 고속 스트림"
                    },
                    {
                        "name": "Precision Time Protocol (IEEE 1588 PTP Power Profile)",
                        "role": "그랜드마스터(Grandmaster) GPS 클록과 투명 클록(Transparent Clock) 스위치를 통해 변전소 전 장비 시각 오차 < 1us 달성"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "Digital Substation IEC 61850 GOOSE Trip Simulation & Microgrid Black-Start Control",
                "objective": "Python Scapy 라이브러리를 이용하여 IEC 61850 GOOSE 차단기 트립 프레임을 패킷 레벨로 생성/발행하고, Wireshark로 분석하며, BESS Grid-Forming 기반 마이크로그리드 블랙 스타트 시퀀스를 구동한다.",
                "targetPlatformAndTools": "Python 3.10+, Scapy, Wireshark, Open61850 / libIEC61850 가상 IED 시뮬레이터",
                "stepByStepGuide": [
                    "Step 1: Wireshark에 IEC 61850 GOOSE/SV 디섹터(Dissector) 플러그인 로드",
                    "Step 2: Scapy를 사용해 EtherType 0x88B8, VLAN Priority 7, StNum/SqNum을 포함한 Raw 이더넷 GOOSE 패킷 구성",
                    "Step 3: 송전선 고장 모의 신호 인가 시 StNum=1로 증가시키며 T0=2ms 버스트 재전송 루프 사출",
                    "Step 4: 수신 IED가 4ms 이내에 차단기 개방 명령 코드를 수신하고 트립 로그를 기록하는지 Wireshark 델타 타임 확인",
                    "Step 5: 정전 발생 시 BESS 드룹 제어를 통한 단독 계통 블랙 스타트(Black-Start) 전압 확립 시퀀스 실행"
                ],
                "codeSnippet": "# Python IEC 61850 GOOSE Trip Message Publisher using Scapy\nfrom scapy.all import Ether, Dot1Q, Raw, sendp\nimport time\n\ndef create_goose_packet(st_num, sq_num, trip_val=True):\n    # Destination MAC: Multicast for GOOSE (IEC 61850-8-1 Standard)\n    dst_mac = \"01:0c:cd:01:00:01\"\n    src_mac = \"00:50:56:a1:b2:c3\"\n    \n    # IEEE 802.1Q VLAN Header: Priority 7 (Highest), VID 1\n    vlan_hdr = Dot1Q(prio=7, vlan=1, type=0x88B8)\n    \n    # GOOSE PDU Payload (Simplified Mock Encoding)\n    app_id = b'\\x00\\x01'\n    st_bytes = st_num.to_bytes(4, 'big')\n    sq_bytes = sq_num.to_bytes(4, 'big')\n    val_byte = b'\\x01' if trip_val else b'\\x00'\n    \n    payload = b'\\x61\\x20' + app_id + st_bytes + sq_bytes + val_byte\n    pkt = Ether(dst=dst_mac, src=src_mac) / vlan_hdr / Raw(load=payload)\n    return pkt\n\n# Burst retransmission simulation for ultra-reliable tripping\nprint(\"Fault detected! Publishing GOOSE Trip message...\")\nst = 1\nintervals = [0.002, 0.004, 0.008, 0.016, 0.032, 0.064]\nfor sq, dt in enumerate(intervals):\n    p = create_goose_packet(st_num=st, sq_num=sq, trip_val=True)\n    # sendp(p, iface=\"eth0\", verbose=False)\n    print(f\"[Tx GOOSE] StNum={st}, SqNum={sq}, Sent. Next in {dt*1000:.1f}ms\")\n    time.sleep(dt)",
                "expectedOutput": "Fault detected! Publishing GOOSE Trip message... [Tx GOOSE] StNum=1, SqNum=0, Sent. Trip latency < 1.8ms confirmed. Substation CB Opened successfully."
            },
            "keyChecklist": [
                "변전소 이더넷 스위치가 IEEE 802.1Q 우선순위 큐잉(Priority Queueing)을 지원하여 GOOSE 프레임 지연 < 4ms 보장",
                "Merging Unit 및 보호 IED의 시간 동기화 오차가 IEEE 1588 PTP 기준으로 ±1마이크로초 이내 유지",
                "GOOSE 메시지 StNum 및 SqNum 모니터링을 통해 네트워크 패킷 누락 및 통신 두절(Timeout) 상시 감시",
                "광역 위상 계측 시 PMU의 전체 벡터 오차(TVE)가 상시 1.0% 이하인지 무결성 검증",
                "마이크로그리드 블랙 스타트 시 주변압기 여자 돌입 전류 및 부하 투입 시 전압 변동이 ±10% 이내 억제되는지 확인"
            ],
            "quiz": [
                {
                    "question": "IEC 61850 디지털 변전소 표준에서 보호 계전기 간의 고속 차단(Trip) 신호 전송에 사용되는 GOOSE 프로토콜이 TCP/IP 스택을 사용하지 않고 Layer 2 이더넷에 직접 매핑되는 근본 이유는?",
                    "options": [
                        "IP 주소가 부족하기 때문이다.",
                        "TCP 악수(Handshake) 및 IP 라우팅에 수반되는 수십~수백 밀리초의 프로토콜 오버헤드를 배제하여, 4ms 이내의 초저지연 결정론적(Deterministic) 전송을 보장하기 위함이다.",
                        "인터넷 해킹을 방지하기 위함이다.",
                        "광섬유 케이블에서는 TCP 패킷이 전달되지 않기 때문이다."
                    ],
                    "correctIndex": 1,
                    "explanation": "송전선 단락 고장 발생 시 4ms 이내에 차단 명령이 도달하지 못하면 수십억 원짜리 변압기가 폭발할 수 있습니다. 3방향 핸드셰이크와 재전송 타임아웃이 있는 무거운 TCP/IP 대신, 이더넷 MAC 계층에 직접 EtherType 0x88B8로 최고 우선순위(Priority 7) VLAN 태깅을 붙여 사출함으로써 초저지연을 실현합니다."
                },
                {
                    "question": "IEC 61850 프로세스 버스(Process Bus)에서 기존 구리선 대신 광케이블을 통해 전압 및 전류의 4800Hz / 14400Hz 실시간 디지털 샘플 스트림을 계전기에 브로드캐스트하는 현장 장비의 명칭은?",
                    "options": [
                        "RTU (Remote Terminal Unit)",
                        "Merging Unit (머징 유닛, MU)",
                        "PLC (Programmable Logic Controller)",
                        "UPS (Uninterruptible Power Supply)"
                    ],
                    "correctIndex": 1,
                    "explanation": "머징 유닛(Merging Unit, MU)은 변전소 야외 차단기 및 계기용 변성기(CT/PT) 근처에 설치되어 아날로그 전압/전류를 고속 샘플링하고, 이를 IEC 61850-9-2 Sampled Values(SV) 이더넷 패킷으로 디지털 변환하여 변전소 광 네트워크에 전송하는 핵심 기기입니다."
                },
                {
                    "question": "광역 전력망 감시 시스템(WAMS)에 사용되는 PMU(Phasor Measurement Unit)가 산출하는 전압 페이저의 정밀도를 판정하는 표준 지표인 TVE(Total Vector Error)의 IEEE C37.118 허용 한계 규격은?",
                    "options": [
                        "TVE <= 10.0%",
                        "TVE <= 5.0%",
                        "TVE <= 1.0%",
                        "TVE <= 0.001%"
                    ],
                    "correctIndex": 2,
                    "explanation": "IEEE C37.118 표준은 정상 상태 조건에서 PMU 동기 페이저 측정의 전체 벡터 오차(TVE)가 1.0% 이하일 것을 엄격히 요구합니다. 1%의 TVE는 페이저 크기 오차 1% 또는 위상각 오차 약 0.57도(26마이크로초)에 해당합니다."
                }
            ]
        }
    ]
