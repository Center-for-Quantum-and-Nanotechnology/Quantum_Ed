// Inserts a "Download this module" button at the top of the primary
// nav sidebar, linking to the zip built by hooks.py for the module
// the current page belongs to.
(function () {
  function moduleSlugFromPath(pathname) {
    var segments = pathname.split("/").filter(Boolean);
    for (var i = 0; i < segments.length; i++) {
      if (/^\d{2}-[a-z-]+$/.test(segments[i])) {
        return segments[i];
      }
    }
    return null;
  }

  function init() {
    var existing = document.querySelector(".qed-download-button");
    if (existing) {
      existing.remove();
    }

    var sidebar = document.querySelector(
      ".md-sidebar--primary .md-sidebar__scrollwrap"
    );
    if (!sidebar) return;

    var rootMeta = document.querySelector('meta[name="qed-site-root"]');
    var siteRoot = rootMeta ? rootMeta.content : "./";
    var moduleSlug = moduleSlugFromPath(window.location.pathname);

    var btn = document.createElement("a");
    btn.className = "qed-download-button";

    if (moduleSlug) {
      btn.href = siteRoot.replace(/\/$/, "") + "/downloads/" + moduleSlug + ".zip";
      btn.setAttribute("download", "");
      btn.textContent = "⬇ Download this module";
    } else {
      btn.href = "#";
      btn.classList.add("qed-download-button--disabled");
      btn.setAttribute("aria-disabled", "true");
      btn.textContent = "⬇ Open a module to download it";
    }

    sidebar.parentNode.insertBefore(btn, sidebar);
  }

  if (window.document$) {
    // Material's navigation observable — fires on first load and every
    // subsequent instant-navigation page change.
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
