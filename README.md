# Offline CodeForge

Offline-first browser code playground built with React + Vite + Monaco + Chakra UI.

## Features

- Classic mode with JavaScript/Python execution and terminal input.
- Workspace mode with file explorer, tabs, import (files/folders), drag/drop, rename, move, delete, and persistence.
- Local Python runtime using Pyodide files from `public/pyodide`.
- Service worker caching for offline usage after first warmup.
- PWA manifest support.

## Run Locally

```bash
npm install
npm run dev
```

## Production Preview

```bash
npm run build
npm run preview
```

## Offline Flow

1. Open the app while online and click launch once.
2. Wait until warmup finishes (runtime/cache preloading).
3. Reload app and test with internet disconnected.

## Shortcuts

- `Ctrl+Enter`: Run code in classic editor.
- `Ctrl+P`: Quick-open file in workspace mode.
