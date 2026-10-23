import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { TabButton } from "../data/TabButton";
import { Tree } from "../data/Tree";
import { LintSeverityIcon } from "../data/test-runner/MarkIcons";
import { UiFileCode, UiFolder, UiLoader } from "../icons";
import { SplitPane } from "../layout/SplitPane";
import { cn } from "../lib/utils";
import { groupFindingsByFile } from "./adapters";
import { AnnotatedMarkdown } from "./AnnotatedMarkdown";
import { AnnotatedCode } from "./LazyAnnotatedCode";
import {
  fileRefKey,
  sameFileRef,
  type FileFinding,
  type FileRef,
  type FileTreeNode,
  type FindingsViewMode,
  type LintSeverity,
} from "./types";

export type FileFindingsViewProps = {
  findings: readonly FileFinding[];
  /** The open file, or null for none. Controlled so the host can keep it in its URL. */
  selectedFile: FileRef | null;
  onSelectFile: (file: FileRef) => void;
  /** Line to reveal in the open file. Controlled. */
  line?: number | undefined;
  onLineChange: (line: number | undefined) => void;
  /** How a markdown file is shown; other files always open in the editor. Controlled. */
  view: FindingsViewMode;
  onViewChange: (view: FindingsViewMode) => void;
  /** Fetches a file's text. A rejection is shown to the reader in full. */
  loadFile: (file: FileRef) => Promise<string>;
  /** Extra controls under each finding's thread, e.g. an ignore action. */
  renderFindingActions?: ((finding: FileFinding) => ReactNode) | undefined;
  /** Initial width percentage of the file tree. */
  defaultSplit?: number | undefined;
  className?: string | undefined;
};

type LoadState =
  | { key: string; status: "loading" }
  | { key: string; status: "error"; message: string }
  | { key: string; status: "ready"; text: string };

const SEVERITIES: readonly LintSeverity[] = ["error", "warning", "info"];

function isMarkdownPath(path: string): boolean {
  return /\.mdx?$/i.test(path);
}

function countBySeverity(findings: readonly FileFinding[]): Record<LintSeverity, number> {
  const counts: Record<LintSeverity, number> = { error: 0, warning: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}

function SeverityCounts({ findings }: { findings: readonly FileFinding[] }) {
  const counts = countBySeverity(findings);
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      {SEVERITIES.filter((s) => counts[s] > 0).map((s) => (
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
  renderFindingActions,
}: Pick<FileFindingsViewProps, "line" | "onLineChange" | "view" | "onViewChange" | "renderFindingActions"> & {
  file: FileRef;
  findings: readonly FileFinding[];
  state: LoadState | null;
}) {
  const markdown = isMarkdownPath(file.file);
  const rendered = markdown && view === "rendered";
  const key = fileRefKey(file);

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
  } else if (rendered) {
    body = (
      <AnnotatedMarkdown
        key={key}
        path={file.file}
        source={state.text}
        findings={findings}
        line={line}
        onLineChange={onLineChange}
        renderFindingActions={renderFindingActions}
      />
    );
  } else {
    body = (
      <AnnotatedCode
        key={key}
        path={file.file}
        workDir={file.workDir}
        source={state.text}
        findings={findings}
        line={line}
        onLineChange={onLineChange}
        renderFindingActions={renderFindingActions}
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
        {markdown && (
          <div className="ml-auto flex shrink-0 items-center gap-1" role="tablist" aria-label="Markdown view">
            <TabButton active={view === "rendered"} onClick={() => onViewChange("rendered")} label="Rendered" />
            <TabButton active={view === "source"} onClick={() => onViewChange("source")} label="Source" />
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  );
}

/**
 * Every file that has lint violations or failed tests, as a tree beside an
 * annotated viewer of the open file: Monaco with markers for code, and the
 * rendered document with its findings as comment threads for markdown (with a
 * Rendered/Source toggle). Needs a `MonacoProvider` above it. Fully controlled:
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
  loadFile,
  renderFindingActions,
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
      renderFindingActions={renderFindingActions}
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
