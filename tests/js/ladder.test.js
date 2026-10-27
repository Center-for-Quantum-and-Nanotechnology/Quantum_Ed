// Tests for docs/assets/javascripts/ladder.js (window.QedLadder): an invented five-level
// energy ladder, where it starts, and which steps a drive tuned to the first step would
// also move. The module depends on nothing.
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const L = loadModule("ladder.js").QedLadder;

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, a + " vs " + b);

const ALL = [];
L.SPACINGS.forEach((s) => L.GAPS.forEach((g) => L.TEMPERATURES.forEach((t) => ALL.push({ spacing: s.id, gap: g.id, temperature: t.id }))));

test("the invented values are as stated on the page", () => {
  assert.deepEqual(L.SPACINGS.map((s) => [s.id, s.share]), [["even", 0], ["slight", 0.02], ["clear", 0.1]]);
  assert.deepEqual(L.GAPS.map((g) => [g.id, g.value]), [["small", 1], ["medium", 2], ["large", 4]]);
  assert.deepEqual(L.TEMPERATURES.map((t) => [t.id, t.value]), [["warm", 4], ["cool", 1], ["cold", 0.25]]);
  assert.equal(L.TOLERANCE, 0.05);
  assert.equal(L.START_THRESHOLD, 0.99);
  assert.equal(L.LEVEL_COUNT, 5);
  assert.deepEqual(L.DEFAULTS, { spacing: "even", gap: "medium", temperature: "warm" });
  assert.equal(ALL.length, 27);
});

test("the five needs keep their order and wording, and only Start and Control are tested", () => {
  assert.deepEqual(L.NEEDS.map((n) => n.id), ["start", "control", "connect", "read", "keep"]);
  assert.deepEqual(L.NEEDS.map((n) => n.label), ["Start", "Control", "Connect", "Read", "Keep"]);
  assert.deepEqual(L.NEEDS.map((n) => n.tested), [true, true, false, false, false]);
  L.NEEDS.forEach((n) => assert.ok(n.plain && n.page, n.id));
});

test("levels: five levels, the two lowest are the qubit, and the first step is the gap", () => {
  L.SPACINGS.forEach((s) => L.GAPS.forEach((g) => {
    const lad = L.levels(s.id, g.id);
    assert.equal(lad.levels.length, 5);
    assert.equal(lad.steps.length, 4);
    assert.deepEqual(lad.levels.map((l) => l.qubit), [true, true, false, false, false]);
    assert.deepEqual(lad.levels.slice(0, 2).map((l) => l.name), ["|0⟩", "|1⟩"]);
    assert.equal(lad.levels[0].energy, 0);
    assert.equal(lad.steps[0].size, g.value);
    close(lad.levels[1].energy, g.value);
  }));
});

test("levels: energies rise by exactly the step sizes, and each step is smaller by the stated share", () => {
  L.SPACINGS.forEach((s) => {
    const lad = L.levels(s.id, "large");
    lad.steps.forEach((st, i) => {
      close(lad.levels[st.to].energy - lad.levels[st.from].energy, st.size);
      if (i > 0) close(st.size, lad.steps[i - 1].size * (1 - s.share));
    });
  });
  assert.deepEqual(L.levels("even", "medium").steps.map((s) => s.size), [2, 2, 2, 2]);
  close(L.levels("clear", "large").steps[3].size, 4 * 0.9 * 0.9 * 0.9);
});

test("levels: an unknown id is refused with a clear message", () => {
  assert.throws(() => L.levels("wavy", "medium"), /no spacing called wavy/);
  assert.throws(() => L.levels("even", "huge"), /no gap called huge/);
  assert.throws(() => L.startShares(L.levels("even", "medium"), "hot"), /no temperature called hot/);
});

test("startShares: always sum to 1 and are never negative, for every setting", () => {
  ALL.forEach((s) => {
    const sh = L.startShares(L.levels(s.spacing, s.gap), s.temperature);
    close(sh.zero + sh.one + sh.outside, 1);
    assert.ok(sh.zero >= 0 && sh.one >= 0 && sh.outside >= -1e-12, JSON.stringify(s));
  });
});

test("startShares: a colder system starts at least as reliably in |0>, for every gap and spacing", () => {
  L.SPACINGS.forEach((sp) => L.GAPS.forEach((g) => {
    const lad = L.levels(sp.id, g.id);
    const zero = (t) => L.startShares(lad, t).zero;
    assert.ok(zero("cool") >= zero("warm"), sp.id + g.id);
    assert.ok(zero("cold") >= zero("cool"), sp.id + g.id);
  }));
});

test("startShares: a larger gap starts at least as reliably in |0>, for every temperature and spacing", () => {
  L.SPACINGS.forEach((sp) => L.TEMPERATURES.forEach((t) => {
    const zero = (g) => L.startShares(L.levels(sp.id, g), t.id).zero;
    assert.ok(zero("medium") >= zero("small"), sp.id + t.id);
    assert.ok(zero("large") >= zero("medium"), sp.id + t.id);
  }));
});

test("startShares: known values the page quotes", () => {
  const z = (sp, g, t) => L.startShares(L.levels(sp, g), t).zero;
  close(z("even", "medium", "warm"), 0.4287, 5e-5);
  close(z("clear", "large", "cool"), 0.9815, 5e-5);
  assert.ok(z("clear", "medium", "cold") > 0.999);
  assert.ok(z("even", "small", "warm") < 0.35);
});

test("startWords: the thresholds are stated and exact", () => {
  assert.equal(L.startWords(0.99), "almost always starts in |0⟩");
  assert.equal(L.startWords(0.9899999), "usually starts in |0⟩");
  assert.equal(L.startWords(0.9), "usually starts in |0⟩");
  assert.equal(L.startWords(0.8999999), "often starts in the wrong level");
  assert.equal(L.startWords(0.43), "often starts in the wrong level");
});

test("selectivity: with even spacing no other step is selective", () => {
  L.GAPS.forEach((g) => {
    const r = L.selectivity(L.levels("even", g.id));
    assert.equal(r.length, 3);
    assert.ok(r.every((x) => x.responds && x.difference === 0));
    assert.equal(L.isSelective(r), false);
  });
});

test("selectivity: slightly uneven steps still respond, except the last", () => {
  const r = L.selectivity(L.levels("slight", "medium"));
  assert.deepEqual(r.map((x) => x.step), [2, 3, 4]);
  assert.deepEqual(r.map((x) => x.responds), [true, true, false]);
  close(r[0].difference, 0.02);
  close(r[1].difference, 1 - 0.98 * 0.98);
  assert.equal(L.isSelective(r), false);
});

test("selectivity: clearly uneven steps do not respond, so a drive can single out the pair", () => {
  L.GAPS.forEach((g) => {
    const r = L.selectivity(L.levels("clear", g.id));
    assert.deepEqual(r.map((x) => x.responds), [false, false, false]);
    assert.equal(L.isSelective(r), true);
  });
});

test("selectivity: the tolerance boundary is exact (at the tolerance responds, just beyond does not)", () => {
  const lad = L.levels("slight", "medium"); // the second step is 2% off the first
  assert.equal(L.selectivity(lad, 0.02)[0].responds, true);
  assert.equal(L.selectivity(lad, 0.0199)[0].responds, false);
  assert.equal(L.selectivity(lad, 0.0201)[0].responds, true);
  const clear = L.levels("clear", "large"); // 10% off, the float result is not exactly 0.1
  assert.equal(L.selectivity(clear, 0.1)[0].responds, true);
  assert.equal(L.selectivity(clear, 0.0999)[0].responds, false);
  // the default tolerance is the stated 5%
  assert.deepEqual(L.selectivity(lad).map((x) => x.responds), L.selectivity(lad, 0.05).map((x) => x.responds));
});

test("selectivity does not depend on the gap or the temperature", () => {
  L.SPACINGS.forEach((sp) => {
    const base = L.selectivity(L.levels(sp.id, "small")).map((x) => x.responds);
    L.GAPS.forEach((g) => assert.deepEqual(L.selectivity(L.levels(sp.id, g.id)).map((x) => x.responds), base));
  });
});

test("verdict: the starting settings fail both tests", () => {
  const v = L.verdict(L.DEFAULTS);
  assert.equal(v.needs[0].pass, false);
  assert.equal(v.needs[1].pass, false);
  assert.match(v.needs[0].detail, /often starts in the wrong level/);
  assert.match(v.needs[1].detail, /would also move steps 2, 3, 4/);
});

test("verdict: cold, medium or large gap, and clearly uneven settings pass both", () => {
  ["medium", "large"].forEach((g) => {
    const v = L.verdict({ spacing: "clear", gap: g, temperature: "cold" });
    assert.equal(v.needs[0].pass, true);
    assert.equal(v.needs[1].pass, true);
    assert.match(v.needs[0].detail, /almost always/);
    assert.match(v.needs[1].detail, /moves only the qubit's two levels/);
  });
});

test("verdict: a system can start well and still fail control, and the other way round", () => {
  const coldEven = L.verdict({ spacing: "even", gap: "large", temperature: "cold" });
  assert.equal(coldEven.needs[0].pass, true);
  assert.equal(coldEven.needs[1].pass, false);
  const warmClear = L.verdict({ spacing: "clear", gap: "small", temperature: "warm" });
  assert.equal(warmClear.needs[0].pass, false);
  assert.equal(warmClear.needs[1].pass, true);
});

test("verdict: Start does not depend on spacing, and Control does not depend on gap or temperature", () => {
  L.GAPS.forEach((g) => L.TEMPERATURES.forEach((t) => {
    const starts = L.SPACINGS.map((sp) => L.verdict({ spacing: sp.id, gap: g.id, temperature: t.id }).needs[0].pass);
    assert.ok(starts.every((p) => p === starts[0]), g.id + t.id);
  }));
  L.SPACINGS.forEach((sp) => {
    const controls = [];
    L.GAPS.forEach((g) => L.TEMPERATURES.forEach((t) => controls.push(L.verdict({ spacing: sp.id, gap: g.id, temperature: t.id }).needs[1].pass)));
    assert.ok(controls.every((p) => p === controls[0]), sp.id);
  });
});

test("verdict never marks Connect, Read, or Keep as passed or failed", () => {
  ALL.forEach((s) => {
    const v = L.verdict(s);
    assert.deepEqual(v.needs.map((n) => n.id), ["start", "control", "connect", "read", "keep"]);
    v.needs.slice(2).forEach((n) => {
      assert.equal(n.tested, false);
      assert.equal(n.pass, null);
      assert.match(n.detail, /^Not tested on this page\./);
    });
    assert.equal(v.needs[0].tested, true);
    assert.equal(v.needs[1].tested, true);
    assert.match(v.summary, /Passing two needs is not being a qubit/);
  });
});

test("verdict fills in the defaults for missing settings", () => {
  assert.deepEqual(L.verdict().settings, L.DEFAULTS);
  assert.deepEqual(L.verdict({ gap: "large" }).settings, { spacing: "even", gap: "large", temperature: "warm" });
});

test("inputs are left unchanged, and the same settings give the same output", () => {
  const s = deepFreeze({ spacing: "slight", gap: "large", temperature: "cool" });
  const a = L.verdict(s);
  const b = L.verdict(s);
  assert.deepEqual(a, b);
  const lad = deepFreeze(clone(L.levels("clear", "medium")));
  L.startShares(lad, "cold");
  L.selectivity(lad);
  L.renderSVG(lad, { heat: "cold", drive: true });
  assert.deepEqual(lad, L.levels("clear", "medium"));
});

test("ladderText describes the five levels and the four steps", () => {
  const t = L.ladderText(L.levels("clear", "medium"));
  assert.match(t, /five levels/);
  assert.match(t, /invented/);
  assert.match(t, /step 1 is 2\.00, step 2 is 1\.80, step 3 is 1\.62, step 4 is 1\.46/);
});

test("renderSVG: draws five labelled levels, four steps, and marks which are the qubit", () => {
  const svg = L.renderSVG(L.levels("clear", "medium"));
  assert.match(svg, /^<svg /);
  assert.equal((svg.match(/qed-ld__level qed-ld__level--/g) || []).length, 5);
  assert.equal((svg.match(/qed-ld__level--qubit/g) || []).length, 2);
  assert.equal((svg.match(/qed-ld__level--outside/g) || []).length, 3);
  assert.equal((svg.match(/>step \d: /g) || []).length, 4);
  assert.match(svg, /\|0⟩/);
  assert.match(svg, /\|1⟩/);
  assert.match(svg, /outside the qubit/);
  assert.match(svg, /role="img"/);
  assert.doesNotMatch(svg, /qed-ld__heat|qed-ld__drive/);
});

test("renderSVG: the heat gauge and the drive arrow appear only when asked for", () => {
  const lad = L.levels("even", "large");
  const hot = L.renderSVG(lad, { heat: "warm" });
  assert.match(hot, /qed-ld__heat"/);
  assert.match(hot, />heat</);
  assert.doesNotMatch(hot, /qed-ld__drive/);
  const driven = L.renderSVG(lad, { drive: true });
  assert.equal((driven.match(/qed-ld__drive"/g) || []).length, 2); // a double line
  assert.match(driven, />drive</);
});

test("renderSVG: the drawing scale is fixed, so a taller heat gauge is drawn for a warmer system", () => {
  const lad = L.levels("even", "medium");
  const h = (t) => Number(L.renderSVG(lad, { heat: t }).match(/class="qed-ld__heat" x="80" y="[\d.]+" width="14" height="([\d.]+)"/)[1]);
  assert.ok(h("warm") > h("cool"));
  assert.ok(h("cool") > h("cold"));
});

test("no real units or device names appear in the module's visible words", () => {
  const words = JSON.stringify([L.SPACINGS, L.GAPS, L.TEMPERATURES, L.NEEDS, L.verdict(L.DEFAULTS), L.renderSVG(L.levels("even", "medium"), { heat: "warm", drive: true })]);
  assert.doesNotMatch(words, /kelvin|hertz|GHz|MHz|µs|\bmK\b|IBM|Google|Quantinuum/i);
});

test("renderSVG: the picture is cropped to the system's height at a fixed scale", () => {
  const top = (g, opts) => Number(L.renderSVG(L.levels("even", g), opts).match(/viewBox="0 (-?\d+) 372 (\d+)"/)[1]);
  assert.ok(top("small") > top("medium"), "a smaller ladder has less headroom");
  assert.ok(top("medium") > top("large"));
  assert.equal(top("medium"), top("medium", { heat: "cool" }), "a heat gauge below the top does not change the crop");
  const height = (g) => Number(L.renderSVG(L.levels("even", g)).match(/viewBox="0 -?\d+ 372 (\d+)"/)[1]);
  assert.ok(height("small") < height("medium") && height("medium") < height("large"));
});

test("the needs name pages by title, never by spec id, and say where each is taken up", () => {
  const v = L.verdict(L.DEFAULTS);
  assert.deepEqual(v.needs.slice(2).map((n) => n.page), ["Gates and Control, and the platform pages", "Readout", "Coherence and Noise"]);
  v.needs.slice(2).forEach((n) => assert.match(n.detail, /^Not tested on this page\. Taken up in: .+\.$/));
  assert.doesNotMatch(JSON.stringify(v.needs), /04\.0\d\.0\d/);
});

test("shareText: one decimal place, and never 100.0% or 0.0% (a start is never certain)", () => {
  assert.equal(L.shareText(0.4287), "42.9%");
  assert.equal(L.shareText(0.9995), ">99.9%");
  assert.equal(L.shareText(0.99949), "99.9%");
  assert.equal(L.shareText(1), ">99.9%");
  assert.equal(L.shareText(0.0004999), "<0.1%");
  assert.equal(L.shareText(0.0005), "0.1%");
  assert.equal(L.shareText(0), "<0.1%");
  ALL.forEach((s) => {
    const v = L.verdict(s);
    assert.doesNotMatch(v.needs[0].detail, /100\.0%|(?<![\d.])0\.0%/);
  });
  assert.match(L.verdict({ spacing: "clear", gap: "large", temperature: "cold" }).needs[0].detail, />99\.9% in \|0⟩, <0\.1% in \|1⟩, <0\.1% outside/);
});

test("renderSVG: the crop and the heat gauge use the stated scale (15 per unit, headroom 22)", () => {
  // medium gap: the tallest ladder is 4 steps of 2 = 8 units, so the top is 288 - 8 * 15 - 22 = 146
  const medium = L.renderSVG(L.levels("even", "medium"));
  assert.match(medium, /viewBox="0 146 372 170"/);
  // a heat of 4 is below that top, so the crop is unchanged and the gauge is 4 * 15 = 60 tall
  const warm = L.renderSVG(L.levels("even", "medium"), { heat: "warm" });
  assert.match(warm, /viewBox="0 146 372 170"/);
  assert.match(warm, /class="qed-ld__heat" x="80" y="228" width="14" height="60"/);
  // a small gap with heat 4: the heat reaches above the ladder, so the crop makes room for it
  const small = L.renderSVG(L.levels("even", "small"), { heat: "warm" });
  assert.match(small, /viewBox="0 206 372 110"/);
});
