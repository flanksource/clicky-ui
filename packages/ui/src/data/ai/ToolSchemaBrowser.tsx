import { useMemo, useState } from "react";
import {
  ListMenu,
  ListMenuHeader,
  ListMenuItem,
  ListMenuSection,
} from "../../components/ListMenu";
import { cn } from "../../lib/utils";
import { SplitPane } from "../../layout/SplitPane";
import { Tabs } from "../../layout/Tabs";
import { CodeBlock } from "../CodeBlock";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  UiChevronDown,
  UiChevronRight,
  UiCode2,
  UiLayers,
  UiListDashes,
  UiSearch,
  UiWrench,
} from "../../icons";
import { SchemaViewer } from "../SchemaViewer";
import type {
  ChatToolInputSchema,
  ToolAnnotations,
  ToolMeta,
} from "../chat/types";

export type ToolSchemaBrowserProps = {
  tools: ToolMeta[];
  className?: string;
};

/** Which dimension is the outer (primary) grouping. "group" nests parents inside
 *  each tool-group; "tree" nests groups inside each parent surface. Whichever is
 *  primary, the other becomes the inner level, so both views stay two-deep. */
type ViewMode = "group" | "tree";
type BrowserTab = "schema" | "json";

const NO_GROUP = "Tools";
const NO_PARENT = "General";
const EMPTY_SCHEMA: ChatToolInputSchema = { type: "object", properties: {} };

export function ToolSchemaBrowser({
  tools,
  className,
}: ToolSchemaBrowserProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("group");
  const [tab, setTab] = useState<BrowserTab>("schema");
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(
    tools[0]?.name ?? null,
  );

  const searching = query.trim().length > 0;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((tool) =>
      [
        tool.name,
        tool.label,
        tool.title,
        tool.description,
        tool.group,
        tool.parent,
        tool.entity,
        tool.icon,
        tool.defaultPermission,
        tool.source,
        tool.server,
        ...annotationSearchText(tool.annotations),
        ...(tool.hints ?? []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [query, tools]);
  const active =
    tools.find((tool) => tool.name === selected) ?? filtered[0] ?? tools[0];
  const sections = useMemo(
    () => buildSections(filtered, view),
    [filtered, view],
  );

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  // While searching we force-expand so matches are never hidden behind a
  // collapsed node.
  const isOpen = (key: string) => searching || !collapsed.has(key);

  return (
    <div
      className={cn(
        "min-h-0 overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
    >
      <SplitPane
        defaultSplit={34}
        minLeft={24}
        minRight={42}
        className="min-h-0"
        leftClass="flex min-h-0 flex-col overflow-hidden"
        rightClass="min-h-0 overflow-y-auto"
        left={
          <ToolSidebar
            query={query}
            view={view}
            sections={sections}
            active={active}
            filteredCount={filtered.length}
            isOpen={isOpen}
            onQueryChange={setQuery}
            onViewChange={setView}
            onToggle={toggle}
            onSelect={setSelected}
          />
        }
        right={
          active ? (
            <ToolDetail tool={active} tab={tab} onTabChange={setTab} />
          ) : (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              No tools
            </div>
          )
        }
      />
    </div>
  );
}

function ToolSidebar({
  query,
  view,
  sections,
  active,
  filteredCount,
  isOpen,
  onQueryChange,
  onViewChange,
  onToggle,
  onSelect,
}: {
  query: string;
  view: ViewMode;
  sections: ToolSection[];
  active: ToolMeta | undefined;
  filteredCount: number;
  isOpen: (key: string) => boolean;
  onQueryChange: (query: string) => void;
  onViewChange: (view: ViewMode) => void;
  onToggle: (key: string) => void;
  onSelect: (name: string) => void;
}) {
  return (
    <>
      <label className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-2 text-xs">
        <Icon icon={UiSearch} className="size-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search tools"
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1">
        <ViewToggleButton
          active={view === "group"}
          icon={UiListDashes}
          label="Group"
          onClick={() => onViewChange("group")}
        />
        <ViewToggleButton
          active={view === "tree"}
          icon={UiLayers}
          label="Tree"
          onClick={() => onViewChange("tree")}
        />
      </div>
      <ListMenu className="min-h-0 flex-1 overflow-y-auto divide-y-0">
        {sections.map((section) => {
          const sectionKey = `p:${section.label}`;
          const sectionOpen = isOpen(sectionKey);
          return (
            <ListMenuSection key={sectionKey}>
              <ListMenuHeader className="px-0 py-0">
                <button
                  type="button"
                  onClick={() => onToggle(sectionKey)}
                  className="flex w-full items-center gap-1 px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted"
                >
                  <Icon
                    icon={sectionOpen ? UiChevronDown : UiChevronRight}
                    className="size-3 shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {section.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground/70">
                    {section.count}
                  </span>
                </button>
              </ListMenuHeader>
              {sectionOpen &&
                section.children.map((child) => {
                  const childKey = `s:${section.label}///${child.label}`;
                  const childOpen = isOpen(childKey);
                  return (
                    <div key={childKey}>
                      <button
                        type="button"
                        onClick={() => onToggle(childKey)}
                        className="flex w-full items-center gap-1 border-b border-border bg-background px-2 py-1 pl-3 text-left text-[11px] font-medium text-foreground/80 hover:bg-accent/50"
                      >
                        <Icon
                          icon={childOpen ? UiChevronDown : UiChevronRight}
                          className="size-3 shrink-0 text-muted-foreground"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {child.label}
                        </span>
                        <span className="tabular-nums text-[10px] text-muted-foreground/70">
                          {child.tools.length}
                        </span>
                      </button>
                      {childOpen &&
                        child.tools.map((tool) => (
                          <ToolSidebarRow
                            key={tool.name}
                            tool={tool}
                            active={active?.name === tool.name}
                            onSelect={() => onSelect(tool.name)}
                          />
                        ))}
                    </div>
                  );
                })}
            </ListMenuSection>
          );
        })}
        {filteredCount === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No matching tools
          </div>
        )}
      </ListMenu>
    </>
  );
}

function ToolSidebarRow({
  tool,
  active,
  onSelect,
}: {
  tool: ToolMeta;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <ListMenuItem
      active={active}
      role="button"
      tabIndex={0}
      aria-selected={active}
      className="px-2 py-2 pl-6"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2">
        {tool.icon ? (
          <Icon
            name={tool.icon}
            className="mt-0.5 size-3.5 text-muted-foreground"
          />
        ) : (
          <Icon
            icon={UiWrench}
            className="mt-0.5 size-3.5 text-muted-foreground"
          />
        )}
        <span className="min-w-0 truncate text-xs font-medium">
          {tool.label || tool.name}
        </span>
      </div>
    </ListMenuItem>
  );
}

function ToolDetail({
  tool,
  tab,
  onTabChange,
}: {
  tool: ToolMeta;
  tab: BrowserTab;
  onTabChange: (tab: BrowserTab) => void;
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
            <p className="mt-1 text-xs text-muted-foreground">
              {tool.description}
            </p>
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
        onChange={(next) => onTabChange(next as BrowserTab)}
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

function ViewToggleButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: StaticIconComponent;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50",
      )}
    >
      <Icon icon={icon} className="size-3.5" />
      {label}
    </button>
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

function HintChips({
  annotations,
  compact = false,
}: {
  annotations: ToolAnnotations | undefined;
  compact?: boolean;
}) {
  const chips = wellKnownHintChips(annotations);
  if (chips.length === 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1",
        compact ? "text-[9px]" : "text-[10px]",
      )}
    >
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
      <dd className={cn("min-w-0 break-all", mono && "font-mono")}>
        {String(value)}
      </dd>
    </>
  );
}

type ToolSection = {
  label: string;
  count: number;
  children: Array<{ label: string; tools: ToolMeta[] }>;
};

/** Buckets tools two levels deep. In "group" view the outer level is the
 *  tool-group and the inner level is the parent surface; "tree" swaps them so
 *  the parent surface is outer and the group nests inside. Either way the
 *  non-primary dimension is the nested one. */
function buildSections(tools: ToolMeta[], view: ViewMode): ToolSection[] {
  const outerOf = (tool: ToolMeta) =>
    view === "group" ? tool.group || NO_GROUP : tool.parent || NO_PARENT;
  const innerOf = (tool: ToolMeta) =>
    view === "group" ? tool.parent || NO_PARENT : tool.group || NO_GROUP;

  const outer = new Map<string, Map<string, ToolMeta[]>>();
  for (const tool of tools) {
    const o = outerOf(tool);
    const i = innerOf(tool);
    const inner = outer.get(o) ?? new Map<string, ToolMeta[]>();
    (inner.get(i) ?? inner.set(i, []).get(i)!).push(tool);
    outer.set(o, inner);
  }

  return [...outer.entries()]
    .map(([label, inner]) => {
      const children = [...inner.entries()]
        .map(([childLabel, childTools]) => ({
          label: childLabel,
          tools: [...childTools].sort((a, b) =>
            (a.label || a.name).localeCompare(b.label || b.name),
          ),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return {
        label,
        count: children.reduce((sum, child) => sum + child.tools.length, 0),
        children,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
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

function compactObject(
  record: Record<string, unknown>,
): Record<string, unknown> {
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

function annotationSearchText(
  annotations: ToolAnnotations | undefined,
): string[] {
  if (!annotations) return [];
  return Object.entries(annotations)
    .flatMap(([key, value]) => [key, primitiveAnnotationText(value)])
    .filter((value): value is string => Boolean(value));
}

function primitiveAnnotationText(value: unknown): string | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return undefined;
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
    (chip): chip is { key: string; label: string; className: string } =>
      chip !== null,
  );
}
