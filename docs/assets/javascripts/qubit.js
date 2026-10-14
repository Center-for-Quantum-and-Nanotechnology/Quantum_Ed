// Shared single-qubit amplitude model, used by Module 02 (02.02 Qubit
// Representation first; 02.03 Bloch Sphere, 02.04 Quantum Gates, and 02.07
// Measurement will reuse it) and available to any page that shows a
// single-qubit state.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op
// on pages that don't call it. Page scripts that use window.QedQubit must run
// inside a DOMContentLoaded listener.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   model   -> pure functions of a state: probabilities, normalization,
//              relative phase, global phase. No DOM.
//   text    -> format(), validity(): plain strings for display and aria-live
//   wiring  -> left to each page
//
// Scope, on purpose: amplitude-level math for ONE qubit only. It does not draw
// anything (probability bars come from QedShots.renderBars and the Bloch sphere
// from QedBloch), apply gates, or handle two-qubit states. It does convert a
// state to and from Bloch angles and the Bloch vector, because that is state
// math; QedBloch only projects and draws.
//
// A state is { alpha: {re, im}, beta: {re, im} }: the amplitudes of |0> and
// |1>. Functions never mutate their arguments.
window.QedQubit = (function () {
  var EPS = 1e-9;

  function checkNumber(x, what) {
    if (typeof x !== "number" || !isFinite(x)) {
      throw new Error("QedQubit: " + what + " must be a finite number");
    }
  }

  function amp(re, im) {
    im = im === undefined ? 0 : im;
    checkNumber(re, "real part");
    checkNumber(im, "imaginary part");
    return { re: re, im: im };
  }

  // A state from real amplitudes (the Beginner view).
  function real(a, b) {
    return { alpha: amp(a, 0), beta: amp(b, 0) };
  }

  // A state from complex amplitudes.
  function complex(aRe, aIm, bRe, bIm) {
    return { alpha: amp(aRe, aIm), beta: amp(bRe, bIm) };
  }

  // A state from magnitude and phase (radians) of each amplitude.
  function fromPolar(rA, phiA, rB, phiB) {
    checkNumber(rA, "magnitude");
    checkNumber(rB, "magnitude");
    checkNumber(phiA, "phase");
    checkNumber(phiB, "phase");
    if (rA < 0 || rB < 0) throw new Error("QedQubit: a magnitude cannot be negative");
    return complex(rA * Math.cos(phiA), rA * Math.sin(phiA), rB * Math.cos(phiB), rB * Math.sin(phiB));
  }

  function modulus(z) {
    return Math.sqrt(z.re * z.re + z.im * z.im);
  }

  // Phase of one amplitude in radians, in (-pi, pi]. Null for zero.
  function phase(z) {
    return modulus(z) < EPS ? null : Math.atan2(z.im, z.re);
  }

  function square(z) {
    return z.re * z.re + z.im * z.im;
  }

  // Squared magnitudes of the two amplitudes: [|alpha|^2, |beta|^2]. For a valid
  // (normalized) state these are the outcome probabilities. For an invalid state
  // they are returned as they are, so a page can show why it is invalid.
  function probabilities(s) {
    return [square(s.alpha), square(s.beta)];
  }

  // |alpha|^2 + |beta|^2. A valid state has norm2 equal to 1.
  function norm2(s) {
    var p = probabilities(s);
    return p[0] + p[1];
  }

  // True when both amplitudes are real numbers (no imaginary part), which is
  // the Beginner view of a state.
  function isReal(s) {
    return Math.abs(s.alpha.im) < EPS && Math.abs(s.beta.im) < EPS;
  }

  function isNormalized(s, tolerance) {
    return Math.abs(norm2(s) - 1) <= (tolerance === undefined ? EPS : tolerance);
  }

  // Rescale so the squares add to 1. Phases (and so signs) are kept. The zero
  // state cannot be normalized.
  function normalize(s) {
    var n = Math.sqrt(norm2(s));
    if (n < EPS) throw new Error("QedQubit: the zero state cannot be normalized");
    return complex(s.alpha.re / n, s.alpha.im / n, s.beta.re / n, s.beta.im / n);
  }

  // Phase of beta relative to alpha, in (-pi, pi]. Null if either amplitude is zero,
  // because the relative phase is then undefined.
  function relativePhase(s) {
    var re = s.beta.re * s.alpha.re + s.beta.im * s.alpha.im; // beta * conj(alpha)
    var im = s.beta.im * s.alpha.re - s.beta.re * s.alpha.im;
    if (Math.sqrt(re * re + im * im) < EPS) return null;
    return Math.atan2(im, re);
  }

  // Multiply both amplitudes by e^(i * gamma). Changes no probability and not the
  // relative phase.
  function applyGlobalPhase(s, gamma) {
    checkNumber(gamma, "phase");
    var c = Math.cos(gamma);
    var d = Math.sin(gamma);
    function rot(z) {
      return { re: z.re * c - z.im * d, im: z.re * d + z.im * c };
    }
    return { alpha: rot(s.alpha), beta: rot(s.beta) };
  }

  // One term of the written form. The sign is taken from the rounded text, so a
  // tiny negative number never prints as "-0.00".
  function term(z, ket, digits, first) {
    var isReal = Math.abs(z.im) < EPS;
    if (isReal) {
      var text = Math.abs(z.re).toFixed(digits);
      var negative = z.re < 0 && parseFloat(text) !== 0;
      if (first) return (negative ? "−" : "") + text + ket;
      return " " + (negative ? "−" : "+") + " " + text + ket;
    }
    var re = Math.abs(z.re).toFixed(digits);
    var im = Math.abs(z.im).toFixed(digits);
    var body =
      "(" + (z.re < 0 && parseFloat(re) !== 0 ? "−" : "") + re + (z.im < 0 && parseFloat(im) !== 0 ? " − " : " + ") + im + "i)" + ket;
    return first ? body : " + " + body;
  }

  // Readable form, for example "0.60|0⟩ + 0.80|1⟩" or "0.71|0⟩ − 0.71|1⟩".
  function format(s, digits) {
    digits = digits === undefined ? 2 : digits;
    return term(s.alpha, "|0⟩", digits, true) + term(s.beta, "|1⟩", digits, false);
  }

  // One amplitude (or any complex number) as text: a plain signed number when it
  // is real, "(a + bi)" in brackets when it is not. Same style as format().
  function formatAmplitude(z, digits) {
    digits = digits === undefined ? 2 : digits;
    return term(z, "", digits, true);
  }

  // Inner product <phi|psi> of two states: the conjugate of each amplitude of phi
  // times the matching amplitude of psi, added up. One complex number {re, im}.
  // <psi|psi> equals norm2(psi), and <0|psi> is psi's alpha.
  function innerProduct(phi, psi) {
    function conjTimes(u, v) {
      return { re: u.re * v.re + u.im * v.im, im: u.re * v.im - u.im * v.re };
    }
    var a = conjTimes(phi.alpha, psi.alpha);
    var b = conjTimes(phi.beta, psi.beta);
    return { re: a.re + b.re, im: a.im + b.im };
  }

  // ---- Bloch picture ---------------------------------------------------------
  // A normalized state, up to a global phase, is a point on the Bloch sphere:
  //   |psi> = cos(theta/2)|0> + e^(i phi) sin(theta/2)|1>
  // with theta measured from +z (0 to 180 degrees) and phi from +x toward +y.
  // The same convention as QedBloch (bloch.js), which only draws; the state math
  // lives here. Angles are in degrees, to match QedBloch.

  function degrees(rad) {
    var d = (rad * 180) / Math.PI;
    return ((d % 360) + 360) % 360;
  }

  function requireNormalized(s, what) {
    if (!isNormalized(s, 1e-6)) {
      throw new Error("QedQubit: " + what + " needs a normalized state (the probabilities must add to 100%)");
    }
  }

  // The state with the given Bloch angles, using the convention that the |0>
  // amplitude is real and not negative (the global phase is fixed that way).
  function fromBloch(thetaDeg, phiDeg) {
    checkNumber(thetaDeg, "theta");
    checkNumber(phiDeg, "phi");
    if (thetaDeg < 0 || thetaDeg > 180) throw new Error("QedQubit: theta must be between 0 and 180 degrees");
    var half = (thetaDeg * Math.PI) / 360;
    var phi = (phiDeg * Math.PI) / 180;
    return complex(Math.cos(half), 0, Math.sin(half) * Math.cos(phi), Math.sin(half) * Math.sin(phi));
  }

  // The Bloch angles of a normalized state: { thetaDeg, phiDeg, phiDefined }.
  // At the poles (|0> and |1>) phi means nothing, so phiDeg is 0 and phiDefined
  // is false. A global phase does not move the point.
  function toBloch(s) {
    requireNormalized(s, "toBloch");
    var thetaDeg = ((2 * Math.atan2(modulus(s.beta), modulus(s.alpha))) * 180) / Math.PI;
    var rel = relativePhase(s);
    return { thetaDeg: thetaDeg, phiDeg: rel === null ? 0 : degrees(rel), phiDefined: rel !== null };
  }

  // The point on the unit sphere as {x, y, z}: x = 2 Re(alpha* beta),
  // y = 2 Im(alpha* beta), z = |alpha|^2 - |beta|^2.
  function blochVector(s) {
    requireNormalized(s, "blochVector");
    return {
      x: 2 * (s.alpha.re * s.beta.re + s.alpha.im * s.beta.im),
      y: 2 * (s.alpha.re * s.beta.im - s.alpha.im * s.beta.re),
      z: s.alpha.re * s.alpha.re + s.alpha.im * s.alpha.im - (s.beta.re * s.beta.re + s.beta.im * s.beta.im),
    };
  }

  // Validity as data and as plain words.
  function validity(s) {
    var total = norm2(s);
    var valid = Math.abs(total - 1) <= 1e-6;
    var percent = Math.round(total * 1000) / 10;
    return {
      valid: valid,
      total: total,
      percent: percent,
      text: valid
        ? "Valid state: the probabilities add to 100%."
        : "Not a valid state: the probabilities add to " + percent + "%, not 100%.",
    };
  }

  var HALF = Math.SQRT1_2;

  // Named states that the Module 02 pages use. Names are display labels. `real`
  // says whether the state needs only real amplitudes: pages in the Beginner view
  // offer just those, and the Intermediate view offers all of them. |+i> and |-i>
  // sit on the equator at phases 90 and 270 degrees, so they are complex.
  var PRESETS = [
    { id: "zero", name: "|0⟩", state: real(1, 0) },
    { id: "one", name: "|1⟩", state: real(0, 1) },
    { id: "plus", name: "|+⟩", state: real(HALF, HALF) },
    { id: "minus", name: "|−⟩", state: real(HALF, -HALF) },
    { id: "plusI", name: "|+i⟩", state: complex(HALF, 0, 0, HALF) },
    { id: "minusI", name: "|−i⟩", state: complex(HALF, 0, 0, -HALF) },
  ];
  PRESETS.forEach(function (p) {
    p.real = isReal(p.state);
  });

  return {
    real: real,
    complex: complex,
    fromPolar: fromPolar,
    modulus: modulus,
    phase: phase,
    probabilities: probabilities,
    norm2: norm2,
    isNormalized: isNormalized,
    isReal: isReal,
    normalize: normalize,
    relativePhase: relativePhase,
    applyGlobalPhase: applyGlobalPhase,
    format: format,
    formatAmplitude: formatAmplitude,
    innerProduct: innerProduct,
    fromBloch: fromBloch,
    toBloch: toBloch,
    blochVector: blochVector,
    validity: validity,
    PRESETS: PRESETS,
  };
})();
