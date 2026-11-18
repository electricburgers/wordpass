# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-11-17

### Added
- Random full-word passphrase generator using the EFF Large Wordlist (7,776 words).
- Separator choice: periods or random digits.
- Adjustable word count (3-15), optional capitalization, optional trailing digit.
- Entropy-based strength meter (Weak to Excellent).
- One-click copy, light/dark theme, options remembered in `localStorage`.
- Node tests (`node test.js`) for entropy math, formatting, and RNG uniformity.
- Project plan, README, MIT license.
