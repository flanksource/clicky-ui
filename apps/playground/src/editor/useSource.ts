import { useCallback, useEffect, useState } from "react";

export const SOURCES_ROUTE = "/__playground/sources";

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error(
      "Editing artifacts only works under `vite dev` — the playground-sources middleware is " +
        "not part of the production build.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `${init?.method ?? "GET"} ${url} failed (${response.status})`);
  }
  return payload;
}

export function createPage(slug: string, source: string): Promise<{ slug: string }> {
  return request<{ slug: string }>(SOURCES_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, source }),
  });
}

export type PageSource = {
  /** Text currently in the editor buffer. */
  draft: string;
  setDraft: (next: string) => void;
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
  error: string | null;
  save: () => Promise<void>;
  revert: () => void;
};

/**
 * Loads one artifact's source and saves it back through the dev-server. Saving
 * rewrites the file, which Vite picks up — the preview refreshes itself, so
 * there is no client-side "apply" step.
 */
export function useSource(slug: string | undefined, enabled: boolean): PageSource {
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState("");
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !enabled) return;

    let cancelled = false;
    setLoading(true);
    void request<{ source: string }>(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`)
      .then(({ source }) => {
        if (cancelled) return;
        setSaved(source);
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
  }, [enabled, slug]);

  const save = useCallback(async () => {
    if (!slug) return;
    setSaving(true);
    try {
      await request(`${SOURCES_ROUTE}?slug=${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, source: draft }),
      });
      setSaved(draft);
      setError(null);
    } catch (cause) {
      setError(describeError(cause));
    } finally {
      setSaving(false);
    }
  }, [draft, slug]);

  const revert = useCallback(() => setDraft(saved), [saved]);

  return {
    draft,
    setDraft,
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
