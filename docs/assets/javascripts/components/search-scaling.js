// Component: search-scaling
// Unstructured search over N items: a classical computer needs about N/2
// checks on average; Grover's algorithm needs about (π/4)·√N queries.
// A second slider sets how much slower one quantum query is than one
// classical check, which exposes the break-even size N* = (π·k/2)²: a
// quadratic speedup only pays off once the problem is large enough.
//
//   <div data-qed-demo="search-scaling"></div>
//   Options: data-opt-max-exponent (largest log10 N, default 15)
//            data-opt-max-slowdown-exponent (largest log10 k, default 9)
//
// Used by: 01-foundations/why-quantum-computing.md (Problems Targeted).
// Model (pure, testable): model.classicalChecks(N), model.groverQueries(N),
//   model.breakEven(k).
// Simplification: a toy cost model (query counts × time per query); it
// ignores error-correction overhead and algorithmic details beyond that.
(function () {
  var model = {
    classicalChecks: function (N) { return N / 2; },
    groverQueries: function (N) { return (Math.PI / 4) * Math.sqrt(N); },
    breakEven: function (k) { return Math.pow((Math.PI * k) / 2, 2); },
  };

  function mount(root, opts) {
    var id = QedComponents.uid("search");
    var maxExp = opts.maxExponent !== undefined ? opts.maxExponent : 15;
    var maxSlow = opts.maxSlowdownExponent !== undefined ? opts.maxSlowdownExponent : 9;

    root.innerHTML =
      '<div class="qed-demo__controls" style="min-width:auto;">' +
      '<label for="' + id + '-n">Items to search, N = 10<sup data-ref="n-exp"></sup> = <span data-ref="n-val"></span></label>' +
      '<input type="range" id="' + id + '-n" min="2" max="' + maxExp + '" step="1" value="6" data-ref="n">' +
      '<label for="' + id + '-k">One quantum query takes <span data-ref="k-val"></span> as long as one classical check</label>' +
      '<input type="range" id="' + id + '-k" min="0" max="' + maxSlow + '" step="1" value="0" data-ref="k"></div>' +
      '<div style="margin-top:0.8rem;" data-ref="bars"></div>' +
      '<div class="qed-error-demo__feedback" data-ref="feedback" aria-live="polite"></div>' +
      '<p class="qed-demo__note">Times are in units of one classical check. Bars use a logarithmic scale. Toy model of unstructured search; ' +
      "real machines also pay error-correction overhead.</p>";

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var axisMax = maxExp + maxSlow + 1; // log10 upper bound for bar scaling

    function frac(t) { return Math.max(0, Math.log10(Math.max(t, 1))) / axisMax; }

    function update() {
      var e = parseInt(ref("n").value, 10);
      var ke = parseInt(ref("k").value, 10);
      var N = Math.pow(10, e);
      var k = Math.pow(10, ke);
      var tc = model.classicalChecks(N);
      var tq = model.groverQueries(N) * k;
      ref("n-exp").textContent = e;
      ref("n-val").innerHTML = QedUI.human(N);
      ref("k-val").innerHTML = ke === 0 ? "the same time" : "<strong>" + QedUI.human(k) + "×</strong>";
      ref("bars").innerHTML =
        QedUI.probRow("Classical", frac(tc), { labelWidth: "6.5rem", text: QedUI.sci(tc), textWidth: "7rem" }) +
        QedUI.probRow("Grover", frac(tq), { accent: "quantum", labelWidth: "6.5rem", text: QedUI.sci(tq), textWidth: "7rem" });
      var be = model.breakEven(k);
      var msg;
      if (tq < tc) msg = "The quantum search finishes first, by a factor of about <strong>" + QedUI.sci(tc / tq) + "</strong>.";
      else msg = "The classical search finishes first, by a factor of about <strong>" + QedUI.sci(tq / tc) + "</strong>.";
      ref("feedback").innerHTML = msg + " With this slowdown, quantum search only wins once N exceeds about <strong>" + QedUI.sci(be) + "</strong>.";
    }

    ref("n").addEventListener("input", update);
    ref("k").addEventListener("input", update);
    update();
  }

  QedComponents.register("search-scaling", { mount: mount, model: model });
})();
