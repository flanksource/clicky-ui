/**
 * The playground UI over the language support in the root entry.
 *
 * A separate entry because it pulls in React components and Monaco's editor,
 * while a host that only wants highlighting and completion in its own editor
 * needs none of that.
 */
export { ExpressionPlayground } from "./playground/ExpressionPlayground.tsx";
export type {
  ExpressionPlaygroundProps,
  PlaygroundState,
} from "./playground/ExpressionPlayground.tsx";

export { LANGUAGES, SECTIONS, languageById } from "./playground/languages.ts";
export type {
  EvalLanguage,
  PlaygroundLanguage,
} from "./playground/languages.ts";

export {
  DEFAULT_API_BASE,
  evaluate,
  fetchExamples,
  fetchSpec,
} from "./playground/api.ts";
export type {
  EvalError,
  EvalRequest,
  EvalResponse,
  Example,
  PlaygroundSample,
  ResultExpectation,
} from "./playground/api.ts";

export { useEvaluator } from "./playground/useEvaluator.ts";
export type { Evaluator, EvaluatorOptions } from "./playground/useEvaluator.ts";
export { useSampleRuns } from "./playground/useSampleRuns.ts";
export type { SampleResult, SampleRuns, SampleRunsPayload } from "./playground/useSampleRuns.ts";
export { classifySample, nextFailure, tallySamples } from "./playground/sampleOutcome.ts";
export type { SampleOutcome } from "./playground/sampleOutcome.ts";
export { useParsedInput } from "./playground/useParsedInput.ts";
export type { ParsedInput } from "./playground/useParsedInput.ts";
