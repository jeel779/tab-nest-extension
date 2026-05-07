// background.js - TabNest Service Worker (ES Module)
import { refreshBadge } from "./utils.js";

// Refresh badge count on service worker startup
refreshBadge();

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
