import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { CommentVocabularyItem } from "../../../../packages/ui/src/comments/comment-vocabulary";
import { request } from "../comments/useComments";
import { VocabularyContext } from "./context";
import { createVocabularyPreviews, useVocabularyPreview, type PreviewJob } from "./previews";
import { VocabularyPreviewGenerator } from "./VocabularyPreviewGenerator";
import { setVocabularyPages } from "../registry";
import type { VocabularySnapshot } from "./types";

const JobsContext = createContext<PreviewJob[]>([]);

export function VocabularyGenerationHost() {
  return <>{useContext(JobsContext).map(job => <VocabularyPreviewGenerator key={job.id} job={job} />)}</>;
}

function PreviewImage({ item }: { item: CommentVocabularyItem }) {
  const preview = useVocabularyPreview(item);
  if (preview.status === "generating") return <span role="status">Generating preview…</span>;
  if (preview.status === "failed") return <span className="text-xs text-muted-foreground">{preview.error}</span>;
  return <img alt={item.label} src={preview.image.image} width={preview.image.width} height={preview.image.height} className="max-h-full max-w-full object-contain" />;
}

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<VocabularySnapshot | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<PreviewJob[]>([]);
  const previews = useMemo(() => createVocabularyPreviews({ storage: () => localStorage, generate: (catalog, count) => new Promise((resolve, reject) => {
    const finish = () => setJobs(current => current.filter(job => job !== pending));
    const pending: PreviewJob = { id: crypto.randomUUID(), catalog, count, resolve: images => { finish(); resolve(images); }, reject: error => { finish(); reject(error); } };
    setJobs(current => [...current, pending]);
  }) }), []);
  useSyncExternalStore(previews.subscribe, previews.getVersion, previews.getVersion);
  const refreshRef = useRef<() => void>(() => {});
  const retry = useCallback(() => refreshRef.current(), []);
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
        for (const catalog of data.catalogs) if (![catalog.alias, catalog.slug, catalog.file, catalog.page, catalog.instructions, catalog.previewRevision].every(value => typeof value === "string" && value.trim())) throw new Error("Invalid vocabulary page catalog response");
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
  useEffect(() => { if (snapshot) { previews.configure(snapshot); setVocabularyPages(snapshot.catalogs); } }, [snapshot, previews]);
  const vocabulary = useMemo(() => snapshot ? { items: snapshot.items, renderPreview: (item: CommentVocabularyItem) => <PreviewImage item={item} /> } : undefined, [snapshot]);
  return <VocabularyContext.Provider value={{ vocabulary: error === null ? vocabulary : undefined, snapshot, error, refreshing, retry, previews, failures: previews.failures() }}><JobsContext.Provider value={jobs}>{children}</JobsContext.Provider></VocabularyContext.Provider>;
}
