import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePrompts, type PromptSnapshot } from "./use-prompts";

const schema = { type: "object" as const, properties: {} };
const todosPrompt: PromptSnapshot = { id: "p-1", title: "Approve the todo run", state: "pending", schema };
const runPrompt: PromptSnapshot = { id: "p-1", title: "Pick the run's connection", state: "pending", schema };

/** One EventSource per stream URL; `emit(url, prompts)` delivers a frame on that stream only. */
function stubStreams() {
  const streams = new Map<string, (prompts: PromptSnapshot[]) => void>();
  class FakeEventSource {
    constructor(private url: string) {}
    addEventListener(_type: string, callback: (event: MessageEvent) => void) {
      streams.set(this.url, (prompts) => callback(new MessageEvent("prompts", { data: JSON.stringify(prompts) })));
    }
    close() {}
  }
  vi.stubGlobal("EventSource", FakeEventSource);
  return (url: string, prompts: PromptSnapshot[]) => act(() => streams.get(url)!(prompts));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePrompts", () => {
  it("drops the previous API's prompts as soon as basePath changes, before the new stream delivers", () => {
    const emit = stubStreams();
    const { result, rerender } = renderHook(({ basePath }) => usePrompts({ basePath }), {
      initialProps: { basePath: "/api/todos" },
    });
    emit("/api/todos/prompts/stream", [todosPrompt]);
    expect(result.current.pending).toEqual([todosPrompt]);

    rerender({ basePath: "/api/runs/r2" });
    expect([result.current.prompts, result.current.pending]).toEqual([[], []]);

    emit("/api/runs/r2/prompts/stream", [runPrompt]);
    expect(result.current.pending).toEqual([runPrompt]);
  });

  it("drops the previous filter's prompts when the filter changes", () => {
    const emit = stubStreams();
    const { result, rerender } = renderHook(({ owner }) => usePrompts({ basePath: "/api/todos", owner }), {
      initialProps: { owner: "run-1" },
    });
    emit("/api/todos/prompts/stream?owner=run-1", [todosPrompt]);
    expect(result.current.prompts).toEqual([todosPrompt]);

    rerender({ owner: "run-2" });
    expect(result.current.prompts).toEqual([]);
  });
});
