import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./Section";

describe("Section", () => {
  it("collapses and expands on the header toggle", () => {
    render(
      <Section title="Config" defaultOpen>
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText("body")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { expanded: true }));
    expect(screen.queryByText("body")).toBeNull();
  });

  it("keeps the summary outside the toggle button so its interactive content is valid DOM", () => {
    render(
      <Section
        title="Activities"
        defaultOpen
        summary={
          <button type="button" data-testid="filter">
            Failed
          </button>
        }
      >
        <p>body</p>
      </Section>,
    );
    const filter = screen.getByTestId("filter");
    // The summary's button must NOT be nested inside the section's toggle button
    // (a <button> inside a <button> is invalid DOM).
    expect(filter.closest("button[aria-expanded]")).toBeNull();
  });

  it("does not toggle when the summary is clicked — only the chevron/title region toggles", () => {
    render(
      <Section
        title="Activities"
        defaultOpen
        summary={
          <button type="button" data-testid="filter">
            Failed
          </button>
        }
      >
        <p>body</p>
      </Section>,
    );
    fireEvent.click(screen.getByTestId("filter"));
    // The body stays visible — the summary click did not collapse the section.
    expect(screen.getByText("body")).toBeTruthy();
    expect(screen.getByRole("button", { expanded: true })).toBeTruthy();
  });

  it("toggles when the title region (chevron) is clicked", () => {
    render(
      <Section title="Activities" defaultOpen summary={<span>2 items</span>}>
        <p>body</p>
      </Section>,
    );
    fireEvent.click(screen.getByRole("button", { expanded: true }));
    expect(screen.queryByText("body")).toBeNull();
  });

  it("renders no toggle and an always-open body when collapsible is false", () => {
    render(
      <Section title="Cycles" collapsible={false} defaultOpen={false}>
        <p>body</p>
      </Section>,
    );
    // No toggle button at all, and the body is rendered despite defaultOpen=false.
    expect(screen.queryByRole("button", { expanded: true })).toBeNull();
    expect(screen.queryByRole("button", { expanded: false })).toBeNull();
    expect(screen.getByText("body")).toBeTruthy();
  });
});
