import { Search, X } from "lucide-react";

export function SearchBar({ query, onQueryChange }) {
  return (
    <div className="search-bar">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        placeholder="Search segments..."
        autoComplete="off"
        spellCheck="false"
        aria-label="Search segments"
        value={query}
        onChange={event => onQueryChange(event.target.value)}
      />
      <button
        className={`btn-clear-search${query ? "" : " hidden"}`}
        type="button"
        title="Clear search"
        aria-label="Clear search"
        onClick={() => onQueryChange("")}
      >
        <X size={14} />
      </button>
    </div>
  );
}
