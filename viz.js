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

  // animation loop with crisp HiDPI sizing
  function start(canvas, draw) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    let raf, t0 = null, alive = true;
    function frame(ts) {
      if (!alive) return;
      if (t0 === null) t0 = ts;
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      draw(ctx, r.width, r.height, (ts - t0) / 1000);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { stop() { alive = false; cancelAnimationFrame(raf); } };
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
    const target = 23, steps = [];
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

  window.VIZ = VIZ;
})();
