import type { ReactNode } from "react";

export type ToolArgsProps = {
  input: unknown;
};

type ToolArg = {
  key: string;
  value: string;
};

const ARG_VALUE_LIMIT = 120;

function compactValue(value: unknown): string {
  let text: string;
  if (typeof value === "string") {
    text = value.replace(/\s+/g, " ").trim();
  } else if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    text = String(value);
  } else {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new Error(`Cannot render tool argument of type ${typeof value}.`);
    }
    text = serialized;
  }
  return text.length > ARG_VALUE_LIMIT
    ? `${text.slice(0, ARG_VALUE_LIMIT)}…`
    : text;
}

function toolArgs(input: unknown): ToolArg[] {
  if (input === undefined || input === null || input === "") return [];
  if (typeof input !== "object" || Array.isArray(input)) {
    return [{ key: "input", value: compactValue(input) }];
  }
  return Object.entries(input).flatMap(([key, value]) => {
    if (value === undefined || value === null || value === "") return [];
    return [{ key, value: compactValue(value) }];
  });
}

/** Compact, single-line input arguments for a collapsed tool call. */
export function ToolArgs({ input }: ToolArgsProps): ReactNode {
  const args = toolArgs(input);
  if (args.length === 0) return null;

  return (
    <span
      data-slot="tool-call-args"
      data-testid="tool-call-args"
      className="min-w-0 flex-1 truncate font-mono text-xs"
    >
      {args.map((arg) => (
        <span key={arg.key} className="[&:not(:first-child)]:ml-2">
          <span className="text-muted-foreground/60">{arg.key}</span>
          <span className="text-muted-foreground">: {arg.value}</span>
        </span>
      ))}
    </span>
  );
}
