# Compilation and Transpilation

Software rewrites a program so a particular target can run it. The rewrite changes the form and keeps the meaning, and it can cost extra operations.

## From Forms to Transformation

On the [previous page](quantum-program-representations.md), the Bell computation took several forms.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem; flex-wrap:wrap;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Start</span><span>The Bell computation</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Several forms of it</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>A form says what to compute</span></div>
  </div>
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
  <p style="text-align:center; font-size:0.8rem;">The same example as before: prepare two qubits together (a Bell state), then measure both.</p>
</div>

> **If a form says what to compute, why can't a device just run it as written?**

Because a target allows only some operations. This page opens up the second responsibility from the [software stack](understanding-the-quantum-software-stack.md): adapting a program. Software **transforms** the form so the target can run it, and does not change what the program computes.

## Same Meaning, Different Form

Here is the Bell circuit twice. The second version is a rewrite of the first. The state each one prepares is named underneath.

<div class="qed-demo qed-forms qed-xf" id="ct-same"></div>

The form changed. The state did not. Two words describe this kind of work:

- **[Compilation](../glossary.md#compilation)** is the responsibility of turning a program into something a target can run.
- **[Transpilation](../glossary.md#transpilation)** is a circuit-to-circuit rewrite that keeps the circuit's meaning.

Tools use these two words in different ways. This page does not claim how any particular tool uses them.

!!! question "Did the rewrite change what the program computes?"
    No. It changed the form. The state it prepares is the same.

## Why a Target Cannot Always Run It As Written

A target is whatever will run the circuit. Every target has limits, and the limits belong to the target, not to the program. Two kinds show up on the Bell circuit.

<div class="qed-demo qed-forms qed-xf" id="ct-limits"></div>

- **The operations a target allows.** A target with no H cannot run the Bell circuit as written. The operations a device runs directly are its [native gate set](../glossary.md#native-gate-set).
- **Which way a two-qubit operation may point.** A target may allow a CNOT from q₁ to q₀ and not from q₀ to q₁.

Bigger devices have another kind of limit: not every pair of qubits is connected. This page stays with two qubits and does not show that.

The three targets on this page are small and **invented for this page**. They are not real devices and not any vendor's. Each is just a description: "this target allows these operations." Where such a description comes from is the next page's subject.

## Transformation Explorer

First, a prediction.

<div class="qed-demo" id="ct-quiz-predict"></div>

Now choose a target. The page rewrites the Bell circuit for it, lists the steps, counts the operations, and checks that the state is still the same.

<div class="qed-demo qed-forms qed-xf" id="ct-explorer">
  <p class="qed-demo__step"><strong>1. Choose a target</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Target" id="ct-target-btns"></div>
  <div class="qed-xf__target" id="ct-target"></div>
  <p class="qed-demo__step"><strong>2. Optionally, cancel pairs that undo themselves</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="ct-cancel" aria-pressed="false">Cancel pairs that undo themselves</button>
    <button type="button" class="qed-button qed-button--secondary" id="ct-reset">Reset</button>
  </div>
  <div id="ct-out"></div>
  <p class="qed-forms__note" id="ct-live" role="status" aria-live="polite"></p>
</div>

Two kinds of rewrite appear. Rewriting a gate as a sequence of other gates is called [gate decomposition](../glossary.md#gate-decomposition): on the Rotations target, H becomes three turns. Turning a CNOT round is a rewrite of the direction. The toggle adds a third, [circuit optimization](../glossary.md#circuit-optimization) at its smallest.

The target and the toggle are what you choose. The adapted circuit and its steps follow from them. The counts and the check are what you observe. They sit in separate places. Compilation rewrites a program. Running it is a separate responsibility.

<div class="qed-demo" id="ct-quiz-same"></div>

<div class="qed-demo" id="ct-quiz-cancel"></div>

## What Adapting Costs

The table below is computed from the same model as the explorer. Nothing in it is typed in.

<div class="qed-demo qed-xf" id="ct-table"></div>

The Open target needs nothing. The other two need more operations than the circuit had as written, because a single operation became several. Cancelling pairs that undo themselves can win some of them back.

<div class="qed-demo" id="ct-quiz-most"></div>

Adapting costs operations. On a real device, some operations may cost more than others. How software learns which ones is the next page's question.

## A Valid Transformation Keeps the Meaning

The explorer's check shows the name of the state and the outcomes before and after. A valid rewrite changes the form and not what the program computes. Real tools rely on rewrite rules that are known to be valid. The check on this page is a demonstration of the idea, not how real tools know a rewrite is valid.

Compare a valid rewrite with one that changes the computation.

<div class="qed-demo qed-forms qed-xf" id="ct-valid"></div>

Some tools also make changes that are approximate. This page does not cover those.

## Fewer Operations Is Not the Only Goal

Cancelling made the circuit shorter, and that is not always the whole story. Three goals can pull in different directions:

- fewer operations
- fewer two-qubit operations
- a shorter circuit

Which one matters depends on the target. Trying harder to optimize also takes time. A shorter circuit is not automatically the best one for every target.

## Compilation Is Not Execution, a Backend, or a Runtime

These words get mixed up. The [software stack](understanding-the-quantum-software-stack.md) gave each its own responsibility.

<div class="qed-demo qed-xf" id="ct-contrast"></div>

The rewrite is not the run, and a target's list of what it allows is not the rewrite.

## From Transformation to Targets

Here are the three targets once more, each with its list of what it allows.

<div class="qed-demo qed-xf" id="ct-targets"></div>

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Previously</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>A form says what to compute</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Software rewrites it for a target</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Now</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>The rewrite depends on the target's list</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>But where does that list come from?</span></div>
    </div>
  </div>
</div>

> **Where does a target's list of what it allows come from, and could it change?**

Software needs a description of each target, and a device is tuned over time. That is the next problem.

## Takeaway

Software rewrites a program so a particular target can run it. A valid rewrite changes the form and keeps the meaning, it can cost extra operations, and different targets need different rewrites.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A form says what to compute</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A target allows only some operations</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Software rewrites for the target, keeping the meaning</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Adapting costs operations, and sometimes some can be won back</span></div>
</div>

Program → target's limits → rewrite → same meaning, different form, counted cost.

> **Where does a target's list of what it allows come from, and could it change?**

**[Next: Hardware Abstraction and Backend Capabilities →](hardware-abstraction-and-backend-capabilities.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var PF = window.QedProgramForms;
  var TR = window.QedTrace;
  var XF = window.QedTransform;
  var SH = window.QedShots;
  var SS = window.QedSoftwareStack;
  var Z = window.QedQuiz;
  var N = window.QedNumbers;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  var bell = PF.bell();
  var target = XF.targetById;

  // The recurring circuit, drawn from data, as on the previous pages.
  Array.prototype.forEach.call(document.querySelectorAll("[data-qed-circuit]"), function (el) {
    el.innerHTML = QC.renderSVG(bell);
  });

  // ---- pieces used by several sections --------------------------------------------------
  function labelsFor(ids, text) {
    var out = {};
    ids.forEach(function (id) { out[id] = text; });
    return out;
  }

  function tagsFor(ids, text) { return labelsFor(ids, text); }

  // The circuit as a picture and as an instruction list, with the ops in `marked` carrying
  // a dashed outline and the text `word` (empty when nothing is marked).
  function circuitHTML(circuit, marked, word, label) {
    var svg = QC.renderSVG(circuit, { highlight: marked, highlightLabels: labelsFor(marked, word), ariaLabel: label });
    var list = PF.instructionListHTML(circuit, { interactive: false, tags: tagsFor(marked, word), ariaLabel: label + ", instruction list" });
    return svg + list;
  }

  function probabilityRows(circuit) {
    var p = TR.run(circuit).final.probabilities;
    return p.map(function (x, i) { return { label: ["00", "01", "10", "11"][i], fraction: x, text: N.pct(x) }; });
  }

  // What the circuit prepares: the name of the state, and the chance of each outcome.
  function stateHTML(circuit) {
    return '<p><strong>' + esc(TR.run(circuit).final.name.text) + '</strong></p>' + SH.renderBars(probabilityRows(circuit));
  }

  function card(title, body, note, wide) {
    return '<div class="qed-forms__card' + (wide ? " qed-forms__card--wide" : "") + '"><p class="qed-forms__title">' + title + "</p>" + body +
      (note ? '<p class="qed-forms__note">' + note + "</p>" : "") + "</div>";
  }

  // ---- Same meaning, different form ------------------------------------------------------
  var rotations = XF.transform(bell, target("rotations"));
  $("ct-same").innerHTML = '<div class="qed-forms__cards">' +
    card("Before: the Bell circuit", circuitHTML(bell, [], "", "Before") + stateHTML(bell)) +
    card("After: rewritten for the " + target("rotations").name + " target", circuitHTML(rotations.adapted, rotations.changesAdapted.added, "added", "After") + stateHTML(rotations.adapted),
      "Invented target. It has no H, so H became three turns.") +
    "</div>";

  // ---- The two limits ------------------------------------------------------------------------
  function limitCard(title, t) {
    var r = XF.transform(bell, t);
    var bad = r.changesAdapted.removed;
    return card(title,
      '<p><strong>' + esc(t.name) + "</strong> (invented for this page): " + esc(t.description) + "</p>" +
      circuitHTML(bell, bad, "not allowed", "Bell circuit; the operation this target does not allow is marked"),
      "The marked operation cannot run on this target as written.");
  }
  $("ct-limits").innerHTML = '<div class="qed-forms__cards">' +
    limitCard("Limit 1: the operations a target allows", target("rotations")) +
    limitCard("Limit 2: which way a two-qubit operation may point", target("one-way")) +
    "</div>";

  // ---- The explorer -----------------------------------------------------------------------------
  var DEFAULT = { target: "open", cancel: false };
  var view = { target: DEFAULT.target, cancel: DEFAULT.cancel };

  $("ct-target-btns").innerHTML = XF.TARGETS.map(function (t) {
    return '<button type="button" class="qed-button qed-button--secondary" data-target="' + esc(t.id) + '" aria-pressed="false">' + esc(t.name) + "</button>";
  }).join("");

  function countRow(label, a, b) {
    return "<tr><th scope=\"row\">" + label + "</th><td>" + a + "</td><td>" + b + "</td></tr>";
  }

  function checkCard(title, circuit, other) {
    var same = TR.sameState(bell, circuit);
    return '<div class="qed-xf__check-card"><p class="qed-forms__title">' + title + "</p>" + stateHTML(circuit) +
      (other === undefined ? "" : '<p class="qed-xf__verdict">' + (same ? "Same state as the original." : "Not the same state as the original.") + "</p>") + "</div>";
  }

  function render() {
    var t = target(view.target);
    var r = XF.transform(bell, t);
    var shown = view.cancel ? r.optimized : r.adapted;
    var change = view.cancel ? r.changesOptimized : r.changesAdapted;
    var steps = r.adaptSteps.concat(view.cancel ? r.optimizeSteps : []);
    var c0 = r.costs.original;
    var c1 = view.cancel ? r.costs.optimized : r.costs.adapted;

    Array.prototype.forEach.call($("ct-target-btns").querySelectorAll("button"), function (b) {
      var on = b.getAttribute("data-target") === view.target;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $("ct-cancel").classList.toggle("qed-button--active", view.cancel);
    $("ct-cancel").setAttribute("aria-pressed", view.cancel ? "true" : "false");

    $("ct-target").innerHTML = '<p><span class="qed-xf__target-name">' + esc(t.name) + '</span> <span class="qed-forms__badge">invented for this page</span></p>' +
      "<p>" + esc(t.description) + "</p>";

    var stepsHTML;
    if (steps.length) {
      stepsHTML = '<ol class="qed-xf__steps">' + steps.map(function (s) { return "<li>" + esc(s.text) + "</li>"; }).join("") + "</ol>";
    } else {
      stepsHTML = '<p class="qed-xf__none">' + (view.cancel ? "Nothing to rewrite and nothing to cancel: this target allows everything in the circuit." : "Nothing to rewrite: this target allows everything in the circuit.") + "</p>";
    }
    if (view.cancel && steps.length && !r.optimizeSteps.length) {
      stepsHTML += '<p class="qed-xf__none">Nothing to cancel: no pair of operations undoes itself here.</p>';
    }
    if (!r.ok) {
      stepsHTML += '<p class="qed-xf__none">' + r.problems.map(esc).join(" ") + "</p>";
    }

    var extra = c1.operations - c0.operations;
    var countsHTML = '<table class="qed-xf__counts"><thead><tr><th scope="col"></th><th scope="col">As written</th><th scope="col">' + (view.cancel ? "After adapting and cancelling" : "After adapting") + "</th></tr></thead><tbody>" +
      countRow("Operations", c0.operations, c1.operations) +
      countRow("Two-qubit operations", c0.twoQubit, c1.twoQubit) +
      countRow("Measurements (never change)", c0.measurements, c1.measurements) +
      "</tbody></table>" +
      '<p class="qed-forms__note">' + (extra > 0 ? "Adapting added " + extra + " operation" + (extra === 1 ? "" : "s") + "." : extra < 0 ? "The circuit ended up " + (-extra) + " operation" + (extra === -1 ? "" : "s") + " shorter." : "The number of operations did not change.") + "</p>";

    $("ct-out").innerHTML =
      '<div class="qed-forms__cards">' +
      card("Original", circuitHTML(bell, change.removed, "removed", "Original circuit"), "Marked: what the rewrite took out.", true) +
      card("Adapted for this target", circuitHTML(shown, change.added, "added", "Adapted circuit"), "Marked: what the rewrite put in.", true) +
      card("Steps taken", stepsHTML, "", true) +
      card("Counts", countsHTML, "", true) +
      "</div>" +
      '<p class="qed-forms__title">The check: is it still the same state?</p>' +
      '<div class="qed-xf__check">' + checkCard("Before", bell) + checkCard("After", shown, true) + "</div>" +
      '<p class="qed-forms__note">A demonstration of the idea. Real tools rely on rewrite rules known to be valid.</p>';

    $("ct-live").textContent = t.name + " target. " + c0.operations + " operations as written, " + c1.operations + " after " + (view.cancel ? "adapting and cancelling" : "adapting") + ". " +
      (TR.sameState(bell, shown) ? "The check agrees: the state is the same." : "The check disagrees: the state changed.");
  }

  Array.prototype.forEach.call($("ct-target-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.target = b.getAttribute("data-target"); render(); });
  });
  $("ct-cancel").addEventListener("click", function () { view.cancel = !view.cancel; render(); });
  $("ct-reset").addEventListener("click", function () { view = { target: DEFAULT.target, cancel: DEFAULT.cancel }; render(); });
  render();

  // ---- The cost table (from the same model) ------------------------------------------------------
  var rowsData = XF.TARGETS.map(function (t) { return XF.transform(bell, t); });
  var mostExtra = rowsData.reduce(function (m, r) { return Math.max(m, r.costs.adapted.operations - r.costs.original.operations); }, 0);
  $("ct-table").innerHTML = '<table class="qed-xf__table"><thead><tr><th scope="col">Target</th><th scope="col">Operations as written</th><th scope="col">After adapting</th><th scope="col">After cancelling pairs</th><th scope="col">Two-qubit operations</th></tr></thead><tbody>' +
    rowsData.map(function (r) {
      var more = r.costs.adapted.operations - r.costs.original.operations === mostExtra && mostExtra > 0;
      return "<tr><th scope=\"row\">" + esc(r.target.name) + "</th>" +
        '<td data-label="Operations as written">' + r.costs.original.operations + "</td>" +
        '<td data-label="After adapting"' + (more ? ' class="is-more"' : "") + ">" + r.costs.adapted.operations + (more ? " (most extra)" : "") + "</td>" +
        '<td data-label="After cancelling pairs">' + r.costs.optimized.operations + "</td>" +
        '<td data-label="Two-qubit operations">' + r.costs.optimized.twoQubit + "</td></tr>";
    }).join("") + "</tbody></table>" +
    '<p class="qed-forms__note">Measurements are not counted: there are always ' + rowsData[0].costs.original.measurements + ", and no rewrite changes them.</p>";

  // ---- Valid or not -----------------------------------------------------------------------------------
  var wrong = {
    qubits: bell.qubits,
    ops: bell.ops.map(function (op) {
      return op.id === "h1" ? { id: "h1", type: "gate", gateId: "x", label: "X", name: "X", targets: [0], col: 0 } : op;
    })
  };
  function validCard(title, circuit, markedIds, word) {
    var same = TR.sameState(bell, circuit);
    return card(title, circuitHTML(circuit, markedIds, word, title) + stateHTML(circuit) + '<p class="qed-xf__verdict">' + (same ? "Same state as the original: a valid rewrite." : "Not the same state as the original: this changed the computation.") + "</p>");
  }
  $("ct-valid").innerHTML = '<div class="qed-forms__cards">' +
    validCard("A valid rewrite", rotations.adapted, rotations.changesAdapted.added, "added") +
    validCard("A rewrite that changes the computation (H replaced by X)", wrong, ["h1"], "replaced") +
    "</div>";

  // ---- Contrast block (the 05.01 responsibilities) -------------------------------------------------------
  function role(id) { return SS.RESPONSIBILITIES.filter(function (r) { return r.id === id; })[0].role; }
  $("ct-contrast").innerHTML = '<dl>' +
    "<dt><strong>Compilation</strong></dt><dd>" + esc(role("compilation")) + "</dd>" +
    "<dt><strong>Backend or target description</strong></dt><dd>" + esc(role("backend")) + " It is not another form of the program.</dd>" +
    "<dt><strong>Runtime</strong></dt><dd>" + esc(role("runtime")) + "</dd>" +
    "<dt><strong>Execution</strong></dt><dd>" + esc(role("target")) + "</dd></dl>";

  // ---- The three targets, again ----------------------------------------------------------------------------
  $("ct-targets").innerHTML = '<div class="qed-forms__cards">' + XF.TARGETS.map(function (t) {
    return '<div class="qed-xf__target"><p><span class="qed-xf__target-name">' + esc(t.name) + '</span> <span class="qed-forms__badge">invented for this page</span></p><p>' + esc(t.description) + "</p></div>";
  }).join("") + "</div>";

  // ---- Checks ---------------------------------------------------------------------------------------------------
  var rotCosts = rotations.costs;
  var needed = rotCosts.adapted.operations;
  var oneWay = XF.transform(bell, target("one-way"));
  var saved = oneWay.costs.adapted.operations - oneWay.costs.optimized.operations;

  Z.mount($("ct-quiz-predict"), { title: "Prediction", items: [{
    label: "How many operations the Bell circuit needs on a target with no H",
    prompt: "A target has no H. How many operations will the Bell circuit need there, not counting measurements? Pick one, then try the Rotations target below.",
    options: [2, 3, 4, 6].map(function (n) {
      return {
        label: String(n),
        correct: n === needed,
        why: n === needed
          ? "The H becomes three turns, and the CNOT stays: " + needed + " operations. Try the Rotations target to see them."
          : n < needed ? "The circuit starts with 2, and the H has to be replaced by a sequence of other operations, so it grows." : "The CNOT stays as it is on this target, and only the H is replaced."
      };
    })
  }] });

  Z.mount($("ct-quiz-same"), { title: "Check", items: [{
    label: "What stays the same when a circuit is rewritten for a target",
    prompt: "A circuit is rewritten for a target. What must stay the same?",
    options: [
      { label: "The number of operations", correct: false, why: "The count often changes. The One-way CNOT target went from 2 operations to 6." },
      { label: "The picture of the circuit", correct: false, why: "The form always changes, even if only a little. A rewrite that left the form alone would not be a rewrite." },
      { label: "What the circuit computes", correct: true, why: "A valid rewrite changes the form and keeps the meaning, so the state it prepares is the same." },
      { label: "The target", correct: false, why: "The rewrite depends on the target. A different target can need a different rewrite." }
    ]
  }] });

  Z.mount($("ct-quiz-cancel"), { title: "Transfer", items: [{
    label: "Why cancelling saved operations on the One-way CNOT target",
    prompt: "Choose the One-way CNOT target and turn on cancelling. Cancelling saved " + saved + " operations. Why?",
    options: [
      { label: "Two H in a row on q₀ undo each other, so both can go", correct: true, why: "The original H and the first H the rewrite added sit next to each other on q₀. Together they do nothing." },
      { label: "The CNOT was not needed", correct: false, why: "The CNOT is still there, pointing the way the target allows. Without it the state would not be the Bell state." },
      { label: "The measurements were removed", correct: false, why: "Measurements are never changed by a rewrite, and the counts show them separately." },
      { label: "The target ignores H", correct: false, why: "This target allows H. The H operations are removed because two in a row cancel, not because the target ignores them." }
    ]
  }] });

  Z.mount($("ct-quiz-most"), { title: "Check", items: [{
    label: "Which target needed the most extra operations",
    prompt: "Which target needed the most extra operations after adapting?",
    options: rowsData.map(function (r) {
      var extra = r.costs.adapted.operations - r.costs.original.operations;
      return {
        label: r.target.name,
        correct: extra === mostExtra,
        why: extra === mostExtra
          ? r.target.name + " added " + extra + " operations: its limit forced the most rewriting."
          : r.target.name + " added " + extra + " operation" + (extra === 1 ? "" : "s") + ", which is not the most."
      };
    })
  }] });
});
</script>
