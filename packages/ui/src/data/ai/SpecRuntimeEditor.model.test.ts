import { describe, expect, it } from "vitest";
import {
  SPEC_PERMISSION_MODES,
  buildAISpecRuntimePayload,
} from "./SpecRuntimeEditor.model";

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
        fallbacks: [
          {
            model: " gpt-5-codex ",
            backend: " codex-cli ",
            temperature: 0,
            effort: " low ",
            noCache: true,
          },
          { model: " " },
        ],
        sessionId: " sess-1 ",
        budget: {
          cost: 0.25,
          maxTokens: 4000,
          maxTurns: 3,
          timeout: "120s",
        },
        prompt: {
          system: "Be precise",
          schemaJSON:
            '{"type":"object","properties":{"ok":{"type":"boolean"}}}',
          schemaStrictness: "retry",
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
        fallbacks: [
          {
            model: "gpt-5-codex",
            backend: "codex-cli",
            temperature: 0,
            effort: "low",
            noCache: true,
          },
        ],
        sessionId: "sess-1",
        budget: {
          cost: 0.25,
          maxTokens: 4000,
          maxTurns: 3,
          timeout: "120s",
        },
        prompt: {
          system: "Be precise",
          schemaJSON: {
            type: "object",
            properties: { ok: { type: "boolean" } },
          },
          schemaStrictness: "retry",
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

  it("does not emit legacy skipSkills memory flags", () => {
    expect(
      buildAISpecRuntimePayload({
        memory: {
          skipSkills: true,
          skipHooks: true,
        },
      }),
    ).toEqual({
      spec: {
        memory: {
          skipHooks: true,
        },
      },
    });
  });

  it("passes cliArgs through and drops empty maps", () => {
    const cliArgs = { sandbox: "workspace-write", config: ["a=b"] };
    expect(buildAISpecRuntimePayload({ cliArgs })).toEqual({
      spec: { cliArgs },
    });
    expect(buildAISpecRuntimePayload({ cliArgs: {} })).toEqual({});
  });

  it("emits the dontAsk permission mode", () => {
    expect(SPEC_PERMISSION_MODES).toContain("dontAsk");
    expect(
      buildAISpecRuntimePayload({ permissions: { mode: "dontAsk" } }),
    ).toEqual({ spec: { permissions: { mode: "dontAsk" } } });
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
            dirty: { stash: "none" },
          },
        },
        workflow: {
          verify: { fixture: "", scope: "", maxIterations: 0 },
          commits: [],
        },
      }),
    ).toEqual({});
  });

  it("emits the verify and commit workflow into the spec", () => {
    expect(
      buildAISpecRuntimePayload({
        workflow: {
          verify: {
            fixture: " ## Acceptance\n- works ",
            scope: "changed",
            maxIterations: 2.9,
          },
          commits: [
            {
              on: "turn",
              message: " Apply AI changes ",
              squash: false,
              dryRun: false,
            },
          ],
        },
      }),
    ).toEqual({
      spec: {
        workflow: {
          verify: {
            fixture: "## Acceptance\n- works",
            scope: "changed",
            maxIterations: 2,
          },
          // squash survives as false — it is the instruction to keep the fixup
          // chain, unlike dryRun where absent and false mean the same thing.
          commits: [{ on: "turn", message: "Apply AI changes", squash: false }],
        },
      },
    });
  });

  // A stanza carrying nothing but defaults is still an instruction to commit, so
  // it must survive compaction; only an empty list means "commit nothing".
  it("keeps a defaults-only commit stanza", () => {
    expect(buildAISpecRuntimePayload({ workflow: { commits: [{}] } })).toEqual({
      spec: { workflow: { commits: [{}] } },
    });
  });

  it("drops fields that are not owned by the editor surface", () => {
    expect(
      buildAISpecRuntimePayload({
        prompt: {
          user: "hi",
          source: "demo.prompt",
          metadata: { owner: "captain" },
        },
        setup: {
          checkout: {
            dirty: {
              stash: "all",
              staged: true,
              unstaged: true,
              untracked: true,
            },
          },
        },
        workflow: {
          verify: {
            commands: ["pnpm test"],
            fixture: "- [ ] passes",
          },
          commits: [{ on: "run", keepWorktree: true }],
        },
      } as any),
    ).toEqual({
      spec: {
        prompt: { user: "hi" },
        setup: { checkout: { dirty: { stash: "all" } } },
        workflow: {
          verify: { fixture: "- [ ] passes" },
          commits: [{ on: "run" }],
        },
      },
    });
  });
});
