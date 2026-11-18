import { useCallback, useEffect, useRef, useState } from "react";

export type UseHistoryRouteOptions<R> = {
  parse: (pathname: string, search: string) => R;
  build: (route: R) => string;
  /** Return false to retain the current route and draft, including browser back/forward. */
  beforeNavigate?: (next: R, current: R) => boolean | Promise<boolean>;
};

export type HistoryNavigateOptions = {
  /** Overwrite the current history entry instead of pushing a new one. */
  replace?: boolean;
};

export function useHistoryRoute<R>(
  options: UseHistoryRouteOptions<R>,
): [R, (next: Partial<R> | ((prev: R) => R), options?: HistoryNavigateOptions) => void] {
  const { parse, build, beforeNavigate } = options;

  const [route, setRoute] = useState<R>(() =>
    typeof window === "undefined"
      ? parse("/", "")
      : parse(window.location.pathname, window.location.search),
  );
  const currentRoute = useRef(route); currentRoute.current = route;
  const navigationVersion = useRef(0);
  const historyIndex = useRef<number | null>(typeof window === "undefined" ? null : window.history.state?.__clickyHistoryIndex ?? null);
  const popGuard = useRef<{ delta: number; restored: boolean; decision: boolean | null } | null>(null);
  const approvedPop = useRef(false);

  useEffect(() => {
    const onPop = () => {
      const next = parse(window.location.pathname, window.location.search);
      const nextIndex: number | null = window.history.state?.__clickyHistoryIndex ?? null;
      if (popGuard.current) {
        const pending = popGuard.current;
        if (nextIndex !== historyIndex.current) {
          if (nextIndex === null || historyIndex.current === null) throw new Error("A pending history transition lost its entry index");
          window.history.go(historyIndex.current - nextIndex); return;
        }
        pending.restored = true;
        if (pending.decision !== null) { popGuard.current = null; if (pending.decision) { approvedPop.current = true; window.history.go(pending.delta); } }
        return;
      }
      if (approvedPop.current) { approvedPop.current = false; historyIndex.current = nextIndex; currentRoute.current = next; setRoute(next); return; }
      navigationVersion.current++;
      const allowed = beforeNavigate?.(next, currentRoute.current) ?? true;
      if (nextIndex !== null && historyIndex.current !== null && nextIndex !== historyIndex.current && allowed !== true) {
        const pending = { delta: nextIndex - historyIndex.current, restored: false, decision: null as boolean | null };
        popGuard.current = pending;
        window.history.go(-pending.delta);
        void Promise.resolve(allowed).then(value => {
          pending.decision = value;
          if (!pending.restored) return;
          popGuard.current = null;
          if (value) { approvedPop.current = true; window.history.go(pending.delta); }
        });
        return;
      }
      if (typeof allowed !== "boolean") {
        const version = ++navigationVersion.current;
        const state = window.history.state;
        window.history.replaceState(state, "", build(currentRoute.current));
        void allowed.then(value => {
          if (!value || version !== navigationVersion.current) return;
          window.history.replaceState(state, "", build(next));
          currentRoute.current = next; setRoute(next);
        });
        return;
      }
      if (!allowed) { window.history.pushState(window.history.state, "", build(currentRoute.current)); return; }
      currentRoute.current = next;
      historyIndex.current = nextIndex;
      setRoute(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [parse, build, beforeNavigate]);

  const navigate = useCallback(
    (next: Partial<R> | ((prev: R) => R), navigateOptions?: HistoryNavigateOptions) => {
      const previous = currentRoute.current;
      const merged = typeof next === "function" ? (next as (p: R) => R)(previous) : ({ ...previous, ...next } as R);
      const version = ++navigationVersion.current;
      const commit = () => {
        if (version !== navigationVersion.current) return;
        const path = build(merged);
        if (typeof window !== "undefined") {
          const current = window.location.pathname + window.location.search;
          if (current !== path) {
            if (beforeNavigate && historyIndex.current === null) {
              historyIndex.current = 0;
              window.history.replaceState({ ...window.history.state, __clickyHistoryIndex: 0 }, "", current);
            }
            const index = historyIndex.current;
            if (navigateOptions?.replace) window.history.replaceState(window.history.state, "", path);
            else {
              window.history.pushState(index === null ? window.history.state : { ...window.history.state, __clickyHistoryIndex: index + 1 }, "", path);
              if (index !== null) historyIndex.current = index + 1;
            }
          }
        }
        currentRoute.current = merged;
        setRoute(merged);
      };
      const allowed = beforeNavigate?.(merged, previous) ?? true;
      if (typeof allowed === "boolean") { if (allowed) commit(); }
      else void allowed.then(value => { if (value) commit(); });
    },
    [build, beforeNavigate],
  );

  return [route, navigate];
}
