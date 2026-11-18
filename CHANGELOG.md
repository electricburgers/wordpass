# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Pre-commit hook (`.githooks/pre-commit`) that updates the About timestamp on every commit.

## [1.2.0] - 2026-11-17

### Added
- Installable offline web app: web manifest, icons, and a service worker (Add to Home Screen on iPhone/iPad).
- "Copy automatically on New" option.
- Bundled open-source fonts (SIL OFL 1.1): Inter (sans), Source Serif 4 (serif), JetBrains Mono (mono), with a password font picker. No external font requests.
- "Apple-style" preset: 4 words, hyphens, capitalized, ending in a number.
- Word length filter (any, or up to 8/7/6/5 letters); strength uses the filtered list size.
- "Copy & open Passwords app" button (`passwords://`, iOS 18+ / macOS 15+).
- About section showing version and release timestamp, plus credits.

### Changed
- Hyphenated words (e.g. "drop-down") are excluded when the hyphen separator is selected.

## [1.1.0] - 2026-11-17

### Added
- Hyphen, space, and comma separators (alongside periods and numbers).
- "Random ALL CAPS words" slider: choose how many words, picked at random positions, are fully uppercase. Counted in the entropy (adds log2 C(n, k) bits).
- One-tap copy: tap the password itself, or the large Copy button, for pasting into Apple Passwords or any other app.

## [1.0.0] - 2026-11-17

### Added
- Random full-word passphrase generator using the EFF Large Wordlist (7,776 words).
- Separator choice: periods or random digits.
- Adjustable word count (3-15), optional capitalization, optional trailing digit.
- Entropy-based strength meter (Weak to Excellent).
- One-click copy, light/dark theme, options remembered in `localStorage`.
- Node tests (`node test.js`) for entropy math, formatting, and RNG uniformity.
- Project plan, README, MIT license.
