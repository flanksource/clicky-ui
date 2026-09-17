import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createOperationsApiClient } from "./apiClient";
import { useSession } from "./useSession";
import { runningSessionFixture, sessionFixture } from "./session-story.fixtures";
import type { SessionInfo } from "./sessionTypes";

const SESSION_ID = "7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b";
const RESTARTED_ID = "9d2f3a5b-4c6e-4f70-9bac-1d2e3f4a5b6c";
const POLL_MS = 15;

type Call = { url: string; method: string };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// fakeServer answers GETs from `sequence` (repeating its last entry) and each
// POST with `onPost`, recording every request the hook makes on the wire.
function fakeServer(sequence: SessionInfo[], onPost: (url: string) => unknown = () => sequence.at(-1)) {
  const calls: Call[] = [];
  let gets = 0;
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "GET";
    calls.push({ url, method });
    if (method === "GET") {
      const body = sequence[Math.min(gets, sequence.length - 1)];
      gets += 1;
      return jsonResponse(body);
    }
    return jsonResponse(onPost(url));
  });
  return { calls, client: createOperationsApiClient({ fetch }) };
}

// One QueryClient per test, shared by every render of that test's hook.
function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const getCount = (calls: Call[]) => calls.filter((call) => call.method === "GET").length;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("useSession refetch", () => {
  it("polls while the session is active and stops once it reaches a terminal state", async () => {
    const running = runningSessionFixture("2026-09-15T10:15:00Z");
    const stopping = { ...running, state: "stopping" as const };
    const stopped = sessionFixture();
    const server = fakeServer([running, stopping, stopped]);

    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: server.client, pollMs: POLL_MS }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.session?.state).toBe("stopped"));
    const settledGets = getCount(server.calls);
    expect(settledGets).toBe(3);
    await delay(POLL_MS * 6);
    expect(getCount(server.calls)).toBe(settledGets);
    expect(server.calls[0]).toEqual({ url: `/api/v1/sessions/${SESSION_ID}`, method: "GET" });
  });

  it("surfaces a response that breaks the session contract as an error", async () => {
    const { client } = fakeServer([{ ...sessionFixture(), state: "paused" } as unknown as SessionInfo]);
    const { result } = renderHook(() => useSession(SESSION_ID, { client, pollMs: POLL_MS }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(String(result.current.error)).toContain('session field "state"');
    expect(result.current.session).toBeUndefined();
  });

  it("stops polling after a read fails", async () => {
    const calls: Call[] = [];
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), method: init?.method ?? "GET" });
      return new Response("session store unavailable", { status: 503 });
    });
    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: createOperationsApiClient({ fetch }), pollMs: POLL_MS }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.error).toBeDefined());
    await delay(POLL_MS * 6);
    expect(getCount(calls)).toBe(1);
  });
});

describe("useSession control races", () => {
  it.each([
    {
      name: "stop",
      act: (session: ReturnType<typeof useSession>) => session.stop(),
      answer: (running: SessionInfo): SessionInfo => ({ ...running, state: "stopping" }),
      read: (session: SessionInfo | undefined) => session?.state,
      expected: "stopping",
    },
    {
      name: "extend",
      act: (session: ReturnType<typeof useSession>) => session.extend(900_000),
      answer: (running: SessionInfo): SessionInfo => ({ ...running, stopAt: "2026-09-15T10:30:00Z" }),
      read: (session: SessionInfo | undefined) => session?.stopAt,
      expected: "2026-09-15T10:30:00Z",
    },
  ])("keeps $name's answer when an older poll lands after it", async ({ act: run, answer, read, expected }) => {
    const running = runningSessionFixture("2026-09-15T10:15:00Z");
    let releaseStalePoll: (() => void) | undefined;
    let gets = 0;
    const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if ((init?.method ?? "GET") !== "GET") return jsonResponse(answer(running));
      gets += 1;
      if (gets === 1) return jsonResponse(running);
      if (gets === 2) {
        await new Promise<void>((resolve) => {
          releaseStalePoll = resolve;
        });
        return jsonResponse(running);
      }
      return new Promise<Response>(() => undefined);
    });
    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: createOperationsApiClient({ fetch }), pollMs: POLL_MS }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(releaseStalePoll).toBeDefined());

    await act(async () => {
      await run(result.current);
    });
    await act(async () => {
      releaseStalePoll?.();
      await delay(POLL_MS * 3);
    });

    expect(read(result.current.session)).toBe(expected);
  });
});

describe("useSession actionError", () => {
  it("holds the last action's failure and clears it when the next action starts", async () => {
    const running = runningSessionFixture("2026-09-15T10:15:00Z");
    let refuse = true;
    const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if ((init?.method ?? "GET") === "GET") return jsonResponse(running);
      if (refuse) return new Response("stop refused: not the owner", { status: 403 });
      return jsonResponse({ ...running, state: "stopping" });
    });
    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: createOperationsApiClient({ fetch }), pollMs: 60_000 }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.session).toBeDefined());
    expect(result.current.actionError).toBeUndefined();

    await act(async () => {
      await expect(result.current.stop()).rejects.toThrow();
    });
    expect(String(result.current.actionError)).toContain("403");

    refuse = false;
    await act(async () => {
      await result.current.stop();
    });
    expect(result.current.actionError).toBeUndefined();
  });

  it("reports a duration refused before any request as the action's failure", async () => {
    const server = fakeServer([runningSessionFixture("2026-09-15T10:15:00Z")]);
    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: server.client, pollMs: 60_000 }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.session).toBeDefined());
    await act(async () => {
      await expect(result.current.extend(0)).rejects.toThrow("positive whole number");
    });
    expect(String(result.current.actionError)).toContain("positive whole number");
  });
});

describe("useSession actions", () => {
  it.each([
    {
      name: "stop",
      act: (session: ReturnType<typeof useSession>) => session.stop(),
      url: `/api/v1/sessions/${SESSION_ID}/stop`,
    },
    {
      name: "extend",
      act: (session: ReturnType<typeof useSession>) => session.extend(900_000),
      url: `/api/v1/sessions/${SESSION_ID}/extend?duration=900000ms`,
    },
    {
      name: "restart",
      act: (session: ReturnType<typeof useSession>) => session.restart({ durationMs: 300_000 }),
      url: `/api/v1/sessions/${SESSION_ID}/restart?duration=300000ms`,
    },
  ])("$name POSTs to $url", async ({ act: run, url }) => {
    const server = fakeServer([sessionFixture({ restartable: true })]);
    const { result } = renderHook(() => useSession(SESSION_ID, { client: server.client }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.session).toBeDefined());

    await act(async () => {
      await run(result.current);
    });
    expect(server.calls.filter((call) => call.method === "POST")).toEqual([{ url, method: "POST" }]);
  });

  it("resolves restart with the new session the server created", async () => {
    const restarted = runningSessionFixture("2026-09-15T11:05:00Z", {
      id: RESTARTED_ID,
      restartOf: SESSION_ID,
    });
    const server = fakeServer([sessionFixture({ restartable: true })], () => restarted);
    const { result } = renderHook(() => useSession(SESSION_ID, { client: server.client }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.session).toBeDefined());

    let created: SessionInfo | undefined;
    await act(async () => {
      created = await result.current.restart({ durationMs: 300_000 });
    });
    expect({ id: created?.id, restartOf: created?.restartOf }).toEqual({
      id: RESTARTED_ID,
      restartOf: SESSION_ID,
    });
    expect(result.current.session?.id).toBe(SESSION_ID);
  });

  it("sends stop's answer straight into the session", async () => {
    const running = runningSessionFixture("2026-09-15T10:15:00Z");
    const server = fakeServer([running], () => ({ ...running, state: "stopping" }));
    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: server.client, pollMs: 60_000 }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.session?.state).toBe("running"));
    await act(async () => {
      await result.current.stop();
    });
    await waitFor(() => expect(result.current.session?.state).toBe("stopping"));
    expect(getCount(server.calls)).toBe(1);
  });

  it("refuses a duration that is not a positive whole number of milliseconds before any request", async () => {
    const server = fakeServer([runningSessionFixture("2026-09-15T10:15:00Z")]);
    const { result } = renderHook(
      () => useSession(SESSION_ID, { client: server.client, pollMs: 60_000 }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.session).toBeDefined());
    await expect(result.current.extend(0)).rejects.toThrow("positive whole number");
    expect(server.calls.filter((call) => call.method === "POST")).toEqual([]);
  });
});
