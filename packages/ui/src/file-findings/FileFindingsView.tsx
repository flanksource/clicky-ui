import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { Tree } from "../data/Tree";
import { UiFileCode, UiFolder, UiImage, UiLoader } from "../icons";
import { SplitPane } from "../layout/SplitPane";
import { cn } from "../lib/utils";
import { groupFindingsByFile } from "./adapters";
import {
  FileReview,
  type FileReviewComments,
  type FileReviewLayout,
  type FileReviewProps,
  type FileReviewTab,
  type FileReviewView,
} from "./file-review/FileReview";
import { isImagePath, isRasterImagePath, resolveRelativeFile } from "./file-urls";
import type { ProblemFilters } from "./file-review/problem-filters";
import { FolderFindings, type FolderTab } from "./FolderFindings";
import { FOLDER_PROBLEMS_VIEW } from "./file-review/views";
import { NodeActions } from "./NodeActions";
import { SeverityCounts } from "./SeverityCounts";
import {
  fileRefKey,
  sameSelection,
  type FileFinding,
  type FileRef,
  type FileTreeNode,
  type FileTreeSelection,
} from "./types";

/** What a tree-row slot gets: the node, whether it is open, and the row part it replaces. */
export type FileTreeSlotContext = { node: FileTreeNode; selected: boolean; default: ReactNode };

/** Replace or wrap parts of a tree row; each returns what to render in place of `ctx.default`. */
export type FileTreeNodeSlots = {
  icon?: ((ctx: FileTreeSlotContext) => ReactNode) | undefined;
  name?: ((ctx: FileTreeSlotContext) => ReactNode) | undefined;
  /** Right-hand badges; the default is the per-severity counts. */
  badges?: ((ctx: FileTreeSlotContext) => ReactNode) | undefined;
};

export type FileFindingsViewProps = {
  findings: readonly FileFinding[];
  /**
   * Files to list in the tree besides those with findings; a file without
   * findings shows a zero count and opens like any other.
   */
  files?: readonly FileRef[] | undefined;
  /** The open file or folder, or null for none. Controlled so the host can keep it in its URL. */
  selected: FileTreeSelection | null;
  onSelect: (selection: FileTreeSelection) => void;
  /** Line to reveal in the open file. Controlled. */
  line?: number | undefined;
  onLineChange: (line: number | undefined) => void;
  /**
   * The open node's tab: a built-in or host file tab, or a folder tab. One value
   * is shared as the reader moves between nodes, so a view the open node lacks
   * shows its first tab: Preview (Source for code) for a file, Problems for a folder.
   */
  view: FileReviewView;
  onViewChange: (view: FileReviewView) => void;
  /** Severity and issue-type filters on the Problems tabs. Controlled. */
  problemFilters: ProblemFilters;
  onProblemFiltersChange: (filters: ProblemFilters) => void;
  /** Fetches a file's text. A rejection is shown to the reader in full. */
  loadFile: (file: FileRef) => Promise<string>;
  /**
   * Makes the open file editable: Source becomes an editor (the host renders a
   * MonacoProvider) and each edit replaces the loaded text, so Preview,
   * Problems and host tabs show the draft, before it is reported here. Reopening
   * a file calls `loadFile` again, which should return the host's draft.
   */
  onSourceChange?: ((file: FileRef, source: string) => void) | undefined;
  /**
   * The URL that serves a file's raw bytes. Image files (png, jpg, gif, webp,
   * svg…) open as images from it, a raster image is never passed to `loadFile`,
   * and relative images in markdown resolve through it. Without it images are
   * treated as any other file.
   */
  fileUrl?: ((file: FileRef) => string) | undefined;
  /** Contextual menu items for each finding, in files and folders. A finding names its own file. */
  getFindingActions?: ((finding: FileFinding) => DropdownMenuItem[]) | undefined;
  /** Host actions for a file: a menu on its tree row and in its header. */
  getFileActions?: ((file: FileRef) => DropdownMenuItem[]) | undefined;
  /** Host actions for a folder: a menu on its tree row and in its header. */
  getFolderActions?: ((folder: FileRef) => DropdownMenuItem[]) | undefined;
  /** Host controls in the open file's toolbar, e.g. save or re-lint buttons. */
  fileToolbar?: ((file: FileRef) => ReactNode) | undefined;
  /** Host tabs after the open file's Preview, Source and Problems. */
  fileTabs?: ((file: FileRef) => FileReviewTab[]) | undefined;
  /** Host tabs after the open folder's Problems. */
  folderTabs?: ((folder: FileRef) => FolderTab[]) | undefined;
  /**
   * People's threads on a file, scoped by the host since anchors name no file.
   * Assignment, "Run agent" entries (`extraAssignItems`) and post variants
   * (`createActions`) ride along; auto-assigning new threads is the host's
   * `onCreate` policy. With `config.assignees`, findings gain "Assign…".
   */
  comments?: ((file: FileRef) => FileReviewComments | undefined) | undefined;
  /** Selecting text in the open file offers a Comment button; needs `comments`' `onCreate`. */
  selectToComment?: boolean | undefined;
  /** People / Tools chips that filter the open file's threads by author kind. */
  authorFilter?: boolean | undefined;
  layout?: FileReviewLayout | undefined;
  onLayoutChange?: ((layout: FileReviewLayout) => void) | undefined;
  /** Replace or wrap the icon, name and badges of tree rows. */
  treeNode?: FileTreeNodeSlots | undefined;
  /** Host controls in the tree's toolbar, beside its filter. */
  treeActions?: ReactNode;
  /**
   * Shows the open file's or folder's path in its header. Turn off when the host
   * shows it elsewhere, e.g. as breadcrumbs; counts and actions stay. Default true.
   */
  showPath?: boolean | undefined;
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

type FileKind = { markdown: boolean; image: boolean; raster: boolean };

/**
 * The view a file shows for the shared `view`: it, when the file has that tab,
 * else its first tab. A raster image has only Preview (and host tabs).
 */
function fileView(view: FileReviewView, kind: FileKind, tabs: readonly FileReviewTab[]): FileReviewView {
  if (tabs.some((tab) => tab.id === view)) return view;
  if (kind.raster) return "preview";
  if (view === "source" || view === "problems") return view;
  return kind.markdown || kind.image ? "preview" : "source";
}

/** A markdown image's URL: through `fileUrl` when it names a file relative to `file`, else as authored. */
function relativeImageUrl({ file, url, kind, fileUrl }: { file: FileRef; url: string; kind: "link" | "image"; fileUrl: (file: FileRef) => string }): string {
  const target = kind === "image" ? resolveRelativeFile(file, url) : null;
  return target ? fileUrl(target) : url;
}

function FileTreeRow({
  node,
  selected,
  slots,
  actions,
}: {
  node: FileTreeNode;
  selected: boolean;
  slots: FileTreeNodeSlots | undefined;
  actions: DropdownMenuItem[];
}) {
  const slot = (part: keyof FileTreeNodeSlots, fallback: ReactNode) => {
    const render = slots?.[part];
    return render ? render({ node, selected, default: fallback }) : fallback;
  };
  return (
    <>
      {slot("icon", <Icon icon={node.kind === "folder" ? UiFolder : isImagePath(node.ref.file) ? UiImage : UiFileCode} className="shrink-0 text-muted-foreground" />)}
      {slot(
        "name",
        <span className={cn("min-w-0 truncate text-foreground", selected ? "font-semibold" : "font-medium")} title={node.name}>
          {node.name}
        </span>,
      )}
      <span className="flex-1" />
      {slot("badges", <SeverityCounts findings={node.findings} />)}
      <NodeActions variant="row" items={actions} label={node.kind === "folder" ? "Folder actions" : "File actions"} />
    </>
  );
}

function findNode(nodes: readonly FileTreeNode[], selection: FileTreeSelection | null): FileTreeNode | null {
  if (!selection) return null;
  for (const node of nodes) {
    if (sameSelection({ kind: node.kind, ref: node.ref }, selection)) return node;
    const found = findNode(node.children ?? [], selection);
    if (found) return found;
  }
  return null;
}

/**
 * Loads `ref`'s text whenever it changes; a result for a file that is no longer
 * open is discarded. `replaceText` swaps the text of the loaded file for a draft.
 */
function useFileText(
  ref: FileRef | null,
  loadFile: (file: FileRef) => Promise<string>,
): { state: LoadState | null; replaceText: (text: string) => void } {
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

  const replaceText = (text: string) =>
    setState((current) => (current?.key === key && current.status === "ready" ? { ...current, text } : current));

  return { state: state?.key === key ? state : null, replaceText };
}

function Placeholder({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">{children}</div>;
}

type FileViewerProps = Pick<
  FileFindingsViewProps,
  | "line"
  | "onLineChange"
  | "onViewChange"
  | "problemFilters"
  | "onProblemFiltersChange"
  | "getFindingActions"
  | "selectToComment"
  | "authorFilter"
  | "layout"
  | "onLayoutChange"
> & {
  file: FileRef;
  showPath: boolean;
  findings: readonly FileFinding[];
  state: LoadState | null;
  view: FileReviewView;
  tabs: FileReviewTab[];
  actions: DropdownMenuItem[];
  toolbar: ReactNode;
  comments: FileReviewComments | undefined;
  /** Serves the file as an image. */
  imageUrl: string | undefined;
  /** An image with no text source: `state` is not used. */
  raster: boolean;
  resolveUrl: FileReviewProps["resolveUrl"];
  /** Set when the file is editable: Source becomes an editor. */
  onSourceChange: ((source: string) => void) | undefined;
};

function FileViewer({ file, showPath, findings, state, view, tabs, actions, toolbar, comments, imageUrl, raster, resolveUrl, onSourceChange, selectToComment, authorFilter, layout, onLayoutChange, ...review }: FileViewerProps) {
  const ready = state?.status === "ready" ? state : null;
  let body: ReactNode;
  if (!raster && !ready) {
    body =
      state?.status === "error" ? (
        <div role="alert" className="m-density-4 rounded-md border border-destructive/40 p-3 text-sm text-destructive">
          <div className="font-semibold">Could not load {file.file}</div>
          <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs">{state.message}</pre>
        </div>
      ) : (
        <Placeholder>
          <Icon icon={UiLoader} className="mr-2 animate-spin" />
          Loading {file.file}
        </Placeholder>
      );
  } else {
    body = (
      <FileReview
        key={fileRefKey(file)}
        path={file.file}
        view={view}
        findings={findings}
        tabs={tabs}
        toolbar={toolbar}
        {...(ready ? { source: ready.text } : {})}
        {...(imageUrl ? { imageUrl } : {})}
        {...(resolveUrl ? { resolveUrl } : {})}
        {...(ready && onSourceChange ? { onSourceChange } : {})}
        {...(comments ? { comments } : {})}
        {...(selectToComment !== undefined ? { selectToComment } : {})}
        {...(authorFilter !== undefined ? { authorFilter } : {})}
        {...(layout ? { layout } : {})}
        {...(onLayoutChange ? { onLayoutChange } : {})}
        {...review}
        className="h-full p-density-2"
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-w-0 items-center gap-2 border-b border-border px-density-4 py-density-2" data-file-header="">
        {showPath && (
          <span className="min-w-0 truncate font-mono text-sm" title={file.workDir ? `${file.workDir}/${file.file}` : file.file}>
            {file.file}
          </span>
        )}
        <SeverityCounts findings={findings} />
        <span className="flex-1" />
        <NodeActions items={actions} label="File actions" />
      </div>
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  );
}

/**
 * Every file that has lint violations or failed tests, as a tree beside the
 * open node: a `FileReview` of a file (syntax-highlighted source with each
 * finding under its line, a rendered Preview for markdown, a Problems list and
 * host tabs), or a folder's problems grouped by file. Fully controlled: the
 * open node, line and view live in props so the host can keep them in its URL,
 * and file text comes from `loadFile`, so nothing here fetches. Hosts extend it
 * through tree-row slots, file/folder/finding action menus, per-file comments
 * and file/folder tabs.
 */
export function FileFindingsView({
  findings,
  files,
  selected,
  onSelect,
  view,
  onViewChange,
  loadFile,
  onSourceChange,
  fileUrl,
  getFileActions,
  getFolderActions,
  fileToolbar,
  fileTabs,
  folderTabs,
  comments,
  treeNode,
  treeActions,
  showPath = true,
  defaultSplit = 28,
  className,
  ...review
}: FileFindingsViewProps) {
  const tree = useMemo(() => groupFindingsByFile(findings, files), [findings, files]);
  const selectedNode = useMemo(() => findNode(tree, selected), [tree, selected]);
  const openFile = selectedNode?.kind === "file" ? selectedNode.ref : null;
  const openKey = openFile ? fileRefKey(openFile) : null;
  // Stable per open file: Markdown rebuilds its rehype pipeline whenever `resolveUrl` changes.
  const resolveUrl = useMemo<FileReviewProps["resolveUrl"]>(
    () => (openFile && fileUrl && isMarkdownPath(openFile.file) ? (url, kind) => relativeImageUrl({ file: openFile, url, kind, fileUrl }) : undefined),
    [openKey, fileUrl],
  );
  // A raster image has no text, so it is never passed to `loadFile`.
  const textRef = selected?.kind === "file" && !(fileUrl && isRasterImagePath(selected.ref.file)) ? selected.ref : null;
  const { state, replaceText } = useFileText(textRef, loadFile);
  const nodeActions = (node: FileTreeNode) => (node.kind === "folder" ? getFolderActions : getFileActions)?.(node.ref) ?? [];

  const treePane = (
    <Tree<FileTreeNode>
      className="min-h-0"
      roots={tree}
      getKey={(node) => node.key}
      getChildren={(node) => node.children}
      selected={selectedNode}
      revealSelected
      onSelect={(node) => onSelect({ kind: node.kind, ref: node.ref })}
      defaultOpen={() => true}
      showSearch
      searchLabel="Filter files"
      getSearchText={(node) => node.name}
      {...(treeActions ? { actions: treeActions } : {})}
      empty={<div className="p-8 text-center text-sm text-muted-foreground">No lint violations or failed tests with a file location</div>}
      renderRow={({ node, selected }) => <FileTreeRow node={node} selected={selected} slots={treeNode} actions={nodeActions(node)} />}
    />
  );

  let viewerPane: ReactNode;
  if (!selected) {
    viewerPane = <Placeholder>Select a file to see its findings in context.</Placeholder>;
  } else if (!selectedNode) {
    viewerPane = (
      <Placeholder>
        {selected.ref.file || "This folder"} has no findings in this run.
      </Placeholder>
    );
  } else if (selectedNode.kind === "folder") {
    const tabs = folderTabs?.(selectedNode.ref) ?? [];
    viewerPane = (
      <FolderFindings
        folder={selectedNode.ref}
        name={selectedNode.name}
        showPath={showPath}
        findings={selectedNode.findings}
        view={tabs.some((tab) => tab.id === view) ? view : FOLDER_PROBLEMS_VIEW}
        onViewChange={onViewChange}
        problemFilters={review.problemFilters}
        onProblemFiltersChange={review.onProblemFiltersChange}
        onOpenFile={(file, line) => {
          onSelect({ kind: "file", ref: file });
          if (line !== undefined) review.onLineChange(line);
        }}
        getFindingActions={review.getFindingActions}
        actions={nodeActions(selectedNode)}
        tabs={tabs}
      />
    );
  } else {
    const file = selectedNode.ref;
    const tabs = fileTabs?.(file) ?? [];
    const markdown = isMarkdownPath(file.file);
    const image = Boolean(fileUrl) && isImagePath(file.file);
    const raster = Boolean(fileUrl) && isRasterImagePath(file.file);
    viewerPane = (
      <FileViewer
        {...review}
        file={file}
        showPath={showPath}
        findings={selectedNode.findings}
        state={state}
        view={fileView(view, { markdown, image, raster }, tabs)}
        onViewChange={onViewChange}
        tabs={tabs}
        actions={nodeActions(selectedNode)}
        toolbar={fileToolbar?.(file)}
        comments={comments?.(file)}
        imageUrl={fileUrl && image ? fileUrl(file) : undefined}
        raster={raster}
        resolveUrl={resolveUrl}
        onSourceChange={
          onSourceChange && !raster
            ? (source) => {
                replaceText(source);
                onSourceChange(file, source);
              }
            : undefined
        }
      />
    );
  }

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
