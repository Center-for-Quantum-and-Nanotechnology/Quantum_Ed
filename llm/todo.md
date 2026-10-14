# To do

Planned work that is not finished yet. Tick items off (or delete them) as they land, and add new ones as they come up. Deviations and simplifications in work that is already built belong in [`FLAGS.md`](FLAGS.md), not here.

Last updated: 2026-10-13

---

## Module 05: Quantum Software Stack (next up)

Governing documents: `context_docs/modules/module_05/taxonomy_QuantumSoftwareStack_v1.1.md` and the 05.01 spec in `context_docs/modules/module_05/specs/`.

- [x] **Revise the 05.01 spec for taxonomy V1.1.** Done (`61ea053`). The taxonomy says the spec predates V1.1 and must be reconciled. Draft the revision as a diff for review rather than overwriting it.
  - Add the Application Layer / Control Layer framing.
  - Add a brief calibration and telemetry introduction, without teaching 05.04 content.
  - Fix the rules that now conflict with V1.1: "do not teach calibration" in section 5, and the bans on "backend-property schemas" and "quantum control software" in the constraints. They should say "name it, don't teach it".
  - Add the **Shared Components** section (template: `context_docs/templates/SharedComponentsSection.md`).
  - Record that the spec was reviewed against taxonomy V1.1.
- [x] **Sync the global taxonomy.** `context_docs/taxonomy/Quantum_Computing_Curriculum.md` now lists the seven approved pages.
- [ ] **Add each remaining Module 05 page to `mkdocs.yml` as it is built** (05.01 is done). Decision: nav entries only for pages that exist, no stub pages. The nav currently holds just the module index.
- [x] **Rewrite `docs/05-software-stack/index.md`.** It now describes the module and lists the seven planned pages. Link each page there as it is written.
- [x] **Build 05.01** (Understanding the Quantum Software Stack) from the revised spec. Built; added `QedCircuit`, `QedSoftwareStack`, three glossary entries, and the nav entry. See the Module 05 section of `FLAGS.md`.
  - Module 03 is a placeholder, so there is no circuit display to reuse. Plan to reuse the `.qed-circuit-*` styles from Module 07.
  - Terminology check against the glossary (see the glossary section below).
- [ ] **Write specs 05.02–05.07** with the `section-spec-writer` skill, then build each page. Titles are fixed by the taxonomy.
- [ ] **Module 05 README** with the page status table (`context_docs/README.md` section 3).

## Module 02: Quantum Computing Fundamentals

Governing document: `context_docs/modules/module_02/taxonomy_QuantumComputingFundamentals_v1.2.md` (approved).

- [x] **Taxonomy v1.2 approved**, including the Beginner / Intermediate / Advanced split and gate coverage.
- [x] **Global taxonomy synced and module index rewritten.** The nav still holds only the module index.
- [x] **Check Module 01 before finalizing 02.01.** Done: the interference and Bell-test demos exist only on `origin/treys_branch`, not on this branch, so 02.01 uses the spec's fallback wording.
- [x] **After Trey's Module 01 merges, update 02.01 section 5** to point at its interference (Superposition) and Bell-test/CHSH (Entanglement) demos. Done in the page and the spec.
- [x] **Add the 02.01 page to the glossary's `moduleReferences`.** Done for State Preparation, Quantum State, Superposition, Basis State, Measurement, and Shot.
- [ ] **Finalize the 02.02 spec** (all ten review questions are decided; run the `section-spec-writer` skill over the reviewed draft), then build it. Draft and approve specs 02.03 to 02.07 after that. Draft each from the taxonomy for review, then run the `section-spec-writer` skill over the reviewed draft. Each spec carries a level map and a Shared Components section.
- [ ] **When 02.02 is built: log any cut Intermediate parts in `llm/FLAGS.md`.** The Intermediate layer is approved to be built with the page. If the optional parts (bra notation, inner products, orthonormality) are cut, record that as a deviation.
- [ ] **Add each remaining Module 02 page to `mkdocs.yml` as it is built** (02.01 is done), and link it from `docs/02-fundamentals/index.md`.
- [ ] **Terminology check against the glossary** for each page. Many entries (qubit, superposition, Bloch sphere, gates, measurement) belong to this module.
- [ ] **Reconcile `QedBloch` with `QedQubit` in 02.03.** Decide where the Bloch conversion lives and avoid duplicating the amplitude math.
- [ ] **Extract the data-driven quiz builder** from `quantum-states.md` into a shared module when a second Module 02 page needs the same checks (and add tests for it).
- [ ] **Link Module 06's rotation-gate explanations to 02.04** during the hardening pass.
- [ ] **Module 02 README** with the page status table.

## context_docs housekeeping

- [ ] **Module READMEs** (entry point and page status table) for modules 01–08. None exist yet.
- [ ] **Module taxonomy files** (`taxonomy_<Description>_v<X.Y>.md`) for modules 01–04, 06, 07 and 08. Module 07's can be written from the built pages and the global taxonomy; Module 06's from its existing pages.
- [ ] **Module 01 specs.** The "What Is Quantum Computing?" page was drafted on `treys_branch` with no spec in `context_docs/modules/module_01/specs/`.
- [ ] **Skill copy outside the repo.** If `section-spec-writer` is also installed in Claude settings, update it to match `skills/section-spec-writer/SKILL.md`.
- [ ] **Add `~$*` to `.gitignore`.** Word lock files (`~$name.docx`) appear when a spec is open in Word and are not currently ignored.

## Pull requests and CI

- [ ] **Open the PR from `ricks_branch` to `main`.** The `gh` CLI is not installed and the built-in browser is not signed in to GitHub, so this has to be done from the GitHub page (compare link: `main...ricks_branch`). Then watch the checks.
- [ ] **Unstick the deploy workflow.** Run #24 (the merge of PR #8) has been "Waiting", and #26 is "Pending" behind it. Likely cause: the `github-pages` environment needs an approval, or its settings changed. Check the run for a "Review pending deployments" banner and Settings → Environments → github-pages.
- [ ] **Update the workflow's action versions.** The Node.js 20 deprecation warning does not block builds, but `.github/workflows/deploy.yml` uses `checkout@v4`, `setup-python@v5`, `upload-pages-artifact@v3` and `deploy-pages@v4`. Confirm the current majors before changing them.
- [ ] **Merge `main` into `treys_branch`.** An attempt hit conflicts in `mkdocs.yml` and `docs/assets/stylesheets/extra.css` and was aborted. The conflicts are additive (CSS from both sides; both sets of `extra_javascript` lines). Trey's branch also needs the new conventions and context_docs layout.
- [ ] **Migrate `errors-and-noise.md` onto `QedBloch`** once Trey's `bloch.js` reaches `main`. The page carries its own copy of the Bloch drawing code. Then add `QedBloch` to the component table in `llm/CONVENTIONS.md` section 4 and remove the "in progress" note there.

## Glossary (152 terms)

Governing documents: `context_docs/glossary/specs/glossary.md`, `data/glossary/`, and the workflow in the root `README.md`.

- [ ] **Subject-matter review of all 152 definitions.** I wrote them and they have had no expert review. Check these first: Shor/Steane code, Threshold Theorem (polylogarithmic overhead), T1/T2, Transmon, Quantum Supremacy history, Magic State / Distillation, Erasure Qubit, Bias-Preserving Gate, Logical Architecture.
- [ ] **Build the hover / inline definitions** from glossary spec section 10: hover definitions, side panels, definition cards, and links from lesson text into the glossary.
- [ ] **Decide on near-synonym entries** kept separate for now, and merge any as aliases: Simulator / Quantum Simulator, Backend / Hardware Backend, Native Gate / Native Gate Set, Circuit Mapping / Qubit Mapping, Compilation / Transpilation / Quantum Compiler, Decoder / Decoding, Calibration / Calibration Data / Calibration Telemetry, Quantum Noise / Quantum Error, Dephasing / T2 / Phase-Flip Error.
- [ ] **Review the generic alias "Layout"** on Qubit Mapping, the likeliest to surprise.
- [ ] **Add Module 07 vocabulary** deliberately left out so far: parity check, code space, data qubit, error chain, detection event, logical equivalence.
- [ ] **Re-audit "Appears in" lists** as modules are added. Placeholder pages and passing name-drops are not referenced.
- [ ] **Terminology check for the remaining Module 05 pages (05.01 is done).** It will introduce terms such as intermediate representation, transpilation, backend, calibration telemetry and runtime. Several overlap existing entries (see the near-synonym item).
- [ ] **Restart `mkdocs serve`** in your own terminal. It does not reload hook code, so it may still show the removed category chips.

## Module 07 hardening (Beginner V1 is complete)

- [ ] **Intermediate and Advanced content.** Each Module 07 spec lists future-hardening items; none are built.
- [ ] **Experience-level toggle UI.** No toggle exists yet, and the pages carry no per-section level metadata.
- [ ] **Cross-module links in Hardware-Aware QEC's "Future Hardening Note"** (Quantum Hardware, Software Stack, control/calibration, noise material). Deferred until those modules exist.
- [ ] **Validate the Why QEC? journey links.** The `JOURNEY` array is hand-maintained and `mkdocs --strict` does not check it. Update it if Module 07 pages are renamed, or add a check.

## Tests

`tests/js/` (QedShots) and `tests/python/` (level_hook) exist and run in CI. Conventions: `llm/CONVENTIONS.md` section 8.

- [ ] **Backfill JavaScript tests, one module at a time as each is next touched.** Cheap, high-value first: `QedSoftwareStack` invariants (every journey ID exists, every relation member exists, no numeric calibration values), `QedSurfaceCode` (`buildLattice`, `computeSyndrome`), `QedMatching` (`solveMWPM`, weights), `QedCircuit` (`describe`, `renderSVG` strings), and Trey's `QedBloch` once merged.
- [ ] **Python tests for `glossary_hook.py`:** each validation failure (duplicate ID, unknown category, dead related term, alias collision, bad `moduleReferences`) and the pass case.
- [ ] **Module 02 math checks** (taxonomy section 10 quality gates) as tests once the Module 02 modules exist: normalization, gate matrix actions, circuit-state tracing, probability sums.
- [ ] **Decide whether to pin or set up Node in CI.** The workflow uses the Node that ships on `ubuntu-latest`. Revisit if a test needs a specific Node version.

## Experience levels

Mechanism is built (`level.js`, `level_hook.py`, CSS, header selector). Design notes are in `llm/FLAGS.md` and `llm/CONVENTIONS.md` section 7.

- [ ] **Pilot on Module 07 Surface Codes.** Draft one or two short Intermediate blocks from that spec's own list (more rigorous treatment of code distance; logical operators and boundaries), review the text with you, then commit.
- [ ] **Module 02 taxonomy v1.2.** Define each page's Beginner V1 contract and an Intermediate map. Likely placement: complex amplitudes, matrices, tensor products and formal notation at Intermediate; rotation gates geometric at Beginner with matrices at Intermediate; S and T optional at Intermediate. Resolves open items 1 and 4 from the v1.1 draft.
- [ ] **Add level maps to the specs** (Module 05 and Module 07) when their Intermediate items are built.
- [ ] **Build the first level-aware component** when a page needs one (for example a Module 02 amplitude editor that shows complex amplitudes at Intermediate).
- [ ] **Review the selector after any Material upgrade.** It is injected into the header by JavaScript.

## Site and curriculum

- [ ] **Review `llm/FLAGS.md`.** Go through each logged deviation, simplification and fixed bug, and decide whether to keep it, fix it, or promote it into a spec, a taxonomy or `CONVENTIONS.md`. Remove entries that are resolved or no longer true.
  - Covers the deviations from instruction docs (such as CTA ordering), the lattice-surgery and MWPM simplifications, the synthetic telemetry data, and the Module 01 entries added on `treys_branch`.
  - Check the entries that name old spec paths or filenames.
- [ ] **Placeholder modules.** Modules 02–05 are placeholders, and Modules 01 and 06 are partly built.
- [ ] **Navigation tabs (optional).** The Glossary is a top-level sidebar entry, because the site has no `navigation.tabs`. Real top tabs would be a site-wide layout change.
- [ ] **Keep `llm/CONVENTIONS.md` current.** Add each new shared module to its component table and note when a duplicate is retired.
