# password-presets (Python)

Cryptographically secure, preset-based password generation.  
Zero third-party dependencies (uses the standard library `secrets` module).

Full documentation (presets, security notes, cross-language parity) lives in the [repository README](../README.md).

## Layout

| Path | Role |
|------|------|
| `pyproject.toml` | Project metadata and build (Hatchling) |
| `password_presets/__init__.py` | Public API: `generate`, `inspect`, `presets` |
| `password_presets/__main__.py` | CLI entry point |
| `password_presets/presets.py` | Preset definitions |
| `password_presets/generate.py` | Character and passphrase generation |
| `password_presets/inspect_.py` | Preset metadata and entropy helpers |
| `password_presets/wordlist.py` | EFF large wordlist |

Tests for this package live in [`../tests/`](../tests/) at the repository root.

## Install

From [PyPI](https://pypi.org/project/password-presets/):

```sh
pip install password-presets
```

From a clone of this repo (from the repository root):

```sh
pip install ./py
```

Or install in editable mode while developing:

```sh
pip install -e ./py
```

## Usage

```python
from password_presets import generate, inspect, presets

generate("human")
inspect("human")
presets()
```

## CLI

```sh
password-presets
password-presets token --count 3
password-presets --list
```

```sh
python -m password_presets passphrase
```

## Requirements

- Python ≥ 3.11

## Development

Run tests from this directory so `pyproject.toml` and `pythonpath` apply:

```sh
cd py
pytest
```

Build a wheel:

```sh
cd py
python -m build
```

Publish (maintainers): build and upload the artifacts produced under `py/dist/`.
