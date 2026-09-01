import { afterEach, describe, expect, it, vi } from "vitest";
import { loadRuntimeProfileRuntimeCatalog } from "./runtime-profiles-catalog";

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
            backend: "codex-agent",
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
      [{ family: "codex", provider: "openai", catalogPrefix: "codex", modes: [] }],
      'runtime family "codex" contains no modes',
    ],
    [
      [
        {
          family: "codex",
          provider: "openai",
          catalogPrefix: "codex",
          modes: [{ mode: "agent", backend: "codex-agent", schema }],
        },
      ],
      'runtime mode "codex-agent" is missing permission capabilities',
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
              backend: "codex-agent",
              permissions,
            },
          ],
        },
      ],
      'runtime mode "codex-agent" is missing its JSON schema',
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
