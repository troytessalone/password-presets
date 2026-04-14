import { PRESETS } from "./presets.js";
import { EFF_LARGE } from "./wordlist.js";
import { generateChar, generatePassphrase } from "./generate.js";

/**
 * Calculates Shannon entropy in bits.
 * @param {number} length   - Number of positions (chars or words)
 * @param {number} poolSize - Number of distinct symbols at each position
 * @returns {number}
 */
export function entropy(length, poolSize) {
  return length * Math.log2(poolSize);
}

/**
 * Classifies entropy bits into a strength label.
 * @param {number} bits
 * @returns {"moderate"|"strong"|"very-strong"}
 */
export function strength(bits) {
  if (bits < 80) return "moderate";
  if (bits < 128) return "strong";
  return "very-strong";
}

/**
 * Returns full metadata for a named preset.
 *
 * @param {string} name
 * @returns {import("./index.js").InspectResult}
 */
export function inspect(name) {
  const preset = PRESETS[name];
  if (!preset) {
    throw new TypeError(
      `Unknown preset "${name}". Valid presets: ${Object.keys(PRESETS).join(", ")}`
    );
  }

  if (preset.type === "passphrase") {
    const bits = entropy(preset.words, EFF_LARGE.length);
    return {
      preset: name,
      type: preset.type,
      description: preset.description,
      whenToUse: preset.whenToUse,
      words: preset.words,
      wordlistSize: EFF_LARGE.length,
      separator: preset.separator,
      entropy_bits: Number(bits.toFixed(2)),
      strength: strength(bits),
      minEntropyBits: preset.minEntropyBits,
      example: generatePassphrase(preset.words, preset.separator),
    };
  }

  const charset = preset.pools.join("");
  const bits = entropy(preset.length, charset.length);

  return {
    preset: name,
    type: preset.type,
    description: preset.description,
    whenToUse: preset.whenToUse,
    length: preset.length,
    charset,
    charsetSize: charset.length,
    pools: preset.pools,
    entropy_bits: Number(bits.toFixed(2)),
    strength: strength(bits),
    minEntropyBits: preset.minEntropyBits,
    example: generateChar(preset.length, preset.pools),
  };
}
