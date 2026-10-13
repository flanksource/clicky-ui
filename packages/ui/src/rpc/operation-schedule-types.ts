import type { ResolvedOperation } from "./types";
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
  lastRun?: string;
  nextRun?: string;
}

export type OperationScheduleInput = Omit<
  OperationSchedule,
  "id" | "lastRun" | "nextRun"
>;

export type OperationScheduleRunInput = Pick<
  OperationScheduleInput,
  "operationId" | "args" | "targets"
>;

export interface OperationScheduleCLI {
  executable: string;
  globalFlags?: Record<string, unknown>;
  targetFlag?: string;
}

export interface OperationSchedulesProps {
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
