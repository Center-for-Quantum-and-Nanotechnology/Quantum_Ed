# Integrated Quantum Software Workflows

A quantum software stack is a set of responsibilities, not a fixed pipeline. This page runs one computation through all of them, on a simulator and on a device, and shows how a platform can arrange the same responsibilities in different ways.

## From Responsibilities to Workflows

On the [previous page](quantum-runtime-and-classical-quantum-orchestration.md), you saw the runtime send a job, track it, return the counts, and let the classical side decide what comes next. That was the last responsibility to meet on its own. The module's pages followed this order:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:12rem;"><span>Program</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:12rem;"><span>Representation</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:12rem;"><span>Adapt</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:12rem;"><span>Target</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:12rem;"><span>Run</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:12rem;"><span>Return</span></div>
</div>

That is a learning order, not a fixed pipeline. Now put them all to work on the same circuit.

<div class="qed-demo">
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
  <p style="text-align:center; font-size:0.8rem;">The same example as before: prepare two qubits together (a Bell state), then measure both.</p>
</div>

> **You have met every responsibility one at a time. When all of them work on one computation, on a simulator and on a device, what stays the same, and what changes?**

This page does not teach a new responsibility. It puts the ones you know together.

## One Computation, Step by Step

Here are the steps of one workflow on the device path. Each is one responsibility from [the software stack](../glossary.md#quantum-software-stack) acting once, and each links to the page that taught it.

<div class="qed-demo qed-wf" id="wf-steps-table"></div>

There are nine steps on the device path and eight on the simulator path, because a simulator has no physical device to report on. The order shown is one order. The next sections show others.

## Workflow Explorer

First, a prediction.

<div class="qed-demo" id="wf-quiz-predict"></div>

Now run the Bell circuit through a whole workflow. Choose a path and an arrangement, then step through. The device, its reports, the job number, and the queue are invented, every count is simulated, and nothing here has a clock. Every picture below was produced by the models from the earlier pages.

<div class="qed-demo qed-wf" id="wf-explorer">
  <p class="qed-demo__step"><strong>1. Choose a target path</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Target path" id="wf-path-btns"></div>
  <p class="qed-demo__step"><strong>2. Choose an arrangement</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Arrangement" id="wf-arr-btns"></div>
  <p class="qed-wf__note" id="wf-arr-desc"></p>
  <div id="wf-newer-row" hidden>
    <p class="qed-demo__step"><strong>3. Does a newer report arrive while the job waits?</strong></p>
    <div class="qed-demo__controls" role="group" aria-label="A newer report arrives while the job waits" id="wf-newer-btns"></div>
    <p class="qed-wf__note">Only the device has reports. A newer report matters only to a step that acts after the wait.</p>
  </div>
  <p class="qed-demo__step"><strong>Step through the workflow</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="wf-step">Step</button>
    <button type="button" class="qed-button qed-button--secondary" id="wf-back">Back</button>
    <button type="button" class="qed-button qed-button--secondary" id="wf-reset">Reset</button>
  </div>
  <div id="wf-steps"></div>
  <div id="wf-detail"></div>
  <div class="qed-wf__result" id="wf-result" hidden></div>
  <p class="qed-wf__note" id="wf-live" role="status" aria-live="polite"></p>
</div>

What you choose is the path, the arrangement, and the report switch. The steps, who performs them, and what each deciding step knew follow from that. What you notice is what stays the same across arrangements and what differs. A responsibility is a task that must be done. Who does it, and when, is the arrangement.

<div class="qed-demo" id="wf-quiz-onecall"></div>

## What Stays the Same, What Changes

Here are the two paths compared in the first arrangement. The table was computed from two runs of the models, not written by hand.

<div class="qed-demo qed-wf" id="wf-compare"></div>

<div id="wf-compare-summary"></div>

Most responsibilities are shared. The differences cluster around the target and what is known about it. The simulator path is not the device path with the report taken out: the target, its description, the adapted program, and the job's life differ too.

## The Same Responsibilities, Arranged Differently

The explorer offered three arrangements. They are three examples, not a complete list, and no platform is claimed to work this way. They were computed from the models too.

<div class="qed-demo qed-wf" id="wf-arrangements"></div>

<details class="qed-details" markdown="1">
<summary>The same table for the simulator path</summary>

<div class="qed-wf" id="wf-arrangements-sim"></div>

</details>

> **Combined is not removed.**

A tool that does everything in one call still checks, adapts, sends, runs, and returns. It hides the steps. It does not delete them. Here is what happened inside the one tool, the same steps in the same order as the first arrangement.

<div class="qed-demo qed-wf" id="wf-inside"></div>

An arrangement can also change a decision. The pair of qubits a policy would choose depends on which report the step had when it acted, and a step that acts after a wait may have a newer one. That is information, not improvement: a later report does not mean a better result, and the result is still counts.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:14rem;"><span>When a step acts</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:14rem;"><span>What it knows</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:14rem;"><span>What it might decide</span></div>
</div>

This is a possible decision, not an automatic one. The page shows the pair a stated policy would choose and does not apply it: how a program is placed on the qubits is not taught here, and the page does not model how the choice would change the counts.

## Where the Hybrid Loop Fits

The [hybrid loop](quantum-runtime-and-classical-quantum-orchestration.md#when-the-next-job-depends-on-the-last-hybrid-loops) wraps the workflow. Each pass is one run through sending, tracking, and returning, and the classical side decides between passes. The last step of the explorer, interpreting the counts, is where the numbers that can feed the next job come from. The previous page shows the loop itself.

## Architecture, Not Products

The responsibilities are not products. A tool may expose some of them as separate calls, combine some in one call, or leave some to you. Naming the responsibilities gives you a way to read any tool, as the [first page](understanding-the-quantum-software-stack.md#software-responsibilities-are-not-sdk-names) said. Here are two invented tools. Place each call on the responsibilities.

- **Tool A** has five calls: `build(program)`, `adapt(program, target)`, `submit(job)`, `wait(job)`, and `fetch_counts(job)`.
- **Tool B** has one call: `run(program, target)`, which hands back counts.

<div class="qed-demo" id="wf-quiz-map"></div>

Real tools differ in which responsibilities they expose, combine, or leave to you. This page does not compare any real ones.

## What You Can Now Explain

Module 05 asked how quantum computing software works, not how to use it. You can now say:

1. Running a quantum program takes several cooperating software responsibilities, some for the program and some for the device, and writing the program is only one part. ([Understanding the Quantum Software Stack](understanding-the-quantum-software-stack.md))
2. One computation has several forms, and the source you write is not the form other software works with. ([Quantum Program Representations](quantum-program-representations.md))
3. Compilation transforms and adapts a program for a target because targets have constraints, and it is not the same as running the program. ([Compilation and Transpilation](compilation-and-transpilation.md))
4. A backend description tells software what a target can do. For a device it can also carry time-stamped reports, where calibration is the procedure and telemetry is what is reported, and a reported metric is not a guarantee. ([Hardware Abstraction and Backend Capabilities](hardware-abstraction-and-backend-capabilities.md))
5. Simulators use different methods, what each method keeps decides what it can handle, and no method wins everywhere. ([Simulation Engines and Methods](simulation-engines-and-methods.md))
6. The runtime sends a job, tracks it, returns counts, and lets the classical side decide what to send next. ([Quantum Runtime and Classical-Quantum Orchestration](quantum-runtime-and-classical-quantum-orchestration.md))
7. The same responsibilities can be ordered, combined, and placed differently, the simulator and device paths share most of them, and tools, services, and products are not the same as responsibilities. (this page)

## End of Module 05

Look at how the module taught it, and what this page showed.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Previously</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>One responsibility</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>One page</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Now</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>One computation</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Every responsibility, arranged by the platform</span></div>
    </div>
  </div>
</div>

This module is a way of reading any quantum software, not a description of one.

A quantum software stack is a set of responsibilities that describe a program, adapt it to a target, run it, and return the results. The simulator path and the device path share most of them, platforms arrange and combine them differently, and what each step knows depends on when it acts. A tool that hides the steps still performs them.

When a step acts → what it knows → what it might decide → the same kind of result.

> **Given a tool you have never used, how would you find out which responsibilities it performs and which it leaves to you?**

**End of Module 05 — [back to the Module 05 overview](index.md).**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var W = window.QedWorkflow;
  var R = window.QedRuntime;
  var Z = window.QedQuiz;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // The recurring circuit, drawn from data, as on the previous pages.
  Array.prototype.forEach.call(document.querySelectorAll("[data-qed-circuit]"), function (el) {
    el.innerHTML = QC.renderSVG(QC.bell());
  });

  function tag(text) { return '<span class="qed-wf__tag">' + esc(text) + "</span>"; }

  function toggleGroup(el, items, onPick) {
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

  // ---- the steps of one workflow, from the model ----------------------------------------------------
  var first = W.build("device", "prepare-then-send");
  $("wf-steps-table").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Step</th><th scope="col">Responsibility</th><th scope="col">Group</th><th scope="col">Taught on</th></tr></thead><tbody>' +
    first.steps.map(function (s, i) {
      return '<tr><th scope="row">' + (i + 1) + ". " + esc(s.label) + '</th><td data-label="Responsibility">' + esc(s.responsibilityLabel) + (s.id === "report" ? " " + tag("device path only") : "") + '</td><td data-label="Group">' + esc(s.groupLabel) + '</td><td data-label="Taught on">' +
        s.pages.map(function (p) { return '<a href="' + esc(p.file) + '">' + esc(p.id + " " + p.title) + "</a>"; }).join(", ") + "</td></tr>";
    }).join("") + "</tbody></table>";

  // ---- the explorer ------------------------------------------------------------------------------------------
  var DEFAULT = { path: "simulator", arrangement: "prepare-then-send", newer: false };
  var cfg = { path: DEFAULT.path, arrangement: DEFAULT.arrangement, newer: DEFAULT.newer };
  var cursor = -1;
  var b = null;

  function rebuild() {
    b = W.build(cfg.path, cfg.arrangement, { newerReport: cfg.newer });
    cursor = -1;
  }

  var markPath = toggleGroup($("wf-path-btns"), W.PATHS.map(function (p) { return { value: p.id, label: p.label }; }), function (v) {
    cfg.path = v;
    if (v !== "device") cfg.newer = false;
    rebuild();
    render("The path is now the " + W.pathById(v).label.toLowerCase() + " path.");
  });
  var markArr = toggleGroup($("wf-arr-btns"), W.ARRANGEMENTS.map(function (a) { return { value: a.id, label: a.label }; }), function (v) {
    cfg.arrangement = v;
    rebuild();
    render("The arrangement is now " + W.arrangementById(v).label + ".");
  });
  var markNewer = toggleGroup($("wf-newer-btns"), [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], function (v) {
    cfg.newer = v === "yes";
    rebuild();
    render("A newer report while the job waits: " + (cfg.newer ? "yes" : "no") + ".");
  });

  function byCount() {
    var counts = {};
    b.steps.forEach(function (s) { counts[s.by] = (counts[s.by] || 0) + 1; });
    return W.PERFORMERS.filter(function (p) { return counts[p]; }).map(function (p) { return p + " performed " + counts[p] + (counts[p] === 1 ? " step" : " steps"); }).join(", ") + ".";
  }

  function resultHTML() {
    var out = "<p><strong>The result.</strong> " + esc(W.explain(b)) + "</p>" + R.countsTableHTML(b.result) +
      "<p>" + tag("simulated") + (b.result.invented ? tag("invented off-pattern share") : "") + " The two bits agreed in " + b.summary.agreeCount + " of " + b.options.shots + " shots. " + esc(byCount()) + "</p>";
    if (b.decision) {
      out += '<div class="qed-wf__possible"><p>' + tag("possible") + " The pair the policy “" + esc(b.decision.policyLabel) + "” would choose from the " + esc(b.decision.snapshotLabel.toLowerCase()) + " report is <strong>" + esc(b.decision.pair) +
        "</strong>. It is shown, not applied to the circuit, and it did not change the counts.</p></div>";
    }
    return out;
  }

  function render(announce) {
    var arr = W.arrangementById(cfg.arrangement);
    markPath(cfg.path);
    markArr(cfg.arrangement);
    markNewer(cfg.newer ? "yes" : "no");
    $("wf-arr-desc").textContent = arr.description;
    $("wf-newer-row").hidden = cfg.path !== "device";
    $("wf-steps").innerHTML = W.unitsHTML(b, cursor);
    $("wf-detail").innerHTML = cursor < 0
      ? '<p class="qed-wf__note">Nothing has happened yet. Press Step to begin. The ' + esc(W.pathById(cfg.path).label.toLowerCase()) + " path has " + b.steps.length + " steps" + (b.units.length < b.steps.length ? ", shown as " + b.units.length + " actions" : "") + ".</p>"
      : W.detailHTML(b, cursor);
    var done = cursor === b.units.length - 1;
    $("wf-result").hidden = !done;
    $("wf-result").innerHTML = done ? resultHTML() : "";
    $("wf-step").disabled = done;
    $("wf-step").textContent = done ? "Step (the workflow is done)" : "Step: " + b.units[cursor + 1].label.toLowerCase();
    $("wf-back").disabled = cursor < 0;
    $("wf-live").textContent = (announce ? announce + " " : "") + (cursor < 0 ? "Nothing has happened yet." : W.describeUnit(b, cursor) + (done ? " " + W.explain(b) : ""));
    // a button that has just become disabled would drop the keyboard focus; keep it in the controls
    if (document.activeElement && document.activeElement.disabled) $("wf-reset").focus();
    var inside = $("wf-steps").querySelector("details");
    if (inside) inside.open = true;
  }

  $("wf-step").addEventListener("click", function () { if (cursor < b.units.length - 1) { cursor += 1; render(); } });
  $("wf-back").addEventListener("click", function () { if (cursor >= 0) { cursor -= 1; render("Stepped back."); } });
  $("wf-reset").addEventListener("click", function () {
    cfg = { path: DEFAULT.path, arrangement: DEFAULT.arrangement, newer: DEFAULT.newer };
    rebuild();
    render("Reset.");
  });
  rebuild();
  render();
  $("wf-live").textContent = "";

  // ---- what stays the same, from two builds -----------------------------------------------------------------------
  var rowsA = W.compare(W.build("simulator", "prepare-then-send"), W.build("device", "prepare-then-send"));
  $("wf-compare").innerHTML = W.comparisonTableHTML(rowsA, "Simulator", "Device Q4");
  var rowsB = W.compare(W.build("simulator", "send-then-service"), W.build("device", "send-then-service"));
  var count = function (rows, s) { return rows.filter(function (r) { return r.status === s; }).length; };
  var moved = rowsA.map(function (r, i) { return r.status !== rowsB[i].status ? r.label.toLowerCase() + " (" + r.status + " becomes " + rowsB[i].status + ")" : null; }).filter(Boolean);
  var jobMoved = moved.length === 1 && /what the job carries/.test(moved[0]);
  $("wf-compare-summary").innerHTML = "<p>Of the " + rowsA.length + " things compared, " + count(rowsA, "shared") + " are shared, " + count(rowsA, "differs") + " differ, and " + count(rowsA, "one path only") + (count(rowsA, "one path only") === 1 ? " exists" : " exist") + " on one path only." +
    (moved.length ? " In the second arrangement, where the program is sent as written and the service adapts it, the comparison changes: " + esc(moved.join(", ")) + (jobMoved ? ", because both jobs then carry the same program" : "") + "." : "") + "</p>";

  // ---- the arrangements, from builds ----------------------------------------------------------------------------------
  $("wf-arrangements").innerHTML = W.arrangementTableHTML(W.arrangementRows("device"));
  $("wf-arrangements-sim").innerHTML = W.arrangementTableHTML(W.arrangementRows("simulator"));
  var oneTool = W.build("device", "one-tool");
  $("wf-inside").innerHTML = W.unitsHTML(oneTool, 1);
  var innerDetails = $("wf-inside").querySelector("details");
  if (innerDetails) innerDetails.open = true;

  // ---- checks ------------------------------------------------------------------------------------------------------------------
  Z.mount($("wf-quiz-predict"), { title: "Prediction", items: [{
    label: "Which responsibilities differ between the simulator path and the device path",
    prompt: "Before you step through it: which responsibilities do you expect to differ between the simulator path and the device path? Pick one, then compare with the table below the explorer.",
    options: [
      { label: "Every one of them", correct: false, why: "Most are shared: the program, its form, the job's steps, and the kind of result are the same on both paths." },
      { label: "Only the target itself", correct: false, why: "The target differs, but so do what describes it and what the adapted program looks like, and the device path adds a step for the device's own report." },
      { label: "The target, its description, the adapted program, and the report step; the rest is shared", correct: true, why: "The differences cluster around the target and what is known about it. The computed table shows the same." },
      { label: "None of them: the two paths are identical", correct: false, why: "A simulator has no physical device to report on, and it keeps H where the device rewrites it as three turns." }
    ]
  }] });

  Z.mount($("wf-quiz-onecall"), { title: "Check", items: [{
    label: "Whether a tool that runs the whole workflow in one call skips the responsibilities",
    prompt: "A tool runs the whole workflow in one call. Does that mean it skips the responsibilities?",
    options: [
      { label: "Yes, a single call needs fewer steps", correct: false, why: "A call that returns counts still has to check the target, adapt the program, send a job, run it, and bring the counts back." },
      { label: "No, it combines them and hides the steps, which still happen", correct: true, why: "In the explorer, the one tool's inside list is the same steps in the same order as when your tools do them separately." },
      { label: "Only the Control Layer is skipped", correct: false, why: "The report step still happens on the device path. It is the device's own software, not something a call can skip." }
    ]
  }] });

  Z.mount($("wf-quiz-map"), { title: "Map a tool", items: [
    {
      label: "Which responsibility Tool A's adapt call is",
      prompt: "Tool A's call adapt(program, target) rewrites the program for the target. Which responsibility is that?",
      options: [
        { label: "Compilation", correct: true, why: "Rewriting a program so a target can run it is compilation. The name of the call does not decide that; what it does does." },
        { label: "The runtime", correct: false, why: "The runtime sends and tracks the job. It does not rewrite the program." },
        { label: "The backend description", correct: false, why: "The description says what the target allows. It is what the adaptation reads, not the adaptation." },
        { label: "Execution", correct: false, why: "Execution carries out the run, later, on the target." }
      ]
    },
    {
      label: "Which responsibility Tool A's wait call is",
      prompt: "Tool A's call wait(job) holds until the job is done. Which responsibility is that?",
      options: [
        { label: "The runtime, tracking the job", correct: true, why: "Waiting on a job and learning its status is the runtime's tracking duty. It says nothing about how long the wait is." },
        { label: "Compilation", correct: false, why: "Compilation happens before the job exists, in Tool A's adapt call." },
        { label: "The results", correct: false, why: "The results are what comes back at the end. Waiting is what the runtime does before that." }
      ]
    },
    {
      label: "What Tool B's single call performs and leaves to you",
      prompt: "Tool B's single call run(program, target) hands back counts. What does it do, and what does it leave to you?",
      options: [
        { label: "Nothing but the run itself; you do the rest", correct: false, why: "Something has to check the target, adapt the program, send a job, and return the counts. If you do not do those, the tool does." },
        { label: "It combines the steps from describing to returning the counts, and leaves you to write the program and interpret the counts", correct: true, why: "Combined is not removed. A tool that hands back counts leaves turning them into numbers to you." },
        { label: "It skips the steps it does not show", correct: false, why: "A step that is not shown still has to happen. It is hidden, not deleted." }
      ]
    }
  ] });
});
</script>
