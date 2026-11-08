import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppShellNavSection } from "./AppShell";
import { NavigationTree } from "./NavigationTree";

const STORAGE_KEY = "navigation-tree-test:groups";

function lazySection(load: () => Promise<{ items: { key: string; label: string; to: string }[] }>): AppShellNavSection {
  return {
    label: "Explorer",
    variant: "tree",
    groups: [{ key: "lazy", label: "Lazy folder", defaultCollapsed: true, items: [], loadChildren: load }],
    items: [{ key: "home", label: "Home", to: "/home" }],
  };
}

describe("NavigationTree", () => {
  beforeEach(() => window.localStorage.clear());

  it("loads a lazy group outside AppShell and keeps its expansion under the given storage key", async () => {
    const load = vi.fn(() => Promise.resolve({ items: [{ key: "child", label: "Lazy child", to: "/child" }] }));
    render(<NavigationTree section={lazySection(load)} storageKey={STORAGE_KEY} />);
    expect(screen.getByRole("tree", { name: "Explorer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    expect(load).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("link", { name: "Lazy child" })).toHaveAttribute("href", "/child");
    expect(load).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual({ lazy: false });
  });

  it("applies className to the navigation landmark", () => {
    render(<NavigationTree section={lazySection(() => Promise.resolve({ items: [] }))} className="explorer-nav" />);
    expect(screen.getByRole("navigation")).toHaveClass("explorer-nav");
  });

  it("flattens groups to icon links when collapsed", () => {
    render(<NavigationTree collapsed section={{ label: "Explorer", groups: [{ key: "g", label: "G", items: [{ key: "i", label: "Item", to: "/i" }] }] }} />);
    expect(screen.getByRole("link")).toHaveAttribute("title", "Item");
  });
});
