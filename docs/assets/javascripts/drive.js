// Shared module for Module 04's drive model: a signal sent to one qubit that starts in |0>,
// the turn it makes, the chance of reading 1, a seeded drive-and-flip sweep, a fixed
// miscalibration, a two-qubit table, and a timeline. Used by
// docs/04-hardware/gates-and-control.md (04.01.02) and intended for 04.01.04 (the same drive
// prepares the state whose decay is measured) and 04.01.05 (the sweep returns, with a drifting
// strength and a recalibration).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedDrive must run inside a DOMContentLoaded
// listener. It calls QedGates, QedQubit, and QedShots at run time, so they must be loaded
// first.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> turn, probabilityOne, halfTurnLength, stateAfter, outcome, sweep, bestLength,
//                measure, errorWords, outcomeWords, coupling, halfTurnTable. Pure functions,
//                no DOM.
//   rendering -> signalSVG, curveSVG, timelineSVG, couplingHTML return strings
//   wiring    -> left to each page
//
// Everything here is INVENTED and SIMPLIFIED. The strengths, lengths, and timeline are
// invented units, not from any real device. The signal is a simplified rectangle (real
// signals are shaped). The turn made is `rate x length`, scaled by a fixed miscalibration, and
// the chance of reading 1 after a turn of theta from |0> is sin^2(theta / 2). The sphere point
// comes from QedGates (the rotation about x or y, as on 02.04), so the model cannot disagree
// with Module 02. The sweep does not recalibrate anything: it reports a length. Drift over time
// and the recalibration loop are 04.01.05. Detuning (a signal that is off from the step) is not
// modelled: it needs a tilted axis, which is Intermediate. Counts are simulated and seeded.
window.QedDrive = (function () {
  var LENGTH_MAX = 12;
  var SWEEP_STEP = 0.5;
  var SHOTS = 100;
  var EPS = 1e-9; // compare rounded to 1e-9
  var ON_TARGET = 1e-6; // a turn within this many degrees of the turn set is "on target"

  var DIRECTIONS = [
    { id: "x", label: "x", words: "turns the point about the x axis" },
    { id: "y", label: "y", words: "turns the point about the y axis" },
  ];
  // Degrees of turn per unit of length, in invented units.
  var STRENGTHS = [
    { id: "weak", label: "Weak", rate: 15 },
    { id: "medium", label: "Medium", rate: 30 },
    { id: "strong", label: "Strong", rate: 45 },
  ];
  // What the qubit gets compared with what was set: a fixed offset, not randomness.
  var MISCALIBRATIONS = [
    { id: "none", label: "None", factor: 1, tag: "" },
    { id: "low", label: "10% weaker than set", factor: 0.9, tag: "off by 10%" },
    { id: "high", label: "10% stronger than set", factor: 1.1, tag: "off by 10%" },
  ];
  var DEFAULTS = { direction: "x", strength: "medium", length: 0, miscalibration: "none" };
  // The Bell circuit's three operations, in order, with invented lengths.
  var TIMELINE = [
    { id: "drive", label: "A one-qubit drive", length: 1 },
    { id: "gate2", label: "A two-qubit gate", length: 4 },
    { id: "readout", label: "A readout", length: 10 },
  ];

  function find(list, id, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    throw new Error("QedDrive: no " + what + " called " + id);
  }
  function directionById(id) { return find(DIRECTIONS, id, "direction"); }
  function strengthById(id) { return find(STRENGTHS, id, "strength"); }
  function miscalibrationById(id) { return find(MISCALIBRATIONS, id, "miscalibration"); }

  function round(x) { return Math.round(x * 1e9) / 1e9; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // A length typed or slid to, clamped to 0..LENGTH_MAX and snapped to the sweep step.
  function snapLength(x) {
    var n = Number(x);
    if (!isFinite(n)) n = 0;
    n = Math.min(LENGTH_MAX, Math.max(0, n));
    return Math.round(n / SWEEP_STEP) * SWEEP_STEP;
  }

  function settingsOf(s) {
    s = s || {};
    return {
      direction: s.direction || DEFAULTS.direction,
      strength: s.strength || DEFAULTS.strength,
      length: snapLength(s.length === undefined ? DEFAULTS.length : s.length),
      miscalibration: s.miscalibration || DEFAULTS.miscalibration,
    };
  }

  // The turn set and the turn made, in degrees: rate x length, and that scaled by the offset.
  function turn(settings) {
    var s = settingsOf(settings);
    var rate = strengthById(s.strength).rate;
    var factor = miscalibrationById(s.miscalibration).factor;
    var set = rate * s.length;
    var made = set * factor;
    return { rate: rate, madeRate: rate * factor, length: s.length, set: set, made: made, difference: made - set };
  }

  // The chance of reading 1 after a turn of angleDeg from |0>: sin^2(angle / 2).
  function probabilityOne(angleDeg) {
    var h = (angleDeg * Math.PI) / 360;
    var p = Math.sin(h) * Math.sin(h);
    return Math.min(1, Math.max(0, p));
  }

  // The length that would be a half turn if the strength were exactly as set.
  function halfTurnLength(strengthId) {
    return 180 / strengthById(strengthId).rate;
  }

  // The state after the turn, from |0>, through QedGates so it agrees with Module 02.
  function stateAfter(settings) {
    var s = settingsOf(settings);
    var G = window.QedGates;
    var start = { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } };
    return G.apply(G.rotation(s.direction, turn(s).made), start);
  }

  // What the learner sees: the turns, the state, the chance of each reading, and the Bloch
  // angles for the sphere.
  function outcome(settings) {
    var s = settingsOf(settings);
    var t = turn(s);
    var st = stateAfter(s);
    var p1 = st.beta.re * st.beta.re + st.beta.im * st.beta.im;
    var p0 = st.alpha.re * st.alpha.re + st.alpha.im * st.alpha.im;
    var b = window.QedQubit.toBloch(st);
    return { settings: s, turn: t, state: st, p0: p0, p1: p1, thetaDeg: b.thetaDeg, phiDeg: b.phiDeg, phiDefined: b.phiDefined };
  }

  // The plain words for how far the turn made is from the turn set.
  function errorWords(settings) {
    var t = turn(settings);
    if (Math.abs(t.difference) <= ON_TARGET) return "on target";
    return t.difference < 0 ? "under-rotated: short of the turn set" : "over-rotated: past the turn set";
  }

  // The plain words for where the point ended up, from the chance of reading 1.
  function outcomeWords(p1) {
    var p = round(p1);
    if (p <= 0.005) return "stays at |0⟩";
    if (p >= 0.995) return "reaches |1⟩";
    if (Math.abs(p - 0.5) <= 0.005) return "ends in an even split between |0⟩ and |1⟩";
    return p > 0.9 ? "ends close to |1⟩, a little short of it or past it" : "ends part way between |0⟩ and |1⟩";
  }

  // The lengths of the drive-and-flip experiment: 0 to LENGTH_MAX in steps of SWEEP_STEP.
  function sweepLengths() {
    var out = [];
    for (var i = 0; i * SWEEP_STEP <= LENGTH_MAX + EPS; i++) out.push(i * SWEEP_STEP);
    return out;
  }

  // The drive-and-flip experiment: at each length, drive from |0> and measure SHOTS times.
  // Seeded, so the same seed repeats and a new one differs. Simulated, never from a device.
  // Does NOT change any setting: it reports lengths.
  function sweep(settings, seed) {
    var s = settingsOf(settings);
    var S = window.QedShots;
    var random = S.rng(seed);
    var points = sweepLengths().map(function (len) {
      var t = turn({ direction: s.direction, strength: s.strength, length: len, miscalibration: s.miscalibration });
      var p1 = probabilityOne(t.made);
      var r = S.sample([1 - p1, p1], SHOTS, random);
      return { length: len, set: t.set, made: t.made, exact: p1, shots: SHOTS, ones: r.counts[1], share: r.counts[1] / SHOTS };
    });
    return { settings: s, seed: seed, points: points, best: bestLength(points) };
  }

  // The length that gave the most 1s. The peak is flat, so every length tied for the most is
  // listed, and the length reported is the middle of them.
  function bestLength(points) {
    var top = Math.max.apply(null, points.map(function (p) { return p.ones; }));
    var tied = points.filter(function (p) { return p.ones === top; }).map(function (p) { return p.length; });
    return { length: (tied[0] + tied[tied.length - 1]) / 2, ones: top, share: top / SHOTS, tied: tied };
  }

  // SHOTS measurements after one drive, seeded. Counts of 0 and 1, simulated.
  function measure(settings, seed) {
    var o = outcome(settings);
    var r = window.QedShots.sample([1 - o.p1, o.p1], SHOTS, window.QedShots.rng(seed));
    return { shots: SHOTS, counts: r.counts, seed: seed, outcome: o };
  }

  // A half turn set for each strength-and-offset: the turn set, the turn made, the chance of
  // reading 1, and the words. Used for the "Never Exactly Right" table.
  function halfTurnTable(strengthId) {
    var len = halfTurnLength(strengthId);
    return MISCALIBRATIONS.map(function (m) {
      var o = outcome({ direction: "x", strength: strengthId, length: len, miscalibration: m.id });
      return { id: m.id, label: m.label, length: len, set: o.turn.set, made: o.turn.made, p1: o.p1, words: errorWords({ strength: strengthId, length: len, miscalibration: m.id }) };
    });
  }

  // Two qubits, A and B. A starts as |0> or |1>; B starts as |0>. A drive is tuned to the step B
  // has when A is |1>. With no coupling that is B's only step, so B flips in both rows. With
  // coupling B's step depends on A, so B flips only when A is |1>: a conditional flip. This is
  // ONE design; other platforms differ.
  function coupling(on) {
    var rows = ["|0⟩", "|1⟩"].map(function (a, i) {
      var flips = on ? i === 1 : true;
      return { a: a, bBefore: "|0⟩", bAfter: flips ? "|1⟩" : "|0⟩", flips: flips };
    });
    return {
      on: !!on,
      rows: rows,
      conditional: rows[0].flips !== rows[1].flips,
      words: on
        ? "B's step depends on A, so the drive flips B only when A is |1⟩. That is a conditional flip."
        : "B's step does not depend on A, so the drive flips B whatever A is. What happens to B cannot depend on A.",
    };
  }

  // ---- rendering --------------------------------------------------------------------
  // The signal as a rectangle: height is the strength, width is the length, area is the turn.
  // With a miscalibration, a dashed rectangle shows what the qubit gets.
  function signalSVG(settings) {
    var s = settingsOf(settings);
    var t = turn(s);
    var x0 = 46, y0 = 122, ux = 20, uy = 2;
    var w = t.length * ux;
    var h = t.rate * uy;
    var parts = [];
    parts.push('<svg class="qed-dr__svg" viewBox="0 0 300 150" role="img" aria-label="' + esc(signalText(s)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<line class="qed-dr__axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + (x0 + LENGTH_MAX * ux) + '" y2="' + y0 + '"/>');
    parts.push('<line class="qed-dr__axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y0 - 45 * uy - 6) + '"/>');
    parts.push('<text class="qed-dr__text" x="' + (x0 + (LENGTH_MAX * ux) / 2) + '" y="144" text-anchor="middle">length</text>');
    parts.push('<text class="qed-dr__text" x="' + x0 + '" y="14">strength</text>');
    if (w > 0) {
      parts.push('<rect class="qed-dr__signal" x="' + x0 + '" y="' + (y0 - h) + '" width="' + w + '" height="' + h + '"/>');
      if (w > 10 && h > 10) {
        parts.push('<rect class="qed-dr__signal-inner" x="' + (x0 + 3) + '" y="' + (y0 - h + 3) + '" width="' + (w - 6) + '" height="' + (h - 6) + '"/>');
      }
      parts.push('<text class="qed-dr__text qed-dr__text--signal" x="' + (x0 + 4) + '" y="' + (y0 - h - 5) + '">signal</text>');
      if (t.madeRate !== t.rate) {
        var hm = t.madeRate * uy;
        parts.push('<rect class="qed-dr__made" x="' + x0 + '" y="' + (y0 - hm) + '" width="' + w + '" height="' + hm + '"/>');
        parts.push('<text class="qed-dr__text qed-dr__text--made" x="296" y="14" text-anchor="end">dashed: what the qubit gets</text>');
      }
    } else {
      parts.push('<text class="qed-dr__text" x="' + (x0 + 8) + '" y="' + (y0 - 8) + '">no signal yet</text>');
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function signalText(settings) {
    var s = settingsOf(settings);
    var t = turn(s);
    var base = "A signal of " + strengthById(s.strength).label.toLowerCase() + " strength (" + t.rate + " degrees of turn per unit of length) and length " + s.length + ", which sets a turn of " + round(t.set) + " degrees.";
    if (t.madeRate !== t.rate) base += " The qubit gets a turn of " + round(t.made) + " degrees (" + miscalibrationById(s.miscalibration).tag + ").";
    return base;
  }

  // The chance of reading 1 against the length: the exact curve, the measured shares as open
  // circles (when a sweep has been run), the length now, and the length the strength set would
  // make a half turn.
  function curveSVG(settings, sweepResult) {
    var s = settingsOf(settings);
    var X0 = 46, X1 = 340, Y0 = 170, Y1 = 24;
    function px(len) { return X0 + (len / LENGTH_MAX) * (X1 - X0); }
    function py(p) { return Y0 - p * (Y0 - Y1); }
    var parts = [];
    parts.push('<svg class="qed-dr__svg qed-dr__svg--curve" viewBox="0 0 360 228" role="img" aria-label="' + esc(curveText(s, sweepResult)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<line class="qed-dr__axis" x1="' + X0 + '" y1="' + Y0 + '" x2="' + X1 + '" y2="' + Y0 + '"/>');
    parts.push('<line class="qed-dr__axis" x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="' + Y1 + '"/>');
    [0, 0.5, 1].forEach(function (p) {
      parts.push('<text class="qed-dr__text qed-dr__text--tick" x="' + (X0 - 6) + '" y="' + (py(p) + 4) + '" text-anchor="end">' + Math.round(p * 100) + "%</text>");
    });
    [0, 3, 6, 9, 12].forEach(function (l) {
      parts.push('<text class="qed-dr__text qed-dr__text--tick" x="' + px(l) + '" y="' + (Y0 + 16) + '" text-anchor="middle">' + l + "</text>");
    });
    parts.push('<text class="qed-dr__text" x="' + (X0 + (X1 - X0) / 2) + '" y="224" text-anchor="middle">length of the signal</text>');
    parts.push('<text class="qed-dr__text" x="' + X0 + '" y="14">chance of reading 1</text>');
    var d = [];
    for (var i = 0; i <= 240; i++) {
      var len = (i * LENGTH_MAX) / 240;
      var made = strengthById(s.strength).rate * len * miscalibrationById(s.miscalibration).factor; // not snapped, so the curve is smooth
      d.push((i === 0 ? "M" : "L") + px(len).toFixed(1) + " " + py(probabilityOne(made)).toFixed(1));
    }
    parts.push('<path class="qed-dr__curve" d="' + d.join(" ") + '"/>');
    var half = halfTurnLength(s.strength);
    if (half <= LENGTH_MAX) {
      parts.push('<line class="qed-dr__halftick" x1="' + px(half) + '" y1="' + Y0 + '" x2="' + px(half) + '" y2="' + (Y0 + 6) + '"/>');
      parts.push('<text class="qed-dr__text qed-dr__text--tick" x="' + px(half) + '" y="' + (Y0 + 28) + '" text-anchor="middle">set half turn</text>');
    }
    parts.push('<line class="qed-dr__now" x1="' + px(s.length) + '" y1="' + Y0 + '" x2="' + px(s.length) + '" y2="' + Y1 + '"/>');
    if (sweepResult) {
      sweepResult.points.forEach(function (p) {
        parts.push('<circle class="qed-dr__dot" cx="' + px(p.length).toFixed(1) + '" cy="' + py(p.share).toFixed(1) + '" r="3"/>');
      });
      parts.push('<line class="qed-dr__best" x1="' + px(sweepResult.best.length) + '" y1="' + Y0 + '" x2="' + px(sweepResult.best.length) + '" y2="' + (Y0 + 6) + '"/>');
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function curveText(settings, sweepResult) {
    var s = settingsOf(settings);
    var t = turn(s);
    var text = "The exact chance of reading 1 against the length of the signal, for " + strengthById(s.strength).label.toLowerCase() + " strength. It swings up to 100% at a turn of 180 degrees and back down. The signal is now length " + s.length + ", a turn made of " + round(t.made) + " degrees.";
    if (sweepResult) text += " Measured shares are drawn as open circles. The most 1s were seen at length " + sweepResult.best.length + ".";
    return text;
  }

  // A Gantt-style timeline of the three operations, in circuit order. Lengths are invented.
  function timelineSVG() {
    var unit = 14, x0 = 130, y0 = 14, rowH = 30;
    var parts = [];
    var total = TIMELINE.reduce(function (a, b) { return a + b.length; }, 0);
    parts.push('<svg class="qed-dr__svg qed-dr__svg--time" viewBox="0 0 360 112" role="img" aria-label="' + esc(timelineText()) + '" xmlns="http://www.w3.org/2000/svg">');
    var start = 0;
    TIMELINE.forEach(function (op, i) {
      var y = y0 + i * rowH;
      parts.push('<text class="qed-dr__text" x="' + (x0 - 8) + '" y="' + (y + 16) + '" text-anchor="end">' + esc(op.label) + "</text>");
      parts.push('<rect class="qed-dr__bar qed-dr__bar--' + op.id + '" x="' + (x0 + start * unit) + '" y="' + y + '" width="' + op.length * unit + '" height="22" rx="2"/>');
      parts.push('<text class="qed-dr__text qed-dr__text--tick" x="' + (x0 + (start + op.length) * unit + 6) + '" y="' + (y + 16) + '">' + op.length + "</text>");
      start += op.length;
    });
    parts.push('<line class="qed-dr__axis" x1="' + x0 + '" y1="' + (y0 + 3 * rowH) + '" x2="' + (x0 + total * unit) + '" y2="' + (y0 + 3 * rowH) + '"/>');
    parts.push("</svg>");
    return parts.join("");
  }

  function timelineText() {
    return "The Bell circuit's three operations in order, with invented lengths: " + TIMELINE.map(function (o) { return o.label.toLowerCase() + ", " + o.length; }).join("; ") + ".";
  }

  // The coupling table as HTML (a real table, stacked on a phone). Only fixed words go in.
  function couplingHTML(on) {
    var c = coupling(on);
    var rows = c.rows.map(function (r) {
      return '<tr><th scope="row">A starts as ' + r.a + '</th><td data-label="B starts as">' + r.bBefore + '</td><td data-label="B after the drive">' + r.bAfter + (r.flips ? " (flipped)" : " (unchanged)") + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Qubit A</th><th scope="col">B starts as</th><th scope="col">B after the drive</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  return {
    LENGTH_MAX: LENGTH_MAX,
    SWEEP_STEP: SWEEP_STEP,
    SHOTS: SHOTS,
    DIRECTIONS: DIRECTIONS,
    STRENGTHS: STRENGTHS,
    MISCALIBRATIONS: MISCALIBRATIONS,
    DEFAULTS: DEFAULTS,
    TIMELINE: TIMELINE,
    directionById: directionById,
    strengthById: strengthById,
    miscalibrationById: miscalibrationById,
    snapLength: snapLength,
    settingsOf: settingsOf,
    turn: turn,
    probabilityOne: probabilityOne,
    halfTurnLength: halfTurnLength,
    stateAfter: stateAfter,
    outcome: outcome,
    errorWords: errorWords,
    outcomeWords: outcomeWords,
    sweepLengths: sweepLengths,
    sweep: sweep,
    bestLength: bestLength,
    measure: measure,
    halfTurnTable: halfTurnTable,
    coupling: coupling,
    signalText: signalText,
    curveText: curveText,
    timelineText: timelineText,
    signalSVG: signalSVG,
    curveSVG: curveSVG,
    timelineSVG: timelineSVG,
    couplingHTML: couplingHTML,
  };
})();
