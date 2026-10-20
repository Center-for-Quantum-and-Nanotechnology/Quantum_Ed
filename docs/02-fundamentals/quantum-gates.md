# Quantum Gates

A gate moves a state. The move can always be undone.

## From Picture to Motion

On the [previous page](bloch-sphere.md), a state became a point on a sphere. A point can sit anywhere on it, but we did not yet know how to move one.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Before</span><span>A state is a point on a sphere</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Now</span><span>A point can sit anywhere, but we do not know how to move it</span></div>
  </div>
</div>

> **How can we move a state from one point to another?**

You have already pressed the answer once. The "Apply mix (H)" button in [What Is Quantum Computing?](../01-foundations/what-is-quantum-computing.md#superposition) was a **[quantum gate](../glossary.md#quantum-gate)**, the first one you met. This page treats gates properly: what they do to a point, what they do to the probabilities, and what happens when one follows another.

## What a Gate Is

A gate is a **reversible operation that moves a state to another point**. Three words are easy to mix up, so keep them apart:

- **Gate** — an operation.
- **State** — what the gate acts on.
- **Outcome** — what a measurement shows.

!!! question "Is a gate a measurement?"
    No. A gate moves a state and can be undone. A measurement gives 0 or 1, and no later gate undoes it. A gate does not read the state at all.

Here are the five gates this page starts with, and what each one does to the sphere:

<div class="qed-demo" id="qg-words"></div>

Every gate here is a **rotation of the sphere**. X, Y, and Z each turn the point half way round, about one of the three axes. H does the same about an axis halfway between x and z. The table shows where each gate sends the six named states:

<div class="qed-demo" id="qg-sends"></div>

Read a column down. X sends |0⟩ to |1⟩ and |1⟩ to |0⟩, but |+⟩ stays where it is. H swaps |0⟩ with |+⟩. Every gate on this page can be undone: apply the gate again, or turn the other way.

## Gate Explorer

Choose a start state, then press gates to add them one after another. The sphere shows where the state started and where it is now.

<div class="qed-demo qed-gates" id="qg-explorer">
  <p class="qed-demo__step"><strong>1. Choose a start state</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Start state" id="qg-presets"></div>

  <p class="qed-demo__step"><strong>2. Add gates</strong> (up to four)</p>
  <div class="qed-demo__controls" role="group" aria-label="Gates" id="qg-gates"></div>
  <div class="qed-gates__rotation" role="group" aria-label="Rotation gate">
    <p class="qed-editor__amp-title"><strong>Rotation gate:</strong> choose an axis and an angle</p>
    <div class="qed-demo__controls" role="group" aria-label="Rotation axis" id="qg-axes"></div>
    <div class="qed-editor__inputs">
      <input type="range" id="qg-angle-range" min="0" max="360" step="1" value="90" aria-label="Rotation angle in degrees, slider">
      <input type="number" id="qg-angle-num" min="0" max="360" step="1" value="90" aria-label="Rotation angle in degrees, typed value">
    </div>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button" id="qg-rotate">Apply rotation</button>
    </div>
  </div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="qg-inverse">Undo with the inverse gate</button>
    <button type="button" class="qed-button qed-button--secondary" id="qg-remove">Remove the last gate</button>
    <button type="button" class="qed-button qed-button--secondary" id="qg-reset">Reset</button>
  </div>
  <p class="qed-editor__note" id="qg-note"></p>

  <p class="qed-demo__step"><strong>3. The chain</strong></p>
  <p class="qed-editor__details" id="qg-chain"></p>
  <div id="qg-circuit"></div>

  <p class="qed-demo__step"><strong>4. The result</strong></p>
  <div class="qed-gates__result">
    <div class="qed-gates__view">
      <canvas id="qg-canvas" width="360" height="360" role="img" aria-label="Bloch sphere."></canvas>
      <p class="qed-editor__sign">The faded diamond is where the state started. The solid point is where it is now.</p>
    </div>
    <div class="qed-gates__side">
      <div class="qed-prepared qed-prepared--live">
        <span class="qed-prepared__tag">Result</span>
        <span><span id="qg-desc"></span> <span id="qg-name"></span></span>
      </div>
      <p class="qed-editor__details" id="qg-caption"></p>
      <div id="qg-bars"></div>
    </div>
  </div>

  <div id="qg-inter" hidden>
    <p class="qed-demo__step"><strong>Intermediate readouts</strong></p>
    <p class="qed-editor__details" id="qg-form"></p>
    <div id="qg-matrix"></div>
  </div>

  <div id="qg-other" hidden>
    <p class="qed-demo__step"><strong>5. The opposite order</strong></p>
    <p class="qed-editor__details" id="qg-other-chain"></p>
    <div class="qed-gates__result">
      <div class="qed-gates__view">
        <canvas id="qg-other-canvas" width="300" height="300" role="img" aria-label="Bloch sphere for the opposite order."></canvas>
      </div>
      <div class="qed-gates__side">
        <div id="qg-other-bars"></div>
        <p class="qed-editor__validity" id="qg-verdict"></p>
      </div>
    </div>
  </div>

  <div class="qed-sr-only" id="qg-summary" role="status" aria-live="polite"></div>
</div>

The sphere, the chain, the description, and the bars each sit in their own place. The sphere is a picture of the state. The bars show what that state would give if it were measured in the Z basis.

## Z and the Hidden Phase

On the Bloch sphere page, moving around the equator changed the state but not the height. The Z gate does exactly that: it turns the point half way round the vertical axis. Apply Z to |+⟩ and the point moves to |−⟩, at the same height.

<div class="qed-demo" id="qg-phase-z"></div>

The state changed, but the Z-basis probabilities did not. Z changes the **phase**, and nothing in an immediate Z-basis measurement shows it.

Phase is not invisible for good. Apply H to both states and look at the bars:

<div class="qed-demo" id="qg-phase-h"></div>

Before H, |+⟩ and |−⟩ look the same: 50% and 50%. After H, one is certain 0 and the other is certain 1. **H turns a phase difference into a probability difference.** This is how |+⟩ and |−⟩ can be told apart. A later page measures them with shots; here we only look at the probabilities.

Check your understanding. Predict first, then compare:

<div class="qed-demo" id="qg-quiz-predict"></div>
<div class="qed-demo" id="qg-predict-bars" hidden></div>

## Rotation Gates

X, Y, and Z are half turns. A **[rotation gate](../glossary.md#rotation-gate)** generalizes them: choose an axis and an **angle**, and the point turns by that angle about the axis. X, Y, and Z are the 180° cases.

The turn follows the right-hand rule: viewed from the positive end of the axis, looking toward the centre, a positive angle turns the point counterclockwise.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:20rem;"><span>Turn about z: the point moves around the equator and the height stays the same</span></div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:20rem;"><span>Turn about x or y: the height changes</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:20rem;"><span>The angle sets the result</span></div>
</div>

Turning about z is the phase angle from the previous page, now as an operation. Try each axis and some angles in the explorer, starting from |0⟩.

Now try one yourself, using the explorer:

<div class="qed-demo" id="qg-transfer">
  <p><strong>Use a rotation to make |0⟩ give outcome 1 about 25% of the time.</strong> Start from |0⟩, add a rotation, then check.</p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="qg-transfer-check">Check my result</button>
  </div>
  <p class="qed-quiz__feedback" id="qg-transfer-feedback" aria-live="polite"></p>
</div>

## Order Matters, Sometimes

Gates are applied one after another, and a circuit diagram reads left to right. Does the order matter? Start at |+⟩ and load two chains into the explorer:

<div class="qed-demo" id="qg-examples">
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" data-start="plus" data-gates="h,z">|+⟩, then H, then Z</button>
    <button type="button" class="qed-button qed-button--secondary" data-start="plus" data-gates="z,h">|+⟩, then Z, then H</button>
    <button type="button" class="qed-button qed-button--secondary" data-start="plus" data-gates="x,z">|+⟩, then X, then Z</button>
  </div>
  <p class="qed-editor__details" id="qg-examples-note"></p>
</div>

The same two gates, H and Z, give **different points** in different orders: H then Z ends at |0⟩, and Z then H ends at |1⟩. They also give different probabilities.

Some pairs do not care. X and Z give the **same point** in either order, the same move as the Y gate. The two results differ only by a shared overall phase, which the sphere does not show. So order can matter, and sometimes it does not.

Check your understanding:

<div class="qed-demo" id="qg-quiz-which"></div>

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### Gates as matrices

A gate is a \(2\times 2\) matrix. It acts on the two amplitudes written as a column:

\[ \begin{pmatrix}\alpha'\\ \beta'\end{pmatrix} = \begin{pmatrix}a & b\\ c & d\end{pmatrix}\begin{pmatrix}\alpha\\ \beta\end{pmatrix} . \]

The five gates are

\[ I = \begin{pmatrix}1&0\\0&1\end{pmatrix},\quad X = \begin{pmatrix}0&1\\1&0\end{pmatrix},\quad Y = \begin{pmatrix}0&-i\\ i&0\end{pmatrix},\quad Z = \begin{pmatrix}1&0\\0&-1\end{pmatrix},\quad H = \frac{1}{\sqrt 2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}. \]

**Matrix–vector multiplication.** Each new amplitude is a row of the matrix times the column. For \(H\) acting on \(|0\rangle = (1, 0)\):

\[ H|0\rangle = \frac{1}{\sqrt 2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}\begin{pmatrix}1\\0\end{pmatrix} = \frac{1}{\sqrt 2}\begin{pmatrix}1\\1\end{pmatrix} = |+\rangle . \]

The explorer's matrix panel does this multiplication for each gate you apply, with the matrix, the input column, and the output column.

**Y has imaginary entries.** \(Y|0\rangle = i|1\rangle\). The amplitude \(i\) is a global phase, so on the sphere Y sends |0⟩ to |1⟩, as X does. Y is X and Z together, up to a global phase.

**A worked check: HZH = X.** Multiply the matrices, applying \(H\) first and \(H\) last, so the product is written right to left:

\[ HZH = \frac{1}{2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}\begin{pmatrix}1&0\\0&-1\end{pmatrix}\begin{pmatrix}1&1\\1&-1\end{pmatrix} = \begin{pmatrix}0&1\\1&0\end{pmatrix} = X . \]

On the sphere: turn to the x axis, flip the phase, turn back. The net effect is a half turn about x.

</div>

<div class="qed-level" data-min-level="intermediate" markdown="1">

### Rotations, S and T, and inverses

**Rotation matrices.** A rotation by \(\theta\) turns the point by \(\theta\), and the amplitudes use the **half angle**:

\[ R_X(\theta) = \begin{pmatrix}\cos\frac\theta2 & -i\sin\frac\theta2\\ -i\sin\frac\theta2 & \cos\frac\theta2\end{pmatrix},\quad R_Y(\theta) = \begin{pmatrix}\cos\frac\theta2 & -\sin\frac\theta2\\ \sin\frac\theta2 & \cos\frac\theta2\end{pmatrix},\quad R_Z(\theta) = \begin{pmatrix}e^{-i\theta/2} & 0\\ 0 & e^{i\theta/2}\end{pmatrix}. \]

So \(R_Y(\theta)|0\rangle = \cos\frac\theta2\,|0\rangle + \sin\frac\theta2\,|1\rangle\), and the probability of outcome 1 is \(\sin^2(\theta/2)\). For \(\theta = 60^\circ\) it is \(\sin^2 30^\circ = 25\%\), the result of the transfer task above.

**S and T.** Two further gates turn the point about z: \(S\) by a quarter turn and \(T\) by an eighth of a turn. As matrices,

\[ S = \begin{pmatrix}1&0\\0&i\end{pmatrix},\qquad T = \begin{pmatrix}1&0\\0&e^{i\pi/4}\end{pmatrix}. \]

They add 90° and 45° to the phase angle. The explorer now offers both buttons.

**Composing gates: two reading orders.** Applying \(A\) first and then \(B\) gives the matrix product \(BA\). A circuit diagram and the explorer's chain read left to right, and the matrix product reads right to left:

- Circuit and chain: H, then Z. Apply H first.
- Matrix: \(ZH\). The gate applied first is written last, next to the state.

Order matters in the product too: \(ZH \neq HZ\) in general.

**Inverse gates.** The inverse of a gate is its conjugate transpose, \(U^\dagger\), and applying a gate and then its inverse gives the identity. \(X\), \(Y\), \(Z\), and \(H\) are their own inverses. The inverse of \(R_Y(\theta)\) is \(R_Y(-\theta)\), and the inverse of \(S\) is \(\operatorname{diag}(1, -i)\).

**A global-phase caveat.** A rotation gate and the named gate it matches can differ by a global factor. \(R_X(180^\circ) = -iX\), so \(X = i\,R_X(180^\circ)\). Likewise \(S = e^{i\pi/4}R_Z(90^\circ)\). The sphere and the probabilities cannot see a global factor, so the points are the same. The matrix panel shows the amplitudes as the multiplication gives them, global factors included.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Naming the formalism

Every ideal gate is a **[unitary operation](../glossary.md#unitary-operation)**: a reversible change that keeps the probabilities adding to 1. A small set of gates can be combined to approximate any single-qubit operation, which is called universality, and a gate can be broken into a product of simpler ones, a decomposition. Later material makes these ideas precise.

</div>

## From One Qubit to Two

Compare what you can do now with what is still unknown.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>So far</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Move one qubit's state anywhere</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Predict where it lands</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Undo the move</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Still unknown</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Use more than one qubit</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write their outcomes together</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Link them</span></div>
    </div>
  </div>
</div>

Here are two qubits, each with its own state, side by side:

<div class="qed-demo" id="qg-two"></div>

Each qubit can be moved with the gates above. One qubit's state is now something we can move and undo. We have not yet said what a second qubit adds.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A gate moves the point</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Height sets the probabilities, and Z changes phase only</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>H makes phase visible, and a rotation's angle sets the result</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Order can matter, and every gate can be undone</span></div>
</div>

A gate is a reversible move of a state. On the sphere each gate here is a rotation: Z changes phase only, H turns a phase difference into a probability difference, a rotation's angle sets the result, and the order of gates can matter.

> **What changes when there is more than one qubit?**

**Next: [Multi-Qubit Systems →](multi-qubit-systems.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedQubit;
  var B = window.QedBloch;
  var S = window.QedShots;
  var QL = window.QedLevel;
  var Z = window.QedQuiz;
  var G = window.QedGates;
  var C = window.QedCircuit;
  var EPS = 1e-9;

  function $(id) { return document.getElementById(id); }
  function pct(p) { return Math.round(p * 1000) / 10; }
  function ang(x) { return String(Math.round(x * 10) / 10); }
  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  function cssColor(name, fallback) {
    var v = getComputedStyle(document.body).getPropertyValue(name).trim(); // the palette variables are set on body
    return v || fallback;
  }
  // a number as short text, with a proper minus sign: 1, 0.5, −0.71
  function num(x) {
    var t = Math.abs(x).toFixed(2).replace(/\.?0+$/, "");
    return (x < 0 && t !== "0" ? "−" : "") + t;
  }
  // one matrix entry or amplitude: 0, 1, −1, 0.71, i, −i, (0.5 + 0.5i)
  function cell(c) {
    if (Math.abs(c.im) < EPS) return num(c.re);
    var im = Math.abs(c.im);
    var imText = Math.abs(im - 1) < 1e-6 ? "i" : num(im) + "i";
    if (Math.abs(c.re) < EPS) return (c.im < 0 ? "−" : "") + imText;
    return "(" + num(c.re) + (c.im < 0 ? " − " : " + ") + imText + ")";
  }

  var PRESETS = Q.PRESETS;
  function preset(id) { return PRESETS.filter(function (p) { return p.id === id; })[0]; }
  var EQUATOR_MARKERS = PRESETS.filter(function (p) { return p.id !== "zero" && p.id !== "one"; }).map(function (p) {
    var b = Q.toBloch(p.state);
    return { thetaDeg: Math.round(b.thetaDeg), phiDeg: Math.round(b.phiDeg), label: p.name };
  });

  // ---- text about a state ---------------------------------------------------------
  function labelOf(s) {
    var n = Q.nameOf(s);
    if (n) return n.name;
    var b = Q.toBloch(s);
    return "(" + ang(b.thetaDeg) + "°, " + (b.phiDefined ? ang(b.phiDeg) + "°" : "–") + ")";
  }
  function probRows(p) {
    return [
      { label: "Outcome 0", fraction: p[0], text: pct(p[0]) + "%" },
      { label: "Outcome 1", fraction: p[1], text: pct(p[1]) + "%" }
    ];
  }
  function stateDescription(s) {
    var b = Q.toBloch(s);
    var st = B.state(b.thetaDeg, b.phiDeg);
    return "Size of the |0⟩ amplitude: " + st.a0.toFixed(2) + ". Size of the |1⟩ amplitude: " + st.a1.toFixed(2) +
      ". Phase angle: " + (b.phiDefined ? ang(b.phiDeg) + "°" : "not needed here") + ".";
  }
  function vecToAngles(v) {
    var theta = (Math.acos(clamp(v.z, -1, 1)) * 180) / Math.PI;
    var phi = Math.sin((theta * Math.PI) / 180) < 1e-9 ? 0 : ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360;
    return { theta: theta, phi: phi };
  }
  function samePoint(a, b) {
    var va = Q.blochVector(a);
    var vb = Q.blochVector(b);
    return Math.abs(va.x - vb.x) < 1e-6 && Math.abs(va.y - vb.y) < 1e-6 && Math.abs(va.z - vb.z) < 1e-6;
  }

  // ---- drawing ---------------------------------------------------------------------
  // QedBloch draws the sphere; the "certain 0 / certain 1 / 50/50" words are page-local.
  function annotate(cv, color) {
    var ctx = cv.getContext("2d");
    var cx = cv.width / 2;
    var cy = cv.height / 2;
    var r = Math.min(cv.width, cv.height) * 0.365;
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "12px sans-serif";
    ctx.fillText("certain 0", cx + 22, cy - r - 8);
    ctx.fillText("certain 1", cx + 22, cy + r + 18);
    ctx.fillText("50/50", 4, cy + 18);
    ctx.restore();
  }
  function drawSphere(cv, theta, phi, startState) {
    var opts = {
      color: cssColor("--md-default-fg-color", "#222"),
      neutral: cssColor("--md-default-fg-color--light", "#888"),
      axes: true,
      projection: true,
      depth: true
    };
    var named = null;
    if (startState) {
      var b = Q.toBloch(startState);
      named = Q.nameOf(startState);
      opts.pinned = { thetaDeg: b.thetaDeg, phiDeg: b.phiDeg, label: named ? "start " + named.name : "start" };
    }
    // a named point that is also the start keeps only the start label
    opts.markers = EQUATOR_MARKERS.filter(function (m) {
      return !named || m.label !== named.name;
    });
    B.render(cv, theta, phi, opts);
    annotate(cv, opts.neutral);
  }

  // ---- static pictures built from the shared modules ------------------------------
  function panel(title, s) {
    return '<div class="qed-prepared"><span class="qed-prepared__tag">' + title + "</span><strong>" + Q.format(s) + "</strong>" +
      S.renderBars(probRows(Q.probabilities(s))) + "</div>";
  }
  function pair(left, right) {
    return '<div class="qed-demo__layout" style="justify-content: space-around; align-items:stretch;">' + left + right + "</div>";
  }
  function arrowed(from, gateId, to) {
    return '<div class="qed-gates__arrow"><strong>' + from.name + "</strong> → " + G.gate(gateId).name + " → <strong>" + to.name + "</strong></div>";
  }

  function buildWords() {
    var rows = ["i", "x", "y", "z", "h"].map(function (id) {
      var g = G.gate(id);
      var svg = C.renderSVG({ qubits: ["q0"], ops: [{ type: "gate", label: g.label, name: g.name, targets: [0] }] }, { neutral: true, ariaLabel: "The " + g.name + " gate symbol" });
      return "<tr><th scope=\"row\">" + g.name + "</th><td>" + svg + "</td><td>" + g.words.charAt(0).toUpperCase() + g.words.slice(1) + ".</td></tr>";
    }).join("");
    $("qg-words").innerHTML =
      '<table class="qed-comparison-table"><thead><tr><th scope="col">Gate</th><th scope="col">Symbol</th><th scope="col">What it does</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  function buildSends() {
    var ids = ["i", "x", "y", "z", "h"];
    var head = "<tr><th scope=\"col\">Start</th>" + ids.map(function (id) { return "<th scope=\"col\">" + G.gate(id).name + "</th>"; }).join("") + "</tr>";
    var body = PRESETS.map(function (p) {
      return "<tr><th scope=\"row\">" + p.name + "</th>" + ids.map(function (id) {
        var out = Q.nameOf(G.apply(G.gate(id), p.state));
        return "<td>" + (out ? out.name : "?") + "</td>";
      }).join("") + "</tr>";
    }).join("");
    $("qg-sends").innerHTML =
      '<table class="qed-comparison-table"><caption class="qed-stack__caption">Where each gate sends each named state</caption><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
  }

  function buildPhase() {
    var plus = preset("plus");
    var minus = preset("minus");
    var zPlus = Q.nameOf(G.apply(G.gate("z"), plus.state));
    $("qg-phase-z").innerHTML = arrowed(plus, "z", zPlus) + pair(panel("Before: |+⟩", plus.state), panel("After Z: " + zPlus.name, G.apply(G.gate("z"), plus.state)));
    var hPlus = G.apply(G.gate("h"), plus.state);
    var hMinus = G.apply(G.gate("h"), minus.state);
    $("qg-phase-h").innerHTML =
      pair(
        '<div>' + arrowed(plus, "h", Q.nameOf(hPlus)) + panel("After H: " + Q.nameOf(hPlus).name, hPlus) + "</div>",
        '<div>' + arrowed(minus, "h", Q.nameOf(hMinus)) + panel("After H: " + Q.nameOf(hMinus).name, hMinus) + "</div>"
      );
  }

  function buildTwo() {
    $("qg-two").innerHTML = pair(panel("Qubit q₀: |+⟩", preset("plus").state), panel("Qubit q₁: |0⟩", preset("zero").state));
  }

  // ---- the explorer ----------------------------------------------------------------
  var MAX_CHAIN = 4;
  var startId = "zero";
  var chain = [];
  var note = "";
  var axis = "y";
  var angle = 90;
  var animToken = 0;

  function states() {
    var out = [preset(startId).state];
    chain.forEach(function (g) { out.push(G.apply(g, out[out.length - 1])); });
    return out;
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function gateOp(g) { return { type: "gate", label: g.label, name: g.name, targets: [0] }; }
  function chainText(names, sts) {
    var parts = [labelOf(sts[0])];
    names.forEach(function (n, k) { parts.push(n); parts.push(labelOf(sts[k + 1])); });
    return parts.join(" → ");
  }

  // The verdict on the two orders: same point or not, same probabilities or not.
  function verdict(a, b) {
    if (samePoint(a, b)) {
      var ip = Q.innerProduct(a, b);
      return ip.re > 1 - 1e-6
        ? "The same point, and the same state. The order did not matter here."
        : "The same point. The two results differ only by a global phase, which the sphere does not show. The order did not change the point here.";
    }
    var pa = Q.probabilities(a);
    var pb = Q.probabilities(b);
    return Math.abs(pa[0] - pb[0]) < 1e-6
      ? "Different points, with the same Z-basis probabilities. The order changed the state."
      : "Different points, with different probabilities: outcome 0 is " + pct(pa[0]) + "% in one order and " + pct(pb[0]) + "% in the other. The order changed the result.";
  }

  function caption(sts) {
    if (!chain.length) return "No gate yet, so the point is still at the start. Press a gate to move it.";
    var k = chain.length;
    var g = chain[k - 1];
    var before = sts[k - 1];
    var after = sts[k];
    var head = g.name + " took the point from " + labelOf(before) + " to " + labelOf(after) + ". ";
    if (samePoint(before, after)) return head + "The point did not move.";
    var pb = Q.probabilities(before);
    var pa = Q.probabilities(after);
    return head + (Math.abs(pb[0] - pa[0]) < 1e-6
      ? "Height did not change, so the probabilities did not change."
      : "Height changed, so the probabilities changed: outcome 0 went from " + pct(pb[0]) + "% to " + pct(pa[0]) + "%.");
  }

  function matrixCols(entries, cols) {
    return '<span class="qed-matrix" style="grid-template-columns: repeat(' + cols + ', auto);">' +
      entries.map(function (e) { return "<span>" + e + "</span>"; }).join("") + "</span>";
  }
  function matrixLine(g, from, to) {
    var m = g.matrix;
    var entries = [cell(m[0][0]), cell(m[0][1]), cell(m[1][0]), cell(m[1][1])];
    var spoken = g.name + " times the column " + cell(from.alpha) + ", " + cell(from.beta) + " gives the column " + cell(to.alpha) + ", " + cell(to.beta) + ".";
    return '<div class="qed-matrixline" role="group" aria-label="' + spoken + '">' +
      matrixCols(entries, 2) + '<span aria-hidden="true">×</span>' + matrixCols([cell(from.alpha), cell(from.beta)], 1) +
      '<span aria-hidden="true">=</span>' + matrixCols([cell(to.alpha), cell(to.beta)], 1) + "</div>";
  }

  function render(options) {
    options = options || {};
    var sts = states();
    var start = sts[0];
    var result = sts[sts.length - 1];
    var names = chain.map(function (g) { return g.name; });
    var bR = Q.toBloch(result);
    var inter = QL.atLeast("intermediate");

    // the sphere (an animation may draw it instead)
    animToken++;
    if (!options.noSphere) drawSphere($("qg-canvas"), bR.thetaDeg, bR.phiDeg, chain.length ? start : null);

    // the chain, as a line and as a one-wire circuit
    $("qg-chain").textContent = chainText(names, sts);
    $("qg-circuit").innerHTML = C.renderSVG({ qubits: ["q0"], ops: chain.map(gateOp) }, {
      neutral: true,
      ariaLabel: chain.length ? "Circuit on one qubit: " + names.join(", then ") + "." : "Circuit on one qubit with no gate yet."
    });

    // the result: description, caption, and the bars before and after
    $("qg-desc").textContent = stateDescription(result);
    var nm = Q.nameOf(result);
    $("qg-name").textContent = nm ? "(this is " + nm.name + ")" : "";
    $("qg-caption").textContent = caption(sts);
    $("qg-bars").innerHTML =
      "<p><strong>Start, " + labelOf(start) + "</strong></p>" + S.renderBars(probRows(Q.probabilities(start))) +
      "<p><strong>Result, " + labelOf(result) + "</strong></p>" + S.renderBars(probRows(Q.probabilities(result)));

    // controls
    Array.prototype.forEach.call($("qg-presets").querySelectorAll("button"), function (b) {
      var on = b.dataset.id === startId;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    Array.prototype.forEach.call($("qg-axes").querySelectorAll("button"), function (b) {
      var on = b.dataset.axis === axis;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var full = chain.length >= MAX_CHAIN;
    Array.prototype.forEach.call($("qg-gates").querySelectorAll("button"), function (b) { b.disabled = full; });
    $("qg-rotate").disabled = full;
    $("qg-inverse").disabled = full || !chain.length;
    $("qg-remove").disabled = !chain.length;
    $("qg-note").textContent = note || (full ? "The chain holds four gates. Remove one to add another." : "");

    // Intermediate readouts (additive: the Beginner view never depends on them)
    $("qg-inter").hidden = !inter;
    $("qg-form").textContent = "Written form of the result, as the multiplication gives it: |ψ⟩ = " + Q.format(result) +
      ". A shared overall phase may appear; the sphere ignores it.";
    var mhtml = "";
    if (chain.length) {
      var k = chain.length;
      mhtml += "<p class=\"qed-editor__details\">Last gate, " + chain[k - 1].name + ":</p>" + matrixLine(chain[k - 1], sts[k - 1], sts[k]);
      if (k > 1) {
        var whole = G.compose(chain);
        mhtml += "<p class=\"qed-editor__details\">Whole chain as one matrix, which reads right to left (" +
          chain.slice().reverse().map(function (g) { return g.name; }).join(" · ") + "):</p>" + matrixLine(whole, start, result);
      }
    } else {
      mhtml = "<p class=\"qed-editor__details\">Apply a gate to see its matrix act on the amplitudes.</p>";
    }
    $("qg-matrix").innerHTML = mhtml;

    // the opposite order
    var other = $("qg-other");
    other.hidden = chain.length < 2;
    var oppositeText = "";
    if (chain.length >= 2) {
      var rev = chain.slice().reverse();
      var rsts = [start];
      rev.forEach(function (g) { rsts.push(G.apply(g, rsts[rsts.length - 1])); });
      var rres = rsts[rsts.length - 1];
      var rb = Q.toBloch(rres);
      $("qg-other-chain").textContent = "Opposite order: " + chainText(rev.map(function (g) { return g.name; }), rsts);
      drawSphere($("qg-other-canvas"), rb.thetaDeg, rb.phiDeg, start);
      $("qg-other-bars").innerHTML = "<p><strong>Result, " + labelOf(rres) + "</strong></p>" + S.renderBars(probRows(Q.probabilities(rres)));
      var v = verdict(result, rres);
      $("qg-verdict").className = "qed-editor__validity " + (samePoint(result, rres) ? "is-valid" : "is-invalid");
      $("qg-verdict").textContent = (samePoint(result, rres) ? "= " : "≠ ") + v;
      $("qg-other-canvas").setAttribute("aria-label", "Bloch sphere for the opposite order. The result is " + labelOf(rres) + ". " + B.formatText(rb.thetaDeg, rb.phiDeg));
      oppositeText = " Opposite order: " + $("qg-other-chain").textContent.replace("Opposite order: ", "") + ". " + v;
    }

    // accessibility
    var text = "Bloch sphere. The result is " + labelOf(result) + ". " + B.formatText(bR.thetaDeg, bR.phiDeg) +
      (chain.length ? " The start was " + labelOf(start) + ", shown as a diamond." : "");
    $("qg-canvas").setAttribute("aria-label", text);
    $("qg-summary").textContent = "Chain: " + chainText(names, sts) + ". " + caption(sts) + oppositeText + (note ? " " + note : "");
  }

  // Sweep the live point along the gate's rotation arc. The final frame is exact.
  function animate(gate, before, after) {
    if (reducedMotion()) { return false; }
    var token = animToken;
    var v0 = Q.blochVector(before);
    var bFinal = Q.toBloch(after);
    var start = chain.length ? states()[0] : null;
    var t0 = null;
    var done = false;
    function finish() {
      if (token !== animToken || done) return;
      done = true;
      drawSphere($("qg-canvas"), bFinal.thetaDeg, bFinal.phiDeg, start);
    }
    // A hidden tab pauses animation frames, so a timer makes sure the exact final picture is drawn.
    window.setTimeout(finish, 700);
    function frame(now) {
      if (token !== animToken || done) return;
      if (t0 === null) t0 = now;
      var f = Math.min(1, (now - t0) / 500);
      if (f >= 1) {
        finish();
        return;
      }
      var a = vecToAngles(G.blochPartial(gate, v0, f));
      drawSphere($("qg-canvas"), a.theta, a.phi, start);
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
    return true;
  }

  function addGate(g, message) {
    if (chain.length >= MAX_CHAIN) return;
    var before = states()[chain.length];
    chain.push(g);
    note = message || "";
    var after = states()[chain.length];
    var willAnimate = !reducedMotion();
    render({ noSphere: willAnimate });
    if (willAnimate) animate(g, before, after);
  }

  function setStart(id) {
    startId = id;
    note = "";
    render();
  }

  function buildControls() {
    var presetBox = $("qg-presets");
    PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = p.name;
      b.dataset.id = p.id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { setStart(p.id); });
      presetBox.appendChild(b);
    });
    var gateBox = $("qg-gates");
    G.GATES.forEach(function (g) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button";
      b.textContent = g.name;
      b.dataset.gate = g.id;
      b.setAttribute("aria-label", "Apply the " + g.name + " gate");
      b.title = G.describe(g);
      if (g.id === "s" || g.id === "t") b.dataset.level = "intermediate";
      b.addEventListener("click", function () { addGate(g); });
      gateBox.appendChild(b);
    });
    var axisBox = $("qg-axes");
    ["x", "y", "z"].forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = a + " axis";
      b.dataset.axis = a;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { axis = a; render({ noSphere: false }); });
      axisBox.appendChild(b);
    });
  }

  // Typed angles outside the range are shown clamped, with a note, rather than corrected silently.
  $("qg-angle-range").addEventListener("input", function () {
    angle = parseFloat(this.value);
    $("qg-angle-num").value = ang(angle);
  });
  $("qg-angle-num").addEventListener("input", function () {
    var v = parseFloat(this.value);
    if (isNaN(v)) return;
    var c = clamp(v, 0, 360);
    angle = c;
    $("qg-angle-range").value = c;
    if (c !== v) {
      note = "The rotation angle runs from 0° to 360°, so " + ang(c) + "° is used.";
      this.value = ang(c);
      render();
    }
  });
  $("qg-rotate").addEventListener("click", function () { addGate(G.rotation(axis, angle)); });
  $("qg-inverse").addEventListener("click", function () {
    if (!chain.length || chain.length >= MAX_CHAIN) return;
    var last = chain[chain.length - 1];
    var inv = G.inverse(last);
    addGate(inv, inv === last
      ? "The inverse of " + last.name + " is " + last.name + " itself, so the point went back to where it was before " + last.name + "."
      : "The inverse of " + last.name + " is " + inv.name + ", so the point went back to where it was before " + last.name + ".");
  });
  $("qg-remove").addEventListener("click", function () {
    chain.pop();
    note = "";
    render();
  });
  $("qg-reset").addEventListener("click", function () {
    startId = "zero";
    chain = [];
    note = "";
    axis = "y";
    angle = 90;
    $("qg-angle-range").value = angle;
    $("qg-angle-num").value = angle;
    var fb = $("qg-transfer-feedback");
    fb.textContent = "";
    fb.className = "qed-quiz__feedback";
    render();
  });

  // ---- level-aware behavior (additive) ---------------------------------------------
  function applyLevel() {
    var inter = QL.atLeast("intermediate");
    Array.prototype.forEach.call($("qg-gates").querySelectorAll("button[data-level='intermediate']"), function (b) { b.hidden = !inter; });
    if (!inter) {
      var hasPhaseGate = chain.some(function (g) { return g.id === "s" || g.id === "t" || g.id === "s-inverse" || g.id === "t-inverse"; });
      if (hasPhaseGate) {
        chain = [];
        note = "S and T belong to the Intermediate view, so the chain was cleared.";
      }
    }
    render();
  }
  QL.onChange(applyLevel);

  // ---- checks ----------------------------------------------------------------------
  Z.mount($("qg-quiz-predict"), {
    title: "Predict first. A qubit is in |+⟩ and you apply Z. What are the Z-basis probabilities afterwards?",
    items: [
      {
        prompt: "Choose the probabilities of outcome 0 and outcome 1.",
        label: "Z-basis probabilities after Z is applied to |+⟩",
        options: [
          { label: "50% and 50%", correct: true, why: "Z moves the point from |+⟩ to |−⟩, at the same height, so the probabilities do not change. The state did change, though." },
          { label: "100% and 0%", correct: false, why: "That would be |0⟩ at the north pole. Z turns the point about the vertical axis, which does not change its height." },
          { label: "0% and 100%", correct: false, why: "That would be |1⟩ at the south pole. Z does not move the point up or down." },
          { label: "Z flips the probabilities, so 50% and 50% become something else", correct: false, why: "Z is a half turn about the vertical axis. It changes the phase, not the height, so the probabilities stay put." }
        ]
      }
    ]
  }, {
    onAnswer: function () {
      var after = G.apply(G.gate("z"), preset("plus").state);
      var box = $("qg-predict-bars");
      box.hidden = false;
      box.innerHTML = "<p><strong>After Z, the state is " + Q.nameOf(after).name + ":</strong></p>" + S.renderBars(probRows(Q.probabilities(after)));
    },
    onReset: function () { $("qg-predict-bars").hidden = true; }
  });

  Z.mount($("qg-quiz-which"), {
    title: "A qubit is in |+⟩. Which gates change its Z-basis probabilities? Try each one.",
    items: [
      {
        prompt: "Pick a gate, and check the feedback.",
        label: "Which gate changes the Z-basis probabilities of |+⟩",
        options: [
          { label: "Z", correct: false, why: "Z moves |+⟩ to |−⟩, at the same height on the equator. The probabilities stay at 50% and 50%." },
          { label: "X", correct: false, why: "X leaves |+⟩ where it is: it turns the sphere about the x axis, and |+⟩ sits on that axis." },
          { label: "H", correct: true, why: "H takes |+⟩ to |0⟩, at the north pole. That is a change from 50% and 50% to 100% and 0%." },
          { label: "I", correct: false, why: "I does nothing at all, so the state and the probabilities stay as they were." }
        ]
      }
    ]
  });

  // ---- the order examples load a chain into the explorer ---------------------------------
  Array.prototype.forEach.call($("qg-examples").querySelectorAll("button[data-gates]"), function (b) {
    b.addEventListener("click", function () {
      startId = b.dataset.start;
      chain = b.dataset.gates.split(",").map(function (id) { return G.gate(id); });
      note = "";
      render();
      $("qg-examples-note").textContent = "Loaded into the explorer above: " + $("qg-chain").textContent + ". Scroll up to see the sphere, or read the chain and the opposite-order panel.";
      $("qg-explorer").scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
    });
  });

  // ---- transfer task: reads the explorer's state -------------------------------------
  $("qg-transfer-check").addEventListener("click", function () {
    var fb = $("qg-transfer-feedback");
    var sts = states();
    var result = sts[sts.length - 1];
    var p1 = Q.probabilities(result)[1];
    var hasRotation = chain.some(function (g) { return g.kind === "rotation"; });
    var ok = false;
    var text;
    if (startId !== "zero") {
      text = "Start the explorer from |0⟩ first, then add a rotation.";
    } else if (!hasRotation) {
      text = "The chain has no rotation gate yet. Choose an axis and an angle, then press Apply rotation.";
    } else if (Math.abs(p1 - 0.25) < 0.005) {
      ok = true;
      text = "Yes. Outcome 1 happens " + pct(p1) + "% of the time. A turn of 60° about the y axis does it, and so does 60° about x. A turn about z could not, because it never changes the height of |0⟩.";
    } else if (p1 < EPS) {
      text = "Outcome 1 never happens in this chain. A turn about z does not change the height of |0⟩, so it cannot change the probabilities. Try the x or y axis.";
    } else {
      text = "Outcome 1 happens " + pct(p1) + "% of the time, not 25%. The angle sets the result, so try changing it.";
    }
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
  });

  // ---- start -------------------------------------------------------------------------
  buildWords();
  buildSends();
  buildPhase();
  buildTwo();
  buildControls();
  applyLevel();

  // The canvases read the theme colors, so redraw when the light/dark palette changes.
  if (window.MutationObserver) {
    new MutationObserver(function () { render(); }).observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
  }
});
</script>
