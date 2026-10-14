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
  assert.equal(Q.PRESETS.length, 6);
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

test("formatAmplitude writes a real number plainly and a complex number in brackets", () => {
  assert.equal(Q.formatAmplitude({ re: 0.6, im: 0 }), "0.60");
  assert.equal(Q.formatAmplitude({ re: -0.6, im: 0 }), "−0.60");
  assert.equal(Q.formatAmplitude({ re: 0.6, im: -0.2 }), "(0.60 − 0.20i)");
  assert.equal(Q.formatAmplitude({ re: -0.3, im: 0.4 }), "(−0.30 + 0.40i)");
  assert.equal(Q.formatAmplitude({ re: -1e-9, im: 0 }), "0.00");
  assert.equal(Q.formatAmplitude({ re: 0.6, im: 0 }, 1), "0.6");
});

const byId = () => Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));

test("the basis states are orthonormal", () => {
  const { zero, one } = byId();
  const ip = (a, b) => Q.innerProduct(a, b);
  assert.deepEqual(ip(zero, zero), { re: 1, im: 0 });
  assert.deepEqual(ip(one, one), { re: 1, im: 0 });
  assert.deepEqual(ip(zero, one), { re: 0, im: 0 });
  assert.deepEqual(ip(one, zero), { re: 0, im: 0 });
});

test("|+> and |-> are orthonormal too", () => {
  const { plus, minus } = byId();
  const pm = Q.innerProduct(plus, minus);
  assert.ok(close(pm.re, 0) && close(pm.im, 0));
  assert.ok(close(Q.innerProduct(plus, plus).re, 1));
  assert.ok(close(Q.innerProduct(minus, minus).re, 1));
});

test("<psi|psi> equals the norm, so a valid state has <psi|psi> = 1", () => {
  [Q.real(0.6, 0.8), Q.real(3, -4), Q.complex(0.5, 0.2, -0.3, 0.7), Q.PRESETS[2].state].forEach((s) => {
    const ip = Q.innerProduct(s, s);
    assert.ok(close(ip.re, Q.norm2(s)));
    assert.ok(close(ip.im, 0));
  });
  assert.ok(close(Q.innerProduct(Q.real(0.6, 0.8), Q.real(0.6, 0.8)).re, 1));
});

test("<0|psi> and <1|psi> read off the amplitudes", () => {
  const { zero, one } = byId();
  const s = Q.complex(0.5, 0.2, -0.3, 0.7);
  const a = Q.innerProduct(zero, s);
  const b = Q.innerProduct(one, s);
  assert.ok(close(a.re, 0.5) && close(a.im, 0.2));
  assert.ok(close(b.re, -0.3) && close(b.im, 0.7));
});

test("swapping the arguments conjugates the inner product", () => {
  const phi = Q.complex(0.5, 0.2, -0.3, 0.7);
  const psi = Q.complex(0.1, -0.4, 0.8, 0.25);
  const ab = Q.innerProduct(phi, psi);
  const ba = Q.innerProduct(psi, phi);
  assert.ok(close(ab.re, ba.re));
  assert.ok(close(ab.im, -ba.im));
});

test("the inner product conjugates the first argument only", () => {
  // <phi|psi> with phi = i|0> and psi = |0>: conj(i) * 1 = -i
  const phi = Q.complex(0, 1, 0, 0);
  const psi = Q.real(1, 0);
  const ip = Q.innerProduct(phi, psi);
  assert.ok(close(ip.re, 0) && close(ip.im, -1));
});

test("the inner product does not change its arguments", () => {
  const phi = Q.complex(0.5, 0.2, -0.3, 0.7);
  const psi = Q.real(0.6, 0.8);
  const phiCopy = JSON.parse(JSON.stringify(phi));
  const psiCopy = JSON.parse(JSON.stringify(psi));
  Q.innerProduct(phi, psi);
  assert.deepEqual(phi, phiCopy);
  assert.deepEqual(psi, psiCopy);
});

test("the presets are the four real states and the two complex equator states", () => {
  assert.deepEqual(Q.PRESETS.map((p) => p.id), ["zero", "one", "plus", "minus", "plusI", "minusI"]);
  assert.deepEqual(Q.PRESETS.map((p) => p.real), [true, true, true, true, false, false]);
  Q.PRESETS.forEach((p) => assert.equal(p.real, Q.isReal(p.state), p.name));
});

test("|+i> and |-i> are valid, 50/50, and a quarter turn from |+> on the equator", () => {
  const byId = Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));
  [byId.plusI, byId.minusI].forEach((s) => {
    assert.ok(Q.isNormalized(s));
    const p = Q.probabilities(s);
    assert.ok(close(p[0], 0.5) && close(p[1], 0.5));
  });
  assert.ok(close(Q.relativePhase(byId.plusI), Math.PI / 2));
  assert.ok(close(Q.relativePhase(byId.minusI), -Math.PI / 2));
});

test("the two equator pairs are each orthonormal, and the pairs are not orthogonal to each other", () => {
  const byId = Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));
  const ip = (a, b) => Q.innerProduct(byId[a], byId[b]);
  const z = ip("plusI", "minusI");
  assert.ok(close(z.re, 0) && close(z.im, 0));
  const pi = ip("plus", "plusI");
  assert.ok(close(pi.re, 0.5) && close(Math.abs(pi.im), 0.5));
});

test("isReal separates real from complex states", () => {
  assert.equal(Q.isReal(Q.real(0.6, -0.8)), true);
  assert.equal(Q.isReal(Q.complex(0.6, 0, 0, 0.8)), false);
  assert.equal(Q.isReal(Q.complex(0.6, 1e-12, 0, 0)), true);
});
