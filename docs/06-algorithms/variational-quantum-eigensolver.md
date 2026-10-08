# Variational Quantum Eigensolver (VQE)

Many of the most important open problems in chemistry and materials science come down to one question: what is the lowest-energy configuration a quantum system can settle into? This page introduces the **Variational Quantum Eigensolver (VQE)**, the algorithm most commonly used to attack that question on today's quantum hardware.

!!! note "Assumed background"
    This page uses two ideas that don't have their own lesson yet in this module: a **parameterized quantum circuit** (a circuit whose gates depend on adjustable numbers) and **measuring an expectation value** (running a circuit many times and averaging the results). Enough of each is explained inline to follow the examples below — a fuller treatment belongs in earlier modules.

## A Problem Too Big to Compute Directly

Every quantum system has a Hamiltonian \(H\), an operator whose eigenvalues are the energies the system can have, and a **ground state** \(|\psi_0\rangle\) — the lowest-energy configuration, with ground-state energy \(E_0\). Knowing \(E_0\) for a molecule tells you things like how stable it is or how it reacts.

For a small enough system, you can find \(E_0\) by directly diagonalizing \(H\). The catch is that \(H\)'s size grows exponentially with the number of qubits (or, physically, the number of interacting particles) needed to describe the system, so exact diagonalization stops being possible long before you reach a molecule anyone cares about.

What if, instead of computing the ground-state energy directly, you searched for it?

## The Variational Principle

\[
\langle \psi(\theta) | H | \psi(\theta) \rangle \;\geq\; E_0
\]

For *any* trial state \(|\psi(\theta)\rangle\) you can prepare, measuring its energy always gives a number greater than or equal to the true ground-state energy — an underestimate is never possible. So the lowest energy you can find by searching over \(\theta\) is a genuine, trustworthy bound, not a fluke. This is the "variational" in Variational Quantum Eigensolver: vary a trial state, and minimize what you measure.

## The Ansatz: A Trial State You Can Tune

The circuit that prepares your trial state is called the **ansatz**. The example used throughout this page is about as simple as an ansatz gets: one qubit, one adjustable gate.

<div class="qed-demo" style="text-align:center;">
  <svg class="qed-circuit-svg" viewBox="0 0 260 70" width="260" height="70" role="img" aria-label="Circuit diagram: a single qubit starting in state zero, passing through an RY(theta) rotation gate, then measured.">
    <line class="qed-circuit-wire" x1="20" y1="35" x2="240" y2="35" />
    <text class="qed-circuit-label" x="10" y="39" text-anchor="end">|0⟩</text>
    <rect class="qed-circuit-gate-box" x="90" y="15" width="60" height="40" rx="4" />
    <text class="qed-circuit-label" x="120" y="39" text-anchor="middle" font-weight="700">RY(θ)</text>
    <rect class="qed-circuit-measure-box" x="190" y="15" width="36" height="40" rx="3" />
    <text class="qed-circuit-label" x="208" y="39" text-anchor="middle">M</text>
  </svg>
</div>

The gate \(RY(\theta)\) rotates the qubit by an angle \(\theta\) — the one adjustable parameter of this ansatz. Its trial state is \(|\psi(\theta)\rangle = \cos(\theta/2)|0\rangle + \sin(\theta/2)|1\rangle\).

To have something to measure, this page uses a small toy Hamiltonian:

\[
H = 0.6\,Z + 0.4\,X
\]

This is a deliberately simplified stand-in for a real system's energy — a real molecule's Hamiltonian has far more terms, acting on far more qubits. But the shape of the problem is identical: prepare a trial state, measure its energy, adjust, repeat.

For this ansatz and this \(H\), the energy has an exact closed form:

\[
E(\theta) = \langle \psi(\theta) | H | \psi(\theta) \rangle = 0.6\cos\theta + 0.4\sin\theta
\]

## Interactive: Explore the Energy Landscape

Drag the slider to try different values of \(\theta\) and watch the measured energy move along the curve below. The dashed line marks the true minimum — try to get the marker as close to it as you can, then let **Step Downhill** finish the job.

<div class="qed-demo" id="vqe-landscape-demo">
  <svg class="qed-plot-svg" id="vqe-plot-svg" viewBox="0 0 380 200" width="380" height="200" role="img" aria-label="Plot of energy E as a function of theta, with a marker showing the current value and a dashed line marking the true minimum.">
    <line class="qed-plot-axis" x1="40" y1="92.5" x2="365" y2="92.5" />
    <line class="qed-plot-axis" x1="40" y1="15" x2="40" y2="170" />
    <line class="qed-plot-target" x1="40" y1="148.4" x2="365" y2="148.4" />
    <text class="qed-plot-label" x="362" y="144" text-anchor="end">E₀ ≈ −0.72</text>
    <text class="qed-plot-label" x="34" y="19" text-anchor="end">1</text>
    <text class="qed-plot-label" x="34" y="96" text-anchor="end">0</text>
    <text class="qed-plot-label" x="34" y="173" text-anchor="end">−1</text>
    <text class="qed-plot-label" x="40" y="185" text-anchor="middle">0°</text>
    <text class="qed-plot-label" x="121.25" y="185" text-anchor="middle">90°</text>
    <text class="qed-plot-label" x="202.5" y="185" text-anchor="middle">180°</text>
    <text class="qed-plot-label" x="283.75" y="185" text-anchor="middle">270°</text>
    <text class="qed-plot-label" x="365" y="185" text-anchor="middle">360°</text>
    <path class="qed-plot-curve" id="vqe-plot-curve" d="" />
    <circle class="qed-plot-point" id="vqe-plot-point" cx="40" cy="80" r="5" />
  </svg>

  <div class="qed-demo__controls" style="text-align:center;">
    <label for="vqe-theta-slider">θ = <span id="vqe-theta-value">0°</span>, E(θ) = <span id="vqe-energy-value">0.60</span></label>
    <input type="range" id="vqe-theta-slider" min="0" max="359" value="0" step="1">
    <div>
      <button type="button" class="qed-button" id="vqe-step-btn">Step Downhill</button>
      <button type="button" class="qed-button qed-button--secondary" id="vqe-reset-btn">Reset</button>
    </div>
    <p class="qed-encode-demo__hint" id="vqe-landscape-hint" aria-live="polite">Try a few values of θ by hand, then let Step Downhill take over.</p>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var svg = document.getElementById("vqe-landscape-demo");
  if (!svg) return;

  var A = 0.6, B = 0.4;
  var E_MIN = -Math.sqrt(A * A + B * B);

  var slider = document.getElementById("vqe-theta-slider");
  var thetaLabel = document.getElementById("vqe-theta-value");
  var energyLabel = document.getElementById("vqe-energy-value");
  var stepBtn = document.getElementById("vqe-step-btn");
  var resetBtn = document.getElementById("vqe-reset-btn");
  var hint = document.getElementById("vqe-landscape-hint");
  var curve = document.getElementById("vqe-plot-curve");
  var point = document.getElementById("vqe-plot-point");

  var plotX0 = 40, plotX1 = 365, plotY0 = 15, plotY1 = 170;
  var plotW = plotX1 - plotX0, plotH = plotY1 - plotY0;

  function energyAt(thetaDeg) {
    var rad = thetaDeg * Math.PI / 180;
    return A * Math.cos(rad) + B * Math.sin(rad);
  }

  function xFor(thetaDeg) {
    return plotX0 + (thetaDeg / 360) * plotW;
  }

  function yFor(energy) {
    return plotY0 + ((1 - energy) / 2) * plotH;
  }

  function buildCurve() {
    var d = "";
    for (var deg = 0; deg <= 360; deg += 4) {
      var x = xFor(deg);
      var y = yFor(energyAt(deg));
      d += (deg === 0 ? "M " : "L ") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    curve.setAttribute("d", d);
  }

  var stepDeg = 40;

  function render(thetaDeg) {
    var e = energyAt(thetaDeg);
    thetaLabel.textContent = Math.round(thetaDeg) + "°";
    energyLabel.textContent = e.toFixed(2);
    point.setAttribute("cx", xFor(thetaDeg).toFixed(1));
    point.setAttribute("cy", yFor(e).toFixed(1));
    var converged = Math.abs(e - E_MIN) < 0.01;
    point.classList.toggle("is-converged", converged);
    if (converged) {
      hint.textContent = "Converged — this is the true minimum energy of this toy Hamiltonian.";
    }
  }

  slider.addEventListener("input", function () {
    stepDeg = 40;
    hint.textContent = "Try a few values of θ by hand, then let Step Downhill take over.";
    render(Number(slider.value));
  });

  stepBtn.addEventListener("click", function () {
    var theta = Number(slider.value);
    var current = energyAt(theta);
    var left = energyAt((theta - stepDeg + 360) % 360);
    var right = energyAt((theta + stepDeg) % 360);

    if (left <= current && left <= right) {
      theta = (theta - stepDeg + 360) % 360;
    } else if (right < current) {
      theta = (theta + stepDeg) % 360;
    } else {
      stepDeg = stepDeg / 2;
    }

    if (stepDeg < 0.5) {
      hint.textContent = "Converged — this is the true minimum energy of this toy Hamiltonian.";
    } else {
      hint.textContent = "Stepped toward lower energy. Keep clicking to keep descending.";
    }

    slider.value = theta;
    render(theta);
  });

  resetBtn.addEventListener("click", function () {
    stepDeg = 40;
    slider.value = 0;
    hint.textContent = "Try a few values of θ by hand, then let Step Downhill take over.";
    render(0);
  });

  buildCurve();
  render(0);
});
</script>

**Step Downhill** doesn't use any calculus — each click just checks a small step to either side of the current \(\theta\), moves toward whichever side has lower energy, and shrinks the step once neither side helps anymore. A classical optimizer does the same kind of thing, just with a more sophisticated strategy and, in real VQE, without being able to see the whole curve at once — only the energy at the point it's currently standing on.

## The Hybrid Loop

In the demo above, *you* decided which way to move \(\theta\). In actual VQE, a classical optimizer does that automatically, based only on the energy it's just measured:

1. The quantum computer prepares \(|\psi(\theta)\rangle\) using the ansatz circuit and the current \(\theta\).
2. It's measured many times to estimate \(\langle \psi(\theta) | H | \psi(\theta) \rangle\) — a single measurement isn't enough; the expectation value comes from the statistics of many repeated runs.
3. A classical optimizer looks at that measured energy and proposes a new \(\theta\) expected to lower it.
4. Repeat until the energy stops improving.

Notice the division of labor: the quantum computer only ever does two things — prepare a state and get measured — using a circuit that stays short no matter how many iterations it takes. The classical computer does all of the iterative searching, on hardware that's cheap, reliable, and easy to scale.

## Interactive: Run the Hybrid Loop

This time, step through the loop itself. The classical optimizer's proposed angles are scripted here — the point is to see the *shape* of the loop, not to control it by hand.

<div class="qed-demo" id="vqe-loop-demo">
  <div style="display:grid; grid-template-columns: 12rem 10rem 12rem; grid-template-rows: auto auto; align-items:center; justify-items:center; gap:0.2rem 0; overflow-x:auto;">
    <div class="qed-qubit qed-qubit--logical" id="vqe-loop-quantum" style="grid-row:1 / 3; grid-column:1; width:12rem; height:4.6rem;">
      <div class="qed-qubit__label">Quantum Processor</div>
      <div class="qed-qubit__state" id="vqe-loop-quantum-state">idle</div>
    </div>
    <div class="qed-encode-demo__arrow" style="grid-row:1; grid-column:2;"><span id="vqe-loop-fwd-label">—</span><span aria-hidden="true">→</span></div>
    <div class="qed-encode-demo__arrow" style="grid-row:2; grid-column:2;"><span aria-hidden="true">←</span><span id="vqe-loop-back-label">—</span></div>
    <div class="qed-qubit qed-qubit--physical" id="vqe-loop-classical" style="grid-row:1 / 3; grid-column:3; width:12rem; height:4.6rem;">
      <div class="qed-qubit__label">Classical Optimizer</div>
      <div class="qed-qubit__state" id="vqe-loop-classical-state">idle</div>
    </div>
  </div>

  <p style="text-align:center;">Iteration: <span id="vqe-loop-iter">0</span></p>

  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="vqe-loop-prepare-btn">Prepare</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqe-loop-measure-btn" disabled>Measure Energy</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqe-loop-update-btn" disabled>Classical Update</button>
    <button type="button" class="qed-button qed-button--secondary" id="vqe-loop-reset-btn" disabled>Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="vqe-loop-hint" aria-live="polite">Click Prepare to begin the first iteration.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var demo = document.getElementById("vqe-loop-demo");
  if (!demo) return;

  var A = 0.6, B = 0.4;
  var THETAS = [0, 100, 170, 200, 212, 214];

  function energyAt(thetaDeg) {
    var rad = thetaDeg * Math.PI / 180;
    return A * Math.cos(rad) + B * Math.sin(rad);
  }

  var quantumState = document.getElementById("vqe-loop-quantum-state");
  var classicalState = document.getElementById("vqe-loop-classical-state");
  var fwdLabel = document.getElementById("vqe-loop-fwd-label");
  var backLabel = document.getElementById("vqe-loop-back-label");
  var iterEl = document.getElementById("vqe-loop-iter");
  var hint = document.getElementById("vqe-loop-hint");
  var prepareBtn = document.getElementById("vqe-loop-prepare-btn");
  var measureBtn = document.getElementById("vqe-loop-measure-btn");
  var updateBtn = document.getElementById("vqe-loop-update-btn");
  var resetBtn = document.getElementById("vqe-loop-reset-btn");

  var i = 0;

  function prepare() {
    quantumState.textContent = "θ = " + THETAS[i] + "°";
    classicalState.textContent = "idle";
    fwdLabel.textContent = "—";
    backLabel.textContent = "—";
    hint.textContent = "State prepared with θ = " + THETAS[i] + "°. Now measure its energy.";
    prepareBtn.disabled = true;
    measureBtn.disabled = false;
  }

  function measure() {
    var e = energyAt(THETAS[i]);
    fwdLabel.textContent = "E ≈ " + e.toFixed(3);
    iterEl.textContent = String(i + 1);
    measureBtn.disabled = true;
    if (i + 1 < THETAS.length) {
      hint.textContent = "Measured E ≈ " + e.toFixed(3) + ". Let the classical optimizer propose the next θ.";
      updateBtn.disabled = false;
    } else {
      classicalState.textContent = "converged";
      hint.textContent = "Converged — E ≈ " + e.toFixed(3) + ", the ground-state energy of this toy Hamiltonian.";
      resetBtn.disabled = false;
    }
  }

  function classicalUpdate() {
    i += 1;
    classicalState.textContent = "ready";
    backLabel.textContent = "θ ≈ " + THETAS[i] + "°";
    hint.textContent = "Classical optimizer proposed θ ≈ " + THETAS[i] + "°. Prepare the next iteration.";
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

## What VQE Is Good For (and Isn't)

- <span class="qed-cap-yes">✓</span> Uses short, shallow circuits — feasible on today's noisy ("NISQ") hardware
- <span class="qed-cap-yes">✓</span> Tends to produce reasonable energy estimates even when the hardware itself is noisy
- <span class="qed-cap-no">✗</span> Not guaranteed to find the true global minimum — the search can get stuck partway down
- <span class="qed-cap-no">✗</span> Needs many repeated circuit runs per iteration, and many iterations, to converge

!!! info "Preview: local minima and barren plateaus"
    Getting stuck away from the true minimum, or having the energy landscape become too flat to navigate as systems grow larger, are real practical challenges for VQE. The details are left for a later, deeper treatment — for now it's enough to know the search isn't always as smooth as our one-parameter toy example.

Compare this to Shor's Algorithm or Grover's Algorithm: those need long, precise, fully fault-tolerant circuits to work at all — run them on today's noisy hardware and they simply fail. VQE was designed the opposite way: keep the quantum circuit as short as possible, and let a classical computer absorb as much of the difficulty as it can. That tradeoff — approximate answers now, instead of exact answers later — is what makes VQE one of the leading algorithms for near-term quantum hardware, aimed at problems, like large-molecule ground-state energies, that stay completely out of reach for classical computers no matter how much noise is involved.

## Takeaway

<div class="qed-demo" style="text-align:center;">
  <svg class="qed-loop-svg" viewBox="0 0 520 235" width="520" height="235" role="img" aria-label="Diagram of the VQE loop: the ansatz prepares a trial state, its energy is measured, the classical optimizer updates theta, and the cycle repeats until it converges on a ground-state estimate.">
    <defs>
      <marker id="vqe-loop-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path class="qed-loop-arrowhead-fill" d="M0,0 L8,4 L0,8 Z" />
      </marker>
    </defs>

    <rect class="qed-loop-box" x="10" y="70" width="150" height="50" rx="6" />
    <text class="qed-loop-label" x="85" y="90">Ansatz prepares</text>
    <text class="qed-loop-label" x="85" y="104">trial state |ψ(θ)⟩</text>

    <rect class="qed-loop-box" x="195" y="70" width="120" height="50" rx="6" />
    <text class="qed-loop-label" x="255" y="90">Measure</text>
    <text class="qed-loop-label" x="255" y="104">energy ⟨H⟩</text>

    <rect class="qed-loop-box" x="350" y="70" width="160" height="50" rx="6" />
    <text class="qed-loop-label" x="430" y="90">Classical optimizer</text>
    <text class="qed-loop-label" x="430" y="104">updates θ</text>

    <line class="qed-loop-arrow" x1="160" y1="95" x2="192" y2="95" marker-end="url(#vqe-loop-arrowhead)" />
    <line class="qed-loop-arrow" x1="315" y1="95" x2="347" y2="95" marker-end="url(#vqe-loop-arrowhead)" />

    <path class="qed-loop-arrow" d="M 430 70 L 430 20 L 85 20 L 85 70" marker-end="url(#vqe-loop-arrowhead)" />
    <text class="qed-loop-label" x="257" y="18">repeat</text>

    <line class="qed-loop-arrow" x1="430" y1="120" x2="430" y2="167" marker-end="url(#vqe-loop-arrowhead)" />
    <text class="qed-loop-label" x="470" y="146">once</text>
    <text class="qed-loop-label" x="470" y="158">converged</text>

    <rect class="qed-loop-box qed-loop-box--protected" x="350" y="170" width="160" height="50" rx="6" />
    <text class="qed-loop-label" x="430" y="190">Converged ground-</text>
    <text class="qed-loop-label" x="430" y="204">state estimate</text>
  </svg>
</div>

VQE's pattern — guess, measure, adjust, repeat — is the blueprint for a whole family of near-term quantum algorithms. What changes from one to the next is the problem, the ansatz, and what's being measured.

What if, instead of a molecule's energy, the number you're trying to minimize described how good a solution is to a combinatorial choice — like how to split up a graph into two groups? That's the idea behind QAOA.

**[Next: QAOA →](quantum-approximate-optimization-algorithm.md)**
