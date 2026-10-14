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
