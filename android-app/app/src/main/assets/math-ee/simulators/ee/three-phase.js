/**
 * three-phase.js — 3-Phase AC Systems (Y and Delta) Simulator
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./ee-sim-core.js');
    module.exports = factory(core);
  } else {
    root.ThreePhaseSim = factory(root.EESimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function computeThreePhase(params) {
    const Vphase = Math.max(1, Number(params.Vphase) || 220); // Phase voltage RMS
    const f = Math.max(1, Number(params.frequency) || 60);
    const connection = params.connection === 'Delta' ? 'Delta' : 'Y';
    const loadZ = Math.max(0.1, Number(params.loadZ) || 10);
    const powerFactor = Math.min(1, Math.max(0.1, Number(params.powerFactor) || 0.85));

    const theta_rad = Math.acos(powerFactor);

    // Line to line voltage
    let Vline = 0;
    let Iphase = 0;
    let Iline = 0;

    if (connection === 'Y') {
      Vline = Math.sqrt(3) * Vphase;
      Iphase = Vphase / loadZ;
      Iline = Iphase;
    } else {
      Vline = Vphase;
      Iphase = Vline / loadZ;
      Iline = Math.sqrt(3) * Iphase;
    }

    const P_total = Math.sqrt(3) * Vline * Iline * powerFactor;
    const S_total = Math.sqrt(3) * Vline * Iline;
    const Q_total = Math.sqrt(Math.max(0, S_total * S_total - P_total * P_total));

    // Time-domain waveforms for 1 full cycle
    const pointsA = [];
    const pointsB = [];
    const pointsC = [];
    const pointsVab = [];
    const T = 1 / f;
    const steps = 200;

    const Vm = Math.sqrt(2) * Vphase;
    const Vm_line = Math.sqrt(2) * Vline;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * T;
      const omega_t = 2 * Math.PI * f * t;

      const va = Vm * Math.sin(omega_t);
      const vb = Vm * Math.sin(omega_t - (2 * Math.PI / 3));
      const vc = Vm * Math.sin(omega_t - (4 * Math.PI / 3));
      const vab = Vm_line * Math.sin(omega_t + (Math.PI / 6));

      pointsA.push({ t, v: va });
      pointsB.push({ t, v: vb });
      pointsC.push({ t, v: vc });
      pointsVab.push({ t, v: vab });
    }

    return {
      Vphase, Vline, f, connection, loadZ, powerFactor, theta_rad,
      Iphase, Iline, P_total, Q_total, S_total,
      pointsA, pointsB, pointsC, pointsVab
    };
  }

  function renderThreePhase(canvas, params) {
    if (!canvas) return;
    const res = computeThreePhase(params);
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Pure crisp white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const midY = height / 2;
    core.drawGrid(ctx, width, height, { midY, stepX: width / 12, stepY: height / 6, gridColor: '#e2e8f0', axisColor: '#cbd5e1' });

    // Map time points to canvas
    const padLeft = 40;
    const padRight = 20;
    const plotW = width - padLeft - padRight;
    const maxV = Math.max(res.Vline * 1.5, 300);

    // Outer plot border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padLeft, 30, plotW, height - 62);

    function mapPoints(pts) {
      return pts.map(p => ({
        x: padLeft + (p.t / (1 / res.f)) * plotW,
        y: midY - (p.v / maxV) * (height * 0.38)
      }));
    }

    // Draw Phase A (Red #dc2626)
    core.drawWaveform(ctx, mapPoints(res.pointsA), '#dc2626', 2.2);
    // Draw Phase B (Green #16a34a)
    core.drawWaveform(ctx, mapPoints(res.pointsB), '#16a34a', 2.2);
    // Draw Phase C (Blue #2563eb)
    core.drawWaveform(ctx, mapPoints(res.pointsC), '#2563eb', 2.2);
    // Draw Line Voltage Vab (Dashed Purple #7c3aed)
    ctx.save();
    ctx.setLineDash([4, 4]);
    core.drawWaveform(ctx, mapPoints(res.pointsVab), '#7c3aed', 2.0);
    ctx.restore();

    // Overlay Header & Legend (#0f172a)
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`[3상 교류 ${res.connection}결선] 상전압=${res.Vphase}V → 선간전압=${res.Vline.toFixed(1)}V (x√3배), 3상 총전력=${(res.P_total / 1000).toFixed(2)}kW`, padLeft, 20);

    // Legend items
    const legends = [
      { color: '#dc2626', text: 'Va (0°)' },
      { color: '#16a34a', text: 'Vb (-120°)' },
      { color: '#2563eb', text: 'Vc (-240°)' },
      { color: '#7c3aed', text: '선간전압 Vab (+30°)' }
    ];
    let legX = padLeft;
    for (const leg of legends) {
      ctx.fillStyle = leg.color;
      ctx.fillRect(legX, height - 20, 10, 10);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(leg.text, legX + 14, height - 11);
      legX += 120;
    }
    ctx.restore();
    ctx.restore();

    return res;
  }

  return {
    computeThreePhase,
    renderThreePhase
  };
}));
