/**
 * phasor-power.js — AC Phasor and Power Triangle Simulator
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./ee-sim-core.js');
    module.exports = factory(core);
  } else {
    root.PhasorPowerSim = factory(root.EESimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function computePhasorPower(params) {
    const Vrms = Math.max(1, Number(params.Vrms) || 220);
    const f = Math.max(1, Number(params.frequency) || 60);
    const R = Math.max(0.1, Number(params.R) || 10);
    const L = params.L !== undefined ? Math.max(0, Number(params.L)) : 0.05;
    const C = params.C !== undefined ? Math.max(0, Number(params.C)) : 0.00005;
    const C_corr = params.C_corr !== undefined ? Math.max(0, Number(params.C_corr)) : 0;

    const omega = 2 * Math.PI * f;
    const XL = omega * L;
    const XC = C > 0 ? 1 / (omega * C) : 0;
    const X_load = XL - XC;

    // Load impedance: Z = R + j*X_load
    const Z_mag = Math.sqrt(R * R + X_load * X_load);
    const theta_rad = Math.atan2(X_load, R);
    const theta_deg = (theta_rad * 180) / Math.PI;

    // Current: I = V / Z
    const Irms = Vrms / Z_mag;

    // Uncorrected Powers
    const P = Vrms * Irms * Math.cos(theta_rad); // Watts
    const Q = Vrms * Irms * Math.sin(theta_rad); // VAR
    const S = Vrms * Irms; // VA
    const PF = Math.cos(theta_rad);

    // With parallel correction capacitor C_corr:
    const XC_corr = C_corr > 0 ? 1 / (omega * C_corr) : Infinity;
    const QC_provided = C_corr > 0 ? (Vrms * Vrms) / XC_corr : 0;
    const Q_new = Q - QC_provided;
    const S_new = Math.sqrt(P * P + Q_new * Q_new);
    const PF_new = P / Math.max(1e-6, S_new);
    const theta_new_deg = (Math.atan2(Q_new, P) * 180) / Math.PI;

    return {
      Vrms, f, R, L, C, C_corr,
      omega, XL, XC, X_load,
      Z_mag, theta_deg, Irms,
      P, Q, S, PF,
      QC_provided, Q_new, S_new, PF_new, theta_new_deg
    };
  }

  function renderPhasorPower(canvas, params) {
    if (!canvas) return;
    const res = computePhasorPower(params);
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    // Split view: Left = Phasor Polar Diagram (50%), Right = Power Triangle (50%)
    const midX = width / 2;

    // --- LEFT: Phasor Diagram ---
    const centerX = midX / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    // Draw Polar concentric rings & axes
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let r = 0.25; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * r, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Voltage Phasor V (Reference along horizontal axis at 0 deg)
    core.drawVectorArrow(ctx, centerX, centerY, centerX + radius * 0.9, centerY, '#2563eb', `V (${res.Vrms}V)`);

    // Current Phasor I (at angle -theta_deg because I lags V when inductive)
    const angleRad = -res.theta_deg * (Math.PI / 180);
    const iLen = radius * 0.7;
    const iX = centerX + iLen * Math.cos(angleRad);
    const iY = centerY + iLen * Math.sin(angleRad);
    core.drawVectorArrow(ctx, centerX, centerY, iX, iY, '#f97316', `I (${res.Irms.toFixed(1)}A)`);

    // Arc for phase angle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.25, 0, angleRad, angleRad < 0);
    ctx.strokeStyle = '#64748b';
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`θ = ${res.theta_deg.toFixed(1)}°`, centerX + 30, centerY + (angleRad < 0 ? 15 : -15));

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('1. 복소평면 페이저 (Phasor)', 15, 20);
    ctx.restore();

    // Divider line
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(midX, 10);
    ctx.lineTo(midX, height - 10);
    ctx.stroke();
    ctx.restore();

    // --- RIGHT: Power Triangle ---
    const ptLeft = midX + 40;
    const ptBottom = height * 0.75;
    const maxP = Math.max(res.P, res.S, 500);
    const scale = (midX - 80) / maxP;

    const baseLen = res.P * scale;
    const qHeight = res.Q * scale;

    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('2. 복소 전력 삼각형 (Power Triangle)', midX + 15, 20);

    // Active power P (Horizontal green arrow)
    core.drawVectorArrow(ctx, ptLeft, ptBottom, ptLeft + baseLen, ptBottom, '#16a34a', `P=${res.P.toFixed(0)}W`);

    // Reactive power Q (Vertical red arrow)
    core.drawVectorArrow(ctx, ptLeft + baseLen, ptBottom, ptLeft + baseLen, ptBottom - qHeight, '#dc2626', `Q=${res.Q.toFixed(0)}VAR`);

    // Apparent power S (Hypotenuse purple arrow)
    core.drawVectorArrow(ctx, ptLeft, ptBottom, ptLeft + baseLen, ptBottom - qHeight, '#9333ea', `S=${res.S.toFixed(0)}VA`);

    // Corrected Q and S if C_corr applied
    if (res.C_corr > 0) {
      const qNewHeight = res.Q_new * scale;
      core.drawVectorArrow(ctx, ptLeft + baseLen, ptBottom, ptLeft + baseLen, ptBottom - qNewHeight, '#0284c7', `Q_new=${res.Q_new.toFixed(0)}`);
      core.drawVectorArrow(ctx, ptLeft, ptBottom, ptLeft + baseLen, ptBottom - qNewHeight, '#0284c7', `S_new`);
    }

    // Power factor badges
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`역률(PF): ${(res.PF * 100).toFixed(1)}% (${res.theta_deg > 0 ? '지상 Lagging' : '진상 Leading'})`, ptLeft, height - 35);
    if (res.C_corr > 0) {
      ctx.fillStyle = '#0284c7';
      ctx.fillText(`개선 역률(PF_new): ${(res.PF_new * 100).toFixed(1)}% (콘덴서 ${ (res.C_corr * 1e6).toFixed(1) }µF)`, ptLeft, height - 15);
    }
    ctx.restore();

    return res;
  }

  return {
    computePhasorPower,
    renderPhasorPower
  };
}));
