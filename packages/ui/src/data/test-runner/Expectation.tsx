import type { ReactNode } from "react";
import { JsonView } from "../JsonView";
import { cn } from "../../lib/utils";

export type ExpectationProps = {
  /** What decided the verdict: a matcher name (`Equal`) or a CEL expression. */
  check?: string | undefined;
  /** Label for `check`; defaults to "matcher". */
  checkLabel?: string | undefined;
  expected?: unknown;
  actual?: unknown;
  /** Variables the check saw (CEL `cel_vars`). */
  vars?: Record<string, unknown> | undefined;
  location?: string | undefined;
  className?: string | undefined;
};

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

// A recorder summary or a list of rows nests too deep to read as one line.
function isStructured(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => item !== null && typeof item === "object");
  return value !== null && typeof value === "object";
}

function Value({
  value,
  tree = false,
  className,
}: {
  value: unknown;
  /** Expand a structured value as a tree instead of one JSON line. */
  tree?: boolean;
  className?: string;
}) {
  if (tree && isStructured(value)) return <JsonView data={value} />;
  return (
    <code className={cn("whitespace-pre-wrap break-words font-mono", className)}>
      {formatValue(value)}
    </code>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

/**
 * One compact label/value grid for what a check expected and what it got —
 * shared by test failures (matcher, expected, actual, location) and CEL
 * assertions (expression, variables, expected, actual).
 */
export function Expectation({
  check,
  checkLabel = "matcher",
  expected,
  actual,
  vars,
  location,
  className,
}: ExpectationProps) {
  const varEntries = Object.entries(vars ?? {});
  return (
    <dl
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5 rounded border border-border bg-muted/30 px-2 py-1.5 text-[11px]",
        className,
      )}
      data-expectation=""
    >
      {check && (
        <Row label={checkLabel}>
          <Value value={check} />
        </Row>
      )}
      {varEntries.map(([name, value]) => (
        <Row key={name} label={name}>
          <Value value={value} tree />
        </Row>
      ))}
      {expected !== undefined && (
        <Row label="expected">
          <Value value={expected} className="text-emerald-700 dark:text-emerald-400" />
        </Row>
      )}
      {actual !== undefined && (
        <Row label="actual">
          <Value value={actual} className="text-red-700 dark:text-red-400" />
        </Row>
      )}
      {location && (
        <Row label="at">
          <Value value={location} className="text-muted-foreground" />
        </Row>
      )}
    </dl>
  );
}
