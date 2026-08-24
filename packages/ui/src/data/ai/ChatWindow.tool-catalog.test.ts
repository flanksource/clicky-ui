import { describe, expect, it } from "vitest";
import { effectiveToolPreferences } from "./ChatWindow.tool-catalog";
import type { ToolMeta, ToolPolicy } from "./ToolPreferences";

const FALLBACK: ToolPolicy = "ask";

function tool(partial: Partial<ToolMeta> & { name: string }): ToolMeta {
  return { label: partial.name, ...partial };
}

describe("effectiveToolPreferences", () => {
  const templateWrite = tool({
    name: "template_save",
    group: "templates.write",
    preferenceKey: "templates.write",
    defaultPermission: "ask",
  });

  it("falls back to the catalog default when nothing else applies", () => {
    expect(
      effectiveToolPreferences({
        tools: [templateWrite],
        explicit: {},
        fallback: FALLBACK,
      }),
    ).toEqual({ template_save: "ask" });
  });

  it("uses the declared fallback when a tool has no catalog default", () => {
    expect(
      effectiveToolPreferences({
        tools: [tool({ name: "mystery_tool" })],
        explicit: {},
        fallback: "off",
      }),
    ).toEqual({ mystery_tool: "off" });
  });

  it("lets a surface default override the catalog default via the group key", () => {
    expect(
      effectiveToolPreferences({
        tools: [templateWrite],
        explicit: {},
        surfaceDefaults: { "templates.write": "off" },
        fallback: FALLBACK,
      }),
    ).toEqual({ template_save: "off" });
  });

  it("matches a surface default on the tool name ahead of its group", () => {
    expect(
      effectiveToolPreferences({
        tools: [templateWrite],
        explicit: {},
        surfaceDefaults: { template_save: "on", "templates.write": "off" },
        fallback: FALLBACK,
      }),
    ).toEqual({ template_save: "on" });
  });

  it("keeps an explicit user choice above the surface default", () => {
    expect(
      effectiveToolPreferences({
        tools: [templateWrite],
        explicit: { template_save: "off" },
        surfaceDefaults: { "templates.write": "on" },
        fallback: FALLBACK,
      }),
    ).toEqual({ template_save: "off" });
  });

  it("applies a surface default to tools the user never touched", () => {
    const rulesWrite = tool({
      name: "rules_apply",
      group: "rules.write",
      preferenceKey: "rules.write",
      defaultPermission: "ask",
    });
    expect(
      effectiveToolPreferences({
        tools: [templateWrite, rulesWrite],
        explicit: { template_save: "on" },
        surfaceDefaults: { "templates.write": "off", "rules.write": "off" },
        fallback: FALLBACK,
      }),
    ).toEqual({ template_save: "on", rules_apply: "off" });
  });

  it("resolves only the tools present in the catalog", () => {
    expect(
      effectiveToolPreferences({
        tools: [templateWrite],
        explicit: { retired_tool: "on" },
        fallback: FALLBACK,
      }),
    ).toEqual({ template_save: "ask" });
  });
});
