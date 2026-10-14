// QedComponents — the registry every reusable demo plugs into.
//
// A page uses a component with ONE line of HTML and no inline script:
//
//     <div data-qed-demo="qubit-measurement" data-opt-theta="45"></div>
//
// Each component file calls QedComponents.register(name, { mount, model }).
// On DOMContentLoaded this registry finds every [data-qed-demo] element,
// looks up the component by name, and calls mount(root, options).
//
// Why this exists (see llm/COMPONENTS.md for the full catalog):
//   * no per-page <script> blocks, so the "wrap in DOMContentLoaded"
//     gotcha from llm/FLAGS.md cannot recur;
//   * components build their own DOM and use root.querySelector, never
//     global ids, so one page can host several instances;
//   * options come from data-opt-* attributes, so pages configure a
//     component without touching its code.
//
// Load order (mkdocs.yml extra_javascript): registry.js and ui.js first,
// then bloch.js, then the individual component files.
window.QedComponents = (function () {
  var components = {};
  var counter = 0;
  var LEVELS = ["beginner", "intermediate", "advanced"];

  // component = { mount(root, options), model?: {...pure functions...} }
  function register(name, component) {
    if (components[name]) {
      console.warn("QedComponents: '" + name + "' registered twice; keeping the latest.");
    }
    components[name] = component;
  }

  // Unique id for label/for pairs and aria-describedby inside a component.
  function uid(prefix) {
    counter += 1;
    return (prefix || "qed") + "-" + counter;
  }

  // Experience levels (Project Vision, section 4) are cumulative. There is
  // no level selector yet; when one is added it only has to set
  // <html data-qed-level="intermediate"> and components marked with a
  // higher data-min-level will start appearing. Default: beginner.
  function currentLevel() {
    var l = document.documentElement.getAttribute("data-qed-level");
    return LEVELS.indexOf(l) >= 0 ? l : "beginner";
  }

  function levelAllowed(minLevel) {
    return LEVELS.indexOf(minLevel || "beginner") <= LEVELS.indexOf(currentLevel());
  }

  function camel(s) {
    return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }

  // data-opt-max-qubits="4" -> { maxQubits: 4 }. Numbers and booleans are
  // converted; "[...]" / "{...}" values are parsed as JSON.
  function parseOptions(root) {
    var options = {};
    Array.prototype.forEach.call(root.attributes, function (attr) {
      if (attr.name.indexOf("data-opt-") !== 0) return;
      var key = camel(attr.name.slice("data-opt-".length));
      var v = attr.value;
      if (v === "true") options[key] = true;
      else if (v === "false") options[key] = false;
      else if (v !== "" && !isNaN(Number(v))) options[key] = Number(v);
      else if (/^[\[{]/.test(v)) {
        try { options[key] = JSON.parse(v); } catch (e) { options[key] = v; }
      } else options[key] = v;
    });
    return options;
  }

  function mountAll(scope) {
    var roots = (scope || document).querySelectorAll("[data-qed-demo]");
    Array.prototype.forEach.call(roots, function (root) {
      if (root.getAttribute("data-qed-mounted")) return;
      var name = root.getAttribute("data-qed-demo");
      var component = components[name];
      if (!component) {
        root.textContent = "Unknown demo: " + name;
        root.className = "qed-demo__note";
        return;
      }
      if (!levelAllowed(root.getAttribute("data-min-level"))) {
        root.hidden = true;
        return;
      }
      root.classList.add("qed-demo");
      root.setAttribute("data-qed-mounted", "true");
      component.mount(root, parseOptions(root));
    });
  }

  document.addEventListener("DOMContentLoaded", function () { mountAll(document); });

  return {
    register: register,
    mountAll: mountAll,
    uid: uid,
    currentLevel: currentLevel,
    levelAllowed: levelAllowed,
    get: function (name) { return components[name]; },
  };
})();
