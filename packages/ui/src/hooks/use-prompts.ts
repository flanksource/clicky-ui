import { useEffect, useState } from "react";
import type { JsonSchemaObject } from "../components/json-schema-form-types";

// use-prompts is the generic clicky-ui client for the clicky `prompt` manager
// (the Go-side question/elicitation broker). Like use-task-runs it is SSE-first —
// it subscribes to the manager's SSEHandler (event: prompts carrying the full
// filtered listing) and falls back to polling the JSON endpoint. It speaks only
// PromptSnapshot, no app concepts; producers (commit checks, tool approvals, AI
// elicitation) are indistinguishable here.

/** PromptSnapshot mirrors the Go prompt.PromptSnapshot wire shape. */
export interface PromptSnapshot {
  id: string;
  kind?: string;
  title: string;
  description?: string;
  schema: JsonSchemaObject;
  /** pending | answered | cancelled | expired */
  state: string;
  value?: Record<string, unknown>;
  cancelled?: boolean;
  owner?: string;
  labels?: Record<string, string>;
  createdAt?: string;
  resolvedAt?: string;
}

export interface PromptFilter {
  owner?: string | undefined;
  kind?: string | undefined;
  state?: string | undefined;
  labels?: Record<string, string> | undefined;
}

export interface UsePromptsOptions extends PromptFilter {
  /** Base path the prompt API is mounted under, e.g. "/api/todos". */
  basePath?: string | undefined;
  enabled?: boolean | undefined;
  pollMs?: number | undefined;
  forcePoll?: boolean | undefined;
}

export interface UsePromptsResult {
  prompts: PromptSnapshot[];
  /** Pending prompts only (state === "pending"), newest first. */
  pending: PromptSnapshot[];
  status: string;
}

const DEFAULT_BASE = "/api/todos";
const DEFAULT_POLL_MS = 2_000;

function hasEventSource(): boolean {
  return typeof globalThis !== "undefined" && typeof globalThis.EventSource !== "undefined";
}

function filterQuery(filter: PromptFilter): string {
  const params = new URLSearchParams();
  if (filter.owner) params.set("owner", filter.owner);
  if (filter.kind) params.set("kind", filter.kind);
  if (filter.state) params.set("state", filter.state);
  for (const [k, v] of Object.entries(filter.labels ?? {})) params.append("label", `${k}=${v}`);
  return params.toString();
}

/** Resolve a prompt by id with an answer (or cancel it). */
export async function answerPrompt(
  basePath: string,
  id: string,
  answer: { values?: Record<string, unknown>; cancelled?: boolean },
): Promise<void> {
  const res = await fetch(`${basePath}/prompts/${encodeURIComponent(id)}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answer),
  });
  if (!res.ok) {
    throw new Error((await res.text()) || `answer failed: ${res.status}`);
  }
}

// usePrompts subscribes to the filtered prompt listing. The stream has no
// completion terminal — a dashboard stays subscribed to observe new prompts.
export function usePrompts(options: UsePromptsOptions = {}): UsePromptsResult {
  const {
    owner,
    kind,
    state: stateFilter,
    labels,
    basePath = DEFAULT_BASE,
    enabled = true,
    pollMs = DEFAULT_POLL_MS,
    forcePoll = false,
  } = options;

  const [prompts, setPrompts] = useState<PromptSnapshot[]>([]);
  const [status, setStatus] = useState("idle");

  const labelsKey = JSON.stringify(labels ?? {});
  useEffect(() => {
    if (!enabled) return;
    const query = filterQuery({ owner, kind, state: stateFilter, labels });

    if (forcePoll || !hasEventSource()) {
      let stopped = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const tick = async () => {
        try {
          const res = await fetch(`${basePath}/prompts${query ? `?${query}` : ""}`, {
            headers: { Accept: "application/json" },
          });
          if (res.ok) {
            setPrompts((await res.json()) as PromptSnapshot[]);
            setStatus("polling");
          }
        } catch {
          setStatus("connection lost — retrying");
        }
        if (!stopped) timer = setTimeout(tick, pollMs);
      };
      void tick();
      return () => {
        stopped = true;
        if (timer) clearTimeout(timer);
      };
    }

    const es = new EventSource(`${basePath}/prompts/stream${query ? `?${query}` : ""}`);
    setStatus("connected");
    es.addEventListener("prompts", (e) => {
      try {
        setPrompts(JSON.parse((e as MessageEvent).data) as PromptSnapshot[]);
      } catch {
        /* ignore malformed frame */
      }
    });
    es.onerror = () => setStatus("connection lost — retrying");
    return () => es.close();
  }, [owner, kind, stateFilter, labelsKey, basePath, enabled, pollMs, forcePoll]);

  const pending = prompts.filter((p) => p.state === "pending");
  return { prompts, pending, status };
}
