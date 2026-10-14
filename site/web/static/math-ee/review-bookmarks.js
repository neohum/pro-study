/**
 * review-bookmarks.js
 * 시뮬레이터(8-bit CPU, 회로 샌드박스, 3상 인버터 모터) 실험 프리셋 및
 * 수식·코드 필사 블록을 로컬 북마크(proStudyBookmarks)로 저장하고,
 * E-ink 무잔상(Zero-Ghosting) 플래시카드 모달에서 복습하는 통합 복습 덱 모듈.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ProStudyReviewDeck = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'proStudyBookmarks';

  function createMemoryStorage() {
    const map = new Map();
    return {
      getItem(k) {
        return map.has(k) ? map.get(k) : null;
      },
      setItem(k, v) {
        map.set(k, String(v));
      },
      removeItem(k) {
        map.delete(k);
      },
    };
  }

  function resolveDefaultStorage() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        return localStorage;
      }
    } catch (_) {}
    return createMemoryStorage();
  }

  /**
   * createReviewDeckStore는 로컬 스토리지(또는 테스트용 스토리지)에 연결된
   * 복습 북마크 덱 상태 머신을 생성한다.
   */
  function createReviewDeckStore(customStorage) {
    const storage = customStorage || resolveDefaultStorage();
    let activeCardIndex = 0;
    let answerRevealed = false;

    function loadAll() {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }

    function saveAll(list) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (_) {}
      return list;
    }

    function addBookmark(input) {
      if (!input || (!input.lessonId && !input.simulatorId)) {
        throw new Error('Bookmark requires lessonId or simulatorId');
      }
      const list = loadAll();
      const id =
        input.id ||
        `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const item = {
        id,
        lessonId: String(input.lessonId || input.simulatorId),
        category: String(input.category || 'general'),
        title: String(input.title || input.lessonId || '복습 카드'),
        prompt: String(input.prompt || '핵심 수식/코드 또는 시뮬레이터 상태를 떠올려 보세요.'),
        answerSnippet:
          typeof input.answerSnippet === 'object'
            ? JSON.stringify(input.answerSnippet, null, 2)
            : String(input.answerSnippet || ''),
        presetParams: input.presetParams || null,
        memo: String(input.memo || ''),
        mastered: Boolean(input.mastered || false),
        createdAt: input.createdAt || new Date().toISOString(),
        masteredAt: input.masteredAt || null,
      };

      const existingIdx = list.findIndex(
        (x) =>
          x.lessonId === item.lessonId &&
          x.category === item.category &&
          x.answerSnippet === item.answerSnippet,
      );
      if (existingIdx >= 0) {
        list[existingIdx] = Object.assign({}, list[existingIdx], item, {
          id: list[existingIdx].id,
        });
      } else {
        list.unshift(item);
      }
      saveAll(list);
      return item;
    }

    function getBookmarks(filter) {
      const list = loadAll();
      if (!filter || filter === 'all') return list;
      if (filter === 'pending') return list.filter((x) => !x.mastered);
      if (filter === 'mastered') return list.filter((x) => x.mastered);
      return list.filter((x) => x.category === filter);
    }

    function markMastered(id, mastered = true) {
      const list = loadAll();
      const target = list.find((x) => x.id === id);
      if (!target) return null;
      target.mastered = Boolean(mastered);
      target.masteredAt = target.mastered ? new Date().toISOString() : null;
      saveAll(list);
      answerRevealed = false;
      return target;
    }

    function removeBookmark(id) {
      const list = loadAll();
      const next = list.filter((x) => x.id !== id);
      saveAll(next);
      if (activeCardIndex >= next.length) {
        activeCardIndex = Math.max(0, next.length - 1);
      }
      answerRevealed = false;
      return next.length;
    }

    function startCardSession(index = 0) {
      const list = loadAll();
      activeCardIndex = Math.max(0, Math.min(index, Math.max(0, list.length - 1)));
      answerRevealed = false;
      return getCurrentCardState();
    }

    function revealAnswer() {
      answerRevealed = true;
      return getCurrentCardState();
    }

    function nextCard() {
      const list = loadAll();
      if (list.length > 0) {
        activeCardIndex = (activeCardIndex + 1) % list.length;
      }
      answerRevealed = false;
      return getCurrentCardState();
    }

    function prevCard() {
      const list = loadAll();
      if (list.length > 0) {
        activeCardIndex = (activeCardIndex - 1 + list.length) % list.length;
      }
      answerRevealed = false;
      return getCurrentCardState();
    }

    function getCurrentCardState() {
      const list = loadAll();
      const card = list[activeCardIndex] || null;
      return {
        total: list.length,
        pendingCount: list.filter((x) => !x.mastered).length,
        masteredCount: list.filter((x) => x.mastered).length,
        activeCardIndex,
        answerRevealed,
        card,
      };
    }

    return {
      STORAGE_KEY,
      loadAll,
      addBookmark,
      getBookmarks,
      markMastered,
      removeBookmark,
      startCardSession,
      revealAnswer,
      nextCard,
      prevCard,
      getCurrentCardState,
    };
  }

  function captureSimulatorPreset(simKind, customParams, memo) {
    const defaults = {
      'sim-computer': {
        lessonId: 'sim-computer-8bit-cpu',
        category: 'simulator-cpu',
        title: '8-bit 가상 CPU 시뮬레이터 프리셋',
        prompt: '현재 프로그램 카운터(PC), 누산기(ACC) 및 ALU 명령어 사이클 결과를 예측하시오.',
        presetParams: customParams || { program: 'fibonacci', clockHz: 4, acc: 0, pc: 0 },
      },
      'sim-circuit': {
        lessonId: 'sim-circuit-sandbox',
        category: 'simulator-circuit',
        title: '회로 샌드박스 & 오실로스코프 실험 프리셋',
        prompt: '입력 파형과 R/L/C 소자 값에 따른 채널 1·2 오실로스코프 응답을 유도하시오.',
        presetParams: customParams || { topology: 'rc-lowpass', Vpeak: 5, freqHz: 60, R: 1000, C_uF: 10 },
      },
      'sim-inverter': {
        lessonId: 'sim-inverter-motor',
        category: 'simulator-inverter',
        title: '3상 PWM 인버터 & 유도전동기 동역학 프리셋',
        prompt: 'V/f 제어 주파수 및 부하 토크 변화에 따른 동기속도(Ns)와 슬립(s)을 계산하시오.',
        presetParams: customParams || { Vdc: 310, fRefHz: 60, poles: 4, loadTorqueNm: 5.0 },
      },
    };
    const base = defaults[simKind] || {
      lessonId: simKind || 'sim-custom',
      category: 'simulator-preset',
      title: `시뮬레이터 프리셋 (${simKind})`,
      prompt: '저장된 시뮬레이터 실험 파라미터에 따른 동작 파형을 설명하시오.',
      presetParams: customParams || {},
    };
    return {
      lessonId: base.lessonId,
      category: base.category,
      title: base.title,
      prompt: base.prompt,
      answerSnippet: JSON.stringify(base.presetParams, null, 2),
      presetParams: base.presetParams,
      memo: memo || 'E-ink 실험실에서 저장한 시뮬레이터 파라미터 프리셋입니다.',
    };
  }

  const defaultStore = createReviewDeckStore();

  // ---- Browser UI Integration (Zero-Animation E-ink Modal & Buttons) ----
  function updateBadgeCounts() {
    if (typeof document === 'undefined') return;
    const st = defaultStore.getCurrentCardState();
    const els = document.querySelectorAll('#reviewDeckCount, .review-deck-count');
    els.forEach((el) => {
      el.textContent = String(st.total);
    });
  }

  function ensureModalDOM() {
    if (typeof document === 'undefined') return null;
    let modal = document.getElementById('einkReviewDeckModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'einkReviewDeckModal';
    modal.className = 'review-deck-modal-backdrop';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="review-deck-modal" role="dialog" aria-modal="true" aria-label="E-ink 복습 플래시카드 덱">
        <div class="review-deck-header">
          <div>
            <strong>🗂️ E-ink 고대비 복습 플래시카드 덱</strong>
            <span id="reviewModalStats" style="margin-left:10px;font-size:0.85rem;font-weight:700;"></span>
          </div>
          <button type="button" class="btn-action" id="btnCloseReviewModal">✕ 닫기</button>
        </div>
        <div class="review-deck-body" id="reviewModalBody"></div>
        <div class="review-deck-footer">
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-action" id="btnReviewPrev">⬅ 이전 카드</button>
            <button type="button" class="btn-action" id="btnReviewNext">다음 카드 ➔</button>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-action" id="btnReviewReveal">👁️ 정답/유도 과정 펼치기</button>
            <button type="button" class="btn-action btn-success" id="btnReviewMastered">✅ 완전히 이해함</button>
            <button type="button" class="btn-action btn-danger" id="btnReviewDelete">삭제</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btnCloseReviewModal').addEventListener('click', () => {
      modal.hidden = true;
    });
    document.getElementById('btnReviewPrev').addEventListener('click', () => {
      defaultStore.prevCard();
      renderModalContent();
    });
    document.getElementById('btnReviewNext').addEventListener('click', () => {
      defaultStore.nextCard();
      renderModalContent();
    });
    document.getElementById('btnReviewReveal').addEventListener('click', () => {
      defaultStore.revealAnswer();
      renderModalContent();
    });
    document.getElementById('btnReviewMastered').addEventListener('click', () => {
      const st = defaultStore.getCurrentCardState();
      if (st.card) {
        defaultStore.markMastered(st.card.id, !st.card.mastered);
        renderModalContent();
        updateBadgeCounts();
      }
    });
    document.getElementById('btnReviewDelete').addEventListener('click', () => {
      const st = defaultStore.getCurrentCardState();
      if (st.card) {
        defaultStore.removeBookmark(st.card.id);
        renderModalContent();
        updateBadgeCounts();
      }
    });

    return modal;
  }

  function renderModalContent() {
    if (typeof document === 'undefined') return;
    ensureModalDOM();
    const st = defaultStore.getCurrentCardState();
    const statsEl = document.getElementById('reviewModalStats');
    const bodyEl = document.getElementById('reviewModalBody');
    const btnMastered = document.getElementById('btnReviewMastered');

    if (statsEl) {
      statsEl.textContent = `전체 ${st.total}장 · 미완료 ${st.pendingCount}장 · 마스터 ${st.masteredCount}장`;
    }
    if (!bodyEl) return;

    if (!st.card) {
      bodyEl.innerHTML = `
        <div class="review-flashcard-empty">
          <p style="font-weight:800;font-size:1.05rem;margin-bottom:6px;">저장된 복습 카드가 없습니다.</p>
          <p style="font-size:0.9rem;color:#334155;">수식·코드 필사 화면이나 시뮬레이터에서 <strong>[🔖 복습 카드 담기]</strong> 버튼을 눌러 북마크를 추가하세요.</p>
        </div>
      `;
      return;
    }

    const c = st.card;
    if (btnMastered) {
      btnMastered.textContent = c.mastered ? '↺ 미완료로 되돌리기' : '✅ 완전히 이해함';
    }

    bodyEl.innerHTML = `
      <div class="review-flashcard">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:2px solid #0f172a;padding-bottom:8px;">
          <span style="font-weight:800;font-size:0.85rem;">[${st.activeCardIndex + 1}/${st.total}] ${c.category} · ${c.lessonId}</span>
          <span style="font-weight:800;padding:2px 8px;border:2px solid #0f172a;border-radius:4px;background:${c.mastered ? '#0f172a' : '#ffffff'};color:${c.mastered ? '#ffffff' : '#0f172a'};">
            ${c.mastered ? '완전히 이해함 (DONE)' : '복습 필요 (REVIEW)'}
          </span>
        </div>
        <h3 style="font-size:1.2rem;font-weight:900;margin-bottom:10px;">${c.title}</h3>
        <div class="review-flashcard-question">
          <div style="font-size:0.82rem;font-weight:800;margin-bottom:4px;">[문제 / 개념 질문]</div>
          <div style="font-size:0.98rem;font-weight:700;">${c.prompt}</div>
        </div>
        ${
          st.answerRevealed
            ? `
          <div class="review-flashcard-answer" id="reviewCardAnswerBox">
            <div style="font-size:0.82rem;font-weight:800;margin-bottom:6px;">[정답 / 수식·코드·프리셋 원문]</div>
            <pre style="font-family:monospace;font-size:0.9rem;white-space:pre-wrap;word-break:break-all;background:#f8fafc;border:2px solid #0f172a;padding:10px;border-radius:4px;">${c.answerSnippet}</pre>
            ${c.memo ? `<div style="margin-top:8px;font-size:0.86rem;font-weight:700;">📝 메모: ${c.memo}</div>` : ''}
          </div>
        `
            : `
          <div class="review-flashcard-hidden-notice">
            정답 및 유도 과정이 가려져 있습니다. 하단의 <strong>[👁️ 정답/유도 과정 펼치기]</strong>를 클릭하세요.
          </div>
        `
        }
      </div>
    `;
  }

  function openModal() {
    const modal = ensureModalDOM();
    if (!modal) return;
    defaultStore.startCardSession(0);
    renderModalContent();
    modal.hidden = false;
  }

  function injectHeaderAndSimulatorButtons() {
    if (typeof document === 'undefined') return;
    updateBadgeCounts();

    const headerNav = document.querySelector('header.app-header nav.tab-nav');
    if (headerNav && !document.getElementById('btnHeaderReviewDeck')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnHeaderReviewDeck';
      btn.className = 'tab-btn';
      btn.innerHTML = '🗂️ 복습 덱 (<span class="review-deck-count">0</span>)';
      btn.addEventListener('click', openModal);
      headerNav.appendChild(btn);
      updateBadgeCounts();
    }

    const simPanes = [
      { id: 'tab-sim-computer', kind: 'sim-computer', label: '🔖 CPU 프리셋 복습 카드 담기' },
      { id: 'tab-sim-circuit', kind: 'sim-circuit', label: '🔖 회로 프리셋 복습 카드 담기' },
      { id: 'tab-sim-inverter', kind: 'sim-inverter', label: '🔖 인버터 프리셋 복습 카드 담기' },
    ];

    simPanes.forEach((cfg) => {
      const pane = document.getElementById(cfg.id);
      if (!pane || pane.querySelector('.sim-bookmark-toolbar')) return;
      const bar = document.createElement('div');
      bar.className = 'sim-bookmark-toolbar';
      bar.style.cssText =
        'display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px;padding:8px 12px;border:2px solid #0f172a;border-radius:6px;background:#ffffff;';
      bar.innerHTML = `
        <input type="text" class="search-input sim-memo-input" style="min-width:200px;padding:6px 10px;font-size:0.85rem;"
               placeholder="현재 시뮬레이터 실험 메모 입력...">
        <button type="button" class="btn-action btn-save-sim-bookmark">${cfg.label}</button>
        <button type="button" class="btn-action btn-open-deck-inline">🗂️ 복습 덱 열기</button>
      `;
      pane.prepend(bar);

      bar.querySelector('.btn-save-sim-bookmark').addEventListener('click', () => {
        const memoInput = bar.querySelector('.sim-memo-input');
        const preset = captureSimulatorPreset(
          cfg.kind,
          null,
          memoInput && memoInput.value ? memoInput.value : undefined,
        );
        defaultStore.addBookmark(preset);
        updateBadgeCounts();
      });
      bar.querySelector('.btn-open-deck-inline').addEventListener('click', openModal);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectHeaderAndSimulatorButtons);
    } else {
      injectHeaderAndSimulatorButtons();
    }
  }

  return {
    STORAGE_KEY,
    createReviewDeckStore,
    captureSimulatorPreset,
    addBookmark: function (item) {
      const saved = defaultStore.addBookmark(item);
      updateBadgeCounts();
      return saved;
    },
    getBookmarks: defaultStore.getBookmarks,
    markMastered: function (id, mastered) {
      const updated = defaultStore.markMastered(id, mastered);
      updateBadgeCounts();
      return updated;
    },
    removeBookmark: function (id) {
      const count = defaultStore.removeBookmark(id);
      updateBadgeCounts();
      return count;
    },
    revealAnswer: defaultStore.revealAnswer,
    getCurrentCardState: defaultStore.getCurrentCardState,
    openModal,
    injectHeaderAndSimulatorButtons,
  };
});
