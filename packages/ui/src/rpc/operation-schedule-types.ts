import type { ResolvedOperation } from "./types";

export interface OperationSchedule {
  id: string;
  name: string;
  operationId: string;
  args: Record<string, unknown>;
  cron: string;
  timezone: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export type OperationScheduleInput = Omit<
  OperationSchedule,
  "id" | "lastRun" | "nextRun"
>;

export type OperationScheduleRunInput = Pick<
  OperationScheduleInput,
  "operationId" | "args"
>;

export interface OperationScheduleCLI {
  executable: string;
  globalFlags?: Record<string, unknown>;
}

export interface OperationSchedulesProps {
  operations: readonly ResolvedOperation[];
  schedules: readonly OperationSchedule[];
  disabled?: boolean;
  loading?: boolean;
  cli?: OperationScheduleCLI;
  onCreate: (input: OperationScheduleInput) => Promise<unknown>;
  onUpdate: (id: string, input: OperationScheduleInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onRunSaved: (id: string) => Promise<unknown>;
  onRunDraft: (input: OperationScheduleRunInput) => Promise<unknown>;
}
