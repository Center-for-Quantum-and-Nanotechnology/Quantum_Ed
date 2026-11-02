// Shared module for Module 04's readout model: two overlapping, bell-shaped signals (one for a
// qubit that started in 0, one for 1), a readout threshold that sorts a signal into 0 or 1, the
// exact share of reads that go wrong, seeded shots with a true state, a signal, and a reported
// value each, and a seeded threshold-finding experiment. Used by
// docs/04-hardware/readout.md (04.01.03) and intended for 04.01.04 (a signal that fades with
// waiting, read with the same threshold) and 04.01.05 (a separation that drifts, and a threshold
// that has to be found again).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedReadout must run inside a DOMContentLoaded
// listener. It calls QedShots and QedGates at run time, so they must be loaded first.
//
// Layers, kept apart (same convention as QedDrive / QedLadder):
//   model     -> normalCdf, snapThreshold, misreads, signals, preparedProbabilities, read,
//                sweep, bestThreshold, shareText, misreadWords, thresholdWords. Pure
//                functions, no DOM.
//   rendering -> signalSVG, dotsSVG, sweepSVG, tableHTML return strings
//   wiring    -> left to each page
//
// Everything here is INVENTED and SIMPLIFIED. The signal axis (0 to 12), the two means, the
// spread of 1, and the 10% fall-back are invented units, not from any real device. Each signal
// is a bell-shaped spread around its mean, and a read is reported 1 exactly when its signal is
// above the threshold. The fall-back is a simplified picture: when it is on, a fixed share of
// the shots that began in 1 give the signal of a 0 (a real fall-back is spread over the
// readout). "True" means the state when the read began, so a fall-back counts as a misread of
// that state. Only this model knows the true state; a real device sees only the reported
// value. Counts are simulated and seeded. The even split's chance of 1 comes from QedGates
// (an H on |0>), so it agrees with Module 02. The sweep does not recalibrate anything: it
// reports a threshold. Drift over time and the recalibration loop are 04.01.05.
window.QedReadout = (function () {
  var AXIS_MAX = 12;
  var MEAN_ZERO = 3;
  var SPREAD = 1;
  var THRESHOLD_STEP = 0.25;
  var SWEEP_STEP = 0.5;
  var SHOTS = 100;
  var EPS = 1e-9; // compare rounded to 1e-9

  // The distance between the two means, in invented signal units.
  var SEPARATIONS = [
    { id: "close", label: "Close", distance: 2 },
    { id: "medium", label: "Medium", distance: 4 },
    { id: "far", label: "Far apart", distance: 6 },
  ];
  // The share of the shots that began in 1 that give the signal of a 0.
  var FALLBACKS = [
    { id: "off", label: "Off", share: 0 },
    { id: "on", label: "On", share: 0.1 },
  ];
  // What the qubit is in when the read begins.
  var PREPARED = [
    { id: "zero", label: "|0⟩", gate: null },
    { id: "one", label: "|1⟩", gate: "x" },
    { id: "split", label: "An even split", gate: "h" },
  ];
  var DEFAULTS = { prepared: "zero", separation: "medium", fallback: "off", threshold: 4 };

  function find(list, id, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    throw new Error("QedReadout: no " + what + " called " + id);
  }
  function separationById(id) { return find(SEPARATIONS, id, "separation"); }
  function fallbackById(id) { return find(FALLBACKS, id, "fall-back"); }
  function preparedById(id) { return find(PREPARED, id, "prepared state"); }

  function round(x) { return Math.round(x * 1e9) / 1e9; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // A threshold typed or slid to, clamped to 0..AXIS_MAX and snapped to the slider step.
  function snapThreshold(x) {
    var n = Number(x);
    if (!isFinite(n)) n = DEFAULTS.threshold;
    n = Math.min(AXIS_MAX, Math.max(0, n));
    return Math.round(n / THRESHOLD_STEP) * THRESHOLD_STEP;
  }

  function settingsOf(s) {
    s = s || {};
    return {
      prepared: s.prepared || DEFAULTS.prepared,
      separation: s.separation || DEFAULTS.separation,
      fallback: s.fallback || DEFAULTS.fallback,
      threshold: snapThreshold(s.threshold === undefined ? DEFAULTS.threshold : s.threshold),
    };
  }

  // The two means: a 0 gives a signal around MEAN_ZERO, a 1 around MEAN_ZERO + distance.
  function means(settings) {
    var s = settingsOf(settings);
    var d = separationById(s.separation).distance;
    return { zero: MEAN_ZERO, one: MEAN_ZERO + d, middle: MEAN_ZERO + d / 2, distance: d };
  }

  // The standard normal cumulative share (the chance of a value at or below z). The tail is
  // computed from erfc (Abramowitz and Stegun 7.1.26, error under 1.5e-7), so a small tail
  // keeps its precision and the two sides are exact mirror images.
  function erfcPositive(x) {
    var t = 1 / (1 + 0.3275911 * x);
    var poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    return poly * Math.exp(-x * x);
  }
  function normalCdf(z) {
    if (z === 0) return 0.5;
    var tail = 0.5 * erfcPositive(Math.abs(z) / Math.SQRT2);
    var p = z > 0 ? 1 - tail : tail;
    return Math.min(1, Math.max(0, p));
  }

  function pdf(x, mean) {
    var z = (x - mean) / SPREAD;
    return Math.exp(-0.5 * z * z) / (SPREAD * Math.sqrt(2 * Math.PI));
  }

  // The exact share of 0s read as 1 and of 1s read as 0 at the threshold, from the model. A 1
  // that fell back gives the 0 signal, so a share of the 1s is misread whatever the threshold.
  function misreads(settings) {
    var s = settingsOf(settings);
    return misreadsAt(s, s.threshold);
  }

  // The same at any threshold, snapped or not: the curve on the plot is drawn between the steps.
  function misreadsAt(s, threshold) {
    var m = means(s);
    var f = fallbackById(s.fallback).share;
    var zeroAsOne = 1 - normalCdf((threshold - m.zero) / SPREAD);
    var oneAsZero = (1 - f) * normalCdf((threshold - m.one) / SPREAD) + f * normalCdf((threshold - m.zero) / SPREAD);
    return {
      threshold: threshold,
      zeroAsOne: zeroAsOne,
      oneAsZero: oneAsZero,
      zeroRight: 1 - zeroAsOne,
      oneRight: 1 - oneAsZero,
      total: zeroAsOne + oneAsZero,
      middle: m.middle,
    };
  }

  // The two curves as points: how likely each signal value is for a qubit that started in 0 and
  // in 1 (the 1 curve includes the fall-back). Drawing only.
  function signals(settings, step) {
    var s = settingsOf(settings);
    var m = means(s);
    var f = fallbackById(s.fallback).share;
    var dx = step || 0.1;
    var x = [], zero = [], one = [];
    for (var i = 0; i * dx <= AXIS_MAX + EPS; i++) {
      var v = round(i * dx);
      x.push(v);
      zero.push(pdf(v, m.zero));
      one.push((1 - f) * pdf(v, m.one) + f * pdf(v, m.zero));
    }
    return { x: x, zero: zero, one: one };
  }

  // The chance of 1 when the read begins, for each preparation. The even split comes from QedGates
  // (an H on |0>), so it agrees with Module 02.
  function preparedProbabilities(id) {
    var p = preparedById(id);
    var G = window.QedGates;
    var st = { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } };
    if (p.gate) st = G.apply(G.gate(p.gate), st);
    var p1 = round(st.beta.re * st.beta.re + st.beta.im * st.beta.im);
    return { p0: round(1 - p1), p1: p1 };
  }

  // One signal from a seeded stream: the mean plus a bell-shaped spread (Box-Muller).
  function normalDraw(random) {
    var u1 = 1 - random(); // in (0, 1]
    var u2 = random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  // SHOTS reads of the prepared state, seeded. Each shot: the state it started in (known only to
  // this model), whether it fell back, its signal, and the value reported (1 when the signal is
  // above the threshold). Every count is derived from these shots. Simulated, never from a device.
  function read(settings, prepared, seed) {
    var s = settingsOf(settings);
    var m = means(s);
    var f = fallbackById(s.fallback).share;
    var p1 = preparedProbabilities(prepared || s.prepared).p1;
    var random = window.QedShots.rng(seed);
    var shots = [];
    for (var i = 0; i < SHOTS; i++) {
      var started = random() < p1 ? 1 : 0;
      var fall = random(); // always drawn, so switching the fall-back leaves the other draws alone
      var fellBack = started === 1 && fall < f;
      var mean = started === 1 && !fellBack ? m.one : m.zero;
      var signal = mean + SPREAD * normalDraw(random);
      shots.push({ started: started, fellBack: fellBack, signal: signal, reported: signal > s.threshold ? 1 : 0 });
    }
    return summarize(s, prepared || s.prepared, seed, shots);
  }

  function summarize(s, prepared, seed, shots) {
    var table = [[0, 0], [0, 0]]; // rows: started in 0, 1; columns: reported 0, 1
    var fellBack = 0;
    shots.forEach(function (x) {
      table[x.started][x.reported]++;
      if (x.fellBack) fellBack++;
    });
    var started = [table[0][0] + table[0][1], table[1][0] + table[1][1]];
    var reported = [table[0][0] + table[1][0], table[0][1] + table[1][1]];
    return {
      settings: s,
      prepared: prepared,
      seed: seed,
      shots: shots,
      count: shots.length,
      table: table,
      started: started,
      reported: reported,
      misreads: table[0][1] + table[1][0],
      fellBack: fellBack,
    };
  }

  // The threshold-finding experiment: at each of 25 thresholds, prepare |0> and read SHOTS
  // times, prepare |1> and read SHOTS times, and count the misreads out of 2 x SHOTS. The counts
  // are drawn from the exact misread shares, with one seeded stream. Does NOT change any
  // setting: it reports a threshold.
  function sweepThresholds() {
    var out = [];
    for (var i = 0; i * SWEEP_STEP <= AXIS_MAX + EPS; i++) out.push(i * SWEEP_STEP);
    return out;
  }

  function sweep(settings, seed) {
    var s = settingsOf(settings);
    var S = window.QedShots;
    var random = S.rng(seed);
    var points = sweepThresholds().map(function (t) {
      var e = misreads({ prepared: s.prepared, separation: s.separation, fallback: s.fallback, threshold: t });
      var z = S.sample([1 - e.zeroAsOne, e.zeroAsOne], SHOTS, random).counts[1];
      var o = S.sample([1 - e.oneAsZero, e.oneAsZero], SHOTS, random).counts[1];
      return {
        threshold: t,
        zeroMisreads: z,
        oneMisreads: o,
        misreads: z + o,
        reads: 2 * SHOTS,
        share: (z + o) / (2 * SHOTS),
        exact: e.total / 2,
      };
    });
    return { settings: s, seed: seed, points: points, best: bestThreshold(points) };
  }

  // The threshold with the fewest misreads. The bottom is flat, so every threshold tied for the
  // fewest is listed, and the threshold reported is the middle of them. `point` is the swept
  // threshold nearest that middle (the lower one when two are as near), for the measured shares.
  function bestThreshold(points) {
    var low = Math.min.apply(null, points.map(function (p) { return p.misreads; }));
    var tied = points.filter(function (p) { return p.misreads === low; });
    var ts = tied.map(function (p) { return p.threshold; });
    var middle = (ts[0] + ts[ts.length - 1]) / 2;
    var point = tied[0];
    tied.forEach(function (p) {
      if (Math.abs(p.threshold - middle) < Math.abs(point.threshold - middle) - EPS) point = p;
    });
    var reads = point.reads;
    return {
      threshold: middle,
      misreads: low,
      share: low / reads,
      tied: ts,
      point: point,
      zeroShare: point.zeroMisreads / (reads / 2),
      oneShare: point.oneMisreads / (reads / 2),
    };
  }

  // A share as text. Never "100.0%" or "0.0%": a tiny share reads "under 0.1%".
  function shareText(x) {
    var p = x * 100;
    if (p < 0.05) return "under 0.1%";
    if (p > 99.95) return "over 99.9%";
    return p.toFixed(1) + "%";
  }

  // The plain words for how often a misread happens.
  function misreadWords(share) {
    var p = round(share);
    if (p < 0.01) return "almost never";
    if (p < 0.05) return "rarely";
    if (p < 0.2) return "sometimes";
    return "often";
  }

  // The plain words for where the threshold sits against the middle of the two signals.
  function thresholdWords(settings) {
    var s = settingsOf(settings);
    var mid = means(s).middle;
    var d = round(s.threshold - mid);
    if (Math.abs(d) <= EPS) return "at the middle of the two signals";
    return d < 0 ? "below the middle of the two signals, so more 0s are read as 1" : "above the middle of the two signals, so more 1s are read as 0";
  }

  // One sentence for the two exact shares.
  function sharesWords(settings) {
    var m = misreads(settings);
    return "A qubit that started in 0 is read as 1 " + misreadWords(m.zeroAsOne) + " (" + shareText(m.zeroAsOne) + "). A qubit that started in 1 is read as 0 " + misreadWords(m.oneAsZero) + " (" + shareText(m.oneAsZero) + ").";
  }

  // ---- rendering --------------------------------------------------------------------
  var X0 = 30, X1 = 350;
  function px(v) { return X0 + (Math.min(AXIS_MAX, Math.max(0, v)) / AXIS_MAX) * (X1 - X0); }

  function ticks(parts, base, cls) {
    parts.push('<line class="qed-ro__axis" x1="' + X0 + '" y1="' + base + '" x2="' + X1 + '" y2="' + base + '"/>');
    [0, 3, 6, 9, 12].forEach(function (v) {
      parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + px(v) + '" y="' + (base + 16) + '" text-anchor="middle">' + v + "</text>");
    });
  }

  // The two bell-shaped signals. opts.threshold (default true) draws the threshold and the
  // shaded misread tails; opts.overlap (default false) marks where the two signals overlap.
  function signalSVG(settings, opts) {
    opts = opts || {};
    var s = settingsOf(settings);
    var m = means(s);
    var sig = signals(s);
    var showThreshold = opts.threshold !== false;
    var BASE = 160, SCALE = 250;
    function py(d) { return BASE - d * SCALE; }
    function line(values) {
      return values.map(function (d, i) { return (i === 0 ? "M" : "L") + px(sig.x[i]).toFixed(1) + " " + py(d).toFixed(1); }).join(" ");
    }
    // The area under a curve between the threshold and an end of the axis.
    function area(values, density, from, to) {
      var pts = [[from, density(from)]];
      sig.x.forEach(function (v, i) { if (v > from + EPS && v < to - EPS) pts.push([v, values[i]]); });
      pts.push([to, density(to)]);
      return "M" + px(from).toFixed(1) + " " + BASE + " " + pts.map(function (p) { return "L" + px(p[0]).toFixed(1) + " " + py(p[1]).toFixed(1); }).join(" ") + " L" + px(to).toFixed(1) + " " + BASE + " Z";
    }
    var f = fallbackById(s.fallback).share;
    function oneDensity(v) { return (1 - f) * pdf(v, m.one) + f * pdf(v, m.zero); }
    var parts = [];
    parts.push('<svg class="qed-ro__svg" viewBox="0 0 360 236" role="img" aria-label="' + esc(signalText(s, opts)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<defs><pattern id="qed-ro-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="qed-ro__hatch-bg"/><line x1="0" y1="0" x2="0" y2="6" class="qed-ro__hatch-line"/></pattern></defs>');
    if (opts.overlap) {
      var lo = m.one - 2 * SPREAD, hi = m.zero + 2 * SPREAD;
      if (lo < hi) {
        parts.push('<rect class="qed-ro__overlap" x="' + px(lo) + '" y="44" width="' + (px(hi) - px(lo)) + '" height="' + (BASE - 44) + '"/>');
        parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + ((px(lo) + px(hi)) / 2) + '" y="' + (BASE - 6) + '" text-anchor="middle">overlap</text>');
      }
    }
    if (showThreshold) {
      parts.push('<path class="qed-ro__tail" d="' + area(sig.zero, function (v) { return pdf(v, m.zero); }, s.threshold, AXIS_MAX) + '"/>');
      parts.push('<path class="qed-ro__tail" d="' + area(sig.one, oneDensity, 0, s.threshold) + '"/>');
    }
    parts.push('<path class="qed-ro__curve qed-ro__curve--zero" d="' + line(sig.zero) + '"/>');
    parts.push('<path class="qed-ro__curve qed-ro__curve--one" d="' + line(sig.one) + '"/>');
    parts.push('<text class="qed-ro__text qed-ro__text--readout" x="' + (px(m.zero) - 4) + '" y="34" text-anchor="end">signal from 0</text>');
    parts.push('<text class="qed-ro__text qed-ro__text--readout" x="' + (px(m.one) + 4) + '" y="34" text-anchor="start">signal from 1</text>');
    ticks(parts, BASE, "");
    parts.push('<text class="qed-ro__text" x="' + (X0 + (X1 - X0) / 2) + '" y="196" text-anchor="middle">signal (invented units)</text>');
    if (showThreshold) {
      parts.push('<line class="qed-ro__threshold" x1="' + px(s.threshold) + '" y1="46" x2="' + px(s.threshold) + '" y2="' + BASE + '"/>');
      var anchor = s.threshold < 2 ? "start" : s.threshold > 10 ? "end" : "middle";
      parts.push('<text class="qed-ro__text qed-ro__text--threshold" x="' + px(s.threshold) + '" y="14" text-anchor="' + anchor + '">readout threshold ' + s.threshold + "</text>");
      parts.push('<rect class="qed-ro__swatch" x="' + X0 + '" y="212" width="14" height="14"/>');
      parts.push('<text class="qed-ro__text" x="' + (X0 + 20) + '" y="224">✕ misread</text>');
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function signalText(settings, opts) {
    var s = settingsOf(settings);
    var m = means(s);
    var text = "Two overlapping bell-shaped signals on an invented axis from 0 to " + AXIS_MAX + ". The signal from 0 is centred at " + m.zero + " and the signal from 1 at " + m.one + ".";
    if (fallbackById(s.fallback).share > 0) text += " Some of the signal from 1 sits at the signal of a 0, because some 1s fell back during the read.";
    if (!opts || opts.threshold !== false) text += " The readout threshold is at " + s.threshold + ", " + thresholdWords(s) + ". " + sharesWords(s);
    return text;
  }

  // The shots as a stack of dots at their signals: a circle for a shot that started in 0, a
  // square for one that started in 1, and a cross through a misread.
  function dotsSVG(result) {
    var s = result.settings;
    var BIN = 0.25, STEP = 8;
    var bins = {};
    var maxStack = 1;
    var placed = result.shots.map(function (x) {
      var key = Math.floor(Math.min(AXIS_MAX - 1e-6, Math.max(0, x.signal)) / BIN);
      bins[key] = (bins[key] || 0) + 1;
      if (bins[key] > maxStack) maxStack = bins[key];
      return { shot: x, key: key, level: bins[key] };
    });
    var height = maxStack * STEP + 4;
    var BASE = height + 8;
    var parts = [];
    parts.push('<svg class="qed-ro__svg qed-ro__svg--dots" viewBox="0 0 360 ' + (BASE + 54) + '" role="img" aria-label="' + esc(dotsText(result)) + '" xmlns="http://www.w3.org/2000/svg">');
    placed.forEach(function (p) {
      var cx = px((p.key + 0.5) * BIN);
      var cy = BASE - 4 - (p.level - 0.5) * STEP;
      var wrong = p.shot.started !== p.shot.reported;
      var cls = "qed-ro__dot" + (wrong ? " qed-ro__dot--wrong" : "");
      if (p.shot.started === 0) parts.push('<circle class="' + cls + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="3.4"/>');
      else parts.push('<rect class="' + cls + '" x="' + (cx - 3.2).toFixed(1) + '" y="' + (cy - 3.2).toFixed(1) + '" width="6.4" height="6.4"/>');
      if (wrong) {
        parts.push('<path class="qed-ro__cross" d="M' + (cx - 2.4).toFixed(1) + " " + (cy - 2.4).toFixed(1) + " L" + (cx + 2.4).toFixed(1) + " " + (cy + 2.4).toFixed(1) + " M" + (cx + 2.4).toFixed(1) + " " + (cy - 2.4).toFixed(1) + " L" + (cx - 2.4).toFixed(1) + " " + (cy + 2.4).toFixed(1) + '"/>');
      }
    });
    parts.push('<line class="qed-ro__threshold" x1="' + px(s.threshold) + '" y1="2" x2="' + px(s.threshold) + '" y2="' + BASE + '"/>');
    ticks(parts, BASE, "");
    parts.push('<text class="qed-ro__text" x="' + (X0 + (X1 - X0) / 2) + '" y="' + (BASE + 34) + '" text-anchor="middle">signal (invented units), one mark per shot</text>');
    parts.push('<circle class="qed-ro__dot" cx="' + (X0 + 4) + '" cy="' + (BASE + 48) + '" r="3.4"/>');
    parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + (X0 + 12) + '" y="' + (BASE + 52) + '">started in 0</text>');
    parts.push('<rect class="qed-ro__dot" x="' + (X0 + 100) + '" y="' + (BASE + 44.8) + '" width="6.4" height="6.4"/>');
    parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + (X0 + 112) + '" y="' + (BASE + 52) + '">started in 1</text>');
    parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + (X0 + 205) + '" y="' + (BASE + 52) + '">✕ misread</text>');
    parts.push("</svg>");
    return parts.join("");
  }

  function dotsText(result) {
    return "One mark for each of " + result.count + " simulated shots, placed at its signal: " + result.started[0] + " started in 0 and " + result.started[1] + " started in 1. " + result.misreads + " were misread.";
  }

  // The share of misreads against the threshold: the exact line, the measured shares as open
  // circles (when a sweep has been run), the threshold now, and the threshold reported.
  function sweepSVG(settings, sweepResult) {
    var s = settingsOf(settings);
    var X0b = 46, X1b = 340, Y0 = 170, Y1 = 24;
    function qx(v) { return X0b + (v / AXIS_MAX) * (X1b - X0b); }
    function qy(p) { return Y0 - (p / 0.5) * (Y0 - Y1); }
    var parts = [];
    parts.push('<svg class="qed-ro__svg qed-ro__svg--sweep" viewBox="0 0 360 228" role="img" aria-label="' + esc(sweepText(s, sweepResult)) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<line class="qed-ro__axis" x1="' + X0b + '" y1="' + Y0 + '" x2="' + X1b + '" y2="' + Y0 + '"/>');
    parts.push('<line class="qed-ro__axis" x1="' + X0b + '" y1="' + Y0 + '" x2="' + X0b + '" y2="' + Y1 + '"/>');
    [0, 0.25, 0.5].forEach(function (p) {
      parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + (X0b - 6) + '" y="' + (qy(p) + 4) + '" text-anchor="end">' + Math.round(p * 100) + "%</text>");
    });
    [0, 3, 6, 9, 12].forEach(function (v) {
      parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + qx(v) + '" y="' + (Y0 + 16) + '" text-anchor="middle">' + v + "</text>");
    });
    parts.push('<text class="qed-ro__text" x="' + (X0b + (X1b - X0b) / 2) + '" y="224" text-anchor="middle">readout threshold (invented units)</text>');
    parts.push('<text class="qed-ro__text" x="' + X0b + '" y="14">share of reads that are misread</text>');
    var d = [];
    for (var i = 0; i <= 240; i++) {
      var t = (i * AXIS_MAX) / 240;
      var e = misreadsAt(s, t); // not snapped, so the line is smooth
      d.push((i === 0 ? "M" : "L") + qx(t).toFixed(1) + " " + qy(e.total / 2).toFixed(1));
    }
    parts.push('<path class="qed-ro__exact" d="' + d.join(" ") + '"/>');
    parts.push('<line class="qed-ro__now" x1="' + qx(s.threshold) + '" y1="' + Y0 + '" x2="' + qx(s.threshold) + '" y2="' + Y1 + '"/>');
    if (sweepResult) {
      sweepResult.points.forEach(function (p) {
        parts.push('<circle class="qed-ro__circle" cx="' + qx(p.threshold).toFixed(1) + '" cy="' + qy(p.share).toFixed(1) + '" r="3"/>');
      });
      parts.push('<line class="qed-ro__best" x1="' + qx(sweepResult.best.threshold) + '" y1="' + Y0 + '" x2="' + qx(sweepResult.best.threshold) + '" y2="' + (Y0 + 6) + '"/>');
      parts.push('<text class="qed-ro__text qed-ro__text--tick" x="' + qx(sweepResult.best.threshold) + '" y="' + (Y0 + 30) + '" text-anchor="middle">fewest</text>');
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function sweepText(settings, sweepResult) {
    var s = settingsOf(settings);
    var text = "The exact share of reads that are misread, against the readout threshold on an invented axis from 0 to " + AXIS_MAX + ". It is high at both ends and lowest near the middle of the two signals. The threshold is now " + s.threshold + ".";
    if (sweepResult) text += " Measured shares are drawn as open circles. The fewest misreads were seen at threshold " + sweepResult.best.threshold + ".";
    return text;
  }

  // The true-by-reported table as HTML (a real table, stacked on a phone). Only numbers and
  // fixed words go in.
  function tableHTML(result) {
    var rows = [0, 1].map(function (r) {
      return '<tr><th scope="row">Really started in ' + r + '</th>' +
        '<td data-label="Reported 0">' + cell(result, r, 0) + "</td>" +
        '<td data-label="Reported 1">' + cell(result, r, 1) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">What this model knows</th><th scope="col">Reported 0 (what a device sees)</th><th scope="col">Reported 1 (what a device sees)</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }
  function cell(result, started, reported) {
    var n = result.table[started][reported];
    return n + (started !== reported && n > 0 ? " ✕ misread" : "");
  }

  return {
    AXIS_MAX: AXIS_MAX,
    MEAN_ZERO: MEAN_ZERO,
    SPREAD: SPREAD,
    THRESHOLD_STEP: THRESHOLD_STEP,
    SWEEP_STEP: SWEEP_STEP,
    SHOTS: SHOTS,
    SEPARATIONS: SEPARATIONS,
    FALLBACKS: FALLBACKS,
    PREPARED: PREPARED,
    DEFAULTS: DEFAULTS,
    separationById: separationById,
    fallbackById: fallbackById,
    preparedById: preparedById,
    snapThreshold: snapThreshold,
    settingsOf: settingsOf,
    means: means,
    normalCdf: normalCdf,
    misreads: misreads,
    signals: signals,
    preparedProbabilities: preparedProbabilities,
    read: read,
    sweepThresholds: sweepThresholds,
    sweep: sweep,
    bestThreshold: bestThreshold,
    shareText: shareText,
    misreadWords: misreadWords,
    thresholdWords: thresholdWords,
    sharesWords: sharesWords,
    signalText: signalText,
    dotsText: dotsText,
    sweepText: sweepText,
    signalSVG: signalSVG,
    dotsSVG: dotsSVG,
    sweepSVG: sweepSVG,
    tableHTML: tableHTML,
  };
})();
