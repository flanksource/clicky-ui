import { useState } from "react";
import { CodeBlock } from "@flanksource/clicky-ui";
import {
  SpecRuntimeEditor,
  buildAISpecRuntimePayload,
  type AISpecRuntimeValue,
  type SpecRuntimeSandboxCatalog,
  type SpecRuntimeSandboxCreateInput,
  type SpecRuntimeSandboxCredential,
} from "@flanksource/clicky-ui/ai";

export const meta = {
  title: "Sandbox runtime editor",
  description:
    "Runtime sandbox parameters and a creation wizard for explicitly exposing host connections",
  group: "AI",
};

const INITIAL_CATALOG: SpecRuntimeSandboxCatalog = {
  default: "local-safe",
  kinds: [
    {
      kind: "none",
      description: "Run directly on the host without sandbox confinement.",
      capabilities: [],
      modes: ["api", "cli", "agent", "cmux"],
    },
    {
      kind: "container",
      description: "Run the agent in an ephemeral container.",
      capabilities: ["wrap-command", "isolate-workspace"],
      modes: ["cli", "agent"],
      configSchema: {
        type: "object",
        required: ["image"],
        properties: {
          image: {
            type: "string",
            title: "Container image",
            default: "ghcr.io/flanksource/captain-agent:latest",
          },
          presets: {
            type: "array",
            title: "Environment presets",
            items: { type: "string" },
          },
        },
      },
    },
    {
      kind: "srt",
      description: "Confine the local command with sandbox-runtime.",
      capabilities: ["wrap-command"],
      modes: ["cli", "agent", "cmux"],
      backends: [{ name: "local-safe", kind: "srt", default: true }],
    },
    {
      kind: "git-agent",
      description: "Dispatch the run to an enrolled remote agent over git.",
      capabilities: ["remote-exec", "isolate-workspace", "egress-proxy"],
      modes: ["cli", "agent", "cmux"],
      configSchema: {
        type: "object",
        properties: {
          waitTimeout: {
            type: "string",
            title: "Wait timeout",
            default: "30m",
          },
        },
      },
    },
  ],
};

const CREDENTIALS: SpecRuntimeSandboxCredential[] = [
  {
    id: "claude-subscription",
    token: "claude",
    label: "Claude Code subscription",
    description:
      "Expose a redacted access-token copy; never the refresh token.",
    category: "AI connections",
    reference: {},
  },
  {
    id: "codex-subscription",
    token: "codex",
    label: "Codex ChatGPT subscription",
    description: "Expose the host login with its refresh token removed.",
    category: "AI connections",
    reference: {},
  },
  {
    id: "github-cli",
    token: "github",
    label: "GitHub CLI login",
    description: "Allow authenticated source and pull-request operations.",
    category: "Developer tools",
    reference: {},
  },
  {
    id: "aws-sandbox",
    token: "aws",
    label: "AWS sandbox profile",
    description: "Use the host's sandbox-dev profile in eu-west-1.",
    category: "Cloud credentials",
    reference: { profile: "sandbox-dev", region: "eu-west-1" },
  },
  {
    id: "aws-production",
    token: "aws",
    label: "AWS production profile",
    description:
      "Production credentials are visible but cannot be exposed here.",
    category: "Cloud credentials",
    reference: { profile: "production" },
    available: false,
    unavailableReason: "Blocked by the playground's sandbox policy.",
  },
];

const INITIAL_VALUE: AISpecRuntimeValue = {
  backend: "claude-code",
  sandbox: {
    backend: "local-safe",
    policy: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 2 },
  },
};

export default function SandboxRuntimePlayground() {
  const [value, setValue] = useState<AISpecRuntimeValue>(INITIAL_VALUE);
  const [catalog, setCatalog] =
    useState<SpecRuntimeSandboxCatalog>(INITIAL_CATALOG);
  const [lastCreated, setLastCreated] =
    useState<SpecRuntimeSandboxCreateInput>();

  const createSandbox = (input: SpecRuntimeSandboxCreateInput) => {
    setCatalog((current) => ({
      ...current,
      ...(input.setDefault ? { default: input.name } : {}),
      kinds: current.kinds?.map((kind) =>
        kind.kind === input.kind
          ? {
              ...kind,
              backends: [
                ...(kind.backends ?? []),
                { name: input.name, kind: input.kind },
              ],
            }
          : kind,
      ),
    }));
    setLastCreated(input);
    return { name: input.name, kind: input.kind };
  };

  return (
    <div className="space-y-density-5">
      <header className="max-w-3xl space-y-density-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sandbox runtime editor
        </h1>
        <p className="text-muted-foreground">
          Choose a configured sandbox for this run, or create one from the
          adapter catalog. Connection choices lower to the backend&apos;s tokens
          map; the UI never receives or persists secret values.
        </p>
      </header>

      <div className="grid items-start gap-density-5 2xl:grid-cols-[minmax(0,1fr)_32rem]">
        <section className="rounded-lg border border-border bg-card">
          <SpecRuntimeEditor
            value={value}
            onChange={setValue}
            sections={["workspace", "sandbox"]}
            sandboxCatalog={catalog}
            sandboxCreate={{
              credentials: CREDENTIALS,
              onCreate: createSandbox,
            }}
            title="Run environment"
            eyebrow="Captain spec"
          />
        </section>

        <aside className="grid gap-density-4 2xl:sticky 2xl:top-density-4">
          <section className="space-y-density-2">
            <h2 className="text-sm font-semibold">Runtime payload</h2>
            <CodeBlock
              language="json"
              source={JSON.stringify(buildAISpecRuntimePayload(value), null, 2)}
              copyable
            />
          </section>
          <section className="space-y-density-2">
            <h2 className="text-sm font-semibold">Last create request</h2>
            {lastCreated ? (
              <CodeBlock
                language="jsonc"
                source={JSON.stringify(lastCreated, null, 2)}
                copyable
              />
            ) : (
              <p className="rounded-md border border-dashed border-border p-density-3 text-sm text-muted-foreground">
                Create a sandbox to inspect the host-owned request. Only
                connection references appear here.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
