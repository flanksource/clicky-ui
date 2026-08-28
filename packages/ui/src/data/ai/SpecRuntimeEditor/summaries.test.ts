import { describe, expect, it } from "vitest";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  buildPermissionCatalog,
  specPermissionEntries,
} from "./permissions-model";
import {
  summarizeCLIArgs,
  summarizeCommit,
  summarizeEnvironment,
  summarizeModel,
  summarizePermissions,
  summarizePrompt,
  summarizeTarget,
  summarizeVerify,
  summarizeWorkspace,
} from "./summaries";

// Mirrors the storybook INITIAL_VALUE so summaries match the design copy.
const VALUE: AISpecRuntimeValue = {
  model: "anthropic/claude-sonnet-4-5",
  effort: "medium",
  temperature: 0.2,
  budget: { cost: 0.5, maxTokens: 8000, maxTurns: 6, timeout: "30m" },
  prompt: {
    user: "Update the editor.",
    system: "Answer directly.",
    appendSystem: "Prefer primitives.",
  },
  permissions: {
    tools: { Read: "allow", Bash: "deny", Write: "deny" },
    mcp: { gavel: "disabled", ado: "disabled", servers: ["filesystem"] },
  },
  setup: {
    envVars: [
      { name: "CAPTAIN_RUNTIME", value: "storybook" },
      { name: "API_KEY", valueFrom: "secret://captain-api/anthropicKey" },
      { name: "GAVEL_TOKEN", valueFrom: "secret://github/token" },
      { name: "WS", valueFrom: "configmap://captain-runtime/workspace" },
    ],
    checkout: {
      mode: "remote",
      url: "https://github.com/flanksource/clicky-ui.git",
      ref: "main",
      worktree: { mode: "new", prefix: "ai" },
    },
  },
  workflow: {
    verify: {
      fixture: "- [ ] passes",
      scope: "changed",
      maxIterations: 2,
    },
    commits: [{ on: "run" }],
  },
};

describe("summaries", () => {
  it("summarizes the model line with catalog labels", () => {
    expect(
      summarizeModel(VALUE, [
        { id: "anthropic/claude-sonnet-4-5", label: "Sonnet 4.5" },
      ]),
    ).toBe("Sonnet 4.5 · medium");
    // Temperature rides along in the spec but is not part of the runtime line.
    expect(summarizeModel(VALUE)).toBe("anthropic/claude-sonnet-4-5 · medium");
    expect(summarizeModel({})).toBe("Default model");
  });

  it("counts prompt overrides", () => {
    expect(summarizePrompt(VALUE)).toBe("3 overrides set");
    expect(summarizePrompt({ prompt: { user: "hi" } })).toBe("1 override set");
    expect(summarizePrompt({})).toBe("Base prompt only");
  });

  it("summarizes workspace checkout and worktree", () => {
    expect(summarizeWorkspace(VALUE)).toBe("remote · main · new worktree");
    expect(summarizeWorkspace({})).toBe("No checkout");
    expect(summarizeWorkspace({ setup: { checkout: { path: "/repo" } } })).toBe(
      "local · in-place",
    );
  });

  it("summarizes permissions with denied and off counts", () => {
    const entries = specPermissionEntries(
      VALUE,
      buildPermissionCatalog(
        {
          tools: [
            { id: "Read", group: "Files" },
            { id: "Write", group: "Files" },
            { id: "Bash", group: "Shell" },
          ],
          mcp: [
            { id: "filesystem", group: "MCP" },
            { id: "gavel", group: "MCP" },
            { id: "ado", group: "MCP" },
          ],
        },
        [],
      ),
    );
    expect(summarizePermissions(VALUE, entries)).toBe("2 denied · 2 off");
    expect(summarizePermissions({}, [])).toBe("No overrides");
  });

  it("summarizes environment variables and secrets", () => {
    expect(summarizeEnvironment(VALUE)).toBe("4 vars · 2 secret");
    expect(summarizeEnvironment({})).toBe("No variables");
    expect(
      summarizeEnvironment({ setup: { envVars: [{ name: "A", value: "1" }] } }),
    ).toBe("1 var");
  });

  it("summarizes verify fixtures", () => {
    expect(summarizeVerify(VALUE)).toBe(
      "Fixture · changed files · 2 iterations",
    );
    expect(summarizeVerify({})).toBe("No fixture");
    expect(
      summarizeVerify({ workflow: { verify: { fixture: "- [ ] ok" } } }),
    ).toBe("Fixture");
  });

  it("summarizes commit intent", () => {
    expect(summarizeCommit(VALUE)).toBe("Commit changes");
    expect(summarizeCommit({})).toBe("Leave uncommitted");
    expect(summarizeCommit({ workflow: { commits: [] } })).toBe(
      "Leave uncommitted",
    );
    // A stanza with no phase commits at the end of the run, so it reads the same
    // as an explicit {on: "run"} — dry run is a qualifier, not a replacement.
    expect(summarizeCommit({ workflow: { commits: [{ dryRun: true }] } })).toBe(
      "Commit changes · dry run",
    );
    expect(summarizeCommit({ workflow: { commits: [{ on: "turn" }] } })).toBe(
      "Commit every turn",
    );
  });

  it("summarizes cli args by set-flag count", () => {
    expect(summarizeCLIArgs({})).toBe("Defaults");
    expect(
      summarizeCLIArgs({
        cliArgs: { sandbox: "read-only", config: [], safeMode: false },
      }),
    ).toBe("1 flag set");
  });

  it("derives the target chip from the checkout", () => {
    expect(summarizeTarget(VALUE)).toBe("clicky-ui · main");
    expect(summarizeTarget({})).toBeUndefined();
    expect(
      summarizeTarget({ setup: { checkout: { path: "/repos/captain" } } }),
    ).toBe("captain");
  });
});
