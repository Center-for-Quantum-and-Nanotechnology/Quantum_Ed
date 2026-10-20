// Test helper: load one of the site's shared browser modules in Node.
//
// The shared modules in docs/assets/javascripts/ assign a global
// (window.QedShots, window.QedSurfaceCode, ...). This evaluates a module file
// against a stub `window` and returns that stub, so a test can read
// `window.QedShots` exactly as a page script would.
//
// Only modules whose top level touches nothing but `window` can be loaded this
// way. That matches the repo convention that a module's logic and rendering
// layers are pure and its DOM wiring lives in page scripts. A module that needs
// `document` at load time (for example level.js) is not loadable here and is
// covered by browser verification instead.
const fs = require("node:fs");
const path = require("node:path");

const JS_DIR = path.resolve(__dirname, "..", "..", "docs", "assets", "javascripts");

function loadModule(fileName) {
  const source = fs.readFileSync(path.join(JS_DIR, fileName), "utf8");
  const window = {};
  new Function("window", source)(window);
  return window;
}

// Load several modules into ONE stub window, in the order given, so a module that
// calls another at run time (QedTrace calls QedGates, QedTwoQubit, QedQubit, and
// QedCircuit) can be tested with the real ones. The result is that shared window.
function loadModules(fileNames) {
  const window = {};
  fileNames.forEach((fileName) => {
    const source = fs.readFileSync(path.join(JS_DIR, fileName), "utf8");
    new Function("window", source)(window);
  });
  return window;
}

module.exports = { loadModule, loadModules };
