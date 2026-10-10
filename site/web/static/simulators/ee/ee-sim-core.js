/**
 * ee-sim-core.js — Electrical Engineering Simulation Core Canvas & Math Engine
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EESimCore = factory();
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

  function drawGrid(ctx, width, height, options) {
    const opts = options || {};
    const stepX = opts.stepX || 40;
    const stepY = opts.stepY || 30;
    const gridColor = opts.gridColor || '#e2e8f0';
    const axisColor = opts.axisColor || '#94a3b8';

    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 0; x <= width; x += stepX) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= height; y += stepY) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    // Center axes
    const midY = opts.midY !== undefined ? opts.midY : height / 2;
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, midY + 0.5);
    ctx.lineTo(width, midY + 0.5);
    ctx.stroke();

    ctx.restore();
  }

  function drawWaveform(ctx, points, color, lineWidth) {
    if (!points || points.length === 0) return;
    ctx.save();
    ctx.strokeStyle = color || '#2563eb';
    ctx.lineWidth = lineWidth || 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawVectorArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color || '#ef4444';
    ctx.fillStyle = color || '#ef4444';
    ctx.lineWidth = 2.5;

    // Line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    if (label) {
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(label, toX + 8 * Math.cos(angle), toY + 8 * Math.sin(angle));
    }

    ctx.restore();
  }

  return {
    setupCanvasDPI,
    drawGrid,
    drawWaveform,
    drawVectorArrow
  };
}));
