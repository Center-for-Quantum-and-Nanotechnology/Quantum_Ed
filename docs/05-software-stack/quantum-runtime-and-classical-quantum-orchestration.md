# Quantum Runtime and Classical-Quantum Orchestration

A quantum program does not run itself. Something sends it to a target, keeps track of it while it waits and runs, brings the results back, and lets the classical side decide what to do next. That coordinator is the runtime.

## From Targets to Runs

On the [previous page](simulation-engines-and-methods.md), a simulator was a target with a method, and a device was a target with a description and reported data. Either target will be handed work.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem; flex-wrap:wrap;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">A simulator</span><span>A target with a method</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">A device</span><span>A target with a description and reported data</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Either one will be handed work</span></div>
  </div>
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
  <p style="text-align:center; font-size:0.8rem;">The same example as before: prepare two qubits together (a Bell state), then measure both.</p>
</div>

> **Whether a circuit runs on a simulator or on a device, what sends the work, waits for it, and brings the results back?**

The [runtime](../glossary.md#quantum-runtime) does. It sends the work, tracks it, brings the results back, and lets the classical side decide what comes next. Those are its four duties:

- **Send** the work: turn the adapted computation into a job and hand it to a target.
- **Track** the job while it waits and runs.
- **Return** the results, in a form software can use.
- **Decide** what to run next, which is the classical side's part.

The first three belong to one job. The fourth is what turns one job into a loop of jobs, later on this page.

## A Job: The Work in a Form a Target Can Read

What the runtime sends is a **[job](../glossary.md#quantum-job)**. A job is the adapted computation plus its settings, with a number so it can be tracked.

- **Computation:** the adapted program, as an ordered list of instructions (the form from [Quantum Program Representations](quantum-program-representations.md), after the rewrite on [Compilation and Transpilation](compilation-and-transpilation.md)).
- **Settings:** the target, and the number of [shots](../glossary.md#shot).
- **Job number:** how the program side refers to the job while it is tracked. The numbers on this page are invented.

Here is the Bell job for each target. The device's list was adapted to what Device Q4 allows. The simulator's was not changed.

<div class="qed-demo qed-rt" id="rt-job"></div>

!!! question "Is a job the same as a circuit?"
    No. A circuit describes the computation. A job is the computation in a form a target can read, plus the settings and a number, sent to one target. It is not a picture of the circuit.

## A Job's Life

A job passes through stages. This page uses a small, invented set of them, so you can see the shape of the idea. Real platforms name and number their stages differently, and some do not queue at all.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem; flex-wrap:wrap;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">1</span><span>Prepared</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">2</span><span>Submitted</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">3</span><span>Queued</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">4</span><span>Running</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">5</span><span>Finished</span></div>
  </div>
</div>

A job can also end in three other ways:

- **Rejected:** the target refuses the job when it is submitted, so it never runs.
- **Failed:** the run stops partway. No results come back.
- **Cancelled:** the program withdraws the job.

Getting the results is a separate action after Finished. It is not a stage of its own.

A **[job queue](../glossary.md#job-queue)** is the line of jobs waiting for a target that can run only some at a time. A simulator running on the same computer may start a job at once. A shared service may queue, even for a simulator. In this model, the device queues and the simulator does not.

Two words you will see below. The **program side** is the classical software that holds the program and the job. The target is the simulator or the device. The page counts **moments**, which are steps, never seconds. A status such as "queued" says nothing about how long the wait will be.

SUBMITTED is not FINISHED. Submitting hands the work over, and the run happens later. Finished means the run completed.

## Run Lifecycle Explorer

First, a prediction.

<div class="qed-demo" id="rt-quiz-predict"></div>

Now send a Bell job and step through its life. Every status, number, and count is invented or simulated, and there is no clock.

<div class="qed-demo qed-rt" id="rt-explorer">
  <p class="qed-demo__step"><strong>1. Choose a target</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Target" id="rt-target-btns"></div>
  <p class="qed-demo__step"><strong>2. Choose the number of shots</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Shots" id="rt-shots-btns"></div>
  <p class="qed-demo__step"><strong>3. Choose what happens</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Outcome" id="rt-outcome-btns"></div>
  <p class="qed-rt__note" id="rt-outcome-desc"></p>
  <p class="qed-demo__step"><strong>4. Step through the job</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="rt-step">Step</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-back">Back</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-cancel">Cancel the job</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-again">Send it again as a new job</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-fix" hidden></button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-reset">Reset</button>
  </div>
  <div id="rt-status"></div>
  <div id="rt-lanes"></div>
  <div class="qed-rt__panel">
    <p class="qed-rt__title">The job carries</p>
    <div id="rt-payload"></div>
  </div>
  <div class="qed-rt__panel">
    <p class="qed-rt__title">What came back</p>
    <div id="rt-result"></div>
  </div>
  <p class="qed-rt__note" id="rt-live" role="status" aria-live="polite"></p>
</div>

<details class="qed-details" markdown="1">
<summary>The stages as a list</summary>

<div id="rt-life"></div>

</details>

What you choose is the target, the shots, and what happens. The two lanes and the status follow from that: they show what each side holds and what has just crossed between them. What you notice is what comes back, or that nothing does.

Compilation rewrites the program. The target's description says what the target allows. The runtime coordinates the run.

<div class="qed-demo" id="rt-quiz-finished"></div>

<div class="qed-demo" id="rt-quiz-failed"></div>

## Results: From Counts to Numbers

What comes back from a run is **[counts](../glossary.md#measurement-counts)**: for each [shot](../glossary.md#shot), one outcome, collected as how many times each bit string was seen. The classical side then does three things with them.

1. **It receives the counts**, with the number of shots and the name of the target.
2. **It turns the counts into something it can use**: a fraction, which is an estimate of a probability, and for the Bell circuit how often the two bits agreed.
3. **It keeps or acts on that**: prints it, stores it, or feeds it into the next job.

Here are three runs of the same Bell job with 100 shots. The first two are on the simulator and the second is the first sent again as a new job. The third is on the device.

<div class="qed-demo qed-rt" id="rt-results"></div>

Three things to notice:

- Counts are **samples**, not the exact probabilities. A simulator *can* give exact probabilities, as the previous page showed, but the result a run hands back by default is counts, for both targets.
- **Running the same job again gives different counts**, because each submission is a new job and the shots are drawn again.
- A finished job is **not** a correct answer. Finished means the run completed. A failed job returns nothing at all, which is different from returning something wrong.

The device's counts include a few outcomes the Bell circuit should not give, 01 and 10. That share is invented for this page and is not typical of any device.

## When the Next Job Depends on the Last: Hybrid Loops

So far the classical side sent one job and read one result. Often it uses what came back to choose the next job. A **hybrid loop** is that pattern: the same steps, repeated, with the classical side deciding each time what to send.

The Bell circuit has nothing to change between runs, so here is a smaller example. One qubit starts at 0 and is turned by an angle, then measured. The angle is a parameter: a [circuit with an angle you can change](../glossary.md#parameterized-quantum-circuit) between runs. The classical side wants the fraction of 1s to be **0.75**. It starts at 30°, sends a job, reads the counts, estimates the fraction of 1s, and uses a simple scripted rule to pick the next angle. The rule moves the angle by 100° times the gap between the target and the estimate.

Choose a target and the shots for each job, then step through the loop.

<div class="qed-demo qed-rt" id="rt-loop">
  <p class="qed-demo__step"><strong>1. Choose a target</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Loop target" id="rt-loop-target-btns"></div>
  <p class="qed-demo__step"><strong>2. Choose the shots for each job</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Shots for each job" id="rt-loop-shots-btns"></div>
  <p class="qed-demo__step"><strong>3. Step through the loop</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="rt-loop-step">Send the next job</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-loop-all">Run to the end</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-loop-new">Try new counts</button>
    <button type="button" class="qed-button qed-button--secondary" id="rt-loop-reset">Reset</button>
  </div>
  <div id="rt-loop-out"></div>
  <p class="qed-rt__note" id="rt-loop-live" role="status" aria-live="polite"></p>
</div>

Every row is a whole job: it was sent, tracked, and returned before the next one could be chosen. So a loop of ten passes is ten jobs. With few shots per job the estimates are rougher, so some runs of the loop wander and take more jobs. With many shots per job the loop almost always settles in three or four jobs, but it uses many more shots to do it. Use **Try new counts** to run the loop again with fresh counts and compare a few runs. The page shows jobs and shots, never time.

> **If each pass is a whole job, what does a loop of ten passes ask of the runtime?**

Ten times the sending, tracking, and returning. On a shared device each job may wait in line again. Whether it does depends on the platform, and this page gives no figures.

The rule is one simple, scripted rule among many. This page does not teach how to choose a good one, and it makes no claim that a loop is better than anything else. Algorithms that use this loop shape are taught elsewhere in the curriculum.

## Feedback Between Jobs and Inside a Run

**Between jobs**
:   The loop above. Results come back through the runtime, and the classical side sends the next job.

**Inside a run**
:   Some circuits [measure a qubit partway through](../glossary.md#mid-circuit-measurement) and use the result to choose a later operation in the same run. That happens close to the device, in the control software from two pages back, too fast to go through job submission. This page does not demonstrate it.

A hybrid loop does not put the quantum side in charge. The classical side sets the angle, sends the job, reads the results, and decides what happens next. [Quantum-classical hybrid computing](../glossary.md#quantum-classical-hybrid-computing) is the name for the pairing.

## The Runtime Is Not the Compiler, the Backend, or the Run

Four words that are easy to mix up.

**Compilation**
:   Rewrites the program so a target can run it.

**Backend or target description**
:   Says what a target allows. It is what decides rejection.

**Runtime**
:   Coordinates the run, from sending to returning.

**Execution**
:   Carries the run out.

The lifecycle shows where each one acts.

<div class="qed-demo qed-rt" id="rt-where"></div>

A platform may combine or reorder these responsibilities. The next page compares complete workflows.

## From Responsibilities to Workflows

Look at what you now have.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Previously</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Each responsibility on its own</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>One page for each</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Now</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>One computation</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>On a simulator and on a device</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>All the responsibilities at work</span></div>
    </div>
  </div>
</div>

The order and grouping of the responsibilities differ between platforms, so putting them together is its own question.

> **You have met every responsibility one at a time. When all of them work on one computation, on a simulator and on a device, what stays the same, and what changes?**

## Takeaway

The runtime coordinates a run: it sends a job to a target, keeps track of it, brings results back as counts the classical side can use, and lets the classical side decide the next job. A loop of such jobs is how classical and quantum work are combined.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A program is turned into a job</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The job is sent, tracked, and returned</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The classical side turns counts into numbers</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>And decides what to send next</span></div>
</div>

Program → job → target → counts → numbers → the next job.

> **You have met every responsibility one at a time. When all of them work on one computation, on a simulator and on a device, what stays the same, and what changes?**

**Next: Integrated Quantum Software Workflows →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var PF = window.QedProgramForms;
  var R = window.QedRuntime;
  var B = window.QedBackend;
  var Z = window.QedQuiz;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // The recurring circuit, drawn from data, as on the previous pages.
  Array.prototype.forEach.call(document.querySelectorAll("[data-qed-circuit]"), function (el) {
    el.innerHTML = QC.renderSVG(QC.bell());
  });

  var BASE = PF.bell();
  var SIM = B.SIMULATOR;
  var DEV = B.DEVICE;
  var TARGETS = [{ id: "simulator", target: SIM }, { id: "q4", target: DEV }];
  function targetOf(id) { return id === "q4" ? DEV : SIM; }

  function panel(title, body, note) {
    return '<div class="qed-rt__panel"><p class="qed-rt__title">' + title + "</p>" + body + (note ? '<p class="qed-rt__note">' + note + "</p>" : "") + "</div>";
  }

  function toggleGroup(el, items, current, onPick) {
    el.innerHTML = items.map(function (it) {
      return '<button type="button" class="qed-button qed-button--secondary" data-value="' + esc(it.value) + '" aria-pressed="false">' + esc(it.label) + "</button>";
    }).join("");
    Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { onPick(b.getAttribute("data-value")); });
    });
    return function mark(value) {
      Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) {
        var on = b.getAttribute("data-value") === String(value);
        b.classList.toggle("qed-button--active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
  }

  // ---- the job each target is sent -------------------------------------------------------------
  $("rt-job").innerHTML = '<div class="qed-rt__lanes">' + TARGETS.map(function (t) {
    var c = R.circuitFor("finishes", t.target, BASE);
    var job = R.newJob(c, t.target, 100);
    return panel(esc(t.target.name) + " job",
      "<p>Settings: " + esc(t.target.name) + ", 100 shots. Job number: " + job.id + " (invented).</p>" +
      PF.instructionListHTML(c, { interactive: false, ariaLabel: "The instructions in the " + t.target.name + " job" }),
      t.id === "q4" ? "Adapted to what Device Q4 allows: it has no H, so H became three turns." : "The Bell circuit as written. The simulator lists every operation in it.");
  }).join("") + "</div>";

  // ---- the explorer -----------------------------------------------------------------------------------
  var DEFAULT = { target: "simulator", shots: 100, outcome: "finishes" };
  var cfg = { target: DEFAULT.target, shots: DEFAULT.shots, outcome: DEFAULT.outcome };
  var number = 1;
  var cur = null;
  var trail = [];

  var OUTCOME_TEXT = {
    finishes: "The job is accepted, runs, and finishes. The device queues it first; the simulator does not.",
    rejected: "The job carries an operation the target's description does not list, so the target refuses it. On the device that is H, the Bell circuit as first written. On the simulator it is a T added after the CNOT.",
    fails: "The job is accepted and runs, then stops partway. No results come back.",
  };

  var STEP_LABEL = {
    prepared: "Step: send the job",
    submitted: "Step: the target checks the job",
    queued: "Step: wait one moment",
    running: "Step: let the run continue",
  };

  function fresh() {
    var t = targetOf(cfg.target);
    cur = R.newJob(R.circuitFor(cfg.outcome, t, BASE), t, cfg.shots, { number: number, fate: cfg.outcome === "fails" ? "fails" : "completes" });
    trail = [];
  }

  var markTarget = toggleGroup($("rt-target-btns"), TARGETS.map(function (t) { return { value: t.id, label: t.target.name }; }), cfg.target, function (v) { cfg.target = v; fresh(); renderExplorer("The target is now " + targetOf(v).name + ". A new job is prepared."); });
  var markShots = toggleGroup($("rt-shots-btns"), [10, 100, 1000].map(function (n) { return { value: n, label: n + " shots" }; }), cfg.shots, function (v) { cfg.shots = Number(v); fresh(); renderExplorer("Shots set to " + v + ". A new job is prepared."); });
  var markOutcome = toggleGroup($("rt-outcome-btns"), R.OUTCOMES.map(function (o) { return { value: o.id, label: o.label }; }), cfg.outcome, function (v) { cfg.outcome = v; fresh(); renderExplorer("A new job is prepared."); });

  function resultHTML() {
    var s = cur.state;
    if (s === "finished" && cur.collected) {
      var r = R.results(cur);
      var sum = R.summarize(r);
      return R.countsTableHTML(r) +
        "<p>The two bits agreed in " + sum.agreeCount + " of " + r.shots + " shots (" + (Math.round(sum.agreeFraction * 1000) / 10) + '%). <span class="qed-rt__tag">simulated</span>' + (r.invented ? ' <span class="qed-rt__tag">invented off-pattern share</span>' : "") + "</p>" +
        "<p>These are samples, not exact probabilities. Sending the job again gives different counts. Finished means the run completed, not that the answer is right.</p>";
    }
    if (s === "finished") return "<p>The run is complete. The target holds the counts until the program asks for them. Step once more to get them.</p>";
    if (R.isTerminal(s)) return "<p><strong>No results.</strong> " + esc(cur.reason) + " " + (s === "failed" ? "A failed job returns nothing, which is different from returning something wrong." : "") + "</p>";
    return "<p>Nothing has come back yet.</p>";
  }

  function payloadHTML() {
    var tags = null;
    if (cur.state === "rejected") {
      tags = {};
      R.check(cur.circuit, cur.target).offending.forEach(function (o) { tags[o.id] = "not listed by " + cur.target.name; });
    }
    var note = "";
    if (cfg.outcome === "rejected") note = cfg.target === "q4" ? "This is the Bell circuit as first written, before the rewrite on the Compilation page." : "This is the Bell circuit with a T gate added after the CNOT.";
    else if (cfg.target === "q4") note = "Adapted to what Device Q4 allows.";
    else note = "The Bell circuit as written.";
    return '<p class="qed-rt__note">' + esc(note) + "</p>" + PF.instructionListHTML(cur.circuit, { interactive: false, tags: tags, ariaLabel: "The instructions in the job" });
  }

  function renderExplorer(announce) {
    markTarget(cfg.target);
    markShots(cfg.shots);
    markOutcome(cfg.outcome);
    $("rt-outcome-desc").textContent = OUTCOME_TEXT[cfg.outcome];
    $("rt-status").innerHTML = R.statusHTML(cur);
    $("rt-lanes").innerHTML = R.lanesHTML(cur);
    $("rt-payload").innerHTML = payloadHTML();
    $("rt-result").innerHTML = resultHTML();
    $("rt-life").innerHTML = R.lifecycleHTML(cur);

    var canStep = R.canAdvance(cur) || R.canCollect(cur);
    $("rt-step").disabled = !canStep;
    $("rt-step").textContent = R.canCollect(cur) ? "Step: get the counts" : (STEP_LABEL[cur.state] || "Step (the job has ended)");
    $("rt-back").disabled = trail.length === 0;
    $("rt-cancel").disabled = !R.canCancel(cur);
    var fix = $("rt-fix");
    fix.hidden = cur.state !== "rejected";
    fix.textContent = cfg.target === "q4" ? "Adapt the circuit and send it again" : "Remove the T and send it again";

    $("rt-live").textContent = (announce ? announce + " " : "") + R.describe(cur) + (cur.state === "finished" && cur.collected ? " " + summaryWords() : "");
    // a button that has just become disabled would drop the keyboard focus; keep it in the controls
    if (document.activeElement && document.activeElement.disabled) $("rt-reset").focus();
  }

  function summaryWords() {
    var r = R.results(cur);
    var sum = R.summarize(r);
    return "The two bits agreed in " + sum.agreeCount + " of " + r.shots + " shots. Simulated counts.";
  }

  $("rt-step").addEventListener("click", function () {
    trail.push(cur);
    cur = R.canCollect(cur) ? R.collect(cur) : R.advance(cur);
    renderExplorer();
  });
  $("rt-back").addEventListener("click", function () {
    if (trail.length) { cur = trail.pop(); renderExplorer("Stepped back."); }
  });
  $("rt-cancel").addEventListener("click", function () {
    trail.push(cur);
    cur = R.cancel(cur);
    renderExplorer();
  });
  $("rt-again").addEventListener("click", function () {
    number += 1;
    fresh();
    renderExplorer("A new job, number " + cur.id + " (invented), is prepared.");
  });
  $("rt-fix").addEventListener("click", function () {
    cfg.outcome = "finishes";
    number += 1;
    fresh();
    renderExplorer("The circuit was fixed and a new job is prepared.");
  });
  $("rt-reset").addEventListener("click", function () {
    cfg = { target: DEFAULT.target, shots: DEFAULT.shots, outcome: DEFAULT.outcome };
    number = 1;
    fresh();
    renderExplorer("Reset.");
  });
  fresh();
  renderExplorer();
  $("rt-live").textContent = "";

  // ---- three runs of the same job -------------------------------------------------------------------------
  function runWords(target, n) {
    var t = target;
    var j = R.newJob(R.circuitFor("finishes", t, BASE), t, 100, { number: n });
    while (R.canAdvance(j)) j = R.advance(j);
    var r = R.results(j);
    var sum = R.summarize(r);
    return panel(esc(t.name) + ", " + j.id + " (invented)", R.countsTableHTML(r) +
      "<p>The two bits agreed in " + sum.agreeCount + " of 100 shots.</p>",
      "Simulated counts." + (r.invented ? " The 01 and 10 share is invented." : ""));
  }
  $("rt-results").innerHTML = '<div class="qed-rt__lanes qed-rt__lanes--three">' + runWords(SIM, 1) + runWords(SIM, 2) + runWords(DEV, 1) + "</div>";

  // ---- the hybrid loop ---------------------------------------------------------------------------------------
  var LDEFAULT = { kind: "simulator", shots: 100 };
  var lcfg = { kind: LDEFAULT.kind, shots: LDEFAULT.shots };
  var lpass = 0;
  var lrun = 0;

  var markLTarget = toggleGroup($("rt-loop-target-btns"), TARGETS.map(function (t) { return { value: t.id === "q4" ? "device" : "simulator", label: t.target.name }; }), lcfg.kind, function (v) { lcfg.kind = v; lpass = 0; renderLoop("Target set to " + (v === "device" ? DEV.name : SIM.name) + ". The loop starts again."); });
  var markLShots = toggleGroup($("rt-loop-shots-btns"), [20, 100, 500].map(function (n) { return { value: n, label: n + " shots" }; }), lcfg.shots, function (v) { lcfg.shots = Number(v); lpass = 0; renderLoop("Shots set to " + v + " for each job. The loop starts again."); });

  function renderLoop(announce) {
    markLTarget(lcfg.kind);
    markLShots(lcfg.shots);
    var loop = R.runLoop({ kind: lcfg.kind, shots: lcfg.shots, passes: lpass, seed: R.LOOP_SEED + lrun });
    var last = loop.passes[loop.passes.length - 1];
    var line;
    if (!last) line = "No jobs sent yet. The first job will use an angle of " + R.ANGLE_START + "°.";
    else if (loop.stopped === "tolerance") line = "Stopped: the estimate " + (Math.round(last.estimate * 1000) / 1000) + " is within " + R.TOLERANCE + " of the target " + R.TARGET_FRACTION + ". The angle sent was " + last.angle + "°.";
    else if (loop.stopped === "limit") line = "Stopped at the limit of " + R.MAX_PASSES + " jobs without getting within " + R.TOLERANCE + " of the target.";
    else line = "The next job will use an angle of " + last.next + "°.";
    var flipNote = lcfg.kind === "device" ? " On Device Q4 each reported bit is flipped with a small invented chance (" + Math.round(R.FLIP * 100) + " in 100), and the loop steers by what comes back." : "";
    $("rt-loop-out").innerHTML =
      (loop.passes.length ? R.loopTableHTML(loop) : "") +
      '<p class="qed-rt__totals"><strong>Jobs submitted: ' + loop.jobs + '. Shots used: ' + loop.shotsUsed + ".</strong> " + esc(line) + ' <span class="qed-rt__tag">counts set ' + (lrun + 1) + ", simulated</span></p>" +
      '<p class="qed-rt__note">Target fraction of 1s: ' + R.TARGET_FRACTION + ". The rule: new angle = angle + " + R.GAIN + "° × (target − estimate), kept between 0° and 180°. The counts are simulated." + esc(flipNote) + "</p>";
    $("rt-loop-step").disabled = loop.stopped !== null;
    $("rt-loop-all").disabled = loop.stopped !== null;
    $("rt-loop-live").textContent = (announce ? announce + " " : "") + "Counts set " + (lrun + 1) + ". Jobs submitted: " + loop.jobs + ", shots used: " + loop.shotsUsed + ". " + line;
    if (document.activeElement && document.activeElement.disabled) $("rt-loop-reset").focus();
  }
  $("rt-loop-step").addEventListener("click", function () { lpass += 1; renderLoop(); });
  $("rt-loop-all").addEventListener("click", function () { lpass = R.MAX_PASSES; renderLoop(); });
  $("rt-loop-new").addEventListener("click", function () { lrun += 1; lpass = 0; renderLoop("New counts, set " + (lrun + 1) + ". The loop starts again."); });
  $("rt-loop-reset").addEventListener("click", function () {
    lcfg = { kind: LDEFAULT.kind, shots: LDEFAULT.shots };
    lpass = 0;
    lrun = 0;
    renderLoop("Reset.");
  });
  renderLoop();
  $("rt-loop-live").textContent = "";

  // ---- where each responsibility acts -----------------------------------------------------------------------------
  var where = [
    ["Compilation", "Rewrites the program so a target can run it.", "Before the job exists. The job carries the rewritten form."],
    ["Backend or target description", "Says what a target allows.", "When the target decides whether to accept the job."],
    ["Runtime", "Coordinates the run.", "From sending the job to bringing the counts back, and into the next job."],
    ["Execution", "Carries the run out.", "While the job is running."],
  ];
  $("rt-where").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Responsibility</th><th scope="col">What it does</th><th scope="col">Where it acts in a job’s life</th></tr></thead><tbody>' +
    where.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td data-label="What it does">' + esc(r[1]) + '</td><td data-label="Where it acts in a job’s life">' + esc(r[2]) + "</td></tr>"; }).join("") + "</tbody></table>";

  // ---- checks --------------------------------------------------------------------------------------------------------------
  Z.mount($("rt-quiz-predict"), { title: "Prediction", items: [{
    label: "What a Queued status says about the wait",
    prompt: "You submit a job and its status is Queued. What does that tell you about how long the wait will be? Pick one, then try it in the explorer.",
    options: [
      { label: "It will be short", correct: false, why: "A status names a stage. It does not give a time, and the page counts moments, not seconds." },
      { label: "It will be long", correct: false, why: "Nothing in the word “queued” says that either. It only says the job is waiting for its turn." },
      { label: "Nothing", correct: true, why: "Queued says the job is waiting. How long that takes depends on the platform and on what else is waiting, and the status does not tell you." },
      { label: "That the job will be rejected", correct: false, why: "A rejection happens at submission, before a job is queued. A queued job has already been accepted." }
    ]
  }] });

  Z.mount($("rt-quiz-finished"), { title: "Check", items: [{
    label: "Whether a Finished job means the answer is correct",
    prompt: "A job’s status is Finished. Does that mean the answer is correct?",
    options: [
      { label: "Yes, that is what Finished means", correct: false, why: "Finished means the run completed. It does not say the program was right or the results are useful." },
      { label: "No, it means the run completed", correct: true, why: "Whether the results are useful depends on the program, the target, and how the counts are interpreted." },
      { label: "Yes, because the counts are exact", correct: false, why: "Counts are samples. They differ from run to run and are not the exact probabilities." }
    ]
  }] });

  Z.mount($("rt-quiz-failed"), { title: "Transfer", items: [{
    label: "What a Failed job returns",
    prompt: "A job is Failed. What results come back, and what would you do next?",
    options: [
      { label: "Wrong results, so I would correct them", correct: false, why: "A failed job returns nothing. That is different from returning something wrong." },
      { label: "None. I would decide whether to resubmit, change the job, or choose another target", correct: true, why: "With no results there is nothing to correct. The classical side decides what to send next." },
      { label: "The counts so far, which I would use as they are", correct: false, why: "A failed run hands back no counts. A partial run is not a result." }
    ]
  }] });
});
</script>
