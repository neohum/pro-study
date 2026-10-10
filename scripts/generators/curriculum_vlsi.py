"""
VLSI Curriculum Modules (Stages 1 to 4)
Stage 1: Frontend RTL Design & Functional Verification
Stage 2: Backend Physical Design & Timing Closure
Stage 3: Advanced Fab 8-Step Semiconductor Manufacturing Process
Stage 4: Advanced Packaging & ATE Test Engineering
"""

def get_vlsi_modules():
    return [
        {
            "id": "vlsi-stage-1-rtl",
            "order": 1,
            "track": "vlsi",
            "stageId": "stage-1-frontend-rtl",
            "stageNumber": 1,
            "titleKo": "프론트엔드 디지털/RTL 설계 및 기능 검증",
            "titleEn": "Frontend RTL Design & Functional Verification",
            "category": "VLSI Logic Design & Verification",
            "overview": "현대 초미세 SoC 및 고성능 프로세서의 마이크로아키텍처를 정의하고, SystemVerilog를 이용한 합성 가능한 RTL(Register-Transfer Level) 구현 및 UVM(Universal Verification Methodology) 기반의 객체지향 기능 검증 환경을 구축하는 프론트엔드 핵심 엔지니어링 과정입니다. 유한상태머신(FSM) 설계, 파이프라인 해저드 해결, 이종 클록 도메인 교차(CDC) 메타안정성 방지, UVM Driver/Monitor/Scoreboard 기반 100% 기능 커버리지 달성을 심층적으로 다룹니다.",
            "learningObjectives": [
                "무어(Moore)와 밀리(Mealy) FSM의 글리치 특성 및 타이밍 마진을 분석하고 3-항 프로세스 안전 FSM을 설계할 수 있다.",
                "RISC 파이프라인의 구조적(Structural), 데이터(RAW/WAR/WAW), 제어(Control) 해저드를 포워딩 및 분기 예측 기법으로 해결할 수 있다.",
                "이종 클록 도메인 간 신호 전송 시 2-FF 동기화기 및 그레이 코드(Gray Code) 비동기 FIFO 구조를 구현하고 MTBF를 수학적으로 계산할 수 있다.",
                "UVM 테스트벤치 아키텍처(Driver, Monitor, Sequencer, Scoreboard, Functional Coverage)를 구축하여 완벽한 검증 폐루프를 완성할 수 있다."
            ],
            "prerequisites": [
                "디지털 논리회로 (불 대수, 카르노 맵, 조합논리 및 순차논리 회로)",
                "컴퓨터 구조론 (파이프라인 데이터패스, 레지스터 파일, 캐시 메모리 구조)",
                "기본 Verilog HDL 문법 및 합성/시뮬레이션 개념"
            ],
            "deepTheory": {
                "fsmDesign": {
                    "title": "안전 FSM 아키텍처: Moore vs Mealy 및 글리치 억제",
                    "explanation": "FSM은 디지털 제어부의 핵심입니다. 무어 머신(Moore Machine)은 출력이 오직 현재 상태(Current State)에만 의존하므로 입력 신호의 조합 글리치(Combinational Glitch)가 출력으로 전파되지 않아 타이밍 클로저에 유리합니다. 반면 밀리 머신(Mealy Machine)은 출력이 현재 상태와 현재 입력 모두에 의존하여 상태 수를 줄일 수 있으나, 입력 핀의 노이즈와 글리치가 그대로 출력으로 노출되는 취약점이 있습니다. 실무에서는 상태 레지스터, 다음 상태 결정 로직, 출력 로직을 엄격히 분리하는 3-Always 블록 구조 또는 출력 플립플롭을 둔 등록된 출력(Registered Output) 아키텍처를 표준으로 채택합니다."
                },
                "pipelineHazards": {
                    "title": "파이프라인 해저드 해결: 포워딩, 스톨링 및 분기 예측",
                    "explanation": "5단계 파이프라인(IF-ID-EX-MEM-WB)에서 발생하는 3대 해저드는 다음과 같이 해결합니다: 1) 구조적 해저드(Structural): 하버드 아키텍처(명령어/데이터 캐시 분리) 및 듀얼 포트 레지스터 파일 적용; 2) 데이터 해저드(RAW: Read-After-Write): EX-to-EX, MEM-to-EX 포워딩 유닛(Bypassing)을 구성하여 연산 결과를 즉시 전달하고, 로드-사용(Load-Use) 딜레이는 1사이클 하드웨어 인터록(Pipeline Stall)으로 억제; 3) 제어 해저드(Control): 2비트 포화 카운터(Saturating Counter) 및 분기 타깃 버퍼(BTB) 기반 동적 분기 예측을 통해 파이프라인 플러시(Flush) 페널티를 최소화합니다."
                },
                "cdcMechanisms": {
                    "title": "클록 도메인 교차(CDC) 및 메타안정성 억제 기법",
                    "explanation": "서로 다른 비동기 클록 도메인(tx_clk -> rx_clk) 간 단일 비트 신호 전송 시 셋업/홀드 타임 위반으로 플립플롭이 0도 1도 아닌 중간 전압 상태에 머무는 메타안정성(Metastability)이 발생합니다. 단일 제어 신호는 직렬 연결된 2단계 D-플립플롭(2-FF Synchronizer)을 배치하여 메타안정성 회복 시간(t_r)을 확보합니다. 다중 비트 데이터 버스는 비트 간 스큐(Skew)로 인해 동기화기가 오동작하므로, 인접 코드 간 1비트만 변경되는 그레이 코드(Gray-code) 카운터 기반의 비동기 듀얼 클록 FIFO(Asynchronous Dual-Clock FIFO)를 설계하여 안전한 포인터 교차를 보장해야 합니다."
                },
                "systemVerilogInterfaces": {
                    "title": "SystemVerilog Interface & Modport를 활용한 모듈 인터커넥트",
                    "explanation": "신호선 수십 개를 개별 포트로 연결할 때 발생하는 배선 오류를 원천 차단하기 위해, 공통 신호 번들을 캡슐화한 SystemVerilog Interface를 정의합니다. Master/Slave 관점에 따라 modport(입출력 방향 지정)와 clocking block(셋업/홀드 스큐 샘플링 보장)을 정의하여 레이스 컨디션(Race Condition)을 제거합니다."
                }
            },
            "equations": [
                {
                    "name": "CDC 플립플롭 메타안정성 MTBF (Mean Time Between Failures)",
                    "latex": "\\text{MTBF} = \\frac{e^{t_r / \\tau}}{T_0 \\cdot f_{\\text{clk}} \\cdot f_{\\text{data}}}",
                    "variables": {
                        "t_r": "동기화 플립플롭의 메타안정성 회복 가용 시간 (Resolving Time: 클록 주기 - 셋업 타임)",
                        "\\tau": "플립플롭 내부 재생 래치 피드백 시정수 (Technology dependent time constant)",
                        "T_0": "공정 기술에 의존하는 메타안정성 창 크기 (Aperture parameter)",
                        "f_{\\text{clk}}": "신호를 수신하는 수신측 도메인의 클록 주파수 (Hz)",
                        "f_{\\text{data}}": "클록 경계를 가로질러 전송되는 비동기 데이터 천이율 (Hz)"
                    },
                    "physicalMeaning": "수신 클록 주파수 및 데이터 천이 속도가 빠를수록 고장률이 선형 증가하며, 가용 회복 시간(t_r)이 시정수(\\tau) 대비 지수함수적으로 증가할 때 시스템의 평균 무고장 시간(MTBF)이 극대화됨을 입증합니다.",
                    "derivationNotes": "바이스테이블 인버터 루프의 소신호 지수 증폭 모델 $V(t) = V_0 \\cdot e^{t/\\tau}$에서 전압이 유효 논리 레벨에 도달할 확률을 적분하여 유도됩니다."
                },
                {
                    "name": "합성 타이밍 제약 (SDC 클록 주기 제약 조건)",
                    "latex": "T_{\\text{cycle}} \\ge T_{\\text{clk-q}} + T_{\\text{comb}} + T_{\\text{setup}} + T_{\\text{skew}} + T_{\\text{jitter}}",
                    "variables": {
                        "T_{\\text{cycle}}": "설계 목표 클록 주기 (1 / f_clk)",
                        "T_{\\text{clk-q}}": "송신 플립플롭의 Clock-to-Q 전파 지연",
                        "T_{\\text{comb}}": "플립플롭 사이의 조합 논리 패스 최대 전파 지연 (Critical Path)",
                        "T_{\\text{setup}}": "수신 플립플롭의 데이터 셋업 타임",
                        "T_{\\text{skew}}": "송신/수신 클록 트리 간의 최대 스큐 마진",
                        "T_{\\text{jitter}}": "PLL 클록 소스의 사이클-투-사이클 지터 성분"
                    },
                    "physicalMeaning": "디지털 순차 회로가 클록 엣지에서 데이터를 유효하게 캡처하기 위해 보장되어야 하는 최소 주기 한계선이며, 정적 타이밍 분석(STA) 셋업 클로저의 기초 방정식입니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "UVM Industry Standard Verification Architecture",
                "components": [
                    {
                        "name": "UVM Sequencer & Sequence Item",
                        "role": "검증 트랜잭션 패킷(Address, Data, Opcode, Error Injection 플래그)을 난수 제약(Random Constraint)과 함께 생성하여 드라이버에 스트리밍"
                    },
                    {
                        "name": "UVM Driver",
                        "role": "TLM(Transaction Level Modeling) 트랜잭션을 핀 레벨 신호(Pin-level signal) 프로토콜(예: AXI4, APB, Wishbone)로 변환하여 DUT 인터페이스 구동"
                    },
                    {
                        "name": "UVM Monitor",
                        "role": "DUT 인터페이스 버스를 패시브(Passive) 모니터링하여 핀 토글 신호를 관찰하고 정규 트랜잭션으로 역직렬화하여 분석 포트(Analysis Port)로 브로드캐스트"
                    },
                    {
                        "name": "UVM Scoreboard & Golden Reference Model",
                        "role": "소프트웨어 C++ 또는 SystemVerilog 기반 황금 모델(Golden Model)을 탑재하여 DUT 출력 트랜잭션과 실시간 비교 대조 검증"
                    },
                    {
                        "name": "Functional Coverage",
                        "role": "Covergroup, Coverpoint, Cross Coverage를 구성하여 사양서의 모든 코너 케이스(Boundary, Overflow, Hazard Stalls)가 100% 자극되었는지 계측"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "8-bit Pipelined RISC Processor RTL Implementation & UVM Testbench",
                "objective": "하버드 구조 기반 3단계 파이프라인 8비트 RISC 코어 RTL을 작성하고, UVM 테스트벤치 환경에서 데이터 포워딩 및 분기 예측 동작을 자동화 검증한다.",
                "targetPlatformAndTools": "Synopsys VCS / Cadence Xcelium / Icarus Verilog + Verilator, Synopsys DVE/Verdi 파형 분석기",
                "stepByStepGuide": [
                    "Step 1: 8비트 ALU(ADD, SUB, AND, OR, XOR, SHL, SHR) 및 8워드 레지스터 파일(R0-R7) RTL 작성",
                    "Step 2: IF/ID 및 ID/EX 파이프라인 레지스터 설계 및 Hazard Detection/Forwarding 유닛 구현",
                    "Step 3: SystemVerilog Virtual Interface 및 Transaction(risc_seq_item) 클래스 정의",
                    "Step 4: UVM Driver, Monitor, Golden Model 기반 Scoreboard 클래스 구현 및 연결",
                    "Step 5: 10,000회 무작위 명령어 시퀀스 인젝션 및 100% 기능 커버리지(Cross Coverage) 수렴 확인"
                ],
                "codeSnippet": "// SystemVerilog 8-bit Pipelined ALU with Forwarding\nmodule risc_alu (\n    input  logic [7:0] a, b,\n    input  logic [2:0] opcode,\n    output logic [7:0] alu_out,\n    output logic       zero_flag\n);\n    always_comb begin\n        case (opcode)\n            3'b000: alu_out = a + b;         // ADD\n            3'b001: alu_out = a - b;         // SUB\n            3'b010: alu_out = a & b;         // AND\n            3'b011: alu_out = a | b;         // OR\n            3'b100: alu_out = a ^ b;         // XOR\n            3'b101: alu_out = a << b[2:0];   // SLL\n            3'b110: alu_out = a >> b[2:0];   // SRL\n            default: alu_out = 8'h00;\n        endcase\n    end\n    assign zero_flag = (alu_out == 8'h00);\nendmodule\n\n// Dual-FF Synchronizer for CDC control\nmodule cdc_2ff_sync (\n    input  logic dest_clk,\n    input  logic dest_rst_n,\n    input  logic async_in,\n    output logic sync_out\n);\n    (* ASYNC_REG = \"TRUE\" *) logic sync_ff1, sync_ff2;\n    always_ff @(posedge dest_clk or negedge dest_rst_n) begin\n        if (!dest_rst_n) begin\n            sync_ff1 <= 1'b0;\n            sync_ff2 <= 1'b0;\n        end else begin\n            sync_ff1 <= async_in;\n            sync_ff2 <= sync_ff1;\n        end\n    end\n    assign sync_out = sync_ff2;\nendmodule",
                "expectedOutput": "UVM_INFO @ 4520ns: [SCOREBOARD] 10000/10000 Instructions Verified with Zero Mismatches. Branch Forwarding Coverage = 100.0%, ALU Corner Case Coverage = 100.0%."
            },
            "keyChecklist": [
                "조합논리 루프(Combinational Feedback Loop) 및 의도치 않은 래치(Inferred Latch) 미발생 검증 (SpyGlass LINT 0 Errors)",
                "모든 클록 도메인 교차 지점에 2-FF 동기화기 또는 비동기 FIFO 핸드셰이크 프로토콜 적용 확인",
                "FSM 상태 인코딩(One-Hot vs Gray)이 타이밍 마진 및 글리치 억제 사양을 만족하는지 확인",
                "모든 파이프라인 바이패스(Forwarding) 경로의 데이터 충돌 시뮬레이션 케이스 통과",
                "UVM 기능 커버리지(Functional Coverage) 및 코드 커버리지(Line, Branch, Toggle) 100% 사인오프"
            ],
            "quiz": [
                {
                    "question": "FSM 설계 시 무어(Moore) 머신 대비 밀리(Mealy) 머신이 갖는 주된 구조적 특징과 잠재적 위험은 무엇인가?",
                    "options": [
                        "밀리 머신은 출력이 현재 상태에만 종속되므로 하드웨어 면적이 커진다.",
                        "밀리 머신은 출력이 입력 신호에 직접 종속되므로 조합논리 입력의 글리치가 출력으로 전파될 위험이 있다.",
                        "밀리 머신은 클록 엣지에서만 출력이 갱신되므로 셋업 타임 마진이 항상 무어 머신보다 넓다.",
                        "밀리 머신은 비동기 리셋을 지원하지 않아 전원 인가 시 초기 상태 진입이 불가능하다."
                    ],
                    "correctIndex": 1,
                    "explanation": "밀리 머신의 출력은 '현재 상태'와 '현재 입력'의 조합논리 함수입니다. 따라서 입력 신호에 노이즈나 글리치가 발생하면 이것이 즉시 출력 신호로 전파되어 후속 회로에서 타이밍 위반이나 오작동을 유발할 위험이 큽니다. 반면 상태 수가 적어 회로가 간소해질 수 있는 장점이 있습니다."
                },
                {
                    "question": "이종 클록 도메인(CDC) 간 32비트 데이터 버스를 안전하게 전송하기 위한 가장 적합한 기법은?",
                    "options": [
                        "각 32비트 데이터 비트선마다 각각 독립된 2-FF 동기화기를 장착한다.",
                        "전송측 클록의 주파수를 2배 높여 오버샘플링한다.",
                        "그레이 코드(Gray Code) 포인터로 제어되는 비동기 이중 포트 FIFO(Asynchronous FIFO)를 사용한다.",
                        "데이터 버스 라인에 풀업 저항을 연결하여 신호 안정성을 확보한다."
                    ],
                    "correctIndex": 2,
                    "explanation": "다중 비트 버스의 각 비트에 2-FF 동기화기를 개별 적용하면 비트 라인 간 라우팅 스큐와 메타안정성 지연 차이로 인해 수신단에서 중간의 엉뚱한 과도기 데이터(Bus Coherency 깨짐)를 캡처하게 됩니다. 따라서 그레이 코드(인접 전이 시 1비트만 변경) 기반 포인터를 2-FF 동기화하는 비동기 FIFO 구조가 필수 표준입니다."
                },
                {
                    "question": "UVM 테스트벤치 아키텍처에서 인터페이스 핀의 전압 변화를 패시브하게 관찰하여 트랜잭션 객체로 변환하는 컴포넌트는?",
                    "options": [
                        "UVM Sequencer",
                        "UVM Driver",
                        "UVM Monitor",
                        "UVM Agent"
                    ],
                    "correctIndex": 2,
                    "explanation": "UVM Monitor는 버스 인터페이스 핀을 읽기 전용(Passive)으로 샘플링하여 핀 레벨의 파형을 추상화된 트랜잭션(Sequence Item) 객체로 복원한 뒤, Analysis Port를 통해 Scoreboard와 Coverage Collector에 전달하는 역할을 수행합니다."
                }
            ]
        },
        {
            "id": "vlsi-stage-2-pd",
            "order": 2,
            "track": "vlsi",
            "stageId": "stage-2-backend-pd",
            "stageNumber": 2,
            "titleKo": "백엔드 물리 설계 및 타이밍 수렴 (P&R / Physical Design)",
            "titleEn": "Backend Physical Design & Timing Closure",
            "category": "Physical Implementation & Signoff",
            "overview": "합성된 게이트 레벨 네트리스트(Gate-level Netlist)를 실제 실리콘 다이(Die)의 2차원/3차원 기하학적 레이아웃으로 변환하고, 1GHz 이상의 초고주파에서 정적 타이밍 분석(STA), 전력 무결성(IR-drop), 신뢰성(EM, DFM)을 만족하며 테이프아웃(Tapeout)을 달성하는 백엔드 전주기 과정입니다. 플로어플래닝, 전력 격자망, 글로벌/디테일 배치, 클록 트리 합성(CTS), 라우팅 및 타이밍 에코(ECO) 기법을 심층적으로 다룹니다.",
            "learningObjectives": [
                "코어-다이 마진, I/O 패드 및 아날로그/메모리 매크로 배치를 최적화하고 헤일로(Halo)와 킵아웃(Keepout) 영역을 설정할 수 있다.",
                "정적/동적 IR-드롭 및 일렉트로마이그레이션(EM)을 방지하는 다층 전력 분배망(Power Mesh)을 설계할 수 있다.",
                "H-트리 및 멀티 소스 클록 트리 합성(CTS)을 통해 클록 스큐(Skew)와 지터(Jitter)를 수십 피코초 이내로 수렴시킬 수 있다.",
                "셋업 및 홀드 타임 슬랙 방정식을 기반으로 프라임타임(PrimeTime) 타이밍 위반 패스를 분석하고 버퍼 삽입/사이징 ECO를 실행할 수 있다."
            ],
            "prerequisites": [
                "CMOS 반도체 소자 물성 및 인버터 지연 모델(RC 지연, Elmore Delay)",
                "정적 타이밍 분석 기초 (Setup/Hold Time, Clock Uncertainty, False Path)",
                "VLSI 프론트엔드 네트리스트 및 SDC(Synopsys Design Constraints) 제약 조건"
            ],
            "deepTheory": {
                "floorplanningAndPowerMesh": {
                    "title": "플로어플래닝 및 전력망(Power Grid) 설계",
                    "explanation": "플로어플래닝은 전체 칩의 면적, 가로세로비(Aspect Ratio), I/O 핀 위치 및 대형 SRAM 매크로의 배치를 결정하는 단계입니다. 매크로 주위에는 배선 혼잡(Congestion)을 피하기 위한 라우팅 헤일로(Keepout Halo)를 부여합니다. 전력 분배망(PDN)은 상위 두꺼운 금속 배선(예: M8, M9)을 통해 VDD와 VSS 격자(Mesh)를 촘촘히 구축하여 $IR$ 전압 강하가 공급 전압의 2~3%를 넘지 않도록 통제하며, Black의 방정식에 따른 전류 밀도 한계를 충족하여 일렉트로마이그레이션(Electromigration: 금속 원자가 전자의 운동량 전달로 인해 이동하여 단선/단락을 유발하는 현상)을 억제합니다."
                },
                "placementAndCongestion": {
                    "title": "배치(Placement) 최적화 및 배선 혼잡 완화",
                    "explanation": "글로벌 배치(Global Placement)는 셀 간 연결 길이(Wirelength)와 타이밍을 최소화하도록 표준 셀(Standard Cell)의 대략적 좌표를 계산하고, 디테일 배치(Detailed Placement)는 셀들이 전력 레일 상에 겹침 없이 합법적(Legalized)으로 안착되도록 정렬합니다. 핀 밀도가 과도하게 높은 구역은 글로벌 라우터가 배선 트랙을 확보하지 못해 DRC 에러가 발생하므로, 부분 밀도 제한(Partial Density Limit)이나 셀 패딩(Cell Padding)을 부여하여 배선 혼잡도를 분산시킵니다."
                },
                "clockTreeSynthesis": {
                    "title": "클록 트리 합성(CTS) 아키텍처: H-Tree vs Clock Mesh",
                    "explanation": "클록은 칩 내부의 수만~수백만 개 플립플롭에 동시 도달해야 합니다. H-트리 구조는 대칭적 분기를 통해 기하학적 전파 지연을 균일하게 맞추어 스큐를 최소화합니다. 초고성능 프로세서에서는 H-트리 하단에 단락 격자망(Clock Mesh)을 연결하여 공정 변이(OCV: On-Chip Variation)에 의한 국소적 스큐를 상쇄합니다. 반면 저전력 칩에서는 불필요한 클록 토글을 차단하는 통합 클록 게이팅 셀(ICG: Integrated Clock Gating)을 최적 배치합니다."
                },
                "routingAndDfm": {
                    "title": "상세 배선(Detail Routing) 및 DFM 안테나 효과 제어",
                    "explanation": "배선은 글로벌 라우팅(글로벌 셀 단위 경로 탐색)과 디테일 라우팅(금속 트랙 단위 DRC 충족 배선)으로 진행됩니다. 초미세 공정에서는 인접 배선 간 기생 커패시턴스에 의한 크로스토크(Crosstalk) 노이즈와 딜레이 변동을 억제해야 합니다. 또한 금속 에칭(Plasma Etch) 공정 중 긴 금속선에 정전하가 축적되어 얇은 게이트 산화막을 파괴하는 안테나 효과(Antenna Effect)를 방지하기 위해, 상위 금속층으로 브리지 점퍼를 띄우거나 게이트 입력단에 안테나 다이오드(Antenna Diode)를 의무적으로 삽입합니다."
                }
            },
            "equations": [
                {
                    "name": "STA 셋업 타임 슬랙 방정식 (Setup Slack Equation)",
                    "latex": "\\text{Setup Slack} = (T_{\\text{clk}} - T_{\\text{setup}} - T_{\\text{uncertainty}}) - (T_{\\text{cq}} + T_{\\text{comb}} + T_{\\text{skew\\_setup}})",
                    "variables": {
                        "T_{\\text{clk}}": "공급 클록 주기 (Clock Period)",
                        "T_{\\text{setup}}": "수신 레지스터의 셋업 시간 요건 (Library Setup Time)",
                        "T_{\\text{uncertainty}}": "클록 지터 및 OCV 마진을 포함한 불확실성 마진",
                        "T_{\\text{cq}}": "송신 레지스터의 Clock-to-Q 전파 지연",
                        "T_{\\text{comb}}": "데이터 경로 조합논리 및 배선 RC 전파 지연",
                        "T_{\\text{skew\\_setup}}": "송신 클록 도착 시간과 수신 클록 도착 시간의 차이 (Clock Skew)"
                    },
                    "physicalMeaning": "수신 플립플롭의 셋업 타임 윈도우 전에 데이터가 도착해야 하므로, 슬랙 값이 0 이상이어야 정상 동작을 보장합니다. 음수(Negative Slack)가 발생하면 클록 주파수를 낮추거나 조합 논리 패스를 단축해야 합니다.",
                    "derivationNotes": "클록 런치 엣지(Launch Edge)와 캡처 엣지(Capture Edge) 간의 상대적 시간 축 비교에서 도출됩니다."
                },
                {
                    "name": "STA 홀드 타임 슬랙 방정식 (Hold Slack Equation)",
                    "latex": "\\text{Hold Slack} = (T_{\\text{cq}} + T_{\\text{comb}} - T_{\\text{skew\\_hold}}) - (T_{\\text{hold}} + T_{\\text{uncertainty}})",
                    "variables": {
                        "T_{\\text{hold}}": "수신 레지스터의 홀드 시간 요건",
                        "T_{\\text{skew\\_hold}}": "동일 사이클 캡처 클록과 런치 클록 간의 스큐",
                        "T_{\\text{comb}}": "데이터 경로의 최소(Min) 전파 지연"
                    },
                    "physicalMeaning": "새로운 데이터가 너무 일찍 도착하여 이전 캡처 데이터를 덮어쓰지 않도록 보장하는 조건이며, 주파수를 낮추어도 해결할 수 없는 영구적 치명 결함이므로 데이터 경로에 딜레이 버퍼를 삽입하여 홀드 바이올레이션을 반드시 제거해야 합니다."
                },
                {
                    "name": "일렉트로마이그레이션 수명 예측 (Black's Equation)",
                    "latex": "\\text{MTTF} = A \\cdot J^{-n} \\exp\\left(\\frac{E_a}{k_B T}\\right)",
                    "variables": {
                        "\\text{MTTF}": "금속 배선의 평균 고장 시간 (Mean Time to Failure)",
                        "A": "금속 단면적 및 재료 구조에 의존하는 비례 상수",
                        "J": "금속선에 흐르는 전류 밀도 (Current Density, A/cm²)",
                        "n": "전류 밀도 지수 (일반적으로 Cu의 경우 n ≈ 2)",
                        "E_a": "원자 확산 활성화 에너지 (Activation Energy, eV)",
                        "k_B": "볼츠만 상수 (8.617 × 10^-5 eV/K)",
                        "T": "금속 배선의 절대 온도 (Kelvin)"
                    },
                    "physicalMeaning": "전류 밀도가 높고 온도가 상승할수록 실리콘 금속 배선의 수명이 지수함수적으로 급감함을 보여주며, 전력망 폭 설정 시 허용 최대 전류 밀도를 규정하는 이론적 근거입니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "Static Timing Analysis & Physical Verification Flow",
                "components": [
                    {
                        "name": "Multi-Corner Multi-Mode (MCMM) STA",
                        "role": "SSG(Slow-Slow-0.75V-125C: Setup 최악 코너)와 FFG(Fast-Fast-0.95V--40C: Hold 최악 코너) 등 수십 개 PVT 코너에서 동시 타이밍 클로저 검증"
                    },
                    {
                        "name": "Design Rule Checking (DRC) & LVS",
                        "role": "최소 선폭, 이격 거리, 비아 중첩 등 수천 개 파운드리 물리 규칙 검증 및 회로도(Schematic)와 추출 레이아웃 간 1:1 토폴로지 일치(LVS) 보증"
                    },
                    {
                        "name": "Dynamic Voltage Drop & IR Signoff",
                        "role": "벡터 기반(VCD 스위칭 토글) 과도 전압 강하 분석을 통해 플립플롭 동시 천이 시 발생하는 국소 전압 강하 억제 검증"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "TSMC N5 Library based 1.2 GHz Subsystem P&R and PrimeTime Timing Closure",
                "objective": "5nm 가상 공정 라이브러리를 활용하여 1.2GHz 크립토 코어 서브시스템의 플로어플래닝, CTS, 라우팅 및 PrimeTime 기반 타이밍 ECO를 완수한다.",
                "targetPlatformAndTools": "Synopsys IC Compiler II / Cadence Innovus, Synopsys PrimeTime, Mentor Calibre",
                "stepByStepGuide": [
                    "Step 1: 다이 크기 500um x 500um, 코어 이용률 70% 지정 및 파워 링/메쉬(M7-M8) 구축",
                    "Step 2: 타이밍 구동 글로벌 및 디테일 배치 실행 및 배선 혼잡도(Hotspot < 0.5%) 확인",
                    "Step 3: 클록 트리 합성(CTS) 수행 - 최대 스큐 타깃 35ps, ICG 클록 게이팅 트리 최적화",
                    "Step 4: 나노라우트(NanoRoute) 디테일 배선 및 안테나 다이오드 삽입 DRC 클린 확인",
                    "Step 5: PrimeTime STA 분석 후 홀드 바이올레이션 패스에 DEL_X2 버퍼 자동 삽입 ECO 스크립트 실행"
                ],
                "codeSnippet": "# PrimeTime ECO script for Hold/Setup Violation fixing\nread_verilog post_route_netlist.v\ncurrent_design crypto_top\nlink\nread_sdc crypto_constraints.sdc\nupdate_timing -full\n\n# Check Setup Slack\nset setup_violators [get_timing_paths -slack_lesser_than 0.0 -max_paths 100 -delay_type max]\nif {[sizeof_collection $setup_violators] > 0} {\n    puts \"[WARN] Setup violations detected. Sizing up driver cells...\"\n    foreach_in_collection path $setup_violators {\n        set pin [get_property [get_attribute $path endpoint] full_name]\n        puts \"Violating Pin: $pin\"\n    }\n}\n\n# Fix Hold Violations using buffer insertion\nset hold_violators [get_timing_paths -slack_lesser_than 0.0 -max_paths 500 -delay_type min]\nif {[sizeof_collection $hold_violators] > 0} {\n    puts \"[INFO] Fixing hold violations by inserting DELAY_BUFF_X1...\"\n    fix_eco_timing -type hold -buffer_list {N5_DELAY_BUF_X1 N5_DELAY_BUF_X2}\n    write_changes -format icctcl -output eco_hold_fix.tcl\n}\n\nreport_timing -delay_type max -nworst 5\nreport_timing -delay_type min -nworst 5",
                "expectedOutput": "PrimeTime STA Report: Setup WNS = +0.024 ns, Setup TNS = 0.000 ns. Hold WNS = +0.008 ns, Hold TNS = 0.000 ns. DRC Violations = 0. Clean Timing Signoff Complete."
            },
            "keyChecklist": [
                "전력망 IR-드롭 분석 결과 피크 전압 강하가 VDD의 3% 이하인지 확인",
                "모든 파운드리 물리 설계 규칙(DRC) 및 Layout vs Schematic(LVS) 에러 0 달성",
                "모든 활성 PVT 코너에서 셋업/홀드 WNS(Worst Negative Slack) 및 TNS가 0 이상인지 검증",
                "안테나 다이오드 비율 한계 규격(Antenna Ratio Rule) 100% 충족",
                "일렉트로마이그레이션(EM) 위반 넷이 존재하지 않는지 정밀 신뢰성 사인오프 통과"
            ],
            "quiz": [
                {
                    "question": "정적 타이밍 분석(STA)에서 홀드 타임(Hold Time) 위반이 발생했을 때 나타나는 근본적인 특성과 해결책은 무엇인가?",
                    "options": [
                        "클록 주파수를 낮추면 홀드 타임 위반이 자연스럽게 해소된다.",
                        "홀드 타임 위반은 클록 주기와 무관하므로, 데이터 지연 경로에 딜레이 버퍼를 삽입하여 해결해야 한다.",
                        "전원 전압을 올리면 셀 지연이 줄어들어 홀드 타임 위반이 해결된다.",
                        "플립플롭의 셋업 타임 마진을 늘리면 홀드 타임 슬랙도 함께 증가한다."
                    ],
                    "correctIndex": 1,
                    "explanation": "홀드 타임 검사는 런치 클록과 캡처 클록이 동일한 클록 엣지 사이클에서 비교되므로 클록 주기(Period) 항이 수식에 들어가지 않습니다. 따라서 클록을 아무리 느리게 동작시켜도 칩은 고장 납니다. 유일한 해결책은 데이터 경로가 너무 빠르게 도착하지 못하도록 데이터 패스에 딜레이 버퍼를 추가하는 것입니다."
                },
                {
                    "question": "클록 트리 합성(CTS) 시 공정 변이(OCV)에 의한 국소 클록 스큐를 극도로 억제하기 위해 초고성능 프로세서에서 채택하는 구조는?",
                    "options": [
                        "단일 인버터 직렬 체인",
                        "클록 메쉬(Clock Mesh) 아키텍처",
                        "비동기 링 발진기 트리",
                        "수동 R-C 지연선 캐스케이드"
                    ],
                    "correctIndex": 1,
                    "explanation": "클록 메쉬는 H-트리 드라이버 하단에 촘촘한 금속 격자망을 단락 연결하여 다수의 드라이버가 동일한 노드를 함께 구동하게 만듭니다. 국소적인 소자 변이(OCV)로 인해 한쪽 버퍼가 빨라도 메쉬 전도에 의해 전하가 평균화되어 스큐가 수 피코초 이내로 상쇄됩니다."
                },
                {
                    "question": "플라즈마 건식 식각 중 긴 금속 배선에 포집된 전하가 얇은 게이트 절연막을 파괴하는 현상과 이를 방지하기 위한 DFM 조치는?",
                    "options": [
                        "스킨 효과(Skin Effect) - 동축 케이블 차폐",
                        "일렉트로마이그레이션(EM) - 접지면 두께 확대",
                        "안테나 효과(Antenna Effect) - 상위 금속 브리지 점퍼 연결 또는 안테나 다이오드 삽입",
                        "줄 열(Joule Heating) - 방열판 장착"
                    ],
                    "correctIndex": 2,
                    "explanation": "웨이퍼 제작 중 긴 금속 패턴이 노출되면 플라즈마의 이온 전하가 안테나처럼 축적되어 트랜지스터 게이트 산화막으로 방전되어 절연을 파괴합니다. 이를 안테나 효과라 부르며, 상위 메탈로 점퍼를 띄워 노출 길이를 분할하거나 역방향 안테나 다이오드를 게이트 직전에 삽입하여 전하를 기판으로 안전하게 방전시킵니다."
                }
            ]
        },
        {
            "id": "vlsi-stage-3-fab",
            "order": 3,
            "track": "vlsi",
            "stageId": "stage-3-fab-process",
            "stageNumber": 3,
            "titleKo": "첨단 팹 제조 공정 (8대 공정 & 초미세 수율 공학)",
            "titleEn": "Advanced Fab 8-Step Semiconductor Manufacturing Process",
            "category": "Semiconductor Device & Fabrication Process",
            "overview": "실리콘 잉곳 성장 및 베어 웨이퍼 준비부터 극자외선(High-NA 0.55 EUV) 노광, 원자층 식각(ALE), 원자층 증착(ALD), 이온 주입 및 급속 열처리(RTP), 구리 다마신 화학기계연마(CMP), 고순도 세정까지 이어지는 반도체 제조 8대 핵심 단위 공정을 종합 탐구합니다. 2nm 공정 이하의 핵심 구조인 나노시트 게이트-올-어라운드(GAA MBCFET) 트랜지스터 제작의 물리적 원리와 결함 제어 수율 공학을 완벽히 다룹니다.",
            "learningObjectives": [
                "산화막 성장의 Deal-Grove 모델을 통해 선형 및 포물선 영역의 산화막 성장 두께를 정량 계산할 수 있다.",
                "Rayleigh 해상도 공식을 바탕으로 ASML High-NA (0.55 NA) EUV 노광 장비의 최소 선폭(CD) 및 초점 심도(DOF)를 계산할 수 있다.",
                "원자층 식각(ALE)과 원자층 증착(ALD)의 자기제한적 표면 반응(Self-limiting reaction) 메커니즘을 분석할 수 있다.",
                "구리 배선 형성을 위한 듀얼 다마신(Dual Damascene) 공정과 CMP Preston 연마 속도 수식을 이해하고 2nm GAA 소자 제조 시퀀스를 설계할 수 있다."
            ],
            "prerequisites": [
                "고체물리학 및 반도체 공학 (에너지 밴드갭, 페르미 준위, 캐리어 농도)",
                "물리화학 및 열역학 (확산 방정식, 흡착 이론, 화학 반응 속도론)",
                "전자기학 (광학 전파, 회절 한계, 굴절률과 수치구경 NA)"
            ],
            "deepTheory": {
                "eightCoreFabSteps": {
                    "title": "반도체 8대 단위 제조 공정의 물리화학적 메커니즘",
                    "explanation": "1) 산화(Oxidation): 고온(900~1100℃) 건식/습식 분위기에서 실리콘 표면에 균일한 절연막(SiO2)을 형성; 2) 포토리소그래피(Photolithography): ASML High-NA 0.55 EUV(13.5nm 파장)를 이용해 마스크 패턴을 감광액(PR)에 미세 전사; 3) 식각(Etching): RIE(반응성 이온 식각) 및 원자층 식각(ALE)으로 불필요한 영역을 원자 단위 정밀도로 제거; 4) 박막 증착(Deposition): ALD(원자층 증착)를 통해 High-k 유전체(HfO2) 및 금속 게이트를 100% 단차피복성(Step Coverage)으로 증착; 5) 이온 주입(Ion Implantation): 인(P), 비소(As), 붕소(B) 이온을 가속 주입하고 급속 열처리(RTP)로 격자 손상 복원 및 도펀트 활성화; 6) 금속 배선(Metallization): Cu 듀얼 다마신 공정으로 Ta/TaN 확산 방지막 및 Cu 전해도금; 7) 화학기계연마(CMP): 슬러리와 연마 패드를 이용해 웨이퍼 표면을 나노 단위 평탄화; 8) 세정(Cleaning): RCA SC-1(유기물 제거) 및 SC-2(중금속 제거)와 메가소닉으로 파티클을 무결점 세정합니다."
                },
                "highNaEuvOptics": {
                    "title": "ASML High-NA EUV 노광과 아나모픽 광학계(Anamorphic Lens)",
                    "explanation": "EUV 파장(13.5nm)에서 수치구경(NA)을 0.33에서 0.55로 극대화하면 Rayleigh 한계 해상도가 8nm 이하로 비약합니다. 그러나 반사경 입사각이 커짐에 따라 마스크 3차원 그림자 효과(Mask 3D Effect)가 발생하므로, X축 4배, Y축 8배로 배율이 서로 다른 아나모픽(Anamorphic) 광학계를 채택하여 노광 영역을 정밀 제어합니다."
                },
                "nanosheetGaaIntegration": {
                    "title": "2nm GAA MBCFET(Multi-Bridge-Channel FET) 공정 통합",
                    "explanation": "기존 3차원 FinFET은 게이트가 채널의 3면만을 감싸 채널 길이가 5nm 이하로 줄어들 때 드레인 유도 장벽 감소(DIBL) 및 누설전류 제어에 한계를 노출합니다. GAA MBCFET은 Si/SiGe 초격자(Superlattice) 층을 에피택셜 성장시킨 후, 고선택비 등방성 식각으로 SiGe 희생층만을 선택 제거하여 공중에 뜬 Si 나노시트를 형성합니다. 그 둘레 전체(4면)를 High-k 유전막과 금속 게이트로 둘러쌈으로써 완벽한 정전기적 게이트 제어 능력을 확보합니다."
                }
            },
            "equations": [
                {
                    "name": "산화막 성장 모델 (Deal-Grove Oxidation Model)",
                    "latex": "x_0^2 + A x_0 = B(t + \\tau)",
                    "variables": {
                        "x_0": "성장된 산화막의 최종 두께",
                        "A, B": "온도, 산화 기체 분압 및 실리콘 결정 방향에 의존하는 계수",
                        "B": "포물선 속도 상수 (확산 지배 영역의 성장률, \\mu m^2/hr)",
                        "B/A": "선형 속도 상수 (계면 반응 지배 영역의 성장률, \\mu m/hr)",
                        "t": "산화 공정 진행 시간",
                        "\\tau": "초기 산화막 존재에 따른 시간 보정 파라미터"
                    },
                    "physicalMeaning": "초기 얇은 영역에서는 표면 화학 반응 속도에 비례(x_0 ∝ t)하다가, 산화막이 두꺼워지면 산화제 분자가 이미 형성된 산화막을 침투 확산하는 속도에 지배(x_0 ∝ √t)됨을 증명합니다.",
                    "derivationNotes": "산화제 기상 전달, 산화막 내부 확산, Si-SiO2 계면 반응의 플럭스(Flux) 연속 방정식 F1 = F2 = F3 평형 조건에서 유도됩니다."
                },
                {
                    "name": "레일리 포토리소그래피 한계 해상도 및 초점 심도 (Rayleigh Equations)",
                    "latex": "R = k_1 \\frac{\\lambda}{\\text{NA}}, \\quad \\text{DOF} = k_2 \\frac{\\lambda}{\\text{NA}^2}",
                    "variables": {
                        "R": "인접한 두 패턴을 분별할 수 있는 최소 분해능 선폭 (Critical Dimension, CD)",
                        "\\text{DOF}": "초점이 선명하게 맺히는 광학적 깊이 여유 (Depth of Focus)",
                        "\\lambda": "노광 광원의 파장 (EUV의 경우 13.5 nm)",
                        "\\text{NA}": "투영 렌즈계의 수치구경 (Numerical Aperture, High-NA = 0.55)",
                        "k_1, k_2": "감광제 특성, 조명계(OPC, 위상천이 마스크)에 따른 공정 공학 계수"
                    },
                    "physicalMeaning": "NA를 키우면 해상도(R)는 비례하여 미세화되지만 초점 심도(DOF)는 NA의 제곱에 반비례하여 급격히 얕아지므로, High-NA 공정에서는 웨이퍼 표면의 극단적인 나노 단위 평탄도(CMP)가 요구됨을 증명합니다."
                },
                {
                    "name": "화학기계연마 연마 속도 (Preston's Equation for CMP)",
                    "latex": "\\frac{dh}{dt} = K_p \\cdot P \\cdot V",
                    "variables": {
                        "dh/dt": "단위 시간당 막질 두께 제거 속도 (Removal Rate, nm/min)",
                        "K_p": "슬러리 화학성분, 패드 마모도 및 막질 재료에 따른 프레스톤 상수",
                        "P": "연마 헤드가 웨이퍼에 가하는 수직 하향 압력 (Downforce Pressure, psi)",
                        "V": "웨이퍼와 연마 패드 간의 상대 선속도 (Relative Velocity, m/s)"
                    },
                    "physicalMeaning": "CMP 공정 중 재료 제거율이 기계적 접촉 압력과 슬립 속도에 정비례함을 나타내며, 웨이퍼 중심과 에지 사이의 연마 균일도(Non-Uniformity) 제어의 기초식입니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "Defect Metrology & Yield Engineering",
                "components": [
                    {
                        "name": "E-Beam Inspection & CD-SEM",
                        "role": "원자 현미경 및 전계방출 전자현미경을 이용해 나노시트 단면 폭과 미세 브리지/단선 결함을 수 피코미터 정밀도로 계측"
                    },
                    {
                        "name": "Critical Point Drying (CPD)",
                        "role": "나노시트 릴리스 에칭 후 표면 장력에 의해 나노시트 간에 달라붙는 스틱션(Stiction) 결함을 제거하기 위해 초임계 CO2 건조 공정 적용"
                    },
                    {
                        "name": "Work Function Metal (WFM) Stack Tuning",
                        "role": "TiN, TiAl, TaN 등의 다층 금속을 원자층 두께로 조절 증착하여 NMOS 및 PMOS의 문턱 전압(Vth)을 정밀 제어"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "2nm Gate-All-Around (GAA) MBCFET Transistor 8-Step Process Integration Simulation",
                "objective": "3층 실리콘 나노시트(Si Nanosheet) 기반 2nm GAA 트랜지스터 제조 8단계를 TCAD 물리 공정 시뮬레이터로 모델링하고 I-V 전달 특성을 검증한다.",
                "targetPlatformAndTools": "Synopsys Sentaurus TCAD / Silvaco Victory Process & Device TCAD",
                "stepByStepGuide": [
                    "Step 1: Si(001) 기판 상에 Si0.7Ge0.3(10nm) 및 Si(5nm) 3주기 초격자 헤테로 에피택시 성장 모델링",
                    "Step 2: 0.55 NA High-NA EUV 노광 및 플라즈마 이방성 식각으로 수직 핀 패턴 패터닝",
                    "Step 3: 내부 스페이서(Inner Spacer) 질화막 형성 및 소스/드레인 에피택시(SiGe:B / Si:P) 공정",
                    "Step 4: 기상 HCl 등방성 식각을 이용해 SiGe 희생층을 100% 선택 제거하는 나노시트 릴리스(Release) 구현",
                    "Step 5: 나노시트 4면 둘레에 ALD HfO2(EOT = 0.6nm) 및 TiAl/TiN 금속 게이트 전주기 적층",
                    "Step 6: 게이트 전압 스윕에 따른 Subthreshold Swing(SS < 65mV/dec) 및 DIBL(< 40mV/V) 추출"
                ],
                "codeSnippet": "# Sentaurus TCAD Process Simulation Script for GAA Nanosheet Release\nline x loc=0.00 tag=mid\nline x loc=0.02 tag=gate_edge\nline y loc=0.00 tag=top\nline y loc=0.10 tag=bot\n\n# Hetero-epitaxy superlattice growth\ngas_ambient name=EpiSiliconGe\nlayer thickness=0.01 material=SiliconGe SiFraction=0.7\nlayer thickness=0.005 material=Silicon\nlayer thickness=0.01 material=SiliconGe SiFraction=0.7\nlayer thickness=0.005 material=Silicon\nlayer thickness=0.01 material=SiliconGe SiFraction=0.7\nlayer thickness=0.005 material=Silicon\n\n# High-NA EUV Patterning & Anisotropic RIE Etch\nmask name=FinMask left=0.005 right=0.015\netch material={Silicon, SiliconGe} type=anisotropic thickness=0.065\n\n# Selective Isotropic Etch of SiGe sacrificial layers (Nanosheet Release)\netch material=SiliconGe type=isotropic rate=1.0\netch material=Silicon   type=isotropic rate=0.001 ;# High selectivity > 1000:1\n\n# Atomic Layer Deposition of Gate Dielectric & WFM Metal Gate\ndeposit material=HfO2 thickness=0.0015 type=isotropic ;# High-k oxide\ndeposit material=TiN  thickness=0.0020 type=isotropic ;# Work Function Metal\ndeposit material=Tungsten thickness=0.020 type=fill",
                "expectedOutput": "TCAD Extraction: 3-stack Nanosheet GAA MBCFET On-Current Ion = 1.45 mA/um @ Vdd = 0.7V, Ioff = 10 pA/um, Subthreshold Swing = 63.8 mV/dec. Perfect electrostatic gate control verified."
            },
            "keyChecklist": [
                "EUV 마스크 3차원 그림자 효과 보정을 위한 광학 근접 효과 보정(OPC) 적용 완료",
                "나노시트 릴리스 에칭 시 Si 채널 침식(Erosion) 없는 1000:1 이상 식각 선택비 보증",
                "ALD High-k HfO2 유전막의 두께 변동이 1개 원자층(±0.1nm) 이내로 균일성 검증",
                "CMP 연마 공정 후 잔류 금속 찌꺼기에 의한 채널 간 단락 결함 무(0 Defect)",
                "DIBL 및 SS 특성이 단채널 효과(Short-Channel Effect) 규격 마진 내 진입 확인"
            ],
            "quiz": [
                {
                    "question": "ASML High-NA(0.55 NA) EUV 노광기에서 마스크 3D 그림자 효과를 극복하고 고해상도를 구현하기 위해 채택한 광학적 혁신은?",
                    "options": [
                        "액체 침지(Immersion) 굴절 렌즈 적용",
                        "X축과 Y축의 축소 배율이 서로 다른 아나모픽(Anamorphic, 4x/8x) 반사 광학계",
                        "193nm ArF 레이저의 4중 패터닝(SAQP) 방식 결합",
                        "유기 화학 증폭형 감광액의 제거"
                    ],
                    "correctIndex": 1,
                    "explanation": "High-NA EUV는 입사각이 커져 반사형 마스크의 흡수체 패턴에 의해 빛이 가려지는 3D 마스크 효과가 심화됩니다. 이를 완화하기 위해 수평 방향은 기존 4배, 수직 방향은 8배로 비대칭 축소하는 아나모픽 광학계를 도입하였습니다."
                },
                {
                    "question": "Deal-Grove 열산화 모델에서 산화막이 매우 얇은 초기 단계에서 성장 속도를 지배하는 율속 단계(Rate-Limiting Step)는?",
                    "options": [
                        "산화제 기체 분자의 외부 대류 전달",
                        "이미 형성된 SiO2 산화막 내부를 통과하는 산화제의 고체 확산",
                        "Si와 SiO2 계면(Interface)에서의 화학 반응 속도 (선형 영역)",
                        "실리콘 기판 내부 도펀트 원자의 편석 작용"
                    ],
                    "correctIndex": 2,
                    "explanation": "Deal-Grove 모델에서 산화막 두께 x_0가 얇을 때는 산화제가 막을 통과하는 확산 저항이 거의 없으므로, Si-SiO2 계면에서 산소와 실리콘이 반응하는 화학 반응 속도가 율속 단계가 되며 시간 t에 선형(Linear)으로 성장합니다."
                },
                {
                    "question": "3nm/2nm GAA MBCFET 트랜지스터 제작에서 Si 나노시트를 공중에 띄우는 나노시트 릴리스(Release) 공정 시 필수적인 화학적 요건은?",
                    "options": [
                        "Si 채널을 빠르게 녹이고 SiGe는 전혀 녹이지 않는 산성 용액",
                        "SiGe 희생층만을 선택적으로 식각하고 Si 채널은 손상시키지 않는 극도의 고선택비(Selective Etch)",
                        "강한 물리적 스퍼터링 충격을 가하는 고에너지 Ar 플라즈마",
                        "산소 플라즈마를 이용한 완전 열산화"
                    ],
                    "correctIndex": 1,
                    "explanation": "Si/SiGe 교대 적층 구조에서 나노미터 두께의 Si 채널 손상 없이 SiGe 희생층만을 완전히 파내야 채널 4면을 둘러싸는 GAA 구조가 완성되므로, SiGe 대 Si의 식각 선택비가 최소 수백~수천 대 1 이상이어야 합니다."
                }
            ]
        },
        {
            "id": "vlsi-stage-4-pkg-test",
            "order": 4,
            "track": "vlsi",
            "stageId": "stage-4-packaging-test",
            "stageNumber": 4,
            "titleKo": "첨단 패키징(2.5D/3D Chiplet) 및 ATE 양산 테스트 공학",
            "titleEn": "Advanced Packaging & ATE Test Engineering",
            "category": "Advanced Packaging & Test Signoff",
            "overview": "무어의 법칙 한계를 극복하기 위해 다종 이종 칩을 하나의 패키지로 집적하는 2.5D 실리콘 인터포저(TSMC CoWoS, Intel EMIB), 범프리스 3D 하이브리드 본딩(Cu-Cu Direct Bonding), 고대역폭 메모리(HBM3e/HBM4) 적층 기술과, ATE(Advantest V93000 / Teradyne UltraFLEX) 기반의 웨이퍼 소트(Wafer Sort), 파이널 테스트(FT), HTOL 번인(Burn-in) 신뢰성 수명 가속 평가를 총망라합니다.",
            "learningObjectives": [
                "2.5D 실리콘 관통 전극(TSV) 인터포저와 고밀도 유기 인터포저(CoWoS-R)의 열기계적 워페이지(Warpage) 및 기생 RC 특성을 비교 분석할 수 있다.",
                "1um 이하 피치의 Cu-Cu 직접 하이브리드 본딩(Hybrid Bonding) 공정 메커니즘과 계면 산화 방지 기술을 이해할 수 있다.",
                "HBM3e/HBM4의 1024비트/2048비트 와이드 버스 아키텍처 및 DFI 물리 계층의 신호 무결성을 검증할 수 있다.",
                "ATE 테스트베드에서 DFT 스캔 체인(Scan Chain), BIST, IDDQ 테스트 패턴을 인가하고 Arrhenius 가속 계수 수식으로 HTOL 번인 시간을 설계할 수 있다."
            ],
            "prerequisites": [
                "반도체 회로 패키징 및 열전달 기초 (열저항 Theta-JA, Fourier 열전도 방정식)",
                "테스트 용이화 설계 기초 (DFT: ATPG, IEEE 1149.1 JTAG Boundary Scan)",
                "재료역학 및 신뢰성 공학 (열팽창계수 CTE 불일치, 응력-변형률 선도)"
            ],
            "deepTheory": {
                "twoPointFiveAndThreeDPackaging": {
                    "title": "2.5D TSV 인터포저 (CoWoS) 및 3D 하이브리드 본딩 기술",
                    "explanation": "2.5D 패키징은 실리콘 인터포저 상에 고밀도 TSV(Through-Silicon Via)를 형성하고, 그 위에 메인 로직 SoC(ASIC/GPU)와 HBM 스택을 마이크로 범프(Micro-bump, ~25um 피치)로 나란히 올려 초고대역폭 상호연결을 구현합니다. 나아가 범프의 접촉 저항과 기생 커패시턴스를 제거하기 위해, 유전체(SiO2)와 구리 패드를 초평탄화한 후 원자 수준에서 직접 접합하는 3D 하이브리드 본딩(Cu-Cu direct padless bonding, < 1um 피치) 기술이 적용되어 접속 밀도를 100배 이상 증가시킵니다."
                },
                "hbmStackArchitecture": {
                    "title": "HBM3e / HBM4 초고대역폭 메모리 인터페이스",
                    "explanation": "HBM(High Bandwidth Memory)은 베이스 로직 다이(Base Die) 위에 DRAM 코어 다이를 8단~16단으로 수직 적층하고 수천 개의 TSV로 관통 연결합니다. HBM3e는 핀당 9.6Gbps 이상의 속도로 1.2TB/s의 대역폭을 달성하며, HBM4에서는 인터페이스 폭을 2048비트로 확장하고 첨단 파운드리 버퍼 다이를 결합하여 2TB/s를 초과하는 전송 속도를 실현합니다. 다이 적층 시 마이크로범프 언더필(MUF) 및 NCF(Non-Conductive Film) 보이드 제어가 수율의 핵심입니다."
                },
                "ateAndReliability": {
                    "title": "ATE 양산 테스팅 및 HTOL 번인 가속 수명 평가",
                    "explanation": "첨단 칩렛 시스템은 단 하나의 다이만 불량이어도 초고가 패키지 전체가 폐기되므로, 패키징 전 개별 다이의 100% 완전성을 검증하는 KGD(Known Good Die) 전략이 필수적입니다. ATE(Automated Test Equipment) 장비(Advantest V93000 등)는 고밀도 프로브 카드를 통해 수만 개의 테스트 벡터를 인가하여 결함을 검출합니다. 초기 고장(Infant Mortality)을 제거하기 위한 번인(Burn-in) 및 장기 신뢰성 검증을 위해 고온 동작 수명 시험(HTOL: High Temperature Operating Life)을 수행하며, 아레니우스(Arrhenius) 모델을 통해 실제 사용 환경 대비 가속 계수(AF)를 도출합니다."
                }
            },
            "equations": [
                {
                    "name": "아레니우스 온도 가속 계수 (Arrhenius Life Acceleration Factor)",
                    "latex": "\\text{AF} = \\exp\\left[\\frac{E_a}{k_B} \\left(\\frac{1}{T_{\\text{use}}} - \\frac{1}{T_{\\text{stress}}}\\right)\\right]",
                    "variables": {
                        "\\text{AF}": "온도 가속 계수 (Stress 시간 대비 실사용 환산 수명 배율)",
                        "E_a": "결함 메커니즘 활성화 에너지 (Activation Energy, 일반적으로 반도체 0.7 eV)",
                        "k_B": "볼츠만 상수 (8.617 × 10^-5 eV/K)",
                        "T_{\\text{use}}": "실제 운용 환경의 정션 절대 온도 (Kelvin, 예: 328K / 55℃)",
                        "T_{\\text{stress}}": "HTOL 번인 챔버의 정션 절대 온도 (Kelvin, 예: 398K / 125℃)"
                    },
                    "physicalMeaning": "고온 챔버(125℃)에서 168시간(1주일) 동안 테스트를 통과하면 실사용 온도(55℃)에서 약 10년 이상의 수명을 보증할 수 있음을 정량 계산하는 신뢰성 공학의 핵심 수식입니다."
                },
                {
                    "name": "열응력 피로 수명 (Coffin-Manson Model for Solder Joint Fatigue)",
                    "latex": "N_f = C \\cdot (\\Delta \\varepsilon_p)^{-m} \\cdot f^n \\exp\\left(\\frac{E_a}{k_B T_{\\max}}\\right)",
                    "variables": {
                        "N_f": "솔더 접합부 파괴까지의 열주기 반복 횟수 (Cycles to Failure)",
                        "\\Delta \\varepsilon_p": "소자 간 열팽창계수(CTE) 차이로 유발되는 소성 변형률 범위 (Plastic Strain Range)",
                        "C, m, n": "솔더 합금 재질 특성 상수",
                        "f": "열 사이클링 주파수 (Cycle frequency)"
                    },
                    "physicalMeaning": "실리콘 다이(CTE ≈ 2.6 ppm/K)와 유기 기판(CTE ≈ 15 ppm/K) 간의 극단적인 열팽창 불일치로 인해 칩렛 마이크로범프에 가해지는 열피로 파괴 수명을 예측합니다."
                }
            ],
            "verificationOrArchitecture": {
                "type": "Production ATE Test & Fault Coverage Architecture",
                "components": [
                    {
                        "name": "Scan-based ATPG (Automatic Test Pattern Generation)",
                        "role": "칩 내부 수십만 개 플립플롭을 단일 직렬 시프트 레지스터로 묶어 고착 결함(Stuck-at Fault) 및 천이 지연 결함(Transition Delay Fault) 99.5% 이상 검출"
                    },
                    {
                        "name": "Built-In Self-Test (BIST: MBIST & LBIST)",
                        "role": "HBM 적층 내부 고밀도 SRAM 및 로직을 고속으로 자체 진단하고 여분의 예비 행/열(Redundancy)로 리페어(Repair) 수행"
                    },
                    {
                        "name": "Direct Memory Interface Test & Loopback",
                        "role": "HBM과 로직 다이 간 2048비트 광대역 인터커넥트의 오픈/쇼트 및 비트 에러율(BER < 10^-15)을 루프백 모드로 측정"
                    }
                ]
            },
            "practicalLab": {
                "labTitle": "AI Accelerator Chiplet + 8-Hi HBM 2.5D CoWoS Thermomechanical Warpage & Test Strategy",
                "objective": "2.5D CoWoS 상에 조립된 대면적 로직 칩렛 및 8단 HBM 스택의 리플로우 열팽창 워페이지(Warpage)를 ANSYS로 시뮬레이션하고, ATE 웨이퍼 소트 테스트 플로우를 설계한다.",
                "targetPlatformAndTools": "ANSYS Mechanical (FEM 열응력 해석), Teradyne IG-XL / Advantest SmarTest ATE 소프트웨어",
                "stepByStepGuide": [
                    "Step 1: 50mm x 50mm 실리콘 인터포저, 600mm² 로직 칩, 4개의 HBM3e 스택의 3D 형상 및 CTE 물성 모델링",
                    "Step 2: 260℃ 솔더 리플로우 냉각 과정에서 유발되는 최대 휨 변형(Warpage < 60um) 해석",
                    "Step 3: 마이크로범프 전단 응력(Shear Stress) 집중 영역 도출 및 언더필 재료 물성 최적화",
                    "Step 4: Advantest V93000 테스터 환경용 KGD 웨이퍼 프로빙 패턴 및 DC 파라메트릭 테스트 작성",
                    "Step 5: 125℃ 1000시간 HTOL 번인 시험 계획서 수립 및 아레니우스 수명 환산 보고서 산출"
                ],
                "codeSnippet": "# Python calculation for HTOL Burn-in Acceleration Factor\nimport math\n\ndef calculate_htol_af(T_use_c, T_stress_c, Ea_ev=0.7):\n    kB = 8.617333262145e-5  # eV/K\n    T_use_k = T_use_c + 273.15\n    T_stress_k = T_stress_c + 273.15\n    \n    exponent = (Ea_ev / kB) * ((1.0 / T_use_k) - (1.0 / T_stress_k))\n    af = math.exp(exponent)\n    return af\n\n# Scenario: AI Server Datacenter 55 degC vs HTOL Burn-in 125 degC\nT_use = 55.0\nT_stress = 125.0\naf = calculate_htol_af(T_use, T_stress, Ea_ev=0.7)\nburn_in_hours = 168.0  # 1 week test\nequivalent_operating_years = (burn_in_hours * af) / (24 * 365)\n\nprint(f\"HTOL Temperature Acceleration Factor (AF): {af:.2f}\")\nprint(f\"168 hours of Burn-in @ 125C equates to: {equivalent_operating_years:.2f} years @ 55C junction temp.\")",
                "expectedOutput": "Output: HTOL Temperature Acceleration Factor (AF): 77.58. 168 hours of Burn-in @ 125C equates to: 1.49 years of continuous operational life at 55C. 1000-hour HTOL qualifies >8.8 years reliability."
            },
            "keyChecklist": [
                "2.5D 인터포저 조립 후 상온 및 고온 리플로우 전 영역에서 워페이지 규격(< 65um) 만족",
                "HBM 마이크로범프 접속부 무결성(Void율 5% 미만, X-ray 및 C-SAM 초음파 전수 검사 통과)",
                "개별 다이 KGD(Known Good Die) 패스율 99.8% 확보로 멀티칩렛 복합 수율 손실 방지",
                "스캔 체인(ATPG) 고착 결함 커버리지 99.5% 이상, 지연 결함 95% 이상 달성",
                "JEDEC 표준 JESD22-A108 준수 HTOL 번인 1000시간 후 제로 페일(Zero Fail) 사인오프"
            ],
            "quiz": [
                {
                    "question": "2.5D 인터포저 기반 멀티 칩렛(Chiplet) 패키징에서 개별 다이에 대해 패키징 전 KGD(Known Good Die) 검증이 절대적으로 필수적인 이유는?",
                    "options": [
                        "KGD를 거치지 않으면 패키지 내부 온도가 급격히 상승하기 때문이다.",
                        "완성된 고가 2.5D 패키지에서 단 하나의 칩렛만 불량이어도 전체 완제품을 폐기해야 하므로 수율 및 원가 손실을 방지하기 위함이다.",
                        "KGD 다이는 범프를 형성할 필요가 없기 때문이다.",
                        "소프트웨어 드라이버를 사전에 칩에 플래싱하기 위함이다."
                    ],
                    "correctIndex": 1,
                    "explanation": "예를 들어 8개의 칩렛으로 구성된 패키지에서 각 다이의 수율이 95%라면, 패키징 후 복합 수율은 0.95^8 = 약 66%로 폭락합니다. 불량 칩 하나 때문에 고가의 실리콘 인터포저와 다른 정상 칩들 전체가 폐기되므로, 패키징 전 100% 완전성을 보장하는 KGD 검증이 필수입니다."
                },
                {
                    "question": "아레니우스(Arrhenius) 고온 동작 수명 시험(HTOL) 모델에서 활성화 에너지가 일정할 때, 번인 스트레스 챔버의 온도를 올리면 수명 가속 계수(AF)는 어떻게 변화하는가?",
                    "options": [
                        "온도 증가에 비례하여 선형적으로 증가한다.",
                        "온도 증가에 따라 지수함수적으로 증가하여 시험 시간을 획기적으로 단축할 수 있다.",
                        "온도가 올라가도 가속 계수는 전혀 변하지 않는다.",
                        "온도가 올라가면 가속 계수가 반비례하여 감소한다."
                    ],
                    "correctIndex": 1,
                    "explanation": "아레니우스 수식은 지수함수 항 exp[(Ea/kB) * (1/T_use - 1/T_stress)]을 포함하므로, 스트레스 온도 T_stress가 상승함에 따라 결함 발생 속도와 수명 가속 계수(AF)가 지수함수적으로 급증하여, 수년 치의 노화를 수백 시간의 챔버 테스트로 단축 검증할 수 있습니다."
                },
                {
                    "question": "기존 마이크로 범프(Micro-bump, ~25um 피치) 방식 대비 3D 하이브리드 본딩(Hybrid Bonding, < 1um 피치)이 갖는 결정적 강점은?",
                    "options": [
                        "솔더 볼 크기를 키워 물리적 충격 저항성을 높인다.",
                        "금속 패드와 절연체를 초평탄화하여 범프 없이 구리와 구리를 직접 원자 접합함으로써 접촉 저항과 기생 커패시턴스를 극소화하고 인터커넥트 밀도를 극대화한다.",
                        "PCB 제조 원가를 절감할 수 있다.",
                        "외부 냉각 쿨링팬을 장착하지 않아도 된다."
                    ],
                    "correctIndex": 1,
                    "explanation": "하이브리드 본딩은 땜납(솔더) 범프를 아예 배제하고, 화학기계연마(CMP)로 완벽히 평탄화된 유전체와 구리 전극을 웨이퍼 대 웨이퍼(W2W) 또는 다이 대 웨이퍼(D2W)로 직접 접합합니다. 이로 인해 피치를 1um 미만으로 좁혀 수십 배 이상의 I/O 밀도를 얻고 배선 기생 성분을 대폭 줄일 수 있습니다."
                }
            ]
        }
    ]
