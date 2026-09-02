import { useEffect, useState } from "react";
import type { RuntimePreset, RuntimeProfile } from "../runtime-profile";
import type {
  RuntimeProfileResolutionState,
  RuntimeProfilesClient,
} from "./types";

const EMPTY_PROFILE: RuntimeProfile = {
  id: "empty",
  name: "Empty profile",
  spec: {},
  presets: [],
};

export function useRuntimeProfileResolution(
  client: RuntimeProfilesClient,
  profile: RuntimeProfile | undefined,
  presets: RuntimePreset[],
): RuntimeProfileResolutionState {
  const [state, setState] = useState<RuntimeProfileResolutionState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    const timer = window.setTimeout(() => {
      void client
        .resolve(
          { profile: profile ?? EMPTY_PROFILE, presets },
          controller.signal,
        )
        .then(
          (result) => {
            if (controller.signal.aborted) return;
            setState({ status: "resolved", result });
          },
          (error: unknown) => {
            if (controller.signal.aborted) return;
            setState({
              status: "error",
              error: error instanceof Error ? error.message : String(error),
            });
          },
        );
    }, 150);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [client, presets, profile]);

  return state;
}
