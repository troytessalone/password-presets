# password-presets (JavaScript)

Cryptographically secure, preset-based password generation for Node.js.  
Zero dependencies. ESM only. TypeScript types included.

Full documentation (presets, security notes, cross-language parity) lives in the [repository README](../README.md).

## Layout

| File | Role |
|------|------|
| `index.js` | Public API: `generate`, `inspect`, `presets` |
| `presets.js` | Preset definitions |
| `generate.js` | Character and passphrase generation |
| `crypto.js` | `crypto.randomBytes` helpers |
| `wordlist.js` | EFF large wordlist |
| `inspect.js` | Preset metadata and entropy helpers |
| `password-presets.js` | CLI (`password-presets` bin) |
| `index.d.ts` | TypeScript declarations |
| `index.test.js` | Node test runner tests |

## Install

From [npm](https://www.npmjs.com/package/password-presets):

```sh
npm install password-presets
```

From a clone of this repo (from the repository root):

```sh
npm install ./js
```

## Usage

```js
import { generate, inspect, presets } from "password-presets";

generate("human");
inspect("human");
presets();
```

## CLI

```sh
npx password-presets
npx password-presets token --count 3
npx password-presets --list
```

## Requirements

- Node.js ≥ 18

## Development

```sh
cd js
npm test
```

Publish (maintainers):

```sh
cd js
npm publish
```
