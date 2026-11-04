import { useCallback, useEffect, useRef, useState } from "react";

export type UseHistoryRouteOptions<R> = {
  parse: (pathname: string, search: string) => R;
  build: (route: R) => string;
  /** Return false to retain the current route and draft, including browser back/forward. */
  beforeNavigate?: (next: R, current: R) => boolean;
};

export function useHistoryRoute<R>(
  options: UseHistoryRouteOptions<R>,
): [R, (next: Partial<R> | ((prev: R) => R)) => void] {
  const { parse, build, beforeNavigate } = options;

  const [route, setRoute] = useState<R>(() =>
    typeof window === "undefined"
      ? parse("/", "")
      : parse(window.location.pathname, window.location.search),
  );
  const currentRoute = useRef(route); currentRoute.current = route;

  useEffect(() => {
    const onPop = () => {
      const next = parse(window.location.pathname, window.location.search);
      if (beforeNavigate && !beforeNavigate(next, currentRoute.current)) { window.history.pushState(null, "", build(currentRoute.current)); return; }
      currentRoute.current = next;
      setRoute(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [parse, build, beforeNavigate]);

  const navigate = useCallback(
    (next: Partial<R> | ((prev: R) => R)) => {
      const previous = currentRoute.current;
      const merged = typeof next === "function" ? (next as (p: R) => R)(previous) : ({ ...previous, ...next } as R);
      if (beforeNavigate && !beforeNavigate(merged, previous)) return;
      const path = build(merged);
      if (typeof window !== "undefined") {
        const current = window.location.pathname + window.location.search;
        if (current !== path) window.history.pushState(null, "", path);
      }
      currentRoute.current = merged;
      setRoute(merged);
    },
    [build, beforeNavigate],
  );

  return [route, navigate];
}
