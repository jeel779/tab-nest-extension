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

  const urls = segment.tabs.map(tabUrl);

  if (inCurrentWindow) {
    for (const url of urls) await chrome.tabs.create({ url });
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
