import type { JvmLogger } from "../protocol/types";

/** java.util.logging levels, most to least restrictive. */
export const JUL_LEVELS = ["OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL"] as const;

export const ROOT_LOGGER_LABEL = "<root>";

export function loggerDisplayName(name: string): string {
  return name === "" ? ROOT_LOGGER_LABEL : name;
}

/** The level a logger logs at, and the logger that set it. */
export type EffectiveLevel = { level: string; from: string };

/**
 * Resolves every logger's effective level by walking up its parents. A logger
 * whose chain is broken (a parent missing from the listing, a cycle, or an
 * inheriting root) maps to null rather than to a guessed level.
 */
export function effectiveLevels(loggers: readonly JvmLogger[]): Map<string, EffectiveLevel | null> {
  const byName = new Map(loggers.map((logger) => [logger.name, logger]));
  const resolved = new Map<string, EffectiveLevel | null>();
  for (const start of loggers) {
    const visited = new Set<string>();
    let result: EffectiveLevel | null = null;
    for (let current: JvmLogger | undefined = start; current && !visited.has(current.name); current = current.parent === null ? undefined : byName.get(current.parent)) {
      visited.add(current.name);
      if (current.level !== null) {
        result = { level: current.level, from: current.name };
        break;
      }
    }
    resolved.set(start.name, result);
  }
  return resolved;
}

export type LoggerRow = {
  /** Raw logger name; "" is the root. Pass this to `setLoggerLevel`. */
  name: string;
  displayName: string;
  /** The level set on this logger; null inherits. */
  level: string | null;
  /** The level it logs at after inheritance; null when the chain cannot be resolved. */
  effective: string | null;
  effectiveFrom: string | null;
  levelLabel: string;
  parentName: string;
};

export function loggerRows(loggers: readonly JvmLogger[]): LoggerRow[] {
  const levels = effectiveLevels(loggers);
  return loggers.map((logger) => {
    const effective = levels.get(logger.name) ?? null;
    return {
      name: logger.name,
      displayName: loggerDisplayName(logger.name),
      level: logger.level,
      effective: effective?.level ?? null,
      effectiveFrom: effective?.from ?? null,
      levelLabel: logger.level ?? `(inherit) → ${effective?.level ?? "unknown"}`,
      parentName: logger.parent === null ? "–" : loggerDisplayName(logger.parent),
    };
  });
}

/** Case-insensitive substring match on the displayed logger name. */
export function filterLoggerRows(rows: readonly LoggerRow[], filter: string): LoggerRow[] {
  const query = filter.trim().toLowerCase();
  return query ? rows.filter((row) => row.displayName.toLowerCase().includes(query)) : [...rows];
}
