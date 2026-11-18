import type { ObjectGraphNode } from "../../data/object-graph-nodes";
import type { JvmEvaluation } from "../protocol/types";

export type ExpressionLanguage = "ognl" | "groovy";

export type ExpressionPreset = {
  label: string;
  expression: string;
  language: ExpressionLanguage;
};

/** Newest-first expressions kept per language. */
export const EXPRESSION_HISTORY_LIMIT = 25;

/** Presets that make sense in any JVM; hosts add their own beside them. */
export const BUILT_IN_EXPRESSION_PRESETS: ExpressionPreset[] = [
  { label: "System properties", expression: "@java.lang.System@getProperties()", language: "ognl" },
  { label: "Runtime", expression: "@java.lang.Runtime@getRuntime()", language: "ognl" },
  { label: "Threads", expression: "@java.lang.Thread@getAllStackTraces().keySet()", language: "ognl" },
];

/** `expression` moved to the front of `history`, without duplicates, capped at the limit. */
export function pushExpressionHistory(history: readonly string[], expression: string): string[] {
  if (!expression.trim()) throw new Error("Cannot record a blank expression in the history");
  return [expression, ...history.filter((entry) => entry !== expression)].slice(0, EXPRESSION_HISTORY_LIMIT);
}

/** The OGNL that evaluates one node of an earlier result: its accessor path applied to the expression that produced it. */
export function ognlExpressionForNode(expression: string, node: Pick<ObjectGraphNode, "path">): string {
  return node.path ? `(${expression})${node.path}` : expression;
}

function assertGraphNode(node: unknown, where: string): asserts node is ObjectGraphNode {
  if (node === null || typeof node !== "object" || Array.isArray(node)) throw new Error(`Invalid object graph: ${where} is not an object`);
  const { id, label, children } = node as Record<string, unknown>;
  if (typeof id !== "string" || typeof label !== "string") throw new Error(`Invalid object graph: ${where} needs a string id and label`);
  if (children === undefined) return;
  if (!Array.isArray(children)) throw new Error(`Invalid object graph: children of ${where} is not an array`);
  children.forEach((child, index) => assertGraphNode(child, `${where}[${index}]`));
}

/** The evaluation's `graph` (typed `unknown` on the wire) as an `ObjectGraphNode`; throws when the agent sent another shape. */
export function evaluationGraph(graph: unknown): ObjectGraphNode | undefined {
  if (graph === undefined) return undefined;
  assertGraphNode(graph, "the root node");
  return graph;
}

/** The result as indented JSON: the plain value, else the graph; empty when the evaluation produced neither. */
export function evaluationRawText(evaluation: Pick<JvmEvaluation, "value" | "graph">): string {
  const result = evaluation.value !== undefined ? evaluation.value : evaluation.graph;
  return result === undefined ? "" : JSON.stringify(result, null, 2);
}
