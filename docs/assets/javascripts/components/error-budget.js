// Component: error-budget
// If each gate fails independently with probability p, a circuit of G
// gates runs error-free with probability (1 − p)^G. Two log sliders (error
// rate, gate count) show how quickly that collapses and how many gates a
// device can run before success drops below 50%. Sets up why error
// correction is needed (Module 07).
//
//   <div data-qed-demo="error-budget"></div>
//   Options: data-opt-error-exponent (initial, 3 -> p = 10^-3),
//            data-opt-gate-exponent (initial, 3 -> 1,000 gates)
//
// Used by: 01-foundations/quantum-computing-today.md (NISQ Era).
// Model (pure, testable): model.successProbability(p, G),
//   model.gatesToHalf(p).
// Simplification: independent errors, every error ruins the answer. Real
// circuits can tolerate some errors, and error mitigation helps a little.
(function () {
  var model = {
    successProbability: function (p, G) { return Math.exp(G * Math.log1p(-p)); },
    gatesToHalf: function (p) { return Math.log(0.5) / Math.log1p(-p); },
  };

  function mount(root, opts) {
    var id = QedComponents.uid("budget");
    var e0 = opts.errorExponent !== undefined ? opts.errorExponent : 3;
    var g0 = opts.gateExponent !== undefined ? opts.gateExponent : 3;

    root.innerHTML =
      '<div class="qed-demo__controls" style="min-width:auto;">' +
      '<label for="' + id + '-p">Error per two-qubit gate, p = <strong data-ref="p-val"></strong></label>' +
      '<input type="range" id="' + id + '-p" min="2" max="5" step="0.25" value="' + e0 + '" data-ref="p">' +
      '<label for="' + id + '-g">Gates in the circuit, G = <strong data-ref="g-val"></strong></label>' +
      '<input type="range" id="' + id + '-g" min="1" max="6" step="0.25" value="' + g0 + '" data-ref="g"></div>' +
      '<div style="margin-top:0.8rem;" data-ref="bar"></div>' +
      '<div class="qed-error-demo__feedback" data-ref="feedback" aria-live="polite"></div>' +
      '<p class="qed-demo__note">Success means no gate fails. The dark tick marks 50%.</p>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }

    function fmtError(p) {
      var pctVal = p * 100;
      return (pctVal >= 1 ? pctVal.toFixed(0) : pctVal >= 0.1 ? pctVal.toFixed(1) : pctVal >= 0.01 ? pctVal.toFixed(2) : pctVal.toFixed(3)) + "%";
    }

    function update() {
      var p = Math.pow(10, -parseFloat(ref("p").value));
      var G = Math.round(Math.pow(10, parseFloat(ref("g").value)));
      var success = model.successProbability(p, G);
      var half = model.gatesToHalf(p);
      ref("p-val").textContent = fmtError(p);
      ref("g-val").innerHTML = QedUI.human(G);
      ref("bar").innerHTML = QedUI.probRow("Chance of an error-free run", success, {
        accent: success >= 0.5 ? "protected" : "error", marker: 0.5, labelWidth: "9rem", text: success < 0.001 ? "< 0.1%" : QedUI.pct(success, success < 0.1 ? 1 : 0), textWidth: "4.5rem",
      });
      ref("feedback").innerHTML = "At this error rate, a circuit stays more likely than not to run cleanly for about <strong>" + QedUI.human(Math.round(half)) +
        " gates</strong>. Cutting the error rate tenfold lets circuits grow about tenfold.";
    }

    ref("p").addEventListener("input", update);
    ref("g").addEventListener("input", update);
    update();
  }

  QedComponents.register("error-budget", { mount: mount, model: model });
})();
