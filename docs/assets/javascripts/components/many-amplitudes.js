// Component: many-amplitudes
// An n-qubit equal superposition holds 2^n amplitudes, yet one measurement
// returns a single n-bit string. Shows the amplitude grid, a "prepare and
// measure" button, and a tally. Addresses the "quantum computers try all
// answers at once" misconception: the amplitudes are not outputs.
//
//   <div data-qed-demo="many-amplitudes"></div>
//   Options: data-opt-max-qubits (default 4), data-opt-qubits (initial, 3),
//            data-opt-shots (shots per run, default 100)
//
// Used by: 01-foundations/why-quantum-computing.md (Classical vs Quantum).
// Model (pure, testable): model.amplitude(n), model.label(index, n).
// Simplification: only the uniform superposition (Hadamard on every qubit);
// outcomes sampled with Math.random().
(function () {
  var model = {
    amplitude: function (n) { return 1 / Math.sqrt(Math.pow(2, n)); },
    label: function (index, n) {
      var s = index.toString(2);
      while (s.length < n) s = "0" + s;
      return s;
    },
  };

  function mount(root, opts) {
    var id = QedComponents.uid("amps");
    var max = opts.maxQubits !== undefined ? opts.maxQubits : 4;
    var shotsPerRun = opts.shots !== undefined ? opts.shots : 100;
    var n = opts.qubits !== undefined ? opts.qubits : 3;

    root.innerHTML =
      '<div class="qed-demo__controls" style="min-width:auto;">' +
      '<label for="' + id + '">Qubits in equal superposition, n: <strong data-ref="n"></strong></label>' +
      '<input type="range" id="' + id + '" min="1" max="' + max + '" step="1" value="' + n + '" data-ref="slider"></div>' +
      '<p class="qed-demo__note" data-ref="summary"></p>' +
      '<div class="qed-amp-grid" data-ref="grid" role="list"></div>' +
      '<div style="margin-top:0.6rem;">' +
      '<button type="button" class="qed-button" data-ref="measure">Prepare and measure once</button>' +
      '<button type="button" class="qed-button" data-ref="shots">Run ' + shotsPerRun + " shots</button>" +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="clear">Clear tally</button></div>' +
      '<div class="qed-error-demo__feedback" data-ref="feedback" aria-live="polite"></div>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var counts = [];
    var last = null;

    function resetTally() {
      counts = [];
      for (var i = 0; i < Math.pow(2, n); i++) counts.push(0);
      last = null;
    }

    function draw() {
      var size = Math.pow(2, n);
      var amp = model.amplitude(n);
      var total = counts.reduce(function (a, b) { return a + b; }, 0);
      ref("n").textContent = n;
      ref("summary").innerHTML = n + (n === 1 ? " qubit holds " : " qubits hold ") + "<strong>" + size + " amplitudes</strong>, each equal to " +
        QedUI.signed(amp) + ". Every outcome is equally likely: " + QedUI.pct(1 / size, size > 8 ? 1 : 0) + ".";
      var html = "";
      for (var i = 0; i < size; i++) {
        html += '<div class="qed-amp-cell' + (i === last ? " qed-amp-cell--hit" : "") + '" role="listitem">' +
          '<span class="qed-amp-cell__label">|' + model.label(i, n) + "⟩</span>" +
          '<span class="qed-amp-cell__amp">' + QedUI.signed(amp) + "</span>" +
          '<span class="qed-amp-cell__count">' + (total ? counts[i] + "×" : "&nbsp;") + "</span></div>";
      }
      ref("grid").innerHTML = html;
    }

    function sample() { return Math.floor(Math.random() * Math.pow(2, n)); }

    ref("slider").addEventListener("input", function () {
      n = parseInt(ref("slider").value, 10);
      resetTally();
      draw();
      ref("feedback").innerHTML = "The state is spread over all " + Math.pow(2, n) + " amplitudes. Measure it to see what comes out.";
    });
    ref("measure").addEventListener("click", function () {
      last = sample();
      counts[last]++;
      draw();
      ref("feedback").innerHTML = "Result: <strong>" + model.label(last, n) + "</strong>. One " + n + "-bit string out of " + Math.pow(2, n) +
        " possible. The other amplitudes did not produce any output; the measurement returned just " + n + (n === 1 ? " bit." : " bits.");
    });
    ref("shots").addEventListener("click", function () {
      for (var i = 0; i < shotsPerRun; i++) { last = sample(); counts[last]++; }
      draw();
      ref("feedback").innerHTML = "Each run of the circuit still yields a single string. Over many runs the results spread evenly across all " + Math.pow(2, n) + " outcomes.";
    });
    ref("clear").addEventListener("click", function () {
      resetTally();
      draw();
      ref("feedback").innerHTML = "Tally cleared.";
    });

    resetTally();
    draw();
    ref("feedback").innerHTML = "The state is spread over all " + Math.pow(2, n) + " amplitudes. Measure it to see what comes out.";
  }

  QedComponents.register("many-amplitudes", { mount: mount, model: model });
})();
