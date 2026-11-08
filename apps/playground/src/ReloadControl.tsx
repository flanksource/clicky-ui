import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { PageReloadProvider, usePageReload, type PageReload } from "./page-reload";
import { createPortal } from "react-dom";
import { Button } from "@flanksource/clicky-ui";
import { validateCatalog, type PackageCatalog } from "@flanksource/page-runtime/catalog";
import { usePackageUpdates } from "./browser-mode/usePackageUpdates";
import { PlaygroundBanner } from "./PlaygroundShellParts";

const preferenceKey = "playground.page-reloads";
type Mode = "manual" | "automatic";
type ReloadProps = { sourceDirty: boolean; onReload?: PageReload; children: (preferences: ReactNode, attention: boolean) => ReactNode };
const ReloadStateContext = createContext<{ preferences: ReactNode; attention: boolean } | null>(null);

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

export function ReloadControl(props: ReloadProps) {
  const state = useContext(ReloadStateContext);
  return state ? <>{props.children(state.preferences, state.attention)}</> : <ReloadCoordinator {...props} />;
}

function ReloadCoordinator({ sourceDirty, onReload, children }: ReloadProps) {
  const inheritedReload = usePageReload();
  const reload = onReload ?? inheritedReload;
  const revision = useRef((globalThis as { __PLAYGROUND_REVISION__?: string }).__PLAYGROUND_REVISION__);
  const reloading = useRef(false);
  const [mode, setMode] = useState<Mode>("manual");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const [catalog, setCatalog] = useState<PackageCatalog | null>(null);
  const packages = usePackageUpdates(catalog);
  const [refreshing, setRefreshing] = useState(false);
  const available = Boolean(pending || packages.changed.length);
  useEffect(() => {
    const changed = (event: Event) => setPending((event as CustomEvent<string>).detail);
    window.addEventListener("playground-local-change", changed);
    return () => window.removeEventListener("playground-local-change", changed);
  }, []);
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
    if (!revision.current) return;
    const stream = new EventSource("/__playground/changes");
    stream.onopen = () => setConnected(true);
    stream.onerror = () => setConnected(false);
    stream.onmessage = (event) => {
      const next: unknown = JSON.parse(event.data);
      if (typeof next !== "string" || !next) throw new Error("Invalid playground change revision");
      if (next !== revision.current) setPending(next);
    };
    stream.addEventListener("packages", event => {
      try { setCatalog(validateCatalog(JSON.parse((event as MessageEvent<string>).data))); }
      catch (cause) { setError(String(cause)); }
    });
    return () => stream.close();
  }, []);
  const reloadPending = useCallback(async () => {
    if (!available || reloading.current) return;
    reloading.current = true;
    setRefreshing(true); setError(null);
    try {
      if (packages.changed.length && catalog) await reload({ reason: "packages", revision: catalog.revision, packages: packages.changed });
      else if (pending) await reload({ reason: "changes", revision: pending });
      if (pending) revision.current = pending;
      setPending((value) => value === pending ? null : value);
    } catch (cause) {
      setError(String(cause));
    } finally {
      reloading.current = false;
      setRefreshing(false);
    }
  }, [pending, reload, available, packages.changed.join(","), catalog]);
  useEffect(() => {
    if (!available || mode !== "automatic" || sourceDirty || error) return;
    const timer = window.setInterval(() => {
      try {
        if (
          !hasDrafts() &&
          !document.querySelector(
            '[aria-busy="true"], [data-comment-storage-error]',
          )
        )
          void reloadPending();
      } catch (cause) {
        setError(String(cause));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [available, mode, sourceDirty, error, reloadPending]);
  const preferences = (
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
      {available && (
        <button
          type="button"
          disabled={sourceDirty || Boolean(error)}
          onClick={() => {
            if (!document.querySelector("[data-comment-storage-error]"))
              void reloadPending();
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
    </div>
  );
  const attention = available || error !== null || packages.error !== null || !connected;
  const bannerTarget = document.querySelector("[data-package-updates]");
  return <ReloadStateContext.Provider value={{ preferences, attention }}><PageReloadProvider value={reload}>{packages.changed.length > 0 && bannerTarget && createPortal(
    <PlaygroundBanner tone="warning"><div className="flex flex-wrap items-center gap-2 text-sm">
      <strong>Out of date</strong><span className="min-w-0 flex-1 break-words">A new build is available for {packages.changed.map(name => name.replace("@flanksource/", "")).join(", ")}.</span>
      <Button size="sm" variant="outline" disabled={sourceDirty || refreshing} onClick={() => { if (!document.querySelector("[data-comment-storage-error]")) void reloadPending(); }}>{refreshing ? "Refreshing…" : "Refresh"}</Button>
      {sourceDirty && <span className="w-full text-xs">Save or revert source edits before refreshing.</span>}
      {(error || packages.error) && <span role="alert" className="w-full text-xs">{error ?? packages.error}</span>}
    </div></PlaygroundBanner>, bannerTarget)}{children(preferences, attention)}</PageReloadProvider></ReloadStateContext.Provider>;
}
