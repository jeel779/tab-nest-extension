// utils.js — TabNest Shared Utilities (ES Module)

// ── Constants ─────────────────────────────────────────────────────────────────

export const RESTRICTED_PREFIXES = [
  "chrome://", "chrome-extension://", "chrome-devtools://",
  "about:", "data:", "javascript:", "edge://"
];

// ── URL helpers ───────────────────────────────────────────────────────────────

export function isRestrictedUrl(url) {
  return RESTRICTED_PREFIXES.some(p => url.startsWith(p));
}

/** Extracts the URL string from a tab entry (supports old string[] and new object[] formats) */
export function tabUrl(tab) {
  return typeof tab === "string" ? tab : tab.url;
}

/** Extracts a human-readable title from a tab entry */
export function tabTitle(tab) {
  if (typeof tab === "string") {
    try { return new URL(tab).hostname; } catch { return tab; }
  }
  return tab.title || tab.url;
}

/** Returns the domain (without www.) from a URL string */
export function domain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Shows date AND time so two segments saved on the same day are distinguishable */
export function formatDate(ts) {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} - ${time}`;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function getSegments() {
  return new Promise(resolve =>
    chrome.storage.local.get("segments", d => resolve(d.segments || []))
  );
}

/** Persists segments; rejects with an Error if chrome.runtime.lastError is set (e.g. quota exceeded) */
export async function saveSegments(segments) {
  return new Promise((resolve, reject) =>
    chrome.storage.local.set({ segments }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    })
  );
}

/**
 * Shared save logic used by both popup.js and save.js.
 * Validates the name, checks for duplicates, writes to storage.
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export async function saveTabsToSegment(name, tabs) {
  name = name.trim();
  if (!name)        return { ok: false, reason: "empty-name" };
  if (!tabs.length) return { ok: false, reason: "no-tabs" };

  const segments = await getSegments();
  if (segments.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, reason: "duplicate" };
  }

  segments.unshift({ id: generateId(), name, tabs, createdAt: Date.now() });

  try {
    await saveSegments(segments);
  } catch (e) {
    if (e.message && e.message.toUpperCase().includes("QUOTA")) {
      return { ok: false, reason: "quota" };
    }
    return { ok: false, reason: "error" };
  }

  await refreshBadge();
  return { ok: true };
}

// ── Badge ─────────────────────────────────────────────────────────────────────

/** Refresh the toolbar badge to show current segment count */
export async function refreshBadge() {
  const segs = await getSegments();
  const n = segs.length;
  chrome.action.setBadgeText({ text: n > 0 ? String(n) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#f5a623" });
}

// ── Toast ─────────────────────────────────────────────────────────────────────

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"success"|"warning"|"error"} type
 * @param {Function|null} undoFn  - if provided, renders an "Undo" action button
 */
export function showToast(message, type = "success", undoFn = null) {
  const toast = document.getElementById("toast");
  toast.innerHTML = "";

  const msg = document.createElement("span");
  msg.textContent = message;
  toast.appendChild(msg);

  if (typeof undoFn === "function") {
    const btn = document.createElement("button");
    btn.className = "toast-undo";
    btn.textContent = "Undo";
    btn.addEventListener("click", () => {
      toast.className = "toast";
      undoFn();
    });
    toast.appendChild(btn);
  }

  toast.className = `toast ${type} show`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.className = "toast"; }, 3200);
}

