# Qubit Representation

How do we write a state down so we can calculate what it will do?

## From a Prepared State to Numbers

On the [previous page](quantum-states.md), a preparation produced a state, and the state came with numbers that decide the probabilities of the outcomes. We described those numbers in words. Now we write them down.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Before</span><span>A preparation produces a state</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Now</span><span>The state comes with numbers that decide the probabilities</span></div>
  </div>
</div>

> **How can we write a state down so we can calculate what it will do?**

The idea is simple. A qubit has two basis states, |0⟩ and |1⟩. A state gets one number for each of them. Those two numbers are the precise version of what the last page described in words.

## Two Numbers for Two Basis States

A state is written as **a|0⟩ + b|1⟩**, where *a* and *b* are numbers. They are called **[amplitudes](../glossary.md#probability-amplitude)**. In this page's main view they are ordinary real numbers, and they can be negative.

A **ket** such as |0⟩ is a *name* for a state. Each name stands for a particular pair of amplitudes:

<div class="qed-demo" id="qr-kets"></div>

Three words are easy to mix up, so keep them apart:

- **Ket** — a name for a state, such as |0⟩ or |+⟩.
- **Amplitude** — one of the two numbers that describe the state.
- **Probability** — the chance of an outcome, which we will find from an amplitude.

The balanced superposition from the last page is |+⟩. The column of two numbers in the table is just another way to list the same pair. We do not calculate with it here.

!!! warning "Real amplitudes are a simplification"
    Some states need more than real numbers. Using real amplitudes keeps this page simple, and it is enough to see how amplitudes, probabilities, and signs fit together. The formal version, with complex numbers, appears at the Intermediate level.

!!! question "Why does |+⟩ show 0.71?"
    Its amplitudes are 1/√2, which is about 0.71. Squared, 0.71 gives about 0.5, so each outcome is about 50% likely.

## Amplitude Editor

Set the two amplitudes and watch what happens. Start from a preset or drag the sliders. Everything updates together, and the page tells you whether what you have built is a valid state.

<div class="qed-demo qed-editor" id="qr-editor">
  <p class="qed-demo__step"><strong>1. Choose a preset, or set the amplitudes yourself</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Presets" id="qr-presets"></div>

  <div class="qed-editor__amps">
    <div class="qed-editor__amp">
      <p class="qed-editor__amp-title"><strong>Amplitude of |0⟩</strong></p>
      <div class="qed-editor__inputs" data-mode="real">
        <input type="range" id="qr-a-range" min="-1" max="1" step="0.01" aria-label="Amplitude of 0, slider">
        <input type="number" id="qr-a-num" min="-1" max="1" step="0.01" aria-label="Amplitude of 0, typed value">
      </div>
      <p class="qed-editor__sign" id="qr-a-sign" data-mode="real"></p>
      <div class="qed-editor__polar" data-mode="polar" hidden>
        <label for="qr-a-mag">Magnitude</label>
        <div class="qed-editor__inputs">
          <input type="range" id="qr-a-mag" min="0" max="1" step="0.01">
          <input type="number" id="qr-a-mag-num" min="0" max="1" step="0.01" aria-label="Magnitude of the amplitude of 0, typed value">
        </div>
        <label for="qr-a-phase">Phase (degrees)</label>
        <div class="qed-editor__inputs">
          <input type="range" id="qr-a-phase" min="0" max="360" step="1">
          <input type="number" id="qr-a-phase-num" min="0" max="360" step="1" aria-label="Phase of the amplitude of 0 in degrees, typed value">
        </div>
      </div>
    </div>
    <div class="qed-editor__amp">
      <p class="qed-editor__amp-title"><strong>Amplitude of |1⟩</strong></p>
      <div class="qed-editor__inputs" data-mode="real">
        <input type="range" id="qr-b-range" min="-1" max="1" step="0.01" aria-label="Amplitude of 1, slider">
        <input type="number" id="qr-b-num" min="-1" max="1" step="0.01" aria-label="Amplitude of 1, typed value">
      </div>
      <p class="qed-editor__sign" id="qr-b-sign" data-mode="real"></p>
      <div class="qed-editor__polar" data-mode="polar" hidden>
        <label for="qr-b-mag">Magnitude</label>
        <div class="qed-editor__inputs">
          <input type="range" id="qr-b-mag" min="0" max="1" step="0.01">
          <input type="number" id="qr-b-mag-num" min="0" max="1" step="0.01" aria-label="Magnitude of the amplitude of 1, typed value">
        </div>
        <label for="qr-b-phase">Phase (degrees)</label>
        <div class="qed-editor__inputs">
          <input type="range" id="qr-b-phase" min="0" max="360" step="1">
          <input type="number" id="qr-b-phase-num" min="0" max="360" step="1" aria-label="Phase of the amplitude of 1 in degrees, typed value">
        </div>
      </div>
    </div>
  </div>

  <div class="qed-editor__global" id="qr-global" hidden>
    <label for="qr-global-range"><strong>Shift both phases together</strong> (degrees)</label>
    <div class="qed-editor__inputs">
      <input type="range" id="qr-global-range" min="-180" max="180" step="1" value="0">
      <output id="qr-global-out">0°</output>
    </div>
  </div>

  <p class="qed-demo__step"><strong>2. The state you built</strong></p>
  <div class="qed-prepared qed-prepared--live">
    <span class="qed-prepared__tag">Written form</span>
    <span><span id="qr-form"></span> <span id="qr-name"></span></span>
  </div>
  <p class="qed-editor__details" id="qr-details" hidden></p>

  <p class="qed-demo__step"><strong>3. Is it a valid state?</strong></p>
  <p class="qed-editor__validity" id="qr-validity"></p>

  <p class="qed-demo__step"><strong>4. The probabilities</strong></p>
  <div id="qr-bars"></div>

  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="qr-normalize">Normalize</button>
    <button type="button" class="qed-button qed-button--secondary" id="qr-reset">Reset</button>
  </div>
  <p class="qed-editor__note" id="qr-note"></p>
  <div class="qed-sr-only" id="qr-summary" role="status" aria-live="polite"></div>

  <p class="qed-demo__step"><strong>Challenge: make outcome 1 happen 36% of the time</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="qr-challenge">Check my state</button>
  </div>
  <p class="qed-quiz__feedback" id="qr-challenge-feedback" aria-live="polite"></p>
</div>

Notice the separate places. The numbers you set are the amplitudes. The written form is the state they describe. The validity line checks the state. The bars show the probabilities that follow.

## Probabilities from Amplitudes

The probability of an outcome is its amplitude **squared**. Take the amplitudes 0.6 and 0.8:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Amplitudes 0.6 and 0.8</span></div>
  <div class="qed-encode-demo__arrow">↓ square each one</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>0.36 and 0.64</span></div>
  <div class="qed-encode-demo__arrow">↓ as percentages</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>36% and 64%, which add to 100%</span></div>
</div>

That last part is the rule of **[normalization](../glossary.md#normalization)**. The probabilities of all the outcomes must add to 100%, so the squares of the amplitudes must add to 1. A state that does not satisfy it is not a valid state. This is a requirement, not a free choice of numbers: you cannot pick any two amplitudes you like.

Check your understanding. First, predict before the bars appear:

<div class="qed-demo" id="qr-quiz-predict"></div>
<div class="qed-demo" id="qr-predict-bars" hidden></div>

Then decide which pairs are valid states:

<div class="qed-demo" id="qr-quiz-valid"></div>

The challenge in the editor above is the third check: set the amplitudes so that outcome 1 happens 36% of the time.

## The Sign Matters

A negative amplitude is not a negative probability, and the sign does not change the probability at all. Compare |+⟩ and |−⟩:

<div class="qed-demo" id="qr-compare"></div>

The bars are identical. The amplitude lists are not. So |+⟩ and |−⟩ are **different states** that give the **same** Z-basis counts. This is the same-counts, different-states idea from the previous page, now with numbers.

!!! question "If the probabilities are the same, in what way are |+⟩ and |−⟩ different?"
    They are different states with different amplitudes. A sign is a real difference even when it does not show up in these probabilities. Later pages show how to tell them apart. Nothing on this page does.

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### The formal layer

**Complex numbers in one minute.** A complex number has a real part and an imaginary part: \(z = x + yi\), where \(i^2 = -1\). Its **modulus** is \(|z| = \sqrt{x^2 + y^2}\), so \(|z|^2 = x^2 + y^2\).

Amplitudes can be complex. Write the state as \(|\psi\rangle = \alpha|0\rangle + \beta|1\rangle\). Then the probabilities are \(|\alpha|^2\) and \(|\beta|^2\), and normalization is

\[ |\alpha|^2 + |\beta|^2 = 1 . \]

Real amplitudes are the special case where each amplitude has a phase of 0° or 180°. At this level the editor above shows each amplitude as a magnitude and a phase, so you can see this directly: change a phase and watch what the probabilities do.

**Global phase and relative phase.** Multiply both amplitudes by the same phase factor and nothing you can observe changes: no probability, and no relationship between the two amplitudes. That shared factor is the **[global phase](../glossary.md#global-phase)**. What does matter is the phase of \(\beta\) relative to \(\alpha\), the **[relative phase](../glossary.md#relative-phase)**. It is 0° for |+⟩ and 180° for |−⟩, which is exactly the sign difference you saw above. Use the "shift both phases" control in the editor to see the bars and the relative phase stay put.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Naming the formalism

The language behind this is that of a **[Hilbert space](../glossary.md#hilbert-space)**: states are vectors, probabilities come from their inner products with other vectors (the "dual" vectors), and two vectors that differ only by a global phase are treated as the same physical state. A later treatment makes these ideas precise.

</div>

## From Writing Down to Picturing

Compare what you can do now with what is still hard.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>So far</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write a state as two numbers</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Calculate the probabilities</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Check that the state is valid</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Still hard</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>See a state at a glance</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>See its sign without reading numbers</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>See how states relate to each other</span></div>
    </div>
  </div>
</div>

Here are |+⟩ and |−⟩ side by side as lists of numbers:

<div class="qed-demo" id="qr-lists"></div>

A list of numbers hides the sign and is hard to compare. We need a picture.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A state</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Two numbers, one per basis state</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Their squares are the probabilities, and must add to 1</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The sign carries something the probabilities do not show</span></div>
</div>

A qubit's state can be written as two amplitudes. Their squares give the probabilities and must add to 1, and the signs carry information the probabilities do not show.

> **How can we picture a state, including its sign, instead of reading a list of numbers?**

**Next: Bloch Sphere →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedQubit;
  var S = window.QedShots;
  var QL = window.QedLevel;
  var Z = window.QedQuiz;
  var EPS = 1e-9;
  var START = Q.real(0.6, 0.8);

  var state = START;
  var note = "";
  var phi = [0, 0];        // phases in degrees, kept so a zero magnitude does not lose its phase
  var gammaLast = 0;       // last value of the "shift both phases" slider

  function $(id) { return document.getElementById(id); }
  function pct(p) { return Math.round(p * 1000) / 10; }
  function fixed(x, digits) { return (Math.round(x * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits); }
  function signed(x, digits) { var t = fixed(Math.abs(x), digits); return (x < 0 && parseFloat(t) !== 0 ? "−" : "") + t; }
  function toDeg(rad) { var d = (rad * 180) / Math.PI; return ((d % 360) + 360) % 360; }
  function isReal(s) { return Math.abs(s.alpha.im) < EPS && Math.abs(s.beta.im) < EPS; }
  function signWord(x) { return Math.abs(x) < 0.005 ? "zero" : x < 0 ? "negative" : "positive"; }
  function near(a, b) { return Math.abs(a - b) < 1e-6; }

  function presetName(s) {
    for (var i = 0; i < Q.PRESETS.length; i++) {
      var p = Q.PRESETS[i].state;
      if (near(s.alpha.re, p.alpha.re) && near(s.alpha.im, p.alpha.im) && near(s.beta.re, p.beta.re) && near(s.beta.im, p.beta.im)) return Q.PRESETS[i].name;
    }
    return "";
  }

  function probRows(s) {
    var p = Q.probabilities(s);
    return [
      { label: "Outcome 0", fraction: p[0], text: pct(p[0]) + "%" },
      { label: "Outcome 1", fraction: p[1], text: pct(p[1]) + "%" }
    ];
  }

  // ---- static, data-driven tables built from the shared presets ----------------
  function buildKets() {
    var rows = Q.PRESETS.map(function (p) {
      var a = signed(p.state.alpha.re, 2), b = signed(p.state.beta.re, 2);
      return "<tr><th scope=\"row\">" + p.name + "</th><td>" + Q.format(p.state) + "</td><td>(" + a + ", " + b + ")</td></tr>";
    }).join("");
    $("qr-kets").innerHTML =
      '<table class="qed-comparison-table"><thead><tr><th scope="col">Ket (the name)</th><th scope="col">Written as</th><th scope="col">The same pair, as a column of two numbers</th></tr></thead><tbody>' +
      rows + "</tbody></table>";
  }

  function buildCompare() {
    var plus = Q.PRESETS.filter(function (p) { return p.id === "plus"; })[0];
    var minus = Q.PRESETS.filter(function (p) { return p.id === "minus"; })[0];
    function panel(p) {
      return '<div class="qed-prepared"><span class="qed-prepared__tag">' + p.name + '</span><strong>' + Q.format(p.state) + "</strong>" +
        S.renderBars(probRows(p.state)) + "</div>";
    }
    $("qr-compare").innerHTML = '<div class="qed-demo__layout" style="justify-content: space-around; align-items:stretch;">' + panel(plus) + panel(minus) + "</div>";
  }

  function buildLists() {
    var rows = Q.PRESETS.filter(function (p) { return p.id === "plus" || p.id === "minus"; }).map(function (p) {
      return "<tr><th scope=\"row\">" + p.name + "</th><td>(" + signed(p.state.alpha.re, 2) + ", " + signed(p.state.beta.re, 2) + ")</td></tr>";
    }).join("");
    $("qr-lists").innerHTML = '<table class="qed-comparison-table"><thead><tr><th scope="col">State</th><th scope="col">Amplitudes</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // ---- the editor --------------------------------------------------------------
  function syncPhasesFromState() {
    phi[0] = Q.phase(state.alpha) === null ? phi[0] : toDeg(Q.phase(state.alpha));
    phi[1] = Q.phase(state.beta) === null ? phi[1] : toDeg(Q.phase(state.beta));
  }

  function setValue(el, value, skip) {
    if (el !== skip) el.value = value;
  }

  function showLevelControls() {
    var inter = QL.atLeast("intermediate");
    Array.prototype.forEach.call(document.querySelectorAll("#qr-editor [data-mode='real']"), function (el) { el.hidden = inter; });
    Array.prototype.forEach.call(document.querySelectorAll("#qr-editor [data-mode='polar']"), function (el) { el.hidden = !inter; });
    $("qr-global").hidden = !inter;
    $("qr-details").hidden = !inter;
    return inter;
  }

  function render(skip) {
    var inter = QL.atLeast("intermediate");
    var p = Q.probabilities(state);
    var v = Q.validity(state);

    $("qr-form").textContent = Q.format(state);
    var name = presetName(state);
    $("qr-name").textContent = name ? "(this is " + name + ")" : "";

    var vEl = $("qr-validity");
    vEl.className = "qed-editor__validity " + (v.valid ? "is-valid" : "is-invalid");
    vEl.textContent = (v.valid ? "✓ " : "✗ ") + v.text;

    $("qr-bars").innerHTML = S.renderBars(probRows(state));

    // controls
    if (isReal(state)) {
      setValue($("qr-a-range"), state.alpha.re, skip);
      setValue($("qr-a-num"), fixed(state.alpha.re, 2), skip);
      setValue($("qr-b-range"), state.beta.re, skip);
      setValue($("qr-b-num"), fixed(state.beta.re, 2), skip);
      $("qr-a-sign").textContent = "Sign: " + signWord(state.alpha.re);
      $("qr-b-sign").textContent = "Sign: " + signWord(state.beta.re);
    }
    if (inter) {
      var mags = [Q.modulus(state.alpha), Q.modulus(state.beta)];
      setValue($("qr-a-mag"), mags[0], skip);
      setValue($("qr-a-mag-num"), fixed(mags[0], 2), skip);
      setValue($("qr-b-mag"), mags[1], skip);
      setValue($("qr-b-mag-num"), fixed(mags[1], 2), skip);
      setValue($("qr-a-phase"), phi[0], skip);
      setValue($("qr-a-phase-num"), fixed(phi[0], 0), skip);
      setValue($("qr-b-phase"), phi[1], skip);
      setValue($("qr-b-phase-num"), fixed(phi[1], 0), skip);
      var rel = Q.relativePhase(state);
      $("qr-details").textContent =
        "Modulus of the |0⟩ amplitude: " + fixed(mags[0], 2) + ". Modulus of the |1⟩ amplitude: " + fixed(mags[1], 2) + ". " +
        (rel === null ? "Relative phase: undefined while an amplitude is zero." : "Relative phase: " + fixed(toDeg(rel), 0) + "°.");
    }

    // preset buttons show which one matches
    Array.prototype.forEach.call($("qr-presets").querySelectorAll("button"), function (b) {
      var on = b.dataset.name === name;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var zero = Q.norm2(state) < EPS;
    $("qr-normalize").disabled = v.valid || zero;
    $("qr-note").textContent = note || (zero ? "Nothing can be normalized while both amplitudes are zero." : "");

    $("qr-summary").textContent =
      "State " + Q.format(state) + ". " + v.text + " Outcome 0: " + pct(p[0]) + "%. Outcome 1: " + pct(p[1]) + "%." + (note ? " " + note : "");
  }

  function setState(next, message, skip) {
    state = next;
    note = message || "";
    $("qr-global-range").value = 0;
    $("qr-global-out").textContent = "0°";
    gammaLast = 0;
    syncPhasesFromState();
    render(skip);
  }

  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

  // Real-amplitude controls (Beginner view)
  function wireReal(rangeId, numId, index) {
    function apply(value, src) {
      var a = index === 0 ? value : state.alpha.re;
      var b = index === 1 ? value : state.beta.re;
      setState(Q.real(a, b), "", src);
    }
    $(rangeId).addEventListener("input", function () { apply(parseFloat(this.value), this); });
    $(numId).addEventListener("input", function () {
      var v = parseFloat(this.value);
      if (isNaN(v)) return;
      apply(clamp(v, -1, 1), this);
    });
  }
  wireReal("qr-a-range", "qr-a-num", 0);
  wireReal("qr-b-range", "qr-b-num", 1);

  // Magnitude and phase controls (Intermediate view)
  function wirePolar(magId, magNumId, phaseId, phaseNumId, index) {
    function apply(kind, value, src) {
      var mags = [Q.modulus(state.alpha), Q.modulus(state.beta)];
      if (kind === "mag") mags[index] = value; else phi[index] = value;
      var next = Q.fromPolar(mags[0], (phi[0] * Math.PI) / 180, mags[1], (phi[1] * Math.PI) / 180);
      state = next;
      note = "";
      $("qr-global-range").value = 0;
      $("qr-global-out").textContent = "0°";
      gammaLast = 0;
      render(src);
    }
    $(magId).addEventListener("input", function () { apply("mag", parseFloat(this.value), this); });
    $(magNumId).addEventListener("input", function () { var v = parseFloat(this.value); if (!isNaN(v)) apply("mag", clamp(v, 0, 1), this); });
    $(phaseId).addEventListener("input", function () { apply("phase", parseFloat(this.value), this); });
    $(phaseNumId).addEventListener("input", function () { var v = parseFloat(this.value); if (!isNaN(v)) apply("phase", clamp(v, 0, 360), this); });
  }
  wirePolar("qr-a-mag", "qr-a-mag-num", "qr-a-phase", "qr-a-phase-num", 0);
  wirePolar("qr-b-mag", "qr-b-mag-num", "qr-b-phase", "qr-b-phase-num", 1);

  // Shift both phases together (Intermediate view)
  $("qr-global-range").addEventListener("input", function () {
    var g = parseFloat(this.value);
    var delta = g - gammaLast;
    gammaLast = g;
    $("qr-global-out").textContent = g + "°";
    state = Q.applyGlobalPhase(state, (delta * Math.PI) / 180);
    syncPhasesFromState();
    note = "Both phases were shifted together. The probabilities and the relative phase did not change.";
    render(this);
  });

  // Presets, built from the shared model
  Q.PRESETS.forEach(function (p) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "qed-button qed-button--secondary";
    b.textContent = p.name;
    b.dataset.name = p.name;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { setState(p.state, ""); });
    $("qr-presets").appendChild(b);
  });

  $("qr-normalize").addEventListener("click", function () {
    try {
      setState(Q.normalize(state), "Normalized: both amplitudes were multiplied by the same factor, so their signs and phases are kept.");
    } catch (e) {
      setState(state, "Nothing to normalize: both amplitudes are zero.");
    }
  });
  $("qr-reset").addEventListener("click", function () {
    setState(START, "");
    $("qr-challenge-feedback").textContent = "";
    $("qr-challenge-feedback").className = "qed-quiz__feedback";
  });

  // Challenge: make outcome 1 happen 36% of the time
  $("qr-challenge").addEventListener("click", function () {
    var fb = $("qr-challenge-feedback");
    var v = Q.validity(state);
    var p1 = Q.probabilities(state)[1];
    var ok = false;
    var text;
    if (Q.norm2(state) < EPS) {
      text = "Both amplitudes are zero, so there is no state yet.";
    } else if (!v.valid) {
      text = "Not a valid state yet: the probabilities add to " + v.percent + "%. Make them add to 100% first (Normalize can help), then aim for outcome 1 at 36%.";
    } else if (Math.abs(p1 - 0.36) < 0.005) {
      ok = true;
      text = "Yes. Outcome 1 happens 36% of the time. Several pairs work: 0.8 and 0.6, and also 0.8 and −0.6, because the sign does not change the probability.";
    } else {
      text = "Outcome 1 happens " + pct(p1) + "% of the time, not 36%. The probability is the amplitude squared, so ask what number squares to 0.36.";
    }
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
  });

  // ---- level-aware behavior (additive: the Beginner view is the baseline) -----------
  function applyLevel() {
    var inter = showLevelControls();
    if (!inter && !isReal(state)) {
      setState(START, "Phase controls belong to the Intermediate view, so the editor went back to real amplitudes.");
      return;
    }
    syncPhasesFromState();
    render();
  }
  QL.onChange(applyLevel);

  // ---- checks -----------------------------------------------------------------------
  Z.mount($("qr-quiz-predict"), {
    title: "Predict first. A state has amplitudes 0.6 and 0.8. How likely is outcome 0?",
    items: [
      {
        prompt: "Choose the probability of outcome 0.",
        label: "Probability of outcome 0 for amplitudes 0.6 and 0.8",
        options: [
          { label: "60%", correct: false, why: "0.6 is the amplitude, not the probability. The probability is the amplitude squared." },
          { label: "36%", correct: true, why: "0.6 squared is 0.36, which is 36%. The bars below show it, along with outcome 1." },
          { label: "80%", correct: false, why: "0.8 is the other amplitude, and an amplitude is not a probability. 0.8 squared gives outcome 1's probability." },
          { label: "64%", correct: false, why: "That is outcome 1: 0.8 squared is 0.64. Outcome 0 comes from the amplitude 0.6." }
        ]
      }
    ]
  }, {
    onAnswer: function () {
      var s = Q.real(0.6, 0.8);
      var box = $("qr-predict-bars");
      box.hidden = false;
      box.innerHTML = "<p><strong>For the amplitudes 0.6 and 0.8:</strong></p>" + S.renderBars(probRows(s)) +
        "<p>" + Q.validity(s).text + "</p>";
    },
    onReset: function () { $("qr-predict-bars").hidden = true; }
  });

  Z.mount($("qr-quiz-valid"), {
    title: "Which pairs of amplitudes are valid states? Try each one.",
    items: [
      {
        prompt: "Pick a pair, and check the feedback.",
        label: "Which pair of amplitudes is a valid state",
        options: [
          { label: "0.6 and 0.6", correct: false, why: "0.6 squared plus 0.6 squared is 0.72, not 1. The probabilities would add to 72%." },
          { label: "0.6 and 0.8", correct: true, why: "0.36 plus 0.64 is 1, so the probabilities add to 100%." },
          { label: "0.6 and −0.8", correct: true, why: "Squaring removes the sign, so this adds to 1 exactly like 0.6 and 0.8. It is a different state with the same probabilities." },
          { label: "1 and 1", correct: false, why: "1 squared plus 1 squared is 2. The probabilities would add to 200%." },
          { label: "0.5 and 0.5", correct: false, why: "0.25 plus 0.25 is 0.5, so the probabilities add to only 50%." }
        ]
      }
    ]
  });

  buildKets();
  buildCompare();
  buildLists();
  showLevelControls();
  setState(START, "");
});
</script>
