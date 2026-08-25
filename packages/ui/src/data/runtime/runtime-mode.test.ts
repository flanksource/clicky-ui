import { describe, expect, it } from "vitest";
import type { ChatModel } from "../chat/types";
import {
  SPEC_RUNTIME_FAMILIES,
  familiesFromRuntimeCatalog,
  modelBelongsToFamily,
  modelsForFamily,
  selectionForBackend,
  type RuntimeCatalogFamily,
  type SpecRuntimeFamily,
} from "./runtime-mode";

const claudeFamily: SpecRuntimeFamily = {
  id: "claude",
  label: "Claude",
  provider: "anthropic",
  modes: [
    { id: "agent", label: "Agent", backend: "claude-agent" },
    { id: "cmux", label: "cmux", backend: "claude-cmux" },
  ],
};

const models: ChatModel[] = [
  {
    id: "claude-sonnet-agent",
    provider: "anthropic",
    label: "Sonnet Agent",
    reasoning: true,
    backends: ["claude-agent"],
  },
  {
    id: "claude-opus-cmux",
    provider: "anthropic",
    label: "Opus cmux",
    reasoning: true,
    backends: ["claude-cmux"],
  },
  {
    id: "claude-haiku-shared",
    provider: "anthropic",
    label: "Haiku Shared",
    reasoning: true,
  },
  {
    id: "gpt-codex-agent",
    provider: "openai",
    label: "GPT Codex",
    reasoning: true,
    backends: ["codex-agent"],
  },
];

describe("runtime model filtering", () => {
  it("filters models by provider family and selected backend", () => {
    expect(
      modelsForFamily(models, claudeFamily, "claude-agent").map(
        (model) => model.id,
      ),
    ).toEqual(["claude-sonnet-agent", "claude-haiku-shared"]);

    expect(
      modelsForFamily(models, claudeFamily, "claude-cmux").map(
        (model) => model.id,
      ),
    ).toEqual(["claude-opus-cmux", "claude-haiku-shared"]);
  });

  it("invalidates selected models that belong to a different backend", () => {
    expect(
      modelBelongsToFamily(
        "claude-opus-cmux",
        models,
        claudeFamily,
        "claude-agent",
      ),
    ).toBe(false);
    expect(
      modelBelongsToFamily(
        "claude-haiku-shared",
        models,
        claudeFamily,
        "claude-agent",
      ),
    ).toBe(true);
    expect(
      modelBelongsToFamily(
        "gpt-codex-agent",
        models,
        claudeFamily,
        "claude-agent",
      ),
    ).toBe(false);
  });

  it("includes codex-agent in the default runtime family catalog", () => {
    expect(selectionForBackend(SPEC_RUNTIME_FAMILIES, "codex-agent")).toEqual({
      family: "codex",
      mode: "agent",
    });
  });
});

// The served catalog captain projects from its model registry. Claude carries
// all four modes on one provider — the split into a separate "Anthropic" family
// only ever existed in the hardcoded default.
const servedCatalog: RuntimeCatalogFamily[] = [
  {
    family: "claude",
    provider: "anthropic",
    catalogPrefix: "anthropic",
    modes: [
      { mode: "api", backend: "anthropic", kind: "api" },
      {
        mode: "agent",
        backend: "claude-agent",
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
              effects: { note: "The backend cannot bypass approvals." },
            },
          },
          toolPolicies: {},
          resources: {},
        },
      },
      { mode: "cli", backend: "claude-cli", kind: "cli" },
      {
        mode: "cmux",
        backend: "claude-cmux",
        kind: "cli",
        keyless: true,
        disabled: true,
        disabledReason: "mode cmux",
        availability: {
          state: "disabled",
          reason: "Disabled by mode cmux in Captain configuration.",
          remediation: "Enable mode cmux on the Whoami page, then refresh.",
        },
      },
    ],
  },
  {
    family: "gemini",
    provider: "google",
    catalogPrefix: "googleai",
    modes: [{ mode: "api", backend: "gemini", kind: "api" }],
  },
  {
    family: "deepseek",
    provider: "deepseek",
    catalogPrefix: "deepseek",
    modes: [
      {
        mode: "api",
        backend: "deepseek",
        kind: "api",
        disabled: true,
        disabledReason: "provider deepseek",
        availability: {
          state: "disabled",
          reason: "Disabled by provider deepseek in Captain configuration.",
          remediation:
            "Enable provider deepseek on the Whoami page, then refresh.",
        },
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
    expect(claude.modes.map((mode) => mode.backend)).toEqual([
      "anthropic",
      "claude-agent",
      "claude-cli",
      "claude-cmux",
    ]);
    expect(claude.modes[3]!.availability).toEqual({
      state: "disabled",
      reason: "Disabled by mode cmux in Captain configuration.",
      remediation: "Enable mode cmux on the Whoami page, then refresh.",
    });
    // The catalog prefix, not the provider key: it is what ChatModel.provider
    // carries, so modelsForFamily can filter on it.
    expect(families[1]!.provider).toBe("googleai");
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
          modes: [{ mode: "api", backend: "deepseek" }],
        },
      ])[0]!.label,
    ).toBe("DeepSeek");
  });

  it("falls back to the offline default when the host serves nothing", () => {
    expect(familiesFromRuntimeCatalog(undefined)).toBe(SPEC_RUNTIME_FAMILIES);
    expect(familiesFromRuntimeCatalog([])).toBe(SPEC_RUNTIME_FAMILIES);
  });

  it("keeps a backend resolvable after the collapse", () => {
    const families = familiesFromRuntimeCatalog(servedCatalog);

    expect(selectionForBackend(families, "anthropic")).toEqual({
      family: "claude",
      mode: "api",
    });
    expect(selectionForBackend(families, "claude-cli")).toEqual({
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
  });
});
