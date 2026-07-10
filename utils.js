export const RESTRICTED_PREFIXES = [
  "chrome://",
  "chrome-extension://",
  "chrome-devtools://",
  "about:",
  "data:",
  "javascript:",
  "edge://"
];

export function isRestrictedUrl(url) {
  return RESTRICTED_PREFIXES.some(prefix => url.startsWith(prefix));
}

export function tabUrl(tab) {
  return typeof tab === "string" ? tab : tab.url;
}

export function tabTitle(tab) {
  if (typeof tab === "string") {
    try {
      return new URL(tab).hostname;
    } catch {
      return tab;
    }
  }

  return tab.title || tab.url;
}

export function domain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${formattedDate} - ${formattedTime}`;
}

export async function getSegments() {
  return new Promise(resolve => {
    chrome.storage.local.get("segments", data => resolve(data.segments || []));
  });
}

export async function saveSegments(segments) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ segments }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      resolve();
    });
  });
}

export async function saveTabsToSegment(name, tabs) {
  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, reason: "empty-name" };
  if (!tabs.length) return { ok: false, reason: "no-tabs" };

  const segments = await getSegments();
  if (segments.some(segment => segment.name.toLowerCase() === trimmedName.toLowerCase())) {
    return { ok: false, reason: "duplicate" };
  }

  segments.unshift({
    id: generateId(),
    name: trimmedName,
    tabs,
    createdAt: Date.now()
  });

  try {
    await saveSegments(segments);
  } catch (error) {
    if (error.message?.toUpperCase().includes("QUOTA")) {
      return { ok: false, reason: "quota" };
    }

    return { ok: false, reason: "error" };
  }

  await refreshBadge();
  return { ok: true };
}

export async function refreshBadge() {
  const segments = await getSegments();
  const count = segments.length;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#f5a623" });
}
