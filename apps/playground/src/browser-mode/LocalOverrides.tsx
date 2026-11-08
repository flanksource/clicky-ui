import { useEffect, useState, useSyncExternalStore } from "react";
import { ActionError, Badge, Button, Modal, Properties } from "@flanksource/clicky-ui";
import type { StoredLink } from "@flanksource/page-runtime/host/link";
import { localOverrides, pickLocalOverride } from "./local-overrides";

export function LocalOverrides({ usedPackages }: { usedPackages: string[] }) {
  const state = useSyncExternalStore(localOverrides.subscribe, localOverrides.getSnapshot);
  const [candidate, setCandidate] = useState<StoredLink | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => { void localOverrides.restore(); }, []);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await action(); } catch (cause) { setError(new Error(String(cause))); }
    finally { setBusy(false); }
  };
  const existing = candidate ? state.links.find(link => link.build.library === candidate.build.library) : null;
  return <section className="space-y-3" aria-label="Local package overrides">
    <p className="text-sm text-muted-foreground">Local packages replace published packages across pages in this browser. Folder permissions and overrides are saved in IndexedDB.</p>
    <Button size="sm" variant="outline" disabled={busy || !("showDirectoryPicker" in window)} onClick={() => {
      setError(null); setBusy(true);
      void pickLocalOverride().then(setCandidate).catch(cause => setError(new Error(String(cause)))).finally(() => setBusy(false));
    }}>Select package folder…</Button>
    {!("showDirectoryPicker" in window) && <p role="status" className="text-sm">Folder selection requires File System Access support, such as desktop Chrome.</p>}
    {(error || state.error) && <ActionError title="Local override unavailable" error={error ?? state.error!} />}
    {!state.loaded && <p role="status">Restoring saved folder overrides…</p>}
    {state.loaded && !state.links.length && <p className="text-sm text-muted-foreground">No local package overrides.</p>}
    {state.links.map(link => <div key={link.id} className="space-y-2 rounded border border-border p-3">
      <div className="flex flex-wrap items-center gap-2"><code className="break-all text-sm">{link.build.library}@{link.build.version}</code><Badge>{usedPackages.includes(link.build.library) ? "Used by this page" : "Not used by this page"}</Badge></div>
      <Properties density="compact" items={[{ key: "Folder", value: link.directory?.name }, { key: "Read permission", value: state.permissions[link.id] }]} />
      {state.errors[link.id] && <ActionError title="Folder unavailable" error={state.errors[link.id]!} />}
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => { void run(() => localOverrides.reconnect(link)); }}>Reconnect</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => { void run(() => localOverrides.reconnect(link)); }}>Refresh metadata</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => { void run(() => localOverrides.remove(link.id)); }}>Remove override</Button></div>
    </div>)}
    {candidate && <Modal open title={existing ? "Replace local package override?" : "Use local package override?"} onClose={() => setCandidate(null)}>
      <div className="space-y-4"><Properties items={[{ key: "Package", value: candidate.build.library }, { key: "Version", value: candidate.build.version }, { key: "Folder", value: candidate.directory?.name }, { key: "Replaces", value: existing ? `${existing.directory?.name} (${existing.build.version})` : "Published package" }]} />
        <p className="text-sm">Uses this checkout for matching imports across pages in this browser. Page dependency headers retain their published version declarations.</p>
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setCandidate(null)}>Cancel</Button><Button disabled={busy} onClick={() => { void run(async () => { await localOverrides.apply(candidate); setCandidate(null); }); }}>Apply override</Button></div>
      </div>
    </Modal>}
  </section>;
}
