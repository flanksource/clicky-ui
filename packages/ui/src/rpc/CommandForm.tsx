import { useReducer, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { isPositionalParam, type OpenAPIParameter } from "./types";

export type CommandFormProps = {
  parameters: OpenAPIParameter[];
  onExecute: (params: Record<string, string>, headers: Record<string, string>) => void;
  isPending: boolean;
  method: string;
  path: string;
  accept: string;
  initialValues?: Record<string, string>;
};

type FormState = Record<string, string>;
type FormAction = { name: string; value: string };

function formReducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.name]: action.value };
}

export function CommandForm({
  parameters,
  onExecute,
  isPending,
  method: _method,
  path,
  accept,
  initialValues,
}: CommandFormProps) {
  const [values, dispatch] = useReducer(
    formReducer,
    { parameters, path, initialValues },
    ({ parameters: params, path: formPath, initialValues: overrides }) =>
      buildInitialState(normalizeParameters(params, formPath), formPath, overrides),
  );

  const formParameters = normalizeParameters(parameters, path);
  const visibleParams = formParameters.filter((p) => !(p.in === "path" && initialValues?.[p.name]));
  const positionalNames = new Set(formParameters.filter(isPositionalParam).map((p) => p.name));
  const inlineLayout = visibleParams.length >= INLINE_LAYOUT_THRESHOLD;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params: Record<string, string> = {};
    const args: string[] = [];
    for (const param of formParameters) {
      const value = submitValue(param, values[param.name]);
      if (value == null) continue;
      if (positionalNames.has(param.name)) {
        args.push(...splitArgsValue(value));
      } else {
        params[param.name] = value;
      }
    }
    if (args.length > 0) params.args = args.join(",");
    onExecute(params, { Accept: accept });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {visibleParams.length > 0 && (
        <div className={inlineLayout ? "grid gap-2" : "grid gap-4"}>
          {visibleParams.map((param) => (
            <ParameterField
              key={param.name}
              param={param}
              value={values[param.name] || ""}
              inline={inlineLayout}
              onChange={(value) => dispatch({ name: param.name, value })}
            />
          ))}
        </div>
      )}

      <div
        className={
          inlineLayout
            ? "sticky bottom-0 z-10 -mx-2 flex justify-end border-t border-border bg-background/95 px-2 py-3 backdrop-blur-sm"
            : "flex justify-end"
        }
      >
        <Button type="submit" disabled={isPending}>
          {isPending ? "Executing..." : "Execute"}
        </Button>
      </div>
    </form>
  );
}

const INLINE_LAYOUT_THRESHOLD = 6;

function ParameterField({
  param,
  value,
  inline,
  onChange,
}: {
  param: OpenAPIParameter;
  value: string;
  inline: boolean;
  onChange: (value: string) => void;
}) {
  const schema = param.schema;
  const fieldId = `param-${param.name}`;

  if (isMultiValueParam(param)) {
    return (
      <FieldWrapper param={param} fieldId={fieldId} inline={inline}>
        <TagInput
          id={fieldId}
          value={value}
          placeholder={param.description || param.name}
          onChange={onChange}
        />
      </FieldWrapper>
    );
  }

  if (schema?.enum) {
    return (
      <FieldWrapper param={param} fieldId={fieldId} inline={inline}>
        <select
          id={fieldId}
          value={value}
          className={inputClassName}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select {param.name}</option>
          {schema.enum.map((v) => (
            <option key={String(v)} value={String(v)}>
              {String(v)}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }

  if (schema?.type === "boolean") {
    const checkbox = (
      <input
        id={fieldId}
        type="checkbox"
        className="h-4 w-4 accent-primary"
        checked={value === "true"}
        onChange={(event) => onChange(event.target.checked ? "true" : "false")}
      />
    );
    if (inline) {
      return (
        <FieldWrapper param={param} fieldId={fieldId} inline>
          <div className="flex h-9 items-center">{checkbox}</div>
        </FieldWrapper>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {checkbox}
        <label htmlFor={fieldId} className="text-sm font-medium">
          {param.name}
          {param.required && <span className="text-destructive"> *</span>}
        </label>
        {param.description && (
          <span className="text-xs text-muted-foreground">{param.description}</span>
        )}
      </div>
    );
  }

  if (isDateParam(param)) {
    const dateTime = schema?.format === "date-time";
    return (
      <FieldWrapper param={param} fieldId={fieldId} inline={inline}>
        <div className="flex gap-2">
          <input
            id={fieldId}
            type={dateTime ? "datetime-local" : "date"}
            value={dateInputValue(value, dateTime)}
            className={inputClassName}
            onChange={(event) => onChange(dateOutputValue(event.target.value, dateTime))}
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Clear ${param.name}`}
              onClick={() => onChange("")}
            >
              <Icon name="codicon:close" />
            </Button>
          )}
        </div>
      </FieldWrapper>
    );
  }

  const inputType = schema?.type === "integer" || schema?.type === "number" ? "number" : "text";

  return (
    <FieldWrapper param={param} fieldId={fieldId} inline={inline}>
      <input
        id={fieldId}
        type={inputType}
        value={value}
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        placeholder={
          schema?.default != null ? String(schema.default) : param.description || param.name
        }
      />
    </FieldWrapper>
  );
}

function TagInput({
  id,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const tags = parseTags(value);

  function commit(raw: string, input: HTMLInputElement) {
    const next = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    onChange(serializeTags([...tags, ...next]));
    input.value = "";
  }

  function remove(index: number) {
    onChange(serializeTags(tags.filter((_, i) => i !== index)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(input.value, input);
      return;
    }
    if (event.key === "Backspace" && input.value === "" && tags.length > 0) {
      remove(tags.length - 1);
    }
  }

  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1 shadow-sm">
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted px-2 text-xs"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${tag}`}
            onClick={() => remove(index)}
          >
            <Icon name="codicon:close" />
          </button>
        </span>
      ))}
      <input
        id={id}
        className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
        placeholder={tags.length === 0 ? placeholder : ""}
        onKeyDown={handleKeyDown}
        onBlur={(event) => commit(event.currentTarget.value, event.currentTarget)}
      />
    </div>
  );
}

function FieldWrapper({
  param,
  fieldId,
  inline,
  children,
}: {
  param: OpenAPIParameter;
  fieldId: string;
  inline?: boolean;
  children: ReactNode;
}) {
  const label = (
    <label htmlFor={fieldId} className="text-sm font-medium">
      {param.name}
      {param.required && <span className="text-destructive"> *</span>}
    </label>
  );

  if (inline) {
    return (
      <div className="grid grid-cols-[10rem_1fr] items-start gap-x-3 gap-y-0.5">
        <div className="flex h-9 items-center">{label}</div>
        <div className="min-w-0">{children}</div>
        {param.description && (
          <p className="col-start-2 text-xs text-muted-foreground">{param.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label}
      {children}
      {param.description && <p className="text-xs text-muted-foreground">{param.description}</p>}
    </div>
  );
}

export function normalizeParameters(
  parameters: OpenAPIParameter[],
  path: string,
): OpenAPIParameter[] {
  const pathParams = pathParamNames(path);
  const firstPathParam = pathParams[0];
  const seen = new Set(parameters.map((param) => param.name));
  const normalized = parameters.filter(
    (param) => !(param.name === "args" && firstPathParam != null && !seen.has(firstPathParam)),
  );
  for (const name of pathParams) {
    if (seen.has(name)) continue;
    normalized.unshift({
      name,
      in: "path",
      required: true,
      description: "Path parameter",
      schema: { type: "string" },
    });
  }
  return normalized;
}

export function pathParamNames(path: string): string[] {
  return [...path.matchAll(/\{([^}]+)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
}

function buildInitialState(
  parameters: OpenAPIParameter[],
  path: string,
  overrides?: Record<string, string>,
): FormState {
  const state: FormState = {};
  for (const p of parameters) {
    state[p.name] = initialParamValue(p, overrides?.[p.name]);
  }
  for (const name of pathParamNames(path)) {
    if (state[name] == null) {
      state[name] = overrides?.[name] ?? "";
    }
  }
  return state;
}

function initialParamValue(param: OpenAPIParameter, override: string | undefined): string {
  if (override != null) return sanitizeInitialValue(param, override);
  const value = param.schema?.default;
  if (value == null) return "";
  return sanitizeInitialValue(param, String(value));
}

function sanitizeInitialValue(param: OpenAPIParameter, value: string): string {
  const trimmed = value.trim();
  if (trimmed === "[]" || trimmed === "null") return "";
  if (isDateParam(param) && isZeroDate(trimmed)) return "";
  return value;
}

export function submitValue(param: OpenAPIParameter, value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "[]" || trimmed === "null") return null;
  if (isDateParam(param) && isZeroDate(trimmed)) return null;
  return trimmed;
}

function splitArgsValue(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Use comma splitting below.
  }
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isMultiValueParam(param: OpenAPIParameter): boolean {
  const text = `${param.name} ${param.description ?? ""}`.toLowerCase();
  return (
    param.schema?.type === "array" ||
    String(param.schema?.default ?? "") === "[]" ||
    text.includes("repeatable")
  );
}

function parseTags(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "[]" || trimmed === "null") return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Fall back to comma-delimited tags below.
  }
  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function serializeTags(tags: string[]): string {
  return tags.join(",");
}

function isDateParam(param: OpenAPIParameter): boolean {
  const format = param.schema?.format?.toLowerCase();
  const text = `${param.name} ${param.description ?? ""}`.toLowerCase();
  return format === "date" || format === "date-time" || text.includes("date");
}

function isZeroDate(value: string): boolean {
  return value.startsWith("0001-01-01") || value === "0001-01-01";
}

function dateInputValue(value: string, dateTime: boolean): string {
  if (!value || value.startsWith("0001-01-01")) return "";
  if (!dateTime) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 16);
  const offset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
}

function dateOutputValue(value: string, dateTime: boolean): string {
  if (!value) return "";
  if (!dateTime) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}

const inputClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";
