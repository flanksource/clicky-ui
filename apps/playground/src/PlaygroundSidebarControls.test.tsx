import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const registry = vi.hoisted(() => {
  const initial = ["active", "recent-page", "old-open", "old-quiet"];
  const state = { slugs: [...initial], version: 0, listeners: new Set<() => void>() };
  return {
    state,
    reset: () => { state.slugs = [...initial]; state.version = 0; },
    add: (slug: string) => { state.slugs = [...state.slugs, slug]; state.version += 1; state.listeners.forEach((listener) => listener()); },
  };
});
const externalPages = vi.hoisted(() => [{ id: "external-old" }]);

vi.mock("./registry", () => ({
  pages: () => registry.state.slugs.map((slug) => ({ slug })),
  getMetaVersion: () => registry.state.version,
  subscribeMeta: (listener: () => void) => { registry.state.listeners.add(listener); return () => { registry.state.listeners.delete(listener); }; },
}));
vi.mock("./bookmarklet/external-catalog", () => ({ useExternalCatalog: () => ({ pages: externalPages }) }));

import { PlaygroundSidebarControls } from "./PlaygroundSidebarControls";
import type { PageActivity } from "./sidebar-activity";
import type { SidebarState } from "./sidebar-state";

const base: SidebarState = { sort: "none", filters: [], query: "", age: "recent" };
const activity = (overrides: Partial<PageActivity>): PageActivity => ({ updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0, ...overrides });
const activityMap = new Map<string, PageActivity>([
  ["recent-page", activity({ updated: Date.now() })],
  ["old-open", activity({ openCount: 1 })],
]);

function renderControls(overrides: Partial<Parameters<typeof PlaygroundSidebarControls>[0]> = {}) {
  const onChange = vi.fn();
  render(<PlaygroundSidebarControls state={base} onChange={onChange} activityMap={activityMap} commentsError={null} updatesError={null} activeSlug="active" {...overrides} />);
  return onChange;
}

afterEach(() => { cleanup(); registry.reset(); });

describe("PlaygroundSidebarControls", () => {
  it("labels the sort options by the activity they rank", () => {
    renderControls();
    const labels = Array.from(screen.getByLabelText("Sort pages").querySelectorAll("option"), (option) => option.textContent);
    expect(labels).toEqual(["Latest activity", "Source edited", "Last commented", "Last resolved"]);
  });

  it("counts older pages excluding the active page, recent pages and externally-listed older pages included", () => {
    renderControls();
    expect(screen.getByRole("button", { name: "Show older (3)" })).toBeTruthy();
  });

  it("recounts older pages when the registry gains a page", () => {
    renderControls();
    act(() => registry.add("added-old"));
    expect(screen.getByRole("button", { name: "Show older (4)" })).toBeTruthy();
  });

  it("applies status filters to the older count", () => {
    renderControls({ state: { ...base, filters: ["open"] } });
    expect(screen.getByRole("button", { name: "Show older (1)" })).toBeTruthy();
  });

  it("shows Reset view when only age is all and resets to defaults", () => {
    const onChange = renderControls({ state: { ...base, age: "all" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    expect(onChange).toHaveBeenCalledWith({ sort: "none", filters: [], query: "", age: "recent" });
  });

  it("hides Reset view for the default state", () => {
    renderControls();
    expect(screen.queryByRole("button", { name: "Reset view" })).toBeNull();
  });

  it("puts the help text in a title instead of visible copy", () => {
    renderControls();
    const fieldset = screen.getByRole("group", { name: "Filter pages" });
    expect(fieldset.getAttribute("title")).toContain("last 7 days");
    expect(screen.queryByText(/Source edits or feedback/)).toBeNull();
  });

  it("shows separate messages for comment and page-update failures", () => {
    renderControls({ commentsError: "Comment activity failed (503)", updatesError: "git unavailable" });
    const alerts = screen.getAllByRole("alert").map((alert) => alert.textContent);
    expect(alerts).toEqual(["Comment counts are unavailable: Comment activity failed (503)", "Page update dates are unavailable: git unavailable"]);
  });

  it("shows only the comment message when only comments failed", () => {
    renderControls({ commentsError: "boom" });
    expect(screen.getAllByRole("alert").map((alert) => alert.textContent)).toEqual(["Comment counts are unavailable: boom"]);
  });
});
