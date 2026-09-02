import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ResolvedRuntimeProfile,
  RuntimeProfileResolveRequest,
} from "../../../packages/ui/src/data/ai/runtime-profile";
import { resolveRuntimeProfileFromCaptain } from "./runtime-profiles-server";

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

describe("resolveRuntimeProfileFromCaptain", () => {
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
      resolveRuntimeProfileFromCaptain(
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
      resolveRuntimeProfileFromCaptain(
        "http://captain/api/chat/runtime-profiles/resolve",
        request,
      ),
    ).rejects.toThrow("permission settings require a resolved backend");
  });
});
