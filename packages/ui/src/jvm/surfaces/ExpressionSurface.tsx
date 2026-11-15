import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "../../lib/utils";
import { InlineError } from "../../rpc/InlineError";
import type { ObjectGraphNode } from "../../data/ObjectGraph";
import { BUILT_IN_EXPRESSION_PRESETS, ognlExpressionForNode, pushExpressionHistory, type ExpressionLanguage, type ExpressionPreset } from "../model/expressions";
import { EvaluationResult } from "../ognl/EvaluationResult";
import { ExpressionConsole } from "../ognl/ExpressionConsole";
import { expressionHistoryStorageKey, useExpressionHistory } from "../ognl/use-expression-history";
import type { JvmEvaluation } from "../protocol/types";
import { MutationGate } from "../safety/MutationGate";
import { mutationAllowed } from "../safety/mutation-allowed";
import { useJvm, useJvmStatus } from "./jvm-context";

/** URL-shaped selection the host persists (search params, router state, …). */
export type ExpressionSurfaceState = { language?: ExpressionLanguage; expression?: string };

export type ExpressionSurfaceProps = {
  state: ExpressionSurfaceState;
  onStateChange: (next: ExpressionSurfaceState) => void;
  /** The host lets this operator run code in the JVM. Default true. */
  canMutate?: boolean;
  /** Ask the operator to opt in before running code. Default true. */
  requireConsent?: boolean;
  /** Host presets shown after the built-in generic ones. */
  presets?: ExpressionPreset[];
  /** Keeps the expression history in localStorage under this key (e.g. the agent id). Omit to keep it in memory only. */
  historyKey?: string;
  className?: string;
};

type Evaluation = { language: ExpressionLanguage; expression: string; loader: string };

/** Evaluate OGNL expressions and Groovy scripts in the JVM in scope, with presets, history, class loader choice and an object-graph result. */
export function ExpressionSurface({ state, onStateChange, canMutate = true, requireConsent = true, presets = [], historyKey, className }: ExpressionSurfaceProps) {
  const { client, keys } = useJvm();
  const status = useJvmStatus();
  const [consent, setConsent] = useState(false);
  const [loader, setLoader] = useState("");
  const language = state.language ?? "ognl";
  const expression = state.expression ?? "";
  const [ognlHistory, setOgnlHistory] = useExpressionHistory(historyKey ? expressionHistoryStorageKey(historyKey, "ognl") : undefined);
  const [groovyHistory, setGroovyHistory] = useExpressionHistory(historyKey ? expressionHistoryStorageKey(historyKey, "groovy") : undefined);
  const [history, setHistory] = language === "ognl" ? [ognlHistory, setOgnlHistory] : [groovyHistory, setGroovyHistory];
  const loaders = useQuery({ queryKey: keys.classLoaders, queryFn: ({ signal }) => client.classLoaders({ signal }), staleTime: 60_000 });

  const run = useMutation<JvmEvaluation, Error, Evaluation>({
    mutationFn: ({ language: target, expression: source, loader: hash }) =>
      target === "ognl" ? client.evaluateOgnl({ expression: source, ...(hash ? { loader: hash } : {}) }) : client.evaluateGroovy({ source, ...(hash ? { loader: hash } : {}) }),
    onSuccess: (_evaluation, evaluated) => setHistory(pushExpressionHistory(history, evaluated.expression)),
  });

  const gate = { runtime: status.data?.allowMutation, permitted: canMutate, consent, requireConsent };
  const evaluate = (next: Evaluation) => run.mutate(next);
  const drill = (node: ObjectGraphNode) => {
    if (!node.path || run.variables?.language !== "ognl") return;
    const drilled = ognlExpressionForNode(run.variables.expression, node);
    onStateChange({ ...state, expression: drilled });
    evaluate({ language: "ognl", expression: drilled, loader: run.variables.loader });
  };
  const allPresets = useMemo(() => [...BUILT_IN_EXPRESSION_PRESETS, ...presets], [presets]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded border border-border", className)}>
      <section aria-label="Console" className="shrink-0 border-b border-border p-3">
        <ExpressionConsole
          language={language}
          onLanguageChange={(next) => {
            run.reset();
            onStateChange({ language: next });
          }}
          expression={expression}
          onExpressionChange={(next) => onStateChange({ ...state, expression: next })}
          presets={allPresets}
          history={history}
          onHistoryChange={setHistory}
          canRun={mutationAllowed(gate)}
          running={run.isPending}
          onRun={() => evaluate({ language, expression, loader })}
          {...(loaders.data ? { loaders: { options: loaders.data, value: loader, onChange: setLoader } } : {})}
          toolbar={
            <div className="flex flex-col gap-1">
              <MutationGate {...gate} label="Allow running code in this JVM" onConsentChange={setConsent} />
              {loaders.error ? <InlineError title="Class loaders unavailable" error={loaders.error} /> : null}
            </div>
          }
        />
      </section>
      <section aria-label="Result" className="min-h-0 flex-1 overflow-auto p-3">
        <EvaluationResult
          pending={run.isPending}
          error={run.error}
          {...(run.data ? { evaluation: run.data } : {})}
          {...(run.variables?.language === "ognl" ? { onSelectNode: drill } : {})}
        />
      </section>
    </div>
  );
}
