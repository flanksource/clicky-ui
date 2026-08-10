import type { TaskExecDetails } from "./TaskSnapshot";

export function isTaskExecDetails(value: unknown): value is TaskExecDetails {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TaskExecDetails>;
  return (
    typeof candidate.command === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.exitCode === "number" &&
    (candidate.args === undefined ||
      (Array.isArray(candidate.args) && candidate.args.every((arg) => typeof arg === "string")))
  );
}
