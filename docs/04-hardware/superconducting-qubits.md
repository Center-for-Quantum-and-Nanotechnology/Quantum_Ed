# Superconducting Qubits

Hardware Fundamentals followed one invented qubit. A real platform answers the same questions with a real object, and every answer has a cost. What does a superconducting qubit look like, and what does it cost?

## The Five Needs, Again

[Noise](noise.md) ended with a qubit that has to be started, turned, connected, read, and kept, with an operation that goes wrong for several reasons, and with settings that drift and qubits that differ.

```
A QUBIT THAT STARTS, IS TURNED, IS CONNECTED, IS READ, AND IS KEPT
        ↓
AN OPERATION THAT GOES WRONG FOR SEVERAL REASONS
        ↓
SETTINGS THAT DRIFT AND QUBITS THAT DIFFER
```

> **How do different physical systems answer?**

This group answers with real systems, one at a time, always with the same six questions. This page is the first answer. Here is the card the questions go on, still empty:

<div class="qed-demo qed-pc" id="sc-card-empty"></div>

The card is filled in a row at a time as you go down the page, and appears whole near the end.

## What Is the Qubit?

A **[superconducting qubit](../glossary.md#superconducting-qubit)** is an **engineered artificial atom**: a small electrical circuit built on a chip from a metal that becomes superconducting when it is cold. Its frequency is in the microwave range, <span data-fig="frequency">a few gigahertz</span>.

Inside it is one small element, a **[Josephson junction](../glossary.md#josephson-junction)**. The junction is what makes the circuit's levels **unevenly spaced**, which is exactly what [Physical Qubits](physical-qubits.md) said a good qubit needs: a signal tuned to the first step moves only the first step, so the two lowest levels can be used on their own. The most common design is called a **[transmon](../glossary.md#transmon)**. This page does not derive it.

The ladder below is the invented one from Physical Qubits, with the same invented units. A superconducting circuit is built to have a ladder shaped like it.

<div class="qed-demo qed-ld">
  <div id="sc-ladder"></div>
  <p class="qed-ld__note">An invented ladder, to remind you of the shape. <span class="qed-ld__tag">invented</span></p>
</div>

> **Is it a real atom?**

No. It is a circuit built to behave like one: two usable levels, spaced so that a signal can pick them out.

It is made by fabrication, so **no two qubits come out exactly alike**. That is why each is measured and tuned, as [Noise](noise.md) showed with its three qubits that differ.

## Why It Is Kept Cold

There are two reasons, and neither is "because quantum is cold".

1. The metal has to be **superconducting**, which it only is when it is cold.
2. The qubit's two levels are **close in energy**, so even a little heat would jostle it. This is the gap against heat from [Physical Qubits](physical-qubits.md) again.

Here is that ladder at three invented temperatures. The bars show the share that starts in |0⟩:

<div class="qed-demo qed-ld">
  <div id="sc-cold-bars"></div>
  <p class="qed-ld__note">Invented temperatures, in the invented units of Physical Qubits. <span class="qed-ld__tag">invented</span></p>
</div>

The real temperature is <span data-fig="temperature">ten to twenty millikelvin</span>, a hundredth of a degree above absolute zero. A **[dilution refrigerator](../glossary.md#dilution-refrigerator)** gets it there. A qubit of that frequency has an energy equal to the heat at about <span id="sc-energy-temp">0.1 to 0.3</span> kelvin, so at the refrigerator's temperature the heat is smaller than the qubit's energy by a factor of <span data-fig="coldRatio">several to tens of times</span>. <span class="qed-pc__tag">computed from the stated ranges</span>

> **Is cold a property of quantum computing?**

No. It is this platform's answer. Trapped ions and neutral atoms sit in vacuum and are handled with lasers, and the next pages show them.

```
A CIRCUIT THAT IS ONLY A QUBIT WHEN COLD
        ↓
A REFRIGERATOR AROUND IT
        ↓
COLD IS THIS PLATFORM'S ANSWER, NOT QUANTUM COMPUTING'S
```

<div class="qed-demo" id="sc-quiz-concept"></div>

That answers the first question on the card:

<div class="qed-demo qed-pc" id="sc-row-1"></div>

## Chip and Fridge

A superconducting device is more than the chip. Choose a part to see what it is, what it does, which of the five needs it serves, which source of noise it brings, and which question on the card it answers. The picture is a **schematic**, not a layout of any real chip, and it is not to scale.

<div class="qed-demo qed-ch" id="sc-explorer">
  <p class="qed-demo__step"><strong>Choose a part</strong></p>
  <div class="qed-ch__group" role="group" aria-label="Part of the device" id="sc-parts"></div>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="sc-reset">Reset</button>
  </div>
  <div class="qed-ch__panel">
    <p class="qed-ch__title">The device <span class="qed-ch__tag">simplified, not to scale</span></p>
    <div id="sc-picture"></div>
  </div>
  <div class="qed-ch__panel">
    <p class="qed-ch__title">The part's role <span class="qed-ch__tag">derived</span></p>
    <div id="sc-role"></div>
  </div>
  <div class="qed-ch__panel">
    <p class="qed-ch__title">The row of the card it fills <span class="qed-ch__tag">from the card</span></p>
    <div id="sc-row"></div>
  </div>
  <details class="qed-details" markdown="1" id="sc-parts-details">
    <summary>The six parts as a table</summary>
    <div id="sc-parts-table"></div>
  </details>
  <p class="qed-ch__note" id="sc-live" role="status" aria-live="polite"></p>
</div>

Two of the parts answer the card's second and third questions.

**How it is controlled.** A qubit is turned by a **microwave signal** sent down a wire. Electronics at room temperature make the signal, it passes down through the cold stages, and it reaches the chip. This is the "microwave signals" row of the table on [Gates and Control](gates-and-control.md), now with its platform. How the signals are shaped, and the electronics, are for a later level.

<div class="qed-demo qed-pc" id="sc-row-2"></div>

**How it is read out.** A **[readout resonator](../glossary.md#readout-resonator)** sits next to the qubit, and its response changes slightly with the qubit's state. A weak microwave probe goes in, the changed reflection is amplified, and what comes out is the pair of overlapping signals and the threshold from [Readout](readout.md). The signal is weak, which is one reason a readout is slow. The invented axis on the Readout page belonged to no platform: this is one real way of getting such a signal.

<div class="qed-demo qed-pc" id="sc-row-3"></div>

## How Long, and How Fast

The card's fourth question has five answers. The first four are ranges taken from the sources, each tagged approximate and cited. The last is computed from them.

<div class="qed-demo qed-pc" id="sc-row-4"></div>

The operations that fit in a lifetime are a **budget, not a promise**, in the words of [Coherence](coherence.md): a long time is not a guarantee. Figures like these change quickly, and the ends of a range are not one device. The sources are at the bottom of the page.

> **A platform's qubits last a short time, and its gates are fast. Is that good or bad?**

It is a trade-off. Fast operations leave room for many of them inside a short memory. Whether that is an advantage depends on what else the platform can do, and comparing platforms is the job of the last page in this group. This page ranks nothing.

<div class="qed-demo" id="sc-quiz-transfer"></div>

## How Qubits Connect

Each qubit sits at a **fixed place** on the chip, and is linked to a few neighbours through a **coupler**: a fixed element, or one whose strength can be tuned. A two-qubit gate is performed between neighbours that are linked. This is the [coupling](../glossary.md#coupling) idea of Gates and Control, now with its platform.

<div class="qed-demo qed-ch">
  <svg class="qed-ch__svg qed-ch__svg--grid" viewBox="0 0 260 216" role="img" aria-label="A generic pattern of nine qubits in three rows of three. Each qubit is linked by a coupler to the qubits next to it, above, below, left, and right. It is not a layout of any real chip.">
    <g class="qed-ch__gridlinks">
      <line x1="50" y1="40" x2="130" y2="40"/><line x1="130" y1="40" x2="210" y2="40"/>
      <line x1="50" y1="100" x2="130" y2="100"/><line x1="130" y1="100" x2="210" y2="100"/>
      <line x1="50" y1="160" x2="130" y2="160"/><line x1="130" y1="160" x2="210" y2="160"/>
      <line x1="50" y1="40" x2="50" y2="100"/><line x1="50" y1="100" x2="50" y2="160"/>
      <line x1="130" y1="40" x2="130" y2="100"/><line x1="130" y1="100" x2="130" y2="160"/>
      <line x1="210" y1="40" x2="210" y2="100"/><line x1="210" y1="100" x2="210" y2="160"/>
    </g>
    <g class="qed-ch__gridcouplers">
      <rect x="82" y="34" width="12" height="12"/><rect x="162" y="34" width="12" height="12"/>
      <rect x="82" y="94" width="12" height="12"/><rect x="162" y="94" width="12" height="12"/>
      <rect x="82" y="154" width="12" height="12"/><rect x="162" y="154" width="12" height="12"/>
      <rect x="44" y="64" width="12" height="12"/><rect x="44" y="124" width="12" height="12"/>
      <rect x="124" y="64" width="12" height="12"/><rect x="124" y="124" width="12" height="12"/>
      <rect x="204" y="64" width="12" height="12"/><rect x="204" y="124" width="12" height="12"/>
    </g>
    <g class="qed-ch__gridqubits">
      <circle cx="50" cy="40" r="14"/><circle cx="130" cy="40" r="14"/><circle cx="210" cy="40" r="14"/>
      <circle cx="50" cy="100" r="14"/><circle cx="130" cy="100" r="14"/><circle cx="210" cy="100" r="14"/>
      <circle cx="50" cy="160" r="14"/><circle cx="130" cy="160" r="14"/><circle cx="210" cy="160" r="14"/>
    </g>
    <text class="qed-ch__text qed-ch__text--tag" x="130" y="204" text-anchor="middle">a generic pattern, not a real layout</text>
  </svg>
  <p class="qed-ch__note">Circles are qubits and small squares are couplers. <span class="qed-ch__tag">invented pattern</span></p>
</div>

Two qubits that are **not linked** cannot interact directly. They need extra operations to bring them together, and what software does about that, the routing and the coupling map, is the subject of [Module 05](../05-software-stack/hardware-abstraction-and-backend-capabilities.md). Layouts differ between devices, and this page draws none of them.

<div class="qed-demo qed-pc" id="sc-row-5"></div>

## What Makes It Hard to Scale

Three reasons, one line each.

1. **Wiring and cooling.** Every qubit needs its own control line and some readout wiring from room temperature down to the chip<span data-cite="krinner2019"></span>, and the refrigerator has limited room and limited cooling power. Real processors use several control lines for every qubit, and share the readout lines among qubits<span data-cite="kjaergaard2020,arute2019"></span>.
2. **Fabrication.** No two qubits come out alike, so each must be measured and tuned (the loop on [Noise](noise.md)), and more qubits mean more tuning and more chance of a bad one.
3. **A crowded chip.** More neighbours means more ways to disturb them, which is the neighbours source on Noise.

First, a prediction.

<div class="qed-demo" id="sc-quiz-predict"></div>

Now try it with a model. Every number here is invented.

<div class="qed-demo qed-ch" id="sc-wiring">
  <p class="qed-demo__step"><strong>1. Choose a number of qubits</strong></p>
  <div class="qed-ch__group" role="radiogroup" aria-label="Number of qubits" id="sc-wiring-count"></div>
  <p class="qed-demo__step"><strong>2. Share the readout lines, or not</strong></p>
  <div class="qed-ch__group" role="group" aria-label="Sharing">
    <label class="qed-ch__opt"><input type="checkbox" id="sc-wiring-share"><span>Share readout lines</span></label>
  </div>
  <div class="qed-ch__panel">
    <p class="qed-ch__title">Lines into the refrigerator <span class="qed-ch__tag">invented</span> <span class="qed-ch__tag">computed from a simplified model</span></p>
    <div id="sc-wiring-bars"></div>
    <p class="qed-ch__note" id="sc-wiring-words" role="status" aria-live="polite"></p>
  </div>
</div>

The number of lines grows with the number of qubits. Sharing readout lines slows the growth, but it does not stop it. How any of this is being worked on is not a Beginner topic, and this page does not predict a limit.

<div class="qed-demo qed-pc" id="sc-row-6"></div>

## The Bell Circuit, Here

Module 04 asks, for every platform, how it would do the Bell circuit's three kinds of operation:

<div class="qed-demo qed-pc">
  <div id="sc-bell"></div>
  <div id="sc-bell-strip"></div>
</div>

**What usually goes wrong here.** Noise named five sources. Here is each one on this platform, in words and without numbers:

<div class="qed-demo qed-pc" id="sc-wrong"></div>

Which source is largest depends on the device and changes over time, as the Error Budget showed. This page ranks none of them.

## The Platform Card

Here is the whole card:

<div class="qed-demo qed-pc" id="sc-card"></div>

<p class="qed-pc__note" id="sc-card-note"></p>

Later pages add the cards of the other platforms. When a second card exists, a "compare with" control will appear here. Until then there is nothing to compare with.

## From One System to Another

For each question, this platform's answer, and what it cost:

<div class="qed-demo qed-pc" id="sc-recap"></div>

```
ONE INVENTED QUBIT                 A REAL PLATFORM
FIVE NEEDS, EACH ANSWERED   →      SIX ANSWERS, EACH WITH A COST
IN GENERAL
```

> **Superconducting qubits are fast, forget quickly, have fixed neighbours, and need a refrigerator and a wire for every qubit. What if the qubits remembered much longer, and any two could interact?**

A different physical system, a single charged atom held in empty space, answers the same six questions differently. That is the next page.

**Next: Trapped-Ion Qubits →** *(coming soon)*

## Sources

<p class="qed-pc__note" id="sc-sources-note"></p>

<div class="qed-pc__sources" id="sc-sources"></div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var P = window.QedPlatform;
  var C = window.QedChip;
  var L = window.QedLadder;
  var QC = window.QedCircuit;
  var S = window.QedShots;
  var Z = window.QedQuiz;
  if (!P || !C || !L || !QC || !S || !Z) return;

  var SC = "superconducting";
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- figures, citations, rows, and tables built from the shared modules ----
  Array.prototype.forEach.call(document.querySelectorAll("[data-fig]"), function (el) {
    el.innerHTML = P.figureHTML(SC, el.getAttribute("data-fig"));
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cite]"), function (el) {
    el.innerHTML = P.cite(el.getAttribute("data-cite").split(","), SC);
  });
  (function () {
    var f = P.platformById(SC).figures.frequency;
    $("sc-energy-temp").textContent = P.energyAsTemperature(f.low).toFixed(1) + " to " + P.energyAsTemperature(f.high).toFixed(1);
  })();

  $("sc-card-empty").innerHTML = P.cardHTML(SC, { empty: true });
  [1, 2, 3, 4, 5, 6].forEach(function (n) { $("sc-row-" + n).innerHTML = P.rowHTML(SC, n); });
  $("sc-card").innerHTML = P.cardHTML(SC);
  $("sc-card-note").textContent = "Figures change quickly. They are approximate ranges taken from the sources at the bottom of the page, last checked " + P.card(SC).figuresDate + ", and no range describes one device.";
  $("sc-recap").innerHTML = P.recapHTML(SC);
  $("sc-wrong").innerHTML = P.wrongHTML(SC);
  $("sc-bell").innerHTML = QC.renderSVG(QC.bell());
  $("sc-bell-strip").innerHTML = P.bellHTML(SC);
  $("sc-sources-note").textContent = "Figures last checked " + P.card(SC).figuresDate + ". Entries are numbered in the order they are first cited on this page.";
  $("sc-sources").innerHTML = P.referencesHTML(SC);
  $("sc-parts-table").innerHTML = C.listHTML();

  // ---- the invented ladder, and the ladder at three invented temperatures ----
  var ladder = L.levels("clear", "medium");
  $("sc-ladder").innerHTML = L.renderSVG(ladder);
  $("sc-cold-bars").innerHTML = S.renderBars(L.TEMPERATURES.map(function (t) {
    var zero = L.startShares(ladder, t.id).zero;
    return { label: t.label, fraction: zero, text: L.shareText(zero) + " in |0⟩", accent: "logical", labelWidth: "5rem" };
  }));

  // ---- Chip and Fridge ----
  var chosen = null;
  var buttons = {};
  $("sc-parts").innerHTML = C.PARTS.map(function (p) {
    return '<button type="button" class="qed-button qed-button--secondary qed-ch__btn" data-part-btn="' + p.id + '" aria-pressed="false">' + esc(p.label) + "</button>";
  }).join("");
  Array.prototype.forEach.call($("sc-parts").querySelectorAll("button"), function (b) {
    buttons[b.getAttribute("data-part-btn")] = b;
    b.addEventListener("click", function () { pick(b.getAttribute("data-part-btn")); });
  });

  function renderExplorer(announce) {
    $("sc-picture").innerHTML = C.renderSVG(chosen);
    Object.keys(buttons).forEach(function (id) { buttons[id].setAttribute("aria-pressed", id === chosen ? "true" : "false"); });
    if (chosen) {
      $("sc-role").innerHTML = C.roleHTML(chosen);
      $("sc-row").innerHTML = P.rowHTML(SC, C.role(chosen).question.n, { highlight: C.role(chosen).question.n });
      if (announce) $("sc-live").textContent = C.roleWords(chosen);
    } else {
      $("sc-role").innerHTML = '<p class="qed-ch__note">Choose a part to see its role.</p>';
      $("sc-row").innerHTML = '<p class="qed-ch__note">Choose a part to see the row of the card it fills.</p>';
      if (announce) $("sc-live").textContent = "The whole device is shown.";
    }
  }
  function pick(id) {
    chosen = id;
    renderExplorer(true);
  }
  $("sc-picture").addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== this) {
      if (t.getAttribute && t.getAttribute("data-part")) { pick(t.getAttribute("data-part")); return; }
      t = t.parentNode;
    }
  });
  $("sc-reset").addEventListener("click", function () {
    chosen = null;
    renderExplorer(true);
  });
  renderExplorer(false);

  // ---- the invented wiring model ----
  var wiringCount = C.QUBIT_COUNTS[1];
  $("sc-wiring-count").innerHTML = C.QUBIT_COUNTS.map(function (q) {
    return '<label class="qed-ch__opt"><input type="radio" name="sc-wiring-count" value="' + q + '"' + (q === wiringCount ? " checked" : "") + "><span>" + q + "</span></label>";
  }).join("");
  function renderWiring() {
    var shared = $("sc-wiring-share").checked;
    $("sc-wiring-bars").innerHTML = S.renderBars(C.wiringRows(shared).map(function (r) {
      return { label: r.label, fraction: r.fraction, text: r.text + (r.qubits === wiringCount ? " ← chosen" : ""), labelWidth: "6rem", textWidth: "7.5rem" };
    }));
    $("sc-wiring-words").textContent = C.wiringWords(wiringCount, shared);
  }
  Array.prototype.forEach.call($("sc-wiring-count").querySelectorAll("input"), function (input) {
    input.addEventListener("change", function () { wiringCount = Number(input.value); renderWiring(); });
  });
  $("sc-wiring-share").addEventListener("change", renderWiring);
  renderWiring();

  // ---- Checks ----
  Z.mount($("sc-quiz-concept"), { title: "Check", items: [{
    label: "Why the qubit is cold",
    prompt: "Is a superconducting qubit cold because the qubit is a cold object?",
    options: [
      { label: "Yes, a qubit is always a cold object", correct: false, why: "Other platforms are not cooled like this. Trapped ions and neutral atoms sit in vacuum and are handled with lasers." },
      { label: "No, the metal must be superconducting, and the qubit's levels are close in energy, so heat would jostle it", correct: true, why: "Those are the two reasons. Cold is this platform's answer, not a property of quantum computing." },
      { label: "No, it is cold only to make the wires cheaper", correct: false, why: "The cold is not about cost. The circuit is only a qubit when it is cold, because the metal has to be superconducting and heat would jostle its levels." }
    ]
  }] });

  Z.mount($("sc-quiz-transfer"), { title: "Transfer", items: [{
    label: "Whether fast gates and short lifetimes make a good platform",
    prompt: "A platform has fast gates and short lifetimes. Is it a good platform?",
    options: [
      { label: "Yes, fast gates are all that matter", correct: false, why: "A short lifetime limits how many operations fit. Fast gates help, and short lifetimes cost." },
      { label: "No, short lifetimes make it a poor platform", correct: false, why: "Short lifetimes cost, and fast gates help. Neither one settles it." },
      { label: "It is a trade-off, how many operations fit is a budget and not a promise, and comparing platforms comes later", correct: true, why: "This page does not rank platforms. The comparison is the last page in this group." }
    ]
  }, {
    label: "Where to look first when something goes wrong",
    prompt: "Where would you look for what goes wrong first?",
    options: [
      { label: "At the five sources of noise, and at the device's own measured figures", correct: true, why: "Which source is largest depends on the device and the time, so a device is measured, as the Error Budget showed." },
      { label: "At the name of the platform, since each one fails the same way", correct: false, why: "Platforms and devices fail differently, and the largest source changes with the device and the time." },
      { label: "Nowhere, a reported figure already says which source dominated", correct: false, why: "A reported figure is one number for all the sources together." }
    ]
  }] });

  Z.mount($("sc-quiz-predict"), { title: "Predict", items: [{
    label: "What doubling the qubits does to the lines into the refrigerator",
    prompt: "A superconducting chip has twice as many qubits. What happens to the number of lines running into the refrigerator? Pick one, then try it in the model.",
    options: [
      { label: "It grows with the number of qubits, and sharing lines slows the growth but does not stop it", correct: true, why: "Every qubit needs its own control line, so the number of lines rises with the qubits. Sharing readout lines saves some." },
      { label: "It stays the same, since the wires are shared", correct: false, why: "Sharing readout lines saves some, but each qubit still needs its own control line." },
      { label: "It falls, since bigger chips need fewer wires", correct: false, why: "More qubits need more control lines, not fewer." }
    ]
  }] });
});
</script>
