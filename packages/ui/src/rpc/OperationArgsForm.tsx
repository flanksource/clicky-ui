import { useEffect, useMemo, useState } from "react";
import { FilterForm } from "./FilterForm";
import { getOperationClickyMeta } from "./clickyMetadata";
import {
  buildInitialParameterValues,
  defaultValueForParameter,
  titleCase,
  type ParameterValues,
} from "./formMetadata";
import type { OpenAPIParameter, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";

export type OperationArgs = Record<string, unknown>;

export type OperationArgsFormProps = {
  client: OperationsApiClient;
  operation: ResolvedOperation;
  /** Stored args. Read when the form mounts; remount it (key) to load others. */
  args: OperationArgs;
  /** Called with the typed args (booleans, numbers, lists) on every change. */
  onChange: (args: OperationArgs) => void;
  /** Called with false while a required parameter is missing or a value is malformed. */
  onValidityChange?: ((valid: boolean) => void) | undefined;
  className?: string | undefined;
};

const NO_PARAMETERS: OpenAPIParameter[] = [];

// OperationArgsForm renders an operation's own parameter form — the FilterForm
// its action button opens, with the operation's lookups — as a field set whose
// value is a stored args object, for surfaces that save or queue a run (the
// schedule dialog, a Run now confirmation) rather than execute it.
export function OperationArgsForm({
  client,
  operation,
  args,
  onChange,
  onValidityChange,
  className,
}: OperationArgsFormProps) {
  const parameters = operation.operation.parameters ?? NO_PARAMETERS;
  const [initial] = useState(() =>
    storedArgsToValues(args, parameters, operation.method),
  );
  const [values, setValues] = useState(initial.values);
  const problems = useMemo(
    () => parameterProblems(parameters, values),
    [parameters, values],
  );
  const valid = problems.length === 0;

  useEffect(() => {
    onValidityChange?.(valid);
  }, [onValidityChange, valid]);

  const handleChange = (next: ParameterValues) => {
    setValues(next);
    onChange(
      valuesToArgs({
        parameters,
        method: operation.method,
        values: next,
        stored: initial.names,
      }),
    );
  };

  return (
    <div className="space-y-2">
      <FilterForm
        client={client}
        path={operation.path}
        method={operation.method}
        parameters={parameters}
        initialValues={initial.values}
        enableLookup={Boolean(getOperationClickyMeta(operation)?.supportsLookup)}
        showSubmit={false}
        onChange={handleChange}
        onSubmit={() => undefined}
        {...(className ? { className } : {})}
      />
      {initial.dropped.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Dropped arguments this operation no longer accepts:{" "}
          {initial.dropped.join(", ")}
        </p>
      ) : null}
      {problems.map((problem) => (
        <p key={problem} className="text-sm text-destructive">
          {problem}
        </p>
      ))}
    </div>
  );
}

function storedArgsToValues(
  args: OperationArgs,
  parameters: OpenAPIParameter[],
  method: string,
) {
  const known = new Set(parameters.map((parameter) => parameter.name));
  const stored: ParameterValues = {};
  const dropped: string[] = [];
  for (const [name, value] of Object.entries(args)) {
    if (!known.has(name)) {
      dropped.push(name);
      continue;
    }
    stored[name] = storedValueToString(name, value);
  }
  return {
    values: buildInitialParameterValues(parameters, method, {}, stored),
    names: new Set(Object.keys(stored)),
    dropped,
  };
}

function storedValueToString(name: string, value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(",");
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  throw new Error(
    `Stored argument ${name} has an unsupported value: ${JSON.stringify(value)}`,
  );
}

// valuesToArgs keeps what the schedule names: values that differ from the
// parameter's default, required ones, and ones the stored args already held.
// Untouched defaults stay out so the server keeps applying its own default.
function valuesToArgs({
  parameters,
  method,
  values,
  stored,
}: {
  parameters: OpenAPIParameter[];
  method: string;
  values: ParameterValues;
  stored: ReadonlySet<string>;
}): OperationArgs {
  const args: OperationArgs = {};
  for (const parameter of parameters) {
    const raw = values[parameter.name] ?? "";
    if (raw.trim() === "") continue;
    const isDefault = raw === effectiveDefault(parameter, method);
    if (isDefault && !parameter.required && !stored.has(parameter.name)) continue;
    args[parameter.name] = typedValue(parameter, raw);
  }
  return args;
}

function effectiveDefault(parameter: OpenAPIParameter, method: string): string {
  const value = defaultValueForParameter(parameter, method);
  return parameter.schema?.type === "boolean" && value === "" ? "false" : value;
}

function typedValue(parameter: OpenAPIParameter, raw: string): unknown {
  switch (parameter.schema?.type) {
    case "boolean":
      return raw === "true";
    case "integer":
      return isWholeNumber(raw) ? Number(raw) : raw;
    case "number":
      return isNumber(raw) ? Number(raw) : raw;
    case "array":
      return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    default:
      return raw;
  }
}

function parameterProblems(
  parameters: OpenAPIParameter[],
  values: ParameterValues,
): string[] {
  const missing = parameters
    .filter(
      (parameter) =>
        parameter.required && (values[parameter.name] ?? "").trim() === "",
    )
    .map((parameter) => titleCase(parameter.name));
  const problems =
    missing.length > 0 ? [`Missing required fields: ${missing.join(", ")}`] : [];
  for (const parameter of parameters) {
    const raw = (values[parameter.name] ?? "").trim();
    if (raw === "") continue;
    const label = titleCase(parameter.name);
    if (parameter.schema?.type === "integer" && !isWholeNumber(raw)) {
      problems.push(`${label} must be a whole number.`);
    } else if (parameter.schema?.type === "number" && !isNumber(raw)) {
      problems.push(`${label} must be a number.`);
    }
  }
  return problems;
}

function isWholeNumber(raw: string): boolean {
  return /^-?\d+$/.test(raw.trim());
}

function isNumber(raw: string): boolean {
  return raw.trim() !== "" && Number.isFinite(Number(raw));
}
