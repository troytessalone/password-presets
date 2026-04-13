export type PresetName = "human" | "machine" | "token" | "pin" | "passphrase";

export interface GenerateOptions {
  /** Number of passwords to generate. Default: 1. */
  count?: number;
  /** Word count override. Only applies to the "passphrase" preset. */
  words?: number;
}

export interface CharInspectResult {
  preset: PresetName;
  type: "char";
  description: string;
  whenToUse: string;
  length: number;
  charset: string;
  charsetSize: number;
  pools: string[];
  entropy_bits: number;
  strength: "moderate" | "strong" | "very-strong";
  minEntropyBits: number;
  example: string;
}

export interface PassphraseInspectResult {
  preset: PresetName;
  type: "passphrase";
  description: string;
  whenToUse: string;
  words: number;
  wordlistSize: number;
  separator: string;
  entropy_bits: number;
  strength: "moderate" | "strong" | "very-strong";
  minEntropyBits: number;
  example: string;
}

export type InspectResult = CharInspectResult | PassphraseInspectResult;

/**
 * Generates one or more passwords for the given preset.
 * Always returns an array.
 *
 * @example
 * generate("human")               // ["kR7m!vZ3Kp2xQwLn"]
 * generate("token", { count: 5 }) // ["...", "...", "...", "...", "..."]
 * generate("passphrase")          // ["correct-horse-battery-staple-pivot-ankle-clay"]
 */
export function generate(name: PresetName, options?: GenerateOptions): string[];

/**
 * Returns full metadata for a named preset, including an example output.
 *
 * @example
 * inspect("human")
 * // { preset: "human", type: "char", entropy_bits: 84.92, ... }
 */
export function inspect(name: PresetName): InspectResult;

/**
 * Returns all available preset names.
 *
 * @example
 * presets() // ["human", "machine", "token", "pin", "passphrase"]
 */
export function presets(): PresetName[];

export default generate;
