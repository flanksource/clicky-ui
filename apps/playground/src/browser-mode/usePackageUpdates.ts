import { useEffect, useState, useSyncExternalStore } from "react";
import { validateCatalog, type PackageCatalog } from "@flanksource/page-runtime/catalog";
import { useBrowserSession } from "./session";
import type { PageLock } from "@flanksource/page-runtime/schema";

const noopSubscribe = () => () => {};
const emptyRuntime = () => null;
export function usePackageUpdates(latest: PackageCatalog | null) {
  const session = useBrowserSession();
  const runtime = useSyncExternalStore(session?.subscribeRuntime ?? noopSubscribe, session?.getRuntime ?? emptyRuntime);
  const [running, setRunning] = useState<{ page: string; lock: PageLock } | null>(null);
  useEffect(() => {
    if (runtime?.state === "ready" && runtime.lock) setRunning({ page: runtime.page, lock: runtime.lock });
  }, [runtime?.page, runtime?.state, runtime?.lock]);
  const lock = running?.page === runtime?.page ? running?.lock : null;
  const origin = lock?.packageOrigin;
  const [baseline, setBaseline] = useState<{ origin: string; catalog: PackageCatalog } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!origin?.includes("/_generations/")) return;
    const abort = new AbortController();
    setError(null);
    void fetch(`${origin}/__catalog.json`, { signal: abort.signal }).then(async response => {
      if (!response.ok) throw new Error(`Package catalog: HTTP ${response.status}`);
      const catalog = validateCatalog(await response.json());
      if (!abort.signal.aborted) setBaseline({ origin, catalog });
    }).catch(error => { if (!abort.signal.aborted) setError(String(error)); });
    return () => abort.abort();
  }, [origin]);
  const changed = latest && baseline && baseline.origin === origin && lock
    ? Object.keys(lock.versions).filter(name => {
      const before = baseline.catalog.packages[name];
      const after = latest.packages[name];
      return before && before.version === lock.versions[name] && (!after || before.build !== after.build);
    }) : [];
  return { changed, error };
}
