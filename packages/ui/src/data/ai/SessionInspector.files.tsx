import {
  UiFile,
  UiFileCode,
  UiFileSpreadsheet,
  UiFileText,
  UiFolder,
  UiImage,
  UiJson,
  UiMarkdown,
} from "../../icons";
import type { IconComponent } from "../../icons/types";
import {
  buildPathTree,
  foldersFirst,
  splitPath,
  type PathTreeNode,
} from "../../lib/path-tree";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { Tree } from "../Tree";
import type { SessionChangedFiles } from "./SessionViewer.unified";

type FileAccess = "read" | "written";

// One touch of a path. A file read and then written contributes two, both
// binding to the same tree node.
type FileTouch = { path: string; access: FileAccess };

type FileTreeNode = PathTreeNode<FileTouch>;

export function SessionFilesPanel({
  files,
}: {
  files: SessionChangedFiles | undefined;
}) {
  const roots = buildFileTree(files);
  if (!roots.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-density-6 text-center text-sm text-muted-foreground">
        No changed-file summary.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-density-3 py-density-2 text-xs text-muted-foreground">
        <span>
          {roots.reduce((count, node) => count + countFiles(node), 0)} files
        </span>
        <span className="flex gap-density-3">
          <span>R read</span>
          <span>W written</span>
        </span>
      </div>
      <Tree<FileTreeNode>
        roots={roots}
        ariaLabel="Session files"
        getChildren={(node) => node.children}
        getKey={(node) => node.key}
        getAriaLabel={(node) => node.key}
        getSearchText={(node) => node.key}
        defaultOpen={() => true}
        renderRow={({ node, hasChildren }) => (
          <FileTreeRow node={node} directory={hasChildren} />
        )}
        rowClass={(node) =>
          cn(
            "group min-h-6 border-l-2 border-transparent py-0 pr-density-3 text-xs hover:border-primary/40 hover:bg-muted/40",
            !node.children.length && wasWritten(node) && "border-l-amber-500/60",
          )
        }
        className="pb-1"
      />
    </div>
  );
}

function FileTreeRow({
  node,
  directory,
}: {
  node: FileTreeNode;
  directory: boolean;
}) {
  const FileIcon = directory ? UiFolder : fileTypeIcon(node.label);
  return (
    <>
      <Icon
        icon={FileIcon}
        className={cn(
          "size-4 shrink-0",
          directory
            ? "text-sky-600 dark:text-sky-400"
            : "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          directory ? "font-medium" : "font-mono",
        )}
      >
        {node.label}
      </span>
      {!directory ? <AccessBadge node={node} /> : null}
    </>
  );
}

function AccessBadge({ node }: { node: FileTreeNode }) {
  const read = node.items.some((touch) => touch.access === "read");
  const written = wasWritten(node);
  const label = read && written ? "RW" : written ? "W" : "R";
  return (
    <span
      title={
        label === "RW" ? "Read and written" : label === "W" ? "Written" : "Read"
      }
      className={cn(
        "w-6 shrink-0 text-right font-mono text-[11px] font-semibold",
        written ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function buildFileTree(files: SessionChangedFiles | undefined): FileTreeNode[] {
  const touches: FileTouch[] = [
    ...(files?.read ?? []).map((path): FileTouch => ({ path, access: "read" })),
    ...(files?.written ?? []).map(
      (path): FileTouch => ({ path, access: "written" }),
    ),
  ];
  return buildPathTree(touches, (touch) => splitPath(touch.path, "/"), {
    compare: foldersFirst,
  });
}

function wasWritten(node: FileTreeNode): boolean {
  return node.items.some((touch) => touch.access === "written");
}

function countFiles(node: FileTreeNode): number {
  return node.children.length
    ? node.children.reduce((count, child) => count + countFiles(child), 0)
    : 1;
}

function fileTypeIcon(path: string): IconComponent {
  const extension = path.toLowerCase().split(".").at(-1) ?? "";
  if (["md", "mdx"].includes(extension)) return UiMarkdown;
  if (["json", "jsonl"].includes(extension)) return UiJson;
  if (["csv", "xls", "xlsx"].includes(extension)) return UiFileSpreadsheet;
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(extension))
    return UiImage;
  if (["txt", "log", "rst"].includes(extension)) return UiFileText;
  if (
    [
      "ts",
      "tsx",
      "js",
      "jsx",
      "go",
      "py",
      "rs",
      "java",
      "css",
      "scss",
      "html",
      "yaml",
      "yml",
      "toml",
      "sh",
    ].includes(extension)
  )
    return UiFileCode;
  return UiFile;
}
