import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { domain, formatDate, getSegments, tabTitle, tabUrl } from "../utils.js";
import {
  deleteSegment,
  renameSegment,
  restoreSegment,
  saveCurrentTabsToSegment,
  undoDeleteSegment
} from "./chromeApi.js";
import { DeleteIcon, EmptyIcon, ExpandIcon, RenameIcon, SearchIcon } from "./icons.jsx";
import { Toast, useToastState } from "./Toast.jsx";
import { getSaveErrorToast } from "./toastMessages.js";

function segmentHue(id) {
  let hue = 0;
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hue) % 360;
}

function EmptyState() {
  return (
    <div className="empty-state">
      <EmptyIcon className="empty-icon" />
      <p>
        No segments yet.
        <br />
        Save your open tabs to get started.
      </p>
    </div>
  );
}

function SegmentItem({ segment, expanded, editing, onExpand, onOpen, onOpenHere, onDelete, onRename, onStartRename }) {
  const [draftName, setDraftName] = useState(segment.name);
  const inputRef = useRef(null);
  const hue = segmentHue(segment.id);
  const count = segment.tabs.length;

  useEffect(() => {
    setDraftName(segment.name);
  }, [segment.name]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  async function commitRename() {
    if (!editing) return;
    await onRename(segment, draftName);
  }

  return (
    <div className="segment-item" data-id={segment.id}>
      <div
        className="seg-avatar"
        style={{
          background: `hsla(${hue}, 60%, 58%, 0.15)`,
          color: `hsl(${hue}, 60%, 58%)`
        }}
      >
        {segment.name.trim().charAt(0).toUpperCase()}
      </div>

      <div className="segment-info">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            className="rename-input"
            value={draftName}
            maxLength={60}
            onChange={event => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={event => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") onRename(segment, segment.name);
            }}
          />
        ) : (
          <div className="segment-name" title={segment.name}>
            {segment.name}
          </div>
        )}
        <div className="segment-meta">
          {count} tab{count !== 1 ? "s" : ""} - {formatDate(segment.createdAt)}
        </div>
      </div>

      <div className="segment-actions">
        <button className={`btn-icon btn-expand${expanded ? " expanded" : ""}`} type="button" title="Preview tabs" onClick={onExpand}>
          <ExpandIcon />
        </button>
        <button className="btn-icon btn-rename-icon" type="button" title="Rename segment" onClick={onStartRename}>
          <RenameIcon />
        </button>
        <button className="btn-open" type="button" title="Open in new window. Shift-click to open and remove" onClick={onOpen}>
          Open
        </button>
        <button className="btn-here" type="button" title="Open tabs in current window" onClick={onOpenHere}>
          Here
        </button>
        <button className="btn-icon btn-delete-icon" type="button" title="Delete segment" onClick={onDelete}>
          <DeleteIcon />
        </button>
      </div>

      {expanded ? (
        <div className="segment-preview">
          {segment.tabs.map((tab, index) => {
            const url = tabUrl(tab);
            return (
              <div className="preview-tab" key={`${url}-${index}`}>
                <img
                  className="preview-favicon"
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain(url))}&sz=16`}
                  width="14"
                  height="14"
                  loading="lazy"
                  alt=""
                  onError={event => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span className="preview-domain">{domain(url)}</span>
                <span className="preview-title">{tabTitle(tab)}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PopupApp() {
  const [segments, setSegments] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const nameInputRef = useRef(null);

  useToastState(toast, setToast);

  async function reloadSegments() {
    setSegments(await getSegments());
  }

  useEffect(() => {
    reloadSegments();
    nameInputRef.current?.focus();
  }, []);

  const filteredSegments = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) return segments;

    return segments.filter(segment =>
      segment.name.toLowerCase().includes(normalized) ||
      segment.tabs.some(tab =>
        tabTitle(tab).toLowerCase().includes(normalized) ||
        tabUrl(tab).toLowerCase().includes(normalized)
      )
    );
  }, [query, segments]);

  async function handleSave() {
    const result = await saveCurrentTabsToSegment(name);
    if (!result.ok) {
      setToast(getSaveErrorToast(result, name, "Failed to save segment."));
      return;
    }

    setName("");
    await reloadSegments();
    setToast({ message: "Segment saved!", type: "success" });
  }

  async function handleRename(segment, value) {
    const nextName = value.trim();
    setEditingId(null);
    if (!nextName || nextName === segment.name) return;

    const result = await renameSegment(segment.id, nextName);
    if (!result.ok) {
      if (result.reason === "duplicate") setToast({ message: `"${nextName}" already exists.`, type: "warning" });
      return;
    }

    await reloadSegments();
    setToast({ message: "Renamed!", type: "success" });
  }

  async function handleDelete(segmentId) {
    const deleted = await deleteSegment(segmentId);
    await reloadSegments();

    if (deleted) {
      setToast({
        message: "Segment deleted.",
        type: "error",
        undo: async () => {
          await undoDeleteSegment(deleted);
          await reloadSegments();
          setToast({ message: "Delete undone.", type: "success" });
        }
      });
    }
  }

  return (
    <>
      <div className="popup-wrapper">
        <header className="popup-header">
          <img src="icons/icon48.png" alt="Tab Nest logo" className="logo" />
          <h1>Tab Nest</h1>
        </header>

        <div className="save-bar">
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Segment name..."
            maxLength={60}
            autoComplete="off"
            spellCheck="false"
            value={name}
            onChange={event => setName(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter") handleSave();
            }}
          />
          <button className="btn-primary" type="button" title="Save current tabs (Ctrl+Shift+S)" onClick={handleSave}>
            Save
          </button>
        </div>

        <div className="search-bar">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search segments..."
            autoComplete="off"
            spellCheck="false"
            aria-label="Search segments"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <button
            className={`btn-clear-search${query ? "" : " hidden"}`}
            type="button"
            title="Clear search"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            x
          </button>
        </div>

        <div className="segments-scroll">
          {filteredSegments.length === 0 ? (
            <EmptyState />
          ) : (
            filteredSegments.map(segment => (
              <SegmentItem
                key={segment.id}
                segment={segment}
                expanded={expandedIds.has(segment.id)}
                editing={editingId === segment.id}
                onExpand={() => {
                  setExpandedIds(current => {
                    const next = new Set(current);
                    next.has(segment.id) ? next.delete(segment.id) : next.add(segment.id);
                    return next;
                  });
                }}
                onOpen={async event => {
                  await restoreSegment(segment.id, false);
                  if (event.shiftKey) {
                    await deleteSegment(segment.id);
                    await reloadSegments();
                    setToast({ message: "Opened and removed.", type: "success" });
                  }
                }}
                onOpenHere={() => restoreSegment(segment.id, true)}
                onDelete={() => handleDelete(segment.id)}
                onRename={handleRename}
                onStartRename={() => setEditingId(segment.id)}
              />
            ))
          )}
        </div>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);
