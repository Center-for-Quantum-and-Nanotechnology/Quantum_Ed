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
| `QedCircuit` | `circuit.js` | `bell`, `describe`, `renderSVG`, `qubitName` | Understanding the Quantum Software Stack |
| `QedSoftwareStack` | `software-stack.js` | `RESPONSIBILITIES`, `GROUPS`, `RELATIONS`, `journey`, `comparison`, `catalogHTML`, `comparisonHTML`, `mount` | Understanding the Quantum Software Stack |
| `QedShots` | `shots.js` | `rng`, `sample`, `session`, `defaultLabels`, `describe`, `renderHTML` | Module 02 repeated-measurement pages (planned: 02.01, 02.05, 02.07) |
| `QedLevel` | `level.js` | `LEVELS`, `get`, `set`, `atLeast`, `rank`, `onChange`; also builds the header selector, page note, TOC filtering and hash auto-reveal | Every page (site-wide) |
| (none) | `download.js` | Adds the module-download button | Every page |
| (none) | `glossary.js` | Text filter and deep-link reveal | Glossary |
| (none) | `mathjax.js` | MathJax configuration | Every page |

Known duplication: `errors-and-noise.md` carries a page-local Bloch-sphere drawing. A shared Bloch module is in progress on `treys_branch`; once it lands on `main`, migrate this page onto it.

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

**Level-aware components.** An interactive may read `QedLevel.get()` or `QedLevel.atLeast("intermediate")` and subscribe with `QedLevel.onChange(fn)` to show deeper detail (for example complex amplitudes). Its Beginner behavior must not depend on the level. None exist yet.

**Search.** The search index is built once and cannot know the level, so gated text is indexed on purpose. A hit on hidden content raises the level on arrival (see `FLAGS.md`).

## 8. Before you commit

1. `mkdocs build --strict` passes (it also validates the glossary data).
2. Open the page in `mkdocs serve`: console clean, demos work, narrow (phone-width) layout still reads.
3. Anything simplified, deferred, or deviating from the spec goes in `FLAGS.md`.
4. New shared module: added to `extra_javascript`, listed in section 4 above.
