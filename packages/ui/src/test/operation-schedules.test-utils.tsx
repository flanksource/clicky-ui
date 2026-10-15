import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, vi } from "vitest";
import { OperationSchedules } from "../rpc/OperationSchedules";
import type {
  OperationSchedule,
  OperationSchedulesProps,
} from "../rpc/operation-schedule-types";
import type { OperationLookupResponse, ResolvedOperation } from "../rpc/types";
import type { OperationsApiClient } from "../rpc/useOperations";

// Clicky documents a command's flags twice: as query parameters (the operation's
// own form) and as the JSON request body. The schedule dialog renders the
// parameters, so the fixtures carry both, as the real spec does.
export const scheduleOperations: ResolvedOperation[] = [
  {
    path: "/api/v1/maintenance/truncate",
    method: "post",
    operation: {
      operationId: "truncateCycles",
      summary: "Truncate cycle history",
      description: "Remove completed cycle runtime rows.",
      parameters: [
        {
          name: "batchSize",
          in: "query",
          description: "Rows per batch",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                batchSize: { type: "integer", description: "Rows per batch" },
              },
            },
          },
        },
      },
      "x-clicky": {
        command: "cycle/truncate",
        verb: "action",
        scope: "collection",
        toolHints: { destructiveHint: true },
        schedule: {
          suggestions: [
            {
              label: "Recommended",
              cron: "0 2 * * 0",
              description: "Weekly Sunday maintenance",
            },
          ],
        },
      },
    },
  },
  {
    path: "/api/v1/cycle/catch-up",
    method: "post",
    operation: {
      operationId: "cycleCatchUp",
      summary: "Cycle catch-up",
      parameters: [
        { name: "company", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "mode", in: "query", schema: { type: "string", enum: ["preview", "apply"] } },
        { name: "dry-run", in: "query", schema: { type: "boolean", default: false } },
        { name: "max-date-steps", in: "query", schema: { type: "integer", default: "30" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                company: { type: "string", format: "uuid" },
                mode: { type: "string" },
                "dry-run": { type: "boolean" },
                "max-date-steps": { type: "integer", default: "30" },
              },
            },
          },
        },
      },
      "x-clicky": {
        command: "cycle/catch-up",
        verb: "action",
        scope: "collection",
        supportsLookup: true,
        schedule: {},
      },
    },
  },
  {
    path: "/api/v1/maintenance/status",
    method: "get",
    operation: {
      operationId: "maintenanceStatus",
      summary: "Maintenance status",
      "x-clicky": { verb: "list", scope: "collection" },
    },
  },
];

export const savedSchedule: OperationSchedule = {
  id: "schedule-1",
  targets: ["dev", "qa"],
  name: "Weekly cleanup",
  operationId: "truncateCycles",
  args: { batchSize: 500 },
  cron: "0 2 * * 0",
  timezone: "UTC",
  enabled: true,
  nextRun: "2026-09-20T02:00:00Z",
};

const companyLookup: OperationLookupResponse = {
  filters: {
    company: {
      label: "Company",
      options: { "acme-regional": { kind: "text", text: "Acme Regional" } },
    },
  },
};

export function makeScheduleClient(): OperationsApiClient {
  return {
    getOpenAPISpec: vi.fn(async () => ({
      openapi: "3.0.0",
      info: { title: "test", version: "1" },
      paths: {},
    })),
    executeCommand: vi.fn(),
    lookupFilters: vi.fn(async () => companyLookup),
  };
}

export function scheduleHandlers() {
  return {
    onCreate: vi.fn(async () => undefined),
    onUpdate: vi.fn(async () => undefined),
    onDelete: vi.fn(async () => undefined),
    onRunSaved: vi.fn(async () => undefined),
    onRunDraft: vi.fn(async () => undefined),
    targetOptions: [{ value: "dev", label: "Development" }, { value: "qa", label: "QA" }],
    defaultTargets: ["dev", "qa"],
  };
}

export function renderSchedules(
  props: Omit<OperationSchedulesProps, "client"> & { client?: OperationsApiClient },
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OperationSchedules client={makeScheduleClient()} {...props} />
    </QueryClientProvider>,
  );
}

export async function pickOperation(label: string) {
  const dialog = screen.getByRole("dialog", { name: /schedule/i });
  const picker = within(dialog).getByRole("combobox", { name: "Operation" });
  fireEvent.click(picker);
  fireEvent.mouseDown(screen.getByRole("option", { name: new RegExp(label) }));
  await vi.waitFor(() => expect(picker).toHaveValue(label));
}
