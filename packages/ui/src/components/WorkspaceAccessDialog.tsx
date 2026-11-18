import { useEffect, useState } from "react";
import { Button } from "./button";
import { InputField } from "./InputField";
import { Modal } from "../overlay/Modal";
import type {
  WorkspaceAccessClient,
  WorkspaceAccessRoot,
} from "./workspace-access-client";

export type WorkspaceAccessDialogProps = {
  client: WorkspaceAccessClient;
  initialPath?: string;
  onClose: () => void;
  onOpenFolder?: (path: string) => Promise<void>;
  onChanged?: () => void;
};
export function WorkspaceAccessDialog({
  client,
  initialPath = "",
  onClose,
  onOpenFolder,
  onChanged,
}: WorkspaceAccessDialogProps) {
  const [path, setPath] = useState(initialPath);
  const [roots, setRoots] = useState<WorkspaceAccessRoot[]>([]);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    const result = await client.list();
    if (!result.canManage)
      throw new Error(
        "Workspace access can only be changed from a local browser."
      );
    setRoots(result.roots);
  };
  useEffect(() => {
    void refresh().catch((cause) => setError(String(cause)));
    return client.subscribe(
      () => {
        setNotificationError("");
        void refresh().catch((cause) => setError(String(cause)));
        onChanged?.();
      },
      (cause) => setNotificationError(cause.message)
    );
  }, [client]);
  const perform = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await refresh();
      onChanged?.();
    } catch (cause) {
      setError(String(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title="Workspace access"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Saved grants apply to your user on this machine across local Gavel
        servers. They permit reading and writing files and running local tools
        in the folder and its subfolders.
      </p>
      <div className="space-y-3">
        {roots.map((root) => (
          <div
            key={root.id || root.path}
            className="flex flex-wrap items-center gap-2 rounded border border-border p-2"
          >
            <div className="min-w-0 flex-1">
              <code className="break-all text-xs">{root.path}</code>
              <p className="text-xs text-muted-foreground">
                {root.source === "command-line"
                  ? "From command line · fixed for this session"
                  : "Saved grant"}
                {!root.available ? " · folder unavailable" : ""}
              </p>
            </div>
            {onOpenFolder && (
              <Button
                size="sm"
                disabled={busy || !root.available}
                onClick={() => void perform(() => onOpenFolder(root.path))}
              >
                Open folder
              </Button>
            )}
            {root.source === "saved" && (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() =>
                  void perform(async () => {
                    await client.revoke(root.id);
                  })
                }
              >
                Revoke access
              </Button>
            )}
          </div>
        ))}
        <label
          htmlFor="workspace-folder-path"
          className="block text-sm font-medium"
        >
          Folder path
        </label>
        <InputField
          id="workspace-folder-path"
          value={path}
          onChange={(value) => {
            setPath(value);
            setPreview(undefined);
          }}
        />
        <Button
          disabled={busy || !path}
          variant="outline"
          onClick={() =>
            void perform(async () =>
              setPreview((await client.preview(path)).path)
            )
          }
        >
          Review access
        </Button>
        {preview && (
          <div className="space-y-2 rounded border border-border p-3">
            <p className="break-all text-sm">
              Allow access to <strong>{preview}</strong> and its subfolders?
            </p>
            <p className="text-xs text-muted-foreground">
              This grants file read/write and local tool access until you revoke
              it. It will be remembered after restarting Gavel.
            </p>
            <Button
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await client.grant(path, preview);
                  await refresh();
                  setPreview(undefined);
                  if (onOpenFolder) {
                    try {
                await onOpenFolder(path);
                    } catch (cause) {
                      throw new Error(
                        `Access was granted, but opening failed: ${String(
                          cause
                        )}. Use Open folder to retry.`
                      );
                    }
                  }
                })
              }
            >
              {onOpenFolder ? "Grant and open" : "Grant access"}
            </Button>
          </div>
        )}
        {(error || notificationError) && (
          <p role="alert" className="text-sm text-destructive">
            {error || notificationError}
          </p>
        )}
      </div>
    </Modal>
  );
}
