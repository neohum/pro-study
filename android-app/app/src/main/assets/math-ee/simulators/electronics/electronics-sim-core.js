/**
 * electronics-sim-core.js — Core Canvas and Graphics Engine for Electronics Simulators
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ElectronicsSimCore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function setupCanvasDPI(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 600;
    const height = rect.height || canvas.height || 300;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  function drawBodeAxes(ctx, width, height, options) {
    const opts = options || {};
    const padL = opts.padL || 55;
    const padR = opts.padR || 20;
    const padT = opts.padT || 30;
    const padB = opts.padB || 40;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Decades grid (10 Hz, 100 Hz, 1 kHz, 10 kHz, 100 kHz, 1 MHz => 5 decades)
    const decades = opts.decades || 5;
    for (let i = 0; i <= decades; i++) {
      const x = padL + (i / decades) * plotW;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, padT);
      ctx.lineTo(x + 0.5, padT + plotH);
      ctx.stroke();

      // Sub-decade lines (2, 3, ..., 9)
      if (i < decades) {
        ctx.strokeStyle = '#f1f5f9';
        for (let sub = 2; sub <= 9; sub++) {
          const subX = padL + ((i + Math.log10(sub)) / decades) * plotW;
          ctx.beginPath();
          ctx.moveTo(subX + 0.5, padT);
          ctx.lineTo(subX + 0.5, padT + plotH);
          ctx.stroke();
        }
        ctx.strokeStyle = '#e2e8f0';
      }

      // Decade labels
      const fLabel = Math.pow(10, (opts.minExp || 1) + i);
      const str = fLabel >= 1e6 ? `${fLabel / 1e6}M` : (fLabel >= 1e3 ? `${fLabel / 1e3}k` : `${fLabel}`);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${str}Hz`, x - 12, padT + plotH + 15);
    }

    // Horizontal dB grid
    const dbSteps = opts.dbSteps || [-40, -20, 0, 20, 40];
    const minDb = dbSteps[0];
    const maxDb = dbSteps[dbSteps.length - 1];
    for (const db of dbSteps) {
      const y = padT + (1 - (db - minDb) / (maxDb - minDb)) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y + 0.5);
      ctx.lineTo(padL + plotW, y + 0.5);
      ctx.stroke();

      ctx.fillStyle = db === 0 ? '#0f172a' : '#64748b';
      ctx.font = db === 0 ? 'bold 10px sans-serif' : '10px sans-serif';
      ctx.fillText(`${db}dB`, padL - 40, y + 4);
    }

    // Border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padL, padT, plotW, plotH);

    ctx.restore();
    return { padL, padR, padT, padB, plotW, plotH, minDb, maxDb };
  }

  function drawLogicGate(ctx, x, y, type, inputs, output) {
    ctx.save();
    ctx.translate(x, y);

    const w = 44;
    const h = 32;

    // Body
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = '#f8fafc';

    if (type === 'AND' || type === 'NAND') {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.5, 0);
      ctx.arc(w * 0.5, h * 0.5, h * 0.5, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (type === 'NAND') {
        ctx.beginPath();
        ctx.arc(w + 4, h * 0.5, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    } else if (type === 'OR' || type === 'NOR' || type === 'XOR') {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(w * 0.5, 0, w, h * 0.5);
      ctx.quadraticCurveTo(w * 0.5, h, 0, h);
      ctx.quadraticCurveTo(w * 0.25, h * 0.5, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (type === 'XOR') {
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(w * 0.25 - 6, h * 0.5, -6, h);
        ctx.stroke();
      }
      if (type === 'NOR') {
        ctx.beginPath();
        ctx.arc(w + 4, h * 0.5, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    } else if (type === 'NOT') {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w + 4, h * 0.5, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(type, w * 0.15, h * 0.6);

    ctx.restore();
  }

  return {
    setupCanvasDPI,
    drawBodeAxes,
    drawLogicGate
  };
}));
