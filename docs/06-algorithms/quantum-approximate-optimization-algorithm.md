# Quantum Approximate Optimization Algorithm (QAOA)

Recall the hybrid loop from [VQE](variational-quantum-eigensolver.md): prepare a trial state, measure something about it, let a classical optimizer propose a better set of parameters, repeat. The **Quantum Approximate Optimization Algorithm (QAOA)** follows the exact same pattern — the difference is what's being optimized. VQE searches for a state with the lowest possible *energy*. QAOA searches for a bitstring that's a good *answer to a combinatorial optimization problem*.

QAOA itself isn't tied to any one problem — it applies broadly to **QUBO problems** (Quadratic Unconstrained Binary Optimization: choosing a yes/no value for each variable to optimize some score that depends on pairs of those choices), which covers things like portfolio optimization (which assets to include) as well as graph problems. This page uses one specific, simple QUBO problem as a running example, because it's easy to visualize and easy to check by hand.

## The Problem: MaxCut

That example is **MaxCut**: given a graph, split its nodes into two groups so that as many edges as possible have one endpoint in each group. Each edge that ends up with its two endpoints in different groups is "cut."

The example used on this page is a 4-node cycle:

```
1 —— 2
|    |
4 —— 3
```

with edges (1,2), (2,3), (3,4), (4,1). The best possible split here is clean: put nodes 1 and 3 in one group, and 2 and 4 in the other — every single edge gets cut.

## Interactive: Try It By Hand

Before bringing in any quantum machinery, try the problem yourself. Click a node to move it between **Group A** (blue) and **Group B** (gray). An edge turns green when it's cut.

<div class="qed-demo" id="qaoa-byhand-demo">
  <svg class="qed-graph-svg" id="qaoa-byhand-svg" viewBox="0 0 320 220" width="320" height="220" role="img" aria-label="A four-node graph arranged in a square. Click a node to move it between Group A and Group B; edges that cross between groups are highlighted.">
    <line class="qed-graph-edge" id="qaoa-bh-edge-1-2" x1="90" y1="50" x2="230" y2="50" />
    <line class="qed-graph-edge" id="qaoa-bh-edge-2-3" x1="230" y1="50" x2="230" y2="170" />
    <line class="qed-graph-edge" id="qaoa-bh-edge-3-4" x1="230" y1="170" x2="90" y2="170" />
    <line class="qed-graph-edge" id="qaoa-bh-edge-4-1" x1="90" y1="170" x2="90" y2="50" />

    <circle class="qed-graph-node qed-graph-node--group-b" id="qaoa-bh-node-1" data-node="1" cx="90" cy="50" r="16" />
    <text class="qed-graph-node-label" x="90" y="54.5">1</text>
    <circle class="qed-graph-node qed-graph-node--group-b" id="qaoa-bh-node-2" data-node="2" cx="230" cy="50" r="16" />
    <text class="qed-graph-node-label" x="230" y="54.5">2</text>
    <circle class="qed-graph-node qed-graph-node--group-b" id="qaoa-bh-node-3" data-node="3" cx="230" cy="170" r="16" />
    <text class="qed-graph-node-label" x="230" y="174.5">3</text>
    <circle class="qed-graph-node qed-graph-node--group-b" id="qaoa-bh-node-4" data-node="4" cx="90" cy="170" r="16" />
    <text class="qed-graph-node-label" x="90" y="174.5">4</text>
  </svg>

  <p style="text-align:center;">Cut edges: <span id="qaoa-bh-cutcount">0</span> / 4</p>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-bh-reset-btn">Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="qaoa-bh-hint" aria-live="polite">All four nodes start in Group B. Click nodes to try to cut all 4 edges.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("qaoa-byhand-demo");
  if (!demo) return;

  var EDGES = [[1, 2], [2, 3], [3, 4], [4, 1]];
  var groups = { 1: "b", 2: "b", 3: "b", 4: "b" };

  var cutCountEl = document.getElementById("qaoa-bh-cutcount");
  var hint = document.getElementById("qaoa-bh-hint");
  var resetBtn = document.getElementById("qaoa-bh-reset-btn");

  function nodeEl(n) {
    return document.getElementById("qaoa-bh-node-" + n);
  }

  function edgeEl(a, b) {
    return document.getElementById("qaoa-bh-edge-" + a + "-" + b);
  }

  function render() {
    var cuts = 0;
    EDGES.forEach(function (pair) {
      var a = pair[0], b = pair[1];
      var cut = groups[a] !== groups[b];
      if (cut) cuts += 1;
      var el = edgeEl(a, b);
      el.classList.toggle("is-selected", cut);
    });
    cutCountEl.textContent = String(cuts);
    if (cuts === 4) {
      hint.textContent = "You found the maximum cut — all 4 edges crossed between groups!";
    } else {
      hint.textContent = "Keep trying — can you cut all 4 edges?";
    }
  }

  [1, 2, 3, 4].forEach(function (n) {
    nodeEl(n).addEventListener("click", function () {
      groups[n] = groups[n] === "a" ? "b" : "a";
      nodeEl(n).classList.toggle("qed-graph-node--group-a", groups[n] === "a");
      nodeEl(n).classList.toggle("qed-graph-node--group-b", groups[n] === "b");
      render();
    });
  });

  resetBtn.addEventListener("click", function () {
    [1, 2, 3, 4].forEach(function (n) {
      groups[n] = "b";
      nodeEl(n).classList.add("qed-graph-node--group-b");
      nodeEl(n).classList.remove("qed-graph-node--group-a");
    });
    hint.textContent = "All four nodes start in Group B. Click nodes to try to cut all 4 edges.";
    render();
  });

  render();
});
</script>

## Encoding the Problem: Cost and Mixer

QAOA turns this into a quantum search using two ingredients:

- A **cost Hamiltonian** that scores a grouping by how many edges it cuts — groupings that cut more edges get a higher value.
- A **mixer Hamiltonian** that lets the circuit move between different groupings, instead of getting stuck evaluating just one.

The cost Hamiltonian plays the same role as VQE's \(H\) — it's what gets measured. The mixer doesn't have as clean a VQE analogue, though: VQE's single ansatz gate, \(RY(\theta)\), both encodes the trial state *and* creates superposition between \(|0\rangle\) and \(|1\rangle\) in the same step. QAOA splits that into two separate pieces — the cost layer only tags bitstrings with a phase (no mixing on its own), and the mixer is specifically what moves amplitude between them. What *is* the same in both algorithms is the classical optimizer's job: it searches between iterations — new \(\theta\) in VQE, new \(\gamma,\beta\) in QAOA — it doesn't do any of the mixing itself in either one.

<details class="qed-details" markdown="1">
<summary>Show the math →</summary>

**Start classically.** Give each node a binary decision variable \(x_i \in \{0,1\}\) (1 = Group A, 0 = Group B). An edge \((i,j)\) is cut exactly when \(x_i \neq x_j\), which the following expression captures — it's 1 when they differ and 0 when they agree:

\[
\text{cut}(i,j) = x_i + x_j - 2x_i x_j
\]

The classical objective is just the sum of this over every edge: \(\sum_{(i,j)\in E} \text{cut}(i,j)\).

**Switch to \(\pm1\) variables.** Quantum operators like \(Z\) have eigenvalues \(\pm1\), not \(0\) and \(1\), so substitute \(x_i = \frac{1 - z_i}{2}\) with \(z_i \in \{-1,+1\}\). Plugging this into \(\text{cut}(i,j)\) and simplifying:

\[
\text{cut}(i,j) = \frac{1 - z_i z_j}{2}
\]

Same expression, same values — just written in terms of variables that are now ±1 instead of 0/1.

**Promote to operators.** Replacing each classical \(z_i\) with the Pauli operator \(Z_i\) (whose eigenvalues on \(|0\rangle, |1\rangle\) are exactly \(+1, -1\)) turns the classical objective into the quantum cost Hamiltonian the circuit actually uses:

\[
C = \sum_{(i,j) \in E} \frac{1 - Z_i Z_j}{2}
\]

Measuring \(C\) on a given bitstring reproduces exactly the classical cut count for that grouping — the Hamiltonian hasn't changed what's being counted, only how it's represented. The mixer Hamiltonian, by contrast, has no classical counterpart to build up this way — it's simply

\[
B = \sum_i X_i
\]

which flips individual qubits and is what allows the circuit to move between different groupings at all.

</details>

## The QAOA Circuit: p Layers of Cost + Mixer

Neither \(C\) nor \(B\) is itself a gate — they're Hamiltonians, and a circuit can't apply a Hamiltonian directly. The fix is the same trick physics uses to turn a Hamiltonian into time evolution: exponentiate it. For any Hamiltonian \(H\) and real angle \(\theta\), \(e^{-i\theta H}\) is unitary — a legitimate gate — so \(e^{-i\gamma C}\) and \(e^{-i\beta B}\) below are real, applicable operations, not just notation borrowed from \(C\) and \(B\).

The two behave differently once exponentiated, though. \(C\) is built from \(Z\) and \(Z_iZ_j\) terms, which are diagonal — so \(e^{-i\gamma C}\) doesn't change which bitstring you'd measure, it only tags each one with a phase tied to its cut value. \(B\) is built from \(X\) terms, which aren't diagonal — so \(e^{-i\beta B}\) actively redistributes amplitude *between* bitstrings. Applying them in sequence, over several rounds, is what turns those cost-dependent phase tags into an actual shift in the measured probabilities: the mixer repeatedly converts "tagged" phase differences into amplitude differences, which is the mechanism behind the probability bars you'll see shift in the next demo.

With that, the full ansatz starts every qubit in an equal superposition — representing *all* possible groupings at once — then alternates a cost layer and a mixer layer, \(p\) times:

\[
|\psi(\beta,\gamma)\rangle = \underbrace{e^{-i\beta_p B} e^{-i\gamma_p C} \cdots e^{-i\beta_1 B} e^{-i\gamma_1 C}}_{p \text{ layers}} |+\rangle^{\otimes n}
\]

Each layer has its own pair of angles, \(\gamma\) (cost) and \(\beta\) (mixer) — these are the parameters the classical optimizer tunes, the same role \(\theta\) played in VQE. More layers generally means a better approximation to the true MaxCut, at the cost of a longer, noisier circuit.

## Interactive: Run the Optimizer Loop (p = 1)

At \(p=1\) there are only two angles to find, \(\gamma_1\) and \(\beta_1\), so it's the simplest place to see the loop itself. It runs exactly like VQE's loop, with the cost Hamiltonian \(C\) standing in for \(H\):

1. The quantum computer prepares \(|+\rangle^{\otimes 4}\) with H gates, then applies \(e^{-i\beta_1 B} e^{-i\gamma_1 C}\) using the current guess for \(\gamma_1,\beta_1\).
2. That circuit is run (and measured) a fixed number of times — not once. Each run just gives one bitstring, so what you actually get back is a *distribution* over bitstrings, not a number.
3. The classical side evaluates the ordinary cut-count formula on every sampled bitstring and averages the results, which is how \(\langle C \rangle\) is calculated — it's a classical computation performed on quantum measurement outcomes, not something read directly off the hardware.
4. The classical optimizer looks at that estimated \(\langle C \rangle\) and proposes new angles expected to raise it. (Raise, not lower — QAOA maximizes a cut count, where VQE minimized an energy, so the optimizer's direction flips, but the loop structure is identical.)
5. Repeat.

Before any tuning at all (\(\gamma_1=\beta_1=0\)), no cost or mixer layer has actually done anything yet — the state is still the plain equal superposition, so \(\langle C \rangle\) is just the average cut over all 16 groupings, exactly \(2.00\). Watch that number move as the loop runs.

<div class="qed-demo" id="qaoa-loop-demo">
  <div style="display:grid; grid-template-columns: 13rem 11rem 13rem; grid-template-rows: auto auto; align-items:center; justify-items:center; gap:0.2rem 0; overflow-x:auto;">
    <div class="qed-qubit qed-qubit--logical" id="qaoa-loop-quantum" style="grid-row:1 / 3; grid-column:1; width:13rem; height:4.6rem;">
      <div class="qed-qubit__label">Quantum Processor</div>
      <div class="qed-qubit__state" id="qaoa-loop-quantum-state">idle</div>
    </div>
    <div class="qed-encode-demo__arrow" style="grid-row:1; grid-column:2;"><span id="qaoa-loop-fwd-label">—</span><span aria-hidden="true">→</span></div>
    <div class="qed-encode-demo__arrow" style="grid-row:2; grid-column:2;"><span aria-hidden="true">←</span><span id="qaoa-loop-back-label">—</span></div>
    <div class="qed-qubit qed-qubit--physical" id="qaoa-loop-classical" style="grid-row:1 / 3; grid-column:3; width:13rem; height:4.6rem;">
      <div class="qed-qubit__label">Classical Optimizer</div>
      <div class="qed-qubit__state" id="qaoa-loop-classical-state">idle</div>
    </div>
  </div>

  <p style="text-align:center;">Iteration: <span id="qaoa-loop-iter">0</span></p>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="qaoa-loop-prepare-btn">Prepare</button>
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-loop-measure-btn" disabled>Measure ⟨C⟩</button>
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-loop-update-btn" disabled>Classical Update</button>
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-loop-reset-btn" disabled>Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="qaoa-loop-hint" aria-live="polite">Click Prepare to begin the first iteration.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("qaoa-loop-demo");
  if (!demo) return;

  // Hand-authored, illustrative only — except the first entry, which
  // is exact: at gamma=beta=0 neither layer does anything, so <C> is
  // the plain average cut over all 16 groupings (sum of cuts = 32,
  // 32/16 = 2.00). The rest is a plausible, monotonically-improving
  // path that ends exactly at the "tuned" p=1 angles used by the
  // p-layers demo below (gamma1=0.46, beta1=0.31), so the two
  // interactives agree with each other.
  var ITERATIONS = [
    { gamma: 0.00, beta: 0.00, c: 2.00 },
    { gamma: 0.15, beta: 0.12, c: 2.31 },
    { gamma: 0.30, beta: 0.22, c: 2.64 },
    { gamma: 0.40, beta: 0.29, c: 2.86 },
    { gamma: 0.46, beta: 0.31, c: 2.95 }
  ];

  var quantumState = document.getElementById("qaoa-loop-quantum-state");
  var classicalState = document.getElementById("qaoa-loop-classical-state");
  var fwdLabel = document.getElementById("qaoa-loop-fwd-label");
  var backLabel = document.getElementById("qaoa-loop-back-label");
  var iterEl = document.getElementById("qaoa-loop-iter");
  var hint = document.getElementById("qaoa-loop-hint");
  var prepareBtn = document.getElementById("qaoa-loop-prepare-btn");
  var measureBtn = document.getElementById("qaoa-loop-measure-btn");
  var updateBtn = document.getElementById("qaoa-loop-update-btn");
  var resetBtn = document.getElementById("qaoa-loop-reset-btn");

  var i = 0;

  function prepare() {
    var it = ITERATIONS[i];
    quantumState.textContent = "γ₁=" + it.gamma.toFixed(2) + ", β₁=" + it.beta.toFixed(2);
    classicalState.textContent = "idle";
    fwdLabel.textContent = "—";
    backLabel.textContent = "—";
    hint.textContent = "Circuit prepared with these angles. Now measure the average cut value.";
    prepareBtn.disabled = true;
    measureBtn.disabled = false;
  }

  function measure() {
    var it = ITERATIONS[i];
    fwdLabel.textContent = "⟨C⟩ ≈ " + it.c.toFixed(2);
    iterEl.textContent = String(i + 1);
    measureBtn.disabled = true;
    if (i + 1 < ITERATIONS.length) {
      hint.textContent = "Measured ⟨C⟩ ≈ " + it.c.toFixed(2) + ". Let the classical optimizer propose better angles.";
      updateBtn.disabled = false;
    } else {
      classicalState.textContent = "converged";
      hint.textContent = "Converged at ⟨C⟩ ≈ " + it.c.toFixed(2) + " — close to, but not exactly, the maximum cut of 4. Even a well-tuned p=1 only biases the odds; it doesn't guarantee the optimal grouping every run.";
      resetBtn.disabled = false;
    }
  }

  function classicalUpdate() {
    i += 1;
    var it = ITERATIONS[i];
    classicalState.textContent = "ready";
    backLabel.textContent = "γ₁≈" + it.gamma.toFixed(2) + ", β₁≈" + it.beta.toFixed(2);
    hint.textContent = "Classical optimizer proposed new angles. Prepare the next iteration.";
    updateBtn.disabled = true;
    prepareBtn.disabled = false;
    resetBtn.disabled = false;
  }

  function reset() {
    i = 0;
    quantumState.textContent = "idle";
    classicalState.textContent = "idle";
    fwdLabel.textContent = "—";
    backLabel.textContent = "—";
    iterEl.textContent = "0";
    hint.textContent = "Click Prepare to begin the first iteration.";
    prepareBtn.disabled = false;
    measureBtn.disabled = true;
    updateBtn.disabled = true;
    resetBtn.disabled = true;
  }

  prepareBtn.addEventListener("click", prepare);
  measureBtn.addEventListener("click", measure);
  updateBtn.addEventListener("click", classicalUpdate);
  resetBtn.addEventListener("click", reset);

  reset();
});
</script>

This loop is what actually finds \(\gamma_1,\beta_1\) — nothing about adding more layers changes this picture, it just means running the same kind of loop again, searching over twice as many angles for \(p=2\), three times as many for \(p=3\), and so on. The demo below skips ahead to the converged result for each \(p\), so the focus stays on how the outcome changes with more layers rather than re-running the loop every time.

## Interactive: p Layers of Cost + Mixer

All four qubits start in the equal superposition \(|+\rangle^{\otimes 4}\), prepared by the **H** gates at the left of the circuit below — that's the input state the first cost layer acts on. Each layer after that adds its own pair of angles, \(\gamma\) (cost) and \(\beta\) (mixer); finding good values for those angles, for *whatever* \(p\) you pick, requires a full run of the loop above, not just a longer circuit. Toggling \(p\) alone doesn't improve anything; the bars below assume that loop has already converged for that \(p\). Use the **Untuned angles** toggle to see what happens when it hasn't.

<div class="qed-demo" id="qaoa-players-demo">
  <svg class="qed-circuit-svg" id="qaoa-players-svg" viewBox="0 0 480 150" width="480" height="150" role="img" aria-label="Circuit diagram: Hadamard gates preparing an equal superposition, followed by one to three repeated layers of a cost block and a mixer block across four qubit wires, then measurement.">
    <line class="qed-circuit-wire" id="qaoa-wire-1" x1="20" y1="20" x2="225" y2="20" />
    <line class="qed-circuit-wire" id="qaoa-wire-2" x1="20" y1="55" x2="225" y2="55" />
    <line class="qed-circuit-wire" id="qaoa-wire-3" x1="20" y1="90" x2="225" y2="90" />
    <line class="qed-circuit-wire" id="qaoa-wire-4" x1="20" y1="125" x2="225" y2="125" />

    <text class="qed-circuit-label" x="10" y="24" text-anchor="end">q₁</text>
    <text class="qed-circuit-label" x="10" y="59" text-anchor="end">q₂</text>
    <text class="qed-circuit-label" x="10" y="94" text-anchor="end">q₃</text>
    <text class="qed-circuit-label" x="10" y="129" text-anchor="end">q₄</text>

    <rect class="qed-circuit-gate-box" x="35" y="8" width="25" height="24" rx="3" />
    <text class="qed-circuit-label" x="47.5" y="24" text-anchor="middle">H</text>
    <rect class="qed-circuit-gate-box" x="35" y="43" width="25" height="24" rx="3" />
    <text class="qed-circuit-label" x="47.5" y="59" text-anchor="middle">H</text>
    <rect class="qed-circuit-gate-box" x="35" y="78" width="25" height="24" rx="3" />
    <text class="qed-circuit-label" x="47.5" y="94" text-anchor="middle">H</text>
    <rect class="qed-circuit-gate-box" x="35" y="113" width="25" height="24" rx="3" />
    <text class="qed-circuit-label" x="47.5" y="129" text-anchor="middle">H</text>

    <g id="qaoa-layer-1">
      <rect class="qed-circuit-gate-box" x="70" y="10" width="50" height="125" rx="4" />
      <text class="qed-circuit-label" x="95" y="7" text-anchor="middle">Cost γ₁</text>
      <rect class="qed-circuit-gate-box qed-circuit-gate-box--mixer" x="130" y="10" width="50" height="125" rx="4" />
      <text class="qed-circuit-label" x="155" y="7" text-anchor="middle">Mixer β₁</text>
    </g>

    <g id="qaoa-layer-2" hidden>
      <rect class="qed-circuit-gate-box" x="190" y="10" width="50" height="125" rx="4" />
      <text class="qed-circuit-label" x="215" y="7" text-anchor="middle">Cost γ₂</text>
      <rect class="qed-circuit-gate-box qed-circuit-gate-box--mixer" x="250" y="10" width="50" height="125" rx="4" />
      <text class="qed-circuit-label" x="275" y="7" text-anchor="middle">Mixer β₂</text>
    </g>

    <g id="qaoa-layer-3" hidden>
      <rect class="qed-circuit-gate-box" x="310" y="10" width="50" height="125" rx="4" />
      <text class="qed-circuit-label" x="335" y="7" text-anchor="middle">Cost γ₃</text>
      <rect class="qed-circuit-gate-box qed-circuit-gate-box--mixer" x="370" y="10" width="50" height="125" rx="4" />
      <text class="qed-circuit-label" x="395" y="7" text-anchor="middle">Mixer β₃</text>
    </g>

    <rect class="qed-circuit-measure-box" id="qaoa-measure-box-1" x="195" y="8" width="30" height="24" rx="3" />
    <text class="qed-circuit-label" id="qaoa-measure-label-1" x="210" y="24" text-anchor="middle">M</text>
    <rect class="qed-circuit-measure-box" id="qaoa-measure-box-2" x="195" y="43" width="30" height="24" rx="3" />
    <text class="qed-circuit-label" id="qaoa-measure-label-2" x="210" y="59" text-anchor="middle">M</text>
    <rect class="qed-circuit-measure-box" id="qaoa-measure-box-3" x="195" y="78" width="30" height="24" rx="3" />
    <text class="qed-circuit-label" id="qaoa-measure-label-3" x="210" y="94" text-anchor="middle">M</text>
    <rect class="qed-circuit-measure-box" id="qaoa-measure-box-4" x="195" y="113" width="30" height="24" rx="3" />
    <text class="qed-circuit-label" id="qaoa-measure-label-4" x="210" y="129" text-anchor="middle">M</text>
  </svg>

  <p style="text-align:center;" id="qaoa-angles-readout"></p>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--active" id="qaoa-p-1-btn">p = 1</button>
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-p-2-btn">p = 2</button>
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-p-3-btn">p = 3</button>
  </div>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--active" id="qaoa-tuned-btn">Optimizer-tuned angles</button>
    <button type="button" class="qed-button qed-button--secondary" id="qaoa-untuned-btn">Untuned (random) angles</button>
  </div>

  <div style="margin-top:0.8rem;">
    <div class="qed-confidence-row" id="qaoa-prob-row-opt1">
      <span class="qed-confidence-row__label">0101 (cut = 4)</span>
      <span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" id="qaoa-prob-bar-opt1"></span></span>
      <span class="qed-confidence-row__pct" id="qaoa-prob-pct-opt1"></span>
    </div>
    <div class="qed-confidence-row" id="qaoa-prob-row-opt2">
      <span class="qed-confidence-row__label">1010 (cut = 4)</span>
      <span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" id="qaoa-prob-bar-opt2"></span></span>
      <span class="qed-confidence-row__pct" id="qaoa-prob-pct-opt2"></span>
    </div>
    <div class="qed-confidence-row" id="qaoa-prob-row-sub">
      <span class="qed-confidence-row__label">0011 (cut = 2)</span>
      <span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" id="qaoa-prob-bar-sub"></span></span>
      <span class="qed-confidence-row__pct" id="qaoa-prob-pct-sub"></span>
    </div>
    <div class="qed-confidence-row" id="qaoa-prob-row-worst">
      <span class="qed-confidence-row__label">0000 (cut = 0)</span>
      <span class="qed-confidence-bar"><span class="qed-confidence-bar__fill" id="qaoa-prob-bar-worst"></span></span>
      <span class="qed-confidence-row__pct" id="qaoa-prob-pct-worst"></span>
    </div>
  </div>
  <p class="qed-encode-demo__hint" id="qaoa-players-hint" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("qaoa-players-demo");
  if (!demo) return;

  // Hand-authored, illustrative only — not computed from an actual
  // QAOA simulation. The point is two trends: (1) with tuned angles,
  // more layers concentrate probability on the optimal bitstrings;
  // (2) with untuned (random) angles, adding layers does NOT help —
  // the classical optimizer, not the layer count alone, is what does
  // the work. Neither table should be read as exact values.
  var PROB_TUNED = {
    1: { opt1: 20, opt2: 20, sub: 10, worst: 3 },
    2: { opt1: 30, opt2: 30, sub: 8, worst: 1 },
    3: { opt1: 38, opt2: 38, sub: 5, worst: 0.5 }
  };
  var PROB_UNTUNED = {
    1: { opt1: 9, opt2: 9, sub: 9, worst: 8 },
    2: { opt1: 10, opt2: 9, sub: 9, worst: 8 },
    3: { opt1: 10, opt2: 10, sub: 9, worst: 8 }
  };

  var ANGLES_TUNED = {
    1: "γ₁=0.46, β₁=0.31",
    2: "γ₁=0.52, β₁=0.28, γ₂=0.35, β₂=0.19",
    3: "γ₁=0.55, β₁=0.30, γ₂=0.40, β₂=0.22, γ₃=0.27, β₃=0.14"
  };
  var ANGLES_UNTUNED = {
    1: "γ₁=1.92, β₁=4.67",
    2: "γ₁=0.88, β₁=5.51, γ₂=3.14, β₂=1.07",
    3: "γ₁=2.65, β₁=0.19, γ₂=4.40, β₂=3.33, γ₃=1.08, β₃=5.92"
  };

  var MEASURE_X = { 1: 195, 2: 315, 3: 435 };
  var WIRE_X2 = { 1: 225, 2: 345, 3: 465 };

  var layer2 = document.getElementById("qaoa-layer-2");
  var layer3 = document.getElementById("qaoa-layer-3");
  var anglesReadout = document.getElementById("qaoa-angles-readout");
  var hint = document.getElementById("qaoa-players-hint");
  var pBtns = {
    1: document.getElementById("qaoa-p-1-btn"),
    2: document.getElementById("qaoa-p-2-btn"),
    3: document.getElementById("qaoa-p-3-btn")
  };
  var tunedBtn = document.getElementById("qaoa-tuned-btn");
  var untunedBtn = document.getElementById("qaoa-untuned-btn");

  var currentP = 1;
  var tuned = true;

  function setProbBars() {
    var probs = (tuned ? PROB_TUNED : PROB_UNTUNED)[currentP];
    ["opt1", "opt2", "sub", "worst"].forEach(function (key) {
      document.getElementById("qaoa-prob-bar-" + key).style.width = probs[key] + "%";
      document.getElementById("qaoa-prob-pct-" + key).textContent = probs[key] + "%";
    });
    document.getElementById("qaoa-prob-row-opt1").classList.toggle("is-leading", tuned);
    document.getElementById("qaoa-prob-row-opt2").classList.toggle("is-leading", tuned);
  }

  function setCircuit() {
    layer2.hidden = currentP < 2;
    layer3.hidden = currentP < 3;

    var measureX = MEASURE_X[currentP];
    var wireX2 = WIRE_X2[currentP];

    [1, 2, 3, 4].forEach(function (row) {
      var box = document.getElementById("qaoa-measure-box-" + row);
      var label = document.getElementById("qaoa-measure-label-" + row);
      var wire = document.getElementById("qaoa-wire-" + row);
      box.setAttribute("x", measureX);
      label.setAttribute("x", measureX + 15);
      wire.setAttribute("x2", wireX2);
    });
  }

  function setAnglesReadout() {
    var angles = (tuned ? ANGLES_TUNED : ANGLES_UNTUNED)[currentP];
    anglesReadout.textContent = "Angles used (p=" + currentP + "): " + angles;
  }

  function setHint() {
    if (tuned) {
      hint.textContent = "These angles are the result of the classical optimizer's search for this p — the same kind of search VQE ran over θ. Illustrative probabilities for 4 of the 16 possible groupings; the remaining probability is spread across the rest.";
    } else {
      hint.textContent = "These angles were picked at random instead of optimized. Notice p alone doesn't fix that — the distribution stays close to a coin flip no matter how many layers you add. The classical optimizer, not the layer count, is doing the real work.";
    }
  }

  function setActiveButtons() {
    [1, 2, 3].forEach(function (n) {
      pBtns[n].classList.toggle("qed-button--active", n === currentP);
      pBtns[n].classList.toggle("qed-button--secondary", n !== currentP);
    });
    tunedBtn.classList.toggle("qed-button--active", tuned);
    tunedBtn.classList.toggle("qed-button--secondary", !tuned);
    untunedBtn.classList.toggle("qed-button--active", !tuned);
    untunedBtn.classList.toggle("qed-button--secondary", tuned);
  }

  function render() {
    setCircuit();
    setProbBars();
    setAnglesReadout();
    setHint();
    setActiveButtons();
  }

  pBtns[1].addEventListener("click", function () { currentP = 1; render(); });
  pBtns[2].addEventListener("click", function () { currentP = 2; render(); });
  pBtns[3].addEventListener("click", function () { currentP = 3; render(); });
  tunedBtn.addEventListener("click", function () { tuned = true; render(); });
  untunedBtn.addEventListener("click", function () { tuned = false; render(); });

  render();
});
</script>

## Reading Out an Answer

The optimizer loop doesn't produce a bitstring by itself — every run inside that loop only ever produces an estimated \(\langle C \rangle\), used purely to decide which angles to try next. QAOA isn't finished once that loop converges; there's one more step. Using the best angles the loop found, the circuit is run again — many times over — and *this* final batch of samples is the actual output: a distribution over bitstrings, the kind shown in the demo above. The answer is whichever bitstring (or small handful of bitstrings) came up with the highest probability in that distribution. Nothing about this final sampling step feeds back into the optimizer; the search is already done by the time it happens.

QAOA's whole job, across every piece covered so far, is to bias that final distribution toward good groupings, the way the bars above concentrate more as \(p\) grows — it doesn't guarantee the optimal one shows up, especially at low \(p\), which is exactly why you're reading off a probability, not a certainty.

This is a different kind of output than VQE's. VQE gives you a number: an estimated ground-state energy. QAOA gives you a bitstring: a candidate solution you can check directly (just count its cut edges).

## QAOA vs. VQE

| | VQE | QAOA |
|---|---|---|
| Output | A number (estimated ground-state energy) | A bitstring (a candidate solution) |
| Problem type | Continuous optimization | Combinatorial / discrete optimization |
| Classical counterpart | Diagonalizing a Hamiltonian | Brute-force search over groupings |

- <span class="qed-cap-yes">✓</span> Same NISQ-friendly philosophy as VQE — short circuits, classical optimizer does the iterative work
- <span class="qed-cap-yes">✓</span> More layers (\(p\)) generally improves solution quality
- <span class="qed-cap-no">✗</span> Not guaranteed to find the true optimal cut, especially at low \(p\)
- <span class="qed-cap-no">✗</span> More layers means a longer, noisier circuit — a real tradeoff, not a free improvement

## Takeaway

<div class="qed-demo" style="text-align:center;">
  <svg class="qed-loop-svg" viewBox="0 0 520 235" width="520" height="235" role="img" aria-label="Diagram of the QAOA loop: run the circuit for p layers of cost and mixer, sample bitstrings to estimate the expected cut value, update beta and gamma, and repeat until converged, then sample once more for the best cut found.">
    <defs>
      <marker id="qaoa-loop-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path class="qed-loop-arrowhead-fill" d="M0,0 L8,4 L0,8 Z" />
      </marker>
    </defs>

    <rect class="qed-loop-box" x="10" y="70" width="150" height="50" rx="6" />
    <text class="qed-loop-label" x="85" y="90">Run p layers of</text>
    <text class="qed-loop-label" x="85" y="104">cost + mixer</text>

    <rect class="qed-loop-box" x="195" y="70" width="120" height="50" rx="6" />
    <text class="qed-loop-label" x="255" y="90">Sample, estimate</text>
    <text class="qed-loop-label" x="255" y="104">⟨C⟩</text>

    <rect class="qed-loop-box" x="350" y="70" width="160" height="50" rx="6" />
    <text class="qed-loop-label" x="430" y="90">Classical optimizer</text>
    <text class="qed-loop-label" x="430" y="104">updates β, γ</text>

    <line class="qed-loop-arrow" x1="160" y1="95" x2="192" y2="95" marker-end="url(#qaoa-loop-arrowhead)" />
    <line class="qed-loop-arrow" x1="315" y1="95" x2="347" y2="95" marker-end="url(#qaoa-loop-arrowhead)" />

    <path class="qed-loop-arrow" d="M 430 70 L 430 20 L 85 20 L 85 70" marker-end="url(#qaoa-loop-arrowhead)" />
    <text class="qed-loop-label" x="257" y="18">repeat</text>

    <line class="qed-loop-arrow" x1="430" y1="120" x2="430" y2="167" marker-end="url(#qaoa-loop-arrowhead)" />
    <text class="qed-loop-label" x="470" y="146">once</text>
    <text class="qed-loop-label" x="470" y="158">converged</text>

    <rect class="qed-loop-box qed-loop-box--protected" x="350" y="170" width="160" height="50" rx="6" />
    <text class="qed-loop-label" x="430" y="190">Sample again —</text>
    <text class="qed-loop-label" x="430" y="204">best cut found</text>
  </svg>
</div>

VQE and QAOA are two instances of the same hybrid variational pattern — prepare, measure, let a classical optimizer adjust, repeat — aimed at two very different kinds of problems: a continuous energy to minimize, and a discrete choice to search over. The same pattern extends further still: a Variational Quantum Classifier applies it to machine learning, and techniques like SQD apply it in other ways, though neither has its own lesson here yet.

**[Back to Module 06 Overview →](index.md)**
