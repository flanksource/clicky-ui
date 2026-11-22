import { act, render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TraceFeed, type TraceFeedProps } from "./TraceFeed";
import { httpExchangeRows } from "./fixtures";
import type { TraceFeedPage, TraceFeedRecord } from "./trace-feed";

beforeEach(() => window.history.replaceState(null, "", "/"));

describe("TraceFeed", () => {
  it("uses the shared filter bar to select capture and ordering without losing the run URL", async () => {
    window.history.replaceState(null, "", "/?run=recorded-build#event");
    const loadPage = vi.fn().mockResolvedValue({ rows: [], nextCursor: "" });
    render(<TraceFeed kinds={["http", "stacks"]} loadPage={loadPage} />);
    expect(document.querySelector('[data-filter-bar-item="capture"]')).not.toBeNull();
    expect(document.querySelector('[data-filter-bar-item="order"]')).not.toBeNull();
    expect(screen.getByRole("combobox", { name: "Capture" })).toHaveValue("All events");
    fireEvent.click(screen.getByRole("combobox", { name: "Capture" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "http" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Order" }));
    fireEvent.mouseDown(await screen.findByRole("option", { name: "Sequence" }));
    await vi.waitFor(() => expect(loadPage).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "http", sort: "seq", cursor: "" }), expect.any(AbortSignal)));
    expect(new URLSearchParams(window.location.search).get("run")).toBe("recorded-build");
    expect(window.location.hash).toBe("#event");
  });
	 it("lets a host supply capture presentation while keeping its raw records on demand", async () => {
    window.history.replaceState(null, "", "/?feedView=capture:process");
    const rows = [{ runId: "example", kind: "process", stream: "capture", seq: 1, timestamp: null, summary: "raw process", record: { pid: 123 } }];
    render(<TraceFeed kinds={["process"]} loadPage={async () => ({ rows, nextCursor: "" })} renderCapture={() => <p>Process tree</p>} />);
    expect(await screen.findByText("Process tree")).toBeInTheDocument();
    expect(screen.queryByText("raw process")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Raw stream" }));
    expect(await screen.findByText("raw process")).toBeInTheDocument();
    expect(screen.queryByText("Process tree")).not.toBeInTheDocument();
  });
  it("opens the kind-specific renderer with all page records before the raw stream is requested", async () => {
    window.history.replaceState(null, "", "/?feedView=capture:http");
    const rows = httpExchangeRows.map((record, index) => ({
      runId: "example", kind: "http", stream: "proxy", seq: index + 1,
      timestamp: null, summary: `raw exchange ${index + 1}`, record,
    }));
    render(<TraceFeed kinds={["http"]} loadPage={async () => ({ rows, nextCursor: "" })} />);
    expect(await screen.findByText("https://api.example.com/v1/cycles/run")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: `http ${rows.length}` })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("columnheader", { name: /Seq/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Raw stream" }));
    expect(await screen.findByText("raw exchange 1")).toBeInTheDocument();
    expect(screen.queryByText("https://api.example.com/v1/cycles/run")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("raw exchange 1"));
    expect(screen.getByLabelText("Raw record").textContent).toBe(JSON.stringify(rows[0]!.record, null, 2));
    fireEvent.click(screen.getByRole("tab", { name: `http ${rows.length}` }));
    expect(await screen.findByText("https://api.example.com/v1/cycles/run")).toBeInTheDocument();
    expect(screen.queryByLabelText("Raw record")).not.toBeInTheDocument();
  });

  it("renders every capture stream separately and retains the selected tab in the URL", async () => {
    window.history.replaceState(null, "", "/?feedView=capture:ticks");
    const rows = ["first", "second"].map((stream, index) => ({
      runId: "example", kind: "ticks", stream, seq: 1,
      timestamp: null, summary: stream, record: { tick: index + 1, label: `${stream} tick` },
    }));
    render(<TraceFeed kinds={["ticks"]} loadPage={async () => ({ rows, nextCursor: "" })} />);
    expect(await screen.findByText("first tick")).toBeInTheDocument();
    expect(await screen.findByText("second tick")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Raw stream" }));
    expect(new URLSearchParams(window.location.search).get("feedView")).toBe("raw");
  });

  it("renders one tab per armed kind that shows only that kind's captures", async () => {
    const rows = [
      { runId: "example", kind: "ticks", stream: "clock", seq: 1, timestamp: null, summary: "tick", record: { label: "clock tick" } },
      { runId: "example", kind: "tocks", stream: "clock", seq: 2, timestamp: null, summary: "tock", record: { label: "clock tock" } },
    ];
    render(<TraceFeed kinds={["ticks", "tocks", "idle"]} loadPage={async () => ({ rows, nextCursor: "" })} />);
    expect((await screen.findAllByRole("tab")).map(tab => tab.textContent)).toEqual(["Event stream", "ticks1", "tocks1", "idle", "Raw stream"]);
    fireEvent.click(screen.getByRole("tab", { name: "tocks 1" }));
    expect(await screen.findByText("clock tock")).toBeInTheDocument();
    expect(screen.queryByText("clock tick")).not.toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("feedView")).toBe("capture:tocks");
    fireEvent.click(screen.getByRole("tab", { name: "idle" }));
    expect(screen.getByText("Waiting for idle records")).toBeInTheDocument();
  });

  it("keeps controls visible for empty captures and requests the next server page", async () => {
    const loadPage = vi.fn().mockResolvedValueOnce({ rows: [], nextCursor: "next-page" }).mockResolvedValue({ rows: [], nextCursor: "" });
    render(<TraceFeed kinds={["http"]} loadPage={loadPage} />);
    expect(screen.getByLabelText("Capture")).toBeTruthy();
    expect(screen.getByLabelText("Order")).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    await vi.waitFor(() => expect(loadPage).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: "next-page" }), expect.any(AbortSignal)));
  });

  it("replays records published while the initial page loads and deduplicates overlapping records", async () => {
    const record = (seq: number, summary: string): TraceFeedRecord => ({ runId: "example", kind: "logs", stream: "app", seq, timestamp: null, summary, record: {} });
    const snapshot = record(1, "In the snapshot");
    const records = [snapshot];
    const resumeToken = "snapshot-position";
    const { promise, resolve } = Promise.withResolvers<TraceFeedPage>();
    const loadPage = vi.fn(() => promise);
    const follow = vi.fn(({ resume, onRecord }: { resume?: string; onRecord: (row: TraceFeedRecord) => void }) => {
      if (resume === resumeToken) records.forEach(onRecord);
      return () => {};
    });
    render(<TraceFeed kinds={["logs"]} loadPage={loadPage} follow={follow} />);
    expect(loadPage).toHaveBeenCalledOnce();
    expect(follow).not.toHaveBeenCalled();

    const gapRecord = record(2, "Between snapshot and subscription");
    records.push(gapRecord);
    await act(async () => resolve({ rows: [snapshot], nextCursor: "older-page", resume: resumeToken }));

    expect(follow).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ resume: resumeToken }));
    expect(screen.getAllByRole("button", { name: /snapshot|subscription/ }).map(row => row.textContent)).toEqual([
      `—${snapshot.summary}`,
      `—${gapRecord.summary}`,
    ]);
  });

  it("reports a missing snapshot token without starting a live-only subscription", async () => {
    const follow = vi.fn(() => () => {});
    render(<TraceFeed kinds={["logs"]} loadPage={async () => ({ rows: [], nextCursor: "" })} follow={follow} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Trace feed page is missing a resume token");
    expect(follow).not.toHaveBeenCalled();
  });

  it("ignores events from a closed follow subscription while paused and after resuming", async () => {
    const resume = "snapshot-position";
    const loadPage = vi.fn(async () => ({ rows: [], nextCursor: "", resume }));
    const close = vi.fn();
    const follow = vi.fn<NonNullable<TraceFeedProps["follow"]>>(() => close);
    render(<TraceFeed kinds={["logs"]} loadPage={loadPage} follow={follow} />);
    await vi.waitFor(() => expect(follow).toHaveBeenCalledOnce());
    const original = follow.mock.calls[0]![0];
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(close).toHaveBeenCalledOnce();
    act(() => original.onEnd());

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(follow).toHaveBeenCalledTimes(2);
    expect(follow).toHaveBeenLastCalledWith(expect.objectContaining({ resume }));
    expect(loadPage).toHaveBeenCalledOnce();

    const current = follow.mock.calls[1]![0];
    const record = { runId: "example", kind: "logs", stream: "app", seq: 1, timestamp: null, summary: "Current event", record: {} };
    act(() => {
      original.onRecord({ ...record, seq: 2, summary: "Closed stream event" });
      original.onError(new Error("Closed stream failure"));
      current.onRecord(record);
    });
    expect(screen.getByText(record.summary)).toBeInTheDocument();
    expect(screen.queryByText("Closed stream event")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows UTC timestamps for mixed events and strips ANSI record prefixes while retaining message styles", async () => {
    const rows = [
      { runId: "example", kind: "logs", stream: "app", seq: 1, timestamp: "2026-11-08T14:00:02.123+02:00", summary: "worker ready", ansi: "\u001b[90mlogs #1\u001b[0m \u001b[90m14:00:02.123\u001b[0m \u001b[32mworker ready\u001b[0m", record: {} },
      { runId: "example", kind: "http", stream: "proxy", seq: 9, timestamp: "2026-11-08T12:00:01Z", summary: "request completed", ansi: "\u001b[90mhttp #9\u001b[0m \u001b[31mrequest completed\u001b[0m", record: {} },
      { runId: "example", kind: "llm", stream: "api", seq: 2, timestamp: null, summary: "response", ansi: "\u001b[32mresponse\u001b[0m", record: {} },
    ];
    render(<TraceFeed kinds={["logs", "http", "llm"]} presentation="ansi" loadPage={async () => ({ rows, nextCursor: "" })} />);
    const log = await screen.findByRole("log", { name: "Trace events" });
    await vi.waitFor(() => expect([...log.querySelectorAll("button")].map((row) => row.textContent)).toEqual([
      "12:00:01.000 UTCrequest completed",
      "12:00:02.123 UTCworker ready",
      "—response",
    ]));
    expect(log.querySelector("time")).toHaveAttribute("datetime", rows[1]!.timestamp);
    expect(screen.getByLabelText("Timestamp unavailable")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Event stream" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("request completed")).toHaveStyle({ color: "#cd3131" });
  });

  it.each([
    { name: "record prefix", ansi: "\u001b[90mlogs #1\u001b[32m ready\u001b[0m", color: "rgb(13, 188, 121)", fontWeight: "" },
    { name: "record and clock prefixes", ansi: "\u001b[1;90mlogs #1 \u001b[90m12:00:00.000\u001b[32m ready\u001b[0m", color: "rgb(13, 188, 121)", fontWeight: "bold" },
    { name: "clock reset", ansi: "\u001b[1;90mlogs #1 \u001b[32m12:00:00.000\u001b[0m ready", color: "", fontWeight: "" },
    { name: "message override", ansi: "\u001b[1;90mlogs #1\u001b[32m \u001b[22;31mready\u001b[0m", color: "rgb(205, 49, 49)", fontWeight: "" },
  ])("renders the expected ANSI style for $name", async ({ ansi, color, fontWeight }) => {
    const rows = [{ runId: "example", kind: "logs", stream: "app", seq: 1, timestamp: "2026-11-22T12:00:00Z", summary: "ready", ansi, record: {} }];
    render(<TraceFeed kinds={["logs"]} presentation="ansi" loadPage={async () => ({ rows, nextCursor: "" })} />);
    const message = await screen.findByText("ready");
    expect({ color: message.style.color, fontWeight: message.style.fontWeight }).toEqual({ color, fontWeight });
  });
});
