import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export type SortState = {
  key: string;
  dir: SortDir;
};

export type UseSortOptions<T> = {
  defaultKey?: string;
  defaultDir?: SortDir;
  resolvers?: Record<string, (item: T) => unknown>;
};

export type UseSortReturn<T> = {
  sorted: T[];
  sort: SortState | null;
  toggle: (key: string) => void;
};

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => {
    if (o && typeof o === "object") return (o as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

export function useSort<T>(items: T[], options: UseSortOptions<T> = {}): UseSortReturn<T> {
  const { defaultKey, defaultDir = "asc", resolvers } = options;

  const [sort, setSort] = useState<SortState | null>(
    defaultKey ? { key: defaultKey, dir: defaultDir } : null,
  );

  function toggle(key: string) {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.dir === "asc" ? { key, dir: "desc" } : null;
      }
      return { key, dir: "asc" };
    });
  }

  const sorted = useMemo(() => {
    if (!items) return [];
    if (!sort) return items;
    const { key, dir } = sort;
    const resolver = resolvers?.[key];
    const get = (item: T) => (resolver ? resolver(item) : resolvePath(item, key));
    return [...items].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    });
  }, [items, sort, resolvers]);

  return { sorted, sort, toggle };
}
