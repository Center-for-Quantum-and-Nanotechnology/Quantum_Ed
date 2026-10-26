// Tests for docs/assets/javascripts/workflow.js (window.QedWorkflow): one computation run through every
// software responsibility, on a simulator path or a device path, in one of three arrangements. It calls
// QedProgramForms, QedBackend, QedTransform, QedRuntime, QedSimMethods, and QedSoftwareStack at run time,
// and the renderers call QedCircuit, so all of them are loaded for real.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { loadModules } = require("./load.js");

const w = loadModules([
  "circuit.js", "gates.js", "shots.js", "twoqubit.js", "qubit.js", "trace.js", "software-stack.js",
  "program-forms.js", "transform.js", "backend.js", "sim-methods.js", "runtime.js", "workflow.js",
]);
const W = w.QedWorkflow;
const R = w.QedRuntime;
const B = w.QedBackend;
const T = w.QedTransform;
const PF = w.QedProgramForms;
const S = w.QedSoftwareStack;

const clone = (o) => JSON.parse(JSON.stringify(o));
const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const PATHS = ["simulator", "device"];
const ARRS = W.ARRANGEMENTS.map((a) => a.id);
const text = (c) => PF.instructionList(c).map((l) => l.text);
const target = (p) => (p === "device" ? B.DEVICE : B.SIMULATOR);
const stepIds = (b) => b.steps.map((s) => s.id);

test("the data: nine steps, three arrangements, the stated ordering constraints, and two paths", () => {
  assert.deepEqual(W.STEPS.map((s) => s.id), ["write", "describe", "report", "check", "adapt", "send", "run", "return", "interpret"]);
  assert.deepEqual(W.ARRANGEMENTS.map((a) => a.id), ["prepare-then-send", "send-then-service", "one-tool"]);
  assert.deepEqual(W.PATHS.map((p) => p.id), ["simulator", "device"]);
  const pairs = W.CONSTRAINTS.map((c) => c.join(">"));
  ["describe>check", "check>adapt", "adapt>run", "send>run", "run>return", "return>interpret", "report>check"].forEach((p) => assert.ok(pairs.includes(p), p));
  assert.equal(new Set(W.STEPS.map((s) => s.glyph)).size, W.STEPS.length, "every step has its own glyph");
  W.ARRANGEMENTS.forEach((a) => { assert.ok(a.label && a.description, a.id); assert.ok(!/qiskit|cirq|ibm|google|rigetti|ionq|amazon/i.test(a.description), "no product named"); });
});

test("each path has exactly its steps, once each: nine on the device path and eight on the simulator path", () => {
  ARRS.forEach((a) => {
    const dev = W.build("device", a);
    const sim = W.build("simulator", a);
    assert.equal(dev.steps.length, 9, a);
    assert.equal(sim.steps.length, 8, a);
    assert.deepEqual([...stepIds(dev)].sort(), W.STEPS.map((s) => s.id).sort());
    assert.deepEqual([...stepIds(sim)].sort(), W.STEPS.map((s) => s.id).filter((id) => id !== "report").sort());
    assert.equal(new Set(stepIds(dev)).size, 9);
    assert.ok(!stepIds(sim).includes("report"), "a simulator has no report step");
  });
});

test("every arrangement satisfies every ordering constraint on both paths", () => {
  PATHS.forEach((p) => ARRS.forEach((a) => {
    const b = W.build(p, a);
    assert.deepEqual(W.validate(b), [], p + " " + a);
    W.CONSTRAINTS.forEach(([before, after]) => {
      const i = b.order.indexOf(before);
      const j = b.order.indexOf(after);
      if (i >= 0 && j >= 0) assert.ok(i < j, p + " " + a + ": " + before + " before " + after);
    });
  }));
});

test("the arrangements differ in order, performer, and what the job carries, and each has its own list", () => {
  const a = W.build("device", "prepare-then-send");
  const b = W.build("device", "send-then-service");
  const c = W.build("device", "one-tool");
  assert.deepEqual(a.order, ["write", "describe", "report", "check", "adapt", "send", "run", "return", "interpret"]);
  assert.deepEqual(b.order, ["write", "describe", "send", "report", "check", "adapt", "run", "return", "interpret"]);
  assert.deepEqual(c.order, a.order, "the one tool acts in the same order as prepare-then-send");
  const by = (build) => Object.fromEntries(build.steps.map((s) => [s.id, s.by]));
  assert.equal(by(a).check, "your tools");
  assert.equal(by(a).adapt, "your tools");
  assert.equal(by(b).check, "the service");
  assert.equal(by(b).adapt, "the service");
  assert.equal(by(b).send, "your tools");
  assert.equal(by(c).write, "your tools");
  ["describe", "report", "check", "adapt", "send", "run", "return", "interpret"].forEach((id) => assert.equal(by(c)[id], "the one tool", id));
  b.steps.concat(a.steps, c.steps).forEach((s) => assert.ok(W.PERFORMERS.includes(s.by), s.id));
});

test("the one tool shows two things to step through, the second with every other step inside it", () => {
  const dev = W.build("device", "one-tool");
  const sim = W.build("simulator", "one-tool");
  assert.equal(dev.units.length, 2);
  assert.equal(dev.units[0].combined, false);
  assert.equal(dev.units[1].combined, true);
  assert.deepEqual(dev.units[1].steps.map((s) => s.id), ["describe", "report", "check", "adapt", "send", "run", "return", "interpret"]);
  assert.deepEqual(sim.units[1].steps.map((s) => s.id), ["describe", "check", "adapt", "send", "run", "return", "interpret"]);
  assert.equal(W.build("device", "prepare-then-send").units.length, 9);
  assert.equal(W.build("simulator", "send-then-service").units.length, 8);
  // combined is not removed: the inside list has the same steps as prepare-then-send, in order
  assert.deepEqual(["write"].concat(dev.units[1].steps.map((s) => s.id)), stepIds(W.build("device", "prepare-then-send")));
});

test("the counts are the same in all three arrangements for the same job, and do not depend on the report or the pair", () => {
  PATHS.forEach((p) => [1, 2, 5].forEach((number) => [10, 100, 500].forEach((shots) => {
    const results = ARRS.map((a) => W.build(p, a, { number, shots }).result.counts);
    assert.deepEqual(results[1], results[0]);
    assert.deepEqual(results[2], results[0]);
    const newer = W.build(p, "send-then-service", { number, shots, newerReport: true }).result.counts;
    assert.deepEqual(newer, results[0], "a newer report does not change the counts");
    assert.equal(results[0].reduce((x, y) => x + y, 0), shots);
  })));
  // and a different job gives different counts
  assert.notDeepEqual(W.build("device", "one-tool", { number: 2 }).result.counts, W.build("device", "one-tool", { number: 1 }).result.counts);
});

test("the adapted program is the same in every arrangement, and is exactly what QedTransform gives for the target", () => {
  PATHS.forEach((p) => {
    const expected = text(T.adapt(PF.bell(), target(p)).circuit).join(" | ");
    ARRS.forEach((a) => {
      const b = W.build(p, a);
      assert.equal(b.aspects.adapted.key, expected, p + " " + a);
      const adapt = b.steps.filter((s) => s.id === "adapt")[0];
      assert.deepEqual(text(adapt.produced.view.circuit), text(T.adapt(PF.bell(), target(p)).circuit));
    });
  });
  // the device rewrites H as three turns, the simulator keeps it
  assert.ok(W.build("device", "one-tool").aspects.adapted.text.includes("Rz(90°)"));
  assert.ok(W.build("simulator", "one-tool").aspects.adapted.text.startsWith("H q₀"));
});

test("the job carries the adapted form or the form as written, depending on the arrangement", () => {
  const written = text(PF.bell()).join(" | ");
  const adapted = text(T.adapt(PF.bell(), B.DEVICE).circuit).join(" | ");
  assert.equal(W.build("device", "prepare-then-send").aspects.job.key, adapted);
  assert.equal(W.build("device", "one-tool").aspects.job.key, adapted);
  assert.equal(W.build("device", "send-then-service").aspects.job.key, written);
  assert.notEqual(adapted, written);
  assert.match(W.build("device", "send-then-service").aspects.job.text, /^The program as written/);
  assert.match(W.build("device", "prepare-then-send").aspects.job.text, /^The adapted program/);
  // on the simulator nothing needs adapting, so the two forms are the same
  const simKeys = ARRS.map((a) => W.build("simulator", a).aspects.job.key);
  assert.equal(new Set(simKeys).size, 1);
  assert.equal(simKeys[0], written);
  // the send step's own picture is the circuit that was sent
  assert.deepEqual(text(W.build("device", "send-then-service").steps.filter((s) => s.id === "send")[0].produced.view.circuit), text(PF.bell()));
});

test("the service's moment is in the job's life only when the service prepares", () => {
  const life = (p, a) => W.build(p, a).life.map((l) => l.label);
  assert.deepEqual(life("device", "prepare-then-send"), ["Prepared", "Submitted", "Queued", "Running", "Finished", "Counts collected"]);
  assert.deepEqual(life("device", "send-then-service"), ["Prepared", "Submitted", "Queued", "Adapted by the service", "Running", "Finished", "Counts collected"]);
  assert.deepEqual(life("simulator", "prepare-then-send"), ["Prepared", "Submitted", "Running", "Finished", "Counts collected"]);
  assert.deepEqual(life("simulator", "send-then-service"), ["Prepared", "Submitted", "Adapted by the service", "Running", "Finished", "Counts collected"]);
  assert.match(W.build("device", "one-tool").life[2].text, /^Queued \(3, 2, 1, 0 ahead, invented\)$/);
  assert.equal(W.build("device", "prepare-then-send").job.moments, 8);
  assert.equal(W.build("device", "send-then-service").job.moments, 9);
  assert.equal(W.build("simulator", "prepare-then-send").job.moments, 4);
  assert.equal(W.build("simulator", "send-then-service").job.moments, 5);
});

test("compare of the two paths reports exactly the aspects whose artifacts differ, and none of the others", () => {
  const status = (arr) => Object.fromEntries(W.compare(W.build("simulator", arr), W.build("device", arr)).map((r) => [r.id, r.status]));
  // worked out by hand from the models, not from compare
  const sameProgram = text(PF.bell()).join() === text(PF.bell()).join();
  assert.ok(sameProgram);
  const capsDiffer = JSON.stringify(B.capabilities(B.SIMULATOR)) !== JSON.stringify(B.capabilities(B.DEVICE, { names: B.DEVICE.qubits }));
  const adaptDiffers = text(T.adapt(PF.bell(), B.SIMULATOR).circuit).join() !== text(T.adapt(PF.bell(), B.DEVICE).circuit).join();
  assert.ok(capsDiffer && adaptDiffers);
  const expectedA = { program: "shared", instructions: "shared", report: "one path only", description: "differs", adapted: "differs", job: "differs", lifecycle: "differs", method: "differs", results: "shared" };
  assert.deepEqual(status("prepare-then-send"), expectedA);
  assert.deepEqual(status("one-tool"), expectedA);
  // sent as written, the two jobs carry the same program
  assert.deepEqual(status("send-then-service"), Object.assign({}, expectedA, { job: "shared" }));
  // the order of the rows is the order of the aspects
  assert.deepEqual(W.compare(W.build("simulator", "one-tool"), W.build("device", "one-tool")).map((r) => r.id), W.ASPECTS.map((a) => a.id));
});

test("compare says which path has an aspect that only one has, and notes what differs about the results", () => {
  const rows = W.compare(W.build("simulator", "one-tool"), W.build("device", "one-tool"));
  const report = rows.filter((r) => r.id === "report")[0];
  assert.equal(report.status, "one path only");
  assert.equal(report.only, "Device Q4");
  assert.equal(report.a, null);
  assert.ok(report.b);
  const results = rows.filter((r) => r.id === "results")[0];
  assert.match(results.note, /Simulator: A simulator can also show exact probabilities/);
  assert.match(results.note, /Device Q4: The counts include an invented share of off-pattern outcomes/);
  // the other way round, the same row says the simulator path is the one without it
  const flipped = W.compare(W.build("device", "one-tool"), W.build("simulator", "one-tool")).filter((r) => r.id === "report")[0];
  assert.equal(flipped.only, "Device Q4");
  // the same path against itself shares everything
  W.compare(W.build("device", "one-tool"), W.build("device", "one-tool")).forEach((r) => assert.equal(r.status, "shared", r.id));
});

test("the pair follows the stated report and policy, and is shown but never applied", () => {
  ARRS.forEach((a) => [false, true].forEach((newer) => ["lowest-two-qubit", "lowest-total"].forEach((policy) => {
    const b = W.build("device", a, { newerReport: newer, policy });
    const snap = a === "send-then-service" && newer ? "later" : "earlier";
    const expected = B.choosePair(B.DEVICE, snap, policy).ranking[0].name;
    assert.equal(b.decision.pair, expected);
    assert.equal(b.decision.snapshotId, snap);
    assert.equal(b.decision.applied, false);
    ["check", "adapt"].forEach((id) => {
      const k = b.steps.filter((s) => s.id === id)[0].knew;
      assert.equal(k.pair, expected);
      assert.equal(k.applied, false);
      assert.equal(k.snapshot.id, snap);
      assert.match(k.text, /not applied to the circuit/);
      assert.match(k.text, /does not change the counts/);
      assert.match(k.text, /possible decision/);
    });
  })));
  // the values the page quotes
  assert.equal(W.build("device", "prepare-then-send").decision.pair, "Q1–Q2");
  assert.equal(W.build("device", "send-then-service", { newerReport: true }).decision.pair, "Q0–Q1");
  assert.equal(W.build("device", "send-then-service", { policy: "lowest-total" }).decision.pair, "Q0–Q1");
});

test("the newer-report switch changes the pair only in the arrangement that waits before preparing", () => {
  const pair = (a, newer) => W.build("device", a, { newerReport: newer }).decision.pair;
  assert.equal(pair("prepare-then-send", true), pair("prepare-then-send", false));
  assert.equal(pair("one-tool", true), pair("one-tool", false));
  assert.notEqual(pair("send-then-service", true), pair("send-then-service", false));
  assert.equal(pair("send-then-service", false), pair("prepare-then-send", false), "with no newer report all three agree");
  // the simulator has no report, so the switch does nothing there
  PATHS.slice(0, 1).forEach((p) => ARRS.forEach((a) => {
    assert.equal(W.build(p, a, { newerReport: true }).decision, null);
    assert.deepEqual(W.build(p, a, { newerReport: true }).steps.map((s) => s.produced && s.produced.text), W.build(p, a).steps.map((s) => s.produced && s.produced.text));
  }));
  assert.equal(W.build("device", "send-then-service", { newerReport: true }).options.newerReport, true);
  assert.equal(W.build("simulator", "send-then-service", { newerReport: true }).options.newerReport, false);
});

test("only the deciding steps say what they knew, and a simulator says it had no report", () => {
  PATHS.forEach((p) => ARRS.forEach((a) => {
    W.build(p, a).steps.forEach((s) => {
      if (s.id === "check" || s.id === "adapt") assert.ok(s.knew, s.id);
      else assert.equal(s.knew, null, s.id);
    });
  }));
  const k = W.build("simulator", "one-tool").steps.filter((s) => s.id === "check")[0].knew;
  assert.equal(k.snapshot, null);
  assert.equal(k.pair, null);
  assert.match(k.text, /no physical condition to report/);
});

test("the arrangement rows are computed from builds, including what a newer report would change", () => {
  const dev = W.arrangementRows("device");
  assert.deepEqual(dev.map((r) => r.id), ARRS);
  assert.deepEqual(dev.map((r) => r.moments), [8, 9, 8]);
  assert.deepEqual(dev.map((r) => r.carried), ["The adapted program", "The program as written", "The adapted program"]);
  assert.deepEqual(dev.map((r) => r.pair), ["Q1–Q2", "Q1–Q2", "Q1–Q2"]);
  assert.deepEqual(dev.map((r) => r.pairNewer), ["Q1–Q2", "Q0–Q1", "Q1–Q2"]);
  assert.deepEqual(dev[2].order, ["Write the program", "Call the one tool"]);
  assert.equal(dev[0].order.length, 9);
  assert.match(dev[1].knewNewer, /The later report; the pair under “Lowest two-qubit error” would be Q0–Q1/);
  assert.match(dev[0].knewNewer, /The earlier report/);
  const sim = W.arrangementRows("simulator");
  assert.deepEqual(sim.map((r) => r.moments), [4, 5, 4]);
  assert.equal(sim[0].knewNewer, null);
  assert.equal(sim[0].knew, "No report: a simulator has none.");
  // the options reach the builds
  assert.deepEqual(W.arrangementRows("device", { shots: 10 }).map((r) => r.result.result.shots), [10, 10, 10]);
  // the rows set the newer-report switch themselves: asking for it in the options changes nothing
  const forced = W.arrangementRows("device", { newerReport: true });
  assert.deepEqual(forced.map((r) => r.pair), ["Q1–Q2", "Q1–Q2", "Q1–Q2"]);
  assert.deepEqual(forced.map((r) => r.pairNewer), ["Q1–Q2", "Q0–Q1", "Q1–Q2"]);
  assert.deepEqual(forced.map((r) => r.result.options.newerReport), [false, false, false]);
});

test("the report step reads the snapshot the arrangement has, and the check step reads the target's own description", () => {
  const rep = (a, newer) => W.build("device", a, { newerReport: newer }).steps.filter((s) => s.id === "report")[0];
  assert.match(rep("prepare-then-send", true).produced.text, /^The earlier report \(06:00, invented\): complete/);
  assert.match(rep("send-then-service", true).produced.text, /^The later report \(18:00, same day, invented\): partial/);
  assert.deepEqual(rep("prepare-then-send", false).produced.view.pairs.map((p) => p.name), ["Q0–Q1", "Q1–Q2", "Q2–Q3"]);
  const later = rep("send-then-service", true).produced.view.pairs;
  assert.match(later[0].text, /0\.78/);
  const check = W.build("device", "one-tool").steps.filter((s) => s.id === "check")[0];
  assert.deepEqual(check.produced.view.operations, B.capabilities(B.DEVICE, { names: B.DEVICE.qubits }).operations);
  assert.match(check.produced.text, /Device Q4 does not list H on q₀\./);
  assert.match(W.build("simulator", "one-tool").steps.filter((s) => s.id === "check")[0].produced.text, /Simulator lists every operation in the program\./);
});

test("the group and the responsibility of every step come from QedSoftwareStack", () => {
  const groups = { write: "application", describe: "application", report: "control", check: "meeting", adapt: "application", send: "application", run: "target", "return": "application", interpret: "application" };
  PATHS.forEach((p) => {
    W.build(p, "one-tool").steps.forEach((s) => {
      assert.equal(s.group, groups[s.id], s.id);
      const r = S.RESPONSIBILITIES.filter((x) => x.id === s.responsibility)[0];
      assert.ok(r, s.id);
      assert.equal(s.groupLabel, S.GROUPS[r.group].label);
    });
  });
  const run = (p) => W.build(p, "one-tool").steps.filter((s) => s.id === "run")[0];
  assert.equal(run("simulator").responsibilityLabel, "Simulator (execution engine)");
  assert.equal(run("device").responsibilityLabel, "Quantum device");
  assert.equal(W.build("device", "one-tool").steps.filter((s) => s.id === "report")[0].groupLabel, "Control Layer");
});

test("every step names the pages that taught it, and those pages exist", () => {
  const dir = path.resolve(__dirname, "..", "..", "docs", "05-software-stack");
  Object.entries(W.PAGES).forEach(([id, p]) => assert.ok(fs.existsSync(path.join(dir, p.file)), id + " " + p.file));
  PATHS.forEach((p) => W.build(p, "one-tool").steps.forEach((s) => {
    assert.ok(s.pages.length >= 1, s.id);
    s.pages.forEach((pg) => assert.ok(W.PAGES[pg.id] && W.PAGES[pg.id].file === pg.file));
  }));
  const pages = (p, id) => W.build(p, "one-tool").steps.filter((s) => s.id === id)[0].pages.map((x) => x.id);
  assert.deepEqual(pages("simulator", "run"), ["05.05", "05.06"]);
  assert.deepEqual(pages("device", "run"), ["05.04", "05.06"]);
  assert.deepEqual(pages("device", "adapt"), ["05.03"]);
  assert.deepEqual(pages("device", "write"), ["05.01"]);
});

test("a whole build agrees with calling each model by hand (a seeded cross-check)", () => {
  let seed = 12345;
  const next = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let i = 0; i < 40; i++) {
    const p = PATHS[next(2)];
    const a = ARRS[next(3)];
    const shots = [10, 50, 100, 500][next(4)];
    const number = 1 + next(9);
    const newerReport = next(2) === 1;
    const b = W.build(p, a, { shots, number, newerReport });
    const t = target(p);
    // the job by hand
    const adapted = T.adapt(PF.bell(), t).circuit;
    let job = R.newJob(a === "send-then-service" ? PF.bell() : adapted, t, shots, { number, servicePrepares: a === "send-then-service" });
    for (let guard = 0; R.canAdvance(job); guard++) {
      assert.ok(guard < 50, "a job should end within a few moments");
      job = R.advance(job);
    }
    const counts = R.results(job).counts;
    assert.deepEqual(b.result.counts, counts);
    assert.deepEqual(b.summary, R.summarize(R.results(job)));
    assert.equal(b.job.moments, R.finalMoment(R.newJob(a === "send-then-service" ? PF.bell() : adapted, t, shots, { number, servicePrepares: a === "send-then-service" })));
    assert.deepEqual(text(b.steps.filter((s) => s.id === "adapt")[0].produced.view.circuit), text(adapted));
    assert.deepEqual(W.validate(b), []);
    if (p === "device") {
      const snap = a === "send-then-service" && newerReport ? "later" : "earlier";
      assert.equal(b.decision.pair, B.choosePair(B.DEVICE, snap, "lowest-two-qubit").ranking[0].name);
    }
    // deterministic
    assert.equal(JSON.stringify(W.build(p, a, { shots, number, newerReport })), JSON.stringify(b));
  }
});

test("build leaves its inputs and the shared data unchanged", () => {
  const deviceBefore = JSON.stringify(B.DEVICE);
  const simBefore = JSON.stringify(B.SIMULATOR);
  const opts = deepFreeze({ shots: 100, number: 2, newerReport: true, policy: "lowest-two-qubit" });
  PATHS.forEach((p) => ARRS.forEach((a) => {
    const b = W.build(p, a, opts);
    W.validate(b);
    W.describeUnit(b, 0);
    W.unitsHTML(b, 0);
    W.detailHTML(b, b.units.length - 1);
    W.arrangementRows(p, opts);
  }));
  W.compare(W.build("simulator", "one-tool"), W.build("device", "one-tool"));
  assert.equal(JSON.stringify(B.DEVICE), deviceBefore);
  assert.equal(JSON.stringify(B.SIMULATOR), simBefore);
  assert.equal(opts.number, 2);
  const frozen = deepFreeze(clone(W.build("device", "send-then-service")));
  W.validate(frozen);
  W.unitsHTML(frozen, 3);
  W.detailHTML(frozen, 3);
  W.describeUnit(frozen, 3);
  W.explain(frozen);
});

test("validate names what is wrong with a build that is not sound", () => {
  const good = W.build("device", "prepare-then-send");
  assert.deepEqual(W.validate(good), []);
  const swapped = clone(good);
  [swapped.order[3], swapped.order[4]] = [swapped.order[4], swapped.order[3]];
  [swapped.steps[3], swapped.steps[4]] = [swapped.steps[4], swapped.steps[3]];
  assert.ok(W.validate(swapped).some((p) => /check must come before adapt/.test(p)));
  const missing = clone(good);
  missing.steps = missing.steps.filter((s) => s.id !== "report");
  missing.order = missing.steps.map((s) => s.id);
  assert.ok(W.validate(missing).some((p) => /report is missing/.test(p)));
  const dup = clone(good);
  dup.steps.push(dup.steps[0]);
  assert.ok(W.validate(dup).some((p) => /appears more than once/.test(p)));
  const wrongPath = clone(W.build("simulator", "prepare-then-send"));
  wrongPath.path = "device";
  assert.ok(W.validate(wrongPath).some((p) => /report is missing/.test(p)));
  const counts = clone(good);
  counts.result.counts[0] += 1;
  assert.ok(W.validate(counts).some((p) => /counts do not add up/.test(p)));
  const mute = clone(good);
  mute.steps.filter((s) => s.id === "adapt")[0].knew = null;
  assert.ok(W.validate(mute).some((p) => /adapt does not say what it knew/.test(p)));
  const units = clone(good);
  units.units.pop();
  assert.ok(W.validate(units).some((p) => /does not cover the steps/.test(p)));
});

test("the sentences say the step, who performs it, and what it produced, and the result sentence says the kind did not change", () => {
  const b = W.build("device", "prepare-then-send");
  const s = W.describeUnit(b, 3);
  assert.match(s, /^Step 4 of 9\. Check what the target allows\. Performed by your tools\. Backend \/ target description, Where the groups meet\./);
  assert.match(s, /possible decision/);
  assert.match(W.describeUnit(W.build("device", "one-tool"), 1), /^Step 2 of 2\. Call the one tool\. Performed by the one tool\. Inside the call: describe it as data, then /);
  assert.throws(() => W.describeUnit(b, 9), /no step 9/);
  assert.throws(() => W.detailHTML(b, -1), /no step -1/);
  assert.match(W.explain(b), /same kind of thing: counts\. The arrangement changed who did what, and what the deciding steps knew/);
  assert.ok(!/knew/.test(W.explain(W.build("simulator", "one-tool"))));
  assert.throws(() => W.build("moon", "one-tool"), /no path called moon/);
  assert.throws(() => W.build("device", "chaos"), /no arrangement called chaos/);
});

test("the step list marks one step as now and the earlier ones as done, in words", () => {
  const b = W.build("device", "prepare-then-send");
  const html = W.unitsHTML(b, 3);
  assert.equal((html.match(/>now</g) || []).length, 1);
  assert.equal((html.match(/>done</g) || []).length, 3);
  assert.match(html, /aria-current="step"/);
  assert.match(html, /<ol class="qed-wf__list" aria-label="The steps of this workflow">/);
  ["Application Layer", "Where the groups meet", "Control Layer", "Execution target", "by your tools", "by the service"].forEach((t) => assert.ok(html.includes(t), t));
  assert.match(W.unitsHTML(W.build("device", "one-tool"), 1), /by the one tool/);
  assert.equal((W.unitsHTML(b, -1).match(/>now</g) || []).length, 0);
  assert.equal((W.unitsHTML(b, 9).match(/>done</g) || []).length, 9);
});

test("the one tool's inside list is shown only once the call has been reached", () => {
  const b = W.build("device", "one-tool");
  assert.ok(!W.unitsHTML(b, 0).includes("What happened inside"));
  const reached = W.unitsHTML(b, 1);
  assert.ok(reached.includes("What happened inside"));
  assert.equal((reached.match(/data-step="/g) || []).length, 1 + 8, "write, plus the eight inside");
  assert.match(reached, /8 steps in one call/);
  assert.match(W.unitsHTML(W.build("simulator", "one-tool"), 1), /7 steps in one call/);
});

test("what a step shows comes from the model that made it, and reported and possible values say so", () => {
  const b = W.build("device", "send-then-service", { newerReport: true });
  const detail = (id) => W.detailHTML(b, b.units.findIndex((u) => u.steps[0].id === id));
  assert.match(detail("report"), /qed-wf__reported/);
  assert.match(detail("report"), />reported</);
  assert.match(detail("report"), />invented</);
  assert.match(detail("check"), /qed-wf__possible/);
  assert.match(detail("check"), />possible</);
  assert.match(detail("adapt"), /qed-wf__possible/);
  assert.match(detail("adapt"), /Replaced H on q₀/);
  assert.ok(!/qed-wf__possible/.test(detail("send")));
  assert.match(detail("write"), /<svg/);
  assert.match(detail("describe"), /qed-forms__list/);
  assert.match(detail("return"), /Fraction of 100 shots/);
  assert.match(detail("return"), />simulated</);
  assert.match(detail("return"), />invented off-pattern share</);
  assert.match(detail("run"), /Adapted by the service/);
  assert.match(detail("send"), /Taught on: <a href="quantum-runtime-and-classical-quantum-orchestration\.md">05\.06/);
  const sim = W.build("simulator", "one-tool");
  assert.match(W.detailHTML(sim, 1), /state vector method/);
  assert.match(W.detailHTML(sim, 1), /All three methods from 05\.05 can handle this circuit/);
  assert.match(W.detailHTML(sim, 1), /qed-sm-table|Amplitude|amplitude/);
  // a combined unit shows every inside step
  assert.equal((W.detailHTML(sim, 1).match(/class="qed-wf__detail"/g) || []).length, 7);
});

test("the tables are real tables with a label on every cell, and say what the rows are", () => {
  const rows = W.compare(W.build("simulator", "one-tool"), W.build("device", "one-tool"));
  const html = W.comparisonTableHTML(rows, "Simulator", "Device Q4");
  assert.match(html, /^<table class="qed-xf__table">/);
  assert.equal((html.match(/<th scope="col">/g) || []).length, 5);
  ["Shared", "Differs", "Only on the device q4 path"].forEach((t) => assert.ok(html.includes(t), t));
  assert.match(html, /data-label="Simulator"/);
  assert.match(html, /off-pattern/);
  assert.equal((html.match(/<th scope="row">/g) || []).length, W.ASPECTS.length);
  const arr = W.arrangementTableHTML(W.arrangementRows("device"));
  assert.match(arr, /If a newer report arrived while the job waited/);
  assert.match(arr, /Write the program \(your tools\) → Call the one tool \(the one tool\)/);
  assert.match(arr, /Write the program \(your tools\) → Describe it as data \(your tools\) → The device's software reports its condition \(the service\) → Check what the target allows \(your tools\)/);
  assert.match(arr, /Send the job \(your tools\) → The device's software reports its condition \(the service\) → Check what the target allows \(the service\) → Adapt the program \(the service\)/);
  assert.ok(!/Who performs them/.test(arr), "the performers are in the same cell as their steps");
  assert.match(arr, /The program as written/);
  assert.ok(!/If a newer report/.test(W.arrangementTableHTML(W.arrangementRows("simulator"))));
  assert.equal((arr.match(/<th scope="row">/g) || []).length, 3);
});

test("text taken from the data is escaped in the pictures", () => {
  const b = clone(W.build("device", "prepare-then-send"));
  const s = b.units[0].steps[0];   // a clone keeps copies, so change the one the renderers read
  s.label = "<b>sneaky</b>";
  s.by = "<i>me</i>";
  s.produced.text = "<script>x</script>";
  b.units[0].label = s.label;
  const html = W.unitsHTML(b, 0) + W.detailHTML(b, 0);
  assert.ok(!html.includes("<b>sneaky"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<i>me"));
  assert.ok(html.includes("&lt;b&gt;sneaky"));
});
