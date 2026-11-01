import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { Comment } from "@flanksource/clicky-ui";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AgentRunChip } from "./AgentRunChip";

const DELIVER_ERROR =
  "Captain POST /api/captain/sessions/acme-1/deliver failed with 409: session acme-1's process 3324 is no longer readable";
const TARGET = { label: "stabilize-anchors · claude" };

function commentWith(agentRun: NonNullable<Comment["agentRun"]>): Comment {
  return {
    id: "c1",
    body: "Make this a split button",
    status: "open",
    createdAt: "2026-11-01T07:00:00.000Z",
    author: { id: "dana", name: "Dana", kind: "user" },
    agentRun,
  };
}

describe("AgentRunChip", () => {
  afterEach(cleanup);
  it("opens the failure's details when a failed captain hand-off is clicked", () => {
    render(
      <AgentRunChip
        comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "error", error: DELIVER_ERROR, target: TARGET })}
        onOpen={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Sent to stabilize-anchors · claude · failed/ }));
    const dialog = screen.getByRole("dialog");
    expect({
      message: within(dialog).getByText(DELIVER_ERROR) !== null,
      target: within(dialog).getByText(TARGET.label) !== null,
    }).toEqual({ message: true, target: true });
  });

  it("leaves a sent captain hand-off as a plain label", () => {
    render(<AgentRunChip comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "sent", target: TARGET })} onOpen={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
