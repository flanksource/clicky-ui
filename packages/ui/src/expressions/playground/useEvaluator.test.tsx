import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEvaluator } from "./useEvaluator.ts";
import type { EvalRequest, EvalResponse } from "./api.ts";

const request: EvalRequest = { language: "gotemplate", source: "{{custom.next}}", input: "source: one" };
const answer: EvalResponse = { result: "issued-1", durationMs: 1 };

describe("useEvaluator explicit execution", () => {
  it("does not evaluate on mount or edits and guards every overlapping run", async () => {
    let finish: ((value: EvalResponse) => void) | undefined;
    const evaluate = vi.fn(() => new Promise<EvalResponse>((resolve) => { finish = resolve; }));
    const beforeRun = vi.fn(async () => true);
    const { result, rerender } = renderHook(
      ({ source }) => useEvaluator("/unused", { ...request, source }, { mode: "explicit", evaluate, beforeRun }),
      { initialProps: { source: request.source } },
    );
    rerender({ source: "{{custom.next}}-changed" });
    expect(evaluate).not.toHaveBeenCalled();
    await act(async () => { void result.current.run(); });
    await waitFor(() => expect(evaluate).toHaveBeenCalledTimes(1));
    await act(async () => { void result.current.run(); });
    expect(beforeRun.mock.calls).toEqual([[[{ ...request, source: "{{custom.next}}-changed" }]]]);
    expect(evaluate).toHaveBeenCalledWith({ ...request, source: "{{custom.next}}-changed" }, expect.any(AbortSignal));
    await act(async () => { finish?.(answer); });
    await waitFor(() => expect(result.current.response).toEqual(answer));
    expect(result.current.autoRun).toBe(false);
  });

  it("is not pending while the run still awaits confirmation", async () => {
    let answer: ((confirmed: boolean) => void) | undefined;
    const beforeRun = vi.fn(() => new Promise<boolean>((resolve) => { answer = resolve; }));
    const evaluate = vi.fn(async () => ({ result: "issued-1", durationMs: 1 }));
    const { result } = renderHook(() => useEvaluator("/unused", request, { mode: "explicit", evaluate, beforeRun }));
    let run: Promise<void> | undefined;
    await act(async () => { run = result.current.run(); });
    expect(result.current.pending).toBe(false);
    await act(async () => { answer?.(false); await run; });
    expect({ pending: result.current.pending, calls: evaluate.mock.calls.length }).toEqual({ pending: false, calls: 0 });
  });

  it("declines a run without evaluating and reports transport failures", async () => {
    const evaluate = vi.fn(async () => { throw new Error("server unavailable"); });
    const beforeRun = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { result } = renderHook(() => useEvaluator("/unused", request, { mode: "explicit", evaluate, beforeRun }));
    await act(async () => { await result.current.run(); });
    expect(evaluate).not.toHaveBeenCalled();
    await act(async () => { await result.current.run(); });
    expect(result.current.response?.error?.message).toContain("server unavailable");
  });
});
