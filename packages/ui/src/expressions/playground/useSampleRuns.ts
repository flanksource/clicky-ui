import { useCallback, useEffect, useRef, useState } from "react";
import { evaluate as evaluateRemote, type EvalRequest, type EvalResponse, type PlaygroundSample } from "./api.ts";
import type { EvalLanguage } from "./languages.ts";
import type { EvaluatorOptions } from "./useEvaluator.ts";

export interface SampleRunsPayload {
  language: EvalLanguage;
  source: string;
  samples: PlaygroundSample[];
}

export interface SampleResult {
  sample: PlaygroundSample;
  response: EvalResponse;
}

export interface SampleRuns {
  /** In sample order, growing as each evaluation lands. */
  results: SampleResult[];
  pending: boolean;
  progress: { done: number; total: number } | null;
  /** The source, language or samples changed since the shown results. */
  stale: boolean;
  run: () => Promise<void>;
}

/**
 * Evaluates one expression against every sample, only when asked.
 *
 * Samples run one after another, never in parallel: a host evaluator may call
 * functions with side effects or that hand out generated values, and those
 * must see the samples in the order the author reads them. `beforeRun` sees the
 * whole batch, so a confirmation is asked once rather than per sample.
 */
export function useSampleRuns(
  apiBase: string,
  payload: SampleRunsPayload,
  options: Pick<EvaluatorOptions, "evaluate" | "beforeRun"> = {},
): SampleRuns {
  const [results, setResults] = useState<SampleResult[]>([]);
  const [progress, setProgress] = useState<SampleRuns["progress"]>(null);
  const [evaluated, setEvaluated] = useState<string | null>(null);

  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    const current = payloadRef.current;
    if (!current.source.trim() || current.samples.length === 0) {
      setResults([]);
      setEvaluated(fingerprint(current));
      return;
    }

    runningRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const requests: EvalRequest[] = current.samples.map((sample) => ({
      language: current.language,
      source: current.source,
      input: sample.input,
    }));
    try {
      const { beforeRun, evaluate } = optionsRef.current;
      if (beforeRun && !(await beforeRun(requests))) return;
      const evaluateOne = evaluate ?? ((request: EvalRequest, signal: AbortSignal) => evaluateRemote(apiBase, request, signal));

      // The results shown from here on belong to this payload, so they are
      // current while they arrive and go stale only once it is edited.
      const collected: SampleResult[] = [];
      setResults([]);
      setEvaluated(fingerprint(current));
      setProgress({ done: 0, total: requests.length });
      for (const [index, request] of requests.entries()) {
        let response: EvalResponse;
        try {
          response = await evaluateOne(request, controller.signal);
        } catch (cause) {
          if (controller.signal.aborted) return;
          response = { result: "", durationMs: 0, error: { message: String(cause) } };
        }
        if (controller.signal.aborted) return;
        collected.push({ sample: current.samples[index]!, response });
        setResults([...collected]);
        setProgress({ done: index + 1, total: requests.length });
      }
    } finally {
      runningRef.current = false;
      if (!controller.signal.aborted) setProgress(null);
    }
  }, [apiBase]);

  return {
    results,
    pending: progress !== null,
    progress,
    stale: payload.source.trim() !== "" && evaluated !== fingerprint(payload),
    run,
  };
}

function fingerprint({ language, source, samples }: SampleRunsPayload): string {
  return JSON.stringify([language, source, samples.map((sample) => [sample.id, sample.input])]);
}
