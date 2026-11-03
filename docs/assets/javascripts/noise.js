// Shared module for Module 04's noise model: an error budget for three operations on three
// invented qubits, with five kinds of source; one setting (the strength a qubit gets) that drifts
// with time; a tune that re-runs 04.01.02's drive-and-flip experiment; and a measured reported
// figure. Used by docs/04-hardware/noise.md (04.01.05) and intended for 04.02.01 to 04.02.06 (a
// platform's usual dominant source, with platform numbers).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedNoise must run inside a DOMContentLoaded
// listener. It calls QedDrive, QedCoherence, QedReadout, and QedShots at run time, so they must
// be loaded first.
//
// Layers, kept apart (same convention as QedDrive / QedCoherence):
//   model     -> snapTime, strengthFactor, tune, initialTunes, shares, combine, dominant,
//                fidelity, measureFigure, driftCurve, budgetRows, words. Pure functions, no DOM.
//   rendering -> driftSVG, qubitsHTML, sourcesHTML, remeasuredHTML return strings
//   wiring    -> left to each page
//
// Everything here is INVENTED and SIMPLIFIED. A source's error is the SHARE OF RUNS of an
// operation that go wrong because of it. Environment comes from QedCoherence (the energy and phase
// loss over the operation's length), control from QedDrive (the half turn's offset from the
// strength now in force against the length stored at the last tune), and readout from QedReadout
// (the two misreads at the middle threshold). Neighbours (crosstalk) and leakage are invented
// shares. Small shares add, and the exact total is one minus the product of the chances of going
// right. The strength drifts by a fixed share per step, in each qubit's own direction: that is a
// TEACHING MODEL, not a law (real drift is not steady and has no universal rate). A tune re-runs
// the seeded drive-and-flip sweep at the strength in force, so it is itself a measurement and
// leaves a residual. Switching a source off is something only this model can do. Nothing here
// ranks sources or qubits, and nothing here describes how software responds to calibration.
window.QedNoise = (function () {
  var TIME_MAX = 48;
  var RUNS = 1000;
  var CONTROL_SENSITIVITY = 2; // the two-qubit gate is twice as sensitive to the same offset
  var BAR_SCALE = 0.15; // the full width of a bar in the budget is this share of the runs
  var STRENGTH = "medium"; // the strength whose half turn is tuned
  var EPS = 1e-9; // compare rounded to 1e-9

  // The five kinds of source, in the order shown. appliesTo lists the operations each applies to.
  var SOURCES = [
    { id: "environment", label: "Environment", appliesTo: ["drive", "gate2", "readout"], words: "The qubit is never perfectly cut off, so it loses energy and phase.", seen: "Coherence" },
    { id: "control", label: "Control", appliesTo: ["drive", "gate2"], words: "The signal is never exactly the one set, and its strength drifts.", seen: "Gates and Control" },
    { id: "neighbours", label: "Neighbours", appliesTo: ["drive", "gate2", "readout"], words: "An operation on one qubit disturbs others. This is crosstalk, the unintended interaction.", seen: "this page" },
    { id: "leakage", label: "Leakage", appliesTo: ["drive", "gate2"], words: "The qubit leaves its two levels and ends in a level outside them.", seen: "Physical Qubits" },
    { id: "readout", label: "Readout", appliesTo: ["readout"], words: "The signals overlap, so a read can be wrong.", seen: "Readout" },
  ];

  // The Bell circuit's three operations, with the lengths of the 04.01.02 timeline (read at run time).
  var OPERATIONS = [
    { id: "drive", label: "The one-qubit signal" },
    { id: "gate2", label: "The two-qubit gate" },
    { id: "readout", label: "The readout" },
  ];

  // The three invented qubits of 04.01.04 (T1 and T2 come from QedCoherence), with three more
  // invented differences: how fast the strength drifts (a share per step, with its direction), and
  // the shares for the neighbours and for leakage, for each operation.
  var QUBITS = [
    { id: "a", label: "Qubit A", drift: 0.001, neighbours: { drive: 0.001, gate2: 0.016, readout: 0.003 }, leakage: { drive: 0.004, gate2: 0.006 } },
    { id: "b", label: "Qubit B", drift: -0.003, neighbours: { drive: 0.003, gate2: 0.010, readout: 0.004 }, leakage: { drive: 0.001, gate2: 0.003 } },
    { id: "c", label: "Qubit C", drift: 0.002, neighbours: { drive: 0.002, gate2: 0.008, readout: 0.005 }, leakage: { drive: 0.0015, gate2: 0.002 } },
  ];

  // What a device re-measures, with the experiment and the page that taught it.
  var REMEASURED = [
    { setting: "The half-turn length", experiment: "The drive-and-flip experiment", page: "Gates and Control" },
    { setting: "The readout threshold", experiment: "The threshold sweep", page: "Readout" },
    { setting: "T1 and T2", experiment: "The wait-and-read experiment", page: "Coherence" },
  ];

  var DEFAULTS = { qubit: "a", operation: "drive", time: 0 };

  function find(list, id, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    throw new Error("QedNoise: no " + what + " called " + id);
  }
  function qubitById(id) { return find(QUBITS, id, "qubit"); }
  function operationById(id) { return find(OPERATIONS, id, "operation"); }
  function sourceById(id) { return find(SOURCES, id, "source"); }

  function round(x) { return Math.round(x * 1e9) / 1e9; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function pctText(x) {
    var p = x * 100;
    if (p < 0.005) return "0%";
    return p >= 10 ? p.toFixed(1) + "%" : p.toFixed(2) + "%";
  }

  // A time typed or slid to, clamped to 0..TIME_MAX and snapped to a whole step.
  function snapTime(x) {
    var n = Number(x);
    if (!isFinite(n)) n = 0;
    n = Math.min(TIME_MAX, Math.max(0, n));
    return Math.round(n);
  }

  // The length of an operation, from the 04.01.02 timeline.
  function lengthOf(operationId) {
    operationById(operationId);
    var op = window.QedDrive.TIMELINE.filter(function (o) { return o.id === operationId; })[0];
    return op.length;
  }

  // The half-turn length for the strength that is tuned, if it were exactly as set.
  function nominalLength() { return window.QedDrive.halfTurnLength(STRENGTH); }

  function allOn() {
    var on = {};
    SOURCES.forEach(function (s) { on[s.id] = true; });
    return on;
  }

  function settingsOf(s) {
    s = s || {};
    var on = allOn();
    if (s.on) SOURCES.forEach(function (src) { if (s.on[src.id] === false) on[src.id] = false; });
    var tunes = s.tunes && s.tunes.length ? s.tunes.map(function (t) { return { time: t.time, length: t.length }; }) : [{ time: 0, length: nominalLength() }];
    tunes.sort(function (a, b) { return a.time - b.time; });
    return {
      qubit: s.qubit || DEFAULTS.qubit,
      operation: s.operation || DEFAULTS.operation,
      time: snapTime(s.time === undefined ? DEFAULTS.time : s.time),
      on: on,
      tunes: tunes,
    };
  }

  // The strength a qubit gets, as a factor of the strength set: it drifts by a fixed share per step.
  function strengthFactor(qubitId, time) {
    return 1 + qubitById(qubitId).drift * time;
  }

  // The tune in force at a time: the latest one made at or before it.
  function tuneAt(tunes, time) {
    var inForce = tunes[0];
    tunes.forEach(function (t) { if (t.time <= time + EPS) inForce = t; });
    return inForce;
  }

  // The half turn that the stored length makes at a time, in degrees.
  // QedDrive.turn snaps a length to the sweep's 0.5 step, and a stored length can be the middle of
  // two tied lengths (such as 5.75), so the turn is computed here from the rate and the exact length.
  function turnMade(length, factor) {
    return window.QedDrive.strengthById(STRENGTH).rate * length * factor;
  }

  function madeTurn(qubitId, tunes, time) {
    return turnMade(tuneAt(tunes, time).length, strengthFactor(qubitId, time));
  }

  // The control error of the one-qubit signal at a time: the chance that a half turn does not end
  // in |1>, from the strength then in force against the length stored at the last tune.
  function controlError(qubitId, tunes, time) {
    var D = window.QedDrive;
    return 1 - D.probabilityOne(madeTurn(qubitId, tunes, time));
  }

  // A tune: re-run 04.01.02's drive-and-flip sweep at the strength now in force, take the middle of
  // the lengths with the most 1s, and store it. Seeded. It changes no setting of its own: the page
  // adds the returned tune to its list. The tune is itself a measurement, so it leaves a residual.
  function tune(settings, seed) {
    var s = settingsOf(settings);
    var D = window.QedDrive;
    var factor = strengthFactor(s.qubit, s.time);
    var sweep = D.sweep({ direction: "x", strength: STRENGTH, length: 0, miscalibration: factor }, seed);
    var length = sweep.best.length;
    var previous = tuneAt(s.tunes, s.time).length;
    var made = turnMade(length, factor);
    return {
      time: s.time,
      length: length,
      previous: previous,
      factor: factor,
      made: made,
      offsetDeg: round(made - 180),
      error: 1 - D.probabilityOne(made),
      tied: sweep.best.tied,
      ones: sweep.best.ones,
      seed: seed,
    };
  }

  // The tunes a page starts with: a tune at time 0, computed the same way as any other.
  function initialTunes(qubitId, seed) {
    var t = tune({ qubit: qubitId, time: 0 }, seed);
    return [{ time: t.time, length: t.length }];
  }

  // The error share of each source for the chosen qubit and operation at the time now. Every
  // source appears in order; one that does not apply is marked and has a share of 0.
  function shares(settings) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var C = window.QedCoherence;
    var R = window.QedReadout;
    var L = lengthOf(s.operation);
    var qc = C.qubitById(s.qubit);
    var out = {};
    var energyLoss = 1 - C.survival(L, qc.t1);
    var phaseLoss = 1 - C.survival(L, qc.t2);
    out.environment = s.operation === "readout" ? energyLoss / 2 : (energyLoss + phaseLoss) / 2;
    var control = controlError(s.qubit, s.tunes, s.time);
    out.control = s.operation === "gate2" ? Math.min(1, control * CONTROL_SENSITIVITY) : control;
    out.neighbours = q.neighbours[s.operation];
    out.leakage = q.leakage[s.operation] === undefined ? 0 : q.leakage[s.operation];
    var m = R.misreads({ separation: "medium", fallback: "off", threshold: R.means({ separation: "medium" }).middle });
    out.readout = (m.zeroAsOne + m.oneAsZero) / 2;
    return SOURCES.map(function (src) {
      var applies = src.appliesTo.indexOf(s.operation) >= 0;
      return { id: src.id, label: src.label, applies: applies, on: s.on[src.id] !== false, share: applies ? out[src.id] : 0 };
    });
  }

  // The exact total of the sources that apply and are on: one minus the product of the chances of
  // going right. Close to the sum when the shares are small.
  function combine(rows) {
    var right = 1;
    rows.forEach(function (r) { if (r.applies && r.on) right *= 1 - r.share; });
    return 1 - right;
  }

  // The largest source among those that apply and are on. Ties (to 1e-9) are all named.
  function dominant(rows) {
    var best = -1;
    rows.forEach(function (r) { if (r.applies && r.on && r.share > best) best = r.share; });
    if (best <= 0) return { ids: [], share: 0 };
    var ids = rows.filter(function (r) { return r.applies && r.on && round(r.share) === round(best); }).map(function (r) { return r.id; });
    return { ids: ids, share: best };
  }

  // What a device reports for an operation: the share of runs that went right.
  function fidelity(total) { return 1 - total; }

  // RUNS repeats of the operation with the sources that are on, seeded. Simulated.
  function measureFigure(settings, seed) {
    var s = settingsOf(settings);
    var total = combine(shares(s));
    var r = window.QedShots.sample([total, 1 - total], RUNS, window.QedShots.rng(seed));
    return { settings: s, runs: RUNS, wrong: r.counts[0], right: r.counts[1], share: r.counts[1] / RUNS, exact: fidelity(total), total: total, seed: seed };
  }

  // The control error of the one-qubit signal against the time, with the tunes made so far in
  // force. Up to the time now it is what happened; after it, it shows what would happen if the
  // qubit were not tuned again.
  function driftCurve(settings) {
    var s = settingsOf(settings);
    var points = [];
    for (var t = 0; t <= TIME_MAX; t++) {
      points.push({ time: t, error: controlError(s.qubit, s.tunes, t), past: t <= s.time });
    }
    return points;
  }

  // The rows of the budget for QedShots.renderBars: one for each source, with its label, a bar
  // for its error share, and words for a source that is off or does not apply.
  function budgetRows(settings) {
    var s = settingsOf(settings);
    var rows = shares(s);
    var top = dominant(rows);
    return rows.map(function (r) {
      var text;
      if (!r.applies) text = "not applicable";
      else if (!r.on) text = "off";
      else text = "✕ " + pctText(r.share) + " error" + (top.ids.indexOf(r.id) >= 0 ? "  ◆ largest" : "");
      return { id: r.id, label: r.label, fraction: r.applies && r.on ? r.share / BAR_SCALE : 0, text: text, accent: "error", applies: r.applies, on: r.on, share: r.share };
    });
  }

  // ---- words ------------------------------------------------------------------------
  function budgetWords(settings) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var op = operationById(s.operation);
    var rows = shares(s);
    var total = combine(rows);
    var top = dominant(rows);
    var head = op.label + " on " + q.label + ", at time " + s.time + ": ";
    if (!top.ids.length) return head + "no source is on, so there is no error. Only the model can switch a source off.";
    var names = top.ids.map(function (id) { return sourceById(id).label.toLowerCase(); }).join(" and ");
    return head + "the sources that are on add up to " + pctText(total) + " error. The largest " + (top.ids.length > 1 ? "are " : "is ") + names + " (" + pctText(top.share) + ").";
  }

  function tuneWords(t) {
    return "Recalibrated at time " + t.time + ". The half-turn length found is " + t.length + ", replacing " + t.previous + ". The turn it makes now is " + Math.round(t.made * 10) / 10 + " degrees, " +
      (Math.abs(t.offsetDeg) < EPS ? "exactly on target" : Math.abs(t.offsetDeg) + " degrees " + (t.offsetDeg < 0 ? "short of" : "past") + " the 180 that was wanted") + ". The tune is itself a measurement, so it leaves a residual.";
  }

  function driftText(settings) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var now = controlError(s.qubit, s.tunes, s.time);
    return "The control error of the one-qubit signal on " + q.label + " against the time, from 0 to " + TIME_MAX + ", with " + s.tunes.length + (s.tunes.length === 1 ? " tune" : " tunes") + " so far. It grows as the strength drifts away from the setting stored at the last tune, and falls back after each tune. At time " + s.time + " it is " + pctText(now) + ".";
  }

  // ---- rendering --------------------------------------------------------------------
  var PX0 = 52, PX1 = 340, PY0 = 190, PY1 = 52;
  function px(t) { return PX0 + (t / TIME_MAX) * (PX1 - PX0); }

  // The control error against the time, with a tick where each tune was made.
  function driftSVG(settings) {
    var s = settingsOf(settings);
    var pts = driftCurve(s);
    var top = Math.max(0.01, Math.max.apply(null, pts.map(function (p) { return p.error; })));
    var max = Math.ceil(top * 200) / 200; // a tidy top for the axis, in steps of 0.5%
    function py(e) { return PY0 - (e / max) * (PY0 - PY1); }
    var parts = [];
    parts.push('<svg class="qed-no__svg" viewBox="0 0 360 250" role="img" aria-label="' + esc(driftText(s)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<line class="qed-no__axis" x1="' + PX0 + '" y1="' + PY0 + '" x2="' + PX1 + '" y2="' + PY0 + '"/>');
    parts.push('<line class="qed-no__axis" x1="' + PX0 + '" y1="' + PY0 + '" x2="' + PX0 + '" y2="' + PY1 + '"/>');
    [0, 0.5, 1].forEach(function (f) {
      parts.push('<text class="qed-no__text qed-no__text--tick" x="' + (PX0 - 6) + '" y="' + (py(max * f) + 5) + '" text-anchor="end">' + (Math.round(max * f * 1000) / 10) + "%</text>");
    });
    [0, 12, 24, 36, 48].forEach(function (t) {
      parts.push('<text class="qed-no__text qed-no__text--tick" x="' + px(t) + '" y="' + (PY0 + 18) + '" text-anchor="middle">' + t + "</text>");
    });
    parts.push('<text class="qed-no__text" x="' + (PX0 + (PX1 - PX0) / 2) + '" y="238" text-anchor="middle">time (invented steps)</text>');
    parts.push('<text class="qed-no__text" x="' + PX0 + '" y="18">control error</text>');
    s.tunes.forEach(function (t) {
      parts.push('<line class="qed-no__tune" x1="' + px(t.time) + '" y1="' + PY0 + '" x2="' + px(t.time) + '" y2="' + (PY1 - 6) + '"/>');
      parts.push('<text class="qed-no__text qed-no__text--tick" x="' + px(t.time) + '" y="' + (PY1 - 8) + '" text-anchor="' + (t.time > 36 ? "end" : "start") + '">' + (t.time > 36 ? "tuned " : " tuned") + "</text>");
    });
    // the error: what happened up to now (solid), and what would happen if it were not tuned again (dashed)
    function seg(list, cls) {
      if (list.length < 1) return;
      parts.push('<path class="' + cls + '" d="' + list.map(function (p, i) { return (i === 0 ? "M" : "L") + px(p.time).toFixed(1) + " " + py(p.error).toFixed(1); }).join(" ") + '"/>');
    }
    var past = pts.filter(function (p) { return p.past; });
    var future = pts.filter(function (p) { return !p.past; });
    if (future.length) future.unshift(past[past.length - 1]);
    seg(past, "qed-no__error");
    seg(future, "qed-no__error qed-no__error--future");
    parts.push('<line class="qed-no__now" x1="' + px(s.time) + '" y1="' + PY0 + '" x2="' + px(s.time) + '" y2="' + PY1 + '"/>');
    parts.push('<text class="qed-no__text qed-no__text--tick" x="' + px(s.time) + '" y="' + (PY0 + 36) + '" text-anchor="middle">now</text>');
    parts.push("</svg>");
    return parts.join("");
  }

  // The three invented qubits and what differs, as a real table.
  function qubitsHTML() {
    var C = window.QedCoherence;
    var rows = QUBITS.map(function (q) {
      var c = C.qubitById(q.id);
      var d = Math.round(q.drift * 1000) / 10;
      return '<tr><th scope="row">' + esc(q.label) + '</th><td data-label="T1 and T2">' + c.t1 + " and " + c.t2 + '</td>' +
        '<td data-label="Strength drift per step">' + (d > 0 ? "+" : "−") + Math.abs(d) + '%</td>' +
        '<td data-label="Neighbours (signal, gate, readout)">' + [q.neighbours.drive, q.neighbours.gate2, q.neighbours.readout].map(pctText).join(", ") + '</td>' +
        '<td data-label="Leakage (signal, gate)">' + [q.leakage.drive, q.leakage.gate2].map(pctText).join(", ") + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Qubit</th><th scope="col">T1 and T2</th><th scope="col">Strength drift per step</th><th scope="col">Neighbours (signal, gate, readout)</th><th scope="col">Leakage (signal, gate)</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // The five kinds of source, with where the learner has seen each, as a real table.
  function sourcesHTML() {
    var rows = SOURCES.map(function (src) {
      return '<tr><th scope="row">' + esc(src.label) + '</th><td data-label="What it is">' + esc(src.words) + '</td><td data-label="Seen on">' + esc(src.seen) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Kind of source</th><th scope="col">What it is</th><th scope="col">Seen on</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // What a device re-measures, as a real table.
  function remeasuredHTML() {
    var rows = REMEASURED.map(function (r) {
      return '<tr><th scope="row">' + esc(r.setting) + '</th><td data-label="Re-measured by">' + esc(r.experiment) + '</td><td data-label="Taught on">' + esc(r.page) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Setting</th><th scope="col">Re-measured by</th><th scope="col">Taught on</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  return {
    TIME_MAX: TIME_MAX,
    RUNS: RUNS,
    CONTROL_SENSITIVITY: CONTROL_SENSITIVITY,
    BAR_SCALE: BAR_SCALE,
    STRENGTH: STRENGTH,
    SOURCES: SOURCES,
    OPERATIONS: OPERATIONS,
    QUBITS: QUBITS,
    REMEASURED: REMEASURED,
    DEFAULTS: DEFAULTS,
    qubitById: qubitById,
    operationById: operationById,
    sourceById: sourceById,
    snapTime: snapTime,
    lengthOf: lengthOf,
    nominalLength: nominalLength,
    allOn: allOn,
    settingsOf: settingsOf,
    strengthFactor: strengthFactor,
    tuneAt: tuneAt,
    madeTurn: madeTurn,
    controlError: controlError,
    tune: tune,
    initialTunes: initialTunes,
    shares: shares,
    combine: combine,
    dominant: dominant,
    fidelity: fidelity,
    measureFigure: measureFigure,
    driftCurve: driftCurve,
    budgetRows: budgetRows,
    budgetWords: budgetWords,
    tuneWords: tuneWords,
    driftText: driftText,
    pctText: pctText,
    driftSVG: driftSVG,
    qubitsHTML: qubitsHTML,
    sourcesHTML: sourcesHTML,
    remeasuredHTML: remeasuredHTML,
  };
})();
