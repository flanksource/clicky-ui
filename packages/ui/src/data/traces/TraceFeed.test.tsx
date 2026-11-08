import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TraceFeed } from "./TraceFeed";
import { httpExchangeRows } from "./fixtures";

beforeEach(() => window.history.replaceState(null, "", "/"));

describe("TraceFeed", () => {
	 it("lets a host supply capture presentation while keeping its raw records on demand", async () => {
    window.history.replaceState(null, "", "/?feedView=captures");
    const rows = [{ runId: "example", kind: "process", stream: "capture", seq: 1, timestamp: null, summary: "raw process", record: { pid: 123 } }];
    render(<TraceFeed kinds={["process"]} loadPage={async () => ({ rows, nextCursor: "" })} renderCapture={() => <p>Process tree</p>} />);
    expect(await screen.findByText("Process tree")).toBeInTheDocument();
    expect(screen.queryByText("raw process")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Raw stream" }));
    expect(await screen.findByText("raw process")).toBeInTheDocument();
    expect(screen.queryByText("Process tree")).not.toBeInTheDocument();
  });
  it("opens the kind-specific renderer with all page records before the raw stream is requested", async () => {
    window.history.replaceState(null, "", "/?feedView=captures");
    const rows = httpExchangeRows.map((record, index) => ({
      runId: "example", kind: "http", stream: "proxy", seq: index + 1,
      timestamp: null, summary: `raw exchange ${index + 1}`, record,
    }));
    render(<TraceFeed kinds={["http"]} loadPage={async () => ({ rows, nextCursor: "" })} />);
    expect(await screen.findByText("https://api.example.com/v1/cycles/run")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Captures" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("columnheader", { name: /Seq/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Raw stream" }));
    expect(await screen.findByText("raw exchange 1")).toBeInTheDocument();
    expect(screen.queryByText("https://api.example.com/v1/cycles/run")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("raw exchange 1"));
    expect(screen.getByLabelText("Raw record").textContent).toBe(JSON.stringify(rows[0]!.record, null, 2));
    fireEvent.click(screen.getByRole("tab", { name: "Captures" }));
    expect(await screen.findByText("https://api.example.com/v1/cycles/run")).toBeInTheDocument();
    expect(screen.queryByLabelText("Raw record")).not.toBeInTheDocument();
  });

  it("renders every capture stream separately and retains the selected tab in the URL", async () => {
    window.history.replaceState(null, "", "/?feedView=captures");
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

  it("keeps controls visible for empty captures and requests the next server page", async () => {
    const loadPage = vi.fn().mockResolvedValueOnce({ rows: [], nextCursor: "next-page" }).mockResolvedValue({ rows: [], nextCursor: "" });
    render(<TraceFeed kinds={["http"]} loadPage={loadPage} />);
    expect(screen.getByLabelText("Capture")).toBeTruthy();
    expect(screen.getByLabelText("Order")).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));
    await vi.waitFor(() => expect(loadPage).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: "next-page" }), expect.any(AbortSignal)));
  });

  it("defaults to one mixed stream ordered by timestamp and retains ANSI styles", async () => {
    const rows = [
      { runId: "example", kind: "sql", stream: "db", seq: 1, timestamp: "2026-11-08T12:00:02Z", summary: "query completed", ansi: "\u001b[31mquery completed\u001b[0m", record: {} },
      { runId: "example", kind: "http", stream: "proxy", seq: 9, timestamp: "2026-11-08T12:00:01Z", summary: "request completed", ansi: "\u001b[32mrequest completed\u001b[0m", record: {} },
    ];
    render(<TraceFeed kinds={["sql", "http"]} presentation="ansi" loadPage={async () => ({ rows, nextCursor: "" })} />);
    const log = await screen.findByRole("log", { name: "Trace events" });
    await vi.waitFor(() => expect(log.textContent).toBe("request completedquery completed"));
    expect(screen.getByRole("tab", { name: "Event stream" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("query completed")).toHaveStyle({ color: "#cd3131" });
  });
});
