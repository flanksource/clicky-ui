import { useEffect, useState } from "react";
import { resolveRuntimeProfile } from "./client";
import type {
  ResolvedRuntimeProfile,
  RuntimePreset,
  RuntimeProfileRecord,
} from "./contract";

export type RuntimeProfileResolutionState = {
  status: "loading" | "resolved" | "error";
  result?: ResolvedRuntimeProfile;
  error?: string;
};

export function useRuntimeProfileResolution(
  profile: RuntimeProfileRecord | undefined,
  presets: RuntimePreset[],
): RuntimeProfileResolutionState {
  const [state, setState] = useState<RuntimeProfileResolutionState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    const timer = window.setTimeout(() => {
      void resolveRuntimeProfile(
        {
          profile: profile ?? {
            id: "empty",
            name: "Empty profile",
            spec: {},
            presets: [],
          },
          presets,
        },
        controller.signal,
      ).then(
        (result) => setState({ status: "resolved", result }),
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
  }, [presets, profile]);

  return state;
}
