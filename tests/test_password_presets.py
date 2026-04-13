"""Tests for password-presets Python package."""

import pytest
from password_presets import generate, inspect, presets
from password_presets.generate import generate_char, generate_passphrase
from password_presets.inspect_ import _entropy, _strength
from password_presets.presets import PRESETS, CharPreset, PassphrasePreset
from password_presets.wordlist import EFF_LARGE


# ─── EFF wordlist ─────────────────────────────────────────────────────────────

class TestWordlist:
    def test_has_7776_words(self):
        assert len(EFF_LARGE) == 7776

    def test_all_non_empty_strings(self):
        for w in EFF_LARGE:
            assert isinstance(w, str) and len(w) > 0


# ─── entropy / strength ───────────────────────────────────────────────────────

class TestEntropy:
    def test_known_value(self):
        # 7 words from 7776: 7 * log2(7776) ≈ 90.47
        assert abs(_entropy(7, 7776) - 90.47) < 0.1

    def test_scales_with_length(self):
        assert _entropy(20, 62) > _entropy(10, 62)

    def test_scales_with_pool_size(self):
        assert _entropy(10, 95) > _entropy(10, 62)


class TestStrength:
    def test_labels(self):
        assert _strength(70) == "moderate"
        assert _strength(100) == "strong"
        assert _strength(130) == "very-strong"


# ─── generate_char ────────────────────────────────────────────────────────────

class TestGenerateChar:
    pools = PRESETS["human"].pools
    length = PRESETS["human"].length

    def test_correct_length(self):
        assert len(generate_char(self.length, self.pools)) == self.length

    def test_pool_guarantee(self):
        for _ in range(50):
            pw = generate_char(self.length, self.pools)
            for pool in self.pools:
                assert any(c in pool for c in pw), \
                    f'Missing char from pool "{pool}" in "{pw}"'

    def test_only_valid_chars(self):
        valid = set("".join(self.pools))
        for _ in range(20):
            pw = generate_char(self.length, self.pools)
            for c in pw:
                assert c in valid, f'Unexpected char "{c}"'


# ─── generate_passphrase ──────────────────────────────────────────────────────

class TestGeneratePassphrase:
    def test_correct_word_count(self):
        phrase = generate_passphrase(7, "-")
        assert len(phrase.split("-")) == 7

    def test_all_words_from_eff(self):
        eff_set = set(EFF_LARGE)
        sep = "|"
        for word in generate_passphrase(7, sep).split(sep):
            assert word in eff_set, f'Word "{word}" not in EFF_LARGE'

    def test_custom_separator(self):
        phrase = generate_passphrase(5, ".")
        assert len(phrase.split(".")) == 5
        assert "-" not in phrase


# ─── generate (public API) ───────────────────────────────────────────────────

class TestGenerate:
    def test_always_returns_list(self):
        assert isinstance(generate("human"), list)

    def test_default_count_is_1(self):
        assert len(generate("human")) == 1

    def test_count_respected(self):
        assert len(generate("human", count=7)) == 7

    def test_all_results_are_strings(self):
        for pw in generate("machine", count=5):
            assert isinstance(pw, str) and len(pw) > 0

    def test_passphrase_returns_hyphenated_words(self):
        [phrase] = generate("passphrase")
        assert "-" in phrase
        assert len(phrase.split("-")) == 7

    def test_passphrase_words_override(self):
        [phrase] = generate("passphrase", words=10)
        assert len(phrase.split("-")) == 10

    def test_all_presets_work(self):
        for name in ["human", "machine", "token", "pin", "passphrase"]:
            result = generate(name)
            assert isinstance(result, list) and len(result[0]) > 0

    def test_unknown_preset_raises(self):
        with pytest.raises(ValueError):
            generate("unknown")

    def test_batch_results_are_unique(self):
        results = generate("human", count=20)
        assert len(set(results)) == 20


# ─── inspect (public API) ────────────────────────────────────────────────────

class TestInspect:
    def test_char_preset_shape(self):
        meta = inspect("human")
        assert meta["preset"] == "human"
        assert meta["type"] == "char"
        assert isinstance(meta["description"], str)
        assert isinstance(meta["length"], int)
        assert isinstance(meta["entropy_bits"], float)
        assert meta["strength"] in ("moderate", "strong", "very-strong")
        assert isinstance(meta["example"], str) and len(meta["example"]) > 0

    def test_passphrase_preset_shape(self):
        meta = inspect("passphrase")
        assert meta["type"] == "passphrase"
        assert isinstance(meta["words"], int)
        assert meta["wordlist_size"] == 7776
        assert meta["separator"] in meta["example"]

    def test_entropy_meets_minimum_for_all_presets(self):
        for name in presets():
            meta = inspect(name)
            assert meta["entropy_bits"] >= meta["min_entropy_bits"], \
                f'{name}: {meta["entropy_bits"]} bits < minimum {meta["min_entropy_bits"]}'

    def test_unknown_preset_raises(self):
        with pytest.raises(ValueError):
            inspect("unknown")


# ─── presets() ───────────────────────────────────────────────────────────────

class TestPresets:
    def test_returns_all_names(self):
        assert presets() == ["human", "machine", "token", "pin", "passphrase"]

    def test_returns_new_list_each_call(self):
        assert presets() is not presets()
