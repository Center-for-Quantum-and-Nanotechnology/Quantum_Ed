# Quantum Circuits

A circuit is a diagram of steps. Read it from left to right, and trace what each step does.

## From a Table to a Diagram

On the [previous page](multi-qubit-systems.md), we made the Bell state with steps described in words and tables: H on q₀, then CNOT.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Before</span><span>The Bell state is made by H on q₀, then CNOT</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Now</span><span>Those steps have been described in words and tables</span></div>
  </div>
</div>

> **How can we write these steps down as a diagram?**

You have seen the answer once already. The [software stack page](../05-software-stack/understanding-the-quantum-software-stack.md) drew this same Bell-state circuit, and noticed that a circuit is an instruction, not a state. This page shows how to read that drawing, how to draw your own, and how to trace what each step does.

## Reading a Circuit

A circuit diagram has a few parts. Keep them apart:

- **Wire** — one line for each qubit, with q₀ on the top.
- **Initial state** — what the qubit starts in, written beside its wire.
- **Gate** — a labelled box on a wire, or a dot joined to a ⊕ for CNOT.
- **Column** — one step. Read the columns from left to right.
- **Measurement symbol** — a meter, which ends its wire.

The symbols for the gates you know, and for measurement:

<div class="qed-demo" id="qc-symbols"></div>

The dot on a CNOT is the **control** and the ⊕ is the **target**. Here is a circuit to read: the two wires start in |0⟩.

<div class="qed-demo" id="qc-read"></div>

Read it aloud: “H on q₀, then CNOT with q₀ as the control and q₁ as the target.”

!!! question "Is the circuit the state?"
    No. The circuit is the instruction. The state is what the instruction produces from the initial states.

## Tracing a Circuit

**Tracing** a circuit means asking, after each step, what the state is and what its outcome probabilities are. Here is the Bell circuit traced from |00⟩:

<div class="qed-demo" id="qc-trace-bell"></div>

Why? H made q₀ an even mix, so 00 and 10 are equally likely. CNOT then flipped q₁ on the part of the state where q₀ is 1, so 10 became 11. The result is the Bell state: 00 and 11, each half the time.

The bars are the probabilities of the outcomes, not results. Tracing is something we do to the circuit on paper. It does not say how an outcome is observed.

## Circuit Builder

Choose what each wire starts in. Then choose a gate from the palette, and press a cell to place it. Press a filled cell to remove it. The trace updates after every change, and the page tells you if a placement is not allowed.

<div class="qed-demo qed-cb" id="qc-builder">
  <p class="qed-demo__step"><strong>1. Choose what each wire starts in</strong></p>
  <p class="qed-editor__amp-title"><strong>q₀ starts in</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Start state of q0" id="qc-in0"></div>
  <p class="qed-editor__amp-title"><strong>q₁ starts in</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Start state of q1" id="qc-in1"></div>

  <p class="qed-demo__step"><strong>2. Choose a gate, then press a cell</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Gate palette" id="qc-palette"></div>
  <div id="qc-anglebox" hidden>
    <p class="qed-editor__amp-title"><strong>Rotation angle</strong> (degrees)</p>
    <div class="qed-editor__inputs">
      <input type="range" id="qc-angle-range" min="0" max="360" step="1" value="90" aria-label="Rotation angle in degrees, slider">
      <input type="number" id="qc-angle-num" min="0" max="360" step="1" value="90" aria-label="Rotation angle in degrees, typed value">
    </div>
  </div>
  <div class="qed-cb__grid" id="qc-grid" role="group" aria-label="Circuit grid: two wires and five steps"></div>
  <p class="qed-editor__validity" id="qc-message" hidden></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="qc-reset">Reset</button>
  </div>

  <p class="qed-demo__step"><strong>3. Choose a goal</strong> (or play freely)</p>
  <div class="qed-demo__controls">
    <label for="qc-goal" class="qed-sr-only">Goal</label>
    <select id="qc-goal" class="qed-cb__select"></select>
  </div>
  <p class="qed-editor__details" id="qc-goaltext"></p>
  <div class="qed-demo__controls" id="qc-goalbuttons" hidden>
    <button type="button" class="qed-button" id="qc-check">Check my circuit</button>
    <button type="button" class="qed-button qed-button--secondary" id="qc-hint">Show a hint</button>
    <button type="button" class="qed-button qed-button--secondary" id="qc-solution">Show one solution</button>
  </div>
  <p class="qed-quiz__feedback" id="qc-goalfeedback" aria-live="polite"></p>

  <p class="qed-demo__step"><strong>4. The circuit</strong></p>
  <p class="qed-editor__details" id="qc-inputs"></p>
  <div id="qc-drawing"></div>
  <p class="qed-editor__details" id="qc-summary"></p>

  <p class="qed-demo__step"><strong>5. The trace</strong></p>
  <div id="qc-trace"></div>

  <div class="qed-sr-only" id="qc-live" role="status" aria-live="polite"></div>
</div>

The circuit, the trace, the message, and the goal result each sit in their own place. The trace shows the state and its probabilities after each step.

Now try one yourself. Choose **goal (d)** above: turn |0⟩ into certain 1 **without using X**. Check it in the builder.

Check your understanding. First, predict before the trace appears:

<div class="qed-demo" id="qc-quiz-predict"></div>
<div class="qed-demo" id="qc-predict-trace" hidden></div>

Then read the order:

<div class="qed-demo" id="qc-quiz-order"></div>

## What the Diagram Does Not Say

Two things in a diagram are **conventions**.

**Reading order**
:   Circuits are read from left to right, with q₀ on the top wire. These are conventions of this module. Other tools may order wires and bit strings differently.

**Physical time**
:   The diagram says what to do and in what order the maths is applied. It does not say when a machine does each step.

Steps in the **same column** act on different wires, so their order does not matter. Here are two circuits with the same two gates, one with them in the same column and one with them in two columns:

<div class="qed-demo" id="qc-columns"></div>

A real machine may run steps at overlapping times, reorder independent ones, or compile them into different steps. That belongs to [Module 05](../05-software-stack/understanding-the-quantum-software-stack.md), which this page only points to. A diagram is not a timeline.

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### Tracing with amplitudes

At this level, a trace can show the state itself. The builder's trace now lists the four-component vector after each step, and the matrix of the step. For the Bell circuit from \(|00\rangle\), in the order 00, 01, 10, 11:

\[ \begin{pmatrix}1\\0\\0\\0\end{pmatrix} \xrightarrow{\;H\otimes I\;} \frac{1}{\sqrt 2}\begin{pmatrix}1\\0\\1\\0\end{pmatrix} \xrightarrow{\;\mathrm{CNOT}\;} \frac{1}{\sqrt 2}\begin{pmatrix}1\\0\\0\\1\end{pmatrix}. \]

The first factor is q₀, so H on q₀ is \(H\otimes I\). In a circuit that has CNOT with q₁ as the control and q₀ as the target, the matrix exchanges the amplitudes of 01 and 11 instead:

\[ \mathrm{CNOT}_{q_0\to q_1} = \begin{pmatrix}1&0&0&0\\0&1&0&0\\0&0&0&1\\0&0&1&0\end{pmatrix},\qquad \mathrm{CNOT}_{q_1\to q_0} = \begin{pmatrix}1&0&0&0\\0&0&0&1\\0&0&1&0\\0&1&0&0\end{pmatrix}. \]

**Two reading orders.** The diagram reads left to right, and the matrix product reads right to left. The Bell circuit is H first, then CNOT, so

\[ \mathrm{CNOT}\,(H\otimes I)\,|00\rangle = \frac{|00\rangle + |11\rangle}{\sqrt 2}, \]

with the gate applied first written next to the state.

</div>

<div class="qed-level" data-min-level="intermediate" markdown="1">

### Parameters and identities

**Rotation gates in a circuit.** A rotation gate takes an angle, and the builder's palette now offers \(R_X\), \(R_Y\), and \(R_Z\) with an angle slider. For \(R_Y(\theta)\) on q₀ starting in \(|0\rangle\), the probability that q₀ gives 1 is \(\sin^2(\theta/2)\), so \(\theta = 60^\circ\) gives 25%. Try it, and read the vector in the trace.

**Two identities.** Two circuits can do the same job. Tracing \(|0\rangle\) through H, Z, H gives

\[ |0\rangle \xrightarrow{H} |+\rangle \xrightarrow{Z} |-\rangle \xrightarrow{H} |1\rangle, \]

the same as X does, so \(HZH = X\). Multiplying the matrices confirms it, written right to left:

\[ HZH = \frac{1}{2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}\begin{pmatrix}1&0\\0&-1\end{pmatrix}\begin{pmatrix}1&1\\1&-1\end{pmatrix} = \begin{pmatrix}0&1\\1&0\end{pmatrix}. \]

The other identity is \(HXH = Z\):

\[ |0\rangle \xrightarrow{H} |+\rangle \xrightarrow{X} |+\rangle \xrightarrow{H} |0\rangle,\qquad |1\rangle \xrightarrow{H} |-\rangle \xrightarrow{X} -|-\rangle \xrightarrow{H} -|1\rangle . \]

X leaves \(|+\rangle\) alone and turns \(|-\rangle\) into \(-|-\rangle\), and the result matches \(Z|0\rangle = |0\rangle\) and \(Z|1\rangle = -|1\rangle\). Check both in the builder.

**Code export** (turning a drawn circuit into a program) is a later addition and is not part of this page.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Naming the formalism

The **[circuit depth](../glossary.md#circuit-depth)** is the number of steps a circuit needs, and it matters because every step takes time on a real machine. Circuit identities such as the two above are a tool for rewriting a circuit into a shorter or simpler one that does the same job. And gates are split into **Clifford** gates, such as H, S, and CNOT, and non-Clifford gates, such as T, a split that matters for how hard a circuit is to simulate. Later material makes these ideas precise.

</div>

## From Circuits to Measurement

Compare what you can do now with what is still unknown.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>So far</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write the steps as a circuit</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Read and build one</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Trace the probabilities at each step</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Still unknown</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>See what a measurement returns</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>See a result rather than a probability</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>See what happens to the state afterwards</span></div>
    </div>
  </div>
</div>

Here is the Bell circuit ending in two measurement symbols, with the probabilities it would give:

<div class="qed-demo" id="qc-final"></div>

A trace shows what a measurement would give. A measurement gives one outcome at a time, and we have not yet looked at what happens when we repeat it.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Steps on wires</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Read left to right</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Trace the state and its probabilities at each step</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Build to a goal, and know the diagram is a convention, not a clock</span></div>
</div>

A circuit is a diagram of steps on wires. Read it from left to right, trace the state and its probabilities after each step, and remember that the diagram says what to do, not when a machine does it.

> **How do these probabilities turn into the results we actually see?**

**Next: Measurement →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedQubit;
  var G = window.QedGates;
  var T = window.QedTwoQubit;
  var S = window.QedShots;
  var QL = window.QedLevel;
  var Z = window.QedQuiz;
  var C = window.QedCircuit;
  var R = window.QedTrace;
  var EPS = 1e-9;
  var LABELS = S.defaultLabels(4); // ["00", "01", "10", "11"], the order used everywhere on this page

  function $(id) { return document.getElementById(id); }
  function pct(p) { return Math.round(p * 1000) / 10; }
  function num(x) {
    var t = Math.abs(x).toFixed(2).replace(/\.?0+$/, "");
    return (x < 0 && t !== "0" ? "−" : "") + t;
  }
  function cell(z) {
    if (Math.abs(z.im) < EPS) return num(z.re);
    var im = Math.abs(z.im);
    var imText = Math.abs(im - 1) < 1e-6 ? "i" : num(im) + "i";
    if (Math.abs(z.re) < EPS) return (z.im < 0 ? "−" : "") + imText;
    return "(" + num(z.re) + (z.im < 0 ? " − " : " + ") + imText + ")";
  }
  function qn(i) { return C.qubitName(i); }
  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

  var PRESETS = Q.PRESETS;
  function preset(id) { return PRESETS.filter(function (p) { return p.id === id; })[0]; }
  var BEGINNER_STARTS = ["zero", "one"];
  var BEGINNER_GATES = ["h", "x", "z"];
  var INTERMEDIATE_GATES = ["y", "s", "t"];
  var ROTATIONS = ["rx", "ry", "rz"];
  var INTERMEDIATE_IDS = INTERMEDIATE_GATES.concat(ROTATIONS);

  function probRows(p) {
    return LABELS.map(function (l, i) { return { label: l, fraction: p[i], text: pct(p[i]) + "%" }; });
  }
  function opsOf(list) { return { qubits: ["q0", "q1"], maxColumns: 5, ops: list }; }
  function gateOp(id, wire, col) {
    var g = G.gate(id);
    return { type: "gate", gateId: id, label: g.label, name: g.name, targets: [wire], col: col };
  }
  function cxOp(control, col) { return { type: "cx", control: control, target: 1 - control, col: col }; }
  function meterOp(wire, col) { return { type: "measure", targets: [wire], col: col }; }

  // ---- the trace, as rows -----------------------------------------------------------
  function matrixCols(entries, cols) {
    return '<span class="qed-matrix" style="grid-template-columns: repeat(' + cols + ', auto);">' +
      entries.map(function (e) { return "<span>" + e + "</span>"; }).join("") + "</span>";
  }
  function matrixLine(step, from) {
    var entries = [];
    step.matrix.forEach(function (row) { row.forEach(function (z) { entries.push(cell(z)); }); });
    var spoken = "The matrix of this step times the column " + from.map(cell).join(", ") + " gives the column " + step.state.map(cell).join(", ") + ".";
    return '<div class="qed-matrixline" role="group" aria-label="' + spoken + '">' +
      matrixCols(entries, 4) + '<span aria-hidden="true">×</span>' + matrixCols(from.map(cell), 1) +
      '<span aria-hidden="true">=</span>' + matrixCols(step.state.map(cell), 1) + "</div>";
  }

  function traceHTML(trace, inter) {
    return trace.steps.map(function (st, k) {
      var title = k === 0 ? "Start" : st.label.charAt(0).toUpperCase() + st.label.slice(1);
      var html = '<div class="qed-cb__step"><p class="qed-cb__steptitle"><strong>' + title + "</strong> — " + st.name.text + "</p>";
      if (st.measured.length) {
        html += '<p class="qed-editor__note">What a measurement here would show: probabilities, not a result.</p>';
      }
      html += S.renderBars(probRows(st.probabilities));
      html += '<p class="qed-editor__details">Amplitudes, for listing only: ' + st.state.map(function (z, i) { return LABELS[i] + ": " + cell(z); }).join(" · ") + ".</p>";
      if (inter) {
        html += '<p class="qed-editor__details">Four-component vector (00, 01, 10, 11): (' + st.state.map(cell).join(", ") + ").</p>";
        if (k > 0) html += matrixLine(st, trace.steps[k - 1].state);
      }
      return html + "</div>";
    }).join("");
  }

  function summaryOf(trace) {
    var last = trace.final;
    return trace.steps.map(function (s, k) { return (k === 0 ? "Start: " : s.label + ": ") + s.name.text; }).join(". ") + ". Final probabilities: " + T.describe(last.state);
  }

  // ---- static pictures built from the shared modules -------------------------------
  function symbolSVG(label, name) {
    return C.renderSVG({ qubits: ["q0"], ops: [{ type: "gate", label: label, name: name, targets: [0], col: 0 }] }, { neutral: true, ariaLabel: "The " + name + " gate symbol" });
  }

  function buildSymbols() {
    var rows = [
      ["H", symbolSVG("H", "H"), "A gate on one wire: an even mix of 0 and 1 from a definite value."],
      ["X", symbolSVG("X", "X"), "A gate on one wire: flips 0 and 1."],
      ["Z", symbolSVG("Z", "Z"), "A gate on one wire: flips the phase."],
      ["CNOT", C.renderSVG({ qubits: ["q0", "q1"], ops: [{ type: "cx", control: 0, target: 1, col: 0 }] }, { neutral: true, ariaLabel: "The CNOT symbol: a dot on q0 joined to a circled plus on q1" }),
        "A gate on both wires: the dot is the control and the ⊕ is the target. It flips the target on the part of the state where the control is 1."],
      ["Measurement", C.renderSVG({ qubits: ["q0"], ops: [{ type: "measure", targets: [0], col: 0 }] }, { neutral: true, ariaLabel: "The measurement symbol: a meter on q0" }),
        "A meter at the end of a wire: the read-out. Nothing follows it on that wire."]
    ].map(function (r) { return "<tr><th scope=\"row\">" + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>"; }).join("");
    $("qc-symbols").innerHTML = '<table class="qed-comparison-table"><thead><tr><th scope="col">Name</th><th scope="col">Symbol</th><th scope="col">What it means</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  var BELL_CIRCUIT = opsOf([gateOp("h", 0, 0), cxOp(0, 1)]);

  function buildRead() {
    $("qc-read").innerHTML = '<p class="qed-editor__details">q₀ starts in |0⟩ and q₁ starts in |0⟩.</p>' +
      C.renderSVG(BELL_CIRCUIT, { neutral: true, ariaLabel: "Circuit on two qubits: " + C.summarize(BELL_CIRCUIT) + "." });
  }

  function buildBellTrace() {
    $("qc-trace-bell").innerHTML = traceHTML(R.run(BELL_CIRCUIT), false);
  }

  function buildColumns() {
    var together = opsOf([gateOp("h", 0, 0), gateOp("x", 1, 0)]);
    var apart = opsOf([gateOp("h", 0, 0), gateOp("x", 1, 1)]);
    function panel(circuit, title) {
      var t = R.run(circuit);
      return "<div><p><strong>" + title + "</strong></p>" + C.renderSVG(circuit, { neutral: true, ariaLabel: title + ": " + C.summarize(circuit) + "." }) +
        S.renderBars(probRows(t.final.probabilities)) + "<p class=\"qed-editor__details\">" + t.final.name.text + ".</p></div>";
    }
    $("qc-columns").innerHTML = '<div class="qed-twoq__tables">' + panel(together, "H and X in the same column") + panel(apart, "H, then X, in two columns") + "</div>" +
      '<p class="qed-editor__validity is-valid">= Same result. The two gates act on different wires, so it does not matter whether they share a column.</p>';
  }

  function buildFinal() {
    var circuit = C.bell(); // H, CNOT, then a measurement on each wire, the drawing used on the software stack page
    var t = R.run(circuit);
    $("qc-final").innerHTML = C.renderSVG(circuit, { neutral: true, ariaLabel: "Circuit on two qubits: H on q0, then CNOT, then a measurement of both." }) +
      "<p><strong>What a measurement here would show: probabilities, not a result.</strong></p>" + S.renderBars(probRows(t.final.probabilities));
  }

  // ---- the builder ------------------------------------------------------------------
  var circuit = C.emptyCircuit(5);
  var in0 = "zero";
  var in1 = "zero";
  var selected = "h";
  var angle = 90;
  var message = "";
  var announce = "";
  var goalId = "free";

  function isRotation(id) { return ROTATIONS.indexOf(id) >= 0; }

  function paletteItems() {
    var inter = QL.atLeast("intermediate");
    var ids = BEGINNER_GATES.concat(inter ? INTERMEDIATE_GATES : []);
    var items = ids.map(function (id) { return { id: id, text: G.gate(id).name }; }); // the palette comes from QedGates, in this order
    items.push({ id: "cnot", text: "CNOT" });
    if (inter) ROTATIONS.forEach(function (id) { items.push({ id: id, text: "R" + id.charAt(1).toUpperCase() }); });
    items.push({ id: "measure", text: "Measure" });
    return items;
  }

  function makeOp(id, wire, col) {
    if (id === "cnot") return cxOp(wire, col);
    if (id === "measure") return meterOp(wire, col);
    if (isRotation(id)) {
      var g = G.rotation(id.charAt(1), angle);
      return { type: "gate", gateId: id, label: g.label, name: g.name, targets: [wire], col: col, angleDeg: angle };
    }
    return gateOp(id, wire, col);
  }

  function cellInfo(wire, col) {
    var op = C.opAt(circuit, wire, col);
    var where = qn(wire) + ", step " + (col + 1);
    if (!op) return { text: "+", name: where + ", empty", cls: "is-empty" };
    if (op.type === "cx") {
      var control = op.control === wire;
      return { text: control ? "●" : "⊕", name: where + ", CNOT " + (control ? "control" : "target"), cls: "" };
    }
    if (op.type === "measure") return { text: "M", name: where + ", measurement", cls: "" };
    // a rotation shows its axis in the cell and its angle in the name and the drawing
    var shown = op.angleDeg !== undefined ? (op.name || op.label).split("(")[0] : op.label;
    return { text: shown, name: where + ", " + (op.name || op.label), cls: "" };
  }

  function buildGrid() {
    var grid = $("qc-grid");
    var focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset : {};
    grid.innerHTML = "";
    for (var wire = 0; wire < 2; wire++) {
      var label = document.createElement("span");
      label.className = "qed-cb__wire";
      label.textContent = qn(wire);
      grid.appendChild(label);
      for (var col = 0; col < circuit.maxColumns; col++) {
        var info = cellInfo(wire, col);
        var b = document.createElement("button");
        b.type = "button";
        b.className = "qed-button qed-button--secondary qed-cb__cell " + info.cls;
        b.textContent = info.text;
        b.dataset.wire = wire;
        b.dataset.col = col;
        b.setAttribute("aria-label", info.name);
        b.addEventListener("click", activate);
        grid.appendChild(b);
      }
    }
    if (focused.wire !== undefined && focused.col !== undefined) {
      var again = grid.querySelector('button[data-wire="' + focused.wire + '"][data-col="' + focused.col + '"]');
      if (again) again.focus();
    }
  }

  function activate() {
    var wire = parseInt(this.dataset.wire, 10);
    var col = parseInt(this.dataset.col, 10);
    var hit = C.opAt(circuit, wire, col);
    if (hit) {
      var what = hit.type === "cx" ? "the CNOT" : hit.type === "measure" ? "the measurement" : "the " + (hit.name || hit.label) + " gate";
      circuit = C.remove(circuit, wire, col);
      message = "";
      announce = "Removed " + what + " from " + qn(wire) + ", step " + (col + 1) + ".";
    } else {
      var r = C.place(circuit, makeOp(selected, wire, col));
      if (r.ok) {
        circuit = r.circuit;
        message = "";
        announce = "Placed " + C.summarize({ qubits: circuit.qubits, ops: [makeOp(selected, wire, col)] }) + " in step " + (col + 1) + ".";
      } else {
        message = r.problem;
        announce = "Not allowed. " + r.problem;
      }
    }
    render();
  }

  function startStates() { return [preset(in0).state, preset(in1).state]; }

  function render() {
    var inter = QL.atLeast("intermediate");
    var trace = R.run(circuit, startStates());

    // the palette and the start states
    Array.prototype.forEach.call($("qc-palette").querySelectorAll("button"), function (b) {
      var on = b.dataset.id === selected;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("qc-anglebox").hidden = !isRotation(selected);
    ["qc-in0", "qc-in1"].forEach(function (box, i) {
      var id = i === 0 ? in0 : in1;
      Array.prototype.forEach.call($(box).querySelectorAll("button"), function (b) {
        var on = b.dataset.id === id;
        b.classList.toggle("qed-button--active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });

    buildGrid();

    // the message, in words and with an icon
    var msg = $("qc-message");
    msg.hidden = !message;
    msg.className = "qed-editor__validity is-invalid";
    msg.textContent = message ? "✗ " + message : "";

    // the circuit and the trace, in separate places
    $("qc-inputs").textContent = "q₀ starts in " + preset(in0).name + " and q₁ starts in " + preset(in1).name + ".";
    $("qc-drawing").innerHTML = C.renderSVG(circuit, { neutral: true, ariaLabel: "Circuit on two qubits: " + C.summarize(circuit) });
    $("qc-summary").textContent = C.summarize(circuit);
    $("qc-trace").innerHTML = traceHTML(trace, inter);

    // the goal
    renderGoal();

    $("qc-live").textContent = (announce ? announce + " " : "") + $("qc-inputs").textContent + " " + C.summarize(circuit) + ". " + summaryOf(trace);
    announce = "";
  }

  // ---- guided goals -----------------------------------------------------------------
  function count(ops, pred) { return ops.filter(pred).length; }
  function near(a, b) { return Math.abs(a - b) < 0.005; }
  function probsText(p) { return LABELS.map(function (l, i) { return l + ": " + pct(p[i]) + "%"; }).join(", "); }

  var GOALS = {
    a: {
      label: "(a) Make q₀ certain 1 with one gate",
      text: "Both wires start in |0⟩. Use one gate to make q₀ certain to show 1.",
      hint: "Which gate flips a 0 into a 1?",
      solution: function () { return [gateOp("x", 0, 0)]; },
      check: function (t) {
        var gates = count(circuit.ops, function (o) { return o.type !== "measure"; });
        var p = t.final.probabilities;
        var q0one = p[2] + p[3];
        if (!near(q0one, 1)) return { ok: false, text: "q₀ shows 1 " + pct(q0one) + "% of the time, not always. Which gate turns a 0 into a 1?" };
        if (gates !== 1) return { ok: false, text: "q₀ is certain 1, but you used " + gates + " gates and this goal asks for one." };
        return { ok: true, text: "Yes. One X gate flips q₀ from 0 to 1, so q₀ is certain to show 1." };
      }
    },
    b: {
      label: "(b) Make q₀ an even mix",
      text: "Both wires start in |0⟩. Make q₀ equally likely to show 0 or 1, and leave q₁ alone.",
      hint: "Which gate turns a definite value into an even mix?",
      solution: function () { return [gateOp("h", 0, 0)]; },
      check: function (t) {
        var p = t.final.probabilities;
        if (near(p[0], 0.5) && near(p[2], 0.5) && near(p[1], 0) && near(p[3], 0)) return { ok: true, text: "Yes. H made q₀ an even mix: 00 and 10 are each 50%, and q₁ is still 0." };
        return { ok: false, text: "Your circuit gives " + probsText(p) + ". Aim for 00 and 10 at 50% each." };
      }
    },
    c: {
      label: "(c) Make the Bell state",
      text: "Both wires start in |0⟩. Make the joint outcomes 00 and 11 each 50%, with 01 and 10 never.",
      hint: "Make q₀ an even mix, then link q₁ to it with a CNOT.",
      solution: function () { return [gateOp("h", 0, 0), cxOp(0, 1)]; },
      check: function (t) {
        var p = t.final.probabilities;
        if (near(p[0], 0.5) && near(p[3], 0.5) && near(p[1], 0) && near(p[2], 0)) {
          return { ok: true, text: "Yes. 00 and 11 are each 50%. H made q₀ an even mix, and the CNOT flipped q₁ on the part where q₀ is 1, so the pair is now in " + t.final.name.text + "." };
        }
        return { ok: false, text: "Your circuit gives " + probsText(p) + ". Aim for 00 and 11 at 50% each." };
      }
    },
    d: {
      label: "(d) Make |0⟩ certain 1 without X",
      text: "Both wires start in |0⟩. Turn q₀ into a certain 1, but do not use the X gate.",
      hint: "Make an even mix, change its phase, then turn the mix back into a definite value.",
      solution: function () { return [gateOp("h", 0, 0), gateOp("z", 0, 1), gateOp("h", 0, 2)]; },
      check: function (t) {
        var usesX = count(circuit.ops, function (o) { return o.gateId === "x"; }) > 0;
        var p = t.final.probabilities;
        if (usesX) return { ok: false, text: "This goal is to get q₀ to 1 without the X gate. Take it out and try another way." };
        if (near(p[2], 1)) {
          return { ok: true, text: "Yes. q₀ is certain 1 without X, so two different circuits do the same job. In the trace, look for a step where the probabilities stay put but the state's name changes: that step changed the phase, and the next H turned the phase into a probability." };
        }
        return { ok: false, text: "Your circuit gives " + probsText(p) + ". Aim for 10 at 100%." };
      }
    }
  };

  function renderGoal() {
    var g = GOALS[goalId];
    $("qc-goalbuttons").hidden = !g;
    $("qc-goaltext").textContent = g ? g.text : "Free play: no goal. Place any gates and watch the trace.";
  }

  function chooseGoal(id) {
    goalId = id;
    $("qc-goalfeedback").textContent = "";
    $("qc-goalfeedback").className = "qed-quiz__feedback";
    if (GOALS[id]) {
      in0 = "zero";
      in1 = "zero";
      circuit = C.emptyCircuit(5);
      message = "";
      announce = "Goal chosen. The wires and the circuit were reset.";
    }
    render();
  }

  function feedback(ok, text) {
    var fb = $("qc-goalfeedback");
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
  }

  $("qc-check").addEventListener("click", function () {
    var g = GOALS[goalId];
    if (!g) return;
    if (in0 !== "zero" || in1 !== "zero") {
      feedback(false, "This goal starts with both wires in |0⟩. Set them back to |0⟩ and check again.");
      return;
    }
    var res = g.check(R.run(circuit, startStates()));
    feedback(res.ok, res.text);
  });
  $("qc-hint").addEventListener("click", function () {
    var g = GOALS[goalId];
    if (g) { var fb = $("qc-goalfeedback"); fb.className = "qed-quiz__feedback"; fb.textContent = "Hint: " + g.hint; }
  });
  $("qc-solution").addEventListener("click", function () {
    var g = GOALS[goalId];
    if (!g) return;
    in0 = "zero";
    in1 = "zero";
    circuit = opsOf(g.solution());
    message = "";
    announce = "One solution is loaded.";
    var fb = $("qc-goalfeedback");
    fb.className = "qed-quiz__feedback";
    fb.textContent = "One solution is loaded: " + C.summarize(circuit) + ". Other circuits may work too.";
    render();
  });

  // ---- controls ---------------------------------------------------------------------
  function buildControls() {
    function fillStarts(boxId, setter) {
      var box = $(boxId);
      PRESETS.forEach(function (p) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "qed-button qed-button--secondary";
        b.textContent = p.name;
        b.dataset.id = p.id;
        b.setAttribute("aria-pressed", "false");
        if (BEGINNER_STARTS.indexOf(p.id) < 0) b.dataset.level = "intermediate";
        b.addEventListener("click", function () { setter(p.id); message = ""; render(); });
        box.appendChild(b);
      });
    }
    fillStarts("qc-in0", function (id) { in0 = id; });
    fillStarts("qc-in1", function (id) { in1 = id; });
    var goal = $("qc-goal");
    var free = document.createElement("option");
    free.value = "free";
    free.textContent = "Free play (no goal)";
    goal.appendChild(free);
    Object.keys(GOALS).forEach(function (k) {
      var o = document.createElement("option");
      o.value = k;
      o.textContent = GOALS[k].label;
      goal.appendChild(o);
    });
    goal.addEventListener("change", function () { chooseGoal(this.value); });
  }

  function buildPalette() {
    var box = $("qc-palette");
    box.innerHTML = "";
    var items = paletteItems();
    if (!items.some(function (i) { return i.id === selected; })) selected = "h";
    items.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = item.text;
      b.dataset.id = item.id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { selected = item.id; message = ""; render(); });
      box.appendChild(b);
    });
  }

  $("qc-angle-range").addEventListener("input", function () {
    angle = parseFloat(this.value);
    $("qc-angle-num").value = angle;
  });
  $("qc-angle-num").addEventListener("input", function () {
    var v = parseFloat(this.value);
    if (isNaN(v)) return;
    var c = clamp(v, 0, 360);
    angle = c;
    $("qc-angle-range").value = c;
    if (c !== v) {
      this.value = c;
      message = "The rotation angle runs from 0° to 360°, so " + c + "° is used.";
      render();
    }
  });
  $("qc-reset").addEventListener("click", function () {
    circuit = C.emptyCircuit(5);
    in0 = "zero";
    in1 = "zero";
    selected = "h";
    goalId = "free";
    $("qc-goal").value = "free";
    message = "";
    announce = "The circuit was reset.";
    $("qc-goalfeedback").textContent = "";
    $("qc-goalfeedback").className = "qed-quiz__feedback";
    buildPalette();
    render();
  });

  // ---- level-aware behavior (additive) ---------------------------------------------
  function applyLevel() {
    var inter = QL.atLeast("intermediate");
    ["qc-in0", "qc-in1"].forEach(function (box) {
      Array.prototype.forEach.call($(box).querySelectorAll("button[data-level='intermediate']"), function (b) { b.hidden = !inter; });
    });
    if (!inter) {
      var usesExtra = circuit.ops.some(function (o) { return INTERMEDIATE_IDS.indexOf(o.gateId) >= 0; });
      var badStart = BEGINNER_STARTS.indexOf(in0) < 0 || BEGINNER_STARTS.indexOf(in1) < 0;
      if (usesExtra || badStart) {
        circuit = C.emptyCircuit(5);
        if (BEGINNER_STARTS.indexOf(in0) < 0) in0 = "zero";
        if (BEGINNER_STARTS.indexOf(in1) < 0) in1 = "zero";
        message = "That circuit used a gate or a start state from the Intermediate view, so it was cleared.";
        announce = message;
      }
    }
    buildPalette();
    render();
  }
  QL.onChange(applyLevel);

  // ---- checks -----------------------------------------------------------------------
  var PREDICT_CIRCUIT = opsOf([gateOp("x", 0, 0), cxOp(0, 1)]);
  Z.mount($("qc-quiz-predict"), {
    title: "Predict first. Both wires start in |0⟩, and the circuit is X on q₀, then CNOT. What are the joint probabilities?",
    items: [
      {
        prompt: "Choose the table.",
        label: "Joint probabilities for X on q0 then CNOT, from 00",
        options: [
          { label: "00: 100%", correct: false, why: "That would mean nothing changed. X turned q₀ from 0 to 1, so the state is no longer 00." },
          { label: "00: 50%, 11: 50%", correct: false, why: "That is H then CNOT, the Bell circuit. X is not an even mix: it flips q₀ for certain." },
          { label: "10: 100%", correct: false, why: "That is the state after X alone. CNOT comes next, and with q₀ at 1 it flips q₁." },
          { label: "11: 100%", correct: true, why: "X made q₀ a 1. CNOT flips q₁ when q₀ is 1, so q₁ becomes 1 too, and the state is 11 for certain." }
        ]
      }
    ]
  }, {
    onAnswer: function () {
      var box = $("qc-predict-trace");
      box.hidden = false;
      box.innerHTML = "<p><strong>The trace for X on q₀, then CNOT:</strong></p>" + traceHTML(R.run(PREDICT_CIRCUIT), false);
    },
    onReset: function () { $("qc-predict-trace").hidden = true; }
  });

  Z.mount($("qc-quiz-order"), {
    title: "In the circuit H then Z on one wire, which gate acts first?",
    items: [
      {
        prompt: "Pick one, and check the feedback.",
        label: "Which gate acts first in H then Z",
        options: [
          { label: "Z, because it is written last", correct: false, why: "A circuit is read from left to right, so the gate on the left comes first. Z is the second step." },
          { label: "They act at the same time", correct: false, why: "Gates in different columns are different steps. Only gates in the same column, on different wires, do not depend on each other." },
          { label: "H, because circuits are read left to right", correct: true, why: "H is in the first column, so it is applied first, and Z is applied to the result. A machine may schedule things differently, but the circuit means H first." },
          { label: "It depends on the hardware", correct: false, why: "Hardware may run things differently, but the circuit has a meaning that does not depend on it: H first, then Z. The diagram order is the order the maths is applied, not a clock." }
        ]
      }
    ]
  });

  // ---- start ------------------------------------------------------------------------
  buildSymbols();
  buildRead();
  buildBellTrace();
  buildColumns();
  buildFinal();
  buildControls();
  buildPalette();
  applyLevel();
});
</script>
