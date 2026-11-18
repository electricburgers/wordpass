# Plan: wordpass

A 1Password-style random passphrase generator, hosted on GitHub Pages.

- **Repo:** `electricburgers/wordpass` (public)
- **Live site:** `https://electricburgers.github.io/wordpass/`
- **Stack:** static HTML + CSS + vanilla JS. No build step, no dependencies, no backend.

## Goals

1. Generate passphrases made of random, full English words.
2. Let the user choose the separator: **period**, **number**, or (stretch) hyphen/space/comma.
3. Let the user choose the **number of words** (e.g. 3-10, default 4).
4. Show a **password strength** meter based on real entropy.
5. Everything runs client-side. Nothing is sent, stored, or logged.

## Non-goals

- Accounts, saving passwords, or sync.
- Server-side anything.
- Analytics or third-party scripts.

## Features

| Feature | Detail |
| --- | --- |
| Word count | Slider + number input, range 3-15, default 4 |
| Separator | Segmented control: Periods / Numbers (plus Hyphens, Spaces, Commas as stretch) |
| "Numbers" mode | Each separator is an independent random digit 0-9 (e.g. `apple7river3cloud`) |
| Capitalize | Toggle, default off |
| Include number | Toggle, appends one random digit to a word (1Password option) |
| Strength meter | Bar + label + entropy in bits (see below) |
| Copy | One-click copy, with "Copied" confirmation |
| Regenerate | Button, plus auto-generate on any option change |
| Persistence | Options remembered in `localStorage` (options only, never passwords) |
| Accessibility | Keyboard operable, labelled controls, `aria-live` for password and strength |
| Theme | Light/dark via `prefers-color-scheme` |

## Randomness

- Use `crypto.getRandomValues`, never `Math.random`.
- Pick indices with **rejection sampling** on a 32-bit value to avoid modulo bias.
- Numeric separators are drawn the same way (unbiased 0-9).

## Word list

- **EFF Large Wordlist** (7,776 words, ~12.92 bits per word). It is public and designed for passphrases: common full English words, no proper nouns, no homophone-heavy or hard-to-spell entries.
- Stored as `words.js` (an exported array) so the site works from `file://` and Pages without fetch/CORS concerns.
- Credit and license note (CC BY 3.0 US) in the README and page footer.

## Strength calculation

```
entropy_bits = words * log2(listSize)
             + (numberSeparators ? (words - 1) * log2(10) : 0)
             + (includeNumber    ? log2(10) : 0)
```

Separator type "period" adds no entropy (fixed character). Capitalization adds none either, since it is deterministic. The attacker is assumed to know the method and the word list.

| Bits | Label |
| --- | --- |
| < 40 | Weak |
| 40-59 | Fair |
| 60-79 | Good |
| 80-99 | Strong |
| 100+ | Excellent |

## File layout

```
wordpass/
  index.html
  style.css
  app.js        # UI + generator
  words.js      # EFF large wordlist
  README.md
  CHANGELOG.md
  plan.md
  LICENSE       # MIT
  .nojekyll
```

## Milestones

1. **Docs** (now): `plan.md`, `CHANGELOG.md`, `README.md`.
2. **Generator core:** wordlist, secure RNG, entropy function. Verify with a small Node test (distribution sanity, entropy math).
3. **UI:** controls, output, copy, strength meter, responsive and dark mode.
4. **Polish:** accessibility pass, localStorage options, footer credits.
5. **Publish:** `git init`, create public repo `electricburgers/wordpass` with `gh`, push `main`, enable Pages (deploy from `main` / root), confirm the live URL.
6. **Release:** tag `v1.0.0`, update CHANGELOG.

## Decisions to confirm before step 5

- Repo name `wordpass` OK, or prefer something else?
- License: MIT OK?
- Extra separators (hyphen/space/comma) in v1.0, or only period + numbers?

## Risks

- **Wordlist licensing:** EFF list is CC BY 3.0 US, so attribution is required. Covered above.
- **Misleading strength claims:** label strength as entropy under the stated assumptions, not a guarantee.
- **Clipboard API** requires a secure context; GitHub Pages is HTTPS, so this is fine. Add a fallback for `file://`.
