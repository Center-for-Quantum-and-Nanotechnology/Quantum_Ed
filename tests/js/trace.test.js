// Tests for docs/assets/javascripts/trace.js (window.QedTrace). It composes
// QedCircuit (the circuit as data), QedGates, QedTwoQubit, and QedQubit, so the real
// ones are loaded into one stub window.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["circuit.js", "gates.js", "twoqubit.js", "qubit.js", "trace.js"]);
const C = w.QedCircuit;
const G = w.QedGates;
const T = w.QedTwoQubit;
const Q = w.QedQubit;
const R = w.QedTrace;

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const HALF = Math.SQRT1_2;
const preset = (id) => Q.PRESETS.filter((p) => p.id === id)[0].state;
const equalState = (a, b, tol = 1e-9) => a.every((z, i) => close(z.re, b[i].re, tol) && close(z.im, b[i].im, tol));

const gate = (id, wire, col, extra) => Object.assign({ type: "gate", gateId: id, label: id.toUpperCase(), name: id.toUpperCase(), targets: [wire], col }, extra || {});
const cx = (control, col) => ({ type: "cx", control, target: 1 - control, col });
const measure = (wire, col) => ({ type: "measure", targets: [wire], col });
const build = (ops) => ({ qubits: ["q0", "q1"], maxColumns: 5, ops });

test("the Bell circuit traces to |00>, (|00> + |10>)/sqrt 2, then (|00> + |11>)/sqrt 2", () => {
  const t = R.run(build([gate("h", 0, 0), cx(0, 1)]));
  assert.equal(t.steps.length, 3);
  assert.ok(equalState(t.steps[0].state, T.real(1, 0, 0, 0)));
  assert.ok(equalState(t.steps[1].state, T.real(HALF, 0, HALF, 0)));
  assert.ok(equalState(t.steps[2].state, T.real(HALF, 0, 0, HALF)));
  assert.deepEqual(t.steps.map((s) => s.probabilities.map((x) => Math.round(x * 1000) / 1000)), [[1, 0, 0, 0], [0.5, 0, 0.5, 0], [0.5, 0, 0, 0.5]]);
  assert.equal(t.steps[2].name.kind, "bell");
  assert.equal(t.steps[2].name.bell, "agree");
  assert.equal(t.readout, false);
});

test("the labels say which step and what it did, and the start is labelled start", () => {
  const t = R.run(build([gate("h", 0, 0), cx(0, 1)]));
  assert.equal(t.steps[0].label, "start");
  assert.equal(t.steps[1].label, "after step 1: H on q₀");
  assert.equal(t.steps[2].label, "after step 2: CNOT with control q₀ and target q₁");
  assert.equal(t.steps[1].column, 0);
  assert.equal(t.steps[0].column, null);
});

test("X on q0 then CNOT from |00> gives certain 11", () => {
  const t = R.run(build([gate("x", 0, 0), cx(0, 1)]));
  assert.ok(equalState(t.final.state, T.real(0, 0, 0, 1)));
  assert.equal(t.final.name.q0, "|1⟩");
  assert.equal(t.final.name.q1, "|1⟩");
});

test("H, Z, H on one wire turns |0> into |1>, and the Z step changes the name but not the probabilities", () => {
  const t = R.run(build([gate("h", 0, 0), gate("z", 0, 1), gate("h", 0, 2)]));
  assert.equal(t.steps.length, 4);
  assert.equal(t.steps[1].name.q0, "|+⟩");
  assert.equal(t.steps[2].name.q0, "|−⟩");
  assert.equal(t.steps[3].name.q0, "|1⟩");
  const p1 = t.steps[1].probabilities;
  const p2 = t.steps[2].probabilities;
  p1.forEach((x, i) => assert.ok(close(x, p2[i])), "the probabilities look the same after H and after Z");
  assert.ok(close(t.final.probabilities[2], 1));
  assert.equal(t.steps[3].name.q1, "|0⟩");
});

test("the identities HZH = X and HXH = Z hold on both basis states, up to a global phase", () => {
  [["hzh", "x"], ["hxh", "z"]].forEach(([chain, single]) => {
    ["zero", "one"].forEach((start) => {
      const ops = chain.split("").map((id, i) => gate(id, 0, i));
      const longer = R.run(build(ops), [preset(start), preset("zero")]).final.state;
      const shorter = R.run(build([gate(single, 0, 0)]), [preset(start), preset("zero")]).final.state;
      const ip = T.probabilities(longer).every((x, i) => close(x, T.probabilities(shorter)[i]));
      assert.ok(ip, `${chain} against ${single} from ${start}`);
      assert.equal(T.bellOf(longer), null);
      // the same point: the overlap has modulus 1
      let re = 0;
      let im = 0;
      shorter.forEach((s, i) => { re += s.re * longer[i].re + s.im * longer[i].im; im += s.re * longer[i].im - s.im * longer[i].re; });
      assert.ok(close(re * re + im * im, 1), `${chain} against ${single} from ${start}`);
    });
  });
});

test("two gates in one column give the same state as the same two gates in either order", () => {
  const together = R.run(build([gate("h", 0, 0), gate("x", 1, 0)])).final.state;
  const hx = R.run(build([gate("h", 0, 0), gate("x", 1, 1)])).final.state;
  const xh = R.run(build([gate("x", 1, 0), gate("h", 0, 1)])).final.state;
  assert.ok(equalState(together, hx));
  assert.ok(equalState(together, xh));
  assert.equal(R.run(build([gate("h", 0, 0), gate("x", 1, 0)])).steps.length, 2, "one step for the shared column");
});

test("a CNOT with q1 as the control flips q0 when q1 is 1", () => {
  const t = R.run(build([gate("x", 1, 0), cx(1, 1)]));
  assert.ok(equalState(t.final.state, T.real(0, 0, 0, 1)), "01 becomes 11");
  const none = R.run(build([cx(1, 0)]));
  assert.ok(equalState(none.final.state, T.real(1, 0, 0, 0)), "q1 is 0, so nothing flips");
  // agrees with a swap around CNOT: SWAP * CNOT * SWAP
  const swap = [[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]].map((r) => r.map((x) => ({ re: x, im: 0 })));
  const sandwich = G.compose([{ matrix: swap }, G.CNOT, { matrix: swap }]).matrix;
  const rev = G.cnot(1).matrix;
  rev.forEach((row, i) => row.forEach((z, j) => assert.ok(close(z.re, sandwich[i][j].re, 1e-12) && close(z.im, sandwich[i][j].im, 1e-12))));
});

test("a measurement marks its wire and does not change the state; the final step is a readout", () => {
  const t = R.run(build([gate("h", 0, 0), cx(0, 1), measure(0, 2), measure(1, 2)]));
  assert.equal(t.steps.length, 4);
  assert.ok(equalState(t.steps[3].state, t.steps[2].state), "the state is not updated");
  assert.deepEqual(t.steps[2].measured, []);
  assert.deepEqual(t.steps[3].measured, [0, 1]);
  assert.equal(t.readout, true);
  assert.deepEqual(t.measuredWires, [0, 1]);
  assert.equal(t.steps[3].label, "after step 3: a measurement of both");
});

test("gates on the other wire after a measurement leave the same joint probabilities as measuring last", () => {
  const early = R.run(build([gate("h", 0, 0), measure(0, 1), gate("x", 1, 2)])).final.probabilities;
  const late = R.run(build([gate("h", 0, 0), gate("x", 1, 1), measure(0, 2)])).final.probabilities;
  early.forEach((x, i) => assert.ok(close(x, late[i])));
});

test("the trace follows the initial states", () => {
  const t = R.run(build([gate("x", 0, 0)]), [preset("one"), preset("one")]);
  assert.ok(equalState(t.steps[0].state, T.real(0, 0, 0, 1)));
  assert.ok(equalState(t.final.state, T.real(0, 1, 0, 0)), "X turns q0 from 1 to 0, leaving 01");
});

test("rotation ops run through QedGates.rotation with their angle", () => {
  const t = R.run(build([gate("ry", 0, 0, { angleDeg: 60, label: "Ry(60°)" })]));
  assert.ok(close(t.final.probabilities[2], 0.25), "outcome 1 on q0 is sin^2(30 degrees)");
  assert.ok(close(t.final.probabilities[0], 0.75));
});

test("the column matrix applied to the state equals the step the trace takes, and the order is H then CNOT", () => {
  const t = R.run(build([gate("h", 0, 0), cx(0, 1)]));
  t.steps.slice(1).forEach((s, i) => {
    assert.ok(equalState(T.apply({ matrix: s.matrix }, t.steps[i].state), s.state), `step ${i + 1}`);
    s.matrix.forEach((row) => assert.equal(row.length, 4));
  });
  // a matrix product reads right to left: CNOT times (H on q0) applied to |00>
  const HI = G.kron(G.gate("h").matrix, G.gate("i").matrix);
  const product = G.compose([{ matrix: HI }, G.CNOT]).matrix;
  assert.ok(equalState(T.apply({ matrix: product }, T.real(1, 0, 0, 0)), t.final.state));
  const wrongOrder = G.compose([G.CNOT, { matrix: HI }]).matrix;
  assert.ok(!equalState(T.apply({ matrix: wrongOrder }, T.real(1, 0, 0, 0)), t.final.state));
});

test("a trace agrees with applying the gates one at a time through QedTwoQubit", () => {
  const start = [Q.fromBloch(70, 30), Q.fromBloch(110, 200)];
  const ops = [gate("h", 0, 0), gate("s", 1, 0), cx(0, 1), gate("y", 1, 2), cx(1, 3)];
  const t = R.run(build(ops), start);
  let s = T.product(start[0], start[1]);
  s = T.applyToQubit(G.gate("s"), 1, T.applyToQubit(G.gate("h"), 0, s));
  s = T.apply(G.cnot(0), s);
  s = T.applyToQubit(G.gate("y"), 1, s);
  s = T.apply(G.cnot(1), s);
  assert.ok(equalState(t.final.state, s));
  assert.ok(T.isNormalized(t.final.state, 1e-9));
});

test("names: independent qubits are named, Bell states are named, other entangled states are not", () => {
  const product = R.run(build([gate("h", 0, 0)]));
  assert.equal(product.final.name.kind, "product");
  assert.equal(product.final.name.text, "q₀ in |+⟩ and q₁ in |0⟩");
  const unnamed = R.run(build([gate("ry", 0, 0, { angleDeg: 60 })]));
  assert.match(unnamed.final.name.text, /q₀ in a state with no name and q₁ in \|0⟩/);
  const minus = R.run(build([gate("x", 0, 0), gate("h", 0, 1), cx(0, 2)]));
  assert.equal(minus.final.name.kind, "bell");
  assert.equal(minus.final.name.bell, "agreeMinus");
  const other = R.run(build([gate("ry", 0, 0, { angleDeg: 60 }), cx(0, 1)]));
  assert.equal(other.final.name.kind, "entangled");
  assert.equal(other.final.name.text, "an entangled state");
});

test("an invalid circuit is refused with the rule that it breaks", () => {
  assert.throws(() => R.run(build([measure(0, 0), gate("h", 0, 1)])), /measurement must be the last thing on its wire/);
  assert.throws(() => R.run(build([gate("h", 0, 0), gate("x", 0, 0)])), /already has a gate/);
});

test("an empty circuit has only the start", () => {
  const t = R.run(build([]));
  assert.equal(t.steps.length, 1);
  assert.equal(t.final, t.steps[0]);
  assert.equal(t.readout, false);
});

test("it needs the modules it calls", () => {
  const { loadModule } = require("./load.js");
  const alone = loadModule("trace.js").QedTrace;
  assert.throws(() => alone.run({ qubits: ["q0", "q1"], ops: [] }), /needs QedGates/);
});

// ---- the Y-basis gate and the basis-change gates (02.07, Intermediate) -----------------------

test("sdg is S-dagger: it undoes S, and the draw label says so", () => {
  const g = R.gateOf({ type: "gate", gateId: "sdg" });
  assert.equal(g.label, "S†");
  const back = G.compose([G.gate("s"), g]);
  assert.ok(G.isUnitary(g));
  assert.ok(back.matrix.every((row, i) => row.every((z, j) => close(z.re, i === j ? 1 : 0) && close(z.im, 0))));
});

test("basisGates: Z needs none, X is H, and Y is S-dagger then H, in successive columns", () => {
  assert.deepEqual(R.basisGates("z", 0, 2), []);
  const x = R.basisGates("x", 0, 2);
  assert.deepEqual(x.map((o) => [o.gateId, o.col, o.targets[0]]), [["h", 2, 0]]);
  const y = R.basisGates("y", 1, 3);
  assert.deepEqual(y.map((o) => [o.gateId, o.col, o.targets[0], o.label]), [["sdg", 3, 1, "S†"], ["h", 4, 1, "H"]]);
  assert.throws(() => R.basisGates("w", 0, 0), /z, x, or y/);
});

test("a Z-basis readout after the basis-change gates reads out the X or Y basis", () => {
  // outcome 0 is the first state of the basis: |+> for X, |+i> for Y; outcome 1 the second
  const after = (state, basis) => {
    const t = R.run(build(R.basisGates(basis, 0, 0)), [state, preset("zero")]);
    const p = t.final.probabilities;
    return [p[0] + p[1], p[2] + p[3]];
  };
  const eq = (a, b) => a.every((x, i) => close(x, b[i], 1e-9));
  assert.ok(eq(after(preset("plus"), "x"), [1, 0]));
  assert.ok(eq(after(preset("minus"), "x"), [0, 1]));
  assert.ok(eq(after(preset("plusI"), "y"), [1, 0]));
  assert.ok(eq(after(preset("minusI"), "y"), [0, 1]));
  assert.ok(eq(after(preset("zero"), "x"), [0.5, 0.5]));
  assert.ok(eq(after(preset("zero"), "y"), [0.5, 0.5]));
  assert.ok(eq(after(preset("plus"), "y"), [0.5, 0.5]));
  assert.ok(eq(after(preset("plusI"), "x"), [0.5, 0.5]));
});
