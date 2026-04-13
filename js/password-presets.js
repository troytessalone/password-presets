#!/usr/bin/env node

/**
 * password-presets CLI
 *
 * Usage:
 *   password-presets [preset] [options]
 *
 * Options:
 *   --count  <n>   Number of passwords (default: 1)
 *   --words  <n>   Word count for passphrase preset
 *   --inspect      Show preset metadata instead of generating
 *   --list         List all available presets
 *   --json         Output raw JSON
 *   --help         Show this help
 */

import { generate, inspect, presets } from "./index.js";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));

function getFlag(name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
}

const preset = args.find((a) => !a.startsWith("--") && getFlag("--count") !== a && getFlag("--words") !== a);
const asJson = flags.has("--json");

if (flags.has("--help") || flags.has("-h")) {
  console.log(`
  password-presets — cryptographically secure preset-based passwords

  Usage:
    password-presets [preset] [options]

  Presets:
    human        For passwords a person types (no ambiguous chars, light symbols)
    machine      Full charset, maximum entropy — for machine-stored credentials
    token        URL-safe alphanumeric — for API keys and env vars
    pin          Numeric — for rate-limited PIN systems
    passphrase   EFF wordlist — high entropy, human-memorable

  Options:
    --count  <n>   Number of passwords to generate (default: 1)
    --words  <n>   Word count override (passphrase only)
    --inspect      Show preset metadata instead of generating
    --list         List all presets with descriptions
    --json         Output raw JSON
    --help         Show this help

  Examples:
    password-presets
    password-presets human
    password-presets token --count 3
    password-presets passphrase --words 8
    password-presets human --inspect
    password-presets --list
  `);
  process.exit(0);
}

if (flags.has("--list")) {
  const all = presets();
  if (asJson) {
    const data = all.map((name) => inspect(name));
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log();
    for (const name of all) {
      const meta = inspect(name);
      const entropyStr = `${meta.entropy_bits} bits`;
      const typeStr = meta.type === "passphrase"
        ? `${meta.words}-word passphrase`
        : `${meta.length}-char`;
      console.log(`  ${name.padEnd(12)} ${typeStr.padEnd(20)} ${entropyStr.padEnd(12)} ${meta.description}`);
    }
    console.log();
  }
  process.exit(0);
}

const presetName = preset ?? "human";

try {
  if (flags.has("--inspect")) {
    const meta = inspect(presetName);
    if (asJson) {
      console.log(JSON.stringify(meta, null, 2));
    } else {
      console.log();
      for (const [k, v] of Object.entries(meta)) {
        if (k === "pools" || k === "charset") continue; // too noisy
        console.log(`  ${k.padEnd(16)} ${Array.isArray(v) ? v.join(", ") : v}`);
      }
      console.log();
    }
  } else {
    const count = getFlag("--count") != null ? Number(getFlag("--count")) : 1;
    const words = getFlag("--words") != null ? Number(getFlag("--words")) : undefined;
    const results = generate(presetName, { count, words });

    if (asJson) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log();
      results.forEach((pw, i) => {
        const prefix = results.length > 1 ? `  [${String(i + 1).padStart(2)}]  ` : "  ";
        console.log(`${prefix}${pw}`);
      });
      console.log();
    }
  }
} catch (err) {
  console.error(`\n  Error: ${err.message}\n`);
  process.exit(1);
}
