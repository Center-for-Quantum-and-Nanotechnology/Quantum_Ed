# Trapped-Ion Qubits

[Superconducting Qubits](superconducting-qubits.md) answered the six questions with an engineered circuit, kept cold, with a wire for every qubit. Here is a second answer. What if the qubit were a real atom, held by electric fields and cooled by light? What does it look like, and what does it cost?

## The Six Questions, Again

The last page ended with a question about a different kind of platform:

> **What if the qubits remembered much longer, and any two could interact?**

This group answers with real systems, one at a time, always with the same six questions. This page is the **second** answer. Here is the card the questions go on, still empty:

<div class="qed-demo qed-pc" id="ti-card-empty"></div>

And here is the first answer, in short, for reference:

<details class="qed-details" markdown="1">
<summary>The superconducting card, in short</summary>
<div id="ti-recap-sc"></div>
</details>

The card is filled in a row at a time as you go down the page, and appears whole near the end.

## What Is the Qubit?

A **[trapped-ion qubit](../glossary.md#trapped-ion-qubit)** is **one real atom with an electric charge**, called an **ion**, so that electric fields can hold it. It is held still in a vacuum, in a device called an **[ion trap](../glossary.md#ion-trap)**. This page names the trap and does not derive it.

Two of the atom's own internal levels, long-lived ones, stand for 0 and 1. As on [Physical Qubits](physical-qubits.md), the qubit is a pair of levels. The difference is where the levels come from: **nature, not fabrication**. Every ion of one kind is **identical**<span data-cite="bruzewicz2019"></span>, the opposite of the "no two alike" of an engineered circuit.

> **Is it an engineered circuit?**

No. It is a real atom, so its levels are set by nature. What is engineered is the trap that holds it and the light that controls it.

**Identical does not mean error-free.** The fields and the light that control an ion still vary, and a later section shows what usually goes wrong.

## Held by Fields, Cooled by Light

An ion held in a trap still jiggles. Its motion is slowed with laser light, a technique called **[laser cooling](../glossary.md#laser-cooling)**, until it is nearly still. The motion ends up equivalent to <span data-fig="motion">a very small temperature</span>.

The trap itself is often at **room temperature**<span data-cite="ballance2016,pino2021"></span>, and some are cooled. The ion sits in an ultra-high vacuum, so there is almost nothing to bump into.

So "cold is not universal" has a more careful form than it had on the last page:

```
A SUPERCONDUCTING CIRCUIT IS COOLED AS A WHOLE BY A REFRIGERATOR
        ↓
AN ION'S MOTION IS COOLED BY LIGHT
        ↓
COLD LOOKS DIFFERENT ON EACH PLATFORM
```

That answers part of the first question on the card:

<div class="qed-demo qed-pc" id="ti-row-1"></div>

## Ion Chain

Ions are held together in a line, called a **chain**. Choose two ions and step through the Bell circuit's three kinds of operation: rotate the first ion, interact the pair, and read out. Every number is invented, and the readout is simulated.

First, a prediction.

<div class="qed-demo" id="ti-quiz-predict"></div>

<div class="qed-demo qed-io" id="io-explorer">
  <p class="qed-demo__step"><strong>1. Choose the length of the chain</strong></p>
  <div class="qed-io__group" role="radiogroup" aria-label="Chain length" id="io-length"></div>
  <p class="qed-demo__step"><strong>2. Choose two ions</strong></p>
  <div class="qed-io__selects">
    <label class="qed-io__select"><span>First ion</span> <select id="io-first"></select></label>
    <label class="qed-io__select"><span>Second ion</span> <select id="io-second"></select></label>
  </div>
  <p class="qed-io__note" id="io-pair-note">You can also click an ion in the picture. Clicks fill the first ion and the second ion in turn.</p>
  <p class="qed-demo__step"><strong>3. Step through the Bell circuit</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="io-rotate">Rotate the first ion</button>
    <button type="button" class="qed-button" id="io-interact">Interact the pair</button>
    <button type="button" class="qed-button" id="io-read">Read out</button>
    <button type="button" class="qed-button qed-button--secondary" id="io-reset">Reset</button>
  </div>
  <p class="qed-io__note" id="io-next"></p>
  <div class="qed-io__panel">
    <p class="qed-io__title">The chain <span class="qed-io__tag">simplified, not to scale</span></p>
    <div id="io-picture"></div>
  </div>
  <div class="qed-io__panel">
    <p class="qed-io__title">The interaction <span class="qed-io__tag">invented</span> <span class="qed-io__tag">derived</span></p>
    <p id="io-interaction"></p>
  </div>
  <div class="qed-io__panel">
    <p class="qed-io__title">What the readout shows <span class="qed-io__tag">simulated</span></p>
    <div id="io-readout"></div>
  </div>
  <details class="qed-details" markdown="1" id="io-details">
    <summary>The ions as a table</summary>
    <div id="io-table"></div>
  </details>
  <p class="qed-io__note" id="io-live" role="status" aria-live="polite"></p>
</div>

Try a chain of 3, then a chain of 12, and compare the time of the interaction. Choose the nearest pair, then the first and the last ion. Any two can interact, and a longer chain makes it slower. When you read out, the pair agrees, and the rest of the chain is dark.

<div class="qed-demo" id="ti-quiz-concept"></div>

**How it is controlled.** An ion is turned by **light**, focused on one ion, or by **microwaves**, tuned to the gap between its two levels, for a chosen strength and time. Focused light can pick out one ion in a chain, and microwaves reach all of them. This is the "microwave signals" and drive row of [Gates and Control](gates-and-control.md), now with its platform. How the pulses are shaped is for a later level.

<div class="qed-demo qed-pc" id="ti-row-2"></div>

**How it is read out.** Shine light that **only one of the two states scatters**. An ion in that state shines: **bright**. An ion in the other stays **dark**. A detector collects the scattered photons and counts them. This is **[fluorescence readout](../glossary.md#fluorescence-readout)**. The counts are the overlapping signals and the [threshold](../glossary.md#readout-threshold) of [Readout](readout.md) again: a bright ion gives a high count, a dark ion a low one, and the counts can overlap, so a misread is rare but possible. On this page, dark is 0 and bright is 1.

<div class="qed-demo qed-pc" id="ti-row-3"></div>

## How Long, and How Fast

The card's fourth question has five answers. The first four are ranges taken from the sources, each tagged approximate and cited. The last is computed from them.

<div class="qed-demo qed-pc" id="ti-row-4"></div>

The long times are **phase-coherence times**, **[T2](../glossary.md#t2-dephasing-time)**, limited by stray fields, and not the fundamental lifetime of the state. That is why this row is labelled "Coherence time (T2)" and not "T1 and T2", and why it is not the same quantity as the memory row on the last page.

The operations that fit in a lifetime are a **budget, not a promise**, in the words of [Coherence](coherence.md). The figures change quickly, and the ends of a range are not one device. The sources are at the bottom of the page.

> **A platform's operations are slow, and its memory is very long. Is that good or bad?**

It is a trade-off. Slow operations leave a very long memory to fit many of them in. Whether that is an advantage depends on what else the platform can do. You can read this card beside the first one below, and the last page in this group does the comparison. This page ranks nothing.

<div class="qed-demo" id="ti-quiz-transfer"></div>

## How Qubits Connect

The ions in a chain are held together by the same fields, so they **share their motion**, like a row of weights on a spring. Light that touches two of them can link their qubits through that shared motion. So **any pair in the chain can interact directly**, the nearest or the farthest. This is the [coupling](../glossary.md#coupling) idea of Gates and Control with its platform, and the opposite of the fixed neighbours on the last page.

That is not free. A longer chain has more ways to move, so an interaction gets **slower and harder to do well**. The Ion Chain showed it with an invented rule.

What a device tells software about which pairs can interact, its [connectivity](../glossary.md#connectivity), and what software does with that, is the subject of [Module 05](../05-software-stack/hardware-abstraction-and-backend-capabilities.md). This page draws no real device's layout.

<div class="qed-demo qed-pc" id="ti-row-5"></div>

## What Makes It Hard to Scale

Three reasons, one line each.

1. **Longer chains are harder.** More ions means more ways for the chain to move, so interactions slow down and get harder to do well, as the Ion Chain showed.
2. **Light has to reach every ion.** Each ion needs light of the right kind aimed at it, and more ions need more of that.
3. **Moving ions between regions is one way to scale.** Keep several short chains and move ions between zones to bring a pair together. It has a cost: moving takes time and disturbs the ion's motion, so the ion has to be cooled again<span data-cite="pino2021"></span>.

Try it with an invented picture of two zones:

<div class="qed-demo qed-io" id="io-zones">
  <div id="io-zones-picture"></div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button" id="io-zones-move">Move an ion to bring the pair together</button>
    <button type="button" class="qed-button qed-button--secondary" id="io-zones-reset">Reset</button>
  </div>
  <p class="qed-io__note" id="io-zones-words" role="status" aria-live="polite"></p>
  <p class="qed-io__note">An invented picture, not a trap. <span class="qed-io__tag">invented</span></p>
</div>

How any of this is being worked on is not a Beginner topic, and this page does not predict how many ions a chain can hold.

<div class="qed-demo qed-pc" id="ti-row-6"></div>

## The Bell Circuit, Here

Module 04 asks, for every platform, how it would do the Bell circuit's three kinds of operation:

<div class="qed-demo qed-pc">
  <div id="ti-bell"></div>
  <div id="ti-bell-strip"></div>
</div>

**What usually goes wrong here.** Noise named five sources. Here is each one on this platform, in words and without numbers:

<div class="qed-demo qed-pc" id="ti-wrong"></div>

Which source is largest depends on the device and changes over time, as the Error Budget showed. This page ranks none of them.

## The Platform Card, and Two Cards Side by Side

Here is the whole card:

<div class="qed-demo qed-pc" id="ti-card"></div>

<p class="qed-pc__note" id="ti-card-note"></p>

Two cards now exist, so you can read them side by side. The control lists only platforms whose cards have been built.

<div class="qed-demo qed-pc" id="ti-compare-control"></div>

<p class="qed-pc__note" id="ti-compare-live" role="status" aria-live="polite"></p>

<div class="qed-demo qed-pc" id="ti-compare-view"></div>

A side-by-side reading is not a ranking. Later pages add the cards of the other platforms, and the comparison explorer is the last page in this group.

## From One System to Another

For each question, this platform's answer, and what it cost:

<div class="qed-demo qed-pc" id="ti-recap"></div>

```
A CIRCUIT, KEPT COLD                 AN ATOM, HELD BY FIELDS
A WIRE FOR EVERY QUBIT      →        AND COOLED BY LIGHT
                                     A CHAIN WHERE ANY TWO CAN INTERACT, SLOWLY
```

> **A chain of ions is slow, and the longer it gets, the harder it is. What if the atoms were not charged, and hundreds of them were held in a grid by beams of light and could be moved around?**

A different physical system, uncharged atoms held by light, answers the same six questions differently. That is the next page.

**Next: Neutral-Atom Qubits →** *(coming soon)*

## Sources

<p class="qed-pc__note" id="ti-sources-note"></p>

<div class="qed-pc__sources" id="ti-sources"></div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var P = window.QedPlatform;
  var I = window.QedIons;
  var QC = window.QedCircuit;
  var Z = window.QedQuiz;
  if (!P || !I || !QC || !Z) return;

  var ION = "trapped-ion";
  var SC = "superconducting";
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- figures, citations, rows, and tables built from the shared modules ----
  Array.prototype.forEach.call(document.querySelectorAll("[data-fig]"), function (el) {
    el.innerHTML = P.figureHTML(ION, el.getAttribute("data-fig"));
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cite]"), function (el) {
    el.innerHTML = P.cite(el.getAttribute("data-cite").split(","), ION);
  });
  $("ti-card-empty").innerHTML = P.cardHTML(ION, { empty: true });
  $("ti-recap-sc").innerHTML = P.recapHTML(SC);
  [1, 2, 3, 4, 5, 6].forEach(function (n) { $("ti-row-" + n).innerHTML = P.rowHTML(ION, n); });
  $("ti-card").innerHTML = P.cardHTML(ION);
  $("ti-card-note").textContent = "Figures change quickly. They are approximate ranges taken from the sources at the bottom of the page, last checked " + P.card(ION).figuresDate + ", and no range describes one device.";
  $("ti-recap").innerHTML = P.recapHTML(ION);
  $("ti-wrong").innerHTML = P.wrongHTML(ION);
  $("ti-bell").innerHTML = QC.renderSVG(QC.bell());
  $("ti-bell-strip").innerHTML = P.bellHTML(ION);
  $("ti-sources-note").textContent = "Figures last checked " + P.card(ION).figuresDate + ". Entries are numbered in the order they are first cited on this page.";
  $("ti-sources").innerHTML = P.referencesHTML(ION);

  // ---- the compare control: only platforms whose cards exist, starting at None ----
  $("ti-compare-control").innerHTML = P.compareControlHTML(ION, { id: "ti-compare" });
  if ($("ti-compare")) {
    $("ti-compare").addEventListener("change", function () {
      var other = $("ti-compare").value;
      $("ti-compare-view").innerHTML = other ? P.compareHTML([ION, other]) : "";
      $("ti-compare-live").textContent = other ? "Showing the two cards side by side. It is a reading, not a ranking." : "The comparison is hidden.";
    });
  }

  // ---- Ion Chain ----
  var state = I.start(I.DEFAULTS.length, I.DEFAULTS.first, I.DEFAULTS.second);
  var readRun = 0;
  var nextSlot = "first";
  var pairNote = "";

  $("io-length").innerHTML = I.CHAIN_LENGTHS.map(function (n) {
    return '<label class="qed-io__opt"><input type="radio" name="io-length" value="' + n + '"' + (n === state.n ? " checked" : "") + "><span>" + n + " ions</span></label>";
  }).join("");

  function buildSelects() {
    [["io-first", state.first], ["io-second", state.second]].forEach(function (pair) {
      $(pair[0]).innerHTML = I.chain(state.n).map(function (ion) {
        return '<option value="' + ion.index + '"' + (ion.index === pair[1] ? " selected" : "") + ">Ion " + ion.index + "</option>";
      }).join("");
    });
  }

  function render(announce) {
    $("io-picture").innerHTML = I.renderSVG(state);
    $("io-table").innerHTML = I.tableHTML(state);
    $("io-interaction").textContent = I.interactionWords(state);
    $("io-readout").innerHTML = state.result
      ? '<p>' + esc(I.readoutWords(state.result)) + "</p>"
      : '<p class="qed-io__note">Press Read out after the first two steps.</p>';
    var done = state.done;
    $("io-rotate").disabled = done.length !== 0;
    $("io-interact").disabled = done.length !== 1;
    $("io-read").disabled = done.length !== 2;
    $("io-next").textContent = I.nextWords(state) + (done.length < 3 ? " The steps go in the order of the Bell circuit." : "");
    $("io-pair-note").textContent = pairNote || "You can also click an ion in the picture. Clicks fill the first ion and the second ion in turn.";
    if (announce) $("io-live").textContent = announce;
  }

  // Choosing a different chain or pair starts the steps again.
  function restart(n, a, b, message) {
    state = I.start(n, a, b);
    readRun = 0;
    buildSelects();
    render(message);
  }

  Array.prototype.forEach.call($("io-length").querySelectorAll("input"), function (input) {
    input.addEventListener("change", function () {
      var n = Number(input.value);
      var a = state.first <= n ? state.first : I.DEFAULTS.first;
      var b = state.second <= n && state.second !== a ? state.second : I.DEFAULTS.second;
      pairNote = "";
      restart(n, a, b, "A chain of " + n + " ions. Any two can interact, and the interaction takes " + I.interactionTime(n) + " invented units.");
    });
  });

  function pickFromSelects(changed) {
    var a = Number($("io-first").value);
    var b = Number($("io-second").value);
    if (!I.validPair(state.n, a, b)) {
      pairNote = "Choose two different ions.";
      $(changed === "first" ? "io-first" : "io-second").value = String(changed === "first" ? state.first : state.second);
      render("Choose two different ions.");
      return;
    }
    pairNote = "";
    restart(state.n, a, b, "Ions " + a + " and " + b + " chosen.");
  }
  $("io-first").addEventListener("change", function () { pickFromSelects("first"); });
  $("io-second").addEventListener("change", function () { pickFromSelects("second"); });

  $("io-picture").addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== this) {
      if (t.getAttribute && t.getAttribute("data-ion")) {
        var i = Number(t.getAttribute("data-ion"));
        var a = nextSlot === "first" ? i : state.first;
        var b = nextSlot === "second" ? i : state.second;
        if (!I.validPair(state.n, a, b)) {
          pairNote = "Choose two different ions.";
          render("Choose two different ions.");
          return;
        }
        pairNote = "";
        nextSlot = nextSlot === "first" ? "second" : "first";
        restart(state.n, a, b, "Ions " + a + " and " + b + " chosen.");
        return;
      }
      t = t.parentNode;
    }
  });

  $("io-rotate").addEventListener("click", function () {
    state = I.step(state, "rotate");
    render("The first ion, ion " + state.first + ", is rotated by light.");
  });
  $("io-interact").addEventListener("click", function () {
    state = I.step(state, "interact");
    render("Ions " + state.first + " and " + state.second + " interact through shared motion, in " + I.interactionTime(state.n) + " invented units.");
  });
  $("io-read").addEventListener("click", function () {
    readRun++;
    state = I.step(state, "read", 3200 + readRun);
    render(I.readoutWords(state.result));
  });
  $("io-reset").addEventListener("click", function () {
    pairNote = "";
    nextSlot = "first";
    restart(I.DEFAULTS.length, I.DEFAULTS.first, I.DEFAULTS.second, "Reset. A chain of " + I.DEFAULTS.length + " ions, ions " + I.DEFAULTS.first + " and " + I.DEFAULTS.second + " chosen.");
    Array.prototype.forEach.call($("io-length").querySelectorAll("input"), function (input) { input.checked = Number(input.value) === I.DEFAULTS.length; });
  });
  buildSelects();
  render();

  // ---- two zones (an invented picture, page-local) ----
  var moved = false;
  function zonesSVG() {
    function ion(x, y, label) { return '<circle class="qed-io__ion qed-io__ion--unread" cx="' + x + '" cy="' + y + '" r="12"/><text class="qed-io__text qed-io__text--num" x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + label + "</text>"; }
    var left = moved ? [[62, "1"], [102, "2"], [142, "3"]] : [[62, "1"], [102, "2"]];
    var right = moved ? [[258, "4"], [298, "5"]] : [[258, "3"], [298, "4"], [338, "5"]];
    var body = left.map(function (p) { return ion(p[0], 90, p[1]); }).join("") + right.map(function (p) { return ion(p[0], 90, p[1]); }).join("");
    var desc = moved
      ? "Two zones. Ions 1, 2, and 3 are now together in the first zone, and ions 4 and 5 are in the second. Ion 3 was moved from the second zone."
      : "Two zones. Ions 1 and 2 are in the first zone, and ions 3, 4, and 5 are in the second. Ions 2 and 3 are in different zones.";
    return '<svg class="qed-io__svg" viewBox="0 0 420 150" role="img" aria-label="' + esc("A simplified picture, not a trap. " + desc) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect class="qed-io__vacuum" x="10" y="30" width="190" height="90" rx="6"/><text class="qed-io__text qed-io__text--tag" x="20" y="50" text-anchor="start">zone A</text>' +
      '<rect class="qed-io__vacuum" x="220" y="30" width="190" height="90" rx="6"/><text class="qed-io__text qed-io__text--tag" x="230" y="50" text-anchor="start">zone B</text>' +
      body + "</svg>";
  }
  function renderZones() {
    $("io-zones-picture").innerHTML = zonesSVG();
    $("io-zones-words").textContent = moved
      ? "Ion 3 was moved into zone A, so ions 2 and 3 can now interact. Moving took time and disturbed the ion's motion, so it is cooled again first. That is an invented picture of a real cost."
      : "Ions 2 and 3 are in different zones, so they cannot interact directly. Moving one of them brings them together, at a cost.";
  }
  $("io-zones-move").addEventListener("click", function () { moved = true; renderZones(); });
  $("io-zones-reset").addEventListener("click", function () { moved = false; renderZones(); });
  renderZones();

  // ---- Checks ----
  Z.mount($("ti-quiz-predict"), { title: "Predict", items: [{
    label: "A far-apart pair in a long chain",
    prompt: "You choose the first and the last ion in a long chain to interact. Can they interact, and what does a longer chain do to the interaction? Pick one, then try it in the Ion Chain below.",
    options: [
      { label: "Yes, any pair can, and a longer chain makes it slower and harder", correct: true, why: "Ions in a chain share their motion, so any two can interact. A longer chain has more ways to move, so the interaction is slower and harder to do well." },
      { label: "No, only neighbours can interact, as on the last page", correct: false, why: "That was the superconducting chip's fixed neighbours. In a chain of ions the shared motion links any pair." },
      { label: "Yes, and a longer chain makes no difference", correct: false, why: "A longer chain makes the interaction harder. The explorer's invented rule shows the time growing with the length." }
    ]
  }] });

  Z.mount($("ti-quiz-concept"), { title: "Check", items: [{
    label: "What a dark ion means",
    prompt: "An ion is read as dark. Does that mean the ion is not there?",
    options: [
      { label: "Yes, a missing ion scatters no light", correct: false, why: "Dark is one of the two results. An ion in 0 scatters little light, and it is still there." },
      { label: "No, dark is one of the two results, 0, and the counts can overlap, so a misread is possible", correct: true, why: "An ion in 0 scatters little light. A dark ion can occasionally give a high count, and a bright one a low count." },
      { label: "No, dark means the ion is in 1", correct: false, why: "On this page, dark is 0 and bright is 1." }
    ]
  }] });

  Z.mount($("ti-quiz-transfer"), { title: "Transfer", items: [{
    label: "Whether a very long memory and slow operations make a good platform",
    prompt: "A platform has a very long memory and slow operations. Is it a good platform?",
    options: [
      { label: "Yes, a long memory is all that matters", correct: false, why: "Slow operations cost. A long memory helps, and slow operations limit how fast anything runs." },
      { label: "No, slow operations make it a poor platform", correct: false, why: "Slow operations cost, and a long memory helps. Neither one settles it." },
      { label: "It is a trade-off, how many operations fit is a budget and not a promise, and comparing platforms comes later", correct: true, why: "This page does not rank platforms. The comparison is the last page in this group." }
    ]
  }, {
    label: "Where to look first when something goes wrong",
    prompt: "Which of the five sources of noise would you look at first?",
    options: [
      { label: "At the five sources of noise, and at the device's own measured figures", correct: true, why: "Which source is largest depends on the device and the time, so a device is measured, as the Error Budget showed." },
      { label: "At the readout, since the counts overlap", correct: false, why: "The readout is one source. Which is largest depends on the device and the time." },
      { label: "Nowhere, identical ions have no errors", correct: false, why: "Identical does not mean error-free. The fields and the light that control the ions still vary." }
    ]
  }] });
});
</script>
