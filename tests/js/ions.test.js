// Tests for docs/assets/javascripts/ions.js (window.QedIons): a chain of ions, a pair chosen to interact,
// the Bell circuit's three operations on the pair, a seeded bright-or-dark readout, and an invented cost
// that grows with the chain. QedIons calls QedShots.rng at run time, so shots.js is loaded.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["shots.js", "ions.js"]);
const I = w.QedIons;
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const full = (n, a, b, seed) => I.step(I.step(I.step(I.start(n, a, b), "rotate"), "interact"), "read", seed);

test("the invented values are as stated", () => {
  assert.deepEqual(I.CHAIN_LENGTHS, [3, 6, 9, 12]);
  assert.deepEqual(I.INTERACTION, { BASE: 1, GROWTH: 0.25 });
  assert.deepEqual(I.READOUT, { BRIGHT: 12, DARK: 1, THRESHOLD: 4 });
  assert.deepEqual(I.DEFAULTS, { length: 3, first: 1, second: 2 });
  assert.deepEqual(I.OPS.map((o) => o.id), ["rotate", "interact", "read"]);
  assert.deepEqual(I.OPS.map((o) => o.label), ["Rotate the first ion", "Interact the pair", "Read out"]);
});

test("a chain is numbered from 1, and only the four lengths are allowed", () => {
  assert.deepEqual(I.chain(3).map((x) => x.index), [1, 2, 3]);
  assert.equal(I.chain(12).length, 12);
  [0, 1, 2, 4, 5, 13, 100, -3, 3.5, "3", undefined, null].forEach((n) => assert.throws(() => I.chain(n), /must be one of 3, 6, 9, 12/, String(n)));
});

test("any two different ions are a valid pair, the nearest or the farthest", () => {
  assert.equal(I.validPair(6, 1, 2), true);
  assert.equal(I.validPair(6, 1, 6), true);
  assert.equal(I.validPair(6, 6, 1), true);
  assert.equal(I.validPair(12, 3, 11), true);
  assert.equal(I.validPair(3, 2, 2), false);
});

test("an ion outside the chain, or not a whole number, is refused", () => {
  assert.equal(I.validPair(3, 0, 1), false);
  assert.equal(I.validPair(3, 1, 4), false);
  assert.equal(I.validPair(6, 7, 2), false);
  assert.equal(I.validPair(6, 1.5, 2), false);
  assert.equal(I.validPair(6, "1", 2), false);
  assert.equal(I.validPair(6, undefined, 2), false);
  assert.throws(() => I.validPair(5, 1, 2), /must be one of/);
});

test("the interaction time rises with the chain length and is the stated rule", () => {
  assert.deepEqual(I.CHAIN_LENGTHS.map(I.interactionTime), [1.25, 2, 2.75, 3.5]);
  for (let i = 1; i < I.CHAIN_LENGTHS.length; i++) assert.ok(I.interactionTime(I.CHAIN_LENGTHS[i]) > I.interactionTime(I.CHAIN_LENGTHS[i - 1]));
  assert.throws(() => I.interactionTime(5), /must be one of/);
});

test("the interaction time depends on the chain length only, not on which pair is chosen", () => {
  const times = [[1, 2], [1, 6], [3, 4], [6, 2]].map(([a, b]) => I.interactionTime(I.start(6, a, b).n));
  assert.deepEqual(new Set(times).size, 1);
  assert.ok(I.interactionWords(I.start(9, 1, 9)).includes("2.75 invented units, whichever two are chosen"));
  assert.ok(I.interactionWords(I.start(9, 4, 5)).includes("2.75 invented units, whichever two are chosen"));
});

test("start gives every ion dark and no step done, and refuses a bad pair or length", () => {
  const s = I.start(6, 2, 5);
  assert.deepEqual(s, { n: 6, first: 2, second: 5, done: [], result: null });
  assert.throws(() => I.start(6, 2, 2), /two different ions between 1 and 6/);
  assert.throws(() => I.start(6, 0, 2), /two different ions/);
  assert.throws(() => I.start(6, 2, 7), /two different ions/);
  assert.throws(() => I.start(7, 1, 2), /must be one of/);
});

test("the steps go in order and are refused out of order with a clear message", () => {
  const s0 = I.start(6, 1, 4);
  assert.throws(() => I.step(s0, "interact"), /Rotate the first ion comes first/);
  assert.throws(() => I.step(s0, "read", 1), /Rotate the first ion comes first/);
  const s1 = I.step(s0, "rotate");
  assert.throws(() => I.step(s1, "rotate"), /Interact the pair comes first/);
  assert.throws(() => I.step(s1, "read", 1), /Interact the pair comes first/);
  const s2 = I.step(s1, "interact");
  assert.throws(() => I.step(s2, "read"), /needs a seed/);
  assert.throws(() => I.step(s2, "interact"), /Read out comes first/);
  const s3 = I.step(s2, "read", 7);
  assert.deepEqual(s3.done, ["rotate", "interact", "read"]);
  assert.throws(() => I.step(s3, "rotate"), /every step is done/);
  assert.throws(() => I.step(s0, "nothing"), /no step called nothing/);
});

test("a step returns a new state and leaves the old one unchanged", () => {
  const s0 = I.start(6, 1, 4);
  const before = clone(s0);
  const s1 = I.step(s0, "rotate");
  assert.deepEqual(s0, before);
  assert.notEqual(s1, s0);
  assert.deepEqual(s1.done, ["rotate"]);
  assert.equal(s1.result, null);
});

test("readCounts needs the pair to have interacted", () => {
  assert.throws(() => I.readCounts(I.start(6, 1, 4), 1), /Interact the pair comes first/);
  assert.throws(() => I.readCounts(I.step(I.start(6, 1, 4), "rotate"), 1), /Interact the pair comes first/);
});

test("after a readout the chosen pair agree and every other ion is dark, over many seeds", () => {
  let bothBright = 0, bothDark = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const r = I.readCounts(I.step(I.step(I.start(9, 2, 8), "rotate"), "interact"), seed);
    assert.equal(r.truth[1], r.truth[7], "the pair agree");
    r.truth.forEach((t, i) => { if (i !== 1 && i !== 7) assert.equal(t, 0, "ion " + (i + 1) + " is dark"); });
    assert.equal(r.truth.length, 9);
    assert.equal(r.counts.length, 9);
    if (r.pair === 1) bothBright++; else bothDark++;
  }
  assert.ok(bothBright > 100 && bothDark > 100, "both outcomes happen, with about equal chances: " + bothBright + " / " + bothDark);
});

test("readCounts repeats for the same seed and changes for a new one", () => {
  const s = I.step(I.step(I.start(12, 3, 9), "rotate"), "interact");
  assert.deepEqual(I.readCounts(s, 41), I.readCounts(s, 41));
  const others = [1, 2, 3, 4, 5].map((k) => JSON.stringify(I.readCounts(s, 41 + k)));
  assert.ok(others.some((o) => o !== JSON.stringify(I.readCounts(s, 41))));
});

test("the means of the counts are close to the stated means over many seeds", () => {
  let brightSum = 0, brightN = 0, darkSum = 0, darkN = 0;
  const s = I.step(I.step(I.start(6, 1, 2), "rotate"), "interact");
  for (let seed = 1; seed <= 2000; seed++) {
    const r = I.readCounts(s, seed);
    r.counts.forEach((c, i) => { if (r.truth[i] === 1) { brightSum += c; brightN++; } else { darkSum += c; darkN++; } });
  }
  assert.ok(Math.abs(brightSum / brightN - 12) < 0.3, "bright mean " + brightSum / brightN);
  assert.ok(Math.abs(darkSum / darkN - 1) < 0.05, "dark mean " + darkSum / darkN);
});

test("classify follows the threshold exactly at 3, 4, and 5", () => {
  assert.equal(I.classify(3), "dark");
  assert.equal(I.classify(4), "bright");
  assert.equal(I.classify(5), "bright");
  assert.equal(I.classify(0), "dark");
  assert.equal(I.classify(40), "bright");
});

test("reads follow the threshold and misread says where they differ from the truth", () => {
  const s = I.step(I.step(I.start(9, 1, 2), "rotate"), "interact");
  for (let seed = 1; seed <= 200; seed++) {
    const r = I.readCounts(s, seed);
    r.counts.forEach((c, i) => {
      assert.equal(r.reads[i], c >= 4 ? "bright" : "dark");
      assert.equal(r.misread[i], (r.reads[i] === "bright") !== (r.truth[i] === 1));
    });
  }
});

test("a misread is rare but possible: it happens in some seeds and not in most", () => {
  const s = I.step(I.step(I.start(12, 1, 12), "rotate"), "interact");
  let seedsWithMisread = 0;
  for (let seed = 1; seed <= 400; seed++) if (I.readCounts(s, seed).misread.some((m) => m)) seedsWithMisread++;
  assert.ok(seedsWithMisread > 0, "some seed has a misread");
  assert.ok(seedsWithMisread < 400 * 0.5, "most seeds have none, but " + seedsWithMisread + " of 400 had one");
});

test("the misread chances are as stated to four decimal places", () => {
  const m = I.misreadChances();
  assert.equal(m.darkReadsBright.toFixed(4), "0.0190");
  assert.equal(m.brightReadsDark.toFixed(4), "0.0023");
  close(m.darkReadsBright, 1 - Math.exp(-1) * (1 + 1 + 1 / 2 + 1 / 6), 1e-12);
  close(m.brightReadsDark, Math.exp(-12) * (1 + 12 + 72 + 288), 1e-12);
});

test("the words name the bright ions, the misreads, and that the counts are simulated", () => {
  let found = false;
  for (let seed = 1; seed <= 200 && !found; seed++) {
    const st = full(6, 2, 5, seed);
    const words = I.readoutWords(st.result);
    assert.ok(words.includes("The photon counts overlap, so a misread is rare but possible. These counts are simulated."));
    assert.ok(words.includes("Every other ion read dark."));
    if (st.result.pair === 1 && !st.result.misread.some((m) => m)) {
      assert.ok(words.includes("Bright: ions 2, 5."));
      assert.ok(words.includes("No ion was misread this time."));
      found = true;
    }
  }
  assert.ok(found);
  assert.ok(I.nextWords(I.start(3, 1, 2)).includes("Rotate the first ion"));
  assert.ok(I.nextWords(full(3, 1, 2, 1)).includes("Reset"));
});

test("the schematic is an SVG with a text alternative and one labelled element for each ion", () => {
  [3, 6, 9, 12].forEach((n) => {
    const svg = I.renderSVG(I.start(n, 1, 2));
    assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"));
    assert.ok(svg.includes('role="img"') && svg.includes('aria-label="A simplified schematic, not a trap and not to scale.'));
    for (let i = 1; i <= n; i++) assert.equal((svg.match(new RegExp('data-ion="' + i + '"', "g")) || []).length, 1, "ion " + i + " of " + n);
    assert.equal((svg.match(/data-ion=/g) || []).length, n);
  });
  const svg = I.renderSVG(I.start(6, 2, 5));
  ["vacuum", "light", "detector", "trap electrodes: the end blocks", "chain of 6 ions, simplified, not to scale"].forEach((s) => assert.ok(svg.includes(">" + s + "<"), s));
  assert.ok(!/IBM|Google|Quantinuum|calcium|ytterbium/i.test(svg));
});

test("the light is on the first ion, and on the second once the pair interacts, as a double line", () => {
  const s0 = I.start(6, 2, 5);
  assert.equal((I.renderSVG(s0).match(/class="qed-io__light"/g) || []).length, 2);
  const s2 = I.step(I.step(s0, "rotate"), "interact");
  assert.equal((I.renderSVG(s2).match(/class="qed-io__light"/g) || []).length, 4);
});

test("the shared-motion link is drawn only once the pair interacts, and is labelled", () => {
  const s0 = I.start(6, 2, 5);
  assert.ok(!I.renderSVG(s0).includes("qed-io__link"));
  assert.ok(!I.renderSVG(I.step(s0, "rotate")).includes("qed-io__link"));
  const svg = I.renderSVG(I.step(I.step(s0, "rotate"), "interact"));
  assert.equal((svg.match(/class="qed-io__link"/g) || []).length, 1);
  assert.ok(svg.includes(">shared motion<"));
});

test("the link joins the chosen pair whichever order they are chosen in", () => {
  const a = I.renderSVG(I.step(I.step(I.start(6, 2, 5), "rotate"), "interact"));
  const b = I.renderSVG(I.step(I.step(I.start(6, 5, 2), "rotate"), "interact"));
  const path = (s) => s.match(/<path class="qed-io__link" d="([^"]+)"/)[1];
  assert.equal(path(a), path(b));
});

test("a bright ion and a dark ion differ by shape and not by color alone", () => {
  let st = null;
  for (let seed = 1; seed <= 100 && !st; seed++) { const c = full(6, 1, 2, seed); if (c.result.pair === 1) st = c; }
  const svg = I.renderSVG(st);
  const brights = st.result.reads.filter((r) => r === "bright").length;
  const darks = st.result.reads.filter((r) => r === "dark").length;
  assert.equal((svg.match(/qed-io__ion qed-io__ion--bright/g) || []).length, brights);
  assert.equal((svg.match(/qed-io__ion qed-io__ion--dark/g) || []).length, darks);
  assert.equal((svg.match(/class="qed-io__ray"/g) || []).length, brights * 8, "a bright ion has rays, a dark one has none");
  assert.ok(svg.includes("filled with rays: bright. hollow: dark."));
  assert.ok(!I.renderSVG(I.start(6, 1, 2)).includes("qed-io__ray"));
  assert.ok(I.renderSVG(I.start(6, 1, 2)).includes("qed-io__ion--unread"));
});

test("the chosen ions are marked in the picture", () => {
  const svg = I.renderSVG(I.start(6, 2, 5));
  assert.equal((svg.match(/qed-io__ion--chosen/g) || []).length, 2);
});

test("the text alternative follows the state", () => {
  assert.ok(I.chainText(I.start(6, 2, 5)).includes("A chain of 6 ions is held between trap electrodes inside a vacuum"));
  assert.ok(!I.chainText(I.start(6, 2, 5)).includes("linked"));
  assert.ok(I.chainText(I.step(I.start(6, 2, 5), "rotate")).includes("Light has rotated the first ion."));
  assert.ok(I.chainText(I.step(I.step(I.start(6, 2, 5), "rotate"), "interact")).includes("linked through shared motion"));
  assert.ok(I.chainText(full(6, 2, 5, 3)).includes("After the readout"));
});

test("the table of ions is a real table with the words bright and dark and the counts", () => {
  const before = I.tableHTML(I.start(6, 2, 5));
  assert.ok(before.startsWith("<table"));
  assert.equal((before.match(/<th scope="row">/g) || []).length, 6);
  assert.equal((before.match(/not read yet/g) || []).length, 12);
  assert.ok(before.includes(">first<") && before.includes(">second<") && before.includes(">other<"));
  const st = full(6, 2, 5, 9);
  const after = I.tableHTML(st);
  assert.ok(!after.includes("not read yet"));
  assert.equal((after.match(/>(bright|dark)</g) || []).length, 6);
  st.result.counts.forEach((c) => assert.ok(after.includes(">" + c + "<") || after.includes(">" + c + " ")));
});

test("a misread is marked with a cross and the word, not by color", () => {
  let found = false;
  for (let seed = 1; seed <= 400 && !found; seed++) {
    const st = full(12, 1, 12, seed);
    if (st.result.misread.some((m) => m)) {
      assert.ok(I.tableHTML(st).includes("✕ misread"));
      found = true;
    }
  }
  assert.ok(found, "a seed with a misread exists");
  assert.ok(!I.tableHTML(I.start(6, 1, 2)).includes("misread"));
});

test("inputs are left unchanged", () => {
  const s = full(9, 2, 7, 5);
  const before = clone(s);
  I.renderSVG(s); I.tableHTML(s); I.readoutWords(s.result); I.interactionWords(s); I.chainText(s); I.nextWords(s);
  I.readCounts(s, 99); I.misreadChances();
  assert.deepEqual(s, before);
  assert.deepEqual(I.CHAIN_LENGTHS, [3, 6, 9, 12]);
});

test("the table gives each ion the right role", () => {
  const html = I.tableHTML(I.start(6, 2, 5));
  const row = (i) => html.split("<tr>").filter((r) => r.includes("<th scope=\"row\">Ion " + i + "<"))[0];
  assert.ok(row(2).includes(">first<") && !row(2).includes(">second<") && !row(2).includes(">other<"));
  assert.ok(row(5).includes(">second<") && !row(5).includes(">first<"));
  [1, 3, 4, 6].forEach((i) => assert.ok(row(i).includes(">other<"), "ion " + i));
});
