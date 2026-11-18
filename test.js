const assert = require("assert");
const WORDS = require("./words.js");
const G = require("./gen.js");

assert.strictEqual(WORDS.length, 7776);
assert(WORDS.every((w) => /^[a-z-]+$/.test(w)), "words are lowercase letters");
assert.strictEqual(new Set(WORDS).size, 7776, "no duplicates");

// entropy math
assert(Math.abs(G.entropyBits(7776, { count: 4, separator: "period" }) - 51.7) < 0.1);
assert(Math.abs(G.entropyBits(7776, { count: 6, separator: "period" }) - 77.55) < 0.1);
assert(Math.abs(G.entropyBits(7776, { count: 4, separator: "numbers", trailingDigit: true }) - (4 * Math.log2(7776) + 4 * Math.log2(10))) < 1e-9);
assert.strictEqual(G.strengthLabel(39), "Weak");
assert.strictEqual(G.strengthLabel(51.7), "Fair");
assert.strictEqual(G.strengthLabel(77), "Good");
assert.strictEqual(G.strengthLabel(90), "Strong");
assert.strictEqual(G.strengthLabel(120), "Excellent");

// format
const p = G.generate(WORDS, { count: 5, separator: "period" }, require("crypto").webcrypto);
assert.strictEqual(p.split(".").length, 5);
const q = G.generate(WORDS, { count: 4, separator: "numbers", capitalize: true, trailingDigit: true }, require("crypto").webcrypto);
assert(/^[A-Z][a-z-]*(\d[A-Z][a-z-]*){3}\d$/.test(q), q);

// uniformity sanity: 10 buckets, 200k draws
const c = new Array(10).fill(0);
for (let i = 0; i < 200000; i++) c[G.randInt(10, require("crypto").webcrypto)]++;
assert(c.every((n) => Math.abs(n - 20000) < 800), "digits roughly uniform " + c);

console.log("all tests passed");
