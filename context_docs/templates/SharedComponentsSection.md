# Spec template addition: Shared Components

**Where it goes:** a new section in every section-instruction spec (specs live in `context_docs/module_NN/specs/`; see [`../README.md`](../README.md)), placed **immediately before "Technical Requirements"** (after "Page Structure"). The existing "Technical Requirements" bullets such as "Reuse existing components where appropriate" stay, but this section replaces their vagueness with specifics.

**Why it belongs in the spec, not the Vision:** the Vision (§14–16) already sets the principle of reuse. Only the spec author knows which later sections will want a component the current page introduces. The engineering mechanics (file layout, naming, load order) live in [`llm/CONVENTIONS.md`](../../llm/CONVENTIONS.md).

**For the spec writer:** check the component table in `llm/CONVENTIONS.md` (section 4) and the previous sections' specs before filling this in. If a component is new, say which later pages you expect to reuse it. If you don't know, say so.

**For the implementer:** if the spec's Shared Components section conflicts with what the repository actually contains, flag it in `llm/FLAGS.md` and take the smaller change.

---

## Template (copy from here)

```markdown
Shared Components

Reuse (already exist; do not reimplement):
•	<Global name> (<file>.js) — <what this page uses it for>
•	<Global name> (<file>.js) — <what this page uses it for>

Create (new shared modules, because a later section will reuse them):
•	<Qed Name> — <one line: the object it represents>
	Used again by: <later section(s)>
	Data/state layer: <what is pure data or logic, no DOM>
	Rendering layer: <what draws it>
	Reserved extension points: <variants that later sections will add, e.g. new boundary types, code distances>

Keep page-local (one-off wiring; do not extract):
•	<interaction or script that only this page needs>

Migrate (optional): <existing page-local copy of logic that should move onto a shared module as part of this work, or "none">

Separation of concerns:
•	<which layers must stay independent here, e.g. error model ≠ syndrome ≠ decoder ≠ visualization>
```

---

## Filled example (Lattice Surgery, as it would have been written)

```markdown
Shared Components

Reuse (already exist; do not reimplement):
•	QedSurfaceCode (surface-code.js) — patch lattice data (buildLattice) and check geometry for both patches
•	Module 07 visual-language classes in extra.css — logical/physical/syndrome colors and the qed-button toggle styles

Create (new shared modules, because a later section will reuse them):
•	QedLatticeSurgery — two surface-code patches with a mergeable shared boundary
	Used again by: any future multi-patch or logical-operation section
	Data/state layer: scene data only (patches, boundary pairs, stage order); no coordinates, no SVG
	Rendering layer: one shared SVG so joint checks can cross patches
	Reserved extension points: boundary pair type (currently always "boundary"), X-type vs Z-type surgery

Keep page-local (one-off wiring; do not extract):
•	The Prepare/Merge/Measure/Split stepper controls and the QEC-continuity timeline

Migrate (optional): none

Separation of concerns:
•	Logical patch state stays separate from visual rendering; merge/split are changes to patch/check relationships, not unrelated animations
```

---

## Checklist for the implementer

- [ ] Every "Reuse" item exists in `docs/assets/javascripts/` and is loaded in `mkdocs.yml`.
- [ ] Every "Create" item follows `llm/CONVENTIONS.md` section 3, is added to `extra_javascript`, and is added to the component table in section 4.
- [ ] Nothing under "Keep page-local" was extracted.
- [ ] Any "Migrate" item was done, or the reason it wasn't is in `llm/FLAGS.md`.
- [ ] Deviations are recorded in `llm/FLAGS.md`.
