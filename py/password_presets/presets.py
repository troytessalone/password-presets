"""
Preset definitions for password-presets.

Entropy minimums are tiered by use case:
  - pin        >= 60 bits  (rate-limited systems)
  - human      >= 80 bits  (human authentication)
  - passphrase >= 80 bits  (human authentication, memorable)
  - token      >= 128 bits (API keys, secrets)
  - machine    >= 128 bits (system-generated credentials)
"""

from dataclasses import dataclass, field
from typing import Literal

PresetType = Literal["char", "passphrase"]


@dataclass(frozen=True)
class CharPreset:
    type: Literal["char"]
    description: str
    when_to_use: str
    pools: tuple[str, ...]
    length: int
    min_entropy_bits: int


@dataclass(frozen=True)
class PassphrasePreset:
    type: Literal["passphrase"]
    description: str
    when_to_use: str
    words: int
    separator: str
    min_entropy_bits: int


PRESETS: dict[str, CharPreset | PassphrasePreset] = {
    "human": CharPreset(
        type="char",
        description="For passwords a person types. No ambiguous characters (0, O, 1, l, I). Light symbols.",
        when_to_use="User account passwords, wifi passwords, anything a human enters by hand.",
        pools=(
            "ABCDEFGHJKLMNPQRSTUVWXYZ",   # uppercase, no ambiguous
            "abcdefghijkmnopqrstuvwxyz",   # lowercase, no ambiguous
            "23456789",                     # digits, no ambiguous
            "!@#$%^&*+-=",                 # symbols, readable
        ),
        length=14,
        min_entropy_bits=80,
    ),

    "machine": CharPreset(
        type="char",
        description="Full character set, maximum entropy. For passwords stored and retrieved by machines.",
        when_to_use="Database passwords, service credentials, anything a human never types.",
        pools=(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz",
            "0123456789",
            "!@#$%^&*()_+-=[]{}|;:,.<>?/`~",
        ),
        length=22,
        min_entropy_bits=128,
    ),

    "token": CharPreset(
        type="char",
        description="URL-safe alphanumeric with - and _. For API keys, tokens, and environment variables.",
        when_to_use="API keys, bearer tokens, session IDs, env vars.",
        pools=(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz",
            "0123456789",
            "-_",
        ),
        length=22,
        min_entropy_bits=128,
    ),

    "pin": CharPreset(
        type="char",
        description="Numeric PIN, long enough to meet the 60-bit minimum for rate-limited systems.",
        when_to_use="PINs, numeric codes, OTP seeds — only where numeric is required.",
        pools=("0123456789",),
        length=19,
        min_entropy_bits=60,
    ),

    "passphrase": PassphrasePreset(
        type="passphrase",
        description="EFF large wordlist passphrase. High entropy, human-memorable.",
        when_to_use="Master passwords, recovery keys, anything a person must remember.",
        words=7,
        separator="-",
        min_entropy_bits=80,
    ),
}

PRESET_NAMES: list[str] = list(PRESETS.keys())
