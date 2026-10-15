// Component: bloch-explorer
// A Bloch-sphere canvas with θ and φ sliders and a live readout of the
// state, amplitudes and measurement probabilities.
//
//   <div data-qed-demo="bloch-explorer"></div>
//   Options: data-opt-theta (default 90), data-opt-phi (default 0)
//
// Used by: 01-foundations/what-is-quantum-computing.md (Qubits).
// Depends on: QedBloch (bloch.js, a shared library one level up), QedComponents, QedUI.
(function () {
  function mount(root, opts) {
    var id = QedComponents.uid("bloch");
    var theta0 = opts.theta !== undefined ? opts.theta : 90;
    var phi0 = opts.phi !== undefined ? opts.phi : 0;

    root.innerHTML =
      '<div class="qed-demo__layout">' +
      '<canvas width="260" height="260" role="img" aria-label="Bloch sphere showing the current qubit state." data-ref="canvas"></canvas>' +
      '<div class="qed-demo__controls">' +
      '<label for="' + id + '-theta">θ — polar angle: <span data-ref="theta-value"></span></label>' +
      '<input type="range" id="' + id + '-theta" min="0" max="180" step="1" value="' + theta0 + '" data-ref="theta">' +
      '<label for="' + id + '-phi">φ — phase angle: <span data-ref="phi-value"></span></label>' +
      '<input type="range" id="' + id + '-phi" min="0" max="360" step="1" value="' + phi0 + '" data-ref="phi">' +
      '<div class="qed-demo__state">' +
      '<div data-ref="formula"></div>' +
      "<div>P(measure 0) = <span data-ref=\"p0\"></span> &nbsp;&nbsp; P(measure 1) = <span data-ref=\"p1\"></span></div>" +
      "</div></div></div>";

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var canvas = ref("canvas");

    function update() {
      var theta = parseInt(ref("theta").value, 10);
      var phi = parseInt(ref("phi").value, 10);
      var s = QedBloch.state(theta, phi);
      ref("theta-value").textContent = theta + "°";
      ref("phi-value").textContent = phi + "°";
      ref("formula").innerHTML = QedBloch.formatHTML(theta, phi);
      ref("p0").textContent = QedUI.pct(s.p0, 1);
      ref("p1").textContent = QedUI.pct(s.p1, 1);
      canvas.setAttribute("aria-label", "Bloch sphere. " + QedBloch.formatText(theta, phi));
      QedBloch.render(canvas, theta, phi);
    }

    ref("theta").addEventListener("input", update);
    ref("phi").addEventListener("input", update);
    update();
  }

  QedComponents.register("bloch-explorer", { mount: mount });
})();
