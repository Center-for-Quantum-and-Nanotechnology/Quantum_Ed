// QedBloch — shared single-qubit state math + Bloch-sphere drawing.
// A library (not a demo): used by the bloch-explorer and qubit-measurement
// components, and intended for Module 02's Bloch Sphere section.
//
// Loaded site-wide via extra_javascript; it is a no-op on pages that don't
// use it. Component code runs inside QedComponents.mount, which fires on
// DOMContentLoaded, so load order is never a problem for components. Any
// *inline* page script that touches window.QedBloch must still wrap itself
// in a DOMContentLoaded listener (see llm/FLAGS.md).
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   state math     -> pure functions of (thetaDeg, phiDeg)
//   drawing        -> render(canvas, ...) is a pure function of its inputs
//   DOM wiring     -> left to each component, so this file never touches
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
    return (
      "|ψ⟩ = " + s.a0.toFixed(2) + "|0⟩ + <i>e</i><sup><i>i</i>·" + phiDeg + "°</sup>·" + s.a1.toFixed(2) + "|1⟩"
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
  //
  // Called with three arguments it draws exactly the picture it always has, so
  // Module 01 is unchanged. An optional fourth argument adds layers, all off by
  // default:
  //   color       vector color (default: the logical-information blue)
  //   neutral     outline, label, and axis color (default: the theme's muted text)
  //   axes        thin dashed x, y, z axes with "x" and "y" labels
  //   markers     [{thetaDeg, phiDeg, label}] small labelled dots (named states)
  //   pinned      {thetaDeg, phiDeg, label} a faded diamond and dashed vector, for
  //               comparing a second state with the live one
  //   projection  a dashed line from the state to the vertical axis, with a marker
  //               there: the height that sets the outcome probabilities
  //   depth       draw the live vector faded and dashed on the far side of the
  //               sphere. project() returns depth, and a LARGER depth means FARTHER
  //               from the viewer (the viewer looks from the -y side, slightly above)
  function render(canvas, thetaDeg, phiDeg, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var r = Math.min(canvas.width, canvas.height) * 0.365;
    var logical = opts.color || cssColor("--qed-color-logical", "#5c6bc0");
    var neutral = opts.neutral || cssColor("--md-default-fg-color--light", "#888");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = neutral;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * Math.sin(TILT_RAD), 0, 0, Math.PI * 2);
    ctx.stroke();

    if (opts.axes) drawAxes(ctx, cx, cy, r, neutral);

    ctx.fillStyle = neutral;
    ctx.font = "12px sans-serif";
    ctx.fillText("|0⟩", cx - 8, cy - r - 8);
    ctx.fillText("|1⟩", cx - 8, cy + r + 18);

    if (opts.markers) drawMarkers(ctx, cx, cy, r, neutral, opts.markers, opts.depth);
    if (opts.pinned) drawPinned(ctx, cx, cy, r, neutral, opts.pinned);

    var tip = project(cx, cy, r, toRad(thetaDeg), toRad(phiDeg));
    if (opts.projection) drawProjection(ctx, cx, cy, r, neutral, logical, tip, toRad(thetaDeg));

    var far = opts.depth && tip.depth > 0;
    ctx.strokeStyle = logical;
    ctx.fillStyle = logical;
    ctx.lineWidth = 2;
    if (far) {
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([5, 3]);
    }
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    if (far) ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (far) ctx.globalAlpha = 1;
  }

  function drawAxes(ctx, cx, cy, r, neutral) {
    var xPos = project(cx, cy, r, Math.PI / 2, 0);
    var xNeg = project(cx, cy, r, Math.PI / 2, Math.PI);
    var yPos = project(cx, cy, r, Math.PI / 2, Math.PI / 2);
    var yNeg = project(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
    var zPos = project(cx, cy, r, 0, 0);
    var zNeg = project(cx, cy, r, Math.PI, 0);
    ctx.save();
    ctx.strokeStyle = neutral;
    ctx.fillStyle = neutral;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    [[xNeg, xPos], [yNeg, yPos], [zNeg, zPos]].forEach(function (seg) {
      ctx.beginPath();
      ctx.moveTo(seg[0].x, seg[0].y);
      ctx.lineTo(seg[1].x, seg[1].y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.font = "11px sans-serif";
    // Below the end points, so they do not collide with marker labels, which sit above.
    ctx.fillText("x", xPos.x + 6, xPos.y + 14);
    ctx.fillText("y", yPos.x + 6, yPos.y + 14);
    ctx.restore();
  }

  function drawMarkers(ctx, cx, cy, r, neutral, markers, depth) {
    ctx.save();
    ctx.fillStyle = neutral;
    ctx.font = "12px sans-serif";
    markers.forEach(function (m) {
      var p = project(cx, cy, r, toRad(m.thetaDeg), toRad(m.phiDeg));
      ctx.globalAlpha = depth && p.depth > 0 ? 0.5 : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = p.x < cx ? "right" : "left";
      ctx.fillText(m.label, p.x + (p.x < cx ? -7 : 7), p.y - 6);
    });
    ctx.restore();
  }

  // A faded diamond and dashed vector, so a second state reads differently from
  // the live one by shape as well as by fade.
  function drawPinned(ctx, cx, cy, r, neutral, pinned) {
    var p = project(cx, cy, r, toRad(pinned.thetaDeg), toRad(pinned.phiDeg));
    ctx.save();
    ctx.strokeStyle = neutral;
    ctx.fillStyle = neutral;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 6);
    ctx.lineTo(p.x + 6, p.y);
    ctx.lineTo(p.x, p.y + 6);
    ctx.lineTo(p.x - 6, p.y);
    ctx.closePath();
    ctx.stroke();
    ctx.font = "12px sans-serif";
    // The label sits below the diamond, clear of the axis label and of any marker
    // label above it. Near an edge it turns inward so it is never cut off.
    var text = pinned.label || "pinned";
    var w = ctx.measureText(text).width;
    var onLeft = p.x < cx;
    var x = p.x + (onLeft ? -9 : 9);
    var align = onLeft ? "right" : "left";
    if (!onLeft && x + w > ctx.canvas.width - 2) {
      align = "right";
      x = p.x + 6;
    } else if (onLeft && x - w < 2) {
      align = "left";
      x = p.x - 6;
    }
    ctx.textAlign = align;
    ctx.fillText(text, x, p.y + 24);
    ctx.restore();
  }

  // A dashed line from the state straight to the vertical axis, ending in a
  // small square: the height that sets the outcome probabilities.
  function drawProjection(ctx, cx, cy, r, neutral, color, tip, thetaRad) {
    var axisY = cy - Math.cos(thetaRad) * Math.cos(TILT_RAD) * r;
    ctx.save();
    ctx.strokeStyle = neutral;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(cx, axisY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillRect(cx - 3, axisY - 3, 6, 6);
    ctx.restore();
  }

  return {
    state: state,
    formatHTML: formatHTML,
    formatText: formatText,
    project: project,
    render: render,
  };
})();
