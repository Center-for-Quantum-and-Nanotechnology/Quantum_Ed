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
// Scope, on purpose: operations on ONE qubit (GATES, rotation) and the building
// blocks for the first two-qubit gate (kron, controlled, CNOT). It does not draw
// (the sphere is QedBloch and the circuit symbols are QedCircuit), does not hold
// a state model (QedQubit holds one qubit, QedTwoQubit holds two), and has no gate
// on more than two qubits. apply() acts on a one-qubit state in QedQubit's shape,
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
//
// Two-qubit convention: a two-qubit matrix acts on the column (c00, c01, c10, c11).
// The first (left) digit is q0, which is also the first factor of kron(A, B) and
// the control of controlled(g). CNOT is controlled(X).
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

  // A matrix is an array of rows, each entry {re, im}. A one-qubit gate is 2x2
  // ([[a, b], [c, d]]) and a two-qubit gate is 4x4. Only square matrices are used.
  function matMul(m, n) {
    var size = m.length;
    var out = [];
    for (var i = 0; i < size; i++) {
      var row = [];
      for (var j = 0; j < size; j++) {
        var sum = z(0);
        for (var k = 0; k < size; k++) sum = add(sum, mul(m[i][k], n[k][j]));
        row.push(sum);
      }
      out.push(row);
    }
    return out;
  }

  function dagger(m) {
    return m.map(function (row, i) {
      return row.map(function (_, j) {
        return conj(m[j][i]);
      });
    });
  }

  function close(u, v, tol) {
    return Math.abs(u.re - v.re) <= tol && Math.abs(u.im - v.im) <= tol;
  }

  function identity(size) {
    var out = [];
    for (var i = 0; i < size; i++) {
      var row = [];
      for (var j = 0; j < size; j++) row.push(z(i === j ? 1 : 0));
      out.push(row);
    }
    return out;
  }

  var IDENTITY = identity(2);

  function matricesEqual(m, n, tol) {
    if (m.length !== n.length) return false;
    for (var i = 0; i < m.length; i++) {
      for (var j = 0; j < m.length; j++) if (!close(m[i][j], n[i][j], tol)) return false;
    }
    return true;
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
    var m = identity(gates.length ? gates[0].matrix.length : 2);
    gates.forEach(function (g) {
      if (g.matrix.length !== m.length) throw new Error("QedGates: compose needs gates on the same number of qubits");
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
    return matricesEqual(matMul(dagger(g.matrix), g.matrix), identity(g.matrix.length), tolerance === undefined ? 1e-9 : tolerance);
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

  // The Kronecker (tensor) product of two matrices. The first factor acts on the
  // first (left) qubit, so kron(A, B) acts as A on q0 and B on q1: entry
  // [i * rows(B) + k][j * cols(B) + l] is A[i][j] times B[k][l].
  function kron(a, b) {
    var out = [];
    for (var i = 0; i < a.length; i++) {
      for (var k = 0; k < b.length; k++) {
        var row = [];
        for (var j = 0; j < a[0].length; j++) {
          for (var l = 0; l < b[0].length; l++) row.push(mul(a[i][j], b[k][l]));
        }
        out.push(row);
      }
    }
    return out;
  }

  // A one-qubit gate made conditional on q0: the identity when q0 is 0, and g
  // acting on q1 when q0 is 1. The control is q0 and the target is q1.
  function controlled(g, name) {
    if (g.matrix.length !== 2) throw new Error("QedGates: controlled needs a one-qubit gate");
    var m = identity(4);
    m[2][2] = g.matrix[0][0];
    m[2][3] = g.matrix[0][1];
    m[3][2] = g.matrix[1][0];
    m[3][3] = g.matrix[1][1];
    var label = name || "C-" + g.name;
    return {
      id: "c" + g.id,
      name: label,
      label: label,
      matrix: m,
      words: "a conditional gate: " + g.name + " on q1 when q0 is 1",
      kind: "controlled",
      control: 0,
      target: 1,
      base: g,
    };
  }

  // CNOT: flips q1 when q0 is 1. In the order 00, 01, 10, 11 its matrix swaps the
  // amplitudes of 10 and 11 and leaves 00 and 01 alone.
  var CNOT = controlled(gate("x"), "CNOT");
  CNOT.words = "a flip of q1 when q0 is 1";

  // CNOT with either wire as the control. cnot(0) is CNOT above (q0 control, q1
  // target). cnot(1) has q1 as the control and q0 as the target: in the order 00,
  // 01, 10, 11 it exchanges the amplitudes of 01 and 11.
  var CNOT_REVERSED = null;

  function cnot(controlWire) {
    if (controlWire === 0) return CNOT;
    if (controlWire !== 1) throw new Error("QedGates: the control wire must be 0 or 1");
    if (!CNOT_REVERSED) {
      var m = identity(4);
      m[1][1] = z(0);
      m[1][3] = z(1);
      m[3][3] = z(0);
      m[3][1] = z(1);
      CNOT_REVERSED = {
        id: "cx1",
        name: "CNOT",
        label: "CNOT",
        matrix: m,
        words: "a flip of q0 when q1 is 1",
        kind: "controlled",
        control: 1,
        target: 0,
        base: gate("x"),
      };
    }
    return CNOT_REVERSED;
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
    kron: kron,
    controlled: controlled,
    identity: identity,
    CNOT: CNOT,
    cnot: cnot,
    AXES: AXES,
  };
})();
