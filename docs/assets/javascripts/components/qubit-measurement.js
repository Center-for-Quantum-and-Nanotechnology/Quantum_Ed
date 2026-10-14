// Component: qubit-measurement
// Prepare a single qubit with θ/φ sliders, then measure it: one outcome,
// collapse to a pole, repeated measurements agree, and a "run N shots"
// tally that converges on the predicted probabilities. φ visibly does not
// change the odds.
//
//   <div data-qed-demo="qubit-measurement"></div>
//   Options: data-opt-theta (90), data-opt-phi (0), data-opt-shots (100)
//
// Used by: 01-foundations/what-is-quantum-computing.md (Measurement).
// Depends on: QedBloch, QedComponents, QedUI.
// Simplification: ideal readout; outcomes sampled with Math.random() from
// the textbook probabilities (not a state-vector simulation).
(function () {
  function mount(root, opts) {
    var id = QedComponents.uid("measure");
    var theta = opts.theta !== undefined ? opts.theta : 90;
    var phi = opts.phi !== undefined ? opts.phi : 0;
    var shotsPerRun = opts.shots !== undefined ? opts.shots : 100;

    root.innerHTML =
      '<div class="qed-demo__layout">' +
      '<canvas width="260" height="260" role="img" aria-label="Bloch sphere showing the qubit before measurement." data-ref="canvas"></canvas>' +
      '<div class="qed-demo__controls">' +
      '<label for="' + id + '-theta">θ — polar angle: <span data-ref="theta-value"></span></label>' +
      '<input type="range" id="' + id + '-theta" min="0" max="180" step="1" value="' + theta + '" data-ref="theta">' +
      '<label for="' + id + '-phi">φ — phase angle: <span data-ref="phi-value"></span></label>' +
      '<input type="range" id="' + id + '-phi" min="0" max="360" step="1" value="' + phi + '" data-ref="phi">' +
      '<div class="qed-demo__state"><div data-ref="state"></div></div>' +
      '<div style="margin-top:0.6rem;">' +
      '<button type="button" class="qed-button" data-ref="measure">Measure the qubit</button>' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="reprepare">Re-prepare qubit</button>' +
      "</div></div></div>" +
      '<div class="qed-error-demo__readout" data-ref="history" aria-label="Measurement history"></div>' +
      '<div class="qed-error-demo__feedback" data-ref="status" aria-live="polite"></div>' +
      '<p class="qed-demo__note" style="margin-top:1rem;">A single measurement says little about the probabilities. To estimate them, one needs many identically prepared qubits. This button prepares and measures ' +
      shotsPerRun + " fresh qubits in sequence:</p>" +
      '<button type="button" class="qed-button" data-ref="shots">Run ' + shotsPerRun + " shots</button>" +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="clear">Clear tally</button>' +
      '<div data-ref="bars" style="margin-top:0.6rem;"></div>' +
      '<p class="qed-demo__note" data-ref="tally" aria-live="polite"></p>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var canvas = ref("canvas");
    var collapsed = null; // null = prepared, not yet measured; else 0 or 1
    var history = [];
    var counts = [0, 0];
    var INITIAL = "Press <strong>Measure the qubit</strong> to obtain one outcome.";

    function drawState() {
      var s = QedBloch.state(theta, phi);
      if (collapsed === null) {
        QedBloch.render(canvas, theta, phi);
        ref("state").innerHTML = QedBloch.formatHTML(theta, phi) + "<br>P(0) = " + QedUI.pct(s.p0, 1) + " &nbsp; P(1) = " + QedUI.pct(s.p1, 1);
        canvas.setAttribute("aria-label", "Bloch sphere, qubit not yet measured. " + QedBloch.formatText(theta, phi));
      } else {
        QedBloch.render(canvas, collapsed === 0 ? 0 : 180, 0);
        ref("state").innerHTML = "|ψ⟩ = |" + collapsed + "⟩ &nbsp;(after measurement)";
        canvas.setAttribute("aria-label", "Bloch sphere. After measuring " + collapsed + ", the qubit is in the state " + collapsed + ".");
      }
    }

    function drawHistory() {
      ref("history").innerHTML = history.slice(-14).map(function (h) {
        return h === "new"
          ? '<span class="qed-pill qed-pill--neutral">↺ new qubit</span>'
          : '<span class="qed-pill"><span class="qed-pill__label">got</span>' + h + "</span>";
      }).join("");
    }

    function drawBars() {
      var total = counts[0] + counts[1];
      var s = QedBloch.state(theta, phi);
      var expected = [s.p0, s.p1];
      var html = "";
      for (var i = 0; i < 2; i++) {
        var share = total ? counts[i] / total : 0;
        html += QedUI.probRow("measured |" + i + "⟩", share, {
          accent: "quantum", marker: expected[i], labelWidth: "6.5rem", textWidth: "7rem",
          text: counts[i] + " (" + QedUI.pct(share, 1) + ")",
        });
      }
      ref("bars").innerHTML = html;
      ref("tally").textContent = total
        ? total + " shots so far. The dark tick on each bar marks the predicted probability; further runs bring the bars closer to it."
        : "No shots yet. After a run, a dark tick on each bar will mark the predicted probability.";
    }

    function redraw() { drawState(); drawHistory(); drawBars(); }

    function onSlider() {
      theta = parseInt(ref("theta").value, 10);
      phi = parseInt(ref("phi").value, 10);
      ref("theta-value").textContent = theta + "°";
      ref("phi-value").textContent = phi + "°";
      collapsed = null;
      history = [];
      counts = [0, 0];
      ref("status").innerHTML = INITIAL;
      redraw();
    }

    ref("measure").addEventListener("click", function () {
      var s = QedBloch.state(theta, phi);
      if (collapsed === null) {
        collapsed = Math.random() < s.p0 ? 0 : 1;
        history.push(collapsed);
        ref("status").innerHTML = "Outcome: <strong>" + collapsed + "</strong>. The qubit is now in the state |" + collapsed + "⟩, and the arrow has moved to the corresponding pole. Measure again.";
      } else {
        history.push(collapsed);
        ref("status").innerHTML = "Outcome: <strong>" + collapsed + "</strong> again. After a measurement the qubit remains in the measured state, so repeated measurements agree. Press <strong>Re-prepare qubit</strong> to start with a fresh qubit.";
      }
      redraw();
    });

    ref("reprepare").addEventListener("click", function () {
      collapsed = null;
      history.push("new");
      ref("status").innerHTML = "A fresh qubit, prepared in the state set by the sliders. This measurement may give a different result.";
      redraw();
    });

    ref("shots").addEventListener("click", function () {
      var s = QedBloch.state(theta, phi);
      for (var i = 0; i < shotsPerRun; i++) {
        if (Math.random() < s.p0) counts[0]++; else counts[1]++;
      }
      drawBars();
    });

    ref("clear").addEventListener("click", function () { counts = [0, 0]; drawBars(); });
    ref("theta").addEventListener("input", onSlider);
    ref("phi").addEventListener("input", onSlider);
    ref("status").innerHTML = INITIAL;
    onSlider();
  }

  QedComponents.register("qubit-measurement", { mount: mount });
})();
