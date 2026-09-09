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
    const tocLinks = $$(".toc a[href^='#']");
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

    // ---- 실행 패널 ----
    const btnOpen = $("#btn-open"), btnBuild = $("#btn-build"), btnRun = $("#btn-run"),
      btnTest = $("#btn-test"), btnReset = $("#btn-reset");
    const statusEl = $("#run-status"), casesEl = $("#cases"), outEl = $("#output");
    const badge = $("#status-badge");
    const workTab = $$(".vtab").find(t => t.dataset.area === "work");
    let current = null; // EventSource

    function setWorkExists() {
      root.dataset.workExists = "true";
      [btnBuild, btnRun, btnTest, btnReset].forEach(b => { b.disabled = false; });
      if (workTab) { workTab.disabled = false; workTab.title = ""; }
    }

    function busy(on) {
      [btnOpen, btnBuild, btnRun, btnTest, btnReset].forEach(b => {
        if (on) b.dataset.wasDisabled = b.disabled ? "1" : "";
        b.disabled = on ? true : b.dataset.wasDisabled === "1";
      });
    }

    btnOpen.addEventListener("click", async () => {
      btnOpen.classList.add("loading");
      try {
        const r = await api("POST", `/api/open/${lang}/${slug}`);
        setWorkExists();
        if (r.created) toast("작업 폴더를 만들었습니다: " + r.dir);
        if (r.opened) {
          toast("VS Code를 열었습니다. 코딩 후 돌아와서 [테스트]를 누르세요.");
        } else {
          toast("code CLI를 쓰지 못해 vscode:// 링크로 엽니다. " + (r.error || ""), true);
          window.location.href = r.url;
        }
        if (badge.classList.contains("badge-not-started")) {
          badge.className = "badge badge-in-progress"; badge.textContent = "진행 중";
        }
        if (area === "work") loadTree(true);
      } catch (e) {
        toast("열기 실패: " + e.message, true);
      } finally {
        btnOpen.classList.remove("loading");
      }
    });

    btnReset.addEventListener("click", async () => {
      if (!confirm("작업 폴더의 모든 변경을 버리고 starter 상태로 되돌립니다. 계속할까요?")) return;
      try {
        await api("POST", `/api/reset/${lang}/${slug}`);
        toast("초기화했습니다.");
        if (area === "work") loadTree(true);
      } catch (e) {
        toast("초기화 실패: " + e.message, true);
      }
    });

    function stagePill(stage, status, extra) {
      let el = $(`.stage[data-stage="${stage}"]`, statusEl);
      if (!el) {
        el = document.createElement("span");
        el.className = "stage";
        el.dataset.stage = stage;
        statusEl.appendChild(el);
      }
      const names = { build: "빌드", run: "실행", test: "테스트" };
      const labels = { running: "진행 중", ok: "성공", fail: "실패", error: "오류", timeout: "시간 초과" };
      el.className = "stage stage-" + status;
      el.textContent = `${names[stage] || stage}: ${labels[status] || status}${extra || ""}`;
    }

    function appendLine(ev) {
      const span = document.createElement("span");
      span.className = ev.stream || "stdout";
      span.textContent = ev.text + "\n";
      outEl.appendChild(span);
      outEl.scrollTop = outEl.scrollHeight;
    }

    function appendCase(ev) {
      const li = document.createElement("li");
      li.className = ev.pass ? "pass" : "fail";
      const head = document.createElement("div");
      head.textContent = `${ev.pass ? "✅" : "❌"} ${ev.name}${ev.millis ? ` · ${ev.millis}ms` : ""}${!ev.pass && (ev.status === "timeout" || ev.status === "error") ? ` · ${ev.status}` : ""}`;
      li.appendChild(head);
      if (!ev.pass && (ev.expected !== undefined || ev.actual)) {
        const d = document.createElement("details");
        const s = document.createElement("summary");
        s.textContent = "기대값 / 실제값";
        d.appendChild(s);
        if (ev.expected !== undefined && ev.expected !== "") {
          const p1 = document.createElement("pre"); p1.className = "diff-exp"; p1.textContent = "기대:\n" + ev.expected; d.appendChild(p1);
        }
        const p2 = document.createElement("pre"); p2.className = "diff-act"; p2.textContent = "실제:\n" + (ev.actual || "(출력 없음)"); d.appendChild(p2);
        li.appendChild(d);
      }
      casesEl.appendChild(li);
    }

    async function run(stage) {
      if (current) { current.close(); current = null; }
      statusEl.innerHTML = ""; casesEl.innerHTML = ""; outEl.innerHTML = "";
      busy(true);
      let id;
      try {
        const r = await api("POST", `/api/run/${lang}/${slug}`, { stage, stdin: $("#stdin").value });
        id = r.id;
      } catch (e) {
        busy(false);
        toast(e.message, true);
        return;
      }
      const es = new EventSource(`/api/events/${id}`);
      current = es;
      es.onmessage = (m) => {
        const ev = JSON.parse(m.data);
        switch (ev.type) {
          case "stage": {
            let extra = "";
            if (ev.stage === "test" && ev.status !== "running") extra = ` ${ev.passed}/${ev.total}`;
            if (ev.millis) extra += ` (${(ev.millis / 1000).toFixed(1)}s)`;
            stagePill(ev.stage, ev.status, extra);
            break;
          }
          case "line": appendLine(ev); break;
          case "case": appendCase(ev); break;
          case "done": {
            es.close(); current = null; busy(false);
            if (stage === "test") {
              if (ev.status === "ok") {
                badge.className = "badge badge-passed"; badge.textContent = "통과";
                toast(`모든 테스트 통과! (${ev.passed}/${ev.total})`);
              } else if (!badge.classList.contains("badge-passed")) {
                badge.className = "badge badge-in-progress"; badge.textContent = "진행 중";
              }
            }
            if (area === "work") loadTree(false);
            break;
          }
        }
      };
      es.onerror = () => { es.close(); current = null; busy(false); appendLine({ stream: "sys", text: "연결이 끊겼습니다." }); };
    }

    btnBuild.addEventListener("click", () => run("build"));
    btnRun.addEventListener("click", () => run("run"));
    btnTest.addEventListener("click", () => run("test"));
    void base;
  }

  // ---- 가이드 코드 블록 하이라이트 ----
  function highlightGuide() {
    if (!window.hljs) return;
    $$(".guide pre code").forEach(el => window.hljs.highlightElement(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHome();
    initProject();
    highlightGuide();
  });
})();
