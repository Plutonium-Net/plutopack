# Adding PlutoPack Support to Your Website

This guide explains how to add PlutoPack support to an existing website.

Once PlutoPack support has been added, users can select or upload a `.plutopack` file and your website can load and use its contents as part of the website. For example, a packaged game with an `index.html`, JavaScript, CSS, images, audio, and other assets can be opened without manually extracting the package.

The basic browser implementation uses two parts:

* `index.html` — accepts a PlutoPack file and starts the package.
* `game-sw.js` — provides packaged files to the browser so the application can request them normally.

You can use the versions included in this repository as a starting point:

* `index.html`
* `game-sw.js`

## Quick Integration

### 1. Add `game-sw.js`

Copy `game-sw.js` into your website's publicly accessible files.

For example:

```text
your-website/
├── index.html
├── game-sw.js
├── css/
└── js/
```

The service worker is responsible for serving files from a loaded PlutoPack package.

This is important because applications inside a package may expect to load files normally:

```text
/index.html
/css/style.css
/js/game.js
/assets/player.png
/assets/music.mp3
```

Rather than requiring the application to know that its files originally came from a `.plutopack` archive, the service worker makes the packaged files available to the browser as normal web resources.

### 2. Add a PlutoPack File Input

Add a file input somewhere in your website:

```html
<input
  type="file"
  id="plutopack-file"
  accept=".plutopack"
>
```

You can also use your own upload button or drag-and-drop interface. The important part is passing the selected file to your PlutoPack loader.

For example:

```js
const input = document.getElementById("plutopack-file");

input.addEventListener("change", async () => {
  const file = input.files[0];

  if (!file) return;

  // Load the selected PlutoPack file here.
});
```

## 3. Register the Service Worker

Your website must register `game-sw.js` before attempting to run a package.

```js
if ("serviceWorker" in navigator) {
  await navigator.serviceWorker.register("/game-sw.js");
  await navigator.serviceWorker.ready;
}
```

The service worker must control the page or relevant PlutoPack runtime before packaged resources can be handled through it.

Your integration should account for the service worker lifecycle. Depending on where and how PlutoPack is loaded, the browser may need to reload a page before a newly installed service worker takes control.

## 4. Load the Package

When a user selects a `.plutopack` file, read and process it using the PlutoPack implementation.

Conceptually:

```js
async function loadPlutoPack(file) {
  // Read the package.
  const packageData = await file.arrayBuffer();

  // Parse and validate the PlutoPack package.
  // Build the package's file map.
  // Make the package available to game-sw.js.
}
```

A PlutoPack package can contain a manifest and multiple files, including an entry point and its supporting resources.

For example:

```text
game.plutopack
│
├── manifest
├── index.html
├── css/style.css
├── js/game.js
└── assets/
    ├── player.png
    └── music.mp3
```

Your loader should use the package manifest to determine information about the package, including its entry point.

## 5. Open the Package Entry Point

After the package has been loaded and made available to the service worker, open the package's entry point.

For a package whose entry point is `index.html`, your website might display it in an iframe:

```html
<iframe id="game-frame"></iframe>
```

Then:

```js
const frame = document.getElementById("game-frame");

// The exact URL depends on your PlutoPack integration.
frame.src = packageEntryURL;
```

The application can then load its resources normally.

For example, if the packaged `index.html` contains:

```html
<link rel="stylesheet" href="/css/style.css">
<script src="/js/game.js"></script>
<img src="/assets/player.png">
```

the PlutoPack service worker handles those requests and provides the corresponding files from the loaded package.

## Typical Flow

A complete PlutoPack-enabled website generally follows this flow:

```text
User
  │
  ▼
Selects .plutopack file
  │
  ▼
Website reads package
  │
  ▼
Package is parsed and validated
  │
  ▼
Files are made available to game-sw.js
  │
  ▼
Website opens the package entry point
  │
  ▼
Application runs normally
  │
  ├── HTML
  ├── CSS
  ├── JavaScript
  ├── Images
  ├── Audio
  └── Other packaged resources
```

## Using the Included Example

The simplest way to add PlutoPack support is to start with the root `index.html` and `game-sw.js` included in this repository.

You can:

1. Copy both files into your project.
2. Integrate the file selection logic from `index.html` into your existing interface.
3. Keep `game-sw.js` available from a scope that covers the PlutoPack content you intend to serve.
4. Customize how users select, store, display, or launch packages.

You do not need to use the repository's exact user interface. Your website can provide its own:

* Upload button
* Drag-and-drop area
* Game library
* File picker
* Recent packages list
* Custom launcher

As long as your implementation correctly loads the package and provides its files to the runtime, packaged applications can use their included resources normally.

## Example: Adding PlutoPack to a Game Website

A game website could provide a button such as:

```html
<button id="upload-game">Add Game</button>

<input
  id="game-file"
  type="file"
  accept=".plutopack"
  hidden
>

<div id="games"></div>
```

When the button is pressed:

```js
const uploadButton = document.getElementById("upload-game");
const gameFile = document.getElementById("game-file");

uploadButton.addEventListener("click", () => {
  gameFile.click();
});
```

After the user selects a package, the website can load it with the PlutoPack runtime and add it to the site's game library.

When the user launches the game, the website opens the package's manifest entry point. The application can then request files from inside the package just as it would request normal web files.

## Important: Treat Uploaded Packages as Untrusted

A valid PlutoPack file may still contain untrusted or malicious content.

For example, a package may contain HTML and JavaScript that executes when the package is opened.

Websites that allow users to upload or run arbitrary PlutoPack files should consider isolation and browser security carefully. Do not assume that validating the package structure makes the application's contents safe.

In particular, consider:

* Running packages in an isolated iframe or origin where appropriate.
* Avoiding unnecessary access between the host website and packaged application.
* Validating package structure before loading it.
* Enforcing reasonable package size limits.
* Handling malformed and corrupted packages safely.
* Restricting privileged APIs unless they are explicitly required.

## Summary

To add PlutoPack support to your website:

1. Add the PlutoPack loader logic.
2. Copy or adapt `game-sw.js`.
3. Register the service worker.
4. Allow users to select `.plutopack` files.
5. Parse and validate the selected package.
6. Make its files available through the runtime.
7. Open the package's manifest entry point.
8. Let the packaged application request its files normally.

The root `index.html` and `game-sw.js` provide a reference implementation for this workflow. You can adapt them to your own website's interface and architecture while keeping the same core behavior.
