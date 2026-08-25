import { describe, expect, it } from "vitest";
import {
  assertRuntimePresetSpec,
  duplicateName,
  projectRuntimePresetSpec,
  referencedBy,
  reorderProfilePresets,
} from "./model";
import type { RuntimeProfileRecord } from "./contract";

const PROFILE: RuntimeProfileRecord = {
  id: "profile",
  name: "Profile",
  spec: {},
  presets: ["surface-a", "global", "user", "surface-b"],
};

describe("runtime profile model", () => {
  it("accepts reusable runtime behavior and rejects task-specific preset fields", () => {
    expect(() =>
      assertRuntimePresetSpec(
        {
          sandbox: { backend: "git-agent" },
          setup: {
            envVars: [
              {
                name: "API_TOKEN",
                valueFrom: { onePassword: "op://runtime/api/token" },
              },
            ],
            connections: { fromConfigItem: "shared-cloud" },
            checkout: {
              mode: "local",
              depth: 1,
              worktree: {
                mode: "new",
                keep: true,
                uncommitted: "clone",
                ignored: "skip",
              },
            },
          },
        },
        "preset.spec",
      ),
    ).not.toThrow();

    for (const [spec, path] of [
      [{ prompt: { user: "Review this" } }, "preset.spec.prompt"],
      [{ workflow: { verify: { fixture: "passes" } } }, "preset.spec.workflow"],
      [{ setup: { cwd: "." } }, "preset.spec.setup.cwd"],
      [
        { setup: { checkout: { url: "https://example.com/repo.git" } } },
        "preset.spec.setup.checkout.url",
      ],
      [
        { setup: { checkout: { worktree: { path: ".worktrees/run" } } } },
        "preset.spec.setup.checkout.worktree.path",
      ],
    ] as const) {
      expect(() =>
        assertRuntimePresetSpec(spec as never, "preset.spec"),
      ).toThrow(`runtime preset field "${path}" is not allowed`);
    }
  });

  it("projects editor output onto the reusable preset contract", () => {
    expect(
      projectRuntimePresetSpec({
        model: "openai/gpt-5.6-sol",
        prompt: { user: "task-specific prompt" },
        setup: {
          cwd: ".",
          envVars: [{ name: "LOG_LEVEL", value: "debug" }],
          checkout: {
            mode: "local",
            path: "/workspace/clicky-ui",
            ref: "main",
            since: "origin/main",
            depth: 1,
            worktree: {
              mode: "new",
              path: ".worktrees/run",
              keep: true,
              ignored: "skip",
            },
          },
        },
        workflow: { verify: { fixture: "passes" } },
      }),
    ).toEqual({
      model: "openai/gpt-5.6-sol",
      setup: {
        envVars: [{ name: "LOG_LEVEL", value: "debug" }],
        checkout: {
          mode: "local",
          depth: 1,
          worktree: { mode: "new", keep: true, ignored: "skip" },
        },
      },
    });
  });

  it("reorders the selected preset references directly", () => {
    expect(reorderProfilePresets(PROFILE, 0, 3).presets).toEqual([
      "global",
      "user",
      "surface-b",
      "surface-a",
    ]);
  });

  it("reports references and generates a case-insensitively unique copy name", () => {
    expect(referencedBy("surface-a", [PROFILE])).toEqual(["Profile"]);
    expect(
      duplicateName("Surface A", ["surface a copy", "SURFACE A COPY 2"]),
    ).toBe("Surface A copy 3");
  });
});
