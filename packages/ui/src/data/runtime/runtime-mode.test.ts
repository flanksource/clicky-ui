import { describe, expect, it } from "vitest";
import type { ChatModel } from "../chat/types";
import {
  SPEC_RUNTIME_FAMILIES,
  familyForModel,
  familiesFromRuntimeCatalog,
  modelBelongsToFamily,
  modelsForFamily,
  selectionForMode,
  selectionForRuntime,
  type RuntimeCatalogFamily,
  type SpecRuntimeFamily,
} from "./runtime-mode";

// The agent mode reads a different model catalog than the API mode does —
// captain serves that as the mode's own `catalogProvider`. It is the only axis
// that narrows a family's model list: a per-model list of runtimes it can run on
// was never served, so filtering on one filtered nothing.
const claudeFamily: SpecRuntimeFamily = {
  id: "claude",
  label: "Claude",
  provider: "anthropic",
  modes: [
    { id: "agent", label: "Agent", provider: "anthropic-local" },
    { id: "cmux", label: "cmux" },
  ],
};

const models: ChatModel[] = [
  {
    id: "claude-sonnet-agent",
    provider: "anthropic-local",
    label: "Sonnet Agent",
    reasoning: true,
  },
  {
    id: "claude-opus-cmux",
    provider: "anthropic",
    label: "Opus cmux",
    reasoning: true,
  },
  {
    id: "gpt-codex-agent",
    provider: "openai",
    label: "GPT Codex",
    reasoning: true,
  },
];

describe("runtime model filtering", () => {
  it("lists the catalog the selected mode reads, not the family's default", () => {
    expect(
      modelsForFamily(models, claudeFamily, "agent").map((model) => model.id),
    ).toEqual(["claude-sonnet-agent"]);

    // cmux declares no catalog of its own, so it falls back to the family's.
    expect(
      modelsForFamily(models, claudeFamily, "cmux").map((model) => model.id),
    ).toEqual(["claude-opus-cmux"]);
  });

  it("invalidates a selected model the mode's catalog does not list", () => {
    expect(
      modelBelongsToFamily("claude-opus-cmux", models, claudeFamily, "agent"),
    ).toBe(false);
    expect(
      modelBelongsToFamily(
        "claude-sonnet-agent",
        models,
        claudeFamily,
        "agent",
      ),
    ).toBe(true);
    expect(
      modelBelongsToFamily("gpt-codex-agent", models, claudeFamily, "agent"),
    ).toBe(false);
  });

  it("uses the model provider to disambiguate a mode served by two families", () => {
    expect(
      selectionForRuntime(
        SPEC_RUNTIME_FAMILIES,
        "agent",
        "gpt-codex-agent",
        models,
      ),
    ).toEqual({
      family: "codex",
      mode: "agent",
    });
  });

  it("uses a canonical provider/model id when the host has no model catalog", () => {
    expect(
      familyForModel(SPEC_RUNTIME_FAMILIES, [], "anthropic/claude-sonnet-5")
        ?.id,
    ).toBe("claude");
  });

  it("matches a runtime family's catalog prefix without a model catalog", () => {
    const families = familiesFromRuntimeCatalog([
      {
        family: "gemini",
        provider: "google",
        catalogPrefix: "googleai",
        modes: [{ mode: "api", schema: { type: "object", properties: {} } }],
      },
    ]);

    expect(
      familyForModel(families, [], "api:googleai/gemini-3.5-flash")?.id,
    ).toBe("gemini");
  });
});

// The served catalog captain projects from its model registry. Claude carries
// all four modes on one provider — the split into a separate "Anthropic" family
// only ever existed in the hardcoded default.
const emptyRuntimeSchema = { type: "object" as const, properties: {} };

const servedCatalog: RuntimeCatalogFamily[] = [
  {
    family: "claude",
    provider: "anthropic",
    catalogPrefix: "anthropic",
    modes: [
      {
        mode: "api",
        kind: "api",
        schema: emptyRuntimeSchema,
      },
      {
        mode: "agent",
        kind: "cli",
        permissions: {
          modes: {
            default: { kind: "native", effects: {} },
            plan: {
              kind: "approximated",
              effects: { note: "Maps to read-only planning." },
            },
            bypassPermissions: {
              kind: "unsupported",
              effects: { note: "The runtime cannot bypass approvals." },
            },
          },
          toolPolicies: {},
          resources: {},
          tools: ["Read", "Write"],
        },
        schema: {
          type: "object",
          properties: {
            permissions: {
              type: "object",
              properties: { mode: { type: "string" } },
            },
          },
        },
      },
      {
        mode: "cli",
        kind: "cli",
        schema: emptyRuntimeSchema,
      },
      {
        mode: "cmux",
        kind: "cli",
        keyless: true,
        disabled: true,
        disabledReason: "mode cmux",
        availability: {
          state: "disabled",
          reason: "Disabled by mode cmux in Captain configuration.",
          remediation: "Enable mode cmux on the Whoami page, then refresh.",
        },
        schema: emptyRuntimeSchema,
      },
    ],
  },
  {
    family: "gemini",
    provider: "google",
    catalogPrefix: "googleai",
    modes: [
      {
        mode: "api",
        kind: "api",
        schema: emptyRuntimeSchema,
      },
    ],
  },
  {
    family: "deepseek",
    provider: "deepseek",
    catalogPrefix: "deepseek",
    modes: [
      {
        mode: "api",
        kind: "api",
        disabled: true,
        disabledReason: "provider deepseek",
        availability: {
          state: "disabled",
          reason: "Disabled by provider deepseek in Captain configuration.",
          remediation:
            "Enable provider deepseek on the Whoami page, then refresh.",
        },
        schema: emptyRuntimeSchema,
      },
    ],
  },
];

describe("familiesFromRuntimeCatalog", () => {
  it("collapses a provider's modes into one family and retains disabled entries", () => {
    const families = familiesFromRuntimeCatalog(servedCatalog);

    expect(families.map((family) => family.id)).toEqual([
      "claude",
      "gemini",
      "deepseek",
    ]);
    const claude = families[0]!;
    expect(claude.modes.map((mode) => mode.id)).toEqual([
      "api",
      "agent",
      "cli",
      "cmux",
    ]);
    expect(claude.modes[3]!.availability).toEqual({
      state: "disabled",
      reason: "Disabled by mode cmux in Captain configuration.",
      remediation: "Enable mode cmux on the Whoami page, then refresh.",
    });
    // Model rows carry the canonical provider key. The separate catalog prefix
    // only namespaces fully-qualified model ids.
    const gemini = families[1]!;
    expect(gemini.provider).toBe("google");
    expect(
      modelsForFamily(
        [{ id: "gemini-live", provider: "google", configured: true }],
        gemini,
      ).map((model) => model.id),
    ).toEqual(["gemini-live"]);
  });

  it("derives labels from ids without a served label field", () => {
    const claude = familiesFromRuntimeCatalog(servedCatalog)[0]!;

    expect(claude.label).toBe("Claude");
    expect(claude.modes.map((mode) => mode.label)).toEqual([
      "API",
      "Agent",
      "CLI",
      "cmux",
    ]);
    expect(claude.modes[0]!.title).toBe("Claude API");
    expect(
      familiesFromRuntimeCatalog([
        {
          family: "deepseek",
          provider: "deepseek",
          catalogPrefix: "deepseek",
          modes: [{ mode: "api", schema: emptyRuntimeSchema }],
        },
      ])[0]!.label,
    ).toBe("DeepSeek");
  });

  it("falls back to the offline default when the host serves nothing", () => {
    expect(familiesFromRuntimeCatalog(undefined)).toBe(SPEC_RUNTIME_FAMILIES);
    expect(familiesFromRuntimeCatalog([])).toBe(SPEC_RUNTIME_FAMILIES);
  });

  it("keeps a mode resolvable after the collapse", () => {
    const families = familiesFromRuntimeCatalog(servedCatalog);

    expect(selectionForMode(families, "api", "claude")).toEqual({
      family: "claude",
      mode: "api",
    });
    expect(selectionForMode(families, "cli", "claude")).toEqual({
      family: "claude",
      mode: "cli",
    });
  });

  it("preserves Captain permission capabilities on each runtime mode", () => {
    const agent = familiesFromRuntimeCatalog(servedCatalog)[0]!.modes[1]!;

    expect(agent.permissions?.modes.plan).toEqual({
      kind: "approximated",
      effects: { note: "Maps to read-only planning." },
    });
    expect(agent.permissions?.modes.bypassPermissions?.kind).toBe(
      "unsupported",
    );
    expect(agent.schema?.properties?.permissions).toEqual({
      type: "object",
      properties: { mode: { type: "string" } },
    });
    expect(agent.permissions?.tools).toEqual(["Read", "Write"]);
  });
});
