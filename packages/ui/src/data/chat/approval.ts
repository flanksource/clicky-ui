import type { UIMessage } from "ai";
import type { ChatModelRuntime } from "./types";

export type CaptainChatSession = {
  id: string;
  revision?: number;
  messages: UIMessage[];
  providerSessionId?: string;
  runtime?: ChatModelRuntime;
  forkedFrom?: string;
};

export type ToolApprovalDecision = {
  sessionsApi: string;
  sessionId: string;
  approvalId: string;
  approved: boolean;
  reason?: string;
};

type SessionFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export async function getChatSession(
  sessionsApi: string,
  sessionId: string,
  fetcher: SessionFetch = fetch,
): Promise<CaptainChatSession> {
  if (!sessionId.trim()) {
    throw new Error("A session id is required to load this chat.");
  }
  const response = await fetcher(sessionEndpoint(sessionsApi, sessionId), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw await responseError("Chat session request", response);
  }
  return parseSession(await response.json());
}

export async function forkChatSession(
  sessionsApi: string,
  sessionId: string,
  fetcher: SessionFetch = fetch,
): Promise<CaptainChatSession> {
  if (!sessionId.trim()) {
    throw new Error("A session id is required to fork this chat.");
  }
  const response = await fetcher(
    `${sessionEndpoint(sessionsApi, sessionId)}/fork`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok) {
    throw await responseError("Fork chat session", response);
  }
  return parseSession(await response.json());
}

export async function postToolApproval(
  decision: ToolApprovalDecision,
  fetcher: SessionFetch = fetch,
): Promise<CaptainChatSession> {
  if (!decision.sessionId.trim()) {
    throw new Error("A session id is required to resolve this tool approval.");
  }
  const endpoint = `${sessionEndpoint(
    decision.sessionsApi,
    decision.sessionId,
  )}/approvals/${encodeURIComponent(decision.approvalId)}`;
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      decision.reason
        ? { approved: decision.approved, reason: decision.reason }
        : { approved: decision.approved },
    ),
  });
  if (!response.ok) {
    throw await responseError("Tool approval", response);
  }
  return parseSession(await response.json());
}

function sessionEndpoint(sessionsApi: string, sessionId: string): string {
  return `${stripTrailingSlashes(sessionsApi)}/${encodeURIComponent(sessionId)}`;
}

// Linear scan instead of `.replace(/\/+$/, "")`: the regex backtracks
// polynomially on caller-supplied base URLs with many trailing slashes.
function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end--;
  return value.slice(0, end);
}

function parseSession(value: unknown): CaptainChatSession {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    typeof value.id !== "string"
  ) {
    throw new Error("Captain chat session response is invalid.");
  }
  const messages = "messages" in value ? value.messages : [];
  if (!Array.isArray(messages)) {
    throw new Error("Captain chat session response is invalid.");
  }
  return { ...value, messages } as CaptainChatSession;
}

async function responseError(
  label: string,
  response: Response,
): Promise<Error> {
  const detail = (await response.text()).trim();
  return new Error(
    `${label} failed with status ${response.status}${
      detail ? `: ${detail}` : "."
    }`,
  );
}
