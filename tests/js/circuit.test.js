// Tests for docs/assets/javascripts/circuit.js (window.QedCircuit).
// The Bell-state drawing is used by Module 05, so the generic gate box added for
// Module 02 must not change a single byte of it: the hashes below were recorded
// from the module before that addition.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { loadModule } = require("./load.js");

const C = loadModule("circuit.js").QedCircuit;
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

test("the Bell-state drawing is byte-identical to the one Module 05 was built with", () => {
  assert.equal(sha(C.renderSVG(C.bell())), "3745dba1385ba014446c134e1cb8914a57f84e0a8e91843557711d9b9d4b9311");
  assert.equal(
    sha(C.renderSVG(C.bell(), { idPrefix: "x", ariaLabel: 'A <b> & "c"' })),
    "32ece568fe445e5beead5163c5150331dbb1afd8c541944503e887d8557aec84"
  );
  assert.equal(
    sha(C.renderSVG({ qubits: ["q0"], ops: [{ type: "h", targets: [0] }] })),
    "8e16e1d41ac01bb8c236242a1753df220967b4c7810b31cbb8bb309dc7fb4bc5"
  );
  assert.equal(sha(C.describe(C.bell())), "774fbcf20386752f199bf7eccedafff2209846f9c25872ce1436f14b00efc7ce");
});

test("a generic gate op draws a labelled box and is described in words", () => {
  const circuit = { qubits: ["q0"], ops: [{ type: "gate", label: "Z", name: "Z", targets: [0] }] };
  const svg = C.renderSVG(circuit);
  assert.match(svg, />Z<\/text>/);
  assert.match(svg, /class="qed-circuit-gate-box"/);
  assert.equal(C.describe(circuit), "Circuit on 1 qubits: a Z gate on q₀.");
});

test("a long label gets a wider box and wider columns, and the label is escaped", () => {
  const short = C.renderSVG({ qubits: ["q0"], ops: [{ type: "gate", label: "X", targets: [0] }] });
  const long = C.renderSVG({ qubits: ["q0"], ops: [{ type: "gate", label: "Rx(60°)", targets: [0] }] });
  const width = (svg) => Number(/viewBox="0 0 (\d+)/.exec(svg)[1]);
  assert.ok(width(long) > width(short));
  const risky = C.renderSVG({ qubits: ["q0"], ops: [{ type: "gate", label: "<b>", targets: [0] }] });
  assert.ok(!risky.includes("<b>"));
  assert.match(risky, /&lt;b&gt;/);
});

test("the neutral option marks every gate box, and is off by default", () => {
  const circuit = { qubits: ["q0"], ops: [{ type: "h", targets: [0] }, { type: "gate", label: "Z", targets: [0] }] };
  assert.ok(!C.renderSVG(circuit).includes("--neutral"));
  const neutral = C.renderSVG(circuit, { neutral: true });
  assert.equal((neutral.match(/qed-circuit-gate-box--neutral/g) || []).length, 2);
});

test("several gates in a row take successive columns", () => {
  const ops = ["H", "Z", "H"].map((label) => ({ type: "gate", label, targets: [0] }));
  const svg = C.renderSVG({ qubits: ["q0"], ops });
  const xs = [...svg.matchAll(/<text class="qed-circuit-label" x="([\d.]+)" y="\d+" text-anchor="middle">/g)].map((m) => Number(m[1]));
  assert.equal(xs.length, 3);
  assert.ok(xs[0] < xs[1] && xs[1] < xs[2]);
});

// ---- the circuit as editable data (the 02.06 builder) -----------------------------------

const gateOp = (id, wire, col, extra) => Object.assign({ type: "gate", gateId: id, label: id.toUpperCase(), name: id.toUpperCase(), targets: [wire], col }, extra || {});
const cxOp = (control, col) => ({ type: "cx", control, target: 1 - control, col });
const meterOp = (wire, col) => ({ type: "measure", targets: [wire], col });
const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const problemOf = (circuit, op) => {
  const r = C.place(circuit, op);
  assert.equal(r.ok, false);
  assert.equal(r.circuit, circuit, "a refused placement leaves the circuit as it was");
  return r.problem;
};

test("emptyCircuit has two wires, q0 on top, no ops, and room for five steps by default", () => {
  const c = C.emptyCircuit();
  assert.deepEqual(c.qubits, ["q0", "q1"]);
  assert.deepEqual(c.ops, []);
  assert.equal(c.maxColumns, 5);
  assert.equal(C.emptyCircuit(3).maxColumns, 3);
  assert.ok(C.validate(c).ok);
});

test("place and remove return new circuits and never change the one they are given", () => {
  const c = deepFreeze(C.emptyCircuit());
  const a = C.place(c, gateOp("h", 0, 0));
  assert.ok(a.ok);
  assert.notEqual(a.circuit, c);
  assert.equal(a.circuit.ops.length, 1);
  assert.equal(c.ops.length, 0);
  const frozen = deepFreeze(a.circuit);
  const b = C.remove(frozen, 0, 0);
  assert.equal(b.ops.length, 0);
  assert.equal(frozen.ops.length, 1);
  assert.equal(C.remove(frozen, 1, 3), frozen, "removing from an empty cell changes nothing");
  assert.equal(a.circuit.maxColumns, 5);
  assert.equal(b.maxColumns, 5);
});

test("a CNOT occupies both wires of its column, and removing either removes the whole CNOT", () => {
  let c = C.emptyCircuit();
  c = C.place(c, cxOp(0, 1)).circuit;
  assert.equal(C.opAt(c, 0, 1).type, "cx");
  assert.equal(C.opAt(c, 1, 1).type, "cx");
  assert.equal(C.opAt(c, 0, 0), null);
  assert.equal(C.remove(c, 1, 1).ops.length, 0);
});

test("rule: one operation per wire in a column", () => {
  const c = C.place(C.emptyCircuit(), gateOp("h", 0, 2)).circuit;
  assert.equal(problemOf(c, gateOp("x", 0, 2)), "q₀ already has a gate in step 3.");
  assert.ok(C.place(c, gateOp("x", 1, 2)).ok, "the other wire is free");
});

test("rule: a CNOT needs both wires in its column", () => {
  const c = C.place(C.emptyCircuit(), gateOp("x", 1, 1)).circuit;
  assert.equal(problemOf(c, cxOp(0, 1)), "A CNOT needs both wires in its column, and q₁ already has a gate in step 2.");
  const d = C.place(C.emptyCircuit(), cxOp(0, 1)).circuit;
  assert.equal(problemOf(d, gateOp("z", 1, 1)), "q₁ is already part of the CNOT in step 2.");
  assert.equal(problemOf(d, cxOp(1, 1)), "A CNOT needs both wires in its column, and q₁ already has a CNOT in step 2.");
});

test("rule: a CNOT's control and target are different wires", () => {
  const r = C.validate({ qubits: ["q0", "q1"], maxColumns: 5, ops: [{ type: "cx", control: 0, target: 0, col: 0 }] });
  assert.equal(r.ok, false);
  assert.equal(r.problems[0], "A CNOT's control and target must be different wires.");
});

test("rule: a measurement is the last thing on its wire", () => {
  const c = C.place(C.emptyCircuit(), meterOp(0, 1)).circuit;
  assert.equal(problemOf(c, gateOp("h", 0, 2)), "q₀ is measured in step 2, and a measurement must be the last thing on its wire.");
  assert.equal(problemOf(c, cxOp(0, 3)), "A CNOT cannot come after a measurement on a wire it uses (q₀ is measured in step 2).");
  assert.equal(problemOf(c, cxOp(1, 4)), "A CNOT cannot come after a measurement on a wire it uses (q₀ is measured in step 2).");
  assert.ok(C.place(c, gateOp("h", 1, 3)).ok, "the other wire may continue");
  const d = C.place(C.emptyCircuit(), gateOp("h", 0, 3)).circuit;
  assert.equal(problemOf(d, meterOp(0, 1)), "q₀ is measured in step 2, and a measurement must be the last thing on its wire.");
  assert.ok(C.place(d, meterOp(0, 4)).ok, "a measurement after the last gate is fine");
});

test("rule: the circuit has at most its number of steps", () => {
  const c = C.emptyCircuit();
  assert.equal(problemOf(c, gateOp("h", 0, 5)), "The circuit has 5 steps at most.");
  assert.ok(C.place(c, gateOp("h", 0, 4)).ok);
  assert.equal(problemOf(C.emptyCircuit(2), gateOp("h", 0, 2)), "The circuit has 2 steps at most.");
});

test("validate reports a bad wire and a missing step number", () => {
  assert.equal(C.validate({ qubits: ["q0", "q1"], ops: [{ type: "gate", gateId: "h", label: "H", targets: [2], col: 0 }] }).problems[0], "That wire does not exist.");
  assert.equal(C.validate({ qubits: ["q0", "q1"], ops: [{ type: "gate", gateId: "h", label: "H", targets: [0] }] }).problems[0], "Every operation needs a step number.");
});

test("columns groups ops by column, with empty columns as empty lists", () => {
  let c = C.emptyCircuit();
  c = C.place(c, gateOp("h", 0, 0)).circuit;
  c = C.place(c, gateOp("x", 1, 0)).circuit;
  c = C.place(c, cxOp(0, 2)).circuit;
  const cols = C.columns(c);
  assert.equal(cols.length, 3);
  assert.equal(cols[0].length, 2);
  assert.deepEqual(cols[1], []);
  assert.equal(cols[2][0].type, "cx");
  assert.deepEqual(C.columns(C.emptyCircuit()), []);
});

test("summarize writes the circuit as one plain line, step by step", () => {
  assert.equal(C.summarize(C.emptyCircuit()), "No gates yet.");
  let c = C.emptyCircuit();
  c = C.place(c, gateOp("h", 0, 0)).circuit;
  c = C.place(c, cxOp(0, 1)).circuit;
  assert.equal(C.summarize(c), "H on q₀, then CNOT with control q₀ and target q₁");
  c = C.place(c, meterOp(0, 2)).circuit;
  c = C.place(c, meterOp(1, 2)).circuit;
  assert.equal(C.summarize(c), "H on q₀, then CNOT with control q₀ and target q₁, then a measurement of both");
  const one = C.place(C.place(C.emptyCircuit(), gateOp("h", 0, 0)).circuit, gateOp("x", 1, 0)).circuit;
  assert.equal(C.summarize(one), "H on q₀ and X on q₁");
  const single = C.place(C.emptyCircuit(), meterOp(1, 0)).circuit;
  assert.equal(C.summarize(single), "a measurement of q₁");
});

test("a circuit built with the data layer draws, and the drawing matches the ops", () => {
  let c = C.emptyCircuit();
  c = C.place(c, gateOp("h", 0, 0)).circuit;
  c = C.place(c, cxOp(0, 1)).circuit;
  c = C.place(c, meterOp(0, 2)).circuit;
  const svg = C.renderSVG(c, { neutral: true });
  assert.match(svg, />H<\/text>/);
  assert.match(svg, /qed-circuit-target/);
  assert.match(svg, /qed-circuit-measure-box/);
  assert.match(svg, /qed-circuit-gate-box qed-circuit-gate-box--neutral/);
});

test("the data layer leaves the drawing of a circuit with no data-layer fields unchanged", () => {
  // the Bell drawing is pinned above; here the public names are all present too
  ["emptyCircuit", "opAt", "validate", "place", "remove", "columns", "summarize", "bell", "describe", "renderSVG", "qubitName"].forEach((name) => assert.equal(typeof C[name], "function", name));
});
