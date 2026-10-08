import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../components/button";
import { IconButton } from "../../components/IconButton";
import { InputField } from "../../components/InputField";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Switch } from "../../components/Switch";
import { UiCollapseAll, UiExpandAll, UiFilter, UiHome, UiWarningTriangle } from "../../icons";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Badge } from "../Badge";
import {
  addExcludePattern,
  EXCLUDE_EXTERNAL,
  excludeGroup,
  excludePatternError,
  includeGroup,
  removeExcludePattern,
  setExternalHidden,
  type ExcludeMatcher,
} from "./call-graph-exclude";
import { capitalize, excludedTally, omittedParts } from "./call-graph-labels";
import { baseAccess, toggleAccess } from "./call-graph-model";
import type { CallGraphVocabulary } from "./call-graph-vocabulary";
import { CALL_GRAPH_ACCESS, type CallGraphAccess, type CallGraphDirection, type CallGraphGroupFact, type CallGraphOmitted } from "./types";

const DIRECTIONS: { id: CallGraphDirection; label: string }[] = [
  { id: "callers", label: "Callers" },
  { id: "both", label: "Both" },
  { id: "callees", label: "Callees" },
];

function DepthStepper({ depth, maxDepth, onChange }: { depth: number; maxDepth: number; onChange: (depth: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Depth">
      <span className="text-xs text-muted-foreground">Depth</span>
      <Button type="button" variant="outline" size="sm" className="size-8 px-0" aria-label="Decrease depth" disabled={depth <= 1} onClick={() => onChange(depth - 1)}>−</Button>
      <output className="w-5 text-center text-sm font-medium tabular-nums" aria-live="polite" aria-label="Graph depth">{depth}</output>
      <Button type="button" variant="outline" size="sm" className="size-8 px-0" aria-label="Increase depth" disabled={depth >= maxDepth} onClick={() => onChange(depth + 1)}>+</Button>
    </div>
  );
}

function OmittedChip({ omitted, noun }: { omitted: CallGraphOmitted; noun: string }) {
  const parts = omittedParts(omitted);
  if (parts.length === 0) return null;
  const tally = excludedTally(omitted).map(({ group, count }) => `${group}: ${count}`);
  const title = [`Not drawn: ${parts.join(", ")}`, ...(tally.length ? [`Excluded per ${noun}:`, ...tally] : [])].join("\n");
  return (
    <span title={title} data-testid="graph-omitted">
      <Badge tone="warning" size="md" icon={UiWarningTriangle} clickToCopy={false}>{parts.join(" · ")}</Badge>
    </span>
  );
}

export interface ExclusionsProps {
  /** The patterns in force. */
  exclude: string[];
  groups: CallGraphGroupFact[];
  matches: ExcludeMatcher;
  onExclude: (patterns: string[]) => void;
  onDefaults: () => void;
  /** A graph for the last edit is loading: the facts describe the one before it, so editing waits. */
  busy: boolean;
  vocabulary: CallGraphVocabulary;
}

function GroupRow({ group, onToggle }: { group: CallGraphGroupFact; onToggle: () => void }) {
  const name = group.label ?? group.name;
  return (
    <li className="flex items-center gap-2 py-1">
      <Switch checked={!group.excluded} onChange={onToggle} aria-label={`Show ${name}`} />
      <span className="min-w-0 flex-1 truncate font-mono text-xs" title={group.name}>{name}</span>
      {group.external && <Badge variant="outline" size="sm" clickToCopy={false}>external</Badge>}
      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground" title={`${group.nodes} nodes`}>{group.nodes}</span>
    </li>
  );
}

/** The group facets: one switch per group the walk reached, the patterns in force, and free-text patterns. */
function GroupFacets({ exclude, groups, matches, onExclude, onDefaults, busy, vocabulary }: ExclusionsProps) {
  const [filter, setFilter] = useState("");
  const [pattern, setPattern] = useState("");
  const [error, setError] = useState<string>();
  const { plural, patternHint } = vocabulary.group;
  const needle = filter.trim().toLowerCase();
  const shown = groups.filter((group) => `${group.name} ${group.label ?? ""}`.toLowerCase().includes(needle));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const typed = pattern.trim();
    const problem = excludePatternError(exclude, typed);
    setError(problem);
    if (problem) return;
    setPattern("");
    onExclude(addExcludePattern(exclude, typed));
  };
  // The filter box comes first: the menu focuses its first control on opening, which must not be one that drops an exclusion.
  return (
    <fieldset disabled={busy} aria-busy={busy} className="flex w-96 min-w-0 max-w-[90vw] flex-col gap-2 p-2 text-sm">
      <InputField aria-label={`Filter ${plural}`} placeholder={`Filter ${plural}`} value={filter} onChange={setFilter} />
      <div className="flex flex-wrap items-center gap-1" aria-label="Exclusion patterns">
        <span className="text-xs text-muted-foreground">Excluding</span>
        {exclude.length === 0 && <span className="text-xs text-muted-foreground">nothing</span>}
        {exclude.map((entry) => (
          <button key={entry} type="button" className="rounded border border-border px-1.5 font-mono text-xs hover:bg-muted"
            aria-label={`Stop excluding ${entry}`} title={`Stop excluding ${entry}`} onClick={() => onExclude(removeExcludePattern(exclude, entry))}>
            {entry} ×
          </button>
        ))}
      </div>
      <ul className="max-h-72 overflow-y-auto pr-1" aria-label={plural}>
        {shown.map((group) => (
          <GroupRow key={group.name} group={group}
            onToggle={() => onExclude(group.excluded ? includeGroup(exclude, group, groups, matches) : excludeGroup(exclude, group.name))} />
        ))}
        {shown.length === 0 && (
          <li className="py-1 text-xs text-muted-foreground">{groups.length ? `No ${vocabulary.group.noun} matches the filter.` : `The graph reached no ${vocabulary.group.noun}.`}</li>
        )}
      </ul>
      <form className="flex items-start gap-2" onSubmit={submit}>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <InputField aria-label="Exclude pattern" placeholder={patternHint} value={pattern} onChange={setPattern} />
          {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
        </div>
        <Button type="submit" size="sm" variant="outline">Exclude</Button>
      </form>
      <div className="flex justify-between gap-2 border-t border-border pt-2">
        <Button type="button" size="sm" variant="ghost" onClick={onDefaults}>Reset to defaults</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => onExclude([])}>Show all</Button>
      </div>
    </fieldset>
  );
}

const ACCESS_LABELS: Record<CallGraphAccess, string> = { call: "Calls", read: "Reads", write: "Writes", variable: "Variables" };

export interface DataAccessProps {
  access: CallGraphAccess[];
  onAccess: (access: CallGraphAccess[]) => void;
  columns: boolean;
  onColumns: (columns: boolean) => void;
  /** Offers the Variables toggle, on top of the access types. */
  variables?: boolean;
}

/** Which edge types the graph follows, at least one of calls, reads and writes, and whether columns and fields are nodes of their own. */
function DataAccessControls({ access, onAccess, columns, onColumns, variables }: DataAccessProps) {
  const lastOn = baseAccess(access).length === 1;
  return (
    <>
      <div className="flex items-center gap-1" role="group" aria-label="Access">
        {(variables ? [...CALL_GRAPH_ACCESS, "variable" as const] : CALL_GRAPH_ACCESS).map((type) => {
          const on = access.includes(type);
          const kept = on && lastOn && type !== "variable";
          return (
            <Button key={type} type="button" size="sm" variant={on ? "secondary" : "outline"} aria-pressed={on} disabled={kept}
              title={kept ? "At least one kind of access stays on" : undefined} onClick={() => onAccess(toggleAccess(access, type))}>
              {ACCESS_LABELS[type]}
            </Button>
          );
        })}
      </div>
      <Switch checked={columns} label="Columns" onChange={onColumns} />
    </>
  );
}

export interface GroupCollapseProps {
  anyCollapsed: boolean;
  anyExpanded: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

/** Expand or collapse every group the graph draws at once. */
function GroupCollapseControls({ anyCollapsed, anyExpanded, onExpandAll, onCollapseAll }: GroupCollapseProps) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Groups">
      <IconButton icon={UiExpandAll} label="Expand all groups" className="size-7" disabled={!anyCollapsed} onClick={onExpandAll} />
      <IconButton icon={UiCollapseAll} label="Collapse all groups" className="size-7" disabled={!anyExpanded} onClick={onCollapseAll} />
    </div>
  );
}

export interface CallGraphToolbarProps {
  /** Shown only when the host's graph has reads and writes. */
  data?: DataAccessProps | undefined;
  /** Shown only when the graph draws a group that can collapse. */
  groupCollapse?: GroupCollapseProps | undefined;
  direction: CallGraphDirection;
  depth: number;
  maxDepth: number;
  /** Shown only when the host keeps a root across selection changes. */
  pin?: { pinned: boolean; canPin: boolean; onPin: (pinned: boolean) => void } | undefined;
  exclusions?: ExclusionsProps | undefined;
  omitted?: CallGraphOmitted | undefined;
  /** Host content at the toolbar's end, such as server timing. */
  end?: ReactNode;
  onDirection: (direction: CallGraphDirection) => void;
  onDepth: (depth: number) => void;
  onFit: () => void;
  onReset: () => void;
  vocabulary: CallGraphVocabulary;
}

export function CallGraphToolbar(props: CallGraphToolbarProps) {
  const { exclusions, pin, vocabulary } = props;
  const excludedCount = exclusions?.groups.filter((group) => group.excluded).length ?? 0;
  const hasExternal = exclusions?.groups.some((group) => group.external) ?? false;
  const { noun, plural } = vocabulary.group;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SegmentedControl value={props.direction} options={DIRECTIONS} onChange={props.onDirection} size="sm" aria-label="Direction" />
      <DepthStepper depth={props.depth} maxDepth={props.maxDepth} onChange={props.onDepth} />
      {props.data && <DataAccessControls {...props.data} />}
      {pin && (
        <Button type="button" variant={pin.pinned ? "secondary" : "outline"} size="sm" disabled={!pin.pinned && !pin.canPin} aria-pressed={pin.pinned}
          title={pin.pinned ? "The graph keeps this root while the selection changes" : "Keep this root while the selection changes"} onClick={() => pin.onPin(!pin.pinned)}>
          {pin.pinned ? "Unpin root" : "Pin root"}
        </Button>
      )}
      <Button type="button" variant="outline" size="sm" onClick={props.onFit}>Fit</Button>
      <Button type="button" variant="outline" size="sm" onClick={props.onReset}><UiHome />Reset</Button>
      {props.groupCollapse && <GroupCollapseControls {...props.groupCollapse} />}
      {exclusions && hasExternal && (
        <Switch checked={exclusions.exclude.includes(EXCLUDE_EXTERNAL)} disabled={exclusions.busy} label="Hide all external"
          onChange={(hidden) => exclusions.onExclude(setExternalHidden(exclusions.exclude, hidden))} />
      )}
      {exclusions && (
        <DropdownMenu icon={UiFilter} label={`${capitalize(plural)}${excludedCount ? ` (${excludedCount} excluded)` : ""}`} variant="outline" size="sm"
          menuLabel={`${capitalize(noun)} exclusions`} title={`Choose the ${plural} the graph leaves out`}>
          {() => <GroupFacets {...exclusions} />}
        </DropdownMenu>
      )}
      <div className="ml-auto flex items-center gap-2">
        {props.omitted && <OmittedChip omitted={props.omitted} noun={noun} />}
        {props.end}
      </div>
    </div>
  );
}
