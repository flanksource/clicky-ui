import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  UiChevronDown,
  UiChevronRight,
  UiClock,
  UiCode2,
  UiDiff,
  UiFile,
  UiFileCode,
  UiFilePlus,
  UiGitCommit,
  UiLinkExternal,
  UiRemove,
} from "../../icons";
import type { IconComponent } from "../../icons/types";
import { CodeDiff } from "../CodeDiff";
import { languageFromPath } from "../code-highlight";
import { dateKey, formatFallbackTime, formatGitCommitDateHeader } from "./git-dates";

export type GitDiffPayload = {
  diff: string;
  truncated?: boolean;
  binary?: boolean;
  path?: string;
  commit?: string;
};

export type GitDiffLoader<T> = (item: T) => Promise<GitDiffPayload>;

export type GitCommitItem = {
  id?: string;
  sha: string;
  shortSha?: string;
  title: string;
  body?: string;
  authorName?: string;
  authorLogin?: string;
  authorAvatarUrl?: string;
  committedAt?: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  href?: string;
};

export type GitFileChangeStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "copied"
  | string;

export type GitFileChangeItem = {
  id?: string;
  path: string;
  previousPath?: string;
  status?: GitFileChangeStatus;
  additions?: number;
  deletions?: number;
  href?: string;
  binary?: boolean;
};

type DiffState = {
  loading: boolean;
  payload: GitDiffPayload | null;
  error: string;
};

export type GitDiffPanelProps = {
  loading?: boolean;
  payload?: GitDiffPayload | null;
  error?: string;
  emptyLabel?: string;
  className?: string;
  maxHeightClassName?: string;
};

export type GitCommitListProps = {
  commits: GitCommitItem[];
  loadDiff?: GitDiffLoader<GitCommitItem>;
  renderTime?: (iso: string) => ReactNode;
  groupByDate?: boolean;
  emptyLabel?: string;
  className?: string;
  diffMaxHeightClassName?: string;
};

export type GitFileListProps = {
  files: GitFileChangeItem[];
  loadDiff?: GitDiffLoader<GitFileChangeItem>;
  emptyLabel?: string;
  className?: string;
  diffMaxHeightClassName?: string;
};

type CommitGroup = {
  key: string;
  label: string;
  commits: GitCommitItem[];
};

const DIFF_INITIAL_STATE: DiffState = {
  loading: false,
  payload: null,
  error: "",
};

function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Failed to load diff";
}

function isActivationKey(event: KeyboardEvent<HTMLDivElement>): boolean {
  return event.key === "Enter" || event.key === " ";
}

function groupCommits(commits: GitCommitItem[], enabled: boolean): CommitGroup[] {
  if (!enabled) return [{ key: "all", label: "", commits }];
  const groups: CommitGroup[] = [];
  const indexByKey = new Map<string, number>();
  for (const commit of commits) {
    const key = dateKey(commit.committedAt);
    const existing = indexByKey.get(key);
    if (existing != null) {
      groups[existing]?.commits.push(commit);
      continue;
    }
    indexByKey.set(key, groups.length);
    groups.push({
      key,
      label: formatGitCommitDateHeader(commit.committedAt),
      commits: [commit],
    });
  }
  return groups;
}

function shortSha(commit: GitCommitItem): string {
  return commit.shortSha || commit.sha.slice(0, 7);
}

function displayAuthor(commit: GitCommitItem): string {
  return commit.authorLogin || commit.authorName || "";
}

function statText(additions?: number, deletions?: number): ReactNode {
  const adds = additions ?? 0;
  const dels = deletions ?? 0;
  if (adds === 0 && dels === 0) return null;
  return (
    <>
      <span aria-hidden>·</span>
      {adds > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{adds}</span>}
      {dels > 0 && <span className="text-rose-600 dark:text-rose-400">-{dels}</span>}
    </>
  );
}

function useLazyDiff<T>(item: T, loader: GitDiffLoader<T> | undefined): [boolean, DiffState, () => void] {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<DiffState>(DIFF_INITIAL_STATE);

  function toggle() {
    setExpanded(open => !open);
    if (!expanded && loader && !state.payload && !state.loading && !state.error) {
      setState({ loading: true, payload: null, error: "" });
      loader(item)
        .then(payload => setState({ loading: false, payload, error: "" }))
        .catch(error => setState({ loading: false, payload: null, error: messageFromError(error) }));
    }
  }

  return [expanded, state, toggle];
}

function Chevron({ expanded }: { expanded: boolean }) {
  const Icon = expanded ? UiChevronDown : UiChevronRight;
  return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-4 w-4 rounded-full border border-border object-cover"
      loading="lazy"
    />
  );
}

export function GitDiffPanel({
  loading,
  payload,
  error,
  emptyLabel = "No text diff available",
  className,
  maxHeightClassName = "max-h-[520px]",
}: GitDiffPanelProps) {
  if (loading) {
    return (
      <div className={cn("border-t border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground", className)}>
        Loading diff...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("border-t border-border bg-rose-50 px-3 py-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300", className)}>
        {error}
      </div>
    );
  }

  if (payload?.binary) {
    return (
      <div className={cn("border-t border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground", className)}>
        Binary file not shown.
      </div>
    );
  }

  if (!payload?.diff) {
    return (
      <div className={cn("border-t border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground", className)}>
        {emptyLabel}
      </div>
    );
  }

  const language = languageFromPath(payload.path);
  return (
    <div className={cn("border-t border-border", className)}>
      {payload.truncated && (
        <div className="border-b border-border bg-amber-100/70 px-3 py-1.5 text-xs text-amber-800 [[data-theme=dark]_&]:bg-amber-950/40 [[data-theme=dark]_&]:text-amber-200">
          Diff truncated.
        </div>
      )}
      <CodeDiff
        bare
        unified={payload.diff}
        className={cn("overflow-auto px-1 py-2", maxHeightClassName)}
        {...(language ? { language } : {})}
      />
    </div>
  );
}

function CommitRow({
  commit,
  loadDiff,
  renderTime,
  diffMaxHeightClassName,
}: {
  commit: GitCommitItem;
  loadDiff?: GitDiffLoader<GitCommitItem>;
  renderTime?: (iso: string) => ReactNode;
  diffMaxHeightClassName?: string;
}) {
  const [expanded, diffState, toggle] = useLazyDiff(commit, loadDiff);
  const author = displayAuthor(commit);
  const canExpand = Boolean(loadDiff || commit.body);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!canExpand || !isActivationKey(event)) return;
    event.preventDefault();
    toggle();
  }

  return (
    <div>
      <div
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
        className={cn(
          "flex min-h-14 items-start gap-2 px-3 py-2 text-xs transition-colors",
          canExpand && "cursor-pointer hover:bg-muted/70",
        )}
        onClick={canExpand ? toggle : undefined}
        onKeyDown={canExpand ? onKeyDown : undefined}
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UiGitCommit className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground" title={commit.title}>
            {commit.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-muted-foreground">
            {commit.authorAvatarUrl && (
              <AvatarImage src={commit.authorAvatarUrl} alt={author || "Commit author"} />
            )}
            {author && <span>{author}</span>}
            {commit.committedAt && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <UiClock className="h-3 w-3" />
                  {renderTime ? renderTime(commit.committedAt) : formatFallbackTime(commit.committedAt)}
                </span>
              </>
            )}
            {statText(commit.additions, commit.deletions)}
            {(commit.changedFiles ?? 0) > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{commit.changedFiles} files</span>
              </>
            )}
          </div>
        </div>
        {commit.href ? (
          <a
            href={commit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex shrink-0 items-center gap-1 font-mono text-cyan-600 hover:underline"
            onClick={event => event.stopPropagation()}
          >
            {shortSha(commit)}
            <UiLinkExternal className="h-3 w-3" />
          </a>
        ) : (
          <span className="mt-0.5 shrink-0 font-mono text-cyan-600">{shortSha(commit)}</span>
        )}
        {canExpand && (
          <span className="mt-1 shrink-0">
            <Chevron expanded={expanded} />
          </span>
        )}
      </div>
      {expanded && (
        <div className="border-t border-border bg-secondary/50">
          {commit.body && (
            <pre className="mx-3 my-2 whitespace-pre-wrap rounded bg-muted px-3 py-2 font-mono text-[11px] leading-5 text-muted-foreground">
              {commit.body}
            </pre>
          )}
          {loadDiff && (
            <GitDiffPanel
              loading={diffState.loading}
              payload={diffState.payload}
              error={diffState.error}
              {...(diffMaxHeightClassName ? { maxHeightClassName: diffMaxHeightClassName } : {})}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function GitCommitList({
  commits,
  loadDiff,
  renderTime,
  groupByDate = true,
  emptyLabel = "No commits found",
  className,
  diffMaxHeightClassName,
}: GitCommitListProps) {
  const groups = useMemo(() => groupCommits(commits, groupByDate), [commits, groupByDate]);

  if (commits.length === 0) {
    return <div className={cn("py-4 text-xs text-muted-foreground", className)}>{emptyLabel}</div>;
  }

  return (
    <div className={cn("overflow-hidden rounded-md border border-border", className)}>
      {groups.map(group => (
        <section key={group.key} aria-label={group.label || "Commits"}>
          {group.label && (
            <div className="border-b border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground">
              {group.label}
            </div>
          )}
          <div className="divide-y divide-border">
            {group.commits.map(commit => (
              <CommitRow
                key={commit.id || commit.sha}
                commit={commit}
                {...(loadDiff ? { loadDiff } : {})}
                {...(renderTime ? { renderTime } : {})}
                {...(diffMaxHeightClassName ? { diffMaxHeightClassName } : {})}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type StatusView = {
  label: string;
  icon: IconComponent;
  iconClassName: string;
};

function normalizedStatus(status?: string): string {
  return (status || "modified").toLowerCase();
}

function statusView(status?: string): StatusView {
  switch (normalizedStatus(status)) {
    case "added":
      return { label: "Added", icon: UiFilePlus, iconClassName: "text-emerald-600 dark:text-emerald-400" };
    case "deleted":
      return { label: "Deleted", icon: UiRemove, iconClassName: "text-rose-600 dark:text-rose-400" };
    case "renamed":
      return { label: "Renamed", icon: UiFileCode, iconClassName: "text-sky-600 dark:text-sky-400" };
    case "copied":
      return { label: "Copied", icon: UiCode2, iconClassName: "text-sky-600 dark:text-sky-400" };
    default:
      return { label: "Modified", icon: UiFile, iconClassName: "text-amber-600 dark:text-amber-400" };
  }
}

function splitPath(path: string): { directory: string; basename: string } {
  const index = path.lastIndexOf("/");
  if (index < 0) return { directory: "", basename: path };
  return { directory: `${path.slice(0, index)}/`, basename: path.slice(index + 1) };
}

function DiffBars({ additions = 0, deletions = 0 }: { additions?: number; deletions?: number }) {
  const total = additions + deletions;
  const maxBars = 5;
  const addBars = total > 0 ? Math.round((additions / total) * maxBars) : 0;
  const delBars = total > 0 ? maxBars - addBars : 0;
  return (
    <span className="inline-flex gap-px" aria-hidden>
      {Array.from({ length: addBars }).map((_, index) => (
        <span key={`a${index}`} className="inline-block h-2 w-1.5 rounded-sm bg-emerald-500" />
      ))}
      {Array.from({ length: delBars }).map((_, index) => (
        <span key={`d${index}`} className="inline-block h-2 w-1.5 rounded-sm bg-rose-500" />
      ))}
      {total === 0 && <span className="inline-block h-2 w-1.5 rounded-sm bg-muted-foreground/30" />}
    </span>
  );
}

function FileRow({
  file,
  loadDiff,
  diffMaxHeightClassName,
}: {
  file: GitFileChangeItem;
  loadDiff?: GitDiffLoader<GitFileChangeItem>;
  diffMaxHeightClassName?: string;
}) {
  const [expanded, diffState, toggle] = useLazyDiff(file, loadDiff);
  const status = statusView(file.status);
  const StatusIcon = status.icon;
  const path = splitPath(file.path);
  const canExpand = Boolean(loadDiff);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!canExpand || !isActivationKey(event)) return;
    event.preventDefault();
    toggle();
  }

  return (
    <div>
      <div
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
        className={cn(
          "flex min-h-11 items-center gap-2 px-3 py-2 text-xs transition-colors",
          canExpand && "cursor-pointer hover:bg-muted/70",
        )}
        onClick={canExpand ? toggle : undefined}
        onKeyDown={canExpand ? onKeyDown : undefined}
      >
        <StatusIcon className={cn("h-4 w-4 shrink-0", status.iconClassName)} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-foreground" title={file.path}>
            {path.directory && <span className="text-muted-foreground">{path.directory}</span>}
            <span>{path.basename}</span>
          </div>
          {file.previousPath && (
            <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              from {file.previousPath}
            </div>
          )}
        </div>
        <span className="shrink-0 text-[11px] text-muted-foreground">{status.label}</span>
        <span className="shrink-0 tabular-nums text-emerald-600 dark:text-emerald-400">
          +{file.additions ?? 0}
        </span>
        <span className="shrink-0 tabular-nums text-rose-600 dark:text-rose-400">
          -{file.deletions ?? 0}
        </span>
        <DiffBars
          {...(file.additions !== undefined ? { additions: file.additions } : {})}
          {...(file.deletions !== undefined ? { deletions: file.deletions } : {})}
        />
        {file.href && (
          <a
            href={file.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={event => event.stopPropagation()}
            aria-label={`Open ${file.path}`}
          >
            <UiLinkExternal className="h-3.5 w-3.5" />
          </a>
        )}
        {canExpand && (
          <span className="shrink-0">
            <Chevron expanded={expanded} />
          </span>
        )}
      </div>
      {expanded && (
        <GitDiffPanel
          loading={diffState.loading}
          payload={diffState.payload}
          error={diffState.error}
          {...(diffMaxHeightClassName ? { maxHeightClassName: diffMaxHeightClassName } : {})}
        />
      )}
    </div>
  );
}

export function GitFileList({
  files,
  loadDiff,
  emptyLabel = "No changed files found",
  className,
  diffMaxHeightClassName,
}: GitFileListProps) {
  if (files.length === 0) {
    return <div className={cn("py-4 text-xs text-muted-foreground", className)}>{emptyLabel}</div>;
  }

  return (
    <div className={cn("overflow-hidden rounded-md border border-border", className)}>
      <div className="divide-y divide-border">
        {files.map(file => (
          <FileRow
            key={file.id || file.path}
            file={file}
            {...(loadDiff ? { loadDiff } : {})}
            {...(diffMaxHeightClassName ? { diffMaxHeightClassName } : {})}
          />
        ))}
      </div>
    </div>
  );
}

export function GitChangedFilesSummary({
  files,
  additions,
  deletions,
  className,
}: {
  files: number;
  additions: number;
  deletions: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-1 font-medium">
        <UiDiff className="h-3.5 w-3.5" />
        {files} file{files === 1 ? "" : "s"} changed
      </span>
      <span aria-hidden>·</span>
      <span className="text-emerald-600 dark:text-emerald-400">+{additions}</span>
      <span className="text-rose-600 dark:text-rose-400">-{deletions}</span>
    </div>
  );
}
