import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { generate, inspect, presets } from "./index.js";
import { secureRandomIndex, shuffle } from "./crypto.js";
import { generateChar, generatePassphrase } from "./generate.js";
import { entropy, strength } from "./inspect.js";
import { PRESETS } from "./presets.js";
import { EFF_LARGE } from "./wordlist.js";

// ─── secureRandomIndex ────────────────────────────────────────────────────────

describe("secureRandomIndex", () => {
  test("returns integer in [0, max)", () => {
    for (let i = 0; i < 500; i++) {
      const idx = secureRandomIndex(52);
      assert.ok(Number.isInteger(idx) && idx >= 0 && idx < 52);
    }
  });

  test("works with max=1 (always 0)", () => {
    for (let i = 0; i < 10; i++) assert.equal(secureRandomIndex(1), 0);
  });

  test("throws on non-positive max", () => {
    assert.throws(() => secureRandomIndex(0), RangeError);
    assert.throws(() => secureRandomIndex(-1), RangeError);
  });
});

// ─── shuffle ──────────────────────────────────────────────────────────────────

describe("shuffle", () => {
  test("preserves all elements", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle([...original]);
    assert.deepEqual([...result].sort((a, b) => a - b), original);
  });

  test("mutates and returns the same reference", () => {
    const arr = ["a", "b", "c"];
    assert.equal(shuffle(arr), arr);
  });
});

// ─── entropy / strength ───────────────────────────────────────────────────────

describe("entropy", () => {
  test("correct bits for known values", () => {
    // 7 words from 7776: 7 * log2(7776) ≈ 90.47
    assert.ok(Math.abs(entropy(7, 7776) - 90.47) < 0.1);
  });

  test("scales with length and pool size", () => {
    assert.ok(entropy(20, 62) > entropy(10, 62));
    assert.ok(entropy(10, 95) > entropy(10, 62));
  });
});

describe("strength", () => {
  test("labels map correctly", () => {
    assert.equal(strength(70), "moderate");
    assert.equal(strength(100), "strong");
    assert.equal(strength(130), "very-strong");
  });
});

// ─── EFF wordlist ─────────────────────────────────────────────────────────────

describe("EFF_LARGE", () => {
  test("has exactly 7776 words", () => {
    assert.equal(EFF_LARGE.length, 7776);
  });

  test("all entries are non-empty strings", () => {
    for (const w of EFF_LARGE) {
      assert.equal(typeof w, "string");
      assert.ok(w.length > 0);
    }
  });
});

// ─── generateChar ─────────────────────────────────────────────────────────────

describe("generateChar", () => {
  const pools = PRESETS.human.pools;
  const length = PRESETS.human.length;

  test("returns correct length", () => {
    assert.equal(generateChar(length, pools).length, length);
  });

  test("guarantees at least one char from each pool (50 runs)", () => {
    for (let i = 0; i < 50; i++) {
      const pw = generateChar(length, pools);
      for (const pool of pools) {
        assert.ok([...pw].some((c) => pool.includes(c)),
          `Missing char from pool "${pool}" in "${pw}"`);
      }
    }
  });

  test("only uses chars from combined pool", () => {
    const valid = new Set(pools.join(""));
    for (let i = 0; i < 20; i++) {
      for (const c of generateChar(length, pools)) {
        assert.ok(valid.has(c), `Unexpected char "${c}"`);
      }
    }
  });
});

// ─── generatePassphrase ───────────────────────────────────────────────────────

describe("generatePassphrase", () => {
  test("produces correct word count", () => {
    const phrase = generatePassphrase(7, "-");
    assert.equal(phrase.split("-").length, 7);
  });

  test("all words come from EFF_LARGE", () => {
    const set = new Set(EFF_LARGE);
    const sep = "|";
    const words = generatePassphrase(7, sep).split(sep);
    for (const w of words) {
      assert.ok(set.has(w), `Word "${w}" not in EFF_LARGE`);
    }
  });

  test("respects custom separator", () => {
    const phrase = generatePassphrase(5, ".");
    assert.equal(phrase.split(".").length, 5);
    assert.ok(!phrase.includes("-"));
  });
});

// ─── generate (public API) ───────────────────────────────────────────────────

describe("generate", () => {
  test("always returns an array", () => {
    assert.ok(Array.isArray(generate("human")));
  });

  test("default count is 1", () => {
    assert.equal(generate("human").length, 1);
  });

  test("count is respected", () => {
    assert.equal(generate("human", { count: 7 }).length, 7);
  });

  test("all results are non-empty strings", () => {
    for (const pw of generate("machine", { count: 5 })) {
      assert.equal(typeof pw, "string");
      assert.ok(pw.length > 0);
    }
  });

  test("passphrase preset returns hyphen-separated words", () => {
    const [phrase] = generate("passphrase");
    assert.ok(phrase.includes("-"));
    assert.equal(phrase.split("-").length, 7);
  });

  test("passphrase words option overrides default", () => {
    const [phrase] = generate("passphrase", { words: 10 });
    assert.equal(phrase.split("-").length, 10);
  });

  test("all preset names work", () => {
    for (const name of ["human", "machine", "token", "pin", "passphrase"]) {
      const result = generate(name);
      assert.ok(Array.isArray(result) && result[0].length > 0);
    }
  });

  test("throws on unknown preset", () => {
    assert.throws(() => generate("unknown"), TypeError);
  });

  test("batch results are unique (probabilistic)", () => {
    const results = generate("human", { count: 20 });
    assert.equal(new Set(results).size, 20);
  });
});

// ─── inspect (public API) ────────────────────────────────────────────────────

describe("inspect", () => {
  test("char preset returns expected shape", () => {
    const meta = inspect("human");
    assert.equal(meta.preset, "human");
    assert.equal(meta.type, "char");
    assert.ok(typeof meta.description === "string" && meta.description.length > 0);
    assert.ok(typeof meta.length === "number");
    assert.ok(typeof meta.entropy_bits === "number" && meta.entropy_bits > 0);
    assert.ok(["moderate", "strong", "very-strong"].includes(meta.strength));
    assert.ok(typeof meta.example === "string" && meta.example.length > 0);
  });

  test("passphrase preset returns expected shape", () => {
    const meta = inspect("passphrase");
    assert.equal(meta.type, "passphrase");
    assert.ok(typeof meta.words === "number");
    assert.equal(meta.wordlistSize, 7776);
    assert.ok(meta.example.includes(meta.separator));
  });

  test("entropy meets minimum for each preset", () => {
    for (const name of ["human", "machine", "token", "pin", "passphrase"]) {
      const meta = inspect(name);
      assert.ok(
        meta.entropy_bits >= meta.minEntropyBits,
        `${name}: ${meta.entropy_bits} bits < minimum ${meta.minEntropyBits}`
      );
    }
  });

  test("throws on unknown preset", () => {
    assert.throws(() => inspect("unknown"), TypeError);
  });
});

// ─── presets() ───────────────────────────────────────────────────────────────

describe("presets", () => {
  test("returns array of all preset names", () => {
    const names = presets();
    assert.deepEqual(names, ["human", "machine", "token", "pin", "passphrase"]);
  });

  test("returns a new array each call (not a reference)", () => {
    assert.notEqual(presets(), presets());
  });
});
