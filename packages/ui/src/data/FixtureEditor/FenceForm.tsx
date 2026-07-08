import { useMemo, type ReactNode } from "react";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import { Badge } from "../Badge";
import type { FixtureEditorSize } from "./types";
import {
  parseFixtureYaml,
  stringifyFixtureYaml,
  type ParsedFixtureYaml,
} from "./fixture-blocks";
import { RawFenceEditor } from "./RawFenceEditor";

export type FenceFormProps = {
  info: string;
  body: string;
  schema: JsonSchemaObject | undefined;
  parseAsYaml: boolean;
  known: boolean;
  readOnly: boolean;
  size: FixtureEditorSize;
  onChangeBody: (body: string) => void;
};

export function FenceForm({
  info,
  body,
  schema,
  parseAsYaml,
  known,
  readOnly,
  onChangeBody,
}: FenceFormProps) {
  const parsed = useMemo<ParsedFixtureYaml | undefined>(
    () => (parseAsYaml ? parseFixtureYaml(body) : undefined),
    [body, parseAsYaml],
  );
  const raw = useMemo(
    () => (!parseAsYaml ? parseRawFenceValue(body) : undefined),
    [body, parseAsYaml],
  );
  const formValue = parseAsYaml
    ? parsed?.ok === true
      ? parsed.value
      : undefined
    : raw?.value;
  const canRenderForm = schema != null && formValue != null;

  if (!canRenderForm) {
    return (
      <NestedPanel title="Source" aside={sourceBadge(parseAsYaml, schema, parsed, known)}>
        <RawFenceEditor
          info={info}
          body={body}
          helper={parsed?.ok === false ? parsed.error : undefined}
          readOnly={readOnly}
          onChange={onChangeBody}
        />
      </NestedPanel>
    );
  }

  return (
    <div className="flex flex-col border-t border-border">
      <NestedPanel title="Structured options">
        <JsonSchemaForm
          schema={schema}
          value={formValue}
          onChange={(next) =>
            onChangeBody(
              parseAsYaml
                ? stringifyFixtureYaml(next)
                : stringifyRawFenceValue(next),
            )
          }
          readOnly={readOnly}
          size="md"
          showPreferencesMenu={false}
          persistPreferences={false}
          layout={{
            mode: "inline",
            labelMaxWidth: "12rem",
            valueMaxWidth: "min(100%, 34rem)",
          }}
        />
      </NestedPanel>
      <NestedPanel title="Source">
        <RawFenceEditor
          info={info}
          body={body}
          readOnly={readOnly}
          onChange={onChangeBody}
        />
      </NestedPanel>
    </div>
  );
}

function parseRawFenceValue(body: string): { value: Record<string, unknown> } {
  const parsed = parseFixtureYaml(body);
  if (
    parsed.ok &&
    isRecord(parsed.value) &&
    typeof parsed.value.content === "string"
  ) {
    return { value: parsed.value };
  }
  return { value: { content: body } };
}

function stringifyRawFenceValue(value: Record<string, unknown>): string {
  const content = typeof value.content === "string" ? value.content : "";
  const compact: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value)) {
    if (key === "content") continue;
    if (isEmptyValue(field)) continue;
    compact[key] = field;
  }
  if (Object.keys(compact).length === 0) {
    return content;
  }
  return stringifyFixtureYaml({ content, ...compact });
}

function isEmptyValue(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isRecord(value)) return Object.keys(value).length === 0;
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function sourceBadge(
  parseAsYaml: boolean,
  schema: JsonSchemaObject | undefined,
  parsed: ParsedFixtureYaml | undefined,
  known: boolean,
) {
  if (parsed?.ok === false) {
    return (
      <Badge variant="status" status="error" size="xs" clickToCopy={false}>
        YAML error
      </Badge>
    );
  }

  if (parseAsYaml && schema == null && !known) {
    return (
      <Badge variant="status" status="warning" size="xs" clickToCopy={false}>
        Unknown fence
      </Badge>
    );
  }

  return undefined;
}

function NestedPanel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border last:border-b-0">
      <div className="flex min-h-9 items-center justify-between gap-3 bg-muted/30 px-4 py-2">
        <h4 className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          {title}
        </h4>
        {aside}
      </div>
      <div className="min-w-0 p-4">{children}</div>
    </section>
  );
}
