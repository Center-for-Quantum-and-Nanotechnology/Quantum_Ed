# Noise

Module 02's operations were exact and its numbers were certain. On a device, several sources disturb every operation, and the figure a device reports is one measured number for all of them. Where do they come from, and why does the device have to be tuned again and again?

## From Keeping to Everything Else

[Coherence](coherence.md) ended with a qubit that starts, is turned, is read, and is kept, each only to a point.

> **Where does the rest of the imperfection come from?**

From several different sources at once, and they do not stand still. This page is the physical side of Module 02's assumption that operations are exact.

## Five Kinds of Source

An operation can go wrong for five different reasons. You have met the effect of each one already:

<div class="qed-demo qed-no" id="no-sources-table"></div>

**[Noise](../glossary.md#quantum-noise)** is the general word for all of them together. The spread of the readout signal on the Readout page and the loss of energy and phase on the Coherence page are two examples. [Crosstalk](../glossary.md#crosstalk) is the unintended interaction between neighbours, and it is not the same thing as the intended [coupling](../glossary.md#coupling) that makes a two-qubit gate. This page names no materials and no causes.

## Source, Error, Reported Figure

Three things are easy to mix up. Here is each one, for the two-qubit gate on Qubit A, from the model:

<table class="qed-xf__table">
  <thead><tr><th scope="col">Word</th><th scope="col">What it is</th><th scope="col">For example</th></tr></thead>
  <tbody>
    <tr><th scope="row">A source</th><td data-label="What it is">What disturbs</td><td data-label="For example">The environment</td></tr>
    <tr><th scope="row">An error</th><td data-label="What it is">The share of runs of this operation that go wrong because of that source</td><td data-label="For example"><span id="no-ex-error">about 1%</span> of the runs</td></tr>
    <tr><th scope="row">A reported figure</th><td data-label="What it is">What a device measures by repeating the operation and counting how often it went right</td><td data-label="For example">A gate fidelity of <span id="no-ex-fidelity">about 97%</span></td></tr>
  </tbody>
</table>

They are three different things, and Module 07 reuses the distinction. Module 07 has names for the kinds of error these sources cause (bit-flip, phase-flip, Pauli, and depolarizing are among them) and [models](../glossary.md#noise-model) that put numbers on them. This page does not teach them. The page calls the reported number a **reported figure**, which is the reported metric of [Module 05](../05-software-stack/index.md).

## Error Budget

First, a prediction.

<div class="qed-demo" id="no-quiz-predict"></div>

Now pick a qubit and an operation: the Bell circuit's three operations, with the invented lengths from the timeline on the Gates and Control page. Every number is invented, and the figures are simulated.

<div class="qed-demo qed-no" id="no-explorer">
  <p class="qed-demo__step"><strong>1. Choose a qubit</strong></p>
  <div class="qed-no__group" role="radiogroup" aria-label="Qubit" id="no-qubit"></div>
  <p class="qed-demo__step"><strong>2. Choose an operation</strong></p>
  <div class="qed-no__group" role="radiogroup" aria-label="Operation" id="no-operation"></div>
  <p class="qed-demo__step"><strong>3. Switch sources on and off</strong></p>
  <div class="qed-no__group" role="group" aria-label="Sources" id="no-sources"></div>
  <p class="qed-no__note">Switching a source off is something only this model can do. A real device cannot remove a source.</p>
  <p class="qed-demo__step"><strong>4. Move time forward</strong></p>
  <div class="qed-dr__lenrow">
    <input type="range" id="no-time-range" min="0" max="48" step="1" value="0" aria-label="Time now, slider">
    <input type="number" id="no-time-num" min="0" max="48" step="1" value="0" aria-label="Time now, typed value">
  </div>
  <p class="qed-no__note" id="no-time-note"></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="no-reset">Reset</button>
  </div>
  <div class="qed-no__panel">
    <p class="qed-no__title">The error budget <span class="qed-no__tag">invented</span> <span class="qed-no__tag">computed from a simplified model</span></p>
    <div class="qed-no__budget" id="no-bars"></div>
    <p class="qed-no__note">The full width of a bar is a 15% error.</p>
    <p class="qed-no__note" id="no-words"></p>
    <div id="no-drift"></div>
    <p class="qed-no__note" id="no-drift-words"></p>
  </div>
  <div class="qed-no__panel">
    <p class="qed-no__title">What an experiment would show <span class="qed-no__tag">simulated</span></p>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button" id="no-figure-btn">Measure the reported figure</button>
      <button type="button" class="qed-button qed-button--secondary" id="no-tune-btn">Recalibrate</button>
    </div>
    <div id="no-figure"></div>
    <div id="no-tune"></div>
    <details class="qed-details" markdown="1" id="no-data">
      <summary>The numbers as tables</summary>
      <div id="no-data-table"></div>
    </details>
  </div>
  <p class="qed-no__note" id="no-live" role="status" aria-live="polite"></p>
</div>

Start with the one-qubit signal on Qubit A. Its largest source is <span id="no-start-largest">one of the five</span>. Then move the time slider forward: its control error grows, and by the end <span id="no-end-largest">a different source</span> is the largest. Press **Recalibrate** at a late time, and the control error falls back. Then switch to the two-qubit gate, and then to the readout, and watch the largest source change. The reported figure is one number: it cannot say which source was largest.

<div class="qed-demo" id="no-quiz-concept"></div>

<div class="qed-demo" id="no-quiz-transfer"></div>

## Why Qubits Differ

The three qubits differ in what you have just seen: their times, how fast their strength drifts, and how much their neighbours and leakage disturb them.

<div class="qed-demo qed-no" id="no-qubits-table"></div>

Engineered qubits are never exactly alike, as [Physical Qubits](physical-qubits.md) said. Real qubits on one device differ from one another, and their numbers change. A software layer is told the differences, which is [Module 05](../05-software-stack/index.md). This page makes no claim about how much they differ, or about any platform.

## Why a Device Drifts, and the Loop

The explorer showed one setting drifting: the strength a qubit gets for a given signal. It shifts slowly, so the offset since the last tune grows, so the device measures it again. The settings of the control equipment and the qubit's own properties shift slowly with their surroundings, which nobody holds perfectly still. This page names no cause.

The drift in the explorer is a **teaching model**: a steady drift in each qubit's own direction. Real drift is not steady, depends on the platform and the setting, and has no universal rate, as [Hardware-Aware QEC](../07-error-correction/hardware-aware-qec.md) also says.

A device does the same five things, again and again:

```
MEASURE → SET → USE → DRIFT → MEASURE AGAIN
```

It re-runs the experiments from the earlier pages:

<div class="qed-demo qed-no" id="no-remeasured-table"></div>

**Recalibrate** re-ran the drive-and-flip experiment at the strength in force and stored the length it found. The error fell, but not to zero: the peak is flat, there are only 100 shots, and the lengths are 0.5 apart. A tune is itself a measurement, so it leaves a residual. A dated report of such values is a **[calibration snapshot](../glossary.md#calibration-snapshot)**, and what software does with it is [Module 05](../05-software-stack/hardware-abstraction-and-backend-capabilities.md). This page gives no schedule for how often a device does it.

## A Number Is Not a Guarantee

The reported figure is one number for all the sources. It comes from a count, so it moves from run to run, and it describes one moment. A metric is not a guarantee, as [Hardware Abstraction](../05-software-stack/hardware-abstraction-and-backend-capabilities.md) also says. A device cannot switch a source off to find which dominates, so it runs more experiments. One such method is called randomized benchmarking, which is for a later level.

> **Two devices report the same fidelity. Do they fail in the same way?**

No. Their budgets can differ, and the figure cannot show it.

## What Fundamentals Added Up To

The five needs from [Physical Qubits](physical-qubits.md), each with how it goes wrong:

<table class="qed-xf__table">
  <thead><tr><th scope="col">A real qubit has to</th><th scope="col">How it goes wrong</th><th scope="col">Shown on</th></tr></thead>
  <tbody>
    <tr><th scope="row"><strong>Start</strong> in a known state</th><td data-label="How it goes wrong">Never perfectly known, and heat jostles it</td><td data-label="Shown on">Physical Qubits</td></tr>
    <tr><th scope="row"><strong>Control</strong>: be turned as set</th><td data-label="How it goes wrong">A turn is never exactly the one set, and its strength drifts</td><td data-label="Shown on">Gates and Control, and here</td></tr>
    <tr><th scope="row"><strong>Connect</strong> to others when we want</th><td data-label="How it goes wrong">Coupling is intended, and crosstalk is not</td><td data-label="Shown on">Gates and Control, and here</td></tr>
    <tr><th scope="row"><strong>Read</strong>: give a signal we can read</th><td data-label="How it goes wrong">The signals overlap, and the misreads differ for 0 and 1</td><td data-label="Shown on">Readout</td></tr>
    <tr><th scope="row"><strong>Keep</strong> its state long enough</th><td data-label="How it goes wrong">Energy and phase fade at different speeds</td><td data-label="Shown on">Coherence</td></tr>
  </tbody>
</table>

The one-qubit thread, start, drive, wait, and read, is now complete. The Bell circuit's three operations carry the thread from here.

## From One Qubit to Different Qubits

Each of Module 02's assumptions about an operation has a physical counterpart:

<table class="qed-xf__table">
  <thead><tr><th scope="col">In Module 02, an operation</th><th scope="col">On a device</th></tr></thead>
  <tbody>
    <tr><th scope="row">Was exact</th><td data-label="On a device">Is disturbed by several sources at once</td></tr>
    <tr><th scope="row">Had no errors</th><td data-label="On a device">Goes wrong for a share of its runs, source by source</td></tr>
    <tr><th scope="row">Had certain numbers</th><td data-label="On a device">Has one measured figure, with scatter, at one moment</td></tr>
    <tr><th scope="row">Had fixed settings</th><td data-label="On a device">Has settings that drift, and are measured and set again</td></tr>
    <tr><th scope="row">Was the same on every qubit</th><td data-label="On a device">Differs from qubit to qubit</td></tr>
  </tbody>
</table>

```
AN OPERATION                 AN OPERATION
EXACT               →        SEVERAL SOURCES, ONE MEASURED FIGURE,
                             SETTINGS THAT DRIFT, AND QUBITS THAT DIFFER
```

A qubit has to be started, controlled, connected, read, and kept. Each of these goes wrong in its own way, and each setting drifts. But the answers depend on what the qubit is made of.

> **How do different physical systems answer?**

The same five needs, answered by different physical systems, with different trade-offs. That is the next group of pages.

**Next: [Superconducting Qubits →](superconducting-qubits.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var N = window.QedNoise;
  var S = window.QedShots;
  var NU = window.QedNumbers;
  var Z = window.QedQuiz;
  if (!N || !S || !NU || !Z) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- tables and numbers built from the shared module ----
  $("no-sources-table").innerHTML = N.sourcesHTML();
  $("no-qubits-table").innerHTML = N.qubitsHTML() +
    '<p class="qed-no__note">The times are the ones from the Coherence page, and every other number is invented. <span class="qed-no__tag">invented</span></p>';
  $("no-remeasured-table").innerHTML = N.remeasuredHTML();
  (function () {
    var rows = N.shares({ qubit: "a", operation: "gate2", time: 0 });
    var env = rows.filter(function (r) { return r.id === "environment"; })[0].share;
    $("no-ex-error").textContent = "about " + NU.pct(env, 1);
    $("no-ex-fidelity").textContent = "about " + NU.pct(N.fidelity(N.combine(rows)), 1);
    function largest(time) { return N.sourceById(N.dominant(N.shares({ qubit: "a", operation: "drive", time: time })).ids[0]).label.toLowerCase(); }
    $("no-start-largest").textContent = largest(0);
    $("no-end-largest").textContent = largest(N.TIME_MAX);
  })();

  // ---- Error Budget ----
  var ORDER = N.QUBITS.map(function (q) { return q.id; });
  var tunesByQubit = {};
  function resetTunes() {
    ORDER.forEach(function (q) { tunesByQubit[q] = N.initialTunes(q, 2000); });
  }
  resetTunes();

  var state = { qubit: N.DEFAULTS.qubit, operation: N.DEFAULTS.operation, time: N.DEFAULTS.time, on: N.allOn() };
  var figureRun = 0;
  var tuneRun = 0;
  var figure = null;
  var lastTune = null;
  var timeNote = "";

  function settings() {
    return { qubit: state.qubit, operation: state.operation, time: state.time, on: state.on, tunes: tunesByQubit[state.qubit] };
  }

  function buildRadio(id, name, list, key, labelOf, onPick) {
    var box = $(id);
    box.innerHTML = list.map(function (item) {
      return '<label class="qed-no__opt"><input type="radio" name="' + name + '" value="' + esc(item.id) + '"' +
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

  // The checkboxes for the five sources. One that does not apply to the chosen operation is
  // shown, disabled, and says so.
  function buildSources() {
    var rows = N.shares(settings());
    $("no-sources").innerHTML = rows.map(function (r) {
      return '<label class="qed-no__opt qed-no__src' + (r.applies ? "" : " qed-no__src--na") + '"><input type="checkbox" value="' + esc(r.id) + '"' +
        (r.on && r.applies ? " checked" : "") + (r.applies ? "" : " disabled") + "><span>" + esc(r.label) + (r.applies ? "" : " (not applicable)") + "</span></label>";
    }).join("");
    Array.prototype.forEach.call($("no-sources").querySelectorAll("input"), function (input) {
      input.addEventListener("change", function () {
        state.on[input.value] = input.checked;
        clearResults();
        render(true, false);
      });
    });
  }

  function clearResults() {
    figure = null;
    lastTune = null;
  }

  function renderData() {
    var s = settings();
    var rows = N.shares(s);
    var body = rows.map(function (r) {
      return "<tr><th scope=\"row\">" + esc(r.label) + "</th><td data-label=\"Error share\">" + (!r.applies ? "not applicable" : r.on ? N.pctText(r.share) : "off") + "</td></tr>";
    }).join("");
    var html = '<table class="qed-xf__table"><thead><tr><th scope="col">Source</th><th scope="col">Error share</th></tr></thead><tbody>' + body +
      '<tr><th scope="row">Total of the sources that are on</th><td data-label="Error share">' + N.pctText(N.combine(rows)) + "</td></tr></tbody></table>";
    var curve = N.driftCurve(s);
    var times = [0, 12, 24, 36, 48].map(function (t) {
      return "<tr><th scope=\"row\">" + t + "</th><td data-label=\"Control error of the one-qubit signal\">" + N.pctText(curve[t].error) + "</td></tr>";
    }).join("");
    html += '<table class="qed-xf__table"><thead><tr><th scope="col">Time</th><th scope="col">Control error of the one-qubit signal</th></tr></thead><tbody>' + times + "</tbody></table>";
    $("no-data-table").innerHTML = html;
  }

  function render(announce, rebuildSources) {
    var s = settings();
    if (rebuildSources !== false) buildSources();
    var rows = N.budgetRows(s);
    $("no-bars").innerHTML = S.renderBars(rows.map(function (r) {
      return { label: r.label, fraction: r.fraction, text: r.text, accent: r.accent, labelWidth: "6.5rem" };
    }));
    $("no-words").textContent = N.budgetWords(s);
    $("no-drift").innerHTML = N.driftSVG(s);
    $("no-drift-words").textContent = "The line is the control error of the one-qubit signal. It is solid up to the time now, and dashed after it, where it shows what would happen if the qubit were not tuned again. A gray tick marks each tune.";
    $("no-figure").innerHTML = figure
      ? '<div class="qed-ro__reported"><strong>Reported figure, measured by repeating the operation <span class="qed-no__tag">simulated</span></strong>' +
        esc("Of " + figure.runs + " runs, " + figure.right + " went right, so the reported figure is " + NU.pct(figure.share, 1) + ". The model's own value was " + NU.pct(figure.exact, 1) + ". The figure moves from run to run. It is one number for all the sources that are on, so it cannot say which was largest. It is a measurement at one moment, not a guarantee.") + "</div>"
      : "";
    $("no-tune").innerHTML = lastTune
      ? '<p class="qed-no__note"><strong>Simulated.</strong> ' + esc(N.tuneWords(lastTune)) + "</p>"
      : "";
    renderData();
    $("no-time-range").value = String(state.time);
    $("no-time-num").value = String(state.time);
    $("no-time-note").textContent = timeNote || "The last tune was at time " + N.tuneAt(tunesByQubit[state.qubit], state.time).time + ".";
    if (announce) $("no-live").textContent = N.budgetWords(s);
  }

  if ($("no-explorer")) {
    buildRadio("no-qubit", "no-qubit", N.QUBITS, "qubit", function (q) { return q.label; }, function (v) { state.qubit = v; clearResults(); render(true); });
    buildRadio("no-operation", "no-operation", N.OPERATIONS, "operation", function (o) { return o.label; }, function (v) { state.operation = v; clearResults(); render(true); });

    function setTime(raw) {
      var n = Number(raw);
      var snapped = N.snapTime(raw);
      timeNote = (isFinite(n) && (n < 0 || n > N.TIME_MAX)) ? "The time runs from 0 to " + N.TIME_MAX + ", so " + snapped + " is used." : "";
      state.time = snapped;
      clearResults();
      render(true, false);
    }
    $("no-time-range").addEventListener("input", function () { setTime($("no-time-range").value); });
    $("no-time-num").addEventListener("change", function () { setTime($("no-time-num").value); });
    $("no-figure-btn").addEventListener("click", function () {
      figureRun++;
      figure = N.measureFigure(settings(), 2200 + figureRun);
      render(false, false);
      $("no-live").textContent = "Reported figure from " + figure.runs + " simulated runs: " + NU.pct(figure.share, 1) + ".";
    });
    $("no-tune-btn").addEventListener("click", function () {
      tuneRun++;
      var s = settings();
      var t = N.tune(s, 2100 + tuneRun);
      // a tune made now replaces any later ones, and takes effect from now on
      tunesByQubit[state.qubit] = s.tunes.filter(function (x) { return x.time < t.time; }).concat([{ time: t.time, length: t.length }]);
      figure = null;
      lastTune = t;
      render(false, false);
      $("no-live").textContent = N.tuneWords(t) + " " + N.budgetWords(settings());
    });
    $("no-reset").addEventListener("click", function () {
      state.qubit = N.DEFAULTS.qubit;
      state.operation = N.DEFAULTS.operation;
      state.time = N.DEFAULTS.time;
      state.on = N.allOn();
      timeNote = "";
      figure = null;
      lastTune = null;
      figureRun = 0;
      tuneRun = 0;
      resetTunes();
      setChecked("no-qubit", state.qubit);
      setChecked("no-operation", state.operation);
      render(true);
    });
    render(false);
  }

  // ---- Checks ----
  Z.mount($("no-quiz-predict"), { title: "Predict", items: [{
    label: "What moving time forward does to the control error",
    prompt: "You move time forward without recalibrating. Does the control error for the two-qubit gate on Qubit B go up, go down, or stay the same? Pick one, then try it in the explorer.",
    options: [
      { label: "It goes up", correct: true, why: "Qubit B's strength drifts, so the offset from the setting stored at the last tune grows, and the control error grows with it." },
      { label: "It goes down", correct: false, why: "Nothing has measured and set the strength again, so the offset can only grow. Only a tune brings it down." },
      { label: "It stays the same", correct: false, why: "The strength drifts a little every step, so the offset is not fixed." }
    ]
  }] });

  Z.mount($("no-quiz-concept"), { title: "Check", items: [{
    label: "Whether a reported figure says which source caused the errors",
    prompt: "A device reports 99% for an operation. Does that tell you which source caused the other 1%?",
    options: [
      { label: "Yes, the figure is made from the biggest source", correct: false, why: "A reported figure is not made from one source. It lumps all of them together." },
      { label: "No, it is one number for all the sources together, and finding which dominates takes more experiments", correct: true, why: "That is why the figure can hide the budget, and why two devices with the same figure can fail in different ways." },
      { label: "Yes, a device can switch each source off in turn", correct: false, why: "Only the model can switch a source off. A real device cannot remove a source." }
    ]
  }] });

  Z.mount($("no-quiz-transfer"), { title: "Transfer", items: [{
    label: "What to suspect when a gate gets worse but T1 has not changed",
    prompt: "A device was tuned this morning. This afternoon its two-qubit gate is worse, but its T1 has not changed. What would you suspect, and what would you do?",
    options: [
      { label: "A setting has drifted, probably the control, so measure it again and set it again", correct: true, why: "A control setting shifts slowly with time, and the loop of measure, set, use, drift, and measure again brings it back." },
      { label: "The qubit has lost its energy faster, so wait for it to recover", correct: false, why: "T1 has not changed, so the energy loss is the same. Waiting does not undo a drifted setting." },
      { label: "Nothing, a reported figure never changes", correct: false, why: "A figure describes one moment. Settings drift, which is why a device is measured and tuned again and again." }
    ]
  }, {
    label: "Whether a tune makes the error zero",
    prompt: "Does re-tuning make the error zero?",
    options: [
      { label: "Yes, it sets the strength exactly", correct: false, why: "A tune is itself a measurement, from 100 shots at lengths 0.5 apart, so it leaves a small residual." },
      { label: "No, the tune is a measurement and leaves a residual, and the setting drifts again", correct: true, why: "Try Recalibrate in the explorer and read the offset left over." },
      { label: "No, a tune only changes the reported figure", correct: false, why: "A tune changes the stored setting itself, so the control error really falls. The reported figure is only a measurement of that." }
    ]
  }] });
});
</script>
