import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlaygroundSidebarControls } from "./PlaygroundSidebarControls";
import type { SidebarState } from "./sidebar-state";

const base: SidebarState = { sort: "none", filters: [], query: "", age: "recent" };
const OLDER = 3;

function renderControls(overrides: Partial<Parameters<typeof PlaygroundSidebarControls>[0]> = {}) {
  const onChange = vi.fn();
  render(<PlaygroundSidebarControls state={base} onChange={onChange} olderCount={OLDER} commentsError={null} updatesError={null} {...overrides} />);
  return onChange;
}

afterEach(() => { cleanup(); });

describe("PlaygroundSidebarControls", () => {
  it("labels the sort options by the activity they rank", () => {
    renderControls();
    const labels = Array.from(screen.getByLabelText("Sort pages").querySelectorAll("option"), (option) => option.textContent);
    expect(labels).toEqual(["Latest activity", "Source edited", "Last commented", "Last resolved"]);
  });

  it("shows the older count the navigation root reported", () => {
    renderControls();
    expect(screen.getByRole("button", { name: `Show older (${OLDER})` })).toBeTruthy();
  });

  it("does not guess a count before the navigation root has loaded", () => {
    renderControls({ olderCount: undefined });
    expect(screen.getByRole("button", { name: "Show older" })).toBeTruthy();
  });

  it("toggles between the recent-only and all views", () => {
    const onChange = renderControls();
    fireEvent.click(screen.getByRole("button", { name: `Show older (${OLDER})` }));
    expect(onChange).toHaveBeenCalledWith({ age: "all" });
  });

  it("disables the age toggle while a search is active", () => {
    renderControls({ state: { ...base, query: "diagrams" } });
    expect((screen.getByRole("button", { name: `Show older (${OLDER})` }) as HTMLButtonElement).disabled).toBe(true);
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
