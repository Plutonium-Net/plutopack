import {
    decodeHeader,
    getHeaderSize
} from "../core/format.js";

import {
    deserializeManifest
} from "../core/manifest.js";

function toBytes(data) {
    if (data instanceof Uint8Array) {
        return data;
    }

    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }

    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(
            data.buffer,
            data.byteOffset,
            data.byteLength
        );
    }

    throw new TypeError("Package data must be binary data.");
}

function validateRange(offset, size, totalSize, name) {
    if (!Number.isSafeInteger(offset) || offset < 0) {
        throw new Error(`${name} has an invalid offset.`);
    }

    if (!Number.isSafeInteger(size) || size < 0) {
        throw new Error(`${name} has an invalid size.`);
    }

    if (offset < getHeaderSize()) {
        throw new Error(`${name} overlaps the package header.`);
    }

    if (offset > totalSize) {
        throw new Error(`${name} starts outside the package.`);
    }

    if (size > totalSize - offset) {
        throw new Error(`${name} exceeds the package boundary.`);
    }
}

function validateSections(header, packageSize) {
    const sections = [
        {
            name: "Manifest",
            offset: header.manifestOffset,
            size: header.manifestSize
        },
        {
            name: "File table",
            offset: header.fileTableOffset,
            size: header.fileTableSize
        },
        {
            name: "Data",
            offset: header.dataOffset,
            size: header.dataSize
        }
    ];

    for (const section of sections) {
        validateRange(
            section.offset,
            section.size,
            packageSize,
            section.name
        );
    }

    const manifestEnd =
        header.manifestOffset +
        header.manifestSize;

    const fileTableEnd =
        header.fileTableOffset +
        header.fileTableSize;

    const dataEnd =
        header.dataOffset +
        header.dataSize;

    if (header.fileTableOffset < manifestEnd) {
        throw new Error(
            "File table overlaps the manifest."
        );
    }

    if (header.dataOffset < fileTableEnd) {
        throw new Error(
            "Data section overlaps the file table."
        );
    }

    if (dataEnd !== packageSize) {
        throw new Error(
            "Data section does not terminate at the end of the package."
        );
    }
}

function validateManifestFiles(manifest, dataSize) {
    let calculatedSize = 0;

    const paths = new Set();

    for (const file of manifest.files) {
        if (paths.has(file.path)) {
            throw new Error(
                `Duplicate file path: ${file.path}`
            );
        }

        paths.add(file.path);

        if (!Number.isSafeInteger(file.size) || file.size < 0) {
            throw new Error(
                `Invalid file size: ${file.path}`
            );
        }

        calculatedSize += file.size;

        if (!Number.isSafeInteger(calculatedSize)) {
            throw new Error(
                "Total file size exceeds JavaScript safe integer range."
            );
        }
    }

    if (calculatedSize !== dataSize) {
        throw new Error(
            `Manifest file size (${calculatedSize}) does not match package data size (${dataSize}).`
        );
    }

    if (!paths.has(manifest.entry)) {
        throw new Error(
            `Entry file does not exist: ${manifest.entry}`
        );
    }
}

export function validate(data) {
    const bytes = toBytes(data);

    if (bytes.byteLength < getHeaderSize()) {
        throw new Error(
            "Package is smaller than the minimum PlutoPack header."
        );
    }

    const header = decodeHeader(bytes);

    validateSections(
        header,
        bytes.byteLength
    );

    const manifestStart = header.manifestOffset;
    const manifestEnd =
        manifestStart + header.manifestSize;

    const manifestBytes = bytes.slice(
        manifestStart,
        manifestEnd
    );

    const manifest =
        deserializeManifest(manifestBytes);

    validateManifestFiles(
        manifest,
        header.dataSize
    );

    if (
        header.fileTableOffset !==
        manifestEnd
    ) {
        throw new Error(
            "File table does not immediately follow the manifest."
        );
    }

    if (
        header.dataOffset !==
        header.fileTableOffset +
        header.fileTableSize
    ) {
        throw new Error(
            "Data section does not immediately follow the file table."
        );
    }

    return true;
}

export function inspect(data) {
    const bytes = toBytes(data);
    const header = decodeHeader(bytes);

    const manifestStart = header.manifestOffset;
    const manifestEnd =
        manifestStart + header.manifestSize;

    const manifest = deserializeManifest(
        bytes.slice(
            manifestStart,
            manifestEnd
        )
    );

    return {
        format: {
            major: header.major,
            minor: header.minor
        },
        package: {
            name: manifest.name,
            version: manifest.version,
            entry: manifest.entry
        },
        files: manifest.files.length,
        size: bytes.byteLength,
        manifestSize: header.manifestSize,
        fileTableSize: header.fileTableSize,
        dataSize: header.dataSize
    };
}