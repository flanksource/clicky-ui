import { useEffect, useState } from "react";
import { Button, InputField, Modal } from "@flanksource/clicky-ui";
import {
  addRepository,
  directoryEntries,
  documentJson,
  GAVEL_ROUTE,
  saveFolder,
} from "./api";
import { refreshRepositories } from "./catalog";
import type { DirectoryEntry, DocumentRepository } from "./types";

export function RepositoryPicker({ onClose }: { onClose: () => void }) {
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [selectable, setSelectable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectable(false);
    setError(null);
    void Promise.allSettled([
      documentJson<DirectoryEntry[]>(
        `${GAVEL_ROUTE}/api/workspace/directories?${new URLSearchParams({ path })}`,
      ),
      path
        ? documentJson(
            `${GAVEL_ROUTE}/api/workspace/repository?${new URLSearchParams({ path })}`,
          )
        : Promise.reject(new Error("Choose a directory")),
    ]).then(([children, repository]) => {
      if (cancelled) return;
      if (children.status === "fulfilled") setEntries(children.value);
      else {
        setEntries([]);
        setError(String(children.reason));
      }
      setSelectable(repository.status === "fulfilled");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);
  return (
    <Modal
      open
      onClose={onClose}
      title="Add repository"
      footer={
        <Button
          disabled={!selectable || loading}
          onClick={() => {
            setLoading(true);
            void addRepository(path)
              .then(async () => {
                await refreshRepositories();
                onClose();
              })
              .catch((cause: unknown) => {
                setError(String(cause));
                setLoading(false);
              });
          }}
        >
          Add repository
        </Button>
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">
        Choose a Git working-tree root inside an enabled directory.
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setPath("")}>
          Enabled directories
        </Button>
        {path && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPath(path.slice(0, path.lastIndexOf("/")) || "/")}
          >
            Up
          </Button>
        )}
        <code className="break-all text-xs">{path}</code>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading directories…</p>
      ) : (
        <div className="flex max-h-96 flex-col items-stretch overflow-auto">
          {entries.map((entry) => (
            <Button
              key={entry.path}
              variant="ghost"
              className="justify-start"
              onClick={() => setPath(entry.path)}
            >
              {entry.name}/
            </Button>
          ))}
        </div>
      )}
      {path && !loading && !selectable && (
        <p className="mt-3 text-xs text-muted-foreground">
          This directory is not a Git working-tree root. Browse into a
          repository to select it.
        </p>
      )}
    </Modal>
  );
}

export function RepositoryFolderSettings({
  repository,
  path,
  onClose,
}: {
  repository: DocumentRepository;
  path: string;
  onClose: () => void;
}) {
  const [rules, setRules] = useState(
    repository.folders
      .find((folder) => folder.path === path)
      ?.overrides.join("\n") ?? "",
  );
  const [preview, setPreview] = useState<{
    rules: string;
    entries: DirectoryEntry[];
  }>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const overrides = rules.split("\n").filter((rule) => rule !== "");
  return (
    <Modal
      open
      onClose={onClose}
      title={`Sidebar folder · ${repository.name}/${path}`}
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            loading={busy}
            onClick={() => {
              setBusy(true);
              setError(null);
              void directoryEntries({
                root: repository.root,
                path,
                overrides,
                includeIgnored: true,
                overrideDirectory: path,
              })
                .then((entries) => setPreview({ rules, entries }))
                .catch((cause: unknown) => setError(String(cause)))
                .finally(() => setBusy(false));
            }}
          >
            Preview matching files
          </Button>
          <Button
            disabled={busy || preview?.rules !== rules}
            onClick={() => {
              setBusy(true);
              void saveFolder(repository.id, { path, overrides })
                .then(async () => {
                  await refreshRepositories();
                  window.dispatchEvent(
                    new Event("playground:documents-refresh"),
                  );
                  onClose();
                })
                .catch((cause: unknown) => setError(String(cause)))
                .finally(() => setBusy(false));
            }}
          >
            Save sidebar folder
          </Button>
        </div>
      }
    >
      <label
        htmlFor="repository-ignore-rules"
        className="mb-2 block text-sm font-medium"
      >
        Ignore overrides
      </label>
      <InputField
        id="repository-ignore-rules"
        as="textarea"
        rows={5}
        value={rules}
        onChange={setRules}
      />
      <p className="my-2 text-xs text-muted-foreground">
        Ordered Git-style patterns, one per line. Use ! to include a match.
        Preview before saving.
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {preview && (
        <ul className="max-h-72 space-y-1 overflow-auto text-xs">
          {preview.entries.map((entry) => (
            <li key={entry.path}>
              <span className={entry.visible ? "" : "text-muted-foreground"}>
                {entry.visible ? "Visible" : "Hidden"} · {entry.path}
              </span>
              {entry.rule && <code className="ml-2">{entry.rule}</code>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
