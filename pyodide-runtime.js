// pyodide-runtime.js — loads Pyodide directly in the new-tab page (no sandbox).
// Exposes window.PyRuntime = { init, run, onStatus }.
//
// Why no sandbox? MV3 forbids 'allow-same-origin' in the sandbox CSP, so a
// sandboxed page gets an opaque origin (breaks sessionStorage + local fetches).
// A normal extension page with 'wasm-unsafe-eval' runs Pyodide cleanly.

(function () {
  "use strict";

  // Bundled locally under pyodide/. Resolved against newtab.html ->
  // chrome-extension://<id>/pyodide/  (same-origin, no network).
  const PYODIDE_INDEX_URL = "pyodide/";

  let pyodide = null;
  let loadingPromise = null;
  let statusCb = function () {};

  function status(text, state) {
    try {
      statusCb(text, state);
    } catch (_) {}
  }

  async function init() {
    if (pyodide) return pyodide;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      status("Initializing Python runtime…", "loading");
      pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
      status("Python ready ✓", "ready");
      return pyodide;
    })();

    return loadingPromise;
  }

  async function run(code) {
    let py;
    try {
      py = await init();
    } catch (err) {
      return { ok: false, error: "Failed to start Python: " + msg(err), stdout: "", stderr: "" };
    }

    // Install any packages the snippet imports (numpy, pandas, sklearn, mpl...).
    status("Loading required packages…", "loading");
    try {
      await py.loadPackagesFromImports(code);
    } catch (e) {
      console.warn("loadPackagesFromImports:", e);
    }

    const usesMpl = /(^|\n)\s*(import\s+matplotlib|from\s+matplotlib)\b/.test(code);
    if (usesMpl) {
      // Force the headless Agg backend BEFORE the user imports pyplot, so plots
      // render to an image buffer instead of trying to open a GUI window.
      try {
        await py.runPythonAsync(
          'import os, warnings\n' +
          'os.environ["MPLBACKEND"] = "AGG"\n' +
          'warnings.filterwarnings("ignore")\n' +
          'import matplotlib\n' +
          'matplotlib.use("AGG")\n'
        );
      } catch (e) {
        console.warn("matplotlib setup:", e);
      }
    }

    status("Running…", "running");

    const out = [];
    const err = [];
    py.setStdout({ batched: (s) => out.push(s) });
    py.setStderr({ batched: (s) => err.push(s) });

    let images = [];
    try {
      const result = await py.runPythonAsync(code);
      py.setStdout({});
      py.setStderr({});
      if (usesMpl) images = await captureFigures(py);
      return {
        ok: true,
        stdout: out.join("\n"),
        stderr: err.join("\n"),
        repr: result === undefined ? null : String(result),
        images,
      };
    } catch (e) {
      py.setStdout({});
      py.setStderr({});
      if (usesMpl) {
        try { images = await captureFigures(py); } catch (_) {}
      }
      return {
        ok: false,
        error: msg(e),
        stdout: out.join("\n"),
        stderr: err.join("\n"),
        images,
      };
    } finally {
      status("Python ready ✓", "ready");
    }
  }

  // After the user's code runs, save every open Matplotlib figure as a base64
  // PNG so the page can show it as an <img>.
  async function captureFigures(py) {
    const proxy = await py.runPythonAsync(
      'import base64, io\n' +
      'import matplotlib.pyplot as _plt\n' +
      '_imgs = []\n' +
      'for _n in _plt.get_fignums():\n' +
      '    _f = _plt.figure(_n)\n' +
      '    _buf = io.BytesIO()\n' +
      '    _f.savefig(_buf, format="png", bbox_inches="tight", dpi=110)\n' +
      '    _buf.seek(0)\n' +
      '    _imgs.append(base64.b64encode(_buf.read()).decode())\n' +
      '_plt.close("all")\n' +
      '_imgs\n'
    );
    let arr = [];
    try {
      arr = proxy.toJs();
    } catch (_) {
      arr = [];
    }
    if (proxy && proxy.destroy) proxy.destroy();
    return arr;
  }

  function msg(e) {
    return String(e && e.message ? e.message : e);
  }

  window.PyRuntime = {
    init,
    run,
    onStatus: (cb) => {
      statusCb = cb || function () {};
    },
  };
})();
