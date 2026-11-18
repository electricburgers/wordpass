(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = "wordpass:options";
  const SEPS = ["period", "hyphen", "space", "comma", "semicolon", "numbers"];
  const defaults = {
    count: 4, separator: "period", trailingDigit: false,
    capsCount: 0, maxLen: 0, autoCopy: false,
  };
  const colors = { Weak: "--weak", Fair: "--fair", Good: "--good", Strong: "--strong", Excellent: "--excellent" };

  let opts = Object.assign({}, defaults);
  try { Object.assign(opts, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  opts.count = Math.min(15, Math.max(3, Number(opts.count) || 4));
  opts.capsCount = Math.min(opts.count, Math.max(0, Number(opts.capsCount) || 0));
  opts.maxLen = [0, 5, 6, 7, 8].includes(Number(opts.maxLen)) ? Number(opts.maxLen) : 0;
  if (!SEPS.includes(opts.separator)) opts.separator = "period";

  let list = WORDS;

  function render() {
    list = Gen.filterWords(WORDS, opts);
    $("password").textContent = Gen.generate(list, opts);
    const bits = Gen.entropyBits(list.length, opts);
    const label = Gen.strengthLabel(bits);
    $("strength-label").textContent = label;
    $("strength-bits").textContent = "· " + Math.round(bits) + " bits of entropy · " + $("password").textContent.length + " characters";
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
    $("digit").checked = opts.trailingDigit;
    $("maxlen").value = String(opts.maxLen);
    $("autocopy").checked = opts.autoCopy;
    $("sep").value = opts.separator;
  }

  function change(patch) {
    Object.assign(opts, patch);
    try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch (e) {}
    syncControls();
    render();
  }

  $("count").addEventListener("input", (e) => change({ count: Number(e.target.value) }));
  $("caps").addEventListener("input", (e) => change({ capsCount: Number(e.target.value) }));
  $("digit").addEventListener("change", (e) => change({ trailingDigit: e.target.checked }));
  $("maxlen").addEventListener("change", (e) => change({ maxLen: Number(e.target.value) }));
  $("autocopy").addEventListener("change", (e) => change({ autoCopy: e.target.checked }));
  $("sep").addEventListener("change", (e) => change({ separator: e.target.value }));


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

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    // Hard refresh when a new version is found: the new worker re-downloads every
    // asset bypassing the HTTP cache, drops old caches, then the page reloads.
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
      const check = () => reg.update().catch(() => {});
      document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
    }).catch(() => {});
  }

  syncControls();
  render();
})();
