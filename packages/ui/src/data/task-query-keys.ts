export interface TaskRunsQueryKeyOptions {
  basePath?: string | undefined;
  kind?: string | undefined;
  status?: string | undefined;
  labels?: Record<string, string> | undefined;
}

export interface TaskRunQueryKeyOptions {
  basePath?: string | undefined;
  runId: string;
}

export const taskQueryKeys = {
  runs: ({ basePath, kind, status, labels }: TaskRunsQueryKeyOptions) => [
    "tasks",
    "runs",
    {
      basePath: basePath ?? "/api/v1",
      kind: kind ?? "",
      status: status ?? "",
      labels: Object.entries(labels ?? {}).sort(([left], [right]) => left.localeCompare(right)),
    },
  ] as const,
  run: ({ basePath, runId }: TaskRunQueryKeyOptions) => [
    "tasks",
    "run",
    { basePath: basePath ?? "/api/v1", runId },
  ] as const,
  control: ({ basePath, runId }: TaskRunQueryKeyOptions) => [
    "tasks",
    "control",
    { basePath: basePath ?? "/api/v1", runId },
  ] as const,
};
