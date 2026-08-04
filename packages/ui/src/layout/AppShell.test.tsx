import { fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

function StatefulSlot({ name, onEffect }: { name: string; onEffect: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    onEffect();
  }, [onEffect]);

  return (
    <button type="button" data-testid={name} onClick={() => setCount((value) => value + 1)}>
      {name}:{count}
    </button>
  );
}

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

  it("folds group items behind a toggle and persists the group state", () => {
    const storageKey = "test:app-shell:groups";
    window.localStorage.removeItem(storageKey);
    const shell = (
      <AppShell
        groupCollapsedStorageKey={storageKey}
        navSections={[
          {
            label: "Providers",
            items: [{ key: "home", label: "Home", to: "/" }],
            groups: [
              {
                key: "xero",
                label: "Xero",
                defaultCollapsed: true,
                items: [{ key: "invoices", label: "Invoices", to: "/xero/invoices" }],
              },
            ],
          },
        ]}
      >
        <p>content</p>
      </AppShell>
    );
    const { unmount } = render(shell);

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Invoices" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Xero/ }));
    expect(screen.getByRole("link", { name: "Invoices" }).getAttribute("href")).toBe(
      "/xero/invoices",
    );

    // Expanded state survives a remount through localStorage.
    unmount();
    render(shell);
    expect(screen.getByRole("link", { name: "Invoices" })).toBeTruthy();
  });

  it("flattens group items into the rail when it is collapsed", () => {
    render(
      <AppShell
        groupCollapsedStorageKey="test:app-shell:groups-collapsed"
        navSections={[
          {
            groups: [
              {
                key: "xero",
                label: "Xero",
                defaultCollapsed: true,
                items: [{ key: "invoices", label: "Invoices", to: "/xero/invoices" }],
              },
            ],
          },
        ]}
      >
        <p>content</p>
      </AppShell>,
    );

    expect(screen.queryByRole("link", { name: "Invoices" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    // Collapsed rail: no group heading, and the item is reachable as an icon link.
    expect(screen.queryByRole("button", { name: /Xero/ })).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/xero/invoices");
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
    expect(screen.getAllByText("tree")).toHaveLength(1);
    expect(screen.getAllByText("content")).toHaveLength(1);
    expect(screen.getByRole("separator", { name: "" })).toHaveClass(
      "hidden",
      "md:block",
    );
    expect(container.querySelector('[data-slot="app-shell-body-header-content"]')).toHaveAttribute(
      "data-content-width",
      "full",
    );
    expect(container.querySelector('[data-slot="app-shell-content"]')).toBeNull();
  });

  it("mounts stateful responsive slots once and preserves them across viewport changes", () => {
    const actionsEffect = vi.fn();
    const bodySidebarEffect = vi.fn();
    const childrenEffect = vi.fn();

    render(
      <AppShell
        navSections={[{ items: [{ key: "p", label: "Policies", to: "/policies" }] }]}
        actions={<StatefulSlot name="actions" onEffect={actionsEffect} />}
        bodySidebar={<StatefulSlot name="body-sidebar" onEffect={bodySidebarEffect} />}
      >
        <StatefulSlot name="children" onEffect={childrenEffect} />
      </AppShell>,
    );

    expect(screen.getAllByTestId("actions")).toHaveLength(1);
    expect(screen.getAllByTestId("body-sidebar")).toHaveLength(1);
    expect(screen.getAllByTestId("children")).toHaveLength(1);
    expect(actionsEffect).toHaveBeenCalledTimes(1);
    expect(bodySidebarEffect).toHaveBeenCalledTimes(1);
    expect(childrenEffect).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("children"));
    fireEvent(window, new Event("resize"));

    expect(screen.getByTestId("children")).toHaveTextContent("children:1");
    expect(actionsEffect).toHaveBeenCalledTimes(1);
    expect(bodySidebarEffect).toHaveBeenCalledTimes(1);
    expect(childrenEffect).toHaveBeenCalledTimes(1);
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
