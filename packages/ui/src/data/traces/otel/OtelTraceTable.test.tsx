import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ClickyNode } from "../../Clicky";
import { OtelTraceTable } from "./OtelTraceTable";
import { profileListingSort, profileTraceListing } from "./profile-listing";
import { traceExample } from "./fixtures";

afterEach(cleanup);
const props = { spans: traceExample.spans, onSelectTrace: vi.fn(), onSelectSpan: vi.fn(), traceHref: (id: string) => `?trace=${id}` };

it("opens a trace from loaded spans and keeps the partial-result notice", () => {
  render(<OtelTraceTable {...props} />);
  expect(screen.getByText(/Filters and paging can leave traces incomplete/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: /POST \/orders/ }));
  expect(props.onSelectTrace).toHaveBeenCalledWith(traceExample.summary.traceId);
});

it("shows the selected span and allows returning to the trace list", () => {
  render(<OtelTraceTable {...props} selectedTraceId={traceExample.summary.traceId} selectedSpanId="model" />);
  expect(screen.getByRole("heading", { name: "chat example-model" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Back to traces" }));
  expect(props.onSelectTrace).toHaveBeenCalledWith();
});

it("retains server search controls with no rows", () => {
  render(<OtelTraceTable {...props} spans={[]} externalSearch={{ value: "missing", onChange: vi.fn(), placeholder: "Search spans" }} />);
  expect(screen.getByPlaceholderText("Search spans")).toHaveValue("missing");
});

it("gives server-filterable listing cells include/exclude actions keyed on the server value", () => {
  vi.useFakeTimers();
  const service = traceExample.summary.service;
  const rows = traceExample.spans.map(span => ({ _trace: span, service: span.service }));
  const table: ClickyNode = {
    kind: "table",
    columns: [{ name: "service", label: "Service", filterKey: "filter.service" }],
    rows: rows.map(row => ({ cells: { service: { kind: "text", text: row.service.toUpperCase(), plain: row.service.toUpperCase(), filterValue: row.service } } })),
  };
  const onCellFilterChange = vi.fn();
  render(<OtelTraceTable {...props} listing={profileTraceListing(rows, table)} onCellFilterChange={onCellFilterChange} />);
  fireEvent.mouseEnter(screen.getByText(service.toUpperCase()).closest("span.relative")!);
  act(() => vi.advanceTimersByTime(150));
  fireEvent.click(screen.getByRole("button", { name: `Exclude ${service}` }));
  expect(onCellFilterChange).toHaveBeenCalledWith({ key: "filter.service", value: service, mode: "exclude" });
  vi.useRealTimers();
});

it("sorts the listing through the server's sort keys and keeps the server's row order", () => {
  const [first, second] = [
    { ...traceExample.spans[0]!, traceId: "a".repeat(32), spanId: "a-root", operation: "older first" },
    { ...traceExample.spans[0]!, traceId: "b".repeat(32), spanId: "b-root", operation: "newer second", startedAt: "2026-11-02T11:00:00Z" },
  ];
  const rows = [first, second].map(span => ({ _trace: span, operation: span.operation }));
  const table: ClickyNode = {
    kind: "table",
    columns: [{ name: "operation", label: "Operation", sortKey: "op_sort" }],
    rows: rows.map(row => ({ cells: { operation: { kind: "text", text: row.operation, plain: row.operation } } })),
  };
  const onServerSort = vi.fn();
  const sorting = profileListingSort(table, { value: { key: "op_sort", dir: "asc" }, onChange: onServerSort });
  render(<OtelTraceTable {...props} spans={[first, second]} listing={profileTraceListing(rows, table)} {...sorting} />);
  // spanTraces orders newest first; the listing keeps the rows as the server sent them.
  expect(screen.getAllByRole("row").slice(1).map(row => row.textContent)).toEqual([first.operation, second.operation]);
  // The server's ascending sort marks this column, so a click asks for descending.
  fireEvent.click(screen.getByRole("button", { name: /Operation/ }));
  expect(onServerSort).toHaveBeenCalledWith({ key: "op_sort", dir: "desc" });
});

const operationTable = (rows: { operation: string }[]): ClickyNode => ({
  kind: "table",
  columns: [{ name: "operation", label: "Operation" }],
  rows: rows.map(row => ({ cells: { operation: { kind: "text", text: row.operation, plain: row.operation } } })),
});

it("lists a trace at its parentless root even when an orphan span starts earlier", () => {
  const traceId = "c".repeat(32);
  const orphan = { ...traceExample.spans[0]!, traceId, spanId: "orphan", parentId: "missing", operation: "orphan first", startedAt: "2026-11-02T10:00:00Z" };
  const root = { ...traceExample.spans[0]!, traceId, spanId: "root-c", parentId: undefined, operation: "parentless root", startedAt: "2026-11-02T10:00:01Z" };
  const rows = [orphan, root].map(span => ({ _trace: span, operation: span.operation }));
  render(<OtelTraceTable {...props} spans={[orphan, root]} listing={profileTraceListing(rows, operationTable(rows))} />);
  expect(screen.getAllByRole("row").slice(1).map(row => row.textContent)).toEqual([root.operation]);
});

it("reports a trace whose root row is absent from the listing instead of throwing while rendering", () => {
  const rows = [{ _trace: { ...traceExample.spans[0]!, spanId: "unrelated" }, operation: "unrelated" }];
  render(<OtelTraceTable {...props} listing={profileTraceListing(rows, operationTable(rows))} />);
  expect(screen.getByRole("alert")).toHaveTextContent("is missing its mapped root row");
});

it("lets the listing fill a bounded parent so the table body scrolls under a pinned footer", () => {
  // jsdom has no layout; this pins the CSS contract that keeps the footer on screen.
  const rows = traceExample.spans.map(span => ({ _trace: span, operation: span.operation }));
  const table: ClickyNode = {
    kind: "table",
    columns: [{ name: "operation", label: "Operation" }],
    rows: rows.map(row => ({ cells: { operation: { kind: "text", text: row.operation, plain: row.operation } } })),
  };
  render(
    <OtelTraceTable
      {...props}
      listing={profileTraceListing(rows, table)}
      pagination={{ page: 0, pageSize: 10, total: rows.length, onPageChange: vi.fn(), onPageSizeChange: vi.fn() }}
    />,
  );
  const themeRoot = screen.getByRole("table").closest("[data-theme]");
  expect(themeRoot).toHaveClass("flex", "min-h-0", "flex-1", "flex-col");
  expect(themeRoot?.parentElement).toHaveClass("flex", "min-h-0", "flex-1", "flex-col");
});

it("shows how long the server took for the listing beside the filter bar", () => {
  const rows = traceExample.spans.map(span => ({ _trace: span, operation: span.operation }));
  const table: ClickyNode = {
    kind: "table",
    columns: [{ name: "operation", label: "Operation" }],
    rows: rows.map(row => ({ cells: { operation: { kind: "text", text: row.operation, plain: row.operation } } })),
  };
  render(
    <OtelTraceTable
      {...props}
      listing={profileTraceListing(rows, table)}
      externalSearch={{ value: "", onChange: vi.fn(), placeholder: "Search spans" }}
      serverTiming={[
        { name: "total", duration: 1200, counters: {} },
        { name: "provider", duration: 1150, counters: { rows: 100 } },
      ]}
    />,
  );
  const badge = screen.getByRole("button", { name: "Show server timing" });
  expect(badge).toHaveTextContent("1.2 s");
  expect(screen.getByPlaceholderText("Search spans").closest("[data-slot='filter-bar']")).toContainElement(badge);
});

const traceId = traceExample.summary.traceId;
const waterfallRowIds = () => Array.from(document.querySelectorAll<HTMLElement>("[data-row-id]")).map(row => row.dataset.rowId);

it("opens the trace from its own fetch, not from the listing rows the filters left", () => {
  render(<OtelTraceTable {...props} spans={[]} selectedTraceId={traceId} openTrace={{ spans: traceExample.spans, total: traceExample.spans.length, loading: false }} />);
  expect(screen.getByRole("heading", { level: 2, name: /POST \/orders/ })).toBeInTheDocument();
  expect(screen.queryByText(/not in the loaded rows/)).toBeNull();
  expect(screen.queryByText(/Filters and paging can leave traces incomplete/)).toBeNull();
});

it("pages a large trace: reports how many spans are loaded and asks for the next page", () => {
  const loaded = 3;
  const onLoadMore = vi.fn();
  render(<OtelTraceTable {...props} selectedTraceId={traceId} openTrace={{ spans: traceExample.spans.slice(0, loaded), total: traceExample.spans.length, loading: false, onLoadMore }} />);
  expect(screen.getByRole("status")).toHaveTextContent(`${loaded} of ${traceExample.spans.length} spans loaded`);
  fireEvent.click(screen.getByRole("button", { name: "Load more spans" }));
  expect(onLoadMore).toHaveBeenCalledOnce();
});

it("narrows the open trace to the spans the filters match, keeping their ancestors", () => {
  const filters = [{ key: "filter.duration_ms", kind: "text" as const, label: "Span duration", value: ">=10ms", onChange: vi.fn() }];
  render(
    <OtelTraceTable
      {...props}
      selectedTraceId={traceId}
      externalFilters={filters}
      openTrace={{ spans: traceExample.spans, total: traceExample.spans.length, loading: false, matchingSpanIds: new Set(["model"]) }}
    />,
  );
  expect(waterfallRowIds()).toEqual(["root", "model"]);
  expect(screen.getByRole("status")).toHaveTextContent(`1 of ${traceExample.spans.length} spans match`);
  expect(screen.getByText("Span duration").closest("[data-slot='filter-bar']")).toBeInTheDocument();
});

it("warns that a trace is incomplete while still showing the spans it has", () => {
  const warning = "The profile stopped returning spans after 3 of 5; this trace is incomplete.";
  render(<OtelTraceTable {...props} selectedTraceId={traceId} openTrace={{ spans: traceExample.spans.slice(0, 3), total: traceExample.spans.length, loading: false, warning }} />);
  expect(screen.getByRole("heading", { level: 2, name: /POST \/orders/ })).toBeInTheDocument();
  expect(screen.getByText(warning)).toBeInTheDocument();
  expect(screen.queryByText(/Cannot load trace/)).toBeNull();
});

it("reports a failed trace fetch instead of an empty waterfall", () => {
  render(<OtelTraceTable {...props} selectedTraceId={traceId} openTrace={{ spans: [], loading: false, error: "provider timed out" }} />);
  expect(screen.getByRole("alert")).toHaveTextContent("provider timed out");
});

it("reports invalid data instead of rendering a misleading trace", () => {
  render(<OtelTraceTable {...props} spans={[traceExample.spans[0]!, traceExample.spans[0]!]} />);
  expect(screen.getByRole("alert")).toHaveTextContent("duplicate span ids");
});
