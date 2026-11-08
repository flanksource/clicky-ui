import type { AgentSelection, JsonValue } from "./schema.ts";

export type DesignEdit =
  | { kind: "delete" }
  | { kind: "style"; prop: "variant" | "role"; value: string }
  | { kind: "text"; prop: string; from: string; to: string }
  | { kind: "attributes"; values: Record<string, string | number | null>; textFrom?: string };
export type DesignWriteRequest = { page: string; source: string; edit: DesignEdit; choose?: string };
export type DesignWriteCandidate = { id: string; file: string; line: number; column: number; context: string };
export type DesignWriteResult =
  | { status: "applied"; file: string; path: string; line: number; hash: string }
  | { status: "stale"; error: string; file: string }
  | { status: "refused"; error: string; reason: string; file: string; line: number; column: number; attribute?: string }
  | { status: "ambiguous"; error: string; candidates: DesignWriteCandidate[] }
  | { status: "invalid"; error: string };
export type DesignHostMessage =
  | { type: "design-override"; requestId: string; source: string; props: Record<string, JsonValue> }
  | { type: "design-write"; requestId: string; page: string; source: string; edit: DesignEdit; choose?: string }
  | { type: "design-write-result"; requestId: string; result: DesignWriteResult };
export type DesignFrameMessage =
  | { type: "design-selection"; selection: AgentSelection; source: string; props: Record<string, JsonValue> }
  | { type: "design-override-result"; requestId: string; source: string; ok: true }
  | { type: "design-override-result"; requestId: string; source: string; ok: false; error: string }
  | { type: "design-write-request"; requestId: string; request: DesignWriteRequest }
  | { type: "design-write-result"; requestId: string; result: DesignWriteResult };
