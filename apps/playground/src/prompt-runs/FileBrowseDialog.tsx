import { useMemo, useState, type ReactNode } from "react";
import { Button, Checkbox, Icon, Modal, SearchInput, Tabs } from "@flanksource/clicky-ui";
import { UiChevronRight, UiFile, UiFolder } from "@flanksource/clicky-ui/icons";

import { folderCrumbs, folderEntries, searchFiles, type FolderEntry } from "./file-picker-model";
import type { WorkspaceFile } from "./prompt-runs-api";

const SEARCH_LIMIT = 200;

type Tab = "changes" | "all";

// git status --porcelain codes as words; anything unlisted shows its raw code.
const STATUS_WORDS: Record<string, string> = { M: "modified", A: "added", D: "deleted", R: "renamed", "??": "new" };

function StatusBadge({ status }: { status: string }) {
  return (
    <span title={`git status ${status}`} className="shrink-0 rounded bg-muted px-1.5 py-px text-[11px] font-medium text-muted-foreground">
      {STATUS_WORDS[status] ?? status}
    </span>
  );
}

function FileRow({
  path,
  label,
  status,
  checked,
  onToggle,
}: {
  path: string;
  label: string;
  status: string | undefined;
  checked: boolean;
  onToggle: () => void;
}) {
  const folder = path.slice(0, path.length - label.length).replace(/\/$/, "");
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-accent" title={path}>
        <Checkbox checked={checked} onChange={onToggle} aria-label={path} />
        <Icon icon={UiFile} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium text-foreground">{label}</span>
          {folder && <span className="ml-2 text-xs text-muted-foreground">{folder}</span>}
        </span>
        {status && <StatusBadge status={status} />}
      </label>
    </li>
  );
}

/**
 * Browse… for a file field, in the Google Drive picker shape: a search over
 * every file, or tabs for the git changes and a folder-by-folder walk of the
 * checkout. Rows check on and off; Select commits the checked set.
 */
export function FileBrowseDialog({
  files,
  value,
  multiple,
  onSelect,
  onClose,
}: {
  files: WorkspaceFile[];
  value: string[];
  multiple: boolean;
  onSelect: (paths: string[]) => void;
  onClose: () => void;
}) {
  const changed = useMemo(() => files.filter((file) => file.status), [files]);
  const [tab, setTab] = useState<Tab>(changed.length > 0 ? "changes" : "all");
  const [folder, setFolder] = useState("");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<string[]>(value);

  const toggle = (path: string) =>
    setChecked((current) =>
      current.includes(path)
        ? current.filter((entry) => entry !== path)
        : multiple
          ? [...current, path]
          : [path],
    );
  const row = (file: { path: string; name?: string; status?: string }) => (
    <FileRow
      key={file.path}
      path={file.path}
      label={file.name ?? file.path.slice(file.path.lastIndexOf("/") + 1)}
      status={file.status}
      checked={checked.includes(file.path)}
      onToggle={() => toggle(file.path)}
    />
  );
  const results = query.trim() ? searchFiles(files, query, SEARCH_LIMIT) : null;

  return (
    <Modal
      open
      onClose={onClose}
      title={multiple ? "Choose files" : "Choose a file"}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {checked.length === 0 ? "Nothing selected" : `${checked.length} selected`}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSelect(checked)}>Select</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <SearchInput value={query} onChange={setQuery} placeholder="Search all files" shortcut={null} autoFocus />
        {results ? (
          <>
            <p className="text-xs text-muted-foreground">
              {results.total === 0
                ? `No file path contains "${query.trim()}".`
                : results.total > results.matches.length
                  ? `Showing the best ${results.matches.length} of ${results.total} matches; keep typing to narrow them.`
                  : `${results.total} ${results.total === 1 ? "match" : "matches"}`}
            </p>
            <ul className="m-0 max-h-[50vh] list-none overflow-auto p-0">{results.matches.map(row)}</ul>
          </>
        ) : (
          <>
            <Tabs
              value={tab}
              onChange={(next) => setTab(next as Tab)}
              tabs={[
                { id: "changes", label: "Git changes", count: changed.length },
                { id: "all", label: "All files" },
              ]}
            />
            {tab === "changes" ? (
              changed.length === 0 ? (
                <p className="text-muted-foreground">The checkout has no uncommitted changes.</p>
              ) : (
                <ul className="m-0 max-h-[50vh] list-none overflow-auto p-0">{changed.map(row)}</ul>
              )
            ) : (
              <FolderView files={files} folder={folder} onOpen={setFolder} row={row} />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

function FolderView({
  files,
  folder,
  onOpen,
  row,
}: {
  files: WorkspaceFile[];
  folder: string;
  onOpen: (folder: string) => void;
  row: (entry: Extract<FolderEntry, { kind: "file" }>) => ReactNode;
}) {
  const entries = useMemo(() => folderEntries(files, folder), [files, folder]);
  const crumbs = folderCrumbs(folder);
  return (
    <div className="space-y-2">
      <nav aria-label="Folder" className="flex flex-wrap items-center gap-1 text-xs">
        {crumbs.map((crumb, index) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {index > 0 && <Icon icon={UiChevronRight} className="text-muted-foreground" />}
            {index === crumbs.length - 1 ? (
              <span className="font-semibold text-foreground">{crumb.name}</span>
            ) : (
              <button type="button" className="text-primary hover:underline" onClick={() => onOpen(crumb.path)}>
                {crumb.name}
              </button>
            )}
          </span>
        ))}
      </nav>
      <ul className="m-0 max-h-[50vh] list-none overflow-auto p-0">
        {entries.map((entry) =>
          entry.kind === "folder" ? (
            <li key={entry.path}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent"
                onClick={() => onOpen(entry.path)}
              >
                <Icon icon={UiFolder} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{entry.name}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.count} {entry.count === 1 ? "file" : "files"}
                </span>
                <Icon icon={UiChevronRight} className="text-muted-foreground" />
              </button>
            </li>
          ) : (
            row(entry)
          ),
        )}
      </ul>
    </div>
  );
}
