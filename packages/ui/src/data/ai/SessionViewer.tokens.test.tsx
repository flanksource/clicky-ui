import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionViewer } from "./SessionViewer";
import type { UnifiedSessionInput } from "./SessionViewer.unified";
import type { SessionTokenSizingResult, SessionTokenSizer } from "./session-token-sizing";

const session: UnifiedSessionInput = {
  id: "session-example", revision: 1, model: "claude-sonnet-4-6",
  messages: [
    { id: "user", role: "user", parts: [{ type: "text", text: "Full user content" }] },
    { id: "assistant", role: "assistant", parts: [{ type: "text", text: "Full assistant content" }] },
    { id: "tool", role: "assistant", parts: [{ type: "dynamic-tool", toolName: "Read", input: { file_path: "example.go" }, estimatedCost: { sharedCalls: 1, cost: { inputCost: 0.1 } } }] },
  ],
};

const sizeTokens: SessionTokenSizer = async (request) => ({
  sessionId: request.sessionId, revision: request.revision ?? 0,
  rows: request.rowIds.map((rowId) => ({ rowId, attributed: rowId === "tool-0", size: {
    model: "claude-sonnet-4-6", source: request.method === "estimate" ? "local-estimate" : "provider-count",
    usage: { inputTokens: 8 }, totalTokens: 8, costUSD: 0.000024,
    coverage: { partial: true, framingIncluded: request.method === "provider", excluded: ["surrounding conversation"] },
  } })),
});

describe("Session token sizing actions", () => {
  it("calculates only missing rows from the main menu", async () => {
    const calculate = vi.fn(sizeTokens);
    render(<SessionViewer session={session} sizeTokens={calculate} />);
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Calculate missing rows" }));
    await waitFor(() => expect(calculate).toHaveBeenCalledTimes(1));
    expect(calculate.mock.calls[0]?.[0].rowIds).toEqual(["user-0", "assistant-0"]);
  });
  it("only requests sizing on menu actions and estimates all rows even when reasoning or other rows are hidden", async () => {
    const calculate = vi.fn(sizeTokens);
    const hiddenSession: UnifiedSessionInput = { ...session, messages: [...session.messages, { id: "reasoning", role: "assistant", parts: [{ type: "reasoning", text: "Hidden full reasoning" }] }] };
    render(<SessionViewer session={hiddenSession} sizeTokens={calculate} showThinking={false} scrollable windowSize={2} pendingTools={[{ tool: "Read", toolCallId: "pending-example" }]} />);
    expect(calculate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Estimate tokens/cost for all rows" }));
    await waitFor(() => expect(calculate).toHaveBeenCalledTimes(1));
    expect(calculate.mock.calls[0]?.[0]).toEqual({ sessionId: "session-example", revision: 1, rowIds: ["user-0", "assistant-0", "tool-0", "reasoning-0"], method: "estimate" });
    expect(await screen.findAllByLabelText("Calculated row footprint")).toHaveLength(1);
  });

  it("offers provider calculation on missing rows and preserves attributed tool costs", async () => {
    const calculate = vi.fn(sizeTokens);
    render(<SessionViewer session={session} sizeTokens={calculate} />);
    expect(screen.queryByRole("button", { name: "Row options tool-0" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Row options user-0" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Calculate tokens/cost" }));
    expect(await screen.findByLabelText("Calculated row footprint")).toHaveTextContent("8 tokens");
    expect(calculate.mock.calls[0]?.[0].method).toBe("provider");
    fireEvent.click(screen.getByRole("button", { name: "Row options user-0" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Calculate tokens/cost" }));
    expect(calculate).toHaveBeenCalledTimes(1);
  });

  it("invalidates footprints after a live content update and exposes request errors", async () => {
    const calculate = vi.fn(sizeTokens);
    const view = render(<SessionViewer session={session} sizeTokens={calculate} />);
    fireEvent.click(screen.getByRole("button", { name: "Row options user-0" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Calculate tokens/cost" }));
    await screen.findByLabelText("Calculated row footprint");
    view.rerender(<SessionViewer session={{ ...session, revision: 2 }} sizeTokens={async () => { throw new Error("Provider count unavailable"); }} />);
    expect(screen.queryByLabelText("Calculated row footprint")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Row options user-0" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Calculate tokens/cost" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Provider count unavailable");
  });

  it("deduplicates pending actions and discards results from an earlier revision", async () => {
    let complete: (result: SessionTokenSizingResult) => void = () => { throw new Error("Sizing was not requested"); };
    const calculate = vi.fn<SessionTokenSizer>(() => new Promise((resolve) => { complete = resolve; }));
    const view = render(<SessionViewer session={session} sizeTokens={calculate} />);
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Estimate tokens/cost for all rows" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Estimate tokens/cost for all rows" }));
    expect(calculate).toHaveBeenCalledTimes(1);
    view.rerender(<SessionViewer session={{ ...session, revision: 2 }} sizeTokens={calculate} />);
    expect(calculate.mock.calls[0]?.[1].aborted).toBe(true);
    await act(async () => { complete(await sizeTokens({ sessionId: session.id, revision: 1, rowIds: ["user-0"], method: "estimate" }, new AbortController().signal)); });
    expect(screen.queryByLabelText("Calculated row footprint")).not.toBeInTheDocument();
  });

  it("invalidates cached prices when the session model changes without a revision change", async () => {
    const calculate = vi.fn(sizeTokens);
    const view = render(<SessionViewer session={session} sizeTokens={calculate} />);
    fireEvent.click(screen.getByRole("button", { name: "Row options user-0" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Calculate tokens/cost" }));
    await screen.findByLabelText("Calculated row footprint");
    view.rerender(<SessionViewer session={{ ...session, model: "gpt-5" }} sizeTokens={calculate} />);
    expect(screen.queryByLabelText("Calculated row footprint")).not.toBeInTheDocument();
  });
});
