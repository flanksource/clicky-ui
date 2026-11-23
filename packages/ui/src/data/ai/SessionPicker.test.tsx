import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionPicker } from "./SessionPicker";
import { sessionPickerDescription, type SessionPickerSession } from "./SessionPicker.model";

const NOW = new Date("2026-11-23T12:00:00Z");
const LIVE: SessionPickerSession = {
  id: "sess-live-0001",
  title: "Review scheduler backoff",
  provider: "anthropic",
  model: "claude-sonnet-5",
  cwd: "/work/acme/scheduler",
  status: "active",
  updatedAt: "2026-11-23T11:55:00Z",
  costUsd: 1.25,
  context: { usedTokens: 50_000, windowTokens: 200_000 },
};
const UNTITLED: SessionPickerSession = { id: "sess-untitled-0002", status: "ended" };

afterEach(cleanup);

describe("sessionPickerDescription", () => {
  it("joins status, folder, context share, cost and age", () => {
    expect(sessionPickerDescription(LIVE, NOW)).toBe("active · scheduler · 25% context · $1.25 · 5m ago");
  });

  it("omits fields the session lacks and a zero cost", () => {
    expect(sessionPickerDescription({ ...UNTITLED, costUsd: 0 }, NOW)).toBe("ended");
  });
});

describe("SessionPicker", () => {
  it("shows the selected session with its provider icon and reports the session chosen", () => {
    const onChange = vi.fn();
    render(<SessionPicker value={LIVE.id} sessions={[LIVE, UNTITLED]} onChange={onChange} now={NOW} />);
    const trigger = screen.getByRole("combobox", { name: "Session" });
    expect(trigger).toHaveTextContent("Review scheduler backoff");
    expect(trigger.querySelector("[data-agent-identity], svg, img")).not.toBeNull();
    fireEvent.click(trigger);
    const options = within(screen.getByRole("listbox", { name: "Session" })).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringContaining("active · scheduler · 25% context"),
      expect.stringContaining("sess-untitle"),
    ]);
    fireEvent.mouseDown(options[1]!);
    expect(onChange).toHaveBeenCalledWith(UNTITLED);
  });

  it("offers New session first and selects it when no session is chosen", () => {
    const onNew = vi.fn();
    const onChange = vi.fn();
    render(<SessionPicker value={undefined} sessions={[LIVE]} onChange={onChange} onNew={onNew} />);
    const trigger = screen.getByRole("combobox", { name: "Session" });
    expect(trigger).toHaveTextContent("New session");
    fireEvent.click(trigger);
    const first = within(screen.getByRole("listbox")).getAllByRole("option")[0]!;
    expect(first).toHaveTextContent("New session");
    fireEvent.mouseDown(first);
    expect(onNew).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("loads sessions and retries after a failed load", async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error("sessions unavailable"))
      .mockResolvedValueOnce([LIVE]);
    render(<SessionPicker value={LIVE.id} load={load} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Session" }));
    expect(await screen.findByText("sessions unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Session" })).toHaveTextContent("Review scheduler backoff"));
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("rejects both a list and a loader", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SessionPicker value={undefined} sessions={[LIVE]} load={async () => []} onChange={vi.fn()} />)).toThrow("either sessions or load");
  });
});
