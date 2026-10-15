import { act, fireEvent, screen, within } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { describe, expect, it, vi } from "vitest";
import {
  makeScheduleClient,
  pickOperation,
  renderSchedules,
  savedSchedule as schedule,
  scheduleHandlers as handlers,
  scheduleOperations as operations,
} from "../test/operation-schedules.test-utils";
expect.extend(matchers);

describe("OperationSchedules", () => {
  it("requires a target when creating a schedule without environment defaults", async () => {
    const callbacks = { ...handlers(), defaultTargets: [] };
    renderSchedules({ operations, schedules: [], ...callbacks });
    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Operation" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: /Truncate cycle history/ }));
    expect(screen.getByRole("button", { name: "Save schedule" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Run now" })).toBeDisabled();
    expect(callbacks.onCreate).not.toHaveBeenCalled();
    expect(callbacks.onRunDraft).not.toHaveBeenCalled();
  });

  it("lists saved schedules and runs one after confirmation", async () => {
    const callbacks = handlers();
    renderSchedules({ operations, schedules: [schedule], ...callbacks });

    expect(screen.getByText("Weekly cleanup")).toBeInTheDocument();
    expect(screen.getByText("Truncate cycle history")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Run Weekly cleanup now" }),
    );
    const confirmation = screen.getByRole("dialog", {
      name: "Run Weekly cleanup now?",
    });
    await act(async () => {
      fireEvent.click(
        within(confirmation).getByRole("button", { name: "Run now" }),
      );
    });

    await vi.waitFor(() =>
      expect(callbacks.onRunSaved).toHaveBeenCalledWith("schedule-1"),
    );
  });

  it("creates a schedule from a schedulable operation's parameter form", async () => {
    const callbacks = handlers();
    renderSchedules({
      operations,
      schedules: [],
      cli: { executable: "oipa-cli", targetFlag: "context" },
      ...callbacks,
    });

    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    const dialog = screen.getByRole("dialog", { name: "Add schedule" });
    const scheduleName = within(dialog).getByRole("textbox", {
      name: "Schedule name",
    });
    fireEvent.click(within(dialog).getByRole("combobox", { name: "Operation" }));
    expect(
      screen.queryByRole("option", { name: /Maintenance status/ }),
    ).not.toBeInTheDocument();
    fireEvent.mouseDown(
      screen.getByRole("option", { name: /Truncate cycle history/ }),
    );

    fireEvent.change(scheduleName, {
      target: { value: "Sunday cleanup" },
    });
    const batchSize = await screen.findByRole("textbox", { name: /batch/i });
    fireEvent.change(batchSize, {
      target: { value: "750" },
    });
    await vi.waitFor(() =>
      expect(
        screen.getByText("oipa-cli --context=dev cycle truncate --batchSize=750 oipa-cli --context=qa cycle truncate --batchSize=750"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Copy CLI command" }),
    ).toBeInTheDocument();
    const cron = within(dialog).getByRole("combobox", {
      name: "Cron expression",
    });
    fireEvent.click(cron);
    fireEvent.mouseDown(screen.getByRole("option", { name: /Recommended/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });

    await vi.waitFor(() =>
      expect(callbacks.onCreate).toHaveBeenCalledWith({
        name: "Sunday cleanup",
        operationId: "truncateCycles",
        targets: ["dev", "qa"],
        args: { batchSize: 750 },
        cron: "0 2 * * 0",
        timezone: expect.any(String),
        enabled: true,
        concurrency: 1,
      }),
    );
  });

  it("renders enum and lookup parameters as those controls and saves their args", async () => {
    const callbacks = handlers();
    const client = makeScheduleClient();
    renderSchedules({ operations, schedules: [], client, ...callbacks });

    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    await pickOperation("Cycle catch-up");

    const mode = await screen.findByRole("combobox", { name: "Mode" });
    expect(mode.tagName).toBe("SELECT");
    expect(within(mode).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "",
      "preview",
      "apply",
    ]);
    const company = screen.getByLabelText("Company") as HTMLInputElement;
    await vi.waitFor(() =>
      expect(
        document.querySelector(`#${company.getAttribute("list")} option[value="acme-regional"]`),
      ).not.toBeNull(),
    );
    expect(client.lookupFilters).toHaveBeenCalledWith(
      "/api/v1/cycle/catch-up",
      "post",
      expect.any(Object),
      { Accept: "application/json+clicky" },
    );

    fireEvent.change(company, { target: { value: "acme-regional" } });
    fireEvent.change(mode, { target: { value: "apply" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });

    await vi.waitFor(() =>
      expect(callbacks.onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Cycle catch-up",
          operationId: "cycleCatchUp",
          args: { company: "acme-regional", mode: "apply" },
        }),
      ),
    );
  });

  it("shows a schedule's stored boolean and number args and saves them back", async () => {
    const callbacks = handlers();
    const stored = { "dry-run": true, "max-date-steps": 5 };
    renderSchedules({
      operations,
      schedules: [
        { ...schedule, id: "catch-up", name: "Nightly catch-up", operationId: "cycleCatchUp", args: stored },
      ],
      ...callbacks,
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(await screen.findByRole("checkbox", { name: "Dry Run" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Max Date Steps" })).toHaveValue("5");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });

    await vi.waitFor(() =>
      expect(callbacks.onUpdate).toHaveBeenCalledWith(
        "catch-up",
        expect.objectContaining({ operationId: "cycleCatchUp", args: stored }),
      ),
    );
  });

  it("disables Save and Run now while a required parameter is missing", async () => {
    const callbacks = handlers();
    renderSchedules({ operations, schedules: [], ...callbacks });

    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    await pickOperation("Truncate cycle history");

    expect(await screen.findByText("Missing required fields: BatchSize")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save schedule" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Run now" })).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: /batch/i }), {
      target: { value: "10" },
    });
    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Save schedule" })).toBeEnabled(),
    );
    expect(screen.getByRole("button", { name: "Run now" })).toBeEnabled();
  });

  it("runs an unsaved dialog draft without creating a schedule", async () => {
    const callbacks = handlers();
    renderSchedules({ operations, schedules: [], ...callbacks });

    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    await pickOperation("Truncate cycle history");
    const batchSize = await screen.findByRole("textbox", { name: /batch/i });
    fireEvent.change(batchSize, {
      target: { value: "250" },
    });
    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Run now" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Run now" }));
    const confirmation = screen.getByRole("dialog", {
      name: "Run Truncate cycle history now?",
    });
    await act(async () => {
      fireEvent.click(
        within(confirmation).getByRole("button", { name: "Run now" }),
      );
    });

    await vi.waitFor(() =>
      expect(callbacks.onRunDraft).toHaveBeenCalledTimes(1),
    );
    expect(callbacks.onCreate).not.toHaveBeenCalled();
  });
});
