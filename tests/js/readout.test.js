// Tests for docs/assets/javascripts/readout.js (window.QedReadout): two overlapping signals, a
// readout threshold, the exact share of misreads, seeded shots with a true state, a signal, and a
// reported value each, and a seeded threshold-finding experiment. QedReadout calls QedShots and
// QedGates at run time, so QedQubit (which QedGates needs), QedGates, and QedShots are loaded.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["qubit.js", "gates.js", "shots.js", "readout.js"]);
const R = w.QedReadout;
const G = w.QedGates;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const SEPARATIONS = R.SEPARATIONS.map((s) => s.id);
const base = (extra) => Object.assign({ prepared: "zero", separation: "medium", fallback: "off", threshold: 5 }, extra || {});
const middle = (sep) => 3 + R.separationById(sep).distance / 2;

test("the invented values are as stated on the page", () => {
  assert.deepEqual(R.SEPARATIONS.map((s) => [s.id, s.distance]), [["close", 2], ["medium", 4], ["far", 6]]);
  assert.deepEqual(R.FALLBACKS.map((f) => [f.id, f.share]), [["off", 0], ["on", 0.1]]);
  assert.deepEqual(R.PREPARED.map((p) => p.id), ["zero", "one", "split"]);
  assert.equal(R.AXIS_MAX, 12);
  assert.equal(R.MEAN_ZERO, 3);
  assert.equal(R.SPREAD, 1);
  assert.equal(R.THRESHOLD_STEP, 0.25);
  assert.equal(R.SWEEP_STEP, 0.5);
  assert.equal(R.SHOTS, 100);
  assert.deepEqual(R.DEFAULTS, { prepared: "zero", separation: "medium", fallback: "off", threshold: 4 });
});

test("unknown ids are refused with a clear message", () => {
  assert.throws(() => R.separationById("huge"), /no separation called huge/);
  assert.throws(() => R.fallbackById("maybe"), /no fall-back called maybe/);
  assert.throws(() => R.preparedById("plus"), /no prepared state called plus/);
});

test("snapThreshold clamps to 0..12 and snaps to the slider step", () => {
  assert.equal(R.snapThreshold(-3), 0);
  assert.equal(R.snapThreshold(99), 12);
  assert.equal(R.snapThreshold(4.1), 4);
  assert.equal(R.snapThreshold(4.2), 4.25);
  assert.equal(R.snapThreshold("5.5"), 5.5);
  assert.equal(R.snapThreshold("not a number"), R.DEFAULTS.threshold);
  assert.equal(R.snapThreshold(NaN), R.DEFAULTS.threshold);
});

test("settingsOf fills in the defaults and snaps the threshold", () => {
  assert.deepEqual(R.settingsOf(), R.DEFAULTS);
  assert.deepEqual(R.settingsOf({ threshold: 99, separation: "far" }), { prepared: "zero", separation: "far", fallback: "off", threshold: 12 });
  assert.equal(R.settingsOf({ threshold: 0 }).threshold, 0);
});

test("the two means are 3 and 3 plus the distance, and the middle is between them", () => {
  SEPARATIONS.forEach((id) => {
    const m = R.means({ separation: id });
    const d = R.separationById(id).distance;
    assert.equal(m.zero, 3);
    assert.equal(m.one, 3 + d);
    assert.equal(m.middle, 3 + d / 2);
  });
});

test("the normal tail is 0.5 at the mean, symmetric, and falls toward 0 and 1 at the ends", () => {
  assert.equal(R.normalCdf(0), 0.5);
  close(R.normalCdf(1), 0.8413447, 1e-6);
  close(R.normalCdf(-1), 0.1586553, 1e-6);
  close(R.normalCdf(2), 0.9772499, 1e-6);
  [0.3, 1, 2.5, 4].forEach((z) => close(R.normalCdf(z) + R.normalCdf(-z), 1, 1e-12));
  assert.ok(R.normalCdf(8) > 0.999999);
  assert.ok(R.normalCdf(-8) < 1e-6);
  let last = -1;
  for (let z = -6; z <= 6; z += 0.5) { const p = R.normalCdf(z); assert.ok(p >= last); assert.ok(p >= 0 && p <= 1); last = p; }
});

test("at the middle threshold, fall-back off, each state is misread about 15.9%, 2.3%, and 0.13%", () => {
  const expected = { close: 0.1586553, medium: 0.0227501, far: 0.0013499 };
  SEPARATIONS.forEach((id) => {
    const m = R.misreads(base({ separation: id, threshold: middle(id) }));
    close(m.zeroAsOne, expected[id], 1e-6);
    close(m.oneAsZero, expected[id], 1e-6);
    close(m.zeroAsOne, m.oneAsZero, 1e-9);
    close(m.zeroRight + m.zeroAsOne, 1, 1e-12);
    close(m.oneRight + m.oneAsZero, 1, 1e-12);
    close(m.total, m.zeroAsOne + m.oneAsZero, 1e-12);
    assert.equal(m.middle, middle(id));
  });
});

test("raising the threshold lowers the 0s read as 1 and raises the 1s read as 0", () => {
  SEPARATIONS.forEach((id) => {
    for (let t = 0; t < 11.5; t += 0.5) {
      const lo = R.misreads(base({ separation: id, threshold: t }));
      const hi = R.misreads(base({ separation: id, threshold: t + 0.5 }));
      assert.ok(hi.zeroAsOne < lo.zeroAsOne, "0s read as 1 fall as the threshold rises");
      assert.ok(hi.oneAsZero > lo.oneAsZero, "1s read as 0 rise as the threshold rises");
    }
  });
  // the default, off-centre threshold is lopsided: many 0s read as 1, almost no 1s read as 0
  const m = R.misreads(R.DEFAULTS);
  close(m.zeroAsOne, 0.1586553, 1e-6);
  assert.ok(m.oneAsZero < 0.002);
});

test("with fall-back on, the 1s read as 0 rise and the 0s read as 1 are unchanged", () => {
  [3, 5, 7].forEach((t) => {
    const off = R.misreads(base({ fallback: "off", threshold: t }));
    const on = R.misreads(base({ fallback: "on", threshold: t }));
    assert.ok(on.oneAsZero > off.oneAsZero);
    close(on.zeroAsOne, off.zeroAsOne, 1e-12);
  });
  const m = R.misreads(base({ fallback: "on", threshold: 5 }));
  close(m.zeroAsOne, 0.0227501, 1e-6);
  close(m.oneAsZero, 0.9 * 0.0227501 + 0.1 * 0.9772499, 1e-6); // about 11.8%
  assert.ok(Math.abs(m.oneAsZero - 0.118) < 0.001);
});

test("the total of the two misreads is lowest at the middle threshold, whatever the fall-back", () => {
  SEPARATIONS.forEach((id) => {
    ["off", "on"].forEach((fb) => {
      let best = null;
      for (let t = 0; t <= 12; t += 0.25) {
        const total = R.misreads(base({ separation: id, fallback: fb, threshold: t })).total;
        if (best === null || total < best.total - 1e-12) best = { t, total };
      }
      assert.equal(best.t, middle(id), id + " " + fb);
    });
  });
});

test("fall-back leaves a floor of misreads no threshold removes", () => {
  [0, 2, 4, 6, 8, 10, 12].forEach((t) => {
    const e = R.misreads(base({ fallback: "on", separation: "far", threshold: t }));
    assert.ok(e.total > 0.1, "at threshold " + t + " the total is " + e.total);
  });
  // at the middle with fall-back on, even Far apart leaves about 10% of the 1s read as 0
  const far = R.misreads(base({ fallback: "on", separation: "far", threshold: 6 }));
  assert.ok(far.oneAsZero > 0.099 && far.oneAsZero < 0.102);
});

test("the even split's chance of 1 agrees with QedGates.apply of an H on |0⟩", () => {
  const st = G.apply(G.gate("h"), { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } });
  const p1 = st.beta.re * st.beta.re + st.beta.im * st.beta.im;
  close(R.preparedProbabilities("split").p1, p1, 1e-9);
  close(R.preparedProbabilities("split").p1, 0.5, 1e-9);
  assert.deepEqual(R.preparedProbabilities("zero"), { p0: 1, p1: 0 });
  assert.deepEqual(R.preparedProbabilities("one"), { p0: 0, p1: 1 });
  ["zero", "one", "split"].forEach((id) => { const p = R.preparedProbabilities(id); close(p.p0 + p.p1, 1, 1e-9); });
});

test("a seeded read repeats for the same seed and changes for a new one", () => {
  const a = R.read(R.DEFAULTS, "split", 11);
  const b = R.read(R.DEFAULTS, "split", 11);
  const c = R.read(R.DEFAULTS, "split", 12);
  assert.deepEqual(a.shots, b.shots);
  assert.notDeepEqual(a.shots.map((x) => x.signal), c.shots.map((x) => x.signal));
});

test("the counts total the shots, and the two-by-two table sums to the shots", () => {
  ["zero", "one", "split"].forEach((p) => {
    const r = R.read(R.DEFAULTS, p, 3);
    assert.equal(r.count, 100);
    assert.equal(r.shots.length, 100);
    assert.equal(r.table[0][0] + r.table[0][1] + r.table[1][0] + r.table[1][1], 100);
    assert.equal(r.started[0] + r.started[1], 100);
    assert.equal(r.reported[0] + r.reported[1], 100);
    assert.equal(r.misreads, r.table[0][1] + r.table[1][0]);
    assert.equal(r.misreads, r.shots.filter((x) => x.started !== x.reported).length);
    assert.equal(r.started[1], r.shots.filter((x) => x.started === 1).length);
    assert.equal(r.reported[1], r.shots.filter((x) => x.reported === 1).length);
  });
});

test("a prepared 0 or 1 always started in that state", () => {
  assert.ok(R.read(R.DEFAULTS, "zero", 5).shots.every((x) => x.started === 0));
  assert.ok(R.read(R.DEFAULTS, "one", 5).shots.every((x) => x.started === 1));
  const split = R.read(R.DEFAULTS, "split", 5);
  assert.ok(split.started[0] > 20 && split.started[1] > 20, "an even split starts in both");
});

test("a shot is reported as 1 exactly when its signal is above the threshold", () => {
  [0.5, 4, 5, 8].forEach((t) => {
    const r = R.read(base({ threshold: t, separation: "close" }), "split", 9);
    r.shots.forEach((x) => assert.equal(x.reported, x.signal > r.settings.threshold ? 1 : 0));
  });
});

test("a shot falls back only when it started in 1, and only when fall-back is on", () => {
  const off = R.read(base({ fallback: "off" }), "one", 21);
  assert.ok(off.shots.every((x) => !x.fellBack));
  assert.equal(off.fellBack, 0);
  const zeros = R.read(base({ fallback: "on" }), "zero", 21);
  assert.ok(zeros.shots.every((x) => !x.fellBack));
  let total = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const on = R.read(base({ fallback: "on" }), "one", seed);
    assert.equal(on.fellBack, on.shots.filter((x) => x.fellBack).length);
    on.shots.forEach((x) => { if (x.fellBack) assert.equal(x.started, 1); });
    total += on.fellBack;
  }
  assert.ok(total > 100 && total < 300, "about 10% of 2000 shots fall back, got " + total);
});

test("switching fall-back leaves the other draws alone", () => {
  const off = R.read(base({ fallback: "off" }), "split", 33);
  const on = R.read(base({ fallback: "on" }), "split", 33);
  assert.deepEqual(off.shots.map((x) => x.started), on.shots.map((x) => x.started));
});

test("the measured shares follow the exact shares over many seeds", () => {
  let zeroMis = 0, zeroN = 0, oneMis = 0, oneN = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const z = R.read(R.DEFAULTS, "zero", seed);
    zeroMis += z.table[0][1]; zeroN += 100;
    const o = R.read(base({ fallback: "on", threshold: 5 }), "one", seed);
    oneMis += o.table[1][0]; oneN += 100;
  }
  const expectedZero = R.misreads(R.DEFAULTS).zeroAsOne;
  const expectedOne = R.misreads(base({ fallback: "on", threshold: 5 })).oneAsZero;
  assert.ok(Math.abs(zeroMis / zeroN - expectedZero) < 0.02, zeroMis / zeroN + " vs " + expectedZero);
  assert.ok(Math.abs(oneMis / oneN - expectedOne) < 0.02, oneMis / oneN + " vs " + expectedOne);
});

test("the sweep has 25 thresholds from 0 to 12 in steps of 0.5, each with 200 reads", () => {
  const sw = R.sweep(R.DEFAULTS, 4);
  assert.equal(sw.points.length, 25);
  assert.deepEqual(sw.points.map((p) => p.threshold), Array.from({ length: 25 }, (_, i) => i * 0.5));
  assert.deepEqual(R.sweepThresholds(), sw.points.map((p) => p.threshold));
  sw.points.forEach((p) => {
    assert.equal(p.reads, 200);
    assert.equal(p.misreads, p.zeroMisreads + p.oneMisreads);
    assert.ok(p.zeroMisreads >= 0 && p.zeroMisreads <= 100);
    assert.ok(p.oneMisreads >= 0 && p.oneMisreads <= 100);
    close(p.share, p.misreads / 200, 1e-12);
    close(p.exact, R.misreads(base({ threshold: p.threshold })).total / 2, 1e-12);
  });
});

test("the sweep repeats for the same seed and changes for a new one", () => {
  const a = R.sweep(R.DEFAULTS, 7);
  const b = R.sweep(R.DEFAULTS, 7);
  const c = R.sweep(R.DEFAULTS, 8);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.points.map((p) => p.misreads), c.points.map((p) => p.misreads));
});

test("the sweep draws its own samples at every threshold, from one stream", () => {
  const sw = R.sweep(base({ separation: "far" }), 2);
  const at = (t) => sw.points.find((p) => p.threshold === t);
  // thresholds well below and well above the signals: every 0 (or every 1) is misread
  assert.ok(at(0).zeroMisreads >= 95, "almost every 0 is read as 1 at threshold 0");
  assert.ok(at(12).oneMisreads >= 95, "almost every 1 is read as 0 at threshold 12");
  assert.equal(at(0).oneMisreads, 0);
  assert.equal(at(12).zeroMisreads, 0);
  // the middle of Far apart almost never misreads
  assert.ok(at(6).misreads <= 3);
});

test("the sweep ignores the prepared state and the threshold slider, and changes no setting", () => {
  const s = clone(R.DEFAULTS);
  const a = R.sweep(Object.assign({}, s, { prepared: "zero", threshold: 1 }), 5);
  const b = R.sweep(Object.assign({}, s, { prepared: "split", threshold: 11 }), 5);
  assert.deepEqual(a.points, b.points);
  assert.equal(a.settings.threshold, 1);
});

test("the best threshold of a noiseless sweep is the middle, and a tie returns the middle of the tied thresholds", () => {
  SEPARATIONS.forEach((id) => {
    const points = R.sweepThresholds().map((t) => {
      const e = R.misreads(base({ separation: id, threshold: t }));
      return { threshold: t, zeroMisreads: Math.round(e.zeroAsOne * 100), oneMisreads: Math.round(e.oneAsZero * 100), misreads: Math.round(e.zeroAsOne * 100) + Math.round(e.oneAsZero * 100), reads: 200 };
    });
    const best = R.bestThreshold(points);
    close(best.threshold, middle(id), 0.5001);
    assert.ok(best.tied.includes(best.point.threshold));
  });
  const pts = [[0, 9], [1, 3], [2, 3], [3, 3], [4, 3], [5, 7]].map(([t, m]) => ({ threshold: t, zeroMisreads: m, oneMisreads: 0, misreads: m, reads: 200 }));
  const best = R.bestThreshold(pts);
  assert.deepEqual(best.tied, [1, 2, 3, 4]);
  assert.equal(best.threshold, 2.5);
  assert.equal(best.misreads, 3);
  assert.equal(best.point.threshold, 2, "the nearer tied threshold, the lower when two are as near");
  const single = R.bestThreshold([{ threshold: 1, zeroMisreads: 5, oneMisreads: 5, misreads: 10, reads: 200 }, { threshold: 2, zeroMisreads: 1, oneMisreads: 1, misreads: 2, reads: 200 }]);
  assert.equal(single.threshold, 2);
  close(single.share, 0.01);
  close(single.zeroShare, 0.01);
  close(single.oneShare, 0.01);
});

test("a seeded sweep's best threshold is near the middle, and the bottom is flat", () => {
  SEPARATIONS.forEach((id) => {
    for (let seed = 1; seed <= 5; seed++) {
      const sw = R.sweep(base({ separation: id }), seed);
      assert.ok(Math.abs(sw.best.threshold - middle(id)) <= 2, id + " " + seed + " " + sw.best.threshold);
    }
  });
  const far = R.sweep(base({ separation: "far" }), 1);
  assert.ok(far.best.tied.length >= 2, "Far apart has a flat bottom");
});

test("the sweep's best misread shares are the measured shares at the reported threshold", () => {
  const sw = R.sweep(R.DEFAULTS, 9);
  close(sw.best.zeroShare, sw.best.point.zeroMisreads / 100, 1e-12);
  close(sw.best.oneShare, sw.best.point.oneMisreads / 100, 1e-12);
});

test("the signal curves are positive, peak at their means, and cross at the middle", () => {
  SEPARATIONS.forEach((id) => {
    const sg = R.signals({ separation: id });
    assert.equal(sg.x.length, sg.zero.length);
    assert.equal(sg.x.length, sg.one.length);
    assert.equal(sg.x[0], 0);
    assert.equal(sg.x[sg.x.length - 1], 12);
    assert.ok(sg.zero.every((d) => d > 0) && sg.one.every((d) => d > 0));
    const m = R.means({ separation: id });
    assert.equal(sg.x[sg.zero.indexOf(Math.max.apply(null, sg.zero))], m.zero);
    assert.equal(sg.x[sg.one.indexOf(Math.max.apply(null, sg.one))], m.one);
    const k = sg.x.indexOf(m.middle);
    close(sg.zero[k], sg.one[k], 1e-12);
  });
  // with fall-back on, the 1 curve gains a bump at the 0 signal and is lower at its own peak
  const off = R.signals({ separation: "far" });
  const on = R.signals({ separation: "far", fallback: "on" });
  assert.ok(Math.max.apply(null, on.one) < Math.max.apply(null, off.one));
  assert.ok(on.one[30] > off.one[30], "more 1 signal at the 0 mean");
});

test("the words for shares, thresholds, and positions", () => {
  assert.equal(R.shareText(0), "under 0.1%");
  assert.equal(R.shareText(0.0004), "under 0.1%");
  assert.equal(R.shareText(0.0227501), "2.3%");
  assert.equal(R.shareText(1), "over 99.9%");
  assert.equal(R.shareText(0.5), "50.0%");
  assert.equal(R.misreadWords(0.005), "almost never");
  assert.equal(R.misreadWords(0.02), "rarely");
  assert.equal(R.misreadWords(0.1), "sometimes");
  assert.equal(R.misreadWords(0.3), "often");
  assert.match(R.thresholdWords(base({ threshold: 5 })), /at the middle/);
  assert.match(R.thresholdWords(base({ threshold: 4 })), /below the middle.*more 0s are read as 1/);
  assert.match(R.thresholdWords(base({ threshold: 6 })), /above the middle.*more 1s are read as 0/);
  assert.match(R.sharesWords(R.DEFAULTS), /started in 0 is read as 1 sometimes \(15\.9%\).*started in 1 is read as 0 almost never \(0\.1%\)/);
});

test("the pictures are SVG strings with a text alternative, and the table is a real table", () => {
  const svg = R.signalSVG(R.DEFAULTS);
  assert.match(svg, /^<svg/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="Two overlapping bell-shaped signals/);
  assert.match(svg, /signal from 0/);
  assert.match(svg, /signal from 1/);
  assert.match(svg, /readout threshold 4/);
  assert.match(svg, /misread/);
  const plain = R.signalSVG(R.DEFAULTS, { threshold: false, overlap: true });
  assert.doesNotMatch(plain, /readout threshold/);
  assert.match(plain, /overlap/);
  const r = R.read(R.DEFAULTS, "split", 1);
  const dots = R.dotsSVG(r);
  assert.match(dots, /^<svg/);
  assert.equal((dots.match(/<circle class="qed-ro__dot/g) || []).length - 1, r.started[0], "one circle per shot that started in 0, plus the legend");
  assert.equal((dots.match(/<rect class="qed-ro__dot/g) || []).length - 1, r.started[1], "one square per shot that started in 1, plus the legend");
  assert.equal((dots.match(/qed-ro__cross/g) || []).length, r.misreads, "a cross through every misread");
  assert.match(R.sweepSVG(R.DEFAULTS, null), /^<svg/);
  const sw = R.sweep(R.DEFAULTS, 1);
  assert.equal((R.sweepSVG(R.DEFAULTS, sw).match(/qed-ro__circle/g) || []).length, 25);
  assert.equal((R.sweepSVG(R.DEFAULTS, null).match(/qed-ro__circle/g) || []).length, 0);
  const table = R.tableHTML(r);
  assert.match(table, /<table/);
  assert.match(table, /What this model knows/);
  assert.match(table, /what a device sees/);
  assert.match(table, /Really started in 0/);
  assert.match(table, /scope="row"/);
  assert.match(table, /data-label="Reported 1"/);
});

test("the threshold line and the readout label sit where the threshold is", () => {
  const a = R.signalSVG(base({ threshold: 2 }));
  const b = R.signalSVG(base({ threshold: 10 }));
  assert.notEqual(a, b);
  assert.match(a, /readout threshold 2/);
  assert.match(b, /readout threshold 10/);
});

test("inputs are left unchanged", () => {
  const s = deepFreeze({ prepared: "split", separation: "close", fallback: "on", threshold: 6 });
  R.settingsOf(s);
  R.means(s);
  R.misreads(s);
  R.signals(s);
  R.read(s, "split", 1);
  R.sweep(s, 1);
  R.signalSVG(s);
  R.sweepSVG(s, R.sweep(s, 1));
  R.sharesWords(s);
  R.thresholdWords(s);
  assert.deepEqual(clone(s), { prepared: "split", separation: "close", fallback: "on", threshold: 6 });
  const pts = deepFreeze(R.sweep(R.DEFAULTS, 3).points);
  R.bestThreshold(pts);
});

test("the sweep's samples at neighbouring thresholds are independent draws, not one reused stream", () => {
  // If every threshold reused the same draws, the misreads of the 0s could only fall as the
  // threshold rises. Independent draws sometimes rise by chance where the exact share is tiny.
  let rises = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const pts = R.sweep(base({ separation: "medium" }), seed).points;
    for (let i = 1; i < pts.length; i++) if (pts[i].zeroMisreads > pts[i - 1].zeroMisreads) rises++;
  }
  assert.ok(rises > 0, "the 0s' misreads sometimes rise from one threshold to the next");
});

test("the table marks the misread cells, and only those that have shots", () => {
  const r = R.read(R.DEFAULTS, "zero", 1); // threshold 4 misreads some 0s as 1, and never starts in 1
  assert.ok(r.table[0][1] > 0 && r.table[1][0] === 0);
  const marks = (R.tableHTML(r).match(/✕ misread/g) || []).length;
  assert.equal(marks, 1, "only the started-in-0, reported-1 cell is marked");
  const clean = R.read(base({ separation: "far", threshold: 6 }), "one", 1);
  assert.equal(clean.table[1][0], 0);
  assert.equal((R.tableHTML(clean).match(/✕ misread/g) || []).length, 0, "no misreads, no marks");
  const both = R.read(base({ separation: "close", threshold: 5 }), "split", 2);
  const expected = (both.table[0][1] > 0 ? 1 : 0) + (both.table[1][0] > 0 ? 1 : 0);
  assert.equal((R.tableHTML(both).match(/✕ misread/g) || []).length, expected);
});

test("the exact line on the sweep plot is smooth, not a staircase", () => {
  const svg = R.sweepSVG(R.DEFAULTS, null);
  const d = svg.match(/class="qed-ro__exact" d="([^"]+)"/)[1];
  const ys = d.split(" L").map((pt) => pt.replace("M", "").split(" ")[1]);
  assert.equal(ys.length, 241);
  assert.ok(new Set(ys).size > 80, "many distinct heights (a staircase has at most 49), got " + new Set(ys).size);
});

test("the exact line on the sweep plot sits at the exact total share at each threshold", () => {
  [{}, { fallback: "on" }, { separation: "close" }].forEach((extra) => {
    const settings = base(Object.assign({ threshold: 4 }, extra));
    const d = R.sweepSVG(settings, null).match(/class="qed-ro__exact" d="([^"]+)"/)[1];
    [0, 2.5, 5, 7.5, 12].forEach((t) => {
      const x = (46 + (t / 12) * 294).toFixed(1);
      const y = (170 - (R.misreads(Object.assign({}, settings, { threshold: t })).total / 2 / 0.5) * 146).toFixed(1);
      assert.ok(d.includes(x + " " + y), "threshold " + t + " should be at " + x + " " + y);
    });
  });
});
