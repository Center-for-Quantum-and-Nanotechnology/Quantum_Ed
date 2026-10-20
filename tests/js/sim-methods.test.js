// Tests for docs/assets/javascripts/sim-methods.js (window.QedSimMethods): circuit families,
// a small state-vector engine, a small stabilizer-table engine, entanglement across cuts, and the
// size of what each method keeps. QedGates is called at run time, and QedTrace (with the modules
// it uses) is loaded to check the state-vector engine against the existing two-qubit simulator.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["circuit.js", "gates.js", "twoqubit.js", "qubit.js", "trace.js", "sim-methods.js"]);
const S = w.QedSimMethods;
const R = w.QedTrace;
const Q = w.QedQubit;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const H = (q) => ({ g: "h", q });
const X = (q) => ({ g: "x", q });
const Zg = (q) => ({ g: "z", q });
const Sg = (q) => ({ g: "s", q });
const T = (q) => ({ g: "t", q });
const CX = (c, t) => ({ g: "cx", c, t });
const circ = (n, ops) => ({ n, family: "ghz", depth: null, ops });
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const preset = (id) => Q.PRESETS.filter((p) => p.id === id)[0].state;

// the same operations as a QedTrace circuit (one operation per column)
function traceCircuit(ops) {
  return {
    qubits: ["q0", "q1"],
    ops: ops.map((op, col) => (op.g === "cx"
      ? { type: "cx", control: op.c, target: op.t, col }
      : { type: "gate", gateId: op.g, label: op.g.toUpperCase(), name: op.g.toUpperCase(), targets: [op.q], col })),
  };
}

test("the families build the operations the page describes, and the Bell circuit is the GHZ chain on two qubits", () => {
  assert.deepEqual(S.FAMILIES.map((f) => f.id), ["ghz", "ghz-t", "layers"]);
  assert.deepEqual(S.circuit("ghz", 2).ops, [H(0), CX(0, 1)]);
  assert.deepEqual(S.circuit("ghz", 4).ops, [H(0), CX(0, 1), CX(1, 2), CX(2, 3)]);
  assert.deepEqual(S.circuit("ghz-t", 3).ops, [H(0), CX(0, 1), CX(1, 2), T(0), T(1), T(2)]);
  assert.deepEqual(S.circuit("layers", 4, 1).ops, [H(0), T(0), H(1), T(1), H(2), T(2), H(3), T(3), CX(0, 1), CX(2, 3)]);
  // the second layer uses the odd neighbouring pairs
  const two = S.circuit("layers", 4, 2).ops.slice(10);
  assert.deepEqual(two.filter((o) => o.g === "cx"), [CX(1, 2)]);
  assert.equal(S.circuit("layers", 5, 2).ops.filter((o) => o.g === "cx").length, 2 + 2);
  assert.equal(S.circuit("layers", 4, 3).depth, 3);
  assert.equal(S.circuit("ghz", 4).depth, null);
  assert.equal(S.familyById("layers").usesDepth, true);
  assert.equal(S.familyById("ghz").usesDepth, false);
});

test("bad sizes, depths, and names are refused with a reason", () => {
  assert.throws(() => S.circuit("ghz", 1), /at least 2/);
  assert.throws(() => S.circuit("ghz", 2.5), /whole number/);
  assert.throws(() => S.circuit("layers", 4, 0), /depth/);
  assert.throws(() => S.circuit("nope", 4), /no circuit family called nope/);
  assert.throws(() => S.methodById("nope"), /no method called nope/);
  assert.throws(() => S.stateVector(S.circuit("ghz", 11)), /up to 10 qubits/);
  assert.throws(() => S.stateVector(S.circuit("ghz", 3), 8), /does not exist/);
  assert.throws(() => S.cutRank(S.stateVector(S.circuit("ghz", 3)), 3), /between two qubits/);
  assert.throws(() => S.stabilizes(S.stateVector(S.circuit("ghz", 3)), "+XX"), /one letter per qubit/);
});

test("the state-vector engine agrees with QedTrace on two-qubit circuits, from every basis state", () => {
  const circuits = [
    [H(0), CX(0, 1)],
    [H(1), CX(1, 0)],
    [X(0), T(0), CX(0, 1), Sg(1)],
    [H(0), T(0), H(0), CX(0, 1), Zg(1), H(1)],
    [Sg(0), H(0), CX(1, 0), T(1), H(1), CX(0, 1)],
    [],
  ];
  const zero = preset("zero");
  const one = preset("one");
  const starts = [[zero, zero, 0], [zero, one, 1], [one, zero, 2], [one, one, 3]];
  circuits.forEach((ops) => {
    starts.forEach(([a, b, index]) => {
      const mine = S.stateVector(circ(2, ops), index).amps;
      const theirs = R.run(traceCircuit(ops), [a, b]).final.state;
      mine.forEach((z, i) => {
        assert.ok(close(z.re, theirs[i].re, 1e-9) && close(z.im, theirs[i].im, 1e-9), JSON.stringify(ops) + " from " + index + " at " + i);
      });
    });
  });
});

test("the state-vector engine keeps q0 as the left digit and the state normalized", () => {
  const x0 = S.stateVector(circ(2, [X(0)])).amps;
  assert.deepEqual(x0.map((z) => z.re), [0, 0, 1, 0], "X on q0 gives |10>");
  const x1 = S.stateVector(circ(2, [X(1)])).amps;
  assert.deepEqual(x1.map((z) => z.re), [0, 1, 0, 0], "X on q1 gives |01>");
  const total = (st) => st.amps.reduce((s, z) => s + z.re * z.re + z.im * z.im, 0);
  [["ghz", 7], ["ghz-t", 9], ["layers", 6, 5], ["layers", 10, 8]].forEach(([f, n, d]) => assert.ok(close(total(S.stateVector(S.circuit(f, n, d))), 1, 1e-9), f + n));
  assert.equal(S.stateVector(S.circuit("ghz", 10)).amps.length, 1024);
});

test("the GHZ chain gives an equal mix of all-0 and all-1 for every size up to 10", () => {
  for (let n = 2; n <= 10; n++) {
    const a = S.stateVector(S.circuit("ghz", n)).amps;
    a.forEach((z, i) => {
      const want = i === 0 || i === a.length - 1 ? Math.SQRT1_2 : 0;
      assert.ok(close(z.re, want) && close(z.im, 0), "n = " + n + ", index " + i);
    });
  }
});

test("the Bell state three ways: four amplitudes, two rules, and a link of size 2", () => {
  const c = S.circuit("ghz", 2);
  const st = S.stateVector(c);
  assert.deepEqual(st.amps.map((z) => Math.round(z.re * 1000) / 1000), [0.707, 0, 0, 0.707]);
  const stab = S.stabilizer(c);
  assert.equal(stab.supported, true);
  assert.deepEqual(stab.rules, ["+XX", "+ZZ"]);
  assert.equal(S.maxCutRank(st).max, 2);
  assert.equal(S.cutRank(st, 1), 2);
});

test("the stabilizer engine's rules stabilize the state-vector engine's state, and commute with each other", () => {
  const cliffords = [
    [3, [H(0), CX(0, 1), CX(1, 2)]],
    [3, [X(0), H(1), Sg(1), CX(1, 2), Zg(0)]],
    [4, [H(0), Sg(0), CX(0, 1), H(2), CX(2, 3), CX(1, 2), X(3)]],
    [4, [H(0), H(1), H(2), H(3), Sg(0), Sg(1), CX(0, 2), CX(1, 3), H(0), Zg(2), Sg(3)]],
    [5, [X(1), H(2), CX(2, 3), Sg(3), H(3), CX(3, 4), Zg(4), CX(0, 4), H(0), Sg(0)]],
    [6, [H(0), CX(0, 1), CX(1, 2), CX(2, 3), CX(3, 4), CX(4, 5), Sg(2), H(5), X(0), Zg(3)]],
  ];
  let sawMinus = false;
  let sawY = false;
  cliffords.forEach(([n, ops]) => {
    const c = circ(n, ops);
    const st = S.stateVector(c);
    const stab = S.stabilizer(c);
    assert.equal(stab.supported, true);
    assert.equal(stab.rules.length, n);
    stab.rules.forEach((r) => {
      assert.equal(S.stabilizes(st, r), true, JSON.stringify(ops) + " rule " + r);
      if (r.charAt(0) === "−") sawMinus = true;
      if (r.indexOf("Y") >= 0) sawY = true;
    });
    const rows = stab.rows.slice(n);
    rows.forEach((a, i) => rows.forEach((b, j) => {
      let sym = 0;
      for (let q = 0; q < n; q++) sym += a.x[q] * b.z[q] + a.z[q] * b.x[q];
      assert.equal(sym % 2, 0, "rules " + i + " and " + j + " commute");
    }));
  });
  assert.ok(sawMinus && sawY, "the checks include a minus sign and a Y, so signs are exercised");
});

test("stabilizes tells a rule that holds from one that does not", () => {
  const bell = S.stateVector(S.circuit("ghz", 2));
  assert.equal(S.stabilizes(bell, "+XX"), true);
  assert.equal(S.stabilizes(bell, "+ZZ"), true);
  assert.equal(S.stabilizes(bell, "−XX"), false);
  assert.equal(S.stabilizes(bell, "+XZ"), false);
  assert.equal(S.stabilizes(bell, "+YY"), false);
  assert.equal(S.stabilizes(bell, "−YY"), true, "Y Y on the Bell state gives minus the state");
});

test("the stabilizer engine refuses operations outside its set, and names the first", () => {
  const r = S.stabilizer(S.circuit("ghz-t", 3));
  assert.equal(r.supported, false);
  assert.deepEqual(r.first, T(0));
  assert.equal(r.index, 3);
  assert.match(r.reason, /^T on q₀ is not one of the stabilizer method's operations \(H, S, X, Z, and CNOT\)\.$/);
  assert.equal(S.stabilizer(circ(2, [H(0), CX(0, 1), T(1), T(0)])).first.q, 1, "the first one it meets, not the last");
  assert.equal(S.stabilizerSupported(S.circuit("ghz", 8).ops), true);
  assert.equal(S.stabilizerSupported(S.circuit("ghz-t", 8).ops), false);
  assert.equal(S.stabilizerSupported(S.circuit("layers", 4, 1).ops), false);
  assert.equal(S.stabilizerSupported([H(0), Sg(1), X(0), Zg(1), CX(0, 1)]), true);
});

test("the GHZ chain and the GHZ chain with a T split into 2 pieces across every cut, for every size up to 10", () => {
  for (let n = 2; n <= 10; n++) {
    ["ghz", "ghz-t"].forEach((f) => {
      const r = S.maxCutRank(S.stateVector(S.circuit(f, n)));
      assert.equal(r.ranks.length, n - 1);
      assert.ok(r.ranks.every((k) => k === 2), f + " n = " + n + ": " + r.ranks);
      assert.equal(r.max, 2);
    });
  }
  assert.equal(S.maxCutRank(S.stateVector(circ(4, [X(0), H(2)]))).max, 1, "a product state is one piece across every cut");
});

test("the entangling layers' link size grows with depth, never beats its bound, and reaches it", () => {
  for (let n = 4; n <= 10; n++) {
    let last = 0;
    for (let d = 1; d <= 8; d++) {
      const got = S.maxCutRank(S.stateVector(S.circuit("layers", n, d))).max;
      const bound = S.linkBound("layers", n, d).chi;
      assert.ok(got <= bound, "n = " + n + ", depth " + d + ": " + got + " is within " + bound);
      assert.ok(got >= last, "n = " + n + ", depth " + d + " does not shrink");
      last = got;
    }
  }
  const at = (n, d) => S.maxCutRank(S.stateVector(S.circuit("layers", n, d))).max;
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8].map((d) => at(6, d)), [2, 2, 2, 4, 4, 4, 8, 8]);
  assert.equal(at(4, 4), S.linkBound("layers", 4, 4).chi, "reaches the cap this many qubits allow");
  assert.equal(at(10, 8) > at(10, 1), true);
});

test("the link-size bound: 2 for the GHZ families, and from the crossings and the cap for the layers", () => {
  assert.deepEqual(S.linkBound("ghz", 50), { chi: 2, exact: true, perCut: null });
  assert.equal(S.linkBound("ghz-t", 7).chi, 2);
  const b = S.linkBound("layers", 6, 3);
  assert.equal(b.exact, false);
  assert.deepEqual(b.perCut, [4, 2, 4, 2, 4].map((v, i) => Math.min(v, Math.pow(2, Math.min(i + 1, 6 - i - 1)))));
  assert.equal(S.linkBound("layers", 60, 8).chi, 16);
  assert.equal(S.linkBound("layers", 60, 1).chi, 2);
  assert.equal(S.linkBound("layers", 4, 8).chi, 4, "capped by 2 to the number of qubits on the smaller side");
});

test("sizes: the state vector keeps 2^n amplitudes at 16 bytes each, computed up to 10 and estimated beyond", () => {
  const at = (n) => S.sizes("state-vector", "ghz", n);
  assert.deepEqual([at(2).size.count, at(5).size.count, at(10).size.count], [4, 32, 1024]);
  assert.equal(at(10).size.tag, "computed");
  assert.equal(at(11).size.tag, "estimated");
  assert.equal(at(11).size.count, 2048);
  assert.equal(at(60).size.count, Math.pow(2, 60));
  assert.equal(at(10).size.bytes, 1024 * 16);
  assert.equal(at(60).size.bytes, Math.pow(2, 60) * 16);
  assert.equal(S.BYTES_PER_AMPLITUDE, 16);
  assert.equal(at(10).size.unit, "amplitudes");
  assert.equal(at(3).supported, true);
  assert.match(at(30).growth, /Doubles with each qubit: 30 qubits keep 2³⁰ amplitudes\./);
});

test("sizes: the stabilizer method keeps (2n)(2n+1) bits, and says when it cannot handle a circuit", () => {
  const at = (f, n, d) => S.sizes("stabilizer", f, n, d);
  assert.equal(at("ghz", 5).size.count, 10 * 11);
  assert.equal(at("ghz", 5).size.tag, "computed");
  assert.equal(at("ghz", 5).size.count, S.stabilizer(S.circuit("ghz", 5)).bits);
  assert.equal(at("ghz", 40).size.count, 80 * 81);
  assert.equal(at("ghz", 40).size.tag, "estimated");
  assert.equal(at("ghz", 40).supported, true);
  const t = at("ghz-t", 5);
  assert.equal(t.supported, false);
  assert.equal(t.size.count, null);
  assert.match(t.reason, /^T on q₀ is not one of the stabilizer method's operations/);
  assert.equal(t.growth, "Cannot handle this circuit.");
  const far = at("ghz-t", 40);
  assert.equal(far.supported, false);
  assert.equal(far.size.tag, "estimated");
  assert.equal(at("layers", 6, 2).supported, false);
});

test("sizes: the tensor-network method keeps about n x 2 x chi^2 numbers, with chi computed up to 10 and bounded beyond", () => {
  const at = (f, n, d) => S.sizes("tensor-network", f, n, d);
  const a = at("ghz", 8);
  assert.deepEqual([a.link.chi, a.link.tag, a.link.atMost, a.size.count, a.size.tag], [2, "computed", false, 8 * 2 * 4, "computed"]);
  const b = at("layers", 10, 6);
  assert.equal(b.link.chi, S.maxCutRank(S.stateVector(S.circuit("layers", 10, 6))).max);
  assert.equal(b.size.count, 10 * 2 * b.link.chi * b.link.chi);
  const far = at("layers", 60, 6);
  assert.deepEqual([far.link.tag, far.link.atMost, far.link.chi, far.size.tag], ["estimated", true, S.linkBound("layers", 60, 6).chi, "estimated"]);
  assert.equal(far.size.count, 60 * 2 * far.link.chi * far.link.chi);
  const ghzFar = at("ghz-t", 60);
  assert.deepEqual([ghzFar.link.chi, ghzFar.link.atMost, ghzFar.size.count], [2, false, 60 * 2 * 4]);
  assert.match(a.growth, /Link size 2, so it stays small/);
  assert.match(far.growth, /Link size at most/);
  assert.equal(at("ghz", 3).supported, true);
});

test("no method wins everywhere: the three families favour different methods", () => {
  const n = 30;
  const ghz = S.compare("ghz", n);
  const ghzT = S.compare("ghz-t", n);
  const layers = S.compare("layers", n, 8);
  const by = (r, id) => r.methods.filter((m) => m.id === id)[0];
  assert.equal(by(ghz, "stabilizer").supported, true);
  assert.equal(by(ghzT, "stabilizer").supported, false);
  assert.equal(by(layers, "stabilizer").supported, false);
  assert.ok(by(ghz, "tensor-network").size.count < by(ghz, "state-vector").size.count);
  assert.equal(by(ghzT, "tensor-network").link.chi, 2);
  assert.ok(by(layers, "tensor-network").link.chi > by(ghz, "tensor-network").link.chi, "entanglement grows with the layers");
  assert.equal(by(layers, "state-vector").size.count, by(ghz, "state-vector").size.count, "the state vector does not care which circuit");
});

test("compare returns the three methods in order, each with the four answers and the circuit's own facts", () => {
  const r = S.compare("ghz-t", 4);
  assert.deepEqual(r.methods.map((m) => m.id), ["state-vector", "stabilizer", "tensor-network"]);
  r.methods.forEach((m) => { assert.ok(m.keeps && m.handles && m.driver && m.returns && m.glyph && m.label); });
  assert.equal(r.ran, true);
  assert.equal(S.compare("ghz", 11).ran, false);
  assert.equal(r.circuit.allInStabilizerSet, false);
  assert.deepEqual(r.circuit.firstOutside, T(0));
  assert.equal(r.circuit.operations, 1 + 3 + 4);
  assert.match(r.circuit.description, /the first outside it is T on q₀/);
  assert.match(S.compare("ghz", 4).circuit.description, /Every operation is in the stabilizer method's set\./);
  assert.match(S.compare("layers", 4, 2).circuit.description, /depth 2/);
  assert.equal(S.compare("ghz", 4).circuit.firstOutside, null);
});

test("nothing labelled computed beyond the size the engines run, and nothing labelled estimated within it", () => {
  S.METHODS.forEach((m) => {
    S.FAMILIES.forEach((f) => {
      [2, 6, 10].forEach((n) => assert.equal(S.sizes(m.id, f.id, n, 3).size.tag, "computed", m.id + f.id + n));
      [11, 25, 60].forEach((n) => assert.equal(S.sizes(m.id, f.id, n, 3).size.tag, "estimated", m.id + f.id + n));
    });
  });
  assert.equal(S.MAX_RUN, 10);
});

test("no function changes what it is given", () => {
  const c = deepFreeze(S.circuit("layers", 6, 3));
  const g = deepFreeze(S.circuit("ghz", 5));
  const st = deepFreeze(S.stateVector(c));
  S.stateVector(c); S.stateVector(g, 3); S.stabilizer(g); S.stabilizer(c); S.describeCircuit(c);
  S.stabilizerSupported(c.ops); S.cutRank(st, 3); S.maxCutRank(st); S.stabilizes(st, "+XXXXXX");
  S.amplitudeTableHTML(st); S.chainSVG(6, 4); S.rulesHTML(["+XX"]);
  assert.equal(c.ops.length, S.circuit("layers", 6, 3).ops.length);
});

test("amplitudeTableHTML shows each outcome with q0 as the left digit, its amplitude, and its chance", () => {
  const html = S.amplitudeTableHTML(S.stateVector(S.circuit("ghz", 2)));
  assert.deepEqual([...html.matchAll(/<th scope="row">(\d+)<\/th>/g)].map((m) => m[1]), ["00", "01", "10", "11"]);
  assert.equal((html.match(/<td>0\.707<\/td>/g) || []).length, 2);
  assert.equal((html.match(/<td>0<\/td>/g) || []).length, 2);
  assert.equal((html.match(/50%/g) || []).length, 2);
  const three = S.amplitudeTableHTML(S.stateVector(S.circuit("ghz", 3)));
  assert.equal((three.match(/<tr>/g) || []).length, 9, "a header row and eight rows");
  const complex = S.amplitudeTableHTML(S.stateVector(circ(2, [H(0), T(0)])));
  assert.match(complex, /<td>0\.5 \+ 0\.5i<\/td>/);
});

test("rulesHTML lists each rule as code, and escapes", () => {
  const html = S.rulesHTML(["+XX", "+ZZ", "<b>"]);
  assert.equal((html.match(/<li><code>/g) || []).length, 3);
  assert.match(html, /<code>\+XX<\/code>/);
  assert.match(html, /&lt;b&gt;/);
});

test("chainSVG draws one piece per qubit with a labelled link between them, and shortens a long chain", () => {
  const two = S.chainSVG(2, 2, { idPrefix: "c1" });
  assert.equal((two.match(/qed-sm-piece/g) || []).length, 2);
  assert.equal((two.match(/qed-sm-link"/g) || []).length, 1);
  assert.match(two, /χ=2/);
  assert.match(two, /id="c1-svg"/);
  assert.match(two, /aria-label="A chain of 2 small pieces, one per qubit, joined by links of size 2"/);
  const five = S.chainSVG(5, 4);
  assert.equal((five.match(/qed-sm-piece/g) || []).length, 5);
  assert.equal((five.match(/qed-sm-link"/g) || []).length, 4);
  const long = S.chainSVG(40, 8);
  assert.equal((long.match(/qed-sm-piece/g) || []).length, 4);
  assert.match(long, /…/);
  assert.match(long, /q₃₈/);
  assert.match(long, /aria-label="A chain of 40 small pieces/);
  assert.throws(() => S.chainSVG(1, 2), /at least 2/);
});

test("every method record answers the four questions in words", () => {
  assert.deepEqual(S.METHODS.map((m) => m.id), ["state-vector", "stabilizer", "tensor-network"]);
  assert.match(S.methodById("state-vector").keeps, /Every amplitude/);
  assert.match(S.methodById("stabilizer").handles, /restricted set/);
  assert.match(S.methodById("tensor-network").driver, /entangled/);
  assert.equal(new Set(S.METHODS.map((m) => m.glyph)).size, 3, "each has its own glyph");
  assert.deepEqual(S.STABILIZER_SET, ["h", "s", "x", "z", "cx"]);
});

test("the stabilizer engine's rules hold on many fixed pseudo-random Clifford circuits, signs included", () => {
  // a small seeded generator, so the circuits are the same on every run
  let seed = 12345;
  const next = (k) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
  let checked = 0;
  for (let trial = 0; trial < 60; trial++) {
    const n = 2 + next(4);
    const ops = [];
    for (let i = 0; i < 18; i++) {
      const kind = next(5);
      if (kind === 4) {
        const c = next(n);
        const t = (c + 1 + next(n - 1)) % n;
        ops.push(CX(c, t));
      } else {
        ops.push([H, Sg, X, Zg][kind](next(n)));
      }
    }
    const c = circ(n, ops);
    const st = S.stateVector(c);
    const stab = S.stabilizer(c);
    stab.rules.forEach((r) => { assert.equal(S.stabilizes(st, r), true, "trial " + trial + ": " + JSON.stringify(ops) + " rule " + r); checked++; });
  }
  assert.ok(checked > 100, "checked " + checked + " rules");
});
