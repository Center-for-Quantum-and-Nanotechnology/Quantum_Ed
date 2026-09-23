# Stabilizer Codes

The parity checks from [Repetition Codes](repetition-codes.md) and [Encoding & Syndrome Measurement](encoding-and-syndrome-measurement.md) were built by hand for one specific code. This page generalizes them into **stabilizers** — the mathematical language that describes checks like \(S_1\) and \(S_2\) for essentially any quantum error-correcting code, not just the 3-qubit repetition code.

This isn't a heavy math section. The goal is the mental model and vocabulary you'll need for surface codes later.

## Starting From What You Already Know

<div class="qed-demo">
  <div class="qed-parity-row">
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₁</div></div>
    <div class="qed-parity-link"><span class="qed-parity-link__label">S₁</span></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₂</div></div>
    <div class="qed-parity-link"><span class="qed-parity-link__label">S₂</span></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₃</div></div>
  </div>
</div>

What if we wanted to describe these checks mathematically, in a way that generalizes to much larger codes?

**Stabilizers are operators whose expected measurement outcome characterizes the valid encoded states.**

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Repetition code</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Parity checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Stabilizers</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
</div>

## What Does "Stabilize" Mean?

A stabilizer represents a property that the encoded state satisfies — before any notation, that's all it is.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:11rem;"><div class="qed-qubit__label">Valid encoded state</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div style="display:flex; gap:1rem;">
    <div class="qed-qubit" style="border-color:var(--qed-color-protected);"><div class="qed-qubit__label">Check 1</div><div class="qed-qubit__state">✓</div></div>
    <div class="qed-qubit" style="border-color:var(--qed-color-protected);"><div class="qed-qubit__label">Check 2</div><div class="qed-qubit__state">✓</div></div>
  </div>
</div>

If an error occurs, one or more checks change, and the syndrome changes with them:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:11rem;"><div class="qed-qubit__label">Error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">One or more checks change</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome changes</div></div>
</div>

**The stabilizer doesn't tell us the logical state. It tells us whether the encoded state still satisfies the required constraints.**

## Introducing Pauli Operators

You've already met three of these in [Errors and Noise](errors-and-noise.md):

| Operator | Meaning |
|---|---|
| \(I\) | no error |
| \(X\) | bit-flip type error |
| \(Z\) | phase-flip type error |
| \(Y\) | combined X/Z behavior |

Stabilizers are built from *products* of these operators acting on multiple qubits at once. For example, the two repetition-code checks are:

\[
S_1 = Z_1 Z_2 \qquad S_2 = Z_2 Z_3
\]

You don't need to be able to multiply operators together yet — just recognize that a stabilizer is really a list of one Pauli operator per physical qubit (most of them \(I\), meaning "not involved").

## Main Interactive — Build a Stabilizer

Pick a preset below to see how a stabilizer is assembled from one operator per qubit.

<div class="qed-demo" id="sc-build-demo">
  <div class="qed-syndrome-selector">
    <button type="button" class="qed-button qed-button--secondary sc-preset-btn" data-preset="s1">S₁ = Z₁Z₂</button>
    <button type="button" class="qed-button qed-button--secondary sc-preset-btn" data-preset="s2">S₂ = Z₂Z₃</button>
    <button type="button" class="qed-button qed-button--secondary sc-preset-btn" data-preset="s1s2">S₁·S₂ = Z₁Z₃</button>
  </div>

  <div class="qed-stabilizer-grid">
    <div class="qed-stabilizer-brace" id="sc-brace"><span class="qed-stabilizer-brace__label" id="sc-brace-label">—</span></div>
    <div class="qed-qubit qed-stabilizer-qubit is-identity" id="sc-q1"><div class="qed-qubit__label">q₁</div><div class="qed-qubit__op">I</div></div>
    <div class="qed-qubit qed-stabilizer-qubit is-identity" id="sc-q2"><div class="qed-qubit__label">q₂</div><div class="qed-qubit__op">I</div></div>
    <div class="qed-qubit qed-stabilizer-qubit is-identity" id="sc-q3"><div class="qed-qubit__label">q₃</div><div class="qed-qubit__op">I</div></div>
  </div>

  <p class="qed-encode-demo__hint" id="sc-build-note" aria-live="polite">Select a preset above to see its operator sequence.</p>
</div>

<script>
(function () {
  var demo = document.getElementById("sc-build-demo");
  if (!demo) return;
  var btns = Array.prototype.slice.call(demo.querySelectorAll(".sc-preset-btn"));
  var brace = document.getElementById("sc-brace");
  var braceLabel = document.getElementById("sc-brace-label");
  var note = document.getElementById("sc-build-note");
  var qubits = [1, 2, 3].map(function (n) {
    return {
      chip: document.getElementById("sc-q" + n),
      op: document.getElementById("sc-q" + n).querySelector(".qed-qubit__op"),
    };
  });

  // Reusable stabilizer data model: a stabilizer is just a list of one
  // Pauli operator per physical qubit. See STABILIZERS = {...} below
  // and computeOutcome() further down for the general-purpose version
  // used by the "Find the Changed Stabilizer" interactive.
  var PRESETS = {
    s1: { ops: ["Z", "Z", "I"], label: "S₁ = Z₁Z₂", span: "1 / span 2" },
    s2: { ops: ["I", "Z", "Z"], label: "S₂ = Z₂Z₃", span: "2 / span 2" },
    s1s2: { ops: ["Z", "I", "Z"], label: "S₁·S₂ = Z₁Z₃", span: "1 / span 3" },
  };

  function select(key) {
    var preset = PRESETS[key];
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.preset === key);
    });
    qubits.forEach(function (q, i) {
      var op = preset.ops[i];
      q.op.textContent = op;
      q.chip.classList.toggle("is-identity", op === "I");
    });
    brace.style.gridColumn = preset.span;
    braceLabel.textContent = preset.label;
    var noteExtra = key === "s1s2" ? " Products of stabilizers are also stabilizers — this is S₁ and S₂ combined." : "";
    note.textContent = preset.label + " checks: ✓ +1 → expected for a valid encoded state." + noteExtra;
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(b.dataset.preset);
    });
  });

  select("s1");
})();
</script>

<details class="qed-details" id="explore-the-stabilizer-circuit">
<summary>Explore the stabilizer circuit →</summary>

This shows the currently selected stabilizer above measured with a single ancilla — the same technique from [Encoding & Syndrome Measurement](encoding-and-syndrome-measurement.md#explore-the-circuit), now generalized to whichever qubits that stabilizer actually involves.

<div class="qed-demo" id="sc-circuit-demo">
  <svg class="qed-circuit-svg" viewBox="0 0 360 190" width="360" height="190" role="img" aria-label="Circuit diagram showing CNOT gates from the selected stabilizer's qubits into a single ancilla, followed by measurement.">
    <line class="qed-circuit-wire" x1="50" y1="20" x2="300" y2="20" />
    <line class="qed-circuit-wire" x1="50" y1="60" x2="300" y2="60" />
    <line class="qed-circuit-wire" x1="50" y1="100" x2="300" y2="100" />
    <line class="qed-circuit-wire" x1="50" y1="150" x2="300" y2="150" />

    <text class="qed-circuit-label" x="40" y="24" text-anchor="end">q₁</text>
    <text class="qed-circuit-label" x="40" y="64" text-anchor="end">q₂</text>
    <text class="qed-circuit-label" x="40" y="104" text-anchor="end">q₃</text>
    <text class="qed-circuit-label" x="40" y="154" text-anchor="end">a₁</text>

    <g class="qed-circuit-gate" id="sc-circuit-gate-1">
      <line class="qed-circuit-connector" x1="150" y1="20" x2="150" y2="150" />
      <circle class="qed-circuit-control" cx="150" cy="20" r="5" />
      <circle class="qed-circuit-target" cx="150" cy="150" r="9" />
      <line class="qed-circuit-target-cross" x1="150" y1="141" x2="150" y2="159" />
      <line class="qed-circuit-target-cross" x1="141" y1="150" x2="159" y2="150" />
    </g>

    <g class="qed-circuit-gate" id="sc-circuit-gate-2">
      <line class="qed-circuit-connector" x1="190" y1="60" x2="190" y2="150" />
      <circle class="qed-circuit-control" cx="190" cy="60" r="5" />
      <circle class="qed-circuit-target" cx="190" cy="150" r="9" />
      <line class="qed-circuit-target-cross" x1="190" y1="141" x2="190" y2="159" />
      <line class="qed-circuit-target-cross" x1="181" y1="150" x2="199" y2="150" />
    </g>

    <g class="qed-circuit-gate" id="sc-circuit-gate-3">
      <line class="qed-circuit-connector" x1="230" y1="100" x2="230" y2="150" />
      <circle class="qed-circuit-control" cx="230" cy="100" r="5" />
      <circle class="qed-circuit-target" cx="230" cy="150" r="9" />
      <line class="qed-circuit-target-cross" x1="230" y1="141" x2="230" y2="159" />
      <line class="qed-circuit-target-cross" x1="221" y1="150" x2="239" y2="150" />
    </g>

    <rect class="qed-circuit-measure-box" id="sc-circuit-m" x="265" y="138" width="30" height="24" rx="3" />
    <text class="qed-circuit-measure-outcome" id="sc-circuit-outcome" x="280" y="154">–</text>
  </svg>

  <div class="qed-demo__controls" style="min-width:auto; text-align:center;">
    <button type="button" class="qed-button" id="sc-circuit-run">Run Circuit</button>
  </div>
  <p class="qed-encode-demo__hint" id="sc-circuit-result" aria-live="polite"></p>
</div>

<script>
(function () {
  var runBtn = document.getElementById("sc-circuit-run");
  if (!runBtn) return;
  var gateEls = { 1: document.getElementById("sc-circuit-gate-1"), 2: document.getElementById("sc-circuit-gate-2"), 3: document.getElementById("sc-circuit-gate-3") };
  var gateQubit = { 1: 1, 2: 2, 3: 3 };
  var measureBox = document.getElementById("sc-circuit-m");
  var outcomeEl = document.getElementById("sc-circuit-outcome");
  var resultEl = document.getElementById("sc-circuit-result");

  function currentPresetOps() {
    // Reads the ops currently displayed by the Build-a-Stabilizer
    // widget above, so this circuit always matches that selection.
    return [1, 2, 3].map(function (n) {
      var opEl = document.getElementById("sc-q" + n).querySelector(".qed-qubit__op");
      return opEl.textContent;
    });
  }

  function run() {
    runBtn.disabled = true;
    resultEl.textContent = "";
    measureBox.classList.remove("is-revealed");
    outcomeEl.textContent = "–";

    var ops = currentPresetOps();
    var activeGates = [];
    [1, 2, 3].forEach(function (n) {
      var visible = ops[n - 1] !== "I";
      gateEls[n].style.display = visible ? "" : "none";
      if (visible) activeGates.push(gateEls[n]);
    });

    activeGates.forEach(function (g, i) {
      setTimeout(function () {
        g.classList.add("is-active");
        setTimeout(function () {
          g.classList.remove("is-active");
        }, 500);
      }, i * 200);
    });

    setTimeout(function () {
      // All-zero data qubits (the default, unperturbed encoded state),
      // so every active CNOT contributes 0 — outcome is always 0 here,
      // consistent with "✓ +1 expected for a valid encoded state."
      outcomeEl.textContent = "0";
      measureBox.classList.add("is-revealed");
    }, activeGates.length * 200 + 200);

    setTimeout(function () {
      resultEl.textContent = "Circuit result: ancilla measures 0 → syndrome = +1, the expected outcome for a valid encoded state.";
      runBtn.disabled = false;
    }, activeGates.length * 200 + 600);
  }

  runBtn.addEventListener("click", run);
})();
</script>

</details>

## Interactive — Find the Changed Stabilizer

Start from a valid encoded state (\(S_1 = +1\), \(S_2 = +1\)) and inject a single-qubit error. Watch which stabilizer(s) change.

<div class="qed-demo" id="sc-flip-demo">
  <div class="qed-syndrome-selector">
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="I" data-qubit="0">No error</button>
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="X" data-qubit="1">X₁</button>
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="X" data-qubit="2">X₂</button>
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="X" data-qubit="3">X₃</button>
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="Z" data-qubit="1">Z₁</button>
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="Z" data-qubit="2">Z₂</button>
    <button type="button" class="qed-button qed-button--secondary sc-flip-btn" data-op="Z" data-qubit="3">Z₃</button>
  </div>

  <div class="qed-parity-row">
    <div class="qed-qubit qed-qubit--physical" id="sc-flip-q1"><div class="qed-qubit__label">q₁</div><div class="qed-qubit__state">I</div></div>
    <div class="qed-qubit qed-qubit--physical" id="sc-flip-q2"><div class="qed-qubit__label">q₂</div><div class="qed-qubit__state">I</div></div>
    <div class="qed-qubit qed-qubit--physical" id="sc-flip-q3"><div class="qed-qubit__label">q₃</div><div class="qed-qubit__state">I</div></div>
  </div>

  <div class="qed-syndrome-selector">
    <div class="qed-syndrome-badge" id="sc-flip-s1-badge">
      <span class="qed-syndrome-badge__label">S₁</span>
      <span class="qed-syndrome-badge__symbol" id="sc-flip-s1-symbol">✓</span>
      <span class="qed-syndrome-badge__value" id="sc-flip-s1-value">(+1)</span>
    </div>
    <div class="qed-syndrome-badge" id="sc-flip-s2-badge">
      <span class="qed-syndrome-badge__label">S₂</span>
      <span class="qed-syndrome-badge__symbol" id="sc-flip-s2-symbol">✓</span>
      <span class="qed-syndrome-badge__value" id="sc-flip-s2-value">(+1)</span>
    </div>
  </div>

  <p class="qed-encode-demo__hint" id="sc-flip-note" aria-live="polite">No error — both stabilizers are satisfied.</p>
</div>

<script>
(function () {
  var demo = document.getElementById("sc-flip-demo");
  if (!demo) return;
  var btns = Array.prototype.slice.call(demo.querySelectorAll(".sc-flip-btn"));
  var qubitEls = [1, 2, 3].map(function (n) {
    return { chip: document.getElementById("sc-flip-q" + n), state: document.getElementById("sc-flip-q" + n).querySelector(".qed-qubit__state") };
  });
  var badges = {
    S1: { el: document.getElementById("sc-flip-s1-badge"), symbol: document.getElementById("sc-flip-s1-symbol"), value: document.getElementById("sc-flip-s1-value"), ops: ["Z", "Z", "I"] },
    S2: { el: document.getElementById("sc-flip-s2-badge"), symbol: document.getElementById("sc-flip-s2-symbol"), value: document.getElementById("sc-flip-s2-value"), ops: ["I", "Z", "Z"] },
  };
  var note = document.getElementById("sc-flip-note");

  // General-purpose Pauli commutation model, reusable for any stabilizer
  // (not just this 3-qubit example): two single-qubit Pauli operators
  // anticommute if they're different and neither is I. A multi-qubit
  // stabilizer flips sign when it anticommutes with an ERROR at an odd
  // number of qubit positions.
  function anticommuteLocal(a, b) {
    if (a === "I" || b === "I") return false;
    return a !== b;
  }

  function computeOutcome(stabilizerOps, errorOps) {
    var flips = 0;
    for (var i = 0; i < stabilizerOps.length; i++) {
      if (anticommuteLocal(stabilizerOps[i], errorOps[i])) flips++;
    }
    return flips % 2 === 0 ? 1 : -1;
  }

  function applyError(op, qubitIndex) {
    var errorOps = ["I", "I", "I"];
    if (qubitIndex > 0) errorOps[qubitIndex - 1] = op;

    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.op === op && parseInt(b.dataset.qubit, 10) === qubitIndex);
    });
    qubitEls.forEach(function (q, i) {
      var e = errorOps[i];
      q.state.textContent = e === "I" ? "0" : e;
      q.chip.classList.toggle("qed-qubit--error", e !== "I");
    });

    // "Violated" is always relative to the true baseline of a valid
    // encoded state (every stabilizer outcome +1) — each button press
    // applies a single fresh error to that baseline, not a delta from
    // whatever the previous button showed.
    var changedLabels = [];
    Object.keys(badges).forEach(function (key) {
      var badge = badges[key];
      var outcome = computeOutcome(badge.ops, errorOps);
      var violated = outcome === -1;
      badge.symbol.textContent = outcome === 1 ? "✓" : "✗";
      badge.value.textContent = outcome === 1 ? "(+1)" : "(−1)";
      badge.el.classList.remove("qed-just-changed");
      if (violated) {
        void badge.el.offsetWidth; // restart animation
        badge.el.classList.add("qed-just-changed");
        changedLabels.push(key);
      }
    });

    if (qubitIndex === 0) {
      note.textContent = "No error — both stabilizers are satisfied.";
    } else if (changedLabels.length === 0) {
      note.textContent = op + qubitIndex + " doesn't anticommute with S₁ or S₂ at any position, so neither check changes.";
    } else {
      note.textContent = op + qubitIndex + " anticommutes with " + changedLabels.join(" and ") + " — that check flips from +1 to −1.";
    }
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      applyError(b.dataset.op, parseInt(b.dataset.qubit, 10));
    });
  });

  applyError("I", 0);
})();
</script>

??? note "The formal picture: anticommutation"
    An error and a stabilizer either **commute** (the check is unaffected) or **anticommute** (the check flips sign). Two single-qubit Pauli operators anticommute exactly when they're different and neither is \(I\) — for example, \(X\) and \(Z\) anticommute, but \(X\) and \(X\) commute. For a multi-qubit stabilizer, the check flips when the error anticommutes with an *odd* number of the stabilizer's per-qubit operators. That's the rule the interactive above is computing.

This gives you the physical error → syndrome connection in full generality:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:12rem;"><div class="qed-qubit__label">Physical error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Anticommutes with some stabilizers</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Those stabilizers change sign</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
</div>

## Stabilizer vs. Logical Operator

These sound similar but do opposite jobs:

<div class="qed-compare-row">
  <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
    <div class="qed-qubit" style="min-width:10rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Stabilizer</div></div>
    <div class="qed-encode-demo__arrow">↓</div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Defines the encoded code space</div></div>
    <div class="qed-encode-demo__arrow">↓</div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Detects errors</div></div>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
    <div class="qed-qubit qed-qubit--logical" style="min-width:10rem;"><div class="qed-qubit__label">Logical operator</div></div>
    <div class="qed-encode-demo__arrow">↓</div>
    <div class="qed-qubit qed-qubit--logical" style="min-width:10rem;"><div class="qed-qubit__label">Acts within the encoded space</div></div>
    <div class="qed-encode-demo__arrow">↓</div>
    <div class="qed-qubit qed-qubit--logical" style="min-width:10rem;"><div class="qed-qubit__label">Changes the logical information</div></div>
  </div>
</div>

- A **stabilizer** asks: *"Does the state still satisfy the code's constraints?"*
- A **logical operator** asks nothing — it *changes* the encoded logical state.

We generally do **not** want syndrome measurements to reveal the logical information being protected — that's the whole point of the measurement caveat from [Encoding & Syndrome Measurement](encoding-and-syndrome-measurement.md). Stabilizers are designed to commute with the logical operators, so measuring them never touches the encoded information itself.

## Number of Qubits and Code Space

A system of \(n\) physical qubits has a large space of possible states. Stabilizer constraints restrict that space down to a much smaller **code space**, where the logical information actually lives:

<div class="qed-nested-box">
  <div class="qed-nested-box__label">All possible states</div>
  <div class="qed-nested-box__inner">Code space</div>
</div>

!!! info "Preview: [[n, k, d]] notation"
    You may see a stabilizer code written as \([[n, k, d]]\) — meaning \(n\) physical qubits encode \(k\) logical qubits with code distance \(d\). The 3-qubit repetition code, for what it protects against, is a \([[3, 1, 3]]\) code. We won't derive this yet; it's vocabulary that becomes useful once you're comparing codes.

## From One Code to a Family of Codes

Stabilizers aren't specific to the 3-qubit repetition code — they're a common language for describing many different QEC codes:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Stabilizer formalism</div></div>
  <div class="qed-stabilizer-brace" style="grid-column:unset; width:16rem; margin-top:0.4rem;"></div>
  <div style="display:flex; gap:1rem; flex-wrap:wrap; justify-content:center;">
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">CSS codes</div></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">Surface codes</div></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">Other stabilizer codes</div></div>
  </div>
</div>

Different codes choose different sets of stabilizers — arranged differently, acting on different numbers of qubits — but they all share this same underlying structure. That's what makes stabilizers such a useful common language, and it's exactly what prepares you for [Surface Codes](surface-codes.md), where stabilizers get arranged on a two-dimensional lattice.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Physical qubits</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:12rem;"><div class="qed-qubit__label">Encoded code space</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Stabilizer checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:12rem;"><div class="qed-qubit__label">Error changes some checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Information about the error</div></div>
</div>

**Stabilizers define the constraints of the code; syndrome measurements tell us which of those constraints have been violated.**

We now know how to build the checks (stabilizers) and read their outcomes (syndrome) for essentially any code. But knowing *that* something's wrong isn't the same as knowing *what to do about it* — given a syndrome, how do we decide which correction to apply?

**[Next: Decoding →](decoding.md)**
