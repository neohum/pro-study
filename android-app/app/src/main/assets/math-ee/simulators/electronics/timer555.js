/**
 * timer555.js — 555 Timer Astable Multivibrator Waveform Simulator
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./electronics-sim-core.js');
    module.exports = factory(core);
  } else {
    root.Timer555Sim = factory(root.ElectronicsSimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function compute555Waveform(params) {
    const p = params || {};
    const Vcc = Math.max(3, Number(p.Vcc) || 5.0);
    const Ra = Math.max(100, Number(p.Ra) || 10000); // 10k
    const Rb = Math.max(100, Number(p.Rb) || 10000); // 10k
    const C = Math.max(1e-12, Number(p.C) || 1e-6); // 1uF
    const cycles = Math.min(10, Math.max(2, Number(p.cycles) || 3));

    // Timing calculations:
    // Charge time through (Ra + Rb): t_high = ln(2) * (Ra + Rb) * C
    const tHigh = Math.LN2 * (Ra + Rb) * C;
    // Discharge time through Rb: t_low = ln(2) * Rb * C
    const tLow = Math.LN2 * Rb * C;
    const period = tHigh + tLow;
    const frequency = 1 / period;
    const dutyCycle = tHigh / period; // always > 0.5 in standard astable

    const vThreshold = (2 / 3) * Vcc;
    const vTrigger = (1 / 3) * Vcc;

    // Generate waveform samples across 'cycles'
    const totalTime = cycles * period;
    const steps = 400;
    const dt = totalTime / steps;

    const times = [];
    const vcValues = [];
    const voutValues = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const tInPeriod = t % period;

      let vc = 0;
      let vout = 0;

      if (tInPeriod < tHigh) {
        // Charging phase: starts from vTrigger, aims for Vcc
        // vc(t) = Vcc - (Vcc - vTrigger) * exp(-t / ((Ra+Rb)*C))
        const tauCharge = (Ra + Rb) * C;
        vc = Vcc - (Vcc - vTrigger) * Math.exp(-tInPeriod / tauCharge);
        vout = Vcc;
      } else {
        // Discharging phase: starts from vThreshold, aims for 0V
        // vc(t) = vThreshold * exp(-(t - tHigh) / (Rb*C))
        const tDis = tInPeriod - tHigh;
        const tauDis = Rb * C;
        vc = vThreshold * Math.exp(-tDis / tauDis);
        vout = 0;
      }

      times.push(t);
      vcValues.push(vc);
      voutValues.push(vout);
    }

    return {
      Vcc, Ra, Rb, C, cycles,
      tHigh, tLow, period, frequency, dutyCycle,
      vThreshold, vTrigger, totalTime,
      times, vcValues, voutValues
    };
  }

  function render555Timer(canvas, params) {
    if (!canvas) return;
    const res = compute555Waveform(params);
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = '#0f172a'; // Oscilloscope dark background
    ctx.fillRect(0, 0, width, height);

    const padL = 50;
    const padR = 25;
    const padT = 35;
    const padB = 30;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // Draw Oscilloscope Reticle Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = padL; x <= padL + plotW; x += plotW / 10) {
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
    }
    for (let y = padT; y <= padT + plotH; y += plotH / 8) {
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
    }

    // Reference Voltage Lines: 2/3 Vcc and 1/3 Vcc
    const y23 = (padT + plotH) - (res.vThreshold / (res.Vcc * 1.2)) * plotH;
    const y13 = (padT + plotH) - (res.vTrigger / (res.Vcc * 1.2)) * plotH;

    ctx.strokeStyle = '#334155';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, y23);
    ctx.lineTo(padL + plotW, y23);
    ctx.moveTo(padL, y13);
    ctx.lineTo(padL + plotW, y13);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('2/3 Vcc (Threshold)', padL + 5, y23 - 3);
    ctx.fillText('1/3 Vcc (Trigger)', padL + 5, y13 - 3);

    // Map time points
    const vcPts = [];
    const voutPts = [];
    for (let i = 0; i < res.times.length; i++) {
      const px = padL + (res.times[i] / res.totalTime) * plotW;
      const pyVc = (padT + plotH) - (res.vcValues[i] / (res.Vcc * 1.2)) * plotH;
      const pyVout = (padT + plotH) - (res.voutValues[i] / (res.Vcc * 1.2)) * plotH;
      vcPts.push({ x: px, y: pyVc });
      voutPts.push({ x: px, y: pyVout });
    }

    // Trace 1: Output Square Wave (Glowing Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < voutPts.length; i++) {
      if (i === 0) ctx.moveTo(voutPts[i].x, voutPts[i].y);
      else ctx.lineTo(voutPts[i].x, voutPts[i].y);
    }
    ctx.stroke();

    // Trace 2: Capacitor Charging/Discharging Waveform (Bright Yellow)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < vcPts.length; i++) {
      if (i === 0) ctx.moveTo(vcPts[i].x, vcPts[i].y);
      else ctx.lineTo(vcPts[i].x, vcPts[i].y);
    }
    ctx.stroke();

    // Header info
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    const fStr = res.frequency >= 1000 ? `${(res.frequency / 1000).toFixed(2)}kHz` : `${res.frequency.toFixed(1)}Hz`;
    ctx.fillText(`⏱️ 555 타이머 발진 파형 | 주파수 f = ${fStr} | 듀티비 D = ${(res.dutyCycle * 100).toFixed(1)}%`, padL, 20);

    // Legend
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(width - 190, 10, 10, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '11px sans-serif';
    ctx.fillText('Ch1: V_out 구형파', width - 175, 19);

    ctx.fillStyle = '#eab308';
    ctx.fillRect(width - 85, 10, 10, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('Ch2: v_C(t)', width - 70, 19);

    ctx.restore();
    return res;
  }

  return {
    compute555Waveform,
    render555Timer
  };
}));
