# What Is Quantum Computing?

A classical computer stores and processes **bits**. A quantum computer stores and processes **qubits**, which obey different rules. This page introduces the four ideas that the rest of QuantumEd builds on: **qubits**, **superposition**, **measurement**, and **entanglement**. Each comes with an interactive demonstration.

## Qubits

A classical bit is always either `0` or `1`. A **qubit** is a two-level quantum system whose state can be a combination, or *superposition*, of both:

\[
|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\varphi}\sin\left(\frac{\theta}{2}\right)|1\rangle
\]

Any single-qubit state can be pictured as a point on the surface of a sphere, the **Bloch sphere**. The angle \(\theta\) sets how much of the state points toward \(|0\rangle\) versus \(|1\rangle\), and \(\varphi\) sets a **phase**. A single measurement cannot detect the phase, but it becomes essential once states are combined, as the next section shows.

Use the sliders below to move the state around the sphere and observe how the measurement probabilities change.

<div class="qed-demo" id="wq-bloch">
  <div class="qed-demo__layout">
    <canvas id="wq-bloch-canvas" width="260" height="260" role="img" aria-label="Bloch sphere showing the current qubit state."></canvas>
    <div class="qed-demo__controls">
      <label for="wq-bloch-theta">θ — polar angle: <span id="wq-bloch-theta-value"></span></label>
      <input type="range" id="wq-bloch-theta" min="0" max="180" step="1" value="90">
      <label for="wq-bloch-phi">φ — phase angle: <span id="wq-bloch-phi-value"></span></label>
      <input type="range" id="wq-bloch-phi" min="0" max="360" step="1" value="0">
      <div class="qed-demo__state">
        <div id="wq-bloch-formula"></div>
        <div>P(measure 0) = <span id="wq-bloch-p0"></span> &nbsp;&nbsp; P(measure 1) = <span id="wq-bloch-p1"></span></div>
      </div>
    </div>
  </div>
</div>

You should notice two things:

- **θ controls the odds.** At 0° the qubit is certainly `0`; at 180° it is certainly `1`; at 90° the two outcomes are equally likely.
- **φ does not change the odds.** Varying it moves the arrow around the sphere, but the probabilities stay fixed. Phase is a real property of the state; it is simply invisible to a single measurement.

The numbers multiplying \(|0\rangle\) and \(|1\rangle\) (0.71 and 0.71 in the starting position) are called **amplitudes**. The probability of an outcome is the square of its amplitude, so two amplitudes of 0.71 give \(0.71^2 \approx 50\%\) each. The sliders show how these amplitudes correspond to a point on the sphere; [Module 02](../02-fundamentals/index.md) treats the Bloch sphere in full.

## Superposition

The phrase "a qubit is both 0 and 1 at the same time" is common shorthand, but it invites a misreading, so it is worth being precise.

Consider a coin that has been flipped and covered with a cup. It is heads or tails; we simply have not looked to see which side it landed on. That is ordinary uncertainty about a value that already exists. A qubit in superposition doesn't work this way. It is described by two **amplitudes**, one for `0` and one for `1`, and these amplitudes can be positive or negative. That allows them to **cancel** each other out, much as two overlapping waves can partialy or fully cancel each other. This effect is called **interference**, and it is what distinguishes a superposition from the hidden coin.

The demonstration below applies the same "mix" operation to a classical random bit and to a qubit. For the qubit, the operation is the **Hadamard gate**, written *H*. Gates are covered properly in [Module 02](../02-fundamentals/index.md), but for now it serves simply as a mix button. For the classical bit, mixing means re-flipping a fair coin. Start both at `0`, apply the mix, and then apply it a second time.

<div class="qed-demo" id="wq-mix">
  <div class="qed-compare-row" style="align-items:stretch;">
    <div class="qed-panel"><div class="qed-panel__title">Classical random bit</div><div class="qed-panel__state" id="wq-mix-c-state"></div><div id="wq-mix-c-bars"></div></div>
    <div class="qed-panel qed-panel--quantum"><div class="qed-panel__title">Qubit</div><div class="qed-panel__state" id="wq-mix-q-state"></div><div id="wq-mix-q-amps"></div><div id="wq-mix-q-bars"></div></div>
  </div>
  <div class="qed-demo__controls" style="min-width:auto; text-align:center; margin-top:0.8rem;">
    <span>Start both in:</span>
    <button type="button" class="qed-button qed-button--secondary" id="wq-mix-start-0" aria-pressed="false">0</button>
    <button type="button" class="qed-button qed-button--secondary" id="wq-mix-start-1" aria-pressed="false">1</button>
    <button type="button" class="qed-button" id="wq-mix-apply">Apply mix (H)</button>
    <button type="button" class="qed-button qed-button--secondary" id="wq-mix-reset">Reset</button>
    <div class="qed-demo__note">Mixes applied: <strong id="wq-mix-count">0</strong></div>
  </div>
  <div class="qed-error-demo__feedback" id="wq-mix-feedback" aria-live="polite"></div>
</div>

After one mix, the bit and the qubit are indistinguishable: both give `0` or `1` with equal probability. After the second mix, the bit remains 50/50 while the qubit returns to a certain outcome. The qubit's state contains more than its measurement probabilities. It contains amplitudes, and the second mix caused the unwanted ones to cancel.

Starting from `1` illustrates a further point. After one mix the odds are again 50/50, but the second amplitude is now negative. The two resulting states, \(|+\rangle\) (reached from `0`) and \(|-\rangle\) (reached from `1`), give identical odds to getting a `0` or `1`, but they are distinct states. We'll go into more detail about this in later modules.

!!! tip "Key idea"
    A superposition is not a coin we have not looked at yet. It is a state described by amplitudes that can add or cancel. Many quantum algorithms work by arranging this interference so that incorrect answers cancel and the correct one is reinforced.

<details class="qed-details" markdown="1">
<summary>Show the math: how the mix works</summary>

Each new amplitude is formed by adding or subtracting the old ones and dividing by \(\sqrt{2}\):

\[
a_0' = \frac{a_0 + a_1}{\sqrt{2}} \qquad a_1' = \frac{a_0 - a_1}{\sqrt{2}}
\]

Starting from \(|0\rangle\), the amplitudes are \((a_0, a_1) = (1, 0)\). One mix gives \((0.71, 0.71)\), the state \(|+\rangle\). A second mix gives

\[
a_1'' = \frac{0.71 - 0.71}{\sqrt{2}} = 0
\]

The two terms are equal and opposite, so they cancel exactly. Starting from \(|1\rangle\), the first mix gives \((0.71, -0.71)\), and the second mix cancels the \(|0\rangle\) amplitude instead.

</details>

## Measurement

Superposition describes a qubit's state, but the goal is to extract information from it. For this, we have to measure the qubit. Measuring a qubit does not reveal its amplitudes. Instead, it returns a single classical bit, `0` or `1`, according to three rules:

1. **One outcome.** Every measurement yields exactly one definite result.
2. **Probabilities from amplitudes.** The probability of each outcome is the square of its amplitude. This is known as the **Born rule**. Amplitudes of 0.71 and 0.71, for instance, give \(0.71^2 \approx 0.5\), so each outcome has a 50% chance.
3. **The state changes.** Afterward, the qubit is left in the state corresponding to the result it gave. This is commonly called **collapse**. Measuring it again gives the same result.

In terms of the angle \(\theta\) from the Bloch sphere, the probabilities are

\[
P(0) = \cos^2\left(\frac{\theta}{2}\right) \qquad P(1) = \sin^2\left(\frac{\theta}{2}\right)
\]

The demonstration below lets you prepare a qubit with the sliders and measure it. Measure it several times in a row and note what happens.

<div class="qed-demo" id="wq-measure">
  <div class="qed-demo__layout">
    <canvas id="wq-measure-canvas" width="260" height="260" role="img" aria-label="Bloch sphere showing the qubit before measurement."></canvas>
    <div class="qed-demo__controls">
      <label for="wq-measure-theta">θ — polar angle: <span id="wq-measure-theta-value"></span></label>
      <input type="range" id="wq-measure-theta" min="0" max="180" step="1" value="90">
      <label for="wq-measure-phi">φ — phase angle: <span id="wq-measure-phi-value"></span></label>
      <input type="range" id="wq-measure-phi" min="0" max="360" step="1" value="0">
      <div class="qed-demo__state"><div id="wq-measure-state"></div></div>
      <div style="margin-top:0.6rem;">
        <button type="button" class="qed-button" id="wq-measure-measure">Measure the qubit</button>
        <button type="button" class="qed-button qed-button--secondary" id="wq-measure-reprepare">Re-prepare qubit</button>
      </div>
    </div>
  </div>
  <div class="qed-error-demo__readout" id="wq-measure-history" aria-label="Measurement history"></div>
  <div class="qed-error-demo__feedback" id="wq-measure-status" aria-live="polite"></div>
  <p class="qed-demo__note" style="margin-top:1rem;">A single measurement says little about the probabilities. To estimate them, one needs many identically prepared qubits. This button prepares and measures 100 fresh qubits in sequence:</p>
  <button type="button" class="qed-button" id="wq-measure-shots">Run 100 shots</button>
  <button type="button" class="qed-button qed-button--secondary" id="wq-measure-clear">Clear tally</button>
  <div id="wq-measure-bars" style="margin-top:0.6rem;"></div>
  <p class="qed-demo__note" id="wq-measure-tally" aria-live="polite"></p>
</div>

Some things to try:

- Set θ to 0° or 180°. The outcome is certain, since the qubit is already `0` or `1` and the measurement simply reads it out.
- Set θ to 45° and run a few hundred shots. The fraction of zeros will be close to \(\cos^2(22.5^\circ) \approx 85\%\), but rarely exactly that. Statistical fluctuation of this kind is expected.
- Try differnt values for φ. The probabilities do not change, because a single measurement is unaffected to phase.

!!! note "Simplifications"
    The measurement shown here is idealized: it always reports the true result. Real hardware readout is imperfect, which is one reason error correction is necessary (see [Module 04](../04-hardware/index.md) and [Module 07](../07-error-correction/index.md)). The outcomes are also generated by a random-number generator using the probabilities that quantum mechanics predicts; they are not data from a quantum computer.

A measurement returns one bit regardless of how much structure the state had, and θ and φ cannot be read off directly. Quantum algorithms are therefore designed so that the correct answer appears with high probability when the final measurement is made.

## Entanglement

With one qubit, state and measurement are manageable. With two or more, something new can happen: the qubits can be **entangled**, meaning the pair has one shared state that cannot be split into a separate state for each qubit.

The standard example is a **Bell pair**. Send one qubit to Alice and the other to Bob is far away from her, and let each measure their own qubit. If the qubits are entangled in this way, two things remain true regardless of distance:

- Each person's results, taken alone, look random: about half `0` and half `1`.
- Their results always agree.

The demonstration below makes pairs in two ways, so you can compare them.

<div class="qed-demo" id="wq-bell">
  <div style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary" id="wq-bell-mode-classical" aria-pressed="false">Pre-agreed coins (classical)</button>
    <button type="button" class="qed-button qed-button--secondary" id="wq-bell-mode-quantum" aria-pressed="false">Entangled pair (quantum)</button>
  </div>
  <p class="qed-demo__note" id="wq-bell-caption" style="text-align:center;"></p>
  <div style="text-align:center;">
    <button type="button" class="qed-button" id="wq-bell-send">Send 10 pairs</button>
    <button type="button" class="qed-button qed-button--secondary" id="wq-bell-reset">Reset</button>
  </div>
  <table class="qed-results-table" aria-label="Results of the last 10 pairs">
    <thead><tr><th>Pair</th><th>Alice sees</th><th>Bob sees</th><th>Same?</th></tr></thead>
    <tbody id="wq-bell-body"></tbody>
  </table>
  <div class="qed-error-demo__feedback" id="wq-bell-tally" aria-live="polite"></div>
</div>

The two modes look the same, and that is the point. Agreement alone does not show entanglement, because a pair of coins matched in advance, or a left glove in one box and a right glove in the other, also agrees every time. The difference appears when Alice and Bob measure in *different directions*.

A qubit can be measured along any direction on the Bloch sphere, and the direction you choose is the question you ask. Below, Alice always measures straight on, and Bob turns his detector by an angle you choose.

<div class="qed-demo" id="wq-tilt">
  <div class="qed-demo__controls">
    <label for="wq-tilt-slider">Bob turns his detector by: <span id="wq-tilt-value"></span></label>
    <input type="range" id="wq-tilt-slider" min="0" max="180" step="1" value="60">
  </div>
  <div id="wq-tilt-bar" style="margin-top:0.6rem;"></div>
  <p class="qed-demo__note" id="wq-tilt-hint"></p>
  <button type="button" class="qed-button" id="wq-tilt-send">Send 20 pairs</button>
  <button type="button" class="qed-button qed-button--secondary" id="wq-tilt-reset">Clear</button>
  <div class="qed-error-demo__readout" id="wq-tilt-pairs" aria-label="Results of the last pairs"></div>
  <div class="qed-error-demo__feedback" id="wq-tilt-tally" aria-live="polite"></div>
</div>

As Bob turns his detector further from Alice’s, their results agree less often. They agree every time at 0°, half the time at a right angle (90°), and never at 180°. Quantum mechanics predicts this agreement rate for a Bell pair:

\[
P(\text{same result}) = \cos^2\left(\frac{\text{angle}}{2}\right)
\]

Coins matched in advance cannot reproduce this pattern for every choice of directions at once. In the 1960s John Bell turned that statement into a precise test, and experiments with entangled photons and other systems have run it many times. The results match the quantum prediction, and the work was recognized by the 2022 Nobel Prize in Physics.

!!! warning "Entanglement is not a communication channel"
    You might be thinking that information about the qubits is moving between them. This is not the case. Alice's measurement does not send anything to Bob. Bob's results, taken alone, are random no matter what Alice does. The correlation shows up only when the two compare notes, which takes ordinary communication. Entanglement cannot be used to send messages faster than light.

<details class="qed-details" markdown="1">
<summary>Optional challenge: a game that no pre-arranged plan can win</summary>

Here is a way to see the difference for yourself. A referee gives Alice and Bob each a secret number, `0` or `1`, chosen at random. They cannot talk. Each then answers `0` or `1`. They win if their answers are the **same**, except when both received a `1`, in which case they win only if their answers **differ**. Before the game, they may plan together and share as many random numbers as they like.

**Without entanglement.** The simplest plan is for both to always answer `0`. That wins whenever the answers should match, which is three of the four possible pairs of numbers, so **75%** of rounds. The argument below shows that no plan made in advance does better.

**With entanglement.** They share a Bell pair. Alice measures at 0° if she received `0` and at 90° if she received `1`. Bob measures at 45° if he received `0` and at −45° if he received `1`. Each answers with their result. The formula above then gives a win rate of about **85%**.

<div class="qed-demo" id="wq-chsh">
<div class="qed-chsh-row">
<div class="qed-chsh-row__head"><strong>Plan made in advance (no entanglement)</strong><button type="button" class="qed-button" id="wq-chsh-play-classical">Play 1,000 rounds</button></div>
<div class="qed-confidence-row">
<div class="qed-confidence-bar qed-confidence-bar--marked" role="img" aria-label="Plan made in advance (no entanglement) win rate"><div class="qed-confidence-bar__fill" id="wq-chsh-fill-classical" style="width:0%"></div><div class="qed-confidence-bar__marker" style="left:calc(75% - 1px)"></div></div>
<span class="qed-confidence-row__pct" id="wq-chsh-pct-classical" style="flex-basis:4.5rem;">—</span>
</div>
<div class="qed-demo__note" id="wq-chsh-text-classical">No rounds played yet.</div>
</div>
<div class="qed-chsh-row">
<div class="qed-chsh-row__head"><strong>Entangled pair</strong><button type="button" class="qed-button" id="wq-chsh-play-quantum">Play 1,000 rounds</button></div>
<div class="qed-confidence-row">
<div class="qed-confidence-bar qed-confidence-bar--marked" role="img" aria-label="Entangled pair win rate"><div class="qed-confidence-bar__fill qed-confidence-bar__fill--logical" id="wq-chsh-fill-quantum" style="width:0%"></div><div class="qed-confidence-bar__marker" style="left:calc(75% - 1px)"></div></div>
<span class="qed-confidence-row__pct" id="wq-chsh-pct-quantum" style="flex-basis:4.5rem;">—</span>
</div>
<div class="qed-demo__note" id="wq-chsh-text-quantum">No rounds played yet.</div>
</div>
<p class="qed-demo__note">The dark tick on each bar marks <strong>75%</strong>, the highest long-run average any plan made in advance can reach.</p>
<button type="button" class="qed-button qed-button--secondary" id="wq-chsh-reset">Reset both</button>
<div class="qed-error-demo__feedback" id="wq-chsh-feedback" aria-live="polite"></div>
</div>

Run both strategies a few times. The entangled pair settles above the 75% mark and the plan made in advance never does. This game is the simplest version of the **CHSH inequality**, one of the Bell tests mentioned above.

**Why 75% is the ceiling.** A plan fixes Alice's answer for each number she might receive, and Bob's likewise. Call them \(a_0, a_1\) and \(b_0, b_1\). Three of the four pairs of numbers, \((0,0)\), \((0,1)\) and \((1,0)\), require matching answers. Suppose a plan won all three. Then \(a_0 = b_0\), \(a_0 = b_1\) and \(a_1 = b_0\), which forces all four answers to be equal. But then on the pair \((1,1)\) they answer the same, and the game requires them to differ. So every plan loses at least one pair, and the best possible is 3 of 4. Shared random numbers only choose between plans, so they cannot beat the best one.

</details>

In symbols, the Bell pair is

\[
|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}
\]

The state is an equal mix of two possibilities: both qubits are 0, or both are 1. The cases where the qubits differ get no weight at all. Because you can’t write this state as one state for the first qubit plus one for the second, neither qubit has a state of its own. Only the pair does.

## What to carry forward

- A **qubit** is described by amplitudes; the Bloch sphere is one way to picture a single qubit's state.
- **Superposition** means amplitudes that can add or cancel (interference), not a hidden `0` or `1`.
- **Measurement** returns one classical bit with probability given by the amplitude squared, and leaves the qubit in the state it reported.
- **Entanglement** produces correlations between qubits that answers fixed in advance cannot reproduce, and it cannot be used to send messages.

Superposition, interference, and entanglement are the raw ingredients of quantum algorithms, but none of them alone guarantees a speedup; the skill lies in arranging them so that useful answers emerge. With this vocabulary in place,the next section, [Quantum Computing Today](quantum-computing-today.md), looks at what current hardware can do with these ideas.

<script>
document.addEventListener("DOMContentLoaded", function () {
  var B = window.QedBloch;
  var Q = window.QedQubit;
  var G = window.QedGates;
  var S = window.QedShots;
  var N = window.QedNumbers;
  var EPS = 1e-9;
  var SEED = 2027; // each demo draws from its own seeded stream, so its first run is the same on every load

  function $(id) { return document.getElementById(id); }
  function intValue(id) { return parseInt($(id).value, 10); }
  function pressed(id, on) {
    $(id).classList.toggle("qed-button--active", on);
    $(id).setAttribute("aria-pressed", on ? "true" : "false");
  }
  function preset(id) { return Q.PRESETS.filter(function (p) { return p.id === id; })[0]; }
  // Alice and Bob agree with probability cos^2((alpha - beta) / 2) for a Bell pair
  // measured along directions alpha and beta (degrees). Shared by two demos below.
  function pSame(alphaDeg, betaDeg) {
    var d = ((alphaDeg - betaDeg) * Math.PI) / 180;
    return Math.pow(Math.cos(d / 2), 2);
  }

  // ---- Qubits: the Bloch explorer -------------------------------------------------
  (function () {
    var canvas = $("wq-bloch-canvas");
    function update() {
      var theta = intValue("wq-bloch-theta");
      var phi = intValue("wq-bloch-phi");
      var s = B.state(theta, phi);
      $("wq-bloch-theta-value").textContent = theta + "°";
      $("wq-bloch-phi-value").textContent = phi + "°";
      $("wq-bloch-formula").innerHTML = B.formatHTML(theta, phi);
      $("wq-bloch-p0").textContent = N.pct(s.p0, 1);
      $("wq-bloch-p1").textContent = N.pct(s.p1, 1);
      canvas.setAttribute("aria-label", "Bloch sphere. " + B.formatText(theta, phi));
      B.render(canvas, theta, phi);
    }
    $("wq-bloch-theta").addEventListener("input", update);
    $("wq-bloch-phi").addEventListener("input", update);
    update();
  })();

  // ---- Superposition: the same mix for a random bit and a qubit --------------------
  (function () {
    var H = G.gate("h");
    var start = 0;
    var n = 0;
    var state = preset("zero").state;
    var prob = [1, 0];

    // Real amplitudes only (enough for H on |0> and |1>), with float dust snapped away.
    function clean(x) {
      if (Math.abs(x) < EPS) return 0;
      if (Math.abs(x - 1) < EPS) return 1;
      if (Math.abs(x + 1) < EPS) return -1;
      return x;
    }
    function amps() { return [clean(state.alpha.re), clean(state.beta.re)]; }
    function stateName() {
      var named = Q.nameOf(state);
      return named ? named.name : "|ψ⟩";
    }
    // Signed amplitude row: the bar extends right for +, left (hatched) for −, and the
    // sign is also written in text, so it never relies on color.
    function ampRow(label, a) {
      var width = Math.min(Math.abs(a), 1) * 50;
      return '<div class="qed-amp-row"><span class="qed-amp-row__label">' + label + "</span>" +
        '<div class="qed-amp-bar"><div class="qed-amp-bar__fill' + (a < 0 ? " qed-amp-bar__fill--neg" : "") + '" style="width:' + width + '%"></div></div>' +
        '<span class="qed-amp-row__val">' + N.signed(a) + "</span></div>";
    }
    function bars(p, accent) {
      return S.renderBars([
        { label: "P(0)", fraction: p[0], text: N.pct(p[0]), accent: accent, labelWidth: "2.6rem" },
        { label: "P(1)", fraction: p[1], text: N.pct(p[1]), accent: accent, labelWidth: "2.6rem" }
      ]);
    }
    function message() {
      var a = amps();
      var qp0 = a[0] * a[0];
      var certain = qp0 > 1 - EPS || qp0 < EPS;
      if (n === 0) return "Both start as a definite " + start + ". Press <strong>Apply mix</strong> to begin.";
      if (!certain) {
        if (start === 0) {
          return "Both are now 50/50, and at this point the qubit cannot be told apart from the coin. This is why a qubit is often mistaken for a hidden coin. Apply the mix once more.";
        }
        return "Both are again 50/50, but the qubit's amplitude for |1⟩ is now negative (the hatched bar). This is a different state from the one reached by starting at 0, even though the odds are the same. Apply the mix again to see why the difference matters.";
      }
      return "<strong>Classical bit:</strong> still 50/50. Mixing a random bit yields another random bit. <strong>Qubit:</strong> back to a certain " +
        (qp0 > 0.5 ? 0 : 1) + ". The two contributions to the other outcome had opposite signs and cancelled. This is interference, which a hidden coin cannot reproduce.";
    }
    function render() {
      var a = amps();
      $("wq-mix-count").textContent = n;
      $("wq-mix-c-state").textContent = n === 0 ? "definitely " + start : "a fair coin flip";
      $("wq-mix-c-bars").innerHTML = bars(prob, undefined);
      $("wq-mix-q-state").textContent = "|ψ⟩ = " + stateName();
      $("wq-mix-q-amps").innerHTML = ampRow("amp. of |0⟩", a[0]) + ampRow("amp. of |1⟩", a[1]);
      $("wq-mix-q-bars").innerHTML = bars([a[0] * a[0], a[1] * a[1]], "quantum");
      $("wq-mix-feedback").innerHTML = message();
    }
    function setStart(v) {
      start = v;
      n = 0;
      state = preset(v === 0 ? "zero" : "one").state;
      prob = v === 0 ? [1, 0] : [0, 1];
      pressed("wq-mix-start-0", v === 0);
      pressed("wq-mix-start-1", v === 1);
      render();
    }
    $("wq-mix-apply").addEventListener("click", function () {
      state = G.apply(H, state);
      prob = [0.5, 0.5];
      n++;
      render();
    });
    $("wq-mix-reset").addEventListener("click", function () { setStart(start); });
    $("wq-mix-start-0").addEventListener("click", function () { setStart(0); });
    $("wq-mix-start-1").addEventListener("click", function () { setStart(1); });
    setStart(0);
  })();

  // ---- Measurement: prepare, measure, repeat ---------------------------------------
  (function () {
    var canvas = $("wq-measure-canvas");
    var shotsPerRun = 100;
    var random = S.rng(SEED + 3);
    var theta = intValue("wq-measure-theta");
    var phi = intValue("wq-measure-phi");
    var collapsed = null; // null = prepared, not yet measured; else 0 or 1
    var history = [];
    var counts = [0, 0];
    var INITIAL = "Press <strong>Measure the qubit</strong> to obtain one outcome.";

    function drawState() {
      var s = B.state(theta, phi);
      if (collapsed === null) {
        B.render(canvas, theta, phi);
        $("wq-measure-state").innerHTML = B.formatHTML(theta, phi) + "<br>P(0) = " + N.pct(s.p0, 1) + " &nbsp; P(1) = " + N.pct(s.p1, 1);
        canvas.setAttribute("aria-label", "Bloch sphere, qubit not yet measured. " + B.formatText(theta, phi));
      } else {
        B.render(canvas, collapsed === 0 ? 0 : 180, 0);
        $("wq-measure-state").innerHTML = "|ψ⟩ = |" + collapsed + "⟩ &nbsp;(after measurement)";
        canvas.setAttribute("aria-label", "Bloch sphere. After measuring " + collapsed + ", the qubit is in the state " + collapsed + ".");
      }
    }
    function drawHistory() {
      $("wq-measure-history").innerHTML = history.slice(-14).map(function (h) {
        return h === "new"
          ? '<span class="qed-pill qed-pill--neutral">↺ new qubit</span>'
          : '<span class="qed-pill"><span class="qed-pill__label">got</span>' + h + "</span>";
      }).join("");
    }
    function drawBars() {
      var total = counts[0] + counts[1];
      var s = B.state(theta, phi);
      var expected = [s.p0, s.p1];
      $("wq-measure-bars").innerHTML = S.renderBars([0, 1].map(function (i) {
        var share = total ? counts[i] / total : 0;
        return {
          label: "measured |" + i + "⟩", fraction: share, accent: "quantum", marker: expected[i],
          labelWidth: "6.5rem", textWidth: "7rem", text: counts[i] + " (" + N.pct(share, 1) + ")"
        };
      }));
      $("wq-measure-tally").textContent = total
        ? total + " shots so far. The dark tick on each bar marks the predicted probability; further runs bring the bars closer to it."
        : "No shots yet. After a run, a dark tick on each bar will mark the predicted probability.";
    }
    function redraw() { drawState(); drawHistory(); drawBars(); }
    function onSlider() {
      theta = intValue("wq-measure-theta");
      phi = intValue("wq-measure-phi");
      $("wq-measure-theta-value").textContent = theta + "°";
      $("wq-measure-phi-value").textContent = phi + "°";
      collapsed = null;
      history = [];
      counts = [0, 0];
      $("wq-measure-status").innerHTML = INITIAL;
      redraw();
    }

    $("wq-measure-measure").addEventListener("click", function () {
      var s = B.state(theta, phi);
      if (collapsed === null) {
        collapsed = random() < s.p0 ? 0 : 1;
        history.push(collapsed);
        $("wq-measure-status").innerHTML = "Outcome: <strong>" + collapsed + "</strong>. The qubit is now in the state |" + collapsed + "⟩, and the arrow has moved to the corresponding pole. Measure again.";
      } else {
        history.push(collapsed);
        $("wq-measure-status").innerHTML = "Outcome: <strong>" + collapsed + "</strong> again. After a measurement the qubit remains in the measured state, so repeated measurements agree. Press <strong>Re-prepare qubit</strong> to start with a fresh qubit.";
      }
      redraw();
    });
    $("wq-measure-reprepare").addEventListener("click", function () {
      collapsed = null;
      history.push("new");
      $("wq-measure-status").innerHTML = "A fresh qubit, prepared in the state set by the sliders. This measurement may give a different result.";
      redraw();
    });
    $("wq-measure-shots").addEventListener("click", function () {
      var s = B.state(theta, phi);
      var run = S.sample([s.p0, s.p1], shotsPerRun, random);
      counts[0] += run.counts[0];
      counts[1] += run.counts[1];
      drawBars();
    });
    $("wq-measure-clear").addEventListener("click", function () { counts = [0, 0]; drawBars(); });
    $("wq-measure-theta").addEventListener("input", onSlider);
    $("wq-measure-phi").addEventListener("input", onSlider);
    onSlider();
  })();

  // ---- Entanglement: a Bell pair against coins matched in advance --------------------
  (function () {
    var perClick = 10;
    var random = S.rng(SEED + 4);
    var CAPTIONS = {
      classical: "Each pair is prepared with a matching hidden label, like one glove placed in each of two boxes. The results agree because they were set up to agree.",
      quantum: "Each pair is an entangled Bell pair. Alice and Bob each measure their own qubit; neither qubit had a definite value beforehand."
    };
    var pairs = 0, matches = 0, aliceZeros = 0;

    function reset() {
      pairs = matches = aliceZeros = 0;
      $("wq-bell-body").innerHTML = "";
      $("wq-bell-tally").innerHTML = "Press <strong>Send " + perClick + " pairs</strong>.";
    }
    function setMode(m) {
      pressed("wq-bell-mode-classical", m === "classical");
      pressed("wq-bell-mode-quantum", m === "quantum");
      $("wq-bell-caption").textContent = CAPTIONS[m];
      reset();
    }
    $("wq-bell-send").addEventListener("click", function () {
      var rows = "";
      for (var i = 0; i < perClick; i++) {
        // Same question on both sides: each result is a fair coin and the two always
        // agree, in both the classical and the quantum model.
        var a = random() < 0.5 ? 0 : 1;
        var b = a;
        pairs++;
        if (a === b) matches++;
        if (a === 0) aliceZeros++;
        rows += "<tr><td>" + (i + 1) + "</td><td>" + a + "</td><td>" + b + "</td><td>" + (a === b ? "✓" : "✗") + "</td></tr>";
      }
      $("wq-bell-body").innerHTML = rows;
      $("wq-bell-tally").innerHTML =
        "<strong>" + pairs + "</strong> pairs so far. Same result: <strong>" + matches + " of " + pairs + "</strong>. " +
        "Alice saw <code>0</code> in <strong>" + ((aliceZeros / pairs) * 100).toFixed(0) + "%</strong> of them: individually random, yet always matching Bob.";
    });
    $("wq-bell-reset").addEventListener("click", reset);
    $("wq-bell-mode-classical").addEventListener("click", function () { setMode("classical"); });
    $("wq-bell-mode-quantum").addEventListener("click", function () { setMode("quantum"); });
    setMode("classical");
  })();

  // ---- Entanglement: turning Bob's detector -------------------------------------------
  (function () {
    var perClick = 20;
    var random = S.rng(SEED + 5);
    var tilt = intValue("wq-tilt-slider");
    var total = 0, same = 0;

    function hintFor(t) {
      if (t === 0) return "Same direction: the results agree every time.";
      if (t === 180) return "Opposite directions: the results disagree every time.";
      if (t === 90) return "A right angle: Bob's result tells Alice nothing, so they agree half the time.";
      return t < 90 ? "A small turn: they still agree most of the time." : "A large turn: they mostly disagree.";
    }
    function drawBar() {
      var p = pSame(0, tilt);
      $("wq-tilt-value").textContent = tilt + "°";
      $("wq-tilt-bar").innerHTML = S.renderBars([{ label: "Agree", fraction: p, text: N.pct(p, 0), accent: "quantum", labelWidth: "4rem", textWidth: "4.5rem" }]);
      $("wq-tilt-hint").textContent = hintFor(tilt);
    }
    function clear() {
      total = same = 0;
      $("wq-tilt-pairs").innerHTML = "";
      $("wq-tilt-tally").innerHTML = "Press <strong>Send " + perClick + " pairs</strong>.";
    }
    $("wq-tilt-slider").addEventListener("input", function () {
      tilt = intValue("wq-tilt-slider");
      drawBar();
      clear();
    });
    $("wq-tilt-send").addEventListener("click", function () {
      var p = pSame(0, tilt);
      var html = "";
      for (var i = 0; i < perClick; i++) {
        var a = random() < 0.5 ? 0 : 1;
        var b = random() < p ? a : 1 - a;
        total++;
        if (a === b) same++;
        html += '<span class="qed-pill ' + (a === b ? "" : "qed-pill--neutral") + '"><span class="qed-pill__label">' +
          (a === b ? "✓" : "✗") + "</span>" + a + " " + b + "</span>";
      }
      $("wq-tilt-pairs").innerHTML = html;
      $("wq-tilt-tally").innerHTML =
        "<strong>" + same + " of " + total + "</strong> pairs agreed so far (" + N.pct(same / total, 0) +
        "). The prediction is " + N.pct(p, 0) + ". Each pair above shows Alice's result, then Bob's.";
    });
    $("wq-tilt-reset").addEventListener("click", clear);
    drawBar();
    clear();
  })();

  // ---- Entanglement: the optional CHSH game -------------------------------------------
  (function () {
    var rounds = 1000;
    var random = S.rng(SEED + 6);
    var ALICE_TILT = [0, 90]; // degrees, indexed by Alice's number x
    var BOB_TILT = [45, -45]; // degrees, indexed by Bob's number y
    var tally;

    function bit() { return random() < 0.5 ? 0 : 1; }
    function playRound(kind) {
      var x = bit(), y = bit(), a, b;
      if (kind === "classical") {
        var r = bit(); // the shared random bit; both answer it
        a = r;
        b = r;
      } else {
        a = bit();
        b = random() < pSame(ALICE_TILT[x], BOB_TILT[y]) ? a : 1 - a;
      }
      return (a ^ b) === (x & y);
    }
    function fresh() { return { classical: { rounds: 0, wins: 0 }, quantum: { rounds: 0, wins: 0 } }; }
    function show(kind) {
      var s = tally[kind];
      var rate = s.rounds ? s.wins / s.rounds : 0;
      $("wq-chsh-fill-" + kind).style.width = rate * 100 + "%";
      $("wq-chsh-pct-" + kind).textContent = s.rounds ? (rate * 100).toFixed(1) + "%" : "—";
      $("wq-chsh-text-" + kind).textContent = s.rounds ? s.wins + " wins in " + s.rounds + " rounds" : "No rounds played yet.";
    }
    function summary() {
      var c = tally.classical, q = tally.quantum;
      if (!c.rounds || !q.rounds) {
        $("wq-chsh-feedback").innerHTML = "Play each strategy a few times and compare the bars.";
        return;
      }
      $("wq-chsh-feedback").innerHTML =
        "Classical: <strong>" + ((c.wins / c.rounds) * 100).toFixed(1) + "%</strong> · Entangled: <strong>" + ((q.wins / q.rounds) * 100).toFixed(1) + "%</strong>. " +
        "Individual runs fluctuate, but the 75% limit applies to the long-run average. The entangled pair stays above it, which no plan made in advance can do.";
    }
    function play(kind) {
      var s = tally[kind];
      for (var i = 0; i < rounds; i++) {
        s.rounds++;
        if (playRound(kind)) s.wins++;
      }
      show(kind);
      summary();
    }
    $("wq-chsh-play-classical").addEventListener("click", function () { play("classical"); });
    $("wq-chsh-play-quantum").addEventListener("click", function () { play("quantum"); });
    $("wq-chsh-reset").addEventListener("click", function () {
      tally = fresh();
      show("classical");
      show("quantum");
      summary();
    });
    tally = fresh();
    summary();
  })();
});
</script>
