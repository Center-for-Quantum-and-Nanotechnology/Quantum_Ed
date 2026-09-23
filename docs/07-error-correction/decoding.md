# Decoding

[Stabilizer Codes](stabilizer-codes.md) left off with a syndrome in hand and a question: knowing *that* something's wrong isn't the same as knowing *what to do about it*. That's the decoder's job.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:11rem;"><div class="qed-qubit__label">Physical error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome measurement</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
</div>

We have a syndrome. Now what?

**A decoder takes the measured syndrome and infers which error pattern most likely occurred.**

<div class="qed-compare-row">
  <div class="qed-qubit" style="border-color:var(--qed-color-syndrome);">
    <div class="qed-qubit__label">SYNDROME</div>
    <div class="qed-qubit__state">"What evidence do we have?"</div>
  </div>
  <span aria-hidden="true">→ decoder →</span>
  <div class="qed-qubit qed-qubit--error">
    <div class="qed-qubit__label">INFERRED ERROR</div>
    <div class="qed-qubit__state">"What most likely happened?"</div>
  </div>
  <span aria-hidden="true">→</span>
  <div class="qed-qubit qed-qubit--protected">
    <div class="qed-qubit__label">CORRECTION</div>
    <div class="qed-qubit__state">"What should we apply?"</div>
  </div>
</div>

## Main Interactive — Decode the Syndrome

Set up a scenario, measure the syndrome, then run the decoder and watch all four stages fill in.

<div class="qed-demo" id="dc-demo">
  <div class="qed-syndrome-selector">
    <button type="button" class="qed-button qed-button--secondary dc-scenario-btn" data-error="none">No error</button>
    <button type="button" class="qed-button qed-button--secondary dc-scenario-btn" data-error="1">X₁</button>
    <button type="button" class="qed-button qed-button--secondary dc-scenario-btn" data-error="2">X₂</button>
    <button type="button" class="qed-button qed-button--secondary dc-scenario-btn" data-error="3">X₃</button>
  </div>

  <div class="qed-parity-row">
    <div class="qed-qubit qed-qubit--physical" id="dc-q1"><div class="qed-qubit__label">q₁</div><div class="qed-qubit__state">0</div></div>
    <div class="qed-qubit qed-qubit--physical" id="dc-q2"><div class="qed-qubit__label">q₂</div><div class="qed-qubit__state">0</div></div>
    <div class="qed-qubit qed-qubit--physical" id="dc-q3"><div class="qed-qubit__label">q₃</div><div class="qed-qubit__state">0</div></div>
  </div>

  <div class="qed-demo__controls" style="min-width:auto; text-align:center;">
    <button type="button" class="qed-button" id="dc-measure-btn" disabled>Measure Syndrome</button>
    <button type="button" class="qed-button" id="dc-decode-btn" disabled>Run Decoder</button>
    <button type="button" class="qed-button qed-button--secondary" id="dc-reset-btn" disabled>Reset</button>
  </div>

  <div class="qed-compare-row" style="margin-top:1rem;">
    <div class="qed-flow-step qed-flow-step--syndrome">
      <span class="qed-flow-step__label">Syndrome</span>
      <span id="dc-stage-syndrome">–</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step" id="dc-stage-decoder-box">
      <span class="qed-flow-step__label">Decoder</span>
      <span id="dc-stage-decoder">–</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--error">
      <span class="qed-flow-step__label">Inferred error</span>
      <span id="dc-stage-inferred">–</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference">
      <span class="qed-flow-step__label">Correction</span>
      <span id="dc-stage-correction">–</span>
    </div>
  </div>

  <p class="qed-encode-demo__hint" id="dc-reasoning" aria-live="polite"></p>
</div>

<script>
(function () {
  var demo = document.getElementById("dc-demo");
  if (!demo) return;

  // --- Decoder layer: pure, DOM-free functions -------------------------
  // Kept separate from the UI code below so a future decoder (e.g. a
  // Minimum-Weight Perfect Matching implementation for surface codes)
  // could replace REPETITION_CODE_DECODER without touching any
  // rendering logic — it only needs to accept {s1, s2} and return the
  // same shape of answer.
  var REPETITION_CODE_DECODER = {
    decode: function (syndrome) {
      var key = (syndrome.s1 === 1 ? "+" : "-") + (syndrome.s2 === 1 ? "+" : "-");
      var table = {
        "++": { error: "none", correction: "No correction needed" },
        "-+": { error: "X1", correction: "Apply X to q1" },
        "--": { error: "X2", correction: "Apply X to q2" },
        "+-": { error: "X3", correction: "Apply X to q3" },
      };
      return table[key];
    },
  };

  function computeSyndrome(values) {
    return { s1: values[0] === values[1] ? 1 : -1, s2: values[1] === values[2] ? 1 : -1 };
  }
  // --- end decoder layer -------------------------------------------------

  var scenarioBtns = Array.prototype.slice.call(demo.querySelectorAll(".dc-scenario-btn"));
  var measureBtn = document.getElementById("dc-measure-btn");
  var decodeBtn = document.getElementById("dc-decode-btn");
  var resetBtn = document.getElementById("dc-reset-btn");
  var reasoning = document.getElementById("dc-reasoning");
  var qubits = [1, 2, 3].map(function (n) {
    return { chip: document.getElementById("dc-q" + n), state: document.getElementById("dc-q" + n).querySelector(".qed-qubit__state") };
  });
  var stageSyndrome = document.getElementById("dc-stage-syndrome");
  var stageDecoder = document.getElementById("dc-stage-decoder");
  var stageInferred = document.getElementById("dc-stage-inferred");
  var stageCorrection = document.getElementById("dc-stage-correction");

  var currentError = null;
  var currentSyndrome = null;

  function clearStages() {
    stageSyndrome.textContent = "–";
    stageDecoder.textContent = "–";
    stageInferred.textContent = "–";
    stageCorrection.textContent = "–";
    reasoning.textContent = "";
  }

  function selectScenario(errorLabel) {
    currentError = errorLabel;
    var values = [0, 0, 0];
    if (errorLabel !== "none") values[parseInt(errorLabel, 10) - 1] = 1;
    qubits.forEach(function (q, i) {
      q.state.textContent = values[i];
      q.chip.classList.toggle("qed-qubit--error", values[i] === 1);
    });
    scenarioBtns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.error === errorLabel);
    });
    measureBtn.disabled = false;
    resetBtn.disabled = false;
    decodeBtn.disabled = true;
    clearStages();
  }

  function measure() {
    var values = qubits.map(function (q) {
      return parseInt(q.state.textContent, 10);
    });
    currentSyndrome = computeSyndrome(values);
    stageSyndrome.textContent = "(" + (currentSyndrome.s1 === 1 ? "+1" : "−1") + ", " + (currentSyndrome.s2 === 1 ? "+1" : "−1") + ")";
    decodeBtn.disabled = false;
    reasoning.textContent = "Syndrome measured. This is evidence about the error — not the error itself. Click Run Decoder to infer what most likely happened.";
  }

  function runDecoder() {
    decodeBtn.disabled = true;
    stageDecoder.textContent = "running…";

    setTimeout(function () {
      var result = REPETITION_CODE_DECODER.decode(currentSyndrome);
      stageDecoder.textContent = "lookup table";
      stageInferred.textContent = result.error === "none" ? "No error" : result.error;
      stageCorrection.textContent = result.correction;

      // For this widget's single-or-no-error scenarios the syndrome
      // always pins the error down exactly, so the decoder's inference
      // will always match what you set up above. That's deliberate —
      // it isolates the mechanics of the pipeline first. The next
      // section shows a case where the decoder's best guess and the
      // true error genuinely diverge.
      reasoning.textContent =
        "Syndrome " + stageSyndrome.textContent + " → consistent with " + (result.error === "none" ? "no error" : result.error) + " → " + result.correction +
        ". The decoder only ever sees the syndrome (not which button you clicked) — and for a single-or-no-error scenario like this one, that's always enough to recover the exact error.";
    }, 500);
  }

  function reset() {
    currentError = null;
    currentSyndrome = null;
    qubits.forEach(function (q) {
      q.state.textContent = "0";
      q.chip.classList.remove("qed-qubit--error");
    });
    scenarioBtns.forEach(function (b) {
      b.classList.remove("qed-button--active");
    });
    measureBtn.disabled = true;
    decodeBtn.disabled = true;
    resetBtn.disabled = true;
    clearStages();
  }

  scenarioBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      selectScenario(b.dataset.error);
    });
  });
  measureBtn.addEventListener("click", measure);
  decodeBtn.addEventListener("click", runDecoder);
  resetBtn.addEventListener("click", reset);

  reset();
})();
</script>

Notice the decoder never looked at which button *you* clicked — only at the syndrome. That's the whole point: **syndrome = evidence about the error, not the error itself.**

## Introducing Ambiguity

For this small code, the syndrome happens to pin down the error exactly. That won't always be true. Even here, if we allow *more than one* qubit to have an error at once, something interesting happens:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
  <div class="qed-qubit" style="min-width:10rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome (−1, −1)</div></div>
  <div class="qed-stabilizer-brace" style="grid-column:unset; width:14rem; margin-top:0.4rem;"></div>
  <div style="display:flex; gap:1rem; flex-wrap:wrap; justify-content:center;">
    <div class="qed-qubit qed-qubit--error"><div class="qed-qubit__label">Error A</div><div class="qed-qubit__state">X₂ alone</div></div>
    <div class="qed-qubit qed-qubit--error"><div class="qed-qubit__label">Error B</div><div class="qed-qubit__state">X₁ and X₃</div></div>
  </div>
</div>

Both produce the exact same syndrome: an X error on q₂ flips both checks, but so does flipping q₁ *and* q₃ together — q₁ disagrees with q₂ (flipping \(S_1\)) while q₃ disagrees with q₂ (flipping \(S_2\)), and q₂ itself never changed. Same evidence, two different physical stories.

**The decoder is therefore not simply "reading the answer." It is making an inference.**

## Why the Decoder Needs an Error Model

To choose between competing explanations, a decoder needs some assumption about how errors actually occur. The simplest useful one:

- X error on any given physical qubit: probability \(p\)
- No error on that qubit: probability \(1-p\)

If some error patterns are more likely than others under this assumption, the decoder can use that to prefer one explanation over another.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome + error model</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Decoder</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:11rem;"><div class="qed-qubit__label">Most likely error</div></div>
</div>

This becomes especially important later, in [Hardware-Aware QEC](hardware-aware-qec.md), where the "error model" reflects real properties of physical hardware.

## Interactive — Change the Noise Model

Take the ambiguous syndrome from above: **Error A** (X₂ alone, one qubit) vs. **Error B** (X₁ and X₃, two qubits). Drag the slider to change the assumed per-qubit error probability \(p\) and watch how confident the decoder is in each explanation.

<div class="qed-demo" id="dc-noise-demo">
  <label for="dc-noise-slider" style="display:block; font-size:0.8rem; margin-bottom:0.3rem;">
    Assumed X-error probability per qubit: <strong><span id="dc-noise-value">5</span>%</strong>
  </label>
  <input type="range" id="dc-noise-slider" min="0" max="70" value="5" step="1" style="width:100%;">

  <div class="qed-confidence-row" id="dc-row-a">
    <span class="qed-confidence-row__label">Error A: X₂ alone</span>
    <span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" id="dc-bar-a"></span></span>
    <span class="qed-confidence-row__pct" id="dc-pct-a">95%</span>
  </div>
  <div class="qed-confidence-row" id="dc-row-b">
    <span class="qed-confidence-row__label">Error B: X₁ and X₃</span>
    <span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" id="dc-bar-b"></span></span>
    <span class="qed-confidence-row__pct" id="dc-pct-b">5%</span>
  </div>

  <p class="qed-encode-demo__hint" id="dc-noise-note" aria-live="polite"></p>
</div>

<script>
(function () {
  var slider = document.getElementById("dc-noise-slider");
  if (!slider) return;
  var valueEl = document.getElementById("dc-noise-value");
  var barA = document.getElementById("dc-bar-a");
  var barB = document.getElementById("dc-bar-b");
  var pctA = document.getElementById("dc-pct-a");
  var pctB = document.getElementById("dc-pct-b");
  var rowA = document.getElementById("dc-row-a");
  var rowB = document.getElementById("dc-row-b");
  var note = document.getElementById("dc-noise-note");

  function update() {
    var p = parseInt(slider.value, 10) / 100;
    valueEl.textContent = slider.value;

    // Relative likelihood of a specific weight-1 pattern vs a specific
    // weight-2 pattern under independent per-qubit error probability p,
    // normalized between just these two candidates:
    //   P(weight-1) = p(1-p)^2, P(weight-2) = p^2(1-p)
    //   normalized -> P(weight-1) = 1-p, P(weight-2) = p
    var probA = 1 - p;
    var probB = p;

    barA.style.width = probA * 100 + "%";
    barB.style.width = probB * 100 + "%";
    pctA.textContent = Math.round(probA * 100) + "%";
    pctB.textContent = Math.round(probB * 100) + "%";

    var aLeads = probA >= probB;
    rowA.classList.toggle("is-leading", aLeads);
    rowB.classList.toggle("is-leading", !aLeads);

    if (p <= 0.2) {
      note.textContent = "At realistic hardware error rates (well under 20%), the single-qubit explanation is always favored — lower-weight errors are simply more probable.";
    } else if (aLeads) {
      note.textContent = "Error A is still favored, but the gap is narrowing as the assumed error rate climbs toward an unrealistic 50%.";
    } else {
      note.textContent = "Past p = 50%, Error B (the two-qubit explanation) becomes more likely than Error A — the decoder's preferred answer flips. This isn't a realistic regime for real hardware, but it shows the preference genuinely depends on the assumed model, not just the syndrome.";
    }
  }

  slider.addEventListener("input", update);
  update();
})();
</script>

Notice that the *ranking* barely moves across realistic error rates — lower-weight explanations are favored whenever errors are reasonably rare. That preference for "the explanation touching the fewest qubits" is exactly the intuition behind **minimum-weight** decoding, which you'll meet properly in [Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md).

## From Correction to Equivalence

Here's the uncomfortable part: **a syndrome-consistent correction is not automatically a successful one.**

<div class="qed-demo" id="dc-equiv-demo">
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary dc-equiv-btn qed-button--active" data-case="a">If the real error was X₂ alone</button>
    <button type="button" class="qed-button qed-button--secondary dc-equiv-btn" data-case="b">If the real error was X₁ and X₃</button>
  </div>

  <div class="qed-compare-row" style="margin-top:0.8rem;">
    <div class="qed-flow-step qed-flow-step--error">
      <span class="qed-flow-step__label">Actual error</span>
      <span id="dc-equiv-actual">X₂</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--syndrome">
      <span class="qed-flow-step__label">Syndrome</span>
      <span>(−1, −1)</span>
    </div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step">
      <span class="qed-flow-step__label">Decoder chooses</span>
      <span>Apply X to q₂</span>
    </div>
  </div>

  <div class="qed-error-demo__feedback" id="dc-equiv-feedback"></div>
</div>

<script>
(function () {
  var demo = document.getElementById("dc-equiv-demo");
  if (!demo) return;
  var btns = Array.prototype.slice.call(demo.querySelectorAll(".dc-equiv-btn"));
  var actualEl = document.getElementById("dc-equiv-actual");
  var feedback = document.getElementById("dc-equiv-feedback");

  var CASES = {
    a: {
      actual: "X₂",
      text: "The decoder's correction (apply X to q₂) exactly undoes the real error. Physical state returns to |000⟩ — the encoded logical information is preserved.",
      success: true,
    },
    b: {
      actual: "X₁ and X₃",
      text: "The syndrome looks identical, so the decoder still infers \"X₂\" and applies X to q₂ — but the real error was on q₁ and q₃. The net effect is X on all three qubits, which flips |000⟩ to |111⟩: the logical state itself flipped. The correction matched the syndrome perfectly and still failed.",
      success: false,
    },
  };

  function select(key) {
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.case === key);
    });
    var c = CASES[key];
    actualEl.textContent = c.actual;
    feedback.textContent = (c.success ? "✓ Logical information preserved. " : "✗ Logical information NOT preserved. ") + c.text;
    feedback.className = "qed-error-demo__feedback " + (c.success ? "qed-error-demo__feedback--correct" : "qed-error-demo__feedback--incorrect");
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(b.dataset.case);
    });
  });

  select("a");
})();
</script>

What matters isn't recovering the exact microscopic history of the noise — it's whether the chosen correction restores the *logical* information. Sometimes a perfectly syndrome-consistent correction still gets that wrong, precisely because the syndrome didn't uniquely determine the error in the first place.

??? note "Advanced: logical equivalence"
    Formally, two corrections are "equally good" if they differ only by a *stabilizer* (something that doesn't touch the logical information) — but two corrections that differ by a *logical operator* are not equivalent, even if both are consistent with the same syndrome. That's the case B above: the decoder's guess and the true error differ by exactly \(X_1X_2X_3\), which acts as the logical \(X\) operator for this code. This full "logical equivalence class" formalism is beyond what we need here — just know the vocabulary exists.

## The Scaling Problem

For 3 qubits, this is manageable:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">3 physical qubits</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Few possible errors</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:11rem;"><div class="qed-qubit__label">Simple lookup table</div></div>
</div>

But real codes use far more physical qubits — surface codes often use hundreds or thousands. The lookup-table approach doesn't survive that jump:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Many physical qubits</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:13rem;"><div class="qed-qubit__label">Many possible error patterns</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:13rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Many possible syndromes</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:13rem;"><div class="qed-qubit__label">Can't simply inspect every possibility</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:13rem;"><div class="qed-qubit__label">Need efficient decoding algorithms</div></div>
</div>

## From One Decoder to a Family of Decoders

There isn't one universal decoding algorithm — different codes and situations call for different approaches:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
  <div class="qed-qubit" style="min-width:10rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Decoding</div></div>
  <div class="qed-stabilizer-brace" style="grid-column:unset; width:18rem; margin-top:0.4rem;"></div>
  <div style="display:flex; gap:1rem; flex-wrap:wrap; justify-content:center;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">Lookup table</div></div>
      <span style="font-size:0.7rem; color:var(--md-default-fg-color--light);">small codes</span>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">MWPM</div></div>
      <span style="font-size:0.7rem; color:var(--md-default-fg-color--light);">surface codes</span>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">Other decoders</div></div>
      <span style="font-size:0.7rem; color:var(--md-default-fg-color--light);">ML / hardware-aware</span>
    </div>
  </div>
</div>

We'll go deep on **Minimum-Weight Perfect Matching (MWPM)** shortly — it's the standard decoding algorithm for surface codes, and it's really just an efficient, scalable way of doing exactly what "lowest weight wins" was doing by hand above.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:12rem;"><div class="qed-qubit__label">Error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Decoder</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:12rem;"><div class="qed-qubit__label">Likely error / correction</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:12rem;"><div class="qed-qubit__label">Logical information preserved?</div></div>
</div>

**A decoder uses syndrome information and an error model to infer a correction that is likely to preserve the logical information.** Likely — not guaranteed, as the worked example above showed.

For a large surface code, there can be an enormous number of possible error patterns. How can we find a good correction efficiently?

**[Next: Surface Codes →](surface-codes.md)**
