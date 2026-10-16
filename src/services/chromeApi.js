import {
  getSegments,
  isRestrictedUrl,
  refreshBadge,
  saveSegments,
  saveTabsToSegment,
  tabUrl
} from "../../utils.js";

export async function getCurrentWindowTabs() {
  const rawTabs = await chrome.tabs.query({ currentWindow: true });
  return rawTabs
    .filter(tab => tab.url && !isRestrictedUrl(tab.url))
    .map(tab => ({ url: tab.url, title: tab.title || tab.url }));
}

export async function getLastFocusedSaveableTabs() {
  const thisWinId = (await chrome.windows.getCurrent()).id;
  const windows = await chrome.windows.getAll({ populate: true, windowTypes: ["normal"] });
  const target =
    windows.find(window => window.id !== thisWinId && window.focused) ||
    windows.find(window => window.id !== thisWinId);

  if (!target?.tabs) return [];

  return target.tabs
    .filter(tab => tab.url && !isRestrictedUrl(tab.url))
    .map(tab => ({ url: tab.url, title: tab.title || tab.url }));
}

export async function saveCurrentTabsToSegment(name) {
  return saveTabsToSegment(name, await getCurrentWindowTabs());
}

export async function restoreSegment(segmentId, inCurrentWindow = false) {
  const segments = await getSegments();
  const segment = segments.find(item => item.id === segmentId);
  if (!segment || segment.tabs.length === 0) return;

  const mode = inCurrentWindow ? "current" : "window";
  let windowId = null;

  if (inCurrentWindow) {
    try {
      windowId = (await chrome.windows.getCurrent()).id;
    } catch {
      windowId = null;
    }
  }

  try {
    // Hand the work to the background service worker: the popup closes as soon
    // as a new tab/window takes focus, which would cancel creation here.
    const response = await chrome.runtime.sendMessage({
      type: "RESTORE_SEGMENT",
      segmentId,
      mode,
      windowId
    });
    if (response?.ok) return;
  } catch (error) {
    console.warn("Tab Nest: background restore unavailable, falling back", error);
  }

  await restoreSegmentDirectly(segment, inCurrentWindow, windowId);
}

async function restoreSegmentDirectly(segment, inCurrentWindow, windowId) {
  const urls = segment.tabs.map(tabUrl).filter(Boolean);
  if (!urls.length) return;

  if (inCurrentWindow) {
    let lastTabId = null;
    for (const url of urls) {
      const tab = await chrome.tabs.create({ url, windowId: windowId ?? undefined, active: false });
      lastTabId = tab.id;
    }
    if (lastTabId != null) {
      await chrome.tabs.update(lastTabId, { active: true });
    }
  } else {
    await chrome.windows.create({ url: urls, focused: true });
  }
}

export async function deleteSegment(segmentId) {
  const segments = await getSegments();
  const index = segments.findIndex(item => item.id === segmentId);
  if (index === -1) return null;

  const [deleted] = segments.splice(index, 1);
  await saveSegments(segments);
  await refreshBadge();
  return deleted;
}

export async function undoDeleteSegment(segment) {
  const segments = await getSegments();
  segments.unshift(segment);
  await saveSegments(segments);
  await refreshBadge();
}

export async function renameSegment(segmentId, newName) {
  const name = newName.trim();
  if (!name) return { ok: false, reason: "empty-name" };

  const segments = await getSegments();
  const segment = segments.find(item => item.id === segmentId);
  if (!segment) return { ok: false, reason: "missing" };

  if (segments.some(item => item.id !== segmentId && item.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, reason: "duplicate" };
  }

  segment.name = name;
  await saveSegments(segments);
  return { ok: true };
}
