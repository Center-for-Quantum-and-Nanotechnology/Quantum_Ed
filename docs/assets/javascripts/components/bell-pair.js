// Component: bell-pair
// Compares two ways of producing matching results for Alice and Bob:
// (a) classical pre-agreed labels ("a glove in each box") and (b) a Bell
// pair measured in the same basis. Both give identical statistics, which
// is the lesson: perfect agreement alone does not demonstrate
// entanglement. (bell-pair deliberately uses the same generator for both
// modes; see llm/FLAGS.md.)
//
//   <div data-qed-demo="bell-pair"></div>
//   Options: data-opt-pairs (pairs per click, default 10)
//
// Used by: 01-foundations/what-is-quantum-computing.md (Entanglement).
// Followed in that page by: chsh-game.
(function () {
  var CAPTIONS = {
    classical: "Each pair is prepared with a matching hidden label, like one glove placed in each of two boxes. The results agree because they were set up to agree.",
    quantum: "Each pair is an entangled Bell pair. Alice and Bob each measure their own qubit; neither qubit had a definite value beforehand.",
  };

  function mount(root, opts) {
    var perClick = opts.pairs !== undefined ? opts.pairs : 10;
    root.innerHTML =
      '<div style="text-align:center;">' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="mode-classical" aria-pressed="false">Pre-agreed coins (classical)</button>' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="mode-quantum" aria-pressed="false">Entangled pair (quantum)</button></div>' +
      '<p class="qed-demo__note" data-ref="caption" style="text-align:center;"></p>' +
      '<div style="text-align:center;">' +
      '<button type="button" class="qed-button" data-ref="send">Send ' + perClick + " pairs</button>" +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="reset">Reset</button></div>' +
      '<table class="qed-results-table" aria-label="Results of the last ' + perClick + ' pairs">' +
      "<thead><tr><th>Pair</th><th>Alice sees</th><th>Bob sees</th><th>Same?</th></tr></thead>" +
      '<tbody data-ref="body"></tbody></table>' +
      '<div class="qed-error-demo__feedback" data-ref="tally" aria-live="polite"></div>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var mode = "classical";
    var pairs = 0, matches = 0, aliceZeros = 0;

    function reset() {
      pairs = matches = aliceZeros = 0;
      ref("body").innerHTML = "";
      ref("tally").innerHTML = "Press <strong>Send " + perClick + " pairs</strong>.";
    }

    function setMode(m) {
      mode = m;
      ["classical", "quantum"].forEach(function (k) {
        var b = ref("mode-" + k);
        b.classList.toggle("qed-button--active", k === m);
        b.setAttribute("aria-pressed", k === m ? "true" : "false");
      });
      ref("caption").textContent = CAPTIONS[m];
      reset();
    }

    ref("send").addEventListener("click", function () {
      var rows = "";
      for (var i = 0; i < perClick; i++) {
        // Same question on both sides: each result is a fair coin and the two
        // always agree, in both the classical and the quantum model.
        var a = Math.random() < 0.5 ? 0 : 1;
        var b = a;
        pairs++;
        if (a === b) matches++;
        if (a === 0) aliceZeros++;
        rows += "<tr><td>" + (i + 1) + "</td><td>" + a + "</td><td>" + b + "</td><td>" + (a === b ? "✓" : "✗") + "</td></tr>";
      }
      ref("body").innerHTML = rows;
      ref("tally").innerHTML =
        "<strong>" + pairs + "</strong> pairs so far. Same result: <strong>" + matches + " of " + pairs + "</strong>. " +
        "Alice saw <code>0</code> in <strong>" + ((aliceZeros / pairs) * 100).toFixed(0) + "%</strong> of them: individually random, yet always matching Bob.";
    });
    ref("reset").addEventListener("click", reset);
    ref("mode-classical").addEventListener("click", function () { setMode("classical"); });
    ref("mode-quantum").addEventListener("click", function () { setMode("quantum"); });
    setMode("classical");
  }

  QedComponents.register("bell-pair", { mount: mount });
})();
