const MAGIC = new Uint8Array([
    0x50, 0x4c, 0x55, 0x54,
    0x4f, 0x50, 0x4b
]);

const FORMAT_MAJOR = 1;
const FORMAT_MINOR = 0;

const HEADER_SIZE = 68;

const FLAG_NONE = 0;

const MAX_UINT32 = 0xffffffff;

function assertUint32(value, name) {
    if (!Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
        throw new RangeError(`${name} must be a uint32.`);
    }
}

function assertUint16(value, name) {
    if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
        throw new RangeError(`${name} must be a uint16.`);
    }
}

function assertUint8(value, name) {
    if (!Number.isInteger(value) || value < 0 || value > 0xff) {
        throw new RangeError(`${name} must be a uint8.`);
    }
}

function assertSafeInteger(value, name) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError(`${name} must be a non-negative safe integer.`);
    }
}

function writeUint16(view, offset, value) {
    view.setUint16(offset, value, false);
}

function writeUint32(view, offset, value) {
    view.setUint32(offset, value, false);
}

function readUint16(view, offset) {
    return view.getUint16(offset, false);
}

function readUint32(view, offset) {
    return view.getUint32(offset, false);
}

function writeUint64(view, offset, value) {
    view.setBigUint64(offset, BigInt(value), false);
}

function readUint64(view, offset) {
    const value = view.getBigUint64(offset, false);

    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new RangeError("uint64 value exceeds JavaScript safe integer range.");
    }

    return Number(value);
}

export function encodeHeader({
    flags = FLAG_NONE,
    manifestOffset,
    manifestSize,
    fileTableOffset,
    fileTableSize,
    dataOffset,
    dataSize
}) {
    assertUint16(FORMAT_MAJOR, "format major version");
    assertUint16(FORMAT_MINOR, "format minor version");
    assertUint32(flags, "flags");

    assertSafeInteger(manifestOffset, "manifest offset");
    assertSafeInteger(manifestSize, "manifest size");
    assertSafeInteger(fileTableOffset, "file table offset");
    assertSafeInteger(fileTableSize, "file table size");
    assertSafeInteger(dataOffset, "data offset");
    assertSafeInteger(dataSize, "data size");

    const values = [
        manifestOffset,
        manifestSize,
        fileTableOffset,
        fileTableSize,
        dataOffset,
        dataSize
    ];

    for (const value of values) {
        if (value > Number.MAX_SAFE_INTEGER) {
            throw new RangeError("Offset or size exceeds JavaScript safe integer range.");
        }
    }

    const buffer = new ArrayBuffer(HEADER_SIZE);
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    bytes.set(MAGIC, 0);

    writeUint16(view, 8, FORMAT_MAJOR);
    writeUint16(view, 10, FORMAT_MINOR);

    writeUint32(view, 12, flags);

    writeUint16(view, 16, HEADER_SIZE);
    writeUint16(view, 18, 0);

    writeUint64(view, 20, manifestOffset);
    writeUint64(view, 28, manifestSize);

    writeUint64(view, 36, fileTableOffset);
    writeUint64(view, 44, fileTableSize);

    writeUint64(view, 52, dataOffset);
    writeUint64(view, 60, dataSize);

    return bytes;
}

export function decodeHeader(data) {
    const bytes =
        data instanceof Uint8Array
            ? data
            : new Uint8Array(data);

    if (bytes.byteLength < HEADER_SIZE) {
        throw new RangeError("PlutoPack header is incomplete.");
    }

    for (let i = 0; i < MAGIC.length; i++) {
        if (bytes[i] !== MAGIC[i]) {
            throw new Error("Invalid PlutoPack magic.");
        }
    }

    const view = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength
    );

    const major = readUint16(view, 8);
    const minor = readUint16(view, 10);
    const flags = readUint32(view, 12);
    const headerSize = readUint16(view, 16);
    const reserved = readUint16(view, 18);

    if (major !== FORMAT_MAJOR) {
        throw new Error(
            `Unsupported PlutoPack major version: ${major}`
        );
    }

    if (headerSize < HEADER_SIZE) {
        throw new Error("Invalid PlutoPack header size.");
    }

    if (reserved !== 0) {
        throw new Error("Invalid PlutoPack reserved header field.");
    }

    const manifestOffset = readUint64(view, 20);
    const manifestSize = readUint64(view, 28);

    const fileTableOffset = readUint64(view, 36);
    const fileTableSize = readUint64(view, 44);

    const dataOffset = readUint64(view, 52);
    const dataSize = readUint64(view, 60);

    const sections = [
        [manifestOffset, manifestSize, "manifest"],
        [fileTableOffset, fileTableSize, "file table"],
        [dataOffset, dataSize, "data"]
    ];

    for (const [offset, size, name] of sections) {
        if (offset < headerSize) {
            throw new Error(`${name} overlaps the PlutoPack header.`);
        }

        if (offset + size > Number.MAX_SAFE_INTEGER) {
            throw new Error(`${name} exceeds JavaScript safe integer range.`);
        }
    }

    return {
        major,
        minor,
        flags,
        headerSize,
        manifestOffset,
        manifestSize,
        fileTableOffset,
        fileTableSize,
        dataOffset,
        dataSize
    };
}

export function getMagic() {
    return MAGIC.slice();
}

export function getFormatVersion() {
    return {
        major: FORMAT_MAJOR,
        minor: FORMAT_MINOR
    };
}

export function getHeaderSize() {
    return HEADER_SIZE;
}

export const flags = Object.freeze({
    NONE: FLAG_NONE
});