import { test } from 'node:test';
import assert from 'node:assert';

// Load Electronics simulator modules
const LogicSim = require('../site/web/static/simulators/electronics/logic-sim.js');
const OpampBodeSim = require('../site/web/static/simulators/electronics/opamp-bode.js');
const TransistorCurvesSim = require('../site/web/static/simulators/electronics/transistor-curves.js');
const Timer555Sim = require('../site/web/static/simulators/electronics/timer555.js');

test('Electronics Sim 1: Digital Logic Gates & Full Adder Truth Tables', () => {
  // Test basic logic gates
  assert.strictEqual(LogicSim.evaluateGate('AND', 1, 1), 1);
  assert.strictEqual(LogicSim.evaluateGate('AND', 1, 0), 0);
  assert.strictEqual(LogicSim.evaluateGate('OR', 0, 1), 1);
  assert.strictEqual(LogicSim.evaluateGate('OR', 0, 0), 0);
  assert.strictEqual(LogicSim.evaluateGate('NOT', 1, 0), 0);
  assert.strictEqual(LogicSim.evaluateGate('NOT', 0, 0), 1);
  assert.strictEqual(LogicSim.evaluateGate('XOR', 1, 1), 0);
  assert.strictEqual(LogicSim.evaluateGate('XOR', 1, 0), 1);

  // Test Half Adder
  assert.deepStrictEqual(LogicSim.evaluateHalfAdder(0, 0), { sum: 0, carry: 0 });
  assert.deepStrictEqual(LogicSim.evaluateHalfAdder(1, 0), { sum: 1, carry: 0 });
  assert.deepStrictEqual(LogicSim.evaluateHalfAdder(1, 1), { sum: 0, carry: 1 });

  // Test Full Adder (1 + 1 + 1 = 3 in binary: sum=1, cout=1)
  assert.deepStrictEqual(LogicSim.evaluateFullAdder(1, 1, 1), { sum: 1, cout: 1 });
  assert.deepStrictEqual(LogicSim.evaluateFullAdder(1, 0, 1), { sum: 0, cout: 1 });

  // Test D Flip-Flop
  assert.deepStrictEqual(LogicSim.evaluateDFlipFlop(0, 1, true), { q: 1, qBar: 0 });
  assert.deepStrictEqual(LogicSim.evaluateDFlipFlop(1, 0, false), { q: 1, qBar: 0 }); // no clock edge
});

test('Electronics Sim 2: OP-Amp Active Filter Bode Plot Response', () => {
  // LPF with Rf = 100k, R1 = 10k, C = 10nF
  const Rf = 100000;
  const R1 = 10000;
  const C = 1e-8;
  const res = OpampBodeSim.computeBodePlot({
    filterType: 'lpf_1st',
    R1, Rf, C
  });

  // DC gain: A0 = Rf / R1 = 10 (20 dB)
  assert.strictEqual(res.dcGain, 10);
  assert.ok(Math.abs(res.dcGainDb - 20) < 1e-3);

  // Theoretical fc = 1 / (2*pi*Rf*C) ~ 159.15 Hz
  const expectedFc = 1 / (2 * Math.PI * Rf * C);
  assert.ok(Math.abs(res.fc - expectedFc) < 0.1);

  // Find response at fc: should be -3.01 dB down from DC gain (~16.99 dB)
  const fcIdx = res.frequencies.findIndex(f => f >= res.fc);
  assert.ok(fcIdx !== -1);
  const magAtFc = res.magDbList[fcIdx];
  assert.ok(Math.abs(magAtFc - (res.dcGainDb - 3.01)) < 0.5, `Gain at fc (${magAtFc}) must be ~3dB down from DC (${res.dcGainDb})`);

  // Stopband 20 dB/decade roll-off: at 10*fc (~1.59 kHz), gain should drop ~20dB from DC
  const fc10Idx = res.frequencies.findIndex(f => f >= res.fc * 10);
  assert.ok(fc10Idx !== -1);
  const magAt10Fc = res.magDbList[fc10Idx];
  assert.ok(Math.abs(magAt10Fc - (res.dcGainDb - 20)) < 1.0, `Gain at 10*fc (${magAt10Fc}) should be ~0dB`);
});

test('Electronics Sim 3: BJT IV Characteristic Curves & DC Load Line', () => {
  const res = TransistorCurvesSim.computeBJTIVCurves({
    Vcc: 12,
    Rc: 1000,
    beta: 150,
    activeIb_uA: 30
  });

  // Check load line saturation current: Ic_sat = Vcc / Rc = 12 / 1000 = 12 mA
  assert.strictEqual(res.icSat_mA, 12);
  assert.strictEqual(res.vceCutoff, 12);

  // Check Q-point in active region:
  // Ib = 30 uA => Ic = 150 * 30uA = 4.5 mA
  // Vce = Vcc - Ic*Rc = 12 - 4.5 = 7.5 V
  assert.ok(Math.abs(res.qPoint.ic_mA - 4.5) < 0.1);
  assert.ok(Math.abs(res.qPoint.vce - 7.5) < 0.1);
  assert.strictEqual(res.qPoint.region, 'ACTIVE');

  // Verify family of 5 curves generated
  assert.strictEqual(res.curves.length, 5);
  for (const c of res.curves) {
    assert.strictEqual(c.points.length, 101);
  }
});

test('Electronics Sim 4: 555 Timer Astable Frequency & Duty Cycle Equations', () => {
  const Ra = 10000; // 10k
  const Rb = 10000; // 10k
  const C = 1e-6; // 1uF
  const res = Timer555Sim.compute555Waveform({
    Vcc: 9,
    Ra, Rb, C
  });

  // Theoretical timing
  const expectedThigh = Math.LN2 * (Ra + Rb) * C;
  const expectedTlow = Math.LN2 * Rb * C;
  const expectedPeriod = expectedThigh + expectedTlow;
  const expectedFreq = 1 / expectedPeriod;
  const expectedDuty = expectedThigh / expectedPeriod; // (10k+10k)/(10k+20k) = 2/3 ~ 66.7%

  assert.ok(Math.abs(res.tHigh - expectedThigh) < 1e-6);
  assert.ok(Math.abs(res.tLow - expectedTlow) < 1e-6);
  assert.ok(Math.abs(res.frequency - expectedFreq) < 1e-3);
  assert.ok(Math.abs(res.dutyCycle - (2 / 3)) < 1e-3);

  // Check Threshold and Trigger levels
  assert.ok(Math.abs(res.vThreshold - 6.0) < 1e-3, 'Threshold must be 2/3 Vcc (6V)');
  assert.ok(Math.abs(res.vTrigger - 3.0) < 1e-3, 'Trigger must be 1/3 Vcc (3V)');

  // Waveform array length
  assert.ok(res.times.length > 300);
});
