// Component: interference-mix
// Side-by-side: a classical random bit and a qubit, both given the same
// "mix" button (the Hadamard gate for the qubit). Two mixes return the
// qubit to a certain outcome (interference) while the bit stays 50/50.
// Signed amplitude bars make the minus sign in |−⟩ visible.
//
//   <div data-qed-demo="interference-mix"></div>
//   Options: data-opt-start (0 or 1, default 0)
//
// Used by: 01-foundations/what-is-quantum-computing.md (Superposition).
// Model (pure, testable): model.mix(amps) -> amps after one Hadamard.
// Simplification: real-valued amplitudes only (enough for H on |0⟩, |1⟩).
(function () {
  var EPS = 1e-9;
  var H = Math.SQRT1_2;

  function clean(x) {
    if (Math.abs(x) < EPS) return 0;
    if (Math.abs(x - 1) < EPS) return 1;
    if (Math.abs(x + 1) < EPS) return -1;
    return x;
  }

  var model = {
    mix: function (a) {
      return [clean((a[0] + a[1]) * H), clean((a[0] - a[1]) * H)];
    },
    stateName: function (a) {
      if (Math.abs(a[0] - 1) < EPS) return "|0⟩";
      if (Math.abs(a[1] - 1) < EPS) return "|1⟩";
      if (Math.abs(a[0] - H) < EPS && Math.abs(a[1] - H) < EPS) return "|+⟩";
      if (Math.abs(a[0] - H) < EPS && Math.abs(a[1] + H) < EPS) return "|−⟩";
      return "|ψ⟩";
    },
  };

  function mount(root, opts) {
    root.innerHTML =
      '<div class="qed-compare-row" style="align-items:stretch;">' +
      '<div class="qed-panel"><div class="qed-panel__title">Classical random bit</div>' +
      '<div class="qed-panel__state" data-ref="c-state"></div><div data-ref="c-bars"></div></div>' +
      '<div class="qed-panel qed-panel--quantum"><div class="qed-panel__title">Qubit</div>' +
      '<div class="qed-panel__state" data-ref="q-state"></div><div data-ref="q-amps"></div><div data-ref="q-bars"></div></div>' +
      "</div>" +
      '<div class="qed-demo__controls" style="min-width:auto; text-align:center; margin-top:0.8rem;">' +
      "<span>Start both in:</span> " +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="start-0" aria-pressed="false">0</button>' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="start-1" aria-pressed="false">1</button>' +
      '<button type="button" class="qed-button" data-ref="apply">Apply mix (H)</button>' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="reset">Reset</button>' +
      '<div class="qed-demo__note">Mixes applied: <strong data-ref="count">0</strong></div></div>' +
      '<div class="qed-error-demo__feedback" data-ref="feedback" aria-live="polite"></div>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var start = opts.start === 1 ? 1 : 0;
    var n = 0;
    var amp = [1, 0];
    var prob = [1, 0];

    function message() {
      var qp0 = amp[0] * amp[0];
      var certain = qp0 > 1 - EPS || qp0 < EPS;
      if (n === 0) return "Both start as a definite " + start + ". Press <strong>Apply mix</strong> to begin.";
      if (!certain) {
        if (start === 0) {
          return "Both are now 50/50, and at this point the qubit cannot be told apart from the coin. This is why a qubit is often mistaken for a hidden coin. Apply the mix once more.";
        }
        return "Both are again 50/50, but the qubit's amplitude for |1⟩ is now negative (the hatched bar). This is a different state from the one reached by starting at 0, even though the odds are the same. Apply the mix again to see why the difference matters.";
      }
      return "<strong>Classical bit:</strong> still 50/50. Mixing a random bit yields another random bit. <strong>Qubit:</strong> back to a certain " +
        (qp0 > 0.5 ? 0 : 1) + ". The two contributions to the other outcome had opposite signs and cancelled. This is interference, which a hidden coin cannot reproduce.";
    }

    function render() {
      ref("count").textContent = n;
      ref("c-state").textContent = n === 0 ? "definitely " + start : "a fair coin flip";
      ref("c-bars").innerHTML = QedUI.probRow("P(0)", prob[0], { labelWidth: "2.6rem" }) + QedUI.probRow("P(1)", prob[1], { labelWidth: "2.6rem" });
      ref("q-state").textContent = "|ψ⟩ = " + model.stateName(amp);
      ref("q-amps").innerHTML = QedUI.ampRow("amp. of |0⟩", amp[0]) + QedUI.ampRow("amp. of |1⟩", amp[1]);
      ref("q-bars").innerHTML =
        QedUI.probRow("P(0)", amp[0] * amp[0], { accent: "quantum", labelWidth: "2.6rem" }) +
        QedUI.probRow("P(1)", amp[1] * amp[1], { accent: "quantum", labelWidth: "2.6rem" });
      ref("feedback").innerHTML = message();
    }

    function setStart(v) {
      start = v;
      n = 0;
      amp = v === 0 ? [1, 0] : [0, 1];
      prob = v === 0 ? [1, 0] : [0, 1];
      [0, 1].forEach(function (i) {
        var b = ref("start-" + i);
        b.classList.toggle("qed-button--active", i === v);
        b.setAttribute("aria-pressed", i === v ? "true" : "false");
      });
      render();
    }

    ref("apply").addEventListener("click", function () {
      amp = model.mix(amp);
      prob = [0.5, 0.5];
      n++;
      render();
    });
    ref("reset").addEventListener("click", function () { setStart(start); });
    ref("start-0").addEventListener("click", function () { setStart(0); });
    ref("start-1").addEventListener("click", function () { setStart(1); });
    setStart(start);
  }

  QedComponents.register("interference-mix", { mount: mount, model: model });
})();
