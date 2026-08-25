import { afterEach, describe, expect, it, vi } from "vitest";
import type { OpenAPISpec } from "../../../packages/ui/src/rpc/types";
import {
  loadRuntimeProfileRuntimeCatalog,
  runtimeProfileToolsFromSpec,
} from "./runtime-profiles-catalog";

const GAVEL_SPEC: OpenAPISpec = {
  openapi: "3.0.3",
  info: { title: "Gavel", version: "test" },
  "x-clicky": {
    surfaces: [{ key: "projects", entity: "project", title: "Projects" }],
  },
  paths: {
    "/api/projects": {
      get: {
        operationId: "projects_list",
        summary: "List projects",
        responses: {},
        "x-clicky": {
          surface: "projects",
          group: "projects.read",
          verb: "list",
          scope: "collection",
        },
      },
    },
  },
};

describe("runtimeProfileToolsFromSpec", () => {
  it("projects real Clicky operation and surface metadata into one tool", () => {
    expect(runtimeProfileToolsFromSpec(GAVEL_SPEC)).toEqual([
      expect.objectContaining({
        name: "projects_list",
        operationName: "projects_list",
        source: "clicky",
        group: "projects.read",
        parent: "Projects",
        entity: "project",
        verb: "list",
        scope: "collection",
        method: "GET",
        path: "/api/projects",
      }),
    ]);
  });

  it("rejects an OpenAPI document with no callable operations", () => {
    expect(() =>
      runtimeProfileToolsFromSpec({ ...GAVEL_SPEC, paths: {} }),
    ).toThrow("contains no callable operations");
  });
});

describe("loadRuntimeProfileRuntimeCatalog", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads Captain permission capabilities without projecting them away", async () => {
    const runtimes = [
      {
        family: "codex",
        provider: "openai",
        catalogPrefix: "codex-agent",
        modes: [
          {
            mode: "agent",
            backend: "codex-agent",
            permissions: {
              modes: { plan: { kind: "native" } },
              toolPolicies: {},
              resources: {},
            },
          },
        ],
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(runtimes),
      }),
    );

    await expect(
      loadRuntimeProfileRuntimeCatalog("http://captain/api/chat/runtimes"),
    ).resolves.toEqual(runtimes);
  });

  it.each([
    [[], "contains no runtime families"],
    [
      [{ family: "codex", provider: "openai", catalogPrefix: "codex", modes: [] }],
      'runtime family "codex" contains no modes',
    ],
    [
      [
        {
          family: "codex",
          provider: "openai",
          catalogPrefix: "codex",
          modes: [{ mode: "agent", backend: "codex-agent" }],
        },
      ],
      'runtime mode "codex-agent" is missing permission capabilities',
    ],
  ])("rejects malformed runtime catalogs", async (payload, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(payload),
      }),
    );

    await expect(
      loadRuntimeProfileRuntimeCatalog("http://captain/api/chat/runtimes"),
    ).rejects.toThrow(message);
  });
});
