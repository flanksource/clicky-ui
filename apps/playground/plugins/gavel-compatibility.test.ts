// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { checkGavelCompatibility, GavelCompatibilityError } from "./gavel-compatibility";
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
const OPERATIONS = { "/api/launch/linters": { get: {} }, "/api/launch/lint/filter": { post: {} }, "/api/launch/lint/ignore": { post: {} } };
/** A gavel whose OpenAPI document lists the launch operations and whose comment routes answer `routes`. */
function stubGavel(paths: object, routes: Response | (() => Response)) {
  return vi.fn(async (input: string | URL | Request) => {
    const { pathname } = new URL(String(input));
    if (pathname === "/api/v1/comments/routes") return typeof routes === "function" ? routes() : routes;
    return Response.json({ openapi: "3.1.0", paths });
  });
}
const refusesScopeless = () => Response.json({ error: "invalid: scope is required" }, { status: 400 });

it("rejects an older API and accepts the required operations after upgrade", async () => {
  const paths = {};
  vi.stubGlobal("fetch", stubGavel(paths, refusesScopeless));
  await expect(checkGavelCompatibility("http://gavel.local")).rejects.toThrow("POST /api/launch/lint/filter");
  Object.assign(paths, OPERATIONS);
  await expect(checkGavelCompatibility("http://gavel.local")).resolves.toBeUndefined();
});
it.each([
  ["a gavel with delivery that refuses the scopeless route list", () => refusesScopeless()],
  ["a gavel whose host authorizes before validating", () => Response.json({ error: "forbidden" }, { status: 403 })],
])("accepts %s", async (_label, routes) => {
  vi.stubGlobal("fetch", stubGavel(OPERATIONS, routes));
  await expect(checkGavelCompatibility("http://gavel.local")).resolves.toBeUndefined();
});
it("rejects a gavel built before agent delivery, which reads the route list as a comment id, and says to rebuild and install it", async () => {
  vi.stubGlobal("fetch", stubGavel(OPERATIONS, () => Response.json({ success: false, error: "not_found: comment not found" }, { status: 404 })));
  const rejected = checkGavelCompatibility("http://gavel.local");
  await expect(rejected).rejects.toBeInstanceOf(GavelCompatibilityError);
  await expect(rejected).rejects.toThrow("Gavel at http://gavel.local predates agent delivery: GET /api/v1/comments/routes answered HTTP 404. Rebuild gavel from its checkout (`make install`) and restart it.");
});
it("rejects a comments host that did not opt into agent delivery and names how to get one", async () => {
  vi.stubGlobal("fetch", stubGavel(OPERATIONS, () => Response.json({ error: "comment routes are not enabled" }, { status: 501 })));
  await expect(checkGavelCompatibility("http://gavel.local")).rejects.toThrow(/runs comments without agent delivery.*gavel launch serve.*PLAYGROUND_GAVEL_URL/);
});
it.each(["text/plain", "application/json"])("preserves a bad upstream %s response through the error envelope", async contentType => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("404 page not found", { status: 404, headers: { "Content-Type": contentType } })));
  const error = await new LaunchClient(fixedGavel("http://gavel.local"), "/workspace").filterLint("prepared", []).catch((cause: unknown) => cause);
  expect(errorEnvelope(error)).toMatchObject({ status: 502, body: { context: { Endpoint: "http://gavel.local/api/launch/lint/filter", Method: "POST", Status: "404" }, details: [{ label: "Response", value: "404 page not found" }] } });
});
