/**
 * transistor-curves.js — BJT and MOSFET IV Characteristics & DC Load Line Simulator
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./electronics-sim-core.js');
    module.exports = factory(core);
  } else {
    root.TransistorCurvesSim = factory(root.ElectronicsSimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function computeBJTIVCurves(params) {
    const p = params || {};
    const Vcc = Math.max(1, Number(p.Vcc) || 12);
    const Rc = Math.max(10, Number(p.Rc) || 1000); // 1k
    const beta = Math.max(10, Number(p.beta) || 150);
    const Va = Number(p.Va) || 100; // Early voltage (V)
    const activeIb_uA = Number(p.activeIb_uA) || 30; // selected Ib in uA

    // 5 Curves for Ib = [10, 20, 30, 40, 50] uA
    const ibList = [10, 20, 30, 40, 50];
    const curves = [];
    const vceSteps = 100;
    const vceMax = Vcc * 1.2;

    for (const ib_uA of ibList) {
      const ib = ib_uA * 1e-6; // Amperes
      const points = [];
      for (let i = 0; i <= vceSteps; i++) {
        const vce = (i / vceSteps) * vceMax;
        let ic = 0;
        if (vce < 0.2) {
          // Saturation region: linear rise from 0 to active value
          const ic_act = beta * ib * (1 + 0.2 / Va);
          ic = ic_act * (vce / 0.2);
        } else {
          // Active region with Early effect
          ic = beta * ib * (1 + vce / Va);
        }
        points.push({ vce, ic: ic * 1000 }); // mA
      }
      curves.push({ ib_uA, points });
    }

    // DC Load Line: Ic = (Vcc - Vce) / Rc
    // Vce = 0 => Ic_sat = Vcc / Rc
    // Ic = 0 => Vce_cutoff = Vcc
    const icSat_mA = (Vcc / Rc) * 1000;
    const vceCutoff = Vcc;

    // Operating point (Q-point) for activeIb_uA
    const activeIb = activeIb_uA * 1e-6;
    // Solve: Ic = beta * activeIb = (Vcc - Vce) / Rc => Vce = Vcc - beta * activeIb * Rc
    let qIc_mA = beta * activeIb * 1000;
    let qVce = Vcc - (qIc_mA / 1000) * Rc;
    let qRegion = 'ACTIVE';

    if (qVce <= 0.2) {
      qVce = 0.2;
      qIc_mA = (Vcc - 0.2) / Rc * 1000;
      qRegion = 'SATURATION (포화)';
    } else if (qIc_mA <= 0) {
      qVce = Vcc;
      qIc_mA = 0;
      qRegion = 'CUTOFF (차단)';
    }

    return {
      type: 'BJT',
      Vcc, Rc, beta, Va, activeIb_uA,
      ibList, curves, vceMax,
      icSat_mA, vceCutoff,
      qPoint: { vce: qVce, ic_mA: qIc_mA, region: qRegion }
    };
  }

  function renderTransistorCurves(canvas, params) {
    if (!canvas) return;
    const res = computeBJTIVCurves(params);
    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padL = 55;
    const padR = 25;
    const padT = 35;
    const padB = 40;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const maxIc = res.icSat_mA * 1.2;
    const maxVce = res.vceMax;

    // Draw Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let v = 0; v <= maxVce; v += 2) {
      const x = padL + (v / maxVce) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${v}V`, x - 8, padT + plotH + 15);
    }

    for (let c = 0; c <= maxIc; c += 2) {
      const y = (padT + plotH) - (c / maxIc) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${c}mA`, padL - 38, y + 4);
    }

    // Border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padL, padT, plotW, plotH);

    // Draw Family of IV Curves
    for (const c of res.curves) {
      const isSelected = c.ib_uA === res.activeIb_uA;
      ctx.strokeStyle = isSelected ? '#2563eb' : '#94a3b8';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.beginPath();
      for (let i = 0; i < c.points.length; i++) {
        const pt = c.points[i];
        const px = padL + (pt.vce / maxVce) * plotW;
        const py = (padT + plotH) - (pt.ic / maxIc) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Label at end of curve
      const last = c.points[c.points.length - 1];
      ctx.fillStyle = isSelected ? '#1d4ed8' : '#64748b';
      ctx.font = isSelected ? 'bold 10px sans-serif' : '10px sans-serif';
      const labelY = (padT + plotH) - (last.ic / maxIc) * plotH;
      ctx.fillText(`Ib=${c.ib_uA}µA`, padL + plotW - 48, labelY - 4);
    }

    // Draw DC Load Line (Red)
    const loadX1 = padL; // Vce = 0
    const loadY1 = (padT + plotH) - (res.icSat_mA / maxIc) * plotH; // Ic = IcSat
    const loadX2 = padL + (res.vceCutoff / maxVce) * plotW; // Vce = Vcc
    const loadY2 = padT + plotH; // Ic = 0

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(loadX1, loadY1);
    ctx.lineTo(loadX2, loadY2);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DC 부하선 (Load Line)', loadX1 + 10, loadY1 - 8);

    // Draw Operating Point (Q-Point)
    const qX = padL + (res.qPoint.vce / maxVce) * plotW;
    const qY = (padT + plotH) - (res.qPoint.ic_mA / maxIc) * plotH;

    ctx.beginPath();
    ctx.arc(qX, qY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Q-point (${res.qPoint.vce.toFixed(1)}V, ${res.qPoint.ic_mA.toFixed(1)}mA)`, qX + 10, qY - 5);

    // Header info
    ctx.fillText(`📊 BJT 특성 곡선 & 직류 부하선 | Vcc=${res.Vcc}V, Rc=${res.Rc}Ω, β=${res.beta} | 상태: ${res.qPoint.region}`, padL, 20);

    ctx.restore();
    return res;
  }

  return {
    computeBJTIVCurves,
    renderTransistorCurves
  };
}));
