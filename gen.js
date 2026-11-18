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

  const SEPARATORS = { period: ".", hyphen: "-", space: " ", comma: "," };

  // k distinct indices from [0, n), uniformly (partial Fisher-Yates).
  function pickDistinct(n, k, rng) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = 0; i < k; i++) {
      const j = i + randInt(n - i, rng);
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return new Set(idx.slice(0, k));
  }

  function log2Choose(n, k) {
    let r = 0;
    for (let i = 1; i <= k; i++) r += Math.log2((n - k + i) / i);
    return r;
  }

  // Apply the word-length cap. With the hyphen separator, drop hyphenated
  // words (e.g. "drop-down") so word boundaries stay unambiguous.
  function filterWords(words, opts) {
    const max = opts.maxLen || 0;
    const noHyphen = opts.separator === "hyphen";
    return words.filter((w) => (!max || w.length <= max) && !(noHyphen && w.includes("-")));
  }

  function generate(words, opts, rng) {
    const n = opts.count;
    const caps = pickDistinct(n, Math.min(opts.capsCount || 0, n), rng);
    const parts = [];
    for (let i = 0; i < n; i++) {
      let w = words[randInt(words.length, rng)];
      if (caps.has(i)) w = w.toUpperCase();
      else if (opts.capitalize) w = w[0].toUpperCase() + w.slice(1);
      parts.push(w);
    }
    let out = parts[0];
    for (let i = 1; i < n; i++) {
      const sep = opts.separator === "numbers" ? String(randInt(10, rng)) : SEPARATORS[opts.separator] || ".";
      out += sep + parts[i];
    }
    if (opts.trailingDigit) out += String(randInt(10, rng));
    return out;
  }

  function entropyBits(listSize, opts) {
    let bits = opts.count * Math.log2(listSize);
    if (opts.separator === "numbers") bits += (opts.count - 1) * Math.log2(10);
    if (opts.trailingDigit) bits += Math.log2(10);
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

  const api = { filterWords, randInt, generate, entropyBits, strengthLabel };
  if (typeof module !== "undefined") module.exports = api;
  else root.Gen = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
