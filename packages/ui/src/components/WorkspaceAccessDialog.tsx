import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { InputField } from "./InputField";
import { Modal } from "../overlay/Modal";
import type { WorkspaceAccessClient, WorkspaceAccessRoot } from "./workspace-access-client";

export type WorkspaceAccessDialogProps = {
  client: WorkspaceAccessClient;
  initialPath?: string;
  highlightedPath?: string;
  onClose: () => void;
  onOpenFolder?: (path: string) => Promise<void>;
  onChanged?: () => void;
  onGranted?: (root: WorkspaceAccessRoot) => void;
};

function FolderList({ title, roots, empty, renderRow }: {
  title: string;
  roots: WorkspaceAccessRoot[];
  empty: string;
  renderRow: (root: WorkspaceAccessRoot) => ReactNode;
}) {
  const heading = useId();
  return (
    <section aria-labelledby={heading} className="space-y-density-2">
      <h3 id={heading} className="text-sm font-semibold">{title}</h3>
      {roots.length ? <ul className="space-y-density-2">{roots.map(renderRow)}</ul> : <p className="text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}

export function WorkspaceAccessDialog({ client, initialPath = "", highlightedPath, onClose, onOpenFolder, onChanged, onGranted }: WorkspaceAccessDialogProps) {
  const pathId = useId();
  const [path, setPath] = useState(initialPath);
  const [listing, setListing] = useState<Awaited<ReturnType<WorkspaceAccessClient["list"]>>>();
  const [review, setReview] = useState<{ requested: string; canonical: string }>();
  const [revoking, setRevoking] = useState<string>();
  const [loadError, setLoadError] = useState("");
  const [folderError, setFolderError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const refreshRevision = useRef(0);
  const keepAccess = useRef<HTMLButtonElement>(null);
  const changed = useRef(onChanged);
  useLayoutEffect(() => { changed.current = onChanged; }, [onChanged]);

  const refresh = useCallback(async () => {
    const revision = ++refreshRevision.current;
    try {
      const result = await client.list();
      if (revision === refreshRevision.current) {
        setListing(result);
        setLoadError("");
      }
    } catch (cause) {
      if (revision === refreshRevision.current) setLoadError(String(cause));
    }
  }, [client]);

  useEffect(() => {
    void refresh();
    const unsubscribe = client.subscribe(() => {
      setNotificationError("");
      void refresh();
      changed.current?.();
    }, (cause) => setNotificationError(cause.message));
    return () => { refreshRevision.current++; unsubscribe(); };
  }, [client, refresh]);

  useEffect(() => { if (revoking) keepAccess.current?.focus(); }, [revoking]);

  async function perform(action: () => Promise<void>, reportError: (message: string) => void) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    reportError("");
    try {
      await action();
    } catch (cause) {
      reportError(String(cause));
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }

  async function refreshAfterChange() {
    await refresh();
    changed.current?.();
  }

  const canManage = Boolean(listing?.canManage && !loadError);
  const renderRow = (root: WorkspaceAccessRoot) => {
    const highlighted = highlightedPath === root.path && root.source === "saved";
    const revokeButtonId = `${pathId}-revoke-${root.id}`;
    return (
      <li key={root.id || root.path} className={`rounded-md border p-density-3 ${highlighted ? "border-primary/40 bg-accent text-accent-foreground" : "border-border"}`}>
        <div className="flex flex-wrap items-start gap-density-2">
          <div className="min-w-0 flex-1 basis-40">
            <code className="block break-all text-sm">{root.path}</code>
            {highlighted && <p className="mt-1 text-xs text-muted-foreground">Approved from this page</p>}
            {!root.available && <p className="mt-1 text-xs text-muted-foreground">Folder unavailable</p>}
          </div>
          <div className="flex flex-wrap gap-density-2">
            {onOpenFolder && (
              <Button size="sm" variant="outline" disabled={busy || !root.available} onClick={() => void perform(() => onOpenFolder(root.path), setActionError)}>
                Open folder
              </Button>
            )}
            {root.source === "saved" && revoking !== root.id && (
              <Button id={revokeButtonId} size="sm" variant="ghost" aria-label={`Revoke access to ${root.path}`} disabled={busy || !canManage} onClick={() => {
                setActionError("");
                setRevoking(root.id);
              }}>Revoke access</Button>
            )}
          </div>
        </div>
        {revoking === root.id && (
          <div className="mt-2 space-y-density-2 border-t border-border pt-density-2">
            <p className="text-sm">Revoke saved access to this folder across Gavel?</p>
            <div className="flex flex-wrap gap-density-2">
              <Button ref={keepAccess} size="sm" variant="outline" disabled={busy} onClick={() => {
                setRevoking(undefined);
                setActionError("");
                requestAnimationFrame(() => document.getElementById(revokeButtonId)?.focus());
              }}>Keep access</Button>
              <Button size="sm" variant="destructive" disabled={busy || !canManage} onClick={() => void perform(async () => {
                await client.revoke(root.id);
                setRevoking(undefined);
                await refreshAfterChange();
                requestAnimationFrame(() => document.getElementById(pathId)?.focus());
              }, setActionError)}>Revoke access</Button>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <Modal open onClose={onClose} title="Workspace access" size="lg" closeOnBackdrop footer={<Button variant="outline" onClick={onClose}>Close</Button>}>
      <div className="space-y-density-4">
        <p className="text-sm text-muted-foreground">Saved access applies to your user on this machine across Gavel sessions.</p>
        {!listing && !loadError && <p role="status" className="text-sm text-muted-foreground">Loading workspace folders…</p>}
        {loadError && <div className="flex flex-wrap items-center gap-density-2"><p role="alert" className="text-sm text-destructive">{loadError}</p><Button size="sm" variant="outline" onClick={() => void refresh()}>Retry loading folders</Button></div>}
        {listing && !listing.canManage && <p role="status" className="text-sm text-muted-foreground">Open Gavel in a local browser to change access.</p>}
        {listing && (
          <>
            <FolderList title="This session" roots={listing.roots.filter((root) => root.source === "command-line")} empty="No folders opened from the command line." renderRow={renderRow} />
            <FolderList title="Saved access" roots={listing.roots.filter((root) => root.source === "saved")} empty="No saved folder access." renderRow={renderRow} />
          </>
        )}
        {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
        <form className="space-y-density-2 border-t border-border pt-density-3" onSubmit={(event) => {
          event.preventDefault();
          const requested = path.trim();
          if (!canManage || !requested) return;
          void perform(async () => {
            setReview(undefined);
            setReview({ requested, canonical: (await client.preview(requested)).path });
          }, setFolderError);
        }}>
          <h3 className="text-sm font-semibold">Add a folder</h3>
          <label htmlFor={pathId} className="block text-sm font-medium">Folder path</label>
          <div className="flex flex-wrap items-start gap-density-2">
            <InputField id={pathId} aria-describedby={`${pathId}-help`} value={path} disabled={busy || !canManage} className="min-w-0 flex-1 basis-48" onChange={(value) => {
              setPath(value);
              setReview(undefined);
              setFolderError("");
            }} />
            <Button type="submit" disabled={busy || !canManage || !path.trim()} variant="outline">Review access</Button>
          </div>
          <p id={`${pathId}-help`} className="text-xs text-muted-foreground">Enter an absolute path to a local folder.</p>
          {review && (
            <div className="space-y-density-2 rounded-md border border-border bg-muted/30 p-density-3">
              <p className="text-sm font-medium">Allow access to this folder and its subfolders?</p>
              <code className="block break-all text-sm">{review.canonical}</code>
              <p className="text-xs text-muted-foreground">This allows reading, editing, and running local tools until access is revoked.</p>
              <Button type="button" disabled={busy || !canManage} onClick={() => void perform(async () => {
                const granted = await client.grant(review.requested, review.canonical);
                setReview(undefined);
                setPath("");
                await refreshAfterChange();
                onGranted?.(granted);
              }, setFolderError)}>Grant access</Button>
            </div>
          )}
          {folderError && <p role="alert" className="text-sm text-destructive">{folderError}</p>}
        </form>
        {notificationError && <p role="status" className="text-xs text-muted-foreground">{notificationError}</p>}
      </div>
    </Modal>
  );
}
