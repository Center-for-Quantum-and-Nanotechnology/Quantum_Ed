// Tests for docs/assets/javascripts/components/bloch.js (window.QedBloch), and checks that
// it agrees with QedQubit about the Bloch picture. QedBloch only projects and
// draws; QedQubit holds the state math. These tests keep the two from drifting
// apart. render() draws on a canvas and is verified in the browser.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const B = loadModule("components/bloch.js").QedBloch;
const Q = loadModule("qubit.js").QedQubit;

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const TILT = (20 * Math.PI) / 180; // the site-wide tilt used by project()
const ANGLES = [];
for (let t = 0; t <= 180; t += 30) for (let f = 0; f < 360; f += 45) ANGLES.push([t, f]);

test("state gives cos(theta/2) and sin(theta/2) and probabilities that add to 1", () => {
  ANGLES.forEach(([t, f]) => {
    const s = B.state(t, f);
    const half = (t * Math.PI) / 360;
    assert.ok(close(s.a0, Math.cos(half)) && close(s.a1, Math.sin(half)));
    assert.ok(close(s.p0 + s.p1, 1));
    assert.equal(s.phiDeg, f);
  });
});

test("phi never changes the probabilities", () => {
  [0, 30, 90, 180, 359].forEach((f) => {
    const a = B.state(70, 0);
    const b = B.state(70, f);
    assert.ok(close(a.p0, b.p0) && close(a.p1, b.p1));
  });
});

test("QedBloch.state agrees with QedQubit on probabilities and magnitudes", () => {
  ANGLES.forEach(([t, f]) => {
    const bs = B.state(t, f);
    const qs = Q.fromBloch(t, f);
    const p = Q.probabilities(qs);
    assert.ok(close(bs.p0, p[0]) && close(bs.p1, p[1]), `${t},${f}`);
    assert.ok(close(bs.a0, Q.modulus(qs.alpha)) && close(bs.a1, Q.modulus(qs.beta)), `${t},${f}`);
  });
});

test("QedBloch.project follows the Bloch vector from QedQubit through the site tilt", () => {
  const cx = 150;
  const cy = 120;
  const r = 80;
  ANGLES.forEach(([t, f]) => {
    const v = Q.blochVector(Q.fromBloch(t, f));
    const pz = v.y * Math.sin(TILT) + v.z * Math.cos(TILT);
    const py = v.y * Math.cos(TILT) - v.z * Math.sin(TILT);
    const tip = B.project(cx, cy, r, (t * Math.PI) / 180, (f * Math.PI) / 180);
    assert.ok(close(tip.x, cx + v.x * r, 1e-6), `x ${t},${f}`);
    assert.ok(close(tip.y, cy - pz * r, 1e-6), `y ${t},${f}`);
    assert.ok(close(tip.depth, py, 1e-9), `depth ${t},${f}`);
  });
});

test("project puts |0> above the centre, |1> below it, and |+> to the right of it", () => {
  const cx = 100;
  const cy = 100;
  const r = 50;
  const north = B.project(cx, cy, r, 0, 0);
  const south = B.project(cx, cy, r, Math.PI, 0);
  assert.ok(north.y < cy && south.y > cy);
  assert.ok(close(north.x, cx) && close(south.x, cx));
  const plus = B.project(cx, cy, r, Math.PI / 2, 0);
  const minus = B.project(cx, cy, r, Math.PI / 2, Math.PI);
  assert.ok(plus.x > cx && minus.x < cx);
});

test("the equator projects onto the tilted ellipse that render() draws", () => {
  const cx = 100;
  const cy = 100;
  const r = 50;
  const front = B.project(cx, cy, r, Math.PI / 2, Math.PI / 2);
  const back = B.project(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
  assert.ok(close(Math.abs(front.y - cy), r * Math.sin(TILT), 1e-9));
  assert.ok(close(Math.abs(back.y - cy), r * Math.sin(TILT), 1e-9));
  assert.ok((front.y < cy) !== (back.y < cy));
});

test("formatText and formatHTML describe the state the way the site shows it", () => {
  assert.equal(
    B.formatText(90, 180),
    "State: 0.71 times zero plus 0.71 times one, phase 180 degrees. Probability of measuring 0: 50.0 percent. Probability of measuring 1: 50.0 percent."
  );
  assert.equal(B.formatHTML(90, 0), "|ψ⟩ = 0.71|0⟩ + <i>e</i><sup><i>i</i>·0°</sup>·0.71|1⟩");
  assert.match(B.formatText(0, 0), /Probability of measuring 0: 100\.0 percent/);
  assert.match(B.formatText(180, 0), /Probability of measuring 1: 100\.0 percent/);
});

test("the module exposes the functions that the Module 01 and Module 02 pages call", () => {
  ["state", "formatHTML", "formatText", "project", "render"].forEach((name) => assert.equal(typeof B[name], "function", name));
});

test("project's depth is larger for points farther from the viewer", () => {
  const cx = 100;
  const cy = 100;
  const r = 50;
  const north = B.project(cx, cy, r, 0, 0);
  const south = B.project(cx, cy, r, Math.PI, 0);
  const back = B.project(cx, cy, r, Math.PI / 2, Math.PI / 2); // +y
  const front = B.project(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2); // -y
  // The viewer looks from the -y side, slightly above: the north pole tips toward
  // them and the +y side of the equator is the far side.
  assert.ok(north.depth < 0 && south.depth > 0);
  assert.ok(back.depth > front.depth);
  assert.ok(back.depth > 0 && front.depth < 0);
});

test("render accepts an options argument and still exposes the same functions", () => {
  assert.equal(B.render.length, 4);
});
