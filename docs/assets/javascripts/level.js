// Experience-level support (Beginner / Intermediate / Advanced), site-wide.
//
// One canonical page, cumulative levels: Intermediate shows Beginner +
// Intermediate, Advanced shows all three. Authors tag a block with
//   <div class="qed-level" data-min-level="intermediate" markdown="1"> ... </div>
// and CSS (extra.css) hides it below that level. The chosen level is remembered
// in localStorage under "qed-level", and applied before first paint by an
// inline script in overrides/main.html (keep the two in sync).
//
// This file provides:
//   window.QedLevel  get(), set(level), atLeast(level), onChange(fn), LEVELS
//   the header selector, the per-page note, table-of-contents filtering, and
//   auto-reveal of a deep link that targets hidden content.
//
// Loaded site-wide via extra_javascript like the other shared scripts. The
// selector is always shown; the other behavior is a no-op on pages with no
// .qed-level blocks. Interactive components may read QedLevel to show deeper
// detail, but their Beginner behavior must not depend on it.
window.QedLevel = (function () {
  var LEVELS = ["beginner", "intermediate", "advanced"];
  var LABELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
  var KEY = "qed-level";
  var listeners = [];

  function valid(level) {
    return LEVELS.indexOf(level) !== -1;
  }

  function read() {
    try {
      var stored = localStorage.getItem(KEY);
      if (valid(stored)) return stored;
    } catch (e) {}
    return "beginner";
  }

  var current = document.documentElement.getAttribute("data-qed-level");
  if (!valid(current)) current = read();
  document.documentElement.setAttribute("data-qed-level", current);

  function rank(level) {
    return LEVELS.indexOf(level);
  }

  function atLeast(level) {
    return rank(current) >= rank(level);
  }

  function apply(level, remember) {
    if (!valid(level) || level === current) return;
    current = level;
    document.documentElement.setAttribute("data-qed-level", current);
    if (remember) {
      try {
        localStorage.setItem(KEY, current);
      } catch (e) {}
    }
    listeners.forEach(function (fn) {
      fn(current);
    });
    document.dispatchEvent(new CustomEvent("qed-level-change", { detail: { level: current } }));
  }

  return {
    LEVELS: LEVELS,
    LABELS: LABELS,
    KEY: KEY,
    get: function () {
      return current;
    },
    set: function (level) {
      apply(level, true);
    },
    // Used when another tab changed the stored value: follow it without writing back.
    follow: function (level) {
      apply(level, false);
    },
    atLeast: atLeast,
    rank: rank,
    onChange: function (fn) {
      listeners.push(fn);
    },
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  var QL = window.QedLevel;
  var LABELS = QL.LABELS;

  // ---- header selector -----------------------------------------------------
  var announcer = document.createElement("div");
  announcer.className = "qed-sr-only";
  announcer.setAttribute("role", "status");
  announcer.setAttribute("aria-live", "polite");
  document.body.appendChild(announcer);

  var select = null;
  function buildSelector() {
    var header = document.querySelector(".md-header__inner");
    if (!header || header.querySelector(".qed-level-select")) return;
    var wrap = document.createElement("div");
    wrap.className = "md-header__option qed-level-select";
    var label = document.createElement("label");
    label.className = "qed-level-select__label";
    label.setAttribute("for", "qed-level-select");
    label.textContent = "Level";
    select = document.createElement("select");
    select.id = "qed-level-select";
    QL.LEVELS.forEach(function (level) {
      var opt = document.createElement("option");
      opt.value = level;
      opt.textContent = LABELS[level];
      select.appendChild(opt);
    });
    select.value = QL.get();
    select.addEventListener("change", function () {
      QL.set(select.value);
    });
    wrap.appendChild(label);
    wrap.appendChild(select);
    var title = header.querySelector(".md-header__title");
    if (title) title.insertAdjacentElement("afterend", wrap);
    else header.appendChild(wrap);
  }
  buildSelector();

  // ---- blocks, note, table of contents -------------------------------------
  function blocks() {
    return Array.prototype.slice.call(document.querySelectorAll(".qed-level[data-min-level]"));
  }

  function note() {
    var existing = document.querySelector(".qed-level-note");
    var h1 = document.querySelector(".md-content__inner h1");
    if (!h1) return null;
    if (existing) return existing;
    var p = document.createElement("p");
    p.className = "qed-level-note";
    p.setAttribute("role", "status");
    p.hidden = true;
    h1.insertAdjacentElement("afterend", p);
    return p;
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  function updateNote() {
    var el = note();
    if (!el) return;
    var cur = QL.get();
    var curRank = QL.rank(cur);
    var all = blocks();
    var counts = { intermediate: 0, advanced: 0 };
    all.forEach(function (b) {
      var m = b.getAttribute("data-min-level");
      if (counts[m] !== undefined) counts[m]++;
    });

    var messages = [];
    var raiseTo = null;

    // Hidden at the current level
    var hiddenParts = [];
    QL.LEVELS.forEach(function (level) {
      if (level !== "beginner" && QL.rank(level) > curRank && counts[level] > 0) {
        hiddenParts.push(plural(counts[level], LABELS[level] + " section"));
        if (raiseTo === null) raiseTo = level;
      }
    });
    // Chosen level has nothing of its own on this page
    if (curRank > 0 && counts[cur] === 0) {
      var shown = "Beginner";
      for (var r = curRank - 1; r >= 1; r--) {
        if (counts[QL.LEVELS[r]] > 0) {
          shown = LABELS[QL.LEVELS[r]];
          break;
        }
      }
      messages.push("No " + LABELS[cur] + " content on this page yet. Showing " + shown + ".");
    }
    if (hiddenParts.length) {
      messages.push("This page has " + hiddenParts.join(" and ") + " hidden at your current level.");
    }

    if (!messages.length) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.textContent = messages.join(" ") + " ";
    if (raiseTo) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qed-level-note__button";
      btn.textContent = "Show " + LABELS[raiseTo];
      var target = raiseTo;
      btn.addEventListener("click", function () {
        QL.set(target);
      });
      el.appendChild(btn);
    }
    el.hidden = false;
  }

  // Highest level a given element needs, from the gated blocks around it.
  function neededLevel(el) {
    var need = "beginner";
    var node = el;
    while (node && node !== document.body) {
      if (node.matches && node.matches(".qed-level[data-min-level]")) {
        var m = node.getAttribute("data-min-level");
        if (QL.rank(m) > QL.rank(need)) need = m;
      }
      node = node.parentElement;
    }
    return need;
  }

  function updateToc() {
    var links = document.querySelectorAll(".md-nav--secondary a.md-nav__link[href^='#']");
    Array.prototype.forEach.call(links, function (a) {
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      var target = document.getElementById(id);
      var li = a.closest("li");
      if (!target || !li) return;
      li.hidden = QL.rank(neededLevel(target)) > QL.rank(QL.get());
    });
  }

  function revealHashTarget() {
    var id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    var need = neededLevel(target);
    if (QL.rank(need) > QL.rank(QL.get())) {
      QL.set(need);
      announcer.textContent = "Showing " + LABELS[need] + " content to reach this section.";
    }
    target.scrollIntoView();
  }

  function refresh() {
    if (select) select.value = QL.get();
    updateNote();
    updateToc();
  }

  QL.onChange(function (level) {
    refresh();
    announcer.textContent = "Level set to " + LABELS[level] + ".";
  });

  // Follow a change made in another tab.
  window.addEventListener("storage", function (e) {
    if (e.key === QL.KEY && e.newValue) QL.follow(e.newValue);
  });
  window.addEventListener("hashchange", revealHashTarget);

  refresh();
  revealHashTarget();
});
