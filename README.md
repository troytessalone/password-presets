# password-presets

Cryptographically secure, preset-based password generation.  
Zero config. Zero dependencies.

```
npm install password-presets
pip install password-presets
```

---

## The idea

Every other password library makes you configure your way to correctness — specify `uppercase: true`, `symbols: true`, `length: 16`. You have to know what you're doing to use them right.

`password-presets` flips this. You pick a **use case**, and get a provably strong password. No options required.

```js
generate("human")       // a password a person types
generate("machine")     // a password a machine stores
generate("token")       // an API key or env var
generate("passphrase")  // a password a person remembers
generate("pin")         // a numeric PIN
```

---

## Presets

| Preset       | Type         | Length / Words | Entropy    | Use case |
|-------------|--------------|----------------|------------|----------|
| `human`      | char         | 14 chars       | ~85 bits   | User accounts, wifi — anything typed by hand |
| `machine`    | char         | 22 chars       | ~144 bits  | DB passwords, service creds — never typed |
| `token`      | char (url-safe) | 22 chars    | 132 bits   | API keys, bearer tokens, env vars |
| `pin`        | numeric      | 19 digits      | ~63 bits   | PINs, numeric codes — only where numeric is required |
| `passphrase` | EFF wordlist | 7 words        | ~90 bits   | Master passwords, recovery keys — must be remembered |

**Entropy minimums are tiered by use case:**
- `pin` ≥ 60 bits
- `human`, `passphrase` ≥ 80 bits
- `machine`, `token` ≥ 128 bits

---

## JavaScript

### Install

```sh
npm install password-presets
```

### API

```js
import { generate, inspect, presets } from "password-presets";

// Generate — always returns an array
generate("human")                     // ["kR7m!vZ3Kp2xQwLn"]
generate("human", { count: 3 })       // ["...", "...", "..."]
generate("passphrase")                // ["correct-horse-battery-staple-pivot-ankle-clay"]
generate("passphrase", { words: 10 }) // 10-word passphrase

// Inspect — understand a preset before using it
inspect("human")
// {
//   preset: "human",
//   type: "char",
//   description: "For passwords a person types...",
//   whenToUse: "User account passwords...",
//   length: 14,
//   charsetSize: 67,
//   entropy_bits: 84.92,
//   strength: "strong",
//   minEntropyBits: 80,
//   example: "kR7m!vZ3Kp2xQw"
// }

// List all presets
presets() // ["human", "machine", "token", "pin", "passphrase"]
```

### CLI

```sh
npx password-presets                        # human preset, 1 password
npx password-presets token --count 3       # 3 API tokens
npx password-presets passphrase --words 8  # 8-word passphrase
npx password-presets human --inspect       # show preset metadata
npx password-presets --list                # list all presets
npx password-presets --json                # raw JSON output
```

### Requirements
- Node ≥ 18
- ESM (`"type": "module"` or `.mjs`)
- Full TypeScript types included

---

## Python

### Install

```sh
pip install password-presets
```

From a checkout of this repo, install the Python package from the `py` directory:

```sh
pip install ./py
```

Run tests from `py` (requires Python ≥ 3.11 and `pytest`):

```sh
cd py && pytest
```

### API

```python
from password_presets import generate, inspect, presets

# Generate — always returns a list
generate("human")                     # ["kR7m!vZ3Kp2xQwLn"]
generate("human", count=3)            # ["...", "...", "..."]
generate("passphrase")                # ["correct-horse-battery-staple-pivot-ankle-clay"]
generate("passphrase", words=10)      # 10-word passphrase

# Inspect — understand a preset before using it
inspect("human")
# {
#   "preset": "human",
#   "type": "char",
#   "description": "For passwords a person types...",
#   "when_to_use": "User account passwords...",
#   "length": 14,
#   "charset_size": 67,
#   "entropy_bits": 84.92,
#   "strength": "strong",
#   "min_entropy_bits": 80,
#   "example": "kR7m!vZ3Kp2xQw"
# }

# List all presets
presets()  # ["human", "machine", "token", "pin", "passphrase"]
```

### CLI

```sh
password-presets                        # human preset, 1 password
password-presets token --count 3       # 3 API tokens
password-presets passphrase --words 8  # 8-word passphrase
password-presets human --inspect       # show preset metadata
password-presets --list                # list all presets
password-presets --json                # raw JSON output

# or via module
python -m password_presets passphrase
```

### Requirements
- Python ≥ 3.11
- Zero dependencies (uses built-in `secrets` module)
- Full type hints included

---

## Security

- **Zero modulo bias** — JavaScript uses rejection sampling via `crypto.randomBytes`; Python uses `secrets.randbelow`
- **Pool guarantee** — character-based presets always include at least one character from each character class
- **Entropy gate** — every preset is validated against a tiered minimum at definition time
- **EFF wordlist** — passphrase preset uses the [EFF large wordlist](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases) (7776 words, ~12.9 bits/word)

---

## Which preset should I use?

```
Does a human need to type it?
  Yes → Does it need to be remembered long-term?
          Yes → passphrase
          No  → human
  No  → Is it an API key, token, or env var?
          Yes → token
          No  → machine

Is numeric-only required?
  Yes → pin
```

---

## Cross-language parity

The JS and Python packages are intentionally identical in behavior:
- Same preset names and definitions
- Same default lengths and word counts
- Same entropy minimums
- Same API shape (`generate`, `inspect`, `presets`)
- Same EFF wordlist

The only intentional difference: Python uses `snake_case` for keyword arguments and dict keys (`when_to_use`, `charset_size`, `min_entropy_bits`); JavaScript uses `camelCase` (`whenToUse`, `charsetSize`, `minEntropyBits`).

---

## License

MIT — wordlist licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) by EFF
