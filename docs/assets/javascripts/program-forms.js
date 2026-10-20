// Shared module for Module 05's program representations: one computation, written
// as operations with ids, and the forms that can be derived from it. Used by
// docs/05-software-stack/quantum-program-representations.md (05.02) and intended for
// 05.03 (the same computation after transformation), 05.06 (the form of a job), and
// 05.07 (end-to-end workflows).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on
// pages that don't call it. Page scripts that use window.QedProgramForms must run
// inside a DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> the computation as data, and what follows from it: the ordered
//                instruction list, the dependencies between operations, where one
//                operation sits in each form, and whether two computations are the
//                same. Pure functions, no DOM.
//   text      -> plain sentences for aria text and for the page's side panel
//   rendering -> *HTML() and *SVG() functions that return strings
//   wiring    -> left to each page
//
// A computation has the same shape as a QedCircuit circuit: { qubits, ops }, with an
// `id` on each op (strings, unique within the computation):
//   { id, type: "h", targets: [wire], col? }
//   { id, type: "cx", control, target, col? }
//   { id, type: "measure", targets: [wire], col? }
//   { id, type: "gate", label, targets: [wire], col? }
// so the same object can be drawn by QedCircuit.renderSVG. This module does not call
// QedCircuit; it only reads the shape.
//
// The forms are illustrative teaching forms. They are not real file formats and not
// any vendor's syntax. Functions never mutate their arguments.
window.QedProgramForms = (function () {
  var SUBSCRIPTS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

  function qname(i) {
    return "q" + String(i).split("").map(function (d) { return SUBSCRIPTS[Number(d)]; }).join("");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- the computation ----------------------------------------------------------------
  // The recurring example: prepare a Bell state, then measure both qubits. Same
  // operations and columns as QedCircuit.bell(), with ids.
  function bell() {
    return {
      qubits: ["q0", "q1"],
      ops: [
        { id: "h1", type: "h", targets: [0], col: 0 },
        { id: "cx1", type: "cx", control: 0, target: 1, col: 1 },
        { id: "m0", type: "measure", targets: [0], col: 2 },
        { id: "m1", type: "measure", targets: [1], col: 2 },
      ],
    };
  }

  // The same computation with an id on every op: existing ids are kept, and an op
  // without one gets "op" and its place in the list.
  function withIds(circuit) {
    return {
      qubits: circuit.qubits,
      ops: circuit.ops.map(function (op, k) {
        return op.id !== undefined ? op : Object.assign({}, op, { id: "op" + (k + 1) });
      }),
    };
  }

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

  // The ops in the order a piece of software would take them: by column, and in the
  // order given within a column. Each entry is { op, col, index }.
  function ordered(circuit) {
    var cols = columnsOf(circuit);
    return circuit.ops
      .map(function (op, k) { return { op: op, col: cols[k], index: k }; })
      .sort(function (a, b) { return a.col - b.col || a.index - b.index; });
  }

  function find(circuit, id) {
    var hit = ordered(circuit).filter(function (e) { return e.op.id === id; })[0];
    if (!hit) throw new Error("QedProgramForms: there is no operation with the id " + id);
    return hit;
  }

  // ---- names ---------------------------------------------------------------------------
  function opName(op) {
    if (op.type === "h") return "H";
    if (op.type === "cx") return "CNOT";
    if (op.type === "measure") return "Measure";
    return op.label || op.name || "Gate";
  }

  // "CNOT, step 2": the label the page shows on the same operation in every form. A
  // measurement also says which wire, as QedCircuit's highlight does.
  function opLabel(op, circuit) {
    var step = find(circuit, op.id).col + 1;
    var name = op.type === "measure" ? opName(op) + " " + qname(op.targets[0]) : opName(op);
    return name + ", step " + step;
  }

  function describeOp(op) {
    if (op.type === "h") return "H on " + qname(op.targets[0]);
    if (op.type === "cx") return "CNOT with control " + qname(op.control) + " and target " + qname(op.target);
    if (op.type === "measure") return "measurement of " + qname(op.targets[0]);
    return opName(op) + " on " + qname(op.targets[0]);
  }

  // One line of the illustrative instruction list: "H q₀", "CNOT q₀, q₁", "MEASURE q₀".
  function instructionText(op) {
    if (op.type === "cx") return "CNOT " + qname(op.control) + ", " + qname(op.target);
    if (op.type === "measure") return "MEASURE " + qname(op.targets[0]);
    return opName(op) + " " + qname(op.targets[0]);
  }

  // ---- the ordered instruction list ----------------------------------------------------
  // [{ line (from 1), id, text, step }]
  function instructionList(circuit) {
    return ordered(circuit).map(function (e, k) {
      return { line: k + 1, id: e.op.id, text: instructionText(e.op), step: e.col + 1 };
    });
  }

  // ---- dependencies ---------------------------------------------------------------------
  // An operation must follow the previous operation on each qubit it uses. Returns
  // [{ from, to, wires }] with one entry per pair of ops (wires lists the shared
  // qubits), in the order of `to` in the instruction list.
  function dependencies(circuit) {
    var last = {};
    var edges = [];
    ordered(circuit).forEach(function (e) {
      var byFrom = {};
      wiresOf(e.op).forEach(function (w) {
        var prev = last[w];
        if (prev !== undefined) {
          if (!byFrom[prev]) {
            byFrom[prev] = { from: prev, to: e.op.id, wires: [] };
            edges.push(byFrom[prev]);
          }
          byFrom[prev].wires.push(w);
        }
        last[w] = e.op.id;
      });
    });
    return edges;
  }

  function directIds(circuit, id, key, other) {
    return dependencies(circuit)
      .filter(function (d) { return d[key] === id; })
      .map(function (d) { return d[other]; });
  }

  // The ids of the operations that must come directly before / after this one.
  function mustFollow(circuit, id) { find(circuit, id); return directIds(circuit, id, "to", "from"); }
  function mustPrecede(circuit, id) { find(circuit, id); return directIds(circuit, id, "from", "to"); }

  // Which ops each op depends on, directly or through others: { id: [ids] }.
  function reach(circuit) {
    var preds = {};
    ordered(circuit).forEach(function (e) { preds[e.op.id] = []; });
    dependencies(circuit).forEach(function (d) { preds[d.to].push(d.from); });
    var all = {};
    ordered(circuit).forEach(function (e) {
      var set = {};
      preds[e.op.id].forEach(function (p) {
        set[p] = true;
        all[p].forEach(function (q) { set[q] = true; });
      });
      all[e.op.id] = Object.keys(set);
    });
    return all;
  }

  // Pairs of ops with no ordering between them, directly or through others: either
  // can come first. [[idA, idB]], each pair in instruction-list order.
  function independentPairs(circuit) {
    var all = reach(circuit);
    var list = ordered(circuit).map(function (e) { return e.op.id; });
    var pairs = [];
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        if (all[list[j]].indexOf(list[i]) < 0) pairs.push([list[i], list[j]]);
      }
    }
    return pairs;
  }

  // How far along the dependencies each op is: 0 for an op that needs nothing before
  // it, otherwise one more than the deepest op it must follow. { id: level }.
  function levels(circuit) {
    var lv = {};
    var preds = {};
    ordered(circuit).forEach(function (e) { preds[e.op.id] = []; });
    dependencies(circuit).forEach(function (d) { preds[d.to].push(d.from); });
    ordered(circuit).forEach(function (e) {
      lv[e.op.id] = preds[e.op.id].reduce(function (m, p) { return Math.max(m, lv[p] + 1); }, 0);
    });
    return lv;
  }

  // ---- where one operation sits in each form -------------------------------------------
  function positions(circuit, id) {
    var e = find(circuit, id);
    var line = instructionList(circuit).filter(function (l) { return l.id === id; })[0].line;
    return {
      id: id,
      label: opLabel(e.op, circuit),
      step: e.col + 1,
      wires: wiresOf(e.op).map(qname),
      line: line,
      level: levels(circuit)[id],
      mustFollow: mustFollow(circuit, id),
      mustPrecede: mustPrecede(circuit, id),
    };
  }

  function descriptions(circuit, ids) {
    var by = {};
    circuit.ops.forEach(function (op) { by[op.id] = op; });
    var parts = ids.map(function (i) { return describeOp(by[i]); });
    if (parts.length < 2) return parts.join("");
    return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
  }

  // One sentence per form for the selected operation.
  function correspondenceText(circuit, id) {
    var p = positions(circuit, id);
    var wires = p.wires.length === 1 ? "on " + p.wires[0] : "on " + p.wires.join(" and ");
    var before = p.mustFollow.length ? descriptions(circuit, p.mustFollow) : null;
    var after = p.mustPrecede.length ? descriptions(circuit, p.mustPrecede) : null;
    var order;
    if (before && after) order = "it must come after " + before + " and before " + after;
    else if (before) order = "it must come after " + before + ", and nothing has to come after it";
    else if (after) order = "it can come first, and it must come before " + after;
    else order = "it has no ordering constraints";
    return p.label + ". In the diagram: " + wires + ", in step " + p.step + ". In the list: line " + p.line + ". In the graph: " + order + ".";
  }

  // ---- text equivalents -------------------------------------------------------------------
  // "H on q₀ must come before CNOT with ...", one per dependency, then one sentence
  // for each pair of ops that can happen in either order.
  function dependencyText(circuit) {
    var by = {};
    circuit.ops.forEach(function (op) { by[op.id] = op; });
    var out = dependencies(circuit).map(function (d) {
      var wire = d.wires.map(qname).join(" and ");
      var cap = describeOp(by[d.from]);
      return cap.charAt(0).toUpperCase() + cap.slice(1) + " must come before " + describeOp(by[d.to]) + " (both use " + wire + ").";
    });
    independentPairs(circuit).forEach(function (pair) {
      var a = describeOp(by[pair[0]]);
      out.push(a.charAt(0).toUpperCase() + a.slice(1) + " and " + describeOp(by[pair[1]]) + " do not depend on each other: either can come first.");
    });
    return out;
  }

  // The illustrative source form: what a person might write in a tool, as made-up
  // pseudo-code. It is not any SDK's syntax.
  function sourceFormLines(circuit) {
    var lines = ["qubits = " + circuit.qubits.length];
    ordered(circuit).forEach(function (e) {
      var op = e.op;
      if (op.type === "h") lines.push("h(" + op.targets[0] + ")");
      else if (op.type === "cx") lines.push("cnot(" + op.control + ", " + op.target + ")");
      else if (op.type === "measure") lines.push("measure(" + op.targets[0] + ")");
      else lines.push(String(opName(op)).toLowerCase().replace(/[^a-z0-9]/g, "") + "(" + op.targets[0] + ")");
    });
    return lines;
  }

  // ---- are two computations the same? ----------------------------------------------------
  // The same operations, on the same qubits, in the same required order, with the same
  // measurements. This is read off each qubit's sequence of operations: two forms of
  // one computation give the same sequence on every qubit, however they are laid out.
  function key(op) {
    if (op.type === "cx") return "cx|" + op.control + ">" + op.target;
    if (op.type === "gate") return "gate|" + (op.label || op.name) + "|" + op.targets.join(",");
    return op.type + "|" + op.targets.join(",");
  }

  function sequences(circuit) {
    var seq = circuit.qubits.map(function () { return []; });
    ordered(circuit).forEach(function (e) {
      wiresOf(e.op).forEach(function (w) {
        if (seq[w]) seq[w].push({ key: key(e.op), text: describeOp(e.op) });
      });
    });
    return seq;
  }

  // The first difference on each qubit: [{ wire, position (from 1), a, b }], where a
  // and b say what each computation has there (null when it has nothing).
  function differences(a, b) {
    var out = [];
    var sa = sequences(a);
    var sb = sequences(b);
    var n = Math.max(sa.length, sb.length);
    for (var w = 0; w < n; w++) {
      var x = sa[w] || [];
      var y = sb[w] || [];
      var len = Math.max(x.length, y.length);
      for (var i = 0; i < len; i++) {
        if (!x[i] || !y[i] || x[i].key !== y[i].key) {
          out.push({ wire: w, position: i + 1, a: x[i] ? x[i].text : null, b: y[i] ? y[i].text : null });
          break;
        }
      }
    }
    return out;
  }

  function sameComputation(a, b) {
    var diffs = differences(a, b);
    var sameWires = a.qubits.length === b.qubits.length;
    return { same: sameWires && diffs.length === 0, differences: diffs };
  }

  // A plain sentence for the first difference, or the reassurance when there is none.
  function differenceText(a, b) {
    var r = sameComputation(a, b);
    if (r.same) return "These describe the same computation: the same operations on each qubit, in the same required order.";
    if (a.qubits.length !== b.qubits.length) return "These use a different number of qubits, so they describe different computations.";
    var d = r.differences[0];
    return "These describe different computations. On " + qname(d.wire) + ", operation " + d.position + " is " +
      (d.a || "missing") + " in one and " + (d.b || "missing") + " in the other.";
  }

  // ---- rendering ---------------------------------------------------------------------------
  // The instruction list as an ordered list of buttons, one per operation. opts:
  // { selected (an op id), ariaLabel, interactive }. The selected line carries a text
  // label. With interactive: false the lines are plain text, for a page that only
  // shows the form.
  function instructionListHTML(circuit, opts) {
    opts = opts || {};
    var interactive = opts.interactive !== false;
    var items = instructionList(circuit).map(function (l) {
      var op = find(circuit, l.id).op;
      var on = interactive && l.id === opts.selected;
      var line = interactive
        ? '<button type="button" class="qed-forms__op' + (on ? " is-selected" : "") + '" data-op="' + esc(l.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(l.text) + "</button>"
        : '<span class="qed-forms__op">' + esc(l.text) + "</span>";
      return (
        '<li class="qed-forms__line' + (on ? " is-selected" : "") + '">' +
        line +
        (on ? '<span class="qed-forms__tag">' + esc(opLabel(op, circuit)) + "</span>" : "") +
        "</li>"
      );
    });
    return '<ol class="qed-forms__list" aria-label="' + esc(opts.ariaLabel || "Ordered instruction list") + '">' + items.join("") + "</ol>";
  }

  // The dependency statements as a list.
  function dependencyTextHTML(circuit) {
    return '<ul class="qed-forms__deps">' + dependencyText(circuit).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  // The source form as labelled pseudo-code.
  function sourceFormHTML(circuit) {
    return '<pre class="qed-forms__source" aria-label="Illustrative source form"><code>' + esc(sourceFormLines(circuit).join("\n")) + "</code></pre>";
  }

  var NODE_W = 88;
  var NODE_H = 30;
  var COL_GAP = 24;
  var ROW_GAP = 14;
  var PAD = 8;
  var TAG_H = 16;

  // The dependency graph as an SVG: one box per operation, placed by how far along the
  // dependencies it is (left to right), with an arrow from one box to another when the
  // first must come before the second. Each box is a keyboard-focusable button with a
  // text label for assistive technology. opts: { selected, idPrefix, ariaLabel,
  // interactive }. With interactive: false the boxes are plain, not buttons.
  function dependencyGraphSVG(circuit, opts) {
    opts = opts || {};
    var interactive = opts.interactive !== false;
    var prefix = opts.idPrefix || "qed-forms";
    var lv = levels(circuit);
    var list = ordered(circuit);
    var depth = list.reduce(function (m, e) { return Math.max(m, lv[e.op.id]); }, 0) + 1;
    var rowOf = {};
    var counts = [];
    list.forEach(function (e) {
      var l = lv[e.op.id];
      counts[l] = (counts[l] || 0) + 1;
      rowOf[e.op.id] = counts[l] - 1;
    });
    var rows = counts.reduce(function (m, c) { return Math.max(m, c); }, 1);
    var width = PAD * 2 + depth * NODE_W + (depth - 1) * COL_GAP;
    var height = PAD * 2 + TAG_H + rows * NODE_H + (rows - 1) * ROW_GAP;
    function xOf(id) { return PAD + lv[id] * (NODE_W + COL_GAP); }
    function yOf(id) { return PAD + TAG_H + rowOf[id] * (NODE_H + ROW_GAP); }

    var out = [];
    out.push(
      '<svg class="qed-forms-graph" id="' + esc(prefix) + '-svg" viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height +
      '" role="group" aria-label="' + esc(opts.ariaLabel || "Dependency graph. An arrow from one operation to another means the first must come before the second.") + '">'
    );
    out.push(
      '<defs><marker id="' + esc(prefix) + '-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path class="qed-forms-arrowhead" d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>'
    );
    dependencies(circuit).forEach(function (d) {
      var x1 = xOf(d.from) + NODE_W;
      var y1 = yOf(d.from) + NODE_H / 2;
      var x2 = xOf(d.to);
      var y2 = yOf(d.to) + NODE_H / 2;
      out.push('<line class="qed-forms-edge" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" marker-end="url(#' + esc(prefix) + '-arrow)" />');
    });
    list.forEach(function (e) {
      var op = e.op;
      var on = interactive && op.id === opts.selected;
      var x = xOf(op.id);
      var y = yOf(op.id);
      var name = describeOp(op) + ", step " + (e.col + 1) + (on ? ", selected" : "");
      var attrs = interactive
        ? ' role="button" tabindex="0" aria-pressed="' + (on ? "true" : "false") + '" data-op="' + esc(op.id) + '" aria-label="' + esc(name) + '"'
        : "";
      out.push(
        '<g class="qed-forms-node' + (on ? " is-selected" : "") + '"' + attrs + ">" +
        '<rect x="' + x + '" y="' + y + '" width="' + NODE_W + '" height="' + NODE_H + '" rx="4" />' +
        '<text class="qed-forms-node-text" x="' + (x + NODE_W / 2) + '" y="' + (y + NODE_H / 2 + 4) + '" text-anchor="middle">' + esc(instructionText(op)) + "</text>" +
        (on ? '<text class="qed-forms-node-tag" x="' + (x + NODE_W / 2) + '" y="' + (y - 5) + '" text-anchor="middle">' + esc(opLabel(op, circuit)) + "</text>" : "") +
        "</g>"
      );
    });
    out.push("</svg>");
    return out.join("");
  }

  return {
    bell: bell,
    withIds: withIds,
    ordered: ordered,
    opName: opName,
    opLabel: opLabel,
    describeOp: describeOp,
    instructionText: instructionText,
    instructionList: instructionList,
    dependencies: dependencies,
    mustFollow: mustFollow,
    mustPrecede: mustPrecede,
    independentPairs: independentPairs,
    levels: levels,
    positions: positions,
    correspondenceText: correspondenceText,
    dependencyText: dependencyText,
    sourceFormLines: sourceFormLines,
    differences: differences,
    sameComputation: sameComputation,
    differenceText: differenceText,
    instructionListHTML: instructionListHTML,
    dependencyTextHTML: dependencyTextHTML,
    sourceFormHTML: sourceFormHTML,
    dependencyGraphSVG: dependencyGraphSVG,
  };
})();
