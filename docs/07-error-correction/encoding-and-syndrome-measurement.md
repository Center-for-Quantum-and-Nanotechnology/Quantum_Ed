# Encoding & Syndrome Measurement

[Repetition Codes](repetition-codes.md) showed the whole encode → detect → correct pattern in one demo, but skated past one crucial question: *how* do you get the information needed to correct an error without collapsing the very state you're trying to protect? This page slows down and answers that question directly.

The central idea for the rest of this page:

> We don't ask "What is the logical state?" We ask "Is there evidence that the physical qubits disagree?"

## Starting with the Problem

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:9rem;"><div class="qed-qubit__label">Logical Qubit</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:9rem;"><div class="qed-qubit__label">Encode</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div style="display:flex; gap:0.6rem;">
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₁</div></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₂</div></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₃</div></div>
  </div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:9rem;"><div class="qed-qubit__label">X error occurs</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:9rem;"><div class="qed-qubit__label">?</div></div>
</div>

How can we determine which physical qubit was affected — **without measuring the logical qubit itself?**

The answer: measure *relationships* between the physical qubits, not the qubits' individual values.

## What Is a Syndrome?

A **syndrome** is the set of measurement outcomes obtained from the checks used to detect errors. For the 3-qubit repetition code, those checks are the same parity checks from [Repetition Codes](repetition-codes.md):

\[
S_1 = Z_1 Z_2 \qquad S_2 = Z_2 Z_3
\]

<div class="qed-demo">
  <div class="qed-parity-row">
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₁</div></div>
    <div class="qed-parity-link"><span class="qed-parity-link__label">S₁</span><span class="qed-parity-link__value">?</span></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₂</div></div>
    <div class="qed-parity-link"><span class="qed-parity-link__label">S₂</span><span class="qed-parity-link__value">?</span></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₃</div></div>
  </div>
</div>

Each check asks a yes/no question about a *pair* of qubits — do they agree with each other? — rather than asking what either qubit's value is. We won't need the full mathematical machinery behind \(Z_1Z_2\) yet; for now it's enough to know it's a measurement whose outcome is \(+1\) when q₁ and q₂ agree, and \(-1\) when they don't.

## Main Interactive — Measure the Syndrome

Pick a scenario, then take the deliberate step of measuring the syndrome.

<div class="qed-demo" id="sm-demo">
  <p><strong>1. Choose what happened:</strong></p>
  <div class="qed-syndrome-selector">
    <button type="button" class="qed-button qed-button--secondary sm-scenario-btn" data-error="none">No error</button>
    <button type="button" class="qed-button qed-button--secondary sm-scenario-btn" data-error="1">X₁</button>
    <button type="button" class="qed-button qed-button--secondary sm-scenario-btn" data-error="2">X₂</button>
    <button type="button" class="qed-button qed-button--secondary sm-scenario-btn" data-error="3">X₃</button>
  </div>

  <div class="qed-parity-row">
    <div class="qed-qubit qed-qubit--physical" id="sm-q1"><div class="qed-qubit__label">q₁</div><div class="qed-qubit__state">0</div></div>
    <div class="qed-qubit qed-qubit--physical" id="sm-q2"><div class="qed-qubit__label">q₂</div><div class="qed-qubit__state">0</div></div>
    <div class="qed-qubit qed-qubit--physical" id="sm-q3"><div class="qed-qubit__label">q₃</div><div class="qed-qubit__state">0</div></div>
  </div>

  <div class="qed-demo__controls" style="min-width:auto; text-align:center;">
    <button type="button" class="qed-button" id="sm-measure-btn" disabled>Measure Syndrome</button>
    <button type="button" class="qed-button qed-button--secondary" id="sm-reset-btn" disabled>Reset</button>
  </div>

  <div class="qed-syndrome-selector" id="sm-result" hidden>
    <div class="qed-syndrome-badge">
      <span class="qed-syndrome-badge__label">S₁</span>
      <span class="qed-syndrome-badge__symbol" id="sm-s1-symbol">?</span>
      <span class="qed-syndrome-badge__value" id="sm-s1-value">–</span>
    </div>
    <div class="qed-syndrome-badge">
      <span class="qed-syndrome-badge__label">S₂</span>
      <span class="qed-syndrome-badge__symbol" id="sm-s2-symbol">?</span>
      <span class="qed-syndrome-badge__value" id="sm-s2-value">–</span>
    </div>
  </div>

  <div class="qed-compare-row" id="sm-flow" hidden>
    <div class="qed-flow-step qed-flow-step--error">
      <span class="qed-flow-step__label">Error</span>
      <span id="sm-flow-error">–</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--syndrome">
      <span class="qed-flow-step__label">Syndrome</span>
      <span id="sm-flow-syndrome">–</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference">
      <span class="qed-flow-step__label">Inference</span>
      <span id="sm-flow-inference">–</span>
    </div>
  </div>
</div>

<script>
(function () {
  var demo = document.getElementById("sm-demo");
  if (!demo) return;

  var scenarioBtns = Array.prototype.slice.call(demo.querySelectorAll(".sm-scenario-btn"));
  var measureBtn = document.getElementById("sm-measure-btn");
  var resetBtn = document.getElementById("sm-reset-btn");
  var result = document.getElementById("sm-result");
  var flow = document.getElementById("sm-flow");
  var qubits = [1, 2, 3].map(function (n) {
    return {
      chip: document.getElementById("sm-q" + n),
      state: document.getElementById("sm-q" + n).querySelector(".qed-qubit__state"),
    };
  });

  // Shared, deterministic syndrome model for the repetition code: S1
  // compares q1/q2, S2 compares q2/q3. Kept as a pure function (error
  // label in, {s1, s2} out) so later stabilizer/surface-code demos can
  // swap in a different check layout without touching the UI wiring.
  function computeSyndrome(values) {
    return {
      s1: values[0] === values[1] ? 1 : -1,
      s2: values[1] === values[2] ? 1 : -1,
    };
  }

  function syndromeToErrorLabel(s1, s2) {
    if (s1 === 1 && s2 === 1) return "none";
    if (s1 === -1 && s2 === 1) return "1";
    if (s1 === -1 && s2 === -1) return "2";
    return "3";
  }

  var currentError = null;

  function selectScenario(errorLabel) {
    currentError = errorLabel;
    var values = [0, 0, 0];
    if (errorLabel !== "none") {
      values[parseInt(errorLabel, 10) - 1] = 1;
    }
    qubits.forEach(function (q, i) {
      q.state.textContent = values[i];
      q.chip.classList.toggle("qed-qubit--error", values[i] === 1);
    });
    scenarioBtns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.error === errorLabel);
    });
    measureBtn.disabled = false;
    resetBtn.disabled = false;
    result.hidden = true;
    flow.hidden = true;
  }

  function measureSyndrome() {
    var values = qubits.map(function (q) {
      return parseInt(q.state.textContent, 10);
    });
    var syndrome = computeSyndrome(values);

    document.getElementById("sm-s1-symbol").textContent = syndrome.s1 === 1 ? "✓" : "✗";
    document.getElementById("sm-s1-value").textContent = syndrome.s1 === 1 ? "(+1)" : "(−1)";
    document.getElementById("sm-s2-symbol").textContent = syndrome.s2 === 1 ? "✓" : "✗";
    document.getElementById("sm-s2-value").textContent = syndrome.s2 === 1 ? "(+1)" : "(−1)";
    result.hidden = false;

    var inferred = syndromeToErrorLabel(syndrome.s1, syndrome.s2);
    var errorText = currentError === "none" ? "None" : "X" + currentError;
    var syndromeText = "(" + (syndrome.s1 === 1 ? "+1" : "−1") + ", " + (syndrome.s2 === 1 ? "+1" : "−1") + ")";
    var inferenceText = inferred === "none" ? "No error detected" : "q" + inferred + " likely affected";

    document.getElementById("sm-flow-error").textContent = errorText;
    document.getElementById("sm-flow-syndrome").textContent = syndromeText;
    document.getElementById("sm-flow-inference").textContent = inferenceText;
    flow.hidden = false;
  }

  function reset() {
    currentError = null;
    qubits.forEach(function (q) {
      q.state.textContent = "0";
      q.chip.classList.remove("qed-qubit--error");
    });
    scenarioBtns.forEach(function (b) {
      b.classList.remove("qed-button--active");
    });
    measureBtn.disabled = true;
    resetBtn.disabled = true;
    result.hidden = true;
    flow.hidden = true;
  }

  scenarioBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      selectScenario(b.dataset.error);
    });
  });
  measureBtn.addEventListener("click", measureSyndrome);
  resetBtn.addEventListener("click", reset);

  reset();
})();
</script>

For reference:

| Error | Syndrome |
|---|---|
| None | (+1, +1) |
| X₁ | (−1, +1) |
| X₂ | (−1, −1) |
| X₃ | (+1, −1) |

## The Crucial Measurement Concept

<div class="qed-compare-row">
  <div class="qed-qubit qed-qubit--error" style="min-width:9rem;">
    <div class="qed-qubit__label">Logical state</div>
    <div class="qed-qubit__state">NOT measured ✕</div>
  </div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:9rem;">
    <div class="qed-qubit__label">Relationships between qubits</div>
    <div class="qed-qubit__state">WHAT IS measured ✓</div>
  </div>
</div>

Syndrome measurements give information about the presence and location of errors **without** directly revealing whether the logical qubit represents \(|0\rangle\), \(|1\rangle\), or a superposition of both.

That said, this isn't "measurement that never disturbs anything" — that would overstate it. QEC is deliberately *designed* so that the operators being measured (\(S_1\), \(S_2\), and their generalizations) commute with the encoded logical information. That's precisely what lets them extract error information while leaving the protected state alone.

## Interactive Challenge — Decode the Syndrome

Given a syndrome, can you identify the error it's consistent with?

<div class="qed-demo" id="sm-challenge">
  <div class="qed-syndrome-selector">
    <div class="qed-syndrome-badge">
      <span class="qed-syndrome-badge__label">S₁</span>
      <span class="qed-syndrome-badge__value" id="sm-c-s1">?</span>
    </div>
    <div class="qed-syndrome-badge">
      <span class="qed-syndrome-badge__label">S₂</span>
      <span class="qed-syndrome-badge__value" id="sm-c-s2">?</span>
    </div>
  </div>

  <div class="qed-demo__controls" style="min-width:auto; text-align:center;">
    <button type="button" class="qed-button" id="sm-c-new">New Syndrome</button>
    <button type="button" class="qed-button qed-button--secondary sm-c-guess" data-guess="1" disabled>X₁</button>
    <button type="button" class="qed-button qed-button--secondary sm-c-guess" data-guess="2" disabled>X₂</button>
    <button type="button" class="qed-button qed-button--secondary sm-c-guess" data-guess="3" disabled>X₃</button>
    <button type="button" class="qed-button qed-button--secondary sm-c-guess" data-guess="none" disabled>No error</button>
  </div>

  <div class="qed-error-demo__feedback" id="sm-c-feedback" hidden></div>
</div>

<script>
(function () {
  var newBtn = document.getElementById("sm-c-new");
  if (!newBtn) return;
  var guessBtns = Array.prototype.slice.call(document.querySelectorAll(".sm-c-guess"));
  var s1El = document.getElementById("sm-c-s1");
  var s2El = document.getElementById("sm-c-s2");
  var feedback = document.getElementById("sm-c-feedback");

  var CASES = [
    { s1: 1, s2: 1, answer: "none" },
    { s1: -1, s2: 1, answer: "1" },
    { s1: -1, s2: -1, answer: "2" },
    { s1: 1, s2: -1, answer: "3" },
  ];
  var current = null;

  function label(a) {
    return a === "none" ? "No error" : "X" + a;
  }

  function newRound() {
    current = CASES[Math.floor(Math.random() * CASES.length)];
    s1El.textContent = current.s1 === 1 ? "+1" : "−1";
    s2El.textContent = current.s2 === 1 ? "+1" : "−1";
    feedback.hidden = true;
    feedback.className = "qed-error-demo__feedback";
    guessBtns.forEach(function (b) {
      b.disabled = false;
    });
  }

  function guess(answer) {
    var correct = answer === current.answer;
    feedback.hidden = false;
    feedback.textContent = correct
      ? "Correct! Syndrome (" + s1El.textContent + ", " + s2El.textContent + ") is consistent with " + label(current.answer) + "."
      : "Not quite — syndrome (" + s1El.textContent + ", " + s2El.textContent + ") is consistent with " + label(current.answer) + ", not " + label(answer) + ".";
    feedback.className = "qed-error-demo__feedback " + (correct ? "qed-error-demo__feedback--correct" : "qed-error-demo__feedback--incorrect");
    guessBtns.forEach(function (b) {
      b.disabled = true;
    });
  }

  newBtn.addEventListener("click", newRound);
  guessBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      guess(b.dataset.guess);
    });
  });

  newRound();
})();
</script>

!!! note "Syndrome ≠ error"
    A syndrome doesn't necessarily tell us the complete history of what happened — it tells us what error information is *consistent with* the measured checks. For the single-error cases in this section, that's enough to pin down the answer exactly. In larger codes, multiple different physical error patterns can sometimes produce the very same syndrome.

## From Repetition Codes to Stabilizers

The parity-check idea generalizes well beyond three qubits:

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Repetition Code</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Pairwise parity checks</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit" style="min-width:10rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--protected" style="min-width:10rem;"><div class="qed-qubit__label">Error information</div></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem; align-self:center;">
      <span aria-hidden="true" style="font-size:1.5rem;">→</span>
      <span style="font-size:0.7rem; color:var(--md-default-fg-color--light);">generalize</span>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Stabilizer Codes</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Many commuting checks</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit" style="min-width:10rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--protected" style="min-width:10rem;"><div class="qed-qubit__label">Error information</div></div>
    </div>
  </div>
</div>

In stabilizer codes, the operators used for these checks are called **stabilizers**, and their measurement outcomes form the syndrome — exactly the pattern you just used, generalized to codes far more powerful than three qubits in a row. We'll leave the formalism itself for [Stabilizer Codes](stabilizer-codes.md).

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:11rem;"><div class="qed-qubit__label">Physical errors</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome measurements</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Information about the error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Decoder</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:11rem;"><div class="qed-qubit__label">Correction</div></div>
</div>

We can measure error information without directly measuring the logical state. But once we have a syndrome, how do we decide which error most likely occurred? That decision is called **decoding** — but first, let's generalize the parity-check idea itself so it works for codes far more powerful than the repetition code.

**[Next: Stabilizer Codes →](stabilizer-codes.md)**
