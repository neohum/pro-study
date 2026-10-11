/**
 * inverter-motor.js — 3-Phase DC-AC Voltage Source Inverter (VSI) & Induction Motor Dynamics Simulator
 *
 * Production-grade power electronics & electrical drives simulation engine featuring:
 * - Sinusoidal PWM (SPWM) and Space Vector PWM (SVPWM with min-max zero-sequence injection)
 * - 6-Switch IGBT/Diode H-Bridge Inverter model with pole and line-to-line switching voltages
 * - Complete 3-Phase Induction Motor Electromechanical Dynamics:
 *   * Dynamic angular acceleration ODE: J · d(ω)/dt = Te - TL - B·ω (solved with RK4)
 *   * Analytical Thevenin electromagnetic torque: Te(s) with slip singularity protection
 *   * Stator current I1, Power factor cos(φ), Pin, Pout, and efficiency η
 * - 3 Interactive Canvas Panels:
 *   1) 3-Phase Inverter Bridge Schematic with animated switching states and current particles
 *   2) Real-Time Waveforms: Triangular Carrier vs Sine References, Gate Pulses, Filtered Line Voltage
 *   3) Electromechanical Motor: Rotating Stator/Rotor Magnetic Flux Phasors, Rotating Rotor, Speed/Torque Gauges
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.InverterMotorSim = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- Helpers ---
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
    return val.toExponential(p) + ' ' + unit;
  }

  // --- Runge-Kutta 4th Order Integrator for Motor ODE ---
  function rk4(derivs, t, y, dt, p) {
    const k1 = derivs(t, y, p);
    const n = y.length;
    const yTemp = new Float64Array(n);

    for (let i = 0; i < n; i++) yTemp[i] = y[i] + 0.5 * dt * k1[i];
    const k2 = derivs(t + 0.5 * dt, yTemp, p);

    for (let i = 0; i < n; i++) yTemp[i] = y[i] + 0.5 * dt * k2[i];
    const k3 = derivs(t + 0.5 * dt, yTemp, p);

    for (let i = 0; i < n; i++) yTemp[i] = y[i] + dt * k3[i];
    const k4 = derivs(t + dt, yTemp, p);

    const yNext = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      yNext[i] = y[i] + (dt / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    }
    return yNext;
  }

  // =========================================================================
  // Motor Presets & Theoretical Parameters
  // =========================================================================

  const MOTOR_PRESETS = {
    standard_5kw: {
      name: '표준 5.5kW 산업용 유도 전동기 (Standard Industrial)',
      p: 2,             // 2 pole pairs = 4-pole motor
      R1: 0.5,          // Stator resistance (Ohm)
      X1_base: 1.0,     // Stator leakage reactance at 60Hz (Ohm)
      R2_prime: 0.4,    // Rotor resistance referred to stator (Ohm)
      X2_base: 1.0,     // Rotor leakage reactance at 60Hz (Ohm)
      Xm_base: 35.0,    // Magnetizing reactance at 60Hz (Ohm)
      J: 0.08,          // Moment of inertia (kg·m^2)
      B: 0.003,         // Viscous friction damping (N·m·s/rad)
      ratedRPM: 1750,
      ratedTorque: 30.0
    },
    spindle_highspeed: {
      name: '고속 저관성 스핀들 모터 (High-Speed Spindle)',
      p: 1,             // 1 pole pair = 2-pole motor
      R1: 0.25,
      X1_base: 0.6,
      R2_prime: 0.2,
      X2_base: 0.6,
      Xm_base: 22.0,
      J: 0.02,
      B: 0.0015,
      ratedRPM: 3500,
      ratedTorque: 15.0
    },
    traction_heavyduty: {
      name: '중부하 고토크 견인 모터 (Heavy-Duty Traction)',
      p: 3,             // 3 pole pairs = 6-pole motor
      R1: 0.8,
      X1_base: 1.8,
      R2_prime: 0.65,
      X2_base: 1.8,
      Xm_base: 45.0,
      J: 0.25,
      B: 0.006,
      ratedRPM: 1150,
      ratedTorque: 55.0
    }
  };

  // =========================================================================
  // Core Mathematics: PWM Generation & Electromechanical Dynamics
  // =========================================================================

  function computePWMInstant(t, params) {
    const f = Math.max(1, params.frequency);
    const fc = Math.max(100, params.carrierFreq);
    const ma = clamp(params.modulationIndex, 0.05, 1.2);
    const mode = params.modulationMode || 'SPWM';
    const Vdc = Math.max(10, params.Vdc);

    // 1. Triangular Carrier Wave [-1, +1]
    const carrierPhase = (t * fc) % 1.0;
    // Symmetric triangle from -1 to +1 to -1
    const vTri = carrierPhase < 0.5 ? (4.0 * carrierPhase - 1.0) : (3.0 - 4.0 * carrierPhase);

    // 2. 3-Phase Sinusoidal Reference Waves (120-degree phase shifts)
    const theta = 2.0 * Math.PI * f * t;
    let vaRef = ma * Math.sin(theta);
    let vbRef = ma * Math.sin(theta - (2.0 * Math.PI / 3.0));
    let vcRef = ma * Math.sin(theta - (4.0 * Math.PI / 3.0));

    // 3. SVPWM Zero-Sequence Third-Harmonic Injection
    if (mode === 'SVPWM') {
      const vMax = Math.max(vaRef, vbRef, vcRef);
      const vMin = Math.min(vaRef, vbRef, vcRef);
      const vZero = -0.5 * (vMax + vMin); // Min-max offset injection
      vaRef += vZero;
      vbRef += vZero;
      vcRef += vZero;
    }

    // 4. Inverter Switching States (Q1 to Q6)
    // Leg A: Q1 (top) vs Q4 (bottom)
    const Sa = vaRef >= vTri ? 1 : 0;
    const Q1 = Sa;
    const Q4 = 1 - Sa;

    // Leg B: Q3 (top) vs Q6 (bottom)
    const Sb = vbRef >= vTri ? 1 : 0;
    const Q3 = Sb;
    const Q6 = 1 - Sb;

    // Leg C: Q5 (top) vs Q2 (bottom)
    const Sc = vcRef >= vTri ? 1 : 0;
    const Q5 = Sc;
    const Q2 = 1 - Sc;

    // 5. Pole and Line Voltages
    // Pole voltages relative to DC midpoint: va0, vb0, vc0 in {-Vdc/2, +Vdc/2}
    const va0 = (Sa - 0.5) * Vdc;
    const vb0 = (Sb - 0.5) * Vdc;
    const vc0 = (Sc - 0.5) * Vdc;

    // Line-to-line switching voltages: vab, vbc, vca
    const vab = (Sa - Sb) * Vdc;
    const vbc = (Sb - Sc) * Vdc;
    const vca = (Sc - Sa) * Vdc;

    // Phase to neutral voltages (Star connection)
    const van = ((2 * Sa - Sb - Sc) / 3.0) * Vdc;

    // Fundamental RMS Line-to-Line Voltage
    // For SPWM: VLL,1_rms = (sqrt(3)/(2*sqrt(2))) * ma * Vdc ≈ 0.6124 * ma * Vdc
    // For SVPWM: up to 15.5% higher DC utilization (2/sqrt(3) ≈ 1.1547)
    const svFactor = mode === 'SVPWM' ? (2.0 / Math.sqrt(3.0)) : 1.0;
    const maxMod = mode === 'SVPWM' ? (2.0 / Math.sqrt(3.0)) : 1.0;
    const vll_rms_fund = (Math.sqrt(3.0) / (2.0 * Math.SQRT2)) * Math.min(maxMod, ma * svFactor) * Vdc;
    const vph_rms_fund = vll_rms_fund / Math.sqrt(3.0);

    return {
      vTri,
      vaRef,
      vbRef,
      vcRef,
      switches: [Q1, Q2, Q3, Q4, Q5, Q6], // Q1..Q6
      legs: [Sa, Sb, Sc],
      va0, vb0, vc0,
      vab, vbc, vca,
      van,
      vll_rms_fund,
      vph_rms_fund,
      theta
    };
  }

  function computeMotorTorqueAndCurrent(omega, params, motorPreset, vph_rms) {
    const p = motorPreset.p;
    const f = Math.max(1, params.frequency);
    const omega_e = 2.0 * Math.PI * f; // electrical rad/s
    const omega_s = omega_e / p;       // synchronous mechanical rad/s

    // Frequency scaling for reactances (proportional to f / 60Hz)
    const fRatio = f / 60.0;
    const X1 = motorPreset.X1_base * fRatio;
    const X2_prime = motorPreset.X2_base * fRatio;
    const Xm = motorPreset.Xm_base * fRatio;

    // Slip calculation
    let s = (omega_s - omega) / Math.max(0.1, omega_s);

    // Singularity and numerical clamp around s = 0
    if (Math.abs(s) < 1e-4) {
      s = s >= 0 ? 1e-4 : -1e-4;
    }

    // Thevenin Equivalent Circuit of Induction Motor
    // Vth = Vph * [Xm / sqrt(R1^2 + (X1 + Xm)^2)]
    const denomTh = Math.sqrt(motorPreset.R1 * motorPreset.R1 + (X1 + Xm) * (X1 + Xm));
    const Vth = vph_rms * (Xm / Math.max(0.01, denomTh));

    // Rth ≈ R1 * (Xm / (X1 + Xm))^2, Xth ≈ X1
    const xmRatio = Xm / (X1 + Xm);
    const Rth = motorPreset.R1 * xmRatio * xmRatio;
    const Xth = X1;

    // Electromagnetic Torque equation:
    // Te = (3 * p * Vth^2 * (R2'/s)) / (omega_s * [(Rth + R2'/s)^2 + (Xth + X2')^2])
    const r2_over_s = motorPreset.R2_prime / s;
    const zSq = (Rth + r2_over_s) * (Rth + r2_over_s) + (Xth + X2_prime) * (Xth + X2_prime);

    let Te = (3.0 * p * Vth * Vth * r2_over_s) / (omega_s * Math.max(0.01, zSq));

    // Breakdown (Max) Torque:
    const Tmax = (3.0 * p * Vth * Vth) / (2.0 * omega_s * (Rth + Math.sqrt(Rth * Rth + (Xth + X2_prime) * (Xth + X2_prime))));

    // Stator Current I1 calculation:
    // Rotor current referred to stator: I2' = Vth / sqrt((Rth + R2'/s)^2 + (Xth + X2')^2)
    const I2_prime = Vth / Math.sqrt(Math.max(0.01, zSq));
    const Imag = vph_rms / Math.max(0.1, Xm);
    const I1 = Math.sqrt(I2_prime * I2_prime + Imag * Imag);

    // Power factor cos(phi)
    const cosPhi = clamp((Rth + Math.abs(r2_over_s)) / Math.sqrt(Math.max(0.01, zSq)), 0.1, 0.95);

    // Electrical Power In and Mechanical Power Out
    const Pin = 3.0 * vph_rms * I1 * cosPhi;
    const Pout = Te * omega;
    const efficiency = Pin > 10 ? clamp((Pout / Pin) * 100, 0, 96) : 0;

    return {
      omega_s,
      slip: s,
      Te,
      Tmax,
      I1,
      cosPhi,
      Pin,
      Pout,
      efficiency
    };
  }

  // =========================================================================
  // Canvas Rendering: 1) Inverter Bridge Schematic
  // =========================================================================

  function renderInverterSchematic(canvas, pwmData, params, animTick) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Pure crisp white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // DC Rails
    const railTopY = 45;
    const railBotY = height - 45;
    const leftX = 50;
    const rightX = width - 40;

    // +Vdc Rail (Solid Dark Slate)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, railTopY);
    ctx.lineTo(rightX - 50, railTopY);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`+Vdc (${params.Vdc}V)`, leftX, railTopY - 10);

    // 0V / GND Rail (Solid Dark Slate)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, railBotY);
    ctx.lineTo(rightX - 50, railBotY);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillText('0V / DC- (GND)', leftX, railBotY + 18);

    // DC Link Capacitor
    const capX = leftX + 45;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(capX, railTopY);
    ctx.lineTo(capX, (railTopY + railBotY) / 2 - 12);
    ctx.moveTo(capX, (railTopY + railBotY) / 2 + 12);
    ctx.lineTo(capX, railBotY);
    ctx.stroke();

    // Plates
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(capX - 12, (railTopY + railBotY) / 2 - 12);
    ctx.lineTo(capX + 12, (railTopY + railBotY) / 2 - 12);
    ctx.moveTo(capX - 12, (railTopY + railBotY) / 2 + 12);
    ctx.lineTo(capX + 12, (railTopY + railBotY) / 2 + 12);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Cdc', capX - 25, (railTopY + railBotY) / 2 + 4);

    // 3 Inverter Legs: Phase U, V, W
    const legX = [leftX + 140, leftX + 240, leftX + 340];
    const legColors = ['#dc2626', '#16a34a', '#2563eb']; // High-contrast Red, Green, Blue (A, B, C)
    const legNames = ['U (Phase A)', 'V (Phase B)', 'W (Phase C)'];
    const switches = pwmData.switches; // [Q1, Q2, Q3, Q4, Q5, Q6]
    // Q1(top U), Q4(bot U); Q3(top V), Q6(bot V); Q5(top W), Q2(bot W)
    const legSwitches = [
      { top: { id: 'Q1', on: switches[0] === 1 }, bot: { id: 'Q4', on: switches[3] === 1 } },
      { top: { id: 'Q3', on: switches[2] === 1 }, bot: { id: 'Q6', on: switches[5] === 1 } },
      { top: { id: 'Q5', on: switches[4] === 1 }, bot: { id: 'Q2', on: switches[1] === 1 } }
    ];

    const midY = (railTopY + railBotY) / 2;

    for (let i = 0; i < 3; i++) {
      const lx = legX[i];
      const leg = legSwitches[i];

      // Draw Top Switch (IGBT + Diode)
      const topSwY = railTopY + 45;
      drawIGBTSwitch(ctx, lx, topSwY, leg.top.id, leg.top.on);

      // Connect +Vdc to Top Switch
      ctx.strokeStyle = leg.top.on ? '#16a34a' : '#cbd5e1';
      ctx.lineWidth = leg.top.on ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(lx, railTopY);
      ctx.lineTo(lx, topSwY - 24);
      ctx.stroke();

      // Draw Bottom Switch
      const botSwY = railBotY - 45;
      drawIGBTSwitch(ctx, lx, botSwY, leg.bot.id, leg.bot.on);

      // Connect Bottom Switch to 0V
      ctx.strokeStyle = leg.bot.on ? '#16a34a' : '#cbd5e1';
      ctx.lineWidth = leg.bot.on ? 2.5 : 2;
      ctx.beginPath();
      ctx.moveTo(lx, botSwY + 24);
      ctx.lineTo(lx, railBotY);
      ctx.stroke();

      // Middle node (Phase Output terminal)
      ctx.strokeStyle = leg.top.on ? '#16a34a' : (leg.bot.on ? '#2563eb' : '#cbd5e1');
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lx, topSwY + 24);
      ctx.lineTo(lx, botSwY - 24);
      ctx.stroke();

      // Terminal node dot
      ctx.fillStyle = legColors[i];
      ctx.beginPath();
      ctx.arc(lx, midY, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Output line going right to 3-phase motor load
      const outEndX = rightX + 10;
      const targetY = midY - 25 + i * 25;

      ctx.strokeStyle = legColors[i];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lx, midY);
      ctx.lineTo(lx + 25, midY);
      ctx.lineTo(lx + 45, targetY);
      ctx.lineTo(outEndX, targetY);
      ctx.stroke();

      // Animated current flow particles along output wire
      const isConducting = leg.top.on || leg.bot.on;
      if (isConducting) {
        ctx.fillStyle = '#0f172a';
        for (let p = 0; p < 3; p++) {
          const frac = ((animTick * 0.05 + p / 3) % 1.0);
          const px = (lx + 45) + (outEndX - (lx + 45)) * frac;
          ctx.beginPath();
          ctx.arc(px, targetY, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Terminal label
      ctx.fillStyle = legColors[i];
      ctx.font = 'bold 11px monospace';
      ctx.fillText(legNames[i], lx - 20, railTopY - 22);
    }

    ctx.restore();
  }

  function drawIGBTSwitch(ctx, cx, cy, label, isOn) {
    ctx.save();
    ctx.translate(cx, cy);

    // Bounding Box: Pure White background, 2px solid #0f172a border, active indicator
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-22, -22, 44, 44);

    ctx.strokeStyle = isOn ? '#16a34a' : '#0f172a';
    ctx.lineWidth = isOn ? 2.5 : 2;
    ctx.strokeRect(-22, -22, 44, 44);

    // IGBT Symbol inside
    ctx.strokeStyle = isOn ? '#16a34a' : '#0f172a';
    ctx.lineWidth = 2;

    // Gate plate
    ctx.beginPath();
    ctx.moveTo(-10, -12);
    ctx.lineTo(-10, 12);
    ctx.moveTo(-18, 0);
    ctx.lineTo(-10, 0); // Gate terminal
    ctx.stroke();

    // Channel line
    ctx.beginPath();
    ctx.moveTo(-5, -14);
    ctx.lineTo(-5, 14);
    ctx.moveTo(-5, -8);
    ctx.lineTo(8, -18); // Collector
    ctx.moveTo(-5, 8);
    ctx.lineTo(8, 18);  // Emitter
    ctx.stroke();

    // External Top & Bottom leads
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.lineTo(8, -22);
    ctx.moveTo(8, 18);
    ctx.lineTo(8, 22);
    ctx.stroke();

    // Transistor Label (#0f172a)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(label, -20, -26);

    // Active state switch indicator
    ctx.fillStyle = isOn ? '#16a34a' : '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(isOn ? 'ON' : 'OFF', 10, 0);

    ctx.restore();
  }

  // =========================================================================
  // Canvas Rendering: 2) Real-Time Waveforms (Carrier, Gate Pulses, Line V)
  // =========================================================================

  function renderWaveforms(canvas, waveformHistory, params) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Pure crisp white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padL = 50;
    const padR = 20;
    const padT = 24;
    const padB = 24;
    const plotW = width - padL - padR;

    // 3 Rows:
    // Row 1: Carrier & 3-Phase Sine References
    // Row 2: 3-Phase Gate Pulses (Sa, Sb, Sc)
    // Row 3: Switched Line Voltage Vab & Filtered Fundamental
    const rowH = (height - padT - padB) / 3;

    // Reticle Horizontal Dividers (Clean light slate #e2e8f0)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL + plotW, padT);
    ctx.moveTo(padL, padT + rowH);
    ctx.lineTo(padL + plotW, padT + rowH);
    ctx.moveTo(padL, padT + 2 * rowH);
    ctx.lineTo(padL + plotW, padT + 2 * rowH);
    ctx.moveTo(padL, padT + 3 * rowH);
    ctx.lineTo(padL + plotW, padT + 3 * rowH);
    ctx.stroke();

    const n = waveformHistory.length;
    if (n < 2) {
      ctx.restore();
      return;
    }

    // Row 1: Carrier vs References
    const yMid1 = padT + rowH / 2;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`1) 삼각 반송파(fc=${(params.carrierFreq/1000).toFixed(1)}kHz) vs 3상 지령 정현파 (${params.modulationMode})`, padL + 6, padT + 12);

    // Draw Tri Carrier (Crisp Slate #64748b)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = padL + (i / (n - 1)) * plotW;
      const py = yMid1 - waveformHistory[i].vTri * (rowH * 0.4);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw References: Phase A #dc2626 (red), Phase B #16a34a (green), Phase C #2563eb (blue)
    const refColors = ['#dc2626', '#16a34a', '#2563eb'];
    const refKeys = ['vaRef', 'vbRef', 'vcRef'];
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = refColors[k];
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const px = padL + (i / (n - 1)) * plotW;
        const py = yMid1 - waveformHistory[i][refKeys[k]] * (rowH * 0.4);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Row 2: PWM Gate Pulses (Sa, Sb, Sc)
    const yTop2 = padT + rowH;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('2) PWM 게이트 스위칭 펄스 (Sa, Sb, Sc)', padL + 6, yTop2 + 12);

    const pulseH = (rowH - 18) / 3;
    for (let k = 0; k < 3; k++) {
      const pyBase = yTop2 + 18 + (k + 1) * pulseH - 3;
      ctx.strokeStyle = refColors[k];
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const px = padL + (i / (n - 1)) * plotW;
        const state = waveformHistory[i].legs[k];
        const py = pyBase - state * (pulseH * 0.7);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Row 3: Switched Line Voltage Vab & Filtered Fundamental
    const yMid3 = padT + 2.5 * rowH;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`3) 선간 전압 Vab (스위칭 펄스) & 기본파 (VLL,rms=${params.vll_rms_fund ? params.vll_rms_fund.toFixed(1) : 0}V)`, padL + 6, padT + 2 * rowH + 12);

    // Center line for Vab = 0V
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, yMid3);
    ctx.lineTo(padL + plotW, yMid3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Raw pulsating Vab (+Vdc, 0, -Vdc) — High-contrast deep blue #2563eb
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = padL + (i / (n - 1)) * plotW;
      const vNorm = waveformHistory[i].vab / (params.Vdc || 1);
      const py = yMid3 - vNorm * (rowH * 0.4);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Filtered Fundamental Sine Wave — High-contrast red/amber #dc2626
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = padL + (i / (n - 1)) * plotW;
      const fundNorm = Math.sin(waveformHistory[i].theta + Math.PI / 6) * (params.modulationIndex || 0.8);
      const py = yMid3 - fundNorm * (rowH * 0.38);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // Canvas Rendering: 3) Electromechanical Motor & Phasor Vector Field
  // =========================================================================

  function renderMotorAnimation(canvas, motorState, params, motorPreset) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Pure crisp white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Layout:
    // Left: Rotating Magnetic Field Phasor Diagram (Stator flux vs Rotor flux)
    // Center: Mechanical Cross-section of Rotating Motor (Stator windings + Squirrel-cage rotor)
    // Right: Analog Telemetry Gauges (Speedometer RPM, Torque Gauge, Power/Efficiency)
    const paneW = width / 3;

    // -------------------------------------------------------------
    // Pane 1: Phasor Vector Diagram (Stator Flux Ψs & Rotor Flux Ψr)
    // -------------------------------------------------------------
    const p1CenterX = paneW / 2;
    const p1CenterY = height / 2;
    const p1Radius = Math.min(paneW, height) * 0.38;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🌀 회전 자계 벡터 (Phasor)', 16, 22);

    // Circular dial background
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p1CenterX, p1CenterY, p1Radius * 0.5, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p1CenterX, p1CenterY, p1Radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Stator flux vector Ψs (rotating at synchronous speed ωs) — High-contrast Red #dc2626
    const statorAngle = motorState.statorAngle || 0;
    const psX = p1CenterX + p1Radius * 0.85 * Math.cos(statorAngle);
    const psY = p1CenterY - p1Radius * 0.85 * Math.sin(statorAngle);
    drawVectorArrow(ctx, p1CenterX, p1CenterY, psX, psY, '#dc2626', 'Ψs (동기 자계)');

    // Rotor flux vector Ψr (rotating at mechanical speed ω, lagging by slip torque angle) — High-contrast Blue #2563eb
    const rotorAngle = motorState.rotorAngle || 0;
    const prX = p1CenterX + p1Radius * 0.72 * Math.cos(rotorAngle);
    const prY = p1CenterY - p1Radius * 0.72 * Math.sin(rotorAngle);
    drawVectorArrow(ctx, p1CenterX, p1CenterY, prX, prY, '#2563eb', 'Ψr (회전자 자계)');

    // -------------------------------------------------------------
    // Pane 2: Mechanical Motor Cross-Section Animation
    // -------------------------------------------------------------
    const p2CenterX = width / 2;
    const p2CenterY = height / 2;
    const statorR = Math.min(paneW, height) * 0.42;
    const rotorR = statorR * 0.65;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⚙️ 3상 유도 전동기 기계 회전체 (Rotor)', p2CenterX - 95, 22);

    // Stator Outer Ring: stroke #0f172a (lineWidth 2.5), fill #ffffff
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p2CenterX, p2CenterY, statorR, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 12 Stator Coils glowing according to phase current
    const numSlots = 12;
    for (let i = 0; i < numSlots; i++) {
      const slotAngle = (i / numSlots) * 2 * Math.PI;
      const sx = p2CenterX + (statorR - 8) * Math.cos(slotAngle);
      const sy = p2CenterY + (statorR - 8) * Math.sin(slotAngle);

      // Phase mapping (U, V, W) -> #dc2626, #16a34a, #2563eb
      const phaseIdx = i % 3;
      const phaseColor = phaseIdx === 0 ? '#dc2626' : (phaseIdx === 1 ? '#16a34a' : '#2563eb');

      ctx.fillStyle = phaseColor;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Airgap circle
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(p2CenterX, p2CenterY, (statorR + rotorR) / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Squirrel-Cage Rotor: #f8fafc with #0f172a border
    ctx.save();
    ctx.translate(p2CenterX, p2CenterY);
    ctx.rotate(rotorAngle);

    // Rotor Core Body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, rotorR, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotor Copper Bars (16 bars)
    const numBars = 16;
    for (let b = 0; b < numBars; b++) {
      const bAngle = (b / numBars) * 2 * Math.PI;
      const bx = (rotorR - 6) * Math.cos(bAngle);
      const by = (rotorR - 6) * Math.sin(bAngle);

      ctx.fillStyle = '#d97706'; // Copper amber
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Center Shaft
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // -------------------------------------------------------------
    // Pane 3: Digital Gauges & Performance Telemetry
    // -------------------------------------------------------------
    const p3X = width * (2 / 3) + 12;
    let curY = 28;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('📊 동역학 텔레메트리 (Telemetry)', p3X, curY);
    curY += 22;

    const rpmCurrent = (motorState.omega * 60) / (2 * Math.PI);
    const rpmSync = (motorState.omega_s * 60) / (2 * Math.PI);
    const slipPct = motorState.slip * 100;

    // RPM & Speed Gauge Box
    drawTelemetryBox(ctx, p3X, curY, width - p3X - 16, 52, '#0284c7', '회전 속도 (Rotor Speed)', `${rpmCurrent.toFixed(0)} RPM`, `동기속도 Ns: ${rpmSync.toFixed(0)} RPM | 슬립 s: ${slipPct.toFixed(2)}%`);
    curY += 58;

    // Torque Box: Te vs TL
    const te = motorState.Te || 0;
    const tl = params.loadTorque || 0;
    drawTelemetryBox(ctx, p3X, curY, width - p3X - 16, 52, '#7c3aed', '전자기 토크 vs 부하 토크', `Te: ${te.toFixed(1)} N·m  |  TL: ${tl.toFixed(1)} N·m`, `최대 탈조토크 Tmax: ${motorState.Tmax ? motorState.Tmax.toFixed(1) : 0} N·m`);
    curY += 58;

    // Power & Efficiency Box
    const pinKw = (motorState.Pin || 0) / 1000;
    const poutKw = (motorState.Pout || 0) / 1000;
    const eff = motorState.efficiency || 0;
    const cosPhi = motorState.cosPhi || 0.85;

    drawTelemetryBox(ctx, p3X, curY, width - p3X - 16, 56, '#16a34a', '출력 및 효율 (Efficiency)', `Pout: ${poutKw.toFixed(2)} kW (효율: ${eff.toFixed(1)}%)`, `입력 Pin: ${pinKw.toFixed(2)} kW | 역률 cosφ: ${cosPhi.toFixed(2)}`);

    ctx.restore();
  }

  function drawVectorArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(label, toX + 6, toY + 4);
    }
    ctx.restore();
  }

  function drawTelemetryBox(ctx, x, y, w, h, accentColor, title, mainVal, subVal) {
    // Pure white background, crisp 1.5px #0f172a border, dark #0f172a text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Left accent indicator line
    ctx.fillStyle = accentColor;
    ctx.fillRect(x, y, 4, h);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(title, x + 10, y + 14);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(mainVal, x + 10, y + 32);

    ctx.fillStyle = '#475569';
    ctx.font = '9px sans-serif';
    ctx.fillText(subVal, x + 10, y + 46);
  }

  // =========================================================================
  // Simulator Controller & Public Interface
  // =========================================================================

  function createInverterMotorSimulator(containerEl, options) {
    const opts = options || {};
    const targetEl = typeof containerEl === 'string' ? (typeof document !== 'undefined' ? document.querySelector(containerEl) : null) : containerEl;

    let activePresetKey = opts.initialPreset || 'standard_5kw';
    let motorPreset = Object.assign({}, MOTOR_PRESETS[activePresetKey]);

    const params = {
      modulationMode: opts.modulationMode || 'SPWM', // 'SPWM' or 'SVPWM'
      modulationIndex: 0.85,
      frequency: 60.0,      // Inverter fundamental frequency (Hz)
      carrierFreq: 5000.0,  // Carrier switching frequency (Hz)
      Vdc: 540.0,           // DC Bus Voltage (V)
      loadTorque: 15.0      // Load torque TL (N·m)
    };

    // Electromechanical State: [omega (rad/s)]
    let omega = 0.0;
    let statorAngle = 0.0;
    let rotorAngle = 0.0;
    let simTime = 0.0;
    let animTick = 0;

    let isRunning = true;
    let animFrameId = null;

    // Buffer for waveforms (approx 400 sample points)
    const MAX_WAVEFORM_PTS = 320;
    let waveformHistory = [];

    // Live Metrics
    let liveMotorMetrics = {
      omega: 0,
      omega_s: 0,
      slip: 1.0,
      Te: 0,
      Tmax: 0,
      I1: 0,
      cosPhi: 0.85,
      Pin: 0,
      Pout: 0,
      efficiency: 0,
      statorAngle: 0,
      rotorAngle: 0
    };

    // DOM Elements
    let rootContainer = null;
    let schematicCanvas = null;
    let waveformCanvas = null;
    let motorCanvas = null;

    // --- Build DOM ---
    function buildUI() {
      if (!targetEl) return;
      targetEl.innerHTML = '';
      rootContainer = document.createElement('div');
      rootContainer.className = 'inverter-motor-sim-wrapper';
      rootContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: #ffffff;
        color: #0f172a;
        border-radius: 10px;
        border: 2px solid #0f172a;
        padding: 18px;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;

      // Header
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
      headerDiv.innerHTML = `
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
            <span>⚡⚙️</span> 3상 전압형 인버터(VSI) &amp; 유도 전동기 동역학 시뮬레이터
          </h2>
          <p style="font-size: 0.85rem; color: #475569; margin: 4px 0 0 0;">
            SPWM / SVPWM 변조 방식, 6-Switch H-브리지 인버터 스위칭, 3상 유도 전동기 Runge-Kutta(RK4) 전자기 토크·회전 가속도 ODE 동역학 해석
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="im-run-btn" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 6px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: bold; transition: all 0.15s ease;">일시정지</button>
          <button id="im-reset-btn" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 6px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: bold; transition: all 0.15s ease;">정지 및 초기화</button>
        </div>
      `;
      rootContainer.appendChild(headerDiv);

      // Top Row: Canvas 1 (Inverter Bridge Schematic) + Canvas 2 (Real-Time Multi-Trace Waveforms)
      const topRow = document.createElement('div');
      topRow.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      `;
      if (window.innerWidth < 960) topRow.style.gridTemplateColumns = '1fr';

      // Schematic Box
      const schemBox = document.createElement('div');
      schemBox.style.cssText = `background: #ffffff; border-radius: 8px; overflow: hidden; border: 1.5px solid #0f172a;`;
      schemBox.innerHTML = `
        <div style="background: #f8fafc; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0f172a; display: flex; justify-content: space-between;">
          <span>🔌 3상 VSI 인버터 브리지 회로도 (6-Switch H-Bridge)</span>
          <span style="color: #16a34a; font-weight: bold;">실시간 스위칭 도통 애니메이션</span>
        </div>
      `;
      schematicCanvas = document.createElement('canvas');
      schematicCanvas.style.cssText = `width: 100%; height: 260px; display: block; background: #ffffff;`;
      schemBox.appendChild(schematicCanvas);
      topRow.appendChild(schemBox);

      // Waveform Box
      const waveBox = document.createElement('div');
      waveBox.style.cssText = `background: #ffffff; border-radius: 8px; overflow: hidden; border: 1.5px solid #0f172a;`;
      waveBox.innerHTML = `
        <div style="background: #f8fafc; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0f172a; display: flex; justify-content: space-between;">
          <span>📈 실시간 PWM 파형 모니터링 (Carrier, Pulses, Line Vab)</span>
          <span id="im-mode-badge" style="color: #0f172a; font-family: monospace; font-weight: bold;">SPWM Mode</span>
        </div>
      `;
      waveformCanvas = document.createElement('canvas');
      waveformCanvas.style.cssText = `width: 100%; height: 260px; display: block; background: #ffffff;`;
      waveBox.appendChild(waveformCanvas);
      topRow.appendChild(waveBox);

      rootContainer.appendChild(topRow);

      // Bottom Row: Canvas 3 (Electromechanical Motor Dynamics & Phasors)
      const motorBox = document.createElement('div');
      motorBox.style.cssText = `background: #ffffff; border-radius: 8px; overflow: hidden; border: 1.5px solid #0f172a;`;
      motorBox.innerHTML = `
        <div style="background: #f8fafc; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; color: #0f172a; border-bottom: 1.5px solid #0f172a; display: flex; justify-content: space-between;">
          <span>⚙️ 3상 유도 전동기 전자기 기계 동역학 (Electromechanical Motor Dynamics)</span>
          <span style="color: #0f172a; font-weight: 600;">J·dω/dt = Te - TL - B·ω (RK4 Solver)</span>
        </div>
      `;
      motorCanvas = document.createElement('canvas');
      motorCanvas.style.cssText = `width: 100%; height: 230px; display: block; background: #ffffff;`;
      motorBox.appendChild(motorCanvas);
      rootContainer.appendChild(motorBox);

      // Controls Grid (Modulation, Presets, Frequency, Vdc, Load Torque)
      const controlsBox = document.createElement('div');
      controlsBox.style.cssText = `
        background: #ffffff;
        padding: 14px;
        border-radius: 8px;
        border: 1.5px solid #0f172a;
        display: flex;
        flex-direction: column;
        gap: 12px;
      `;

      controlsBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin: 0; color: #0f172a;">🎛️ 인버터 &amp; 전동기 파라미터 제어 (Inverter &amp; Motor Tuning)</h4>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.8rem; color: #475569; font-weight: 600;">변조 방식:</span>
            <button id="im-btn-spwm" style="padding: 4px 12px; font-size: 0.75rem; border-radius: 4px; background: #0f172a; border: 1.5px solid #0f172a; color: #ffffff; cursor: pointer; font-weight: bold; transition: all 0.15s ease;">SPWM</button>
            <button id="im-btn-svpwm" style="padding: 4px 12px; font-size: 0.75rem; border-radius: 4px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: bold; transition: all 0.15s ease;">SVPWM</button>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 4px;">
          <span style="font-size: 0.8rem; color: #475569; font-weight: 600;">모터 프리셋:</span>
          <button id="im-preset-standard_5kw" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; background: #0f172a; border: 1.5px solid #0f172a; color: #ffffff; cursor: pointer; font-weight: bold;">5.5kW 산업용</button>
          <button id="im-preset-spindle_highspeed" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: bold;">고속 스핀들</button>
          <button id="im-preset-traction_heavyduty" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; background: #ffffff; border: 1.5px solid #0f172a; color: #0f172a; cursor: pointer; font-weight: bold;">중부하 견인</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 0.8rem;">
          <div>
            <div style="display: flex; justify-content: space-between;">
              <label style="color: #0f172a; font-weight: 600;">변조 지수 (ma):</label>
              <span id="im-val-ma" style="color: #0f172a; font-family: monospace; font-weight: bold;">${params.modulationIndex.toFixed(2)}</span>
            </div>
            <input type="range" id="im-slider-ma" min="0.1" max="1.2" step="0.05" value="${params.modulationIndex}" style="width: 100%; margin-top: 4px; accent-color: #0f172a;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between;">
              <label style="color: #0f172a; font-weight: 600;">출력 주파수 (f):</label>
              <span id="im-val-f" style="color: #0f172a; font-family: monospace; font-weight: bold;">${params.frequency.toFixed(0)} Hz</span>
            </div>
            <input type="range" id="im-slider-f" min="5" max="120" step="1" value="${params.frequency}" style="width: 100%; margin-top: 4px; accent-color: #0f172a;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between;">
              <label style="color: #0f172a; font-weight: 600;">반송파 주파수 (fc):</label>
              <span id="im-val-fc" style="color: #0f172a; font-family: monospace; font-weight: bold;">${(params.carrierFreq/1000).toFixed(1)} kHz</span>
            </div>
            <input type="range" id="im-slider-fc" min="1000" max="20000" step="500" value="${params.carrierFreq}" style="width: 100%; margin-top: 4px; accent-color: #0f172a;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between;">
              <label style="color: #0f172a; font-weight: 600;">DC 버스 전압 (Vdc):</label>
              <span id="im-val-vdc" style="color: #0f172a; font-family: monospace; font-weight: bold;">${params.Vdc} V</span>
            </div>
            <input type="range" id="im-slider-vdc" min="100" max="800" step="10" value="${params.Vdc}" style="width: 100%; margin-top: 4px; accent-color: #0f172a;">
          </div>

          <div>
            <div style="display: flex; justify-content: space-between;">
              <label style="color: #0f172a; font-weight: 600;">기계적 부하 토크 (TL):</label>
              <span id="im-val-tl" style="color: #0f172a; font-family: monospace; font-weight: bold;">${params.loadTorque} N·m</span>
            </div>
            <input type="range" id="im-slider-tl" min="0" max="50" step="1" value="${params.loadTorque}" style="width: 100%; margin-top: 4px; accent-color: #0f172a;">
          </div>
        </div>
      `;
      rootContainer.appendChild(controlsBox);
      if (targetEl) targetEl.appendChild(rootContainer);

      // Event Listeners
      const runBtn = rootContainer.querySelector('#im-run-btn');
      runBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        runBtn.textContent = isRunning ? '일시정지' : '계속 실행';
        if (isRunning) {
          runBtn.style.background = '#ffffff';
          runBtn.style.color = '#0f172a';
        } else {
          runBtn.style.background = '#0f172a';
          runBtn.style.color = '#ffffff';
        }
      });

      const resetBtn = rootContainer.querySelector('#im-reset-btn');
      resetBtn.addEventListener('click', reset);

      const spwmBtn = rootContainer.querySelector('#im-btn-spwm');
      const svpwmBtn = rootContainer.querySelector('#im-btn-svpwm');
      const modeBadge = rootContainer.querySelector('#im-mode-badge');

      spwmBtn.addEventListener('click', () => {
        params.modulationMode = 'SPWM';
        spwmBtn.style.background = '#0f172a';
        spwmBtn.style.color = '#ffffff';
        svpwmBtn.style.background = '#ffffff';
        svpwmBtn.style.color = '#0f172a';
        modeBadge.textContent = 'SPWM Mode';
      });

      svpwmBtn.addEventListener('click', () => {
        params.modulationMode = 'SVPWM';
        svpwmBtn.style.background = '#0f172a';
        svpwmBtn.style.color = '#ffffff';
        spwmBtn.style.background = '#ffffff';
        spwmBtn.style.color = '#0f172a';
        modeBadge.textContent = 'SVPWM (3rd Harm Injection)';
      });

      // Preset buttons listeners
      ['standard_5kw', 'spindle_highspeed', 'traction_heavyduty'].forEach(key => {
        const pBtn = rootContainer.querySelector(`#im-preset-${key}`);
        if (pBtn) {
          pBtn.addEventListener('click', () => {
            setParams({ preset: key });
            ['standard_5kw', 'spindle_highspeed', 'traction_heavyduty'].forEach(k => {
              const b = rootContainer.querySelector(`#im-preset-${k}`);
              if (b) {
                if (k === key) {
                  b.style.background = '#0f172a';
                  b.style.color = '#ffffff';
                } else {
                  b.style.background = '#ffffff';
                  b.style.color = '#0f172a';
                }
              }
            });
          });
        }
      });

      // Slider Bindings
      bindSlider('ma', (val) => { params.modulationIndex = val; return val.toFixed(2); });
      bindSlider('f', (val) => { params.frequency = val; return val.toFixed(0) + ' Hz'; });
      bindSlider('fc', (val) => { params.carrierFreq = val; return (val / 1000).toFixed(1) + ' kHz'; });
      bindSlider('vdc', (val) => { params.Vdc = val; return val + ' V'; });
      bindSlider('tl', (val) => { params.loadTorque = val; return val + ' N·m'; });

      setupCanvasesDPI();
    }

    function bindSlider(key, formatter) {
      const slider = rootContainer.querySelector(`#im-slider-${key}`);
      const valSpan = rootContainer.querySelector(`#im-val-${key}`);
      slider.addEventListener('input', (e) => {
        const num = Number(e.target.value);
        valSpan.textContent = formatter(num);
      });
    }

    function setupCanvasesDPI() {
      const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      [schematicCanvas, waveformCanvas, motorCanvas].forEach(c => {
        if (!c) return;
        const rect = c.getBoundingClientRect();
        const w = rect.width || 560;
        const h = rect.height || 260;
        c.width = w * dpr;
        c.height = h * dpr;
        const ctx = c.getContext('2d');
        ctx.scale(dpr, dpr);
      });
    }

    // --- Simulation Dynamics Step ---
    function stepSimulation() {
      if (!isRunning) return;

      // Micro-stepping for RK4 motor ODE
      const substeps = 15;
      const targetDt = 0.001 / substeps; // 1ms per frame divided into 15 substeps

      let lastPWM = null;

      for (let s = 0; s < substeps; s++) {
        simTime += targetDt;
        lastPWM = computePWMInstant(simTime, params);

        // RK4 step for mechanical ODE: J * d(omega)/dt = Te - TL - B*omega
        const derivs = (tCur, yState, p) => {
          const w = yState[0];
          const mData = computeMotorTorqueAndCurrent(w, p, motorPreset, lastPWM.vph_rms_fund);
          const dw_dt = (mData.Te - p.loadTorque - motorPreset.B * w) / motorPreset.J;
          return [dw_dt];
        };

        const nextY = rk4(derivs, simTime, new Float64Array([omega]), targetDt, params);
        omega = Math.max(0, nextY[0]); // unidirectional rotation

        // Update electrical & mechanical angles
        statorAngle = (statorAngle + (2 * Math.PI * params.frequency) * targetDt) % (2 * Math.PI);
        rotorAngle = (rotorAngle + omega * targetDt) % (2 * Math.PI);
      }

      animTick++;

      // Record waveform history for real-time plot
      if (lastPWM) {
        waveformHistory.push({
          vTri: lastPWM.vTri,
          vaRef: lastPWM.vaRef,
          vbRef: lastPWM.vbRef,
          vcRef: lastPWM.vcRef,
          legs: lastPWM.legs,
          vab: lastPWM.vab,
          theta: lastPWM.theta
        });
        if (waveformHistory.length > MAX_WAVEFORM_PTS) {
          waveformHistory.shift();
        }

        // Update Motor Telemetry Metrics
        const motorMetrics = computeMotorTorqueAndCurrent(omega, params, motorPreset, lastPWM.vph_rms_fund);
        liveMotorMetrics = Object.assign({}, motorMetrics, {
          omega,
          statorAngle,
          rotorAngle,
          vll_rms_fund: lastPWM.vll_rms_fund
        });
      }
    }

    function renderLoop() {
      stepSimulation();

      const lastPWM = computePWMInstant(simTime, params);
      renderInverterSchematic(schematicCanvas, lastPWM, params, animTick);
      renderWaveforms(waveformCanvas, waveformHistory, Object.assign({}, params, { vll_rms_fund: lastPWM.vll_rms_fund }));
      renderMotorAnimation(motorCanvas, liveMotorMetrics, params, motorPreset);

      animFrameId = requestAnimationFrame(renderLoop);
    }

    function reset() {
      omega = 0;
      statorAngle = 0;
      rotorAngle = 0;
      simTime = 0;
      waveformHistory = [];
    }

    function setParams(newParams) {
      if (!newParams) return;
      Object.assign(params, newParams);
      if (newParams.preset && MOTOR_PRESETS[newParams.preset]) {
        activePresetKey = newParams.preset;
        motorPreset = Object.assign({}, MOTOR_PRESETS[activePresetKey]);
      }
    }

    function setModulationMode(mode) {
      if (mode === 'SPWM' || mode === 'SVPWM') {
        params.modulationMode = mode;
      }
    }

    function destroy() {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (targetEl) targetEl.innerHTML = '';
    }

    buildUI();
    animFrameId = requestAnimationFrame(renderLoop);

    return {
      setParams,
      setModulationMode,
      getMetrics: () => Object.assign({}, liveMotorMetrics),
      getParams: () => Object.assign({}, params),
      pause: () => { isRunning = false; },
      resume: () => { isRunning = true; },
      reset,
      destroy
    };
  }

  // Public Export
  return {
    init: createInverterMotorSimulator,
    computePWMInstant,
    computeMotorTorqueAndCurrent,
    MOTOR_PRESETS,
    rk4
  };
}));
