import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiEyeClosed, UiListChecks } from "../../icons";
import { LintSeverityIcon, ToolIcon } from "../test-runner/MarkIcons";
import { formatTestDuration } from "../test-runner/status";
import {
  collectFolderLintStats,
  folderPattern,
  lintNodeActions,
  violationIgnoreAction,
} from "./actions";
import { isLinterErrored, lintNodeCount, severityOf } from "./stats";
import type { LintAction, LintNode, LinterResult, Violation } from "./types";

type IgnoreProps = {
  onIgnore?: ((action: LintAction) => void | Promise<void>) | undefined;
  ignoreBusy?: boolean | undefined;
};

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

function IgnoreButton({
  action,
  onIgnore,
  disabled,
}: {
  action: LintAction;
  onIgnore: (action: LintAction) => void | Promise<void>;
  disabled: boolean;
}) {
  const subtle = action.variant === "subtle";
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn(
        "h-6 gap-1 px-2 text-xs",
        subtle
          ? "text-muted-foreground"
          : "border-amber-500/50 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300",
      )}
      title={action.title}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        void onIgnore(action);
      }}
    >
      <Icon icon={UiEyeClosed} className="text-xs" />
      {action.label}
    </Button>
  );
}

function ActionList({ actions, onIgnore, ignoreBusy }: IgnoreProps & { actions: LintAction[] }) {
  if (!onIgnore || actions.length === 0) return null;
  return (
    <Section title="Actions">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => (
          <IgnoreButton
            key={action.key}
            action={action}
            onIgnore={onIgnore}
            disabled={Boolean(ignoreBusy) || (Boolean(action.disabledWithoutWorkDir) && !action.req.work_dir)}
          />
        ))}
      </div>
    </Section>
  );
}

function violationLocation(v: Violation, withFile: boolean): string {
  const position = `:${v.line ?? 0}${v.column ? `:${v.column}` : ""}`;
  return withFile && v.file ? `${v.file}${position}` : position;
}

function ViolationCard({
  violation,
  linter,
  file,
  workDir,
  showFile,
  onIgnore,
  ignoreBusy,
}: IgnoreProps & {
  violation: Violation;
  linter: string;
  /** The file an ignore rule targets; empty when the violation has none. */
  file: string;
  workDir: string;
  showFile?: boolean;
}) {
  const rule = violation.rule?.method ?? "";
  const ignore = onIgnore ? violationIgnoreAction({ violation, linter, file, workDir }) : null;
  return (
    <div className="rounded border border-border bg-card p-2" data-lint-violation="">
      <div className="flex items-start gap-2">
        <LintSeverityIcon severity={severityOf(violation)} className="mt-0.5 text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{violationLocation(violation, Boolean(showFile))}</span>
            {rule && <span className="text-foreground">[{rule}]</span>}
          </div>
          {violation.message && (
            <div className="mt-0.5 whitespace-pre-wrap text-sm">{violation.message}</div>
          )}
          {violation.code && (
            <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{violation.code}</pre>
          )}
          {ignore && onIgnore && (
            <div className="mt-1.5">
              <IgnoreButton action={ignore} onIgnore={onIgnore} disabled={Boolean(ignoreBusy)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

function ResultStatus({ result }: { result: LinterResult }) {
  const [label, tone] = result.skipped
    ? ["skipped", "text-muted-foreground"]
    : result.timed_out
      ? ["timed out", "text-amber-600 dark:text-amber-400"]
      : isLinterErrored(result)
        ? ["failed", "text-red-600 dark:text-red-400"]
        : ["ran", "text-emerald-600 dark:text-emerald-400"];
  const count = (result.violations ?? []).length;
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <span className={tone}>{label}</span>
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

function ResultDetails({ result, workDir }: { result: LinterResult; workDir: string }) {
  return (
    <>
      <Section title="Status">
        <ResultStatus result={result} />
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

function LinterDetail({ node, actions, ...ignore }: IgnoreProps & { node: LintNode; actions: LintAction[] }) {
  const result = node.linter;
  const linter = node.linterName ?? result?.linter ?? "";
  const workDir = node.work_dir ?? result?.work_dir ?? "";
  return (
    <>
      {result && <ResultDetails result={result} workDir={workDir} />}
      <ActionList actions={actions} {...ignore} />
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

function FolderDetail({
  node,
  results,
  actions,
  ...ignore
}: IgnoreProps & { node: LintNode; results: readonly LinterResult[]; actions: LintAction[] }) {
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
      <ActionList actions={actions} {...ignore} />
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

function FileDetail({ node, actions, ...ignore }: IgnoreProps & { node: LintNode; actions: LintAction[] }) {
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
      <ActionList actions={actions} {...ignore} />
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

function RuleDetail({ node, actions, ...ignore }: IgnoreProps & { node: LintNode; actions: LintAction[] }) {
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
      <ActionList actions={actions} {...ignore} />
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

function DetailHeader({ node }: { node: LintNode }) {
  const count = node.kind === "linter-error" ? 0 : lintNodeCount(node);
  return (
    <div
      className="flex min-w-0 items-center gap-2 border-b border-border px-density-4 py-density-2"
      data-detail-header=""
    >
      {node.kind === "linter" ? (
        <ToolIcon tool={node.linterName} className="text-lg" />
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
    </div>
  );
}

export type LintDetailPanelProps = IgnoreProps & {
  node: LintNode | null;
  /** All results, for the folder summary and for folder-scoped ignore actions. */
  results: readonly LinterResult[];
};

/**
 * The right pane for a lint node: what it covers, the findings beneath it and,
 * when the host provides `onIgnore`, the ignore actions that fit its scope.
 */
export function LintDetailPanel({ node, results, onIgnore, ignoreBusy }: LintDetailPanelProps) {
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
  const ignore = { onIgnore, ignoreBusy };
  const actions = lintNodeActions(node, results);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DetailHeader node={node} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-density-4">
        {node.kind === "linter" && <LinterDetail node={node} actions={actions} {...ignore} />}
        {node.kind === "linter-error" && <LinterErrorDetail node={node} />}
        {node.kind === "lint-folder" && <FolderDetail node={node} results={results} actions={actions} {...ignore} />}
        {node.kind === "lint-file" && <FileDetail node={node} actions={actions} {...ignore} />}
        {(node.kind === "lint-rule" || node.kind === "lint-rule-group") && (
          <RuleDetail node={node} actions={actions} {...ignore} />
        )}
      </div>
    </div>
  );
}
