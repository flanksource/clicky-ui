import { useEffect, useState, type ReactNode } from "react";

const preferenceKey = "playground.page-reloads";
type Mode = "manual" | "automatic";

function readMode(): Mode {
  const value = localStorage.getItem(preferenceKey);
  if (value === null || value === "manual") return "manual";
  if (value === "automatic") return value;
  throw new Error("Invalid playground page reload preference");
}

function hasDrafts() {
  for (let index = 0; index < sessionStorage.length; index++) {
    const key = sessionStorage.key(index);
    if (
      !key?.startsWith("clicky.comment.") ||
      !key.includes("draft:") ||
      key.endsWith(":open") ||
      key.endsWith(":mentions")
    )
      continue;
    const value: unknown = JSON.parse(sessionStorage.getItem(key)!);
    if (
      typeof value === "string"
        ? value.trim() !== ""
        : value && typeof value === "object"
          ? Object.keys(value).length > 0
          : Boolean(value)
    )
      return true;
  }
  return false;
}

export function ReloadControl({ sourceDirty, children }: { sourceDirty: boolean; children: (preferences: ReactNode, attention: boolean) => ReactNode }) {
  const [mode, setMode] = useState<Mode>("manual");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  useEffect(() => {
    const sync = () => {
      try {
        setMode(readMode());
        setError(null);
      } catch (cause) {
        setError(String(cause));
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("playground-reload-mode", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("playground-reload-mode", sync); };
  }, []);
  useEffect(() => {
    const revision = (globalThis as { __PLAYGROUND_REVISION__?: string })
      .__PLAYGROUND_REVISION__;
    if (!revision) return;
    const stream = new EventSource("/__playground/changes");
    stream.onopen = () => setConnected(true);
    stream.onerror = () => setConnected(false);
    stream.onmessage = (event) => {
      if (JSON.parse(event.data) !== revision) setPending(true);
    };
    return () => stream.close();
  }, []);
  useEffect(() => {
    if (!pending || mode !== "automatic" || sourceDirty || error) return;
    const timer = window.setInterval(() => {
      try {
        if (
          !hasDrafts() &&
          !document.querySelector(
            '[aria-busy="true"], [data-comment-storage-error]',
          )
        )
          window.location.reload();
      } catch (cause) {
        setError(String(cause));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [pending, mode, sourceDirty, error]);
  return children(
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <label>
        Page reloads{" "}
        <select
          aria-label="Page reloads"
          value={mode}
          onChange={(event) => {
            const value = event.target.value as Mode;
            try {
              localStorage.setItem(preferenceKey, value);
              setMode(value);
              window.dispatchEvent(new Event("playground-reload-mode"));
              setError(null);
            } catch (cause) {
              setError(String(cause));
            }
          }}
        >
          <option value="manual">Manual</option>
          <option value="automatic">Automatic when idle</option>
        </select>
      </label>
      {pending && (
        <button
          type="button"
          disabled={sourceDirty || Boolean(error)}
          onClick={() => {
            if (!document.querySelector("[data-comment-storage-error]"))
              window.location.reload();
          }}
          title={
            sourceDirty
              ? "Save or revert source edits before reloading"
              : undefined
          }
        >
          Updates available · Reload
        </button>
      )}
      {!connected && (
        <span role="status">
          Change notifications disconnected; reconnecting…
        </span>
      )}
      {error && (
        <span role="alert">Reload preference unavailable: {error}</span>
      )}
    </div>,
    pending || error !== null || !connected,
  );
}
