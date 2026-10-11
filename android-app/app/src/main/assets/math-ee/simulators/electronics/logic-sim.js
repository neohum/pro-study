/**
 * logic-sim.js — Digital Logic Gates and Circuits Simulator
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const core = require('./electronics-sim-core.js');
    module.exports = factory(core);
  } else {
    root.LogicSim = factory(root.ElectronicsSimCore);
  }
}(typeof self !== 'undefined' ? self : this, function (core) {
  'use strict';

  function evaluateGate(type, inA, inB) {
    const a = inA ? 1 : 0;
    const b = inB ? 1 : 0;

    switch (type.toUpperCase()) {
      case 'AND': return a & b;
      case 'OR': return a | b;
      case 'NOT': return a ? 0 : 1;
      case 'NAND': return (a & b) ? 0 : 1;
      case 'NOR': return (a | b) ? 0 : 1;
      case 'XOR': return a ^ b;
      case 'XNOR': return (a ^ b) ? 0 : 1;
      default: return 0;
    }
  }

  function evaluateHalfAdder(inA, inB) {
    const a = inA ? 1 : 0;
    const b = inB ? 1 : 0;
    return {
      sum: a ^ b,
      carry: a & b
    };
  }

  function evaluateFullAdder(inA, inB, cin) {
    const a = inA ? 1 : 0;
    const b = inB ? 1 : 0;
    const c = cin ? 1 : 0;
    const sum = a ^ b ^ c;
    const cout = (a & b) | (c & (a ^ b));
    return { sum, cout };
  }

  function evaluateDFlipFlop(currentQ, dInput, clockRising) {
    const q = currentQ ? 1 : 0;
    const d = dInput ? 1 : 0;
    if (clockRising) {
      return { q: d, qBar: d ? 0 : 1 };
    }
    return { q: q, qBar: q ? 0 : 1 };
  }

  function renderLogicSim(canvas, params) {
    if (!canvas) return;
    const p = params || {};
    const mode = p.mode || 'half_adder'; // 'gate', 'half_adder', 'full_adder'
    const inA = Boolean(p.inA);
    const inB = Boolean(p.inB);
    const cin = Boolean(p.cin);

    const d = core.setupCanvasDPI(canvas);
    if (!d) return;
    const { ctx, width, height } = d;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Pure crisp white canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('💡 LogicSim: 디지털 조합 논리 회로 시뮬레이터', 20, 25);

    if (mode === 'half_adder') {
      const res = evaluateHalfAdder(inA, inB);

      // Draw Input Switches (A, B) — State boxes: white backgrounds, 2px solid #0f172a, #0f172a text
      const swAX = 45, swAY = 80;
      const swBX = 45, swBY = 180;

      function drawSwitch(x, y, label, val) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 48, 24);
        ctx.strokeStyle = val ? '#16a34a' : '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 48, 24);

        // State indicator dot
        ctx.beginPath();
        ctx.arc(x + 10, y + 12, 4, 0, 2 * Math.PI);
        ctx.fillStyle = val ? '#16a34a' : '#cbd5e1';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${label}: ${val ? '1' : '0'}`, x + 18, y + 16);
      }

      drawSwitch(swAX, swAY, 'A', inA);
      drawSwitch(swBX, swBY, 'B', inB);

      // Gate positions
      const xorX = 180, xorY = 70;
      const andX = 180, andY = 170;

      // Draw Gates
      core.drawLogicGate(ctx, xorX, xorY, 'XOR');
      core.drawLogicGate(ctx, andX, andY, 'AND');

      // Wires from switches to gates
      ctx.lineWidth = 2;

      // Wire A to XOR top input and AND top input
      ctx.strokeStyle = inA ? '#16a34a' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(swAX + 48, swAY + 12);
      ctx.lineTo(xorX, swAY + 12);
      ctx.moveTo(swAX + 70, swAY + 12);
      ctx.lineTo(swAX + 70, andY + 8);
      ctx.lineTo(andX, andY + 8);
      ctx.stroke();

      // Wire B to XOR bottom input and AND bottom input
      ctx.strokeStyle = inB ? '#16a34a' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(swBX + 48, swBY + 12);
      ctx.lineTo(xorX, swBY + 12 - 76);
      ctx.moveTo(swBX + 90, swBY + 12);
      ctx.lineTo(swBX + 90, andY + 24);
      ctx.lineTo(andX, andY + 24);
      ctx.stroke();

      // Outputs from gates
      const outSumX = 320, outSumY = xorY + 16;
      const outCarryX = 320, outCarryY = andY + 16;

      ctx.strokeStyle = res.sum ? '#2563eb' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(xorX + 44, outSumY);
      ctx.lineTo(outSumX, outSumY);
      ctx.stroke();

      ctx.strokeStyle = res.carry ? '#dc2626' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(andX + 44, outCarryY);
      ctx.lineTo(outCarryX, outCarryY);
      ctx.stroke();

      // Output Indicators (LEDs)
      function drawLED(x, y, label, val, color) {
        ctx.beginPath();
        ctx.arc(x + 20, y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = val ? color : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`${label} = ${val}`, x + 45, y + 5);
      }

      drawLED(outSumX, outSumY, '합(Sum S = A ⊕ B)', res.sum, '#2563eb');
      drawLED(outCarryX, outCarryY, '올림수(Carry C = A · B)', res.carry, '#dc2626');

      // Truth table on right side: Pure white background, 2px solid #0f172a
      const ttX = width - 180;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ttX, 50, 160, 160);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(ttX, 50, 160, 160);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('반가산기 진리표 (Truth Table)', ttX + 8, 70);

      const tableData = [
        ['A', 'B', 'S', 'C'],
        ['0', '0', '0', '0'],
        ['0', '1', '1', '0'],
        ['1', '0', '1', '0'],
        ['1', '1', '0', '1']
      ];
      for (let r = 0; r < tableData.length; r++) {
        const row = tableData[r];
        const isCurrent = (r > 0 && Number(row[0]) === (inA ? 1 : 0) && Number(row[1]) === (inB ? 1 : 0));
        if (isCurrent) {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(ttX + 5, 80 + r * 18, 150, 16);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(ttX + 5, 80 + r * 18, 150, 16);
        }
        ctx.fillStyle = '#0f172a';
        ctx.font = isCurrent ? 'bold 11px monospace' : '11px monospace';
        ctx.fillText(row.join('    '), ttX + 25, 92 + r * 18);
      }
    }
    ctx.restore();
  }

  return {
    evaluateGate,
    evaluateHalfAdder,
    evaluateFullAdder,
    evaluateDFlipFlop,
    renderLogicSim
  };
}));
