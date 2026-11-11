import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentSendFailure } from "./AgentSendFailure";
import { fetchCaptainSessions } from "./agent-runs-api";
vi.mock("./agent-runs-api", async importOriginal => ({ ...await importOriginal<typeof import("./agent-runs-api")>(), fetchCaptainSessions: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const session = { id: "new-session", title: "Review toolbar", source: "codex", model: "example-model", inCmux: false };
const comment = { id: "comment-a", body: "Fix the toolbar", author: null, createdAt: "2026-11-03" };
describe("send failure target choices", () => {
  it("resends to a selected Captain target and closes after success", async () => {
    vi.mocked(fetchCaptainSessions).mockResolvedValue([session]);
    const retry = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn();
    render(<AgentSendFailure comment={comment} error="Delivery failed" onRetry={retry} onClose={close} onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Review toolbar/ }));
    await waitFor(() => expect(retry).toHaveBeenCalledWith({ kind: "captain", sessionId: session.id, label: "Review toolbar · codex" }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
  });
  it("offers Retry in a new session as the menu's first item and closes after success", async () => {
    vi.mocked(fetchCaptainSessions).mockResolvedValue([session]);
    const retryFresh = vi.fn().mockResolvedValue(undefined);
    const retry = vi.fn();
    const close = vi.fn();
    render(<AgentSendFailure comment={comment} error="Delivery failed" onRetry={retry} onRetryFresh={retryFresh} onClose={close} onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    const items = await screen.findAllByRole("menuitem");
    expect(items[0]?.textContent).toBe("Retry in a new session");
    fireEvent.click(items[0]!);
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(retryFresh).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
  });
  it("keeps the failure open with the new error when Retry in a new session fails", async () => {
    vi.mocked(fetchCaptainSessions).mockResolvedValue([]);
    const close = vi.fn();
    const retryFresh = vi.fn().mockRejectedValue(new Error("No runtime configured"));
    render(<AgentSendFailure comment={comment} error="Delivery failed" onRetry={vi.fn()} onRetryFresh={retryFresh} onClose={close} onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Retry in a new session" }));
    await screen.findByText("No runtime configured", { selector: "pre" });
    expect(close).not.toHaveBeenCalled();
  });
  it("omits Retry in a new session when the host cannot start one", async () => {
    vi.mocked(fetchCaptainSessions).mockResolvedValue([]);
    render(<AgentSendFailure comment={comment} error="Delivery failed" onRetry={vi.fn()} onClose={vi.fn()} onOpen={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to another target" }));
    await screen.findByRole("menuitem", { name: "Send to Playground agent" });
    expect(screen.queryByRole("menuitem", { name: "Retry in a new session" })).toBeNull();
  });
  it("keeps the primary retry available when listing Captain sessions fails", async () => {
    vi.mocked(fetchCaptainSessions).mockRejectedValue(new Error("Captain unavailable"));
    const retry = vi.fn().mockResolvedValue(undefined);
    render(<AgentSendFailure comment={comment} error="Delivery failed" onRetry={retry} onClose={vi.fn()} onOpen={vi.fn()} />);
    await screen.findByText("Captain unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry send" }));
    await waitFor(() => expect(retry).toHaveBeenCalledWith());
  });
});
