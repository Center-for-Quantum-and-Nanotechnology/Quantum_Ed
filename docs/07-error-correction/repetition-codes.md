# Repetition Codes

We've seen the pieces separately: a logical qubit can be [encoded across several physical qubits](physical-vs-logical-qubits.md), and physical qubits pick up [errors like bit flips and phase flips](errors-and-noise.md). This page puts them together into the simplest complete example of quantum error correction — the 3-qubit repetition code — and walks through encoding, injecting an error, detecting it, and correcting it.

## From One Qubit to an Encoded Qubit

Recall the encoding from Physical vs Logical Qubits. The repetition code encodes one logical qubit into three physical qubits by repeating the computational-basis value:

\[
|0\rangle_L \rightarrow |000\rangle \qquad |1\rangle_L \rightarrow |111\rangle
\]

For a general state, this extends linearly:

\[
\alpha|0\rangle + \beta|1\rangle \;\longrightarrow\; \alpha|000\rangle + \beta|111\rangle
\]

This is still **encoding, not copying**. The three physical qubits don't hold three independent copies of an unknown state — the no-cloning theorem rules that out. They hold one shared, correlated pattern that represents a single logical qubit.

## Interactive: Build, Break, and Fix the Code

Work through the four steps below in order. Everything stays visible as you go, and **Reset** is always available if you want to start over.

<div class="qed-demo" id="rep-demo">
  <p><strong>Step 1 — Encode</strong></p>
  <div class="qed-encode-demo__stage">
    <div class="qed-qubit qed-qubit--logical" id="rep-logical" style="min-width:9rem;">
      <div class="qed-qubit__label">Logical Qubit</div>
      <div class="qed-qubit__state" id="rep-logical-state">α|0⟩ + β|1⟩</div>
    </div>
    <div class="qed-encode-demo__arrow"><span>encode</span><span aria-hidden="true">↓</span></div>
    <div class="qed-encode-demo__physical-row" id="rep-physical-row">
      <div class="qed-encoded-group">
        <div class="qed-parity-row">
          <button type="button" class="qed-qubit qed-qubit--physical" id="rep-q1" data-qubit="1" disabled aria-label="Physical qubit 1 — click to inject a bit-flip error">
            <div class="qed-qubit__label">q₁</div>
            <div class="qed-qubit__state" id="rep-q1-state">0</div>
          </button>
          <div class="qed-parity-link">
            <span class="qed-parity-link__label">S₁ = Z₁Z₂</span>
            <span class="qed-parity-link__value" id="rep-s1">–</span>
          </div>
          <button type="button" class="qed-qubit qed-qubit--physical" id="rep-q2" data-qubit="2" disabled aria-label="Physical qubit 2 — click to inject a bit-flip error">
            <div class="qed-qubit__label">q₂</div>
            <div class="qed-qubit__state" id="rep-q2-state">0</div>
          </button>
          <div class="qed-parity-link">
            <span class="qed-parity-link__label">S₂ = Z₂Z₃</span>
            <span class="qed-parity-link__value" id="rep-s2">–</span>
          </div>
          <button type="button" class="qed-qubit qed-qubit--physical" id="rep-q3" data-qubit="3" disabled aria-label="Physical qubit 3 — click to inject a bit-flip error">
            <div class="qed-qubit__label">q₃</div>
            <div class="qed-qubit__state" id="rep-q3-state">0</div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="qed-encode-demo__controls">
    <button type="button" class="qed-button" id="rep-encode-btn">Encode</button>
    <button type="button" class="qed-button qed-button--secondary" id="rep-reset-btn" disabled>Reset</button>
  </div>

  <div id="rep-step2" hidden>
    <p><strong>Step 2 — Inject an error.</strong> Click a physical qubit above to give it a bit-flip (X) error.</p>
    <p class="qed-encode-demo__hint" id="rep-error-note" aria-live="polite">No error injected yet — the logical information is intact and represented by the whole encoded block.</p>
  </div>

  <div id="rep-step3" hidden>
    <p><strong>Step 3 — Detect with parity checks.</strong> <code>S₁</code> compares q₁ and q₂; <code>S₂</code> compares q₂ and q₃. Neither one looks at a qubit's value directly — only whether pairs agree.</p>
    <div class="qed-demo__controls" style="min-width:auto;">
      <button type="button" class="qed-button qed-button--secondary" id="rep-check-btn" disabled>Check Parity</button>
    </div>
    <p class="qed-encode-demo__hint" id="rep-syndrome-note" aria-live="polite"></p>
  </div>

  <div id="rep-step4" hidden>
    <p><strong>Step 4 — Correct the error.</strong> The syndrome tells us which qubit disagrees — flip it back, no need to look at the logical state itself.</p>
    <div class="qed-demo__controls" style="min-width:auto;">
      <button type="button" class="qed-button qed-button--secondary" id="rep-correct-btn" disabled>Correct Error</button>
    </div>
    <div class="qed-error-demo__feedback" id="rep-correct-feedback" hidden></div>
  </div>
</div>

<script>
(function () {
  var demo = document.getElementById("rep-demo");
  if (!demo) return;

  var logicalState = document.getElementById("rep-logical-state");
  var physicalRow = document.getElementById("rep-physical-row");
  var encodeBtn = document.getElementById("rep-encode-btn");
  var resetBtn = document.getElementById("rep-reset-btn");
  var checkBtn = document.getElementById("rep-check-btn");
  var correctBtn = document.getElementById("rep-correct-btn");
  var step2 = document.getElementById("rep-step2");
  var step3 = document.getElementById("rep-step3");
  var step4 = document.getElementById("rep-step4");
  var errorNote = document.getElementById("rep-error-note");
  var syndromeNote = document.getElementById("rep-syndrome-note");
  var correctFeedback = document.getElementById("rep-correct-feedback");
  var s1El = document.getElementById("rep-s1");
  var s2El = document.getElementById("rep-s2");

  var qubits = [1, 2, 3].map(function (n) {
    return {
      button: document.getElementById("rep-q" + n),
      state: document.getElementById("rep-q" + n + "-state"),
    };
  });

  // Syndrome model: qubit values are 0 (unflipped) or 1 (bit-flipped).
  // S1/S2 only compare pairs for agreement — this mirrors a real parity
  // (stabilizer) measurement, which reveals *relationships* between
  // qubits without reading out any individual qubit's value. Kept
  // separate from the logical-state display on purpose, so a future
  // stabilizer-code demo can reuse this same syndrome-vs-state split.
  var values = [0, 0, 0];
  var errorQubit = null; // 1, 2, or 3
  var syndromeChecked = false;

  function renderQubits() {
    qubits.forEach(function (q, i) {
      q.state.textContent = values[i];
      q.button.classList.toggle("qed-qubit--error", errorQubit === i + 1);
      q.button.classList.remove("qed-qubit--protected");
    });
  }

  function resetSyndromeDisplay() {
    s1El.textContent = "–";
    s2El.textContent = "–";
    s1El.className = "qed-parity-link__value";
    s2El.className = "qed-parity-link__value";
    syndromeNote.textContent = "";
    syndromeChecked = false;
    correctBtn.disabled = true;
    correctFeedback.hidden = true;
  }

  function selectError(qubitIndex) {
    values = [0, 0, 0];
    values[qubitIndex - 1] = 1;
    errorQubit = qubitIndex;
    renderQubits();
    errorNote.textContent =
      "Physical error: q" + qubitIndex + " has been flipped. Logical information: still represented by the encoded state as a whole.";
    resetSyndromeDisplay();
  }

  function checkParity() {
    var s1 = values[0] === values[1] ? 1 : -1;
    var s2 = values[1] === values[2] ? 1 : -1;
    s1El.textContent = s1 === 1 ? "+1" : "−1";
    s2El.textContent = s2 === 1 ? "+1" : "−1";
    s1El.className = "qed-parity-link__value " + (s1 === 1 ? "qed-parity-link__value--agree" : "qed-parity-link__value--disagree");
    s2El.className = "qed-parity-link__value " + (s2 === 1 ? "qed-parity-link__value--agree" : "qed-parity-link__value--disagree");
    syndromeChecked = true;

    var inferred = null;
    if (s1 === 1 && s2 === 1) inferred = null;
    else if (s1 === -1 && s2 === 1) inferred = 1;
    else if (s1 === -1 && s2 === -1) inferred = 2;
    else if (s1 === 1 && s2 === -1) inferred = 3;

    if (inferred === null) {
      syndromeNote.textContent = "Syndrome (S₁, S₂) = (+1, +1) — the qubits agree. No error detected.";
      correctBtn.disabled = true;
    } else {
      syndromeNote.textContent =
        "Syndrome (S₁, S₂) = (" + s1El.textContent + ", " + s2El.textContent + ") — q" + inferred + " disagrees with the others.";
      correctBtn.disabled = false;
    }
  }

  function correctError() {
    if (errorQubit === null) return;
    values[errorQubit - 1] = 0;
    var fixed = errorQubit;
    qubits[fixed - 1].button.classList.remove("qed-qubit--error");
    qubits[fixed - 1].button.classList.add("qed-qubit--protected");
    qubits[fixed - 1].state.textContent = "0";
    correctFeedback.hidden = false;
    correctFeedback.className = "qed-error-demo__feedback qed-error-demo__feedback--correct";
    correctFeedback.textContent =
      "✓ Error corrected. q" + fixed + " was flipped back using only the syndrome — the logical state was never measured directly.";
    correctBtn.disabled = true;
    errorQubit = null;
  }

  function setEncoded(encoded) {
    if (encoded) {
      logicalState.textContent = "α|000⟩ + β|111⟩";
      physicalRow.classList.add("is-visible");
      qubits.forEach(function (q) {
        q.button.disabled = false;
      });
      encodeBtn.disabled = true;
      resetBtn.disabled = false;
      checkBtn.disabled = false;
      step2.hidden = false;
      step3.hidden = false;
      step4.hidden = false;
      values = [0, 0, 0];
      errorQubit = null;
      renderQubits();
      resetSyndromeDisplay();
      errorNote.textContent = "No error injected yet — the logical information is intact and represented by the whole encoded block.";
    } else {
      logicalState.textContent = "α|0⟩ + β|1⟩";
      physicalRow.classList.remove("is-visible");
      qubits.forEach(function (q) {
        q.button.disabled = true;
      });
      encodeBtn.disabled = false;
      resetBtn.disabled = true;
      checkBtn.disabled = true;
      step2.hidden = true;
      step3.hidden = true;
      step4.hidden = true;
      values = [0, 0, 0];
      errorQubit = null;
      renderQubits();
      resetSyndromeDisplay();
    }
  }

  encodeBtn.addEventListener("click", function () {
    setEncoded(true);
  });
  resetBtn.addEventListener("click", function () {
    setEncoded(false);
  });
  checkBtn.addEventListener("click", checkParity);
  correctBtn.addEventListener("click", correctError);
  qubits.forEach(function (q, i) {
    q.button.addEventListener("click", function () {
      selectError(i + 1);
    });
  });

  setEncoded(false);
})();
</script>

For reference, here's the full syndrome table this code relies on — the pattern the interactive above is computing:

| Error | S₁ | S₂ |
|---|---|---|
| None | +1 | +1 |
| X₁ | −1 | +1 |
| X₂ | −1 | −1 |
| X₃ | +1 | −1 |

Each syndrome pattern points to exactly one qubit — that's what makes the error *correctable*, not just detectable. Note what the correction step did *not* do: it never asked "what is the logical state?" It only asked "do these pairs of physical qubits agree?" — which is exactly the measurement caveat from [Errors and Noise](errors-and-noise.md): the logical information is protected precisely because we never measured it directly.

## What Can This Code Correct?

- <span class="qed-cap-yes">✓</span> One \(X\) (bit-flip) error
- <span class="qed-cap-yes">✓</span> That error, on **any one** of the three physical qubits
- <span class="qed-cap-no">✗</span> A \(Z\) (phase-flip) error
- <span class="qed-cap-no">✗</span> An arbitrary error by itself
- <span class="qed-cap-no">✗</span> Multiple simultaneous \(X\) errors

Try it: apply a phase-flip error and run the same parity checks.

<div class="qed-demo" id="rep-limit-demo">
  <div class="qed-parity-row">
    <div class="qed-qubit qed-qubit--physical" id="rep-limit-q1"><div class="qed-qubit__label">q₁</div><div class="qed-qubit__state">0</div></div>
    <div class="qed-parity-link"><span class="qed-parity-link__label">S₁</span><span class="qed-parity-link__value" id="rep-limit-s1">–</span></div>
    <div class="qed-qubit qed-qubit--physical" id="rep-limit-q2"><div class="qed-qubit__label">q₂</div><div class="qed-qubit__state">0</div></div>
    <div class="qed-parity-link"><span class="qed-parity-link__label">S₂</span><span class="qed-parity-link__value" id="rep-limit-s2">–</span></div>
    <div class="qed-qubit qed-qubit--physical" id="rep-limit-q3"><div class="qed-qubit__label">q₃</div><div class="qed-qubit__state">0</div></div>
  </div>
  <div class="qed-demo__controls" style="min-width:auto; text-align:center;">
    <button type="button" class="qed-button" id="rep-limit-apply">Apply Z to q₂</button>
    <button type="button" class="qed-button qed-button--secondary" id="rep-limit-check" disabled>Check Parity</button>
    <button type="button" class="qed-button qed-button--secondary" id="rep-limit-reset" disabled>Reset</button>
  </div>
  <div class="qed-error-demo__feedback" id="rep-limit-feedback" hidden></div>
</div>

<script>
(function () {
  var applyBtn = document.getElementById("rep-limit-apply");
  if (!applyBtn) return;
  var checkBtn = document.getElementById("rep-limit-check");
  var resetBtn = document.getElementById("rep-limit-reset");
  var q2 = document.getElementById("rep-limit-q2");
  var s1El = document.getElementById("rep-limit-s1");
  var s2El = document.getElementById("rep-limit-s2");
  var feedback = document.getElementById("rep-limit-feedback");
  var zApplied = false;

  applyBtn.addEventListener("click", function () {
    zApplied = true;
    // Value pill unchanged on purpose: Z leaves computational-basis
    // values untouched, so this parity model (which only ever compares
    // values) has nothing to detect it with.
    q2.classList.add("qed-qubit--error");
    q2.querySelector(".qed-qubit__state").textContent = "0 (phase: −)";
    applyBtn.disabled = true;
    checkBtn.disabled = false;
    resetBtn.disabled = false;
  });

  checkBtn.addEventListener("click", function () {
    s1El.textContent = "+1";
    s2El.textContent = "+1";
    s1El.className = "qed-parity-link__value qed-parity-link__value--agree";
    s2El.className = "qed-parity-link__value qed-parity-link__value--agree";
    feedback.hidden = false;
    feedback.className = "qed-error-demo__feedback qed-error-demo__feedback--incorrect";
    feedback.textContent =
      "Syndrome (S₁, S₂) = (+1, +1) — identical to \"no error,\" even though q₂ really did experience a Z error. This code's parity checks only ever compare computational-basis values, so a phase flip is invisible to them.";
  });

  resetBtn.addEventListener("click", function () {
    zApplied = false;
    q2.classList.remove("qed-qubit--error");
    q2.querySelector(".qed-qubit__state").textContent = "0";
    s1El.textContent = "–";
    s2El.textContent = "–";
    s1El.className = "qed-parity-link__value";
    s2El.className = "qed-parity-link__value";
    feedback.hidden = true;
    applyBtn.disabled = false;
    checkBtn.disabled = true;
    resetBtn.disabled = true;
  });
})();
</script>

The 3-qubit repetition code protects against bit flips, not phase flips:

| Error | Protected by this code? |
|---|---|
| \(X\) | Yes |
| \(Z\) | No |
| \(Y\) | Only partly — the bit-flip half is fixable, the phase-flip half isn't |

This isn't a flaw in quantum error correction generally — it's a limitation of *this particular code*, which was only ever built to catch bit flips. Codes that catch both exist; we're building toward them.

## Error-Correction Capability

For a code to correct one error, it needs enough redundancy to tell every possible single-error case apart from every other one — including "no error." That's exactly what the syndrome table above does: four distinguishable patterns for four possibilities (none, X₁, X₂, X₃).

!!! info "Preview: code distance"
    You may see this idea again later as **code distance** — for now, it's enough to know that the 3-qubit repetition code has distance 3 and can correct one bit-flip error. We'll develop what "distance" formally means in a later section; this is just a preview of the vocabulary.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:11rem;"><div class="qed-qubit__label">Encode</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:11rem;"><div class="qed-qubit__label">Add structured redundancy</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Physical error occurs</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Measure parity information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Infer error location</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:11rem;"><div class="qed-qubit__label">Apply correction</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:11rem;"><div class="qed-qubit__label">Recover encoded logical state</div></div>
</div>

The repetition code gives us the basic pattern behind all of quantum error correction: **encode → detect → infer → correct**. What changes in later, more powerful codes is *how* the detection step works — but the pattern itself stays the same.

But how do we generalize these parity checks to arbitrary quantum error-correcting codes?

**[Next: Encoding & Syndrome Measurement →](encoding-and-syndrome-measurement.md)**
