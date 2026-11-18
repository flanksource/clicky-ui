import { afterEach, expect, it, vi } from "vitest";
import { normalizeErrorDiagnostics } from "@flanksource/clicky-ui";
import { documentJson } from "./api";

afterEach(() => vi.unstubAllGlobals());

it("preserves the non-JSON response and request identity for the repository error wrapper", async () => {
  const endpoint = "/__playground/gavel/api/workspace/directories?path=docs";
  const body = "<html><body>Workspace API is unavailable</body></html>";
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status: 503, headers: { "Content-Type": "text/html" } })));
  const error = await documentJson(endpoint).catch((cause: unknown) => cause);
  expect(normalizeErrorDiagnostics(error)).toMatchObject({
    message: "Repository review requires a live playground server and Gavel workspace API",
    context: [["Method", "GET"], ["Endpoint", endpoint], ["Status", "503"], ["Content type", "text/html"]],
    details: [{ label: "Response", value: body }],
  });
});

it("retains structured server diagnostics and the raw body for JSON HTTP failures", async () => {
  const body = { error: "Workspace unavailable", hint: "Start the launch server", trace: "workspace-trace", details: [{ label: "Command", value: "gavel launch serve" }] };
  vi.stubGlobal("fetch", vi.fn(async () => Response.json(body, { status: 502 })));
  const error = await documentJson("/__playground/gavel/api/workspace/file", { method: "PUT" }).catch((cause: unknown) => cause);
  expect(normalizeErrorDiagnostics(error)).toMatchObject({ message: body.error, trace: body.trace, context: expect.arrayContaining([["Hint", body.hint], ["Method", "PUT"], ["Status", "502"]]), details: expect.arrayContaining([...body.details, { label: "Response", value: JSON.stringify(body) }]) });
});

it("retains malformed JSON for diagnosis instead of exposing a bare parse error", async () => {
  const body = "404 page not found";
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status: 200, headers: { "Content-Type": "application/json" } })));
  const error = await documentJson("/__playground/documents/repositories").catch((cause: unknown) => cause);
  expect(normalizeErrorDiagnostics(error)).toMatchObject({ message: expect.stringContaining("invalid JSON"), details: expect.arrayContaining([{ label: "Response", value: body }]) });
});

it("attaches the endpoint to network failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
  const endpoint = "/__playground/documents/repositories";
  const error = await documentJson(endpoint).catch((cause: unknown) => cause);
  expect(normalizeErrorDiagnostics(error)).toMatchObject({ message: "Repository request failed: Failed to fetch", context: [["Method", "GET"], ["Endpoint", endpoint]], stacktrace: expect.stringContaining("Failed to fetch") });
});
