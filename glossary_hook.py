"""MkDocs hook that renders the global glossary from structured data.

Glossary content lives in data/glossary/*.yml (one file per category, plus
categories.yml) following the schema in the glossary spec: id, term,
aliases, definition, beginnerInterpretation, relatedTerms, moduleReferences,
category. This hook validates that data at build time and renders it into
docs/glossary.md wherever the PLACEHOLDER comment appears, so the page is
plain static HTML (indexable by site search, readable without JavaScript)
while the data stays presentation-independent.

Validation failures abort the build, so a dead related-term ID or a link to
a page that no longer exists can't ship silently.
"""

import html
import logging
import re
from pathlib import Path

import yaml
from mkdocs.exceptions import PluginError
from mkdocs.utils import get_relative_url

log = logging.getLogger("mkdocs.hooks.glossary")

GLOSSARY_PAGE = "glossary.md"
PLACEHOLDER = "<!-- glossary:entries -->"
DATA_SUBDIR = Path("data") / "glossary"
CATEGORIES_FILE = "categories.yml"
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REQUIRED_FIELDS = ("id", "term", "definition", "beginnerInterpretation", "category")

# Filled in by on_nav on every build (so `mkdocs serve` always sees fresh data).
_state = {"categories": [], "entries": [], "labels": {}}


def _root(config):
    return Path(config["config_file_path"]).parent


def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _load(root):
    data_dir = root / DATA_SUBDIR
    if not data_dir.is_dir():
        raise PluginError(f"Glossary data directory not found: {data_dir}")
    categories = yaml.safe_load((data_dir / CATEGORIES_FILE).read_text(encoding="utf-8"))
    entries = []
    for path in sorted(data_dir.glob("*.yml")):
        if path.name == CATEGORIES_FILE:
            continue
        loaded = yaml.safe_load(path.read_text(encoding="utf-8")) or []
        for entry in loaded:
            entry["_source"] = path.name
            entries.append(entry)
    return categories, entries


def _nav_labels(nav):
    """Map each nav page's src path to ('Module name', 'Page title')."""
    labels = {}
    for page in nav.pages:
        top = page
        while top.parent is not None:
            top = top.parent
        module = None
        if top is not page:
            module = re.sub(r"^\d+\s*[·.\-]\s*", "", top.title or "").strip()
        title = page.title or (page.parent.title if page.parent is not None else None) or page.file.src_uri
        labels[page.file.src_uri] = (module, title)
    return labels


def _validate(categories, entries, labels):
    errors = []
    category_ids = {c["id"] for c in categories}
    ids = {}
    for e in entries:
        where = f"{e.get('_source', '?')}:{e.get('id', '?')}"
        for field in REQUIRED_FIELDS:
            if not isinstance(e.get(field), str) or not e[field].strip():
                errors.append(f"{where}: missing or empty '{field}'")
        eid = e.get("id")
        if isinstance(eid, str):
            if not ID_RE.match(eid):
                errors.append(f"{where}: id must be lowercase kebab-case")
            if eid in ids:
                errors.append(f"{where}: duplicate id (also in {ids[eid]})")
            ids[eid] = e.get("_source")
        if e.get("category") not in category_ids:
            errors.append(f"{where}: unknown category '{e.get('category')}'")
        for field in ("aliases", "relatedTerms", "moduleReferences"):
            if not isinstance(e.get(field, []), list):
                errors.append(f"{where}: '{field}' must be a list")

    names = {}
    anchors = set(ids)
    for e in entries:
        if not isinstance(e.get("id"), str):
            continue
        where = f"{e['_source']}:{e['id']}"
        for name in [e.get("term", "")] + list(e.get("aliases") or []):
            key = name.strip().lower()
            if key in names and names[key] != e["id"]:
                errors.append(f"{where}: name '{name}' already used by '{names[key]}'")
            names[key] = e["id"]
        for alias in e.get("aliases") or []:
            slug = _slug(alias)
            if slug in anchors and slug != e["id"]:
                errors.append(f"{where}: alias '{alias}' would collide with anchor '#{slug}'")
            anchors.add(slug)

    for e in entries:
        if not isinstance(e.get("id"), str):
            continue
        where = f"{e['_source']}:{e['id']}"
        related = e.get("relatedTerms") or []
        for rid in related:
            if rid not in ids:
                errors.append(f"{where}: relatedTerms references unknown id '{rid}'")
            if rid == e["id"]:
                errors.append(f"{where}: relatedTerms lists the entry itself")
        if len(set(related)) != len(related):
            errors.append(f"{where}: duplicate relatedTerms")
        if not 2 <= len(related) <= 6:
            log.warning("Glossary entry '%s' has %d related terms (spec prefers 2-6)", e["id"], len(related))
        for ref in e.get("moduleReferences") or []:
            if ref not in labels:
                errors.append(f"{where}: moduleReferences '{ref}' is not a page in the site nav")

    if errors:
        raise PluginError("Glossary data is invalid:\n  " + "\n  ".join(errors))


def on_nav(nav, config, files):
    categories, entries = _load(_root(config))
    labels = _nav_labels(nav)
    _validate(categories, entries, labels)
    _state.update(categories=categories, entries=entries, labels=labels)
    log.info("Glossary: %d entries in %d categories", len(entries), len(categories))
    return nav


def on_serve(server, config, builder):
    server.watch(str(_root(config) / DATA_SUBDIR))
    return server


def _e(text):
    return html.escape(str(text), quote=True)


def _render_entry(entry, by_id, page, files):
    eid = entry["id"]
    aliases = entry.get("aliases") or []
    parts = [
        f'<article class="qed-gloss-entry" data-category="{_e(entry["category"])}">'
    ]
    # The id lives on the <h3> (not the <article>) because MkDocs' search indexer
    # only treats a heading as a section when the heading itself has an id.
    # Extra anchors so a link to #qec lands on the same entry as #quantum-error-correction.
    for alias in aliases:
        slug = _slug(alias)
        if slug != eid:
            parts.append(f'<span class="qed-gloss-alias-anchor" id="{_e(slug)}"></span>')
    parts.append(
        f'<h3 class="qed-gloss-term" id="{_e(eid)}">{_e(entry["term"])}'
        f'<a class="headerlink" href="#{_e(eid)}" title="Permanent link">&para;</a></h3>'
    )
    if aliases:
        parts.append(
            '<p class="qed-gloss-aliases"><span class="qed-gloss-label">Also known as</span> '
            + ", ".join(_e(a) for a in aliases)
            + "</p>"
        )
    parts.append(
        f'<p class="qed-gloss-def"><span class="qed-gloss-label">Definition</span> {_e(entry["definition"])}</p>'
    )
    parts.append(
        '<p class="qed-gloss-beginner"><span class="qed-gloss-label">Beginner interpretation</span> '
        f'{_e(entry["beginnerInterpretation"])}</p>'
    )
    related = entry.get("relatedTerms") or []
    if related:
        links = ", ".join(f'<a href="#{_e(rid)}">{_e(by_id[rid]["term"])}</a>' for rid in related)
        parts.append(f'<p class="qed-gloss-related"><span class="qed-gloss-label">Related terms</span> {links}</p>')
    refs = entry.get("moduleReferences") or []
    if refs:
        links = []
        for ref in refs:
            target = files.get_file_from_path(ref)
            if target is None:
                raise PluginError(f"Glossary entry '{eid}' references missing page '{ref}'")
            module, title = _state["labels"][ref]
            label = f"{module} → {title}" if module else title
            links.append(f'<a href="{_e(get_relative_url(target.url, page.url))}">{_e(label)}</a>')
        parts.append(
            '<p class="qed-gloss-appears"><span class="qed-gloss-label">Appears in</span> '
            + " &middot; ".join(links)
            + "</p>"
        )
    parts.append("</article>")
    return "".join(parts)


def _render(page, files):
    categories = _state["categories"]
    entries = _state["entries"]
    by_id = {e["id"]: e for e in entries}

    # Raw HTML blocks must not contain blank lines (Markdown would end the
    # block there), so each block below is joined with single newlines. Only
    # the category headings are real Markdown, so the page's table of contents
    # lists the categories and not all ~150 entries.
    controls = "\n".join(
        [
            '<div class="qed-gloss-controls" id="qed-glossary">',
            '<label class="qed-gloss-search-label" for="qed-gloss-search">Filter terms</label>',
            '<input type="search" id="qed-gloss-search" class="qed-gloss-search" '
            'placeholder="Search terms, abbreviations, and definitions" autocomplete="off">',
            f'<p class="qed-gloss-count" aria-live="polite">{len(entries)} terms</p>',
            '<p class="qed-gloss-empty" hidden>No terms match that filter. Try a different word, or choose All.</p>',
            "</div>",
        ]
    )

    out = [controls, ""]
    for c in categories:
        in_cat = sorted((e for e in entries if e["category"] == c["id"]), key=lambda e: e["term"].lower())
        if not in_cat:
            continue
        section = [f'<section class="qed-gloss-cat" data-category="{_e(c["id"])}">']
        section.append(f'<p class="qed-gloss-cat-desc">{_e(c["description"])}</p>')
        section.extend(_render_entry(e, by_id, page, files) for e in in_cat)
        section.append("</section>")
        out.append(f'## {c["name"]} {{ #category-{c["id"]} }}')
        out.append("")
        out.append("\n".join(section))
        out.append("")
    return "\n".join(out)


def on_page_markdown(markdown, page, config, files):
    if page.file.src_uri != GLOSSARY_PAGE:
        return markdown
    if PLACEHOLDER not in markdown:
        raise PluginError(f"{GLOSSARY_PAGE} must contain the placeholder {PLACEHOLDER}")
    return markdown.replace(PLACEHOLDER, _render(page, files))


def on_page_context(context, page, config, nav):
    if page.file.src_uri == GLOSSARY_PAGE and config.get("repo_url"):
        page.edit_url = config["repo_url"].rstrip("/") + "/tree/main/data/glossary"
    return context
