import { debugStore } from "./debugStore";
import {
  DEBUG_ID_HEADER,
  DEBUG_LEVEL_HEADER,
  DEBUG_LEVEL_PARAM,
  DEBUG_REFRESH_HEADER,
  type DebugCapabilities,
  type DebugLevel,
  type DebugRecordsPage,
  type ExecutionDetail,
  type FlushResult,
  type HARFile,
  type InspectionCaches,
} from "./types";

/**
 * Talking to the devtools endpoints, and arming the app's own requests.
 *
 * Arming rides on a request header rather than a server-side mode so that one
 * browser tab cannot change what another tab's requests cost, and so nothing
 * has to be switched off again when that tab is closed.
 */

export type DebugClientOptions = {
  /** API root, e.g. "/api/v1". */
  prefix?: string | undefined;
  /** Injected so a test can drive the client without a network. */
  fetch?: typeof fetch | undefined;
};

export type ManualInspectionRequest = {
  provider: string;
  connection?: string | undefined;
  query: string;
  options?: Record<string, unknown> | undefined;
  columns?: string[] | undefined;
  refresh: boolean;
};

const DEFAULT_PREFIX = "/api/v1";

export class DebugClient {
  private readonly prefix: string;
  private readonly request: typeof fetch;

  constructor(options: DebugClientOptions = {}) {
    this.prefix = (options.prefix ?? DEFAULT_PREFIX).replace(/\/$/, "");
    this.request = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  get root(): string {
    return `${this.prefix}/devtools`;
  }

  /** The stream URL, resumed from the last sequence the caller already holds. */
  streamUrl(after: number): string {
    return after > 0 ? `${this.root}/stream?after=${after}` : `${this.root}/stream`;
  }

  async capabilities(): Promise<DebugCapabilities> {
    return this.json<DebugCapabilities>(this.root);
  }

  async records(after = 0): Promise<DebugRecordsPage> {
    return this.json<DebugRecordsPage>(after > 0 ? `${this.root}/records?after=${after}` : `${this.root}/records`);
  }

  /**
   * Fetches one record's detail.
   *
   * A 410 is not an error the caller should treat as a failure — it is the
   * server saying the bodies aged out while the summary survived, which is a
   * different thing from "no such record" and has to stay distinguishable.
   */
  async detail(id: string): Promise<ExecutionDetail> {
    const response = await this.request(`${this.root}/records/${encodeURIComponent(id)}`);
    if (response.status === 410) {
      const body = (await response.json().catch(() => null)) as { reason?: string } | null;
      throw new DetailEvictedError(id, body?.reason ?? "the server no longer holds it");
    }
    if (!response.ok) {
      throw new Error(`devtools record ${id}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as ExecutionDetail;
  }

  async har(id: string): Promise<HARFile> {
    return this.json<HARFile>(`${this.root}/records/${encodeURIComponent(id)}/har`);
  }

  async clear(): Promise<void> {
    const response = await this.request(`${this.root}/records`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`clear devtools records: ${response.status} ${response.statusText}`);
    }
  }

  /** What the server's metadata caches are holding right now. */
  async inspection(): Promise<InspectionCaches> {
    return this.json<InspectionCaches>(`${this.root}/inspection`);
  }

  /**
   * Runs one captured provider request through the existing read-only sample
   * boundary, where column inspection and cardinality probing already live.
   */
  async runInspection(options: ManualInspectionRequest): Promise<ExecutionDetail> {
    const level = debugStore.getSnapshot().level;
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.set(DEBUG_LEVEL_HEADER, level === "off" ? "debug" : level);
    if (options.refresh) headers.set(DEBUG_REFRESH_HEADER, "true");

    const provider: Record<string, unknown> = { type: options.provider };
    if (options.connection) provider.connection = options.connection;
    if (options.options && Object.keys(options.options).length > 0) {
      provider.options = options.options;
    }
    const profile: Record<string, unknown> = {
      profile: "manual-inspection",
      provider,
      query: options.query,
    };
    if (options.columns && options.columns.length > 0) {
      profile.columns = options.columns.map((name) => ({ name, type: "string" }));
    }

    const response = await this.request(`${this.prefix}/profile/sample`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        profile,
        pagination: { limit: 1 },
        refreshInspection: options.refresh,
      }),
    });
    const body = await response.text();
    const recordID = response.headers.get(DEBUG_ID_HEADER);
    if (!recordID) {
      let message = "";
      try {
        message = String((JSON.parse(body) as { error?: string }).error ?? "");
      } catch {
        message = body.trim();
      }
      throw new Error(message || `manual inspection: ${response.status} ${response.statusText}`);
    }
    return this.detail(recordID);
  }

  /**
   * Drops cached metadata so the next lookup rebuilds it, and returns what
   * actually went.
   *
   * The count matters: an empty flush and a broken one look identical without
   * it, and this affects every request that follows, not just this browser's.
   */
  async flushInspection(options: { policy?: string; key?: string } = {}): Promise<FlushResult> {
    const params = new URLSearchParams();
    if (options.policy) params.set("policy", options.policy);
    if (options.key) params.set("key", options.key);
    const query = params.toString();
    const response = await this.request(`${this.root}/inspection${query ? `?${query}` : ""}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error((await response.text()).trim() || `${response.status} ${response.statusText}`);
    }
    return (await response.json()) as FlushResult;
  }

  private async json<T>(url: string): Promise<T> {
    const response = await this.request(url);
    if (!response.ok) {
      throw new Error(`${url}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }
}

/** The server held the record but let its expensive half go. */
export class DetailEvictedError extends Error {
  constructor(
    readonly id: string,
    readonly reason: string,
  ) {
    super(`the detail for ${id} is no longer held: ${reason}`);
    this.name = "DetailEvictedError";
  }
}

export type DebugFetchOptions = {
  /** Reads the level to arm at. Defaults to the shared store's current level. */
  level?: (() => DebugLevel) | undefined;
  /**
   * Reads whether to also rebuild every metadata lookup. Defaults to the shared
   * store's current setting.
   */
  refreshInspection?: (() => boolean) | undefined;
  /** Called with the record id the server stamped on each armed response. */
  onRecordId?: (id: string, request: { method: string; url: string }) => void;
};

/**
 * Wraps a `fetch` so every call through it arms the server at the console's
 * current level.
 *
 * It wraps the client's fetch rather than patching `window.fetch`: a patch
 * would capture Vite HMR, chat SSE and every other unrelated request, and
 * shipping that behaviour in a published library is hostile. The cost is that
 * bare `fetch()` call sites are not timed client-side — their server-side work
 * still arrives on the stream, which is what the tabs actually render.
 */
export function withDebugFetch(
  inner: typeof fetch = globalThis.fetch.bind(globalThis),
  options: DebugFetchOptions = {},
): typeof fetch {
  const readLevel = options.level ?? (() => debugStore.getSnapshot().level);
  const readRefresh =
    options.refreshInspection ?? (() => debugStore.getSnapshot().refreshInspection);
  return async (input, init) => {
    const level = readLevel();
    if (level === "off") return inner(input, init);

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set(DEBUG_LEVEL_HEADER, level);
    // Only sent when it is on. An always-present header carrying "false" would
    // make every request look like it had opted out of something.
    if (readRefresh()) headers.set(DEBUG_REFRESH_HEADER, "true");
    const response = await inner(input, { ...init, headers });

    const id = response.headers.get(DEBUG_ID_HEADER);
    if (id && options.onRecordId) {
      options.onRecordId(id, {
        method: init?.method ?? (input instanceof Request ? input.method : "GET"),
        url: typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
      });
    }
    return response;
  };
}

/**
 * Marks a URL a browser will follow on its own — a download link, which builds
 * its own request and cannot carry a header.
 */
export function armUrl(url: string, level: DebugLevel): string {
  if (level === "off") return url;
  const hashAt = url.indexOf("#");
  const base = hashAt === -1 ? url : url.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${DEBUG_LEVEL_PARAM}=${encodeURIComponent(level)}${hash}`;
}
