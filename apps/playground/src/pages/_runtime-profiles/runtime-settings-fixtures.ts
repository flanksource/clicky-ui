import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "@flanksource/clicky-ui";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
} from "@flanksource/clicky-ui/ai";

export const PLAYGROUND_SANDBOX_CATALOG: SpecRuntimeSandboxCatalog = {
  default: "off",
  kinds: [
    {
      kind: "off",
      description: "Disable provider-native restrictions and approval prompts.",
      capabilities: [],
      modes: ["api", "cli", "agent", "cmux"],
    },
    {
      kind: "native",
      description: "Translate the unified policy to provider-native settings.",
      capabilities: ["wrap-command"],
      modes: ["cli", "agent", "cmux"],
    },
    {
      kind: "docker",
      description: "Isolate the run in a disposable container workspace.",
      capabilities: ["wrap-command", "isolate-workspace"],
      modes: ["cli", "agent"],
      backends: [{ name: "local-docker", kind: "docker" }],
    },
    {
      kind: "git-agent",
      description: "Dispatch to an enrolled remote Captain agent.",
      capabilities: ["remote-exec", "isolate-workspace"],
      modes: ["agent"],
      backends: [
        {
          name: "development-agents",
          kind: "git-agent",
          agents: [
            { name: "worker-01", status: "enrolled", dispatchable: true },
          ],
        },
      ],
    },
  ],
};

const SECRET_RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [{ name: "captain-runtime", keys: ["API_TOKEN", "GAVEL_TOKEN"] }],
  configmap: [
    { name: "runtime-defaults", keys: ["LOG_LEVEL", "FEATURE_MODE"] },
  ],
  helm: [{ name: "captain", keys: ["agent.resources.limits.cpu"] }],
};

export const PLAYGROUND_SECRET_SELECTOR: SpecRuntimeSecretSelectorConfig = {
  loadResources: async (kind) => structuredClone(SECRET_RESOURCES[kind]),
  loadKeyPreview: async (kind, name) => keyPreviews(kind, name),
  strict: true,
  allowLiteral: true,
};

function keyPreviews(kind: SecretKind, name: string): KeyPreview[] {
  const resource = SECRET_RESOURCES[kind].find((item) => item.name === name);
  if (!resource) {
    throw new Error(
      `${kind} resource ${JSON.stringify(name)} is not available`,
    );
  }
  return (resource.keys ?? []).map((key) => ({ key, value: "••••" }));
}
