# Engineering conventions

How interactive code is organized on this site. The [Project Vision](../context_docs/vision/ProjectVision.md) (§14 Reusable Architecture, §15 Maintainability, §16 Existing Project First) sets the principle: reuse components, keep logic separate from visualization, avoid one-off pages. This file is the practical "how", so that every contributor and every Claude session builds the same way.

Read this before writing any page script. Log deviations in [`FLAGS.md`](FLAGS.md).

---

## 1. Where code lives

| Kind of code | Location | Loaded by |
|---|---|---|
| Logic or rendering that a **second page could plausibly use** | `docs/assets/javascripts/<name>.js`, exposed as `window.Qed<Name>` | `extra_javascript` in `mkdocs.yml` (site-wide) |
| Wiring for **one page**: reading sliders, toggling buttons, updating text | An inline `<script>` at the bottom of that page's `.md` | The page itself |
| Styles | `docs/assets/stylesheets/extra.css`, `qed-` prefixed classes | `extra_css` |
| Learner-facing vocabulary | `data/glossary/*.yml` (never hand-edit `docs/glossary.md`) | `glossary_hook.py` |
| Tests for shared-module logic | `tests/js/<name>.test.js` | `node --test` (run from `tests/js`) |
| Tests for the build hooks | `tests/python/test_<name>.py` | `python -m unittest discover -s tests/python` |

MkDocs pages are separate documents, not a single-page app, so a shared module has to be loaded on every page. A module must therefore be a **no-op on pages that don't use it**.

## 2. When to extract a shared module

Extract when **any** of these is true:

- A later section in the taxonomy will plausibly show the same object (a Bloch sphere, a code lattice, a decoding graph, a circuit, a noise slider).
- The page needs the same logic twice (for example, two views of one data structure).
- The Vision §14 list names it: qubit representations, quantum-state displays, error injection, syndrome displays, stabilizer representations, circuit views, probability/noise controls, code lattices, decoder visualizations, reset controls, educational callouts.

Don't extract when the code is genuinely one page's DOM wiring, or when the "second use" is speculative and no section in the taxonomy would use it. Vision §15 warns against "excessive abstraction without educational benefit". If unsure, keep it page-local and note a migration candidate in `FLAGS.md`.

**Before writing a new component, check the table in section 4 and the existing files.** Vision §16: don't assume a new component is needed.

## 3. How a shared module is built

Follow the existing modules (`surface-code.js`, `matching.js`, `lattice-surgery.js`).

1. **File and global.** `docs/assets/javascripts/<kebab-name>.js` defines `window.Qed<PascalName> = (function () { ... return { ... }; })();`.
2. **Header comment.** Say which pages use it, that it is loaded site-wide, and that it is a no-op elsewhere.
3. **Three layers, kept apart** (Vision §14: error model ≠ decoder ≠ visualization):
   - **Data/state**: pure functions of their inputs (`buildLattice(d)`, `state(theta, phi)`). No DOM.
   - **Rendering**: pure functions that take data and return SVG or draw on a canvas (`renderSVG(scene, opts)`). Visual layout coordinates stay separate from logical coordinates, so changing the layout can't silently change the logic.
   - **DOM wiring**: left to each page, or an optional `mount(...)` helper when several pages wire it identically. The module never reaches for page-specific elements.
4. **Data, not hard-coded layouts.** Represent lattices, graphs and patches as data so another distance, size or code can reuse the renderer. Reserve fields for known future variants (`type: "boundary"`), and note it in a comment.
5. **Deterministic by default.** Educational models, not simulators (Vision §15). Randomness, if any, must be visible to the learner and labelled as simulated.
6. **Compose, don't copy.** A module that builds on another calls it (`lattice-surgery.js` uses `QedSurfaceCode.buildLattice`). Duplicated drawing code is a migration candidate.
7. **Register it.** Add the file to `extra_javascript` in `mkdocs.yml`. **Order matters**: a module must be listed after anything it depends on, and all of them before `mathjax.js`.
8. **Document it.** Add a row to the table in section 4 of this file, and a line in `FLAGS.md` if it changes or supersedes earlier work.

## 4. Existing shared components

Keep this table current. It is the first thing to check before building.

| Global | File | Public API | Used by |
|---|---|---|---|
| `QedSurfaceCode` | `surface-code.js` | `buildLattice`, `computeSyndrome`, `anticommutes`, `renderSVG`, `mount` | Surface Codes, MWPM, Hardware-Aware QEC, Lattice Surgery |
| `QedMatching` | `matching.js` | `edgeKey`, `manhattan`, `allPerfectMatchings`, `matchingWeight`, `buildWeights`, `solveMWPM`, `renderGraphSVG` | Minimum-Weight Perfect Matching |
| `QedLatticeSurgery` | `lattice-surgery.js` | `STAGE_ORDER`, `buildScene`, `renderSVG`, `mount` | Lattice Surgery |
| `QedCircuit` | `circuit.js` | Drawing: `bell`, `describe`, `renderSVG(circuit, opts)`, `qubitName`. Ops: `h`, `cx`, `measure`, and a generic labelled single-qubit `gate`; `opts.neutral` draws gate boxes in the neutral line color; `opts.highlight` (an array of op `id`s; an empty array reserves the label room) marks those ops with a dashed outline and a text label such as "CNOT, step 2", and `opts.highlightLabels` overrides the label. Data layer (pure, no dependencies): `emptyCircuit(columns)`, `opAt`, `validate` (the builder's rules, as plain sentences), `place` and `remove` (return a new circuit; `place` refuses with a reason), `columns`, `summarize`. A builder op has a column (`col`) and, for a gate, a `gateId` that links it to `QedGates` | Understanding the Quantum Software Stack, 02.04 Quantum Gates, 02.05 Multi-Qubit Systems, 02.06 Quantum Circuits. Without a generic gate op and without `neutral` the drawing is unchanged (a test pins the Bell drawing byte for byte) 05.02 Quantum Program Representations (op `id` and `highlight`; a circuit without `highlight` is drawn exactly as before, which the same hash test pins) |
| `QedSoftwareStack` | `software-stack.js` | `RESPONSIBILITIES`, `GROUPS`, `RELATIONS`, `journey`, `comparison`, `catalogHTML`, `comparisonHTML`, `mount` | Understanding the Quantum Software Stack |
| `QedProgramForms` | `program-forms.js` | `bell`, `withIds`, `instructionList`, `dependencies`, `mustFollow`, `mustPrecede`, `independentPairs`, `levels`, `positions`, `opLabel`, `correspondenceText`, `dependencyText`, `sourceFormLines`, `sameComputation`, `differences`, `differenceText`, and the renderers `instructionListHTML` (optional `tags`, a text tag after chosen lines), `dependencyGraphSVG`, `dependencyTextHTML`, `sourceFormHTML` | 05.02 Quantum Program Representations; 05.03 Compilation and Transpilation (the original and adapted circuits' instruction lists, with `tags`); planned: 05.06 (the form of a job), 05.07. One computation as operations with ids (the shape QedCircuit draws) and the forms derived from it. An operation depends on the previous operation on each qubit it uses. Pure; does not call QedCircuit. The forms are illustrative teaching forms, not real formats |
| `QedTransform` | `transform.js` | `TARGETS` (three invented targets as data: `open`, `one-way`, `rotations`, each with `allows` and `synthetic: true`), `targetById`, `adapt(circuit, target)` (the circuit, the steps in words, any problems), `optimize(circuit)` (cancels adjacent pairs that undo themselves), `cost(circuit)` (operations, two-qubit operations, measurements), `changes(before, after)`, `transform(circuit, target)` (everything the page shows, in one call), `opText`, `directionsText` | 05.03 Compilation and Transpilation; planned: 05.04 (a target's description grows into a backend description), 05.07. Exactly three rewrites: H as three turns (equal up to a global phase), a CNOT turned round (exact), and cancelling a pair that undoes itself (exact). Pure and dependency-free: it works on the `{ qubits, ops }` shape QedCircuit draws, and `tests/js/transform.test.js` proves each rule against `QedTrace` with `loadModules`. Two qubits only; routing is Intermediate |
| `QedBackend` | `backend.js` | `FIELDS` (the telemetry field catalog: id, label, unit, scope, meaning, qualification), `CONTROL_SETTINGS`, `SIMULATOR` and `DEVICE` (synthetic descriptions as data; the device has four qubits in a line and two snapshots), `POLICIES` (two stated ranking rules), `capabilities(target, { names })` (plain strings; accepts a `QedTransform` target as it is), `report`, `reportFor(device, snapshotId, { qubit } or { pair })`, `change(device, fromId, toId)` (size and effect per value), `ageText`, `choosePair(device, snapshotId, policyId)` (a ranking of reported numbers, never a prediction; a missing value is reported, not guessed), `deviceSVG`, `fieldTableHTML` | 05.04 Hardware Abstraction and Backend Capabilities; planned: 05.06 (a job is sent to a described target) and 05.07. Everything in it is synthetic and hand-authored, not from any real device. The capability part has the same `allows` shape as `QedTransform` targets. Pure and dependency-free; `tests/js/backend.test.js` pins the properties the page claims about the data (every qubit differs, one large change, some improvements, one value not reported, the best pair changes under one policy, and the policies disagree in the earlier snapshot) |
| `QedSimMethods` | `sim-methods.js` | `MAX_RUN` (10), `METHODS` (state vector, stabilizer, tensor network: what each keeps, handles, is driven by, gives back), `FAMILIES`, `circuit(family, n, depth)`, `stateVector(circuit, start)` (an n-qubit engine, n up to 10), `stabilizer(circuit)` (a (2n)(2n+1)-bit table for H, S, X, Z, and CNOT; refuses anything else and names the first), `stabilizes(state, rule)`, `cutRank` and `maxCutRank` (entanglement across a cut, from the real state), `linkBound`, `sizes(method, family, n, depth)` and `compare(family, n, depth)` (what a method keeps, tagged `computed` when an engine ran and `estimated` when it comes from the formula), `amplitudeTableHTML`, `rulesHTML`, `chainSVG` | 05.05 Simulation Engines and Methods; planned: 05.06 (the run of a circuit on a simulator target) and 05.07. A teaching model, not a simulator you would use: it measures SIZE (what a method keeps), never speed, and has no tensor-network engine (the link size is the computed entanglement across each cut). Calls `QedGates` at run time for the single-qubit matrices and nothing else; tested with `loadModules` against `QedTrace`, and the stabilizer engine is cross-checked against the state-vector engine |
| `QedShots` | `shots.js` | `rng`, `sample`, `session`, `defaultLabels`, `describe`, `renderBars(rows)` (a row is `{ label, fraction, text }`; optional `accent`, `marker`, `labelWidth`, `textWidth`, and trusted `textHtml`), `renderHTML`, `repeat(probs, shots, experiments, random)`, `spread(repeated, outcome)`, `expectedSpread(p, shots)` | Module 02 pages with repeated measurements or probability bars (02.01, 02.02 to 02.07). `repeat`, `spread`, and `expectedSpread` (the 1/√N spread) are pure and used by 02.07's Intermediate spread view |
| `QedNumbers` | `numbers.js` | `pct`, `signed`, `grouped`, `sci`, `human`, `bytes` | Module 01 pages that show large quantities (Why Quantum Computing?, Quantum Computing Today). Pure formatters; `sci` and `human` return HTML (a superscript), so use `innerHTML` or `renderBars`'s `textHtml` |
| `QedQubit` | `qubit.js` | `real`, `complex`, `fromPolar`, `modulus`, `phase`, `probabilities`, `norm2`, `isNormalized`, `isReal`, `normalize`, `relativePhase`, `applyGlobalPhase`, `format`, `formatAmplitude`, `innerProduct`, `fromBloch`, `toBloch`, `blochVector`, `validity`, `nameOf`, `PRESETS` (six named states, each with a `real` flag) | Module 02 single-qubit pages (02.02, 02.03, 02.04, 02.07) |
| `QedGates` | `gates.js` | `GATES` (I, X, Y, Z, H, S, T), `gate`, `rotation(axis, angleDeg)`, `apply`, `compose` (first gate first; the matrix product reads right to left), `inverse`, `isUnitary` (any size), `blochRotate`, `blochPartial`, `describe`, `kron` (first factor acts on q0), `controlled` (control q0, target q1), `identity`, `CNOT` (the 4×4 matrix in the order 00, 01, 10, 11), `cnot(controlWire)` (CNOT with either wire as the control), `AXES` | 02.04 Quantum Gates; 02.05 Multi-Qubit Systems (CNOT), 02.06 Quantum Circuits (the builder's palette and CNOT in either direction); 02.07 Measurement (the basis-change gates, through `QedTrace.basisGates`). One qubit only. Operations, not state (`QedQubit`) and not drawing (`QedBloch`, `QedCircuit`). Each gate has a matrix and a Bloch rotation (axis, angle) that a test keeps in agreement |
| `QedTwoQubit` | `twoqubit.js` | `LABELS`, `real`, `product(a, b)`, `probabilities`, `norm2`, `isNormalized`, `marginals`, `independentTable`, `applyToQubit(gate, qubit, state)`, `apply(matrix, state)`, `separability`, `isProduct`, `factor` (the two one-qubit states of a product state, or null), `passesProductTest`, `BELL` (the four Bell states), `bellOf`, `measureQubit(state, wire, outcome)` (the probability of that outcome and the state after it), `measure(state, wires, random)` (draws each wire's outcome in turn from the chances at that moment; the random function is passed in), `format`, `describe` | 02.05 Multi-Qubit Systems; 02.06 Quantum Circuits (through `QedTrace`); 02.07 Measurement (the measurement rule and the update after it). Exactly two qubits. A state is `[c00, c01, c10, c11]`; the left digit is q0 (control, top wire). Does not call `QedQubit` or `QedGates`: it takes their matrices as arguments |
| `QedTrace` | `trace.js` | `run(circuit, initial)`, `columnMatrix(ops)`, `describeState(state)`, `gateOf(op)` (a gate id `sdg` is S†), `basisGates(basis, wire, col)` (the gates to put before a Z-basis measurement to read the X or Y basis), `sameState(a, b, initial)` (the final states of two circuits are the same up to a global phase) | 02.06 Quantum Circuits; 02.07 Measurement (the state a short circuit prepares, and the basis-change gates); 05.03 Compilation and Transpilation (`sameState`, the check that a rewrite kept the state). Runs a two-wire circuit (plain data from `QedCircuit`) through `QedGates` and `QedTwoQubit` and returns the state after every step, with probabilities, a name for the state, and each step's 4×4 matrix. A measurement op marks its wire and does not change the state. **The one shared module that calls others** (`QedGates`, `QedTwoQubit`, `QedQubit`, `QedCircuit`), at run time; it is tested with `loadModules` |
| `QedBloch` | `bloch.js` | `state`, `formatHTML`, `formatText`, `project`, `render(canvas, theta, phi, opts)` | What Is Quantum Computing? (Module 01), 02.03 Bloch Sphere. Draws and projects only; the state math is `QedQubit`'s. `opts` (all optional, off by default): `color`, `neutral`, `axes`, `markers`, `pinned`, `projection`, `depth` |
| `QedQuiz` | `quiz.js` | `validate`, `check`, `mount` | Module 02 pages with multiple-choice checks (02.01 to 02.07) |
| `QedLevel` | `level.js` | `LEVELS`, `get`, `set`, `atLeast`, `rank`, `onChange`; also builds the header selector, page note, TOC filtering and hash auto-reveal | Every page (site-wide) |
| (none) | `download.js` | Adds the module-download button | Every page |
| (none) | `glossary.js` | Text filter and deep-link reveal | Glossary |
| (none) | `mathjax.js` | MathJax configuration | Every page |

Known duplication: `errors-and-noise.md` still carries a page-local Bloch-sphere drawing. `QedBloch` is now on `main`, so migrate that page onto it when it is next touched.

**Bloch picture, who does what.** `QedQubit` is the source of truth for a state and converts it to and from Bloch angles and the Bloch vector (`fromBloch`, `toBloch`, `blochVector`, in degrees). `QedBloch` only projects and draws a point given by angles, and does not depend on `QedQubit`. `tests/js/bloch.test.js` checks that the two agree, so neither can drift.

## 5. Rules every page script follows

- **Wrap in `DOMContentLoaded`.** Material injects `extra_javascript` after inline page content, so `window.Qed*` doesn't exist when an unwrapped inline script runs.
  ```js
  document.addEventListener("DOMContentLoaded", function () {
    var QSC = window.QedSurfaceCode;
    // ...
  });
  ```
- **No framework, no build step, no new dependency** without a discussion. Plain JS (ES5-style `var`/`function`, matching the existing files), inline SVG or canvas.
- **Never `innerHTML` with anything but numbers or your own constants.** Use `textContent` for anything that could contain user or data-supplied text.
- **Accessibility.** Canvas gets `role="img"` and an `aria-label` that updates with state. Never convey meaning by color alone: pair it with shape, hatching, a label or a sign. Interactive controls are real `<button>`/`<input>` elements and keyboard-operable.
- **Reset controls.** Interactive demos get a reset (Vision §14).

## 6. CSS and markup conventions

- All classes are `qed-` prefixed. Append new sections to `extra.css` with a comment header, and reuse existing classes (`qed-button`, `qed-details`, `qed-panel`, ...) before inventing new ones.
- **Colors come from tokens** on `:root` (`--qed-color-logical`, `-physical`, `-error`, `-noise`, `-syndrome`, `-protected`, `-telemetry`), never hard-coded hex. In canvas code, read them with `getComputedStyle`.
- **Visual language** (Vision §13): blue = logical, gray = physical, red/orange = error or noise, purple = syndrome/check, green = protection or recovery, teal with a dashed border = calibration/telemetry data. Don't change a meaning between pages.
- **Toggle buttons.** Every toggle button carries `qed-button--secondary` permanently; the one selected at load also gets `qed-button--active`. Never `--active` alone, or it looks selected after the first switch.
- **`<details class="qed-details">` needs `markdown="1"`**, or the Markdown inside is not processed.
- **Glossary-heavy pages.** When a page introduces reusable vocabulary, follow the workflow in [`README.md`](../README.md#glossary): reuse entries, add only reusable terms, and add the page to each relevant entry's `moduleReferences`.

## 7. Experience levels

Beginner, Intermediate and Advanced are **cumulative views of one canonical page**, never separate pages (Vision §3, §4, §6). A single selector in the header sets the level site-wide. It is remembered in the browser, defaults to Beginner, and follows the learner across modules.

**Marking content.** Wrap anything above Beginner in a gated block:

```html
<div class="qed-level" data-min-level="intermediate" markdown="1">

## A heading, text, an equation, or an interactive

</div>
```

- Allowed values are `intermediate` and `advanced`. Untagged content is Beginner and always visible.
- `markdown="1"` is required, as with `qed-details`. `level_hook.py` fails `mkdocs build --strict` on a misspelled level or a missing `markdown="1"`.
- Each shown block gets a text badge and a border (single bar for Intermediate, double for Advanced), so the level never relies on color alone.
- Intermediate shows Beginner + Intermediate; Advanced shows all three. A page with nothing at the chosen level shows its Beginner content and a short note.
- Headings inside a gated block get normal ids. The table of contents hides entries for hidden headings, and a link or search result that lands on hidden content raises the level automatically.

**What may be gated.** Never gate anything a learner needs for the page's Core Learning Contract. Gate depth: formal notation, derivations, larger examples, implementation detail. A page's Beginner list in its spec is its contract.

**Levels are not "Explore" blocks.** Optional exploration (`qed-details`) can be opened by anyone at any level and is a separate feature (Vision §7). Do not use one for the other.

**Level-aware components.** An interactive may read `QedLevel.get()` or `QedLevel.atLeast("intermediate")` and subscribe with `QedLevel.onChange(fn)` to show deeper detail (for example complex amplitudes). Its Beginner behavior must not depend on the level. The first is the 02.02 amplitude editor, which swaps real-amplitude controls for magnitude and phase controls at Intermediate.

**Search.** The search index is built once and cannot know the level, so gated text is indexed on purpose. A hit on hidden content raises the level on arrival (see `FLAGS.md`).

## 8. Tests

Automated tests cover the **pure layers**: shared-module logic and rendering strings, and the build hooks. DOM wiring and page layout stay covered by browser verification.

**JavaScript (`tests/js/`).** Zero dependencies: Node's built-in runner and `node:assert`. There is no `package.json` and no `node_modules`.

```bash
cd tests/js
node --test
```

- One `<module>.test.js` per shared module. `load.js` evaluates a module file against a stub `window` and returns it, so a test reads `window.QedShots` exactly as a page script would. `loadModules([...])` loads several modules into one stub window, for a module that calls others at run time (`QedTrace`).
- Only modules whose top level touches nothing but `window` can be loaded this way. A module that needs `document` at load time (for example `level.js`) is verified in the browser instead.
- Test the model, not the markup: determinism, totals, validation, labels and text. A rendering function can be checked for the strings it must contain.
- Keep tests deterministic. Use seeded generators (see `QedShots`) and tolerances that hold across seeds.
- When you fix a bug in a shared module, add the test that would have caught it.

**Python (`tests/python/`).** The standard library's `unittest`, run from the repository root with the packages from `requirements.txt` installed (the hooks import mkdocs).

```bash
python -m unittest discover -s tests/python -v
```

- One `test_<hook>.py` per build hook. Call the hook function directly with a stub page object, and check both the pass case and every failure the hook promises to raise.
- `test_extra_css.py` checks the structure of the shared stylesheet: braces must balance and no plain rule may sit inside another. A lost closing brace does not fail the build, but it quietly removes the styling of everything after it.

**When they run.** `.github/workflows/deploy.yml` runs both suites before `mkdocs build --strict`, on every pull request and on pushes to `main`. A failing test blocks the merge. You do not need Node to build the site, only to run the JavaScript tests.

**Not tested here:** the explorers' DOM behavior, CSS, page text, and anything that needs a browser. Do not add a browser-automation framework without a discussion.

## 9. Before you commit

1. `mkdocs build --strict` passes (it also validates the glossary data).
2. Open the page in `mkdocs serve`: console clean, demos work, narrow (phone-width) layout still reads.
3. Anything simplified, deferred, or deviating from the spec goes in `FLAGS.md`.
4. New shared module: added to `extra_javascript`, listed in section 4 above.
5. Tests pass: `cd tests/js && node --test`, and `python -m unittest discover -s tests/python`. A new shared module with a pure logic layer comes with a test file.
