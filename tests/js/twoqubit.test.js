// Tests for docs/assets/javascripts/twoqubit.js (window.QedTwoQubit), with
// QedGates (the 2x2 and 4x4 matrices) and QedQubit (one-qubit states) used the way
// the 02.05 page uses them. The order is fixed: 00, 01, 10, 11, with q0 the left digit.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const T = loadModule("twoqubit.js").QedTwoQubit;
const G = loadModule("gates.js").QedGates;
const Q = loadModule("qubit.js").QedQubit;

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const HALF = Math.SQRT1_2;
const preset = (id) => Q.PRESETS.filter((p) => p.id === id)[0].state;
const ANGLES = [];
for (let t = 0; t <= 180; t += 45) for (let f = 0; f < 360; f += 90) ANGLES.push([t, f]);

const amps = (s) => s.map((z) => [z.re, z.im]);
const equalState = (a, b, tol = 1e-9) => a.every((z, i) => close(z.re, b[i].re, tol) && close(z.im, b[i].im, tol));
const BELL_AGREE = T.real(HALF, 0, 0, HALF);

test("the left digit is q0: product(|0>, |1>) is 01 and product(|1>, |0>) is 10", () => {
  assert.deepEqual(amps(T.product(preset("zero"), preset("one"))), [[0, 0], [1, 0], [0, 0], [0, 0]]);
  assert.deepEqual(amps(T.product(preset("one"), preset("zero"))), [[0, 0], [0, 0], [1, 0], [0, 0]]);
  assert.deepEqual(T.LABELS, ["00", "01", "10", "11"]);
});

test("product states are normalized, are products, and pass the product test", () => {
  ANGLES.forEach(([t1, f1]) => {
    ANGLES.forEach(([t2, f2]) => {
      const s = T.product(Q.fromBloch(t1, f1), Q.fromBloch(t2, f2));
      assert.ok(T.isNormalized(s, 1e-9), `${t1},${f1} ${t2},${f2}`);
      assert.ok(T.isProduct(s), `${t1},${f1} ${t2},${f2}`);
      assert.ok(T.passesProductTest(s), `${t1},${f1} ${t2},${f2}`);
    });
  });
});

test("the own probabilities of a product state are the two one-qubit probabilities", () => {
  ANGLES.forEach(([t1, f1]) => {
    ANGLES.forEach(([t2, f2]) => {
      const a = Q.fromBloch(t1, f1);
      const b = Q.fromBloch(t2, f2);
      const m = T.marginals(T.product(a, b));
      const pa = Q.probabilities(a);
      const pb = Q.probabilities(b);
      assert.ok(close(m.q0[0], pa[0]) && close(m.q0[1], pa[1]) && close(m.q1[0], pb[0]) && close(m.q1[1], pb[1]));
    });
  });
});

test("independent qubits multiply: the joint table is the product of the own probabilities", () => {
  const s = T.product(preset("plus"), preset("zero"));
  const p = T.probabilities(s);
  assert.ok(close(p[0], 0.5) && close(p[1], 0) && close(p[2], 0.5) && close(p[3], 0));
  const both = T.probabilities(T.product(preset("plus"), preset("plus")));
  both.forEach((x) => assert.ok(close(x, 0.25)));
  const t = T.independentTable(T.marginals(T.product(preset("plus"), preset("zero"))));
  t.forEach((x, i) => assert.ok(close(x, p[i])));
});

test("CNOT truth table on the four basis states: q0 is the control", () => {
  const basis = [
    [T.product(preset("zero"), preset("zero")), "00"],
    [T.product(preset("zero"), preset("one")), "01"],
    [T.product(preset("one"), preset("zero")), "10"],
    [T.product(preset("one"), preset("one")), "11"],
  ];
  const expected = { "00": "00", "01": "01", "10": "11", "11": "10" };
  basis.forEach(([s, name]) => {
    const out = T.probabilities(T.apply(G.CNOT, s));
    assert.equal(T.LABELS[out.findIndex((x) => close(x, 1))], expected[name], name);
  });
});

test("CNOT on a general state exchanges the amplitudes of 10 and 11 and leaves 00 and 01 alone", () => {
  const s = [{ re: 0.1, im: 0.2 }, { re: -0.3, im: 0.4 }, { re: 0.5, im: -0.6 }, { re: 0.7, im: 0.8 }];
  const out = T.apply(G.CNOT, s);
  assert.deepEqual(out[0], s[0]);
  assert.deepEqual(out[1], s[1]);
  assert.ok(close(out[2].re, s[3].re) && close(out[2].im, s[3].im));
  assert.ok(close(out[3].re, s[2].re) && close(out[3].im, s[2].im));
});

test("the CNOT matrix is the one in the order 00, 01, 10, 11", () => {
  const re = G.CNOT.matrix.map((row) => row.map((z) => z.re));
  assert.deepEqual(re, [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]]);
  G.CNOT.matrix.forEach((row) => row.forEach((z) => assert.equal(z.im, 0)));
  assert.equal(G.CNOT.control, 0);
  assert.equal(G.CNOT.target, 1);
});

test("H on q0 then CNOT turns 00 into the Bell state (|00> + |11>)/sqrt 2", () => {
  const start = T.product(preset("zero"), preset("zero"));
  const afterH = T.applyToQubit(G.gate("h"), 0, start);
  assert.ok(equalState(afterH, T.real(HALF, 0, HALF, 0)), "(|00> + |10>)/sqrt 2");
  const bell = T.apply(G.CNOT, afterH);
  assert.ok(equalState(bell, BELL_AGREE));
  assert.equal(T.bellOf(bell).id, "agree");
});

test("the Bell state: each qubit alone is 50/50, the product test fails, and it is not a product", () => {
  const m = T.marginals(BELL_AGREE);
  [m.q0, m.q1].forEach((own) => assert.ok(close(own[0], 0.5) && close(own[1], 0.5)));
  const would = T.independentTable(m);
  would.forEach((x) => assert.ok(close(x, 0.25)));
  assert.ok(!T.passesProductTest(BELL_AGREE));
  assert.ok(!T.isProduct(BELL_AGREE));
  assert.ok(close(T.separability(BELL_AGREE).modulus, 0.5));
});

test("|+> and |+> pass the product test and are a product; the Bell state is the contrast", () => {
  const s = T.product(preset("plus"), preset("plus"));
  assert.ok(T.passesProductTest(s));
  assert.ok(T.isProduct(s));
  assert.ok(close(T.separability(s).modulus, 0));
  const pBoth = T.probabilities(s);
  const pBell = T.probabilities(BELL_AGREE);
  assert.ok(!pBoth.every((x, i) => close(x, pBell[i])));
});

test("passing the product test does not prove independence: amplitudes 1/2, 1/2, 1/2, -1/2", () => {
  const s = T.real(0.5, 0.5, 0.5, -0.5);
  assert.ok(T.isNormalized(s));
  T.probabilities(s).forEach((x) => assert.ok(close(x, 0.25)));
  assert.ok(T.passesProductTest(s), "it passes the product test");
  assert.ok(!T.isProduct(s), "and is still not a product");
  assert.ok(close(T.separability(s).re, -0.5));
});

test("the transfer task: |0>|1>, H on q0, CNOT gives (|01> + |10>)/sqrt 2, with the outcomes always opposite", () => {
  const start = T.product(preset("zero"), preset("one"));
  const out = T.apply(G.CNOT, T.applyToQubit(G.gate("h"), 0, start));
  const p = T.probabilities(out);
  assert.ok(close(p[0], 0) && close(p[1], 0.5) && close(p[2], 0.5) && close(p[3], 0));
  assert.equal(T.bellOf(out).id, "opposite");
  assert.ok(!T.passesProductTest(out));
});

test("with |+> on the control and |-> in the target, CNOT changes the state but not one probability", () => {
  const s = T.product(preset("plus"), preset("minus"));
  const out = T.apply(G.CNOT, s);
  const expected = T.product(preset("minus"), preset("minus"));
  assert.ok(equalState(out, expected), "the minus sign moves over to the control");
  assert.ok(!equalState(out, s));
  const p0 = T.probabilities(s);
  const p1 = T.probabilities(out);
  p0.forEach((x, i) => assert.ok(close(x, 0.25) && close(p1[i], 0.25)));
});

test("applyToQubit agrees with the 4x4 matrix from kron, and q0 and q1 are not mixed up", () => {
  const I = G.gate("i").matrix;
  ["h", "x", "y", "z", "s"].forEach((id) => {
    const g = G.gate(id);
    ANGLES.forEach(([t1, f1]) => {
      const s = T.product(Q.fromBloch(t1, f1), Q.fromBloch(45, 30 + t1));
      assert.ok(equalState(T.applyToQubit(g, 0, s), T.apply(G.kron(g.matrix, I), s)), `${id} q0`);
      assert.ok(equalState(T.applyToQubit(g, 1, s), T.apply(G.kron(I, g.matrix), s)), `${id} q1`);
    });
  });
  const zeros = T.product(preset("zero"), preset("zero"));
  assert.ok(equalState(T.applyToQubit(G.gate("x"), 0, zeros), T.real(0, 0, 1, 0)), "X on q0 gives 10");
  assert.ok(equalState(T.applyToQubit(G.gate("x"), 1, zeros), T.real(0, 1, 0, 0)), "X on q1 gives 01");
});

test("a one-qubit gate on a qubit of a product state changes only that qubit", () => {
  const a = Q.fromBloch(70, 20);
  const b = Q.fromBloch(110, 200);
  const h = G.gate("h");
  const joint = T.applyToQubit(h, 0, T.product(a, b));
  assert.ok(equalState(joint, T.product(G.apply(h, a), b)));
});

test("two-qubit operations keep the state normalized", () => {
  ANGLES.forEach(([t1, f1]) => {
    const s = T.product(Q.fromBloch(t1, f1), Q.fromBloch(180 - t1, f1 + 40));
    [T.applyToQubit(G.gate("h"), 0, s), T.apply(G.CNOT, s), T.apply(G.CNOT, T.applyToQubit(G.gate("h"), 0, s))].forEach((out) => {
      assert.ok(T.isNormalized(out, 1e-9));
    });
  });
});

test("CNOT twice is the identity, and the Bell state undoes back to |00>", () => {
  ANGLES.forEach(([t, f]) => {
    const s = T.product(Q.fromBloch(t, f), Q.fromBloch(f > 180 ? 30 : 100, t));
    assert.ok(equalState(T.apply(G.CNOT, T.apply(G.CNOT, s)), s), `${t},${f}`);
  });
  const back = T.applyToQubit(G.gate("h"), 0, T.apply(G.CNOT, BELL_AGREE));
  assert.ok(equalState(back, T.real(1, 0, 0, 0)));
});

test("marginals add to 1 for every normalized state", () => {
  [BELL_AGREE, T.real(0.5, 0.5, 0.5, -0.5), T.product(Q.fromBloch(33, 70), Q.fromBloch(120, 10))].forEach((s) => {
    const m = T.marginals(s);
    assert.ok(close(m.q0[0] + m.q0[1], 1) && close(m.q1[0] + m.q1[1], 1));
  });
});

test("bellOf is null for other states and ignores a global phase", () => {
  assert.equal(T.bellOf(T.product(preset("plus"), preset("plus"))), null);
  assert.equal(T.bellOf(T.product(preset("zero"), preset("zero"))), null);
  assert.equal(T.bellOf(T.real(1, 1, 0, 0)), null, "not normalized");
  const phased = BELL_AGREE.map((z) => ({ re: -z.re, im: -z.im }));
  assert.equal(T.bellOf(phased).id, "agree");
  const rotated = BELL_AGREE.map((z) => ({ re: -z.im, im: z.re }));
  assert.equal(T.bellOf(rotated).id, "agree");
});

test("format writes only the terms that are not zero", () => {
  assert.equal(T.format(BELL_AGREE), "0.71|00⟩ + 0.71|11⟩");
  assert.equal(T.format(T.real(0.5, 0.5, 0.5, -0.5)), "0.50|00⟩ + 0.50|01⟩ + 0.50|10⟩ − 0.50|11⟩");
  assert.equal(T.format(T.real(0, 0, 0, 0)), "0");
  assert.equal(T.format(T.product(preset("plus"), preset("zero"))), "0.71|00⟩ + 0.71|10⟩");
  assert.equal(T.format(T.product(preset("zero"), preset("plusI"))), "0.71|00⟩ + (0.00 + 0.71i)|01⟩");
});

test("describe gives the four joint probabilities in words", () => {
  assert.equal(
    T.describe(BELL_AGREE),
    "outcome 00 50 percent, outcome 01 0 percent, outcome 10 0 percent, outcome 11 50 percent."
  );
});

test("bad input is rejected", () => {
  assert.throws(() => T.applyToQubit(G.gate("h"), 2, BELL_AGREE), /qubit must be 0 or 1/);
  assert.throws(() => T.applyToQubit(G.CNOT, 0, BELL_AGREE), /2x2/);
  assert.throws(() => T.apply(G.gate("h"), BELL_AGREE), /4x4/);
  assert.throws(() => T.probabilities([{ re: 1, im: 0 }]), /four amplitudes/);
  assert.throws(() => T.real(1, 0, NaN, 0), /finite/);
});

test("all four Bell states are recognized, are entangled, and fail the product test", () => {
  assert.equal(T.BELL.length, 4);
  T.BELL.forEach((b) => {
    assert.equal(T.bellOf(b.state).id, b.id);
    assert.ok(T.isNormalized(b.state));
    assert.ok(!T.isProduct(b.state), b.id);
    assert.ok(!T.passesProductTest(b.state), b.id);
    const m = T.marginals(b.state);
    assert.ok(close(m.q0[0], 0.5) && close(m.q1[0], 0.5), b.id);
  });
  // the "agree" ones put all the probability on 00 and 11, the "opposite" ones on 01 and 10
  const agree = T.probabilities(T.BELL[2].state);
  assert.ok(close(agree[0], 0.5) && close(agree[3], 0.5));
  const opposite = T.probabilities(T.BELL[3].state);
  assert.ok(close(opposite[1], 0.5) && close(opposite[2], 0.5));
});

test("H then CNOT on |1> in q0 gives the Bell state with a minus sign, which the probabilities do not show", () => {
  const h = G.gate("h");
  const agreeMinus = T.apply(G.CNOT, T.applyToQubit(h, 0, T.product(preset("one"), preset("zero"))));
  assert.equal(T.bellOf(agreeMinus).id, "agreeMinus");
  const oppositeMinus = T.apply(G.CNOT, T.applyToQubit(h, 0, T.product(preset("one"), preset("one"))));
  assert.equal(T.bellOf(oppositeMinus).id, "oppositeMinus");
  const plain = T.apply(G.CNOT, T.applyToQubit(h, 0, T.product(preset("zero"), preset("zero"))));
  T.probabilities(plain).forEach((x, i) => assert.ok(close(x, T.probabilities(agreeMinus)[i])));
  assert.ok(!equalState(plain, agreeMinus));
});

test("|+> on the control and |+> in the target is left alone by CNOT, as X leaves |+> alone", () => {
  const s = T.product(preset("plus"), preset("plus"));
  assert.ok(equalState(T.apply(G.CNOT, s), s));
  assert.ok(T.isProduct(T.apply(G.CNOT, s)));
});

test("factor splits a product state back into its two one-qubit states, up to a global phase", () => {
  const overlap = (a, b) => {
    const ip = Q.innerProduct(a, b);
    return ip.re * ip.re + ip.im * ip.im;
  };
  ANGLES.forEach(([t1, f1]) => {
    ANGLES.forEach(([t2, f2]) => {
      const a = Q.fromBloch(t1, f1);
      const b = Q.fromBloch(t2, f2);
      const f = T.factor(T.product(a, b));
      assert.ok(f, `${t1},${f1} ${t2},${f2}`);
      assert.ok(close(overlap(f.q0, a), 1, 1e-9), `q0 ${t1},${f1}`);
      assert.ok(close(overlap(f.q1, b), 1, 1e-9), `q1 ${t2},${f2}`);
    });
  });
});

test("factor is null for an entangled state, and works when one amplitude row or column is zero", () => {
  assert.equal(T.factor(BELL_AGREE), null);
  assert.equal(T.factor(T.real(0.5, 0.5, 0.5, -0.5)), null);
  const basis = T.factor(T.real(0, 0, 0, 1));
  assert.ok(close(basis.q0.beta.re, 1) && close(basis.q1.beta.re, 1));
  const f = T.factor(T.real(0, 0, HALF, HALF));
  assert.ok(close(f.q0.beta.re, 1) && close(f.q1.alpha.re, HALF) && close(f.q1.beta.re, HALF));
});

// ---- measurement (02.07) ---------------------------------------------------------------

const frozen = (s) => { s.forEach((z) => Object.freeze(z)); return Object.freeze(s); };
const sumP = (s) => T.probabilities(s).reduce((a, b) => a + b, 0);
const PLUS_ZERO = () => T.product(preset("plus"), preset("zero")); // (|00> + |10>)/sqrt 2
const own = (s, wire) => T.marginals(s)[wire === 0 ? "q0" : "q1"];

test("measureQubit returns the probability of the outcome, which is the marginal", () => {
  ANGLES.forEach(([t1, f1]) => {
    ANGLES.forEach(([t2, f2]) => {
      const s = T.product(Q.fromBloch(t1, f1), Q.fromBloch(t2, f2));
      [0, 1].forEach((wire) => [0, 1].forEach((outcome) => {
        const p = own(s, wire)[outcome];
        if (p < 1e-6) return;
        assert.ok(close(T.measureQubit(s, wire, outcome).probability, p), `${t1},${f1} ${t2},${f2} q${wire}=${outcome}`);
      }));
    });
  });
});

test("the state after a measurement is normalized and has only the amplitudes that match the outcome", () => {
  const s = T.real(0.5, 0.5, 0.5, -0.5);
  [0, 1].forEach((wire) => [0, 1].forEach((outcome) => {
    const r = T.measureQubit(s, wire, outcome);
    assert.ok(close(sumP(r.state), 1));
    r.state.forEach((z, i) => {
      const digit = wire === 0 ? i >> 1 : i & 1;
      if (digit !== outcome) assert.deepEqual([z.re, z.im], [0, 0], `q${wire}=${outcome}, index ${i}`);
    });
  }));
});

test("measuring the same wire again gives the same outcome with probability 1", () => {
  const s = T.real(0.5, 0.5, 0.5, -0.5);
  [0, 1].forEach((wire) => [0, 1].forEach((outcome) => {
    const first = T.measureQubit(s, wire, outcome);
    const again = T.measureQubit(first.state, wire, outcome);
    assert.ok(close(again.probability, 1));
    assert.ok(equalState(again.state, first.state));
    assert.throws(() => T.measureQubit(first.state, wire, 1 - outcome), /probability is 0/);
  }));
});

test("on a product state, measuring q0 leaves q1 exactly as it was", () => {
  ANGLES.forEach(([t1, f1]) => {
    ANGLES.forEach(([t2, f2]) => {
      const a = Q.fromBloch(t1, f1);
      const b = Q.fromBloch(t2, f2);
      const s = T.product(a, b);
      [0, 1].forEach((outcome) => {
        if (own(s, 0)[outcome] < 1e-6) return;
        const f = T.factor(T.measureQubit(s, 0, outcome).state);
        const ip = Q.innerProduct(f.q1, b);
        assert.ok(close(ip.re * ip.re + ip.im * ip.im, 1, 1e-9), `${t1},${f1} ${t2},${f2} q0=${outcome}`);
      });
    });
  });
});

test("on the Bell state, either wire first gives 00 or 11, and the other wire is then certain", () => {
  [0, 1].forEach((wire) => {
    [0, 1].forEach((outcome) => {
      const first = T.measureQubit(BELL_AGREE, wire, outcome);
      assert.ok(close(first.probability, 0.5));
      assert.ok(equalState(first.state, outcome === 0 ? T.real(1, 0, 0, 0) : T.real(0, 0, 0, 1)));
      const second = T.measureQubit(first.state, 1 - wire, outcome);
      assert.ok(close(second.probability, 1));
    });
  });
});

test("the joint distribution is the same whichever wire is measured first", () => {
  const states = [BELL_AGREE, T.real(0, HALF, HALF, 0), T.real(0.5, 0.5, 0.5, -0.5), PLUS_ZERO(), T.product(preset("plus"), preset("minus"))];
  states.forEach((s) => {
    const joint = (order) => {
      const out = [0, 0, 0, 0];
      [0, 1].forEach((x) => {
        if (own(s, order[0])[x] < 1e-12) return;
        const first = T.measureQubit(s, order[0], x);
        [0, 1].forEach((y) => {
          if (own(first.state, order[1])[y] < 1e-12) return;
          const second = T.measureQubit(first.state, order[1], y);
          const q0 = order[0] === 0 ? x : y;
          const q1 = order[0] === 0 ? y : x;
          out[q0 * 2 + q1] += first.probability * second.probability;
        });
      });
      return out;
    };
    const a = joint([0, 1]);
    const b = joint([1, 0]);
    const p = T.probabilities(s);
    a.forEach((x, i) => { assert.ok(close(x, p[i]), `q0 first, ${i}`); assert.ok(close(b[i], p[i]), `q1 first, ${i}`); });
  });
});

test("an outcome that cannot happen is refused with a reason, and bad arguments are refused", () => {
  assert.throws(() => T.measureQubit(T.real(1, 0, 0, 0), 0, 1), /q0 cannot give 1, because its probability is 0/);
  assert.throws(() => T.measureQubit(T.real(1, 0, 0, 0), 2, 0), /must be 0 or 1/);
  assert.throws(() => T.measureQubit(T.real(1, 0, 0, 0), 0, 2), /an outcome is 0 or 1/);
  assert.throws(() => T.measureQubit(T.real(1, 0, 0, 0).slice(0, 1), 0, 0), /four amplitudes/);
  assert.throws(() => T.measure(BELL_AGREE, [0, 0], () => 0.1), /two different wires/);
  assert.throws(() => T.measure(BELL_AGREE, [], () => 0.1), /one or two wires/);
  assert.throws(() => T.measure(BELL_AGREE, [0], 0.3), /random function/);
});

test("the random number at the edges of the range picks the expected outcome", () => {
  const s = T.product(Q.fromBloch(60, 0), preset("zero")); // P(q0 = 0) = cos^2(30 deg) = 0.75
  const p0 = own(s, 0)[0];
  assert.ok(close(p0, 0.75));
  assert.equal(T.measure(s, [0], () => 0).outcomes[0], 0);
  assert.equal(T.measure(s, [0], () => p0 - 1e-9).outcomes[0], 0);
  assert.equal(T.measure(s, [0], () => p0).outcomes[0], 1);
  assert.equal(T.measure(s, [0], () => 0.999999).outcomes[0], 1);
  // certain outcomes ignore the random number
  assert.equal(T.measure(T.real(1, 0, 0, 0), [0], () => 0.999999).outcomes[0], 0);
  assert.equal(T.measure(T.real(0, 0, 1, 0), [0], () => 0).outcomes[0], 1);
});

test("measure draws each wire in turn, reports both outcomes, and leaves unmeasured wires null", () => {
  const both = T.measure(BELL_AGREE, [0, 1], () => 0.7);
  assert.deepEqual(both.outcomes, [1, 1]);
  assert.equal(both.steps.length, 2);
  assert.ok(close(both.steps[0].probability, 0.5) && close(both.steps[1].probability, 1));
  assert.ok(equalState(both.state, T.real(0, 0, 0, 1)));
  const one = T.measure(BELL_AGREE, [1], () => 0.2);
  assert.deepEqual(one.outcomes, [null, 0]);
  const reversed = T.measure(BELL_AGREE, [1, 0], () => 0.7);
  assert.deepEqual(reversed.steps.map((x) => x.wire), [1, 0]);
  assert.deepEqual(reversed.outcomes, [1, 1]);
});

test("the same seed gives the same measurements, and the frequencies follow the probabilities", () => {
  const S = loadModule("shots.js").QedShots;
  const run = (seed) => {
    const random = S.rng(seed);
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 4000; i++) {
      const r = T.measure(BELL_AGREE, [0, 1], random);
      counts[r.outcomes[0] * 2 + r.outcomes[1]]++;
    }
    return counts;
  };
  assert.deepEqual(run(11), run(11));
  const c = run(11);
  assert.equal(c[1] + c[2], 0, "01 and 10 never happen");
  assert.ok(Math.abs(c[0] - 2000) < 200 && Math.abs(c[3] - 2000) < 200, String(c));
  const biased = T.product(Q.fromBloch(60, 0), preset("zero"));
  const random = S.rng(5);
  let zeros = 0;
  for (let i = 0; i < 4000; i++) if (T.measure(biased, [0], random).outcomes[0] === 0) zeros++;
  assert.ok(Math.abs(zeros / 4000 - 0.75) < 0.03, String(zeros));
});

test("a measurement never changes the state it is given", () => {
  const s = frozen(T.real(0.5, 0.5, 0.5, -0.5));
  const before = JSON.stringify(s);
  T.measureQubit(s, 0, 1);
  T.measure(s, [0, 1], () => 0.3);
  assert.equal(JSON.stringify(s), before);
});
