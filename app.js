(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = "wordpass:options";
  const SEPS = ["period", "hyphen", "space", "comma", "numbers"];
  const FONTS = ["sans", "serif", "mono"];
  const defaults = {
    count: 4, separator: "period", capitalize: false, trailingDigit: false,
    capsCount: 0, maxLen: 0, font: "sans", autoCopy: false,
  };
  const colors = { Weak: "--weak", Fair: "--fair", Good: "--good", Strong: "--strong", Excellent: "--excellent" };

  let opts = Object.assign({}, defaults);
  try { Object.assign(opts, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  opts.count = Math.min(15, Math.max(3, Number(opts.count) || 4));
  opts.capsCount = Math.min(opts.count, Math.max(0, Number(opts.capsCount) || 0));
  opts.maxLen = [0, 5, 6, 7, 8].includes(Number(opts.maxLen)) ? Number(opts.maxLen) : 0;
  if (!SEPS.includes(opts.separator)) opts.separator = "period";
  if (!FONTS.includes(opts.font)) opts.font = "sans";

  let list = WORDS;

  function render() {
    list = Gen.filterWords(WORDS, opts);
    $("password").textContent = Gen.generate(list, opts);
    $("password").dataset.font = opts.font;
    const bits = Gen.entropyBits(list.length, opts);
    const label = Gen.strengthLabel(bits);
    $("strength-label").textContent = label;
    $("strength-bits").textContent = "· " + Math.round(bits) + " bits of entropy";
    const fill = $("bar-fill");
    fill.style.width = Math.min(100, (bits / 120) * 100) + "%";
    fill.style.background = "var(" + colors[label] + ")";
  }

  function syncControls() {
    $("count").value = opts.count;
    $("count-out").textContent = opts.count;
    opts.capsCount = Math.min(opts.capsCount, opts.count);
    $("caps").max = opts.count;
    $("caps").value = opts.capsCount;
    $("caps-out").textContent = opts.capsCount;
    $("cap").checked = opts.capitalize;
    $("digit").checked = opts.trailingDigit;
    $("maxlen").value = String(opts.maxLen);
    $("autocopy").checked = opts.autoCopy;
    document.querySelector('input[name=sep][value=' + opts.separator + ']').checked = true;
    document.querySelector('input[name=font][value=' + opts.font + ']').checked = true;
  }

  function change(patch) {
    Object.assign(opts, patch);
    try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch (e) {}
    syncControls();
    render();
  }

  $("count").addEventListener("input", (e) => change({ count: Number(e.target.value) }));
  $("caps").addEventListener("input", (e) => change({ capsCount: Number(e.target.value) }));
  $("cap").addEventListener("change", (e) => change({ capitalize: e.target.checked }));
  $("digit").addEventListener("change", (e) => change({ trailingDigit: e.target.checked }));
  $("maxlen").addEventListener("change", (e) => change({ maxLen: Number(e.target.value) }));
  $("autocopy").addEventListener("change", (e) => change({ autoCopy: e.target.checked }));
  document.querySelectorAll("input[name=sep]").forEach((r) =>
    r.addEventListener("change", (e) => change({ separator: e.target.value })));
  document.querySelectorAll("input[name=font]").forEach((r) =>
    r.addEventListener("change", (e) => change({ font: e.target.value })));

  // Apple-style: hyphen-separated, has upper + lower case, a digit, and is long.
  $("preset-apple").addEventListener("click", () =>
    change({ count: 4, separator: "hyphen", capitalize: true, trailingDigit: true, capsCount: 0 }));

  async function copy() {
    const text = $("password").textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents($("password"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      document.execCommand("copy");
    }
    $("copy").textContent = "Copied ✓";
    clearTimeout(copy.t);
    copy.t = setTimeout(() => ($("copy").textContent = "Copy"), 1500);
  }

  $("regen").addEventListener("click", () => { render(); if (opts.autoCopy) copy(); });
  $("copy").addEventListener("click", copy);
  $("password").addEventListener("click", copy);
  $("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copy(); }
  });
  // Copy first, then let the passwords:// link navigate (Passwords on iOS 18+/macOS 15+).
  $("open-passwords").addEventListener("click", () => { copy(); });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  syncControls();
  render();
})();
