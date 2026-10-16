// Shared number-formatting module, used by the Module 01 pages that show
// quantities spanning many orders of magnitude (01 Why Quantum Computing? and
// 01 Quantum Computing Today) and available to any page that shows counts,
// memory sizes, or percentages.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op
// on pages that don't call it. Page scripts that use window.QedNumbers must run
// inside a DOMContentLoaded listener.
//
// Pure functions of numbers; no DOM, no state. `sci` and `human` return HTML
// (a superscript for the exponent), so assign their results with innerHTML or
// pass them to QedShots.renderBars as `textHtml`. Only numbers are interpolated,
// so the results are safe; never pass user-typed text through them.
window.QedNumbers = (function () {
  // 0.5 -> "50%". digits is the number of decimals (default 0).
  function pct(x, digits) {
    return (x * 100).toFixed(digits === undefined ? 0 : digits) + "%";
  }

  // A number with an explicit sign, using a real minus sign: "+0.71", "−0.71".
  function signed(x, digits) {
    return (x < 0 ? "−" : "+") + Math.abs(x).toFixed(digits === undefined ? 2 : digits);
  }

  // 1234567 -> "1,234,567" (whole numbers up to about 1e15).
  function grouped(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Compact scientific notation with an HTML superscript: 3.2 × 10<sup>8</sup>.
  function sci(x, digits) {
    if (x === 0) return "0";
    var exp = Math.floor(Math.log10(Math.abs(x)));
    var mant = x / Math.pow(10, exp);
    var d = digits === undefined ? 1 : digits;
    if (Number(mant.toFixed(d)) >= 10) {
      mant /= 10;
      exp += 1;
    }
    return mant.toFixed(d) + " × 10<sup>" + exp + "</sup>";
  }

  // A readable count: grouped below 1e9, scientific (HTML) from there up.
  function human(x) {
    return x < 1e9 ? grouped(x) : sci(x, 1);
  }

  // Bytes with decimal (SI) units, which is what vendors and spec sheets use.
  function bytes(b) {
    var units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
    var i = 0;
    var v = b;
    while (v >= 1000 && i < units.length - 1) {
      v /= 1000;
      i++;
    }
    if (i === 0) return v === 1 ? "1 byte" : v.toFixed(0) + " bytes";
    return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + " " + units[i];
  }

  return { pct: pct, signed: signed, grouped: grouped, sci: sci, human: human, bytes: bytes };
})();
