// Shared module for Module 04's coherence model: a qubit's state fading in two ways, energy loss
// (timed by T1) and phase loss (timed by T2), for three invented qubits; a seeded wait-and-read
// experiment at one wait and at 25 waits; a fit that turns the measured shares into a reported T;
// how many operations fit in a time; and flat pictures of the average of many runs. Used by
// docs/04-hardware/coherence.md (04.01.04) and intended for 04.01.05 (a T that drifts, and the
// same experiments re-run after a re-tune).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedCoherence must run inside a DOMContentLoaded
// listener. It calls QedShots, QedGates, and QedDrive at run time, so they must be loaded first.
//
// Layers, kept apart (same convention as QedDrive / QedReadout):
//   model     -> snapWait, survival, startProbability, probabilityOne, measure, sweep, estimate,
//                timeScaleTick, fits, budget, bellLoss, runs, average. Pure functions, no DOM.
//   rendering -> curveSVG, pictureSVG, fitsHTML, budgetHTML return strings
//   wiring    -> left to each page
//
// Everything here is INVENTED and SIMPLIFIED. The three qubits' times, the waits, and the lengths
// of the operations (those of the 04.01.02 timeline) are invented units, not from any real device.
// Each loss is ONE exponential, which real qubits do not always follow. The energy experiment
// starts in 1 and its chance of reading 1 falls from 1 to 0. The phase experiment starts in an
// even split, waits, turns it again (the same quarter turn about y) and reads: its chance of
// reading 1 falls from 1 to one half, a coin flip. The phase model leaves out energy loss during
// the wait, and the second turn is exact. The starting states and the turns come from QedGates, so
// the model cannot disagree with Module 02. The sweep does not recalibrate anything: it reports a
// T. Every qubit's T2 is at most twice its T1 so none is impossible, and the relation between the
// two is never stated (it is Intermediate). Counts are simulated and seeded.
window.QedCoherence = (function () {
  var WAIT_MAX = 600;
  var WAIT_STEP = 5;
  var SWEEP_STEP = 25;
  var SHOTS = 100;
  var RUNS = 24; // the dots in the flat picture
  var FIT_FROM = 2; // the fit searches times from here
  var FIT_TO = 5000; // to here
  var FIT_RATIO = 1.002; // in steps of 0.2%
  var EPS = 1e-9; // compare rounded to 1e-9

  var QUBITS = [
    { id: "a", label: "Qubit A", words: "steady", t1: 400, t2: 300 },
    { id: "b", label: "Qubit B", words: "phase fades first", t1: 400, t2: 50 },
    { id: "c", label: "Qubit C", words: "energy fades first", t1: 60, t2: 80 },
  ];
  // floor is the chance of reading 1 that the curve ends at.
  var EXPERIMENTS = [
    { id: "energy", label: "Energy", time: "T1", start: "1", floor: 0, words: "start in 1, wait, read" },
    { id: "phase", label: "Phase", time: "T2", start: "an even split", floor: 0.5, words: "start in an even split, wait, turn it again, read" },
  ];
  var DEFAULTS = { qubit: "a", experiment: "energy", wait: 0 };

  function find(list, id, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    throw new Error("QedCoherence: no " + what + " called " + id);
  }
  function qubitById(id) { return find(QUBITS, id, "qubit"); }
  function experimentById(id) { return find(EXPERIMENTS, id, "experiment"); }

  function round(x) { return Math.round(x * 1e9) / 1e9; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // A wait typed or slid to, clamped to 0..WAIT_MAX and snapped to the slider step.
  function snapWait(x) {
    var n = Number(x);
    if (!isFinite(n)) n = 0;
    n = Math.min(WAIT_MAX, Math.max(0, n));
    return Math.round(n / WAIT_STEP) * WAIT_STEP;
  }

  function settingsOf(s) {
    s = s || {};
    return {
      qubit: s.qubit || DEFAULTS.qubit,
      experiment: s.experiment || DEFAULTS.experiment,
      wait: snapWait(s.wait === undefined ? DEFAULTS.wait : s.wait),
    };
  }

  // The time of the chosen experiment: T1 for energy loss, T2 for phase loss.
  function timeOf(qubitId, experimentId) {
    var q = qubitById(qubitId);
    return experimentId === "phase" ? q.t2 : q.t1;
  }

  // How much of the starting signal is left after a wait: one exponential.
  function survival(wait, time) {
    return Math.exp(-wait / time);
  }

  // The chance of reading 1 at the start of each experiment, through QedGates. Energy: an X on |0>.
  // Phase: two quarter turns about y on |0> (the even split, then the second turn).
  function startProbability(experimentId) {
    experimentById(experimentId);
    var G = window.QedGates;
    var st = { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } };
    if (experimentId === "energy") {
      st = G.apply(G.gate("x"), st);
    } else {
      st = G.apply(G.rotation("y", 90), st);
      st = G.apply(G.rotation("y", 90), st);
    }
    return round(st.beta.re * st.beta.re + st.beta.im * st.beta.im);
  }

  // The exact chance of reading 1 at any wait, snapped or not: the curve on the plot is drawn
  // between the steps. What is left of the signal goes from the start's chance to the floor.
  function chanceAt(qubitId, experimentId, wait) {
    var e = experimentById(experimentId);
    var r = survival(wait, timeOf(qubitId, experimentId));
    var p = r * startProbability(experimentId) + (1 - r) * e.floor;
    return Math.min(1, Math.max(0, p));
  }

  function probabilityOne(settings) {
    var s = settingsOf(settings);
    return chanceAt(s.qubit, s.experiment, s.wait);
  }

  // SHOTS reads after one wait, seeded. Counts of 0 and 1, simulated.
  function measure(settings, seed) {
    var s = settingsOf(settings);
    var p = probabilityOne(s);
    var r = window.QedShots.sample([1 - p, p], SHOTS, window.QedShots.rng(seed));
    return { settings: s, shots: SHOTS, counts: r.counts, seed: seed, exact: p };
  }

  // The waits of the experiment at every wait: 0 to WAIT_MAX in steps of SWEEP_STEP.
  function sweepWaits() {
    var out = [];
    for (var i = 0; i * SWEEP_STEP <= WAIT_MAX + EPS; i++) out.push(i * SWEEP_STEP);
    return out;
  }

  // The wait-and-read experiment at every wait: at each, prepare, wait, read SHOTS times. Seeded,
  // one stream. Does NOT change any setting: it reports a T. The wait in the settings is ignored.
  function sweep(settings, seed) {
    var s = settingsOf(settings);
    var S = window.QedShots;
    var random = S.rng(seed);
    var points = sweepWaits().map(function (w) {
      var p = chanceAt(s.qubit, s.experiment, w);
      var ones = S.sample([1 - p, p], SHOTS, random).counts[1];
      return { wait: w, exact: p, shots: SHOTS, ones: ones, share: ones / SHOTS };
    });
    return { settings: s, seed: seed, points: points, estimate: estimate(points, s.experiment), actual: timeOf(s.qubit, s.experiment) };
  }

  // Two significant figures.
  function twoFigures(x) {
    return Number(x.toPrecision(2));
  }

  // The reported T: the time whose exponential fits the measured shares best (least squares over
  // all the points), searched over a fixed grid. A straight line through the logarithm of what is
  // left was tried first and is biased for the phase experiment, because points near the floor
  // are kept or dropped by their noise. Null when the best time sits at an edge of the grid, which
  // means the shares show no decay the waits can resolve.
  function estimate(points, experimentId) {
    var e = experimentById(experimentId);
    var start = startProbability(experimentId);
    var best = null;
    for (var T = FIT_FROM; T <= FIT_TO; T *= FIT_RATIO) {
      var sse = 0;
      for (var i = 0; i < points.length; i++) {
        var model = e.floor + (start - e.floor) * survival(points[i].wait, T);
        var d = points[i].share - model;
        sse += d * d;
      }
      if (best === null || sse < best.sse) best = { T: T, sse: sse };
    }
    if (best === null || best.T <= FIT_FROM * FIT_RATIO || best.T >= FIT_TO / FIT_RATIO) return null;
    return { time: twoFigures(best.T), raw: best.T, used: points.length };
  }

  // Where about two-thirds of the fall has happened: after one T, 1 - 1/e of it.
  function timeScaleTick(settings) {
    var s = settingsOf(settings);
    var T = timeOf(s.qubit, s.experiment);
    return { wait: T, fallen: 1 - survival(T, T), chance: chanceAt(s.qubit, s.experiment, T), inRange: T <= WAIT_MAX };
  }

  // The operations of the 04.01.02 timeline, and how many of each fit in a time.
  function fits(time) {
    return window.QedDrive.TIMELINE.map(function (op) {
      return { id: op.id, label: op.label, length: op.length, count: Math.floor(time / op.length + EPS) };
    });
  }

  // The wait that loses a share of what is left: -time x ln(1 - share).
  function budget(time, share) {
    if (share <= 0) return 0;
    if (share >= 1) return Infinity;
    return -time * Math.log(1 - share);
  }

  // The share lost over the Bell circuit's three operations, from the 04.01.02 timeline.
  function bellLoss(settings) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var total = window.QedDrive.TIMELINE.reduce(function (a, op) { return a + op.length; }, 0);
    return { length: total, energy: 1 - survival(total, q.t1), phase: 1 - survival(total, q.t2) };
  }

  // The dots of the flat picture: RUNS fixed positions of the model, not random draws.
  // Positions are unit coordinates, x to the right and y up.
  function meanCos(theta) {
    var sum = 0;
    for (var i = 0; i < RUNS; i++) sum += Math.cos(theta * ((2 * (i + 0.5)) / RUNS - 1));
    return sum / RUNS;
  }
  // The half-width (radians) of the arc the runs spread over so that their average has length r.
  function spreadAngle(r) {
    if (r >= 1) return 0;
    if (r <= 0) return Math.PI;
    var lo = 0, hi = Math.PI;
    for (var k = 0; k < 60; k++) {
      var mid = (lo + hi) / 2;
      if (meanCos(mid) > r) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function runs(settings) {
    var s = settingsOf(settings);
    var r = survival(s.wait, timeOf(s.qubit, s.experiment));
    var dots = [], i;
    if (s.experiment === "energy") {
      for (i = 0; i < RUNS; i++) {
        var fallen = (i + 0.5) / RUNS < 1 - r - EPS; // run i falls at its own quantile of the wait
        var row = i < RUNS / 2 ? 0 : 1;
        var x = ((i % (RUNS / 2)) - (RUNS / 4 - 0.5)) * 0.1;
        var z = fallen ? 1 : -1; // |0> at the top, |1> at the bottom
        dots.push({ i: i, fallen: fallen, x: x, y: z * (1 - row * 0.14), z: z });
      }
      return { view: "energy", dots: dots, fallen: dots.filter(function (d) { return d.fallen; }).length };
    }
    var theta = spreadAngle(r);
    for (i = 0; i < RUNS; i++) {
      var angle = theta * ((2 * (i + 0.5)) / RUNS - 1);
      dots.push({ i: i, angleDeg: (angle * 180) / Math.PI, x: Math.cos(angle), y: Math.sin(angle) });
    }
    return { view: "phase", dots: dots, spreadDeg: (2 * theta * 180) / Math.PI };
  }

  // The average of the runs, as an arrow from the centre.
  function average(settings) {
    var d = runs(settings);
    var sx = 0, sy = 0;
    d.dots.forEach(function (dot) {
      if (d.view === "energy") sy += dot.z; else { sx += dot.x; sy += dot.y; }
    });
    var x = sx / d.dots.length, y = sy / d.dots.length;
    return { view: d.view, x: round(x), y: round(y), length: round(Math.sqrt(x * x + y * y)) };
  }

  // ---- words ------------------------------------------------------------------------
  function chanceWords(settings) {
    var s = settingsOf(settings);
    return "After a wait of " + s.wait + ", the chance of reading 1 is " + pctText(chanceAt(s.qubit, "energy", s.wait)) +
      " in the energy experiment and " + pctText(chanceAt(s.qubit, "phase", s.wait)) + " in the phase experiment.";
  }
  function pctText(x) { return (x * 100).toFixed(1) + "%"; }

  function pictureText(settings) {
    var s = settingsOf(settings);
    var d = runs(s);
    var a = average(s);
    if (d.view === "energy") {
      return "Side view of the energy experiment, with |0⟩ at the top and |1⟩ at the bottom. Of " + RUNS + " runs, " + d.fallen + " have fallen to |0⟩ and " + (RUNS - d.fallen) +
        " are still in |1⟩. The average arrow points " + (a.y < -EPS ? "down, toward |1⟩" : a.y > EPS ? "up, toward |0⟩" : "to the middle") + " and has " + pctText(a.length) + " of full length.";
    }
    return "Top view of the phase experiment. The " + RUNS + " runs start together at the right and are now spread over an arc of " + Math.round(d.spreadDeg) +
      " degrees. The average arrow has " + pctText(a.length) + " of full length.";
  }

  function curveText(settings, sweepResult) {
    var s = settingsOf(settings);
    var text = "The exact chance of reading 1 against the wait, on an invented axis from 0 to " + WAIT_MAX + ", for " + qubitById(s.qubit).label + ". The energy experiment falls from 100% toward 0 and the phase experiment falls from 100% toward 50%. " +
      chanceWords(s);
    if (sweepResult) text += " Measured shares are drawn as open circles for the " + experimentById(s.experiment).label.toLowerCase() + " experiment.";
    return text;
  }

  // ---- rendering --------------------------------------------------------------------
  var PX0 = 46, PX1 = 340, PY0 = 204, PY1 = 76;
  function px(w) { return PX0 + (w / WAIT_MAX) * (PX1 - PX0); }
  function py(p) { return PY0 - p * (PY0 - PY1); }

  // The chance of reading 1 against the wait: both exact curves for the chosen qubit (energy
  // solid, phase dashed), the T of each, the wait now, what has been lost so far on the chosen
  // experiment, and the measured shares as open circles when a sweep has been run.
  function curveSVG(settings, sweepResult) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var parts = [];
    parts.push('<svg class="qed-co__svg qed-co__svg--curve" viewBox="0 0 360 286" role="img" aria-label="' + esc(curveText(s, sweepResult)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<line class="qed-co__legend-energy" x1="10" y1="14" x2="40" y2="14"/>');
    parts.push('<text class="qed-co__text qed-co__text--tick" x="46" y="19">solid: energy (starts in 1)</text>');
    parts.push('<line class="qed-co__legend-phase" x1="10" y1="34" x2="40" y2="34"/>');
    parts.push('<text class="qed-co__text qed-co__text--tick" x="46" y="39">dashed: phase (starts in an even split)</text>');
    parts.push('<line class="qed-co__axis" x1="' + PX0 + '" y1="' + PY0 + '" x2="' + PX1 + '" y2="' + PY0 + '"/>');
    parts.push('<line class="qed-co__axis" x1="' + PX0 + '" y1="' + PY0 + '" x2="' + PX0 + '" y2="' + PY1 + '"/>');
    [0, 0.5, 1].forEach(function (p) {
      parts.push('<text class="qed-co__text qed-co__text--tick" x="' + (PX0 - 6) + '" y="' + (py(p) + 5) + '" text-anchor="end">' + Math.round(p * 100) + "%</text>");
    });
    [0, 200, 400, 600].forEach(function (w) {
      parts.push('<text class="qed-co__text qed-co__text--tick" x="' + px(w) + '" y="' + (PY0 + 16) + '" text-anchor="middle">' + w + "</text>");
    });
    parts.push('<text class="qed-co__text" x="' + (PX0 + (PX1 - PX0) / 2) + '" y="' + (PY0 + 76) + '" text-anchor="middle">wait (invented time units)</text>');
    parts.push('<text class="qed-co__text" x="' + PX0 + '" y="' + (PY1 - 12) + '">chance of reading 1</text>');
    // the two exact curves, not snapped, so they are smooth
    EXPERIMENTS.forEach(function (e) {
      var d = [];
      for (var i = 0; i <= 240; i++) {
        var w = (i * WAIT_MAX) / 240;
        d.push((i === 0 ? "M" : "L") + px(w).toFixed(1) + " " + py(chanceAt(s.qubit, e.id, w)).toFixed(1));
      }
      parts.push('<path class="qed-co__curve qed-co__curve--' + e.id + '" d="' + d.join(" ") + '"/>');
    });
    // the T of each, on its curve and on the axis
    EXPERIMENTS.forEach(function (e, k) {
      var T = e.id === "phase" ? q.t2 : q.t1;
      if (T > WAIT_MAX) return;
      var x = px(T);
      parts.push('<line class="qed-co__drop" x1="' + x + '" y1="' + py(chanceAt(s.qubit, e.id, T)) + '" x2="' + x + '" y2="' + (PY0 + 6) + '"/>');
      parts.push('<circle class="qed-co__tickdot" cx="' + x + '" cy="' + py(chanceAt(s.qubit, e.id, T)).toFixed(1) + '" r="3.6"/>');
      parts.push('<text class="qed-co__text qed-co__text--tick" x="' + x + '" y="' + (PY0 + 34 + k * 16) + '" text-anchor="middle">' + e.time + "</text>");
    });
    // the wait now, and what the chosen experiment has lost so far
    parts.push('<line class="qed-co__now" x1="' + px(s.wait) + '" y1="' + PY0 + '" x2="' + px(s.wait) + '" y2="' + PY1 + '"/>');
    var now = chanceAt(s.qubit, s.experiment, s.wait);
    if (1 - now > 0.01) {
      var bx = px(s.wait);
      parts.push('<path class="qed-co__lost" d="M' + (bx - 5) + " " + py(1) + " L" + (bx + 5) + " " + py(1) + " M" + bx + " " + py(1) + " L" + bx + " " + py(now) + " M" + (bx - 5) + " " + py(now) + " L" + (bx + 5) + " " + py(now) + '"/>');
      var right = s.wait < 450;
      parts.push('<text class="qed-co__text qed-co__text--lost" x="' + (right ? bx + 9 : bx - 9) + '" y="' + ((py(1) + py(now)) / 2 + 5) + '" text-anchor="' + (right ? "start" : "end") + '">lost so far</text>');
    }
    if (sweepResult) {
      sweepResult.points.forEach(function (p) {
        parts.push('<circle class="qed-co__circle" cx="' + px(p.wait).toFixed(1) + '" cy="' + py(p.share).toFixed(1) + '" r="3"/>');
      });
    }
    parts.push("</svg>");
    return parts.join("");
  }

  // The flat picture of the runs and their average: a side view for energy (|0> at the top, |1>
  // at the bottom) and a top view for phase (the even split starts at the right).
  function pictureSVG(settings) {
    var s = settingsOf(settings);
    var d = runs(s);
    var a = average(s);
    var cx = 110, cy = 108, R = 72;
    var parts = [];
    parts.push('<svg class="qed-co__svg qed-co__svg--pic" viewBox="0 0 240 244" role="img" aria-label="' + esc(pictureText(s)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<defs><marker id="qed-co-head" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto"><path d="M0 0 L11 5.5 L0 11 Z" class="qed-co__arrowhead"/></marker></defs>');
    parts.push('<circle class="qed-co__ring" cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>');
    if (d.view === "energy") {
      parts.push('<line class="qed-co__axisline" x1="' + cx + '" y1="' + (cy - R) + '" x2="' + cx + '" y2="' + (cy + R) + '"/>');
      parts.push('<text class="qed-co__text qed-co__text--tick" x="' + cx + '" y="' + (cy - R - 8) + '" text-anchor="middle">|0⟩</text>');
      parts.push('<text class="qed-co__text qed-co__text--tick" x="' + cx + '" y="' + (cy + R + 20) + '" text-anchor="middle">|1⟩</text>');
    } else {
      parts.push('<line class="qed-co__axisline" x1="' + (cx - R) + '" y1="' + cy + '" x2="' + (cx + R) + '" y2="' + cy + '"/>');
      parts.push('<line class="qed-co__axisline" x1="' + cx + '" y1="' + (cy - R) + '" x2="' + cx + '" y2="' + (cy + R) + '"/>');
      parts.push('<text class="qed-co__text qed-co__text--tick" x="' + (cx + R + 6) + '" y="' + (cy + 5) + '">start</text>');
    }
    d.dots.forEach(function (dot) {
      parts.push('<circle class="qed-co__run" cx="' + (cx + dot.x * R).toFixed(1) + '" cy="' + (cy - dot.y * R).toFixed(1) + '" r="3.2"/>');
    });
    if (a.length > 0.02) {
      parts.push('<line class="qed-co__arrow" x1="' + cx + '" y1="' + cy + '" x2="' + (cx + a.x * R).toFixed(1) + '" y2="' + (cy - a.y * R).toFixed(1) + '" marker-end="url(#qed-co-head)"/>');
    } else {
      parts.push('<circle class="qed-co__arrowhead" cx="' + cx + '" cy="' + cy + '" r="3.5"/>');
    }
    parts.push('<circle class="qed-co__run" cx="' + (cx - 76) + '" cy="228" r="3.2"/>');
    parts.push('<text class="qed-co__text qed-co__text--tick" x="' + (cx - 68) + '" y="233">one run</text>');
    parts.push('<line class="qed-co__arrow" x1="' + (cx + 10) + '" y1="228" x2="' + (cx + 34) + '" y2="228" marker-end="url(#qed-co-head)"/>');
    parts.push('<text class="qed-co__text qed-co__text--tick" x="' + (cx + 40) + '" y="233">average</text>');
    parts.push("</svg>");
    return parts.join("");
  }

  // How many operations fit in each of the chosen qubit's two times, as a real table.
  function fitsHTML(settings) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var a = fits(q.t1), b = fits(q.t2);
    var rows = a.map(function (op, i) {
      return '<tr><th scope="row">' + esc(op.label) + " (length " + op.length + ')</th><td data-label="Fit in T1 (' + q.t1 + ')">about ' + op.count + '</td><td data-label="Fit in T2 (' + q.t2 + ')">about ' + b[i].count + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Operation</th><th scope="col">Fit in T1 (' + q.t1 + ')</th><th scope="col">Fit in T2 (' + q.t2 + ")</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  // How long the chosen qubit can wait before a share of its excited runs has fallen.
  function budgetHTML(settings) {
    var s = settingsOf(settings);
    var q = qubitById(s.qubit);
    var rows = [0.01, 0.05, 0.1].map(function (share) {
      return '<tr><th scope="row">' + Math.round(share * 100) + '% of the excited runs have fallen</th><td data-label="Wait">about ' + Math.round(budget(q.t1, share)) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Share lost</th><th scope="col">Wait (T1 is ' + q.t1 + ")</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  return {
    WAIT_MAX: WAIT_MAX,
    WAIT_STEP: WAIT_STEP,
    SWEEP_STEP: SWEEP_STEP,
    SHOTS: SHOTS,
    RUNS: RUNS,
    FIT_FROM: FIT_FROM,
    FIT_TO: FIT_TO,
    QUBITS: QUBITS,
    EXPERIMENTS: EXPERIMENTS,
    DEFAULTS: DEFAULTS,
    qubitById: qubitById,
    experimentById: experimentById,
    snapWait: snapWait,
    settingsOf: settingsOf,
    timeOf: timeOf,
    survival: survival,
    startProbability: startProbability,
    chanceAt: chanceAt,
    probabilityOne: probabilityOne,
    measure: measure,
    sweepWaits: sweepWaits,
    sweep: sweep,
    estimate: estimate,
    timeScaleTick: timeScaleTick,
    fits: fits,
    budget: budget,
    bellLoss: bellLoss,
    spreadAngle: spreadAngle,
    runs: runs,
    average: average,
    chanceWords: chanceWords,
    pictureText: pictureText,
    curveText: curveText,
    curveSVG: curveSVG,
    pictureSVG: pictureSVG,
    fitsHTML: fitsHTML,
    budgetHTML: budgetHTML,
  };
})();
