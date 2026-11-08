import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ResolvedRuntimeProfile,
  RuntimeProfileResolveRequest,
  RuntimePresetResolveRequest,
} from "../../../packages/ui/src/data/ai/runtime-profile";
import { registerRuntimeProfilesMiddleware, resolveRuntimeSelectionFromCaptain } from "./runtime-profiles-server";
import type { Middleware } from "./middleware";
import { createServer } from "node:http";

const request: RuntimeProfileResolveRequest = {
  profile: {
    id: "review",
    name: "Review",
    spec: { mode: "agent" },
    presets: ["guardrails"],
  },
  presets: [
    {
      id: "guardrails",
      name: "Guardrails",
      scope: "global",
      spec: { toolPolicy: [{ destructive: true, policy: "ask" }] },
    },
  ],
};

const resolution: ResolvedRuntimeProfile = {
  resolved: {
    spec: {
      mode: "agent",
      toolPolicy: [{ destructive: true, policy: "ask" }],
    },
    constraints: {},
    trace: [
      {
        id: "guardrails",
        source: "preset",
        name: "Guardrails",
        scope: "global",
        spec: { toolPolicy: [{ destructive: true, policy: "ask" }] },
        constraints: {},
      },
      {
        id: "review:spec",
        source: "profile",
        name: "Review run spec",
        scope: "surface",
        spec: { mode: "agent" },
        constraints: {},
      },
    ],
  },
  tools: [{ name: "invoice_update", label: "Update invoice" }],
  permissions: { invoice_update: "ask" },
  permissionSupport: { invoice_update: { kind: "requires-broker" } },
  effectivePolicy: [{ destructive: true, policy: "ask" }],
};

describe("resolveRuntimeSelectionFromCaptain", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("forwards the complete request to Captain and returns its authoritative result", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(resolution), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(
      resolveRuntimeSelectionFromCaptain(
        "http://captain/api/chat/runtime-profiles/resolve",
        request,
      ),
    ).resolves.toEqual(resolution);
    expect(fetch).toHaveBeenCalledWith(
      "http://captain/api/chat/runtime-profiles/resolve",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
    );
  });

  it("surfaces Captain validation failures without resolving locally", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("permission settings require a resolved backend\n", {
          status: 400,
          statusText: "Bad Request",
        }),
      ),
    );

    await expect(
      resolveRuntimeSelectionFromCaptain(
        "http://captain/api/chat/runtime-profiles/resolve",
        request,
      ),
    ).rejects.toThrow("permission settings require a resolved backend");
  });
});

it("proxies preset selections to Captain's preset resolver through plain middleware", async () => {
  const handlers = new Map<string, Middleware>();
  registerRuntimeProfilesMiddleware({
    middlewares: { use: (route: string | Middleware, handler?: Middleware) => {
      if (typeof route !== "string" || !handler) throw new Error("Expected a mounted runtime route");
      handlers.set(route, handler);
    } },
    logger: { error: vi.fn() },
    modelsURL: "unused",
    permissionsURL: "unused",
    runtimesURL: "unused",
    resolveURL: "http://captain/api/chat/runtime-profiles/resolve",
    presetsResolveURL: "http://captain/api/chat/runtime-presets/resolve",
  });
  const handler = handlers.get("/__playground/runtime-profiles/presets/resolve");
  expect(handler).toBeDefined();
  if (!handler) throw new Error("Missing preset resolution middleware");
  const server = createServer((request, response) => handler(request, response, () => {
    throw new Error("Preset resolver must handle the request");
  }));
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing preset test server address");
  const nativeFetch = globalThis.fetch;
  const captainFetch = vi.fn().mockResolvedValue(Response.json(resolution));
  vi.stubGlobal("fetch", captainFetch);
  const selection: RuntimePresetResolveRequest = { selected: ["guardrails"], presets: request.presets };
  try {
    const response = await nativeFetch(`http://127.0.0.1:${address.port}`, {
      method: "POST", body: JSON.stringify(selection),
    });
    expect({ status: response.status, body: await response.json() }).toEqual({ status: 200, body: resolution });
    expect(captainFetch).toHaveBeenCalledWith("http://captain/api/chat/runtime-presets/resolve", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selection),
    });
  } finally {
    vi.unstubAllGlobals();
    await new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done()));
  }
});
