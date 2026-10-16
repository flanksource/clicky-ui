import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { goProfileRecords, httpExchangeRows, processNodeRows, stackRecords, traceWindows } from "./fixtures";
import { TraceWindowList, type TraceWindowListProps } from "./TraceWindowList";
import type { TraceRow } from "./types";

const [httpWindow, processWindow] = traceWindows as [(typeof traceWindows)[0], (typeof traceWindows)[0]];

function props(overrides: Partial<TraceWindowListProps> = {}): TraceWindowListProps {
  return {
    windows: traceWindows,
    resolve: () => ({ mount: "/query/run-1" }),
    formats: (kind) => (kind === "http_proxy" ? [{ name: "har" }, { name: "jsonl" }] : []),
    fetchRecords: (window) => Promise.resolve((window.kind === "process_tree" ? processNodeRows : httpExchangeRows) as unknown as TraceRow[]),
    exportUrl: (window, format) => `/export/${window.kind}.${format}`,
    openUrl: (window) => `/open/${window.kind}?after=${window.afterSeq ?? 0}`,
    ...overrides,
  };
}

const row = (kind: string) => {
  const element = document.querySelector<HTMLElement>(`[data-trace-kind="${kind}"]`);
  if (!element) throw new Error(`no row for ${kind}`);
  return within(element);
};

afterEach(() => vi.restoreAllMocks());

describe("TraceWindowList", () => {
  it("shows each window's kind and its record count, singular for one", () => {
    render(<TraceWindowList {...props()} />);
    expect(row("http_proxy").getByText("2 records")).toBeInTheDocument();
    expect(row("process_tree").getByText("1 record")).toBeInTheDocument();
  });

  it("shows at most six scalar summary chips, never the count", () => {
    render(<TraceWindowList {...props()} />);
    const chips = document.querySelectorAll('[data-trace-kind="http_proxy"] [data-summary-chip]');
    expect([...chips].map((chip) => chip.getAttribute("data-summary-chip"))).toEqual([
      "hosts",
      "errors",
      "bytesIn",
      "bytesOut",
      "p95Ms",
      "slowest",
    ]);
  });

  it("skips non-scalar summary values", () => {
    const windows = [{ ...httpWindow, summary: { nested: { a: 1 }, list: [1], ok: true } }];
    render(<TraceWindowList {...props({ windows })} />);
    expect([...document.querySelectorAll("[data-summary-chip]")].map((chip) => chip.getAttribute("data-summary-chip"))).toEqual(["ok"]);
  });

  it("links to the query app at the window and offers an export per format", () => {
    render(<TraceWindowList {...props()} />);
    const http = row("http_proxy");
    expect(http.getByRole("link", { name: "Open in query" })).toHaveAttribute("href", "/open/http_proxy?after=0");
    expect(http.getByRole("link", { name: "HAR" })).toHaveAttribute("href", "/export/http_proxy.har");
    expect(http.getByRole("link", { name: "HAR" })).toHaveAttribute("download");
    expect(http.getByRole("link", { name: "JSONL" })).toHaveAttribute("href", "/export/http_proxy.jsonl");
    expect(row("process_tree").queryByRole("link", { name: "HAR" })).not.toBeInTheDocument();
  });

  it("shows a window's read error", () => {
    render(<TraceWindowList {...props({ windows: [{ ...httpWindow, error: "stream missing" }] })} />);
    expect(screen.getByText("stream missing")).toBeInTheDocument();
  });

  describe("unavailable store", () => {
    it("explains once per reason and offers no links or View for windows it cannot open", () => {
      render(
        <TraceWindowList {...props({ resolve: () => ({ unavailable: "run-1 was pruned" }) })} />,
      );
      expect(screen.getAllByText("run-1 was pruned")).toHaveLength(1);
      expect(screen.queryByRole("link", { name: "Open in query" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "View" })).not.toBeInTheDocument();
    });

    it("uses a default reason when the run says none", () => {
      render(<TraceWindowList {...props({ resolve: () => ({}) })} />);
      expect(screen.getByText(/trace store is not served/)).toBeInTheDocument();
    });

    it("lists distinct reasons separately and none for served runs", () => {
      const windows = [httpWindow, { ...processWindow, run_id: "run-2" }];
      const resolve = vi.fn((w: (typeof windows)[number]) => (w.run_id === "run-1" ? { mount: "/query/run-1" } : { unavailable: "run-2 was pruned" }));
      render(<TraceWindowList {...props({ windows, resolve })} />);
      expect(screen.getAllByRole("status")).toHaveLength(1);
      expect(screen.getByText("run-2 was pruned")).toBeInTheDocument();
      expect(row("http_proxy").getByRole("button", { name: "View" })).toBeInTheDocument();
    });
  });

  describe("inline viewer", () => {
    it("loads the window's records on View, renders them with the kind's viewer, and hides again", async () => {
      const fetchRecords = vi.fn(props().fetchRecords);
      render(<TraceWindowList {...props({ fetchRecords })} />);
      fireEvent.click(row("process_tree").getByRole("button", { name: "View" }));
      expect(row("process_tree").getByText("Loading records...")).toBeInTheDocument();
      expect(await row("process_tree").findByText("orphan")).toBeInTheDocument();
      expect(fetchRecords).toHaveBeenCalledWith(processWindow, expect.any(AbortSignal));
      fireEvent.click(row("process_tree").getByRole("button", { name: "Hide" }));
      expect(row("process_tree").queryByText("orphan")).not.toBeInTheDocument();
    });

    it.each([
      { kind: "goprof", records: goProfileRecords, format: "pprof", shown: () => screen.findByRole("combobox", { name: "Profile checkpoint" }) },
      { kind: "stacks", records: stackRecords, format: "jsonl", shown: () => screen.findByText("g22") },
    ])("opens a $kind window in its own viewer and keeps its $format export link", async ({ kind, records, format, shown }) => {
      const window = { kind, stream: "step-1", run_id: "run-1", count: records.length };
      render(
        <TraceWindowList
          {...props({
            windows: [window],
            formats: () => [{ name: format }],
            fetchRecords: () => Promise.resolve(records as unknown as TraceRow[]),
          })}
        />,
      );
      expect(row(kind).getByRole("link", { name: format.toUpperCase() })).toHaveAttribute("href", `/export/${kind}.${format}`);
      fireEvent.click(row(kind).getByRole("button", { name: "View" }));
      expect(await shown()).toBeInTheDocument();
      expect(row(kind).queryByRole("alert")).toBeNull();
    });

    it("shows a failed read instead of the viewer", async () => {
      render(<TraceWindowList {...props({ fetchRecords: () => Promise.reject(new Error("store offline")) })} />);
      fireEvent.click(row("http_proxy").getByRole("button", { name: "View" }));
      expect(await row("http_proxy").findByRole("alert")).toHaveTextContent("store offline");
    });

    it("aborts the read when the window is hidden before it finishes", () => {
      let signal!: AbortSignal;
      const fetchRecords = (_window: unknown, s: AbortSignal) => {
        signal = s;
        return new Promise<TraceRow[]>(() => {});
      };
      render(<TraceWindowList {...props({ fetchRecords })} />);
      fireEvent.click(row("http_proxy").getByRole("button", { name: "View" }));
      fireEvent.click(row("http_proxy").getByRole("button", { name: "Hide" }));
      expect(signal.aborted).toBe(true);
    });

    it("contains a viewer that refuses its records, leaving the rest of the list intact", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const malformed = [{ not: "an exchange" }] as TraceRow[];
      render(<TraceWindowList {...props({ fetchRecords: () => Promise.resolve(malformed) })} />);
      fireEvent.click(row("http_proxy").getByRole("button", { name: "View" }));
      expect(await row("http_proxy").findByRole("alert")).toHaveTextContent('trace kind "http_proxy" row 0 has no "request"');
      expect(row("process_tree").getByText("1 record")).toBeInTheDocument();
    });
  });

  it("shows a list-level error", () => {
    render(<TraceWindowList {...props({ error: "export formats unavailable" })} />);
    expect(screen.getByText("export formats unavailable")).toBeInTheDocument();
  });
});
