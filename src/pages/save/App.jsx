import { useEffect, useRef, useState } from "react";
import { saveTabsToSegment } from "../../../utils.js";
import { Toast, useToastState } from "../../components/common/Toast.jsx";
import { getSaveErrorToast } from "../../lib/toastMessages.js";
import { getLastFocusedSaveableTabs } from "../../services/chromeApi.js";

export function SaveApp() {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [toast, setToast] = useState(null);
  const nameInputRef = useRef(null);

  useToastState(toast, setToast);

  useEffect(() => {
    async function loadTabs() {
      try {
        setTabs(await getLastFocusedSaveableTabs());
      } catch (error) {
        console.error("Tab Nest: Could not query windows", error);
        setTabs([]);
      } finally {
        setLoading(false);
        nameInputRef.current?.focus();
      }
    }

    loadTabs();
  }, []);

  async function doSave() {
    const trimmedName = name.trim();
    const result = await saveTabsToSegment(trimmedName, tabs);

    if (!result.ok) {
      setToast(getSaveErrorToast(result, trimmedName));
      if (result.reason === "empty-name") nameInputRef.current?.focus();
      return;
    }

    setToast({ message: "Saved!", type: "success" });
    window.setTimeout(() => window.close(), 900);
  }

  const disabled = loading || tabs.length === 0;
  const hint = loading
    ? "Counting tabs..."
    : tabs.length === 0
      ? "No saveable tabs found in the last window."
      : `${tabs.length} tab${tabs.length !== 1 ? "s" : ""} will be saved.`;

  return (
    <>
      <div className="save-wrapper">
        <h2>Save Current Tabs</h2>
        <p className="tab-count-hint">{hint}</p>

        <div className="save-form">
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Enter a segment name..."
            maxLength={60}
            autoComplete="off"
            spellCheck="false"
            value={name}
            onChange={event => setName(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter" && !disabled) doSave();
            }}
          />
          <div className="save-form-row">
            <button className="btn-cancel" type="button" onClick={() => window.close()}>
              Cancel
            </button>
            <button className="btn-primary" type="button" disabled={disabled} onClick={doSave}>
              Save
            </button>
          </div>
        </div>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
