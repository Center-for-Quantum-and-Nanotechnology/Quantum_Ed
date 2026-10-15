// Shared minimal circuit module, used by
// docs/05-software-stack/understanding-the-quantum-software-stack.md and
// intended for the other Module 05 pages, which all show the same recurring
// Bell-state circuit in different forms.
//
// Loaded site-wide via extra_javascript (like surface-code.js) since MkDocs
// pages are separate documents, not a single-page app. It is a no-op on pages
// that don't call it. Any page script that uses window.QedCircuit must run
// inside a DOMContentLoaded listener, because Material injects
// extra_javascript files after inline page content.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   circuit data -> plain objects: { qubits: [...], ops: [...] }
//   rendering    -> renderSVG(circuit, opts) is a pure function returning an
//                   SVG string, drawn with the shared .qed-circuit-* classes
//   DOM wiring   -> left to each page
//
// Deliberately small. It draws a few gate glyphs (H, CNOT, measure, and a
// generic labelled single-qubit box) on horizontal wires and nothing else; it is
// not a general circuit renderer.
//
// It also holds the circuit as editable data, for the Module 02 circuit builder
// (02.06): emptyCircuit, place, remove, opAt, validate, columns, and summarize.
// These are pure and depend on nothing. A circuit is { qubits, ops, maxColumns? }
// and every op that the builder places has a column (`col`, from 0):
//   { type: "gate", gateId, label, name, targets: [wire], col, angleDeg? }
//   { type: "cx", control, target, col }
//   { type: "measure", targets: [wire], col }
// The gateId links a drawn gate to QedGates, which QedTrace uses to run it. The
// rules in validate() are the ones the builder shows the learner.
// Older circuit drawings on other pages are page-local SVG and are not
// migrated here.
window.QedCircuit = (function () {
  var COL_W = 48;
  var ROW_H = 40;
  var LEFT = 36;
  var TOP = 22;

  var SUBSCRIPTS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

  function qubitName(i) {
    return "q" + (i < 10 ? SUBSCRIPTS[i] : i);
  }

  // The recurring teaching example: prepare a Bell state, then measure both
  // qubits. Each op may set `col` to share a column with another op;
  // otherwise it takes the next free column.
  function bell() {
    return {
      qubits: ["q0", "q1"],
      ops: [
        { type: "h", targets: [0], col: 0 },
        { type: "cx", control: 0, target: 1, col: 1 },
        { type: "measure", targets: [0], col: 2 },
        { type: "measure", targets: [1], col: 2 },
      ],
    };
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function opColumns(circuit) {
    var next = 0;
    return circuit.ops.map(function (op) {
      var col = typeof op.col === "number" ? op.col : next;
      next = Math.max(next, col + 1);
      return col;
    });
  }

  // Plain-language description for aria-labels and text alternatives.
  function describe(circuit) {
    var n = circuit.qubits.length;
    var parts = circuit.ops.map(function (op) {
      if (op.type === "h") return "a Hadamard gate on " + qubitName(op.targets[0]);
      if (op.type === "cx") return "a controlled-NOT with control " + qubitName(op.control) + " and target " + qubitName(op.target);
      if (op.type === "measure") return "a measurement of " + qubitName(op.targets[0]);
      if (op.type === "gate") return "a " + (op.name || op.label) + " gate on " + qubitName(op.targets[0]);
      return "an operation";
    });
    return "Circuit on " + n + " qubits: " + parts.join(", then ") + ".";
  }

  function glyphH(x, y, boxClass) {
    return (
      '<rect class="' + boxClass + '" x="' + (x - 13) + '" y="' + (y - 12) + '" width="26" height="24" rx="3" />' +
      '<text class="qed-circuit-label" x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">H</text>'
    );
  }

  // A generic single-qubit gate box with a text label (I, X, Y, Z, S, T, or a
  // rotation such as "Rx(60°)"). The box grows with the label.
  function gateBoxWidth(label) {
    return Math.max(26, 7 * String(label).length + 12);
  }

  function glyphGate(x, y, label, boxClass) {
    var w = gateBoxWidth(label);
    return (
      '<rect class="' + boxClass + '" x="' + (x - w / 2) + '" y="' + (y - 12) + '" width="' + w + '" height="24" rx="3" />' +
      '<text class="qed-circuit-label" x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + esc(label) + "</text>"
    );
  }

  function glyphCX(x, yc, yt) {
    return (
      '<g class="qed-circuit-gate">' +
      '<line class="qed-circuit-connector" x1="' + x + '" y1="' + yc + '" x2="' + x + '" y2="' + yt + '" />' +
      '<circle class="qed-circuit-control" cx="' + x + '" cy="' + yc + '" r="4" />' +
      '<circle class="qed-circuit-target" cx="' + x + '" cy="' + yt + '" r="9" />' +
      '<line class="qed-circuit-target-cross" x1="' + (x - 9) + '" y1="' + yt + '" x2="' + (x + 9) + '" y2="' + yt + '" />' +
      '<line class="qed-circuit-target-cross" x1="' + x + '" y1="' + (yt - 9) + '" x2="' + x + '" y2="' + (yt + 9) + '" />' +
      "</g>"
    );
  }

  // Meter glyph: a box holding a small arc and needle.
  function glyphMeasure(x, y) {
    return (
      '<rect class="qed-circuit-measure-box" x="' + (x - 13) + '" y="' + (y - 12) + '" width="26" height="24" rx="3" />' +
      '<path class="qed-circuit-wire" fill="none" d="M ' + (x - 7) + " " + (y + 5) + " A 8 8 0 0 1 " + (x + 7) + " " + (y + 5) + '" />' +
      '<line class="qed-circuit-wire" x1="' + x + '" y1="' + (y + 5) + '" x2="' + (x + 5) + '" y2="' + (y - 5) + '" />'
    );
  }

  // opts: { idPrefix, ariaLabel (defaults to describe(circuit)), neutral }
  // neutral draws every gate box in the page's neutral line color instead of the
  // logical-information blue, for pages (Module 02) that do not use Module 07's
  // color meanings. A circuit with no generic gate ops and no neutral option is
  // drawn exactly as before.
  function renderSVG(circuit, opts) {
    opts = opts || {};
    var n = circuit.qubits.length;
    var cols = opColumns(circuit);
    var maxCol = cols.reduce(function (m, c) { return Math.max(m, c); }, 0);
    var colW = COL_W;
    circuit.ops.forEach(function (op) {
      if (op.type === "gate") colW = Math.max(colW, gateBoxWidth(op.label) + 14);
    });
    var boxClass = "qed-circuit-gate-box" + (opts.neutral ? " qed-circuit-gate-box--neutral" : "");
    var width = LEFT + (maxCol + 1) * colW + 20;
    var height = TOP + (n - 1) * ROW_H + 26;
    function yOf(i) { return TOP + i * ROW_H; }
    function xOf(col) { return LEFT + 10 + col * colW + colW / 2 - 10; }

    var out = [];
    out.push(
      '<svg class="qed-circuit-svg"' + (opts.idPrefix ? ' id="' + esc(opts.idPrefix) + '-svg"' : "") +
      ' viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height + '" role="img" aria-label="' +
      esc(opts.ariaLabel || describe(circuit)) + '">'
    );
    for (var i = 0; i < n; i++) {
      out.push('<line class="qed-circuit-wire" x1="' + LEFT + '" y1="' + yOf(i) + '" x2="' + (width - 8) + '" y2="' + yOf(i) + '" />');
      out.push('<text class="qed-circuit-label" x="' + (LEFT - 8) + '" y="' + (yOf(i) + 4) + '" text-anchor="end">' + esc(qubitName(i)) + "</text>");
    }
    circuit.ops.forEach(function (op, k) {
      var x = xOf(cols[k]);
      if (op.type === "h") out.push(glyphH(x, yOf(op.targets[0]), boxClass));
      else if (op.type === "gate") out.push(glyphGate(x, yOf(op.targets[0]), op.label, boxClass));
      else if (op.type === "cx") out.push(glyphCX(x, yOf(op.control), yOf(op.target)));
      else if (op.type === "measure") out.push(glyphMeasure(x, yOf(op.targets[0])));
    });
    out.push("</svg>");
    return out.join("");
  }


  // ---- the circuit as editable data -----------------------------------------------
  var WIRES = 2;

  function wiresOf(op) {
    return op.type === "cx" ? [op.control, op.target] : op.targets;
  }

  function stepText(col) {
    return "step " + (col + 1);
  }

  // A circuit with two wires, q0 on top, and room for `columns` steps.
  function emptyCircuit(columns) {
    return { qubits: ["q0", "q1"], ops: [], maxColumns: columns === undefined ? 5 : columns };
  }

  // The op that occupies this wire in this column, or null. A CNOT occupies both of
  // its wires.
  function opAt(circuit, wire, col) {
    for (var i = 0; i < circuit.ops.length; i++) {
      var op = circuit.ops[i];
      if (op.col === col && wiresOf(op).indexOf(wire) >= 0) return op;
    }
    return null;
  }

  function thing(op) {
    return op.type === "cx" ? "a CNOT" : op.type === "measure" ? "a measurement" : "a gate";
  }

  // Check a circuit against the builder's rules and return { ok, problems } with
  // each problem as a plain sentence. Ops are taken in order, so an op later in the
  // list is the one reported when two ops clash.
  function validate(circuit) {
    var problems = [];
    var max = circuit.maxColumns;
    var seen = {};
    circuit.ops.forEach(function (op) {
      var wires = wiresOf(op);
      var col = op.col;
      if (typeof col !== "number" || col < 0 || col !== Math.floor(col)) {
        problems.push("Every operation needs a step number.");
        return;
      }
      if (max !== undefined && col >= max) {
        problems.push("The circuit has " + max + " steps at most.");
        return;
      }
      if (op.type === "cx" && op.control === op.target) {
        problems.push("A CNOT's control and target must be different wires.");
        return;
      }
      var bad = wires.some(function (w) { return typeof w !== "number" || w < 0 || w >= circuit.qubits.length; });
      if (bad) {
        problems.push("That wire does not exist.");
        return;
      }
      wires.forEach(function (w) {
        var key = w + ":" + col;
        var other = seen[key];
        if (other) {
          if (op.type === "cx") {
            problems.push("A CNOT needs both wires in its column, and " + qubitName(w) + " already has " + thing(other) + " in " + stepText(col) + ".");
          } else if (other.type === "cx") {
            problems.push(qubitName(w) + " is already part of the CNOT in " + stepText(col) + ".");
          } else {
            problems.push(qubitName(w) + " already has " + thing(other) + " in " + stepText(col) + ".");
          }
        } else {
          seen[key] = op;
        }
      });
    });
    // a measurement is the last thing on its wire
    circuit.ops.forEach(function (m) {
      if (m.type !== "measure") return;
      var w = m.targets[0];
      circuit.ops.forEach(function (op) {
        if (op === m || op.col === undefined || op.col <= m.col || wiresOf(op).indexOf(w) < 0) return;
        if (op.type === "cx") {
          problems.push("A CNOT cannot come after a measurement on a wire it uses (" + qubitName(w) + " is measured in " + stepText(m.col) + ").");
        } else {
          problems.push(qubitName(w) + " is measured in " + stepText(m.col) + ", and a measurement must be the last thing on its wire.");
        }
      });
    });
    return { ok: problems.length === 0, problems: problems };
  }

  // Add an op. Returns { ok, circuit, problem }: a new circuit when the placement is
  // allowed, and otherwise the circuit unchanged with a plain sentence saying why.
  // Never mutates the circuit it is given.
  function place(circuit, op) {
    var next = {
      qubits: circuit.qubits,
      maxColumns: circuit.maxColumns,
      ops: circuit.ops.concat([op]),
    };
    var result = validate(next);
    if (!result.ok) return { ok: false, circuit: circuit, problem: result.problems[0] };
    return { ok: true, circuit: next, problem: "" };
  }

  // Remove whatever occupies this wire in this column (all of a CNOT). Returns a new
  // circuit, or the same one when the cell is empty.
  function remove(circuit, wire, col) {
    var hit = opAt(circuit, wire, col);
    if (!hit) return circuit;
    return {
      qubits: circuit.qubits,
      maxColumns: circuit.maxColumns,
      ops: circuit.ops.filter(function (op) { return op !== hit; }),
    };
  }

  // The ops grouped by column: an array whose entry c holds the ops in column c
  // (empty for a column with nothing in it), up to the last column used.
  function columns(circuit) {
    var cols = [];
    var cur = opColumns(circuit);
    circuit.ops.forEach(function (op, k) {
      while (cols.length <= cur[k]) cols.push([]);
      cols[cur[k]].push(op);
    });
    return cols;
  }

  function phrase(op) {
    if (op.type === "cx") return "CNOT with control " + qubitName(op.control) + " and target " + qubitName(op.target);
    if (op.type === "measure") return "a measurement of " + qubitName(op.targets[0]);
    if (op.type === "h") return "H on " + qubitName(op.targets[0]);
    return (op.name || op.label) + " on " + qubitName(op.targets[0]);
  }

  // One plain line for the whole circuit, step by step: "H on q₀, then CNOT with
  // control q₀ and target q₁, then a measurement of both". Gates in the same step
  // are joined with "and".
  function summarize(circuit) {
    var steps = columns(circuit).filter(function (c) { return c.length > 0; });
    if (!steps.length) return "No gates yet.";
    return steps.map(function (ops) {
      var measures = ops.filter(function (o) { return o.type === "measure"; });
      var others = ops.filter(function (o) { return o.type !== "measure"; }).map(phrase);
      if (measures.length === circuit.qubits.length) others.push("a measurement of both");
      else measures.forEach(function (m) { others.push(phrase(m)); });
      return others.join(" and ");
    }).join(", then ");
  }

  return {
    bell: bell,
    describe: describe,
    renderSVG: renderSVG,
    qubitName: qubitName,
    emptyCircuit: emptyCircuit,
    opAt: opAt,
    validate: validate,
    place: place,
    remove: remove,
    columns: columns,
    summarize: summarize,
  };
})();
