import { describe, expect, it, vi } from "vitest";

import {
  backoffDelayMs,
  createHttpClient,
  fetchIconifySvgs,
  ICONIFY_API_BASE,
  parseRetryAfter,
  planIconifyBatches,
  readRateLimit,
  renderIconSvg,
} from "./icon-fetch";

/** Records every sleep instead of performing it, so retry tests run instantly. */
function recordingSleep() {
  const slept: number[] = [];
  return { slept, sleep: async (ms: number) => void slept.push(ms) };
}

/** Serves the given responses in order; extra calls throw so over-fetching fails loudly. */
function scriptedFetch(responses: Array<Response | Error>) {
  const urls: string[] = [];
  const fetchImpl = async (url: string | URL) => {
    urls.push(String(url));
    const next = responses.shift();
    if (!next) throw new Error(`unexpected extra request: ${url}`);
    if (next instanceof Error) throw next;
    return next;
  };
  return { urls, fetchImpl: fetchImpl as unknown as typeof fetch };
}

const NOW = Date.UTC(2026, 0, 2, 3, 4, 5);

describe("parseRetryAfter", () => {
  it("reads delta-seconds as milliseconds", () => {
    expect(parseRetryAfter("30", NOW)).toBe(30_000);
  });

  it("reads an HTTP-date as the remaining milliseconds until that date", () => {
    const target = new Date(NOW + 45_000).toUTCString();
    expect(parseRetryAfter(target, NOW)).toBe(45_000);
  });

  it("clamps an HTTP-date already in the past to zero", () => {
    const target = new Date(NOW - 90_000).toUTCString();
    expect(parseRetryAfter(target, NOW)).toBe(0);
  });

  it("returns null for a missing or unparseable value", () => {
    expect(parseRetryAfter(null, NOW)).toBeNull();
    expect(parseRetryAfter("soon", NOW)).toBeNull();
    expect(parseRetryAfter("-5", NOW)).toBeNull();
  });
});

describe("readRateLimit", () => {
  it("reads the RFC draft headers", () => {
    const headers = new Headers({
      "ratelimit-limit": "100",
      "ratelimit-remaining": "0",
      "ratelimit-reset": "20",
    });
    expect(readRateLimit(headers, NOW)).toEqual({ limit: 100, remaining: 0, resetMs: 20_000 });
  });

  it("reads the x-prefixed variants", () => {
    const headers = new Headers({
      "x-ratelimit-limit": "60",
      "x-ratelimit-remaining": "7",
      "x-ratelimit-reset": "5",
    });
    expect(readRateLimit(headers, NOW)).toEqual({ limit: 60, remaining: 7, resetMs: 5_000 });
  });

  it("treats a large reset value as a unix epoch rather than a delta", () => {
    const epochSeconds = Math.floor(NOW / 1000) + 12;
    const headers = new Headers({
      "ratelimit-remaining": "0",
      "ratelimit-reset": String(epochSeconds),
    });
    expect(readRateLimit(headers, NOW).resetMs).toBe(12_000);
  });

  it("reports nulls when the server sends no rate-limit headers", () => {
    expect(readRateLimit(new Headers(), NOW)).toEqual({
      limit: null,
      remaining: null,
      resetMs: null,
    });
  });
});

describe("backoffDelayMs", () => {
  it("grows exponentially from the base delay", () => {
    const full = () => 1;
    expect(backoffDelayMs({ attempt: 0, baseDelayMs: 500, maxDelayMs: 30_000, random: full })).toBe(
      500,
    );
    expect(backoffDelayMs({ attempt: 1, baseDelayMs: 500, maxDelayMs: 30_000, random: full })).toBe(
      1000,
    );
    expect(backoffDelayMs({ attempt: 3, baseDelayMs: 500, maxDelayMs: 30_000, random: full })).toBe(
      4000,
    );
  });

  it("caps the exponential window at maxDelayMs", () => {
    expect(
      backoffDelayMs({ attempt: 20, baseDelayMs: 500, maxDelayMs: 30_000, random: () => 1 }),
    ).toBe(30_000);
  });

  it("applies full jitter, so the delay is a random point inside the window", () => {
    expect(
      backoffDelayMs({ attempt: 2, baseDelayMs: 500, maxDelayMs: 30_000, random: () => 0.25 }),
    ).toBe(500);
    expect(
      backoffDelayMs({ attempt: 2, baseDelayMs: 500, maxDelayMs: 30_000, random: () => 0 }),
    ).toBe(0);
  });
});

describe("planIconifyBatches", () => {
  it("groups icons by prefix into one query each", () => {
    const batches = planIconifyBatches({ specs: ["ph:house", "lucide:x", "ph:archive"] });
    expect(batches).toEqual([
      { prefix: "lucide", names: ["x"], url: `${ICONIFY_API_BASE}/lucide.json?icons=x` },
      {
        prefix: "ph",
        names: ["archive", "house"],
        url: `${ICONIFY_API_BASE}/ph.json?icons=archive,house`,
      },
    ]);
  });

  it("sorts names and drops duplicates so repeated builds hit the same cached URL", () => {
    const batches = planIconifyBatches({ specs: ["ph:house", "ph:archive", "ph:house"] });
    expect(batches).toHaveLength(1);
    expect(batches[0]!.names).toEqual(["archive", "house"]);
  });

  it("splits a prefix into several queries when the URL would exceed the length limit", () => {
    const names = Array.from({ length: 40 }, (_, i) => `icon-number-${String(i).padStart(3, "0")}`);
    const batches = planIconifyBatches({ specs: names.map((n) => `ph:${n}`), maxUrlLength: 200 });

    expect(batches.length).toBeGreaterThan(1);
    for (const batch of batches) expect(batch.url.length).toBeLessThanOrEqual(200);
    expect(batches.flatMap((b) => b.names)).toEqual([...names].sort());
  });

  it("keeps a single name that cannot fit rather than dropping it", () => {
    const batches = planIconifyBatches({ specs: ["ph:house"], maxUrlLength: 10 });
    expect(batches).toEqual([
      { prefix: "ph", names: ["house"], url: `${ICONIFY_API_BASE}/ph.json?icons=house` },
    ]);
  });
});

describe("renderIconSvg", () => {
  const iconSet = {
    prefix: "ph",
    width: 256,
    height: 256,
    icons: {
      house: { body: '<path d="M1 2"/>' },
      turned: { body: '<path d="M3 4"/>', rotate: 1 },
      sized: { body: '<path d="M5 6"/>', width: 16, height: 16 },
    },
    aliases: { casa: { parent: "house" } },
  };

  it("wraps the body in the same svg the per-icon .svg endpoint returns", () => {
    expect(renderIconSvg(iconSet, "house")).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path d="M1 2"/></svg>',
    );
  });

  it("uses the icon's own dimensions for the viewBox when it overrides the set default", () => {
    expect(renderIconSvg(iconSet, "sized")).toContain('viewBox="0 0 16 16"');
  });

  it("bakes an icon's rotation into a transform group", () => {
    expect(renderIconSvg(iconSet, "turned")).toContain('<g transform="rotate(90 128 128)">');
  });

  it("resolves an alias to its parent icon", () => {
    expect(renderIconSvg(iconSet, "casa")).toBe(renderIconSvg(iconSet, "house"));
  });

  it("returns null for an icon the set does not contain", () => {
    expect(renderIconSvg(iconSet, "nope")).toBeNull();
  });
});

describe("createHttpClient", () => {
  it("returns the response without sleeping when the first request succeeds", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([new Response("ok", { status: 200 })]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW });

    await expect((await client.fetch("https://api.iconify.design/ph.json")).text()).resolves.toBe(
      "ok",
    );
    expect(slept).toEqual([]);
  });

  it("waits for the Retry-After delay a 429 asks for, then succeeds", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([
      new Response("", { status: 429, headers: { "retry-after": "3" } }),
      new Response("svg", { status: 200 }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW });

    await expect((await client.fetch("https://api.iconify.design/ph.json")).text()).resolves.toBe(
      "svg",
    );
    expect(slept).toEqual([3000]);
  });

  it("falls back to jittered exponential backoff when a 429 carries no hint", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([
      new Response("", { status: 429 }),
      new Response("", { status: 429 }),
      new Response("svg", { status: 200 }),
    ]);
    const client = createHttpClient({
      fetchImpl,
      sleep,
      now: () => NOW,
      random: () => 1,
      baseDelayMs: 100,
    });

    await client.fetch("https://api.iconify.design/ph.json");
    expect(slept).toEqual([100, 200]);
  });

  it("retries transient server errors and network failures", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([
      new Response("", { status: 503 }),
      new TypeError("fetch failed"),
      new Response("svg", { status: 200 }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW, random: () => 1 });

    await expect((await client.fetch("https://example.test/a.svg")).text()).resolves.toBe("svg");
    expect(slept).toHaveLength(2);
  });

  it("fails immediately on 404 so the incumbent candidate probe stays fast", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl, urls } = scriptedFetch([new Response("nope", { status: 404 })]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW });

    await expect(client.fetch("https://example.test/missing.svg")).rejects.toThrow(/HTTP 404/);
    expect(urls).toHaveLength(1);
    expect(slept).toEqual([]);
  });

  it("gives up after maxAttempts and reports the status it kept seeing", async () => {
    const { sleep } = recordingSleep();
    const { fetchImpl, urls } = scriptedFetch([
      new Response("", { status: 429 }),
      new Response("", { status: 429 }),
      new Response("", { status: 429 }),
    ]);
    const client = createHttpClient({
      fetchImpl,
      sleep,
      now: () => NOW,
      random: () => 1,
      maxAttempts: 3,
    });

    await expect(client.fetch("https://api.iconify.design/ph.json")).rejects.toThrow(
      /HTTP 429.*after 3 attempts/,
    );
    expect(urls).toHaveLength(3);
  });

  it("refuses to wait longer than maxRetryAfterMs instead of stalling the build", async () => {
    const { sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([
      new Response("", { status: 429, headers: { "retry-after": "600" } }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW, maxRetryAfterMs: 60_000 });

    await expect(client.fetch("https://api.iconify.design/ph.json")).rejects.toThrow(
      /asked for a 600000ms wait/,
    );
  });

  it("pauses before the next request when a response reports the quota is exhausted", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([
      new Response("a", {
        status: 200,
        headers: { "ratelimit-remaining": "0", "ratelimit-reset": "4" },
      }),
      new Response("b", { status: 200 }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW });

    await client.fetch("https://api.iconify.design/ph.json?icons=a");
    expect(slept).toEqual([]);
    await client.fetch("https://api.iconify.design/ph.json?icons=b");
    expect(slept).toEqual([4000]);
  });

  it("scopes the quota pause to the host that reported it", async () => {
    const { slept, sleep } = recordingSleep();
    const { fetchImpl } = scriptedFetch([
      new Response("a", {
        status: 200,
        headers: { "ratelimit-remaining": "0", "ratelimit-reset": "4" },
      }),
      new Response("b", { status: 200 }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW });

    await client.fetch("https://api.iconify.design/ph.json");
    await client.fetch("https://raw.githubusercontent.com/some/icon.svg");
    expect(slept).toEqual([]);
  });

  it("reports each retry so a slow cold build explains itself", async () => {
    const { sleep } = recordingSleep();
    const onRetry = vi.fn();
    const { fetchImpl } = scriptedFetch([
      new Response("", { status: 429, headers: { "retry-after": "2" } }),
      new Response("svg", { status: 200 }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep, now: () => NOW, onRetry });

    await client.fetch("https://api.iconify.design/ph.json");
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ attempt: 1, status: 429, delayMs: 2000, reason: "retry-after" }),
    );
  });
});

describe("fetchIconifySvgs", () => {
  const phBody = JSON.stringify({
    prefix: "ph",
    width: 256,
    height: 256,
    icons: { house: { body: '<path d="M1 2"/>' }, archive: { body: '<path d="M3 4"/>' } },
  });

  it("resolves every icon of a prefix from one batched query", async () => {
    const { fetchImpl, urls } = scriptedFetch([new Response(phBody, { status: 200 })]);
    const client = createHttpClient({ fetchImpl, sleep: async () => {}, now: () => NOW });

    const result = await fetchIconifySvgs({ specs: ["ph:house", "ph:archive"], client });

    expect(urls).toEqual([`${ICONIFY_API_BASE}/ph.json?icons=archive,house`]);
    expect(result.notFound).toEqual([]);
    expect(result.svgs.get("ph:house")).toContain('<path d="M1 2"/>');
    expect(result.svgs.get("ph:archive")).toContain('viewBox="0 0 256 256"');
  });

  it("collects icons the server could not find without failing the whole batch", async () => {
    const body = JSON.stringify({
      prefix: "ph",
      width: 256,
      height: 256,
      icons: { house: { body: '<path d="M1 2"/>' } },
      not_found: ["ghost-icon"],
    });
    const { fetchImpl } = scriptedFetch([new Response(body, { status: 200 })]);
    const client = createHttpClient({ fetchImpl, sleep: async () => {}, now: () => NOW });

    const result = await fetchIconifySvgs({ specs: ["ph:house", "ph:ghost-icon"], client });

    expect(result.notFound).toEqual(["ph:ghost-icon"]);
    expect([...result.svgs.keys()]).toEqual(["ph:house"]);
  });

  it("reports an icon the response silently omitted as not found", async () => {
    const { fetchImpl } = scriptedFetch([new Response(phBody, { status: 200 })]);
    const client = createHttpClient({ fetchImpl, sleep: async () => {}, now: () => NOW });

    const result = await fetchIconifySvgs({ specs: ["ph:house", "ph:archive", "ph:silent"], client });

    expect(result.notFound).toEqual(["ph:silent"]);
  });

  it("sends one query per prefix", async () => {
    const lucideBody = JSON.stringify({
      prefix: "lucide",
      width: 24,
      height: 24,
      icons: { x: { body: '<path d="M9 9"/>' } },
    });
    const { fetchImpl, urls } = scriptedFetch([
      new Response(lucideBody, { status: 200 }),
      new Response(phBody, { status: 200 }),
    ]);
    const client = createHttpClient({ fetchImpl, sleep: async () => {}, now: () => NOW });

    const result = await fetchIconifySvgs({ specs: ["ph:house", "lucide:x"], client });

    expect(urls).toHaveLength(2);
    expect(result.svgs.get("lucide:x")).toContain('viewBox="0 0 24 24"');
  });

  it("makes no request when there is nothing to fetch", async () => {
    const { fetchImpl, urls } = scriptedFetch([]);
    const client = createHttpClient({ fetchImpl, sleep: async () => {}, now: () => NOW });

    const result = await fetchIconifySvgs({ specs: [], client });

    expect(urls).toEqual([]);
    expect(result.svgs.size).toBe(0);
  });
});
