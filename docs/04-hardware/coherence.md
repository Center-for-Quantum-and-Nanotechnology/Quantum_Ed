# Coherence

Module 02's qubit kept its state for as long as you liked. A real qubit loses its energy and its timing, at different speeds. How fast, and how do you know?

## From Reading to Keeping

[Readout](readout.md) ended with a qubit that starts, a control signal that turns it, and a readout that sorts the signal from the qubit into 0 or 1.

> **How long does a qubit last?**

Not for ever, and it fades in two ways. This page is the physical side of Module 02's assumption that a qubit lasts as long as you like.

## Two Ways to Fade

A qubit can lose two different things:

- **Energy loss.** A qubit that was in 1 falls toward 0. A number called **[T1](../glossary.md#t1-relaxation-time)** times it.
- **Phase loss.** A qubit in an even split keeps its odds of reading 0 or 1, but loses its timing, so a later turn can no longer bring it back to a definite 1. A number called **[T2](../glossary.md#t2-dephasing-time)** times it.

Here is the average of 24 runs of each, at the start and after a long wait, for one invented qubit. Each dot is one run, and the arrow is their average.

<div class="qed-demo qed-co">
  <div class="qed-co__pics">
    <div class="qed-co__pic"><div id="co-pic-e0"></div><p class="qed-co__note">Energy loss, at the start</p></div>
    <div class="qed-co__pic"><div id="co-pic-e1"></div><p class="qed-co__note">Energy loss, after a long wait</p></div>
    <div class="qed-co__pic"><div id="co-pic-p0"></div><p class="qed-co__note">Phase loss, at the start</p></div>
    <div class="qed-co__pic"><div id="co-pic-p1"></div><p class="qed-co__note">Phase loss, after a long wait</p></div>
  </div>
  <p class="qed-co__note">Side view for energy, with |0⟩ at the top and |1⟩ at the bottom, and top view for phase. A shorter arrow means less sure. The times and the picture are invented and simplified. <span class="qed-co__tag">invented</span></p>
</div>

T1 and T2 are two separate numbers, and a device reports them separately. **[Decoherence](../glossary.md#decoherence)** is the umbrella word for both losses, and **[coherence time](../glossary.md#coherence-time)** is the general idea of how long a qubit keeps its state.

!!! question "Can a qubit keep its energy and still lose its phase?"
    Yes. Qubit B in the explorer below keeps its energy for a long time and loses its phase quickly. How the two times are linked is later depth.

## Measuring a Fade: Prepare, Wait, Read

A device finds each time by waiting and reading, at many waits, with many reads at each. The steps differ a little for each loss:

1. **Energy:** start in 1, wait, read.
2. **Phase:** start in an even split, wait, turn it again, read.

Why the second turn? A plain read cannot see phase. A qubit in an even split reads 0 or 1 at random whether or not its phase is intact. So a device turns the qubit again before reading. That turns an intact phase back into a definite 1, and a lost phase into a coin flip. It is the same idea as in [Measurement](../02-fundamentals/measurement.md), where a turn before the read changes what is read, and the turn is the quarter turn from [Gates and Control](gates-and-control.md).

This is the wait-and-read experiment that calibration repeats, the second after the half turn on the Gates and Control page and the threshold on the Readout page. This page runs it once and changes nothing in response. One more line on T2: it is measured by this experiment, other measurements give other values, and a later page returns to that.

## Wait and Watch

First, a prediction.

<div class="qed-demo" id="co-quiz-predict"></div>

Now pick a qubit and an experiment, and choose a wait. Every time is invented, in the same invented time units as the timeline on the Gates and Control page (a one-qubit signal is 1, a two-qubit gate is 4, a readout is 10). The counts are simulated.

<div class="qed-demo qed-co" id="co-explorer">
  <p class="qed-demo__step"><strong>1. Choose a qubit</strong></p>
  <div class="qed-co__group" role="radiogroup" aria-label="Qubit" id="co-qubit"></div>
  <p class="qed-co__note" id="co-qubit-note"></p>
  <p class="qed-demo__step"><strong>2. Choose an experiment</strong></p>
  <div class="qed-co__group" role="radiogroup" aria-label="Experiment" id="co-experiment"></div>
  <p class="qed-demo__step"><strong>3. Choose the wait</strong></p>
  <div class="qed-dr__lenrow">
    <input type="range" id="co-wait-range" min="0" max="600" step="5" value="0" aria-label="Wait, slider">
    <input type="number" id="co-wait-num" min="0" max="600" step="5" value="0" aria-label="Wait, typed value">
  </div>
  <p class="qed-co__note" id="co-wait-note"></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="co-reset">Reset</button>
  </div>
  <div class="qed-co__panel">
    <p class="qed-co__title">The exact curves and the average of the runs <span class="qed-co__tag">invented</span> <span class="qed-co__tag">computed from a simplified model</span></p>
    <div id="co-curve"></div>
    <div class="qed-co__pics">
      <div class="qed-co__pic"><div id="co-picture"></div></div>
      <div>
        <div id="co-bars"></div>
        <p class="qed-co__note" id="co-words"></p>
        <p class="qed-co__note" id="co-picture-words"></p>
      </div>
    </div>
  </div>
  <div class="qed-co__panel">
    <p class="qed-co__title">What an experiment would show <span class="qed-co__tag">simulated</span></p>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button" id="co-shots">Measure 100 shots</button>
      <button type="button" class="qed-button qed-button--secondary" id="co-sweep">Measure at every wait</button>
    </div>
    <div id="co-counts"></div>
    <div id="co-sweep-words"></div>
    <div id="co-reported"></div>
    <details class="qed-details" markdown="1" id="co-data">
      <summary>The numbers as tables</summary>
      <div id="co-data-table"></div>
    </details>
  </div>
  <p class="qed-co__note" id="co-live" role="status" aria-live="polite"></p>
</div>

Start with Qubit B and the energy experiment, and press **Measure at every wait**. Then switch to the phase experiment and press it again. The phase circles fall to a coin flip almost at once, while the energy circles barely move. Then try Qubit C, which is the other way round. The dashed and solid lines always show both experiments, so you can see the contrast.

<div class="qed-demo" id="co-quiz-concept"></div>

<div class="qed-demo" id="co-quiz-transfer"></div>

## A Time Scale, Not a Deadline

Each curve falls **gradually**. After one T, about <span id="co-fallen">two-thirds</span> of the fall has happened: the share of runs still excited has fallen to about <span id="co-left1">a third</span> of where it started, and the phase experiment's reading has moved about two-thirds of the way to 50%. After about three T, only about <span id="co-left3">a twentieth</span> of the fall is left to happen.

T is a **time scale**, not the moment the qubit stops working. The fall starts at once. The energy curve ends at 0, because an energy loss ends in a definite state. The phase curve ends at a coin flip (50%), because a phase loss leaves the odds as they were and takes away only what a later turn could use.

One more honest note: real decays are not always one clean exponential. One curve is a simplification used here, and the phase model also leaves out energy loss during the wait.

The number that **Measure at every wait** reports is an **estimate**. A device fits a curve to the circles, and the fit changes a little from run to run. It is a measurement with uncertainty, not a guarantee.

## Where the Fade Comes From

A qubit is never perfectly cut off from its surroundings, which [Physical Qubits](physical-qubits.md) said. So its surroundings can take away some of its energy and jostle its timing. Module 07 calls the first relaxation, and the glossary names the process [amplitude damping](../glossary.md#amplitude-damping). It calls the second [dephasing](../glossary.md#dephasing). It has names for the errors they cause, which this page does not teach. Where each kind of disturbance comes from is the next page.

## How Many Operations Fit

A time on its own says little. What matters is how many operations fit inside it. These tables are for the qubit chosen in the explorer above, and they are computed from the lengths on the Gates and Control timeline.

<div class="qed-demo qed-co">
  <div id="co-fit"></div>
  <p class="qed-co__note">How many operations fit in each time. The times and lengths are invented. <span class="qed-co__tag">invented</span></p>
  <div id="co-budget"></div>
  <p class="qed-co__note">How long a qubit can wait before a share of its excited runs has fallen. <span class="qed-co__tag">computed from a simplified model</span></p>
  <p class="qed-co__note" id="co-bell-words"></p>
</div>

<div class="qed-demo qed-dr">
  <div id="co-bell"></div>
  <div class="qed-dr__strip">
    <div class="qed-dr__strip-item"><strong>H</strong> → a short signal in</div>
    <div class="qed-dr__strip-item"><strong>CNOT</strong> → a coupled gate</div>
    <div class="qed-dr__strip-item"><strong>Measure</strong> → a readout, which takes the longest</div>
  </div>
</div>

As a tendency, the more operations fit, the better. But a number that says how many fit is a budget, not a promise.

> **A qubit has a long T1. Does that mean a circuit on it will work?**

## Not a Guarantee

A long coherence time is necessary and not enough, for four reasons:

- **The gates are slightly wrong.** A turn is never exactly the one set, as [Gates and Control](gates-and-control.md) showed.
- **The readout misreads.** The signals overlap, as [Readout](readout.md) showed.
- **The other imperfections come next.** Time is not the only thing that goes wrong.
- **A time is a measurement at one moment.** It is an estimate, and it can change.

[Hardware Abstraction and Backend Capabilities](../05-software-stack/hardware-abstraction-and-backend-capabilities.md) makes the same point from the software side: a long T1 does not promise a good result. The three qubits here differ by design. Real qubits on one device differ from one another, and their times change, which the next page returns to.

## From Keeping to What Else Goes Wrong

Each of Module 02's assumptions about keeping a qubit has a physical counterpart:

<table class="qed-xf__table">
  <thead><tr><th scope="col">In Module 02, a qubit</th><th scope="col">On a device</th></tr></thead>
  <tbody>
    <tr><th scope="row">Kept its state for as long as you liked</th><td data-label="On a device">Loses its state gradually, on a time scale</td></tr>
    <tr><th scope="row">Never lost energy</th><td data-label="On a device">A 1 falls toward 0, timed by T1</td></tr>
    <tr><th scope="row">Never lost its phase</th><td data-label="On a device">A superposition loses its timing, timed by T2</td></tr>
    <tr><th scope="row">Had no time to measure</th><td data-label="On a device">Each time is measured by preparing, waiting, and reading</td></tr>
    <tr><th scope="row">Ran circuits of any length</th><td data-label="On a device">Fits a budget of operations, which is not a guarantee</td></tr>
  </tbody>
</table>

```
A QUBIT                      A QUBIT
KEPT ITS STATE      →        LOSES ENERGY AND PHASE, AT DIFFERENT SPEEDS,
                             MEASURED BY WAITING
```

A qubit's state fades with time, and T1 and T2 say how fast. But time is not the only thing that goes wrong.

> **Where does the rest of the imperfection come from, and why does it change?**

The gates are slightly wrong, the readout misreads, and the qubits disturb one another, and none of these stands still. That is the next page.

**Next: Noise →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var C = window.QedCoherence;
  var S = window.QedShots;
  var N = window.QedNumbers;
  var Z = window.QedQuiz;
  var QC = window.QedCircuit;
  if (!C || !S || !N || !Z || !QC) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- static pictures and numbers built from the shared module ----
  $("co-pic-e0").innerHTML = C.pictureSVG({ qubit: "a", experiment: "energy", wait: 0 });
  $("co-pic-e1").innerHTML = C.pictureSVG({ qubit: "a", experiment: "energy", wait: 600 });
  $("co-pic-p0").innerHTML = C.pictureSVG({ qubit: "a", experiment: "phase", wait: 0 });
  $("co-pic-p1").innerHTML = C.pictureSVG({ qubit: "a", experiment: "phase", wait: 600 });
  $("co-bell").innerHTML = QC.renderSVG(QC.bell());
  $("co-fallen").textContent = N.pct(C.timeScaleTick({ qubit: "a", experiment: "energy" }).fallen, 0);
  $("co-left1").textContent = N.pct(C.survival(1, 1), 0);
  $("co-left3").textContent = N.pct(C.survival(3, 1), 0);

  // ---- Wait and Watch ----
  var state = { qubit: C.DEFAULTS.qubit, experiment: C.DEFAULTS.experiment, wait: C.DEFAULTS.wait };
  var shotsRun = 0;
  var sweepRun = 0;
  var counts = null;
  var sweepResult = null;
  var waitNote = "";

  function buildGroup(id, name, list, key, labelOf, onPick) {
    var box = $(id);
    box.innerHTML = list.map(function (item) {
      return '<label class="qed-co__opt"><input type="radio" name="' + name + '" value="' + esc(item.id) + '"' +
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

  function syncWait() {
    $("co-wait-range").value = String(state.wait);
    $("co-wait-num").value = String(state.wait);
    $("co-wait-note").textContent = waitNote;
  }

  function experimentLabel() { return C.experimentById(state.experiment).label.toLowerCase(); }

  function countsWords() {
    if (!counts) return "";
    return counts.shots + " simulated shots of the " + experimentLabel() + " experiment at a wait of " + state.wait + ": " + counts.counts[0] + " read 0 and " + counts.counts[1] + " read 1.";
  }

  function reportedBox() {
    if (!sweepResult) return "";
    var e = C.experimentById(state.experiment);
    var est = sweepResult.estimate;
    var body = est
      ? e.time + " is about " + est.time + " (invented time units). The model's own value was " + sweepResult.actual + ". A device never knows it. Run it again and the estimate moves. It comes from a fit to samples, so it is an estimate and not a guarantee."
      : "The fit could not find a decay in these shares.";
    return '<div class="qed-ro__reported"><strong>Reported figure, measured by waiting and reading <span class="qed-co__tag">simulated</span></strong>' + esc(body) + "</div>";
  }

  function renderData() {
    var rows = C.EXPERIMENTS.map(function (e) {
      var p = C.chanceAt(state.qubit, e.id, state.wait);
      return "<tr><th scope=\"row\">" + esc(e.label) + " experiment</th><td data-label=\"Exact chance of reading 1\">" + N.pct(p, 1) + "</td></tr>";
    }).join("");
    var html = '<table class="qed-xf__table"><thead><tr><th scope="col">At the wait now (' + state.wait + ')</th><th scope="col">Exact chance of reading 1</th></tr></thead><tbody>' + rows + "</tbody></table>";
    if (!sweepResult) {
      html += "<p>Run Measure at every wait to fill the second table.</p>";
    } else {
      var body = sweepResult.points.map(function (p) {
        return "<tr><th scope=\"row\">" + p.wait + "</th>" +
          '<td data-label="Exact chance of 1">' + N.pct(p.exact, 1) + "</td>" +
          '<td data-label="Measured: 1s out of 100">' + p.ones + "</td></tr>";
      }).join("");
      html += '<table class="qed-xf__table"><thead><tr><th scope="col">Wait</th><th scope="col">Exact chance of 1</th><th scope="col">Measured: 1s out of 100</th></tr></thead><tbody>' + body + "</tbody></table>";
    }
    $("co-data-table").innerHTML = html;
  }

  function render(announce) {
    var q = C.qubitById(state.qubit);
    var p = C.probabilityOne(state);
    $("co-qubit-note").textContent = q.label + ": T1 is " + q.t1 + " and T2 is " + q.t2 + " (invented time units).";
    $("co-curve").innerHTML = C.curveSVG(state, sweepResult) +
      '<p class="qed-co__note">The lines are exact' + (sweepResult ? "; the open circles are the measured shares of the " + experimentLabel() + " experiment." : ". Press Measure at every wait to add measured shares.") + "</p>";
    $("co-picture").innerHTML = C.pictureSVG(state);
    $("co-picture-words").textContent = C.pictureText(state) + " Each dot is one run, and the arrow is their average.";
    $("co-bars").innerHTML = S.renderBars([
      { label: "Reads 0", fraction: 1 - p, text: N.pct(1 - p, 1), accent: "logical", labelWidth: "5rem" },
      { label: "Reads 1", fraction: p, text: N.pct(p, 1), accent: "logical", labelWidth: "5rem" }
    ]);
    $("co-words").textContent = "Exact chance in the " + experimentLabel() + " experiment. " + C.chanceWords(state);
    $("co-counts").innerHTML = counts
      ? '<p class="qed-co__note"><strong>Simulated.</strong> ' + esc(countsWords()) + " Samples differ from run to run, and press the button again for new ones.</p>" +
        S.renderBars([
          { label: "Read 0", fraction: counts.counts[0] / counts.shots, text: String(counts.counts[0]), accent: "logical", labelWidth: "5rem" },
          { label: "Read 1", fraction: counts.counts[1] / counts.shots, text: String(counts.counts[1]), accent: "logical", labelWidth: "5rem" }
        ])
      : "";
    $("co-sweep-words").innerHTML = sweepResult
      ? '<p class="qed-co__note">The circles follow the ' + esc(experimentLabel()) + ' line, with some scatter, because every one is only 100 samples. This page only reports a time: it does not change any setting.</p>'
      : "";
    $("co-reported").innerHTML = reportedBox();
    $("co-fit").innerHTML = C.fitsHTML(state);
    $("co-budget").innerHTML = C.budgetHTML(state);
    var b = C.bellLoss(state);
    $("co-bell-words").textContent = "The Bell circuit's three operations take " + b.length + " in all. Over that time, " + q.label + " would lose about " + N.pct(b.energy, 0) + " of its excited runs, and about " + N.pct(b.phase, 0) + " of its phase.";
    renderData();
    syncWait();
    if (announce) {
      $("co-live").textContent = q.label + ", " + experimentLabel() + " experiment, wait " + state.wait + ". " + C.chanceWords(state);
    }
  }

  function clearResults(keepSweep) {
    counts = null;
    if (!keepSweep) sweepResult = null;
  }

  if ($("co-explorer")) {
    buildGroup("co-qubit", "co-qubit", C.QUBITS, "qubit", function (q) { return q.label + ": " + q.words; }, function (v) { state.qubit = v; clearResults(false); render(true); });
    buildGroup("co-experiment", "co-experiment", C.EXPERIMENTS, "experiment", function (e) { return e.label + " (" + e.words + ")"; }, function (v) { state.experiment = v; clearResults(false); render(true); });

    function setWait(raw) {
      var n = Number(raw);
      var snapped = C.snapWait(raw);
      waitNote = (isFinite(n) && (n < 0 || n > C.WAIT_MAX)) ? "The wait runs from 0 to " + C.WAIT_MAX + ", so " + snapped + " is used." : "";
      state.wait = snapped;
      clearResults(true);
      render(true);
    }
    $("co-wait-range").addEventListener("input", function () { setWait($("co-wait-range").value); });
    $("co-wait-num").addEventListener("change", function () { setWait($("co-wait-num").value); });
    $("co-shots").addEventListener("click", function () {
      shotsRun++;
      counts = C.measure(state, 1100 + shotsRun);
      render(false);
      $("co-live").textContent = countsWords();
    });
    $("co-sweep").addEventListener("click", function () {
      sweepRun++;
      sweepResult = C.sweep(state, 1300 + sweepRun);
      render(false);
      var est = sweepResult.estimate;
      $("co-live").textContent = "Measured at 25 waits. " + (est ? C.experimentById(state.experiment).time + " is about " + est.time + "." : "The fit could not find a decay.");
    });
    $("co-reset").addEventListener("click", function () {
      state.qubit = C.DEFAULTS.qubit;
      state.experiment = C.DEFAULTS.experiment;
      state.wait = C.DEFAULTS.wait;
      waitNote = "";
      counts = null;
      sweepResult = null;
      shotsRun = 0;
      sweepRun = 0;
      setChecked("co-qubit", state.qubit);
      setChecked("co-experiment", state.experiment);
      render(true);
    });
    render(false);
  }

  // ---- Checks ----
  Z.mount($("co-quiz-predict"), { title: "Predict", items: [{
    label: "How many runs still read 1 after one T1",
    prompt: "A qubit starts in 1 and you wait for exactly one T1. About how many of 100 runs still read 1? Pick one, then try it in the explorer.",
    options: [
      { label: "About 37", correct: true, why: "After one T, about two-thirds of the fall has happened, so about a third of the runs are still excited." },
      { label: "About 63", correct: false, why: "That is about how many have already fallen after one T, not how many are left." },
      { label: "About 50", correct: false, why: "T is not the half-way point. After one T, more than half of the fall has happened." }
    ]
  }] });

  Z.mount($("co-quiz-concept"), { title: "Check", items: [{
    label: "Whether Qubit B's state is intact after a long wait",
    prompt: "Qubit B has a long T1 and a short T2. Is its state mostly intact after a long wait?",
    options: [
      { label: "Yes, both its energy and its phase are intact", correct: false, why: "Its phase fades quickly, because T2 is short. Only its energy lasts." },
      { label: "Its energy is, but its phase is not, so a qubit in an even split has become a coin flip", correct: true, why: "A long T1 keeps a 1 a 1. A short T2 means a superposition's timing is soon gone, and a later turn can no longer use it." },
      { label: "No, its energy has fallen to 0 as well", correct: false, why: "A long T1 means its energy lasts for a long time. Try the energy experiment on Qubit B." }
    ]
  }] });

  Z.mount($("co-quiz-transfer"), { title: "Transfer", items: [{
    label: "Whether a long T1 means a circuit works",
    prompt: "A device reports a long T1 for a qubit. Does a circuit on it work?",
    options: [
      { label: "Yes, a long T1 guarantees success", correct: false, why: "A long time is necessary and not enough. A whole circuit's success depends on much more than any one number." },
      { label: "No, it is one estimate at one moment, and the gates, the readout, and the other imperfections matter too", correct: true, why: "The gates are slightly wrong, the readout misreads, and the next page names the rest. And a time is a measurement, not a promise." },
      { label: "Only if the circuit is short", correct: false, why: "A short circuit helps, but fitting inside a time is not enough on its own." }
    ]
  }, {
    label: "How much of an excited qubit is lost over the Bell circuit",
    prompt: "A circuit takes 15 time units. Qubit C has T1 60. Roughly what share of its excited runs fall in that time?",
    options: [
      { label: "About a fifth", correct: true, why: "15 is a quarter of T1, and about a fifth of the runs fall in a quarter of T1." },
      { label: "About 1%", correct: false, why: "That would be a wait of under one time unit for Qubit C. 15 units is a quarter of its T1." },
      { label: "About half", correct: false, why: "Half would take a wait of about two-thirds of T1, which is about 42 units for Qubit C." }
    ]
  }] });
});
</script>
