// ── Unified session message schema (captain pkg/session) ─────────────────────
// The canonical session model GET /api/captain/sessions/{id} serves: each
// Message carries typed content Parts (text, reasoning, tool, file) plus an
// optional transcript Provenance. Mirrors github.com/flanksource/captain
// pkg/session {Message, Part, Provenance}. The viewer normalizes these into the
// same SessionEvent rows as the legacy SessionEntry log (see SessionViewer.model).

/** Transcript fields the AI SDK part shape lacks; rides on a message. */
export interface SessionProvenance {
  timestamp?: string;
  cwd?: string;
  /** "claude" or "codex". */
  source?: string;
  model?: string;
  reasoningEffort?: string;
  gitBranch?: string;
  uuid?: string;
  parentUuid?: string;
  sessionId?: string;
  agentId?: string;
  /** Set on a synthetic assistant message written when an API request failed. */
  apiErrorStatus?: number;
}

/** One content block of a Message (AI SDK v6 UIPart + tool fields). */
export interface SessionUIPart {
  /** "text" | "reasoning" | "file" | "dynamic-tool" | "tool-<name>". */
  type: string;
  text?: string;
  mediaType?: string;
  url?: string;
  filename?: string;
  toolName?: string;
  toolCallId?: string;
  state?: string;
  /** Already-parsed JSON (the server embeds it, not a string). */
  input?: unknown;
  output?: unknown;
  approval?: SessionApproval;
  pending?: boolean;
}

/** One message in a session (AI SDK v6 UIMessage + provenance). */
export interface SessionUIMessage {
  id?: string;
  role: string;
  parts: SessionUIPart[];
  turnId?: string;
  provenance?: SessionProvenance;
  raw?: unknown;
}

export interface SessionApproval {
  id: string;
  pending?: boolean;
  approved?: boolean;
  reason?: string;
}

export interface SessionGitState {
  branch?: string;
  commit?: string;
  worktree?: string;
  diff?: string;
}

export interface SessionUsage {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  totalTokens?: number;
}

export interface SessionCost extends SessionUsage {
  model?: string;
  inputCost?: number;
  outputCost?: number;
  reasoningCost?: number;
  cacheReadCost?: number;
  cacheWriteCost?: number;
}

export interface SessionContext {
  usedTokens?: number;
  windowTokens?: number;
  freePercent: number;
}

export interface SessionBudget {
  used?: number;
  total?: number;
  remaining?: number;
  updatedAt?: string;
}

export interface SessionCapabilities {
  tools?: string[];
  pendingMcpServers?: string[];
  agents?: string[];
  skills?: string[];
}

export interface SessionMetadataEvent {
  type: string;
  scope?: string;
  turnId?: string;
  timestamp?: string;
  uuid?: string;
  data?: Record<string, unknown>;
}

export interface SessionTurn {
  id: string;
  index: number;
  startedAt?: string;
  endedAt?: string;
  stopReason?: string;
  model?: string;
  messageIds?: string[];
  usage?: Record<string, unknown>;
  cost?: Record<string, unknown>;
  context?: SessionContext;
  budget?: SessionBudget;
  events?: SessionMetadataEvent[];
}

export interface SessionAgent {
  id?: string;
  parentId?: string;
  type?: string;
  desc?: string;
  isRoot?: boolean;
  historyFile?: string;
  children?: SessionAgent[];
  usage?: SessionUsage;
  cost?: SessionCost;
}

export interface SessionChangedFiles {
  read?: string[];
  written?: string[];
}

export interface SessionPlanEvent {
  kind: "enter" | "exit" | "write" | "denied" | string;
  timestamp?: string;
  reason?: string;
}

export interface SessionPlan {
  path?: string;
  slug?: string;
  content?: string;
  explicit?: boolean;
  events?: SessionPlanEvent[];
}

export interface SessionDenial {
  toolUseId?: string;
  tool?: string;
  reason?: string;
}

export interface SessionApprovalStats {
  approved?: number;
  denied?: number;
  denials?: SessionDenial[];
}

export interface SessionHealth {
  kind: string;
  severity: string;
  message: string;
}

export interface SessionLiveProcess {
  pid?: number;
  status?: string;
  active: boolean;
  cpuPercent?: number;
  memoryPercent?: number;
  startedAt?: string;
  cwd?: string;
  command?: string;
}

export interface UnifiedSessionInput {
  id?: string;
  source?: string;
  project?: string;
  cwd?: string;
  slug?: string;
  version?: string;
  provider?: string;
  model?: string;
  historyFile?: string;
  git?: SessionGitState;
  startedAt?: string;
  endedAt?: string;
  usage?: SessionUsage;
  cost?: SessionCost;
  toolCosts?: SessionCost[];
  messages?: SessionUIMessage[];
  turns?: SessionTurn[];
  capabilities?: SessionCapabilities;
  budget?: SessionBudget;
  context?: SessionContext;
  events?: SessionMetadataEvent[];
  root?: SessionAgent;
  agents?: SessionAgent[];
  files?: SessionChangedFiles;
  plan?: SessionPlan;
  approvals?: SessionApprovalStats;
  health?: SessionHealth[];
  live?: SessionLiveProcess;
  prompt?: unknown;
}
