// Shared decoding-graph / matching module, used by
// docs/07-error-correction/minimum-weight-perfect-matching.md.
//
// Loaded site-wide via extra_javascript (like download.js and
// surface-code.js) since MkDocs pages are separate documents. No-op on
// pages that don't use it.
window.QedMatching = (function () {
  function edgeKey(a, b) {
    return a < b ? a + "|" + b : b + "|" + a;
  }

  // Uses each node's grid coordinates (gx, gy) rather than its display
  // pixel position (x, y) -- those are deliberately kept separate so a
  // graph can be laid out however looks clearest on screen without
  // that layout choice silently changing the weights.
  function manhattan(a, b) {
    return Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy);
  }

  // Enumerate every perfect matching of a small, even-sized node set by
  // recursive pairing. Fine for the 4-6 node educational examples used
  // on this page; not meant to scale -- a real decoder needs a proper
  // blossom algorithm, which is explicitly out of scope here.
  function allPerfectMatchings(nodeIds) {
    if (nodeIds.length === 0) return [[]];
    var first = nodeIds[0];
    var rest = nodeIds.slice(1);
    var results = [];
    rest.forEach(function (partner, idx) {
      var remaining = rest.slice(0, idx).concat(rest.slice(idx + 1));
      allPerfectMatchings(remaining).forEach(function (subMatching) {
        results.push([[first, partner]].concat(subMatching));
      });
    });
    return results;
  }

  function matchingWeight(matching, edgeWeights) {
    return matching.reduce(function (sum, pair) {
      return sum + edgeWeights[edgeKey(pair[0], pair[1])];
    }, 0);
  }

  // The error-model layer: given nodes and a weight function, produce
  // an edge-weight lookup. Kept separate from the solver below so a
  // future, more sophisticated error model can replace weightFn
  // without touching the matching logic at all.
  function buildWeights(nodeIds, nodesById, weightFn) {
    var weights = {};
    for (var i = 0; i < nodeIds.length; i++) {
      for (var j = i + 1; j < nodeIds.length; j++) {
        var a = nodesById[nodeIds[i]];
        var b = nodesById[nodeIds[j]];
        weights[edgeKey(nodeIds[i], nodeIds[j])] = weightFn(a, b);
      }
    }
    return weights;
  }

  // The solver layer: pure function of (node ids, edge weights) ->
  // best matching(s). No DOM, no visualization, no error-model logic.
  function solveMWPM(nodeIds, edgeWeights) {
    var all = allPerfectMatchings(nodeIds).map(function (m) {
      return { matching: m, weight: matchingWeight(m, edgeWeights) };
    });
    var minWeight = Math.min.apply(
      null,
      all.map(function (m) {
        return m.weight;
      })
    );
    var best = all.filter(function (m) {
      return m.weight === minWeight;
    });
    return { all: all, minWeight: minWeight, best: best };
  }

  function renderGraphSVG(nodes, opts) {
    opts = opts || {};
    var edgeWeights = opts.edgeWeights || {};
    var selected = opts.selectedPairs || [];
    var mwpm = opts.mwpmPairs || [];
    var showCandidates = opts.showCandidates !== false;
    var width = opts.width || 260;
    var height = opts.height || 260;
    var r = opts.nodeRadius || 14;

    var byId = {};
    nodes.forEach(function (n) {
      byId[n.id] = n;
    });

    function isSelected(a, b) {
      return selected.some(function (p) {
        return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a);
      });
    }
    function isMwpm(a, b) {
      return mwpm.some(function (p) {
        return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a);
      });
    }

    var parts = [];
    parts.push('<svg class="qed-graph-svg" viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height + '" role="img" aria-label="Decoding graph with ' + nodes.length + ' detection-event nodes">');

    if (showCandidates) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i],
            b = nodes[j];
          var sel = isSelected(a.id, b.id);
          var mw = isMwpm(a.id, b.id);
          var cls = "qed-graph-edge" + (sel ? " is-selected" : "") + (mw && !sel ? " is-mwpm" : "");
          parts.push(
            '<line class="' + cls + '" data-edge="' + a.id + "," + b.id + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />'
          );
          if (opts.showWeights) {
            var w = edgeWeights[edgeKey(a.id, b.id)];
            var mx = (a.x + b.x) / 2,
              my = (a.y + b.y) / 2;
            parts.push('<text class="qed-graph-edge-weight" x="' + mx + '" y="' + (my - 4) + '">' + w + "</text>");
          }
        }
      }
    } else {
      selected.concat(mwpm).forEach(function (p) {
        var a = byId[p[0]],
          b = byId[p[1]];
        if (!a || !b) return;
        var cls = "qed-graph-edge is-selected";
        parts.push('<line class="' + cls + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />');
      });
    }

    nodes.forEach(function (n) {
      var cls = "qed-graph-node" + (opts.selectedNode === n.id ? " is-selected" : "");
      parts.push('<circle class="' + cls + '" data-node="' + n.id + '" cx="' + n.x + '" cy="' + n.y + '" r="' + r + '" />');
      parts.push('<text class="qed-graph-node-label" x="' + n.x + '" y="' + (n.y + 4.5) + '">' + n.label + "</text>");
    });

    parts.push("</svg>");
    return parts.join("");
  }

  return {
    edgeKey: edgeKey,
    manhattan: manhattan,
    allPerfectMatchings: allPerfectMatchings,
    matchingWeight: matchingWeight,
    buildWeights: buildWeights,
    solveMWPM: solveMWPM,
    renderGraphSVG: renderGraphSVG,
  };
})();
