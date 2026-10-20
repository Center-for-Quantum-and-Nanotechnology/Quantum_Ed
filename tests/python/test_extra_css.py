"""Structure check for docs/assets/stylesheets/extra.css.

Run from the repository root:
    python -m unittest discover -s tests/python -v

A lost closing brace (or a lost comment opener) in this one big shared stylesheet
does not fail the build or show an error. Modern browsers treat every rule after the
mistake as nested inside the unclosed rule, so about half the site quietly loses its
styling. This test catches that kind of merge mistake: braces must balance, and a
plain rule must not contain another rule. Only the rules inside an at-rule such as
@media may be nested.
"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSS = ROOT / "docs" / "assets" / "stylesheets" / "extra.css"


def strip_comments(text):
    return re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), text, flags=re.S)


def problems(text):
    """Return a list of readable problems (empty when the structure is sound)."""
    found = []
    text = strip_comments(text)
    stack = []  # one entry per open block: the text that opened it
    buffer = ""
    line = 1
    for ch in text:
        if ch == "\n":
            line += 1
        if ch == "{":
            opener = buffer.strip()
            name = opener.splitlines()[-1].strip() if opener else ""  # the selector, not text left over before it
            if stack and not stack[-1][0].startswith("@"):
                found.append(
                    f"line {line}: rule '{name[:50]}' sits inside the unclosed rule "
                    f"'{stack[-1][0][:50]}' (opened on line {stack[-1][1]})"
                )
            stack.append((name, line))
            buffer = ""
        elif ch == "}":
            if not stack:
                found.append(f"line {line}: a closing brace with no open rule")
            else:
                stack.pop()
            buffer = ""
        elif ch == ";":
            buffer = ""
        else:
            buffer += ch
    for opener, opened in stack:
        found.append(f"line {opened}: the rule '{opener[:50]}' is never closed")
    return found


class ExtraCssStructure(unittest.TestCase):
    def test_the_stylesheet_is_structurally_sound(self):
        self.assertEqual(problems(CSS.read_text(encoding="utf-8")), [])


class TheCheckItself(unittest.TestCase):
    def test_a_missing_closing_brace_is_reported_with_the_rule_it_swallowed(self):
        broken = ".a {\n  color: red;\n\n/* next section */\n.b {\n  color: blue;\n}\n"
        found = problems(broken)
        self.assertTrue(any("'.b'" in p and "inside the unclosed rule '.a'" in p for p in found), found)
        self.assertTrue(any("'.a' is never closed" in p for p in found), found)

    def test_a_lost_comment_opener_is_reported(self):
        # the text of a comment left bare, with the brace and the opener gone
        broken = ".a {\n  color: red;\n   Module explorer, driven by something\n   ---- */\n.b {\n  color: blue;\n}\n"
        self.assertNotEqual(problems(broken), [])

    def test_extra_closing_brace_is_reported(self):
        self.assertTrue(any("no open rule" in p for p in problems(".a { color: red; }\n}\n")))

    def test_media_queries_may_nest_rules(self):
        ok = "@media (min-width: 40em) {\n  .a {\n    color: red;\n  }\n  .b {\n    color: blue;\n  }\n}\n.c { color: green; }\n"
        self.assertEqual(problems(ok), [])

    def test_comments_may_contain_braces_and_anything_else(self):
        ok = "/* a { b } c { \n still a comment */\n.a { color: red; }\n"
        self.assertEqual(problems(ok), [])

    def test_the_pre_merge_mistake_in_main_would_have_been_caught(self):
        before = (
            ".qed-circuit-gate-box--classical {\n  stroke-dasharray: 4 2;\n  stroke: var(--qed-color-physical);\n"
            "   Module 05 software-stack explorer (docs/05-software-stack/, driven by\n"
            "   ------------------------------------------------------------------- */\n"
            ".qed-stack__toolbar {\n  margin: 0.4rem 0;\n}\n"
        )
        self.assertTrue(any("'.qed-stack__toolbar'" in p for p in problems(before)))


if __name__ == "__main__":
    unittest.main()
