# Tab Nest

Save, organize, and restore named groups of browser tabs from a Manifest V3 Chrome extension.

## Features

- Save every saveable tab in the current window as a named segment
- Restore a segment in a new window or append it to the current window
- Preview saved tab URLs, titles, and favicons
- Search by segment name, tab title, or URL
- Rename segments inline with duplicate-name protection
- Undo deletes from the toast action
- Save via the extension popup or the `Ctrl+Shift+S` / `Cmd+Shift+S` command
- Keep the extension badge synced with the saved segment count

## Tech Stack

- Manifest V3 Chrome Extension
- React + Vite
- `chrome.storage`, `chrome.tabs`, and `chrome.windows`
- Shared CSS design system

## Development

Install dependencies:

```bash
npm install
```

Run Vite for local UI development:

```bash
npm run dev
```

Build the extension:

```bash
npm run build
```

Load the generated `dist` folder in Chrome:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select this project's `dist` folder

## Project Structure

```text
tab-nest/
├── src/
│   ├── components/
│   │   ├── common/        # Shared UI such as Toast
│   │   └── icons/         # Inline SVG icon components
│   ├── features/
│   │   └── segments/      # Segment list, item, and empty state
│   ├── lib/               # Small pure helpers
│   ├── pages/
│   │   ├── popup/         # Popup App.jsx, main.jsx, and page controls
│   │   └── save/          # Shortcut save App.jsx and main.jsx
│   └── services/          # Chrome API actions used by React views
├── background.js          # Service worker for badge sync and shortcut window
├── manifest.json          # Extension manifest
├── popup.html             # Vite entry for the popup
├── save.html              # Vite entry for the shortcut save page
├── styles.css             # Shared styles
├── utils.js               # Shared storage and tab utilities
├── vite.config.js         # Multi-entry extension build
└── icons/                 # Extension icons
```
