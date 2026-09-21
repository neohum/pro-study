/* pro-study 프런트엔드. 의존성 없음(하이라이트는 vendor/highlight.min.js). */
(function () {
  "use strict";

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  // ---- 토스트 ----
  let toastTimer;
  function toast(msg, isError) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, isError ? 7000 : 4000);
  }

  async function api(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("json") ? await res.json() : await res.text();
    if (!res.ok) throw new Error((data && data.error) || String(data) || res.statusText);
    return data;
  }

  // ---- 홈: 언어 탭 ----
  function initHome() {
    const tabs = $$(".lang-tab");
    const panels = $$(".lang-panel");
    if (!tabs.length) return;
    function show(lang) {
      tabs.forEach(t => t.classList.toggle("active", t.dataset.lang === lang));
      panels.forEach(p => { p.hidden = p.dataset.lang !== lang; });
      try { localStorage.setItem("lang", lang); } catch (_) {}
    }
    tabs.forEach(t => t.addEventListener("click", () => {
      show(t.dataset.lang);
      history.replaceState(null, "", "#" + t.dataset.lang);
    }));
    let initial = location.hash.replace("#", "");
    if (!tabs.some(t => t.dataset.lang === initial)) {
      try { initial = localStorage.getItem("lang") || ""; } catch (_) {}
    }
    if (!tabs.some(t => t.dataset.lang === initial)) initial = tabs[0].dataset.lang;
    show(initial);
    window.addEventListener("hashchange", () => {
      const h = location.hash.replace("#", "");
      if (tabs.some(t => t.dataset.lang === h)) show(h);
    });
  }

  // ---- 프로젝트: 코드 뷰어 ----
  const langOf = (path) => {
    if (/\.(c|h)$/.test(path)) return "c";
    if (/\.go$/.test(path)) return "go";
    if (/\.rs$/.test(path)) return "rust";
    if (/\.py$/.test(path)) return "python";
    if (/\.ts$/.test(path)) return "typescript";
    if (/\.js$/.test(path)) return "javascript";
    if (/\.(json)$/.test(path)) return "json";
    if (/\.(md)$/.test(path)) return "markdown";
    if (/\.(ps1)$/.test(path)) return "powershell";
    if (/\.(sh)$/.test(path)) return "bash";
    if (/go\.mod$/.test(path)) return "go";
    return "plaintext";
  };

  function initProject() {
    const root = $(".project");
    if (!root) return;
    const { lang, slug } = root.dataset;
    const base = `/api/${""}`; // 가독용 자리
    const treeEl = $("#filetree");
    const codeEl = $("#code");
    const pathEl = $("#code-path");
    const gate = $("#solution-gate");
    const pre = $("#code-pre");
    let area = "starter";
    let solutionRevealed = false;
    try { solutionRevealed = sessionStorage.getItem(`sol:${lang}/${slug}`) === "1"; } catch (_) {}

    function renderTree(nodes, parent) {
      if (!nodes.length && parent === treeEl) {
        treeEl.innerHTML = '<li class="empty">파일이 없습니다</li>';
        return;
      }
      nodes.forEach(n => {
        const li = document.createElement("li");
        if (n.isDir) {
          const span = document.createElement("span");
          span.textContent = n.name + "/";
          li.appendChild(span);
          const ul = document.createElement("ul");
          renderTree(n.children || [], ul);
          li.appendChild(ul);
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = n.name;
          btn.dataset.path = n.path;
          btn.addEventListener("click", () => openFile(n.path, btn));
          li.appendChild(btn);
        }
        parent.appendChild(li);
      });
    }

    async function loadTree(pickEntry) {
      treeEl.innerHTML = "";
      codeEl.textContent = "";
      pathEl.textContent = "파일을 선택하세요";
      let nodes = [];
      try {
        nodes = await api("GET", `/api/tree/${lang}/${slug}/${area}`);
      } catch (e) {
        treeEl.innerHTML = `<li class="empty">${e.message}</li>`;
        return;
      }
      renderTree(nodes, treeEl);
      if (pickEntry) {
        const entry = root.dataset.entry;
        const btn = $$("button", treeEl).find(b => b.dataset.path === entry) || $("button", treeEl);
        if (btn) btn.click();
      }
    }

    async function openFile(path, btn) {
      $$("button", treeEl).forEach(b => b.classList.toggle("active", b === btn));
      pathEl.textContent = `${area}/${path}`;
      try {
        const text = await api("GET", `/api/file/${lang}/${slug}/${area}/${path}`);
        codeEl.textContent = text;
        codeEl.className = "hljs language-" + langOf(path);
        if (window.hljs) { delete codeEl.dataset.highlighted; window.hljs.highlightElement(codeEl); }
      } catch (e) {
        codeEl.textContent = "읽기 실패: " + e.message;
      }
    }

    function selectArea(next) {
      area = next;
      $$(".vtab").forEach(t => t.classList.toggle("active", t.dataset.area === next));
      const locked = next === "solution" && !solutionRevealed;
      gate.hidden = !locked;
      pre.hidden = locked;
      treeEl.hidden = locked;
      if (locked) { treeEl.innerHTML = ""; codeEl.textContent = ""; pathEl.textContent = "solution (잠김)"; return; }
      loadTree(true);
    }

    $$(".vtab").forEach(t => t.addEventListener("click", () => { if (!t.disabled) selectArea(t.dataset.area); }));
    $("#reveal-solution").addEventListener("click", () => {
      solutionRevealed = true;
      try { sessionStorage.setItem(`sol:${lang}/${slug}`, "1"); } catch (_) {}
      selectArea("solution");
    });
    selectArea("starter");

    // ---- 목차 현재 위치 ----
    const tocLinks = $$(".top-toc a[href^='#'], .toc a[href^='#']");
    if (tocLinks.length && "IntersectionObserver" in window) {
      const map = new Map(tocLinks.map(a => [decodeURIComponent(a.getAttribute("href").slice(1)), a]));
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            tocLinks.forEach(a => a.classList.remove("active"));
            const a = map.get(en.target.id);
            if (a) a.classList.add("active");
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      map.forEach((_, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
    }

    // ---- VS Code 열기 ----
    const btnOpen = $("#btn-open");
    const badge = $("#status-badge");
    const workTab = $$(".vtab").find(t => t.dataset.area === "work");

    function setWorkExists() {
      root.dataset.workExists = "true";
      if (workTab) { workTab.disabled = false; workTab.title = ""; }
    }

    if (btnOpen) {
      btnOpen.addEventListener("click", async () => {
        btnOpen.classList.add("loading");
        try {
          const r = await api("POST", `/api/open/${lang}/${slug}`);
          setWorkExists();
          if (r.created) toast("작업 폴더를 만들었습니다: " + r.dir);
          if (r.opened) {
            toast("VS Code를 열었습니다.");
          } else {
            toast("code CLI를 쓰지 못해 vscode:// 링크로 엽니다. " + (r.error || ""), true);
            window.location.href = r.url;
          }
          if (badge && badge.classList.contains("badge-not-started")) {
            badge.className = "badge badge-in-progress"; badge.textContent = "진행 중";
          }
          if (area === "work") loadTree(true);
        } catch (e) {
          toast("열기 실패: " + e.message, true);
        } finally {
          btnOpen.classList.remove("loading");
        }
      });
    }
    void base;
  }

  // ---- 가이드 코드 블록 하이라이트 ----
  function highlightGuide() {
    if (!window.hljs) return;
    $$(".guide pre code, .syntax-block pre code, .example-block pre code, .function-example pre code, pre.full-code code")
      .forEach(el => window.hljs.highlightElement(el));
  }

  // ---- 레퍼런스 페이지 (/ref) ----
  function initReference() {
    const searchInput = $("#refSearchInput");
    if (!searchInput) return;

    const cards = $$(".grammar-card, .function-card");
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = (card.dataset.search || card.textContent).toLowerCase();
        card.hidden = q !== "" && !text.includes(q);
      });
    });
  }

  // ---- Go Tour 필사 페이지 (/trace/go) ----
  function initTourTracing() {
    const typingPanel = $("#typingPanel");
    if (!typingPanel || !window.__TOUR_LESSON_CODE__) return;

    const rawCode = window.__TOUR_LESSON_CODE__;
    let lines = rawCode.split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }

    const tabs = $$(".trace-tab");
    const fullcodePanel = $("#fullcodePanel");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.toggle("active", t === tab));
        const view = tab.dataset.view;
        typingPanel.hidden = view !== "typing";
        fullcodePanel.hidden = view !== "fullcode";
      });
    });

    const btnCopy = $("#btnCopyCode");
    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(rawCode);
          toast("전체 코드가 클립보드에 복사되었습니다.");
        } catch (_) {
          toast("클립보드 복사에 실패했습니다.", true);
        }
      });
    }

    let curLineIdx = 0;
    const prevContextEl = $("#traceContextPrev");
    const nextContextEl = $("#traceContextNext");
    const activeLineNumEl = $("#activeLineNum");
    const targetGhostEl = $("#targetGhost");
    const traceInput = $("#traceInput");
    const progressFill = $("#traceProgressFill");
    const progressText = $("#traceProgressText");
    const lineIndexEl = $("#traceLineIndex");
    const lineTotalEl = $("#traceLineTotal");
    const completeBanner = $("#traceCompleteBanner");
    const btnReset = $("#btnResetTrace");

    if (lineTotalEl) lineTotalEl.textContent = lines.length;

    function updateLine() {
      if (curLineIdx >= lines.length) {
        if (completeBanner) completeBanner.hidden = false;
        $(".typing-active-line").style.display = "none";
        progressFill.style.width = "100%";
        progressText.textContent = "100%";
        return;
      }

      const target = lines[curLineIdx];
      const startPrev = Math.max(0, curLineIdx - 4);
      prevContextEl.textContent = lines.slice(startPrev, curLineIdx).join("\n");
      const endNext = Math.min(lines.length, curLineIdx + 5);
      nextContextEl.textContent = lines.slice(curLineIdx + 1, endNext).join("\n");

      activeLineNumEl.textContent = curLineIdx + 1;
      targetGhostEl.textContent = target === "" ? "↵ (빈 줄: Enter를 누르세요)" : target;
      traceInput.value = "";
      traceInput.classList.remove("mismatch");
      traceInput.focus();

      const pct = Math.round((curLineIdx / lines.length) * 100);
      progressFill.style.width = pct + "%";
      progressText.textContent = pct + "%";
      lineIndexEl.textContent = curLineIdx + 1;
    }

    traceInput.addEventListener("input", () => {
      const target = lines[curLineIdx];
      const val = traceInput.value;
      if (target.startsWith(val)) {
        traceInput.classList.remove("mismatch");
      } else {
        traceInput.classList.add("mismatch");
      }
    });

    traceInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const target = lines[curLineIdx];
        const val = traceInput.value;
        if (target.trim() === "" || val.trimEnd() === target.trimEnd()) {
          curLineIdx++;
          updateLine();
        } else {
          traceInput.classList.add("mismatch");
          toast("코드가 일치하지 않습니다. 다시 확인해주세요.", true);
        }
      }
    });

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        curLineIdx = 0;
        $(".typing-active-line").style.display = "flex";
        if (completeBanner) completeBanner.hidden = true;
        updateLine();
        toast("필사를 처음부터 다시 시작합니다.");
      });
    }

    updateLine();
  }

  // ---- 아이디어 제안소 (/ideas) ----
  function initIdeas() {
    const form = $("#ideaForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = $("#ideaTitle").value.trim();
      const category = $("#ideaCategory").value;
      const author = $("#ideaAuthor").value.trim() || "익명 러너";
      const description = $("#ideaDesc").value.trim();

      const submitBtn = $("#btnSubmitIdea");
      submitBtn.disabled = true;

      try {
        const item = await api("POST", "/api/ideas", { title, category, description, author });
        toast("아이디어가 성공적으로 제안되었습니다!");
        form.reset();

        // 새 카드 DOM 추가
        const list = $("#ideasList");
        const countEl = $("#ideasCount");
        if (list) {
          const card = document.createElement("article");
          card.className = "idea-card";
          card.dataset.id = item.id;
          card.dataset.category = item.category;
          card.innerHTML = `
            <div class="idea-vote-box">
              <button class="btn-vote" data-id="${item.id}" title="이 아이디어 추천하기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
                <span class="vote-count">${item.votes}</span>
              </button>
            </div>
            <div class="idea-content">
              <div class="idea-meta">
                <span class="badge badge-idea-cat">${item.category}</span>
                <span class="idea-author">${item.author}</span>
                <span class="idea-date">${item.createdAt}</span>
              </div>
              <h3 class="idea-card-title">${item.title}</h3>
              <p class="idea-card-desc">${item.description}</p>
            </div>
          `;
          list.prepend(card);
          bindVoteButtons(card);
        }
        if (countEl) {
          countEl.textContent = parseInt(countEl.textContent || "0", 10) + 1;
        }
      } catch (err) {
        toast("아이디어 등록 실패: " + err.message, true);
      } finally {
        submitBtn.disabled = false;
      }
    });

    function bindVoteButtons(scope) {
      $$(".btn-vote", scope || document).forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "true";
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          if (btn.classList.contains("voted")) return;
          try {
            const res = await api("POST", `/api/ideas/${id}/vote`);
            btn.classList.add("voted");
            const countEl = btn.querySelector(".vote-count");
            if (countEl) countEl.textContent = res.votes;
            toast("아이디어를 추천했습니다!");
          } catch (err) {
            toast("추천 실패: " + err.message, true);
          }
        });
      });
    }

    bindVoteButtons();

    // 카테고리 필터
    const filterBtns = $$(".filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.toggle("active", b === btn));
        const filter = btn.dataset.filter;
        $$(".idea-card").forEach(card => {
          if (filter === "all" || card.dataset.category === filter) {
            card.hidden = false;
          } else {
            card.hidden = true;
          }
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHome();
    initProject();
    initReference();
    initTourTracing();
    initIdeas();
    highlightGuide();
  });
})();
