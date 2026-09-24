import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import {
  buildSessionHierarchy,
  checkedSessionIds,
  initialCheckedKeys,
  type SessionCollectionInput,
} from "./SessionInspector.collection";
import {
  COLLECTION,
  collectionSession,
} from "./SessionInspector.collection.fixtures";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

// withSecondTurn gives a session two root turns, so one turn can be unchecked
// while its session stays (partially) selected.
function withSecondTurn(session: UnifiedSessionInput): UnifiedSessionInput {
  const turnId = `${session.id}-turn-2`;
  return {
    ...session,
    messages: [
      ...(session.messages ?? []),
      {
        id: `${session.id}-message-2`,
        role: "assistant",
        turnId,
        parts: [{ type: "text", text: `${session.id} follow-up` }],
        provenance: {
          sessionId: session.id!,
          agentId: session.id!,
          timestamp: "2026-07-15T10:01:00Z",
        },
      },
    ],
    turns: [...(session.turns ?? []), { id: turnId, index: 2 }],
  };
}

function openSessionTree() {
  fireEvent.click(
    screen.getByRole("button", { name: /^Select session content/ }),
  );
  return screen.getByRole("tree", { name: "Session content" });
}

describe("checkedSessionIds", () => {
  const roots = buildSessionHierarchy(COLLECTION, new Map());

  it.each([
    { name: "no session", ids: [] },
    { name: "one session", ids: ["parallel"] },
    { name: "every session", ids: ["primary", "parallel"] },
  ])("returns $name when that is what is checked", ({ ids }) => {
    expect(checkedSessionIds(roots, initialCheckedKeys(roots, ids))).toEqual(
      ids,
    );
  });

  it("counts a session whose only checked node is one of its turns", () => {
    expect(
      checkedSessionIds(roots, new Set(["parallel:turn:parallel-turn"])),
    ).toEqual(["parallel"]);
  });
});

describe("SessionInspector controlled tab", () => {
  it("shows the controlled tab and reports clicks without switching itself", () => {
    const onTabChange = vi.fn();
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={COLLECTION}
          tab="metadata"
          onTabChange={onTabChange}
        />
      </div>,
    );

    expect(
      screen.getByRole("tab", { name: /^Metadata/ }),
    ).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: /^Raw/ }));
    expect(onTabChange).toHaveBeenCalledWith("raw");
    expect(
      screen.getByRole("tab", { name: /^Metadata/ }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("falls back to the transcript for a controlled output tab without structured output", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={COLLECTION} tab="output" />
      </div>,
    );

    expect(
      screen.getByRole("tab", { name: /^Transcript/ }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("primary answer")).toBeInTheDocument();
  });
});

describe("SessionInspector controlled session selection", () => {
  it("loads and shows a selected session that is not loaded yet", async () => {
    const loadSession = vi.fn(async () =>
      collectionSession("parallel", "gpt-5-mini", "lazy parallel answer", 0.02),
    );
    const collection: SessionCollectionInput = {
      ...COLLECTION,
      sessions: [
        COLLECTION.sessions[0]!,
        { id: "parallel", label: "Lazy parallel run" },
      ],
      loadSession,
    };

    render(
      <div className="h-[720px]">
        <SessionInspector
          session={collection}
          selectedSessionIds={["primary", "parallel"]}
        />
      </div>,
    );

    await waitFor(() =>
      expect(screen.getByText("lazy parallel answer")).toBeInTheDocument(),
    );
    expect(loadSession).toHaveBeenCalledTimes(1);
    expect(screen.getByText("primary answer")).toBeInTheDocument();
  });

  it("reports a session toggle and drops ids the collection does not contain", () => {
    const onChange = vi.fn();
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={COLLECTION}
          selectedSessionIds={["primary", "gone"]}
          onSelectedSessionIdsChange={onChange}
        />
      </div>,
    );
    expect(onChange).toHaveBeenLastCalledWith(["primary"]);

    fireEvent.click(
      within(openSessionTree()).getByRole("checkbox", {
        name: "Include Parallel run",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith(["primary", "parallel"]);
  });

  it("keeps a turn-level toggle local", () => {
    const onChange = vi.fn();
    const collection: SessionCollectionInput = {
      ...COLLECTION,
      sessions: [
        {
          ...COLLECTION.sessions[0]!,
          session: withSecondTurn(COLLECTION.sessions[0]!.session!),
        },
        COLLECTION.sessions[1]!,
      ],
    };
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={collection}
          selectedSessionIds={["primary"]}
          onSelectedSessionIdsChange={onChange}
        />
      </div>,
    );
    expect(screen.getByText("primary follow-up")).toBeInTheDocument();

    // The current session's branch opens by default, so its turns are visible.
    const tree = openSessionTree();
    fireEvent.click(
      within(tree).getAllByRole("checkbox", { name: "Include Turn 2" })[0]!,
    );
    expect(screen.queryByText("primary follow-up")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
