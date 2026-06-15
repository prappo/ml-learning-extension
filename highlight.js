// highlight.js — a tiny, dependency-free Python syntax highlighter.
// window.highlightPython(code) -> HTML string with <span class="tok-*"> wrappers.
// Used as an overlay behind the editor textarea.

(function () {
  "use strict";

  const KEYWORDS = new Set(
    ("False None True and as assert async await break class continue def del " +
      "elif else except finally for from global if import in is lambda nonlocal " +
      "not or pass raise return try while with yield match case").split(" ")
  );
  const BUILTINS = new Set(
    ("print len range sum min max abs round sorted list dict set tuple int float " +
      "str bool enumerate zip map filter reversed any all open type isinstance " +
      "super self cls format input").split(" ")
  );

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Order matters: comments and strings first so keywords inside them aren't styled.
  const RULES = [
    ["com", /#[^\n]*/y],
    ["str", /(?:[rbfuRBFU]{0,2})('''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")/y],
    ["num", /\b\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?j?\b/y],
    ["id", /[A-Za-z_]\w*/y],
    ["ws", /\s+/y],
    ["op", /[^\sA-Za-z0-9_]+/y],
  ];

  window.highlightPython = function (code) {
    let out = "", pos = 0;
    const n = code.length;
    while (pos < n) {
      let matched = false;
      for (let r = 0; r < RULES.length; r++) {
        const cls = RULES[r][0], re = RULES[r][1];
        re.lastIndex = pos;
        const m = re.exec(code);
        if (m && m.index === pos && m[0].length > 0) {
          const txt = m[0];
          if (cls === "id") {
            if (KEYWORDS.has(txt)) out += '<span class="tok-kw">' + esc(txt) + "</span>";
            else if (BUILTINS.has(txt)) out += '<span class="tok-bi">' + esc(txt) + "</span>";
            else if (code[pos + txt.length] === "(") out += '<span class="tok-fn">' + esc(txt) + "</span>";
            else out += esc(txt);
          } else if (cls === "ws") {
            out += esc(txt);
          } else {
            out += '<span class="tok-' + cls + '">' + esc(txt) + "</span>";
          }
          pos += txt.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        out += esc(code[pos]);
        pos++;
      }
    }
    // keep the final blank line visible if the code ends with a newline
    if (code.endsWith("\n")) out += " ";
    return out;
  };
})();
