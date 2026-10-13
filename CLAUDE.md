# QuantumEd: notes for Claude Code

A free, interactive quantum computing curriculum (MkDocs Material, GitHub Pages). See `README.md` for setup and layout.

Before building or changing any section:

1. Read `context_docs/vision/ProjectVision.md` and the section's spec in `context_docs/module_N/`.
2. Read `llm/CONVENTIONS.md` for where shared JS lives, how modules are built, and the page-script rules. Check its component table before writing a new component.
3. Check `llm/FLAGS.md` for earlier deviations and open items. Record new ones there.
4. When a page introduces vocabulary, follow the glossary workflow in `README.md`.
5. Verify with `mkdocs build --strict` and by viewing the page. The glossary and nav links are validated at build time.

Spec files gain a "Shared Components" section before "Technical Requirements"; the template is `context_docs/templates/SharedComponentsSection.md`.

Commit with explicit pathspecs (other contributors' files may be staged or untracked). Do not push to `main` directly.
