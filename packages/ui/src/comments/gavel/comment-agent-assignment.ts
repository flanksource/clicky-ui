import { shortContextModelName } from "../../data/chat/ContextMeter.model";
import { UiSliders } from "../../icons";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { agentGlyph } from "../agent-delivery";
import type { GavelAgentSession } from "./gavel-delivery";

export function orderedCommentAgentSessions(sessions: readonly GavelAgentSession[]): GavelAgentSession[] {
  return [...sessions.filter(session => session.status !== "ended"), ...sessions.filter(session => session.status === "ended")];
}

export function commentAgentSessionLabel(session: GavelAgentSession): string {
  return session.resumable ? `${session.title} · resumes` : session.title;
}

export type CommentAgentAssignmentOptions = {
  sessions: readonly GavelAgentSession[];
  currentSessionId: string | undefined;
  model?: string | undefined;
  disabled: boolean;
  onSession: (session: GavelAgentSession) => void;
  onNew: () => void;
  onAdvanced: () => void;
};

export function commentAgentAssignmentItems(options: CommentAgentAssignmentOptions): DropdownMenuItem[] {
  const { sessions, currentSessionId, model, disabled, onSession, onNew, onAdvanced } = options;
  return [
    ...orderedCommentAgentSessions(sessions)
      .filter(session => session.id !== currentSessionId)
      .map(session => ({
        label: commentAgentSessionLabel(session),
        icon: agentGlyph(session.model ?? session.source).icon,
        title: session.resumable ? `Resumes the ended session ${session.title} with this thread` : `Deliver this thread into the session ${session.title}`,
        disabled: disabled || (session.status === "ended" && !session.resumable),
        onSelect: () => onSession(session),
      })),
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
