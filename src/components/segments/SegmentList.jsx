import { EmptySegments } from "./EmptySegments.jsx";
import { SegmentItem } from "./SegmentItem.jsx";

export function SegmentList({
  editingId,
  expandedIds,
  onDelete,
  onExpand,
  onOpen,
  onOpenHere,
  onRename,
  onStartRename,
  segments
}) {
  if (segments.length === 0) {
    return <EmptySegments />;
  }

  return segments.map(segment => (
    <SegmentItem
      key={segment.id}
      segment={segment}
      expanded={expandedIds.has(segment.id)}
      editing={editingId === segment.id}
      onDelete={() => onDelete(segment.id)}
      onExpand={() => onExpand(segment.id)}
      onOpen={event => onOpen(segment.id, event.shiftKey)}
      onOpenHere={() => onOpenHere(segment.id)}
      onRename={onRename}
      onStartRename={() => onStartRename(segment.id)}
    />
  ));
}
