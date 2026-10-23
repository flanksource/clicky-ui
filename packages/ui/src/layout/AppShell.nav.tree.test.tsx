import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell tree navigation", () => {
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
