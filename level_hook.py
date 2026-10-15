"""MkDocs hook that checks experience-level markup at build time.

Pages tag higher-level content with
    <div class="qed-level" data-min-level="intermediate" markdown="1"> ... </div>
(see docs/assets/javascripts/level.js and llm/CONVENTIONS.md). A typo in the
level value would silently leave the block hidden for everyone, and a missing
markdown="1" would leave its Markdown unprocessed, so both fail the build.

It also logs how many gated blocks each page has, as a coverage aid for
content-hardening passes.
"""

import logging
import re

from mkdocs.exceptions import PluginError

log = logging.getLogger("mkdocs.hooks.level")

ALLOWED = {"intermediate", "advanced"}
LEVEL_ATTR = re.compile(r'data-min-level\s*=\s*"([^"]*)"')
LEVEL_TAG = re.compile(r"<div\b[^>]*\bqed-level\b[^>]*>")


def on_page_markdown(markdown, page, config, files):
    errors = []

    for value in LEVEL_ATTR.findall(markdown):
        if value not in ALLOWED:
            errors.append(f"unknown data-min-level value '{value}' (allowed: {', '.join(sorted(ALLOWED))})")

    counts = {}
    for tag in LEVEL_TAG.findall(markdown):
        match = LEVEL_ATTR.search(tag)
        if not match:
            errors.append("a qed-level block has no data-min-level attribute")
            continue
        if 'markdown="1"' not in tag:
            errors.append(f"a qed-level block ({match.group(1)}) is missing markdown=\"1\"")
        counts[match.group(1)] = counts.get(match.group(1), 0) + 1

    if errors:
        raise PluginError(f"{page.file.src_uri}: invalid experience-level markup:\n  " + "\n  ".join(errors))

    if counts:
        summary = ", ".join(f"{n} {level}" for level, n in sorted(counts.items()))
        log.info("Levels: %s has gated blocks (%s)", page.file.src_uri, summary)

    return markdown
