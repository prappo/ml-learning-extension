// newtab.js — UI logic for the AI Engineer Playground new-tab page.
// Roadmap sidebar (study by topic) + random, an editor, and Python via PyRuntime.

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const els = {
    statusDot: $("status-dot"),
    statusText: $("status-text"),
    search: $("search"),
    progress: $("progress"),
    roadmap: $("roadmap"),
    cat: $("snippet-cat"),
    level: $("snippet-level"),
    refBadge: $("ref-badge"),
    tags: $("snippet-tags"),
    title: $("snippet-title"),
    desc: $("snippet-desc"),
    code: $("snippet-code"),
    walkthrough: $("walkthrough"),
    explain: $("explain"),
    viz: $("viz"),
    vizControls: $("viz-controls"),
    vizPrev: $("viz-prev"),
    vizPlay: $("viz-play"),
    vizNext: $("viz-next"),
    editor: $("editor"),
    highlight: $("highlight").querySelector("code"),
    gutter: $("gutter"),
    output: $("output"),
    btnRun: $("btn-run"),
    btnNew: $("btn-new"),
    btnPrev: $("btn-prev"),
    btnNext: $("btn-next"),
    btnLoad: $("btn-load"),
    btnClear: $("btn-clear"),
    btnReset: $("btn-reset"),
  };

  const SNIPPETS = window.SNIPPETS || [];
  const CATEGORIES = window.CATEGORY_ORDER || [];
  const byId = {};
  SNIPPETS.forEach((s) => (byId[s.id] = s));

  let current = null;
  let vizController = null;
  const topicEls = {}; // id -> sidebar element

  /* ---------------- visited progress (persisted) ---------------- */

  const STORE_KEY = "aiplay.visited";
  let visited = new Set();
  try {
    visited = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]"));
  } catch (_) {}

  function markVisited(id) {
    if (visited.has(id)) return;
    visited.add(id);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify([...visited]));
    } catch (_) {}
  }
  function updateProgress() {
    els.progress.textContent = visited.size + " / " + SNIPPETS.length;
  }

  /* ---------------- roadmap sidebar ---------------- */

  function buildRoadmap() {
    els.roadmap.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const items = SNIPPETS.filter((s) => s.category === cat);
      if (!items.length) return;

      const group = document.createElement("div");
      group.className = "cat-group";

      const title = document.createElement("div");
      title.className = "cat-title";
      title.innerHTML =
        "<span>" + cat + "</span><span class='count'>" + items.length + "</span>";

      const list = document.createElement("div");
      list.className = "cat-items";
      title.addEventListener("click", () => list.classList.toggle("collapsed"));

      items.forEach((s) => {
        const el = document.createElement("div");
        const extra = s.runnable === false ? " ref" : window.VIZ && window.VIZ[s.id] ? " viz-dot" : "";
        el.className = "topic" + extra;
        el.dataset.id = s.id;
        el.innerHTML =
          "<span class='tick'></span><span class='t-title'></span>";
        el.querySelector(".t-title").textContent = s.title;
        el.addEventListener("click", () => selectSnippet(s));
        topicEls[s.id] = el;
        list.appendChild(el);
      });

      group.appendChild(title);
      group.appendChild(list);
      els.roadmap.appendChild(group);
    });
    refreshTicks();
  }

  function refreshTicks() {
    Object.keys(topicEls).forEach((id) => {
      topicEls[id].querySelector(".tick").textContent = visited.has(id) ? "✓" : "";
    });
  }

  function highlightActive(id) {
    Object.values(topicEls).forEach((el) => el.classList.remove("active"));
    if (topicEls[id]) {
      topicEls[id].classList.add("active");
      topicEls[id].scrollIntoView({ block: "nearest" });
    }
  }

  /* ---------------- snippet display ---------------- */

  function selectSnippet(s) {
    showSnippet(s);
    clearOutput();
  }

  function showSnippet(s) {
    if (!s) return;
    current = s;
    els.cat.textContent = s.category;
    els.level.textContent = s.level;
    els.refBadge.style.display = s.runnable === false ? "inline-block" : "none";
    els.tags.textContent = s.tags.map((t) => "#" + t).join(" ");
    els.title.textContent = s.title;
    els.desc.textContent = s.description;
    els.code.innerHTML = window.highlightPython
      ? window.highlightPython(s.code)
      : escapeHtml(s.code);
    renderWalkthrough(s);
    els.explain.textContent = s.explain || "";
    els.explain.style.display = s.explain ? "block" : "none";
    startViz(s);
    markVisited(s.id);
    refreshTicks();
    highlightActive(s.id);
    updateProgress();
  }

  function renderWalkthrough(s) {
    const steps = (window.WALKTHROUGHS && window.WALKTHROUGHS[s.id]) || [];
    if (!steps.length) {
      els.walkthrough.style.display = "none";
      return;
    }
    els.walkthrough.style.display = "block";
    els.walkthrough.innerHTML =
      '<div class="wt-title">🔍 How the code works</div><ol>' +
      steps.map((t) => "<li>" + escapeHtml(t) + "</li>").join("") +
      "</ol>";
  }

  function startViz(s) {
    if (vizController) {
      vizController.stop();
      vizController = null;
    }
    const factory = window.VIZ && window.VIZ[s.id];
    const wrap = els.viz.closest(".viz-wrap");
    // show the panel BEFORE creating the animation so the canvas has a real size
    if (wrap) wrap.style.display = factory ? "block" : "none";
    if (factory) {
      try {
        vizController = factory(els.viz); // starts playing by default
      } catch (e) {
        console.warn("viz error:", e);
        vizController = null;
        if (wrap) wrap.style.display = "none";
      }
    }
    updateVizControls();
  }

  function updateVizControls() {
    if (vizController) els.vizPlay.textContent = vizController.isPlaying() ? "⏸" : "▶";
  }

  function currentIndex() {
    return current ? SNIPPETS.findIndex((s) => s.id === current.id) : -1;
  }
  function step(delta) {
    const i = currentIndex();
    const n = SNIPPETS.length;
    selectSnippet(SNIPPETS[(i + delta + n) % n]);
  }
  function pickRandom() {
    let next;
    do {
      next = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
    } while (SNIPPETS.length > 1 && current && next.id === current.id);
    return next;
  }

  /* ---------------- search ---------------- */

  function applySearch(q) {
    q = q.trim().toLowerCase();
    Object.keys(topicEls).forEach((id) => {
      const s = byId[id];
      const hay = (s.title + " " + s.category + " " + s.tags.join(" ") + " " + s.description).toLowerCase();
      topicEls[id].style.display = !q || hay.indexOf(q) !== -1 ? "" : "none";
    });
  }

  /* ---------------- editor: line numbers + tab key ---------------- */

  function updateGutter() {
    const lines = els.editor.value.split("\n").length || 1;
    let g = "";
    for (let i = 1; i <= lines; i++) g += i + "\n";
    els.gutter.textContent = g;
  }
  function renderHighlight() {
    els.highlight.innerHTML = window.highlightPython
      ? window.highlightPython(els.editor.value)
      : els.editor.value;
  }
  function refreshEditor() {
    updateGutter();
    renderHighlight();
  }
  function syncScroll() {
    els.gutter.scrollTop = els.editor.scrollTop;
    els.highlight.parentElement.scrollTop = els.editor.scrollTop;
    els.highlight.parentElement.scrollLeft = els.editor.scrollLeft;
  }
  function setEditor(text) {
    els.editor.value = text;
    refreshEditor();
    els.editor.focus();
  }

  els.editor.addEventListener("input", refreshEditor);
  els.editor.addEventListener("scroll", syncScroll);
  els.editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = els.editor.selectionStart, end = els.editor.selectionEnd;
      const v = els.editor.value;
      els.editor.value = v.slice(0, start) + "    " + v.slice(end);
      els.editor.selectionStart = els.editor.selectionEnd = start + 4;
      refreshEditor();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCurrent();
    }
  });

  /* ---------------- output ---------------- */

  function setStatus(text, state) {
    els.statusText.textContent = text;
    els.statusDot.className = "dot " + (state || "");
  }
  function clearOutput() {
    els.output.innerHTML = '<span class="muted">Output will appear here.</span>';
  }
  function renderResult(res) {
    els.output.innerHTML = "";
    const append = (text, cls) => {
      if (!text) return;
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text.endsWith("\n") ? text : text + "\n";
      els.output.appendChild(span);
    };
    const images = res.images || [];
    const addImages = () => {
      images.forEach((b64) => {
        const img = document.createElement("img");
        img.className = "plot";
        img.alt = "matplotlib figure";
        img.src = "data:image/png;base64," + b64;
        els.output.appendChild(img);
      });
    };

    if (res.ok) {
      append(res.stdout, "");
      append(res.stderr, "err");
      if (res.repr && res.repr !== "None") append("=> " + res.repr, "ok");
      addImages();
      if (!res.stdout && !res.stderr && !images.length && (!res.repr || res.repr === "None"))
        append("(ran successfully, no output)", "muted");
    } else {
      append(res.stdout, "");
      append(res.error || "Unknown error", "err");
      addImages();
    }
  }

  /* ---------------- running code ---------------- */

  // Libraries that can't run in the browser sandbox (no WASM build / not bundled).
  const UNSUPPORTED = [
    ["torch", "PyTorch", "torch"],
    ["tensorflow", "TensorFlow", "tensorflow"],
    ["keras", "Keras / TensorFlow", "tensorflow"],
  ];
  function unsupportedLib(code) {
    for (const [mod, name, pip] of UNSUPPORTED) {
      const re = new RegExp("(^|\\n)\\s*(import\\s+" + mod + "|from\\s+" + mod + ")\\b");
      if (re.test(code)) return { name, pip };
    }
    return null;
  }

  function runCurrent() {
    const code = els.editor.value.trim();
    if (!code) {
      els.output.innerHTML = '<span class="muted">Editor is empty — type some code first.</span>';
      return;
    }
    const blocked = unsupportedLib(code);
    if (blocked) {
      els.output.innerHTML =
        '<span class="muted">📖 This lesson uses <b>' + blocked.name +
        "</b>, which can't run in the browser. Copy the code into a free " +
        '<a href="https://colab.research.google.com" target="_blank" style="color:#6ea8fe">Google Colab</a>' +
        " notebook (no setup), or run it locally after <code>pip install " + blocked.pip +
        "</code>. Everything you're learning here applies the same way there.</span>";
      return;
    }
    els.btnRun.disabled = true;
    els.output.innerHTML = '<span class="muted">Running…</span>';
    PyRuntime.run(code)
      .then(renderResult)
      .catch((e) => renderResult({ ok: false, error: String(e) }))
      .finally(() => {
        els.btnRun.disabled = false;
      });
  }

  /* ---------------- buttons ---------------- */

  els.btnRun.addEventListener("click", runCurrent);
  els.btnNew.addEventListener("click", () => selectSnippet(pickRandom()));
  els.btnPrev.addEventListener("click", () => step(-1));
  els.btnNext.addEventListener("click", () => step(1));
  els.btnLoad.addEventListener("click", () => current && setEditor(current.code));
  els.btnClear.addEventListener("click", () => {
    setEditor("");
    clearOutput();
  });
  els.search.addEventListener("input", (e) => applySearch(e.target.value));

  // visualization playback controls
  els.vizPrev.addEventListener("click", () => {
    if (vizController) { vizController.step(-1); updateVizControls(); }
  });
  els.vizNext.addEventListener("click", () => {
    if (vizController) { vizController.step(1); updateVizControls(); }
  });
  els.vizPlay.addEventListener("click", () => {
    if (vizController) { vizController.toggle(); updateVizControls(); }
  });

  // Global keyboard shortcuts — ignored while typing in the editor / search box.
  document.addEventListener("keydown", (e) => {
    const ae = document.activeElement;
    const typing = ae && (ae.tagName === "TEXTAREA" || ae.tagName === "INPUT" || ae.isContentEditable);
    if (typing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; // don't hijack browser shortcuts

    const stepViz = (dir) => {
      if (vizController) { vizController.step(dir); updateVizControls(); }
    };

    switch (e.key) {
      case "ArrowRight":
      case "j":
      case "J":
        e.preventDefault(); step(1); break;
      case "ArrowLeft":
      case "k":
      case "K":
        e.preventDefault(); step(-1); break;
      case "r":
      case "R":
        e.preventDefault(); selectSnippet(pickRandom()); break;
      case " ": // Space — play/pause the visualization
        if (ae && ae.tagName === "BUTTON") return; // let a focused button handle Space itself
        e.preventDefault();
        if (vizController) { vizController.toggle(); updateVizControls(); }
        break;
      case "[":
        e.preventDefault(); stepViz(-1); break;
      case "]":
        e.preventDefault(); stepViz(1); break;
    }
  });

  // Reset progress ticks (two clicks to confirm — avoids accidental wipe).
  let resetArmed = false;
  let resetTimer = null;
  els.btnReset.addEventListener("click", () => {
    if (!resetArmed) {
      resetArmed = true;
      els.btnReset.textContent = "Sure?";
      els.btnReset.classList.add("primary");
      resetTimer = setTimeout(() => {
        resetArmed = false;
        els.btnReset.textContent = "↺ Reset";
        els.btnReset.classList.remove("primary");
      }, 3000);
      return;
    }
    clearTimeout(resetTimer);
    resetArmed = false;
    els.btnReset.textContent = "↺ Reset";
    els.btnReset.classList.remove("primary");
    visited = new Set();
    try {
      localStorage.removeItem(STORE_KEY);
    } catch (_) {}
    refreshTicks();
    updateProgress();
  });

  /* ---------------- init ---------------- */

  PyRuntime.onStatus(setStatus);
  setStatus("Starting Python runtime…", "loading");
  buildRoadmap();
  updateProgress();
  showSnippet(pickRandom());
  refreshEditor();
  clearOutput();
  PyRuntime.init().catch(() => setStatus("Python failed to load", "error"));
})();
