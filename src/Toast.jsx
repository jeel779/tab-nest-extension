import { useEffect } from "react";

export function useToastState(toast, setToast) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast, setToast]);
}

export function Toast({ toast, onDismiss }) {
  if (!toast) {
    return <div className="toast" role="status" aria-live="polite" />;
  }

  return (
    <div className={`toast ${toast.type || "success"} show`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.undo ? (
        <button
          className="toast-undo"
          type="button"
          onClick={async () => {
            onDismiss();
            await toast.undo();
          }}
        >
          Undo
        </button>
      ) : null}
    </div>
  );
}
