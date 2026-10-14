// Component: tilt-agreement
// Alice and Bob share a Bell pair. Alice always measures straight on (0°).
// Bob turns his detector by a chosen angle. A slider sets the angle; the
// demo shows how often their results agree, and sends sample pairs.
// Landmarks: 0° always agree, 90° a coin flip, 180° always disagree.
//
//   <div data-qed-demo="tilt-agreement"></div>
//   Options: data-opt-tilt (starting angle, default 60), data-opt-pairs (pairs per click, default 20)
//
// Used by: 01-foundations/what-is-quantum-computing.md (Entanglement).
// Depends on: QedComponents, QedUI.
// Model (pure, testable): model.pSame(alphaDeg, betaDeg) = cos²((α−β)/2).
// Simplification: results are sampled from this prediction (each answer a
// fair coin, agreeing with probability pSame); this is not a state-vector
// simulation.
(function () {
  var model = {
    pSame: function (alphaDeg, betaDeg) {
      var d = ((alphaDeg - betaDeg) * Math.PI) / 180;
      return Math.pow(Math.cos(d / 2), 2);
    },
  };

  function mount(root, opts) {
    var id = QedComponents.uid("tilt");
    var tilt = opts.tilt !== undefined ? opts.tilt : 60;
    var perClick = opts.pairs !== undefined ? opts.pairs : 20;

    root.innerHTML =
      '<div class="qed-demo__controls">' +
      '<label for="' + id + '">Bob turns his detector by: <span data-ref="tilt-value"></span></label>' +
      '<input type="range" id="' + id + '" min="0" max="180" step="1" value="' + tilt + '" data-ref="tilt">' +
      "</div>" +
      '<div data-ref="bar" style="margin-top:0.6rem;"></div>' +
      '<p class="qed-demo__note" data-ref="hint"></p>' +
      '<button type="button" class="qed-button" data-ref="send">Send ' + perClick + " pairs</button>" +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="reset">Clear</button>' +
      '<div class="qed-error-demo__readout" data-ref="pairs" aria-label="Results of the last pairs"></div>' +
      '<div class="qed-error-demo__feedback" data-ref="tally" aria-live="polite"></div>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var total = 0, same = 0;

    function hintFor(t) {
      if (t === 0) return "Same direction: the results agree every time.";
      if (t === 180) return "Opposite directions: the results disagree every time.";
      if (t === 90) return "A right angle: Bob's result tells Alice nothing, so they agree half the time.";
      return t < 90 ? "A small turn: they still agree most of the time." : "A large turn: they mostly disagree.";
    }

    function drawBar() {
      var p = model.pSame(0, tilt);
      ref("tilt-value").textContent = tilt + "°";
      ref("bar").innerHTML = QedUI.probRow("Agree", p, {
        accent: "quantum", labelWidth: "4rem", textWidth: "4.5rem", text: QedUI.pct(p, 0),
      });
      ref("hint").textContent = hintFor(tilt);
    }

    function clear() {
      total = same = 0;
      ref("pairs").innerHTML = "";
      ref("tally").innerHTML = "Press <strong>Send " + perClick + " pairs</strong>.";
    }

    ref("tilt").addEventListener("input", function () {
      tilt = parseInt(ref("tilt").value, 10);
      drawBar();
      clear();
    });

    ref("send").addEventListener("click", function () {
      var p = model.pSame(0, tilt);
      var html = "";
      for (var i = 0; i < perClick; i++) {
        var a = Math.random() < 0.5 ? 0 : 1;
        var b = Math.random() < p ? a : 1 - a;
        total++;
        if (a === b) same++;
        html += '<span class="qed-pill ' + (a === b ? "" : "qed-pill--neutral") + '"><span class="qed-pill__label">' +
          (a === b ? "✓" : "✗") + "</span>" + a + " " + b + "</span>";
      }
      ref("pairs").innerHTML = html;
      ref("tally").innerHTML =
        "<strong>" + same + " of " + total + "</strong> pairs agreed so far (" + QedUI.pct(same / total, 0) +
        "). The prediction is " + QedUI.pct(p, 0) + ". Each pair above shows Alice's result, then Bob's.";
    });

    ref("reset").addEventListener("click", clear);
    drawBar();
    clear();
  }

  QedComponents.register("tilt-agreement", { mount: mount, model: model });
})();
