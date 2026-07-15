import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionViewer } from "./SessionViewer";
import { SAMPLE_SESSION } from "./SessionViewer.fixtures";
import type { SessionEntry } from "./SessionViewer.model";

const assistantLog = (count: number): SessionEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    type: "assistant",
    uuid: `e${i}`,
    message: { role: "assistant", content: [{ type: "text", text: `message ${i}` }] },
  }));

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

  it("shows a +/- diff stat on write rows and a line diff on expand", () => {
    const { container } = render(<SessionViewer session={SAMPLE_SESSION} />);
    const rows = [...container.querySelectorAll('li[data-event-kind="tool"]')];
    const writeRow = rows.find((li) =>
      li.textContent?.includes("packages/ui/src/data/ai/SessionViewer.tsx"),
    ) as HTMLElement;
    expect(writeRow.textContent).toContain("+3");
    expect(writeRow.textContent).not.toContain("content:");

    fireEvent.click(within(writeRow).getByRole("button", { name: /SessionViewer\.tsx/ }));
    expect(writeRow.textContent).toContain("+export function SessionViewer() {");
    // The diff replaces the tool-input JSON.
    expect(writeRow.textContent).not.toContain('"content":');
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

  it("shows session-level turn, capability, context and budget metadata", () => {
    render(
      <SessionViewer
        session={{
          messages: [
            {
              id: "m1",
              role: "assistant",
              provenance: { model: "claude-opus-4-8" },
              parts: [{ type: "text", text: "done" }],
            },
          ],
          turns: [{ id: "turn-1", index: 1, messageIds: ["m1"] }],
          capabilities: {
            tools: ["Read", "Bash"],
            pendingMcpServers: ["github"],
            agents: ["general-purpose"],
            skills: ["gavel-runner"],
          },
          context: { usedTokens: 1500, windowTokens: 1_000_000, freePercent: 99 },
          budget: { used: 1.25, total: 5, remaining: 3.75 },
          events: [{ type: "last-prompt", scope: "session" }],
        }}
      />,
    );

    expect(screen.getByText("1 turn")).toBeInTheDocument();
    expect(screen.getByText("2 tools")).toBeInTheDocument();
    expect(screen.getByText("1 mcp")).toBeInTheDocument();
    expect(screen.getByText("1 agent")).toBeInTheDocument();
    expect(screen.getByText("1 skill")).toBeInTheDocument();
    expect(screen.getByText("ctx 99% free (2k/1.0M)")).toBeInTheDocument();
    expect(screen.getByText("budget $1.25/$5")).toBeInTheDocument();
    expect(screen.getByText("1 event")).toBeInTheDocument();
  });

  it("renders a terminal API error entry", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(screen.getByText("rate_limit (HTTP 429)")).toBeInTheDocument();
  });

  it("shows reasoning text inline as a one-line toggle that expands on click", () => {
    render(<SessionViewer session={SAMPLE_SESSION} />);
    const reasoning = screen.getByRole("button", { name: /I should explore the repo/ });
    expect(reasoning).toHaveAttribute("aria-expanded", "false");
    expect(reasoning.querySelector(".truncate")).not.toBeNull();
    fireEvent.click(reasoning);
    expect(reasoning).toHaveAttribute("aria-expanded", "true");
    expect(reasoning.querySelector(".truncate")).toBeNull();
  });

  it("hides reasoning blocks when showThinking is false", () => {
    const { rerender } = render(<SessionViewer session={SAMPLE_SESSION} />);
    expect(
      screen.getByText("I should explore the repo's data components first."),
    ).toBeInTheDocument();
    rerender(<SessionViewer session={SAMPLE_SESSION} showThinking={false} />);
    expect(
      screen.queryByText("I should explore the repo's data components first."),
    ).not.toBeInTheDocument();
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

  it("mounts only the newest window of rows in scrollable mode", () => {
    const { container } = render(
      <SessionViewer session={assistantLog(200)} scrollable windowSize={10} showHeader={false} showMenu={false} />,
    );
    const rows = container.querySelectorAll("[data-event-kind]");
    expect(rows).toHaveLength(10);
    // The newest entry is the last one rendered; the oldest of the 200 is not mounted.
    expect(within(container).getByText("message 199")).toBeInTheDocument();
    expect(within(container).queryByText("message 0")).not.toBeInTheDocument();
  });

  it("renders every row when not scrollable", () => {
    const { container } = render(<SessionViewer session={assistantLog(30)} showHeader={false} showMenu={false} />);
    expect(container.querySelectorAll("[data-event-kind]")).toHaveLength(30);
  });

  it("loads an older batch when scrolled near the top", () => {
    const { container } = render(
      <SessionViewer session={assistantLog(300)} scrollable windowSize={20} batchSize={20} showHeader={false} showMenu={false} />,
    );
    const scroller = container.querySelector("div.overflow-y-auto") as HTMLElement;
    expect(container.querySelectorAll("[data-event-kind]")).toHaveLength(20);
    // Reaching the top loads the next-older batch, keeping the total bounded.
    act(() => {
      scroller.scrollTop = 0;
      fireEvent.scroll(scroller);
    });
    expect(container.querySelectorAll("[data-event-kind]")).toHaveLength(40);
    // The newest entries stay mounted; only older ones were prepended.
    expect(within(container).getByText("message 299")).toBeInTheDocument();
    expect(within(container).getByText("message 260")).toBeInTheDocument();
    expect(within(container).queryByText("message 259")).not.toBeInTheDocument();
  });
});
