import { DEFAULT_CRON } from "../components/schedule-types";
import type { OperationSchedule, OperationScheduleInput } from "./operation-schedule-types";
import type { ResolvedOperation } from "./types";

export function schedulableOperations(
  operations: readonly ResolvedOperation[],
): ResolvedOperation[] {
  return operations.filter(
    ({ operation }) => Boolean(operation.operationId && operation["x-clicky"]?.schedule),
  );
}

export function operationLabel(operation: ResolvedOperation | undefined): string {
  return operation?.operation.summary ?? operation?.operation.operationId ?? "Unknown operation";
}

export function operationByID(
  operations: readonly ResolvedOperation[],
  operationID: string,
): ResolvedOperation | undefined {
  return operations.find(({ operation }) => operation.operationId === operationID);
}

export function newOperationScheduleInput(): OperationScheduleInput {
  return {
    name: "",
    operationId: "",
    targets: [],
    args: {},
    cron: DEFAULT_CRON,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    enabled: true,
  };
}

export function scheduleToInput(schedule: OperationSchedule): OperationScheduleInput {
  return {
    name: schedule.name,
    operationId: schedule.operationId,
    targets: [...schedule.targets],
    args: schedule.args,
    cron: schedule.cron,
    timezone: schedule.timezone,
    enabled: schedule.enabled,
  };
}

export function formatScheduleTimestamp(value: string | undefined): string {
  if (!value) return "Never";
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? value : timestamp.toLocaleString();
}
