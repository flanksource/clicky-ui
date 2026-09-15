import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OperationSchedules } from "./OperationSchedules";
import type { OperationSchedule } from "./operation-schedule-types";
import type { ResolvedOperation } from "./types";

const operations: ResolvedOperation[] = [
  {
    path: "/api/v1/maintenance/truncate",
    method: "post",
    operation: {
      operationId: "truncateCycles",
      summary: "Truncate cycle history",
      description: "Remove completed cycle runtime rows.",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                batchSize: { type: "integer", description: "Rows per batch" },
              },
              required: ["batchSize"],
            },
          },
        },
      },
      "x-clicky": {
        verb: "action",
        scope: "collection",
        toolHints: { destructiveHint: true },
        schedule: {
          suggestions: [
            { label: "Recommended", cron: "0 2 * * 0", description: "Weekly Sunday maintenance" },
          ],
        },
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

const schedule: OperationSchedule = {
  id: "schedule-1",
  name: "Weekly cleanup",
  operationId: "truncateCycles",
  args: { batchSize: 500 },
  cron: "0 2 * * 0",
  timezone: "UTC",
  enabled: true,
  nextRun: "2026-09-20T02:00:00Z",
};

function handlers() {
  return {
    onCreate: vi.fn(async () => undefined),
    onUpdate: vi.fn(async () => undefined),
    onDelete: vi.fn(async () => undefined),
    onRunSaved: vi.fn(async () => undefined),
    onRunDraft: vi.fn(async () => undefined),
  };
}

describe("OperationSchedules", () => {
  it("lists saved schedules and runs one after confirmation", async () => {
    const callbacks = handlers();
    render(
      <OperationSchedules
        operations={operations}
        schedules={[schedule]}
        {...callbacks}
      />,
    );

    expect(screen.getByText("Weekly cleanup")).toBeInTheDocument();
    expect(screen.getByText("Truncate cycle history")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Run Weekly cleanup now" }));
    const confirmation = screen.getByRole("dialog", { name: "Run Weekly cleanup now?" });
    await act(async () => {
      fireEvent.click(within(confirmation).getByRole("button", { name: "Run now" }));
    });

    await vi.waitFor(() => expect(callbacks.onRunSaved).toHaveBeenCalledWith("schedule-1"));
  });

  it("creates a schedule from a schedulable operation and its JSON schema", async () => {
    const callbacks = handlers();
    render(
      <OperationSchedules
        operations={operations}
        schedules={[]}
        {...callbacks}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    const dialog = screen.getByRole("dialog", { name: "Add schedule" });
    const scheduleName = within(dialog).getByRole("textbox", { name: "Schedule name" });
    const operationPicker = within(dialog).getByRole("combobox", { name: "Operation" });
    fireEvent.click(operationPicker);
    expect(screen.queryByRole("option", { name: /Maintenance status/ })).not.toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("option", { name: /Truncate cycle history/ }));
    await vi.waitFor(() => expect(operationPicker).toHaveValue("Truncate cycle history"));

    fireEvent.change(scheduleName, {
      target: { value: "Sunday cleanup" },
    });
    const batchSize = await screen.findByRole("textbox", { name: /batch/i });
    fireEvent.change(batchSize, {
      target: { value: "750" },
    });
    const cron = within(dialog).getByRole("combobox", { name: "Cron expression" });
    fireEvent.click(cron);
    fireEvent.mouseDown(screen.getByRole("option", { name: /Recommended/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });

    await vi.waitFor(() =>
      expect(callbacks.onCreate).toHaveBeenCalledWith({
        name: "Sunday cleanup",
        operationId: "truncateCycles",
        args: { batchSize: 750 },
        cron: "0 2 * * 0",
        timezone: expect.any(String),
        enabled: true,
      }),
    );
  });

  it("runs an unsaved dialog draft without creating a schedule", async () => {
    const callbacks = handlers();
    render(
      <OperationSchedules
        operations={operations}
        schedules={[]}
        {...callbacks}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    const dialog = screen.getByRole("dialog", { name: "Add schedule" });
    const operationPicker = within(dialog).getByRole("combobox", { name: "Operation" });
    fireEvent.click(operationPicker);
    fireEvent.mouseDown(screen.getByRole("option", { name: /Truncate cycle history/ }));
    await vi.waitFor(() => expect(operationPicker).toHaveValue("Truncate cycle history"));
    const batchSize = await screen.findByRole("textbox", { name: /batch/i });
    fireEvent.change(batchSize, {
      target: { value: "250" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run now" }));
    const confirmation = screen.getByRole("dialog", { name: "Run Truncate cycle history now?" });
    await act(async () => {
      fireEvent.click(within(confirmation).getByRole("button", { name: "Run now" }));
    });

    await vi.waitFor(() => expect(callbacks.onRunDraft).toHaveBeenCalledTimes(1));
    expect(callbacks.onCreate).not.toHaveBeenCalled();
  });
});
