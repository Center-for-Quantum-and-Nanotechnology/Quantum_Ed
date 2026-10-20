// Shared module for Module 05's program transformations: small invented targets as
// data, and the rewrites that adapt a circuit to a target. Used by
// docs/05-software-stack/compilation-and-transpilation.md (05.03) and intended for
// 05.04 (a target's description grows into a backend description) and 05.07
// (workflows with alternative targets).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on
// pages that don't call it. Page scripts that use window.QedTransform must run inside
// a DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> TARGETS (data), adapt(), optimize(), cost(), changes(): pure functions
//                of a circuit and a target. No DOM, and no other module is called.
//   text      -> every rewrite returns its steps as plain sentences that name the
//                limit that caused them
//   rendering -> none: the page draws circuits with QedCircuit and lists them with
//                QedProgramForms
//
// A circuit has the shape QedCircuit draws and QedProgramForms lists, with an `id` on
// each op: { qubits, ops }, where an op is
//   { id, type: "h", targets: [wire], col? }
//   { id, type: "gate", gateId, label, targets: [wire], col?, angleDeg? }
//   { id, type: "cx", control, target, col? }
//   { id, type: "measure", targets: [wire], col? }
// Exactly two wires are supported today (the targets here are two-qubit). Routing on
// larger devices is Intermediate and is not here.
//
// The three rewrites are the only ones, on purpose:
//   - H as three turns (z by 90 degrees, x by 90 degrees, z by 90 degrees), for a
//     target with no H. Equal to H up to a global phase.
//   - a CNOT turned round (H on both qubits, the CNOT the other way, H on both again),
//     for a target that allows the CNOT only one way. Exact.
//   - cancelling a pair that undoes itself (two H, X, or Z in a row on one qubit, or the
//     same CNOT twice in a row). Exact.
// The tests prove each against QedTrace, which simulates the circuit.
//
// The targets are invented for the teaching page. They are not real devices and not any
// vendor's, and they carry a `synthetic` flag to say so. Functions never mutate their
// arguments.
window.QedTransform = (function () {
  var SUBSCRIPTS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

  function qname(i) {
    return "q" + SUBSCRIPTS[i];
  }

  // ---- the targets, as data ---------------------------------------------------------
  // allows.oneQubit lists the single-qubit gate ids the target runs directly ("h", "x",
  // "z", "rx", "rz"); allows.twoQubit lists the CNOT directions it allows as
  // { control, target }. Every target here also allows measurement. Reserved for later:
  // targets with more than two qubits, and fields that 05.04 will add.
  var TARGETS = [
    {
      id: "open",
      name: "Open",
      synthetic: true,
      description: "Allows H, X, and Z, and a CNOT in either direction. There is nothing to adapt.",
      allows: { oneQubit: ["h", "x", "z"], twoQubit: [{ control: 0, target: 1 }, { control: 1, target: 0 }] },
    },
    {
      id: "one-way",
      name: "One-way CNOT",
      synthetic: true,
      description: "Allows H, X, and Z, and a CNOT only from q₁ to q₀.",
      allows: { oneQubit: ["h", "x", "z"], twoQubit: [{ control: 1, target: 0 }] },
    },
    {
      id: "rotations",
      name: "Rotations",
      synthetic: true,
      description: "Allows turns about the x axis and the z axis, and a CNOT only from q₀ to q₁. It has no H.",
      allows: { oneQubit: ["rx", "rz"], twoQubit: [{ control: 0, target: 1 }] },
    },
  ];

  function targetById(id) {
    var hit = TARGETS.filter(function (t) { return t.id === id; })[0];
    if (!hit) throw new Error("QedTransform: there is no target called " + id);
    return hit;
  }

  // ---- reading an op -----------------------------------------------------------------
  function wiresOf(op) {
    return op.type === "cx" ? [op.control, op.target] : op.targets;
  }

  // The column of each op, as QedCircuit draws it: an op with no `col` takes the next
  // free column.
  function columnsOf(circuit) {
    var next = 0;
    return circuit.ops.map(function (op) {
      var col = typeof op.col === "number" ? op.col : next;
      next = Math.max(next, col + 1);
      return col;
    });
  }

  // The ops in the order they act: by column, and as given within a column.
  function orderedOps(circuit) {
    var cols = columnsOf(circuit);
    return circuit.ops
      .map(function (op, k) { return { op: op, col: cols[k], index: k }; })
      .sort(function (a, b) { return a.col - b.col || a.index - b.index; })
      .map(function (e) { return e.op; });
  }

  // The id of a single-qubit gate op in the target's vocabulary ("h", "x", "rz", ...),
  // or null for a CNOT or a measurement.
  function gateIdOf(op) {
    if (op.type === "h") return "h";
    if (op.type === "gate") return op.gateId;
    return null;
  }

  function degText(angleDeg) {
    return String(Math.round(angleDeg * 10) / 10) + "°";
  }

  function opText(op) {
    if (op.type === "cx") return "CNOT " + qname(op.control) + "→" + qname(op.target);
    if (op.type === "measure") return "measure " + qname(op.targets[0]);
    var id = gateIdOf(op);
    return (id === "h" ? "H" : op.label || String(id).toUpperCase()) + " on " + qname(op.targets[0]);
  }

  function listText(items) {
    if (items.length < 2) return items.join("");
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  // ---- placing ops in columns ---------------------------------------------------------
  // Give a list of ops (in the order they act) the earliest column each can take: after
  // the last op on any wire it uses. Every measurement goes in the last measurement
  // column, so a circuit that measures both qubits keeps them in one column. Returns
  // new ops; the inputs are not changed.
  function place(ops) {
    var last = {};
    var placed = ops.map(function (op) {
      var col = 0;
      wiresOf(op).forEach(function (w) {
        if (last[w] !== undefined) col = Math.max(col, last[w] + 1);
      });
      wiresOf(op).forEach(function (w) { last[w] = col; });
      return Object.assign({}, op, { col: col });
    });
    var measureCol = placed.reduce(function (m, op) { return op.type === "measure" ? Math.max(m, op.col) : m; }, -1);
    if (measureCol >= 0) {
      placed.forEach(function (op) { if (op.type === "measure") op.col = measureCol; });
    }
    return placed;
  }

  function copyOps(circuit) {
    return orderedOps(circuit).map(function (op) { return Object.assign({}, op); });
  }

  function newCircuit(circuit, ops) {
    var out = { qubits: circuit.qubits, ops: ops };
    if (circuit.maxColumns !== undefined) out.maxColumns = circuit.maxColumns;
    return out;
  }

  // ---- what a target allows ------------------------------------------------------------
  function allowsGate(target, id) {
    return target.allows.oneQubit.indexOf(id) >= 0;
  }

  function allowsCnot(target, control, to) {
    return target.allows.twoQubit.some(function (d) { return d.control === control && d.target === to; });
  }

  function directionsText(target) {
    var list = target.allows.twoQubit.map(function (d) { return qname(d.control) + " to " + qname(d.target); });
    return list.length ? "a CNOT " + (list.length === 1 ? "only from " + list[0] : "from " + listText(list)) : "no CNOT";
  }

  // ---- the rewrites ----------------------------------------------------------------------
  function turn(axis, id, wire) {
    return { id: id, type: "gate", gateId: "r" + axis, label: "R" + axis + "(" + degText(90) + ")", name: "R" + axis.toUpperCase() + "(" + degText(90) + ")", angleDeg: 90, targets: [wire] };
  }

  // The ops that replace `op` for this target, or null when the target allows it as it
  // is. Returns { ops, text } with the reason in the text, or { problem } when the target
  // cannot be adapted to. Each new op gets an id made from the replaced one's.
  function rewrite(op, target) {
    var id = gateIdOf(op);
    if (id !== null) {
      if (allowsGate(target, id)) return null;
      if (id === "h" && allowsGate(target, "rx") && allowsGate(target, "rz")) {
        var w = op.targets[0];
        var parts = [turn("z", op.id + "-1", w), turn("x", op.id + "-2", w), turn("z", op.id + "-3", w)];
        return {
          ops: parts,
          rule: "h-as-turns",
          text: "Replaced " + opText(op) + " with " + listText(parts.map(function (p) { return p.label; })) + ", because this target has no H.",
        };
      }
      return { problem: "This target does not allow " + opText(op) + ", and there is no rewrite for it here." };
    }
    if (op.type === "cx") {
      if (allowsCnot(target, op.control, op.target)) return null;
      if (!allowsCnot(target, op.target, op.control)) {
        return { problem: "This target allows no CNOT between " + qname(0) + " and " + qname(1) + "." };
      }
      var c = op.control;
      var t = op.target;
      var turned = [
        { id: op.id + "-1", type: "h", targets: [c] },
        { id: op.id + "-2", type: "h", targets: [t] },
        { id: op.id + "-3", type: "cx", control: t, target: c },
        { id: op.id + "-4", type: "h", targets: [c] },
        { id: op.id + "-5", type: "h", targets: [t] },
      ];
      return {
        ops: turned,
        rule: "cnot-turned-round",
        text: "Replaced " + opText(op) + " with H on both qubits, " + opText(turned[2]) + ", then H on both qubits again, because this target allows " + directionsText(target) + ".",
      };
    }
    return null; // measurement: every target here allows it
  }

  // Adapt a circuit to a target. Returns { circuit, steps, problems, ok }. The circuit
  // is a new one; when the target needs no change it is a copy of the original with
  // the same columns and steps is empty. Each step is
  //   { rule, text, removed: [the id of the op replaced], added: [the ids of the ops that replace it] }
  // A rewrite is applied only when the target needs it. A rewrite's own ops are checked
  // against the target too (a turned-round CNOT brings in H, which the target may not
  // allow).
  function adapt(circuit, target) {
    var steps = [];
    var problems = [];
    var out = [];
    function emit(op) {
      var r = rewrite(op, target);
      if (r === null) { out.push(op); return; }
      if (r.problem) { problems.push(r.problem); out.push(op); return; }
      steps.push({ rule: r.rule, text: r.text, removed: [op.id], added: r.ops.map(function (n) { return n.id; }) });
      r.ops.forEach(emit);
    }
    orderedOps(circuit).forEach(function (op) { emit(Object.assign({}, op)); });

    if (steps.length === 0) {
      return { circuit: newCircuit(circuit, copyOps(circuit)), steps: [], problems: problems, ok: problems.length === 0 };
    }
    return { circuit: newCircuit(circuit, place(out)), steps: steps, problems: problems, ok: problems.length === 0 };
  }

  // ---- cancelling pairs that undo themselves -----------------------------------------------
  function selfInverse(op) {
    var id = gateIdOf(op);
    if (id !== null) return id === "h" || id === "x" || id === "z";
    return op.type === "cx";
  }

  function sameOp(a, b) {
    if (a.type === "cx" && b.type === "cx") return a.control === b.control && a.target === b.target;
    var ia = gateIdOf(a);
    return ia !== null && ia === gateIdOf(b) && a.targets[0] === b.targets[0];
  }

  // The first pair of ops, a then b, that undo each other: the same self-inverse op,
  // with nothing else on any wire they use in between. Returns [i, j] (indices into
  // `ops`) or null.
  function findPair(ops) {
    for (var j = 0; j < ops.length; j++) {
      var b = ops[j];
      if (!selfInverse(b)) continue;
      var prev = wiresOf(b).map(function (w) {
        for (var i = j - 1; i >= 0; i--) if (wiresOf(ops[i]).indexOf(w) >= 0) return i;
        return -1;
      });
      var i0 = prev[0];
      if (i0 < 0 || prev.some(function (p) { return p !== i0; })) continue;
      var a = ops[i0];
      if (selfInverse(a) && sameOp(a, b)) return [i0, j];
    }
    return null;
  }

  // Cancel every pair that undoes itself (repeating, since removing one pair can bring
  // another together). Returns { circuit, steps }, with a step for each pair:
  //   { rule: "cancel", text, removed: [two ids], added: [] }
  function optimize(circuit) {
    var ops = copyOps(circuit);
    var steps = [];
    var pair = findPair(ops);
    while (pair) {
      var a = ops[pair[0]];
      var b = ops[pair[1]];
      var what = a.type === "cx" ? "the same CNOT twice in a row" : "two " + opText(a).split(" on ")[0] + " in a row on " + qname(a.targets[0]);
      steps.push({
        rule: "cancel",
        text: "Cancelled " + opText(a) + " and " + opText(b) + ", because " + what + " undo each other.",
        removed: [a.id, b.id],
        added: [],
      });
      ops = ops.filter(function (_, k) { return k !== pair[0] && k !== pair[1]; });
      pair = findPair(ops);
    }
    if (steps.length === 0) return { circuit: newCircuit(circuit, copyOps(circuit)), steps: [] };
    return { circuit: newCircuit(circuit, place(ops)), steps: steps };
  }

  // ---- cost and changes ------------------------------------------------------------------------
  // How many operations a circuit has, and how many of them use two qubits. Measurements
  // are counted apart and never change under a rewrite.
  function cost(circuit) {
    var c = { operations: 0, twoQubit: 0, measurements: 0 };
    circuit.ops.forEach(function (op) {
      if (op.type === "measure") c.measurements += 1;
      else {
        c.operations += 1;
        if (op.type === "cx") c.twoQubit += 1;
      }
    });
    return c;
  }

  // What changed between a circuit and one made from it: the ids only in the original
  // (`removed`) and the ids only in the result (`added`).
  function changes(before, after) {
    var inBefore = {};
    var inAfter = {};
    before.ops.forEach(function (op) { inBefore[op.id] = true; });
    after.ops.forEach(function (op) { inAfter[op.id] = true; });
    return {
      removed: before.ops.filter(function (op) { return !inAfter[op.id]; }).map(function (op) { return op.id; }),
      added: after.ops.filter(function (op) { return !inBefore[op.id]; }).map(function (op) { return op.id; }),
    };
  }

  // Everything the page shows for one target: the adapted circuit, the circuit after
  // cancelling, both with their steps, costs, and changes. One call, so a table of all the
  // targets and the explorer read the same numbers.
  function transform(circuit, target) {
    var a = adapt(circuit, target);
    var o = optimize(a.circuit);
    return {
      target: target,
      original: circuit,
      adapted: a.circuit,
      adaptSteps: a.steps,
      problems: a.problems,
      ok: a.ok,
      optimized: o.circuit,
      optimizeSteps: o.steps,
      costs: { original: cost(circuit), adapted: cost(a.circuit), optimized: cost(o.circuit) },
      changesAdapted: changes(circuit, a.circuit),
      changesOptimized: changes(circuit, o.circuit),
    };
  }

  return {
    TARGETS: TARGETS,
    targetById: targetById,
    adapt: adapt,
    optimize: optimize,
    cost: cost,
    changes: changes,
    transform: transform,
    opText: opText,
    directionsText: directionsText,
  };
})();
