import { FolderOpen } from "lucide-react";

export function EmptySegments() {
  return (
    <div className="empty-state">
      <FolderOpen className="empty-icon" strokeWidth={1.5} />
      <p>
        No segments yet.
        <br />
        Save your open tabs to get started.
      </p>
    </div>
  );
}
