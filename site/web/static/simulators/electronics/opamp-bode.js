/**
 * opamp-bode.js — OP-Amp and Active Filter Frequency Response (Bode Plot) Simulator
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./electronics-sim-core.js');
    module.exports = factory(core);
  } else {
    root.OpampBodeSim = factory(root.ElectronicsSimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function computeBodePlot(params) {
    const p = params || {};
    const filterType = p.filterType || 'lpf_1st'; // 'inverting', 'non_inverting', 'lpf_1st', 'hpf_1st'
    const R1 = Math.max(100, Number(p.R1) || 10000); // 10k
    const Rf = Math.max(100, Number(p.Rf) || 100000); // 100k
    const C = Math.max(1e-12, Number(p.C) || 1e-8); // 10nF
    const opampGBW = Number(p.gbw) || 1e6; // 1 MHz Gain-Bandwidth Product

    // Calculate Cutoff / DC characteristics
    let dcGain = 1;
    let fc = 1 / (2 * Math.PI * Rf * C); // for LPF

    if (filterType === 'inverting') {
      dcGain = Math.abs(Rf / R1);
      fc = opampGBW / dcGain;
    } else if (filterType === 'non_inverting') {
      dcGain = 1 + (Rf / R1);
      fc = opampGBW / dcGain;
    } else if (filterType === 'lpf_1st') {
      dcGain = Rf / R1; // active LPF DC gain
      fc = 1 / (2 * Math.PI * Rf * C);
    } else if (filterType === 'hpf_1st') {
      dcGain = Rf / R1;
      fc = 1 / (2 * Math.PI * R1 * C);
    }

    const dcGainDb = 20 * Math.log10(Math.max(1e-6, dcGain));

    // Sweep across 5 decades: 10 Hz to 1 MHz (minExp = 1, maxExp = 6)
    const minExp = 1;
    const maxExp = 6;
    const points = 250;
    const frequencies = [];
    const magDbList = [];
    const phaseDegList = [];

    for (let i = 0; i <= points; i++) {
      const exp = minExp + (i / points) * (maxExp - minExp);
      const f = Math.pow(10, exp);
      const omega = 2 * Math.PI * f;
      const omega_c = 2 * Math.PI * fc;

      let mag = 0;
      let phase = 0;

      if (filterType === 'lpf_1st' || filterType === 'inverting') {
        // H(s) = A0 / (1 + j * omega / omega_c)
        mag = dcGain / Math.sqrt(1 + Math.pow(omega / omega_c, 2));
        phase = -Math.atan2(omega, omega_c) * (180 / Math.PI);
        if (filterType === 'inverting') phase -= 180; // Inverting 180 deg
      } else if (filterType === 'hpf_1st') {
        // H(s) = A0 * (j * omega / omega_c) / (1 + j * omega / omega_c)
        const ratio = omega / omega_c;
        mag = dcGain * (ratio / Math.sqrt(1 + ratio * ratio));
        phase = (90 - Math.atan2(omega, omega_c) * (180 / Math.PI));
      } else {
        // Non-inverting with op-amp single pole roll-off
        mag = dcGain / Math.sqrt(1 + Math.pow(omega / omega_c, 2));
        phase = -Math.atan2(omega, omega_c) * (180 / Math.PI);
      }

      const magDb = 20 * Math.log10(Math.max(1e-6, mag));

      frequencies.push(f);
      magDbList.push(magDb);
      phaseDegList.push(phase);
    }

    return {
      filterType, R1, Rf, C, opampGBW,
      dcGain, dcGainDb, fc,
      frequencies, magDbList, phaseDegList
    };
  }

  function renderOpampBode(canvas, params) {
    if (!canvas) return;
    const res = computeBodePlot(params);
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid & Axes
    const axes = core.drawBodeAxes(ctx, width, height, {
      padL: 55, padR: 30, padT: 45, padB: 35,
      decades: 5, minExp: 1,
      dbSteps: [-40, -20, 0, 20, 40]
    });

    // Map points to canvas coordinates
    const minExp = 1;
    const maxExp = 6;
    const decades = maxExp - minExp;

    const magPoints = [];
    for (let i = 0; i < res.frequencies.length; i++) {
      const f = res.frequencies[i];
      const logF = Math.log10(f);
      const px = axes.padL + ((logF - minExp) / decades) * axes.plotW;
      const py = axes.padT + (1 - (res.magDbList[i] - axes.minDb) / (axes.maxDb - axes.minDb)) * axes.plotH;
      // Clamp within plot
      const clampedY = Math.max(axes.padT, Math.min(axes.padT + axes.plotH, py));
      magPoints.push({ x: px, y: clampedY });
    }

    // Draw Magnitude trace (Solid Blue, 2.5px)
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(magPoints[0].x, magPoints[0].y);
    for (let i = 1; i < magPoints.length; i++) {
      ctx.lineTo(magPoints[i].x, magPoints[i].y);
    }
    ctx.stroke();

    // Mark Cutoff Frequency fc with a circle and dashed line
    const logFc = Math.log10(res.fc);
    if (logFc >= minExp && logFc <= maxExp) {
      const fcX = axes.padL + ((logFc - minExp) / decades) * axes.plotW;
      const fcDb = res.dcGainDb - 3.01;
      const fcY = axes.padT + (1 - (fcDb - axes.minDb) / (axes.maxDb - axes.minDb)) * axes.plotH;

      ctx.strokeStyle = '#dc2626';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(fcX, axes.padT);
      ctx.lineTo(fcX, axes.padT + axes.plotH);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(fcX, fcY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 11px sans-serif';
      const fcStr = res.fc >= 1e3 ? `${(res.fc / 1e3).toFixed(1)}kHz` : `${res.fc.toFixed(0)}Hz`;
      ctx.fillText(`fc = ${fcStr} (-3dB)`, fcX + 8, fcY - 8);
    }

    // Header info
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`📈 OP-Amp 주파수 응답 (Bode Plot) | 직류 이득 A₀ = ${res.dcGainDb.toFixed(1)}dB (${res.dcGain.toFixed(1)}배)`, axes.padL, 25);
    ctx.restore();

    return res;
  }

  return {
    computeBodePlot,
    renderOpampBode
  };
}));
