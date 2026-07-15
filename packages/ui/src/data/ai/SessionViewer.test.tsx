import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("renders system instructions as an expandable System row, not a user message", () => {
    const { container } = render(
      <SessionViewer
        showHeader={false}
        session={{
          messages: [
            {
              id: "system",
              role: "system",
              parts: [{ type: "text", text: "# AGENTS.md instructions\nAlways run focused tests." }],
            },
          ],
        }}
      />,
    );

    expect(container.querySelector('[data-event-kind="system"]')).toBeInTheDocument();
    expect(container.querySelector('[data-event-kind="user"]')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /System/ }));
    expect(screen.getByText(/Always run focused tests/)).toBeInTheDocument();
  });

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

  it("renders AskUserQuestion rows as readable questions with options and answers", () => {
    render(
      <SessionViewer
        showHeader={false}
        session={[
          {
            type: "assistant",
            uuid: "ask-1",
            tool_use: {
              tool: "AskUserQuestion",
              input: {
                questions: [
                  {
                    id: "scope",
                    header: "Scope",
                    question: "Which scope should the rule use?",
                    options: [
                      { label: "Project", description: "Current workspace" },
                      { label: "Global" },
                    ],
                  },
                ],
              },
              response: "Scope: Project",
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("Ask user")).toBeInTheDocument();
    expect(screen.getByText("Scope")).toBeInTheDocument();
    expect(screen.getByText("Which scope should the rule use?")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Current workspace")).toBeInTheDocument();
    expect(screen.getByText("Answer")).toBeInTheDocument();
    expect(screen.getByText("Scope: Project")).toBeInTheDocument();
  });

  it("renders a pending question overlay and returns answers keyed by question text", async () => {
    const onDecision = vi.fn();
    render(
      <SessionViewer
        showHeader={false}
        session={[]}
        pendingTools={[{
          tool: "AskUserQuestion",
          toolCallId: "ask-1",
          input: { questions: [{ id: "scope", question: "Which scope?", options: [{ label: "Project", value: "project" }] }] },
        }]}
        onPendingToolDecision={onDecision}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /Project/ }));
    fireEvent.click(screen.getByRole("button", { name: /Send answer/ }));

    await waitFor(() => expect(onDecision).toHaveBeenCalledWith(expect.objectContaining({
        allow: true,
        answers: { "Which scope?": "project" },
      })),
    );
  });

  it("keeps permission decision errors on the pending tool row", async () => {
    render(
      <SessionViewer
        showHeader={false}
        session={[]}
        pendingTools={[{ tool: "Bash", input: { command: "npm test" } }]}
        onPendingToolDecision={async () => { throw new Error("approval expired"); }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Allow/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("approval expired");
  });

  it("shows approval status badges directly on tool rows", () => {
    render(
      <SessionViewer
        showHeader={false}
        session={{
          messages: [
            {
              id: "m1",
              role: "assistant",
              parts: [
                {
                  type: "dynamic-tool",
                  toolName: "Bash",
                  state: "approval-requested",
                  input: { command: "npm test" },
                  approval: { id: "approval-1" },
                },
              ],
            },
            {
              id: "m2",
              role: "assistant",
              parts: [
                {
                  type: "dynamic-tool",
                  toolName: "WebFetch",
                  state: "approval-responded",
                  input: { url: "https://example.com" },
                  approval: { id: "approval-2", approved: false, reason: "not needed" },
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
    expect(screen.getByText("Denied: not needed")).toBeInTheDocument();
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

  it("collapses adjacent Wait calls and expands back to the original rows", () => {
    const waits = ["214", "215", "216"].map((cellId) => ({
      id: `wait-${cellId}`,
      role: "assistant",
      turnId: "turn-wait",
      provenance: {
        timestamp: `2026-07-13T09:41:${cellId === "214" ? "33" : cellId === "215" ? "41" : "49"}.000Z`,
        sessionId: "session-wait",
        source: "codex",
        model: "gpt-5.6-sol",
        reasoningEffort: "max",
        agentId: "agent-wait",
      },
      parts: [
        {
          type: "dynamic-tool",
          toolName: "Wait",
          toolCallId: `call-${cellId}`,
          state: "output-available",
          input: { cell_id: cellId, yield_time_ms: 20000, max_tokens: 5000 },
          output: `cell ${cellId} completed`,
        },
      ],
    }));
    const { container } = render(<SessionViewer session={{ messages: waits }} />);

    expect(screen.getByText("3 actions")).toBeInTheDocument();
    expect(screen.getByText("Wait × 3")).toBeInTheDocument();
    const group = container.querySelector('[data-event-group="wait"]') as HTMLElement;
    expect(group).toBeInTheDocument();
    expect(group.textContent).not.toContain("cell_id:");

    fireEvent.click(within(group).getByRole("button", { name: "Expand Wait × 3" }));

    expect(within(group).getByRole("button", { name: "Collapse Wait × 3" })).toBeInTheDocument();
    expect(group.querySelectorAll('li[data-event-kind="tool"]')).toHaveLength(3);
    expect(group.textContent).toContain("cell_id: 214");
    expect(group.textContent).toContain("cell_id: 215");
    expect(group.textContent).toContain("cell_id: 216");
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
    // The context window renders as an interactive meter (bar + hover popover);
    // budget and token detail ride in the popover.
    expect(screen.getByLabelText("Context 1% used")).toBeInTheDocument();
    expect(screen.getByText("1 event")).toBeInTheDocument();
  });

  it("shows a budget text badge only when there is no context to attach it to", () => {
    render(
      <SessionViewer
        session={{
          messages: [{ id: "m1", role: "assistant", parts: [{ type: "text", text: "done" }] }],
          budget: { used: 1.25, total: 5, remaining: 3.75 },
        }}
      />,
    );
    expect(screen.getByText("budget $1.25/$5")).toBeInTheDocument();
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
