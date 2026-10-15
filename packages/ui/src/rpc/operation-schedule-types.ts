import type { ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";
import type { ComboboxOption } from "../components/combobox-types";

export interface OperationSchedule {
  id: string;
  name: string;
  operationId: string;
  targets: string[];
  args: Record<string, unknown>;
  cron: string;
  timezone: string;
  enabled: boolean;
  /** Targets executed at once in a multi-target run (1..targets.length); the rest queue. Server default 1. */
  concurrency?: number;
  lastRun?: string;
  nextRun?: string;
}

export type OperationScheduleInput = Omit<
  OperationSchedule,
  "id" | "lastRun" | "nextRun"
>;

export type OperationScheduleRunInput = Pick<
  OperationScheduleInput,
  "operationId" | "args" | "targets" | "concurrency"
>;

export interface OperationScheduleCLI {
  executable: string;
  globalFlags?: Record<string, unknown>;
  targetFlag?: string;
}

export interface OperationSchedulesProps {
  /** Client for the argument form's lookups (the operation's parameter pickers). */
  client: OperationsApiClient;
  operations: readonly ResolvedOperation[];
  schedules: readonly OperationSchedule[];
  targetOptions: ComboboxOption[];
  defaultTargets?: string[];
  targetLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  cli?: OperationScheduleCLI;
  onCreate: (input: OperationScheduleInput) => Promise<unknown>;
  onUpdate: (id: string, input: OperationScheduleInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onRunSaved: (id: string) => Promise<unknown>;
  onRunDraft: (input: OperationScheduleRunInput) => Promise<unknown>;
}
