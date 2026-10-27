# gLab Physics Lab — Progressive Web App

## Included
- `index.html`: the interactive gLab physics app
- `manifest.webmanifest`: install metadata and app icons
- `sw.js`: service worker for app-shell caching and best-effort offline CDN caching
- `icons/`: install icons

## Run locally
A PWA service worker requires HTTPS or localhost; opening `index.html` directly as a `file://` URL will not enable offline caching.

If Python is installed, open a terminal in this folder and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Install on Android / desktop
1. Host the folder on an HTTPS web host (or use localhost for testing).
2. Open the app in a supported browser such as Chrome.
3. Use the browser's **Install app** or **Add to Home screen** option. The in-app install button appears when the browser offers an install prompt.
4. Open it once while online so the app shell and CDN libraries can be cached.

## Offline notes
The HTML shell, manifest, and icons are cached. Chart.js and XLSX are cached on a best-effort basis from jsDelivr. Because those libraries are hosted externally, first open the app online before expecting charts and spreadsheet upload to work offline. For a fully self-contained offline package, vendor those JavaScript libraries locally.

## Deployment
Upload the entire contents of this folder to the same directory on an HTTPS static host. Keep the relative paths and filenames unchanged.
