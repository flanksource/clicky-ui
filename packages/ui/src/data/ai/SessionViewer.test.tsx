import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionViewer } from "./SessionViewer";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";

describe("SessionViewer", () => {
  it("renders agent action labels and input summaries from the session", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.getByText("Grep")).toBeInTheDocument();
    expect(screen.getByText("iconify: search icons")).toBeInTheDocument();
  });

  it("renders file rows as their cwd-relative path without a label", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.queryByText("Read file")).not.toBeInTheDocument();
    expect(screen.queryByText("Write file")).not.toBeInTheDocument();
    // /repo/packages/… relativized against the tool_use cwd /repo.
    expect(screen.getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
  });

  it("inlines a shell command as a bare bash block without the Run command label", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.queryByText("Run command")).not.toBeInTheDocument();
    // Visible without expanding, and without a CodeBlock language chip.
    expect(
      screen.getByText("pnpm --filter @flanksource/clicky-ui test SessionViewer"),
    ).toBeInTheDocument();
    expect(screen.queryByText("bash")).not.toBeInTheDocument();
  });

  it("renders tool input as inline name/value param hints on one line", () => {
    const { container } = render(<SessionViewer session={SAMPLE_SESSION} />);
    const rows = [...container.querySelectorAll('li[data-event-kind="tool"]')];
    const grepRow = rows.find((li) => li.textContent?.includes("Grep"));
    expect(grepRow?.textContent).toContain("pattern: SessionEntry");
    expect(grepRow?.textContent).toContain("path: packages/ui/src");
    // File rows keep the path heading; remaining keys follow as hints.
    const readRow = rows.find((li) => li.textContent?.includes("Timeline.tsx"));
    expect(readRow?.textContent).toContain("limit: 40");
    expect(readRow?.textContent).not.toContain("file_path:");
  });

  it("drops the Assistant label and the per-row source/model subtitle", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.queryByText("Assistant")).not.toBeInTheDocument();
    expect(screen.queryByText("claude")).not.toBeInTheDocument();
    expect(
      screen.getByText("I'll start by exploring the codebase, then add the component."),
    ).toBeInTheDocument();
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

  it("expands a shell call's response behind the chevron", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Toggle response" }));
    expect(screen.getByText(/Tests: 8 passed/)).toBeInTheDocument();
    // The tool-input JSON is never rendered for shell rows.
    expect(screen.queryByText(/"command":/)).not.toBeInTheDocument();
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
    expect(within(list()).getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
    expect(within(list()).getByText("Grep")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Explore" }));

    expect(within(list()).queryByText("packages/ui/src/data/Timeline.tsx")).not.toBeInTheDocument();
    expect(within(list()).queryByText("Grep")).not.toBeInTheDocument();
    // A different category (execute / Bash) is untouched.
    expect(
      within(list()).getByText("pnpm --filter @flanksource/clicky-ui test SessionViewer"),
    ).toBeInTheDocument();
  });
});
