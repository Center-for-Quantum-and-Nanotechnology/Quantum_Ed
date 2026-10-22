// Tests for docs/assets/javascripts/runtime.js (window.QedRuntime): the life of a job sent to a
// target, the counts that come back, and a small loop of jobs. QedTransform (the `allows` rule),
// QedShots (seeded counts), and QedGates (the rotation) are called at run time, and QedBackend
// supplies the two invented targets. Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["circuit.js", "gates.js", "shots.js", "transform.js", "backend.js", "program-forms.js", "runtime.js"]);
const R = w.QedRuntime;
const B = w.QedBackend;
const T = w.QedTransform;
const PF = w.QedProgramForms;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const SIM = B.SIMULATOR;
const DEV = B.DEVICE;
const base = () => PF.bell();
const circuitFor = (outcome, target) => R.circuitFor(outcome, target, base());
const job = (target, outcome = "finishes", shots = 100, number = 1) =>
  R.newJob(circuitFor(outcome, target), target, shots, { number, fate: outcome === "fails" ? "fails" : "completes" });
const runToEnd = (j) => {
  for (let guard = 0; R.canAdvance(j); guard++) {
    if (guard > 50) throw new Error("a job should end within a few moments");
    j = R.advance(j);
  }
  return j;
};
const states = (j) => R.timeline(j).map((s) => s.state);

test("the lifecycle is data: eight states, five on the way and three exits", () => {
  assert.deepEqual(R.STATES.map((s) => s.id), ["prepared", "submitted", "queued", "running", "finished", "rejected", "failed", "cancelled"]);
  assert.deepEqual(R.STATES.filter((s) => s.kind === "exit").map((s) => s.id), ["rejected", "failed", "cancelled"]);
  R.STATES.forEach((s) => { assert.ok(s.label && s.glyph && s.words, s.id); });
  assert.equal(new Set(R.STATES.map((s) => s.glyph)).size, R.STATES.length, "every state has its own glyph");
  assert.deepEqual(R.OUTCOMES.map((o) => o.id), ["finishes", "rejected", "fails"]);
});

test("a job that finishes goes through the stages in order, and only the device queues", () => {
  assert.deepEqual(states(job(SIM)), ["prepared", "submitted", "running", "finished", "finished"]);
  assert.deepEqual(states(job(DEV)), ["prepared", "submitted", "queued", "queued", "queued", "queued", "running", "finished", "finished"]);
  assert.equal(R.queues(SIM), false);
  assert.equal(R.queues(DEV), true);
});

test("the last moment of a finished job is the moment its counts are collected", () => {
  const tl = R.timeline(job(SIM));
  assert.equal(tl[tl.length - 1].collected, true);
  assert.equal(tl[tl.length - 2].collected, false);
  assert.equal(R.finalMoment(job(SIM)), 4);
  assert.equal(R.finalMoment(job(DEV)), 8);
  assert.equal(R.finalMoment(job(SIM, "rejected")), 2);
  assert.equal(R.finalMoment(job(DEV, "fails")), 7);
});

test("moments are counted, one for each step, from 0", () => {
  const tl = R.timeline(job(DEV));
  assert.deepEqual(tl.map((s) => s.moment), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test("the queue starts at the invented number of jobs ahead and drops by one a moment", () => {
  assert.equal(R.QUEUE_AHEAD, 3);
  const q = R.timeline(job(DEV)).filter((s) => s.state === "queued").map((s) => s.ahead);
  assert.deepEqual(q, [3, 2, 1, 0]);
  const sim = R.timeline(job(SIM));
  assert.ok(sim.every((s) => s.state !== "queued"));
});

test("a job that fails ends in Failed after running, and the exits are not on the path to Finished", () => {
  assert.deepEqual(states(job(SIM, "fails")), ["prepared", "submitted", "running", "failed"]);
  assert.deepEqual(states(job(DEV, "fails")).slice(-2), ["running", "failed"]);
});

test("the target decides rejection: the unadapted Bell circuit is refused by the device, and a T by the simulator", () => {
  assert.deepEqual(states(job(DEV, "rejected")), ["prepared", "submitted", "rejected"]);
  assert.deepEqual(states(job(SIM, "rejected")), ["prepared", "submitted", "rejected"]);
  const dev = R.check(circuitFor("rejected", DEV), DEV);
  assert.equal(dev.ok, false);
  assert.deepEqual(dev.offending.map((o) => o.id), ["h1"]);
  assert.match(dev.text, /Device Q4 does not list H on q₀/);
  const sim = R.check(circuitFor("rejected", SIM), SIM);
  assert.equal(sim.ok, false);
  assert.deepEqual(sim.offending.map((o) => o.id), ["t1"]);
  assert.match(sim.text, /Simulator does not list T on q₀/);
});

test("check agrees with QedTransform: a circuit is accepted exactly when adapting it changes nothing", () => {
  const circuits = [
    base(),
    R.circuitFor("rejected", SIM, base()),
    T.adapt(base(), DEV).circuit,
    T.adapt(base(), SIM).circuit,
    // a CNOT the wrong way round for the one-way target
    { qubits: ["q0", "q1"], ops: [{ id: "a", type: "cx", control: 1, target: 0, col: 0 }] },
  ];
  const targets = [SIM, DEV].concat(T.TARGETS);
  circuits.forEach((c) => targets.forEach((t) => {
    const a = T.adapt(c, t);
    assert.equal(R.check(c, t).ok, a.steps.length === 0 && a.problems.length === 0, t.name);
  }));
});

test("check names every operation the target does not list, and only those", () => {
  const c = { qubits: ["q0", "q1"], ops: [
    { id: "a", type: "h", targets: [0], col: 0 },
    { id: "b", type: "gate", gateId: "rx", label: "RX", targets: [1], col: 0 },
    { id: "c", type: "gate", gateId: "t", label: "T", targets: [0], col: 1 },
    { id: "d", type: "measure", targets: [0], col: 2 },
  ] };
  assert.deepEqual(R.check(c, DEV).offending.map((o) => o.id), ["a", "c"]);
  assert.deepEqual(R.check(c, SIM).offending.map((o) => o.id), ["c"]);
  assert.equal(R.check(c, SIM).ok, false);
});

test("the circuit the page sends: adapted for the device, as written for the simulator, a T added to make the simulator refuse", () => {
  const dev = circuitFor("finishes", DEV);
  assert.equal(R.check(dev, DEV).ok, true);
  assert.ok(dev.ops.some((o) => o.type === "gate" && o.gateId === "rz"));
  assert.ok(dev.ops.every((o) => o.type !== "h"));
  assert.deepEqual(circuitFor("finishes", SIM).ops.map((o) => o.id), ["h1", "cx1", "m0", "m1"]);
  assert.deepEqual(circuitFor("fails", SIM).ops.map((o) => o.id), ["h1", "cx1", "m0", "m1"]);
  assert.deepEqual(circuitFor("rejected", DEV).ops.map((o) => o.id), ["h1", "cx1", "m0", "m1"]);
  const sim = circuitFor("rejected", SIM);
  assert.deepEqual(sim.ops.map((o) => o.id), ["h1", "cx1", "t1", "m0", "m1"]);
  const cols = {}; sim.ops.forEach((o) => { cols[o.id] = o.col; });
  assert.deepEqual(cols, { h1: 0, cx1: 1, t1: 2, m0: 3, m1: 3 });
});

test("a new job is Prepared at moment 0 with its number", () => {
  const j = job(SIM, "finishes", 100, 12);
  assert.equal(j.state, "prepared");
  assert.equal(j.moment, 0);
  assert.equal(j.id, "job-0012");
  assert.equal(j.shots, 100);
  assert.deepEqual(j.history, [{ state: "prepared", moment: 0 }]);
});

test("a job needs a described target and a whole number of shots", () => {
  assert.throws(() => R.newJob(base(), null, 100), /target description/);
  assert.throws(() => R.newJob(base(), SIM, 0), /shots/);
  assert.throws(() => R.newJob(base(), SIM, 2.5), /shots/);
  assert.throws(() => R.newJob(base(), SIM, 100, { fate: "explodes" }), /fate/);
});

test("every legal move is allowed and every illegal one is refused", () => {
  const j = job(DEV);
  // advance: allowed until Finished or an exit
  let cur = j;
  const path = [];
  for (let guard = 0; R.canAdvance(cur); guard++) {
    assert.ok(guard < 50, "a job should end within a few moments");
    path.push(cur.state);
    cur = R.advance(cur);
  }
  assert.deepEqual(path.slice(0, 3), ["prepared", "submitted", "queued"]);
  assert.equal(cur.state, "finished");
  assert.throws(() => R.advance(cur), /cannot advance/);
  // exits cannot advance, cancel, or collect
  ["rejected", "fails"].forEach((o) => {
    const end = runToEnd(job(DEV, o));
    assert.equal(R.canAdvance(end), false);
    assert.equal(R.canCancel(end), false);
    assert.equal(R.canCollect(end), false);
    assert.throws(() => R.advance(end));
    assert.throws(() => R.cancel(end));
    assert.throws(() => R.collect(end));
  });
  // cancel is allowed only while queued or running
  let c = job(DEV);
  const can = [];
  for (let guard = 0; guard < 50; guard++) { can.push(R.canCancel(c)); if (!R.canAdvance(c)) break; c = R.advance(c); }
  assert.deepEqual(can, [false, false, true, true, true, true, true, false]);
  assert.throws(() => R.cancel(job(DEV)), /cannot be cancelled/);
  assert.throws(() => R.cancel(R.advance(job(DEV))), /cannot be cancelled/);
});

test("cancelling a queued or a running job ends it in Cancelled", () => {
  const queued = R.cancel(R.advance(R.advance(job(DEV))));
  assert.equal(queued.state, "cancelled");
  assert.equal(queued.moment, 3);
  const running = R.cancel(R.advance(R.advance(job(SIM))));
  assert.equal(running.state, "cancelled");
  assert.equal(R.canAdvance(queued), false);
  assert.throws(() => R.advance(queued));
  assert.throws(() => R.cancel(queued));
});

test("cancelling after Finished is refused", () => {
  const done = runToEnd(job(SIM));
  assert.equal(done.state, "finished");
  assert.throws(() => R.cancel(done), /finished job cannot be cancelled/);
  assert.throws(() => R.cancel(R.collect(done)));
});

test("collecting the counts is a separate action after Finished, and only once", () => {
  const done = runToEnd(job(SIM));
  assert.equal(done.collected, false);
  assert.equal(R.canCollect(done), true);
  const got = R.collect(done);
  assert.equal(got.collected, true);
  assert.equal(got.state, "finished");
  assert.equal(got.moment, done.moment + 1);
  assert.equal(R.canCollect(got), false);
  assert.throws(() => R.collect(got));
  assert.throws(() => R.collect(job(SIM)), /only a finished job/);
});

test("advance, cancel, and collect leave the job they were given unchanged", () => {
  const j = deepFreeze(clone(runToEnd(job(DEV))));
  const before = JSON.stringify(j);
  R.collect(j);
  assert.equal(JSON.stringify(j), before);
  const q = deepFreeze(clone(R.advance(R.advance(job(DEV)))));
  const qBefore = JSON.stringify(q);
  R.advance(q);
  R.cancel(q);
  assert.equal(JSON.stringify(q), qBefore);
  const p = deepFreeze(clone(job(SIM)));
  R.advance(p);
  R.timeline(p);
  R.lanes(p);
  R.describe(p);
  R.lanesHTML(p);
  R.lifecycleHTML(p);
  R.statusHTML(p);
});

test("a job does not alias the circuit it was given", () => {
  const c = base();
  const j = R.newJob(c, SIM, 10);
  j.circuit.ops[0].id = "changed";
  assert.equal(c.ops[0].id, "h1");
});

test("a rejected, failed, or cancelled job never has results, and neither does one still on its way", () => {
  assert.equal(R.results(runToEnd(job(DEV, "rejected"))), null);
  assert.equal(R.results(runToEnd(job(SIM, "rejected"))), null);
  assert.equal(R.results(runToEnd(job(DEV, "fails"))), null);
  assert.equal(R.results(runToEnd(job(SIM, "fails"))), null);
  assert.equal(R.results(R.cancel(R.advance(R.advance(job(SIM))))), null);
  assert.equal(R.results(R.cancel(R.advance(R.advance(job(DEV))))), null);
  let j = job(DEV);
  for (let guard = 0; R.canAdvance(j); guard++) {
    assert.ok(guard < 50, "a job should end within a few moments");
    j = R.advance(j);
    if (j.state !== "finished") assert.equal(R.results(j), null, j.state);
  }
  assert.notEqual(R.results(j), null);
});

test("counts add up to the shots, and every count is labelled simulated", () => {
  [1, 10, 100, 1000].forEach((shots) => [SIM, DEV].forEach((t) => {
    const r = R.results(runToEnd(job(t, "finishes", shots)));
    assert.equal(r.counts.reduce((a, b) => a + b, 0), shots);
    assert.equal(r.shots, shots);
    assert.equal(r.simulated, true);
    assert.deepEqual(r.labels, ["00", "01", "10", "11"]);
    assert.equal(r.targetName, t.name);
    assert.equal(r.counts.length, 4);
  }));
});

test("the simulator path gives only 00 and 11, and the device path adds a few of the others", () => {
  [10, 100, 1000, 5000].forEach((shots) => {
    const r = R.results(runToEnd(job(SIM, "finishes", shots)));
    assert.equal(r.counts[1], 0);
    assert.equal(r.counts[2], 0);
    assert.equal(r.invented, false);
  });
  const d = R.results(runToEnd(job(DEV, "finishes", 5000)));
  assert.equal(d.invented, true);
  assert.ok(d.counts[1] > 0 && d.counts[2] > 0);
  const off = (d.counts[1] + d.counts[2]) / 5000;
  assert.equal(R.OFF_SHARE, 0.04);
  assert.ok(Math.abs(off - 0.08) < 0.02, "about 4 in 100 each for 01 and 10");
  // the simulator's two outcomes are each about half
  const s = R.results(runToEnd(job(SIM, "finishes", 5000)));
  assert.ok(Math.abs(s.counts[0] / 5000 - 0.5) < 0.04);
});

test("the same job gives the same counts every time, and a new job gives different ones", () => {
  const a = R.results(runToEnd(job(SIM, "finishes", 100, 1)));
  const b = R.results(runToEnd(job(SIM, "finishes", 100, 1)));
  assert.deepEqual(a.counts, b.counts);
  const c = R.results(runToEnd(job(SIM, "finishes", 100, 2)));
  assert.notDeepEqual(a.counts, c.counts);
  const seen = new Set();
  for (let n = 1; n <= 6; n++) seen.add(R.results(runToEnd(job(SIM, "finishes", 100, n))).counts.join());
  assert.ok(seen.size >= 5, "successive jobs differ");
});

test("summarize turns counts into fractions and an agreement rate", () => {
  const s = R.summarize({ counts: [46, 4, 6, 44], shots: 100 });
  assert.equal(s.total, 100);
  assert.deepEqual(s.fractions, [0.46, 0.04, 0.06, 0.44]);
  assert.equal(s.agreeCount, 90);
  assert.ok(Math.abs(s.agreeFraction - 0.9) < 1e-12);
  const z = R.summarize({ counts: [0, 0, 0, 0], shots: 0 });
  assert.equal(z.agreeFraction, 0);
  const r = R.summarize(R.results(runToEnd(job(SIM, "finishes", 200))));
  assert.equal(r.agreeFraction, 1);
});

test("the rotation reads 1 with chance sin squared of half the angle, and 120 degrees gives 0.75", () => {
  assert.ok(Math.abs(R.rotationProbability(0)) < 1e-12);
  assert.ok(Math.abs(R.rotationProbability(90) - 0.5) < 1e-12);
  assert.ok(Math.abs(R.rotationProbability(180) - 1) < 1e-12);
  assert.ok(Math.abs(R.rotationProbability(120) - 0.75) < 1e-12);
  assert.ok(Math.abs(R.rotationProbability(30) - Math.pow(Math.sin(Math.PI / 12), 2)) < 1e-12);
  for (let a = 0; a <= 180; a += 7) assert.ok(Math.abs(R.rotationProbability(a) - Math.pow(Math.sin((a * Math.PI) / 360), 2)) < 1e-12, String(a));
});

test("a flipped reported bit pulls the chance toward one half by the invented share", () => {
  assert.ok(Math.abs(R.rotationProbability(0, 0.03) - 0.03) < 1e-12);
  assert.ok(Math.abs(R.rotationProbability(180, 0.03) - 0.97) < 1e-12);
  assert.ok(Math.abs(R.rotationProbability(120, 0.03) - (0.75 * 0.97 + 0.25 * 0.03)) < 1e-12);
  assert.equal(R.FLIP, 0.03);
});

test("the rule moves the angle toward the target and stays between 0 and 180", () => {
  assert.equal(R.nextAngle(0.75, 90), 90);
  assert.ok(R.nextAngle(0.5, 90) > 90, "estimate below the target: turn further");
  assert.ok(R.nextAngle(0.9, 90) < 90, "estimate above the target: turn back");
  assert.equal(R.nextAngle(0.07, 30), 98);
  assert.equal(R.nextAngle(0, 170), 180);
  assert.equal(R.nextAngle(1, 10), 0);
  for (let a = 0; a <= 180; a += 15) for (let e = 0; e <= 1; e += 0.1) {
    const n = R.nextAngle(e, a);
    assert.ok(n >= 0 && n <= 180);
    if (e < 0.75) assert.ok(n >= a);
    if (e > 0.75) assert.ok(n <= a);
  }
  assert.equal(R.nextAngle(0.5, 100, 0.75, 40), 110);
});

test("the loop starts at 30 degrees, steers toward 0.75, and its constants are the stated ones", () => {
  assert.equal(R.ANGLE_START, 30);
  assert.equal(R.TARGET_FRACTION, 0.75);
  assert.equal(R.GAIN, 100);
  assert.equal(R.TOLERANCE, 0.05);
  assert.equal(R.MAX_PASSES, 10);
  assert.equal(R.LOOP_SEED, 7);
  const l = R.runLoop({ kind: "simulator", shots: 100 });
  assert.deepEqual(l, R.runLoop({ kind: "simulator", shots: 100, seed: R.LOOP_SEED }), "the default seed is the stated one");
  assert.equal(l.passes[0].angle, 30);
  assert.equal(l.passes[0].next, R.nextAngle(l.passes[0].estimate, 30));
  assert.equal(l.passes[1].angle, l.passes[0].next);
});

test("the loop is repeatable for a seed, and different seeds give different rows", () => {
  const a = R.runLoop({ kind: "device", shots: 100, seed: 3 });
  const b = R.runLoop({ kind: "device", shots: 100, seed: 3 });
  assert.deepEqual(a, b);
  const c = R.runLoop({ kind: "device", shots: 100, seed: 4 });
  assert.notDeepEqual(a.passes, c.passes);
});

test("running fewer passes gives the first rows of the longer run", () => {
  const full = R.runLoop({ kind: "simulator", shots: 20, seed: 7 });
  for (let k = 1; k <= full.passes.length; k++) {
    const part = R.runLoop({ kind: "simulator", shots: 20, seed: 7, passes: k });
    assert.deepEqual(part.passes, full.passes.slice(0, k));
    assert.equal(part.stopped, k === full.passes.length ? full.stopped : null);
  }
});

test("the loop counts its jobs and shots, and each row is a whole job", () => {
  [20, 100, 500].forEach((shots) => {
    const l = R.runLoop({ kind: "simulator", shots, seed: 5 });
    assert.equal(l.jobs, l.passes.length);
    assert.equal(l.shotsUsed, l.jobs * shots);
    l.passes.forEach((r, i) => {
      assert.equal(r.pass, i + 1);
      assert.equal(r.jobId, "job-" + String(i + 1).padStart(4, "0"));
      assert.equal(r.shots, shots);
      assert.equal(r.counts[0] + r.counts[1], shots);
      assert.equal(r.estimate, r.counts[1] / shots);
    });
  });
  assert.equal(R.runLoop({ passes: 10 }).passes[0].jobId, "job-0001");
});

// the distance of a row's estimate from the target, rounded so that 0.8 against 0.75 is 0.05
const gap = (r) => Math.round(Math.abs(r.estimate - R.TARGET_FRACTION) * 1e9) / 1e9;

test("an estimate exactly one tolerance from the target counts as within it", () => {
  // with 20 shots every estimate is a multiple of 0.05, so the boundary is reached
  let boundary = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const l = R.runLoop({ kind: "simulator", shots: 20, seed });
    const last = l.passes[l.passes.length - 1];
    if (l.stopped === "tolerance" && gap(last) === 0.05) boundary++;
    l.passes.forEach((r) => { if (gap(r) === 0.05) assert.equal(r, last, "a row on the boundary stops the loop"); });
  }
  assert.ok(boundary > 0, "some loops stop exactly on the boundary");
});

test("every pass draws its own counts, even when the angle does not change", () => {
  const l = R.runLoop({ kind: "simulator", shots: 100, seed: 3, gain: 0, tolerance: -1, startAngle: 90 });
  assert.equal(l.passes.length, R.MAX_PASSES);
  assert.ok(l.passes.every((r) => r.angle === 90));
  assert.ok(new Set(l.passes.map((r) => r.counts.join())).size >= 5);
  const m = R.runLoop({ kind: "simulator", shots: 100, seed: 4, gain: 0, tolerance: -1, startAngle: 90 });
  assert.notDeepEqual(l.passes.map((r) => r.counts), m.passes.map((r) => r.counts));
});

test("the loop stops within the tolerance, or at the pass limit, and never goes past the limit", () => {
  let tol = 0;
  let lim = 0;
  [20, 100, 500, 2000].forEach((shots) => ["simulator", "device"].forEach((kind) => {
    for (let seed = 1; seed <= 40; seed++) {
      const l = R.runLoop({ kind, shots, seed });
      assert.ok(l.passes.length <= R.MAX_PASSES);
      const last = l.passes[l.passes.length - 1];
      assert.ok(l.stopped === "tolerance" || l.stopped === "limit");
      if (l.stopped === "tolerance") {
        tol++;
        assert.ok(gap(last) <= R.TOLERANCE);
        assert.equal(last.next, null);
      } else {
        lim++;
        assert.equal(l.passes.length, R.MAX_PASSES);
      }
      // no earlier row is already inside the tolerance (it would have stopped)
      l.passes.slice(0, -1).forEach((r) => assert.ok(gap(r) > R.TOLERANCE));
    }
  }));
  assert.ok(tol > 0, "some loops settle");
  assert.ok(lim >= 0);
  const forced = R.runLoop({ kind: "simulator", shots: 20, seed: 7, maxPasses: 2, tolerance: 0 });
  assert.equal(forced.passes.length, 2);
  assert.equal(forced.stopped, "limit");
});

test("with many shots the loop settles near the angle that gives the target, and with few it jumps about more", () => {
  const ideal = 120;
  let settledNear = 0;
  let spreadSmall = 0;
  let spreadLarge = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const big = R.runLoop({ kind: "simulator", shots: 2000, seed });
    const last = big.passes[big.passes.length - 1];
    if (big.stopped === "tolerance" && Math.abs(last.angle - ideal) < 12) settledNear++;
    const small = R.runLoop({ kind: "simulator", shots: 10, seed, tolerance: 0 });
    const errs = (loop) => loop.passes.map((r) => Math.abs(r.estimate - R.rotationProbability(r.angle)));
    spreadSmall += errs(small).reduce((a, b) => a + b, 0) / small.passes.length;
    const large = R.runLoop({ kind: "simulator", shots: 500, seed, tolerance: 0 });
    spreadLarge += errs(large).reduce((a, b) => a + b, 0) / large.passes.length;
  }
  assert.equal(settledNear, 60);
  assert.ok(spreadSmall > 2 * spreadLarge, "estimates from few shots are further from the exact chance");
});

test("each estimate is close to the exact chance for many shot counts (a seeded cross-check)", () => {
  [50, 200, 1000, 5000].forEach((shots) => [0, 20, 60, 120, 170].forEach((angle) => {
    let worst = 0;
    for (let seed = 1; seed <= 25; seed++) {
      const l = R.runLoop({ kind: "simulator", shots, seed, startAngle: angle, passes: 1, tolerance: -1 });
      worst = Math.max(worst, Math.abs(l.passes[0].estimate - R.rotationProbability(angle)));
    }
    assert.ok(worst < 5 * Math.sqrt(0.25 / shots) + 1e-9, shots + " shots at " + angle + " degrees: " + worst);
  }));
  // the device path reads the flipped chance
  const d = R.runLoop({ kind: "device", shots: 20000, seed: 2, startAngle: 0, passes: 1, tolerance: -1 });
  assert.ok(Math.abs(d.passes[0].estimate - R.FLIP) < 0.01);
});

test("the loop rejects a bad number of shots", () => {
  assert.throws(() => R.runLoop({ shots: 0 }), /shots/);
  assert.throws(() => R.runLoop({ shots: 1.5 }), /shots/);
});

test("what each side holds follows the job, and the crossed item names what moved", () => {
  const p = R.lanes(job(DEV));
  assert.ok(p.program.some((t) => /instruction list/.test(t)));
  assert.ok(p.program.some((t) => /Device Q4, 100 shots/.test(t)));
  assert.ok(p.target.some((t) => /No job yet/.test(t)));
  assert.equal(p.crossed, null);
  const sub = R.lanes(R.advance(job(DEV)));
  assert.ok(sub.target.some((t) => /just received/.test(t)));
  assert.match(sub.crossed, /from the program side to the target/);
  const q = R.lanes(R.advance(R.advance(job(DEV))));
  assert.ok(q.target.some((t) => /3 jobs ahead \(invented\)/.test(t)));
  let front = job(DEV);
  while (front.state !== "queued" || front.ahead > 0) front = R.advance(front);
  assert.ok(R.lanes(front).target.some((t) => /none ahead, next to run \(invented\)/.test(t)));
  assert.match(R.describe(front), /None ahead, next to run \(invented\)/);
  const one = R.advance(R.advance(R.advance(R.advance(job(DEV)))));
  assert.equal(one.ahead, 1);
  assert.ok(R.lanes(one).target.some((t) => /1 job ahead \(invented\)/.test(t)));
  const done = runToEnd(job(DEV));
  assert.ok(R.lanes(done).target.some((t) => /held until they are collected/.test(t)));
  const got = R.lanes(R.collect(done));
  assert.ok(got.program.some((t) => /counts, ready to use/.test(t)));
  assert.match(got.crossed, /from the target to the program side/);
  const rej = R.lanes(runToEnd(job(DEV, "rejected")));
  assert.ok(rej.target.some((t) => /does not list H on q₀/.test(t)));
  assert.ok(rej.program.some((t) => /No results/.test(t)));
  const fail = R.lanes(runToEnd(job(SIM, "fails")));
  assert.ok(fail.target.some((t) => /Nothing to hand back/.test(t)));
});

test("the sentence for the live region gives the moment, the state, and what crossed", () => {
  const q = R.describe(R.advance(R.advance(job(DEV))));
  assert.match(q, /Moment 2 of 8\./);
  assert.match(q, /job-0001 \(invented\) on Device Q4 is queued\./);
  assert.match(q, /3 jobs ahead \(invented\)/);
  assert.match(R.describe(runToEnd(job(DEV, "rejected"))), /rejected\..*No results\./);
  assert.match(R.describe(runToEnd(job(SIM, "fails"))), /failed\..*No results\./);
  assert.match(R.describe(R.collect(runToEnd(job(SIM)))), /The counts were collected\./);
  assert.match(R.describe(R.cancel(R.advance(R.advance(job(SIM))))), /cancelled/);
});

test("the pictures say what they show in words, not only by shape", () => {
  const html = R.lifecycleHTML(job(DEV));
  ["Prepared", "Submitted", "Queued", "Running", "Finished", "Rejected", "Failed", "Cancelled"].forEach((l) => assert.ok(html.includes(l), l));
  assert.match(html, /aria-current="step"/);
  assert.equal((html.match(/>now</g) || []).length, 1);
  const simHtml = R.lifecycleHTML(job(SIM));
  assert.ok(!/<strong>Queued<\/strong>/.test(simHtml.split("A job can also end")[0]));
  assert.match(simHtml, /starts the job at once in this model/);
  const moved = R.lifecycleHTML(R.advance(R.advance(job(DEV))));
  assert.ok((moved.match(/>done</g) || []).length >= 2);
  const status = R.statusHTML(R.advance(R.advance(job(DEV))));
  assert.match(status, /Queued/);
  assert.match(status, /moment 2 of 8/);
  assert.match(status, /3 jobs ahead \(invented\)/);
  assert.match(status, /invented/);
  const lanes = R.lanesHTML(job(DEV));
  assert.match(lanes, /Program side/);
  assert.match(lanes, /Target/);
  assert.match(lanes, /just crossed/);
  const counts = R.countsTableHTML(R.results(runToEnd(job(SIM, "finishes", 100))));
  assert.match(counts, /Fraction of 100 shots/);
  assert.match(counts, /<th scope="row">00<\/th>/);
  const loop = R.loopTableHTML(R.runLoop({ kind: "simulator", shots: 100 }));
  assert.match(loop, /Angle sent/);
  assert.match(loop, /Estimate of 1s/);
  assert.match(loop, /30°/);
});

test("text from the data is escaped in the pictures", () => {
  const sneaky = Object.assign({}, SIM, { name: "<b>Sim</b>" });
  const j = R.newJob(circuitFor("finishes", SIM), sneaky, 10);
  const html = R.lanesHTML(j) + R.statusHTML(j) + R.lifecycleHTML(j);
  assert.ok(!html.includes("<b>Sim</b>"));
  assert.ok(html.includes("&lt;b&gt;Sim&lt;/b&gt;"));
});

test("circuitFor does not change the circuit it is given", () => {
  const c = deepFreeze(base());
  R.circuitFor("finishes", DEV, c);
  R.circuitFor("rejected", SIM, c);
  R.circuitFor("rejected", DEV, c);
  R.check(c, DEV);
});
