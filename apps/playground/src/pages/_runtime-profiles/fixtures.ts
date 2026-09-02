import type { RuntimePreset, RuntimeProfile } from "@flanksource/clicky-ui/ai";

export const INITIAL_RUNTIME_PRESETS: RuntimePreset[] = [
  {
    id: "organization-defaults",
    name: "Organization defaults",
    description: "Shared model and budget defaults for every run.",
    scope: "global",
    spec: {
      model: "anthropic/claude-sonnet-5",
      mode: "cli",
      effort: "medium",
      budget: { maxTurns: 8, cost: 6 },
      setup: {
        envVars: [
          {
            name: "GAVEL_TOKEN",
            valueFrom: {
              secretKeyRef: { name: "captain-runtime", key: "GAVEL_TOKEN" },
            },
          },
          { name: "LOG_LEVEL", value: "info" },
        ],
      },
    },
  },
  {
    id: "repository-context",
    name: "Repository context",
    description: "Reusable checkout and worktree behavior.",
    scope: "context",
    spec: {
      setup: {
        checkout: {
          mode: "local",
          depth: 1,
          worktree: {
            mode: "new",
            keep: false,
            uncommitted: "clone",
            ignored: "clone",
          },
        },
      },
    },
  },
  {
    id: "plan-mode",
    name: "Plan mode",
    description: "Ask before write operations and use the balanced runtime.",
    scope: "surface",
    spec: {
      model: "anthropic/claude-sonnet-5",
      mode: "cli",
      permissions: { mode: "plan" },
      sandbox: { mode: "native" },
      toolPolicy: [{ name: "*", policy: "auto" }],
    },
  },
  {
    id: "autonomous-coding",
    name: "Autonomous coding",
    description: "Use the strongest runtime and allow routine updates.",
    scope: "surface",
    spec: {
      model: "openai/gpt-5.6-sol",
      effort: "high",
    },
  },
];

export const INITIAL_RUNTIME_PROFILES: RuntimeProfile[] = [
  {
    id: "review-profile",
    name: "Plan and review",
    description: "Organization defaults plus repository and review guardrails.",
    spec: {
      prompt: { user: "Plan the requested change and review the final diff." },
      setup: { cwd: ".", checkout: { path: ".", ref: "HEAD" } },
      workflow: {
        verify: {
          fixture:
            "- [ ] focused tests pass\n- [ ] final diff matches the request",
          scope: "changed",
          maxIterations: 2,
        },
      },
    },
    presets: [
      "organization-defaults",
      "repository-context",
      "autonomous-coding",
      "plan-mode",
    ],
  },
  {
    id: "coding-profile",
    name: "Autonomous coding",
    description: "Focused implementation with repository defaults.",
    spec: {
      prompt: { user: "Implement the requested change in this checkout." },
      setup: { cwd: ".", checkout: { path: ".", ref: "HEAD" } },
      workflow: {
        verify: {
          fixture: "- [ ] focused tests pass\n- [ ] implementation is complete",
          scope: "changed",
          maxIterations: 3,
        },
      },
    },
    presets: [
      "organization-defaults",
      "repository-context",
      "autonomous-coding",
    ],
  },
];
