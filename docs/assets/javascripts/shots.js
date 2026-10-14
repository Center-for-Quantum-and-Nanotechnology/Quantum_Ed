// Shared measurement-shot module: sample repeated outcomes from a list of
// probabilities, and draw the results as bars with text counts.
//
// Used by the Module 02 pages that show repeated measurements (02.01 Quantum
// States, and later 02.05 Multi-Qubit Systems and 02.07 Measurement), and
// available to any page that shows counts. Loaded site-wide via
// extra_javascript like the other shared modules; a no-op on pages that don't
// call it. Page scripts that use window.QedShots must run inside a
// DOMContentLoaded listener.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   sampling -> rng(), sample(), session(): pure data, no DOM
//   display  -> renderHTML(), describe(): pure functions returning strings
//   wiring   -> left to each page
//
// Sampling is seeded and deterministic: the same seed always gives the same
// sequence, and a session advances through that sequence on each run, so a
// page shows the same first run on every load while "run again" still gives
// new results. Every result is an ideal, noiseless simulation and should be
// labelled "simulated" wherever it is shown.
window.QedShots = (function () {
  // Small, fast, well-known seeded generator (mulberry32). Returns numbers in [0, 1).
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function checkProbs(probs) {
    if (!Array.isArray(probs) || probs.length < 1) {
      throw new Error("QedShots: probs must be a non-empty array");
    }
    var sum = 0;
    for (var i = 0; i < probs.length; i++) {
      var p = probs[i];
      if (typeof p !== "number" || !isFinite(p) || p < 0) {
        throw new Error("QedShots: every probability must be a finite number >= 0");
      }
      sum += p;
    }
    if (Math.abs(sum - 1) > 1e-9) {
      throw new Error("QedShots: probabilities must sum to 1 (got " + sum + ")");
    }
  }

  function checkShots(shots) {
    if (typeof shots !== "number" || shots < 0 || Math.floor(shots) !== shots) {
      throw new Error("QedShots: shots must be a whole number >= 0");
    }
  }

  // Draw `shots` outcomes. `random` is a function returning [0, 1), such as the
  // result of rng(seed). Returns { shots, counts, sequence }.
  function sample(probs, shots, random) {
    checkProbs(probs);
    checkShots(shots);
    var cumulative = [];
    var running = 0;
    for (var i = 0; i < probs.length; i++) {
      running += probs[i];
      cumulative.push(running);
    }
    var counts = probs.map(function () { return 0; });
    var sequence = [];
    for (var s = 0; s < shots; s++) {
      var r = random();
      var k = 0;
      // The last outcome catches any rounding at the top of the range.
      while (k < cumulative.length - 1 && r >= cumulative[k]) k++;
      counts[k]++;
      sequence.push(k);
    }
    return { shots: shots, counts: counts, sequence: sequence };
  }

  // A repeatable run of experiments. Each run(n) continues the same seeded
  // stream, so successive runs differ but the whole series is reproducible.
  // reset() starts the series again from the beginning.
  function session(probs, seed) {
    checkProbs(probs);
    var random = rng(seed);
    var runs = 0;
    return {
      run: function (shots) {
        var result = sample(probs, shots, random);
        runs++;
        result.run = runs;
        return result;
      },
      reset: function () {
        random = rng(seed);
        runs = 0;
      },
      runs: function () {
        return runs;
      },
    };
  }

  // Default labels: binary strings when the outcome count is a power of two
  // (0, 1 for two outcomes; 00, 01, 10, 11 for four), otherwise indices.
  function defaultLabels(n) {
    var bits = Math.round(Math.log(n) / Math.LN2);
    var isPow2 = n > 1 && Math.pow(2, bits) === n;
    var out = [];
    for (var i = 0; i < n; i++) {
      if (isPow2) {
        var s = i.toString(2);
        while (s.length < bits) s = "0" + s;
        out.push(s);
      } else {
        out.push(String(i));
      }
    }
    return out;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function pct(count, shots) {
    return shots === 0 ? 0 : Math.round((count / shots) * 100);
  }

  function times(n) {
    return n === 1 ? "1 time" : n + " times";
  }

  // Plain-text summary, suitable for an aria-live region.
  function describe(result, labels) {
    labels = labels || defaultLabels(result.counts.length);
    if (result.shots === 0) return "No shots yet.";
    if (result.shots === 1) {
      return "1 simulated shot: the outcome was " + labels[result.sequence[0]] + ".";
    }
    var parts = result.counts.map(function (c, i) {
      return "outcome " + labels[i] + " appeared " + times(c) + " (" + pct(c, result.shots) + "%)";
    });
    return result.shots + " simulated shots: " + parts.join("; ") + ".";
  }

  // Rows of bars, built on the shared .qed-confidence-* styles. Each row is
  // { label, fraction (0 to 1), text }. The fraction sets the bar width and is
  // clamped to the 0 to 1 range; the text is shown beside the bar. Used for shot
  // counts here and for probabilities elsewhere (for example QedQubit states).
  function renderBars(rows) {
    return rows
      .map(function (r) {
        var f = typeof r.fraction === "number" && isFinite(r.fraction) ? Math.min(1, Math.max(0, r.fraction)) : 0;
        var width = Math.round(f * 1000) / 10;
        return (
          '<div class="qed-confidence-row">' +
          '<span class="qed-confidence-row__label">' + esc(r.label) + "</span>" +
          '<span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" style="width:' + width + '%"></span></span>' +
          '<span class="qed-confidence-row__pct">' + esc(r.text) + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  // Bars with text counts for a sampled result.
  // opts: { labels }
  function renderHTML(result, opts) {
    opts = opts || {};
    var labels = opts.labels || defaultLabels(result.counts.length);
    var rows = renderBars(
      result.counts.map(function (c, i) {
        return {
          label: "Outcome " + labels[i],
          fraction: result.shots === 0 ? 0 : c / result.shots,
          text: c + " (" + pct(c, result.shots) + "%)",
        };
      })
    );
    return (
      '<div class="qed-shots" role="group" aria-label="Simulated measurement results">' +
      '<p class="qed-shots__summary">' + esc(describe(result, labels)) + "</p>" +
      rows +
      "</div>"
    );
  }

  return {
    rng: rng,
    sample: sample,
    session: session,
    defaultLabels: defaultLabels,
    describe: describe,
    renderBars: renderBars,
    renderHTML: renderHTML,
  };
})();
