// Tests for docs/assets/javascripts/transform.js (window.QedTransform): the targets as
// data and the three rewrites. The rules are proven against the state simulator, so the
// real QedTrace, QedGates, QedTwoQubit, QedQubit, and QedCircuit are loaded too, with
// QedProgramForms for the Bell circuit with ids.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["circuit.js", "gates.js", "twoqubit.js", "qubit.js", "trace.js", "program-forms.js", "transform.js"]);
const X = w.QedTransform;
const P = w.QedProgramForms;
const R = w.QedTrace;
const Q = w.QedQubit;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const target = (id) => X.targetById(id);
const h = (id, wire, col) => ({ id, type: "h", targets: [wire], col });
const g = (id, gateId, wire, col) => ({ id, type: "gate", gateId, label: gateId.toUpperCase(), targets: [wire], col });
const cx = (id, control, to, col) => ({ id, type: "cx", control, target: to, col });
const m = (id, wire, col) => ({ id, type: "measure", targets: [wire], col });
const circ = (ops) => ({ qubits: ["q0", "q1"], ops });
const ids = (c) => c.ops.map((op) => op.id);
const inputs = Q.PRESETS.map((p) => p.state);

// the same final state from every pair of starting states, up to a global phase
function sameFromEveryInput(a, b) {
  return inputs.every((s0) => inputs.every((s1) => R.sameState(a, b, [s0, s1])));
}

test("the targets are data: a name, a description, what they allow, and a synthetic flag", () => {
  assert.deepEqual(X.TARGETS.map((t) => t.id), ["open", "one-way", "rotations"]);
  X.TARGETS.forEach((t) => {
    assert.equal(t.synthetic, true);
    assert.ok(t.name && t.description);
    assert.ok(Array.isArray(t.allows.oneQubit) && Array.isArray(t.allows.twoQubit));
  });
  assert.deepEqual(target("open").allows.oneQubit, ["h", "x", "z"]);
  assert.equal(target("open").allows.twoQubit.length, 2);
  assert.deepEqual(target("one-way").allows.twoQubit, [{ control: 1, target: 0 }]);
  assert.deepEqual(target("rotations").allows.oneQubit, ["rx", "rz"]);
  assert.deepEqual(target("rotations").allows.twoQubit, [{ control: 0, target: 1 }]);
  assert.throws(() => X.targetById("nope"), /no target called nope/);
});

test("the Open target changes nothing, and says so by having no steps", () => {
  const bell = P.bell();
  const r = X.adapt(bell, target("open"));
  assert.deepEqual(r.steps, []);
  assert.deepEqual(r.circuit, bell);
  assert.notEqual(r.circuit, bell, "a copy, not the same object");
  assert.equal(r.ok, true);
  assert.deepEqual(X.changes(bell, r.circuit), { removed: [], added: [] });
});

test("the Bell circuit costs 2 operations on Open, goes 2 to 6 to 4 on One-way CNOT, and 4 on Rotations", () => {
  const bell = P.bell();
  const open = X.transform(bell, target("open")).costs;
  assert.deepEqual([open.original, open.adapted, open.optimized].map((c) => c.operations), [2, 2, 2]);
  const one = X.transform(bell, target("one-way")).costs;
  assert.deepEqual([one.original, one.adapted, one.optimized].map((c) => c.operations), [2, 6, 4]);
  assert.deepEqual([one.original, one.adapted, one.optimized].map((c) => c.twoQubit), [1, 1, 1]);
  const rot = X.transform(bell, target("rotations")).costs;
  assert.deepEqual([rot.original, rot.adapted, rot.optimized].map((c) => c.operations), [2, 4, 4]);
  [open, one, rot].forEach((c) => assert.deepEqual([c.original.measurements, c.adapted.measurements, c.optimized.measurements], [2, 2, 2]));
});

test("every adapted and optimized Bell circuit still prepares the Bell state, from every input", () => {
  const bell = P.bell();
  X.TARGETS.forEach((t) => {
    const r = X.transform(bell, t);
    assert.equal(sameFromEveryInput(bell, r.adapted), true, t.name + " adapted");
    assert.equal(sameFromEveryInput(bell, r.optimized), true, t.name + " optimized");
    assert.equal(R.run(r.optimized).final.name.kind, "bell", t.name);
  });
});

test("H as three turns equals H up to a global phase, but not exactly", () => {
  const before = circ([h("h1", 0, 0)]);
  const r = X.adapt(before, target("rotations"));
  assert.deepEqual(r.circuit.ops.map((op) => [op.gateId, op.angleDeg, op.targets[0]]), [["rz", 90, 0], ["rx", 90, 0], ["rz", 90, 0]]);
  assert.equal(sameFromEveryInput(before, r.circuit), true);
  const exact = inputs.every((s) => R.run(before, [s, s]).final.state.every((z, i) => {
    const o = R.run(r.circuit, [s, s]).final.state[i];
    return Math.abs(z.re - o.re) < 1e-9 && Math.abs(z.im - o.im) < 1e-9;
  }));
  assert.equal(exact, false, "the turns differ from H by a phase, which is why the check is up to a global phase");
});

test("a CNOT turned round is exactly the CNOT, for either direction and every input", () => {
  const forward = { id: "forward", name: "Forward", synthetic: true, description: "", allows: { oneQubit: ["h"], twoQubit: [{ control: 0, target: 1 }] } };
  [[0, 1, target("one-way")], [1, 0, forward]].forEach(([c, t, tg]) => {
    const before = circ([cx("c", c, t, 0)]);
    const r = X.adapt(before, tg);
    assert.equal(r.steps.length, 1);
    assert.equal(r.steps[0].rule, "cnot-turned-round");
    assert.equal(sameFromEveryInput(before, r.circuit), true, c + ">" + t);
    const exact = inputs.every((s0) => inputs.every((s1) => {
      const a = R.run(before, [s0, s1]).final.state;
      const b = R.run(r.circuit, [s0, s1]).final.state;
      return a.every((z, i) => Math.abs(z.re - b[i].re) < 1e-9 && Math.abs(z.im - b[i].im) < 1e-9);
    }));
    assert.equal(exact, true, "exact, not only up to a phase");
  });
});

test("a rewrite is applied only when the target needs it", () => {
  const onlyH = circ([h("h1", 0, 0)]);
  assert.deepEqual(X.adapt(onlyH, target("one-way")).steps, []);
  assert.deepEqual(X.adapt(circ([cx("c", 1, 0, 0)]), target("one-way")).steps, []);
  assert.deepEqual(X.adapt(circ([cx("c", 0, 1, 0)]), target("rotations")).steps, []);
  assert.equal(X.adapt(circ([cx("c", 0, 1, 0)]), target("one-way")).steps.length, 1);
});

test("a rewrite inside a rewrite is adapted too: a target with no H and one CNOT direction", () => {
  const strict = { id: "strict", name: "Strict", synthetic: true, description: "", allows: { oneQubit: ["rx", "rz"], twoQubit: [{ control: 1, target: 0 }] } };
  const bell = P.bell();
  const r = X.adapt(bell, strict);
  assert.equal(r.ok, true);
  assert.ok(r.circuit.ops.every((op) => op.type !== "h"), "no H is left");
  assert.equal(r.circuit.ops.filter((op) => op.type === "cx").every((op) => op.control === 1 && op.target === 0), true);
  assert.equal(sameFromEveryInput(bell, r.circuit), true);
});

test("a target that cannot run an op, and has no rewrite for it, is reported and the op is left as it was", () => {
  const noH = { id: "t", name: "T", synthetic: true, description: "", allows: { oneQubit: ["x"], twoQubit: [{ control: 0, target: 1 }] } };
  const r = X.adapt(circ([h("h1", 0, 0)]), noH);
  assert.equal(r.ok, false);
  assert.match(r.problems[0], /does not allow H on q₀/);
  assert.equal(r.circuit.ops.length, 1);
  const noCnot = { id: "t", name: "T", synthetic: true, description: "", allows: { oneQubit: ["h"], twoQubit: [] } };
  const r2 = X.adapt(circ([cx("c", 0, 1, 0)]), noCnot);
  assert.equal(r2.ok, false);
  assert.match(r2.problems[0], /no CNOT/);
});

test("every step names the limit that caused it, and says what it replaced", () => {
  const bell = P.bell();
  X.TARGETS.forEach((t) => {
    const r = X.transform(bell, t);
    r.adaptSteps.concat(r.optimizeSteps).forEach((s) => {
      assert.match(s.text, /, because /);
      assert.ok(s.rule);
      assert.ok(s.removed.length > 0);
    });
  });
  const one = X.adapt(bell, target("one-way")).steps[0];
  assert.equal(one.text, "Replaced CNOT q₀→q₁ with H on both qubits, CNOT q₁→q₀, then H on both qubits again, because this target allows a CNOT only from q₁ to q₀.");
  const rot = X.adapt(bell, target("rotations")).steps[0];
  assert.equal(rot.text, "Replaced H on q₀ with Rz(90°), Rx(90°) and Rz(90°), because this target has no H.");
  assert.deepEqual(one.removed, ["cx1"]);
  assert.deepEqual(one.added, ["cx1-1", "cx1-2", "cx1-3", "cx1-4", "cx1-5"]);
});

test("cancelling removes a pair of H on one qubit with nothing between them, and nothing else", () => {
  const before = circ([h("a", 0, 0), h("b", 0, 1), m("m0", 0, 2)]);
  const r = X.optimize(before);
  assert.deepEqual(ids(r.circuit), ["m0"]);
  assert.equal(r.steps.length, 1);
  assert.deepEqual(r.steps[0].removed, ["a", "b"]);
  assert.match(r.steps[0].text, /^Cancelled H on q₀ and H on q₀, because two H in a row on q₀ undo each other\.$/);
  assert.equal(sameFromEveryInput(before, r.circuit), true);
});

test("cancelling leaves a pair alone when something is between them on that qubit", () => {
  const between = circ([h("a", 0, 0), cx("c", 0, 1, 1), h("b", 0, 2)]);
  assert.deepEqual(ids(X.optimize(between).circuit), ["a", "c", "b"]);
  const other = circ([h("a", 0, 0), g("x", "x", 0, 1), h("b", 0, 2)]);
  assert.deepEqual(ids(X.optimize(other).circuit), ["a", "x", "b"]);
});

test("cancelling goes past ops on the other qubit, repeats, and keeps odd ones out", () => {
  const past = circ([h("a", 0, 0), g("y", "x", 1, 0), h("b", 0, 1)]);
  assert.deepEqual(ids(X.optimize(past).circuit), ["y"]);
  const four = circ([h("a", 0, 0), h("b", 0, 1), h("c", 0, 2), h("d", 0, 3)]);
  assert.deepEqual(ids(X.optimize(four).circuit), []);
  assert.equal(X.optimize(four).steps.length, 2);
  const three = circ([h("a", 0, 0), h("b", 0, 1), h("c", 0, 2)]);
  assert.deepEqual(ids(X.optimize(three).circuit), ["c"]);
  const nested = circ([h("a", 0, 0), g("x", "x", 0, 1), g("x2", "x", 0, 2), h("b", 0, 3)]);
  assert.deepEqual(ids(X.optimize(nested).circuit), [], "removing X X brings the two H together");
});

test("cancelling treats X, Z, and the same CNOT twice as pairs, but not turns, different gates, or measurements", () => {
  assert.deepEqual(ids(X.optimize(circ([g("a", "z", 1, 0), g("b", "z", 1, 1)])).circuit), []);
  assert.deepEqual(ids(X.optimize(circ([cx("a", 0, 1, 0), cx("b", 0, 1, 1)])).circuit), []);
  assert.match(X.optimize(circ([cx("a", 0, 1, 0), cx("b", 0, 1, 1)])).steps[0].text, /the same CNOT twice in a row/);
  assert.deepEqual(ids(X.optimize(circ([cx("a", 0, 1, 0), cx("b", 1, 0, 1)])).circuit), ["a", "b"], "opposite directions do not undo each other");
  const turns = circ([g("a", "rz", 0, 0), g("b", "rz", 0, 1)]);
  assert.deepEqual(ids(X.optimize(turns).circuit), ["a", "b"]);
  assert.deepEqual(ids(X.optimize(circ([g("a", "x", 0, 0), g("b", "z", 0, 1)])).circuit), ["a", "b"]);
  assert.deepEqual(ids(X.optimize(circ([m("a", 0, 0), m("b", 0, 1)])).circuit), ["a", "b"]);
  assert.deepEqual(ids(X.optimize(circ([h("a", 0, 0), h("b", 1, 1)])).circuit), ["a", "b"], "H on different qubits");
});

test("a circuit with nothing to cancel comes back as a copy with no steps", () => {
  const bell = P.bell();
  const r = X.optimize(bell);
  assert.deepEqual(r.steps, []);
  assert.deepEqual(r.circuit, bell);
  assert.notEqual(r.circuit, bell);
});

test("adapt, optimize, cost, changes, and transform never change what they are given", () => {
  const bell = deepFreeze(P.bell());
  X.TARGETS.forEach((t) => {
    deepFreeze(t);
    const r = X.transform(bell, t);
    X.cost(bell);
    X.changes(bell, r.adapted);
    X.optimize(r.adapted);
  });
  const pair = deepFreeze(circ([h("a", 0, 0), h("b", 0, 1)]));
  X.optimize(pair);
});

test("cost counts operations and two-qubit operations, and keeps measurements apart", () => {
  assert.deepEqual(X.cost(P.bell()), { operations: 2, twoQubit: 1, measurements: 2 });
  assert.deepEqual(X.cost(circ([])), { operations: 0, twoQubit: 0, measurements: 0 });
  assert.deepEqual(X.cost(circ([h("a", 0, 0), cx("c", 0, 1, 1), cx("d", 1, 0, 2), g("x", "x", 1, 3), m("m", 0, 4)])), { operations: 4, twoQubit: 2, measurements: 1 });
});

test("changes names the ids only in the original and only in the result", () => {
  const bell = P.bell();
  const one = X.transform(bell, target("one-way"));
  assert.deepEqual(one.changesAdapted.removed, ["cx1"]);
  assert.deepEqual(one.changesAdapted.added, ["cx1-1", "cx1-2", "cx1-3", "cx1-4", "cx1-5"]);
  assert.deepEqual(one.changesOptimized.removed.sort(), ["cx1", "h1"]);
  assert.deepEqual(one.changesOptimized.added, ["cx1-2", "cx1-3", "cx1-4", "cx1-5"]);
  const rot = X.transform(bell, target("rotations"));
  assert.deepEqual(rot.changesAdapted, { removed: ["h1"], added: ["h1-1", "h1-2", "h1-3"] });
});

test("the result keeps measurements last, in one column, and every op in a column of its own on a wire", () => {
  const bell = P.bell();
  X.TARGETS.forEach((t) => {
    const r = X.transform(bell, t);
    [r.adapted, r.optimized].forEach((c) => {
      assert.equal(w.QedCircuit.validate(c).ok, true, t.name);
      const last = Math.max(...c.ops.map((op) => op.col));
      c.ops.filter((op) => op.type === "measure").forEach((op) => assert.equal(op.col, last));
      assert.equal(c.ops.filter((op) => op.type === "measure").length, 2);
    });
  });
});

test("the original circuit is drawn the same as the result's shape, so the page can reuse the renderer", () => {
  const r = X.transform(P.bell(), target("one-way"));
  const svg = w.QedCircuit.renderSVG(r.optimized, { highlight: r.changesOptimized.added, highlightLabels: { "cx1-2": "added" } });
  assert.match(svg, /<svg /);
  assert.equal((svg.match(/qed-circuit-highlight"/g) || []).length, 4);
  assert.match(svg, />added</);
  assert.equal(P.instructionList(r.optimized).length, 6);
});

test("a pair of CNOTs is not cancelled when something sits between them on either wire", () => {
  assert.deepEqual(ids(X.optimize(circ([cx("a", 0, 1, 0), h("x", 1, 1), cx("b", 0, 1, 2)])).circuit), ["a", "x", "b"]);
  assert.deepEqual(ids(X.optimize(circ([cx("a", 0, 1, 0), h("x", 0, 1), cx("b", 0, 1, 2)])).circuit), ["a", "x", "b"]);
});

test("the result is packed into the earliest columns, and measurements share the last column", () => {
  const spread = circ([h("a", 0, 0), h("b", 0, 3), g("x", "x", 1, 6), m("m0", 0, 8), m("m1", 1, 9)]);
  const r = X.optimize(spread);
  assert.deepEqual(r.circuit.ops.map((op) => [op.id, op.col]), [["x", 0], ["m0", 1], ["m1", 1]]);
  const early = circ([h("h1", 0, 0), m("m0", 0, 1), m("m1", 1, 1)]);
  const rot = X.adapt(early, target("rotations")).circuit;
  assert.deepEqual(rot.ops.map((op) => [op.id, op.col]), [["h1-1", 0], ["h1-2", 1], ["h1-3", 2], ["m0", 3], ["m1", 3]]);
  const one = X.transform(P.bell(), target("one-way"));
  assert.deepEqual(one.optimized.ops.map((op) => [op.id, op.col]), [["cx1-2", 0], ["cx1-3", 1], ["cx1-4", 2], ["cx1-5", 2], ["m0", 3], ["m1", 3]]);
});
