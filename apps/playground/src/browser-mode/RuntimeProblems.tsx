import { useMemo, useState } from "react";
import { ActionError, Button, FilterBar, Modal, ProblemRow } from "@flanksource/clicky-ui";
import type { CompatibilityIssue } from "./project";
import { groupRuntimeProblems, SCOPE_LABELS, type RuntimeProblem } from "./problems";
import { approveDependencies, type DependencyScope } from "./dependency-defaults";
import type { DependencyPolicy } from "@flanksource/page-runtime/schema";

type FixOptions = { scope?: DependencyScope; remove?: boolean };

/** Fixes for a package the dependency policy rejects: allow it (ask), declare it in package.json, or drop the declaration. */
function policyActions(options: { problem: RuntimeProblem; slug: string; policy: DependencyPolicy | null; scope: DependencyScope | undefined; onFix: (problem: RuntimeProblem, options?: FixOptions) => void }) {
  const { problem, slug, scope, onFix } = options;
  const name = problem.package!;
  return [
    ...(options.policy === "ask" ? [{ label: "Allow for this page", onSelect: () => approveDependencies({ names: [name], scope: "page", slug }) }, { label: "Allow for every page", onSelect: () => approveDependencies({ names: [name], scope: "workspace", slug }) }] : []),
    { label: "Add to package.json…", onSelect: () => onFix(problem, { scope: "workspace" }) },
    ...(scope && scope !== "workspace" ? [{ label: `Remove from ${SCOPE_LABELS[scope]}…`, onSelect: () => onFix(problem, { scope, remove: true }) }] : []),
  ];
}
import { useRuntimeRoute } from "./runtime-route";

export function RuntimeProblems({ issues, slug, policy, sources, onFix, onLink, onInspect, onClearCache }: { issues: CompatibilityIssue[]; slug: string; policy: DependencyPolicy | null; sources: Record<string, DependencyScope>; onFix: (problem: RuntimeProblem, options?: FixOptions) => void; onLink: () => void; onInspect: (tab: string) => void; onClearCache: () => void }) {
  const groups = useMemo(() => groupRuntimeProblems(issues), [issues]);
  const [selected, setSelected] = useRuntimeRoute("problem");
  const [query, setQuery] = useRuntimeRoute("filter");
  const [kind, setKind] = useRuntimeRoute("kind");
  const [source, setSource] = useState<{ issue: CompatibilityIssue; text: string } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const openSource = async (issue: CompatibilityIssue) => {
    if (!issue.sourceUrl) throw new Error("Source is outside the declared read-only roots");
    const response = await fetch(issue.sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Source ${issue.file}: HTTP ${response.status}`);
    setSource({ issue, text: await response.text() });
  };
  const shown = groups.filter(group => (!kind || group.kind === kind) && `${group.message} ${group.locations.map(issue => `${issue.file} ${issue.specifier ?? ""}`).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <section aria-label="Runtime problems" className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-sm">
      <h2 className="font-semibold">Runtime problems</h2><span className="text-xs text-muted-foreground">{groups.length} problems · {issues.length} locations</span>
    </div>
    <FilterBar search={{ value: query, onChange: setQuery, placeholder: "Filter runtime problems" }} filters={[{ kind: "enum", key: "kind", label: "Issue type", value: kind, options: [{ value: "", label: "All types" }, ...[...new Set(groups.map(group => group.kind))].map(value => ({ value, label: value }))], onChange: setKind }]} className="shrink-0 p-2" />
    {error && <ActionError title="Could not open source" error={error} />}
    <div className="min-h-0 flex-1 overflow-auto">
      {!shown.length && <p className="p-4 text-sm text-muted-foreground">No problems match these filters.</p>}
      {shown.map(group => {
        const fixes = group.kind === "policy" && group.package ? policyActions({ problem: group, slug, policy, scope: sources[group.package], onFix }) : group.package ? [{ label: "Add runtime import…", onSelect: () => onFix(group) }, { label: "Link local package…", onSelect: onLink }] : [];
        return <ProblemRow key={group.id} message={group.message} severity="error" metadata={group.kind} location={`${group.locations.length} location${group.locations.length === 1 ? "" : "s"}`} expanded={selected === group.id} onExpandedChange={open => setSelected(open ? group.id : "")} actions={[
        ...fixes,
        { label: "Runtime activity", onSelect: () => onInspect("activity") }, { label: "Configuration", onSelect: () => onInspect("profile") },
        { label: "Clear page runtime cache and try again", onSelect: onClearCache },
        { label: "Copy diagnostics", onSelect: () => { void navigator.clipboard.writeText(JSON.stringify(group, null, 2)).catch(cause => setError(new Error(String(cause)))); } },
      ]}>
        <p className="break-words text-muted-foreground">{group.fix}</p>
        {fixes.length > 0 && <div className="flex flex-wrap gap-2">{fixes.map(action => <Button key={action.label} size="sm" variant="outline" onClick={action.onSelect}>{action.label}</Button>)}</div>}
        <ul className="space-y-1">{group.locations.map((issue, index) => {
          const location = `${issue.file}:${issue.line}${issue.column ? `:${issue.column}` : ""}`;
          return <li key={`${location}:${index}`} title={[location, issue.specifier, issue.reason].filter(Boolean).join("\n")} className="flex min-w-0 items-baseline gap-2 whitespace-nowrap rounded bg-muted/30 px-2 py-1">
            {issue.sourceUrl
              ? <button type="button" aria-label={`Open ${location}`} className="shrink-0 font-mono text-primary underline-offset-4 hover:underline" onClick={() => { void openSource(issue).catch(cause => setError(new Error(String(cause)))); }}>{location}</button>
              : <span className="shrink-0 font-mono">{location}</span>}
            {issue.specifier && <span className="min-w-0 shrink truncate">{issue.specifier}</span>}
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{issue.reason}</span>
          </li>;
        })}</ul>
      </ProblemRow>;
      })}
    </div>
    {source && <Modal open title={`${source.issue.file}:${source.issue.line}`} size="xl" onClose={() => setSource(null)}>
      <pre className="overflow-auto text-xs">{source.text.split("\n").slice(Math.max(0, source.issue.line - 4), source.issue.line + 4).map((line, index) => `${Math.max(1, source.issue.line - 3) + index}  ${line}`).join("\n")}</pre>
    </Modal>}
  </section>;
}
