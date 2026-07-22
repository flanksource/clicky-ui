import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("renders compact mobile actions separately from desktop actions", () => {
    render(
      <AppShell
        brand={<span>Brand</span>}
        navSections={[{ items: [{ key: "p", label: "Policies", to: "/policies" }] }]}
        actions={<button>Desktop Actions</button>}
        mobileActions={<button>Mobile More</button>}
      >
        <p>content</p>
      </AppShell>,
    );

    expect(screen.getByRole("button", { name: "Desktop Actions" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mobile More" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Navigation" })).toBeTruthy();
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
    const { container } = render(
      <AppShell bodyHeader={<div>HeaderBar</div>} bodyActions={<button>Run</button>}>
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("HeaderBar")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Run" })).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
    expect(container.querySelector('[data-slot="app-shell-column"]')).toHaveClass(
      "@container/app-content",
    );
    expect(container.querySelector('[data-slot="app-shell-body-header-content"]')).toHaveClass(
      "max-w-7xl",
      "@8xl/app-content:max-w-8xl",
      "@9xl/app-content:max-w-9xl",
    );
    expect(container.querySelector('[data-slot="app-shell-content"]')).toHaveClass(
      "max-w-7xl",
      "@8xl/app-content:max-w-8xl",
      "@9xl/app-content:max-w-9xl",
    );
  });

  it("supports explicit full-width content", () => {
    const { container } = render(
      <AppShell contentWidth="full" bodyHeader={<div>HeaderBar</div>}>
        <p>content</p>
      </AppShell>,
    );

    const header = container.querySelector('[data-slot="app-shell-body-header-content"]');
    const content = container.querySelector('[data-slot="app-shell-content"]');
    expect(header).toHaveAttribute("data-content-width", "full");
    expect(header).not.toHaveClass("max-w-7xl");
    expect(content).toHaveAttribute("data-content-width", "full");
    expect(content).not.toHaveClass("max-w-7xl");
  });

  it("renders a body-sidebar split alongside the scrolling body-main", () => {
    const { container } = render(
      <AppShell bodySidebar={<nav>tree</nav>} bodyHeader={<div>HeaderBar</div>}>
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getAllByText("tree")).toHaveLength(2);
    expect(screen.getAllByText("content")).toHaveLength(2);
    expect(screen.getByRole("separator", { name: "" })).toBeTruthy();
    expect(container.querySelector('[data-slot="app-shell-body-header-content"]')).toHaveAttribute(
      "data-content-width",
      "full",
    );
    expect(container.querySelector('[data-slot="app-shell-content"]')).toBeNull();
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

  it("opens and closes nav sections in the mobile drawer", () => {
    render(
      <AppShell
        brand={<span>Brand</span>}
        navSections={[
          { label: "Operations", items: [{ key: "p", label: "Policies", to: "/policies" }] },
        ]}
      >
        <p>content</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Navigation" }));
    const drawer = screen.getByRole("dialog", { name: "Navigation" });
    expect(within(drawer).getByRole("link", { name: "Policies" })).toBeTruthy();

    fireEvent.click(within(drawer).getByRole("link", { name: "Policies" }));
    expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull();
  });

  describe("debugSlots", () => {
    function renderShell(debugSlots: boolean) {
      return render(
        <AppShell
          debugSlots={debugSlots}
          brand={<span>brand</span>}
          search={<input aria-label="search" />}
          actions={<button type="button">act</button>}
          toolbar={<span>toolbar</span>}
          bodyHeader={<span>title</span>}
          bodyActions={<button type="button">edit</button>}
        >
          <p>content</p>
        </AppShell>,
      );
    }

    it("tags each slot with a data-slot name regardless of the flag", () => {
      const { container } = renderShell(false);

      // The attributes are always present so consumers can target regions in
      // tests and styles; only the outline stylesheet is conditional.
      const slots = Array.from(container.querySelectorAll("[data-slot^='app-shell-']")).map(
        (el) => el.getAttribute("data-slot"),
      );
      expect(slots).toEqual(
        expect.arrayContaining([
          "app-shell-header",
          "app-shell-search",
          "app-shell-actions",
          "app-shell-toolbar",
          "app-shell-body-header",
          "app-shell-body-actions",
          "app-shell-main",
        ]),
      );
    });

    it("ships no outline styles or debug marker when disabled", () => {
      const { container } = renderShell(false);

      expect(container.querySelector("[data-debug-slots]")).toBeNull();
      expect(container.querySelector("style")).toBeNull();
    });

    it("marks the root and injects a coloured rule per slot when enabled", () => {
      const { container } = renderShell(true);

      expect(container.querySelector("[data-debug-slots]")).not.toBeNull();
      const css = container.querySelector("style")?.textContent ?? "";
      expect(css).toContain('[data-slot="app-shell-main"]');
      expect(css).toContain("--app-shell-debug-color");
      // outline, not border: the overlay must not shift the layout it measures.
      expect(css).toContain("outline:");
      expect(css).not.toContain("border:");
    });
  });
});
