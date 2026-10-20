# Multi-Qubit Systems

Two qubits have four joint outcomes, and those outcomes can break a rule that independent qubits follow.

## From One Qubit to Two

On the [previous page](quantum-gates.md), we could move one qubit's state anywhere and undo the move. We ended with two qubits side by side, each with its own state and nothing linking them.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Before</span><span>One qubit's state can be moved and undone</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Now</span><span>Two qubits, side by side, with nothing linking them</span></div>
  </div>
</div>

> **What changes when there is more than one qubit?**

[Module 01](../01-foundations/what-is-quantum-computing.md#entanglement) already showed a pair of qubits whose results were random alone and yet always agreed, and the [CHSH game](../01-foundations/what-is-quantum-computing.md#entanglement) that tests such pairs. This page does not repeat the game. It works out the same pair from the joint outcomes, and shows how it breaks a rule that independent qubits follow.

## Joint Outcomes

Two qubits, each read as 0 or 1, give four **joint outcomes**: **00**, **01**, **10**, and **11**.

!!! note "Order convention"
    The first qubit, **q₀**, is written first, on the left. It is also the control of the CNOT gate below, and the top wire in a circuit. The left digit of an outcome belongs to q₀ and the right digit to q₁. Some software libraries write bit strings with qubit 0 on the right, so check the documentation of any tool before reading a bit string from it.

!!! question "Why does 01 not mean the second qubit first?"
    On this page the left digit is q₀ and the right digit is q₁. Another tool may write them the other way round.

A **joint probability table** gives the probability of each joint outcome. Here q₀ is in |+⟩ and q₁ is in |0⟩. Each qubit's **own probabilities** are read off the table by adding along a row or a column:

<div class="qed-demo" id="mq-joint"></div>

The row totals are q₀'s own probabilities and the column totals are q₁'s.

## Independent Qubits

Two qubits are **independent** when neither one's outcomes depend on the other. For independent qubits the joint probability is the **product** of the two separate probabilities:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:20rem;"><span>P(q₀ shows a and q₁ shows b)</span></div>
  <div class="qed-encode-demo__arrow">=</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:20rem;"><span>P(q₀ shows a) × P(q₁ shows b)</span></div>
</div>

Two examples. In the first, q₀ is in |+⟩ and q₁ is in |0⟩. In the second, both are in |+⟩:

<div class="qed-demo" id="mq-product-rule"></div>

The rule holds for independent qubits. We will use it as a test, and only in one direction: a joint table that breaks the rule cannot belong to independent qubits.

## CNOT: A Conditional Flip

**CNOT** is a gate on two qubits. One qubit is the **control** and the other is the **target**:

- **Control** — the qubit whose value decides whether the flip happens. Here, q₀.
- **Target** — the qubit that is flipped when the control is 1. Here, q₁.

<div class="qed-demo" id="mq-cnot"></div>

Its symbol is a dot on the control wire joined to a ⊕ on the target wire. Read the table down: when the control is 0, nothing happens, and when the control is 1, the target flips.

What if the control is in a superposition? CNOT acts on **each part separately**. The part of the state with the control at 0 is left alone, and the part with the control at 1 has its target flipped. Like every gate, CNOT can be undone.

!!! question "Does CNOT look at the control?"
    No. It flips the target on the part of the state where the control is 1, and leaves the rest alone. It does not copy the control, and it does not read it.

## Two-Qubit Explorer

Choose what each qubit starts in. Then switch on an H gate on q₀, and a CNOT gate after it, and watch the joint table. Switch on the product test to compare the table with what independent qubits would give.

<div class="qed-demo qed-twoq" id="mq-explorer">
  <p class="qed-demo__step"><strong>1. Choose what each qubit starts in</strong></p>
  <p class="qed-editor__amp-title"><strong>q₀ starts in</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Start state of q0" id="mq-in0"></div>
  <p class="qed-editor__amp-title"><strong>q₁ starts in</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Start state of q1" id="mq-in1"></div>

  <p class="qed-demo__step"><strong>2. Choose the steps</strong> (H first, then CNOT)</p>
  <div class="qed-demo__controls" role="group" aria-label="Steps">
    <button type="button" class="qed-button qed-button--secondary" id="mq-h" aria-pressed="false">Apply H to q₀</button>
    <button type="button" class="qed-button qed-button--secondary" id="mq-cnot" aria-pressed="false">Apply CNOT (q₀ control, q₁ target)</button>
    <button type="button" class="qed-button qed-button--secondary" id="mq-reset">Reset</button>
  </div>
  <p class="qed-editor__note" id="mq-note"></p>

  <p class="qed-demo__step"><strong>3. The steps</strong></p>
  <p class="qed-editor__details" id="mq-inputs"></p>
  <div id="mq-circuit"></div>

  <p class="qed-demo__step"><strong>4. The joint outcomes</strong></p>
  <div id="mq-bars"></div>
  <p class="qed-editor__details" id="mq-amps"></p>
  <p class="qed-editor__details" id="mq-own"></p>
  <p class="qed-editor__details" id="mq-caption"></p>

  <div id="mq-inter" hidden>
    <p class="qed-demo__step"><strong>Intermediate readouts</strong></p>
    <p class="qed-editor__details" id="mq-vector"></p>
    <p class="qed-editor__details" id="mq-sep"></p>
    <div id="mq-matrix"></div>
  </div>

  <p class="qed-demo__step"><strong>5. The product test</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="mq-test" aria-pressed="false">Show the product test</button>
  </div>
  <div id="mq-testpanel" hidden></div>

  <div class="qed-sr-only" id="mq-summary" role="status" aria-live="polite"></div>
</div>

The circuit, the bars, the amplitudes, and each qubit's own probabilities each sit in their own place. The bars are what the state would give, not a measurement result.

## The Bell State

Start both qubits in |0⟩. Switch on H on q₀, and then CNOT. Here is the table, put through the product test next to the table for |+⟩ and |+⟩:

<div class="qed-demo" id="mq-compare"></div>

The pair that H then CNOT produces from |00⟩ is called the **Bell state**. It has two outcomes: 00 and 11, each 50% of the time. 01 and 10 never happen.

Now apply the product test. Each qubit alone is 50/50, so independent qubits would give 25% for every outcome. The Bell state gives 50%, 0%, 0%, and 50%. **No pair of independent qubits can give this table.**

Compare |+⟩ and |+⟩. Each qubit alone is also 50/50, and the joint table does match the product.

!!! question "Both pairs have a 50/50 qubit on each side. What is different about the Bell state?"
    Its joint outcomes always agree, so the two qubits are not independent. Entanglement is not two independent superpositions.

Neither qubit of the Bell state has a state of its own to draw on the sphere. That is the limit the [Bloch sphere](bloch-sphere.md) page named: the picture works for one qubit. The pair has a state, but neither qubit alone does. And this is the pair from [Module 01](../01-foundations/what-is-quantum-computing.md#entanglement), random alone and always agreeing, now as a table.

Check your understanding. First, predict before the bars appear:

<div class="qed-demo" id="mq-quiz-predict"></div>
<div class="qed-demo" id="mq-predict-bars" hidden></div>

Then decide which tables could come from two independent qubits:

<div class="qed-demo" id="mq-quiz-indep"></div>

Now try one yourself, using the explorer above:

<div class="qed-demo" id="mq-transfer">
  <p><strong>Make 01 and 10 each happen 50% of the time, with 00 and 11 never.</strong> Choose the starting states and steps, then check.</p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="mq-transfer-check">Check my table</button>
  </div>
  <p class="qed-quiz__feedback" id="mq-transfer-feedback" aria-live="polite"></p>
</div>

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### Tensor products and four-component vectors

The state of two qubits is four numbers, one per joint outcome:

\[ |\psi\rangle = \alpha|00\rangle + \beta|01\rangle + \gamma|10\rangle + \delta|11\rangle,\qquad |\alpha|^2 + |\beta|^2 + |\gamma|^2 + |\delta|^2 = 1 . \]

**The product of two states.** If q₀ is in \(a_0|0\rangle + a_1|1\rangle\) and q₁ is in \(b_0|0\rangle + b_1|1\rangle\), the pair is their **tensor product**:

\[ \begin{pmatrix}a_0\\ a_1\end{pmatrix}\otimes\begin{pmatrix}b_0\\ b_1\end{pmatrix} = \begin{pmatrix}a_0 b_0\\ a_0 b_1\\ a_1 b_0\\ a_1 b_1\end{pmatrix}, \]

in the order 00, 01, 10, 11. The first factor is q₀. For example,

\[ |+\rangle\otimes|0\rangle = \frac{1}{\sqrt 2}\begin{pmatrix}1\\ 0\\ 1\\ 0\end{pmatrix} = \frac{|00\rangle + |10\rangle}{\sqrt 2}. \]

**H on q₀.** A gate on one qubit becomes a \(4\times 4\) matrix on the pair. H on q₀ is \(H\otimes I\), with the first factor for q₀:

\[ H\otimes I = \frac{1}{\sqrt 2}\begin{pmatrix}1&0&1&0\\ 0&1&0&1\\ 1&0&-1&0\\ 0&1&0&-1\end{pmatrix}. \]

Applied to \(|00\rangle = (1, 0, 0, 0)\), it gives \(\frac{1}{\sqrt 2}(1, 0, 1, 0)\), which is \(|+\rangle\otimes|0\rangle\) again. A circuit reads left to right, and a matrix product reads right to left, as on the previous page.

The explorer's matrix panel now shows this for each step you switch on.

</div>

<div class="qed-level" data-min-level="intermediate" markdown="1">

### CNOT as a matrix, the Bell state, and separability

In the order 00, 01, 10, 11, with q₀ as the control, CNOT is

\[ \mathrm{CNOT} = \begin{pmatrix}1&0&0&0\\ 0&1&0&0\\ 0&0&0&1\\ 0&0&1&0\end{pmatrix}. \]

On a general state, it exchanges the amplitudes of 10 and 11 and leaves 00 and 01 alone:

\[ \alpha|00\rangle + \beta|01\rangle + \gamma|10\rangle + \delta|11\rangle \;\longmapsto\; \alpha|00\rangle + \beta|01\rangle + \delta|10\rangle + \gamma|11\rangle . \]

**Deriving the Bell state.** Start from \(|00\rangle\). H on q₀ gives \(\frac{|00\rangle + |10\rangle}{\sqrt 2}\). CNOT exchanges the amplitudes of 10 and 11, so the \(|10\rangle\) term becomes \(|11\rangle\):

\[ \mathrm{CNOT}\,(H\otimes I)\,|00\rangle = \frac{|00\rangle + |11\rangle}{\sqrt 2}. \]

The matrices are written right to left: \(H\otimes I\) acts first.

**Separability.** A two-qubit state is a product of two one-qubit states exactly when

\[ \alpha\delta = \beta\gamma . \]

For a product, \(\alpha\delta = a_0b_0\,a_1b_1 = a_0b_1\,a_1b_0 = \beta\gamma\). The explorer now shows \(\alpha\delta - \beta\gamma\). Three worked cases:

- **The Bell state:** \(\alpha = \delta = 1/\sqrt 2\) and \(\beta = \gamma = 0\), so \(\alpha\delta = \tfrac12\) and \(\beta\gamma = 0\). They differ, so it is entangled.
- **\(|+\rangle\otimes|+\rangle\):** every amplitude is \(\tfrac12\), so \(\alpha\delta = \beta\gamma = \tfrac14\). It is a product.
- **The state with amplitudes \(\tfrac12, \tfrac12, \tfrac12, -\tfrac12\):** it gives 25% for every outcome, so it passes the product test of the probabilities, yet \(\alpha\delta = -\tfrac14\) and \(\beta\gamma = \tfrac14\). It is entangled. A table that matches the product does not by itself prove the qubits are independent.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Naming the formalism

Any pure state of two qubits can be written as a sum of at most two product terms, with weights called Schmidt coefficients: the **Schmidt decomposition**. Numbers such as the entanglement entropy turn those weights into a measure of how entangled a state is. And CNOT is one case of a general **controlled-U** gate, which applies any one-qubit gate U to the target when the control is 1. Later material makes these ideas precise.

</div>

## From Two Qubits to Circuits

Compare what you can do now with what is still hard.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>So far</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Describe two qubits by their joint outcomes</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Link them with CNOT</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Make the Bell state</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Still hard</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write the steps down in one place</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Read someone else's steps</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Trace what each step does</span></div>
    </div>
  </div>
</div>

Here are the Bell-state steps, drawn from the explorer:

<div class="qed-demo" id="mq-final"></div>

The steps are described in words and tables. We need a standard way to draw them that anyone can read.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Two qubits give four joint outcomes</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Independent qubits multiply their probabilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>CNOT flips the target if the control is 1, and H then CNOT gives the Bell state</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The product test fails, so it is not two independent qubits</span></div>
</div>

Two qubits have four joint outcomes. Independent qubits multiply their probabilities, and CNOT after H gives a pair whose outcomes do not, so entanglement is not two independent superpositions.

> **How can we write these steps down as a diagram?**

**Next: [Quantum Circuits →](quantum-circuits.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedQubit;
  var G = window.QedGates;
  var T = window.QedTwoQubit;
  var S = window.QedShots;
  var QL = window.QedLevel;
  var Z = window.QedQuiz;
  var C = window.QedCircuit;
  var EPS = 1e-9;
  var LABELS = S.defaultLabels(4); // ["00", "01", "10", "11"], the order used everywhere on this page

  function $(id) { return document.getElementById(id); }
  function pct(p) { return Math.round(p * 1000) / 10; }
  function num(x) {
    var t = Math.abs(x).toFixed(2).replace(/\.?0+$/, "");
    return (x < 0 && t !== "0" ? "−" : "") + t;
  }
  // one amplitude or matrix entry: 0, 1, −1, 0.71, i, −i, (0.5 + 0.5i)
  function cell(z) {
    if (Math.abs(z.im) < EPS) return num(z.re);
    var im = Math.abs(z.im);
    var imText = Math.abs(im - 1) < 1e-6 ? "i" : num(im) + "i";
    if (Math.abs(z.re) < EPS) return (z.im < 0 ? "−" : "") + imText;
    return "(" + num(z.re) + (z.im < 0 ? " − " : " + ") + imText + ")";
  }

  var PRESETS = Q.PRESETS;
  function preset(id) { return PRESETS.filter(function (p) { return p.id === id; })[0]; }
  var BEGINNER_INPUTS = ["zero", "one", "plus"];
  var H = G.gate("h");
  var I = G.gate("i");
  var HI = { name: "H on q₀", matrix: G.kron(H.matrix, I.matrix) };

  function probRows(p) {
    return LABELS.map(function (l, i) { return { label: l, fraction: p[i], text: pct(p[i]) + "%" }; });
  }
  function ownText(m) {
    return "q₀ alone: 0 with " + pct(m.q0[0]) + "%, 1 with " + pct(m.q0[1]) + "%. q₁ alone: 0 with " + pct(m.q1[0]) + "%, 1 with " + pct(m.q1[1]) + "%.";
  }

  // ---- the joint table with row and column totals ----------------------------------
  function jointTable(p, caption) {
    var m = { q0: [p[0] + p[1], p[2] + p[3]], q1: [p[0] + p[2], p[1] + p[3]] };
    function c(i) { return "<td>" + LABELS[i] + ": " + pct(p[i]) + "%</td>"; }
    return '<table class="qed-comparison-table qed-jointtable"><caption class="qed-stack__caption">' + caption + "</caption>" +
      '<thead><tr><th scope="col"></th><th scope="col">q₁ = 0</th><th scope="col">q₁ = 1</th><th scope="col">q₀ alone</th></tr></thead><tbody>' +
      '<tr><th scope="row">q₀ = 0</th>' + c(0) + c(1) + "<td>" + pct(m.q0[0]) + "%</td></tr>" +
      '<tr><th scope="row">q₀ = 1</th>' + c(2) + c(3) + "<td>" + pct(m.q0[1]) + "%</td></tr>" +
      '<tr><th scope="row">q₁ alone</th><td>' + pct(m.q1[0]) + "%</td><td>" + pct(m.q1[1]) + "%</td><td>100%</td></tr></tbody></table>";
  }

  // The product test: the actual table beside the table independent qubits would give.
  // It says a failure proves the qubits are not independent. It never claims
  // independence from a match.
  function testPanel(state) {
    var p = T.probabilities(state);
    var would = T.independentTable(T.marginals(state));
    var matches = T.passesProductTest(state);
    var verdict = matches
      ? "These match what independent qubits would give."
      : "These do not match what independent qubits would give, so the qubits are not independent.";
    // At Intermediate the amplitudes are on view, so say so when a match is not the whole story.
    if (matches && QL.atLeast("intermediate") && !T.isProduct(state)) {
      verdict += " But αδ − βγ is not zero, so the qubits are still entangled: a match does not prove independence.";
    }
    return '<div class="qed-twoq__tables">' +
      "<div>" + jointTable(p, "The actual joint table") + "</div>" +
      "<div>" + jointTable(would, "What independent qubits with the same own probabilities would give") + "</div>" +
      "</div>" +
      '<p class="qed-editor__validity ' + (matches ? "is-valid" : "is-invalid") + '">' + (matches ? "= " : "≠ ") + verdict + "</p>";
  }

  // ---- static pictures built from the shared modules -------------------------------
  function productOf(a, b) { return T.product(preset(a).state, preset(b).state); }
  function bellFromZeros() {
    return T.apply(G.CNOT, T.applyToQubit(H, 0, productOf("zero", "zero")));
  }

  function buildJoint() {
    $("mq-joint").innerHTML = jointTable(T.probabilities(productOf("plus", "zero")), "q₀ in |+⟩ and q₁ in |0⟩");
  }

  function buildProductRule() {
    function one(a, b, title) {
      var s = productOf(a, b);
      var m = T.marginals(s);
      var p = T.probabilities(s);
      var rows = LABELS.map(function (l, i) {
        var own0 = i < 2 ? m.q0[0] : m.q0[1];
        var own1 = i % 2 === 0 ? m.q1[0] : m.q1[1];
        return "<tr><th scope=\"row\">" + l + "</th><td>" + pct(own0) + "% × " + pct(own1) + "%</td><td>" + pct(p[i]) + "%</td></tr>";
      }).join("");
      return '<div><p><strong>' + title + "</strong></p>" +
        '<table class="qed-comparison-table"><thead><tr><th scope="col">Outcome</th><th scope="col">P(q₀) × P(q₁)</th><th scope="col">Joint</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    }
    $("mq-product-rule").innerHTML = '<div class="qed-twoq__tables">' + one("plus", "zero", "q₀ in |+⟩, q₁ in |0⟩") + one("plus", "plus", "q₀ in |+⟩, q₁ in |+⟩") + "</div>";
  }

  function buildCnot() {
    var svg = C.renderSVG({ qubits: ["q0", "q1"], ops: [{ type: "cx", control: 0, target: 1 }] }, {
      neutral: true,
      ariaLabel: "The CNOT symbol: a dot on q0 joined to a circled plus on q1"
    });
    var cases = [["zero", "zero"], ["zero", "one"], ["one", "zero"], ["one", "one"]];
    var rows = cases.map(function (cs) {
      var out = T.probabilities(T.apply(G.CNOT, productOf(cs[0], cs[1])));
      var name = LABELS[out.findIndex(function (x) { return Math.abs(x - 1) < EPS; })];
      var input = LABELS[cases.indexOf(cs)];
      var note = input.charAt(0) === "0" ? "control is 0, so nothing happens" : "control is 1, so the target flips";
      return "<tr><th scope=\"row\">" + input + "</th><td>" + name + "</td><td>" + note + "</td></tr>";
    }).join("");
    $("mq-cnot").innerHTML = '<div class="qed-twoq__tables"><div>' + svg + "</div><div>" +
      '<table class="qed-comparison-table"><thead><tr><th scope="col">Before</th><th scope="col">After</th><th scope="col">Why</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }

  function buildCompare() {
    $("mq-compare").innerHTML = '<div class="qed-twoq__tables"><div><p><strong>Both qubits start in |0⟩, then H on q₀, then CNOT</strong></p>' +
      testPanelFor(bellFromZeros()) + '</div><div><p><strong>Both qubits in |+⟩</strong></p>' + testPanelFor(productOf("plus", "plus")) + "</div></div>";
  }
  // the same panel, stacked for the narrow comparison columns
  function testPanelFor(state) {
    var p = T.probabilities(state);
    var would = T.independentTable(T.marginals(state));
    var matches = T.passesProductTest(state);
    return jointTable(p, "The actual joint table") + jointTable(would, "What independent qubits would give") +
      '<p class="qed-editor__validity ' + (matches ? "is-valid" : "is-invalid") + '">' + (matches ? "= These match what independent qubits would give." : "≠ These do not match what independent qubits would give, so the qubits are not independent.") + "</p>";
  }

  function buildFinal() {
    $("mq-final").innerHTML = C.renderSVG({
      qubits: ["q0", "q1"],
      ops: [{ type: "h", targets: [0] }, { type: "cx", control: 0, target: 1 }]
    }, { neutral: true, ariaLabel: "Circuit on two qubits: an H gate on q0, then a CNOT with control q0 and target q1." });
  }

  // ---- the explorer ----------------------------------------------------------------
  var in0 = "zero";
  var in1 = "zero";
  var useH = false;
  var useCnot = false;
  var showTest = false;
  var note = "";

  function steps() {
    var s0 = productOf(in0, in1);
    var out = { states: [s0], list: [] };
    if (useH) {
      out.list.push({ name: "H on q₀", matrix: HI.matrix, apply: function (s) { return T.applyToQubit(H, 0, s); } });
    }
    if (useCnot) {
      out.list.push({ name: "CNOT", matrix: G.CNOT.matrix, apply: function (s) { return T.apply(G.CNOT, s); } });
    }
    out.list.forEach(function (st) { out.states.push(st.apply(out.states[out.states.length - 1])); });
    return out;
  }

  function caption(sts) {
    var parts = [];
    if (useH) {
      var before = G.apply(H, preset(in0).state); // q0 after H, from its own start
      var nb = Q.nameOf(before);
      parts.push("H took q₀ from " + preset(in0).name + " to " + (nb ? nb.name : "a new state") + ".");
    }
    if (useCnot) parts.push("CNOT flipped q₁ on the part of the state where q₀ is 1.");
    var end = sts[sts.length - 1];
    if (!useH && !useCnot) {
      parts.push("No gate yet. The qubits are independent, so each joint probability is the product of the two own probabilities.");
    } else if (T.isProduct(end)) {
      parts.push("The qubits are still independent.");
    } else {
      var bell = T.bellOf(end);
      parts.push("The qubits are no longer independent" + (bell ? ": this is " + bell.name + "." : "."));
    }
    return parts.join(" ");
  }

  function matrixCols(entries, cols) {
    return '<span class="qed-matrix" style="grid-template-columns: repeat(' + cols + ', auto);">' +
      entries.map(function (e) { return "<span>" + e + "</span>"; }).join("") + "</span>";
  }
  function matrixLine(step, from, to) {
    var entries = [];
    step.matrix.forEach(function (row) { row.forEach(function (z) { entries.push(cell(z)); }); });
    var spoken = step.name + " times the column " + from.map(cell).join(", ") + " gives the column " + to.map(cell).join(", ") + ".";
    return '<div class="qed-matrixline" role="group" aria-label="' + spoken + '">' +
      matrixCols(entries, 4) + '<span aria-hidden="true">×</span>' + matrixCols(from.map(cell), 1) +
      '<span aria-hidden="true">=</span>' + matrixCols(to.map(cell), 1) + "</div>";
  }

  function render() {
    var sts = steps();
    var result = sts.states[sts.states.length - 1];
    var p = T.probabilities(result);
    var m = T.marginals(result);
    var inter = QL.atLeast("intermediate");

    // the steps
    $("mq-inputs").textContent = "q₀ starts in " + preset(in0).name + " and q₁ starts in " + preset(in1).name + ".";
    var ops = [];
    if (useH) ops.push({ type: "h", targets: [0] });
    if (useCnot) ops.push({ type: "cx", control: 0, target: 1 });
    var spokenOps = sts.list.map(function (s) { return s.name; });
    $("mq-circuit").innerHTML = C.renderSVG({ qubits: ["q0", "q1"], ops: ops }, {
      neutral: true,
      ariaLabel: spokenOps.length ? "Circuit on two qubits: " + spokenOps.join(", then ") + "." : "Circuit on two qubits with no gate yet."
    });

    // the joint outcomes, the amplitudes, and each qubit's own probabilities
    $("mq-bars").innerHTML = S.renderBars(probRows(p));
    $("mq-amps").textContent = "Amplitudes, for listing only: " + result.map(function (z, i) { return LABELS[i] + ": " + cell(z); }).join(" · ") + ".";
    $("mq-own").textContent = ownText(m);
    $("mq-caption").textContent = caption(sts.states);

    // controls
    function pressed(box, id) {
      Array.prototype.forEach.call($(box).querySelectorAll("button"), function (b) {
        var on = b.dataset.id === id;
        b.classList.toggle("qed-button--active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    pressed("mq-in0", in0);
    pressed("mq-in1", in1);
    [["mq-h", useH], ["mq-cnot", useCnot], ["mq-test", showTest]].forEach(function (x) {
      $(x[0]).classList.toggle("qed-button--active", x[1]);
      $(x[0]).setAttribute("aria-pressed", x[1] ? "true" : "false");
    });
    $("mq-test").textContent = showTest ? "Hide the product test" : "Show the product test";
    $("mq-note").textContent = note;

    // the product test panel
    $("mq-testpanel").hidden = !showTest;
    $("mq-testpanel").innerHTML = showTest ? testPanel(result) : "";

    // Intermediate readouts (additive: the Beginner view above never depends on them)
    $("mq-inter").hidden = !inter;
    $("mq-vector").textContent = "Four-component vector (00, 01, 10, 11): (" + result.map(cell).join(", ") + "). Written form: |ψ⟩ = " + T.format(result) + ".";
    var sep = T.separability(result);
    var sepText = Math.abs(sep.im) < EPS ? num(sep.re) : cell({ re: sep.re, im: sep.im });
    $("mq-sep").textContent = "αδ − βγ = " + sepText + ". " + (sep.modulus < 1e-9
      ? "Zero, so this is a product of two one-qubit states: the qubits are independent."
      : "Not zero, so this is not a product: the qubits are entangled.");
    var mh = "";
    sts.list.forEach(function (st, k) {
      mh += "<p class=\"qed-editor__details\">Step " + (k + 1) + ", " + st.name + ":</p>" + matrixLine(st, sts.states[k], sts.states[k + 1]);
    });
    $("mq-matrix").innerHTML = mh || "<p class=\"qed-editor__details\">Switch on a step to see its matrix act on the four amplitudes.</p>";

    // accessibility
    var verdict = "";
    if (showTest) verdict = T.passesProductTest(result) ? " Product test: these match what independent qubits would give." : " Product test: these do not match what independent qubits would give, so the qubits are not independent.";
    $("mq-summary").textContent = $("mq-inputs").textContent + " " + (spokenOps.length ? "Steps: " + spokenOps.join(", then ") + ". " : "No steps. ") +
      "Joint probabilities: " + T.describe(result) + " " + ownText(m) + " " + $("mq-caption").textContent + verdict + (note ? " " + note : "");
  }

  function buildControls() {
    function fill(boxId, setter) {
      var box = $(boxId);
      PRESETS.forEach(function (p) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "qed-button qed-button--secondary";
        b.textContent = p.name;
        b.dataset.id = p.id;
        b.setAttribute("aria-pressed", "false");
        if (BEGINNER_INPUTS.indexOf(p.id) < 0) b.dataset.level = "intermediate";
        b.addEventListener("click", function () { note = ""; setter(p.id); render(); });
        box.appendChild(b);
      });
    }
    fill("mq-in0", function (id) { in0 = id; });
    fill("mq-in1", function (id) { in1 = id; });
  }

  $("mq-h").addEventListener("click", function () { useH = !useH; note = ""; render(); });
  $("mq-cnot").addEventListener("click", function () { useCnot = !useCnot; note = ""; render(); });
  $("mq-test").addEventListener("click", function () { showTest = !showTest; note = ""; render(); });
  $("mq-reset").addEventListener("click", function () {
    in0 = "zero";
    in1 = "zero";
    useH = false;
    useCnot = false;
    showTest = false;
    note = "";
    var fb = $("mq-transfer-feedback");
    fb.textContent = "";
    fb.className = "qed-quiz__feedback";
    render();
  });

  // ---- level-aware behavior (additive) ---------------------------------------------
  function applyLevel() {
    var inter = QL.atLeast("intermediate");
    ["mq-in0", "mq-in1"].forEach(function (box) {
      Array.prototype.forEach.call($(box).querySelectorAll("button[data-level='intermediate']"), function (b) { b.hidden = !inter; });
    });
    if (!inter) {
      var msgs = [];
      if (BEGINNER_INPUTS.indexOf(in0) < 0) { in0 = "zero"; msgs.push("q₀"); }
      if (BEGINNER_INPUTS.indexOf(in1) < 0) { in1 = "zero"; msgs.push("q₁"); }
      if (msgs.length) note = "|−⟩, |+i⟩, and |−i⟩ belong to the Intermediate view, so " + msgs.join(" and ") + " went back to |0⟩.";
    }
    render();
  }
  QL.onChange(applyLevel);

  // ---- checks ----------------------------------------------------------------------
  Z.mount($("mq-quiz-predict"), {
    title: "Predict first. q₀ is in |+⟩, q₁ is in |0⟩, and you apply CNOT. Which joint probabilities do you expect?",
    items: [
      {
        prompt: "Choose the table.",
        label: "Joint probabilities after CNOT on q0 in plus and q1 in zero",
        options: [
          { label: "50% for 00 and 50% for 10", correct: false, why: "That is the table before CNOT: q₀ is an even mix and q₁ is 0. CNOT flips q₁ on the part where q₀ is 1, so the 10 part becomes 11." },
          { label: "25% for every outcome", correct: false, why: "That is what two independent qubits in |+⟩ give. Here q₁ starts in |0⟩, and CNOT links it to q₀." },
          { label: "50% for 00 and 50% for 11", correct: true, why: "The part with q₀ at 0 stays 00, and the part with q₀ at 1 has q₁ flipped, so 10 becomes 11. This is the Bell state, and the two qubits are now linked." },
          { label: "100% for 11", correct: false, why: "That would need q₀ to be certain 1. It is an even mix, so half of the state is the 00 part." }
        ]
      }
    ]
  }, {
    onAnswer: function () {
      var s = T.apply(G.CNOT, productOf("plus", "zero"));
      var box = $("mq-predict-bars");
      box.hidden = false;
      box.innerHTML = "<p><strong>After CNOT:</strong></p>" + S.renderBars(probRows(T.probabilities(s)));
    },
    onReset: function () { $("mq-predict-bars").hidden = true; }
  });

  Z.mount($("mq-quiz-indep"), {
    title: "Which joint tables could come from two independent qubits? Try each one.",
    items: [
      {
        prompt: "Pick a table, and check the feedback.",
        label: "Which joint table could come from two independent qubits",
        options: [
          { label: "00: 50%, 11: 50%", correct: false, why: "Each qubit alone is 50/50 here, so independent qubits would give 25% for every outcome. This table breaks the product rule, so it cannot come from independent qubits." },
          { label: "00: 25%, 01: 25%, 10: 25%, 11: 25%", correct: true, why: "Each qubit alone is 50/50, and 50% × 50% is 25% for every outcome. Two independent qubits in |+⟩ give exactly this." },
          { label: "01: 50%, 10: 50%", correct: false, why: "Each qubit alone is 50/50 here too, so independent qubits would give 25% for every outcome. This table breaks the product rule." },
          { label: "00: 50%, 10: 50%", correct: true, why: "q₀ alone is 50/50 and q₁ is certain 0, and 50% × 100% is 50%. This is q₀ in |+⟩ and q₁ in |0⟩, which are independent." }
        ]
      }
    ]
  });

  // Transfer task: reads the explorer's table.
  $("mq-transfer-check").addEventListener("click", function () {
    var fb = $("mq-transfer-feedback");
    var sts = steps();
    var p = T.probabilities(sts.states[sts.states.length - 1]);
    var ok = Math.abs(p[1] - 0.5) < 0.005 && Math.abs(p[2] - 0.5) < 0.005 && p[0] < 0.005 && p[3] < 0.005;
    var text;
    if (ok) {
      text = "Yes. 01 and 10 each happen 50% of the time, and 00 and 11 never do. One way is q₀ in |0⟩ and q₁ in |1⟩, then H on q₀, then CNOT. The outcomes are always opposite, and the product test fails here too: each qubit alone is 50/50, so independent qubits would give 25% for every outcome.";
    } else {
      text = "Not yet. Your table has " + LABELS.map(function (l, i) { return l + ": " + pct(p[i]) + "%"; }).join(", ") + ". Aim for 01 and 10 at 50% each. Try starting q₁ in |1⟩, and use both steps.";
    }
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
  });

  // ---- start -------------------------------------------------------------------------
  buildJoint();
  buildProductRule();
  buildCnot();
  buildCompare();
  buildFinal();
  buildControls();
  applyLevel();
});
</script>
