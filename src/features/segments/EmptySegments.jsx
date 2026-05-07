import { EmptyIcon } from "../../components/icons/Icons.jsx";

export function EmptySegments() {
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
