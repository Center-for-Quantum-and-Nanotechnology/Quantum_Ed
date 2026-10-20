# Simulation Engines and Methods

A simulator is not one thing. It is a family of methods, each keeping track of the quantum state in a different way. How it keeps track decides which circuits it can handle and what it costs.

## From Targets to Simulators

On the [previous page](hardware-abstraction-and-backend-capabilities.md), a device reported time-stamped estimates and a simulator had no physical condition to report. A simulator was still a target that something must compute on.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem; flex-wrap:wrap;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">A device</span><span>Reports time-stamped estimates</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">A simulator</span><span>Has no physical condition to report</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>But it is still a target</span></div>
  </div>
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
  <p style="text-align:center; font-size:0.8rem;">The same example as before: prepare two qubits together (a Bell state), then measure both.</p>
</div>

> **If a simulator is just another kind of target, how does it actually work out the answer, and why do different simulators behave differently?**

A [simulator](../glossary.md#simulator) is a classical program that models the computation. It uses one of several **methods**, and the method decides what the simulator can do. This page is about those methods, not about how to run one.

## The Obvious Method: Keep Every Amplitude

The most direct method keeps the whole [state vector](../glossary.md#state-vector): one [amplitude](../glossary.md#probability-amplitude) for every possible outcome. Here is what it keeps for the Bell state. The amplitudes were produced by a small simulator running on this page.

<div class="qed-demo qed-sm" id="sm-bell-sv"></div>

Two qubits need four amplitudes. Each qubit you add doubles the list, because every outcome so far now has two continuations. Here is what the method keeps as the circuit grows. As on the [Module 01 page](../01-foundations/why-quantum-computing.md), each amplitude is counted as 16 bytes, one double-precision complex number.

<div class="qed-demo qed-sm" id="sm-growth"></div>

Each extra qubit doubles what the method keeps. That is a fact about **this method**. It is not a fact about classical simulation as a whole. And it is what the previous page meant when it said a simulator's limits are set by the computer that runs it: for this method, the limit is how much it must keep.

!!! question "Is this how all simulators work?"
    No. It is the obvious method. Others keep less by using structure.

## Keeping Less by Using Structure

The Bell state has a lot of structure. Here it is held in three different ways. Each was produced by its own small engine, and all three describe the same state.

<div class="qed-demo qed-sm" id="sm-three"></div>

- The **state-vector** method keeps every amplitude.
- The **[stabilizer](../glossary.md#stabilizer)** method keeps a short list of rules the state obeys. It works for circuits built only from a restricted set of operations, called a **[Clifford circuit](../glossary.md#clifford-circuit)**.
- The **[tensor-network](../glossary.md#tensor-network)** method keeps the state as small pieces joined by links. The links stay small when the state is not very [entangled](../glossary.md#entanglement), and grow as entanglement grows.

## What Each Method Is Good For, and Where It Stops

The same four questions, for each method.

<div class="qed-demo qed-sm" id="sm-compare"></div>

No method is better in general. Other methods exist too, for example methods that keep more than a state so that [noise](../glossary.md#noise-model) can be included, such as the [density matrix](../glossary.md#density-matrix). They are not covered here.

## Simulation Method Explorer

First, a prediction.

<div class="qed-demo" id="sm-quiz-predict"></div>

Now choose a circuit, a number of qubits, and look at what each method must keep. Three circuits are offered so that no method wins everywhere.

<div class="qed-demo qed-sm" id="sm-explorer">
  <p class="qed-demo__step"><strong>1. Choose a circuit</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Circuit" id="sm-family-btns"></div>
  <p class="qed-sm__note" id="sm-family-desc"></p>
  <div class="qed-sm__controls">
    <label for="sm-n">Number of qubits, n: <strong id="sm-n-val"></strong></label>
    <input type="range" id="sm-n" min="2" max="60" step="1" value="2">
    <p class="qed-sm__marker">Up to 10 qubits each size is computed by running the method. Beyond 10 it is estimated from the method's size formula.</p>
    <div id="sm-depth-row" hidden>
      <label for="sm-depth">Depth, the number of layers: <strong id="sm-depth-val"></strong></label>
      <input type="range" id="sm-depth" min="1" max="8" step="1" value="2">
    </div>
  </div>
  <p class="qed-demo__step"><strong>2. Choose a method.</strong> All three are shown. The chosen one drives the picture.</p>
  <div class="qed-demo__controls" role="group" aria-label="Method" id="sm-method-btns"></div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="sm-reset">Reset</button>
  </div>
  <div id="sm-out"></div>
  <p class="qed-sm__note" id="sm-live" role="status" aria-live="polite"></p>
</div>

What you choose is the circuit, its size, and the method. What each method keeps, and whether it can handle the circuit, follow from that. What you notice is which method stays small, which stops, and which grows. Sizes are not speeds: this page gives no timings.

<div class="qed-demo" id="sm-quiz-size"></div>

<div class="qed-demo" id="sm-quiz-t"></div>

## What a Simulator Can Show That a Device Cannot

**A simulator**
:   Can show the whole state, such as the Bell state's four amplitudes above, and exact outcome probabilities. It can also produce samples, one outcome per [shot](../glossary.md#shot), the way a device does.

**A device**
:   Returns only samples, one outcome per shot.

<div class="qed-demo qed-sm" id="sm-bell-probs"></div>

A simulator by default models an ideal device. Simulating noise needs more than a state vector and costs more. That is what the previous page meant by a simulator that can be set up to imitate a device's reported properties: it takes extra work, and it is a choice. A simulator's answer is **not a prediction** of what a particular device will do.

## No Method Wins Everywhere

Here are the three methods on the three circuits, for a circuit of 30 qubits. Nothing is run at this size, so every size is estimated from its formula.

<div class="qed-demo qed-sm" id="sm-nowin"></div>

- The GHZ chain is cheap for the stabilizer and tensor-network methods and doubles for the state-vector method.
- Adding a T stops the stabilizer method and leaves the tensor-network method cheap.
- Adding entangling layers makes the tensor-network method's pieces grow.

So "how many qubits can a simulator handle?" has no single answer. It depends on the method and on the circuit.

Size is not speed. How long a simulation takes depends on the implementation, the hardware, and more, and this page does not measure it.

The answers can be exact or approximate. The state-vector and stabilizer methods are exact for what they handle, up to rounding. The tensor-network method is exact when every link keeps its full size. Real tools may cap the link size to save memory, which makes the answer approximate. This page does not show that.

The [Module 01 page](../01-foundations/why-quantum-computing.md) noted that clever classical methods exploit structure. This is what that looks like: restricted operations for one method, low entanglement for another. It does not say which circuits are hard, and it says nothing about whether a quantum computer can beat any of these methods.

> **A simulator handles a circuit easily. What does that tell you about the next one?**

Very little. It depends on whether the next circuit has the structure that method uses.

## A Simulator Is a Target, Not a Forecast

**Simulator target**
:   A target with a description (the previous page) and a method (this page).

**Device target**
:   A target with a description and, usually, reported calibration data.

**Prediction**
:   What one target would do for one circuit. A simulator target is not a forecast of a device target, or the other way around.

The same Bell circuit can run on both targets, and the results are two different kinds of thing: exact probabilities and amplitudes on one, samples on the other.

## From Simulators to Runs

Look at the two targets once more.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Previously</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>A simulator models the computation</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Its method decides what it can do</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Now</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Either target will be handed work</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Something has to coordinate the run</span></div>
    </div>
  </div>
</div>

> **Whether a circuit runs on a simulator or on a device, what sends the work, waits for it, and brings the results back?**

Something has to coordinate the run. That is the next problem.

## Takeaway

A simulator is a classical program that models a quantum computation by one of several methods. Each keeps track of the state differently, so each handles some circuits well and others not at all, and "how many qubits can it handle?" depends on the method and the circuit.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A simulator is a target that models the computation</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Its method decides what it keeps</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>What it keeps decides which circuits it handles and what it costs</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>No method wins everywhere</span></div>
</div>

Circuit → method → what the method keeps → what it can handle and how that grows.

> **Whether a circuit runs on a simulator or on a device, what sends the work, waits for it, and brings the results back?**

**Next: Quantum Runtime and Classical-Quantum Orchestration →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var SM = window.QedSimMethods;
  var N = window.QedNumbers;
  var Z = window.QedQuiz;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // The recurring circuit, drawn from data, as on the previous pages.
  Array.prototype.forEach.call(document.querySelectorAll("[data-qed-circuit]"), function (el) {
    el.innerHTML = QC.renderSVG(QC.bell());
  });

  function tagHTML(tag) { return '<span class="qed-sm__tag qed-sm__tag--' + tag + '">' + tag + "</span>"; }

  function card(title, body, opts) {
    opts = opts || {};
    return '<div class="qed-sm__card' + (opts.wide ? " qed-sm__card--wide" : "") + (opts.chosen ? " is-chosen" : "") + '"' + (opts.method ? ' data-method="' + opts.method + '"' : "") + ">" +
      '<p class="qed-sm__title">' + title + "</p>" + body + (opts.note ? '<p class="qed-sm__note">' + opts.note + "</p>" : "") + "</div>";
  }

  function glyph(m) { return '<span class="qed-sm__glyph" aria-hidden="true">' + esc(m.glyph) + "</span>"; }

  // ---- the Bell state, held three ways ---------------------------------------------------------
  var bellCircuit = SM.circuit("ghz", 2);
  var bellState = SM.stateVector(bellCircuit);
  $("sm-bell-sv").innerHTML = '<div class="qed-sm__cards">' + card(glyph(SM.methodById("state-vector")) + "State vector: every amplitude " + tagHTML("computed"), SM.amplitudeTableHTML(bellState),
    { note: "Outcomes are written with q₀ as the left digit.", chosen: true }) + "</div>";

  // ---- how the state vector grows ------------------------------------------------------------------
  var rows = [2, 10, 11, 20, 30, 40, 50, 60].map(function (n) {
    var s = SM.sizes("state-vector", "ghz", n);
    return "<tr><th scope=\"row\">" + n + '</th><td data-label="Amplitudes kept">' + N.human(s.size.count) + '</td><td data-label="At 16 bytes each">' + N.bytes(s.size.bytes) + '</td><td data-label="How it was found">' + tagHTML(s.size.tag) + "</td></tr>";
  }).join("");
  $("sm-growth").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Qubits</th><th scope="col">Amplitudes kept</th><th scope="col">At 16 bytes each</th><th scope="col">How it was found</th></tr></thead><tbody>' + rows + "</tbody></table>" +
    '<p class="qed-sm__note">Computed: the state-vector engine was run at that size (up to ' + SM.MAX_RUN + " qubits). Estimated: from the formula 2<sup>n</sup>. Size is not speed.</p>";

  // ---- three ways to hold the Bell state ---------------------------------------------------------------
  var bellStab = SM.stabilizer(bellCircuit);
  var bellLink = SM.maxCutRank(bellState).max;
  var mSV = SM.methodById("state-vector");
  var mST = SM.methodById("stabilizer");
  var mTN = SM.methodById("tensor-network");
  $("sm-three").innerHTML = '<div class="qed-sm__cards">' +
    card(glyph(mSV) + mSV.label + tagHTML("computed"), SM.amplitudeTableHTML(bellState), { note: "Keeps four amplitudes.", method: "state-vector" }) +
    card(glyph(mST) + mST.label + tagHTML("computed"), "<p>The state obeys these two rules:</p>" + SM.rulesHTML(bellStab.rules) + "<p>XX: flipping both qubits changes nothing. ZZ: the two qubits always agree.</p>", { note: "Keeps two rules (a table of " + bellStab.bits + " bits).", method: "stabilizer" }) +
    card(glyph(mTN) + mTN.label + tagHTML("computed"), SM.chainSVG(2, bellLink, { idPrefix: "sm-bell" }), { note: "Keeps two small pieces joined by one link of size " + bellLink + ".", method: "tensor-network" }) +
    "</div>";

  // ---- the four questions, for each method ----------------------------------------------------------------------
  $("sm-compare").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Method</th><th scope="col">What it keeps</th><th scope="col">What circuits it handles</th><th scope="col">What drives its cost</th><th scope="col">What it gives back</th></tr></thead><tbody>' +
    SM.METHODS.map(function (m) {
      return '<tr><th scope="row">' + glyph(m) + esc(m.label) + '</th><td data-label="What it keeps">' + esc(m.keeps) + '</td><td data-label="What circuits it handles">' + esc(m.handles) + '</td><td data-label="What drives its cost">' + esc(m.driver) + '</td><td data-label="What it gives back">' + esc(m.returns) + "</td></tr>";
    }).join("") + "</tbody></table>";

  // ---- the explorer ----------------------------------------------------------------------------------------------
  var DEFAULT = { family: "ghz", n: 2, depth: 2, method: "state-vector" };
  var view = { family: DEFAULT.family, n: DEFAULT.n, depth: DEFAULT.depth, method: DEFAULT.method };

  $("sm-family-btns").innerHTML = SM.FAMILIES.map(function (f) {
    return '<button type="button" class="qed-button qed-button--secondary" data-family="' + esc(f.id) + '" aria-pressed="false">' + esc(f.label) + "</button>";
  }).join("");
  $("sm-method-btns").innerHTML = SM.METHODS.map(function (m) {
    return '<button type="button" class="qed-button qed-button--secondary" data-method="' + esc(m.id) + '" aria-pressed="false">' + esc(m.glyph + " " + m.label) + "</button>";
  }).join("");

  // A two-qubit circuit as QedCircuit draws it: one operation per column on each wire it uses.
  function drawTwoQubits(c) {
    var last = [-1, -1];
    var ops = c.ops.map(function (op) {
      var wires = op.g === "cx" ? [op.c, op.t] : [op.q];
      var col = Math.max.apply(null, wires.map(function (w) { return last[w] + 1; }));
      wires.forEach(function (w) { last[w] = col; });
      if (op.g === "h") return { type: "h", targets: [op.q], col: col };
      if (op.g === "cx") return { type: "cx", control: op.c, target: op.t, col: col };
      return { type: "gate", gateId: op.g, label: op.g.toUpperCase(), name: op.g.toUpperCase(), targets: [op.q], col: col };
    });
    return QC.renderSVG({ qubits: ["q0", "q1"], ops: ops });
  }

  function sizeText(s) {
    if (s.size.count === null) return "not available";
    var big = N.human(s.size.count) + " " + s.size.unit;
    if (s.size.bytes !== undefined) big += " (" + N.bytes(s.size.bytes) + ")";
    return big;
  }

  function methodCard(m, chosen) {
    var s = m.size;
    var verdict = m.supported ? "Can handle this circuit" : "Cannot handle this circuit";
    var body = '<p><span class="qed-sm__field">Keeps</span>' + esc(m.keeps) + "</p>" +
      '<p><span class="qed-sm__field">Handles</span>' + esc(m.handles) + "</p>" +
      '<p><span class="qed-sm__field">Cost is driven by</span>' + esc(m.driver) + "</p>" +
      '<p><span class="qed-sm__field">Gives back</span>' + esc(m.returns) + "</p>" +
      '<p><span class="qed-sm__field">Size for this circuit</span>' + (s.count === null ? "<strong>not available</strong>" : "<strong>" + sizeText(m) + "</strong>") + " " + tagHTML(m.size.tag) + "</p>" +
      '<p class="qed-sm__verdict">' + verdict + (m.supported ? "" : ' <span class="qed-sm__tag qed-sm__tag--cannot">cannot handle</span>') + "</p>" +
      (m.reason ? "<p>" + esc(m.reason) + "</p>" : "") +
      "<p>" + esc(m.growth) + "</p>";
    return card(glyph(m) + esc(m.label) + (chosen ? '<span class="qed-sm__badge">chosen</span>' : ""), body, { method: m.id, chosen: chosen });
  }

  // The picture of what the chosen method keeps for this circuit.
  function picture(r) {
    var m = r.methods.filter(function (x) { return x.id === view.method; })[0];
    var c = SM.circuit(view.family, view.n, view.family === "layers" ? view.depth : undefined);
    var title = "What the " + m.label.toLowerCase() + " method keeps for this circuit";
    var body;
    if (view.method === "state-vector") {
      if (view.n <= 3) body = SM.amplitudeTableHTML(SM.stateVector(c)) + '<p class="qed-sm__note">' + tagHTML("computed") + " Outcomes are written with q₀ as the left digit.</p>";
      else body = "<p>" + N.human(m.size.count) + " amplitudes: too many to list. " + (view.n <= SM.MAX_RUN ? "The engine holds them all for this size." : "At this size nothing is run; the count comes from the formula.") + "</p>";
    } else if (view.method === "stabilizer") {
      if (!m.supported) body = "<p>Nothing to show: " + esc(m.reason) + "</p>";
      else if (view.n <= SM.MAX_RUN) body = "<p>The state obeys these " + view.n + " rules:</p>" + SM.rulesHTML(SM.stabilizer(c).rules);
      else body = "<p>A table of " + N.human(m.size.count) + " bits holding " + view.n + " rules about the state. At this size nothing is run; the size comes from the formula.</p>";
    } else {
      body = SM.chainSVG(view.n, m.link.chi, { idPrefix: "sm-pic" }) +
        "<p>" + view.n + " small pieces, one per qubit, joined by links of size " + (m.link.atMost ? "at most " : "") + m.link.chi + " (drawn at the largest size) " + tagHTML(m.link.tag) + ".</p>";
    }
    return card(glyph(SM.methodById(view.method)) + esc(title), body, { wide: true, method: view.method });
  }

  function render() {
    var depth = view.family === "layers" ? view.depth : undefined;
    var r = SM.compare(view.family, view.n, depth);
    var fam = SM.familyById(view.family);
    Array.prototype.forEach.call($("sm-family-btns").querySelectorAll("button"), function (b) {
      var on = b.getAttribute("data-family") === view.family;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    Array.prototype.forEach.call($("sm-method-btns").querySelectorAll("button"), function (b) {
      var on = b.getAttribute("data-method") === view.method;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("sm-family-desc").textContent = fam.description;
    $("sm-n-val").textContent = String(view.n);
    $("sm-n").value = String(view.n);
    $("sm-depth-row").hidden = !fam.usesDepth;
    $("sm-depth-val").textContent = String(view.depth);
    $("sm-depth").value = String(view.depth);

    var drawing = view.n === 2 ? '<div class="qed-sm__card qed-sm__card--wide" style="text-align:center;">' + drawTwoQubits(SM.circuit(view.family, 2, depth)) + "</div>" : "";
    $("sm-out").innerHTML =
      '<p class="qed-sm__note"><strong>The circuit:</strong> ' + esc(r.circuit.description) + "</p>" + drawing +
      '<div class="qed-sm__cards">' + r.methods.map(function (m) { return methodCard(m, m.id === view.method); }).join("") + picture(r) + "</div>";

    var m = r.methods.filter(function (x) { return x.id === view.method; })[0];
    $("sm-live").textContent = fam.label + ", " + view.n + " qubits" + (fam.usesDepth ? ", depth " + view.depth : "") + ". The " + m.label.toLowerCase() + " method " +
      (m.supported ? "can handle it and keeps " + (m.size.count === null ? "nothing" : N.human(m.size.count).replace(/<[^>]+>/g, "") + " " + m.size.unit) + " (" + m.size.tag + ")." : "cannot handle it. " + m.reason);
  }

  Array.prototype.forEach.call($("sm-family-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.family = b.getAttribute("data-family"); render(); });
  });
  Array.prototype.forEach.call($("sm-method-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.method = b.getAttribute("data-method"); render(); });
  });
  $("sm-n").addEventListener("input", function () { view.n = Number($("sm-n").value); render(); });
  $("sm-depth").addEventListener("input", function () { view.depth = Number($("sm-depth").value); render(); });
  $("sm-reset").addEventListener("click", function () {
    view = { family: DEFAULT.family, n: DEFAULT.n, depth: DEFAULT.depth, method: DEFAULT.method };
    render();
  });
  render();

  // ---- Bell probabilities: what a simulator can show --------------------------------------------------------------
  var probs = bellState.amps.map(function (a) { return a.re * a.re + a.im * a.im; });
  $("sm-bell-probs").innerHTML = '<div class="qed-sm__cards">' +
    card("A simulator can show", "<p>Exact probabilities: " + ["00", "01", "10", "11"].map(function (k, i) { return k + " is " + N.pct(probs[i]); }).join(", ") + ".</p>", { note: "Computed from the Bell state's amplitudes above." }) +
    card("A device returns", "<p>Samples: one outcome per shot, such as 00, 11, 11, 00, 00, 11 &hellip; The mix of outcomes in many shots approaches the probabilities, along with whatever the device's own condition adds.</p>", { note: "An illustration of the form of the result, not a measured run." }) +
    "</div>";

  // ---- the three families at 30 qubits ----------------------------------------------------------------------------------
  function cell(m) {
    if (!m.supported) return '<span class="qed-sm__tag qed-sm__tag--cannot">cannot handle</span> ' + esc(m.reason.split(" is not")[0]) + " is outside its set";
    return N.human(m.size.count) + " " + m.size.unit + " " + tagHTML(m.size.tag) + (m.link ? " (link size " + (m.link.atMost ? "at most " : "") + m.link.chi + ")" : "");
  }
  $("sm-nowin").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Circuit (30 qubits)</th>' + SM.METHODS.map(function (m) { return '<th scope="col">' + glyph(m) + esc(m.label) + "</th>"; }).join("") + "</tr></thead><tbody>" +
    SM.FAMILIES.map(function (f) {
      var r = SM.compare(f.id, 30, f.usesDepth ? 6 : undefined);
      return '<tr><th scope="row">' + esc(f.label) + (f.usesDepth ? ", depth 6" : "") + "</th>" + r.methods.map(function (m) { return '<td data-label="' + esc(m.label) + '">' + cell(m) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody></table>";

  // ---- checks ---------------------------------------------------------------------------------------------------------------
  Z.mount($("sm-quiz-predict"), { title: "Prediction", items: [{
    label: "What happens to what the state-vector method keeps when a qubit is added",
    prompt: "Adding one qubit to a state-vector simulation of the GHZ chain: what happens to what the method keeps? Pick one, then try it in the explorer.",
    options: [
      { label: "It stays the same", correct: false, why: "Each new qubit adds a second possibility to every outcome so far, so the list cannot stay the same." },
      { label: "It goes up by one amplitude", correct: false, why: "That would be true if each qubit added only one outcome. It adds a whole new set, one for every existing outcome." },
      { label: "It doubles", correct: true, why: "Each outcome so far now has two continuations, so the method keeps twice as many amplitudes: 2 qubits keep 4, 3 keep 8, and 10 keep 1,024." },
      { label: "It squares", correct: false, why: "Squaring would grow far faster. Adding a qubit multiplies the amplitudes by 2, not by itself." }
    ]
  }] });

  Z.mount($("sm-quiz-size"), { title: "Check", items: [{
    label: "Whether a simulator that handles one 40-qubit circuit handles every 40-qubit circuit",
    prompt: "A simulator handles a 40-qubit circuit easily. Does that mean it can handle every 40-qubit circuit?",
    options: [
      { label: "Yes, the number of qubits is what decides it", correct: false, why: "For one method it is. For the others, the operations used and how entangled the state gets matter too." },
      { label: "No, it depends on the method and on the circuit", correct: true, why: "In the explorer, the same size can be cheap for one method and impossible for another, depending on the circuit." },
      { label: "Yes, because simulators use the same method", correct: false, why: "Simulators differ in their methods. That is why they behave differently." }
    ]
  }] });

  Z.mount($("sm-quiz-t"), { title: "Transfer", items: [{
    label: "Which method cannot handle the GHZ chain with a T on every qubit",
    prompt: "Which method cannot handle the GHZ chain with a T on every qubit, and why?",
    options: [
      { label: "The state-vector method", correct: false, why: "It handles any circuit. It keeps every amplitude, so the operations do not matter, only the number of qubits does." },
      { label: "The stabilizer method", correct: true, why: "T is outside the restricted set of operations it works with (H, S, X, Z, and CNOT). The state-vector and tensor-network methods can handle this circuit." },
      { label: "The tensor-network method", correct: false, why: "T acts on one qubit at a time and does not make the state more entangled, so the pieces stay small. It can handle this circuit." }
    ]
  }] });
});
</script>
