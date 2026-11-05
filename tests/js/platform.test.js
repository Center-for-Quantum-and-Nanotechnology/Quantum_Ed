// Tests for docs/assets/javascripts/platform.js (window.QedPlatform): the Platform Card for
// Module 04's qubit platforms, its approximate figures with their sources, and the one computed
// comparison. whatGoesWrong reads QedNoise.SOURCES at run time, so noise.js is loaded (with the
// modules it calls) alongside it.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["qubit.js", "gates.js", "shots.js", "drive.js", "coherence.js", "readout.js", "noise.js", "platform.js"]);
const P = w.QedPlatform;
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const SC = "superconducting";
const FIGURES = P.platformById(SC).figures;
const PAGE_ORDER = ["frequency", "temperature", "gate1", "gate2", "readout", "lifetime", "lifetimeBest"]; // the order the page cites them

// A second platform, for the cases that need one. It is added to PLATFORMS and removed again.
function withSecondPlatform(fn, overrides) {
  const second = clone(P.platformById(SC));
  second.id = "second";
  second.name = "A second platform";
  Object.keys(overrides || {}).forEach((k) => { second[k] = overrides[k]; });
  P.PLATFORMS.push(second);
  try { return fn(second); } finally { P.PLATFORMS.pop(); }
}

test("the six questions are as stated, in order", () => {
  assert.deepEqual(P.QUESTIONS.map((q) => q.n), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(P.QUESTIONS.map((q) => q.text), [
    "What is the qubit?",
    "How is it controlled?",
    "How is it read out?",
    "How long does it last, and how fast does it run?",
    "How do qubits connect?",
    "What makes it hard to scale?",
  ]);
});

test("the superconducting card answers every question, in the card's order", () => {
  const c = P.card(SC);
  assert.equal(c.rows.length, 6);
  assert.deepEqual(c.rows.map((r) => r.n), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(c.rows.map((r) => r.question), P.QUESTIONS.map((q) => q.text));
  c.rows.forEach((r) => {
    assert.ok(r.text.length > 0);
    assert.ok(r.cost.length > 0);
    assert.equal(r.applicable, true);
  });
  assert.equal(c.figuresDate, "2026-11-03");
});

test("a second platform's card has the same six questions, and adding it changes none of them", () => {
  const before = clone(P.QUESTIONS);
  withSecondPlatform(() => {
    assert.deepEqual(P.card("second").rows.map((r) => r.question), P.QUESTIONS.map((q) => q.text));
  });
  assert.deepEqual(P.QUESTIONS, before);
});

test("a field that does not apply is shown as not applicable and is never dropped", () => {
  const second = clone(P.platformById(SC));
  second.answers[0] = { question: 1, na: true, refs: [], text: "", cost: "" };
  withSecondPlatform(() => {
    const c = P.card("second");
    assert.equal(c.rows.length, 6);
    assert.equal(c.rows[0].applicable, false);
    assert.equal(c.rows[0].text, "not applicable");
    const html = P.cardHTML("second");
    assert.ok(html.includes("not applicable"));
    assert.equal((html.match(/<li class="qed-pc__row/g) || []).length, 6);
  }, { answers: second.answers });
});

test("every figure is a proper range or a floor, with plain words and no digits", () => {
  Object.keys(FIGURES).forEach((key) => {
    const f = FIGURES[key];
    assert.ok(f.words.length > 0, key);
    assert.ok(!/[0-9]/.test(f.words), key + " words carry no digit");
    assert.equal(typeof f.low, "number");
    if (f.kind === "floor") {
      assert.equal(f.high, undefined);
    } else {
      assert.ok(f.high > f.low, key + " has a high end above its low end");
    }
    assert.ok(P.format(f).startsWith("roughly "), key);
    if (f.typical) {
      assert.ok(f.typical.low >= f.low && f.typical.high <= f.high, key + " typical sits inside its range");
      assert.ok(f.typical.high > f.typical.low);
    }
  });
});

test("format refuses a single value, a missing high end, and missing words", () => {
  assert.throws(() => P.format({ low: 1, high: 1, unit: "s", words: "one" }), /high end/);
  assert.throws(() => P.format({ low: 1, unit: "s", words: "some" }), /high end/);
  assert.throws(() => P.format({ low: 1, high: 2, unit: "s" }), /words/);
  assert.throws(() => P.format({ high: 2, unit: "s", words: "some" }), /low end/);
  assert.equal(P.format({ kind: "floor", low: 1, unit: "s", words: "over one" }), "roughly over one");
});

test("the stated figures are as given on the page", () => {
  assert.deepEqual([FIGURES.temperature.low, FIGURES.temperature.high, FIGURES.temperature.unit], [0.01, 0.02, "K"]);
  assert.deepEqual([FIGURES.frequency.low, FIGURES.frequency.high, FIGURES.frequency.unit], [3e9, 6e9, "Hz"]);
  assert.deepEqual([FIGURES.gate1.low, FIGURES.gate1.high], [1e-8, 1e-7]);
  assert.deepEqual([FIGURES.gate2.low, FIGURES.gate2.high], [1e-8, 5e-7]);
  assert.deepEqual(FIGURES.gate2.typical, { low: 4e-8, high: 2e-7 });
  assert.deepEqual([FIGURES.readout.low, FIGURES.readout.high], [1e-7, 1e-6]);
  assert.deepEqual([FIGURES.lifetime.low, FIGURES.lifetime.high], [1e-5, 1e-3]);
  assert.deepEqual(FIGURES.lifetime.typical, { low: 5e-5, high: 1e-4 });
  assert.equal(FIGURES.lifetimeBest.low, 1e-3);
  assert.equal(P.format(FIGURES.temperature), "roughly ten to twenty millikelvin");
  assert.equal(P.format(FIGURES.gate1), "roughly tens of nanoseconds");
  assert.equal(P.format(FIGURES.gate2), "roughly tens to a few hundred nanoseconds");
  assert.equal(P.format(FIGURES.readout), "roughly a fraction of a microsecond to about a microsecond");
  assert.equal(P.format(FIGURES.lifetime), "roughly tens to hundreds of microseconds");
});

test("the operations that fit are the typical lifetime over the typical two-qubit gate time", () => {
  const f = P.fits(SC);
  close(f.low, 5e-5 / 2e-7, 1e-6);
  close(f.high, 1e-4 / 4e-8, 1e-6);
  assert.equal(Math.round(f.low), 250);
  assert.equal(Math.round(f.high), 2500);
  assert.equal(f.words, "hundreds to a few thousand");
});

test("the operations that fit change when a typical value changes", () => {
  withSecondPlatform(() => {
    assert.equal(P.fits("second").words, "tens of thousands to hundreds of thousands or more");
  }, { figures: Object.assign(clone(FIGURES), { lifetime: Object.assign(clone(FIGURES.lifetime), { typical: { low: 5e-3, high: 5e-2 } }) }) });
  withSecondPlatform(() => {
    assert.equal(P.fits("second").words, "tens");
  }, { figures: Object.assign(clone(FIGURES), { lifetime: Object.assign(clone(FIGURES.lifetime), { typical: { low: 1e-6, high: 2e-6 } }) }) });
});

test("fits refuses a platform with no typical values", () => {
  withSecondPlatform(() => {
    assert.throws(() => P.fits("second"), /typical/);
  }, { figures: Object.assign(clone(FIGURES), { gate2: { low: 1e-8, high: 5e-7, unit: "s", words: "x", refs: [1] } }) });
});

test("orderWords puts every boundary in the right band", () => {
  const cases = [[1, "tens"], [99, "tens"], [100, "hundreds"], [999, "hundreds"], [1000, "about a thousand"], [1999, "about a thousand"], [2000, "a few thousand"], [9999, "a few thousand"], [10000, "tens of thousands"], [99999, "tens of thousands"], [100000, "hundreds of thousands or more"]];
  cases.forEach(([n, words]) => assert.equal(P.orderWords(n), words, String(n)));
  assert.equal(P.orderWords(99.9999999996), "hundreds");
});

test("timesWords puts every boundary in the right band", () => {
  [[1, "several"], [9.99, "several"], [10, "tens of"], [99.99, "tens of"], [100, "hundreds of"], [1000, "hundreds of"]].forEach(([n, words]) => assert.equal(P.timesWords(n), words, String(n)));
  assert.equal(P.timesWords(9.9999999996), "tens of");
});

test("the computed figures cite the sources they were computed from", () => {
  const fits = P.figureHTML(SC, "fits");
  [1, 2, 4].forEach((n) => assert.ok(fits.includes('href="#ref-' + n + '"'), "fits cites " + n));
  const cold = P.figureHTML(SC, "coldRatio");
  [1, 2, 3].forEach((n) => assert.ok(cold.includes('href="#ref-' + n + '"'), "cold ratio cites " + n));
  const card = P.cardHTML(SC);
  assert.ok(card.includes("hundreds to a few thousand" + P.cite([1, 2, 4])));
});

test("the qubit's energy as a temperature uses the exact constants", () => {
  close(P.energyAsTemperature(1e9), 0.04799243073366221, 1e-12);
  close(P.energyAsTemperature(5e9), 5 * 0.04799243073366221, 1e-10);
  assert.equal(P.energyAsTemperature(0), 0);
});

test("the cold ratio is computed from the frequency and temperature ranges", () => {
  const r = P.coldRatio(SC);
  close(r.low, P.energyAsTemperature(3e9) / 0.02, 1e-9);
  close(r.high, P.energyAsTemperature(6e9) / 0.01, 1e-9);
  assert.ok(r.low > 7 && r.low < 7.3);
  assert.ok(r.high > 28.7 && r.high < 28.9);
  assert.equal(r.words, "several to tens of times");
});

test("the cold ratio's words follow its value", () => {
  withSecondPlatform(() => {
    assert.equal(P.coldRatio("second").words, "tens of times");
  }, { figures: Object.assign(clone(FIGURES), { temperature: { low: 0.005, high: 0.01, unit: "K", words: "x", refs: [2] } }) });
});

test("every figure and every answer cites at least one reference, and every reference exists", () => {
  Object.keys(FIGURES).forEach((key) => {
    assert.ok(FIGURES[key].refs.length > 0, key + " is cited");
    FIGURES[key].refs.forEach((n) => assert.equal(P.referenceByNumber(n).n, n));
  });
  P.platformById(SC).answers.forEach((a) => a.refs.forEach((n) => assert.equal(P.referenceByNumber(n).n, n)));
  assert.throws(() => P.referenceByNumber(8), /no reference/);
  assert.throws(() => P.cite([9]), /no reference/);
});

test("the references are seven, in the stated order, in the MRS style", () => {
  assert.equal(P.REFERENCES.length, 7);
  assert.deepEqual(P.REFERENCES.map((r) => r.n), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(P.REFERENCES.map(P.formatReference), [
    "P. Krantz, M. Kjaergaard, F. Yan, T.P. Orlando, S. Gustavsson, and W.D. Oliver, Appl. Phys. Rev. 6, 021318 (2019).",
    "M. Kjaergaard et al., Annu. Rev. Condens. Matter Phys. 11, 369 (2020).",
    "S. Krinner et al., EPJ Quantum Technol. 6, 2 (2019).",
    "Google Quantum AI and collaborators, Nature 638, 920 (2025).",
    "F. Arute et al., Nature 574, 505 (2019), Supplementary Information.",
    "T. Walter et al., Phys. Rev. Appl. 7, 054020 (2017).",
    "M.P. Bland et al., Nature 647, 343 (2025).",
  ]);
});

test("formatReference handles one, two, and many authors, and has no title", () => {
  const base = { journal: "J.", volume: "1", page: "2", year: 2000, note: "", etAl: false };
  assert.equal(P.formatReference(Object.assign({}, base, { authors: ["A. One"] })), "A. One, J. 1, 2 (2000).");
  assert.equal(P.formatReference(Object.assign({}, base, { authors: ["A. One", "B. Two"] })), "A. One and B. Two, J. 1, 2 (2000).");
  assert.equal(P.formatReference(Object.assign({}, base, { authors: ["A. One", "B. Two", "C. Three"] })), "A. One, B. Two, and C. Three, J. 1, 2 (2000).");
  assert.equal(P.formatReference(Object.assign({}, base, { authors: ["A. One"], etAl: true })), "A. One et al., J. 1, 2 (2000).");
  assert.equal(P.formatReference(Object.assign({}, base, { authors: ["A. One"], note: "Supplementary Information" })), "A. One, J. 1, 2 (2000), Supplementary Information.");
  P.REFERENCES.forEach((r) => assert.ok(!/["“”]/.test(P.formatReference(r)), "no quoted title"));
  P.REFERENCES.forEach((r) => assert.ok(P.formatReference(r).endsWith(")") || P.formatReference(r).endsWith("."), "ends cleanly"));
});

test("the numbering follows the order of first citation in the figures", () => {
  const seen = [];
  PAGE_ORDER.forEach((key) => FIGURES[key].refs.forEach((n) => { if (seen.indexOf(n) < 0) seen.push(n); }));
  assert.deepEqual(seen, [1, 2, 3, 4, 5, 6, 7]);
});

test("the Sources list is an ordered list with one linked entry for every reference", () => {
  const html = P.referencesHTML();
  assert.ok(html.startsWith('<ol class="qed-pc__refs">') && html.endsWith("</ol>"));
  assert.equal((html.match(/<li id="ref-/g) || []).length, 7);
  for (let n = 1; n <= 7; n++) assert.ok(html.includes('<li id="ref-' + n + '">'));
  assert.ok(html.includes("<em>Nature</em> <strong>638</strong>, 920 (2025)"));
  assert.ok(html.includes("<em>Phys. Rev. Appl.</em> <strong>7</strong>, 054020 (2017)"));
  const cardHtml = P.cardHTML(SC);
  const targets = (cardHtml.match(/href="#ref-\d+"/g) || []).map((s) => s.slice(6, -1));
  assert.ok(targets.length > 0);
  targets.forEach((id) => assert.ok(html.includes('id="' + id.slice(1) + '"'), id + " exists in the list"));
});

test("citation markers are superscript links with an accessible name", () => {
  assert.equal(P.cite([]), "");
  assert.equal(P.cite([2, 3]), '<sup class="qed-pc__cite"><a href="#ref-2" aria-label="Reference 2">2</a>,<a href="#ref-3" aria-label="Reference 3">3</a></sup>');
});

test("the card renders six numbered rows, each with its question, and cites its figures", () => {
  const html = P.cardHTML(SC);
  assert.ok(html.includes('<ol class="qed-pc__rows">'));
  assert.equal((html.match(/<li class="qed-pc__row/g) || []).length, 6);
  P.QUESTIONS.forEach((q) => assert.ok(html.includes(q.text)));
  assert.ok(html.includes("roughly ten to twenty millikelvin"));
  assert.ok(html.includes("roughly tens of nanoseconds"));
  assert.ok(html.includes("hundreds to a few thousand"));
  assert.ok(html.includes("computed from typical values in the sources"));
  assert.ok(html.includes("approximate"));
  assert.ok(html.includes("The ends of a range are not one device"));
  assert.ok(html.includes('aria-label="Platform Card: Superconducting qubits"'));
});

test("the empty card shows the questions and no answers", () => {
  const html = P.cardHTML(SC, { empty: true });
  assert.equal((html.match(/<li class="qed-pc__row/g) || []).length, 6);
  P.QUESTIONS.forEach((q) => assert.ok(html.includes(q.text)));
  assert.ok(!html.includes("millikelvin"));
  assert.ok(!html.includes("qed-pc__a"));
});

test("highlight marks exactly the chosen row", () => {
  const html = P.cardHTML(SC, { highlight: 3 });
  assert.equal((html.match(/qed-pc__row--on/g) || []).length, 1);
  assert.ok(/qed-pc__row qed-pc__row--on" data-question="3"/.test(html));
  assert.equal((P.cardHTML(SC).match(/qed-pc__row--on/g) || []).length, 0);
});

test("rows carry an id only when asked, so a page that shows the card twice repeats none", () => {
  assert.ok(!/ id="/.test(P.cardHTML(SC)));
  const a = P.cardHTML(SC, { idPrefix: "x-row-" });
  for (let n = 1; n <= 6; n++) assert.ok(a.includes(' id="x-row-' + n + '"'));
  assert.equal((a.match(/ id="x-row-/g) || []).length, 6);
});

test("one row of the card can be shown on its own", () => {
  const row = P.rowHTML(SC, 4);
  assert.equal((row.match(/<li class="qed-pc__row/g) || []).length, 1);
  assert.ok(row.includes("How long does it last, and how fast does it run?"));
  assert.ok(row.includes("One-qubit gate") && row.includes("Operations that fit in a lifetime"));
  assert.ok(!row.includes("What is the qubit?"));
  assert.ok(P.rowHTML(SC, 1, { empty: true }).indexOf("millikelvin") < 0);
  assert.throws(() => P.rowHTML(SC, 7), /no question/);
  assert.throws(() => P.rowHTML("nothing", 1), /no platform/);
});

test("answerHTML gives a paragraph for a plain answer and a list for the figures", () => {
  assert.ok(P.answerHTML(SC, P.QUESTIONS[1]).startsWith('<p class="qed-pc__a">'));
  assert.ok(P.answerHTML(SC, P.QUESTIONS[3]).startsWith('<ul class="qed-pc__items">'));
  assert.equal((P.answerHTML(SC, P.QUESTIONS[3]).match(/<li>/g) || []).length, 5);
});

test("the card shows no comparison control for one card, and compareWith waits for a second", () => {
  assert.ok(!/compare/i.test(P.cardHTML(SC)));
  assert.equal(P.compareWith([SC]), null);
  withSecondPlatform(() => {
    assert.deepEqual(P.compareWith([SC, "second"]), { ids: [SC, "second"] });
  });
  assert.throws(() => P.compareWith([SC, "nothing"]), /no platform/);
});

test("unknown ids are refused with a clear message", () => {
  assert.throws(() => P.platformById("nothing"), /QedPlatform: no platform called nothing/);
  assert.throws(() => P.card("nothing"), /no platform/);
  assert.throws(() => P.fits("nothing"), /no platform/);
  assert.throws(() => P.cardHTML("nothing"), /no platform/);
  assert.throws(() => P.answerText(SC, 9), /no answer/);
  assert.throws(() => P.figureHTML(SC, "nothing"), /no figure/);
});

test("answerText fills the figures into the words", () => {
  assert.ok(P.answerText(SC, 1).includes("roughly ten to twenty millikelvin in a dilution refrigerator"));
  assert.equal(P.answerText(SC, 2), "Microwave signals along wires from room-temperature electronics.");
});

test("figureHTML gives the words with the citations", () => {
  assert.ok(P.figureHTML(SC, "temperature").startsWith("roughly ten to twenty millikelvin"));
  assert.ok(P.figureHTML(SC, "temperature").includes('href="#ref-2"') && P.figureHTML(SC, "temperature").includes('href="#ref-3"'));
  assert.ok(P.figureHTML(SC, "lifetimeBest").startsWith("over a millisecond"));
  assert.ok(P.figureHTML(SC, "fits").startsWith("hundreds to a few thousand"));
  assert.ok(P.figureHTML(SC, "coldRatio").startsWith("several to tens of times"));
  assert.ok(P.figureWordsHTML(SC, "gate1").startsWith("tens of nanoseconds"));
});

test("what goes wrong here covers QedNoise's five sources, in its order, with no numbers", () => {
  const rows = P.whatGoesWrong(SC);
  assert.deepEqual(rows.map((r) => r.id), w.QedNoise.SOURCES.map((s) => s.id));
  assert.deepEqual(rows.map((r) => r.label), w.QedNoise.SOURCES.map((s) => s.label));
  rows.forEach((r) => {
    assert.ok(r.here.length > 0 && r.words.length > 0);
    assert.ok(!/[0-9]/.test(r.here), r.id + " has no number");
  });
  withSecondPlatform(() => {
    assert.throws(() => P.whatGoesWrong("second"), /no line for leakage/);
  }, { wrong: { environment: "x", control: "x", neighbours: "x", readout: "x" } });
});

test("the Bell strip, the table of what goes wrong, and the recap are real markup", () => {
  const bell = P.bellHTML(SC);
  ["A one-qubit rotation", "A two-qubit interaction", "A readout"].forEach((s) => assert.ok(bell.includes(s)));
  assert.equal((bell.match(/qed-pc__strip-item/g) || []).length, 3);
  const wrong = P.wrongHTML(SC);
  assert.ok(wrong.startsWith("<table"));
  assert.equal((wrong.match(/<tr>/g) || []).length, 6); // the header row and five sources
  assert.equal((wrong.match(/<th scope="row">/g) || []).length, 5);
  const recap = P.recapHTML(SC);
  assert.ok(recap.startsWith("<table"));
  assert.equal((recap.match(/<th scope="row">/g) || []).length, 6);
  assert.ok(recap.includes("The cost"));
  P.platformById(SC).answers.forEach((a) => assert.ok(recap.includes(a.cost), "the recap carries the cost of question " + a.question));
  assert.ok(recap.includes("Fast operations: roughly tens of nanoseconds for one qubit. Short memory: roughly tens to hundreds of microseconds."));
});

test("nothing names a vendor, a product, or a record", () => {
  const text = JSON.stringify(P.PLATFORMS);
  assert.ok(!/IBM|Google|Rigetti|Willow|Sycamore|Condor|Heron|Quantinuum|Helios|record/i.test(text));
  assert.ok(!/better|worse|best platform|fastest|winner/i.test(text.replace(/best laboratory devices/g, "")));
});

test("calling every function leaves the data unchanged", () => {
  const before = clone({ q: P.QUESTIONS, r: P.REFERENCES, p: P.PLATFORMS });
  P.card(SC); P.cardHTML(SC, { highlight: 2 }); P.cardHTML(SC, { empty: true }); P.fits(SC); P.coldRatio(SC);
  P.whatGoesWrong(SC); P.bellHTML(SC); P.wrongHTML(SC); P.recapHTML(SC); P.referencesHTML(); P.compareWith([SC]);
  P.REFERENCES.forEach(P.formatReference);
  assert.deepEqual(clone({ q: P.QUESTIONS, r: P.REFERENCES, p: P.PLATFORMS }), before);
});
