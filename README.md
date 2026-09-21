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
- `mkdocs.yml` — site config and navigation.
- `.github/workflows/deploy.yml` — builds on every PR, deploys to GitHub Pages on merge to `main`.

## Content taxonomy

The course taxonomy originates from [`context_docs/Quantum Computing Curriculum.docx`](context_docs/Quantum%20Computing%20Curriculum.docx). Module numbering in `docs/` follows that document; update both together if the taxonomy changes.

## Contributing

Every page has an "Edit this page" link that opens a GitHub edit view directly. Placeholder pages are marked with a "Status: placeholder" admonition at the top.
