// Progressive-enhancement filter for the glossary page
// (docs/glossary.md, rendered by glossary_hook.py). The page is complete
// static HTML without this script; this adds text search and makes deep
// links work even when a filter hides the target.
// Loaded site-wide via extra_javascript like the other shared scripts, and
// a no-op on every other page.
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("qed-glossary");
  if (!root) return;

  var input = root.querySelector(".qed-gloss-search");
  var entries = Array.prototype.slice.call(document.querySelectorAll(".qed-gloss-entry"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".qed-gloss-cat"));
  var countEl = root.querySelector(".qed-gloss-count");
  var emptyEl = root.querySelector(".qed-gloss-empty");

  // Search only the term, its aliases, and the two descriptions. The
  // related-terms and appears-in lines are navigation, and matching them
  // would make "QEC" return every term that appears on a page titled
  // "Hardware-Aware QEC".
  var SEARCHABLE = ".qed-gloss-term, .qed-gloss-aliases, .qed-gloss-def, .qed-gloss-beginner";
  var haystacks = entries.map(function (el) {
    return Array.prototype.map
      .call(el.querySelectorAll(SEARCHABLE), function (n) {
        return n.textContent;
      })
      .join(" ")
      .toLowerCase();
  });

  function apply() {
    var tokens = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    entries.forEach(function (el, i) {
      var matches = tokens.every(function (t) {
        return haystacks[i].indexOf(t) !== -1;
      });
      el.hidden = !matches;
      if (matches) shown++;
    });
    sections.forEach(function (s) {
      var none = !s.querySelector(".qed-gloss-entry:not([hidden])");
      s.hidden = none;
      var heading = document.getElementById("category-" + s.getAttribute("data-category"));
      if (heading) heading.hidden = none;
    });
    countEl.textContent = shown === entries.length ? entries.length + " terms" : "Showing " + shown + " of " + entries.length + " terms";
    emptyEl.hidden = shown !== 0;
  }

  function revealHashTarget() {
    var id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    var entry = target && target.closest(".qed-gloss-entry");
    if (!entry) return;
    if (entry.hidden) {
      input.value = "";
      apply();
    }
    entry.scrollIntoView();
  }

  input.addEventListener("input", apply);
  window.addEventListener("hashchange", revealHashTarget);

  apply();
  revealHashTarget();
});
