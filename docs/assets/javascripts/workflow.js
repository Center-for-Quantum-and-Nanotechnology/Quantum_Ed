// Shared module for Module 05's integrated workflows: one computation run through every software
// responsibility, on a simulator path or a device path, in one of three arrangements. Used by
// docs/05-software-stack/integrated-quantum-software-workflows.md (05.07), the last page of the module.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that don't call
// it. Page scripts that use window.QedWorkflow must run inside a DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> PATHS, STEPS, ARRANGEMENTS, CONSTRAINTS, ASPECTS (all data) and build, compare,
//                arrangementRows, validate. Pure functions of their inputs. build() calls
//                QedProgramForms, QedBackend, QedTransform, QedRuntime, and QedSimMethods at run time
//                and returns every step with what it received, what it produced, and, for the deciding
//                steps, what it knew when it acted. Nothing on a page is typed in: every artifact comes
//                from one of those modules, and the comparison tables are COMPUTED from builds.
//   text      -> plain sentences for each step and the result
//   rendering -> unitsHTML, detailHTML, viewHTML, comparisonTableHTML, arrangementTableHTML return strings
//                (they call QedCircuit, QedProgramForms, QedRuntime, and QedSimMethods for the pictures)
//   wiring    -> left to each page
//
// This is an ILLUSTRATIVE MODEL and adds nothing physical. The three arrangements are examples, not a
// complete list, and no platform is claimed to work this way. The device, its reports, job numbers, the
// queue, and every count are invented or simulated and labelled so. There is no clock: the runtime counts
// moments. The pair a policy "would choose" is shown, never applied to the circuit, and it never changes
// the counts; placement and routing are not taught here.
//
// A step is one responsibility acting once. A path is "simulator" or "device" (QedSoftwareStack calls the
// second one "hardware"; the map is in PATHS). Functions never mutate their arguments.
window.QedWorkflow = (function () {
  var DEFAULT_POLICY = "lowest-two-qubit";
  var DEFAULT_SHOTS = 100;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function dep(name) {
    var m = window[name];
    if (!m) throw new Error("QedWorkflow needs " + name);
    return m;
  }

  // ---- the data ------------------------------------------------------------------------------------
  var PATHS = [
    { id: "simulator", label: "Simulator", stackPath: "simulator" },
    { id: "device", label: "Device Q4", stackPath: "hardware" },
  ];

  // The pages of the module, for the "taught on" links (all in the same folder).
  var PAGES = {
    "05.01": { title: "Understanding the Quantum Software Stack", file: "understanding-the-quantum-software-stack.md" },
    "05.02": { title: "Quantum Program Representations", file: "quantum-program-representations.md" },
    "05.03": { title: "Compilation and Transpilation", file: "compilation-and-transpilation.md" },
    "05.04": { title: "Hardware Abstraction and Backend Capabilities", file: "hardware-abstraction-and-backend-capabilities.md" },
    "05.05": { title: "Simulation Engines and Methods", file: "simulation-engines-and-methods.md" },
    "05.06": { title: "Quantum Runtime and Classical-Quantum Orchestration", file: "quantum-runtime-and-classical-quantum-orchestration.md" },
  };

  // Each step is one responsibility from QedSoftwareStack acting once. `label` may differ by path.
  // `pages` says which pages taught it (it may differ by path). `paths` says where the step exists.
  var STEPS = [
    { id: "write", responsibility: "program", glyph: "✎", paths: ["simulator", "device"], pages: ["05.01"], label: "Write the program" },
    { id: "describe", responsibility: "representation", glyph: "≣", paths: ["simulator", "device"], pages: ["05.02"], label: "Describe it as data" },
    { id: "report", responsibility: "control", glyph: "◐", paths: ["device"], pages: ["05.04"], label: "The device's software reports its condition" },
    { id: "check", responsibility: "backend", glyph: "◇", paths: ["simulator", "device"], pages: ["05.04"], label: "Check what the target allows" },
    { id: "adapt", responsibility: "compilation", glyph: "⇄", paths: ["simulator", "device"], pages: ["05.03"], label: "Adapt the program" },
    { id: "send", responsibility: "runtime", glyph: "▷", paths: ["simulator", "device"], pages: ["05.06"], label: "Send the job" },
    { id: "run", responsibility: "target", glyph: "◉", paths: ["simulator", "device"], pages: { simulator: ["05.05", "05.06"], device: ["05.04", "05.06"] }, label: { simulator: "Run it on the simulator", device: "Run it on the device" } },
    { id: "return", responsibility: "runtime", glyph: "◁", paths: ["simulator", "device"], pages: ["05.06"], label: "Return the counts" },
    { id: "interpret", responsibility: "results", glyph: "≈", paths: ["simulator", "device"], pages: ["05.06"], label: "Interpret the counts" },
  ];

  var YOURS = "your tools";
  var SERVICE = "the service";
  var ONE = "the one tool";
  var PERFORMERS = [YOURS, SERVICE, ONE];

  // The three arrangements, invented and illustrative. `order` is the order the steps act. `by` says who
  // performs each. `reportAt` says which report the deciding steps have: "preparation" is the earlier one;
  // "after-wait" is the later one only when a newer report arrived while the job waited. `visible` groups
  // the steps into the actions the learner sees: the one tool does most of its steps in one call.
  var FIRST_ORDER = ["write", "describe", "report", "check", "adapt", "send", "run", "return", "interpret"];
  var ARRANGEMENTS = [
    {
      id: "prepare-then-send",
      label: "Prepare, then send",
      description: "Your tools describe the program, check the target, and adapt it, then send a job that already carries the adapted form. This is the workflow of the previous page.",
      servicePrepares: false,
      reportAt: "preparation",
      order: FIRST_ORDER,
      by: { write: YOURS, describe: YOURS, report: SERVICE, check: YOURS, adapt: YOURS, send: YOURS, run: SERVICE, "return": SERVICE, interpret: YOURS },
      visible: null,
    },
    {
      id: "send-then-service",
      label: "Send, then the service prepares",
      description: "Your tools send the program as written. The service checks the target and adapts it after receiving the job and after any wait.",
      servicePrepares: true,
      reportAt: "after-wait",
      order: ["write", "describe", "send", "report", "check", "adapt", "run", "return", "interpret"],
      by: { write: YOURS, describe: YOURS, send: YOURS, report: SERVICE, check: SERVICE, adapt: SERVICE, run: SERVICE, "return": SERVICE, interpret: YOURS },
      visible: null,
    },
    {
      id: "one-tool",
      label: "One tool does it all",
      description: "One call performs every step after the program is written, in the same order as Prepare, then send, combined into one visible action. Its steps still happen; you can open the list of what happened inside.",
      servicePrepares: false,
      reportAt: "preparation",
      order: FIRST_ORDER,
      by: { write: YOURS, describe: ONE, report: ONE, check: ONE, adapt: ONE, send: ONE, run: ONE, "return": ONE, interpret: ONE },
      visible: [["write"], ["describe", "report", "check", "adapt", "send", "run", "return", "interpret"]],
    },
  ];

  // Each pair is [before, after]: the step on the left must act before the step on the right. A pair that
  // names a step the path does not have is skipped.
  var CONSTRAINTS = [
    ["write", "describe"],
    ["describe", "check"],
    ["report", "check"],
    ["check", "adapt"],
    ["adapt", "run"],
    ["send", "run"],
    ["run", "return"],
    ["return", "interpret"],
  ];

  // What the comparison between two paths looks at, in the order the table shows it. `step` is the step
  // whose artifact each one reads.
  var ASPECTS = [
    { id: "program", label: "The program", step: "write" },
    { id: "instructions", label: "Its instruction list", step: "describe" },
    { id: "report", label: "The device's report", step: "report" },
    { id: "description", label: "The description of the target", step: "check" },
    { id: "adapted", label: "The adapted program", step: "adapt" },
    { id: "job", label: "What the job carries", step: "send" },
    { id: "lifecycle", label: "The job's life", step: "send" },
    { id: "method", label: "What carries out the run", step: "run" },
    { id: "results", label: "The results", step: "return" },
  ];

  function pathById(id) {
    var hit = PATHS.filter(function (p) { return p.id === id; })[0];
    if (!hit) throw new Error("QedWorkflow: there is no path called " + id);
    return hit;
  }

  function arrangementById(id) {
    var hit = ARRANGEMENTS.filter(function (a) { return a.id === id; })[0];
    if (!hit) throw new Error("QedWorkflow: there is no arrangement called " + id);
    return hit;
  }

  function stepById(id) {
    var hit = STEPS.filter(function (s) { return s.id === id; })[0];
    if (!hit) throw new Error("QedWorkflow: there is no step called " + id);
    return hit;
  }

  function stepsFor(pathId) {
    return STEPS.filter(function (s) { return s.paths.indexOf(pathId) >= 0; });
  }

  function pick(value, pathId) {
    return value && !Array.isArray(value) && typeof value === "object" ? value[pathId] : value;
  }

  function responsibilityOf(id, pathId) {
    var stack = dep("QedSoftwareStack");
    var r = stack.RESPONSIBILITIES.filter(function (x) { return x.id === id; })[0];
    if (!r) throw new Error("QedWorkflow: QedSoftwareStack has no responsibility called " + id);
    var label = r.label && typeof r.label === "object" ? r.label[pathById(pathId).stackPath] : r.label;
    return { id: r.id, label: label, group: r.group, groupLabel: stack.GROUPS[r.group].label };
  }

  // ---- the lifecycle, in words ----------------------------------------------------------------------
  function lifeOf(journey) {
    var R = dep("QedRuntime");
    var out = [];
    journey.forEach(function (s) {
      var last = out[out.length - 1];
      if (/^The service adapted/.test(s.crossed || "")) {
        out.push({ state: s.state, label: "Adapted by the service" });
      } else if (s.state === "queued" && last && last.state === "queued" && last.aheads) {
        last.aheads.push(s.ahead);
      } else if (s.state === "finished" && s.collected) {
        out.push({ state: "finished", label: "Counts collected" });
      } else {
        out.push({ state: s.state, label: R.stateById(s.state).label, aheads: s.state === "queued" ? [s.ahead] : null });
      }
    });
    return out.map(function (e) {
      return { state: e.state, label: e.label, text: e.aheads ? e.label + " (" + e.aheads.join(", ") + " ahead, invented)" : e.label };
    });
  }

  function listKey(list) {
    return list.map(function (l) { return l.text; }).join(" | ");
  }

  // ---- build --------------------------------------------------------------------------------------------
  // Run the Bell circuit through every step on a path, in an arrangement. options: { shots (100), number
  // (the job number, 1), newerReport (false; device only), policy ("lowest-two-qubit") }. Returns
  //   { path, arrangement, options, steps (in the order they act), units (what the learner steps through),
  //     order, job, journey, life, result, summary, decision, aspects }
  function build(pathId, arrangementId, options) {
    options = options || {};
    var path = pathById(pathId);
    var arr = arrangementById(arrangementId);
    var B = dep("QedBackend");
    var T = dep("QedTransform");
    var R = dep("QedRuntime");
    var PF = dep("QedProgramForms");
    var SM = dep("QedSimMethods");
    var device = path.id === "device";
    var target = device ? B.DEVICE : B.SIMULATOR;
    var shots = options.shots === undefined ? DEFAULT_SHOTS : options.shots;
    var number = options.number === undefined ? 1 : options.number;
    var newer = device && options.newerReport === true;
    var policyId = options.policy || DEFAULT_POLICY;

    var bell = PF.bell();
    var written = PF.instructionList(bell);
    var asWritten = R.check(bell, target);
    var adaptation = T.adapt(bell, target);
    var sentCircuit = arr.servicePrepares ? bell : adaptation.circuit;

    // the report the deciding steps have, and the pair the stated policy would choose from it
    var snapshotId = null;
    var knew = null;
    var decision = null;
    var caps = B.capabilities(target, { names: device ? target.qubits : undefined });
    if (device) {
      snapshotId = arr.reportAt === "after-wait" && newer ? "later" : "earlier";
      var snap = B.report(target, snapshotId).snapshot;
      var choice = B.choosePair(target, snapshotId, policyId);
      var best = choice.ranking.length ? choice.ranking[0].name : null;
      decision = { snapshotId: snapshotId, snapshotLabel: snap.label, time: snap.time, statusText: snap.statusText, policyId: choice.policy.id, policyLabel: choice.policy.label, pair: best, applied: false };
      knew = {
        snapshot: { id: snap.id, label: snap.label, time: snap.time, status: snap.status, statusText: snap.statusText },
        policy: { id: choice.policy.id, label: choice.policy.label },
        pair: best,
        applied: false,
        text: "It had the " + snap.label.toLowerCase() + " report (" + snap.time + ", invented; status: " + snap.statusText + "). Under the policy “" + choice.policy.label + "” the pair it would choose is " + (best || "none, because a needed value was not reported") +
          ". That is a possible decision: it is not applied to the circuit, and it does not change the counts.",
      };
    } else {
      knew = { snapshot: null, policy: null, pair: null, applied: false, text: "A simulator has no physical condition to report, so there was no report to know." };
    }

    // the job, run to the end
    var job0 = R.newJob(sentCircuit, target, shots, { number: number, servicePrepares: arr.servicePrepares });
    var journey = R.timeline(job0);
    var end = job0;
    for (var guard = 0; R.canAdvance(end); guard++) {
      if (guard > 50) throw new Error("QedWorkflow: a job should end within a few moments");
      end = R.advance(end);
    }
    var finished = end;
    var collected = R.canCollect(end) ? R.collect(end) : end;
    var result = R.results(finished);
    var summary = result ? R.summarize(result) : null;
    var life = lifeOf(journey);

    // the method on the simulator path (the state-vector method, the obvious one; the others can handle
    // the Bell circuit too, and the page says this simulator uses this one)
    var method = null;
    if (!device) {
      var cmp = SM.compare("ghz", 2);
      var sv = cmp.methods.filter(function (m) { return m.id === "state-vector"; })[0];
      method = {
        id: sv.id,
        label: sv.label,
        keeps: sv.keeps,
        size: sv.size,
        circuit: SM.circuit("ghz", 2),
        canHandle: cmp.methods.map(function (m) { return { id: m.id, label: m.label, supported: m.supported }; }),
      };
    }

    var pairsReport = device ? B.report(target, snapshotId).pairs.map(function (p) {
      var g = p.rows.filter(function (r) { return r.fieldId === "gate2q"; })[0];
      return { name: p.name, text: g ? g.text : "not reported" };
    }) : null;

    var sendText = arr.servicePrepares
      ? "Job " + job0.id + " (invented) goes to " + target.name + " with " + shots + " shots, carrying the program as written. The service will prepare it."
      : "Job " + job0.id + " (invented) goes to " + target.name + " with " + shots + " shots, carrying the program already adapted.";

    var counts = result ? result.labels.map(function (l, i) { return l + ": " + result.counts[i]; }).join(", ") : "none";
    var runText = device
      ? "Device Q4 carries out the job. Its life: " + listKey(life) + "."
      : "The simulator carries out the job with its method, the " + method.label.toLowerCase() + " method, which keeps " + method.size.count + " amplitudes for two qubits (" + method.size.tag + "). Its life: " + listKey(life) + ".";

    var produced = {
      write: { text: "The Bell circuit, written as a circuit.", view: { type: "circuit", circuit: bell } },
      describe: { text: "The same computation as an ordered list of " + written.length + " instructions.", view: { type: "instructions", circuit: bell } },
      report: device ? {
        text: "The " + decision.snapshotLabel.toLowerCase() + " report (" + decision.time + ", invented): " + decision.statusText + ".",
        view: { type: "report", snapshotLabel: decision.snapshotLabel, time: decision.time, statusText: decision.statusText, pairs: pairsReport },
      } : null,
      check: {
        text: asWritten.text.replace(/ in the job\.$/, " in the program.") + (asWritten.ok ? "" : " The program will need to change."),
        view: { type: "description", name: target.name, operations: caps.operations, connections: caps.connections, limit: caps.limit, verdict: asWritten.text },
      },
      adapt: {
        text: adaptation.steps.length ? adaptation.steps.map(function (s) { return s.text; }).join(" ") : target.name + " lists every operation, so nothing changed.",
        view: { type: "adaptation", steps: adaptation.steps.map(function (s) { return s.text; }), circuit: adaptation.circuit },
      },
      send: { text: sendText, view: { type: "instructions", circuit: sentCircuit }, jobId: job0.id },
      run: { text: runText, view: { type: "run", life: life, method: method } },
      "return": result ? { text: "The counts: " + counts + " (" + shots + " shots, simulated).", view: { type: "counts", result: result } } : { text: "No counts came back.", view: { type: "none" } },
      interpret: summary ? {
        text: "The two bits agreed in " + summary.agreeCount + " of " + shots + " shots (" + (Math.round(summary.agreeFraction * 1000) / 10) + "%). The classical side can keep this number, print it, or use it to choose the next job.",
        view: { type: "numbers", summary: summary, shots: shots },
      } : { text: "There is nothing to interpret.", view: { type: "none" } },
    };

    var received = {
      write: "Your intent: prepare two qubits together, then measure both.",
      describe: "The circuit.",
      report: "The device's own record of its condition.",
      check: "The program as a list of instructions, and " + target.name + "'s description.",
      adapt: "The program, and what " + target.name + " allows.",
      send: arr.servicePrepares ? "The program as written, and the settings." : "The adapted program, and the settings.",
      run: "The job, with " + target.name + "'s description of what it allows.",
      "return": "The finished job.",
      interpret: "The counts.",
    };

    var order = arr.order.filter(function (id) { return stepById(id).paths.indexOf(path.id) >= 0; });
    var steps = order.map(function (id, index) {
      var def = stepById(id);
      var r = responsibilityOf(def.responsibility, path.id);
      var pages = pick(def.pages, path.id).map(function (pid) { return { id: pid, title: PAGES[pid].title, file: PAGES[pid].file }; });
      return {
        id: id,
        index: index,
        glyph: def.glyph,
        label: pick(def.label, path.id),
        responsibility: r.id,
        responsibilityLabel: r.label,
        group: r.group,
        groupLabel: r.groupLabel,
        by: arr.by[id],
        pages: pages,
        received: received[id],
        produced: produced[id],
        knew: id === "check" || id === "adapt" ? knew : null,
      };
    });

    // what the learner steps through: each step on its own, except where the arrangement combines some
    var units;
    if (arr.visible) {
      units = arr.visible.map(function (ids) {
        var inside = steps.filter(function (s) { return ids.indexOf(s.id) >= 0; });
        return inside.length === 1 ? { steps: inside, combined: false, label: inside[0].label, by: inside[0].by } : { steps: inside, combined: true, label: "Call the one tool", by: inside[0].by };
      });
    } else {
      units = steps.map(function (s) { return { steps: [s], combined: false, label: s.label, by: s.by }; });
    }

    // what each aspect of the run is, as text and as a key that says when two paths agree
    var lifeKey = life.map(function (l) { return l.label; }).join(" > ");
    var aspects = {
      program: { key: "bell", text: "The Bell circuit." },
      instructions: { key: written.map(function (l) { return l.text; }).join(" | "), text: written.map(function (l) { return l.text; }).join(", ") },
      description: { key: JSON.stringify([caps.operations, caps.connections, caps.limit]), text: "Operations: " + caps.operations.join(", ") + ". Connections: " + caps.connections.join(", ") + "." },
      adapted: {
        key: dep("QedProgramForms").instructionList(adaptation.circuit).map(function (l) { return l.text; }).join(" | "),
        text: dep("QedProgramForms").instructionList(adaptation.circuit).map(function (l) { return l.text; }).join(", "),
      },
      job: {
        key: dep("QedProgramForms").instructionList(sentCircuit).map(function (l) { return l.text; }).join(" | "),
        text: (arr.servicePrepares ? "The program as written: " : "The adapted program: ") + dep("QedProgramForms").instructionList(sentCircuit).map(function (l) { return l.text; }).join(", "),
      },
      lifecycle: { key: lifeKey, text: lifeKey },
      method: device ? { key: "device", text: "The device itself." } : { key: "method:" + method.id, text: "A simulation method: the " + method.label.toLowerCase() + " method." },
      results: {
        key: "counts",
        text: "Counts over 00, 01, 10, and 11 (simulated).",
        note: device ? "The counts include an invented share of off-pattern outcomes (01 and 10)." : "A simulator can also show exact probabilities (05.05).",
      },
    };
    if (device) aspects.report = { key: snapshotId + ":" + pairsReport.map(function (p) { return p.name + "=" + p.text; }).join(";"), text: decision.snapshotLabel + " report, " + decision.time + " (invented)." };

    return {
      path: path.id,
      pathLabel: path.label,
      arrangement: arr.id,
      arrangementLabel: arr.label,
      options: { shots: shots, number: number, newerReport: newer, policy: policyId },
      order: order,
      steps: steps,
      units: units,
      job: { id: job0.id, number: number, servicePrepares: arr.servicePrepares, moments: R.finalMoment(job0) },
      journey: journey,
      life: life,
      result: result,
      summary: summary,
      decision: decision,
      aspects: aspects,
    };
  }

  // ---- validate -----------------------------------------------------------------------------------------
  // The problems with a build, as plain sentences; an empty list means it is sound. It checks that the
  // path has exactly its steps, each once, that every ordering constraint holds, that what the learner
  // steps through covers the steps in order, and that the counts add up.
  function validate(b) {
    var problems = [];
    var expected = stepsFor(b.path).map(function (s) { return s.id; });
    var seen = {};
    b.steps.forEach(function (s) {
      if (seen[s.id]) problems.push("The step " + s.id + " appears more than once.");
      seen[s.id] = true;
    });
    expected.forEach(function (id) { if (!seen[id]) problems.push("The step " + id + " is missing."); });
    b.steps.forEach(function (s) { if (expected.indexOf(s.id) < 0) problems.push("The step " + s.id + " does not belong on this path."); });
    if (b.order.join() !== b.steps.map(function (s) { return s.id; }).join()) problems.push("The order and the steps disagree.");
    CONSTRAINTS.forEach(function (c) {
      var i = b.order.indexOf(c[0]);
      var j = b.order.indexOf(c[1]);
      if (i < 0 || j < 0) return;
      if (i > j) problems.push("The step " + c[0] + " must come before " + c[1] + ".");
    });
    var flat = [];
    b.units.forEach(function (u) { u.steps.forEach(function (s) { flat.push(s.id); }); });
    if (flat.join() !== b.order.join()) problems.push("What the learner steps through does not cover the steps in order.");
    if (b.result && b.result.counts.reduce(function (a, c) { return a + c; }, 0) !== b.options.shots) problems.push("The counts do not add up to the shots.");
    b.steps.forEach(function (s) {
      if ((s.id === "check" || s.id === "adapt") && !s.knew) problems.push("The step " + s.id + " does not say what it knew.");
    });
    return problems;
  }

  // ---- compare -----------------------------------------------------------------------------------------------
  // What stays the same and what changes between two builds (usually the two paths in one arrangement),
  // computed from their aspects. A row is "shared" when both have the aspect and it is the same, "differs"
  // when both have it and it is not, and "one path only" when only one has it.
  function compare(a, b) {
    return ASPECTS.map(function (asp) {
      var x = a.aspects[asp.id];
      var y = b.aspects[asp.id];
      var status = x && y ? (x.key === y.key ? "shared" : "differs") : "one path only";
      var step = stepById(asp.step);
      var r = responsibilityOf(step.responsibility, (x ? a : b).path);
      var notes = [];
      if (x && x.note) notes.push(a.pathLabel + ": " + x.note);
      if (y && y.note) notes.push(b.pathLabel + ": " + y.note);
      return {
        id: asp.id,
        label: asp.label,
        responsibility: r.label,
        group: r.groupLabel,
        status: status,
        only: status === "one path only" ? (x ? a.pathLabel : b.pathLabel) : null,
        a: x ? x.text : null,
        b: y ? y.text : null,
        note: notes.join(" "),
      };
    });
  }

  function knewText(knew) {
    return knew.snapshot ? "The " + knew.snapshot.label.toLowerCase() + " report; the pair under “" + knew.policy.label + "” would be " + knew.pair + "." : "No report: a simulator has none.";
  }

  // The three arrangements on one path, as rows computed from builds: the order the steps act, who
  // performs each, what the deciding steps knew (with the report they had, and with a newer one if it
  // arrived while the job waited), what the job carried, and how many moments it took.
  function arrangementRows(pathId, options) {
    var withNewer = Object.assign({}, options || {}, { newerReport: true });
    return ARRANGEMENTS.map(function (arr) {
      var b = build(pathId, arr.id, Object.assign({}, options || {}, { newerReport: false }));
      var check = b.steps.filter(function (s) { return s.id === "check"; })[0];
      var knew = check.knew;
      var newer = pathId === "device" ? build(pathId, arr.id, withNewer).steps.filter(function (s) { return s.id === "check"; })[0].knew : null;
      return {
        id: arr.id,
        label: arr.label,
        description: arr.description,
        order: b.units.map(function (u) { return u.label; }),
        steps: b.steps.map(function (s) { return { id: s.id, label: s.label, by: s.by }; }),
        by: b.units.map(function (u) { return u.by; }),
        knew: knewText(knew),
        knewNewer: newer ? knewText(newer) : null,
        pair: knew.pair,
        pairNewer: newer ? newer.pair : null,
        carried: b.aspects.job.text.split(":")[0],
        moments: b.job.moments,
        result: b,
      };
    });
  }

  // ---- text -----------------------------------------------------------------------------------------------------
  function explain(b) {
    return "Whichever way the steps were arranged, the result is the same kind of thing: counts. The arrangement changed who did what" +
      (b.decision ? ", and what the deciding steps knew when they acted." : ".");
  }

  function describeUnit(b, index) {
    var u = b.units[index];
    if (!u) throw new Error("QedWorkflow: there is no step " + index);
    var head = "Step " + (index + 1) + " of " + b.units.length + ". " + u.label + ". Performed by " + u.by + ".";
    if (u.combined) {
      return head + " Inside the call: " + u.steps.map(function (s) { return s.label.toLowerCase(); }).join(", then ") + ". " + u.steps[u.steps.length - 1].produced.text;
    }
    var s = u.steps[0];
    return head + " " + s.responsibilityLabel + ", " + s.groupLabel + ". " + s.produced.text + (s.knew ? " " + s.knew.text : "");
  }

  // ---- rendering ----------------------------------------------------------------------------------------------------
  function tag(text, cls) {
    return '<span class="qed-wf__tag' + (cls ? " qed-wf__tag--" + cls : "") + '">' + esc(text) + "</span>";
  }

  function linksHTML(pages) {
    return pages.map(function (p) { return '<a href="' + esc(p.file) + '">' + esc(p.id + " " + p.title) + "</a>"; }).join(", ");
  }

  function stepItemHTML(s, state) {
    return '<li class="qed-wf__step' + (state === "now" ? " is-now" : "") + (state === "done" ? " is-done" : "") + '" data-step="' + esc(s.id) + '" data-group="' + esc(s.group) + '"' + (state === "now" ? ' aria-current="step"' : "") + ">" +
      '<span class="qed-wf__glyph" aria-hidden="true">' + esc(s.glyph) + "</span>" +
      "<strong>" + esc(s.label) + "</strong>" +
      (state === "now" ? '<span class="qed-wf__badge">now</span>' : "") + (state === "done" ? tag("done") : "") +
      '<span class="qed-wf__tags">' + tag(s.groupLabel, "group") + " " + tag("by " + s.by, "by") + "</span></li>";
  }

  // The steps the learner moves through, as an ordered list. `cursor` is the unit that is current (-1 for
  // none yet); earlier units are done. A combined unit shows what happened inside once it has been reached.
  function unitsHTML(b, cursor) {
    var items = b.units.map(function (u, i) {
      var state = i === cursor ? "now" : (i < cursor ? "done" : "todo");
      if (!u.combined) return stepItemHTML(u.steps[0], state);
      var inside = i <= cursor
        ? '<details class="qed-details qed-wf__inside"><summary>What happened inside</summary><ol class="qed-wf__list qed-wf__list--inside">' + u.steps.map(function (s) { return stepItemHTML(s, "todo"); }).join("") + "</ol></details>"
        : "";
      return '<li class="qed-wf__step qed-wf__step--combined' + (state === "now" ? " is-now" : "") + (state === "done" ? " is-done" : "") + '"' + (state === "now" ? ' aria-current="step"' : "") + ">" +
        '<span class="qed-wf__glyph" aria-hidden="true">▣</span><strong>' + esc(u.label) + "</strong>" +
        (state === "now" ? '<span class="qed-wf__badge">now</span>' : "") + (state === "done" ? tag("done") : "") +
        '<span class="qed-wf__tags">' + tag("by " + u.by, "by") + " " + tag(u.steps.length + " steps in one call") + "</span>" + inside + "</li>";
    });
    return '<ol class="qed-wf__list" aria-label="The steps of this workflow">' + items.join("") + "</ol>";
  }

  function listHTML(items) {
    return "<ul>" + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  // One picture or table for what a step produced, from the module that made it.
  function viewHTML(v) {
    var PF = window.QedProgramForms;
    var R = window.QedRuntime;
    var QC = window.QedCircuit;
    var SM = window.QedSimMethods;
    if (!v || v.type === "none") return "";
    if (v.type === "circuit") return '<div class="qed-wf__circuit">' + QC.renderSVG(v.circuit) + "</div>";
    if (v.type === "instructions") return PF.instructionListHTML(v.circuit, { interactive: false, ariaLabel: "Instructions" });
    if (v.type === "report") {
      return '<div class="qed-wf__reported"><p><strong>' + esc(v.snapshotLabel) + " report</strong> " + tag("invented") + " " + tag("reported") + " " + esc(v.time) + ". Status: " + esc(v.statusText) + ".</p>" +
        listHTML(v.pairs.map(function (p) { return p.name + ": two-qubit gate error " + p.text; })) + "</div>";
    }
    if (v.type === "description") {
      return "<p><strong>" + esc(v.name) + "</strong> lists these operations: " + esc(v.operations.join(", ")) + ".</p><p>Connections: " + esc(v.connections.join("; ")) + ".</p>" +
        (v.limit ? "<p>" + esc(v.limit) + "</p>" : "");
    }
    if (v.type === "adaptation") {
      return (v.steps.length ? listHTML(v.steps) : "<p>No rewrite was needed.</p>") + PF.instructionListHTML(v.circuit, { interactive: false, ariaLabel: "The adapted instructions" });
    }
    if (v.type === "run") {
      var life = '<ol class="qed-wf__life" aria-label="The job\'s life">' + v.life.map(function (l) { return "<li>" + esc(l.text) + "</li>"; }).join("") + "</ol>";
      var m = v.method ? "<p>" + esc(v.method.label) + " method: " + esc(v.method.keeps) + " " + tag(v.method.size.tag) + "</p>" + SM.amplitudeTableHTML(SM.stateVector(v.method.circuit)) +
        "<p>All three methods from 05.05 can handle this circuit: " + esc(v.method.canHandle.map(function (c) { return c.label.toLowerCase() + (c.supported ? " (yes)" : " (no)"); }).join(", ")) + ".</p>" : "";
      return life + m;
    }
    if (v.type === "counts") return R.countsTableHTML(v.result) + "<p>" + tag("simulated") + (v.result.invented ? " " + tag("invented off-pattern share") : "") + "</p>";
    if (v.type === "numbers") return "<p>" + tag("simulated") + " Agreement: " + v.summary.agreeCount + " of " + v.shots + ".</p>";
    return "";
  }

  function stepDetailHTML(s) {
    return '<div class="qed-wf__detail" data-step="' + esc(s.id) + '">' +
      "<h4>" + esc(s.glyph + " " + s.label) + "</h4>" +
      '<p class="qed-wf__meta">' + esc(s.responsibilityLabel) + " " + tag(s.groupLabel, "group") + " " + tag("by " + s.by, "by") + "</p>" +
      "<p><strong>Received:</strong> " + esc(s.received) + "</p>" +
      "<p><strong>Produced:</strong> " + esc(s.produced.text) + "</p>" +
      viewHTML(s.produced.view) +
      (s.knew ? '<div class="qed-wf__possible"><p><strong>What it knew when it acted</strong> ' + tag("possible") + "</p><p>" + esc(s.knew.text) + "</p></div>" : "") +
      '<p class="qed-wf__taught">Taught on: ' + linksHTML(s.pages) + ".</p></div>";
  }

  // What the learner sees for one unit. A combined unit shows each inside step.
  function detailHTML(b, index) {
    var u = b.units[index];
    if (!u) throw new Error("QedWorkflow: there is no step " + index);
    return u.steps.map(stepDetailHTML).join("");
  }

  function tableHTML(head, rows) {
    return '<table class="qed-xf__table"><thead><tr>' + head.map(function (h) { return '<th scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.join("") + "</tbody></table>";
  }

  // The comparison of two builds, from compare(): one row for each aspect.
  function comparisonTableHTML(rows, aLabel, bLabel) {
    var head = ["What", "Responsibility", "Status", aLabel, bLabel];
    var body = rows.map(function (r) {
      var status = r.status === "one path only" ? "Only on the " + r.only.toLowerCase() + " path" : (r.status === "shared" ? "Shared" : "Differs");
      return '<tr><th scope="row">' + esc(r.label) + '</th><td data-label="Responsibility">' + esc(r.responsibility) + '</td><td data-label="Status">' + tag(status, r.status === "differs" ? "differs" : (r.status === "shared" ? "shared" : "one")) + "</td>" +
        '<td data-label="' + esc(aLabel) + '">' + (r.a ? esc(r.a) : "—") + (r.note && r.a ? "" : "") + '</td><td data-label="' + esc(bLabel) + '">' + (r.b ? esc(r.b) : "—") + "</td></tr>" +
        (r.note ? '<tr class="qed-wf__note-row"><td colspan="5">' + esc(r.note) + "</td></tr>" : "");
    });
    return tableHTML(head, body);
  }

  // The arrangements, from arrangementRows().
  function arrangementTableHTML(rows) {
    var newer = rows.length > 0 && rows[0].knewNewer !== null;
    var head = ["Arrangement", "The steps, in order, and who performs each", "What the deciding steps knew"].concat(newer ? ["If a newer report arrived while the job waited"] : []).concat(["What the job carried", "Moments"]);
    var body = rows.map(function (r) {
      return '<tr><th scope="row">' + esc(r.label) + '</th><td data-label="The steps, in order, and who performs each">' + esc(r.order.map(function (label, i) { return label + " (" + r.by[i] + ")"; }).join(" → ")) + "</td>" +
        '<td data-label="What the deciding steps knew">' + esc(r.knew) + "</td>" +
        (newer ? '<td data-label="If a newer report arrived while the job waited">' + esc(r.knewNewer) + "</td>" : "") +
        '<td data-label="What the job carried">' + esc(r.carried) + '</td><td data-label="Moments">' + r.moments + "</td></tr>";
    });
    return tableHTML(head, body);
  }

  return {
    PATHS: PATHS,
    PAGES: PAGES,
    STEPS: STEPS,
    PERFORMERS: PERFORMERS,
    ARRANGEMENTS: ARRANGEMENTS,
    CONSTRAINTS: CONSTRAINTS,
    ASPECTS: ASPECTS,
    pathById: pathById,
    arrangementById: arrangementById,
    stepById: stepById,
    stepsFor: stepsFor,
    build: build,
    validate: validate,
    compare: compare,
    arrangementRows: arrangementRows,
    explain: explain,
    describeUnit: describeUnit,
    unitsHTML: unitsHTML,
    detailHTML: detailHTML,
    viewHTML: viewHTML,
    comparisonTableHTML: comparisonTableHTML,
    arrangementTableHTML: arrangementTableHTML,
  };
})();
