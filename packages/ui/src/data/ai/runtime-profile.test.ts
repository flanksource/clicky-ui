import { describe, expect, it } from "vitest";
import {
  assertRuntimePresetSpec,
  projectRuntimePresetSpec,
} from "./runtime-profile";

describe("runtime preset specs", () => {
  it("preserves the complete task spec", () => {
    expect(
      projectRuntimePresetSpec({
        mode: "agent",
        prompt: { user: "task prompt" },
        workflow: { verify: { fixture: "task fixture" } },
        sessionId: "thread-id",
        setup: {
          cwd: "/workspace/repo",
          connections: { fromConfigItem: "captain-owned" },
          checkout: {
            mode: "remote",
            url: "https://example.com/repo.git",
            path: "/workspace/repo",
            ref: "main",
            depth: 1,
            worktree: {
              mode: "new",
              path: "/workspace/worktree",
              keep: true,
              uncommitted: "clone",
              ignored: "skip",
            },
          },
        },
      }),
    ).toEqual({
      mode: "agent",
      prompt: { user: "task prompt" },
      workflow: { verify: { fixture: "task fixture" } },
      sessionId: "thread-id",
      setup: {
        cwd: "/workspace/repo",
        connections: { fromConfigItem: "captain-owned" },
        checkout: {
          mode: "remote",
          url: "https://example.com/repo.git",
          path: "/workspace/repo",
          ref: "main",
          depth: 1,
          worktree: {
            mode: "new",
            path: "/workspace/worktree",
            keep: true,
            uncommitted: "clone",
            ignored: "skip",
          },
        },
      },
    });
  });

  it("accepts task-owned fields decoded into a preset payload", () => {
    expect(() =>
      assertRuntimePresetSpec(
        { prompt: { user: "task prompt" } },
        "preset.spec",
      ),
    ).not.toThrow();
  });
});
