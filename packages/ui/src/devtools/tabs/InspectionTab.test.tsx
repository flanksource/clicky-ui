import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DebugClient } from "../debugClient";
import type { ExecutionDetail, ExecutionSummary } from "../types";
import { InspectionTab } from "./InspectionTab";

const record: ExecutionSummary = {
  id: "selected-run",
  sequence: 1,
  source: { surface: "sample" },
  startedAt: "2026-08-23T10:00:00Z",
  durationMs: 20,
  rows: 1,
  level: "debug",
  operations: [
    {
      index: 1,
      provider: "postgres",
      connection: "connection://analytics",
      query: "SELECT region FROM events",
      durationMs: 20,
      rows: 1,
    },
  ],
  counts: {
    operations: 1,
    harEntries: 0,
    harDropped: 0,
    logLines: 0,
    logDropped: 0,
    probes: 0,
    inspections: 0,
  },
};

function detail(overrides: Partial<ExecutionDetail> = {}): ExecutionDetail {
  return {
    summary: record,
    operations: [
      {
        provider: "postgres",
        request: {
          query: 'SELECT region FROM events LIMIT 1',
          rendered: "SELECT region FROM events",
          connection: "connection://analytics",
          options: { database: "analytics" },
        },
      },
    ],
    ...overrides,
  };
}

describe("InspectionTab", () => {
  it("manually runs the selected operation and shows its cardinality result", async () => {
    const client = new DebugClient();
    vi.spyOn(client, "detail").mockResolvedValue(detail());
    vi.spyOn(client, "inspection").mockResolvedValue({ caches: [] });
    const run = vi.spyOn(client, "runInspection").mockResolvedValue(
      detail({
        inspections: [
          {
            policy: "column-cardinality",
            key: "region-count",
            elapsedMs: 14,
            cached: false,
            state: "fresh",
            ageMs: 0,
          },
        ],
        probes: [
          {
            provider: "postgres",
            connection: "connection://analytics",
            column: "region",
            distinct: 7,
            limit: 50,
            kind: "list",
            cached: false,
          },
        ],
      }),
    );

    render(<InspectionTab record={record} client={client} />);

    expect(await screen.findByText("postgres · connection://analytics")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Columns to inspect"), {
      target: { value: "region" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run inspection" }));

    await waitFor(() =>
      expect(run).toHaveBeenCalledWith({
        provider: "postgres",
        connection: "connection://analytics",
        query: "SELECT region FROM events",
        options: { database: "analytics" },
        columns: ["region"],
        refresh: true,
      }),
    );
    expect(await screen.findByText("Column cardinality")).toBeInTheDocument();
    expect(screen.getByText("region")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("list")).toBeInTheDocument();
  });
});
