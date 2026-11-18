import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell tree navigation", () => {
  beforeEach(() => window.localStorage.clear());
  it("shows forced-open groups even after the user previously collapsed them", () => {
    const section = { label: "Pages", variant: "tree" as const, groups: [{
      key: "docs", label: "Docs", items: [{ key: "intro", label: "Introduction", to: "/intro" }],
    }] };
    const { rerender } = render(<AppShell navSections={[section]}>Content</AppShell>);
    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.queryByRole("link", { name: "Introduction" })).toBeNull();
    rerender(<AppShell navSections={[{ ...section, groups: section.groups.map((group) => ({ ...group, forceExpanded: true })) }]}>Content</AppShell>);
    expect(screen.getByRole("link", { name: "Introduction" })).toBeInTheDocument();
  });
  it("reveals an active destination in collapsed folders while allowing the user to collapse it again", () => {
    render(<AppShell navSections={[{ label: "Pages", variant: "tree", groups: [{
      key: "docs", label: "Docs", defaultCollapsed: true,
      items: [{ key: "current", label: "Current page", to: "/current", active: true }],
    }] }]}><p>Page content</p></AppShell>);
    expect(screen.getByRole("link", { name: "Current page" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.queryByRole("link", { name: "Current page" })).toBeNull();
  });
  it("expands newly mounted nested groups and collapses them with the tree controls", () => {
    render(<AppShell navSections={[{ label: "Pages", variant: "tree", groups: [{
      key: "root", label: "Root", defaultCollapsed: true, items: [], groups: [{
        key: "nested", label: "Nested", defaultCollapsed: true,
        items: [{ key: "leaf", label: "Deep page", to: "/deep" }],
      }],
    }] }]}><p>Page content</p></AppShell>);
    expect(screen.queryByRole("link", { name: "Deep page" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand all" }));
    expect(screen.getByRole("link", { name: "Deep page" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.queryByRole("link", { name: "Deep page" })).toBeNull();
  });
  it("moves the active highlight and hrefs when the host re-renders a loaded lazy group", async () => {
    const loaded = [{ key: "one", label: "One", to: "/one", active: true }, { key: "two", label: "Two", to: "/two" }];
    const section = (active: string, prefix: string) => ({ label: "Pages", variant: "tree" as const, groups: [{
      key: "lazy", label: "Lazy", forceExpanded: true,
      items: [{ key: "one", label: "One", to: `${prefix}/one`, active: active === "one" }, { key: "two", label: "Two", to: `${prefix}/two`, active: active === "two" }],
      loadChildren: () => Promise.resolve({ items: loaded }),
    }] });
    const { rerender } = render(<AppShell navSections={[section("one", "")]}>Content</AppShell>);
    const tree = screen.getByRole("tree", { name: "Pages" });
    await waitFor(() => expect(within(tree).getByRole("treeitem", { name: "One" })).toHaveAttribute("aria-selected", "true"));
    rerender(<AppShell navSections={[section("two", "/v2")]}>Content</AppShell>);
    expect(within(tree).getByRole("treeitem", { name: "One" })).toHaveAttribute("aria-selected", "false");
    expect(within(tree).getByRole("treeitem", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    expect(within(tree).getByRole("link", { name: "Two" })).toHaveAttribute("href", "/v2/two");
  });
  it("renders groups and items in the explicit order when one is given", () => {
    const labels = () => within(screen.getByRole("tree", { name: "Pages" })).getAllByRole("treeitem").map((el) => el.getAttribute("aria-label"));
    const section = {
      label: "Pages", variant: "tree" as const,
      groups: [{ key: "g1", label: "Group 1", items: [] }, { key: "g2", label: "Group 2", items: [] }],
      items: [{ key: "i1", label: "Item 1", to: "/i1" }, { key: "i2", label: "Item 2", to: "/i2" }],
    };
    const { rerender } = render(<AppShell navSections={[section]}>Content</AppShell>);
    expect(labels()).toEqual(["Group 1", "Group 2", "Item 1", "Item 2"]);
    rerender(<AppShell navSections={[{ ...section, order: ["i1", "g2", "i2", "g1"] }]}>Content</AppShell>);
    expect(labels()).toEqual(["Item 1", "Group 2", "Item 2", "Group 1"]);
  });
  it("orders a group's own children by its order and appends keys the order omits", () => {
    render(<AppShell navSections={[{ label: "Pages", variant: "tree", groups: [{
      key: "g", label: "G", forceExpanded: true, order: ["leaf", "sub"],
      groups: [{ key: "sub", label: "Sub", items: [] }, { key: "extra", label: "Extra", items: [] }],
      items: [{ key: "leaf", label: "Leaf", to: "/leaf" }],
    }] }]}>Content</AppShell>);
    const labels = within(screen.getByRole("tree", { name: "Pages" })).getAllByRole("treeitem").map((el) => el.getAttribute("aria-label"));
    expect(labels).toEqual(["G", "Leaf", "Sub", "Extra"]);
  });
  it("throws when an order key matches no item or group", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AppShell navSections={[{ label: "Pages", variant: "tree", items: [{ key: "i1", label: "Item 1", to: "/i1" }], order: ["missing"] }]}>Content</AppShell>)).toThrow(/missing/);
    spy.mockRestore();
  });
  describe("lazy groups", () => {
    const lazyGroup = (key: string, load: () => Promise<{ items: { key: string; label: string; to: string }[] }>, extra: Record<string, unknown> = {}) => ({
      key, label: key, items: [], loadChildren: load, ...extra,
    });
    const leaves = (prefix: string) => () => Promise.resolve({ items: [{ key: `${prefix}-leaf`, label: `${prefix} leaf`, to: `/${prefix}` }] });

    it("re-fetches only the open group whose own version changed", async () => {
      const loadA = vi.fn(leaves("a"));
      const loadB = vi.fn(leaves("b"));
      const section = (versionA: number) => ({ label: "Pages", variant: "tree" as const, groups: [
        lazyGroup("a", loadA, { version: versionA }),
        lazyGroup("b", loadB, { version: 1 }),
      ] });
      const { rerender } = render(<AppShell navSections={[section(1)]}>Content</AppShell>);
      await waitFor(() => expect([loadA.mock.calls.length, loadB.mock.calls.length]).toEqual([1, 1]));
      rerender(<AppShell navSections={[section(2)]}>Content</AppShell>);
      await waitFor(() => expect(loadA).toHaveBeenCalledTimes(2));
      expect(loadB).toHaveBeenCalledTimes(1);
    });

    it("falls back to the section childrenVersion for groups without a version", async () => {
      const load = vi.fn(leaves("a"));
      const section = (childrenVersion: number) => ({ label: "Pages", variant: "tree" as const, childrenVersion, groups: [lazyGroup("a", load)] });
      const { rerender } = render(<AppShell navSections={[section(1)]}>Content</AppShell>);
      await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
      rerender(<AppShell navSections={[section(2)]}>Content</AppShell>);
      await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    });

    it("re-fetches on every reopen by default", async () => {
      const load = vi.fn(leaves("a"));
      render(<AppShell navSections={[{ label: "Pages", variant: "tree", groups: [lazyGroup("a", load, { defaultCollapsed: true })] }]}>Content</AppShell>);
      fireEvent.click(screen.getByRole("button", { name: "Expand" }));
      await screen.findByRole("link", { name: "a leaf" });
      fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
      fireEvent.click(screen.getByRole("button", { name: "Expand" }));
      await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    });

    it("keeps loaded children on reopen when the section sets reloadOnOpen false", async () => {
      const load = vi.fn(leaves("a"));
      render(<AppShell navSections={[{ label: "Pages", variant: "tree", reloadOnOpen: false, groups: [lazyGroup("a", load, { defaultCollapsed: true })] }]}>Content</AppShell>);
      fireEvent.click(screen.getByRole("button", { name: "Expand" }));
      await screen.findByRole("link", { name: "a leaf" });
      fireEvent.click(screen.getByRole("button", { name: "Collapse" }));
      expect(screen.queryByRole("link", { name: "a leaf" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Expand" }));
      expect(await screen.findByRole("link", { name: "a leaf" })).toBeInTheDocument();
      expect(load).toHaveBeenCalledTimes(1);
    });
  });

  describe("revealing the active destination", () => {
    const STORAGE_KEY = "reveal-test:groups";
    const docsSection = (activeKey: string) => ({ label: "Pages", variant: "tree" as const, groups: [
      { key: "docs", label: "Docs", defaultCollapsed: true, items: [], groups: [{
        key: "docs/guides", label: "Guides", defaultCollapsed: true,
        items: [{ key: "intro", label: "Intro", to: "/intro", active: activeKey === "intro" }],
      }] },
      { key: "ops", label: "Ops", defaultCollapsed: true, items: [{ key: "runbook", label: "Runbook", to: "/runbook", active: activeKey === "runbook" }] },
    ] });
    const stored = () => window.localStorage.getItem(STORAGE_KEY);

    it("opens the active item's ancestors without writing them into the stored collapse state", () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ops: true }));
      render(<AppShell groupCollapsedStorageKey={STORAGE_KEY} navSections={[docsSection("intro")]}>Content</AppShell>);
      expect(screen.getByRole("link", { name: "Intro" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Runbook" })).toBeNull();
      expect(JSON.parse(stored() ?? "null")).toEqual({ ops: true });
    });

    it("returns previously revealed groups to their stored state when the active item moves", () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      const { rerender } = render(<AppShell groupCollapsedStorageKey={STORAGE_KEY} navSections={[docsSection("intro")]}>Content</AppShell>);
      expect(screen.getByRole("link", { name: "Intro" })).toBeInTheDocument();
      rerender(<AppShell groupCollapsedStorageKey={STORAGE_KEY} navSections={[docsSection("runbook")]}>Content</AppShell>);
      expect(screen.getByRole("link", { name: "Runbook" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Intro" })).toBeNull();
      expect(JSON.parse(stored() ?? "null")).toEqual({});
    });

    it("lets the user collapse a revealed group without persisting the reveal", () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      render(<AppShell groupCollapsedStorageKey={STORAGE_KEY} navSections={[docsSection("runbook")]}>Content</AppShell>);
      fireEvent.click(within(screen.getByRole("treeitem", { name: "Ops" })).getAllByRole("button", { name: "Collapse" })[0]!);
      expect(screen.queryByRole("link", { name: "Runbook" })).toBeNull();
      expect(JSON.parse(stored() ?? "null")).toEqual({});
    });

    it("persists a manual expand of an unrelated group", () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      render(<AppShell groupCollapsedStorageKey={STORAGE_KEY} navSections={[docsSection("intro")]}>Content</AppShell>);
      fireEvent.click(within(screen.getByRole("treeitem", { name: "Ops" })).getByRole("button", { name: "Expand" }));
      expect(screen.getByRole("link", { name: "Runbook" })).toBeInTheDocument();
      expect(JSON.parse(stored() ?? "null")).toEqual({ ops: false });
    });
  });

  it("renders tree navigation with shared expansion and separate page links", () => {
    render(<AppShell navSections={[{ label: "Pages", variant: "tree", groups: [{
      key: "guides", label: "Guides", item: { key: "guides", label: "Guides", to: "/guides" },
      items: [{ key: "intro", label: "Introduction", to: "/guides/intro", active: true }],
    }] }]}><p>Page content</p></AppShell>);
    const tree = screen.getByRole("tree", { name: "Pages" });
    expect(within(tree).getByRole("treeitem", { name: "Introduction" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(within(tree).getByRole("button", { name: "Collapse" }));
    expect(within(tree).queryByRole("link", { name: "Introduction" })).toBeNull();
    expect(within(tree).getByRole("link", { name: "Guides" })).toHaveAttribute("href", "/guides");
  });
});
