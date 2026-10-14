# Quantum States

What is a qubit actually holding, and what do we see when we look?

## From Bits to States

A classical bit is simple. Whatever value it holds is the value you read.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Classical</span><span>A bit has a value</span></div>
    <span aria-hidden="true">→</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Classical</span><span>You read that value</span></div>
  </div>
</div>

[Module 01](../01-foundations/index.md) gave you the qualitative picture of a qubit. This module makes it precise, and it starts with one question.

> **For a qubit, is what it holds the same as what you see?**

This page separates the two. What a qubit holds is its **[quantum state](../glossary.md#quantum-state)**. What you see when you measure it is an **outcome**. They are not the same thing, and keeping them apart is the foundation for everything that follows.

## Preparing a State

To work with a qubit, you first set it up. That setup is a **[preparation](../glossary.md#state-preparation)**: a recipe. The state is what the recipe produces.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:stretch;">
    <div class="qed-prepared"><span class="qed-prepared__tag">Preparation</span><strong>Prepare |0⟩</strong><span>Produces the basis state |0⟩</span></div>
    <div class="qed-prepared"><span class="qed-prepared__tag">Preparation</span><strong>Prepare |1⟩</strong><span>Produces the basis state |1⟩</span></div>
    <div class="qed-prepared"><span class="qed-prepared__tag">Preparation</span><strong>Prepare a balanced superposition</strong><span>Produces a state that is neither |0⟩ nor |1⟩</span></div>
  </div>
</div>

|0⟩ and |1⟩ are names for the two **[basis states](../glossary.md#basis-state)**. The third recipe prepares a **[superposition](../glossary.md#superposition)**, and "balanced" means it treats 0 and 1 equally. Prepare a qubit the same way again and you get the same state again.

!!! question "If you prepare a qubit the same way twice, do you get the same result twice?"
    You get the same *state*. What you see when you measure it can still differ.

## Prepare, Predict, Observe

Choose a preparation. Predict what repeated measurements will show. Then measure and compare. The results are **simulated**: ideal and noiseless, not from real hardware.

<div class="qed-demo" id="qs-demo">
  <p class="qed-demo__step"><strong>1. Choose a preparation</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Choose a preparation" id="qs-prep-btns">
    <button type="button" class="qed-button qed-button--secondary qed-button--active" data-prep="0" aria-pressed="true">Prepare |0⟩</button>
    <button type="button" class="qed-button qed-button--secondary" data-prep="1" aria-pressed="false">Prepare |1⟩</button>
    <button type="button" class="qed-button qed-button--secondary" data-prep="2" aria-pressed="false">Prepare a balanced superposition</button>
  </div>

  <div class="qed-prepared qed-prepared--live">
    <span class="qed-prepared__tag">The state this preparation produces</span>
    <span id="qs-state"></span>
  </div>

  <p class="qed-demo__step"><strong>2. Predict what repeated measurements will show</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Your prediction" id="qs-pred-btns">
    <button type="button" class="qed-button qed-button--secondary" data-pred="always0" aria-pressed="false">Always 0</button>
    <button type="button" class="qed-button qed-button--secondary" data-pred="always1" aria-pressed="false">Always 1</button>
    <button type="button" class="qed-button qed-button--secondary" data-pred="half" aria-pressed="false">About half each</button>
  </div>

  <p class="qed-demo__step"><strong>3. Measure</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Number of shots" id="qs-shot-btns">
    <button type="button" class="qed-button qed-button--secondary" data-shots="1" aria-pressed="false">1 shot</button>
    <button type="button" class="qed-button qed-button--secondary qed-button--active" data-shots="10" aria-pressed="true">10 shots</button>
    <button type="button" class="qed-button qed-button--secondary" data-shots="100" aria-pressed="false">100 shots</button>
    <button type="button" class="qed-button" id="qs-measure" disabled>Measure</button>
    <button type="button" class="qed-button qed-button--secondary" id="qs-reset">Reset</button>
  </div>
  <p class="qed-demo__hint" id="qs-hint" aria-live="polite"></p>

  <div class="qed-outcomes" id="qs-outcomes" aria-live="polite">
    <p class="qed-demo__step"><strong>Outcomes</strong></p>
    <div class="qed-tokens" id="qs-tokens"></div>
    <div id="qs-results"></div>
    <p class="qed-demo__feedback" id="qs-feedback"></p>
  </div>
</div>

Notice the three separate places. The preparation is what you chose. The state is what that preparation produces. The outcomes are what measurements returned. Each outcome token is one result. The bars show how the results add up across many shots.

## State vs. Outcome

<div class="qed-demo">
  <table class="qed-comparison-table">
    <thead><tr><th scope="col"></th><th scope="col">State</th><th scope="col">Outcome</th></tr></thead>
    <tbody>
      <tr><th scope="row">What it is</th><td>What the preparation produced</td><td>What one measurement returned</td></tr>
      <tr><th scope="row">How you get it</th><td>By preparing the qubit</td><td>By measuring it</td></tr>
      <tr><th scope="row">One run vs. many</th><td>The same every time you prepare the same way</td><td>One result per run; a pattern across many runs</td></tr>
    </tbody>
  </table>
</div>

A state is what was prepared. An outcome is what one measurement returned. Check your understanding:

<div class="qed-demo" id="qs-quiz-state"></div>

And one more, applying the idea to a new case:

<div class="qed-demo" id="qs-quiz-transfer"></div>

## A Superposition Is Not a Hidden Bit

Picture a coin flipped and covered with a cup. It is already heads or tails; you just have not looked. That is ordinary uncertainty about a value that exists.

A balanced superposition is not described that way. But look at the counts from the demo above: they look just like a fair coin. **Counts from this one kind of measurement cannot tell the two apart.**

!!! question "If the counts look like a fair coin, how could a superposition be anything more?"
    Other tests tell them apart, and [Module 01](../01-foundations/what-is-quantum-computing.md) already showed two. In the [Superposition demo](../01-foundations/what-is-quantum-computing.md#superposition), mixing a qubit twice brings it back to a certain outcome, while mixing a random bit twice leaves it 50/50. In the [CHSH game](../01-foundations/what-is-quantum-computing.md#the-chsh-game), an entangled pair wins more often than any pre-arranged strategy can. Later pages in this module, on gates and on measurement, develop the first of these. For now, the point is only that these counts alone do not settle it.

This page does not claim that a qubit is "both 0 and 1 at once" in any literal sense, and it does not claim that measuring reveals a value that was already there. It claims only what the demo shows: a state is one thing, and the outcomes you see are another.

## The Numbers Behind the Probabilities

A state comes with numbers, called **[amplitudes](../glossary.md#probability-amplitude)**, that decide the probabilities of the outcomes. A balanced superposition has amplitudes that make 0 and 1 equally likely. A prepared |0⟩ has amplitudes that make 0 certain.

A state can also carry something that these outcome probabilities do not show. It is called **[phase](../glossary.md#phase)**. We will not calculate with either idea yet. The next page shows how to write a state down so that you can.

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### Same counts, different states

Two different states can give identical counts when measured this way. For example, a state can differ from the balanced superposition only in its phase, which this measurement cannot see. The counts alone therefore do not determine the state.

The next pages show how to describe that difference and how to picture it.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Pure and mixed states

Every state on this page is a **[pure state](../glossary.md#pure-state)**: a complete description of a qubit that was prepared in one definite way.

A **[mixed state](../glossary.md#mixed-state)** describes a qubit whose preparation is itself uncertain, for example one that was prepared as |0⟩ or as |1⟩ with some probability. Such a qubit also gives 0 and 1 about equally often, yet it is a different thing from the balanced superposition. A later treatment makes the difference precise.

</div>

## From States to Writing Them Down

Compare what you can do now with what is still missing.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>So far</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Prepare a state</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Measure it</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>See an outcome</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Still missing</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Write the state down</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Calculate what it will do</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Predict the outcomes</span></div>
    </div>
  </div>
</div>

You can describe the balanced superposition in words, and you can run it and watch the counts. You cannot yet predict what it will do in a new situation. For that you need a precise way to write a state down.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A preparation produces a state</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A measurement returns one outcome</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Many outcomes show a pattern</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The pattern comes from the state</span></div>
</div>

A quantum state is what a preparation produces. What you see is an outcome drawn from it, and one kind of measurement does not show you the whole state.

> **How can we write a state down so we can calculate what it will do?**

**Next: Qubit Representation →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedShots;
  var SEED = 2026;

  // Each preparation is data: its outcome probabilities, a plain-language
  // description of the state it produces, and what a prediction should be.
  var PREPARATIONS = [
    {
      id: "zero",
      name: "a prepared |0⟩",
      probs: [1, 0],
      state: "A prepared |0⟩. It always gives 0 when measured.",
      expect: "always0",
      why: "This preparation always gives 0 when measured, however many shots you take."
    },
    {
      id: "one",
      name: "a prepared |1⟩",
      probs: [0, 1],
      state: "A prepared |1⟩. It always gives 1 when measured.",
      expect: "always1",
      why: "This preparation always gives 1 when measured, however many shots you take."
    },
    {
      id: "balanced",
      name: "a prepared balanced superposition",
      probs: [0.5, 0.5],
      state: "A prepared balanced superposition. It gives 0 or 1 about equally often.",
      expect: "half",
      why: "This preparation gives 0 or 1 about equally often, so neither “always 0” nor “always 1” fits."
    }
  ];

  var view = { prep: 0, prediction: null, shots: 10, ran: false };
  var sessions = {};

  var prepBtns = document.querySelectorAll("#qs-prep-btns button");
  var predBtns = document.querySelectorAll("#qs-pred-btns button");
  var shotBtns = document.querySelectorAll("#qs-shot-btns button[data-shots]");
  var stateEl = document.getElementById("qs-state");
  var measureBtn = document.getElementById("qs-measure");
  var resetBtn = document.getElementById("qs-reset");
  var hintEl = document.getElementById("qs-hint");
  var tokensEl = document.getElementById("qs-tokens");
  var resultsEl = document.getElementById("qs-results");
  var feedbackEl = document.getElementById("qs-feedback");

  function session(prep) {
    if (!sessions[prep.id]) sessions[prep.id] = Q.session(prep.probs, SEED);
    return sessions[prep.id];
  }

  function setPressed(buttons, test) {
    Array.prototype.forEach.call(buttons, function (b) {
      var on = test(b);
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function clearOutcomes() {
    view.ran = false;
    tokensEl.innerHTML = "";
    resultsEl.innerHTML = "";
    feedbackEl.textContent = "";
  }

  function updateControls() {
    var prep = PREPARATIONS[view.prep];
    setPressed(prepBtns, function (b) { return Number(b.dataset.prep) === view.prep; });
    setPressed(predBtns, function (b) { return b.dataset.pred === view.prediction; });
    setPressed(shotBtns, function (b) { return Number(b.dataset.shots) === view.shots; });
    stateEl.textContent = prep.state;
    measureBtn.disabled = view.prediction === null;
    measureBtn.textContent = view.ran ? "Measure again" : "Measure";
    hintEl.textContent = view.prediction === null
      ? "Make a prediction in step 2 to enable Measure."
      : "";
  }

  function renderTokens(result) {
    var LIMIT = 40;
    var shown = result.sequence.slice(0, LIMIT);
    var html = shown.map(function (k) {
      return '<span class="qed-outcome-token" title="Outcome ' + k + '">' + k + "</span>";
    }).join("");
    if (result.sequence.length > LIMIT) {
      html += '<span class="qed-tokens__more">…and ' + (result.sequence.length - LIMIT) + " more</span>";
    }
    tokensEl.setAttribute("aria-label", "Individual outcomes, in order");
    tokensEl.innerHTML = html;
  }

  function feedbackFor(prep, result) {
    var fit = view.prediction === prep.expect;
    var text = fit
      ? "Your prediction matched. " + prep.why
      : "Not quite. " + prep.why;
    if (prep.id === "balanced" && result.shots === 1) {
      text += " One shot gives a single result. Try more shots to see the pattern.";
    } else if (prep.id === "balanced" && result.shots < 100) {
      text += " With only " + result.shots + " shots the split can look uneven. Try more shots to see the pattern.";
    }
    return text;
  }

  function measure() {
    if (view.prediction === null) return;
    var prep = PREPARATIONS[view.prep];
    var result = session(prep).run(view.shots);
    view.ran = true;
    renderTokens(result);
    resultsEl.innerHTML = Q.renderHTML(result);
    feedbackEl.textContent = feedbackFor(prep, result);
    updateControls();
  }

  function reset() {
    Object.keys(sessions).forEach(function (id) { sessions[id].reset(); });
    sessions = {};
    view = { prep: 0, prediction: null, shots: 10, ran: false };
    clearOutcomes();
    updateControls();
  }

  Array.prototype.forEach.call(prepBtns, function (b) {
    b.addEventListener("click", function () {
      view.prep = Number(b.dataset.prep);
      view.prediction = null;
      clearOutcomes();
      updateControls();
    });
  });
  Array.prototype.forEach.call(predBtns, function (b) {
    b.addEventListener("click", function () {
      view.prediction = b.dataset.pred;
      updateControls();
    });
  });
  Array.prototype.forEach.call(shotBtns, function (b) {
    b.addEventListener("click", function () {
      view.shots = Number(b.dataset.shots);
      updateControls();
    });
  });
  measureBtn.addEventListener("click", measure);
  resetBtn.addEventListener("click", reset);

  updateControls();

  // ---- small checks (page-local, data-driven) -------------------------------
  // Each item is a question with options; each option says whether it is right
  // and why. Feedback is immediate and explains every choice.
  function buildQuiz(root, config) {
    var html = "<p><strong>" + config.title + "</strong></p>";
    config.items.forEach(function (item, i) {
      html += '<div class="qed-quiz__item" data-item="' + i + '">' +
        '<p class="qed-quiz__prompt">' + item.prompt + "</p>" +
        '<div class="qed-demo__controls" role="group" aria-label="' + item.label + '">' +
        item.options.map(function (o, j) {
          return '<button type="button" class="qed-button qed-button--secondary" data-option="' + j + '" aria-pressed="false">' + o.label + "</button>";
        }).join("") +
        "</div>" +
        '<p class="qed-quiz__feedback" aria-live="polite"></p></div>';
    });
    html += '<div class="qed-demo__controls"><button type="button" class="qed-button qed-button--secondary" data-quiz-reset>Try again</button></div>';
    root.innerHTML = html;

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || !root.contains(btn)) return;
      if (btn.hasAttribute("data-quiz-reset")) {
        Array.prototype.forEach.call(root.querySelectorAll(".qed-quiz__item"), function (el) {
          el.querySelector(".qed-quiz__feedback").textContent = "";
          el.querySelector(".qed-quiz__feedback").className = "qed-quiz__feedback";
          Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) {
            b.classList.remove("qed-button--active");
            b.setAttribute("aria-pressed", "false");
          });
        });
        return;
      }
      var itemEl = btn.closest(".qed-quiz__item");
      if (!itemEl) return;
      var item = config.items[Number(itemEl.dataset.item)];
      var option = item.options[Number(btn.dataset.option)];
      Array.prototype.forEach.call(itemEl.querySelectorAll("button"), function (b) {
        var on = b === btn;
        b.classList.toggle("qed-button--active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var fb = itemEl.querySelector(".qed-quiz__feedback");
      fb.className = "qed-quiz__feedback " + (option.correct ? "is-correct" : "is-incorrect");
      fb.textContent = (option.correct ? "Correct. " : "Not quite. ") + option.why;
    });
  }

  buildQuiz(document.getElementById("qs-quiz-state"), {
    title: "State or outcome? Mark each statement.",
    items: [
      {
        prompt: "“It was prepared to give 0 or 1 about equally often.”",
        label: "State or outcome: prepared to give 0 or 1 about equally often",
        options: [
          { label: "State", correct: true, why: "It describes what the preparation produced, not what any one measurement returned." },
          { label: "Outcome", correct: false, why: "An outcome is one measurement's result. This statement describes the prepared state." }
        ]
      },
      {
        prompt: "“The measurement returned 1.”",
        label: "State or outcome: the measurement returned 1",
        options: [
          { label: "State", correct: false, why: "A single returned 1 does not tell you the state. A balanced superposition and a prepared |1⟩ can both give a 1." },
          { label: "Outcome", correct: true, why: "It reports what one measurement returned." }
        ]
      },
      {
        prompt: "“The qubit was prepared as |0⟩.”",
        label: "State or outcome: the qubit was prepared as zero",
        options: [
          { label: "State", correct: true, why: "It names the state the preparation produced." },
          { label: "Outcome", correct: false, why: "Preparing a qubit is not measuring it. This names the state, not a result." }
        ]
      },
      {
        prompt: "“Out of 100 measurements, 47 returned 0.”",
        label: "State or outcome: 47 of 100 measurements returned 0",
        options: [
          { label: "State", correct: false, why: "Counts are made of outcomes. They hint at the state but are not the state." },
          { label: "Outcome", correct: true, why: "It is a tally of what the measurements returned." }
        ]
      }
    ]
  });

  buildQuiz(document.getElementById("qs-quiz-transfer"), {
    title: "Apply it: a qubit is prepared the same way as the balanced one, then measured 100 times. What should the results look like?",
    items: [
      {
        prompt: "Choose one.",
        label: "What 100 shots of a balanced preparation should look like",
        options: [
          { label: "100 zeros", correct: false, why: "A balanced preparation does not always give 0. That pattern belongs to a prepared |0⟩." },
          { label: "100 ones", correct: false, why: "A balanced preparation does not always give 1. That pattern belongs to a prepared |1⟩." },
          { label: "About half 0 and about half 1, not exactly 50/50 every time", correct: true, why: "The same preparation gives the same state, so the same pattern of outcomes. Any single run can come out a little uneven." },
          { label: "Exactly 50 zeros and 50 ones every time", correct: false, why: "The pattern is about half and half, but each run is a random-looking draw. Exactly 50/50 is not guaranteed." }
        ]
      }
    ]
  });
});
</script>
