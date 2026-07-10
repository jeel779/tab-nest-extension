import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSegments, tabTitle, tabUrl } from "../../../utils.js";
import { SegmentList } from "../../components/segments/SegmentList.jsx";
import { getSaveErrorToast } from "../../lib/toastMessages.js";
import {
  deleteSegment,
  renameSegment,
  restoreSegment,
  saveCurrentTabsToSegment,
  undoDeleteSegment
} from "../../services/chromeApi.js";
import { PopupHeader } from "./PopupHeader.jsx";
import { SaveBar } from "./SaveBar.jsx";
import { SearchBar } from "./SearchBar.jsx";

export function PopupApp() {
  const [segments, setSegments] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);
  const nameInputRef = useRef(null);

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
      const err = getSaveErrorToast(result, name, "Failed to save segment.");
      if (err.type === "warning") {
        toast(err.message, {
          icon: "⚠️",
          style: { border: "1px solid var(--accent)" }
        });
      } else {
        toast.error(err.message);
      }
      return;
    }

    setName("");
    await reloadSegments();
    toast.success("Segment saved!");
  }

  async function handleRename(segment, value) {
    const nextName = value.trim();
    setEditingId(null);
    if (!nextName || nextName === segment.name) return;

    const result = await renameSegment(segment.id, nextName);
    if (!result.ok) {
      if (result.reason === "duplicate") {
        toast(`"${nextName}" already exists.`, {
          icon: "⚠️",
          style: { border: "1px solid var(--accent)" }
        });
      }
      return;
    }

    await reloadSegments();
    toast.success("Renamed!");
  }

  async function handleDelete(segmentId) {
    const deleted = await deleteSegment(segmentId);
    await reloadSegments();

    if (deleted) {
      toast(
        (t) => (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Segment deleted.</span>
            <button
              className="toast-undo"
              onClick={async () => {
                await undoDeleteSegment(deleted);
                await reloadSegments();
                toast.success("Delete undone.");
                toast.dismiss(t.id);
              }}
            >
              Undo
            </button>
          </span>
        ),
        {
          duration: 4000,
          icon: "🗑️",
        }
      );
    }
  }

  function handleExpand(segmentId) {
    setExpandedIds(current => {
      const next = new Set(current);
      next.has(segmentId) ? next.delete(segmentId) : next.add(segmentId);
      return next;
    });
  }

  async function handleOpen(segmentId, removeAfterOpen) {
    await restoreSegment(segmentId, false);

    if (removeAfterOpen) {
      await deleteSegment(segmentId);
      await reloadSegments();
      toast.success("Opened and removed.");
    }
  }

  return (
    <>
      <div className="popup-wrapper">
        <PopupHeader />
        <SaveBar inputRef={nameInputRef} name={name} onNameChange={setName} onSave={handleSave} />
        <SearchBar query={query} onQueryChange={setQuery} />

        <div className="segments-scroll">
          <SegmentList
            segments={filteredSegments}
            expandedIds={expandedIds}
            editingId={editingId}
            onDelete={handleDelete}
            onExpand={handleExpand}
            onOpen={handleOpen}
            onOpenHere={segmentId => restoreSegment(segmentId, true)}
            onRename={handleRename}
            onStartRename={setEditingId}
          />
        </div>
      </div>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--surface-2)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            fontSize: "12.5px",
            borderRadius: "var(--radius-sm)",
          },
          success: {
            iconTheme: {
              primary: "var(--success)",
              secondary: "var(--surface-2)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--danger)",
              secondary: "var(--surface-2)",
            },
          },
        }}
      />
    </>
  );
}
