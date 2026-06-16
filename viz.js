// viz.js — animated canvas visualizations, one per snippet (keyed by snippet id).
// Each entry is a factory: VIZ[id](canvas) -> { stop() }.
// Pure JS/Canvas — runs immediately, no Python needed. Only one runs at a time.

(function () {
  "use strict";

  /* ---------------- palette + helpers ---------------- */
  const C = {
    accent: "#6ea8fe",
    good: "#4ade80",
    warn: "#f5b042",
    bad: "#f87171",
    text: "#e6e8ee",
    muted: "#7c8398",
    grid: "#2a2f3d",
    pink: "#f472b6",
    purple: "#c084fc",
  };
  const CLASS = [C.accent, C.good, C.pink];
  const TAU = Math.PI * 2;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const saw = (t, p) => (t % p) / p; // 0..1 ramp
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

  // seeded RNG (mulberry32) for stable "random" data
  function rng(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) {
    let u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  }

  // animation loop with crisp HiDPI sizing.
  // Driven by a virtual clock so it can be paused / stepped:
  //   - plays by advancing virtual time each frame
  //   - pause() freezes it; play() resumes; step(±1) nudges and pauses
  // Returns a controller: { stop, play, pause, toggle, isPlaying, step }.
  function start(canvas, draw, opts) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const STEP = (opts && opts.step) || 0.8; // seconds jumped by next/prev
    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    let raf, lastTs = null, alive = true, playing = true, vtime = 0;
    function frame(ts) {
      if (!alive) return;
      if (lastTs === null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (playing) vtime += dt;
      const r = canvas.getBoundingClientRect();
      // re-measure if the canvas was sized while hidden, or the window resized
      if (Math.floor(r.width * dpr) !== canvas.width || Math.floor(r.height * dpr) !== canvas.height) {
        resize();
      }
      ctx.clearRect(0, 0, r.width, r.height);
      draw(ctx, r.width, r.height, vtime);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return {
      stop() { alive = false; cancelAnimationFrame(raf); },
      play() { playing = true; },
      pause() { playing = false; },
      toggle() { playing = !playing; return playing; },
      isPlaying() { return playing; },
      step(dir) { playing = false; vtime = Math.max(0, vtime + dir * STEP); },
    };
  }

  function dot(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function arrow(ctx, x0, y0, x1, y1, color, wd) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = wd || 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0), s = 9;
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - s * Math.cos(a - 0.4), y1 - s * Math.sin(a - 0.4));
    ctx.lineTo(x1 - s * Math.cos(a + 0.4), y1 - s * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }
  function label(ctx, text, x, y, color, align, size) {
    ctx.fillStyle = color || C.muted;
    ctx.font = (size || 12) + "px ui-monospace, Consolas, monospace";
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }
  // map data space -> screen (y flipped)
  function fitMap(w, h, pad, xmin, xmax, ymin, ymax) {
    const iw = w - 2 * pad, ih = h - 2 * pad;
    return (x, y) => [pad + ((x - xmin) / (xmax - xmin)) * iw, h - pad - ((y - ymin) / (ymax - ymin)) * ih];
  }

  const VIZ = {};

  /* ---------------- 1. list comprehension: squares rising ---------------- */
  VIZ["py-basics-list-comprehension"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const n = 10, pad = 28, gap = 6;
      const bw = (w - 2 * pad - gap * (n - 1)) / n;
      const cycle = 4.5;
      const tt = t % cycle;
      const maxv = 100;
      for (let i = 0; i < n; i++) {
        const v = (i + 1) * (i + 1);
        const grow = clamp((tt - i * 0.22) / 0.35, 0, 1);
        const bh = (v / maxv) * (h - 2 * pad) * easeInOut(grow);
        const x = pad + i * (bw + gap);
        const y = h - pad - bh;
        ctx.fillStyle = grow > 0.99 ? C.accent : C.purple;
        ctx.fillRect(x, y, bw, bh);
        if (grow > 0.05) label(ctx, String(v), x + bw / 2, y - 8, C.text, "center", 11);
        label(ctx, String(i + 1), x + bw / 2, h - pad + 10, C.muted, "center", 10);
      }
      label(ctx, "n  →  n²   (squares)", pad, pad - 12, C.muted, "left", 12);
    });

  /* ---------------- 2. bubble sort ---------------- */
  VIZ["algo-bubble-sort"] = (canvas) => {
    const base = [5, 2, 8, 3, 7, 1, 6, 4];
    const steps = [];
    (function build() {
      const a = base.slice(), n = a.length;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n - i - 1; j++) {
          const swap = a[j] > a[j + 1];
          steps.push({ state: a.slice(), j, swap, sortedFrom: n - i });
          if (swap) { const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp; }
        }
      steps.push({ state: a.slice(), j: -1, swap: false, sortedFrom: 0 });
    })();
    const SD = 0.42, PAUSE = 4; // pause steps at the end
    const total = steps.length + PAUSE;
    return start(canvas, (ctx, w, h, t) => {
      const n = base.length, pad = 26, gap = 8;
      const idx = Math.floor((t / SD) % total);
      const phase = (t / SD) % 1;
      const k = Math.min(idx, steps.length - 1);
      const st = steps[k];
      const bw = (w - 2 * pad - gap * (n - 1)) / n;
      const maxv = Math.max.apply(null, base);
      for (let p = 0; p < n; p++) {
        let drawPos = p;
        if (st.swap && phase < 1 && (p === st.j || p === st.j + 1))
          drawPos = p === st.j ? lerp(st.j, st.j + 1, easeInOut(phase)) : lerp(st.j + 1, st.j, easeInOut(phase));
        const v = st.state[p];
        const bh = (v / maxv) * (h - 2 * pad);
        const x = pad + drawPos * (bw + gap);
        const y = h - pad - bh;
        let col = C.accent;
        if (p >= st.sortedFrom) col = C.good;
        else if (p === st.j || p === st.j + 1) col = C.warn;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, bw, bh);
        label(ctx, String(v), x + bw / 2, y - 8, C.text, "center", 11);
      }
      label(ctx, idx >= steps.length - 1 ? "sorted ✓" : "comparing neighbours…", pad, pad - 12, C.muted, "left", 12);
    });
  };

  /* ---------------- 3. binary search ---------------- */
  VIZ["algo-binary-search"] = (canvas) => {
    const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
    const target = 72, steps = [];
    (function build() {
      let lo = 0, hi = arr.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const hit = arr[mid] === target;
        steps.push({ lo, hi, mid, hit });
        if (hit) break;
        if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
      }
    })();
    const SD = 0.95, PAUSE = 2, total = steps.length + PAUSE;
    return start(canvas, (ctx, w, h, t) => {
      const n = arr.length, pad = 26, gap = 6;
      const idx = Math.min(Math.floor((t / SD) % total), steps.length - 1);
      const st = steps[idx];
      const cw = (w - 2 * pad - gap * (n - 1)) / n;
      const cy = h / 2, ch = Math.min(46, cw * 1.1);
      for (let i = 0; i < n; i++) {
        const x = pad + i * (cw + gap);
        const inRange = i >= st.lo && i <= st.hi;
        ctx.fillStyle = inRange ? "#222a3a" : "#171a23";
        ctx.strokeStyle = i === st.mid ? (st.hit ? C.good : C.warn) : C.grid;
        ctx.lineWidth = i === st.mid ? 2.5 : 1;
        ctx.fillRect(x, cy - ch / 2, cw, ch);
        ctx.strokeRect(x, cy - ch / 2, cw, ch);
        label(ctx, String(arr[i]), x + cw / 2, cy, i === st.mid ? C.text : (inRange ? C.text : C.muted), "center", 12);
        if (i === st.lo) label(ctx, "lo", x + cw / 2, cy + ch / 2 + 12, C.accent, "center", 10);
        if (i === st.hi) label(ctx, "hi", x + cw / 2, cy - ch / 2 - 12, C.accent, "center", 10);
        if (i === st.mid) label(ctx, "mid", x + cw / 2, cy + ch / 2 + 12, st.hit ? C.good : C.warn, "center", 10);
      }
      label(ctx, st.hit ? "found " + target + " ✓" : "target = " + target, pad, pad - 10, C.muted, "left", 12);
    });
  };

  /* ---------------- 4. sigmoid ---------------- */
  VIZ["ml-sigmoid"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const pad = 30;
      const m = fitMap(w, h, pad, -6, 6, -0.05, 1.05);
      // axes
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      const zero = m(0, 0), one = m(0, 1);
      ctx.moveTo(m(-6, 0)[0], zero[1]); ctx.lineTo(m(6, 0)[0], zero[1]);
      ctx.moveTo(zero[0], m(0, -0.05)[1]); ctx.lineTo(zero[0], m(0, 1.05)[1]); ctx.stroke();
      ctx.setLineDash([3, 4]); ctx.beginPath();
      ctx.moveTo(m(-6, 1)[0], one[1]); ctx.lineTo(m(6, 1)[0], one[1]); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, "1", one[0] - 8, one[1], C.muted, "right", 11);
      // curve
      const sig = (x) => 1 / (1 + Math.exp(-x));
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = -6 + (12 * i) / 120, p = m(x, sig(x));
        i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
      // moving dot
      const x = 5.6 * Math.sin(t * 0.8), y = sig(x), p = m(x, y);
      dot(ctx, p[0], p[1], 5, C.good);
      label(ctx, "σ(" + x.toFixed(1) + ") = " + y.toFixed(2), pad, pad - 12, C.text, "left", 12);
    });

  /* ---------------- 5. softmax (interactive logit) ---------------- */
  VIZ["ml-softmax"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const z = [2 + 1.7 * Math.sin(t * 0.8), 1.0, 0.2];
      const mx = Math.max.apply(null, z);
      const e = z.map((v) => Math.exp(v - mx));
      const s = e.reduce((a, b) => a + b, 0);
      const p = e.map((v) => v / s);
      const pad = 30, n = 3, gap = 26;
      const bw = (w - 2 * pad - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        const bh = p[i] * (h - 2 * pad);
        const x = pad + i * (bw + gap), y = h - pad - bh;
        ctx.fillStyle = CLASS[i];
        ctx.fillRect(x, y, bw, bh);
        label(ctx, (p[i] * 100).toFixed(0) + "%", x + bw / 2, y - 9, C.text, "center", 12);
        label(ctx, "z=" + z[i].toFixed(1), x + bw / 2, h - pad + 12, C.muted, "center", 10);
      }
      label(ctx, "softmax → probabilities (Σ = 1.0)", pad, pad - 14, C.muted, "left", 12);
    });

  /* ---------------- 6. MSE residual squares ---------------- */
  VIZ["ml-mse"] = (canvas) => {
    const r = rng(11), xs = [], ys = [];
    for (let i = 0; i < 7; i++) { xs.push(i); ys.push(0.55 * i + 0.6 + gauss(r) * 0.35); }
    return start(canvas, (ctx, w, h, t) => {
      const pad = 30, m = fitMap(w, h, pad, -0.4, 6.4, -0.4, 4.4);
      const slope = 0.55 + 0.32 * Math.sin(t * 0.5);
      const inter = 0.6 + 0.25 * Math.cos(t * 0.5);
      const pred = (x) => slope * x + inter;
      // line
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
      ctx.beginPath();
      let a = m(-0.4, pred(-0.4)), b = m(6.4, pred(6.4));
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      let mse = 0;
      for (let i = 0; i < xs.length; i++) {
        const err = ys[i] - pred(xs[i]); mse += err * err;
        const pt = m(xs[i], ys[i]), on = m(xs[i], pred(xs[i]));
        // squared-error square (side = |err| in data units)
        const side = Math.abs(on[1] - pt[1]);
        ctx.fillStyle = "rgba(248,113,113,0.18)";
        ctx.strokeStyle = "rgba(248,113,113,0.5)";
        const sx = Math.min(pt[0], on[0]);
        const sy = Math.min(pt[1], on[1]);
        ctx.fillRect(sx, sy, side, side); ctx.strokeRect(sx, sy, side, side);
        ctx.strokeStyle = C.bad; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pt[0], pt[1]); ctx.lineTo(on[0], on[1]); ctx.stroke();
        dot(ctx, pt[0], pt[1], 4, C.good);
      }
      mse /= xs.length;
      label(ctx, "MSE = " + mse.toFixed(2) + "  (mean of red squares)", pad, pad - 14, C.text, "left", 12);
    });
  };

  /* ---------------- 7. linear regression by gradient descent ---------------- */
  VIZ["ml-linear-regression-gd"] = (canvas) => {
    const r = rng(3), xs = [], ys = [];
    for (let i = 0; i < 12; i++) { const x = i / 11; xs.push(x); ys.push(2 * x + 0.3 + gauss(r) * 0.09); }
    const traj = [];
    let w0 = 0, b0 = 0; const lr = 0.85, n = xs.length;
    for (let s = 0; s <= 140; s++) {
      traj.push({ w: w0, b: b0 });
      let gw = 0, gb = 0;
      for (let i = 0; i < n; i++) { const e = w0 * xs[i] + b0 - ys[i]; gw += (2 * e * xs[i]) / n; gb += (2 * e) / n; }
      w0 -= lr * gw; b0 -= lr * gb;
    }
    const loss = (w, b) => { let l = 0; for (let i = 0; i < n; i++) { const e = w * xs[i] + b - ys[i]; l += e * e; } return l / n; };
    const cycle = 6, hold = 1.2;
    return start(canvas, (ctx, w, h, t) => {
      const pad = 30, m = fitMap(w, h, pad, -0.05, 1.05, 0, 2.6);
      const tt = t % (cycle + hold);
      const prog = clamp(tt / cycle, 0, 1);
      const k = Math.floor(easeInOut(prog) * (traj.length - 1));
      const { w: ww, b: bb } = traj[k];
      for (let i = 0; i < n; i++) { const p = m(xs[i], ys[i]); dot(ctx, p[0], p[1], 4, C.muted); }
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      let a = m(0, bb), b2 = m(1, ww + bb);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
      label(ctx, "epoch " + k + "/" + (traj.length - 1), pad, pad - 14, C.muted, "left", 12);
      label(ctx, "w=" + ww.toFixed(2) + "  b=" + bb.toFixed(2) + "  loss=" + loss(ww, bb).toFixed(3),
        w - pad, pad - 14, C.text, "right", 12);
    });
  };

  /* ---------------- 8. perceptron decision boundary (AND) ---------------- */
  VIZ["ml-perceptron"] = (canvas) => {
    const pts = [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]];
    const cycle = 5, hold = 1.2;
    return start(canvas, (ctx, w, h, t) => {
      const pad = 40, m = fitMap(w, h, pad, -0.3, 1.3, -0.3, 1.3);
      // boundary endpoints: start (x≈0.2 vertical) -> final (x+y=1.5)
      const tt = t % (cycle + hold), e = easeInOut(clamp(tt / cycle, 0, 1));
      const A = [lerp(0.2, 0.5, e), lerp(-0.3, 1.0, e)];
      const B = [lerp(0.2, 1.0, e), lerp(1.3, 0.5, e)];
      // shade positive (class 1) side lightly when converged
      ctx.fillStyle = "rgba(74,222,128," + (0.06 + 0.06 * e) + ")";
      const pA = m(A[0], A[1]), pB = m(B[0], B[1]);
      ctx.beginPath();
      ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pB[0], pB[1]);
      ctx.lineTo(m(1.3, 1.3)[0], m(1.3, 1.3)[1]); ctx.lineTo(m(1.3, -0.3)[0], m(1.3, -0.3)[1]);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pB[0], pB[1]); ctx.stroke();
      pts.forEach(([x, y, c]) => {
        const p = m(x, y);
        dot(ctx, p[0], p[1], 8, c ? C.good : C.bad);
        label(ctx, c ? "1" : "0", p[0], p[1] - 16, C.muted, "center", 11);
      });
      label(ctx, "perceptron learns the AND boundary", pad, pad - 18, C.muted, "left", 12);
    });
  };

  /* ---------------- 9. k-means clustering ---------------- */
  VIZ["ml-kmeans-numpy"] = (canvas) => {
    const r = rng(42), pts = [];
    for (let i = 0; i < 18; i++) pts.push([gauss(r) * 0.5 - 1.3, gauss(r) * 0.5 - 1.0]);
    for (let i = 0; i < 18; i++) pts.push([gauss(r) * 0.5 + 1.4, gauss(r) * 0.5 + 1.2]);
    const r2 = rng(9);
    let cents = [pts[Math.floor(r2() * pts.length)].slice(), pts[Math.floor(r2() * pts.length)].slice()];
    const iters = [];
    for (let it = 0; it < 7; it++) {
      const labels = pts.map((p) => (dist2(p, cents[0]) <= dist2(p, cents[1]) ? 0 : 1));
      iters.push({ cents: cents.map((c) => c.slice()), labels });
      const acc = [[0, 0, 0], [0, 0, 0]];
      pts.forEach((p, i) => { const l = labels[i]; acc[l][0] += p[0]; acc[l][1] += p[1]; acc[l][2]++; });
      cents = acc.map((a, i) => (a[2] ? [a[0] / a[2], a[1] / a[2]] : cents[i]));
    }
    const SD = 1.1, PAUSE = 2, total = iters.length + PAUSE;
    return start(canvas, (ctx, w, h, t) => {
      const pad = 28, m = fitMap(w, h, pad, -3, 3, -3, 3);
      const f = (t / SD) % total;
      const k = Math.min(Math.floor(f), iters.length - 1);
      const ph = easeInOut(clamp(f - k, 0, 1));
      const cur = iters[k], nxt = iters[Math.min(k + 1, iters.length - 1)];
      pts.forEach((p, i) => { const s = m(p[0], p[1]); dot(ctx, s[0], s[1], 4, CLASS[cur.labels[i]]); });
      for (let c = 0; c < 2; c++) {
        const cx = lerp(cur.cents[c][0], nxt.cents[c][0], ph);
        const cy = lerp(cur.cents[c][1], nxt.cents[c][1], ph);
        const s = m(cx, cy);
        ctx.strokeStyle = CLASS[c]; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(s[0] - 7, s[1]); ctx.lineTo(s[0] + 7, s[1]);
        ctx.moveTo(s[0], s[1] - 7); ctx.lineTo(s[0], s[1] + 7); ctx.stroke();
        dot(ctx, s[0], s[1], 3, "#fff");
      }
      label(ctx, "iteration " + (k + 1) + " — assign + move centroids ✕", pad, pad - 12, C.muted, "left", 12);
    });
  };

  /* ---------------- 10. Iris classification (nearest centroid) ---------------- */
  VIZ["ml-sklearn-iris"] = (canvas) => {
    const centers = [[-1.4, -0.7], [0.1, 1.2], [1.5, -0.5]];
    const r = rng(21), groups = centers.map(() => []);
    centers.forEach((c, gi) => { for (let i = 0; i < 12; i++) groups[gi].push([c[0] + gauss(r) * 0.42, c[1] + gauss(r) * 0.42]); });
    return start(canvas, (ctx, w, h, t) => {
      const pad = 28, m = fitMap(w, h, pad, -3, 3, -2.6, 2.6);
      groups.forEach((g, gi) => g.forEach((p) => { const s = m(p[0], p[1]); dot(ctx, s[0], s[1], 3.5, CLASS[gi]); }));
      // roaming query, classified by nearest centroid
      const q = [1.9 * Math.sin(t * 0.5), 1.7 * Math.sin(t * 0.73)];
      let best = 0, bd = Infinity;
      centers.forEach((c, i) => { const d = dist2(q, c); if (d < bd) { bd = d; best = i; } });
      const qs = m(q[0], q[1]), cs = m(centers[best][0], centers[best][1]);
      ctx.strokeStyle = CLASS[best]; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(qs[0], qs[1]); ctx.lineTo(cs[0], cs[1]); ctx.stroke(); ctx.setLineDash([]);
      dot(ctx, qs[0], qs[1], 7, "#fff");
      dot(ctx, qs[0], qs[1], 4.5, CLASS[best]);
      label(ctx, "new sample → class " + best + " (nearest)", pad, pad - 12, C.muted, "left", 12);
    });
  };

  /* ---------------- 11. pandas groupby ---------------- */
  VIZ["ml-pandas-groupby"] = (canvas) => {
    const rows = [
      { s: 0, w: 4.1 }, { s: 1, w: 12.5 }, { s: 0, w: 3.8 }, { s: 1, w: 15.0 }, { s: 0, w: 4.6 },
    ];
    const names = ["cat", "dog"];
    return start(canvas, (ctx, w, h, t) => {
      const pad = 30, cycle = 6.5, tt = (t % cycle) / cycle;
      const fly = easeInOut(clamp((tt - 0.15) / 0.4, 0, 1));
      const grow = easeInOut(clamp((tt - 0.6) / 0.35, 0, 1));
      const colX = [w * 0.32, w * 0.68];
      const groups = [[], []];
      rows.forEach((r) => groups[r.s].push(r));
      const baseY = pad + 6;
      // chips fly from a top row into two buckets
      const counts = [0, 0];
      rows.forEach((r, i) => {
        const startX = pad + 18 + i * ((w - 2 * pad - 36) / (rows.length - 1));
        const stackIdx = groups[r.s].indexOf(r);
        const tgtX = colX[r.s];
        const tgtY = h - pad - 24 - stackIdx * 26;
        const x = lerp(startX, tgtX, fly), y = lerp(baseY, tgtY, fly);
        ctx.fillStyle = CLASS[r.s];
        ctx.beginPath();
        const rad = 9;
        ctx.arc(x, y, rad, 0, TAU); ctx.fill();
        label(ctx, r.w.toFixed(1), x, y, "#0b0d13", "center", 9);
      });
      // mean bars
      for (let g = 0; g < 2; g++) {
        const mean = groups[g].reduce((a, r) => a + r.w, 0) / groups[g].length;
        const bh = (mean / 16) * (h - 2 * pad) * grow;
        const bx = colX[g] - 26;
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(bx, h - pad - bh, 52, bh);
        ctx.strokeStyle = CLASS[g]; ctx.lineWidth = 2;
        ctx.strokeRect(bx, h - pad - bh, 52, bh);
        if (grow > 0.1) label(ctx, "avg " + mean.toFixed(1), colX[g], h - pad - bh - 10, C.text, "center", 11);
        label(ctx, names[g], colX[g], h - pad + 12, C.muted, "center", 11);
      }
      label(ctx, "groupby('species').mean()", pad, pad - 14, C.muted, "left", 12);
    });
  };

  /* ---------------- 12. k-Nearest Neighbors ---------------- */
  VIZ["ml-knn-scratch"] = (canvas) => {
    const A = [[1, 1], [1, 2], [2, 1], [1.6, 1.6], [2.2, 1.3]];
    const B = [[6, 6], [6, 5], [5, 6], [5.4, 5.4], [6.3, 5.7]];
    const pts = A.map((p) => ({ p, c: 0 })).concat(B.map((p) => ({ p, c: 1 })));
    const K = 3;
    return start(canvas, (ctx, w, h, t) => {
      const pad = 30, m = fitMap(w, h, pad, 0, 7.5, 0, 7.5);
      const q = [3.7 + 2.4 * Math.sin(t * 0.35), 3.7 + 2.4 * Math.sin(t * 0.35 + 1.6)];
      const sorted = pts.map((o) => ({ o, d: Math.sqrt(dist2(q, o.p)) })).sort((a, b) => a.d - b.d);
      const k3 = sorted.slice(0, K);
      const radius = k3[K - 1].d;
      // capture circle (grow within each ~2.4s pulse)
      const pulse = easeInOut(saw(t, 2.4));
      const qs = m(q[0], q[1]);
      const rPix = (m(q[0] + radius, q[1])[0] - qs[0]) * pulse;
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(qs[0], qs[1], Math.abs(rPix), 0, TAU); ctx.stroke();
      pts.forEach((o) => { const s = m(o.p[0], o.p[1]); dot(ctx, s[0], s[1], 4.5, CLASS[o.c]); });
      // lines to k nearest once circle has grown
      let votes = [0, 0];
      k3.forEach((nb) => {
        votes[nb.o.c]++;
        if (pulse > 0.9) {
          const s = m(nb.o.p[0], nb.o.p[1]);
          ctx.strokeStyle = CLASS[nb.o.c]; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(qs[0], qs[1]); ctx.lineTo(s[0], s[1]); ctx.stroke();
        }
      });
      const pick = votes[0] >= votes[1] ? 0 : 1;
      dot(ctx, qs[0], qs[1], 8, "#fff");
      dot(ctx, qs[0], qs[1], 5, pulse > 0.9 ? CLASS[pick] : C.muted);
      label(ctx, "k=" + K + " nearest → vote: " + votes[0] + " vs " + votes[1], pad, pad - 14, C.muted, "left", 12);
    });
  };

  /* ---------------- 13. vectors: dot product & angle ---------------- */
  VIZ["math-vectors"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const cx = w * 0.42, cy = h * 0.6, scale = Math.min(w, h) * 0.32;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - scale, cy); ctx.lineTo(cx + scale, cy);
      ctx.moveTo(cx, cy - scale); ctx.lineTo(cx, cy + scale); ctx.stroke();
      const A = [Math.cos(0.5), Math.sin(0.5)];
      const ang = 0.5 + (Math.sin(t * 0.45) * 1.0 + 1.1);
      const B = [Math.cos(ang), Math.sin(ang)];
      const cos = A[0] * B[0] + A[1] * B[1];
      arrow(ctx, cx, cy, cx + A[0] * scale, cy - A[1] * scale, C.accent, 3);
      arrow(ctx, cx, cy, cx + B[0] * scale, cy - B[1] * scale, C.good, 3);
      label(ctx, "a", cx + A[0] * scale + 6, cy - A[1] * scale, C.accent, "left", 13);
      label(ctx, "b", cx + B[0] * scale + 6, cy - B[1] * scale, C.good, "left", 13);
      label(ctx, "cos θ = " + cos.toFixed(2), 16, 18, C.text, "left", 13);
      label(ctx, cos > 0.7 ? "aligned" : cos < 0 ? "opposed" : "orthogonal-ish", 16, 36, C.muted, "left", 11);
    });

  /* ---------------- 14. feature scaling ---------------- */
  VIZ["data-scaling"] = (canvas) => {
    const raw = [10, 38, 55, 72, 95];
    return start(canvas, (ctx, w, h, t) => {
      const pad = 42, y1 = h * 0.36, y2 = h * 0.72;
      const tt = easeInOut((Math.sin(t * 0.6) + 1) / 2);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, y1); ctx.lineTo(w - pad, y1);
      ctx.moveTo(pad, y2); ctx.lineTo(w - pad, y2); ctx.stroke();
      label(ctx, "raw values (0–100)", pad, y1 - 22, C.muted, "left", 11);
      label(ctx, "min-max scaled (0–1)", pad, y2 - 22, C.good, "left", 11);
      const rmin = Math.min.apply(null, raw), rmax = Math.max.apply(null, raw);
      raw.forEach((v) => {
        const xRaw = pad + (v / 100) * (w - 2 * pad);
        const xScaled = pad + ((v - rmin) / (rmax - rmin)) * (w - 2 * pad);
        const x = lerp(xRaw, xScaled, tt), y = lerp(y1, y2, tt);
        dot(ctx, x, y, 6, tt > 0.5 ? C.good : C.accent);
        label(ctx, String(v), xRaw, y1 + 18, C.muted, "center", 10);
      });
    });
  };

  /* ---------------- 15. PCA projection ---------------- */
  VIZ["ml-pca"] = (canvas) => {
    const r = rng(5), pts = [], th = 0.6;
    for (let i = 0; i < 40; i++) {
      const a = gauss(r) * 1.7, b = gauss(r) * 0.4;
      pts.push([a * Math.cos(th) - b * Math.sin(th), a * Math.sin(th) + b * Math.cos(th)]);
    }
    const dir = [Math.cos(th), Math.sin(th)];
    return start(canvas, (ctx, w, h, t) => {
      const pad = 28, m = fitMap(w, h, pad, -4, 4, -4, 4);
      const proj = easeInOut(saw(t, 5));
      const e1 = m(dir[0] * 4, dir[1] * 4), e2 = m(-dir[0] * 4, -dir[1] * 4);
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(e2[0], e2[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke();
      pts.forEach((p) => {
        const d = p[0] * dir[0] + p[1] * dir[1];
        const cur = [lerp(p[0], dir[0] * d, proj), lerp(p[1], dir[1] * d, proj)];
        const s = m(cur[0], cur[1]); dot(ctx, s[0], s[1], 3.5, C.accent);
      });
      label(ctx, "projecting 2D → 1st principal component", pad, pad - 12, C.muted, "left", 12);
    });
  };

  /* ---------------- 16. activation functions ---------------- */
  VIZ["nn-activations"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const pad = 30, m = fitMap(w, h, pad, -3, 3, -1.2, 3);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      const z = m(0, 0);
      ctx.beginPath();
      ctx.moveTo(m(-3, 0)[0], z[1]); ctx.lineTo(m(3, 0)[0], z[1]);
      ctx.moveTo(z[0], m(0, -1.2)[1]); ctx.lineTo(z[0], m(0, 3)[1]); ctx.stroke();
      const fns = [
        ["relu", C.accent, (x) => Math.max(0, x)],
        ["sigmoid", C.good, (x) => 1 / (1 + Math.exp(-x))],
        ["tanh", C.pink, (x) => Math.tanh(x)],
      ];
      fns.forEach((f, i) => {
        ctx.strokeStyle = f[1]; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k <= 120; k++) {
          const x = -3 + (6 * k) / 120, p = m(x, f[2](x));
          k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.stroke();
        label(ctx, f[0], w - pad, pad - 8 + i * 14, f[1], "right", 11);
      });
      const x = 2.6 * Math.sin(t * 0.7);
      fns.forEach((f) => { const p = m(x, f[2](x)); dot(ctx, p[0], p[1], 4, f[1]); });
    });

  /* ---------------- 17. gradient descent (loss bowl) ---------------- */
  VIZ["nn-gradient-descent"] = (canvas) => {
    const traj = []; let x = -2.0;
    for (let i = 0; i <= 24; i++) { traj.push(x); x -= 0.16 * 2 * (x - 3); }
    const f = (x) => (x - 3) * (x - 3);
    return start(canvas, (ctx, w, h, t) => {
      const pad = 32, m = fitMap(w, h, pad, -3, 9, -1, 28);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const xx = -3 + (12 * k) / 120, p = m(xx, f(xx));
        k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
      const idx = Math.floor(saw(t, 4.5) * (traj.length - 1));
      const cx = traj[idx], p = m(cx, f(cx));
      dot(ctx, p[0], p[1], 6, C.good);
      label(ctx, "step " + idx + "   x=" + cx.toFixed(2) + "   loss=" + f(cx).toFixed(2), pad, pad - 14, C.text, "left", 12);
    });
  };

  /* ---------------- 18. cross-entropy loss ---------------- */
  VIZ["nn-cross-entropy"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const pad = 34, m = fitMap(w, h, pad, 0, 1, 0, 5);
      ctx.strokeStyle = C.bad; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let k = 1; k <= 130; k++) {
        const p = k / 131, y = Math.min(5, -Math.log(p)), s = m(p, y);
        k === 1 ? ctx.moveTo(s[0], s[1]) : ctx.lineTo(s[0], s[1]);
      }
      ctx.stroke();
      const p = 0.5 + 0.47 * Math.sin(t * 0.7), y = Math.min(5, -Math.log(p)), s = m(p, y);
      dot(ctx, s[0], s[1], 5, C.good);
      label(ctx, "loss = -log(p)    p=" + p.toFixed(2) + "   loss=" + y.toFixed(2), pad, pad - 14, C.text, "left", 12);
      label(ctx, "confident & wrong → loss explodes", pad, h - 12, C.muted, "left", 11);
    });

  /* ---------------- 19. cosine similarity (embeddings) ---------------- */
  VIZ["nlp-cosine"] = (canvas) =>
    start(canvas, (ctx, w, h, t) => {
      const cx = w * 0.3, cy = h * 0.58, scale = Math.min(w, h) * 0.3;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - scale, cy); ctx.lineTo(cx + scale, cy);
      ctx.moveTo(cx, cy - scale); ctx.lineTo(cx, cy + scale); ctx.stroke();
      const A = [Math.cos(0.6), Math.sin(0.6)];
      const ang = 0.6 + (Math.sin(t * 0.5) * 0.95 + 0.95);
      const B = [Math.cos(ang), Math.sin(ang)];
      const cos = A[0] * B[0] + A[1] * B[1];
      arrow(ctx, cx, cy, cx + A[0] * scale, cy - A[1] * scale, C.accent, 3);
      arrow(ctx, cx, cy, cx + B[0] * scale, cy - B[1] * scale, C.good, 3);
      label(ctx, "king", cx + A[0] * scale + 4, cy - A[1] * scale, C.accent, "left", 11);
      label(ctx, "word", cx + B[0] * scale + 4, cy - B[1] * scale, C.good, "left", 11);
      const bx = w * 0.72, bw = w * 0.18, by = h * 0.28, bh = h * 0.44;
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
      const fill = (cos + 1) / 2;
      ctx.fillStyle = cos > 0.6 ? C.good : cos > 0 ? C.warn : C.bad;
      ctx.fillRect(bx, by + bh * (1 - fill), bw, bh * fill);
      label(ctx, "similarity", bx + bw / 2, by - 12, C.muted, "center", 11);
      label(ctx, cos.toFixed(2), bx + bw / 2, by + bh + 14, C.text, "center", 13);
    });

  /* ---------------- 20. self-attention heatmap ---------------- */
  VIZ["nlp-attention"] = (canvas) => {
    const toks = ["The", "cat", "sat", "down"], n = toks.length;
    const r = rng(2), base = [];
    for (let i = 0; i < n; i++) { base.push([]); for (let j = 0; j < n; j++) base[i].push(gauss(r)); }
    return start(canvas, (ctx, w, h, t) => {
      const top = 28, leftLbl = 44;
      const grid = Math.min(w - leftLbl - 16, h - top - 26);
      const cell = grid / n, ox = leftLbl, oy = top;
      for (let i = 0; i < n; i++) {
        const row = base[i].map((v, j) => v + 0.8 * Math.sin(t * 0.6 + i + j));
        const mx = Math.max.apply(null, row);
        const e = row.map((v) => Math.exp(v - mx));
        const sm = e.reduce((a, b) => a + b, 0);
        const ws = e.map((v) => v / sm);
        for (let j = 0; j < n; j++) {
          ctx.fillStyle = "rgba(110,168,254," + (0.1 + 0.85 * ws[j]) + ")";
          ctx.fillRect(ox + j * cell, oy + i * cell, cell - 2, cell - 2);
          if (ws[j] > 0.28) label(ctx, ws[j].toFixed(2), ox + j * cell + cell / 2, oy + i * cell + cell / 2, "#0b0d13", "center", 10);
        }
        label(ctx, toks[i], ox - 6, oy + i * cell + cell / 2, C.muted, "right", 11);
        label(ctx, toks[i], ox + i * cell + cell / 2, oy + n * cell + 12, C.muted, "center", 10);
      }
      label(ctx, "attention weights — each row sums to 1", ox, 12, C.muted, "left", 11);
    });
  };

  /* ---------------- 21. temperature sampling ---------------- */
  VIZ["llm-temperature"] = (canvas) => {
    const logits = [2.0, 1.2, 0.8, 0.4, 0.1];
    return start(canvas, (ctx, w, h, t) => {
      const temp = 0.3 + 1.7 * ((Math.sin(t * 0.5) + 1) / 2);
      const z = logits.map((v) => v / temp);
      const mx = Math.max.apply(null, z);
      const e = z.map((v) => Math.exp(v - mx));
      const s = e.reduce((a, b) => a + b, 0);
      const p = e.map((v) => v / s);
      const pad = 34, n = logits.length, gap = 14;
      const bw = (w - 2 * pad - gap * (n - 1)) / n;
      p.forEach((pi, i) => {
        const bh = pi * (h - 2 * pad), x = pad + i * (bw + gap), y = h - pad - bh;
        ctx.fillStyle = C.purple; ctx.fillRect(x, y, bw, bh);
        label(ctx, (pi * 100).toFixed(0) + "%", x + bw / 2, y - 8, C.text, "center", 10);
      });
      const note = temp < 0.7 ? "  (focused)" : temp > 1.4 ? "  (creative)" : "";
      label(ctx, "temperature = " + temp.toFixed(2) + note, pad, pad - 14, C.text, "left", 12);
    });
  };

  /* ---------------- 22. merge sort ---------------- */
  VIZ["algo-merge-sort"] = (canvas) => {
    const base = [5, 2, 8, 1, 9, 3, 7, 4];
    const steps = [];
    (function build() {
      const a = base.slice(), n = a.length;
      for (let wdt = 1; wdt < n; wdt *= 2) {
        for (let lo = 0; lo < n; lo += 2 * wdt) {
          const mid = Math.min(lo + wdt, n), hi = Math.min(lo + 2 * wdt, n);
          const merged = [];
          let i = lo, j = mid;
          while (i < mid && j < hi) merged.push(a[i] <= a[j] ? a[i++] : a[j++]);
          while (i < mid) merged.push(a[i++]);
          while (j < hi) merged.push(a[j++]);
          for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];
          if (hi - lo > 1) steps.push({ state: a.slice(), lo, hi: hi - 1 });
        }
      }
    })();
    const SD = 0.8, PAUSE = 3, total = steps.length + PAUSE;
    return start(canvas, (ctx, w, h, t) => {
      const n = base.length, pad = 26, gap = 8;
      const idx = Math.min(Math.floor((t / SD) % total), steps.length - 1);
      const st = steps[idx];
      const bw = (w - 2 * pad - gap * (n - 1)) / n;
      const maxv = Math.max.apply(null, base);
      for (let p = 0; p < n; p++) {
        const v = st.state[p];
        const bh = (v / maxv) * (h - 2 * pad);
        const x = pad + p * (bw + gap), y = h - pad - bh;
        const active = p >= st.lo && p <= st.hi;
        ctx.fillStyle = idx >= steps.length - 1 ? C.good : active ? C.warn : C.accent;
        ctx.fillRect(x, y, bw, bh);
        label(ctx, String(v), x + bw / 2, y - 8, C.text, "center", 11);
      }
      label(ctx, idx >= steps.length - 1 ? "sorted ✓" : "merging two sorted runs…", pad, pad - 12, C.muted, "left", 12);
    });
  };

  /* ---------------- 23. recursion + memoization (Fibonacci) ---------------- */
  VIZ["algo-recursion-memo"] = (canvas) => {
    const fibs = [];
    for (let i = 0, a = 0, b = 1; i < 10; i++) { fibs.push(a); const n = a + b; a = b; b = n; }
    const maxv = fibs[fibs.length - 1];
    const cycle = 5.5;
    return start(canvas, (ctx, w, h, t) => {
      const n = fibs.length, pad = 30, gap = 8;
      const tt = t % cycle;
      const bw = (w - 2 * pad - gap * (n - 1)) / n;
      const cur = Math.floor(tt / 0.45);
      for (let i = 0; i < n; i++) {
        const grow = clamp((tt - i * 0.45) / 0.5, 0, 1);
        if (grow <= 0) continue;
        const bh = Math.max(2, (fibs[i] / maxv) * (h - 2 * pad) * easeInOut(grow));
        const x = pad + i * (bw + gap), y = h - pad - bh;
        const isCur = i === cur && cur < n;
        ctx.fillStyle = isCur ? C.warn : i === cur - 1 || i === cur - 2 ? C.good : C.accent;
        ctx.fillRect(x, y, bw, bh);
        label(ctx, String(fibs[i]), x + bw / 2, y - 8, C.text, "center", 10);
      }
      label(ctx, "fib(i) = fib(i-1) + fib(i-2)  — each cached, built up once", pad, pad - 12, C.muted, "left", 12);
    });
  };

  /* ---------------- 24. dynamic programming (coin change table) ---------------- */
  VIZ["algo-dynamic-programming"] = (canvas) => {
    const coins = [1, 3, 4], amount = 10, INF = 999;
    const dp = [0];
    for (let i = 1; i <= amount; i++) dp.push(INF);
    const snaps = [];
    for (let a = 1; a <= amount; a++) {
      let best = INF, fromCoin = -1;
      for (const c of coins) if (c <= a && dp[a - c] + 1 < best) { best = dp[a - c] + 1; fromCoin = c; }
      dp[a] = best;
      snaps.push({ a, dp: dp.slice(), fromCoin });
    }
    const SD = 0.6, PAUSE = 3, total = snaps.length + PAUSE;
    return start(canvas, (ctx, w, h, t) => {
      const n = amount + 1, pad = 26, gap = 5;
      const idx = Math.min(Math.floor((t / SD) % total), snaps.length - 1);
      const snap = snaps[idx];
      const cw = (w - 2 * pad - gap * (n - 1)) / n;
      const cy = h / 2, ch = Math.min(40, cw * 1.3);
      for (let i = 0; i < n; i++) {
        const filled = i <= snap.a;
        const x = pad + i * (cw + gap);
        const isCur = i === snap.a;
        const isSrc = snap.fromCoin > 0 && i === snap.a - snap.fromCoin;
        ctx.fillStyle = isCur ? "#3a2f1a" : isSrc ? "#16291b" : filled ? "#222a3a" : "#171a23";
        ctx.strokeStyle = isCur ? C.warn : isSrc ? C.good : C.grid;
        ctx.lineWidth = isCur || isSrc ? 2 : 1;
        ctx.fillRect(x, cy - ch / 2, cw, ch);
        ctx.strokeRect(x, cy - ch / 2, cw, ch);
        const val = filled ? (snap.dp[i] >= INF ? "∞" : String(snap.dp[i])) : "";
        label(ctx, val, x + cw / 2, cy, filled ? C.text : C.muted, "center", 12);
        label(ctx, String(i), x + cw / 2, cy + ch / 2 + 12, C.muted, "center", 9);
      }
      label(ctx, "dp[a] = fewest coins for amount a  (coins: 1, 3, 4)", pad, pad - 10, C.muted, "left", 12);
    });
  };

  /* ---------------- 25. stack & queue ---------------- */
  VIZ["algo-stack-queue"] = (canvas) => {
    const frames = [
      { s: [1], q: [1], note: "push / enqueue 1" },
      { s: [1, 2], q: [1, 2], note: "push / enqueue 2" },
      { s: [1, 2, 3], q: [1, 2, 3], note: "push / enqueue 3" },
      { s: [1, 2], q: [2, 3], note: "stack pops 3 (top) · queue removes 1 (front)" },
      { s: [1, 2, 4], q: [2, 3, 4], note: "push / enqueue 4" },
      { s: [1, 2], q: [3, 4], note: "stack pops 4 · queue removes 2" },
      { s: [1], q: [4], note: "stack pops 2 · queue removes 3" },
    ];
    const SD = 1.1, total = frames.length + 2;
    return start(canvas, (ctx, w, h, t) => {
      const idx = Math.min(Math.floor((t / SD) % total), frames.length - 1);
      const f = frames[idx];
      const bw = 64, bh = 30;
      // Stack (left): vertical, top = last element
      const sx = w * 0.26;
      label(ctx, "Stack — LIFO", sx, 26, C.accent, "center", 12);
      f.s.forEach((v, i) => {
        const y = h - 44 - i * (bh + 6);
        const top = i === f.s.length - 1;
        ctx.fillStyle = top ? C.warn : C.accent;
        ctx.fillRect(sx - bw / 2, y - bh, bw, bh);
        label(ctx, String(v), sx, y - bh / 2, "#0b0d13", "center", 12);
      });
      if (f.s.length) label(ctx, "top", sx + bw / 2 + 16, h - 44 - (f.s.length - 1) * (bh + 6) - bh / 2, C.muted, "left", 10);
      // Queue (right): horizontal, front (removed) on the left
      const qy = h * 0.58, qx0 = w * 0.55;
      label(ctx, "Queue — FIFO", w * 0.74, 26, C.good, "center", 12);
      f.q.forEach((v, i) => {
        const x = qx0 + i * (bw + 6);
        ctx.fillStyle = i === 0 ? C.warn : C.good;
        ctx.fillRect(x, qy - bh / 2, bw, bh);
        label(ctx, String(v), x + bw / 2, qy, "#0b0d13", "center", 12);
      });
      if (f.q.length) {
        label(ctx, "front", qx0 + bw / 2, qy + bh / 2 + 12, C.muted, "center", 10);
        label(ctx, "back", qx0 + (f.q.length - 1) * (bw + 6) + bw / 2, qy - bh / 2 - 12, C.muted, "center", 10);
      }
      label(ctx, f.note, w / 2, h - 14, C.muted, "center", 11);
    });
  };

  /* ---------------- 26. tree traversal (BFS & DFS) ---------------- */
  VIZ["algo-tree-traversal"] = (canvas) => {
    const pos = {
      1: [0.5, 0.16], 2: [0.3, 0.5], 3: [0.72, 0.5],
      4: [0.16, 0.84], 5: [0.42, 0.84], 6: [0.72, 0.84],
    };
    const edges = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6]];
    const bfs = [1, 2, 3, 4, 5, 6];
    const dfs = [1, 2, 4, 5, 3, 6];
    const SD = 0.6, GAP = 2;
    const phaseLen = bfs.length + GAP;
    const total = phaseLen * 2;
    return start(canvas, (ctx, w, h, t) => {
      const pad = 30;
      const m = (id) => [pad + pos[id][0] * (w - 2 * pad), pad + pos[id][1] * (h - 2 * pad)];
      const f = (t / SD) % total;
      const isBfs = f < phaseLen;
      const order = isBfs ? bfs : dfs;
      const step = Math.floor(isBfs ? f : f - phaseLen);
      const visited = order.slice(0, Math.min(step + 1, order.length));
      // edges
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5;
      edges.forEach(([a, b]) => { const pa = m(a), pb = m(b); ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); });
      // nodes
      Object.keys(pos).forEach((id) => {
        const p = m(+id);
        const vi = visited.indexOf(+id);
        const isCurrent = vi === visited.length - 1 && step < order.length;
        dot(ctx, p[0], p[1], 16, vi >= 0 ? (isCurrent ? C.warn : C.good) : "#222a3a");
        ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p[0], p[1], 16, 0, TAU); ctx.stroke();
        label(ctx, id, p[0], p[1], vi >= 0 ? "#0b0d13" : C.muted, "center", 13);
      });
      label(ctx, (isBfs ? "BFS (level by level): " : "DFS (deepest first): ") + visited.join(" → "), pad, pad - 14, isBfs ? C.accent : C.pink, "left", 12);
    });
  };

  /* ---------------- 27. two-sum with a hash map ---------------- */
  VIZ["algo-two-sum"] = (canvas) => {
    const nums = [2, 7, 11, 15], target = 9;
    const steps = [];
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
      const need = target - nums[i];
      const found = need in seen;
      steps.push({ i, seenKeys: Object.keys(seen).map(Number), found, partner: found ? seen[need] : -1, need });
      if (found) break;
      seen[nums[i]] = i;
    }
    const SD = 1.4, PAUSE = 3, total = steps.length + PAUSE;
    return start(canvas, (ctx, w, h, t) => {
      const n = nums.length, pad = 36, gap = 14;
      const idx = Math.min(Math.floor((t / SD) % total), steps.length - 1);
      const st = steps[idx];
      const cw = (w - 2 * pad - gap * (n - 1)) / n;
      const cy = h * 0.42, ch = Math.min(54, cw);
      for (let k = 0; k < n; k++) {
        const x = pad + k * (cw + gap);
        const isCur = k === st.i && !st.found;
        const isPair = st.found && (k === st.i || k === st.partner);
        ctx.fillStyle = isPair ? "#16291b" : isCur ? "#3a2f1a" : "#222a3a";
        ctx.strokeStyle = isPair ? C.good : isCur ? C.warn : C.grid;
        ctx.lineWidth = isPair || isCur ? 2.5 : 1;
        ctx.fillRect(x, cy - ch / 2, cw, ch); ctx.strokeRect(x, cy - ch / 2, cw, ch);
        label(ctx, String(nums[k]), x + cw / 2, cy, C.text, "center", 14);
        label(ctx, "[" + k + "]", x + cw / 2, cy + ch / 2 + 12, C.muted, "center", 9);
      }
      if (st.found) {
        const a = m(st.partner), b = m(st.i);
        ctx.strokeStyle = C.good; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a, cy - ch / 2 - 6); ctx.lineTo(b, cy - ch / 2 - 6); ctx.stroke();
        label(ctx, "found! " + nums[st.partner] + " + " + nums[st.i] + " = " + target, pad, pad - 16, C.good, "left", 12);
      } else {
        label(ctx, "target = " + target + "  ·  need " + st.need + " for nums[" + st.i + "]=" + nums[st.i], pad, pad - 16, C.muted, "left", 12);
      }
      function m(k) { return pad + k * (cw + gap) + cw / 2; }
      label(ctx, "seen so far: { " + st.seenKeys.join(", ") + " }", pad, h - 16, C.accent, "left", 12);
    });
  };

  /* ================= shared builders for the remaining topics ================= */
  function plot(ctx, m, fn, x0, x1, color, lw) {
    ctx.strokeStyle = color; ctx.lineWidth = lw || 2; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const x = x0 + ((x1 - x0) * i) / 120, p = m(x, fn(x)); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke();
  }
  function axes(ctx, m, x0, x1, y0, y1) {
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    const o = m(0, 0); ctx.beginPath();
    ctx.moveTo(m(x0, 0)[0], o[1]); ctx.lineTo(m(x1, 0)[0], o[1]);
    ctx.moveTo(o[0], m(0, y0)[1]); ctx.lineTo(o[0], m(0, y1)[1]); ctx.stroke();
  }
  function lineSeg(ctx, m, x0, y0, x1, y1, color, lw, dash) {
    ctx.strokeStyle = color; ctx.lineWidth = lw || 2; if (dash) ctx.setLineDash(dash);
    const a = m(x0, y0), b = m(x1, y1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    if (dash) ctx.setLineDash([]);
  }
  function blobs(seed, specs) {
    const r = rng(seed), pts = [];
    specs.forEach((s) => { for (let i = 0; i < s.n; i++) pts.push({ x: s.cx + gauss(r) * (s.sd || 0.5), y: s.cy + gauss(r) * (s.sd || 0.5), c: s.cls }); });
    return pts;
  }
  function classifierViz(canvas, opts) {
    const pts = blobs(opts.seed, opts.specs);
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 28, -3, 3, -3, 3);
      if (opts.boundary) opts.boundary(ctx, m, t);
      pts.forEach((p) => { const s = m(p.x, p.y); dot(ctx, s[0], s[1], 4, CLASS[p.c]); });
      label(ctx, opts.title, 28, 18, C.muted, "left", 12);
    });
  }
  function networkViz(canvas, sizes, opts) {
    opts = opts || {};
    return start(canvas, (ctx, w, h, t) => {
      const pad = 46, L = sizes.length;
      const colX = (i) => pad + (i * (w - 2 * pad)) / (L - 1);
      const nodeY = (i, k) => h / 2 + (k - (sizes[i] - 1) / 2) * Math.min(32, (h - 70) / sizes[i]);
      ctx.strokeStyle = "#262b38"; ctx.lineWidth = 1;
      for (let i = 0; i < L - 1; i++) for (let a = 0; a < sizes[i]; a++) for (let b = 0; b < sizes[i + 1]; b++) { ctx.beginPath(); ctx.moveTo(colX(i), nodeY(i, a)); ctx.lineTo(colX(i + 1), nodeY(i + 1, b)); ctx.stroke(); }
      const tt = saw(t, opts.back ? 3 : 2.4);
      const active = opts.back ? L - 1 - Math.floor(tt * L) : Math.floor(tt * L);
      for (let i = 0; i < L; i++) for (let k = 0; k < sizes[i]; k++) dot(ctx, colX(i), nodeY(i, k), 10, i === active ? (opts.back ? C.warn : C.accent) : "#2a3040");
      if (opts.labels) opts.labels.forEach((lb, i) => label(ctx, lb, colX(i), h - 12, C.muted, "center", 10));
      label(ctx, opts.title, pad, 18, C.muted, "left", 12);
    });
  }
  function lossCurveViz(canvas, title) {
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 34, 0, 1, 0, 1), loss = (x) => 0.05 + 0.9 * Math.exp(-3.5 * x);
      axes(ctx, m, 0, 1, 0, 1);
      plot(ctx, m, loss, 0, 1, C.accent, 2.5);
      const x = easeInOut(saw(t, 4)), p = m(x, loss(x));
      dot(ctx, p[0], p[1], 5, C.good);
      label(ctx, "epoch " + Math.round(x * 100) + "  ·  loss ↓ " + loss(x).toFixed(2), 34, 20, C.text, "left", 12);
      label(ctx, title, 34, h - 12, C.muted, "left", 11);
    });
  }
  function tensorGridViz(canvas, opLabel, result) {
    const A = [[1, 2], [3, 4]];
    return start(canvas, (ctx, w, h, t) => {
      const cs = Math.min(42, (h - 80) / 2);
      const drawM = (M, ox, oy, col) => { for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const x = ox + c * cs, y = oy + r * cs; ctx.fillStyle = "#1d212c"; ctx.strokeStyle = col; ctx.fillRect(x, y, cs - 2, cs - 2); ctx.strokeRect(x, y, cs - 2, cs - 2); label(ctx, String(M[r][c]), x + cs / 2 - 1, y + cs / 2, C.text, "center", 13); } };
      const cy = h / 2 - cs;
      drawM(A, 44, cy, C.accent);
      label(ctx, opLabel, 44 + 2 * cs + 12, h / 2, C.muted, "center", 15);
      drawM(result, 44 + 2 * cs + 38, cy, C.good);
      label(ctx, "a tensor is like a NumPy array", 44, 20, C.muted, "left", 12);
    });
  }
  function probBarsViz(canvas, probs, labels, title) {
    const best = probs.indexOf(Math.max.apply(null, probs));
    return start(canvas, (ctx, w, h, t) => {
      const n = probs.length, pad = 34, gap = 16, bw = (w - 2 * pad - gap * (n - 1)) / n;
      const grow = easeInOut(clamp(saw(t, 3.5) / 0.6, 0, 1));
      probs.forEach((p, i) => { const bh = p * (h - 2 * pad) * grow; const x = pad + i * (bw + gap), y = h - pad - bh; ctx.fillStyle = i === best ? C.good : C.accent; ctx.fillRect(x, y, bw, bh); label(ctx, (p * 100).toFixed(0) + "%", x + bw / 2, y - 8, C.text, "center", 11); label(ctx, labels[i], x + bw / 2, h - pad + 12, C.muted, "center", 10); });
      label(ctx, title, pad, 18, C.muted, "left", 12);
    });
  }
  function heatmapViz(canvas, rows, cols, valFn, rowLabels, colLabels, title) {
    return start(canvas, (ctx, w, h, t) => {
      const top = 30, left = 70, grid = Math.min(w - left - 16, h - top - 30), cw = grid / cols, ch = Math.min(grid / rows, 38);
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const v = clamp(valFn(i, j, t), 0, 1); ctx.fillStyle = "rgba(110,168,254," + (0.08 + 0.88 * v) + ")"; ctx.fillRect(left + j * cw, top + i * ch, cw - 2, ch - 2); }
      if (rowLabels) for (let i = 0; i < rows; i++) label(ctx, rowLabels[i], left - 6, top + i * ch + ch / 2, C.muted, "right", 9);
      if (colLabels) for (let j = 0; j < cols; j++) label(ctx, colLabels[j], left + j * cw + cw / 2, top + rows * ch + 12, C.muted, "center", 9);
      label(ctx, title, left, 16, C.muted, "left", 11);
    });
  }
  function rowCells(ctx, vals, ox, oy, cw, ch, gap, colorFn) {
    vals.forEach((v, i) => { const x = ox + i * (cw + gap); ctx.fillStyle = colorFn ? colorFn(v, i) : "#222a3a"; ctx.strokeStyle = C.grid; ctx.fillRect(x, oy, cw, ch); ctx.strokeRect(x, oy, cw, ch); label(ctx, String(v), x + cw / 2, oy + ch / 2, C.text, "center", 12); });
  }
  const flow = (t, segs, period) => { const f = saw(t, period || 4) * segs; return { i: Math.floor(f), f: f - Math.floor(f) }; };

  /* ===== Start Here ===== */
  VIZ["start-here"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const steps = ["Read", "Type", "Run", "Repeat"], n = steps.length, pad = 64, cy = h / 2;
    const gx = (w - 2 * pad) / (n - 1), active = Math.floor(saw(t, 4) * n);
    for (let i = 0; i < n - 1; i++) { ctx.strokeStyle = C.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad + i * gx, cy); ctx.lineTo(pad + (i + 1) * gx, cy); ctx.stroke(); }
    for (let i = 0; i < n; i++) { const x = pad + i * gx, on = i <= active; dot(ctx, x, cy, on ? 17 : 12, on ? C.accent : "#222a3a"); label(ctx, String(i + 1), x, cy, on ? "#0b0d13" : C.muted, "center", 14); label(ctx, steps[i], x, cy + 36, on ? C.text : C.muted, "center", 12); }
    label(ctx, "your learning loop", pad, 28, C.muted, "left", 13);
  });

  /* ===== Python ===== */
  VIZ["py-dict-set"] = (canvas) => {
    const words = "the cat sat on the mat the cat".split(" "), uniq = [...new Set(words)];
    return start(canvas, (ctx, w, h, t) => {
      const upto = Math.floor(saw(t, 5) * words.length) + 1, counts = {};
      for (let i = 0; i < Math.min(upto, words.length); i++) counts[words[i]] = (counts[words[i]] || 0) + 1;
      const pad = 34, n = uniq.length, gap = 16, bw = (w - 2 * pad - gap * (n - 1)) / n;
      uniq.forEach((wd, i) => { const c = counts[wd] || 0, bh = (c / 3) * (h - 2 * pad), x = pad + i * (bw + gap), y = h - pad - bh; ctx.fillStyle = C.accent; ctx.fillRect(x, y, bw, bh); if (c > 0) label(ctx, String(c), x + bw / 2, y - 8, C.text, "center", 12); label(ctx, wd, x + bw / 2, h - pad + 12, C.muted, "center", 10); });
      label(ctx, "counting words → a dict of {word: count}", pad, 20, C.muted, "left", 12);
    });
  };
  VIZ["py-args-kwargs"] = (canvas) => {
    const items = [{ t: "1", k: 0 }, { t: "2", k: 0 }, { t: "3", k: 0 }, { t: "label=", k: 1 }, { t: "scale=2", k: 1 }];
    return start(canvas, (ctx, w, h, t) => {
      const fly = easeInOut(clamp((saw(t, 5) - 0.1) / 0.5, 0, 1)), argX = w * 0.3, kwX = w * 0.72; let ai = 0, ki = 0;
      label(ctx, "*args → tuple", argX, h - 20, C.accent, "center", 12);
      label(ctx, "**kwargs → dict", kwX, h - 20, C.good, "center", 12);
      items.forEach((it, i) => { const sx = 60 + (i * (w - 120)) / (items.length - 1), tgt = it.k === 0 ? argX : kwX, idx = it.k === 0 ? ai++ : ki++, ty = h * 0.4 + idx * 30, x = lerp(sx, tgt, fly), y = lerp(h * 0.18, ty, fly), bw = it.k === 0 ? 38 : 82; ctx.fillStyle = it.k === 0 ? C.accent : C.good; ctx.fillRect(x - bw / 2, y - 13, bw, 26); label(ctx, it.t, x, y, "#0b0d13", "center", 11); });
      label(ctx, "a function gathers extra arguments", 24, 20, C.muted, "left", 12);
    });
  };
  VIZ["py-oop-class"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const bw = 190, bh = h * 0.42, bx = w / 2 - bw / 2, by = h * 0.28;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    label(ctx, "Neuron (object)", bx + bw / 2, by + 16, C.accent, "center", 13);
    label(ctx, "weights = [0.5, -0.3]", bx + bw / 2, by + 42, C.text, "center", 11);
    label(ctx, "bias = 0.1", bx + bw / 2, by + 62, C.text, "center", 11);
    label(ctx, "forward(x)", bx + bw / 2, by + bh - 14, C.good, "center", 12);
    const tt = saw(t, 3);
    if (tt < 0.5) { const x = lerp(20, bx, easeInOut(tt / 0.45)); dot(ctx, x, by + bh / 2, 6, C.warn); label(ctx, "x", x, by + bh / 2 - 14, C.muted, "center", 11); }
    else { const x = lerp(bx + bw, w - 30, easeInOut((tt - 0.5) / 0.45)); dot(ctx, x, by + bh / 2, 6, C.good); label(ctx, "out", x, by + bh / 2 - 14, C.muted, "center", 11); }
  });
  VIZ["py-generators"] = (canvas) => {
    const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], size = 3, nb = Math.ceil(data.length / size);
    return start(canvas, (ctx, w, h, t) => {
      const n = data.length, pad = 30, gap = 6, cw = (w - 2 * pad - gap * (n - 1)) / n, cy = h * 0.34, ch = Math.min(32, cw), cur = Math.floor(saw(t, 5) * nb);
      for (let i = 0; i < n; i++) { const x = pad + i * (cw + gap), inB = Math.floor(i / size) === cur; ctx.fillStyle = inB ? C.warn : "#222a3a"; ctx.strokeStyle = C.grid; ctx.fillRect(x, cy - ch / 2, cw, ch); ctx.strokeRect(x, cy - ch / 2, cw, ch); label(ctx, String(data[i]), x + cw / 2, cy, inB ? "#0b0d13" : C.muted, "center", 12); }
      label(ctx, "yielded batch:", pad, h * 0.7 - 6, C.muted, "left", 12);
      data.slice(cur * size, cur * size + size).forEach((v, j) => { const x = pad + j * (cw + gap); ctx.fillStyle = C.good; ctx.fillRect(x, h * 0.7 + 6, cw, ch); label(ctx, String(v), x + cw / 2, h * 0.7 + 6 + ch / 2, "#0b0d13", "center", 12); });
      label(ctx, "a generator streams data one chunk at a time", pad, 20, C.muted, "left", 12);
    });
  };
  VIZ["py-decorators"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const ox = w / 2, oy = h / 2, ow = 250, oh = 120, iw = 120, ih = 50;
    ctx.strokeStyle = C.good; ctx.lineWidth = 2; ctx.strokeRect(ox - ow / 2, oy - oh / 2, ow, oh);
    label(ctx, "@timed wrapper", ox, oy - oh / 2 + 14, C.good, "center", 12);
    ctx.strokeStyle = C.accent; ctx.strokeRect(ox - iw / 2, oy - ih / 2 + 6, iw, ih);
    label(ctx, "work()", ox, oy + 6, C.accent, "center", 12);
    label(ctx, "⏱ times the call, then returns the result", ox, oy + oh / 2 + 18, C.muted, "center", 11);
    const tt = saw(t, 3.5); const x = tt < 0.5 ? lerp(ox - ow / 2 - 28, ox - iw / 2, easeInOut(tt / 0.5)) : lerp(ox + iw / 2, ox + ow / 2 + 28, easeInOut((tt - 0.5) / 0.5));
    dot(ctx, x, oy + 6, 6, C.warn);
  });
  VIZ["py-map-filter-reduce"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const labels = ["nums", "filter", "map", "reduce", "sum"], cols = [C.accent, C.warn, C.purple, C.good, C.good], n = labels.length, pad = 42, cy = h / 2, gx = (w - 2 * pad) / (n - 1);
    for (let i = 0; i < n - 1; i++) arrow(ctx, pad + i * gx + 22, cy, pad + (i + 1) * gx - 22, cy, C.grid, 2);
    for (let i = 0; i < n; i++) { const x = pad + i * gx; dot(ctx, x, cy, 20, "#1d212c"); ctx.strokeStyle = cols[i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, cy, 20, 0, TAU); ctx.stroke(); label(ctx, labels[i], x, cy + 36, cols[i], "center", 11); }
    const fl = flow(t, n - 1, 4), x = lerp(pad + fl.i * gx, pad + Math.min(fl.i + 1, n - 1) * gx, fl.f);
    dot(ctx, x, cy, 8, C.warn);
    label(ctx, "data flows through the pipeline", pad, 20, C.muted, "left", 12);
  });
  VIZ["py-context-manager"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const tt = saw(t, 4.5), phase = tt < 0.2 ? "enter" : tt < 0.78 ? "body" : "exit", bw = 230, bh = h * 0.44, bx = w / 2 - bw / 2, by = h * 0.26;
    ctx.strokeStyle = phase === "enter" ? C.good : phase === "exit" ? C.warn : C.accent; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    label(ctx, "with Collector() as c:", bx + bw / 2, by - 12, C.muted, "center", 12);
    const shown = phase === "body" ? Math.floor(((tt - 0.2) / 0.58) * 5) + 1 : phase === "exit" ? 5 : 0;
    for (let i = 0; i < Math.min(shown, 5); i++) { const x = bx + 28 + i * 38; dot(ctx, x, by + bh / 2, 12, C.accent); label(ctx, String(i), x, by + bh / 2, "#0b0d13", "center", 11); }
    label(ctx, phase === "enter" ? "__enter__ : set up" : phase === "exit" ? "__exit__ : auto cleanup (5 items)" : "body : append items", bx + bw / 2, by + bh + 18, phase === "exit" ? C.warn : C.text, "center", 12);
  });

  /* ===== Math for ML ===== */
  VIZ["math-matrix-multiply"] = (canvas) => {
    const A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]], Cm = [[19, 22], [43, 50]];
    return start(canvas, (ctx, w, h, t) => {
      const cs = Math.min(38, (h - 70) / 2), cy = h / 2 - cs, step = Math.floor(saw(t, 4) * 4), cr = Math.floor(step / 2), cc = step % 2;
      const drawM = (M, ox, hlR, hlC, reveal) => { for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const x = ox + c * cs, y = cy + r * cs, hl = (hlR != null && r === hlR) || (hlC != null && c === hlC); ctx.fillStyle = hl ? "#2a2718" : "#1d212c"; ctx.strokeStyle = hl ? C.warn : C.grid; ctx.fillRect(x, y, cs - 2, cs - 2); ctx.strokeRect(x, y, cs - 2, cs - 2); if (!reveal || reveal(r, c)) label(ctx, String(M[r][c]), x + cs / 2 - 1, y + cs / 2, C.text, "center", 13); } };
      const ax = 40; drawM(A, ax, cr, null); label(ctx, "@", ax + 2 * cs + 8, h / 2, C.muted, "center", 16);
      const bx = ax + 2 * cs + 26; drawM(B, bx, null, cc); label(ctx, "=", bx + 2 * cs + 8, h / 2, C.muted, "center", 16);
      const cx = bx + 2 * cs + 26; drawM(Cm, cx, null, null, (r, c) => r * 2 + c <= step);
      ctx.strokeStyle = C.good; ctx.lineWidth = 2.5; ctx.strokeRect(cx + cc * cs, cy + cr * cs, cs - 2, cs - 2);
      label(ctx, "each output = a row of A · a column of B", 40, 22, C.muted, "left", 12);
    });
  };
  VIZ["math-linear-system"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const m = fitMap(w, h, 34, -1, 5, -1, 5); axes(ctx, m, -1, 5, -1, 5);
    const p = easeInOut(saw(t, 4));
    const seg = (fn, color) => { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 60 * p; i++) { const x = -1 + (6 * i) / 60, q = m(x, fn(x)); i === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke(); };
    seg((x) => 5 - 2 * x, C.accent); seg((x) => (10 - x) / 3, C.good);
    if (p > 0.96) { const s = m(1, 3); dot(ctx, s[0], s[1], 6, C.warn); label(ctx, "solution (1, 3)", s[0] + 8, s[1] - 8, C.text, "left", 12); }
    label(ctx, "two equations → they cross at the answer", 34, 22, C.muted, "left", 12);
  });
  VIZ["math-eigen"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.3;
    arrow(ctx, cx, cy, cx + s, cy, C.good, 2); label(ctx, "eigvec (λ=2)", cx + s, cy - 10, C.good, "left", 10);
    arrow(ctx, cx, cy, cx, cy - s, C.good, 2); label(ctx, "eigvec (λ=3)", cx + 6, cy - s, C.good, "left", 10);
    const ang = t * 0.6, vx = Math.cos(ang), vy = Math.sin(ang);
    arrow(ctx, cx, cy, cx + vx * s * 0.6, cy - vy * s * 0.6, C.accent, 2);
    arrow(ctx, cx, cy, cx + 2 * vx * s * 0.25, cy - 3 * vy * s * 0.25, C.warn, 2);
    label(ctx, "v (blue) vs Av (orange) — only eigenvectors keep direction", 24, 22, C.muted, "left", 11);
  });
  VIZ["math-gradient"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const m = fitMap(w, h, 34, -5, 3, -3, 10), f = (x) => x * x + 3 * x, df = (x) => 2 * x + 3;
    plot(ctx, m, f, -5, 3, C.accent, 2.5);
    const x0 = -1 + 1.8 * Math.sin(t * 0.5), p = m(x0, f(x0)), sl = df(x0);
    lineSeg(ctx, m, x0 - 1.3, f(x0) - sl * 1.3, x0 + 1.3, f(x0) + sl * 1.3, C.warn, 2);
    dot(ctx, p[0], p[1], 5, C.good);
    label(ctx, "slope (gradient) at x=" + x0.toFixed(1) + " = " + sl.toFixed(1), 34, 22, C.text, "left", 12);
  });
  VIZ["math-bayes"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const prior = 0.01, post = 0.165, rev = easeInOut(clamp((saw(t, 4.5) - 0.4) / 0.4, 0, 1)), pad = 40, bw = 80, gap = 150, baseX = w / 2 - gap / 2 - bw / 2, sc = (v) => Math.min(1, v / 0.25);
    const drawBar = (x, frac, col, lab, pct) => { const bh = frac * (h - 2 * pad); ctx.fillStyle = col; ctx.fillRect(x, h - pad - bh, bw, bh); label(ctx, pct, x + bw / 2, h - pad - bh - 10, C.text, "center", 12); label(ctx, lab, x + bw / 2, h - pad + 14, C.muted, "center", 11); };
    drawBar(baseX, sc(prior), C.accent, "prior", (prior * 100).toFixed(0) + "%");
    drawBar(baseX + bw + gap, sc(post) * rev, C.warn, "after + test", (post * 100 * rev).toFixed(0) + "%");
    label(ctx, "a positive test still means only ~17% chance", pad, 22, C.muted, "left", 12);
  });
  VIZ["math-distributions"] = (canvas) => {
    const r = rng(7), samples = []; for (let i = 0; i < 24; i++) samples.push(gauss(r));
    const pdf = (x) => Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 30, -3.5, 3.5, -0.03, 0.45), z = m(0, 0);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m(-3.5, 0)[0], z[1]); ctx.lineTo(m(3.5, 0)[0], z[1]); ctx.stroke();
      plot(ctx, m, pdf, -3.5, 3.5, C.accent, 2.5);
      const shown = Math.floor(saw(t, 5) * samples.length);
      for (let i = 0; i < shown; i++) { const p = m(clamp(samples[i], -3.5, 3.5), 0); dot(ctx, p[0], z[1], 3, C.good); }
      label(ctx, "the bell curve + random samples drawn from it", 30, 22, C.muted, "left", 12);
    });
  };
  VIZ["math-statistics"] = (canvas) => {
    const data = [4, 8, 15, 16, 23, 42], mean = data.reduce((a, b) => a + b, 0) / data.length, std = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / data.length);
    return start(canvas, (ctx, w, h, t) => {
      const maxv = 42, pad = 34, n = data.length, gap = 14, bw = (w - 2 * pad - gap * (n - 1)) / n, toY = (v) => h - pad - (v / maxv) * (h - 2 * pad);
      ctx.fillStyle = "rgba(110,168,254,0.12)"; ctx.fillRect(pad, toY(mean + std), w - 2 * pad, toY(mean - std) - toY(mean + std));
      data.forEach((v, i) => { const x = pad + i * (bw + gap); ctx.fillStyle = C.accent; ctx.fillRect(x, toY(v), bw, h - pad - toY(v)); });
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(pad, toY(mean)); ctx.lineTo(w - pad, toY(mean)); ctx.stroke(); ctx.setLineDash([]);
      const sx = lerp(pad, w - pad, saw(t, 4)); dot(ctx, sx, toY(mean), 4, C.warn);
      label(ctx, "mean " + mean.toFixed(1) + " ± std band", pad, 22, C.muted, "left", 12);
    });
  };
  VIZ["math-hypothesis-test"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const m = fitMap(w, h, 30, -4, 7, -0.03, 0.5), pdf = (x, mu) => Math.exp(-((x - mu) ** 2) / 2) / Math.sqrt(2 * Math.PI), muB = 3 + 0.6 * Math.sin(t * 0.5);
    plot(ctx, m, (x) => pdf(x, 0), -4, 7, C.accent, 2.2);
    plot(ctx, m, (x) => pdf(x, muB), -4, 7, C.good, 2.2);
    label(ctx, "group A vs B — far apart ⇒ low p (significant)", 30, 22, C.muted, "left", 11);
  });
  VIZ["math-correlation"] = (canvas) => {
    const X = [1, 2, 3, 4, 5], Y = [2, 4, 5, 4, 6], slope = 0.8, intercept = 1.8;
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 34, 0, 6, 0, 7), p = easeInOut(saw(t, 4));
      lineSeg(ctx, m, 0, intercept, 6, slope * 6 + intercept, C.warn, 2);
      X.forEach((x, i) => { if (i / X.length <= p + 0.001) { const s = m(x, Y[i]); dot(ctx, s[0], s[1], 5, C.accent); } });
      label(ctx, "correlation ≈ 0.77 — they rise together", 34, 22, C.muted, "left", 12);
    });
  };

  /* ===== NumPy ===== */
  VIZ["np-create"] = (canvas) => {
    const rows = [["zeros", [0, 0, 0, 0]], ["ones", [1, 1, 1, 1]], ["arange", [0, 2, 4, 6]], ["linspace", [0, 0.33, 0.66, 1]]];
    return start(canvas, (ctx, w, h, t) => {
      const pad = 60, cw = 46, ch = 30, gap = 8, top = 34, rh = (h - top - 20) / rows.length, cur = Math.floor(saw(t, 5) * rows.length);
      rows.forEach((r, ri) => { const oy = top + ri * rh + (rh - ch) / 2; label(ctx, r[0], pad - 8, oy + ch / 2, ri <= cur ? C.text : C.muted, "right", 11); if (ri <= cur) rowCells(ctx, r[1], pad + 4, oy, cw, ch, gap, () => "#222a3a"); });
      label(ctx, "common ways to create arrays", 20, 18, C.muted, "left", 12);
    });
  };
  VIZ["np-elementwise"] = (canvas) => {
    const a = [1, 2, 3, 4];
    return start(canvas, (ctx, w, h, t) => {
      const tt = saw(t, 4), show2 = tt > 0.5, vals = show2 ? a.map((v) => v * 2) : a, pad = 50, cw = 56, gap = 14, oy = h / 2 - 18;
      rowCells(ctx, vals, pad, oy, cw, 36, gap, () => (show2 ? C.good : "#222a3a"));
      label(ctx, show2 ? "a * 2  →  every element doubled" : "a = [1, 2, 3, 4]", pad, 24, C.text, "left", 13);
      label(ctx, "one operation hits the whole array", pad, h - 16, C.muted, "left", 11);
    });
  };
  VIZ["np-random"] = (canvas) => {
    const r = rng(123), vals = []; for (let i = 0; i < 6; i++) vals.push(+r().toFixed(2));
    return start(canvas, (ctx, w, h, t) => {
      const shown = Math.floor(saw(t, 4) * (vals.length + 1)), pad = 40, cw = 60, gap = 10, oy = h / 2 - 18;
      rowCells(ctx, vals.slice(0, shown), pad, oy, cw, 36, gap, () => C.purple);
      label(ctx, "rng(seed=0) → reproducible random numbers", pad, 24, C.muted, "left", 12);
    });
  };
  VIZ["np-stack"] = (canvas) => {
    const a = [1, 2, 3], b = [4, 5, 6];
    return start(canvas, (ctx, w, h, t) => {
      const join = easeInOut(saw(t, 4)), pad = 70, cw = 48, ch = 30, gap = 8, cy = h / 2;
      const ay = lerp(cy - 60, cy - 18, join), by = lerp(cy + 30, cy + 18, join);
      label(ctx, "a", pad - 10, ay + ch / 2, C.accent, "right", 11); rowCells(ctx, a, pad, ay, cw, ch, gap, () => "#1d2b3a");
      label(ctx, "b", pad - 10, by + ch / 2, C.good, "right", 11); rowCells(ctx, b, pad, by, cw, ch, gap, () => "#16291b");
      label(ctx, "vstack → one 2-row array", pad, 22, C.muted, "left", 12);
    });
  };
  VIZ["np-broadcasting"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const cols = 4, rows = 3, base = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]], colMean = [4, 5, 6, 7], reveal = easeInOut(saw(t, 4)), pad = 50, cw = 52, ch = 34, gap = 8, top = 50;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = pad + c * (cw + gap), y = top + r * (ch + gap), v = Math.round(base[r][c] - colMean[c] * reveal); ctx.fillStyle = "#222a3a"; ctx.strokeStyle = C.grid; ctx.fillRect(x, y, cw, ch); ctx.strokeRect(x, y, cw, ch); label(ctx, String(v), x + cw / 2, y + ch / 2, C.text, "center", 12); }
    label(ctx, "matrix − column means (broadcast across rows)", pad, 24, C.muted, "left", 12);
  });
  VIZ["np-boolean-mask"] = (canvas) => {
    const a = [3, -1, 4, -5, 9, -2];
    return start(canvas, (ctx, w, h, t) => {
      const clipped = saw(t, 4) > 0.5, vals = clipped ? a.map((v) => (v < 0 ? 0 : v)) : a, pad = 40, cw = 60, gap = 10, oy = h / 2 - 18;
      rowCells(ctx, vals, pad, oy, cw, 36, gap, (v) => (v < 0 ? "#3a1a1a" : v > 0 ? "#16291b" : "#222a3a"));
      label(ctx, clipped ? "a[a < 0] = 0  →  negatives cleared (like ReLU)" : "a  (negatives in red)", pad, 24, C.text, "left", 12);
    });
  };
  VIZ["np-vectorization"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const n = 12, pad = 30, gap = 5, cw = (w - 2 * pad - gap * (n - 1)) / n, loopY = h * 0.34, vecY = h * 0.68, ch = 26;
    const lp = Math.floor(saw(t, 4) * n);
    for (let i = 0; i < n; i++) { const x = pad + i * (cw + gap); ctx.fillStyle = i <= lp ? C.warn : "#222a3a"; ctx.fillRect(x, loopY - ch / 2, cw, ch); ctx.fillStyle = C.good; ctx.fillRect(x, vecY - ch / 2, cw, ch); }
    label(ctx, "loop: one at a time", pad, loopY - ch / 2 - 10, C.warn, "left", 11);
    label(ctx, "vectorized: all at once (fast)", pad, vecY - ch / 2 - 10, C.good, "left", 11);
  });
  VIZ["np-reshape"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const tt = saw(t, 4), grid = tt > 0.5, pad = 50, cw = 40, ch = 30, gap = 7;
    for (let i = 0; i < 12; i++) { let x, y; if (!grid) { x = pad + i * (cw + gap); y = h / 2 - ch / 2; } else { x = pad + (i % 4) * (cw + gap); y = h / 2 - 1.5 * (ch + gap) + Math.floor(i / 4) * (ch + gap); } ctx.fillStyle = "#222a3a"; ctx.strokeStyle = C.grid; ctx.fillRect(x, y, cw, ch); ctx.strokeRect(x, y, cw, ch); label(ctx, String(i), x + cw / 2, y + ch / 2, C.text, "center", 11); }
    label(ctx, grid ? "reshape(3, 4) — same data, new shape" : "12 numbers in a row", pad, 22, C.muted, "left", 12);
  });

  /* ===== Pandas & Data ===== */
  VIZ["pd-missing"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const filled = saw(t, 4) > 0.5, A = [1, filled ? 2 : null, 3], B = [4, 5, filled ? 4.5 : null], pad = 60, cw = 60, ch = 34, gap = 12, top = 50;
    const draw = (vals, lab, ry) => { label(ctx, lab, pad - 10, ry + ch / 2, C.muted, "right", 11); vals.forEach((v, i) => { const x = pad + i * (cw + gap); const miss = v === null; ctx.fillStyle = miss ? "#3a1a1a" : "#222a3a"; ctx.strokeStyle = miss ? C.bad : C.grid; ctx.fillRect(x, ry, cw, ch); ctx.strokeRect(x, ry, cw, ch); label(ctx, miss ? "NaN" : String(v), x + cw / 2, ry + ch / 2, miss ? C.bad : C.text, "center", 11); }); };
    draw(A, "a", top); draw(B, "b", top + ch + gap);
    label(ctx, filled ? "fillna(mean) → gaps filled" : "missing values (NaN) in red", pad, 22, C.muted, "left", 12);
  });
  VIZ["pd-merge"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const join = easeInOut(saw(t, 4)), cw = 56, ch = 30, cy = h / 2;
    const lx = lerp(40, w / 2 - 90, join), rx = lerp(w - 40 - 2 * cw, w / 2 + 30, join);
    label(ctx, "id · name", lx + cw, cy - 40, C.accent, "center", 10);
    [["1", "a"], ["2", "b"], ["3", "c"]].forEach((r, i) => { const y = cy - 18 + i * (ch + 4); rowCells(ctx, r, lx, y, cw, ch, 0, () => "#1d2b3a"); });
    label(ctx, "id · score", rx + cw, cy - 40, C.good, "center", 10);
    [["1", "90"], ["2", "80"], ["4", "70"]].forEach((r, i) => { const y = cy - 18 + i * (ch + 4); rowCells(ctx, r, rx, y, cw, ch, 0, () => "#16291b"); });
    label(ctx, "merge(on='id') joins tables on a shared key", 30, 22, C.muted, "left", 12);
  });
  VIZ["data-onehot"] = (canvas) => {
    const colors = ["red", "green", "blue", "green"], cats = ["red", "green", "blue"];
    return start(canvas, (ctx, w, h, t) => {
      const reveal = Math.floor(saw(t, 5) * (colors.length + 1)), pad = 80, cw = 54, ch = 28, gap = 8, top = 50;
      cats.forEach((c, j) => label(ctx, c, pad + j * (cw + gap) + cw / 2, top - 12, C.muted, "center", 10));
      colors.forEach((col, i) => { const y = top + i * (ch + 6); label(ctx, col, pad - 10, y + ch / 2, i < reveal ? C.text : C.muted, "right", 11); if (i < reveal) cats.forEach((c, j) => { const x = pad + j * (cw + gap), on = c === col; ctx.fillStyle = on ? C.good : "#222a3a"; ctx.strokeStyle = C.grid; ctx.fillRect(x, y, cw, ch); ctx.strokeRect(x, y, cw, ch); label(ctx, on ? "1" : "0", x + cw / 2, y + ch / 2, on ? "#0b0d13" : C.muted, "center", 11); }); });
      label(ctx, "one-hot: a 0/1 column per category", 20, 18, C.muted, "left", 12);
    });
  };
  VIZ["data-train-test-split"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const n = 10, pad = 30, gap = 6, cw = (w - 2 * pad - gap * (n - 1)) / n, cy = h / 2 - 18, ch = 36, reveal = easeInOut(saw(t, 4));
    for (let i = 0; i < n; i++) { const x = pad + i * (cw + gap), test = i >= 7; const show = i / n <= reveal + 0.05; ctx.fillStyle = show ? (test ? C.warn : C.accent) : "#222a3a"; ctx.fillRect(x, cy, cw, ch); }
    label(ctx, "train (70%)", pad, cy - 12, C.accent, "left", 11);
    label(ctx, "test (30%)", pad + 7 * (cw + gap), cy + ch + 16, C.warn, "left", 11);
    label(ctx, "hold out a test set to grade the model fairly", pad, 22, C.muted, "left", 12);
  });

  /* ===== Matplotlib (preview of each chart type) ===== */
  VIZ["mpl-line"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const m = fitMap(w, h, 30, 0, 10, -1.1, 1.1), p = easeInOut(saw(t, 4));
    axes(ctx, m, 0, 10, -1.1, 1.1);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 100 * p; i++) { const x = (10 * i) / 100, q = m(x, Math.sin(x)); i === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke();
    label(ctx, "plt.plot — a line chart", 30, 20, C.muted, "left", 12);
  });
  VIZ["mpl-scatter"] = (canvas) => {
    const r = rng(0), pts = []; for (let i = 0; i < 40; i++) pts.push([r(), r()]);
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 28, 0, 1, 0, 1), shown = Math.floor(saw(t, 4) * pts.length);
      for (let i = 0; i < shown; i++) { const s = m(pts[i][0], pts[i][1]); dot(ctx, s[0], s[1], 4, i % 3 === 0 ? C.good : i % 3 === 1 ? C.accent : C.pink); }
      label(ctx, "plt.scatter — points colored by value", 28, 18, C.muted, "left", 12);
    });
  };
  VIZ["mpl-hist"] = (canvas) => {
    const r = rng(0), bins = new Array(11).fill(0); for (let i = 0; i < 400; i++) { const v = gauss(r); const b = clamp(Math.round(v * 2 + 5), 0, 10); bins[b]++; }
    const mx = Math.max.apply(null, bins);
    return start(canvas, (ctx, w, h, t) => {
      const n = bins.length, pad = 30, gap = 4, bw = (w - 2 * pad - gap * (n - 1)) / n, grow = easeInOut(saw(t, 4));
      bins.forEach((b, i) => { const bh = (b / mx) * (h - 2 * pad) * grow, x = pad + i * (bw + gap), y = h - pad - bh; ctx.fillStyle = C.accent; ctx.fillRect(x, y, bw, bh); });
      label(ctx, "plt.hist — distribution shape", pad, 20, C.muted, "left", 12);
    });
  };
  VIZ["mpl-bar"] = (canvas) => {
    const counts = [12, 19, 7], labels = ["cat", "dog", "bird"], cols = [C.accent, C.good, C.pink];
    return start(canvas, (ctx, w, h, t) => {
      const n = counts.length, pad = 40, gap = 30, bw = (w - 2 * pad - gap * (n - 1)) / n, grow = easeInOut(saw(t, 4));
      counts.forEach((c, i) => { const bh = (c / 20) * (h - 2 * pad) * grow, x = pad + i * (bw + gap), y = h - pad - bh; ctx.fillStyle = cols[i]; ctx.fillRect(x, y, bw, bh); label(ctx, labels[i], x + bw / 2, h - pad + 12, C.muted, "center", 11); });
      label(ctx, "plt.bar — compare categories", pad, 20, C.muted, "left", 12);
    });
  };
  VIZ["mpl-subplots"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const p = easeInOut(saw(t, 4));
    [["sin", Math.sin, C.accent, 0], ["cos", Math.cos, C.good, 1]].forEach((cfg) => {
      const ox = cfg[3] === 0 ? 0.06 * w : 0.54 * w, ow = 0.4 * w, m = (x, y) => [ox + (x / 10) * ow, h / 2 - y * (h * 0.3)];
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, h / 2); ctx.lineTo(ox + ow, h / 2); ctx.stroke();
      ctx.strokeStyle = cfg[2]; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 80 * p; i++) { const x = (10 * i) / 80, q = m(x, cfg[1](x)); i === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke();
      label(ctx, cfg[0], ox + ow / 2, 28, cfg[2], "center", 11);
    });
    label(ctx, "subplots — charts side by side", 30, 16, C.muted, "left", 11);
  });

  /* ===== Classical ML (classifier boundaries) ===== */
  const SPEC2 = [{ cx: -1.2, cy: -1, n: 14, cls: 0 }, { cx: 1.3, cy: 1.1, n: 14, cls: 1 }];
  const SPEC3 = [{ cx: -1.5, cy: -0.6, n: 10, cls: 0 }, { cx: 0.2, cy: 1.4, n: 10, cls: 1 }, { cx: 1.6, cy: -0.7, n: 10, cls: 2 }];
  VIZ["ml-logistic-regression"] = (canvas) => classifierViz(canvas, {
    seed: 4, specs: SPEC2, title: "logistic regression — a straight boundary",
    boundary: (ctx, m, t) => { const sl = lerp(4, -1, easeInOut(saw(t, 4))); lineSeg(ctx, m, -3, sl * -3, 3, sl * 3, C.warn, 2.5); },
  });
  VIZ["ml-svm"] = (canvas) => classifierViz(canvas, {
    seed: 4, specs: SPEC2, title: "SVM — widest margin between classes",
    boundary: (ctx, m) => { lineSeg(ctx, m, -3, 3, 3, -3, C.warn, 2.5); lineSeg(ctx, m, -3, 4.2, 3, -1.8, C.muted, 1, [5, 4]); lineSeg(ctx, m, -3, 1.8, 3, -4.2, C.muted, 1, [5, 4]); },
  });
  VIZ["ml-decision-tree"] = (canvas) => classifierViz(canvas, {
    seed: 5, specs: SPEC3, title: "decision tree — axis-aligned splits",
    boundary: (ctx, m, t) => { const p = saw(t, 4); if (p > 0.15) lineSeg(ctx, m, -0.6, -3, -0.6, 3, C.warn, 2); if (p > 0.55) lineSeg(ctx, m, -0.6, 0.4, 3, 0.4, C.warn, 2); },
  });
  VIZ["ml-random-forest"] = (canvas) => classifierViz(canvas, {
    seed: 5, specs: SPEC3, title: "random forest — many trees vote",
    boundary: (ctx, m, t) => { const r = rng(9); for (let i = 0; i < 6; i++) { const xv = (r() - 0.5) * 3; lineSeg(ctx, m, xv, -3, xv, 3, "rgba(245,176,66,0.25)", 1); const yv = (r() - 0.5) * 3; lineSeg(ctx, m, -3, yv, 3, yv, "rgba(245,176,66,0.25)", 1); } lineSeg(ctx, m, -0.6, -3, -0.6, 3, C.warn, 2); },
  });
  VIZ["ml-naive-bayes"] = (canvas) => classifierViz(canvas, {
    seed: 5, specs: SPEC3, title: "naive Bayes — a probability cloud per class",
    boundary: (ctx, m) => { SPEC3.forEach((s) => { const c = m(s.cx, s.cy), e = m(s.cx + 1.1, s.cy); ctx.strokeStyle = CLASS[s.cls]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c[0], c[1], Math.abs(e[0] - c[0]), 0, TAU); ctx.stroke(); }); },
  });
  VIZ["ml-gradient-boosting"] = (canvas) => classifierViz(canvas, {
    seed: 5, specs: SPEC3, title: "gradient boosting — splits added in stages",
    boundary: (ctx, m, t) => { const k = Math.floor(saw(t, 5) * 4); const splits = [[-0.6, "v"], [0.4, "h"], [1.0, "v"], [-0.8, "h"]]; for (let i = 0; i <= k && i < splits.length; i++) { const s = splits[i]; if (s[1] === "v") lineSeg(ctx, m, s[0], -3, s[0], 3, C.warn, 2); else lineSeg(ctx, m, -3, s[0], 3, s[0], C.warn, 2); } },
  });

  /* ===== Evaluation ===== */
  VIZ["eval-cross-validation"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const folds = 5, pad = 40, gap = 6, fw = (w - 2 * pad - gap * (folds - 1)) / folds, top = 60, fh = 40, testFold = Math.floor(saw(t, 5) * folds);
    for (let i = 0; i < folds; i++) { const x = pad + i * (fw + gap), test = i === testFold; ctx.fillStyle = test ? C.warn : C.accent; ctx.fillRect(x, top, fw, fh); label(ctx, test ? "test" : "train", x + fw / 2, top + fh / 2, "#0b0d13", "center", 10); }
    label(ctx, "fold " + (testFold + 1) + "/5 is the test set this round", pad, 30, C.text, "left", 12);
    label(ctx, "rotate the test fold, average the scores", pad, h - 16, C.muted, "left", 11);
  });
  VIZ["eval-confusion-matrix"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const cells = [["TP", 3, C.good], ["FN", 1, C.bad], ["FP", 1, C.bad], ["TN", 3, C.good]], cs = Math.min(80, (h - 70) / 2), ox = w / 2 - cs, oy = 40, k = Math.floor(saw(t, 4) * 4);
    cells.forEach((c, i) => { const r = Math.floor(i / 2), col = i % 2, x = ox + col * cs, y = oy + r * cs, on = i <= k; ctx.fillStyle = on ? (c[2] === C.good ? "rgba(74,222,128,0.18)" : "rgba(248,113,113,0.18)") : "#1d212c"; ctx.strokeStyle = c[2]; ctx.fillRect(x, y, cs - 2, cs - 2); ctx.strokeRect(x, y, cs - 2, cs - 2); label(ctx, c[0] + ": " + c[1], x + cs / 2, y + cs / 2, on ? C.text : C.muted, "center", 13); });
    label(ctx, "predicted →", ox + cs, oy - 12, C.muted, "center", 10);
    label(ctx, "right (green) vs wrong (red) predictions", w / 2, oy + 2 * cs + 16, C.muted, "center", 11);
  });
  VIZ["eval-roc-auc"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const m = fitMap(w, h, 36, 0, 1, 0, 1), p = easeInOut(saw(t, 4)), roc = (x) => Math.pow(x, 0.35);
    axes(ctx, m, 0, 1, 0, 1);
    lineSeg(ctx, m, 0, 0, 1, 1, C.muted, 1, [5, 4]);
    ctx.fillStyle = "rgba(110,168,254,0.12)"; ctx.beginPath(); const o = m(0, 0); ctx.moveTo(o[0], o[1]); for (let i = 0; i <= 60 * p; i++) { const x = i / 60, q = m(x, roc(x)); ctx.lineTo(q[0], q[1]); } ctx.lineTo(m(p, 0)[0], o[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 60 * p; i++) { const x = i / 60, q = m(x, roc(x)); i === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke();
    label(ctx, "ROC curve — area (AUC) = ranking quality", 36, 22, C.muted, "left", 11);
  });
  VIZ["eval-regularization"] = (canvas) => {
    const r = rng(0), xs = [], ys = []; for (let i = 0; i < 12; i++) { const x = i / 11; xs.push(x); ys.push(Math.sin(2 * Math.PI * x) + gauss(r) * 0.12); }
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 30, -0.05, 1.05, -1.6, 1.6), reg = easeInOut(saw(t, 5));
      xs.forEach((x, i) => { const p = m(x, ys[i]); dot(ctx, p[0], p[1], 4, C.muted); });
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const x = i / 120; const smooth = Math.sin(2 * Math.PI * x); const wiggle = smooth + 0.5 * Math.sin(13 * x) * Math.exp(-2 * x); const y = lerp(wiggle, smooth, reg); const q = m(x, y); i === 0 ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke();
      label(ctx, reg > 0.6 ? "more regularization → smoother, generalizes" : "low α → overfits the noise (wiggly)", 30, 22, C.text, "left", 12);
    });
  };
  VIZ["eval-regression-metrics"] = (canvas) => {
    const xs = [0, 1, 2, 3, 4], yt = [1.0, 2.2, 1.8, 3.5, 4.1];
    return start(canvas, (ctx, w, h, t) => {
      const m = fitMap(w, h, 34, -0.4, 4.4, -0.4, 5), slope = 0.75 + 0.12 * Math.sin(t * 0.6), inter = 0.7;
      const pred = (x) => slope * x + inter; lineSeg(ctx, m, -0.4, pred(-0.4), 4.4, pred(4.4), C.accent, 2);
      let mse = 0; xs.forEach((x, i) => { const e = yt[i] - pred(x); mse += e * e; const pt = m(x, yt[i]), on = m(x, pred(x)); ctx.strokeStyle = C.bad; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pt[0], pt[1]); ctx.lineTo(on[0], on[1]); ctx.stroke(); dot(ctx, pt[0], pt[1], 4, C.good); }); mse /= xs.length;
      label(ctx, "MSE " + mse.toFixed(2) + "  ·  red lines are the errors (residuals)", 34, 22, C.text, "left", 12);
    });
  };

  /* ===== Neural Networks ===== */
  VIZ["nn-forward-pass"] = (canvas) => networkViz(canvas, [2, 4, 1], { title: "forward pass — input flows to output", labels: ["input", "hidden", "output"] });
  VIZ["nn-backprop"] = (canvas) => networkViz(canvas, [2, 4, 1], { back: true, title: "backprop — error flows back, weights update", labels: ["input", "hidden", "output"] });

  /* ===== PyTorch ===== */
  VIZ["torch-tensors"] = (canvas) => tensorGridViz(canvas, "+10", [[11, 12], [13, 14]]);
  VIZ["torch-autograd"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const m = fitMap(w, h, 34, -1, 4, -3, 12), f = (x) => x * x + 3 * x;
    plot(ctx, m, f, -1, 4, C.accent, 2.5);
    const p = m(2, f(2)); lineSeg(ctx, m, 2 - 1.2, f(2) - 7 * 1.2, 2 + 1.2, f(2) + 7 * 1.2, C.warn, 2); dot(ctx, p[0], p[1], 5, C.good);
    const pulse = (Math.sin(t * 3) + 1) / 2; ctx.globalAlpha = 0.4 + 0.6 * pulse; label(ctx, "autograd: dy/dx = 7 at x=2 (computed for you)", 34, 22, C.text, "left", 12); ctx.globalAlpha = 1;
  });
  VIZ["torch-nn-module"] = (canvas) => networkViz(canvas, [2, 4, 1], { title: "nn.Module — stacked layers", labels: ["Linear(2,4)", "relu", "Linear(4,1)"] });
  VIZ["torch-training-loop"] = (canvas) => lossCurveViz(canvas, "predict → loss → backward → step");

  /* ===== TensorFlow ===== */
  VIZ["tf-tensors"] = (canvas) => tensorGridViz(canvas, "matmul", [[7, 10], [15, 22]]);
  VIZ["tf-keras-model"] = (canvas) => networkViz(canvas, [4, 8, 3], { title: "Keras Sequential — list of layers", labels: ["input(4)", "Dense relu(8)", "softmax(3)"] });
  VIZ["tf-keras-train"] = (canvas) => lossCurveViz(canvas, "model.fit() — loss falls each epoch");
  VIZ["tf-predict"] = (canvas) => probBarsViz(canvas, [0.12, 0.7, 0.18], ["class 0", "class 1", "class 2"], "predict() → class probabilities (pick the top)");

  /* ===== NLP & LLM ===== */
  VIZ["nlp-tokenization"] = (canvas) => {
    const toks = ["ai", "engineers", "build", "llms"], ids = [0, 2, 1, 3];
    return start(canvas, (ctx, w, h, t) => {
      const n = toks.length, pad = 30, gap = 14, bw = (w - 2 * pad - gap * (n - 1)) / n, cy = h * 0.4, showId = saw(t, 4) > 0.5;
      toks.forEach((tk, i) => { const x = pad + i * (bw + gap); ctx.fillStyle = C.accent; ctx.fillRect(x, cy - 18, bw, 36); label(ctx, tk, x + bw / 2, cy, "#0b0d13", "center", 12); if (showId) { ctx.fillStyle = C.good; ctx.fillRect(x + bw / 2 - 16, cy + 34, 32, 30); label(ctx, String(ids[i]), x + bw / 2, cy + 49, "#0b0d13", "center", 13); } });
      label(ctx, showId ? "tokens → integer ids (what the model reads)" : "split text into tokens", pad, 22, C.muted, "left", 12);
    });
  };
  VIZ["nlp-bag-of-words"] = (canvas) => {
    const vocab = ["cat", "ran", "sat", "the"], counts = [1, 1, 1, 1];
    return start(canvas, (ctx, w, h, t) => {
      const n = vocab.length, pad = 40, gap = 24, bw = (w - 2 * pad - gap * (n - 1)) / n, grow = easeInOut(saw(t, 4));
      counts.forEach((c, i) => { const bh = (c / 2) * (h - 2 * pad) * grow, x = pad + i * (bw + gap), y = h - pad - bh; ctx.fillStyle = C.accent; ctx.fillRect(x, y, bw, bh); label(ctx, String(c), x + bw / 2, y - 8, C.text, "center", 11); label(ctx, vocab[i], x + bw / 2, h - pad + 12, C.muted, "center", 10); });
      label(ctx, "'the cat ran' → counts per word", pad, 20, C.muted, "left", 12);
    });
  };
  VIZ["nlp-tfidf"] = (canvas) => heatmapViz(canvas, 3, 4, (i, j) => ((i * 7 + j * 5) % 9) / 9, ["doc1", "doc2", "doc3"], ["learn", "deep", "fun", "love"], "TF-IDF weights (brighter = more distinctive)");
  VIZ["nlp-positional-encoding"] = (canvas) => heatmapViz(canvas, 6, 8, (i, j) => (j % 2 === 0 ? Math.sin(i / Math.pow(10000, j / 8)) : Math.cos(i / Math.pow(10000, j / 8))) * 0.5 + 0.5, ["pos0", "pos1", "pos2", "pos3", "pos4", "pos5"], null, "positional encoding (sin/cos per position)");
  VIZ["llm-rag-retrieval"] = (canvas) => {
    const docs = ["Python language", "Transformers power LLMs", "mitochondria cell"], sims = [0.18, 0.81, 0.05];
    return start(canvas, (ctx, w, h, t) => {
      const grow = easeInOut(saw(t, 4)), best = 1, pad = 30, top = 56, rh = 46, barMax = w - 240;
      label(ctx, "query: \"what runs large language models?\"", pad, 26, C.text, "left", 12);
      docs.forEach((d, i) => { const y = top + i * rh, on = i === best && grow > 0.8; label(ctx, d, pad, y + 10, on ? C.good : C.muted, "left", 11); ctx.fillStyle = on ? C.good : C.accent; ctx.fillRect(pad, y + 18, barMax * sims[i] * grow, 14); label(ctx, sims[i].toFixed(2), pad + barMax * sims[i] * grow + 8, y + 25, C.muted, "left", 10); if (on) label(ctx, "← retrieved", pad + barMax + 30, y + 25, C.good, "left", 11); });
    });
  };
  VIZ["nlp-ngram-generation"] = (canvas) => {
    const seq = ["i", "love", "ai", "i", "love", "ml"];
    return start(canvas, (ctx, w, h, t) => {
      const n = seq.length, pad = 30, gap = 10, bw = (w - 2 * pad - gap * (n - 1)) / n, cy = h / 2, lit = Math.floor(saw(t, 5) * n);
      for (let i = 0; i < n - 1; i++) arrow(ctx, pad + i * (bw + gap) + bw, cy, pad + (i + 1) * (bw + gap), cy, i < lit ? C.warn : C.grid, i < lit ? 2 : 1);
      seq.forEach((wd, i) => { const x = pad + i * (bw + gap), on = i <= lit; ctx.fillStyle = on ? C.accent : "#222a3a"; ctx.fillRect(x, cy - 16, bw, 32); label(ctx, wd, x + bw / 2, cy, on ? "#0b0d13" : C.muted, "center", 11); });
      label(ctx, "predict the next word, over and over", pad, 22, C.muted, "left", 12);
    });
  };

  /* ===== MLOps ===== */
  VIZ["mlops-save-load"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const tt = saw(t, 4), saving = tt < 0.5, mx = w * 0.22, dx = w * 0.78, cy = h / 2;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.strokeRect(mx - 55, cy - 26, 110, 52); label(ctx, "model", mx, cy, C.accent, "center", 12);
    ctx.fillStyle = C.good; ctx.fillRect(dx - 26, cy - 26, 52, 52); label(ctx, "💾", dx, cy, "#0b0d13", "center", 18);
    const p = easeInOut((saving ? tt : tt - 0.5) / 0.5);
    if (saving) { const x = lerp(mx + 55, dx - 26, p); dot(ctx, x, cy, 6, C.warn); label(ctx, "joblib.dump →", w / 2, cy - 44, C.muted, "center", 11); }
    else { const x = lerp(dx - 26, mx + 55, p); dot(ctx, x, cy, 6, C.warn); label(ctx, "← joblib.load", w / 2, cy - 44, C.muted, "center", 11); }
    label(ctx, "train once, save, reload anytime", w / 2, h - 16, C.muted, "center", 11);
  });
  VIZ["mlops-pipeline"] = (canvas) => start(canvas, (ctx, w, h, t) => {
    const stages = ["raw data", "scale", "model", "predict"], n = stages.length, pad = 50, cy = h / 2, gx = (w - 2 * pad) / (n - 1);
    for (let i = 0; i < n - 1; i++) arrow(ctx, pad + i * gx + 34, cy, pad + (i + 1) * gx - 34, cy, C.grid, 2);
    for (let i = 0; i < n; i++) { const x = pad + i * gx; ctx.strokeStyle = i === 1 ? C.warn : i === 2 ? C.good : C.accent; ctx.lineWidth = 2; ctx.strokeRect(x - 32, cy - 18, 64, 36); label(ctx, stages[i], x, cy, C.text, "center", 10); }
    const fl = flow(t, n - 1, 4), x = lerp(pad + fl.i * gx, pad + Math.min(fl.i + 1, n - 1) * gx, fl.f);
    dot(ctx, x, cy - 30, 5, C.warn);
    label(ctx, "Pipeline runs the steps in order", pad, 22, C.muted, "left", 12);
  });
  VIZ["mlops-reproducibility"] = (canvas) => {
    const r1 = rng(42), r2 = rng(42), a = [], b = []; for (let i = 0; i < 4; i++) { a.push(+r1().toFixed(2)); b.push(+r2().toFixed(2)); }
    return start(canvas, (ctx, w, h, t) => {
      const pad = 70, cw = 64, ch = 30, gap = 10, showB = saw(t, 4) > 0.45;
      label(ctx, "run 1", pad - 10, h * 0.4 + ch / 2, C.muted, "right", 11); rowCells(ctx, a, pad, h * 0.4, cw, ch, gap, () => "#1d2b3a");
      label(ctx, "run 2", pad - 10, h * 0.62 + ch / 2, C.muted, "right", 11); if (showB) rowCells(ctx, b, pad, h * 0.62, cw, ch, gap, () => "#16291b");
      label(ctx, showB ? "same seed → identical numbers ✓" : "set_seed(42) …", pad, 24, C.text, "left", 12);
    });
  };
  VIZ["mlops-data-validation"] = (canvas) => {
    const rows = [["age ≥ 0", true], ["no missing income", false]];
    return start(canvas, (ctx, w, h, t) => {
      const reveal = Math.floor(saw(t, 4) * (rows.length + 1)), pad = 40, top = h / 2 - 30;
      rows.forEach((r, i) => { if (i >= reveal) return; const y = top + i * 40; ctx.strokeStyle = C.grid; ctx.strokeRect(pad, y, w - 2 * pad, 32); label(ctx, r[0], pad + 12, y + 16, C.text, "left", 12); ctx.fillStyle = r[1] ? C.good : C.bad; label(ctx, r[1] ? "PASS ✓" : "FAIL ✕", w - pad - 16, y + 16, r[1] ? C.good : C.bad, "right", 12); });
      label(ctx, "check data quality before training", pad, 28, C.muted, "left", 12);
    });
  };

  window.VIZ = VIZ;
})();
