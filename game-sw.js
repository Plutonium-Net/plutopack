const CACHE_NAME = "plutopack-game-v1";
const GAME_ROOT = "/__plutopack__/";

self.addEventListener("install", event => {
    event.waitUntil(
        self.skipWaiting()
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        (async () => {
            await self.clients.claim();

            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })()
    );
});

self.addEventListener("message", event => {
    const message = event.data;

    if (
        !message ||
        typeof message !== "object"
    ) {
        return;
    }

    if (message.type === "MOUNT") {
        event.waitUntil(
            mountPackage(message.files || [])
                .then(() => {
                    if (event.ports[0]) {
                        event.ports[0].postMessage({
                            success: true
                        });
                    }
                })
                .catch(error => {
                    if (event.ports[0]) {
                        event.ports[0].postMessage({
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error)
                        });
                    }
                })
        );

        return;
    }

    if (message.type === "CLEAR") {
        event.waitUntil(
            clearPackage()
                .then(() => {
                    if (event.ports[0]) {
                        event.ports[0].postMessage({
                            success: true
                        });
                    }
                })
                .catch(error => {
                    if (event.ports[0]) {
                        event.ports[0].postMessage({
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error)
                        });
                    }
                })
        );
    }
});

self.addEventListener("fetch", event => {
    const url = new URL(
        event.request.url
    );

    if (
        !url.pathname.startsWith(
            GAME_ROOT
        )
    ) {
        return;
    }

    event.respondWith(
        serveGameFile(
            event.request
        )
    );
});

async function mountPackage(files) {
    if (!Array.isArray(files)) {
        throw new TypeError(
            "PlutoPack files must be an array."
        );
    }

    const cache =
        await caches.open(
            CACHE_NAME
        );

    const existing =
        await cache.keys();

    await Promise.all(
        existing.map(request =>
            cache.delete(request)
        )
    );

    for (const file of files) {
        if (
            !file ||
            typeof file.path !== "string"
        ) {
            throw new TypeError(
                "Invalid PlutoPack file."
            );
        }

        const path =
            normalizePath(
                file.path
            );

        if (!path) {
            throw new Error(
                "PlutoPack contains a file with an empty path."
            );
        }

        const url =
            new URL(
                GAME_ROOT + path,
                self.location.origin
            );

        const headers =
            new Headers();

        headers.set(
            "Content-Type",
            file.mime ||
                getMimeType(path)
        );

        headers.set(
            "Cache-Control",
            "no-store"
        );

        let body = file.data;

        if (
            body instanceof ArrayBuffer
        ) {
            body = new Uint8Array(body);
        }

        const response =
            new Response(
                body,
                {
                    status: 200,
                    statusText: "OK",
                    headers
                }
            );

        await cache.put(
            new Request(url.href),
            response
        );
    }
}

async function serveGameFile(request) {
    const cache =
        await caches.open(
            CACHE_NAME
        );

    const response =
        await cache.match(
            request
        );

    if (response) {
        return response;
    }

    const url =
        new URL(
            request.url
        );

    const relativePath =
        url.pathname
            .slice(
                GAME_ROOT.length
            )
            .replace(
                /^\/+/,
                ""
            );

    if (!relativePath) {
        return notFound(
            "PlutoPack entry file was not specified."
        );
    }

    return notFound(
        `PlutoPack file not found: ${relativePath}`
    );
}

async function clearPackage() {
    const cache =
        await caches.open(
            CACHE_NAME
        );

    const requests =
        await cache.keys();

    await Promise.all(
        requests.map(request =>
            cache.delete(request)
        )
    );
}

function normalizePath(path) {
    let normalized =
        path
            .replaceAll(
                "\\",
                "/"
            )
            .replace(
                /^\/+/,
                ""
            );

    const parts =
        normalized.split("/");

    const result = [];

    for (const part of parts) {
        if (
            !part ||
            part === "."
        ) {
            continue;
        }

        if (part === "..") {
            if (result.length > 0) {
                result.pop();
            }

            continue;
        }

        result.push(part);
    }

    return result.join("/");
}

function getMimeType(path) {
    const extension =
        path
            .split(".")
            .pop()
            .toLowerCase();

    const types = {
        html:
            "text/html; charset=utf-8",

        htm:
            "text/html; charset=utf-8",

        css:
            "text/css; charset=utf-8",

        js:
            "text/javascript; charset=utf-8",

        mjs:
            "text/javascript; charset=utf-8",

        json:
            "application/json; charset=utf-8",

        map:
            "application/json; charset=utf-8",

        txt:
            "text/plain; charset=utf-8",

        xml:
            "application/xml; charset=utf-8",

        csv:
            "text/csv; charset=utf-8",

        svg:
            "image/svg+xml",

        png:
            "image/png",

        jpg:
            "image/jpeg",

        jpeg:
            "image/jpeg",

        gif:
            "image/gif",

        webp:
            "image/webp",

        avif:
            "image/avif",

        bmp:
            "image/bmp",

        ico:
            "image/x-icon",

        wasm:
            "application/wasm",

        mp3:
            "audio/mpeg",

        wav:
            "audio/wav",

        ogg:
            "audio/ogg",

        m4a:
            "audio/mp4",

        flac:
            "audio/flac",

        mp4:
            "video/mp4",

        webm:
            "video/webm",

        ogv:
            "video/ogg",

        mov:
            "video/quicktime",

        pdf:
            "application/pdf",

        zip:
            "application/zip",

        bin:
            "application/octet-stream"
    };

    return (
        types[extension] ||
        "application/octet-stream"
    );
}

function notFound(
    message
) {
    return new Response(
        message ||
            "PlutoPack file not found.",
        {
            status: 404,
            statusText: "Not Found",
            headers: {
                "Content-Type":
                    "text/plain; charset=utf-8",

                "Cache-Control":
                    "no-store"
            }
        }
    );
}
