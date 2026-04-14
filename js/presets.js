/**
 * Preset definitions for password-presets.
 *
 * Each preset is a complete, opinionated configuration.
 * Entropy minimums are tiered by use case:
 *   - pin        ≥ 60 bits  (rate-limited systems)
 *   - human      ≥ 80 bits  (human authentication)
 *   - passphrase ≥ 80 bits  (human authentication, memorable)
 *   - token      ≥ 128 bits (API keys, secrets)
 *   - machine    ≥ 128 bits (system-generated credentials)
 */

export const PRESETS = {

  human: {
    type: "char",
    description: "For passwords a person types. No ambiguous characters (0, O, 1, l, I). Light symbols.",
    whenToUse: "User account passwords, wifi passwords, anything a human enters by hand.",
    pools: [
      "ABCDEFGHJKLMNPQRSTUVWXYZ",   // uppercase, no ambiguous
      "abcdefghijkmnopqrstuvwxyz",   // lowercase, no ambiguous
      "23456789",                     // digits, no ambiguous
      "!@#$%^&*+-=",                 // symbols, readable
    ],
    length: 14,
    minEntropyBits: 80,
  },

  machine: {
    type: "char",
    description: "Full character set, maximum entropy. For passwords stored and retrieved by machines.",
    whenToUse: "Database passwords, service credentials, anything a human never types.",
    pools: [
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "abcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "!@#$%^&*()_+-=[]{}|;:,.<>?/`~",
    ],
    length: 22,
    minEntropyBits: 128,
  },

  token: {
    type: "char",
    description: "URL-safe alphanumeric with - and _. For API keys, tokens, and environment variables.",
    whenToUse: "API keys, bearer tokens, session IDs, env vars.",
    pools: [
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "abcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "-_",
    ],
    length: 22,
    minEntropyBits: 128,
  },

  pin: {
    type: "char",
    description: "Numeric PIN, long enough to meet the 60-bit minimum for rate-limited systems.",
    whenToUse: "PINs, numeric codes, OTP seeds — only where numeric is required.",
    pools: [
      "0123456789",
    ],
    length: 19,
    minEntropyBits: 60,
  },

  passphrase: {
    type: "passphrase",
    description: "EFF large wordlist passphrase. High entropy, human-memorable.",
    whenToUse: "Master passwords, recovery keys, anything a person must remember.",
    words: 7,
    separator: "-",
    minEntropyBits: 80,
  },

};

export const PRESET_NAMES = Object.keys(PRESETS);
