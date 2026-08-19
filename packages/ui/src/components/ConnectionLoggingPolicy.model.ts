export const CONNECTION_LOG_LEVELS = [
  "off",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "trace1",
  "trace2",
  "trace3",
  "trace4",
] as const;

export type ConnectionLogLevel = (typeof CONNECTION_LOG_LEVELS)[number];
export type ConnectionLoggingFamily = "generic" | "sql" | "http";
export type ConnectionLoggingThreshold = {
  amount: string;
  unit: "ms" | "s" | "m" | "h";
};

export type ConnectionLoggingEvent = {
  event: string;
  property: string;
  label: string;
  description: string;
  default: ConnectionLogLevel;
  captures: string[];
  example: Record<string, unknown>;
  prettyExample: string;
};

export type ConnectionLoggingCapability = {
  family: ConnectionLoggingFamily;
  slowThreshold: string;
  thresholdLabel: string;
  events: ConnectionLoggingEvent[];
};

export type ConnectionLoggingPolicyProps = {
  definition: ConnectionLoggingCapability;
  value?: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  readOnly?: boolean;
  className?: string;
};

const LEVEL_ORDER = new Map(
  CONNECTION_LOG_LEVELS.map((level, index) => [level, index]),
);
const THRESHOLD_PATTERN = /^([0-9]+(?:\.[0-9]+)?)(ms|s|m|h)$/;

export function parseConnectionLoggingThreshold(
  value: string,
): ConnectionLoggingThreshold {
  const match = THRESHOLD_PATTERN.exec(value.trim());
  const amount = match?.[1];
  const unit = match?.[2];
  if (!amount || !unit) {
    throw new Error(`invalid connection logging threshold "${value}"`);
  }
  return { amount, unit: unit as ConnectionLoggingThreshold["unit"] };
}

export function isConnectionLoggingCapability(
  value: unknown,
): value is ConnectionLoggingCapability {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ConnectionLoggingCapability>;
  return (
    (candidate.family === "generic" ||
      candidate.family === "sql" ||
      candidate.family === "http") &&
    typeof candidate.slowThreshold === "string" &&
    THRESHOLD_PATTERN.test(candidate.slowThreshold.trim()) &&
    typeof candidate.thresholdLabel === "string" &&
    Array.isArray(candidate.events) &&
    candidate.events.every(
      (event) =>
        event &&
        typeof event.event === "string" &&
        typeof event.property === "string" &&
        typeof event.label === "string" &&
        typeof event.description === "string" &&
        typeof event.default === "string" &&
        Array.isArray(event.captures) &&
        event.captures.every((capture) => typeof capture === "string") &&
        Boolean(event.example) &&
        typeof event.example === "object" &&
        !Array.isArray(event.example) &&
        typeof event.prettyExample === "string" &&
        CONNECTION_LOG_LEVELS.includes(event.default as ConnectionLogLevel),
    )
  );
}

export function visibleConnectionLogEvents(
  definition: ConnectionLoggingCapability,
  value: Record<string, string>,
  previewLevel: ConnectionLogLevel,
): ConnectionLoggingEvent[] {
  const previewOrder = LEVEL_ORDER.get(previewLevel) ?? -1;
  return definition.events.filter((event) => {
    const eventLevel = effectiveConnectionLogLevel(event, value);
    if (eventLevel === "off") return false;
    return (
      (LEVEL_ORDER.get(eventLevel) ?? Number.POSITIVE_INFINITY) <= previewOrder
    );
  });
}

export function effectiveConnectionLogLevel(
  event: ConnectionLoggingEvent,
  value: Record<string, string>,
): ConnectionLogLevel {
  const override = value[event.property];
  return CONNECTION_LOG_LEVELS.includes(override as ConnectionLogLevel)
    ? (override as ConnectionLogLevel)
    : event.default;
}
