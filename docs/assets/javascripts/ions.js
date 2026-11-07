// Shared module for Module 04's ion chain: a chain of ions held in a vacuum, two chosen to interact,
// the Bell circuit's three operations on the pair (rotate the first, interact the pair, read out), a
// seeded bright-or-dark readout from photon counts, and an INVENTED cost that grows with the length
// of the chain. Used by docs/04-hardware/trapped-ion-qubits.md (04.02.02).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedIons must run inside a DOMContentLoaded listener.
// readCounts calls QedShots.rng at run time, so shots.js must be loaded first.
//
// Layers, kept apart (same convention as QedNoise / QedChip):
//   model     -> CHAIN_LENGTHS, INTERACTION, READOUT, DEFAULTS, chain, validPair, interactionTime,
//                start, step, readCounts, classify, misreadChances, words. Pure functions, no DOM.
//   rendering -> renderSVG, tableHTML return strings
//   wiring    -> left to each page
//
// Everything here is INVENTED and SIMPLIFIED, and the readout is SIMULATED. The chain lengths, the time
// an interaction takes (a base plus a growth for every ion beyond two, in invented units, and the same
// for any pair in the chain), the mean photon counts of a bright and a dark ion, and the threshold are
// chosen for the teaching page. They are not from any real trap and are not typical of one. "A longer
// chain is harder" is a model of that idea, not a measurement. Every ion starts dark (0). Rotating the
// first ion and interacting the pair make the pair agree, so reading out gives both dark or both bright
// (equal chances), and every other ion dark; each ion's photon count is then a seeded Poisson count with
// the mean for its result, so the counts overlap and a misread is rare but possible. The convention
// "dark is 0 and bright is 1" is this page's own. Nothing here names a species, a vendor, or a machine.
window.QedIons = (function () {
  var ROUND = 1e9; // compare rounded to 1e-9 so a boundary is exact
  var CHAIN_LENGTHS = [3, 6, 9, 12]; // invented
  var INTERACTION = { BASE: 1, GROWTH: 0.25 }; // invented units: BASE, plus GROWTH for every ion beyond two
  var READOUT = { BRIGHT: 12, DARK: 1, THRESHOLD: 4 }; // invented mean photon counts, and a count of THRESHOLD or more reads bright
  var DEFAULTS = { length: 3, first: 1, second: 2 };
  var OPS = [
    { id: "rotate", label: "Rotate the first ion" },
    { id: "interact", label: "Interact the pair" },
    { id: "read", label: "Read out" },
  ];

  function round(x) { return Math.round(x * ROUND) / ROUND; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function checkLength(n) {
    if (CHAIN_LENGTHS.indexOf(n) < 0) throw new Error("QedIons: the chain length must be one of " + CHAIN_LENGTHS.join(", "));
    return n;
  }

  // The ions of a chain, numbered from 1.
  function chain(n) {
    checkLength(n);
    var ions = [];
    for (var i = 1; i <= n; i++) ions.push({ index: i });
    return ions;
  }

  // Any two different ions in the chain can interact, the nearest or the farthest.
  function validPair(n, a, b) {
    checkLength(n);
    function inChain(x) { return typeof x === "number" && Math.floor(x) === x && x >= 1 && x <= n; }
    return inChain(a) && inChain(b) && a !== b;
  }

  // The invented time of an interaction, in invented units. It depends on the length of the chain only.
  function interactionTime(n) {
    checkLength(n);
    return INTERACTION.BASE + INTERACTION.GROWTH * (n - 2);
  }

  // A state with every ion dark and no step done.
  function start(n, a, b) {
    checkLength(n);
    if (!validPair(n, a, b)) throw new Error("QedIons: choose two different ions between 1 and " + n);
    return { n: n, first: a, second: b, done: [], result: null };
  }

  function stepLabel(id) { return OPS.filter(function (o) { return o.id === id; })[0].label; }

  // Seeded Poisson count with the given mean (Knuth's method).
  function poisson(mean, random) {
    var limit = Math.exp(-mean);
    var k = 0;
    var p = 1;
    do {
      k++;
      p *= random();
    } while (p > limit);
    return k - 1;
  }

  // Bright or dark by the threshold.
  function classify(count) {
    return count >= READOUT.THRESHOLD ? "bright" : "dark";
  }

  // The result of reading out a chain whose pair has been linked: the pair agree (both dark or both
  // bright, from the seed), every other ion is dark, and each ion's count is a seeded Poisson count with
  // the mean for what it truly was. reads is what the threshold makes of the counts, and misread says
  // where it differs from the truth.
  function readCounts(state, seed) {
    if (state.done.indexOf("interact") < 0) throw new Error("QedIons: " + stepLabel("interact") + " comes first");
    var random = window.QedShots.rng(seed);
    var pair = random() < 0.5 ? 0 : 1;
    var truth = [];
    var counts = [];
    for (var i = 1; i <= state.n; i++) {
      var t = i === state.first || i === state.second ? pair : 0;
      truth.push(t);
      counts.push(poisson(t === 1 ? READOUT.BRIGHT : READOUT.DARK, random));
    }
    var reads = counts.map(classify);
    return {
      pair: pair,
      truth: truth,
      counts: counts,
      reads: reads,
      misread: reads.map(function (r, i) { return (r === "bright") !== (truth[i] === 1); }),
    };
  }

  // One of the Bell circuit's three operations, in order. Returns a new state and leaves the old one alone.
  function step(state, op, seed) {
    if (!OPS.some(function (o) { return o.id === op; })) throw new Error("QedIons: no step called " + op);
    var expected = OPS[state.done.length];
    if (!expected) throw new Error("QedIons: every step is done. Reset to start again");
    if (op !== expected.id) throw new Error("QedIons: " + expected.label + " comes first");
    var next = { n: state.n, first: state.first, second: state.second, done: state.done.concat([op]), result: null };
    if (op === "read") {
      if (typeof seed !== "number") throw new Error("QedIons: a read out needs a seed");
      next.result = readCounts(next, seed);
    }
    return next;
  }

  // The chance that a dark ion reads bright, and that a bright ion reads dark, from the means and the
  // threshold, by summing the Poisson distribution exactly.
  function cdf(mean, upTo) {
    var term = Math.exp(-mean);
    var sum = 0;
    for (var k = 0; k <= upTo; k++) {
      sum += term;
      term *= mean / (k + 1);
    }
    return sum;
  }
  function misreadChances() {
    var below = READOUT.THRESHOLD - 1;
    return { darkReadsBright: 1 - cdf(READOUT.DARK, below), brightReadsDark: cdf(READOUT.BRIGHT, below) };
  }

  function pctText(x) { return (x * 100).toFixed(2) + "%"; }

  // ---- words ------------------------------------------------------------------------------

  function interactionWords(state) {
    return "Ions " + state.first + " and " + state.second + " can interact, and so can any two ions in the chain. In a chain of " + state.n +
      " the interaction takes " + interactionTime(state.n) + " invented units, whichever two are chosen. That is a simplified rule for \"a longer chain is harder\", not a measurement.";
  }

  function readoutWords(result) {
    var bright = [];
    result.reads.forEach(function (r, i) { if (r === "bright") bright.push(i + 1); });
    var misreads = [];
    result.misread.forEach(function (m, i) { if (m) misreads.push(i + 1); });
    var s = bright.length ? "Bright: " + (bright.length === 1 ? "ion " : "ions ") + bright.join(", ") + ". " : "No ion read bright. ";
    s += "Every other ion read dark. ";
    s += misreads.length ? "Misread: " + (misreads.length === 1 ? "ion " : "ions ") + misreads.join(", ") + ". " : "No ion was misread this time. ";
    return s + "The photon counts overlap, so a misread is rare but possible. These counts are simulated.";
  }

  // The step to do next, in words, for a note beside the buttons.
  function nextWords(state) {
    var next = OPS[state.done.length];
    return next ? "Next: " + next.label + "." : "All three steps are done. Reset to try another pair.";
  }

  // ---- rendering --------------------------------------------------------------------------

  function chainText(state) {
    var s = "A simplified schematic, not a trap and not to scale. A chain of " + state.n + " ions is held between trap electrodes inside a vacuum, with a detector below it. Ion " +
      state.first + " is the first ion and ion " + state.second + " is the second.";
    if (state.done.indexOf("rotate") >= 0) s += " Light has rotated the first ion.";
    if (state.done.indexOf("interact") >= 0) s += " The pair is linked through shared motion.";
    if (state.result) {
      var bright = [];
      state.result.reads.forEach(function (r, i) { if (r === "bright") bright.push(i + 1); });
      s += " After the readout, " + (bright.length ? "ions " + bright.join(" and ") + " are bright and the others are dark." : "every ion is dark.");
    }
    return s;
  }

  // An SVG of the chain. Each ion is a group with a data-ion attribute and its number, so a page can make
  // it a target; the real selectors give keyboard access. Before a readout an ion is an indigo circle;
  // after it a bright ion is a filled circle with rays and a dark ion a hollow circle, so neither depends
  // on color. Colors come from classes in extra.css. The only strings inserted are numbers and fixed labels.
  function renderSVG(state) {
    var n = state.n;
    var x0 = 44, x1 = 376;
    var gap = n > 1 ? (x1 - x0) / (n - 1) : 0;
    function x(i) { return Math.round((x0 + (i - 1) * gap) * 10) / 10; }
    var y = 142, r = Math.min(12, Math.floor(gap / 2) - 3);
    var rotated = state.done.indexOf("rotate") >= 0;
    var linked = state.done.indexOf("interact") >= 0;
    function t(cls, tx, ty, anchor, text) {
      return '<text class="qed-io__text' + (cls ? " qed-io__text--" + cls : "") + '" x="' + tx + '" y="' + ty + '" text-anchor="' + anchor + '">' + text + "</text>";
    }
    var parts = [];
    parts.push('<defs><marker id="qed-io-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path class="qed-io__head" d="M0,0 L10,5 L0,10 z"/></marker></defs>');
    parts.push('<rect class="qed-io__vacuum" x="8" y="40" width="404" height="176" rx="6"/>' + t("tag", 18, 58, "start", "vacuum"));
    parts.push('<rect class="qed-io__electrode" x="14" y="112" width="12" height="60"/><rect class="qed-io__electrode" x="394" y="112" width="12" height="60"/>' + t("tag", 402, 58, "end", "trap electrodes: the end blocks"));
    // the light: always on the first ion, and on the second once the pair interacts
    var lit = [state.first].concat(linked ? [state.second] : []);
    lit.forEach(function (i) {
      parts.push('<line class="qed-io__light" x1="' + (x(i) - 3) + '" y1="22" x2="' + (x(i) - 3) + '" y2="' + (y - r - 2) + '"/><line class="qed-io__light" x1="' + (x(i) + 3) + '" y1="22" x2="' + (x(i) + 3) + '" y2="' + (y - r - 2) + '"/>');
    });
    parts.push(t("", 210, 14, "middle", "light") );
    // the shared-motion link under the chain, once the pair interacts
    if (linked) {
      var a = Math.min(state.first, state.second), b = Math.max(state.first, state.second);
      var xm = (x(a) + x(b)) / 2;
      parts.push('<path class="qed-io__link" d="M' + x(a) + "," + (y + r + 2) + " Q" + xm + "," + (y + r + 52) + " " + x(b) + "," + (y + r + 2) + '"/>' + t("", xm, y + r + 54, "middle", "shared motion"));
    }
    // the readout channel to the detector
    parts.push('<line class="qed-io__arrow" x1="210" y1="216" x2="210" y2="238" marker-end="url(#qed-io-arrow)"/>');
    parts.push('<rect class="qed-io__detector" x="150" y="240" width="120" height="22" rx="3"/>' + t("", 210, 256, "middle", "detector"));
    // the ions
    for (var i = 1; i <= n; i++) {
      var chosen = i === state.first || i === state.second;
      var read = state.result ? state.result.reads[i - 1] : null;
      var cls = "qed-io__ion" + (read ? " qed-io__ion--" + read : " qed-io__ion--unread") + (chosen ? " qed-io__ion--chosen" : "");
      var g = '<g class="qed-io__ionbox" data-ion="' + i + '">';
      if (read === "bright") {
        for (var k = 0; k < 8; k++) {
          var ang = k * Math.PI / 4;
          g += '<line class="qed-io__ray" x1="' + (x(i) + Math.cos(ang) * (r + 2)).toFixed(1) + '" y1="' + (y + Math.sin(ang) * (r + 2)).toFixed(1) + '" x2="' + (x(i) + Math.cos(ang) * (r + 7)).toFixed(1) + '" y2="' + (y + Math.sin(ang) * (r + 7)).toFixed(1) + '"/>';
        }
      }
      g += '<circle class="' + cls + '" cx="' + x(i) + '" cy="' + y + '" r="' + r + '"/>';
      g += t("num", x(i), y + 4, "middle", String(i));
      g += "</g>";
      parts.push(g);
    }
    parts.push(t("tag", 210, 80, "middle", "chain of " + n + " ions, simplified, not to scale"));
    if (state.result) parts.push(t("tag", 210, 100, "middle", "filled with rays: bright. hollow: dark."));
    return '<svg class="qed-io__svg" viewBox="0 0 420 270" role="img" aria-label="' + esc(chainText(state)) + '" xmlns="http://www.w3.org/2000/svg">' + parts.join("") + "</svg>";
  }

  // The ions as a real table: the same facts as the picture, with the words bright and dark.
  function tableHTML(state) {
    var rows = chain(state.n).map(function (ion) {
      var i = ion.index;
      var role = i === state.first ? "first" : i === state.second ? "second" : "other";
      var read = state.result ? state.result.reads[i - 1] : null;
      var count = state.result ? String(state.result.counts[i - 1]) : "not read yet";
      var misread = state.result && state.result.misread[i - 1] ? ' <span class="qed-io__misread">✕ misread</span>' : "";
      return '<tr><th scope="row">Ion ' + i + '</th><td data-label="Role">' + role + '</td><td data-label="Result">' + (read ? esc(read) : "not read yet") +
        '</td><td data-label="Photon count">' + esc(count) + misread + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Ion</th><th scope="col">Role</th><th scope="col">Result</th><th scope="col">Photon count</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  return {
    CHAIN_LENGTHS: CHAIN_LENGTHS,
    INTERACTION: INTERACTION,
    READOUT: READOUT,
    DEFAULTS: DEFAULTS,
    OPS: OPS,
    chain: chain,
    validPair: validPair,
    interactionTime: interactionTime,
    start: start,
    step: step,
    readCounts: readCounts,
    classify: classify,
    misreadChances: misreadChances,
    pctText: pctText,
    interactionWords: interactionWords,
    readoutWords: readoutWords,
    nextWords: nextWords,
    chainText: chainText,
    renderSVG: renderSVG,
    tableHTML: tableHTML,
  };
})();
