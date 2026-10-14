# QuantumEd: notes for Claude Code

A free, interactive quantum computing curriculum (MkDocs Material, GitHub Pages). See `README.md` for setup and layout.

Before building or changing any section:

1. Read `context_docs/README.md` for how the instruction documents are organized and which one wins in a conflict. Then read `context_docs/vision/ProjectVision.md`, the module's taxonomy (`context_docs/modules/module_NN/taxonomy_*.md`), and the page's spec in `context_docs/modules/module_NN/specs/`. Never build from an `archive/` folder.
2. Read `llm/CONVENTIONS.md` for where shared JS lives, how modules are built, and the page-script rules. Check its component table before writing a new component.
3. Check `llm/FLAGS.md` for earlier deviations and open items. Record new ones there.
4. When a page introduces vocabulary, follow the glossary workflow in `README.md`.
5. Verify with `mkdocs build --strict` and by viewing the page. The glossary and nav links are validated at build time. Run the tests (`llm/CONVENTIONS.md`, section 8); a shared module with a pure logic layer gets a test file in `tests/js/`.

Specs are named `<ID>_<PageTitle>.md` (for example `07.04.01_SurfaceCodesInstruction.md`) and include a "Shared Components" section before "Technical Requirements"; the template is `context_docs/templates/SharedComponentsSection.md`. If a spec contradicts its module taxonomy, stop and flag it rather than resolving it silently.

Commit with explicit pathspecs (other contributors' files may be staged or untracked). Do not push to `main` directly.
