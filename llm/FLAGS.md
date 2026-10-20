# Flags — Items to Revisit

Running log of decisions, deviations, and known simplifications surfaced while building Module 07 (Quantum Error Correction). Kept here so they can be called back up later rather than re-discovered by reading code. Newest entries at the top of each section.

---

## Deviations from the section-instruction docs

These are cases where a `context_docs/modules/module_07/specs/*` instruction docs said one thing but the actual site nav (driven by the taxonomy doc) said another, and I picked the site's nav order rather than the instruction doc's literal wording. Flagging in case the taxonomy changes and these should be revisited.

- **Encoding & Syndrome Measurement → CTA**: the instruction doc's own "End state" section says "Next: Decoding →", but our nav (QEC Machinery group) puts **Stabilizer Codes** immediately after this page, and the doc's own section 7 content ("From repetition codes to stabilizers") already points that direction too. Linked the CTA to Stabilizer Codes instead; "decoding" is named as a forward-looking concept in the takeaway flow but not linked yet.
- **Repetition Codes → CTA**: doc referenced "Section 04 — Encoding & Repetition Codes" as one merged section; our site splits this into two pages (Repetition Codes, then Encoding & Syndrome Measurement). Linked forward to Encoding & Syndrome Measurement, the actual next page.
- **Stabilizer Codes → Surface Codes mention**: doc's tree diagram teases Surface Codes; our nav order actually puts **Decoding** between Stabilizer Codes and Surface Codes (both under "QEC Machinery" before "Scaling" begins). CTA goes to Decoding; Surface Codes is named/linked as a forward reference, not the immediate next page.
- **Syndrome Measurement's "Optional circuit visualization"**: spec allowed embedding an external tool like Quirk. Built a custom self-contained inline SVG + vanilla JS circuit view instead (discussed with you first) — reasons: the module-download feature zips pages for offline use, and an iframe embed would break offline and risks external CSP/framing issues. Same pattern reused (and generalized) in Stabilizer Codes' circuit view.

- **Glossary "navigation tab" is a top-level nav entry, not a tab.** The site uses Material's sidebar navigation without `navigation.tabs`; enabling tabs would restructure every page's layout. Glossary is added as a top-level nav item after Module 08. If you wanted true top tabs, that's a separate site-wide change.
- **Glossary has one entry beyond the spec's baseline: Minimum-Weight Perfect Matching (alias MWPM).** Module 07 has a full page on it and Decoder/Decoding/Surface Code needed something to link to; the spec (section 2.5) allows adding terms as modules introduce them. Other Module 07 vocabulary that was **not** added (parity check, code space, data qubit, error chain, detection event, logical equivalence) is left for the hardening pass (spec section 13) rather than adding every technical word.

## Known simplifications / conceptual caveats

Places where the built content is honest about a simplification but the simplification itself might be worth hardening later (this maps to the Project Vision's "Intermediate/Advanced — Future Hardening" categories).

- **Glossary definitions were authored in one pass and have not had a subject-matter expert review.** All 155 entries (definition + beginner interpretation) were written from general knowledge to the spec's rules (1-3 sentence definitions, no circularity, hedged wording for emerging terms per section 11). Spec section 13 calls for a dedicated verification pass; worth prioritizing entries with specific factual claims: Shor/Steane code, Threshold Theorem (polylogarithmic overhead), T2 vs T1, Transmon, Quantum Supremacy history, Magic State / Distillation, Erasure Qubit, Bias-Preserving Gate, Logical Architecture (the vaguest of the emerging terms).
- **Glossary "Appears in" lists only pages that teach or substantively use the concept, and several entries are deliberately empty.** Built by auditing the actual page text in both directions (links to pages that never use the term, and pages that use it but weren't linked). Judgment calls: the Module 01 pages `why-quantum-computing` and `quantum-computing-today` are placeholder outlines, so they're not referenced; passing name-drops (e.g. the Errors and Noise "Going Deeper" note naming decoherence/dephasing) are not referenced; forward links to a later page are not referenced. Where a page teaches the concept without the exact term (e.g. the VQE page on noisy near-term hardware for NISQ, the MWPM weights toggle for Noise-Aware Decoding), it is referenced. Re-audit as modules are added.
- **Glossary keeps near-synonym baseline terms as separate entries** (Simulator vs Quantum Simulator, Backend vs Hardware Backend, Native Gate vs Native Gate Set, Circuit Mapping vs Qubit Mapping, Compilation vs Transpilation vs Quantum Compiler, Decoder vs Decoding, Calibration vs Calibration Data vs Calibration Telemetry, Quantum Noise vs Quantum Error, Dephasing vs T2 vs Phase-Flip Error). Spec section 2.2 says one canonical entry per concept, but sections 7 and 6 require an entry for every baseline term and say to distinguish closely related terms rather than collapse them. Each pair was written with a real distinction; if you'd rather merge any as aliases, say which.
- **Glossary alias "Layout" (on Qubit Mapping) is a generic word** (it's the Qiskit term). It only affects that entry's anchor `#layout` and filter text, but it's the aliases most likely to surprise.
- **Glossary spec section 10 (hover definitions, side panels, inline definition cards, clickable glossary links from lesson text) is not built.** Only the glossary page exists; lessons don't link into it yet. The data is presentation-independent (structured YAML, stable IDs), so those can be added later without reworking entries.
- **Hardware-Aware QEC's telemetry data is entirely synthetic and hand-authored**, for a 3×3 device map (9 qubits) across two calibration snapshots. It is not derived from, or representative of, any real quantum processor — spec-mandated ("Use clearly labeled synthetic/educational data... Do not imply synthetic values represent a particular quantum processor"). Values were chosen to *demonstrate* spatial variation (every qubit differs) and temporal variation (mostly small drift, one qubit drifts a lot, one qubit even improves slightly — deliberately nonuniform so the page doesn't imply "drift always means degradation").
- **Hardware-Aware QEC's "Uniform vs. Hardware-Informed" decoder-weight demo is not mechanically connected to the telemetry data shown earlier on the same page.** The 2-edge graph (A-B=2/2 uniform, A-B=4/A-C=2 hardware-informed) uses spec-given illustrative numbers, not a computation derived from the q(1,1)-style telemetry table above it. The page says so explicitly ("Real calibration telemetry doesn't automatically or mechanically convert into MWPM weights like this"), consistent with the existing MWPM Model B flag and the doc's own "Do not imply telemetry can always be directly converted into MWPM weights" constraint.
- **Lattice Surgery's joint (boundary) checks aren't typed X vs Z.** Real lattice surgery distinguishes X-type and Z-type merges (rough/smooth boundaries); `QedLatticeSurgery.buildScene()`'s `boundaryPairs` carry a reserved `type: "boundary"` field for this, but the V1 page always renders a generic joint check (glyph "J", turns "✓" once measured) rather than an ×/+ typed one. Spec-sanctioned — the instruction doc explicitly defers "rough/smooth boundaries," "X-type and Z-type merges," and "explicit (X_L⊗X_L)/(Z_L⊗Z_L) parity measurements" to Intermediate.
- **Lattice Surgery's joint measurement never shows a specific outcome value.** The page doesn't simulate an actual encoded logical state or inject errors (unlike Surface Codes/MWPM, which toggle real error dictionaries) — "Measure" just flips the joint checks' glyph from "J" to "✓". This keeps the interaction deterministic and focused on the mechanism (new checks reveal a relationship) without implying a specific, undemonstrated +1/-1 result.
- **Surface Codes' lattice model is a "bulk-only" patch.** `buildLattice(d)` generates a `(d-1)×(d-1)` grid of 4-neighbor checks with no boundary checks — a real `[[d², 1, d]]` surface code needs roughly `d²-1` checks total (~8 for d=3), including weight-2 boundary checks with rough/smooth distinctions. This was a deliberate, spec-sanctioned simplification (the instruction doc explicitly defers "boundaries" to Intermediate content). Consequence: the "full-span chain fires zero checks" demonstration (Surface Codes' Physical vs Logical section, and reused in MWPM's success/failure examples) is real and hand-verified for *this specific patch*, but the copy is deliberately hedged — it says the pattern "is exactly the shape that, once boundary checks are included, constitutes a logical error" rather than flatly asserting it's *the* logical operator. If the lattice model is ever extended to include real boundary checks, this hedge can likely be tightened into a stronger, fully rigorous claim.
- **MWPM's "Model B" weights are illustrative, not derived.** The alternate error-model weights (`A|D: 1, B|C: 1`) were chosen specifically to flip the preferred matching for teaching purposes — labeled in the UI as "hypothetical" and explicitly not tied to real hardware calibration (that's reserved for Hardware-Aware QEC).
- **Decoding's noise-probability slider goes to 70%, not the spec's illustrative 0–20% example.** Under the real i.i.d. probability math, a lower-weight explanation is *always* favored below p=50% — there's no way to get a genuine crossover within a "realistic" 0–20% range. Extended the range so the learner can actually witness the preferred explanation flip (past p=50%), with copy noting this isn't a physically realistic regime. Worth knowing if a future pass wants to make the slider's range/labeling more "realistic-looking."
- **`[[3,1,3]]` and `t = (d-1)/2` are stated as vocabulary previews**, not derived — consistent across Repetition Codes, Stabilizer Codes, and Surface Codes (all explicitly labeled "Preview" admonitions).

## Architectural notes worth remembering

- **Why QEC?'s learning-journey links are hand-maintained and not build-validated.** The path component renders from a `JOURNEY` array in a page-local script (so names/links/questions can be updated in one place, per the spec), and the hrefs are written for the *built* site (`../<slug>/`) because JS-generated links bypass MkDocs's `.md` link rewriting. `mkdocs build --strict` therefore will NOT catch a renamed or removed page — if Module 07's pages are renamed or reordered, update that array too. All 10 links were fetched and confirmed 200 when the page was built.
- **Why QEC?'s "Protect the Information" demo deliberately uses 5 physical qubits, not 3, and shows no parity links, syndromes, or decoder.** The spec says to keep it abstract and not pre-teach the repetition code, so it avoids the 3-qubit layout used from Repetition Codes onward. Each replay hits the next qubit in a fixed order (`HIT_ORDER`) so it stays deterministic while showing the error can land anywhere. The copy notes real encodings have limits on how many errors they handle, so the demo doesn't imply QEC always succeeds.
- **Module 07 (Quantum Error Correction) is now fully built out at Beginner level** (per `context_docs/vision/ProjectVision.md`'s progressive-depth model). Why QEC? was built last, after Hardware-Aware QEC. Every section instruction doc lists explicit "Intermediate — Future Hardening" and "Advanced — Future Hardening" bullet points that were deliberately *not* implemented yet (e.g. explicit stabilizer operators, logical X/Z operators, rotated surface codes, repeated syndrome rounds, space-time decoding graphs, Blossom algorithm internals, hardware/calibration-aware weighting, rough/smooth lattice-surgery boundaries, decoder-calibration pipelines). No experience-level toggle UI exists yet — that's a real future build, not just content to add.
- **Hardware-Aware QEC's own instruction doc has a "Future Hardening Note"** explicitly deferring cross-module connections (to Quantum Hardware, Quantum Software Stack, quantum control/calibration material, and noise/decoherence material — none of which exist yet as built pages) to a future curriculum-wide hardening pass, and explicitly says not to build those cross-module dependencies during V1. None were built. Worth remembering when those other modules eventually get written — Hardware-Aware QEC is a natural place to link outward from.
- **Shared JS modules live in `docs/assets/javascripts/`** (`surface-code.js`, `matching.js`), loaded site-wide via `extra_javascript` in `mkdocs.yml` — same pattern as `download.js`. Any future page reusing the lattice or matching machinery should reference `window.QedSurfaceCode` / `window.QedMatching` rather than redefining them inline (a page-local inline definition silently breaks the moment a second page tries to reuse it, since MkDocs pages are independent documents, not an SPA — this actually happened once and had to be fixed).
- **Any widget script that depends on a shared `extra_javascript` module must be wrapped in a `DOMContentLoaded` listener.** Material injects `extra_javascript` files near the end of the page template, *after* inline page content — a widget's init code that runs immediately (outside a DOMContentLoaded wrapper) can execute before the shared module has loaded.
- **Keep pixel display coordinates (`x`/`y`) separate from any grid coordinates used for weight/distance math (`gx`/`gy`)** in graph or lattice data structures — conflating them once already produced silently-wrong edge weights (96 instead of 2) that weren't caught until live testing.
- **`docs/assets/javascripts/lattice-surgery.js`** (`window.QedLatticeSurgery`) composes two `QedSurfaceCode.buildLattice()` patches side by side rather than reusing `QedSurfaceCode.renderSVG` directly — that function draws one self-contained `<svg>`, and a joint check needs a line crossing from a qubit in one patch's coordinate space to a qubit in the other's, which only works inside one shared SVG. `buildScene(d)` stays pure data (two lattices + a `boundaryPairs` list), `renderSVG(scene, opts)` is a pure function of that data plus `{stage, view, highlightBoundary}`, and `mount()` is the only DOM-touching part — same separation convention as `QedSurfaceCode`/`QedMatching`.
- **Hardware-Aware QEC needed no new shared JS module.** Its "device map" (click a physical qubit → inspect calibration values) reuses `QedSurfaceCode.buildLattice(3)` + `QSC.mount(..., { selected }, onQubitClick)` completely unchanged — checks render but are never fired/relevant, which is fine, the lattice is standing in for "a device," not a QEC demo here. The telemetry lookup table and the Uniform-vs-Hardware-Informed decoder-weight mini-graph (a hand-rolled `<svg>` using the existing `.qed-graph-*` CSS classes, since it's a 2-edge "star" shape that doesn't fit `QedMatching.renderGraphSVG`'s all-pairs assumption) are both page-local script, not extracted — neither is expected to be reused by another page.
- **New visual-language color added: `--qed-color-telemetry` (teal, `#26a69a`), always paired with a dashed border** (`.qed-qubit--telemetry`, `.qed-pill--telemetry`) for calibration/telemetry info specifically — distinct from the 6 colors in the original canon (logical/physical/error/protected/noise/syndrome) per Hardware-Aware QEC's own spec requirement to visually distinguish "measured/estimated hardware information" from physical error, syndrome info, and decoder inference. The dashed border is the non-color cue (do it also conceptually reinforces "estimated, not exact"). Any future page showing calibration/telemetry-style data should reuse this pairing rather than inventing another new color.

- **Glossary architecture: structured data in `data/glossary/*.yml`, rendered at build time by `glossary_hook.py` into `docs/glossary.md`.** Static HTML (no-JS readable, indexed by site search) with `assets/javascripts/glossary.js` adding a text filter as progressive enhancement (category navigation is the page's table of contents; there are deliberately no category buttons, they took too much space). The hook validates on every build and *aborts* on: missing fields, duplicate IDs, unknown category, unknown related-term ID, an entry related to itself, alias/term/anchor collisions, and `moduleReferences` pointing at a page not in the nav (verified by feeding it each kind of bad data). Related-term counts outside 2-6 only warn (which fails `--strict`). To change an entry, edit the YAML; never edit the generated list in `docs/glossary.md`. The page's "Edit this page" link points at the data folder.
- **Glossary rendering gotchas (each cost real debugging time):** (1) `mkdocs serve` does not reload hook code, only data (via `on_serve`); restart it after editing `glossary_hook.py`. (2) `md_in_html` partially parses entries placed inside a `markdown="1"` wrapper and `markdown="0"` is not a reliable opt-out, so entries leaked into the right-hand TOC. Fix: category headings are real Markdown (so the TOC lists just the 8 categories) and each category's entries are one raw HTML `<section>` with no blank lines inside. (3) MkDocs' search indexer only treats a heading as a section if the heading itself has an `id`, so the entry `id` is on the `<h3>`, not the `<article>` (otherwise only the 8 categories are searchable, not individual terms). (4) Each entry's alias slugs are extra anchors, so `#qec` lands on Quantum Error Correction.

## Bugs found and fixed (not simplifications)

- **Toggle button groups looked "all selected" after the first switch.** The page JS only toggles `qed-button--active`, so every button in a group must carry `qed-button--secondary` permanently (the outlined look); `--active` then overrides just the fill. Buttons that *started* selected had `qed-button--active` but no `--secondary`, so once deselected they fell back to the filled base style and matched the selected one. Fixed on Why QEC? and in 8 places across Surface Codes (3), MWPM (1), Lattice Surgery (2), and Hardware-Aware QEC (2); verified every group in-browser (exactly one filled button after each click). **Convention for any new toggle group: give every button `qed-button--secondary`, and add `qed-button--active` to the initially-selected one as well — never `--active` alone.**

- **`<details class="qed-details">` blocks were silently not processing embedded Markdown** (`**bold**`, `*italic*`, `[links](...)`, MathJax `\[...\]`) — they rendered as literal asterisks/text instead. Root cause: `mkdocs.yml`'s `md_in_html` extension only treats a raw HTML block's contents as Markdown when the tag carries `markdown="1"`; none of our `<details>` blocks had it. This affected every optional-exploration `<details>` block written so far, not just new ones: `encoding-and-syndrome-measurement.md`'s "Explore the circuit," `stabilizer-codes.md`'s "Explore the stabilizer circuit," and this page's "Optional: how this is usually written" / "Optional: follow the checks." Fixed all four by adding `markdown="1"` to the `<details>` tag; verified via live-rendered HTML (`**ancilla**` → `<strong>ancilla</strong>`, MathJax equations render) and a strict `mkdocs build`. Any future `<details class="qed-details">` block needs `markdown="1"` too, or its Markdown will silently pass through as plain text.

---

## Module 05 — Understanding the Quantum Software Stack (05.01)

Built from `context_docs/modules/module_05/specs/05.01_UnderstandingTheQuantumSoftwareStackInstruction.md` (revised for taxonomy V1.1). Module 03 is still a placeholder, so there were no Module 03 circuit displays to reuse.

### New shared modules

- **`circuit.js` (`window.QedCircuit`)**: circuit as data (`bell()`), `renderSVG(circuit)` and `describe(circuit)`. Draws only H, CNOT and measure glyphs with the existing `.qed-circuit-*` classes. Older circuit drawings (Module 06 QAOA/VQE, Module 07 syndrome circuit) are still page-local SVG and were not migrated.
- **`software-stack.js` (`window.QedSoftwareStack`)**: the responsibility model (`RESPONSIBILITIES`, `GROUPS`, `RELATIONS`, `journey(path)`, `comparison()`), HTML renderers, and `mount(root, opts)` for the explorer. Intended for reuse by 05.02–05.07.

### Simplifications and deviations

- **The explorer is HTML cards, not an SVG diagram with drawn connection lines.** Relationships are shown by step numbers, ↓ separators in the Application column, highlighted participants, and a text description in the panel. Chosen for keyboard access, screen readers and phone width. Arrows between columns (for example the device status report flowing back to the backend) appear as text and highlighting only.
- **Journey order is a teaching choice.** On the hardware path, "calibrate and report" is placed before "check target" so the status report can reach the backend description first. Real systems do not follow one fixed order, and the page says so.
- **Results are described, not drawn as counts.** Both paths say "about half 00, about half 11, counts vary". No numeric counts, timings or telemetry values are shown, per the spec's no-fabrication rule.
- **Device-reported information reuses the teal dashed telemetry convention** from Module 07 as a CSS class (`.qed-stack__reported`), but the page itself currently shows the report only as text. The class is defined for 05.04's use.
- **"Highlight the Application and Control groups" (optional in spec section 6) was not built.** Groups are always labeled and drawn with different border styles (solid, double, left bar, rounded).
- **The page has 12 learning outcomes** (the spec's V1.1 reconciliation added two to the usual 8–10).
- **Next-page link is plain text "coming soon".** `Quantum Program Representations` does not exist yet and the nav only lists built pages.

### Glossary

Added three entries (`quantum-software-stack`, `execution-target`, `quantum-runtime`) and added this page to `moduleReferences` of `backend`, `compilation`, `simulator`, `calibration` and `calibration-telemetry`. The new entries overlap in spirit with the existing near-synonym pairs (Backend / Hardware Backend, Simulator / Quantum Simulator). Not merged.

### Reminders that applied here

- All page scripts are wrapped in `DOMContentLoaded`.
- Selectors that must override Material's list styles need `[dir] .md-typeset …` specificity.

---

## Module 02 / Module 03 — qubit-ordering convention (heads-up)

Raised in the review of `taxonomy_QuantumComputingFundamentals_v1.0.md`; carried into v1.1. Not yet built.

- **The convention:** Module 02 defines two-qubit basis order as |00⟩, |01⟩, |10⟩, |11⟩ with q0 as the first (leftmost) qubit and the CNOT control. Circuit drawings put q0 on the top wire. `QedCircuit` already draws q0 on top.
- **The risk:** common SDKs, Qiskit included, print bit strings with qubit 0 on the *right* (little-endian). A learner who moves from Module 02 to Module 03 and reads `01` off a result may be looking at the opposite qubit order.
- **What to do when building:** state the convention explicitly in 02.05 (Multi-Qubit Systems), and note in the 02.05 and 02.07 specs that SDK output order may differ. Tell the Module 03 author so the first SDK example addresses it. Do not assert any vendor's convention beyond that without checking its current documentation.
- **What is unaffected today:** the built 05.01 page and Module 07 only discuss symmetric outcomes (00 and 11) or do not print bit strings, so nothing built needs changing.

---

## Experience levels (site-wide Beginner / Intermediate / Advanced)

Implemented per the plan agreed in discussion. Mechanism only so far; the first real content is a pilot on one Module 07 page.

### Deviations from the plan

- **The selector is a native `<select>`, not a row of toggle buttons.** One control that works on desktop and phone widths, is keyboard-operable by default, and fits in the header. The plan described buttons on wide screens and something compact on narrow ones.
- **The selector is injected by JavaScript** into `.md-header__inner` (after `.md-header__title`). If Material changes its header markup, the selector falls back to the end of the header or disappears. Re-check after Material upgrades.

### Behavior worth knowing

- **Without JavaScript or without the `data-qed-level` attribute, gated blocks stay hidden.** Safe because essential content is never gated.
- **The page note appears on every content page** once the level is above Beginner, including pages with no gated blocks ("No Intermediate content on this page yet. Showing Beginner."). Chosen so the selector never seems to do nothing.
- **Gated text is deliberately indexed by search.** The index is built once and cannot know the level. A hit on hidden content raises the level on arrival. Material's `data-search-exclude` exists and could be used instead if this proves confusing.
- **The level is remembered in `localStorage` under `qed-level`.** If storage is blocked it still works for the current page and falls back to Beginner on the next load.
- **Another tab changing the level is followed** via the `storage` event.
- **The early-paint snippet in `overrides/main.html` repeats the key and level names from `level.js`.** Keep the two in sync.

### Not built

- Level-aware interactive components (a convention is documented only).
- Intermediate/Advanced content, apart from the pilot.
- A per-module or per-page remembered level (decided against; one setting follows the learner).

---

## Shared sampler (`QedShots`) and a fixed bar bug

- **`shots.js` (`window.QedShots`) was built before its first page.** Module 02's 02.01, 02.05 and 02.07 all show repeated measurements, so the sampler and result bars were extracted up front rather than kept page-local. It is seeded and deterministic: a session advances through one seeded stream, so a page shows the same first run on every load while "run again" gives new results. Unit checks live outside the repo (determinism, counts, validation, labels, text); rerun equivalent checks if the module changes. Module 01's measurement demo (on `treys_branch`) has its own sampling code and is a migration candidate.
- **Fixed: `.qed-confidence-bar__fill` was `display: inline`, so its width was ignored and the bars never filled.** This affected the Decoding page's hypothesis bars (they showed an empty frame). Added `display: block`. Verified the fill now matches the inline width (95% of the bar at 1000px). At very narrow widths those older bars are still squeezed by their 9rem label; `QedShots` bars wrap the label and count above the bar below 30em.

---

## Automated tests

- **`tests/js/` uses Node's built-in runner with no dependencies and no `package.json`.** Run with `cd tests/js && node --test`. `load.js` evaluates a shared module against a stub `window`. Chosen to match the Vision's "minimal dependencies"; a framework (Jest, Vitest) would add `node_modules` and a lockfile for a handful of modules.
- **`tests/python/` uses `unittest`** and needs the packages in `requirements.txt` (the hooks import mkdocs). First suite: `level_hook.py`.
- **CI uses the Node that ships on `ubuntu-latest`** rather than adding `actions/setup-node`. `node --test` with no arguments (run from `tests/js`) is the form that works across Node 18 and newer.
- **Only pure layers are tested.** `level.js` needs `document` at load time and is not loadable in the stub; the level selector, note, TOC filtering and auto-reveal are verified in the browser.
- **The `QedShots` tests were checked to fail when the module is broken** (accepting bad probability sums; a weak generator), then the module was restored.

---

## Module 02 — Quantum States (02.01)

Built from `context_docs/modules/module_02/specs/02.01_QuantumStatesInstruction.md`.

### Deviations and simplifications

- **Section 5 originally used the spec's fallback wording, now replaced.** The spec said to point at Module 01's interference and Bell-test demos only if they existed when the page was built. They did not exist on this branch at first (Module 01's page was a stub; the demos lived on `origin/treys_branch`), so the page said the evidence comes later in this module. After Trey's Module 01 merged to `main` and into this branch, section 5 (page and spec) now points at the Superposition demo (mixing a qubit twice returns a certain outcome; a random bit stays 50/50) and the CHSH game in the Entanglement section, by name and with links, and says the later pages develop the first. The page links to anchors in Module 01 (`#superposition`, `#entanglement`; the CHSH game sits inside the Entanglement section since Module 01 was rewritten as components), so a rename of those headings breaks the links.
- **Measure is disabled until a prediction is chosen.** This enforces the spec's "predict before observing", but a learner who just wants to click Measure must make a prediction first. A hint says so.
- **Prediction feedback judges the prediction against the preparation, not against the sample.** A correct "about half each" for a balanced preparation stays correct even if 10 shots come out 7 to 3, and the feedback adds that few shots can look uneven.
- **Switching preparation clears the prediction and the outcomes**, and each preparation keeps its own seeded series (so switching back continues that series). Reset clears all series, so the first run after Reset equals the first run after a fresh page load.
- **Outcome tokens show at most 40 shots**, then "…and N more". The bars and text summary always cover every shot.
- **The preparation data and the two small check widgets are page-local.** The preparation list (probabilities, description, expected prediction) is data inside the page script and is not a shared module, because the spec says no new shared module for this page. When 02.02 needs the same preparations, extract them then. The state-or-outcome and transfer checks use a small data-driven quiz builder inside the page; later Module 02 pages need the same checks, so this is the likeliest next shared component.
- **The Beyond the Core heading sits inside the Intermediate block**, so a Beginner sees neither an empty heading nor a table-of-contents entry for it. At Advanced both blocks show under that one heading.
- **The Advanced "pure and mixed states" block describes a mixed state as a qubit whose preparation is itself uncertain** (|0⟩ or |1⟩ with some probability), which also gives 50/50 counts. It uses the glossary's Pure State and Mixed State entries and adds no formalism. It has not had a subject-matter review, like the glossary entries.

### Reminders that applied here

- Page script wrapped in `DOMContentLoaded`; gated blocks carry `markdown="1"` (checked by `level_hook.py`).
- Result bars come from `QedShots`; no page-local sampling code.
- Classes are `qed-` prefixed; new CSS is appended at the end of `extra.css`.

---

## Module 01 — Foundations (all three pages)

Written without `context_docs/module_1/` instruction docs; content follows the taxonomy and Project Vision only. Tone: "professor giving an intro lecture" (professional, trusts the reader), which should carry into the remaining modules.

### Architecture

- **Every Foundations demo is a page-local script**, like the Module 02 and Module 07 pages: a static skeleton in the page plus one `DOMContentLoaded` script at the bottom (`docs/01-foundations/*.md`). The demos first shipped as registry components (a `data-qed-demo` registry and eleven files under `docs/assets/javascripts/components/`); that second system was removed so Module 01 follows `llm/CONVENTIONS.md`. See "Module 01 rework onto the shared modules" below.
- **`QedBloch` (`bloch.js`)** is the shared Bloch-sphere library, intended for Module 02. Module 07's `errors-and-noise.md` still has its own page-local copy of the drawing code (not touched).
- **Removed `polyfill.io`** from `mkdocs.yml` (domain compromised in 2024; unnecessary for MathJax 3 on modern browsers).
- **Readout bug fixed:** the Qubits state formula used `textContent` and showed raw `e^{i0°}`; it now uses an HTML superscript (numbers only, so safe). `QedNumbers.sci` / `human` return HTML and must be assigned with `innerHTML` (or passed to `QedShots.renderBars` as `textHtml`).

### Module 01 rework onto the shared modules

- **What changed:** the eleven registry components were rewritten as page scripts (what-is-quantum-computing: Bloch explorer, interference mix, measurement, Bell pair, tilt, CHSH; why-quantum-computing: state-space growth, search scaling, many amplitudes; quantum-computing-today: error budget, qubit-count chart). The registry (`QedComponents`), its helper module (`QedUI`), the `components/` folder, and `llm/COMPONENTS.md` are gone. A scripted run of every demo gave identical text, bar widths, and messages on both builds (54, 43, and 28 checks), apart from random draws.
- **New shared code:** `QedNumbers` (`numbers.js`: `pct`, `signed`, `grouped`, `sci`, `human`, `bytes`; `bytes(1)` now reads "1 byte") and the optional `accent`, `marker`, `labelWidth`, `textWidth`, and `textHtml` fields of `QedShots.renderBars`. Default bar output is pinned by a hash test.
- **Reused instead of copied:** `QedShots` for all sampling and for bar rows, `QedGates.apply` and `QedQubit.nameOf` for the Hadamard mix and its state names, `QedShots.defaultLabels` for the many-amplitudes outcome labels.
- **Behavior change (deliberate):** random draws come from seeded `QedShots.rng` streams, one per demo, instead of `Math.random()`. A demo's first run is the same on every load and Run again gives new results; every demo stays labeled as simulated on the page.
- **Dropped with the registry:** the `data-opt-*` options and `data-min-level` on demo tags. Defaults are constants in each script (for example the search demo's largest slowdown is 10^10). Nothing used a level on these pages.
- **Kept page-local on purpose** (each used by one page): the signed-amplitude row, the cos-squared agreement rule shared by the tilt and CHSH demos, the toy cost models, and the qubit-count chart's data (now inline in the script, with its sources in the page text). Their pure formulas have no test file because the repo tests shared modules only; if a second page ever needs one, extract it and test it then.
- **A pitfall hit while porting:** inside a `<details markdown="1">` block, indented nested HTML is parsed as code blocks (the CHSH skeleton gained `<pre>` and copy buttons). That skeleton is written without indentation.

### What Is Quantum Computing?

- The "mix" button is the **Hadamard gate**, previewed before Module 02. Labeled as such, with a pointer to Module 02. Amplitudes in that demo are real-valued only.
- **Measurement and CHSH outcomes are simulated** from textbook predictions (`Math.random() < p0`; each CHSH answer a fair coin, the pair agreeing with probability cos²((α−β)/2)), not a state-vector simulator. The page says so. Measurement is ideal (no readout error), linking forward to Modules 04 / 07.
- **`bell-pair` uses the same generator in both modes.** Deliberate: with both sides asking the same question the statistics are identical, which is the lesson.
- Entanglement is taught through the `tilt-agreement` slider (agreement falls as cos²(angle/2)). The CHSH game is an optional collapsed challenge, with its 75% bound argued in plain words (no XOR notation); quantum strategy tilts 0°/90° and 45°/−45° → ≈85.4%. Measurement "tilt" is introduced informally; formal bases are left to Module 02.
- **Audience:** pages target first-year undergraduates. Avoid assuming classical-CS background (complexity classes, query models, XOR); explain or collapse such material.
- "Where You Come In" on the Today page names open scientific targets (nitrogen fixation, high-temperature superconductivity, batteries, medicines) as hopes for quantum simulation, not promises; keep it hedged. The line about students running programs on real hardware through the cloud is a general statement, not tied to a vendor.
- The page cites the **2022 Nobel Prize in Physics** for Bell tests without naming laureates; add a reference in a hardening pass.

### Why Quantum Computing? and Quantum Computing Today

- **Forward references:** *Why QC?* precedes *What Is QC?*, so it uses "amplitude", "superposition" and "measurement" informally and links forward. Revisit if page order changes.
- **Dated facts (researched October 2026):** Willow below-threshold result (Nature 638, 920, 2025); Quantinuum Helios (98 qubits, 99.921% two-qubit fidelity, 48 logical qubits at 2:1, company-reported); Google "Quantum Echoes" (13,000×, Google's own comparison); Gidney's RSA-2048 estimate (<1 million noisy qubits, <1 week, 0.1% gate error assumed); Babbush et al. 2021 on quadratic speedups; NIST FIPS 203/204/205 (Aug 2024). **IBM Condor (1,121 qubits) is from memory and was not re-verified.** The Today page carries a "figures change quickly" note and a dated sources list; refresh during hardening passes. Articles describing 2026 results (for example neutral-atom logical-qubit counts) came from secondary sources and were deliberately not used.
- **Toy models, labeled on the page:** `search-scaling` (query counts × per-query slowdown) and `error-budget` (independent gate errors). `state-space-growth` shows the general full-state-vector cost; structured states can be simulated more cheaply (noted on the page).
- **Optimization row** in the "Problems Targeted" table is hedged on purpose: generic methods give at most a quadratic speedup, while gains for structured problems are an open research question.


---

## Single-qubit model (`QedQubit`) and shared bars

- **`qubit.js` (`window.QedQubit`) was built before its first page**, for the same reason as `QedShots`: 02.02, 02.03, 02.04, and 02.07 all need the same amplitude math, and the taxonomy's quality gates call for automated checks of normalization and probability sums. It holds one qubit's amplitude math only. It does **not** convert to Bloch coordinates, draw, apply gates, or handle two-qubit states.
- **A state is `{alpha: {re, im}, beta: {re, im}}`** so the Beginner (real) and Intermediate (complex) views share one model. `probabilities` returns the raw squared magnitudes without correcting an invalid state, so a page can show *why* a state is invalid; `normalize` keeps the phases (and so the signs) and refuses the zero state; `relativePhase` is null when either amplitude is zero because it is then undefined.
- **Bloch conversion is deliberately left out until `QedBloch` is reconciled with this module.** `QedBloch.state(theta, phi)` (Trey's shared module, now on `main`) overlaps in spirit. Decide in 02.03 whether the conversion lives in `QedQubit` or `QedBloch`, and avoid duplicating the math.
- **The shared bar helper lives inside `QedShots` as `renderBars(rows)`**, and `renderHTML` now uses it. This was my call: the review accepted "share the markup rather than duplicate it" but left the location open. A separate module would be cleaner naming but adds a file for ten lines. If more non-shot uses appear, move `renderBars` into its own module.
- **`renderBars` width keeps one decimal of the fraction** (33.3%, not 33%), which slightly changes the old integer width of `QedShots` bars. The text still shows the rounded percentage.
- **`qubit.js` is registered in `mkdocs.yml` but no page uses it yet.** It is loaded site-wide like the other shared modules.
- **A script helper in my own tooling truncated `shots.js` once** (an error after the file was opened for writing). It was restored from git with nothing lost, and the helper now computes its result before opening the file.

---

## Module 02 — Qubit Representation (02.02)

Built from `context_docs/modules/module_02/specs/02.02_QubitRepresentationInstruction.md`.

### Deviations and simplifications

- **The optional Intermediate parts (bra notation, inner products, and the orthonormality of |0⟩ and |1⟩) were cut from the first build and added afterwards, through an addendum to the spec.** They are now a second gated Intermediate block, "Bra notation and inner products", with bra-ket readouts in the editor (⟨ψ|ψ⟩, ⟨0|ψ⟩, ⟨1|ψ⟩) and a generated table of inner products among the four named states. The first Intermediate block still covers complex numbers and modulus, complex amplitudes, global versus relative phase, and the editor's phase controls.
- **`QedQuiz` was extracted now, which departs from the spec's "keep the three checks page-local".** The spec predates the decision, recorded in `todo.md`, to extract the quiz builder as soon as a second Module 02 page needed it. 02.02's prediction and valid-pairs checks use `QedQuiz.mount`; 02.01 was migrated onto it. The challenge ("make outcome 1 happen 36% of the time") stays page-local because it reads the editor's state rather than offering choices.
- **The amplitude editor is the first level-aware component.** At Beginner it has real-amplitude sliders and typed values. At Intermediate and above it replaces them with magnitude and phase controls (the real controls are hidden, not disabled), shows each modulus and the relative phase, and adds a "shift both phases together" slider that applies the shift incrementally. The Beginner behavior does not depend on the level.
- **Dropping back to Beginner with a non-real state resets the editor to its starting state** and says why in the note. Real states, including presets and normalized real states, survive a level change.
- **The editor starts at 0.60 and 0.80 (36% and 64%), not at a named preset**, so the first thing a learner sees is the 3–4–5 example from the page text.
- **Invalid states are never silently corrected.** "Normalize" is disabled when the state is already valid or both amplitudes are zero, and an explicit note says why in the zero case.
- **The challenge accepts any valid state whose outcome 1 is within 0.5 percentage points of 36%.** Both 0.8 and 0.6, and 0.8 and −0.6, pass, and the feedback names the sign point.
- **Native number inputs show negatives with a hyphen-minus**, while the written form and generated tables use a proper minus sign.
- **Hilbert Space is named and linked in the Advanced block but 02.02 is not added to its glossary references**, because the page only names it (not a substantive treatment).
- **The generated ket table, comparison panels, and side-by-side lists are built from `QedQubit.PRESETS`**, so the page hardcodes no amplitudes apart from the 0.6/0.8 teaching example and the challenge target.

### Not done

- No screen-reader testing, only keyboard-operable native controls and an aria-live summary.

### Bra notation and inner products (added after the first 02.02 build)

- **`QedQubit` gained `innerProduct(phi, psi)` and `formatAmplitude(z, digits)`**, both pure and tested (`tests/js/qubit.test.js`, now 28 tests; two mutations of `innerProduct`, conjugating the wrong argument and dropping a term, were caught by the tests before the module was restored). `innerProduct` conjugates the first argument only, as in ⟨φ|ψ⟩.
- **Glossary:** added an *Inner Product* entry (153 entries) and added this page to *Bra-Ket Notation*'s references. No *Dot Product* alias was added, because the term is generic and the inner product here is the complex-conjugated form.
- **The fences from the spec addendum were kept.** The page does not state the probability formula P = |⟨k|ψ⟩|² (the general Born rule belongs to 02.07) and does not describe the inner product as a row-times-column or matrix product (matrices belong to 02.04). It does say that ⟨0|ψ⟩ reads off the amplitude α, which is the amplitude, not a probability.
- **The inner-product table is generated from `QedQubit.PRESETS`** (row state against column state, diagonal always 1, and |0⟩ with |1⟩ and |+⟩ with |−⟩ giving 0). It is shown inside the gated block, so a Beginner never sees it.

### Reminders that applied here

- Page script wrapped in `DOMContentLoaded`; gated blocks carry `markdown="1"` (checked by `level_hook.py`).
- Probability bars come from `QedShots.renderBars`; amplitude math from `QedQubit`; no page-local copies.
- Classes are `qed-` prefixed; new CSS is appended at the end of `extra.css`.

---

## Bloch conversions (QedQubit) and the first QedBloch tests

Done before drafting the 02.03 spec, so the spec can say "reuse".

- **The Bloch conversions live in `QedQubit`** (`fromBloch(thetaDeg, phiDeg)`, `toBloch(state)`, `blochVector(state)`), because they are state math. **`QedBloch` stays projection and drawing only** and gains no dependency on `QedQubit`, so Module 01 is untouched.
- **Conventions:** angles in degrees (to match `QedBloch`), θ from +z (0 to 180), φ from +x toward +y. `fromBloch` fixes the global phase by making the |0⟩ amplitude real and not negative. A global phase does not move the point. `toBloch` and `blochVector` throw for a state that is not normalized (the probabilities must add to 100%). At the poles φ is meaningless, so `toBloch` returns `phiDeg: 0` with `phiDefined: false`. φ is returned in [0, 360).
- **Tests:** `tests/js/qubit-bloch.test.js` (11 tests) and `tests/js/bloch.test.js` (7 tests, the first for `QedBloch`). Total suite: 76 JS tests.
  - **The cross-module tests are the point.** They check that `QedBloch.state` and `QedQubit` give the same probabilities and magnitudes for a grid of angles, and that `QedBloch.project` places a point exactly where `QedQubit.blochVector` says it should, through the site's 20° tilt.
  - Three mutations were checked and caught: swapping sin and cos in `fromBloch`, flipping the y sign in `blochVector`, and flipping y in `QedBloch.project` (a disagreement between the two modules).
- **`QedBloch.project` returns a `depth` that `render` does not use**, and its sign is not interpreted anywhere (the north pole has negative depth). The tests assert only the formula. Settle the meaning when a depth cue is added.
- **`QedBloch.render` is not covered by tests** (it draws on a canvas). It is verified in the browser.

### Deferred, on purpose

- **Extending `QedBloch.render` with an options argument** (labelled |+⟩/|−⟩ markers and axes, the projection onto the vertical axis, a depth cue, a second vector). It is backward compatible by default and will be done in the 02.03 build.
- **Making `QedBloch.state` delegate to `QedQubit`** to remove the duplicated probability math. The cross-tests would protect that change; do it when Module 01 is next touched.
- **Migrating the page-local Bloch drawing in `errors-and-noise.md` onto `QedBloch`.**

---

## Presets with |+i⟩ and |−i⟩, and the QedBloch.render options (ahead of 02.03)

- **One preset list.** `QedQubit.PRESETS` now has six states (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩), each with a `real` flag (and `QedQubit.isReal(state)` exists). This was chosen to avoid maintaining two lists.
- **The 02.02 page was adjusted to match.** Its Beginner editor and ket table show only the real presets; Intermediate and above show all six. The preset buttons and ket table are rebuilt when the level changes. The inner-product table (Intermediate) is 6×6, showing for example ⟨+i|−i⟩ = 0. The column listing writes a purely imaginary amplitude as `0.71i`. 02.02's spec carries a second addendum recording this.
- **`QedBloch.render` has an optional fourth argument.** Options (all off by default): `color`, `neutral`, `axes`, `markers`, `pinned`, `projection`, `depth`. With no fourth argument, or an empty one, the drawing is **pixel-identical to before**: 10 angle pairs were hashed from the rendered canvas before the change and compared after (and again after adding the `neutral` option), all identical. Module 01 and every existing call are unchanged.
- **`project`'s `depth` is settled:** a larger depth means farther from the viewer (the viewer looks from the −y side, slightly above, so the north pole has negative depth). Two tests document it. The `depth` option draws the live vector faded and dashed when it is on the far side.
- **The axis labels sit below their end points** so they do not collide with marker labels, which sit above.
- **`QedBloch.render` is still verified in the browser, not in unit tests.** I drew the full option set on a throwaway canvas and checked it by eye; the 02.03 page will need a proper look at its real size.
- **Glossary:** an *Orthogonal States* entry was added (154 entries) and 02.02, which teaches orthonormality, is its reference. The 02.03 page will be added at Intermediate when it is built.

---

## 02.03 Bloch Sphere (built)

- **Page:** `docs/02-fundamentals/bloch-sphere.md`, built from the final spec. No new shared module. It reuses `QedQubit` (presets, `toBloch`, `fromBloch`, `blochVector`, `applyGlobalPhase`, `innerProduct`), `QedBloch` (`state`, `formatText`, `render` with its options), `QedShots.renderBars`, `QedQuiz`, and `QedLevel`.
- **Beginner state description has no complex notation.** It shows the sizes of the two amplitudes (`QedBloch.state`) and the phase angle in degrees. At a pole the phase reads "not needed here", using the `phiDefined` rule: the state is the same whatever the angle. The Intermediate readouts (written form, (x, y, z), P(0) = (1 + z)/2, overall-phase slider) are added beside it and never replace it.
- **Overall-phase slider (Intermediate).** It multiplies the displayed amplitudes by a shared phase factor through `QedQubit.applyGlobalPhase`. The point, the bars, and the Bloch vector come from `fromBloch(theta, phi)` and so do not change, which is the lesson.
- **Typed angles outside their range are shown clamped, with a note**, rather than corrected silently (same rule as 02.02).
- **The "certain 0", "certain 1" and "50/50" words are drawn by the page** on top of `QedBloch.render` (page-local, 12px text). `render` itself was not changed. The "50/50" sits at the left end of the equator and a one-line key under the canvas repeats all three in plain text, because there is no room for a longer equator label on the canvas without colliding with the live vector.
- **Palette variables are read from `document.body`.** Material sets `--md-default-fg-color` and the `--light` variants on the body for the dark scheme, so reading them from `documentElement` gave the light scheme's defaults (checked: `#0000008a` on the root against `hsla(225deg,15%,90%,0.56)` on the body), which is a dark vector on the dark page. The page passes explicit `color` and `neutral` options. `QedBloch.render` still reads its own default `neutral` from `documentElement`, so Module 01's sphere outline gets the light scheme's dark gray in the dark scheme. That was already the case and is unchanged; I have not looked at Module 01 in the dark scheme. Worth fixing in `bloch.js` later; it would change Module 01's look slightly.
- **The explorer redraws when the light/dark palette changes** (a `MutationObserver` on `data-md-color-scheme`).
- **When the pinned state is a named point, its marker is dropped** so the pinned label is not doubled. The pole labels come from `render` itself, so the markers are the four equator points only.
- **The two fixed pictures are static.** The |+⟩ against |−⟩ comparison (section 5) and the "from here / to here" picture (section 7) are drawn once with fixed angles. The spec's "learner's own pinned point" in section 7 was not used: a fixed start (|0⟩) and target keep the closing picture identical for everyone and independent of the explorer.
- **The prediction task shows its bars after any answer**, not only a correct one, as on 02.02 (that is how `QedQuiz` `onAnswer` fires).
- **The taxonomy's "locate |0⟩ and |+⟩" recurring example** is covered by the map table (those two are listed first in the prose) and the presets, not by a separate "find it" check.
- **Glossary:** this page was added to `moduleReferences` for Bloch Sphere, Phase, Pure State, Global Phase, and Orthogonal States. Mixed State and Density Matrix are named at Advanced only, so they are linked from the page but not referenced.
- **Verified:** strict build; 84 JS tests and 8 Python tests unchanged; in the browser at desktop and phone width (no horizontal scroll), all six presets, both sliders, typed values with clamping, pin and clear, reset, the poles, the three checks, and the Beginner, Intermediate, and Advanced views. `QedBloch.render` options were looked at at the real canvas size (360 px), including a far-side point and a pinned diamond.
- **Not done:** no screen-reader pass (still on the to-do list).

---

## 02.04 Quantum Gates (built)

- **Page:** `docs/02-fundamentals/quantum-gates.md`, built from the final spec (the draft's twelve questions were accepted as recommended). The spec was finalized through the skill before the build, as for the other pages.
- **New shared module `QedGates` (`gates.js`)**, with `tests/js/gates.test.js`. Each gate has a standard matrix and a Bloch rotation (axis and angle). A cross-test checks that the matrix action and the rotation agree on a grid of states, for the named gates and for rotations (including a negative angle). Another checks the matrix entries and the `exp(-i theta sigma / 2)` form of RX, RY, and RZ. Six mutations were run against `gates.js` and `QedQubit.nameOf` (sign of the rotation term, compose order, the Y matrix, the RZ direction, the rotation inverse, and a `nameOf` that ignored the global phase); all were caught. The Y-sign mutation was missed at first, because −Y differs from Y only by a global phase, so the matrix-entry test was added.
- **`QedQubit.nameOf(state)`** returns the preset a state is, up to a global phase, or null. Three tests.
- **`QedCircuit` gained a generic labelled single-qubit gate op and a `neutral` option.** `tests/js/circuit.test.js` (new) pins the Bell drawing and two option variants by SHA-256, recorded before the change, so Module 05's drawing is provably byte-identical. Wider labels widen the column spacing only when a generic gate is present. The `neutral` option adds `qed-circuit-gate-box--neutral`, so Module 02 does not use Module 07's blue.
- **`QedBloch.render`'s pinned label moved.** It now sits 24 px below the diamond (it was 14) and turns inward near a canvas edge, because "start |+⟩" collided with the `x` axis label and was cut off at the right edge. `pinned` is a new option that Module 01 does not use, so the default drawing is unchanged. The 02.03 page uses it and its labels moved slightly.
- **Gate buttons apply at once.** The spec says an "Apply" action appends the chosen gate; the build makes each gate button its own apply action (aria-label "Apply the X gate"), with a separate "Apply rotation" for an axis and angle. It is one click fewer and the same behavior.
- **Chain, start state, and the opposite order.** Changing the start state keeps the chain, so the same chain can be tried on every state. The opposite order is the whole chain reversed. The verdict separates three cases: the same state, the same point (a global phase apart, as for X and Z), and different points (with the probabilities compared).
- **The animation** sweeps the point along the gate's rotation arc in 0.5 s through `QedGates.blochPartial`, and the final frame is always the exact result. A timer draws the final picture even if animation frames are paused (a hidden tab), and `prefers-reduced-motion` skips the sweep. It was verified with a stand-in for `requestAnimationFrame` (six distinct intermediate pictures, then the exact final one, equal to a non-animated render); the browser pane used for checking does not run animation frames, so the real timing was not seen.
- **Dropping to Beginner clears a chain that contains S or T**, with a note, as 02.02 does for complex amplitudes. Intermediate adds the S and T buttons, a matrix panel (the last gate and, for a chain of two or more, the whole chain as one matrix with its right-to-left reading), and the written form of the result. Beginner never depends on them.
- **Matrix panel amplitudes are the raw product,** so a shared overall phase can appear (for example Y on |0⟩ gives `i` for the |1⟩ amplitude). The page says so.
- **Transfer task** reads the explorer: it requires the start |0⟩ and a rotation in the chain, and gives a different message for a z turn (which never changes the height of |0⟩).
- **The Intermediate blocks:** *Gates as matrices* (five matrices, a worked H on |0⟩, Y's imaginary entries, HZH = X by multiplication) and *Rotations, S and T, and inverses* (half angle, sin²(θ/2), S and T, the two reading orders side by side, inverses, the global-phase caveat with X = i RX(180°) and S = e^{iπ/4} RZ(90°)). Nothing from the spec was cut.
- **Duplicated page-local code:** the sphere drawing helper (`drawSphere`, `annotate`, the theme colors read from `document.body`) now exists on both 02.03 and 02.04. Consider moving it into `QedBloch` as a themed `renderState` helper when 02.07 needs it.
- **Glossary:** this page was added to `moduleReferences` for Quantum Gate, Identity Gate, Pauli-X, Pauli-Y, Pauli-Z, Hadamard, and Rotation Gate. Unitary Operation is linked from the Advanced block but not referenced, and Phase Gate (S and T) and Controlled Gate are not linked, since the page names them lightly or not at all.
- **Source corrections (taxonomy section 10):** reversibility is stated correctly; H is labelled H and carries 1/√2 in the matrix; the Y paragraph describes Y; rotations are stated up to a global phase.
- **Verified:** strict build; 112 JS tests and 8 Python tests; in the browser at desktop and phone width (no horizontal scroll): gates, chains of up to four, the inverse button, rotations, typed-angle clamping, the transfer task, the examples, the three views, the order verdicts (H and Z, X and Z), and MathJax in the gated blocks. Module 05's page still renders.
- **Not done:** no screen-reader pass (still on the to-do list).

---

## 02.05 Multi-Qubit Systems (built)

- **Page:** `docs/02-fundamentals/multi-qubit-systems.md`, built from the final spec (the draft's twelve questions were accepted as recommended).
- **New shared module `QedTwoQubit` (`twoqubit.js`)**, exactly two qubits, with `tests/js/twoqubit.test.js`. `QedGates` gained `kron`, `controlled`, `identity`, and `CNOT`, and its matrix helpers now work for any square size (so `isUnitary`, `compose`, and `inverse` work on the 4×4 matrices). `QedTwoQubit` does not call `QedQubit` or `QedGates`; the page passes their matrices in. The basis order is 00, 01, 10, 11 with q0 the left digit, the first factor of `kron`, the control, and the top wire, fixed in code and in tests.
- **Tests and mutations:** 141 JS tests in total (29 new), including the CNOT truth table, the exchange of the 10 and 11 amplitudes on a general state (taxonomy section 10, item 3), the `kron` order, H on q0 then CNOT giving (|00⟩ + |11⟩)/√2, `applyToQubit` against `kron`, the product test on the Bell state, `|+⟩` and `|+⟩`, and the state with amplitudes ½, ½, ½, −½ (it passes the product test of the probabilities and is still not a product). Eight mutations were run (wrong qubit in `applyToQubit`, `product` swapping 01 and 10, `marginals` swapping q0 and q1, a sign in `separability`, `bellOf` ignoring the global phase, a wrong pairing in `independentTable`, `kron` putting the first factor on q1, and `controlled` putting the gate in the wrong block); all were caught.
- **`BELL` holds four states, not two.** The spec named the Bell state and its anti-correlated variant. With the Beginner inputs (|0⟩, |1⟩, |+⟩), H on a |1⟩ gives |−⟩ on the control, so the explorer can also reach the two Bell states that carry a minus sign (visible as a −0.71 in the amplitude list, not in the probabilities). `bellOf` names all four, and the caption says "a Bell state with a minus sign" for those.
- **Beginner inputs are |0⟩, |1⟩, and |+⟩ per qubit.** |−⟩, |+i⟩, and |−i⟩ are Intermediate (hidden buttons at Beginner). With |+⟩ on the control and |−⟩ in the target CNOT moves the minus sign over to the control and leaves every probability at 25%, so a probability table cannot show that anything happened. A test pins this. Dropping to Beginner with such an input resets that qubit to |0⟩ with a note, as 02.02 and 02.04 do.
- **The product test is stated one way only.** The panel shows the actual table beside the table independent qubits would give, and says either "These match what independent qubits would give" or "These do not match…, so the qubits are not independent". It never claims independence from a match. The caption beside the explorer does use the exact amplitude test (`isProduct`) to say whether the qubits are still independent; with the Beginner inputs it agrees with the probability test in every reachable case (checked by brute force over all 180 combinations of inputs and steps). At Intermediate, 16 of the combinations that use |+i⟩ or |−i⟩ (for example |+⟩ and |+i⟩ then CNOT) are entangled and still pass the probability test, so the panel adds a sentence there saying that a match does not prove independence, and the Intermediate block works the ½, ½, ½, −½ case.
- **The page has no Bloch spheres and no shots.** It says in words that neither qubit of an entangled pair has a state of its own to draw on the sphere. Sampled counts and the "no communication" account are left to 02.07.
- **The qubit-order note is generic.** The Joint Outcomes box states the convention and says that some software libraries write bit strings with qubit 0 on the right, without naming a vendor. This answers the "Module 02 / Module 03" heads-up above, from the Module 02 side. **The Module 03 author still needs to be told** so the first SDK example addresses the order.
- **The explorer is a fixed pipeline** (optional H on q0, then optional CNOT), as decided, with a Reset and a switch for the product test. The circuit is drawn through `QedCircuit` (`h` and `cx`, neutral boxes). The transfer task reads the explorer's table (01 and 10 each 50%, 00 and 11 never) and accepts any starting states and steps that reach it.
- **Intermediate:** two gated blocks (*Tensor products and four-component vectors*; *CNOT as a matrix, the Bell state, and separability*) and an Advanced block that only names the Schmidt decomposition, entanglement measures, and controlled-U. In the explorer, Intermediate adds the three extra inputs, the four-component vector with its written form, the number αδ − βγ with a sentence on what it means, and a matrix panel (H⊗I and CNOT as 4×4 matrices acting on the columns). Nothing from the spec was cut.
- **Glossary:** a new *Bell State* entry (155 entries, alias *Bell Pair*), and this page added to the references of *Entanglement*, *CNOT Gate*, and *Controlled Gate*. *Multi-Qubit Gate* is not referenced, since the page names it only in passing.
- **Source corrections (taxonomy section 10):** the CNOT action on a general state is stated with the 10 and 11 amplitudes exchanged (item 3) and a test pins it; the qubit-ordering convention is explicit (item 8).
- **Verified:** strict build; 141 JS tests and 8 Python tests; in the browser at desktop and phone width (no horizontal scroll): all inputs and both steps, the Bell state and both minus-sign variants, |+⟩ and |+⟩, the product test panel, the three checks, the transfer task (pass and fail), the three views, dropping to Beginner with an Intermediate input, the Intermediate caveat on the product-test verdict, and the math in the gated blocks (64 rendered expressions).
- **Not done:** no screen-reader pass (still on the to-do list).

---

## 02.06 Quantum Circuits (built)

- **Page:** `docs/02-fundamentals/quantum-circuits.md`, built from the final spec (the draft's thirteen questions were accepted as recommended).
- **New shared module `QedTrace` (`trace.js`)** and the **data layer in `QedCircuit`** (`emptyCircuit`, `opAt`, `validate`, `place`, `remove`, `columns`, `summarize`), plus `QedGates.cnot(controlWire)` and `QedTwoQubit.factor`. `tests/js/load.js` gained `loadModules`, which loads several modules into one stub window; `QedTrace` is the one shared module that calls others (at run time). The Bell drawing's hash test still passes, so Module 05's drawing is unchanged.
- **Tests and mutations:** 176 JS tests in total (35 new), including every validation rule with a passing and a failing case, `place` and `remove` on frozen circuits, the Bell trace through |00⟩, (|00⟩ + |10⟩)/√2, and (|00⟩ + |11⟩)/√2, H, Z, H on |0⟩ (the Z step changes the name but not the probabilities), HZH = X and HXH = Z on both basis states up to a global phase, two gates in one column in either order, and a trace against applying the gates one at a time through `QedTwoQubit`. Twelve mutations were run on the circuit data layer, the trace, `cnot(1)`, and `factor`; all were caught.
- **`QedTwoQubit.factor` was not in the spec.** The trace names a state ("q₀ in |+⟩ and q₁ in |0⟩"), which needs each qubit of a product state, so `factor` splits a product state into its two one-qubit states (up to a global phase) and returns null for an entangled one. A state with no name shows "a state with no name".
- **A measurement does not stop the trace.** The spec says the trace ends at a measurement, but validation lets the other wire continue after one wire is measured (gates on a different qubit commute with a Z-basis measurement). So the trace runs through every column, marks the measured wires, and labels every step at or after a measurement "what a measurement here would show: probabilities, not a result". Nothing is sampled and the state is never updated (02.07). A test shows the joint probabilities are the same whether a gate on the other wire comes before or after the measurement.
- **CNOT can point either way.** Placing a CNOT by pressing the control's wire makes the other wire the target; `QedGates.cnot(1)` is the matrix for q₁ as the control, tested against SWAP·CNOT·SWAP. The page says that "q₀ is the control" was the convention for 02.05.
- **Pressing a filled cell removes it, whatever is selected.** So a gate cannot be refused for landing on an occupied cell in the UI; the rule still exists in `validate` (and has tests). Refusals the learner can meet are the CNOT needing both wires, a measurement being last on its wire, a CNOT after a measurement, and the five-step limit.
- **Choosing a goal resets the circuit and both wires to |0⟩,** since each goal is stated from |0⟩. Changing a start state afterwards makes "Check my circuit" ask for |0⟩ again rather than judging a different problem. Goal (a) needs exactly one gate and goal (d) forbids X; any circuit that reaches the goal counts. "Show one solution" loads (a) X, (b) H, (c) H then CNOT, (d) H, Z, H.
- **Beginner starts are |0⟩ and |1⟩; the palette is H, X, Z, CNOT, and Measure,** taken from `QedGates` in that order. Intermediate adds Y, S, T, RX, RY, RZ (angle set when the gate is placed, from the slider or typed value, shown clamped with a note) and the other four start states. A rotation shows only its axis in its grid cell (the cell is narrow); its name and angle are in the cell's accessible name and in the drawing. Dropping to Beginner with a circuit that uses an Intermediate gate or start state clears the circuit with a message.
- **The trace shows names, bars, and the amplitude list at Beginner;** Intermediate adds the four-component vector and each step's 4×4 matrix (H on q₀ as H⊗I, CNOT either way). The amplitude list is real numbers for listing only, as on 02.05.
- **Section 5's demo is static:** the same two gates in one column and in two columns give the same trace, drawn through `QedCircuit` and `QedTrace`.
- **Glossary:** this page was added to the references of Quantum Circuit, Hadamard Gate, Pauli-X Gate, Pauli-Z Gate, and CNOT Gate. Circuit Depth is linked from the Advanced block but not referenced. Clifford has no glossary entry and is named only, at Advanced.
- **Phone width:** the first layout of the five-step grid overflowed its box at 375 px (the last cell was cut off). The columns are now `minmax(0, 1fr)` with smaller cells, so the grid fits.
- **Verified:** strict build; 176 JS tests and 8 Python tests; in the browser at desktop and phone width (no horizontal scroll): placing and removing gates, every refusal rule, CNOT with either wire as the control, a measurement on one or both wires, all four goals (empty check, hint, solution, solved check, plus an X in goal d, three gates in goal a, and a wrong start state), the Intermediate palette, a rotation angle and its clamp, complex start states with an S gate, the matrix lines, dropping to Beginner, and both quizzes. `QedCircuit.bell()` (H, CNOT, two measurements) runs through `QedTrace` on the page's last section.
- **Not done:** no screen-reader pass (still on the to-do list).

---

## 02.07 Measurement (built)

- **Page:** `docs/02-fundamentals/measurement.md`, built from the final spec (the draft's fifteen questions were accepted as recommended). This page closes Module 02.
- **No new shared module.** `QedTwoQubit` gained `measureQubit(state, wire, outcome)` and `measure(state, wires, random)` (pure; the random function is passed in, so a test can pin the edges of the range). `QedShots` gained `repeat`, `spread`, and `expectedSpread` for the Intermediate spread view. `QedTrace` gained `basisGates(basis, wire, col)` and understands the gate id `sdg` (S†), which the Y-basis readout needs.
- **Tests and mutations:** 194 JS tests in total (18 new), including the measurement probability against the marginal, the state after (normalized, only the matching amplitudes), measuring the same wire again (probability 1, and the other outcome refused), a product state's other qubit unchanged, the Bell state either way round, the joint distribution the same in either order, the random number at the edges of the range, the same seed giving the same measurements, a frozen state never changed, `repeat` and `spread` against √(p(1−p)/N) at four shot counts, and the X and Y readouts against the named states. Thirteen mutations were run on the new code (the wrong digit, no renormalizing, no refusal of an impossible outcome, the wrong comparison, an ignored random number, the wrong measuring order, the state not carried between wires, a wrong variance, a missing square root, a restarted random stream, S† as S, and H before S† for Y); all were caught.
- **`QedShots.spread` takes the result of `repeat` and an outcome** (the spec wrote `spread(runs)`), and `expectedSpread` is an addition. The spread view is built from them, one chosen shot count at a time; each press adds a row, so running the four shot counts shows the band narrowing. It is seeded, so the same press gives the same rows.
- **One lab, two modes.** In one-qubit mode q₁ is idle: the trace and the measurement run on the two-wire model (q₀'s amplitudes sit at 00 and 10), and the circuit is drawn on one wire. `QedCircuit.summarize` is given a two-wire list there so a single meter reads "a measurement of q₀" and not "of both". Every source is a short circuit from |0⟩ (nothing, X, H, H then Z, rotate 60° about y; Intermediate adds H then S and H then S†), run through `QedTrace`.
- **The stepper draws from its own seeded stream,** separate from the shot session, so pressing "Measure once" never changes what "Run again" gives. In pair mode the OUTCOME panel shows the first qubit's result and then the other qubit's, with its chance (1, certain); the AFTER panel shows the pair's state, a basis ket such as |11⟩. "Measure the same qubit again" re-measures the qubit that went first and always repeats the result.
- **Mystery state:** two fixed rounds (round 1 hides a mostly-1 state, with a choice of three; round 2 hides |−⟩, a choice of |+⟩ and |−⟩). The hidden preparation is drawn as a box marked "?". Feedback uses the actual counts and says when a correct guess was partly luck (round 1 with fewer than 50 shots) or a pure guess (round 2 with no shots after an H). The transfer task of the spec is round 2.
- **Intermediate behavior:** the complex sources, a Z/X/Y basis selector (adds H, or S† then H, drawn in the circuit; the outcomes are labelled + and − for X and +i and −i for Y; the stepper's AFTER panel also names the state with the basis change undone), the expectation value (⟨Z⊗Z⟩ for the pair), and the spread view. Dropping to Beginner with a complex source or a non-Z basis resets the lab to |+⟩ measured directly, with a note.
- **Amplitude text:** the squares are shown with three digits and "≈" unless the digits shown give the exact probability (0.707² ≈ 0.5, but 0.5² = 0.25).
- **The overview page was updated:** the placeholder note is gone and "Planned pages" is now "Pages".
- **Glossary:** this page was added to the references of Measurement, Shot, Computational Basis, Bell State, Entanglement, Quantum Interference, and Expectation Value. Mid-Circuit Measurement and Readout Error are linked from the page but not referenced.
- **Bit order:** the page says q₀ is the left digit and that tools such as Qiskit may print the bits the other way round, in the pair section and again in the closing section. Telling the Module 03 author is still on the to-do list.
- **Phone width:** the two bar groups stack, and the rows put the label and percentage above a full-width bar. Checked at 375 px with no horizontal scroll.
- **Verified:** strict build; 194 JS tests and 8 Python tests; in the browser at desktop and phone width: one-qubit and pair modes, every shot count, the stepper and repeats in both modes, the mystery rounds (no shots, one shot, a wrong guess, a right guess, with and without the H, next round, leave), the three levels, the X and Y bases, the spread view at four shot counts, the pair expectation value, dropping to Beginner, and both quizzes. The `/favicon.ico` 404 in the console appears on every page.
- **Not done:** no screen-reader pass (still on the to-do list).
