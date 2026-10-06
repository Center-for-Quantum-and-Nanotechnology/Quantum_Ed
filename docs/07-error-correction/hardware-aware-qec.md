# Hardware-Aware QEC

*From ideal models to real devices.*

[Surface Codes](surface-codes.md), [Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md), and [Lattice Surgery](lattice-surgery.md) all quietly assumed something convenient: every physical qubit, gate, and measurement behaves the same way, all the time. That assumption made the ideas easier to learn. It isn't true of real hardware.

## The Assumption We Have Been Making

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: center; gap:0.6rem;">
    <div class="qed-qubit qed-qubit--physical" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 1</div><div class="qed-qubit__state">error prob. = p</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 2</div><div class="qed-qubit__state">error prob. = p</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 3</div><div class="qed-qubit__state">error prob. = p</div></div>
    <div class="qed-qubit qed-qubit--physical" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 4</div><div class="qed-qubit__state">error prob. = p</div></div>
  </div>
</div>

**What if the physical qubits don't all behave the same way?**

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: center; gap:0.6rem;">
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 1</div><div class="qed-qubit__state">T1 = 78 μs</div></div>
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 2</div><div class="qed-qubit__state">T1 = 91 μs</div></div>
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 3</div><div class="qed-qubit__state">readout 2.8%</div></div>
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:6.5rem;"><div class="qed-qubit__label">Qubit 4</div><div class="qed-qubit__state">gate err 0.06%</div></div>
  </div>
</div>

Fabricated quantum devices contain physical variation. Individual qubits, gates, and measurements can perform differently from one another. This doesn't invalidate anything from earlier in this module — a uniform model was a useful abstraction for learning how QEC machinery works. Now that abstraction gets relaxed.

## Real Hardware Is Not Uniform

Here's a small device, laid out exactly like the surface-code patches you already know. Click a physical qubit to inspect it.

<div class="qed-demo" id="hw-device-demo">
  <div id="hw-device-lattice"></div>
  <div class="qed-error-demo__readout" id="hw-device-panel" style="justify-content:center;" hidden></div>
  <p class="qed-encode-demo__hint" id="hw-device-hint" aria-live="polite">Click any physical qubit to inspect its calibration values.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("hw-device-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var panel = document.getElementById("hw-device-panel");
  var hint = document.getElementById("hw-device-hint");
  var selected = null;

  // Clearly synthetic, hand-authored educational values -- not a real
  // device. Chosen to show spatial variation without implying any
  // metric alone marks a qubit "good" or "bad".
  var TELEMETRY = {
    d0_0: { t1: 78, t2: 54, readout: 2.1, gate1q: 0.09, gate2q: 0.7, freq: 5.05 },
    d0_1: { t1: 91, t2: 66, readout: 1.2, gate1q: 0.06, gate2q: 0.5, freq: 5.11 },
    d0_2: { t1: 65, t2: 48, readout: 2.8, gate1q: 0.12, gate2q: 0.9, freq: 5.09 },
    d1_0: { t1: 84, t2: 60, readout: 1.6, gate1q: 0.08, gate2q: 0.6, freq: 5.13 },
    d1_1: { t1: 82, t2: 61, readout: 1.7, gate1q: 0.08, gate2q: 0.6, freq: 5.12 },
    d1_2: { t1: 70, t2: 51, readout: 2.3, gate1q: 0.10, gate2q: 0.8, freq: 5.07 },
    d2_0: { t1: 88, t2: 63, readout: 1.4, gate1q: 0.07, gate2q: 0.5, freq: 5.14 },
    d2_1: { t1: 59, t2: 42, readout: 3.2, gate1q: 0.14, gate2q: 1.1, freq: 5.04 },
    d2_2: { t1: 95, t2: 68, readout: 1.1, gate1q: 0.05, gate2q: 0.4, freq: 5.16 }
  };

  function label(qid) {
    return "q(" + qid.slice(1).replace("_", ",") + ")";
  }

  function pill(name, value) {
    return '<span class="qed-pill qed-pill--telemetry"><span class="qed-pill__label">' + name + "</span> " + value + "</span>";
  }

  function render() {
    QSC.mount(mountEl, lattice, { selected: selected }, onQubitClick);
    if (!selected) {
      panel.hidden = true;
      return;
    }
    var t = TELEMETRY[selected];
    panel.hidden = false;
    panel.innerHTML =
      pill("Qubit", label(selected)) +
      pill("T1", t.t1 + " μs") +
      pill("T2", t.t2 + " μs") +
      pill("Readout error", t.readout + "%") +
      pill("1Q gate error", t.gate1q + "%") +
      pill("2Q gate error", t.gate2q + "%") +
      pill("Frequency", t.freq + " GHz");
    hint.textContent = "Selected " + label(selected) + " — try another qubit and compare. Notice the values are different, even on the same device.";
  }

  function onQubitClick(qid) {
    selected = qid;
    render();
  }

  render();
});
</script>

You should see:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Same device</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Different physical locations</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:13rem;"><div class="qed-qubit__label">Different measured characteristics</div></div>
</div>

This is called **spatial variation**: the physical error environment may vary across a quantum processor. No single metric on its own tells you whether a qubit is "good" or "bad" — a qubit with a shorter \(T_1\) might still have excellent readout, for instance.

## Hardware Also Changes Over Time

Take one qubit — q(1,1), the center one above — and watch a single metric across a few calibration runs:

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: center; gap:0.8rem;">
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:8rem;"><div class="qed-qubit__label">Calibration 1</div><div class="qed-qubit__state">T1 = 82 μs</div></div>
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:8rem;"><div class="qed-qubit__label">Calibration 2</div><div class="qed-qubit__state">T1 = 77 μs</div></div>
    <div class="qed-qubit qed-qubit--telemetry" style="min-width:8rem;"><div class="qed-qubit__label">Calibration 3</div><div class="qed-qubit__state">T1 = 69 μs</div></div>
  </div>
</div>

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Same physical qubit</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Different time</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:13rem;"><div class="qed-qubit__label">Different measured characteristics</div></div>
</div>

This is **temporal variation**, or **drift**: a device characteristic measured during one calibration may not remain exactly the same indefinitely. You now have two distinct kinds of variation to track:

| | What varies | Example |
|---|---|---|
| **Spatial** | Different parts of the device | Qubit A and Qubit B, measured at the same time, have different \(T_1\) |
| **Temporal** | The same part of the device, over time | Qubit A's \(T_1\) today vs. Qubit A's \(T_1\) last week |

The numbers above are illustrative — how fast (or slowly) any specific metric actually drifts depends heavily on the hardware platform, the metric itself, and the operating conditions. Don't read a universal drift rate into this example.

## Calibration and Characterization

Quantum hardware must be measured, characterized, and adjusted so that control operations and measurements behave as intended. This is an active, ongoing process — the system doesn't simply possess perfect built-in knowledge of its own physical state.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Physical device</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:14rem;"><div class="qed-qubit__label">Characterization / calibration experiments</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:14rem;"><div class="qed-qubit__label">Measurements</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:14rem;"><div class="qed-qubit__label">Parameter estimates</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Control / calibration adjustments</div></div>
</div>

We won't go into the underlying calibration experiments or device physics here — that's a deeper topic for a future pass. What matters at this level is the shape of the process: **measure, estimate, adjust.**

## What Is Calibration Telemetry?

**Calibration telemetry** is information describing the measured or estimated characteristics of a physical device. Here's a simplified example panel, for the same q(1,1) from above:

| Category | Field | Example value |
|---|---|---|
| Qubit | \(T_1\) | 82 μs |
| Qubit | \(T_2\) | 61 μs |
| Qubit | Frequency | 5.12 GHz |
| Operation | 1-qubit gate error | 0.08% |
| Operation | 2-qubit gate error | 0.6% |
| Measurement | Readout error | 1.7% |
| Context | Qubit ID | q(1,1) |
| Context | Connectivity | 4 neighboring qubits |
| Context | Calibration age | ~3 hours ago |

A few of these, briefly:

- **\(T_1\)** — how quickly excited-state population tends to relax.
- **\(T_2\)** — how quickly phase coherence is lost, under the relevant measurement definition.
- **Readout error** — how reliably the measurement process distinguishes the expected outcomes.
- **Gate error / fidelity** — how closely an implemented operation matches its intended behavior, under a particular estimation method.

These aren't interchangeable with each other, and none of them is itself a direct probability of every possible physical error.

!!! warning
    These values come from measurements, characterization procedures, and estimation methods. **They are not quantities the quantum computer automatically knows exactly.**

## Main Interactive — Uniform Model vs. Hardware-Informed Model

This connects directly back to [Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md). Here's a small decoding graph with two candidate explanations for the same detection events: pair A with B, or pair A with C.

<div class="qed-demo" id="hw-mwpm-demo">
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary qed-button--active hw-mwpm-btn" data-model="uniform">Uniform Model</button>
    <button type="button" class="qed-button qed-button--secondary hw-mwpm-btn" data-model="hardware">Hardware-Informed Model</button>
  </div>
  <div id="hw-mwpm-graph"></div>
  <p class="qed-encode-demo__hint" id="hw-mwpm-hint" aria-live="polite"></p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("hw-mwpm-graph");
  if (!mountEl) return;
  var btns = Array.prototype.slice.call(document.querySelectorAll(".hw-mwpm-btn"));
  var hint = document.getElementById("hw-mwpm-hint");
  var NODES = { A: { x: 130, y: 34 }, B: { x: 46, y: 150 }, C: { x: 214, y: 150 } };

  var MODELS = {
    uniform: {
      weights: { "A|B": 2, "A|C": 2 },
      label: "Uniform model — both paths assumed equally likely.",
    },
    hardware: {
      weights: { "A|B": 4, "A|C": 2 },
      label: "Hardware-informed model — telemetry suggests the region the A–B path crosses has lower estimated error there, so an error chain along it is assumed less likely (higher weight).",
    },
  };

  function renderGraph(weights, preferred) {
    function isPref(a, b) {
      return preferred && ((preferred[0] === a && preferred[1] === b) || (preferred[0] === b && preferred[1] === a));
    }
    var parts = [
      '<svg class="qed-graph-svg" viewBox="0 0 260 190" width="260" height="190" role="img" aria-label="Decoding graph with nodes A, B, C and two candidate connections, A-B and A-C">',
    ];
    [["A", "B"], ["A", "C"]].forEach(function (pair) {
      var a = NODES[pair[0]];
      var b = NODES[pair[1]];
      var w = weights[pair[0] + "|" + pair[1]];
      var cls = "qed-graph-edge" + (isPref(pair[0], pair[1]) ? " is-mwpm" : "");
      parts.push('<line class="' + cls + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />');
      var mx = (a.x + b.x) / 2;
      var my = (a.y + b.y) / 2;
      parts.push('<text class="qed-graph-edge-weight" x="' + mx + '" y="' + (my - 6) + '">' + w + "</text>");
    });
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id];
      parts.push('<circle class="qed-graph-node" cx="' + n.x + '" cy="' + n.y + '" r="14" />');
      parts.push('<text class="qed-graph-node-label" x="' + n.x + '" y="' + (n.y + 4.5) + '">' + id + "</text>");
    });
    parts.push("</svg>");
    return parts.join("");
  }

  function select(key) {
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.model === key);
    });
    var model = MODELS[key];
    var w = model.weights;
    var tie = w["A|B"] === w["A|C"];
    var preferred = tie ? null : w["A|B"] < w["A|C"] ? ["A", "B"] : ["A", "C"];
    mountEl.innerHTML = renderGraph(w, preferred);
    var outcome = tie ? "Tied — both explanations are equally plausible under this model." : "Preferred explanation: A↔" + preferred[1] + ".";
    hint.textContent = model.label + " " + outcome;
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(b.dataset.model);
    });
  });

  select("uniform");
});
</script>

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit" style="min-width:14rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Same syndrome</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:14rem;"><div class="qed-qubit__label">Different error/noise model</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:14rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Different decoder weights</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:14rem;"><div class="qed-qubit__label">Possibly different recovery</div></div>
</div>

**The syndrome hasn't changed. What changed is the decoder's model of which error explanations are more plausible** — the exact idea from [Minimum-Weight Perfect Matching](minimum-weight-perfect-matching.md#weights-depend-on-the-error-model), now with the weight change motivated by (simplified, illustrative) hardware information instead of an arbitrary hypothetical. Real calibration telemetry doesn't automatically or mechanically convert into MWPM weights like this — this is a simplified educational picture of the *idea*, not a telemetry-processing pipeline.

## Telemetry Is Not the Error Model

It's tempting to compress the whole idea into one step:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:13rem;"><div class="qed-qubit__label">T1 measurement</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:13rem;"><div class="qed-qubit__label">Decoder error probability</div></div>
</div>

**That's too direct.** A telemetry value like \(T_1\) is not itself a complete QEC error model — multiple measurements and assumptions are usually needed to characterize the errors relevant to a particular code, circuit, or decoder:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:13rem;"><div class="qed-qubit__label">Hardware measurements</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:13rem;"><div class="qed-qubit__label">Characterization information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:13rem;"><div class="qed-qubit__label">Modeling / interpretation</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:13rem;"><div class="qed-qubit__label">QEC-relevant error assumptions</div></div>
</div>

## Calibration Information Has Limitations

Four worth knowing:

- **Measurement uncertainty** — calibration values are estimates derived from experiments, not exact readouts.
- **Incomplete information** — a collection of telemetry metrics doesn't describe every possible hardware error.
- **Time dependence** — hardware characteristics may change after calibration.
- **Model dependence** — different QEC or software systems may use hardware information differently.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:14rem;"><div class="qed-qubit__label">Calibration snapshot</div><div class="qed-qubit__state">Time = 10:00</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Device continues operating</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Time = 12:00</div></div>
</div>

**Is the earlier snapshot still perfectly representative? Not necessarily.** This is the idea of **calibration staleness** — we're not trying to predict *how* it goes stale here, just to make the concept concrete.

## Hardware Information Can Be Used in Different Ways

QEC is only one consumer of hardware/device information. Depending on the system, information about hardware behavior can potentially influence:

- control and recalibration
- qubit selection or placement
- compilation
- noise modeling
- decoder weighting
- code or protocol choices

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:13rem;"><div class="qed-qubit__label">Hardware information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:13rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">QEC error assumptions</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:13rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Decoder decisions</div></div>
</div>

This section has kept the focus on that QEC path, but it's one possible use of device information among several — not its sole purpose, and not all of these uses are equally mature or universally deployed today.

## Hardware-Aware QEC Is a Research and Design Space

"Hardware-aware QEC" is useful here as an umbrella description for approaches that incorporate information about physical-device behavior into QEC design or operation. **It does not refer to one universally standardized QEC architecture.**

Different approaches use hardware information for different things:

- decoder calibration or weighting
- adapting to nonuniform noise
- code selection or design
- qubit/layout choices
- exploiting known noise bias or erasure information
- other cross-layer decisions

Some QEC research instead focuses on other aspects of fault tolerance entirely — decoding algorithms, code design, architectures, or hardware itself — without centering device-specific calibration data. Treat hardware awareness as one active research and design direction, not an inevitable final stage every QEC system must reach.

## Optional Exploration — Inspect the Device

<details class="qed-details" id="explore-the-device" markdown="1">
<summary>Optional: inspect the device across two calibration snapshots →</summary>

The device map above shows spatial variation at a single point in time. This one adds a second calibration snapshot, so you can see spatial and temporal variation together — pick a qubit, then flip between snapshots.

<div class="qed-demo" id="hw-explore-demo">
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary qed-button--active hw-explore-snap" data-snap="a">Calibration Snapshot A</button>
    <button type="button" class="qed-button qed-button--secondary hw-explore-snap" data-snap="b">Calibration Snapshot B</button>
  </div>
  <div id="hw-explore-lattice"></div>
  <div class="qed-error-demo__readout" id="hw-explore-panel" style="justify-content:center;" hidden></div>
  <p class="qed-encode-demo__hint" id="hw-explore-hint" aria-live="polite">Click a physical qubit, then compare Snapshot A against Snapshot B.</p>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var mountEl = document.getElementById("hw-explore-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var panel = document.getElementById("hw-explore-panel");
  var hint = document.getElementById("hw-explore-hint");
  var btns = Array.prototype.slice.call(document.querySelectorAll(".hw-explore-snap"));
  var selected = null;
  var snap = "a";

  // Same educational-only values as the device map above for Snapshot
  // A (spatial variation); Snapshot B is a hand-authored later
  // calibration showing drift -- nonuniform on purpose: some qubits
  // barely move, one moves a lot, one even improves slightly.
  var SNAPSHOTS = {
    a: {
      d0_0: { t1: 78, t2: 54, readout: 2.1, gate1q: 0.09, gate2q: 0.7, freq: 5.05 },
      d0_1: { t1: 91, t2: 66, readout: 1.2, gate1q: 0.06, gate2q: 0.5, freq: 5.11 },
      d0_2: { t1: 65, t2: 48, readout: 2.8, gate1q: 0.12, gate2q: 0.9, freq: 5.09 },
      d1_0: { t1: 84, t2: 60, readout: 1.6, gate1q: 0.08, gate2q: 0.6, freq: 5.13 },
      d1_1: { t1: 82, t2: 61, readout: 1.7, gate1q: 0.08, gate2q: 0.6, freq: 5.12 },
      d1_2: { t1: 70, t2: 51, readout: 2.3, gate1q: 0.10, gate2q: 0.8, freq: 5.07 },
      d2_0: { t1: 88, t2: 63, readout: 1.4, gate1q: 0.07, gate2q: 0.5, freq: 5.14 },
      d2_1: { t1: 59, t2: 42, readout: 3.2, gate1q: 0.14, gate2q: 1.1, freq: 5.04 },
      d2_2: { t1: 95, t2: 68, readout: 1.1, gate1q: 0.05, gate2q: 0.4, freq: 5.16 }
    },
    b: {
      d0_0: { t1: 75, t2: 52, readout: 2.3, gate1q: 0.10, gate2q: 0.7, freq: 5.05 },
      d0_1: { t1: 88, t2: 64, readout: 1.3, gate1q: 0.06, gate2q: 0.5, freq: 5.11 },
      d0_2: { t1: 61, t2: 45, readout: 3.1, gate1q: 0.13, gate2q: 1.0, freq: 5.09 },
      d1_0: { t1: 84, t2: 60, readout: 1.6, gate1q: 0.08, gate2q: 0.6, freq: 5.13 },
      d1_1: { t1: 69, t2: 55, readout: 2.4, gate1q: 0.11, gate2q: 0.8, freq: 5.12 },
      d1_2: { t1: 70, t2: 51, readout: 2.3, gate1q: 0.10, gate2q: 0.8, freq: 5.07 },
      d2_0: { t1: 90, t2: 64, readout: 1.3, gate1q: 0.07, gate2q: 0.5, freq: 5.14 },
      d2_1: { t1: 59, t2: 42, readout: 3.2, gate1q: 0.14, gate2q: 1.1, freq: 5.04 },
      d2_2: { t1: 93, t2: 67, readout: 1.2, gate1q: 0.05, gate2q: 0.4, freq: 5.16 }
    }
  };

  function label(qid) {
    return "q(" + qid.slice(1).replace("_", ",") + ")";
  }

  function pill(name, value) {
    return '<span class="qed-pill qed-pill--telemetry"><span class="qed-pill__label">' + name + "</span> " + value + "</span>";
  }

  function render() {
    QSC.mount(mountEl, lattice, { selected: selected }, onQubitClick);
    if (!selected) {
      panel.hidden = true;
      hint.textContent = "Click a physical qubit, then compare Snapshot A against Snapshot B.";
      return;
    }
    var t = SNAPSHOTS[snap][selected];
    panel.hidden = false;
    panel.innerHTML =
      pill("Qubit", label(selected)) +
      pill("T1", t.t1 + " μs") +
      pill("T2", t.t2 + " μs") +
      pill("Readout error", t.readout + "%") +
      pill("1Q gate error", t.gate1q + "%") +
      pill("2Q gate error", t.gate2q + "%") +
      pill("Frequency", t.freq + " GHz");
    var other = snap === "a" ? SNAPSHOTS.b[selected] : SNAPSHOTS.a[selected];
    var changed = other.t1 !== t.t1 || other.readout !== t.readout;
    hint.textContent =
      label(selected) + ", Snapshot " + snap.toUpperCase() + ". " +
      (changed ? "Compare with the other snapshot — this qubit's values moved between calibrations." : "Compare with the other snapshot — this qubit barely changed between calibrations.");
  }

  function onQubitClick(qid) {
    selected = qid;
    render();
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      snap = b.dataset.snap;
      btns.forEach(function (btn) {
        btn.classList.toggle("qed-button--active", btn.dataset.snap === snap);
      });
      render();
    });
  });

  render();
});
</script>

The goal isn't to rank qubits as universally good or bad — it's to make device heterogeneity and drift tangible. Try q(1,1) specifically: it's the one used in the examples earlier on this page, and it's also the qubit that moved the most between these two snapshots.

</details>

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:16rem;"><div class="qed-qubit__label">Real quantum hardware</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:16rem;"><div class="qed-qubit__label">Nonuniform + time-varying characteristics</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:16rem;"><div class="qed-qubit__label">Calibration / characterization</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:16rem;"><div class="qed-qubit__label">Measured or estimated device information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--telemetry" style="min-width:16rem;"><div class="qed-qubit__label">Calibration telemetry</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:16rem;"><div class="qed-qubit__label">Modeling / interpretation</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:16rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">QEC-relevant error/noise model</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:16rem;"><div class="qed-qubit__label">Potentially hardware-informed QEC decisions</div></div>
</div>

**Real quantum hardware does not perfectly match the uniform error models used in introductory examples. Calibration and characterization provide information about device behavior, and some QEC approaches can use that information to build more realistic error models or make hardware-informed decisions.**

One important qualification: **hardware-aware QEC is not one standardized solution, and not the universally accepted direction of all QEC research.** It's a broad, active area exploring how knowledge of physical hardware can inform error correction — among several legitimate directions QEC research takes.

This closes out Module 07's Scaling arc, and with it, the whole module: from a single physical qubit's error, to logical qubits protected across a lattice, decoded, interacting through lattice surgery, and now grounded in the realities of the hardware all of it has to run on.

**[Back to Module 07 Overview →](index.md)**
