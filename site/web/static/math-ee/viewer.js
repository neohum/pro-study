/**
 * viewer.js — Controller and UI Renderer for Math & EE Master Suite
 */

(function () {
  'use strict';

  let manifestData = null;
  let currentTab = 'math-symbols';
  let activeEEModuleId = 'ee-01';
  let activeELModuleId = 'el-01';

  // Simulators state and instances
  let rlcParams = { R: 20, L: 0.1, C: 0.0001, Vin: 10, tMax: 0.05 };
  let phasorParams = { Vrms: 220, frequency: 60, R: 10, L: 0.05, C: 0, C_corr: 0 };
  let threePhaseParams = { Vphase: 220, frequency: 60, connection: 'Y', loadZ: 10, powerFactor: 0.85 };
  let relayState = null;

  let logicSimParams = { mode: 'half_adder', inA: 1, inB: 0, cin: 0 };
  let opampBodeParams = { filterType: 'lpf_1st', R1: 10000, Rf: 100000, C: 1e-8 };
  let transistorParams = { Vcc: 12, Rc: 1000, beta: 150, activeIb_uA: 30 };
  let timer555Params = { Vcc: 9, Ra: 10000, Rb: 10000, C: 1e-6 };

  document.addEventListener('DOMContentLoaded', initApp);

  async function initApp() {
    setupTabNavigation();
    await loadData();
    renderCurrentTab();
  }

  function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');

        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.getElementById(`tab-${currentTab}`);
        if (activePane) activePane.classList.add('active');

        renderCurrentTab();
      });
    });
  }

  async function loadData() {
    if (window.__MATH_EE_MANIFEST__) {
      manifestData = window.__MATH_EE_MANIFEST__;
      return;
    }
    try {
      const resp = await fetch('manifest.json');
      manifestData = await resp.json();
    } catch (e) {
      console.error('Failed to fetch manifest.json', e);
    }
  }

  function renderCurrentTab() {
    if (!manifestData) return;

    if (currentTab === 'math-symbols') {
      renderMathSymbols();
    } else if (currentTab === 'math-theorems') {
      renderMathTheorems();
    } else if (currentTab === 'electrical') {
      renderElectricalModules();
    } else if (currentTab === 'electronics') {
      renderElectronicsModules();
    }

    triggerKaTeX();
  }

  function triggerKaTeX(container) {
    if (window.renderMathInElement) {
      window.renderMathInElement(container || document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function speakText(text) {
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(text);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  // ==========================================
  // TAB 1: Math Symbols
  // ==========================================
  function renderMathSymbols() {
    const pane = document.getElementById('tab-math-symbols');
    if (!pane) return;

    const categories = manifestData.mathSymbols.categories;

    // Filter controls
    let html = `
      <div class="filter-bar">
        <input type="text" id="sym-search-input" class="search-input" placeholder="기호명, 한글/영문 또는 수식 검색 (예: integral, 합집합, 미분)...">
        <select id="sym-cat-select" class="category-select">
          <option value="all">전체 카테고리 (${categories.length}개)</option>
          ${categories.map(c => `<option value="${c.categoryId}">${c.categoryNameKo}</option>`).join('')}
        </select>
      </div>
      <div id="symbols-grid-container" class="symbols-grid"></div>
    `;
    pane.innerHTML = html;

    const searchInput = document.getElementById('sym-search-input');
    const catSelect = document.getElementById('sym-cat-select');

    function updateGrid() {
      const q = (searchInput.value || '').trim().toLowerCase();
      const selCat = catSelect.value;
      const grid = document.getElementById('symbols-grid-container');

      let allSymbols = [];
      for (const cat of categories) {
        if (selCat === 'all' || selCat === cat.categoryId) {
          allSymbols.push(...cat.symbols);
        }
      }

      if (q) {
        allSymbols = allSymbols.filter(s =>
          s.nameKo.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.symbol.toLowerCase().includes(q) ||
          s.typesetMath.toLowerCase().includes(q) ||
          s.howToReadEn.toLowerCase().includes(q)
        );
      }

      grid.innerHTML = allSymbols.map(s => `
        <div class="symbol-card">
          <div class="symbol-card-header">
            <div class="symbol-display">$${s.typesetMath}$</div>
            <div class="symbol-name-group">
              <div class="symbol-name-ko">${s.nameKo}</div>
              <div class="symbol-name-en">${s.nameEn}</div>
            </div>
          </div>
          <div class="symbol-read-en">
            <span>🗣️ <strong>How to read:</strong> "${s.howToReadEn}"</span>
            <button class="btn-action" style="padding:2px 8px;font-size:0.75rem;margin-left:auto;" onclick="window.__speakMath('${s.howToReadEn.replace(/'/g, "\\'")}')">🔊 듣기</button>
          </div>
          <div class="symbol-definition">
            <strong>엄밀한 정의:</strong> $${s.rigorousDefinition}$
          </div>
          <div class="symbol-origin">
            <strong>어원 및 역사:</strong> ${s.historyAndOrigin}
          </div>
        </div>
      `).join('');

      triggerKaTeX(grid);
    }

    searchInput.addEventListener('input', updateGrid);
    catSelect.addEventListener('change', updateGrid);
    window.__speakMath = speakText;

    updateGrid();
  }

  // ==========================================
  // TAB 2: Math Theorems & Proofs
  // ==========================================
  function renderMathTheorems() {
    const pane = document.getElementById('tab-math-theorems');
    if (!pane) return;

    const list = manifestData.mathTheorems.theorems;

    let html = `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size:1.3rem;margin-bottom:6px;">${manifestData.mathTheorems.title}</h2>
        <p style="color:var(--text-muted);font-size:0.95rem;">수학사상 가장 중요하고 아름다운 12대 핵심 정리의 직관적 원리와 비약 없는 단계별 엄밀 증명(Rigorous Proof)을 탐구합니다.</p>
      </div>
      <div class="theorems-container">
        ${list.map(th => `
          <div class="theorem-item" id="th-item-${th.id}">
            <div class="theorem-header" onclick="window.__toggleTheorem('${th.id}')">
              <div class="theorem-title">
                <span style="color:var(--accent-math);margin-right:8px;">#${th.order}</span>
                ${th.titleKo}
              </div>
              <div style="font-size:0.85rem;color:var(--text-muted);">${th.domain} ▼</div>
            </div>
            <div class="theorem-body" id="th-body-${th.id}">
              <div class="theorem-statement-box">
                <div style="font-weight:700;margin-bottom:6px;">정리 명제 (Statement):</div>
                <div style="font-size:1.3rem;margin-bottom:8px;">$$${th.statement.typesetMath}$$</div>
                <div style="font-size:0.95rem;color:#334155;">${th.statement.explanationKo}</div>
              </div>
              <div style="margin-bottom:14px;font-size:0.9rem;background:#f1f5f9;padding:10px 14px;border-radius:6px;">
                💡 <strong>직관적 핵심 아이디어:</strong> ${th.intuitiveIdea}
              </div>
              <div style="margin-bottom:16px;">
                <h4 style="font-size:1rem;margin-bottom:10px;color:var(--text-main);">단계별 엄밀 증명 (${th.rigorousProof.proofType})</h4>
                ${th.rigorousProof.steps.map(step => `
                  <div class="proof-step-card">
                    <span class="step-badge">단계 ${step.stepNumber}: ${step.title}</span>
                    <div style="font-size:0.95rem;margin-bottom:6px;">${step.explanation}</div>
                    <div style="margin:8px 0;font-size:1.15rem;text-align:center;">$$${step.typesetMath}$$</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">근거: ${step.justification}</div>
                  </div>
                `).join('')}
                <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:12px 16px;border-radius:6px;font-weight:700;color:#065f46;margin-top:12px;">
                  결론: ${th.rigorousProof.conclusion}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    pane.innerHTML = html;

    window.__toggleTheorem = function (id) {
      const header = document.querySelector(`#th-item-${id} .theorem-header`);
      const body = document.getElementById(`th-body-${id}`);
      if (header && body) {
        header.classList.toggle('open');
        body.classList.toggle('open');
        triggerKaTeX(body);
      }
    };

    triggerKaTeX(pane);
  }

  // ==========================================
  // TAB 3: Electrical Engineering
  // ==========================================
  function renderElectricalModules() {
    const pane = document.getElementById('tab-electrical');
    if (!pane) return;

    const modules = manifestData.electrical.modules;
    const activeMod = modules.find(m => m.id === activeEEModuleId) || modules[0];

    let html = `
      <div class="module-layout">
        <aside class="module-sidebar">
          <div style="font-weight:700;margin-bottom:12px;font-size:0.95rem;color:var(--accent-ee);">⚡ 전기공학 커리큘럼</div>
          ${modules.map(m => `
            <div class="module-nav-item ${m.id === activeMod.id ? 'active' : ''}" onclick="window.__selectEEModule('${m.id}')">
              ${m.order}. ${m.titleKo}
            </div>
          `).join('')}
        </aside>
        <section class="module-content-pane">
          <h2 style="font-size:1.3rem;margin-bottom:8px;">${activeMod.titleKo}</h2>
          <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">${activeMod.titleEn} (${activeMod.domain})</div>
          <p style="font-size:0.95rem;margin-bottom:20px;line-height:1.7;">${activeMod.overview}</p>

          <!-- Embedded Simulator Component -->
          ${renderEESimulatorCard(activeMod.simulationRef)}

          <div style="margin-top:24px;">
            <h3 style="font-size:1.1rem;margin-bottom:12px;">핵심 원리 및 수식 지배 방정식</h3>
            ${activeMod.coreConcepts.map(c => `
              <div style="background:#f8fafc;border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:14px;">
                <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:6px;">${c.titleKo}</div>
                <div style="font-size:0.9rem;color:#334155;margin-bottom:8px;">${c.principle}</div>
                ${c.equations.map(eq => `
                  <div style="background:#ffffff;padding:8px 12px;border-radius:4px;margin-top:6px;border:1px solid #e2e8f0;">
                    <div style="font-size:0.85rem;font-weight:600;color:var(--accent-ee);">${eq.name}</div>
                    <div style="font-size:1.15rem;margin:6px 0;">$$${eq.typesetMath}$$</div>
                    <div style="font-size:0.8rem;color:#64748b;">${eq.explanation}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    pane.innerHTML = html;

    window.__selectEEModule = function (id) {
      activeEEModuleId = id;
      renderElectricalModules();
    };

    attachEESimulatorHandlers(activeMod.simulationRef);
    triggerKaTeX(pane);
  }

  function renderEESimulatorCard(simRef) {
    if (!simRef) return '';

    if (simRef.id === 'sim-rlc-transient') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">실시간 RK4 / 2계 미분방정식 수치해석</span>
          </div>
          <canvas id="ee-canvas-rlc" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>저항 R: <span id="val-rlc-r">${rlcParams.R}</span>Ω</label>
              <input type="range" id="slider-rlc-r" min="1" max="100" step="1" value="${rlcParams.R}">
            </div>
            <div class="control-group">
              <label>인덕턴스 L: <span id="val-rlc-l">${rlcParams.L}</span>H</label>
              <input type="range" id="slider-rlc-l" min="0.01" max="0.5" step="0.01" value="${rlcParams.L}">
            </div>
            <div class="control-group">
              <label>커패시턴스 C: <span id="val-rlc-c">${(rlcParams.C * 1e6).toFixed(0)}</span>µF</label>
              <input type="range" id="slider-rlc-c" min="10" max="500" step="10" value="${rlcParams.C * 1e6}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-phasor-power') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">복소평면 페이저 & 전력 삼각형 역률 개선</span>
          </div>
          <canvas id="ee-canvas-phasor" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>저항 R: <span id="val-ph-r">${phasorParams.R}</span>Ω</label>
              <input type="range" id="slider-ph-r" min="1" max="50" step="1" value="${phasorParams.R}">
            </div>
            <div class="control-group">
              <label>인덕턴스 L: <span id="val-ph-l">${phasorParams.L}</span>H</label>
              <input type="range" id="slider-ph-l" min="0.01" max="0.3" step="0.01" value="${phasorParams.L}">
            </div>
            <div class="control-group">
              <label>진상 콘덴서 C: <span id="val-ph-c">${(phasorParams.C_corr * 1e6).toFixed(0)}</span>µF</label>
              <input type="range" id="slider-ph-c" min="0" max="150" step="5" value="${phasorParams.C_corr * 1e6}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-three-phase') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">120° 3상 정현파 & Y/Δ 결선</span>
          </div>
          <canvas id="ee-canvas-threephase" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>결선 방식:</label>
              <button id="btn-tp-y" class="btn-action ${threePhaseParams.connection === 'Y' ? 'btn-success' : ''}">Y (와이)</button>
              <button id="btn-tp-delta" class="btn-action ${threePhaseParams.connection === 'Delta' ? 'btn-success' : ''}">Δ (델타)</button>
            </div>
            <div class="control-group">
              <label>상전압: <span id="val-tp-v">${threePhaseParams.Vphase}</span>V</label>
              <input type="range" id="slider-tp-v" min="100" max="380" step="10" value="${threePhaseParams.Vphase}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-relay-sequence') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">산업용 모터 정역회전 자기유지 & 인터록</span>
          </div>
          <canvas id="ee-canvas-relay" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <button id="btn-relay-fwd" class="btn-action btn-success">▶ 정회전 기동 (PB-FWD)</button>
            <button id="btn-relay-rev" class="btn-action btn-success">◀ 역회전 기동 (PB-REV)</button>
            <button id="btn-relay-stop" class="btn-action btn-danger">⏹ 정지 (PB-STOP)</button>
            <button id="btn-relay-estop" class="btn-action btn-danger" style="background:#7f1d1d;">🚨 비상정지 (E-STOP)</button>
          </div>
        </div>
      `;
    }
    return '';
  }

  function attachEESimulatorHandlers(simRef) {
    if (!simRef) return;

    if (simRef.id === 'sim-rlc-transient') {
      const canvas = document.getElementById('ee-canvas-rlc');
      if (!canvas || !window.RLCTransientSim) return;

      const rSlider = document.getElementById('slider-rlc-r');
      const lSlider = document.getElementById('slider-rlc-l');
      const cSlider = document.getElementById('slider-rlc-c');

      function update() {
        rlcParams.R = Number(rSlider.value);
        rlcParams.L = Number(lSlider.value);
        rlcParams.C = Number(cSlider.value) * 1e-6;

        document.getElementById('val-rlc-r').innerText = rlcParams.R;
        document.getElementById('val-rlc-l').innerText = rlcParams.L;
        document.getElementById('val-rlc-c').innerText = (rlcParams.C * 1e6).toFixed(0);

        window.RLCTransientSim.renderRLCTransient(canvas, rlcParams);
      }

      rSlider.addEventListener('input', update);
      lSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-phasor-power') {
      const canvas = document.getElementById('ee-canvas-phasor');
      if (!canvas || !window.PhasorPowerSim) return;

      const rSlider = document.getElementById('slider-ph-r');
      const lSlider = document.getElementById('slider-ph-l');
      const cSlider = document.getElementById('slider-ph-c');

      function update() {
        phasorParams.R = Number(rSlider.value);
        phasorParams.L = Number(lSlider.value);
        phasorParams.C_corr = Number(cSlider.value) * 1e-6;

        document.getElementById('val-ph-r').innerText = phasorParams.R;
        document.getElementById('val-ph-l').innerText = phasorParams.L;
        document.getElementById('val-ph-c').innerText = (phasorParams.C_corr * 1e6).toFixed(0);

        window.PhasorPowerSim.renderPhasorPower(canvas, phasorParams);
      }

      rSlider.addEventListener('input', update);
      lSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-three-phase') {
      const canvas = document.getElementById('ee-canvas-threephase');
      if (!canvas || !window.ThreePhaseSim) return;

      const btnY = document.getElementById('btn-tp-y');
      const btnDelta = document.getElementById('btn-tp-delta');
      const vSlider = document.getElementById('slider-tp-v');

      function update() {
        threePhaseParams.Vphase = Number(vSlider.value);
        document.getElementById('val-tp-v').innerText = threePhaseParams.Vphase;
        window.ThreePhaseSim.renderThreePhase(canvas, threePhaseParams);
      }

      btnY.addEventListener('click', () => {
        threePhaseParams.connection = 'Y';
        btnY.classList.add('btn-success');
        btnDelta.classList.remove('btn-success');
        update();
      });

      btnDelta.addEventListener('click', () => {
        threePhaseParams.connection = 'Delta';
        btnDelta.classList.add('btn-success');
        btnY.classList.remove('btn-success');
        update();
      });

      vSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-relay-sequence') {
      const canvas = document.getElementById('ee-canvas-relay');
      if (!canvas || !window.RelaySequenceSim) return;

      if (!relayState) relayState = window.RelaySequenceSim.createInitialState();

      const btnFwd = document.getElementById('btn-relay-fwd');
      const btnRev = document.getElementById('btn-relay-rev');
      const btnStop = document.getElementById('btn-relay-stop');
      const btnEStop = document.getElementById('btn-relay-estop');

      function update() {
        window.RelaySequenceSim.renderRelaySequence(canvas, relayState);
      }

      btnFwd.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbFwdStart: true, pbStop: false, eStop: false });
        update();
        setTimeout(() => {
          relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbFwdStart: false });
          update();
        }, 300);
      });

      btnRev.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbRevStart: true, pbStop: false, eStop: false });
        update();
        setTimeout(() => {
          relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbRevStart: false });
          update();
        }, 300);
      });

      btnStop.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbStop: true });
        update();
        setTimeout(() => {
          relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { pbStop: false });
          update();
        }, 300);
      });

      btnEStop.addEventListener('click', () => {
        relayState = window.RelaySequenceSim.updateRelayLogic(relayState, { eStop: !relayState.eStop });
        btnEStop.innerText = relayState.eStop ? '🚨 비상정지 해제 (E-RESET)' : '🚨 비상정지 (E-STOP)';
        update();
      });

      update();
    }
  }

  // ==========================================
  // TAB 4: Electronic Engineering
  // ==========================================
  function renderElectronicsModules() {
    const pane = document.getElementById('tab-electronics');
    if (!pane) return;

    const modules = manifestData.electronics.modules;
    const activeMod = modules.find(m => m.id === activeELModuleId) || modules[0];

    let html = `
      <div class="module-layout">
        <aside class="module-sidebar">
          <div style="font-weight:700;margin-bottom:12px;font-size:0.95rem;color:var(--accent-el);">💡 전자공학 커리큘럼</div>
          ${modules.map(m => `
            <div class="module-nav-item ${m.id === activeMod.id ? 'active' : ''}" onclick="window.__selectELModule('${m.id}')">
              ${m.order}. ${m.titleKo}
            </div>
          `).join('')}
        </aside>
        <section class="module-content-pane">
          <h2 style="font-size:1.3rem;margin-bottom:8px;">${activeMod.titleKo}</h2>
          <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">${activeMod.titleEn} (${activeMod.domain})</div>
          <p style="font-size:0.95rem;margin-bottom:20px;line-height:1.7;">${activeMod.overview}</p>

          <!-- Embedded Simulator Component -->
          ${renderELSimulatorCard(activeMod.simulationRef)}

          <div style="margin-top:24px;">
            <h3 style="font-size:1.1rem;margin-bottom:12px;">소자 물리 모델 및 핵심 방정식</h3>
            ${activeMod.coreConcepts.map(c => `
              <div style="background:#f8fafc;border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:14px;">
                <div style="font-weight:700;font-size:1rem;color:#0f172a;margin-bottom:6px;">${c.titleKo}</div>
                <div style="font-size:0.9rem;color:#334155;margin-bottom:8px;">${c.principle}</div>
                ${c.equations.map(eq => `
                  <div style="background:#ffffff;padding:8px 12px;border-radius:4px;margin-top:6px;border:1px solid #e2e8f0;">
                    <div style="font-size:0.85rem;font-weight:600;color:var(--accent-el);">${eq.name}</div>
                    <div style="font-size:1.15rem;margin:6px 0;">$$${eq.typesetMath}$$</div>
                    <div style="font-size:0.8rem;color:#64748b;">${eq.explanation}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    pane.innerHTML = html;

    window.__selectELModule = function (id) {
      activeELModuleId = id;
      renderElectronicsModules();
    };

    attachELSimulatorHandlers(activeMod.simulationRef);
    triggerKaTeX(pane);
  }

  function renderELSimulatorCard(simRef) {
    if (!simRef) return '';

    if (simRef.id === 'sim-logic-circuit') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">디지털 게이트 & 가산기 진리표 인터랙션</span>
          </div>
          <canvas id="el-canvas-logic" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <button id="btn-toggle-inA" class="btn-action">입력 A 토글 (현재: 1)</button>
            <button id="btn-toggle-inB" class="btn-action">입력 B 토글 (현재: 0)</button>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-opamp-bode') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">주파수 응답 크기(dB) 및 차단 주파수(-3dB)</span>
          </div>
          <canvas id="el-canvas-opamp" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>입력 저항 R1: <span id="val-bode-r1">${opampBodeParams.R1 / 1000}</span>kΩ</label>
              <input type="range" id="slider-bode-r1" min="1" max="50" step="1" value="${opampBodeParams.R1 / 1000}">
            </div>
            <div class="control-group">
              <label>궤환 저항 Rf: <span id="val-bode-rf">${opampBodeParams.Rf / 1000}</span>kΩ</label>
              <input type="range" id="slider-bode-rf" min="10" max="500" step="10" value="${opampBodeParams.Rf / 1000}">
            </div>
            <div class="control-group">
              <label>필터 C: <span id="val-bode-c">${(opampBodeParams.C * 1e9).toFixed(0)}</span>nF</label>
              <input type="range" id="slider-bode-c" min="1" max="100" step="1" value="${opampBodeParams.C * 1e9}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-transistor-curves') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">BJT 특성 곡선 & 직류 부하선(Q-Point)</span>
          </div>
          <canvas id="el-canvas-transistor" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>베이스 전류 Ib: <span id="val-trans-ib">${transistorParams.activeIb_uA}</span>µA</label>
              <input type="range" id="slider-trans-ib" min="10" max="50" step="10" value="${transistorParams.activeIb_uA}">
            </div>
            <div class="control-group">
              <label>전원 Vcc: <span id="val-trans-vcc">${transistorParams.Vcc}</span>V</label>
              <input type="range" id="slider-trans-vcc" min="6" max="24" step="1" value="${transistorParams.Vcc}">
            </div>
            <div class="control-group">
              <label>부하 저항 Rc: <span id="val-trans-rc">${transistorParams.Rc}</span>Ω</label>
              <input type="range" id="slider-trans-rc" min="500" max="3000" step="100" value="${transistorParams.Rc}">
            </div>
          </div>
        </div>
      `;
    } else if (simRef.id === 'sim-timer555') {
      return `
        <div class="sim-container">
          <div class="sim-header">
            <span>🔬 ${simRef.title}</span>
            <span style="font-size:0.8rem;color:var(--text-muted);">555 발진기 2채널 오실로스코프</span>
          </div>
          <canvas id="el-canvas-555" class="sim-canvas"></canvas>
          <div class="sim-controls">
            <div class="control-group">
              <label>저항 Ra: <span id="val-555-ra">${timer555Params.Ra / 1000}</span>kΩ</label>
              <input type="range" id="slider-555-ra" min="1" max="50" step="1" value="${timer555Params.Ra / 1000}">
            </div>
            <div class="control-group">
              <label>저항 Rb: <span id="val-555-rb">${timer555Params.Rb / 1000}</span>kΩ</label>
              <input type="range" id="slider-555-rb" min="1" max="50" step="1" value="${timer555Params.Rb / 1000}">
            </div>
            <div class="control-group">
              <label>커패시터 C: <span id="val-555-c">${(timer555Params.C * 1e6).toFixed(1)}</span>µF</label>
              <input type="range" id="slider-555-c" min="0.1" max="10" step="0.1" value="${timer555Params.C * 1e6}">
            </div>
          </div>
        </div>
      `;
    }
    return '';
  }

  function attachELSimulatorHandlers(simRef) {
    if (!simRef) return;

    if (simRef.id === 'sim-logic-circuit') {
      const canvas = document.getElementById('el-canvas-logic');
      if (!canvas || !window.LogicSim) return;

      const btnA = document.getElementById('btn-toggle-inA');
      const btnB = document.getElementById('btn-toggle-inB');

      function update() {
        btnA.innerText = `입력 A 토글 (현재: ${logicSimParams.inA ? '1' : '0'})`;
        btnB.innerText = `입력 B 토글 (현재: ${logicSimParams.inB ? '1' : '0'})`;
        window.LogicSim.renderLogicSim(canvas, logicSimParams);
      }

      btnA.addEventListener('click', () => {
        logicSimParams.inA = !logicSimParams.inA;
        update();
      });

      btnB.addEventListener('click', () => {
        logicSimParams.inB = !logicSimParams.inB;
        update();
      });

      update();
    } else if (simRef.id === 'sim-opamp-bode') {
      const canvas = document.getElementById('el-canvas-opamp');
      if (!canvas || !window.OpampBodeSim) return;

      const r1Slider = document.getElementById('slider-bode-r1');
      const rfSlider = document.getElementById('slider-bode-rf');
      const cSlider = document.getElementById('slider-bode-c');

      function update() {
        opampBodeParams.R1 = Number(r1Slider.value) * 1000;
        opampBodeParams.Rf = Number(rfSlider.value) * 1000;
        opampBodeParams.C = Number(cSlider.value) * 1e-9;

        document.getElementById('val-bode-r1').innerText = (opampBodeParams.R1 / 1000).toFixed(0);
        document.getElementById('val-bode-rf').innerText = (opampBodeParams.Rf / 1000).toFixed(0);
        document.getElementById('val-bode-c').innerText = (opampBodeParams.C * 1e9).toFixed(0);

        window.OpampBodeSim.renderOpampBode(canvas, opampBodeParams);
      }

      r1Slider.addEventListener('input', update);
      rfSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-transistor-curves') {
      const canvas = document.getElementById('el-canvas-transistor');
      if (!canvas || !window.TransistorCurvesSim) return;

      const ibSlider = document.getElementById('slider-trans-ib');
      const vccSlider = document.getElementById('slider-trans-vcc');
      const rcSlider = document.getElementById('slider-trans-rc');

      function update() {
        transistorParams.activeIb_uA = Number(ibSlider.value);
        transistorParams.Vcc = Number(vccSlider.value);
        transistorParams.Rc = Number(rcSlider.value);

        document.getElementById('val-trans-ib').innerText = transistorParams.activeIb_uA;
        document.getElementById('val-trans-vcc').innerText = transistorParams.Vcc;
        document.getElementById('val-trans-rc').innerText = transistorParams.Rc;

        window.TransistorCurvesSim.renderTransistorCurves(canvas, transistorParams);
      }

      ibSlider.addEventListener('input', update);
      vccSlider.addEventListener('input', update);
      rcSlider.addEventListener('input', update);
      update();
    } else if (simRef.id === 'sim-timer555') {
      const canvas = document.getElementById('el-canvas-555');
      if (!canvas || !window.Timer555Sim) return;

      const raSlider = document.getElementById('slider-555-ra');
      const rbSlider = document.getElementById('slider-555-rb');
      const cSlider = document.getElementById('slider-555-c');

      function update() {
        timer555Params.Ra = Number(raSlider.value) * 1000;
        timer555Params.Rb = Number(rbSlider.value) * 1000;
        timer555Params.C = Number(cSlider.value) * 1e-6;

        document.getElementById('val-555-ra').innerText = (timer555Params.Ra / 1000).toFixed(0);
        document.getElementById('val-555-rb').innerText = (timer555Params.Rb / 1000).toFixed(0);
        document.getElementById('val-555-c').innerText = (timer555Params.C * 1e6).toFixed(1);

        window.Timer555Sim.render555Timer(canvas, timer555Params);
      }

      raSlider.addEventListener('input', update);
      rbSlider.addEventListener('input', update);
      cSlider.addEventListener('input', update);
      update();
    }
  }

})();
