import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { Tree } from "../data/Tree";
import { LintSeverityIcon } from "../data/test-runner/MarkIcons";
import { UiFileCode, UiFolder, UiLoader } from "../icons";
import { SplitPane } from "../layout/SplitPane";
import { cn } from "../lib/utils";
import { groupFindingsByFile } from "./adapters";
import { FileReview, type FileReviewView } from "./file-review/FileReview";
import type { ProblemFilters } from "./file-review/problem-filters";
import { countFindingsBySeverity, FINDING_SEVERITIES } from "./severity-counts";
import {
  fileRefKey,
  sameFileRef,
  type FileFinding,
  type FileRef,
  type FileTreeNode,
} from "./types";

export type FileFindingsViewProps = {
  findings: readonly FileFinding[];
  /** The open file, or null for none. Controlled so the host can keep it in its URL. */
  selectedFile: FileRef | null;
  onSelectFile: (file: FileRef) => void;
  /** Line to reveal in the open file. Controlled. */
  line?: number | undefined;
  onLineChange: (line: number | undefined) => void;
  /** The open file's tab. A code file has no Preview, so "preview" shows its Source. Controlled. */
  view: FileReviewView;
  onViewChange: (view: FileReviewView) => void;
  /** Severity and issue-type filters on the Problems tab. Controlled. */
  problemFilters: ProblemFilters;
  onProblemFiltersChange: (filters: ProblemFilters) => void;
  /** Fetches a file's text. A rejection is shown to the reader in full. */
  loadFile: (file: FileRef) => Promise<string>;
  /** Contextual menu items for each finding in Problems, Source and Preview. */
  getFindingActions?: ((finding: FileFinding) => DropdownMenuItem[]) | undefined;
  /** Initial width percentage of the file tree. */
  defaultSplit?: number | undefined;
  className?: string | undefined;
};

type LoadState =
  | { key: string; status: "loading" }
  | { key: string; status: "error"; message: string }
  | { key: string; status: "ready"; text: string };

function isMarkdownPath(path: string): boolean {
  return /\.mdx?$/i.test(path);
}

function SeverityCounts({ findings }: { findings: readonly FileFinding[] }) {
  const counts = countFindingsBySeverity(findings);
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      {FINDING_SEVERITIES.filter((s) => counts[s] > 0).map((s) => (
        <span key={s} className="inline-flex items-center gap-0.5" title={`${counts[s]} ${s}`}>
          <LintSeverityIcon severity={s} />
          <span className="tabular-nums">{counts[s]}</span>
        </span>
      ))}
    </span>
  );
}

function FileTreeRow({ node, selected }: { node: FileTreeNode; selected: boolean }) {
  return (
    <>
      <Icon icon={node.kind === "folder" ? UiFolder : UiFileCode} className="shrink-0 text-muted-foreground" />
      <span className={cn("min-w-0 truncate text-foreground", selected ? "font-semibold" : "font-medium")} title={node.name}>
        {node.name}
      </span>
      <span className="flex-1" />
      <SeverityCounts findings={node.findings} />
    </>
  );
}

function findFileNode(nodes: readonly FileTreeNode[], ref: FileRef | null): FileTreeNode | null {
  if (!ref) return null;
  for (const node of nodes) {
    if (node.kind === "file" && sameFileRef(node.ref ?? null, ref)) return node;
    const found = findFileNode(node.children ?? [], ref);
    if (found) return found;
  }
  return null;
}

/** Loads `ref`'s text whenever it changes; a result for a file that is no longer open is discarded. */
function useFileText(ref: FileRef | null, loadFile: (file: FileRef) => Promise<string>): LoadState | null {
  const [state, setState] = useState<LoadState | null>(null);
  const key = ref ? fileRefKey(ref) : null;
  // A host that rebuilds `ref` or `loadFile` each render must not reload the file.
  const latest = useRef({ ref, loadFile });
  latest.current = { ref, loadFile };

  useEffect(() => {
    const { ref, loadFile } = latest.current;
    if (!ref || !key) {
      setState(null);
      return;
    }
    let current = true;
    setState({ key, status: "loading" });
    loadFile(ref).then(
      (text) => current && setState({ key, status: "ready", text }),
      (error: unknown) =>
        current &&
        setState({ key, status: "error", message: error instanceof Error ? error.message : String(error) }),
    );
    return () => {
      current = false;
    };
  }, [key]);

  return state?.key === key ? state : null;
}

function Placeholder({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">{children}</div>;
}

function FileViewer({
  file,
  findings,
  state,
  line,
  onLineChange,
  view,
  onViewChange,
  problemFilters,
  onProblemFiltersChange,
  getFindingActions,
}: Pick<
  FileFindingsViewProps,
  "line" | "onLineChange" | "view" | "onViewChange" | "problemFilters" | "onProblemFiltersChange" | "getFindingActions"
> & {
  file: FileRef;
  findings: readonly FileFinding[];
  state: LoadState | null;
}) {
  const markdown = isMarkdownPath(file.file);
  // Moving from a markdown file to code keeps the view; code has no Preview, so it reads as Source.
  const shown: FileReviewView = !markdown && view === "preview" ? "source" : view;

  let body: ReactNode;
  if (!state || state.status === "loading") {
    body = (
      <Placeholder>
        <Icon icon={UiLoader} className="mr-2 animate-spin" />
        Loading {file.file}
      </Placeholder>
    );
  } else if (state.status === "error") {
    body = (
      <div role="alert" className="m-density-4 rounded-md border border-destructive/40 p-3 text-sm text-destructive">
        <div className="font-semibold">Could not load {file.file}</div>
        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs">{state.message}</pre>
      </div>
    );
  } else {
    body = (
      <FileReview
        key={fileRefKey(file)}
        path={file.file}
        source={state.text}
        view={shown}
        onViewChange={onViewChange}
        findings={findings}
        problemFilters={problemFilters}
        onProblemFiltersChange={onProblemFiltersChange}
        line={line}
        onLineChange={onLineChange}
        getFindingActions={getFindingActions}
        className="h-full p-density-2"
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-w-0 items-center gap-2 border-b border-border px-density-4 py-density-2" data-file-header="">
        <span className="min-w-0 truncate font-mono text-sm" title={file.workDir ? `${file.workDir}/${file.file}` : file.file}>
          {file.file}
        </span>
        <SeverityCounts findings={findings} />
      </div>
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  );
}

/**
 * Every file that has lint violations or failed tests, as a tree beside a
 * `FileReview` of the open file: syntax-highlighted source with each finding
 * under its line, a rendered Preview for markdown, and a Problems list. Fully controlled:
 * the open file, line and view live in props so the host can keep them in its
 * URL, and file text comes from `loadFile`, so nothing here fetches.
 */
export function FileFindingsView({
  findings,
  selectedFile,
  onSelectFile,
  line,
  onLineChange,
  view,
  onViewChange,
  problemFilters,
  onProblemFiltersChange,
  loadFile,
  getFindingActions,
  defaultSplit = 28,
  className,
}: FileFindingsViewProps) {
  const tree = useMemo(() => groupFindingsByFile(findings), [findings]);
  const selectedNode = useMemo(() => findFileNode(tree, selectedFile), [tree, selectedFile]);
  const state = useFileText(selectedFile, loadFile);

  const treePane = (
    <Tree<FileTreeNode>
      className="min-h-0"
      roots={tree}
      getKey={(node) => node.key}
      getChildren={(node) => node.children}
      selected={selectedNode}
      onSelect={(node) => {
        if (node.kind === "file" && node.ref) onSelectFile(node.ref);
      }}
      defaultOpen={() => true}
      showSearch
      searchLabel="Filter files"
      getSearchText={(node) => node.name}
      empty={<div className="p-8 text-center text-sm text-muted-foreground">No lint violations or failed tests with a file location</div>}
      renderRow={({ node, selected }) => <FileTreeRow node={node} selected={selected} />}
    />
  );

  const viewerPane = !selectedFile ? (
    <Placeholder>Select a file to see its findings in context.</Placeholder>
  ) : !selectedNode ? (
    <Placeholder>{selectedFile.file} has no findings in this run.</Placeholder>
  ) : (
    <FileViewer
      file={selectedFile}
      findings={selectedNode.findings}
      state={state}
      line={line}
      onLineChange={onLineChange}
      view={view}
      onViewChange={onViewChange}
      problemFilters={problemFilters}
      onProblemFiltersChange={onProblemFiltersChange}
      getFindingActions={getFindingActions}
    />
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background", className)} data-file-findings="">
      <SplitPane
        className="min-h-0 flex-1"
        defaultSplit={defaultSplit}
        minLeft={15}
        minRight={40}
        leftClass="border-r-2 border-border bg-muted/30"
        left={treePane}
        right={viewerPane}
      />
    </div>
  );
}
