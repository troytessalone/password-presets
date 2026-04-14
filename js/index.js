/**
 * password-presets
 *
 * Cryptographically secure, preset-based password generation.
 * Zero dependencies. Zero configuration required.
 *
 * @example
 * import { generate, inspect, presets } from "password-presets";
 *
 * generate("human")               // ["kR7m!vZ3Kp2xQwLn"]
 * generate("human", { count: 3 }) // ["...", "...", "..."]
 * generate("passphrase")          // ["correct-horse-battery-staple-..."]
 * inspect("human")                // { preset, description, entropy_bits, ... }
 * presets()                       // ["human", "machine", "token", "pin", "passphrase"]
 */

import { PRESETS, PRESET_NAMES } from "./presets.js";
import { generateChar, generatePassphrase } from "./generate.js";
import { inspect as _inspect } from "./inspect.js";

/**
 * @typedef {"human"|"machine"|"token"|"pin"|"passphrase"} PresetName
 *
 * @typedef {Object} GenerateOptions
 * @property {number} [count=1]   - Number of passwords to generate
 * @property {number} [words]     - Word count override for "passphrase" preset only
 *
 * @typedef {Object} InspectResult
 * @property {string}   preset
 * @property {string}   type
 * @property {string}   description
 * @property {string}   whenToUse
 * @property {number}   [length]       - char-based presets
 * @property {string}   [charset]      - char-based presets
 * @property {number}   [charsetSize]  - char-based presets
 * @property {string[]} [pools]        - char-based presets
 * @property {number}   [words]        - passphrase preset
 * @property {number}   [wordlistSize] - passphrase preset
 * @property {string}   [separator]    - passphrase preset
 * @property {number}   entropy_bits
 * @property {string}   strength
 * @property {number}   minEntropyBits
 * @property {string}   example
 */

/**
 * Generates one or more passwords for the given preset.
 * Always returns an array.
 *
 * @param {PresetName} name
 * @param {GenerateOptions} [options]
 * @returns {string[]}
 *
 * @throws {TypeError} if preset name is unknown
 *
 * @example
 * generate("human")               // ["kR7m!vZ3Kp2xQwLn"]
 * generate("token", { count: 5 }) // 5 url-safe tokens
 * generate("passphrase")          // 7-word EFF passphrase
 */
export function generate(name, options = {}) {
  const preset = PRESETS[name];

  if (!preset) {
    throw new TypeError(
      `Unknown preset "${name}". Valid presets: ${PRESET_NAMES.join(", ")}`
    );
  }

  const count = Math.max(1, Number.parseInt(options.count ?? 1, 10));

  if (preset.type === "passphrase") {
    const wordCount = options.words != null
      ? Math.max(1, Number.parseInt(options.words, 10))
      : preset.words;

    return Array.from({ length: count }, () =>
      generatePassphrase(wordCount, preset.separator)
    );
  }

  return Array.from({ length: count }, () =>
    generateChar(preset.length, preset.pools)
  );
}

/**
 * Returns full metadata for a named preset, including an example output.
 * Use this to understand what a preset will produce before calling generate().
 *
 * @param {PresetName} name
 * @returns {InspectResult}
 *
 * @example
 * inspect("human")
 * // {
 * //   preset: "human",
 * //   type: "char",
 * //   description: "For passwords a person types...",
 * //   length: 14,
 * //   entropy_bits: 84.92,
 * //   strength: "strong",
 * //   example: "kR7m!vZ3Kp2xQw"
 * // }
 */
export function inspect(name) {
  return _inspect(name);
}

/**
 * Returns all available preset names.
 *
 * @returns {PresetName[]}
 *
 * @example
 * presets() // ["human", "machine", "token", "pin", "passphrase"]
 */
export function presets() {
  return [...PRESET_NAMES];
}

export default generate;
