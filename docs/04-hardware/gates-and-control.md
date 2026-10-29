# Gates and Control

In Module 02 a gate was a symbol that turned a point on a sphere. On a device, a gate is a signal. How strong, and for how long?

## From a Qubit That Starts to a Qubit That Moves

[Physical Qubits](physical-qubits.md) ended with a qubit that starts in |0⟩ and a drive that can single out its two levels. Nothing has changed its state yet.

<div class="qed-demo qed-dr" id="dr-ladder"></div>

> **How exactly do you move its state, and how far?**

You send it a signal, and the turn depends on the signal. This page is about how.

## A Gate Is a Signal

A **[control pulse](../glossary.md#control-pulse)** is a signal of some strength that lasts some length, sent to a qubit. Different kinds of qubit use different kinds of signal. Here are three, named and not explained:

<table class="qed-xf__table">
  <thead><tr><th scope="col">Kind of signal</th><th scope="col">Used by</th></tr></thead>
  <tbody>
    <tr><th scope="row">Microwave signals</th><td data-label="Used by">Engineered circuits, and some spin qubits</td></tr>
    <tr><th scope="row">Laser light</th><td data-label="Used by">Ions and atoms</td></tr>
    <tr><th scope="row">Magnetic fields</th><td data-label="Used by">Spin qubits</td></tr>
  </tbody>
</table>

A gate on a circuit diagram is one of these signals in disguise. On this page the signal is drawn as a plain rectangle. That is a **simplified shape**: real signals are shaped, and that is later depth.

## Strength × Length = Turn

Draw the signal as a rectangle. Its height is the **strength**. Its width is the **length**. Its area is the **turn**: how far the qubit's state is moved.

<div class="qed-demo qed-dr">
  <div class="qed-dr__cols">
    <div>
      <div id="dr-static-signal"></div>
      <p class="qed-dr__note">A medium signal, length 3. <span class="qed-dr__tag">invented</span></p>
    </div>
    <div>
      <canvas id="dr-static-sphere" class="qed-dr__canvas" width="300" height="300" role="img" aria-label="Bloch sphere."></canvas>
      <p class="qed-dr__note" id="dr-static-note"></p>
    </div>
  </div>
</div>

In words: **turn = rate × length**, where the rate is how many degrees each unit of length turns the qubit, and a stronger signal has a higher rate. [Quantum Gates](../02-fundamentals/quantum-gates.md) drew the turn as a [rotation](../glossary.md#rotation-gate) about an axis. The turn is the effect. The signal is the cause. The direction of the signal sets the axis.

!!! question "If you make the signal twice as long, what happens to the turn?"
    It doubles. The rectangle is twice as wide, so its area, the turn, is twice as large.

## Drive a Qubit

First, a prediction.

<div class="qed-demo" id="dr-quiz-predict"></div>

Now send a signal to a qubit that starts in |0⟩. Every number is invented, and the counts are simulated.

<div class="qed-demo qed-dr" id="dr-explorer">
  <p class="qed-demo__step"><strong>1. Choose the direction of the signal</strong></p>
  <div class="qed-dr__group" role="radiogroup" aria-label="Direction of the signal" id="dr-direction"></div>
  <p class="qed-demo__step"><strong>2. Choose the strength</strong></p>
  <div class="qed-dr__group" role="radiogroup" aria-label="Strength of the signal" id="dr-strength"></div>
  <p class="qed-demo__step"><strong>3. Choose the length</strong></p>
  <div class="qed-dr__lenrow">
    <input type="range" id="dr-length-range" min="0" max="12" step="0.5" value="0" aria-label="Length of the signal, slider">
    <input type="number" id="dr-length-num" min="0" max="12" step="0.5" value="0" aria-label="Length of the signal, typed value">
    <button type="button" class="qed-button qed-button--secondary" id="dr-half">Try a half turn</button>
  </div>
  <p class="qed-dr__note" id="dr-length-note"></p>
  <p class="qed-demo__step"><strong>4. Does the qubit get what you set?</strong></p>
  <div class="qed-dr__group" role="radiogroup" aria-label="Does the qubit get what you set" id="dr-miscal"></div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="dr-reset">Reset</button>
  </div>
  <div class="qed-dr__panel">
    <p class="qed-dr__title">The signal <span class="qed-dr__tag">invented</span></p>
    <div id="dr-signal"></div>
    <p class="qed-dr__note" id="dr-signal-words"></p>
  </div>
  <div class="qed-dr__panel">
    <p class="qed-dr__title">The qubit <span class="qed-dr__tag">computed from a simplified model</span></p>
    <div class="qed-dr__cols">
      <div>
        <canvas id="dr-canvas" class="qed-dr__canvas" width="360" height="360" role="img" aria-label="Bloch sphere."></canvas>
      </div>
      <div>
        <p class="qed-dr__note" id="dr-readout"></p>
        <div id="dr-bars"></div>
        <p class="qed-dr__note" id="dr-outcome-words"></p>
      </div>
    </div>
  </div>
  <div class="qed-dr__panel">
    <p class="qed-dr__title">What an experiment would show <span class="qed-dr__tag">simulated</span></p>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button" id="dr-shots">Measure 100 shots</button>
      <button type="button" class="qed-button qed-button--secondary" id="dr-sweep">Measure at every length</button>
    </div>
    <div id="dr-counts"></div>
    <div id="dr-curve"></div>
    <p class="qed-dr__note" id="dr-sweep-words"></p>
    <details class="qed-details" markdown="1" id="dr-data">
      <summary>The curve as a table</summary>
      <div id="dr-data-table"></div>
    </details>
  </div>
  <p class="qed-dr__note" id="dr-live" role="status" aria-live="polite"></p>
</div>

Try a half turn and measure it. Then send a quarter turn and measure again. Last, press **Measure at every length**. The dots swing up to 100% and back down, and the circles follow the curve. That back-and-forth swing is called a **[Rabi oscillation](../glossary.md#rabi-oscillation)**. A real device runs this experiment to find out how long its own half turn takes. It is the first of the measurements that calibration repeats. This page runs it once and changes nothing in response.

<div class="qed-demo" id="dr-quiz-concept"></div>

<div class="qed-demo" id="dr-quiz-transfer"></div>

## Never Exactly Right

Switch on a miscalibration and send a half turn. The qubit gets a little less (or more) than you set, and it ends just short of |1⟩ or just past it. This table is computed from the same model:

<div class="qed-demo qed-dr" id="dr-miscal-table"></div>

Three things are worth noticing:

- **It is a fixed offset, not randomness.** It is the same every time, until the device is measured and set again.
- **The half turn moves.** With a signal 10% weaker than set, the half turn takes longer. With one 10% stronger, it takes less. Run the sweep under each setting and look at where the peak sits.
- **Real turns are never exact.** An over- or under-rotation is an error of the gate. A device has to measure its own half-turn length, and measure it again. A later page asks where such offsets come from and why they drift.

A signal that is not tuned to the step does less, which is why singling out two levels mattered on the last page. Showing that correctly takes a tilted axis, which belongs to later depth.

## Two Qubits: Why Coupling

One qubit's signal turns one qubit. A gate on **two** qubits needs them to affect each other, and that needs a physical link between them: **[coupling](../glossary.md#coupling)**.

Take two qubits, A and B. A starts as |0⟩ or |1⟩, and B starts as |0⟩. A signal is tuned to the step B has when A is |1⟩. With no coupling, that is B's only step.

<div class="qed-demo qed-dr" id="dr-coupling">
  <div class="qed-dr__group" role="radiogroup" aria-label="Coupling between the qubits" id="dr-coupling-btns"></div>
  <div id="dr-coupling-table"></div>
  <p class="qed-dr__note" id="dr-coupling-words" role="status" aria-live="polite"></p>
</div>

Without coupling, B's step does not depend on A, so the signal flips B whatever A is. With coupling, B's step depends on A, so the signal flips B only when A is |1⟩. A flip that depends on another qubit is a **conditional flip**, which is what a [CNOT](../glossary.md#cnot-gate) does.

This is one way to make a conditional gate, in some designs. Other platforms do it differently, through a shared motion or an excited state, and the platform pages show them. In every design, a two-qubit gate is usually slower and less exact than a one-qubit gate.

## Gates Take Time

A circuit diagram shows the **order** of operations. It does not show how long each one takes.

<div class="qed-demo qed-dr">
  <div id="dr-timeline"></div>
  <p class="qed-dr__note">The Bell circuit's three operations, in order. The lengths are invented. <span class="qed-dr__tag">invented</span></p>
</div>

On every platform the lengths differ, and the operations differ in length. As a tendency, a two-qubit gate takes longer than a one-qubit gate, and a readout takes longer than either. [Quantum Circuits](../02-fundamentals/quantum-circuits.md) said a diagram is not a timeline. This is why.

The qubit's state fades while all of this happens.

## What the Device Does Directly

A device does a few operations directly: its own turns and its own two-qubit interaction. Every other gate is built out of them. That is what makes a gate **[native](../glossary.md#native-gate)**. How software uses the list is the subject of [Module 05](../05-software-stack/index.md).

Starting from |0⟩, a quarter turn about y gives the same state an [H gate](../glossary.md#hadamard-gate) gives, which is why the Bell circuit's first gate is a short signal. For other starting states, H is a different move, built from the device's own turns.

<div class="qed-demo qed-dr">
  <div id="dr-bell"></div>
  <div class="qed-dr__strip">
    <div class="qed-dr__strip-item"><strong>H</strong> → a short signal</div>
    <div class="qed-dr__strip-item"><strong>CNOT</strong> → a coupled gate</div>
    <div class="qed-dr__strip-item"><strong>Measure</strong> → a readout</div>
  </div>
</div>

Readout is next.

## From Moving to Reading

Each of Module 02's assumptions about a gate has a physical counterpart:

<table class="qed-xf__table">
  <thead><tr><th scope="col">In Module 02, a gate</th><th scope="col">On a device</th></tr></thead>
  <tbody>
    <tr><th scope="row">Was a symbol</th><td data-label="On a device">A signal with a strength and a length</td></tr>
    <tr><th scope="row">Did exactly what its name said</th><td data-label="On a device">Makes a turn that is never exactly the one set</td></tr>
    <tr><th scope="row">Was exact</th><td data-label="On a device">Carries a fixed offset until the device is measured and set again</td></tr>
    <tr><th scope="row">Acted on any qubits the circuit named</th><td data-label="On a device">Needs the qubits to be coupled</td></tr>
    <tr><th scope="row">Was instant</th><td data-label="On a device">Takes time</td></tr>
  </tbody>
</table>

```
A GATE                      A GATE
A SYMBOL          →         A SIGNAL WITH A SIZE, A TIME, AND AN OFFSET
```

You can start a qubit and turn it to a state you choose, almost exactly.

> **How do you find out what state it ended up in?**

Reading a qubit is also a physical act, and it is imperfect. That is the next page.

**Next: Readout →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var D = window.QedDrive;
  var B = window.QedBloch;
  var S = window.QedShots;
  var N = window.QedNumbers;
  var Z = window.QedQuiz;
  var L = window.QedLadder;
  var QC = window.QedCircuit;
  if (!D || !B || !S || !N || !Z || !L || !QC) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function css(name, fallback) {
    var v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fallback;
  }
  function deg(x) { return String(Math.round(x * 10) / 10) + "°"; }

  function drawSphere(canvas, o) {
    var opts = {
      color: css("--md-default-fg-color", "#222"),
      neutral: css("--md-default-fg-color--light", "#888"),
      axes: true,
      projection: true,
      depth: true,
      pinned: { thetaDeg: 0, phiDeg: 0, label: "start |0⟩" }
    };
    canvas.setAttribute("aria-label", B.formatText(o.thetaDeg, o.phiDeg));
    B.render(canvas, o.thetaDeg, o.phiDeg, opts);
  }

  // ---- static pictures built from the shared modules ----
  $("dr-ladder").innerHTML = L.renderSVG(L.levels("clear", "medium"), { drive: true }) +
    '<p class="qed-dr__note">The invented system from the last page. The signal is tuned to the first step. <span class="qed-dr__tag">invented</span></p>';

  var quarter = { direction: "y", strength: "medium", length: 3 };
  $("dr-static-signal").innerHTML = D.signalSVG(quarter);
  var qo = D.outcome(quarter);
  drawSphere($("dr-static-sphere"), qo);
  $("dr-static-note").textContent = "The turn it makes: " + deg(qo.turn.set) + " about the y axis, so |0⟩ ends on the equator.";

  $("dr-miscal-table").innerHTML = (function () {
    var rows = D.halfTurnTable("medium").map(function (r) {
      return "<tr><th scope=\"row\">" + esc(r.label) + "</th>" +
        '<td data-label="Turn set">' + deg(r.set) + "</td>" +
        '<td data-label="Turn made">' + deg(r.made) + "</td>" +
        '<td data-label="Chance of reading 1">' + N.pct(r.p1, 1) + "</td>" +
        '<td data-label="Words">' + esc(r.words) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">The qubit gets</th><th scope="col">Turn set</th><th scope="col">Turn made</th><th scope="col">Chance of reading 1</th><th scope="col">Words</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p class="qed-dr__note">A medium signal of length ' + D.halfTurnLength("medium") + ', which is a half turn if the strength is exactly as set. <span class="qed-dr__tag">computed from a simplified model</span></p>';
  })();

  $("dr-timeline").innerHTML = D.timelineSVG();
  $("dr-bell").innerHTML = QC.renderSVG(QC.bell());

  // ---- Drive a Qubit ----
  var state = { direction: D.DEFAULTS.direction, strength: D.DEFAULTS.strength, length: D.DEFAULTS.length, miscalibration: D.DEFAULTS.miscalibration };
  var shotsRun = 0;
  var sweepRun = 0;
  var counts = null;
  var sweepResult = null;
  var lengthNote = "";

  function buildGroup(id, name, list, key, labelOf, onPick) {
    var box = $(id);
    box.innerHTML = list.map(function (item) {
      return '<label class="qed-dr__opt"><input type="radio" name="' + name + '" value="' + esc(item.id) + '"' +
        (state[key] === item.id ? " checked" : "") + "><span>" + esc(labelOf(item)) + "</span></label>";
    }).join("");
    Array.prototype.forEach.call(box.querySelectorAll("input"), function (input) {
      input.addEventListener("change", function () { onPick(input.value); });
    });
  }

  function setChecked(name, value) {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="' + name + '"]'), function (input) {
      input.checked = input.value === value;
    });
  }

  function syncLength() {
    $("dr-length-range").value = String(state.length);
    $("dr-length-num").value = String(state.length);
    $("dr-length-note").textContent = lengthNote;
  }

  function clearResults(keepSweep) {
    counts = null;
    if (!keepSweep) sweepResult = null;
  }

  function renderData() {
    if (!sweepResult) { $("dr-data-table").innerHTML = "<p>Run Measure at every length to fill this table.</p>"; return; }
    var rows = sweepResult.points.map(function (p) {
      return "<tr><th scope=\"row\">" + p.length + "</th>" +
        '<td data-label="Turn set">' + deg(p.set) + "</td>" +
        '<td data-label="Turn made">' + deg(p.made) + "</td>" +
        '<td data-label="Exact chance of 1">' + N.pct(p.exact, 1) + "</td>" +
        '<td data-label="Measured: 1s out of 100">' + p.ones + "</td></tr>";
    }).join("");
    $("dr-data-table").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Length</th><th scope="col">Turn set</th><th scope="col">Turn made</th><th scope="col">Exact chance of 1</th><th scope="col">Measured: 1s out of 100</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  function sweepWords() {
    if (!sweepResult) return "";
    var b = sweepResult.best;
    var where = b.tied.length === 1
      ? "at length " + b.length + " (" + b.ones + " of 100)"
      : "at " + b.tied.length + " lengths, from " + b.tied[0] + " to " + b.tied[b.tied.length - 1] + " (" + b.ones + " of 100 each), so the middle one, length " + b.length + ", is reported";
    var half = D.halfTurnLength(state.strength);
    return "The most 1s were seen " + where + ". The peak is flat, so neighbouring lengths look alike, and a finer sweep would narrow it down. If the strength were exactly as set, the half turn would be at length " + half + ". This page only reports a length: it does not change any setting.";
  }

  function render(announce) {
    var o = D.outcome(state);
    $("dr-signal").innerHTML = D.signalSVG(state);
    var t = o.turn;
    var m = D.miscalibrationById(state.miscalibration);
    $("dr-signal-words").textContent = "Turn set: " + deg(t.set) + " (strength " + t.rate + " per unit × length " + state.length + ")." +
      (t.madeRate !== t.rate ? " The qubit gets a turn of " + deg(t.made) + " (" + m.tag + "): " + D.errorWords(state) + "." : "");
    drawSphere($("dr-canvas"), o);
    var b = B.state(o.thetaDeg, o.phiDeg);
    $("dr-readout").textContent = "The point is " + deg(o.thetaDeg) + " from the top (|0⟩)" +
      (o.phiDefined ? ", at an angle of " + deg(o.phiDeg) + " around the equator" : "") + ". Chance of reading 0: " + N.pct(b.p0, 1) + ". Chance of reading 1: " + N.pct(b.p1, 1) + ".";
    $("dr-bars").innerHTML = S.renderBars([
      { label: "Reads 0", fraction: o.p0, text: N.pct(o.p0, 1), accent: "logical", labelWidth: "5rem" },
      { label: "Reads 1", fraction: o.p1, text: N.pct(o.p1, 1), accent: "logical", labelWidth: "5rem" }
    ]);
    var words = D.outcomeWords(o.p1);
    $("dr-outcome-words").textContent = (o.p1 >= 0.995 ? "✓ " : "") + "The qubit " + words + ".";
    $("dr-counts").innerHTML = counts
      ? '<p class="qed-dr__note"><strong>' + counts.shots + ' simulated shots:</strong> ' + counts.counts[0] + " read 0 and " + counts.counts[1] + " read 1. Samples differ from run to run, and press the button again for new ones.</p>" +
        S.renderBars([
          { label: "Read 0", fraction: counts.counts[0] / counts.shots, text: String(counts.counts[0]), accent: "logical", labelWidth: "5rem" },
          { label: "Read 1", fraction: counts.counts[1] / counts.shots, text: String(counts.counts[1]), accent: "logical", labelWidth: "5rem" }
        ])
      : "";
    $("dr-curve").innerHTML = D.curveSVG(state, sweepResult) +
      '<p class="qed-dr__note">The line is the exact chance of reading 1' + (sweepResult ? "; the open circles are the measured shares." : ". Press Measure at every length to add measured shares.") + "</p>";
    $("dr-sweep-words").textContent = sweepWords();
    renderData();
    syncLength();
    if (announce) {
      $("dr-live").textContent = "Turn set " + deg(t.set) + ". Turn made " + deg(t.made) + ". Chance of reading 1: " + N.pct(o.p1, 1) + ". The qubit " + words + ".";
    }
  }

  if ($("dr-explorer")) {
    buildGroup("dr-direction", "dr-direction", D.DIRECTIONS, "direction", function (d) { return d.label; }, function (v) { state.direction = v; clearResults(false); render(true); });
    buildGroup("dr-strength", "dr-strength", D.STRENGTHS, "strength", function (s) { return s.label + " (" + s.rate + ")"; }, function (v) { state.strength = v; clearResults(false); render(true); });
    buildGroup("dr-miscal", "dr-miscal", D.MISCALIBRATIONS, "miscalibration", function (m) { return m.label; }, function (v) { state.miscalibration = v; clearResults(false); render(true); });

    function setLength(raw) {
      var n = Number(raw);
      var snapped = D.snapLength(raw);
      lengthNote = (isFinite(n) && (n < 0 || n > D.LENGTH_MAX)) ? "The length runs from 0 to " + D.LENGTH_MAX + ", so " + snapped + " is used." : "";
      state.length = snapped;
      clearResults(true);
      render(true);
    }
    $("dr-length-range").addEventListener("input", function () { setLength($("dr-length-range").value); });
    $("dr-length-num").addEventListener("change", function () { setLength($("dr-length-num").value); });
    $("dr-half").addEventListener("click", function () { setLength(D.halfTurnLength(state.strength)); });
    $("dr-shots").addEventListener("click", function () {
      shotsRun++;
      counts = D.measure(state, 100 + shotsRun);
      render(false);
      $("dr-live").textContent = counts.shots + " simulated shots: " + counts.counts[0] + " read 0 and " + counts.counts[1] + " read 1.";
    });
    $("dr-sweep").addEventListener("click", function () {
      sweepRun++;
      sweepResult = D.sweep(state, 500 + sweepRun);
      render(false);
      $("dr-live").textContent = "Measured at 25 lengths. The middle of the lengths with the most 1s is " + sweepResult.best.length + ".";
    });
    $("dr-reset").addEventListener("click", function () {
      state.direction = D.DEFAULTS.direction;
      state.strength = D.DEFAULTS.strength;
      state.length = D.DEFAULTS.length;
      state.miscalibration = D.DEFAULTS.miscalibration;
      lengthNote = "";
      counts = null;
      sweepResult = null;
      shotsRun = 0;
      sweepRun = 0;
      setChecked("dr-direction", state.direction);
      setChecked("dr-strength", state.strength);
      setChecked("dr-miscal", state.miscalibration);
      render(true);
    });
    render(false);
  }

  // ---- Two Qubits: Why Coupling ----
  var couplingOn = false;
  function renderCoupling(announce) {
    $("dr-coupling-table").innerHTML = D.couplingHTML(couplingOn);
    $("dr-coupling-words").textContent = D.coupling(couplingOn).words;
  }
  if ($("dr-coupling")) {
    var cbox = $("dr-coupling-btns");
    cbox.innerHTML = [{ id: "off", label: "Coupling off" }, { id: "on", label: "Coupling on" }].map(function (it) {
      return '<label class="qed-dr__opt"><input type="radio" name="dr-coupling" value="' + it.id + '"' + (it.id === "off" ? " checked" : "") + "><span>" + it.label + "</span></label>";
    }).join("");
    Array.prototype.forEach.call(cbox.querySelectorAll("input"), function (input) {
      input.addEventListener("change", function () { couplingOn = input.value === "on"; renderCoupling(true); });
    });
    renderCoupling(false);
  }

  // ---- Checks ----
  Z.mount($("dr-quiz-predict"), { title: "Predict", items: [{
    label: "What doubling the length does to the turn",
    prompt: "You keep the strength the same and double the length of the signal. What happens to the turn? Pick one, then try it in the explorer.",
    options: [
      { label: "It doubles", correct: true, why: "The rectangle is twice as wide and just as tall, so its area, the turn, is twice as large." },
      { label: "It stays the same", correct: false, why: "A longer signal acts on the qubit for longer, so it turns it further." },
      { label: "It halves", correct: false, why: "Halving the turn would need a shorter signal, not a longer one." }
    ]
  }] });

  Z.mount($("dr-quiz-concept"), { title: "Check", items: [{
    label: "Whether a circuit diagram shows how long each operation takes",
    prompt: "A circuit diagram shows an H, a CNOT, and a measurement in a row. Does it tell you how long each takes?",
    options: [
      { label: "Yes, the diagram is drawn to a time scale", correct: false, why: "A diagram shows the order of the operations. It is not drawn to a time scale." },
      { label: "No, it shows the order, and each takes a different time on a device", correct: true, why: "A one-qubit signal, a two-qubit gate, and a readout differ in length, and they differ from platform to platform." },
      { label: "Yes, each operation takes the same time", correct: false, why: "They do not. A two-qubit gate usually takes longer than a one-qubit gate, and a readout usually longer than either." }
    ]
  }] });

  Z.mount($("dr-quiz-transfer"), { title: "Transfer", items: [{
    label: "Where a half turn ends when the qubit gets 10% less strength than set",
    prompt: "You set a half turn, but the qubit gets 10% less strength than you set. Where does it end up?",
    options: [
      { label: "Exactly on |1⟩", correct: false, why: "A turn that is 10% short is not a half turn. Try it in the explorer with a miscalibration." },
      { label: "A little short of |1⟩, so most runs read 1 and a few read 0", correct: true, why: "The turn made is 162° instead of 180°, so the chance of reading 1 is about 97.6%, not 100%." },
      { label: "Back at |0⟩", correct: false, why: "It still turns most of the way. A 10% offset leaves it close to |1⟩, not at |0⟩." }
    ]
  }, {
    label: "Whether a miscalibration is random",
    prompt: "Is that offset random?",
    options: [
      { label: "Yes, it changes every time you run it", correct: false, why: "The offset is fixed. Only the counts you sample from it vary from run to run." },
      { label: "No, it is the same every time until the device is measured and set again", correct: true, why: "That is why it can be measured and corrected, and why a device has to measure its own half turn." },
      { label: "No, it only happens at the half turn", correct: false, why: "It scales every turn the qubit makes, whatever the length. The half turn is just the easiest place to see it." }
    ]
  }] });
});
</script>
