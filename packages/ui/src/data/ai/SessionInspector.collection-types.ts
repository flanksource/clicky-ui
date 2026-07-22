import type { SessionInput } from "./SessionViewer.model";
import type {
  SessionAgent,
  SessionCost,
  SessionTurn,
  SessionUsage,
  UnifiedSessionInput,
} from "./SessionViewer.unified";

export interface SessionCollectionSummary {
  provider?: string;
  backend?: string;
  model?: string;
  effort?: string;
  mode?: string;
  status?: string;
  pid?: number;
  durationMs?: number;
  updatedAt?: string;
  cost?: number;
}

export interface SessionCollectionItem {
  id: string;
  parentId?: string;
  label?: string;
  mode?: string;
  status?: string;
  summary?: SessionCollectionSummary;
  session?: UnifiedSessionInput;
}

export interface SessionCollectionInput {
  kind: "session-collection";
  id: string;
  currentSessionId: string;
  defaultSelectedSessionIds?: string[];
  sessions: SessionCollectionItem[];
  loadSession?: (item: SessionCollectionItem) => Promise<UnifiedSessionInput>;
}

export type SessionInspectorInput = SessionInput | SessionCollectionInput;
export type SessionHierarchyNodeKind = "session" | "agent" | "turn";

export interface SessionHierarchyNode {
  key: string;
  kind: SessionHierarchyNodeKind;
  itemId: string;
  label: string;
  provider: string | undefined;
  model: string | undefined;
  effort: string | undefined;
  mode: string | undefined;
  status: string | undefined;
  pid: number | undefined;
  durationMs: number | undefined;
  updatedAt: string | undefined;
  cost: number | undefined;
  usage: SessionUsage | undefined;
  costDetail: SessionCost | undefined;
  item?: SessionCollectionItem;
  agent?: SessionAgent;
  turn?: SessionTurn;
  children: SessionHierarchyNode[];
}
