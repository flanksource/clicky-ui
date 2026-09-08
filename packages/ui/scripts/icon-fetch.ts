/**
 * Network layer for the icon codegen (see build-icons.ts).
 *
 * Two concerns live here:
 *
 * 1. `createHttpClient` — a fetch that survives rate limiting. It honours
 *    `Retry-After` and `RateLimit-*` response headers when the server sends
 *    them, and otherwise backs off exponentially with full jitter. Only
 *    transient statuses are retried: a 404 still fails on the first attempt so
 *    the incumbent-SVG candidate probe stays fast.
 *
 * 2. `fetchIconifySvgs` — resolves Iconify picks through the batched icon-data
 *    API (https://iconify.design/docs/api/icon-data.html), i.e. one
 *    `/{prefix}.json?icons=a,b,c` query per icon set instead of one
 *    `/{prefix}/{name}.svg` request per icon. A cold build asks for ~450
 *    Iconify icons; batching turns that into a couple of dozen requests, which
 *    is what keeps CI under the API's rate limit in the first place.
 */
import type { IconifyJSON } from "@iconify/types";
import { getIconData, iconToHTML, iconToSVG } from "@iconify/utils";

export const ICONIFY_API_BASE = "https://api.iconify.design";

/**
 * The docs cap component-issued queries at 500 characters because browsers
 * limit URL length; we split on the same boundary so our URLs stay identical
 * to the ones any other client would send (and therefore stay CDN-cacheable).
 */
const MAX_QUERY_URL_LENGTH = 500;

/** Statuses worth another attempt — everything else is a real, immediate error. */
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export type RetryReason = "retry-after" | "rate-limit-reset" | "backoff" | "network";

export type RetryInfo = {
  url: string;
  /** 1-based count of retries already scheduled for this URL. */
  attempt: number;
  status: number | null;
  delayMs: number;
  reason: RetryReason;
};

export type HttpClientOptions = {
  maxAttempts: number;
  baseDelayMs: number;
  /** Ceiling for the self-computed backoff window. */
  maxDelayMs: number;
  /** Ceiling for a server-directed wait; beyond this we fail instead of stalling the build. */
  maxRetryAfterMs: number;
  fetchImpl: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
  now: () => number;
  onRetry?: (info: RetryInfo) => void;
};

export type HttpClient = { fetch: (url: string) => Promise<Response> };

export type RateLimit = {
  limit: number | null;
  remaining: number | null;
  /** Milliseconds from now until the quota window resets. */
  resetMs: number | null;
};

const DEFAULTS: Omit<HttpClientOptions, "onRetry"> = {
  maxAttempts: 6,
  baseDelayMs: 500,
  maxDelayMs: 30_000,
  maxRetryAfterMs: 120_000,
  fetchImpl: (...args) => fetch(...args),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  random: Math.random,
  now: Date.now,
};

/**
 * `Retry-After` is either delta-seconds or an HTTP-date (RFC 9110 §10.2.3).
 * Returns milliseconds to wait, or null when the header is absent/unusable.
 */
export function parseRetryAfter(value: string | null, now: number): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;
  // Every HTTP-date form carries a month/weekday name. Without one this is
  // malformed ("-5", "3.5"), and Date.parse would happily turn it into some
  // long-past year — i.e. a zero delay that skips the backoff entirely.
  if (!/[a-z]/i.test(trimmed)) return null;
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return null;
  return Math.max(0, date - now);
}

function headerNumber(headers: Headers, ...names: string[]): number | null {
  for (const name of names) {
    const raw = headers.get(name);
    if (raw == null) continue;
    const value = Number(raw.trim());
    if (Number.isFinite(value)) return value;
  }
  return null;
}

/**
 * Reads the quota headers a rate-limited deployment may send — the RFC draft
 * `RateLimit-*` names and the older `X-RateLimit-*` ones. `reset` is published
 * either as a delta in seconds or as an absolute epoch, so it is disambiguated
 * by magnitude.
 */
export function readRateLimit(headers: Headers, now: number): RateLimit {
  const reset = headerNumber(headers, "ratelimit-reset", "x-ratelimit-reset");
  let resetMs: number | null = null;
  if (reset != null) {
    if (reset > 1e12) resetMs = Math.max(0, reset - now); // epoch milliseconds
    else if (reset > 1e9) resetMs = Math.max(0, reset * 1000 - now); // epoch seconds
    else resetMs = Math.max(0, reset * 1000); // delta seconds
  }
  return {
    limit: headerNumber(headers, "ratelimit-limit", "x-ratelimit-limit"),
    remaining: headerNumber(headers, "ratelimit-remaining", "x-ratelimit-remaining"),
    resetMs,
  };
}

/**
 * Full-jitter exponential backoff: pick a random point inside a window that
 * doubles per attempt. Jitter matters more than the growth curve — it stops a
 * batch of parallel icon requests from retrying in lockstep.
 */
export function backoffDelayMs({
  attempt,
  baseDelayMs,
  maxDelayMs,
  random,
}: {
  attempt: number;
  baseDelayMs: number;
  maxDelayMs: number;
  random: () => number;
}): number {
  const window = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.round(random() * window);
}

function describeStatus(response: Response | null): string {
  return response ? `HTTP ${response.status}` : "network error";
}

/**
 * A fetch that retries transient failures, shared by every icon download so
 * one rate-limited host pauses all of its own traffic.
 */
export function createHttpClient(options: Partial<HttpClientOptions> = {}): HttpClient {
  const opts: HttpClientOptions = { ...DEFAULTS, ...options };
  /** host → epoch ms before which that host must not be called again. */
  const quotaPauses = new Map<string, number>();

  async function waitForQuota(host: string): Promise<void> {
    const resumeAt = quotaPauses.get(host);
    if (resumeAt == null) return;
    quotaPauses.delete(host);
    const waitMs = resumeAt - opts.now();
    if (waitMs > 0) await opts.sleep(waitMs);
  }

  function recordQuota(host: string, headers: Headers): void {
    const { remaining, resetMs } = readRateLimit(headers, opts.now());
    if (remaining === 0 && resetMs != null && resetMs > 0) {
      quotaPauses.set(host, opts.now() + resetMs);
    }
  }

  return {
    async fetch(url: string): Promise<Response> {
      const host = new URL(url).host;
      for (let attempt = 0; ; attempt++) {
        await waitForQuota(host);

        let response: Response | null = null;
        let networkError: unknown;
        try {
          response = await opts.fetchImpl(url);
        } catch (err) {
          networkError = err;
        }

        if (response) {
          recordQuota(host, response.headers);
          if (response.ok) return response;
          if (!RETRYABLE_STATUS.has(response.status)) {
            const body = (await response.text().catch(() => "")).trim().slice(0, 200);
            throw new Error(
              `HTTP ${response.status} ${response.statusText} fetching ${url}${body ? `: ${body}` : ""}`,
            );
          }
          await response.body?.cancel().catch(() => {});
        }

        if (attempt >= opts.maxAttempts - 1) {
          throw new Error(
            `${describeStatus(response)} fetching ${url} after ${opts.maxAttempts} attempts` +
              (networkError ? `: ${String(networkError)}` : ""),
          );
        }

        const now = opts.now();
        const retryAfterMs = response
          ? parseRetryAfter(response.headers.get("retry-after"), now)
          : null;
        const quotaResetMs = response ? readRateLimit(response.headers, now).resetMs : null;

        let delayMs: number;
        let reason: RetryReason;
        if (retryAfterMs != null) {
          delayMs = retryAfterMs;
          reason = "retry-after";
        } else if (quotaResetMs != null && quotaResetMs > 0) {
          delayMs = quotaResetMs;
          reason = "rate-limit-reset";
        } else {
          delayMs = backoffDelayMs({
            attempt,
            baseDelayMs: opts.baseDelayMs,
            maxDelayMs: opts.maxDelayMs,
            random: opts.random,
          });
          reason = response ? "backoff" : "network";
        }

        if (delayMs > opts.maxRetryAfterMs) {
          throw new Error(
            `${describeStatus(response)} fetching ${url}: server asked for a ${delayMs}ms wait, ` +
              `above the ${opts.maxRetryAfterMs}ms limit`,
          );
        }

        opts.onRetry?.({
          url,
          attempt: attempt + 1,
          status: response ? response.status : null,
          delayMs,
          reason,
        });
        await opts.sleep(delayMs);
      }
    },
  };
}

export type IconifyBatch = { prefix: string; names: string[]; url: string };

function batchUrl(apiBase: string, prefix: string, names: string[]): string {
  return `${apiBase}/${prefix}.json?icons=${names.join(",")}`;
}

/**
 * Turns `prefix:name` specs into the fewest icon-data queries that stay inside
 * the URL length limit. Names are de-duplicated and sorted, as the docs
 * recommend, so the same icon set always produces the same URL and can be
 * served from cache.
 */
export function planIconifyBatches({
  specs,
  apiBase = ICONIFY_API_BASE,
  maxUrlLength = MAX_QUERY_URL_LENGTH,
}: {
  specs: string[];
  apiBase?: string;
  maxUrlLength?: number;
}): IconifyBatch[] {
  const byPrefix = new Map<string, Set<string>>();
  for (const spec of specs) {
    const colon = spec.indexOf(":");
    if (colon < 0) throw new Error(`not an iconify spec (expected "prefix:name"): ${spec}`);
    const prefix = spec.slice(0, colon);
    const name = spec.slice(colon + 1);
    const names = byPrefix.get(prefix) ?? new Set<string>();
    names.add(name);
    byPrefix.set(prefix, names);
  }

  const batches: IconifyBatch[] = [];
  for (const prefix of [...byPrefix.keys()].sort()) {
    let chunk: string[] = [];
    for (const name of [...byPrefix.get(prefix)!].sort()) {
      // A lone name that already blows the budget still gets its own query —
      // dropping it would silently lose an icon.
      if (chunk.length > 0 && batchUrl(apiBase, prefix, [...chunk, name]).length > maxUrlLength) {
        batches.push({ prefix, names: chunk, url: batchUrl(apiBase, prefix, chunk) });
        chunk = [];
      }
      chunk.push(name);
    }
    if (chunk.length > 0) {
      batches.push({ prefix, names: chunk, url: batchUrl(apiBase, prefix, chunk) });
    }
  }
  return batches;
}

/**
 * Renders one icon of an `IconifyJSON` set to the exact SVG document the
 * per-icon `/{prefix}/{name}.svg` endpoint returns, so the on-disk SVG cache
 * and everything downstream of it stay unchanged. Returns null when the set
 * has no such icon (or alias).
 */
export function renderIconSvg(iconSet: IconifyJSON, name: string): string | null {
  const data = getIconData(iconSet, name);
  if (!data) return null;
  const { body, attributes } = iconToSVG(data);
  return iconToHTML(body, attributes);
}

export type IconifyFetchResult = {
  /** `prefix:name` → SVG document. */
  svgs: Map<string, string>;
  /** Specs the API reported (or silently omitted) as unavailable. */
  notFound: string[];
};

/**
 * Resolves Iconify specs through the batched icon-data API — one query per
 * icon set (split further only when the URL would get too long).
 */
export async function fetchIconifySvgs({
  specs,
  client,
  apiBase = ICONIFY_API_BASE,
  maxUrlLength = MAX_QUERY_URL_LENGTH,
}: {
  specs: string[];
  client: HttpClient;
  apiBase?: string;
  maxUrlLength?: number;
}): Promise<IconifyFetchResult> {
  const svgs = new Map<string, string>();
  const notFound: string[] = [];

  for (const batch of planIconifyBatches({ specs, apiBase, maxUrlLength })) {
    const response = await client.fetch(batch.url);
    const iconSet = (await response.json()) as IconifyJSON;
    for (const name of batch.names) {
      const svg = renderIconSvg(iconSet, name);
      if (svg) svgs.set(`${batch.prefix}:${name}`, svg);
      else notFound.push(`${batch.prefix}:${name}`);
    }
  }

  return { svgs, notFound };
}
