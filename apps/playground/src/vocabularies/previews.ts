import { useEffect, useSyncExternalStore } from "react";
import type { CommentVocabularyItem, VocabularyPreviewImage } from "@flanksource/clicky-ui/comments";
import { useVocabulary } from "./context";
import type { VocabularyCatalog, VocabularySnapshot } from "./types";

export type PreviewState = { status: "ready"; image: VocabularyPreviewImage } | { status: "generating" } | { status: "failed"; error: string };
export type PreviewIssue = { alias: string; message: string };
export type PreviewJob = { id: string; catalog: VocabularyCatalog; count: number; resolve: (images: VocabularyPreviewImage[]) => void; reject: (error: Error) => void };
type Entry = { catalog: VocabularyCatalog; items: CommentVocabularyItem[]; images?: Record<string, Omit<VocabularyPreviewImage, "id">>; error?: string };
const generating: PreviewState = { status: "generating" };
const cacheKey = (alias: string) => `clicky-playground.vocabulary-previews.${alias}`;
const message = (error: unknown) => error instanceof Error ? error.message : String(error);
const missingMarker = (entry: Entry, id: string) => `${entry.catalog.alias}:${id} has no VocabularyPreview marker on ${entry.catalog.file}`;

export function createVocabularyPreviews(options: {
  storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
  generate: (catalog: VocabularyCatalog, count: number) => Promise<VocabularyPreviewImage[]>;
}) {
  let entries = new Map<string, Entry>();
  const running = new Map<string, Promise<void>>();
  const regenerating = new Map<string, Promise<void>>();
  const cacheFailures = new Map<string, string>();
  const listeners = new Set<() => void>();
  let version = 0;
  const publish = () => { version++; for (const listener of listeners) listener(); };
  const cacheFailure = (alias: string, error: unknown) => { cacheFailures.set(alias, `Preview cache unavailable: ${message(error)}`); publish(); };
  function read(entry: Entry) {
    try {
      const raw = options.storage().getItem(cacheKey(entry.catalog.alias));
      if (raw === null) return;
      const cached = JSON.parse(raw) as { previewRevision: string; images: Entry["images"] };
      if (cached.previewRevision !== entry.catalog.previewRevision) return;
      if (!cached.images || typeof cached.images !== "object") throw new Error("Invalid preview cache images");
      validateImages(entry, Object.entries(cached.images).map(([id, value]) => ({ ...value, id })));
      entry.images = cached.images;
    } catch (error) { cacheFailure(entry.catalog.alias, error); }
  }
  function validateImages(entry: Entry, images: VocabularyPreviewImage[]) {
    const declared = new Set(entry.items.map(item => item.id));
    const extra = images.filter(image => !declared.has(image.id)).map(image => image.id);
    if (extra.length) throw new Error(`${entry.catalog.file} has undeclared VocabularyPreview markers: ${extra.join(", ")}`);
    const ids = new Set<string>();
    for (const image of images) {
      if (ids.has(image.id)) throw new Error(`Duplicate VocabularyPreview marker ${image.id} on ${entry.catalog.file}`);
      ids.add(image.id);
      if (!image.image.startsWith("data:image/webp;base64,") || !Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width <= 0 || image.height <= 0) throw new Error(`Invalid vocabulary preview image ${entry.catalog.alias}:${image.id}`);
    }
  }
  async function generate(entry: Entry) {
    try {
      const images = await options.generate(entry.catalog, entry.items.length);
      validateImages(entry, images);
      if (entries.get(entry.catalog.alias) !== entry) return;
      entry.images = Object.fromEntries(images.map(({ id, ...image }) => [id, image]));
      try { options.storage().setItem(cacheKey(entry.catalog.alias), JSON.stringify({ previewRevision: entry.catalog.previewRevision, images: entry.images })); }
      catch (error) { cacheFailure(entry.catalog.alias, error); }
    } catch (error) { entry.error = message(error); }
    finally { publish(); }
  }
  async function ensure(alias: string): Promise<void> {
    const entry = entries.get(alias);
    if (!entry) throw new Error(`Unknown vocabulary alias ${alias}`);
    const pending = running.get(alias);
    if (pending) { await pending; if (entries.get(alias) !== entry || (!entry.images && !entry.error)) await ensure(alias); return; }
    if (entry.images || entry.error) return;
    read(entry);
    if (entry.images) { publish(); return; }
    const run = generate(entry).finally(() => { running.delete(alias); });
    running.set(alias, run);
    await run;
  }
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getVersion: () => version,
    configure(snapshot: VocabularySnapshot) {
      entries = new Map(snapshot.catalogs.map(catalog => {
        const previous = entries.get(catalog.alias);
        return [catalog.alias, previous?.catalog.previewRevision === catalog.previewRevision ? previous : { catalog, items: snapshot.items.filter(item => item.catalog === catalog.alias) }];
      }));
      for (const alias of cacheFailures.keys()) if (!entries.has(alias)) cacheFailures.delete(alias);
      publish();
    },
    ensure,
    preview(item: CommentVocabularyItem): PreviewState {
      const entry = entries.get(item.catalog);
      if (!entry || !entry.items.some(value => value.id === item.id)) return { status: "failed", error: `Preview unavailable: ${item.catalog}:${item.id} is no longer loaded` };
      if (entry.error) return { status: "failed", error: entry.error };
      const image = entry.images && Object.hasOwn(entry.images, item.id) ? entry.images[item.id] : undefined;
      if (image) return { status: "ready", image: { ...image, id: item.id } };
      return entry.images ? { status: "failed", error: missingMarker(entry, item.id) } : generating;
    },
    failures(): PreviewIssue[] {
      return [...cacheFailures].map(([alias, message]) => ({ alias, message })).concat([...entries.values()].flatMap(entry => {
        if (entry.error) return [{ alias: entry.catalog.alias, message: entry.error }];
        return entry.images ? entry.items.filter(item => !Object.hasOwn(entry.images!, item.id)).map(item => ({ alias: entry.catalog.alias, message: missingMarker(entry, item.id) })) : [];
      }));
    },
    regenerate(alias: string) {
      const previous = regenerating.get(alias);
      if (previous) return previous;
      const regeneration = (async () => {
        const pending = running.get(alias);
        if (pending) await pending;
        const entry = entries.get(alias);
        if (!entry) throw new Error(`Unknown vocabulary alias ${alias}`);
        cacheFailures.delete(alias);
        try { options.storage().removeItem(cacheKey(alias)); } catch (error) { cacheFailure(alias, error); }
        const next = { catalog: entry.catalog, items: entry.items };
        entries.set(alias, next);
        const run = generate(next).finally(() => { running.delete(alias); });
        running.set(alias, run);
        publish();
        await run;
      })().finally(() => { regenerating.delete(alias); });
      regenerating.set(alias, regeneration);
      return regeneration;
    },
  };
}
export type VocabularyPreviews = ReturnType<typeof createVocabularyPreviews>;

export function useVocabularyPreview(item: CommentVocabularyItem): PreviewState {
  const { previews } = useVocabulary();
  const version = useSyncExternalStore(previews.subscribe, previews.getVersion, previews.getVersion);
  const preview = previews.preview(item);
  useEffect(() => { if (preview.status === "generating") void previews.ensure(item.catalog); }, [previews, item.catalog, preview.status, version]);
  return preview;
}
