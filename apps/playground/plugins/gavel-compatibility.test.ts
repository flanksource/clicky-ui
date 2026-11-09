// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { checkGavelCompatibility } from "./gavel-compatibility";
import { LaunchClient } from "./launch-client";
import { fixedGavel } from "./gavel-launch-server";
import { errorEnvelope } from "./prompt-runs-errors";

afterEach(() => vi.unstubAllGlobals());
it("preserves run label filters and pagination through the shared client", async () => {
  const fetch = vi.fn(async (_input: string | URL | Request) => Response.json({ runs: [] }));
  vi.stubGlobal("fetch", fetch);
  await expect(new LaunchClient(fixedGavel("http://gavel.local"), "/workspace").listRuns({ labels: { documentLint: "plain" }, limit: 200, before: "previous-run" })).resolves.toEqual({ runs: [] });
  expect(String(fetch.mock.calls[0]?.[0])).toBe("http://gavel.local/api/runs?label.documentLint=plain&limit=200&before=previous-run");
});
it("rejects an older API and accepts the required operations after upgrade", async () => {
  const paths = {};
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ openapi: "3.1.0", paths })));
  await expect(checkGavelCompatibility("http://gavel.local")).rejects.toThrow("POST /api/launch/lint/filter");
  Object.assign(paths, { "/api/launch/linters": { get: {} }, "/api/launch/lint/filter": { post: {} }, "/api/launch/lint/ignore": { post: {} } });
  await expect(checkGavelCompatibility("http://gavel.local")).resolves.toBeUndefined();
});
it.each(["text/plain", "application/json"])("preserves a bad upstream %s response through the error envelope", async contentType => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("404 page not found", { status: 404, headers: { "Content-Type": contentType } })));
  const error = await new LaunchClient(fixedGavel("http://gavel.local"), "/workspace").filterLint("prepared", []).catch((cause: unknown) => cause);
  expect(errorEnvelope(error)).toMatchObject({ status: 502, body: { context: { Endpoint: "http://gavel.local/api/launch/lint/filter", Method: "POST", Status: "404" }, details: [{ label: "Response", value: "404 page not found" }] } });
});
