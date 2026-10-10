import json
import os
import sys

# Ensure generator modules are importable
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from curriculum_vlsi import get_vlsi_modules
from curriculum_embedded import get_embedded_modules
from curriculum_power import get_power_modules

def main():
    root_dir = os.path.abspath(os.path.join(current_dir, '..', '..'))
    roadmap_path = os.path.join(root_dir, 'courses', 'ee-comparative', 'roadmap-curriculum.json')
    comparative_path = os.path.join(root_dir, 'courses', 'ee-comparative', 'comparative-data.json')

    print(f"Building curriculum dataset for EE & ECE Comparative Roadmaps...")
    
    vlsi_modules = get_vlsi_modules()
    embedded_modules = get_embedded_modules()
    power_modules = get_power_modules()

    all_modules = vlsi_modules + embedded_modules + power_modules
    print(f"Total modules compiled: {len(all_modules)} (VLSI: {len(vlsi_modules)}, Embedded: {len(embedded_modules)}, Power: {len(power_modules)})")
    assert len(all_modules) >= 13, f"Expected at least 13 modules, got {len(all_modules)}"

    curriculum_data = {
        "title": "전기·전자공학 첨단 로드맵 통합 학습 커리큘럼",
        "titleEn": "Advanced EE & ECE Roadmap In-Depth Engineering Curriculum",
        "version": "1.0.0",
        "lastUpdated": "2026-10-10",
        "tracks": [
            {
                "id": "vlsi",
                "titleKo": "반도체 VLSI 전주기 로드맵 (4단계)",
                "titleEn": "Semiconductor VLSI Lifecycle Roadmap",
                "descriptionKo": "프론트엔드 RTL 설계 및 UVM 기능 검증부터 물리적 P&R 타이밍 수렴, High-NA 0.55 EUV 팹 8대 공정 및 2.5D/3D 첨단 패키징·ATE 테스트까지의 전주기 엔지니어링",
                "modulesCount": 4
            },
            {
                "id": "embedded",
                "titleKo": "임베디드 하드웨어·저수준 펌웨어 5대 기둥",
                "titleEn": "Embedded HW & Low-Level FW 5 Core Pillars",
                "descriptionKo": "Cortex-M 마이크로컨트롤러 SoC 아키텍처, 선점형 실시간 운영체제(FreeRTOS), CAN-FD/SPI/I2C 통신 버스, IEEE 1149.1 JTAG/ETM 온칩 디버깅, 고신뢰성 다층 PCB SI/PI 무결성",
                "modulesCount": 5
            },
            {
                "id": "power",
                "titleKo": "차세대 전력망 및 신재생 에너지 4단계",
                "titleEn": "Next-Gen Power Grid & Energy Systems Roadmap",
                "descriptionKo": "뉴턴-랩슨 대규모 전력 조류 계산, 대칭 좌표법 기반 1선 지락 및 대칭 단락 고장 해석, 3상 계통연계형 인버터 dq 제어 및 LCL 필터, IEC 61850 디지털 변전소 및 PMU 광역 감시망",
                "modulesCount": 4
            }
        ],
        "modules": all_modules
    }

    # Write roadmap-curriculum.json
    with open(roadmap_path, 'w', encoding='utf-8') as f:
        json.dump(curriculum_data, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved {roadmap_path} ({os.path.getsize(roadmap_path) / 1024:.1f} KB)")

    # Update comparative-data.json
    print(f"Updating comparative-data.json with references and power grid roadmap...")
    with open(comparative_path, 'r', encoding='utf-8') as f:
        comp_data = json.load(f)

    # 1. Update VLSI Roadmap stages
    vlsi_map = {m['stageId']: m for m in vlsi_modules}
    for stage in comp_data.get('vlsiRoadmap', []):
        s_id = stage.get('stageId')
        if s_id in vlsi_map:
            m = vlsi_map[s_id]
            stage['curriculumModuleId'] = m['id']
            stage['curriculumSummary'] = m['overview']
            stage['curriculumLabTitle'] = m['practicalLab']['labTitle']
            stage['curriculumObjectives'] = m['learningObjectives']

    # 2. Update Embedded Stack pillars
    embedded_map = {m['pillarId']: m for m in embedded_modules}
    for pillar in comp_data.get('embeddedStack', []):
        p_id = pillar.get('pillarId')
        if p_id in embedded_map:
            m = embedded_map[p_id]
            pillar['curriculumModuleId'] = m['id']
            pillar['curriculumSummary'] = m['overview']
            pillar['curriculumLabTitle'] = m['practicalLab']['labTitle']
            pillar['curriculumObjectives'] = m['learningObjectives']

    # 3. Add Power Grid Roadmap
    power_map = {m['stageId']: m for m in power_modules}
    power_grid_roadmap = [
        {
            "stageId": "stage-1-power-flow-grid",
            "order": 1,
            "titleKo": "전력 조류 계산 및 계통 해석 (Power Flow & Grid Analysis)",
            "titleEn": "Power Flow & Grid Analysis",
            "roleDefinition": "대규모 복합 전력망의 정상 상태 운용 전압, 전류 및 전력 조류를 해석하기 위해 비선형 전력 방정식을 정식화하고 뉴턴-랩슨법으로 해를 도출하는 계통 계획 및 운용 엔지니어링 과정",
            "keyCareerProfiles": [
                "전력계통 해석 엔지니어 (Power Systems Analysis Engineer)",
                "EMS/SCADA 계통 운영관제사 (Grid Operations Specialist)",
                "송전망 확장 계획 연구원 (Transmission Planning Researcher)",
                "계통 해석 소프트웨어 개발자 (Power Flow Solver Developer)"
            ],
            "requiredCompetencies": [
                "모선 어드미턴스 행렬(Y_bus) 구축 및 희소 행렬 연산 능력",
                "Slack, PV, PQ 모선 분류 및 비선형 전력 불일치량 계산",
                "자코비안(Jacobian) 행렬 구성 및 뉴턴-랩슨 수치해석 구현",
                "발전기 무효전력(Q-Limit) 한계 위반 시 모선 전환 제어 기법"
            ],
            "industryStandardToolchain": [
                "PSS/E (Siemens Power System Simulator for Engineering)",
                "ETAP (Electrical Transient Analyzer Program)",
                "MATPOWER / pandapower (Python/MATLAB Grid Solvers)",
                "DIgSILENT PowerFactory"
            ],
            "stepByStepWorkflow": [
                "1. 송전선로 파이 등가 파라미터 및 변압기 탭비 데이터 취합",
                "2. 대규모 모선 어드미턴스 행렬 Y_bus 토폴로지 구축",
                "3. Slack, PV, PQ 모선 초기 추정값 설정 (Flat Start: 1.0 p.u., 0도)",
                "4. 전력 불일치 벡터 및 자코비안 편미분 행렬 계산",
                "5. LU 분해를 통한 모선 전압 크기/위상각 갱신 및 2차 수렴 판정",
                "6. 선로 조류 및 과부하 마진(MVA Thermal Rating) 사인오프"
            ],
            "coreMathAndPhysicsFormulas": [
                "모선 전력 조류 방정식: P_i = |V_i| sum |V_k| (G_ik cos theta_ik + B_ik sin theta_ik)",
                "자코비안 행렬 연립방정식: [Delta P, Delta Q]^T = J * [Delta delta, Delta |V|/|V|]^T"
            ],
            "signoffMetricsAndKPIs": [
                "최대 전력 불일치량(Mismatch) < 1.0e-5 p.u. 이내 수렴",
                "모든 모선 전압 프로파일이 정격의 0.95 ~ 1.05 p.u. 유지",
                "모든 송전선로 용량 점유율 80% 이하 (N-1 상정고장 안전율 확보)"
            ],
            "modernIndustryPractices": "재생에너지 변동성에 대응하기 위해 정적 조류 계산을 넘어 초당 수십 회의 준동적(Quasi-Dynamic) 시계열 조류 해석과 DC 최적 조류 계산(OPF)이 계통 관제에 기본 적용되고 있습니다.",
            "curriculumModuleId": "power-stage-1-flow",
            "curriculumSummary": power_map["stage-1-power-flow-grid"]["overview"],
            "curriculumLabTitle": power_map["stage-1-power-flow-grid"]["practicalLab"]["labTitle"],
            "curriculumObjectives": power_map["stage-1-power-flow-grid"]["learningObjectives"]
        },
        {
            "stageId": "stage-2-faults-protection",
            "order": 2,
            "titleKo": "대칭 좌표법 및 전력 보호 계전 시스템 (Symmetrical Faults & Protection)",
            "titleEn": "Symmetrical Faults & Protection Systems",
            "roleDefinition": "낙뢰, 절연 파괴 등으로 발생하는 3상 대칭 단락 및 1선 지락 고장을 대칭 좌표법으로 정량 해석하고, 디지털 보호 계전기(IED)와 차단기 간의 반한시 시간 협조 및 비율 차동 보호를 설계하는 전력 보호 엔지니어링 과정",
            "keyCareerProfiles": [
                "보호 계전기 설계 엔지니어 (Protection & Control Engineer)",
                "변전소 시운전 및 계전 시험원 (Substation Relay Commissioning Engineer)",
                "고장 진단 및 사고 분석관 (Fault Analysis Specialist)",
                "전력 설비 신뢰성 평가원 (Grid Reliability Assessor)"
            ],
            "requiredCompetencies": [
                "Fortescue 대칭 좌표법(영상, 정상, 역상) 불평형 고장 해석",
                "1선 지락 고장 시 3개 대칭 회로망 직렬 결합 및 단락 전류 계산",
                "ANSI 50/51 과전류 계전기 TCC 곡선 설계 및 CTI 시간 협조 마진 확보",
                "ANSI 87 변압기 비율 차동 보호 및 2차 고조파 여자 돌입 억동 설계"
            ],
            "industryStandardToolchain": [
                "SEL-5030 AcSELerator QuickSet (Schweitzer Engineering Labs)",
                "OMICRON Test Universe (계전기 시험 자동화 장비)",
                "ETAP Relay Coordination Module",
                "ASPEN OneLiner (고장 해석 전문 소프트웨어)"
            ],
            "stepByStepWorkflow": [
                "1. 전원, 변압기, 송전선의 정상/역상/영상 임피던스 데이터베이스 구축",
                "2. 3상 단락 및 1선 지락(SLG) 최대/최소 고장 전류 산출",
                "3. 변류기(CT) 포화 여부 및 2차 회로 부담(Burden) 검증",
                "4. 하류 및 상류 ANSI 51 과전류 계전기 픽업 및 시간 다이얼(TDS) 설정",
                "5. 상하류 협조 시간 간격(CTI >= 0.3초) TCC 곡선 시뮬레이션",
                "6. ANSI 87 비율 차동 계전기 듀얼 슬로프 및 고조파 억동 파라미터 정정"
            ],
            "coreMathAndPhysicsFormulas": [
                "Fortescue 대칭 좌표 변환: [Va, Vb, Vc]^T = A * [V0, V1, V2]^T (a = e^(j 2pi/3))",
                "1선 지락 고장 전류: I_f = 3*I_a0 = 3*E_a / (Z1 + Z2 + Z0 + 3*Zf)",
                "IEC 60255 과전류 트립 시간: t = [A / ((I/Is)^p - 1)] * TDS"
            ],
            "signoffMetricsAndKPIs": [
                "상하류 계전기간 CTI 마진 >= 0.30초 전 구간 충족",
                "1선 지락 고장 시 단락 전류 차단 시간 < 0.1초 (주보호 동작 시)",
                "변압기 여자 돌입 시험 시 2차 고조파 억동으로 인한 오트립 0건"
            ],
            "modernIndustryPractices": "디지털 변전소 IED는 종래의 유도형 원판 계전기 대신 초고속 DSP와 광통신을 채택하여 고장 파형을 초당 96샘플 이상 레코딩(COMTRADE)하고 광역 차동 계전(Line Current Differential)을 수행합니다.",
            "curriculumModuleId": "power-stage-2-faults",
            "curriculumSummary": power_map["stage-2-faults-protection"]["overview"],
            "curriculumLabTitle": power_map["stage-2-faults-protection"]["practicalLab"]["labTitle"],
            "curriculumObjectives": power_map["stage-2-faults-protection"]["learningObjectives"]
        },
        {
            "stageId": "stage-3-inverters-renewables",
            "order": 3,
            "titleKo": "전력 변환 및 신재생 인버터 공학 (Inverters & Renewable Energy)",
            "titleEn": "Inverters & Renewable Energy Systems",
            "roleDefinition": "태양광, 풍력, BESS의 직류 전력을 60Hz 대규모 전력망에 고효율·저왜곡으로 주입하기 위해 고속 스위칭 반도체(SiC/GaN), MPPT, 동기 회전 좌표계(dq) 전류 제어 및 LCL 능동 필터를 설계하는 전력전자 제어 과정",
            "keyCareerProfiles": [
                "계통연계형 인버터 펌웨어 엔지니어 (Grid-Tied Inverter FW Engineer)",
                "전력전자 하드웨어 설계자 (Power Electronics Hardware Designer)",
                "신재생 에너지 계통연계 전문가 (Renewable Interconnection Specialist)",
                "BESS 전력변환시스템(PCS) 연구원 (Energy Storage PCS Researcher)"
            ],
            "requiredCompetencies": [
                "태양전지 P-V 특성 분석 및 Incremental Conductance MPPT 알고리즘",
                "Clarke/Park 변환 및 dq 동기 회전 좌표계 비간섭 전류 제어",
                "SRF-PLL 기반 계통 전압 위상 동기화 및 역률 1.0 제어",
                "LCL 계통 필터 공진 해석 및 가상 저항 능동 감쇠(Active Damping)"
            ],
            "industryStandardToolchain": [
                "MATLAB/Simulink Simscape Electrical",
                "PLECS Standalone & Blockset",
                "TI Code Composer Studio (C2000 DSP MCU)",
                "dSPACE / RT-LAB (실시간 제어기 HIL)"
            ],
            "stepByStepWorkflow": [
                "1. 태양광 패널 P-V 및 I-V 곡선 모델링과 MPPT 제어기 설계",
                "2. 3상 2레벨/3레벨 전압형 인버터(VSI) IGBT/SiC 토폴로지 선정",
                "3. 계통연계 3차 LCL 필터 인덕턴스 및 커패시턴스 파라미터 계산",
                "4. 3상 계통 전압 추종 SRF-PLL 제어기 이득 주파수 응답 튜닝",
                "5. dq 회전 좌표계 유효/무효 전류 PI 제어 루프 및 역기전력 피드포워드 구성",
                "6. 100kW 정격 출력 시 계통 주입 전류 THD < 3% 규격 검증"
            ],
            "coreMathAndPhysicsFormulas": [
                "MPPT 증분 전도도 조건: dI/dV + I/V = 0",
                "동기 좌표계 전력: P = 1.5 * v_d * i_d,  Q = -1.5 * v_d * i_q",
                "LCL 공진 주파수: f_res = (1 / 2*pi) * sqrt((L1 + L2) / (L1 * L2 * C))"
            ],
            "signoffMetricsAndKPIs": [
                "계통 주입 전류 총 고조파 왜구율(THD) < 3.0% (IEEE 519 기준)",
                "MPPT 추종 효율 >= 99.5% (정상 상태 진동 없는 고정밀 제어)",
                "계통 이상 전압/주파수 발생 시 0.16초 이내 단독 운전 방지(Anti-Islanding) 트립"
            ],
            "modernIndustryPractices": "신재생 발전원 비중이 급증함에 따라 기존의 계통 추종형(Grid-Following) 인버터에서 계통의 주파수와 전압을 스스로 형성하고 가상 관성(Virtual Inertia)을 제공하는 계통 형성형(Grid-Forming) 인버터로 기술 패러다임이 진화하고 있습니다.",
            "curriculumModuleId": "power-stage-3-inverter",
            "curriculumSummary": power_map["stage-3-inverters-renewables"]["overview"],
            "curriculumLabTitle": power_map["stage-3-inverters-renewables"]["practicalLab"]["labTitle"],
            "curriculumObjectives": power_map["stage-3-inverters-renewables"]["learningObjectives"]
        },
        {
            "stageId": "stage-4-smart-grid-substation",
            "order": 4,
            "titleKo": "스마트 그리드 및 디지털 변전소 (Smart Grid & Digital Substation)",
            "titleEn": "Smart Grid & Digital Substation",
            "roleDefinition": "전력 계통의 실시간 통신 및 제어 자동화를 위해 IEC 61850 프로세스 버스, GOOSE 초저지연 트립 프로토콜, Sampled Values(SV) 디지털 계측 스트림, IEEE C37.118 PMU 기반 광역 위상 감시(WAMS) 및 마이크로그리드 블랙 스타트를 구축하는 미래 전력망 통신 융합 과정",
            "keyCareerProfiles": [
                "디지털 변전소 자동화 엔지니어 (Substation Automation Engineer)",
                "스마트그리드 통신 프로토콜 설계자 (Smart Grid Communication Architect)",
                "WAMS 광역 전력망 감시원 (Wide-Area Monitoring Specialist)",
                "마이크로그리드 제어 시스템 연구원 (Microgrid Control System Researcher)"
            ],
            "requiredCompetencies": [
                "IEC 61850-8-1 (MMS/GOOSE) 및 IEC 61850-9-2 (Sampled Values) 프레임 구조",
                "EtherType 0x88B8 / 0x88BA 및 IEEE 802.1Q VLAN 우선순위 태깅",
                "IEEE 1588 PTP / IRIG-B 기반 서브 마이크로초 정밀 시각 동기화",
                "IEEE C37.118 싱크로페이저(PMU) 전체 벡터 오차(TVE < 1%) 검증"
            ],
            "industryStandardToolchain": [
                "Wireshark (IEC 61850 GOOSE/SV Packet Dissectors)",
                "Open61850 / libIEC61850 (Open-Source Protocol Stacks)",
                "Siemens SICAM PAS / ABB MicroSCADA",
                "Qualitrol / Arbiter Systems PMU Calibrators"
            ],
            "stepByStepWorkflow": [
                "1. 변전소 통신 아키텍처(Process Bus 및 Station Bus) 토폴로지 설계",
                "2. Merging Unit(MU)을 통한 4800Hz / 14400Hz SV 아날로그 샘플 광패킷 스트리밍",
                "3. IED 보호 차단 연동을 위한 GOOSE 데이터셋(DataSet) 및 통신 제어 블록(GoCB) 정의",
                "4. 고장 신호 발생 시 StNum 증분 및 4ms 이내 차단 명령 수신 지연 검증",
                "5. GPS 연동 PMU를 설치하여 대륙간 동기 페이저 수집 및 TVE < 1% 확인",
                "6. 광역 정전 모의 시 BESS 드룹 제어 기반 단독 마이크로그리드 블랙 스타트 완결"
            ],
            "coreMathAndPhysicsFormulas": [
                "PMU 동기 페이저 전체 벡터 오차: TVE = sqrt(((Xr - Xhat_r)^2 + (Xi - Xhat_i)^2) / (Xr^2 + Xi^2)) <= 1.0%",
                "GOOSE 버스트 지수 백오프 재전송: T_k = min(T_min * 2^k, T_max) (T_min = 2ms, T_max = 4s)"
            ],
            "signoffMetricsAndKPIs": [
                "GOOSE 트립 메시지 전송 지연 시간 < 3.0ms (IEC 61850 Type 1A Class P2/3 규격)",
                "Sampled Values(SV) 패킷 손실률 0.000% (PRP/HSR 무중단 이중화 통신 보증)",
                "변전소 전체 시각 동기 오차 < 1.0 마이크로초 (IEEE 1588 PTP Power Profile)"
            ],
            "modernIndustryPractices": "변전소 내부의 물리적 케이블을 90% 이상 제거한 완전 디지털 변전소는 IEC 62439-3 PRP(병렬 이중화 프로토콜)와 HSR(고가용성 원형 링 프로토콜)을 적용하여 단 하나의 패킷 손실 없는 제로 지연 스위칭 통신망을 구축하고 있습니다.",
            "curriculumModuleId": "power-stage-4-smartgrid",
            "curriculumSummary": power_map["stage-4-smart-grid-substation"]["overview"],
            "curriculumLabTitle": power_map["stage-4-smart-grid-substation"]["practicalLab"]["labTitle"],
            "curriculumObjectives": power_map["stage-4-smart-grid-substation"]["learningObjectives"]
        }
    ]

    comp_data['powerGridRoadmap'] = power_grid_roadmap

    with open(comparative_path, 'w', encoding='utf-8') as f:
        json.dump(comp_data, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved updated {comparative_path} ({os.path.getsize(comparative_path) / 1024:.1f} KB)")

    print("\nVerifying JSON files integrity...")
    with open(roadmap_path, 'r', encoding='utf-8') as f:
        d1 = json.load(f)
        assert len(d1['modules']) == 13
        print(f"✓ roadmap-curriculum.json verified! 13 modules loaded.")

    with open(comparative_path, 'r', encoding='utf-8') as f:
        d2 = json.load(f)
        assert 'vlsiRoadmap' in d2 and len(d2['vlsiRoadmap']) == 4
        assert 'embeddedStack' in d2 and len(d2['embeddedStack']) == 5
        assert 'powerGridRoadmap' in d2 and len(d2['powerGridRoadmap']) == 4
        print(f"✓ comparative-data.json verified! vlsi: 4, embedded: 5, power: 4 stages.")

if __name__ == '__main__':
    main()
