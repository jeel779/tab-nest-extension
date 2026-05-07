import { useEffect, useMemo, useRef, useState } from "react";
import { getSegments, tabTitle, tabUrl } from "../../../utils.js";
import { Toast, useToastState } from "../../components/common/Toast.jsx";
import { SegmentList } from "../../features/segments/SegmentList.jsx";
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
      if (result.reason === "duplicate") {
        setToast({ message: `"${nextName}" already exists.`, type: "warning" });
      }
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
      setToast({ message: "Opened and removed.", type: "success" });
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
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
