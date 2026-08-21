import {
    encodeHeader,
    getHeaderSize
} from "./format.js";

import {
    createManifest,
    serializeManifest
} from "./manifest.js";

async function toBytes(data) {
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

    if (typeof Blob !== "undefined" && data instanceof Blob) {
        return new Uint8Array(await data.arrayBuffer());
    }

    if (typeof data === "string") {
        return new TextEncoder().encode(data);
    }

    throw new TypeError("Unsupported file data type.");
}

function normalizeFiles(files) {
    if (!Array.isArray(files)) {
        throw new TypeError("files must be an array.");
    }

    return files;
}

export async function pack({
    name,
    version,
    entry = "index.html",
    files,
    metadata = {}
}) {
    normalizeFiles(files);

    const normalizedFiles = [];

    for (const file of files) {
        if (
            file === null ||
            typeof file !== "object" ||
            Array.isArray(file)
        ) {
            throw new TypeError("Each file must be an object.");
        }

        if (typeof file.path !== "string") {
            throw new TypeError("File path must be a string.");
        }

        const data = await toBytes(file.data);

        normalizedFiles.push({
            path: file.path,
            data
        });
    }

    const manifestFiles = normalizedFiles.map(file => ({
        path: file.path,
        size: file.data.byteLength,
        mime: file.mime ?? "application/octet-stream",
        ...(file.sha256 !== undefined
            ? { sha256: file.sha256 }
            : {})
    }));

    const manifest = createManifest({
        name,
        version,
        entry,
        files: manifestFiles,
        metadata
    });

    const manifestBytes = serializeManifest(manifest);

    const headerSize = getHeaderSize();
    const manifestOffset = headerSize;
    const manifestSize = manifestBytes.byteLength;

    const fileTableOffset = manifestOffset + manifestSize;
    const fileTableSize = 0;

    const dataOffset = fileTableOffset;
    const dataSize = normalizedFiles.reduce(
        (total, file) => total + file.data.byteLength,
        0
    );

    const header = encodeHeader({
        manifestOffset,
        manifestSize,
        fileTableOffset,
        fileTableSize,
        dataOffset,
        dataSize
    });

    const output = new Uint8Array(
        header.byteLength +
        manifestBytes.byteLength +
        dataSize
    );

    let offset = 0;

    output.set(header, offset);
    offset += header.byteLength;

    output.set(manifestBytes, offset);
    offset += manifestBytes.byteLength;

    for (const file of normalizedFiles) {
        output.set(file.data, offset);
        offset += file.data.byteLength;
    }

    return output;
}