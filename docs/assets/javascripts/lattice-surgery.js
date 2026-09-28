// Shared lattice-surgery module, used by
// docs/07-error-correction/lattice-surgery.md.
//
// Loaded site-wide via extra_javascript (like download.js,
// surface-code.js, and matching.js) since MkDocs pages are separate
// documents. No-op on pages that don't use it.
//
// Composes two QedSurfaceCode-style patches side by side with a
// mergeable shared boundary. Deliberately reuses QedSurfaceCode's
// lattice data (buildLattice) rather than reimplementing it, but
// needs its own renderer because merge/split introduces joint checks
// that connect qubits *across* two otherwise-independent lattices --
// something the single-patch renderer has no concept of.
window.QedLatticeSurgery = (function () {
  var QSC = window.QedSurfaceCode;

  var STAGE_ORDER = ["prepare", "merge", "measure", "split"];

  // Logical scene data only -- no coordinates, no SVG. Patch A and
  // Patch B are independent QedSurfaceCode lattices; boundaryPairs
  // records which data qubit on A faces which data qubit on B. `type`
  // on each pair is reserved (currently always "boundary") so a later
  // pass can distinguish rough/smooth or X-type/Z-type boundaries
  // without changing this shape.
  function buildScene(d) {
    var patchA = QSC.buildLattice(d);
    var patchB = QSC.buildLattice(d);
    var boundaryPairs = [];
    for (var r = 0; r < d; r++) {
      boundaryPairs.push({
        id: "jb" + r,
        a: "d" + r + "_" + (d - 1),
        b: "d" + r + "_0",
        row: r,
        type: "boundary",
      });
    }
    return { distance: d, patchA: patchA, patchB: patchB, boundaryPairs: boundaryPairs };
  }

  // Pure function of (scene, opts) -> SVG markup. opts.stage is one of
  // STAGE_ORDER; opts.view is "physical" | "checks" (default) |
  // "logical"; opts.highlightBoundary marks the facing columns even
  // before a merge exists.
  function renderSVG(scene, opts) {
    opts = opts || {};
    var stage = opts.stage || "prepare";
    var view = opts.view || "checks";
    var merged = stage === "merge" || stage === "measure";
    var cell = opts.cellSize || 42;
    var margin = cell * 0.75;
    var d = scene.distance;
    var patchSize = margin * 2 + (d - 1) * cell;
    var gap = cell * 1.7;
    var topPad = 24;
    var width = patchSize * 2 + gap;
    var height = topPad + patchSize;
    var dataR = Math.max(6, cell * 0.2);
    var checkSize = dataR * 1.7;

    var offsetA = 0;
    var offsetB = patchSize + gap;

    function qpos(offsetX, q) {
      return { x: offsetX + margin + q.col * cell, y: topPad + margin + q.row * cell };
    }

    var posA = {};
    var posB = {};
    scene.patchA.dataQubits.forEach(function (q) {
      posA[q.id] = qpos(offsetA, q);
    });
    scene.patchB.dataQubits.forEach(function (q) {
      posB[q.id] = qpos(offsetB, q);
    });

    var parts = [];
    var ariaState = merged ? "merged along their shared boundary" : stage === "measure" ? "merged" : "independent";
    parts.push(
      '<svg class="qed-surgery-svg" viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height +
        '" role="img" aria-label="Lattice surgery scene, patches currently ' + ariaState + '">'
    );
    parts.push('<text class="qed-surgery-label" x="' + (offsetA + patchSize / 2) + '" y="15">Patch A</text>');
    parts.push('<text class="qed-surgery-label" x="' + (offsetB + patchSize / 2) + '" y="15">Patch B</text>');

    if (view === "logical") {
      var pad = margin * 0.4;
      var by = topPad + pad;
      var bh = patchSize - pad * 2;
      parts.push(
        '<rect class="qed-surgery-logical-blob" x="' + (offsetA + pad) + '" y="' + by + '" width="' + (patchSize - pad * 2) + '" height="' + bh + '" rx="10" />'
      );
      parts.push('<text class="qed-surgery-logical-label" x="' + (offsetA + patchSize / 2) + '" y="' + (by + bh / 2 + 4) + '">Logical A</text>');
      parts.push(
        '<rect class="qed-surgery-logical-blob" x="' + (offsetB + pad) + '" y="' + by + '" width="' + (patchSize - pad * 2) + '" height="' + bh + '" rx="10" />'
      );
      parts.push('<text class="qed-surgery-logical-label" x="' + (offsetB + patchSize / 2) + '" y="' + (by + bh / 2 + 4) + '">Logical B</text>');
      if (merged) {
        var midY = topPad + patchSize / 2;
        parts.push(
          '<line class="qed-lattice-link--joint" x1="' + (offsetA + patchSize - pad) + '" y1="' + midY + '" x2="' + (offsetB + pad) + '" y2="' + midY + '" />'
        );
        var jx = offsetA + patchSize + gap / 2;
        parts.push('<rect class="qed-lattice-check is-joint" x="' + (jx - checkSize / 2) + '" y="' + (midY - checkSize / 2) + '" width="' + checkSize + '" height="' + checkSize + '" rx="2" />');
        parts.push('<text class="qed-lattice-check-glyph is-joint" x="' + jx + '" y="' + (midY + 4) + '">' + (stage === "measure" ? "✓" : "J") + "</text>");
      }
      parts.push("</svg>");
      return parts.join("");
    }

    function drawPatchChecks(patch, offsetX, pos) {
      if (view === "physical") return;
      patch.checks.forEach(function (check) {
        var cx = offsetX + margin + (check.col + 0.5) * cell;
        var cy = topPad + margin + (check.row + 0.5) * cell;
        check.neighbors.forEach(function (qid) {
          var p = pos[qid];
          parts.push('<line class="qed-lattice-link" x1="' + cx + '" y1="' + cy + '" x2="' + p.x + '" y2="' + p.y + '" />');
        });
      });
      patch.checks.forEach(function (check) {
        var cx = offsetX + margin + (check.col + 0.5) * cell;
        var cy = topPad + margin + (check.row + 0.5) * cell;
        parts.push('<rect class="qed-lattice-check" x="' + (cx - checkSize / 2) + '" y="' + (cy - checkSize / 2) + '" width="' + checkSize + '" height="' + checkSize + '" rx="2" />');
        parts.push('<text class="qed-lattice-check-glyph" x="' + cx + '" y="' + (cy + 4) + '">' + (check.type === "X" ? "×" : "+") + "</text>");
      });
    }
    drawPatchChecks(scene.patchA, offsetA, posA);
    drawPatchChecks(scene.patchB, offsetB, posB);

    if (merged && view !== "physical") {
      scene.boundaryPairs.forEach(function (bp) {
        var pa = posA[bp.a];
        var pb = posB[bp.b];
        var mx = (pa.x + pb.x) / 2;
        var my = (pa.y + pb.y) / 2;
        parts.push('<line class="qed-lattice-link--joint" x1="' + pa.x + '" y1="' + pa.y + '" x2="' + mx + '" y2="' + my + '" />');
        parts.push('<line class="qed-lattice-link--joint" x1="' + mx + '" y1="' + my + '" x2="' + pb.x + '" y2="' + pb.y + '" />');
        parts.push('<rect class="qed-lattice-check is-joint" x="' + (mx - checkSize / 2) + '" y="' + (my - checkSize / 2) + '" width="' + checkSize + '" height="' + checkSize + '" rx="2" />');
        parts.push('<text class="qed-lattice-check-glyph is-joint" x="' + mx + '" y="' + (my + 4) + '">' + (stage === "measure" ? "✓" : "J") + "</text>");
      });
    }

    function boundaryCols(isPatchA) {
      return isPatchA ? scene.distance - 1 : 0;
    }

    function drawQubits(patch, pos, isPatchA) {
      var bcol = boundaryCols(isPatchA);
      patch.dataQubits.forEach(function (q) {
        var p = pos[q.id];
        var isBoundary = opts.highlightBoundary && q.col === bcol;
        var cls = "qed-lattice-data" + (view === "physical" ? " is-physical-view" : "") + (isBoundary ? " is-boundary" : "");
        parts.push('<circle class="' + cls + '" cx="' + p.x + '" cy="' + p.y + '" r="' + dataR + '" />');
      });
    }
    drawQubits(scene.patchA, posA, true);
    drawQubits(scene.patchB, posB, false);

    parts.push("</svg>");
    return parts.join("");
  }

  function mount(container, scene, opts) {
    container.innerHTML = renderSVG(scene, opts);
  }

  return { STAGE_ORDER: STAGE_ORDER, buildScene: buildScene, renderSVG: renderSVG, mount: mount };
})();
