// Shared module for Module 04's chip and fridge: the six parts of a superconducting device, which of
// the five needs each serves, which of 04.01.05's five sources of noise each brings, which Platform
// Card question each answers, a schematic of them, and an INVENTED wiring model. Used by
// docs/04-hardware/superconducting-qubits.md (04.02.01).
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op on pages that
// don't call it. Page scripts that use window.QedChip must run inside a DOMContentLoaded listener.
// It reads QedLadder.NEEDS, QedNoise.SOURCES, and QedPlatform.questionByNumber at run time, so
// ladder.js, noise.js, and platform.js must be loaded first.
//
// Layers, kept apart (same convention as QedLadder / QedNoise):
//   model     -> PARTS, needs, partById, role, wiring, wiringRows, wiringWords, chipText. Pure
//                functions, no DOM.
//   rendering -> renderSVG, listHTML, roleHTML return strings
//   wiring    -> left to each page
//
// The schematic is a SIMPLIFIED picture of the kinds of part, not a layout of any real chip, and it
// is not to scale. The wiring model is INVENTED: one control line for every qubit, and one readout
// line for every qubit, or one for every four when readout lines are shared. Nothing here names a
// vendor, a product, or a real device, and no figure here is a real count.
window.QedChip = (function () {
  var QUBIT_COUNTS = [4, 16, 64, 256, 1024]; // invented
  var SHARE_GROUP = 4; // invented: qubits that share one readout line when sharing is on

  // The six parts. needs are ids from QedLadder.NEEDS, sources are ids from QedNoise.SOURCES, and
  // question is the Platform Card question the part answers.
  var PARTS = [
    { id: "qubit", label: "The qubit", what: "A small circuit on the chip with a Josephson junction in it.", does: "It holds the two usable levels that stand for 0 and 1.", needs: ["start", "keep"], sources: ["environment", "leakage"], question: 1 },
    { id: "coupler", label: "The coupler", what: "The element that links a qubit to its neighbour.", does: "It lets two linked qubits affect each other when a two-qubit gate is wanted.", needs: ["connect"], sources: ["neighbours"], question: 5 },
    { id: "control", label: "The control line", what: "The wire that carries microwaves to a qubit.", does: "It carries the signal that turns the qubit.", needs: ["control"], sources: ["control"], question: 2 },
    { id: "readout", label: "The readout resonator", what: "A small circuit beside the qubit, and the line that carries its signal.", does: "Its response changes slightly with the qubit's state, so a weak probe signal comes back different for 0 and for 1.", needs: ["read"], sources: ["readout"], question: 3 },
    { id: "cold", label: "The cold stages", what: "The stack of colder and colder plates in the refrigerator, with the shielding.", does: "It keeps the metal superconducting, keeps heat from jostling the qubit, and keeps outside disturbance away.", needs: ["keep"], sources: ["environment"], question: 1 },
    { id: "wiring", label: "The wiring", what: "The many lines running from the room-temperature electronics down to the chip.", does: "It carries every control and readout signal in and out, and brings heat and noise in with each line.", needs: ["control", "read"], sources: ["control", "environment"], question: 6 },
  ];

  function find(list, id, what) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    throw new Error("QedChip: no " + what + " called " + id);
  }
  function partById(id) { return find(PARTS, id, "part"); }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // The five needs of 04.01.01 with their badge numbers (the order of QedLadder.NEEDS).
  function needs() {
    return window.QedLadder.NEEDS.map(function (n, i) { return { id: n.id, label: n.label, n: i + 1 }; });
  }
  function needById(id) { return find(needs(), id, "need"); }

  // A part's role in separate pieces: what it is, what it does, the needs it serves, the sources it
  // brings (the names from QedNoise), and the Platform Card question it answers.
  function role(id) {
    var p = partById(id);
    var q = window.QedPlatform.questionByNumber(p.question);
    return {
      id: p.id,
      label: p.label,
      what: p.what,
      does: p.does,
      needs: p.needs.map(needById),
      sources: p.sources.map(function (s) {
        var src = find(window.QedNoise.SOURCES, s, "source");
        return { id: src.id, label: src.label };
      }),
      question: { n: q.n, text: q.text },
    };
  }

  // A sentence for an aria-live region.
  function roleWords(id) {
    var r = role(id);
    return r.label + ". It serves " + r.needs.map(function (n) { return "need " + n.n + ", " + n.label.toLowerCase(); }).join(" and ") +
      ", and brings " + r.sources.map(function (s) { return "the " + s.label.toLowerCase(); }).join(" and ") + ". It answers question " + r.question.n + ".";
  }

  // ---- the invented wiring model ----------------------------------------------------------

  // The lines running into the refrigerator for a number of qubits, with readout lines shared or not.
  function wiring(qubits, shared) {
    if (QUBIT_COUNTS.indexOf(qubits) < 0) throw new Error("QedChip: the number of qubits must be one of " + QUBIT_COUNTS.join(", "));
    var control = qubits;
    var readout = shared ? Math.ceil(qubits / SHARE_GROUP) : qubits;
    return { qubits: qubits, shared: !!shared, control: control, readout: readout, total: control + readout };
  }

  // Bars for each count of qubits, on a fixed scale (the largest unshared total), so counts compare by eye.
  function wiringRows(shared) {
    var max = wiring(QUBIT_COUNTS[QUBIT_COUNTS.length - 1], false).total;
    return QUBIT_COUNTS.map(function (q) {
      var w = wiring(q, shared);
      return { qubits: q, total: w.total, label: q + " qubits", fraction: w.total / max, text: w.total + " lines" };
    });
  }

  function wiringWords(qubits, shared) {
    var w = wiring(qubits, shared);
    return w.qubits + " qubits need " + w.control + " control lines and " + w.readout + " readout lines, " + w.total + " lines in all" +
      (w.shared ? ", with each readout line shared by " + SHARE_GROUP + " qubits" : ", with a readout line for every qubit") + ".";
  }

  // ---- the schematic ----------------------------------------------------------------------

  function chipText() {
    return "A simplified schematic, not a layout and not to scale. At the top, room-temperature electronics. Below them, a stack of four colder and colder plates inside a shield, with wiring running down through them. At the bottom, a chip with two linked qubits, joined by a coupler. Each qubit has a control line coming down to it and a readout resonator beside it with its own line.";
  }

  // An SVG of the six parts. selected is a part id, or none. Each part is one group with a data-part
  // attribute and a text label, so the page can make it a target; the real buttons give keyboard
  // access. Colors come from classes in extra.css. The only strings inserted are fixed labels.
  function renderSVG(selected) {
    if (selected) partById(selected);
    function g(id, inner) {
      return '<g class="qed-ch__part qed-ch__part--' + id + (selected === id ? " qed-ch__part--on" : "") + '" data-part="' + id + '">' + inner + "</g>";
    }
    function t(cls, x, y, anchor, text) {
      return '<text class="qed-ch__text' + (cls ? " qed-ch__text--" + cls : "") + '" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '">' + text + "</text>";
    }
    var plates = [[60, 340, 40], [108, 300, 60], [156, 260, 80], [204, 220, 100]];
    var cold = plates.map(function (p) {
      return '<rect class="qed-ch__plate" x="' + p[2] + '" y="' + p[0] + '" width="' + p[1] + '" height="22" rx="3"/>';
    }).join("") +
      t("", 210, 76, "middle", "cold stages") + t("", 210, 220, "middle", "coldest") +
      '<rect class="qed-ch__shield" x="30" y="252" width="360" height="238" rx="6"/>' + t("", 210, 484, "middle", "shield");
    var wires = [80, 130, 290, 340].map(function (x) {
      return '<line class="qed-ch__wire" x1="' + x + '" y1="42" x2="' + x + '" y2="262"/>';
    }).join("") + t("", 210, 100, "middle", "wiring");
    var qubits = [130, 290].map(function (x) {
      return '<circle class="qed-ch__qubit" cx="' + x + '" cy="352" r="18"/>' +
        '<rect class="qed-ch__junction" x="' + (x - 6) + '" y="346" width="12" height="12"/>' +
        '<line class="qed-ch__junction" x1="' + (x - 6) + '" y1="358" x2="' + (x + 6) + '" y2="346"/>';
    }).join("") + t("", 150, 338, "start", "qubit");
    var coupler = '<line class="qed-ch__link" x1="148" y1="352" x2="197" y2="352"/><line class="qed-ch__link" x1="223" y1="352" x2="272" y2="352"/>' +
      '<rect class="qed-ch__coupler" x="197" y="343" width="26" height="18" rx="2"/>' + t("", 210, 382, "middle", "coupler");
    var control = [130, 290].map(function (x) {
      return '<line class="qed-ch__control" x1="' + (x - 3) + '" y1="262" x2="' + (x - 3) + '" y2="334"/><line class="qed-ch__control" x1="' + (x + 3) + '" y1="262" x2="' + (x + 3) + '" y2="334"/>';
    }).join("") + t("", 142, 312, "start", "control line");
    var readout = [[130, 80, 100, 160], [290, 340, 260, 320]].map(function (r) {
      return '<line class="qed-ch__arrow" x1="' + r[0] + '" y1="370" x2="' + r[0] + '" y2="390" marker-end="url(#qed-ch-arrow)"/>' +
        '<rect class="qed-ch__resonator" x="' + r[2] + '" y="392" width="60" height="16" rx="3"/>' +
        '<polyline class="qed-ch__rline" points="' + (r[0] < 200 ? r[2] : r[3]) + ",400 " + r[1] + ",400 " + r[1] + ',262"/>';
    }).join("") + t("", 142, 428, "middle", "readout resonator");
    return '<svg class="qed-ch__svg' + (selected ? " qed-ch__svg--picked" : "") + '" viewBox="0 0 420 498" role="img" aria-label="' + esc(chipText()) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><marker id="qed-ch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path class="qed-ch__head" d="M0,0 L10,5 L0,10 z"/></marker></defs>' +
      '<rect class="qed-ch__room" x="40" y="4" width="340" height="38" rx="4"/>' + t("", 210, 28, "middle", "room-temperature electronics") +
      g("cold", cold) + g("wiring", wires) +
      '<rect class="qed-ch__chip" x="60" y="274" width="300" height="186" rx="4"/>' + t("tag", 210, 452, "middle", "chip, simplified, not to scale") +
      g("coupler", coupler) + g("qubit", qubits) + g("control", control) + g("readout", readout) + "</svg>";
  }

  // ---- text and tables --------------------------------------------------------------------

  function needsText(list) {
    return list.map(function (n) { return '<span class="qed-ch__badge">' + n.n + "</span> " + esc(n.label); }).join(", ");
  }

  // The six parts as a real table: the same facts as the picture.
  function listHTML() {
    var rows = PARTS.map(function (p) {
      var r = role(p.id);
      return '<tr><th scope="row">' + esc(r.label) + '</th><td data-label="What it is">' + esc(r.what) + '</td><td data-label="What it does">' + esc(r.does) +
        '</td><td data-label="Needs">' + needsText(r.needs) + '</td><td data-label="Source of noise">' + r.sources.map(function (s) { return '<span class="qed-ch__src">' + esc(s.label) + "</span>"; }).join(" ") +
        '</td><td data-label="Card question">' + r.question.n + "</td></tr>";
    }).join("");
    return '<table class="qed-xf__table"><thead><tr><th scope="col">Part</th><th scope="col">What it is</th><th scope="col">What it does</th><th scope="col">Needs</th><th scope="col">Source of noise</th><th scope="col">Card question</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  // One part's role, in separate lines.
  function roleHTML(id) {
    var r = role(id);
    return '<dl class="qed-ch__role"><dt>' + esc(r.label) + "</dt>" +
      "<dd><strong>What it is:</strong> " + esc(r.what) + "</dd>" +
      "<dd><strong>What it does:</strong> " + esc(r.does) + "</dd>" +
      "<dd><strong>Needs it serves:</strong> " + needsText(r.needs) + "</dd>" +
      "<dd><strong>Source of noise it brings:</strong> " + r.sources.map(function (s) { return '<span class="qed-ch__src">' + esc(s.label) + "</span>"; }).join(" ") + "</dd>" +
      "<dd><strong>Platform Card question it answers:</strong> " + r.question.n + ", " + esc(r.question.text) + "</dd></dl>";
  }

  return {
    QUBIT_COUNTS: QUBIT_COUNTS,
    SHARE_GROUP: SHARE_GROUP,
    PARTS: PARTS,
    needs: needs,
    partById: partById,
    role: role,
    roleWords: roleWords,
    wiring: wiring,
    wiringRows: wiringRows,
    wiringWords: wiringWords,
    chipText: chipText,
    renderSVG: renderSVG,
    listHTML: listHTML,
    roleHTML: roleHTML,
  };
})();
