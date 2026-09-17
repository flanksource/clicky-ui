import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EvalRequest, EvalResponse, PlaygroundSample } from "./api.ts";
import { useSampleRuns, type SampleRunsPayload } from "./useSampleRuns.ts";

const SAMPLES: PlaygroundSample[] = [
  { id: "2", label: "Row 2", input: "source:\n  Gender: F" },
  { id: "3", label: "Row 3", input: "source:\n  Gender: X" },
  { id: "4", label: "Row 4", input: "source: {}" },
];
const SOURCE = '{{ index .source "Gender" }}';
const payload: SampleRunsPayload = { language: "gotemplate", source: SOURCE, samples: SAMPLES };

function requestFor(sample: PlaygroundSample): EvalRequest {
  return { language: "gotemplate", source: SOURCE, input: sample.input };
}

describe("useSampleRuns", () => {
  it("asks once for the whole batch, then evaluates every sample in order", async () => {
    const order: string[] = [];
    const evaluate = vi.fn(async (request: EvalRequest): Promise<EvalResponse> => {
      order.push(request.input ?? "");
      return { result: String(order.length), durationMs: 1 };
    });
    const beforeRun = vi.fn(async () => true);
    const { result } = renderHook(() => useSampleRuns("/unused", payload, { evaluate, beforeRun }));

    await act(async () => { await result.current.run(); });

    expect({
      asked: beforeRun.mock.calls,
      order,
      results: result.current.results.map((entry) => [entry.sample.id, entry.response.result]),
      stale: result.current.stale,
      pending: result.current.pending,
    }).toEqual({
      asked: [[SAMPLES.map(requestFor)]],
      order: SAMPLES.map((sample) => sample.input),
      results: [["2", "1"], ["3", "2"], ["4", "3"]],
      stale: false,
      pending: false,
    });
  });

  it("evaluates nothing when the batch is declined", async () => {
    const evaluate = vi.fn();
    const { result } = renderHook(() => useSampleRuns("/unused", payload, { evaluate, beforeRun: async () => false }));
    await act(async () => { await result.current.run(); });
    expect({ calls: evaluate.mock.calls.length, results: result.current.results, stale: result.current.stale }).toEqual({
      calls: 0,
      results: [],
      stale: true,
    });
  });

  it("records a failing sample as an error result and carries on with the rest", async () => {
    const evaluate = vi.fn(async (request: EvalRequest): Promise<EvalResponse> => {
      if (request.input === SAMPLES[1]!.input) throw new Error("server unavailable");
      return { result: "ok", durationMs: 1 };
    });
    const { result } = renderHook(() => useSampleRuns("/unused", payload, { evaluate }));
    await act(async () => { await result.current.run(); });
    expect(result.current.results.map((entry) => entry.response.error?.message ?? entry.response.result)).toEqual([
      "ok",
      "Error: server unavailable",
      "ok",
    ]);
  });

  it("marks the results stale once the source or the samples change", async () => {
    const evaluate = vi.fn(async (): Promise<EvalResponse> => ({ result: "F", durationMs: 1 }));
    const { result, rerender } = renderHook((props: SampleRunsPayload) => useSampleRuns("/unused", props, { evaluate }), {
      initialProps: payload,
    });
    await act(async () => { await result.current.run(); });
    expect(result.current.stale).toBe(false);

    rerender({ ...payload, source: `${SOURCE} ` });
    expect(result.current.stale).toBe(true);

    rerender({ ...payload, samples: SAMPLES.slice(0, 2) });
    expect(result.current.stale).toBe(true);

    rerender(payload);
    expect(result.current.stale).toBe(false);
  });

  it("ignores a second run while the first is still evaluating", async () => {
    let finish: (() => void) | undefined;
    const evaluate = vi.fn(() => new Promise<EvalResponse>((resolve) => {
      finish = () => resolve({ result: "F", durationMs: 1 });
    }));
    const beforeRun = vi.fn(async () => true);
    const { result } = renderHook(() => useSampleRuns("/unused", { ...payload, samples: SAMPLES.slice(0, 1) }, { evaluate, beforeRun }));

    let first: Promise<void> | undefined;
    await act(async () => { first = result.current.run(); });
    expect({ progress: result.current.progress, stale: result.current.stale }).toEqual({ progress: { done: 0, total: 1 }, stale: false });
    await act(async () => { await result.current.run(); });
    await act(async () => { finish?.(); await first; });

    expect({ asked: beforeRun.mock.calls.length, calls: evaluate.mock.calls.length, progress: result.current.progress }).toEqual({
      asked: 1,
      calls: 1,
      progress: null,
    });
  });
});
