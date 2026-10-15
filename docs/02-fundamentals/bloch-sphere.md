# Bloch Sphere

A state can be pictured as a point on a sphere.

## From a List of Numbers to a Picture

On the [previous page](qubit-representation.md), we wrote a state as two amplitudes. We also found that a sign is a real difference in the state, yet it is easy to miss in a list of numbers.

<div class="qed-demo">
  <div class="qed-compare-row" style="margin-top:0.2rem;">
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Before</span><span>A state is written as two amplitudes</span></div>
    <span aria-hidden="true">↓</span>
    <div class="qed-flow-step qed-flow-step--inference"><span class="qed-flow-step__label">Now</span><span>The sign is a real difference, but easy to miss in a list</span></div>
  </div>
</div>

> **How can we picture a state, including its sign, instead of reading a list of numbers?**

We have already met a picture like this. The qubit section of [What Is Quantum Computing?](../01-foundations/what-is-quantum-computing.md#qubits) showed a sphere with two sliders. Here we use the sphere as a tool for reading a state: where a point sits tells us the probabilities and the phase. It is a picture of the numbers you already know, not a new object.

## A Map of States

The **[Bloch sphere](../glossary.md#bloch-sphere)** is a globe-like picture of the states of one qubit. Every state is one point on it.

- **Poles** — |0⟩ at the north pole (certain 0) and |1⟩ at the south pole (certain 1).
- **Equator** — |+⟩, |−⟩, |+i⟩, and |−i⟩, each equally likely to give 0 or 1.
- **Point** — one state. A point is not an outcome.

Start with |0⟩ at the top and |+⟩ on the equator. Here are all six named points, with the two angles that place them. The *polar angle* is measured down from the north pole, and the *phase angle* is measured around the equator.

<div class="qed-demo" id="bs-map"></div>

!!! question "Is the qubit pointing up?"
    No. The sphere is a picture of the state. North is not a direction in the room; it is where the state |0⟩ is drawn.

## Sphere Explorer

Move the point and watch what happens. Start from a preset, or set the two angles yourself. The sphere, the description of the state, and the probability bars each sit in their own place.

<div class="qed-demo qed-sphere" id="bs-explorer">
  <p class="qed-demo__step"><strong>1. Choose a preset, or move the point yourself</strong></p>
  <div class="qed-demo__controls" role="group" aria-label="Presets" id="bs-presets"></div>

  <div class="qed-sphere__layout">
    <div class="qed-sphere__view">
      <canvas id="bs-canvas" width="360" height="360" role="img" aria-label="Bloch sphere."></canvas>
      <p class="qed-editor__sign">Top: certain 0. Equator: 50/50. Bottom: certain 1. The dashed line from the point to the vertical axis shows its height.</p>
    </div>
    <div class="qed-sphere__controls">
      <div class="qed-editor__amp">
        <p class="qed-editor__amp-title"><strong>Polar angle</strong> (0° to 180°, down from the north pole)</p>
        <div class="qed-editor__inputs">
          <input type="range" id="bs-theta-range" min="0" max="180" step="1" aria-label="Polar angle in degrees, slider">
          <input type="number" id="bs-theta-num" min="0" max="180" step="1" aria-label="Polar angle in degrees, typed value">
        </div>
      </div>
      <div class="qed-editor__amp">
        <p class="qed-editor__amp-title"><strong>Phase angle</strong> (0° to 360°, around the equator)</p>
        <div class="qed-editor__inputs">
          <input type="range" id="bs-phi-range" min="0" max="360" step="1" aria-label="Phase angle in degrees, slider">
          <input type="number" id="bs-phi-num" min="0" max="360" step="1" aria-label="Phase angle in degrees, typed value">
        </div>
        <p class="qed-editor__sign">A phase of 0° means the two amplitudes have the same sign, like |+⟩. A phase of 180° means opposite signs, like |−⟩.</p>
      </div>
      <div class="qed-demo__controls">
        <button type="button" class="qed-button" id="bs-pin">Pin this state</button>
        <button type="button" class="qed-button qed-button--secondary" id="bs-unpin" disabled>Clear the pin</button>
        <button type="button" class="qed-button qed-button--secondary" id="bs-reset">Reset</button>
      </div>
      <p class="qed-editor__details" id="bs-pin-info"></p>
    </div>
  </div>

  <p class="qed-demo__step"><strong>2. The state at this point</strong></p>
  <div class="qed-prepared qed-prepared--live">
    <span class="qed-prepared__tag">State</span>
    <span><span id="bs-desc"></span> <span id="bs-name"></span></span>
  </div>
  <p class="qed-editor__details" id="bs-caption"></p>

  <div id="bs-inter" hidden>
    <p class="qed-demo__step"><strong>Intermediate readouts</strong></p>
    <p class="qed-editor__details" id="bs-form"></p>
    <p class="qed-editor__details" id="bs-vec"></p>
    <div class="qed-editor__global">
      <label for="bs-global-range"><strong>Shift both phases together</strong> (overall phase, degrees)</label>
      <div class="qed-editor__inputs">
        <input type="range" id="bs-global-range" min="-180" max="180" step="1" value="0">
        <output id="bs-global-out">0°</output>
      </div>
    </div>
  </div>

  <p class="qed-demo__step"><strong>3. The probabilities</strong></p>
  <div id="bs-bars"></div>

  <p class="qed-editor__note" id="bs-note"></p>
  <div class="qed-sr-only" id="bs-summary" role="status" aria-live="polite"></div>
</div>

The numbers you see are the size of each amplitude and the phase angle. The sphere shows the same state as a point, and the bars show what that state will do when it is measured in the Z basis.

## Height Decides the Probabilities

On the [previous page](qubit-representation.md), the probabilities came from squaring the amplitudes. On the sphere, the same information is the **height** of the point.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span>Top of the sphere, the north pole: certain 0</span></div>
  <div class="qed-encode-demo__arrow">↓ lower the point</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span>Halfway, on the equator: 50/50</span></div>
  <div class="qed-encode-demo__arrow">↓ lower it further</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:18rem;"><span>Bottom of the sphere, the south pole: certain 1</span></div>
</div>

Between the poles the probabilities slide smoothly. The dashed line in the explorer runs from the point straight across to the vertical axis. Where it lands is the height, and the height sets the bars.

Check your understanding. First, predict before the bars appear:

<div class="qed-demo" id="bs-quiz-predict"></div>
<div class="qed-demo" id="bs-predict-bars" hidden></div>

Then decide which pairs of points give the same Z-basis probabilities:

<div class="qed-demo" id="bs-quiz-same"></div>

Now try one yourself, using the explorer above:

<div class="qed-demo" id="bs-transfer">
  <p><strong>Make outcome 1 happen 25% of the time.</strong></p>
  <div class="qed-demo__controls">
    <button type="button" class="qed-button qed-button--secondary" id="bs-transfer-check">Check my point</button>
  </div>
  <p class="qed-quiz__feedback" id="bs-transfer-feedback" aria-live="polite"></p>
</div>

## Around the Equator: Phase as an Angle

Slide the phase angle in the explorer while the polar angle stays at 90°. The point travels around the equator. Its height does not change, so the bars do not change. The state does.

**Phase** is the angle around the equator. Compare |+⟩ and |−⟩. The faded diamond is |+⟩ and the solid point is |−⟩:

<div class="qed-demo" id="bs-compare"></div>

They sit at the same height, on opposite sides of the sphere. This is the same-counts, different-states idea from the previous pages, now as a picture. The real-amplitude states you built on the previous page all sit on one circle of the sphere, where the phase is 0° or 180°.

!!! question "If the height is the same, in what way are |+⟩ and |−⟩ different?"
    They sit at different places around the equator. The Z-basis counts cannot tell them apart. Later pages show how to tell them apart. Nothing on this page does.

Two things to keep in mind. The sphere pictures a **[pure state](../glossary.md#pure-state)** of one qubit, up to a shared overall phase. And a later page shows an operation that turns a phase difference into a difference you can see.

<div class="qed-level" data-min-level="intermediate" markdown="1">

## Beyond the Core

### The formal picture

**The formula.** The two angles give the state:

\[ |\psi\rangle = \cos\tfrac{\theta}{2}\,|0\rangle + e^{i\varphi}\sin\tfrac{\theta}{2}\,|1\rangle . \]

So the amplitude of \(|0\rangle\) is \(\cos(\theta/2)\), and the amplitude of \(|1\rangle\) is \(e^{i\varphi}\sin(\theta/2)\). The sizes are the two numbers the main view showed. The angle \(\varphi\) is the [relative phase](../glossary.md#relative-phase) from the previous page. The probabilities are \(\cos^2(\theta/2)\) and \(\sin^2(\theta/2)\), and \(\varphi\) does not appear in them. That is why moving around the equator changes no bar.

**The Bloch vector.** The point has three coordinates:

\[ (x, y, z) = (\sin\theta\cos\varphi,\; \sin\theta\sin\varphi,\; \cos\theta) . \]

The height is \(z\), and \(z = |\alpha|^2 - |\beta|^2 = P(0) - P(1)\). Since \(P(0) + P(1) = 1\), this gives

\[ P(0) = \frac{1 + z}{2} . \]

The explorer now shows the written form, \((x, y, z)\), and \(P(0)\) beside the bars. Check that \(P(0)\) from the formula matches the bar.

**Global phase.** Multiply both amplitudes by the same phase factor and the point does not move. The [global phase](../glossary.md#global-phase) shift in the explorer changes the written amplitudes, while the point and the bars stay put. This is why the sphere shows a state only up to a shared overall phase: the picture fixes the |0⟩ amplitude to be real and not negative.

**Opposite points are orthogonal.** Two points on opposite sides of the sphere are [orthogonal states](../glossary.md#orthogonal-states): their inner product is zero. Your current point and its opposite:

<p class="qed-editor__details" id="bs-opposite"></p>

<div id="bs-opposite-table"></div>

**The limits of the picture.** The sphere is one qubit in a pure state. Two qubits do not fit on one sphere, and a mixed state does not sit on the sphere's surface. We name these limits here and treat them later.

</div>

<div class="qed-level" data-min-level="advanced" markdown="1">

### Naming the formalism

A **[mixed state](../glossary.md#mixed-state)** is described by a **[density matrix](../glossary.md#density-matrix)**. On the Bloch picture it sits inside the ball rather than on its surface, and a point at the centre is as uncertain as a state can be. A later treatment makes these ideas precise.

</div>

## From Picture to Motion

Compare what you can do now with what is still unknown.

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>So far</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Read a state as a point</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Read the probabilities from the height</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Read the phase from the angle</span></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem;">
      <strong>Still unknown</strong>
      <div class="qed-flow-step qed-flow-step--inference"><span>Get a state to a different point</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Change a state on purpose</span></div>
      <span aria-hidden="true">↓</span>
      <div class="qed-flow-step qed-flow-step--inference"><span>Build the states we need</span></div>
    </div>
  </div>
</div>

A state can start at one point and be needed at another:

<div class="qed-demo" id="bs-bridge">
  <canvas id="bs-bridge-canvas" width="300" height="300" role="img" aria-label="Bloch sphere with a faded diamond marking where a state starts, labelled from here, and a solid point elsewhere on the sphere, labelled to here."></canvas>
</div>

A point can sit anywhere on the sphere, but we do not yet know how to get it from one place to another.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A state</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>A point on a sphere</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>Height sets the probabilities, and the angle around the equator is phase</span></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-flow-step qed-flow-step--inference" style="min-width:16rem;"><span>The picture shows one qubit in a pure state</span></div>
</div>

A qubit's state can be pictured as a point on a sphere. Height sets the probabilities and the angle around the equator carries the phase, and the picture shows one qubit in a pure state only.

> **How can we move a state from one point to another?**

**Next: [Quantum Gates →](quantum-gates.md)**

<script>
document.addEventListener("DOMContentLoaded", function () {
  var Q = window.QedQubit;
  var B = window.QedBloch;
  var S = window.QedShots;
  var QL = window.QedLevel;
  var Z = window.QedQuiz;

  function $(id) { return document.getElementById(id); }
  function pct(p) { return Math.round(p * 1000) / 10; }
  function fix(x, digits) { return x.toFixed(digits); }
  function sgn(x) { var t = Math.abs(x).toFixed(2); return (x < 0 && parseFloat(t) !== 0 ? "−" : "") + t; }
  function ang(x) { return String(Math.round(x * 10) / 10); }
  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  function wrap360(x) { return ((x % 360) + 360) % 360; }
  function cssColor(name, fallback) {
    var v = getComputedStyle(document.body).getPropertyValue(name).trim(); // the palette variables are set on body
    return v || fallback;
  }

  // The six named points come from the shared presets; the angles come from the
  // shared Bloch conversion, rounded to whole degrees for the controls.
  var NAMED = Q.PRESETS.map(function (p) {
    var b = Q.toBloch(p.state);
    return { id: p.id, name: p.name, theta: Math.round(b.thetaDeg), phi: Math.round(b.phiDeg) };
  });
  function named(id) { return NAMED.filter(function (p) { return p.id === id; })[0]; }
  var EQUATOR_MARKERS = NAMED.filter(function (p) { return p.id !== "zero" && p.id !== "one"; }).map(function (p) {
    return { thetaDeg: p.theta, phiDeg: p.phi, label: p.name };
  });

  // The named point at these angles, if any. At a pole the phase angle means nothing.
  function nameAt(theta, phi) {
    for (var i = 0; i < NAMED.length; i++) {
      var p = NAMED[i];
      if (Math.abs(theta - p.theta) > 0.5) continue;
      if (p.theta === 0 || p.theta === 180 || Math.abs(wrap360(phi) - p.phi) < 0.5) return p.name;
    }
    return "";
  }

  function probRows(p0, p1) {
    return [
      { label: "Outcome 0", fraction: p0, text: pct(p0) + "%" },
      { label: "Outcome 1", fraction: p1, text: pct(p1) + "%" }
    ];
  }

  // ---- drawing ------------------------------------------------------------------
  // QedBloch draws the sphere; the "certain 0 / certain 1 / 50/50" words are page-local.
  function annotate(cv, color) {
    var ctx = cv.getContext("2d");
    var cx = cv.width / 2;
    var cy = cv.height / 2;
    var r = Math.min(cv.width, cv.height) * 0.365;
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "12px sans-serif";
    ctx.fillText("certain 0", cx + 22, cy - r - 8);
    ctx.fillText("certain 1", cx + 22, cy + r + 18);
    ctx.fillText("50/50", 4, cy + 18);
    ctx.restore();
  }

  function draw(cv, theta, phi, pinned, withMarkers) {
    var opts = {
      color: cssColor("--md-default-fg-color", "#222"),
      neutral: cssColor("--md-default-fg-color--light", "#888"),
      axes: true,
      projection: true,
      depth: true
    };
    // a named point that is also the pinned state keeps only the pinned label
    if (withMarkers) {
      var list = withMarkers === true ? EQUATOR_MARKERS : withMarkers;
      opts.markers = list.filter(function (m) { return !pinned || m.label !== pinned.label; });
    }
    if (pinned) opts.pinned = pinned;
    B.render(cv, theta, phi, opts);
    annotate(cv, opts.neutral);
  }

  // ---- static tables ------------------------------------------------------------
  function buildMap() {
    var rows = NAMED.map(function (p, i) {
      var state = Q.PRESETS[i].state;
      var pr = Q.probabilities(state);
      var where = p.theta === 0 ? "North pole" : p.theta === 180 ? "South pole" : "Equator";
      var phase = p.theta === 0 || p.theta === 180 ? "not needed" : p.phi + "°";
      return "<tr><th scope=\"row\">" + p.name + "</th><td>" + where + "</td><td>" + p.theta + "°</td><td>" + phase + "</td><td>" + pct(pr[0]) + "% / " + pct(pr[1]) + "%</td></tr>";
    }).join("");
    $("bs-map").innerHTML =
      '<table class="qed-comparison-table"><thead><tr><th scope="col">State</th><th scope="col">Where</th><th scope="col">Polar angle</th><th scope="col">Phase angle</th><th scope="col">Outcome 0 / outcome 1</th></tr></thead><tbody>' +
      rows + "</tbody></table>";
  }

  function buildOppositeTable() {
    var pairs = [["zero", "one", "North pole and south pole"], ["plus", "minus", "Opposite sides of the equator"], ["plusI", "minusI", "The other pair of opposite sides of the equator"]];
    var presets = {};
    Q.PRESETS.forEach(function (p) { presets[p.id] = p; });
    var rows = pairs.map(function (pr) {
      var a = presets[pr[0]];
      var b = presets[pr[1]];
      return "<tr><th scope=\"row\">" + a.name + " and " + b.name + "</th><td>" + pr[2] + "</td><td>⟨" + a.name.slice(1, -1) + "|" + b.name.slice(1, -1) + "⟩ = " + Q.formatAmplitude(Q.innerProduct(a.state, b.state)) + "</td></tr>";
    }).join("");
    $("bs-opposite-table").innerHTML =
      '<table class="qed-comparison-table"><thead><tr><th scope="col">Pair</th><th scope="col">Where</th><th scope="col">Inner product</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // Two fixed pictures: |+> against |->, and a start and a target.
  function buildCompare() {
    var plus = named("plus");
    var minus = named("minus");
    var box = $("bs-compare");
    box.innerHTML =
      '<div class="qed-demo__layout">' +
      '<canvas id="bs-compare-canvas" width="300" height="300" role="img" aria-label="Bloch sphere showing |+⟩ as a faded diamond on the right of the equator and |−⟩ as a solid point on the left. Both are at the same height."></canvas>' +
      '<div class="qed-sphere__bars">' +
      '<div class="qed-prepared"><span class="qed-prepared__tag">|+⟩</span><strong>' + Q.format(Q.PRESETS[2].state) + "</strong>" + S.renderBars(probRows(0.5, 0.5)) + "</div>" +
      '<div class="qed-prepared"><span class="qed-prepared__tag">|−⟩</span><strong>' + Q.format(Q.PRESETS[3].state) + "</strong>" + S.renderBars(probRows(0.5, 0.5)) + "</div>" +
      "</div></div>";
    function paint() {
      draw($("bs-compare-canvas"), minus.theta, minus.phi, { thetaDeg: plus.theta, phiDeg: plus.phi, label: "|+⟩" }, [{ thetaDeg: minus.theta, phiDeg: minus.phi, label: "|−⟩" }]);
    }
    paint();
    return paint;
  }

  function buildBridge() {
    var cv = $("bs-bridge-canvas");
    function paint() {
      var opts = {
        color: cssColor("--md-default-fg-color", "#222"),
        neutral: cssColor("--md-default-fg-color--light", "#888"),
        axes: true,
        depth: true,
        pinned: { thetaDeg: 0, phiDeg: 0, label: "from here" },
        markers: [{ thetaDeg: 140, phiDeg: 250, label: "to here" }]
      };
      B.render(cv, 140, 250, opts);
    }
    paint();
    return paint;
  }

  // ---- the explorer -------------------------------------------------------------
  var START = { theta: 90, phi: 0 };
  var live = { theta: START.theta, phi: START.phi };
  var pin = null;
  var gamma = 0;
  var note = "";

  function heightWords(theta, s) {
    if (theta === 0) return "the top (the north pole), so outcome 0 is certain";
    if (theta === 180) return "the bottom (the south pole), so outcome 1 is certain";
    var z = Math.cos((theta * Math.PI) / 180);
    if (Math.abs(z) < 0.005) return "halfway, so 50/50";
    return (z > 0 ? "above halfway, so outcome 0 is more likely" : "below halfway, so outcome 1 is more likely") +
      " (" + pct(s.p0) + "% to " + pct(s.p1) + "%)";
  }

  function atPole(theta) { return theta === 0 || theta === 180; }

  function render(skip) {
    var th = live.theta;
    var ph = live.phi;
    var s = B.state(th, ph);
    var pole = atPole(th);
    var name = nameAt(th, ph);

    // the sphere
    draw(
      $("bs-canvas"), th, ph,
      pin ? { thetaDeg: pin.theta, phiDeg: pin.phi, label: pin.label } : null,
      true
    );

    // the state description (the Beginner view, whatever the level)
    $("bs-desc").textContent =
      "Size of the |0⟩ amplitude: " + fix(s.a0, 2) + ". Size of the |1⟩ amplitude: " + fix(s.a1, 2) + ". Phase angle: " +
      (pole ? "not needed here" : ang(ph) + "°") + ".";
    $("bs-name").textContent = name ? "(this is " + name + ")" : "";
    $("bs-caption").textContent =
      "Height: " + heightWords(th, s) + ". Phase: " + (pole ? "it does not matter at a pole, since the state is the same whatever the angle." : ang(ph) + "°.");

    // the probabilities, in their own place
    $("bs-bars").innerHTML = S.renderBars(probRows(s.p0, s.p1));

    // controls
    if ($("bs-theta-range") !== skip) $("bs-theta-range").value = th;
    if ($("bs-theta-num") !== skip) $("bs-theta-num").value = ang(th);
    if ($("bs-phi-range") !== skip) $("bs-phi-range").value = ph;
    if ($("bs-phi-num") !== skip) $("bs-phi-num").value = ang(ph);

    Array.prototype.forEach.call($("bs-presets").querySelectorAll("button"), function (b) {
      var on = b.dataset.name === name;
      b.classList.toggle("qed-button--active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    // the pin
    $("bs-unpin").disabled = !pin;
    if (pin) {
      var ps = B.state(pin.theta, pin.phi);
      $("bs-pin-info").textContent =
        "Pinned: " + pin.label + " (polar angle " + ang(pin.theta) + "°, " +
        (atPole(pin.theta) ? "phase not needed" : "phase " + ang(pin.phi) + "°") +
        "). Its outcome probabilities are " + pct(ps.p0) + "% and " + pct(ps.p1) + "%.";
    } else {
      $("bs-pin-info").textContent = "Pin a state to leave a faded diamond on the sphere, then move the point to compare.";
    }

    // Intermediate readouts (additive: the Beginner view above never depends on them)
    var disp = Q.applyGlobalPhase(Q.fromBloch(th, ph), (gamma * Math.PI) / 180);
    var v = Q.blochVector(Q.fromBloch(th, ph));
    $("bs-form").textContent = "Written form: |ψ⟩ = " + Q.format(disp) + ".";
    $("bs-vec").textContent =
      "Bloch vector (x, y, z) = (" + sgn(v.x) + ", " + sgn(v.y) + ", " + sgn(v.z) + "). P(0) = (1 + z)/2 = " + pct((1 + v.z) / 2) + "%.";
    if ($("bs-global-range") !== skip) $("bs-global-range").value = gamma;
    $("bs-global-out").textContent = gamma + "°";

    // opposite point (in the gated block)
    var oppTheta = 180 - th;
    var oppPhi = wrap360(ph + 180);
    var ip = Q.innerProduct(Q.fromBloch(oppTheta, oppPhi), Q.fromBloch(th, ph));
    $("bs-opposite").textContent =
      "Your point is at polar angle " + ang(th) + "° and phase " + ang(ph) + "°. The opposite point is at polar angle " + ang(oppTheta) +
      "° and phase " + ang(oppPhi) + "°. The inner product of the two states is " + Q.formatAmplitude(ip) + ".";

    // notes and accessibility
    $("bs-note").textContent = note;
    var text = "Bloch sphere. " + B.formatText(th, ph) + (pole ? " At a pole the phase does not matter." : "");
    if (pin) text += " A pinned state, " + pin.label + ", is shown as a diamond.";
    $("bs-canvas").setAttribute("aria-label", text);
    $("bs-summary").textContent = text + (note ? " " + note : "");
  }

  function setLive(theta, phi, message, skip) {
    live.theta = theta;
    live.phi = phi;
    note = message || "";
    render(skip);
  }

  // Sliders and typed values. A typed value outside its range is shown clamped, with a
  // note, rather than corrected silently.
  function wire(rangeId, numId, key, lo, hi, what) {
    function apply(value, src, typed) {
      var v = clamp(value, lo, hi);
      var msg = typed && v !== value ? what + " runs from " + lo + "° to " + hi + "°, so " + ang(v) + "° is shown." : "";
      setLive(key === "theta" ? v : live.theta, key === "phi" ? v : live.phi, msg, msg ? null : src);
    }
    $(rangeId).addEventListener("input", function () { apply(parseFloat(this.value), this, false); });
    $(numId).addEventListener("input", function () {
      var v = parseFloat(this.value);
      if (isNaN(v)) return;
      apply(v, this, true);
    });
  }
  wire("bs-theta-range", "bs-theta-num", "theta", 0, 180, "The polar angle");
  wire("bs-phi-range", "bs-phi-num", "phi", 0, 360, "The phase angle");

  $("bs-global-range").addEventListener("input", function () {
    gamma = parseFloat(this.value);
    note = gamma === 0 ? "" : "Both amplitudes were multiplied by the same phase factor. The point on the sphere and the bars did not change.";
    render(this);
  });

  function buildPresets() {
    var box = $("bs-presets");
    box.innerHTML = "";
    NAMED.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "qed-button qed-button--secondary";
      b.textContent = p.name;
      b.dataset.name = p.name;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { setLive(p.theta, p.phi, ""); });
      box.appendChild(b);
    });
  }

  $("bs-pin").addEventListener("click", function () {
    pin = { theta: live.theta, phi: live.phi, label: nameAt(live.theta, live.phi) || "pinned" };
    note = "Pinned. Move the point to compare it with the faded diamond.";
    render();
  });
  $("bs-unpin").addEventListener("click", function () {
    pin = null;
    note = "";
    render();
  });
  $("bs-reset").addEventListener("click", function () {
    pin = null;
    gamma = 0;
    var fb = $("bs-transfer-feedback");
    fb.textContent = "";
    fb.className = "qed-quiz__feedback";
    setLive(START.theta, START.phi, "");
  });

  // ---- level-aware behavior (additive) -----------------------------------------
  function applyLevel() {
    $("bs-inter").hidden = !QL.atLeast("intermediate");
  }
  QL.onChange(applyLevel);

  // ---- checks -------------------------------------------------------------------
  Z.mount($("bs-quiz-predict"), {
    title: "Predict first. A state sits on the equator. How likely is outcome 0?",
    items: [
      {
        prompt: "Choose the probability of outcome 0.",
        label: "Probability of outcome 0 for a state on the equator",
        options: [
          { label: "0%", correct: false, why: "0% is the south pole, the state |1⟩, where outcome 0 never happens. The equator is halfway down." },
          { label: "50%", correct: true, why: "On the equator the point is halfway between the poles, so both outcomes are equally likely." },
          { label: "100%", correct: false, why: "That is the north pole, the state |0⟩, where outcome 0 is certain." },
          { label: "It depends on the phase", correct: false, why: "Phase is the angle around the equator. It moves the point sideways and does not change its height, so it does not change the probabilities." }
        ]
      }
    ]
  }, {
    onAnswer: function () {
      var s = B.state(90, 0);
      var box = $("bs-predict-bars");
      box.hidden = false;
      box.innerHTML = "<p><strong>For a point on the equator:</strong></p>" + S.renderBars(probRows(s.p0, s.p1));
    },
    onReset: function () { $("bs-predict-bars").hidden = true; }
  });

  Z.mount($("bs-quiz-same"), {
    title: "Which pairs of points give the same Z-basis probabilities? Try each one.",
    items: [
      {
        prompt: "Pick a pair, and check the feedback.",
        label: "Which pair of points gives the same Z-basis probabilities",
        options: [
          { label: "|+⟩ and |−⟩", correct: true, why: "Both sit on the equator, at the same height, on opposite sides. Both give 50% and 50%." },
          { label: "|+⟩ and |−i⟩", correct: true, why: "Both sit on the equator, so both give 50% and 50%. They are different states at different places around it." },
          { label: "|0⟩ and |1⟩", correct: false, why: "They are at opposite poles, at opposite heights. |0⟩ always gives 0 and |1⟩ always gives 1." },
          { label: "|0⟩ and |+⟩", correct: false, why: "|0⟩ is at the top and |+⟩ is halfway down. Different heights give different probabilities." }
        ]
      }
    ]
  });

  // Transfer task: reads the explorer's state.
  $("bs-transfer-check").addEventListener("click", function () {
    var fb = $("bs-transfer-feedback");
    var s = B.state(live.theta, live.phi);
    var ok = Math.abs(s.p1 - 0.25) < 0.005;
    var text;
    if (ok) {
      text = "Yes. Outcome 1 happens " + pct(s.p1) + "% of the time. A polar angle of 60° does it, with any phase angle, because phase moves the point around the sphere without changing its height.";
    } else {
      text = "Outcome 1 happens " + pct(s.p1) + "% of the time, not 25%. The height sets the probabilities, so try changing the polar angle.";
    }
    fb.className = "qed-quiz__feedback " + (ok ? "is-correct" : "is-incorrect");
    fb.textContent = text;
  });

  // ---- start ----------------------------------------------------------------------
  buildMap();
  buildOppositeTable();
  buildPresets();
  var paintCompare = buildCompare();
  var paintBridge = buildBridge();
  applyLevel();
  render();

  // The canvases read the theme colors, so redraw when the light/dark palette changes.
  if (window.MutationObserver) {
    new MutationObserver(function () {
      render();
      paintCompare();
      paintBridge();
    }).observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
  }
});
</script>
