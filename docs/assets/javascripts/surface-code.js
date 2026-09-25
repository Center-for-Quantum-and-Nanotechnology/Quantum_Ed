// Shared surface-code lattice module, used by both
// docs/07-error-correction/surface-codes.md and
// docs/07-error-correction/minimum-weight-perfect-matching.md.
//
// Loaded site-wide via extra_javascript (like download.js) since
// MkDocs pages are separate documents, not a single-page app — each
// page that wants QedSurfaceCode needs it loaded fresh. It's a no-op
// on pages that don't use it.
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
  // This is the ONLY place syndrome logic lives — every widget that
  // uses this module calls into it rather than reimplementing the
  // rule, so later sections (e.g. MWPM) can reuse it unchanged.
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
