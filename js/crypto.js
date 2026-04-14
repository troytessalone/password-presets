import { randomBytes } from "crypto";

/**
 * Returns a cryptographically secure random integer in [0, max).
 * Uses rejection sampling to eliminate modulo bias.
 * @param {number} max
 * @returns {number}
 */
export function secureRandomIndex(max) {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError(`secureRandomIndex: max must be a positive integer, got ${max}`);
  }
  const MAX_UINT32 = 0x1_00_00_00_00;
  const limit = MAX_UINT32 - (MAX_UINT32 % max);
  let rand;
  do {
    rand = randomBytes(4).readUInt32BE(0);
  } while (rand >= limit);
  return rand % max;
}

/**
 * Fisher-Yates shuffle using secureRandomIndex.
 * Mutates and returns the array.
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
