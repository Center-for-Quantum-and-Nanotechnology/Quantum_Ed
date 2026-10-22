# Hardware Abstraction and Backend Capabilities

Software describes each target to itself. For a device, that description can include time-stamped estimates of how it is doing. They change, and they are not guarantees.

## From Transformation to Targets

On the [previous page](compilation-and-transpilation.md), software rewrote the Bell circuit for a target, and the rewrite depended on that target's list of what it allows.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem; flex-wrap:wrap;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Start</span><span>A form says what to compute</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Software rewrites it for a target</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>The rewrite depends on the target's list</span></div>
  </div>
</div>

Those lists belonged to the three invented targets from last time.

<div class="qed-demo qed-bk" id="hb-targets"></div>

> **Where does a target's list of what it allows come from, and could it change?**

Software reads a **description** of the target. This page covers what a description tells software, and then what a device can additionally report about its condition, and why that changes.

## What a Backend Description Tells Software

A **[backend description](../glossary.md#backend-description)** is what software is told about a target. It is the place where the Application Layer and the Control Layer meet, as on the [software stack page](understanding-the-quantum-software-stack.md). It says:

- what kind of target it is
- which operations the target allows (its [native gate set](../glossary.md#native-gate-set))
- which qubits can be used together (its [connectivity](../glossary.md#connectivity))

The three targets above are exactly that: three descriptions. The description is not the target itself. The target is the simulator or device that carries out the work.

!!! question "Is the description the same thing as the device?"
    No. It is what software is told about the device. It is an abstraction, not the device and not raw control signals. It does not contain everything about the target.

## Simulator Targets and Device Targets

Both kinds of [execution target](../glossary.md#execution-target) have descriptions. They say different things. Both targets below are synthetic, made up for this page.

<div class="qed-demo qed-bk" id="hb-kinds"></div>

A [simulator](../glossary.md#simulator) can be set up to imitate the reported properties of a device. That is a choice, not a default. The difference to notice is that a device has a physical condition to report, and a simulator does not.

## Why a Device Is Calibrated, and Where the Control Software Sits

A device's behavior can drift (the glossary calls this [time-dependent noise](../glossary.md#time-dependent-noise)), so it is measured and tuned again and again. That procedure is **[calibration](../glossary.md#calibration)**. It is run by control software, which sits beside the device in the Control Layer. Application-facing software sits on the other side of the backend description.

<div class="qed-demo qed-bk">
  <div class="qed-bk__flow" id="hb-flow">
    <span class="qed-bk__flow-step qed-bk__flow-step--action">Calibration procedure (something done)</span>
    <span aria-hidden="true">→</span>
    <span class="qed-bk__flow-step qed-bk__flow-step--reported">Measured or estimated values, with a time</span>
    <span aria-hidden="true">→</span>
    <span class="qed-bk__flow-step qed-bk__flow-step--reported">A report</span>
    <span aria-hidden="true">→</span>
    <span class="qed-bk__flow-step">The backend description</span>
  </div>
  <div id="hb-control"></div>
</div>

Two things sound alike and are not:

- **Calibration** is something that is *done*.
- **[Calibration telemetry](../glossary.md#calibration-telemetry)** is information that is *reported* about a device's state, quality, and settings.

Why a device drifts is a question for the Quantum Hardware module. This page is about what software is told.

## Reading Calibration Telemetry

Here are the fields this page uses. They are representative examples, **not a standard schema**: other kinds of hardware report other fields, and no device reports every field every time. Every value on this page is synthetic.

<div class="qed-demo qed-bk" id="hb-fields"></div>

The glossary has entries for [qubit frequency](../glossary.md#qubit-frequency), [T1](../glossary.md#t1-relaxation-time), [T2](../glossary.md#t2-dephasing-time), [gate fidelity](../glossary.md#gate-fidelity), and [readout error](../glossary.md#readout-error) (also called assignment error).

A reported value also comes with where and when it came from: a time, a status, and an uncertainty. A snapshot of reported values with their time is a **[calibration snapshot](../glossary.md#calibration-snapshot)**.

<div class="qed-demo qed-bk" id="hb-prov"></div>

<div class="qed-demo" id="hb-quiz-prov"></div>

## Backend and Calibration Explorer

First, a prediction.

<div class="qed-demo" id="hb-quiz-predict"></div>

Now choose a target. For the device, choose which report the software has: the earlier snapshot or the later one. Select a qubit or a connection on the map. Three things are shown apart: what was **reported**, what it **means**, and **a possible response** under two stated policies.

<div class="qed-demo qed-bk" id="hb-explorer">
  <p class="qed-demo__step"><strong>1. Choose a target</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Target" id="hb-target-btns"></div>
  <p class="qed-demo__step"><strong>2. Choose which report the software has</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Snapshot" id="hb-snap-btns"></div>
  <p class="qed-bk__note" id="hb-snap-note"></p>
  <p class="qed-demo__step"><strong>3. Select a qubit or a connection</strong> on the map</p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="hb-compare" aria-pressed="false">Compare the two snapshots</button>
    <button type="button" class="qed-button qed-button--secondary" id="hb-reset">Reset</button>
  </div>
  <div id="hb-out"></div>
  <p class="qed-bk__note" id="hb-live" role="status" aria-live="polite"></p>
</div>

What you choose is the target, the snapshot, and the selection. The description and the three panels follow from them. What you notice is a value that moved, two policies that disagree, or a best pair that changed. Reported information may inform software. Whether and how it does depends on the platform.

<div class="qed-demo" id="hb-quiz-metric"></div>

<div class="qed-demo" id="hb-quiz-stale"></div>

## A Metric Is Not a Guarantee, and Telemetry Is Not Live Truth

Five pairs of ideas get mixed up.

**Calibration is not telemetry**
:   Calibration is a procedure. Telemetry is reported information.

**A metric is not a guarantee**
:   Whether a whole circuit succeeds depends on much more than any one number. A long T1 or a low error estimate does not promise a good result.

**Telemetry is not real-time truth**
:   Values may be periodic, old, estimated, filtered, or missing. Each carries a time.

**Backend metadata is not control signals**
:   A backend description is an abstraction that software reads.

**Drift is not automatic adaptation**
:   Whether software responds to drift depends on the platform, its data access, its policies, and its software design.

A reported number is a time-stamped estimate, not a promise. It is also not continuously streamed, and not every device offers every field.

## From Reported Numbers to Possible Decisions

Bring back the Bell circuit, and a question about the device.

> **Which connected pair could it use?**

Two policies are shown below. Each is one stated rule that reads some reported values and ranks the connected pairs. They are ranking rules, not predictions.

<div class="qed-demo qed-bk" id="hb-policies"></div>

The same reported numbers, read under different policies, can support different decisions. And the same policy can choose differently from a different report. Many tools do not do this automatically, and what software does depends on its policy and on which report it has. Choosing which physical qubits to use is part of what the [glossary](../glossary.md#qubit-mapping) calls qubit mapping, which a later level covers.

## From Targets to Simulators

Look at the two targets once more.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>A device</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Reports time-stamped estimates</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Software may use them under a policy</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>A simulator</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Has no physical condition to report</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>But it is still a target something must compute on</span></div>
    </div>
  </div>
</div>

> **If a simulator is just another kind of target, how does it actually work out the answer, and why do different simulators behave differently?**

A simulator is a classical program that models a quantum computation. That is the next problem.

## Takeaway

A backend description tells software what a target allows. For a device it can also carry time-stamped estimates from calibration. They change over time, they are not guarantees, and what software does with them depends on its policy.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Software reads a description of each target</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A device is calibrated and reports time-stamped estimates</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Those numbers can change, and are not guarantees</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Software may use them under a policy, or not at all</span></div>
</div>

Target → description → (device only) reported estimates with a time → possible, policy-dependent response.

> **If a simulator is just another kind of target, how does it actually work out the answer, and why do different simulators behave differently?**

**[Next: Simulation Engines and Methods →](simulation-engines-and-methods.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var XF = window.QedTransform;
  var BK = window.QedBackend;
  var SS = window.QedSoftwareStack;
  var Z = window.QedQuiz;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  var DEV = BK.DEVICE;
  var SIM = BK.SIMULATOR;
  var CIRCUIT_NAMES = ["q₀", "q₁"];

  function panel(title, tag, cls, body) {
    return '<div class="qed-bk__panel ' + cls + '"><p class="qed-bk__title">' + title + (tag ? '<span class="qed-bk__tag">' + esc(tag) + "</span>" : "") + "</p>" + body + "</div>";
  }

  function listHTML(items) {
    return '<ul class="qed-bk__list">' + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  // The backend description of any target with the `allows` shape: kind, operations, connections.
  function descriptionHTML(target, names, syntheticTag) {
    var c = BK.capabilities(target, { names: names });
    var kind = c.kind === "simulator" ? "<p>A simulator.</p>" : c.kind === "device" ? "<p>A device.</p>" : "";
    var body = kind +
      '<p><strong>Allows:</strong></p>' + listHTML(c.operations) +
      '<p><strong>Can be used together:</strong></p>' + listHTML(c.connections) +
      (c.limit ? "<p><strong>Limit:</strong> " + esc(c.limit) + "</p>" : "");
    return panel(esc(target.name), syntheticTag, "qed-bk__desc", body);
  }

  // ---- the three targets from the previous page, as descriptions ---------------------------
  $("hb-targets").innerHTML = '<div class="qed-bk__grid">' + XF.TARGETS.map(function (t) {
    return descriptionHTML(t, CIRCUIT_NAMES, "invented for this page");
  }).join("") + "</div>" +
    '<p class="qed-bk__note">These cards sit where the software stack page puts “' + esc(SS.GROUPS.meeting.label) + '”: ' + esc(SS.GROUPS.meeting.blurb.charAt(0).toLowerCase() + SS.GROUPS.meeting.blurb.slice(1)) + "</p>";

  // ---- simulator and device -----------------------------------------------------------------
  $("hb-kinds").innerHTML = '<div class="qed-bk__grid">' +
    panel("Simulator", "synthetic", "qed-bk__desc",
      "<p>" + esc(SIM.description) + "</p><p><strong>Allows:</strong></p>" + listHTML(BK.capabilities(SIM).operations) +
      "<p><strong>Can be used together:</strong></p>" + listHTML(BK.capabilities(SIM).connections) +
      "<p><strong>Limit:</strong> " + esc(SIM.limit) + "</p>" +
      '<p><strong>Reports:</strong> no calibration data, because nothing physical is calibrated.</p>') +
    panel("Device Q4", "synthetic", "qed-bk__desc",
      "<p>" + esc(DEV.description) + "</p><p><strong>Allows:</strong></p>" + listHTML(BK.capabilities(DEV).operations) +
      "<p><strong>Can be used together:</strong></p>" + listHTML(BK.capabilities(DEV).connections) +
      '<p><strong>Reports:</strong> calibration snapshots, each with a time and a status.</p>') +
    "</div>";

  $("hb-control").innerHTML = '<div class="qed-bk__panel qed-bk__desc"><p class="qed-bk__title">' + esc(BK.CONTROL_SETTINGS.label) + '<span class="qed-bk__tag">named only</span></p><p>' + esc(BK.CONTROL_SETTINGS.text) + "</p></div>";

  // ---- the fields, as a table ----------------------------------------------------------------
  var fieldRows = BK.FIELDS.map(function (f) {
    return '<tr><th scope="row">' + esc(f.label) + "</th>" +
      '<td data-label="Unit">' + esc(f.unit) + "</td>" +
      '<td data-label="What it conveys">' + esc(f.meaning) + "</td>" +
      '<td data-label="What it is not">' + esc(f.qualification) + "</td></tr>";
  }).join("");
  var extraRows =
    '<tr><th scope="row">Native operations and connectivity</th><td data-label="Unit">names, a map</td><td data-label="What it conveys">What the target allows and which qubits can be used together.</td><td data-label="What it is not">Capability metadata. It tends to change less often than calibration metrics.</td></tr>' +
    '<tr><th scope="row">Control settings</th><td data-label="Unit">platform-specific</td><td data-label="What it conveys">Values a control system is set to.</td><td data-label="What it is not">Named here only. They exist, they may not be reported to software, and this page does not teach them.</td></tr>' +
    '<tr><th scope="row">Time, status, and uncertainty</th><td data-label="Unit">a time, a label, ±</td><td data-label="What it conveys">When and how a value was obtained, and how confidently to read it.</td><td data-label="What it is not">Optional extras. A number without them can mislead.</td></tr>';
  $("hb-fields").innerHTML = '<table class="qed-bk-table qed-bk__fields"><thead><tr><th scope="col">Field</th><th scope="col">Unit</th><th scope="col">What it conveys</th><th scope="col">What it is not</th></tr></thead><tbody>' +
    fieldRows + extraRows + "</tbody></table>" +
    '<p class="qed-bk__note">The operating frequency is specific to some kinds of hardware. T2 and T2* are not the same quantity. The fields are examples, not a standard.</p>';

  // ---- provenance: a number with and without it ------------------------------------------------
  var q2later = BK.reportFor(DEV, "later", { qubit: 2 });
  var t1 = q2later.rows.filter(function (r) { return r.fieldId === "t1"; })[0];
  var snap = q2later.snapshot;
  $("hb-prov").innerHTML = '<div class="qed-bk__grid">' +
    panel("A number alone", "", "", "<p><strong>T1 on Q2: " + esc(t1.value + " " + t1.unit) + "</strong></p><p>Is this recent? How sure is it? Is the report complete?</p>") +
    panel("The same number with where and when", "reported", "qed-bk__panel--reported",
      "<p><strong>T1 on Q2: " + esc(t1.text) + "</strong></p>" +
      "<p>Reported at " + esc(snap.time) + " (synthetic). Status: " + esc(snap.statusText) + ". " + esc(snap.protocol.charAt(0).toUpperCase() + snap.protocol.slice(1)) + ".</p>") +
    "</div>";

  // ---- the explorer -------------------------------------------------------------------------------
  var DEFAULT = { target: "device", snap: "earlier", sel: { qubit: 0 }, compare: false };
  var view = { target: DEFAULT.target, snap: DEFAULT.snap, sel: { qubit: DEFAULT.sel.qubit }, compare: DEFAULT.compare };

  $("hb-target-btns").innerHTML =
    '<button type="button" class="qed-button qed-button--secondary" data-target="simulator" aria-pressed="false">Simulator</button>' +
    '<button type="button" class="qed-button qed-button--secondary" data-target="device" aria-pressed="false">Device Q4</button>';
  $("hb-snap-btns").innerHTML = DEV.snapshotIds.map(function (id) {
    var s = DEV.snapshots[id];
    return '<button type="button" class="qed-button qed-button--secondary" data-snap="' + esc(id) + '" aria-pressed="false">' + esc(s.label) + " (" + esc(s.time) + ", synthetic)</button>";
  }).join("");

  function selText(sel) {
    return sel.pair ? "Connection " + DEV.qubits[sel.pair[0]] + " to " + DEV.qubits[sel.pair[1]] : "Qubit " + DEV.qubits[sel.qubit];
  }

  function policyPanel(snapId) {
    var rows = BK.POLICIES.map(function (p) {
      var r = BK.choosePair(DEV, snapId, p.id);
      var best = r.best ? DEV.qubits[r.best[0]] + "–" + DEV.qubits[r.best[1]] : "none could be scored";
      var order = r.ranking.map(function (x) { return x.name + " (" + x.score.toFixed(2) + ")"; }).join(", then ");
      var gaps = r.unscored.length ? " Left out for a missing value: " + r.unscored.map(function (u) { return u.name + " (" + u.missing[0] + ")"; }).join("; ") + "." : "";
      return "<li><strong>" + esc(p.label) + ":</strong> " + esc(p.words) + " It would choose <strong>" + esc(best) + "</strong>" + (r.tie ? " (tied)" : "") + ". Order: " + esc(order) + "." + esc(gaps) + "</li>";
    }).join("");
    return panel("A possible response", "one possible policy", "qed-bk__panel--response",
      "<p>If software ran the Bell circuit on this device, which connected pair might it use? Under two stated policies, from this snapshot:</p>" +
      '<ul class="qed-bk__list">' + rows + "</ul>" +
      '<p class="qed-bk__note">A ranking of reported numbers, not a prediction that the circuit will succeed. Many tools do not do this automatically. What software does depends on its policy and on which report it has.</p>');
  }

  function marks(snapId) {
    return BK.POLICIES.map(function (p, i) {
      var r = BK.choosePair(DEV, snapId, p.id);
      return r.best ? { pair: r.best, label: "policy " + (i + 1) } : null;
    }).filter(Boolean);
  }

  function reportedPanel() {
    var cur = BK.reportFor(DEV, view.snap, view.sel);
    var s = cur.snapshot;
    var head = "<p><strong>" + esc(cur.title) + "</strong> in the " + esc(s.label.toLowerCase()) + " snapshot (synthetic time " + esc(s.time) + "). Status: " + esc(s.statusText) + ".</p>";
    var body = BK.fieldTableHTML(cur.rows) + '<p class="qed-bk__note">' + esc(s.protocol.charAt(0).toUpperCase() + s.protocol.slice(1)) + ".</p>";
    if (view.compare) {
      var other = view.snap === "earlier" ? "later" : "earlier";
      var all = BK.change(DEV, "earlier", "later");
      var where = cur.title;
      var mine = all.filter(function (c) { return c.where === where; });
      var count = function (f) { return all.filter(f).length; };
      body += "<p><strong>What changed here, from the earlier snapshot to the later one:</strong></p>" + listHTML(mine.map(function (c) { return (c.size === "unchanged" ? "= " : c.direction === "higher" ? "↑ " : c.direction === "lower" ? "↓ " : "? ") + c.text; })) +
        "<p>Across the whole device: " + count(function (c) { return c.size === "unchanged"; }) + " values about the same, " +
        count(function (c) { return c.size === "small"; }) + " changed a little, " + count(function (c) { return c.size === "large"; }) + " changed a lot, " +
        count(function (c) { return c.size === "not reported"; }) + " not reported in one of the two, and " + count(function (c) { return c.effect === "improved"; }) + " moved the better way.</p>" +
        '<details class="qed-details"><summary>Every change on the device, as sentences</summary>' + listHTML(all.map(function (c) { return c.text; })) + "</details>";
    }
    return panel("Reported", "reported", "qed-bk__panel--reported", head + body);
  }

  function meaningPanel() {
    var cur = BK.reportFor(DEV, view.snap, view.sel);
    return panel("What it means", "", "",
      cur.rows.map(function (r) {
        return "<p><strong>" + esc(r.label) + ":</strong> " + esc(r.meaning) + " <em>" + esc(r.qualification) + "</em>" + (r.reported ? "" : " This value was not reported.") + "</p>";
      }).join(""));
  }

  function render() {
    var active = document.activeElement;
    var keep = null;
    if (active && $("hb-out").contains(active)) {
      keep = active.getAttribute("data-qubit") !== null ? '[data-qubit="' + active.getAttribute("data-qubit") + '"]' : active.getAttribute("data-pair") !== null ? '[data-pair="' + active.getAttribute("data-pair") + '"]' : null;
    }
    var device = view.target === "device";
    Array.prototype.forEach.call($("hb-target-btns").querySelectorAll("button"), function (b) {
      var on = b.getAttribute("data-target") === view.target;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    Array.prototype.forEach.call($("hb-snap-btns").querySelectorAll("button"), function (b) {
      var on = device && b.getAttribute("data-snap") === view.snap;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.disabled = !device;
    });
    $("hb-compare").disabled = !device;
    $("hb-compare").classList.toggle("qed-button--active", device && view.compare);
    $("hb-compare").setAttribute("aria-pressed", device && view.compare ? "true" : "false");

    if (!device) {
      $("hb-snap-note").textContent = "A simulator has no calibration data, so there is no report to choose.";
      $("hb-out").innerHTML = '<div class="qed-bk__grid">' + descriptionHTML(SIM, ["Q0", "Q1"], "synthetic") +
        panel("Reported", "reported", "qed-bk__panel--reported", "<p>Nothing is reported. A simulator has no physical device to calibrate, so there are no measurements or estimates to report.</p>") +
        panel("What it means", "", "", "<p>The description says what the simulator supports and that its limits come from the classical computer running it. It is still a description that software reads.</p>") +
        panel("A possible response", "one possible policy", "qed-bk__panel--response", "<p>For the Bell circuit, any qubit can be used with any other, and there is nothing reported to rank. A policy that reads reported numbers has nothing to read here.</p>") +
        "</div>";
      $("hb-live").textContent = "Simulator target. No calibration data is reported.";
      return;
    }

    var s = DEV.snapshots[view.snap];
    var later = view.snap === "earlier";
    $("hb-snap-note").textContent = later
      ? "The software has the earlier report. A later one exists, and this one is " + BK.ageText(DEV, "earlier", "later") + " than it."
      : "The software has the later report, the most recent one.";
    $("hb-out").innerHTML =
      (later ? '<p class="qed-bk__age">Software working from the earlier report is using data that is ' + esc(BK.ageText(DEV, "earlier", "later")) + " than the later snapshot. The values may have drifted since.</p>" : "") +
      '<div class="qed-bk__grid">' +
      panel("The device map", "", "qed-bk__panel--wide", BK.deviceSVG(DEV, { selected: view.sel, marks: marks(view.snap), idPrefix: "hb" }) +
        '<p class="qed-bk__note">Dashed outlines mark the pair each policy would choose (see "A possible response"). Select a qubit or a connection to see what was reported for it.</p>') +
      descriptionHTML(DEV, DEV.qubits, "synthetic") + reportedPanel() + meaningPanel() + policyPanel(view.snap) + "</div>";
    if (keep) {
      var again = $("hb-out").querySelector(keep);
      if (again) again.focus();
    }
    var best = BK.choosePair(DEV, view.snap, BK.POLICIES[0].id);
    $("hb-live").textContent = "Device Q4, " + s.label.toLowerCase() + " snapshot at " + s.time + ". " + selText(view.sel) + " selected. " +
      (view.compare ? "Comparing the two snapshots. " : "") +
      "Under the lowest two-qubit error policy, the pair would be " + (best.best ? DEV.qubits[best.best[0]] + " to " + DEV.qubits[best.best[1]] : "none") + ".";
  }

  function selectFrom(el) {
    var q = el.getAttribute("data-qubit");
    var p = el.getAttribute("data-pair");
    if (q !== null) view.sel = { qubit: Number(q) };
    else if (p !== null) view.sel = { pair: p.split("-").map(Number) };
    else return;
    render();
  }

  $("hb-out").addEventListener("click", function (e) {
    var el = e.target.closest("[data-qubit],[data-pair]");
    if (el) selectFrom(el);
  });
  $("hb-out").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest("g[data-qubit],g[data-pair]");
    if (!el) return;
    e.preventDefault();
    selectFrom(el);
  });
  Array.prototype.forEach.call($("hb-target-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.target = b.getAttribute("data-target"); render(); });
  });
  Array.prototype.forEach.call($("hb-snap-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.snap = b.getAttribute("data-snap"); render(); });
  });
  $("hb-compare").addEventListener("click", function () { view.compare = !view.compare; render(); });
  $("hb-reset").addEventListener("click", function () {
    view = { target: DEFAULT.target, snap: DEFAULT.snap, sel: { qubit: DEFAULT.sel.qubit }, compare: DEFAULT.compare };
    render();
  });
  render();

  // ---- the policies, side by side ---------------------------------------------------------------------
  function pairName(r) { return r.best ? DEV.qubits[r.best[0]] + "–" + DEV.qubits[r.best[1]] : "none"; }
  var bellSVG = QC.renderSVG(QC.bell(), { ariaLabel: "The Bell circuit: H on the first qubit, a CNOT, then a measurement of both" });
  $("hb-policies").innerHTML = '<div class="qed-stack__circuit">' + bellSVG + "</div>" +
    '<table class="qed-xf__table"><thead><tr><th scope="col">Policy</th><th scope="col">Rule</th><th scope="col">Earlier snapshot chooses</th><th scope="col">Later snapshot chooses</th></tr></thead><tbody>' +
    BK.POLICIES.map(function (p) {
      return '<tr><th scope="row">' + esc(p.label) + '</th><td data-label="Rule">' + esc(p.words) + "</td>" +
        '<td data-label="Earlier snapshot chooses">' + esc(pairName(BK.choosePair(DEV, "earlier", p.id))) + "</td>" +
        '<td data-label="Later snapshot chooses">' + esc(pairName(BK.choosePair(DEV, "later", p.id))) + "</td></tr>";
    }).join("") + "</tbody></table>" +
    '<p class="qed-bk__note">Computed from the synthetic reports. A ranking of reported numbers, not a prediction.</p>';

  // ---- checks ------------------------------------------------------------------------------------------
  var p1 = BK.POLICIES[0].id;
  var earlyBest = BK.choosePair(DEV, "earlier", p1).best;
  var lateBest = BK.choosePair(DEV, "later", p1).best;
  function key(p) { return p.join("-"); }
  function nm(p) { return DEV.qubits[p[0]] + "–" + DEV.qubits[p[1]]; }

  Z.mount($("hb-quiz-prov"), { title: "Check", items: [{
    label: "Which report can mislead",
    prompt: "Two reports give the same T1. Which one can mislead a reader?",
    options: [
      { label: "“T1 on Q2 is 40 µs”, with nothing else", correct: true, why: "Without a time, a status, and an uncertainty, it could be old, partial, or much less certain than it looks." },
      { label: "“T1 on Q2 is 40 µs (±6), reported at 18:00, status partial”", correct: false, why: "It can still be misread, because a metric is not a guarantee. But it says when it was reported and how sure it is, which is what lets a reader judge it." }
    ]
  }] });

  Z.mount($("hb-quiz-predict"), { title: "Prediction", items: [{
    label: "Which pair the later snapshot chooses under the lowest two-qubit error policy",
    prompt: "Under the policy “lowest two-qubit error”, the earlier snapshot chooses " + nm(earlyBest) + ". Which pair will the later snapshot choose? Pick one, then try it in the explorer.",
    options: DEV.pairs.map(function (p) {
      var right = key(p) === key(lateBest);
      return {
        label: nm(p),
        correct: right,
        why: right
          ? nm(p) + " has the lowest reported two-qubit error in the later snapshot. The best pair changed because the reported numbers changed."
          : key(p) === key(earlyBest) ? nm(p) + " was the earlier choice. Its reported error went up in the later snapshot, and another pair is now lower."
          : nm(p) + " is not the lowest in the later snapshot. Look at the two-qubit errors in the explorer."
      };
    })
  }] });

  Z.mount($("hb-quiz-metric"), { title: "Check", items: [{
    label: "Whether a long T1 means a circuit will succeed",
    prompt: "A qubit's reported T1 is long. Does that mean a circuit using it will succeed?",
    options: [
      { label: "Yes, a long T1 guarantees success", correct: false, why: "T1 is a timescale estimate. Other errors matter too, and a whole circuit's success depends on much more than any one number." },
      { label: "No, it is one estimate with a time, not a guarantee", correct: true, why: "T1 says something about how long an excited qubit keeps its energy. It is measured at a particular time, by a particular method, and does not predict a whole circuit's result." },
      { label: "It depends only on the readout error", correct: false, why: "Readout error matters for the final measurement, but gate errors, the other qubits, and the circuit itself matter too. No single field decides it." }
    ]
  }] });

  Z.mount($("hb-quiz-stale"), { title: "Transfer", items: [{
    label: "What can go wrong when software uses the earlier snapshot",
    prompt: "Software has the earlier snapshot, and the later one now exists. What might go wrong if it keeps using the earlier one?",
    options: [
      { label: "The values may have drifted, and the best pair may have changed", correct: true, why: "The earlier report is " + BK.ageText(DEV, "earlier", "later") + ". Between the two snapshots one value changed a lot and the best pair changed under one policy." },
      { label: "Nothing, reported values never change", correct: false, why: "Devices drift, which is why they are calibrated again and again. A report only describes the time it was made." },
      { label: "The simulator will stop working", correct: false, why: "A simulator has no calibration data and is not affected. The question is about a device's reported values." }
    ]
  }] });
});
</script>
