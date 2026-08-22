# Security Policy

## Overview

PlutoPack is a file format and browser-oriented implementation for packaging and loading web applications. A `.plutopack` file may contain executable web content, including HTML, JavaScript, CSS, images, audio, and other files.

Because PlutoPack can load and run user-provided content, **a valid PlutoPack package should not automatically be considered safe or trusted**.

Website developers integrating PlutoPack are responsible for deciding how packages are validated, isolated, and executed.

## Reporting a Vulnerability

If you discover a security vulnerability in PlutoPack, please **do not open a public GitHub issue**.

Instead, report the vulnerability privately to the project maintainers with:

* A description of the vulnerability.
* Steps to reproduce the issue.
* A proof of concept, if available.
* The affected version or commit.
* The potential security impact.
* Any suggested mitigation or fix.

Please give maintainers reasonable time to investigate and address the issue before publicly disclosing it.

## Security Considerations for Package Authors

PlutoPack packages may contain executable content. Package authors should assume that users and websites may inspect, reject, or isolate their packages.

Packages should not:

* Attempt to access data outside their intended environment.
* Attempt to bypass browser security restrictions.
* Exploit the host website or PlutoPack runtime.
* Attempt to interfere with other loaded packages.
* Misrepresent their contents or identity.
* Include intentionally malicious code.

A PlutoPack package being structurally valid does **not** mean its contents are trusted.

## Security Considerations for Website Developers

If your website allows users to upload and run PlutoPack files, treat every uploaded package as **untrusted input**.

This includes packages uploaded by users you know or packages that appear to have been created by legitimate software.

### Validate Packages

Before loading a package, validate its structure and reject malformed or unsupported data.

At minimum, consider checking:

* Package format and version.
* Manifest structure.
* Required fields.
* Entry point validity.
* File paths.
* File sizes.
* Total package size.
* Duplicate or conflicting paths.
* Invalid or unexpected metadata.

Do not assume that a parser successfully reading a package means the package is safe to execute.

## File Paths

Package implementations should carefully validate file paths.

Do not allow package paths to escape the intended virtual package root. Implementations should reject or safely normalize paths that could result in unexpected resource access.

Examples of paths that require special handling include:

```text
../private-file
../../index.html
/a/../../file.js
```

The exact rules depend on the implementation, but a package should never be able to use path handling to access files outside its own intended namespace.

## Running JavaScript

A PlutoPack package may contain JavaScript. Loading a package can therefore mean executing untrusted code.

Website developers should not give packaged applications the same level of trust as the host website unless the package is explicitly trusted.

Consider running packages in an isolated environment, such as a sandboxed iframe or separate origin, where appropriate.

The host website should avoid unnecessarily exposing:

* Authentication information.
* Private user data.
* Internal application APIs.
* Administrative functionality.
* Secrets or credentials.
* Direct privileged access to the host page.

## Service Worker Considerations

The PlutoPack browser implementation may use a service worker to provide files from a loaded package.

Service workers are powerful browser features and should be scoped carefully.

When integrating `game-sw.js`, developers should ensure that:

* The service worker has the narrowest practical scope.
* Packaged content cannot unexpectedly control unrelated parts of the website.
* Requests are only served from the intended package.
* Package state is correctly separated when multiple packages are supported.
* Cached data is handled carefully.
* Old package data cannot unintentionally be served to a different package.

Do not broaden a service worker's scope solely for convenience.

## Isolate Packages Where Possible

If your website allows arbitrary users to upload packages, isolation is strongly recommended.

A package should ideally not be able to:

* Modify the host website.
* Read sensitive host page data.
* Access privileged application functions.
* Interfere with another running package.
* Assume that it is trusted simply because it was loaded successfully.

The appropriate isolation strategy depends on the website and browser architecture.

## Package Size Limits

Implementations should enforce reasonable limits on uploaded packages.

Consider limiting:

* Total package size.
* Individual file size.
* Number of files.
* Manifest size.
* Memory used while parsing.
* Time spent processing a package.

These limits can help protect against malformed packages designed to consume excessive resources.

## Denial-of-Service Risks

A package does not need to exploit a vulnerability to cause problems.

For example, a package may contain:

* Extremely large files.
* A very large number of files.
* Resource-intensive JavaScript.
* Infinite loops.
* Excessive memory usage.
* Repeated or expensive resource requests.

Implementations should avoid assuming that all packages are well behaved and should handle errors without crashing the host website whenever possible.

## Do Not Store Secrets in Packages

Package authors should never include secrets in a PlutoPack file.

Do not include:

* API keys.
* Passwords.
* Private tokens.
* Private encryption keys.
* Database credentials.
* Authentication secrets.

A `.plutopack` file should be treated as readable by anyone who receives it.

Obfuscation does not make a secret safe.

## Dependencies

Implementations and websites using PlutoPack should keep their dependencies up to date and review dependencies that process untrusted files.

Particular care should be taken with dependencies responsible for:

* Parsing package data.
* Decompressing archives.
* Processing binary data.
* Handling paths.
* Executing or transforming content.

A vulnerability in a dependency may affect the security of the PlutoPack runtime.

## Supported Versions

Security fixes are generally applied to the latest supported version of PlutoPack.

| Version                    | Supported      |
| -------------------------- | -------------- |
| Latest development version | Yes            |
| Older versions             | Not guaranteed |

If you are using PlutoPack, keep your implementation updated when security fixes are released.

## Scope

This policy covers security issues in the PlutoPack project and its official implementation.

Security issues in applications packaged with PlutoPack are generally the responsibility of the package author, unless the issue is caused by a vulnerability in PlutoPack itself.

Likewise, websites that choose to load arbitrary user-created packages are responsible for securing their own integration and deciding what level of trust and isolation is appropriate for their users.

## Security Principle

**A PlutoPack file is data provided by an external source. Treat its structure, metadata, files, and executable content as untrusted until your application has explicitly established otherwise.**
