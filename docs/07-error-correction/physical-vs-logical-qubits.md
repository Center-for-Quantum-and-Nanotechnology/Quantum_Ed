# Physical vs Logical Qubits

Real quantum hardware is noisy. To build something that computes reliably on top of noisy hardware, quantum error correction (QEC) draws a distinction between two kinds of qubit: the ones that physically exist on a chip, and the ones a program actually computes with.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:8rem;">
    <div class="qed-qubit__label">Logical Qubit</div>
    <div class="qed-qubit__state">|ψ⟩</div>
  </div>
  <div class="qed-encode-demo__arrow"><span>encoding</span><span aria-hidden="true">↓</span></div>
  <div style="display:flex; gap:0.6rem;">
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₁</div></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₂</div></div>
    <div class="qed-qubit qed-qubit--physical"><div class="qed-qubit__label">q₃</div></div>
  </div>
  <div style="font-size:0.7rem; color:var(--md-default-fg-color--light);">PHYSICAL QUBITS</div>
</div>

No equations needed yet — just two ideas: a logical qubit is what you *mean* to compute with, and it gets spread out ("encoded") across several physical qubits so that no single hardware failure can destroy it.

## Physical Qubits

A <abbr title="A single quantum two-level system implemented directly in hardware — e.g. a superconducting circuit, a trapped ion, or a neutral atom.">physical qubit</abbr> is an actual quantum system implemented in hardware — a real, physical object that can hold a quantum state. The details vary by platform (superconducting circuits, trapped ions, neutral atoms, photons, and others each implement a physical qubit differently), but every platform shares the same problem: physical qubits are imperfect. They interact weakly with their environment, and that interaction introduces <abbr title="An unwanted change to a qubit's state caused by imperfect hardware or environmental interference.">errors</abbr> — small, essentially random corruptions of the state over time.

A single physical qubit, on its own, has no way to protect itself from this.

## Logical Qubits

A <abbr title="An encoded unit of quantum information, distributed across multiple physical qubits, that a program actually computes with.">logical qubit</abbr> is the qubit a program actually computes with. Instead of trusting one fragile physical qubit, QEC represents the logical qubit's state as a pattern spread across *several* physical qubits — an <abbr title="Spreading one qubit's quantum information across several physical qubits in a specific correlated pattern, so that a single-qubit error can be detected and undone.">encoding</abbr>.

This is the central idea of the whole module: **a logical qubit is not a physical object — it's a pattern distributed across physical objects.**

??? note "Encoding ≠ cloning"
    It might sound like encoding "copies" the logical qubit onto three physical qubits. It doesn't. The no-cloning theorem means there's no way to make independent copies of an arbitrary unknown quantum state. Encoding instead *distributes* the one state across multiple physical qubits in a correlated way — the information only exists in how they relate to each other, not as three separate copies.

## Interactive Demo — Encode a Logical Qubit

Try it yourself with a simplified 3-qubit example. This is a teaching example, not a general recipe — most real logical qubits use far more than three physical qubits, and this simple version can only protect against one specific kind of error.

<div class="qed-demo qed-encode-demo" id="encode-demo">
  <div class="qed-encode-demo__stage">
    <div class="qed-qubit qed-qubit--logical" id="logical-qubit" style="min-width:9rem;">
      <div class="qed-qubit__label">Logical Qubit</div>
      <div class="qed-qubit__state" id="logical-state">α|0⟩ + β|1⟩</div>
    </div>

    <div class="qed-encode-demo__arrow">
      <span>encoding</span>
      <span aria-hidden="true">↓</span>
    </div>

    <div class="qed-encode-demo__physical-row" id="physical-row">
      <button type="button" class="qed-qubit qed-qubit--physical" id="qubit-1" data-qubit="1" disabled aria-label="Physical qubit 1 — click to inject a bit-flip error">
        <div class="qed-qubit__label">q₁</div>
        <div class="qed-qubit__state" id="qubit-1-state">0</div>
      </button>
      <button type="button" class="qed-qubit qed-qubit--physical" id="qubit-2" data-qubit="2" disabled aria-label="Physical qubit 2 — click to inject a bit-flip error">
        <div class="qed-qubit__label">q₂</div>
        <div class="qed-qubit__state" id="qubit-2-state">0</div>
      </button>
      <button type="button" class="qed-qubit qed-qubit--physical" id="qubit-3" data-qubit="3" disabled aria-label="Physical qubit 3 — click to inject a bit-flip error">
        <div class="qed-qubit__label">q₃</div>
        <div class="qed-qubit__state" id="qubit-3-state">0</div>
      </button>
    </div>
  </div>

  <div class="qed-encode-demo__controls">
    <button type="button" class="qed-button" id="encode-btn">Encode</button>
    <button type="button" class="qed-button qed-button--secondary" id="reset-btn" disabled>Reset</button>
    <p class="qed-encode-demo__hint" id="encode-hint" aria-live="polite">
      Click <strong>Encode</strong> to distribute the logical state across three physical qubits.
    </p>
  </div>

  <div class="qed-encode-demo__prompt" id="encode-prompt" hidden>
    <strong>?</strong> An error has occurred on a physical qubit. How can we detect which qubit was affected
    <em>without directly measuring the logical state?</em>
  </div>
</div>

<script>
(function () {
  var demo = document.getElementById("encode-demo");
  if (!demo) return;

  var logicalState = document.getElementById("logical-state");
  var physicalRow = document.getElementById("physical-row");
  var encodeBtn = document.getElementById("encode-btn");
  var resetBtn = document.getElementById("reset-btn");
  var hint = document.getElementById("encode-hint");
  var prompt = document.getElementById("encode-prompt");
  var qubits = [1, 2, 3].map(function (n) {
    return {
      button: document.getElementById("qubit-" + n),
      state: document.getElementById("qubit-" + n + "-state"),
    };
  });

  var INITIAL_STATE = "α|0⟩ + β|1⟩";
  var ENCODED_STATE = "α|000⟩ + β|111⟩";

  function clearErrors() {
    qubits.forEach(function (q) {
      q.button.classList.remove("qed-qubit--error");
      q.state.textContent = "0";
    });
  }

  function setEncoded(encoded) {
    if (encoded) {
      logicalState.textContent = ENCODED_STATE;
      physicalRow.classList.add("is-visible");
      qubits.forEach(function (q) {
        q.button.disabled = false;
      });
      encodeBtn.disabled = true;
      resetBtn.disabled = false;
      hint.textContent = "Click a physical qubit below to simulate a bit-flip error on it.";
    } else {
      logicalState.textContent = INITIAL_STATE;
      physicalRow.classList.remove("is-visible");
      clearErrors();
      qubits.forEach(function (q) {
        q.button.disabled = true;
      });
      encodeBtn.disabled = false;
      resetBtn.disabled = true;
      hint.textContent = "Click Encode to distribute the logical state across three physical qubits.";
      prompt.hidden = true;
    }
  }

  function injectError(qubitIndex) {
    clearErrors();
    var q = qubits[qubitIndex - 1];
    q.button.classList.add("qed-qubit--error");
    q.state.textContent = "flipped";
    hint.textContent =
      "A bit-flip error was injected on q" + qubitIndex + ". The physical state changed — try another qubit, or reset.";
    prompt.hidden = false;
  }

  encodeBtn.addEventListener("click", function () {
    setEncoded(true);
  });

  resetBtn.addEventListener("click", function () {
    setEncoded(false);
  });

  qubits.forEach(function (q, i) {
    q.button.addEventListener("click", function () {
      injectError(i + 1);
    });
  });

  setEncoded(false);
})();
</script>

Notice that the logical box's state changed from `α|0⟩ + β|1⟩` to `α|000⟩ + β|111⟩` the moment you hit **Encode** — that's the encoding. And when you injected an error, only *one* physical qubit changed; the logical information is still represented by the correlated pattern across all three. Detecting *which* qubit flipped — without collapsing that pattern by measuring it directly — is exactly the problem the next section, [Encoding & Syndrome Measurement](encoding-and-syndrome-measurement.md), solves.

!!! warning
    This is a simplified example. The 3-qubit repetition code can protect against certain errors, but not all types of quantum errors. We'll examine exactly what it can and cannot correct in [Repetition Codes](repetition-codes.md).

## Physical vs Logical, Side by Side

<div class="qed-comparison-table" markdown>

| Physical Qubit | Logical Qubit |
|---|---|
| Hardware-level qubit | Encoded quantum information |
| Subject to physical noise | Can be protected using QEC |
| An individual quantum system | Distributed across multiple physical qubits |
| A building block | A fault-tolerant computational unit |

</div>

## Takeaway

- Physical qubits are the hardware.
- Logical qubits are encoded quantum information.
- Quantum error correction uses multiple physical qubits to protect logical information from errors.

If one physical qubit can fail, how can multiple physical qubits help us figure out what went wrong?

**[Next: Errors and Noise →](errors-and-noise.md)**
