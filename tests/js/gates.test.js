// Tests for docs/assets/javascripts/gates.js (window.QedGates), and checks that
// it agrees with QedQubit: the matrix action of every gate must match its Bloch
// rotation, so the two descriptions of a gate cannot drift apart.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const G = loadModule("gates.js").QedGates;
const Q = loadModule("qubit.js").QedQubit;

const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const HALF = Math.SQRT1_2;
const ANGLES = [];
for (let t = 0; t <= 180; t += 30) for (let f = 0; f < 360; f += 45) ANGLES.push([t, f]);
const byId = Object.fromEntries(Q.PRESETS.map((p) => [p.id, p.state]));

const samePoint = (s1, s2, tol = 1e-9) => {
  const a = Q.blochVector(s1);
  const b = Q.blochVector(s2);
  return close(a.x, b.x, tol) && close(a.y, b.y, tol) && close(a.z, b.z, tol);
};
const allGates = () => [
  ...G.GATES,
  G.rotation("x", 60),
  G.rotation("y", 125),
  G.rotation("z", 300),
  G.rotation("x", -45),
];

test("every gate matrix is unitary", () => {
  allGates().forEach((g) => assert.ok(G.isUnitary(g), g.name));
});

test("a gate keeps the state normalized", () => {
  allGates().forEach((g) => {
    ANGLES.forEach(([t, f]) => assert.ok(Q.isNormalized(G.apply(g, Q.fromBloch(t, f)), 1e-9), `${g.name} ${t},${f}`));
  });
});

test("the matrix action of every gate agrees with its Bloch rotation", () => {
  allGates().forEach((g) => {
    ANGLES.forEach(([t, f]) => {
      const s = Q.fromBloch(t, f);
      const moved = Q.blochVector(G.apply(g, s));
      const turned = G.blochRotate(Q.blochVector(s), g.axis, g.angleDeg);
      assert.ok(close(moved.x, turned.x, 1e-9) && close(moved.y, turned.y, 1e-9) && close(moved.z, turned.z, 1e-9), `${g.name} ${t},${f}`);
    });
  });
});

test("X, Y, and Z are half turns about their axes, and H about the axis halfway between x and z", () => {
  const axes = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  ["x", "y", "z"].forEach((id) => {
    const g = G.gate(id);
    assert.equal(g.angleDeg, 180);
    assert.deepEqual(g.axis, axes[id]);
  });
  const h = G.gate("h");
  assert.equal(h.angleDeg, 180);
  assert.ok(close(h.axis[0], HALF) && close(h.axis[1], 0) && close(h.axis[2], HALF));
});

test("where the named gates send the named states", () => {
  const send = (gid, sid) => {
    const out = Q.nameOf(G.apply(G.gate(gid), byId[sid]));
    return out && out.id;
  };
  assert.equal(send("x", "zero"), "one");
  assert.equal(send("x", "one"), "zero");
  assert.equal(send("x", "plus"), "plus"); // X leaves |+> where it is
  assert.equal(send("x", "minus"), "minus"); // X turns |-> into -|->, the same point
  assert.equal(send("x", "plusI"), "minusI");
  assert.equal(send("z", "plus"), "minus");
  assert.equal(send("z", "minus"), "plus");
  assert.equal(send("z", "zero"), "zero");
  assert.equal(send("z", "one"), "one");
  assert.equal(send("y", "zero"), "one");
  assert.equal(send("y", "plus"), "minus");
  assert.equal(send("y", "plusI"), "plusI"); // Y leaves |+i> where it is
  assert.equal(send("h", "zero"), "plus");
  assert.equal(send("h", "one"), "minus");
  assert.equal(send("h", "plus"), "zero");
  assert.equal(send("h", "minus"), "one");
  assert.equal(send("h", "plusI"), "minusI");
  ["zero", "one", "plus", "minus", "plusI", "minusI"].forEach((sid) => assert.equal(send("i", sid), sid));
});

test("a gate that moves a point changes the Z-basis probabilities only through height", () => {
  // Z moves |+> to |-> at the same height; H takes both to opposite poles.
  const pPlus = Q.probabilities(byId.plus);
  const pAfterZ = Q.probabilities(G.apply(G.gate("z"), byId.plus));
  assert.ok(close(pPlus[0], pAfterZ[0]) && close(pPlus[1], pAfterZ[1]));
  const hPlus = Q.probabilities(G.apply(G.gate("h"), byId.plus));
  const hMinus = Q.probabilities(G.apply(G.gate("h"), byId.minus));
  assert.ok(close(hPlus[0], 1) && close(hMinus[1], 1));
});

test("every gate here that is its own inverse gives the identity when applied twice", () => {
  ["i", "x", "y", "z", "h"].forEach((id) => {
    const g = G.gate(id);
    ANGLES.forEach(([t, f]) => {
      const s = Q.fromBloch(t, f);
      assert.ok(samePoint(s, G.apply(g, G.apply(g, s))), `${id} ${t},${f}`);
    });
  });
});

test("a gate followed by its inverse returns the state", () => {
  allGates().forEach((g) => {
    ANGLES.forEach(([t, f]) => {
      const s = Q.fromBloch(t, f);
      const back = G.apply(G.inverse(g), G.apply(g, s));
      assert.ok(samePoint(s, back), `${g.name} ${t},${f}`);
      // not just the same point: the same state, global phase included
      const ip = Q.innerProduct(s, back);
      assert.ok(close(ip.re, 1, 1e-9) && close(ip.im, 0, 1e-9), `${g.name} state ${t},${f}`);
    });
  });
});

test("the inverse of a rotation is the negative angle, and the self-inverse gates return themselves", () => {
  const r = G.rotation("y", 60);
  const inv = G.inverse(r);
  assert.equal(inv.angleDeg, -60);
  assert.equal(inv.rotationAxis, "y");
  ["i", "x", "y", "z", "h"].forEach((id) => assert.equal(G.inverse(G.gate(id)), G.gate(id)));
  assert.equal(G.inverse(G.gate("s")).name, "S†");
  assert.equal(G.inverse(G.gate("t")).name, "T†");
});

test("HZH equals X, as matrices", () => {
  const m = G.compose([G.gate("h"), G.gate("z"), G.gate("h")]).matrix;
  const x = G.gate("x").matrix;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      assert.ok(close(m[r][c].re, x[r][c].re, 1e-12) && close(m[r][c].im, x[r][c].im, 1e-12), `${r}${c}`);
    }
  }
});

test("compose applies the first gate first, so the matrix product reads right to left", () => {
  // Z then H on |+> ends at |1>; H then Z on |+> ends at |0>.
  const zThenH = G.apply(G.compose([G.gate("z"), G.gate("h")]), byId.plus);
  const hThenZ = G.apply(G.compose([G.gate("h"), G.gate("z")]), byId.plus);
  assert.equal(Q.nameOf(zThenH).id, "one");
  assert.equal(Q.nameOf(hThenZ).id, "zero");
  // and the composed gate agrees with applying the gates one at a time
  ANGLES.forEach(([t, f]) => {
    const s = Q.fromBloch(t, f);
    const seq = G.apply(G.gate("h"), G.apply(G.gate("z"), s));
    const one = G.apply(G.compose([G.gate("z"), G.gate("h")]), s);
    const ip = Q.innerProduct(seq, one);
    assert.ok(close(ip.re, 1, 1e-9) && close(ip.im, 0, 1e-9), `${t},${f}`);
  });
  assert.equal(G.compose([]).matrix[0][0].re, 1);
});

test("X and Z in either order give the same point, but not the same state", () => {
  ANGLES.forEach(([t, f]) => {
    const s = Q.fromBloch(t, f);
    const a = G.apply(G.gate("z"), G.apply(G.gate("x"), s));
    const b = G.apply(G.gate("x"), G.apply(G.gate("z"), s));
    assert.ok(samePoint(a, b), `${t},${f}`);
    const ip = Q.innerProduct(a, b);
    assert.ok(close(ip.re, -1, 1e-9) && close(ip.im, 0, 1e-9), `a global factor of -1 at ${t},${f}`);
  });
});

test("rotation convention: RZ adds to the phase angle, RY and RX on |0> give sin^2(theta/2) for outcome 1", () => {
  ANGLES.filter(([t]) => t > 0 && t < 180).forEach(([t, f]) => {
    const b = Q.toBloch(G.apply(G.rotation("z", 50), Q.fromBloch(t, f)));
    assert.ok(close(((b.phiDeg - f - 50 + 720) % 360 + 360) % 360, 0, 1e-6) || close(((b.phiDeg - f - 50 + 720) % 360 + 360) % 360, 360, 1e-6), `${t},${f}`);
    assert.ok(close(b.thetaDeg, t, 1e-7));
  });
  [30, 60, 90, 150, 200, 300].forEach((a) => {
    const expected = Math.pow(Math.sin((a * Math.PI) / 360), 2);
    assert.ok(close(Q.probabilities(G.apply(G.rotation("y", a), byId.zero))[1], expected));
    assert.ok(close(Q.probabilities(G.apply(G.rotation("x", a), byId.zero))[1], expected));
    assert.ok(close(Q.probabilities(G.apply(G.rotation("z", a), byId.zero))[1], 0));
  });
  // RY(60) gives 25 percent for outcome 1, the transfer task on the page
  assert.ok(close(Q.probabilities(G.apply(G.rotation("y", 60), byId.zero))[1], 0.25));
});

test("the 180 degree rotations are the X, Y, and Z gates up to a global phase", () => {
  ["x", "y", "z"].forEach((a) => {
    ANGLES.forEach(([t, f]) => {
      const s = Q.fromBloch(t, f);
      assert.ok(samePoint(G.apply(G.rotation(a, 180), s), G.apply(G.gate(a), s)), `${a} ${t},${f}`);
    });
  });
});

test("S and T are quarter and eighth turns about z", () => {
  const b = (id) => Q.toBloch(G.apply(G.gate(id), byId.plus));
  assert.ok(close(b("s").phiDeg, 90, 1e-7));
  assert.ok(close(b("t").phiDeg, 45, 1e-7));
});

test("blochPartial sweeps from the start to the result", () => {
  const v = Q.blochVector(byId.plus);
  const g = G.gate("z");
  const start = G.blochPartial(g, v, 0);
  const end = G.blochPartial(g, v, 1);
  const mid = G.blochPartial(g, v, 0.5);
  assert.ok(close(start.x, 1) && close(start.y, 0));
  assert.ok(close(end.x, -1) && close(end.y, 0, 1e-12));
  assert.ok(close(mid.x, 0, 1e-12) && close(mid.y, 1)); // halfway round the equator
});

test("rotation and blochRotate reject bad input", () => {
  assert.throws(() => G.rotation("w", 10), /axis/);
  assert.throws(() => G.rotation("x", NaN), /angle/);
  assert.throws(() => G.rotation("x", Infinity), /angle/);
  assert.throws(() => G.gate("q"), /unknown gate/);
  assert.throws(() => G.blochRotate({ x: 1, y: 0, z: 0 }, "w", 10), /axis/);
});

test("describe gives a sentence that names the gate", () => {
  assert.match(G.describe(G.gate("h")), /^H is a half turn about the axis halfway between x and z/);
  assert.match(G.describe(G.rotation("y", 60)), /RY\(60°\) is a turn by 60° about the y axis/);
});

test("the named matrices are the standard ones, entry by entry (the Intermediate view shows them)", () => {
  const e = (re, im = 0) => [re, im];
  const flat = (g) => g.matrix.flat().map((c) => [c.re, c.im]);
  const expect = {
    i: [e(1), e(0), e(0), e(1)],
    x: [e(0), e(1), e(1), e(0)],
    y: [e(0), e(0, -1), e(0, 1), e(0)],
    z: [e(1), e(0), e(0), e(-1)],
    h: [e(HALF), e(HALF), e(HALF), e(-HALF)],
    s: [e(1), e(0), e(0), e(0, 1)],
    t: [e(1), e(0), e(0), e(HALF, HALF)],
  };
  Object.keys(expect).forEach((id) => {
    flat(G.gate(id)).forEach((c, k) => {
      assert.ok(close(c[0], expect[id][k][0], 1e-12) && close(c[1], expect[id][k][1], 1e-12), `${id} entry ${k}`);
    });
  });
});

test("the rotation matrices are exp(-i theta sigma / 2)", () => {
  const th = (70 * Math.PI) / 180;
  const c = Math.cos(th / 2);
  const s = Math.sin(th / 2);
  const m = (g) => g.matrix.map((row) => row.map((v) => [v.re, v.im]));
  const near = (a, b) => a.every((row, r) => row.every((v, k) => close(v[0], b[r][k][0], 1e-12) && close(v[1], b[r][k][1], 1e-12)));
  assert.ok(near(m(G.rotation("x", 70)), [[[c, 0], [0, -s]], [[0, -s], [c, 0]]]));
  assert.ok(near(m(G.rotation("y", 70)), [[[c, 0], [-s, 0]], [[s, 0], [c, 0]]]));
  assert.ok(near(m(G.rotation("z", 70)), [[[c, -s], [0, 0]], [[0, 0], [c, s]]]));
});

// ---- the two-qubit building blocks added for 02.05 -----------------------------------

test("kron puts the first factor on q0: kron(A, B) has A[i][j] * B[k][l] at row 2i+k, column 2j+l", () => {
  const A = G.gate("x").matrix;
  const B = G.gate("y").matrix;
  const K = G.kron(A, B);
  assert.equal(K.length, 4);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) for (let l = 0; l < 2; l++) {
    const a = A[i][j];
    const b = B[k][l];
    const entry = K[2 * i + k][2 * j + l];
    assert.ok(close(entry.re, a.re * b.re - a.im * b.im, 1e-12) && close(entry.im, a.re * b.im + a.im * b.re, 1e-12), `${i}${j}${k}${l}`);
  }
  // X on q0 and nothing on q1 moves 00 to 10 (column 0 has its 1 in row 2)
  const XI = G.kron(G.gate("x").matrix, G.gate("i").matrix);
  assert.equal(XI[2][0].re, 1);
  const IX = G.kron(G.gate("i").matrix, G.gate("x").matrix);
  assert.equal(IX[1][0].re, 1);
});

test("controlled(gate) is the identity on q0 = 0 and the gate on q1 when q0 = 1", () => {
  const cz = G.controlled(G.gate("z"));
  assert.deepEqual(cz.matrix.map((row) => row.map((z) => z.re)), [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]]);
  assert.equal(cz.control, 0);
  assert.equal(cz.target, 1);
  assert.ok(G.isUnitary(cz));
  assert.throws(() => G.controlled(cz), /one-qubit/);
  assert.equal(G.CNOT.name, "CNOT");
  assert.equal(G.describe(G.CNOT), "CNOT is a flip of q1 when q0 is 1.");
});

test("the two-qubit matrices are unitary and CNOT is its own inverse", () => {
  assert.ok(G.isUnitary(G.CNOT));
  ["h", "x", "y", "z", "s", "t"].forEach((id) => {
    assert.ok(G.isUnitary({ matrix: G.kron(G.gate(id).matrix, G.gate("i").matrix) }), id);
    assert.ok(G.isUnitary({ matrix: G.kron(G.gate("h").matrix, G.gate(id).matrix) }), id);
  });
  assert.equal(G.inverse(G.CNOT), G.CNOT);
  const two = G.compose([G.CNOT, G.CNOT]).matrix;
  assert.deepEqual(two.map((row) => row.map((z) => Math.round(z.re * 1e9) / 1e9)), [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
});

test("compose needs gates on the same number of qubits, and identity(n) is the identity", () => {
  assert.throws(() => G.compose([G.gate("h"), G.CNOT]), /same number of qubits/);
  assert.equal(G.identity(4)[2][2].re, 1);
  assert.equal(G.identity(4)[2][3].re, 0);
  assert.equal(G.compose([]).matrix.length, 2);
});

// ---- cnot(controlWire): the CNOT with either wire as the control (02.06) ---------------

test("cnot(0) is the CNOT of 02.05, and cnot(1) flips q0 when q1 is 1", () => {
  assert.equal(G.cnot(0), G.CNOT);
  const rev = G.cnot(1);
  assert.deepEqual(rev.matrix.map((row) => row.map((z) => z.re)), [[1, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0]]);
  assert.equal(rev.control, 1);
  assert.equal(rev.target, 0);
  assert.equal(rev.name, "CNOT");
  assert.ok(G.isUnitary(rev));
  assert.equal(G.inverse(rev), rev, "its own inverse");
  assert.equal(G.cnot(1), G.cnot(1), "built once");
  assert.equal(G.describe(rev), "CNOT is a flip of q0 when q1 is 1.");
});

test("cnot(1) truth table: it exchanges 01 and 11 and leaves 00 and 10 alone", () => {
  const rev = G.cnot(1).matrix;
  const sends = (from) => rev.findIndex((row) => close(row[from].re, 1));
  assert.equal(sends(0), 0);
  assert.equal(sends(1), 3);
  assert.equal(sends(2), 2);
  assert.equal(sends(3), 1);
});

test("cnot rejects any wire but 0 and 1", () => {
  assert.throws(() => G.cnot(2), /control wire must be 0 or 1/);
  assert.throws(() => G.cnot(-1), /control wire must be 0 or 1/);
  assert.throws(() => G.cnot("0"), /control wire must be 0 or 1/);
});
