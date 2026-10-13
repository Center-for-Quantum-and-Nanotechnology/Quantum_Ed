# context_docs

The instruction layer for QuantumEd. Everything here tells contributors and coding agents **what to build and why**. Nothing here is published on the site; the published lessons live in `docs/`.

Read this file first. It explains what each folder is for, which document wins when two disagree, and how to add or change a document.

---

## 1. How these documents are used

Work flows in one direction:

```
ProjectVision.md          how the whole platform teaches
      ↓
Module taxonomy_*.md     what one module covers and how its pages relate
      ↓
specs/<page>.md           what one page teaches
      ↓
docs/<module>/<page>.md   the built lesson (implementation, verified with mkdocs build --strict)
```

- **Authors** write or revise a spec, then hand it to a coding agent.
- **Coding agents** read the documents in the order in section 5, build the page, and record anything they simplified or deviated from in `llm/FLAGS.md`.
- **Reviewers** check the built page against its spec's learning outcomes and "Important Pedagogical Constraints".

Specs say **what to teach**. They do not restate the Vision, and they do not dictate file layout or code structure; that comes from the repository and [`llm/CONVENTIONS.md`](../llm/CONVENTIONS.md).

## 2. Directory map

```
context_docs/
├── README.md              this file
├── vision/                platform-wide educational philosophy and architecture
├── taxonomy/              global curriculum tree: module numbers, names, order
├── glossary/              glossary spec (the content itself is in data/glossary/)
├── templates/             templates for specs and module folders
├── module_01/ … module_08/  one folder per module, all with the same layout (section 3)
```

| Folder | Holds | Authority |
|---|---|---|
| `vision/` | `ProjectVision.md`: experience levels, visual language, interaction and accessibility principles | Highest. Applies to every module. |
| `taxonomy/` | `Quantum_Computing_Curriculum.md`: the global tree of modules and sections | Defines module numbering and names. Update it together with any module taxonomy that changes page structure. |
| `glossary/` | The glossary specification | Governs `data/glossary/`. |
| `templates/` | Reusable templates, such as the Shared Components section for specs | Reference only. |
| `module_NN/` | Everything specific to one module | See section 3. |

## 3. The module folder

Every `module_NN/` folder has the same four items, whether or not the module has been built yet.

```
module_NN/
├── README.md
├── taxonomy_<Description>_v<X.Y>.md
├── specs/
└── archive/
```

| Item | Responsibility |
|---|---|
| `README.md` | Entry point for contributors and coding agents. Describes the module and points to its governing documents. |
| `taxonomy_<Description>_v<X.Y>.md` | Canonical module-level vision, page hierarchy, learning objectives, scope boundaries, and instructional decisions. |
| `specs/` | Current approved instructional specifications for individual pages. |
| `archive/` | Historical documents retained for reference but no longer authoritative. |

### `README.md` (module entry point)

Short. It orients a reader and keeps the status of the module in one place. It contains:

1. **Purpose**: two or three sentences on what the module is for and how it differs from its neighbours.
2. **Governing documents**: links to `../vision/ProjectVision.md`, the current taxonomy file, and `specs/`.
3. **Page status table**: one row per page in the taxonomy.

   | ID | Page | Spec | Built page | Status |
   |---|---|---|---|---|
   | 05.01 | Understanding the Quantum Software Stack | `specs/UnderstandingTheQuantumSoftwareStackInstruction.md` | `docs/05-software-stack/…` | spec needs revision |

   Status values: `no spec` · `spec draft` · `spec approved` · `spec needs revision` · `built` · `built, needs hardening`.
4. **Prerequisites and neighbours**: which modules it assumes and which it hands off to.
5. **Open items**: pointers to unresolved decisions. Detail belongs in the taxonomy file or `llm/FLAGS.md`, not here.

The README does not repeat the taxonomy or any spec. If a fact lives in another document, link to it.

### `taxonomy_<Description>_v<X.Y>.md` (module-level source of truth)

Exactly one taxonomy file sits at the module root, and it is always the current approved version. `<Description>` is the module name in PascalCase and `<X.Y>` is the version, for example `taxonomy_QuantumSoftwareStack_v1.1.md`. Earlier versions live in `archive/`. It contains, as relevant to the module:

- Purpose and identity, and how the module differs from its neighbours
- Prerequisite assumptions
- The module's learning contract (what a learner can do at the end of Beginner V1)
- The page hierarchy: IDs, approved titles, order, objective of each page, Beginner V1 scope, and primary interaction concept
- Section-to-section handoffs and any recurring example
- Boundaries with other modules (what this module owns and what it must not teach)
- Candidate future Intermediate and Advanced depth
- Module-specific visual conventions
- Deferred work and explicit non-goals
- A short change record and decision record

The page hierarchy is **approved**. Changing page count, order, ownership, or titles is a curriculum revision that needs review, not an implementation detail.

### `specs/` (page-level source of truth)

One Markdown file per page, written with the [`section-spec-writer`](../skills/section-spec-writer/SKILL.md) format:

- Filename: `<ID>_<PageTitleNoSpaces>.md`, where `<ID>` is the page's taxonomy ID (`07.01`, or `07.04.01` when the module groups pages into subsections), for example `07.04.01_SurfaceCodesInstruction.md`. The ID keeps specs in nav order and ties each one to its row in the taxonomy. A trailing `Instruction` in the title part is optional.
- Fixed section order: Project Context, Goal, Learning Outcomes, Experience-Level Scope, Page Structure (including one Main Interactive), Visual / UX Requirements, **Shared Components**, Technical Requirements, Important Pedagogical Constraints, End State
- Each spec names the previous and next page and ends by motivating the next one

`specs/` holds only specs that are currently approved. A spec that has been superseded moves to `archive/`.

### `archive/` (historical, not authoritative)

For anything kept for reference that must no longer drive work:

- Superseded taxonomy versions (for example `taxonomy_QuantumSoftwareStack_v1.0.md`)
- Superseded page specs
- The original `.docx` sources, in `archive/docx/`, if a Markdown conversion exists

Archived files are read-only. Do not build from them, and do not edit them. If you need something that only exists there, bring it forward into the current document deliberately.

## 4. Authority and conflicts

When two documents disagree:

1. **`ProjectVision.md`** wins on platform-wide behaviour: experience levels, visual language, accessibility, and interaction principles.
2. **The module taxonomy** wins on what the module covers, page order, and ownership between modules.
3. **Page spec** wins on what that page teaches and how it is structured.
4. **Repository conventions** (`llm/CONVENTIONS.md`, existing code) win on implementation.

Do not resolve a conflict silently, in either direction. If a spec contradicts its module taxonomy (for example, a spec written before a taxonomy revision), stop, list the conflicts, and have the spec revised. Do not quietly patch the spec, and do not quietly ignore the taxonomy.

## 5. Reading order for a coding agent

Before building or changing a page:

1. `vision/ProjectVision.md`
2. `module_NN/README.md`, then the module's current taxonomy file
3. The page's spec in `module_NN/specs/`, and the specs of the previous and next pages
4. [`llm/CONVENTIONS.md`](../llm/CONVENTIONS.md) and [`llm/FLAGS.md`](../llm/FLAGS.md)
5. The existing repository: previous sections of the module, shared components, and the glossary (`data/glossary/`)

Never build from `archive/`.

## 6. Changing documents

**Adding a spec:** write it with the `section-spec-writer` skill, put it in `specs/`, and add or update its row in the module README's status table.

**Revising a spec:** edit it in place when the change is a clarification. When the change is a substantial revision, move the old version to `archive/` with a version suffix and put the new one in `specs/`. Update the README status.

**Revising a taxonomy:** save the new version as `taxonomy_<Description>_v<X.Y>.md` at the module root, add an entry to its change record, and move the previous version to `archive/` in the same change. If page structure, titles, or numbering changed, update `taxonomy/Quantum_Computing_Curriculum.md` and `mkdocs.yml` navigation in the same change set.

**After building a page:** update the status table, and log simplifications and deviations in `llm/FLAGS.md`. If the page introduced reusable vocabulary, follow the glossary workflow in the repository `README.md`.

**Adding a new module folder:** copy the layout in section 3. Create the README and the taxonomy file first. Empty `specs/` and `archive/` folders keep a `.gitkeep`, since git does not track empty folders.

## 7. Conventions

- **Folder names** are `module_NN`, zero padded so the convention holds if the curriculum grows past nine modules. This matches the two-digit form in `docs/` (`05-software-stack`). The module README's status table records the mapping.
- **Taxonomy filenames** follow `taxonomy_<Description>_v<X.Y>.md`. Spec filenames carry the page ID instead of a version, and a spec is revised in place or replaced (see section 6).
- **One current taxonomy.** Only one `taxonomy_*` file sits at a module root. Everything older is in `archive/`.
- **Status header.** The taxonomy file opens with its status, version and date. A spec that has been reviewed against a taxonomy revision should say so in its header.
- **Plain Markdown.** Specs are Markdown, not `.docx`. Keep original `.docx` files only in `archive/docx/`.
- **Links are relative**, so they work from GitHub and from an editor.
- **Cross-module links and references** between module documents are deferred to the hardening pass unless a taxonomy explicitly asks for them.
