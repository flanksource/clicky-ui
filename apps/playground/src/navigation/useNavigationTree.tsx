import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { AppShellNavDrag, AppShellNavSection } from "@flanksource/clicky-ui";
import { useDocumentProblems } from "../documents/problems";
import type { SidebarState } from "../sidebar-state";
import { fetchNavigation } from "./api";
import { pageOnlyDrag } from "./drag";
import { collectOpenKeys, fillInlineChildren, mapEntries, type MappingContext, type NavChildren } from "./mapping";
import { entryMenus, type NavigationMenuDeps } from "./menus";
import { HARD_REFRESH_EVENTS, SOFT_REFRESH_EVENTS } from "./refresh";
import type { NavigationEntry, NavigationQuery } from "./types";

/** Typing waits this long before asking the server; the box and the visible tree react immediately. */
const SEARCH_DEBOUNCE_MS = 200;

type Root = { children: NavigationEntry[]; olderCount: number | undefined; openKeys: ReadonlySet<string> };
type NodeStore = { generation: string; nodes: Map<string, NavigationEntry[]> };
type QueryParams = Pick<NavigationQuery, "sort" | "filters" | "age" | "q">;

export type NavigationTree = {
  section: AppShellNavSection;
  /** Pages and external pages `age=recent` hides, from the latest root response. */
  olderCount: number | undefined;
  /** The root fetch failed; the tree keeps what it last had. Folder failures show on the folder. */
  error: Error | null;
  /** Repository lint counts could not be loaded; the tree is still served without them. */
  problemsError: string | undefined;
  /** The first root response has not arrived. */
  loading: boolean;
};

function useDebounced<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

function useEventCounter(events: readonly string[]): number {
  const [count, increment] = useReducer((value: number) => value + 1, 0);
  useEffect(() => {
    for (const event of events) window.addEventListener(event, increment);
    return () => {
      for (const event of events) window.removeEventListener(event, increment);
    };
  }, [events]);
  return count;
}

const asError = (cause: unknown): Error => (cause instanceof Error ? cause : new Error(String(cause)));

/**
 * The unified sidebar tree: one `AppShellNavSection` over `GET /__playground/navigation`.
 *
 * The root is fetched with the sidebar state and the open page; an open folder loads its own
 * children lazily with the same parameters. Loaded children are cached by node key so they
 * survive collapse, search and reveal. `reloadOnOpen` is off: freshness comes from each folder's
 * `version`, which carries the query, hard refreshes and the folder's own activity, so reopening
 * a folder shows what is cached and only a change re-fetches it.
 */
export function useNavigationTree({
  activeSlug,
  sidebar,
  onQueryChange,
  pageHref,
  drag,
  menu,
}: {
  activeSlug: string | undefined;
  sidebar: SidebarState;
  onQueryChange: (query: string) => void;
  pageHref: (slug: string) => string;
  drag: AppShellNavDrag;
  menu: NavigationMenuDeps;
}): NavigationTree {
  const q = useDebounced(sidebar.query, SEARCH_DEBOUNCE_MS);
  const hard = useEventCounter(HARD_REFRESH_EVENTS);
  const soft = useEventCounter(SOFT_REFRESH_EVENTS);
  const { results: problems } = useDocumentProblems();
  const generation = JSON.stringify([sidebar.sort, sidebar.filters, sidebar.age, q, hard]);

  const store = useRef<NodeStore>({ generation, nodes: new Map() });
  if (store.current.generation !== generation) store.current = { generation, nodes: new Map() };
  const [cacheVersion, cacheChanged] = useReducer((value: number) => value + 1, 0);
  const [root, setRoot] = useState<Root | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [problemsError, setProblemsError] = useState<string | undefined>(undefined);

  const rootRequests = useRef(0);
  const nodeRequests = useRef(new Map<string, number>());
  const params: QueryParams = { sort: sidebar.sort, filters: sidebar.filters, age: sidebar.age, q };
  const latest = useRef({ activeSlug, params });
  latest.current = { activeSlug, params };
  const mapping = useRef<MappingContext | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const request = ++rootRequests.current;
    const requested = store.current;
    const { activeSlug: active, params: queried } = latest.current;
    fetchNavigation({ node: "", ...queried, ...(active ? { active } : {}) }, controller.signal).then(
      (response) => {
        if (request !== rootRequests.current || store.current !== requested) return;
        fillInlineChildren(requested.nodes, response.children);
        setRoot({ children: response.children, olderCount: response.olderCount, openKeys: collectOpenKeys(response.children) });
        setProblemsError(response.problemsError);
        setError(null);
      },
      (cause: unknown) => {
        if (controller.signal.aborted || request !== rootRequests.current) return;
        setError(asError(cause));
      },
    );
    return () => controller.abort();
  }, [generation, activeSlug, soft, problems]);

  const loadChildren = useCallback(
    (entry: NavigationEntry) => async (): Promise<NavChildren> => {
      const requested = store.current;
      const request = (nodeRequests.current.get(entry.key) ?? 0) + 1;
      nodeRequests.current.set(entry.key, request);
      const { activeSlug: active, params: queried } = latest.current;
      const response = await fetchNavigation({ node: entry.key, ...queried, ...(active ? { active } : {}) });
      if (nodeRequests.current.get(entry.key) === request && store.current === requested) {
        requested.nodes.set(entry.key, response.children);
        fillInlineChildren(requested.nodes, response.children);
        if (entry.source === "repository") setProblemsError(response.problemsError);
        cacheChanged();
      }
      // A response that a newer request or a newer query overtook must not replace what that one stored.
      const ctx = mapping.current;
      if (!ctx) throw new Error("Navigation children loaded before the tree rendered");
      return mapEntries(store.current.nodes.get(entry.key) ?? response.children, ctx);
    },
    [],
  );

  const section = useMemo<AppShellNavSection>(() => {
    const ctx: MappingContext = {
      activeSlug,
      query: sidebar.query,
      pageHref,
      generation,
      openKeys: root?.openKeys ?? new Set<string>(),
      problemsError,
      childrenOf: (key) => store.current.nodes.get(key),
      loadChildren,
      menus: (entry) => entryMenus(entry, menu),
    };
    mapping.current = ctx;
    return {
      variant: "tree",
      reloadOnOpen: false,
      loading: root === null && error === null,
      search: { value: sidebar.query, onChange: onQueryChange, label: "Filter artifacts" },
      drag: pageOnlyDrag(drag),
      ...mapEntries(root?.children ?? [], ctx),
    };
    // store.current is read at map time; cacheVersion is what announces a change to it.
  }, [root, error, problemsError, cacheVersion, activeSlug, sidebar.query, pageHref, generation, loadChildren, menu, onQueryChange, drag]);

  return { section, olderCount: root?.olderCount, error, problemsError, loading: root === null && error === null };
}
