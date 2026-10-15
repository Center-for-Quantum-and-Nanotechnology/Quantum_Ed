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
