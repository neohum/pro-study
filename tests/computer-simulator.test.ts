import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Load Computer CPU simulator module
const CpuSim = require('../site/web/static/simulators/computer/cpu-sim.js');

test('Computer Sim 1: 2-Pass Assembler & Disassembler Correctness', () => {
  const asm = `
    ORG 0
    START:
      LDI 5
      ADD 14
      OUT
      HLT
    ORG 14
      DATA 10
  `;
  const res = CpuSim.assemble(asm);
  assert.strictEqual(res.errors.length, 0, `Assembler returned errors: ${res.errors.join(', ')}`);
  assert.strictEqual(res.ram[0], (0x5 << 4) | 0x5); // LDI 5
  assert.strictEqual(res.ram[1], (0x2 << 4) | 0xE); // ADD 14 (0xE)
  assert.strictEqual(res.ram[2], (0x9 << 4) | 0x0); // OUT
  assert.strictEqual(res.ram[3], (0xF << 4) | 0x0); // HLT
  assert.strictEqual(res.ram[14], 10);

  const dis = CpuSim.disassemble(res.ram[1]);
  assert.strictEqual(dis.mnemonic, 'ADD');
  assert.strictEqual(dis.operand, 14);
});

test('Computer Sim 2: Preset Programs Verification', () => {
  for (const [key, preset] of Object.entries(CpuSim.presets)) {
    const res = CpuSim.assemble(preset.asm);
    assert.strictEqual(res.errors.length, 0, `Preset ${key} failed to assemble: ${res.errors.join(', ')}`);
    assert.strictEqual(res.ram.length, 16);
  }
});

test('Computer Sim 3: CPU Instruction Execution (28 + 14 = 42)', () => {
  const addPreset = CpuSim.presets.add;
  const res = CpuSim.assemble(addPreset.asm);
  const cpu = new CpuSim.CpuCore();
  cpu.loadRam(res.ram);

  // Run until halted
  let steps = 0;
  while (!cpu.halted && steps < 200) {
    cpu.stepInstruction();
    steps++;
  }

  assert.strictEqual(cpu.halted, true, 'CPU should halt after executing HLT');
  assert.strictEqual(cpu.out, 42, `Output register must be 42 (got ${cpu.out})`);
  assert.strictEqual(cpu.acc, 42, `Accumulator must hold 42 (got ${cpu.acc})`);
});

test('Computer Sim 4: Microcode T-States & Control Signals Sequence', () => {
  const cpu = new CpuSim.CpuCore();
  cpu.reset(true);
  cpu.ram[0] = 0x55; // LDI 5

  // T0: PC to MAR [CO, MI]
  cpu.stepMicro();
  assert.strictEqual(cpu.tStep, 1);
  assert.deepStrictEqual(cpu.activeSignals, ['CO', 'MI']);

  // T1: RAM to IR [RO, II]
  cpu.stepMicro();
  assert.strictEqual(cpu.tStep, 2);
  assert.deepStrictEqual(cpu.activeSignals, ['RO', 'II']);

  // T2: PC Increment [CE]
  cpu.stepMicro();
  assert.strictEqual(cpu.tStep, 3);
  assert.deepStrictEqual(cpu.activeSignals, ['CE']);

  // T3: LDI Execution [IO, AI]
  cpu.stepMicro();
  assert.strictEqual(cpu.tStep, 4);
  assert.ok(cpu.activeSignals.includes('IO') && cpu.activeSignals.includes('AI'));
  assert.strictEqual(cpu.acc, 5, 'Accumulator must hold immediate value 5');
});
