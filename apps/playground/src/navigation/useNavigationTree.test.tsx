import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppShellNavDrag, AppShellNavGroup, AppShellNavItem, AppShellNavSection } from "@flanksource/clicky-ui";
import type { SidebarState } from "../sidebar-state";
import type { NavigationMenuDeps } from "./menus";
import type { NavigationActivity, NavigationEntry, NavigationResponse } from "./types";

const problemsSnapshot = vi.hoisted(() => ({ results: {}, error: null }));
vi.mock("../documents/problems", () => ({ useDocumentProblems: () => problemsSnapshot }));

import { useNavigationTree } from "./useNavigationTree";

const REPO = "11111111-1111-1111-1111-111111111111";
const QUIET: NavigationActivity = { updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0 };
const base: SidebarState = { sort: "none", filters: [], query: "", age: "recent" };

function entry(partial: Partial<NavigationEntry> & Pick<NavigationEntry, "key" | "label">): NavigationEntry {
  return { kind: "page", source: "pages", hasChildren: false, activity: QUIET, ...partial };
}

const page = (slug: string, partial: Partial<NavigationEntry> = {}) =>
  entry({ key: `page-item:${slug}`, label: slug.split("/").at(-1)!, slug, ...partial });
const pageFolder = (path: string, partial: Partial<NavigationEntry> = {}) =>
  entry({ key: `page:${path}`, label: path, kind: "folder", hasChildren: true, folderPath: path, ...partial });
const repoFolder = (path: string, partial: Partial<NavigationEntry> = {}) =>
  entry({
    key: `repo:${REPO}:.:${path}`,
    label: path,
    kind: "folder",
    source: "repository",
    slug: `folder:${REPO}/${path}`,
    hasChildren: true,
    repository: { id: REPO, folder: ".", path },
    ...partial,
  });
const document = (path: string) =>
  entry({ key: `doc:document:${REPO}/${path}`, label: path, kind: "document", source: "repository", slug: `document:${REPO}/${path}` });

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

let requests: URLSearchParams[] = [];
function stubNavigation(handler: (params: URLSearchParams) => NavigationResponse | Promise<NavigationResponse> | Response) {
  requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const params = new URL(String(input), "http://playground.test").searchParams;
      requests.push(params);
      const result = await handler(params);
      return result instanceof Response ? result : json(result);
    }),
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

const pageMoveDrag: AppShellNavDrag = {
  canDrag: vi.fn((source) => source.kind === "item"),
  canDrop: vi.fn(() => true),
  onDrop: vi.fn(),
};
const menu: NavigationMenuDeps = {
  actionsDisabled: false,
  disabledReason: undefined,
  setPageAction: vi.fn(),
  pageFor: () => undefined,
  repository: { refresh: vi.fn(), lint: vi.fn(), openMarkdown: vi.fn(), editRules: vi.fn() },
};
const onQueryChange = vi.fn();
const pageHref = (slug: string) => `?page=${slug}`;

function mount(initial: { activeSlug?: string; sidebar?: SidebarState } = {}) {
  return renderHook(
    (props: { activeSlug?: string; sidebar: SidebarState }) =>
      useNavigationTree({ activeSlug: props.activeSlug, sidebar: props.sidebar, onQueryChange, pageHref, drag: pageMoveDrag, menu }),
    { initialProps: { sidebar: base, ...initial } },
  );
}

type Shape = { key: string; label: string; to?: string; active?: boolean; forceExpanded?: boolean; lazy?: boolean; badge?: boolean; items?: Shape[]; groups?: Shape[] };
const itemShape = (item: AppShellNavItem): Shape => ({ key: item.key, label: String(item.label), to: item.to, active: item.active ?? false, badge: Boolean(item.badge) });
const groupShape = (group: AppShellNavGroup): Shape => ({
  key: group.key,
  label: group.label,
  forceExpanded: group.forceExpanded ?? false,
  lazy: Boolean(group.loadChildren),
  badge: Boolean(group.badge),
  ...(group.item ? { to: group.item.to, active: group.item.active ?? false } : {}),
  items: (group.items ?? []).map(itemShape),
  groups: (group.groups ?? []).map(groupShape),
});
const shape = (section: AppShellNavSection) => ({ order: section.order, items: (section.items ?? []).map(itemShape), groups: (section.groups ?? []).map(groupShape) });

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useNavigationTree", () => {
  it("maps root entries to groups and items, opening the active path with its children inlined", async () => {
    const intro = page("docs/intro");
    stubNavigation(() => ({
      olderCount: 4,
      children: [
        pageFolder("docs", { slug: "docs", open: true, children: [intro], activity: { ...QUIET, openCount: 2 } }),
        repoFolder(".", { problems: 3 }),
        page("solo", { activity: { ...QUIET, openCount: 1 } }),
        entry({ key: "external", label: "External pages", kind: "folder", source: "external", hasChildren: true }),
      ],
    }));
    const { result } = mount({ activeSlug: "docs/intro" });

    await waitFor(() => expect(result.current.section.groups).toHaveLength(3));

    expect({ olderCount: result.current.olderCount, tree: shape(result.current.section) }).toEqual({
      olderCount: 4,
      tree: {
        order: ["page:docs", `repo:${REPO}:.:.`, "page-item:solo", "external"],
        items: [{ key: "page-item:solo", label: "solo", to: "?page=solo", active: false, badge: true }],
        groups: [
          {
            key: "page:docs",
            label: "docs",
            to: "?page=docs",
            active: false,
            forceExpanded: true,
            lazy: true,
            badge: true,
            items: [{ key: "page-item:docs/intro", label: "intro", to: "?page=docs/intro", active: true, badge: false }],
            groups: [],
          },
          { key: `repo:${REPO}:.:.`, label: ".", to: `?page=folder:${REPO}/.`, active: false, forceExpanded: false, lazy: true, badge: true, items: [], groups: [] },
          { key: "external", label: "External pages", forceExpanded: false, lazy: true, badge: false, items: [], groups: [] },
        ],
      },
    });
    expect(requests[0]?.toString()).toBe("node=&sort=none&filters=&age=recent&q=&active=docs%2Fintro");
  });

  it("fetches an opened folder with its node key and the current sidebar query, and keeps what it loaded", async () => {
    const sidebar: SidebarState = { sort: "updated", filters: ["open"], query: "", age: "all" };
    stubNavigation((params) =>
      params.get("node") === "page:docs" ? { children: [page("docs/a"), page("docs/b")] } : { children: [pageFolder("docs")] },
    );
    const { result } = mount({ sidebar, activeSlug: "solo" });
    await waitFor(() => expect(result.current.section.groups).toHaveLength(1));

    const loaded = await result.current.section.groups![0]!.loadChildren!();
    await waitFor(() => expect(result.current.section.groups![0]!.items.map((item) => item.key)).toEqual(["page-item:docs/a", "page-item:docs/b"]));

    expect({
      lastRequest: requests.at(-1)?.toString(),
      returned: loaded.items.map((item) => item.key),
      reloadOnOpen: result.current.section.reloadOnOpen,
    }).toEqual({
      lastRequest: "node=page%3Adocs&sort=updated&filters=open&age=all&q=&active=solo",
      returned: ["page-item:docs/a", "page-item:docs/b"],
      reloadOnOpen: false,
    });
  });

  it("keeps the tree when lint counts fail, reporting the failure and marking only repository rows", async () => {
    const failure = "workspace path is outside enabled roots";
    stubNavigation((params) =>
      params.get("node") === `repo:${REPO}:.:.`
        ? { children: [document("guide.md")], problemsError: failure }
        : { children: [repoFolder("."), page("solo")], problemsError: failure },
    );
    const { result } = mount();
    await waitFor(() => expect(result.current.section.groups).toHaveLength(1));
    const loaded = await result.current.section.groups![0]!.loadChildren!();

    expect({
      problemsError: result.current.problemsError,
      error: result.current.error,
      repositoryFolderMarked: Boolean(result.current.section.groups![0]!.badge),
      repositoryDocumentMarked: Boolean(loaded.items[0]?.badge),
      pageMarked: Boolean(result.current.section.items![0]!.badge),
    }).toEqual({ problemsError: failure, error: null, repositoryFolderMarked: true, repositoryDocumentMarked: true, pageMarked: false });
  });

  it("discards a root response that a newer request has overtaken", async () => {
    const first = deferred<NavigationResponse>();
    const second = deferred<NavigationResponse>();
    const pending = [first, second];
    stubNavigation(() => pending.shift()!.promise);
    const { result, rerender } = mount({ activeSlug: "a" });
    rerender({ activeSlug: "b", sidebar: base });
    await waitFor(() => expect(requests).toHaveLength(2));

    await act(async () => { second.resolve({ children: [page("fresh")] }); await second.promise; });
    await waitFor(() => expect(result.current.section.items?.map((item) => item.key)).toEqual(["page-item:fresh"]));
    await act(async () => { first.resolve({ children: [page("stale")] }); await first.promise; });

    expect(result.current.section.items?.map((item) => item.key)).toEqual(["page-item:fresh"]);
  });

  it("keeps the newer children when an older folder response lands last", async () => {
    const slow = deferred<NavigationResponse>();
    let folderCalls = 0;
    stubNavigation((params) => {
      if (params.get("node") === "") return { children: [pageFolder("docs")] };
      folderCalls += 1;
      return folderCalls === 1 ? slow.promise : { children: [page("docs/fresh")] };
    });
    const { result } = mount();
    await waitFor(() => expect(result.current.section.groups).toHaveLength(1));
    const group = result.current.section.groups![0]!;

    const stale = group.loadChildren!();
    await group.loadChildren!();
    await act(async () => { slow.resolve({ children: [page("docs/stale")] }); await stale; });

    expect(result.current.section.groups![0]!.items.map((item) => item.key)).toEqual(["page-item:docs/fresh"]);
  });

  it("surfaces a failed root fetch with the server's diagnostics instead of an empty tree", async () => {
    stubNavigation(() => json({ error: "gavel is not reachable" }, 502));
    const { result } = mount();

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect({ message: result.current.error?.message, loading: result.current.loading, groups: result.current.section.groups }).toEqual({
      message: "gavel is not reachable",
      loading: false,
      groups: [],
    });
  });

  it("reports a non-JSON answer from the server as an error with the response attached", async () => {
    stubNavigation(() => new Response("<html>Bad gateway</html>", { status: 502, headers: { "content-type": "text/html" } }));
    const { result } = mount();

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toMatchObject({
      message: "Navigation request failed (502): the playground server did not answer with JSON",
      diagnostics: { details: [{ label: "Response", value: "<html>Bad gateway</html>" }] },
    });
  });

  it("re-fetches the root on focus and feedback changes, and reloads an open folder only when its activity moved", async () => {
    let comments = 0;
    stubNavigation(() => ({ children: [pageFolder("docs", { activity: { ...QUIET, openCount: comments } })] }));
    const { result } = mount();
    await waitFor(() => expect(result.current.section.groups).toHaveLength(1));
    const initialVersion = result.current.section.groups![0]!.version;

    act(() => { window.dispatchEvent(new Event("focus")); });
    await waitFor(() => expect(requests).toHaveLength(2));
    const afterFocus = result.current.section.groups![0]!.version;
    comments = 1;
    act(() => { window.dispatchEvent(new Event("playground-feedback-updated")); });
    await waitFor(() => expect(requests).toHaveLength(3));
    await waitFor(() => expect(result.current.section.groups![0]!.version).not.toBe(afterFocus));

    expect({ unchangedByFocus: afterFocus === initialVersion }).toEqual({ unchangedByFocus: true });
  });

  it.each(["playground:navigation-refresh", "playground:documents-refresh"])("treats %s as a hard refresh that drops loaded folders", async (event) => {
    stubNavigation((params) => (params.get("node") === "page:docs" ? { children: [page("docs/a")] } : { children: [pageFolder("docs")] }));
    const { result } = mount();
    await waitFor(() => expect(result.current.section.groups).toHaveLength(1));
    await result.current.section.groups![0]!.loadChildren!();
    await waitFor(() => expect(result.current.section.groups![0]!.items).toHaveLength(1));
    const before = result.current.section.groups![0]!.version;

    act(() => { window.dispatchEvent(new Event(event)); });
    await waitFor(() => expect(requests.filter((params) => params.get("node") === "")).toHaveLength(2));

    expect({ reloadsOpenFolders: result.current.section.groups![0]!.version !== before, cachedItems: result.current.section.groups![0]!.items }).toEqual({
      reloadsOpenFolders: true,
      cachedItems: [],
    });
  });

  it("lets only page rows start or receive a drag, handing the page move its own slug and folder vocabulary", async () => {
    stubNavigation(() => ({ children: [] }));
    const { result } = mount();
    await waitFor(() => expect(result.current.loading).toBe(false));
    const drag = result.current.section.drag!;
    const doc = { key: `doc:document:${REPO}/a.md`, kind: "item" as const };
    const external = { key: "external:22222222-2222-2222-2222-222222222222", kind: "item" as const };
    const dragged = { key: "page-item:docs/a", kind: "item" as const };
    const pageDir = { key: "page:docs/sub", kind: "group" as const };
    const repoDir = { key: `repo:${REPO}:.:docs`, kind: "group" as const };

    expect({
      draggable: [dragged, doc, external, pageDir, repoDir].map((source) => drag.canDrag!(source)),
      droppable: [pageDir, repoDir, { key: "external", kind: "group" as const }, { key: "", kind: "section" as const }].map((target) => drag.canDrop!(dragged, target)),
      docOntoPageFolder: drag.canDrop!(doc, pageDir),
    }).toEqual({
      draggable: [true, false, false, false, false],
      droppable: [true, false, false, true],
      docOntoPageFolder: false,
    });
    drag.onDrop(dragged, pageDir);
    expect(pageMoveDrag.onDrop).toHaveBeenCalledWith({ key: "docs/a", kind: "item" }, { key: "docs/sub", kind: "group" });
    expect(() => drag.onDrop(doc, pageDir)).toThrow("Only pages can be moved");
    expect(() => drag.onDrop(dragged, repoDir)).toThrow("Only pages can be moved");
  });

  it("gives each entry kind its own context menu", async () => {
    stubNavigation(() => ({ children: [pageFolder("docs", { slug: "docs" }), repoFolder("."), page("solo"), entry({ key: "external", label: "External pages", kind: "folder", source: "external", hasChildren: true }), document("a.md")] }));
    const { result } = mount();
    await waitFor(() => expect(result.current.section.groups).toHaveLength(3));
    const [docs, repo, external] = result.current.section.groups!;
    const solo = result.current.section.items!.find((item) => item.key === "page-item:solo")!;
    const doc = result.current.section.items!.find((item) => item.key.startsWith("doc:"))!;

    expect({
      pageFolder: docs!.contextMenu?.map((item) => item.label),
      pageFolderLink: docs!.item?.contextMenu?.map((item) => item.label),
      repository: repo!.contextMenu?.map((item) => item.label),
      external: external!.contextMenu,
      page: solo.contextMenu?.map((item) => item.label),
      document: doc.contextMenu,
    }).toEqual({
      pageFolder: ["New page", "New folder", "Delete folder"],
      pageFolderLink: ["New page", "New folder", "Delete folder", "Rename", "Move", "Delete"],
      repository: ["Refresh", "Run prompt linter…", "Open Markdown by path…", "Sidebar folder and ignore rules…"],
      external: undefined,
      page: ["Rename", "Move", "Delete"],
      document: undefined,
    });
  });
});
