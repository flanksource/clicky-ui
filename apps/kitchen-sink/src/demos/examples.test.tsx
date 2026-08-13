/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { findDemoEntry } from "../demo-catalog";
import { AccordionListDemo } from "./AccordionListDemo";
import { HierarchicalLookupDemo } from "./HierarchicalLookupDemo";
import { ProfilesDemo } from "./ProfilesDemo";
import { QueryBrowserDemo } from "./QueryBrowserDemo";
import { TourDemo } from "./TourDemo";

afterEach(cleanup);

describe("kitchen sink examples", () => {
  it("registers the new examples in the demo catalog", () => {
    expect(findDemoEntry("tour")?.component).toBe(TourDemo);
    expect(findDemoEntry("hierarchical-lookup")?.component).toBe(
      HierarchicalLookupDemo,
    );
    expect(findDemoEntry("profiles")?.component).toBe(ProfilesDemo);
    expect(findDemoEntry("query-browser")?.component).toBe(QueryBrowserDemo);
    expect(findDemoEntry("accordion-list")?.component).toBe(AccordionListDemo);
  });

  it("reorders the accordion list demo through the named row action", () => {
    render(<AccordionListDemo />);

    fireEvent.click(screen.getByRole("button", { name: "Move /api/v1/events up" }));

    const headers = screen
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-expanded"));
    expect(headers[0]?.textContent).toContain("/api/v1/events");
  });

  it("starts the provider-managed guided tour from the demo", async () => {
    render(<TourDemo />);

    fireEvent.click(screen.getByRole("button", { name: "Take the tour" }));

    expect(
      await screen.findByRole("dialog", { name: "Choose an environment" }),
    ).toBeTruthy();
  });

  it("renders the query browser starter SQL as multiple lines", () => {
    const { container } = render(<QueryBrowserDemo />);
    const editor = container.querySelector(".cm-content");

    expect(editor?.textContent).toContain("FROM service_health");
    expect(editor?.textContent).not.toContain("\\n");
  });

  it("opens hierarchical lookup options as a tree", async () => {
    render(<HierarchicalLookupDemo />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Select/ }),
    );

    const tree = await screen.findByRole("tree");
    expect(tree).toBeTruthy();
    expect(screen.getAllByText("jms")).toHaveLength(2);
  });
});
