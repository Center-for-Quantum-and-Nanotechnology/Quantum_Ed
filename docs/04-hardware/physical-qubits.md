# Physical Qubits

Module 02's qubit started in |0⟩, turned exactly as told, and was read perfectly. What does a real object have to do to be one?

## What the Ideal Qubit Got for Free

[Module 02](../02-fundamentals/index.md) taught what a qubit, a gate, and a measurement *are*. To keep the ideas clear, it let the qubit do five things without asking how.

<table class="qed-xf__table">
  <thead><tr><th scope="col">In Module 02, the qubit</th><th scope="col">Which means</th></tr></thead>
  <tbody>
    <tr><th scope="row">Started in |0⟩</th><td data-label="Which means">Every run began from the same known state.</td></tr>
    <tr><th scope="row">Changed exactly as a gate said</th><td data-label="Which means">A gate did precisely what its name promised, with no delay.</td></tr>
    <tr><th scope="row">Reported its state truthfully</th><td data-label="Which means">A measurement told you what the qubit was.</td></tr>
    <tr><th scope="row">Lasted as long as you liked</th><td data-label="Which means">The state stayed put until you used it.</td></tr>
    <tr><th scope="row">Was untouched by anything else</th><td data-label="Which means">Nothing outside the circuit disturbed it.</td></tr>
  </tbody>
</table>

> **What does a real object have to do to be a qubit?**

A [physical qubit](../glossary.md#physical-qubit) is a real object, or part of one, that is used as a qubit. This module is about what that takes. This page is about the first things it has to do.

## Many Levels, Two Chosen

A real object does not come with two states. It has many **[energy levels](../glossary.md#energy-level)**: distinct amounts of energy it can have, each a different state. Picture them as a ladder. A qubit uses **two** of the rungs as |0⟩ and |1⟩. The others are still there.

<div class="qed-demo qed-ld" id="ld-static" aria-live="off"></div>

!!! question "Is a physical qubit the whole atom or circuit?"
    No. A qubit is the two levels we choose to use. The object has more levels than that, and the rest do not go away.

This ladder is an **invented** system with invented units, drawn to show the idea. It is not any real device.

!!! note "The ladder is one picture"
    Levels of different energy are the right picture for atoms, ions, and tiny engineered circuits. They are not the only way to make a qubit. A photon's two polarizations, for example, are two states with the same energy, and a later page shows them. What all qubits share is this: **two states of a real object that we can tell apart, start in, and control.**

## Natural and Engineered Qubits

Where do the levels come from? Two ways.

<div class="qed-ld__cards">
  <div class="qed-ld__card"><p class="qed-ld__card-title">Natural</p><p>An atom or an ion. Nature sets its levels, so every one of the same kind is alike. Identical qubits are easy to compare.</p></div>
  <div class="qed-ld__card"><p class="qed-ld__card-title">Engineered</p><p>A tiny circuit built to behave like an atom, sometimes called an artificial atom. Its levels come from how it was made, so no two come out exactly alike. Each one has to be measured and tuned.</p></div>
</div>

Superconducting circuits, trapped ions, and neutral atoms are three examples. Later pages take them up. Engineered does not mean less real, and natural does not mean better. They are alike in what they must do, and different in how alike they are to each other.

## Five Needs

Whatever the object, five things must be arranged for it to work as a qubit.

1. **Start.** Put it in a known state.
2. **Control.** Change its state on purpose.
3. **Connect.** Let qubits affect each other when we want.
4. **Read.** Find out what state it is in.
5. **Keep.** Its state lasts long enough to use.

This page tests the first two. The rest each get a later page of their own.

!!! question "Which of these did Module 02 let you ignore?"
    All five. The ideal qubit started, changed, was read, and lasted without anyone arranging it.

## Choose a Qubit

First, a prediction.

<div class="qed-demo" id="ld-quiz-predict"></div>

Now build an invented system and see whether it can start and be controlled. The qubit is always the two lowest levels of the ladder. That is a choice of this model: only the lowest pair can start by itself, and real systems also choose their two levels for other reasons.

<div class="qed-demo qed-ld" id="ld-explorer">
  <p class="qed-demo__step"><strong>1. Choose the spacing of the levels</strong></p>
  <div class="qed-ld__group" role="radiogroup" aria-label="Spacing of the levels" id="ld-spacing"></div>
  <p class="qed-ld__note" id="ld-spacing-desc"></p>
  <p class="qed-demo__step"><strong>2. Choose the size of the first step</strong></p>
  <div class="qed-ld__group" role="radiogroup" aria-label="Size of the first step" id="ld-gap"></div>
  <p class="qed-demo__step"><strong>3. Choose how warm it is</strong></p>
  <div class="qed-ld__group" role="radiogroup" aria-label="Temperature" id="ld-temperature"></div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="ld-reset">Reset</button>
  </div>
  <div class="qed-ld__panel">
    <p class="qed-ld__title">The system <span class="qed-ld__tag">invented</span></p>
    <div id="ld-system"></div>
  </div>
  <div class="qed-ld__panel">
    <p class="qed-ld__title">Where it starts <span class="qed-ld__tag">computed from a simplified model</span></p>
    <div id="ld-shares"></div>
    <p class="qed-ld__note" id="ld-shares-words"></p>
  </div>
  <div class="qed-ld__panel">
    <p class="qed-ld__title">Would a drive tuned to the first step move the other steps? <span class="qed-ld__tag">computed from a simplified model</span></p>
    <div id="ld-response"></div>
    <p class="qed-ld__note" id="ld-response-words"></p>
  </div>
  <div class="qed-ld__panel">
    <p class="qed-ld__title">The five needs</p>
    <div id="ld-verdict"></div>
  </div>
  <p class="qed-ld__note" id="ld-live" role="status" aria-live="polite"></p>
</div>

The units are invented: the steps and the heat share one scale, and nothing here is a real temperature or frequency. The page has not yet said how a drive works or how large a turn it makes. That is the next page.

<div class="qed-demo" id="ld-quiz-concept"></div>

<div class="qed-demo" id="ld-quiz-transfer"></div>

## Starting in a Known State

Left alone, a system settles toward its lowest levels. Heat jostles it back up. So how reliably does the qubit start in |0⟩?

- **Compare the gap with the heat.** When the first step is big compared with the heat, almost every start is in |0⟩. When the heat is big compared with the step, the system is often found higher up, and so in the wrong level.
- **Cooling is one way to get a known start.** It is one reason some devices are kept very cold. Others get a known start in other ways, such as using light to push a system into a chosen level, and the platform pages say how.
- **The start is never perfect.** The recipe is the same each time, as in [Quantum States](../02-fundamentals/quantum-states.md), and the real result is a share, not a certainty.

## Being Controllable: Singling Out Two Levels

To change the qubit's state, you send it a signal called a **drive**, tuned to the size of the step between |0⟩ and |1⟩. A signal of the wrong size does little. But if another step is the same size, the same drive works there too.

When that happens, the system can be pushed out of the qubit's two levels altogether. This is called [leakage](../glossary.md#leakage), and a later page returns to it. Unevenly spaced levels avoid the problem, because each step needs its own signal. That is why a good qubit is built, or chosen, so that its levels are not evenly spaced.

The 5% rule in the explorer is invented, and real devices differ. The page has not yet said how a drive makes a qubit turn. That is the next page.

## Isolated, Yet Reachable

A qubit has to be cut off from its surroundings to keep its state. It also has to be connected to the outside, so we can start, control, and read it.

<div class="qed-demo qed-ld">
  <svg class="qed-ld__svg qed-ld__svg--iso" viewBox="0 0 460 210" role="img" aria-label="A qubit inside a dashed boundary that cuts it off from its surroundings. Three lines cross the boundary, for start, control, and read. Disturbance can enter along the same lines." xmlns="http://www.w3.org/2000/svg">
    <rect class="qed-ld__boundary" x="120" y="20" width="200" height="170" rx="18"/>
    <text class="qed-ld__text" x="220" y="14" text-anchor="middle">cut off from its surroundings</text>
    <circle class="qed-ld__qubit-dot" cx="220" cy="105" r="30"/>
    <text class="qed-ld__text" x="220" y="109" text-anchor="middle">qubit</text>
    <line class="qed-ld__wire" x1="30" y1="60" x2="190" y2="92"/>
    <line class="qed-ld__wire" x1="30" y1="105" x2="190" y2="105"/>
    <line class="qed-ld__wire" x1="30" y1="150" x2="190" y2="118"/>
    <text class="qed-ld__text" x="28" y="52">start</text>
    <text class="qed-ld__text" x="28" y="97">control</text>
    <text class="qed-ld__text" x="28" y="168">read</text>
    <path class="qed-ld__noise" d="M80 70 L100 74 M80 105 L102 105 M80 140 L100 136"/>
    <text class="qed-ld__text qed-ld__text--heat" x="330" y="64">orange marks show</text>
    <text class="qed-ld__text qed-ld__text--heat" x="330" y="80">disturbance entering</text>
    <text class="qed-ld__text qed-ld__text--heat" x="330" y="96">along the same lines</text>
  </svg>
</div>

Every way in is also a way for disturbance to get in. This trade-off comes back on every page of this module.

A physical qubit is one such object. Qubits made from many of them are taught in [Module 07](../07-error-correction/index.md).

## From a Qubit That Starts to a Qubit That Moves

Return to the five things Module 02 let the qubit do. Each one is something a real object has to provide.

<table class="qed-xf__table">
  <thead><tr><th scope="col">In Module 02, the qubit</th><th scope="col">A real object has to</th><th scope="col">Taken up in</th></tr></thead>
  <tbody>
    <tr><th scope="row">Started in |0⟩</th><td data-label="A real object has to"><strong>Start</strong>: be put in a known state.</td><td data-label="Taken up in">This page</td></tr>
    <tr><th scope="row">Changed exactly as a gate said</th><td data-label="A real object has to"><strong>Control</strong>: respond to a signal that changes its state on purpose. And for two qubits, <strong>connect</strong>: affect each other when we want.</td><td data-label="Taken up in">This page, then the next page and the platform pages</td></tr>
    <tr><th scope="row">Reported its state truthfully</th><td data-label="A real object has to"><strong>Read</strong>: give a signal we can read.</td><td data-label="Taken up in">A later page on readout</td></tr>
    <tr><th scope="row">Lasted as long as you liked</th><td data-label="A real object has to"><strong>Keep</strong>: hold its state long enough to use.</td><td data-label="Taken up in">A later page on coherence</td></tr>
    <tr><th scope="row">Was untouched by anything else</th><td data-label="A real object has to">Stay cut off from its surroundings, though we must reach it.</td><td data-label="Taken up in">A later page on noise</td></tr>
  </tbody>
</table>

Previously, the qubit had everything for free. Now each one has to be arranged.

```
THE IDEAL QUBIT              A PHYSICAL QUBIT
EVERYTHING FREE      →       EVERYTHING ARRANGED
```

You now have a qubit that starts in |0⟩ and a drive that can single out its two levels. But nothing has changed its state yet.

> **How exactly do you move its state, and how far?**

Changing a physical qubit's state is a physical act, with a size and a duration. That is the next page.

**Next: Gates and Control →** *(coming soon)*

<script>
document.addEventListener("DOMContentLoaded", function () {
  var L = window.QedLadder;
  var S = window.QedShots;
  var N = window.QedNumbers;
  var Z = window.QedQuiz;
  if (!L || !S || !N || !Z) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // The static ladder in "Many Levels, Two Chosen": five levels, the qubit marked, no heat.
  var staticEl = $("ld-static");
  if (staticEl) {
    staticEl.innerHTML =
      L.renderSVG(L.levels("clear", "medium")) +
      '<p class="qed-ld__note">An invented system. The two indigo levels are the qubit. The hollow ones are outside it.</p>';
  }

  // ---- Choose a Qubit ----
  var state = { spacing: L.DEFAULTS.spacing, gap: L.DEFAULTS.gap, temperature: L.DEFAULTS.temperature };

  function buildGroup(containerId, name, list, key, labelOf) {
    var box = $(containerId);
    box.innerHTML = list.map(function (item) {
      return '<label class="qed-ld__opt"><input type="radio" name="' + name + '" value="' + esc(item.id) + '"' +
        (state[key] === item.id ? " checked" : "") + "><span>" + esc(labelOf(item)) + "</span></label>";
    }).join("");
    Array.prototype.forEach.call(box.querySelectorAll("input"), function (input) {
      input.addEventListener("change", function () {
        state[key] = input.value;
        render(true);
      });
    });
  }

  function glyph(pass) { return pass ? "✓" : "✗"; }

  function renderResponse(v) {
    var rows = v.responses.map(function (r) {
      return "<tr><th scope=\"row\">Step " + r.step + "</th>" +
        '<td data-label="Size">' + r.size.toFixed(2) + "</td>" +
        '<td data-label="Differs from step 1 by">' + N.pct(r.difference, 1) + "</td>" +
        '<td data-label="Moved by a drive tuned to step 1?">' + (r.responds ? "● Responds" : "○ Does not respond") + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Other step</th><th scope="col">Size</th><th scope="col">Differs from step 1 by</th><th scope="col">Moved by a drive tuned to step 1?</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  function renderVerdict(v) {
    var items = v.needs.map(function (n) {
      var mark = n.tested ? (glyph(n.pass) + (n.pass ? " Passes" : " Does not pass")) : "– Not tested on this page";
      return '<li class="qed-ld__need' + (n.tested ? "" : " qed-ld__need--untested") + '">' +
        '<span class="qed-ld__need-label">' + esc(n.label) + "</span> " +
        '<span class="qed-ld__need-mark">' + esc(mark) + "</span>" +
        '<span class="qed-ld__need-plain">' + esc(n.plain) + "</span>" +
        '<span class="qed-ld__need-detail">' + esc(n.detail) + "</span></li>";
    }).join("");
    return '<ol class="qed-ld__needs">' + items + "</ol><p class=\"qed-ld__note\">" + esc(v.summary) + "</p>";
  }

  function render(announce) {
    var v = L.verdict(state);
    $("ld-spacing-desc").textContent = "Spacing: " + L.spacingById(state.spacing).words + ".";
    $("ld-system").innerHTML = L.renderSVG(v.ladder, { heat: state.temperature, drive: true });
    $("ld-shares").innerHTML = S.renderBars([
      { label: "|0⟩", fraction: v.shares.zero, text: L.shareText(v.shares.zero), accent: "logical", labelWidth: "5rem" },
      { label: "|1⟩", fraction: v.shares.one, text: L.shareText(v.shares.one), accent: "logical", labelWidth: "5rem" },
      { label: "Outside the qubit", fraction: v.shares.outside, text: L.shareText(v.shares.outside), labelWidth: "5rem" },
    ]);
    $("ld-shares-words").textContent = "In this system the qubit " + L.startWords(v.shares.zero) + ". Start passes when at least " + N.pct(L.START_THRESHOLD, 0) + " of starts are in |0⟩.";
    $("ld-response").innerHTML = renderResponse(v);
    $("ld-response-words").textContent = L.controlSentence(v.responses) + " A step responds when its size is within " + N.pct(L.TOLERANCE, 0) + " of the first step's.";
    $("ld-verdict").innerHTML = renderVerdict(v);
    if (announce) {
      $("ld-live").textContent = "Start: " + (v.needs[0].pass ? "passes" : "does not pass") + ". " + v.needs[0].detail + " Control: " + (v.needs[1].pass ? "passes" : "does not pass") + ". " + v.needs[1].detail;
    }
  }

  if ($("ld-explorer")) {
    buildGroup("ld-spacing", "ld-spacing", L.SPACINGS, "spacing", function (s) { return s.label; });
    buildGroup("ld-gap", "ld-gap", L.GAPS, "gap", function (g) { return g.label + " (" + g.value + ")"; });
    buildGroup("ld-temperature", "ld-temperature", L.TEMPERATURES, "temperature", function (t) { return t.label + " (" + t.value + ")"; });
    $("ld-reset").addEventListener("click", function () {
      state.spacing = L.DEFAULTS.spacing;
      state.gap = L.DEFAULTS.gap;
      state.temperature = L.DEFAULTS.temperature;
      ["spacing", "gap", "temperature"].forEach(function (key) {
        Array.prototype.forEach.call(document.querySelectorAll('input[name="ld-' + key + '"]'), function (input) {
          input.checked = input.value === state[key];
        });
      });
      render(true);
    });
    render(false);
  }

  // ---- Checks ----
  Z.mount($("ld-quiz-predict"), { title: "Predict", items: [{
    label: "Whether a colder system starts more reliably in |0⟩",
    prompt: "You keep the gap the same and make the system colder. Does the share that starts in |0⟩ go up, go down, or stay the same? Pick one, then try it in the explorer.",
    options: [
      { label: "It goes up", correct: true, why: "Less heat means less jostling toward the higher levels, so more of the starts are found in the lowest one." },
      { label: "It goes down", correct: false, why: "Heat is what pushes the system upward. Removing heat does the opposite." },
      { label: "It stays the same", correct: false, why: "The share depends on how big the heat is compared with the first step. Changing the heat changes it." }
    ]
  }] });

  Z.mount($("ld-quiz-concept"), { title: "Check", items: [{
    label: "Whether a physical qubit is the whole atom or circuit",
    prompt: "Is a physical qubit the whole atom or circuit?",
    options: [
      { label: "Yes, the whole object is the qubit", correct: false, why: "The object has many levels. Only the two we choose to stand for 0 and 1 make up the qubit." },
      { label: "No, it is the two levels chosen to stand for 0 and 1", correct: true, why: "The other levels are still there, which is why a drive that moves the wrong step can push the system out of the qubit." },
      { label: "No, it is a single energy level", correct: false, why: "One level cannot hold a 0 and a 1. A qubit needs two states that can be told apart." }
    ]
  }] });

  Z.mount($("ld-quiz-transfer"), { title: "Transfer", items: [{
    label: "Why a system with evenly spaced steps is a poor qubit even if it starts well",
    prompt: "A designer builds a system whose steps are all the same size. It starts reliably when cold. Why is it still a poor qubit?",
    options: [
      { label: "Because a cold system cannot be controlled", correct: false, why: "Cold helps the start. It does not decide whether a drive can single out two levels." },
      { label: "Because a drive tuned to the first step would move the other steps too", correct: true, why: "With every step the same size, the same signal works everywhere, so the system can leave the qubit's two levels." },
      { label: "Because evenly spaced levels cannot start in |0⟩", correct: false, why: "Starting depends on the gap and the heat. Try the cold, evenly spaced setting in the explorer: it starts almost every time." }
    ]
  }, {
    label: "Which need the evenly spaced system fails",
    prompt: "Which of the five needs does that system fail?",
    options: [
      { label: "Start", correct: false, why: "It starts reliably when cold, so it passes Start." },
      { label: "Control", correct: true, why: "A drive cannot single out its two levels, so it cannot be controlled as a qubit." },
      { label: "Connect, read, or keep", correct: false, why: "This page does not test those, so it cannot say. They are taken up on later pages." }
    ]
  }] });
});
</script>
