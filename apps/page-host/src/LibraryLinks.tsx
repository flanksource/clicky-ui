import { useEffect, useRef, useState } from "react";
import { Button, InputField } from "@flanksource/clicky-ui";
import { connectLinkRuntime, createLinkHost, type StoredLink } from "@flanksource/page-runtime/host/link";
import type { PageLock } from "@flanksource/page-runtime/schema";
import { developerOverrides } from "./links";

type LinkHost = ReturnType<typeof createLinkHost>;
type Watcher = ReturnType<LinkHost["watch"]>;
const enabled = developerOverrides(import.meta.env.VITE_PAGE_HOST_PROFILE);

export function LibraryLinks(options: { runtimeOrigin: string; activated: boolean; lock: PageLock | undefined; reload: (options: { type: "open" | "reload"; lock?: PageLock }) => Promise<void>; onError: (error: Error) => void }) {
  const [host, setHost] = useState<LinkHost | null>(null);
  const [links, setLinks] = useState<StoredLink[]>([]);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const latest = useRef(options); latest.current = options;
  const watchers = useRef<Watcher[]>([]);

  useEffect(() => {
    if (!enabled || !options.activated) return;
    let disposed = false;
    let connection: Awaited<ReturnType<typeof connectLinkRuntime>> | undefined;
    let client: LinkHost | undefined;
    void (async () => {
      const response = await fetch(`${options.runtimeOrigin}/profile.json`, { credentials: "omit" });
      if (!response.ok) throw new Error(`Runtime profile: HTTP ${response.status}`);
      const profile = await response.json() as { links: "allow" | "deny" };
      connection = await connectLinkRuntime({ runtimeOrigin: options.runtimeOrigin, profile, developerOverrides: enabled });
      client = createLinkHost({ profile, developerOverrides: enabled, transport: connection.request });
      const restored = await client.restore();
      if (disposed) { await client.close(); connection.close(); return; }
      setHost(client); setLinks(restored);
    })().catch((error: unknown) => latest.current.onError(error instanceof Error ? error : new Error(String(error))));
    return () => {
      disposed = true;
      void Promise.all(watchers.current.map((watcher) => watcher.stop())).then(async () => { await client?.close(); connection?.close(); }).catch((error: unknown) => latest.current.onError(new Error(String(error))));
    };
  }, [options.runtimeOrigin, options.activated]);

  useEffect(() => {
    if (!host || !links.length || !options.lock) return;
    const ids = links.map((link) => link.id);
    const unregister = host.registerFrame({ id: "preview", links: ids, reload: () => latest.current.reload({ type: "reload" }) });
    const active = links.map((link) => host.watch(link.id)); watchers.current = active;
    let disposed = false;
    void (async () => {
      await latest.current.reload({ type: "open", lock: host.override({ lock: latest.current.lock!, ids }) });
      if (!disposed) for (const watcher of active) await watcher.start({ onError: latest.current.onError });
    })().catch((error: unknown) => latest.current.onError(new Error(String(error))));
    return () => { disposed = true; unregister(); void Promise.all(active.map((watcher) => watcher.stop())).catch((error: unknown) => latest.current.onError(new Error(String(error)))); };
  }, [host, links, options.lock]);

  async function install(kind: "server" | "folder") {
    setBusy(true);
    try {
      if (!enabled) throw new Error("Links require the page-host developer profile; developer overrides are disabled");
      if (!host) throw new Error("The developer link connection is not ready");
      const id = "checkout";
      if (host.list().length) throw new Error("Unlink the current checkout before linking another");
      if (kind === "folder") await host.pickFolder({ id }); else await host.server({ id, url });
      setLinks(host.list());
    } catch (error) { options.onError(error instanceof Error ? error : new Error(String(error))); }
    finally { setBusy(false); }
  }

  return <details className="shrink-0 border-b border-border p-2 text-sm">
    <summary>Library links · {enabled ? "Developer profile" : "Default profile"}{links.length ? " · checkout linked" : ""}</summary>
    <p className="my-2 text-xs text-muted-foreground">{enabled ? "Link a checkout prepared with buildLinkRuntime. Overrides stay in this session; published locks are preserved." : "Links are denied. Start both host and runtime with the developer profile to enable overrides."}</p>
    <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); void install("server"); }}>
      <label className="min-w-0 flex-1" htmlFor="library-url">Checkout file-server URL<InputField id="library-url" type="url" required value={url} onChange={setUrl} /></label>
      <Button type="submit" size="sm" variant="outline" disabled={busy || (enabled && !host)}>Link server</Button>
      <Button size="sm" variant="outline" disabled={busy || (enabled && !host)} onClick={() => { void install("folder"); }}>Link checkout folder</Button>
    </form>
    {links.map((link) => <div key={link.id} className="mt-2 flex items-center gap-2"><span role="status">Linked {link.build.library}@{link.build.version}</span>
      <Button size="sm" variant="ghost" onClick={() => {
        void (async () => { for (const watcher of watchers.current) await watcher.stop(); await host!.remove(link.id); setLinks(host!.list()); await options.reload({ type: "open" }); })().catch((error: unknown) => options.onError(new Error(String(error))));
      }}>Unlink checkout</Button></div>)}
  </details>;
}
