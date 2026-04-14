"""
password-presets
================
Cryptographically secure, preset-based password generation.
Zero config. Zero dependencies (uses Python's built-in ``secrets`` module).

Quickstart::

    from password_presets import generate, inspect, presets

    generate("human")               # ["kR7m!vZ3Kp2xQwLn"]
    generate("human", count=3)      # ["...", "...", "..."]
    generate("passphrase")          # ["correct-horse-battery-staple-pivot-ankle-clay"]
    inspect("human")                # { "preset": "human", "entropy_bits": 84.92, ... }
    presets()                       # ["human", "machine", "token", "pin", "passphrase"]

Presets
-------
human       For passwords a person types. No ambiguous chars. Light symbols.
machine     Full charset, maximum entropy. For machine-stored credentials.
token       URL-safe alphanumeric. For API keys and environment variables.
pin         Numeric. For rate-limited PIN systems (19 digits, ≥60 bits).
passphrase  EFF large wordlist. High entropy, human-memorable.
"""

from typing import Any

from .presets import PRESETS, PRESET_NAMES
from .generate import generate_char, generate_passphrase
from .inspect_ import inspect as _inspect

__version__ = "1.0.0"
__all__ = ["generate", "inspect", "presets"]


def generate(name: str, *, count: int = 1, words: int | None = None) -> list[str]:
    """
    Generates one or more passwords for the given preset.
    Always returns a list.

    Args:
        name:   Preset name. One of: "human", "machine", "token", "pin", "passphrase".
        count:  Number of passwords to generate. Default: 1.
        words:  Word count override for the "passphrase" preset only.

    Returns:
        List of generated password strings.

    Raises:
        ValueError: If the preset name is unknown.

    Examples::

        generate("human")               # ["kR7m!vZ3Kp2xQwLn"]
        generate("token", count=5)      # 5 url-safe tokens
        generate("passphrase")          # 7-word EFF passphrase
        generate("passphrase", words=10) # 10-word passphrase
    """
    preset = PRESETS.get(name)
    if preset is None:
        valid = ", ".join(PRESETS.keys())
        raise ValueError(f'Unknown preset "{name}". Valid presets: {valid}')

    count = max(1, int(count))

    if preset.type == "passphrase":
        word_count = int(words) if words is not None else preset.words
        return [generate_passphrase(word_count, preset.separator) for _ in range(count)]

    return [generate_char(preset.length, preset.pools) for _ in range(count)]


def inspect(name: str) -> dict[str, Any]:
    """
    Returns full metadata for a named preset, including an example output.
    Use this to understand what a preset will produce before calling generate().

    Args:
        name: Preset name.

    Returns:
        Dictionary with preset metadata and a live example password.

    Raises:
        ValueError: If the preset name is unknown.

    Example::

        inspect("human")
        # {
        #   "preset": "human",
        #   "type": "char",
        #   "description": "For passwords a person types...",
        #   "when_to_use": "User account passwords...",
        #   "length": 14,
        #   "entropy_bits": 84.92,
        #   "strength": "strong",
        #   "min_entropy_bits": 80,
        #   "example": "kR7m!vZ3Kp2xQw"
        # }
    """
    return _inspect(name)


def presets() -> list[str]:
    """
    Returns all available preset names.

    Returns:
        List of preset name strings.

    Example::

        presets()  # ["human", "machine", "token", "pin", "passphrase"]
    """
    return list(PRESET_NAMES)
