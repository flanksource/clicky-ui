import { act, fireEvent, screen, within } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { describe, expect, it, vi } from "vitest";
import {
  pickOperation,
  renderSchedules,
  savedSchedule as schedule,
  scheduleHandlers as handlers,
  scheduleOperations as operations,
} from "../test/operation-schedules.test-utils";
expect.extend(matchers);

describe("OperationSchedules target concurrency", () => {
  const atOnce = "Environments at once";
  const environments = [
    { value: "dev", label: "Development" },
    { value: "qa", label: "QA" },
    { value: "uat", label: "UAT" },
  ];

  function openAddWith(defaultTargets: string[]) {
    const callbacks = { ...handlers(), targetOptions: environments, defaultTargets };
    renderSchedules({
      operations,
      schedules: [],
      targetLabel: "Environments",
      ...callbacks,
    });
    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    return callbacks;
  }

  async function fillTruncateDraft(name: string) {
    const dialog = screen.getByRole("dialog", { name: "Add schedule" });
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Schedule name" }), {
      target: { value: name },
    });
    await pickOperation("Truncate cycle history");
    fireEvent.change(await screen.findByRole("textbox", { name: /batch/i }), {
      target: { value: "100" },
    });
    await vi.waitFor(() =>
      expect(screen.queryByText(/Missing required fields/)).not.toBeInTheDocument(),
    );
  }

  it("hides the at-once field when only one environment is selected", () => {
    openAddWith(["dev"]);
    expect(screen.queryByRole("spinbutton", { name: atOnce })).not.toBeInTheDocument();
  });

  it("defaults the at-once field to 1 when several environments are selected", () => {
    openAddWith(["dev", "qa"]);
    expect(screen.getByRole("spinbutton", { name: atOnce })).toHaveValue(1);
  });

  it("labels the field from the generic target label when none is given", () => {
    renderSchedules({ operations, schedules: [], ...handlers() });
    fireEvent.click(screen.getByRole("button", { name: "Add schedule" }));
    expect(screen.getByRole("spinbutton", { name: "Targets at once" })).toBeInTheDocument();
  });

  it("sends the chosen concurrency when creating a multi-environment schedule", async () => {
    const callbacks = openAddWith(["dev", "qa", "uat"]);
    await fillTruncateDraft("Parallel cleanup");
    fireEvent.change(screen.getByRole("spinbutton", { name: atOnce }), {
      target: { value: "2" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });
    await vi.waitFor(() =>
      expect(callbacks.onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ targets: ["dev", "qa", "uat"], concurrency: 2 }),
      ),
    );
  });

  it("omits concurrency when saving a single-environment schedule", async () => {
    const callbacks = openAddWith(["dev"]);
    await fillTruncateDraft("Single cleanup");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });
    await vi.waitFor(() => expect(callbacks.onCreate).toHaveBeenCalledTimes(1));
    expect(callbacks.onCreate.mock.calls[0]).not.toHaveProperty("0.concurrency");
  });

  it("sends the chosen concurrency with a draft run", async () => {
    const callbacks = openAddWith(["dev", "qa"]);
    await fillTruncateDraft("Parallel run");
    fireEvent.change(screen.getByRole("spinbutton", { name: atOnce }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run now" }));
    const confirmation = screen.getByRole("dialog", { name: "Run Truncate cycle history now?" });
    await act(async () => {
      fireEvent.click(within(confirmation).getByRole("button", { name: "Run now" }));
    });
    await vi.waitFor(() =>
      expect(callbacks.onRunDraft).toHaveBeenCalledWith({
        operationId: "truncateCycles",
        args: { batchSize: 100 },
        targets: ["dev", "qa"],
        concurrency: 2,
      }),
    );
  });

  it.each([
    { value: "3", reason: "above the environment count" },
    { value: "0", reason: "below one" },
    { value: "1.5", reason: "not a whole number" },
    { value: "", reason: "empty" },
  ])("blocks save and run when the value is $reason", async ({ value }) => {
    const callbacks = openAddWith(["dev", "qa"]);
    await fillTruncateDraft("Invalid cleanup");
    fireEvent.change(screen.getByRole("spinbutton", { name: atOnce }), {
      target: { value },
    });
    expect(screen.getByText("Enter a whole number from 1 to 2.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save schedule" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Run now" })).toBeDisabled();
    expect(callbacks.onCreate).not.toHaveBeenCalled();
  });

  it("clamps the value when the environment count drops below it", async () => {
    openAddWith(["dev", "qa", "uat"]);
    fireEvent.change(screen.getByRole("spinbutton", { name: atOnce }), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Remove UAT" }));
    expect(screen.getByRole("spinbutton", { name: atOnce })).toHaveValue(2);
  });

  it("edits a schedule starting from its saved concurrency", async () => {
    const callbacks = { ...handlers(), targetOptions: environments };
    renderSchedules({
      operations,
      schedules: [{ ...schedule, targets: ["dev", "qa", "uat"], concurrency: 3 }],
      targetLabel: "Environments",
      ...callbacks,
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const field = screen.getByRole("spinbutton", { name: atOnce });
    expect(field).toHaveValue(3);
    fireEvent.change(field, { target: { value: "2" } });
    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Save schedule" })).toBeEnabled(),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    });
    await vi.waitFor(() =>
      expect(callbacks.onUpdate).toHaveBeenCalledWith(
        "schedule-1",
        expect.objectContaining({
          targets: ["dev", "qa", "uat"],
          concurrency: 2,
          args: { batchSize: 500 },
        }),
      ),
    );
  });
});
