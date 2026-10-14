// Component: chsh-game
// The CHSH game. A referee gives Alice a bit x and Bob a bit y; they win
// when a XOR b = x AND y. Any strategy built on pre-arranged answers or
// shared randomness wins at most 75% in the long run (proved on the page
// in a "Show the math" block); an entangled Bell pair with the measurement
// tilts below reaches cos²(π/8) ≈ 85.4%.
//
//   <div data-qed-demo="chsh-game"></div>
//   Options: data-opt-rounds (rounds per click, default 1000)
//
// Used by: 01-foundations/what-is-quantum-computing.md (Entanglement).
// Model (pure, testable): model.pSame(alphaDeg, betaDeg),
//   model.quantumWinProbability(), model.CLASSICAL_LIMIT.
// Simplification: quantum rounds are sampled from the Bell-pair
// prediction (each answer a fair coin, agreeing with probability
// cos²((α−β)/2)); this is not a state-vector simulation.
(function () {
  var ALICE_TILT = [0, 90];  // degrees, indexed by Alice's input x
  var BOB_TILT = [45, -45];  // degrees, indexed by Bob's input y

  var model = {
    CLASSICAL_LIMIT: 0.75,
    ALICE_TILT: ALICE_TILT,
    BOB_TILT: BOB_TILT,
    // Probability the two answers agree for measurement directions α, β.
    pSame: function (alphaDeg, betaDeg) {
      var d = ((alphaDeg - betaDeg) * Math.PI) / 180;
      return Math.pow(Math.cos(d / 2), 2);
    },
    // Exact win probability of the entangled strategy, averaged over inputs.
    quantumWinProbability: function () {
      var total = 0;
      for (var x = 0; x < 2; x++) {
        for (var y = 0; y < 2; y++) {
          var same = model.pSame(ALICE_TILT[x], BOB_TILT[y]);
          total += (x & y) ? 1 - same : same; // must differ only when x = y = 1
        }
      }
      return total / 4;
    },
  };

  function bit() { return Math.random() < 0.5 ? 0 : 1; }

  function playRound(kind) {
    var x = bit(), y = bit(), a, b;
    if (kind === "classical") {
      var r = bit(); // the shared random bit; both answer it
      a = r; b = r;
    } else {
      a = bit();
      b = Math.random() < model.pSame(ALICE_TILT[x], BOB_TILT[y]) ? a : 1 - a;
    }
    return (a ^ b) === (x & y);
  }

  function row(kind, title, accent, rounds) {
    return (
      '<div class="qed-chsh-row"><div class="qed-chsh-row__head"><strong>' + title + "</strong>" +
      '<button type="button" class="qed-button" data-ref="play-' + kind + '">Play ' + QedUI.grouped(rounds) + " rounds</button></div>" +
      '<div class="qed-confidence-row"><div class="qed-confidence-bar qed-confidence-bar--marked" role="img" aria-label="' + title + ' win rate" data-ref="bar-' + kind + '">' +
      '<div class="qed-confidence-bar__fill' + (accent ? " qed-confidence-bar__fill--logical" : "") + '" data-ref="fill-' + kind + '" style="width:0%"></div>' +
      '<div class="qed-confidence-bar__marker" style="left:calc(75% - 1px)"></div></div>' +
      '<span class="qed-confidence-row__pct" data-ref="pct-' + kind + '" style="flex-basis:4.5rem;">—</span></div>' +
      '<div class="qed-demo__note" data-ref="text-' + kind + '">No rounds played yet.</div></div>'
    );
  }

  function mount(root, opts) {
    var rounds = opts.rounds !== undefined ? opts.rounds : 1000;
    root.innerHTML =
      row("classical", "Plan made in advance (no entanglement)", false, rounds) +
      row("quantum", "Entangled pair", true, rounds) +
      '<p class="qed-demo__note">The dark tick on each bar marks <strong>75%</strong>, the highest long-run average any plan made in advance can reach.</p>' +
      '<button type="button" class="qed-button qed-button--secondary" data-ref="reset">Reset both</button>' +
      '<div class="qed-error-demo__feedback" data-ref="feedback" aria-live="polite"></div>';

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var tally = { classical: { rounds: 0, wins: 0 }, quantum: { rounds: 0, wins: 0 } };

    function show(kind) {
      var s = tally[kind];
      var rate = s.rounds ? s.wins / s.rounds : 0;
      ref("fill-" + kind).style.width = rate * 100 + "%";
      ref("pct-" + kind).textContent = s.rounds ? (rate * 100).toFixed(1) + "%" : "—";
      ref("text-" + kind).textContent = s.rounds ? s.wins + " wins in " + s.rounds + " rounds" : "No rounds played yet.";
    }

    function summary() {
      var c = tally.classical, q = tally.quantum;
      if (!c.rounds || !q.rounds) {
        ref("feedback").innerHTML = "Play each strategy a few times and compare the bars.";
        return;
      }
      ref("feedback").innerHTML =
        "Classical: <strong>" + ((c.wins / c.rounds) * 100).toFixed(1) + "%</strong> · Entangled: <strong>" + ((q.wins / q.rounds) * 100).toFixed(1) + "%</strong>. " +
        "Individual runs fluctuate, but the 75% limit applies to the long-run average. The entangled pair stays above it, which no plan made in advance can do.";
    }

    function play(kind) {
      var s = tally[kind];
      for (var i = 0; i < rounds; i++) {
        s.rounds++;
        if (playRound(kind)) s.wins++;
      }
      show(kind);
      summary();
    }

    ref("play-classical").addEventListener("click", function () { play("classical"); });
    ref("play-quantum").addEventListener("click", function () { play("quantum"); });
    ref("reset").addEventListener("click", function () {
      tally = { classical: { rounds: 0, wins: 0 }, quantum: { rounds: 0, wins: 0 } };
      show("classical"); show("quantum"); summary();
    });
    summary();
  }

  QedComponents.register("chsh-game", { mount: mount, model: model });
})();
