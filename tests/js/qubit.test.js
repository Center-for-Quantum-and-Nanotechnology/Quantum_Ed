// Tests for docs/assets/javascripts/qubit.js (window.QedQubit).
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const Q = loadModule("qubit.js").QedQubit;

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const HALF = Math.SQRT1_2;

test("the 3-4-5 pair gives 36% and 64%", () => {
  const p = Q.probabilities(Q.real(0.6, 0.8));
  assert.ok(close(p[0], 0.36));
  assert.ok(close(p[1], 0.64));
  assert.ok(Q.isNormalized(Q.real(0.6, 0.8)));
});

test("every preset is a valid state whose probabilities add to 1", () => {
  assert.equal(Q.PRESETS.length, 4);
  Q.PRESETS.forEach((preset) => {
    assert.ok(Q.isNormalized(preset.state), preset.name);
    const p = Q.probabilities(preset.state);
    assert.ok(close(p[0] + p[1], 1), preset.name);
  });
});

test("preset probabilities are what the names promise", () => {
  const byId = Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));
  assert.deepEqual(Q.probabilities(byId.zero), [1, 0]);
  assert.deepEqual(Q.probabilities(byId.one), [0, 1]);
  [byId.plus, byId.minus].forEach((s) => {
    const p = Q.probabilities(s);
    assert.ok(close(p[0], 0.5) && close(p[1], 0.5));
  });
});

test("|+> and |-> have identical probabilities but different amplitudes", () => {
  const plus = Q.PRESETS.find((p) => p.id === "plus").state;
  const minus = Q.PRESETS.find((p) => p.id === "minus").state;
  assert.deepEqual(Q.probabilities(plus), Q.probabilities(minus));
  assert.notDeepEqual(plus, minus);
  assert.ok(close(Q.relativePhase(plus), 0));
  assert.ok(close(Q.relativePhase(minus), Math.PI));
});

test("an unnormalized state is reported with its total, not corrected", () => {
  const s = Q.real(0.6, 0.6);
  assert.ok(!Q.isNormalized(s));
  assert.ok(close(Q.norm2(s), 0.72));
  const v = Q.validity(s);
  assert.equal(v.valid, false);
  assert.equal(v.percent, 72);
  assert.match(v.text, /Not a valid state/);
  assert.match(v.text, /72%/);
  assert.equal(Q.validity(Q.real(0.6, 0.8)).valid, true);
  assert.match(Q.validity(Q.real(0.6, 0.8)).text, /^Valid state/);
});

test("normalize rescales to norm 1 and keeps the signs", () => {
  const n = Q.normalize(Q.real(3, -4));
  assert.ok(Q.isNormalized(n));
  assert.ok(close(n.alpha.re, 0.6));
  assert.ok(close(n.beta.re, -0.8));
});

test("normalize keeps the relative phase of a complex state", () => {
  const s = Q.complex(1, 1, 0, 2);
  const n = Q.normalize(s);
  assert.ok(Q.isNormalized(n));
  assert.ok(close(Q.relativePhase(n), Q.relativePhase(s)));
});

test("normalize refuses the zero state", () => {
  assert.throws(() => Q.normalize(Q.real(0, 0)), /zero state/);
});

test("normalize does not change its argument", () => {
  const s = Q.real(3, 4);
  Q.normalize(s);
  assert.deepEqual(s, Q.real(3, 4));
});

test("normalizing many arbitrary states always gives norm 1", () => {
  let x = 12345;
  const next = () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return (x / 2147483648) * 4 - 2;
  };
  for (let i = 0; i < 500; i++) {
    const s = Q.complex(next(), next(), next(), next());
    if (Q.norm2(s) < 1e-6) continue;
    assert.ok(Q.isNormalized(Q.normalize(s), 1e-9));
  }
});

test("a global phase changes no probability and not the relative phase", () => {
  const s = Q.normalize(Q.complex(0.5, 0.2, -0.3, 0.7));
  [0, 0.4, 1.3, Math.PI, -2.1].forEach((g) => {
    const t = Q.applyGlobalPhase(s, g);
    const ps = Q.probabilities(s);
    const pt = Q.probabilities(t);
    assert.ok(close(ps[0], pt[0]) && close(ps[1], pt[1]), `gamma ${g}`);
    assert.ok(close(Q.relativePhase(s), Q.relativePhase(t)), `gamma ${g}`);
    assert.ok(Q.isNormalized(t));
  });
});

test("a global phase of pi flips both signs", () => {
  const t = Q.applyGlobalPhase(Q.real(0.6, 0.8), Math.PI);
  assert.ok(close(t.alpha.re, -0.6) && close(t.beta.re, -0.8));
});

test("relative phase is the phase of beta measured from alpha", () => {
  assert.ok(close(Q.relativePhase(Q.complex(HALF, 0, 0, HALF)), Math.PI / 2));
  assert.ok(close(Q.relativePhase(Q.complex(0, HALF, 0, HALF)), 0));
  assert.ok(close(Q.relativePhase(Q.complex(0, 1, 1, 0)), -Math.PI / 2));
});

test("relative phase is undefined when either amplitude is zero", () => {
  assert.equal(Q.relativePhase(Q.real(1, 0)), null);
  assert.equal(Q.relativePhase(Q.real(0, 1)), null);
});

test("fromPolar builds the expected amplitudes", () => {
  const s = Q.fromPolar(0.6, 0, 0.8, Math.PI / 2);
  assert.ok(close(s.alpha.re, 0.6) && close(s.alpha.im, 0));
  assert.ok(close(s.beta.re, 0, 1e-12) && close(s.beta.im, 0.8));
  assert.ok(close(Q.modulus(s.beta), 0.8));
  assert.ok(close(Q.phase(s.beta), Math.PI / 2));
  assert.equal(Q.phase(Q.complex(0, 0, 1, 0).alpha), null);
});

test("invalid input is rejected", () => {
  assert.throws(() => Q.real(NaN, 0));
  assert.throws(() => Q.real(Infinity, 0));
  assert.throws(() => Q.real("0.6", 0));
  assert.throws(() => Q.complex(0, 0, 0, NaN));
  assert.throws(() => Q.fromPolar(-1, 0, 0, 0), /negative/);
  assert.throws(() => Q.applyGlobalPhase(Q.real(1, 0), NaN));
});

test("format writes real states the way the page shows them", () => {
  assert.equal(Q.format(Q.real(0.6, 0.8)), "0.60|0⟩ + 0.80|1⟩");
  assert.equal(Q.format(Q.real(0.6, -0.8)), "0.60|0⟩ − 0.80|1⟩");
  assert.equal(Q.format(Q.real(-0.6, 0.8)), "−0.60|0⟩ + 0.80|1⟩");
  assert.equal(Q.format(Q.PRESETS.find((p) => p.id === "minus").state), "0.71|0⟩ − 0.71|1⟩");
});

test("format never prints a negative zero", () => {
  assert.equal(Q.format(Q.real(1, -1e-9)), "1.00|0⟩ + 0.00|1⟩");
  assert.equal(Q.format(Q.real(-1e-9, 1)), "0.00|0⟩ + 1.00|1⟩");
});

test("format writes complex amplitudes in brackets", () => {
  assert.equal(Q.format(Q.complex(0.6, 0, 0, 0.8)), "0.60|0⟩ + (0.00 + 0.80i)|1⟩");
  assert.equal(Q.format(Q.complex(0.6, -0.2, -0.3, -0.4)), "(0.60 − 0.20i)|0⟩ + (−0.30 − 0.40i)|1⟩");
});

test("format honours the number of digits", () => {
  assert.equal(Q.format(Q.real(0.6, 0.8), 1), "0.6|0⟩ + 0.8|1⟩");
  assert.equal(Q.format(Q.real(0.6, 0.8), 3), "0.600|0⟩ + 0.800|1⟩");
});
