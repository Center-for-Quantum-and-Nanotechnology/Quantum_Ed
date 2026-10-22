// Shared module for Module 05's runtime: the life of a job sent to a target, the counts
// that come back, and a small loop of jobs. Used by
// docs/05-software-stack/quantum-runtime-and-classical-quantum-orchestration.md (05.06) and
// intended for 05.07 (the runtime's part in complete workflows, simulator and device).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedRuntime must run inside a DOMContentLoaded
// listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> STATES (data), check, newJob, advance, cancel, collect, timeline, results,
//                summarize, rotationProbability, nextAngle, runLoop. Pure functions of their
//                inputs; a job is never changed, each step returns a new one. It calls
//                QedTransform (the `allows` check), QedShots (seeded counts), and QedGates
//                (the rotation) at run time, and reads the QedBackend descriptions the page
//                passes in.
//   text      -> plain sentences for what each side holds and what just crossed
//   rendering -> lanesHTML, statusHTML, lifecycleHTML, countsTableHTML, loopTableHTML return
//                strings
//   wiring    -> left to each page
//
// This is an ILLUSTRATIVE MODEL, not a client for anything. The states, the job numbers, the
// queue ("jobs ahead"), and every count are invented and labelled so. Real platforms name and
// number the stages differently and may not queue at all. There is no clock: the page counts
// MOMENTS (steps), never seconds, and no duration, queue length, price, or limit is shown or
// claimed to be typical. A job that is Rejected, Failed, or Cancelled never has results.
//
// The target decides rejection from its `allows` (the shape QedTransform and QedBackend share),
// through QedTransform.adapt: an operation is not listed when adapting it to the target would
// have to change it. There is no second rule.
//
// Circuits have the shape QedCircuit draws and QedProgramForms lists: { qubits, ops } with an
// `id` on each op. Basis order for counts is 00, 01, 10, 11 with q0 the left digit, as in
// Module 02. Functions never mutate their arguments.
window.QedRuntime = (function () {
  var SUBSCRIPTS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

  // ---- invented numbers, in one place ------------------------------------------------------
  var QUEUE_AHEAD = 3;          // jobs ahead of yours when a device job joins its queue (invented)
  var OFF_SHARE = 0.04;         // chance of each of 01 and 10 in Bell counts on the device path (invented)
  var FLIP = 0.03;              // chance a reported bit is flipped on the device path of the loop (invented)
  var ANGLE_START = 30;         // degrees
  var TARGET_FRACTION = 0.75;   // the fraction of 1s the loop steers toward; 120 degrees gives it
  var GAIN = 100;               // degrees of change per unit of gap between the target and the estimate
  var TOLERANCE = 0.05;
  var MAX_PASSES = 10;
  var LOOP_SEED = 7;
  var LABELS = ["00", "01", "10", "11"];

  function qname(i) {
    return "q" + String(i).split("").map(function (d) { return SUBSCRIPTS[Number(d)]; }).join("");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function dep(name) {
    var m = window[name];
    if (!m) throw new Error("QedRuntime needs " + name);
    return m;
  }

  // ---- the lifecycle, as data ---------------------------------------------------------------
  // kind: "step" (on the way), "exit" (the job ends without results).
  var STATES = [
    { id: "prepared", label: "Prepared", glyph: "○", kind: "step", words: "The program side has the job ready. Nothing has been sent." },
    { id: "submitted", label: "Submitted", glyph: "▷", kind: "step", words: "The job has been handed to the target. It has not run." },
    { id: "queued", label: "Queued", glyph: "≡", kind: "step", words: "The job is waiting for its turn. The status says nothing about how long that will take." },
    { id: "running", label: "Running", glyph: "◉", kind: "step", words: "The target is carrying out the job." },
    { id: "finished", label: "Finished", glyph: "✓", kind: "step", words: "The run completed. Whether the results are useful is a separate question." },
    { id: "rejected", label: "Rejected", glyph: "✕", kind: "exit", words: "The target refused the job at submission, so it never ran. There are no results." },
    { id: "failed", label: "Failed", glyph: "!", kind: "exit", words: "The run stopped partway. There are no results, which is different from results that are wrong." },
    { id: "cancelled", label: "Cancelled", glyph: "⊘", kind: "exit", words: "The program withdrew the job. There are no results." },
  ];

  var OUTCOMES = [
    { id: "finishes", label: "The job finishes" },
    { id: "rejected", label: "The target rejects it at submission" },
    { id: "fails", label: "The run fails partway" },
  ];

  function stateById(id) {
    var hit = STATES.filter(function (s) { return s.id === id; })[0];
    if (!hit) throw new Error("QedRuntime: there is no state called " + id);
    return hit;
  }

  function isTerminal(state) {
    return state === "rejected" || state === "failed" || state === "cancelled";
  }

  // Does the target put jobs in a line? Devices do in this model; the simulator starts at once.
  // A real simulator service might queue, and a real device might not, which the page says.
  function queues(target) {
    return target.kind === "device";
  }

  // ---- checking a circuit against a target ------------------------------------------------------
  // Which operations does the target not list? An operation is not listed when adapting a
  // circuit that holds only that operation would have to change it (QedTransform's own rule).
  function check(circuit, target) {
    var T = dep("QedTransform");
    var offending = [];
    circuit.ops.forEach(function (op) {
      var single = { qubits: circuit.qubits, ops: [op] };
      var a = T.adapt(single, target);
      if (a.steps.length > 0 || a.problems.length > 0) offending.push({ id: op.id, text: T.opText(op) });
    });
    var text = offending.length === 0
      ? target.name + " lists every operation in the job."
      : target.name + " does not list " + offending.map(function (o) { return o.text; }).join(", ") + ".";
    return { ok: offending.length === 0, offending: offending, text: text };
  }

  // The circuit the page sends for a chosen outcome. `base` is the Bell circuit with ids
  // (QedProgramForms.bell()). Finishing or failing sends the circuit adapted to the target; a
  // rejection sends it as first written, plus a T gate when the target already lists everything
  // in it (the simulator), so the target has an operation to refuse.
  function circuitFor(outcome, target, base) {
    var T = dep("QedTransform");
    if (outcome !== "rejected") return T.adapt(base, target).circuit;
    var first = check(base, target);
    if (!first.ok) return copyCircuit(base);
    var ops = base.ops.map(function (op) { return Object.assign({}, op); });
    var lastBefore = -1;
    ops.forEach(function (op, k) {
      if (op.type !== "measure") lastBefore = Math.max(lastBefore, typeof op.col === "number" ? op.col : k);
    });
    ops.forEach(function (op) { if (op.type === "measure") op.col = (typeof op.col === "number" ? op.col : 0) + 1; });
    ops.splice(ops.filter(function (o) { return o.type !== "measure"; }).length, 0,
      { id: "t1", type: "gate", gateId: "t", label: "T", name: "T", targets: [0], col: lastBefore + 1 });
    return { qubits: base.qubits, ops: ops };
  }

  function copyCircuit(c) {
    return { qubits: c.qubits, ops: c.ops.map(function (op) { return Object.assign({}, op); }) };
  }

  // ---- the job ----------------------------------------------------------------------------------
  function jobId(number) {
    var s = String(number);
    while (s.length < 4) s = "0" + s;
    return "job-" + s;
  }

  // A new job: Prepared, at moment 0. options: { number (default 1), fate: "completes" | "fails" }.
  function newJob(circuit, target, shots, options) {
    options = options || {};
    if (!target || !target.allows) throw new Error("QedRuntime: a job needs a target description");
    if (typeof shots !== "number" || shots < 1 || Math.floor(shots) !== shots) throw new Error("QedRuntime: shots must be a whole number of at least 1");
    var fate = options.fate || "completes";
    if (fate !== "completes" && fate !== "fails") throw new Error("QedRuntime: fate must be completes or fails");
    var number = options.number === undefined ? 1 : options.number;
    return {
      number: number,
      id: jobId(number),
      circuit: copyCircuit(circuit),
      target: target,
      shots: shots,
      fate: fate,
      state: "prepared",
      moment: 0,
      ahead: 0,
      collected: false,
      crossed: null,
      reason: null,
      history: [{ state: "prepared", moment: 0 }],
    };
  }

  function step(job, state, extra) {
    var next = Object.assign({}, job, extra || {});
    next.state = state;
    next.moment = job.moment + 1;
    next.history = job.history.concat([{ state: state, moment: next.moment }]);
    return next;
  }

  function canAdvance(job) {
    return !isTerminal(job.state) && job.state !== "finished";
  }

  function canCancel(job) {
    return job.state === "queued" || job.state === "running";
  }

  function canCollect(job) {
    return job.state === "finished" && !job.collected;
  }

  // The next moment in the job's life. Throws for a job that has ended.
  function advance(job) {
    if (!canAdvance(job)) throw new Error("QedRuntime: a " + job.state + " job cannot advance");
    if (job.state === "prepared") {
      return step(job, "submitted", { crossed: "The job went from the program side to the target." });
    }
    if (job.state === "submitted") {
      var c = check(job.circuit, job.target);
      if (!c.ok) return step(job, "rejected", { reason: c.text, crossed: "A refusal came back: " + c.text });
      if (queues(job.target)) return step(job, "queued", { ahead: QUEUE_AHEAD, crossed: "A status came back: queued." });
      return step(job, "running", { crossed: "A status came back: running." });
    }
    if (job.state === "queued") {
      if (job.ahead > 0) return step(job, "queued", { ahead: job.ahead - 1, crossed: "A status came back: still queued." });
      return step(job, "running", { ahead: 0, crossed: "A status came back: running." });
    }
    // running
    if (job.fate === "fails") {
      return step(job, "failed", { reason: "The target stopped the run before it finished (an invented reason).", crossed: "A status came back: failed. No counts." });
    }
    return step(job, "finished", { crossed: "A status came back: finished." });
  }

  // Withdraw a job that is waiting or running.
  function cancel(job) {
    if (!canCancel(job)) throw new Error("QedRuntime: a " + job.state + " job cannot be cancelled");
    return step(job, "cancelled", { crossed: "A request to withdraw the job went to the target.", reason: "The program withdrew the job." });
  }

  // Get the counts of a finished job. Separate from finishing: the results are collected.
  function collect(job) {
    if (!canCollect(job)) throw new Error("QedRuntime: only a finished job whose counts have not been collected can be collected");
    var next = Object.assign({}, job, { collected: true, moment: job.moment + 1, crossed: "The counts went from the target to the program side." });
    next.history = job.history.concat([{ state: "finished", moment: next.moment, collected: true }]);
    return next;
  }

  // Every moment from now to the end: [{ state, moment, ahead, collected, crossed }]. The first
  // entry is the job as it is. A job that finishes ends with the moment its counts are collected.
  function timeline(job) {
    var out = [snap(job)];
    var cur = job;
    var guard = 0;
    while (guard++ < 50) {
      if (canAdvance(cur)) cur = advance(cur);
      else if (canCollect(cur)) cur = collect(cur);
      else break;
      out.push(snap(cur));
    }
    return out;
  }

  function snap(j) {
    return { state: j.state, moment: j.moment, ahead: j.ahead, collected: j.collected, crossed: j.crossed };
  }

  function finalMoment(job) {
    var t = timeline(job);
    return t[t.length - 1].moment;
  }

  // ---- results ------------------------------------------------------------------------------------
  // Seeded counts for a finished job: the first run is the same on every load, and a new job (a
  // new number) gives different counts. Every count is simulated. The simulator path is the ideal
  // Bell pattern (only 00 and 11); the device path adds a small invented share of 01 and 10.
  function seedFor(number) {
    return 1000 + number * 37;
  }

  function bellProbabilities(target) {
    if (target.kind === "device") return [(1 - 2 * OFF_SHARE) / 2, OFF_SHARE, OFF_SHARE, (1 - 2 * OFF_SHARE) / 2];
    return [0.5, 0, 0, 0.5];
  }

  function results(job) {
    if (job.state !== "finished") return null;
    var S = dep("QedShots");
    var probs = bellProbabilities(job.target);
    var drawn = S.sample(probs, job.shots, S.rng(seedFor(job.number)));
    return {
      jobId: job.id,
      targetName: job.target.name,
      kind: job.target.kind,
      shots: job.shots,
      labels: LABELS.slice(),
      counts: drawn.counts,
      simulated: true,
      invented: job.target.kind === "device",
    };
  }

  // Counts as numbers the program can use: a fraction for each outcome, and how often the two
  // bits agreed (00 or 11).
  function summarize(result) {
    var total = result.counts.reduce(function (a, b) { return a + b; }, 0);
    var fractions = result.counts.map(function (c) { return total === 0 ? 0 : c / total; });
    var agree = result.counts[0] + result.counts[3];
    return { total: total, fractions: fractions, agreeCount: agree, agreeFraction: total === 0 ? 0 : agree / total };
  }

  // ---- the loop of jobs ------------------------------------------------------------------------------------
  // The chance of reading 1 after a turn by `angleDeg` about the y axis on a qubit that starts
  // at 0, from the QedGates rotation. `flip` is the chance a reported bit is flipped (the
  // invented device-path share).
  function rotationProbability(angleDeg, flip) {
    var G = dep("QedGates");
    var g = G.rotation("y", angleDeg);
    var s = G.apply(g, { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } });
    var p = s.beta.re * s.beta.re + s.beta.im * s.beta.im;
    var f = flip || 0;
    return p * (1 - f) + (1 - p) * f;
  }

  function roundTenth(x) {
    return Math.round(x * 10) / 10;
  }

  // The scripted rule: change the angle by GAIN degrees times the gap between the target and the
  // estimate, kept between 0 and 180 degrees. One simple rule among many.
  function nextAngle(estimate, angle, target, gain) {
    var t = target === undefined ? TARGET_FRACTION : target;
    var g = gain === undefined ? GAIN : gain;
    return roundTenth(Math.min(180, Math.max(0, angle + g * (t - estimate))));
  }

  // Is the estimate within the tolerance of the target? Rounded first, so an estimate exactly
  // one tolerance away (0.8 against 0.75 and 0.05) counts, whatever the floating-point error.
  function within(estimate, target, tolerance) {
    return Math.round(Math.abs(estimate - target) * 1e9) / 1e9 <= tolerance;
  }

  // Run the loop. opts: { kind: "simulator" | "device", shots, passes (how many passes to run
  // now, default the limit), seed, startAngle, target, tolerance, maxPasses, gain }. Each pass draws
  // its own counts from its own seed, so running fewer passes gives the first rows of the
  // longer run. Returns { passes, jobs, shotsUsed, stopped }, where stopped is "tolerance",
  // "limit", or null while the loop would still go on.
  function runLoop(opts) {
    var S = dep("QedShots");
    opts = opts || {};
    var kind = opts.kind === "device" ? "device" : "simulator";
    var shots = opts.shots === undefined ? 100 : opts.shots;
    if (typeof shots !== "number" || shots < 1 || Math.floor(shots) !== shots) throw new Error("QedRuntime: shots must be a whole number of at least 1");
    var maxPasses = opts.maxPasses === undefined ? MAX_PASSES : opts.maxPasses;
    var run = Math.min(opts.passes === undefined ? maxPasses : opts.passes, maxPasses);
    var seed = opts.seed === undefined ? LOOP_SEED : opts.seed;
    var target = opts.target === undefined ? TARGET_FRACTION : opts.target;
    var tolerance = opts.tolerance === undefined ? TOLERANCE : opts.tolerance;
    var angle = opts.startAngle === undefined ? ANGLE_START : opts.startAngle;
    var gain = opts.gain === undefined ? GAIN : opts.gain;
    var flip = kind === "device" ? FLIP : 0;

    var passes = [];
    var stopped = null;
    for (var k = 1; k <= run; k++) {
      var p = rotationProbability(angle, flip);
      var drawn = S.sample([1 - p, p], shots, S.rng(seed * 1000 + k * 131));
      var estimate = drawn.counts[1] / shots;
      var row = { pass: k, jobId: jobId(k), angle: angle, shots: shots, counts: drawn.counts, estimate: estimate, next: null };
      if (within(estimate, target, tolerance)) stopped = "tolerance";
      else if (k === maxPasses) stopped = "limit";
      else row.next = nextAngle(estimate, angle, target, gain);
      passes.push(row);
      if (stopped) break;
      angle = row.next;
    }
    return {
      kind: kind,
      shots: shots,
      target: target,
      passes: passes,
      jobs: passes.length,
      shotsUsed: passes.length * shots,
      stopped: stopped,
    };
  }

  // ---- text: what each side holds and what just crossed ---------------------------------------------------
  function aheadText(n) {
    if (n === 0) return "none ahead, next to run (invented)";
    return n + (n === 1 ? " job" : " jobs") + " ahead (invented)";
  }

  // { program: [...], target: [...], crossed: text or null }
  function lanes(job) {
    var s = job.state;
    var settings = "The settings: " + job.target.name + ", " + job.shots + (job.shots === 1 ? " shot" : " shots");
    var program = [];
    var target = [];
    target.push("Its description of what it allows");
    if (s === "prepared") {
      program.push("The program, as an instruction list");
      program.push(settings);
      program.push("A job number: " + job.id + " (invented)");
      target.push("No job yet");
    } else {
      program.push("The job number " + job.id + " (invented) and its latest status: " + stateById(s).label);
      program.push(settings);
      if (s === "submitted") target.push("The job, just received");
      else if (s === "queued") target.push("The job, waiting: " + aheadText(job.ahead));
      else if (s === "running") target.push(job.target.kind === "device" ? "The job, being run by the device" : "The job, being run by the simulator's method");
      else if (s === "finished") target.push(job.collected ? "The counts, already handed back (simulated)" : "The counts, held until they are collected (simulated)");
      else if (s === "rejected") target.push("A refusal: " + job.reason);
      else if (s === "failed") target.push("Nothing to hand back");
      else if (s === "cancelled") target.push("The job, withdrawn");
      if (s === "finished" && job.collected) program.push("The counts, ready to use (simulated)");
      if (isTerminal(s)) program.push("No results");
    }
    return { program: program, target: target, crossed: job.crossed };
  }

  // One plain sentence for an aria-live region.
  function describe(job) {
    var s = stateById(job.state);
    var total = finalMoment(job);
    var head = "Moment " + job.moment + " of " + total + ". " + job.id + " (invented) on " + job.target.name + " is " + s.label.toLowerCase() + ".";
    if (job.state === "queued") head += " " + aheadText(job.ahead).replace(/^./, function (c) { return c.toUpperCase(); }) + ".";
    if (job.state === "finished" && job.collected) head += " The counts were collected.";
    if (job.reason && isTerminal(job.state)) head += " " + job.reason;
    if (isTerminal(job.state)) head += " No results.";
    return head + (job.crossed ? " " + job.crossed : "");
  }

  // ---- rendering --------------------------------------------------------------------------------------------
  function listHTML(items) {
    return "<ul>" + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  // The two lanes side by side, and what just crossed between them.
  function lanesHTML(job) {
    var l = lanes(job);
    return '<div class="qed-rt__lanes">' +
      '<section class="qed-rt__lane" aria-label="Program side"><h4 class="qed-rt__lane-title">Program side <span class="qed-rt__lane-kind">classical</span></h4>' + listHTML(l.program) + "</section>" +
      '<section class="qed-rt__lane" aria-label="Target"><h4 class="qed-rt__lane-title">Target <span class="qed-rt__lane-kind">' + esc(job.target.name) + "</span></h4>" + listHTML(l.target) + "</section>" +
      "</div>" +
      (l.crossed ? '<p class="qed-rt__crossed"><span class="qed-rt__tag">just crossed</span> ' + esc(l.crossed) + "</p>" : '<p class="qed-rt__crossed"><span class="qed-rt__tag">just crossed</span> Nothing yet.</p>');
  }

  // The current state, with its glyph, the moment, and (while queued) the invented jobs ahead.
  function statusHTML(job) {
    var s = stateById(job.state);
    return '<p class="qed-rt__status" data-state="' + s.id + '" data-kind="' + s.kind + '">' +
      '<span class="qed-rt__glyph" aria-hidden="true">' + esc(s.glyph) + "</span>" +
      "<strong>" + esc(s.label) + "</strong>" +
      '<span class="qed-rt__badge">now</span>' +
      '<span class="qed-rt__moment">moment ' + job.moment + " of " + finalMoment(job) + "</span>" +
      '<span class="qed-rt__tag">' + esc(job.id) + ", invented</span>" +
      (job.state === "queued" ? '<span class="qed-rt__tag">' + esc(aheadText(job.ahead)) + "</span>" : "") +
      "</p>" +
      '<p class="qed-rt__words">' + esc(s.words) + "</p>";
  }

  // The lifecycle as an ordered list: the steps this target goes through, then the other ways a
  // job can end. The current state carries a "now" badge; states already passed say "done".
  function lifecycleHTML(job) {
    var steps = STATES.filter(function (s) { return s.kind === "step" && (s.id !== "queued" || queues(job.target)); });
    var exits = STATES.filter(function (s) { return s.kind === "exit"; });
    var passed = {};
    job.history.forEach(function (h) { passed[h.state] = true; });
    function item(s) {
      var now = s.id === job.state;
      var done = !now && passed[s.id];
      return '<li class="qed-rt__state' + (now ? " is-now" : "") + (done ? " is-done" : "") + '" data-state="' + s.id + '" data-kind="' + s.kind + '"' + (now ? ' aria-current="step"' : "") + ">" +
        '<span class="qed-rt__glyph" aria-hidden="true">' + esc(s.glyph) + "</span>" +
        "<strong>" + esc(s.label) + "</strong>" +
        (now ? '<span class="qed-rt__badge">now</span>' : "") +
        (done ? '<span class="qed-rt__tag">done</span>' : "") +
        '<span class="qed-rt__state-words">' + esc(s.words) + "</span></li>";
    }
    return '<ol class="qed-rt__lifecycle" aria-label="The stages of this job">' + steps.map(item).join("") + "</ol>" +
      '<p class="qed-rt__note">' + (queues(job.target) ? "" : "This target starts the job at once in this model, so there is no queued stage. ") + "A job can also end in one of three other ways:</p>" +
      '<ul class="qed-rt__lifecycle qed-rt__lifecycle--exits" aria-label="Other ways a job can end">' + exits.map(item).join("") + "</ul>";
  }

  // The counts of a finished job as a table, with each outcome's fraction.
  function countsTableHTML(result) {
    var sum = summarize(result);
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Outcome</th><th scope="col">Count</th><th scope="col">Fraction of ' + result.shots + ' shots</th></tr></thead><tbody>' +
      result.labels.map(function (l, i) {
        return '<tr><th scope="row">' + esc(l) + '</th><td data-label="Count">' + result.counts[i] + '</td><td data-label="Fraction">' + (Math.round(sum.fractions[i] * 1000) / 10) + "%</td></tr>";
      }).join("") + "</tbody></table>";
  }

  // One row for each pass of the loop.
  function loopTableHTML(loop) {
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Pass</th><th scope="col">Angle sent</th><th scope="col">Shots</th><th scope="col">Counts of 0 and 1</th><th scope="col">Estimate of 1s</th><th scope="col">Next angle</th></tr></thead><tbody>' +
      loop.passes.map(function (r) {
        return '<tr><th scope="row">' + r.pass + ' <span class="qed-rt__tag">' + esc(r.jobId) + '</span></th><td data-label="Angle sent">' + roundTenth(r.angle) + "°</td><td data-label=\"Shots\">" + r.shots +
          '</td><td data-label="Counts of 0 and 1">' + r.counts[0] + " and " + r.counts[1] + '</td><td data-label="Estimate of 1s">' + (Math.round(r.estimate * 1000) / 1000) +
          '</td><td data-label="Next angle">' + (r.next === null ? "none" : roundTenth(r.next) + "°") + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  return {
    QUEUE_AHEAD: QUEUE_AHEAD,
    OFF_SHARE: OFF_SHARE,
    FLIP: FLIP,
    ANGLE_START: ANGLE_START,
    TARGET_FRACTION: TARGET_FRACTION,
    GAIN: GAIN,
    TOLERANCE: TOLERANCE,
    MAX_PASSES: MAX_PASSES,
    LOOP_SEED: LOOP_SEED,
    STATES: STATES,
    OUTCOMES: OUTCOMES,
    stateById: stateById,
    isTerminal: isTerminal,
    queues: queues,
    check: check,
    circuitFor: circuitFor,
    newJob: newJob,
    canAdvance: canAdvance,
    canCancel: canCancel,
    canCollect: canCollect,
    advance: advance,
    cancel: cancel,
    collect: collect,
    timeline: timeline,
    finalMoment: finalMoment,
    results: results,
    summarize: summarize,
    rotationProbability: rotationProbability,
    nextAngle: nextAngle,
    runLoop: runLoop,
    lanes: lanes,
    describe: describe,
    lanesHTML: lanesHTML,
    statusHTML: statusHTML,
    lifecycleHTML: lifecycleHTML,
    countsTableHTML: countsTableHTML,
    loopTableHTML: loopTableHTML,
  };
})();
