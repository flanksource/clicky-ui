import type { AgentSessionGrouping, AgentSessionRuntime } from "../plugins/agent-session-store";
import type { Backend } from "../src/bookmarklet/site-settings";
import { DEFAULT_GROUPING, DEFAULT_SERVERS, sameJson, type EffectiveSettings } from "./settings";

/** The popup form: text fields are strings, and an empty optional field means "not set". An unset runtime is gavel's own default. */
export type Draft = { backend: Backend; server: string; project: string; runtime: AgentSessionRuntime | undefined; grouping: AgentSessionGrouping; session: string; enabled: boolean };

export function draftOf(settings: EffectiveSettings): Draft {
  return { backend: settings.backend, server: settings.server, project: settings.project ?? "", runtime: settings.runtime, grouping: settings.grouping ?? DEFAULT_GROUPING, session: settings.session ?? "", enabled: settings.enabled === true };
}

export function settingsOf(draft: Draft): EffectiveSettings {
  return {
    backend: draft.backend,
    server: draft.server,
    ...(draft.project ? { project: draft.project } : {}),
    ...(draft.runtime ? { runtime: draft.runtime } : {}),
    grouping: draft.grouping,
    ...(draft.session ? { session: draft.session } : {}),
    ...(draft.enabled ? { enabled: true as const } : {}),
  };
}

/** Changing the backend swaps in its default server unless the user already typed another address. */
export function switchBackend(draft: Draft, backend: Backend): Draft {
  return { ...draft, backend, server: draft.server === DEFAULT_SERVERS[draft.backend] ? DEFAULT_SERVERS[backend] : draft.server };
}

/** Whether the form differs from what is saved, ignoring the enabled switch, which applies the moment it is flipped. */
export function hasUnsavedChanges(options: { draft: Draft; saved: Draft }): boolean {
  return !sameJson({ ...options.draft, enabled: false }, { ...options.saved, enabled: false });
}
