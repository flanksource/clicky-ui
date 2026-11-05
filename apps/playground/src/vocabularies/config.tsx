import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { ErrorWrapper } from "@flanksource/clicky-ui";
import type { CommentVocabularyItem } from "../../../../packages/ui/src/comments/comment-vocabulary";
import { request } from "../comments/useComments";
import { VocabularyContext, type PreviewFailure } from "./context";
import type { VocabularySnapshot } from "./types";

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<VocabularySnapshot | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [failures, setFailures] = useState<Record<string, PreviewFailure>>({});
  const refreshRef = useRef<() => void>(() => {});
  const retry = useCallback(() => refreshRef.current(), []);
  const report = useCallback((failure: PreviewFailure) => {
    const key = `${failure.revision}:${failure.catalog}:${failure.item}`;
    setFailures(current => current[key] ? current : { ...current, [key]: failure });
  }, []);
  useEffect(() => {
    setFailures(current => Object.fromEntries(Object.entries(current).filter(([, failure]) => failure.revision === snapshot?.revision)));
  }, [snapshot]);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setRefreshing(true);
      try {
        const data = await request<VocabularySnapshot>("/__playground/vocabularies", { signal: controller.signal });
        if (typeof data.revision !== "string" || !Array.isArray(data.items) || !Array.isArray(data.catalogs)) throw new Error("Invalid vocabulary catalog response");
        if (!controller.signal.aborted) {
          setSnapshot(current => current?.revision === data.revision ? current : data);
          setError(null);
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause);
      } finally {
        pending = false;
        if (!controller.signal.aborted) setRefreshing(false);
      }
    };
    refreshRef.current = () => void refresh();
    const visibleRefresh = () => { if (document.visibilityState !== "hidden") void refresh(); };
    visibleRefresh();
    const timer = window.setInterval(visibleRefresh, 5000);
    window.addEventListener("focus", visibleRefresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", visibleRefresh); document.removeEventListener("visibilitychange", visibleRefresh); };
  }, []);
  const vocabulary = useMemo(() => {
    if (!snapshot) return undefined;
    const previews = new Map(snapshot.catalogs.map(catalog => [catalog.id, lazy(async () => {
      const module = await import(/* @vite-ignore */ catalog.preview) as { default: ComponentType<{ item: CommentVocabularyItem }> };
      if (!module.default) throw new Error(`Vocabulary ${catalog.id} preview requires a default component`);
      return module;
    })]));
    const available = new Set(snapshot.items.map(item => `${item.catalog}:${item.id}`));
    return { items: snapshot.items, renderPreview: (item: CommentVocabularyItem) => {
      const Preview = previews.get(item.catalog);
      if (!Preview || !available.has(`${item.catalog}:${item.id}`)) return <span className="text-xs text-muted-foreground">Preview unavailable: {item.catalog}:{item.id} is no longer loaded</span>;
      return <ErrorWrapper key={`${snapshot.revision}:${item.catalog}:${item.id}`} onError={(error, info) => report({ error, componentStack: info.componentStack ?? null, catalog: item.catalog, item: item.id, module: snapshot.catalogs.find(catalog => catalog.id === item.catalog)!.preview, revision: snapshot.revision })} renderFallback={() => <span className="text-xs text-muted-foreground">Preview unavailable</span>}>
        <Suspense fallback={<span role="status">Loading preview…</span>}><Preview item={item} /></Suspense>
      </ErrorWrapper>;
    } };
  }, [snapshot, report]);
  return <VocabularyContext.Provider value={{ vocabulary: error === null ? vocabulary : undefined, snapshot, error, refreshing, retry, failures: Object.values(failures).filter(failure => failure.revision === snapshot?.revision) }}>{children}</VocabularyContext.Provider>;
}
