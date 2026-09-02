import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loadRuntimeProfilePermissionCatalog,
  loadRuntimeProfileRuntimeCatalog,
} from "./runtime-profiles-catalog";

const permissions = { modes: {}, toolPolicies: {}, resources: {} };
const schema = {
  type: "object",
  properties: { model: { type: "string" } },
};

describe("loadRuntimeProfileRuntimeCatalog", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads Captain capabilities and JSON schema without projecting them away", async () => {
    const runtimes = [
      {
        family: "codex",
        provider: "openai",
        catalogPrefix: "codex-agent",
        modes: [
          {
            mode: "agent",
            permissions: {
              ...permissions,
              modes: { plan: { kind: "native" } },
            },
            schema,
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
      [
        {
          family: "codex",
          provider: "openai",
          catalogPrefix: "codex",
          modes: [],
        },
      ],
      'runtime family "codex" contains no modes',
    ],
    [
      [
        {
          family: "codex",
          provider: "openai",
          catalogPrefix: "codex",
          modes: [{ mode: "agent", schema }],
        },
      ],
      'runtime provider "openai" mode "agent" is missing permission capabilities',
    ],
    [
      [
        {
          family: "codex",
          provider: "openai",
          catalogPrefix: "codex",
          modes: [
            {
              mode: "agent",
              permissions,
            },
          ],
        },
      ],
      'runtime provider "openai" mode "agent" is missing its JSON schema',
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

describe("loadRuntimeProfilePermissionCatalog", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads every permission domain for the selected provider and mode", async () => {
    const catalog = {
      tools: [{ id: "Read" }],
      mcp: [{ id: "postgres" }],
      plugins: [{ id: "review-toolkit" }],
      skills: [{ id: "agent-browser" }],
    };
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(catalog), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await expect(
      loadRuntimeProfilePermissionCatalog(
        "http://captain/api/captain/ai/permissions/catalog",
        { provider: "anthropic", mode: "cli" },
      ),
    ).resolves.toEqual(catalog);
    expect(fetch).toHaveBeenCalledWith(
      "http://captain/api/captain/ai/permissions/catalog?provider=anthropic&mode=cli",
    );
  });

  it("rejects a catalog missing one of its permission domains", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ tools: [], mcp: [], skills: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(
      loadRuntimeProfilePermissionCatalog(
        "http://captain/api/captain/ai/permissions/catalog",
        { provider: "anthropic", mode: "cli" },
      ),
    ).rejects.toThrow("permission catalog.plugins must be an array");
  });
});
