// Tests for docs/assets/javascripts/program-forms.js (window.QedProgramForms): one
// computation as operations with ids, and the forms derived from it. QedCircuit is
// loaded too, since the diagram form is drawn by it and the two must agree.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["circuit.js", "program-forms.js"]);
const C = w.QedCircuit;
const P = w.QedProgramForms;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const ids = (list) => list.map((l) => l.id);
const bell = () => P.bell();

// small builders for other computations
const h = (id, wire, col) => ({ id, type: "h", targets: [wire], col });
const x = (id, wire, col) => ({ id, type: "gate", label: "X", targets: [wire], col });
const cx = (id, control, target, col) => ({ id, type: "cx", control, target, col });
const m = (id, wire, col) => ({ id, type: "measure", targets: [wire], col });
const circ = (ops, n = 2) => ({ qubits: Array.from({ length: n }, (_, i) => "q" + i), ops });

test("the Bell computation has the same operations and columns as QedCircuit.bell, with unique ids", () => {
  const a = bell();
  const b = C.bell();
  assert.deepEqual(a.qubits, b.qubits);
  assert.equal(a.ops.length, b.ops.length);
  a.ops.forEach((op, k) => {
    const { id, ...rest } = op;
    assert.deepEqual(rest, b.ops[k]);
    assert.equal(typeof id, "string");
  });
  assert.equal(new Set(ids(a.ops)).size, a.ops.length);
});

test("the instruction list is one line per operation, in the order software would take them", () => {
  const list = P.instructionList(bell());
  assert.deepEqual(list.map((l) => [l.line, l.id, l.text, l.step]), [
    [1, "h1", "H q₀", 1],
    [2, "cx1", "CNOT q₀, q₁", 2],
    [3, "m0", "MEASURE q₀", 3],
    [4, "m1", "MEASURE q₁", 3],
  ]);
});

test("the instruction list orders by column and then by the order given, whatever order the ops are stored in", () => {
  const shuffled = circ([m("m1", 1, 2), cx("cx1", 0, 1, 1), m("m0", 0, 2), h("h1", 0, 0)]);
  assert.deepEqual(ids(P.instructionList(shuffled)), ["h1", "cx1", "m1", "m0"], "within a column, the given order is kept");
  const noColumns = P.instructionList(circ([h("h1", 0), cx("cx1", 0, 1), m("m0", 0), m("m1", 1)]));
  assert.deepEqual(ids(noColumns), ["h1", "cx1", "m0", "m1"]);
  assert.deepEqual(noColumns.map((l) => l.step), [1, 2, 3, 4], "ops with no column take the next free one");
});

test("the dependencies of the Bell computation: H before CNOT, CNOT before both measurements, nothing between the measurements", () => {
  assert.deepEqual(P.dependencies(bell()), [
    { from: "h1", to: "cx1", wires: [0] },
    { from: "cx1", to: "m0", wires: [0] },
    { from: "cx1", to: "m1", wires: [1] },
  ]);
  assert.deepEqual(P.independentPairs(bell()), [["m0", "m1"]]);
  assert.deepEqual(P.levels(bell()), { h1: 0, cx1: 1, m0: 2, m1: 2 });
});

test("dependencies follow the qubits an operation uses: a shared pair of qubits is one edge, and different qubits are independent", () => {
  const twice = circ([cx("a", 0, 1, 0), cx("b", 0, 1, 1)]);
  assert.deepEqual(P.dependencies(twice), [{ from: "a", to: "b", wires: [0, 1] }]);
  const apart = circ([h("a", 0, 0), x("b", 1, 0)]);
  assert.deepEqual(P.dependencies(apart), []);
  assert.deepEqual(P.independentPairs(apart), [["a", "b"]]);
  const chain = circ([h("a", 0, 0), x("b", 0, 1), h("c", 0, 2)]);
  assert.deepEqual(P.dependencies(chain).map((d) => d.from + ">" + d.to), ["a>b", "b>c"]);
  assert.deepEqual(P.independentPairs(chain), [], "a chain has an order between every pair, even a to c through b");
  assert.deepEqual(P.levels(chain), { a: 0, b: 1, c: 2 });
});

test("an operation that waits on two others sits one level past the deeper of them", () => {
  // x on q1 takes two steps before the CNOT; h on q0 takes one
  const c = circ([h("h1", 0, 0), x("x1", 1, 0), x("x2", 1, 1), cx("cx1", 0, 1, 2)]);
  assert.equal(P.levels(c).cx1, 2);
  assert.deepEqual(P.mustFollow(c, "cx1").sort(), ["h1", "x2"]);
});

test("positions say where one operation sits in each form", () => {
  const p = P.positions(bell(), "cx1");
  assert.deepEqual(p, {
    id: "cx1", label: "CNOT, step 2", step: 2, wires: ["q₀", "q₁"], line: 2, level: 1,
    mustFollow: ["h1"], mustPrecede: ["m0", "m1"],
  });
  assert.deepEqual(P.positions(bell(), "h1").mustFollow, []);
  assert.deepEqual(P.positions(bell(), "m1").mustPrecede, []);
  assert.throws(() => P.positions(bell(), "nope"), /no operation with the id nope/);
});

test("the label of an operation matches the one QedCircuit draws when it highlights it", () => {
  const b = bell();
  b.ops.forEach((op) => {
    const svg = C.renderSVG(b, { highlight: [op.id] });
    assert.ok(svg.includes(">" + P.opLabel(op, b) + "</text>"), op.id + ": " + P.opLabel(op, b));
  });
  assert.deepEqual(b.ops.map((op) => P.opLabel(op, b)), ["H, step 1", "CNOT, step 2", "Measure q₀, step 3", "Measure q₁, step 3"]);
});

test("the correspondence sentence names the step, the line, and the ordering for the operation", () => {
  const t = P.correspondenceText(bell(), "cx1");
  assert.match(t, /^CNOT, step 2\. /);
  assert.match(t, /In the diagram: on q₀ and q₁, in step 2\./);
  assert.match(t, /In the list: line 2\./);
  assert.match(t, /it must come after H on q₀ and before measurement of q₀ and measurement of q₁\.$/);
  assert.match(P.correspondenceText(bell(), "h1"), /it can come first, and it must come before CNOT with control q₀ and target q₁\.$/);
  assert.match(P.correspondenceText(bell(), "m0"), /after CNOT with control q₀ and target q₁, and nothing has to come after it\.$/);
  assert.match(P.correspondenceText(circ([h("a", 0, 0)]), "a"), /it has no ordering constraints\./);
});

test("the dependency text is a plain sentence per dependency, then the pairs that can go either way", () => {
  assert.deepEqual(P.dependencyText(bell()), [
    "H on q₀ must come before CNOT with control q₀ and target q₁ (both use q₀).",
    "CNOT with control q₀ and target q₁ must come before measurement of q₀ (both use q₀).",
    "CNOT with control q₀ and target q₁ must come before measurement of q₁ (both use q₁).",
    "Measurement of q₀ and measurement of q₁ do not depend on each other: either can come first.",
  ]);
});

test("the source form is made-up pseudo-code, one line per operation after the qubit count", () => {
  assert.deepEqual(P.sourceFormLines(bell()), ["qubits = 2", "h(0)", "cnot(0, 1)", "measure(0)", "measure(1)"]);
  assert.deepEqual(P.sourceFormLines(circ([x("a", 1, 0)])), ["qubits = 2", "x(1)"]);
});

test("two layouts of the same operations are the same computation, however they are stored", () => {
  const original = bell();
  const otherIds = circ([h("a", 0, 0), cx("b", 0, 1, 1), m("c", 0, 2), m("d", 1, 2)]);
  const swapped = circ([h("h1", 0, 0), cx("cx1", 0, 1, 1), m("m1", 1, 2), m("m0", 0, 2)]);
  const apart = circ([h("h1", 0), cx("cx1", 0, 1), m("m0", 0), m("m1", 1)]);
  [otherIds, swapped, apart].forEach((other, k) => {
    assert.equal(P.sameComputation(original, other).same, true, "layout " + k);
    assert.equal(P.sameComputation(other, original).same, true, "layout " + k + " reversed");
  });
  assert.match(P.differenceText(original, swapped), /same computation/);
});

test("one altered operation makes a different computation, and the difference names where", () => {
  const original = bell();
  const wrongGate = circ([x("a", 0, 0), cx("b", 0, 1, 1), m("c", 0, 2), m("d", 1, 2)]);
  const flipped = circ([h("a", 0, 0), cx("b", 1, 0, 1), m("c", 0, 2), m("d", 1, 2)]);
  const missing = circ([h("a", 0, 0), cx("b", 0, 1, 1), m("c", 0, 2)]);
  const extra = circ([h("a", 0, 0), cx("b", 0, 1, 1), x("e", 1, 2), m("c", 0, 3), m("d", 1, 3)]);
  [wrongGate, flipped, missing, extra].forEach((other, k) => assert.equal(P.sameComputation(original, other).same, false, "variant " + k));
  assert.deepEqual(P.differences(original, wrongGate)[0], { wire: 0, position: 1, a: "H on q₀", b: "X on q₀" });
  assert.deepEqual(P.differences(original, missing), [{ wire: 1, position: 2, a: "measurement of q₁", b: null }]);
  assert.match(P.differenceText(original, wrongGate), /different computations\. On q₀, operation 1 is H on q₀ in one and X on q₀ in the other\./);
  assert.match(P.differenceText(original, missing), /operation 2 is measurement of q₁ in one and missing in the other/);
});

test("two different gates make a different computation, and a difference on each qubit is reported for each", () => {
  const withX = circ([h("a", 0, 0), x("b", 1, 0)]);
  const withZ = circ([h("a", 0, 0), { id: "c", type: "gate", label: "Z", targets: [1], col: 0 }]);
  assert.equal(P.sameComputation(withX, withZ).same, false);
  assert.deepEqual(P.differences(withX, withZ), [{ wire: 1, position: 1, a: "X on q₁", b: "Z on q₁" }]);
  const flipped = circ([h("a", 0, 0), cx("b", 1, 0, 1), m("c", 0, 2), m("d", 1, 2)]);
  const both = P.differences(bell(), flipped);
  assert.deepEqual(both.map((d) => d.wire), [0, 1], "a flipped CNOT differs on both qubits");
});

test("the same operations in a different required order are a different computation", () => {
  // H after the CNOT is not the Bell circuit, even though the operations are the same
  const reordered = circ([cx("b", 0, 1, 0), h("a", 0, 1), m("c", 0, 2), m("d", 1, 2)]);
  assert.equal(P.sameComputation(bell(), reordered).same, false);
  assert.equal(P.differences(bell(), reordered)[0].wire, 0);
});

test("a different number of qubits is a different computation", () => {
  const three = circ([h("a", 0, 0), cx("b", 0, 1, 1), m("c", 0, 2), m("d", 1, 2)], 3);
  assert.equal(P.sameComputation(bell(), three).same, false);
  assert.match(P.differenceText(bell(), three), /different number of qubits/);
});

test("withIds keeps ids that exist, gives the others one, and leaves its argument alone", () => {
  const frozen = deepFreeze(circ([{ type: "h", targets: [0], col: 0 }, { id: "keep", type: "measure", targets: [0], col: 1 }]));
  const out = P.withIds(frozen);
  assert.deepEqual(ids(out.ops), ["op1", "keep"]);
  assert.equal(frozen.ops[0].id, undefined);
  assert.equal(P.withIds(bell()).ops[1].id, "cx1");
});

test("nothing here changes the computation it is given", () => {
  const b = deepFreeze(bell());
  P.instructionList(b); P.dependencies(b); P.independentPairs(b); P.levels(b); P.positions(b, "cx1");
  P.dependencyText(b); P.correspondenceText(b, "m0"); P.sourceFormLines(b); P.sameComputation(b, bell());
  P.instructionListHTML(b, { selected: "h1" }); P.dependencyGraphSVG(b, { selected: "h1" }); P.dependencyTextHTML(b); P.sourceFormHTML(b);
});

test("the instruction list is drawn as one button per operation, and only the selected line carries a label", () => {
  const html = P.instructionListHTML(bell(), { selected: "cx1" });
  assert.equal((html.match(/<button /g) || []).length, 4);
  assert.deepEqual([...html.matchAll(/data-op="([^"]+)"/g)].map((m) => m[1]), ["h1", "cx1", "m0", "m1"]);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((html.match(/qed-forms__tag/g) || []).length, 1);
  assert.match(html, /<span class="qed-forms__tag">CNOT, step 2<\/span>/);
  assert.ok(!P.instructionListHTML(bell()).includes("qed-forms__tag"));
  assert.match(P.instructionListHTML(bell(), { ariaLabel: "A <list>" }), /aria-label="A &lt;list&gt;"/);
});

test("the dependency graph has a box per operation, an arrow per dependency, and a labelled button for each box", () => {
  const svg = P.dependencyGraphSVG(bell(), { selected: "cx1", idPrefix: "g1" });
  assert.equal((svg.match(/class="qed-forms-node( is-selected)?"/g) || []).length, 4);
  assert.equal((svg.match(/class="qed-forms-edge"/g) || []).length, 3);
  assert.equal((svg.match(/role="button" tabindex="0"/g) || []).length, 4);
  assert.match(svg, /id="g1-svg"/);
  assert.match(svg, /marker-end="url\(#g1-arrow\)"/);
  assert.match(svg, /aria-label="CNOT with control q₀ and target q₁, step 2, selected"/);
  assert.match(svg, /aria-label="H on q₀, step 1"/);
  assert.equal((svg.match(/aria-pressed="true"/g) || []).length, 1);
  assert.match(svg, /<text class="qed-forms-node-tag"[^>]*>CNOT, step 2<\/text>/);
  assert.ok(!P.dependencyGraphSVG(bell()).includes("qed-forms-node-tag"));
});

test("the dependency graph places boxes left to right by level, with independent boxes stacked", () => {
  const svg = P.dependencyGraphSVG(bell());
  const pos = (id) => {
    const g = svg.split('data-op="' + id + '"')[1];
    const r = /<rect x="([\d.]+)" y="([\d.]+)"/.exec(g);
    return { x: Number(r[1]), y: Number(r[2]) };
  };
  assert.ok(pos("h1").x < pos("cx1").x && pos("cx1").x < pos("m0").x);
  assert.equal(pos("m0").x, pos("m1").x);
  assert.ok(pos("m0").y < pos("m1").y);
});

test("the dependency graph and the text listing agree: every arrow has a sentence", () => {
  const b = bell();
  assert.equal((P.dependencyGraphSVG(b).match(/qed-forms-edge/g) || []).length, P.dependencies(b).length);
  assert.equal(P.dependencyText(b).filter((t) => t.includes("must come before")).length, P.dependencies(b).length);
  assert.equal((P.dependencyTextHTML(b).match(/<li>/g) || []).length, P.dependencyText(b).length);
});

test("drawn text is escaped", () => {
  const odd = circ([{ id: 'x"y', type: "gate", label: "<b>", targets: [0], col: 0 }]);
  const html = P.instructionListHTML(odd, { selected: 'x"y' }) + P.dependencyGraphSVG(odd, { selected: 'x"y' });
  assert.ok(!html.includes("<b>"));
  assert.ok(html.includes("&lt;b&gt;"));
  assert.ok(!html.includes('data-op="x"y"'));
  assert.match(P.sourceFormHTML(odd), /<pre class="qed-forms__source"/);
  assert.ok(!P.sourceFormHTML(circ([{ id: "a", type: "gate", label: "<i>", targets: [0], col: 0 }])).includes("<i>"));
});

test("with interactive: false the list and graph are plain text, with no buttons, ids, or selection", () => {
  const list = P.instructionListHTML(bell(), { interactive: false, selected: "cx1" });
  assert.ok(!list.includes("<button") && !list.includes("data-op") && !list.includes("aria-pressed") && !list.includes("qed-forms__tag"));
  assert.equal((list.match(/<li /g) || []).length, 4);
  assert.match(list, /<span class="qed-forms__op">CNOT q₀, q₁<\/span>/);
  const svg = P.dependencyGraphSVG(bell(), { interactive: false, selected: "cx1" });
  assert.ok(!svg.includes("role=\"button\"") && !svg.includes("tabindex") && !svg.includes("data-op") && !svg.includes("is-selected") && !svg.includes("qed-forms-node-tag"));
  assert.equal((svg.match(/class="qed-forms-node"/g) || []).length, 4);
  assert.equal((svg.match(/qed-forms-edge/g) || []).length, 3, "the arrows are still drawn");
  assert.ok(svg.includes("MEASURE q₁"), "the text is still there");
});
