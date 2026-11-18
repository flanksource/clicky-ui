import { LINK_CONTEXT_HEADER } from "./link-route.ts";

type Client = { id: string; url: string };
type Clients<C extends Client> = { get(id: string): Promise<C | undefined>; matchAll(options: { type: "all"; includeUncontrolled: boolean }): Promise<{ id: string }[]> };
type PageClient = { page: string; context: string | null };
export type PageFetchEvent = { request: Request; clientId: string; resultingClientId: string };

// Module URLs name no page, so each request's page and link context come from the client that made it:
// frames are recorded when their document is served, and workers inherit the client that created them.
// After a worker restart, a client falls back to the page in its URL and its link context is recomputed.
export function createPageClients<C extends Client>(options: { origin: string; clients: Clients<C> }) {
  const known = new Map<string, PageClient>();
  const fromUrl = (client: Client): PageClient | undefined => {
    const location = new URL(client.url);
    const page = location.searchParams.get("page") ?? (location.pathname.startsWith("/frame/") ? decodeURIComponent(location.pathname.slice(7)) : null);
    return page ? { page, context: null } : undefined;
  };
  async function remember(id: string, client: PageClient): Promise<void> {
    known.set(id, client);
    const live = new Set((await options.clients.matchAll({ type: "all", includeUncontrolled: true })).map((item) => item.id));
    for (const previous of known.keys()) if (previous !== id && !live.has(previous)) known.delete(previous);
  }
  return {
    /** The request with the page and link context of the client that made it. */
    async request(event: PageFetchEvent): Promise<{ request: Request; client: C | undefined; owner: PageClient | undefined }> {
      const url = new URL(event.request.url);
      const client = event.clientId ? await options.clients.get(event.clientId) : undefined;
      const owner = client ? known.get(client.id) ?? fromUrl(client) : undefined;
      if (["GET", "HEAD"].includes(event.request.method) && url.origin === options.origin && /^\/(src|npm|esm|link|__runtime)\//.test(url.pathname) && owner) {
        if (!url.searchParams.has("page")) url.searchParams.set("page", owner.page);
        if (owner.context && !url.searchParams.has("link-context")) url.searchParams.set("link-context", owner.context);
      }
      const request = url.href === event.request.url ? event.request : new Request(url, { method: event.request.method, headers: event.request.headers, credentials: event.request.credentials, mode: "same-origin" });
      return { request, client, owner };
    },
    /** Records the client a frame document or page-spawned worker creates. */
    async served(options_: { event: PageFetchEvent; owner: PageClient | undefined; response: Response }): Promise<void> {
      const { event, owner, response } = options_;
      if (!event.resultingClientId) return;
      const url = new URL(event.request.url);
      if (url.pathname.startsWith("/frame/")) await remember(event.resultingClientId, { page: decodeURIComponent(url.pathname.slice(7)), context: response.headers.get(LINK_CONTEXT_HEADER) });
      else if (owner && ["worker", "sharedworker"].includes(event.request.destination)) await remember(event.resultingClientId, owner);
    },
  };
}
