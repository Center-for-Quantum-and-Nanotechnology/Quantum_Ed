# What Is Quantum Computing?

A classical computer stores and processes **bits**. A quantum computer stores and processes **qubits**, which obey different rules. This page introduces the four ideas that the rest of QuantumEd builds on: **qubits**, **superposition**, **measurement**, and **entanglement**. Each comes with an interactive demonstration.

## Qubits

Qubits obey different rules than classical bits. A classical bit is always either `0` or `1`. A **qubit** is a two-level quantum system whose state can be a combination, or *superposition*, of both:

\[
|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\varphi}\sin\left(\frac{\theta}{2}\right)|1\rangle
\]

Any single-qubit state can be pictured as a point on the surface of a sphere, the **Bloch sphere**. The angle \(\theta\) sets how much of the state points toward \(|0\rangle\) versus \(|1\rangle\), and \(\varphi\) sets a **phase**. A single measurement cannot detect the phase, but it becomes essential once states are combined, as the next section shows.

Use the sliders below to move the state around the sphere and observe how the measurement probabilities change.

<div class="qed-demo" id="bloch-demo">
  <div class="qed-demo__layout">
    <canvas id="bloch-canvas" width="260" height="260" role="img" aria-label="Bloch sphere showing the current qubit state."></canvas>
    <div class="qed-demo__controls">
      <label for="theta-slider">θ — polar angle: <span id="theta-value">90°</span></label>
      <input type="range" id="theta-slider" min="0" max="180" value="90" step="1">
      <label for="phi-slider">φ — phase angle: <span id="phi-value">0°</span></label>
      <input type="range" id="phi-slider" min="0" max="360" value="0" step="1">
      <div class="qed-demo__state">
        <div id="state-formula">|ψ⟩ = 0.71|0⟩ + <i>e</i><sup><i>i</i>·0°</sup>·0.71|1⟩</div>
        <div>P(measure 0) = <span id="prob0">50.0%</span> &nbsp;&nbsp; P(measure 1) = <span id="prob1">50.0%</span></div>
      </div>
    </div>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("bloch-canvas");
  if (!canvas || !window.QedBloch) return;
  var thetaSlider = document.getElementById("theta-slider");
  var phiSlider = document.getElementById("phi-slider");
  var thetaValue = document.getElementById("theta-value");
  var phiValue = document.getElementById("phi-value");
  var stateFormula = document.getElementById("state-formula");
  var prob0El = document.getElementById("prob0");
  var prob1El = document.getElementById("prob1");

  function update() {
    var thetaDeg = parseInt(thetaSlider.value, 10);
    var phiDeg = parseInt(phiSlider.value, 10);
    var s = QedBloch.state(thetaDeg, phiDeg);

    thetaValue.textContent = thetaDeg + "°";
    phiValue.textContent = phiDeg + "°";
    stateFormula.innerHTML = QedBloch.formatHTML(thetaDeg, phiDeg);
    prob0El.textContent = (s.p0 * 100).toFixed(1) + "%";
    prob1El.textContent = (s.p1 * 100).toFixed(1) + "%";
    canvas.setAttribute("aria-label", "Bloch sphere. " + QedBloch.formatText(thetaDeg, phiDeg));
    QedBloch.render(canvas, thetaDeg, phiDeg);
  }

  thetaSlider.addEventListener("input", update);
  phiSlider.addEventListener("input", update);
  update();
});
</script>

Two observations:

- **θ controls the odds.** At 0° the qubit is certainly `0`; at 180° it is certainly `1`; at 90° the two outcomes are equally likely.
- **φ does not change the odds.** Varying it moves the arrow around the sphere, but the probabilities stay fixed. Phase is a genuine property of the state; it is simply invisible to a single measurement.

The numbers multiplying \(|0\rangle\) and \(|1\rangle\) (0.71 and 0.71 in the starting position) are called **amplitudes**. The probability of an outcome is the square of its amplitude, so two amplitudes of 0.71 give \(0.71^2 \approx 50\%\) each. The sliders show how these amplitudes correspond to a point on the sphere; [Module 02](../02-fundamentals/index.md) treats the Bloch sphere in full.

## Superposition

The phrase "a qubit is both 0 and 1 at the same time" is common shorthand, but it invites a misreading, so it is worth being precise.

Consider a coin that has been flipped and covered with a cup. It is heads or tails; we simply have not looked. That is ordinary uncertainty about a value that already exists. A qubit in superposition is not like this. It is described by two **amplitudes**, one for `0` and one for `1`, and amplitudes can be positive or negative. That allows them to **cancel**, much as two overlapping waves can partly or fully cancel each other. This effect is called **interference**, and it is what distinguishes a superposition from a hidden coin.

The demonstration below applies the same "mix" operation to a classical random bit and to a qubit. For the qubit, the operation is the **Hadamard gate**, written *H*. Gates are covered properly in [Module 02](../02-fundamentals/index.md), so here it serves simply as a mix button. For the classical bit, mixing means re-flipping a fair coin. Start both at `0`, apply the mix, and then apply it a second time.

<div class="qed-demo" id="mix-demo">
  <div class="qed-compare-row" style="align-items:stretch;">
    <div class="qed-panel">
      <div class="qed-panel__title">Classical random bit</div>
      <div class="qed-panel__state" id="mix-classical-state">definitely 0</div>
      <div id="mix-classical-bars"></div>
    </div>
    <div class="qed-panel qed-panel--quantum">
      <div class="qed-panel__title">Qubit</div>
      <div class="qed-panel__state" id="mix-quantum-state">|0⟩</div>
      <div id="mix-quantum-amps"></div>
      <div id="mix-quantum-bars"></div>
    </div>
  </div>
  <div class="qed-demo__controls" style="min-width:auto; text-align:center; margin-top:0.8rem;">
    <span>Start both in:</span>
    <button type="button" class="qed-button qed-button--secondary qed-button--active" id="mix-start-0" aria-pressed="true">0</button>
    <button type="button" class="qed-button qed-button--secondary" id="mix-start-1" aria-pressed="false">1</button>
    <button type="button" class="qed-button" id="mix-apply">Apply mix (H)</button>
    <button type="button" class="qed-button qed-button--secondary" id="mix-reset">Reset</button>
    <div class="qed-demo__note">Mixes applied: <strong id="mix-count">0</strong></div>
  </div>
  <div class="qed-error-demo__feedback" id="mix-feedback" aria-live="polite"></div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var applyBtn = document.getElementById("mix-apply");
  if (!applyBtn) return;
  var resetBtn = document.getElementById("mix-reset");
  var startBtns = [document.getElementById("mix-start-0"), document.getElementById("mix-start-1")];
  var countEl = document.getElementById("mix-count");
  var cStateEl = document.getElementById("mix-classical-state");
  var cBarsEl = document.getElementById("mix-classical-bars");
  var qStateEl = document.getElementById("mix-quantum-state");
  var qAmpsEl = document.getElementById("mix-quantum-amps");
  var qBarsEl = document.getElementById("mix-quantum-bars");
  var feedbackEl = document.getElementById("mix-feedback");

  var EPS = 1e-9;
  var start = 0;
  var n = 0;
  var amp = [1, 0]; // qubit amplitudes (real numbers are enough here)
  var prob = [1, 0]; // classical probabilities

  function clean(x) {
    if (Math.abs(x) < EPS) return 0;
    if (Math.abs(x - 1) < EPS) return 1;
    if (Math.abs(x + 1) < EPS) return -1;
    return x;
  }

  function signed(x) {
    var t = Math.abs(x).toFixed(2);
    return (x < 0 ? "−" : "+") + t;
  }

  function stateName(a) {
    var h = Math.SQRT1_2;
    if (Math.abs(a[0] - 1) < EPS) return "|0⟩";
    if (Math.abs(a[1] - 1) < EPS) return "|1⟩";
    if (Math.abs(a[0] - h) < EPS && Math.abs(a[1] - h) < EPS) return "|+⟩";
    if (Math.abs(a[0] - h) < EPS && Math.abs(a[1] + h) < EPS) return "|−⟩";
    return "|ψ⟩";
  }

  function probRow(label, p, logical) {
    var pct = (p * 100).toFixed(0);
    return (
      '<div class="qed-confidence-row">' +
      '<span class="qed-confidence-row__label" style="flex-basis:2.6rem;">' + label + "</span>" +
      '<div class="qed-confidence-bar"><div class="qed-confidence-bar__fill' +
      (logical ? " qed-confidence-bar__fill--logical" : "") +
      '" style="width:' + pct + '%"></div></div>' +
      '<span class="qed-confidence-row__pct">' + pct + "%</span></div>"
    );
  }

  function ampRow(label, a) {
    var width = Math.min(Math.abs(a), 1) * 50;
    return (
      '<div class="qed-amp-row"><span class="qed-amp-row__label">' + label + "</span>" +
      '<div class="qed-amp-bar"><div class="qed-amp-bar__fill' + (a < 0 ? " qed-amp-bar__fill--neg" : "") +
      '" style="width:' + width + '%"></div></div>' +
      '<span class="qed-amp-row__val">' + signed(a) + "</span></div>"
    );
  }

  function message() {
    var qp0 = amp[0] * amp[0];
    var certain = qp0 > 1 - EPS || qp0 < EPS;
    if (n === 0) {
      return "Both start as a definite " + start + ". Press <strong>Apply mix</strong> to begin.";
    }
    if (!certain) {
      if (start === 0) {
        return "Both are now 50/50, and at this point the qubit cannot be told apart from the coin. This is why a qubit is often mistaken for a hidden coin. Apply the mix once more.";
      }
      return "Both are again 50/50, but the qubit's amplitude for |1⟩ is now negative (the hatched bar). This is a different state from the one reached by starting at 0, even though the odds are the same. Apply the mix again to see why the difference matters.";
    }
    return "<strong>Classical bit:</strong> still 50/50. Mixing a random bit yields another random bit. <strong>Qubit:</strong> back to a certain " + (qp0 > 0.5 ? 0 : 1) + ". The two contributions to the other outcome had opposite signs and cancelled. This is interference, which a hidden coin cannot reproduce.";
  }

  function render() {
    countEl.textContent = n;
    cStateEl.textContent = n === 0 ? "definitely " + start : "a fair coin flip";
    cBarsEl.innerHTML = probRow("P(0)", prob[0], false) + probRow("P(1)", prob[1], false);
    qStateEl.textContent = "|ψ⟩ = " + stateName(amp);
    qAmpsEl.innerHTML = ampRow("amp. of |0⟩", amp[0]) + ampRow("amp. of |1⟩", amp[1]);
    qBarsEl.innerHTML = probRow("P(0)", amp[0] * amp[0], true) + probRow("P(1)", amp[1] * amp[1], true);
    feedbackEl.innerHTML = message();
  }

  function setStart(v) {
    start = v;
    n = 0;
    amp = v === 0 ? [1, 0] : [0, 1];
    prob = v === 0 ? [1, 0] : [0, 1];
    startBtns.forEach(function (b, i) {
      var on = i === v;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    render();
  }

  applyBtn.addEventListener("click", function () {
    var h = Math.SQRT1_2;
    amp = [clean((amp[0] + amp[1]) * h), clean((amp[0] - amp[1]) * h)];
    prob = [0.5, 0.5];
    n++;
    render();
  });
  resetBtn.addEventListener("click", function () { setStart(start); });
  startBtns[0].addEventListener("click", function () { setStart(0); });
  startBtns[1].addEventListener("click", function () { setStart(1); });

  setStart(0);
});
</script>

After one mix, the bit and the qubit are indistinguishable: both give `0` or `1` with equal probability. After the second mix, the bit remains 50/50 while the qubit returns to a certain outcome. The qubit's state contains more than its measurement probabilities. It contains amplitudes, and the second mix caused the unwanted ones to cancel.

Starting from `1` illustrates a further point. After one mix the odds are again 50/50, but the second amplitude is now negative. The two resulting states, \(|+\rangle\) (reached from `0`) and \(|-\rangle\) (reached from `1`), give identical measurement statistics yet are distinct states. These names recur in later modules.

!!! tip "Key idea"
    A superposition is not a coin we have not yet looked at. It is a state described by amplitudes that can add or cancel. Many quantum algorithms work by arranging this interference so that incorrect answers cancel and the correct one is reinforced.

<details class="qed-details" markdown="1">
<summary>Show the math: how the mix works</summary>

Each new amplitude is formed by adding or subtracting the old ones and dividing by \(\sqrt{2}\):

\[
a_0' = \frac{a_0 + a_1}{\sqrt{2}} \qquad a_1' = \frac{a_0 - a_1}{\sqrt{2}}
\]

Starting from \(|0\rangle\), the amplitudes are \((a_0, a_1) = (1, 0)\). One mix gives \((0.71, 0.71)\), the state \(|+\rangle\). A second mix gives

\[
a_1'' = \frac{0.71 - 0.71}{\sqrt{2}} = 0
\]

The two terms are equal and opposite, so they cancel exactly. Starting from \(|1\rangle\), the first mix gives \((0.71, -0.71)\), and the second mix cancels the \(|0\rangle\) amplitude instead.

</details>

## Measurement

Superposition describes a qubit's state; measurement is how information is extracted from it. Measuring a qubit does not reveal its amplitudes. It returns a single classical bit, `0` or `1`, according to three rules:

1. **One outcome.** Every measurement yields exactly one definite result.
2. **Probabilities from amplitudes.** The probability of each outcome is the square of its amplitude, a rule known as the **Born rule**. Amplitudes of 0.71 and 0.71, for instance, give \(0.71^2 \approx 0.5\), so each outcome has a 50% chance.
3. **The state changes.** Afterward, the qubit is left in the state corresponding to the result it gave. This is commonly called **collapse**. Measuring again gives the same result.

In terms of the angle \(\theta\) from the Bloch sphere, the probabilities are

\[
P(0) = \cos^2\left(\frac{\theta}{2}\right) \qquad P(1) = \sin^2\left(\frac{\theta}{2}\right)
\]

The demonstration below lets you prepare a qubit with the sliders and measure it. Measure it several times in a row and note what happens.

<div class="qed-demo" id="measure-demo">
  <div class="qed-demo__layout">
    <canvas id="measure-canvas" width="260" height="260" role="img" aria-label="Bloch sphere showing the qubit before measurement."></canvas>
    <div class="qed-demo__controls">
      <label for="m-theta-slider">θ — polar angle: <span id="m-theta-value">90°</span></label>
      <input type="range" id="m-theta-slider" min="0" max="180" value="90" step="1">
      <label for="m-phi-slider">φ — phase angle: <span id="m-phi-value">0°</span></label>
      <input type="range" id="m-phi-slider" min="0" max="360" value="0" step="1">
      <div class="qed-demo__state">
        <div id="measure-state"></div>
      </div>
      <div style="margin-top:0.6rem;">
        <button type="button" class="qed-button" id="measure-once">Measure the qubit</button>
        <button type="button" class="qed-button qed-button--secondary" id="measure-reprepare">Re-prepare qubit</button>
      </div>
    </div>
  </div>
  <div class="qed-error-demo__readout" id="measure-history" aria-label="Measurement history"></div>
  <div class="qed-error-demo__feedback" id="measure-status" aria-live="polite">Press <strong>Measure the qubit</strong> to obtain one outcome.</div>
  <p class="qed-demo__note" style="margin-top:1rem;">A single measurement says little about the probabilities. To estimate them, one needs many identically prepared qubits. This button prepares and measures 100 fresh qubits in sequence:</p>
  <button type="button" class="qed-button" id="measure-shots">Run 100 shots</button>
  <button type="button" class="qed-button qed-button--secondary" id="measure-clear">Clear tally</button>
  <div id="measure-bars" style="margin-top:0.6rem;"></div>
  <p class="qed-demo__note" id="measure-tally" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("measure-canvas");
  if (!canvas || !window.QedBloch) return;
  var thetaSlider = document.getElementById("m-theta-slider");
  var phiSlider = document.getElementById("m-phi-slider");
  var thetaValue = document.getElementById("m-theta-value");
  var phiValue = document.getElementById("m-phi-value");
  var stateEl = document.getElementById("measure-state");
  var historyEl = document.getElementById("measure-history");
  var statusEl = document.getElementById("measure-status");
  var barsEl = document.getElementById("measure-bars");
  var tallyEl = document.getElementById("measure-tally");
  var measureBtn = document.getElementById("measure-once");
  var reprepareBtn = document.getElementById("measure-reprepare");
  var shotsBtn = document.getElementById("measure-shots");
  var clearBtn = document.getElementById("measure-clear");

  var theta = 90;
  var phi = 0;
  var collapsed = null; // null = prepared and unmeasured; 0 or 1 = measured
  var history = [];
  var counts = [0, 0];

  function pct(x) {
    return (x * 100).toFixed(1) + "%";
  }

  function drawState() {
    var s = QedBloch.state(theta, phi);
    if (collapsed === null) {
      QedBloch.render(canvas, theta, phi);
      stateEl.innerHTML = QedBloch.formatHTML(theta, phi) + "<br>P(0) = " + pct(s.p0) + " &nbsp; P(1) = " + pct(s.p1);
      canvas.setAttribute("aria-label", "Bloch sphere, qubit not yet measured. " + QedBloch.formatText(theta, phi));
    } else {
      QedBloch.render(canvas, collapsed === 0 ? 0 : 180, 0);
      stateEl.innerHTML = "|ψ⟩ = |" + collapsed + "⟩ &nbsp;(after measurement)";
      canvas.setAttribute("aria-label", "Bloch sphere. After measuring " + collapsed + ", the qubit is in the state " + collapsed + ".");
    }
  }

  function drawHistory() {
    var shown = history.slice(-14);
    historyEl.innerHTML = shown
      .map(function (h) {
        return h === "new"
          ? '<span class="qed-pill qed-pill--neutral">↺ new qubit</span>'
          : '<span class="qed-pill"><span class="qed-pill__label">got</span>' + h + "</span>";
      })
      .join("");
  }

  function drawBars() {
    var total = counts[0] + counts[1];
    var s = QedBloch.state(theta, phi);
    var expected = [s.p0, s.p1];
    var html = "";
    for (var i = 0; i < 2; i++) {
      var share = total ? counts[i] / total : 0;
      html +=
        '<div class="qed-confidence-row">' +
        '<span class="qed-confidence-row__label" style="flex-basis:6.5rem;">measured |' + i + "⟩</span>" +
        '<div class="qed-confidence-bar qed-confidence-bar--marked">' +
        '<div class="qed-confidence-bar__fill qed-confidence-bar__fill--logical" style="width:' + share * 100 + '%"></div>' +
        '<div class="qed-confidence-bar__marker" style="left:calc(' + expected[i] * 100 + '% - 1px)"></div></div>' +
        '<span class="qed-confidence-row__pct" style="flex-basis:7rem;">' + counts[i] + " (" + pct(share) + ")</span></div>";
    }
    barsEl.innerHTML = html;
    tallyEl.textContent = total
      ? total + " shots so far. The dark tick on each bar marks the predicted probability; further runs bring the bars closer to it."
      : "No shots yet. After a run, a dark tick on each bar will mark the predicted probability.";
  }

  function redraw() {
    drawState();
    drawHistory();
    drawBars();
  }

  function resetForNewPreparation() {
    collapsed = null;
    history = [];
    counts = [0, 0];
    statusEl.innerHTML = "Press <strong>Measure the qubit</strong> to obtain one outcome.";
  }

  function onSlider() {
    theta = parseInt(thetaSlider.value, 10);
    phi = parseInt(phiSlider.value, 10);
    thetaValue.textContent = theta + "°";
    phiValue.textContent = phi + "°";
    resetForNewPreparation();
    redraw();
  }

  measureBtn.addEventListener("click", function () {
    var s = QedBloch.state(theta, phi);
    if (collapsed === null) {
      collapsed = Math.random() < s.p0 ? 0 : 1;
      history.push(collapsed);
      statusEl.innerHTML = "Outcome: <strong>" + collapsed + "</strong>. The qubit is now in the state |" + collapsed + "⟩, and the arrow has moved to the corresponding pole. Measure again.";
    } else {
      history.push(collapsed);
      statusEl.innerHTML = "Outcome: <strong>" + collapsed + "</strong> again. After a measurement the qubit remains in the measured state, so repeated measurements agree. Press <strong>Re-prepare qubit</strong> to start with a fresh qubit.";
    }
    redraw();
  });

  reprepareBtn.addEventListener("click", function () {
    collapsed = null;
    history.push("new");
    statusEl.innerHTML = "A fresh qubit, prepared in the state set by the sliders. This measurement may give a different result.";
    redraw();
  });

  shotsBtn.addEventListener("click", function () {
    var s = QedBloch.state(theta, phi);
    for (var i = 0; i < 100; i++) {
      if (Math.random() < s.p0) counts[0]++;
      else counts[1]++;
    }
    drawBars();
  });

  clearBtn.addEventListener("click", function () {
    counts = [0, 0];
    drawBars();
  });

  thetaSlider.addEventListener("input", onSlider);
  phiSlider.addEventListener("input", onSlider);
  redraw();
});
</script>

Some things to try:

- Set θ to 0° or 180°. The outcome is certain, since the qubit is already `0` or `1` and the measurement simply reads it out.
- Set θ to 45° and run a few hundred shots. The fraction of zeros will be close to \(\cos^2(22.5^\circ) \approx 85\%\), but rarely exactly that. Statistical fluctuation of this kind is expected.
- Vary φ. The probabilities do not change, because a single measurement is insensitive to phase.

!!! note "Simplifications"
    The measurement shown here is idealized: it always reports the true result. Real hardware readout is imperfect, which is one reason error correction is necessary (see [Module 04](../04-hardware/index.md) and [Module 07](../07-error-correction/index.md)). The outcomes are also generated by a random-number generator using the probabilities that quantum mechanics predicts; they are not data from a quantum computer.

A measurement returns one bit regardless of how much structure the state had, and θ and φ cannot be read off directly. Quantum algorithms are therefore designed so that the correct answer appears with high probability when the final measurement is made.

## Entanglement

With a single qubit, state and measurement are straightforward. With two or more, a new possibility arises: the qubits can be **entangled**, meaning the state belongs to the pair as a whole rather than to either qubit individually.

The standard example is a **Bell pair**. Suppose one qubit is sent to Alice and the other to Bob, who are far apart, and each measures their own. Two things hold:

- Each person's results, taken alone, are random: about half `0` and half `1`, with no pattern.
- Their results always agree.

The demonstration below generates pairs in two ways, so that the quantum case can be compared with a classical one.

<div class="qed-demo" id="pair-demo">
  <div style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary qed-button--active" id="pair-mode-classical" aria-pressed="true">Pre-agreed coins (classical)</button>
    <button type="button" class="qed-button qed-button--secondary" id="pair-mode-quantum" aria-pressed="false">Entangled pair (quantum)</button>
  </div>
  <p class="qed-demo__note" id="pair-caption" style="text-align:center;"></p>
  <div style="text-align:center;">
    <button type="button" class="qed-button" id="pair-send">Send 10 pairs</button>
    <button type="button" class="qed-button qed-button--secondary" id="pair-reset">Reset</button>
  </div>
  <table class="qed-results-table" id="pair-table" aria-label="Results of the last 10 pairs">
    <thead><tr><th>Pair</th><th>Alice sees</th><th>Bob sees</th><th>Same?</th></tr></thead>
    <tbody id="pair-body"></tbody>
  </table>
  <div class="qed-error-demo__feedback" id="pair-tally" aria-live="polite">Press <strong>Send 10 pairs</strong>.</div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var sendBtn = document.getElementById("pair-send");
  if (!sendBtn) return;
  var resetBtn = document.getElementById("pair-reset");
  var modeBtns = { classical: document.getElementById("pair-mode-classical"), quantum: document.getElementById("pair-mode-quantum") };
  var captionEl = document.getElementById("pair-caption");
  var bodyEl = document.getElementById("pair-body");
  var tallyEl = document.getElementById("pair-tally");

  var captions = {
    classical: "Each pair is prepared with a matching hidden label, like one glove placed in each of two boxes. The results agree because they were set up to agree.",
    quantum: "Each pair is an entangled Bell pair. Alice and Bob each measure their own qubit; neither qubit had a definite value beforehand.",
  };
  var mode = "classical";
  var pairs = 0;
  var matches = 0;
  var aliceZeros = 0;

  function setMode(m) {
    mode = m;
    ["classical", "quantum"].forEach(function (k) {
      modeBtns[k].classList.toggle("qed-button--active", k === m);
      modeBtns[k].setAttribute("aria-pressed", k === m ? "true" : "false");
    });
    captionEl.textContent = captions[m];
    reset();
  }

  function reset() {
    pairs = 0;
    matches = 0;
    aliceZeros = 0;
    bodyEl.innerHTML = "";
    tallyEl.innerHTML = "Press <strong>Send 10 pairs</strong>.";
  }

  sendBtn.addEventListener("click", function () {
    var rows = "";
    for (var i = 0; i < 10; i++) {
      // Both models give identical statistics when Alice and Bob ask the
      // same question: each side is a fair coin, and the two always agree.
      var a = Math.random() < 0.5 ? 0 : 1;
      var b = a;
      pairs++;
      if (a === b) matches++;
      if (a === 0) aliceZeros++;
      rows += "<tr><td>" + (i + 1) + "</td><td>" + a + "</td><td>" + b + "</td><td>" + (a === b ? "✓" : "✗") + "</td></tr>";
    }
    bodyEl.innerHTML = rows;
    tallyEl.innerHTML =
      "<strong>" + pairs + "</strong> pairs so far. Same result: <strong>" + matches + " of " + pairs + "</strong>. " +
      "Alice saw <code>0</code> in <strong>" + ((aliceZeros / pairs) * 100).toFixed(0) + "%</strong> of them: individually random, yet always matching Bob.";
  });

  resetBtn.addEventListener("click", reset);
  modeBtns.classical.addEventListener("click", function () { setMode("classical"); });
  modeBtns.quantum.addEventListener("click", function () { setMode("quantum"); });
  setMode("classical");
});
</script>

The two modes produce identical results, and that is the point: perfect agreement alone does not demonstrate entanglement. A classical scheme with shared randomness, such as the matching coins or the split pair of gloves, also agrees every time. The difference appears only when Alice and Bob ask *different questions*.

A qubit can be measured along any direction on the Bloch sphere, not only as "`0` or `1`?", and the direction is the question being asked. A classical scheme can settle its answers in advance, because each particle carries a label. A Bell pair behaves differently. For measurement directions \(\alpha\) (Alice) and \(\beta\) (Bob), quantum mechanics predicts

\[
P(\text{same result}) = \cos^2\left(\frac{\alpha - \beta}{2}\right)
\]

A game built on this prediction makes the difference measurable.

### The CHSH game

A referee gives Alice a random bit \(x\) and Bob a random bit \(y\). Without communicating, each replies with a bit, \(a\) and \(b\) respectively. They **win** if their answers are the same, with one exception: if both received a `1`, they win only if their answers *differ*. Before the game they may agree on any strategy and share as much randomness as they like. What is the best win rate they can achieve?

- **Classical strategy.** They share a random bit \(r\) and both answer \(r\). Their answers always match, so they win in every round except those where both received a `1`: **75%** of rounds.
- **Entangled strategy.** They share a Bell pair. Alice measures along \(0^\circ\) if \(x = 0\) and \(90^\circ\) if \(x = 1\); Bob measures along \(45^\circ\) if \(y = 0\) and \(-45^\circ\) if \(y = 1\). The formula above then predicts a win rate of about **85.4%**.

<div class="qed-demo" id="chsh-demo">
  <div class="qed-chsh-row">
    <div class="qed-chsh-row__head">
      <strong>Shared randomness (classical)</strong>
      <button type="button" class="qed-button" id="chsh-play-classical">Play 1,000 rounds</button>
    </div>
    <div class="qed-confidence-row">
      <div class="qed-confidence-bar qed-confidence-bar--marked" role="img" aria-label="Classical win rate bar" id="chsh-bar-classical">
        <div class="qed-confidence-bar__fill" id="chsh-fill-classical" style="width:0%"></div>
        <div class="qed-confidence-bar__marker" style="left:calc(75% - 1px)"></div>
      </div>
      <span class="qed-confidence-row__pct" id="chsh-pct-classical" style="flex-basis:4.5rem;">—</span>
    </div>
    <div class="qed-demo__note" id="chsh-text-classical">No rounds played yet.</div>
  </div>
  <div class="qed-chsh-row">
    <div class="qed-chsh-row__head">
      <strong>Entangled pair (quantum)</strong>
      <button type="button" class="qed-button" id="chsh-play-quantum">Play 1,000 rounds</button>
    </div>
    <div class="qed-confidence-row">
      <div class="qed-confidence-bar qed-confidence-bar--marked" role="img" aria-label="Entangled win rate bar" id="chsh-bar-quantum">
        <div class="qed-confidence-bar__fill qed-confidence-bar__fill--logical" id="chsh-fill-quantum" style="width:0%"></div>
        <div class="qed-confidence-bar__marker" style="left:calc(75% - 1px)"></div>
      </div>
      <span class="qed-confidence-row__pct" id="chsh-pct-quantum" style="flex-basis:4.5rem;">—</span>
    </div>
    <div class="qed-demo__note" id="chsh-text-quantum">No rounds played yet.</div>
  </div>
  <p class="qed-demo__note">The dark tick on each bar marks <strong>75%</strong>, the highest long-run average any classical strategy can achieve.</p>
  <button type="button" class="qed-button qed-button--secondary" id="chsh-reset">Reset both</button>
  <div class="qed-error-demo__feedback" id="chsh-feedback" aria-live="polite">Play each strategy a few times and compare.</div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var resetBtn = document.getElementById("chsh-reset");
  if (!resetBtn) return;
  var feedbackEl = document.getElementById("chsh-feedback");
  var strategies = {
    classical: { rounds: 0, wins: 0 },
    quantum: { rounds: 0, wins: 0 },
  };
  var ALICE_TILT = [0, 90]; // degrees, indexed by Alice's input x
  var BOB_TILT = [45, -45]; // degrees, indexed by Bob's input y

  function bit() {
    return Math.random() < 0.5 ? 0 : 1;
  }

  function playRound(kind) {
    var x = bit();
    var y = bit();
    var a, b;
    if (kind === "classical") {
      var r = bit(); // the shared random bit
      a = r;
      b = r;
    } else {
      // Sampled from the quantum prediction for a Bell pair: each answer
      // is a fair coin on its own, and the pair agrees with probability
      // cos^2((alpha - beta) / 2).
      var delta = ((ALICE_TILT[x] - BOB_TILT[y]) * Math.PI) / 180;
      var pSame = Math.pow(Math.cos(delta / 2), 2);
      a = bit();
      b = Math.random() < pSame ? a : 1 - a;
    }
    return (a ^ b) === (x & y);
  }

  function show(kind) {
    var s = strategies[kind];
    var rate = s.rounds ? s.wins / s.rounds : 0;
    document.getElementById("chsh-fill-" + kind).style.width = rate * 100 + "%";
    document.getElementById("chsh-pct-" + kind).textContent = s.rounds ? (rate * 100).toFixed(1) + "%" : "—";
    document.getElementById("chsh-text-" + kind).textContent = s.rounds
      ? s.wins + " wins in " + s.rounds + " rounds"
      : "No rounds played yet.";
  }

  function summary() {
    var c = strategies.classical;
    var q = strategies.quantum;
    if (!c.rounds || !q.rounds) {
      feedbackEl.innerHTML = "Play each strategy a few times and compare.";
      return;
    }
    var cr = (c.wins / c.rounds) * 100;
    var qr = (q.wins / q.rounds) * 100;
    feedbackEl.innerHTML =
      "Classical: <strong>" + cr.toFixed(1) + "%</strong> · Entangled: <strong>" + qr.toFixed(1) + "%</strong>. " +
      "Individual runs fluctuate, but the 75% limit applies to the long-run average. " +
      "The entangled pair stays well above it, which no classical strategy can do.";
  }

  function play(kind) {
    var s = strategies[kind];
    for (var i = 0; i < 1000; i++) {
      s.rounds++;
      if (playRound(kind)) s.wins++;
    }
    show(kind);
    summary();
  }

  document.getElementById("chsh-play-classical").addEventListener("click", function () { play("classical"); });
  document.getElementById("chsh-play-quantum").addEventListener("click", function () { play("quantum"); });
  resetBtn.addEventListener("click", function () {
    strategies.classical = { rounds: 0, wins: 0 };
    strategies.quantum = { rounds: 0, wins: 0 };
    show("classical");
    show("quantum");
    summary();
  });
});
</script>

The entangled pair exceeds the classical limit. Entanglement therefore produces correlations that no strategy based on pre-arranged answers or shared randomness can reproduce. This game is a form of the **CHSH inequality**, one example of a **Bell test**. Bell tests have been carried out many times, with entangled photons and other systems, and the results match the quantum prediction. This work was recognized by the 2022 Nobel Prize in Physics.

<details class="qed-details" markdown="1">
<summary>Show the math: why no classical strategy can exceed 75%</summary>

Suppose Alice's answers are fixed in advance: \(a_0\) if \(x = 0\) and \(a_1\) if \(x = 1\), and Bob's are \(b_0\) and \(b_1\). Winning all four possible input pairs would require

\[
a_0 \oplus b_0 = 0 \qquad a_0 \oplus b_1 = 0 \qquad a_1 \oplus b_0 = 0 \qquad a_1 \oplus b_1 = 1
\]

Add the four left-hand sides, using addition without carry (\(\oplus\)). Each of \(a_0, a_1, b_0, b_1\) appears exactly twice and cancels, so the sum is \(0\), while the right-hand sides sum to \(1\). The four conditions cannot all hold, so at most 3 of the 4 input pairs can be won, which is **75%**.

Shared randomness does not help. It only mixes between fixed strategies, and an average of strategies that each win at most 75% cannot exceed 75%.

</details>

!!! warning "Entanglement is not a communication channel"
    Alice's measurement does not send anything to Bob. Bob's results, taken alone, are random whatever Alice does. The correlation appears only when the two compare their results, which requires ordinary communication. Entanglement cannot be used to send messages faster than light.

In symbols, the Bell pair is

\[
|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}
\]

The state assigns equal weight to "both qubits are 0" and "both qubits are 1", and none to the cases where they differ. It cannot be written as a product of one state for each qubit, which is the precise sense in which neither qubit has a state of its own.

## What to carry forward

- A **qubit** is described by amplitudes; the Bloch sphere is one way to picture a single qubit's state.
- **Superposition** means amplitudes that can add or cancel (interference), not a hidden `0` or `1`.
- **Measurement** returns one classical bit with probability given by the amplitude squared, and leaves the qubit in the state it reported.
- **Entanglement** produces correlations between qubits that no classical shared-randomness strategy can reproduce, and it cannot be used to send messages.

Superposition, interference, and entanglement are the raw ingredients of quantum algorithms, but none of them alone guarantees a speedup; the skill lies in arranging them so that useful answers emerge. With this vocabulary in place, [Quantum Computing Today](quantum-computing-today.md) looks at what current hardware can do with these ideas.
