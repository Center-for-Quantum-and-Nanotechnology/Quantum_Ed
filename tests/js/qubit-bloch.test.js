// Tests for the Bloch conversions in docs/assets/javascripts/qubit.js
// (QedQubit.fromBloch, toBloch, blochVector). The drawing side is QedBloch;
// see bloch.test.js for the checks that the two agree.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const Q = loadModule("qubit.js").QedQubit;

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const HALF = Math.SQRT1_2;
const byId = () => Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));

const ANGLES = [];
for (let t = 0; t <= 180; t += 30) for (let f = 0; f < 360; f += 45) ANGLES.push([t, f]);

test("the named states sit at the known Bloch points", () => {
  const { zero, one, plus, minus } = byId();
  assert.deepEqual(Q.toBloch(zero), { thetaDeg: 0, phiDeg: 0, phiDefined: false });
  assert.deepEqual(Q.toBloch(one), { thetaDeg: 180, phiDeg: 0, phiDefined: false });
  const p = Q.toBloch(plus);
  assert.ok(close(p.thetaDeg, 90) && close(p.phiDeg, 0) && p.phiDefined);
  const m = Q.toBloch(minus);
  assert.ok(close(m.thetaDeg, 90) && close(m.phiDeg, 180) && m.phiDefined);
  const plusI = Q.toBloch(Q.complex(HALF, 0, 0, HALF));
  assert.ok(close(plusI.thetaDeg, 90) && close(plusI.phiDeg, 90));
  const minusI = Q.toBloch(Q.complex(HALF, 0, 0, -HALF));
  assert.ok(close(minusI.thetaDeg, 90) && close(minusI.phiDeg, 270));
});

test("fromBloch then toBloch returns the same angles, except phi at the poles", () => {
  ANGLES.forEach(([t, f]) => {
    const b = Q.toBloch(Q.fromBloch(t, f));
    assert.ok(close(b.thetaDeg, t, 1e-7), `theta ${t},${f}`);
    if (t === 0 || t === 180) {
      assert.equal(b.phiDefined, false, `pole ${t}`);
      assert.equal(b.phiDeg, 0);
    } else {
      assert.ok(close(b.phiDeg, f, 1e-7), `phi ${t},${f} gave ${b.phiDeg}`);
      assert.equal(b.phiDefined, true);
    }
  });
});

test("fromBloch builds normalized states with a real, non-negative |0> amplitude", () => {
  ANGLES.forEach(([t, f]) => {
    const s = Q.fromBloch(t, f);
    assert.ok(Q.isNormalized(s));
    assert.ok(s.alpha.re >= 0 && Math.abs(s.alpha.im) < 1e-12);
  });
});

test("the relative phase of fromBloch(theta, phi) is phi", () => {
  [[90, 0], [90, 90], [90, 180], [60, 270], [120, 45]].forEach(([t, f]) => {
    const rel = (Q.relativePhase(Q.fromBloch(t, f)) * 180) / Math.PI;
    const wrapped = ((rel % 360) + 360) % 360;
    assert.ok(close(wrapped, f, 1e-7), `${t},${f}: ${wrapped}`);
  });
});

test("a global phase does not move the Bloch point", () => {
  const s = Q.normalize(Q.complex(0.5, 0.2, -0.3, 0.7));
  const base = Q.toBloch(s);
  [0.4, 1.3, Math.PI, -2.1].forEach((g) => {
    const b = Q.toBloch(Q.applyGlobalPhase(s, g));
    assert.ok(close(b.thetaDeg, base.thetaDeg, 1e-7) && close(b.phiDeg, base.phiDeg, 1e-7), `gamma ${g}`);
  });
});

test("the Bloch vector is the unit vector for the angles", () => {
  ANGLES.forEach(([t, f]) => {
    const v = Q.blochVector(Q.fromBloch(t, f));
    const tr = (t * Math.PI) / 180;
    const fr = (f * Math.PI) / 180;
    assert.ok(close(v.x, Math.sin(tr) * Math.cos(fr), 1e-9), `x ${t},${f}`);
    assert.ok(close(v.y, Math.sin(tr) * Math.sin(fr), 1e-9), `y ${t},${f}`);
    assert.ok(close(v.z, Math.cos(tr), 1e-9), `z ${t},${f}`);
    assert.ok(close(v.x * v.x + v.y * v.y + v.z * v.z, 1, 1e-9));
  });
});

test("the named states point along the axes", () => {
  const { zero, one, plus, minus } = byId();
  assert.ok(close(Q.blochVector(zero).z, 1) && close(Q.blochVector(one).z, -1));
  assert.ok(close(Q.blochVector(plus).x, 1) && close(Q.blochVector(minus).x, -1));
  assert.ok(close(Q.blochVector(Q.complex(HALF, 0, 0, HALF)).y, 1));
  assert.ok(close(Q.blochVector(Q.complex(HALF, 0, 0, -HALF)).y, -1));
});

test("height on the sphere is the difference of the probabilities", () => {
  ANGLES.forEach(([t, f]) => {
    const s = Q.fromBloch(t, f);
    const p = Q.probabilities(s);
    assert.ok(close(Q.blochVector(s).z, p[0] - p[1], 1e-9));
  });
});

test("Bloch functions reject states that are not normalized", () => {
  assert.throws(() => Q.toBloch(Q.real(0.6, 0.6)), /normalized/);
  assert.throws(() => Q.blochVector(Q.real(0.6, 0.6)), /normalized/);
  assert.throws(() => Q.toBloch(Q.real(0, 0)), /normalized/);
});

test("fromBloch rejects bad angles", () => {
  assert.throws(() => Q.fromBloch(-1, 0), /between 0 and 180/);
  assert.throws(() => Q.fromBloch(181, 0), /between 0 and 180/);
  assert.throws(() => Q.fromBloch(NaN, 0));
  assert.throws(() => Q.fromBloch(90, Infinity));
});

test("the two further equator presets sit at phase 90 and 270 degrees", () => {
  const byId = Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));
  const a = Q.toBloch(byId.plusI);
  const b = Q.toBloch(byId.minusI);
  assert.ok(close(a.thetaDeg, 90) && close(a.phiDeg, 90));
  assert.ok(close(b.thetaDeg, 90) && close(b.phiDeg, 270));
});

test("every preset lands where its Bloch angles say, and round-trips", () => {
  Q.PRESETS.forEach((p) => {
    const b = Q.toBloch(p.state);
    const back = Q.fromBloch(b.thetaDeg, b.phiDeg);
    const ip = Q.innerProduct(p.state, back);
    assert.ok(close(ip.re * ip.re + ip.im * ip.im, 1, 1e-9), p.name);
  });
});
