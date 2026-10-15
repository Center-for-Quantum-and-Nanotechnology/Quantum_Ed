# QuantumEd component catalog

The single reference for reusable interactive components. **Check here before building a demo**: if a component below already does what a lesson needs, reuse it; if one nearly does, extend it (add an option) rather than copying it. The Project Vision asks for exactly this (section 14, *Reusable Architecture*).

Related: [`FLAGS.md`](FLAGS.md) logs per-module deviations, simplifications and bugs; this file describes the components themselves.

---

## 1. How it fits together

```
docs/assets/
  javascripts/
    components/                 <- the Foundations demo components
      registry.js               QedComponents  — finds and mounts demos on a page
      ui.js                     QedUI          — shared HTML/number helpers
      <name>.js                 one file per demo component (see catalog below)
    bloch.js                    QedBloch       — single-qubit state math + sphere drawing (library, shared with Module 02)
    surface-code.js             QedSurfaceCode    ┐ Module 07 modules, older
    matching.js                 QedMatching       │ "global library + inline
    lattice-surgery.js          QedLatticeSurgery ┘ page script" pattern (see §7)
  stylesheets/extra.css         all shared styles and the visual-language tokens
```

A page uses a component with **one line of HTML and no script**:

```html
<div data-qed-demo="qubit-measurement" data-opt-theta="45"></div>
```

On `DOMContentLoaded`, `registry.js` finds every `[data-qed-demo]` element, looks up the component by name, adds the `qed-demo` class, and calls `mount(root, options)`. The component builds its own DOM inside `root`.

Why this pattern:

- **No inline scripts in pages**, so the "wrap in `DOMContentLoaded`" gotcha in `FLAGS.md` cannot recur.
- **No global element ids.** Components find their elements with `root.querySelector('[data-ref="…"]')`, so the same component can appear several times on a page.
- **Configuration lives in the page.** Options are `data-opt-*` attributes; authors never edit component code to change a default.
- **Separation of layers** (Project Vision §14: *model ≠ visualization*). Pure logic is exposed as a `model` object on the registered component and can be tested without a DOM; DOM wiring stays inside `mount`.

### Load order

Set in `mkdocs.yml` under `extra_javascript`, and it matters:

1. `components/registry.js`, `components/ui.js`
2. `bloch.js` (library, a shared module one level up from `components/`)
3. the individual component files (any order)
4. `mathjax.js`, then the MathJax CDN script

All scripts load on every page and do nothing unless a page contains a matching `data-qed-demo` element.

### Options (`data-opt-*`)

`data-opt-max-qubits="4"` becomes `{ maxQubits: 4 }`. Values `true`/`false` become booleans, numeric strings become numbers, and values beginning with `[` or `{` are parsed as JSON (use single quotes around the attribute and avoid apostrophes inside the JSON).

### Experience levels

Levels are cumulative (Project Vision §4). Add `data-min-level="intermediate"` (or `advanced`) to any demo element to mark the lowest level that should see it. Until a level selector exists, everyone is treated as `beginner`, so such elements stay hidden. A future selector only needs to set `<html data-qed-level="…">`; the registry already honors it.

---

## 2. Catalog

| Component (`data-qed-demo`) | What it teaches | Used by |
|---|---|---|
| [`bloch-explorer`](#bloch-explorer) | A qubit state as a point on the Bloch sphere; θ sets the odds, φ is phase | 01 · What Is QC? (Qubits) |
| [`interference-mix`](#interference-mix) | Superposition ≠ hidden coin: amplitudes can cancel (interference) | 01 · What Is QC? (Superposition) |
| [`qubit-measurement`](#qubit-measurement) | One outcome, collapse, repeated agreement, odds from many shots | 01 · What Is QC? (Measurement) |
| [`bell-pair`](#bell-pair) | Perfect agreement alone does not show entanglement | 01 · What Is QC? (Entanglement) |
| [`tilt-agreement`](#tilt-agreement) | Entangled results depend on the angle between detectors: cos²(angle/2) | 01 · What Is QC? (Entanglement) |
| [`chsh-game`](#chsh-game) | No plan made in advance beats 75%; an entangled pair does (optional challenge) | 01 · What Is QC? (Entanglement, collapsed block) |
| [`state-space-growth`](#state-space-growth) | Why classical simulation of quantum systems is hard (2ⁿ amplitudes) | 01 · Why QC? (Motivation) |
| [`search-scaling`](#search-scaling) | Quadratic speedup, and how constant-factor slowdowns erode it | 01 · Why QC? (Problems Targeted) |
| [`many-amplitudes`](#many-amplitudes) | 2ⁿ amplitudes, but a measurement returns n bits | 01 · Why QC? (Classical vs Quantum) |
| [`error-budget`](#error-budget) | Why noise limits circuit depth: (1 − p)^G | 01 · QC Today (NISQ Era) |
| [`log-bars`](#log-bars) | Values spanning orders of magnitude; log vs linear toggle | 01 · QC Today (Open Frontier) |

Each file's header comment repeats the information below, so the source is self-documenting.

### bloch-explorer
- **File:** `components/bloch-explorer.js`
- **Markup:** `<div data-qed-demo="bloch-explorer"></div>`
- **Options:** `data-opt-theta` (default 90), `data-opt-phi` (default 0)
- **Depends on:** `QedBloch`, `QedUI`
- **Notes:** the canvas `aria-label` updates with the state. Intended for reuse in Module 02's Bloch Sphere section.

### interference-mix
- **File:** `components/interference-mix.js`
- **Markup:** `<div data-qed-demo="interference-mix"></div>`
- **Options:** `data-opt-start` (0 or 1, default 0)
- **Model:** `model.mix([a0, a1])` returns the amplitudes after one Hadamard; `model.stateName(amps)` returns `|0⟩`, `|1⟩`, `|+⟩`, `|−⟩`.
- **Simplification:** real-valued amplitudes only. The "mix" button is the Hadamard gate, previewed before Module 02.

### qubit-measurement
- **File:** `components/qubit-measurement.js`
- **Markup:** `<div data-qed-demo="qubit-measurement"></div>`
- **Options:** `data-opt-theta` (90), `data-opt-phi` (0), `data-opt-shots` (shots per run, 100)
- **Depends on:** `QedBloch`, `QedUI`
- **Simplification:** ideal readout; outcomes sampled with `Math.random()` from the textbook probabilities, not a state-vector simulation.

### bell-pair
- **File:** `components/bell-pair.js`
- **Markup:** `<div data-qed-demo="bell-pair"></div>`
- **Options:** `data-opt-pairs` (pairs per click, default 10)
- **Notes:** the classical and quantum modes deliberately use the same generator (same-basis statistics are identical). That is the lesson, not an oversight.

### tilt-agreement
- **File:** `components/tilt-agreement.js`
- **Markup:** `<div data-qed-demo="tilt-agreement"></div>`
- **Options:** `data-opt-tilt` (starting angle, default 60), `data-opt-pairs` (pairs per click, default 20)
- **Model:** `model.pSame(alphaDeg, betaDeg)` = cos²((α−β)/2)
- **Depends on:** `QedUI`
- **Simplification:** pairs are sampled from the prediction (fair coin for Alice, Bob agrees with probability `pSame`), not a state-vector simulation.

### chsh-game
- **File:** `components/chsh-game.js`
- **Markup:** `<div data-qed-demo="chsh-game"></div>`
- **Options:** `data-opt-rounds` (rounds per click, default 1000)
- **Model:** `model.pSame(alphaDeg, betaDeg)`, `model.quantumWinProbability()` (≈ 0.8536), `model.CLASSICAL_LIMIT` (0.75), `model.ALICE_TILT`, `model.BOB_TILT`
- **Simplification:** quantum rounds are sampled from the Bell-pair prediction (fair coin per answer, agreeing with probability cos²((α−β)/2)).

### state-space-growth
- **File:** `components/state-space-growth.js`
- **Markup:** `<div data-qed-demo="state-space-growth"></div>`
- **Options:** `data-opt-max-qubits` (60), `data-opt-qubits` (initial, 10), `data-opt-bytes-per-amplitude` (16)
- **Model:** `model.amplitudes(n)`, `model.memoryBytes(n, bytesPerAmplitude)`, `model.describe(bytes)`
- **Caveat (stated on the page):** this is the general full-state-vector case; structured states can be simulated more cheaply. Reference scales (16 GB laptop, 1 TB server, 1 PB cluster) are decimal.

### search-scaling
- **File:** `components/search-scaling.js`
- **Markup:** `<div data-qed-demo="search-scaling" data-opt-max-slowdown-exponent="10"></div>`
- **Options:** `data-opt-max-exponent` (largest log₁₀ N, default 15), `data-opt-max-slowdown-exponent` (largest log₁₀ of the quantum-step slowdown, default 9)
- **Model:** `model.classicalChecks(N)` = N/2, `model.groverQueries(N)` = (π/4)√N, `model.breakEven(k)` = (πk/2)²
- **Simplification:** toy cost model (query counts × time per query).

### many-amplitudes
- **File:** `components/many-amplitudes.js`
- **Markup:** `<div data-qed-demo="many-amplitudes"></div>`
- **Options:** `data-opt-max-qubits` (4), `data-opt-qubits` (initial, 3), `data-opt-shots` (100)
- **Model:** `model.amplitude(n)` = 1/√2ⁿ, `model.label(index, n)` returns a bitstring
- **Simplification:** only the uniform superposition (Hadamard on every qubit).

### error-budget
- **File:** `components/error-budget.js`
- **Markup:** `<div data-qed-demo="error-budget"></div>`
- **Options:** `data-opt-error-exponent` (initial, 3 → p = 10⁻³), `data-opt-gate-exponent` (initial, 3 → 1,000 gates)
- **Model:** `model.successProbability(p, G)`, `model.gatesToHalf(p)`
- **Simplification:** independent errors, any error ruins the answer; ignores error mitigation. Natural lead-in to Module 07.

### log-bars
- **File:** `components/log-bars.js`
- **Markup:**
  ```html
  <div data-qed-demo="log-bars"
       data-opt-title="Physical qubits"
       data-opt-unit="qubits"
       data-opt-items='[{"label":"Device A","value":105,"accent":"quantum","note":"Short note."},
                        {"label":"Target","value":1000000,"accent":"noise"}]'></div>
  ```
- **Options:** `items` (JSON array of `{label, value, note?, accent?}`), `title`, `unit`, `scale` (`"log"` or `"linear"`, default `"log"`)
- **Accents:** `quantum` (blue), `protected` (green), `noise` (orange), `error` (red), or omitted (gray).
- **Authoring rule:** values go stale. Put dated sources next to the demo in the page text, as `quantum-computing-today.md` does.

---

## 3. Shared libraries

### `QedComponents` (`registry.js`)
`register(name, { mount(root, options), model? })`, `mountAll(scope?)` (re-scan after injecting HTML), `uid(prefix)` (unique id for label/`for` pairs), `get(name)` (returns the registered component, so tests can reach `.model`), `currentLevel()`, `levelAllowed(minLevel)`.

### `QedUI` (`ui.js`)
Pure string/number helpers. Only numbers and fixed labels are interpolated, so results are safe for `innerHTML`; never pass user-typed text through them.

| Helper | Returns |
|---|---|
| `pct(x, digits?)` | `"50%"` |
| `signed(x, digits?)` | `"+0.71"` / `"−0.71"` (real minus sign) |
| `probRow(label, p, opts)` | probability bar row; opts: `accent`, `marker` (expected-value tick), `labelWidth`, `text`, `textWidth` |
| `ampRow(label, a)` | signed amplitude bar; negatives are hatched **and** carry a "−", so sign never relies on color |
| `grouped(n)`, `sci(x, d?)`, `human(x)` | `"1,234,567"`, `"3.2 × 10<sup>8</sup>"`, grouped below 1e9 and scientific above. `sci` and `human` return HTML: assign with `innerHTML`, not `textContent` |
| `bytes(b)` | decimal units: `"17.2 GB"` |

### `QedBloch` (`bloch.js`)
`state(θ°, φ°)` → `{a0, a1, p0, p1}`; `formatHTML` / `formatText` (readout and aria text); `project(...)`; `render(canvas, θ°, φ°)`, which reads `--qed-color-logical` from the theme. Pure functions plus a pure drawing routine; it never touches page elements.

---

## 4. Visual language and shared CSS

All colors come from tokens in `:root` of `extra.css`. **Do not add new hard-coded colors**; reuse a token or extend this table (Project Vision §13).

| Meaning | Token | Used for |
|---|---|---|
| Quantum / logical state | `--qed-color-logical` | qubit states, quantum results |
| Physical / neutral / classical | `--qed-color-physical` | classical bits, borders, tracks |
| Noise | `--qed-color-noise` | noise, upper bounds |
| Error / failure | `--qed-color-error` | errors, "run fails" |
| Protected / corrected / success | `--qed-color-protected` | good outcomes |
| Syndrome / check information | `--qed-color-syndrome` | Module 07 |
| Telemetry | `--qed-color-telemetry` | Module 07 |

Classes added for Foundations (one commented block at the end of `extra.css`): `.qed-panel` (+ `--quantum`), `.qed-amp-row` / `.qed-amp-bar`, `.qed-confidence-bar--marked` and `__marker`, `.qed-confidence-bar__fill--{logical,protected,noise,error}`, `.qed-results-table`, `.qed-chsh-row`, `.qed-stat`, `.qed-amp-grid` / `.qed-amp-cell`, `.qed-logbar`, `.qed-demo__note`.

---

## 5. Adding a new component (checklist)

1. **Search this catalog first.** Prefer a new option on an existing component over a copy.
2. Create `components/<kebab-name>.js`. Start with a header comment: purpose, markup, options, used by, model API, simplifications.
3. Wrap it in an IIFE and finish with `QedComponents.register("<kebab-name>", { mount: mount, model: model })`.
4. Keep **model** (pure functions) separate from **mount** (DOM). Expose the model so it can be tested without a DOM.
5. Build the DOM inside `mount` with `root.innerHTML = …`; find elements with `data-ref` attributes and a local `ref()` helper. No global ids. Use `QedComponents.uid()` for label/`for` pairs.
6. Accessibility: real `<button>` and `<input type="range">` elements with labels; `aria-live="polite"` on feedback regions; `role="img"` plus an updating `aria-label` on canvases; never rely on color alone.
7. Style with existing classes and tokens. Add new classes to the end of `extra.css` in a commented block. Check dark mode and a 390 px viewport (no horizontal scroll).
8. Register the file in `mkdocs.yml` after `registry.js`, `ui.js`, and any library it needs.
9. Use it in a page with `<div data-qed-demo="…"></div>`.
10. Add a catalog entry here, and log any simplification or deviation in `FLAGS.md` under the module that introduced it.
11. Verify: `mkdocs build --strict`, then try every control in a browser.

Conventions: kebab-case names that describe the *concept*, not the page; deterministic behavior unless randomness is itself the lesson (Project Vision §12); label simplifications on the page where a learner will see them.

---

## 6. Testing

There is no automated test suite yet. The pattern used so far:

- **Logic:** call the pure model from a browser console, e.g. `QedComponents.get("chsh-game").model.quantumWinProbability()` → `0.8535…`.
- **Behavior:** drive the controls with Playwright against `mkdocs build` output (click buttons, set sliders, read `[data-ref]` text), and check for console errors and horizontal overflow at 390, 768, and 1200 px.

---

## 7. Not yet migrated (Module 07)

Module 07 predates this layout. It uses global library modules (`surface-code.js` → `QedSurfaceCode`, `matching.js` → `QedMatching`, `lattice-surgery.js` → `QedLatticeSurgery`) plus inline page scripts wrapped in `DOMContentLoaded`. They continue to work unchanged. Known duplication to clean up when convenient:

- `errors-and-noise.md` carries its own copy of the Bloch-sphere drawing code; it can use `QedBloch.render` instead.
- Module 07 demo markup could move behind `data-qed-demo` components using the same registry.

Do not mix the two patterns on one page without a reason.
