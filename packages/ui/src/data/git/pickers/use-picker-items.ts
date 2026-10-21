import { useCallback, useEffect, useRef, useState } from "react";
import type { GitPickerLoader } from "./types";

interface LoadState<T> { key: string; items: T[]; cursor: string; loading: boolean; error: Error | null }

export function usePickerItems<T>({ items, load, scope = "", disabled = false }: {
  items?: readonly T[];
  load?: GitPickerLoader<T>;
  scope?: string;
  disabled?: boolean;
}) {
  if (items && load) throw new Error("A Git picker takes either items or a loader, not both");
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([scope, version, disabled]);
  const [state, setState] = useState<LoadState<T>>({ key: "", items: [], cursor: "", loading: false, error: null });
  const pending = useRef<AbortController | null>(null);
  const request = useCallback(async (append: boolean, cursor?: string) => {
    if (!load || disabled) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setState((previous) => ({ key, items: append && previous.key === key ? previous.items : [], cursor: "", loading: true, error: null }));
    try {
      const page = await load({ signal: controller.signal, ...(cursor ? { cursor } : {}) });
      if (!controller.signal.aborted) setState((previous) => ({ key, items: append ? [...previous.items, ...page.items] : page.items, cursor: page.nextCursor ?? "", loading: false, error: null }));
    } catch (error) {
      if (!controller.signal.aborted) setState((previous) => ({ ...previous, key, cursor: cursor ?? "", loading: false, error: error instanceof Error ? error : new Error(String(error)) }));
    }
  }, [disabled, key, load]);
  useEffect(() => {
    void request(false);
    return () => pending.current?.abort();
  }, [request]);
  const current = state.key === key ? state : { items: [], cursor: "", loading: Boolean(load && !disabled), error: null };
  return {
    items: items ?? current.items,
    loading: current.loading,
    error: current.error,
    hasMore: Boolean(current.cursor),
    loadMore: () => { if (!current.loading && current.cursor) void request(true, current.cursor); },
    retry: () => setVersion((previous) => previous + 1),
  };
}
