# Measurement

A measurement turns a state into an ordinary result. It gives one outcome, drawn from the state's probabilities, and afterwards the state matches it.

## From Probabilities to Results

On the [previous page](quantum-circuits.md), the Bell circuit ended in two meters. The trace showed what a measurement there would give, as probabilities. It did not show a result.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Before</span><span>The circuit ends in meters, and the trace shows probabilities</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Now</span><span>What does a meter actually return?</span></div>
  </div>
</div>

> **What does a measurement give, and what happens to the state afterwards?**

You have seen measurements before. The [first page of this module](quantum-states.md) drew outcomes from a prepared state, and [Module 01](../01-foundations/what-is-quantum-computing.md) repeated trials and played the CHSH game. This page adds four things: predicted results set beside sampled ones, what a measurement does to the state, a phase made visible by an H, and a pair of qubits measured together.

A **[measurement](../glossary.md#measurement)** in the **[computational basis](../glossary.md#computational-basis)** means: read the qubit as 0 or 1. It is the step that turns a state into an ordinary result. It is not another gate.

## One Measurement: A Result, Then an Update

### A result

The probability of each outcome is the square of its amplitude. With real amplitudes, that is the number times itself:

<div class="qed-demo" id="ms-amps"></div>

One measurement returns **one** outcome, with those chances. Keep three things apart, as on the first page:

- **State** — what the preparation produced.
- **Probability** — how likely each outcome is, set by the state.
- **Outcome** — what one measurement returned.

!!! question "Can one measurement tell you the state?"
    No. It gives one result, and many different states could have given it.

### An update

In the ideal model, a measurement does something to the state as well. After it, **the state matches the outcome that was seen**. If a qubit gave 1, it is now in |1⟩, so measuring it again gives 1 again, every time.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The state sets the probabilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>One measurement draws one result</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The state now matches that result</span></div>
</div>

This is the rule of the ideal textbook model. It is not a description of how a particular device works.

!!! question "Is a measurement a gate?"
    No. A gate moves a state and can be undone, as on the [gates page](quantum-gates.md). A measurement gives a result, and no later gate undoes it.

## Many Shots

A **[shot](../glossary.md#shot)** is one prepare-and-measure. To see the probabilities, prepare the same state again and again and count the results.

A probability describes the **state**. A frequency describes **one finite run**. The counts of a run rarely match the prediction exactly, and a larger number of shots tends to look closer to it. A gap between the counts and the prediction is not an error.

One shot cannot reveal the amplitudes. A single 1 is what a 50% state gives half the time, and it is also what a 75% state gives three times in four.

> **How many shots would you need to tell a 50% state from a 55% state?**

Try it in the lab below.

## Measurement Lab

Choose a state, predict what a measurement will show, and then measure it once or many times. Every result is **simulated**: ideal and noiseless, not from a real device.

<div class="qed-demo qed-ml" id="ml-lab">
  <p class="qed-demo__step"><strong>1. Choose what to measure</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="What to measure" id="ml-mode">
    <button type="button" class="qed-button qed-button--secondary" data-mode="one" aria-pressed="false">One qubit</button>
    <button type="button" class="qed-button qed-button--secondary" data-mode="pair" aria-pressed="false">A Bell pair</button>
  </div>
  <div id="ml-sourcebox">
    <p class="qed-editor__amp-title"><strong>q₀ starts in |0⟩, then is prepared by</strong></p>
    <div class="qed-demo__controls" role="group" aria-label="How the state is prepared" id="ml-sources"></div>
  </div>
  <div id="ml-addhbox">
    <div class="qed-demo__controls">
      <button type="button" class="qed-button qed-button--secondary" id="ml-addh" aria-pressed="false">Add an H before measuring</button>
    </div>
  </div>
  <div id="ml-basisbox" hidden>
    <p class="qed-editor__amp-title"><strong>Measure in the</strong></p>
    <div class="qed-demo__controls" role="group" aria-label="Measurement basis" id="ml-basis"></div>
  </div>
  <div id="ml-pairbox" hidden>
    <p class="qed-editor__amp-title"><strong>The Bell circuit: H on q₀, then CNOT, then both measured. Measure first:</strong></p>
    <div class="qed-demo__controls" role="group" aria-label="Which qubit to measure first" id="ml-first">
      <button type="button" class="qed-button qed-button--secondary" data-first="0" aria-pressed="false">q₀</button>
      <button type="button" class="qed-button qed-button--secondary" data-first="1" aria-pressed="false">q₁</button>
    </div>
  </div>
  <p class="qed-editor__validity is-valid" id="ml-message" hidden></p>

  <p class="qed-demo__step"><strong>2. The circuit</strong></p>
  <div id="ml-drawing"></div>
  <p class="qed-editor__details" id="ml-summary"></p>

  <p class="qed-demo__step"><strong>3. Predict, then measure</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Number of shots" id="ml-shotbtns">
    <button type="button" class="qed-button qed-button--secondary" data-shots="1" aria-pressed="false">1 shot</button>
    <button type="button" class="qed-button qed-button--secondary" data-shots="10" aria-pressed="false">10 shots</button>
    <button type="button" class="qed-button qed-button--secondary" data-shots="100" aria-pressed="false">100 shots</button>
    <button type="button" class="qed-button qed-button--secondary" data-shots="1000" aria-pressed="false">1000 shots</button>
  </div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="ml-measure">Measure</button>
    <button type="button" class="qed-button qed-button--secondary" id="ml-reset">Reset</button>
  </div>
  <div class="qed-ml__groups">
    <div class="qed-ml__group qed-ml__group--predicted" id="ml-predicted"></div>
    <div class="qed-ml__group qed-ml__group--sampled" id="ml-sampled"></div>
  </div>
  <p class="qed-editor__details" id="ml-expect" hidden></p>

  <div id="ml-stepbox">
    <p class="qed-demo__step"><strong>4. Measure once, step by step</strong></p>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button" id="ml-once">Measure once</button>
      <button type="button" class="qed-button qed-button--secondary" id="ml-again" disabled>Measure the same qubit again</button>
    </div>
    <div id="ml-stepper"></div>
  </div>

  <div id="ml-spreadbox" hidden>
    <p class="qed-demo__step"><strong>The spread of the shots</strong> (Intermediate)</p>
    <p class="qed-editor__details">Repeat the whole experiment 50 times with the same number of shots, and see how far the frequency of the first outcome moves around the prediction. Do it for several shot counts.</p>
    <div class="qed-demo__controls">
      <label for="ml-spreadn" class="qed-sr-only">Shots in each experiment</label>
      <select id="ml-spreadn" class="qed-ml__select">
        <option value="10">10 shots each</option>
        <option value="100" selected>100 shots each</option>
        <option value="1000">1000 shots each</option>
        <option value="10000">10000 shots each</option>
      </select>
      <button type="button" class="qed-button qed-button--secondary" id="ml-spreadgo">Repeat 50 times</button>
    </div>
    <div id="ml-spread"></div>
  </div>

  <div id="ml-mysterybox">
    <p class="qed-demo__step"><strong>5. Mystery state</strong> (a challenge)</p>
    <div class="qed-demo__controls">
      <button type="button" class="qed-button qed-button--secondary" id="ml-mstart">Start the mystery</button>
      <button type="button" class="qed-button qed-button--secondary" id="ml-mleave" hidden>Leave the mystery</button>
    </div>
    <div id="ml-mpanel" hidden>
      <p class="qed-editor__details" id="ml-mquestion"></p>
      <p class="qed-editor__details" id="ml-mcounts"></p>
      <div class="qed-demo__controls" role="group" aria-label="Your guess" id="ml-mchoices"></div>
      <p class="qed-quiz__feedback" id="ml-mfeedback" aria-live="polite"></p>
      <div class="qed-demo__controls">
        <button type="button" class="qed-button" id="ml-mnext" hidden>Next round</button>
      </div>
    </div>
  </div>

  <div class="qed-sr-only" id="ml-live" role="status" aria-live="polite"></div>
</div>

The prediction, the sampled counts, and the single outcomes each sit in their own place. The predicted bars describe the state. The sampled bars describe the run you just did.

Check your understanding. First, the update:

<div class="qed-demo" id="ms-quiz-again"></div>

Then predict a run:

<div class="qed-demo" id="ms-quiz-run"></div>

## Phase Shows Up After an H

Two states can look the same to one measurement and different to another.

**A direct Z-basis measurement**
:   |+⟩ and |−⟩ both give 50% and 50%, so it cannot tell them apart.

**A Z-basis measurement after an H**
:   H turns |+⟩ into a certain 0 and |−⟩ into a certain 1.

Predict each row before reading the numbers:

<div class="qed-demo" id="ms-phase"></div>

A phase difference is invisible to a direct Z-basis measurement, and an H turns it into a probability difference. This is the idea from [Z and the hidden phase](quantum-gates.md#z-and-the-hidden-phase), now seen through measurement. The reason is **[interference](../glossary.md#quantum-interference)**: the two paths through H add for |+⟩ and cancel for |−⟩.

So the same counts do not mean the same state. In the lab, choose **H, then Z (|−⟩)** and **H (|+⟩)**, measure each directly, and then add an H.

## A Pair of Measurements

Switch the lab to **A Bell pair** and measure it. You should see:

- The joint counts appear only at **00** and **11**.
- Each qubit on its own looks like a **fair coin**.
- Measure one qubit, and the other result is then **certain**, and equal to the first.

The order of the two measurements does not change the statistics. Here are the exact joint probabilities for the [Bell state](../glossary.md#bell-state) measured in either order:

<div class="qed-demo" id="ms-order"></div>

This is about what the two lists of results look like side by side. The agreement shows up when the lists are **compared**. Neither measurement sends anything to the other, so the result at one end is a fair coin whatever happens at the other end, and nobody can use the pair to send a message. Whether you call the pair [entangled](../glossary.md#entanglement) is a statement about the state, not about a signal.

This page does not explain how the correlation arises, and it does not say the results were decided in advance. The ideal model gives the probabilities, and that is all it claims.

In this module, q₀ is the left digit of a result such as 01. Other tools may print the bits the other way round. The Bell outcomes 00 and 11 look the same either way.

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### The Born rule and projection

At this level, amplitudes can be complex. A state \(\alpha|0\rangle + \beta|1\rangle\) gives

\[ P(0) = |\alpha|^2,\qquad P(1) = |\beta|^2,\qquad |\alpha|^2 + |\beta|^2 = 1, \]

the **Born rule**. The squares are of the **modulus**, so a phase does not change them: \(|+i\rangle = (|0\rangle + i|1\rangle)/\sqrt 2\) gives \(|i/\sqrt 2|^2 = 1/2\), the same 50% as \(|+\rangle\).

**Measurement as projection.** Measuring 0 applies the projector \(P_0 = |0\rangle\langle 0|\), which keeps the amplitude on \(|0\rangle\) and removes the rest. The state after is the projected state divided by \(\sqrt p\), where \(p\) is the probability of the outcome, so that it is normalized again:

\[ |\psi\rangle \;\to\; \frac{P_0|\psi\rangle}{\sqrt{P(0)}}. \]

For the mostly-0 state \(0.866|0\rangle + 0.5|1\rangle\), the outcome 0 has \(p = 0.75\). Then \(P_0|\psi\rangle = 0.866|0\rangle\), and dividing by \(\sqrt{0.75} = 0.866\) gives \(|0\rangle\), as the lab's stepper shows.

**Expectation values.** Score the outcome 0 as +1 and the outcome 1 as −1. The average score over many shots is the expectation value

\[ \langle Z\rangle = P(0) - P(1). \]

It is 0.5 for the mostly-0 state and 0 for \(|+\rangle\). For the Bell pair, scoring a result +1 when the two digits agree and −1 when they differ gives \(\langle Z\otimes Z\rangle = 1\), the agreement as a single number. The lab shows the predicted value and the value estimated from your shots.

</div>

<div class="qed-level" data-min-level="intermediate" markdown="1">

### Other bases and the spread of shots

**Measuring in the X or Y basis.** A Z-basis measurement is the only readout, so another basis is read by adding gates before it. For X, add an H. For Y, add S† and then H. The lab's basis selector draws these gates in the circuit. The outcome 0 then means the first state of the basis, \(|+\rangle\) for X and \(|+i\rangle\) for Y, and 1 means the second.

\[ |+\rangle \xrightarrow{H} |0\rangle,\qquad |-\rangle \xrightarrow{H} |1\rangle,\qquad |+i\rangle \xrightarrow{S^\dagger} |+\rangle \xrightarrow{H} |0\rangle. \]

This is the same idea as "add an H before measuring" above: a Z-basis measurement after an H is an X-basis measurement.

**How much the shots vary.** With probability \(p\) for an outcome and \(N\) shots, the sampled frequency varies from run to run by about

\[ \sqrt{\frac{p(1-p)}{N}}. \]

For \(p = 0.5\), that is 5% at \(N = 100\) and 0.5% at \(N = 10000\). A hundred times more shots makes the spread ten times smaller, which is the \(1/\sqrt N\) rule. The lab's spread view repeats the experiment 50 times at the shot count you choose, so you can watch the band narrow.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Naming the formalism

Measuring in an arbitrary direction on the Bloch sphere is a **general measurement basis**. Measurements that are not projections onto a basis at all are **generalized measurements**, described by sets of operators called POVMs. And a **[mid-circuit measurement](../glossary.md#mid-circuit-measurement)**, taken partway through a circuit with later operations depending on the result, is the tool behind error correction and many algorithms. Later material makes these ideas precise.

</div>

## From Measurement to Programming

That is the end of Module 02. Here is the path it took:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span><a href="quantum-states.md">State</a>: what a preparation produces</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span><a href="qubit-representation.md">Numbers</a>: amplitudes and probabilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span><a href="bloch-sphere.md">Picture</a>: the Bloch sphere</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span><a href="quantum-gates.md">Gates</a>: moves on the state</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span><a href="multi-qubit-systems.md">Pairs</a>: joint outcomes and entanglement</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span><a href="quantum-circuits.md">Circuits</a>: steps on wires</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span>Measurement: one result, and an update</span></div>
</div>

Everything on this page was an ideal, noiseless model. Real devices have imperfect [readout](../glossary.md#readout-error), noise, and calibration, which [Module 04](../04-hardware/index.md) and [Module 05](../05-software-stack/understanding-the-quantum-software-stack.md) cover. Measurements that check for errors are the subject of [Module 07](../07-error-correction/index.md).

One more caution. This module writes q₀ on the left. Tools such as Qiskit may print the bits the other way round, so `01` in their output can mean the opposite qubit. Module 03 will address that when it shows code.

We can now describe, trace, and measure circuits on paper and in a simulator. We have not yet written one as code, or run one.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A state gives probabilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A measurement gives one result, and the state matches it</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Many shots show the distribution</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>An H can make a hidden phase visible, and a pair agrees without a message</span></div>
</div>

A measurement gives one result, drawn from the state's probabilities, and afterwards the state matches the result. Only many shots show the probabilities, and a direct measurement cannot see a phase that an H can reveal.

> **How do we write these circuits and run them?**

**Next: [Quantum Programming (Module 03) →](../03-programming/index.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedQubit;
  var G = window.QedGates;
  var T = window.QedTwoQubit;
  var S = window.QedShots;
  var QL = window.QedLevel;
  var Z = window.QedQuiz;
  var C = window.QedCircuit;
  var R = window.QedTrace;
  var EPS = 1e-9;
  var SEED = 2027; // every run starts from the same stream, so the page looks the same on each load
  var MAXCOL = 7;
  var LABELS4 = S.defaultLabels(4); // ["00", "01", "10", "11"]

  function $(id) { return document.getElementById(id); }
  function pct(p) { return Math.round(p * 1000) / 10; }
  function num(x, digits) {
    var t = Math.abs(x).toFixed(digits === undefined ? 2 : digits).replace(/\.?0+$/, "");
    return (x < 0 && t !== "0" && t !== "" ? "−" : "") + (t === "" ? "0" : t);
  }
  function cell(z, digits) {
    if (Math.abs(z.im) < EPS) return num(z.re, digits);
    var im = Math.abs(z.im);
    var imText = Math.abs(im - 1) < 1e-6 ? "i" : num(im, digits) + "i";
    if (Math.abs(z.re) < EPS) return (z.im < 0 ? "−" : "") + imText;
    return num(z.re, digits) + (z.im < 0 ? " − " : " + ") + imText;
  }
  // "0.707² ≈ 0.5": an amplitude squared, with = only when the digits shown give the
  // exact probability, and the modulus squared for a complex amplitude.
  function squareText(z) {
    var p = z.re * z.re + z.im * z.im;
    var ra = Math.round(z.re * 1000) / 1000;
    var rb = Math.round(z.im * 1000) / 1000;
    var sign = Math.abs(ra * ra + rb * rb - p) < 1e-9 ? "= " : "≈ ";
    if (Math.abs(z.im) < EPS) return (ra < 0 ? "(" + num(z.re, 3) + ")" : num(z.re, 3)) + "² " + sign + num(p);
    return "|" + cell(z, 3) + "|² " + sign + num(p);
  }
  function qn(i) { return C.qubitName(i); }
  function shotWord(n) { return n === 1 ? "1 shot" : n + " shots"; }
  function andJoin(list) {
    return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + " and " + list[list.length - 1];
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function preset(id) { return Q.PRESETS.filter(function (p) { return p.id === id; })[0]; }

  // ---- circuits, as plain data ---------------------------------------------------------
  function gateOp(id, wire, col, angle) {
    if (id === "sdg") {
      var d = G.inverse(G.gate("s"));
      return { type: "gate", gateId: "sdg", label: d.label, name: d.name, targets: [wire], col: col };
    }
    if (angle !== undefined) {
      var r = G.rotation(id.charAt(1), angle);
      return { type: "gate", gateId: id, label: r.label, name: r.name, targets: [wire], col: col, angleDeg: angle };
    }
    var g = G.gate(id);
    return { type: "gate", gateId: id, label: g.label, name: g.name, targets: [wire], col: col };
  }

  // Each source is the short circuit that prepares it from |0>.
  var SOURCES = [
    { id: "zero", text: "Nothing (|0⟩)", prep: [], name: "|0⟩" },
    { id: "one", text: "X (|1⟩)", prep: [["x"]], name: "|1⟩" },
    { id: "plus", text: "H (|+⟩)", prep: [["h"]], name: "|+⟩" },
    { id: "minus", text: "H, then Z (|−⟩)", prep: [["h"], ["z"]], name: "|−⟩" },
    { id: "tilt", text: "Rotate 60° about y (mostly 0)", prep: [["ry", 60]], name: "the mostly-0 state" },
    { id: "plusI", text: "H, then S (|+i⟩)", prep: [["h"], ["s"]], name: "|+i⟩", level: "intermediate" },
    { id: "minusI", text: "H, then S† (|−i⟩)", prep: [["h"], ["sdg"]], name: "|−i⟩", level: "intermediate" }
  ];
  function sourceById(id) { return SOURCES.filter(function (s) { return s.id === id; })[0]; }

  var BASIS_LABELS = { z: ["0", "1"], x: ["+", "−"], y: ["+i", "−i"] };
  var BASIS_NAMES = { z: "Z", x: "X", y: "Y" };

  function oneCircuit(prep, withH, bs, hiddenDraw) {
    var ops = [];
    var col = 0;
    if (hiddenDraw) {
      ops.push({ type: "gate", label: "?", name: "a hidden preparation", targets: [0], col: col++ });
    } else {
      prep.forEach(function (s) { ops.push(gateOp(s[0], 0, col++, s[1])); });
    }
    if (withH) ops.push(gateOp("h", 0, col++));
    R.basisGates(bs, 0, col).forEach(function (op) { ops.push(op); col++; });
    ops.push({ type: "measure", targets: [0], col: col });
    return { qubits: ["q0", "q1"], maxColumns: MAXCOL, ops: ops };
  }

  // ---- the mystery sources ---------------------------------------------------------------
  var HIDDEN = {
    mostly0: [["ry", 60]],
    balanced: [["h"]],
    mostly1: [["ry", 120]],
    plus: [["h"]],
    minus: [["h"], ["z"]]
  };
  var MYSTERY = [
    {
      title: "Round 1 of 2",
      question: "A state is hidden. It is one of three: mostly 0 (about 25% ones), balanced (50% each), or mostly 1 (about 75% ones). Choose a number of shots, measure, and then guess which it is.",
      hidden: "mostly1",
      choices: [["mostly0", "Mostly 0"], ["balanced", "Balanced"], ["mostly1", "Mostly 1"]]
    },
    {
      title: "Round 2 of 2",
      question: "A state is hidden. It is |+⟩ or |−⟩. Measure it, and find a way to tell which it is.",
      hidden: "minus",
      choices: [["plus", "|+⟩"], ["minus", "|−⟩"]]
    }
  ];

  // ---- state of the lab ---------------------------------------------------------------------
  var mode = "one";
  var sourceId = "plus";
  var addH = false;
  var basis = "z";
  var first = 0;
  var shots = 100;
  var session = null;
  var result = null;
  var step = null;
  var stepRng = S.rng(SEED + 7);
  var mystery = null;
  var spreadRows = {};
  var spreadCount = 0;
  var message = "";
  var announce = "";

  function model() {
    var m = { mode: mode };
    if (mode === "pair") {
      m.circuit = C.bell();
      m.drawn = m.circuit;
      m.labels = LABELS4;
      m.basis = "z";
    } else {
      var prep;
      var bs = basis;
      if (mystery) {
        prep = HIDDEN[MYSTERY[mystery.round].hidden];
        bs = "z";
      } else {
        prep = sourceById(sourceId).prep;
      }
      m.circuit = oneCircuit(prep, addH, bs, false);
      m.drawn = { qubits: ["q0"], ops: oneCircuit(prep, addH, bs, !!mystery).ops };
      m.labels = BASIS_LABELS[bs];
      m.basis = bs;
    }
    m.trace = R.run(m.circuit);
    m.final = m.trace.final;
    m.state = m.final.state;
    if (mode === "pair") {
      m.probs = m.final.probabilities;
    } else {
      m.probs = T.marginals(m.state).q0;
      m.amps = [m.state[0], m.state[2]]; // q1 is idle in |0>, so q0's amplitudes sit at 00 and 10
    }
    return m;
  }

  function barRows(probs, labels) {
    return labels.map(function (l, i) { return { label: "Outcome " + l, fraction: probs[i], text: pct(probs[i]) + "%" }; });
  }

  function q0Name(m, amps) {
    var n = Q.nameOf({ alpha: amps[0], beta: amps[1] });
    if (n) return n.name;
    if (!mystery && !addH && m.basis === "z" && sourceById(sourceId).id === "tilt") return "the mostly-0 state";
    return "a state with no name";
  }

  function ampLine(m) {
    if (mode === "pair") {
      return "Amplitudes, for listing only: " + m.state.map(function (z, i) { return LABELS4[i] + ": " + cell(z); }).join(" · ") + ". Squared, they give the probabilities.";
    }
    var parts = m.amps.map(function (z, i) { return "on |" + i + "⟩: " + squareText(z); });
    return "Amplitudes just before the meter, " + parts.join("; ") + ".";
  }

  // ---- drawing the lab ----------------------------------------------------------------------
  function setPressed(root, test) {
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (b) {
      var on = test(b);
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function predictedHTML(m) {
    if (mystery) {
      return '<p class="qed-ml__grouphead">Predicted</p><p class="qed-editor__details">The state is hidden, so there is no prediction to show. Measure it, and judge from the counts.</p>';
    }
    var html = '<p class="qed-ml__grouphead">Predicted — what the state says</p>';
    if (mode === "pair") {
      html += '<p class="qed-editor__details">' + esc(m.final.name.text) + ".</p>";
    } else {
      html += '<p class="qed-editor__details">State just before the meter: ' + esc(q0Name(m, m.amps)) + ".</p>";
    }
    html += S.renderBars(barRows(m.probs, m.labels));
    html += '<p class="qed-editor__details">' + esc(ampLine(m)) + "</p>";
    return html;
  }

  function sampledHTML(m) {
    var html = '<p class="qed-ml__grouphead">Sampled — what the shots gave</p>';
    if (!result) {
      return html + '<p class="qed-editor__details">Nothing measured yet. Choose a number of shots and press Measure. Results are simulated: ideal and noiseless.</p>';
    }
    var rows = result.counts.map(function (c, i) {
      return { label: "Outcome " + m.labels[i], fraction: result.shots === 0 ? 0 : c / result.shots, text: c + " (" + Math.round((c / result.shots) * 100) + "%)" };
    });
    html += S.renderBars(rows);
    if (result.shots === 1) {
      html += '<p class="qed-editor__details">One simulated shot gave one result: ' + esc(m.labels[result.sequence[0]]) + ". One result cannot show the probabilities.</p>";
    } else if (!mystery) {
      var expected = m.probs.map(function (p) { return Math.round(p * result.shots); });
      html += '<p class="qed-editor__details">Expected about ' + andJoin(m.labels.map(function (l, i) { return expected[i] + " for outcome " + l; })) + "; got " + andJoin(result.counts.map(String)) + ". Simulated: ideal and noiseless. The prediction describes the state, and the counts describe this run.</p>";
    } else {
      html += '<p class="qed-editor__details">Simulated: ideal and noiseless.</p>';
    }
    return html;
  }

  function expectHTML(m) {
    var inter = QL.atLeast("intermediate");
    if (!inter || mystery) return "";
    if (mode === "pair") {
      var zz = m.probs[0] + m.probs[3] - m.probs[1] - m.probs[2];
      var text = "Expectation value ⟨Z⊗Z⟩ = P(00) + P(11) − P(01) − P(10) = " + num(zz) + " (predicted): " + (Math.abs(zz - 1) < 1e-6 ? "the two results always agree" : "the two results do not always agree") + ".";
      if (result) {
        var c = result.counts;
        text += " From these shots: " + num((c[0] + c[3] - c[1] - c[2]) / result.shots) + ".";
      }
      return text;
    }
    var name = BASIS_NAMES[m.basis];
    var text2 = "Expectation value ⟨" + name + "⟩ = P(" + m.labels[0] + ") − P(" + m.labels[1] + ") = " + num(m.probs[0] - m.probs[1]) + " (predicted).";
    if (result) text2 += " From these shots: (" + result.counts[0] + " − " + result.counts[1] + ") / " + result.shots + " = " + num((result.counts[0] - result.counts[1]) / result.shots) + ".";
    return text2;
  }

  // ---- the stepper --------------------------------------------------------------------------
  // "|11⟩" for a basis state of the pair, otherwise the name from QedTrace.
  function ketOrName(state) {
    var p = T.probabilities(state);
    for (var i = 0; i < 4; i++) if (Math.abs(p[i] - 1) < 1e-9) return "|" + LABELS4[i] + "⟩";
    return R.describeState(state).text;
  }
  function token(label) { return '<span class="qed-ml__token">' + esc(label) + "</span>"; }

  function stepperHTML(m) {
    if (!step) return '<p class="qed-editor__details">Press Measure once to watch one measurement happen: the state before, the one outcome, and the state after.</p>';
    var out = "";
    var r = step.result;
    if (mode === "pair") {
      var s0 = r.steps[0];
      var s1 = r.steps[1];
      var after = ketOrName(r.state);
      var mid = ketOrName(s0.state);
      out += '<div class="qed-ml__steps">';
      out += '<div class="qed-ml__panel"><p class="qed-ml__panelhead">BEFORE</p><p class="qed-editor__details">' + esc(m.final.name.text) + ".</p>" + S.renderBars(barRows(m.probs, LABELS4)) + "</div>";
      out += '<div class="qed-ml__panel"><p class="qed-ml__panelhead">OUTCOME</p><p>' + token(qn(s0.wire) + ": " + s0.outcome) + token(qn(s1.wire) + ": " + s1.outcome) + "</p>" +
        "<p class=\"qed-editor__details\">Measuring " + qn(s0.wire) + " first gave " + s0.outcome + ", with a chance of " + pct(s0.probability) + "%. " + qn(s1.wire) + " then gave " + s1.outcome + ", with a chance of " + pct(s1.probability) + "%: it was certain.</p></div>";
      out += '<div class="qed-ml__panel"><p class="qed-ml__panelhead">AFTER</p><p class="qed-editor__details">After the first measurement the pair is already in ' + esc(mid) + ", so the other result was settled.</p>" +
        S.renderBars(barRows(T.probabilities(r.state), LABELS4)) + "<p class=\"qed-editor__details\">Final: " + esc(after) + ".</p></div>";
      out += "</div>";
    } else {
      var st = r.steps[0];
      var afterAmps = [r.state[0], r.state[2]];
      var afterProbs = T.marginals(r.state).q0;
      out += '<div class="qed-ml__steps">';
      out += '<div class="qed-ml__panel"><p class="qed-ml__panelhead">BEFORE</p><p class="qed-editor__details">' + esc(q0Name(m, m.amps)) + ".</p>" + S.renderBars(barRows(m.probs, m.labels)) + "</div>";
      out += '<div class="qed-ml__panel"><p class="qed-ml__panelhead">OUTCOME</p><p>' + token(m.labels[st.outcome]) + '</p><p class="qed-editor__details">One measurement gave ' + esc(m.labels[st.outcome]) + ". Its chance was " + pct(st.probability) + "%.</p></div>";
      var note = "";
      if (m.basis !== "z") {
        var inv = G.inverse(G.compose(R.basisGates(m.basis, 0, 0).map(R.gateOf)));
        var back = G.apply(inv, { alpha: afterAmps[0], beta: afterAmps[1] });
        var named = Q.nameOf(back);
        note = " Undoing the basis change, that is " + (named ? named.name : "a state with no name") + ".";
      }
      out += '<div class="qed-ml__panel"><p class="qed-ml__panelhead">AFTER</p><p class="qed-editor__details">The state now matches the outcome: ' + esc(q0Name(m, afterAmps)) + "." + esc(note) + "</p>" + S.renderBars(barRows(afterProbs, m.labels)) + "</div>";
      out += "</div>";
    }
    if (step.again.length) {
      out += '<p class="qed-editor__details"><strong>Measured the same qubit again:</strong> ' + step.again.map(function (a) { return token(mode === "pair" ? String(a.outcome) : m.labels[a.outcome]); }).join("") +
        " Every repeat gave the same result, with a chance of " + pct(step.again[step.again.length - 1].probability) + "%.</p>";
    }
    return out;
  }

  // ---- the spread view (Intermediate) ---------------------------------------------------------
  function spreadHTML(m) {
    var ns = Object.keys(spreadRows).map(Number).sort(function (a, b) { return a - b; });
    if (!ns.length) return '<p class="qed-editor__details">Choose a number of shots and press Repeat 50 times.</p>';
    var p = m.probs[0];
    return ns.map(function (n) {
      var sp = spreadRows[n];
      var expected = S.expectedSpread(p, n);
      var lo = Math.max(0, p - expected) * 100;
      var hi = Math.min(1, p + expected) * 100;
      var dots = sp.fractions.map(function (f) { return '<span class="qed-ml__dot" style="left:' + (f * 100).toFixed(2) + '%"></span>'; }).join("");
      var text = "N = " + n + ": 50 experiments gave outcome " + m.labels[0] + " between " + pct(sp.min) + "% and " + pct(sp.max) + "%. Spread (standard deviation) " + (sp.sd * 100).toFixed(1) + "%; the formula √(p(1−p)/N) gives " + (expected * 100).toFixed(1) + "%.";
      return '<div role="group" aria-label="' + esc(text) + '"><p class="qed-editor__details"><strong>' + esc(text) + "</strong></p>" +
        '<div class="qed-ml__strip" aria-hidden="true"><span class="qed-ml__band" style="left:' + lo.toFixed(2) + "%;width:" + (hi - lo).toFixed(2) + '%"></span>' + dots + "</div>" +
        '<div class="qed-ml__axis" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div></div>';
    }).join("") + '<p class="qed-editor__details">Dots are single experiments. The dashed band is the predicted probability plus and minus the formula.</p>';
  }

  // ---- the mystery ----------------------------------------------------------------------------
  function mysterySession(m) {
    var key = mystery.round + (addH ? "H" : "D");
    if (!mystery.sess[key]) mystery.sess[key] = S.session(m.probs, SEED + 100 + mystery.round * 10 + (addH ? 1 : 0));
    return mystery.sess[key];
  }

  function mysteryCountsText() {
    function line(k, label) {
      var c = mystery.counts[k];
      return c[0] + c[1] === 0 ? label + ": no shots yet" : label + ": 0 appeared " + c[0] + " times, 1 appeared " + c[1] + " times";
    }
    return "So far — " + line("direct", "measured directly") + "; " + line("withH", "with an H first") + ".";
  }

  function mysteryTotals() {
    var d = mystery.counts.direct;
    var h = mystery.counts.withH;
    return { direct: d[0] + d[1], withH: h[0] + h[1], total: d[0] + d[1] + h[0] + h[1] };
  }

  function guess(id) {
    var rd = MYSTERY[mystery.round];
    var t = mysteryTotals();
    var ok = id === rd.hidden;
    var fb = $("ml-mfeedback");
    var text;
    if (t.total === 0) {
      fb.className = "qed-quiz__feedback is-incorrect";
      fb.textContent = "Measure the hidden state first. A guess with no shots is only a guess.";
      return;
    }
    var d = mystery.counts.direct;
    var h = mystery.counts.withH;
    if (mystery.round === 0) {
      var ones = d[1] + h[1];
      if (ok && t.total >= 50) {
        text = "Yes: mostly 1. " + ones + " of your " + shotWord(t.total) + " gave 1, close to the 75% that a mostly-1 state gives.";
      } else if (ok) {
        text = "Right, but with only " + shotWord(t.total) + " it was partly luck. One shot gives 1 half the time even for a balanced state, so a handful of shots cannot settle it. Take more shots to see the pattern.";
      } else {
        text = "Not this one. Your " + shotWord(t.total) + " gave 1 " + ones + " times (" + Math.round((ones / t.total) * 100) + "%). A mostly-0 state gives about 25% ones, a balanced state about 50%, and a mostly-1 state about 75%." + (t.total < 50 ? " With so few shots the counts are not reliable. Take more." : "");
      }
    } else {
      var evenDirect = t.direct > 0 ? Math.round((d[1] / t.direct) * 100) : null;
      if (ok && t.withH === 0) {
        text = "Right, but that was a guess. Measured directly, |+⟩ and |−⟩ both give about 50% ones" + (evenDirect !== null ? " (you saw " + evenDirect + "%)" : "") + ", so no number of direct shots can tell them apart. Add an H before measuring and compare.";
      } else if (ok) {
        text = "Yes, |−⟩. Measured directly, the counts were about even, so they could not tell the two states apart. With an H first, " + h[1] + " of " + shotWord(t.withH) + " gave 1, because H turns |−⟩ into a certain 1 (and |+⟩ into a certain 0). The H turned a phase difference into a probability difference.";
      } else if (t.withH === 0) {
        text = "Not this one, and the direct counts could not have told you: |+⟩ and |−⟩ both give about 50% ones. Add an H before measuring and compare.";
      } else {
        text = "Not this one. With an H first, H turns |+⟩ into a certain 0 and |−⟩ into a certain 1. Your " + shotWord(t.withH) + " with the H gave 1 " + h[1] + " times.";
      }
    }
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
    mystery.solved = ok;
    $("ml-mnext").hidden = !ok;
    $("ml-mnext").textContent = mystery.round === 0 ? "Next round" : "Start again";
    announce = text;
  }

  function buildMysteryChoices() {
    var box = $("ml-mchoices");
    box.innerHTML = "";
    MYSTERY[mystery.round].choices.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = c[1];
      b.addEventListener("click", function () { guess(c[0]); render(); });
      box.appendChild(b);
    });
  }

  function startMystery(round) {
    mode = "one";
    mystery = { round: round, counts: { direct: [0, 0], withH: [0, 0] }, sess: {}, solved: false };
    addH = false;
    result = null;
    step = null;
    $("ml-mfeedback").textContent = "";
    $("ml-mfeedback").className = "qed-quiz__feedback";
    $("ml-mnext").hidden = true;
    buildMysteryChoices();
    announce = MYSTERY[round].title + ". " + MYSTERY[round].question;
  }

  function leaveMystery() {
    mystery = null;
    result = null;
    announce = "Left the mystery.";
    configChanged();
  }

  // ---- render ---------------------------------------------------------------------------------
  function render() {
    var inter = QL.atLeast("intermediate");
    var m = model();

    setPressed($("ml-mode"), function (b) { return b.dataset.mode === mode; });
    setPressed($("ml-sources"), function (b) { return b.dataset.id === sourceId; });
    setPressed($("ml-basis"), function (b) { return b.dataset.basis === basis; });
    setPressed($("ml-first"), function (b) { return Number(b.dataset.first) === first; });
    setPressed($("ml-shotbtns"), function (b) { return Number(b.dataset.shots) === shots; });
    var hb = $("ml-addh");
    hb.classList.toggle("qed-button--active", addH);
    hb.setAttribute("aria-pressed", addH ? "true" : "false");

    Array.prototype.forEach.call($("ml-sources").querySelectorAll("button"), function (b) {
      b.hidden = b.dataset.level === "intermediate" && !inter;
    });
    $("ml-sourcebox").hidden = mode !== "one" || !!mystery;
    $("ml-addhbox").hidden = mode !== "one";
    $("ml-basisbox").hidden = !(inter && mode === "one" && !mystery);
    $("ml-pairbox").hidden = mode !== "pair";
    $("ml-stepbox").hidden = !!mystery;
    $("ml-spreadbox").hidden = !(inter && mode === "one" && !mystery);
    $("ml-mpanel").hidden = !mystery;
    $("ml-mleave").hidden = !mystery;
    $("ml-mstart").hidden = !!mystery;

    var msg = $("ml-message");
    msg.hidden = !message;
    msg.textContent = message ? "ℹ " + message : "";

    var circuitText = mystery ? "a hidden preparation, then " + (addH ? "an H, then " : "") + "a measurement of q₀" : C.summarize({ qubits: ["q0", "q1"], ops: m.drawn.ops });
    $("ml-drawing").innerHTML = C.renderSVG(m.drawn, { neutral: true, ariaLabel: "Circuit: " + circuitText + "." });
    $("ml-summary").textContent = (mode === "pair" ? "q₀ and q₁ both start in |0⟩. " : "q₀ starts in |0⟩. ") + circuitText.charAt(0).toUpperCase() + circuitText.slice(1) + ".";

    $("ml-predicted").innerHTML = predictedHTML(m);
    $("ml-sampled").innerHTML = sampledHTML(m);
    var ex = $("ml-expect");
    var exText = expectHTML(m);
    ex.hidden = !exText;
    ex.textContent = exText;

    $("ml-stepper").innerHTML = stepperHTML(m);
    $("ml-again").disabled = !step;
    $("ml-measure").textContent = result ? "Run again" : "Measure";

    if (!$("ml-spreadbox").hidden) $("ml-spread").innerHTML = spreadHTML(m);
    if (mystery) {
      $("ml-mquestion").textContent = MYSTERY[mystery.round].title + ". " + MYSTERY[mystery.round].question + " The H toggle above adds an H before the measurement.";
      $("ml-mcounts").textContent = mysteryCountsText();
    }

    var live = announce;
    if (!live) live = circuitText + ". " + (mode === "pair" ? T.describe(m.state) : "");
    $("ml-live").textContent = live;
    announce = "";
  }

  function newSession() {
    var m = model();
    session = S.session(m.probs, SEED);
    result = null;
    step = null;
    spreadRows = {};
  }

  function configChanged() {
    if (mystery) { result = null; step = null; } else { newSession(); }
    render();
  }

  // ---- actions ----------------------------------------------------------------------------------
  function doMeasure() {
    var m = model();
    var sess = mystery ? mysterySession(m) : session;
    result = sess.run(shots);
    if (mystery) {
      var k = addH ? "withH" : "direct";
      result.counts.forEach(function (c, i) { mystery.counts[k][i] += c; });
    }
    announce = S.describe(result, m.labels);
    render();
  }

  function doOnce() {
    var m = model();
    var wires = mode === "pair" ? (first === 0 ? [0, 1] : [1, 0]) : [0];
    step = { wires: wires, result: T.measure(m.state, wires, stepRng), again: [] };
    var r = step.result;
    announce = mode === "pair"
      ? "One simulated measurement of the pair. " + qn(r.steps[0].wire) + " gave " + r.steps[0].outcome + ", and " + qn(r.steps[1].wire) + " then gave " + r.steps[1].outcome + " for certain."
      : "One simulated measurement gave " + m.labels[r.steps[0].outcome] + ". The state now matches that outcome.";
    render();
  }

  function doAgain() {
    if (!step) return;
    var m = model();
    var wire = step.wires[0];
    var last = step.again.length ? step.again[step.again.length - 1].state : step.result.steps[0].state;
    var r = T.measure(last, [wire], stepRng);
    step.again.push({ outcome: r.outcomes[wire], state: r.state, probability: r.steps[0].probability });
    announce = "Measured " + qn(wire) + " again: " + (mode === "pair" ? r.outcomes[wire] : m.labels[r.outcomes[wire]]) + ", the same result, with a chance of 100 percent.";
    render();
  }

  function reset() {
    mode = "one";
    sourceId = "plus";
    addH = false;
    basis = "z";
    first = 0;
    shots = 100;
    mystery = null;
    spreadCount = 0;
    message = "";
    stepRng = S.rng(SEED + 7);
    announce = "The lab was reset.";
    configChanged();
  }

  // ---- controls ---------------------------------------------------------------------------------
  function buildControls() {
    Array.prototype.forEach.call($("ml-mode").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        if (mode === b.dataset.mode) return;
        mode = b.dataset.mode;
        if (mode === "pair") mystery = null;
        message = "";
        configChanged();
      });
    });
    SOURCES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = s.text;
      b.dataset.id = s.id;
      if (s.level) b.dataset.level = s.level;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { sourceId = s.id; message = ""; configChanged(); });
      $("ml-sources").appendChild(b);
    });
    ["z", "x", "y"].forEach(function (id) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = BASIS_NAMES[id] + " basis" + (id === "z" ? " (directly)" : "");
      b.dataset.basis = id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { basis = id; message = ""; configChanged(); });
      $("ml-basis").appendChild(b);
    });
    Array.prototype.forEach.call($("ml-first").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { first = Number(b.dataset.first); step = null; render(); });
    });
    Array.prototype.forEach.call($("ml-shotbtns").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { shots = Number(b.dataset.shots); render(); });
    });
    $("ml-addh").addEventListener("click", function () { addH = !addH; message = ""; configChanged(); });
    $("ml-measure").addEventListener("click", doMeasure);
    $("ml-once").addEventListener("click", doOnce);
    $("ml-again").addEventListener("click", doAgain);
    $("ml-reset").addEventListener("click", reset);
    $("ml-spreadgo").addEventListener("click", function () {
      var n = Number($("ml-spreadn").value);
      var m = model();
      spreadCount++;
      var random = S.rng(SEED + 1000 + n + spreadCount * 31);
      spreadRows[n] = S.spread(S.repeat(m.probs, n, 50, random), 0);
      announce = "Repeated the experiment 50 times with " + n + " shots each.";
      render();
    });
    $("ml-mstart").addEventListener("click", function () { startMystery(0); render(); });
    $("ml-mleave").addEventListener("click", leaveMystery);
    $("ml-mnext").addEventListener("click", function () {
      startMystery(mystery.round === 0 ? 1 : 0);
      render();
    });
  }

  // ---- level-aware behavior (additive) ----------------------------------------------------------
  function applyLevel() {
    var inter = QL.atLeast("intermediate");
    if (!inter && (sourceById(sourceId).level === "intermediate" || basis !== "z")) {
      sourceId = "plus";
      basis = "z";
      spreadRows = {};
      message = "That source or basis came from the Intermediate view, so the lab was reset to |+⟩ measured directly.";
      announce = message;
      newSession();
    }
    render();
  }
  QL.onChange(applyLevel);

  // ---- static pictures built from the shared modules -----------------------------------------------
  function buildAmpTable() {
    var tilt = R.run(oneCircuit(sourceById("tilt").prep, false, "z", false)).final.state;
    var rows = [
      ["|+⟩", [preset("plus").state.alpha, preset("plus").state.beta]],
      ["|−⟩", [preset("minus").state.alpha, preset("minus").state.beta]],
      ["The mostly-0 state", [tilt[0], tilt[2]]]
    ].map(function (r) {
      var a = r[1];
      var p = a.map(function (z) { return z.re * z.re + z.im * z.im; });
      return "<tr><th scope=\"row\">" + r[0] + "</th><td>" + num(a[0].re, 3) + ", " + num(a[1].re, 3) + "</td><td>" + squareText(a[0]) + ", " + squareText(a[1]) + "</td><td>" + pct(p[0]) + "% and " + pct(p[1]) + "%</td></tr>";
    }).join("");
    $("ms-amps").innerHTML = '<table class="qed-comparison-table"><thead><tr><th scope="col">State</th><th scope="col">Amplitudes (on 0, on 1)</th><th scope="col">Squares</th><th scope="col">Probabilities of 0 and 1</th></tr></thead><tbody>' + rows +
      '</tbody></table><p class="qed-editor__details">Real amplitudes are a simplification that this page uses at Beginner level. The sign of −0.71 disappears when it is squared, which is why |+⟩ and |−⟩ give the same probabilities.</p>';
  }

  function buildPhaseTable() {
    var cases = [
      ["|+⟩ measured directly", "plus", false],
      ["|−⟩ measured directly", "minus", false],
      ["|+⟩, then H, then measured", "plus", true],
      ["|−⟩, then H, then measured", "minus", true]
    ];
    var rows = cases.map(function (c) {
      var circuit = oneCircuit(sourceById(c[1]).prep, c[2], "z", false);
      var p = T.marginals(R.run(circuit).final.state).q0;
      var svg = C.renderSVG({ qubits: ["q0"], ops: circuit.ops }, { neutral: true, ariaLabel: c[0] + ": " + C.summarize({ qubits: ["q0", "q1"], ops: circuit.ops }) + "." });
      return "<tr><th scope=\"row\">" + c[0] + "</th><td>" + svg + "</td><td>0: " + pct(p[0]) + "%, 1: " + pct(p[1]) + "%</td></tr>";
    }).join("");
    $("ms-phase").innerHTML = '<table class="qed-comparison-table"><thead><tr><th scope="col">Case</th><th scope="col">Circuit</th><th scope="col">Probabilities</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  function buildOrderTable() {
    var state = R.run(C.bell()).final.state;
    function joint(order) {
      var out = [0, 0, 0, 0];
      [0, 1].forEach(function (x) {
        var a = T.marginals(state)[order[0] === 0 ? "q0" : "q1"][x];
        if (a < EPS) return;
        var s1 = T.measureQubit(state, order[0], x);
        [0, 1].forEach(function (y) {
          if (T.marginals(s1.state)[order[1] === 0 ? "q0" : "q1"][y] < EPS) return;
          var s2 = T.measureQubit(s1.state, order[1], y);
          var q0 = order[0] === 0 ? x : y;
          var q1 = order[0] === 0 ? y : x;
          out[q0 * 2 + q1] += s1.probability * s2.probability;
        });
      });
      return out;
    }
    function row(label, p) {
      return "<tr><th scope=\"row\">" + label + "</th>" + p.map(function (x) { return "<td>" + pct(x) + "%</td>"; }).join("") + "</tr>";
    }
    $("ms-order").innerHTML = '<table class="qed-comparison-table qed-jointtable"><thead><tr><th scope="col">Measured in the order</th>' + LABELS4.map(function (l) { return '<th scope="col">' + l + "</th>"; }).join("") + "</tr></thead><tbody>" +
      row("q₀ first, then q₁", joint([0, 1])) + row("q₁ first, then q₀", joint([1, 0])) + "</tbody></table>" +
      '<p class="qed-editor__validity is-valid">= Same result. Which qubit goes first does not change the joint probabilities.</p>';
  }

  // ---- checks -----------------------------------------------------------------------------------
  Z.mount($("ms-quiz-again"), {
    title: "A qubit is measured and gives 1. It is measured again right away. What does the second measurement give?",
    items: [
      {
        prompt: "Pick one, and check the feedback.",
        label: "What a second measurement gives after the first gave 1",
        options: [
          { label: "A fresh draw: 0 or 1, depending on the original state", correct: false, why: "That would treat the second measurement as a fresh draw from the original probabilities. After the first measurement, the state is no longer the original one." },
          { label: "Always 1", correct: true, why: "After a measurement, the state matches the outcome that was seen. The qubit is now in |1⟩, so the same measurement gives 1 with probability 100%." },
          { label: "Always 0, because the first measurement used up the 1", correct: false, why: "Nothing is used up. The state now matches the outcome 1, so the second measurement gives 1 again." },
          { label: "50% each, because a measurement scrambles the state", correct: false, why: "A measurement does not scramble the state into an even mix. It leaves a state that matches the result, and that state gives that result for certain." }
        ]
      }
    ]
  });

  Z.mount($("ms-quiz-run"), {
    title: "A qubit is in the mostly-0 state (75% for 0, 25% for 1). It is measured 100 times. Which counts are most likely?",
    items: [
      {
        prompt: "Pick one, and check the feedback.",
        label: "Likely counts for 100 measurements of the mostly-0 state",
        options: [
          { label: "Exactly 50 zeros and 50 ones", correct: false, why: "That would be the counts for a balanced state. This state has amplitudes 0.87 and 0.5, and their squares are 0.75 and 0.25." },
          { label: "100 zeros and no ones", correct: false, why: "That would need a probability of 100% for 0. This state gives 1 about a quarter of the time." },
          { label: "About 75 zeros and 25 ones, but not exactly", correct: true, why: "The squares of the amplitudes give 75% and 25%. A run of 100 shots gives counts near that, and rarely exactly that." },
          { label: "Exactly 75 zeros and 25 ones, every time", correct: false, why: "75% is a probability. A finite run of shots varies around it, so the counts change from run to run." }
        ]
      }
    ]
  });

  // ---- start ------------------------------------------------------------------------------------------
  buildAmpTable();
  buildPhaseTable();
  buildOrderTable();
  buildControls();
  newSession();
  applyLevel();
});
</script>
