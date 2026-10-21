import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../components/SecretKeySelector";
import captainPromptSchema from "../../generated/storybook/captain-prompt.schema.json";
import { MOCK_MODELS } from "../chat/Chat.fixtures";
import type { ToolMeta } from "../chat/types";
import { SpecRuntimeEditor } from "./SpecRuntimeEditor";
import { SpecRuntimeBar } from "./SpecRuntimeBar";
import {
  buildAISpecRuntimePayload,
  type AISpecRuntimeCommit,
  type AISpecRuntimeEnvVar,
  type AISpecRuntimePermissionCatalog,
  type AISpecRuntimeValue,
} from "./SpecRuntimeEditor.model";

const SAMPLE_TOOLS: ToolMeta[] = [
  {
    name: "Read",
    label: "Read",
    group: "Files",
    defaultPermission: "ask",
    description: "Read files from the workspace.",
  },
  {
    name: "Edit",
    label: "Edit",
    group: "Files",
    defaultPermission: "ask",
    description: "Apply targeted file edits.",
  },
  {
    name: "Write",
    label: "Write",
    group: "Files",
    defaultPermission: "ask",
    description: "Write a new file.",
  },
  {
    name: "Bash",
    label: "Bash",
    group: "Shell",
    defaultPermission: "ask",
    description: "Run a shell command.",
  },
  {
    name: "WebSearch",
    label: "Web search",
    group: "Web",
    defaultPermission: "off",
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

type CaptainPromptSchemaDocument = {
  backends?: Array<{ backend?: string; args?: JsonSchemaObject }>;
  examples?: {
    spec?: unknown;
  };
};

const captainSchemaDoc = captainPromptSchema as CaptainPromptSchemaDocument;
const CODEX_CMUX_SCHEMA: JsonSchemaObject = captainSchemaDoc.backends?.find(
  (backend) => backend.backend === "codex-cmux",
)?.args ?? { type: "object", properties: {} };
const GENERATED_INITIAL_VALUE = normalizeGeneratedSpec(
  captainSchemaDoc.examples?.spec,
);

const INITIAL_VALUE: AISpecRuntimeValue = {
  ...GENERATED_INITIAL_VALUE,
  model: GENERATED_INITIAL_VALUE.model ?? "anthropic/claude-sonnet-4-5",
  backend: GENERATED_INITIAL_VALUE.backend ?? "cmux",
  effort: GENERATED_INITIAL_VALUE.effort ?? "medium",
  temperature: GENERATED_INITIAL_VALUE.temperature ?? 0.2,
  fallbacks: GENERATED_INITIAL_VALUE.fallbacks ?? [{ model: "gpt-5-codex" }],
  sessionId: GENERATED_INITIAL_VALUE.sessionId ?? "storybook-session",
  budget: GENERATED_INITIAL_VALUE.budget ?? {
    cost: 0.5,
    maxTokens: 8000,
    maxTurns: 6,
    timeout: "30m",
  },
  noCache: GENERATED_INITIAL_VALUE.noCache ?? true,
  prompt: {
    ...GENERATED_INITIAL_VALUE.prompt,
    user: "Update the prompt runtime editor and keep the payload compact.",
    system: "Answer with direct implementation guidance.",
    appendSystem: "Prefer existing clicky-ui primitives.",
    schemaJSON: {
      type: "object",
      properties: { summary: { type: "string" } },
    },
    schemaStrictness: "retry",
  },
  permissions: {
    ...GENERATED_INITIAL_VALUE.permissions,
    mode: "acceptEdits",
    presets: ["edit"],
    tools: {
      ...recordValue(GENERATED_INITIAL_VALUE.permissions?.tools),
      Read: "allow",
      Edit: "ask",
      Write: "auto",
      Bash: "deny",
      WebSearch: "ask",
    } as NonNullable<AISpecRuntimeValue["permissions"]>["tools"],
    mcp: {
      ...recordValue(GENERATED_INITIAL_VALUE.permissions?.mcp),
      gavel: "disabled",
      ado: "disabled",
      servers: ["filesystem", "gavel"],
    } as NonNullable<AISpecRuntimeValue["permissions"]>["mcp"],
    plugins: {
      ...recordValue(GENERATED_INITIAL_VALUE.permissions?.plugins),
      "/Users/moshe/.codex/plugins/captain": "disabled",
    } as NonNullable<AISpecRuntimeValue["permissions"]>["plugins"],
    skills: {
      ...recordValue(GENERATED_INITIAL_VALUE.permissions?.skills),
      "$CWD/.skills": "enabled",
    } as NonNullable<AISpecRuntimeValue["permissions"]>["skills"],
  },
  memory: {
    ...GENERATED_INITIAL_VALUE.memory,
    skipHooks: true,
  },
  sandbox: { mode: "native" },
  setup: {
    ...GENERATED_INITIAL_VALUE.setup,
    cwd: ".",
    baseDir: ".shell",
    dotenv: [".env", ".env.local"],
    envVars: mergeEnvVars(GENERATED_INITIAL_VALUE.setup?.envVars, [
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
    ]),
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
      fixture:
        "- [ ] Model, prompt, workspace, and verify settings are compacted correctly.",
      scope: "changed",
      maxIterations: 2,
    },
    commits: [
      {
        on: "turn",
        message: "Update spec runtime editor lifecycle controls",
      },
    ],
  },
};

function normalizeGeneratedSpec(value: unknown): AISpecRuntimeValue {
  if (!isRecord(value)) return {};
  const spec = { ...value } as AISpecRuntimeValue;
  const setup = isRecord(value.setup) ? { ...value.setup } : undefined;
  if (!setup) return spec;

  const envVars = Array.isArray(setup.envVars)
    ? (setup.envVars as AISpecRuntimeEnvVar[])
    : envStringsToEnvVars(setup.env);
  const normalizedSetup = {
    ...setup,
    ...(envVars.length > 0 ? { envVars } : {}),
  } as AISpecRuntimeValue["setup"] & Record<string, unknown>;
  delete normalizedSetup.env;
  return { ...spec, setup: normalizedSetup };
}

function envStringsToEnvVars(value: unknown): AISpecRuntimeEnvVar[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map(envStringToEnvVar)
    .filter((item) => Boolean(item.name));
}

function envStringToEnvVar(value: string): AISpecRuntimeEnvVar {
  const separator = value.indexOf("=");
  if (separator < 0) return { name: value };
  return {
    name: value.slice(0, separator),
    value: value.slice(separator + 1),
  };
}

function mergeEnvVars(
  base: AISpecRuntimeEnvVar[] | undefined,
  extras: AISpecRuntimeEnvVar[],
): AISpecRuntimeEnvVar[] {
  const byName = new Map<string, AISpecRuntimeEnvVar>();
  for (const item of [...(base ?? []), ...extras]) {
    if (item.name) byName.set(item.name, item);
  }
  return [...byName.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function recordValue(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function SpecRuntimeEditorStory({
  initial = INITIAL_VALUE,
  withFooter = false,
  withCLIOptions = false,
  showPayload = true,
  inheritedCommits,
}: {
  initial?: AISpecRuntimeValue;
  withFooter?: boolean;
  withCLIOptions?: boolean;
  showPayload?: boolean;
  inheritedCommits?: AISpecRuntimeCommit[];
}) {
  const [value, setValue] = useState<AISpecRuntimeValue>(initial);
  const payload = useMemo(() => buildAISpecRuntimePayload(value), [value]);
  const editor = (
    <SpecRuntimeEditor
      value={value}
      onChange={setValue}
      models={MOCK_MODELS}
      beforeSections={
        <SpecRuntimeBar
          value={value}
          onChange={setValue}
          models={MOCK_MODELS}
          inheritedCommits={inheritedCommits}
        />
      }
      tools={SAMPLE_TOOLS}
      permissionCatalog={PERMISSION_CATALOG}
      secretSelector={{ loadResources, loadKeyPreview, strict: true }}
      {...(withCLIOptions ? { cliOptions: { schema: CODEX_CMUX_SCHEMA } } : {})}
      {...(inheritedCommits ? { inheritedCommits } : {})}
      {...(withFooter
        ? {
            onSave: () => {},
            onCancel: () => {},
          }
        : {})}
    />
  );
  if (!showPayload) return editor;
  return (
    <div className="grid gap-4 bg-muted/20 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
      <div className="min-w-0 bg-background">{editor}</div>
      <div className="min-w-0 p-3 xl:sticky xl:top-0 xl:max-h-screen xl:self-start xl:overflow-auto">
        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Payload
        </div>
        <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
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
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Detailed runtime settings composed with a RuntimeBar for identity, effort, permissions, cost, timeout, source, and commit timing.",
      },
    },
  },
  render: () => <SpecRuntimeEditorStory />,
} satisfies Meta<typeof SpecRuntimeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooterActions: Story = {
  render: () => (
    <SpecRuntimeEditorStory withFooter withCLIOptions showPayload={false} />
  ),
};

export const Empty: Story = {
  render: () => <SpecRuntimeEditorStory initial={{}} showPayload={false} />,
};

// Gavel's run dialog opens the editor with an empty value on purpose — only
// what the operator explicitly changes is sent as the request layer, and the
// server layers that request over the lifecycle step's own spec. Without
// telling the editor what that step's spec already declares, the Commit
// section reads "Never" even though the run will in fact commit. This story
// is that exact scenario: an empty value plus the step's inherited policy.
export const EmptyWithInheritedCommit: Story = {
  render: () => (
    <SpecRuntimeEditorStory
      initial={{}}
      showPayload={false}
      inheritedCommits={[{ on: "run", stage: "worktree", gates: "full" }]}
    />
  ),
};
