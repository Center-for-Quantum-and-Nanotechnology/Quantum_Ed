// Shared module for Module 04's energy ladder: an INVENTED five-level system, where it
// starts, and which steps a drive tuned to the qubit's two levels would also move. Used
// by docs/04-hardware/physical-qubits.md (04.01.01) and intended for 04.01.02 (a drive
// tuned to a step), 04.01.03 (levels told apart at readout), 04.01.04 (decay down the
// ladder), and 04.01.05 (population in a third level, and a parameter that drifts).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages
// that don't call it. Page scripts that use window.QedLadder must run inside a
// DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> levels, startShares, selectivity, verdict. Pure functions, no DOM, and no
//                other module is called.
//   text      -> plain sentences for the shares, the ladder, and the verdict
//   rendering -> renderSVG returns a string
//   wiring    -> left to each page
//
// Everything here is INVENTED and SIMPLIFIED. The system, its units, the tolerance, and
// the thresholds were chosen for the teaching page. They are not from any real device and
// are not typical of one. The ladder is one picture for atoms, ions, and engineered
// circuits: not every qubit is made of levels of different energy (a photon's two
// polarizations have the same energy). In this model the qubit is always the two lowest
// levels, because only the lowest pair can start by itself; real systems choose their two
// levels for other reasons too. The start is a thermal weighting (a share, never a
// certainty). A step "responds" to a drive tuned to the first step when its size is within
// TOLERANCE of the first step's size. Connect, Read, and Keep are NEVER tested here:
// verdict marks them untested, so no page can show them as passed.
window.QedLadder = (function () {
  var LEVEL_COUNT = 5;
  var TOLERANCE = 0.05; // a step responds if it is within 5% of the first step's size
  var START_THRESHOLD = 0.99; // Start passes when the share in |0> is at least this
  var USUALLY = 0.9; // below this the words say "often the wrong level"
  var ROUND = 1e9; // compare rounded to 1e-9 so a boundary is exact
  var MAX_ENERGY = 16; // the tallest ladder (large gap, even spacing), for a fixed drawing scale
  var MAX_STEPS_TOTAL = 4; // four steps: the tallest a ladder can be is four times its first step

  // Each later step is smaller than the one before by this share.
  var SPACINGS = [
    { id: "even", label: "Evenly spaced", share: 0, words: "every step the same size" },
    { id: "slight", label: "Slightly uneven", share: 0.02, words: "each step 2% smaller than the one before" },
    { id: "clear", label: "Clearly uneven", share: 0.1, words: "each step 10% smaller than the one before" },
  ];
  // The first step, in invented units.
  var GAPS = [
    { id: "small", label: "Small", value: 1 },
    { id: "medium", label: "Medium", value: 2 },
    { id: "large", label: "Large", value: 4 },
  ];
  // How much heat there is, in the same invented units as the steps.
  var TEMPERATURES = [
    { id: "warm", label: "Warm", value: 4 },
    { id: "cool", label: "Cool", value: 1 },
    { id: "cold", label: "Cold", value: 0.25 },
  ];
  // The five needs, in this order and these words. Where they overlap, the Platform Card
  // questions use the same words.
  var NEEDS = [
    { id: "start", label: "Start", plain: "Put it in a known state.", tested: true, page: "This page" },
    { id: "control", label: "Control", plain: "Change its state on purpose.", tested: true, page: "This page, and Gates and Control" },
    { id: "connect", label: "Connect", plain: "Let qubits affect each other when we want.", tested: false, page: "Gates and Control, and the platform pages" },
    { id: "read", label: "Read", plain: "Find out what state it is in.", tested: false, page: "Readout" },
    { id: "keep", label: "Keep", plain: "Its state lasts long enough to use.", tested: false, page: "Coherence and Noise" },
  ];
  // Where the learner starts: this fails both tests, so there is something to fix.
  var DEFAULTS = { spacing: "even", gap: "medium", temperature: "warm" };

  function find(list, id, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    throw new Error("QedLadder: no " + what + " called " + id);
  }
  function spacingById(id) { return find(SPACINGS, id, "spacing"); }
  function gapById(id) { return find(GAPS, id, "gap"); }
  function temperatureById(id) { return find(TEMPERATURES, id, "temperature"); }

  function round(x) { return Math.round(x * ROUND) / ROUND; }

  function settingsOf(s) {
    s = s || {};
    return {
      spacing: s.spacing || DEFAULTS.spacing,
      gap: s.gap || DEFAULTS.gap,
      temperature: s.temperature || DEFAULTS.temperature,
    };
  }

  function levelName(i) {
    return i === 0 ? "|0⟩" : i === 1 ? "|1⟩" : "Level " + i;
  }

  // The ladder: five levels with their energies, and the four steps between them. The
  // qubit is the two lowest levels. Arguments are ids ("even", "medium").
  function levels(spacingId, gapId) {
    var sp = spacingById(spacingId);
    var first = gapById(gapId).value;
    var steps = [];
    var size = first;
    for (var i = 0; i < LEVEL_COUNT - 1; i++) {
      steps.push({ index: i + 1, from: i, to: i + 1, size: size });
      size = size * (1 - sp.share);
    }
    var list = [];
    var energy = 0;
    for (var j = 0; j < LEVEL_COUNT; j++) {
      list.push({ index: j, name: levelName(j), energy: energy, qubit: j < 2 });
      if (j < steps.length) energy += steps[j].size;
    }
    return { spacing: sp.id, gap: gapById(gapId).id, levels: list, steps: steps };
  }

  // Where the system starts when left alone at a given temperature: each level is weighted
  // by exp(-energy / temperature) and the weights are shared out. Returns the share in |0>,
  // in |1>, and in a level outside the qubit; they sum to 1. Illustrative, never a
  // certainty. The formula is not shown to a Beginner.
  function startShares(ladder, temperatureId) {
    var t = temperatureById(temperatureId).value;
    var weights = ladder.levels.map(function (l) { return Math.exp(-l.energy / t); });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var zero = weights[0] / total;
    var one = weights[1] / total;
    return { zero: zero, one: one, outside: 1 - zero - one };
  }

  function startWords(zero) {
    if (round(zero) >= START_THRESHOLD) return "almost always starts in |0⟩";
    if (round(zero) >= USUALLY) return "usually starts in |0⟩";
    return "often starts in the wrong level";
  }

  // For a drive tuned to the first step: does each OTHER step respond? A step responds when
  // its size differs from the first step's size by no more than the tolerance (a fraction),
  // compared rounded to 1e-9 so a step exactly at the tolerance responds.
  function selectivity(ladder, tolerance) {
    var tol = tolerance === undefined ? TOLERANCE : tolerance;
    var first = ladder.steps[0].size;
    return ladder.steps.slice(1).map(function (s) {
      var difference = Math.abs(s.size - first) / first;
      return { step: s.index, size: s.size, difference: difference, responds: round(difference) <= round(tol) };
    });
  }

  function isSelective(responses) {
    return responses.every(function (r) { return !r.responds; });
  }

  // A share as text, one decimal place. A thermal share is never exactly 0 or 1, so the
  // ends read "more than 99.9%" and "less than 0.1%", never "100.0%" or "0.0%".
  function shareText(x) {
    if (x >= 0.9995) return ">99.9%";
    if (x < 0.0005) return "<0.1%";
    return (x * 100).toFixed(1) + "%";
  }

  function startSentence(shares) {
    return "In a very large number of starts, the qubit " + startWords(shares.zero) + " (" + shareText(shares.zero) + " in |0⟩, " + shareText(shares.one) + " in |1⟩, " + shareText(shares.outside) + " outside the qubit).";
  }

  function controlSentence(responses) {
    var yes = responses.filter(function (r) { return r.responds; });
    if (yes.length === 0) return "A drive tuned to the first step moves only the qubit's two levels.";
    var which = yes.map(function (r) { return r.step; }).join(", ");
    return "A drive tuned to the first step would also move " + (yes.length === 1 ? "step " : "steps ") + which + ", so the system can leave the qubit's two levels.";
  }

  // The five needs for these settings. Start and Control are computed; Connect, Read, and
  // Keep are never tested here, so they can never be passed.
  function verdict(settings) {
    var s = settingsOf(settings);
    var ladder = levels(s.spacing, s.gap);
    var shares = startShares(ladder, s.temperature);
    var responses = selectivity(ladder);
    var startPass = round(shares.zero) >= START_THRESHOLD;
    var controlPass = isSelective(responses);
    var needs = NEEDS.map(function (n) {
      var out = { id: n.id, label: n.label, plain: n.plain, page: n.page, tested: n.tested, pass: null, detail: "Not tested on this page. Taken up in: " + n.page + "." };
      if (n.id === "start") {
        out.pass = startPass;
        out.detail = startSentence(shares);
      } else if (n.id === "control") {
        out.pass = controlPass;
        out.detail = controlSentence(responses);
      }
      return out;
    });
    var summary = "Passing two needs is not being a qubit. Connect, read, and keep still have to be met, and later pages test them.";
    return { settings: s, ladder: ladder, shares: shares, responses: responses, needs: needs, summary: summary };
  }

  function ladderText(ladder) {
    var steps = ladder.steps.map(function (s) { return "step " + s.index + " is " + s.size.toFixed(2); }).join(", ");
    return "An invented system with five levels. The two lowest are the qubit's |0⟩ and |1⟩, and the other three are outside the qubit. The steps between levels, in invented units: " + steps + ".";
  }

  // An SVG ladder: five levels as bars (the two qubit levels solid and labelled, the
  // others hollow and labelled), the size of each step, and optionally a heat gauge
  // (opts.heat: a temperature id) and a drive arrow on the first step (opts.drive). The
  // drawing scale is fixed, and the picture is cropped to the system's height, so settings can be compared by eye. Colors come
  // from classes in extra.css. The only strings inserted are numbers and fixed labels.
  function renderSVG(ladder, opts) {
    opts = opts || {};
    var W = 372, H = 316, y0 = 288, unit = 15, x1 = 104, x2 = 176, labelX = 70, gaugeX = 80;
    function y(e) { return y0 - e * unit; }
    var heatValue = opts.heat ? temperatureById(opts.heat).value : 0;
    var topEnergy = Math.max(MAX_STEPS_TOTAL * gapById(ladder.gap).value, heatValue);
    var top = Math.round(y(Math.min(topEnergy, MAX_ENERGY + 1)) - 22);
    var parts = [];
    parts.push('<svg class="qed-ld__svg" viewBox="0 ' + top + " " + W + " " + (H - top) + '" role="img" aria-label="' + ladderText(ladder) + '" xmlns="http://www.w3.org/2000/svg">');
    parts.push('<line class="qed-ld__axis" x1="' + x1 + '" y1="' + y0 + '" x2="' + x2 + '" y2="' + y0 + '"/>');
    if (opts.heat) {
      var t = Math.min(temperatureById(opts.heat).value, MAX_ENERGY + 1);
      parts.push('<rect class="qed-ld__heat" x="' + gaugeX + '" y="' + y(t) + '" width="14" height="' + (t * unit) + '"/>');
      parts.push('<text class="qed-ld__text qed-ld__text--heat" x="' + (gaugeX + 7) + '" y="' + (y0 + 16) + '" text-anchor="middle">heat</text>');
      parts.push('<line class="qed-ld__heatline" x1="' + (gaugeX + 14) + '" y1="' + y(t) + '" x2="' + x2 + '" y2="' + y(t) + '"/>');
    }
    ladder.steps.forEach(function (s) {
      var ya = y(ladder.levels[s.from].energy), yb = y(ladder.levels[s.to].energy);
      parts.push('<line class="qed-ld__bracket" x1="292" y1="' + ya + '" x2="292" y2="' + yb + '"/>');
      parts.push('<text class="qed-ld__text" x="298" y="' + ((ya + yb) / 2 + 4) + '">step ' + s.index + ": " + s.size.toFixed(2) + "</text>");
    });
    ladder.levels.forEach(function (l) {
      var yy = y(l.energy);
      parts.push('<rect class="qed-ld__level qed-ld__level--' + (l.qubit ? "qubit" : "outside") + '" x="' + x1 + '" y="' + (yy - 3) + '" width="' + (x2 - x1) + '" height="6" rx="2"/>');
      parts.push('<text class="qed-ld__text qed-ld__text--' + (l.qubit ? "qubit" : "outside") + '" x="' + labelX + '" y="' + (yy + 4) + '" text-anchor="end">' + l.name + "</text>");
      parts.push('<text class="qed-ld__text qed-ld__text--tag" x="' + (x2 + 8) + '" y="' + (yy + 4) + '">' + (l.qubit ? "qubit" : "outside the qubit") + "</text>");
    });
    if (opts.drive && ladder.steps.length) {
      var s0 = ladder.steps[0];
      var ya0 = y(ladder.levels[s0.from].energy), yb0 = y(ladder.levels[s0.to].energy);
      var xm = x1 + 14;
      parts.push('<line class="qed-ld__drive" x1="' + (xm - 2) + '" y1="' + (ya0 - 4) + '" x2="' + (xm - 2) + '" y2="' + (yb0 + 6) + '"/>');
      parts.push('<line class="qed-ld__drive" x1="' + (xm + 2) + '" y1="' + (ya0 - 4) + '" x2="' + (xm + 2) + '" y2="' + (yb0 + 6) + '"/>');
      parts.push('<text class="qed-ld__text qed-ld__text--drive" x="' + (xm + 8) + '" y="' + ((ya0 + yb0) / 2 + 4) + '">drive</text>');
    }
    parts.push("</svg>");
    return parts.join("");
  }

  return {
    LEVEL_COUNT: LEVEL_COUNT,
    TOLERANCE: TOLERANCE,
    START_THRESHOLD: START_THRESHOLD,
    SPACINGS: SPACINGS,
    GAPS: GAPS,
    TEMPERATURES: TEMPERATURES,
    NEEDS: NEEDS,
    DEFAULTS: DEFAULTS,
    spacingById: spacingById,
    gapById: gapById,
    temperatureById: temperatureById,
    levels: levels,
    startShares: startShares,
    startWords: startWords,
    shareText: shareText,
    selectivity: selectivity,
    isSelective: isSelective,
    verdict: verdict,
    startSentence: startSentence,
    controlSentence: controlSentence,
    ladderText: ladderText,
    renderSVG: renderSVG,
  };
})();
