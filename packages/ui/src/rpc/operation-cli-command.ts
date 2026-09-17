import { shellQuote } from "../lib/shell-command";
import type { OperationScheduleCLI } from "./operation-schedule-types";
import type { ResolvedOperation } from "./types";

export function operationCLICommand(
  operation: ResolvedOperation | undefined,
  args: Record<string, unknown>,
  cli: OperationScheduleCLI | undefined,
): string | undefined {
  const command = operation?.operation["x-clicky"]?.command;
  if (!command || !cli?.executable) return undefined;

  const parts = [shellQuote(cli.executable)];
  for (const [name, value] of sortedEntries(cli.globalFlags ?? {})) {
    appendFlag(parts, name, value);
  }
  parts.push(...command.split("/").filter(Boolean).map(shellQuote));

  const positional = args.args;
  if (Array.isArray(positional)) {
    parts.push(...positional.map((value) => shellQuote(String(value))));
  } else if (positional !== undefined && positional !== null) {
    parts.push(shellQuote(String(positional)));
  }

  for (const [name, value] of sortedEntries(args)) {
    if (name !== "args") appendFlag(parts, name, value);
  }
  return parts.join(" ");
}

function sortedEntries(
  values: Record<string, unknown>,
): Array<[string, unknown]> {
  return Object.entries(values).sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function appendFlag(parts: string[], name: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  if (value === true) {
    parts.push(`--${name}`);
    return;
  }
  parts.push(`--${name}=${shellQuote(flagValue(value))}`);
}

function flagValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(",");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
