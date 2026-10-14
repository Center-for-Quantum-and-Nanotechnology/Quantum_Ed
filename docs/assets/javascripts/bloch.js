// Shared single-qubit state + Bloch-sphere drawing module, used by
// docs/01-foundations/what-is-quantum-computing.md (the Qubits and
// Measurement demos) and intended for reuse by Module 02's Bloch
// Sphere section.
//
// Loaded site-wide via extra_javascript (like surface-code.js) since
// MkDocs pages are separate documents, not a single-page app. It is a
// no-op on pages that don't call it. Any page script that uses
// window.QedBloch must run inside a DOMContentLoaded listener, because
// Material injects extra_javascript files after inline page content.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   state math     -> pure functions of (thetaDeg, phiDeg)
//   drawing        -> render(canvas, ...) is a pure function of its inputs
//   DOM wiring     -> left to each page, so this file never touches
//                     page-specific elements.
window.QedBloch = (function () {
  var TILT_RAD = (20 * Math.PI) / 180;

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  // |psi> = cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>
  // Returns the two amplitudes' magnitudes and the measurement
  // probabilities. (The phase phi never affects p0 / p1 — that is
  // exactly what the Measurement demo lets a learner discover.)
  function state(thetaDeg, phiDeg) {
    var half = toRad(thetaDeg) / 2;
    var a0 = Math.cos(half);
    var a1 = Math.sin(half);
    return { a0: a0, a1: a1, phiDeg: phiDeg, p0: a0 * a0, p1: a1 * a1 };
  }

  // Readable state label as HTML (not plain text), so e^{i·φ} can use a
  // real superscript without needing MathJax to re-typeset on every
  // slider tick. Only numbers are interpolated, so innerHTML is safe.
  function formatHTML(thetaDeg, phiDeg) {
    var s = state(thetaDeg, phiDeg);
    var amp0 = s.a0.toFixed(2);
    var amp1 = s.a1.toFixed(2);
    return (
      "|ψ⟩ = " + amp0 + "|0⟩ + <i>e</i><sup><i>i</i>·" + phiDeg + "°</sup>·" + amp1 + "|1⟩"
    );
  }

  // Plain-text version for aria-labels.
  function formatText(thetaDeg, phiDeg) {
    var s = state(thetaDeg, phiDeg);
    return (
      "State: " + s.a0.toFixed(2) + " times zero plus " + s.a1.toFixed(2) +
      " times one, phase " + phiDeg + " degrees. Probability of measuring 0: " +
      (s.p0 * 100).toFixed(1) + " percent. Probability of measuring 1: " +
      (s.p1 * 100).toFixed(1) + " percent."
    );
  }

  // Projects a point on the unit sphere to canvas coordinates using the
  // same 20° tilt as the rest of the site.
  function project(cx, cy, r, thetaRad, phiRad) {
    var x = Math.sin(thetaRad) * Math.cos(phiRad);
    var y = Math.sin(thetaRad) * Math.sin(phiRad);
    var z = Math.cos(thetaRad);
    var py = y * Math.cos(TILT_RAD) - z * Math.sin(TILT_RAD);
    var pz = y * Math.sin(TILT_RAD) + z * Math.cos(TILT_RAD);
    return { x: cx + x * r, y: cy - pz * r, depth: py };
  }

  function cssColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  // Draws the sphere outline, equator, |0>/|1> labels and a state vector.
  function render(canvas, thetaDeg, phiDeg) {
    var ctx = canvas.getContext("2d");
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var r = Math.min(canvas.width, canvas.height) * 0.365;
    var logical = cssColor("--qed-color-logical", "#5c6bc0");
    var neutral = cssColor("--md-default-fg-color--light", "#888");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = neutral;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * Math.sin(TILT_RAD), 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = neutral;
    ctx.font = "12px sans-serif";
    ctx.fillText("|0⟩", cx - 8, cy - r - 8);
    ctx.fillText("|1⟩", cx - 8, cy + r + 18);

    var tip = project(cx, cy, r, toRad(thetaDeg), toRad(phiDeg));
    ctx.strokeStyle = logical;
    ctx.fillStyle = logical;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    state: state,
    formatHTML: formatHTML,
    formatText: formatText,
    project: project,
    render: render,
  };
})();
