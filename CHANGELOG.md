# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.7.0] - 2026-11-19
### Added
- Word list choice: EFF Large, EFF Short #1, EFF Short #2, a Filipino/Tagalog list of food names and everyday words (spelled phonetically), or EFF Large + Filipino. Entropy uses the actual pool size.
- "Add a symbol at the end" option (one of `!@#$%&*?=+`).
- "Easy to read" option: random digits skip 0 and 1.
- "Copied" toast.
- Export and import presets as JSON.
- PWA home-screen shortcut "Copy new passphrase" (`?copy=1`).

## [1.6.0] - 2026-11-19
### Added
- Saved presets: save the current options under a name, reapply or delete them (stored on-device only).
- Tablet and desktop layouts: wider card, two-column result/options on screens 960px+, sticky result, larger type, 44px touch targets on touch devices.
- Keyboard shortcuts on desktop: N = new, C = copy.
- Optional "Open Passwords app" link that runs a user-made Shortcut named "Open Passwords" (Apple provides no public `passwords://` scheme).

### Changed
- Word-list filtering is memoized and caps-position selection is O(k) instead of O(n).

## [1.5.0] - 2026-11-17
### Changed
- When a new version is found, the app clears old caches, re-downloads all assets bypassing the HTTP cache, and reloads automatically.
- Update check also runs whenever the app returns to the foreground.

## [1.4.0] - 2026-11-17
### Changed
- Password is now always displayed in a monospace font.

## [1.3.0] - 2026-11-17
### Added
- Semicolon separator.
- Pre-commit hook (`.githooks/pre-commit`) that updates the About timestamp on every commit.

### Changed
- Removed the password font option (and the unused Source Serif 4 and JetBrains Mono fonts).
- Removed the "Capitalize words" option.
- Separator picker is now a dropdown instead of a segmented control.

## [1.2.1] - 2026-11-17

### Added
- Password character count shown next to the entropy readout.

### Fixed
- Double-tapping quickly no longer zooms the page (pinch zoom still works).

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
