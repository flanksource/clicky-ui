import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyVerifySummary } from "../verification/verify-report";
import { SessionInspector } from "./SessionInspector";
import type { SessionCollectionInput } from "./SessionInspector.collection";
import {
  COLLECTION,
  collectionSession,
} from "./SessionInspector.collection.fixtures";

describe("SessionInspector session collections", () => {
  it("shows verification from a selected child session", () => {
    const collection: SessionCollectionInput = {
      ...COLLECTION,
      defaultSelectedSessionIds: ["primary", "parallel"],
      sessions: [
        COLLECTION.sessions[0]!,
        {
          ...COLLECTION.sessions[1]!,
          session: {
            ...COLLECTION.sessions[1]!.session,
            verifications: [
              {
                iteration: 1,
                report: {
                  kind: "fixture",
                  name: "fixture",
                  ran: true,
                  passed: false,
                  state: "failed",
                  reason: "fixture failed",
                  summary: emptyVerifySummary(),
                },
              },
            ],
          },
        },
      ],
    };
    render(<SessionInspector session={collection} />);

    fireEvent.click(screen.getByRole("tab", { name: "Verification 1" }));
    expect(screen.getByText("fixture failed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "parallel · 1. fixture · failed" }),
    ).toBeInTheDocument();
  });

  it("renders compact controls on one overflow-safe line and moves the hierarchy into session options", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={COLLECTION}
          layout="compact"
          metadata={{
            sessionId: "primary",
            provider: "openai",
            executionMode: "api",
            model: "openai/gpt-5.5",
            reasoningEffort: "high",
            context: {
              usedTokens: 63_000,
              windowTokens: 100_000,
              freePercent: 37,
            },
          }}
          toolbarActions={
            // oxlint-disable-next-line clicky-ui/prefer-clicky-components -- verifies arbitrary host actions in the shared toolbar slot.
            <button type="button" aria-label="Copy session">
              Copy
            </button>
          }
        />
      </div>,
    );

    const toolbar = screen.getByRole("toolbar", {
      name: "Session detail controls",
    });
    const tabs = within(toolbar).getByRole("tablist", {
      name: "Session detail view",
    });
    expect(tabs).toHaveClass("overflow-hidden");
    expect(tabs).not.toHaveClass("overflow-x-auto");
    expect(
      within(toolbar).getByLabelText("Context 63% used"),
    ).toHaveTextContent("gpt-5.5");
    expect(within(toolbar).getByTitle("Mode: api")).toBeInTheDocument();
    expect(within(toolbar).getByTitle("High effort")).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "Copy session" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(toolbar).getByRole("button", { name: "Session options" }),
    );
    const menu = screen.getByRole("menu", { name: "Session options" });
    const tree = within(menu).getByRole("tree", { name: "Session content" });
    expect(within(tree).getByText("Primary run")).toBeInTheDocument();
    expect(within(tree).getByText("Parallel run")).toBeInTheDocument();
    expect(within(tree).getByText("gpt-5-mini")).toBeInTheDocument();

    fireEvent.click(within(toolbar).getByRole("tab", { name: "Plan" }));
    expect(
      within(toolbar).getByRole("button", { name: "Session options" }),
    ).toBeInTheDocument();
  });

  it("includes every explicitly selected session on first render", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={{
            ...COLLECTION,
            defaultSelectedSessionIds: ["primary", "parallel"],
          }}
        />
      </div>,
    );

    expect(screen.getByText("primary answer")).toBeInTheDocument();
    expect(screen.getByText("parallel answer")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Select session content: 2 of 2 sessions",
      }),
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
      </div>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      }),
    );
    const tree = screen.getByRole("tree", { name: "Session content" });
    expect(within(tree).getByText("planning")).toBeInTheDocument();
    expect(within(tree).getByText("pid 4242")).toBeInTheDocument();
    expect(within(tree).getByText("1.5 min")).toBeInTheDocument();
    expect(within(tree).getByText("2m ago")).toBeInTheDocument();
    expect(
      within(tree).getByRole("img", { name: "Plan mode" }),
    ).toBeInTheDocument();
    expect(within(tree).getByRole("img", { name: "High effort" })).toHaveClass(
      "text-orange-600",
    );
    vi.useRealTimers();
  });

  it("uses a checkbox hierarchy to compose transcript sessions and costs", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={COLLECTION} />
      </div>,
    );

    expect(
      screen.queryByRole("tab", { name: /Turns/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Agents/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("primary answer")).toBeInTheDocument();
    expect(screen.queryByText("parallel answer")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      }),
    );
    const tree = screen.getByRole("tree", { name: "Session content" });
    expect(within(tree).getByText("Primary run")).toBeInTheDocument();
    expect(within(tree).getByText("Parallel run")).toBeInTheDocument();
    expect(within(tree).getByText("gpt-5-mini")).toBeInTheDocument();
    expect(
      within(tree).getByRole("img", { name: "API mode" }),
    ).toBeInTheDocument();
    expect(within(tree).getByText("$0.02")).toBeInTheDocument();

    fireEvent.click(
      within(tree).getByRole("checkbox", { name: "Include Parallel run" }),
    );
    expect(screen.getByText("primary answer")).toBeInTheDocument();
    expect(screen.getByText("parallel answer")).toBeInTheDocument();
    expect(
      screen.getAllByTitle("Turn primary:primary-turn").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTitle("Turn parallel:parallel-turn").length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Costs $0.03" }));
    expect(screen.getAllByText("$0.03").length).toBeGreaterThan(0);
  });

  it("loads an unchecked session when its hierarchy branch is included", async () => {
    const parallel = collectionSession(
      "parallel",
      "gpt-5-mini",
      "lazy parallel answer",
      0.02,
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
      </div>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 2 sessions",
      }),
    );
    fireEvent.click(
      within(screen.getByRole("tree", { name: "Session content" })).getByRole(
        "checkbox",
        { name: "Include Lazy parallel run" },
      ),
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
      }),
    ).toBeInTheDocument();
  });
});
