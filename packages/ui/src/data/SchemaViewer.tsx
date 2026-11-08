import { useMemo, useState, type ReactNode } from "react";
import { SegmentedControl } from "../components/SegmentedControl";
import { UiListTree, UiTable } from "../icons";
import { rehydrateRefs } from "../components/json-schema-form-refs";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import { cn } from "../lib/utils";
import { CodeBlock } from "./CodeBlock";
import { Tree } from "./Tree";
import { SchemaTypeIcon } from "./SchemaTypeIcon";
import { SchemaViewerTable } from "./SchemaViewerTable";
import { groupedSchemaRoots, selectSchemaSections, type SchemaViewerSection } from "./schema-viewer-sections";
import {
  buildSchemaTree,
  type SchemaViewerFieldMeta,
  type SchemaViewerNode,
} from "./schema-viewer-model";

export type { SchemaViewerSection } from "./schema-viewer-sections";
export type SchemaViewerView = "tree" | "table";

export interface SchemaViewerProps {
  /** Ordered sections selecting root fields. Unselected fields follow as Other fields. */
  sections?: readonly SchemaViewerSection[];
  view?: SchemaViewerView;
  defaultView?: SchemaViewerView;
  onViewChange?: (view: SchemaViewerView) => void;
  showViewToggle?: boolean;
  schema: JsonSchemaObject;
  /** Pre-scoped tree roots, for dialogs that want to show a single schema branch. */
  roots?: SchemaViewerNode[];
  /** Custom tree builder. Defaults to buildSchemaTree. */
  buildTree?: (schema: JsonSchemaObject) => SchemaViewerNode[];
  className?: string;
  empty?: ReactNode;
  showControls?: boolean;
  toolbarClassName?: string;
  /** Root depth opened by default. Defaults to 1, matching the platform tree. */
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
  sections,
  view: controlledView,
  defaultView = "tree",
  onViewChange,
  showViewToggle = true,
}: SchemaViewerProps) {
  const [localView, setLocalView] = useState(defaultView);
  const [query, setQuery] = useState("");
  const view = controlledView ?? localView;
  if (controlledView !== undefined && !onViewChange) throw new Error("Controlled SchemaViewer view requires onViewChange");
  const roots = useMemo(
    () => scopedRoots ?? buildTree(rehydrateRefs(schema)),
    [buildTree, scopedRoots, schema],
  );
  const groups = useMemo(() => selectSchemaSections(roots, sections), [roots, sections]);
  const groupedRoots = useMemo(() => groupedSchemaRoots(groups), [groups]);
  const detailPanel = renderDetail ?? ((meta: SchemaViewerFieldMeta) => <SchemaFieldMetaPanel meta={meta} />);
  const selector = showViewToggle ? <SegmentedControl<SchemaViewerView> aria-label="Schema view" size="sm" value={view} onChange={(next) => {
        if (controlledView === undefined) setLocalView(next);
        onViewChange?.(next);
      }} options={[{ id: "tree", label: "Tree", icon: UiListTree }, { id: "table", label: "Table", icon: UiTable }]} /> : null;

  return <div className={cn("min-w-0 text-sm", className)}>
    {view === "table" ? <SchemaViewerTable groups={groups} renderDetail={detailPanel} showControls={showControls !== false} actions={selector} query={query} onQueryChange={setQuery} /> :
    <Tree<SchemaViewerNode>
      roots={groupedRoots}
      getKey={(node) => node.key}
      getChildren={(node) => node.children}
      isSecondary={(node) => Boolean(node.detail)}
      getSearchText={(node) =>
        node.detail ? "" : `${node.label} ${node.badge ?? ""} ${node.platformType ?? ""} ${node.ascode ?? ""}`
      }
      defaultOpen={(node, depth) => depth < defaultOpenDepth + (sections ? 1 : 0) && !isDetailOnly(node)}
      rowClass={(node, selected) =>
        node.detail || !node.children?.length
          ? "cursor-default"
          : selected
            ? "bg-primary/10 border-l-2 border-primary"
            : "hover:bg-accent"
      }
      renderRow={({ node }) =>
        node.detail ? (
          <div className="min-w-0 flex-1">
            {detailPanel(node.detail)}
          </div>
        ) : (
          <SchemaViewerRow node={node} />
        )
      }
      empty={empty}
      showControls={showControls !== false && groupedRoots.some((node) => (node.children?.length ?? 0) > 0)}
      showSearch={showControls !== false}
      searchLabel="Filter schema fields"
      searchQuery={query}
      onSearchQueryChange={setQuery}
      actions={selector}
      toolbarClassName={cn("schema-viewer-toolbar", toolbarClassName)}
    />}
  </div>;
}

export function SchemaViewerRow({ node }: { node: SchemaViewerNode }) {
  return (
    <span className="flex w-full min-w-0 items-center gap-2">
      <span data-schema-key={node.key} {...(node.section ? { "data-schema-section": node.key } : {})} className={cn("shrink-0 whitespace-nowrap font-mono", node.section && "font-semibold")}>{node.label}</span>
      {node.badge && <SchemaTypeIcon type={node.badge} />}
      {(node.meta?.constValue !== undefined || node.meta?.defaultValue !== undefined) && <code className="shrink-0 text-xs text-muted-foreground">
        {node.meta.constValue ?? `default: ${node.meta.defaultValue}`}
      </code>}
      {node.count !== undefined && (
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
          {node.count}
        </span>
      )}
      {node.platformType && (
        <span className="shrink-0 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200">
          {node.platformType}
        </span>
      )}
      {node.ascode && (
        <span className="shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
          code: {node.ascode}
        </span>
      )}
      {node.description && (
        <span title={node.description} className="min-w-0 truncate text-xs text-muted-foreground">{node.description}</span>
      )}
    </span>
  );
}

export interface SchemaFieldMetaPanelProps {
  meta: SchemaViewerFieldMeta;
}

const ENUM_LIMIT = 12;
const PLATFORM_TYPE_LABEL = ["OI", "PA type"].join("");

export function SchemaFieldMetaPanel({ meta }: SchemaFieldMetaPanelProps) {
  const enums = meta.enumValues ?? [];
  const shown = enums.slice(0, ENUM_LIMIT);
  const hidden = enums.length - shown.length;
  const loc = meta.location;

  return (
    <div className="my-1 space-y-2 rounded-md border border-border bg-muted/30 p-2 text-xs">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <Row label={PLATFORM_TYPE_LABEL} value={meta.platformType} />
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
