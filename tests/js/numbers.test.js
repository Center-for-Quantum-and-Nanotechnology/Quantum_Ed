// Tests for docs/assets/javascripts/numbers.js (window.QedNumbers).
// Run from this directory: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadModule } = require("./load.js");

const N = loadModule("numbers.js").QedNumbers;

test("pct turns a fraction into a percentage with the chosen number of decimals", () => {
  assert.equal(N.pct(0.5), "50%");
  assert.equal(N.pct(0.5, 1), "50.0%");
  assert.equal(N.pct(1 / 3, 1), "33.3%");
  assert.equal(N.pct(0), "0%");
  assert.equal(N.pct(1), "100%");
});

test("signed writes an explicit sign, with a real minus sign", () => {
  assert.equal(N.signed(0.7071), "+0.71");
  assert.equal(N.signed(-0.7071), "−0.71");
  assert.equal(N.signed(0), "+0.00");
  assert.equal(N.signed(1, 0), "+1");
  assert.equal(N.signed(-0.5, 1), "−0.5");
});

test("grouped puts commas in whole numbers and rounds the rest", () => {
  assert.equal(N.grouped(0), "0");
  assert.equal(N.grouped(999), "999");
  assert.equal(N.grouped(1000), "1,000");
  assert.equal(N.grouped(1234567), "1,234,567");
  assert.equal(N.grouped(1234.6), "1,235");
  assert.equal(N.grouped(1e15), "1,000,000,000,000,000");
});

test("sci writes a mantissa and an exponent, and carries when rounding reaches ten", () => {
  assert.equal(N.sci(0), "0");
  assert.equal(N.sci(3.2e8), "3.2 × 10<sup>8</sup>");
  assert.equal(N.sci(1), "1.0 × 10<sup>0</sup>");
  assert.equal(N.sci(1e9), "1.0 × 10<sup>9</sup>");
  assert.equal(N.sci(9.96e5), "1.0 × 10<sup>6</sup>", "9.96 rounds up to 10, so the exponent goes up");
  assert.equal(N.sci(9.94e5), "9.9 × 10<sup>5</sup>");
  assert.equal(N.sci(2.5e-3, 2), "2.50 × 10<sup>-3</sup>");
  assert.equal(N.sci(1.2346e12, 3), "1.235 × 10<sup>12</sup>");
});

test("human groups below a billion and uses scientific notation from there", () => {
  assert.equal(N.human(999999999), "999,999,999");
  assert.equal(N.human(1e9), "1.0 × 10<sup>9</sup>");
  assert.equal(N.human(2.5e15), "2.5 × 10<sup>15</sup>");
  assert.equal(N.human(0), "0");
  assert.equal(N.human(42), "42");
});

test("bytes uses decimal units and keeps about three significant digits", () => {
  assert.equal(N.bytes(0), "0 bytes");
  assert.equal(N.bytes(1), "1 byte");
  assert.equal(N.bytes(2), "2 bytes");
  assert.equal(N.bytes(999), "999 bytes");
  assert.equal(N.bytes(1000), "1.00 KB");
  assert.equal(N.bytes(17.2e9), "17.2 GB");
  assert.equal(N.bytes(16e9), "16.0 GB");
  assert.equal(N.bytes(250e6), "250 MB");
  assert.equal(N.bytes(2e12), "2.00 TB");
  assert.equal(N.bytes(1e15), "1.00 PB");
  assert.equal(N.bytes(Math.pow(2, 60) * 16), "18.4 EB");
  assert.ok(/ZB$/.test(N.bytes(1e30)), "the largest unit is ZB");
});

test("the memory for n qubits grows as 2^n amplitudes of 16 bytes", () => {
  // the numbers shown on the Why Quantum Computing? page
  assert.equal(N.grouped(Math.pow(2, 10)), "1,024");
  assert.equal(N.bytes(Math.pow(2, 30) * 16), "17.2 GB");
  assert.equal(N.bytes(Math.pow(2, 40) * 16), "17.6 TB");
});
