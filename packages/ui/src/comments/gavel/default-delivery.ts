import type { CommentDefaultDelivery } from "../comment-types";
import { DEFAULT_RUN_PROMPT, type CommentAgentSettings } from "./gavel-delivery";

/**
 * The composer's default-delivery line for a target, from the `agent` and
 * `session` `useGavelAgents` resolves: the live session `gavel edit --session` routes
 * every new human thread to, which takes precedence, else what the comment
 * agent rule delivers to and the settings layer that enabled it. `undefined`
 * while nothing has loaded, `null` when neither delivers comments, so the
 * composer shows nothing until it knows. Pass the result as
 * `CommentConfig.defaultDelivery`.
 */
export function commentDefaultDelivery({ rule, session }: { rule: CommentAgentSettings["agent"] | undefined; session?: string | undefined }): CommentDefaultDelivery | null | undefined {
  if (!rule) return undefined;
  if (session)
    return {
      label: session,
      description: `New comments here are delivered to the live session ${session}, which \`gavel edit --session\` routes every new human thread to ahead of any comment agent rule. Pick a target to send this one elsewhere.`,
    };
  const { agent, provenance } = rule;
  if (agent.enabled !== true) return null;
  const model = typeof agent.spec?.model === "string" ? agent.spec.model : undefined;
  const label = model ?? agent.prompt ?? DEFAULT_RUN_PROMPT;
  const layer = provenance.enabled?.layer;
  return {
    label,
    ...(layer ? { layer } : {}),
    description: `New comments here are delivered to ${label} by the comment agent rule${layer ? ` in ${layer}` : ""}${agent.assign ? ", which also assigns the thread to it" : ""}. Pick a target to send this one elsewhere.`,
  };
}
