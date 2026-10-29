// Tests for docs/assets/javascripts/drive.js (window.QedDrive): a signal sent to one qubit, the
// turn it makes, the chance of reading 1, a seeded drive-and-flip sweep, a fixed
// miscalibration, a two-qubit table, and a timeline. QedDrive calls QedGates, QedQubit, and
// QedShots at run time, so all four are loaded.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["qubit.js", "gates.js", "shots.js", "drive.js"]);
const D = w.QedDrive;
const G = w.QedGates;
const Q = w.QedQubit;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const STRENGTHS = D.STRENGTHS.map((s) => s.id);
const MISCAL = D.MISCALIBRATIONS.map((m) => m.id);

test("the invented values are as stated on the page", () => {
  assert.deepEqual(D.STRENGTHS.map((s) => [s.id, s.rate]), [["weak", 15], ["medium", 30], ["strong", 45]]);
  assert.deepEqual(D.MISCALIBRATIONS.map((m) => [m.id, m.factor]), [["none", 1], ["low", 0.9], ["high", 1.1]]);
  assert.deepEqual(D.DIRECTIONS.map((d) => d.id), ["x", "y"]);
  assert.equal(D.LENGTH_MAX, 12);
  assert.equal(D.SWEEP_STEP, 0.5);
  assert.equal(D.SHOTS, 100);
  assert.deepEqual(D.DEFAULTS, { direction: "x", strength: "medium", length: 0, miscalibration: "none" });
  assert.deepEqual(D.TIMELINE.map((t) => [t.id, t.length]), [["drive", 1], ["gate2", 4], ["readout", 10]]);
});

test("unknown ids are refused with a clear message", () => {
  assert.throws(() => D.strengthById("huge"), /no strength called huge/);
  assert.throws(() => D.directionById("z"), /no direction called z/);
  assert.throws(() => D.miscalibrationById("wild"), /no miscalibration called wild/);
});

test("snapLength clamps to 0..12 and snaps to the sweep step", () => {
  assert.equal(D.snapLength(-3), 0);
  assert.equal(D.snapLength(99), 12);
  assert.equal(D.snapLength(3.2), 3);
  assert.equal(D.snapLength(3.3), 3.5);
  assert.equal(D.snapLength("6"), 6);
  assert.equal(D.snapLength(NaN), 0);
  assert.equal(D.snapLength("abc"), 0);
});

test("turn is linear in the strength and in the length", () => {
  STRENGTHS.forEach((s) => {
    const rate = D.strengthById(s).rate;
    [0, 1, 2.5, 6, 12].forEach((len) => {
      const t = D.turn({ strength: s, length: len });
      close(t.set, rate * len);
      close(t.made, t.set);
    });
  });
  // doubling the length doubles the turn
  const a = D.turn({ strength: "medium", length: 3 }).set;
  const b = D.turn({ strength: "medium", length: 6 }).set;
  close(b, 2 * a);
  // the strongest is 3x the weakest at the same length
  close(D.turn({ strength: "strong", length: 4 }).set, 3 * D.turn({ strength: "weak", length: 4 }).set);
});

test("a miscalibration scales the turn made and leaves the turn set unchanged", () => {
  const none = D.turn({ strength: "medium", length: 6, miscalibration: "none" });
  const low = D.turn({ strength: "medium", length: 6, miscalibration: "low" });
  const high = D.turn({ strength: "medium", length: 6, miscalibration: "high" });
  assert.equal(none.set, 180);
  assert.equal(low.set, 180);
  assert.equal(high.set, 180);
  close(low.made, 162);
  close(high.made, 198);
  close(low.difference, -18);
  close(high.difference, 18);
  assert.equal(none.difference, 0);
  close(low.madeRate, 27);
});

test("probabilityOne: 0 at 0 and 360, 1 at 180, 0.5 at 90, and it rises then falls", () => {
  close(D.probabilityOne(0), 0);
  close(D.probabilityOne(360), 0);
  close(D.probabilityOne(180), 1);
  close(D.probabilityOne(90), 0.5);
  close(D.probabilityOne(270), 0.5);
  close(D.probabilityOne(540), 1);
  let last = -1;
  for (let a = 0; a <= 180; a += 5) { const p = D.probabilityOne(a); assert.ok(p >= last - 1e-12); last = p; }
  for (let a = 180; a <= 360; a += 5) { const p = D.probabilityOne(a); assert.ok(p <= last + 1e-12); last = p; }
  assert.ok(D.probabilityOne(-90) >= 0 && D.probabilityOne(1e6) <= 1);
});

test("a miscalibrated half turn reads 1 about 97.6% of the time, either way", () => {
  close(D.probabilityOne(162), 0.9755, 5e-5);
  close(D.probabilityOne(198), 0.9755, 5e-5);
  const t = D.halfTurnTable("medium");
  assert.deepEqual(t.map((r) => r.id), ["none", "low", "high"]);
  close(t[0].p1, 1);
  close(t[1].p1, 0.9755, 5e-5);
  close(t[2].p1, 0.9755, 5e-5);
  assert.match(t[0].words, /on target/);
  assert.match(t[1].words, /under-rotated/);
  assert.match(t[2].words, /over-rotated/);
});

test("halfTurnLength is 180 divided by the rate, for every strength", () => {
  assert.equal(D.halfTurnLength("weak"), 12);
  assert.equal(D.halfTurnLength("medium"), 6);
  assert.equal(D.halfTurnLength("strong"), 4);
  STRENGTHS.forEach((s) => close(D.halfTurnLength(s), 180 / D.strengthById(s).rate));
});

test("the point after a turn agrees with QedGates.apply of the same rotation to |0>, in both directions", () => {
  ["x", "y"].forEach((dir) => STRENGTHS.forEach((st) => MISCAL.forEach((m) => [0, 1, 2.5, 6, 12].forEach((len) => {
    const settings = { direction: dir, strength: st, length: len, miscalibration: m };
    const o = D.outcome(settings);
    const by = G.apply(G.rotation(dir, D.turn(settings).made), { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } });
    close(o.state.alpha.re, by.alpha.re); close(o.state.alpha.im, by.alpha.im);
    close(o.state.beta.re, by.beta.re); close(o.state.beta.im, by.beta.im);
    // and the chance of reading 1 from the state equals the closed form
    close(o.p1, D.probabilityOne(D.turn(settings).made), 1e-9);
    close(o.p0 + o.p1, 1);
  }))));
});

test("the sphere angles: a half turn is the south pole, a quarter turn is the equator, in both directions", () => {
  const half = D.outcome({ direction: "x", strength: "medium", length: 6 });
  close(half.thetaDeg, 180, 1e-6);
  assert.equal(half.phiDefined, false);
  const quarter = D.outcome({ direction: "y", strength: "medium", length: 3 });
  close(quarter.thetaDeg, 90, 1e-6);
  assert.equal(quarter.phiDefined, true);
  // a quarter turn about y from |0> is the state H gives, |+>
  const plus = Q.PRESETS.filter((p) => p.name === "|+⟩")[0];
  assert.ok(plus, "|+> is a preset");
  assert.ok(Math.abs(Q.innerProduct(plus.state, quarter.state).re) > 0.9999999);
});

test("outcome at length 0 is |0>", () => {
  const o = D.outcome(D.DEFAULTS);
  close(o.p1, 0);
  close(o.thetaDeg, 0, 1e-6);
  assert.equal(o.turn.set, 0);
});

test("outcomeWords and errorWords", () => {
  assert.equal(D.outcomeWords(0), "stays at |0⟩");
  assert.equal(D.outcomeWords(0.004), "stays at |0⟩");
  assert.equal(D.outcomeWords(0.006), "ends part way between |0⟩ and |1⟩");
  assert.equal(D.outcomeWords(0.5), "ends in an even split between |0⟩ and |1⟩");
  assert.equal(D.outcomeWords(0.9755), "ends close to |1⟩, a little short of it or past it");
  assert.equal(D.outcomeWords(0.9949), "ends close to |1⟩, a little short of it or past it");
  assert.equal(D.outcomeWords(0.995), "reaches |1⟩");
  assert.equal(D.outcomeWords(1), "reaches |1⟩");
  assert.equal(D.errorWords({ strength: "medium", length: 6 }), "on target");
  assert.equal(D.errorWords({ strength: "medium", length: 0, miscalibration: "low" }), "on target");
  assert.match(D.errorWords({ strength: "medium", length: 6, miscalibration: "low" }), /under-rotated/);
  assert.match(D.errorWords({ strength: "medium", length: 6, miscalibration: "high" }), /over-rotated/);
});

test("sweepLengths: 25 lengths from 0 to 12 in steps of 0.5", () => {
  const l = D.sweepLengths();
  assert.equal(l.length, 25);
  assert.equal(l[0], 0);
  assert.equal(l[24], 12);
  assert.equal(l[1] - l[0], 0.5);
});

test("sweep: 25 points, 100 shots each, never more ones than shots, and the exact curve is stored", () => {
  const s = D.sweep(D.DEFAULTS, 1);
  assert.equal(s.points.length, 25);
  s.points.forEach((p) => {
    assert.equal(p.shots, 100);
    assert.ok(p.ones >= 0 && p.ones <= 100);
    close(p.share, p.ones / 100);
    close(p.exact, D.probabilityOne(p.made));
    close(p.set, D.strengthById("medium").rate * p.length);
  });
});

test("sweep is seeded: the same seed repeats, a different seed differs", () => {
  const a = D.sweep(D.DEFAULTS, 7);
  const b = D.sweep(D.DEFAULTS, 7);
  const c = D.sweep(D.DEFAULTS, 8);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.points.map((p) => p.ones), c.points.map((p) => p.ones));
});

test("sweep follows the exact curve: shares stay close to it, and the ends read 0 and the middle reads 1", () => {
  const s = D.sweep(D.DEFAULTS, 3);
  s.points.forEach((p) => assert.ok(Math.abs(p.share - p.exact) < 0.25, p.length));
  assert.equal(s.points[0].ones, 0);
  assert.ok(s.points.filter((p) => p.length >= 5.5 && p.length <= 6.5).every((p) => p.share > 0.9));
});

test("the best length from a noiseless sweep is the half turn, and moves with a miscalibration", () => {
  // take the exact curve as the 'noiseless' result: the point with the largest exact chance
  const peak = (settings) => {
    const pts = D.sweepLengths().map((len) => ({ length: len, p: D.probabilityOne(D.turn({ ...settings, length: len }).made) }));
    const top = Math.max(...pts.map((x) => x.p));
    return pts.filter((x) => Math.abs(x.p - top) < 1e-12).map((x) => x.length);
  };
  assert.deepEqual(peak({ strength: "medium", miscalibration: "none" }), [6]);
  // 10% weaker: the half turn takes longer, 180 / 27 = 6.67
  const low = peak({ strength: "medium", miscalibration: "low" });
  assert.ok(low[0] > 6, JSON.stringify(low));
  // 10% stronger: it takes less, 180 / 33 = 5.45
  const high = peak({ strength: "medium", miscalibration: "high" });
  assert.ok(high[0] < 6, JSON.stringify(high));
  // and the measured best (a seeded sweep) is close to the same place
  const measured = D.sweep({ strength: "medium", miscalibration: "low" }, 5).best.length;
  assert.ok(measured > 5.5 && measured < 8, measured);
});

test("bestLength reports every length tied for the most ones, and the middle of them", () => {
  const pts = [0, 1, 2, 3, 4, 5].map((len, i) => ({ length: len, ones: [0, 10, 100, 100, 100, 20][i] }));
  const b = D.bestLength(pts);
  assert.deepEqual(b.tied, [2, 3, 4]);
  assert.equal(b.length, 3);
  assert.equal(b.ones, 100);
  assert.equal(b.share, 1);
  const one = D.bestLength([{ length: 0, ones: 1 }, { length: 0.5, ones: 7 }, { length: 1, ones: 2 }]);
  assert.deepEqual(one.tied, [0.5]);
  assert.equal(one.length, 0.5);
});

test("sweep does not change any setting", () => {
  const s = deepFreeze({ direction: "y", strength: "strong", length: 4, miscalibration: "high" });
  const before = clone(s);
  D.sweep(s, 11);
  assert.deepEqual(s, before);
});

test("measure: counts total the shots, are seeded, and follow the chance of reading 1", () => {
  const settings = { direction: "x", strength: "medium", length: 3 }; // a quarter turn: an even split
  const m = D.measure(settings, 5);
  assert.equal(m.shots, 100);
  assert.equal(m.counts[0] + m.counts[1], 100);
  assert.deepEqual(D.measure(settings, 5).counts, m.counts);
  assert.notDeepEqual(D.measure(settings, 6).counts, m.counts);
  assert.ok(m.counts[1] > 30 && m.counts[1] < 70, String(m.counts[1]));
  assert.equal(D.measure({ strength: "medium", length: 0 }, 9).counts[1], 0);
  assert.equal(D.measure({ strength: "medium", length: 6 }, 9).counts[1], 100);
});

test("coupling: with it off B flips in both rows, with it on B flips only when A is |1>", () => {
  const off = D.coupling(false);
  const on = D.coupling(true);
  assert.equal(off.on, false);
  assert.deepEqual(off.rows.map((r) => r.bAfter), ["|1⟩", "|1⟩"]);
  assert.equal(off.conditional, false);
  assert.equal(on.on, true);
  assert.deepEqual(on.rows.map((r) => r.bAfter), ["|0⟩", "|1⟩"]);
  assert.equal(on.conditional, true);
  assert.deepEqual(on.rows.map((r) => r.a), ["|0⟩", "|1⟩"]);
  assert.match(off.words, /cannot depend on A/);
  assert.match(on.words, /only when A is \|1⟩/);
  assert.match(D.couplingHTML(true), /<table class="qed-xf__table">/);
  assert.match(D.couplingHTML(false), /\|1⟩ \(flipped\)/);
  assert.match(D.couplingHTML(true), /\|0⟩ \(unchanged\)/);
});

test("the timeline keeps its order and its invented lengths", () => {
  assert.deepEqual(D.TIMELINE.map((t) => t.length), [1, 4, 10]);
  assert.ok(D.TIMELINE[0].length < D.TIMELINE[1].length && D.TIMELINE[1].length < D.TIMELINE[2].length);
  const svg = D.timelineSVG();
  assert.equal((svg.match(/qed-dr__bar /g) || []).length, 3);
  assert.match(svg, /A one-qubit drive/);
  assert.match(svg, /A readout/);
  assert.match(D.timelineText(), /invented/);
});

test("signalSVG: a labelled rectangle whose size follows the strength and the length", () => {
  const rect = (settings) => {
    const m = D.signalSVG(settings).match(/class="qed-dr__signal" x="46" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
    return m && { y: Number(m[1]), w: Number(m[2]), h: Number(m[3]) };
  };
  assert.deepEqual(rect({ strength: "medium", length: 6 }), { y: 62, w: 120, h: 60 });
  assert.deepEqual(rect({ strength: "strong", length: 2 }), { y: 32, w: 40, h: 90 });
  assert.equal(rect({ strength: "medium", length: 0 }), null);
  assert.match(D.signalSVG({ strength: "medium", length: 0 }), /no signal yet/);
  assert.match(D.signalSVG({ strength: "medium", length: 6 }), />signal</);
  assert.doesNotMatch(D.signalSVG({ strength: "medium", length: 6 }), /qed-dr__made/);
  const off = D.signalSVG({ strength: "medium", length: 6, miscalibration: "low" });
  assert.match(off, /qed-dr__made/);
  assert.match(off, /what the qubit gets/);
  assert.match(off, /x="296" y="14" text-anchor="end">dashed: what the qubit gets/);
  assert.match(D.signalSVG({ strength: "medium", length: 6 }), /x="46" y="14">strength</);
  assert.match(D.signalText({ strength: "medium", length: 6, miscalibration: "low" }), /off by 10%/);
});

test("curveSVG: the exact curve always, the measured circles only after a sweep, and the ticks", () => {
  const plain = D.curveSVG(D.DEFAULTS);
  assert.match(plain, /qed-dr__curve/);
  assert.doesNotMatch(plain, /qed-dr__dot/);
  assert.match(plain, /qed-dr__now/);
  assert.match(plain, /set half turn/);
  const swept = D.curveSVG(D.DEFAULTS, D.sweep(D.DEFAULTS, 2));
  assert.equal((swept.match(/qed-dr__dot/g) || []).length, 25);
  assert.match(swept, /qed-dr__best/);
  assert.match(swept, /role="img"/);
  // a weak strength has its half turn at length 12, still on the axis
  assert.match(D.curveSVG({ strength: "weak" }), /set half turn/);
});

test("inputs are left unchanged, and the same settings give the same output", () => {
  const s = deepFreeze({ direction: "y", strength: "weak", length: 5, miscalibration: "high" });
  assert.deepEqual(D.outcome(s), D.outcome(s));
  assert.equal(D.signalSVG(s), D.signalSVG(s));
  D.turn(s); D.stateAfter(s); D.measure(s, 1); D.sweep(s, 1); D.curveSVG(s);
});

test("settings are filled in and clamped", () => {
  assert.deepEqual(D.settingsOf(), D.DEFAULTS);
  assert.equal(D.settingsOf({ length: 50 }).length, 12);
  assert.equal(D.settingsOf({ length: -4 }).length, 0);
  assert.equal(D.turn({ length: 50 }).length, 12);
});

test("no real units or device names appear in the module's visible words", () => {
  const words = JSON.stringify([D.STRENGTHS, D.MISCALIBRATIONS, D.DIRECTIONS, D.TIMELINE, D.coupling(true), D.signalSVG({ strength: "medium", length: 6, miscalibration: "low" }), D.curveSVG(D.DEFAULTS), D.timelineSVG(), D.halfTurnTable("medium")]);
  assert.doesNotMatch(words, /kelvin|hertz|GHz|MHz|nanosecond|\bns\b|µs|\bmK\b|IBM|Google|Quantinuum|fidelity of/i);
});

test("curveSVG: the exact curve is smooth (not snapped to the sweep step) and the axis title has room", () => {
  const svg = D.curveSVG(D.DEFAULTS);
  const d = svg.match(/class="qed-dr__curve" d="([^"]+)"/)[1];
  const ys = new Set(d.split(" L").map((seg) => seg.trim().split(" ")[1]));
  assert.ok(ys.size > 100, "distinct heights: " + ys.size);
  assert.match(svg, /viewBox="0 0 360 228"/);
  assert.match(svg, /y="224" text-anchor="middle">length of the signal/);
});

test("sweep: each length draws its own samples (the stream continues, it does not restart)", () => {
  // for the medium strength the chance at length l equals the chance at 12 - l (a full turn is 360),
  // so a stream that restarted at every length would give identical counts at l and 12 - l
  const pts = D.sweep(D.DEFAULTS, 1).points;
  const byLength = {};
  pts.forEach((p) => { byLength[p.length] = p; });
  let different = 0;
  pts.forEach((p) => {
    const mirror = byLength[12 - p.length];
    close(p.exact, mirror.exact, 1e-9);
    if (p.ones !== mirror.ones) different++;
  });
  assert.ok(different >= 4, "lengths whose counts differ from their mirror: " + different);
});

test("sweep under a miscalibration follows the turn made, not the turn set", () => {
  const pts = D.sweep({ strength: "medium", miscalibration: "low" }, 4).points;
  const at6 = pts.filter((p) => p.length === 6)[0];
  close(at6.set, 180);
  close(at6.made, 162);
  close(at6.exact, 0.9755, 5e-5);
  pts.forEach((p) => close(p.exact, D.probabilityOne(p.made), 1e-12));
  // the exact chance at the set half turn is below 1, so the measured share is not a perfect 100 every time
  assert.ok(at6.exact < 0.99);
});
