// Shared module for Module 05's simulation methods: circuit families for n qubits, small
// simulation engines, and the size of what each method keeps. Used by
// docs/05-software-stack/simulation-engines-and-methods.md (05.05) and intended for 05.06 (the
// run of a circuit on a simulator target) and 05.07 (the simulator path in complete workflows).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedSimMethods must run inside a
// DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> FAMILIES, circuit, the two small engines (stateVector, stabilizer), cutRank,
//                linkBound, sizes, compare. Pure functions, no DOM. It calls QedGates at run time
//                for the single-qubit matrices, as QedTrace does, and nothing else.
//   text      -> plain sentences for operations, rules, and growth
//   rendering -> amplitudeTableHTML, rulesHTML, chainSVG return strings
//   wiring    -> left to each page
//
// This is a TEACHING model, not a simulator you would use. The engines are small and bounded on
// purpose: the state-vector engine runs up to MAX_RUN (10) qubits, and the stabilizer engine
// knows only H, S, X, Z, and CNOT (it refuses anything else and names the first operation). There
// is NO tensor-network engine: for that method the module measures how entangled the real state
// is across each cut, and uses the largest value as the link size. Beyond MAX_RUN qubits nothing
// is run; the sizes come from stated formulas and carry the tag "estimated". Anything tagged
// "computed" was produced by running an engine at that size.
//
// Everything here is about SIZE (what a method keeps), never speed. No timings, no benchmarks,
// and no claim about any named simulator.
//
// Basis order and qubit order, as in Module 02: a state is [c0 ... c(2^n - 1)], and the LEFT
// digit of an index is q0. A circuit is { n, ops } where an op is
//   { g: "h" | "x" | "z" | "s" | "t", q }   or   { g: "cx", c, t }.
// Functions never mutate their arguments.
window.QedSimMethods = (function () {
  var MAX_RUN = 10;
  var EPS = 1e-9;
  var SUBSCRIPTS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  var STABILIZER_SET = ["h", "s", "x", "z", "cx"];
  var BYTES_PER_AMPLITUDE = 16; // one double-precision complex number, as on Module 01

  function qname(i) {
    return "q" + String(i).split("").map(function (d) { return SUBSCRIPTS[Number(d)]; }).join("");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function gates() {
    var G = window.QedGates;
    if (!G) throw new Error("QedSimMethods needs QedGates");
    return G;
  }

  // ---- the methods, as plain records -------------------------------------------------------
  var METHODS = [
    {
      id: "state-vector",
      label: "State vector",
      glyph: "▦",
      keeps: "Every amplitude of the state.",
      handles: "Any circuit.",
      driver: "The number of qubits.",
      returns: "The whole state, and from it exact outcome probabilities.",
    },
    {
      id: "stabilizer",
      label: "Stabilizer",
      glyph: "☰",
      keeps: "A short list of rules that the state obeys.",
      handles: "Only circuits built from a restricted set of operations.",
      driver: "The number of qubits, which it grows slowly.",
      returns: "Outcome information for the circuits it handles.",
    },
    {
      id: "tensor-network",
      label: "Tensor network",
      glyph: "◯—◯",
      keeps: "Small pieces joined by links.",
      handles: "Many circuits, as long as its pieces stay manageable.",
      driver: "How entangled the state is.",
      returns: "Results, for as long as its pieces stay manageable.",
    },
  ];

  function methodById(id) {
    var hit = METHODS.filter(function (m) { return m.id === id; })[0];
    if (!hit) throw new Error("QedSimMethods: there is no method called " + id);
    return hit;
  }

  // ---- circuit families ----------------------------------------------------------------------
  var FAMILIES = [
    {
      id: "ghz",
      label: "GHZ chain",
      description: "H on the first qubit, then a CNOT from each qubit to the next. With two qubits this is the Bell circuit.",
      usesDepth: false,
    },
    {
      id: "ghz-t",
      label: "GHZ chain with a T on every qubit",
      description: "The same chain, followed by a T on every qubit. T is not one of the stabilizer method's operations.",
      usesDepth: false,
    },
    {
      id: "layers",
      label: "Entangling layers",
      description: "Each layer is H and T on every qubit, then CNOTs between neighbouring qubits, alternating between the even and odd neighbouring pairs from layer to layer.",
      usesDepth: true,
    },
  ];

  function familyById(id) {
    var hit = FAMILIES.filter(function (f) { return f.id === id; })[0];
    if (!hit) throw new Error("QedSimMethods: there is no circuit family called " + id);
    return hit;
  }

  function checkSize(n) {
    if (typeof n !== "number" || n !== Math.floor(n) || n < 2) throw new Error("QedSimMethods: the number of qubits must be a whole number, at least 2");
  }

  // The operations of a family for n qubits (and a depth, for the family that takes one).
  function circuit(family, n, depth) {
    checkSize(n);
    familyById(family);
    var ops = [];
    var i;
    if (family === "ghz" || family === "ghz-t") {
      ops.push({ g: "h", q: 0 });
      for (i = 0; i + 1 < n; i++) ops.push({ g: "cx", c: i, t: i + 1 });
      if (family === "ghz-t") for (i = 0; i < n; i++) ops.push({ g: "t", q: i });
      return { n: n, family: family, depth: null, ops: ops };
    }
    var d = depth === undefined ? 1 : depth;
    if (typeof d !== "number" || d !== Math.floor(d) || d < 1) throw new Error("QedSimMethods: the depth must be a whole number, at least 1");
    for (var layer = 0; layer < d; layer++) {
      for (i = 0; i < n; i++) { ops.push({ g: "h", q: i }); ops.push({ g: "t", q: i }); }
      for (i = layer % 2; i + 1 < n; i += 2) ops.push({ g: "cx", c: i, t: i + 1 });
    }
    return { n: n, family: family, depth: d, ops: ops };
  }

  var GATE_NAMES = { h: "H", x: "X", z: "Z", s: "S", t: "T" };

  function opText(op) {
    if (op.g === "cx") return "CNOT " + qname(op.c) + "→" + qname(op.t);
    return GATE_NAMES[op.g] + " on " + qname(op.q);
  }

  // The first operation outside the stabilizer method's set, or null.
  function firstOutside(ops) {
    for (var i = 0; i < ops.length; i++) if (STABILIZER_SET.indexOf(ops[i].g) < 0) return { index: i, op: ops[i] };
    return null;
  }

  function stabilizerSupported(ops) {
    return firstOutside(ops) === null;
  }

  function describeCircuit(c) {
    var counts = {};
    c.ops.forEach(function (op) { counts[op.g] = (counts[op.g] || 0) + 1; });
    var parts = Object.keys(counts).map(function (g) { return counts[g] + " × " + (g === "cx" ? "CNOT" : GATE_NAMES[g]); });
    var out = firstOutside(c.ops);
    return familyById(c.family).label + " on " + c.n + " qubits" + (c.depth ? ", depth " + c.depth : "") + ": " + c.ops.length + " operations (" + parts.join(", ") + "). " +
      (out ? "Not every operation is in the stabilizer method's set: the first outside it is " + opText(out.op) + "." : "Every operation is in the stabilizer method's set.");
  }

  // ---- the state-vector engine ---------------------------------------------------------------------
  function zero() { return { re: 0, im: 0 }; }

  function checkRun(n) {
    if (n > MAX_RUN) throw new Error("QedSimMethods: the state-vector engine runs up to " + MAX_RUN + " qubits");
  }

  // The amplitudes after the circuit, starting from the basis state `start` (an index; default 0,
  // which is |00...0>). Returns { n, amps } with amps[i] = { re, im }.
  function stateVector(c, start) {
    checkRun(c.n);
    var G = gates();
    var n = c.n;
    var size = 1 << n;
    var s = start === undefined ? 0 : start;
    if (s < 0 || s >= size || s !== Math.floor(s)) throw new Error("QedSimMethods: the starting basis state does not exist");
    var amps = [];
    for (var i = 0; i < size; i++) amps.push(i === s ? { re: 1, im: 0 } : zero());
    c.ops.forEach(function (op) {
      if (op.g === "cx") {
        var cm = 1 << (n - 1 - op.c);
        var tm = 1 << (n - 1 - op.t);
        for (var k = 0; k < size; k++) {
          if ((k & cm) && !(k & tm)) { var tmp = amps[k]; amps[k] = amps[k | tm]; amps[k | tm] = tmp; }
        }
        return;
      }
      var m = G.gate(op.g).matrix;
      var bit = 1 << (n - 1 - op.q);
      for (var j = 0; j < size; j++) {
        if (j & bit) continue;
        var a = amps[j];
        var b = amps[j | bit];
        amps[j] = {
          re: m[0][0].re * a.re - m[0][0].im * a.im + m[0][1].re * b.re - m[0][1].im * b.im,
          im: m[0][0].re * a.im + m[0][0].im * a.re + m[0][1].re * b.im + m[0][1].im * b.re,
        };
        amps[j | bit] = {
          re: m[1][0].re * a.re - m[1][0].im * a.im + m[1][1].re * b.re - m[1][1].im * b.im,
          im: m[1][0].re * a.im + m[1][0].im * a.re + m[1][1].re * b.im + m[1][1].im * b.re,
        };
      }
    });
    return { n: n, amps: amps };
  }

  // ---- entanglement across a cut -----------------------------------------------------------------------
  // The number of independent pieces the state splits into across the cut between q(c-1) and qc:
  // the rank of the matrix whose rows are the left c qubits and whose columns are the rest.
  function cutRank(state, c) {
    var n = state.n;
    if (c < 1 || c >= n) throw new Error("QedSimMethods: a cut lies between two qubits");
    var rows = 1 << c;
    var cols = 1 << (n - c);
    var M = [];
    for (var a = 0; a < rows; a++) {
      var row = [];
      for (var b = 0; b < cols; b++) row.push({ re: state.amps[(a << (n - c)) | b].re, im: state.amps[(a << (n - c)) | b].im });
      M.push(row);
    }
    var rank = 0;
    for (var col = 0; col < cols && rank < rows; col++) {
      var best = rank;
      var bestMag = 0;
      for (var r = rank; r < rows; r++) {
        var mag = M[r][col].re * M[r][col].re + M[r][col].im * M[r][col].im;
        if (mag > bestMag) { bestMag = mag; best = r; }
      }
      if (bestMag < EPS * EPS) continue;
      var t = M[rank]; M[rank] = M[best]; M[best] = t;
      var p = M[rank][col];
      var pm = p.re * p.re + p.im * p.im;
      for (var r2 = rank + 1; r2 < rows; r2++) {
        var q = M[r2][col];
        // factor = q / p
        var fre = (q.re * p.re + q.im * p.im) / pm;
        var fim = (q.im * p.re - q.re * p.im) / pm;
        for (var k = col; k < cols; k++) {
          var u = M[rank][k];
          M[r2][k] = { re: M[r2][k].re - (fre * u.re - fim * u.im), im: M[r2][k].im - (fre * u.im + fim * u.re) };
        }
      }
      rank++;
    }
    return rank;
  }

  // The largest cutRank over every cut along the line, and the rank at each cut.
  function maxCutRank(state) {
    var ranks = [];
    for (var c = 1; c < state.n; c++) ranks.push(cutRank(state, c));
    return { max: ranks.reduce(function (m, r) { return Math.max(m, r); }, 1), ranks: ranks };
  }

  // The largest link size the structure of a family allows, for any number of qubits, as a bound.
  // GHZ chains split into 2 pieces across every cut. For entangling layers each neighbouring CNOT
  // can at most double the number of pieces across the cut it crosses (single-qubit operations never
  // change it), and a cut with c qubits on one side can hold at most 2^min(c, n - c) of them.
  function linkBound(family, n, depth) {
    checkSize(n);
    familyById(family);
    if (family !== "layers") return { chi: 2, exact: true, perCut: null };
    var per = [];
    for (var c = 1; c < n; c++) {
      var crossings = 0;
      for (var l = 0; l < depth; l++) if (l % 2 === (c - 1) % 2) crossings++;
      per.push(Math.min(Math.pow(2, crossings), Math.pow(2, Math.min(c, n - c))));
    }
    return { chi: per.reduce(function (m, v) { return Math.max(m, v); }, 1), exact: false, perCut: per };
  }

  // ---- the stabilizer engine ------------------------------------------------------------------------------
  // A table of 2n rows (n destabilizers, then n stabilizers), each with n x bits, n z bits, and a sign
  // bit, so (2n)(2n + 1) bits in all. Starting from |00...0>, row n + i is Z on qubit i.
  function newTableau(n) {
    var rows = [];
    for (var r = 0; r < 2 * n; r++) {
      var x = [];
      var z = [];
      for (var q = 0; q < n; q++) { x.push(r === q ? 1 : 0); z.push(r === n + q ? 1 : 0); }
      rows.push({ x: x, z: z, r: 0 });
    }
    return rows;
  }

  function applyToTableau(rows, op) {
    rows.forEach(function (row) {
      if (op.g === "cx") {
        row.r ^= row.x[op.c] & row.z[op.t] & (row.x[op.t] ^ row.z[op.c] ^ 1);
        row.x[op.t] ^= row.x[op.c];
        row.z[op.c] ^= row.z[op.t];
      } else if (op.g === "h") {
        row.r ^= row.x[op.q] & row.z[op.q];
        var t = row.x[op.q]; row.x[op.q] = row.z[op.q]; row.z[op.q] = t;
      } else if (op.g === "s") {
        row.r ^= row.x[op.q] & row.z[op.q];
        row.z[op.q] ^= row.x[op.q];
      } else if (op.g === "x") {
        row.r ^= row.z[op.q];
      } else if (op.g === "z") {
        row.r ^= row.x[op.q];
      }
    });
  }

  function pauliText(row, n) {
    var s = row.r ? "−" : "+";
    for (var q = 0; q < n; q++) s += row.x[q] ? (row.z[q] ? "Y" : "X") : (row.z[q] ? "Z" : "I");
    return s;
  }

  // Run a circuit with the stabilizer engine. Handles any number of qubits (the table is small).
  // Returns { supported: true, n, rows, rules } where rules are the n stabilizer rows as text such as
  // "+XX" and "+ZZ", or { supported: false, reason, first } naming the first operation it cannot take.
  function stabilizer(c) {
    var out = firstOutside(c.ops);
    if (out) {
      return {
        supported: false,
        first: out.op,
        index: out.index,
        reason: opText(out.op) + " is not one of the stabilizer method's operations (H, S, X, Z, and CNOT).",
      };
    }
    var rows = newTableau(c.n);
    c.ops.forEach(function (op) { applyToTableau(rows, op); });
    return {
      supported: true,
      n: c.n,
      rows: rows,
      bits: rows.length * (2 * c.n + 1),
      rules: rows.slice(c.n).map(function (row) { return pauliText(row, c.n); }),
    };
  }

  // Whether a rule such as "+XX" or "−ZIZ" leaves the state unchanged (a check that the two engines agree).
  function stabilizes(state, rule) {
    var n = state.n;
    if (rule.length !== n + 1) throw new Error("QedSimMethods: the rule must have a sign and one letter per qubit");
    var sign = rule.charAt(0) === "−" || rule.charAt(0) === "-" ? -1 : 1;
    var out = [];
    for (var i = 0; i < state.amps.length; i++) out.push(zero());
    for (var b = 0; b < state.amps.length; b++) {
      var idx = b;
      var re = sign;
      var im = 0;
      for (var q = 0; q < n; q++) {
        var letter = rule.charAt(q + 1);
        var bit = (b >> (n - 1 - q)) & 1;
        var mask = 1 << (n - 1 - q);
        if (letter === "X") { idx ^= mask; }
        else if (letter === "Z") { if (bit) { re = -re; im = -im; } }
        else if (letter === "Y") {
          // Y|0> = i|1>, Y|1> = -i|0>
          var nre = bit ? im : -im;
          var nim = bit ? -re : re;
          re = nre; im = nim;
          idx ^= mask;
        }
      }
      var a = state.amps[b];
      out[idx] = { re: out[idx].re + re * a.re - im * a.im, im: out[idx].im + re * a.im + im * a.re };
    }
    for (var k = 0; k < out.length; k++) {
      if (Math.abs(out[k].re - state.amps[k].re) > 1e-7 || Math.abs(out[k].im - state.amps[k].im) > 1e-7) return false;
    }
    return true;
  }

  // ---- sizes -----------------------------------------------------------------------------------------------------
  // What one method keeps for a circuit family at a size: { method, supported, reason, size, growth, ... }.
  // size = { count, unit, tag } with tag "computed" (an engine was run, so n <= MAX_RUN) or "estimated"
  // (from the stated formula). count is null when the method cannot handle the circuit.
  function sizes(methodId, family, n, depth) {
    checkSize(n);
    var m = methodById(methodId);
    var c = circuit(family, n, depth);
    var ran = n <= MAX_RUN;
    var tag = ran ? "computed" : "estimated";
    var res = { method: m.id, label: m.label, supported: true, reason: null, size: null, growth: "", link: null };
    if (m.id === "state-vector") {
      var count = ran ? stateVector(c).amps.length : Math.pow(2, n);
      res.size = { count: count, unit: "amplitudes", tag: tag, bytes: count * BYTES_PER_AMPLITUDE };
      res.growth = "Doubles with each qubit: " + n + " qubits keep 2" + sup(n) + " amplitudes.";
      return res;
    }
    if (m.id === "stabilizer") {
      var st = ran ? stabilizer(c) : null;
      var ok = ran ? st.supported : stabilizerSupported(c.ops);
      if (!ok) {
        var first = ran ? st.first : firstOutside(c.ops).op;
        res.supported = false;
        res.reason = opText(first) + " is not one of the stabilizer method's operations (H, S, X, Z, and CNOT).";
        res.size = { count: null, unit: "bits", tag: tag };
        res.growth = "Cannot handle this circuit.";
        return res;
      }
      var bits = ran ? st.bits : 2 * n * (2 * n + 1);
      res.size = { count: bits, unit: "bits", tag: tag };
      res.growth = "Grows slowly: about (2n)(2n + 1) bits, which is " + bits + " bits for " + n + " qubits.";
      return res;
    }
    // tensor network
    var chi;
    if (ran) {
      chi = maxCutRank(stateVector(c)).max;
    } else {
      var b = linkBound(family, n, depth === undefined ? 1 : depth);
      chi = b.chi;
    }
    var numbers = n * 2 * chi * chi;
    res.link = { chi: chi, tag: tag, atMost: !ran && family === "layers" };
    res.size = { count: numbers, unit: "numbers", tag: tag };
    var cap = Math.pow(2, Math.floor(n / 2));
    res.growth = "Link size " + (res.link.atMost ? "at most " : "") + chi + (chi >= cap && family === "layers" ? ", as large as this many qubits allow" : chi <= 2 ? ", so it stays small" : ", so the pieces are growing") + ": about n × 2 × χ² = " + numbers + " numbers.";
    return res;
  }

  function sup(n) {
    var digits = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
    return String(n).split("").map(function (d) { return digits[d]; }).join("");
  }

  // The three methods for one circuit, with the circuit's own facts.
  function compare(family, n, depth) {
    var c = circuit(family, n, depth);
    var out = firstOutside(c.ops);
    return {
      circuit: { family: c.family, n: n, depth: c.depth, operations: c.ops.length, description: describeCircuit(c), allInStabilizerSet: out === null, firstOutside: out ? out.op : null },
      ran: n <= MAX_RUN,
      methods: METHODS.map(function (m) {
        var s = sizes(m.id, family, n, depth);
        return {
          id: m.id, label: m.label, glyph: m.glyph, keeps: m.keeps, handles: m.handles, driver: m.driver, returns: m.returns,
          supported: s.supported, reason: s.reason, size: s.size, growth: s.growth, link: s.link,
        };
      }),
    };
  }

  // ---- rendering ---------------------------------------------------------------------------------------------------
  function num(x) {
    var r = Math.round(x * 1000) / 1000;
    return String(r === 0 ? 0 : r);
  }

  function complexText(a) {
    if (Math.abs(a.im) < 1e-9) return num(a.re);
    if (Math.abs(a.re) < 1e-9) return num(a.im) + "i";
    return num(a.re) + (a.im < 0 ? " − " : " + ") + num(Math.abs(a.im)) + "i";
  }

  function basisLabel(i, n) {
    var s = i.toString(2);
    while (s.length < n) s = "0" + s;
    return s;
  }

  // The amplitudes as a table: the outcome (q0 is the left digit), the amplitude, and the chance of that outcome.
  function amplitudeTableHTML(state) {
    var rows = state.amps.map(function (a, i) {
      var p = a.re * a.re + a.im * a.im;
      return '<tr><th scope="row">' + basisLabel(i, state.n) + '</th><td>' + esc(complexText(a)) + "</td><td>" + (Math.round(p * 1000) / 10) + "%</td></tr>";
    }).join("");
    return '<table class="qed-sm-table"><thead><tr><th scope="col">Outcome</th><th scope="col">Amplitude</th><th scope="col">Chance</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // The rules as a list of short code strings.
  function rulesHTML(rules) {
    return '<ul class="qed-sm-rules">' + rules.map(function (r) { return "<li><code>" + esc(r) + "</code></li>"; }).join("") + "</ul>";
  }

  // The state as a chain of small pieces, one per qubit, joined by links of size chi. For many qubits the
  // picture shows the first two pieces and the last two with a gap between. opts: { idPrefix }.
  function chainSVG(n, chi, opts) {
    opts = opts || {};
    checkSize(n);
    var shown = n <= 5 ? range(n) : [0, 1, null, n - 2, n - 1];
    var W = 44;
    var GAP = 50;
    var width = 20 + shown.length * W + (shown.length - 1) * GAP;
    var height = 86;
    var out = [];
    out.push('<svg class="qed-sm-svg" id="' + esc((opts.idPrefix || "qed-sm") + "-svg") + '" viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height + '" role="img" aria-label="' +
      esc("A chain of " + n + " small pieces, one per qubit, joined by links of size " + chi) + '">');
    shown.forEach(function (idx, k) {
      var x = 10 + k * (W + GAP);
      if (idx === null) {
        out.push('<text class="qed-sm-dots" x="' + (x + W / 2) + '" y="50" text-anchor="middle">…</text>');
        return;
      }
      out.push('<rect class="qed-sm-piece" x="' + x + '" y="30" width="' + W + '" height="34" rx="6" />');
      out.push('<text class="qed-sm-name" x="' + (x + W / 2) + '" y="52" text-anchor="middle">' + esc(qname(idx)) + "</text>");
      if (k < shown.length - 1) {
        out.push('<line class="qed-sm-link" x1="' + (x + W) + '" y1="47" x2="' + (x + W + GAP) + '" y2="47" />');
        out.push('<text class="qed-sm-link-label" x="' + (x + W + GAP / 2) + '" y="38" text-anchor="middle">χ=' + chi + "</text>");
      }
    });
    out.push("</svg>");
    return out.join("");
  }

  function range(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    return a;
  }

  return {
    MAX_RUN: MAX_RUN,
    BYTES_PER_AMPLITUDE: BYTES_PER_AMPLITUDE,
    STABILIZER_SET: STABILIZER_SET,
    METHODS: METHODS,
    FAMILIES: FAMILIES,
    methodById: methodById,
    familyById: familyById,
    circuit: circuit,
    opText: opText,
    describeCircuit: describeCircuit,
    stabilizerSupported: stabilizerSupported,
    stateVector: stateVector,
    cutRank: cutRank,
    maxCutRank: maxCutRank,
    linkBound: linkBound,
    stabilizer: stabilizer,
    stabilizes: stabilizes,
    sizes: sizes,
    compare: compare,
    amplitudeTableHTML: amplitudeTableHTML,
    rulesHTML: rulesHTML,
    chainSVG: chainSVG,
  };
})();
