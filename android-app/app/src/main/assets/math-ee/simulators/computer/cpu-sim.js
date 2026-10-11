/**
 * ============================================================================
 * cpu-sim.js — 8-bit Virtual Computer & CPU Simulator (SAP-1 / Von Neumann Architecture)
 * 
 * Complete interactive hardware simulation featuring:
 * - 8-bit Common Data Bus, 4-bit Address Bus
 * - Registers: PC (4b), MAR (4b), RAM (16x8b), IR (8b), ACC (8b), ALU (8b), B (8b), OUT (8b), Flags (C, Z)
 * - 6 T-states Microcode Sequencer (T0, T1, T2: Fetch; T3, T4, T5: Execute)
 * - 16 Control Signals (HLT, MI, RI, RO, IO, II, AI, AO, EO, SU, BI, OI, CE, CO, J, FI)
 * - Full ISA Support (NOP, LDA, ADD, SUB, STA, LDI, JMP, JC, JZ, OUT, AND, XOR, OR, NOT, HLT)
 * - 60 FPS 2D Canvas Visualizer with active bus glow, particle data pulses, bit LEDs, and 7-segment display
 * - Integrated 2-Pass Assembler & Disassembler with Label Resolution
 * - Interactive RAM Table with in-place byte editing & live step highlights
 * - Zero external dependencies, pure JavaScript & Canvas (UMD: Browser & Node.js)
 * ============================================================================
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CpuComputerSim = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ==========================================================================
  // 1. HARDWARE CONSTANTS & ISA SPECIFICATION
  // ==========================================================================

  // All 16 Control Signals
  const SIGNALS = [
    'HLT', // Halt CPU Clock
    'MI',  // MAR In (Address Bus In)
    'RI',  // RAM In (Memory Write)
    'RO',  // RAM Out (Memory Read)
    'IO',  // IR Out (Operand 4-bit to Bus)
    'II',  // IR In (Instruction Register Load)
    'AI',  // ACC In (Accumulator Load)
    'AO',  // ACC Out (Accumulator onto Bus)
    'EO',  // ALU Out (ALU Result onto Bus)
    'SU',  // Subtract Mode (ALU SUB instead of ADD)
    'BI',  // B Register In (B Register Load)
    'OI',  // OUT In (Output Register Load)
    'CE',  // Counter Enable (PC = PC + 1)
    'CO',  // Counter Out (PC onto Bus)
    'J',   // Jump (PC load from Bus)
    'FI'   // Flags In (Latch Carry and Zero flags)
  ];

  // Opcode Definitions (Upper 4 bits of Instruction Register)
  const OPCODES = {
    0x0: { name: 'NOP', desc: 'No Operation', hasOperand: false },
    0x1: { name: 'LDA', desc: 'Load Accumulator from RAM[addr]', hasOperand: true },
    0x2: { name: 'ADD', desc: 'Add RAM[addr] to Accumulator', hasOperand: true },
    0x3: { name: 'SUB', desc: 'Subtract RAM[addr] from Accumulator', hasOperand: true },
    0x4: { name: 'STA', desc: 'Store Accumulator into RAM[addr]', hasOperand: true },
    0x5: { name: 'LDI', desc: 'Load Immediate value into Accumulator', hasOperand: true },
    0x6: { name: 'JMP', desc: 'Unconditional Jump to addr', hasOperand: true },
    0x7: { name: 'JC',  desc: 'Jump to addr if Carry Flag is set', hasOperand: true },
    0x8: { name: 'JZ',  desc: 'Jump to addr if Zero Flag is set', hasOperand: true },
    0x9: { name: 'OUT', desc: 'Output Accumulator to 7-Segment Display', hasOperand: false },
    0xA: { name: 'AND', desc: 'Bitwise AND RAM[addr] with Accumulator', hasOperand: true },
    0xB: { name: 'XOR', desc: 'Bitwise XOR RAM[addr] with Accumulator', hasOperand: true },
    0xC: { name: 'OR',  desc: 'Bitwise OR RAM[addr] with Accumulator', hasOperand: true },
    0xD: { name: 'NOT', desc: 'Bitwise NOT on Accumulator', hasOperand: false },
    0xF: { name: 'HLT', desc: 'Halt Execution Clock', hasOperand: false }
  };

  // Microcode Matrix: Fetch (T0, T1, T2) + Execute (T3, T4, T5)
  // T0: PC to MAR [CO, MI]
  // T1: RAM to IR [RO, II]
  // T2: PC Increment [CE]
  const FETCH_MICROCODE = [
    ['CO', 'MI'],
    ['RO', 'II'],
    ['CE']
  ];

  function getExecuteMicrocode(opcode, flags) {
    switch (opcode) {
      case 0x0: // NOP
        return [[], [], []];

      case 0x1: // LDA [addr]
        return [
          ['IO', 'MI'],       // T3: Operand to MAR
          ['RO', 'AI'],       // T4: RAM[MAR] to ACC
          []                  // T5
        ];

      case 0x2: // ADD [addr]
        return [
          ['IO', 'MI'],       // T3: Operand to MAR
          ['RO', 'BI'],       // T4: RAM[MAR] to B
          ['EO', 'AI', 'FI']  // T5: ALU Add -> ACC, update Flags
        ];

      case 0x3: // SUB [addr]
        return [
          ['IO', 'MI'],       // T3: Operand to MAR
          ['RO', 'BI'],       // T4: RAM[MAR] to B
          ['EO', 'AI', 'SU', 'FI'] // T5: ALU Sub -> ACC, update Flags
        ];

      case 0x4: // STA [addr]
        return [
          ['IO', 'MI'],       // T3: Operand to MAR
          ['AO', 'RI'],       // T4: ACC to RAM[MAR]
          []                  // T5
        ];

      case 0x5: // LDI val
        return [
          ['IO', 'AI'],       // T3: Immediate 4-bit to ACC
          [],                 // T4
          []                  // T5
        ];

      case 0x6: // JMP [addr]
        return [
          ['IO', 'J'],        // T3: Operand to PC
          [],                 // T4
          []                  // T5
        ];

      case 0x7: // JC [addr]
        return [
          flags.c ? ['IO', 'J'] : [], // T3: If Carry=1, jump
          [],
          []
        ];

      case 0x8: // JZ [addr]
        return [
          flags.z ? ['IO', 'J'] : [], // T3: If Zero=1, jump
          [],
          []
        ];

      case 0x9: // OUT
        return [
          ['AO', 'OI'],       // T3: ACC to OUT
          [],
          []
        ];

      case 0xA: // AND [addr]
        return [
          ['IO', 'MI'],
          ['RO', 'BI'],
          ['EO', 'AI', 'FI', 'OP_AND']
        ];

      case 0xB: // XOR [addr]
        return [
          ['IO', 'MI'],
          ['RO', 'BI'],
          ['EO', 'AI', 'FI', 'OP_XOR']
        ];

      case 0xC: // OR [addr]
        return [
          ['IO', 'MI'],
          ['RO', 'BI'],
          ['EO', 'AI', 'FI', 'OP_OR']
        ];

      case 0xD: // NOT
        return [
          ['EO', 'AI', 'FI', 'OP_NOT'],
          [],
          []
        ];

      case 0xF: // HLT
        return [
          ['HLT'],
          [],
          []
        ];

      default:
        return [[], [], []];
    }
  }

  // Micro-step Human Explanations in Korean
  function getStepExplanation(tStep, opcode, signals, flags) {
    const sigStr = signals.length > 0 ? `[${signals.join(', ')}]` : '[유휴 상태]';
    if (tStep === 0) {
      return `T0: 인출 주기 (Fetch 1/3) — PC 값을 주소 버스를 거쳐 MAR에 적재 ${sigStr}`;
    }
    if (tStep === 1) {
      return `T1: 인출 주기 (Fetch 2/3) — RAM[MAR] 명령어를 데이터 버스를 통해 IR에 적재 ${sigStr}`;
    }
    if (tStep === 2) {
      return `T2: 인출 주기 (Fetch 3/3) — 프로그램 카운터(PC) 1 증가 ${sigStr}`;
    }

    // T3, T4, T5 Execute
    const op = OPCODES[opcode] || { name: 'UNKNOWN' };
    const stepIdx = tStep - 3;
    switch (opcode) {
      case 0x0: // NOP
        return `T${tStep}: ${op.name} 실행 — 아무 동작 안 함 (No Operation) ${sigStr}`;
      case 0x1: // LDA
        if (stepIdx === 0) return `T3: LDA 실행 — IR 오퍼랜드 주소를 MAR에 적재 ${sigStr}`;
        if (stepIdx === 1) return `T4: LDA 실행 — RAM 데이터를 버스를 거쳐 ACC에 적재 ${sigStr}`;
        return `T5: LDA 실행 완료 ${sigStr}`;
      case 0x2: // ADD
        if (stepIdx === 0) return `T3: ADD 실행 — IR 오퍼랜드 주소를 MAR에 적재 ${sigStr}`;
        if (stepIdx === 1) return `T4: ADD 실행 — RAM 데이터를 B 레지스터에 적재 ${sigStr}`;
        return `T5: ADD 실행 — ALU 덧셈(ACC + B) 결과를 ACC에 저장하고 플래그(C, Z) 갱신 ${sigStr}`;
      case 0x3: // SUB
        if (stepIdx === 0) return `T3: SUB 실행 — IR 오퍼랜드 주소를 MAR에 적재 ${sigStr}`;
        if (stepIdx === 1) return `T4: SUB 실행 — RAM 데이터를 B 레지스터에 적재 ${sigStr}`;
        return `T5: SUB 실행 — ALU 뺄셈(ACC - B) 결과를 ACC에 저장하고 플래그(C, Z) 갱신 ${sigStr}`;
      case 0x4: // STA
        if (stepIdx === 0) return `T3: STA 실행 — IR 오퍼랜드 주소를 MAR에 적재 ${sigStr}`;
        if (stepIdx === 1) return `T4: STA 실행 — ACC 값을 RAM[MAR]에 기록 ${sigStr}`;
        return `T5: STA 실행 완료 ${sigStr}`;
      case 0x5: // LDI
        return `T3: LDI 실행 — 즉시값(4-bit)을 누산기(ACC)에 직접 적재 ${sigStr}`;
      case 0x6: // JMP
        return `T3: JMP 실행 — IR 주소를 PC로 직접 점프 로드 ${sigStr}`;
      case 0x7: // JC
        return `T3: JC 실행 — 캐리 플래그(${flags.c}) 확인 후 점프 ${flags.c ? '성공' : '미분기'} ${sigStr}`;
      case 0x8: // JZ
        return `T3: JZ 실행 — 제로 플래그(${flags.z}) 확인 후 점프 ${flags.z ? '성공' : '미분기'} ${sigStr}`;
      case 0x9: // OUT
        return `T3: OUT 실행 — 누산기(ACC) 값을 출력 레지스터(OUT)로 전송 ${sigStr}`;
      case 0xA: // AND
        if (stepIdx === 0) return `T3: AND 실행 — IR 주소를 MAR에 적재 ${sigStr}`;
        if (stepIdx === 1) return `T4: AND 실행 — RAM 데이터를 B 레지스터에 적재 ${sigStr}`;
        return `T5: AND 실행 — ALU 비트 AND 연산 후 ACC 저장 및 플래그 갱신 ${sigStr}`;
      case 0xB: // XOR
        if (stepIdx === 0) return `T3: XOR 실행 — IR 주소를 MAR에 적재 ${sigStr}`;
        if (stepIdx === 1) return `T4: XOR 실행 — RAM 데이터를 B 레지스터에 적재 ${sigStr}`;
        return `T5: XOR 실행 — ALU 비트 XOR 연산 후 ACC 저장 및 플래그 갱신 ${sigStr}`;
      case 0xF: // HLT
        return `T3: HLT 실행 — CPU 클럭 정지 (Halt) ${sigStr}`;
      default:
        return `T${tStep}: ${op.name} 실행 중 ${sigStr}`;
    }
  }

  // ==========================================================================
  // 2. PRESET PROGRAMS
  // ==========================================================================

  const PRESETS = {
    count: {
      name: '1) 0~15 카운트 루프 (Count Loop)',
      desc: '0부터 1씩 증가하며 7세그먼트 출력창에 표시하고 무한 반복합니다.',
      asm: `; ============================================
; 예제 1: 0부터 15까지 카운트 루프 (Count Loop)
; RAM[15]에 증가값 1을 저장하고 계속 더합니다.
; ============================================
ORG 0
START:
  LDI 0       ; 0x0: ACC = 0
  OUT         ; 0x1: 7-세그먼트 출력 (0)
LOOP:
  ADD 15      ; 0x2: ACC = ACC + RAM[15] (+1)
  OUT         ; 0x3: 출력 표시
  JMP LOOP    ; 0x4: 다시 LOOP로 점프 (무한 반복)

ORG 15
  DATA 1      ; RAM[15] = 1 (증가 단위)
`
    },

    add: {
      name: '2) 두 수 덧셈 (28 + 14 = 42)',
      desc: 'RAM[14]의 28과 RAM[15]의 14를 더해 42를 출력하고 정지합니다.',
      asm: `; ============================================
; 예제 2: 두 수의 덧셈 (28 + 14 = 42)
; RAM[14] = 28, RAM[15] = 14
; ============================================
ORG 0
  LDA 14      ; 0x0: RAM[14]에서 28 로드 (ACC = 28)
  ADD 15      ; 0x1: RAM[15]의 14를 더함 (ACC = 42)
  OUT         ; 0x2: 7-세그먼트에 42 출력
  HLT         ; 0x3: CPU 정지

ORG 14
  DATA 28     ; RAM[14] = 28 (0x1C)
  DATA 14     ; RAM[15] = 14 (0x0E)
`
    },

    mult: {
      name: '3) 반복 덧셈 곱셈 (6 × 7 = 42)',
      desc: '루프와 조건 분기(JZ)를 이용해 6과 7을 반복 덧셈으로 곱합니다.',
      asm: `; ============================================
; 예제 3: 반복 덧셈 곱셈 (6 × 7 = 42)
; RAM[12] = 피승수(7), RAM[13] = 누적곱(0)
; RAM[14] = 승수 카운터(6), RAM[15] = 1
; ============================================
ORG 0
LOOP:
  LDA 13      ; 0x0: 현재 누적곱 로드
  ADD 12      ; 0x1: 피승수(7) 더하기
  STA 13      ; 0x2: 누적곱 저장
  LDA 14      ; 0x3: 카운터 로드
  SUB 15      ; 0x4: 카운터 1 감소 (0이 되면 Z 플래그 1 설정)
  STA 14      ; 0x5: 감소된 카운터 저장
  JZ DONE     ; 0x6: 카운터가 0이면 DONE으로 탈출
  JMP LOOP    ; 0x7: 루프 반복
DONE:
  LDA 13      ; 0x8: 최종 곱 결과 로드 (42)
  OUT         ; 0x9: 42 출력
  HLT         ; 0xA: 정지

ORG 12
  DATA 7      ; RAM[12] = 7 (곱할 수)
  DATA 0      ; RAM[13] = 0 (결과 저장소)
  DATA 6      ; RAM[14] = 6 (반복 횟수)
  DATA 1      ; RAM[15] = 1 (감소 단위)
`
    },

    fibo: {
      name: '4) 피보나치 수열 (1, 1, 2, 3, 5, 8, 13, 21...)',
      desc: '8비트 오버플로(255 초과) 시 캐리(JC)로 안전하게 정지하는 피보나치 생성기입니다.',
      asm: `; ============================================
; 예제 4: 피보나치 수열 생성기
; 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233...
; 8비트 오버플로 발생 시 JC로 정지합니다.
; ============================================
ORG 0
LOOP:
  LDA 14      ; 0x0: 항 a 로드
  OUT         ; 0x1: 피보나치 수 출력
  ADD 15      ; 0x2: 다음 항 계산 (a + b)
  JC OVERFLOW ; 0x3: 캐리 발생 시 정지
  STA 13      ; 0x4: 임시 저장소(temp = a + b)
  LDA 15      ; 0x5: b 로드
  STA 14      ; 0x6: a = b
  LDA 13      ; 0x7: temp 로드
  STA 15      ; 0x8: b = temp
  JMP LOOP    ; 0x9: 다음 피보나치 수 계산
OVERFLOW:
  HLT         ; 0xA: 8비트 초과 시 정지

ORG 13
  DATA 0      ; RAM[13] = temp
  DATA 1      ; RAM[14] = a (초기값 1)
  DATA 1      ; RAM[15] = b (초기값 1)
`
    }
  };

  // ==========================================================================
  // 3. ASSEMBLER & DISASSEMBLER
  // ==========================================================================

  function assemble(asmText) {
    const ram = new Uint8Array(16);
    const errors = [];
    const lines = asmText.split('\n');

    const cleanLines = [];
    const labels = {};
    let currentAddr = 0;

    // First Pass: Collect labels and resolve ORG directives
    for (let i = 0; i < lines.length; i++) {
      let rawLine = lines[i];
      // Strip comments (; or //)
      const commentIdx = rawLine.search(/;|(\/\/)/);
      if (commentIdx !== -1) {
        rawLine = rawLine.substring(0, commentIdx);
      }
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Check label (e.g. "START:" or "LOOP:")
      const labelMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
      if (labelMatch) {
        const label = labelMatch[1].toUpperCase();
        labels[label] = currentAddr;
        const rest = labelMatch[2].trim();
        if (rest) {
          cleanLines.push({ lineNum: i + 1, addr: currentAddr, text: rest });
          currentAddr++;
        }
        continue;
      }

      // Check ORG directive (e.g. ORG 14 or ORG 0)
      const orgMatch = trimmed.match(/^ORG\s+([0-9]+|0x[0-9a-fA-F]+)$/i);
      if (orgMatch) {
        const addrVal = parseNumber(orgMatch[1]);
        if (addrVal < 0 || addrVal > 15) {
          errors.push(`줄 ${i + 1}: ORG 주소(${addrVal})는 0~15 범위여야 합니다.`);
        } else {
          currentAddr = addrVal;
        }
        continue;
      }

      cleanLines.push({ lineNum: i + 1, addr: currentAddr, text: trimmed });
      currentAddr++;
    }

    // Second Pass: Encode instructions and data bytes
    for (const item of cleanLines) {
      const { lineNum, addr, text } = item;
      if (addr < 0 || addr > 15) {
        errors.push(`줄 ${lineNum}: 16바이트 메모리 한도 초과 (주소 ${addr})`);
        continue;
      }

      const tokens = text.split(/\s+/).filter(Boolean);
      if (tokens.length === 0) continue;

      const mnemonic = tokens[0].toUpperCase();

      // Check DATA / DB / BYTE directive
      if (mnemonic === 'DATA' || mnemonic === 'DB' || mnemonic === 'BYTE') {
        if (tokens.length < 2) {
          errors.push(`줄 ${lineNum}: DATA 뒤에 숫자 값이 필요합니다.`);
          continue;
        }
        const val = parseNumber(tokens[1]);
        if (isNaN(val)) {
          errors.push(`줄 ${lineNum}: 유효하지 않은 숫자 "${tokens[1]}"`);
        } else {
          ram[addr] = val & 0xFF;
        }
        continue;
      }

      // Find instruction opcode
      let opcodeFound = null;
      for (const [code, info] of Object.entries(OPCODES)) {
        if (info.name === mnemonic) {
          opcodeFound = parseInt(code, 10);
          break;
        }
      }

      if (opcodeFound === null) {
        errors.push(`줄 ${lineNum}: 알 수 없는 명령어 "${mnemonic}"`);
        continue;
      }

      const opInfo = OPCODES[opcodeFound];
      let operand = 0;

      if (opInfo.hasOperand) {
        if (tokens.length < 2) {
          errors.push(`줄 ${lineNum}: ${mnemonic} 명령어는 오퍼랜드(주소 또는 값)가 필요합니다.`);
          continue;
        }
        const opToken = tokens[1].toUpperCase();
        if (labels.hasOwnProperty(opToken)) {
          operand = labels[opToken];
        } else {
          const num = parseNumber(opToken);
          if (isNaN(num)) {
            errors.push(`줄 ${lineNum}: 유효하지 않은 오퍼랜드 레이블 또는 숫자 "${opToken}"`);
            continue;
          }
          if (num < 0 || num > 15) {
            errors.push(`줄 ${lineNum}: 오퍼랜드 값(${num})은 4비트(0~15)여야 합니다.`);
          }
          operand = num & 0x0F;
        }
      }

      const machineByte = ((opcodeFound & 0x0F) << 4) | (operand & 0x0F);
      ram[addr] = machineByte;
    }

    return { ram, errors, labels };
  }

  function parseNumber(str) {
    if (typeof str !== 'string') return NaN;
    const s = str.trim();
    if (s.startsWith('0x') || s.startsWith('0X')) {
      return parseInt(s.substring(2), 16);
    }
    if (s.startsWith('0b') || s.startsWith('0B') || s.startsWith('%')) {
      return parseInt(s.replace(/^0b|^0B|^%/, ''), 2);
    }
    return parseInt(s, 10);
  }

  function disassemble(byte) {
    const b = byte & 0xFF;
    const opcode = (b >> 4) & 0x0F;
    const operand = b & 0x0F;
    const info = OPCODES[opcode];

    if (!info) {
      return { mnemonic: '???', operand, text: `0x${b.toString(16).toUpperCase().padStart(2, '0')}` };
    }

    if (!info.hasOperand) {
      return { mnemonic: info.name, operand: 0, text: info.name };
    }

    return {
      mnemonic: info.name,
      operand,
      text: `${info.name} ${operand}`
    };
  }

  // ==========================================================================
  // 4. CPU SIMULATION ENGINE (CORE CLASS)
  // ==========================================================================

  class CpuCore {
    constructor() {
      this.reset(true);
    }

    reset(clearRam = false) {
      this.pc = 0;              // 4-bit Program Counter (0~15)
      this.mar = 0;             // 4-bit Memory Address Register (0~15)
      this.ir = 0;              // 8-bit Instruction Register
      this.acc = 0;             // 8-bit Accumulator
      this.b = 0;               // 8-bit B Register
      this.out = 0;             // 8-bit Output Register
      this.flags = { c: 0, z: 0 }; // Carry & Zero Flags
      this.tStep = 0;           // 0~5 Sequencer T-State
      this.halted = false;      // Halt state
      this.bus = 0;             // 8-bit Bus Value
      this.activeSignals = [];  // List of active signal names
      this.cycleCount = 0;      // Total micro-step cycles
      this.instructionCount = 0;// Total instructions executed
      this.lastAluOp = 'ADD';   // Mode of ALU

      if (clearRam || !this.ram) {
        this.ram = new Uint8Array(16);
      }
    }

    loadRam(bytes) {
      for (let i = 0; i < 16; i++) {
        this.ram[i] = bytes && bytes[i] !== undefined ? bytes[i] & 0xFF : 0;
      }
      this.reset(false);
    }

    // Advance exactly 1 micro-step (T0..T5)
    stepMicro() {
      if (this.halted) return false;

      const currentT = this.tStep;
      const opcode = (this.ir >> 4) & 0x0F;

      // 1. Determine active signals for current T-step
      let signals = [];
      if (currentT < 3) {
        signals = [...FETCH_MICROCODE[currentT]];
      } else {
        const execSteps = getExecuteMicrocode(opcode, this.flags);
        signals = [...(execSteps[currentT - 3] || [])];
      }

      this.activeSignals = signals;

      // Check HLT signal
      if (signals.includes('HLT')) {
        this.halted = true;
        return false;
      }

      // 2. Bus Master Phase: Which module outputs onto the 8-bit Bus?
      let busVal = 0;
      let aluCarry = 0;
      let aluZero = 0;
      let aluResult = 0;

      if (signals.includes('CO')) {
        // Counter Out: PC lower 4 bits to bus
        busVal = this.pc & 0x0F;
      } else if (signals.includes('RO')) {
        // RAM Out: RAM[MAR] to bus
        busVal = this.ram[this.mar & 0x0F] & 0xFF;
      } else if (signals.includes('IO')) {
        // IR Out: Lower 4 bits of IR (operand) to bus
        busVal = this.ir & 0x0F;
      } else if (signals.includes('AO')) {
        // Accumulator Out
        busVal = this.acc & 0xFF;
      } else if (signals.includes('EO')) {
        // ALU Out
        if (signals.includes('SU')) {
          this.lastAluOp = 'SUB';
          const diff = this.acc - this.b;
          aluCarry = diff >= 0 ? 1 : 0; // Carry=1 means no borrow in SAP-1
          aluResult = (diff + 256) & 0xFF;
        } else if (signals.includes('OP_AND')) {
          this.lastAluOp = 'AND';
          aluResult = (this.acc & this.b) & 0xFF;
          aluCarry = 0;
        } else if (signals.includes('OP_XOR')) {
          this.lastAluOp = 'XOR';
          aluResult = (this.acc ^ this.b) & 0xFF;
          aluCarry = 0;
        } else if (signals.includes('OP_OR')) {
          this.lastAluOp = 'OR';
          aluResult = (this.acc | this.b) & 0xFF;
          aluCarry = 0;
        } else if (signals.includes('OP_NOT')) {
          this.lastAluOp = 'NOT';
          aluResult = (~this.acc) & 0xFF;
          aluCarry = 0;
        } else {
          // Default ADD
          this.lastAluOp = 'ADD';
          const sum = this.acc + this.b;
          aluCarry = sum > 255 ? 1 : 0;
          aluResult = sum & 0xFF;
        }
        aluZero = aluResult === 0 ? 1 : 0;
        busVal = aluResult;
      }

      this.bus = busVal & 0xFF;

      // 3. Bus Listener Phase: Which modules read from the Bus?
      if (signals.includes('MI')) {
        this.mar = this.bus & 0x0F;
      }
      if (signals.includes('RI')) {
        this.ram[this.mar & 0x0F] = this.bus & 0xFF;
      }
      if (signals.includes('II')) {
        this.ir = this.bus & 0xFF;
      }
      if (signals.includes('AI')) {
        this.acc = this.bus & 0xFF;
      }
      if (signals.includes('BI')) {
        this.b = this.bus & 0xFF;
      }
      if (signals.includes('OI')) {
        this.out = this.bus & 0xFF;
      }
      if (signals.includes('J')) {
        this.pc = this.bus & 0x0F;
      }

      // Flags Register Latch
      if (signals.includes('FI')) {
        this.flags.c = aluCarry;
        this.flags.z = aluZero;
      }

      // Counter Enable
      if (signals.includes('CE')) {
        this.pc = (this.pc + 1) & 0x0F;
      }

      // 4. Advance Micro-step Sequencer
      this.tStep = (this.tStep + 1) % 6;
      this.cycleCount++;
      if (this.tStep === 0) {
        this.instructionCount++;
      }

      return true;
    }

    // Step entire instruction (completes until next T0 or HLT)
    stepInstruction() {
      if (this.halted) return false;
      let safetyCounter = 0;
      do {
        this.stepMicro();
        safetyCounter++;
      } while (!this.halted && this.tStep !== 0 && safetyCounter < 10);
      return !this.halted;
    }

    getStatus() {
      const opcode = (this.ir >> 4) & 0x0F;
      const operand = this.ir & 0x0F;
      const opInfo = OPCODES[opcode] || { name: 'UNKNOWN' };
      const explanation = getStepExplanation(this.tStep, opcode, this.activeSignals, this.flags);

      return {
        pc: this.pc,
        mar: this.mar,
        ir: this.ir,
        opcode,
        operand,
        mnemonic: opInfo.name,
        acc: this.acc,
        b: this.b,
        out: this.out,
        flags: { ...this.flags },
        tStep: this.tStep,
        halted: this.halted,
        bus: this.bus,
        activeSignals: [...this.activeSignals],
        cycleCount: this.cycleCount,
        instructionCount: this.instructionCount,
        ram: Array.from(this.ram),
        explanation,
        lastAluOp: this.lastAluOp
      };
    }
  }

  // ==========================================================================
  // 5. 60 FPS 2D CANVAS RENDERER & VISUALIZER
  // ==========================================================================

  function renderCpuCanvas(canvas, cpu, pulseOffset = 0, outFormat = 'unsigned') {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.width || 960;
    const h = rect.height || canvas.height || 540;

    // HiDPI Resizing Check
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Coordinate system: Base logical grid 1000 x 560
    const scaleX = w / 1000;
    const scaleY = h / 560;
    ctx.scale(scaleX, scaleY);

    // 1. Background Grid & Pure WHITE High-Contrast Outlined E-ink Theme
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 560);

    // Subtle Circuit Grid: light slate 'rgba(15, 23, 42, 0.08)'
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 20; x < 1000; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 560);
      ctx.stroke();
    }
    for (let y = 20; y < 560; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1000, y);
      ctx.stroke();
    }

    const signals = cpu.activeSignals;
    const busY = 275; // Center Y of Central Data Bus
    const isBusActive = signals.some(s => ['CO', 'RO', 'IO', 'AO', 'EO'].includes(s));

    // 2. Central 8-bit Data Bus (Glowing Highway)
    drawCentralBus(ctx, busY, cpu.bus, isBusActive, pulseOffset);

    // 3. Microcode T-States & Status Header
    drawSequencerBar(ctx, 50, 15, 900, 36, cpu.tStep, signals, cpu.halted);

    // 4. Module Blocks (Registers & Logic Units)
    // Top Row: PC, MAR, RAM, IR
    drawModulePC(ctx, 40, 68, 170, 140, cpu.pc, signals);
    drawModuleMAR(ctx, 240, 68, 160, 140, cpu.mar, signals);
    drawModuleRAM(ctx, 430, 68, 280, 140, cpu.ram, cpu.mar, cpu.pc, signals);
    drawModuleIR(ctx, 740, 68, 220, 140, cpu.ir, signals);

    // Bottom Row: ACC, ALU + Flags, B, OUT
    drawModuleACC(ctx, 40, 345, 180, 145, cpu.acc, signals);
    drawModuleALU(ctx, 250, 340, 240, 155, cpu.acc, cpu.b, cpu.bus, cpu.flags, cpu.lastAluOp, signals);
    drawModuleB(ctx, 520, 345, 170, 145, cpu.b, signals);
    drawModuleOUT(ctx, 720, 345, 240, 145, cpu.out, signals, outFormat);

    // 5. Connecting Bus Wires with Animated Flow Particles
    drawBusWires(ctx, busY, signals, pulseOffset);

    // 6. Educational Status Banner at Bottom
    drawStatusBanner(ctx, 40, 505, 920, 42, cpu);

    ctx.restore();
  }

  // --- SUB-RENDERERS ---

  function drawCentralBus(ctx, y, busVal, isActive, pulseOffset) {
    ctx.save();
    const busH = 50;

    // Bus Highway background: #ffffff with border: 2px solid #0f172a
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, 40, y - busH / 2, 920, busH, 8, true, true);

    // 8 Copper Data Bus Traces: crisp dark slate #334155, active bits highlighted with vivid #2563eb
    const lineSpacing = 4.8;
    const startY = y - (3.5 * lineSpacing);
    for (let i = 0; i < 8; i++) {
      const bitVal = (busVal >> (7 - i)) & 1;
      const curY = startY + i * lineSpacing;
      if (bitVal && isActive) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.2;
      } else if (isActive) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
      }
      ctx.beginPath();
      ctx.moveTo(50, curY);
      ctx.lineTo(950, curY);
      ctx.stroke();
    }

    // Center Badge: 8-Bit Common Bus LED Indicator
    const badgeW = 340;
    const badgeH = 34;
    const badgeX = 500 - badgeW / 2;
    const badgeY = y - badgeH / 2;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 6, true, true);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText('8-BIT COMMON BUS:', badgeX + 12, y + 4);

    // 8 LEDs
    const ledStartX = badgeX + 155;
    for (let b = 7; b >= 0; b--) {
      const bit = (busVal >> b) & 1;
      const lx = ledStartX + (7 - b) * 16;
      drawLed(ctx, lx, y, 5, bit && isActive, '#2563eb', '#f1f5f9');
    }

    // Bus Hex & Dec Readout
    ctx.fillStyle = isActive ? '#2563eb' : '#0f172a';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(`0x${busVal.toString(16).toUpperCase().padStart(2, '0')} (${busVal})`, badgeX + 282, y + 4);

    ctx.restore();
  }

  function drawSequencerBar(ctx, x, y, w, h, tStep, signals, halted) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 6, true, true);

    // Label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText('MICROCODE SEQUENCER:', x + 12, y + 22);

    // 6 T-States Badges (T0..T5)
    const tNames = ['T0 (MAR)', 'T1 (IR)', 'T2 (PC+1)', 'T3 (EXEC1)', 'T4 (EXEC2)', 'T5 (EXEC3)'];
    const badgeStartX = x + 165;
    const bw = 84;
    const gap = 8;

    for (let i = 0; i < 6; i++) {
      const bx = badgeStartX + i * (bw + gap);
      const isCurrent = (tStep === i) && !halted;

      ctx.fillStyle = isCurrent ? '#0f172a' : '#ffffff';
      ctx.strokeStyle = isCurrent ? '#0f172a' : '#64748b';
      ctx.lineWidth = isCurrent ? 2 : 1;

      roundRect(ctx, bx, y + 5, bw, h - 10, 4, true, true);

      ctx.fillStyle = isCurrent ? '#ffffff' : '#0f172a';
      ctx.font = isCurrent ? 'bold 10px ui-monospace, monospace' : '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tNames[i], bx + bw / 2, y + 22);
      ctx.textAlign = 'left';
    }

    // Active Control Signals Badges on right side
    const activeText = signals.length > 0 ? signals.join(' ') : 'IDLE';
    ctx.fillStyle = halted ? '#dc2626' : '#16a34a';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(halted ? '● HALTED' : `ACT: ${activeText}`, x + w - 16, y + 22);
    ctx.textAlign = 'left';

    ctx.restore();
  }

  // --- MODULE BLOCKS ---

  function drawModuleHeader(ctx, x, y, w, title, bits, badgeText) {
    ctx.fillStyle = '#f1f5f9';
    roundRect(ctx, x, y, w, 28, { tl: 8, tr: 8, bl: 0, br: 0 }, true, false);

    // Bottom border #0f172a
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 28);
    ctx.lineTo(x + w, y + 28);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(title, x + 12, y + 18);

    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText(bits, x + 12 + ctx.measureText(title).width + 6, y + 18);

    if (badgeText) {
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(badgeText, x + w - 10, y + 18);
      ctx.textAlign = 'left';
    }
  }

  function drawModulePC(ctx, x, y, w, h, pcVal, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'PC', '4-Bit', `0x${pcVal.toString(16).toUpperCase()}`);

    // Numeric Display
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px ui-monospace, monospace';
    ctx.fillText(`VAL: ${pcVal}`, x + 16, y + 62);

    // 4 LEDs
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('BITS [3..0]:', x + 16, y + 84);
    for (let i = 3; i >= 0; i--) {
      const bit = (pcVal >> i) & 1;
      drawLed(ctx, x + 24 + (3 - i) * 22, y + 102, 6, bit, '#16a34a', '#f1f5f9');
    }

    // Control Pins: CO, CE, J
    drawPinBadge(ctx, x + 12, y + 118, 'CO', signals.includes('CO'), '#d97706');
    drawPinBadge(ctx, x + 62, y + 118, 'CE', signals.includes('CE'), '#16a34a');
    drawPinBadge(ctx, x + 112, y + 118, 'J', signals.includes('J'), '#2563eb');

    ctx.restore();
  }

  function drawModuleMAR(ctx, x, y, w, h, marVal, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'MAR', '4-Bit', `ADDR: ${marVal}`);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px ui-monospace, monospace';
    ctx.fillText(`0x${marVal.toString(16).toUpperCase()} [${marVal}]`, x + 16, y + 62);

    // 4 LEDs
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('BITS [3..0]:', x + 16, y + 84);
    for (let i = 3; i >= 0; i--) {
      const bit = (marVal >> i) & 1;
      drawLed(ctx, x + 24 + (3 - i) * 22, y + 102, 6, bit, '#0284c7', '#f1f5f9');
    }

    // Control Pin: MI
    drawPinBadge(ctx, x + 16, y + 118, 'MI', signals.includes('MI'), '#d97706');

    ctx.restore();
  }

  function drawModuleRAM(ctx, x, y, w, h, ram, mar, pc, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'RAM', '16 x 8-Bit', `CELL[${mar}]=0x${ram[mar].toString(16).toUpperCase().padStart(2, '0')}`);

    // Mini 4x4 RAM Matrix
    const gridX = x + 14;
    const gridY = y + 36;
    const cellW = 38;
    const cellH = 18;
    const gapX = 6;
    const gapY = 4;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const addr = r * 4 + c;
        const cx = gridX + c * (cellW + gapX);
        const cy = gridY + r * (cellH + gapY);

        const isMar = addr === mar;
        const isPc = addr === pc;

        if (isMar && isPc) {
          ctx.fillStyle = '#dcfce7';
          ctx.strokeStyle = '#16a34a';
        } else if (isMar) {
          ctx.fillStyle = '#e0f2fe';
          ctx.strokeStyle = '#0284c7';
        } else if (isPc) {
          ctx.fillStyle = '#fef3c7';
          ctx.strokeStyle = '#d97706';
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#cbd5e1';
        }

        ctx.lineWidth = isMar || isPc ? 1.5 : 1;
        roundRect(ctx, cx, cy, cellW, cellH, 3, true, true);

        // Byte hex
        ctx.fillStyle = isMar || isPc ? '#0f172a' : '#334155';
        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ram[addr].toString(16).toUpperCase().padStart(2, '0'), cx + cellW / 2, cy + 12);
        ctx.textAlign = 'left';
      }
    }

    // Pins RO, RI on bottom
    drawPinBadge(ctx, x + 195, y + 42, 'RO', signals.includes('RO'), '#d97706');
    drawPinBadge(ctx, x + 195, y + 80, 'RI', signals.includes('RI'), '#dc2626');

    ctx.restore();
  }

  function drawModuleIR(ctx, x, y, w, h, irVal, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    const opcode = (irVal >> 4) & 0x0F;
    const operand = irVal & 0x0F;
    const opInfo = OPCODES[opcode] || { name: '???' };

    drawModuleHeader(ctx, x, y, w, 'IR', '8-Bit', `${opInfo.name} ${operand}`);

    // Disassembly Text Badge
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 12, y + 36, w - 24, 30, 4, true, true);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px ui-monospace, monospace';
    ctx.fillText(`${opInfo.name} ${operand}`, x + 20, y + 56);

    ctx.fillStyle = '#334155';
    ctx.font = '9px ui-monospace, monospace';
    ctx.fillText(`[OP: 0x${opcode.toString(16).toUpperCase()} | ARG: 0x${operand.toString(16).toUpperCase()}]`, x + 115, y + 55);

    // 8 LEDs (Opcode 4b + Operand 4b)
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('OPCODE [7..4] | OPERAND [3..0]', x + 12, y + 84);

    for (let i = 7; i >= 0; i--) {
      const bit = (irVal >> i) & 1;
      const lx = x + 18 + (7 - i) * 16 + (i < 4 ? 6 : 0);
      drawLed(ctx, lx, y + 102, 5, bit, i >= 4 ? '#d97706' : '#0284c7', '#f1f5f9');
    }

    // Pins: II, IO
    drawPinBadge(ctx, x + 160, y + 80, 'II', signals.includes('II'), '#d97706');
    drawPinBadge(ctx, x + 160, y + 110, 'IO', signals.includes('IO'), '#16a34a');

    ctx.restore();
  }

  function drawModuleACC(ctx, x, y, w, h, accVal, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'ACC (누산기)', '8-Bit', `0x${accVal.toString(16).toUpperCase().padStart(2, '0')}`);

    // Value Big Display
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px ui-monospace, monospace';
    ctx.fillText(`${accVal}`, x + 16, y + 64);

    ctx.fillStyle = '#334155';
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillText(`(0x${accVal.toString(16).toUpperCase().padStart(2, '0')})`, x + 90, y + 64);

    // 8 LEDs
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('BITS [7..0]:', x + 16, y + 88);
    for (let i = 7; i >= 0; i--) {
      const bit = (accVal >> i) & 1;
      drawLed(ctx, x + 16 + (7 - i) * 19, y + 106, 5, bit, '#16a34a', '#f1f5f9');
    }

    // Pins: AI, AO
    drawPinBadge(ctx, x + 16, y + 120, 'AI', signals.includes('AI'), '#d97706');
    drawPinBadge(ctx, x + 70, y + 120, 'AO', signals.includes('AO'), '#2563eb');

    ctx.restore();
  }

  function drawModuleALU(ctx, x, y, w, h, acc, b, bus, flags, lastOp, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'ALU (산술논리장치)', '8-Bit', `OP: ${lastOp}`);

    // Classic Trapezoid / V-Shape ALU Symbol
    const aluTopW = 120;
    const aluBotW = 70;
    const aluH = 50;
    const aluX = x + 20;
    const aluY = y + 36;

    ctx.beginPath();
    ctx.moveTo(aluX, aluY);
    ctx.lineTo(aluX + 45, aluY);
    ctx.lineTo(aluX + aluTopW / 2, aluY + 14); // Inner V notch
    ctx.lineTo(aluX + aluTopW - 45, aluY);
    ctx.lineTo(aluX + aluTopW, aluY);
    ctx.lineTo(aluX + aluTopW / 2 + aluBotW / 2, aluY + aluH);
    ctx.lineTo(aluX + aluTopW / 2 - aluBotW / 2, aluY + aluH);
    ctx.closePath();

    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Operation Glyph inside ALU
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.textAlign = 'center';
    let opGlyph = '+';
    if (signals.includes('SU')) opGlyph = '−';
    else if (signals.includes('OP_AND')) opGlyph = 'AND';
    else if (signals.includes('OP_XOR')) opGlyph = 'XOR';
    else if (signals.includes('OP_OR')) opGlyph = 'OR';
    else if (signals.includes('OP_NOT')) opGlyph = 'NOT';
    ctx.fillText(opGlyph, aluX + aluTopW / 2, aluY + 36);
    ctx.textAlign = 'left';

    // Inputs & Output labels
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText(`A:${acc}`, aluX, aluY - 4);
    ctx.fillText(`B:${b}`, aluX + aluTopW - 25, aluY - 4);

    // Flags Register Section (Right side)
    const fx = x + 155;
    const fy = y + 38;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    roundRect(ctx, fx, fy, 75, 60, 4, true, true);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.fillText('FLAGS [C, Z]', fx + 6, fy + 14);

    // Carry Flag LED
    drawLed(ctx, fx + 16, fy + 32, 5, flags.c, '#dc2626', '#f1f5f9');
    ctx.fillStyle = flags.c ? '#dc2626' : '#334155';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText('C', fx + 26, fy + 36);

    // Zero Flag LED
    drawLed(ctx, fx + 16, fy + 48, 5, flags.z, '#16a34a', '#f1f5f9');
    ctx.fillStyle = flags.z ? '#16a34a' : '#334155';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.fillText('Z', fx + 26, fy + 52);

    // ALU Control Pins
    drawPinBadge(ctx, x + 16, y + 120, 'EO', signals.includes('EO'), '#d97706');
    drawPinBadge(ctx, x + 66, y + 120, 'SU', signals.includes('SU'), '#dc2626');
    drawPinBadge(ctx, x + 116, y + 120, 'FI', signals.includes('FI'), '#2563eb');

    ctx.restore();
  }

  function drawModuleB(ctx, x, y, w, h, bVal, signals) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'B 레지스터', '8-Bit', `0x${bVal.toString(16).toUpperCase().padStart(2, '0')}`);

    // Numeric Display
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px ui-monospace, monospace';
    ctx.fillText(`${bVal}`, x + 16, y + 64);

    // 8 LEDs
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('BITS [7..0]:', x + 16, y + 88);
    for (let i = 7; i >= 0; i--) {
      const bit = (bVal >> i) & 1;
      drawLed(ctx, x + 16 + (7 - i) * 18, y + 106, 5, bit, '#0284c7', '#f1f5f9');
    }

    // Pin: BI
    drawPinBadge(ctx, x + 16, y + 120, 'BI', signals.includes('BI'), '#d97706');

    ctx.restore();
  }

  function drawModuleOUT(ctx, x, y, w, h, outVal, signals, outFormat) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 8, true, true);

    drawModuleHeader(ctx, x, y, w, 'OUT (출력)', '8-Bit', `OI:${signals.includes('OI') ? 'ON' : 'OFF'}`);

    // Clean crisp 7-Segment Decimal Readout Panel
    const dispW = 145;
    const dispH = 55;
    const dispX = x + 12;
    const dispY = y + 36;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    roundRect(ctx, dispX, dispY, dispW, dispH, 6, true, true);

    // Format text
    let strVal = '';
    if (outFormat === 'signed') {
      const signed = outVal > 127 ? outVal - 256 : outVal;
      strVal = `${signed}`.padStart(4, ' ');
    } else if (outFormat === 'hex') {
      strVal = `0x${outVal.toString(16).toUpperCase().padStart(2, '0')}`;
    } else if (outFormat === 'bin') {
      strVal = outVal.toString(2).padStart(8, '0');
    } else {
      strVal = `${outVal}`.padStart(3, '0');
    }

    // Authentic 7-Segment Style Digit Rendering: clean crisp background (#ffffff), dark/amber segment illumination
    draw7SegmentText(ctx, dispX + 10, dispY + 12, strVal);

    // 8 LEDs on bottom
    ctx.fillStyle = '#334155';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('BITS [7..0]:', x + 12, y + 104);
    for (let i = 7; i >= 0; i--) {
      const bit = (outVal >> i) & 1;
      drawLed(ctx, x + 12 + (7 - i) * 17, y + 118, 4.5, bit, '#dc2626', '#f1f5f9');
    }

    // Pin: OI
    drawPinBadge(ctx, x + 175, y + 50, 'OI', signals.includes('OI'), '#dc2626');

    ctx.restore();
  }

  // --- CONNECTING BUS WIRES & DATA PARTICLES ---

  function drawBusWires(ctx, busY, signals, pulseOffset) {
    ctx.save();

    // Wires from modules to Central Bus
    const wires = [
      { pin: 'CO', x: 125, yTop: 208, yBot: busY, dir: 'down', color: '#d97706' },
      { pin: 'MI', x: 320, yTop: 208, yBot: busY, dir: 'up',   color: '#d97706' },
      { pin: 'RO', x: 520, yTop: 208, yBot: busY, dir: 'down', color: '#d97706' },
      { pin: 'RI', x: 625, yTop: 208, yBot: busY, dir: 'up',   color: '#dc2626' },
      { pin: 'II', x: 800, yTop: 208, yBot: busY, dir: 'up',   color: '#d97706' },
      { pin: 'IO', x: 880, yTop: 208, yBot: busY, dir: 'down', color: '#16a34a' },

      { pin: 'AI', x: 120, yTop: busY, yBot: 345, dir: 'down', color: '#d97706' },
      { pin: 'AO', x: 175, yTop: busY, yBot: 345, dir: 'up',   color: '#2563eb' },
      { pin: 'EO', x: 370, yTop: busY, yBot: 340, dir: 'up',   color: '#d97706' },
      { pin: 'BI', x: 605, yTop: busY, yBot: 345, dir: 'down', color: '#d97706' },
      { pin: 'OI', x: 840, yTop: busY, yBot: 345, dir: 'down', color: '#dc2626' }
    ];

    for (const w of wires) {
      const active = signals.includes(w.pin);

      ctx.beginPath();
      ctx.moveTo(w.x, w.yTop);
      ctx.lineTo(w.x, w.yBot);

      if (active) {
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = w.dir === 'down' ? -pulseOffset * 15 : pulseOffset * 15;
      } else {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([]);
      }
      ctx.stroke();

      // Bus connection dot
      ctx.beginPath();
      ctx.arc(w.x, busY, active ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = active ? w.color : '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- EDUCATIONAL STATUS BANNER ---

  function drawStatusBanner(ctx, x, y, w, h, cpu) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 6, true, true);

    const opcode = (cpu.ir >> 4) & 0x0F;
    const explanation = getStepExplanation(cpu.tStep, opcode, cpu.activeSignals, cpu.flags);

    ctx.fillStyle = cpu.halted ? '#dc2626' : '#0f172a';
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText(cpu.halted ? '● [CPU HALT] 실행이 정지되었습니다.' : `▶ CYCLE ${cpu.cycleCount} (INST ${cpu.instructionCount})`, x + 14, y + 17);

    ctx.fillStyle = '#0f172a';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(explanation, x + 14, y + 33);

    ctx.restore();
  }

  // --- 7-SEGMENT DISPLAY RENDERER ---

  function draw7SegmentDigit(ctx, x, y, char, size = 1.0) {
    // 7 segments: A (top), B (top-right), C (bot-right), D (bot), E (bot-left), F (top-left), G (mid)
    const map = {
      '0': [1,1,1,1,1,1,0],
      '1': [0,1,1,0,0,0,0],
      '2': [1,1,0,1,1,0,1],
      '3': [1,1,1,1,0,0,1],
      '4': [0,1,1,0,0,1,1],
      '5': [1,0,1,1,0,1,1],
      '6': [1,0,1,1,1,1,1],
      '7': [1,1,1,0,0,0,0],
      '8': [1,1,1,1,1,1,1],
      '9': [1,1,1,1,0,1,1],
      '-': [0,0,0,0,0,0,1],
      ' ': [0,0,0,0,0,0,0]
    };

    const segs = map[char] || [0,0,0,0,0,0,0];
    const w = 18 * size;
    const h = 32 * size;
    const t = 3.2 * size; // segment thickness

    ctx.save();
    ctx.translate(x, y);

    function drawSeg(on, pathFn) {
      ctx.fillStyle = on ? '#b45309' : '#f1f5f9';
      ctx.strokeStyle = on ? '#92400e' : '#e2e8f0';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      pathFn();
      ctx.fill();
      ctx.stroke();
    }

    // A: Top
    drawSeg(segs[0], () => { ctx.rect(t, 0, w - 2*t, t); });
    // B: Top-Right
    drawSeg(segs[1], () => { ctx.rect(w - t, t, t, h/2 - 1.5*t); });
    // C: Bot-Right
    drawSeg(segs[2], () => { ctx.rect(w - t, h/2 + 0.5*t, t, h/2 - 1.5*t); });
    // D: Bottom
    drawSeg(segs[3], () => { ctx.rect(t, h - t, w - 2*t, t); });
    // E: Bot-Left
    drawSeg(segs[4], () => { ctx.rect(0, h/2 + 0.5*t, t, h/2 - 1.5*t); });
    // F: Top-Left
    drawSeg(segs[5], () => { ctx.rect(0, t, t, h/2 - 1.5*t); });
    // G: Middle
    drawSeg(segs[6], () => { ctx.rect(t, h/2 - t/2, w - 2*t, t); });

    ctx.restore();
  }

  function draw7SegmentText(ctx, x, y, text) {
    let curX = x;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      draw7SegmentDigit(ctx, curX, y, ch, 0.95);
      curX += 24;
    }
  }

  // --- DRAWING HELPERS ---

  function drawLed(ctx, x, y, r, isOn, onColor, offColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isOn ? onColor : '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function drawPinBadge(ctx, x, y, label, isActive, activeColor) {
    ctx.save();
    ctx.fillStyle = isActive ? (activeColor || '#0f172a') : '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    roundRect(ctx, x, y, 32, 16, 3, true, true);

    ctx.fillStyle = isActive ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 16, y + 11);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'number') {
      r = { tl: r, tr: r, br: r, bl: r };
    } else {
      r = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, r);
    }
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // ==========================================================================
  // 6. INTERACTIVE SIMULATOR WRAPPER & CONTROLLER
  // ==========================================================================

  let globalInstance = null;

  class CpuSimulator {
    constructor(containerEl, options = {}) {
      this.container = typeof containerEl === 'string' ? document.querySelector(containerEl) : containerEl;
      this.options = options;
      this.cpu = new CpuCore();
      this.clockSpeed = options.speed || 5; // 5 Hz default
      this.outFormat = 'unsigned';
      this.isRunning = false;
      this.timerId = null;
      this.animFrameId = null;
      this.pulseOffset = 0;

      if (this.container) {
        this.buildUI();
        this.bindEvents();
        this.loadPreset('count');
      }

      this.startRenderLoop();
    }

    buildUI() {
      this.container.innerHTML = `
        <div class="cpu-sim-wrapper">
          <!-- Top Header -->
          <div class="cpu-sim-header">
            <div class="cpu-sim-title">
              <i class="fi fi-rr-microchip"></i>
              <span>8-bit 가상 컴퓨터 & CPU 시뮬레이터 (SAP-1 / 폰 노이만)</span>
            </div>
            <div class="cpu-sim-badges">
              <span class="cpu-badge cpu-badge-bus"><i class="fi fi-rr-bolt"></i> 8-Bit Data Bus</span>
              <span class="cpu-badge cpu-badge-addr"><i class="fi fi-rr-database"></i> 4-Bit Address Bus</span>
              <span class="cpu-badge cpu-badge-clock" id="cpuBadgeClock"><i class="fi fi-rr-time-forward"></i> Clock: 5 Hz</span>
              <span class="cpu-badge cpu-badge-halted" id="cpuBadgeHalted" style="display:none;"><i class="fi fi-rr-stop"></i> HALTED</span>
            </div>
          </div>

          <!-- Canvas Visualizer -->
          <div class="cpu-sim-canvas-container">
            <canvas class="cpu-sim-canvas"></canvas>
          </div>

          <!-- Controls Dashboard -->
          <div class="cpu-sim-controls">
            <div class="cpu-btn-group">
              <button class="cpu-btn cpu-btn-primary" id="cpuBtnRun">
                <i class="fi fi-rr-play"></i> <span id="cpuRunLabel">실행</span>
              </button>
              <button class="cpu-btn" id="cpuBtnStepMicro">
                <i class="fi fi-rr-step-forward"></i> 마이크로 스텝 (1 T-Cycle)
              </button>
              <button class="cpu-btn" id="cpuBtnStepInst">
                <i class="fi fi-rr-angle-double-right"></i> 명령어 스텝 (1 Inst)
              </button>
              <button class="cpu-btn cpu-btn-warn" id="cpuBtnReset">
                <i class="fi fi-rr-refresh"></i> 리셋
              </button>
              <button class="cpu-btn cpu-btn-danger" id="cpuBtnClearRam">
                <i class="fi fi-rr-trash"></i> RAM 초기화
              </button>
            </div>

            <!-- Settings Row -->
            <div class="cpu-settings-row">
              <div class="cpu-setting-item">
                <label for="cpuSpeedSelect"><i class="fi fi-rr-bolt"></i> 클럭 속도:</label>
                <select id="cpuSpeedSelect" class="cpu-select">
                  <option value="1">1 Hz (초당 1 스텝)</option>
                  <option value="5" selected>5 Hz (기본값)</option>
                  <option value="10">10 Hz (빠름)</option>
                  <option value="20">20 Hz (고속)</option>
                  <option value="60">최대 속도 (Max)</option>
                </select>
              </div>

              <div class="cpu-setting-item">
                <label for="cpuOutFormatSelect"><i class="fi fi-rr-settings"></i> 출력 형식:</label>
                <select id="cpuOutFormatSelect" class="cpu-select">
                  <option value="unsigned" selected>Unsigned Dec (0~255)</option>
                  <option value="signed">Signed Dec (-128~127)</option>
                  <option value="hex">Hex (0x00~0xFF)</option>
                  <option value="bin">Binary (8-Bit)</option>
                </select>
              </div>

              <div class="cpu-setting-item">
                <label for="cpuPresetSelect"><i class="fi fi-rr-file-code"></i> 예제 프로그램:</label>
                <select id="cpuPresetSelect" class="cpu-select">
                  <option value="count">1) 0~15 카운트 루프 (Count)</option>
                  <option value="add">2) 두 수 덧셈 (28 + 14 = 42)</option>
                  <option value="mult">3) 반복 덧셈 곱셈 (6 × 7 = 42)</option>
                  <option value="fibo">4) 피보나치 수열 (1, 1, 2, 3, 5...)</option>
                </select>
                <button class="cpu-btn cpu-btn-sm" id="cpuBtnLoadPreset">불러오기</button>
              </div>
            </div>
          </div>

          <!-- Lower Workspace: Assembly Editor & RAM Inspector -->
          <div class="cpu-sim-workspace">
            <!-- Left: Assembly Editor -->
            <div class="cpu-panel cpu-panel-editor">
              <div class="cpu-panel-header">
                <div class="cpu-panel-header-left">
                  <i class="fi fi-rr-file-code"></i>
                  <span>어셈블리 코드 에디터</span>
                </div>
                <button class="cpu-btn cpu-btn-accent cpu-btn-sm" id="cpuBtnAssemble">
                  <i class="fi fi-rr-play"></i> 어셈블 & RAM 로드
                </button>
              </div>
              <div class="cpu-panel-body">
                <textarea class="cpu-asm-editor" spellcheck="false"></textarea>
                <div class="cpu-asm-status" id="cpuAsmStatus">어셈블러 대기 중</div>
              </div>
            </div>

            <!-- Right: RAM Inspector -->
            <div class="cpu-panel cpu-panel-ram">
              <div class="cpu-panel-header">
                <div class="cpu-panel-header-left">
                  <i class="fi fi-rr-database"></i>
                  <span>16바이트 RAM 메모리 맵 (4-bit 주소)</span>
                </div>
                <span class="cpu-ram-info">셀 클릭하여 값 직접 수정</span>
              </div>
              <div class="cpu-panel-body">
                <div class="cpu-ram-table-wrapper">
                  <table class="cpu-ram-table">
                    <thead>
                      <tr>
                        <th>주소</th>
                        <th>Hex</th>
                        <th>Dec</th>
                        <th>Binary</th>
                        <th>명령어 (디스어셈블)</th>
                      </tr>
                    </thead>
                    <tbody id="cpuRamTableBody">
                      <!-- 16 rows generated dynamically -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- ISA & Microcode Reference Drawer -->
          <div class="cpu-reference-panel">
            <div class="cpu-reference-header">
              <i class="fi fi-rr-info"></i>
              <span>명령어 집합(ISA) 및 제어 신호 레퍼런스</span>
            </div>
            <div class="cpu-reference-body">
              <table class="cpu-isa-table">
                <thead>
                  <tr>
                    <th>Opcode</th>
                    <th>Mnemonic</th>
                    <th>기능 및 동작 설명</th>
                    <th>마이크로 연산 (T3, T4, T5)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>0x0</code></td><td><code>NOP</code></td><td>아무 동작도 수행하지 않음</td><td>-</td></tr>
                  <tr><td><code>0x1</code></td><td><code>LDA [addr]</code></td><td>RAM[addr]의 값을 누산기(ACC)에 적재</td><td>T3: IO|MI, T4: RO|AI</td></tr>
                  <tr><td><code>0x2</code></td><td><code>ADD [addr]</code></td><td>ACC = ACC + RAM[addr] (캐리/제로 플래그 갱신)</td><td>T3: IO|MI, T4: RO|BI, T5: EO|AI|FI</td></tr>
                  <tr><td><code>0x3</code></td><td><code>SUB [addr]</code></td><td>ACC = ACC - RAM[addr] (캐리/제로 플래그 갱신)</td><td>T3: IO|MI, T4: RO|BI, T5: EO|AI|SU|FI</td></tr>
                  <tr><td><code>0x4</code></td><td><code>STA [addr]</code></td><td>누산기(ACC)의 값을 RAM[addr]에 저장</td><td>T3: IO|MI, T4: AO|RI</td></tr>
                  <tr><td><code>0x5</code></td><td><code>LDI val</code></td><td>4비트 즉시값(val)을 누산기(ACC)에 즉시 적재</td><td>T3: IO|AI</td></tr>
                  <tr><td><code>0x6</code></td><td><code>JMP [addr]</code></td><td>조건 없이 지정 주소(addr)로 프로그램 분기</td><td>T3: IO|J</td></tr>
                  <tr><td><code>0x7</code></td><td><code>JC [addr]</code></td><td>캐리 플래그(C)가 1이면 addr로 분기</td><td>T3: (C ? IO|J : -)</td></tr>
                  <tr><td><code>0x8</code></td><td><code>JZ [addr]</code></td><td>제로 플래그(Z)가 1이면 addr로 분기</td><td>T3: (Z ? IO|J : -)</td></tr>
                  <tr><td><code>0x9</code></td><td><code>OUT</code></td><td>누산기(ACC)의 값을 7세그먼트 출력창에 표시</td><td>T3: AO|OI</td></tr>
                  <tr><td><code>0xA</code></td><td><code>AND [addr]</code></td><td>ACC = ACC & RAM[addr] 비트 AND 연산</td><td>T3: IO|MI, T4: RO|BI, T5: EO|AI|FI</td></tr>
                  <tr><td><code>0xB</code></td><td><code>XOR [addr]</code></td><td>ACC = ACC ^ RAM[addr] 비트 XOR 연산</td><td>T3: IO|MI, T4: RO|BI, T5: EO|AI|FI</td></tr>
                  <tr><td><code>0xF</code></td><td><code>HLT</code></td><td>CPU 클럭 동작을 멈춤 (프로그램 종료)</td><td>T3: HLT</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      this.canvas = this.container.querySelector('.cpu-sim-canvas');
      this.asmEditor = this.container.querySelector('.cpu-asm-editor');
      this.asmStatus = this.container.querySelector('#cpuAsmStatus');
      this.ramTableBody = this.container.querySelector('#cpuRamTableBody');

      this.renderRamTable();
    }

    bindEvents() {
      const btnRun = this.container.querySelector('#cpuBtnRun');
      const btnStepMicro = this.container.querySelector('#cpuBtnStepMicro');
      const btnStepInst = this.container.querySelector('#cpuBtnStepInst');
      const btnReset = this.container.querySelector('#cpuBtnReset');
      const btnClearRam = this.container.querySelector('#cpuBtnClearRam');
      const speedSelect = this.container.querySelector('#cpuSpeedSelect');
      const outFormatSelect = this.container.querySelector('#cpuOutFormatSelect');
      const btnAssemble = this.container.querySelector('#cpuBtnAssemble');
      const btnLoadPreset = this.container.querySelector('#cpuBtnLoadPreset');
      const presetSelect = this.container.querySelector('#cpuPresetSelect');

      btnRun.addEventListener('click', () => {
        if (this.isRunning) {
          this.stop();
        } else {
          this.run();
        }
      });

      btnStepMicro.addEventListener('click', () => {
        this.step('micro');
      });

      btnStepInst.addEventListener('click', () => {
        this.step('instruction');
      });

      btnReset.addEventListener('click', () => {
        this.reset(false);
      });

      btnClearRam.addEventListener('click', () => {
        this.reset(true);
      });

      speedSelect.addEventListener('change', (e) => {
        this.clockSpeed = parseInt(e.target.value, 10);
        this.updateClockBadge();
        if (this.isRunning) {
          this.stop();
          this.run();
        }
      });

      outFormatSelect.addEventListener('change', (e) => {
        this.outFormat = e.target.value;
      });

      btnAssemble.addEventListener('click', () => {
        this.assembleCurrentCode();
      });

      btnLoadPreset.addEventListener('click', () => {
        this.loadPreset(presetSelect.value);
      });
    }

    updateClockBadge() {
      const badge = this.container.querySelector('#cpuBadgeClock');
      if (badge) {
        badge.innerHTML = `<i class="fi fi-rr-time-forward"></i> Clock: ${this.clockSpeed} Hz`;
      }
    }

    startRenderLoop() {
      if (typeof requestAnimationFrame === 'undefined' || !this.canvas) return;
      const loop = (timestamp) => {
        this.pulseOffset = (timestamp / 200) % 1;
        if (this.canvas) {
          renderCpuCanvas(this.canvas, this.cpu, this.pulseOffset, this.outFormat);
        }
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    loadPreset(presetKey) {
      const p = PRESETS[presetKey];
      if (!p) return;
      if (this.asmEditor) {
        this.asmEditor.value = p.asm;
      }
      this.assembleCurrentCode();
    }

    assembleCurrentCode() {
      const text = this.asmEditor ? this.asmEditor.value : '';
      const result = assemble(text);

      if (result.errors.length > 0) {
        if (this.asmStatus) {
          this.asmStatus.className = 'cpu-asm-status error';
          this.asmStatus.textContent = `❌ ${result.errors[0]}`;
        }
        return false;
      }

      this.cpu.loadRam(result.ram);
      if (this.asmStatus) {
        this.asmStatus.className = 'cpu-asm-status success';
        this.asmStatus.textContent = '✓ 어셈블 성공! 16바이트 머신 코드가 RAM에 로드되었습니다.';
      }
      this.updateUI();
      return true;
    }

    step(type = 'instruction') {
      if (this.cpu.halted) return;

      if (type === 'micro') {
        this.cpu.stepMicro();
      } else {
        this.cpu.stepInstruction();
      }

      this.updateUI();
    }

    run(speedHz) {
      if (speedHz) this.clockSpeed = speedHz;
      if (this.isRunning) return;

      this.isRunning = true;
      if (this.container) {
        const btnRun = this.container.querySelector('#cpuBtnRun');
        const runLabel = this.container.querySelector('#cpuRunLabel');
        if (btnRun) {
          btnRun.className = 'cpu-btn cpu-btn-running';
          if (runLabel) runLabel.textContent = '일시정지';
          const icon = btnRun.querySelector('i');
          if (icon) icon.className = 'fi fi-rr-pause';
        }
      }

      const intervalMs = Math.max(16, Math.round(1000 / this.clockSpeed));
      this.timerId = setInterval(() => {
        if (this.cpu.halted) {
          this.stop();
          return;
        }
        this.cpu.stepMicro();
        this.updateUI();
      }, intervalMs);
    }

    stop() {
      this.isRunning = false;
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (this.container) {
        const btnRun = this.container.querySelector('#cpuBtnRun');
        const runLabel = this.container.querySelector('#cpuRunLabel');
        if (btnRun) {
          btnRun.className = 'cpu-btn cpu-btn-primary';
          if (runLabel) runLabel.textContent = '실행';
          const icon = btnRun.querySelector('i');
          if (icon) icon.className = 'fi fi-rr-play';
        }
      }
      this.updateUI();
    }

    reset(clearRam = false) {
      this.stop();
      this.cpu.reset(clearRam);
      this.updateUI();
    }

    loadProgram(hexOrAsm) {
      if (typeof hexOrAsm === 'string') {
        const trimmed = hexOrAsm.trim();
        const isHexList = /^(\s*(0x)?[0-9a-fA-F]{1,2}[\s,]+)*(0x)?[0-9a-fA-F]{1,2}\s*$/.test(trimmed) &&
                          !/(LDA|ADD|SUB|STA|LDI|JMP|JC|JZ|OUT|AND|XOR|OR|NOT|HLT|ORG|DATA)/i.test(trimmed);
        if (isHexList) {
          const parts = trimmed.split(/[\s,]+/).filter(Boolean);
          const bytes = new Uint8Array(16);
          for (let i = 0; i < Math.min(16, parts.length); i++) {
            bytes[i] = parseInt(parts[i], 16) & 0xFF;
          }
          this.cpu.loadRam(bytes);
          this.updateUI();
          return true;
        }

        if (this.asmEditor) {
          this.asmEditor.value = hexOrAsm;
          return this.assembleCurrentCode();
        } else {
          const result = assemble(hexOrAsm);
          if (result.errors.length > 0) return false;
          this.cpu.loadRam(result.ram);
          return true;
        }
      } else if (Array.isArray(hexOrAsm) || hexOrAsm instanceof Uint8Array) {
        this.cpu.loadRam(hexOrAsm);
        this.updateUI();
        return true;
      }
      return false;
    }

    getStatus() {
      return this.cpu.getStatus();
    }

    updateUI() {
      if (!this.container) return;
      this.renderRamTable();

      const badgeHalted = this.container.querySelector('#cpuBadgeHalted');
      if (badgeHalted) {
        badgeHalted.style.display = this.cpu.halted ? 'inline-flex' : 'none';
      }
    }

    renderRamTable() {
      if (!this.ramTableBody) return;
      const ram = this.cpu.ram;
      const mar = this.cpu.mar;
      const pc = this.cpu.pc;

      let html = '';
      for (let addr = 0; addr < 16; addr++) {
        const val = ram[addr];
        const isMar = addr === mar;
        const isPc = addr === pc;
        const rowClass = `${isMar ? 'active-mar ' : ''}${isPc ? 'active-pc' : ''}`.trim();
        const dis = disassemble(val);

        const hexStr = `0x${val.toString(16).toUpperCase().padStart(2, '0')}`;
        const binStr = val.toString(2).padStart(8, '0');

        html += `
          <tr class="${rowClass}">
            <td><span class="cpu-ram-addr-badge">0x${addr.toString(16).toUpperCase()} (${addr})</span></td>
            <td><span class="cpu-ram-editable" data-addr="${addr}" title="클릭하여 값 수정">${hexStr}</span></td>
            <td>${val}</td>
            <td><code>${binStr}</code></td>
            <td><span class="cpu-ram-disasm">${dis.text}</span></td>
          </tr>
        `;
      }
      this.ramTableBody.innerHTML = html;

      // Attach inline edit handlers
      const editables = this.ramTableBody.querySelectorAll('.cpu-ram-editable');
      editables.forEach(el => {
        el.addEventListener('click', (e) => {
          const addr = parseInt(e.target.dataset.addr, 10);
          const currentVal = ram[addr];
          const input = prompt(`RAM[0x${addr.toString(16).toUpperCase()}] (${addr}) 바이트 값 입력 (0~255 또는 0x00~0xFF):`, `0x${currentVal.toString(16).toUpperCase()}`);
          if (input !== null) {
            const parsed = parseNumber(input);
            if (!isNaN(parsed)) {
              ram[addr] = parsed & 0xFF;
              this.updateUI();
            }
          }
        });
      });
    }

    destroy() {
      this.stop();
      if (this.animFrameId && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.animFrameId);
      }
    }
  }

  function getOrInitDefault() {
    if (!globalInstance) {
      globalInstance = new CpuSimulator(null);
    }
    return globalInstance;
  }

  // ==========================================================================
  // 7. PUBLIC API EXPORT
  // ==========================================================================

  return {
    init: function (containerEl, options) {
      if (globalInstance) {
        globalInstance.destroy();
      }
      globalInstance = new CpuSimulator(containerEl, options);
      return globalInstance;
    },
    step: function (mode) {
      return getOrInitDefault().step(mode);
    },
    run: function (hz) {
      return getOrInitDefault().run(hz);
    },
    stop: function () {
      return getOrInitDefault().stop();
    },
    reset: function (clearRam) {
      return getOrInitDefault().reset(clearRam);
    },
    loadProgram: function (hexOrAsm) {
      return getOrInitDefault().loadProgram(hexOrAsm);
    },
    getStatus: function () {
      return getOrInitDefault().getStatus();
    },
    assemble: assemble,
    disassemble: disassemble,
    presets: PRESETS,
    CpuCore: CpuCore,
    CpuSimulator: CpuSimulator
  };
}));
