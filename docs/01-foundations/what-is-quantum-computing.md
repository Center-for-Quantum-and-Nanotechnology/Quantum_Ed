# What Is Quantum Computing?

## Qubits

A classical bit is always either `0` or `1`. A **qubit** is a two-level quantum system whose state is a combination — a *superposition* — of both:

\[
|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\varphi}\sin\left(\frac{\theta}{2}\right)|1\rangle
\]

Any single-qubit state can be pictured as a point on the surface of a sphere — the **Bloch sphere** — where \(\theta\) sets how much of the state points toward \(|0\rangle\) versus \(|1\rangle\), and \(\varphi\) sets a phase that becomes important once qubits interact with each other.

Drag the sliders below to move the state around the sphere and watch how the measurement probabilities change.

<div class="qed-demo" id="bloch-demo">
  <div class="qed-demo__layout">
    <canvas id="bloch-canvas" width="260" height="260"></canvas>
    <div class="qed-demo__controls">
      <label for="theta-slider">θ — polar angle: <span id="theta-value">90°</span></label>
      <input type="range" id="theta-slider" min="0" max="180" value="90" step="1">

      <label for="phi-slider">φ — phase angle: <span id="phi-value">0°</span></label>
      <input type="range" id="phi-slider" min="0" max="360" value="0" step="1">

      <div class="qed-demo__state">
        <div id="state-formula">|ψ⟩ = 0.71|0⟩ + e^{i0°}·0.71|1⟩</div>
        <div>P(measure 0) = <span id="prob0">50.0%</span> &nbsp;&nbsp; P(measure 1) = <span id="prob1">50.0%</span></div>
      </div>
    </div>
  </div>
</div>

<script>
(function () {
  var canvas = document.getElementById("bloch-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var thetaSlider = document.getElementById("theta-slider");
  var phiSlider = document.getElementById("phi-slider");
  var thetaValue = document.getElementById("theta-value");
  var phiValue = document.getElementById("phi-value");
  var stateFormula = document.getElementById("state-formula");
  var prob0El = document.getElementById("prob0");
  var prob1El = document.getElementById("prob1");

  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var r = 95;
  var tiltRad = (20 * Math.PI) / 180;

  function project(thetaRad, phiRad) {
    var x = Math.sin(thetaRad) * Math.cos(phiRad);
    var y = Math.sin(thetaRad) * Math.sin(phiRad);
    var z = Math.cos(thetaRad);
    var py = y * Math.cos(tiltRad) - z * Math.sin(tiltRad);
    var pz = y * Math.sin(tiltRad) + z * Math.cos(tiltRad);
    return { x: cx + x * r, y: cy - pz * r, depth: py };
  }

  function draw(thetaDeg, phiDeg) {
    var thetaRad = (thetaDeg * Math.PI) / 180;
    var phiRad = (phiDeg * Math.PI) / 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#8888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * Math.sin(tiltRad), 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#888";
    ctx.font = "12px sans-serif";
    ctx.fillText("|0⟩", cx - 8, cy - r - 8);
    ctx.fillText("|1⟩", cx - 8, cy + r + 18);

    var tip = project(thetaRad, phiRad);
    ctx.strokeStyle = "#5c6bc0";
    ctx.fillStyle = "#5c6bc0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function update() {
    var thetaDeg = parseInt(thetaSlider.value, 10);
    var phiDeg = parseInt(phiSlider.value, 10);
    thetaValue.textContent = thetaDeg + "°";
    phiValue.textContent = phiDeg + "°";

    var thetaRad = (thetaDeg * Math.PI) / 180;
    var cosHalf = Math.cos(thetaRad / 2);
    var sinHalf = Math.sin(thetaRad / 2);
    var p0 = cosHalf * cosHalf;
    var p1 = sinHalf * sinHalf;

    stateFormula.textContent =
      "|ψ⟩ = " + cosHalf.toFixed(2) + "|0⟩ + e^{i" + phiDeg + "°}·" + sinHalf.toFixed(2) + "|1⟩";
    prob0El.textContent = (p0 * 100).toFixed(1) + "%";
    prob1El.textContent = (p1 * 100).toFixed(1) + "%";

    draw(thetaDeg, phiDeg);
  }

  thetaSlider.addEventListener("input", update);
  phiSlider.addEventListener("input", update);
  update();
})();
</script>

## Superposition

!!! note "Status"
    Placeholder — content in progress.

*What superposition does and does not mean (and the common misconceptions worth heading off early).*

## Measurement

!!! note "Status"
    Placeholder — content in progress.

*Measurement collapses a superposition to a classical outcome, with probability given by the Born rule — connect this back to the demo above.*

## Entanglement

!!! note "Status"
    Placeholder — content in progress.

*Correlations between qubits that can't be explained by any classical shared randomness.*
