#!/usr/bin/env node
// fetch-pyodide.mjs — downloads the local Pyodide runtime + ML wheels into ./pyodide.
//
//   node scripts/fetch-pyodide.mjs          # download everything (~145 MB)
//   node scripts/fetch-pyodide.mjs --check  # just verify which files are needed
//
// Run this once after cloning, before loading the unpacked extension in Chrome.
// Requires Node 18+ (uses the built-in fetch).

import { mkdir, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PYODIDE_VERSION = "0.26.2";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

// Core runtime files (always needed) + the packages the lessons import.
const CORE = [
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];
const WANT = ["numpy", "scipy", "pandas", "scikit-learn", "matplotlib"];

const pyodideDir = fileURLToPath(new URL("../pyodide/", import.meta.url));

function closure(lock, wants) {
  const pkgs = lock.packages;
  const find = (n) =>
    pkgs[n.toLowerCase()] ||
    Object.values(pkgs).find((p) => p.name.toLowerCase() === n.toLowerCase());
  const seen = new Set();
  const queue = [...wants];
  while (queue.length) {
    const e = find(queue.shift());
    if (!e || seen.has(e.name)) continue;
    seen.add(e.name);
    (e.depends || []).forEach((d) => queue.push(d));
  }
  return [...seen].map((n) => find(n).file_name);
}

async function fetchLock() {
  const res = await fetch(`${BASE}/pyodide-lock.json`);
  if (!res.ok) throw new Error(`lockfile ${res.status}`);
  return res.json();
}

async function download(file) {
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`${file} -> HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(new URL(`../pyodide/${file}`, import.meta.url), buf);
  return buf.length;
}

async function run() {
  const check = process.argv.includes("--check");
  console.log(`Pyodide v${PYODIDE_VERSION} — resolving file list…`);
  const lock = await fetchLock();
  const files = [...CORE, ...closure(lock, WANT)];
  console.log(`${files.length} files needed (${WANT.join(", ")} + dependencies).`);

  if (check) {
    let present = [];
    try {
      present = await readdir(pyodideDir);
    } catch (_) {}
    const have = new Set(present);
    const missing = files.filter((f) => !have.has(f));
    files.forEach((f) => console.log(`  ${have.has(f) ? "✓" : "✗"} ${f}`));
    console.log(missing.length ? `\nMissing ${missing.length} file(s).` : "\nAll files present ✓");
    return;
  }

  await mkdir(pyodideDir, { recursive: true });
  let total = 0,
    done = 0;
  // modest concurrency so we don't open 12 large sockets at once
  const queue = [...files];
  async function worker() {
    while (queue.length) {
      const f = queue.shift();
      const bytes = await download(f);
      total += bytes;
      done += 1;
      console.log(`  [${done}/${files.length}] ${f} (${(bytes / 1048576).toFixed(1)} MB)`);
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log(`\nDone — ${files.length} files, ${(total / 1048576).toFixed(0)} MB into pyodide/`);
}

run().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
