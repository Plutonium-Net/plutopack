# Contributing to PlutoPack

Thank you for your interest in contributing to PlutoPack.

PlutoPack is developed as part of the Plutonium-Net ecosystem and aims to provide a portable and reliable package format for web applications, games, and other projects.

## Before Contributing

Before making a contribution, please:

1. Read the project documentation.
2. Review the PlutoPack specification.
3. Check existing issues and pull requests.
4. Make sure your proposed change fits the project's goals.
5. Ensure that your contribution complies with the Plutonium License.

For changes to the package format itself, please review `SPEC.md` carefully.

---

## Types of Contributions

Contributions may include:

* Bug fixes
* Security improvements
* Performance improvements
* Documentation
* Tests
* Tooling
* New implementations
* Compatibility improvements
* Specification proposals
* Example projects

---

## Issues

When reporting a bug, provide enough information to reproduce it.

Include, when applicable:

* Operating system
* PlutoPack version
* Implementation version
* Input package
* Expected behavior
* Actual behavior
* Error messages
* Steps to reproduce the issue

Security vulnerabilities should **not** be publicly disclosed through a normal issue.

---

## Feature Requests

Feature requests are welcome.

A useful feature request should explain:

* What problem the feature solves.
* Why the feature belongs in PlutoPack.
* How the feature could work.
* Whether it affects the package specification.
* Whether it would affect compatibility with existing packages.

Features that significantly change the format should be discussed before implementation.

---

## Specification Changes

Changes to `SPEC.md` require additional consideration because the specification defines the PlutoPack format itself.

Specification changes should:

1. Clearly describe the proposed change.
2. Explain why the change is necessary.
3. Consider compatibility with existing packages.
4. Consider security implications.
5. Consider independent implementations.
6. Include documentation updates.
7. Include tests where applicable.

Breaking changes should be clearly identified.

---

## Pull Requests

Pull requests should:

* Have a clear title.
* Explain what was changed.
* Explain why the change was made.
* Include relevant tests.
* Update documentation when necessary.
* Avoid unrelated changes.
* Follow the existing project structure and coding conventions.

Large changes should generally be discussed before submitting a pull request.

---

## Code Quality

Contributions should prioritize:

* Readability
* Reliability
* Security
* Portability
* Maintainability
* Compatibility

Avoid unnecessary complexity.

Code should be understandable to contributors who are unfamiliar with the implementation.

---

## Testing

New functionality should include appropriate tests whenever practical.

Tests should cover both expected behavior and failure cases.

For package-related functionality, tests should consider:

* Valid packages
* Invalid packages
* Missing manifests
* Missing entry files
* Duplicate paths
* Invalid paths
* Path traversal attempts
* Corrupted data
* Hash mismatches
* Binary files
* Large files
* Unicode paths
* Compatibility behavior

Security-related changes should include regression tests where possible.

---

## Documentation

Documentation should be updated when a change affects:

* Public APIs
* Package behavior
* The package specification
* CLI commands
* Configuration
* Installation
* Usage

Documentation should remain consistent with the implementation.

---

## Third-Party Code and Assets

Do not submit third-party code, assets, or dependencies without verifying their licensing requirements.

Contributors are responsible for ensuring that submitted material can legally be distributed under the project's applicable licensing terms.

Third-party licenses and copyright notices must be preserved where required.

---

## License

Contributions to PlutoPack are subject to the **Plutonium License (PL) v1.0**, unless otherwise agreed by the copyright holders.

By submitting a contribution, you confirm that you have the necessary rights to submit the contribution under the applicable project license.

The project does not automatically transfer ownership of your contribution to Plutonium-Net.

---

## Code of Conduct

Contributors are expected to communicate respectfully and constructively.

Harassment, discrimination, malicious behavior, and intentional disruption of the project are not acceptable.

Project maintainers may take appropriate action when contributions or behavior negatively impact the project or its contributors.
