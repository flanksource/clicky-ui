import { useCallback, useEffect, useState } from "react";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";
import { permissionTarget } from "./model";
import type {
  RuntimePermissionCatalogState,
  RuntimeProfilesClient,
} from "./types";

export function useRuntimePermissionCatalog(
  client: RuntimeProfilesClient,
  spec: AISpecRuntimeSpec | undefined,
  families: SpecRuntimeFamily[],
): RuntimePermissionCatalogState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<
    Omit<RuntimePermissionCatalogState, "retry">
  >({ status: "idle" });
  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const target = permissionTarget(spec, families);
  const provider = target?.provider;
  const mode = target?.mode;

  useEffect(() => {
    if (!provider || !mode) {
      setState({ status: "idle" });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading" });
    void client.loadPermissionCatalog({ provider, mode }, controller.signal).then(
      (catalog) => setState({ status: "resolved", catalog }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      },
    );
    return () => controller.abort();
  }, [attempt, client, mode, provider]);

  return { ...state, retry };
}
