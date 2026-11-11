import type { ChatModel } from "@flanksource/clicky-ui/chat";
import type { RuntimeCatalogFamily } from "@flanksource/clicky-ui/ai";
import { request } from "../comments/useComments";

const RUNTIME_PROFILES_ROUTE = "/__playground/runtime-profiles";

export function fetchRuntimeCatalog(): Promise<RuntimeCatalogFamily[]> {
  return request<RuntimeCatalogFamily[]>(`${RUNTIME_PROFILES_ROUTE}/runtimes`);
}

export function fetchModelCatalog(): Promise<ChatModel[]> {
  return request<ChatModel[]>(`${RUNTIME_PROFILES_ROUTE}/models`);
}
