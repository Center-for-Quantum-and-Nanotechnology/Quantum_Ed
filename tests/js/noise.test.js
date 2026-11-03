// Tests for docs/assets/javascripts/noise.js (window.QedNoise): an error budget for three
// operations on three invented qubits, five kinds of source, a drifting strength, a tune that
// re-runs the drive-and-flip sweep, and a measured reported figure. QedNoise calls QedDrive,
// QedCoherence, QedReadout, and QedShots at run time, so those four (and QedQubit and QedGates,
// which they need) are loaded.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["qubit.js", "gates.js", "shots.js", "drive.js", "coherence.js", "readout.js", "noise.js"]);
const N = w.QedNoise;
const D = w.QedDrive;
const C = w.QedCoherence;
const R = w.QedReadout;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const QUBITS = N.QUBITS.map((q) => q.id);
const OPS = N.OPERATIONS.map((o) => o.id);
const share = (rows, id) => rows.filter((r) => r.id === id)[0];
const set = (qubit, operation, time, extra) => Object.assign({ qubit, operation, time }, extra || {});

test("the invented values are as stated on the page", () => {
  assert.deepEqual(N.QUBITS.map((q) => [q.id, q.drift]), [["a", 0.001], ["b", -0.003], ["c", 0.002]]);
  assert.deepEqual(N.QUBITS.map((q) => [q.neighbours.drive, q.neighbours.gate2, q.neighbours.readout]), [[0.001, 0.016, 0.003], [0.003, 0.010, 0.004], [0.002, 0.008, 0.005]]);
  assert.deepEqual(N.QUBITS.map((q) => [q.leakage.drive, q.leakage.gate2]), [[0.004, 0.006], [0.001, 0.003], [0.0015, 0.002]]);
  assert.deepEqual(N.SOURCES.map((s) => s.id), ["environment", "control", "neighbours", "leakage", "readout"]);
  assert.deepEqual(N.OPERATIONS.map((o) => o.id), ["drive", "gate2", "readout"]);
  assert.equal(N.TIME_MAX, 48);
  assert.equal(N.RUNS, 1000);
  assert.equal(N.CONTROL_SENSITIVITY, 2);
  assert.equal(N.STRENGTH, "medium");
  assert.deepEqual(N.DEFAULTS, { qubit: "a", operation: "drive", time: 0 });
  assert.deepEqual(N.REMEASURED.map((r) => r.page), ["Gates and Control", "Readout", "Coherence"]);
  assert.deepEqual(N.lengthOf("drive"), 1);
  assert.equal(N.lengthOf("gate2"), 4);
  assert.equal(N.lengthOf("readout"), 10);
  assert.equal(N.nominalLength(), 6);
});

test("every source applies to the operations the page says", () => {
  const applies = (id) => N.SOURCES.filter((s) => s.id === id)[0].appliesTo;
  assert.deepEqual(applies("environment"), ["drive", "gate2", "readout"]);
  assert.deepEqual(applies("control"), ["drive", "gate2"]);
  assert.deepEqual(applies("neighbours"), ["drive", "gate2", "readout"]);
  assert.deepEqual(applies("leakage"), ["drive", "gate2"]);
  assert.deepEqual(applies("readout"), ["readout"]);
});

test("unknown ids are refused with a clear message", () => {
  assert.throws(() => N.qubitById("z"), /no qubit called z/);
  assert.throws(() => N.operationById("gate9"), /no operation called gate9/);
  assert.throws(() => N.sourceById("magic"), /no source called magic/);
  assert.throws(() => N.lengthOf("gate9"), /no operation called gate9/);
});

test("snapTime clamps to 0..48 and snaps to whole steps", () => {
  assert.equal(N.snapTime(-4), 0);
  assert.equal(N.snapTime(999), 48);
  assert.equal(N.snapTime(12.4), 12);
  assert.equal(N.snapTime(12.6), 13);
  assert.equal(N.snapTime("30"), 30);
  assert.equal(N.snapTime("not a number"), 0);
  assert.equal(N.snapTime(NaN), 0);
});

test("settingsOf fills in the defaults, keeps the sources on, and sorts the tunes", () => {
  const s = N.settingsOf();
  assert.equal(s.qubit, "a");
  assert.equal(s.operation, "drive");
  assert.equal(s.time, 0);
  assert.deepEqual(s.on, { environment: true, control: true, neighbours: true, leakage: true, readout: true });
  assert.deepEqual(s.tunes, [{ time: 0, length: 6 }]);
  const t = N.settingsOf({ time: 99, on: { control: false }, tunes: [{ time: 30, length: 7 }, { time: 0, length: 6 }] });
  assert.equal(t.time, 48);
  assert.equal(t.on.control, false);
  assert.equal(t.on.leakage, true);
  assert.deepEqual(t.tunes.map((x) => x.time), [0, 30]);
});

test("the drifted strength is linear in time and has the stated sign for each qubit", () => {
  QUBITS.forEach((q) => {
    close(N.strengthFactor(q, 0), 1);
    const d = N.qubitById(q).drift;
    for (let t = 0; t <= 48; t += 6) close(N.strengthFactor(q, t), 1 + d * t, 1e-12);
  });
  assert.ok(N.strengthFactor("a", 48) > 1);
  assert.ok(N.strengthFactor("b", 48) < 1);
  assert.ok(N.strengthFactor("c", 48) > 1);
  close(N.strengthFactor("b", 48), 0.856, 1e-12);
});

test("tuneAt returns the latest tune made at or before the time", () => {
  const tunes = [{ time: 0, length: 6 }, { time: 20, length: 6.5 }, { time: 40, length: 7 }];
  assert.equal(N.tuneAt(tunes, 0).length, 6);
  assert.equal(N.tuneAt(tunes, 19).length, 6);
  assert.equal(N.tuneAt(tunes, 20).length, 6.5);
  assert.equal(N.tuneAt(tunes, 39).length, 6.5);
  assert.equal(N.tuneAt(tunes, 48).length, 7);
});

test("the environment share equals the stated form from QedCoherence for each operation", () => {
  QUBITS.forEach((q) => OPS.forEach((op) => {
    const c = C.qubitById(q);
    const L = N.lengthOf(op);
    const energy = 1 - Math.exp(-L / c.t1);
    const phase = 1 - Math.exp(-L / c.t2);
    const expected = op === "readout" ? energy / 2 : (energy + phase) / 2;
    close(share(N.shares(set(q, op, 0)), "environment").share, expected, 1e-12);
  }));
  // a readout counts only half the energy loss, and none of the phase loss
  const a = N.shares(set("b", "readout", 0));
  close(share(a, "environment").share, 0.5 * (1 - Math.exp(-10 / 400)), 1e-12);
});

test("the control share is 0 for an exact half turn, grows with the time since the last tune, and is twice as large for the gate", () => {
  QUBITS.forEach((q) => {
    close(share(N.shares(set(q, "drive", 0)), "control").share, 0, 1e-12);
    let last = -1;
    for (let t = 0; t <= 48; t += 4) {
      const e = share(N.shares(set(q, "drive", t)), "control").share;
      assert.ok(e >= last - 1e-12, q + " at " + t);
      last = e;
      close(share(N.shares(set(q, "gate2", t)), "control").share, Math.min(1, 2 * e), 1e-12);
    }
    assert.ok(last > 0.003);
  });
  // Qubit B drifts the most, Qubit A the least
  const at48 = (q) => share(N.shares(set(q, "drive", 48)), "control").share;
  assert.ok(at48("b") > at48("c") && at48("c") > at48("a"));
  close(at48("b"), 0.0503, 0.0005);
  close(at48("a"), 0.0057, 0.0003);
});

test("the control share is the chance a half turn at the stored length does not end in |1>, from QedDrive", () => {
  const tunes = [{ time: 0, length: 6.5 }];
  const made = D.turn({ direction: "x", strength: "medium", length: 6.5, miscalibration: N.strengthFactor("c", 20) }).made;
  close(share(N.shares(set("c", "drive", 20, { tunes })), "control").share, 1 - D.probabilityOne(made), 1e-12);
  close(N.madeTurn("c", tunes, 20), made, 1e-9);
  close(N.controlError("c", tunes, 20), 1 - D.probabilityOne(made), 1e-12);
  // a stored length between two steps (the middle of two tied lengths) is used exactly, not snapped
  const between = [{ time: 0, length: 5.75 }];
  close(N.madeTurn("a", between, 0), 30 * 5.75, 1e-9);
  close(N.madeTurn("c", between, 20), 30 * 5.75 * N.strengthFactor("c", 20), 1e-9);
  close(N.controlError("a", between, 0), 1 - D.probabilityOne(172.5), 1e-12);
  // a tune made later is the one in force
  const later = [{ time: 0, length: 6 }, { time: 20, length: 5.5 }];
  assert.notEqual(N.controlError("c", later, 25), N.controlError("c", [{ time: 0, length: 6 }], 25));
});

test("the readout share is the average of the two misreads from QedReadout and applies to the readout only", () => {
  const m = R.misreads({ separation: "medium", fallback: "off", threshold: R.means({ separation: "medium" }).middle });
  QUBITS.forEach((q) => {
    const rows = N.shares(set(q, "readout", 0));
    close(share(rows, "readout").share, (m.zeroAsOne + m.oneAsZero) / 2, 1e-12);
    assert.equal(share(rows, "readout").applies, true);
    ["drive", "gate2"].forEach((op) => { assert.equal(share(N.shares(set(q, op, 0)), "readout").applies, false); });
  });
  assert.ok(Math.abs(share(N.shares(set("a", "readout", 0)), "readout").share - 0.0228) < 0.0005);
});

test("leakage and control are not applicable to a readout, and neighbours apply to all three operations", () => {
  QUBITS.forEach((q) => {
    const rows = N.shares(set(q, "readout", 30));
    assert.equal(share(rows, "leakage").applies, false);
    assert.equal(share(rows, "control").applies, false);
    assert.equal(share(rows, "leakage").share, 0);
    assert.equal(share(rows, "control").share, 0);
    OPS.forEach((op) => {
      const r = share(N.shares(set(q, op, 0)), "neighbours");
      assert.equal(r.applies, true);
      close(r.share, N.qubitById(q).neighbours[op], 1e-12);
    });
    ["drive", "gate2"].forEach((op) => close(share(N.shares(set(q, op, 0)), "leakage").share, N.qubitById(q).leakage[op], 1e-12));
  });
});

test("every row appears in order, with its label, and the sources start on", () => {
  const rows = N.shares(set("a", "drive", 0));
  assert.deepEqual(rows.map((r) => r.id), ["environment", "control", "neighbours", "leakage", "readout"]);
  assert.deepEqual(rows.map((r) => r.label), ["Environment", "Control", "Neighbours", "Leakage", "Readout"]);
  assert.ok(rows.every((r) => r.on));
  assert.equal(N.shares(set("a", "drive", 0, { on: { leakage: false } }))[3].on, false);
});

test("combine returns the exact total of the sources that are on, close to their sum, and 0 when none is on", () => {
  QUBITS.forEach((q) => OPS.forEach((op) => {
    const rows = N.shares(set(q, op, 10));
    let sum = 0, right = 1;
    rows.forEach((r) => { if (r.applies && r.on) { sum += r.share; right *= 1 - r.share; } });
    close(N.combine(rows), 1 - right, 1e-12);
    assert.ok(N.combine(rows) <= sum + 1e-12);
    assert.ok(sum - N.combine(rows) <= (sum * sum) / 2 + 1e-12, "the total is close to the sum when the shares are small");
  }));
  const none = N.shares(set("a", "drive", 10, { on: { environment: false, control: false, neighbours: false, leakage: false, readout: false } }));
  assert.equal(N.combine(none), 0);
  assert.equal(N.fidelity(0.03), 0.97);
  close(N.fidelity(N.combine(N.shares(set("a", "readout", 0)))), 1 - N.combine(N.shares(set("a", "readout", 0))), 1e-12);
});

test("dominant returns the largest source, names ties, and returns none when no source is on", () => {
  const rows = N.shares(set("a", "gate2", 0));
  assert.deepEqual(N.dominant(rows).ids, ["neighbours"]);
  close(N.dominant(rows).share, 0.016, 1e-12);
  const tied = [{ id: "x", applies: true, on: true, share: 0.01 }, { id: "y", applies: true, on: true, share: 0.01 }, { id: "z", applies: true, on: true, share: 0.002 }, { id: "w", applies: true, on: false, share: 0.5 }, { id: "v", applies: false, on: true, share: 0.9 }];
  assert.deepEqual(N.dominant(tied).ids, ["x", "y"]);
  assert.deepEqual(N.dominant([{ id: "x", applies: true, on: false, share: 0.1 }]), { ids: [], share: 0 });
  assert.deepEqual(N.dominant([]), { ids: [], share: 0 });
  // switching a source off hands the lead to the next one
  const off = N.shares(set("a", "gate2", 0, { on: { neighbours: false } }));
  assert.deepEqual(N.dominant(off).ids, ["environment"]);
});

test("every source is the largest somewhere in the grid of qubit, operation, and time, and none is the largest everywhere", () => {
  const led = { environment: 0, control: 0, neighbours: 0, leakage: 0, readout: 0 };
  let cells = 0;
  QUBITS.forEach((q) => OPS.forEach((op) => {
    for (let t = 0; t <= 48; t++) {
      cells++;
      N.dominant(N.shares(set(q, op, t))).ids.forEach((id) => { led[id]++; });
    }
  }));
  Object.keys(led).forEach((id) => {
    assert.ok(led[id] > 0, id + " is the largest somewhere");
    assert.ok(led[id] < cells, id + " is not the largest everywhere");
  });
  // the page's examples
  assert.deepEqual(N.dominant(N.shares(set("a", "drive", 0))).ids, ["leakage"]);
  assert.deepEqual(N.dominant(N.shares(set("a", "drive", 48))).ids, ["control"]);
  assert.deepEqual(N.dominant(N.shares(set("a", "gate2", 0))).ids, ["neighbours"]);
  assert.deepEqual(N.dominant(N.shares(set("a", "readout", 0))).ids, ["readout"]);
  assert.deepEqual(N.dominant(N.shares(set("c", "readout", 0))).ids, ["environment"]);
});

test("the largest source changes with the qubit, the operation, and the time", () => {
  const top = (s) => N.dominant(N.shares(s)).ids.join();
  assert.notEqual(top(set("a", "drive", 0)), top(set("a", "drive", 48)), "the time");
  assert.notEqual(top(set("a", "drive", 0)), top(set("a", "readout", 0)), "the operation");
  assert.notEqual(top(set("a", "readout", 0)), top(set("c", "readout", 0)), "the qubit");
});

test("switching a source off removes exactly its share from the total and changes no other share", () => {
  QUBITS.forEach((q) => OPS.forEach((op) => {
    const all = N.shares(set(q, op, 24));
    N.SOURCES.forEach((src) => {
      const off = N.shares(set(q, op, 24, { on: { [src.id]: false } }));
      all.forEach((r, i) => close(off[i].share, r.share, 1e-12));
      const r = share(all, src.id);
      if (r.applies) close(1 - N.combine(off), (1 - N.combine(all)) / (1 - r.share), 1e-9);
      else close(N.combine(off), N.combine(all), 1e-12);
    });
  }));
});

test("a tune repeats for the same seed and changes for a new one, and changes no setting", () => {
  const s = deepFreeze(set("b", "drive", 30, { tunes: [{ time: 0, length: 6 }] }));
  const a = N.tune(s, 11);
  const b = N.tune(s, 11);
  assert.deepEqual(a, b);
  let different = false;
  for (let seed = 12; seed < 60 && !different; seed++) {
    const o = N.tune(s, seed);
    if (o.ones !== a.ones || JSON.stringify(o.tied) !== JSON.stringify(a.tied) || o.length !== a.length) different = true;
  }
  assert.ok(different, "some other seed gives a different sweep");
  assert.equal(a.time, 30);
  assert.equal(a.previous, 6);
  assert.equal(N.tune(set("b", "drive", 30, { tunes: [{ time: 0, length: 6.5 }, { time: 10, length: 7 }] }), 11).previous, 7, "the length it replaces is the tune in force");
  assert.equal(N.tune(set("b", "drive", 5, { tunes: [{ time: 0, length: 6.5 }, { time: 10, length: 7 }] }), 11).previous, 6.5);
  for (let seed = 1; seed <= 30; seed++) {
    const o = N.tune(set("a", "drive", 12), seed);
    assert.equal(o.length, (o.tied[0] + o.tied[o.tied.length - 1]) / 2, "the middle of the tied lengths");
    assert.ok(o.ones >= 90, "the best length gave most of the runs reading 1");
  }
  close(a.factor, N.strengthFactor("b", 30), 1e-12);
  assert.deepEqual(clone(s), { qubit: "b", operation: "drive", time: 30, tunes: [{ time: 0, length: 6 }] });
});

test("a tune finds a stored length near the half-turn length for the strength in force, and moves the right way as it drifts", () => {
  for (let seed = 1; seed <= 20; seed++) {
    QUBITS.forEach((q) => {
      [0, 24, 48].forEach((t) => {
        const tn = N.tune(set(q, "drive", t), seed);
        const wanted = 6 / N.strengthFactor(q, t);
        assert.ok(Math.abs(tn.length - wanted) <= 1, q + " at " + t + " seed " + seed + ": found " + tn.length + ", wanted " + wanted);
        assert.ok(Math.abs(tn.offsetDeg) <= 30);
      });
    });
  }
  // Qubit B gets weaker, so its half turn takes longer; Qubit C gets stronger, so it takes less
  const longer = [], shorter = [];
  for (let seed = 1; seed <= 20; seed++) { longer.push(N.tune(set("b", "drive", 48), seed).length); shorter.push(N.tune(set("c", "drive", 48), seed).length); }
  assert.ok(longer.every((l) => l > 6.2), "B: " + longer);
  assert.ok(shorter.every((l) => l < 5.8), "C: " + shorter);
});

test("a tune leaves a residual, and the control error after it is smaller than before when the strength has drifted", () => {
  const before = set("b", "drive", 40);
  const tn = N.tune(before, 2100);
  const after = set("b", "drive", 40, { tunes: [{ time: 0, length: 6 }, { time: tn.time, length: tn.length }] });
  assert.ok(N.controlError("b", after.tunes, 40) < N.controlError("b", before.tunes || [{ time: 0, length: 6 }], 40));
  close(N.controlError("b", after.tunes, 40), tn.error, 1e-9);
  close(tn.offsetDeg, tn.made - 180, 1e-9);
  // the turn the tune reports is the turn the stored length makes, whether or not it is on a step
  for (let seed = 1; seed <= 30; seed++) {
    QUBITS.forEach((q) => {
      const o = N.tune(set(q, "drive", 48), seed);
      close(o.made, 30 * o.length * N.strengthFactor(q, 48), 1e-9);
      close(N.madeTurn(q, [{ time: 48, length: o.length }], 48), o.made, 1e-9);
    });
  }
  // not zero in general: over many seeds some tunes leave a measurable offset
  let leftOver = 0;
  for (let seed = 1; seed <= 30; seed++) if (Math.abs(N.tune(set("a", "drive", 20), seed).offsetDeg) > 1) leftOver++;
  assert.ok(leftOver > 0);
});

test("the tunes a page starts with are a tune at time 0, computed the same way, and repeat", () => {
  QUBITS.forEach((q) => {
    const a = N.initialTunes(q, 2000);
    assert.deepEqual(a, N.initialTunes(q, 2000));
    assert.equal(a.length, 1);
    assert.equal(a[0].time, 0);
    assert.ok(Math.abs(a[0].length - 6) <= 0.5);
    const t = N.tune({ qubit: q, time: 0 }, 2000);
    assert.equal(a[0].length, t.length);
  });
});

test("measureFigure repeats for the same seed, totals the runs, and is near the exact fidelity over many seeds", () => {
  const s = set("a", "gate2", 0);
  const a = N.measureFigure(s, 5);
  assert.deepEqual(a, N.measureFigure(s, 5));
  assert.notEqual(N.measureFigure(s, 6).right, a.right);
  assert.equal(a.runs, 1000);
  assert.equal(a.right + a.wrong, 1000);
  close(a.share, a.right / 1000, 1e-12);
  close(a.exact, 1 - N.combine(N.shares(s)), 1e-12);
  let rights = 0;
  for (let seed = 1; seed <= 60; seed++) rights += N.measureFigure(s, seed).right;
  assert.ok(Math.abs(rights / 60000 - a.exact) < 0.003, rights / 60000 + " vs " + a.exact);
  // a source switched off changes the figure the runs are drawn from
  assert.ok(N.measureFigure(set("a", "gate2", 0, { on: { neighbours: false } }), 5).exact > a.exact);
});

test("the drift curve rises with the time since the last tune, and falls back after a tune", () => {
  const pts = N.driftCurve(set("b", "drive", 20));
  assert.equal(pts.length, 49);
  assert.deepEqual(pts.map((p) => p.time), Array.from({ length: 49 }, (_, i) => i));
  assert.equal(pts[0].error, 0);
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].error >= pts[i - 1].error - 1e-12);
  assert.ok(pts.slice(0, 21).every((p) => p.past));
  assert.ok(pts.slice(21).every((p) => !p.past));
  const tuned = N.driftCurve(set("b", "drive", 30, { tunes: [{ time: 0, length: 6 }, { time: 24, length: 6.5 }] }));
  assert.ok(tuned[23].error > tuned[24].error, "the error falls back at the tune");
  assert.ok(tuned[48].error < N.driftCurve(set("b", "drive", 30))[48].error, "and ends lower than without it");
});

test("the budget rows carry the words for a source that is off or does not apply, and mark only the largest", () => {
  const rows = N.budgetRows(set("a", "readout", 0));
  assert.deepEqual(rows.map((r) => r.label), ["Environment", "Control", "Neighbours", "Leakage", "Readout"]);
  assert.equal(rows[1].text, "not applicable");
  assert.equal(rows[3].text, "not applicable");
  assert.match(rows[4].text, /^✕ 2\.28% error {2}◆ largest$/);
  assert.match(rows[0].text, /^✕ 1\.23% error$/);
  assert.equal(rows[1].fraction, 0);
  assert.equal(N.BAR_SCALE, 0.15);
  close(rows[4].fraction, share(N.shares(set("a", "readout", 0)), "readout").share / 0.15, 1e-12);
  close(rows[0].fraction, share(N.shares(set("a", "readout", 0)), "environment").share / 0.15, 1e-12);
  assert.ok(rows.every((r) => r.accent === "error"));
  const off = N.budgetRows(set("a", "readout", 0, { on: { readout: false } }));
  assert.equal(off[4].text, "off");
  assert.equal(off[4].fraction, 0);
  assert.match(off[0].text, /◆ largest/);
  assert.equal(rows.filter((r) => /largest/.test(r.text)).length, 1);
});

test("the words for the budget, a tune, and the percentages", () => {
  assert.match(N.budgetWords(set("a", "gate2", 0)), /^The two-qubit gate on Qubit A, at time 0: the sources that are on add up to 3\.32% error\. The largest is neighbours \(1\.60%\)\.$/);
  assert.match(N.budgetWords(set("b", "drive", 48)), /The largest is control/);
  assert.match(N.budgetWords(set("a", "drive", 0, { on: { environment: false, control: false, neighbours: false, leakage: false, readout: false } })), /no source is on, so there is no error\. Only the model can switch a source off/);
  const tn = N.tune(set("b", "drive", 40), 2100);
  assert.match(N.tuneWords(tn), /^Recalibrated at time 40\. The half-turn length found is .*replacing 6\./);
  assert.match(N.tuneWords(tn), /measurement, so it leaves a residual/);
  assert.equal(N.pctText(0), "0%");
  assert.equal(N.pctText(0.00004), "0%");
  assert.equal(N.pctText(0.0029), "0.29%");
  assert.equal(N.pctText(0.0051), "0.51%");
  assert.match(N.tuneWords({ time: 5, length: 6, previous: 6.5, made: 171, offsetDeg: -9 }), /9 degrees short of the 180/);
  assert.match(N.tuneWords({ time: 5, length: 6, previous: 6.5, made: 189, offsetDeg: 9 }), /9 degrees past the 180/);
  assert.match(N.tuneWords({ time: 5, length: 6, previous: 6, made: 180, offsetDeg: 0 }), /exactly on target/);
  assert.equal(N.pctText(0.0229), "2.29%");
  assert.equal(N.pctText(0.123), "12.3%");
});

test("the drift plot is an SVG string with a text alternative, a smooth line, a tick for each tune, and a dashed future", () => {
  const s = set("b", "drive", 20, { tunes: [{ time: 0, length: 6 }, { time: 12, length: 6.5 }] });
  const svg = N.driftSVG(s);
  assert.match(svg, /^<svg/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="The control error of the one-qubit signal on Qubit B/);
  assert.equal((svg.match(/qed-no__tune"/g) || []).length, 2);
  assert.equal((svg.match(/tuned/g) || []).length >= 2, true);
  assert.match(svg, /qed-no__error qed-no__error--future/);
  assert.match(svg, />now</);
  assert.doesNotMatch(N.driftSVG(set("b", "drive", 48)), /qed-no__error--future/);
  // the line sits at the exact control error at the checked times
  const pts = N.driftCurve(s);
  const top = Math.max(0.01, Math.max.apply(null, pts.map((p) => p.error)));
  const max = Math.ceil(top * 200) / 200;
  const past = svg.match(/<path class="qed-no__error" d="([^"]+)"/)[1];
  [0, 5, 11, 12, 20].forEach((t) => {
    const x = (52 + (t / 48) * 288).toFixed(1);
    const y = (190 - (pts[t].error / max) * 138).toFixed(1);
    assert.ok(past.includes(x + " " + y), "time " + t + " should be at " + x + " " + y);
  });
  assert.ok(new Set(past.split(" L").map((p) => p.split(" ")[1])).size > 8, "a line, not a flat run");
});

test("the tables are real tables built from the data", () => {
  const q = N.qubitsHTML();
  assert.match(q, /<table/);
  assert.match(q, /scope="row"/);
  assert.match(q, /Qubit A/);
  assert.match(q, /400 and 300/);
  assert.match(q, /\+0\.1%/);
  assert.match(q, /−0\.3%/);
  assert.match(q, /data-label="Leakage \(signal, gate\)"/);
  const s = N.sourcesHTML();
  assert.equal((s.match(/<tr>/g) || []).length, 6);
  assert.match(s, /crosstalk/);
  const r = N.remeasuredHTML();
  assert.equal((r.match(/<tr>/g) || []).length, 4);
  assert.match(r, /The half-turn length/);
  assert.match(r, /Coherence/);
});

test("inputs are left unchanged", () => {
  const s = deepFreeze(set("c", "gate2", 30, { on: { leakage: false }, tunes: [{ time: 0, length: 6 }, { time: 10, length: 5.5 }] }));
  const rows = N.shares(s);
  N.settingsOf(s);
  N.combine(rows);
  N.dominant(rows);
  N.tune(s, 1);
  N.measureFigure(s, 1);
  N.driftCurve(s);
  N.budgetRows(s);
  N.budgetWords(s);
  N.driftSVG(s);
  N.controlError("c", s.tunes, 30);
  assert.deepEqual(clone(s), { qubit: "c", operation: "gate2", time: 30, on: { leakage: false }, tunes: [{ time: 0, length: 6 }, { time: 10, length: 5.5 }] });
  N.dominant(deepFreeze(clone(rows)));
});
