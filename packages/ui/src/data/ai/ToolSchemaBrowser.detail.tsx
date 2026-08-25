import { useMemo } from "react";
import { Tabs } from "../../layout/Tabs";
import { cn } from "../../lib/utils";
import { UiCode2 } from "../../icons";
import { CodeBlock } from "../CodeBlock";
import { Icon } from "../Icon";
import { SchemaViewer } from "../SchemaViewer";
import type {
  ChatToolInputSchema,
  ToolAnnotations,
  ToolMeta,
} from "../chat/types";
import type { ToolSchemaBrowserTab } from "./ToolSchemaBrowser.model";

const EMPTY_SCHEMA: ChatToolInputSchema = { type: "object", properties: {} };

export function ToolSchemaBrowserDetail({
  tool,
  tab,
  onTabChange,
}: {
  tool: ToolMeta;
  tab: ToolSchemaBrowserTab;
  onTabChange: (tab: ToolSchemaBrowserTab) => void;
}) {
  const strict = effectiveToolStrictness(tool);
  const runtimePreview = useMemo(() => buildRuntimeToolPreview(tool), [tool]);
  return (
    <div className="space-y-3 p-3">
      <div className="min-w-0 space-y-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            {tool.icon ? (
              <Icon name={tool.icon} className="size-4 text-muted-foreground" />
            ) : (
              <Icon icon={UiCode2} className="size-4 text-muted-foreground" />
            )}
            <div className="min-w-0 truncate text-sm font-medium">
              {tool.parent ? `${tool.parent} ` : ""}
              {tool.label || tool.name}
            </div>
            <StrictnessBadge strict={strict} />
          </div>
          {tool.description && (
            <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p>
          )}
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
          <DetailRow label="Tool ID" value={tool.name} mono />
          <DetailRow label="Default" value={tool.defaultPermission} />
          <DetailRow label="Strictness" value={strict ? "Strict" : "Loose"} />
          <DetailRow label="Icon" value={tool.icon} mono />
          <DetailRow label="Source" value={tool.source} />
          <DetailRow label="Group" value={tool.group} />
          <DetailRow label="Parent" value={tool.parent} />
          <DetailRow label="Server" value={tool.server} />
          <DetailRow label="Method" value={tool.method} />
          <DetailRow label="Path" value={tool.path} mono />
        </dl>
        <HintChips annotations={tool.annotations} />
        <ToolAnnotationsPanel annotations={tool.annotations} />
        {tool.hints && tool.hints.length > 0 && (
          <div className="rounded border border-border bg-muted/20 p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hints
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {tool.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Tabs
        value={tab}
        onChange={(next) => onTabChange(next as ToolSchemaBrowserTab)}
        tabs={[
          { id: "schema", label: "Schema" },
          { id: "json", label: "JSON" },
        ]}
      />
      {tab === "schema" ? (
        <div role="tabpanel" className="space-y-3">
          <SchemaViewer
            schema={tool.inputSchema ?? EMPTY_SCHEMA}
            defaultOpenDepth={2}
            showControls={false}
          />
          {tool.outputSchema && (
            <div className="border-t border-border pt-3">
              <div className="mb-2 text-xs font-semibold">Output</div>
              <SchemaViewer
                schema={tool.outputSchema}
                defaultOpenDepth={1}
                showControls={false}
              />
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel">
          <CodeBlock
            language="json"
            source={JSON.stringify(runtimePreview, null, 2)}
            jsonDefaultOpenDepth={2}
            copyable
          />
        </div>
      )}
    </div>
  );
}

function StrictnessBadge({ strict }: { strict: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
        strict
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
      title={strict ? "Strict input schema" : "Loose input schema"}
    >
      {strict ? "Strict" : "Loose"}
    </span>
  );
}

function HintChips({ annotations }: { annotations: ToolAnnotations | undefined }) {
  const chips = wellKnownHintChips(annotations);
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 text-[10px]">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn("rounded px-1.5 py-0.5 font-medium", chip.className)}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function ToolAnnotationsPanel({
  annotations,
}: {
  annotations: ToolAnnotations | undefined;
}) {
  const entries = annotationEntries(annotations);
  if (entries.length === 0) return null;
  return (
    <div className="rounded border border-border bg-muted/20 p-2">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Annotations
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
        {entries.map(([key, value]) => (
          <DetailRow
            key={key}
            label={key}
            value={formatAnnotationValue(value)}
            mono={typeof value !== "boolean"}
          />
        ))}
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 break-all", mono && "font-mono")}>{String(value)}</dd>
    </>
  );
}

function effectiveToolStrictness(tool: ToolMeta): boolean {
  if (tool.strict !== undefined) return tool.strict;
  return tool.inputSchema?.additionalProperties === false;
}

function buildRuntimeToolPreview(tool: ToolMeta) {
  return compactObject({
    name: tool.name,
    description:
      tool.description ?? tool.annotations?.title ?? tool.title ?? tool.label,
    inputSchema: tool.inputSchema ?? EMPTY_SCHEMA,
    outputSchema: tool.outputSchema,
    strict: effectiveToolStrictness(tool),
    annotations: tool.annotations,
    metadata: compactObject({
      label: tool.label,
      title: tool.title,
      icon: tool.icon,
      group: tool.group,
      parent: tool.parent,
      entity: tool.entity,
      defaultPermission: tool.defaultPermission,
      source: tool.source,
      server: tool.server,
      method: tool.method,
      path: tool.path,
      operationName: tool.operationName,
      preferenceKey: tool.preferenceKey,
    }),
  });
}

function compactObject(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      ) {
        return false;
      }
      return true;
    }),
  );
}

function annotationEntries(
  annotations: ToolAnnotations | undefined,
): Array<[string, unknown]> {
  if (!annotations) return [];
  const order = [
    "title",
    "readOnlyHint",
    "destructiveHint",
    "idempotentHint",
    "openWorldHint",
  ];
  const seen = new Set(order);
  const known = order
    .filter((key) => annotations[key] !== undefined)
    .map((key) => [key, annotations[key]] as [string, unknown]);
  const rest = Object.entries(annotations).filter(([key]) => !seen.has(key));
  return [...known, ...rest];
}

function formatAnnotationValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  return JSON.stringify(value);
}

function wellKnownHintChips(annotations: ToolAnnotations | undefined) {
  if (!annotations) return [];
  return [
    annotations.readOnlyHint
      ? {
          key: "readOnlyHint",
          label: "Read only",
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        }
      : null,
    annotations.destructiveHint
      ? {
          key: "destructiveHint",
          label: "Destructive",
          className: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        }
      : null,
    annotations.idempotentHint
      ? {
          key: "idempotentHint",
          label: "Idempotent",
          className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
        }
      : null,
    annotations.openWorldHint
      ? {
          key: "openWorldHint",
          label: "Open world",
          className: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
        }
      : null,
  ].filter(
    (chip): chip is { key: string; label: string; className: string } => chip !== null,
  );
}
