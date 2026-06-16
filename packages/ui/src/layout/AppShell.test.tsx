import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the brand, nav, search, actions and content slots", () => {
    render(
      <AppShell
        brand={<span>Brand</span>}
        nav={<span>Nav</span>}
        search={<input aria-label="search" />}
        actions={<button>Action</button>}
      >
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("Brand")).toBeTruthy();
    expect(screen.getByText("Nav")).toBeTruthy();
    expect(screen.getByLabelText("search")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Action" })).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders the toolbar row only when a toolbar is provided", () => {
    const { rerender } = render(
      <AppShell>
        <p>c</p>
      </AppShell>,
    );
    expect(screen.queryByTestId("toolbar")).toBeNull();
    rerender(
      <AppShell toolbar={<span data-testid="toolbar">tools</span>}>
        <p>c</p>
      </AppShell>,
    );
    expect(screen.getByTestId("toolbar")).toBeTruthy();
  });

  it("renders nav sections and hides item labels when the rail is collapsed", () => {
    render(
      <AppShell
        navSections={[{ label: "Operations", items: [{ key: "p", label: "Policies", to: "/policies" }] }]}
      >
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("Policies")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    // Collapsed: labels are dropped from the DOM, only icons remain.
    expect(screen.queryByText("Policies")).toBeNull();
  });

  it("renders nav items as anchor links pointing at their `to`", () => {
    render(
      <AppShell navSections={[{ items: [{ key: "p", label: "Policies", to: "/policies" }] }]}>
        <p>content</p>
      </AppShell>,
    );
    // No RouterProvider → the default browser adapter renders a real <a href>.
    const link = screen.getByRole("link", { name: "Policies" });
    expect(link.getAttribute("href")).toBe("/policies");
    expect(screen.queryByRole("button", { name: "Policies" })).toBeNull();
  });

  it("renders the fixed body header and body actions on the same row", () => {
    render(
      <AppShell bodyHeader={<div>HeaderBar</div>} bodyActions={<button>Run</button>}>
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("HeaderBar")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Run" })).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders a body-sidebar split alongside the scrolling body-main", () => {
    render(
      <AppShell bodySidebar={<nav>tree</nav>}>
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("tree")).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("passes the collapsed flag to a custom sidebar render-prop", () => {
    render(
      <AppShell sidebar={(collapsed) => <div>rail:{collapsed ? "min" : "full"}</div>}>
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("rail:full")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(screen.getByText("rail:min")).toBeTruthy();
  });
});
