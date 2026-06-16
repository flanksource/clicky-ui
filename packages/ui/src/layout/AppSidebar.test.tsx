import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppSidebar, type AppNavSection } from "./AppSidebar";
import type { RenderLink } from "../rpc/EndpointList";
import { useMemoryRouter } from "../rpc/router";
import { RouterProvider } from "../rpc/RouterProvider";

const sections: AppNavSection[] = [
  { items: [{ key: "dashboard", title: "Dashboard", to: "/dashboard" }] },
  {
    label: "Operations",
    items: [
      { key: "policies", title: "Policies", to: "/policies" },
      { key: "docs", title: "Docs", to: "https://example.com/docs", external: true },
    ],
  },
];

describe("AppSidebar", () => {
  it("renders routed items as plain <a href={to}> anchors without a renderLink", () => {
    render(<AppSidebar sections={sections} pathname="/policies" />);

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard.getAttribute("href")).toBe("/dashboard");

    const policies = screen.getByRole("link", { name: "Policies" });
    expect(policies.getAttribute("href")).toBe("/policies");
    // Default routed anchors are same-tab navigations, not new-tab.
    expect(policies.getAttribute("target")).toBeNull();
  });

  it("marks the item matching pathname as active", () => {
    render(<AppSidebar sections={sections} pathname="/policies" />);
    // `font-medium` is applied only to the active item (the hover:bg-accent class
    // is present on every row, so it can't distinguish active state).
    expect(screen.getByRole("link", { name: "Policies" }).className).toContain("font-medium");
    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toContain("font-medium");
  });

  it("renders external items as new-tab anchors", () => {
    render(<AppSidebar sections={sections} pathname="/policies" />);
    const docs = screen.getByRole("link", { name: "Docs" });
    expect(docs.getAttribute("href")).toBe("https://example.com/docs");
    expect(docs.getAttribute("target")).toBe("_blank");
    expect(docs.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("lets a supplied renderLink override the default anchor", () => {
    const renderLink: RenderLink = ({ to, className, children, title }) => (
      <a href={to} className={className} title={title} data-router="true">
        {children}
      </a>
    );
    render(<AppSidebar sections={sections} pathname="/policies" renderLink={renderLink} />);
    // Routed item flows through the override...
    expect(screen.getByRole("link", { name: "Policies" }).getAttribute("data-router")).toBe("true");
    // ...while the external item keeps its built-in new-tab anchor.
    expect(screen.getByRole("link", { name: "Docs" }).getAttribute("data-router")).toBeNull();
  });

  it("sources pathname and renderLink from a RouterProvider when props are omitted", () => {
    function Harness() {
      const router = useMemoryRouter("/dashboard");
      return (
        <RouterProvider adapter={router}>
          <AppSidebar sections={sections} />
        </RouterProvider>
      );
    }
    render(<Harness />);
    // Active state tracks the adapter pathname (/dashboard).
    expect(screen.getByRole("link", { name: "Dashboard" }).className).toContain("font-medium");
    expect(screen.getByRole("link", { name: "Policies" }).className).not.toContain("font-medium");

    // The memory adapter's link updates the active item in place.
    fireEvent.click(screen.getByRole("link", { name: "Policies" }));
    expect(screen.getByRole("link", { name: "Policies" }).className).toContain("font-medium");
    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toContain("font-medium");
  });
});
