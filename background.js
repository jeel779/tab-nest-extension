// background.js - TabNest Service Worker (ES Module)
import { getSegments, refreshBadge, tabUrl } from "./utils.js";

// Refresh badge count on service worker startup
refreshBadge();

// Restore a segment from the service worker. The popup closes as soon as a new
// tab or window takes focus, so tab/window creation must happen here instead of
// in the popup's page context.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "RESTORE_SEGMENT") return;

  restoreSegmentInBackground(message)
    .then(() => sendResponse({ ok: true }))
    .catch(error => {
      console.error("Tab Nest: restore failed", error);
      sendResponse({ ok: false, error: error.message });
    });

  return true; // keep the message channel open for the async response
});

async function restoreSegmentInBackground({ segmentId, mode, windowId }) {
  const segments = await getSegments();
  const segment = segments.find(item => item.id === segmentId);
  if (!segment || segment.tabs.length === 0) return;

  const urls = segment.tabs.map(tabUrl).filter(Boolean);
  if (!urls.length) return;

  if (mode === "current" && windowId != null) {
    // Create all but the last tab inactive so focus stays where it is,
    // then reveal the group by activating the final tab.
    let lastTabId = null;
    for (const url of urls) {
      const tab = await chrome.tabs.create({ url, windowId, active: false });
      lastTabId = tab.id;
    }
    if (lastTabId != null) {
      await chrome.tabs.update(lastTabId, { active: true });
    }
    await chrome.windows.update(windowId, { focused: true });
  } else {
    await chrome.windows.create({ url: urls, focused: true });
  }
}

// Keep badge in sync whenever segments change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.segments) refreshBadge();
});

// Keyboard shortcut - open the quick-save popup window
chrome.commands.onCommand.addListener(command => {
  if (command === "save-tabs") {
    chrome.windows.create({
      url: chrome.runtime.getURL("save.html"),
      type: "popup",
      width: 440,
      height: 210,
      focused: true
    });
  }
});
