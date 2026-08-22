// A self-contained scientific calculator (original design, not a Casio
// clone) rendered as a floating overlay so it can be opened without losing
// whatever lesson/screen is currently active underneath.

const calcState = {
  expr: "",
  mode: "DEG", // or "RAD"
  memory: 0,
  open: false,
};

const CALC_BUTTONS = [
  ["mode", "MC", "MR", "M+", "M-"],
  ["sin(", "cos(", "tan(", "√(", "²"],
  ["ln(", "log(", "(", ")", "^"],
  ["7", "8", "9", "÷", "%"],
  ["4", "5", "6", "×", "1/x"],
  ["1", "2", "3", "-", "π"],
  ["0", ".", "e", "+", "="],
];

const CALC_LABELS = {
  "sin(": "sin", "cos(": "cos", "tan(": "tan", "√(": "√", "ln(": "ln", "log(": "log",
  "×": "×", "÷": "÷", "1/x": "1/x", "²": "x²", "^": "xʸ",
};

function calcToEvalString(display, mode) {
  let s = display;
  s = s.replace(/e/g, "(Math.E)");
  s = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/π/g, "(Math.PI)");
  s = s.replace(/√\(/g, "Math.sqrt(");
  const trigPrefix = mode === "DEG" ? "(Math.PI/180)*" : "";
  s = s.replace(/sin\(/g, `Math.sin(${trigPrefix}`);
  s = s.replace(/cos\(/g, `Math.cos(${trigPrefix}`);
  s = s.replace(/tan\(/g, `Math.tan(${trigPrefix}`);
  s = s.replace(/ln\(/g, "Math.log(");
  s = s.replace(/log\(/g, "Math.log10(");
  s = s.replace(/\^/g, "**");
  s = s.replace(/²/g, "**2");
  s = s.replace(/%/g, "/100");
  return s;
}

function calcSafeEval(display, mode) {
  if (!display.trim()) return null;
  try {
    const evalStr = calcToEvalString(display, mode);
    const fn = new Function(`"use strict"; return (${evalStr});`);
    const result = fn();
    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch (e) {
    return null;
  }
}

function calcFormat(n) {
  if (Math.abs(n) < 1e-12) n = 0;
  const rounded = parseFloat(n.toPrecision(12));
  return rounded.toString();
}

function calcPress(token) {
  if (token === "=") {
    const result = calcSafeEval(calcState.expr, calcState.mode);
    calcState.expr = result == null ? "Lỗi" : calcFormat(result);
  } else if (token === "AC") {
    calcState.expr = "";
  } else if (token === "DEL") {
    calcState.expr = calcState.expr.slice(0, -1);
  } else if (token === "±") {
    calcState.expr = calcState.expr.startsWith("-(") && calcState.expr.endsWith(")")
      ? calcState.expr.slice(2, -1)
      : `-(${calcState.expr || "0"})`;
  } else if (token === "1/x") {
    calcState.expr = `1/(${calcState.expr || "0"})`;
  } else if (token === "mode") {
    calcState.mode = calcState.mode === "DEG" ? "RAD" : "DEG";
  } else if (token === "MC") {
    calcState.memory = 0;
  } else if (token === "MR") {
    calcState.expr += calcFormat(calcState.memory);
  } else if (token === "M+" || token === "M-") {
    const val = calcSafeEval(calcState.expr, calcState.mode);
    if (val != null) calcState.memory += token === "M+" ? val : -val;
  } else if (calcState.expr === "Lỗi") {
    calcState.expr = /[0-9.]/.test(token) ? token : "";
  } else {
    calcState.expr += token;
  }
  renderCalculator();
}

function calcPreview() {
  if (!calcState.expr || calcState.expr === "Lỗi") return "";
  const result = calcSafeEval(calcState.expr, calcState.mode);
  return result == null ? "" : calcFormat(result);
}

function openCalculator() {
  calcState.open = true;
  renderCalculator();
}

function closeCalculator() {
  calcState.open = false;
  const el = document.getElementById("calc-modal-root");
  if (el) el.innerHTML = "";
}

function renderCalculator() {
  const root = document.getElementById("calc-modal-root");
  if (!calcState.open) {
    if (root) root.innerHTML = "";
    return;
  }
  const preview = calcPreview();
  root.innerHTML = `
    <div class="modal-backdrop" id="calc-backdrop">
      <div class="calc-card pop-in" role="dialog" aria-label="Máy tính">
        <div class="calc-header">
          <span class="calc-title">${icon("calculator")} Máy tính khoa học</span>
          <button class="icon-btn" id="calc-close">${icon("x")}</button>
        </div>
        <div class="calc-display">
          <div class="calc-sub-row">
            <span class="calc-mode">${calcState.mode}${calcState.memory !== 0 ? " · M" : ""}</span>
          </div>
          <div class="calc-expr">${calcState.expr || "0"}</div>
          <div class="calc-preview">${preview}</div>
        </div>
        <div class="calc-grid">
          ${CALC_BUTTONS.flat()
            .map((t) => {
              const label = t === "mode" ? calcState.mode : CALC_LABELS[t] || t;
              const cls = ["AC", "DEL", "±"].includes(t)
                ? "calc-btn calc-btn-fn"
                : t === "="
                ? "calc-btn calc-btn-eq"
                : /^[0-9.]$/.test(t)
                ? "calc-btn calc-btn-num"
                : "calc-btn";
              return `<button class="${cls}" data-calc="${t}">${label}</button>`;
            })
            .join("")}
        </div>
        <div class="calc-grid calc-grid-bottom">
          <button class="calc-btn calc-btn-fn" data-calc="AC">AC</button>
          <button class="calc-btn calc-btn-fn" data-calc="DEL">DEL</button>
          <button class="calc-btn calc-btn-fn" data-calc="±">±</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("calc-close").addEventListener("click", closeCalculator);
  document.getElementById("calc-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "calc-backdrop") closeCalculator();
  });
  root.querySelectorAll("[data-calc]").forEach((btn) => {
    btn.addEventListener("click", () => calcPress(btn.getAttribute("data-calc")));
  });
}

document.addEventListener("keydown", (e) => {
  if (!calcState.open) return;
  if (e.key === "Escape") return closeCalculator();
  if (e.key === "Enter") return calcPress("=");
  if (e.key === "Backspace") return calcPress("DEL");
  if (/^[0-9.+\-()]$/.test(e.key)) return calcPress(e.key);
  if (e.key === "*") return calcPress("×");
  if (e.key === "/") return calcPress("÷");
});
