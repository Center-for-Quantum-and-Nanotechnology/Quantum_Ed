// Tests for docs/assets/javascripts/shots.js (window.QedShots).
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const S = loadModule("shots.js").QedShots;

function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}

test("seeded sampling is deterministic", () => {
  const a = S.sample([0.5, 0.5], 50, S.rng(7));
  const b = S.sample([0.5, 0.5], 50, S.rng(7));
  const c = S.sample([0.5, 0.5], 50, S.rng(8));
  assert.deepEqual(a.sequence, b.sequence);
  assert.notDeepEqual(a.sequence, c.sequence);
});

test("counts add up to the number of shots", () => {
  const r = S.sample([0.2, 0.3, 0.5], 1000, S.rng(1));
  assert.equal(sum(r.counts), 1000);
  assert.equal(r.sequence.length, 1000);
  assert.equal(r.shots, 1000);
});

test("certain and impossible outcomes behave exactly", () => {
  const zero = S.sample([1, 0], 200, S.rng(3));
  assert.deepEqual(zero.counts, [200, 0]);
  const one = S.sample([0, 1], 200, S.rng(3));
  assert.deepEqual(one.counts, [0, 200]);
});

test("zero shots is allowed and gives empty counts", () => {
  const r = S.sample([0.5, 0.5], 0, S.rng(1));
  assert.deepEqual(r.counts, [0, 0]);
  assert.deepEqual(r.sequence, []);
});

test("a balanced coin stays near one half across many seeds", () => {
  let worst = 0;
  for (let seed = 1; seed <= 50; seed++) {
    const r = S.sample([0.5, 0.5], 10000, S.rng(seed));
    worst = Math.max(worst, Math.abs(r.counts[0] / 10000 - 0.5));
  }
  assert.ok(worst < 0.03, `worst deviation was ${worst}`);
});

test("an unbalanced distribution is reproduced within tolerance", () => {
  const r = S.sample([0.1, 0.2, 0.7], 20000, S.rng(11));
  const freq = r.counts.map((c) => c / 20000);
  [0.1, 0.2, 0.7].forEach((p, i) => assert.ok(Math.abs(freq[i] - p) < 0.02, `outcome ${i}: ${freq[i]}`));
});

test("a session advances through one stream, and reset replays it", () => {
  const s = S.session([0.5, 0.5], 42);
  const first = s.run(20);
  const second = s.run(20);
  assert.notDeepEqual(first.sequence, second.sequence);
  assert.equal(first.run, 1);
  assert.equal(second.run, 2);
  assert.equal(s.runs(), 2);

  s.reset();
  const again = s.run(20);
  assert.deepEqual(again.sequence, first.sequence);
  assert.equal(again.run, 1);
});

test("two sessions with the same seed match", () => {
  assert.deepEqual(S.session([0.5, 0.5], 42).run(30).sequence, S.session([0.5, 0.5], 42).run(30).sequence);
});

test("invalid probabilities are rejected", () => {
  assert.throws(() => S.sample([0.5, 0.4], 5, S.rng(1)), /sum to 1/);
  assert.throws(() => S.sample([1.2, -0.2], 5, S.rng(1)), /finite number >= 0/);
  assert.throws(() => S.sample(["a", 1], 5, S.rng(1)));
  assert.throws(() => S.sample([], 5, S.rng(1)));
  assert.throws(() => S.sample(null, 5, S.rng(1)));
});

test("invalid shot counts are rejected", () => {
  assert.throws(() => S.sample([1], 2.5, S.rng(1)), /whole number/);
  assert.throws(() => S.sample([1], -1, S.rng(1)));
  assert.throws(() => S.sample([1], "3", S.rng(1)));
});

test("a session rejects bad probabilities up front", () => {
  assert.throws(() => S.session([0.3, 0.3], 1));
});

test("default labels are binary strings for power-of-two outcome counts", () => {
  assert.deepEqual(S.defaultLabels(2), ["0", "1"]);
  assert.deepEqual(S.defaultLabels(4), ["00", "01", "10", "11"]);
  assert.deepEqual(S.defaultLabels(8).slice(0, 3), ["000", "001", "010"]);
});

test("default labels fall back to indices otherwise", () => {
  assert.deepEqual(S.defaultLabels(3), ["0", "1", "2"]);
  assert.deepEqual(S.defaultLabels(1), ["0"]);
});

test("describe gives plain text for zero, one, and many shots", () => {
  assert.equal(S.describe(S.sample([0.5, 0.5], 0, S.rng(1))), "No shots yet.");
  assert.equal(S.describe(S.sample([1, 0], 1, S.rng(1))), "1 simulated shot: the outcome was 0.");
  assert.equal(
    S.describe({ shots: 100, counts: [52, 48], sequence: [] }),
    "100 simulated shots: outcome 0 appeared 52 times (52%); outcome 1 appeared 48 times (48%)."
  );
  assert.match(S.describe({ shots: 3, counts: [1, 2], sequence: [] }), /appeared 1 time \(/);
});

test("renderHTML draws one row per outcome with matching widths", () => {
  const html = S.renderHTML({ shots: 100, counts: [52, 48], sequence: [] });
  assert.equal((html.match(/class="qed-confidence-row"/g) || []).length, 2);
  assert.match(html, /width:52%/);
  assert.match(html, /width:48%/);
  assert.match(html, /simulated/);
});

test("renderHTML escapes custom labels", () => {
  const html = S.renderHTML({ shots: 10, counts: [5, 5], sequence: [] }, { labels: ["<b>", "x"] });
  assert.ok(!html.includes("<b>"));
  assert.ok(html.includes("&lt;b&gt;"));
});

test("renderBars draws one row per input with width, label, and text", () => {
  const html = S.renderBars([
    { label: "Outcome 0", fraction: 0.36, text: "36%" },
    { label: "Outcome 1", fraction: 0.64, text: "64%" },
  ]);
  assert.equal((html.match(/class="qed-confidence-row"/g) || []).length, 2);
  assert.match(html, /width:36%/);
  assert.match(html, /width:64%/);
  assert.match(html, /Outcome 0/);
  assert.match(html, />64%</);
});

test("renderBars keeps one decimal of the fraction and clamps out-of-range values", () => {
  assert.match(S.renderBars([{ label: "a", fraction: 1 / 3, text: "" }]), /width:33\.3%/);
  assert.match(S.renderBars([{ label: "a", fraction: 1.7, text: "" }]), /width:100%/);
  assert.match(S.renderBars([{ label: "a", fraction: -0.2, text: "" }]), /width:0%/);
  assert.match(S.renderBars([{ label: "a", fraction: NaN, text: "" }]), /width:0%/);
  assert.match(S.renderBars([{ label: "a", fraction: "0.5", text: "" }]), /width:0%/);
});

test("renderBars escapes labels and text", () => {
  const html = S.renderBars([{ label: "<i>", fraction: 0.5, text: "<b>" }]);
  assert.ok(!html.includes("<i>") && !html.includes("<b>"));
  assert.ok(html.includes("&lt;i&gt;") && html.includes("&lt;b&gt;"));
});

test("renderBars of nothing is empty", () => {
  assert.equal(S.renderBars([]), "");
});

test("renderHTML still shows counts and percentages through renderBars", () => {
  const html = S.renderHTML({ shots: 100, counts: [52, 48], sequence: [] });
  assert.match(html, />52 \(52%\)</);
  assert.match(html, />48 \(48%\)</);
});

// ---- repeated experiments and their spread (02.07, Intermediate) ---------------------------

test("repeat runs the experiment the stated number of times and every run adds up", () => {
  const r = S.repeat([0.25, 0.75], 40, 12, S.rng(3));
  assert.equal(r.shots, 40);
  assert.equal(r.experiments, 12);
  assert.equal(r.runs.length, 12);
  r.runs.forEach((counts) => assert.equal(sum(counts), 40));
  assert.deepEqual(S.repeat([0.25, 0.75], 40, 12, S.rng(3)).runs, r.runs, "the same seed gives the same runs");
  assert.notDeepEqual(S.repeat([0.25, 0.75], 40, 12, S.rng(4)).runs, r.runs);
});

test("repeat refuses bad arguments", () => {
  assert.throws(() => S.repeat([0.5, 0.5], 10, 0, S.rng(1)), /experiments/);
  assert.throws(() => S.repeat([0.5, 0.5], 10, 2.5, S.rng(1)), /experiments/);
  assert.throws(() => S.repeat([0.5, 0.5], -1, 2, S.rng(1)), /shots/);
  assert.throws(() => S.repeat([0.4, 0.4], 10, 2, S.rng(1)), /sum to 1/);
});

test("spread reports the fractions, their mean, spread, and range", () => {
  const sp = S.spread({ shots: 10, experiments: 4, runs: [[2, 8], [4, 6], [6, 4], [8, 2]] }, 0);
  assert.deepEqual(sp.fractions, [0.2, 0.4, 0.6, 0.8]);
  assert.ok(Math.abs(sp.mean - 0.5) < 1e-12);
  assert.ok(Math.abs(sp.sd - Math.sqrt(0.05)) < 1e-12);
  assert.equal(sp.min, 0.2);
  assert.equal(sp.max, 0.8);
  assert.equal(S.spread({ shots: 10, experiments: 1, runs: [[3, 7]] }, 1).fractions[0], 0.7);
});

test("the spread of the sampled frequencies shrinks as the shots grow, and follows sqrt(p(1-p)/N)", () => {
  const p = 0.3;
  const sd = (shots, seed) => S.spread(S.repeat([p, 1 - p], shots, 200, S.rng(seed)), 0).sd;
  const shots = [10, 100, 1000, 10000];
  shots.forEach((n) => {
    const measured = sd(n, 21);
    const expected = S.expectedSpread(p, n);
    assert.ok(Math.abs(measured - expected) < 0.2 * expected, `N=${n}: ${measured} against ${expected}`);
  });
  for (let i = 1; i < shots.length; i++) assert.ok(sd(shots[i], 21) < sd(shots[i - 1], 21), `N=${shots[i]}`);
  assert.ok(Math.abs(S.expectedSpread(0.5, 100) - 0.05) < 1e-12);
  assert.equal(S.expectedSpread(0.5, 0), 0);
  assert.equal(S.expectedSpread(1, 100), 0);
});

// ---- optional bar fields (accent, marker, widths, trusted HTML) --------------------------------

test("renderBars with only label, fraction, and text is drawn exactly as it always was", () => {
  const crypto = require("node:crypto");
  const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
  const rows = [
    { label: "Outcome 0", fraction: 0.36, text: "36%" },
    { label: "<i>", fraction: 1 / 3, text: "5 (50%)" },
    { label: "c", fraction: 1.7, text: "" },
  ];
  // hashes recorded before the optional fields were added
  assert.equal(sha(S.renderBars(rows)), "8813431e682081db9bdaf2a825d5f1d2b8027284ae11f74c3e9ccefd6ef16a92");
  assert.equal(sha(S.renderHTML({ shots: 100, counts: [52, 48], sequence: [] })), "bf34d182904ba6ec41668d50746a7a52d6403f511e1694ff345315716ec8da65");
});

test("accent colors the fill with a shared token class, quantum is the logical color, and unknown values are ignored", () => {
  const one = (accent) => S.renderBars([{ label: "a", fraction: 0.5, text: "", accent }]);
  assert.match(one("quantum"), /qed-confidence-bar__fill qed-confidence-bar__fill--logical"/);
  assert.match(one("logical"), /qed-confidence-bar__fill--logical/);
  assert.match(one("protected"), /qed-confidence-bar__fill--protected/);
  assert.match(one("noise"), /qed-confidence-bar__fill--noise/);
  assert.match(one("error"), /qed-confidence-bar__fill--error/);
  assert.ok(!one("red").includes("fill--"), "an unknown accent adds no class");
  assert.ok(!one('x" onclick="y').includes("onclick"), "an accent can never inject markup");
  assert.ok(!one(undefined).includes("fill--"));
});

test("marker draws a tick at the given fraction and marks the bar, and clamps out-of-range values", () => {
  const html = S.renderBars([{ label: "a", fraction: 0.2, text: "", marker: 0.75 }]);
  assert.match(html, /qed-confidence-bar qed-confidence-bar--marked/);
  assert.match(html, /qed-confidence-bar__marker" style="left:calc\(75% - 1px\)"/);
  assert.match(S.renderBars([{ label: "a", fraction: 0, text: "", marker: 1.4 }]), /left:calc\(100% - 1px\)/);
  assert.match(S.renderBars([{ label: "a", fraction: 0, text: "", marker: -2 }]), /left:calc\(0% - 1px\)/);
  assert.match(S.renderBars([{ label: "a", fraction: 0, text: "", marker: 0 }]), /bar__marker/, "a marker at zero is still drawn");
  assert.ok(!S.renderBars([{ label: "a", fraction: 0.2, text: "" }]).includes("marker"));
  assert.ok(!S.renderBars([{ label: "a", fraction: 0.2, text: "", marker: "0.5" }]).includes("marker"), "a non-number marker is ignored");
});

test("labelWidth and textWidth set the column widths, and only valid CSS lengths are accepted", () => {
  const html = S.renderBars([{ label: "a", fraction: 0.5, text: "t", labelWidth: "6.5rem", textWidth: "7rem" }]);
  assert.match(html, /qed-confidence-row__label" style="flex-basis:6\.5rem;"/);
  assert.match(html, /qed-confidence-row__pct" style="flex-basis:7rem;"/);
  const bad = S.renderBars([{ label: "a", fraction: 0.5, text: "t", labelWidth: "1rem;color:red", textWidth: "calc(1px)" }]);
  assert.ok(!bad.includes("style=\"flex-basis"), "anything but a number and a unit is dropped");
});

test("textHtml is shown as given, and text is still escaped", () => {
  const html = S.renderBars([{ label: "a", fraction: 0.5, text: "ignored <b>", textHtml: "3.2 × 10<sup>8</sup>" }]);
  assert.ok(html.includes(">3.2 × 10<sup>8</sup><"));
  assert.ok(!html.includes("ignored"));
  assert.ok(S.renderBars([{ label: "a", fraction: 0.5, text: "<b>" }]).includes("&lt;b&gt;"));
  assert.ok(S.renderBars([{ label: "<b>", fraction: 0.5, textHtml: "x" }]).includes("&lt;b&gt;"), "the label is escaped even with textHtml");
});
