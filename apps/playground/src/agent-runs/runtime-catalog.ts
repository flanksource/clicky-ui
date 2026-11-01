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
 * Captain's catalog narrowed to enabled, available runtimes with a default
 * model, optionally of one `mode` — agent sessions pass `"agent"`, since only
 * the agent SDK keeps one chat session alive for follow-up messages.
 */
export function availableRuntimeCatalog(
  catalog: RuntimeCatalogFamily[],
  { mode: only }: { mode?: string },
): RuntimeCatalogFamily[] {
  return catalog.flatMap((family) => {
    const modes = family.modes.filter(
      (mode) =>
        (only === undefined || mode.mode === only) &&
        !mode.disabled &&
        mode.availability?.state === "available" &&
        mode.defaultModel,
    );
    return modes.length ? [{ ...family, modes }] : [];
  });
}
