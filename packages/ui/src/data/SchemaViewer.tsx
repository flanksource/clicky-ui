import { useMemo, type ReactNode } from "react";
import { rehydrateRefs } from "../components/json-schema-form-refs";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import { cn } from "../lib/utils";
import { CodeBlock } from "./CodeBlock";
import { Tree } from "./Tree";
import {
  buildSchemaTree,
  type SchemaViewerFieldMeta,
  type SchemaViewerNode,
} from "./schema-viewer-model";

export interface SchemaViewerProps {
  schema: JsonSchemaObject;
  /** Pre-scoped tree roots, for dialogs that want to show a single schema branch. */
  roots?: SchemaViewerNode[];
  /** Custom tree builder. Defaults to buildSchemaTree. */
  buildTree?: (schema: JsonSchemaObject) => SchemaViewerNode[];
  className?: string;
  empty?: ReactNode;
  showControls?: boolean;
  toolbarClassName?: string;
  /** Root depth opened by default. Defaults to 1, matching the OIPA tree. */
  defaultOpenDepth?: number;
  /** Override the expanded detail panel for annotated fields. */
  renderDetail?: (meta: SchemaViewerFieldMeta) => ReactNode;
}

function isDetailOnly(node: SchemaViewerNode): boolean {
  const [child] = node.children ?? [];
  return node.children?.length === 1 && Boolean(child?.detail);
}

export function SchemaViewer({
  schema,
  roots: scopedRoots,
  buildTree = buildSchemaTree,
  className,
  empty = <p className="p-3 text-sm text-muted-foreground">This schema has no fields.</p>,
  showControls,
  toolbarClassName,
  defaultOpenDepth = 1,
  renderDetail,
}: SchemaViewerProps) {
  const roots = useMemo(
    () => scopedRoots ?? buildTree(rehydrateRefs(schema)),
    [buildTree, scopedRoots, schema],
  );

  return (
    <Tree<SchemaViewerNode>
      className={cn("text-sm", className)}
      roots={roots}
      getKey={(node) => node.key}
      getChildren={(node) => node.children}
      isSecondary={(node) => Boolean(node.detail)}
      getSearchText={(node) =>
        node.detail ? "" : `${node.label} ${node.badge ?? ""} ${node.oipaType ?? ""} ${node.ascode ?? ""}`
      }
      defaultOpen={(node, depth) => depth < defaultOpenDepth && !isDetailOnly(node)}
      rowClass={(node, selected) =>
        node.detail
          ? "cursor-default"
          : selected
            ? "bg-primary/10 border-l-2 border-primary"
            : "hover:bg-accent"
      }
      renderRow={({ node }) =>
        node.detail ? (
          <div className="min-w-0 flex-1">
            {renderDetail ? renderDetail(node.detail) : <SchemaFieldMetaPanel meta={node.detail} />}
          </div>
        ) : (
          <SchemaViewerRow node={node} />
        )
      }
      empty={empty}
      {...(showControls !== undefined ? { showControls } : {})}
      {...(toolbarClassName !== undefined ? { toolbarClassName } : {})}
    />
  );
}

const BADGE_TONE: Record<string, string> = {
  branch: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200",
  group: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200",
  activity: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200",
  clientType: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200",
  clientTypes: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200",
  fields: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
  object: "bg-muted text-muted-foreground",
  array: "bg-muted text-muted-foreground",
  string: "bg-muted text-muted-foreground",
  number: "bg-muted text-muted-foreground",
  integer: "bg-muted text-muted-foreground",
  boolean: "bg-muted text-muted-foreground",
  const: "bg-muted text-muted-foreground",
};

export function SchemaViewerRow({ node }: { node: SchemaViewerNode }) {
  const tone = node.badge ? BADGE_TONE[node.badge] : undefined;
  return (
    <span className="flex w-full min-w-0 items-center gap-2">
      <span className="min-w-0 truncate font-mono">{node.label}</span>
      {node.badge && (
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
            tone ?? "bg-muted text-muted-foreground",
          )}
        >
          {node.badge}
        </span>
      )}
      {node.count !== undefined && (
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
          {node.count}
        </span>
      )}
      {node.oipaType && (
        <span className="shrink-0 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200">
          {node.oipaType}
        </span>
      )}
      {node.ascode && (
        <span className="shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
          code: {node.ascode}
        </span>
      )}
      {node.description && (
        <span className="min-w-0 truncate text-xs text-muted-foreground">{node.description}</span>
      )}
    </span>
  );
}

export interface SchemaFieldMetaPanelProps {
  meta: SchemaViewerFieldMeta;
}

const ENUM_LIMIT = 12;

export function SchemaFieldMetaPanel({ meta }: SchemaFieldMetaPanelProps) {
  const enums = meta.enumValues ?? [];
  const shown = enums.slice(0, ENUM_LIMIT);
  const hidden = enums.length - shown.length;
  const loc = meta.location;

  return (
    <div className="my-1 space-y-2 rounded-md border border-border bg-muted/30 p-2 text-xs">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <Row label="OIPA type" value={meta.oipaType} />
        <Row label="AsCode" value={meta.ascode} />
        <Row label="Format" value={meta.format} />
        <Row label="Layout" value={meta.layout} />
        <Row label="Client ref" value={meta.clientRef ? "yes" : undefined} />
        {meta.annotations?.map((annotation) => (
          <Row key={annotation.key} label={annotation.key} value={annotation.value} />
        ))}
      </dl>

      {meta.description && <p className="text-muted-foreground">{meta.description}</p>}

      {enums.length > 0 && (
        <div className="space-y-0.5">
          <p className="font-medium text-muted-foreground">Enum ({enums.length})</p>
          <ul className="max-h-48 space-y-0.5 overflow-auto">
            {shown.map((entry) => (
              <li key={entry.value}>
                <span className="font-mono">{entry.value}</span>
                {entry.label && <span className="text-muted-foreground"> - {entry.label}</span>}
              </li>
            ))}
          </ul>
          {hidden > 0 && <p className="text-muted-foreground">+{hidden} more</p>}
        </div>
      )}

      {meta.query && (
        <div className="space-y-0.5">
          <p className="font-medium text-muted-foreground">Query</p>
          <div className="max-h-64 overflow-auto">
            <CodeBlock language="sql" source={meta.query} />
          </div>
        </div>
      )}

      {loc && (
        <div className="space-y-0.5">
          <p className="font-medium text-muted-foreground">Source location</p>
          <p className="break-all font-mono">{formatLocation(loc.path, loc.startLine, loc.endLine)}</p>
        </div>
      )}

      {meta.source && (
        <div className="space-y-0.5">
          <p className="font-medium text-muted-foreground">Source</p>
          <div className="max-h-64 overflow-auto">
            <CodeBlock language="xml" source={meta.source} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }): ReactNode {
  if (value === undefined || value === null) return null;
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-mono">{value}</dd>
    </>
  );
}

function formatLocation(path: string, startLine?: number, endLine?: number): string {
  if (startLine === undefined) return path;
  if (endLine === undefined || endLine === startLine) return `${path}:${startLine}`;
  return `${path}:${startLine}-${endLine}`;
}
