// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { checkGavelCompatibility, GavelCompatibilityError } from "./gavel-compatibility";
import { LaunchClient } from "./launch-client";
import { fixedGavel } from "./gavel-launch-server";
import { errorEnvelope } from "./prompt-runs-errors";

afterEach(() => vi.unstubAllGlobals());
const OPERATIONS = { "/api/launch/prepare": { post: {} }, "/api/launch/prompts": { get: {} }, "/api/launch/lint": { post: {} }, "/api/runs/{executionId}": { get: {} } };

it("rejects an older API and accepts the required operations after upgrade", async () => {
  const paths = {};
  const fetch = vi.fn(async (_input: string | URL | Request) => Response.json({ openapi: "3.1.0", paths }));
  vi.stubGlobal("fetch", fetch);
  const rejected = checkGavelCompatibility("http://gavel.local");
  await expect(rejected).rejects.toBeInstanceOf(GavelCompatibilityError);
  await expect(rejected).rejects.toThrow("GET /api/launch/prompts");
  Object.assign(paths, OPERATIONS);
  await expect(checkGavelCompatibility("http://gavel.local")).resolves.toBeUndefined();
  expect(fetch.mock.calls.map(([input]) => String(input))).toEqual(Array(2).fill("http://gavel.local/api/launch/openapi"));
});
it("does not probe comment routes, which the OpenAPI check never needed", async () => {
  const fetch = vi.fn(async (_input: string | URL | Request) => Response.json({ openapi: "3.1.0", paths: OPERATIONS }));
  vi.stubGlobal("fetch", fetch);
  await checkGavelCompatibility("http://gavel.local");
  expect(fetch.mock.calls.map(([input]) => new URL(String(input)).pathname)).toEqual(["/api/launch/openapi"]);
});
it("rejects a document that is not JSON", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>", { status: 200, headers: { "Content-Type": "text/html" } })));
  await expect(checkGavelCompatibility("http://gavel.local")).rejects.toThrow("Gavel at http://gavel.local has no usable OpenAPI document (HTTP 200). Rebuild and restart Gavel.");
});
it.each(["text/plain", "application/json"])("preserves a bad upstream %s response through the error envelope", async contentType => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("404 page not found", { status: 404, headers: { "Content-Type": contentType } })));
  const error = await new LaunchClient(fixedGavel("http://gavel.local"), "/workspace").prepare().catch((cause: unknown) => cause);
  expect(errorEnvelope(error)).toMatchObject({ status: 502, body: { context: { Endpoint: "http://gavel.local/api/launch/prepare", Method: "POST", Status: "404" }, details: [{ label: "Response", value: "404 page not found" }] } });
});
