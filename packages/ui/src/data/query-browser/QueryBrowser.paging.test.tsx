import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  registerDebugConsole,
  type DebugConsoleRequest,
} from "../debugConsoleSignal";
import { QueryBrowser } from "./QueryBrowser";
import { QueryBrowserExecutionError } from "./QueryBrowser.types";

describe("QueryBrowser paging and provider diagnostics", () => {
  beforeEach(() => window.localStorage.clear());

  // "Debug" used to re-execute the query with a flag so the backend would
  // describe itself, which meant the diagnostics belonged to a *different* run
  // from the rows on screen. It now reveals the console, which already holds
  // the record for the run that produced them — so the query runs exactly once.
  it("reveals the console instead of running the query a second time", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [{ answer: 42 }] });
    const revealed: DebugConsoleRequest[] = [];
    const unregister = registerDebugConsole((request) => revealed.push(request));

    render(
      <QueryBrowser
        id="db-debug"
        initialQuery="SELECT 42"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith({ query: "SELECT 42", options: {} }),
    );
    await screen.findByRole("table");

    fireEvent.click(screen.getByRole("button", { name: "Open column menu" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /^Debug$/ }));

    await waitFor(() => expect(revealed).toEqual([{ tab: "queries" }]));
    expect(execute).toHaveBeenCalledTimes(1);
    unregister();
  });

  // Absent, not inert: a menu item that silently does nothing reads as broken,
  // while its absence reads as a feature this app does not have. Debug is the
  // browser's only menu action, so with no console the whole menu goes with it.
  it("offers no Debug affordance where no console is mounted", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [{ answer: 42 }] });
    render(
      <QueryBrowser
        id="db-no-console"
        initialQuery="SELECT 42"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await screen.findByRole("table");

    expect(screen.queryByRole("button", { name: "Open column menu" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /^Debug$/ })).toBeNull();
  });

  it("pages an offset result by re-running the last executed request", async () => {
    const execute = vi.fn().mockResolvedValue({
      rows: [{ answer: 42 }],
      pagination: {
        mode: "offset",
        limit: 25,
        offset: 0,
        hasMore: true,
        total: 60,
        totalRelation: "eq",
        consistency: "live",
      },
    });
    render(
      <QueryBrowser
        id="db-offset"
        initialQuery="SELECT 42"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next page" }));

    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({
        query: "SELECT 42",
        options: {},
        pagination: { limit: 25, offset: 25 },
      }),
    );
  });

  it("uses provider cursors for next and the remembered cursor for previous", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ id: 1 }],
        pagination: {
          mode: "cursor",
          limit: 25,
          nextCursor: "page-2",
          hasMore: true,
          totalRelation: "unknown",
          consistency: "live",
        },
      })
      .mockResolvedValueOnce({
        rows: [{ id: 2 }],
        pagination: {
          mode: "cursor",
          limit: 25,
          cursor: "page-2",
          nextCursor: "page-3",
          hasMore: true,
          totalRelation: "unknown",
          consistency: "live",
        },
      })
      .mockResolvedValueOnce({
        rows: [{ id: 1 }],
        pagination: {
          mode: "cursor",
          limit: 25,
          nextCursor: "page-2",
          hasMore: true,
          totalRelation: "unknown",
          consistency: "live",
        },
      });
    render(
      <QueryBrowser
        id="db-cursor"
        initialQuery="SELECT id FROM events ORDER BY id"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next page" }));
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({
        query: "SELECT id FROM events ORDER BY id",
        options: {},
        pagination: { limit: 25, cursor: "page-2" },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({
        query: "SELECT id FROM events ORDER BY id",
        options: {},
        pagination: { limit: 25 },
      }),
    );
  });

  it("renders provider diagnostics returned with an execution error", async () => {
    const execute = vi.fn().mockRejectedValue(
      new QueryBrowserExecutionError("query failed", {
        provider: "clickhouse",
        request: { query: "SELECT broken FROM source" },
        response: { details: { queryId: "failed-query" } },
        error: "unknown identifier broken",
      }),
    );
    render(
      <QueryBrowser
        id="db-debug-error"
        initialQuery="SELECT broken"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(await screen.findByText("query failed")).toBeInTheDocument();
    expect(screen.getByLabelText("Provider query")).toHaveTextContent("source");
    expect(
      within(screen.getByLabelText("Provider response")).getByText(
        /failed-query/,
      ),
    ).toBeVisible();
  });

  it("renders Oops context returned with an execution error", async () => {
    const execute = vi.fn().mockRejectedValue(
      new QueryBrowserExecutionError("query failed", undefined, {
        message: "query failed",
        trace: "trace-query-1",
        time: "2026-08-11T12:00:00Z",
        context: [["connection", "tenant-x"]],
        stacktrace: "query failed\n--- at example/query.go:42 runQuery",
      }),
    );
    render(
      <QueryBrowser
        id="oops-error"
        initialQuery="SELECT broken"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    const details = (
      await screen.findByRole("button", { name: "Copy error details" })
    ).closest("details");
    expect(details).not.toBeNull();

    fireEvent.click(within(details!).getByText("More details"));
    expect(within(details!).getByText("trace-query-1")).toBeVisible();
    expect(within(details!).getByText("tenant-x")).toBeVisible();
    expect(within(details!).getByText("SELECT broken")).toBeVisible();
    expect(within(details!).getByText(/example\/query\.go:42/)).toBeVisible();
  });
});
