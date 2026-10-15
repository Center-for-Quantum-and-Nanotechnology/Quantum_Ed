// Shared model + explorer for the Module 05 software-stack diagram, used by
// docs/05-software-stack/understanding-the-quantum-software-stack.md and
// intended for the other Module 05 pages (representations, compilation,
// backends, runtime, workflows), which refer to the same responsibilities.
//
// Loaded site-wide via extra_javascript (like surface-code.js); a no-op on
// pages that don't call it. Page scripts that use window.QedSoftwareStack
// must run inside a DOMContentLoaded listener.
//
// Layers, kept apart (same convention as QedSurfaceCode / QedMatching):
//   model     -> RESPONSIBILITIES, GROUPS, RELATIONS, journey(path),
//                comparison(). Plain data and pure functions, no DOM.
//   rendering -> *HTML() functions that turn model data and a view state
//                into HTML strings.
//   wiring    -> mount(root, opts) holds the interaction state and attaches
//                handlers; it is the only part that touches the DOM.
//
// Everything here is an illustrative teaching model, not a claim about how
// any particular platform is built. Responsibilities may be combined,
// distributed, repeated, or ordered differently in real systems. No numeric
// calibration data appears anywhere in this model: telemetry fields, units,
// and values belong to a later page.
window.QedSoftwareStack = (function () {
  var PATHS = {
    simulator: { id: "simulator", label: "Simulator path" },
    hardware: { id: "hardware", label: "Hardware path" },
  };

  var GROUPS = {
    application: {
      label: "Application Layer",
      blurb: "How a program is described, transformed, coordinated, and returned as results.",
    },
    meeting: {
      label: "Where the groups meet",
      blurb: "How information about a device becomes available to application-facing software.",
    },
    target: {
      label: "Execution target",
      blurb: "The system selected to carry out the computation, whether simulated or physical.",
    },
    control: {
      label: "Control Layer",
      blurb: "Software that interfaces with and helps operate quantum devices, including calibration and the reporting of calibration telemetry.",
    },
  };

  // `label` may differ per path (the execution target). `onPath` lists the
  // paths where the responsibility takes part. `paths[...]` is what it does on
  // that path; `shared` says whether the responsibility is the same on both.
  var RESPONSIBILITIES = [
    {
      id: "program",
      label: "User program / application",
      group: "application",
      role: "Expresses the computation the user wants to perform.",
      onPath: ["simulator", "hardware"],
      shared: "shared",
      paths: {
        simulator: "The Bell-state circuit you wrote.",
        hardware: "The same Bell-state circuit.",
      },
    },
    {
      id: "representation",
      label: "Program representation",
      group: "application",
      role: "Expresses the computation in a form software can process.",
      onPath: ["simulator", "hardware"],
      shared: "shared",
      paths: {
        simulator: "The computation, in a form the software can process.",
        hardware: "The same computation, in a form the software can process.",
      },
    },
    {
      id: "compilation",
      label: "Compilation / transformation",
      group: "application",
      role: "Adapts or optimizes a representation for an intended target.",
      onPath: ["simulator", "hardware"],
      shared: "shared",
      paths: {
        simulator: "Adapts the computation to what the simulator accepts.",
        hardware: "Adapts the computation to what the device accepts.",
      },
    },
    {
      id: "runtime",
      label: "Runtime / orchestration",
      group: "application",
      role: "Coordinates execution, jobs, and exchanges with classical processing.",
      onPath: ["simulator", "hardware"],
      shared: "shared",
      paths: {
        simulator: "Submits the work to the simulator and tracks it until it finishes.",
        hardware: "Submits the work to the device and tracks it until it finishes.",
      },
    },
    {
      id: "results",
      label: "Results",
      group: "application",
      role: "Measurement data and other returned execution information, for further interpretation.",
      onPath: ["simulator", "hardware"],
      shared: "shared",
      paths: {
        simulator: "Measurement data returned to you.",
        hardware: "Measurement data returned to you.",
      },
    },
    {
      id: "backend",
      label: "Backend / target description",
      group: "meeting",
      role: "Communicates what a target can do and which constraints apply. It can also reflect reported device information.",
      onPath: ["simulator", "hardware"],
      shared: "differs",
      paths: {
        simulator: "Describes the simulator's capabilities and limits.",
        hardware: "Describes the device's capabilities and constraints, and may reflect its latest status report.",
      },
    },
    {
      id: "target",
      label: { simulator: "Simulator (execution engine)", hardware: "Quantum device" },
      group: "target",
      role: "Carries out a simulation or a physical computation.",
      onPath: ["simulator", "hardware"],
      shared: "differs",
      paths: {
        simulator: "A classical program that simulates the computation.",
        hardware: "A physical quantum device that runs the computation.",
      },
    },
    {
      id: "control",
      label: "Device control and calibration",
      group: "control",
      role: "Helps operate and tune a physical device, and collects information about its condition.",
      onPath: ["hardware"],
      shared: "hardware-only",
      paths: {
        simulator: "Not used: a simulator has no physical device to operate or calibrate.",
        hardware: "Operates and tunes the device, and reports on its condition.",
      },
    },
  ];

  // One entry per step on a path. `verb` is the short label the page uses.
  // `has` and `needs` say what information exists at that point and what the
  // next responsibility requires. All artifacts are fixed and illustrative.
  var STEPS = {
    program: {
      verb: "Write",
      artifact: "A Bell-state circuit: prepare two qubits together, then measure both.",
      has: "Your intent, expressed as a circuit in a programming tool.",
      needs: "A form that other software can process.",
    },
    representation: {
      verb: "Describe",
      artifact: "The same computation, written in a form software can process. What that form looks like is the subject of the next page.",
      has: "A description of the computation.",
      needs: "Knowledge of what the intended target can do.",
    },
    control: {
      verb: "Calibrate and report",
      artifact: "An illustrative device status report, with a time stamp. No values are shown here.",
      has: "The device's own record of its condition (calibration telemetry).",
      needs: "A way to reach the software that describes the target.",
    },
    backend: {
      verb: "Check target",
      artifact: {
        simulator: "The simulator's capabilities and limits.",
        hardware: "The device's capabilities and constraints, which may reflect the latest status report.",
      },
      has: {
        simulator: "What the simulator can accept.",
        hardware: "What the device can accept, and possibly a recent report on its condition.",
      },
      needs: "To adapt the program to what the target can do.",
    },
    compilation: {
      verb: "Adapt",
      artifact: {
        simulator: "A version of the computation adapted to the simulator.",
        hardware: "A version of the computation adapted to the device.",
      },
      has: "The description of the computation and the target's capabilities.",
      needs: "A way to submit the work and manage the run.",
    },
    runtime: {
      verb: "Coordinate",
      artifact: "A job: the adapted computation, sent to the target and tracked until it finishes.",
      has: "A computation that is ready to run.",
      needs: "A target that can carry it out.",
    },
    target: {
      verb: "Execute",
      artifact: {
        simulator: "A classical simulation engine carries out the computation.",
        hardware: "A physical quantum device carries out the computation.",
      },
      has: "The submitted job.",
      needs: "A way to send measurement data back.",
    },
    results: {
      verb: "Return",
      artifact: {
        simulator: "Measurement data for you to interpret. In this illustration, about half of the shots read 00 and about half read 11. Counts vary from run to run.",
        hardware: "Measurement data for you to interpret. In this illustration, about half of the shots read 00 and about half read 11. Counts vary from run to run, and a real device can also return other bit strings.",
      },
      has: "Measurement data from the run.",
      needs: "You: someone or something to interpret the data.",
    },
  };

  var ORDER = {
    simulator: ["program", "representation", "backend", "compilation", "runtime", "target", "results"],
    hardware: ["program", "representation", "control", "backend", "compilation", "runtime", "target", "results"],
  };

  // Relationships shown in the "interacting responsibilities" view. They are
  // possible, policy-dependent relationships, not guaranteed behavior.
  var RELATIONS = [
    {
      id: "target-info",
      title: "Target information informs program preparation",
      chain: ["TARGET INFORMATION", "INFORMS PROGRAM PREPARATION"],
      members: ["backend", "compilation"],
      onPath: ["simulator", "hardware"],
      note: "What a target can do may shape how a program is adapted, so information does not only flow top to bottom.",
    },
    {
      id: "runtime-span",
      title: "Runtime coordination spans several steps",
      chain: ["RUNTIME COORDINATION", "CONNECTS EXECUTION AND RESULTS"],
      members: ["runtime", "target", "results"],
      onPath: ["simulator", "hardware"],
      note: "Runtime coordination is involved in submission, execution, and the return of results, not in just one step.",
    },
    {
      id: "device-info",
      title: "Device-reported information may flow back",
      chain: ["DEVICE-REPORTED INFORMATION", "MAY INFORM THE BACKEND DESCRIPTION", "WHICH MAY INFORM PROGRAM PREPARATION"],
      members: ["control", "backend", "compilation"],
      onPath: ["hardware"],
      note: "A possibility, not a rule. Platforms differ in what they report, how often, and how software uses it. It is not automatic behavior.",
    },
  ];

  function byId(id) {
    for (var i = 0; i < RESPONSIBILITIES.length; i++) {
      if (RESPONSIBILITIES[i].id === id) return RESPONSIBILITIES[i];
    }
    return null;
  }

  function pick(value, path) {
    return value && typeof value === "object" ? value[path] : value;
  }

  function labelFor(r, path) {
    return pick(r.label, path);
  }

  function isOnPath(r, path) {
    return r.onPath.indexOf(path) !== -1;
  }

  // The illustrative journey on one path: an ordered list of steps.
  function journey(path) {
    return ORDER[path].map(function (id, i) {
      var r = byId(id);
      var s = STEPS[id];
      return {
        id: id,
        index: i,
        verb: s.verb,
        label: labelFor(r, path),
        group: r.group,
        artifact: pick(s.artifact, path),
        has: pick(s.has, path),
        needs: pick(s.needs, path),
      };
    });
  }

  // Rows for the simulator-vs-hardware comparison.
  function comparison() {
    return RESPONSIBILITIES.map(function (r) {
      return {
        id: r.id,
        simulatorLabel: labelFor(r, "simulator"),
        hardwareLabel: labelFor(r, "hardware"),
        group: r.group,
        simulator: r.paths.simulator,
        hardware: r.paths.hardware,
        shared: r.shared,
      };
    });
  }

  function neighbors(id, path) {
    var j = journey(path);
    for (var i = 0; i < j.length; i++) {
      if (j[i].id === id) {
        return { before: i > 0 ? j[i - 1] : null, after: i < j.length - 1 ? j[i + 1] : null, index: i };
      }
    }
    return null;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var SHARED_TEXT = {
    shared: "Shared by both paths",
    differs: "Same job, different content",
    "hardware-only": "Hardware path only",
  };

  // ---- rendering ---------------------------------------------------------

  // Static catalog of the responsibilities, grouped, for the "Meet the Stack"
  // section. Pure markup; no interaction.
  function catalogHTML() {
    var order = ["application", "meeting", "target", "control"];
    return (
      '<div class="qed-stack__catalog">' +
      order
        .map(function (g) {
          var items = RESPONSIBILITIES.filter(function (r) { return r.group === g; })
            .map(function (r) {
              var label = typeof r.label === "object" ? "Execution engine or device" : r.label;
              return "<li><strong>" + esc(label) + "</strong> — " + esc(r.role) + "</li>";
            })
            .join("");
          return (
            '<section class="qed-stack__group qed-stack__group--' + g + '">' +
            '<h4 class="qed-stack__group-title">' + esc(GROUPS[g].label) + "</h4>" +
            '<p class="qed-stack__group-blurb">' + esc(GROUPS[g].blurb) + "</p>" +
            "<ul>" + items + "</ul></section>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function comparisonHTML() {
    var rows = comparison()
      .map(function (r) {
        var name = r.simulatorLabel === r.hardwareLabel ? r.simulatorLabel : r.simulatorLabel + " / " + r.hardwareLabel;
        return (
          "<tr><td><strong>" + esc(name) + '</strong><br><span class="qed-stack__tag qed-stack__tag--' + r.group + '">' + esc(GROUPS[r.group].label) + "</span></td>" +
          "<td>" + esc(r.simulator) + "</td><td>" + esc(r.hardware) + "</td>" +
          '<td><span class="qed-stack__shared qed-stack__shared--' + r.shared + '">' + esc(SHARED_TEXT[r.shared]) + "</span></td></tr>"
        );
      })
      .join("");
    return (
      '<div class="qed-stack__scroll"><table class="qed-comparison-table qed-stack__compare"><caption class="qed-stack__caption">The same responsibilities on a simulator path and a hardware path</caption>' +
      '<thead><tr><th scope="col">Responsibility</th><th scope="col">On the simulator path</th><th scope="col">On the hardware path</th><th scope="col">Shared or different?</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table></div>"
    );
  }

  function cardHTML(r, view, order) {
    var path = view.path;
    var onPath = isOnPath(r, path);
    var step = order.indexOf(r.id);
    var cls = "qed-stack__card qed-stack__card--" + r.group;
    if (view.selected === r.id) cls += " is-selected";
    if (!onPath) cls += " is-inactive";
    if (view.related && view.related.indexOf(r.id) !== -1) cls += " is-related";
    if (view.stepIdx >= 0 && order[view.stepIdx] === r.id) cls += " is-current";
    if (view.stepIdx > step && step !== -1) cls += " is-visited";
    var badge = onPath ? '<span class="qed-stack__step">Step ' + (step + 1) + "</span>" : '<span class="qed-stack__step">Not used on this path</span>';
    return (
      '<button type="button" class="' + cls + '" data-id="' + r.id + '" aria-pressed="' + (view.selected === r.id ? "true" : "false") + '">' +
      badge + '<span class="qed-stack__card-label">' + esc(labelFor(r, path)) + "</span></button>"
    );
  }

  function panelHTML(view) {
    var path = view.path;
    var order = ORDER[path];
    var parts = [];
    if (view.note) parts.push('<p class="qed-stack__note">' + esc(view.note) + "</p>");
    if (!view.selected) {
      parts.push(
        '<p class="qed-stack__hint">Select a responsibility, or use <strong>Start the journey</strong> to follow the example from your program to its results. This diagram is a teaching model; real implementations can differ.</p>'
      );
      return parts.join("");
    }
    var r = byId(view.selected);
    var onPath = isOnPath(r, path);
    parts.push(
      '<p class="qed-stack__panel-title"><strong>' + esc(labelFor(r, path)) + "</strong> " +
      '<span class="qed-stack__tag qed-stack__tag--' + r.group + '">' + esc(GROUPS[r.group].label) + "</span></p>"
    );
    parts.push('<p><span class="qed-stack__field">Role</span> ' + esc(r.role) + "</p>");
    if (!onPath) {
      parts.push('<p><span class="qed-stack__field">On this path</span> ' + esc(r.paths[path]) + "</p>");
      return parts.join("");
    }
    var s = STEPS[r.id];
    var nb = neighbors(r.id, path);
    parts.push('<p><span class="qed-stack__field">In this example</span> <em>' + esc(s.verb) + ".</em> " + esc(pick(s.artifact, path)) + "</p>");
    parts.push('<p><span class="qed-stack__field">Information available here</span> ' + esc(pick(s.has, path)) + "</p>");
    parts.push('<p><span class="qed-stack__field">What comes next needs</span> ' + esc(s.needs) + "</p>");
    var rel = [];
    if (nb && nb.before) rel.push("Receives from: " + labelFor(byId(nb.before.id), path));
    if (nb && nb.after) rel.push("Hands to: " + labelFor(byId(nb.after.id), path));
    if (rel.length) parts.push('<p><span class="qed-stack__field">In the sequence</span> ' + esc(rel.join(". ")) + ".</p>");
    return parts.join("");
  }

  function relationsHTML(view) {
    return (
      '<div class="qed-stack__relations"><p class="qed-stack__relations-title"><strong>Relationships that are not a straight line</strong></p><ul>' +
      RELATIONS.map(function (rel) {
        var available = rel.onPath.indexOf(view.path) !== -1;
        var cls = "qed-stack__relation" + (view.activeRelation === rel.id ? " is-active" : "") + (available ? "" : " is-inactive");
        var chain = rel.chain.map(esc).join(" → ");
        return (
          "<li>" +
          '<button type="button" class="' + cls + '" data-relation="' + rel.id + '" aria-pressed="' + (view.activeRelation === rel.id ? "true" : "false") + '">' +
          '<span class="qed-stack__relation-title">' + esc(rel.title) + (available ? "" : " (hardware path only)") + "</span>" +
          '<span class="qed-stack__relation-chain">' + chain + "</span>" +
          (view.activeRelation === rel.id ? '<span class="qed-stack__relation-note">' + esc(rel.note) + "</span>" : "") +
          "</button></li>"
        );
      }).join("") +
      "</ul></div>"
    );
  }

  function explorerHTML(view, opts) {
    var path = view.path;
    var order = ORDER[path];
    var total = order.length;
    var started = view.stepIdx >= 0;
    var done = view.stepIdx >= total - 1;
    var cards = function (g) {
      return RESPONSIBILITIES.filter(function (r) { return r.group === g; })
        .sort(function (a, b) {
          var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        })
        .map(function (r) { return "<li>" + cardHTML(r, view, order) + "</li>"; })
        .join("");
    };
    var toolbar = [];
    toolbar.push('<div class="qed-demo__controls qed-stack__toolbar" role="group" aria-label="Execution path">');
    Object.keys(PATHS).forEach(function (p) {
      toolbar.push(
        '<button type="button" class="qed-button qed-button--secondary' + (view.path === p ? " qed-button--active" : "") +
        '" data-path="' + p + '" aria-pressed="' + (view.path === p ? "true" : "false") + '">' + esc(PATHS[p].label) + "</button>"
      );
    });
    toolbar.push("</div>");
    if (opts.modeToggle) {
      toolbar.push('<div class="qed-demo__controls qed-stack__toolbar" role="group" aria-label="Diagram view">');
      [["simple", "Simple learning view"], ["interacting", "Interacting responsibilities view"]].forEach(function (m) {
        toolbar.push(
          '<button type="button" class="qed-button qed-button--secondary' + (view.mode === m[0] ? " qed-button--active" : "") +
          '" data-mode="' + m[0] + '" aria-pressed="' + (view.mode === m[0] ? "true" : "false") + '">' + m[1] + "</button>"
        );
      });
      toolbar.push("</div>");
    }
    var stepper = [];
    if (opts.stepper) {
      stepper.push('<div class="qed-demo__controls qed-stack__toolbar" role="group" aria-label="Journey controls">');
      stepper.push('<button type="button" class="qed-button" data-action="back"' + (view.stepIdx <= 0 ? " disabled" : "") + ">← Back</button>");
      stepper.push(
        '<button type="button" class="qed-button" data-action="next"' + (done ? " disabled" : "") + ">" +
        (!started ? "Start the journey" : done ? "Journey complete" : "Next step →") + "</button>"
      );
      stepper.push('<button type="button" class="qed-button qed-button--secondary" data-action="reset">Reset</button>');
      stepper.push('<span class="qed-stack__progress" aria-live="polite">' + (started ? "Step " + (view.stepIdx + 1) + " of " + total : "Not started") + "</span>");
      stepper.push("</div>");
    }

    return (
      toolbar.join("") + stepper.join("") +
      '<div class="qed-stack__grid">' +
      '<section class="qed-stack__group qed-stack__group--application"><h4 class="qed-stack__group-title">Application Layer</h4><ol class="qed-stack__cards">' + cards("application") + "</ol></section>" +
      '<div class="qed-stack__side">' +
      '<section class="qed-stack__group qed-stack__group--meeting"><h4 class="qed-stack__group-title">Where the groups meet</h4><ul class="qed-stack__cards">' + cards("meeting") + "</ul></section>" +
      '<section class="qed-stack__group qed-stack__group--target"><h4 class="qed-stack__group-title">Execution target</h4><ul class="qed-stack__cards">' + cards("target") + "</ul></section>" +
      '<section class="qed-stack__group qed-stack__group--control"><h4 class="qed-stack__group-title">Control Layer</h4><ul class="qed-stack__cards">' + cards("control") + "</ul></section>" +
      "</div></div>" +
      '<div class="qed-stack__panel" aria-live="polite">' + panelHTML(view) + "</div>" +
      (view.mode === "interacting" ? relationsHTML(view) : "")
    );
  }

  // ---- wiring ------------------------------------------------------------

  // opts: { stepper: bool, modeToggle: bool, mode: "simple"|"interacting" }
  function mount(root, opts) {
    opts = opts || {};
    var view = {
      path: "simulator",
      stepIdx: -1,
      selected: null,
      mode: opts.mode || "simple",
      related: null,
      activeRelation: null,
      note: "",
    };

    function render() {
      root.innerHTML = explorerHTML(view, opts);
    }

    function select(id) {
      view.selected = id;
      view.note = "";
      var idx = ORDER[view.path].indexOf(id);
      if (idx !== -1 && opts.stepper) view.stepIdx = idx;
      view.related = null;
      view.activeRelation = null;
    }

    function setPath(p) {
      if (p === view.path) return;
      var keepId = view.selected;
      var before = view.path;
      view.path = p;
      view.activeRelation = null;
      view.related = null;
      var order = ORDER[p];
      view.stepIdx = -1;
      if (keepId && order.indexOf(keepId) !== -1) {
        view.stepIdx = opts.stepper ? order.indexOf(keepId) : -1;
      } else if (keepId && !isOnPath(byId(keepId), p)) {
        // keep it selected so its "not used on this path" message shows
        view.stepIdx = -1;
      }
      var gained = RESPONSIBILITIES.filter(function (r) { return isOnPath(r, p) && !isOnPath(r, before); });
      var lost = RESPONSIBILITIES.filter(function (r) { return isOnPath(r, before) && !isOnPath(r, p); });
      var msg = "Switched to the " + PATHS[p].label.toLowerCase() + ". The program, representation, compilation, runtime, and results responsibilities are shared; the execution target changes";
      if (gained.length) msg += ", and " + gained.map(function (r) { return labelFor(r, p); }).join(", ") + " now takes part";
      if (lost.length) msg += ", and " + lost.map(function (r) { return labelFor(r, before); }).join(", ") + " is not used";
      view.note = msg + ". This diagram is illustrative; real implementations can differ.";
    }

    root.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t || !root.contains(t)) return;
      var focusSel = null;
      if (t.dataset.id) {
        select(t.dataset.id);
        focusSel = 'button[data-id="' + t.dataset.id + '"]';
      } else if (t.dataset.path) {
        setPath(t.dataset.path);
        focusSel = 'button[data-path="' + t.dataset.path + '"]';
      } else if (t.dataset.mode) {
        view.mode = t.dataset.mode;
        view.activeRelation = null;
        view.related = null;
        view.note = "";
        focusSel = 'button[data-mode="' + t.dataset.mode + '"]';
      } else if (t.dataset.relation) {
        var rel = RELATIONS.filter(function (r) { return r.id === t.dataset.relation; })[0];
        var available = rel.onPath.indexOf(view.path) !== -1;
        if (!available) {
          view.note = "That relationship needs a physical device, so it appears on the hardware path only.";
          view.activeRelation = null;
          view.related = null;
        } else if (view.activeRelation === rel.id) {
          view.activeRelation = null;
          view.related = null;
          view.note = "";
        } else {
          view.activeRelation = rel.id;
          view.related = rel.members;
          view.note = "";
        }
        focusSel = 'button[data-relation="' + t.dataset.relation + '"]';
      } else if (t.dataset.action === "next") {
        var total = ORDER[view.path].length;
        if (view.stepIdx < total - 1) {
          view.stepIdx++;
          view.selected = ORDER[view.path][view.stepIdx];
          view.note = "";
          view.related = null;
          view.activeRelation = null;
        }
        focusSel = 'button[data-action="next"]';
      } else if (t.dataset.action === "back") {
        if (view.stepIdx > 0) {
          view.stepIdx--;
          view.selected = ORDER[view.path][view.stepIdx];
          view.note = "";
        }
        focusSel = 'button[data-action="back"]';
      } else if (t.dataset.action === "reset") {
        view.stepIdx = -1;
        view.selected = null;
        view.note = "";
        view.related = null;
        view.activeRelation = null;
        focusSel = 'button[data-action="reset"]';
      }
      render();
      // Re-rendering replaces the buttons; put focus back so keyboard users keep their place.
      if (focusSel) {
        var again = root.querySelector(focusSel);
        if (again && !again.disabled) again.focus();
      }
    });

    render();
    return { view: view, render: render };
  }

  return {
    PATHS: PATHS,
    GROUPS: GROUPS,
    RESPONSIBILITIES: RESPONSIBILITIES,
    RELATIONS: RELATIONS,
    journey: journey,
    comparison: comparison,
    catalogHTML: catalogHTML,
    comparisonHTML: comparisonHTML,
    mount: mount,
  };
})();
