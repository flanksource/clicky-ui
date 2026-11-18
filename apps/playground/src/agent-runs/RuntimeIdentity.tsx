import { AgentIdentity } from "@flanksource/clicky-ui/chat";
import type { AgentSessionRuntime } from "./agent-runs-api";

export function RuntimeIdentity({ runtime }: { runtime: AgentSessionRuntime }) {
  const { model, provider, effort } = runtime.spec;
  return <AgentIdentity model={model}
    {...(typeof provider === "string" ? { provider } : {})}
    {...(typeof effort === "string" ? { effort } : {})} />;
}
