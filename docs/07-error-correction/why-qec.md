# Why QEC?

What happens when a quantum computer makes a mistake?

## The Reliability Problem

A quantum computation follows a simple shape: prepare some quantum information, perform a series of operations on it, and measure the result.

<div class="qed-demo">
  <p><strong>An ideal run</strong></p>
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 1</span><span>Prepare</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 2</span><span>Operations</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 3</span><span>More operations</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 4</span><span>Measure: correct result ✓</span></div>
  </div>

  <p style="margin-top:1.2rem;"><strong>The same run, with one physical error early on</strong></p>
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Step 1</span><span>Prepare</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--error"><span class="qed-flow-step__label">Step 2</span><span>⚠ Error occurs</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--error"><span class="qed-flow-step__label">Step 3</span><span>Error carried forward</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--error"><span class="qed-flow-step__label">Step 4</span><span>Measure: result affected ✗</span></div>
  </div>
</div>

An error early in a computation doesn't stay where it happened — every later operation builds on the information it corrupted. Not every error necessarily changes the final answer, but without some way of dealing with them, we generally can't tell which ones will.

**Quantum algorithms depend on maintaining and manipulating quantum information reliably, from the first operation to the last.**

## Physical Qubits Are Imperfect

A qubit isn't an abstract mathematical object floating in isolation. It's a physical system — a circuit, an atom, a particle of light — and it has to be built, controlled, and read out in the real world.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>IDEAL QUBIT</strong>
      <div class="qed-qubit qed-qubit--logical" style="min-width:12rem;"><div class="qed-qubit__label">Isolated</div></div>
      <div class="qed-qubit qed-qubit--logical" style="min-width:12rem;"><div class="qed-qubit__label">Perfect operations</div></div>
      <div class="qed-qubit qed-qubit--logical" style="min-width:12rem;"><div class="qed-qubit__label">Perfect measurement</div></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>PHYSICAL QUBIT</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:12rem; border-color:var(--qed-color-noise);"><div class="qed-qubit__label">Environment</div></div>
      <div class="qed-qubit qed-qubit--physical" style="min-width:12rem; border-color:var(--qed-color-noise);"><div class="qed-qubit__label">Control imperfections</div></div>
      <div class="qed-qubit qed-qubit--physical" style="min-width:12rem; border-color:var(--qed-color-noise);"><div class="qed-qubit__label">Noise</div></div>
      <div class="qed-qubit qed-qubit--physical" style="min-width:12rem; border-color:var(--qed-color-noise);"><div class="qed-qubit__label">Measurement imperfections</div></div>
    </div>
  </div>
</div>

A physical qubit can be affected by:

- **interaction with its environment** — stray fields, heat, or anything else it touches
- **loss of coherence** — quantum behavior fading over time
- **imperfect control operations** — the pulses or signals that run gates aren't exact
- **imperfect measurements** — reading a qubit out isn't perfectly reliable
- **unwanted interactions** and other hardware imperfections

We'll keep these categories loose for now — [Errors and Noise](errors-and-noise.md) gives them proper names later.

This isn't a sign of sloppy engineering. It follows from the fact that information always has to live in a physical system, and physical systems are noisy. Classical hardware faces the same reality, and — as we'll see shortly — has long relied on error correction too.

**Quantum information must be stored and manipulated using imperfect physical hardware.**

## Small Errors Become a Scaling Problem

One error is easy to survive when a computation is tiny. The picture changes as computations grow:

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Small circuit</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Few operations</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--protected" style="min-width:11rem;"><div class="qed-qubit__label">Fewer opportunities for error</div></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Larger computation</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Many qubits</div></div>
      <div class="qed-encode-demo__arrow">+</div>
      <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Many operations</div></div>
      <div class="qed-encode-demo__arrow">+</div>
      <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Longer execution</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--error" style="min-width:11rem;"><div class="qed-qubit__label">Many opportunities for error</div></div>
    </div>
  </div>
</div>

This doesn't mean every error destroys a computation. It means that as quantum computations become larger and more demanding, keeping the information reliable becomes increasingly important.

!!! info "Better qubits help — but they don't remove the question"
    Improving physical qubits is essential: it makes errors rarer. But the more demanding the computation, the more chances there are for something to go wrong. For sufficiently demanding computations, even very good physical qubits can leave a gap between "rarely wrong" and "reliable enough."

So the real engineering challenge is a general one: **how can we build reliable computation out of imperfect physical components?** Classical computing ran into this problem first.

## Classical Error Correction Gives Us an Idea

Here's the classic trick: store the information redundantly, and let the copies vote.

<div class="qed-demo">
  <div class="qed-compare-row">
    <div class="qed-flow-step"><span class="qed-flow-step__label">Information</span><span style="font-family:var(--md-code-font); font-size:1.1rem;">1</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step"><span class="qed-flow-step__label">Store redundantly</span><span style="font-family:var(--md-code-font); font-size:1.1rem;">1 1 1</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--error"><span class="qed-flow-step__label">One bit changes</span><span style="font-family:var(--md-code-font); font-size:1.1rem;">1 0 1</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Majority vote</span><span style="font-family:var(--md-code-font); font-size:1.1rem;">1 ✓</span></div>
  </div>
</div>

Classical systems protect information by introducing redundancy. If one physical component changes unexpectedly, the redundant copies help identify and recover the intended value.

**Could we simply do the same thing with a qubit?**

## Quantum Information Makes the Problem Harder

Two complications get in the way.

### You Cannot Simply Copy an Unknown Quantum State

An arbitrary, unknown quantum state can't be copied to create independent backups. This is the **no-cloning theorem**. We won't derive it here — what matters is what it rules out:

<div class="qed-demo">
  <div class="qed-compare-row" style="gap:0.8rem;">
    <div class="qed-qubit qed-qubit--logical" style="min-width:8rem;"><div class="qed-qubit__label">Unknown qubit</div></div>
    <span aria-hidden="true">→</span>
    <div class="qed-qubit qed-qubit--physical" style="min-width:6rem; border-style:dashed;"><div class="qed-qubit__label">COPY</div></div>
    <span aria-hidden="true">→</span>
    <div class="qed-qubit qed-qubit--physical" style="min-width:6rem; border-style:dashed;"><div class="qed-qubit__label">COPY</div></div>
    <span aria-hidden="true">→</span>
    <div class="qed-qubit qed-qubit--physical" style="min-width:6rem; border-style:dashed;"><div class="qed-qubit__label">COPY</div></div>
  </div>
  <p class="qed-encode-demo__hint" style="text-align:center;"><span class="qed-cap-no">✗</span> Invalid model — quantum redundancy can't simply mean "make backup copies."</p>
</div>

### You Cannot Simply Inspect the State Whenever You Want

Checking a classical bit is harmless. Measuring a quantum state is not: a direct measurement can reveal or disturb exactly the quantum information a computation is trying to preserve.

!!! warning "The dilemma"
    If we can't freely copy the information, and we can't simply inspect the quantum state to see whether it's wrong — **how can we detect an error at all?**

That question is the hook for this entire module. We won't answer it yet.

## The Key Idea of Quantum Error Correction

There is a way around the dilemma. **Quantum error correction (QEC)** protects quantum information by *encoding* logical information across multiple physical qubits, and by extracting information about errors *without directly measuring the protected logical state*.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:14rem;"><div class="qed-qubit__label">One logical quantum state</div></div>
  <div class="qed-encode-demo__arrow">↓ encoding</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Multiple physical qubits</div></div>
</div>

And when something goes wrong:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:14rem;"><div class="qed-qubit__label">Physical error occurs</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:14rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">QEC obtains information about the error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:14rem;"><div class="qed-qubit__label">Recovery</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:14rem;"><div class="qed-qubit__label">Logical information preserved</div></div>
</div>

*How* that information about the error is obtained — without measuring the logical state — is what the rest of the module is for. For now, all that matters is that a way around the dilemma exists.

## Physical Qubits vs. Logical Qubits

This gives us two kinds of qubit to keep apart:

- **Physical qubit** — an individual physical quantum system used by the hardware.
- **Logical qubit** — quantum information encoded using multiple physical resources, so that errors can be detected and corrected.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center;">
    <div class="qed-qubit qed-qubit--physical" style="min-width:3.4rem;"><div class="qed-qubit__label">○</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:3.4rem;"><div class="qed-qubit__label">○</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:3.4rem;"><div class="qed-qubit__label">○</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:3.4rem;"><div class="qed-qubit__label">○</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:3.4rem;"><div class="qed-qubit__label">○</div></div>
  </div>
  <div style="font-size:0.7rem; color:var(--md-default-fg-color--light);">PHYSICAL QUBITS</div>
  <div class="qed-encode-demo__arrow">↓ encoding</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:8rem;"><div class="qed-qubit__label">◉</div></div>
  <div style="font-size:0.7rem; color:var(--md-default-fg-color--light);">LOGICAL QUBIT</div>
</div>

The number of physical qubits behind one logical qubit isn't fixed — it depends on the code used and how much protection is needed. The next section, [Physical vs. Logical Qubits](physical-vs-logical-qubits.md), develops this properly.

## What QEC Is Trying to Achieve

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Imperfect physical hardware</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:14rem;"><div class="qed-qubit__label">Physical errors</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:14rem;"><div class="qed-qubit__label">QEC</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:14rem;"><div class="qed-qubit__label">More reliable logical information</div></div>
</div>

QEC does **not** make physical hardware perfect. Instead, it uses additional physical resources, measurements, and processing to protect encoded logical information from physical errors.

That protection isn't free. It may require:

- additional physical qubits
- additional operations
- repeated measurements
- classical processing

We won't put numbers on this yet. The point is the trade: **QEC spends extra resources and complexity to buy more reliable logical information.**

## Main Interactive — Protect the Information

Compare a single unprotected qubit with an encoded one. Introduce an error in each and watch what happens to the information. (This is deliberately abstract — the actual mechanisms come later.)

<div class="qed-demo" id="wq-demo">
  <div class="qed-syndrome-selector">
    <button type="button" class="qed-button qed-button--secondary qed-button--active wq-mode-btn" data-mode="unprotected">Unprotected</button>
    <button type="button" class="qed-button qed-button--secondary wq-mode-btn" data-mode="protected">Protected</button>
  </div>

  <div id="wq-stage" style="margin:0.8rem 0;"></div>

  <div class="qed-demo__controls" style="min-width:auto; text-align:center;">
    <button type="button" class="qed-button" id="wq-intro-btn">Introduce Error</button>
    <button type="button" class="qed-button qed-button--secondary" id="wq-reset-btn" disabled>Reset</button>
  </div>

  <div class="qed-compare-row" style="margin-top:1rem; gap:0.6rem;">
    <div class="qed-flow-step is-dim" id="wq-step-1"><span class="qed-flow-step__label">Physical error</span><span id="wq-step-1-text">—</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step is-dim" id="wq-step-2"><span class="qed-flow-step__label">Error information</span><span id="wq-step-2-text">—</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step is-dim" id="wq-step-3"><span class="qed-flow-step__label">Recovery</span><span id="wq-step-3-text">—</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step is-dim" id="wq-step-4"><span class="qed-flow-step__label">Logical information</span><span id="wq-step-4-text">—</span></div>
  </div>

  <div class="qed-error-demo__readout" style="justify-content:center; margin-top:0.8rem;">
    <span class="qed-pill"><span class="qed-pill__label">Physical error</span> <span id="wq-pill-physical">none</span></span>
    <span class="qed-pill"><span class="qed-pill__label">Logical information</span> <span id="wq-pill-logical">intact</span></span>
  </div>

  <p class="qed-encode-demo__hint" id="wq-hint" aria-live="polite"></p>
  <div class="qed-encode-demo__prompt" id="wq-prompt" hidden>
    <strong>?</strong> How did the system know an error happened <em>without measuring the logical information?</em>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("wq-demo");
  if (!demo) return;

  var modeBtns = Array.prototype.slice.call(demo.querySelectorAll(".wq-mode-btn"));
  var stageEl = document.getElementById("wq-stage");
  var introBtn = document.getElementById("wq-intro-btn");
  var resetBtn = document.getElementById("wq-reset-btn");
  var hint = document.getElementById("wq-hint");
  var prompt = document.getElementById("wq-prompt");
  var pillPhysical = document.getElementById("wq-pill-physical");
  var pillLogical = document.getElementById("wq-pill-logical");
  var stepEls = [1, 2, 3, 4].map(function (n) {
    return { box: document.getElementById("wq-step-" + n), text: document.getElementById("wq-step-" + n + "-text") };
  });

  // Deterministic: each replay of the protected run hits the next qubit
  // in this fixed order, so learners see it work wherever the error lands.
  var HIT_ORDER = [1, 3, 0, 4, 2];
  var PHYSICAL_COUNT = 5;
  var nextHit = 0;

  // Pure state -> everything on screen is derived from this one object.
  var view = { mode: "unprotected", phase: "idle", errIdx: null };
  var timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  var STEP_LABEL_MOD = ["error", "syndrome", "inference", "inference"];

  function chip(cls, label, state, minWidth) {
    return (
      '<div class="qed-qubit ' + cls + '" style="min-width:' + minWidth + ';"><div class="qed-qubit__label">' + label + '</div><div class="qed-qubit__state">' + state + "</div></div>"
    );
  }

  function drawStage() {
    if (view.mode === "unprotected") {
      var failed = view.phase === "failed";
      stageEl.innerHTML =
        '<div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">' +
        chip(failed ? "qed-qubit--error" : "qed-qubit--physical", "Physical qubit", failed ? "corrupted ✗" : "holds |ψ⟩", "9rem") +
        '<div style="font-size:0.7rem; color:var(--md-default-fg-color--light);">ONE PHYSICAL QUBIT HOLDS THE INFORMATION</div></div>';
      return;
    }

    var logicalDone = view.phase === "preserved";
    var chips = "";
    for (var i = 0; i < PHYSICAL_COUNT; i++) {
      var cls = "qed-qubit--physical";
      var state = "ok";
      if (i === view.errIdx) {
        if (view.phase === "error") {
          cls = "qed-qubit--error";
          state = "error ⚠";
        } else if (view.phase === "detected") {
          cls = "qed-qubit--error qed-qubit--flagged";
          state = "error found";
        } else if (view.phase === "recovered" || view.phase === "preserved") {
          cls = "qed-qubit--protected";
          state = "restored ✓";
        }
      }
      chips += chip(cls, "q" + (i + 1), state, "5rem");
    }
    stageEl.innerHTML =
      '<div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">' +
      chip(logicalDone ? "qed-qubit--protected" : "qed-qubit--logical", "Logical qubit", logicalDone ? "intact ✓" : "|ψ⟩ encoded", "10rem") +
      '<div class="qed-encode-demo__arrow">↓ encoded across</div>' +
      '<div style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center;">' + chips + "</div>" +
      '<div style="font-size:0.7rem; color:var(--md-default-fg-color--light);">PHYSICAL QUBITS (conceptual)</div></div>';
  }

  function setStep(i, lit, mod, text) {
    var s = stepEls[i];
    s.box.className = "qed-flow-step" + (lit ? " qed-flow-step--" + mod : " is-dim");
    s.text.textContent = text;
  }

  function drawSteps() {
    var p = view.phase;
    if (view.mode === "unprotected") {
      var failed = p === "failed";
      setStep(0, failed, "error", failed ? "occurred" : "—");
      setStep(1, false, "", failed ? "nothing to detect it" : "—");
      setStep(2, false, "", failed ? "nothing to restore from" : "—");
      setStep(3, failed, "error", failed ? "lost ✗" : "—");
      return;
    }
    var lit = { idle: 0, error: 1, detected: 2, recovered: 3, preserved: 4 }[p];
    var texts = ["occurred", "detected", "applied", "preserved ✓"];
    for (var i = 0; i < 4; i++) {
      setStep(i, i < lit, STEP_LABEL_MOD[i], i < lit ? texts[i] : "—");
    }
  }

  function drawStatus() {
    var p = view.phase;
    pillPhysical.textContent = p === "idle" ? "none" : "yes";
    if (view.mode === "unprotected") {
      pillLogical.textContent = p === "failed" ? "corrupted ✗" : "intact";
    } else {
      pillLogical.textContent = p === "preserved" ? "intact ✓" : "intact";
    }

    var msg = "";
    if (view.mode === "unprotected") {
      msg = p === "failed"
        ? "With nothing else holding the information, the physical error is the logical failure. Switch to Protected to compare."
        : "One physical qubit holds the information. Click Introduce Error.";
    } else {
      msg = {
        idle: "The information is encoded across several physical qubits. Click Introduce Error.",
        error: "A physical error hit one qubit — but the logical information hasn't failed.",
        detected: "Information about the error has been obtained. (How? That's what the rest of the module explains.)",
        recovered: "Recovery restores the affected qubit.",
        preserved: "Physical error, but no logical failure. This is the difference QEC makes."
      }[p];
    }
    hint.textContent = msg;
    prompt.hidden = !(view.mode === "protected" && p === "preserved");
  }

  function render() {
    drawStage();
    drawSteps();
    drawStatus();
    var running = view.phase === "error" || view.phase === "detected" || view.phase === "recovered";
    var finished = view.phase === "failed" || view.phase === "preserved";
    introBtn.disabled = running || finished;
    resetBtn.disabled = view.phase === "idle";
    modeBtns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.mode === view.mode);
    });
  }

  function setPhase(phase) {
    view.phase = phase;
    render();
  }

  function introduceError() {
    if (view.mode === "unprotected") {
      setPhase("failed");
      return;
    }
    view.errIdx = HIT_ORDER[nextHit % HIT_ORDER.length];
    nextHit++;
    setPhase("error");
    timers.push(setTimeout(function () { setPhase("detected"); }, 900));
    timers.push(setTimeout(function () { setPhase("recovered"); }, 1800));
    timers.push(setTimeout(function () { setPhase("preserved"); }, 2700));
  }

  function reset() {
    clearTimers();
    view.phase = "idle";
    view.errIdx = null;
    render();
  }

  modeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      clearTimers();
      view.mode = b.dataset.mode;
      view.phase = "idle";
      view.errIdx = null;
      render();
    });
  });
  introBtn.addEventListener("click", introduceError);
  resetBtn.addEventListener("click", reset);

  render();
});
</script>

Two different things happened in those two runs. In the unprotected case, a **physical error** was also a **logical failure**. In the protected case, a physical error occurred and the logical information survived. (This picture is simplified on purpose — real encodings have limits on how many errors they can handle, which later sections explore.)

## The QEC Learning Journey

Here's where the rest of Module 07 goes, and the question each stop answers:

<div class="qed-journey" id="wq-journey"></div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("wq-journey");
  if (!el) return;

  // Hand-maintained to mirror the Module 07 nav in mkdocs.yml. hrefs are
  // page-relative to the *built* site (this page is /07-error-correction/
  // why-qec/), so a sibling is "../<slug>/". Not validated by mkdocs
  // --strict -- update here if a page is renamed or reordered.
  var JOURNEY = [
    {
      title: "The Mental Model",
      steps: [
        { name: "Physical vs. Logical Qubits", slug: "physical-vs-logical-qubits", q: "How can many physical qubits represent protected logical information?" },
        { name: "Errors and Noise", slug: "errors-and-noise", q: "What kinds of things can go wrong?" },
        { name: "Repetition Codes", slug: "repetition-codes", q: "How can redundancy help?" }
      ]
    },
    {
      title: "QEC Machinery",
      steps: [
        { name: "Encoding & Syndrome Measurement", slug: "encoding-and-syndrome-measurement", q: "How can we obtain information about errors without directly measuring the logical state?" },
        { name: "Stabilizer Codes", slug: "stabilizer-codes", q: "How can we define the constraints that characterize valid encoded states?" },
        { name: "Decoding", slug: "decoding", q: "Given evidence about an error, how do we decide what recovery to make?" }
      ]
    },
    {
      title: "Scaling",
      steps: [
        { name: "Surface Codes", slug: "surface-codes", q: "How can this machinery be arranged across many physical qubits?" },
        { name: "Minimum-Weight Perfect Matching", slug: "minimum-weight-perfect-matching", q: "How can a decoder efficiently interpret large syndrome patterns?" },
        { name: "Lattice Surgery", slug: "lattice-surgery", q: "How can protected logical qubits interact?" },
        { name: "Hardware-Aware QEC", sub: "From Ideal Models to Real Devices", slug: "hardware-aware-qec", q: "What changes when QEC encounters nonuniform and changing physical hardware?" }
      ]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  el.innerHTML = JOURNEY.map(function (group) {
    var items = group.steps
      .map(function (s) {
        return (
          '<li><a class="qed-journey__step" href="../' + s.slug + '/">' +
          '<span class="qed-journey__name">' + esc(s.name) + (s.sub ? ' <span class="qed-journey__sub">— ' + esc(s.sub) + "</span>" : "") + "</span>" +
          '<span class="qed-journey__q">' + esc(s.q) + "</span></a></li>"
        );
      })
      .join("");
    return '<div class="qed-journey__group"><div class="qed-journey__group-title">' + esc(group.title) + '</div><ol class="qed-journey__steps">' + items + "</ol></div>";
  }).join("");
});
</script>

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:16rem;"><div class="qed-qubit__label">Quantum information</div></div>
  <div class="qed-encode-demo__arrow">↓ must exist in</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:16rem;"><div class="qed-qubit__label">Physical hardware</div></div>
  <div class="qed-encode-demo__arrow">↓ which experiences</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:16rem;"><div class="qed-qubit__label">Noise and imperfections</div></div>
  <div class="qed-encode-demo__arrow">↓ so</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:16rem;"><div class="qed-qubit__label">Physical errors can corrupt the information</div></div>
  <div class="qed-encode-demo__arrow">↓ and useful large-scale computation requires</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:16rem;"><div class="qed-qubit__label">Reliable logical information</div></div>
  <div class="qed-encode-demo__arrow">↓ which is provided by</div>
  <div class="qed-qubit" style="min-width:16rem;"><div class="qed-qubit__label">Quantum error correction provides</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:16rem;"><div class="qed-qubit__label">Encode logical information across physical resources</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:16rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Detect information about errors</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:16rem;"><div class="qed-qubit__label">Recover while preserving the logical state</div></div>
</div>

**Quantum error correction is the collection of techniques that allows quantum information to be protected from physical errors without simply copying or directly inspecting the unknown quantum state.**

The most important thing to leave with is the questions:

- How can one logical qubit be represented by many physical qubits?
- What kinds of errors occur?
- How can we detect an error without directly measuring the protected information?
- How does a decoder decide what correction to make?

Those are what the rest of Module 07 answers.

**[Next: Physical vs. Logical Qubits →](physical-vs-logical-qubits.md)**
