// QedUI — small view helpers shared by components. Pure string builders
// and formatters; no DOM access, no state. They return HTML strings that
// use the shared classes defined in docs/assets/stylesheets/extra.css.
//
// Only numbers and fixed labels are interpolated, so the results are safe
// to assign to innerHTML. Never pass user-typed text through these.
window.QedUI = (function () {
  function pct(x, digits) {
    return (x * 100).toFixed(digits === undefined ? 0 : digits) + "%";
  }

  function signed(x, digits) {
    return (x < 0 ? "−" : "+") + Math.abs(x).toFixed(digits === undefined ? 2 : digits);
  }

  // Probability row: label, filled bar, percent. opts:
  //   accent: "quantum" (blue) | "protected" (green) | "noise" (orange) |
  //           "error" (red); omitted = neutral gray. Colors are the shared
  //           visual-language tokens in extra.css.
  //   marker: a probability 0..1 drawn as a dark tick (the "expected" value)
  //   labelWidth: CSS width of the label column, e.g. "5.2rem"
  //   text: replaces the right-hand percent text
  function probRow(label, p, opts) {
    opts = opts || {};
    var accent = opts.accent === "quantum" ? "logical" : opts.accent;
    var fill = "qed-confidence-bar__fill" + (accent ? " qed-confidence-bar__fill--" + accent : "");
    var marker = opts.marker === undefined ? "" :
      '<div class="qed-confidence-bar__marker" style="left:calc(' + (opts.marker * 100) + '% - 1px)"></div>';
    return (
      '<div class="qed-confidence-row">' +
      '<span class="qed-confidence-row__label" style="flex-basis:' + (opts.labelWidth || "5.2rem") + ';">' + label + "</span>" +
      '<div class="qed-confidence-bar' + (opts.marker === undefined ? "" : " qed-confidence-bar--marked") + '">' +
      '<div class="' + fill + '" style="width:' + (Math.max(0, Math.min(1, p)) * 100) + '%"></div>' + marker + "</div>" +
      '<span class="qed-confidence-row__pct"' + (opts.textWidth ? ' style="flex-basis:' + opts.textWidth + ';"' : "") + ">" +
      (opts.text === undefined ? pct(p) : opts.text) + "</span></div>"
    );
  }

  // Signed amplitude row: bar extends right of center for +, left (hatched)
  // for −, and the sign is also written in text so it never relies on color.
  function ampRow(label, a) {
    var width = Math.min(Math.abs(a), 1) * 50;
    return (
      '<div class="qed-amp-row"><span class="qed-amp-row__label">' + label + "</span>" +
      '<div class="qed-amp-bar"><div class="qed-amp-bar__fill' + (a < 0 ? " qed-amp-bar__fill--neg" : "") +
      '" style="width:' + width + '%"></div></div>' +
      '<span class="qed-amp-row__val">' + signed(a) + "</span></div>"
    );
  }

  // 1,234,567 style grouping for whole numbers up to ~1e15.
  function grouped(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Compact scientific notation using HTML superscripts: 3.2 × 10<sup>8</sup>.
  function sci(x, digits) {
    if (x === 0) return "0";
    var exp = Math.floor(Math.log10(Math.abs(x)));
    var mant = x / Math.pow(10, exp);
    var d = digits === undefined ? 1 : digits;
    if (Number(mant.toFixed(d)) >= 10) { mant /= 10; exp += 1; }
    return mant.toFixed(d) + " × 10<sup>" + exp + "</sup>";
  }

  // Readable number: grouped when < 1e9, scientific beyond that (HTML).
  function human(x) {
    if (x < 1e9) return grouped(x);
    return sci(x, 1);
  }

  // Bytes with decimal (SI) units, which is what vendors and spec sheets use.
  function bytes(b) {
    var units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
    var i = 0;
    var v = b;
    while (v >= 1000 && i < units.length - 1) { v /= 1000; i++; }
    return (v >= 100 || i === 0 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + " " + units[i];
  }

  return { pct: pct, signed: signed, probRow: probRow, ampRow: ampRow, grouped: grouped, sci: sci, human: human, bytes: bytes };
})();
