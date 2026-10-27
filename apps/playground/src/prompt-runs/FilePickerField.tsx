import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Combobox, Icon } from "@flanksource/clicky-ui";
import { UiRefresh } from "@flanksource/clicky-ui/icons";

import { FileBrowseDialog } from "./FileBrowseDialog";
import { pickerOptions } from "./file-picker-model";
import type { WorkspaceFile } from "./prompt-runs-api";

const TYPEAHEAD_LIMIT = 50;
const NO_FILES: WorkspaceFile[] = [];

type Files = { status: "loading" } | { status: "ready"; files: WorkspaceFile[] } | { status: "failed"; error: unknown };

/** The checkout's file list, loaded once per field with a retry for a failed load. */
function useWorkspaceFiles(load: () => Promise<WorkspaceFile[]>) {
  const [files, setFiles] = useState<Files>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setFiles({ status: "loading" });
    load().then(
      (next) => !cancelled && setFiles({ status: "ready", files: next }),
      (error: unknown) => !cancelled && setFiles({ status: "failed", error }),
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);
  return { files, retry: useCallback(() => setAttempt((count) => count + 1), []) };
}

/**
 * A file argument in the oipa-cli picker shape: a typeahead offering the
 * element's own file, the git changes and ranked matches, plus Browse… for the
 * full search / git changes / folder dialog.
 */
export function FilePickerField({
  id,
  value,
  onChange,
  multiple,
  suggested,
  loadFiles,
  disabled = false,
}: {
  id?: string;
  value: string[];
  onChange: (paths: string[]) => void;
  multiple: boolean;
  /** Files tied to the element under review, offered first. */
  suggested: string[];
  /** Must be stable: a new function reloads the list. */
  loadFiles: () => Promise<WorkspaceFile[]>;
  disabled?: boolean;
}) {
  const { files, retry } = useWorkspaceFiles(loadFiles);
  const [query, setQuery] = useState("");
  const [browsing, setBrowsing] = useState(false);
  const listed = files.status === "ready" ? files.files : NO_FILES;
  const options = useMemo(
    () => pickerOptions({ files: listed, query, suggested, selected: value, limit: TYPEAHEAD_LIMIT }),
    [listed, query, suggested, value],
  );
  const shared = {
    ...(id ? { id } : {}),
    ariaLabel: multiple ? "Files" : "File",
    options,
    onSearch: setQuery,
    loading: files.status === "loading",
    disabled,
    allowCustomValue: true,
    menuWidth: 640,
    placeholder: multiple ? "Type to search files, or Browse…" : "Type to search, or Browse…",
  };

  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {multiple ? (
            <Combobox {...shared} multiple value={value} onChange={onChange} />
          ) : (
            <Combobox {...shared} value={value[0] ?? ""} onChange={(next) => onChange(next ? [next] : [])} />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || files.status !== "ready"}
          onClick={() => setBrowsing(true)}
        >
          Browse…
        </Button>
      </div>
      {files.status === "failed" && (
        <p role="alert" className="flex items-center gap-2 text-xs text-destructive">
          Couldn&apos;t list the workspace files: {files.error instanceof Error ? files.error.message : String(files.error)}
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            <Icon icon={UiRefresh} />
            Retry
          </Button>
        </p>
      )}
      {browsing && files.status === "ready" && (
        <FileBrowseDialog
          files={files.files}
          value={value}
          multiple={multiple}
          onClose={() => setBrowsing(false)}
          onSelect={(paths) => {
            setBrowsing(false);
            onChange(paths);
          }}
        />
      )}
    </div>
  );
}
