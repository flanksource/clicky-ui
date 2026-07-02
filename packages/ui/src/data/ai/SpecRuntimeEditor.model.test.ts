import { describe, expect, it } from "vitest";
import { buildAISpecRuntimePayload } from "./SpecRuntimeEditor.model";

describe("buildAISpecRuntimePayload", () => {
  it("compacts empty fields while preserving nested api spec values", () => {
    expect(
      buildAISpecRuntimePayload({
        model: " anthropic/claude-sonnet-4-5 ",
        id: "anthropic/claude-sonnet-4-5",
        backend: "anthropic",
        temperature: 0,
        effort: "medium",
        noCache: true,
        budget: {
          cost: 0.25,
          maxTokens: 4000,
          maxTurns: 3,
          timeout: "120s",
        },
        prompt: {
          system: "Be precise",
          metadata: { owner: "captain" },
        },
        permissions: {
          mode: "acceptEdits",
          presets: ["edit"],
          tools: {
            Read: "allow",
            Bash: "deny",
            WebSearch: "ask",
            Write: "auto",
          },
          mcp: {
            gavel: "disabled",
            ado: "disabled",
            servers: ["filesystem"],
          },
          plugins: { "/tmp/plugin": "disabled" },
          skills: { "/tmp/skills": "enabled" },
        },
        memory: {
          bare: true,
        },
        setup: {
          cwd: ".",
          baseDir: " .captain/workspaces ",
          dotenv: [".env", " .env.local "],
          envVars: [
            { name: " API_TOKEN ", valueFrom: " secret://captain/token " },
            { name: " CONFIG_VALUE ", valueFrom: "configmap://app/config" },
            { name: " STATIC_VALUE ", value: " inline " },
            { name: "EMPTY" },
            { name: " ", value: "ignored" },
          ],
          checkout: {
            mode: "remote",
            url: " https://github.com/flanksource/clicky-ui.git ",
            path: " /local/path ",
            connection: " github ",
            ref: " main ",
            depth: 1.9,
            worktree: {
              mode: "new",
              prefix: " ai ",
              base: " origin/main ",
              path: " .shell/worktrees/spec-runtime ",
              keep: true,
            },
            dirty: {
              stash: "all",
              since: " origin/main ",
            },
          },
        },
      }),
    ).toEqual({
      spec: {
        model: "anthropic/claude-sonnet-4-5",
        id: "anthropic/claude-sonnet-4-5",
        backend: "anthropic",
        temperature: 0,
        effort: "medium",
        noCache: true,
        budget: {
          cost: 0.25,
          maxTokens: 4000,
          maxTurns: 3,
          timeout: "120s",
        },
        prompt: {
          system: "Be precise",
          metadata: { owner: "captain" },
        },
        permissions: {
          mode: "acceptEdits",
          presets: ["edit"],
          tools: {
            Read: "allow",
            Bash: "deny",
            WebSearch: "ask",
            Write: "auto",
          },
          mcp: {
            gavel: "disabled",
            ado: "disabled",
            servers: ["filesystem"],
          },
          plugins: { "/tmp/plugin": "disabled" },
          skills: { "/tmp/skills": "enabled" },
        },
        memory: {
          bare: true,
        },
        setup: {
          cwd: ".",
          baseDir: ".captain/workspaces",
          dotenv: [".env", ".env.local"],
          envVars: [
            {
              name: "API_TOKEN",
              valueFrom: { secretKeyRef: { name: "captain", key: "token" } },
            },
            {
              name: "CONFIG_VALUE",
              valueFrom: { configMapKeyRef: { name: "app", key: "config" } },
            },
            { name: "STATIC_VALUE", value: "inline" },
          ],
          checkout: {
            mode: "remote",
            url: "https://github.com/flanksource/clicky-ui.git",
            path: "/local/path",
            connection: "github",
            ref: "main",
            depth: 1,
            worktree: {
              mode: "new",
              prefix: "ai",
              base: "origin/main",
              path: ".shell/worktrees/spec-runtime",
              keep: true,
            },
            dirty: {
              stash: "all",
              since: "origin/main",
            },
          },
        },
      },
    });
  });

  it("only emits keep for new worktrees", () => {
    expect(
      buildAISpecRuntimePayload({
        setup: {
          checkout: {
            worktree: {
              mode: "existing",
              path: ".shell/worktrees/existing",
              keep: true,
            },
          },
        },
      }),
    ).toEqual({
      spec: {
        setup: {
          checkout: {
            worktree: {
              mode: "existing",
              path: ".shell/worktrees/existing",
            },
          },
        },
      },
    });
  });

  it("accepts legacy tool/plugin/skill inputs and emits policy maps", () => {
    expect(
      buildAISpecRuntimePayload({
        permissions: {
          tools: {
            allow: ["Read"],
            deny: ["Bash"],
            modes: {
              Edit: "ask",
              Write: "enabled",
            },
          },
          plugins: ["/tmp/plugin"],
        },
        memory: {
          skills: ["/tmp/skills"],
        },
      }),
    ).toEqual({
      spec: {
        permissions: {
          tools: {
            Read: "allow",
            Bash: "deny",
            Edit: "ask",
            Write: "auto",
          },
          plugins: { "/tmp/plugin": "enabled" },
          skills: { "/tmp/skills": "enabled" },
        },
      },
    });
  });

  it("omits empty setup and local workflow sections", () => {
    expect(
      buildAISpecRuntimePayload({
        setup: {
          cwd: "",
          baseDir: "",
          dotenv: [""],
          envVars: [{ name: "EMPTY" }],
          checkout: {
            mode: "none",
            depth: 0,
            worktree: { mode: "none", keep: false },
            dirty: { stash: "none", staged: false },
          },
        },
        workflow: {
          verify: { commands: [""], scope: "", maxIterations: 0, gavel: false },
          finalize: {
            commit: false,
            commitMessage: "",
            dryRun: false,
            keepWorktree: false,
          },
        },
      }),
    ).toEqual({});
  });
});
