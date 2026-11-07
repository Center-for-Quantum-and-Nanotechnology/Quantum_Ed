// Shared module for Module 04's Platform Card: the six questions every qubit platform has to
// answer, the data for each platform, the approximate figures with the sources behind them, the
// computed comparisons, and a side-by-side view of two cards. Used by
// docs/04-hardware/superconducting-qubits.md (04.02.01) and trapped-ion-qubits.md (04.02.02) and
// intended for 04.02.03 to 04.02.05 (each adds a card to PLATFORMS) and 04.02.06 (which computes
// its comparison from the same data).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedPlatform must run inside a DOMContentLoaded
// listener. whatGoesWrong reads QedNoise.SOURCES at run time, so noise.js must be loaded first.
//
// Layers, kept apart (same convention as QedNoise / QedDrive):
//   model     -> QUESTIONS, REFERENCES, PLATFORMS, format, fits, coldRatio, card, answerText,
//                numberFor, whatGoesWrong, compareWith. Pure functions, no DOM.
//   rendering -> cite, figureHTML, cardHTML, rowHTML, bellHTML, wrongHTML, recapHTML,
//                referencesHTML, compareControlHTML, compareHTML, formatReference, referenceHTML
//                return strings
//   wiring    -> left to each page
//
// The figures are REAL, APPROXIMATE, and CONTESTABLE, unlike every earlier Module 04 number. They are
// ranges taken from the primary sources in REFERENCES (checked on each platform's figuresDate) and
// are written "roughly", never as one number. The ends of a range are not one device. They have not
// had a hardware expert's review. The one comparison computed here, the operations that fit in a
// lifetime, divides a typical lifetime by a typical two-qubit gate time (each a core of its range,
// read from the sources), and is labelled computed. A reference is stored ONCE, under an id; each
// platform lists the ids its page cites, in the order it cites them, and its numbers come from that
// list. The side-by-side view numbers the sources of the cards it shows by its own first citations.
// Nothing here names a vendor, a product, or a record qubit count, nothing ranks a platform, and the
// side-by-side view never sorts, highlights, charts, or judges.
window.QedPlatform = (function () {
  var ROUND = 1e9; // compare rounded to 1e-9 so a boundary is exact
  var PLANCK = 6.62607015e-34; // J s, exact in the SI
  var BOLTZMANN = 1.380649e-23; // J / K, exact in the SI

  // The six questions, in this order and these words (taxonomy section 9).
  var QUESTIONS = [
    { n: 1, id: "qubit", text: "What is the qubit?" },
    { n: 2, id: "control", text: "How is it controlled?" },
    { n: 3, id: "readout", text: "How is it read out?" },
    { n: 4, id: "speed", text: "How long does it last, and how fast does it run?" },
    { n: 5, id: "connect", text: "How do qubits connect?" },
    { n: 6, id: "scale", text: "What makes it hard to scale?" },
  ];

  // The sources, each stored once under an id. Material Research Society style: initials before the
  // surname, the journal abbreviated, the volume, the first page, and the year; no title. More than six
  // authors: the first author and "et al.".
  var REFERENCES = [
    { id: "krantz2019", authors: ["P. Krantz", "M. Kjaergaard", "F. Yan", "T.P. Orlando", "S. Gustavsson", "W.D. Oliver"], etAl: false, journal: "Appl. Phys. Rev.", volume: "6", page: "021318", year: 2019, note: "" },
    { id: "kjaergaard2020", authors: ["M. Kjaergaard"], etAl: true, journal: "Annu. Rev. Condens. Matter Phys.", volume: "11", page: "369", year: 2020, note: "" },
    { id: "krinner2019", authors: ["S. Krinner"], etAl: true, journal: "EPJ Quantum Technol.", volume: "6", page: "2", year: 2019, note: "" },
    { id: "google2025", authors: ["Google Quantum AI and collaborators"], etAl: false, journal: "Nature", volume: "638", page: "920", year: 2025, note: "" },
    { id: "arute2019", authors: ["F. Arute"], etAl: true, journal: "Nature", volume: "574", page: "505", year: 2019, note: "Supplementary Information" },
    { id: "walter2017", authors: ["T. Walter"], etAl: true, journal: "Phys. Rev. Appl.", volume: "7", page: "054020", year: 2017, note: "" },
    { id: "bland2025", authors: ["M.P. Bland"], etAl: true, journal: "Nature", volume: "647", page: "343", year: 2025, note: "" },
    { id: "bruzewicz2019", authors: ["C.D. Bruzewicz", "J. Chiaverini", "R. McConnell", "J.M. Sage"], etAl: false, journal: "Appl. Phys. Rev.", volume: "6", page: "021314", year: 2019, note: "" },
    { id: "ballance2016", authors: ["C.J. Ballance", "T.P. Harty", "N.M. Linke", "M.A. Sepiol", "D.M. Lucas"], etAl: false, journal: "Phys. Rev. Lett.", volume: "117", page: "060504", year: 2016, note: "" },
    { id: "pino2021", authors: ["J.M. Pino"], etAl: true, journal: "Nature", volume: "592", page: "209", year: 2021, note: "" },
    { id: "wang2017", authors: ["Y. Wang"], etAl: true, journal: "Nat. Photonics", volume: "11", page: "646", year: 2017, note: "" },
  ];

  // The superconducting figures. Each is a range in SI units with its plain words (after "roughly"),
  // the source ids that support it, and, where the comparison needs one, a typical core inside the
  // range. A "floor" has only a low end. Sources checked 2026-11-03.
  var SUPERCONDUCTING_FIGURES = {
    temperature: { low: 0.01, high: 0.02, unit: "K", words: "ten to twenty millikelvin", refs: ["kjaergaard2020", "krinner2019"] },
    frequency: { low: 3e9, high: 6e9, unit: "Hz", words: "three to six gigahertz", refs: ["krantz2019"] },
    gate1: { low: 1e-8, high: 1e-7, unit: "s", words: "tens of nanoseconds", refs: ["google2025"] },
    gate2: { low: 1e-8, high: 5e-7, unit: "s", words: "tens to a few hundred nanoseconds", refs: ["krantz2019", "kjaergaard2020", "google2025", "arute2019"], typical: { low: 4e-8, high: 2e-7 } },
    readout: { low: 1e-7, high: 1e-6, unit: "s", words: "a fraction of a microsecond to about a microsecond", refs: ["google2025", "walter2017"] },
    lifetime: { low: 1e-5, high: 1e-3, unit: "s", words: "tens to hundreds of microseconds", refs: ["kjaergaard2020", "google2025"], typical: { low: 5e-5, high: 1e-4 } },
    lifetimeBest: { kind: "floor", low: 1e-3, unit: "s", words: "over a millisecond", refs: ["bland2025"] },
  };

  // The trapped-ion figures. The coherence time is a T2 (phase-coherence) time, limited by technical
  // dephasing and not by the state's lifetime, so it is not the same quantity as the superconducting
  // row, and its label says so. Sources checked 2026-11-07.
  var ION_FIGURES = {
    motion: { low: 1e-5, high: 1e-3, unit: "K", words: "tens of microkelvin to a millikelvin", refs: ["bruzewicz2019"] },
    gate1: { low: 1e-6, high: 1e-4, unit: "s", words: "microseconds to tens of microseconds", refs: ["ballance2016", "pino2021"] },
    gate2: { low: 1e-6, high: 1e-3, unit: "s", words: "microseconds to hundreds of microseconds", refs: ["bruzewicz2019", "ballance2016", "pino2021"], typical: { low: 1e-5, high: 1e-4 } },
    readout: { low: 1e-5, high: 1e-3, unit: "s", words: "tens to hundreds of microseconds", refs: ["bruzewicz2019", "pino2021"] },
    lifetime: { low: 1, high: 600, unit: "s", words: "seconds to minutes", refs: ["bruzewicz2019", "ballance2016"], typical: { low: 1, high: 10 } },
    lifetimeBest: { kind: "floor", low: 600, unit: "s", words: "over ten minutes", refs: ["wang2017"] },
  };

  // The platforms. Each answer may hold tokens such as {temperature}, replaced by the figure's words
  // (and, in HTML, its citation). A field that does not apply is marked na and is shown, never hidden.
  // cost is the one-line cost of the answer, for the recap. wrong is the line for each of 04.01.05's five
  // sources of noise, in words and without numbers. sources lists the reference ids in the order the
  // platform's page first cites them. fitsRefs and coldRefs are the sources the computed figures use.
  var PLATFORMS = [
    {
      id: "superconducting",
      name: "Superconducting qubits",
      figuresDate: "2026-11-03",
      figures: SUPERCONDUCTING_FIGURES,
      sources: ["krantz2019", "kjaergaard2020", "krinner2019", "google2025", "arute2019", "walter2017", "bland2025"],
      fitsRefs: ["krantz2019", "kjaergaard2020", "google2025"],
      coldRefs: ["krantz2019", "kjaergaard2020", "krinner2019"],
      recap4: "Fast operations: roughly {gate1} for one qubit. Short memory: roughly {lifetime}.",
      answers: [
        { question: 1, na: false, refs: [], text: "A tiny engineered circuit on a chip, made from a superconducting metal and built around a Josephson junction, usually a transmon. It is kept at roughly {temperature} in a dilution refrigerator.", cost: "It needs a refrigerator, and no two come out exactly alike." },
        { question: 2, na: false, refs: [], text: "Microwave signals along wires from room-temperature electronics.", cost: "Every qubit needs a wire." },
        { question: 3, na: false, refs: [], text: "A resonator beside the qubit whose response changes with the qubit's state. A weak microwave probe is sent in, and the changed reflection is amplified.", cost: "The signal is weak, so it needs amplifying, and a readout is slow." },
        {
          question: 4, na: false, refs: [], text: "Fast operations and a short memory.", cost: "Fast operations, but the qubits forget quickly.",
          items: [
            { key: "gate1", label: "One-qubit gate", text: "roughly {gate1}" },
            { key: "gate2", label: "Two-qubit gate", text: "roughly {gate2}" },
            { key: "readout", label: "Readout", text: "roughly {readout}" },
            { key: "lifetime", label: "Energy-loss time (T1) and phase-loss time (T2)", text: "roughly {lifetime}, with the best laboratory devices {lifetimeBest}" },
            { key: "fits", label: "Operations that fit in a lifetime", text: "{fits}", computed: true },
          ],
        },
        { question: 5, na: false, refs: [], text: "Fixed neighbours: each qubit sits at a fixed place on the chip and is linked to a few neighbours through couplers.", cost: "Only linked qubits interact directly, so others need extra operations." },
        { question: 6, na: false, refs: ["kjaergaard2020", "krinner2019", "arute2019"], text: "Wiring and cooling, fabrication variation, and a crowded chip.", cost: "Wiring, cooling, and fabrication limit how many qubits fit." },
      ],
      bell: [
        { op: "drive", label: "A one-qubit rotation", how: "A microwave signal on the qubit's control line." },
        { op: "gate2", label: "A two-qubit interaction", how: "A gate between linked neighbours, through the coupler." },
        { op: "readout", label: "A readout", how: "The readout resonator, probed with a weak microwave signal." },
      ],
      wrong: {
        environment: "The cold stages and the shielding are there to keep it out, and the lifetimes are short.",
        control: "Microwave lines and electronics, and a setting that drifts.",
        neighbours: "Fixed neighbours disturb each other.",
        leakage: "Levels outside the qubit's two.",
        readout: "A weak signal.",
      },
    },
    {
      id: "trapped-ion",
      name: "Trapped-ion qubits",
      figuresDate: "2026-11-07",
      figures: ION_FIGURES,
      sources: ["bruzewicz2019", "ballance2016", "pino2021", "wang2017"],
      fitsRefs: ["bruzewicz2019", "ballance2016", "pino2021"],
      coldRefs: [],
      recap4: "Slow operations: roughly {gate2} for two qubits. Long memory: roughly {lifetime}.",
      answers: [
        { question: 1, na: false, refs: ["ballance2016", "pino2021"], text: "One real atom with an electric charge, held still by electric fields in a vacuum, with two of its own long-lived levels standing for 0 and 1. Its motion is cooled by laser light to roughly {motion}. The trap is often at room temperature, and some are cooled.", cost: "It needs a vacuum, a trap, and light to cool it." },
        { question: 2, na: false, refs: [], text: "Light, or microwaves, tuned to the gap between the two levels.", cost: "Light has to be aimed at each ion." },
        { question: 3, na: false, refs: [], text: "Light that only one state scatters: the ion shines (bright) or stays dark. A detector counts the photons.", cost: "The photon counts overlap, and a readout is slow." },
        {
          question: 4, na: false, refs: [], text: "Slow operations and a very long memory.", cost: "Slow operations, but a very long memory.",
          items: [
            { key: "gate1", label: "One-qubit gate", text: "roughly {gate1}" },
            { key: "gate2", label: "Two-qubit gate", text: "roughly {gate2}" },
            { key: "readout", label: "Readout", text: "roughly {readout}" },
            { key: "lifetime", label: "Coherence time (T2)", text: "roughly {lifetime}, with the best laboratory devices {lifetimeBest}" },
            { key: "fits", label: "Operations that fit in a lifetime", text: "{fits}", computed: true },
          ],
        },
        { question: 5, na: false, refs: [], text: "A chain: ions held together share their motion, so any two can interact. A longer chain makes it harder.", cost: "A longer chain is slower and harder to use." },
        { question: 6, na: false, refs: ["pino2021"], text: "Longer chains, light to every ion, and the cost of moving ions between regions.", cost: "Chains, light, and moving ions limit how many qubits fit." },
      ],
      bell: [
        { op: "drive", label: "A one-qubit rotation", how: "A light or microwave pulse on the ion." },
        { op: "gate2", label: "A two-qubit interaction", how: "Light on two ions, through their shared motion." },
        { op: "readout", label: "A readout", how: "Light scattered, bright or dark." },
      ],
      wrong: {
        environment: "Stray magnetic fields, and heating of the ion's motion, which limit the memory.",
        control: "The strength, aim, and timing of the light.",
        neighbours: "Light meant for one ion reaching the next, and ions disturbing each other.",
        leakage: "The ion ends in a level outside its two.",
        readout: "Photon counts that overlap.",
      },
    },
  ];

  function find(list, key, value, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i][key] === value) return list[i];
    }
    throw new Error("QedPlatform: no " + what + " called " + value);
  }
  function platformById(id) { return find(PLATFORMS, "id", id, "platform"); }
  function referenceById(id) { return find(REFERENCES, "id", id, "reference"); }
  function questionByNumber(n) { return find(QUESTIONS, "n", n, "question"); }

  // The number a page gives a source: its place in the platform's own list of sources, from 1.
  function numberFor(platformId, refId) {
    referenceById(refId);
    var i = platformById(platformId).sources.indexOf(refId);
    if (i < 0) throw new Error("QedPlatform: " + platformId + " does not cite " + refId);
    return i + 1;
  }

  function round(x) { return Math.round(x * ROUND) / ROUND; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function figureOf(id, key) {
    var f = platformById(id).figures[key];
    if (!f) throw new Error("QedPlatform: no figure called " + key);
    return f;
  }

  // A range as words, always "roughly" and never one number. A range has a low end below its high end,
  // and a floor has only a low end. Anything else is refused.
  function format(range) {
    if (!range || typeof range.words !== "string" || range.words === "") throw new Error("QedPlatform: a range needs its words");
    if (typeof range.low !== "number" || !isFinite(range.low)) throw new Error("QedPlatform: a range needs a low end");
    if (range.kind !== "floor" && !(typeof range.high === "number" && round(range.high) > round(range.low))) {
      throw new Error("QedPlatform: a range needs a high end above its low end");
    }
    return "roughly " + range.words;
  }

  // ---- the computed comparison -----------------------------------------------------------

  // How many (a count) as words, in orders of magnitude.
  function orderWords(n) {
    var r = round(n);
    if (r < 100) return "tens";
    if (r < 1000) return "hundreds";
    if (r < 2000) return "about a thousand";
    if (r < 10000) return "a few thousand";
    if (r < 100000) return "tens of thousands";
    if (r < 1000000) return "hundreds of thousands";
    return "a million or more";
  }

  function span(low, high, wordsOf) {
    var a = wordsOf(low), b = wordsOf(high);
    return a === b ? a : a + " to " + b;
  }

  // The operations that fit in a lifetime: the typical lifetime over the typical two-qubit gate time,
  // as a range and as an order of magnitude. The ends are not one device.
  function fits(id) {
    var life = figureOf(id, "lifetime").typical;
    var gate = figureOf(id, "gate2").typical;
    if (!life || !gate) throw new Error("QedPlatform: no typical values for " + id);
    var low = life.low / gate.high;
    var high = life.high / gate.low;
    return { low: low, high: high, words: span(low, high, orderWords) };
  }

  // A qubit's energy as the temperature at which the heat is the same size: h f / k.
  function energyAsTemperature(hertz) { return PLANCK * hertz / BOLTZMANN; }

  function timesWords(n) {
    var r = round(n);
    if (r < 10) return "several";
    if (r < 100) return "tens of";
    return "hundreds of";
  }

  // How much colder the platform runs than its qubit's energy: the lowest frequency over the
  // warmest temperature, to the highest frequency over the coldest temperature.
  function coldRatio(id) {
    var f = figureOf(id, "frequency");
    var t = figureOf(id, "temperature");
    var low = energyAsTemperature(f.low) / t.high;
    var high = energyAsTemperature(f.high) / t.low;
    var a = timesWords(low), b = timesWords(high);
    var words = a === b ? a + " times" : a + " to " + b + " times";
    return { low: low, high: high, words: words };
  }

  // ---- the card ---------------------------------------------------------------------------

  // The words of one figure, after checking it is a proper range (or a floor).
  function figureWords(f) {
    if (f.kind !== "floor") format(f);
    return f.words;
  }

  // The words of an answer with its figures filled in (plain text, no citations).
  function tokenText(id, text) {
    return text.replace(/\{(\w+)\}/g, function (m, key) {
      if (key === "fits") return fits(id).words;
      return figureWords(figureOf(id, key));
    });
  }

  function answerText(id, question) {
    var a = find(platformById(id).answers, "question", question, "answer");
    return tokenText(id, a.text);
  }

  function card(id) {
    var p = platformById(id);
    var rows = QUESTIONS.map(function (q) {
      var a = find(p.answers, "question", q.n, "answer");
      return {
        n: q.n,
        question: q.text,
        applicable: !a.na,
        text: a.na ? "not applicable" : tokenText(id, a.text),
        items: (a.items || []).map(function (it) {
          return { key: it.key, label: it.label, text: tokenText(id, it.text), computed: !!it.computed };
        }),
        refs: a.refs.slice(),
        cost: a.cost,
      };
    });
    return { id: p.id, name: p.name, figuresDate: p.figuresDate, rows: rows };
  }

  // The five sources of noise for a platform: the names and plain words come from QedNoise at run
  // time, and the line for this platform from its data. No number, and no ranking.
  function whatGoesWrong(id) {
    var p = platformById(id);
    return window.QedNoise.SOURCES.map(function (src) {
      if (!p.wrong[src.id]) throw new Error("QedPlatform: " + id + " has no line for " + src.id);
      return { id: src.id, label: src.label, words: src.words, here: p.wrong[src.id] };
    });
  }

  // Nothing to compare until a second card exists. A platform is never offered if it has no card.
  function compareWith(ids) {
    ids.forEach(function (id) { platformById(id); });
    return ids.length >= 2 ? { ids: ids.slice() } : null;
  }

  // ---- references -------------------------------------------------------------------------

  // A reference in the MRS style, as plain text.
  function authorsText(ref) {
    var a = ref.authors;
    if (ref.etAl) return a[0] + " et al.";
    if (a.length === 1) return a[0];
    if (a.length === 2) return a[0] + " and " + a[1];
    return a.slice(0, -1).join(", ") + ", and " + a[a.length - 1];
  }

  function formatReference(ref) {
    return authorsText(ref) + ", " + ref.journal + " " + ref.volume + ", " + ref.page + " (" + ref.year + ")" + (ref.note ? ", " + ref.note : "") + ".";
  }

  // The same, with the journal in italics and the volume in bold.
  function referenceHTML(ref) {
    return esc(authorsText(ref)) + ", <em>" + esc(ref.journal) + "</em> <strong>" + esc(ref.volume) + "</strong>, " + esc(ref.page) + " (" + ref.year + ")" +
      (ref.note ? ", " + esc(ref.note) : "") + ".";
  }

  // A citation context says how a source gets its number and what its link is called. A page's own
  // context numbers by the platform's list of sources. The side-by-side view makes its own.
  function pageCtx(id) {
    platformById(id);
    return { num: function (refId) { return numberFor(id, refId); }, prefix: "ref-" };
  }

  function citeWith(ids, ctx) {
    if (!ids || !ids.length) return "";
    var links = ids.map(function (refId) {
      var n = ctx.num(refId);
      return '<a href="#' + ctx.prefix + n + '" aria-label="Reference ' + n + '">' + n + "</a>";
    }).join(",");
    return '<sup class="qed-pc__cite">' + links + "</sup>";
  }

  // Superscript citation markers for a platform's page, each a link to its entry in the Sources list.
  function cite(ids, platformId) { return citeWith(ids, pageCtx(platformId)); }

  function listHTML(ids, prefix) {
    var items = ids.map(function (refId, i) {
      return '<li id="' + prefix + (i + 1) + '">' + referenceHTML(referenceById(refId)) + "</li>";
    }).join("");
    return '<ol class="qed-pc__refs">' + items + "</ol>";
  }

  // A platform's Sources list, numbered in the order its page first cites them.
  function referencesHTML(platformId) { return listHTML(platformById(platformId).sources, "ref-"); }

  // ---- rendering --------------------------------------------------------------------------

  // A figure's words with its citation, for a sentence on the page ("roughly ten to twenty millikelvin").
  function figureHTML(id, key) {
    var p = platformById(id);
    var ctx = pageCtx(id);
    if (key === "fits") return esc(fits(id).words) + citeWith(p.fitsRefs, ctx);
    if (key === "coldRatio") return esc(coldRatio(id).words) + citeWith(p.coldRefs, ctx);
    var f = figureOf(id, key);
    return esc(f.kind === "floor" ? f.words : format(f)) + citeWith(f.refs, ctx);
  }

  // The same, for a sentence that already says "roughly" (the words only).
  function figureWordsHTML(id, key, ctx) {
    var f = figureOf(id, key);
    return esc(figureWords(f)) + citeWith(f.refs, ctx || pageCtx(id));
  }

  function tokenHTML(id, text, ctx) {
    ctx = ctx || pageCtx(id);
    var p = platformById(id);
    var out = "";
    var last = 0;
    text.replace(/\{(\w+)\}/g, function (m, key, at) {
      out += esc(text.slice(last, at));
      last = at + m.length;
      if (key === "fits") {
        out += esc(fits(id).words) + citeWith(p.fitsRefs, ctx);
      } else {
        out += figureWordsHTML(id, key, ctx);
      }
      return m;
    });
    return out + esc(text.slice(last));
  }

  // The answer to one question, as markup: a paragraph, or a list of the figures with their tags.
  function answerHTML(id, q, ctx) {
    ctx = ctx || pageCtx(id);
    var a = find(platformById(id).answers, "question", q.n, "answer");
    if (a.na) return '<p class="qed-pc__a"><span class="qed-pc__tag">not applicable</span></p>';
    if (a.items) {
      return '<ul class="qed-pc__items">' + a.items.map(function (it) {
        var tag = it.computed ? ' <span class="qed-pc__tag">computed from typical values in the sources</span>' : ' <span class="qed-pc__tag">approximate</span>';
        return "<li><strong>" + esc(it.label) + ":</strong> " + tokenHTML(id, it.text, ctx) + tag + "</li>";
      }).join("") + "</ul>" +
        '<p class="qed-pc__note">The ends of a range are not one device. Operations that fit is a budget, not a promise.</p>';
    }
    return '<p class="qed-pc__a">' + tokenHTML(id, a.text, ctx) + citeWith(a.refs, ctx) + "</p>";
  }

  // One numbered row. opts.empty shows only the question, opts.highlight a question number to mark,
  // and opts.idPrefix gives the row an id (so a page that shows the card twice repeats none).
  function rowItemHTML(id, q, opts) {
    var on = opts.highlight === q.n;
    var head = '<p class="qed-pc__q"><span class="qed-pc__n">' + q.n + "</span> " + esc(q.text) + (on ? ' <span class="qed-pc__tag">this row</span>' : "") + "</p>";
    return '<li class="qed-pc__row' + (on ? " qed-pc__row--on" : "") + '"' + (opts.idPrefix ? ' id="' + opts.idPrefix + q.n + '"' : "") + ' data-question="' + q.n + '">' +
      head + (opts.empty ? "" : answerHTML(id, q)) + "</li>";
  }

  // The Platform Card: six numbered rows.
  function cardHTML(id, opts) {
    opts = opts || {};
    var p = platformById(id);
    var rows = QUESTIONS.map(function (q) { return rowItemHTML(id, q, opts); }).join("");
    return '<div class="qed-pc__card" role="group" aria-label="Platform Card: ' + esc(p.name) + '">' +
      '<p class="qed-pc__title">Platform Card: ' + esc(p.name) + (opts.empty ? "" : ' <span class="qed-pc__tag">approximate ranges</span>') + "</p>" +
      '<ol class="qed-pc__rows">' + rows + "</ol></div>";
  }

  // One row of the card on its own (for the explorer, and for the speed section).
  function rowHTML(id, n, opts) {
    platformById(id);
    return '<div class="qed-pc__card"><ol class="qed-pc__rows" start="' + n + '">' + rowItemHTML(id, questionByNumber(n), opts || {}) + "</ol></div>";
  }

  // The Bell circuit's three operations, here (the recurring strip).
  function bellHTML(id) {
    var items = platformById(id).bell.map(function (b) {
      return '<div class="qed-pc__strip-item"><strong>' + esc(b.label) + "</strong> → " + esc(b.how) + "</div>";
    }).join("");
    return '<div class="qed-pc__strip">' + items + "</div>";
  }

  // What usually goes wrong here, tied to the five sources of noise, as a real table.
  function wrongHTML(id) {
    var rows = whatGoesWrong(id).map(function (r) {
      return '<tr><th scope="row"><span class="qed-pc__src">' + esc(r.label) + '</span></th><td data-label="Here">' + esc(r.here) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Source of noise</th><th scope="col">Here</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // The recap: each question, this platform's answer in short, and what it cost, in the card's order.
  function recapHTML(id) {
    var p = platformById(id);
    var rows = QUESTIONS.map(function (q) {
      var a = find(p.answers, "question", q.n, "answer");
      var short = tokenText(id, q.n === 4 ? p.recap4 : a.text);
      return '<tr><th scope="row"><span class="qed-pc__n">' + q.n + "</span> " + esc(q.text) + '</th><td data-label="The answer">' + esc(short) + '</td><td data-label="The cost">' + esc(a.cost) + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Question</th><th scope="col">The answer</th><th scope="col">The cost</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // ---- the side-by-side view --------------------------------------------------------------

  // The selector for the "compare with" control: "None", then every OTHER platform that has a card.
  // Nothing at all when there is no other card, so no page offers a comparison with a platform that
  // has not been built.
  function compareControlHTML(id, opts) {
    platformById(id);
    opts = opts || {};
    var others = PLATFORMS.filter(function (p) { return p.id !== id; });
    if (!others.length) return "";
    var selectId = opts.id || "pc-compare";
    return '<div class="qed-pc__compare"><label class="qed-pc__compare-label" for="' + esc(selectId) + '">Compare with</label> ' +
      '<select class="qed-pc__select" id="' + esc(selectId) + '"><option value="">None</option>' +
      others.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + "</option>"; }).join("") + "</select></div>";
  }

  // The cards side by side, the first being the current page's: the same six rows in the same order,
  // each platform's own words, figures, tags, and labels. It never sorts, highlights, charts, or
  // judges. It numbers its sources by its own first citations and lists them beneath it. Nothing for
  // fewer than two cards.
  function compareHTML(ids) {
    ids.forEach(platformById);
    if (ids.length < 2) return "";
    var order = [];
    var ctx = {
      prefix: "cmp-ref-",
      num: function (refId) {
        referenceById(refId);
        var i = order.indexOf(refId);
        if (i < 0) { order.push(refId); i = order.length - 1; }
        return i + 1;
      },
    };
    var rows = QUESTIONS.map(function (q) {
      var cols = ids.map(function (pid) {
        var p = platformById(pid);
        return '<div class="qed-pc__cmp-col"><p class="qed-pc__cmp-name">' + esc(p.name) + ' <span class="qed-pc__tag">checked ' + esc(p.figuresDate) + "</span></p>" + answerHTML(pid, q, ctx) + "</div>";
      }).join("");
      var note = "";
      if (q.n === 4) {
        var labels = ids.map(function (pid) {
          return find(find(platformById(pid).answers, "question", 4, "answer").items, "key", "lifetime", "item").label;
        });
        if (labels.some(function (l) { return l !== labels[0]; })) {
          note = '<p class="qed-pc__note">The memory rows are labelled differently because they are not the same quantity.</p>';
        }
      }
      return '<li class="qed-pc__cmp-row" data-question="' + q.n + '"><p class="qed-pc__q"><span class="qed-pc__n">' + q.n + "</span> " + esc(q.text) + "</p>" +
        '<div class="qed-pc__cmp-cols">' + cols + "</div>" + note + "</li>";
    }).join("");
    var names = ids.map(function (pid) { return platformById(pid).name; }).join(" and ");
    return '<div class="qed-pc__cmp" role="group" aria-label="Platform Cards side by side: ' + esc(names) + '">' +
      '<p class="qed-pc__note">A side-by-side reading is not a ranking. Figures change quickly, and the ends of a range are not one device.</p>' +
      '<ol class="qed-pc__cmp-rows">' + rows + "</ol>" +
      '<p class="qed-pc__title">Sources for this comparison</p>' + listHTML(order, "cmp-ref-") + "</div>";
  }

  return {
    ROUND: ROUND,
    QUESTIONS: QUESTIONS,
    REFERENCES: REFERENCES,
    PLATFORMS: PLATFORMS,
    platformById: platformById,
    referenceById: referenceById,
    numberFor: numberFor,
    questionByNumber: questionByNumber,
    format: format,
    orderWords: orderWords,
    timesWords: timesWords,
    fits: fits,
    energyAsTemperature: energyAsTemperature,
    coldRatio: coldRatio,
    answerText: answerText,
    card: card,
    whatGoesWrong: whatGoesWrong,
    compareWith: compareWith,
    formatReference: formatReference,
    referenceHTML: referenceHTML,
    cite: cite,
    referencesHTML: referencesHTML,
    figureHTML: figureHTML,
    figureWordsHTML: figureWordsHTML,
    cardHTML: cardHTML,
    rowHTML: rowHTML,
    answerHTML: answerHTML,
    bellHTML: bellHTML,
    wrongHTML: wrongHTML,
    recapHTML: recapHTML,
    compareControlHTML: compareControlHTML,
    compareHTML: compareHTML,
  };
})();
