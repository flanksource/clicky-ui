import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Clicky, type ClickyNode } from "./Clicky";

describe("collapsed Clicky sections", () => {
  it("keeps each first line visible and expands sections independently", async () => {
    const headings = ["batch 1 (lines 1-10) · 1 row(s) affected", "batch 2 (lines 12-14)"];
    const contents = ["First batch result", "Second batch result"];
    const items: ClickyNode[] = headings.map((heading, index) => ({
      kind: "collapsed", label: { kind: "text", text: heading },
      content: { kind: "text", text: contents[index]! },
    }));
    const { container } = render(<Clicky data={{ kind: "list", unstyled: true, items }} />);
    const sections = [...container.querySelectorAll("details")];

    expect(sections.map((section) => ({ open: section.open, summary: section.querySelector("summary")?.textContent }))).toEqual(
      headings.map((heading) => ({ open: false, summary: `${heading}Show more` })),
    );
    fireEvent.click(within(sections[0]!).getByText("Show more"));
    await waitFor(() => expect(within(sections[0]!).getByText("Show less")).toBeInTheDocument());
    expect(sections.map((section) => section.open)).toEqual([true, false]);
    expect(within(sections[0]!).getByText(contents[0]!)).toBeVisible();
    expect(screen.getByText(contents[1]!)).not.toBeVisible();
    fireEvent.click(within(sections[0]!).getByText("Show less"));
    expect(sections.map((section) => section.open)).toEqual([false, false]);
  });
});
