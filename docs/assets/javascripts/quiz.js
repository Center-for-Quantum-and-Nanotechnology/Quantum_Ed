// Shared multiple-choice check module: small "answer and get immediate
// feedback" questions, used by the Module 02 pages (02.01 Quantum States and
// 02.02 Qubit Representation first) and available to any page.
//
// Loaded site-wide via extra_javascript like the other shared modules; a no-op
// on pages that don't call it. Page scripts that use window.QedQuiz must run
// inside a DOMContentLoaded listener.
//
// Separation convention (same as QedSurfaceCode / QedMatching):
//   model  -> validate(config), check(config, item, option): pure, no DOM
//   wiring -> mount(root, config) builds the buttons and feedback and handles
//             clicks; it is the only part that touches the DOM
//
// A config is:
//   { title, items: [ { prompt, label, options: [ { label, correct, why } ] } ] }
// Every option says why it is right or wrong, so feedback always explains the
// choice, including the wrong ones. Options may be marked correct more than
// once (several valid answers), but at least one must be.
window.QedQuiz = (function () {
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Throws a clear error for a malformed config, so a typo in a page fails
  // loudly in the browser console instead of leaving a broken question.
  function validate(config) {
    if (!config || !Array.isArray(config.items) || config.items.length < 1) {
      throw new Error("QedQuiz: config.items must be a non-empty array");
    }
    config.items.forEach(function (item, i) {
      var where = "QedQuiz: item " + i;
      if (typeof item.prompt !== "string" || !item.prompt) throw new Error(where + " needs a prompt");
      if (typeof item.label !== "string" || !item.label) throw new Error(where + " needs a label for assistive technology");
      if (!Array.isArray(item.options) || item.options.length < 2) throw new Error(where + " needs at least two options");
      var correct = 0;
      item.options.forEach(function (o, j) {
        if (typeof o.label !== "string" || !o.label) throw new Error(where + ", option " + j + " needs a label");
        if (typeof o.correct !== "boolean") throw new Error(where + ", option " + j + " needs a boolean 'correct'");
        if (typeof o.why !== "string" || !o.why) throw new Error(where + ", option " + j + " needs a 'why' explanation");
        if (o.correct) correct++;
      });
      if (correct < 1) throw new Error(where + " has no correct option");
    });
    return true;
  }

  // The result of choosing option `j` of item `i`: whether it was correct, and
  // the feedback text. Pure.
  function check(config, i, j) {
    var item = config.items[i];
    var option = item && item.options[j];
    if (!option) throw new Error("QedQuiz: no such item or option (" + i + ", " + j + ")");
    return {
      correct: option.correct,
      text: (option.correct ? "Correct. " : "Not quite. ") + option.why,
    };
  }

  // opts: { onAnswer(itemIndex, optionIndex, result) }
  function mount(root, config, opts) {
    opts = opts || {};
    validate(config);
    var html = config.title ? "<p><strong>" + esc(config.title) + "</strong></p>" : "";
    config.items.forEach(function (item, i) {
      html +=
        '<div class="qed-quiz__item" data-item="' + i + '">' +
        '<p class="qed-quiz__prompt">' + esc(item.prompt) + "</p>" +
        '<div class="qed-demo__controls" role="group" aria-label="' + esc(item.label) + '">' +
        item.options
          .map(function (o, j) {
            return '<button type="button" class="qed-button qed-button--secondary" data-option="' + j + '" aria-pressed="false">' + esc(o.label) + "</button>";
          })
          .join("") +
        "</div>" +
        '<p class="qed-quiz__feedback" aria-live="polite"></p></div>';
    });
    html += '<div class="qed-demo__controls"><button type="button" class="qed-button qed-button--secondary" data-quiz-reset>Try again</button></div>';
    root.innerHTML = html;

    function clearItem(el) {
      var fb = el.querySelector(".qed-quiz__feedback");
      fb.textContent = "";
      fb.className = "qed-quiz__feedback";
      Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) {
        b.classList.remove("qed-button--active");
        b.setAttribute("aria-pressed", "false");
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || !root.contains(btn)) return;
      if (btn.hasAttribute("data-quiz-reset")) {
        Array.prototype.forEach.call(root.querySelectorAll(".qed-quiz__item"), clearItem);
        if (opts.onReset) opts.onReset();
        return;
      }
      var itemEl = btn.closest(".qed-quiz__item");
      if (!itemEl) return;
      var i = Number(itemEl.dataset.item);
      var j = Number(btn.dataset.option);
      var result = check(config, i, j);
      Array.prototype.forEach.call(itemEl.querySelectorAll("button"), function (b) {
        var on = b === btn;
        b.classList.toggle("qed-button--active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var fb = itemEl.querySelector(".qed-quiz__feedback");
      fb.className = "qed-quiz__feedback " + (result.correct ? "is-correct" : "is-incorrect");
      fb.textContent = result.text;
      if (opts.onAnswer) opts.onAnswer(i, j, result);
    });
  }

  return { validate: validate, check: check, mount: mount };
})();
