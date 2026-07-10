# Tab Nest

Save, organize, and restore named groups of browser tabs from a Manifest V3 Chrome extension. 

Tab Nest helps you clear clutter and manage your browser's memory by "nesting" your open tabs into named groups (segments) that you can close and restore at any time.

---

## Table of Contents
1. [Key Features](#features)
2. [User Guide (How to Use)](#user-guide-how-to-use)
    - [Saving Your Tabs](#1-saving-your-tabs)
    - [Managing & Searching Segments](#2-managing--searching-segments)
    - [Restoring Tabs](#3-restoring-tabs)
    - [Keyboard Shortcuts](#keyboard-shortcuts)
3. [Installation / Getting Started](#installation--getting-started)
4. [Development & Building](#development--building)
5. [Project Structure](#project-structure)
6. [Tech Stack](#tech-stack)

---

## Features

- **Save Current Window Tabs:** Group all active tabs in the current window into a named segment.
- **Visual Preview:** Expand any segment to preview saved tab URLs, titles, and site favicons.
- **Smart Restoring:**
  - **Open:** Open a segment in a new window.
  - **Open & Remove:** Restores tabs in a new window and automatically deletes the segment from your list (Hold `Shift` and click **Open**).
  - **Here:** Restore and merge tabs directly into your active window.
- **Instant Search:** Filter your saved segments by segment name, tab title, or URL.
- **Inline Rename:** Double-click or click the edit icon to rename segments with built-in duplicate name prevention.
- **Accidental Delete Protection:** Instantly restore any deleted segment using the "Undo" action in the toast popup.
- **Sync Badge Count:** The extension icon displays a badge with the count of your saved segments in real time.

---

## User Guide (How to Use)

### 1. Saving Your Tabs
Keep your browser clean by saving your workspace. There are two ways to do this:

*   **Via the Extension Popup:**
    1. Click the **Tab Nest** extension icon in your toolbar.
    2. In the input field at the top, enter a name for your group (e.g., `"Work Projects"` or `"Shopping List"`).
    3. Click **Save** (or press `Enter`).
*   **Via the Keyboard Shortcut:**
    1. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac).
    2. A minimal quick-save window will pop up.
    3. Type your group name and press `Enter` to save and auto-close.

### 2. Managing & Searching Segments
Once saved, your tab groups appear in the popup interface:

*   **Previewing Tabs:** Click the **Chevron Icon** (down arrow) next to any segment. This displays an accordion list showing all saved tabs with their site favicons and page titles.
*   **Searching Your Tabs:** Use the search bar at the popup's top to search. The search matches:
    *   Segment/Group names
    *   Specific page titles
    *   Page URLs
*   **Renaming Segments:** Click the **Pencil Icon** to rename a segment inline. Press `Enter` to confirm or `Escape` to cancel.
*   **Deleting Segments:** Click the **Trash Icon** next to any group. If you delete one by accident, a toast popup will appear at the bottom: click **Undo** to restore it immediately.

### 3. Restoring Tabs
When you are ready to jump back into a project:

*   **Restore to a New Window:** Click the **Open** button next to a segment.
*   **Open and Clean Up (Shift-Click):** Hold `Shift` while clicking the **Open** button. This will restore the tabs in a new window and automatically delete the segment from your extension list.
*   **Merge into Current Window:** Click the **Here** button to inject all tabs in that segment directly into your current window without opening a new one.

### Keyboard Shortcuts
You can customize the quick-save shortcut by visiting:
`chrome://extensions/shortcuts` in your Google Chrome browser. Find **Tab Nest** and configure your preferred key combination.

---

## Installation / Getting Started

To install the extension locally in developer mode:

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the production assets:
   ```bash
   npm run build
   ```
4. Load into Google Chrome:
   - Open Chrome and navigate to `chrome://extensions`.
   - Enable **Developer mode** (toggle in the top-right corner).
   - Click **Load unpacked** (top-left button).
   - Select the `dist` directory in your project folder.

---

## Development & Building

### Run Vite Dev Server
To run the React interface locally with hot reloading (useful for styling and UI layout adjustments):
```bash
npm run dev
```

### Build for Production
To re-build the extension after making changes to background workers or utility logic:
```bash
npm run build
```

---

## Project Structure

```text
tab-nest/
├── src/
│   ├── components/
│   │   ├── common/        # Shared UI components
│   │   ├── icons/         # Inline SVG icon components
│   │   └── segments/      # Segment list, item, and empty state
│   ├── lib/               # Utility functions and toast helpers
│   ├── pages/
│   │   ├── popup/         # Main popup App components and styling
│   │   └── save/          # Keyboard shortcut save window components
│   └── services/          # React-to-Chrome API integration functions
├── background.js          # Service worker for badge counts and shortcuts
├── manifest.json          # Chrome Extension configuration
├── popup.html             # Entry point for the extension popup
├── save.html              # Entry point for the shortcut save popup
├── styles.css             # Core design system stylesheet
├── utils.js               # Common storage, tab filter, and formatting utils
└── icons/                 # Browser extension branding icons
```

---

## Tech Stack

- **Manifest V3** extension architecture
- **React + Vite** (UI engine & build system)
- **Chrome API integrations** (`chrome.storage.local`, `chrome.tabs`, `chrome.windows`, `chrome.action`)
- **Shared CSS** layout and variables system
