// Core generator logic (no DOM). Works in browser and Node.
(function (root) {
  function randInt(max, rng) {
    // Unbiased integer in [0, max) via rejection sampling on 32-bit values.
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    let x;
    do {
      (rng || root.crypto).getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % max;
  }

  // "Easy to read" drops look-alike digits (0/O, 1/l/I) from number picks.
  const SYMBOLS = "!@#$%&*?=+";
  const digit = (opts, rng) => (opts.easyRead ? 2 + randInt(8, rng) : randInt(10, rng));
  const digitCount = (opts) => (opts.easyRead ? 8 : 10);

  const SEPARATORS = { period: ".", hyphen: "-", space: " ", comma: ",", semicolon: ";" };

  // k distinct indices from [0, n), uniformly (partial Fisher-Yates).
  function pickDistinct(n, k, rng) {
    // Sparse Fisher-Yates: O(k) time and space instead of O(n).
    const swapped = new Map();
    const out = new Set();
    for (let i = 0; i < k; i++) {
      const j = i + randInt(n - i, rng);
      const vj = swapped.has(j) ? swapped.get(j) : j;
      swapped.set(j, swapped.has(i) ? swapped.get(i) : i);
      out.add(vj);
    }
    return out;
  }

  function log2Choose(n, k) {
    let r = 0;
    for (let i = 1; i <= k; i++) r += Math.log2((n - k + i) / i);
    return r;
  }

  // Apply the word-length cap. With the hyphen separator, drop hyphenated
  // words (e.g. "drop-down") so word boundaries stay unambiguous.
  // Memoized: the result depends only on (words, maxLen, noHyphen), so dragging
  // a slider costs O(1) instead of an O(N) scan per input event.
  const filterCache = new WeakMap();
  function filterWords(words, opts) {
    const max = opts.maxLen || 0;
    const noHyphen = opts.separator === "hyphen";
    const key = max + (noHyphen ? "h" : "");
    let m = filterCache.get(words);
    if (!m) filterCache.set(words, (m = new Map()));
    let out = m.get(key);
    if (!out) {
      out = !max && !noHyphen ? words : words.filter((w) => (!max || w.length <= max) && !(noHyphen && w.includes("-")));
      m.set(key, out);
    }
    return out;
  }

  function generate(words, opts, rng) {
    const n = opts.count;
    const caps = pickDistinct(n, Math.min(opts.capsCount || 0, n), rng);
    const parts = [];
    for (let i = 0; i < n; i++) {
      let w = words[randInt(words.length, rng)];
      if (caps.has(i)) w = w.toUpperCase();
      parts.push(w);
    }
    let out;
    if (opts.separator !== "numbers") {
      const sep = SEPARATORS[opts.separator] || ".";
      out = parts.join(sep);
    } else {
      out = parts[0];
      for (let i = 1; i < n; i++) out += digit(opts, rng) + parts[i];
    }
    if (opts.trailingDigit) out += digit(opts, rng);
    if (opts.trailingSymbol) out += SYMBOLS[randInt(SYMBOLS.length, rng)];
    return out;
  }

  function entropyBits(listSize, opts) {
    let bits = opts.count * Math.log2(listSize);
    const d = Math.log2(digitCount(opts));
    if (opts.separator === "numbers") bits += (opts.count - 1) * d;
    if (opts.trailingDigit) bits += d;
    if (opts.trailingSymbol) bits += Math.log2(SYMBOLS.length);
    // Which words are ALL CAPS is random, so it adds log2(C(n, k)) bits.
    bits += log2Choose(opts.count, Math.min(opts.capsCount || 0, opts.count));
    return bits;
  }

  function strengthLabel(bits) {
    if (bits < 40) return "Weak";
    if (bits < 60) return "Fair";
    if (bits < 80) return "Good";
    if (bits < 100) return "Strong";
    return "Excellent";
  }

  // Build the pool for a list choice. Combined lists are de-duplicated so the
  // entropy (log2 of pool size) is not overstated.
  function buildList(name, lists) {
    const parts = { large: ["large"], short1: ["short1"], short2: ["short2"], fil: ["fil"], "large+fil": ["large", "fil"] }[name] || ["large"];
    return parts.length === 1 ? lists[parts[0]] : Array.from(new Set([].concat(...parts.map((p) => lists[p]))));
  }

  const api = { buildList, SYMBOLS, filterWords, randInt, generate, entropyBits, strengthLabel };
  if (typeof module !== "undefined") module.exports = api;
  else root.Gen = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
