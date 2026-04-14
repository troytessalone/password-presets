import { secureRandomIndex, shuffle } from "./crypto.js";
import { EFF_LARGE } from "./wordlist.js";

/**
 * Generates a single character-based password from pool definitions.
 * Guarantees at least one character from each pool, then fills the
 * remainder from the combined pool, then shuffles.
 *
 * @param {number} length
 * @param {string[]} pools
 * @returns {string}
 */
export function generateChar(length, pools) {
  const allChars = pools.join("");
  const result = [];

  // Guarantee at least one character per pool
  for (const pool of pools) {
    result.push(pool[secureRandomIndex(pool.length)]);
  }

  // Fill remaining positions from combined pool
  while (result.length < length) {
    result.push(allChars[secureRandomIndex(allChars.length)]);
  }

  // Shuffle so guaranteed positions are not predictable
  return shuffle(result).join("");
}

/**
 * Generates a single EFF-wordlist passphrase.
 *
 * @param {number} wordCount
 * @param {string} separator
 * @returns {string}
 */
export function generatePassphrase(wordCount, separator) {
  const words = Array.from(
    { length: wordCount },
    () => EFF_LARGE[secureRandomIndex(EFF_LARGE.length)]
  );
  return words.join(separator);
}
