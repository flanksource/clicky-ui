import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
        onRetry={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    const dialog = screen.getByRole("dialog");
    expect({
      message: within(dialog).getByText(DELIVER_ERROR, { selector: "pre" }) !== null,
      target: within(dialog).getByText(TARGET.label, { selector: "p" }) !== null,
    }).toEqual({ message: true, target: true });
  });

  it("leaves a sent captain hand-off as a plain label", () => {
    render(<AgentRunChip comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "sent", target: TARGET })} onOpen={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the full command in collapsed details and shows a concise failure summary", () => {
    const error = `${DELIVER_ERROR}\ncmux send -- captured HTML ${"image-data".repeat(1000)}`;
    render(<AgentRunChip comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "error", error, target: TARGET })} onOpen={vi.fn()} onRetry={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));

    const details = screen.getByText("Technical details").closest("details");
    if (!details) throw new Error("Failure did not render technical details");
    expect(details.hasAttribute("open")).toBe(false);
    expect(details.querySelector("summary")?.textContent).not.toContain("cmux send");
    expect(details.querySelector("pre")?.textContent).toBe(error);
    expect(screen.getByText(TARGET.label, { selector: "p" }).closest("details")).toBeNull();
  });

  it("shows the terminal error without the command and captured page payload", () => {
    const reason = "Error: invalid_params: Surface is not a terminal";
    const error = `Captain delivery failed: cmux send -- captured page\n${"image-data".repeat(1000)} failed (exit 1): ${reason}`;
    render(<AgentRunChip comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "error", error, target: TARGET })} onOpen={vi.fn()} onRetry={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));

    const details = screen.getByText("Technical details").closest("details");
    expect(details?.querySelector("summary")?.textContent).toContain(reason);
    expect(details?.querySelector("summary")?.textContent).not.toContain("image-data");
    expect(details?.querySelector("pre")?.textContent).toBe(error);
  });

  it("disables retry while sending and closes the failure dialog on success", async () => {
    let finish: () => void = () => { throw new Error("Retry has not started"); };
    const onRetry = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<AgentRunChip comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "error", error: DELIVER_ERROR })} onOpen={vi.fn()} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));

    expect(screen.getByRole("button", { name: "Sending…" }).hasAttribute("disabled")).toBe(true);
    expect(onRetry).toHaveBeenCalledOnce();
    finish();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps a failed retry open with its new error and allows another attempt", async () => {
    const retryError = "Captain is unreachable at http://localhost:9020";
    const onRetry = vi.fn().mockRejectedValueOnce(new Error(retryError)).mockResolvedValueOnce(undefined);
    render(<AgentRunChip comment={commentWith({ requestedAt: "2026-11-01T07:01:00.000Z", state: "error", error: DELIVER_ERROR })} onOpen={vi.fn()} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Send failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));

    expect(document.body.contains(await screen.findByText(retryError, { selector: "pre" }))).toBe(true);
    expect(screen.getByRole("button", { name: "Retry send" }).hasAttribute("disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});
