import type { MouseEvent, ReactNode } from "react";
import { Button } from "../../components/button";
import { UiWarningTriangle } from "../../icons";
import { Badge } from "../Badge";
import { KeyValueList, type KeyValueListItem } from "../KeyValueList";
import { cn } from "../../lib/utils";
import { capitalize, memberAccess, memberChips, propertyLines, type MemberAccess } from "./call-graph-labels";
import { requireNode, walkedTotals, type NodeTotals } from "./call-graph-model";
import { usedGlyphs, type CallGraphVocabulary } from "./call-graph-vocabulary";
import { EdgeTypeGlyph, GlyphIcon, NodeGlyphIcon } from "./CallGraphGlyphs";
import { MemberChipList, MemberChips, NameList } from "./CallGraphMembers";
import type { CallGraph, CallGraphEdge, CallGraphEdgeLabels, CallGraphEdgeType, CallGraphNode, CallGraphSite, SiteGuardsState } from "./types";

/** Where an action goes: a link, a handler, or a link a host router intercepts on a plain click. */
export interface CallGraphAction {
  href?: string;
  onSelect?: () => void;
}

function plainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function ActionTarget({ action, className, label, children }: { action: CallGraphAction; className: string; label: string; children: ReactNode }) {
  const { href, onSelect } = action;
  if (href === undefined) {
    return <button type="button" className={className} aria-label={label} onClick={onSelect}>{children}</button>;
  }
  const onClick = onSelect && ((event: MouseEvent) => {
    if (!plainClick(event)) return;
    event.preventDefault();
    onSelect();
  });
  return <a href={href} className={className} aria-label={label} {...(onClick ? { onClick } : {})}>{children}</a>;
}

function siteLocation(site: CallGraphSite): string {
  return `${site.path ?? "unknown file"}:${site.line ?? "?"}`;
}

/**
 * What a site's guards say: its guards, or "Unconditional" once they are known to be none. A site whose
 * guards the host has yet to load says nothing while they load, and that they are not loaded if that failed.
 */
function SiteGuards({ guards, known }: { guards: string[]; known: GuardsKnown }) {
  if (guards.length > 0) {
    return guards.map((guard, index) => (
      <Badge key={`${index}-${guard}`} variant="outline" size="sm" wrap clickToCopy={false} className="h-auto py-0.5 font-mono">{guard}</Badge>
    ));
  }
  if (known === "loading") return null;
  return <span className="text-xs text-muted-foreground">{known === "known" ? "Unconditional" : "Guards not loaded"}</span>;
}

type GuardsKnown = "known" | "loading" | "failed";

function SiteBody({ site, known }: { site: CallGraphSite; known: GuardsKnown }) {
  return (
    <>
      <span className="block font-mono text-xs text-primary">{siteLocation(site)}</span>
      {site.text && (
        <code className="block max-h-24 overflow-hidden whitespace-pre-wrap break-words rounded bg-muted px-1.5 py-1 font-mono text-xs" title={site.text}>
          {site.text}
        </code>
      )}
      <span className="flex flex-wrap items-center gap-1">
        <SiteGuards guards={site.guards ?? []} known={known} />
      </span>
    </>
  );
}

/** Whether a site without guards has none: always, unless the host loads them, and then once they loaded. */
function guardsKnown(lazy: boolean, guards: SiteGuardsState | undefined): GuardsKnown {
  if (!lazy || guards?.status === "loaded") return "known";
  return guards?.status === "failed" ? "failed" : "loading";
}

/** The edge's type as its icon, with its words as the tooltip. */
function EdgeTypeIcon({ type, labels }: { type: CallGraphEdgeType; labels: CallGraphEdgeLabels }) {
  const words = labels[type];
  return <span title={words} className="flex text-base leading-none"><EdgeTypeGlyph type={type} title={words} /></span>;
}

function isAccess(type: CallGraphEdgeType): boolean {
  return type === "read" || type === "write";
}

/**
 * The columns and fields a collapsed read or write touches, each marked "both" when the edge of the
 * other access type between the same nodes touches it too.
 */
function edgeMembers(edge: CallGraphEdge, graph: CallGraph): MemberAccess[] {
  const own = new Set(memberAccess([edge]).map((member) => `${member.kind}:${member.name}`));
  const siblings = graph.edges.filter((other) => other.id !== edge.id && other.from === edge.from && other.to === edge.to);
  return memberAccess([edge, ...siblings]).filter((member) => own.has(`${member.kind}:${member.name}`));
}

function MemberLists({ members }: { members: readonly MemberAccess[] }) {
  return (
    <>
      <MemberChips label="Columns" members={members.filter((member) => member.kind === "column")} />
      <MemberChips label="Fields" members={members.filter((member) => member.kind === "field")} />
    </>
  );
}

function GuardsStatus({ guards }: { guards: SiteGuardsState | undefined }) {
  if (guards?.status === "loading") return <p role="status" className="text-xs text-muted-foreground">Loading guards…</p>;
  if (guards?.status === "failed") return <p role="alert" className="text-xs text-destructive">{guards.error}</p>;
  return null;
}

/**
 * The call or access sites behind the selected edge: where, the construct as written, and every guard
 * outermost first, after the edge's kind, the columns or fields a collapsed read or write touches, and
 * its other properties. Lazily fetched guards replace the response's sites once they arrive. With
 * `siteAction` each site opens where it is written.
 */
export function EdgeSites({ edge, graph, labels, guards, lazyGuards = false, siteAction }: {
  edge: CallGraphEdge;
  graph: CallGraph;
  labels: CallGraphEdgeLabels;
  guards?: SiteGuardsState | undefined;
  /** The host loads the guards on selection: until `guards` has them, a site is not called unconditional. */
  lazyGuards?: boolean;
  siteAction?: ((site: CallGraphSite) => CallGraphAction) | undefined;
}) {
  const sites = guards?.status === "loaded" ? guards.sites : edge.sites;
  const known = guardsKnown(lazyGuards, guards);
  const properties = propertyLines(memberChips(edge.properties).rest);
  const noun = isAccess(edge.type) ? "access" : "call";
  return (
    <section className="space-y-2" aria-label={`${capitalize(noun)} sites`}>
      <header className="space-y-1">
        <h3 className="break-words text-sm font-semibold">{requireNode(graph, edge.from).label} → {requireNode(graph, edge.to).label}</h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <EdgeTypeIcon type={edge.type} labels={labels} />
          {edge.kind && <Badge variant="outline" size="sm" clickToCopy={false}>{edge.kind}</Badge>}
          <span>{sites.length} {noun} {sites.length === 1 ? "site" : "sites"}</span>
        </div>
        <MemberLists members={edgeMembers(edge, graph)} />
        {properties.length > 0 && (
          <ul className="space-y-0.5 text-xs" aria-label="Edge properties">
            {properties.map((line) => <li key={line} className="break-words font-mono">{line}</li>)}
          </ul>
        )}
      </header>
      <GuardsStatus guards={guards} />
      <ol className="divide-y divide-border rounded-md border border-border">
        {sites.map((site) => (
          <li key={`${siteLocation(site)}:${site.column ?? 0}`}>
            {siteAction ? (
              <ActionTarget action={siteAction(site)} className="block w-full space-y-1.5 px-3 py-2.5 text-left hover:bg-muted" label={`Open ${siteLocation(site)}`}>
                <SiteBody site={site} known={known} />
              </ActionTarget>
            ) : (
              <div className="space-y-1.5 px-3 py-2.5"><SiteBody site={site} known={known} /></div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="break-all font-mono text-xs">{children}</span>;
}

/** The node behind a data node, such as a field's column: a Focus link when the host can re-root. */
function backingItem(node: CallGraphNode, vocabulary: CallGraphVocabulary, onFocus: ((id: string) => void) | undefined): KeyValueListItem[] {
  const backing = vocabulary.backing?.(node);
  if (!backing) return [];
  const value = onFocus
    ? <button type="button" className="break-all font-mono text-xs text-primary hover:underline" aria-label={`Focus ${backing.label}`} onClick={() => onFocus(backing.id)}>{backing.label}</button>
    : <Mono>{backing.label}</Mono>;
  return [{ key: "backing", label: "Column", value }];
}

function totalItems(totals: NodeTotals): KeyValueListItem[] {
  const labels: [keyof NodeTotals, string][] = [["callers", "Callers"], ["callees", "Callees"]];
  return labels.map(([key, label]) => ({ key, label, value: totals[key], hidden: totals[key] === undefined }));
}

/**
 * What a data node's readers and writers touch of it, and who they are: the columns or fields of a
 * collapsed table or entity, each marked read, written or both, then the readers' and writers' names.
 */
function accessItems(node: CallGraphNode, graph: CallGraph, vocabulary: CallGraphVocabulary): KeyValueListItem[] {
  if (!vocabulary.isData(node)) return [];
  const into = graph.edges.filter((edge) => edge.to === node.id);
  const members = memberAccess(into);
  const memberItem = (kind: MemberAccess["kind"], label: string): KeyValueListItem => {
    const touched = members.filter((member) => member.kind === kind);
    return { key: `members:${kind}`, label, value: <MemberChipList label={label} members={touched} />, hidden: touched.length === 0 };
  };
  const namesItem = (type: CallGraphEdgeType, label: string): KeyValueListItem => {
    const names = into.filter((edge) => edge.type === type).map((edge) => requireNode(graph, edge.from).label);
    return { key: type, label, value: <NameList label={label} names={names} />, hidden: names.length === 0 };
  };
  return [memberItem("column", "Columns"), memberItem("field", "Fields"), namesItem("read", "Readers"), namesItem("write", "Writers")];
}

function nodeItems(node: CallGraphNode, graph: CallGraph, vocabulary: CallGraphVocabulary, onFocus: ((id: string) => void) | undefined): KeyValueListItem[] {
  const { module, package: pkg, type, method, signature } = node.identifier;
  const kind = vocabulary.kindOf(graph, node);
  const group = graph.groups?.find((candidate) => candidate.id === node.group)?.label ?? node.group;
  const backing = backingItem(node, vocabulary, onFocus);
  const properties = Object.entries(node.properties ?? {}).filter(([key]) => !(backing.length > 0 && key === "column"));
  const location = node.location;
  return [
    {
      key: "identifier",
      label: "Identifier",
      value: (
        <span className="flex items-center gap-1.5">
          <span title={kind} className="flex shrink-0 text-base leading-none">
            <NodeGlyphIcon vocabulary={vocabulary} glyph={vocabulary.glyphOf(graph, node)} title={kind} />
          </span>
          <span className="min-w-0 break-words">{[type, method].filter(Boolean).join(".") || node.label}</span>
        </span>
      ),
    },
    { key: "signature", label: "Signature", value: <Mono>{signature}</Mono>, hidden: !signature },
    { key: "package", label: "Package", value: <Mono>{pkg}</Mono>, hidden: !pkg },
    { key: "module", label: "Module", value: module, hidden: !module },
    { key: "group", label: capitalize(vocabulary.group.noun), value: <Mono>{group}</Mono>, hidden: !group || group === pkg },
    { key: "location", label: "Location", value: <Mono>{siteLocation(location ?? {})}</Mono>, hidden: !location?.path },
    ...backing,
    ...properties.map(([key, value]) => ({ key: `property:${key}`, label: key, value: <Mono>{value}</Mono> })),
    ...accessItems(node, graph, vocabulary),
    ...totalItems(walkedTotals(graph, node, vocabulary)),
    { key: "status", label: "Status", value: vocabulary.status(node) },
  ];
}

/**
 * What a node is and where it is declared, with the actions that open it or re-root the graph on it.
 * When the host `opens` nodes, Open shows on every node, disabled on one with no source or no `open`.
 */
export function NodeDetails({ node, graph, vocabulary, isRoot, opens, open, openLabel, onFocus }: {
  node: CallGraphNode;
  graph: CallGraph;
  vocabulary: CallGraphVocabulary;
  isRoot: boolean;
  opens: boolean;
  open?: CallGraphAction | undefined;
  openLabel: string;
  /** Re-roots the graph on a node, by id: this one, or the one behind it. */
  onFocus?: ((id: string) => void) | undefined;
}) {
  const sourced = vocabulary.hasSource(node);
  return (
    <section className="space-y-2" aria-label="Node details">
      <h3 className="break-words text-sm font-semibold">{node.label}</h3>
      <KeyValueList items={nodeItems(node, graph, vocabulary, onFocus)} rowClassName="grid-cols-[5.5rem_minmax(0,1fr)] gap-density-2" valueClassName="text-xs" />
      <div className="flex flex-wrap gap-2">
        {opens && (open?.href !== undefined && sourced ? (
          <Button asChild size="sm" variant="outline">
            <ActionTarget action={open} className="" label={`${openLabel} ${node.label}`}>{openLabel}</ActionTarget>
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" disabled={!sourced || !open?.onSelect} onClick={open?.onSelect}>{openLabel}</Button>
        ))}
        {onFocus && <Button type="button" size="sm" variant="outline" disabled={!vocabulary.canRoot(node) || isRoot} onClick={() => onFocus(node.id)}>Focus</Button>}
      </div>
    </section>
  );
}

const EDGE_TYPES: readonly CallGraphEdgeType[] = ["call", "dispatch", "read", "write"];

/** The line colour each edge type but a plain call is drawn in, matching its tone in the diagram. */
const EDGE_LINE: Record<CallGraphEdgeType, string | undefined> = {
  call: undefined,
  dispatch: "border-sky-500",
  read: "border-emerald-500",
  write: "border-amber-500",
};

function LegendEntry({ mark, children }: { mark: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-1 text-base leading-none">{mark}</span>
      {children}
    </li>
  );
}

/** The key to the icons: one entry per icon this graph draws, then the box and line styles. */
export function Legend({ graph, vocabulary, labels }: { graph: CallGraph; vocabulary: CallGraphVocabulary; labels: CallGraphEdgeLabels }) {
  const GroupIcon = vocabulary.group.icon;
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Legend">
      {usedGlyphs(graph, vocabulary).map((glyph) => <LegendEntry key={glyph.id} mark={<GlyphIcon glyph={glyph} />}>{glyph.name}</LegendEntry>)}
      {(graph.groups ?? []).length > 0 && <LegendEntry mark={<GroupIcon />}>{vocabulary.group.noun}</LegendEntry>}
      <LegendEntry mark={<span className="inline-block h-3 w-5 rounded border border-sky-500/60 bg-sky-500/10" />}>root</LegendEntry>
      <LegendEntry mark={<span className="inline-block h-3 w-5 rounded border border-dashed border-border bg-muted" />}>no source: not expandable</LegendEntry>
      {EDGE_TYPES.filter((type) => graph.edges.some((edge) => edge.type === type)).map((type) => (
        <LegendEntry key={type} mark={<>{EDGE_LINE[type] && <span className={cn("inline-block w-6 border-t-2", EDGE_LINE[type])} />}<EdgeTypeGlyph type={type} /></>}>
          {labels[type]}
        </LegendEntry>
      ))}
      <LegendEntry mark={<span className="inline-block w-6 border-t-2 border-dashed border-muted-foreground" />}>every site guarded</LegendEntry>
      <LegendEntry mark={<span className="text-xs font-semibold">×N</span>}>sites on one edge</LegendEntry>
      <LegendEntry mark={<span className="text-xs font-semibold">+N</span>}>more to load</LegendEntry>
      <LegendEntry mark={<UiWarningTriangle />}>not drawn</LegendEntry>
    </ul>
  );
}
