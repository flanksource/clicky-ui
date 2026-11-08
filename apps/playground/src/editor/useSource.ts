import { useCallback, useEffect, useState } from "react";

import { readPage, readPagesFile, writePage, writePagesFile } from "./page-api";
import { useDocumentSource, type RepositorySource } from "../documents/useDocumentSource";

const FILE_TARGET = "file:";

/** Source target for a page module or helper file under `src/pages/` (relative path), as `useSource` accepts it. */
export const fileSourceTarget = (file: string) => `${FILE_TARGET}${file}`;

/** The pages-relative file behind a `file:` target, or undefined for a page slug. */
export const sourceTargetFile = (target: string | undefined) =>
  target?.startsWith(FILE_TARGET) ? target.slice(FILE_TARGET.length) : undefined;

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

export type PageSource = {
  /** Text currently in the editor buffer. */
  draft: string;
  setDraft: (next: string) => void;
  /** The page file relative to the workspace root, once loaded. */
  path: string | null;
  /** Last text known to be on disk. */
  saved: string;
  dirty: boolean;
  /**
   * True only once the current slug's source is in the buffer. Monaco keys its
   * model by path and seeds it from the first `value` it sees, so it must not
   * mount before this flips — otherwise it binds to an empty buffer.
   */
  ready: boolean;
  loading: boolean;
  saving: boolean;
  error: Error | string | null;
  /** Resolves true once the draft is on disk, false when the write failed (see `error`). */
  save: () => Promise<boolean>;
  revert: () => void;
};

/**
 * Loads one artifact's source — a page slug, a `document:` repository document,
 * or a `file:` page helper — and saves it back through the dev-server. Saving
 * rewrites the file; the preview picks it up on the next reload. A helper save
 * is refused with a 409 when the file changed since it was loaded.
 */
export function useSource(slug: string | undefined, enabled: boolean): RepositorySource {
  const document = slug?.startsWith("document:") === true;
  const file = sourceTargetFile(slug);
  const repositorySource = useDocumentSource(document && enabled ? slug : undefined);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState("");
  const [path, setPath] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const savedExternally = (event: Event) => {
      const changed = (event as CustomEvent<{ file: string }>).detail.file;
      if (draft === saved && (file === changed || (file === undefined && changed.replace(/\.(tsx|mdx?)$/, "") === slug))) setRevision(value => value + 1);
    };
    window.addEventListener("playground-source-saved", savedExternally);
    return () => window.removeEventListener("playground-source-saved", savedExternally);
  }, [draft, saved, file, slug]);

  useEffect(() => {
    if (!slug || !enabled || document) return;

    let cancelled = false;
    setLoading(true);
    const load: Promise<{ source: string; path: string; hash: string | null }> =
      file === undefined ? readPage(slug).then((page) => ({ ...page, hash: null })) : readPagesFile(file);
    void load
      .then(({ source, path, hash }) => {
        if (cancelled) return;
        setSaved(source);
        setPath(path);
        setHash(hash);
        setDraft(source);
        setLoadedSlug(slug);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(describeError(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, slug, document, file, revision]);

  const save = useCallback(async () => {
    if (!slug) return false;
    setSaving(true);
    try {
      if (file === undefined) {
        await writePage(slug, draft);
      } else {
        if (hash === null) throw new Error(`${file} has not finished loading, so it cannot be saved yet`);
        setHash((await writePagesFile(file, draft, hash)).hash);
      }
      setSaved(draft);
      setError(null);
      return true;
    } catch (cause) {
      setError(describeError(cause));
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, slug, file, hash]);

  const revert = useCallback(() => setDraft(saved), [saved]);

  return document ? repositorySource : {
    draft,
    setDraft,
    path: loadedSlug === slug ? path : null,
    saved,
    dirty: draft !== saved,
    ready: Boolean(slug) && loadedSlug === slug,
    loading,
    saving,
    error,
    save,
    revert,
  };
}
