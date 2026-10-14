// Component: state-space-growth
// How much classical memory is needed to write down the state of n qubits.
// n classical bits are described by n values; n qubits need 2^n amplitudes.
// A slider (n) shows the amplitude count, the memory required, and what
// kind of machine that memory would take. This is the quantitative core of
// Feynman's argument for quantum computers (simulate quantum with quantum).
//
//   <div data-qed-demo="state-space-growth"></div>
//   Options: data-opt-max-qubits (default 60), data-opt-qubits (initial, 10),
//            data-opt-bytes-per-amplitude (default 16 = one complex128)
//
// Used by: 01-foundations/why-quantum-computing.md (Motivation).
// Model (pure, testable): model.amplitudes(n), model.memoryBytes(n, b),
//   model.describe(bytes).
// Caveat shown on the page: this is the GENERAL case (full state vector).
// States with special structure can be simulated far more cheaply.
(function () {
  var model = {
    amplitudes: function (n) { return Math.pow(2, n); },
    memoryBytes: function (n, bytesPerAmplitude) { return Math.pow(2, n) * (bytesPerAmplitude || 16); },
    // Reference scales are decimal: 16 GB laptop, 1 TB server, 1 PB cluster.
    describe: function (bytes) {
      if (bytes <= 16e9) return "Fits in the memory of an ordinary laptop (16 GB).";
      if (bytes <= 1e12) return "Needs a large server (up to about 1 TB of memory).";
      if (bytes <= 1e15) return "Needs the combined memory of a large cluster (up to about 1 PB).";
      if (bytes <= 2e16) return "On the scale of the total memory of the largest supercomputers.";
      return "More memory than any computer built today has.";
    },
  };

  function mount(root, opts) {
    var id = QedComponents.uid("space");
    var max = opts.maxQubits !== undefined ? opts.maxQubits : 60;
    var start = opts.qubits !== undefined ? opts.qubits : 10;
    var bpa = opts.bytesPerAmplitude !== undefined ? opts.bytesPerAmplitude : 16;

    root.innerHTML =
      '<div class="qed-demo__controls" style="min-width:auto;">' +
      '<label for="' + id + '">Number of qubits, n: <strong data-ref="n"></strong></label>' +
      '<input type="range" id="' + id + '" min="1" max="' + max + '" step="1" value="' + start + '" data-ref="slider"></div>' +
      '<div class="qed-compare-row" style="align-items:stretch; margin-top:0.8rem;">' +
      '<div class="qed-panel"><div class="qed-panel__title">n classical bits</div>' +
      '<div class="qed-panel__state">n numbers (each 0 or 1)</div>' +
      '<div class="qed-stat"><span class="qed-stat__value" data-ref="bit-mem"></span><span class="qed-stat__label">to store</span></div></div>' +
      '<div class="qed-panel qed-panel--quantum"><div class="qed-panel__title">n qubits (general state)</div>' +
      '<div class="qed-panel__state">2<sup>n</sup> = <span data-ref="amps"></span> amplitudes</div>' +
      '<div class="qed-stat"><span class="qed-stat__value" data-ref="q-mem"></span><span class="qed-stat__label">to store on a classical computer</span></div></div></div>' +
      '<div data-ref="scale" style="margin-top:0.8rem;"></div>' +
      '<div class="qed-error-demo__feedback" data-ref="feedback" aria-live="polite"></div>' +
      '<p class="qed-demo__note">Memory assumes ' + bpa + ' bytes per amplitude (one double-precision complex number). The bar uses a logarithmic scale.</p>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }

    function update() {
      var n = parseInt(ref("slider").value, 10);
      var bytes = model.memoryBytes(n, bpa);
      ref("n").textContent = n;
      ref("amps").innerHTML = QedUI.human(model.amplitudes(n));
      ref("bit-mem").textContent = n <= 8 ? "1 byte" : QedUI.bytes(Math.ceil(n / 8));
      ref("q-mem").textContent = QedUI.bytes(bytes);
      // log scale: 16 bytes (n=0 floor) up to the memory at max n
      var maxBytes = model.memoryBytes(max, bpa);
      var frac = Math.log10(bytes / bpa + 1) / Math.log10(maxBytes / bpa + 1);
      ref("scale").innerHTML = QedUI.probRow("Memory", frac, { accent: "quantum", labelWidth: "4rem", text: QedUI.bytes(bytes), textWidth: "6rem" });
      ref("feedback").textContent = model.describe(bytes);
    }

    ref("slider").addEventListener("input", update);
    update();
  }

  QedComponents.register("state-space-growth", { mount: mount, model: model });
})();
