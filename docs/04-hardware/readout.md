# Readout

In Module 02 a measurement always told the truth. On a device, a measurement is a signal that has to be sorted into 0 or 1, and some of it gets sorted wrongly.

## From Turning to Reading

[Gates and Control](gates-and-control.md) ended with a qubit that starts in |0⟩, a control signal that turns it, and a state you can choose almost exactly.

> **How do you find out what state it ended up in?**

You do not look at it. A device detects a signal that depends on the state. This page is the physical side of [Measurement](../02-fundamentals/measurement.md).

## A Difference You Can Detect

The state itself cannot be seen. A **readout** works by making the two states give different physical signals. A qubit in 0 gives one kind of signal, and a qubit in 1 gives another.

<div class="qed-demo qed-ro">
  <svg class="qed-ro__svg" viewBox="0 0 360 150" role="img" aria-label="Two rows. The 0 level sends a lower signal to a detector. The 1 level sends a higher signal to a detector. The signal values are invented." xmlns="http://www.w3.org/2000/svg">
    <defs><marker id="qed-ro-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" class="qed-ro__diff-head"/></marker></defs>
    <rect class="qed-ro__diff-level" x="12" y="14" width="70" height="40" rx="3"/>
    <text class="qed-ro__text" x="47" y="40" text-anchor="middle">|0⟩</text>
    <line class="qed-ro__diff-arrow" x1="86" y1="34" x2="136" y2="34" marker-end="url(#qed-ro-head)"/>
    <rect class="qed-ro__diff-box" x="140" y="14" width="208" height="40" rx="3"/>
    <text class="qed-ro__text qed-ro__text--readout" x="244" y="40" text-anchor="middle">a lower signal</text>
    <rect class="qed-ro__diff-level" x="12" y="84" width="70" height="40" rx="3"/>
    <text class="qed-ro__text" x="47" y="110" text-anchor="middle">|1⟩</text>
    <line class="qed-ro__diff-arrow" x1="86" y1="104" x2="136" y2="104" marker-end="url(#qed-ro-head)"/>
    <rect class="qed-ro__diff-box" x="140" y="84" width="208" height="40" rx="3"/>
    <text class="qed-ro__text qed-ro__text--readout" x="244" y="110" text-anchor="middle">a higher signal</text>
    <text class="qed-ro__text qed-ro__text--tick" x="180" y="146" text-anchor="middle">the arrow runs from the qubit to the detector</text>
  </svg>
  <p class="qed-ro__note">The levels and the signals are invented. <span class="qed-ro__tag">invented</span></p>
</div>

The control signal on the last page went **in**. This one comes **back**. What changes is different on every platform. Here are three, named and not explained:

<table class="qed-xf__table">
  <thead><tr><th scope="col">What changes</th><th scope="col">Used by</th><th scope="col">Taken up in</th></tr></thead>
  <tbody>
    <tr><th scope="row">Light is scattered, or it is not</th><td data-label="Used by">Ions, and atoms (by imaging)</td><td data-label="Taken up in">Trapped-Ion Qubits</td></tr>
    <tr><th scope="row">A circuit's response changes slightly</th><td data-label="Used by">Superconducting circuits</td><td data-label="Taken up in">Superconducting Qubits</td></tr>
    <tr><th scope="row">A detector clicks, or it does not</th><td data-label="Used by">Photons</td><td data-label="Taken up in">Photonic Qubits</td></tr>
  </tbody>
</table>

The signal axis on this page is invented. It belongs to no platform.

## A Signal That Is Never the Same Twice

Read the same state again and the signal from the qubit comes out a little different. So each state gives not one value but a **spread** of values, shaped like a bell. Here are the two spreads for a qubit that started in 0 and a qubit that started in 1. They overlap.

<div class="qed-demo qed-ro">
  <div id="ro-static"></div>
  <p class="qed-ro__note">Two bell-shaped signals, close together. The axis and the values are invented. <span class="qed-ro__tag">invented</span></p>
</div>

The variation from read to read is **noise**. The page uses three words, and the next pages tell them apart:

<table class="qed-xf__table">
  <thead><tr><th scope="col">What happens</th><th scope="col">It is called</th></tr></thead>
  <tbody>
    <tr><th scope="row">The signal varies from shot to shot</th><td data-label="It is called">Noise</td></tr>
    <tr><th scope="row">So some reads give the wrong answer</th><td data-label="It is called">A readout error</td></tr>
    <tr><th scope="row">The share of reads that are right is the number a device reports</th><td data-label="It is called">Readout fidelity</td></tr>
  </tbody>
</table>

A wrong answer from a readout is a **[readout error](../glossary.md#readout-error)**, and the share that are right is its **[readout fidelity](../glossary.md#readout-fidelity)**.

!!! question "If a signal falls in the overlap, which state gave it?"
    Either. A signal in the overlap could have come from a 0 or from a 1, so it cannot be sorted with certainty.

## Read the Signal

First, a prediction.

<div class="qed-demo" id="ro-quiz-predict"></div>

Now set up a readout. The two signals sit on an invented axis. A **[readout threshold](../glossary.md#readout-threshold)** sorts each signal: above it is read as 1, and at or below it is read as 0. This is a different thing from the error-correction threshold of [Module 07](../07-error-correction/index.md). Every number is invented, and the counts are simulated.

<div class="qed-demo qed-ro" id="ro-explorer">
  <p class="qed-demo__step"><strong>1. Choose the state the qubit is in when the read begins</strong></p>
  <div class="qed-ro__group" role="radiogroup" aria-label="State when the read begins" id="ro-prepared"></div>
  <p class="qed-demo__step"><strong>2. Choose how different the two signals are</strong></p>
  <div class="qed-ro__group" role="radiogroup" aria-label="How different the two signals are" id="ro-separation"></div>
  <p class="qed-demo__step"><strong>3. Choose whether a 1 can fall back during a slow read</strong></p>
  <div class="qed-ro__group" role="radiogroup" aria-label="Slow-read fall-back" id="ro-fallback"></div>
  <p class="qed-demo__step"><strong>4. Move the readout threshold</strong></p>
  <div class="qed-ro__thrrow">
    <input type="range" id="ro-threshold-range" min="0" max="12" step="0.25" value="4" aria-label="Readout threshold, slider">
    <input type="number" id="ro-threshold-num" min="0" max="12" step="0.25" value="4" aria-label="Readout threshold, typed value">
  </div>
  <p class="qed-ro__note" id="ro-threshold-note"></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="ro-reset">Reset</button>
  </div>
  <div class="qed-ro__panel">
    <p class="qed-ro__title">The two signals and the readout threshold <span class="qed-ro__tag">invented</span> <span class="qed-ro__tag">computed from a simplified model</span></p>
    <div id="ro-signal"></div>
    <div id="ro-bars"></div>
    <p class="qed-ro__note" id="ro-shares-words"></p>
  </div>
  <div class="qed-ro__panel">
    <p class="qed-ro__title">What an experiment would show <span class="qed-ro__tag">simulated</span></p>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button" id="ro-shots">Read 100 shots</button>
      <button type="button" class="qed-button qed-button--secondary" id="ro-sweep">Find a threshold</button>
    </div>
    <div id="ro-counts"></div>
    <div id="ro-dots"></div>
    <div id="ro-table"></div>
    <div id="ro-sweep-box"></div>
    <div id="ro-reported"></div>
    <details class="qed-details" markdown="1" id="ro-data">
      <summary>The numbers as tables</summary>
      <div id="ro-data-table"></div>
    </details>
  </div>
  <p class="qed-ro__note" id="ro-live" role="status" aria-live="polite"></p>
</div>

Read 100 shots with the default settings. The marks that sit on the wrong side of the dashed line are the misreads. Then drag the readout threshold to the middle of the two signals and read again. Last, press **Find a threshold**. A device never sees which of its reads were wrong, so it finds a good threshold the way you just did: it prepares a known state, reads it many times, and counts, then does the same for the other state.

<div class="qed-demo" id="ro-quiz-concept"></div>

<div class="qed-demo" id="ro-quiz-transfer"></div>

## Two Kinds of Misread

Moving the readout threshold trades one misread for the other. Lower it, and more 0s are read as 1. Raise it, and more 1s are read as 0.

The two misreads can also differ for a second reason. A qubit that started in 1 can **fall back** during a slow read, so some 1s give the signal of a 0. A qubit can lose its energy while it is being read, and why is the next page. Moving the threshold cannot fix these, because those shots already look like 0s.

This table is computed from the same model, with the readout threshold at the middle of the two signals:

<div class="qed-demo qed-ro" id="ro-shares-table"></div>

A device does not want equal shares. It wants the fewest misreads in total, and later pages come back to what that costs. The fall-back switch is a simplified picture: a real fall-back is spread over the readout, not applied all at the start. It is one way a 1 can go wrong, not how every platform fails and not the whole of readout error.

## How a Device Finds Its Own Readout Errors

A device never sees which reads were wrong. It sees only what was reported. So it prepares a known state, reads it many times, and counts. Then it does the same for the other state. That is the same prepare-and-measure routine as the half turn on the last page, now applied to the readout.

**Find a threshold** ran it as a worked case. The readout threshold is a setting the device finds, as the half-turn length was. It is the second of the measurements that calibration repeats. This page runs it once and changes nothing in response. How often a device repeats it, and why, is a later page.

The share of reads that came out wrong, found this way, is what a device reports as its [readout error](../glossary.md#readout-error). It is a measurement of this readout. It does not promise that a whole circuit will work.

## Reading Ends the Superposition

<table class="qed-xf__table">
  <thead><tr><th scope="col">Moment</th><th scope="col">The qubit</th></tr></thead>
  <tbody>
    <tr><th scope="row">Before the read</th><td data-label="The qubit">An even split between |0⟩ and |1⟩</td></tr>
    <tr><th scope="row">After the read</th><td data-label="The qubit">Whichever state was found</td></tr>
  </tbody>
</table>

That is the idea from [Measurement](../02-fundamentals/measurement.md). A device adds one caveat: because its report can be wrong, the state left behind is the state found, which is not always the state reported.

## Readout Is Slow

<div class="qed-demo qed-dr">
  <div id="ro-timeline"></div>
  <p class="qed-ro__note">The Bell circuit's three operations, in order. The longest bar is the readout. The lengths are invented. <span class="qed-ro__tag">invented</span></p>
</div>

The signal from the qubit is weak, so it has to be collected for a while before a 0 and a 1 can be told apart. A longer look separates the two signals better. But a slow readout is also time in which the qubit can fall back, and time the other qubits wait. As a tendency, a readout takes longer than a gate.

<div class="qed-demo qed-dr">
  <div id="ro-bell"></div>
  <div class="qed-dr__strip">
    <div class="qed-dr__strip-item"><strong>H</strong> → a short signal in</div>
    <div class="qed-dr__strip-item"><strong>CNOT</strong> → a coupled gate</div>
    <div class="qed-dr__strip-item"><strong>Measure</strong> → a readout: a signal back, a readout threshold, and a chance of a wrong answer</div>
  </div>
</div>

## From Reading to Keeping

Each of Module 02's assumptions about a measurement has a physical counterpart:

<table class="qed-xf__table">
  <thead><tr><th scope="col">In Module 02, a measurement</th><th scope="col">On a device</th></tr></thead>
  <tbody>
    <tr><th scope="row">Was a look at the state</th><td data-label="On a device">A signal from the qubit that is different for 0 and for 1</td></tr>
    <tr><th scope="row">Told the truth</th><td data-label="On a device">Gives signals that overlap, so a read can be wrong</td></tr>
    <tr><th scope="row">Was the same for 0 and for 1</th><td data-label="On a device">Misreads a 0 and a 1 by different amounts</td></tr>
    <tr><th scope="row">Had nothing to set</th><td data-label="On a device">Needs a readout threshold that the device has to find</td></tr>
    <tr><th scope="row">Was instant</th><td data-label="On a device">Takes a long time</td></tr>
  </tbody>
</table>

```
A MEASUREMENT                A READOUT
A TRUE ANSWER       →        A SIGNAL, A READOUT THRESHOLD, AND A CHANCE OF A WRONG ANSWER
                             THAT DIFFERS FOR 0 AND FOR 1
```

You can start a qubit, turn it to a state you choose, and read it, with errors that differ for 0 and for 1.

> **How long does it stay what it was?**

A qubit does not keep its state for ever, and the way it fades has a name for each of two kinds of loss. That is the next page.

**Next: Coherence →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var R = window.QedReadout;
  var D = window.QedDrive;
  var S = window.QedShots;
  var N = window.QedNumbers;
  var Z = window.QedQuiz;
  var QC = window.QedCircuit;
  if (!R || !D || !S || !N || !Z || !QC) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function pctText(x) { return R.shareText(x); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  // ---- static pictures built from the shared modules ----
  $("ro-static").innerHTML = R.signalSVG({ separation: "close", threshold: 4 }, { threshold: false, overlap: true });
  $("ro-timeline").innerHTML = D.timelineSVG();
  $("ro-bell").innerHTML = QC.renderSVG(QC.bell());

  $("ro-shares-table").innerHTML = (function () {
    var rows = R.FALLBACKS.map(function (f) {
      var m = R.misreads({ separation: "medium", fallback: f.id, threshold: R.means({ separation: "medium" }).middle });
      return "<tr><th scope=\"row\">Fall-back " + esc(f.label) + "</th>" +
        '<td data-label="A qubit in 0 is read as 1">' + pctText(m.zeroAsOne) + "</td>" +
        '<td data-label="A qubit in 1 is read as 0">' + pctText(m.oneAsZero) + "</td></tr>";
    }).join("");
    var mid = R.means({ separation: "medium" }).middle;
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Setting</th><th scope="col">A qubit in 0 is read as 1</th><th scope="col">A qubit in 1 is read as 0</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<p class="qed-ro__note">Medium signals, with the readout threshold at the middle, ' + mid + '. <span class="qed-ro__tag">computed from a simplified model</span></p>';
  })();

  // ---- Read the Signal ----
  var state = { prepared: R.DEFAULTS.prepared, separation: R.DEFAULTS.separation, fallback: R.DEFAULTS.fallback, threshold: R.DEFAULTS.threshold };
  var shotsRun = 0;
  var sweepRun = 0;
  var readResult = null;
  var sweepResult = null;
  var thresholdNote = "";

  function buildGroup(id, name, list, key, labelOf, onPick) {
    var box = $(id);
    box.innerHTML = list.map(function (item) {
      return '<label class="qed-ro__opt"><input type="radio" name="' + name + '" value="' + esc(item.id) + '"' +
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

  function syncThreshold() {
    $("ro-threshold-range").value = String(state.threshold);
    $("ro-threshold-num").value = String(state.threshold);
    $("ro-threshold-note").textContent = thresholdNote || ("The readout threshold is " + R.thresholdWords(state) + ".");
  }

  function preparedLabel() { return R.preparedById(state.prepared).label; }

  function countsWords() {
    if (!readResult) return "";
    var r = readResult;
    var text = r.count + " simulated shots, prepared in " + (state.prepared === "split" ? "an even split" : preparedLabel()) + ". This model knows that " + r.started[0] + " started in 0 and " + r.started[1] + " started in 1. " +
      r.reported[0] + " were reported as 0 and " + r.reported[1] + " as 1. " + plural(r.misreads, "read was", "reads were") + " misread.";
    if (r.fellBack > 0) text += " " + plural(r.fellBack, "shot", "shots") + " that began in 1 fell back and gave the signal of a 0.";
    return text;
  }

  function sweepWords() {
    if (!sweepResult) return "";
    var b = sweepResult.best;
    var where = b.tied.length === 1
      ? "at threshold " + b.threshold + " (" + b.misreads + " of 200)"
      : "at " + b.tied.length + " thresholds, from " + b.tied[0] + " to " + b.tied[b.tied.length - 1] + " (" + b.misreads + " of 200 each), so the middle one, threshold " + b.threshold + ", is reported";
    var mid = R.means(state).middle;
    return "The fewest misreads were seen " + where + ". The bottom is flat, so neighbouring thresholds look alike, and a finer sweep would narrow it down. The middle of the two signals is " + mid + ". This page only reports a threshold: it does not move the slider.";
  }

  function reportedBox() {
    if (!sweepResult) return "";
    var b = sweepResult.best;
    var p = b.point;
    return '<div class="qed-ro__reported"><strong>Reported figure, measured by preparing and reading <span class="qed-ro__tag">simulated</span></strong>' +
      "At threshold " + p.threshold + ": a qubit prepared in 0 was read as 1 in " + p.zeroMisreads + " of 100 (" + N.pct(b.zeroShare, 0) + "), and a qubit prepared in 1 was read as 0 in " + p.oneMisreads + " of 100 (" + N.pct(b.oneShare, 0) + "). " +
      "About " + N.pct(1 - p.share, 0) + " of reads were right, which a device reports as its readout fidelity. It measures this readout, and it is not a guarantee for a whole circuit.</div>";
  }

  function renderData() {
    var m = R.misreads(state);
    var html = '<table class="qed-xf__table"><thead><tr><th scope="col">At the current settings</th><th scope="col">Exact share</th></tr></thead><tbody>' +
      '<tr><th scope="row">A qubit in 0 is read as 1</th><td data-label="Exact share">' + pctText(m.zeroAsOne) + "</td></tr>" +
      '<tr><th scope="row">A qubit in 1 is read as 0</th><td data-label="Exact share">' + pctText(m.oneAsZero) + "</td></tr></tbody></table>";
    if (!sweepResult) {
      html += "<p>Run Find a threshold to fill the second table.</p>";
    } else {
      var rows = sweepResult.points.map(function (p) {
        return "<tr><th scope=\"row\">" + p.threshold + "</th>" +
          '<td data-label="0s read as 1, out of 100">' + p.zeroMisreads + "</td>" +
          '<td data-label="1s read as 0, out of 100">' + p.oneMisreads + "</td>" +
          '<td data-label="Misreads, out of 200">' + p.misreads + "</td></tr>";
      }).join("");
      html += '<table class="qed-xf__table"><thead><tr><th scope="col">Threshold</th><th scope="col">0s read as 1, out of 100</th><th scope="col">1s read as 0, out of 100</th><th scope="col">Misreads, out of 200</th></tr></thead><tbody>' + rows + "</tbody></table>";
    }
    $("ro-data-table").innerHTML = html;
  }

  function render(announce) {
    var m = R.misreads(state);
    $("ro-signal").innerHTML = R.signalSVG(state);
    $("ro-bars").innerHTML = S.renderBars([
      { label: "0 read as 1", fraction: m.zeroAsOne, text: pctText(m.zeroAsOne), accent: "error", labelWidth: "6rem" },
      { label: "1 read as 0", fraction: m.oneAsZero, text: pctText(m.oneAsZero), accent: "error", labelWidth: "6rem" }
    ]);
    $("ro-shares-words").textContent = R.sharesWords(state) + " (exact, from the model.)";
    if (readResult) {
      $("ro-counts").innerHTML = '<p class="qed-ro__note"><strong>Simulated.</strong> ' + esc(countsWords()) + " Samples differ from run to run, and an even split will not give exactly half and half. Press the button again for new ones.</p>";
      $("ro-dots").innerHTML = R.dotsSVG(readResult);
      $("ro-table").innerHTML = R.tableHTML(readResult) +
        '<p class="qed-ro__note">The rows are known only in this model. A device sees only the reported columns. Here, true means the state when the read began, so a shot that fell back counts as a misread of that state.</p>';
    } else {
      $("ro-counts").innerHTML = "";
      $("ro-dots").innerHTML = "";
      $("ro-table").innerHTML = "";
    }
    $("ro-sweep-box").innerHTML = R.sweepSVG(state, sweepResult) +
      '<p class="qed-ro__note">The line is the exact share of reads that are misread' + (sweepResult ? "; the open circles are the measured shares." : ". Press Find a threshold to add measured shares.") + "</p>" +
      (sweepResult ? '<p class="qed-ro__note">' + esc(sweepWords()) + "</p>" : "");
    $("ro-reported").innerHTML = reportedBox();
    renderData();
    syncThreshold();
    if (announce) $("ro-live").textContent = "Threshold " + state.threshold + ". " + R.sharesWords(state);
  }

  function clearResults(keepSweep) {
    readResult = null;
    if (!keepSweep) sweepResult = null;
  }

  if ($("ro-explorer")) {
    buildGroup("ro-prepared", "ro-prepared", R.PREPARED, "prepared", function (p) { return p.label; }, function (v) { state.prepared = v; clearResults(true); render(true); });
    buildGroup("ro-separation", "ro-separation", R.SEPARATIONS, "separation", function (s) { return s.label; }, function (v) { state.separation = v; clearResults(false); render(true); });
    buildGroup("ro-fallback", "ro-fallback", R.FALLBACKS, "fallback", function (f) { return f.label; }, function (v) { state.fallback = v; clearResults(false); render(true); });

    function setThreshold(raw) {
      var n = Number(raw);
      var snapped = R.snapThreshold(raw);
      thresholdNote = (isFinite(n) && (n < 0 || n > R.AXIS_MAX)) ? "The threshold runs from 0 to " + R.AXIS_MAX + ", so " + snapped + " is used." : "";
      state.threshold = snapped;
      clearResults(true);
      render(true);
    }
    $("ro-threshold-range").addEventListener("input", function () { setThreshold($("ro-threshold-range").value); });
    $("ro-threshold-num").addEventListener("change", function () { setThreshold($("ro-threshold-num").value); });
    $("ro-shots").addEventListener("click", function () {
      shotsRun++;
      readResult = R.read(state, state.prepared, 700 + shotsRun);
      render(false);
      $("ro-live").textContent = countsWords();
    });
    $("ro-sweep").addEventListener("click", function () {
      sweepRun++;
      sweepResult = R.sweep(state, 900 + sweepRun);
      render(false);
      $("ro-live").textContent = "Read at 25 thresholds. The middle of the thresholds with the fewest misreads is " + sweepResult.best.threshold + ".";
    });
    $("ro-reset").addEventListener("click", function () {
      state.prepared = R.DEFAULTS.prepared;
      state.separation = R.DEFAULTS.separation;
      state.fallback = R.DEFAULTS.fallback;
      state.threshold = R.DEFAULTS.threshold;
      thresholdNote = "";
      readResult = null;
      sweepResult = null;
      shotsRun = 0;
      sweepRun = 0;
      setChecked("ro-prepared", state.prepared);
      setChecked("ro-separation", state.separation);
      setChecked("ro-fallback", state.fallback);
      render(true);
    });
    render(false);
  }

  // ---- Checks ----
  Z.mount($("ro-quiz-predict"), { title: "Predict", items: [{
    label: "What lowering the readout threshold does while the qubit is in 0",
    prompt: "You lower the readout threshold while the qubit is in 0. Do more 0s get read as 1, or fewer? Pick one, then try it in the explorer.",
    options: [
      { label: "More", correct: true, why: "More of the signal from 0 now lies above the readout threshold, so more of them are read as 1." },
      { label: "Fewer", correct: false, why: "A lower readout threshold puts more of the signal from 0 above it. Fewer would need a higher threshold." },
      { label: "The same", correct: false, why: "Moving the readout threshold changes which signals lie above it, so the share that is misread changes." }
    ]
  }] });

  Z.mount($("ro-quiz-concept"), { title: "Check", items: [{
    label: "Whether a readout is a look at the qubit's state",
    prompt: "Is a readout a look at the qubit's state?",
    options: [
      { label: "Yes, the device sees the state directly", correct: false, why: "A device cannot see a state. It detects a signal that depends on the state." },
      { label: "No, it detects a signal that depends on the state, and the signals overlap, so a read can be wrong", correct: true, why: "That is why a signal near the readout threshold can be sorted the wrong way." },
      { label: "No, but the signals for 0 and for 1 never overlap", correct: false, why: "They do overlap, because the signal is never the same twice. That overlap is where the misreads come from." }
    ]
  }] });

  Z.mount($("ro-quiz-transfer"), { title: "Transfer", items: [{
    label: "Whether the readout threshold alone explains different misreads of 0 and 1",
    prompt: "A device reads a qubit prepared in 1 and gets 0 about one time in ten, but reads a qubit prepared in 0 and gets 1 about one time in fifty. Is the readout threshold at fault?",
    options: [
      { label: "Maybe, but not only: a readout threshold that is not in the middle, or a 1 that falls back during a slow read, would do it", correct: true, why: "Moving the readout threshold trades one misread for the other, and the fall-back kind cannot be fixed that way." },
      { label: "Yes, and moving it will remove both misreads", correct: false, why: "Moving the readout threshold trades one misread for the other. It cannot remove the ones whose signal already looks like the other state." },
      { label: "No, the two misreads must always be equal", correct: false, why: "They need not be equal. Try an off-centre readout threshold, or switch the fall-back on." }
    ]
  }, {
    label: "How a device finds out its readout errors",
    prompt: "How could the device find out how often it misreads?",
    options: [
      { label: "It prepares each state, reads it many times, and counts", correct: true, why: "A device never sees which reads were wrong, but it knows what it prepared, so counting the reports shows the misreads." },
      { label: "It looks at which reads were wrong", correct: false, why: "A device sees only what was reported, not what the state really was." },
      { label: "It reads each state once", correct: false, why: "One read cannot show a share. It takes many reads of each state." }
    ]
  }] });
});
</script>
