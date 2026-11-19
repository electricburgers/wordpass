(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = "wordpass:options";
  const PKEY = "wordpass:presets";
  const OPEN_KEY = "wordpass:openPasswords";
  const LISTS = ["large", "short1", "short2", "fil", "large+fil"];
  const SEPS = ["period", "hyphen", "space", "comma", "semicolon", "numbers"];
  const defaults = {
    count: 4, separator: "period", trailingDigit: false,
    capsCount: 0, maxLen: 0, autoCopy: false,
    list: "large", trailingSymbol: false, easyRead: false,
  };
  const colors = { Weak: "--weak", Fair: "--fair", Good: "--good", Strong: "--strong", Excellent: "--excellent" };

  // Coerce untrusted input (localStorage) into a valid options object.
  function sanitize(o) {
    o = Object.assign({}, defaults, o || {});
    const count = Math.min(15, Math.max(3, Number(o.count) || 4));
    return {
      count,
      separator: SEPS.includes(o.separator) ? o.separator : "period",
      trailingDigit: !!o.trailingDigit,
      capsCount: Math.min(count, Math.max(0, Number(o.capsCount) || 0)),
      maxLen: [0, 5, 6, 7, 8].includes(Number(o.maxLen)) ? Number(o.maxLen) : 0,
      autoCopy: !!o.autoCopy,
      list: LISTS.includes(o.list) ? o.list : "large",
      trailingSymbol: !!o.trailingSymbol,
      easyRead: !!o.easyRead,
    };
  }
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  let opts = sanitize(read(KEY, {}));
  // Presets: { name: options }. Null-prototype object so names like "__proto__" are safe.
  let presets = Object.assign(Object.create(null), read(PKEY, {}));
  for (const k of Object.keys(presets)) presets[k] = sanitize(presets[k]);
  const sameOpts = (a, b) => Object.keys(defaults).every((k) => a[k] === b[k]);

  const lists = { large: WORDS, short1: WORDS_SHORT1, short2: WORDS_SHORT2, fil: WORDS_FIL };
  const pools = {};
  let list = WORDS;

  function render() {
    const pool = pools[opts.list] || (pools[opts.list] = Gen.buildList(opts.list, lists));
    list = Gen.filterWords(pool, opts);
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
    $("list").value = opts.list;
    $("symbol").checked = opts.trailingSymbol;
    $("easy").checked = opts.easyRead;
    syncPresets();
  }

  function syncPresets() {
    const sel = $("preset");
    const names = Object.keys(presets).sort((x, y) => x.localeCompare(y));
    sel.replaceChildren(new Option("Current settings", ""), ...names.map((n) => new Option(n, n)));
    const match = names.find((n) => sameOpts(presets[n], opts)) || "";
    sel.value = match;
    $("preset-del").hidden = !match;
  }

  function change(patch) {
    Object.assign(opts, patch);
    write(KEY, opts);
    syncControls();
    render();
  }

  $("count").addEventListener("input", (e) => change({ count: Number(e.target.value) }));
  $("caps").addEventListener("input", (e) => change({ capsCount: Number(e.target.value) }));
  $("digit").addEventListener("change", (e) => change({ trailingDigit: e.target.checked }));
  $("maxlen").addEventListener("change", (e) => change({ maxLen: Number(e.target.value) }));
  $("autocopy").addEventListener("change", (e) => change({ autoCopy: e.target.checked }));
  $("list").addEventListener("change", (e) => change({ list: e.target.value }));
  $("symbol").addEventListener("change", (e) => change({ trailingSymbol: e.target.checked }));
  $("easy").addEventListener("change", (e) => change({ easyRead: e.target.checked }));
  $("sep").addEventListener("change", (e) => change({ separator: e.target.value }));

  $("preset").addEventListener("change", (e) => {
    const p = presets[e.target.value];
    if (p) change(p); else syncPresets();
  });
  const form = $("preset-form");
  function showForm(show) {
    form.hidden = !show;
    if (show) { $("preset-name").value = ""; $("preset-name").focus(); }
  }
  $("preset-save").addEventListener("click", () => showForm(form.hidden));
  $("preset-cancel").addEventListener("click", () => showForm(false));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("preset-name").value.trim();
    if (!name) return;
    presets[name] = Object.assign({}, opts);
    write(PKEY, presets);
    showForm(false);
    syncPresets();
  });
  $("preset-del").addEventListener("click", () => {
    delete presets[$("preset").value];
    write(PKEY, presets);
    syncPresets();
  });

  $("preset-export").addEventListener("click", () => {
    if (!Object.keys(presets).length) return toast("No presets to export");
    const blob = new Blob([JSON.stringify({ wordpass: 1, presets }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wordpass-presets.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("preset-import").addEventListener("click", () => $("preset-file").click());
  $("preset-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || file.size > 1e6) return toast("Import failed");
    try {
      const data = JSON.parse(await file.text());
      const src = data && typeof data.presets === "object" && data.presets ? data.presets : data;
      let n = 0;
      for (const k of Object.keys(src)) {
        if (typeof src[k] !== "object" || !src[k] || !k.trim()) continue;
        presets[k.trim().slice(0, 30)] = sanitize(src[k]);
        n++;
      }
      write(PKEY, presets);
      syncPresets();
      toast(n ? "Imported " + n + " preset" + (n > 1 ? "s" : "") : "No presets found");
    } catch (err) { toast("Import failed"); }
  });

  // Apple offers no public URL scheme for Passwords.app, so the link runs a
  // user-made Shortcut named "Open Passwords" (works on macOS, iOS, iPadOS).
  function syncOpen() { $("open-passwords").hidden = localStorage.getItem(OPEN_KEY) !== "1"; }
  $("enable-open").addEventListener("click", () => {
    const on = localStorage.getItem(OPEN_KEY) === "1";
    try { localStorage.setItem(OPEN_KEY, on ? "0" : "1"); } catch (e) {}
    $("enable-open").textContent = on ? "Enable Open Passwords link" : "Disable Open Passwords link";
    syncOpen();
  });
  $("open-passwords").addEventListener("click", () => { copy(); });
  if (localStorage.getItem(OPEN_KEY) === "1") $("enable-open").textContent = "Disable Open Passwords link";
  syncOpen();

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName)) return;
    if (e.key === "n" || e.key === "N") { render(); if (opts.autoCopy) copy(); }
    else if (e.key === "c" || e.key === "C") copy();
  });


  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 1800);
  }

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
    toast("Copied to clipboard");
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
  // PWA home-screen shortcut (manifest "shortcuts"): ?copy=1 copies a fresh passphrase.
  if (new URLSearchParams(location.search).get("copy") === "1") {
    copy().then(() => history.replaceState(null, "", location.pathname));
  }
})();
