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
const q = G.generate(WORDS, { count: 4, separator: "numbers", trailingDigit: true }, require("crypto").webcrypto);
assert(/^[a-z-]+(\d[a-z-]+){3}\d$/.test(q), q);

// uniformity sanity: 10 buckets, 200k draws
const c = new Array(10).fill(0);
for (let i = 0; i < 200000; i++) c[G.randInt(10, require("crypto").webcrypto)]++;
assert(c.every((n) => Math.abs(n - 20000) < 800), "digits roughly uniform " + c);

// separators
const W = require("crypto").webcrypto;
for (const [name, ch] of [["hyphen", "-"], ["space", " "], ["comma", ","], ["semicolon", ";"], ["period", "."]]) {
  const r = G.generate(["aa"], { count: 3, separator: name }, W);
  assert.strictEqual(r, ["aa", "aa", "aa"].join(ch), name);
}

// caps count
const base = ["one", "two", "three", "four", "five", "six"];
for (let k = 0; k <= 6; k++) {
  const r = G.generate(base, { count: 6, separator: "space", capsCount: k }, W);
  const n = r.split(" ").filter((w) => w === w.toUpperCase()).length;
  assert.strictEqual(n, k, r);
}
assert.strictEqual(G.generate(base, { count: 3, separator: "space", capsCount: 99 }, W).split(" ").every((w) => w === w.toUpperCase()), true);
// caps positions roughly uniform
const pos = new Array(5).fill(0);
for (let i = 0; i < 50000; i++) G.generate(["a","b","c","d","e"], { count: 5, separator: "space", capsCount: 1 }, W).split(" ").forEach((w, j) => { if (w === w.toUpperCase()) pos[j]++; });
assert(pos.every((n) => Math.abs(n - 10000) < 500), "caps positions " + pos);
// caps entropy: C(5,2)=10
assert(Math.abs(G.entropyBits(7776, { count: 5, separator: "space", capsCount: 2 }) - (5 * Math.log2(7776) + Math.log2(10))) < 1e-9);

// word filter
const F6 = G.filterWords(WORDS, { maxLen: 6, separator: "period" });
assert(F6.length > 2000 && F6.every((w) => w.length <= 6));
assert(G.filterWords(WORDS, { separator: "hyphen" }).every((w) => !w.includes("-")));
assert(G.filterWords(WORDS, { separator: "period" }).length === 7776);
assert(G.filterWords(WORDS, { maxLen: 5, separator: "comma" }).length > 1400);

// filter memoization returns the same array; unfiltered returns the source
assert.strictEqual(G.filterWords(WORDS, { maxLen: 6, separator: "comma" }), G.filterWords(WORDS, { maxLen: 6, separator: "period" }));
assert.strictEqual(G.filterWords(WORDS, { separator: "period" }), WORDS);

// sparse pickDistinct: exact count and uniform positions via caps with n=15
for (let k = 0; k <= 15; k++) {
  const r = G.generate(Array(15).fill("a"), { count: 15, separator: "space", capsCount: k }, W);
  assert.strictEqual(r.split(" ").filter((w) => w === "A").length, k);
}

// extra lists, symbol, easy-read
for (const f of ["./words-short1.js", "./words-short2.js", "./words-fil.js"]) {
  const L = require(f);
  assert(L.every((w) => /^[a-z]+(-[a-z]+)*$/.test(w)) && new Set(L).size === L.length, f);
}
assert.strictEqual(require("./words-short1.js").length, 1296);
assert.strictEqual(require("./words-short2.js").length, 1296);
const combo = G.buildList("large+fil", { large: WORDS, fil: require("./words-fil.js") });
assert.strictEqual(new Set(combo).size, combo.length);
for (let i = 0; i < 300; i++) {
  const r = G.generate(["aa"], { count: 3, separator: "numbers", trailingDigit: true, trailingSymbol: true, easyRead: true }, W);
  assert(/^aa[2-9]aa[2-9]aa[2-9][!@#$%&*?=+]$/.test(r), r);
}
assert(Math.abs(G.entropyBits(1000, { count: 2, separator: "period", trailingSymbol: true }) - (2 * Math.log2(1000) + Math.log2(10))) < 1e-9);
assert(Math.abs(G.entropyBits(1000, { count: 2, separator: "period", trailingDigit: true, easyRead: true }) - (2 * Math.log2(1000) + 3)) < 1e-9);

console.log("all tests passed");
