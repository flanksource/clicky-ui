import type {
  ResolvedRuntimeProfile,
  RuntimeProfile,
  RuntimeProfileResolveRequest,
} from "@flanksource/clicky-ui/ai";
import type { RuntimeCatalogFamily } from "../../../../packages/ui/src/data/runtime/runtime-mode";
import { request } from "../comments/useComments";

const RUNTIME_PROFILES_ROUTE = "/__playground/runtime-profiles";

export function fetchRuntimeCatalog(): Promise<RuntimeCatalogFamily[]> {
  return request<RuntimeCatalogFamily[]>(`${RUNTIME_PROFILES_ROUTE}/runtimes`);
}

export function resolveRuntimeProfile(
  body: RuntimeProfileResolveRequest,
): Promise<ResolvedRuntimeProfile> {
  return request<ResolvedRuntimeProfile>(`${RUNTIME_PROFILES_ROUTE}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function titleCase(token: string): string {
  return token.charAt(0).toUpperCase() + token.slice(1);
}

/**
 * One profile per available agent-SDK runtime in captain's catalog: only the
 * agent mode can keep one chat session alive and accept follow-up messages.
 */
export function agentRuntimeProfiles(
  catalog: RuntimeCatalogFamily[],
): RuntimeProfile[] {
  return catalog.flatMap((family) =>
    family.modes
      .filter(
        (mode) =>
          mode.mode === "agent" &&
          !mode.disabled &&
          mode.availability?.state === "available" &&
          mode.defaultModel,
      )
      .map((mode) => ({
        id: `${family.family}-agent`,
        name: `${titleCase(family.family)} agent`,
        description: `${mode.defaultModel} through captain's agent runtime`,
        spec: { mode: "agent", model: mode.defaultModel as string },
        presets: [],
      })),
  );
}
