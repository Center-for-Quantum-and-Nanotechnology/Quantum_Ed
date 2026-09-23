# Errors and Noise

Real quantum systems are never perfectly isolated. They interact — however weakly — with their environment, and hardware itself is imperfect. Those interactions are **noise**, and when noise actually changes the quantum information stored in a qubit, that change is an **error**.

<div class="qed-demo qed-noise-flow">
  <div class="qed-qubit qed-qubit--logical" style="min-width:7rem;"><div class="qed-qubit__label">Ideal Qubit</div></div>
  <div class="qed-noise-flow__arrow">↓ noise</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:7rem;"><div class="qed-qubit__label">?</div></div>
</div>

- **Noise** — an unwanted physical process (stray fields, thermal fluctuations, imperfect control pulses, coupling to the environment).
- **Error** — the resulting unwanted change to the quantum information itself.

Not every instance of noise produces a detectable error, and no one has to "apply" anything on purpose — a physical qubit can pick up an error simply by sitting there, or partway through an otherwise-correct operation. This page stays conceptual: we're not modeling any particular hardware's noise yet, just the *language* for talking about what can go wrong.

## Bit-Flip Error (X)

The easiest error to picture is a **bit flip**, written \(X\): it swaps \(|0\rangle\) and \(|1\rangle\).

\[
X|0\rangle = |1\rangle \qquad X|1\rangle = |0\rangle
\]

<div class="qed-demo" id="bitflip-demo">
  <div class="qed-demo__layout" style="justify-content:center;">
    <div class="qed-qubit qed-qubit--logical" id="bitflip-qubit" style="min-width:6rem;">
      <div class="qed-qubit__label" id="bitflip-state">|0⟩</div>
    </div>
    <div class="qed-demo__controls" style="flex:0 0 auto; min-width:auto; text-align:center;">
      <button type="button" class="qed-button" id="bitflip-btn">Apply X</button>
      <p class="qed-encode-demo__hint">Flip the qubit and watch its value swap.</p>
    </div>
  </div>
</div>

<script>
(function () {
  var btn = document.getElementById("bitflip-btn");
  if (!btn) return;
  var stateEl = document.getElementById("bitflip-state");
  var qubitEl = document.getElementById("bitflip-qubit");
  var value = 0;

  btn.addEventListener("click", function () {
    value = value === 0 ? 1 : 0;
    stateEl.textContent = value === 0 ? "|0⟩" : "|1⟩";
    qubitEl.classList.add("qed-qubit--error");
    setTimeout(function () {
      qubitEl.classList.remove("qed-qubit--error");
    }, 300);
  });
})();
</script>

A bit flip changes *what you'd measure* — the value itself swaps.

## Phase-Flip Error (Z)

The less intuitive error is a **phase flip**, written \(Z\):

\[
Z|0\rangle = |0\rangle \qquad Z|1\rangle = -|1\rangle
\]

A phase flip does **not** necessarily change what you'd measure in the computational basis — it changes the *relative phase* between \(|0\rangle\) and \(|1\rangle\) in a superposition. That's invisible if you're only looking at "is it 0 or 1?", so it's easiest to see on the Bloch sphere, where phase shows up as a rotation *around* the pole axis rather than a jump between poles.

<div class="qed-demo" id="phaseflip-demo">
  <div class="qed-demo__layout" style="justify-content:center;">
    <canvas id="phaseflip-canvas" width="180" height="180"></canvas>
    <div class="qed-demo__controls" style="flex:0 0 auto; min-width:auto; text-align:center;">
      <div class="qed-demo__state" id="phaseflip-state">|ψ⟩ = |+⟩</div>
      <button type="button" class="qed-button" id="phaseflip-btn">Apply Z</button>
      <button type="button" class="qed-button qed-button--secondary" id="phaseflip-reset">Reset</button>
      <p class="qed-encode-demo__hint">Same point on the equator — same measurement odds — different side.</p>
    </div>
  </div>
</div>

<script>
(function () {
  var canvas = document.getElementById("phaseflip-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var stateEl = document.getElementById("phaseflip-state");
  var applyBtn = document.getElementById("phaseflip-btn");
  var resetBtn = document.getElementById("phaseflip-reset");

  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var r = 65;
  var tiltRad = (20 * Math.PI) / 180;
  var thetaRad = Math.PI / 2; // fixed on the equator
  var phi = 0; // 0 = |+>, PI = |->
  var animId = null;

  function project(phiRad) {
    var x = Math.sin(thetaRad) * Math.cos(phiRad);
    var y = Math.sin(thetaRad) * Math.sin(phiRad);
    var z = Math.cos(thetaRad);
    var py = y * Math.cos(tiltRad) - z * Math.sin(tiltRad);
    var pz = y * Math.sin(tiltRad) + z * Math.cos(tiltRad);
    return { x: cx + x * r, y: cy - pz * r };
  }

  function draw(phiRad) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#8888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * Math.sin(tiltRad), 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#888";
    ctx.font = "11px sans-serif";
    ctx.fillText("|0⟩", cx - 7, cy - r - 6);
    ctx.fillText("|1⟩", cx - 7, cy + r + 15);

    var tip = project(phiRad);
    ctx.strokeStyle = "#5c6bc0";
    ctx.fillStyle = "#5c6bc0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function animateTo(target) {
    if (animId) cancelAnimationFrame(animId);
    var start = phi;
    var startTime = null;
    var duration = 450;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var t = Math.min((timestamp - startTime) / duration, 1);
      var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      var current = start + (target - start) * eased;
      draw(current);
      if (t < 1) {
        animId = requestAnimationFrame(step);
      } else {
        phi = target;
        animId = null;
      }
    }
    animId = requestAnimationFrame(step);
  }

  applyBtn.addEventListener("click", function () {
    var target = phi === 0 ? Math.PI : 0;
    stateEl.textContent = target === 0 ? "|ψ⟩ = |+⟩" : "|ψ⟩ = |−⟩";
    animateTo(target);
  });

  resetBtn.addEventListener("click", function () {
    stateEl.textContent = "|ψ⟩ = |+⟩";
    animateTo(0);
  });

  draw(phi);
})();
</script>

??? note "Why is this an error if the measurement still gives 0 or 1?"
    Phase doesn't show up in a single computational-basis measurement — but it controls how quantum states *interfere* in later steps of a computation. An algorithm that relies on interference to amplify the right answer can be silently thrown off by a phase flip, even though no individual measurement would look wrong at the time it happened.

## Y Error — Combining the Two

The third Pauli error, \(Y\), combines both behaviors:

\[
Y = iXZ
\]

You don't need to work through that algebra to get the idea:

| Error | Effect |
|---|---|
| \(X\) | bit flip |
| \(Z\) | phase flip |
| \(Y\) | bit flip **and** phase flip |

## Which Operation Was Applied?

Given a starting state, one of \(X\), \(Z\), or \(Y\) is simulated at random. This lets you practice recognizing each error's signature in a controlled setting where the outcome is shown to you for learning purposes.

!!! warning "Important"
    This visualization lets you see the simulated effect of an error. In a real quantum system, you cannot simply measure an unknown qubit to reveal which error occurred without potentially disturbing the quantum information.

- Measuring a qubit in the computational basis can reveal information about its state.
- It does not directly reveal an arbitrary \(X\), \(Z\), or \(Y\) error.
- Directly measuring the encoded quantum information can destroy the information we are trying to protect.
- Quantum error correction instead uses carefully chosen syndrome measurements to obtain information about errors without directly measuring the logical state.

Below, "value" and "phase" are simulated readouts for the purpose of this exercise — a bit flip changes the value, a phase flip changes the phase, and \(Y\) changes both.

<div class="qed-demo" id="identify-demo">
  <p><strong>Initial state:</strong></p>
  <div class="qed-error-demo__readout">
    <span class="qed-pill"><span class="qed-pill__label">Value</span> 0</span>
    <span class="qed-pill"><span class="qed-pill__label">Phase</span> +</span>
  </div>

  <p><strong>Simulated result:</strong></p>
  <div class="qed-error-demo__readout" id="identify-result">
    <span class="qed-pill"><span class="qed-pill__label">Value</span> <span id="identify-value">?</span></span>
    <span class="qed-pill"><span class="qed-pill__label">Phase</span> <span id="identify-phase">?</span></span>
  </div>

  <div class="qed-demo__controls" style="min-width:auto;">
    <button type="button" class="qed-button" id="identify-generate">Simulate a New Error</button>
    <button type="button" class="qed-button qed-button--secondary" id="identify-x" disabled>Guess X</button>
    <button type="button" class="qed-button qed-button--secondary" id="identify-z" disabled>Guess Z</button>
    <button type="button" class="qed-button qed-button--secondary" id="identify-y" disabled>Guess Y</button>
  </div>

  <div class="qed-error-demo__feedback" id="identify-feedback" hidden></div>
</div>

<script>
(function () {
  var generateBtn = document.getElementById("identify-generate");
  if (!generateBtn) return;
  var guessButtons = {
    X: document.getElementById("identify-x"),
    Z: document.getElementById("identify-z"),
    Y: document.getElementById("identify-y"),
  };
  var valueEl = document.getElementById("identify-value");
  var phaseEl = document.getElementById("identify-phase");
  var feedback = document.getElementById("identify-feedback");

  var GATES = ["X", "Z", "Y"];
  var EXPLANATIONS = {
    X: "X is a bit flip: the value changed (0 → 1) but the phase stayed the same.",
    Z: "Z is a phase flip: the value stayed the same but the phase changed (+ → −).",
    Y: "Y combines both: the value flipped and the phase flipped.",
  };
  var current = null;

  function applyGate(gate) {
    // Mirrors the value/phase model introduced above: X flips value,
    // Z flips phase, Y flips both. Reusable for later demos that need
    // a quick conceptual (non-algebraic) Pauli error model.
    var value = gate === "X" || gate === "Y" ? 1 : 0;
    var phase = gate === "Z" || gate === "Y" ? "−" : "+";
    return { value: value, phase: phase };
  }

  function newRound() {
    current = GATES[Math.floor(Math.random() * GATES.length)];
    var result = applyGate(current);
    valueEl.textContent = result.value;
    phaseEl.textContent = result.phase;
    feedback.hidden = true;
    feedback.className = "qed-error-demo__feedback";
    Object.keys(guessButtons).forEach(function (g) {
      guessButtons[g].disabled = false;
    });
  }

  function guess(gate) {
    var correct = gate === current;
    feedback.hidden = false;
    feedback.textContent = (correct ? "Correct! " : "Not quite — this was " + current + ". ") + EXPLANATIONS[current];
    feedback.className =
      "qed-error-demo__feedback " + (correct ? "qed-error-demo__feedback--correct" : "qed-error-demo__feedback--incorrect");
    Object.keys(guessButtons).forEach(function (g) {
      guessButtons[g].disabled = true;
    });
  }

  generateBtn.addEventListener("click", newRound);
  Object.keys(guessButtons).forEach(function (g) {
    guessButtons[g].addEventListener("click", function () {
      guess(g);
    });
  });
})();
</script>

## Connecting Back to the 3-Qubit Example

Remember the repetition-code example from [Physical vs Logical Qubits](physical-vs-logical-qubits.md)?

\[
|0\rangle_L \rightarrow |000\rangle \qquad |1\rangle_L \rightarrow |111\rangle
\]

What happens if one physical qubit experiences an \(X\) error? Something like:

\[
|000\rangle \rightarrow |010\rangle
\]

The middle qubit disagrees with the other two — a pattern we could, in principle, use to catch and undo the error. But what about a \(Z\) error?

A phase flip on one of the three physical qubits doesn't change any of their measured values — `|000⟩` still measures as `000`. The mismatch the repetition code relies on for bit flips simply isn't there for phase flips.

!!! warning
    The simple 3-qubit repetition code you saw earlier protects against bit flips, but **not** phase flips. Handling both is exactly what [Repetition Codes](repetition-codes.md) picks up next.

## Going Deeper

??? note "Beyond X, Y, and Z"
    Real physical noise is rarely a neat, discrete \(X\), \(Y\), or \(Z\) operation — that's a simplification that happens to be extremely useful. Any single-qubit error can be written as a combination of the four Pauli operators \(I\), \(X\), \(Y\), and \(Z\) (where \(I\) means "no error"), which is what makes X/Y/Z-based error correction so broadly effective even though real noise is messier.

    Some of the physical processes that produce these errors have names you may come across later: **decoherence**, **relaxation**, and **dephasing**. We won't build a detailed hardware-noise taxonomy here — that's revisited in [Hardware-Aware QEC](hardware-aware-qec.md).

## Takeaway

Quantum errors can affect both the *value* and the *phase* of quantum information — not just the simple "flip a bit" errors classical error correction deals with. A useful QEC scheme has to protect against more than ordinary bit flips.

We know what can go wrong. Now let's see how encoding can help us detect and correct some of these errors.

**[Next: Repetition Codes →](repetition-codes.md)**
