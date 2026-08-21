const MANIFEST_VERSION = 1;

const REQUIRED_STRING_FIELDS = [
    "name",
    "version",
    "entry"
];

const MAX_NAME_LENGTH = 256;
const MAX_VERSION_LENGTH = 128;
const MAX_ENTRY_LENGTH = 4096;
const MAX_PATH_LENGTH = 4096;
const MAX_MIME_LENGTH = 256;
const SHA256_LENGTH = 64;

const MIME_PATTERN = /^[\x20-\x7e]+$/;
const SHA256_PATTERN = /^[a-fA-F0-9]{64}$/;

function assertObject(value, name) {
    if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        throw new TypeError(`${name} must be an object.`);
    }
}

function assertString(value, name, maxLength) {
    if (typeof value !== "string" || value.length === 0) {
        throw new TypeError(`${name} must be a non-empty string.`);
    }

    if (value.length > maxLength) {
        throw new RangeError(
            `${name} exceeds the maximum length of ${maxLength}.`
        );
    }
}

function assertNonNegativeInteger(value, name) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new TypeError(
            `${name} must be a non-negative safe integer.`
        );
    }
}

function assertValidPath(path) {
    assertString(path, "file.path", MAX_PATH_LENGTH);

    if (path.includes("\0")) {
        throw new Error("File paths may not contain null bytes.");
    }

    if (path.includes("\\")) {
        throw new Error("File paths must use '/' as the separator.");
    }

    if (path.startsWith("/")) {
        throw new Error("File paths must be relative.");
    }

    if (/^[A-Za-z]:/.test(path)) {
        throw new Error("File paths may not contain drive prefixes.");
    }

    const segments = path.split("/");

    if (segments.some(segment => segment === "..")) {
        throw new Error("File paths may not contain '..' segments.");
    }

    if (segments.some(segment => segment === "")) {
        throw new Error("File paths may not contain empty segments.");
    }

    if (segments.some(segment => segment === ".")) {
        throw new Error("File paths may not contain '.' segments.");
    }
}

function assertValidMime(mime) {
    assertString(mime, "file.mime", MAX_MIME_LENGTH);

    if (!MIME_PATTERN.test(mime)) {
        throw new Error("file.mime contains invalid characters.");
    }

    if (!mime.includes("/")) {
        throw new Error("file.mime must be a valid MIME type.");
    }
}

function assertValidHash(hash) {
    if (typeof hash !== "string") {
        throw new TypeError("file.sha256 must be a string.");
    }

    if (!SHA256_PATTERN.test(hash)) {
        throw new Error("file.sha256 must be a valid SHA-256 hash.");
    }
}

function normalizeFile(file, index) {
    assertObject(file, `files[${index}]`);

    assertValidPath(file.path);
    assertNonNegativeInteger(file.size, `files[${index}].size`);
    assertValidMime(file.mime);

    const normalized = {
        path: file.path,
        size: file.size,
        mime: file.mime
    };

    if (file.sha256 !== undefined) {
        assertValidHash(file.sha256);
        normalized.sha256 = file.sha256.toLowerCase();
    }

    return normalized;
}

function validateFiles(files) {
    if (!Array.isArray(files)) {
        throw new TypeError("files must be an array.");
    }

    const paths = new Set();

    return files.map((file, index) => {
        const normalized = normalizeFile(file, index);

        if (paths.has(normalized.path)) {
            throw new Error(
                `Duplicate file path: ${normalized.path}`
            );
        }

        paths.add(normalized.path);

        return normalized;
    });
}

export function createManifest({
    name,
    version,
    entry,
    files = [],
    metadata = {}
}) {
    assertString(name, "name", MAX_NAME_LENGTH);
    assertString(version, "version", MAX_VERSION_LENGTH);
    assertString(entry, "entry", MAX_ENTRY_LENGTH);

    assertValidPath(entry);

    assertObject(metadata, "metadata");

    const normalizedFiles = validateFiles(files);

    if (!normalizedFiles.some(file => file.path === entry)) {
        throw new Error(
            `Entry file does not exist in package: ${entry}`
        );
    }

    return {
        plutopack: MANIFEST_VERSION,
        name,
        version,
        entry,
        files: normalizedFiles,
        metadata: structuredClone(metadata)
    };
}

export function validateManifest(manifest) {
    assertObject(manifest, "manifest");

    if (manifest.plutopack !== MANIFEST_VERSION) {
        throw new Error(
            `Unsupported PlutoPack manifest version: ${manifest.plutopack}`
        );
    }

    for (const field of REQUIRED_STRING_FIELDS) {
        assertString(
            manifest[field],
            field,
            field === "name"
                ? MAX_NAME_LENGTH
                : field === "version"
                    ? MAX_VERSION_LENGTH
                    : MAX_ENTRY_LENGTH
        );
    }

    assertValidPath(manifest.entry);

    const files = validateFiles(manifest.files);

    if (!files.some(file => file.path === manifest.entry)) {
        throw new Error(
            `Entry file does not exist in package: ${manifest.entry}`
        );
    }

    if (manifest.metadata !== undefined) {
        assertObject(manifest.metadata, "metadata");
    }

    return true;
}

export function serializeManifest(manifest) {
    validateManifest(manifest);

    const json = JSON.stringify(manifest);

    return new TextEncoder().encode(json);
}

export function deserializeManifest(data) {
    const bytes =
        data instanceof Uint8Array
            ? data
            : new Uint8Array(data);

    let json;

    try {
        json = new TextDecoder("utf-8", {
            fatal: true
        }).decode(bytes);
    } catch {
        throw new Error("Manifest is not valid UTF-8.");
    }

    let manifest;

    try {
        manifest = JSON.parse(json);
    } catch {
        throw new Error("Manifest contains invalid JSON.");
    }

    validateManifest(manifest);

    return manifest;
}

export function getManifestVersion() {
    return MANIFEST_VERSION;
}