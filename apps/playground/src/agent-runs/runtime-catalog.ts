import type { ChatModel } from "@flanksource/clicky-ui/chat";
import type { RuntimeCatalogFamily } from "../../../../packages/ui/src/data/runtime/runtime-mode";
import { request } from "../comments/useComments";

const RUNTIME_PROFILES_ROUTE = "/__playground/runtime-profiles";

export function fetchRuntimeCatalog(): Promise<RuntimeCatalogFamily[]> {
  return request<RuntimeCatalogFamily[]>(`${RUNTIME_PROFILES_ROUTE}/runtimes`);
}

export function fetchModelCatalog(): Promise<ChatModel[]> {
  return request<ChatModel[]>(`${RUNTIME_PROFILES_ROUTE}/models`);
}

/**
 * Captain's catalog narrowed to available agent-SDK runtimes: only the agent
 * mode can keep one chat session alive and accept follow-up messages.
 */
export function agentRuntimeCatalog(
  catalog: RuntimeCatalogFamily[],
): RuntimeCatalogFamily[] {
  return catalog.flatMap((family) => {
    const modes = family.modes.filter(
      (mode) =>
        mode.mode === "agent" &&
        !mode.disabled &&
        mode.availability?.state === "available" &&
        mode.defaultModel,
    );
    return modes.length ? [{ ...family, modes }] : [];
  });
}
