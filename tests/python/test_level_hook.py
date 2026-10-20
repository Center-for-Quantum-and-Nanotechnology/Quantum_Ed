"""Tests for level_hook.py, the build check for experience-level markup.

Run from the repository root:
    python -m unittest discover -s tests/python -v

These need the packages in requirements.txt (the hook imports mkdocs).
"""

import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

import level_hook  # noqa: E402
from mkdocs.exceptions import PluginError  # noqa: E402

LOGGER = "mkdocs.hooks.level"


def page(src_uri="module/page.md"):
    return types.SimpleNamespace(file=types.SimpleNamespace(src_uri=src_uri))


def run(markdown, src_uri="module/page.md"):
    return level_hook.on_page_markdown(markdown, page(src_uri), {}, [])


class LevelHookTests(unittest.TestCase):
    def test_markdown_without_gated_blocks_is_unchanged_and_silent(self):
        text = "# Title\n\nPlain Beginner content.\n"
        with self.assertNoLogs(LOGGER, level="INFO"):
            self.assertEqual(run(text), text)

    def test_valid_blocks_pass_unchanged_and_are_counted(self):
        text = (
            '<div class="qed-level" data-min-level="intermediate" markdown="1">\n\nA\n\n</div>\n\n'
            '<div class="qed-level" data-min-level="advanced" markdown="1">\n\nB\n\n</div>\n'
        )
        with self.assertLogs(LOGGER, level="INFO") as logs:
            self.assertEqual(run(text, "m/p.md"), text)
        message = "\n".join(logs.output)
        self.assertIn("m/p.md", message)
        self.assertIn("1 advanced", message)
        self.assertIn("1 intermediate", message)

    def test_attribute_order_and_extra_classes_are_accepted(self):
        text = '<div data-min-level="advanced" class="foo qed-level" markdown="1">\n\nx\n\n</div>\n'
        self.assertEqual(run(text), text)

    def test_a_misspelled_level_fails_the_build(self):
        text = '<div class="qed-level" data-min-level="intermediat" markdown="1">\n\nx\n\n</div>\n'
        with self.assertRaises(PluginError) as ctx:
            run(text, "module/page.md")
        self.assertIn("intermediat", str(ctx.exception))
        self.assertIn("module/page.md", str(ctx.exception))

    def test_beginner_is_not_an_allowed_gate(self):
        text = '<div class="qed-level" data-min-level="beginner" markdown="1">\n\nx\n\n</div>\n'
        with self.assertRaises(PluginError):
            run(text)

    def test_a_block_without_markdown_attribute_fails_the_build(self):
        text = '<div class="qed-level" data-min-level="intermediate">\n\nx\n\n</div>\n'
        with self.assertRaises(PluginError) as ctx:
            run(text)
        self.assertIn('markdown="1"', str(ctx.exception))

    def test_a_block_without_a_level_fails_the_build(self):
        text = '<div class="qed-level" markdown="1">\n\nx\n\n</div>\n'
        with self.assertRaises(PluginError) as ctx:
            run(text)
        self.assertIn("data-min-level", str(ctx.exception))

    def test_all_problems_in_a_page_are_reported_together(self):
        text = (
            '<div class="qed-level" data-min-level="intermediat" markdown="1">\n\nx\n\n</div>\n'
            '<div class="qed-level" data-min-level="advanced">\n\ny\n\n</div>\n'
        )
        with self.assertRaises(PluginError) as ctx:
            run(text)
        message = str(ctx.exception)
        self.assertIn("intermediat", message)
        self.assertIn('markdown="1"', message)


if __name__ == "__main__":
    unittest.main()
