/**
 * rlc-transient.js — RLC Circuit Transient Response Simulator
 * Solves series RLC circuit differential equations:
 * d^2 v_C / dt^2 + (R/L) * d v_C / dt + (1/LC) * v_C = (1/LC) * V_in
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./ee-sim-core.js');
    module.exports = factory(core);
  } else {
    root.RLCTransientSim = factory(root.EESimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function computeRLCTransient(params) {
    const R = Math.max(0.001, Number(params.R) || 20);
    const L = Math.max(1e-6, Number(params.L) || 0.1);
    const C = Math.max(1e-9, Number(params.C) || 1e-4);
    const Vin = Number(params.Vin) !== undefined ? Number(params.Vin) : 10;
    const tMax = Number(params.tMax) || 0.05;
    const steps = Math.min(2000, Math.max(100, Number(params.steps) || 500));

    const alpha = R / (2 * L); // Damping attenuation
    const omega0 = 1 / Math.sqrt(L * C); // Undamped natural angular frequency
    const dt = tMax / steps;

    const times = [];
    const vcValues = [];
    const iValues = [];

    let dampingType = 'underdamped';
    const disc = alpha * alpha - omega0 * omega0;

    if (Math.abs(disc) < 1e-6 * (alpha * alpha)) {
      dampingType = 'critically_damped';
    } else if (disc > 0) {
      dampingType = 'overdamped';
    } else {
      dampingType = 'underdamped';
    }

    for (let k = 0; k <= steps; k++) {
      const t = k * dt;
      let vc = 0;
      let current = 0;

      if (dampingType === 'critically_damped') {
        // v_c(t) = Vin * [1 - e^(-alpha*t) * (1 + alpha*t)]
        const expTerm = Math.exp(-alpha * t);
        vc = Vin * (1 - expTerm * (1 + alpha * t));
        current = C * Vin * alpha * alpha * t * expTerm;
      } else if (dampingType === 'overdamped') {
        // Roots s1, s2 = -alpha +- sqrt(alpha^2 - omega0^2)
        const beta = Math.sqrt(disc);
        const s1 = -alpha + beta;
        const s2 = -alpha - beta;
        // v_c(t) = Vin * [1 - (s2*e^(s1*t) - s1*e^(s2*t)) / (s2 - s1)]
        const term = (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
        vc = Vin * (1 - term);
        current = C * Vin * ((-s1 * s2 * Math.exp(s1 * t) + s1 * s2 * Math.exp(s2 * t)) / (s2 - s1));
      } else {
        // Underdamped: omega_d = sqrt(omega0^2 - alpha^2)
        const omega_d = Math.sqrt(omega0 * omega0 - alpha * alpha);
        const expTerm = Math.exp(-alpha * t);
        // v_c(t) = Vin * [1 - exp(-alpha*t) * (cos(wd*t) + (alpha/wd)*sin(wd*t))]
        const cosTerm = Math.cos(omega_d * t);
        const sinTerm = (alpha / omega_d) * Math.sin(omega_d * t);
        vc = Vin * (1 - expTerm * (cosTerm + sinTerm));
        current = (Vin / (omega_d * L)) * expTerm * Math.sin(omega_d * t);
      }

      times.push(t);
      vcValues.push(vc);
      iValues.push(current);
    }

    return {
      R, L, C, Vin, tMax, steps,
      alpha, omega0, dampingType,
      times, vcValues, iValues
    };
  }

  function renderRLCTransient(canvas, params) {
    if (!canvas) return;
    const res = computeRLCTransient(params);
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    // Grid and axes
    const midY = height * 0.7; // baseline near bottom
    core.drawGrid(ctx, width, height, { midY, stepX: width / 10, stepY: height / 8 });

    // Find scale
    const maxVc = Math.max(...res.vcValues, res.Vin * 1.2, 1);
    const maxI = Math.max(...res.iValues.map(Math.abs), 0.1);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Map points for Vc (Voltage across C)
    const vcPoints = [];
    const iPoints = [];
    for (let k = 0; k < res.times.length; k++) {
      const px = padLeft + (res.times[k] / res.tMax) * plotW;
      const pyVc = (height - padBottom) - (res.vcValues[k] / (maxVc * 1.2)) * plotH;
      const pyI = (height - padBottom) - (res.iValues[k] / (maxI * 2)) * plotH;
      vcPoints.push({ x: px, y: pyVc });
      iPoints.push({ x: px, y: pyI });
    }

    // Step input reference line (Vin)
    const targetY = (height - padBottom) - (res.Vin / (maxVc * 1.2)) * plotH;
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, targetY);
    ctx.lineTo(width - padRight, targetY);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Vin = ${res.Vin}V`, padLeft + 5, targetY - 4);
    ctx.restore();

    // Draw Vc (Blue trace)
    core.drawWaveform(ctx, vcPoints, '#2563eb', 2.5);

    // Draw Current (Orange trace)
    core.drawWaveform(ctx, iPoints, '#f97316', 1.8);

    // Legend and Info overlay
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    const typeLabel = res.dampingType === 'underdamped' ? '저감쇠 (Underdamped)'
      : res.dampingType === 'critically_damped' ? '임계감쇠 (Critically Damped)' : '과감쇠 (Overdamped)';
    ctx.fillText(`[RLC 과도응답] ${typeLabel} | α = ${res.alpha.toFixed(1)} rad/s, ω₀ = ${res.omega0.toFixed(1)} rad/s`, padLeft, 20);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(width - 170, 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.font = '11px sans-serif';
    ctx.fillText('v_C(t) 전압 [V]', width - 152, 20);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(width - 90, 10, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('i(t) 전류 [A]', width - 72, 20);
    ctx.restore();

    return res;
  }

  return {
    computeRLCTransient,
    renderRLCTransient
  };
}));
