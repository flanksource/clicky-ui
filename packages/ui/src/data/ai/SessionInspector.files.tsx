import { useState } from "react";
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

const ACCESS_FILTERS: { access: FileAccess; label: string }[] = [
  { access: "read", label: "Read" },
  { access: "written", label: "Written" },
];

export function SessionFilesPanel({
  files,
}: {
  files: SessionChangedFiles | undefined;
}) {
  const [visible, setVisible] = useState<ReadonlySet<FileAccess>>(
    () => new Set(["written"]),
  );
  const touches = fileTouches(files);
  if (!touches.length) {
    return (
      <div className="rounded-md border border-dashed border-border p-density-6 text-center text-sm text-muted-foreground">
        No changed-file summary.
      </div>
    );
  }
  const roots = buildFileTree(touches, visible);
  const toggle = (access: FileAccess) =>
    setVisible((current) => {
      const next = new Set(current);
      if (!next.delete(access)) next.add(access);
      return next;
    });
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-density-2 border-b border-border bg-muted/30 px-density-3 py-density-2 text-xs text-muted-foreground">
        <span>
          {roots.reduce((count, node) => count + countFiles(node), 0)} files
        </span>
        <span
          role="group"
          aria-label="File access filter"
          className="flex gap-density-1"
        >
          {ACCESS_FILTERS.map(({ access, label }) => (
            <button
              key={access}
              type="button"
              aria-pressed={visible.has(access)}
              onClick={() => toggle(access)}
              className="rounded border border-border px-density-2 py-0.5 text-xs text-muted-foreground hover:bg-muted aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {label}{" "}
              <span className="tabular-nums opacity-70">
                {countPaths(touches, access)}
              </span>
            </button>
          ))}
        </span>
      </div>
      {!roots.length ? (
        <div className="p-density-4 text-center text-xs text-muted-foreground">
          No files match the selected access filters.
        </div>
      ) : (
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
      )}
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

function fileTouches(files: SessionChangedFiles | undefined): FileTouch[] {
  return [
    ...(files?.read ?? []).map((path): FileTouch => ({ path, access: "read" })),
    ...(files?.written ?? []).map(
      (path): FileTouch => ({ path, access: "written" }),
    ),
  ];
}

// A path is shown when any of its touches matches a visible access; all of its
// touches stay attached so the badge still reports read-and-written.
function buildFileTree(
  touches: FileTouch[],
  visible: ReadonlySet<FileAccess>,
): FileTreeNode[] {
  const shown = new Set(
    touches.filter((touch) => visible.has(touch.access)).map((touch) => touch.path),
  );
  const matching = touches.filter((touch) => shown.has(touch.path));
  return buildPathTree(matching, (touch) => splitPath(touch.path, "/"), {
    compare: foldersFirst,
  });
}

function countPaths(touches: FileTouch[], access: FileAccess): number {
  return new Set(
    touches.filter((touch) => touch.access === access).map((touch) => touch.path),
  ).size;
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
