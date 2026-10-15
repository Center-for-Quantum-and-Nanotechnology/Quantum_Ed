// Shared two-qubit state module, used by Module 02 (02.05 Multi-Qubit Systems
// first; 02.06 Quantum Circuits traces a circuit through it and 02.07 Measurement
// measures it, with measureQubit and measure) and available to any page that
// shows the state of exactly two qubits.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op
// on pages that don't call it. Page scripts that use window.QedTwoQubit must run
// inside a DOMContentLoaded listener.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   model   -> pure functions of a state: probabilities, each qubit's own
//              probabilities, the independent table, separability. No DOM.
//   measure -> measureQubit(), measure(): the ideal measurement rule and the state
//              update, with the random number passed in. No DOM.
//   text    -> format(), describe(): plain strings for display and aria-live
//   wiring  -> left to each page
//
// Scope, on purpose: exactly TWO qubits, as QedQubit is exactly one. It does not
// draw (bars come from QedShots.renderBars and circuits from QedCircuit), does
// not define gates (QedGates does: it supplies the 2x2 and 4x4 matrices passed in
// here), and has no state for three or more qubits. It does not call QedQubit or
// QedGates, so it loads and tests on its own.
//
// Basis order and qubit order, fixed once:
//   a state is [c00, c01, c10, c11], each {re, im}
//   the left digit is q0 (the first qubit, the CNOT control, the top wire)
//   the right digit is q1
// Some software libraries write bit strings with qubit 0 on the right; this module
// does not, and a page that shows its order should say so.
//
// Functions never mutate their arguments.
window.QedTwoQubit = (function () {
  var EPS = 1e-9;
  var LABELS = ["00", "01", "10", "11"];

  function checkIndex(q) {
    if (q !== 0 && q !== 1) throw new Error("QedTwoQubit: the qubit must be 0 or 1");
  }

  function checkNumber(x, what) {
    if (typeof x !== "number" || !isFinite(x)) {
      throw new Error("QedTwoQubit: " + what + " must be a finite number");
    }
  }

  function c(re, im) {
    return { re: re, im: im === undefined ? 0 : im };
  }

  function mul(u, v) {
    return { re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re };
  }

  function add(u, v) {
    return { re: u.re + v.re, im: u.im + v.im };
  }

  function sub(u, v) {
    return { re: u.re - v.re, im: u.im - v.im };
  }

  function square(u) {
    return u.re * u.re + u.im * u.im;
  }

  function checkState(s) {
    if (!Array.isArray(s) || s.length !== 4) throw new Error("QedTwoQubit: a state has four amplitudes");
  }

  // A state from four real amplitudes, in the order 00, 01, 10, 11.
  function real(a00, a01, a10, a11) {
    [a00, a01, a10, a11].forEach(function (x) { checkNumber(x, "amplitude"); });
    return [c(a00), c(a01), c(a10), c(a11)];
  }

  // The state of two independent qubits: a is q0 and b is q1, each in QedQubit's
  // shape { alpha, beta }. The amplitude of "xy" is a_x times b_y.
  function product(a, b) {
    return [
      mul(a.alpha, b.alpha),
      mul(a.alpha, b.beta),
      mul(a.beta, b.alpha),
      mul(a.beta, b.beta),
    ];
  }

  // Joint probabilities [p00, p01, p10, p11]: the squared magnitudes. For a valid
  // (normalized) state they add to 1.
  function probabilities(s) {
    checkState(s);
    return s.map(square);
  }

  function norm2(s) {
    return probabilities(s).reduce(function (a, b) { return a + b; }, 0);
  }

  function isNormalized(s, tolerance) {
    return Math.abs(norm2(s) - 1) <= (tolerance === undefined ? EPS : tolerance);
  }

  // Each qubit's own probabilities, read off the joint table by adding along rows
  // (q0) and columns (q1): { q0: [P(q0=0), P(q0=1)], q1: [P(q1=0), P(q1=1)] }.
  function marginals(s) {
    var p = probabilities(s);
    return {
      q0: [p[0] + p[1], p[2] + p[3]],
      q1: [p[0] + p[2], p[1] + p[3]],
    };
  }

  // The joint table that two independent qubits with these own probabilities
  // would give: each entry is the product of the matching own probabilities.
  function independentTable(m) {
    return [m.q0[0] * m.q1[0], m.q0[0] * m.q1[1], m.q0[1] * m.q1[0], m.q0[1] * m.q1[1]];
  }

  // Apply a 2x2 matrix to one qubit (q0 or q1), leaving the other alone.
  // The matrix may be a gate object from QedGates (it has .matrix) or a bare matrix.
  function applyToQubit(gate, qubit, s) {
    checkState(s);
    checkIndex(qubit);
    var m = gate.matrix || gate;
    if (m.length !== 2) throw new Error("QedTwoQubit: applyToQubit needs a 2x2 matrix");
    var out = [c(0), c(0), c(0), c(0)];
    for (var i = 0; i < 4; i++) {
      var q0 = i >> 1;
      var q1 = i & 1;
      var acting = qubit === 0 ? q0 : q1;
      for (var from = 0; from < 2; from++) {
        var j = qubit === 0 ? from * 2 + q1 : q0 * 2 + from;
        out[i] = add(out[i], mul(m[acting][from], s[j]));
      }
    }
    return out;
  }

  // Apply a 4x4 matrix (or a gate object with .matrix) to the four amplitudes.
  function apply(gate, s) {
    checkState(s);
    var m = gate.matrix || gate;
    if (m.length !== 4) throw new Error("QedTwoQubit: apply needs a 4x4 matrix");
    return m.map(function (row) {
      var sum = c(0);
      for (var j = 0; j < 4; j++) sum = add(sum, mul(row[j], s[j]));
      return sum;
    });
  }

  // alpha*delta - beta*gamma for the amplitudes of 00, 01, 10, 11 (alpha, beta,
  // gamma, delta). It is zero exactly when the state is a product of one-qubit
  // states. Returns { re, im, modulus }.
  function separability(s) {
    checkState(s);
    var d = sub(mul(s[0], s[3]), mul(s[1], s[2]));
    return { re: d.re, im: d.im, modulus: Math.sqrt(square(d)) };
  }

  function isProduct(s, tolerance) {
    return separability(s).modulus <= (tolerance === undefined ? 1e-9 : tolerance);
  }

  // True when the joint probabilities equal the product of each qubit's own
  // probabilities. Independent qubits always pass this. A state can pass it and
  // still be entangled (for example amplitudes 1/2, 1/2, 1/2, -1/2), so passing
  // proves nothing by itself; failing it proves the qubits are not independent.
  function passesProductTest(s, tolerance) {
    var p = probabilities(s);
    var t = independentTable(marginals(s));
    var tol = tolerance === undefined ? 1e-9 : tolerance;
    return p.every(function (x, i) { return Math.abs(x - t[i]) <= tol; });
  }

  // The two one-qubit states of a product state, or null when the state is not a
  // product: { q0, q1 }, each in QedQubit's shape { alpha, beta }. Each is found up
  // to a global phase (a product state has no single way to split a global phase
  // between its two factors).
  function factor(s) {
    if (!isProduct(s)) return null;
    function unit(x, y) {
      var n = Math.sqrt(square(x) + square(y));
      return { alpha: { re: x.re / n, im: x.im / n }, beta: { re: y.re / n, im: y.im / n } };
    }
    var rowFirst = square(s[0]) + square(s[1]) >= square(s[2]) + square(s[3]);
    var colFirst = square(s[0]) + square(s[2]) >= square(s[1]) + square(s[3]);
    return {
      q0: colFirst ? unit(s[0], s[2]) : unit(s[1], s[3]),
      q1: rowFirst ? unit(s[0], s[1]) : unit(s[2], s[3]),
    };
  }

  function inner(a, b) {
    // <a|b>
    var sum = c(0);
    for (var i = 0; i < 4; i++) {
      sum = add(sum, { re: a[i].re * b[i].re + a[i].im * b[i].im, im: a[i].re * b[i].im - a[i].im * b[i].re });
    }
    return sum;
  }

  var HALF = Math.SQRT1_2;

  // The four Bell states. All are entangled. In two of them the outcomes always
  // agree and in two they are always opposite; the "minus" ones carry a minus sign
  // that the joint probabilities do not show. H then CNOT on |00> gives the first.
  var BELL = [
    { id: "agree", name: "the Bell state (outcomes always agree)", state: real(HALF, 0, 0, HALF) },
    { id: "opposite", name: "the Bell state (outcomes always opposite)", state: real(0, HALF, HALF, 0) },
    { id: "agreeMinus", name: "a Bell state with a minus sign (outcomes always agree)", state: real(HALF, 0, 0, -HALF) },
    { id: "oppositeMinus", name: "a Bell state with a minus sign (outcomes always opposite)", state: real(0, HALF, -HALF, 0) },
  ];

  // Which Bell state this is, up to a global phase: the entry from BELL, or null.
  function bellOf(s, tolerance) {
    var tol = tolerance === undefined ? 1e-6 : tolerance;
    if (!isNormalized(s, tol)) return null;
    for (var i = 0; i < BELL.length; i++) {
      if (Math.abs(square(inner(BELL[i].state, s)) - 1) <= tol) return BELL[i];
    }
    return null;
  }

  // ---- measurement -------------------------------------------------------------------
  // The ideal rule for a computational-basis measurement of one qubit: the outcome
  // comes with the probability found by adding the joint probabilities that have that
  // digit, and the state afterwards keeps only the amplitudes that match the outcome,
  // divided by the square root of that probability so it is normalized again. These
  // functions expect a normalized state. They never draw a random number themselves.
  function bitOf(index, wire) {
    return wire === 0 ? index >> 1 : index & 1;
  }

  function checkOutcome(outcome) {
    if (outcome !== 0 && outcome !== 1) throw new Error("QedTwoQubit: an outcome is 0 or 1");
  }

  // Measure `wire` (0 for q0, 1 for q1) and suppose the result is `outcome`. Returns
  // { wire, outcome, probability, state }: the chance of that outcome and the state
  // afterwards. Throws when the outcome has probability 0, since a measurement cannot
  // give it.
  function measureQubit(s, wire, outcome) {
    checkState(s);
    checkIndex(wire);
    checkOutcome(outcome);
    var p = marginals(s)[wire === 0 ? "q0" : "q1"][outcome];
    if (p <= EPS) {
      throw new Error("QedTwoQubit: q" + wire + " cannot give " + outcome + ", because its probability is 0");
    }
    var scale = 1 / Math.sqrt(p);
    var after = s.map(function (z, i) {
      return bitOf(i, wire) === outcome ? { re: z.re * scale, im: z.im * scale } : c(0);
    });
    return { wire: wire, outcome: outcome, probability: p, state: after };
  }

  // Measure the listed wires one after another, in the order given, drawing each
  // outcome from the chances the state has at that moment. `random` is any function
  // returning a number in [0, 1), such as QedShots.rng(seed). Returns
  // { steps, outcomes, state }: steps has one { wire, outcome, probability, state } per
  // wire, outcomes is [result for q0, result for q1] with null for a wire that was not
  // measured, and state is the state after the last measurement.
  function measure(s, wires, random) {
    checkState(s);
    if (!Array.isArray(wires) || wires.length < 1 || wires.length > 2) {
      throw new Error("QedTwoQubit: measure needs a list of one or two wires");
    }
    wires.forEach(checkIndex);
    if (wires.length === 2 && wires[0] === wires[1]) throw new Error("QedTwoQubit: measure needs two different wires");
    if (typeof random !== "function") throw new Error("QedTwoQubit: measure needs a random function");
    var state = s;
    var steps = [];
    var outcomes = [null, null];
    wires.forEach(function (wire) {
      var own = marginals(state)[wire === 0 ? "q0" : "q1"];
      var outcome = random() < own[0] ? 0 : 1;
      if (own[outcome] <= EPS) outcome = 1 - outcome; // rounding at the very edge of the range
      var step = measureQubit(state, wire, outcome);
      state = step.state;
      outcomes[wire] = outcome;
      steps.push(step);
    });
    return { steps: steps, outcomes: outcomes, state: state };
  }

  // ---- text -----------------------------------------------------------------------
  function num(x, digits) {
    var t = Math.abs(x).toFixed(digits);
    return { text: t, negative: x < 0 && parseFloat(t) !== 0, zero: parseFloat(t) === 0 };
  }

  function term(z, ket, digits, first) {
    var isReal = Math.abs(z.im) < EPS;
    if (isReal) {
      var n = num(z.re, digits);
      if (first) return (n.negative ? "−" : "") + n.text + ket;
      return " " + (n.negative ? "−" : "+") + " " + n.text + ket;
    }
    var re = num(z.re, digits);
    var im = num(z.im, digits);
    var body = "(" + (re.negative ? "−" : "") + re.text + (im.negative ? " − " : " + ") + im.text + "i)" + ket;
    return first ? body : " + " + body;
  }

  // The written form with only the terms that are not zero, for example
  // "0.71|00⟩ + 0.71|11⟩". All amplitudes zero gives "0".
  function format(s, digits) {
    checkState(s);
    digits = digits === undefined ? 2 : digits;
    var out = "";
    for (var i = 0; i < 4; i++) {
      if (Math.sqrt(square(s[i])) < Math.pow(10, -digits) / 2) continue;
      out += term(s[i], "|" + LABELS[i] + "⟩", digits, out === "");
    }
    return out === "" ? "0" : out;
  }

  // A plain sentence about a state's joint probabilities, for aria text.
  function describe(s) {
    var p = probabilities(s);
    return LABELS.map(function (l, i) {
      return "outcome " + l + " " + Math.round(p[i] * 1000) / 10 + " percent";
    }).join(", ") + ".";
  }

  return {
    LABELS: LABELS,
    real: real,
    product: product,
    probabilities: probabilities,
    norm2: norm2,
    isNormalized: isNormalized,
    marginals: marginals,
    independentTable: independentTable,
    applyToQubit: applyToQubit,
    apply: apply,
    separability: separability,
    isProduct: isProduct,
    factor: factor,
    passesProductTest: passesProductTest,
    BELL: BELL,
    bellOf: bellOf,
    measureQubit: measureQubit,
    measure: measure,
    format: format,
    describe: describe,
  };
})();
