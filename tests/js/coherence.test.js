// Tests for docs/assets/javascripts/coherence.js (window.QedCoherence): a qubit's state fading
// in two ways (energy loss timed by T1, phase loss timed by T2) for three invented qubits, a
// seeded wait-and-read experiment, a fit that reports a T, how many operations fit, and flat
// pictures of the average of many runs. QedCoherence calls QedShots, QedGates, and QedDrive at
// run time, so QedQubit (which QedGates needs), QedGates, QedShots, and QedDrive are loaded.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModules } = require("./load.js");

const w = loadModules(["qubit.js", "gates.js", "shots.js", "drive.js", "coherence.js"]);
const C = w.QedCoherence;
const G = w.QedGates;
const D = w.QedDrive;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const QUBITS = C.QUBITS.map((q) => q.id);
const EXPERIMENTS = C.EXPERIMENTS.map((e) => e.id);
const set = (qubit, experiment, wait) => ({ qubit, experiment, wait });

test("the invented values are as stated on the page", () => {
  assert.deepEqual(C.QUBITS.map((q) => [q.id, q.t1, q.t2]), [["a", 400, 300], ["b", 400, 50], ["c", 60, 80]]);
  assert.deepEqual(C.QUBITS.map((q) => q.words), ["steady", "phase fades first", "energy fades first"]);
  C.QUBITS.forEach((q) => assert.ok(q.t2 <= 2 * q.t1, q.id + " is a possible qubit"));
  assert.deepEqual(C.EXPERIMENTS.map((e) => [e.id, e.time, e.floor]), [["energy", "T1", 0], ["phase", "T2", 0.5]]);
  assert.equal(C.WAIT_MAX, 600);
  assert.equal(C.WAIT_STEP, 5);
  assert.equal(C.SWEEP_STEP, 25);
  assert.equal(C.SHOTS, 100);
  assert.equal(C.RUNS, 24);
  assert.deepEqual(C.DEFAULTS, { qubit: "a", experiment: "energy", wait: 0 });
});

test("unknown ids are refused with a clear message", () => {
  assert.throws(() => C.qubitById("z"), /no qubit called z/);
  assert.throws(() => C.experimentById("echo"), /no experiment called echo/);
  assert.throws(() => C.startProbability("echo"), /no experiment called echo/);
});

test("snapWait clamps to 0..600 and snaps to the step", () => {
  assert.equal(C.snapWait(-4), 0);
  assert.equal(C.snapWait(9999), 600);
  assert.equal(C.snapWait(12), 10);
  assert.equal(C.snapWait(13), 15);
  assert.equal(C.snapWait("250"), 250);
  assert.equal(C.snapWait("not a number"), 0);
  assert.equal(C.snapWait(NaN), 0);
});

test("settingsOf fills in the defaults and snaps the wait", () => {
  assert.deepEqual(C.settingsOf(), C.DEFAULTS);
  assert.deepEqual(C.settingsOf({ qubit: "c", wait: 99999 }), { qubit: "c", experiment: "energy", wait: 600 });
  assert.equal(C.timeOf("b", "energy"), 400);
  assert.equal(C.timeOf("b", "phase"), 50);
});

test("survival is 1 at a wait of 0, falls with the wait, and is 1/e at one T", () => {
  assert.equal(C.survival(0, 400), 1);
  close(C.survival(400, 400), Math.exp(-1), 1e-12);
  close(C.survival(800, 400), Math.exp(-2), 1e-12);
  let last = 2;
  for (let t = 0; t <= 600; t += 25) { const s = C.survival(t, 120); assert.ok(s < last); last = s; }
  assert.ok(C.survival(1, 400) < 1, "the fall starts at once");
});

test("the energy chance of reading 1 is 100% at 0, falls toward 0, and equals the exponential", () => {
  QUBITS.forEach((q) => {
    const T = C.timeOf(q, "energy");
    close(C.probabilityOne(set(q, "energy", 0)), 1);
    for (let t = 0; t <= 600; t += 50) close(C.probabilityOne(set(q, "energy", t)), Math.exp(-t / T), 1e-9);
    assert.ok(C.probabilityOne(set(q, "energy", 600)) >= 0);
  });
  assert.ok(C.probabilityOne(set("c", "energy", 600)) < 1e-4);
});

test("the phase chance of reading 1 is 100% at 0, falls toward 50% and never below it, and equals the stated form", () => {
  QUBITS.forEach((q) => {
    const T = C.timeOf(q, "phase");
    close(C.probabilityOne(set(q, "phase", 0)), 1);
    for (let t = 0; t <= 600; t += 50) {
      const p = C.probabilityOne(set(q, "phase", t));
      close(p, 0.5 * (1 + Math.exp(-t / T)), 1e-9);
      assert.ok(p >= 0.5);
    }
  });
  close(C.probabilityOne(set("b", "phase", 600)), 0.5, 1e-5);
});

test("the starting states and the second turn agree with QedGates", () => {
  const zero = { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } };
  const p1 = (st) => st.beta.re * st.beta.re + st.beta.im * st.beta.im;
  // the energy experiment starts in |1>: an X on |0>
  close(p1(G.apply(G.gate("x"), zero)), 1);
  close(C.startProbability("energy"), 1);
  // the phase experiment: a quarter turn about y gives an even split, and a second takes it to |1>
  const once = G.apply(G.rotation("y", 90), zero);
  close(p1(once), 0.5, 1e-9);
  close(p1(G.apply(G.rotation("y", 90), once)), 1, 1e-9);
  close(C.startProbability("phase"), 1);
});

test("for each qubit the two curves differ, and the order of their falls follows T1 and T2", () => {
  QUBITS.forEach((q) => {
    const t = 200;
    assert.notEqual(round(C.chanceAt(q, "energy", t)), round(C.chanceAt(q, "phase", t)));
  });
  // Qubit B has a long T1 and a short T2: by a long wait its energy is mostly kept and its phase is gone
  assert.ok(C.chanceAt("b", "energy", 200) > 0.55);
  assert.ok(C.chanceAt("b", "phase", 200) < 0.51);
  // Qubit C has a short T1: the energy curve falls below the coin flip, which the phase curve cannot
  assert.ok(C.chanceAt("c", "energy", 200) < 0.05);
  assert.ok(C.chanceAt("c", "phase", 200) >= 0.5);
  function round(x) { return Math.round(x * 1e6) / 1e6; }
});

test("a seeded measure repeats for the same seed and changes for a new one, and the counts total the shots", () => {
  const s = set("a", "energy", 400);
  const a = C.measure(s, 11);
  const b = C.measure(s, 11);
  const c = C.measure(s, 12);
  assert.deepEqual(a.counts, b.counts);
  assert.notDeepEqual(a.counts, c.counts);
  assert.equal(a.counts[0] + a.counts[1], 100);
  assert.equal(a.shots, 100);
  close(a.exact, Math.exp(-1), 1e-12);
});

test("the measured shares follow the exact chance over many seeds", () => {
  [["a", "energy", 400], ["b", "phase", 50], ["c", "energy", 60]].forEach(([q, e, t]) => {
    let ones = 0;
    for (let seed = 1; seed <= 60; seed++) ones += C.measure(set(q, e, t), seed).counts[1];
    assert.ok(Math.abs(ones / 6000 - C.chanceAt(q, e, t)) < 0.02, q + " " + e);
  });
});

test("the sweep has 25 waits from 0 to 600 in steps of 25, each with 100 shots", () => {
  const sw = C.sweep(C.DEFAULTS, 4);
  assert.equal(sw.points.length, 25);
  assert.deepEqual(sw.points.map((p) => p.wait), Array.from({ length: 25 }, (_, i) => i * 25));
  assert.deepEqual(C.sweepWaits(), sw.points.map((p) => p.wait));
  sw.points.forEach((p) => {
    assert.equal(p.shots, 100);
    assert.ok(p.ones >= 0 && p.ones <= 100);
    close(p.share, p.ones / 100, 1e-12);
    close(p.exact, C.chanceAt("a", "energy", p.wait), 1e-12);
  });
  assert.equal(sw.actual, 400);
});

test("the sweep repeats for the same seed, changes for a new one, and ignores the wait in the settings", () => {
  const a = C.sweep(set("a", "phase", 0), 7);
  const b = C.sweep(set("a", "phase", 0), 7);
  const c = C.sweep(set("a", "phase", 0), 8);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.points.map((p) => p.ones), c.points.map((p) => p.ones));
  const d = C.sweep(set("a", "phase", 500), 7);
  assert.deepEqual(a.points, d.points);
  assert.equal(d.settings.wait, 500, "it reports the settings it was given and changes none");
});

test("the sweep draws its own samples at each wait, from one stream", () => {
  // If every wait reused the same draws, the 1s could only fall as the wait grows. Independent
  // draws sometimes rise by chance where the exact chance is nearly flat.
  let rises = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const pts = C.sweep(set("c", "energy", 0), seed).points;
    for (let i = 1; i < pts.length; i++) if (pts[i].ones > pts[i - 1].ones) rises++;
  }
  assert.ok(rises > 0, "the 1s sometimes rise from one wait to the next");
  const b = C.sweep(set("b", "phase", 0), 3).points;
  assert.equal(b[0].ones, 100, "at a wait of 0 every run reads 1");
});

test("the estimate of a noiseless sweep returns the true T for both experiments", () => {
  C.QUBITS.forEach((q) => {
    EXPERIMENTS.forEach((e) => {
      const pts = C.sweepWaits().map((t) => ({ wait: t, share: C.chanceAt(q.id, e, t) }));
      const est = C.estimate(pts, e);
      const T = C.timeOf(q.id, e);
      assert.ok(Math.abs(est.raw - T) / T < 0.003, q.id + " " + e + " " + est.raw);
      assert.equal(est.time, T, "two significant figures of the exact T");
      assert.equal(est.used, 25);
    });
  });
});

test("the estimate of a seeded sweep is near the true T over many seeds, and has two significant figures", () => {
  C.QUBITS.forEach((q) => {
    EXPERIMENTS.forEach((e) => {
      const ratios = [];
      for (let seed = 1; seed <= 40; seed++) {
        const sw = C.sweep(set(q.id, e, 0), seed);
        assert.ok(sw.estimate, "an estimate is found");
        assert.equal(Number(sw.estimate.time.toPrecision(2)), sw.estimate.time, "two significant figures");
        ratios.push(sw.estimate.raw / sw.actual);
      }
      ratios.sort((a, b) => a - b);
      const median = ratios[20];
      assert.ok(median > 0.9 && median < 1.1, q.id + " " + e + " median " + median);
      assert.ok(ratios[0] > 0.6 && ratios[39] < 1.5, q.id + " " + e + " range " + ratios[0] + " to " + ratios[39]);
    });
  });
});

test("the estimate uses every measured point, and is null when no decay can be seen", () => {
  // shares that sit at the floor give a time at the bottom of the search, which is not a finding
  const flat = C.sweepWaits().map((t) => ({ wait: t, share: 0 }));
  assert.equal(C.estimate(flat, "energy"), null);
  // shares that do not fall at all give a time at the top of the search
  const none = C.sweepWaits().map((t) => ({ wait: t, share: 1 }));
  assert.equal(C.estimate(none, "energy"), null);
  // the circles that are lost in the noise still pull on the fit
  const exact = C.sweepWaits().map((t) => ({ wait: t, share: C.chanceAt("c", "energy", t) }));
  const noisy = exact.map((p) => (p.wait >= 200 ? { wait: p.wait, share: 0.3 } : p));
  assert.ok(C.estimate(noisy, "energy").raw > C.estimate(exact, "energy").raw * 1.5);
});

test("timeScaleTick returns T, and about two-thirds of the fall has happened there", () => {
  QUBITS.forEach((q) => EXPERIMENTS.forEach((e) => {
    const t = C.timeScaleTick(set(q, e, 123));
    assert.equal(t.wait, C.timeOf(q, e));
    close(t.fallen, 1 - Math.exp(-1), 1e-12);
    assert.ok(t.fallen > 0.63 && t.fallen < 0.64);
    assert.equal(t.inRange, true);
    const floor = C.experimentById(e).floor;
    close((1 - t.chance) / (1 - floor), 1 - Math.exp(-1), 1e-9);
  }));
});

test("fits divides a time by the lengths of the 04.01.02 timeline and keeps their order", () => {
  const f = C.fits(400);
  assert.deepEqual(f.map((o) => o.id), D.TIMELINE.map((o) => o.id));
  assert.deepEqual(f.map((o) => o.length), [1, 4, 10]);
  assert.deepEqual(f.map((o) => o.count), [400, 100, 40]);
  assert.deepEqual(C.fits(60).map((o) => o.count), [60, 15, 6]);
  assert.deepEqual(C.fits(50).map((o) => o.count), [50, 12, 5], "rounded down");
  assert.deepEqual(C.fits(0).map((o) => o.count), [0, 0, 0]);
});

test("budget returns the wait that loses a share, about 4, 21, and 42 for qubit A, and 0 at a share of 0", () => {
  close(C.budget(400, 0.01), 4.0201343, 1e-6);
  close(C.budget(400, 0.05), 20.5173178, 1e-6);
  close(C.budget(400, 0.1), 42.1442063, 1e-6);
  assert.equal(C.budget(400, 0), 0);
  assert.equal(C.budget(400, 1), Infinity);
  close(C.survival(C.budget(123, 0.3), 123), 0.7, 1e-12);
  assert.ok(C.budget(60, 0.01) < C.budget(400, 0.01));
});

test("bellLoss uses the Bell circuit's total length of 15, about 4% for qubit A and 22% for qubit C", () => {
  const a = C.bellLoss({ qubit: "a" });
  const c = C.bellLoss({ qubit: "c" });
  assert.equal(a.length, 15);
  close(a.energy, 1 - Math.exp(-15 / 400), 1e-12);
  close(a.phase, 1 - Math.exp(-15 / 300), 1e-12);
  assert.ok(a.energy > 0.036 && a.energy < 0.038);
  assert.ok(c.energy > 0.22 && c.energy < 0.222);
  close(c.phase, 1 - Math.exp(-15 / 80), 1e-12);
  assert.equal(C.bellLoss({ qubit: "b" }).energy, a.energy);
  assert.ok(C.bellLoss({ qubit: "b" }).phase > a.phase);
});

test("runs returns 24 fixed dots, together at a wait of 0, and the same on every call", () => {
  QUBITS.forEach((q) => EXPERIMENTS.forEach((e) => {
    const r1 = C.runs(set(q, e, 200));
    const r2 = C.runs(set(q, e, 200));
    assert.deepEqual(r1, r2);
    assert.equal(r1.dots.length, 24);
  }));
  const p0 = C.runs(set("a", "phase", 0));
  assert.equal(p0.view, "phase");
  p0.dots.forEach((d) => { close(d.x, 1, 1e-9); close(d.y, 0, 1e-9); });
  close(p0.spreadDeg, 0, 1e-9);
  const e0 = C.runs(set("a", "energy", 0));
  assert.equal(e0.view, "energy");
  assert.equal(e0.fallen, 0);
  assert.ok(e0.dots.every((d) => d.z === -1), "every run starts in |1> at the bottom");
});

test("the phase dots spread out as the wait grows, and the energy dots fall one by one", () => {
  let last = -1;
  for (let t = 0; t <= 600; t += 50) {
    const spread = C.runs(set("a", "phase", t)).spreadDeg;
    assert.ok(spread >= last);
    last = spread;
  }
  assert.ok(C.runs(set("b", "phase", 600)).spreadDeg > 300, "almost all the way round by a long wait");
  let fallen = -1;
  for (let t = 0; t <= 600; t += 25) {
    const f = C.runs(set("c", "energy", t)).fallen;
    assert.ok(f >= fallen);
    fallen = f;
  }
  assert.ok(fallen >= 22, "nearly all of qubit C's runs have fallen by a long wait");
  // a run that has fallen stays fallen at a later wait
  const early = C.runs(set("a", "energy", 200)).dots;
  const late = C.runs(set("a", "energy", 500)).dots;
  early.forEach((d, i) => { if (d.fallen) assert.ok(late[i].fallen); });
});

test("the average arrow is the survival for the phase experiment, and slides from the bottom to the top for energy", () => {
  [0, 100, 300, 600].forEach((t) => {
    const a = C.average(set("a", "phase", t));
    close(a.length, C.survival(t, 300), 1e-6);
    close(a.y, 0, 1e-9);
    assert.ok(a.x > 0);
  });
  const start = C.average(set("a", "energy", 0));
  assert.equal(start.y, -1);
  const late = C.average(set("c", "energy", 600));
  assert.ok(late.y > 0.8);
  let last = -2;
  for (let t = 0; t <= 600; t += 50) { const y = C.average(set("c", "energy", t)).y; assert.ok(y >= last); last = y; }
  // the average is the mean of the dots, to within one run of the exact value
  const e = C.average(set("a", "energy", 400));
  assert.ok(Math.abs(e.y - (1 - 2 * Math.exp(-1))) <= 2 / 24 + 1e-9);
});

test("the spread angle gives an average of the length asked for", () => {
  assert.equal(C.spreadAngle(1), 0);
  assert.equal(C.spreadAngle(0), Math.PI);
  [0.9, 0.5, 0.2, 0.05].forEach((r) => {
    const th = C.spreadAngle(r);
    let sum = 0;
    for (let i = 0; i < 24; i++) sum += Math.cos(th * ((2 * (i + 0.5)) / 24 - 1));
    close(sum / 24, r, 1e-9);
  });
});

test("the words for the chance, the picture, and the curve", () => {
  const s = set("a", "energy", 400);
  assert.match(C.chanceWords(s), /After a wait of 400, the chance of reading 1 is 36\.8% in the energy experiment and 63\.2% in the phase experiment/);
  assert.match(C.pictureText(s), /Side view of the energy experiment.*Of 24 runs, 15 have fallen to \|0⟩ and 9 are still in \|1⟩/);
  assert.match(C.pictureText(set("a", "phase", 300)), /Top view of the phase experiment.*spread over an arc of 252 degrees.*36\.8% of full length/);
  assert.match(C.curveText(s, null), /for Qubit A/);
  assert.doesNotMatch(C.curveText(s, null), /open circles/);
  assert.match(C.curveText(s, C.sweep(s, 1)), /open circles for the energy experiment/);
});

test("the plot is an SVG string with a text alternative, both smooth exact lines, the T ticks, and the lost bracket", () => {
  const s = set("a", "energy", 200);
  const svg = C.curveSVG(s, null);
  assert.match(svg, /^<svg/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="The exact chance of reading 1/);
  assert.match(svg, /solid: energy/);
  assert.match(svg, /dashed: phase/);
  assert.match(svg, />T1</);
  assert.match(svg, />T2</);
  assert.match(svg, /lost so far/);
  assert.doesNotMatch(C.curveSVG(set("a", "energy", 0), null), /lost so far/);
  assert.equal((svg.match(/qed-co__circle/g) || []).length, 0);
  assert.equal((C.curveSVG(s, C.sweep(s, 1)).match(/qed-co__circle/g) || []).length, 25);
  // each exact line has 241 points, and the lines sit at the exact chance at the checked waits
  ["energy", "phase"].forEach((e) => {
    const d = svg.match(new RegExp('qed-co__curve--' + e + '" d="([^"]+)"'))[1];
    const pts = d.split(" L").map((pt) => pt.replace("M", "").split(" "));
    assert.equal(pts.length, 241);
    assert.ok(new Set(pts.map((p) => p[1])).size > 100, "smooth, not a staircase");
    [0, 2.5, 7.5, 150, 297.5, 600].forEach((t) => {
      const x = (46 + (t / 600) * 294).toFixed(1);
      const y = (204 - C.chanceAt("a", e, t) * 128).toFixed(1);
      assert.ok(d.includes(x + " " + y), e + " at " + t + " should be at " + x + " " + y);
    });
  });
  // the lost bracket sits on the chosen experiment
  const lostY = (settings) => C.curveSVG(settings, null).match(/qed-co__lost" d="M[^"]+/)[0];
  assert.notEqual(lostY(set("a", "energy", 200)), lostY(set("a", "phase", 200)));
});

test("the picture is an SVG string with a text alternative, one dot per run, and an arrow", () => {
  ["energy", "phase"].forEach((e) => {
    const svg = C.pictureSVG(set("a", e, 200));
    assert.match(svg, /^<svg/);
    assert.match(svg, /role="img"/);
    assert.match(svg, new RegExp(e === "energy" ? "Side view" : "Top view"));
    assert.equal((svg.match(/class="qed-co__run"/g) || []).length, 24 + 1, "24 runs plus the legend dot");
    assert.match(svg, /class="qed-co__arrow" x1="110" y1="108"/, "the average arrow starts at the centre");
  });
  assert.match(C.pictureSVG(set("a", "phase", 200)), /start/);
  assert.match(C.pictureSVG(set("a", "energy", 200)), /\|0⟩/);
  const gone = C.pictureSVG(set("b", "phase", 600));
  assert.equal((gone.match(/qed-co__arrow"/g) || []).length, 1, "only the legend arrow, because the average has no length");
});

test("the tables are real tables with the numbers from the model", () => {
  const f = C.fitsHTML(set("a", "energy", 0));
  assert.match(f, /<table/);
  assert.match(f, /scope="row"/);
  assert.match(f, /about 400/);
  assert.match(f, /about 100/);
  assert.match(f, /about 40/);
  assert.match(f, /Fit in T1 \(400\)/);
  assert.match(f, /Fit in T2 \(300\)/);
  assert.match(f, /about 75/);
  const b = C.budgetHTML(set("a", "energy", 0));
  assert.match(b, /1% of the excited runs have fallen/);
  assert.match(b, /about 4</);
  assert.match(b, /about 21</);
  assert.match(b, /about 42</);
  assert.match(C.budgetHTML(set("c", "energy", 0)), /T1 is 60/);
});

test("inputs are left unchanged", () => {
  const s = deepFreeze({ qubit: "b", experiment: "phase", wait: 120 });
  C.settingsOf(s);
  C.probabilityOne(s);
  C.measure(s, 1);
  const sw = C.sweep(s, 1);
  C.timeScaleTick(s);
  C.bellLoss(s);
  C.runs(s);
  C.average(s);
  C.chanceWords(s);
  C.pictureText(s);
  C.curveSVG(s, sw);
  C.pictureSVG(s);
  C.fitsHTML(s);
  C.budgetHTML(s);
  assert.deepEqual(clone(s), { qubit: "b", experiment: "phase", wait: 120 });
  C.estimate(deepFreeze(clone(sw.points)), "phase");
});
