import { useCallback, useEffect, useRef, useState } from "react";
import { evaluate, type EvalRequest, type EvalResponse } from "./api.ts";

const AUTO_RUN_STORAGE_KEY = "expressions:auto-run";

/** How long typing settles before an automatic run fires. */
const DEBOUNCE_MS = 250;

export interface Evaluator {
  response: EvalResponse | null;
  /** A request is in flight or a debounce is pending. */
  pending: boolean;
  /** The source or input has changed since the shown result was produced. */
  stale: boolean;
  autoRun: boolean;
  explicit: boolean;
  setAutoRun: (next: boolean) => void;
  /** Evaluates now, skipping the debounce. */
  run: () => Promise<void>;
}

type Payload = Pick<EvalRequest, "language" | "source" | "input">;

export interface EvaluatorOptions {
  mode?: "automatic" | "explicit";
  evaluate?: (request: EvalRequest, signal: AbortSignal) => Promise<EvalResponse>;
  /** Every evaluation a run is about to make; one call covers a whole batch. */
  beforeRun?: (requests: EvalRequest[]) => boolean | Promise<boolean>;
}

/**
 * Runs an expression against the Go evaluator.
 *
 * Automatic evaluation is convenient for a one-line expression and a nuisance
 * for anything longer: a debounce fires mid-keystroke and reports errors for
 * half-written input. So it is a toggle, and an explicit run is always
 * available -- which is also the only way to re-run an expression whose value
 * changes on its own (`time.Now()`, `uuid.V4()`, `random.*`).
 */
export function useEvaluator(apiBase: string, payload: Payload, options: EvaluatorOptions = {}): Evaluator {
  const explicit = options.mode === "explicit";
  const [response, setResponse] = useState<EvalResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [autoRun, setAutoRunState] = useState(readAutoRun);
  const [evaluated, setEvaluated] = useState<Payload | null>(null);

  const abortRef = useRef<AbortController | undefined>(undefined);
  const runningRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  // The current payload, so `run` stays referentially stable: it is wired into
  // a Monaco action registered once at mount, which would otherwise capture the
  // payload from the first render forever.
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const evaluateNow = useCallback(async () => {
    const current = payloadRef.current;
    if (explicit && runningRef.current) return;
    if (!current.source.trim()) {
      if (!explicit) abortRef.current?.abort();
      setResponse(null);
      setEvaluated(current);
      setPending(false);
      return;
    }

    if (!explicit) abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (explicit) runningRef.current = true;
    try {
      // Pending starts once the run is confirmed: while a confirmation is on
      // screen nothing is evaluating, and the result panel must not say so.
      if (optionsRef.current.beforeRun && !(await optionsRef.current.beforeRun([current]))) return;
      setPending(true);
      const next = await (optionsRef.current.evaluate ?? ((request, signal) => evaluate(apiBase, request, signal)))(current, controller.signal);
      if (!controller.signal.aborted) {
        setResponse(next);
        setEvaluated(current);
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setResponse({ result: "", durationMs: 0, error: { message: String(cause) } });
        setEvaluated(current);
      }
    } finally {
      if (abortRef.current === controller) {
        runningRef.current = false;
        setPending(false);
      }
    }
  }, [apiBase, explicit]);

  useEffect(() => {
    if (explicit || !autoRun) return;
    const timer = setTimeout(() => { void evaluateNow(); }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [payload.language, payload.source, payload.input, autoRun, explicit, evaluateNow]);

  // Switching language changes what the source even means, so show nothing
  // rather than the previous language's result.
  useEffect(() => {
    setResponse(null);
    setEvaluated(null);
  }, [payload.language]);

  const setAutoRun = useCallback(
    (next: boolean) => {
      setAutoRunState(next);
      window.localStorage.setItem(AUTO_RUN_STORAGE_KEY, String(next));
      if (next && !explicit) void evaluateNow();
    },
    [evaluateNow, explicit],
  );

  return {
    response,
    pending,
    stale: isStale(evaluated, payload),
    autoRun: explicit ? false : autoRun,
    explicit,
    setAutoRun,
    run: evaluateNow,
  };
}

function isStale(evaluated: Payload | null, current: Payload): boolean {
  if (!current.source.trim()) return false;
  if (!evaluated) return true;
  return (
    evaluated.source !== current.source ||
    evaluated.input !== current.input ||
    evaluated.language !== current.language
  );
}

function readAutoRun(): boolean {
  if (typeof window === "undefined") return true;
  // Default on: the playground should evaluate as soon as it opens.
  return window.localStorage.getItem(AUTO_RUN_STORAGE_KEY) !== "false";
}
