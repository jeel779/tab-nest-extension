export function SaveBar({ inputRef, name, onNameChange, onSave }) {
  return (
    <div className="save-bar">
      <input
        ref={inputRef}
        type="text"
        placeholder="Segment name..."
        maxLength={60}
        autoComplete="off"
        spellCheck="false"
        value={name}
        onChange={event => onNameChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter") onSave();
        }}
      />
      <button className="btn-primary" type="button" title="Save current tabs (Ctrl+Shift+S)" onClick={onSave}>
        Save
      </button>
    </div>
  );
}
