# Variational Quantum Classifier (VQC)

Recall the hybrid loop from [VQE](variational-quantum-eigensolver.md) and [QAOA](quantum-approximate-optimization-algorithm.md): prepare a trial state, measure something about it, let a classical optimizer adjust, repeat. The **Variational Quantum Classifier (VQC)** runs the same loop on a third kind of problem — not a molecule's energy, not a graph's best cut, but whether a data point belongs to one class or another.

## The Problem: Classify Data Points

Given a handful of labeled examples, find a rule that correctly labels them. This page uses eight points, each with **two** features \((x_1, x_2)\) — four forming a small cluster near the origin, four forming a larger ring around them:

| Point | \(x_1\) | \(x_2\) | Label | Shape |
|---|---|---|---|---|
| Inner 1 | 0.4 | 0.0 | A | □ |
| Inner 2 | 0.0 | 0.6 | A | □ |
| Inner 3 | −0.4 | 0.0 | A | □ |
| Inner 4 | 0.0 | −0.6 | A | □ |
| Outer 1 | 2.0 | −2.0 | B | △ |
| Outer 2 | 0.0 | 3.0 | B | △ |
| Outer 3 | −2.0 | 3.0 | B | △ |
| Outer 4 | 0.0 | −3.0 | B | △ |

Every diagram on this page marks Class A as a **square (□)** and Class B as a **triangle (△)** — shape carries the label. Color is reserved for a different job: whether the *current* classifier gets that point right (green) or wrong (red).

## Interactive: Try a Line First

The simplest possible classifier in two dimensions is a straight line: everything on one side is Class A, everything on the other is Class B. Drag the sliders below and see how well a line can do.

<div class="qed-demo" id="vqc-line-demo">
  <svg class="qed-plot-svg" id="vqc-line-svg" viewBox="0 0 280 400" width="280" height="400" role="img" aria-label="Scatter plot of eight labeled points, a small cluster of Class A squares surrounded by a ring of Class B triangles, with a single straight line that tilts and slides as the user adjusts it.">
    <rect class="qed-vqc-region--b" x="20" y="20" width="240" height="360" />
    <polygon class="qed-vqc-region--a" id="vqc-line-fill" points="20,20 260,20 260,380 20,380" />

    <line class="qed-plot-axis" x1="20" y1="20" x2="20" y2="380" />
    <line class="qed-plot-axis" x1="20" y1="380" x2="260" y2="380" />
    <text class="qed-plot-label" x="15" y="18">x₂</text>
    <text class="qed-plot-label" x="252" y="393">x₁</text>

    <line class="qed-vqc-boundary" id="vqc-line-boundary" x1="20" y1="195.5" x2="260" y2="195.5" />

    <rect class="qed-vqc-point" id="vqc-line-point-1" x="146.0" y="186.5" width="18" height="18" />
    <rect class="qed-vqc-point" id="vqc-line-point-2" x="128.0" y="159.5" width="18" height="18" />
    <rect class="qed-vqc-point" id="vqc-line-point-3" x="110.0" y="186.5" width="18" height="18" />
    <rect class="qed-vqc-point" id="vqc-line-point-4" x="128.0" y="213.5" width="18" height="18" />
    <polygon class="qed-vqc-point" id="vqc-line-point-5" points="227.0,268.4 240.6,292.1 213.4,292.1" />
    <polygon class="qed-vqc-point" id="vqc-line-point-6" points="137.0,43.4 150.6,67.1 123.4,67.1" />
    <polygon class="qed-vqc-point" id="vqc-line-point-7" points="47.0,43.4 60.6,67.1 33.4,67.1" />
    <polygon class="qed-vqc-point" id="vqc-line-point-8" points="137.0,313.4 150.6,337.1 123.4,337.1" />
  </svg>

  <div class="qed-demo__controls" style="text-align:center;">
    <label for="vqc-line-angle-slider">Normal direction = <span id="vqc-line-angle-value">90</span>°</label>
    <input type="range" id="vqc-line-angle-slider" min="0" max="359" value="90" step="1">
    <br>
    <label for="vqc-line-offset-slider">Offset = <span id="vqc-line-offset-value">0.00</span></label>
    <input type="range" id="vqc-line-offset-slider" min="-300" max="300" value="0" step="1">
    <p>Accuracy: <span id="vqc-line-accuracy-value"></span></p>
  </div>
  <p class="qed-encode-demo__hint" id="vqc-line-hint" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("vqc-line-demo");
  if (!demo) return;

  var DATA = [
    { id: 1, x1: 0.4, x2: 0.0, y: 1 },
    { id: 2, x1: 0.0, x2: 0.6, y: 1 },
    { id: 3, x1: -0.4, x2: 0.0, y: 1 },
    { id: 4, x1: 0.0, x2: -0.6, y: 1 },
    { id: 5, x1: 2.0, x2: -2.0, y: -1 },
    { id: 6, x1: 0.0, x2: 3.0, y: -1 },
    { id: 7, x1: -2.0, x2: 3.0, y: -1 },
    { id: 8, x1: 0.0, x2: -3.0, y: -1 }
  ];

  var SCALE = 45, X0 = 137, Y0 = 195.5;
  var RECT = [[20, 20], [260, 20], [260, 380], [20, 380]];

  function clipHalfPlane(poly, nx, ny, c) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var curr = poly[i], prev = poly[(i + poly.length - 1) % poly.length];
      var dCurr = nx * curr[0] + ny * curr[1] - c;
      var dPrev = nx * prev[0] + ny * prev[1] - c;
      var currIn = dCurr <= 0, prevIn = dPrev <= 0;
      if (currIn) {
        if (!prevIn) { var t = dPrev / (dPrev - dCurr); out.push([prev[0] + t * (curr[0] - prev[0]), prev[1] + t * (curr[1] - prev[1])]); }
        out.push(curr);
      } else if (prevIn) {
        var t2 = dPrev / (dPrev - dCurr);
        out.push([prev[0] + t2 * (curr[0] - prev[0]), prev[1] + t2 * (curr[1] - prev[1])]);
      }
    }
    return out;
  }

  var angleSlider = document.getElementById("vqc-line-angle-slider");
  var offsetSlider = document.getElementById("vqc-line-offset-slider");
  var angleValue = document.getElementById("vqc-line-angle-value");
  var offsetValue = document.getElementById("vqc-line-offset-value");
  var accuracyValue = document.getElementById("vqc-line-accuracy-value");
  var fillPoly = document.getElementById("vqc-line-fill");
  var boundaryLine = document.getElementById("vqc-line-boundary");
  var hint = document.getElementById("vqc-line-hint");

  function render() {
    var deg = Number(angleSlider.value);
    var c = Number(offsetSlider.value) / 100;
    angleValue.textContent = String(deg);
    offsetValue.textContent = c.toFixed(2);

    var rad = deg * Math.PI / 180;
    var nx = Math.cos(rad), ny = Math.sin(rad);

    // Data-space condition for Class A: nx*x1 + ny*x2 > c.
    // Convert to screen space (x1 = (sx-X0)/SCALE, x2 = (Y0-sy)/SCALE)
    // so the same half-plane can be clipped against the plot rectangle.
    var nsx = nx, nsy = -ny;
    var cScreen = c * SCALE + nx * X0 - ny * Y0;
    var aRegion = clipHalfPlane(RECT, -nsx, -nsy, -cScreen);
    fillPoly.setAttribute("points", aRegion.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "));

    var px0 = c * nx, py0 = c * ny;
    var dx = -ny, dy = nx;
    var p1 = { x: X0 + (px0 + 10 * dx) * SCALE, y: Y0 - (py0 + 10 * dy) * SCALE };
    var p2 = { x: X0 + (px0 - 10 * dx) * SCALE, y: Y0 - (py0 - 10 * dy) * SCALE };
    boundaryLine.setAttribute("x1", p1.x.toFixed(1)); boundaryLine.setAttribute("y1", p1.y.toFixed(1));
    boundaryLine.setAttribute("x2", p2.x.toFixed(1)); boundaryLine.setAttribute("y2", p2.y.toFixed(1));

    var correct = 0;
    DATA.forEach(function (d) {
      var val = nx * d.x1 + ny * d.x2 - c;
      var predicted = val > 0 ? 1 : -1;
      var ok = predicted === d.y;
      if (ok) correct += 1;
      var el = document.getElementById("vqc-line-point-" + d.id);
      el.classList.toggle("is-correct", ok);
      el.classList.toggle("is-incorrect", !ok);
    });

    accuracyValue.textContent = correct + "/8";
    if (correct === 6) {
      hint.textContent = "6/8 — this is as good as any straight line gets here. The inner cluster is completely surrounded by the outer ring, so no line can cut them apart cleanly.";
    } else {
      hint.textContent = correct + "/8 correct. Try other angles and offsets — the best any straight line can manage on this dataset is 6/8.";
    }
  }

  angleSlider.addEventListener("input", render);
  offsetSlider.addEventListener("input", render);
  render();
});
</script>

No line reaches all 8 — the inner cluster sits *inside* the outer ring in every direction, and a straight line can only ever cut the plane into two uniform halves. Separating "close to the origin" from "far from the origin" takes a curve, not a line.

## Interactive: Lift to Three Dimensions

Here's a classical trick: don't change the data, add a **new feature computed from it**. Define a third coordinate \(z = x_1^2 + x_2^2\) — each point's squared distance from the origin — and plot all eight points in \((x_1, x_2, z)\) space instead of just \((x_1, x_2)\).

The inner cluster lands at a shared *low* height (\(z = 0.16\) or \(0.36\)); the outer ring lands at a shared *high* height (\(z = 8\), \(9\), or \(13\)) — a wide gap, with nothing in between. In this lifted space, something a flat **plane** can do that no line could do in two dimensions: cut cleanly between the two groups.

<div class="qed-demo" id="vqc-lift-demo">
  <svg class="qed-plot-svg" id="vqc-lift-svg" viewBox="0 0 340 320" width="340" height="320" role="img" aria-label="Eight data points lifted into three dimensions using height equal to x1 squared plus x2 squared, with a flat horizontal plane that slides up and down as the user adjusts it, cutting the low cluster from the high ring. Points below the plane's current height are drawn with a dashed outline.">
    <text class="qed-plot-label" x="14" y="18" text-anchor="start">height z = x₁²+x₂²</text>
    <text class="qed-plot-label" x="258" y="198" text-anchor="start">x₁ →</text>
    <text class="qed-plot-label" x="60" y="198" text-anchor="end">← x₂</text>
    <g id="vqc-lift-points"></g>
    <g id="vqc-lift-plane"></g>
  </svg>

  <div class="qed-demo__controls" style="text-align:center;">
    <label for="vqc-lift-height-slider">Plane height c = <span id="vqc-lift-height-value">0.00</span></label>
    <input type="range" id="vqc-lift-height-slider" min="0" max="1200" value="0" step="5">
    <p>Accuracy: <span id="vqc-lift-accuracy-value"></span></p>
  </div>
  <p class="qed-encode-demo__hint" id="vqc-lift-hint" aria-live="polite">The eight points are fixed — only the plane's height moves.</p>
  <p class="qed-encode-demo__hint">A dashed outline marks a point sitting below the plane's current height, since the semi-transparent plane paints over it either way.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("vqc-lift-demo");
  if (!demo) return;

  var DATA = [
    { x1: 0.4, x2: 0.0, y: 1 },
    { x1: 0.0, x2: 0.6, y: 1 },
    { x1: -0.4, x2: 0.0, y: 1 },
    { x1: 0.0, x2: -0.6, y: 1 },
    { x1: 2.0, x2: -2.0, y: -1 },
    { x1: 0.0, x2: 3.0, y: -1 },
    { x1: -2.0, x2: 3.0, y: -1 },
    { x1: 0.0, x2: -3.0, y: -1 }
  ];

  var A = 20, B = 10, HC = 8.0, OX = 170, OY = 175;
  function zOf(x1, x2) { return x1 * x1 + x2 * x2; }
  function project(x1, x2, z) { return { x: OX + (x1 - x2) * A, y: OY + (x1 + x2) * B - z * HC }; }
  function pt(p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }

  var VMIN1 = -2.6, VRANGE1 = 5.2, VMIN2 = -3.9, VRANGE2 = 7.8;
  var L1 = VMIN1 + VRANGE1, L2 = VMIN2 + VRANGE2;

  var pointsGroup = document.getElementById("vqc-lift-points");
  (function buildPointsOnce() {
    var R = 6;
    var html = "";
    DATA.forEach(function (d, idx) {
      var p = project(d.x1, d.x2, zOf(d.x1, d.x2));
      if (d.y === 1) {
        html += '<rect class="qed-vqc-point" id="vqc-lift-point-' + idx + '" x="' + (p.x - R).toFixed(1) + '" y="' + (p.y - R).toFixed(1) + '" width="' + (2 * R) + '" height="' + (2 * R) + '" />';
      } else {
        var Rt = R * 1.75;
        var tp1 = p.x.toFixed(1) + "," + (p.y - Rt).toFixed(1);
        var tp2 = (p.x + Rt * 0.866).toFixed(1) + "," + (p.y + Rt * 0.5).toFixed(1);
        var tp3 = (p.x - Rt * 0.866).toFixed(1) + "," + (p.y + Rt * 0.5).toFixed(1);
        html += '<polygon class="qed-vqc-point" id="vqc-lift-point-' + idx + '" points="' + tp1 + " " + tp2 + " " + tp3 + '" />';
      }
    });
    pointsGroup.innerHTML = html;
  })();

  var planeGroup = document.getElementById("vqc-lift-plane");
  var slider = document.getElementById("vqc-lift-height-slider");
  var heightValue = document.getElementById("vqc-lift-height-value");
  var accuracyValue = document.getElementById("vqc-lift-accuracy-value");
  var hint = document.getElementById("vqc-lift-hint");

  function render() {
    var c = Number(slider.value) / 100;
    heightValue.textContent = c.toFixed(2);

    var corners = [[VMIN1, VMIN2], [L1, VMIN2], [L1, L2], [VMIN1, L2]].map(function (cn) {
      return project(cn[0], cn[1], c);
    });
    planeGroup.innerHTML = '<polygon class="qed-vqc-plane" points="' + corners.map(pt).join(" ") + '" />';

    var correct = 0;
    DATA.forEach(function (d, idx) {
      var z = zOf(d.x1, d.x2);
      var predicted = z < c ? 1 : -1;
      var ok = predicted === d.y;
      if (ok) correct += 1;
      var el = document.getElementById("vqc-lift-point-" + idx);
      el.classList.toggle("is-correct", ok);
      el.classList.toggle("is-incorrect", !ok);
      el.classList.toggle("qed-vqc-point--under-plane", z < c);
    });

    accuracyValue.textContent = correct + "/8";
    hint.textContent = correct === 8
      ? "8/8 — any height between 0.36 and 8 works perfectly. There's room to spare, because the lift opened up a gap no line in 2D ever had."
      : correct + "/8 — slide the plane's height until it sits in the gap between the two groups.";
  }

  slider.addEventListener("input", render);
  render();
});
</script>

Notice the trade: separating these points went from impossible with one feature combination to trivial with another, at the cost of one extra dimension and a little arithmetic to compute it (just \(x_1^2+x_2^2\) — nothing about the labels was used to construct it). This is an example of **feature mapping**: lifting data into a higher-dimensional space where a straight boundary becomes possible. It's related to, but not the same as, the *kernel trick* — which gets the benefit of a feature mapping by evaluating inner products in that higher-dimensional space directly, without ever constructing its coordinates. Here, \(x_1^2+x_2^2\) was constructed explicitly, by a human who looked at this dataset's ring shape and guessed it. For a dataset where that structure isn't obvious, there's no guarantee *any* hand-picked feature would reveal a separating plane, and no way to be sure in advance.

## Solving with VQC: Pick an Ansatz, Then Train

The quantum circuit below sticks to the two features the problem actually gave us, \(x_1\) and \(x_2\), one qubit each, rather than adding a third one computed by hand. That's not the same as having no modeling choices to make, though — the circuit's architecture (which gates, in what order) and its measurement rule are choices too, the quantum equivalent of a feature map. Angle encoding (using a feature value directly as a rotation angle) supplies its own nonlinear features for free, since the *measured expectation value* depends on the encoded features through sines and cosines, not linearly — quantum gates themselves act linearly on the state vector; the nonlinearity shows up in what gets measured afterward. Whatever separating power this circuit has comes from that nonlinearity plus the entanglement from letting the two qubits interact.

The ansatz: each qubit is rotated directly by its own feature (`RY(x₁)`, `RY(x₂)` — plain angle encoding, no derived formula, with each feature value used directly as a rotation angle in radians), then a **CNOT** entangles the two qubits, then each gets a second, trainable rotation (`RY(θ₁)`, `RY(θ₂)`). This encode → entangle → trainable shape is a standard, generic template for a variational circuit — it isn't tailored to this dataset at all.

<div class="qed-demo" style="text-align:center;">
  <svg class="qed-circuit-svg" viewBox="0 0 400 160" width="400" height="160" role="img" aria-label="Circuit diagram: two qubits, one per feature x1 and x2, each with a data-encoding RY gate, a CNOT gate entangling the two qubits, a trainable RY gate, then measured jointly as Z tensor Z.">
    <line class="qed-circuit-wire" x1="20" y1="40" x2="299" y2="40" />
    <line class="qed-circuit-wire" x1="20" y1="110" x2="299" y2="110" />
    <text class="qed-circuit-label" x="10" y="44" text-anchor="end">q₀: |0⟩</text>
    <text class="qed-circuit-label" x="10" y="114" text-anchor="end">q₁: |0⟩</text>

    <rect class="qed-circuit-gate-box" x="40" y="18" width="70" height="44" rx="4" />
    <text class="qed-circuit-label" x="75" y="44" text-anchor="middle" font-weight="700">RY(x₁)</text>
    <rect class="qed-circuit-gate-box" x="40" y="88" width="70" height="44" rx="4" />
    <text class="qed-circuit-label" x="75" y="114" text-anchor="middle" font-weight="700">RY(x₂)</text>

    <line class="qed-circuit-connector" x1="140" y1="40" x2="140" y2="110" />
    <circle cx="140" cy="40" r="5" class="qed-circuit-gate-box" />
    <circle cx="140" cy="110" r="11" fill="none" class="qed-circuit-gate-box" />
    <line class="qed-circuit-connector" x1="140" y1="99" x2="140" y2="121" />
    <line class="qed-circuit-connector" x1="129" y1="110" x2="151" y2="110" />

    <rect class="qed-circuit-gate-box" x="175" y="18" width="65" height="44" rx="4" />
    <text class="qed-circuit-label" x="207.5" y="44" text-anchor="middle" font-weight="700">RY(θ₁)</text>
    <rect class="qed-circuit-measure-box" x="265" y="18" width="34" height="44" rx="3" />
    <text class="qed-circuit-label" x="282" y="44" text-anchor="middle">M</text>

    <rect class="qed-circuit-gate-box" x="175" y="88" width="65" height="44" rx="4" />
    <text class="qed-circuit-label" x="207.5" y="114" text-anchor="middle" font-weight="700">RY(θ₂)</text>
    <rect class="qed-circuit-measure-box" x="265" y="88" width="34" height="44" rx="3" />
    <text class="qed-circuit-label" x="282" y="114" text-anchor="middle">M</text>

    <line class="qed-circuit-connector" x1="310" y1="40" x2="310" y2="110" />
    <line class="qed-circuit-connector" x1="299" y1="40" x2="310" y2="40" />
    <line class="qed-circuit-connector" x1="299" y1="110" x2="310" y2="110" />
    <text class="qed-circuit-label" x="320" y="78" text-anchor="start">⟨Z⊗Z⟩</text>
  </svg>
</div>

Predict **Class A** if \(\langle Z\otimes Z\rangle>0\), **Class B** otherwise. Working through the state vector by hand (not done here — the interactives compute it directly, the same way a real simulator would) gives a closed form after all:

\[
\langle Z\otimes Z\rangle = \cos\theta_1\cos\theta_2\cos x_2 - \cos\theta_1\sin\theta_2\cos x_1\sin x_2 + \sin\theta_1\sin\theta_2\sin x_1
\]

— not an obvious one to guess by looking at the circuit, and not something this page derives or relies on, but worth being upfront that it exists: this circuit's output is an explicit, nameable function of the inputs and parameters, not some unknowable black box.

## The Loss: How Wrong Are We?

VQE and QAOA share this page's hybrid *loop* with VQC, not its loss function — VQE minimizes an energy expectation value, QAOA optimizes an expected cut value, and neither is mean squared error. For VQC, mean squared error against the two class labels is one reasonable, common choice, used here because it reuses the same "squared distance from target" idea as VQE's loss. It isn't the only option; cross-entropy is at least as common a default for classifiers in practice.

\[
\text{Loss}(\theta_1,\theta_2) = \frac{1}{8}\sum_{i=1}^{8}\Big(\langle Z\otimes Z\rangle_i - y_i\Big)^2
\]

One more honest gap between this page and real hardware: a real quantum processor doesn't read \(\langle Z\otimes Z\rangle\) directly. It runs the circuit many times, counts how often each of the four two-bit outcomes shows up, and a classical computer estimates \(\langle Z\otimes Z\rangle\approx(N_{00}+N_{11}-N_{01}-N_{10})/N\) from those counts — then combines that estimate with the known label to get the loss. The interactives on this page skip the sampling step and compute the exact, noiseless statevector expectation value directly, the same shortcut a classical simulator takes.

The classical optimizer's job is to walk \(\theta_1,\theta_2\) downhill on this loss, the same way VQE's did. The run below shows consecutive, real gradient-descent steps — not cherry-picked, and not guaranteed to always behave this cleanly: real optimizers, including this one with a different step size, can easily overshoot and briefly increase the loss, especially with larger steps or stochastic estimates of the gradient.

## Interactive: Run the Training Loop

<div class="qed-demo" id="vqc-loop-demo">
  <div style="display:grid; grid-template-columns: 12rem 11rem 12rem; grid-template-rows: auto auto; align-items:center; justify-items:center; gap:0.2rem 0; overflow-x:auto;">
    <div class="qed-qubit qed-qubit--logical" id="vqc-loop-quantum" style="grid-row:1 / 3; grid-column:1; width:12rem; height:4.6rem;">
      <div class="qed-qubit__label">Quantum Processor</div>
      <div class="qed-qubit__state" id="vqc-loop-quantum-state">idle</div>
    </div>
    <div class="qed-encode-demo__arrow" style="grid-row:1; grid-column:2;"><span id="vqc-loop-fwd-label">—</span><span aria-hidden="true">→</span></div>
    <div class="qed-encode-demo__arrow" style="grid-row:2; grid-column:2;"><span aria-hidden="true">←</span><span id="vqc-loop-back-label">—</span></div>
    <div class="qed-qubit qed-qubit--physical" id="vqc-loop-classical" style="grid-row:1 / 3; grid-column:3; width:12rem; height:4.6rem;">
      <div class="qed-qubit__label">Classical Optimizer</div>
      <div class="qed-qubit__state" id="vqc-loop-classical-state">idle</div>
    </div>
  </div>

  <p style="text-align:center;">Iteration: <span id="vqc-loop-iter">0</span> &nbsp;·&nbsp; Accuracy: <span id="vqc-loop-accuracy">—</span></p>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="vqc-loop-prepare-btn">Prepare</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqc-loop-measure-btn" disabled>Measure Loss</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqc-loop-update-btn" disabled>Classical Update</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqc-loop-reset-btn" disabled>Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="vqc-loop-hint" aria-live="polite">Click Prepare to begin the first iteration.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("vqc-loop-demo");
  if (!demo) return;

  var DATA = [
    { x1: 0.4, x2: 0.0, y: 1 }, { x1: 0.0, x2: 0.6, y: 1 },
    { x1: -0.4, x2: 0.0, y: 1 }, { x1: 0.0, x2: -0.6, y: 1 },
    { x1: 2.0, x2: -2.0, y: -1 }, { x1: 0.0, x2: 3.0, y: -1 },
    { x1: -2.0, x2: 3.0, y: -1 }, { x1: 0.0, x2: -3.0, y: -1 }
  ];

  // Direct 2-qubit real-statevector simulation: RY encode, CNOT
  // (control q1, target q2), RY trainable, then <Z tensor Z>. No
  // closed-form shortcut — this is the actual linear algebra.
  function ryMat(theta) {
    var c = Math.cos(theta / 2), s = Math.sin(theta / 2);
    return [[c, -s], [s, c]];
  }
  function applySingle(state, gate, qubit) {
    var out = [0, 0, 0, 0];
    for (var idx = 0; idx < 4; idx++) {
      var bit = (idx >> qubit) & 1;
      var other = idx & ~(1 << qubit);
      for (var nb = 0; nb < 2; nb++) {
        out[other | (nb << qubit)] += gate[nb][bit] * state[idx];
      }
    }
    return out;
  }
  function applyCNOT(state) {
    var out = [0, 0, 0, 0];
    for (var idx = 0; idx < 4; idx++) {
      out[(idx & 1) ? (idx ^ 2) : idx] = state[idx];
    }
    return out;
  }
  function circuitZZ(x1, x2, t1, t2) {
    var state = [1, 0, 0, 0];
    state = applySingle(state, ryMat(x1), 0);
    state = applySingle(state, ryMat(x2), 1);
    state = applyCNOT(state);
    state = applySingle(state, ryMat(t1), 0);
    state = applySingle(state, ryMat(t2), 1);
    var z = 0;
    for (var idx = 0; idx < 4; idx++) {
      var p = state[idx] * state[idx];
      var sign = (idx & 1 ? -1 : 1) * ((idx >> 1) & 1 ? -1 : 1);
      z += sign * p;
    }
    return z;
  }
  function lossAndAccuracy(t1, t2) {
    var s = 0, correct = 0;
    DATA.forEach(function (d) {
      var p = circuitZZ(d.x1, d.x2, t1, t2);
      s += (p - d.y) * (p - d.y);
      if ((p > 0 ? 1 : -1) === d.y) correct += 1;
    });
    return { loss: s / DATA.length, correct: correct };
  }

  // Four consecutive steepest-descent updates on the loss above (learning
  // rate 2.0), starting from theta1=1.00, theta2=1.00 — each step here is
  // literally the previous one minus 2x the measured gradient, verified
  // against a finite-difference gradient computed from this exact circuit.
  // The last entry is close to the true minimum (-0.102, 0.171) but not
  // exactly it — a few more iterations would close that remaining gap.
  var STEPS = [
    { t1: 1.00, t2: 1.00 }, { t1: -0.45, t2: -0.36 },
    { t1: -0.05, t2: 0.30 }, { t1: -0.08, t2: 0.17 }
  ];

  var quantumState = document.getElementById("vqc-loop-quantum-state");
  var classicalState = document.getElementById("vqc-loop-classical-state");
  var fwdLabel = document.getElementById("vqc-loop-fwd-label");
  var backLabel = document.getElementById("vqc-loop-back-label");
  var iterEl = document.getElementById("vqc-loop-iter");
  var accuracyEl = document.getElementById("vqc-loop-accuracy");
  var hint = document.getElementById("vqc-loop-hint");
  var prepareBtn = document.getElementById("vqc-loop-prepare-btn");
  var measureBtn = document.getElementById("vqc-loop-measure-btn");
  var updateBtn = document.getElementById("vqc-loop-update-btn");
  var resetBtn = document.getElementById("vqc-loop-reset-btn");

  var i = 0;
  function fmt(step, symbol) { return "θ₁" + (symbol || "=") + step.t1.toFixed(2) + ", θ₂" + (symbol || "=") + step.t2.toFixed(2); }

  function prepare() {
    quantumState.textContent = fmt(STEPS[i]);
    classicalState.textContent = "idle";
    fwdLabel.textContent = "—";
    backLabel.textContent = "—";
    hint.textContent = "Circuit prepared with these angles. Now measure the loss over all 8 points.";
    prepareBtn.disabled = true;
    measureBtn.disabled = false;
  }

  function measure() {
    var r = lossAndAccuracy(STEPS[i].t1, STEPS[i].t2);
    fwdLabel.textContent = "loss ≈ " + r.loss.toFixed(3);
    accuracyEl.textContent = r.correct + "/8";
    iterEl.textContent = String(i + 1);
    measureBtn.disabled = true;
    if (i + 1 < STEPS.length) {
      hint.textContent = "Measured loss ≈ " + r.loss.toFixed(3) + " (" + r.correct + "/8 correct). Let the classical optimizer propose a better angle.";
      updateBtn.disabled = false;
    } else {
      classicalState.textContent = "near-minimum";
      hint.textContent = "Loss ≈ " + r.loss.toFixed(3) + ", " + r.correct + "/8 correct — close to this circuit's true minimum (≈0.045), not exactly it. A few more iterations would close the rest of the gap.";
      resetBtn.disabled = false;
    }
  }

  function classicalUpdate() {
    i += 1;
    classicalState.textContent = "ready";
    backLabel.textContent = fmt(STEPS[i], "≈");
    hint.textContent = "Classical optimizer proposed a new angle. Prepare the next iteration.";
    updateBtn.disabled = true;
    prepareBtn.disabled = false;
    resetBtn.disabled = false;
  }

  function reset() {
    i = 0;
    quantumState.textContent = "idle";
    classicalState.textContent = "idle";
    fwdLabel.textContent = "—";
    backLabel.textContent = "—";
    iterEl.textContent = "0";
    accuracyEl.textContent = "—";
    hint.textContent = "Click Prepare to begin the first iteration.";
    prepareBtn.disabled = false;
    measureBtn.disabled = true;
    updateBtn.disabled = true;
    resetBtn.disabled = true;
  }

  prepareBtn.addEventListener("click", prepare);
  measureBtn.addEventListener("click", measure);
  updateBtn.addEventListener("click", classicalUpdate);
  resetBtn.addEventListener("click", reset);

  reset();
});
</script>

## What Comes Out: A Trained Classifier

Once the loop stops, \(\theta_1=-0.08\), \(\theta_2=0.17\) are fixed — close to, but not exactly, this circuit's true minimum. That's 8 out of 8 **training accuracy**: every point the circuit was trained on, it now gets right. That's a different claim from generalization — how well it would do on points it's never seen — which is addressed separately below, with only two examples, nowhere near enough to be real evidence either way.

Worth being honest about what this dataset does and doesn't demonstrate: setting \(\theta_1=\theta_2=0\) (no training at all) already gives \(\langle Z\otimes Z\rangle=\cos x_2\) exactly, by the closed form above — which *also* gets all 8 training points right, using what's effectively one qubit's worth of information. So this particular example doesn't prove training or entanglement were strictly necessary; it demonstrates the hybrid loop doing real optimization work and landing somewhere that works, which the closed form now lets us check directly rather than take on faith. The boundary below also isn't simply "distance from the origin," despite the ring-shaped dataset: at these trained angles, \((3,0)\) and \((0,3)\) sit at the same distance from the origin but score \(+0.981\) and \(-0.996\) respectively — opposite predictions. The tinted regions below show the actual trained boundary, evaluated point by point over a grid:

<div class="qed-demo" id="vqc-trained-demo">
  <svg class="qed-plot-svg" id="vqc-trained-svg" viewBox="0 0 280 400" width="280" height="400" role="img" aria-label="Grid of small tinted cells showing the trained classifier's predicted region for Class A and Class B, with all eight training points overlaid and correctly classified, plus two new test points added by button.">
    <g id="vqc-trained-grid"></g>
    <line class="qed-plot-axis" x1="20" y1="20" x2="20" y2="380" />
    <line class="qed-plot-axis" x1="20" y1="380" x2="260" y2="380" />
    <text class="qed-plot-label" x="15" y="18">x₂</text>
    <text class="qed-plot-label" x="252" y="393">x₁</text>

    <rect class="qed-vqc-point is-correct" x="146.0" y="186.5" width="18" height="18" />
    <rect class="qed-vqc-point is-correct" x="128.0" y="159.5" width="18" height="18" />
    <rect class="qed-vqc-point is-correct" x="110.0" y="186.5" width="18" height="18" />
    <rect class="qed-vqc-point is-correct" x="128.0" y="213.5" width="18" height="18" />
    <polygon class="qed-vqc-point is-correct" points="227.0,268.4 240.6,292.1 213.4,292.1" />
    <polygon class="qed-vqc-point is-correct" points="137.0,43.4 150.6,67.1 123.4,67.1" />
    <polygon class="qed-vqc-point is-correct" points="47.0,43.4 60.6,67.1 33.4,67.1" />
    <polygon class="qed-vqc-point is-correct" points="137.0,313.4 150.6,337.1 123.4,337.1" />

    <rect class="qed-vqc-newpoint" id="vqc-infer-marker-square" width="30" height="30" style="display:none;" />
    <polygon class="qed-vqc-newpoint" id="vqc-infer-marker-triangle" style="display:none;" />
  </svg>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary" id="vqc-infer-btn-1">Classify (1.0, 1.0)</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqc-infer-btn-2">Classify (−2.2, −2.2)</button>
  </div>
  <p class="qed-encode-demo__hint" id="vqc-infer-hint" aria-live="polite">Pick a point — neither was in the training set, and both sit well clear of every training point, not just alongside one.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("vqc-trained-demo");
  if (!demo) return;

  var T1 = -0.08, T2 = 0.17;
  var SCALE = 45, X0 = 137, Y0 = 195.5;
  function xFor(v) { return X0 + v * SCALE; }
  function yFor(v) { return Y0 - v * SCALE; }

  function ryMat(theta) {
    var c = Math.cos(theta / 2), s = Math.sin(theta / 2);
    return [[c, -s], [s, c]];
  }
  function applySingle(state, gate, qubit) {
    var out = [0, 0, 0, 0];
    for (var idx = 0; idx < 4; idx++) {
      var bit = (idx >> qubit) & 1;
      var other = idx & ~(1 << qubit);
      for (var nb = 0; nb < 2; nb++) {
        out[other | (nb << qubit)] += gate[nb][bit] * state[idx];
      }
    }
    return out;
  }
  function applyCNOT(state) {
    var out = [0, 0, 0, 0];
    for (var idx = 0; idx < 4; idx++) {
      out[(idx & 1) ? (idx ^ 2) : idx] = state[idx];
    }
    return out;
  }
  function circuitZZ(x1, x2) {
    var state = [1, 0, 0, 0];
    state = applySingle(state, ryMat(x1), 0);
    state = applySingle(state, ryMat(x2), 1);
    state = applyCNOT(state);
    state = applySingle(state, ryMat(T1), 0);
    state = applySingle(state, ryMat(T2), 1);
    var z = 0;
    for (var idx = 0; idx < 4; idx++) {
      var p = state[idx] * state[idx];
      var sign = (idx & 1 ? -1 : 1) * ((idx >> 1) & 1 ? -1 : 1);
      z += sign * p;
    }
    return z;
  }

  var grid = document.getElementById("vqc-trained-grid");
  (function buildGridOnce() {
    var step = 0.4;
    var html = "";
    for (var gx = -2.8; gx <= 2.8; gx += step) {
      for (var gy = -4.4; gy <= 4.4; gy += step) {
        var x1c = gx + step / 2, x2c = gy + step / 2;
        var zval = circuitZZ(x1c, x2c);
        var cls = zval > 0 ? "qed-vqc-region--a" : "qed-vqc-region--b";
        var sx = xFor(gx), sy = yFor(gy + step);
        if (sx < 15 || sx > 265 || sy < 15 || sy > 385) continue;
        html += '<rect class="qed-vqc-cell ' + cls + '" x="' + sx.toFixed(1) + '" y="' + sy.toFixed(1) + '" width="' + (step * SCALE).toFixed(1) + '" height="' + (step * SCALE).toFixed(1) + '" />';
      }
    }
    grid.innerHTML = html;
  })();

  var squareMarker = document.getElementById("vqc-infer-marker-square");
  var triangleMarker = document.getElementById("vqc-infer-marker-triangle");
  var hint = document.getElementById("vqc-infer-hint");
  var MARKER_R = 15;

  function classify(x1, x2) {
    var z = circuitZZ(x1, x2);
    var isA = z > 0;
    var cls = isA ? "A" : "B";
    var cx = xFor(x1), cy = yFor(x2);

    squareMarker.style.display = isA ? "" : "none";
    triangleMarker.style.display = isA ? "none" : "";
    if (isA) {
      squareMarker.setAttribute("x", (cx - MARKER_R).toFixed(1));
      squareMarker.setAttribute("y", (cy - MARKER_R).toFixed(1));
    } else {
      var R = MARKER_R * 1.75;
      var pts = [
        cx.toFixed(1) + "," + (cy - R).toFixed(1),
        (cx + R * 0.866).toFixed(1) + "," + (cy + R * 0.5).toFixed(1),
        (cx - R * 0.866).toFixed(1) + "," + (cy + R * 0.5).toFixed(1)
      ];
      triangleMarker.setAttribute("points", pts.join(" "));
    }
    hint.textContent = "New point (" + x1 + ", " + x2 + "): ⟨Z⊗Z⟩ ≈ " + z.toFixed(3) + " → predicted Class " + cls + ". This is how inference works once training is done — just applying the fixed angles. Two points aren't evidence of how well this would generalize in general.";
  }

  document.getElementById("vqc-infer-btn-1").addEventListener("click", function () { classify(1.0, 1.0); });
  document.getElementById("vqc-infer-btn-2").addEventListener("click", function () { classify(-2.2, -2.2); });
});
</script>

## VQC vs. VQE vs. QAOA

| | VQE | QAOA | VQC |
|---|---|---|---|
| Output | A number (ground-state energy) | A bitstring (a candidate solution) | A trained decision rule (fixed angles) |
| Problem type | Continuous optimization | Combinatorial optimization | Classification |
| What's measured | \(\langle H \rangle\) | \(\langle C \rangle\) | Loss over a labeled dataset |
| Classical counterpart | Diagonalizing a Hamiltonian | Classical combinatorial optimization | Training a classical classifier |

## Takeaway

<div class="qed-demo" style="text-align:center;">
  <svg class="qed-loop-svg" viewBox="0 0 520 235" width="520" height="235" role="img" aria-label="Diagram of the VQC loop: encode features, entangle, and apply trainable RY gates on two qubits, measure the loss over the dataset, update the thetas, and repeat until the loss stops improving much, producing a trained classifier.">
    <defs>
      <marker id="vqc-loop-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path class="qed-loop-arrowhead-fill" d="M0,0 L8,4 L0,8 Z" />
      </marker>
    </defs>

    <rect class="qed-loop-box" x="10" y="70" width="150" height="50" rx="6" />
    <text class="qed-loop-label" x="85" y="90">Encode, entangle,</text>
    <text class="qed-loop-label" x="85" y="104">apply trainable RY</text>

    <rect class="qed-loop-box" x="195" y="70" width="120" height="50" rx="6" />
    <text class="qed-loop-label" x="255" y="90">Measure loss</text>
    <text class="qed-loop-label" x="255" y="104">over dataset</text>

    <rect class="qed-loop-box" x="350" y="70" width="160" height="50" rx="6" />
    <text class="qed-loop-label" x="430" y="90">Classical optimizer</text>
    <text class="qed-loop-label" x="430" y="104">updates θ₁, θ₂</text>

    <line class="qed-loop-arrow" x1="160" y1="95" x2="192" y2="95" marker-end="url(#vqc-loop-arrowhead)" />
    <line class="qed-loop-arrow" x1="315" y1="95" x2="347" y2="95" marker-end="url(#vqc-loop-arrowhead)" />

    <path class="qed-loop-arrow" d="M 430 70 L 430 20 L 85 20 L 85 70" marker-end="url(#vqc-loop-arrowhead)" />
    <text class="qed-loop-label" x="257" y="18">repeat</text>

    <line class="qed-loop-arrow" x1="430" y1="120" x2="430" y2="167" marker-end="url(#vqc-loop-arrowhead)" />
    <text class="qed-loop-label" x="470" y="146">loss stops</text>
    <text class="qed-loop-label" x="470" y="158">improving much</text>

    <rect class="qed-loop-box qed-loop-box--protected" x="350" y="170" width="160" height="50" rx="6" />
    <text class="qed-loop-label" x="430" y="190">Trained classifier</text>
    <text class="qed-loop-label" x="430" y="204">(fixed θ₁, θ₂, 8/8 training)</text>
  </svg>
</div>

A line couldn't separate these classes. Adding one derived feature and a plane could — a classical fix that needed someone to guess the right feature first. The quantum circuit used only the original two features and a generic encode-entangle-train ansatz, and the hybrid loop still found working angles through real gradient-descent updates rather than a derivation — the same loop structure as VQE and QAOA, applied to a loss that measures classification error instead of energy or cut value. This particular dataset turned out to be simple enough that it didn't strictly need the entangling gate or the training to work (the closed form made that checkable, not just assumed); the value of running the loop here is in seeing the mechanics work end to end on a case small enough to verify by hand. Techniques like SQD extend this same family of hybrid loops further still, though it doesn't have its own lesson here yet.

**[Back to Module 06 Overview →](index.md)**
