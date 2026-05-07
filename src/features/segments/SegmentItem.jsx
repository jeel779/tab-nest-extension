import { useEffect, useRef, useState } from "react";
import { domain, formatDate, tabTitle, tabUrl } from "../../../utils.js";
import { DeleteIcon, ExpandIcon, RenameIcon } from "../../components/icons/Icons.jsx";
import { getSegmentHue } from "../../lib/segmentColor.js";

export function SegmentItem({
  segment,
  expanded,
  editing,
  onDelete,
  onExpand,
  onOpen,
  onOpenHere,
  onRename,
  onStartRename
}) {
  const [draftName, setDraftName] = useState(segment.name);
  const inputRef = useRef(null);
  const hue = getSegmentHue(segment.id);
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
