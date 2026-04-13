"""Core password generation logic using Python's secrets module."""

import secrets
from .wordlist import EFF_LARGE


def _secure_choice(seq: str | list) -> str:
    """Return a cryptographically secure random element from a sequence."""
    return secrets.choice(seq)


def generate_char(length: int, pools: tuple[str, ...]) -> str:
    """
    Generates a single character-based password.

    Guarantees at least one character from each pool, fills the remainder
    from the combined pool, then shuffles using Fisher-Yates via secrets.

    Args:
        length: Total password length.
        pools:  Tuple of character pool strings.

    Returns:
        A password string of the given length.
    """
    all_chars = "".join(pools)
    result: list[str] = []

    # Guarantee at least one character per pool
    for pool in pools:
        result.append(_secure_choice(pool))

    # Fill remaining positions from combined pool
    while len(result) < length:
        result.append(_secure_choice(all_chars))

    # Fisher-Yates shuffle using secrets.randbelow (no modulo bias)
    for i in range(len(result) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        result[i], result[j] = result[j], result[i]

    return "".join(result)


def generate_passphrase(word_count: int, separator: str) -> str:
    """
    Generates a single EFF-wordlist passphrase.

    Args:
        word_count: Number of words.
        separator:  String placed between words.

    Returns:
        A passphrase string.
    """
    words = [_secure_choice(EFF_LARGE) for _ in range(word_count)]
    return separator.join(words)
