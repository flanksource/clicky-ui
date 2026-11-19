import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskManager } from "./TaskManager";
import type { TaskRunMeta } from "./TaskSnapshot";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const PHONE_WIDTH = 390;
const DESKTOP_WIDTH = 1280;

function run(id: string, startedAgoMs: number, durationMs: number): TaskRunMeta {
  const started = Date.now() - startedAgoMs;
  return {
    id,
    name: "Commit gavel",
    kind: "gavel-commit",
    status: "success",
    labels: { project: "gavel" },
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(started + durationMs).toISOString(),
    total: 1,
    completed: 1,
    failed: 0,
    running: 0,
  };
}

const RUNS = [run("recent", 5 * MINUTE, 3_940), run("older", 2 * HOUR, 62_000)];

const POOL: Record<string, number> = {
  "pool:workers-busy": 1,
  "pool:workers-limit": 4,
  "pool:slots-used": 1,
  "pool:slots-capacity": 4,
  "pool:queued": 0,
  "pool:supervisors": 0,
};

function stubFetch() {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://x.test");
    const metric = url.pathname.split("/tasks/metrics/")[1];
    if (metric) {
      const id = decodeURIComponent(metric);
      return { ok: true, json: async () => ({ id, points: [{ at: new Date().toISOString(), value: POOL[id] ?? 0 }] }) } as Response;
    }
    return { ok: true, json: async () => RUNS } as Response;
  }));
}

function stubWidth(width: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
}

function renderManager() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return render(<QueryClientProvider client={client}><TaskManager basePath="/api/v1" /></QueryClientProvider>);
}

function items(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-list-item]"));
}

describe("TaskManager at phone width", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", undefined);
    stubFetch();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lists runs with one status icon and a meta line that tells repeated names apart", async () => {
    stubWidth(PHONE_WIDTH);
    renderManager();

    await screen.findAllByText("Commit gavel");
    expect(screen.queryByRole("columnheader", { name: /Status/ })).not.toBeInTheDocument();
    const [recent, older] = items();
    expect(within(recent!).getAllByRole("img", { name: "success" })).toHaveLength(1);
    expect(within(recent!).getByRole("img", { name: "success" })).toHaveAttribute("title", "success");
    expect(within(recent!).queryByText(/^success$/i)).not.toBeInTheDocument();
    expect(meta(recent!)).toEqual({ duration: "3.9s", startedAt: "5m" });
    expect(meta(older!)).toEqual({ duration: "1m 2s", startedAt: "2h" });
  });

  it("folds the pool gauges into a summary on the toolbar row that expands to the gauges", async () => {
    stubWidth(PHONE_WIDTH);
    renderManager();

    const toggle = await screen.findByRole("button", { name: "Worker pool: 1 busy · 1 slot · 0 queued · 0 supervisors" });
    expect(toggle.closest("[data-slot='filter-bar']")).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region", { name: "Worker pool" })).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Worker pool" })).toBeInTheDocument();
  });

  it("shows the stream status as a titled dot rather than a word", async () => {
    stubWidth(PHONE_WIDTH);
    renderManager();
    await screen.findAllByText("Commit gavel");

    const dot = screen.getByRole("img", { name: /^Task stream: / });
    expect(dot.closest("[data-slot='filter-bar']")).not.toBeNull();
    expect(dot.getAttribute("title")).toBe(dot.getAttribute("aria-label"));
  });

  it("keeps the desktop table, gauges and status text above the breakpoint", async () => {
    stubWidth(DESKTOP_WIDTH);
    renderManager();

    await screen.findAllByText("Commit gavel");
    expect(items()).toHaveLength(0);
    expect(screen.getByRole("columnheader", { name: /Status/ })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Worker pool" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Worker pool/ })).not.toBeInTheDocument();
  });
});

function meta(item: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    Array.from(item.querySelectorAll<HTMLElement>("[data-list-meta]")).map((node) => [
      node.dataset.listMeta,
      node.querySelector("[data-list-meta-value]")?.textContent ?? "",
    ]),
  );
}
