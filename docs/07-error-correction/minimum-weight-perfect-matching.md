# Minimum-Weight Perfect Matching

[Surface Codes](surface-codes.md) ended with a real problem: several different error chains can produce the exact same detection information, and we may not be able to reconstruct exactly what happened.

<div class="qed-demo" id="mwpm-recap-lattice"></div>

Two separate errors landed on this patch. The syndrome tells us *that* something happened at four locations — but on its own, it doesn't tell us how to pair them up into a sensible explanation.

**If several error patterns are compatible with what we observed, how should the decoder choose a recovery?**

**Minimum-Weight Perfect Matching (MWPM)** is one systematic answer to that question.

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("mwpm-recap-lattice");
  if (!el) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(5);
  QSC.mount(el, lattice, { errors: { d1_1: "X", d3_3: "X" }, cellSize: 40 });
});
</script>

## Turn the Syndrome Into a Graph

To reason about this systematically, we step away from the lattice picture and build a **decoding graph** — a representation built *from* the syndrome, not the physical hardware itself:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Detection events</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Extract detection locations</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Represent as graph nodes</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Connect possible pairs</div></div>
</div>

- **Node** — a detection event (one of the checks that fired).
- **Edge** — a possible connection or error explanation *between* two detection events.
- **Weight** — the cost the decoder assigns to that possible connection.

Here are the same four detection events from above, now as a graph — same positions, new meaning:

<div class="qed-demo" id="mwpm-graph-static"></div>
<div class="qed-graph-legend">
  <span><span class="qed-graph-legend__line" style="border-color:var(--qed-color-physical); border-top-style:dashed;"></span>Candidate connection</span>
  <span><span class="qed-graph-legend__line" style="border-color:var(--qed-color-protected);"></span>Selected (part of a matching)</span>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("mwpm-graph-static");
  if (!el) return;
  var nodes = [
    { id: "A", label: "A", x: 108, y: 60 },
    { id: "B", label: "B", x: 60, y: 108 },
    { id: "C", label: "C", x: 204, y: 156 },
    { id: "D", label: "D", x: 156, y: 204 },
  ];
  el.innerHTML = window.QedMatching.renderGraphSVG(nodes, { width: 260, height: 260 });
});
</script>

This graph is a *decoding representation*, not the quantum hardware — it's a tool the decoder builds from the syndrome to reason about explanations.

## What Does a Weight Mean?

A lower-weight edge represents an explanation the decoder considers less costly, or more plausible, under its model. For a beginner-friendly starting point, we'll use geometric distance on the lattice as a proxy:

<div class="qed-demo" id="mwpm-weight-example"></div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("mwpm-weight-example");
  if (!el) return;
  var nodes = [
    { id: "A", label: "A", x: 30, y: 50 },
    { id: "B", label: "B", x: 130, y: 50 },
    { id: "C", label: "C", x: 230, y: 50 },
  ];
  el.innerHTML = window.QedMatching.renderGraphSVG(nodes, {
    width: 260,
    height: 100,
    edgeWeights: { "A|B": 2, "A|C": 4, "B|C": 2 },
    selectedPairs: [
      ["A", "B"],
      ["A", "C"],
    ],
    showWeights: true,
  });
});
</script>

If errors are assumed to be similarly likely across the lattice, A↔B (weight 2) is the simpler explanation than A↔C (weight 4) — it requires fewer qubits to have gone wrong.

!!! warning
    **MWPM does not always choose the physically shortest path.** Geometric distance is just this section's *starting* intuition. Real decoder weights reflect assumptions about error probabilities — they don't have to represent geometric distance at all. MWPM minimizes whatever weights the decoder's error model assigns, and we'll see those weights change later in this page.

## Main Interactive — Match the Detection Events

Pair up all four detection events yourself. Click one node, then click another to pair them; click a paired node again to unpair it.

<div class="qed-demo" id="mwpm-main-demo">
  <div id="mwpm-main-graph"></div>
  <div class="qed-error-demo__readout" style="justify-content:center;">
    <span class="qed-pill"><span class="qed-pill__label">Total weight</span> <span id="mwpm-main-total">0</span></span>
    <span class="qed-pill"><span class="qed-pill__label">Status</span> <span id="mwpm-main-status">Not started</span></span>
  </div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary" id="mwpm-main-reset">Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="mwpm-main-hint" aria-live="polite">Click any two nodes to pair them.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("mwpm-main-graph");
  if (!mountEl) return;
  var QM = window.QedMatching;
  // gx/gy are check-grid coordinates (row/col), used only for weight
  // calculation -- kept separate from x/y (display pixel position) so
  // the on-screen layout never silently changes the weights.
  var nodes = [
    { id: "A", label: "A", x: 108, y: 60, gx: 1, gy: 0 },
    { id: "B", label: "B", x: 60, y: 108, gx: 0, gy: 1 },
    { id: "C", label: "C", x: 204, y: 156, gx: 3, gy: 2 },
    { id: "D", label: "D", x: 156, y: 204, gx: 2, gy: 3 },
  ];
  var nodeIds = nodes.map(function (n) {
    return n.id;
  });
  var byId = {};
  nodes.forEach(function (n) {
    byId[n.id] = n;
  });
  // Error model: geometric (grid) distance. Kept as a standalone
  // function so later sections can swap in a different one.
  var edgeWeights = QM.buildWeights(nodeIds, byId, QM.manhattan);

  var pairs = [];
  var pending = null;
  var total = document.getElementById("mwpm-main-total");
  var status = document.getElementById("mwpm-main-status");
  var hint = document.getElementById("mwpm-main-hint");
  var resetBtn = document.getElementById("mwpm-main-reset");

  function matchedNodes() {
    var s = [];
    pairs.forEach(function (p) {
      s.push(p[0], p[1]);
    });
    return s;
  }

  function render() {
    mountEl.innerHTML = QM.renderGraphSVG(nodes, {
      width: 260,
      height: 260,
      edgeWeights: edgeWeights,
      selectedPairs: pairs,
      selectedNode: pending,
      showWeights: true,
    });
    mountEl.querySelectorAll("[data-node]").forEach(function (el) {
      el.addEventListener("click", function () {
        onNodeClick(el.getAttribute("data-node"));
      });
    });

    var w = QM.matchingWeight(pairs, edgeWeights);
    total.textContent = w;
    var matched = matchedNodes();
    var isPerfect = matched.length === nodeIds.length;
    status.textContent = isPerfect ? "Perfect matching!" : matched.length + " / " + nodeIds.length + " nodes matched";
  }

  function onNodeClick(id) {
    var alreadyMatched = matchedNodes().indexOf(id) !== -1;
    if (alreadyMatched) {
      pairs = pairs.filter(function (p) {
        return p[0] !== id && p[1] !== id;
      });
      pending = null;
      hint.textContent = "Unpaired " + id + ". Click any two nodes to pair them.";
      render();
      return;
    }
    if (pending === null) {
      pending = id;
      hint.textContent = id + " selected — click another unpaired node to complete the pair.";
      render();
      return;
    }
    if (pending === id) {
      pending = null;
      render();
      return;
    }
    pairs.push([pending, id]);
    hint.textContent = "Paired " + pending + " ↔ " + id + ".";
    pending = null;
    render();
  }

  resetBtn.addEventListener("click", function () {
    pairs = [];
    pending = null;
    hint.textContent = "Click any two nodes to pair them.";
    render();
  });

  render();
});
</script>

Try a few different complete matchings and compare their total weights. Which one comes out lowest?

## Why "Perfect Matching"?

Now that you've built a few matchings by hand, here's the vocabulary:

- **Matching** — a set of selected edges that pairs nodes, without using any node more than once.
- **Perfect matching** — a matching in which *every* node that needs to be matched is paired.
- **Minimum-weight perfect matching** — among all valid perfect matchings, the one with the smallest total edge weight.

\[
W(M) = \sum_{(i,j) \in M} w_{ij}
\]

where \(M\) is the selected matching, \(w_{ij}\) is the weight of each selected edge, and \(W(M)\) is the total matching weight. You don't need the equation to understand MWPM — it just says "add up the weights of whatever you picked."

For the graph above, the minimum-weight perfect matching pairs A↔B and C↔D for a total weight of 4 — pairing each error's own two detection events together, rather than crossing between the two separate errors.

## From Matching to Recovery

The matching isn't the end goal — it's a means to a **recovery**. Selected edges get translated back onto the physical lattice as a suggested correction:

<div class="qed-demo" id="mwpm-recovery-lattice"></div>
<p class="qed-encode-demo__hint">The green lines show the recovery paths implied by pairing A↔B and C↔D — connecting each pair's detection events back on the physical lattice.</p>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("mwpm-recovery-lattice");
  if (!el) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(5);
  QSC.mount(el, lattice, { errors: { d1_1: "X", d3_3: "X" }, cellSize: 40 });
  var svg = el.querySelector("svg");
  if (!svg) return;
  // A=(0,1), B=(1,0), C=(2,3), D=(3,2) at cellSize 40, margin 30
  var cell = 30,
    margin = 22.5;
  function checkPos(r, c) {
    return { x: margin + (c + 0.5) * cell, y: margin + (r + 0.5) * cell };
  }
  var a = checkPos(0, 1),
    b = checkPos(1, 0),
    c = checkPos(2, 3),
    d = checkPos(3, 2);
  [
    [a, b],
    [c, d],
  ].forEach(function (pair) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pair[0].x);
    line.setAttribute("y1", pair[0].y);
    line.setAttribute("x2", pair[1].x);
    line.setAttribute("y2", pair[1].y);
    line.setAttribute("class", "qed-graph-edge is-selected");
    svg.appendChild(line);
  });
});
</script>

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:13rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Detection events</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">MWPM pairs events</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Selected edges → recovery paths</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Decoder applies the recovery</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:13rem;"><div class="qed-qubit__label">Logical information remains protected</div></div>
</div>

**The matching tells the decoder how detection events should be paired under its model. Those pairings are then used to construct a recovery** — not left as an abstract graph exercise.

## The Decoder Can Be "Wrong" and Still Succeed

Here's a verified example. Suppose the *true* physical error was three qubits — not the one qubit MWPM will infer:

<div class="qed-demo" id="mwpm-success-demo">
  <div id="mwpm-success-lattice"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="mwpm-success-reveal">Reveal What Happens</button>
  </div>
  <div class="qed-error-demo__feedback" id="mwpm-success-feedback" hidden></div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("mwpm-success-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var trueError = { d0_0: "X", d0_1: "X", d1_0: "X" };
  var recovery = { d1_1: "X" };
  var revealBtn = document.getElementById("mwpm-success-reveal");
  var feedback = document.getElementById("mwpm-success-feedback");
  var revealed = false;

  function combined() {
    var out = {};
    Object.keys(trueError).forEach(function (q) {
      out[q] = "X";
    });
    Object.keys(recovery).forEach(function (q) {
      out[q] = out[q] ? null : "X"; // XOR: cancel if already flipped
      if (out[q] === null) delete out[q];
    });
    return out;
  }

  function render() {
    QSC.mount(mountEl, lattice, { errors: revealed ? combined() : trueError, cellSize: 44 });
  }

  revealBtn.addEventListener("click", function () {
    revealed = true;
    render();
    var syn = QSC.computeSyndrome(lattice, combined());
    var anyFired = syn.some(function (s) {
      return s.fired;
    });
    feedback.hidden = false;
    feedback.className = "qed-error-demo__feedback qed-error-demo__feedback--correct";
    feedback.textContent =
      "True error: X on 3 qubits (weight 3). Syndrome observed: same two checks as a single X on the center qubit. MWPM — seeing only that syndrome — infers the far more likely weight-1 explanation and recovers by flipping the center qubit. Combined with the true error, every affected qubit ends up flipped back or cancelled: " +
      (anyFired ? "checks still firing (unexpected)." : "zero checks fire, and the combination is exactly this patch's own stabilizer pattern — trivial. ✓ Logical information preserved, even though the decoder's guess didn't match the true error.");
  });

  render();
});
</script>

**A decoder does not necessarily need to reconstruct the exact microscopic error history.** Its goal is to choose a recovery that returns the system to the correct logical state — not to guess the literal qubits that flipped.

## When a Matching Causes Logical Failure

Now the contrasting case — verified the same way, with a different true error:

<div class="qed-demo" id="mwpm-failure-demo">
  <div id="mwpm-failure-lattice"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="mwpm-failure-reveal">Reveal What Happens</button>
  </div>
  <div class="qed-error-demo__feedback" id="mwpm-failure-feedback" hidden></div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("mwpm-failure-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var trueError = { d0_1: "X", d2_1: "X" };
  var recovery = { d1_1: "X" };
  var revealBtn = document.getElementById("mwpm-failure-reveal");
  var feedback = document.getElementById("mwpm-failure-feedback");
  var revealed = false;

  function combined() {
    var out = {};
    Object.keys(trueError).forEach(function (q) {
      out[q] = "X";
    });
    Object.keys(recovery).forEach(function (q) {
      if (out[q]) {
        delete out[q];
      } else {
        out[q] = "X";
      }
    });
    return out;
  }

  function render() {
    QSC.mount(mountEl, lattice, { errors: revealed ? combined() : trueError, cellSize: 44 });
  }

  revealBtn.addEventListener("click", function () {
    revealed = true;
    render();
    var syn = QSC.computeSyndrome(lattice, combined());
    var anyFired = syn.some(function (s) {
      return s.fired;
    });
    feedback.hidden = false;
    feedback.className = "qed-error-demo__feedback qed-error-demo__feedback--incorrect";
    feedback.textContent =
      "True error: X on 2 qubits, top-middle and bottom-middle (weight 2) — it produces the exact same syndrome as a single center-qubit error. MWPM, quite reasonably, infers the lower-weight (weight-1) center-qubit explanation and recovers there. Combined with the true error: " +
      (anyFired ? "checks still firing (unexpected)." : "zero checks fire — silent, just like the success case above. But this time all three affected qubits form a full column spanning the patch, which is exactly the shape of an undetectable logical error. ✗ The decoder made the reasonable choice and still failed.");
  });

  render();
});
</script>

A decoder makes an inference from incomplete information. It cannot guarantee that its selected explanation matches the actual physical error — **decoder success and decoder logical failure are both real possibilities**, even when the decoder does exactly what it's designed to do.

## Weights Depend on the Error Model

Back to the 4-node graph. Same detection events, same candidate connections — but watch what happens when the *assumed* error model changes.

<div class="qed-demo" id="mwpm-model-demo">
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--active mwpm-model-btn" data-model="a">Model A — Uniform Errors</button>
    <button type="button" class="qed-button qed-button--secondary mwpm-model-btn" data-model="b">Model B — Unequal Probabilities</button>
  </div>
  <div id="mwpm-model-graph"></div>
  <p class="qed-encode-demo__hint" id="mwpm-model-hint" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("mwpm-model-graph");
  if (!mountEl) return;
  var QM = window.QedMatching;
  var nodes = [
    { id: "A", label: "A", x: 108, y: 60 },
    { id: "B", label: "B", x: 60, y: 108 },
    { id: "C", label: "C", x: 204, y: 156 },
    { id: "D", label: "D", x: 156, y: 204 },
  ];
  var nodeIds = nodes.map(function (n) {
    return n.id;
  });
  var btns = Array.prototype.slice.call(document.querySelectorAll(".mwpm-model-btn"));
  var hint = document.getElementById("mwpm-model-hint");

  var MODELS = {
    a: {
      weights: { "A|B": 2, "C|D": 2, "A|C": 4, "A|D": 4, "B|C": 4, "B|D": 4 },
      label: "Model A (uniform, geometric distance)",
    },
    b: {
      // Illustrative only: imagine this decoder's model treats
      // connections between the two error regions as far more likely
      // than usual, and the direct A-B link as comparatively unlikely.
      weights: { "A|B": 2, "C|D": 2, "A|C": 4, "A|D": 1, "B|C": 1, "B|D": 4 },
      label: "Model B (hypothetical: cross-region connections assumed likely)",
    },
  };

  function select(key) {
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.model === key);
    });
    var model = MODELS[key];
    var result = QM.solveMWPM(nodeIds, model.weights);
    var best = result.best[0].matching;
    mountEl.innerHTML = QM.renderGraphSVG(nodes, {
      width: 260,
      height: 260,
      edgeWeights: model.weights,
      mwpmPairs: best,
      showWeights: true,
    });
    var pairsText = best.map((p) => p[0] + "↔" + p[1]).join(", ");
    hint.textContent = model.label + " — minimum-weight matching: " + pairsText + " (total weight " + result.minWeight + ").";
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(b.dataset.model);
    });
  });

  select("a");
});
</script>

Same syndrome, same candidate connections — but a different set of assumptions about how errors occur changed which matching MWPM prefers. **Decoding depends on both the syndrome and the decoder's assumptions about the error process** — exactly the lesson from [Decoding](decoding.md), now playing out on a graph. (We're not modeling real hardware calibration here — that's [Hardware-Aware QEC](hardware-aware-qec.md).)

## Optional Exploration — Can You Beat the Decoder?

One more graph, arranged as a perfect square so two different matchings tie for the minimum. Build your own matching, then compare it against MWPM's answer.

<div class="qed-demo" id="mwpm-challenge-demo">
  <div id="mwpm-challenge-graph"></div>
  <div class="qed-error-demo__readout" style="justify-content:center;">
    <span class="qed-pill"><span class="qed-pill__label">Your total</span> <span id="mwpm-challenge-total">0</span></span>
  </div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary" id="mwpm-challenge-reset">Reset</button>
    <button type="button" class="qed-button" id="mwpm-challenge-run">Run MWPM</button>
  </div>
  <p class="qed-encode-demo__hint" id="mwpm-challenge-hint" aria-live="polite">Click two nodes to pair them, then try Run MWPM.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("mwpm-challenge-graph");
  if (!mountEl) return;
  var QM = window.QedMatching;
  // gx/gy: grid coordinates for weight calculation, separate from the
  // x/y display layout (a visual square, same idea as the main graph).
  var nodes = [
    { id: "A", label: "A", x: 50, y: 50, gx: 0, gy: 0 },
    { id: "B", label: "B", x: 200, y: 50, gx: 2, gy: 0 },
    { id: "C", label: "C", x: 200, y: 200, gx: 2, gy: 2 },
    { id: "D", label: "D", x: 50, y: 200, gx: 0, gy: 2 },
  ];
  var nodeIds = nodes.map((n) => n.id);
  var byId = {};
  nodes.forEach((n) => (byId[n.id] = n));
  var edgeWeights = QM.buildWeights(nodeIds, byId, QM.manhattan);

  var pairs = [];
  var pending = null;
  var total = document.getElementById("mwpm-challenge-total");
  var hint = document.getElementById("mwpm-challenge-hint");
  var resetBtn = document.getElementById("mwpm-challenge-reset");
  var runBtn = document.getElementById("mwpm-challenge-run");
  var mwpmResult = null;

  function matchedNodes() {
    var s = [];
    pairs.forEach((p) => s.push(p[0], p[1]));
    return s;
  }

  function render() {
    mountEl.innerHTML = QM.renderGraphSVG(nodes, {
      width: 260,
      height: 260,
      edgeWeights: edgeWeights,
      selectedPairs: pairs,
      selectedNode: pending,
      showWeights: true,
    });
    mountEl.querySelectorAll("[data-node]").forEach((el) => {
      el.addEventListener("click", () => onNodeClick(el.getAttribute("data-node")));
    });
    total.textContent = QM.matchingWeight(pairs, edgeWeights);
  }

  function onNodeClick(id) {
    if (matchedNodes().indexOf(id) !== -1) {
      pairs = pairs.filter((p) => p[0] !== id && p[1] !== id);
      pending = null;
      render();
      return;
    }
    if (pending === null) {
      pending = id;
      render();
      return;
    }
    if (pending === id) {
      pending = null;
      render();
      return;
    }
    pairs.push([pending, id]);
    pending = null;
    render();
  }

  resetBtn.addEventListener("click", () => {
    pairs = [];
    pending = null;
    mwpmResult = null;
    hint.textContent = "Click two nodes to pair them, then try Run MWPM.";
    render();
  });

  runBtn.addEventListener("click", () => {
    mwpmResult = QM.solveMWPM(nodeIds, edgeWeights);
    var yourWeight = QM.matchingWeight(pairs, edgeWeights);
    var isPerfect = matchedNodes().length === nodeIds.length;
    var youMatchedOptimal =
      isPerfect &&
      mwpmResult.best.some((m) => {
        var yourKeys = pairs.map((p) => QM.edgeKey(p[0], p[1])).sort();
        var mKeys = m.matching.map((p) => QM.edgeKey(p[0], p[1])).sort();
        return JSON.stringify(yourKeys) === JSON.stringify(mKeys);
      });
    var optimalDescriptions = mwpmResult.best
      .map((m) => m.matching.map((p) => p[0] + "↔" + p[1]).join(", "))
      .join("  —or—  ");
    var tieNote = mwpmResult.best.length > 1 ? " There are multiple equally-valid minimum-weight matchings here — none of them is uniquely correct." : "";

    if (!isPerfect) {
      hint.textContent = "That's not a perfect matching yet — every node needs to be paired. MWPM's minimum weight is " + mwpmResult.minWeight + " (" + optimalDescriptions + ")." + tieNote;
    } else if (youMatchedOptimal) {
      hint.textContent = "Your matching (total " + yourWeight + ") is minimum-weight! MWPM agrees: " + optimalDescriptions + "." + tieNote;
    } else {
      hint.textContent = "Your matching totals " + yourWeight + ". MWPM's minimum is " + mwpmResult.minWeight + " (" + optimalDescriptions + ")." + tieNote;
    }
  });

  render();
});
</script>

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:13rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Detection events</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Build decoding graph</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Possible connections</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Assign weights</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Find perfect matchings</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Select minimum-weight matching</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Construct recovery</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:13rem;"><div class="qed-qubit__label">Preserve logical information</div></div>
</div>

**Minimum-Weight Perfect Matching is a decoding method that uses weighted relationships between detection events to choose a low-cost recovery consistent with the observed syndrome and the decoder's error model.** MWPM does not need to determine exactly what physically happened — it needs to choose a recovery that protects the logical information, and as you saw above, it doesn't always succeed.

We can now protect a logical qubit with a surface code and decode its errors. But how do we perform operations *between* logical qubits while keeping them protected?

**[Next: Lattice Surgery →](lattice-surgery.md)**
