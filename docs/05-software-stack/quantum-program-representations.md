# Quantum Program Representations

One computation can be written down in several forms. Each form is good for a different job.

## What Does a Program Look Like After It Leaves the Code We Wrote?

On the [previous page](understanding-the-quantum-software-stack.md), a program travelled through several software responsibilities on its way to results.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem; flex-wrap:wrap;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">First</span><span>Describe</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Adapt</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Check the target</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Coordinate</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Execute</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span>Return results</span></div>
  </div>
  <div class="qed-stack__circuit" data-qed-circuit="bell"></div>
  <p style="text-align:center; font-size:0.8rem;">The same example as before: prepare two qubits together (a Bell state), then measure both.</p>
</div>

> **What does a quantum program look like after it leaves the code we wrote?**

This page opens up the first responsibility, describing a computation. The answer is that the program stops being one thing. Software describes the same computation in several **forms**, and different responsibilities work with different ones.

## One Computation, Several Forms

Here is the Bell computation in three forms. They are teaching forms, not real file formats and not any vendor's syntax.

<div class="qed-demo qed-forms" id="qpr-static"></div>

All three describe the same computation. None is "the real one" with the others as copies.

!!! question "Which one is the program?"
    All of them describe it. The program is the computation. The forms are ways of writing it down.

## What Each Form Is Good For, and What It Hides

Every form emphasizes something and hides something else.

| Form | Good for | What it hides |
|---|---|---|
| **Circuit diagram** | Easy for people to read; shows the structure at a glance. | The order a piece of software would process it in. |
| **Ordered instruction list** | Easy for software to read one step at a time, and to store and pass along. | Which order matters and which does not. |
| **Dependency graph** | Makes the ordering constraints explicit. | How a person would read the circuit. |

No form is better in general. Each fits a job.

## Representation Viewer

Choose a form and a stage of the stack. Then select an operation, such as the CNOT, and find it in every form at once.

<div class="qed-demo qed-forms" id="qpr-viewer">
  <p class="qed-demo__step"><strong>1. Choose a form</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Form" id="qpr-form-btns">
    <button type="button" class="qed-button qed-button--secondary" data-form="diagram" aria-pressed="false">Circuit diagram</button>
    <button type="button" class="qed-button qed-button--secondary" data-form="list" aria-pressed="false">Instruction list</button>
    <button type="button" class="qed-button qed-button--secondary" data-form="graph" aria-pressed="false">Dependency graph</button>
  </div>
  <p class="qed-demo__step"><strong>2. Choose a stage of the stack</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Stage of the stack" id="qpr-stage-btns">
    <button type="button" class="qed-button qed-button--secondary" data-stage="writing" aria-pressed="false">The person writing the program</button>
    <button type="button" class="qed-button qed-button--secondary" data-stage="transform" aria-pressed="false">Transformation software</button>
    <button type="button" class="qed-button qed-button--secondary" data-stage="job" aria-pressed="false">A job sent to a target</button>
  </div>
  <p class="qed-demo__step"><strong>3. Select an operation</strong> in the instruction list or the dependency graph</p>
  <div id="qpr-cards"></div>
  <div class="qed-stack__panel" id="qpr-panel"></div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="qpr-reset">Reset</button>
  </div>
</div>

The choices, the three renderings, and the highlighted match each sit in their own place. Which stage uses which form is illustrative, and real systems differ.

## Source Representation and Downstream Forms

Two terms help tell these forms apart:

- A **source representation** is what a person writes in a tool. Here it is shown as made-up pseudo-code, not any real SDK.
- An **[intermediate representation](../glossary.md#intermediate-representation)** is a form between what you write and what a target runs. It is still a description of the computation.

<div class="qed-demo qed-forms" id="qpr-source"></div>

The source form belongs to the user program. The intermediate forms belong to the responsibilities that pass the computation along: the [program representation](../glossary.md#program-representation) and [compilation](../glossary.md#compilation).

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>What a person writes</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Forms software passes between responsibilities</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>What a target runs</span></div>
</div>

The backend or target description is a different kind of description. It says what a target can do, not what the program is. Forms closer to the device also exist. They are not covered here.

## Same Computation, or Not?

> **If the forms look so different, how do we know they describe the same computation?**

They have the same operations, on the same qubits, with the same required order and the same measurements. It works the other way too: two forms that look alike can differ in one operation, and then they describe different computations.

Try it. Each pair shows two instruction lists. Select the line in version B that differs from version A, or say that no difference matters.

<div class="qed-demo qed-forms" id="qpr-spot">
  <p class="qed-demo__step" id="qpr-spot-title"></p>
  <div class="qed-forms__pair">
    <div class="qed-forms__card"><p class="qed-forms__title">Version A</p><div id="qpr-spot-a"></div></div>
    <div class="qed-forms__card"><p class="qed-forms__title">Version B</p><div id="qpr-spot-b"></div></div>
  </div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="qpr-spot-same">No difference that matters</button>
    <button type="button" class="qed-button" id="qpr-spot-next">Next pair</button>
  </div>
  <p class="qed-quiz__feedback" id="qpr-spot-feedback" aria-live="polite"></p>
</div>

Looking similar does not mean being the same, and looking different does not mean being different.

## A Representation Is Not a Language, an SDK, or a State

Three things are easy to mix up.

**Programming language or SDK**
:   Something a person uses to produce a representation.

**Representation**
:   A description of the computation, in some form.

**What the computation means**
:   The state it prepares. This is separate again, and it is not a form of the program.

The Bell diagram describes what to do. The state is what doing it produces. As on the previous page, the circuit is an instruction, not a physical quantum state.

## From Representations to Transformation

Look at the computation once more, in its three forms.

<div class="qed-demo qed-forms" id="qpr-final"></div>

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Previously</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write a program</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Software describes it in several forms</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Now</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>A form says what to compute</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>But a target can only do certain things</span></div>
    </div>
  </div>
</div>

> **If a form says what to compute, why can't a device just run it as written?**

Targets differ in what they can do. A form that is fine for describing a computation may not be something a particular target can run directly, so software has to transform forms. That is the next problem.

## Takeaway

A quantum program can be described in several forms, each good for a different job. They describe the same computation, and that is why software can move a program between responsibilities.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Source form</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Other forms of the same computation</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Each responsibility uses the form it needs</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A form says what to compute, not yet how a target does it</span></div>
</div>

Computation → several forms → the same operations found in each, with the same required order.

> **If a form says what to compute, why can't a device just run it as written?**

**[Next: Compilation and Transpilation →](compilation-and-transpilation.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var QC = window.QedCircuit;
  var PF = window.QedProgramForms;
  var SS = window.QedSoftwareStack;

  function $(id) { return document.getElementById(id); }
  var bell = PF.bell();

  // The recurring circuit, drawn from data, as on the previous page.
  Array.prototype.forEach.call(document.querySelectorAll("[data-qed-circuit]"), function (el) {
    el.innerHTML = QC.renderSVG(bell);
  });

  // ---- the three forms, as cards ---------------------------------------------------------
  var FORMS = {
    diagram: {
      title: "Circuit diagram",
      good: "Easy for people to read; shows the structure at a glance.",
      hides: "The order a piece of software would process it in.",
      note: "Read left to right. Operations in the same step do not depend on each other."
    },
    list: {
      title: "Ordered instruction list",
      good: "Easy for software to read one step at a time, and to store and pass along.",
      hides: "Which order matters and which does not.",
      note: "One operation per line, in the order software would take them."
    },
    graph: {
      title: "Dependency graph",
      good: "Makes the ordering constraints explicit.",
      hides: "How a person would read the circuit.",
      note: "An arrow from one box to another means the first must come before the second."
    }
  };

  // opts: { interactive, selectedForm, selectedOp, prefix }
  function cardsHTML(opts) {
    var inter = opts.interactive;
    var op = opts.selectedOp || undefined;
    function card(id, wide, body) {
      var on = inter && opts.selectedForm === id;
      return '<div class="qed-forms__card' + (wide ? " qed-forms__card--wide" : "") + (on ? " is-selected" : "") + '" data-card="' + id + '">' +
        '<p class="qed-forms__title">' + FORMS[id].title + (on ? '<span class="qed-forms__badge">Selected form</span>' : "") + "</p>" +
        body + '<p class="qed-forms__note">' + FORMS[id].note + "</p></div>";
    }
    var diagram = QC.renderSVG(bell, {
      highlight: inter ? (op ? [op] : []) : undefined,
      ariaLabel: QC.describe(bell)
    });
    var list = PF.instructionListHTML(bell, { selected: op, interactive: inter });
    var graph = PF.dependencyGraphSVG(bell, { selected: op, interactive: inter, idPrefix: opts.prefix }) +
      '<p class="qed-forms__note"><strong>The same graph in words:</strong></p>' + PF.dependencyTextHTML(bell);
    return '<div class="qed-forms__cards">' + card("diagram", false, diagram) + card("list", false, list) + card("graph", true, graph) + "</div>";
  }

  $("qpr-static").innerHTML = cardsHTML({ interactive: false, prefix: "qpr-static" });
  $("qpr-final").innerHTML = cardsHTML({ interactive: false, prefix: "qpr-final" });
  $("qpr-source").innerHTML = '<div class="qed-forms__card"><p class="qed-forms__title">Source form <span class="qed-forms__badge">illustrative pseudo-code</span></p>' +
    PF.sourceFormHTML(bell) + '<p class="qed-forms__note">Made up for this page. It is not any SDK\'s syntax.</p></div>';

  // ---- the representation viewer ----------------------------------------------------------
  function responsibility(id) {
    return SS.RESPONSIBILITIES.filter(function (r) { return r.id === id; })[0];
  }

  var STAGES = {
    writing: { label: "The person writing the program", resp: "program" },
    transform: { label: "Transformation software", resp: "compilation" },
    job: { label: "A job sent to a target", resp: "runtime" }
  };

  // Which form a stage tends to work with. Hedged on purpose: real systems differ.
  var FIT = {
    writing: {
      diagram: "A person often thinks in this form and may sketch it. What they actually write is the source form, and the tool derives other forms from it.",
      list: "People seldom write this form by hand, but the tool they use may produce one behind the scenes.",
      graph: "A person seldom works with this form. It is mostly something software works out."
    },
    transform: {
      diagram: "Software does not work from the picture. It needs the operations and their order in a form it can process.",
      list: "A transformation tool may take the operations one at a time, in order.",
      graph: "A tool may use the ordering constraints to see which operations depend on which."
    },
    job: {
      diagram: "A job is not a picture. It travels in a form that software can pass along.",
      list: "A job may carry the computation as an ordered list of instructions that a target can read step by step.",
      graph: "A target may not need the graph itself once the order is settled in a list."
    }
  };

  var DEFAULT = { form: "diagram", stage: "writing", op: null };
  var view = { form: DEFAULT.form, stage: DEFAULT.stage, op: DEFAULT.op };

  function panelHTML() {
    var f = FORMS[view.form];
    var st = STAGES[view.stage];
    var r = responsibility(st.resp);
    var html = '<p><span class="qed-stack__field">This form is good for</span><span>' + f.good + "</span></p>" +
      '<p><span class="qed-stack__field">It hides</span><span>' + f.hides + "</span></p>" +
      '<p><span class="qed-stack__field">At this stage</span><span><strong>' + r.label + "</strong>: " + FIT[view.stage][view.form] + "</span></p>" +
      '<p class="qed-stack__note">Illustrative. Which stage uses which form differs between real systems.</p>';
    var match = view.op
      ? PF.correspondenceText(bell, view.op)
      : "No operation selected. Select one in the instruction list or the dependency graph to find it in every form.";
    html += '<p role="status"><span class="qed-stack__field">Selected operation</span><span>' + match + "</span></p>";
    if (view.stage === "writing") {
      html += '<p class="qed-stack__note">What a person might write at this stage (illustrative pseudo-code):</p>' + PF.sourceFormHTML(bell);
    }
    return html;
  }

  function setPressed(root, test) {
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (b) {
      var on = test(b);
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function renderViewer() {
    // keep keyboard focus on the same operation in the same form after the cards are rebuilt
    var active = document.activeElement;
    var keep = null;
    if (active && $("qpr-cards").contains(active) && active.getAttribute("data-op")) {
      var cardEl = active.closest("[data-card]");
      keep = { card: cardEl ? cardEl.getAttribute("data-card") : null, op: active.getAttribute("data-op") };
    }
    setPressed($("qpr-form-btns"), function (b) { return b.getAttribute("data-form") === view.form; });
    setPressed($("qpr-stage-btns"), function (b) { return b.getAttribute("data-stage") === view.stage; });
    $("qpr-cards").innerHTML = cardsHTML({ interactive: true, selectedForm: view.form, selectedOp: view.op, prefix: "qpr-viewer" });
    $("qpr-panel").innerHTML = panelHTML();
    if (keep && keep.card) {
      var again = $("qpr-cards").querySelector('[data-card="' + keep.card + '"] [data-op="' + keep.op + '"]');
      if (again) again.focus();
    }
  }

  function selectOp(id) {
    view.op = view.op === id ? null : id;
    renderViewer();
  }

  $("qpr-cards").addEventListener("click", function (e) {
    var el = e.target.closest("[data-op]");
    if (el) selectOp(el.getAttribute("data-op"));
  });
  $("qpr-cards").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest("g[data-op]");
    if (!el) return;
    e.preventDefault();
    selectOp(el.getAttribute("data-op"));
  });
  Array.prototype.forEach.call($("qpr-form-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.form = b.getAttribute("data-form"); renderViewer(); });
  });
  Array.prototype.forEach.call($("qpr-stage-btns").querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { view.stage = b.getAttribute("data-stage"); renderViewer(); });
  });
  $("qpr-reset").addEventListener("click", function () {
    view = { form: DEFAULT.form, stage: DEFAULT.stage, op: DEFAULT.op };
    renderViewer();
  });
  renderViewer();

  // ---- same computation, or not? (optional check) ------------------------------------------
  function op(id, type, extra) { return Object.assign({ id: id, type: type }, extra); }
  function version(ops) { return { qubits: ["q0", "q1"], ops: ops }; }
  var H = function (col) { return op("h1", "h", { targets: [0], col: col }); };
  var CX = function (c, t, col) { return op("cx1", "cx", { control: c, target: t, col: col }); };
  var M = function (id, w, col) { return op(id, "measure", { targets: [w], col: col }); };
  var X = function (col) { return op("x1", "gate", { label: "X", targets: [0], col: col }); };

  var PAIRS = [
    { a: bell, b: version([H(0), CX(1, 0, 1), M("m0", 0, 2), M("m1", 1, 2)]) },
    { a: bell, b: version([H(0), CX(0, 1, 1), M("m1", 1, 2), M("m0", 0, 2)]) },
    { a: bell, b: version([X(0), CX(0, 1, 1), M("m0", 0, 2), M("m1", 1, 2)]) }
  ];
  var pair = 0;
  var answered = false;

  // the first line where the two lists differ, as an op id in version B
  function differingId(p) {
    var la = PF.instructionList(p.a);
    var lb = PF.instructionList(p.b);
    for (var i = 0; i < lb.length; i++) {
      if (!la[i] || la[i].text !== lb[i].text) return lb[i].id;
    }
    return null;
  }

  function feedback(ok, text) {
    var fb = $("qpr-spot-feedback");
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
  }

  function renderPair(markId) {
    var p = PAIRS[pair];
    $("qpr-spot-title").innerHTML = "<strong>Pair " + (pair + 1) + " of " + PAIRS.length + "</strong>";
    $("qpr-spot-a").innerHTML = PF.instructionListHTML(p.a, { interactive: false, ariaLabel: "Version A, instruction list" });
    var html = PF.instructionListHTML(p.b, { interactive: true, ariaLabel: "Version B, instruction list. Select the line that differs." });
    $("qpr-spot-b").innerHTML = html;
    if (markId) {
      var el = $("qpr-spot-b").querySelector('[data-op="' + markId + '"]');
      if (el) {
        el.classList.add("is-different");
        el.insertAdjacentHTML("afterend", '<span class="qed-forms__tag">differs</span>');
      }
    }
  }

  function showPair() {
    answered = false;
    $("qpr-spot-feedback").textContent = "";
    $("qpr-spot-feedback").className = "qed-quiz__feedback";
    renderPair(null);
  }

  function sameReason(p) {
    return "The lines that moved are operations that do not depend on each other (the dependency graph shows no arrow between them), so either order describes the same computation.";
  }

  $("qpr-spot-b").addEventListener("click", function (e) {
    var el = e.target.closest("[data-op]");
    if (!el) return;
    var p = PAIRS[pair];
    var picked = el.getAttribute("data-op");
    var same = PF.sameComputation(p.a, p.b).same;
    var target = differingId(p);
    if (same) {
      feedback(false, "That line sits somewhere else, but it makes no difference. " + sameReason(p) + " " + PF.differenceText(p.a, p.b));
      renderPair(target);
    } else if (picked === target) {
      feedback(true, "Yes, that is the line that differs. " + PF.differenceText(p.a, p.b));
      renderPair(target);
    } else {
      feedback(false, "Not that one. Compare the two lists line by line. That line is the same in both.");
    }
  });

  $("qpr-spot-same").addEventListener("click", function () {
    var p = PAIRS[pair];
    var same = PF.sameComputation(p.a, p.b).same;
    if (same) {
      feedback(true, "Right. " + sameReason(p) + " " + PF.differenceText(p.a, p.b));
      renderPair(differingId(p));
    } else {
      feedback(false, "Look again. " + PF.differenceText(p.a, p.b));
      renderPair(differingId(p));
    }
  });

  $("qpr-spot-next").addEventListener("click", function () {
    pair = (pair + 1) % PAIRS.length;
    showPair();
  });
  showPair();
});
</script>
