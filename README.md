# PlutoPack

**A lightweight, portable package format and toolkit for the web.**

PlutoPack is a package format designed to bundle web applications, games, assets, and related resources into a single portable package.

It is being developed as part of the **[Plutonium-Net](https://github.com/Plutonium-Net)** ecosystem.

---

## Features

* **Single-file packaging** — Bundle an entire project into one `.plutopack` file.
* **Web-focused** — Designed with HTML, CSS, JavaScript, and web assets in mind.
* **Binary asset support** — Images, audio, video, fonts, and other binary files can be packaged.
* **Integrity verification** — Packages can verify that their contents have not been modified.
* **Safe extraction** — Designed to prevent unsafe paths and package traversal attacks.
* **Manifest-based** — Packages contain metadata describing their contents.
* **Versioned format** — The format can evolve without breaking older implementations.
* **Tooling-friendly** — Designed to be easy to implement in different languages.
* **Cross-platform** — The format is not tied to a specific operating system.

---

## What is a `.plutopack`?

A PlutoPack package contains everything needed to distribute a project as a single package.

A package may contain:

```text
game.plutopack
│
├── manifest
├── index.html
├── css/
├── js/
├── assets/
└── ...
```

The exact internal structure is defined by the **PlutoPack specification**.

---

## Example

A typical project might look like:

```text
my-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── game.js
└── assets/
    ├── player.png
    └── music.mp3
```

PlutoPack can turn the project into:

```text
my-game.plutopack
```

The package can then be distributed as a single file rather than requiring the entire project directory to be transferred separately.

---

## Tooling

The PlutoPack ecosystem is intended to provide tools such as:

```bash
plutopack pack ./my-game
plutopack unpack my-game.plutopack
plutopack inspect my-game.plutopack
plutopack validate my-game.plutopack
```

### `pack`

Creates a PlutoPack package from a directory.

```bash
plutopack pack ./my-game
```

### `unpack`

Extracts a PlutoPack package.

```bash
plutopack unpack my-game.plutopack
```

### `inspect`

Displays package metadata and contents.

```bash
plutopack inspect my-game.plutopack
```

### `validate`

Checks a package for structural and security issues.

```bash
plutopack validate my-game.plutopack
```

> Tooling is under active development and commands may change before the first stable release.

---

## Manifest

Every PlutoPack package contains a manifest describing the package.

A simplified example:

```json
{
  "plutopack": "1.0",
  "name": "Example Game",
  "version": "1.0.0",
  "entry": "index.html",
  "files": []
}
```

The manifest provides implementations with the information required to understand and process a package.

---

## Integrity

PlutoPack supports file integrity information so implementations can verify package contents.

A package may contain information similar to:

```json
{
  "path": "js/game.js",
  "size": 182394,
  "sha256": "..."
}
```

This allows applications to detect unexpected modifications or corrupted files.

---

## Security

Security is a core part of the PlutoPack design.

Implementations should protect against issues such as:

* Path traversal
* Malformed manifests
* Duplicate file paths
* Invalid file metadata
* Unexpected file sizes
* Corrupted package data
* Malicious package contents

**Do not assume that a PlutoPack package is trustworthy simply because it is a valid package.**

A valid package can still contain malicious HTML, JavaScript, or other content.

---

## Implementations

PlutoPack is intended to be **implementation-independent**.

The format may eventually have implementations for:

* JavaScript
* TypeScript
* C++
* Rust
* Python
* Other languages

An implementation does not need to use the official PlutoPack tooling as long as it follows the PlutoPack specification.

---

## Documentation

| Document                          | Description                             |
| --------------------------------- | --------------------------------------- |
| [Specification](./SPEC.md)        | Complete PlutoPack format specification |
| [License](./LICENSE)              | PlutoPack licensing terms               |
| [Contributing](./CONTRIBUTING.md) | Contribution guidelines                 |
| [Addition](./ADDITION.md)         | How To Add To Website                   |

Documentation will expand as the format develops.

---

## Contributing

Contributions, suggestions, bug reports, and improvements are welcome.

Before contributing, please read the project's contribution guidelines and ensure that your contributions comply with the **Plutonium License**.

---

## Part of Plutonium-Net

PlutoPack is developed as part of **Plutonium-Net**, an organization focused on building software, tools, and experimental technologies.

**Organization:** [Plutonium-Net](https://github.com/Plutonium-Net)

---

## License

PlutoPack is distributed under the **Plutonium License (PL) v1.0**.

See [`LICENSE`](./LICENSE) for the complete license text.

![PlutoPack](/pics/plutopack.png)
