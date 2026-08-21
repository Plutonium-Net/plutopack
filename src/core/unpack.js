import {
    decodeHeader
} from "./format.js";

import {
    deserializeManifest
} from "./manifest.js";

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

function validateSection(offset, size, totalSize, name) {
    if (offset < 0 || size < 0) {
        throw new Error(`Invalid ${name} section.`);
    }

    if (offset > totalSize || size > totalSize - offset) {
        throw new Error(`${name} section exceeds package bounds.`);
    }
}

export function unpack(data) {
    const bytes = toBytes(data);
    const header = decodeHeader(bytes);

    validateSection(
        header.manifestOffset,
        header.manifestSize,
        bytes.byteLength,
        "manifest"
    );

    validateSection(
        header.fileTableOffset,
        header.fileTableSize,
        bytes.byteLength,
        "file table"
    );

    validateSection(
        header.dataOffset,
        header.dataSize,
        bytes.byteLength,
        "data"
    );

    const manifestStart = header.manifestOffset;
    const manifestEnd =
        manifestStart + header.manifestSize;

    const manifestBytes = bytes.slice(
        manifestStart,
        manifestEnd
    );

    const manifest = deserializeManifest(manifestBytes);

    if (
        header.fileTableOffset !==
        header.manifestOffset + header.manifestSize
    ) {
        throw new Error(
            "Invalid PlutoPack layout: file table is not contiguous with manifest."
        );
    }

    if (
        header.dataOffset !==
        header.fileTableOffset + header.fileTableSize
    ) {
        throw new Error(
            "Invalid PlutoPack layout: data section is not contiguous with file table."
        );
    }

    const files = [];
    let offset = header.dataOffset;

    for (const file of manifest.files) {
        const end = offset + file.size;

        if (end > header.dataOffset + header.dataSize) {
            throw new Error(
                `File exceeds package data section: ${file.path}`
            );
        }

        files.push({
            path: file.path,
            mime: file.mime,
            size: file.size,
            ...(file.sha256 !== undefined
                ? { sha256: file.sha256 }
                : {}),
            data: bytes.slice(offset, end)
        });

        offset = end;
    }

    if (
        offset !==
        header.dataOffset + header.dataSize
    ) {
        throw new Error(
            "Package data size does not match manifest."
        );
    }

    return {
        manifest,
        files
    };
}