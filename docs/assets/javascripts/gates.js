// Shared single-qubit gate module, used by Module 02 (02.04 Quantum Gates first;
// 02.05 Multi-Qubit Systems adds controlled gates, 02.06 Quantum Circuits builds
// its palette from the same table, and 02.07 Measurement uses the basis-change
// gates) and available to any page that applies a gate to one qubit.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op
// on pages that don't call it. Page scripts that use window.QedGates must run
// inside a DOMContentLoaded listener.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   operation -> pure functions of a gate and a state or vector. No DOM.
//   text      -> describe(): plain strings for captions and aria-live
//   wiring    -> left to each page
//
// Scope, on purpose: ONE qubit. It does not draw (the sphere is QedBloch and the
// circuit symbols are QedCircuit), does not hold the state model (QedQubit does),
// and has no two-qubit gates yet. It builds on QedQubit's state shape only:
// { alpha: {re, im}, beta: {re, im} }. It does not call QedQubit.
//
// Each gate is described twice, and the two descriptions must agree (a test
// checks this):
//   matrix   the standard 2x2 matrix, for amplitudes and for the Intermediate view
//   rotation an axis (unit vector) and an angle in degrees, the Bloch-sphere
//            action, for moving a point without any matrices
// The matrix differs from the pure rotation by a global phase for most gates
// (for example X = i times a half turn about x). The sphere and the outcome
// probabilities do not depend on global phase.
//
// Rotation convention: a turn by theta about an axis is right-handed, so viewed
// from the positive end of the axis looking toward the centre it is
// counterclockwise. RZ(theta) adds theta to the phase angle of a point on the
// sphere. RX, RY, and RZ are exp(-i theta sigma / 2) for the Pauli matrix sigma.
//
// Order convention: compose([g1, g2]) means g1 is applied first. Its matrix is
// the product M2 times M1, so the matrix reads right to left while the list (and
// a circuit diagram) reads left to right.
window.QedGates = (function () {
  var EPS = 1e-9;
  var S2 = Math.SQRT1_2;
  var AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

  function checkNumber(x, what) {
    if (typeof x !== "number" || !isFinite(x)) {
      throw new Error("QedGates: " + what + " must be a finite number");
    }
  }

  function z(re, im) {
    return { re: re, im: im === undefined ? 0 : im };
  }

  function mul(u, v) {
    return { re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re };
  }

  function add(u, v) {
    return { re: u.re + v.re, im: u.im + v.im };
  }

  function conj(u) {
    return { re: u.re, im: -u.im };
  }

  // A 2x2 matrix is [[a, b], [c, d]] with each entry {re, im}.
  function matMul(m, n) {
    return [
      [add(mul(m[0][0], n[0][0]), mul(m[0][1], n[1][0])), add(mul(m[0][0], n[0][1]), mul(m[0][1], n[1][1]))],
      [add(mul(m[1][0], n[0][0]), mul(m[1][1], n[1][0])), add(mul(m[1][0], n[0][1]), mul(m[1][1], n[1][1]))],
    ];
  }

  function dagger(m) {
    return [
      [conj(m[0][0]), conj(m[1][0])],
      [conj(m[0][1]), conj(m[1][1])],
    ];
  }

  function close(u, v, tol) {
    return Math.abs(u.re - v.re) <= tol && Math.abs(u.im - v.im) <= tol;
  }

  var IDENTITY = [
    [z(1), z(0)],
    [z(0), z(1)],
  ];

  function matricesEqual(m, n, tol) {
    return close(m[0][0], n[0][0], tol) && close(m[0][1], n[0][1], tol) && close(m[1][0], n[1][0], tol) && close(m[1][1], n[1][1], tol);
  }

  // ---- the named gates -------------------------------------------------------------
  function named(id, name, matrix, axis, angleDeg, words) {
    return { id: id, name: name, label: name, matrix: matrix, axis: axis, angleDeg: angleDeg, words: words, kind: "named" };
  }

  var GATES = [
    named("i", "I", IDENTITY, AXES.z, 0, "does nothing"),
    named("x", "X", [[z(0), z(1)], [z(1), z(0)]], AXES.x, 180, "a half turn about the x axis; it flips 0 and 1"),
    named("y", "Y", [[z(0), z(0, -1)], [z(0, 1), z(0)]], AXES.y, 180, "a half turn about the y axis; a third kind of flip"),
    named("z", "Z", [[z(1), z(0)], [z(0), z(-1)]], AXES.z, 180, "a half turn about the z axis; it flips the phase"),
    named("h", "H", [[z(S2), z(S2)], [z(S2), z(-S2)]], [S2, 0, S2], 180, "a half turn about the axis halfway between x and z; it mixes"),
    named("s", "S", [[z(1), z(0)], [z(0), z(0, 1)]], AXES.z, 90, "a quarter turn about the z axis"),
    named("t", "T", [[z(1), z(0)], [z(0), z(S2, S2)]], AXES.z, 45, "an eighth turn about the z axis"),
  ];

  function gate(id) {
    for (var i = 0; i < GATES.length; i++) if (GATES[i].id === id) return GATES[i];
    throw new Error("QedGates: unknown gate '" + id + "'");
  }

  function degText(angleDeg) {
    return String(Math.round(angleDeg * 10) / 10) + "°";
  }

  // RX, RY, or RZ by angleDeg. Any finite angle is allowed.
  function rotation(axisName, angleDeg) {
    if (!AXES[axisName]) throw new Error("QedGates: the axis must be 'x', 'y', or 'z'");
    checkNumber(angleDeg, "angle");
    var half = (angleDeg * Math.PI) / 360;
    var c = Math.cos(half);
    var s = Math.sin(half);
    var m;
    if (axisName === "x") m = [[z(c), z(0, -s)], [z(0, -s), z(c)]];
    else if (axisName === "y") m = [[z(c), z(-s)], [z(s), z(c)]];
    else m = [[z(c, -s), z(0)], [z(0), z(c, s)]];
    var name = "R" + axisName.toUpperCase() + "(" + degText(angleDeg) + ")";
    return {
      id: "r" + axisName,
      name: name,
      label: "R" + axisName + "(" + degText(angleDeg) + ")",
      matrix: m,
      axis: AXES[axisName],
      angleDeg: angleDeg,
      words: "a turn by " + degText(angleDeg) + " about the " + axisName + " axis",
      kind: "rotation",
      rotationAxis: axisName,
    };
  }

  // The state after the gate: matrix times the column (alpha, beta).
  function apply(g, s) {
    var m = g.matrix;
    return {
      alpha: add(mul(m[0][0], s.alpha), mul(m[0][1], s.beta)),
      beta: add(mul(m[1][0], s.alpha), mul(m[1][1], s.beta)),
    };
  }

  // The single gate that equals applying gates[0] first, then gates[1], and so on.
  // The matrix is the product in the opposite order: M_n ... M_2 M_1.
  function compose(gates) {
    var m = IDENTITY;
    gates.forEach(function (g) {
      m = matMul(g.matrix, m);
    });
    return {
      id: "composed",
      name: gates.map(function (g) { return g.name; }).join(" then "),
      label: gates.map(function (g) { return g.label; }).join(" then "),
      matrix: m,
      words: "the gates applied one after another",
      kind: "composed",
    };
  }

  function isUnitary(g, tolerance) {
    return matricesEqual(matMul(dagger(g.matrix), g.matrix), IDENTITY, tolerance === undefined ? 1e-9 : tolerance);
  }

  // The gate that undoes g. A gate that is its own inverse (I, X, Y, Z, H) is
  // returned as it is. A rotation gives the negative angle. S and T give S† and T†.
  function inverse(g) {
    var dag = dagger(g.matrix);
    if (matricesEqual(dag, g.matrix, EPS)) return g;
    if (g.kind === "rotation") return rotation(g.rotationAxis, -g.angleDeg);
    return {
      id: g.id + "-inverse",
      name: g.name + "†",
      label: g.label + "†",
      matrix: dag,
      axis: g.axis,
      angleDeg: g.angleDeg === undefined ? undefined : -g.angleDeg,
      words: "the inverse of " + g.name + ", a turn the other way",
      kind: g.kind === "composed" ? "composed" : "named",
    };
  }

  // Rotate a point (a 3-vector) by angleDeg about a unit axis, right-handed
  // (Rodrigues' formula). The axis may be 'x', 'y', 'z' or a unit vector.
  function blochRotate(v, axis, angleDeg) {
    var n = typeof axis === "string" ? AXES[axis] : axis;
    if (!n) throw new Error("QedGates: the axis must be 'x', 'y', 'z', or a unit vector");
    checkNumber(angleDeg, "angle");
    var a = (angleDeg * Math.PI) / 180;
    var c = Math.cos(a);
    var s = Math.sin(a);
    var dot = n[0] * v.x + n[1] * v.y + n[2] * v.z;
    var cross = {
      x: n[1] * v.z - n[2] * v.y,
      y: n[2] * v.x - n[0] * v.z,
      z: n[0] * v.y - n[1] * v.x,
    };
    return {
      x: v.x * c + cross.x * s + n[0] * dot * (1 - c),
      y: v.y * c + cross.y * s + n[1] * dot * (1 - c),
      z: v.z * c + cross.z * s + n[2] * dot * (1 - c),
    };
  }

  // The point after applying the gate's Bloch rotation to a fraction (0 to 1) of
  // the way, for animating a move. fraction 1 is the whole gate.
  function blochPartial(g, v, fraction) {
    checkNumber(fraction, "fraction");
    return blochRotate(v, g.axis, g.angleDeg * fraction);
  }

  // A plain sentence about the gate, for captions and aria text.
  function describe(g) {
    return g.name + " is " + g.words + ".";
  }

  return {
    GATES: GATES,
    gate: gate,
    rotation: rotation,
    apply: apply,
    compose: compose,
    inverse: inverse,
    isUnitary: isUnitary,
    blochRotate: blochRotate,
    blochPartial: blochPartial,
    describe: describe,
    AXES: AXES,
  };
})();
