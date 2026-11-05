// Tests for docs/assets/javascripts/chip.js (window.QedChip): the six parts of a superconducting
// chip and fridge, the needs and sources each serves and brings, a schematic, and the invented
// wiring model. QedChip reads QedLadder.NEEDS, QedNoise.SOURCES, and QedPlatform.questionByNumber
// at run time, so those are loaded.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["qubit.js", "gates.js", "shots.js", "drive.js", "coherence.js", "readout.js", "ladder.js", "noise.js", "platform.js", "chip.js"]);
const C = w.QedChip;
const clone = (o) => JSON.parse(JSON.stringify(o));

const IDS = ["qubit", "coupler", "control", "readout", "cold", "wiring"];

test("the six parts are as stated, in order", () => {
  assert.deepEqual(C.PARTS.map((p) => p.id), IDS);
  assert.deepEqual(C.PARTS.map((p) => p.label), ["The qubit", "The coupler", "The control line", "The readout resonator", "The cold stages", "The wiring"]);
});

test("the five needs have the badge numbers of 04.01.01", () => {
  assert.deepEqual(C.needs().map((n) => [n.n, n.id, n.label]), [[1, "start", "Start"], [2, "control", "Control"], [3, "connect", "Connect"], [4, "read", "Read"], [5, "keep", "Keep"]]);
});

test("every part has a need, a source that exists in QedNoise, and a card question from one to six", () => {
  const needIds = C.needs().map((n) => n.id);
  const sourceIds = w.QedNoise.SOURCES.map((s) => s.id);
  C.PARTS.forEach((p) => {
    assert.ok(p.needs.length > 0 && p.sources.length > 0, p.id);
    p.needs.forEach((n) => assert.ok(needIds.includes(n), p.id + " need " + n));
    p.sources.forEach((s) => assert.ok(sourceIds.includes(s), p.id + " source " + s));
    assert.ok(p.question >= 1 && p.question <= 6 && Number.isInteger(p.question));
    assert.ok(p.what.length > 0 && p.does.length > 0);
  });
});

test("the map from parts to needs, sources, and questions is as stated", () => {
  const map = {};
  C.PARTS.forEach((p) => { map[p.id] = [p.needs, p.sources, p.question]; });
  assert.deepEqual(map, {
    qubit: [["start", "keep"], ["environment", "leakage"], 1],
    coupler: [["connect"], ["neighbours"], 5],
    control: [["control"], ["control"], 2],
    readout: [["read"], ["readout"], 3],
    cold: [["keep"], ["environment"], 1],
    wiring: [["control", "read"], ["control", "environment"], 6],
  });
});

test("every need, every source, and every card question is covered by some part", () => {
  const needs = new Set(), sources = new Set(), questions = new Set();
  C.PARTS.forEach((p) => { p.needs.forEach((n) => needs.add(n)); p.sources.forEach((s) => sources.add(s)); questions.add(p.question); });
  assert.equal(needs.size, 5);
  assert.equal(sources.size, 5);
  // question 4 (how long, how fast) is a number about the whole device, not a part of it
  assert.deepEqual([...questions].sort((a, b) => a - b), [1, 2, 3, 5, 6]);
});

test("role gives the needs with badges, the source names from QedNoise, and the card question", () => {
  const r = C.role("wiring");
  assert.deepEqual(r.needs.map((n) => [n.n, n.label]), [[2, "Control"], [4, "Read"]]);
  assert.deepEqual(r.sources.map((s) => s.label), ["Control", "Environment"]);
  assert.deepEqual(r.question, { n: 6, text: "What makes it hard to scale?" });
  assert.equal(C.role("readout").question.text, "How is it read out?");
});

test("roleWords is a sentence naming the need, the source, and the question", () => {
  const s = C.roleWords("coupler");
  assert.ok(s.includes("need 3, connect") && s.includes("the neighbours") && s.includes("question 5"));
});

test("unknown ids are refused with a clear message", () => {
  assert.throws(() => C.partById("nothing"), /QedChip: no part called nothing/);
  assert.throws(() => C.role("nothing"), /no part/);
  assert.throws(() => C.renderSVG("nothing"), /no part/);
  assert.throws(() => C.roleHTML("nothing"), /no part/);
});

test("the wiring count is as stated, and rises with the number of qubits", () => {
  assert.deepEqual(C.QUBIT_COUNTS, [4, 16, 64, 256, 1024]);
  assert.equal(C.SHARE_GROUP, 4);
  assert.deepEqual(C.wiring(16, false), { qubits: 16, shared: false, control: 16, readout: 16, total: 32 });
  assert.deepEqual(C.wiring(16, true), { qubits: 16, shared: true, control: 16, readout: 4, total: 20 });
  assert.deepEqual(C.wiring(1024, true), { qubits: 1024, shared: true, control: 1024, readout: 256, total: 1280 });
  [false, true].forEach((shared) => {
    let last = 0;
    C.QUBIT_COUNTS.forEach((q) => { const t = C.wiring(q, shared).total; assert.ok(t > last); last = t; });
  });
});

test("sharing gives fewer lines from four qubits up, and the count still grows", () => {
  C.QUBIT_COUNTS.forEach((q) => assert.ok(C.wiring(q, true).total < C.wiring(q, false).total, q + " qubits"));
  assert.ok(C.wiring(1024, true).total > C.wiring(4, true).total * 100);
});

test("the wiring refuses a number of qubits outside the list", () => {
  [0, 3, 5, 100, 2048, -4, 4.5, "4", undefined].forEach((q) => assert.throws(() => C.wiring(q, false), /must be one of/, String(q)));
});

test("a shared readout line serves four qubits, with no remainder for any allowed count", () => {
  // every allowed count is a multiple of the group size, so rounding up and down agree here
  C.QUBIT_COUNTS.forEach((q) => {
    assert.equal(q % C.SHARE_GROUP, 0, q + " is a multiple of the group size");
    assert.equal(C.wiring(q, true).readout, q / C.SHARE_GROUP);
  });
  assert.equal(C.wiring(4, true).readout, 1);
});

test("the wiring rows are on a fixed scale and are labelled", () => {
  const rows = C.wiringRows(false);
  assert.equal(rows.length, 5);
  assert.equal(rows[4].fraction, 1);
  assert.equal(rows[0].label, "4 qubits");
  assert.equal(rows[0].text, "8 lines");
  rows.forEach((r) => assert.ok(r.fraction > 0 && r.fraction <= 1));
  const shared = C.wiringRows(true);
  assert.ok(shared[4].fraction < 1 && shared[4].fraction === 1280 / 2048);
});

test("the wiring words state the counts and whether readout lines are shared", () => {
  assert.equal(C.wiringWords(16, false), "16 qubits need 16 control lines and 16 readout lines, 32 lines in all, with a readout line for every qubit.");
  assert.equal(C.wiringWords(16, true), "16 qubits need 16 control lines and 4 readout lines, 20 lines in all, with each readout line shared by 4 qubits.");
});

test("the schematic is an SVG with a text alternative and one labelled group for each part", () => {
  const svg = C.renderSVG();
  assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"));
  assert.ok(svg.includes('role="img"') && svg.includes('aria-label="A simplified schematic, not a layout and not to scale.'));
  IDS.forEach((id) => assert.equal((svg.match(new RegExp('data-part="' + id + '"', "g")) || []).length, 1, id));
  ["cold stages", "wiring", "qubit", "coupler", "control line", "readout resonator", "shield", "chip, simplified, not to scale", "room-temperature electronics"].forEach((s) => assert.ok(svg.includes(">" + s + "<"), s));
  assert.ok(!/qed-ch__part--on/.test(svg));
  assert.ok(!/qed-ch__svg--picked/.test(svg));
});

test("choosing a part marks exactly that part", () => {
  IDS.forEach((id) => {
    const svg = C.renderSVG(id);
    assert.equal((svg.match(/qed-ch__part--on/g) || []).length, 1, id);
    assert.ok(svg.includes('qed-ch__part qed-ch__part--' + id + ' qed-ch__part--on" data-part="' + id + '"'));
    assert.ok(svg.includes("qed-ch__svg--picked"));
  });
});

test("the schematic shows two qubits, two control lines made of two strokes each, and a dash-dot readout line", () => {
  const svg = C.renderSVG();
  assert.equal((svg.match(/class="qed-ch__qubit"/g) || []).length, 2);
  assert.equal((svg.match(/class="qed-ch__control"/g) || []).length, 4);
  assert.equal((svg.match(/class="qed-ch__rline"/g) || []).length, 2);
  assert.equal((svg.match(/class="qed-ch__arrow"/g) || []).length, 2);
  assert.equal((svg.match(/class="qed-ch__plate"/g) || []).length, 4);
});

test("the schematic names no vendor, product, or count", () => {
  assert.ok(!/IBM|Google|Rigetti|Willow|Sycamore|Condor|Heron/i.test(C.renderSVG() + C.chipText()));
  assert.ok(C.chipText().includes("not a layout and not to scale"));
});

test("the parts table is a real table with a row for each part", () => {
  const html = C.listHTML();
  assert.ok(html.startsWith("<table"));
  assert.equal((html.match(/<th scope="row">/g) || []).length, 6);
  C.PARTS.forEach((p) => assert.ok(html.includes(p.label)));
  assert.ok(html.includes('class="qed-ch__badge">1</span> Start'));
  assert.ok(html.includes('class="qed-ch__src">Neighbours</span>'));
});

test("the role lines are separate, and the source is an orange tag", () => {
  const html = C.roleHTML("readout");
  assert.ok(html.includes("<strong>What it is:</strong>") && html.includes("<strong>What it does:</strong>"));
  assert.ok(html.includes("<strong>Needs it serves:</strong>") && html.includes("<strong>Source of noise it brings:</strong>"));
  assert.ok(html.includes("<strong>Platform Card question it answers:</strong> 3, How is it read out?"));
  assert.ok(html.includes('class="qed-ch__src">Readout</span>'));
});

test("inputs and data are left unchanged", () => {
  const before = clone({ p: C.PARTS, n: C.QUBIT_COUNTS });
  IDS.forEach((id) => { C.role(id); C.roleHTML(id); C.renderSVG(id); C.roleWords(id); });
  C.listHTML(); C.wiringRows(true); C.wiringRows(false);
  assert.deepEqual(clone({ p: C.PARTS, n: C.QUBIT_COUNTS }), before);
});
