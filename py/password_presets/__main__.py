"""CLI entry point for password-presets Python package.

Usage:
    python -m password_presets [preset] [options]
    password-presets [preset] [options]
"""

import argparse
import json
import sys
from . import generate, inspect, presets as list_presets


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="password-presets",
        description="Cryptographically secure preset-based password generator.",
    )
    parser.add_argument(
        "preset",
        nargs="?",
        default="human",
        help="Preset name: human, machine, token, pin, passphrase (default: human)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=1,
        metavar="N",
        help="Number of passwords to generate (default: 1)",
    )
    parser.add_argument(
        "--words",
        type=int,
        default=None,
        metavar="N",
        help="Word count override for passphrase preset",
    )
    parser.add_argument(
        "--inspect",
        action="store_true",
        help="Show preset metadata instead of generating",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all presets with descriptions",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON",
    )

    args = parser.parse_args()

    try:
        if args.list:
            all_presets = list_presets()
            if args.json:
                data = [inspect(name) for name in all_presets]
                print(json.dumps(data, indent=2))
            else:
                print()
                for name in all_presets:
                    meta = inspect(name)
                    type_str = (
                        f"{meta['words']}-word passphrase"
                        if meta["type"] == "passphrase"
                        else f"{meta['length']}-char"
                    )
                    print(
                        f"  {name:<12} {type_str:<22} "
                        f"{meta['entropy_bits']:.1f} bits   {meta['description']}"
                    )
                print()

        elif args.inspect:
            meta = inspect(args.preset)
            if args.json:
                print(json.dumps(meta, indent=2))
            else:
                print()
                for k, v in meta.items():
                    if k in ("pools", "charset"):
                        continue
                    print(f"  {k:<18} {v}")
                print()

        else:
            kwargs = {"count": args.count}
            if args.words is not None:
                kwargs["words"] = args.words
            results = generate(args.preset, **kwargs)
            if args.json:
                print(json.dumps(results, indent=2))
            else:
                print()
                for i, pw in enumerate(results):
                    prefix = f"  [{i + 1:>2}]  " if len(results) > 1 else "  "
                    print(f"{prefix}{pw}")
                print()

    except ValueError as e:
        print(f"\n  Error: {e}\n", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
