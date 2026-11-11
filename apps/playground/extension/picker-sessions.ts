import type { AgentPickerSession } from "../src/agent-runs/AgentPicker";
import type { AgentSession } from "./gavel-client";

/** Gavel's live sessions as the picker lists them, plus the remembered `selectedId` when it is no longer live. */
export function pickerSessions(options: { sessions: AgentSession[] | undefined; selectedId: string | undefined }): AgentPickerSession[] {
  const { sessions, selectedId } = options;
  if (!sessions) return [];
  const items: AgentPickerSession[] = sessions.map(session => ({
    id: session.id,
    source: session.source,
    title: session.title,
    ...(session.model ? { model: session.model } : {}),
    ...(session.cwd ? { cwd: session.cwd } : {}),
    ...(session.inCmux ? (session.status ? { status: session.status } : {}) : { status: "not in cmux" }),
  }));
  if (selectedId && !sessions.some(session => session.id === selectedId)) items.push({ id: selectedId, source: "agent", title: `${selectedId} (not live)`, status: "not live" });
  return items;
}
