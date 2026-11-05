import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useDocumentSource } from "./useDocumentSource";
import { normalizeErrorDiagnostics } from "@flanksource/clicky-ui";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("retains the repository response diagnostics for the document's error wrapper", async () => {
  const body = "<html>Workspace server offline</html>";
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status: 503, headers: { "Content-Type": "text/html" } })));
  const { result } = renderHook(() => useDocumentSource("document:repo/guide.md"));
  await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  expect(normalizeErrorDiagnostics(result.current.error)).toMatchObject({ details: [{ label: "Response", value: body }], context: expect.arrayContaining([["Status", "503"]]) });
  expect(result.current.ready).toBe(false);
});

it("clears a disconnected watch error when a new lease reconciles the document", async () => {
  const streams: WatchStream[] = [];
  class WatchStream extends EventTarget {
    onerror: (() => void) | null = null;
    constructor() {
      super();
      streams.push(this);
    }
    close() {}
  }
  const repository = { id: "repo", name: "repo", root: "/repo", folders: [] };
  const file = {
    root: "/repo",
    path: "guide.md",
    source: "original",
    revision: "one",
  };
  let acquired = 0;
  vi.stubGlobal("EventSource", WatchStream);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      let value: unknown;
      if (url.includes("/documents/target"))
        value = { repository, path: file.path };
      else if (url.includes("/workspace/file?")) value = file;
      else if (init?.method === "DELETE") value = { released: true };
      else if (url.endsWith("/watch"))
        value = {
          id: String(++acquired),
          file,
          expires: new Date(Date.now() + 60_000).toISOString(),
          idleMilliseconds: 60_000,
        };
      else throw new Error(`Unexpected document request: ${url}`);
      return new Response(JSON.stringify(value), {
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  const { result } = renderHook(() =>
    useDocumentSource("document:repo/guide.md"),
  );
  await waitFor(() => expect(result.current.live).toBe("Live updates active"));
  act(() => streams[0]!.onerror!());
  expect(result.current.error).toBe("The file event stream disconnected");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  await waitFor(() => expect(streams).toHaveLength(2));
  expect(result.current).toMatchObject({
    live: "Live updates active",
    error: null,
    draft: "original",
  });
});
