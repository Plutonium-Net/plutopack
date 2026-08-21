# PlutoPack Specification

**PlutoPack Format Specification v1.0**

## 1. Overview

PlutoPack is a portable package format designed primarily for web applications, web games, and their associated resources.

A PlutoPack package combines multiple files and metadata into a single `.plutopack` package.

The format is designed to be:

* Portable
* Extensible
* Implementation-independent
* Safe to process
* Suitable for binary and text assets
* Versioned for future compatibility

This document defines the PlutoPack format and the requirements for implementations.

---

## 2. File Extension

PlutoPack packages use the following file extension:

```text
.plutopack
```

Implementations should recognize `.plutopack` as the standard PlutoPack file extension.

---

## 3. Package Structure

A PlutoPack package consists of a manifest and a collection of files.

A conceptual package may contain:

```text
package.plutopack
├── manifest
├── index.html
├── css/
├── js/
├── assets/
└── ...
```

The physical serialization of the package is implementation-defined unless otherwise specified by a future version of this specification.

Implementations must preserve the logical file paths and file contents represented by the package.

---

## 4. Manifest

Every PlutoPack package must contain a manifest.

The manifest provides information required to identify and process the package.

A minimal manifest is:

```json
{
  "plutopack": "1.0",
  "name": "Example Package",
  "version": "1.0.0",
  "entry": "index.html",
  "files": []
}
```

### 4.1 `plutopack`

The `plutopack` field identifies the PlutoPack specification version used by the package.

Example:

```json
"plutopack": "1.0"
```

Implementations must reject packages using a specification version that they do not support unless compatibility is explicitly established.

### 4.2 `name`

The `name` field contains the human-readable name of the package.

Example:

```json
"name": "Example Game"
```

The value must be a non-empty string.

### 4.3 `version`

The `version` field identifies the package's own version.

Example:

```json
"version": "1.0.0"
```

Package versioning is independent from the PlutoPack specification version.

### 4.4 `entry`

The `entry` field identifies the primary file used to launch or display the package.

For web packages, this will normally be:

```json
"entry": "index.html"
```

The referenced file must exist within the package.

### 4.5 `files`

The `files` field contains metadata describing files included in the package.

Example:

```json
"files": [
  {
    "path": "index.html",
    "size": 1024,
    "mime": "text/html"
  }
]
```

---

## 5. File Paths

File paths must use `/` as the path separator.

Valid:

```text
assets/player.png
js/game.js
css/style.css
```

Implementations must reject paths containing:

```text
../
```

or equivalent traversal attempts.

Absolute paths must also be rejected.

Examples of invalid paths include:

```text
../secret.txt
../../config
/absolute/path.txt
C:\Windows\file.txt
```

Package files must remain within the logical package root.

---

## 6. File Metadata

A file entry may contain metadata describing the corresponding file.

Example:

```json
{
  "path": "assets/player.png",
  "size": 48291,
  "mime": "image/png",
  "sha256": "..."
}
```

### 6.1 `path`

The `path` field specifies the logical location of the file.

It must be unique within the package.

Two file entries must not reference the same path.

### 6.2 `size`

The `size` field specifies the uncompressed size of the file in bytes.

The value must be a non-negative integer.

### 6.3 `mime`

The `mime` field specifies the MIME type of the file.

Examples:

```text
text/html
text/css
application/javascript
image/png
image/jpeg
audio/mpeg
video/mp4
application/octet-stream
```

Implementations may use MIME information to determine how files should be handled.

### 6.4 `sha256`

The optional `sha256` field contains the SHA-256 hash of the file's uncompressed contents.

Example:

```json
"sha256": "a665a45920422f9d417e4867efdc4fb8..."
```

When present, implementations should verify the hash before treating the file as trusted package data.

---

## 7. Binary Data

PlutoPack must support arbitrary binary files.

Implementations must not assume that package files are text.

Supported content may include:

* HTML
* CSS
* JavaScript
* JSON
* Images
* Audio
* Video
* Fonts
* WebAssembly
* Archives
* Other binary data

The original byte sequence of every file must be preserved during packing and unpacking.

---

## 8. Encoding

Text metadata must use UTF-8 encoding.

Binary file contents must be treated as raw bytes.

Implementations must not perform automatic text conversion on binary files.

---

## 9. Compression

PlutoPack implementations may compress package contents.

Compression must not alter the logical contents of files.

After decompression, the resulting bytes must exactly match the original file bytes.

An implementation must not require compression for a package to be valid unless a future specification version explicitly defines it as mandatory.

---

## 10. Duplicate Files

A package must not contain multiple file entries with the same logical path.

For example, the following is invalid:

```text
js/game.js
js/game.js
```

Implementations must reject packages containing duplicate paths.

---

## 11. Entry File

The file referenced by the `entry` field must exist.

For example:

```json
"entry": "index.html"
```

requires:

```text
index.html
```

to exist within the package.

A package with an invalid or missing entry file must be considered invalid.

---

## 12. Validation

A PlutoPack validator should verify at minimum:

1. The package can be successfully parsed.
2. The manifest exists.
3. The manifest is valid.
4. The PlutoPack version is supported.
5. The package name exists and is valid.
6. The package version exists and is valid.
7. The entry file exists.
8. Every file has a valid path.
9. No duplicate paths exist.
10. File sizes are valid.
11. File contents match declared hashes when hashes are provided.
12. Package traversal attempts are rejected.

Additional validation may be performed by individual implementations.

---

## 13. Security

Implementations must treat PlutoPack packages as untrusted input.

A package may contain malicious or intentionally malformed content.

Implementations should protect against:

* Path traversal
* Arbitrarily large allocations
* Excessive decompression
* Malformed metadata
* Duplicate entries
* Hash mismatches
* Corrupted package data
* Malicious HTML
* Malicious JavaScript
* Malicious WebAssembly
* Resource exhaustion

Parsing a valid PlutoPack package does not imply that its contents are safe to execute.

---

## 14. Compatibility

Implementations should clearly identify which PlutoPack specification versions they support.

A package created using a newer incompatible specification version must not be silently interpreted as an older format.

Implementations should provide a clear error when encountering an unsupported format version.

---

## 15. Extensions

Implementations may support additional metadata or functionality.

Extensions should:

* Avoid changing the meaning of required fields.
* Avoid breaking existing packages.
* Clearly document their behavior.
* Use names that do not conflict with standardized fields.

Future versions of this specification may standardize previously implementation-specific extensions.

---

## 16. Implementation Independence

This specification defines the behavior and logical structure of PlutoPack.

It does not require a particular programming language, operating system, runtime, or implementation.

Independent implementations are permitted.

An implementation may be written in:

* JavaScript
* TypeScript
* C++
* Rust
* Python
* Java
* Go
* Any other suitable language

An implementation is considered PlutoPack-compatible when it correctly implements the requirements of this specification.

---

## 17. Specification Version

This document defines:

```text
PlutoPack Format Specification v1.0
```

Future versions may add features, improve security, or change serialization requirements.

Implementations should identify their supported specification versions clearly.

---

## 18. License

The PlutoPack project and its reference implementation are distributed under the **Plutonium License (PL) v1.0**.

See [`LICENSE`](./LICENSE) for the complete license terms.
