import { useState } from "react";
import type { SessionEvent } from "./SessionViewer.model";
import type { SessionToolDecision } from "./SessionViewer";

export type DecisionHandler = (
  decision: SessionToolDecision,
) => Promise<void> | void;

export type DecisionFields = Omit<SessionToolDecision, "event">;

/** Sends one decision and keeps the refusal on the row that asked, so a
 *  rejected approval never leaves its buttons silently inert. */
export function useDecision(event: SessionEvent, onDecision: DecisionHandler) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = async (fields: DecisionFields) => {
    setBusy(true);
    setError("");
    try {
      await onDecision({ event, ...fields });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, decide };
}
