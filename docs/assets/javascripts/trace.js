// Shared circuit-trace module, used by Module 02 (02.06 Quantum Circuits first;
// 02.07 Measurement will sample from a circuit's final distribution) and available
// to any page that wants the state after each step of a small circuit.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op
// on pages that don't call it. Page scripts that use window.QedTrace must run
// inside a DOMContentLoaded listener.
//
// This is the one shared module whose whole job is composition. It runs a
// circuit, as plain data from QedCircuit, through the gates of QedGates and the
// two-qubit state of QedTwoQubit, and names the state with QedQubit. So it reads
// window.QedGates, window.QedTwoQubit, window.QedQubit, and window.QedCircuit when
// called, not when loaded (the tests load them into one stub window).
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   model   -> run(), columnMatrix(): pure functions of a circuit and its initial
//              states. No DOM.
//   wiring  -> left to each page
//
// Scope, on purpose: two wires, in the order 00, 01, 10, 11 with q0 the left digit
// and the top wire. A measurement op does not change the state: it marks its wire as
// read out, and the probabilities at that step are what a measurement there would
// show (not a result, and not a state update; that belongs to 02.07). Gates on the
// other wire may follow, since they commute with a Z-basis measurement of a different
// qubit.
window.QedTrace = (function () {
  function modules() {
    var G = window.QedGates;
    var T = window.QedTwoQubit;
    var Q = window.QedQubit;
    var C = window.QedCircuit;
    if (!G || !T || !Q || !C) throw new Error("QedTrace needs QedGates, QedTwoQubit, QedQubit, and QedCircuit");
    return { G: G, T: T, Q: Q, C: C };
  }

  // The QedGates gate for a drawn gate op. A rotation op has gateId rx, ry, or rz
  // and an angle in degrees.
  function gateOf(op) {
    var G = modules().G;
    var id = op.gateId;
    if (typeof id === "string" && id.length === 2 && id.charAt(0) === "r" && "xyz".indexOf(id.charAt(1)) >= 0) {
      return G.rotation(id.charAt(1), op.angleDeg);
    }
    return G.gate(id === undefined && op.type === "h" ? "h" : id);
  }

  // The 4x4 matrix of one op on the two wires.
  function opMatrix(op) {
    var m = modules();
    if (op.type === "cx") return m.G.cnot(op.control).matrix;
    var g = gateOf(op);
    var I = m.G.gate("i").matrix;
    return op.targets[0] === 0 ? m.G.kron(g.matrix, I) : m.G.kron(I, g.matrix);
  }

  // The 4x4 matrix of a whole column (several ops on different wires). Measurement
  // ops do not change the state. The ops in a column act on different wires, so their
  // order does not matter.
  function columnMatrix(ops) {
    var G = modules().G;
    var M = G.identity(4);
    ops.forEach(function (op) {
      if (op.type === "measure") return;
      M = G.compose([{ matrix: M }, { matrix: opMatrix(op) }]).matrix;
    });
    return M;
  }

  // A name for a two-qubit state: independent qubits each named when they are one of
  // the named states, a Bell state, or "an entangled state".
  function describeState(state) {
    var m = modules();
    var f = m.T.factor(state);
    if (f) {
      var a = m.Q.nameOf(f.q0);
      var b = m.Q.nameOf(f.q1);
      return {
        kind: "product",
        q0: a ? a.name : null,
        q1: b ? b.name : null,
        text: "q₀ in " + (a ? a.name : "a state with no name") + " and q₁ in " + (b ? b.name : "a state with no name"),
      };
    }
    var bell = m.T.bellOf(state);
    if (bell) return { kind: "bell", bell: bell.id, text: bell.name };
    return { kind: "entangled", text: "an entangled state" };
  }

  // Run a circuit from the two initial one-qubit states (QedQubit's shape; default
  // |0> and |0>). Returns { steps, final, measuredWires, readout }. steps[0] is the
  // start and there is one step after it for every column that has something in it.
  // Each step has: column (null for the start), label, ops, state, probabilities,
  // name, matrix (null for the start), and measured (the wires read out by then).
  // Throws when the circuit breaks a rule in QedCircuit.validate.
  function run(circuit, initial) {
    var m = modules();
    var check = m.C.validate(circuit);
    if (!check.ok) throw new Error("QedTrace: " + check.problems[0]);
    var zero = m.Q.PRESETS.filter(function (p) { return p.id === "zero"; })[0].state;
    var start = initial || [zero, zero];
    var state = m.T.product(start[0], start[1]);
    var measured = [];
    function step(column, label, ops, matrix) {
      return {
        column: column,
        label: label,
        ops: ops,
        state: state,
        probabilities: m.T.probabilities(state),
        name: describeState(state),
        matrix: matrix,
        measured: measured.slice(),
      };
    }
    var steps = [step(null, "start", [], null)];
    m.C.columns(circuit).forEach(function (ops, col) {
      if (!ops.length) return;
      var matrix = columnMatrix(ops);
      state = m.T.apply({ matrix: matrix }, state);
      ops.forEach(function (op) {
        if (op.type === "measure" && measured.indexOf(op.targets[0]) < 0) measured.push(op.targets[0]);
      });
      var label = "after step " + (col + 1) + ": " + m.C.summarize({ qubits: circuit.qubits, ops: ops });
      steps.push(step(col, label, ops, matrix));
    });
    return {
      steps: steps,
      final: steps[steps.length - 1],
      measuredWires: measured.slice(),
      readout: measured.length > 0,
    };
  }

  return {
    run: run,
    columnMatrix: columnMatrix,
    describeState: describeState,
    gateOf: gateOf,
  };
})();
