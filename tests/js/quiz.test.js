// Tests for docs/assets/javascripts/quiz.js (window.QedQuiz).
// Only the pure model (validate and check) is tested here; mount() builds DOM
// and is verified in the browser. Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const Z = loadModule("quiz.js").QedQuiz;

function config() {
  return {
    title: "Check",
    items: [
      {
        prompt: "Which is a state?",
        label: "State or outcome",
        options: [
          { label: "State", correct: true, why: "It describes what was prepared." },
          { label: "Outcome", correct: false, why: "That is one measurement's result." },
        ],
      },
    ],
  };
}

test("a well-formed config validates", () => {
  assert.equal(Z.validate(config()), true);
});

test("check reports correctness and an explanatory text for both kinds of answer", () => {
  const right = Z.check(config(), 0, 0);
  assert.equal(right.correct, true);
  assert.equal(right.text, "Correct. It describes what was prepared.");
  const wrong = Z.check(config(), 0, 1);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.text, "Not quite. That is one measurement's result.");
});

test("several options may be correct", () => {
  const c = config();
  c.items[0].options.push({ label: "Both", correct: true, why: "Either works." });
  assert.equal(Z.validate(c), true);
  assert.equal(Z.check(c, 0, 2).correct, true);
});

test("check rejects an unknown item or option", () => {
  assert.throws(() => Z.check(config(), 3, 0), /no such item/);
  assert.throws(() => Z.check(config(), 0, 9), /no such item/);
});

test("validate rejects a config with no items", () => {
  assert.throws(() => Z.validate(null), /non-empty array/);
  assert.throws(() => Z.validate({}), /non-empty array/);
  assert.throws(() => Z.validate({ items: [] }), /non-empty array/);
});

test("validate rejects an item without a prompt, a label, or enough options", () => {
  let c = config();
  c.items[0].prompt = "";
  assert.throws(() => Z.validate(c), /prompt/);
  c = config();
  delete c.items[0].label;
  assert.throws(() => Z.validate(c), /label/);
  c = config();
  c.items[0].options = [c.items[0].options[0]];
  assert.throws(() => Z.validate(c), /at least two options/);
});

test("validate rejects an option without a label, a boolean, or an explanation", () => {
  let c = config();
  c.items[0].options[0].label = "";
  assert.throws(() => Z.validate(c), /needs a label/);
  c = config();
  c.items[0].options[0].correct = "yes";
  assert.throws(() => Z.validate(c), /boolean/);
  c = config();
  c.items[0].options[1].why = "";
  assert.throws(() => Z.validate(c), /why/);
});

test("validate rejects an item with no correct option", () => {
  const c = config();
  c.items[0].options[0].correct = false;
  assert.throws(() => Z.validate(c), /no correct option/);
});

test("validate names which item is wrong", () => {
  const c = config();
  c.items.push({ prompt: "Second", label: "second", options: [{ label: "a", correct: false, why: "x" }, { label: "b", correct: false, why: "y" }] });
  assert.throws(() => Z.validate(c), /item 1 has no correct option/);
});
