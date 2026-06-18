import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiClose } from "../icons";
import {
  ToastContext,
  type ToastEntry,
  type ToastOptions,
  type ToastTone,
} from "./toast-context";
import { zIndex } from "./zIndex";

const DEFAULT_DURATION_MS = 2200;

const DOT_TONE: Record<ToastTone, string> = {
  success: "bg-emerald-500",
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  neutral: "bg-primary",
};

export type ToastProviderProps = {
  children: ReactNode;
  /** Default auto-dismiss delay applied when a toast omits `durationMs`. */
  durationMs?: number;
};

/**
 * Provides the imperative toast API and renders the bottom-center stack into a
 * portal (the Gavel `PRDetail` confirmation toast — a tone dot plus a transient
 * message). Built on clicky tokens; auto-dismisses after `durationMs`. Consume
 * the API with `useToast()` from `./toast-context`.
 */
export function ToastProvider({ children, durationMs = DEFAULT_DURATION_MS }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (options: ToastOptions | string) => {
      const normalized: ToastOptions = typeof options === "string" ? { message: options } : options;
      const id = (idRef.current += 1);
      setToasts((cur) => [...cur, { tone: "neutral", ...normalized, id }]);
      const ttl = normalized.durationMs ?? durationMs;
      if (ttl > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), ttl),
        );
      }
      return id;
    },
    [dismiss, durationMs],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((handle) => clearTimeout(handle));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-0 bottom-6 flex flex-col items-center gap-density-2"
            style={{ zIndex: zIndex.toast }}
          >
            {toasts.map((entry) => (
              <ToastView key={entry.id} entry={entry} onDismiss={() => dismiss(entry.id)} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToastView({ entry, onDismiss }: { entry: ToastEntry; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-center gap-density-2 rounded-md border border-border",
        "bg-popover px-density-3 py-density-2 text-sm font-medium text-popover-foreground shadow-lg",
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT_TONE[entry.tone ?? "neutral"])} />
      <span>{entry.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon icon={UiClose} className="h-3 w-3" />
      </button>
    </div>
  );
}
