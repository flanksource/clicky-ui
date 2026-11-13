import type { StaticIconComponent } from "../data/Icon";
import { modelProvider } from "../data/chat/ContextMeter.model";
import { providerIcon, providerIconColor } from "../data/chat/provider-icons";
import { UiRobotAi } from "../icons";
import type { CommentAgentRun } from "./comment-types";

/**
 * How far a hand-off to an agent has got, as chat delivery receipts show it:
 * waiting, sent (one tick), or answered (two ticks) once the agent replies in
 * the thread or reports it done. A failed hand-off stays failed.
 */
export type AgentDeliveryStage = "queued" | "sent" | "replied" | "failed";

export function agentDeliveryStage(run: CommentAgentRun): AgentDeliveryStage {
  if (run.state === "error") return "failed";
  if (run.repliedAt || run.state === "done") return "replied";
  return run.state === "sent" ? "sent" : "queued";
}

/** The provider's glyph for an agent's model (or name), and its brand tint; the robot when no provider is known. */
export function agentGlyph(model: string): { icon: StaticIconComponent; className?: string } {
  const provider = modelProvider(model);
  const icon = providerIcon(provider);
  const className = providerIconColor(provider);
  return icon ? { icon, ...(className ? { className } : {}) } : { icon: UiRobotAi };
}
