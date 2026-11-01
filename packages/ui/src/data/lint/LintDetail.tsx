import { violationMenuItems, type ViolationProps } from "./violation-menu-items";
import { ProblemRow } from "../diagnostics/ProblemRow";
import type { ReactNode } from "react";
import { CopyButton } from "../../components/CopyButton";
import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiListChecks } from "../../icons";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { formatTestDuration } from "../test-runner/status";
import {
  collectFolderLintStats,
  folderPattern,
  lintNodeActions,
} from "./actions";
import { isLinterErrored, linterToolName, lintNodeCount, severityOf } from "./stats";
import { OpenInFilesLink, type OpenFileTarget } from "../OpenInFilesLink";
import { relPath } from "./paths";
import { ViolationSnippet, type LintSourceLoader } from "./ViolationSnippet";
import { IgnoreActionsMenu } from "./LintIgnoreMenu";
import { cachedAge, type LintAction, type LintNode, type LinterResult, type Violation } from "./types";

export type HostActionProps = {
  onIgnore?: ((action: LintAction) => void | Promise<void>) | undefined;
  ignoreBusy?: boolean | undefined;
  /** Adds an "Open in Files" link to each violation that names a file. */
  onOpenFile?: ((target: OpenFileTarget) => void) | undefined;
  /** Loads a violation's file so its card shows the flagged lines with context. */
  loadSource?: LintSourceLoader | undefined;
};

type RenderRun = (result: LinterResult) => ReactNode;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("break-all font-mono text-sm", className)}>{children}</span>;
}

function Pre({ children, tone }: { children: ReactNode; tone?: "error" }) {
  return (
    <pre
      className={cn(
        "max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-3 font-mono text-xs",
        tone === "error" && "bg-red-500/10 text-red-700 dark:text-red-300",
      )}
    >
      {children}
    </pre>
  );
}

function violationLocation(v: Violation, withFile: boolean): string {
  const position = `:${v.line ?? 0}${v.column ? `:${v.column}` : ""}`;
  return withFile && v.file ? `${v.file}${position}` : position;
}

// ViolationLocations lists each place a violation one fix resolves applies,
// relative to the linter's work dir, each opening its own line.
function ViolationLocations({
  violation,
  workDir,
  onOpenFile,
}: Pick<HostActionProps, "onOpenFile"> & { violation: Violation; workDir: string }) {
  const locations = violation.locations ?? [];
  return (
    <div className="mt-1 space-y-0.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{`${locations.length} locations`}</div>
      <ul className="space-y-0.5">
        {locations.map((location, i) => {
          const file = relPath(location.file, workDir) ?? location.file;
          return (
            <li key={i} className="flex flex-wrap items-baseline gap-2 text-xs" data-testid="lint-violation-location">
              <span className="font-mono text-muted-foreground">{`${file}${location.line ? `:${location.line}` : ""}`}</span>
              {location.message && <span>{location.message}</span>}
              {onOpenFile && (
                <OpenInFilesLink
                  target={{ file, ...(workDir ? { workDir } : {}), ...(location.line ? { line: location.line } : {}) }}
                  onOpenFile={onOpenFile}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ViolationDetail({ violation, file, workDir, loadSource, onOpenFile, showFile, showMessage = true }: ViolationProps & { showMessage?: boolean }) {
  return <div className="space-y-2" data-lint-violation-detail="">
    {showFile && <p className="break-all font-mono text-xs text-muted-foreground">{violationLocation(violation, true)}</p>}
    <ViolationSnippet violation={violation} file={file} workDir={workDir} loadSource={loadSource} showMessage={showMessage} />
    {(violation.locations?.length ?? 0) > 1 && <ViolationLocations violation={violation} workDir={workDir} onOpenFile={onOpenFile} />}
  </div>;
}

export function ViolationCard(props: ViolationProps & { expanded?: boolean; onExpandedChange?: (expanded: boolean) => void }) {
  return <div data-lint-violation=""><ProblemRow {...(props.expanded !== undefined ? { expanded: props.expanded } : {})} {...(props.onExpandedChange ? { onExpandedChange: props.onExpandedChange } : {})} message={props.violation.message ?? ""} severity={severityOf(props.violation)} metadata={`${props.linter} ${props.violation.rule?.method ?? ""}`} location={violationLocation(props.violation, Boolean(props.showFile))} actions={violationMenuItems(props)}><ViolationDetail {...props} showMessage={false} /></ProblemRow></div>;
}

function groupViolationsByRule(violations: readonly Violation[]): Array<{ rule: string; violations: Violation[] }> {
  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    const key = v.rule?.method || "(no rule)";
    grouped.set(key, [...(grouped.get(key) ?? []), v]);
  }
  return Array.from(grouped.keys())
    .sort()
    .map((rule) => ({
      rule,
      violations: grouped.get(rule)!.slice().sort((a, b) => (a.line ?? 0) - (b.line ?? 0)),
    }));
}

function shellQuote(s: string): string {
  if (s === "") return "''";
  return /^[A-Za-z0-9_./:=@%+,-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`;
}

/** The executed argv, quoted so the line can be pasted into a terminal. */
function formatLinterCommand(result: LinterResult): string {
  return result.command ? [result.command, ...(result.args ?? [])].map(shellQuote).join(" ") : "";
}

function resultStatusLabel(result: LinterResult): [label: string, tone: string] {
  if (result.status === "pending") return ["pending", "text-muted-foreground"];
  if (result.status === "running") return ["running", "text-blue-600 dark:text-blue-400"];
  if (result.skipped) return ["skipped", "text-muted-foreground"];
  if (result.timed_out) return ["timed out", "text-amber-600 dark:text-amber-400"];
  if (isLinterErrored(result)) return ["failed", "text-red-600 dark:text-red-400"];
  return ["ran", "text-emerald-600 dark:text-emerald-400"];
}

function ResultStatus({ result }: { result: LinterResult }) {
  const [label, tone] = resultStatusLabel(result);
  const count = (result.violations ?? []).length;
  const cached = cachedAge(result);
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <span className={tone}>{label}</span>
      {cached && result.cache && (
        <span
          className="text-muted-foreground"
          title={`${result.cache.source} fingerprint ${result.cache.fingerprint ?? "unknown"}`}
        >
          cached · linted {cached}
        </span>
      )}
      <span className="text-muted-foreground">
        {count} violation{count === 1 ? "" : "s"}
      </span>
      {result.file_count !== undefined && <span className="text-muted-foreground">{result.file_count} files</span>}
      {result.rule_count !== undefined && <span className="text-muted-foreground">{result.rule_count} rules</span>}
      {result.duration ? (
        <span className="text-muted-foreground">{formatTestDuration(result.duration)}</span>
      ) : null}
    </div>
  );
}

function CopyableId({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all font-mono text-xs">{value}</span>
      <CopyButton value={value} label={`Copy ${label}`} />
    </div>
  );
}

/** The prompt run and agent session behind a result, when it has them. */
function RunIdentity({ result }: { result: LinterResult }) {
  if (!result.run_id && !result.session_id) return null;
  return (
    <div className="space-y-0.5">
      {result.run_id && <CopyableId label="run id" value={result.run_id} />}
      {result.session_id && <CopyableId label="session id" value={result.session_id} />}
    </div>
  );
}

function ResultDetails({ result, workDir }: { result: LinterResult; workDir: string }) {
  return (
    <>
      <Section title="Status">
        <ResultStatus result={result} />
        <RunIdentity result={result} />
      </Section>
      {result.command && (
        <Section title="Command">
          <Pre>{formatLinterCommand(result)}</Pre>
          {workDir && <div className="font-mono text-xs text-muted-foreground">cwd: {workDir}</div>}
        </Section>
      )}
    </>
  );
}

function NoFileViolations({
  violations,
  linter,
  workDir,
}: {
  violations: readonly Violation[];
  linter: string;
  workDir: string;
}) {
  if (violations.length === 0) return null;
  return (
    <Section title="Violations Without File">
      <div className="space-y-3">
        {groupViolationsByRule(violations).map(({ rule, violations: group }) => (
          <div key={rule} className="space-y-2 rounded border border-border bg-muted/40 p-3">
            <div className="font-mono text-sm">
              {rule} <span className="text-xs text-muted-foreground">({group.length})</span>
            </div>
            {group.map((v, i) => (
              <ViolationCard key={i} violation={v} linter={linter} file="" workDir={workDir} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function LinterDetail({ node, renderRun }: { node: LintNode; renderRun?: RenderRun | undefined }) {
  const result = node.linter;
  const linter = node.linterName ?? result?.linter ?? "";
  const workDir = node.work_dir ?? result?.work_dir ?? "";
  const run = result && renderRun?.(result);
  return (
    <>
      {result && <ResultDetails result={result} workDir={workDir} />}
      {run && <Section title="Run">{run}</Section>}
      {result?.error && (
        <Section title="Error">
          <Pre tone="error">{result.error}</Pre>
        </Section>
      )}
      {result?.raw_output && (
        <Section title="Raw output">
          <Pre>{result.raw_output}</Pre>
        </Section>
      )}
      <NoFileViolations violations={node.noFileViolations ?? []} linter={linter} workDir={workDir} />
    </>
  );
}

function LinterErrorDetail({ node }: { node: LintNode }) {
  const result = node.linter;
  return (
    <>
      <Section title="Error">
        <Pre tone="error">{node.message}</Pre>
      </Section>
      {result && <ResultDetails result={result} workDir={result.work_dir ?? ""} />}
      {result?.raw_output && (
        <Section title="Raw output">
          <Pre>{result.raw_output}</Pre>
        </Section>
      )}
    </>
  );
}

function FolderDetail({ node, results }: { node: LintNode; results: readonly LinterResult[] }) {
  const stats = node.ruleName
    ? []
    : collectFolderLintStats(node, results).filter((s) => !node.linterName || s.linter === node.linterName);
  return (
    <>
      <Section title="Folder">
        <div className="flex items-center gap-2">
          <Mono>{node.file || node.name}</Mono>
          {node.target_path !== undefined && (
            <span className="text-xs text-muted-foreground">{folderPattern(node.target_path)}</span>
          )}
        </div>
      </Section>
      {node.ruleName ? (
        <Section title="Scope">
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Linter:</span> <Mono>{node.linterName}</Mono>
            </div>
            <div>
              <span className="text-muted-foreground">Rule:</span> <Mono>{node.ruleName}</Mono>
            </div>
          </div>
        </Section>
      ) : (
        <Section title="Linters">
          <div className="space-y-1">
            {stats.map(({ linter, count }) => (
              <div key={linter} className="flex items-center justify-between text-sm">
                <Mono>{linter}</Mono>
                <span className="text-xs text-muted-foreground">{count} violations</span>
              </div>
            ))}
            {stats.length === 0 && (
              <div className="text-sm text-muted-foreground">No violations found under this folder.</div>
            )}
          </div>
        </Section>
      )}
    </>
  );
}

function FileDetail({ node, ...ignore }: HostActionProps & { node: LintNode }) {
  const violations = node.violations ?? [];
  return (
    <>
      <Section title="File">
        <div className="flex items-center gap-2">
          <Mono>{node.file}</Mono>
          {violations.length > 0 && (
            <span className="text-xs text-muted-foreground">({violations.length} violations)</span>
          )}
        </div>
      </Section>
      {violations.length > 0 && (
        <Section title="Violations">
          <div className="space-y-2">
            {violations.map((v, i) => (
              <ViolationCard
                key={i}
                violation={v}
                linter={node.linterName ?? ""}
                file={node.target_path || node.file || ""}
                workDir={node.work_dir ?? ""}
                {...ignore}
              />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function RuleDetail({ node, ...ignore }: HostActionProps & { node: LintNode }) {
  const violations = node.violations ?? [];
  const linter = node.linterName ?? "";
  const workDir = node.work_dir ?? "";
  return (
    <>
      <Section title="Rule">
        <Mono>{node.ruleName}</Mono>
        <span className="ml-2 text-xs text-muted-foreground">({lintNodeCount(node)} violations)</span>
      </Section>
      {node.file && (
        <Section title="File">
          <Mono>{node.file}</Mono>
        </Section>
      )}
      {violations.length > 0 && (
        <Section title="Violations">
          <div className="space-y-2">
            {violations.map((v, i) => (
              <ViolationCard
                key={i}
                violation={v}
                linter={linter}
                file={v.raw_file || node.target_path || node.file || ""}
                workDir={workDir}
                showFile={!node.file}
                {...ignore}
              />
            ))}
          </div>
        </Section>
      )}
      <NoFileViolations violations={node.noFileViolations ?? []} linter={linter} workDir={workDir} />
    </>
  );
}

const KIND_LABEL: Record<LintNode["kind"], string> = {
  linter: "Linter",
  "lint-folder": "Folder",
  "lint-file": "File",
  "lint-rule": "Rule",
  "lint-rule-group": "Rule",
  "linter-error": "Linter error",
};

function DetailHeader({
  node,
  actions,
  onIgnore,
  ignoreBusy,
}: Pick<HostActionProps, "onIgnore" | "ignoreBusy"> & { node: LintNode; actions: LintAction[] }) {
  const count = node.kind === "linter-error" ? 0 : lintNodeCount(node);
  return (
    <div
      className="flex min-w-0 items-center gap-2 border-b border-border px-density-4 py-density-2"
      data-detail-header=""
    >
      {node.kind === "linter" ? (
        <ToolIcon tool={linterToolName(node)} className="text-lg" />
      ) : node.kind === "linter-error" ? (
        <LintSeverityIcon severity="error" className="text-lg" />
      ) : null}
      <h2 className="min-w-0 shrink truncate text-base font-semibold" title={node.name}>
        {node.name}
      </h2>
      <span className="inline-flex shrink-0 items-center rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
        {KIND_LABEL[node.kind]}
      </span>
      {count > 0 && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {count} violation{count === 1 ? "" : "s"}
        </span>
      )}
      {onIgnore && actions.length > 0 && (
        <div className="ml-auto shrink-0" data-lint-node-actions="">
          <IgnoreActionsMenu actions={actions} onIgnore={onIgnore} busy={Boolean(ignoreBusy)} align="right" />
        </div>
      )}
    </div>
  );
}

export type LintDetailPanelProps = HostActionProps & {
  node: LintNode | null;
  /**
   * Host-rendered view of the prompt run behind a linter (e.g. its live session),
   * shown in the linter detail. Called for every linter result; return nothing for
   * results without a run. Lets the lint bundle stay free of the AI bundle.
   */
  renderRun?: RenderRun | undefined;
  /** All results, for the folder summary and for folder-scoped ignore actions. */
  results: readonly LinterResult[];
};

/**
 * The right pane for a lint node: what it covers, the findings beneath it and,
 * when the host provides `onIgnore`, the ignore actions that fit its scope.
 */
export function LintDetailPanel({
  node,
  results,
  onIgnore,
  ignoreBusy,
  onOpenFile,
  loadSource,
  renderRun,
}: LintDetailPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Icon icon={UiListChecks} className="mb-2 block text-4xl" />
          Select a linter, rule or file to view its findings.
        </div>
      </div>
    );
  }
  const ignore = { onIgnore, ignoreBusy, onOpenFile, loadSource };
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DetailHeader node={node} actions={lintNodeActions(node, results)} onIgnore={onIgnore} ignoreBusy={ignoreBusy} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-density-4">
        {node.kind === "linter" && <LinterDetail node={node} renderRun={renderRun} />}
        {node.kind === "linter-error" && <LinterErrorDetail node={node} />}
        {node.kind === "lint-folder" && <FolderDetail node={node} results={results} />}
        {node.kind === "lint-file" && <FileDetail node={node} {...ignore} />}
        {(node.kind === "lint-rule" || node.kind === "lint-rule-group") && <RuleDetail node={node} {...ignore} />}
      </div>
    </div>
  );
}
