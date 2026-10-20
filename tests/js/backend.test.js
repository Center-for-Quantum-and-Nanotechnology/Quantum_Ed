// Tests for docs/assets/javascripts/backend.js (window.QedBackend): backend descriptions,
// two synthetic calibration snapshots, change between them, and two policies. The module
// depends on nothing; QedTransform is loaded too only to check that its targets are
// accepted as they are.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["transform.js", "backend.js"]);
const B = w.QedBackend;
const X = w.QedTransform;
const D = B.DEVICE;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const best = (snap, policy) => B.choosePair(D, snap, policy).best.join("-");

test("every field in the catalog has an id, label, unit, scope, meaning, and a qualification", () => {
  assert.deepEqual(B.FIELDS.map((f) => f.id), ["frequency", "t1", "t2", "gate1q", "readout01", "readout10", "gate2q"]);
  B.FIELDS.forEach((f) => {
    assert.ok(f.label && f.unit && f.meaning && f.qualification, f.id);
    assert.ok(f.scope === "qubit" || f.scope === "pair", f.id);
    assert.ok(f.better === null || f.better === "higher" || f.better === "lower", f.id);
  });
  assert.deepEqual(B.FIELDS.map((f) => f.unit), ["GHz", "µs", "µs", "%", "%", "%", "%"]);
  assert.deepEqual(B.FIELDS.filter((f) => f.scope === "pair").map((f) => f.id), ["gate2q"]);
  assert.match(B.fieldById("t1").qualification, /not the chance that a circuit succeeds/);
  assert.match(B.fieldById("t2").qualification, /T2\* are not interchangeable/);
  assert.throws(() => B.fieldById("nope"), /no field called nope/);
  assert.match(B.CONTROL_SETTINGS.text, /Not reported here and not taught/);
});

test("the targets are synthetic, and the device has four qubits in a line with three connections", () => {
  assert.equal(B.SIMULATOR.synthetic, true);
  assert.equal(D.synthetic, true);
  assert.equal(B.SIMULATOR.snapshots, null);
  assert.equal(B.SIMULATOR.kind, "simulator");
  assert.equal(D.kind, "device");
  assert.deepEqual(D.qubits, ["Q0", "Q1", "Q2", "Q3"]);
  assert.deepEqual(D.pairs, [[0, 1], [1, 2], [2, 3]]);
  assert.deepEqual(D.allows.oneQubit, ["rx", "rz"]);
  assert.deepEqual(D.allows.twoQubit, [{ control: 0, target: 1 }, { control: 1, target: 2 }, { control: 2, target: 3 }]);
  assert.deepEqual(D.snapshotIds, ["earlier", "later"]);
  assert.equal(B.SIMULATOR.limit.includes("classical computer"), true);
  assert.ok(!/\d/.test(B.SIMULATOR.limit), "no number for the simulator's limit");
});

test("every snapshot is labelled with a time, a status, and a way it was estimated", () => {
  D.snapshotIds.forEach((id) => {
    const r = B.report(D, id);
    assert.equal(r.snapshot.synthetic, true);
    assert.ok(r.snapshot.time && r.snapshot.statusText && r.snapshot.protocol, id);
    assert.equal(r.qubits.length, 4);
    assert.equal(r.pairs.length, 3);
    r.qubits.forEach((q) => assert.equal(q.rows.length, 6));
    r.pairs.forEach((p) => assert.equal(p.rows.length, 1));
  });
  assert.equal(B.report(D, "earlier").snapshot.time, "06:00");
  assert.equal(B.report(D, "later").snapshot.time, "18:00, same day");
  assert.equal(B.report(D, "earlier").snapshot.status, "complete");
  assert.equal(B.report(D, "later").snapshot.status, "partial");
  assert.throws(() => B.report(D, "never"), /no snapshot called never/);
});

test("designed property: every qubit differs from the others in each qubit field, in both snapshots", () => {
  D.snapshotIds.forEach((id) => {
    const r = B.report(D, id);
    B.FIELDS.filter((f) => f.scope === "qubit").forEach((f) => {
      const values = r.qubits.map((q) => q.rows.filter((x) => x.fieldId === f.id)[0].value).filter((x) => x !== null);
      assert.equal(new Set(values).size, values.length, f.id + " in " + id);
    });
  });
});

test("designed property: most values change a little, exactly one changes a lot, and some improve", () => {
  const ch = B.change(D, "earlier", "later");
  const comparable = ch.filter((c) => c.size !== "not reported");
  const large = comparable.filter((c) => c.size === "large");
  assert.equal(large.length, 1);
  assert.equal(large[0].fieldId, "t1");
  assert.equal(large[0].where, "Q2");
  assert.equal(large[0].effect, "worsened");
  assert.ok(comparable.filter((c) => c.size === "small" || c.size === "unchanged").length > comparable.length * 0.9);
  assert.ok(comparable.filter((c) => c.effect === "improved").length >= 3, "drift is not always for the worse");
  assert.ok(comparable.filter((c) => c.effect === "worsened").length >= 3);
  assert.ok(comparable.some((c) => c.size === "unchanged"));
  assert.equal(ch.length, 27);
});

test("designed property: one value is not reported in the later snapshot and is never filled in", () => {
  const missing = B.change(D, "earlier", "later").filter((c) => c.size === "not reported");
  assert.equal(missing.length, 1);
  assert.deepEqual([missing[0].fieldId, missing[0].where, missing[0].from === null, missing[0].to === null], ["t2", "Q2", false, true]);
  assert.equal(missing[0].effect, "n/a");
  const row = B.reportFor(D, "later", { qubit: 2 }).rows.filter((r) => r.fieldId === "t2")[0];
  assert.deepEqual([row.reported, row.value, row.text], [false, null, "not reported"]);
  assert.equal(B.report(D, "earlier").qubits.every((q) => q.rows.every((r) => r.reported)), true);
  assert.equal(B.report(D, "later").qubits.flatMap((q) => q.rows).filter((r) => !r.reported).length, 1);
});

test("designed property: the best pair changes under the first policy, and the policies disagree in the earlier snapshot", () => {
  assert.equal(best("earlier", "lowest-two-qubit"), "1-2");
  assert.equal(best("later", "lowest-two-qubit"), "0-1");
  assert.notEqual(best("earlier", "lowest-two-qubit"), best("later", "lowest-two-qubit"));
  assert.equal(best("earlier", "lowest-total"), "0-1");
  assert.notEqual(best("earlier", "lowest-two-qubit"), best("earlier", "lowest-total"));
});

test("choosePair ranks every pair, best first, with scores that follow the stated rule", () => {
  const a = B.choosePair(D, "earlier", "lowest-two-qubit");
  assert.deepEqual(a.ranking.map((r) => [r.key, r.score]), [["1-2", 0.78], ["0-1", 0.8], ["2-3", 1.1]]);
  assert.equal(a.tie, false);
  assert.deepEqual(a.unscored, []);
  const t = B.choosePair(D, "earlier", "lowest-total");
  // 0-1: 0.80 + mean(1.8, 2.4) + mean(1.0, 1.4) = 0.80 + 2.1 + 1.2
  assert.deepEqual(t.ranking.map((r) => [r.key, r.score]), [["0-1", 4.1], ["1-2", 4.78], ["2-3", 5.4]]);
  assert.match(t.policy.words, /average readout error/);
  assert.equal(B.POLICIES.length, 2);
  assert.throws(() => B.choosePair(D, "earlier", "nope"), /no policy called nope/);
  assert.throws(() => B.choosePair(D, "never", "lowest-total"), /no snapshot called never/);
});

test("a tie is reported as a tie", () => {
  const dev = clone(D);
  dev.snapshots.earlier.pairs["0-1"].gate2q.value = 0.78;
  const r = B.choosePair(dev, "earlier", "lowest-two-qubit");
  assert.equal(r.tie, true);
  assert.deepEqual(r.best, [0, 1]);
});

test("a policy never guesses a missing value: the pair is left unscored and what was missing is named", () => {
  const dev = clone(D);
  dev.snapshots.later.qubits[1].readout10.value = null;
  dev.snapshots.later.qubits[1].readout10.unc = null;
  const r = B.choosePair(dev, "later", "lowest-total");
  assert.deepEqual(r.ranking.map((x) => x.key), ["2-3"]);
  assert.deepEqual(r.unscored.map((x) => x.key), ["0-1", "1-2"]);
  assert.match(r.unscored[0].missing[0], /readout error for 1 read as 0 on Q1/);
  assert.deepEqual(r.best, [2, 3]);
  // the first policy does not read readout values, so it is unaffected
  assert.equal(B.choosePair(dev, "later", "lowest-two-qubit").unscored.length, 0);
  const none = clone(D);
  Object.keys(none.snapshots.later.pairs).forEach((k) => { none.snapshots.later.pairs[k].gate2q.value = null; });
  const r2 = B.choosePair(none, "later", "lowest-two-qubit");
  assert.equal(r2.best, null);
  assert.equal(r2.ranking.length, 0);
});

test("change classes: unchanged, small, large, improved, worsened, neither, and not reported in either direction", () => {
  const dev = clone(D);
  const e = dev.snapshots.earlier.qubits[0];
  const l = dev.snapshots.later.qubits[0];
  e.t1.value = 100; l.t1.value = 100;              // unchanged
  e.t2.value = 100; l.t2.value = 124;              // +24%: small, improved (higher is better)
  e.gate1q.value = 0.10; l.gate1q.value = 0.125;   // +25%: large, worsened (lower is better)
  e.readout01.value = 2.0; l.readout01.value = 1.5; // -25%: large, improved
  e.frequency.value = 5.0; l.frequency.value = 5.2; // small, and neither (no better direction)
  e.readout10.value = null;                        // not reported in the earlier snapshot
  const get = (id) => B.change(dev, "earlier", "later").filter((c) => c.fieldId === id && c.where === "Q0")[0];
  assert.deepEqual([get("t1").size, get("t1").effect, get("t1").direction], ["unchanged", "neither", "same"]);
  assert.deepEqual([get("t2").size, get("t2").effect], ["small", "improved"]);
  assert.deepEqual([get("gate1q").size, get("gate1q").effect], ["large", "worsened"]);
  assert.deepEqual([get("readout01").size, get("readout01").effect], ["large", "improved"]);
  assert.deepEqual([get("frequency").size, get("frequency").effect, get("frequency").direction], ["small", "neither", "higher"]);
  assert.deepEqual([get("readout10").size, get("readout10").effect], ["not reported", "n/a"]);
  assert.equal(B.LARGE, 0.25);
});

test("the change text names the value, the two numbers, the direction, the size, and the effect", () => {
  const t = B.change(D, "earlier", "later").filter((c) => c.fieldId === "t1" && c.where === "Q2")[0];
  assert.equal(t.text, "T1 (energy relaxation time) on Q2: 65 to 40 µs (lower, a large change, worsened).");
  const f = B.change(D, "earlier", "later").filter((c) => c.fieldId === "frequency" && c.where === "Q0")[0];
  assert.match(f.text, /\(about the same\)\.$/);
  const m = B.change(D, "earlier", "later").filter((c) => c.size === "not reported")[0];
  assert.match(m.text, /48 µs \(±3\) in earlier, not reported in later\./);
});

test("reported values show their unit and uncertainty, and the simulator reports nothing", () => {
  const rows = B.reportFor(D, "earlier", { qubit: 0 }).rows;
  assert.deepEqual(rows.map((r) => r.text), [
    "5.04 GHz", "78 µs (±4)", "54 µs (±3)", "0.09 % (±0.01)",
    "1.8 % (±0.2)", "2.4 % (±0.2)",
  ]);
  assert.equal(B.reportFor(D, "earlier", { pair: [1, 2] }).rows[0].text, "0.78 % (±0.08)");
  assert.equal(B.reportFor(D, "earlier", { pair: [1, 2] }).title, "Q1–Q2");
  assert.throws(() => B.reportFor(D, "earlier", { qubit: 9 }), /no qubit 9/);
  assert.throws(() => B.reportFor(D, "earlier", { pair: [0, 3] }), /no connection 0-3/);
  assert.throws(() => B.reportFor(D, "earlier", {}), /select a qubit or a connection/);
  assert.throws(() => B.report(B.SIMULATOR, "earlier"), /no snapshot called earlier/);
});

test("ageText says how much older one snapshot is", () => {
  assert.equal(B.ageText(D, "earlier", "later"), "12 hours older");
  const one = clone(D);
  one.snapshots.later.hours = 7;
  assert.equal(B.ageText(one, "earlier", "later"), "1 hour older");
});

test("capabilities describes a description in plain strings, and accepts QedTransform targets as they are", () => {
  const dev = B.capabilities(D);
  assert.deepEqual(dev.operations, ["turns about the x axis", "turns about the z axis"]);
  assert.deepEqual(dev.connections, ["CNOT from Q0 to Q1", "CNOT from Q1 to Q2", "CNOT from Q2 to Q3"]);
  assert.equal(dev.kind, "device");
  const sim = B.capabilities(B.SIMULATOR);
  assert.deepEqual(sim.connections, ["any qubit can be used with any other"]);
  assert.match(sim.limit, /classical computer/);
  const one = B.capabilities(X.targetById("one-way"), { names: ["q₀", "q₁"] });
  assert.deepEqual(one.operations, ["H", "X", "Z"]);
  assert.deepEqual(one.connections, ["CNOT from q₁ to q₀"]);
  const rot = B.capabilities(X.targetById("rotations"), { names: ["q₀", "q₁"] });
  assert.deepEqual(rot.operations, ["turns about the x axis", "turns about the z axis"]);
  assert.deepEqual(rot.connections, ["CNOT from q₀ to q₁"]);
});

test("the device on this page has the same native operations as the 05.03 Rotations target", () => {
  assert.deepEqual(D.allows.oneQubit, X.targetById("rotations").allows.oneQubit);
  assert.deepEqual(D.allows.twoQubit[0], X.targetById("rotations").allows.twoQubit[0]);
});

test("no function changes what it is given", () => {
  const dev = deepFreeze(clone(D));
  const sim = deepFreeze(clone(B.SIMULATOR));
  B.report(dev, "earlier"); B.reportFor(dev, "later", { qubit: 2 }); B.change(dev, "earlier", "later"); B.ageText(dev, "earlier", "later");
  B.POLICIES.forEach((p) => dev.snapshotIds.forEach((s) => B.choosePair(dev, s, p.id)));
  B.capabilities(dev); B.capabilities(sim);
  B.deviceSVG(dev, { selected: { qubit: 1 }, marks: [{ pair: [0, 1], label: "policy 1" }] });
  B.fieldTableHTML(B.reportFor(dev, "later", { qubit: 2 }).rows);
});

test("deviceSVG draws every qubit and connection as a button, and marks the selected item with text", () => {
  const svg = B.deviceSVG(D, { selected: { qubit: 2 }, idPrefix: "d1" });
  assert.equal((svg.match(/data-qubit="/g) || []).length, 4);
  assert.equal((svg.match(/data-pair="/g) || []).length, 3);
  assert.equal((svg.match(/role="button"/g) || []).length, 7);
  assert.equal((svg.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((svg.match(/>selected</g) || []).length, 1);
  assert.match(svg, /aria-label="Qubit Q2, selected"/);
  assert.match(svg, /id="d1-svg"/);
  const pair = B.deviceSVG(D, { selected: { pair: [1, 2] } });
  assert.match(pair, /aria-label="Connection Q1 to Q2, selected"/);
  assert.equal((pair.match(/>selected</g) || []).length, 1);
  const none = B.deviceSVG(D);
  assert.ok(!none.includes(">selected<"));
  assert.equal((none.match(/aria-pressed="true"/g) || []).length, 0);
});

test("deviceSVG marks chosen pairs with a text label, joins labels on the same pair, and can be non-interactive", () => {
  const svg = B.deviceSVG(D, { marks: [{ pair: [1, 2], label: "policy 1" }, { pair: [0, 1], label: "policy 2" }] });
  assert.equal((svg.match(/qed-bk-mark"/g) || []).length, 2);
  assert.match(svg, />policy 1</);
  assert.match(svg, />policy 2</);
  const joined = B.deviceSVG(D, { marks: [{ pair: [0, 1], label: "policy 1" }, { pair: [0, 1], label: "policy 2" }] });
  assert.equal((joined.match(/qed-bk-mark"/g) || []).length, 1);
  assert.match(joined, />policy 1 and policy 2</);
  const quiet = B.deviceSVG(D, { interactive: false, selected: { qubit: 1 } });
  assert.ok(!quiet.includes("role=\"button\""));
  assert.ok(!quiet.includes("data-qubit"));
  assert.match(B.deviceSVG(D, { marks: [{ pair: [0, 1], label: "<b>" }] }), /&lt;b&gt;/);
});

test("fieldTableHTML shows every row, and a missing value reads not reported", () => {
  const html = B.fieldTableHTML(B.reportFor(D, "later", { qubit: 2 }).rows);
  assert.equal((html.match(/<tr>/g) || []).length, 7, "a header row and six rows");
  assert.match(html, /<td class="is-missing">not reported<\/td>/);
  assert.match(html, /<th scope="row">T1 \(energy relaxation time\)<\/th><td>40 µs \(±6\)<\/td>/);
  assert.equal((html.match(/is-missing/g) || []).length, 1);
});

test("an uncertainty is shown only for a field that carries one", () => {
  const dev = clone(D);
  dev.snapshots.earlier.qubits[0].frequency.unc = 0.05;
  assert.equal(B.reportFor(dev, "earlier", { qubit: 0 }).rows[0].text, "5.04 GHz");
  assert.equal(B.reportFor(dev, "earlier", { qubit: 0 }).rows[1].text, "78 µs (±4)");
});
