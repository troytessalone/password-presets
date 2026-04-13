"""Preset introspection — entropy, strength, and metadata."""

import math
from typing import Any
from .presets import PRESETS, CharPreset, PassphrasePreset
from .wordlist import EFF_LARGE
from .generate import generate_char, generate_passphrase


def _entropy(length: int, pool_size: int) -> float:
    """Shannon entropy in bits."""
    return length * math.log2(pool_size)


def _strength(bits: float) -> str:
    if bits < 80:
        return "moderate"
    if bits < 128:
        return "strong"
    return "very-strong"


def inspect(name: str) -> dict[str, Any]:
    """
    Returns full metadata for a named preset, including an example output.

    Args:
        name: Preset name (e.g. "human", "token").

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
        #   "length": 14,
        #   "entropy_bits": 84.92,
        #   "strength": "strong",
        #   "example": "kR7m!vZ3Kp2xQw"
        # }
    """
    preset = PRESETS.get(name)
    if preset is None:
        valid = ", ".join(PRESETS.keys())
        raise ValueError(f'Unknown preset "{name}". Valid presets: {valid}')

    if isinstance(preset, PassphrasePreset):
        bits = _entropy(preset.words, len(EFF_LARGE))
        return {
            "preset": name,
            "type": preset.type,
            "description": preset.description,
            "when_to_use": preset.when_to_use,
            "words": preset.words,
            "wordlist_size": len(EFF_LARGE),
            "separator": preset.separator,
            "entropy_bits": round(bits, 2),
            "strength": _strength(bits),
            "min_entropy_bits": preset.min_entropy_bits,
            "example": generate_passphrase(preset.words, preset.separator),
        }

    # CharPreset
    charset = "".join(preset.pools)
    bits = _entropy(preset.length, len(charset))
    return {
        "preset": name,
        "type": preset.type,
        "description": preset.description,
        "when_to_use": preset.when_to_use,
        "length": preset.length,
        "charset": charset,
        "charset_size": len(charset),
        "pools": list(preset.pools),
        "entropy_bits": round(bits, 2),
        "strength": _strength(bits),
        "min_entropy_bits": preset.min_entropy_bits,
        "example": generate_char(preset.length, preset.pools),
    }
