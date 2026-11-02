import type { SearchValues } from "./api";
export const RECEIVER_RUN = "receiver";

/** The source switch's choice: received spans (the receiver run), recorded spans, or a connection. */
export function sourceChoice(value: SearchValues): string {
  const source = value.source ?? "records";
  return source !== "records" ? source : value.run === RECEIVER_RUN ? "received" : "records";
}

