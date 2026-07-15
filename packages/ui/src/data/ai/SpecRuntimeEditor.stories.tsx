import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../components/SecretKeySelector";
import { MOCK_MODELS } from "../chat/Chat.fixtures";
import type { ToolMeta } from "../chat/types";
import { SpecRuntimeEditor } from "./SpecRuntimeEditor";
import {
  buildAISpecRuntimePayload,
  type AISpecRuntimePermissionCatalog,
  type AISpecRuntimeValue,
} from "./SpecRuntimeEditor.model";

const SAMPLE_TOOLS: ToolMeta[] = [
  {
    name: "Read",
    label: "Read",
    group: "Files",
    defaultMode: "ask",
    description: "Read files from the workspace.",
  },
  {
    name: "Edit",
    label: "Edit",
    group: "Files",
    defaultMode: "ask",
    description: "Apply targeted file edits.",
  },
  {
    name: "Write",
    label: "Write",
    group: "Files",
    defaultMode: "ask",
    description: "Write a new file.",
  },
  {
    name: "Bash",
    label: "Bash",
    group: "Shell",
    defaultMode: "ask",
    description: "Run a shell command.",
  },
  {
    name: "WebSearch",
    label: "Web search",
    group: "Web",
    defaultMode: "disabled",
    description: "Search the web.",
  },
];

const PERMISSION_CATALOG: AISpecRuntimePermissionCatalog = {
  mcp: [
    {
      id: "filesystem",
      label: "filesystem",
      group: "MCP",
      source: "workspace",
      sourcePath: "$CWD/.mcp.json",
    },
    {
      id: "gavel",
      label: "gavel",
      group: "MCP",
      source: "workspace",
      sourcePath: "$CWD/.mcp.json",
    },
    {
      id: "ado",
      label: "ado",
      group: "MCP",
      source: "user",
      sourcePath: "$HOME/.claude.json",
    },
  ],
  plugins: [
    {
      id: "/Users/moshe/.codex/plugins/captain",
      label: "captain",
      group: "Plugins",
      source: "codex",
      sourcePath: "/Users/moshe/.codex/plugins/captain",
    },
  ],
  skills: [
    {
      id: "$CWD/.skills",
      label: "$CWD/.skills",
      group: "Skills",
      source: "workspace",
      sourcePath: "/repo/captain/.skills",
    },
    {
      id: "/Users/moshe/.agents/skills/gavel-runner",
      label: "gavel-runner",
      group: "Skills",
      source: "user",
      sourcePath: "/Users/moshe/.agents/skills/gavel-runner",
    },
  ],
};

const SECRET_RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [
    { name: "captain-api", keys: ["token", "anthropicKey", "openaiKey"] },
    { name: "github", keys: ["token", "sshPrivateKey"] },
  ],
  configmap: [
    { name: "captain-runtime", keys: ["surface", "workspace", "featureFlag"] },
    { name: "gavel", keys: ["profile", "baseUrl"] },
  ],
};

const SECRET_PREVIEWS: Record<string, KeyPreview[]> = {
  "secret/captain-api": [
    { key: "token", value: "cap_••••••••" },
    { key: "anthropicKey", value: "sk-ant-••••" },
    { key: "openaiKey", value: "sk-••••" },
  ],
  "secret/github": [
    { key: "token", value: "ghp_••••••••" },
    { key: "sshPrivateKey", value: "-----BEGIN ••••" },
  ],
  "configmap/captain-runtime": [
    { key: "surface", value: "storybook" },
    { key: "workspace", value: "/repo/captain" },
    { key: "featureFlag", value: "runtime-lifecycle" },
  ],
  "configmap/gavel": [
    { key: "profile", value: "local" },
    { key: "baseUrl", value: "http://localhost:5270" },
  ],
};

const loadResources = (kind: SecretKind) =>
  Promise.resolve(SECRET_RESOURCES[kind]);
const loadKeyPreview = (kind: SecretKind, name: string) =>
  Promise.resolve(SECRET_PREVIEWS[`${kind}/${name}`] ?? []);

const INITIAL_VALUE: AISpecRuntimeValue = {
  model: "anthropic/claude-sonnet-4-5",
  effort: "medium",
  temperature: 0.2,
  budget: { cost: 0.5, maxTokens: 8000, maxTurns: 6, timeout: "30m" },
  noCache: true,
  prompt: {
    user: "Update the prompt runtime editor and keep the payload compact.",
    system: "Answer with direct implementation guidance.",
    appendSystem: "Prefer existing clicky-ui primitives.",
    source: "storybook/demo.prompt",
    metadata: { surface: "prompt-workbench", owner: "captain" },
  },
  permissions: {
    mode: "acceptEdits",
    presets: ["edit"],
    tools: {
      Read: "allow",
      Edit: "ask",
      Write: "auto",
      Bash: "deny",
      WebSearch: "ask",
    },
    mcp: {
      gavel: "disabled",
      ado: "disabled",
      servers: ["filesystem", "gavel"],
    },
    plugins: {
      "/Users/moshe/.codex/plugins/captain": "disabled",
    },
    skills: {
      "$CWD/.skills": "enabled",
    },
  },
  memory: {
    skipHooks: true,
  },
  setup: {
    cwd: ".",
    baseDir: ".shell",
    dotenv: [".env", ".env.local"],
    envVars: [
      { name: "CAPTAIN_RUNTIME", value: "storybook" },
      { name: "GAVEL_PROFILE", value: "local" },
      {
        name: "ANTHROPIC_API_KEY",
        valueFrom: "secret://captain-api/anthropicKey",
      },
      {
        name: "CAPTAIN_WORKSPACE",
        valueFrom: "configmap://captain-runtime/workspace",
      },
      { name: "GAVEL_TOKEN", valueFrom: "secret://github/token" },
      { name: "CAPTAIN_MODE", value: "demo" },
    ],
    checkout: {
      mode: "remote",
      url: "https://github.com/flanksource/clicky-ui.git",
      connection: "github",
      ref: "main",
      depth: 1,
      worktree: {
        mode: "new",
        prefix: "ai",
        base: "main",
        path: ".shell/worktrees/spec-runtime-editor",
        keep: true,
      },
      dirty: {
        stash: "all",
        since: "origin/main",
      },
    },
  },
  workflow: {
    verify: {
      commands: [
        "pnpm --filter @flanksource/clicky-ui exec vitest run src/data/ai/SpecRuntimeEditor.model.test.ts",
        "pnpm --filter storybook build",
      ],
      scope: "changed",
      maxIterations: 2,
      gavel: true,
    },
    finalize: {
      commit: true,
      commitMessage: "Update spec runtime editor lifecycle controls",
      dryRun: false,
    },
  },
};

function SpecRuntimeEditorStory() {
  const [value, setValue] = useState<AISpecRuntimeValue>(INITIAL_VALUE);
  const payload = useMemo(() => buildAISpecRuntimePayload(value), [value]);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]">
      <SpecRuntimeEditor
        value={value}
        onChange={setValue}
        models={MOCK_MODELS}
        tools={SAMPLE_TOOLS}
        permissionCatalog={PERMISSION_CATALOG}
        secretSelector={{ loadResources, loadKeyPreview, strict: true }}
      />
      <div className="min-w-0 xl:sticky xl:top-3 xl:self-start">
        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Payload
        </div>
        <pre className="max-h-[calc(100vh-4rem)] min-h-[30rem] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

const meta = {
  title: "AI/SpecRuntimeEditor",
  component: SpecRuntimeEditor,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Reusable editor for captain-style AI run specs with model, prompt, budget, git setup, environment, permissions, and local verification controls.",
      },
    },
  },
  render: () => <SpecRuntimeEditorStory />,
} satisfies Meta<typeof SpecRuntimeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
