// Component: log-bars
// A labeled horizontal bar chart whose values span orders of magnitude,
// with a toggle between logarithmic and linear scales. The toggle is the
// lesson: on a linear scale the smaller bars effectively vanish.
//
//   <div data-qed-demo="log-bars"
//        data-opt-title="Qubits: today vs. needed"
//        data-opt-unit="physical qubits"
//        data-opt-items='[{"label":"Willow","value":105,"note":"…"},
//                         {"label":"RSA-2048 estimate","value":1000000,"accent":"noise"}]'></div>
//   Options: items (JSON array of {label, value, note?, accent?}),
//            title, unit, scale ("log" | "linear", default "log")
//   accent values: "quantum" | "protected" | "noise" | "error" | omitted.
//
// Used by: 01-foundations/quantum-computing-today.md (Current Limitations).
// Note for authors: put sources for the numbers in the page text, next to
// the demo, and keep each item's "note" short. Values go stale; date them.
(function () {
  var model = {
    // Bar width as a fraction of the track for the chosen scale.
    fraction: function (value, max, scale) {
      if (scale === "linear") return value / max;
      return Math.log10(Math.max(value, 1)) / Math.ceil(Math.log10(max));
    },
  };

  function mount(root, opts) {
    var items = Array.isArray(opts.items) ? opts.items : [];
    var scale = opts.scale === "linear" ? "linear" : "log";
    var unit = opts.unit ? " " + opts.unit : "";
    var max = items.reduce(function (m, it) { return Math.max(m, it.value); }, 1);

    root.innerHTML =
      (opts.title ? '<div class="qed-panel__title" style="margin-bottom:0.4rem;">' + opts.title + "</div>" : "") +
      '<div data-ref="bars"></div>' +
      '<div style="margin-top:0.4rem;">' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="toggle" aria-pressed="false"></button></div>' +
      '<p class="qed-demo__note" data-ref="caption" aria-live="polite"></p>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }

    function draw() {
      // Stacked layout (label + value above a full-width bar) so long labels
      // and values never force horizontal scrolling on narrow screens.
      ref("bars").innerHTML = items.map(function (it) {
        var accent = it.accent === "quantum" ? "logical" : it.accent;
        var width = Math.max(0, Math.min(1, model.fraction(it.value, max, scale))) * 100;
        return '<div class="qed-logbar">' +
          '<div class="qed-logbar__head"><span>' + it.label + "</span><strong>" + QedUI.human(it.value) + unit + "</strong></div>" +
          '<div class="qed-confidence-bar"><div class="qed-confidence-bar__fill' + (accent ? " qed-confidence-bar__fill--" + accent : "") +
          '" style="width:' + width + '%"></div></div>' +
          (it.note ? '<div class="qed-demo__note qed-logbar__note">' + it.note + "</div>" : "") + "</div>";
      }).join("");
      ref("toggle").textContent = scale === "log" ? "Switch to linear scale" : "Switch to logarithmic scale";
      ref("toggle").setAttribute("aria-pressed", scale === "linear" ? "true" : "false");
      ref("caption").textContent = scale === "log"
        ? "Logarithmic scale: each step along the bar is a factor of ten."
        : "Linear scale: bar length is proportional to the value. Compare how much smaller the shorter bars become.";
    }

    ref("toggle").addEventListener("click", function () {
      scale = scale === "log" ? "linear" : "log";
      draw();
    });
    draw();
  }

  QedComponents.register("log-bars", { mount: mount, model: model });
})();
