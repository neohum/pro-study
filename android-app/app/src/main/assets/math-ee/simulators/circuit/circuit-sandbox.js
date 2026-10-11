/**
 * circuit-sandbox.js — Interactive Circuit Sandbox & Dual-Trace Virtual Oscilloscope
 *
 * High-performance, production-grade electronic circuit simulator with:
 * - 4th-Order Runge-Kutta (RK4) numerical ODE solver & dynamic node analysis
 * - 5 Classical Preset Circuits:
 *   1) Full-Wave Bridge Rectifier + RC Smoothing Filter
 *   2) RLC Resonant Bandpass Filter
 *   3) BJT Common-Emitter Amplifier with clipping
 *   4) Active Op-Amp Inverting / Non-inverting Amplifier with GBWP & Slew Rate
 *   5) 555 Timer Astable Multivibrator
 * - Dual-Trace Digital/CRT Virtual Oscilloscope:
 *   * Ch A (Input, Yellow trace) & Ch B (Output, Cyan trace)
 *   * Reticle grid, Time/Div, Volts/Div, Y-Pos, AC/DC coupling, Trigger level
 *   * Real-time metrics: Vpp, Vrms, Freq, Phase Difference Δφ, FFT Spectrum
 * - Animated Circuit Schematic with flowing current particles and active component states
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CircuitSandboxSim = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- Utility & Math Helpers ---
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function formatEng(val, unit, precision) {
    if (val === undefined || val === null || isNaN(val)) return '--- ' + unit;
    const p = precision !== undefined ? precision : 2;
    const abs = Math.abs(val);
    if (abs === 0) return '0.00 ' + unit;
    if (abs >= 1e6) return (val / 1e6).toFixed(p) + ' M' + unit;
    if (abs >= 1e3) return (val / 1e3).toFixed(p) + ' k' + unit;
    if (abs >= 1) return val.toFixed(p) + ' ' + unit;
    if (abs >= 1e-3) return (val * 1e3).toFixed(p) + ' m' + unit;
    if (abs >= 1e-6) return (val * 1e6).toFixed(p) + ' µ' + unit;
    if (abs >= 1e-9) return (val * 1e9).toFixed(p) + ' n' + unit;
    if (abs >= 1e-12) return (val * 1e12).toFixed(p) + ' p' + unit;
    return val.toExponential(p) + ' ' + unit;
  }

  // --- Runge-Kutta 4th Order Integrator ---
  function rk4(derivs, t, y, dt, params) {
    const k1 = derivs(t, y, params);
    const n = y.length;
    const yTemp = new Float64Array(n);

    for (let i = 0; i < n; i++) yTemp[i] = y[i] + 0.5 * dt * k1[i];
    const k2 = derivs(t + 0.5 * dt, yTemp, params);

    for (let i = 0; i < n; i++) yTemp[i] = y[i] + 0.5 * dt * k2[i];
    const k3 = derivs(t + 0.5 * dt, yTemp, params);

    for (let i = 0; i < n; i++) yTemp[i] = y[i] + dt * k3[i];
    const k4 = derivs(t + dt, yTemp, params);

    const yNext = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      yNext[i] = y[i] + (dt / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    }
    return yNext;
  }

  // --- Radix-2 / Direct DFT for Spectrum Display ---
  function computeFFT(samples, sampleRate) {
    const N = samples.length;
    const numBins = Math.min(64, Math.floor(N / 2));
    const magnitudes = new Float32Array(numBins);
    const freqs = new Float32Array(numBins);
    const binSize = sampleRate / N;

    // Hann window & standard DFT for modest bin sizes
    let maxMag = 1e-6;
    for (let k = 0; k < numBins; k++) {
      let real = 0;
      let imag = 0;
      for (let n = 0; n < N; n++) {
        const w = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1))); // Hann window
        const angle = (2 * Math.PI * k * n) / N;
        const val = samples[n] * w;
        real += val * Math.cos(angle);
        imag -= val * Math.sin(angle);
      }
      const mag = (2 * Math.sqrt(real * real + imag * imag)) / N;
      magnitudes[k] = mag;
      freqs[k] = k * binSize;
      if (mag > maxMag) maxMag = mag;
    }

    return { magnitudes, freqs, maxMag, binSize };
  }

  // =========================================================================
  // 5 Preset Circuit Models
  // =========================================================================

  const CIRCUIT_MODELS = {
    // 1. Full-Wave Bridge Rectifier + RC Smoothing Filter
    bridge_rectifier: {
      id: 'bridge_rectifier',
      title: '1. 전파 브리지 정류기 & RC 평활 필터',
      subtitle: 'Full-Wave Bridge Rectifier + RC Smoothing Filter',
      description: '4개의 정류 다이오드로 교류(AC) 양의/음의 반주기를 모두 직류(DC)로 정류하고, 평활 커패시터 C와 부하 저항 RL로 리플 전압을 억제합니다.',
      formula: 'Vr ≈ Idc / (2 · f · C) = (Vm - 1.4V) / (2 · f · RL · C)',
      defaultParams: {
        amplitude: 12.0, // V peak
        frequency: 60.0, // Hz
        RL: 1000.0,      // Ohm
        C: 47e-6,        // 47 uF
        Vf: 0.7,         // Diode forward drop
        rd: 2.0          // Diode dynamic resistance
      },
      paramDefs: [
        { key: 'amplitude', label: 'AC 전압 (Vm)', min: 2, max: 24, step: 0.5, unit: 'V' },
        { key: 'frequency', label: 'AC 주파수 (f)', min: 10, max: 500, step: 5, unit: 'Hz' },
        { key: 'C', label: '평활 커패시터 (C)', min: 1e-6, max: 470e-6, step: 1e-6, unit: 'F', isEng: true },
        { key: 'RL', label: '부하 저항 (RL)', min: 50, max: 10000, step: 50, unit: 'Ω', isEng: true }
      ],
      init() {
        return {
          state: new Float64Array([0.0]), // [vC]
          diodeConducting: [false, false, false, false], // D1, D2, D3, D4
          rippleTheoretical: 0,
          vDcMean: 0
        };
      },
      step(t, simState, p, dt) {
        const vin = p.amplitude * Math.sin(2 * Math.PI * p.frequency * t);
        const vC = simState.state[0];

        // Derivatives for RK4
        const derivs = (currT, y) => {
          const vInCur = p.amplitude * Math.sin(2 * Math.PI * p.frequency * currT);
          const capV = y[0];
          const absVin = Math.abs(vInCur);
          let iCharge = 0;
          if (absVin > capV + 2 * p.Vf) {
            iCharge = (absVin - (capV + 2 * p.Vf)) / p.rd;
          }
          const iDischarge = capV / p.RL;
          return [(iCharge - iDischarge) / p.C];
        };

        const nextState = rk4(derivs, t, simState.state, dt, p);
        simState.state = nextState;

        const nextVC = Math.max(0, nextState[0]);
        simState.state[0] = nextVC;

        // Diode conduction states
        const d13On = vin > (nextVC + 2 * p.Vf);
        const d24On = -vin > (nextVC + 2 * p.Vf);
        simState.diodeConducting = [d13On, d24On, d13On, d24On];

        // Theoretical Ripple calculation
        const Idc = nextVC / p.RL;
        simState.rippleTheoretical = Idc / (2 * p.frequency * p.C + 1e-12);
        simState.vDcMean = Math.max(0, p.amplitude - 2 * p.Vf - simState.rippleTheoretical * 0.5);

        return {
          chA: vin,             // Input AC (Yellow)
          chB: nextVC,          // Output DC with ripple (Cyan)
          aux: {
            iLoad: (nextVC / p.RL) * 1000, // mA
            d13: d13On,
            d24: d24On,
            rippleCalc: simState.rippleTheoretical
          }
        };
      }
    },

    // 2. RLC Resonant Bandpass Filter
    rlc_resonant: {
      id: 'rlc_resonant',
      title: '2. RLC 공진 대역통과 필터 (Bandpass Filter)',
      subtitle: 'RLC Resonant Bandpass Filter & Dynamic Ringing',
      description: '인덕터 L, 커패시터 C, 저항 R로 구성된 2차 공진 회로입니다. 공진 주파수 f0에서 임피던스가 최소가 되어 출력 전압이 최대(이득 0dB, 위상차 0°)가 되며, 대역폭 외에서는 감쇠합니다.',
      formula: 'f0 = 1 / (2π · √(L·C)),  Q = (1/R) · √(L/C),  ζ = R/2 · √(C/L)',
      defaultParams: {
        amplitude: 5.0,   // V peak
        frequency: 1591.5,// Hz (~1.59 kHz for L=10mH, C=1uF)
        R: 50.0,          // Ohm
        L: 0.01,          // 10 mH
        C: 1e-6           // 1 uF
      },
      paramDefs: [
        { key: 'frequency', label: '입력 주파수 (f)', min: 100, max: 10000, step: 20, unit: 'Hz' },
        { key: 'amplitude', label: '입력 전압 (Vm)', min: 1, max: 15, step: 0.5, unit: 'V' },
        { key: 'R', label: '저항 (R)', min: 5, max: 500, step: 5, unit: 'Ω' },
        { key: 'L', label: '인덕터 (L)', min: 0.001, max: 0.2, step: 0.001, unit: 'H', isEng: true },
        { key: 'C', label: '커패시터 (C)', min: 0.01e-6, max: 10e-6, step: 0.05e-6, unit: 'F', isEng: true }
      ],
      init() {
        return {
          state: new Float64Array([0.0, 0.0]), // [iL, vC]
          f0: 0,
          Q: 0,
          zeta: 0,
          bandwidth: 0
        };
      },
      step(t, simState, p, dt) {
        const vin = p.amplitude * Math.sin(2 * Math.PI * p.frequency * t);

        // State-variable ODE:
        // d(iL)/dt = (vin - vC - iL * R) / L
        // d(vC)/dt = iL / C
        // Output across R: vOut = iL * R
        const derivs = (currT, y) => {
          const vInCur = p.amplitude * Math.sin(2 * Math.PI * p.frequency * currT);
          const iL = y[0];
          const vC = y[1];
          const diL_dt = (vInCur - vC - iL * p.R) / p.L;
          const dvC_dt = iL / p.C;
          return [diL_dt, dvC_dt];
        };

        const nextState = rk4(derivs, t, simState.state, dt, p);
        simState.state = nextState;

        const iL = nextState[0];
        const vOut = iL * p.R;

        // Update analytical metrics
        const omega0 = 1.0 / Math.sqrt(p.L * p.C);
        simState.f0 = omega0 / (2 * Math.PI);
        simState.Q = (1.0 / p.R) * Math.sqrt(p.L / p.C);
        simState.zeta = (p.R / 2.0) * Math.sqrt(p.C / p.L);
        simState.bandwidth = simState.f0 / Math.max(0.01, simState.Q);

        return {
          chA: vin,             // Input AC (Yellow)
          chB: vOut,            // Resistor Bandpass Voltage (Cyan)
          aux: {
            vCap: nextState[1],
            iL: iL * 1000,      // mA
            f0: simState.f0,
            Q: simState.Q,
            zeta: simState.zeta
          }
        };
      }
    },

    // 3. BJT Common-Emitter Amplifier
    bjt_amplifier: {
      id: 'bjt_amplifier',
      title: '3. BJT 공통 에미터(CE) 전압 증폭기 & 클리핑',
      subtitle: 'BJT Common-Emitter Small/Large Signal Amplifier with Saturation & Cutoff',
      description: 'NPN 트랜지스터(2N3904급) 전압 분배기 바이어스 회로입니다. 소신호에서 180° 위상 반전 증폭(Av = -gm·Rc)을 보이며, 과대 입력 시 포화(Saturation) 및 차단(Cutoff) 클리핑 왜곡이 발생합니다.',
      formula: 'Av ≈ -gm · (Rc || RL) = -(Ic / VT) · (Rc || RL),  Phase Shift = 180°',
      defaultParams: {
        amplitude: 0.05,  // 50mV peak AC input
        frequency: 1000.0,// Hz
        Vcc: 12.0,        // V DC supply
        R1: 47000.0,      // Base top resistor
        R2: 10000.0,      // Base bottom resistor
        Rc: 2200.0,       // Collector resistor
        Re: 470.0,        // Emitter resistor
        RL: 10000.0,      // AC Load resistor
        beta: 150.0       // Current gain hfe
      },
      paramDefs: [
        { key: 'amplitude', label: 'AC 입력 진폭 (Vin,pk)', min: 0.005, max: 0.4, step: 0.005, unit: 'V' },
        { key: 'frequency', label: '신호 주파수 (f)', min: 100, max: 20000, step: 100, unit: 'Hz' },
        { key: 'Rc', label: '컬렉터 저항 (Rc)', min: 500, max: 10000, step: 100, unit: 'Ω', isEng: true },
        { key: 'Re', label: '에미터 저항 (Re)', min: 100, max: 2000, step: 50, unit: 'Ω' },
        { key: 'Vcc', label: '공급 전압 (Vcc)', min: 5, max: 20, step: 0.5, unit: 'V' }
      ],
      init() {
        return {
          state: new Float64Array([0.0]), // AC filtered output tracker
          Vb_dc: 0,
          Ve_dc: 0,
          Vc_dc: 0,
          Ic_mA: 0,
          Av: 0
        };
      },
      step(t, simState, p, dt) {
        const vin = p.amplitude * Math.sin(2 * Math.PI * p.frequency * t);

        // 1. DC Operating point calculation (Thevenin Base Bias)
        const Vth = p.Vcc * (p.R2 / (p.R1 + p.R2));
        const Rth = (p.R1 * p.R2) / (p.R1 + p.R2);
        const Vbe_on = 0.7;
        const Ib_dc = Math.max(0, (Vth - Vbe_on) / (Rth + (p.beta + 1) * p.Re));
        const Ic_dc = Math.min(p.beta * Ib_dc, (p.Vcc - 0.2) / (p.Rc + p.Re));
        const Ve_dc = (p.beta + 1) * Ib_dc * p.Re;
        const Vc_dc = p.Vcc - Ic_dc * p.Rc;

        simState.Vb_dc = Vth - Ib_dc * Rth;
        simState.Ve_dc = Ve_dc;
        simState.Vc_dc = Vc_dc;
        simState.Ic_mA = Ic_dc * 1000;

        // Small-signal transconductance gm = Ic / VT (VT = 26mV)
        const VT = 0.026;
        const gm = Math.max(0.001, Ic_dc / VT);
        const re = 1.0 / gm;
        const R_ac_load = (p.Rc * p.RL) / (p.Rc + p.RL);
        simState.Av = -R_ac_load / re; // bypassed Re

        // 2. Large-signal instantaneous collector voltage with non-linear exponential & clipping
        // v_be(t) = Vbe_on + vin(t)
        // i_c(t) = Ic_dc * exp(vin(t) / VT)
        const vbe_delta = vin;
        let ic_inst = Ic_dc * Math.exp(clamp(vbe_delta / VT, -5, 5));

        // Saturation limit: Vc cannot fall below Ve + Vce_sat (0.2V)
        const Vc_sat = Ve_dc + 0.2;
        let vc_inst = p.Vcc - ic_inst * p.Rc;
        if (vc_inst < Vc_sat) {
          vc_inst = Vc_sat; // Saturation clipping
        }
        if (vc_inst > p.Vcc) {
          vc_inst = p.Vcc; // Cutoff clipping
        }

        // AC Coupled Output (removing DC component)
        const vOut = (vc_inst - Vc_dc) * (p.RL / (p.Rc + p.RL));

        return {
          chA: vin * 1000,      // Input AC in mV (Yellow)
          chB: vOut,            // Output AC amplified & inverted in V (Cyan)
          aux: {
            vc_total: vc_inst,
            ve: Ve_dc,
            gain: simState.Av,
            isClipping: vc_inst <= Vc_sat + 0.05 || vc_inst >= p.Vcc - 0.05
          }
        };
      }
    },

    // 4. Active Op-Amp Inverting / Non-inverting Amplifier
    opamp_amplifier: {
      id: 'opamp_amplifier',
      title: '4. 연산 증폭기(Op-Amp) 반전/비반전 증폭기 & 슬루율 한계',
      subtitle: 'Active Op-Amp with Virtual Short (v+ = v-), Finite GBWP & Slew-Rate Limiting',
      description: '가상 접지(Virtual Short: v+ ≈ v-) 특성을 갖는 연산 증폭기 모델입니다. 이득-대역폭 적(GBWP)에 의한 고주파 감쇠 및 슬루율(Slew Rate)에 의한 왜곡, 전원 레일 포화(±Vsat)를 정밀하게 재현합니다.',
      formula: 'Inverting: Av = -Rf / Rin,   Non-inverting: Av = 1 + Rf / R1,   |dv/dt| ≤ SR',
      defaultParams: {
        mode: 1,          // 1: Inverting, 2: Non-inverting
        amplitude: 1.5,   // V peak
        frequency: 1000.0,// Hz
        Rin: 10000.0,     // 10 kOhm
        Rf: 30000.0,      // 30 kOhm (Gain = -3 or +4)
        Vsat: 12.0,       // +/- 12V output saturation rail
        gbwp: 3e6,        // 3 MHz Gain-Bandwidth Product
        slewRate: 5e6     // 5 V/us = 5e6 V/s Slew Rate limit
      },
      paramDefs: [
        { key: 'amplitude', label: '입력 신호 진폭 (Vin)', min: 0.1, max: 8.0, step: 0.1, unit: 'V' },
        { key: 'frequency', label: '입력 주파수 (f)', min: 100, max: 50000, step: 100, unit: 'Hz' },
        { key: 'Rf', label: '피드백 저항 (Rf)', min: 2000, max: 100000, step: 1000, unit: 'Ω', isEng: true },
        { key: 'Rin', label: '입력 저항 (Rin)', min: 2000, max: 50000, step: 1000, unit: 'Ω', isEng: true },
        { key: 'Vsat', label: '포화 전압 (±Vsat)', min: 5, max: 15, step: 0.5, unit: 'V' }
      ],
      init() {
        return {
          state: new Float64Array([0.0]), // [vo]
          idealGain: 0,
          virtualShortDelta_uV: 0,
          isSlewLimited: false,
          isRailSaturated: false
        };
      },
      step(t, simState, p, dt) {
        const vin = p.amplitude * Math.sin(2 * Math.PI * p.frequency * t);
        const isInverting = p.mode === 1;

        // Ideal closed-loop gain
        const idealGain = isInverting ? -(p.Rf / p.Rin) : (1.0 + p.Rf / p.Rin);
        simState.idealGain = idealGain;

        // Cutoff frequency due to finite GBWP: fc = GBWP / |Gain|
        const fc = p.gbwp / Math.max(1.0, Math.abs(idealGain));
        const omega_c = 2 * Math.PI * fc;

        // Unconditionally stable exact exponential discretization:
        // vo(t+dt) = vo(t) + (1 - exp(-omega_c * dt)) * (targetVo - vo(t))
        const targetVo = idealGain * vin;
        const voCur = simState.state[0];

        const alpha = 1.0 - Math.exp(-omega_c * dt);
        let deltaVo = alpha * (targetVo - voCur);

        // Clamp to Slew Rate: |deltaVo / dt| <= SR
        const maxDelta = p.slewRate * dt;
        if (Math.abs(deltaVo) > maxDelta) {
          deltaVo = Math.sign(deltaVo) * maxDelta;
          simState.isSlewLimited = true;
        } else {
          simState.isSlewLimited = false;
        }

        let voNext = voCur + deltaVo;

        // Rail saturation clamp [-Vsat, +Vsat]
        if (voNext > p.Vsat) {
          voNext = p.Vsat;
          simState.isRailSaturated = true;
        } else if (voNext < -p.Vsat) {
          voNext = -p.Vsat;
          simState.isRailSaturated = true;
        } else {
          simState.isRailSaturated = false;
        }

        simState.state[0] = voNext;

        // Virtual Short Delta (v+ - v-)
        let vPlus = 0;
        let vMinus = 0;
        if (isInverting) {
          vPlus = 0.0;
          vMinus = (p.Rf * vin + p.Rin * voNext) / (p.Rf + p.Rin);
        } else {
          vPlus = vin;
          vMinus = voNext * (p.Rin / (p.Rin + p.Rf));
        }
        simState.virtualShortDelta_uV = Math.abs(vPlus - vMinus) * 1e6;

        return {
          chA: vin,             // Input AC (Yellow)
          chB: voNext,          // Op-Amp Output (Cyan)
          aux: {
            gain: idealGain,
            vDelta_uV: simState.virtualShortDelta_uV,
            slewLimited: simState.isSlewLimited,
            saturated: simState.isRailSaturated
          }
        };
      }
    },

    // 5. 555 Timer Astable Multivibrator
    timer555_astable: {
      id: 'timer555_astable',
      title: '5. 555 타이머 비안정 멀티바이브레이터 (Astable Multivibrator)',
      subtitle: '555 Timer Astable Oscillator with 1/3 Vcc & 2/3 Vcc Internal Thresholds',
      description: '3개의 5kΩ 내부 저항이 형성하는 1/3 Vcc(Trigger)와 2/3 Vcc(Threshold) 기준 전압 사이에서 커패시터 C가 Ra+Rb를 통해 충전되고, Rb를 통해 방전하여 구형파 펄스를 연속 생성합니다.',
      formula: 'f = 1.44 / ((Ra + 2·Rb) · C),   Duty Cycle = (Ra + Rb) / (Ra + 2·Rb)',
      defaultParams: {
        Vcc: 9.0,         // V supply
        Ra: 10000.0,      // 10 kOhm (R1)
        Rb: 10000.0,      // 10 kOhm (R2)
        C: 1e-6           // 1 uF
      },
      paramDefs: [
        { key: 'Vcc', label: '공급 전압 (Vcc)', min: 4.5, max: 15.0, step: 0.5, unit: 'V' },
        { key: 'Ra', label: '저항 R1 (Ra)', min: 1000, max: 100000, step: 1000, unit: 'Ω', isEng: true },
        { key: 'Rb', label: '저항 R2 (Rb)', min: 1000, max: 100000, step: 1000, unit: 'Ω', isEng: true },
        { key: 'C', label: '타이밍 커패시터 (C)', min: 0.05e-6, max: 20e-6, step: 0.05e-6, unit: 'F', isEng: true }
      ],
      init() {
        return {
          state: new Float64Array([3.0]), // initial cap voltage near 1/3 Vcc
          outputState: 1, // 1: HIGH, 0: LOW
          freqTheoretical: 0,
          dutyCycleTheoretical: 0
        };
      },
      step(t, simState, p, dt) {
        const vThresh = (2.0 / 3.0) * p.Vcc;
        const vTrig = (1.0 / 3.0) * p.Vcc;
        let vc = simState.state[0];
        let q = simState.outputState;

        // Dynamic charging / discharging ODE
        if (q === 1) {
          // Charging phase through (Ra + Rb) towards Vcc
          const tauCharge = (p.Ra + p.Rb) * p.C;
          vc += ((p.Vcc - vc) / tauCharge) * dt;
          if (vc >= vThresh) {
            vc = vThresh;
            q = 0; // Reset flip-flop -> Output LOW, Discharge ON
          }
        } else {
          // Discharging phase through Rb towards GND (0V)
          const tauDischarge = p.Rb * p.C;
          vc -= (vc / tauDischarge) * dt;
          if (vc <= vTrig) {
            vc = vTrig;
            q = 1; // Set flip-flop -> Output HIGH, Discharge OFF
          }
        }

        simState.state[0] = vc;
        simState.outputState = q;

        // Theoretical formulas
        const tHigh = Math.LN2 * (p.Ra + p.Rb) * p.C;
        const tLow = Math.LN2 * p.Rb * p.C;
        const period = tHigh + tLow;
        simState.freqTheoretical = 1.0 / period;
        simState.dutyCycleTheoretical = tHigh / period;

        const vOut = q === 1 ? (p.Vcc - 1.2) : 0.15; // standard bipolar 555 output drops

        return {
          chA: vc,              // Capacitor Ramp Voltage (Yellow)
          chB: vOut,            // Output Square Wave (Cyan)
          aux: {
            vThresh,
            vTrig,
            q,
            fCalc: simState.freqTheoretical,
            dutyCalc: simState.dutyCycleTheoretical
          }
        };
      }
    }
  };

  // =========================================================================
  // Canvas Rendering: Dual-Trace Oscilloscope & Reticle
  // =========================================================================

  function renderOscilloscope(canvas, bufferData, scopeConfig, measurements, fftData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Oscilloscope Canvas Background: pure crisp '#ffffff'!
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Screen border layout
    const padL = 60;
    const padR = 180; // Right side panel for live metrics & FFT
    const padT = 28;
    const padB = 32;
    const gridW = width - padL - padR;
    const gridH = height - padT - padB;

    // 2. Reticle Grid: 10 horizontal divisions, 8 vertical divisions
    const divCols = 10;
    const divRows = 8;
    const dx = gridW / divCols;
    const dy = gridH / divRows;
    const midX = padL + gridW / 2;
    const midY = padT + gridH / 2;

    // Screen border: strokeRect with #0f172a, lineWidth 2.
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(padL, padT, gridW, gridH);

    // Major grid lines: #cbd5e1 (crisp light slate)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let c = 1; c < divCols; c++) {
      const x = padL + c * dx;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + gridH);
      ctx.stroke();
    }
    for (let r = 1; r < divRows; r++) {
      const y = padT + r * dy;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + gridW, y);
      ctx.stroke();
    }

    // Center crosshair axes: #94a3b8 with tick marks
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(padL + gridW, midY);
    ctx.moveTo(midX, padT);
    ctx.lineTo(midX, padT + gridH);
    ctx.stroke();

    // Center Axis Tick Marks
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let c = 0; c <= divCols; c++) {
      for (let s = 1; s <= 4; s++) {
        const x = padL + c * dx + s * (dx / 5);
        if (x < padL + gridW) {
          ctx.beginPath();
          ctx.moveTo(x, midY - 3);
          ctx.lineTo(x, midY + 3);
          ctx.stroke();
        }
      }
    }
    for (let r = 0; r <= divRows; r++) {
      for (let s = 1; s <= 4; s++) {
        const y = padT + r * dy + s * (dy / 5);
        if (y < padT + gridH) {
          ctx.beginPath();
          ctx.moveTo(midX - 3, y);
          ctx.lineTo(midX + 3, y);
          ctx.stroke();
        }
      }
    }

    // 3. Trigger Level Indicator Line
    if (scopeConfig.triggerLevel !== undefined) {
      const trigV = scopeConfig.triggerLevel;
      const vPerDiv = scopeConfig.trigSource === 'B' ? scopeConfig.voltsPerDivB : scopeConfig.voltsPerDivA;
      const trigY = midY - (trigV / vPerDiv) * dy - (scopeConfig.trigSource === 'B' ? scopeConfig.posY_B : scopeConfig.posY_A) * dy;
      if (trigY >= padT && trigY <= padT + gridH) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, trigY);
        ctx.lineTo(padL + gridW, trigY);
        ctx.stroke();
        ctx.setLineDash([]);

        // T marker
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('T', padL - 12, trigY + 3);
      }
    }

    // 4. Draw Waveform Traces (Ch A & Ch B)
    if (bufferData && bufferData.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, gridW, gridH);
      ctx.clip(); // Clip traces strictly inside oscilloscope screen

      const totalTimeSpan = divCols * scopeConfig.timePerDiv;
      const timeScale = gridW / totalTimeSpan;

      // Function to map voltage to Y pixel
      const mapY = (v, vPerDiv, posY) => {
        return midY - (v / vPerDiv) * dy - posY * dy;
      };

      // Find trigger index in buffer to stabilize display
      let trigIdx = 0;
      const trigThreshold = scopeConfig.triggerLevel || 0;
      const trigSrcKey = scopeConfig.trigSource === 'B' ? 'chB' : 'chA';

      for (let i = 1; i < bufferData.length - 100; i++) {
        const vPrev = bufferData[i - 1][trigSrcKey];
        const vCur = bufferData[i][trigSrcKey];
        if (scopeConfig.trigEdge === 'rising') {
          if (vPrev <= trigThreshold && vCur > trigThreshold) {
            trigIdx = i;
            break;
          }
        } else {
          if (vPrev >= trigThreshold && vCur < trigThreshold) {
            trigIdx = i;
            break;
          }
        }
      }

      // Draw Channel A: High-contrast bold amber/orange (#d97706), lineWidth 2.5
      if (scopeConfig.enableChA) {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        let started = false;
        for (let i = trigIdx; i < bufferData.length; i++) {
          const pt = bufferData[i];
          const px = padL + (pt.t - bufferData[trigIdx].t) * timeScale;
          if (px > padL + gridW) break;

          let vVal = pt.chA;
          if (scopeConfig.couplingA === 'AC' && measurements.dcMeanA !== undefined) {
            vVal -= measurements.dcMeanA;
          }
          const py = mapY(vVal, scopeConfig.voltsPerDivA, scopeConfig.posY_A);

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // Draw Channel B: High-contrast bold royal blue (#1d4ed8), lineWidth 2.5
      if (scopeConfig.enableChB) {
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        let started = false;
        for (let i = trigIdx; i < bufferData.length; i++) {
          const pt = bufferData[i];
          const px = padL + (pt.t - bufferData[trigIdx].t) * timeScale;
          if (px > padL + gridW) break;

          let vVal = pt.chB;
          if (scopeConfig.couplingB === 'AC' && measurements.dcMeanB !== undefined) {
            vVal -= measurements.dcMeanB;
          }
          const py = mapY(vVal, scopeConfig.voltsPerDivB, scopeConfig.posY_B);

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    // 5. Channel Badges & Time Base Readouts (Top & Bottom Bar)
    ctx.font = 'bold 11px monospace';
    // Ch A scale
    ctx.fillStyle = '#b45309';
    ctx.fillText(`CH1: ${formatEng(scopeConfig.voltsPerDivA, 'V')}/div [${scopeConfig.couplingA}]`, padL + 10, padT - 8);

    // Ch B scale
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText(`CH2: ${formatEng(scopeConfig.voltsPerDivB, 'V')}/div [${scopeConfig.couplingB}]`, padL + 190, padT - 8);

    // Time/div & Trigger info
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`M: ${formatEng(scopeConfig.timePerDiv, 's')}/div`, padL + 370, padT - 8);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Trig: CH${scopeConfig.trigSource} ${scopeConfig.trigEdge === 'rising' ? '↗' : '↘'} ${scopeConfig.triggerLevel.toFixed(1)}V`, padL + 10, padT + gridH + 20);

    // 6. Right Side Telemetry & Real-Time FFT Measurement Panel
    const sideX = padL + gridW + 16;
    let curY = padT + 12;

    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('📊 측정 데이터 (Metrics)', sideX, curY);
    curY += 20;

    // Ch A Metrics Box: fill with #ffffff, stroke with #0f172a (lineWidth 1.5)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sideX, curY, 150, 78);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sideX, curY, 150, 78);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CH1 (Input Probe)', sideX + 8, curY + 16);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Vpp:  ${formatEng(measurements.vppA, 'V')}`, sideX + 8, curY + 34);
    ctx.fillText(`Vrms: ${formatEng(measurements.vrmsA, 'V')}`, sideX + 8, curY + 49);
    ctx.fillText(`Freq: ${formatEng(measurements.freqA, 'Hz')}`, sideX + 8, curY + 64);

    curY += 90;

    // Ch B Metrics Box: fill with #ffffff, stroke with #0f172a (lineWidth 1.5)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sideX, curY, 150, 78);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sideX, curY, 150, 78);

    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CH2 (Output Probe)', sideX + 8, curY + 16);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Vpp:  ${formatEng(measurements.vppB, 'V')}`, sideX + 8, curY + 34);
    ctx.fillText(`Vrms: ${formatEng(measurements.vrmsB, 'V')}`, sideX + 8, curY + 49);
    ctx.fillText(`Freq: ${formatEng(measurements.freqB, 'Hz')}`, sideX + 8, curY + 64);

    curY += 90;

    // Phase Difference Box: fill with #ffffff, stroke with #0f172a (lineWidth 1.5)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sideX, curY, 150, 42);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sideX, curY, 150, 42);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('위상차 (Δφ Ch1-Ch2)', sideX + 8, curY + 15);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${measurements.phaseDeg.toFixed(1)}° (${(measurements.phaseDeg * Math.PI / 180).toFixed(2)} rad)`, sideX + 8, curY + 32);

    curY += 52;

    // FFT Spectrum: background #ffffff, border #0f172a, bars #2563eb with #0f172a outline.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sideX, curY, 150, 85);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sideX, curY, 150, 85);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('FFT 주파수 스펙트럼', sideX + 8, curY + 14);

    if (fftData && fftData.magnitudes) {
      const fBoxW = 134;
      const fBoxH = 50;
      const fBoxX = sideX + 8;
      const fBoxY = curY + 22;
      const nBins = Math.min(32, fftData.magnitudes.length);
      const barW = fBoxW / nBins;

      for (let b = 0; b < nBins; b++) {
        const magRatio = clamp(fftData.magnitudes[b] / (fftData.maxMag || 1), 0, 1);
        const bh = Math.max(1, magRatio * fBoxH);
        const bx = fBoxX + b * barW;
        const by = fBoxY + fBoxH - bh;
        const bw = Math.max(2, barW - 1);

        ctx.fillStyle = '#2563eb';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      }

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('0Hz', fBoxX, fBoxY + fBoxH + 10);
      ctx.fillText(formatEng(fftData.binSize * nBins, 'Hz'), fBoxX + fBoxW - 40, fBoxY + fBoxH + 10);
    }

    ctx.restore();
  }

  // =========================================================================
  // Canvas Rendering: Animated Circuit Schematic Diagram
  // =========================================================================

  function renderCircuitSchematic(canvas, circuitId, simState, params, animPhase) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Light engineering blueprint background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle schematic grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Helper: Draw wire with animated electrons/current particles
    function drawWire(x1, y1, x2, y2, color, isConducting, currentDir) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isConducting) {
        // Draw moving dots
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const numDots = Math.max(2, Math.floor(len / 22));
        const dir = currentDir !== undefined ? currentDir : 1;

        ctx.fillStyle = (color === '#f59e0b' || color === '#d97706' || color === '#b45309') ? '#d97706' : '#1d4ed8';
        for (let i = 0; i < numDots; i++) {
          const frac = ((animPhase * dir + i / numDots) % 1.0 + 1.0) % 1.0;
          const px = x1 + dx * frac;
          const py = y1 + dy * frac;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Helper: Draw Resistor (Zig-zag)
    function drawResistor(cx, cy, length, vertical, label, valueStr) {
      ctx.save();
      ctx.translate(cx, cy);
      if (vertical) ctx.rotate(Math.PI / 2);

      const halfL = length / 2;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-halfL, 0);
      ctx.lineTo(-halfL + 10, 0);

      // 6 peaks
      const zigStep = (halfL - 10) / 3;
      ctx.lineTo(-halfL + 10 + zigStep * 0.5, -8);
      ctx.lineTo(-halfL + 10 + zigStep * 1.0, 8);
      ctx.lineTo(-halfL + 10 + zigStep * 1.5, -8);
      ctx.lineTo(-halfL + 10 + zigStep * 2.0, 8);
      ctx.lineTo(-halfL + 10 + zigStep * 2.5, -8);
      ctx.lineTo(-halfL + 10 + zigStep * 3.0, 8);
      ctx.lineTo(halfL - 10, 0);
      ctx.lineTo(halfL, 0);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label, -14, -14);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(valueStr, -14, 20);

      ctx.restore();
    }

    // Helper: Draw Capacitor (Parallel plates)
    function drawCapacitor(cx, cy, vertical, label, valueStr) {
      ctx.save();
      ctx.translate(cx, cy);
      if (vertical) ctx.rotate(Math.PI / 2);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(-6, 0);
      ctx.moveTo(6, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();

      // Plates
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(-6, 14);
      ctx.moveTo(6, -14);
      ctx.lineTo(6, 14);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label, -10, -18);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(valueStr, -10, 26);

      ctx.restore();
    }

    // Helper: Draw Inductor (Coils)
    function drawInductor(cx, cy, length, label, valueStr) {
      ctx.save();
      ctx.translate(cx, cy);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-35, 0);
      ctx.lineTo(-24, 0);

      const r = 7;
      for (let i = 0; i < 4; i++) {
        const ox = -24 + i * (2 * r) + r;
        ctx.arc(ox, 0, r, Math.PI, 0, false);
      }
      ctx.lineTo(35, 0);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label, -10, -14);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(valueStr, -10, 20);

      ctx.restore();
    }

    // Helper: Draw Diode (Triangle + Bar)
    function drawDiode(cx, cy, angle, isConducting, label) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = isConducting ? '#22c55e' : '#ffffff';
      ctx.lineWidth = 2;

      // Triangle
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, 0);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cathode bar
      ctx.beginPath();
      ctx.moveTo(10, -12);
      ctx.lineTo(10, 12);
      ctx.stroke();

      // Terminal leads
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-10, 0);
      ctx.moveTo(10, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();

      if (label) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(label, -8, -14);
      }

      ctx.restore();
    }

    // Helper: Draw Ground Symbol
    function drawGND(x, y) {
      ctx.save();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 10);
      ctx.moveTo(x - 12, y + 10);
      ctx.lineTo(x + 12, y + 10);
      ctx.moveTo(x - 7, y + 14);
      ctx.lineTo(x + 7, y + 14);
      ctx.moveTo(x - 3, y + 18);
      ctx.lineTo(x + 3, y + 18);
      ctx.stroke();
      ctx.restore();
    }

    // Helper: Draw Probe Banner / Pin
    function drawProbe(x, y, label, color) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.fillRect(x + 10, y - 10, 56, 20);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(x + 10, y - 10, 56, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(label, x + 16, y + 4);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // Draw Individual Circuit Schematics
    // -------------------------------------------------------------

    if (circuitId === 'bridge_rectifier') {
      // AC Source -> Diode Bridge -> C & RL
      const d13On = simState.diodeConducting ? simState.diodeConducting[0] : false;
      const d24On = simState.diodeConducting ? simState.diodeConducting[1] : false;

      // AC Source
      const acX = 80;
      const acY = height / 2;
      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(acX, acY, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('~', acX - 5, acY + 5);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`AC ${params.amplitude}V`, acX - 22, acY - 26);

      drawProbe(acX + 20, acY - 40, 'CH1 In', '#d97706');

      // Bridge Center
      const brX = 220;
      const brY = height / 2;

      // Connect AC to Bridge
      drawWire(acX + 20, acY - 10, brX - 50, brY - 40, '#0f172a', true, d13On ? 1 : -1);
      drawWire(acX + 20, acY + 10, brX - 50, brY + 40, '#0f172a', true, d24On ? 1 : -1);

      // 4 Diodes in Diamond
      // Top: (brX, brY - 60), Bottom: (brX, brY + 60), Left: (brX - 50, brY), Right: (brX + 50, brY)
      // D1: Left to Top
      drawDiode(brX - 25, brY - 30, -Math.PI / 4, d13On, 'D1');
      // D2: Bottom to Left
      drawDiode(brX - 25, brY + 30, -3 * Math.PI / 4, d24On, 'D2');
      // D3: Bottom to Right
      drawDiode(brX + 25, brY + 30, -Math.PI / 4, d13On, 'D3');
      // D4: Right to Top
      drawDiode(brX + 25, brY - 30, -3 * Math.PI / 4, d24On, 'D4');

      // DC Output Rails
      const railTopY = brY - 60;
      const railBotY = brY + 60;
      const capX = brX + 110;
      const loadX = brX + 180;

      drawWire(brX, railTopY, loadX, railTopY, '#0f172a', d13On || d24On, 1);
      drawWire(brX, railBotY, loadX, railBotY, '#0f172a', d13On || d24On, -1);

      // Smoothing Cap & Load Resistor
      drawCapacitor(capX, brY, true, 'C (평활)', formatEng(params.C, 'F'));
      drawWire(capX, railTopY, capX, brY - 25, '#0f172a');
      drawWire(capX, brY + 25, capX, railBotY, '#0f172a');

      drawResistor(loadX, brY, 60, true, 'RL (부하)', formatEng(params.RL, 'Ω'));
      drawWire(loadX, railTopY, loadX, brY - 30, '#0f172a');
      drawWire(loadX, brY + 30, loadX, railBotY, '#0f172a');

      drawGND(loadX, railBotY);
      drawProbe(loadX, railTopY, 'CH2 Out', '#1d4ed8');

    } else if (circuitId === 'rlc_resonant') {
      // Input Source -> L -> C -> R -> GND
      const acX = 80;
      const acY = height / 2;
      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(acX, acY, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('~', acX - 5, acY + 5);

      drawProbe(acX + 20, acY - 40, 'CH1 In', '#d97706');

      const indX = 180;
      const capX = 290;
      const resX = 400;

      drawWire(acX + 20, acY, indX - 35, acY, '#0f172a', true, 1);
      drawInductor(indX, acY, 70, 'L (인덕터)', formatEng(params.L, 'H'));

      drawWire(indX + 35, acY, capX - 25, acY, '#0f172a', true, 1);
      drawCapacitor(capX, acY, false, 'C (커패시터)', formatEng(params.C, 'F'));

      drawWire(capX + 25, acY, resX, acY, '#0f172a', true, 1);

      drawProbe(resX, acY - 40, 'CH2 Out', '#1d4ed8');

      drawResistor(resX, acY + 45, 60, true, 'R (출력 저항)', formatEng(params.R, 'Ω'));
      drawWire(resX, acY + 75, resX, acY + 95, '#0f172a');
      drawGND(resX, acY + 95);

      // Return wire from GND to AC source
      drawWire(acX, acY + 20, acX, acY + 95, '#0f172a');
      drawWire(acX, acY + 95, resX, acY + 95, '#0f172a');

    } else if (circuitId === 'bjt_amplifier') {
      // BJT CE Amplifier Schematic
      const bjtX = 260;
      const bjtY = height / 2;

      // Draw Transistor Housing with white fill and #0f172a outline
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bjtX, bjtY, 32, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Base lead
      ctx.beginPath();
      ctx.moveTo(bjtX - 32, bjtY);
      ctx.lineTo(bjtX - 15, bjtY);
      // Base bar
      ctx.moveTo(bjtX - 15, bjtY - 18);
      ctx.lineTo(bjtX - 15, bjtY + 18);
      // Collector line
      ctx.moveTo(bjtX - 15, bjtY - 10);
      ctx.lineTo(bjtX + 15, bjtY - 26);
      // Emitter line with arrow
      ctx.moveTo(bjtX - 15, bjtY + 10);
      ctx.lineTo(bjtX + 15, bjtY + 26);
      ctx.stroke();

      // NPN Emitter arrow
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(bjtX + 15, bjtY + 26);
      ctx.lineTo(bjtX + 7, bjtY + 19);
      ctx.lineTo(bjtX + 13, bjtY + 15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('2N3904', bjtX + 34, bjtY);

      // Rails
      const vccY = 40;
      const gndY = height - 40;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`+Vcc (${params.Vcc}V)`, bjtX - 20, vccY - 10);

      // Rc & Re
      drawResistor(bjtX + 15, (bjtY - 26 + vccY) / 2, 50, true, 'Rc', formatEng(params.Rc, 'Ω'));
      drawWire(bjtX + 15, vccY, bjtX + 15, (bjtY - 26 + vccY) / 2 - 25, '#0f172a');
      drawWire(bjtX + 15, (bjtY - 26 + vccY) / 2 + 25, bjtX + 15, bjtY - 26, '#0f172a');

      drawResistor(bjtX + 15, (bjtY + 26 + gndY) / 2, 45, true, 'Re', formatEng(params.Re, 'Ω'));
      drawWire(bjtX + 15, bjtY + 26, bjtX + 15, (bjtY + 26 + gndY) / 2 - 22, '#0f172a');
      drawWire(bjtX + 15, (bjtY + 26 + gndY) / 2 + 22, bjtX + 15, gndY, '#0f172a');
      drawGND(bjtX + 15, gndY);

      // Bypass capacitor Ce in parallel with Re
      const ceX = bjtX + 65;
      drawWire(bjtX + 15, bjtY + 26, ceX, bjtY + 26, '#0f172a');
      drawCapacitor(ceX, (bjtY + 26 + gndY) / 2, true, 'Ce (바이패스)', '100µF');
      drawWire(ceX, (bjtY + 26 + gndY) / 2 + 25, ceX, gndY, '#0f172a');
      drawWire(bjtX + 15, gndY, ceX, gndY, '#0f172a');

      // Base Bias Resistors R1 & R2
      const biasX = bjtX - 80;
      drawResistor(biasX, (bjtY + vccY) / 2, 50, true, 'R1', formatEng(params.R1, 'Ω'));
      drawWire(biasX, vccY, biasX, (bjtY + vccY) / 2 - 25, '#0f172a');
      drawWire(biasX, (bjtY + vccY) / 2 + 25, biasX, bjtY, '#0f172a');
      drawWire(biasX, vccY, bjtX + 15, vccY, '#0f172a');

      drawResistor(biasX, (bjtY + gndY) / 2, 50, true, 'R2', formatEng(params.R2, 'Ω'));
      drawWire(biasX, bjtY, biasX, (bjtY + gndY) / 2 - 25, '#0f172a');
      drawWire(biasX, (bjtY + gndY) / 2 + 25, biasX, gndY, '#0f172a');
      drawWire(biasX, bjtY, bjtX - 32, bjtY, '#0f172a');
      drawGND(biasX, gndY);

      // AC Input via Cin
      const inX = biasX - 70;
      drawCapacitor(inX, bjtY, false, 'Cin', '10µF');
      drawWire(inX + 25, bjtY, biasX, bjtY, '#0f172a');
      drawProbe(inX - 25, bjtY, 'CH1 In', '#d97706');

      // AC Output via Cout
      const outX = bjtX + 120;
      drawWire(bjtX + 15, bjtY - 26, outX - 25, bjtY - 26, '#0f172a');
      drawCapacitor(outX, bjtY - 26, false, 'Cout', '10µF');
      drawProbe(outX + 25, bjtY - 26, 'CH2 Out', '#1d4ed8');

    } else if (circuitId === 'opamp_amplifier') {
      // Op-Amp Triangle & Feedback Resistor
      const opX = 260;
      const opY = height / 2;

      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2;

      // Triangle
      ctx.beginPath();
      ctx.moveTo(opX - 40, opY - 35);
      ctx.lineTo(opX + 40, opY);
      ctx.lineTo(opX - 40, opY + 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inputs +/-
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('-', opX - 32, opY - 14);
      ctx.fillText('+', opX - 32, opY + 22);

      // Op-amp label
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('OP-AMP', opX - 24, opY + 3);

      // Output wire
      drawWire(opX + 40, opY, opX + 100, opY, '#0f172a', true, 1);
      drawProbe(opX + 100, opY, 'CH2 Out', '#1d4ed8');

      const isInv = params.mode === 1;

      if (isInv) {
        // Inverting Mode
        // Non-inverting (+) connected to GND
        drawWire(opX - 40, opY + 18, opX - 70, opY + 18, '#0f172a');
        drawGND(opX - 70, opY + 18);

        // Input through Rin to Inverting (-)
        const inX = opX - 140;
        drawWire(inX, opY - 18, opX - 95, opY - 18, '#0f172a', true, 1);
        drawResistor(opX - 95, opY - 18, 50, false, 'Rin', formatEng(params.Rin, 'Ω'));
        drawWire(opX - 70, opY - 18, opX - 40, opY - 18, '#0f172a');
        drawProbe(inX, opY - 18, 'CH1 In', '#d97706');

        // Feedback Resistor Rf from output back to (-)
        const fbY = opY - 70;
        drawWire(opX - 60, opY - 18, opX - 60, fbY, '#0f172a');
        drawWire(opX - 60, fbY, opX - 25, fbY, '#0f172a');
        drawResistor(opX, fbY, 50, false, 'Rf', formatEng(params.Rf, 'Ω'));
        drawWire(opX + 25, fbY, opX + 70, fbY, '#0f172a');
        drawWire(opX + 70, fbY, opX + 70, opY, '#0f172a');

      } else {
        // Non-inverting Mode
        drawProbe(opX - 100, opY + 18, 'CH1 In', '#d97706');
        drawWire(opX - 100, opY + 18, opX - 40, opY + 18, '#0f172a', true, 1);

        // R1 to GND from (-)
        const gndX = opX - 70;
        drawWire(opX - 40, opY - 18, gndX, opY - 18, '#0f172a');
        drawResistor(gndX, opY + 30, 45, true, 'R1', formatEng(params.Rin, 'Ω'));
        drawWire(gndX, opY + 52, gndX, opY + 70, '#0f172a');
        drawGND(gndX, opY + 70);

        // Feedback Rf
        const fbY = opY - 70;
        drawWire(gndX, opY - 18, gndX, fbY, '#0f172a');
        drawWire(gndX, fbY, opX - 25, fbY, '#0f172a');
        drawResistor(opX, fbY, 50, false, 'Rf', formatEng(params.Rf, 'Ω'));
        drawWire(opX + 25, fbY, opX + 70, fbY, '#0f172a');
        drawWire(opX + 70, fbY, opX + 70, opY, '#0f172a');
      }

    } else if (circuitId === 'timer555_astable') {
      // 555 DIP-8 IC Box
      const icX = 260;
      const icY = height / 2;
      const icW = 110;
      const icH = 130;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(icX - icW / 2, icY - icH / 2, icW, icH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(icX - icW / 2, icY - icH / 2, icW, icH);

      // Notch
      ctx.beginPath();
      ctx.arc(icX, icY - icH / 2, 8, 0, Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('NE555', icX - 20, icY - 2);

      // Pins labels
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('8 VCC', icX + 16, icY - 45);
      ctx.fillText('7 DIS', icX - 48, icY - 45);
      ctx.fillText('6 THR', icX - 48, icY - 15);
      ctx.fillText('2 TRG', icX - 48, icY + 15);
      ctx.fillText('1 GND', icX - 48, icY + 45);
      ctx.fillText('3 OUT', icX + 16, icY + 15);

      // Output wire Pin 3
      drawWire(icX + icW / 2, icY + 15, icX + icW / 2 + 60, icY + 15, '#0f172a', true, simState.outputState);
      drawProbe(icX + icW / 2 + 60, icY + 15, 'CH2 Out', '#1d4ed8');

      // Vcc line
      const vccY = 30;
      drawWire(icX + 35, icY - icH / 2, icX + 35, vccY, '#0f172a');
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`+Vcc (${params.Vcc}V)`, icX + 15, vccY - 8);

      // Ra & Rb ladder on left
      const ladderX = icX - 110;
      drawWire(icX + 35, vccY, ladderX, vccY, '#0f172a');
      drawWire(ladderX, vccY, ladderX, icY - 60, '#0f172a');

      // Ra (R1)
      drawResistor(ladderX, icY - 40, 40, true, 'Ra (R1)', formatEng(params.Ra, 'Ω'));
      drawWire(ladderX, icY - 20, ladderX, icY, '#0f172a');
      drawWire(ladderX, icY - 45, icX - icW / 2, icY - 45, '#0f172a'); // To Pin 7 (DIS)

      // Rb (R2)
      drawResistor(ladderX, icY + 15, 40, true, 'Rb (R2)', formatEng(params.Rb, 'Ω'));
      drawWire(ladderX, icY + 35, ladderX, icY + 55, '#0f172a');

      // Tie Pins 6 (THR) and 2 (TRG) to junction below Rb
      drawWire(ladderX, icY + 55, icX - icW / 2, icY - 15, '#0f172a'); // to Pin 6
      drawWire(ladderX, icY + 55, icX - icW / 2, icY + 15, '#0f172a'); // to Pin 2

      drawProbe(ladderX, icY + 55, 'CH1 Vc', '#d97706');

      // Timing Capacitor C to GND
      drawCapacitor(ladderX, icY + 85, true, 'C', formatEng(params.C, 'F'));
      drawWire(ladderX, icY + 105, ladderX, icY + 125, '#0f172a');
      drawGND(ladderX, icY + 125);

      // Pin 1 GND
      drawWire(icX - icW / 2, icY + 45, icX - icW / 2 - 20, icY + 45, '#0f172a');
      drawGND(icX - icW / 2 - 20, icY + 45);
    }

    ctx.restore();
  }

  // =========================================================================
  // Simulator Controller & Public Interface
  // =========================================================================

  function createCircuitSandbox(containerEl, options) {
    const opts = options || {};
    const targetEl = typeof containerEl === 'string' ? (typeof document !== 'undefined' ? document.querySelector(containerEl) : null) : containerEl;
    let activeCircuitId = opts.initialCircuit || 'bridge_rectifier';

    // Model and Simulation states
    let model = CIRCUIT_MODELS[activeCircuitId];
    let params = Object.assign({}, model.defaultParams);
    let simState = model.init();

    let isRunning = true;
    let animPhase = 0;
    let simTime = 0;

    // Buffer for oscilloscope display (e.g. 1000 sample points)
    const MAX_BUFFER = 1200;
    let buffer = [];

    // Oscilloscope Settings
    const scopeConfig = {
      voltsPerDivA: 5.0,
      voltsPerDivB: 5.0,
      timePerDiv: 0.002, // 2ms/div -> 20ms full screen for 50/60Hz
      posY_A: 0.0,
      posY_B: 0.0,
      couplingA: 'DC',
      couplingB: 'DC',
      enableChA: true,
      enableChB: true,
      trigSource: 'A',
      trigEdge: 'rising',
      triggerLevel: 0.0
    };

    // Live Measurements
    const measurements = {
      vppA: 0,
      vrmsA: 0,
      freqA: 0,
      dcMeanA: 0,
      vppB: 0,
      vrmsB: 0,
      freqB: 0,
      dcMeanB: 0,
      phaseDeg: 0
    };

    let fftResult = null;

    // DOM Elements
    let rootContainer = null;
    let schematicCanvas = null;
    let scopeCanvas = null;
    let controlsContainer = null;
    let paramSlidersContainer = null;
    let animFrameId = null;

    let updatePresetTabs = null;

    // --- DOM Construction ---
    function buildUI() {
      if (!targetEl) return;
      targetEl.innerHTML = '';
      rootContainer = document.createElement('div');
      rootContainer.className = 'circuit-sandbox-wrapper';
      rootContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: #ffffff;
        color: #0f172a;
        border-radius: 12px;
        padding: 18px;
        border: 2px solid #0f172a;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;

      // 1. Header & Circuit Selector Buttons
      const headerDiv = document.createElement('div');
      headerDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 14px;
      `;

      const titleBox = document.createElement('div');
      titleBox.innerHTML = `
        <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span> <span id="cs-title">${model.title}</span>
        </h2>
        <p id="cs-desc" style="font-size: 0.85rem; color: #334155; margin: 4px 0 0 0; max-width: 780px;">${model.description}</p>
        <div id="cs-formula" style="font-size: 0.85rem; color: #0f172a; font-family: monospace; font-weight: 600; margin-top: 4px;">공식: ${model.formula}</div>
      `;
      headerDiv.appendChild(titleBox);

      // Preset Switcher Tabs
      const tabsDiv = document.createElement('div');
      tabsDiv.style.cssText = `display: flex; gap: 6px; flex-wrap: wrap;`;

      const presetButtons = {};
      updatePresetTabs = function (selectedId) {
        Object.keys(CIRCUIT_MODELS).forEach(cid => {
          const btn = presetButtons[cid];
          if (!btn) return;
          const isActive = cid === selectedId;
          btn.style.background = isActive ? '#0f172a' : '#ffffff';
          btn.style.color = isActive ? '#ffffff' : '#0f172a';
          btn.style.border = '1.5px solid #0f172a';
        });
      };

      Object.keys(CIRCUIT_MODELS).forEach(cid => {
        const btn = document.createElement('button');
        btn.textContent = CIRCUIT_MODELS[cid].title.split('.')[1].trim();
        btn.style.cssText = `
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1.5px solid #0f172a;
          background: ${cid === activeCircuitId ? '#0f172a' : '#ffffff'};
          color: ${cid === activeCircuitId ? '#ffffff' : '#0f172a'};
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        `;
        btn.addEventListener('click', () => setCircuit(cid));
        presetButtons[cid] = btn;
        tabsDiv.appendChild(btn);
      });
      headerDiv.appendChild(tabsDiv);
      rootContainer.appendChild(headerDiv);

      // 2. Dual Canvas View: Schematic (Top/Left) + Virtual Oscilloscope (Bottom/Right)
      const canvasGrid = document.createElement('div');
      canvasGrid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      `;
      if (typeof window !== 'undefined' && window.innerWidth < 960) {
        canvasGrid.style.gridTemplateColumns = '1fr';
      }

      // Schematic Box
      const schemBox = document.createElement('div');
      schemBox.style.cssText = `
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        border: 1.5px solid #0f172a;
        position: relative;
        display: flex;
        flex-direction: column;
      `;
      const schemHeader = document.createElement('div');
      schemHeader.style.cssText = `
        background: #ffffff;
        border-bottom: 1.5px solid #0f172a;
        padding: 6px 12px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        justify-content: space-between;
      `;
      schemHeader.innerHTML = `<span>📐 대화형 회로도 (Schematic)</span><span style="color: #64748b; font-weight: normal;">실시간 전류·노드 전압 애니메이션</span>`;
      schemBox.appendChild(schemHeader);

      schematicCanvas = document.createElement('canvas');
      schematicCanvas.style.cssText = `width: 100%; height: 320px; display: block; background: #ffffff;`;
      schemBox.appendChild(schematicCanvas);
      canvasGrid.appendChild(schemBox);

      // Oscilloscope Box
      const scopeBox = document.createElement('div');
      scopeBox.style.cssText = `
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        border: 1.5px solid #0f172a;
        position: relative;
        display: flex;
        flex-direction: column;
      `;
      const scopeHeader = document.createElement('div');
      scopeHeader.style.cssText = `
        background: #ffffff;
        border-bottom: 1.5px solid #0f172a;
        padding: 6px 12px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      scopeHeader.innerHTML = `
        <span>📺 2채널 가상 오실로스코프 (Dual-Trace Oscilloscope)</span>
        <div style="display: flex; gap: 8px;">
          <button id="cs-run-btn" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 6px; background: #0f172a; border: 1.5px solid #0f172a; color: #ffffff; cursor: pointer; font-weight: 600;">일시정지</button>
          <button id="cs-reset-btn" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 6px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: 600;">초기화</button>
        </div>
      `;
      scopeBox.appendChild(scopeHeader);

      scopeCanvas = document.createElement('canvas');
      scopeCanvas.style.cssText = `width: 100%; height: 320px; display: block; background: #ffffff;`;
      scopeBox.appendChild(scopeCanvas);
      canvasGrid.appendChild(scopeBox);

      rootContainer.appendChild(canvasGrid);

      // 3. Combined Control Panels: Component Parameter Sliders & Scope Controls
      controlsContainer = document.createElement('div');
      controlsContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
      `;
      if (typeof window !== 'undefined' && window.innerWidth < 850) {
        controlsContainer.style.gridTemplateColumns = '1fr';
      }

      // Left Panel: Circuit Component Sliders (Card)
      paramSlidersContainer = document.createElement('div');
      paramSlidersContainer.style.cssText = `
        background: #ffffff;
        padding: 14px;
        border-radius: 8px;
        border: 1.5px solid #0f172a;
      `;
      buildParamSliders();
      controlsContainer.appendChild(paramSlidersContainer);

      // Right Panel: Oscilloscope Knobs / Buttons (Card)
      const scopeControlsDiv = document.createElement('div');
      scopeControlsDiv.style.cssText = `
        background: #ffffff;
        padding: 14px;
        border-radius: 8px;
        border: 1.5px solid #0f172a;
      `;
      scopeControlsDiv.innerHTML = `
        <h4 style="font-size: 0.85rem; font-weight: 700; margin: 0 0 10px 0; color: #0f172a;">🎛️ 오실로스코프 컨트롤 (Oscilloscope Controls)</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem;">
          <div>
            <label style="color: #b45309; font-weight: 700;">CH1 전압 스케일:</label>
            <select id="cs-vdiv-a" style="width: 100%; margin-top: 4px; padding: 4px 8px; background: #ffffff; color: #0f172a; border: 1.5px solid #0f172a; border-radius: 6px; font-weight: 600;">
              <option value="0.05">50 mV/div</option>
              <option value="0.1">100 mV/div</option>
              <option value="0.5">500 mV/div</option>
              <option value="1.0">1.0 V/div</option>
              <option value="2.0">2.0 V/div</option>
              <option value="5.0" selected>5.0 V/div</option>
              <option value="10.0">10.0 V/div</option>
            </select>
          </div>
          <div>
            <label style="color: #1d4ed8; font-weight: 700;">CH2 전압 스케일:</label>
            <select id="cs-vdiv-b" style="width: 100%; margin-top: 4px; padding: 4px 8px; background: #ffffff; color: #0f172a; border: 1.5px solid #0f172a; border-radius: 6px; font-weight: 600;">
              <option value="0.05">50 mV/div</option>
              <option value="0.1">100 mV/div</option>
              <option value="0.5">500 mV/div</option>
              <option value="1.0">1.0 V/div</option>
              <option value="2.0">2.0 V/div</option>
              <option value="5.0" selected>5.0 V/div</option>
              <option value="10.0">10.0 V/div</option>
            </select>
          </div>
          <div>
            <label style="color: #0f172a; font-weight: 700;">시간 스케일 (Time/Div):</label>
            <select id="cs-tdiv" style="width: 100%; margin-top: 4px; padding: 4px 8px; background: #ffffff; color: #0f172a; border: 1.5px solid #0f172a; border-radius: 6px; font-weight: 600;">
              <option value="0.0001">100 µs/div</option>
              <option value="0.0005">500 µs/div</option>
              <option value="0.001">1.0 ms/div</option>
              <option value="0.002" selected>2.0 ms/div</option>
              <option value="0.005">5.0 ms/div</option>
              <option value="0.01">10.0 ms/div</option>
              <option value="0.02">20.0 ms/div</option>
            </select>
          </div>
          <div>
            <label style="color: #0f172a; font-weight: 700;">트리거 레벨 (V):</label>
            <input id="cs-trig-lvl" type="range" min="-10" max="10" step="0.5" value="0" style="width: 100%; margin-top: 6px; accent-color: #0f172a;">
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
            <label style="color: #0f172a; font-weight: 600;">CH1 커플링:</label>
            <button id="cs-coup-a" style="padding: 4px 12px; border-radius: 6px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: 600;">DC</button>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
            <label style="color: #0f172a; font-weight: 600;">CH2 커플링:</label>
            <button id="cs-coup-b" style="padding: 4px 12px; border-radius: 6px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: 600;">DC</button>
          </div>
        </div>
      `;
      controlsContainer.appendChild(scopeControlsDiv);
      rootContainer.appendChild(controlsContainer);

      if (targetEl) targetEl.appendChild(rootContainer);

      // Event Listeners for Scope
      const runBtn = rootContainer.querySelector('#cs-run-btn');
      function updateRunBtn() {
        runBtn.textContent = isRunning ? '일시정지' : '계속 실행';
        runBtn.style.background = isRunning ? '#0f172a' : '#ffffff';
        runBtn.style.color = isRunning ? '#ffffff' : '#0f172a';
        runBtn.style.border = '1.5px solid #0f172a';
        runBtn.style.fontWeight = '600';
      }
      runBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        updateRunBtn();
      });

      const resetBtn = rootContainer.querySelector('#cs-reset-btn');
      resetBtn.addEventListener('mousedown', () => {
        resetBtn.style.background = '#0f172a';
        resetBtn.style.color = '#ffffff';
      });
      const restoreResetBtn = () => {
        resetBtn.style.background = '#ffffff';
        resetBtn.style.color = '#0f172a';
      };
      resetBtn.addEventListener('mouseup', restoreResetBtn);
      resetBtn.addEventListener('mouseleave', restoreResetBtn);
      resetBtn.addEventListener('click', reset);

      const vdivA = rootContainer.querySelector('#cs-vdiv-a');
      vdivA.addEventListener('change', (e) => { scopeConfig.voltsPerDivA = Number(e.target.value); });

      const vdivB = rootContainer.querySelector('#cs-vdiv-b');
      vdivB.addEventListener('change', (e) => { scopeConfig.voltsPerDivB = Number(e.target.value); });

      const tdiv = rootContainer.querySelector('#cs-tdiv');
      tdiv.addEventListener('change', (e) => { scopeConfig.timePerDiv = Number(e.target.value); });

      const trigSlider = rootContainer.querySelector('#cs-trig-lvl');
      trigSlider.addEventListener('input', (e) => { scopeConfig.triggerLevel = Number(e.target.value); });

      function updateCouplingBtn(btn, val) {
        btn.textContent = val;
        btn.style.background = val === 'AC' ? '#0f172a' : '#ffffff';
        btn.style.color = val === 'AC' ? '#ffffff' : '#0f172a';
        btn.style.border = '1.5px solid #0f172a';
        btn.style.fontWeight = '600';
      }

      const coupA = rootContainer.querySelector('#cs-coup-a');
      coupA.addEventListener('click', () => {
        scopeConfig.couplingA = scopeConfig.couplingA === 'DC' ? 'AC' : 'DC';
        updateCouplingBtn(coupA, scopeConfig.couplingA);
      });

      const coupB = rootContainer.querySelector('#cs-coup-b');
      coupB.addEventListener('click', () => {
        scopeConfig.couplingB = scopeConfig.couplingB === 'DC' ? 'AC' : 'DC';
        updateCouplingBtn(coupB, scopeConfig.couplingB);
      });

      setupCanvasesDPI();
    }

    function buildParamSliders() {
      paramSlidersContainer.innerHTML = `<h4 style="font-size: 0.85rem; font-weight: 700; margin: 0 0 10px 0; color: #0f172a;">🔧 회로 소자 파라미터 조절 (Component Tuning)</h4>`;
      const grid = document.createElement('div');
      grid.style.cssText = `display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem;`;

      model.paramDefs.forEach(pDef => {
        const row = document.createElement('div');
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between;">
            <label style="color: #0f172a; font-weight: 600;">${pDef.label}</label>
            <span id="cs-val-${pDef.key}" style="color: #0f172a; font-family: monospace; font-weight: 700;">${pDef.isEng ? formatEng(params[pDef.key], pDef.unit) : params[pDef.key] + ' ' + pDef.unit}</span>
          </div>
          <input type="range" id="cs-slider-${pDef.key}" min="${pDef.min}" max="${pDef.max}" step="${pDef.step}" value="${params[pDef.key]}" style="width: 100%; margin-top: 4px; accent-color: #0f172a;">
        `;
        const slider = row.querySelector(`#cs-slider-${pDef.key}`);
        const valSpan = row.querySelector(`#cs-val-${pDef.key}`);
        slider.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          params[pDef.key] = val;
          valSpan.textContent = pDef.isEng ? formatEng(val, pDef.unit) : val + ' ' + pDef.unit;
        });
        grid.appendChild(row);
      });

      paramSlidersContainer.appendChild(grid);
    }

    function setupCanvasesDPI() {
      const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      if (schematicCanvas) {
        const rect = schematicCanvas.getBoundingClientRect();
        const w = rect.width || 560;
        const h = rect.height || 320;
        schematicCanvas.width = w * dpr;
        schematicCanvas.height = h * dpr;
        const sCtx = schematicCanvas.getContext('2d');
        sCtx.scale(dpr, dpr);
      }
      if (scopeCanvas) {
        const rect = scopeCanvas.getBoundingClientRect();
        const w = rect.width || 560;
        const h = rect.height || 320;
        scopeCanvas.width = w * dpr;
        scopeCanvas.height = h * dpr;
        const oCtx = scopeCanvas.getContext('2d');
        oCtx.scale(dpr, dpr);
      }
    }

    // --- Simulation & Animation Loop ---
    function stepSimulation() {
      if (!isRunning) return;

      // Micro-stepping to guarantee numerical stability: 20 substeps per frame
      const numSubsteps = 25;
      const targetTimeSpan = scopeConfig.timePerDiv * 10; // full horizontal screen
      const dt = targetTimeSpan / (MAX_BUFFER * numSubsteps);

      for (let s = 0; s < numSubsteps; s++) {
        simTime += dt;
        const out = model.step(simTime, simState, params, dt);

        if (s % 5 === 0) {
          buffer.push({
            t: simTime,
            chA: out.chA,
            chB: out.chB
          });
          if (buffer.length > MAX_BUFFER) {
            buffer.shift();
          }
        }
      }

      animPhase = (animPhase + 0.08) % 1.0;

      // Calculate Measurements periodically
      computeMeasurements();
    }

    function computeMeasurements() {
      if (buffer.length < 50) return;

      let minA = Infinity, maxA = -Infinity, sumSqA = 0, sumA = 0;
      let minB = Infinity, maxB = -Infinity, sumSqB = 0, sumB = 0;
      const N = buffer.length;

      const samplesB = new Float32Array(N);

      for (let i = 0; i < N; i++) {
        const va = buffer[i].chA;
        const vb = buffer[i].chB;
        samplesB[i] = vb;

        if (va < minA) minA = va;
        if (va > maxA) maxA = va;
        sumA += va;
        sumSqA += va * va;

        if (vb < minB) minB = vb;
        if (vb > maxB) maxB = vb;
        sumB += vb;
        sumSqB += vb * vb;
      }

      measurements.vppA = maxA - minA;
      measurements.vrmsA = Math.sqrt(sumSqA / N);
      measurements.dcMeanA = sumA / N;

      measurements.vppB = maxB - minB;
      measurements.vrmsB = Math.sqrt(sumSqB / N);
      measurements.dcMeanB = sumB / N;

      // Zero-crossing frequency detection for Ch A & B
      measurements.freqA = detectFrequency(buffer, 'chA', measurements.dcMeanA);
      measurements.freqB = detectFrequency(buffer, 'chB', measurements.dcMeanB);

      // Phase difference delta phi
      measurements.phaseDeg = detectPhaseDiff(buffer, measurements.dcMeanA, measurements.dcMeanB, measurements.freqA);

      // FFT Spectrum
      const sampleRate = N / (buffer[N - 1].t - buffer[0].t);
      fftResult = computeFFT(samplesB, sampleRate);
    }

    function detectFrequency(buf, key, mean) {
      let crossings = [];
      for (let i = 1; i < buf.length; i++) {
        const v1 = buf[i - 1][key] - mean;
        const v2 = buf[i][key] - mean;
        if (v1 <= 0 && v2 > 0) {
          // Linear interpolation for exact time of zero crossing
          const frac = -v1 / (v2 - v1 + 1e-12);
          crossings.push(buf[i - 1].t + frac * (buf[i].t - buf[i - 1].t));
        }
      }
      if (crossings.length >= 2) {
        let periodSum = 0;
        for (let i = 1; i < crossings.length; i++) {
          periodSum += (crossings[i] - crossings[i - 1]);
        }
        const avgPeriod = periodSum / (crossings.length - 1);
        return 1.0 / avgPeriod;
      }
      return params.frequency || 0;
    }

    function detectPhaseDiff(buf, meanA, meanB, freq) {
      if (!freq || freq <= 0) return 0;
      let crossA = null, crossB = null;
      for (let i = 1; i < buf.length; i++) {
        if (!crossA && (buf[i - 1].chA - meanA) <= 0 && (buf[i].chA - meanA) > 0) {
          crossA = buf[i].t;
        }
        if (!crossB && (buf[i - 1].chB - meanB) <= 0 && (buf[i].chB - meanB) > 0) {
          crossB = buf[i].t;
        }
        if (crossA !== null && crossB !== null) break;
      }
      if (crossA !== null && crossB !== null) {
        let dt = crossB - crossA;
        const period = 1.0 / freq;
        dt = ((dt % period) + period) % period;
        if (dt > period / 2) dt -= period;
        return (dt / period) * 360;
      }
      return 0;
    }

    function renderLoop() {
      stepSimulation();

      // Render schematic and scope
      renderCircuitSchematic(schematicCanvas, activeCircuitId, simState, params, animPhase);
      renderOscilloscope(scopeCanvas, buffer, scopeConfig, measurements, fftResult);

      animFrameId = requestAnimationFrame(renderLoop);
    }

    function setCircuit(circuitId) {
      if (!CIRCUIT_MODELS[circuitId]) return;
      activeCircuitId = circuitId;
      model = CIRCUIT_MODELS[circuitId];
      params = Object.assign({}, model.defaultParams);
      simState = model.init();
      buffer = [];
      simTime = 0;

      // Auto-tune default oscilloscope scales for optimal view
      if (circuitId === 'bridge_rectifier') {
        scopeConfig.voltsPerDivA = 5.0;
        scopeConfig.voltsPerDivB = 5.0;
        scopeConfig.timePerDiv = 0.005; // 5ms/div
      } else if (circuitId === 'rlc_resonant') {
        scopeConfig.voltsPerDivA = 2.0;
        scopeConfig.voltsPerDivB = 2.0;
        scopeConfig.timePerDiv = 0.0005; // 500us/div
      } else if (circuitId === 'bjt_amplifier') {
        scopeConfig.voltsPerDivA = 0.05; // 50mV/div (mV scale on Ch A)
        scopeConfig.voltsPerDivB = 2.0;  // 2V/div
        scopeConfig.timePerDiv = 0.0005;
      } else if (circuitId === 'opamp_amplifier') {
        scopeConfig.voltsPerDivA = 1.0;
        scopeConfig.voltsPerDivB = 5.0;
        scopeConfig.timePerDiv = 0.0005;
      } else if (circuitId === 'timer555_astable') {
        scopeConfig.voltsPerDivA = 2.0;
        scopeConfig.voltsPerDivB = 2.0;
        scopeConfig.timePerDiv = 0.005;
      }

      // Update Header Text & Sliders
      const titleEl = rootContainer.querySelector('#cs-title');
      const descEl = rootContainer.querySelector('#cs-desc');
      const formEl = rootContainer.querySelector('#cs-formula');
      if (titleEl) titleEl.textContent = model.title;
      if (descEl) descEl.textContent = model.description;
      if (formEl) formEl.textContent = '공식: ' + model.formula;

      if (updatePresetTabs) updatePresetTabs(circuitId);
      buildParamSliders();
    }

    function setComponent(name, value) {
      if (params.hasOwnProperty(name)) {
        params[name] = Number(value);
        const slider = rootContainer.querySelector(`#cs-slider-${name}`);
        const valSpan = rootContainer.querySelector(`#cs-val-${name}`);
        if (slider) slider.value = value;
        if (valSpan) {
          const pDef = model.paramDefs.find(d => d.key === name);
          valSpan.textContent = (pDef && pDef.isEng) ? formatEng(Number(value), pDef.unit) : value + (pDef ? ' ' + pDef.unit : '');
        }
      }
    }

    function setScopeParam(param, value) {
      if (scopeConfig.hasOwnProperty(param)) {
        scopeConfig[param] = value;
      }
    }

    function reset() {
      simState = model.init();
      buffer = [];
      simTime = 0;
    }

    function destroy() {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (targetEl) targetEl.innerHTML = '';
    }

    // Initialize UI and start animation
    buildUI();
    setCircuit(activeCircuitId);
    animFrameId = requestAnimationFrame(renderLoop);

    return {
      setCircuit,
      setComponent,
      setScopeParam,
      getMetrics: () => Object.assign({}, measurements),
      getParams: () => Object.assign({}, params),
      pause: () => { isRunning = false; },
      resume: () => { isRunning = true; },
      reset,
      destroy
    };
  }

  // Public Export
  return {
    init: createCircuitSandbox,
    CIRCUIT_MODELS,
    rk4,
    computeFFT
  };
}));
