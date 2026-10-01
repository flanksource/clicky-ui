import { describe, expect, it } from "vitest";
import type { RuntimePreset } from "../runtime-profile";
import { runtimeBarPresetSpec, withRuntimePresetSelection } from "./model";

const CATALOG: RuntimePreset[] = [
  {
    id: "careful",
    name: "Careful",
    scope: "surface",
    spec: {
      effort: "high",
      permissions: { mode: "plan", tools: { shell: "deny" } },
      prompt: { system: "Review carefully" },
      budget: { cost: 5 },
    },
  },
  { id: "quick", name: "Quick", scope: "surface", spec: { effort: "low" } },
];

describe("runtime bar presets", () => {
  it("captures only bar settings, including explicit HEAD and Never", () => {
    expect(
      runtimeBarPresetSpec({
        id: "catalog-id",
        model: "example-model",
        mode: "cli",
        effort: "high",
        budget: { cost: 5, timeout: "30m", maxTurns: 4 },
        permissions: { mode: "plan", tools: { shell: "deny" } },
        setup: {
          cwd: "/workspace",
          checkout: {
            url: "example",
            worktree: { mode: "none", path: "/old", keep: true },
          },
        },
        workflow: { commits: [], verify: { commands: ["check"] } },
        prompt: { user: "Do the work" },
        sessionId: "session",
        temperature: 0.2,
      }),
    ).toEqual({
      id: "catalog-id",
      model: "example-model",
      mode: "cli",
      effort: "high",
      budget: { cost: 5, timeout: "30m" },
      permissions: { mode: "plan" },
      setup: { checkout: { worktree: { mode: "none" } } },
      workflow: { commits: [] },
    });
  });

  it("layers and applies a newly selected preset while preserving other run settings", () => {
    expect(
      withRuntimePresetSelection({
        value: {
          spec: {
            mode: "cli",
            effort: "medium",
            budget: { timeout: "1h" },
            prompt: { user: "Keep this" },
          },
          presets: [],
        },
        selected: ["careful"],
        catalog: CATALOG,
      }),
    ).toEqual({
      spec: {
        mode: "cli",
        effort: "high",
        budget: { cost: 5, timeout: "1h" },
        permissions: { mode: "plan" },
        prompt: { user: "Keep this" },
      },
      presets: ["careful"],
    });
  });

  it("normalizes name references and avoids applying a preset twice", () => {
    expect(
      withRuntimePresetSelection({
        value: { spec: { effort: "medium" }, presets: ["CAREFUL"] },
        selected: ["careful", "careful"],
        catalog: CATALOG,
      }),
    ).toEqual({ spec: { effort: "medium" }, presets: ["careful"] });
  });

  it("retains applied run overrides when removing or reordering layers", () => {
    const value = { spec: { effort: "medium" }, presets: ["careful", "quick"] };
    expect(
      withRuntimePresetSelection({
        value,
        selected: ["quick", "careful"],
        catalog: CATALOG,
      }),
    ).toEqual({ ...value, presets: ["quick", "careful"] });
    expect(
      withRuntimePresetSelection({ value, selected: [], catalog: CATALOG }),
    ).toEqual({ ...value, presets: [] });
  });

  it("does not carry a stale catalog identity when applying a different model", () => {
    expect(
      withRuntimePresetSelection({
        value: {
          spec: { id: "old-id", model: "old-model", mode: "cli" },
          presets: [],
        },
        selected: ["new"],
        catalog: [
          {
            id: "new",
            name: "New",
            scope: "surface",
            spec: { model: "new-model" },
          },
        ],
      }),
    ).toEqual({ spec: { model: "new-model", mode: "cli" }, presets: ["new"] });
  });

  it("rejects adding a reference absent from the catalog", () => {
    expect(() =>
      withRuntimePresetSelection({
        value: { spec: {}, presets: [] },
        selected: ["missing"],
        catalog: CATALOG,
      }),
    ).toThrow('Preset "missing" is not in the catalog');
  });

  it("copies an existing source path and isolates captured commit policies", () => {
    const spec = {
      setup: {
        checkout: {
          worktree: { mode: "existing" as const, path: "/workspace/review" },
        },
      },
      workflow: {
        commits: [{ on: "run" as const, message: "Update configuration" }],
      },
    };
    const captured = runtimeBarPresetSpec(spec);
    expect(captured).toEqual(spec);
    captured.workflow!.commits![0]!.message = "Changed preview";
    expect(spec.workflow.commits[0]!.message).toBe("Update configuration");
  });

  it("clears an existing worktree path when applying HEAD and preserves other setup", () => {
    expect(
      withRuntimePresetSelection({
        value: {
          spec: {
            setup: {
              cwd: "/workspace",
              checkout: { worktree: { mode: "existing", path: "/old" } },
            },
          },
          presets: [],
        },
        selected: ["head"],
        catalog: [
          {
            id: "head",
            name: "HEAD",
            scope: "surface",
            spec: { setup: { checkout: { worktree: { mode: "none" } } } },
          },
        ],
      }),
    ).toEqual({
      spec: {
        setup: { cwd: "/workspace", checkout: { worktree: { mode: "none" } } },
      },
      presets: ["head"],
    });
  });
});
