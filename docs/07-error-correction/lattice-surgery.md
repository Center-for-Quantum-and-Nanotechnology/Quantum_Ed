# Lattice Surgery

[Surface Codes](surface-codes.md) showed how a logical qubit can be protected. [Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md) showed how a decoder interprets the evidence a patch collects. Neither one answers a different question: **how do two separately-protected logical qubits interact with each other?**

## From Protecting to Computing

Here are two ordinary surface-code patches, each already capable of protecting a logical qubit on its own:

<div class="qed-demo" id="ls-intro-scene"></div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("ls-intro-scene");
  if (!el) return;
  var QLS = window.QedLatticeSurgery;
  QLS.mount(el, QLS.buildScene(3), { stage: "prepare" });
});
</script>

Call them **Logical Qubit A** and **Logical Qubit B**. A real computation needs logical qubits to interact — to become entangled, to exchange information, to take part in two-qubit gates. But each one is protected precisely *because* its information is spread across many physical qubits and watched over by local checks.

**How can two protected logical qubits interact without abandoning the error protection the surface code provides?**

The technique real surface-code hardware uses is **lattice surgery**: rather than pulling logical information out of the code, or applying an ordinary two-qubit gate directly to it, lattice surgery changes *which* stabilizer/check measurements are being made across the boundary between two neighboring patches. You already know that a patch protects information via local checks — lattice surgery is what happens when new checks are temporarily added *between* two patches.

## A Patch Represents a Logical Qubit

Before looking at the surgery itself, it's worth being precise about what's actually being operated on.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Patch A</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Many physical qubits</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--logical" style="min-width:11rem;"><div class="qed-qubit__label">One encoded logical qubit</div></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Patch B</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Many physical qubits</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--logical" style="min-width:11rem;"><div class="qed-qubit__label">One encoded logical qubit</div></div>
    </div>
  </div>
</div>

**Lattice surgery operates on encoded logical qubits by modifying the relationships between their underlying physical qubits and stabilizer checks** — it does not collapse either patch down into a single ordinary physical qubit. Every data qubit and check from [Surface Codes](surface-codes.md) is still there; surgery changes *how they're connected*, not *what they are*.

## Meet the Boundaries

<div class="qed-demo" id="ls-boundary-scene"></div>
<p class="qed-encode-demo__hint">The dashed outline marks each patch's <strong>boundary</strong> — the edge facing the other patch.</p>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("ls-boundary-scene");
  if (!el) return;
  var QLS = window.QedLatticeSurgery;
  QLS.mount(el, QLS.buildScene(3), { stage: "prepare", highlightBoundary: true });
});
</script>

A surface-code patch has edges, and different edges support different kinds of connection to a neighboring patch. At this level you don't need the formal rough/smooth vocabulary yet — just this:

**The boundary is where neighboring patches can be connected through new stabilizer measurements.**

Patches aren't simply placed on top of one another. The operation below changes *which local checks are being measured* along the shared boundary — the physical qubits themselves never move.

## Main Interactive — Perform Lattice Surgery

Walk through the sequence yourself: **Merge** the boundary, **Measure** the new joint checks, then **Split** the patches back apart.

<div class="qed-demo" id="ls-main-demo">
  <div id="ls-main-scene"></div>
  <div class="qed-surgery-steps" id="ls-main-steps"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="ls-main-merge">Merge</button>
    <button type="button" class="qed-button" id="ls-main-measure" disabled>Measure</button>
    <button type="button" class="qed-button" id="ls-main-split" disabled>Split</button>
    <button type="button" class="qed-button qed-button--secondary" id="ls-main-reset" disabled>Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="ls-main-hint" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var sceneEl = document.getElementById("ls-main-scene");
  if (!sceneEl) return;
  var QLS = window.QedLatticeSurgery;
  var scene = QLS.buildScene(3);
  var stage = "prepare";
  var stepsEl = document.getElementById("ls-main-steps");
  var mergeBtn = document.getElementById("ls-main-merge");
  var measureBtn = document.getElementById("ls-main-measure");
  var splitBtn = document.getElementById("ls-main-split");
  var resetBtn = document.getElementById("ls-main-reset");
  var hint = document.getElementById("ls-main-hint");

  var STEP_LABELS = { prepare: "Prepare", merge: "Merge", measure: "Measure", split: "Split" };
  var HINTS = {
    prepare: "Two independently protected patches. Nothing connects them yet — click Merge to begin.",
    merge: "New joint checks (marked J, dashed) now span the boundary, tying together physical qubits from both patches. The ordinary checks inside each patch are untouched.",
    measure: "The joint checks have been measured (marked ✓). This reveals a relationship between Logical A and Logical B — not the individual state of either one.",
    split: "The temporary joint checks are removed and each patch is restored as an independent region. What Logical A and Logical B carry forward now depends on what the joint measurement revealed."
  };

  function render() {
    QLS.mount(sceneEl, scene, { stage: stage });
    stepsEl.innerHTML = QLS.STAGE_ORDER.map(function (s) {
      return '<span class="qed-surgery-step' + (s === stage ? " is-active" : "") + '">' + STEP_LABELS[s] + "</span>";
    }).join('<span aria-hidden="true">→</span>');
    mergeBtn.disabled = stage !== "prepare";
    measureBtn.disabled = stage !== "merge";
    splitBtn.disabled = stage !== "measure";
    resetBtn.disabled = stage === "prepare";
    hint.textContent = HINTS[stage];
  }

  mergeBtn.addEventListener("click", function () {
    if (stage !== "prepare") return;
    stage = "merge";
    render();
  });
  measureBtn.addEventListener("click", function () {
    if (stage !== "merge") return;
    stage = "measure";
    render();
  });
  splitBtn.addEventListener("click", function () {
    if (stage !== "measure") return;
    stage = "split";
    render();
  });
  resetBtn.addEventListener("click", function () {
    stage = "prepare";
    render();
  });

  render();
});
</script>

## What Does the Merge Actually Do?

Before the merge, Patch A and Patch B each have their own independent stabilizer structure — the same kind of checks from Surface Codes, just not yet connected to anything outside their own patch.

During the merge:

- new checks are introduced across the shared boundary
- each new check involves physical qubits from *both* patches
- the resulting measurements provide information about a joint logical property of A and B together

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:14rem;"><div class="qed-qubit__label">Logical A + Logical B</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:14rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Shared boundary checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:14rem;"><div class="qed-qubit__label">Joint information</div></div>
</div>

Two things the merge is **not**:

- It does not fuse Logical A and Logical B into a single ordinary qubit — both patches, and all their physical qubits, are still there.
- It does not directly measure the individual state of Logical A or Logical B — doing that would destroy exactly the information QEC is meant to protect.

## Joint Measurement

Instead of asking "what is the state of Logical A?" or "what is the state of Logical B?", the new boundary checks ask a different kind of question: what is a *relationship* between A and B?

This should feel familiar:

> Earlier, a parity check told us about a relationship between physical qubits — whether two of them agreed or disagreed — without revealing either qubit's individual value. Lattice surgery extends a similar idea to encoded logical qubits.

That analogy isn't exact — logical qubits carry full quantum states, not classical bits — but the shape of the idea carries over. The core concept is:

**Measure a relationship between logical qubits without individually measuring away their encoded quantum information.**

<details class="qed-details" id="explore-the-notation" markdown="1">
<summary>Optional: how this is usually written →</summary>

More advanced treatments describe a boundary merge as measuring a joint logical operator, such as

\[ Z_L^A \otimes Z_L^B \]

or

\[ X_L^A \otimes X_L^B \]

depending on which kind of boundary was merged. You don't need this notation to follow the rest of this section — it's here so the vocabulary isn't a surprise if you run into it elsewhere.

</details>

## Split the Patches

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:14rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Merged region</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:14rem;"><div class="qed-qubit__label">Joint measurement completed</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:14rem;"><div class="qed-qubit__label">Boundary separated</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:14rem;"><div class="qed-qubit__label">Patch A + Patch B</div></div>
</div>

Splitting removes the temporary joint checks and restores each patch's own independent boundary. **This is not simply "undo."** What Logical A and Logical B carry forward depends on what the joint measurement revealed and on the protocol being performed — split does not automatically return both logical qubits to exactly the states they had before the merge.

## QEC Does Not Stop During Surgery

It's tempting to picture lattice surgery as switching error correction off while the patches are manipulated, then switching it back on afterward. That's not what happens.

<div class="qed-demo" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:0.4rem;">
  <div class="qed-qubit qed-qubit--protected" style="min-width:9.5rem;"><div class="qed-qubit__label">Before surgery</div><div class="qed-qubit__state">QEC checks running</div></div>
  <div class="qed-encode-demo__arrow">→</div>
  <div class="qed-qubit" style="min-width:9.5rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Merge</div><div class="qed-qubit__state">QEC + new joint checks</div></div>
  <div class="qed-encode-demo__arrow">→</div>
  <div class="qed-qubit" style="min-width:9.5rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Joint measurement</div><div class="qed-qubit__state">repeated protected measurements</div></div>
  <div class="qed-encode-demo__arrow">→</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:9.5rem;"><div class="qed-qubit__label">Split</div><div class="qed-qubit__state">independent QEC checks restored</div></div>
</div>

Lattice surgery is designed so logical operations can be performed while the information remains encoded and protected the entire time. The important idea at this level isn't the exact number of measurement rounds a fault-tolerant implementation needs — it's that protection never lapses.

## From Surgery to Logical Operations

The merge → measure → split sequence is itself a building block, not the finish line.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:15rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Merge → Joint Measurement → Split</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:15rem;"><div class="qed-qubit__label">Building block for logical operations</div></div>
</div>

By combining joint measurements, ancilla logical patches, and classical interpretation of the measurement outcomes, lattice surgery can implement entangling logical operations — a logical **CNOT** is the standard example — while keeping every qubit involved encoded and protected the entire time. We won't build the full CNOT protocol here; the result that matters is computational, not procedural: **surface-code patches can compute together, not just individually survive.**

## Optional Exploration — Follow the Checks

<details class="qed-details" id="explore-the-checks" markdown="1">
<summary>Optional: follow the checks through the whole sequence →</summary>

The main interactive above focuses on the sequence itself. This one focuses on *which* checks are involved at each step, and lets you switch between three ways of looking at the same two patches.

<div class="qed-demo" id="ls-explore-demo">
  <div id="ls-explore-scene"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <div>
      <button type="button" class="qed-button qed-button--secondary qed-button--active ls-explore-stage" data-stage="prepare">Before Merge</button>
      <button type="button" class="qed-button qed-button--secondary ls-explore-stage" data-stage="merge">During Merge</button>
      <button type="button" class="qed-button qed-button--secondary ls-explore-stage" data-stage="measure">During Measurement</button>
      <button type="button" class="qed-button qed-button--secondary ls-explore-stage" data-stage="split">After Split</button>
    </div>
    <div>
      <button type="button" class="qed-button qed-button--secondary ls-explore-view" data-view="physical">Show Physical Qubits</button>
      <button type="button" class="qed-button qed-button--secondary qed-button--active ls-explore-view" data-view="checks">Show Stabilizer Checks</button>
      <button type="button" class="qed-button qed-button--secondary ls-explore-view" data-view="logical">Show Logical View</button>
    </div>
  </div>
  <p class="qed-encode-demo__hint" id="ls-explore-hint" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var sceneEl = document.getElementById("ls-explore-scene");
  if (!sceneEl) return;
  var QLS = window.QedLatticeSurgery;
  var scene = QLS.buildScene(3);
  var stage = "prepare";
  var view = "checks";
  var stageBtns = Array.prototype.slice.call(document.querySelectorAll(".ls-explore-stage"));
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll(".ls-explore-view"));
  var hint = document.getElementById("ls-explore-hint");

  var STAGE_TEXT = {
    prepare: "before the merge",
    merge: "during the merge",
    measure: "during the joint measurement",
    split: "after the split"
  };
  var VIEW_TEXT = {
    physical: "Physical qubits only — the raw hardware, no check structure shown.",
    checks: "Stabilizer/check structure — the level everything else in this module has used.",
    logical: "Logical view — each patch collapsed to the single logical qubit it encodes."
  };

  function render() {
    QLS.mount(sceneEl, scene, { stage: stage, view: view, highlightBoundary: true });
    hint.textContent = VIEW_TEXT[view] + " Shown " + STAGE_TEXT[stage] + ".";
  }

  stageBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      stage = b.dataset.stage;
      stageBtns.forEach(function (btn) {
        btn.classList.toggle("qed-button--active", btn.dataset.stage === stage);
      });
      render();
    });
  });
  viewBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      view = b.dataset.view;
      viewBtns.forEach(function (btn) {
        btn.classList.toggle("qed-button--active", btn.dataset.view === view);
      });
      render();
    });
  });

  render();
});
</script>

Three abstraction levels, same underlying operation:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Physical implementation</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Stabilizer/check structure</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:12rem;"><div class="qed-qubit__label">Logical operation</div></div>
</div>

You don't need to track every individual check to understand lattice surgery at this level — this view exists so you can see how the logical-level story (bottom) is actually built out of physical-level detail (top) whenever you want to look.

</details>

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:16rem;"><div class="qed-qubit__label">Logical Patch A + Logical Patch B</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:16rem;"><div class="qed-qubit__label">Identify compatible boundaries</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:16rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Merge — introduce joint stabilizer checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:16rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Measure joint logical information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:16rem;"><div class="qed-qubit__label">Split</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:16rem;"><div class="qed-qubit__label">Continue with protected logical qubits</div></div>
</div>

**Lattice surgery enables logical qubits encoded in surface-code patches to interact by temporarily changing stabilizer measurements along their boundaries. This allows joint logical information to be measured while the quantum information remains encoded and protected.**

Zoom out across the last three sections: [Surface Codes](surface-codes.md) protected logical qubits, [Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md) decoded the errors that threaten them, and Lattice Surgery lets protected logical qubits actually compute together.

So far, this module has often treated physical qubits and errors as though they behave uniformly — every qubit equally likely to fail, every check equally reliable. Real quantum hardware does not work that way. What happens when different qubits, gates, and measurements have different error characteristics — and those characteristics change over time?

**[Next: Hardware-Aware QEC →](hardware-aware-qec.md)**
