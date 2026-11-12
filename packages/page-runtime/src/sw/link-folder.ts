import type { StoredLink } from "../link/types.ts";

export function createFolderSourceReader() {
  const channels = new Map<string, BroadcastChannel>();
  const pending = new Map<string, { resolve(data: Uint8Array): void; reject(error: Error): void }>();
  return async (options: { link: StoredLink; path: string }): Promise<Uint8Array> => {
    const { link, path } = options;
    if (link.source.kind !== "folder" || !link.source.session) throw new Error(`${link.id}: folder link has no host source channel; reconnect the host`);
    let channel = channels.get(link.source.session);
    if (!channel) {
      channel = new BroadcastChannel(`page-runtime-link-${link.source.session}`);
      channel.onmessage = (event: MessageEvent<{ type: string; request: string; data?: ArrayBuffer; error?: string }>) => {
        if (event.data.type !== "reply") return;
        const request = pending.get(event.data.request); if (!request) return;
        if (event.data.error) request.reject(new Error(event.data.error));
        else if (event.data.data instanceof ArrayBuffer) request.resolve(new Uint8Array(event.data.data));
        else request.reject(new Error("Folder source reply is missing its bytes"));
      };
      channels.set(link.source.session, channel);
    }
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const finish = () => { clearTimeout(timer); pending.delete(id); };
      const timer = setTimeout(() => { finish(); reject(new Error(`${link.id}: host folder read timed out for ${path}; reconnect the host`)); }, 15000);
      pending.set(id, { resolve(data) { finish(); resolve(data); }, reject(error) { finish(); reject(error); } });
      channel.postMessage({ type: "read", id: link.id, path, request: id });
    });
  };
}
