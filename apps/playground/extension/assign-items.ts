import type { DropdownMenuItem } from "@flanksource/clicky-ui";
import { shortContextModelName } from "@flanksource/clicky-ui/chat";
import { agentGlyph } from "@flanksource/clicky-ui/comments";
import { UiSliders } from "@flanksource/clicky-ui/icons";
import type { AgentSessionRuntime } from "../plugins/agent-session-store";
import type { AgentSession } from "./gavel-client";

export type AgentAssignOptions = {
  /** The page's delivery session, when one is chosen. */
  session: AgentSession | undefined;
  /** The runtime a new session starts with; `undefined` is gavel's default. */
  runtime: AgentSessionRuntime | undefined;
  /** The thread is no longer open, so gavel will not hand it off. */
  disabled: boolean;
  onSession: () => void;
  onNew: () => void;
  onAdvanced: () => void;
};

/** The agent entries of a thread's Assign… menu: its page's session, a new session with the configured runtime, or one picked for this thread. */
export function agentAssignItems({ session, runtime, disabled, onSession, onNew, onAdvanced }: AgentAssignOptions): DropdownMenuItem[] {
  const model = runtime?.spec.model;
  return [
    ...(session
      ? [{
          label: session.title,
          icon: agentGlyph(session.model ?? session.source).icon,
          title: `Deliver this thread into the page's session ${session.title}`,
          disabled,
          onSelect: onSession,
        }]
      : []),
    {
      label: model ? `New ${shortContextModelName(model)}` : "New session (Gavel's default)",
      icon: agentGlyph(model ?? "").icon,
      title: "Start a new agent session for this thread with the configured runtime",
      disabled,
      onSelect: onNew,
    },
    {
      label: "Advanced…",
      icon: UiSliders,
      title: "Choose the model and settings of a new session for this thread",
      disabled,
      onSelect: onAdvanced,
    },
  ];
}
