(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = "wordpass:options";
  const defaults = { count: 4, separator: "period", capitalize: false, trailingDigit: false };
  const colors = { Weak: "--weak", Fair: "--fair", Good: "--good", Strong: "--strong", Excellent: "--excellent" };

  let opts = Object.assign({}, defaults);
  try { Object.assign(opts, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  opts.count = Math.min(15, Math.max(3, Number(opts.count) || 4));

  function render() {
    $("password").textContent = Gen.generate(WORDS, opts);
    const bits = Gen.entropyBits(WORDS.length, opts);
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
    $("cap").checked = opts.capitalize;
    $("digit").checked = opts.trailingDigit;
    document.querySelector('input[name=sep][value=' + opts.separator + ']').checked = true;
  }

  function change(patch) {
    Object.assign(opts, patch);
    try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch (e) {}
    syncControls();
    render();
  }

  $("count").addEventListener("input", (e) => change({ count: Number(e.target.value) }));
  $("cap").addEventListener("change", (e) => change({ capitalize: e.target.checked }));
  $("digit").addEventListener("change", (e) => change({ trailingDigit: e.target.checked }));
  document.querySelectorAll("input[name=sep]").forEach((r) =>
    r.addEventListener("change", (e) => change({ separator: e.target.value })));
  $("regen").addEventListener("click", render);

  $("copy").addEventListener("click", async () => {
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
    setTimeout(() => ($("copy").textContent = "Copy"), 1500);
  });

  syncControls();
  render();
})();
