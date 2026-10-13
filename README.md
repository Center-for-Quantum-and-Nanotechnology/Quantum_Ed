# QuantumEd

A free, open quantum computing curriculum for community learners, high school students, and undergraduates — built as an interactive, visual-first course site with MkDocs Material, deployed to GitHub Pages.

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
mkdocs serve
```

Then open http://127.0.0.1:8000.

## Project structure

- `docs/` — all course content, one folder per module (`01-foundations/`, `02-fundamentals/`, …). Each module folder has an `index.md` landing page.
- `docs/assets/` — shared stylesheets and JavaScript, including the interactive demos and the module-download button.
- `overrides/` — MkDocs Material theme overrides.
- `hooks.py` — build hook that zips each module folder into `site/downloads/<module>.zip` for the offline-download button.
- `data/glossary/` — structured source for the global [glossary](docs/glossary.md): one YAML file per category plus `categories.yml`, following the schema in `context_docs/glossary/`.
- `glossary_hook.py` — build hook that validates `data/glossary/` (unique IDs, related-term IDs, links to real pages) and renders it into `docs/glossary.md`. A bad entry fails the build.
- `mkdocs.yml` — site config and navigation.
- `.github/workflows/deploy.yml` — builds on every PR, deploys to GitHub Pages on merge to `main`.

## Content sourcing

Source material lives in `context_docs/`, organized as:

- `context_docs/vision/` — [`ProjectVision.md`](context_docs/vision/ProjectVision.md), the overall educational philosophy and architecture (progressive-depth experience levels, visual language, reusable-component conventions). Review this before implementing any new section.
- `context_docs/taxonomy/` — [`Quantum_Computing_Curriculum.md`](context_docs/taxonomy/Quantum_Computing_Curriculum.md), the course taxonomy. Module numbering in `docs/` follows this document; update both together if the taxonomy changes.
- `context_docs/module_NN/` — per-module folders, each with a `README.md`, a versioned `taxonomy_<Module>_v<X.Y>.md`, `specs/` (one approved instruction doc per page), and `archive/` (superseded material).

See [`context_docs/README.md`](context_docs/README.md) for how these documents are used, which one wins in a conflict, and how to add or revise them.

## Glossary

The glossary is a cross-cutting resource, not a module. Edit `data/glossary/*.yml`, never `docs/glossary.md` (its entry list is generated). When a new module introduces important terminology, follow the expansion workflow in the glossary spec: reuse existing entries, add missing terms only if they are reusable vocabulary, and add the new page to each relevant entry's `moduleReferences`. `mkdocs serve` does not reload hook code, so restart it after editing `glossary_hook.py`.

## Contributing

Every page has an "Edit this page" link that opens a GitHub edit view directly. Placeholder pages are marked with a "Status: placeholder" admonition at the top.
