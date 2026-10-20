// Shared module for Module 05's backend descriptions: what software is told about a
// target (a simulator or a device), and, for a device, calibration snapshots with the
// time and status each was reported at. Used by
// docs/05-software-stack/hardware-abstraction-and-backend-capabilities.md (05.04) and
// intended for 05.06 (a job is sent to a described target) and 05.07 (alternative
// target paths).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages
// that don't call it. Page scripts that use window.QedBackend must run inside a
// DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> FIELDS (the field catalog), SIMULATOR and DEVICE (descriptions as data),
//                report, change, POLICIES, choosePair, capabilities. Pure functions, no
//                DOM, and no other module is called.
//   text      -> plain sentences for values, changes, and capabilities
//   rendering -> deviceSVG and fieldTableHTML return strings
//   wiring    -> left to each page
//
// Everything here is SYNTHETIC. The device, its four qubits, and every number in its two
// snapshots were written by hand for the teaching page. They are not from any real device,
// they are not typical of one, and they are not any vendor's. The fields are
// representative examples, not a standard schema: other hardware reports other fields,
// and no device reports every field every time (one value in the later snapshot is "not
// reported" on purpose, and nothing here ever fills it in).
//
// The capability part of a description has the same `allows` shape as a QedTransform
// target ({ oneQubit: [gate ids], twoQubit: [{ control, target }] }), so the 05.03 targets
// can be described here without conversion.
//
// A policy is one stated rule that reads some reported values and ranks the connected
// pairs. It is a ranking of reported numbers. It is not a prediction, and nothing here
// computes a success probability. Functions never mutate their arguments.
window.QedBackend = (function () {
  var LARGE = 0.25; // a relative change of at least this size counts as a large change

  // ---- the field catalog ----------------------------------------------------------------
  // better: which direction is an improvement ("higher", "lower"), or null when neither is.
  var FIELDS = [
    {
      id: "frequency", label: "Operating frequency", unit: "GHz", scope: "qubit", digits: 2, better: null, uncertain: false,
      meaning: "A frequency at which this qubit is operated and characterized.",
      qualification: "Specific to some kinds of hardware. Other kinds report different quantities.",
    },
    {
      id: "t1", label: "T1 (energy relaxation time)", unit: "µs", scope: "qubit", digits: 0, better: "higher", uncertain: true,
      meaning: "A characteristic timescale over which an excited qubit loses energy.",
      qualification: "A timescale, not the chance that a circuit succeeds. It depends on how it was measured.",
    },
    {
      id: "t2", label: "T2 (phase coherence time)", unit: "µs", scope: "qubit", digits: 0, better: "higher", uncertain: true,
      meaning: "A characteristic timescale over which a qubit keeps its phase.",
      qualification: "Definitions and measurement protocols differ, and T2 and T2* are not interchangeable. Not the chance that a circuit succeeds.",
    },
    {
      id: "gate1q", label: "Single-qubit gate error", unit: "%", scope: "qubit", digits: 2, better: "lower", uncertain: true,
      meaning: "An estimate of how far a single-qubit operation is from the ideal one.",
      qualification: "It depends on the procedure used to estimate it, on which gate, and on when. It is not the chance that a circuit fails.",
    },
    {
      id: "readout01", label: "Readout error, prepared 0 and read as 1", unit: "%", scope: "qubit", digits: 1, better: "lower", uncertain: true,
      meaning: "How often a qubit prepared in 0 is reported as 1.",
      qualification: "It can differ from the error for 1 read as 0, and it is not the same as gate error.",
    },
    {
      id: "readout10", label: "Readout error, prepared 1 and read as 0", unit: "%", scope: "qubit", digits: 1, better: "lower", uncertain: true,
      meaning: "How often a qubit prepared in 1 is reported as 0.",
      qualification: "It can differ from the error for 0 read as 1, and it is not the same as gate error.",
    },
    {
      id: "gate2q", label: "Two-qubit gate error (this connection)", unit: "%", scope: "pair", digits: 2, better: "lower", uncertain: true,
      meaning: "An estimate of how far a two-qubit operation on this pair is from the ideal one.",
      qualification: "It depends on the procedure used to estimate it, on the pair, and on when. It is not the chance that a circuit fails.",
    },
  ];

  // Control settings exist on a real device but are not reported here and are not taught.
  var CONTROL_SETTINGS = {
    label: "Control settings",
    text: "Exist on the device. Not reported here and not taught on this page.",
  };

  function fieldById(id) {
    var hit = FIELDS.filter(function (f) { return f.id === id; })[0];
    if (!hit) throw new Error("QedBackend: there is no field called " + id);
    return hit;
  }

  // ---- the synthetic targets ----------------------------------------------------------------
  var SIMULATOR = {
    id: "simulator",
    kind: "simulator",
    name: "Simulator",
    synthetic: true,
    description: "A classical program that models the computation. Its description lists what it supports. It has no calibration data, because nothing physical is calibrated.",
    limit: "Its limits are set by the classical computer that runs it.",
    allows: {
      oneQubit: ["h", "x", "z", "rx", "rz"],
      twoQubit: [{ control: 0, target: 1 }, { control: 1, target: 0 }],
    },
    anyPair: true,
    snapshots: null,
  };

  // A value is { value, unc } with value null when the device did not report it.
  function v(value, unc) { return { value: value, unc: value === null ? null : unc }; }

  function qubitRow(frequency, t1, t2, gate1q, readout01, readout10, unc) {
    return {
      frequency: v(frequency, 0),
      t1: v(t1, unc.t1),
      t2: v(t2, unc.t2),
      gate1q: v(gate1q, 0.01),
      readout01: v(readout01, 0.2),
      readout10: v(readout10, 0.2),
    };
  }

  var DEVICE = {
    id: "q4",
    kind: "device",
    name: "Device Q4",
    synthetic: true,
    description: "A small invented device with four qubits in a line. Its description lists what it supports, which qubits are connected, and what has been reported about its condition.",
    qubits: ["Q0", "Q1", "Q2", "Q3"],
    pairs: [[0, 1], [1, 2], [2, 3]],
    allows: {
      oneQubit: ["rx", "rz"],
      twoQubit: [{ control: 0, target: 1 }, { control: 1, target: 2 }, { control: 2, target: 3 }],
    },
    anyPair: false,
    snapshotIds: ["earlier", "later"],
    snapshots: {
      earlier: {
        id: "earlier",
        label: "Earlier",
        time: "06:00",
        hours: 6,
        status: "complete",
        statusText: "complete: every field was reported",
        protocol: "estimated by a benchmarking procedure (illustrative)",
        qubits: [
          qubitRow(5.04, 78, 54, 0.09, 1.8, 2.4, { t1: 4, t2: 3 }),
          qubitRow(5.11, 91, 66, 0.06, 1.0, 1.4, { t1: 5, t2: 3 }),
          qubitRow(5.07, 65, 48, 0.12, 2.2, 3.4, { t1: 5, t2: 3 }),
          qubitRow(5.15, 88, 63, 0.07, 1.2, 1.8, { t1: 4, t2: 3 }),
        ],
        pairs: { "0-1": { gate2q: v(0.80, 0.08) }, "1-2": { gate2q: v(0.78, 0.08) }, "2-3": { gate2q: v(1.10, 0.08) } },
      },
      later: {
        id: "later",
        label: "Later",
        time: "18:00, same day",
        hours: 18,
        status: "partial",
        statusText: "partial: one value was not reported",
        protocol: "estimated by a benchmarking procedure (illustrative)",
        qubits: [
          qubitRow(5.04, 76, 52, 0.10, 1.9, 2.5, { t1: 4, t2: 3 }),
          qubitRow(5.11, 89, 64, 0.07, 1.2, 1.6, { t1: 5, t2: 3 }),
          qubitRow(5.08, 40, null, 0.13, 2.1, 3.1, { t1: 6, t2: 3 }),
          qubitRow(5.15, 90, 66, 0.06, 1.0, 1.4, { t1: 4, t2: 3 }),
        ],
        pairs: { "0-1": { gate2q: v(0.78, 0.08) }, "1-2": { gate2q: v(0.86, 0.08) }, "2-3": { gate2q: v(1.05, 0.08) } },
      },
    },
  };

  function pairKey(pair) { return pair[0] + "-" + pair[1]; }

  function snapshotOf(device, id) {
    var s = device.snapshots && device.snapshots[id];
    if (!s) throw new Error("QedBackend: " + device.name + " has no snapshot called " + id);
    return s;
  }

  // ---- text ----------------------------------------------------------------------------------
  function formatValue(entry, field) {
    if (entry.value === null) return "not reported";
    var text = entry.value.toFixed(field.digits) + " " + field.unit;
    if (field.uncertain && entry.unc) text += " (±" + entry.unc.toFixed(field.digits === 0 ? 0 : Math.min(2, field.digits)) + ")";
    return text;
  }

  var GATE_WORDS = { h: "H", x: "X", z: "Z", rx: "turns about the x axis", rz: "turns about the z axis" };

  // What a description tells software, as plain strings. `target` is anything with the
  // `allows` shape (a QedTransform target, SIMULATOR, DEVICE). opts.names is the list of
  // qubit names to use (default Q0, Q1, ...).
  function capabilities(target, opts) {
    opts = opts || {};
    var names = opts.names || ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"];
    var operations = target.allows.oneQubit.map(function (id) { return GATE_WORDS[id] || id; });
    var connections = target.allows.twoQubit.map(function (d) { return "CNOT from " + names[d.control] + " to " + names[d.target]; });
    if (target.anyPair) connections = ["any qubit can be used with any other"];
    return {
      kind: target.kind || "target",
      operations: operations,
      connections: connections,
      limit: target.limit || null,
    };
  }

  // ---- reports ----------------------------------------------------------------------------------
  function row(field, entry) {
    return {
      fieldId: field.id,
      label: field.label,
      unit: field.unit,
      value: entry.value,
      unc: entry.unc,
      reported: entry.value !== null,
      text: formatValue(entry, field),
      meaning: field.meaning,
      qualification: field.qualification,
    };
  }

  // Everything one snapshot reports, with the snapshot's own provenance.
  function report(device, snapshotId) {
    var s = snapshotOf(device, snapshotId);
    return {
      snapshot: { id: s.id, label: s.label, time: s.time, hours: s.hours, status: s.status, statusText: s.statusText, protocol: s.protocol, synthetic: true },
      qubits: device.qubits.map(function (name, i) {
        return {
          index: i, name: name,
          rows: FIELDS.filter(function (f) { return f.scope === "qubit"; }).map(function (f) { return row(f, s.qubits[i][f.id]); }),
        };
      }),
      pairs: device.pairs.map(function (p) {
        return {
          key: pairKey(p), a: p[0], b: p[1], name: device.qubits[p[0]] + "–" + device.qubits[p[1]],
          rows: FIELDS.filter(function (f) { return f.scope === "pair"; }).map(function (f) { return row(f, s.pairs[pairKey(p)][f.id]); }),
        };
      }),
    };
  }

  // What the snapshot reports for one qubit ({ qubit: 2 }) or one connection ({ pair: [1, 2] }).
  function reportFor(device, snapshotId, selection) {
    var r = report(device, snapshotId);
    if (selection && typeof selection.qubit === "number") {
      var q = r.qubits[selection.qubit];
      if (!q) throw new Error("QedBackend: " + device.name + " has no qubit " + selection.qubit);
      return { snapshot: r.snapshot, title: q.name, rows: q.rows };
    }
    if (selection && selection.pair) {
      var p = r.pairs.filter(function (x) { return x.key === pairKey(selection.pair); })[0];
      if (!p) throw new Error("QedBackend: " + device.name + " has no connection " + pairKey(selection.pair));
      return { snapshot: r.snapshot, title: p.name, rows: p.rows };
    }
    throw new Error("QedBackend: select a qubit or a connection");
  }

  // ---- change between two snapshots --------------------------------------------------------------
  function sizeOf(from, to) {
    if (from === to) return "unchanged";
    // rounded, so a change of exactly 25% is not lost to floating-point error
    return Math.round((Math.abs(to - from) / Math.abs(from)) * 1e9) / 1e9 >= LARGE ? "large" : "small";
  }

  function effectOf(field, from, to) {
    if (from === to || field.better === null) return "neither";
    var up = to > from;
    return (field.better === "higher") === up ? "improved" : "worsened";
  }

  // One entry per value in the catalog: { fieldId, label, unit, where, from, to, size, effect,
  // direction, text }. size is unchanged, small, large (a relative change of 25% or more), or
  // "not reported" when either snapshot lacks the value; effect is improved, worsened, or neither
  // (frequency has no better direction), and "n/a" when not reported.
  function change(device, fromId, toId) {
    var a = snapshotOf(device, fromId);
    var b = snapshotOf(device, toId);
    var out = [];
    function one(field, where, ea, eb) {
      var item = { fieldId: field.id, label: field.label, unit: field.unit, where: where, from: ea.value, to: eb.value };
      if (ea.value === null || eb.value === null) {
        item.size = "not reported";
        item.effect = "n/a";
        item.direction = null;
        item.text = field.label + " on " + where + ": " + (ea.value === null ? "not reported" : formatValue(ea, field)) + " in " + a.label.toLowerCase() + ", " + (eb.value === null ? "not reported" : formatValue(eb, field)) + " in " + b.label.toLowerCase() + ".";
      } else {
        item.size = sizeOf(ea.value, eb.value);
        item.effect = effectOf(field, ea.value, eb.value);
        item.direction = eb.value > ea.value ? "higher" : eb.value < ea.value ? "lower" : "same";
        item.text = field.label + " on " + where + ": " + ea.value.toFixed(field.digits) + " to " + eb.value.toFixed(field.digits) + " " + field.unit +
          (item.size === "unchanged" ? " (about the same)" : " (" + item.direction + ", a " + item.size + " change" + (item.effect === "neither" ? "" : ", " + item.effect) + ")") + ".";
      }
      out.push(item);
    }
    FIELDS.forEach(function (f) {
      if (f.scope === "qubit") device.qubits.forEach(function (name, i) { one(f, name, a.qubits[i][f.id], b.qubits[i][f.id]); });
      else device.pairs.forEach(function (p) { one(f, device.qubits[p[0]] + "–" + device.qubits[p[1]], a.pairs[pairKey(p)][f.id], b.pairs[pairKey(p)][f.id]); });
    });
    return out;
  }

  // How much older one snapshot is than another, in words ("12 hours older").
  function ageText(device, olderId, newerId) {
    var h = snapshotOf(device, newerId).hours - snapshotOf(device, olderId).hours;
    return h + " hour" + (h === 1 ? "" : "s") + " older";
  }

  // ---- policies ------------------------------------------------------------------------------------
  function mean(a, b) { return (a + b) / 2; }
  function round(x) { return Math.round(x * 1e6) / 1e6; }

  // A policy names the values it reads. needs(snapshot, pair) lists the entries it requires,
  // and score(...) combines them. Lower is better for both.
  var POLICIES = [
    {
      id: "lowest-two-qubit",
      label: "Lowest two-qubit error",
      words: "Choose the connected pair with the lowest reported two-qubit gate error.",
      needs: function (s, p) { return [{ what: "the two-qubit gate error on " + p.name, entry: s.pairs[p.key].gate2q }]; },
      score: function (vals) { return vals[0]; },
    },
    {
      id: "lowest-total",
      label: "Lowest sum of errors",
      words: "Choose the connected pair with the lowest sum of its two-qubit gate error and the average readout error of each of its two qubits (each the average of that qubit's two readout errors).",
      needs: function (s, p) {
        return [
          { what: "the two-qubit gate error on " + p.name, entry: s.pairs[p.key].gate2q },
          { what: "the readout error for 0 read as 1 on " + p.names[0], entry: s.qubits[p.a].readout01 },
          { what: "the readout error for 1 read as 0 on " + p.names[0], entry: s.qubits[p.a].readout10 },
          { what: "the readout error for 0 read as 1 on " + p.names[1], entry: s.qubits[p.b].readout01 },
          { what: "the readout error for 1 read as 0 on " + p.names[1], entry: s.qubits[p.b].readout10 },
        ];
      },
      score: function (vals) { return vals[0] + mean(vals[1], vals[2]) + mean(vals[3], vals[4]); },
    },
  ];

  function policyById(id) {
    var hit = POLICIES.filter(function (p) { return p.id === id; })[0];
    if (!hit) throw new Error("QedBackend: there is no policy called " + id);
    return hit;
  }

  // Rank the device's connected pairs under a policy, using one snapshot. Returns
  //   { policy, snapshotId, ranking: [{ pair, key, name, score }], best, tie, unscored }
  // ranking is best first. A pair whose needed values include one that was not reported is
  // never scored (nothing is guessed): it is listed in unscored with what was missing.
  // best is the best pair as [a, b], or null when no pair could be scored. tie is true when
  // the best score is shared (best is then the first of them).
  function choosePair(device, snapshotId, policyId) {
    var policy = policyById(policyId);
    var s = snapshotOf(device, snapshotId);
    var ranking = [];
    var unscored = [];
    device.pairs.forEach(function (p) {
      var info = { key: pairKey(p), a: p[0], b: p[1], names: [device.qubits[p[0]], device.qubits[p[1]]], name: device.qubits[p[0]] + "–" + device.qubits[p[1]] };
      var needs = policy.needs(s, info);
      var missing = needs.filter(function (n) { return n.entry.value === null; }).map(function (n) { return n.what; });
      if (missing.length) {
        unscored.push({ pair: p.slice(), key: info.key, name: info.name, missing: missing });
        return;
      }
      ranking.push({ pair: p.slice(), key: info.key, name: info.name, score: round(policy.score(needs.map(function (n) { return n.entry.value; }))) });
    });
    ranking.sort(function (x, y) { return x.score - y.score; });
    return {
      policy: { id: policy.id, label: policy.label, words: policy.words },
      snapshotId: snapshotId,
      ranking: ranking,
      best: ranking.length ? ranking[0].pair.slice() : null,
      tie: ranking.length > 1 && ranking[0].score === ranking[1].score,
      unscored: unscored,
    };
  }

  // ---- drawing -------------------------------------------------------------------------------------
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var GAP = 96;
  var LEFT = 44;
  var CY = 64;
  var R = 18;

  function cx(i) { return LEFT + i * GAP; }

  // The device as an SVG: qubits in a line with a connection between neighbours that are
  // connected. opts: { selected: { qubit } or { pair }, marks: [{ pair: [a, b], label }],
  // idPrefix, interactive }. The selected item carries a thick outline and the text
  // "selected"; each mark is a dashed outline around a pair with its own text label (marks
  // on the same pair are joined). Qubits and connections are keyboard-focusable buttons
  // unless interactive is false.
  function deviceSVG(device, opts) {
    opts = opts || {};
    var interactive = opts.interactive !== false;
    var n = device.qubits.length;
    var width = LEFT * 2 + (n - 1) * GAP;
    var marks = {};
    (opts.marks || []).forEach(function (m) {
      var k = pairKey(m.pair);
      marks[k] = marks[k] ? { pair: m.pair, label: marks[k].label + " and " + m.label } : { pair: m.pair, label: m.label };
    });
    var markList = Object.keys(marks).map(function (k) { return marks[k]; });
    var height = 120;
    var sel = opts.selected || {};
    var out = [];
    out.push('<svg class="qed-bk-svg" id="' + esc((opts.idPrefix || "qed-bk") + "-svg") + '" viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height + '" role="group" aria-label="' + esc(device.name + ": four qubits in a line, with a connection between each neighbouring pair") + '">');
    markList.forEach(function (m, k) {
      var x1 = cx(m.pair[0]) - R - 8;
      var x2 = cx(m.pair[1]) + R + 8;
      out.push('<rect class="qed-bk-mark" x="' + x1 + '" y="' + (CY - R - 10) + '" width="' + (x2 - x1) + '" height="' + (2 * R + 20) + '" rx="10" />');
      out.push('<text class="qed-bk-mark-label" x="' + (x1 + x2) / 2 + '" y="' + (CY - R - 16) + '" text-anchor="middle">' + esc(m.label) + "</text>");
    });
    device.pairs.forEach(function (p) {
      var on = sel.pair && pairKey(sel.pair) === pairKey(p);
      var attrs = interactive ? ' role="button" tabindex="0" aria-pressed="' + (on ? "true" : "false") + '" data-pair="' + pairKey(p) + '" aria-label="' + esc("Connection " + device.qubits[p[0]] + " to " + device.qubits[p[1]] + (on ? ", selected" : "")) + '"' : "";
      out.push('<g class="qed-bk-link' + (on ? " is-selected" : "") + '"' + attrs + ">" +
        '<rect class="qed-bk-hit" x="' + (cx(p[0]) + R) + '" y="' + (CY - 14) + '" width="' + (GAP - 2 * R) + '" height="28" />' +
        '<line class="qed-bk-line" x1="' + (cx(p[0]) + R) + '" y1="' + CY + '" x2="' + (cx(p[1]) - R) + '" y2="' + CY + '" />' +
        (on ? '<text class="qed-bk-tag" x="' + (cx(p[0]) + cx(p[1])) / 2 + '" y="' + (CY + R + 30) + '" text-anchor="middle">selected</text>' : "") +
        "</g>");
    });
    device.qubits.forEach(function (name, i) {
      var on = typeof sel.qubit === "number" && sel.qubit === i;
      var attrs = interactive ? ' role="button" tabindex="0" aria-pressed="' + (on ? "true" : "false") + '" data-qubit="' + i + '" aria-label="' + esc("Qubit " + name + (on ? ", selected" : "")) + '"' : "";
      out.push('<g class="qed-bk-qubit' + (on ? " is-selected" : "") + '"' + attrs + ">" +
        '<circle cx="' + cx(i) + '" cy="' + CY + '" r="' + R + '" />' +
        '<text class="qed-bk-name" x="' + cx(i) + '" y="' + (CY + 4) + '" text-anchor="middle">' + esc(name) + "</text>" +
        (on ? '<text class="qed-bk-tag" x="' + cx(i) + '" y="' + (CY + R + 30) + '" text-anchor="middle">selected</text>' : "") +
        "</g>");
    });
    out.push("</svg>");
    return out.join("");
  }

  // A table of reported rows as HTML: label, value with its unit and uncertainty, and what it
  // means with its qualification. Rows with no value read "not reported".
  function fieldTableHTML(rows) {
    return '<table class="qed-bk-table"><thead><tr><th scope="col">Field</th><th scope="col">Reported</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><th scope="row">' + esc(r.label) + "</th><td" + (r.reported ? "" : ' class="is-missing"') + ">" + esc(r.text) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  return {
    FIELDS: FIELDS,
    CONTROL_SETTINGS: CONTROL_SETTINGS,
    LARGE: LARGE,
    SIMULATOR: SIMULATOR,
    DEVICE: DEVICE,
    POLICIES: POLICIES,
    fieldById: fieldById,
    capabilities: capabilities,
    report: report,
    reportFor: reportFor,
    change: change,
    ageText: ageText,
    choosePair: choosePair,
    deviceSVG: deviceSVG,
    fieldTableHTML: fieldTableHTML,
  };
})();
