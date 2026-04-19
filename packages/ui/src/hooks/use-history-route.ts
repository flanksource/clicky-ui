import { useCallback, useEffect, useState } from "react";

export type UseHistoryRouteOptions<R> = {
  parse: (pathname: string, search: string) => R;
  build: (route: R) => string;
};

export function useHistoryRoute<R>(
  options: UseHistoryRouteOptions<R>,
): [R, (next: Partial<R> | ((prev: R) => R)) => void] {
  const { parse, build } = options;

  const [route, setRoute] = useState<R>(() =>
    typeof window === "undefined"
      ? parse("/", "")
      : parse(window.location.pathname, window.location.search),
  );

  useEffect(() => {
    const onPop = () => setRoute(parse(window.location.pathname, window.location.search));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [parse]);

  const navigate = useCallback(
    (next: Partial<R> | ((prev: R) => R)) => {
      setRoute((prev) => {
        const merged =
          typeof next === "function" ? (next as (p: R) => R)(prev) : ({ ...prev, ...next } as R);
        const path = build(merged);
        if (typeof window !== "undefined") {
          const current = window.location.pathname + window.location.search;
          if (current !== path) window.history.pushState(null, "", path);
        }
        return merged;
      });
    },
    [build],
  );

  return [route, navigate];
}
