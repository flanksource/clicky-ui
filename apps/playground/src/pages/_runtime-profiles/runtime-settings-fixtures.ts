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
  default: "local",
  kinds: [
    {
      kind: "local",
      description: "Run on the Captain host with path policy enforcement.",
      capabilities: ["wrap-command"],
      modes: ["cli", "agent", "cmux"],
    },
    {
      kind: "docker",
      description: "Isolate the run in a disposable container workspace.",
      capabilities: ["wrap-command", "isolate-workspace"],
      modes: ["cli", "agent"],
    },
    {
      kind: "git-agent",
      description: "Dispatch to an enrolled remote Captain agent.",
      capabilities: ["remote-exec", "isolate-workspace"],
      modes: ["agent"],
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
