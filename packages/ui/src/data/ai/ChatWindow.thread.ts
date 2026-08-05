import { useCallback, useEffect, useRef, useState } from "react";
import type { ThreadSource, ThreadSummary } from "./ThreadPicker";

export type ChatThreadSetup = {
  blocked: boolean;
  pending: boolean;
  error?: string;
  retry: () => void;
};

type ChatThreadSetupOptions = {
  threadId: string | null;
  api: string | null;
  source: ThreadSource | undefined;
  onCreated: (threadId: string) => void;
};

export function useChatThreadSetup({
  threadId,
  api,
  source,
  onCreated,
}: ChatThreadSetupOptions): ChatThreadSetup {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string>();
  const request = useRef<Promise<ThreadSummary> | null>(null);
  const onCreatedRef = useRef(onCreated);
  onCreatedRef.current = onCreated;
  const canCreate = Boolean(source?.create || (!source && api));

  useEffect(() => {
    if (threadId || !canCreate) {
      request.current = null;
      setError(undefined);
      return;
    }
    if (!request.current) {
      request.current = source?.create
        ? source.create()
        : createHTTPThread(api as string);
    }
    let active = true;
    request.current
      .then((thread) => {
        if (!active) return;
        const id = thread.id?.trim();
        if (!id) {
          throw new Error("Created chat thread has no id.");
        }
        onCreatedRef.current(id);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => {
      active = false;
    };
  }, [api, attempt, canCreate, source, threadId]);

  const retry = useCallback(() => {
    request.current = null;
    setError(undefined);
    setAttempt((value) => value + 1);
  }, []);
  return {
    blocked: !threadId && canCreate,
    pending: !threadId && canCreate && !error,
    ...(error ? { error } : {}),
    retry,
  };
}

// The thread is created before its first message, so it has nothing to be named
// after yet. The backend names it from that message (or the model names it), and
// an unnamed thread reads as "New Chat" until then — a placeholder title here
// would look like one the user chose and stop the real name from landing.
async function createHTTPThread(api: string): Promise<ThreadSummary> {
  const response = await fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) {
    throw new Error(
      `Creating a chat thread failed with status ${response.status}.`,
    );
  }
  return response.json() as Promise<ThreadSummary>;
}
