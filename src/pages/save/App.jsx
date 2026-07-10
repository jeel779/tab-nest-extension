import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { saveTabsToSegment } from "../../../utils.js";
import { getSaveErrorToast } from "../../lib/toastMessages.js";
import { getLastFocusedSaveableTabs } from "../../services/chromeApi.js";

export function SaveApp() {
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const nameInputRef = useRef(null);

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
      const err = getSaveErrorToast(result, trimmedName);
      if (err.type === "warning") {
        toast(err.message, {
          icon: "⚠️",
          style: { border: "1px solid var(--accent)" }
        });
      } else {
        toast.error(err.message);
      }
      if (result.reason === "empty-name") nameInputRef.current?.focus();
      return;
    }

    toast.success("Saved!");
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
