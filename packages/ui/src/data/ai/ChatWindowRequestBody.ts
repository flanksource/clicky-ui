import { serializeContext, type ChatContextItem } from "./context";
import type { ToolMeta } from "./ToolPreferences";
import { appendToolPolicy, type PermissionPolicy } from "../chat/tool-policy";

/** Builds the transport body for one chat turn.
 *
 *  Tool authority goes out as `toolPolicy` — one ordered rule list, surface
 *  rules then the user's — rather than as the flattened per-name map it used to
 *  be. The map could only say what today's tools do; the server appends its own
 *  baselines under this list and evaluates the whole thing last-match-wins, so
 *  what the popover shows and what the request produces are the same reading. */
export function chatWindowRequestBody({
  base,
  contextItems,
  tools,
  surfacePolicy,
  userPolicy,
}: {
  base?: Record<string, unknown> | undefined;
  contextItems: ChatContextItem[];
  tools?: ToolMeta[] | undefined;
  /** What the surface the chat opened on declares. Sent ahead of the user's
   *  rules, so a toggle beats the surface. */
  surfacePolicy?: PermissionPolicy | undefined;
  /** What the user toggled in the preferences popover. */
  userPolicy?: PermissionPolicy | undefined;
}): Record<string, unknown> {
  return {
    ...base,
    ...(contextItems.length ? {
      context: serializeContext(contextItems),
      contextItems,
    } : {}),
    ...(tools
      ? { toolPolicy: appendToolPolicy(surfacePolicy, userPolicy) }
      : {}),
  };
}
