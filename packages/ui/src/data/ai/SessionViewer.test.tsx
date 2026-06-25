import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionViewer } from "./SessionViewer";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";

describe("SessionViewer", () => {
  it("renders agent action labels and input summaries from the session", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.getByText("Read file")).toBeInTheDocument();
    expect(screen.getByText("Grep")).toBeInTheDocument();
    expect(screen.getByText("Run command")).toBeInTheDocument();
    expect(screen.getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
    expect(screen.getByText("iconify: search icons")).toBeInTheDocument();
  });

  it("shows the summary header with the dominant model and action counts", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.getAllByText("claude-opus-4-8").length).toBeGreaterThan(0);
    expect(screen.getByText("6 actions")).toBeInTheDocument();
  });

  it("renders a terminal API error entry", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.getByText("rate_limit (HTTP 429)")).toBeInTheDocument();
  });

  it("hides reasoning blocks when showThinking is false", () => {
    const { rerender } = render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
    rerender(<SessionViewer session={SAMPLE_SESSION} showThinking={false} />);
    expect(screen.queryByText("Reasoning")).not.toBeInTheDocument();
  });

  it("expands a tool call to reveal its response", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Run command/ }));
    expect(screen.getByText(/Tests: 8 passed/)).toBeInTheDocument();
  });

  it("renders an empty state when there is no activity", () => {
    render(<SessionViewer session={[]} />);
    expect(screen.getByText("No session activity.")).toBeInTheDocument();
  });

  it("right-aligns user prompts", () => {
    const { container } = render(<SessionViewer session={SAMPLE_SESSION} />);
    const userRow = container.querySelector('[data-event-kind="user"]');
    expect(userRow).not.toBeNull();
    expect(userRow).toHaveClass("justify-end");
  });

  it("overrides density from the 3-dot menu", () => {
    const { container } = render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(container.firstChild).not.toHaveAttribute("data-density");
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    expect(container.firstChild).toHaveAttribute("data-density", "compact");
  });

  it("overrides light/dark theme from the 3-dot menu", () => {
    const { container } = render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(container.firstChild).not.toHaveAttribute("data-theme");
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(container.firstChild).toHaveAttribute("data-theme", "dark");
  });

  it("hides a whole category via the menu's captain-style filter", () => {
    const { container } = render(<SessionViewer session={SAMPLE_SESSION} />);
    const list = () => container.querySelector("ol") as HTMLElement;
    // Read + Grep are the "explore" category.
    expect(within(list()).getByText("Read file")).toBeInTheDocument();
    expect(within(list()).getByText("Grep")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Explore" }));

    expect(within(list()).queryByText("Read file")).not.toBeInTheDocument();
    expect(within(list()).queryByText("Grep")).not.toBeInTheDocument();
    // A different category (Run command / Bash) is untouched.
    expect(within(list()).getByText("Run command")).toBeInTheDocument();
  });
});
