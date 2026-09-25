# Surface Codes

[Stabilizer Codes](stabilizer-codes.md) and [Decoding](decoding.md) gave you the full machinery for a 3-qubit code: physical qubits, stabilizer checks, syndromes, and a decoder that infers a correction. Nothing about that machinery was specific to *three* qubits.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Physical qubits</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Stabilizer checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Syndrome</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Decoder</div></div>
</div>

What happens when we arrange these same checks across many physical qubits, laid out on a two-dimensional grid? That's a **surface code** — a structured arrangement of physical qubits and local stabilizer checks across a 2D lattice.

!!! note
    Surface codes are **not** a fundamentally new error-correction mechanism. They're the same stabilizer-based machinery you already understand, scaled across a larger, structured system.

## Meet the Surface-Code Patch

Here's a small patch (distance 3 — more on what that means shortly):

<div class="qed-demo" id="sf-patch-static"></div>
<div class="qed-lattice-legend">
  <span><span class="qed-lattice-legend__swatch" style="background:var(--qed-color-physical);"></span>Data qubit — holds a piece of the encoded information</span>
  <span><span class="qed-lattice-legend__swatch" style="background:color-mix(in srgb, var(--qed-color-syndrome) 30%, var(--md-code-bg-color)); border:1.5px solid var(--qed-color-syndrome);"></span>Check qubit (× = X-type, + = Z-type)</span>
</div>

<script>
window.QedSurfaceCode = (function () {
  function buildLattice(d) {
    var dataQubits = [];
    for (var r = 0; r < d; r++) {
      for (var c = 0; c < d; c++) {
        dataQubits.push({ id: "d" + r + "_" + c, row: r, col: c });
      }
    }
    var checks = [];
    for (var r = 0; r < d - 1; r++) {
      for (var c = 0; c < d - 1; c++) {
        var type = (r + c) % 2 === 0 ? "X" : "Z";
        checks.push({
          id: "chk" + r + "_" + c,
          row: r,
          col: c,
          type: type,
          neighbors: ["d" + r + "_" + c, "d" + r + "_" + (c + 1), "d" + (r + 1) + "_" + c, "d" + (r + 1) + "_" + (c + 1)],
        });
      }
    }
    return { distance: d, dataQubits: dataQubits, checks: checks };
  }

  // Same Pauli-commutation model as Stabilizer Codes: a check "fires"
  // when it anticommutes with an odd number of its neighbors' errors.
  // This is the ONLY place syndrome logic lives — every widget on this
  // page calls into it rather than reimplementing the rule, so a
  // future MWPM section can reuse it unchanged.
  function anticommutes(a, b) {
    if (a === "I" || b === "I") return false;
    return a !== b;
  }

  function computeSyndrome(lattice, errors) {
    return lattice.checks.map(function (check) {
      var flips = 0;
      check.neighbors.forEach(function (qid) {
        var e = errors[qid];
        if (e && anticommutes(check.type, e)) flips++;
      });
      return { id: check.id, type: check.type, row: check.row, col: check.col, fired: flips % 2 === 1 };
    });
  }

  function renderSVG(lattice, opts) {
    opts = opts || {};
    var errors = opts.errors || {};
    var selected = opts.selected || null;
    var clickable = opts.clickableIds || null;
    var fired = {};
    computeSyndrome(lattice, errors).forEach(function (s) {
      fired[s.id] = s.fired;
    });

    var cell = opts.cellSize || 48;
    var margin = cell * 0.75;
    var d = lattice.distance;
    var size = margin * 2 + (d - 1) * cell;
    var dataR = Math.max(6, cell * 0.2);
    var checkSize = dataR * 1.7;

    var pos = {};
    lattice.dataQubits.forEach(function (q) {
      pos[q.id] = { x: margin + q.col * cell, y: margin + q.row * cell };
    });

    var parts = [];
    parts.push('<svg class="qed-lattice-svg" viewBox="0 0 ' + size + " " + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="Distance ' + d + ' surface-code lattice">');

    lattice.checks.forEach(function (check) {
      var cx = margin + (check.col + 0.5) * cell;
      var cy = margin + (check.row + 0.5) * cell;
      check.neighbors.forEach(function (qid) {
        var p = pos[qid];
        parts.push('<line class="qed-lattice-link" x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '" />');
      });
    });

    lattice.checks.forEach(function (check) {
      var cx = margin + (check.col + 0.5) * cell;
      var cy = margin + (check.row + 0.5) * cell;
      var isFired = !!fired[check.id];
      parts.push(
        '<rect class="qed-lattice-check' + (isFired ? " is-fired" : "") + '" x="' + (cx - checkSize / 2) + '" y="' + (cy - checkSize / 2) + '" width="' + checkSize + '" height="' + checkSize + '" rx="2" />'
      );
      parts.push('<text class="qed-lattice-check-glyph' + (isFired ? " is-fired" : "") + '" x="' + cx + '" y="' + (cy + 4) + '">' + (check.type === "X" ? "×" : "+") + "</text>");
    });

    lattice.dataQubits.forEach(function (q) {
      var p = pos[q.id];
      var err = errors[q.id];
      var isClickable = !clickable || clickable.indexOf(q.id) !== -1;
      var classes = "qed-lattice-data" + (err ? " is-error" : "") + (selected === q.id ? " is-selected" : "") + (isClickable ? "" : " is-disabled");
      parts.push(
        '<circle class="' + classes + '" data-qubit-id="' + q.id + '" cx="' + p.x + '" cy="' + p.y + '" r="' + dataR + '"' + (isClickable ? "" : ' style="cursor:default; opacity:0.45;"') + " />"
      );
      if (err) {
        parts.push('<text class="qed-lattice-data-label" x="' + p.x + '" y="' + (p.y + 3.5) + '">' + err + "</text>");
      }
    });

    parts.push("</svg>");
    return parts.join("");
  }

  function mount(container, lattice, opts, onQubitClick) {
    container.innerHTML = renderSVG(lattice, opts);
    if (onQubitClick) {
      container.querySelector("svg").addEventListener("click", function (e) {
        var el = e.target.closest("[data-qubit-id]");
        if (!el) return;
        var qid = el.getAttribute("data-qubit-id");
        if (opts.clickableIds && opts.clickableIds.indexOf(qid) === -1) return;
        onQubitClick(qid);
      });
    }
  }

  return { buildLattice: buildLattice, computeSyndrome: computeSyndrome, anticommutes: anticommutes, renderSVG: renderSVG, mount: mount };
})();

(function () {
  var el = document.getElementById("sf-patch-static");
  if (!el) return;
  var lattice = window.QedSurfaceCode.buildLattice(3);
  window.QedSurfaceCode.mount(el, lattice, {});
})();
</script>

Two kinds of physical qubit, doing two different jobs:

- **Data qubits** — participate in storing the encoded quantum information.
- **Measurement / check (ancilla) qubits** — obtain information from local stabilizer checks. They don't store logical information themselves.

**Where is the logical qubit?** It is *not* stored in any one physical qubit. The logical information is encoded collectively across the whole patch — the same idea as [Physical vs Logical Qubits](physical-vs-logical-qubits.md), just spread over more qubits in two dimensions instead of three in a row.

## X-Type and Z-Type Checks

You've already met \(X\) and \(Z\) errors, and the fact that a Z-type check (like \(S_1=Z_1Z_2\) in the repetition code) catches X errors while staying blind to Z errors. Surface codes use both kinds of check side by side, precisely so nothing slips through:

- **X-type checks** (marked ×) help reveal information about **Z-type (phase-flip)** errors.
- **Z-type checks** (marked +) help reveal information about **X-type (bit-flip)** errors.

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--error" style="min-width:11rem;"><div class="qed-qubit__label">Physical error</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:11rem;"><div class="qed-qubit__label">Conflicts with particular local checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:11rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Those check outcomes change</div></div>
</div>

No stabilizer algebra needed yet — try it directly below.

## Main Interactive — Create an Error on the Surface

Click a data qubit, choose an error type, and watch the neighboring checks respond.

<div class="qed-demo" id="sf-main-demo">
  <div id="sf-main-lattice"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button" id="sf-main-x" disabled>Apply X here</button>
    <button type="button" class="qed-button" id="sf-main-z" disabled>Apply Z here</button>
    <button type="button" class="qed-button qed-button--secondary" id="sf-main-reset" disabled>Reset</button>
  </div>
  <p class="qed-encode-demo__hint" id="sf-main-hint" aria-live="polite">Click any data qubit (the gray circles) to select it.</p>
  <div class="qed-syndrome-selector" id="sf-main-syndrome" hidden></div>
</div>

<script>
(function () {
  var mountEl = document.getElementById("sf-main-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var errors = {};
  var selected = null;
  var xBtn = document.getElementById("sf-main-x");
  var zBtn = document.getElementById("sf-main-z");
  var resetBtn = document.getElementById("sf-main-reset");
  var hint = document.getElementById("sf-main-hint");
  var syndromeBox = document.getElementById("sf-main-syndrome");

  function render() {
    QSC.mount(mountEl, lattice, { errors: errors, selected: selected }, onQubitClick);
    var syn = QSC.computeSyndrome(lattice, errors);
    var fired = syn.filter(function (s) {
      return s.fired;
    });
    xBtn.disabled = !selected;
    zBtn.disabled = !selected;
    resetBtn.disabled = Object.keys(errors).length === 0 && !selected;

    if (fired.length === 0) {
      syndromeBox.hidden = Object.keys(errors).length === 0;
      if (!syndromeBox.hidden) {
        syndromeBox.innerHTML = '<span class="qed-pill"><span class="qed-pill__label">Syndrome</span> none — no checks fired</span>';
      }
    } else {
      syndromeBox.hidden = false;
      syndromeBox.innerHTML = fired
        .map(function (s) {
          return '<span class="qed-pill"><span class="qed-pill__label">' + s.type + '-check</span> row ' + s.row + ", col " + s.col + "</span>";
        })
        .join("");
    }
  }

  function onQubitClick(qid) {
    selected = qid;
    hint.textContent = errors[qid]
      ? "q(" + qid.slice(1).replace("_", ",") + ") already has a " + errors[qid] + " error. Choose a different type to replace it, or reset."
      : "Selected q(" + qid.slice(1).replace("_", ",") + "). Choose Apply X or Apply Z.";
    render();
  }

  xBtn.addEventListener("click", function () {
    if (!selected) return;
    errors[selected] = "X";
    hint.textContent = "Applied an X error. Notice: only the +-type (Z-sensing) checks nearby respond — the ×-type checks stay quiet.";
    render();
  });
  zBtn.addEventListener("click", function () {
    if (!selected) return;
    errors[selected] = "Z";
    hint.textContent = "Applied a Z error. Notice: only the ×-type (X-sensing) checks nearby respond — the +-type checks stay quiet.";
    render();
  });
  resetBtn.addEventListener("click", function () {
    errors = {};
    selected = null;
    hint.textContent = "Click any data qubit (the gray circles) to select it.";
    render();
  });

  render();
})();
</script>

The syndrome list above is deliberately separate from the lattice picture: the system never "sees" the microscopic error directly — it only sees which checks fired. That's the same distinction from [Encoding & Syndrome Measurement](encoding-and-syndrome-measurement.md#the-crucial-measurement-concept), now playing out on a grid instead of a line of three.

## From One Error to an Error Chain

A single error lights up its neighboring checks. What happens with *several* errors in a row — an **error chain**?

<div class="qed-demo" id="sf-chain-demo">
  <div id="sf-chain-lattice"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--secondary" id="sf-chain-reset" disabled>Reset Chain</button>
  </div>
  <p class="qed-encode-demo__hint" id="sf-chain-hint" aria-live="polite">Click the three highlighted qubits in the middle row, in any order, to build a chain.</p>
</div>

<script>
(function () {
  var mountEl = document.getElementById("sf-chain-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(5);
  var chainQubits = ["d2_1", "d2_2", "d2_3"];
  var errors = {};
  var resetBtn = document.getElementById("sf-chain-reset");
  var hint = document.getElementById("sf-chain-hint");

  function render() {
    QSC.mount(mountEl, lattice, { errors: errors, clickableIds: chainQubits, cellSize: 40 }, onQubitClick);
    var count = Object.keys(errors).length;
    resetBtn.disabled = count === 0;

    if (count === 0) {
      hint.textContent = "Click the three highlighted qubits in the middle row, in any order, to build a chain.";
      return;
    }
    var syn = QSC.computeSyndrome(lattice, errors);
    var fired = syn.filter(function (s) {
      return s.fired;
    });
    if (count < 3) {
      hint.textContent = count + " qubit" + (count === 1 ? "" : "s") + " errored so far — " + fired.length + " check(s) currently firing. Add another qubit to the chain.";
    } else {
      hint.textContent =
        "Full 3-qubit chain: only " + fired.length + " check(s) fire — at the two ends of the chain. The check(s) between two chained errors see an even number of them and cancel out, so the middle of the chain stays invisible to the syndrome.";
    }
  }

  function onQubitClick(qid) {
    if (errors[qid]) {
      delete errors[qid];
    } else {
      errors[qid] = "X";
    }
    render();
  }

  resetBtn.addEventListener("click", function () {
    errors = {};
    render();
  });

  render();
})();
</script>

**The syndrome does not necessarily reveal every physical error along the path** — only where the chain's effect fails to cancel out.

<div class="qed-demo" id="sf-paths-demo">
  <div id="sf-paths-lattice"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--active sf-paths-btn" data-case="a">Explanation A</button>
    <button type="button" class="qed-button qed-button--secondary sf-paths-btn" data-case="b">Explanation B</button>
  </div>
  <p class="qed-encode-demo__hint" id="sf-paths-hint" aria-live="polite"></p>
</div>

<script>
(function () {
  var mountEl = document.getElementById("sf-paths-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var btns = Array.prototype.slice.call(document.querySelectorAll(".sf-paths-btn"));
  var hint = document.getElementById("sf-paths-hint");

  var CASES = {
    a: { errors: { d1_1: "X" }, label: "a single X error on the center qubit" },
    b: { errors: { d0_1: "X", d2_1: "X" }, label: "two X errors, on the top-middle and bottom-middle qubits" },
  };

  function select(key) {
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.case === key);
    });
    var c = CASES[key];
    QSC.mount(mountEl, lattice, { errors: c.errors, cellSize: 44 });
    var syn = QSC.computeSyndrome(lattice, c.errors);
    var fired = syn.filter(function (s) {
      return s.fired;
    });
    hint.textContent =
      "This is " + c.label + ". Checks firing: " + fired.length + " — " + (key === "a" ? "the same count and positions as Explanation B." : "the same count and positions as Explanation A.") +
      " Same syndrome, two genuinely different physical stories — exactly the ambiguity from Decoding, now on a lattice.";
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(b.dataset.case);
    });
  });

  select("a");
})();
</script>

If several possible error chains could explain what we measured, how do we know which one occurred? We may not need to reconstruct the exact physical history — the decoder just needs to choose a recovery that preserves the logical information, exactly as in [Decoding](decoding.md).

## Code Distance and Scaling

**Code distance** describes the minimum size of an undetectable logical error — the shortest error pattern that can change the encoded logical information without tripping any check along the way.

<div class="qed-demo" id="sf-dist-demo">
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--active sf-dist-btn" data-d="3">Distance 3</button>
    <button type="button" class="qed-button qed-button--secondary sf-dist-btn" data-d="5">Distance 5</button>
    <button type="button" class="qed-button qed-button--secondary sf-dist-btn" data-d="7">Distance 7</button>
  </div>
  <div id="sf-dist-lattice"></div>
  <div class="qed-error-demo__readout" style="justify-content:center;">
    <span class="qed-pill"><span class="qed-pill__label">Data qubits</span> <span id="sf-dist-data">–</span></span>
    <span class="qed-pill"><span class="qed-pill__label">Checks</span> <span id="sf-dist-checks">–</span></span>
    <span class="qed-pill"><span class="qed-pill__label">Corrects up to</span> <span id="sf-dist-t">–</span></span>
  </div>
</div>

<script>
(function () {
  var mountEl = document.getElementById("sf-dist-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var btns = Array.prototype.slice.call(document.querySelectorAll(".sf-dist-btn"));
  var dataEl = document.getElementById("sf-dist-data");
  var checksEl = document.getElementById("sf-dist-checks");
  var tEl = document.getElementById("sf-dist-t");

  function select(d) {
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.d === String(d));
    });
    var lattice = QSC.buildLattice(d);
    var cellSize = d <= 3 ? 48 : d <= 5 ? 36 : 26;
    QSC.mount(mountEl, lattice, { cellSize: cellSize });
    dataEl.textContent = lattice.dataQubits.length;
    checksEl.textContent = lattice.checks.length;
    tEl.textContent = Math.floor((d - 1) / 2) + " error" + (Math.floor((d - 1) / 2) === 1 ? "" : "s");
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(parseInt(b.dataset.d, 10));
    });
  });

  select(3);
})();
</script>

!!! info "Preview: t = (d − 1) / 2"
    For an idealized distance-\(d\) code, the number of errors it can correct is \(t = \lfloor (d-1)/2 \rfloor\) under the relevant assumptions. We won't derive this here — the visual above (more distance → more checks → more resources) is what matters at this level.

Bigger distance means better protection, but it isn't free:

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--protected" style="min-width:12rem;"><div class="qed-qubit__label">Larger distance</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:12rem;"><div class="qed-qubit__label">Larger patch, more physical resources</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:12rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">More syndrome information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:12rem;"><div class="qed-qubit__label">Harder decoding problem</div></div>
</div>

More physical qubits doesn't automatically mean better *real* performance, either — real hardware has its own error rates and connectivity limits, which is exactly the subject of [Hardware-Aware QEC](hardware-aware-qec.md).

## Physical Errors vs. Logical Errors

- **Physical error** — an error affecting one or more physical qubits. It can often be detected and corrected without ever touching the encoded logical information.
- **Logical error** — a physical error pattern (plus whatever recovery was applied) that ends up changing the encoded logical information.

**A physical error is not automatically a logical error.** Compare a short, local error against one that spans the whole patch:

<div class="qed-demo" id="sf-logical-demo">
  <div id="sf-logical-lattice"></div>
  <div class="qed-demo__controls" style="text-align:center;">
    <button type="button" class="qed-button qed-button--active sf-logical-btn" data-case="short">Short chain</button>
    <button type="button" class="qed-button qed-button--secondary sf-logical-btn" data-case="span">Full-span chain</button>
  </div>
  <div class="qed-error-demo__feedback" id="sf-logical-feedback"></div>
</div>

<script>
(function () {
  var mountEl = document.getElementById("sf-logical-lattice");
  if (!mountEl) return;
  var QSC = window.QedSurfaceCode;
  var lattice = QSC.buildLattice(3);
  var btns = Array.prototype.slice.call(document.querySelectorAll(".sf-logical-btn"));
  var feedback = document.getElementById("sf-logical-feedback");

  var CASES = {
    short: {
      errors: { d1_1: "X" },
      success: true,
      text: "A single X error fires two checks. The decoder has clear evidence, can pin down the affected qubit, and correct it — a physical error, handled.",
    },
    span: {
      errors: { d1_0: "X", d1_1: "X", d1_2: "X" },
      success: false,
      text: "An X-error chain spanning the entire middle row fires zero checks — every check bordering it either doesn't sense X errors, or borders two chain members whose effects cancel. This specific 4-check patch can't see it at all. A chain that silently spans a full surface-code patch edge-to-edge is exactly the shape of pattern that (once boundary checks are included, which this simplified patch omits) constitutes a logical error — errors big enough to slip past every local check.",
    },
  };

  function select(key) {
    btns.forEach(function (b) {
      b.classList.toggle("qed-button--active", b.dataset.case === key);
    });
    var c = CASES[key];
    QSC.mount(mountEl, lattice, { errors: c.errors, cellSize: 44 });
    feedback.textContent = (c.success ? "✓ Physical error, corrected. " : "✗ Undetected by this patch. ") + c.text;
    feedback.className = "qed-error-demo__feedback " + (c.success ? "qed-error-demo__feedback--correct" : "qed-error-demo__feedback--incorrect");
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      select(b.dataset.case);
    });
  });

  select("short");
})();
</script>

## From Surface Codes to Decoding at Scale

<div class="qed-demo">
  <div class="qed-demo__layout" style="justify-content: space-around; align-items:flex-start;">
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>3-qubit repetition code</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Few qubits</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Few checks</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--protected" style="min-width:10rem;"><div class="qed-qubit__label">Small syndrome table</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--protected" style="min-width:10rem;"><div class="qed-qubit__label">Simple decoding</div></div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
      <strong>Surface code</strong>
      <div class="qed-qubit qed-qubit--physical" style="min-width:10rem;"><div class="qed-qubit__label">Many physical qubits</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit" style="min-width:10rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Many local checks</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--error" style="min-width:10rem;"><div class="qed-qubit__label">Many possible error chains</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--error" style="min-width:10rem;"><div class="qed-qubit__label">Complex syndrome patterns</div></div>
      <div class="qed-encode-demo__arrow">↓</div>
      <div class="qed-qubit qed-qubit--error" style="min-width:10rem;"><div class="qed-qubit__label">Efficient decoding required</div></div>
    </div>
  </div>
</div>

Which error chain is the best explanation for a given syndrome? A decoder needs an efficient way to compare possible explanations and choose a good recovery — without exhaustively listing every possibility the way we could for three qubits.

## Takeaway

<div class="qed-demo" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
  <div class="qed-qubit qed-qubit--logical" style="min-width:14rem;"><div class="qed-qubit__label">Logical information</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--logical" style="min-width:14rem;"><div class="qed-qubit__label">Encoded across a surface-code patch</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Physical data qubits + local stabilizer checks</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--error" style="min-width:14rem;"><div class="qed-qubit__label">Physical errors occur</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit" style="min-width:14rem; border-color:var(--qed-color-syndrome);"><div class="qed-qubit__label">Check outcomes change → syndrome</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--physical" style="min-width:14rem;"><div class="qed-qubit__label">Decoder interprets the evidence</div></div>
  <div class="qed-encode-demo__arrow">↓</div>
  <div class="qed-qubit qed-qubit--protected" style="min-width:14rem;"><div class="qed-qubit__label">Logical information protected</div></div>
</div>

**A surface code scales the stabilizer-based QEC machinery across a structured lattice of physical qubits. Local checks provide evidence about physical errors, while a decoder must interpret that evidence to protect the encoded logical information.**

Many different error chains may explain the same detection information. How can a decoder efficiently choose a good recovery?

**[Next: Minimum-Weight Perfect Matching →](minimum-weight-perfect-matching.md)**
