import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionViewer } from "./SessionViewer";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";

describe("SessionViewer responsive layout", () => {
  it("uses container-width breakpoints for compact embedded layouts", () => {
    const { container } = render(
      <SessionViewer session={SAMPLE_SESSION} scrollable />,
    );
    const viewer = container.firstElementChild;
    const header = viewer?.querySelector("[data-session-viewer-header]");
    const content = viewer?.querySelector("[data-session-viewer-content]");
    const toolRow = viewer?.querySelector('[data-event-kind="tool"]');

    expect(viewer).toHaveClass("@container/session-viewer", "min-w-0");
    expect(header).toHaveClass(
      "px-density-3",
      "@min-[48rem]/session-viewer:px-density-4",
    );
    expect(content).toHaveClass(
      "p-density-3",
      "@min-[48rem]/session-viewer:p-density-4",
    );
    expect(toolRow).toHaveClass(
      "gap-density-2",
      "pb-density-3",
      "@min-[48rem]/session-viewer:gap-density-3",
      "@min-[48rem]/session-viewer:pb-density-4",
    );
  });

  it("renders host controls inside the session options menu", () => {
    render(
      <SessionViewer
        session={SAMPLE_SESSION}
        menuHeader={<button type="button">Session 1 of 2</button>}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Session 1 of 2" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Session options" }));

    expect(
      screen.getByRole("button", { name: "Session 1 of 2" }),
    ).toBeInTheDocument();
  });
});
