export type ProcessorSpec = {
  use?: string;
  type?: string;
  config?: Record<string, unknown>;
};

export type ProcessorPreset = {
  type: string;
  title?: string;
  description?: string;
  config?: Record<string, unknown>;
};

export const PROCESSOR_CONFIG_KEYS: Record<string, string[]> = {
  "cel.batch": [
    "partition",
    "column",
    "window",
    "order",
    "boundary",
    "continuation",
    "max",
    "when",
    "keep",
    "set",
    "emit",
  ],
  "cel.dedupe": ["partition", "keep", "when", "set", "emit", "max"],
  "logs.parse": ["format", "column"],
  "sqlite.merge": ["sql", "as", "with"],
  "sqlite.recon": ["key", "keyCel", "compare", "baseline"],
};

export const PROCESSOR_CEL_SCOPES: Record<string, "batch" | "boundary"> = {
  when: "batch",
  emit: "batch",
  continuation: "boundary",
  boundary: "boundary",
};

export type ProcessorConfigIssue = {
  key: string;
  severity: "error" | "warning";
  message: string;
};

export type ResolvedProcessorKey = {
  key: string;
  value: unknown;
  origin: "preset" | "override";
  presetValue?: unknown;
};

export function effectiveType(
  spec: ProcessorSpec,
  preset: ProcessorPreset | undefined,
): string {
  return spec.type?.trim() || preset?.type || "";
}

export function resolveConfig(
  spec: ProcessorSpec,
  preset: ProcessorPreset | undefined,
): ResolvedProcessorKey[] {
  const presetConfig = preset?.config ?? {};
  const override = spec.config ?? {};
  const keys = [
    ...new Set([...Object.keys(presetConfig), ...Object.keys(override)]),
  ].sort();

  return keys.map((key) => {
    if (!(key in override)) {
      return { key, value: presetConfig[key], origin: "preset" as const };
    }
    return {
      key,
      value: override[key],
      origin: "override" as const,
      ...(key in presetConfig ? { presetValue: presetConfig[key] } : {}),
    };
  });
}

export function effectiveConfig(
  spec: ProcessorSpec,
  preset: ProcessorPreset | undefined,
): Record<string, unknown> {
  return { ...preset?.config, ...spec.config };
}

export function validateProcessor(
  spec: ProcessorSpec,
  preset: ProcessorPreset | undefined,
): ProcessorConfigIssue[] {
  const issues: ProcessorConfigIssue[] = [];
  const type = effectiveType(spec, preset);

  if (!type) {
    return [
      {
        key: "type",
        severity: "error",
        message: "Pick a library processor or a type.",
      },
    ];
  }
  if (spec.use && spec.type && preset && spec.type !== preset.type) {
    issues.push({
      key: "type",
      severity: "error",
      message: `${spec.use} is a ${preset.type}; setting type to ${spec.type} is rejected rather than merged.`,
    });
  }

  const known = PROCESSOR_CONFIG_KEYS[type];
  if (!known) {
    return [
      ...issues,
      {
        key: "type",
        severity: "error",
        message: `No processor is registered for type ${type}.`,
      },
    ];
  }

  for (const key of Object.keys(spec.config ?? {})) {
    if (known.includes(key)) continue;
    issues.push({
      key,
      severity: "warning",
      message: `Not a key ${type} declares. Unknown keys are dropped without an error, so this line does nothing.`,
    });
  }

  const config = effectiveConfig(spec, preset);
  const hasSet = isRecord(config.set) && Object.keys(config.set).length > 0;
  const hasEmit = typeof config.emit === "string" && config.emit.trim() !== "";

  if (hasSet && hasEmit) {
    issues.push({
      key: "emit",
      severity: "error",
      message: "Sets both set and emit; pick one.",
    });
  }
  if (type === "cel.batch") {
    if (!hasSet && !hasEmit) {
      issues.push({
        key: "set",
        severity: "error",
        message: "Batch requires either set or emit.",
      });
    }
    if (config.boundary && config.continuation) {
      issues.push({
        key: "boundary",
        severity: "error",
        message:
          "Boundary already replaces the timestamp rule; setting continuation as well is ambiguous.",
      });
    }
  }
  if (
    type === "cel.dedupe" &&
    !(Array.isArray(config.partition) && config.partition.length > 0)
  ) {
    issues.push({
      key: "partition",
      severity: "error",
      message:
        "Dedupe requires partition; without a key every row collapses into one.",
    });
  }
  if (
    type === "logs.parse" &&
    config.format !== undefined &&
    !["", "autodetect", "json", "klogfmt", "logfmt", "syslog"].includes(
      String(config.format),
    )
  ) {
    issues.push({
      key: "format",
      severity: "error",
      message: `format ${JSON.stringify(config.format)} is not autodetect, json, klogfmt, logfmt or syslog.`,
    });
  }
  if (
    config.keep !== undefined &&
    config.keep !== "first" &&
    config.keep !== "last"
  ) {
    issues.push({
      key: "keep",
      severity: "error",
      message: `keep ${JSON.stringify(config.keep)} is not "first" or "last".`,
    });
  }
  if (
    config.order !== undefined &&
    config.order !== "asc" &&
    config.order !== "desc"
  ) {
    issues.push({
      key: "order",
      severity: "error",
      message: `order ${JSON.stringify(config.order)} is not "asc" or "desc".`,
    });
  }
  if (typeof config.max === "number" && config.max < 0) {
    issues.push({
      key: "max",
      severity: "error",
      message: "max cannot be negative.",
    });
  }

  return issues;
}

export function pagingBlock(
  type: string,
): { kind: "inherent" | "gap"; reason: string } | undefined {
  if (type === "sqlite.merge" || type === "sqlite.recon") {
    return {
      kind: "inherent",
      reason: "Loads the whole result set before any row is correct.",
    };
  }
  return undefined;
}

export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
