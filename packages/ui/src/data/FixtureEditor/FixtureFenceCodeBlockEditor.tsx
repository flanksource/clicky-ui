import { useState } from "react";
import type { MdxEditorCodeBlockEditorProps } from "../../components/MdxEditorField";
import { cn } from "../../lib/utils";
import {
  UiBug,
  UiChevronDown,
  UiChevronRight,
  UiFileCode,
  UiRobotAi,
  UiTerminal,
  UiTest,
} from "../../icons";
import { Badge } from "../Badge";
import { Icon, type StaticIconComponent } from "../Icon";
import { FenceForm } from "./FenceForm";
import {
  fixtureFenceKind,
  fixtureFenceInfo,
  fixtureFenceParsesYaml,
  parseFixtureYaml,
  resolveFixtureFenceSchema,
} from "./fixture-blocks";
import type { FixtureEditorProps, FixtureFenceSchemas } from "./types";

export function FixtureFenceCodeBlockEditor({
  code,
  language,
  meta,
  context,
  schemas,
  readOnly,
  size,
}: MdxEditorCodeBlockEditorProps & {
  schemas: FixtureFenceSchemas;
  readOnly: boolean;
  size: NonNullable<FixtureEditorProps["size"]>;
}) {
  const [expanded, setExpanded] = useState(false);
  const info = fixtureFenceInfo(language, meta) || language || "fence";
  const kind = fixtureFenceKind(language, meta);
  const title = cardTitle(kind, info);
  const schema = resolveFixtureFenceSchema(language, meta, schemas);
  const icon = iconForFenceKind(kind);
  const parseAsYaml = fixtureFenceParsesYaml(language, meta);
  const summary = fenceSummary(code, parseAsYaml);
  const hasYamlError = parseAsYaml && !parseFixtureYaml(code).ok;
  const known =
    schema != null ||
    kind === "test" ||
    kind === "lint" ||
    kind === "exec" ||
    kind === "ai" ||
    kind === "prompt";

  return (
    <section
      className={cn(
        "my-2 w-full min-w-0 max-w-[48rem] overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm transition-colors",
        expanded ? "border-primary/40" : "border-border hover:border-primary/30",
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${title}`}
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-sm">
          <Icon icon={icon} className="text-2xl" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 truncate text-sm font-semibold">{title}</span>
            {hasYamlError && (
              <Badge variant="status" status="error" size="xs" clickToCopy={false}>
                YAML error
              </Badge>
            )}
            {!known && (
              <Badge variant="status" status="warning" size="xs" clickToCopy={false}>
                Unknown
              </Badge>
            )}
          </span>
          <span className="mt-1 block truncate font-mono text-xs text-muted-foreground">
            {info}
          </span>
          {summary && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {summary}
            </span>
          )}
        </span>
        <Icon
          icon={expanded ? UiChevronDown : UiChevronRight}
          className="text-xl text-muted-foreground"
        />
      </button>
      {expanded && (
        <FenceForm
          info={info}
          body={code}
          schema={schema}
          parseAsYaml={parseAsYaml}
          known={known}
          readOnly={readOnly}
          size={size}
          onChangeBody={context.setCode}
        />
      )}
    </section>
  );
}

function iconForFenceKind(kind: ReturnType<typeof fixtureFenceKind>): StaticIconComponent {
  switch (kind) {
    case "ai":
    case "prompt":
      return UiRobotAi;
    case "test":
      return UiTest;
    case "lint":
      return UiBug;
    case "exec":
    case "shell":
      return UiTerminal;
    case "yaml":
    case "code":
      return UiFileCode;
  }
}

function cardTitle(kind: ReturnType<typeof fixtureFenceKind>, info: string): string {
  return kind === "test" || kind === "lint" ? kind : info;
}

function fenceSummary(body: string, parseAsYaml: boolean): string {
  if (parseAsYaml) {
    const parsed = parseFixtureYaml(body);
    if (parsed.ok) {
      const value = parsed.value;
      const name = stringField(value, "name");
      const command = stringField(value, "command");
      const engine = stringField(value, "engine");
      return [name, command, engine].filter(Boolean).join(" - ");
    }
  }

  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? "";
}

function stringField(value: Record<string, unknown>, key: string): string {
  const field = value[key];
  return typeof field === "string" ? field : "";
}
