# Why Quantum Computing?

A quantum computer is not just a faster laptop. It is a different kind of machine, built to take on problems that ordinary computers struggle with. This page covers where the idea came from, which problems it could help with, and what makes it different. A few new terms (qubit, amplitude, measurement) get a quick preview here and are explained properly on the [next page](what-is-quantum-computing.md).

## Where the idea came from

The idea of a quantum computer started with a problem in physics. In 1981 the physicist Richard Feynman pointed out that simulating quantum systems, such as molecules, on an ordinary computer gets very hard, very fast. His suggestion was to turn the problem around: if nature is quantum, build the computer out of quantum parts. In 1985 David Deutsch described a universal quantum computer. Then in the 1990s Peter Shor (1994) and Lov Grover (1996) showed that such a machine could speed up problems far beyond physics, namely factoring large numbers and searching.

Why is simulation so hard? Describing *n* ordinary bits takes *n* numbers. Describing *n* qubits takes \(2^n\) numbers, called **amplitudes**. The demonstration below shows what it costs an ordinary computer to store them.

<div class="qed-demo" id="ws-space">
<div class="qed-demo__controls" style="min-width:auto;">
<label for="ws-space-slider">Number of qubits, n: <strong id="ws-space-n"></strong></label>
<input type="range" id="ws-space-slider" min="1" max="60" step="1" value="10">
</div>
<div class="qed-compare-row" style="align-items:stretch; margin-top:0.8rem;">
<div class="qed-panel"><div class="qed-panel__title">n classical bits</div><div class="qed-panel__state">n numbers (each 0 or 1)</div><div class="qed-stat"><span class="qed-stat__value" id="ws-space-bit-mem"></span><span class="qed-stat__label">to store</span></div></div>
<div class="qed-panel qed-panel--quantum"><div class="qed-panel__title">n qubits (general state)</div><div class="qed-panel__state">2<sup>n</sup> = <span id="ws-space-amps"></span> amplitudes</div><div class="qed-stat"><span class="qed-stat__value" id="ws-space-q-mem"></span><span class="qed-stat__label">to store on a classical computer</span></div></div>
</div>
<div id="ws-space-scale" style="margin-top:0.8rem;"></div>
<div class="qed-error-demo__feedback" id="ws-space-feedback" aria-live="polite"></div>
<p class="qed-demo__note">Memory assumes 16 bytes per amplitude (one double-precision complex number). The bar uses a logarithmic scale.</p>
</div>

Each added qubit doubles the memory needed. Around 30 qubits, the state no longer fits on a laptop. Around 50, it outgrows the largest supercomputers. A quantum computer holds the same information in just *n* qubits.

!!! note "Two caveats"
    Many quantum systems have structure that clever classical methods can exploit, and those methods keep improving. That is why claims of quantum advantage get checked carefully. Also, storing a huge state is not the same as reading it out. A quantum computer cannot simply hand back all \(2^n\) amplitudes, as the last section shows. Designing algorithms that use the large state and still produce a useful answer is the real challenge.

## What problems could it help with?

Quantum algorithms are known to help with certain kinds of problems. "Help" has a specific meaning here: the number of steps grows more slowly as the problem gets bigger. Some gains are enormous and some are modest.

| Problem | Example | Quantum approach | Size of the gain |
|---|---|---|---|
| **Simulation** | Molecules and materials for new medicines and batteries | Quantum simulation | Potentially huge |
| **Factoring** | Splitting a large number into its prime factors, which protects online banking | Shor's algorithm | Huge: no fast ordinary method is known |
| **Search** | Finding one item in an unsorted list of size *N* | Grover's algorithm | Square root: about \(\sqrt{N}\) steps instead of *N* |
| **Optimization** | Scheduling, delivery routes, investment portfolios | Several approaches | Still an open research question |

A square-root gain is easier to appreciate with numbers: searching a million items takes about a million steps the ordinary way and about a thousand with Grover's algorithm. Simulation and factoring offer the biggest known gains, while optimization is where researchers are still working out what quantum computers can really do.

**Codes are already changing.** Shor's algorithm could break the encryption that protects most internet traffic. A machine large enough does not exist yet, and estimates keep falling: a 2019 estimate called for about 20 million qubits, and a 2025 estimate from Google Quantum AI says under one million would do. Because encrypted data can be recorded now and cracked later, the world is already moving. In 2024 the US standards agency NIST published its first post-quantum encryption standards, which run on ordinary computers and are designed to resist quantum attacks.

A speedup only matters if each step is not too slow. The demonstration below compares search steps for an ordinary computer and for Grover's algorithm, and lets you make each quantum step slower than an ordinary one.

<div class="qed-demo" id="ws-search">
<div class="qed-demo__controls" style="min-width:auto;">
<label for="ws-search-n">Items to search, N = 10<sup id="ws-search-n-exp"></sup> = <span id="ws-search-n-val"></span></label>
<input type="range" id="ws-search-n" min="2" max="15" step="1" value="6">
<label for="ws-search-k">One quantum query takes <span id="ws-search-k-val"></span> as long as one classical check</label>
<input type="range" id="ws-search-k" min="0" max="10" step="1" value="0">
</div>
<div id="ws-search-bars" style="margin-top:0.8rem;"></div>
<div class="qed-error-demo__feedback" id="ws-search-feedback" aria-live="polite"></div>
<p class="qed-demo__note">Times are in units of one classical check. Bars use a logarithmic scale. Toy model of unstructured search; real machines also pay error-correction overhead.</p>
</div>

With equal step times, the quantum algorithm wins by a huge factor on large problems. As each quantum step gets slower, the problem has to get bigger before the quantum algorithm pulls ahead. Early error-corrected machines are expected to be slow per step, so a square-root gain can be used up. That is a main reason researchers are most excited about problems with larger gains, like simulation and factoring.

## Classical vs Quantum Computing

A quantum computer manipulates a different kind of information, so the two machines differ in what they store, how they are read, and where their advantages come from.

| | Classical computer | Quantum computer |
|---|---|---|
| **Basic unit** | Bit: `0` or `1` | Qubit: a combination of `0` and `1` |
| **State of *n* units** | *n* values | \(2^n\) amplitudes |
| **Reading the result** | Look at any bit, any time | Measuring gives one outcome and changes the state |
| **Copying** | Any bit can be copied | An unknown quantum state cannot be copied |
| **Source of speedups** | Faster hardware, more of it | Interference and entanglement, arranged by the algorithm |

Two things follow. First, a quantum computer cannot compute anything an ordinary one cannot. It may just do certain jobs far more efficiently. Second, it is expected to help with *some* problems, not all. Word processing and web browsing gain nothing.

You may hear that a quantum computer "tries every answer at once", but that is misleading. The demonstration below puts *n* qubits in an equal mix of all outcomes and then measures them.

<div class="qed-demo" id="ws-amps">
<div class="qed-demo__controls" style="min-width:auto;">
<label for="ws-amps-slider">Qubits in equal superposition, n: <strong id="ws-amps-n"></strong></label>
<input type="range" id="ws-amps-slider" min="1" max="4" step="1" value="3">
</div>
<p class="qed-demo__note" id="ws-amps-summary"></p>
<div class="qed-amp-grid" id="ws-amps-grid" role="list"></div>
<div style="margin-top:0.6rem;">
<button type="button" class="qed-button" id="ws-amps-measure">Prepare and measure once</button>
<button type="button" class="qed-button" id="ws-amps-shots">Run 100 shots</button>
<button type="button" class="qed-button qed-button--secondary" id="ws-amps-clear">Clear tally</button>
</div>
<div class="qed-error-demo__feedback" id="ws-amps-feedback" aria-live="polite"></div>
</div>

However many amplitudes the state carries, each measurement returns one string of *n* bits, chosen at random. The rest produce no output. A useful algorithm first arranges **interference**, introduced on the next page, so that wrong answers cancel and the right one grows, and only then measures. Designing algorithms that do this is the subject of [Module 06](../06-algorithms/index.md), and many of the best ones are probably still undiscovered.

## What to carry forward

- Quantum computing began with the difficulty of simulating quantum systems, and the exponential size of a quantum state is the reason.
- Known gains depend on the problem, from huge (simulation, factoring) to modest (search).
- A quantum computer offers a different resource, not a faster clock. Its power comes from interference and entanglement.

The next section, [What Is Quantum Computing?](what-is-quantum-computing.md) makes these terms precise, starting with the qubit.

<details class="qed-details" markdown="1">
<summary>Sources and dates</summary>

- R. P. Feynman, "Simulating Physics with Computers," *International Journal of Theoretical Physics* 21 (1982).
- D. Deutsch, "Quantum theory, the Church–Turing principle and the universal quantum computer," *Proceedings of the Royal Society A* 400 (1985).
- P. W. Shor, "Algorithms for quantum computation: discrete logarithms and factoring" (1994); L. K. Grover, "A fast quantum mechanical algorithm for database search" (1996).
- C. Gidney, "How to factor 2048 bit RSA integers with less than a million noisy qubits," arXiv:2505.15917 (2025). Assumes a 0.1% gate error rate, a square grid of qubits with nearest-neighbor connections, and a 1 microsecond surface-code cycle.
- C. Gidney and M. Ekerå, "How to factor 2048 bit RSA integers in 8 hours using 20 million noisy qubits," *Quantum* 5, 433 (2021).
- R. Babbush, J. R. McClean, M. Newman, C. Gidney, S. Boixo, and H. Neven, "Focus beyond quadratic speedups for error-corrected quantum advantage," *PRX Quantum* 2, 010103 (2021).
- NIST, FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA), finalized August 13, 2024.

</details>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var S = window.QedShots;
  var N = window.QedNumbers;
  var SEED = 2027; // the demo draws from its own seeded stream, so its first run is the same on every load

  function $(id) { return document.getElementById(id); }
  function intValue(id) { return parseInt($(id).value, 10); }

  // ---- Where the idea came from: memory for the state of n qubits --------------------
  (function () {
    var MAX = 60;           // largest n on the slider
    var BYTES_EACH = 16;    // one double-precision complex number per amplitude
    function amplitudes(n) { return Math.pow(2, n); }
    function memoryBytes(n) { return Math.pow(2, n) * BYTES_EACH; }
    // Reference scales are decimal: 16 GB laptop, 1 TB server, 1 PB cluster.
    function describe(bytes) {
      if (bytes <= 16e9) return "Fits in the memory of an ordinary laptop (16 GB).";
      if (bytes <= 1e12) return "Needs a large server (up to about 1 TB of memory).";
      if (bytes <= 1e15) return "Needs the combined memory of a large cluster (up to about 1 PB).";
      if (bytes <= 2e16) return "On the scale of the total memory of the largest supercomputers.";
      return "More memory than any computer built today has.";
    }
    function update() {
      var n = intValue("ws-space-slider");
      var bytes = memoryBytes(n);
      $("ws-space-n").textContent = n;
      $("ws-space-amps").innerHTML = N.human(amplitudes(n));
      $("ws-space-bit-mem").textContent = n <= 8 ? "1 byte" : N.bytes(Math.ceil(n / 8));
      $("ws-space-q-mem").textContent = N.bytes(bytes);
      // log scale: 16 bytes (the n = 0 floor) up to the memory at the largest n
      var frac = Math.log10(bytes / BYTES_EACH + 1) / Math.log10(memoryBytes(MAX) / BYTES_EACH + 1);
      $("ws-space-scale").innerHTML = S.renderBars([{ label: "Memory", fraction: frac, accent: "quantum", labelWidth: "4rem", text: N.bytes(bytes), textWidth: "6rem" }]);
      $("ws-space-feedback").textContent = describe(bytes);
    }
    $("ws-space-slider").addEventListener("input", update);
    update();
  })();

  // ---- What problems could it help with?: search, and the cost of a slow quantum step -
  (function () {
    var MAX_EXP = 15;       // largest log10 N
    var MAX_SLOW = 10;      // largest log10 of the quantum slowdown
    var axisMax = MAX_EXP + MAX_SLOW + 1; // log10 upper bound for bar scaling
    function classicalChecks(n) { return n / 2; }
    function groverQueries(n) { return (Math.PI / 4) * Math.sqrt(n); }
    function breakEven(k) { return Math.pow((Math.PI * k) / 2, 2); }
    function frac(t) { return Math.max(0, Math.log10(Math.max(t, 1))) / axisMax; }

    function update() {
      var e = intValue("ws-search-n");
      var ke = intValue("ws-search-k");
      var count = Math.pow(10, e);
      var k = Math.pow(10, ke);
      var tc = classicalChecks(count);
      var tq = groverQueries(count) * k;
      $("ws-search-n-exp").textContent = e;
      $("ws-search-n-val").innerHTML = N.human(count);
      $("ws-search-k-val").innerHTML = ke === 0 ? "the same time" : "<strong>" + N.human(k) + "×</strong>";
      $("ws-search-bars").innerHTML = S.renderBars([
        { label: "Classical", fraction: frac(tc), textHtml: N.sci(tc), labelWidth: "6.5rem", textWidth: "7rem" },
        { label: "Grover", fraction: frac(tq), accent: "quantum", textHtml: N.sci(tq), labelWidth: "6.5rem", textWidth: "7rem" }
      ]);
      var msg;
      if (tq < tc) msg = "The quantum search finishes first, by a factor of about <strong>" + N.sci(tc / tq) + "</strong>.";
      else msg = "The classical search finishes first, by a factor of about <strong>" + N.sci(tq / tc) + "</strong>.";
      $("ws-search-feedback").innerHTML = msg + " With this slowdown, quantum search only wins once N exceeds about <strong>" + N.sci(breakEven(k)) + "</strong>.";
    }
    $("ws-search-n").addEventListener("input", update);
    $("ws-search-k").addEventListener("input", update);
    update();
  })();

  // ---- Classical vs Quantum Computing: many amplitudes, one measured string ----------
  (function () {
    var shotsPerRun = 100;
    var random = S.rng(SEED + 1);
    var n = intValue("ws-amps-slider");
    var counts = [];
    var last = null;

    function size() { return Math.pow(2, n); }
    function uniform() {
      var p = [];
      for (var i = 0; i < size(); i++) p.push(1 / size());
      return p;
    }
    function resetTally() {
      counts = [];
      for (var i = 0; i < size(); i++) counts.push(0);
      last = null;
    }
    function draw() {
      var amp = 1 / Math.sqrt(size());
      var labels = S.defaultLabels(size());
      var total = counts.reduce(function (a, b) { return a + b; }, 0);
      $("ws-amps-n").textContent = n;
      $("ws-amps-summary").innerHTML = n + (n === 1 ? " qubit holds " : " qubits hold ") + "<strong>" + size() + " amplitudes</strong>, each equal to " +
        N.signed(amp) + ". Every outcome is equally likely: " + N.pct(1 / size(), size() > 8 ? 1 : 0) + ".";
      var html = "";
      for (var i = 0; i < size(); i++) {
        html += '<div class="qed-amp-cell' + (i === last ? " qed-amp-cell--hit" : "") + '" role="listitem">' +
          '<span class="qed-amp-cell__label">|' + labels[i] + "⟩</span>" +
          '<span class="qed-amp-cell__amp">' + N.signed(amp) + "</span>" +
          '<span class="qed-amp-cell__count">' + (total ? counts[i] + "×" : "&nbsp;") + "</span></div>";
      }
      $("ws-amps-grid").innerHTML = html;
    }
    function intro() {
      $("ws-amps-feedback").innerHTML = "The state is spread over all " + size() + " amplitudes. Measure it to see what comes out.";
    }

    $("ws-amps-slider").addEventListener("input", function () {
      n = intValue("ws-amps-slider");
      resetTally();
      draw();
      intro();
    });
    $("ws-amps-measure").addEventListener("click", function () {
      last = S.sample(uniform(), 1, random).sequence[0];
      counts[last]++;
      draw();
      $("ws-amps-feedback").innerHTML = "Result: <strong>" + S.defaultLabels(size())[last] + "</strong>. One " + n + "-bit string out of " + size() +
        " possible. The other amplitudes did not produce any output; the measurement returned just " + n + (n === 1 ? " bit." : " bits.");
    });
    $("ws-amps-shots").addEventListener("click", function () {
      var run = S.sample(uniform(), shotsPerRun, random);
      run.counts.forEach(function (c, i) { counts[i] += c; });
      last = run.sequence[run.sequence.length - 1];
      draw();
      $("ws-amps-feedback").innerHTML = "Each run of the circuit still yields a single string. Over many runs the results spread evenly across all " + size() + " outcomes.";
    });
    $("ws-amps-clear").addEventListener("click", function () {
      resetTally();
      draw();
      $("ws-amps-feedback").innerHTML = "Tally cleared.";
    });

    resetTally();
    draw();
    intro();
  })();
});
</script>
