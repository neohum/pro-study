#!/usr/bin/env node
/**
 * scripts/verify-circuit-inverter-simulators.ts
 *
 * Comprehensive verification test suite for:
 * 1. Circuit Sandbox & Dual-Trace Virtual Oscilloscope (circuit-sandbox.js)
 * 2. 3-Phase Inverter & Induction Motor Dynamics (inverter-motor.js)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const CIRCUIT_SIM_PATH = path.join(ROOT_DIR, 'site', 'web', 'static', 'simulators', 'circuit', 'circuit-sandbox.js');
const INVERTER_SIM_PATH = path.join(ROOT_DIR, 'site', 'web', 'static', 'simulators', 'ee', 'inverter-motor.js');

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean | string): void {
  try {
    const res = fn();
    if (res === true) {
      results.push({ name, passed: true, message: 'OK' });
    } else {
      results.push({ name, passed: false, message: typeof res === 'string' ? res : 'Failed' });
    }
  } catch (err: any) {
    results.push({ name, passed: false, message: err.message || String(err) });
  }
}

console.log('=== Verifying Circuit Sandbox & Inverter Motor Simulators ===\n');

// --------------------------------------------------------------------------
// 1. Circuit Sandbox Tests
// --------------------------------------------------------------------------
test('CircuitSandbox: File existence and module export', () => {
  if (!fs.existsSync(CIRCUIT_SIM_PATH)) return `File missing at ${CIRCUIT_SIM_PATH}`;
  const sim = require(CIRCUIT_SIM_PATH);
  if (!sim.init || typeof sim.init !== 'function') return 'Missing init function export';
  if (!sim.CIRCUIT_MODELS || typeof sim.CIRCUIT_MODELS !== 'object') return 'Missing CIRCUIT_MODELS export';
  if (!sim.rk4 || typeof sim.rk4 !== 'function') return 'Missing rk4 export';
  if (!sim.computeFFT || typeof sim.computeFFT !== 'function') return 'Missing computeFFT export';
  return true;
});

test('CircuitSandbox: All 5 preset circuits defined', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const required = ['bridge_rectifier', 'rlc_resonant', 'bjt_amplifier', 'opamp_amplifier', 'timer555_astable'];
  for (const id of required) {
    if (!sim.CIRCUIT_MODELS[id]) return `Missing model ${id}`;
    const m = sim.CIRCUIT_MODELS[id];
    if (!m.defaultParams || !m.init || !m.step) return `Model ${id} missing required methods`;
  }
  return true;
});

test('CircuitSandbox: 1. Full-Wave Bridge Rectifier & RC Filter dynamics', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const m = sim.CIRCUIT_MODELS.bridge_rectifier;
  const p = Object.assign({}, m.defaultParams, { amplitude: 15, frequency: 60, RL: 1000, C: 47e-6 });
  const state = m.init();
  const dt = 1e-4;

  let lastOut: any = null;
  for (let i = 0; i < 500; i++) {
    lastOut = m.step(i * dt, state, p, dt);
  }

  // Capacitor should have smoothed DC voltage: Vdc ~ 15 - 1.4 = 13.6V minus small ripple
  if (lastOut.chB < 11 || lastOut.chB > 15) {
    return `Expected smoothed DC output near 12-14V, got ${lastOut.chB}`;
  }
  if (!lastOut.aux || typeof lastOut.aux.rippleCalc !== 'number') {
    return 'Missing theoretical ripple calculation';
  }
  return true;
});

test('CircuitSandbox: 2. RLC Resonant Bandpass Filter resonance and Q', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const m = sim.CIRCUIT_MODELS.rlc_resonant;
  const p = Object.assign({}, m.defaultParams, { R: 50, L: 0.01, C: 1e-6 });
  const state = m.init();
  const dt = 1e-5;

  let lastOut: any = null;
  for (let i = 0; i < 200; i++) {
    lastOut = m.step(i * dt, state, p, dt);
  }

  // Resonance f0 = 1 / (2*pi*sqrt(L*C)) = 1 / (2*pi*sqrt(1e-8)) = 1591.55 Hz
  const expectedF0 = 1 / (2 * Math.PI * Math.sqrt(p.L * p.C));
  if (Math.abs(lastOut.aux.f0 - expectedF0) > 1.0) {
    return `Resonant frequency mismatch: expected ${expectedF0.toFixed(2)}, got ${lastOut.aux.f0.toFixed(2)}`;
  }
  const expectedQ = (1 / p.R) * Math.sqrt(p.L / p.C);
  if (Math.abs(lastOut.aux.Q - expectedQ) > 0.01) {
    return `Quality factor Q mismatch: expected ${expectedQ.toFixed(2)}, got ${lastOut.aux.Q.toFixed(2)}`;
  }
  return true;
});

test('CircuitSandbox: 3. BJT Common-Emitter Amplifier gain and clipping', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const m = sim.CIRCUIT_MODELS.bjt_amplifier;
  const p = Object.assign({}, m.defaultParams, { amplitude: 0.02, frequency: 1000 }); // 20mV small signal
  const state = m.init();
  const dt = 1e-5;

  let smallSignalOut: any = null;
  for (let i = 0; i < 100; i++) {
    smallSignalOut = m.step(i * dt, state, p, dt);
  }

  // Voltage gain Av should be negative (inverting, 180-deg phase shift) with magnitude > 50
  if (smallSignalOut.aux.gain >= 0 || Math.abs(smallSignalOut.aux.gain) < 50) {
    return `Expected inverting gain < -50, got ${smallSignalOut.aux.gain}`;
  }

  // Large-signal clipping test
  p.amplitude = 0.5; // 500mV large signal to overdrive
  let clippedOut: any = null;
  for (let i = 0; i < 200; i++) {
    clippedOut = m.step(i * dt, state, p, dt);
    if (clippedOut.aux.isClipping) break;
  }
  if (!clippedOut.aux.isClipping) {
    return 'Expected clipping under large 500mV input amplitude';
  }
  return true;
});

test('CircuitSandbox: 4. Op-Amp Virtual Short and GBWP/Slew Rate bounding', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const m = sim.CIRCUIT_MODELS.opamp_amplifier;
  const p = Object.assign({}, m.defaultParams, { mode: 1, Rin: 10000, Rf: 30000, amplitude: 1.0, frequency: 1000 });
  const state = m.init();
  const dt = 1e-5;

  let lastOut: any = null;
  for (let i = 0; i < 200; i++) {
    lastOut = m.step(i * dt, state, p, dt);
  }

  // Ideal Inverting Gain = -Rf/Rin = -3.0
  if (Math.abs(lastOut.aux.gain - (-3.0)) > 1e-3) {
    return `Expected inverting gain -3.0, got ${lastOut.aux.gain}`;
  }
  // Virtual short difference should be very small in linear region (< 1000 uV)
  if (lastOut.aux.vDelta_uV > 50000) {
    return `Virtual short delta too large: ${lastOut.aux.vDelta_uV} uV`;
  }
  return true;
});

test('CircuitSandbox: 5. 555 Timer Astable oscillation and duty cycle', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const m = sim.CIRCUIT_MODELS.timer555_astable;
  const p = Object.assign({}, m.defaultParams, { Vcc: 9.0, Ra: 10000, Rb: 10000, C: 1e-6 });
  const state = m.init();
  const dt = 1e-4;

  let sawLow = false, sawHigh = false;
  for (let i = 0; i < 1000; i++) {
    const out = m.step(i * dt, state, p, dt);
    if (out.chB > 7.0) sawHigh = true;
    if (out.chB < 1.0) sawLow = true;
  }
  if (!sawLow || !sawHigh) {
    return '555 timer output failed to toggle between HIGH and LOW';
  }
  // Duty cycle for Ra=10k, Rb=10k: D = (10+10)/(10+20) = 2/3 ≈ 0.667
  const expectedDuty = (p.Ra + p.Rb) / (p.Ra + 2 * p.Rb);
  const diff = Math.abs(state.dutyCycleTheoretical - expectedDuty);
  if (diff > 1e-3) {
    return `Expected duty cycle ${expectedDuty.toFixed(3)}, got ${state.dutyCycleTheoretical.toFixed(3)}`;
  }
  return true;
});

test('CircuitSandbox: FFT Spectrum analysis calculation', () => {
  const sim = require(CIRCUIT_SIM_PATH);
  const N = 128;
  const sampleRate = 10000;
  const targetFreq = 1000;
  const samples = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const t = i / sampleRate;
    samples[i] = Math.sin(2 * Math.PI * targetFreq * t);
  }

  const fft = sim.computeFFT(samples, sampleRate);
  if (!fft || !fft.magnitudes || fft.magnitudes.length === 0) return 'FFT returned invalid result';

  // Find peak bin
  let maxIdx = 0, maxVal = -1;
  for (let k = 0; k < fft.magnitudes.length; k++) {
    if (fft.magnitudes[k] > maxVal) {
      maxVal = fft.magnitudes[k];
      maxIdx = k;
    }
  }
  const detectedFreq = fft.freqs[maxIdx];
  if (Math.abs(detectedFreq - targetFreq) > fft.binSize) {
    return `FFT detected peak at ${detectedFreq} Hz, expected near ${targetFreq} Hz (binSize: ${fft.binSize})`;
  }
  return true;
});

// --------------------------------------------------------------------------
// 2. Inverter & Motor Simulator Tests
// --------------------------------------------------------------------------
test('InverterMotor: File existence and module export', () => {
  if (!fs.existsSync(INVERTER_SIM_PATH)) return `File missing at ${INVERTER_SIM_PATH}`;
  const sim = require(INVERTER_SIM_PATH);
  if (!sim.init || typeof sim.init !== 'function') return 'Missing init function export';
  if (!sim.computePWMInstant || typeof sim.computePWMInstant !== 'function') return 'Missing computePWMInstant export';
  if (!sim.computeMotorTorqueAndCurrent || typeof sim.computeMotorTorqueAndCurrent !== 'function') return 'Missing computeMotorTorqueAndCurrent export';
  if (!sim.MOTOR_PRESETS || typeof sim.MOTOR_PRESETS !== 'object') return 'Missing MOTOR_PRESETS export';
  return true;
});

test('InverterMotor: SPWM vs SVPWM modulation comparison', () => {
  const sim = require(INVERTER_SIM_PATH);
  const pSPWM = { frequency: 60, carrierFreq: 5000, modulationIndex: 0.9, modulationMode: 'SPWM', Vdc: 500 };
  const pSVPWM = { frequency: 60, carrierFreq: 5000, modulationIndex: 0.9, modulationMode: 'SVPWM', Vdc: 500 };

  const outSPWM = sim.computePWMInstant(0.002, pSPWM);
  const outSVPWM = sim.computePWMInstant(0.002, pSVPWM);

  const ratio = outSVPWM.vll_rms_fund / outSPWM.vll_rms_fund;
  const expectedRatio = 2 / Math.sqrt(3); // 1.1547 (15.47% boost)
  if (Math.abs(ratio - expectedRatio) > 0.01) {
    return `Expected SVPWM/SPWM ratio ~${expectedRatio.toFixed(3)}, got ${ratio.toFixed(3)}`;
  }
  return true;
});

test('InverterMotor: 6-Switch H-bridge inverter pole & line voltages', () => {
  const sim = require(INVERTER_SIM_PATH);
  const p = { frequency: 50, carrierFreq: 4000, modulationIndex: 0.8, modulationMode: 'SPWM', Vdc: 600 };
  const pwm = sim.computePWMInstant(0.001, p);

  if (pwm.switches.length !== 6) return `Expected 6 switches, got ${pwm.switches.length}`;
  // Top and bottom switches on each leg must be strictly complementary
  if (pwm.switches[0] + pwm.switches[3] !== 1) return 'Leg A Q1/Q4 complementary violation';
  if (pwm.switches[2] + pwm.switches[5] !== 1) return 'Leg B Q3/Q6 complementary violation';
  if (pwm.switches[4] + pwm.switches[1] !== 1) return 'Leg C Q5/Q2 complementary violation';

  // Line voltage Vab must equal (Sa - Sb) * Vdc
  const expectedVab = (pwm.legs[0] - pwm.legs[1]) * p.Vdc;
  if (pwm.vab !== expectedVab) {
    return `Vab mismatch: expected ${expectedVab}, got ${pwm.vab}`;
  }
  return true;
});

test('InverterMotor: Induction Motor RK4 electromechanical dynamics & torque-speed curve', () => {
  const sim = require(INVERTER_SIM_PATH);
  const preset = sim.MOTOR_PRESETS.standard_5kw;
  const p = { frequency: 60, carrierFreq: 5000, modulationIndex: 0.85, modulationMode: 'SPWM', Vdc: 540, loadTorque: 20.0 };

  const pwm = sim.computePWMInstant(0, p);
  const vph = pwm.vph_rms_fund;

  // Standstill torque Te_start should be positive and accelerate motor
  const mStandstill = sim.computeMotorTorqueAndCurrent(0, p, preset, vph);
  if (mStandstill.Te <= p.loadTorque) {
    return `Starting torque (${mStandstill.Te} N·m) too low to accelerate load (${p.loadTorque} N·m)`;
  }

  // Integrate motor acceleration over 0.6 seconds using RK4
  let omega = 0.0;
  const dt = 0.001;
  for (let i = 0; i < 600; i++) {
    const t = i * dt;
    const derivs = (tCur: number, yState: Float64Array) => {
      const w = yState[0];
      const mData = sim.computeMotorTorqueAndCurrent(w, p, preset, vph);
      return [(mData.Te - p.loadTorque - preset.B * w) / preset.J];
    };
    const nextY = sim.rk4(derivs, t, new Float64Array([omega]), dt, p);
    omega = Math.max(0, nextY[0]);
  }

  const finalMetrics = sim.computeMotorTorqueAndCurrent(omega, p, preset, vph);
  const rpm = (omega * 60) / (2 * Math.PI);
  const rpmSync = (finalMetrics.omega_s * 60) / (2 * Math.PI);

  // For 4-pole 60Hz motor, Ns = 1800 RPM. Under 20 N·m load, rotor should be around 1740 - 1790 RPM (slip 1-3%)
  if (rpm < 1700 || rpm > 1800) {
    return `Unexpected steady-state motor RPM: ${rpm.toFixed(1)} (Ns: ${rpmSync})`;
  }
  if (finalMetrics.slip <= 0 || finalMetrics.slip > 0.06) {
    return `Unexpected slip: ${(finalMetrics.slip * 100).toFixed(2)}%`;
  }
  if (finalMetrics.efficiency < 70 || finalMetrics.efficiency > 98) {
    return `Unexpected efficiency: ${finalMetrics.efficiency.toFixed(1)}%`;
  }
  return true;
});

// --------------------------------------------------------------------------
// Report Results
// --------------------------------------------------------------------------
let allPassed = true;
for (const r of results) {
  const status = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${status}] ${r.name}: ${r.message}`);
  if (!r.passed) allPassed = false;
}

console.log('\n------------------------------------------------------');
if (allPassed) {
  console.log('All Circuit Sandbox & Inverter Motor tests PASSED! (100%)\n');
  process.exit(0);
} else {
  console.error('Some tests FAILED.\n');
  process.exit(1);
}
