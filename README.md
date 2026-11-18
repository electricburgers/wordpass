# wordpass

A simple, private, 1Password-style passphrase generator. It builds passwords from random full English words, like `cactus.lunar.pebble.orbit`.

**Live:** https://electricburgers.github.io/wordpass/

See [plan.md](plan.md) for the design and [CHANGELOG.md](CHANGELOG.md) for releases.

## Features

- Random full English words (EFF Large Wordlist, 7,776 words)
- Separator choice: periods or random numbers
- Adjustable number of words
- Optional capitalization and trailing digit
- Strength meter based on entropy in bits
- One-click copy
- 100% client-side: nothing is sent, stored, or logged

## How it works

Words are picked with `crypto.getRandomValues` using rejection sampling, so every word is equally likely and there is no modulo bias. Strength is calculated as:

```
bits = words * log2(7776) + (numeric separators ? (words - 1) * log2(10) : 0)
```

For example, 4 words is about 51.7 bits, and 6 words is about 77.5 bits. Strength assumes an attacker knows the method and the word list.

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Test

```sh
node test.js
```

## Deploy

Hosted with GitHub Pages from the `main` branch, root folder.

## Credits

Word list: [EFF Large Wordlist](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases) by the Electronic Frontier Foundation, licensed [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/).

## License

MIT (code). Word list under its own license above.
