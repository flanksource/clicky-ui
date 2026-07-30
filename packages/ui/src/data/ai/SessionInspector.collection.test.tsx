import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import type { SessionCollectionInput } from "./SessionInspector.collection";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

function session(
  id: string,
  model: string,
  text: string,
  cost: number
): UnifiedSessionInput {
  const turnId = `${id}-turn`;
  return {
    id,
    provider: "openai",
    model,
    messages: [
      {
        id: `${id}-message`,
        role: "assistant",
        turnId,
        parts: [{ type: "text", text }],
        provenance: {
          sessionId: id,
          agentId: id,
          timestamp: "2026-07-15T10:00:00Z",
        },
      },
    ],
    turns: [
      {
        id: turnId,
        index: 1,
        model,
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
        cost: { model, inputCost: cost },
      },
    ],
    usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    cost: { model, inputCost: cost },
    agents: [{ id, isRoot: true }],
  };
}

const COLLECTION: SessionCollectionInput = {
  kind: "session-collection",
  id: "comparison",
  currentSessionId: "primary",
  sessions: [
    {
      id: "primary",
      label: "Primary run",
      mode: "headless",
      session: session("primary", "gpt-5", "primary answer", 0.01),
    },
    {
      id: "parallel",
      label: "Parallel run",
      mode: "api",
      session: session("parallel", "gpt-5-mini", "parallel answer", 0.02),
    },
  ],
};

describe("SessionInspector session collections", () => {
  it("includes every explicitly selected session on first render", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={{
            ...COLLECTION,
            defaultSelectedSessionIds: ["primary", "parallel"],
          }}
        />
      </div>
    );

    expect(screen.getByText("primary answer")).toBeInTheDocument();
    expect(screen.getByText("parallel answer")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Select session content: 2 of 2 sessions",
      })
    ).toBeInTheDocument();
  });

  it("renders Captain-owned runtime, process, duration, status, and update metadata", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T10:05:00Z"));
    const collection: SessionCollectionInput = {
      ...COLLECTION,
      sessions: [
        {
          ...COLLECTION.sessions[0],
          mode: "plan",
          status: "planning",
          summary: {
            provider: "openai",
            model: "gpt-5",
            effort: "high",
            mode: "plan",
            status: "planning",
            pid: 4242,
            durationMs: 90_000,
            updatedAt: "2026-07-15T10:03:00Z",
            cost: 0.01,
          },
        },
        COLLECTION.sessions[1],
      ],
    };

    render(
      <div className="h-[720px]">
        <SessionInspector session={collection} />
      </div>
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      })
    );
    const tree = screen.getByRole("tree", { name: "Session content" });
    expect(within(tree).getByText("planning")).toBeInTheDocument();
    expect(within(tree).getByText("pid 4242")).toBeInTheDocument();
    expect(within(tree).getByText("1.5 min")).toBeInTheDocument();
    expect(within(tree).getByText("2m ago")).toBeInTheDocument();
    expect(
      within(tree).getByRole("img", { name: "Plan mode" })
    ).toBeInTheDocument();
    expect(within(tree).getByRole("img", { name: "High effort" })).toHaveClass(
      "text-orange-600"
    );
    vi.useRealTimers();
  });

  it("uses a checkbox hierarchy to compose transcript sessions and costs", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={COLLECTION} />
      </div>
    );

    expect(
      screen.queryByRole("tab", { name: /Turns/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Agents/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText("primary answer")).toBeInTheDocument();
    expect(screen.queryByText("parallel answer")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      })
    );
    const tree = screen.getByRole("tree", { name: "Session content" });
    expect(within(tree).getByText("Primary run")).toBeInTheDocument();
    expect(within(tree).getByText("Parallel run")).toBeInTheDocument();
    expect(within(tree).getByText("gpt-5-mini")).toBeInTheDocument();
    expect(
      within(tree).getByRole("img", { name: "API mode" })
    ).toBeInTheDocument();
    expect(within(tree).getByText("$0.02")).toBeInTheDocument();

    fireEvent.click(
      within(tree).getByRole("checkbox", { name: "Include Parallel run" })
    );
    expect(screen.getByText("primary answer")).toBeInTheDocument();
    expect(screen.getByText("parallel answer")).toBeInTheDocument();
    expect(
      screen.getAllByTitle("Turn primary:primary-turn").length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle("Turn parallel:parallel-turn").length
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Costs $0.03" }));
    expect(screen.getAllByText("$0.03").length).toBeGreaterThan(0);
  });

  it("loads an unchecked session when its hierarchy branch is included", async () => {
    const parallel = session(
      "parallel",
      "gpt-5-mini",
      "lazy parallel answer",
      0.02
    );
    const loadSession = vi.fn(async () => parallel);
    const collection: SessionCollectionInput = {
      ...COLLECTION,
      sessions: [
        COLLECTION.sessions[0],
        {
          id: "parallel",
          label: "Lazy parallel run",
          summary: {
            provider: "openai",
            model: "gpt-5-mini",
            mode: "api",
            cost: 0.02,
          },
        },
      ],
      loadSession,
    };

    const { container } = render(
      <div className="h-[720px]">
        <SessionInspector session={collection} />
      </div>
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      })
    );
    fireEvent.click(
      within(screen.getByRole("tree", { name: "Session content" })).getByRole(
        "checkbox",
        { name: "Include Lazy parallel run" }
      )
    );

    await waitFor(() => {
      expect(loadSession).toHaveBeenCalledTimes(1);
      expect(
        container.querySelectorAll('[data-event-kind="assistant"]')[1],
      ).toHaveTextContent("lazy parallel answer");
    });
    expect(
      screen.getByRole("button", {
        name: "Select session content: 2 of 2 sessions",
      })
    ).toBeInTheDocument();
  });
});
