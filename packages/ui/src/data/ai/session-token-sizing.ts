import type { SessionUsage } from "./SessionViewer.unified";

export interface SessionTokenSize {
  model: string;
  source: "local-estimate" | "provider-estimate" | "provider-count";
  usage: SessionUsage;
  totalTokens: number;
  costUSD?: number;
  coverage: { partial: boolean; framingIncluded: boolean; excluded?: string[] };
}

export interface SessionTokenRowResult {
  rowId: string;
  attributed: boolean;
  size?: SessionTokenSize;
  error?: string;
}

export interface SessionTokenSizingRequest {
  sessionId: string;
  revision?: number;
  rowIds: string[];
  method: "estimate" | "provider";
}

export interface SessionTokenSizingResult {
  sessionId: string;
  revision: number;
  rows: SessionTokenRowResult[];
}

export type SessionTokenSizer = (
  request: SessionTokenSizingRequest,
  signal: AbortSignal,
) => Promise<SessionTokenSizingResult>;
