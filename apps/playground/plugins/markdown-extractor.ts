import ts from "typescript";

import type { ExtractedGuidance, GuidanceBlock, GuidanceTone } from "./markdown-model";
import {
  isRecord,
  memoryGuidanceHost,
  scalarText,
  StaticModuleGraph,
  type GuidanceHost,
  type ResolvedComponent,
  type StaticBindings,
} from "./markdown-static-evaluator";

export { memoryGuidanceHost };
export type { GuidanceHost };

export type ExtractionResult = {
  guidance: ExtractedGuidance;
  dependencies: string[];
};

type WalkContext = {
  file: string;
  bindings: StaticBindings;
  components: Set<ts.FunctionLikeDeclaration>;
};

const TRANSPARENT_COMPONENTS = new Set(["DesignSystemPage"]);
const GUIDANCE_COMPONENTS = new Set([
  "AnnotatedSpecimen",
  "BestPractice",
  "Callout",
  "DesignSystemPage",
  "GuidanceCatalog",
  "GuidanceList",
  "PracticeGrid",
  "ReviewVariant",
  "SpecimenSection",
  "VariantFrame",
  "table",
]);

export function extractPageGuidance(entryFile: string, host: GuidanceHost): ExtractionResult {
  const graph = new StaticModuleGraph(host);
  const blocks: GuidanceBlock[] = [];
  walkComponent(graph.defaultComponent(entryFile), {}, new Set(), graph, blocks);
  return { guidance: { blocks }, dependencies: [...graph.dependencies] };
}

function walkComponent(
  component: ResolvedComponent,
  props: Record<string, unknown>,
  parents: Set<ts.FunctionLikeDeclaration>,
  graph: StaticModuleGraph,
  blocks: GuidanceBlock[],
) {
  if (parents.has(component.declaration)) {
    throw new Error(`recursive guidance component at ${graph.location(component.file, component.declaration)}`);
  }
  const expression = graph.returnExpression(component.declaration);
  if (!expression) return;
  const components = new Set(parents).add(component.declaration);
  walkNode(expression, { file: component.file, bindings: graph.bindParameters(component.declaration, props), components }, graph, blocks);
}

function walkNode(
  node: ts.Node | undefined,
  context: WalkContext,
  graph: StaticModuleGraph,
  blocks: GuidanceBlock[],
) {
  if (!node) return;
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  ) {
    walkNode(node.expression, context, graph, blocks);
    return;
  }
  if (ts.isJsxElement(node)) {
    const name = tagName(node.openingElement.tagName);
    if (handleRecognized(name, node.openingElement.attributes, node.children, context, graph, blocks)) return;
    if (walkWrappedComponent(name, node.openingElement.attributes, context, graph, blocks)) return;
    for (const child of node.children) walkNode(child, context, graph, blocks);
    return;
  }
  if (ts.isJsxSelfClosingElement(node)) {
    const name = tagName(node.tagName);
    if (handleRecognized(name, node.attributes, [], context, graph, blocks)) return;
    walkWrappedComponent(name, node.attributes, context, graph, blocks);
    return;
  }
  if (ts.isJsxFragment(node)) {
    for (const child of node.children) walkNode(child, context, graph, blocks);
    return;
  }
  if (ts.isJsxExpression(node)) {
    walkExpression(node.expression, context, graph, blocks);
    return;
  }
  if (ts.isConditionalExpression(node)) {
    walkNode(node.whenTrue, context, graph, blocks);
    walkNode(node.whenFalse, context, graph, blocks);
    return;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
    walkNode(node.right, context, graph, blocks);
  }
}

function walkExpression(
  expression: ts.Expression | undefined,
  context: WalkContext,
  graph: StaticModuleGraph,
  blocks: GuidanceBlock[],
) {
  if (!expression) return;
  if (ts.isCallExpression(expression) && ts.isPropertyAccessExpression(expression.expression) && expression.expression.name.text === "map") {
    const values = graph.evaluate(context.file, expression.expression.expression, context.bindings);
    const callback = expression.arguments[0];
    if (!callback || (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))) {
      return;
    }
    if (!Array.isArray(values)) return;
    values.forEach((value, index) => {
      const bindings = new Map(context.bindings);
      bindCallback(callback, [value, index, values], bindings);
      const body = ts.isBlock(callback.body)
        ? callback.body.statements.find(ts.isReturnStatement)?.expression
        : callback.body;
      walkNode(body, { ...context, bindings }, graph, blocks);
    });
    return;
  }
  walkNode(expression, context, graph, blocks);
}

function handleRecognized(
  name: string,
  attributes: ts.JsxAttributes,
  children: readonly ts.JsxChild[],
  context: WalkContext,
  graph: StaticModuleGraph,
  blocks: GuidanceBlock[],
): boolean {
  if (name === "table") {
    const table = extractTable(children, context, graph);
    if (table) blocks.push(table);
    return true;
  }
  if (TRANSPARENT_COMPONENTS.has(name)) {
    for (const child of children) walkNode(child, context, graph, blocks);
    return true;
  }
  if (name === "SpecimenSection") {
    const description = optionalStringProp(name, "description", attributes, context, graph);
    blocks.push({
      kind: "section",
      title: requiredStringProp(name, "title", attributes, context, graph),
      ...(description ? { description } : {}),
    });
    for (const child of children) walkNode(child, context, graph, blocks);
    return true;
  }
  if (name === "PracticeGrid") {
    const practices = requiredArrayProp(name, "practices", attributes, context, graph);
    for (const practice of practices) {
      if (!isRecord(practice)) invalidProp(name, "practices", attributes, context, graph);
      blocks.push({
        kind: "practice",
        tone: guidanceTone(practice.tone),
        title: recordString(practice, "title", name, "practices", attributes, context, graph),
        body: recordString(practice, "body", name, "practices", attributes, context, graph),
      });
    }
    return true;
  }
  if (name === "AnnotatedSpecimen") {
    const notes = requiredArrayProp(name, "notes", attributes, context, graph);
    for (const note of notes) {
      if (!isRecord(note)) invalidProp(name, "notes", attributes, context, graph);
      blocks.push({
        kind: "annotation",
        tone: guidanceTone(note.tone),
        title: recordString(note, "title", name, "notes", attributes, context, graph),
        body: recordString(note, "body", name, "notes", attributes, context, graph),
      });
    }
    return true;
  }
  if (name === "VariantFrame" || name === "ReviewVariant") {
    const selected = optionalBooleanProp(name, "selected", attributes, context, graph);
    blocks.push({
      kind: "variant",
      title: requiredStringProp(name, "title", attributes, context, graph),
      verdict: requiredStringProp(name, "verdict", attributes, context, graph),
      ...(selected ? { selected: true } : {}),
    });
    return true;
  }
  if (name === "BestPractice") {
    blocks.push({
      kind: "practice",
      tone: guidanceTone(optionalValueProp("tone", attributes, context, graph)),
      title: requiredStringProp(name, "title", attributes, context, graph),
      body: requiredStringProp(name, "description", attributes, context, graph),
    });
    return true;
  }
  if (name === "Callout") {
    const title = optionalStringProp(name, "title", attributes, context, graph);
    blocks.push({
      kind: "callout",
      tone: optionalStringProp(name, "variant", attributes, context, graph) ?? "note",
      ...(title ? { title } : {}),
      body: children.map((child) => graph.jsxText(context.file, child, context.bindings)).filter(Boolean).join(" "),
    });
    return true;
  }
  if (name === "GuidanceList") {
    const tone = optionalStringProp(name, "tone", attributes, context, graph);
    if (tone !== "use" && tone !== "avoid") invalidProp(name, "tone", attributes, context, graph);
    const items = requiredArrayProp(name, "items", attributes, context, graph).map(scalarText);
    blocks.push({
      kind: "list",
      title: requiredStringProp(name, "title", attributes, context, graph),
      tone,
      items,
    });
    return true;
  }
  if (name === "GuidanceCatalog") {
    const styles = requiredArrayProp(name, "styles", attributes, context, graph);
    for (const style of styles) {
      if (!isRecord(style)) invalidProp(name, "styles", attributes, context, graph);
      const label = recordString(style, "label", name, "styles", attributes, context, graph);
      const useWhen = style.useWhen;
      const avoidWhen = style.avoidWhen;
      if (!Array.isArray(useWhen) || !Array.isArray(avoidWhen)) {
        invalidProp(name, "styles", attributes, context, graph);
      }
      blocks.push(
        {
          kind: "list",
          title: `${label}: Use when`,
          tone: "use",
          items: useWhen.map(scalarText),
        },
        {
          kind: "list",
          title: `${label}: Avoid when`,
          tone: "avoid",
          items: avoidWhen.map(scalarText),
        },
      );
    }
    return true;
  }
  return false;
}

function walkWrappedComponent(
  name: string,
  attributes: ts.JsxAttributes,
  context: WalkContext,
  graph: StaticModuleGraph,
  blocks: GuidanceBlock[],
): boolean {
  if (!/^[A-Z]/.test(name)) return false;
  const component = graph.resolveComponent(context.file, name);
  if (!component || context.components.has(component.declaration)) return false;
  const props: Record<string, unknown> = {};
  for (const attribute of attributes.properties) {
    if (!ts.isJsxAttribute(attribute)) continue;
    props[jsxAttributeName(attribute.name)] = attributeValue(attribute, context, graph);
  }
  walkComponent(component, props, context.components, graph, blocks);
  return true;
}

function extractTable(
  children: readonly ts.JsxChild[],
  context: WalkContext,
  graph: StaticModuleGraph,
): GuidanceBlock | undefined {
  const rows: string[][] = [];
  const collect = (node: ts.Node | undefined, bindings = context.bindings) => {
    if (!node) return;
    if (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isNonNullExpression(node)
    ) {
      collect(node.expression, bindings);
      return;
    }
    if (ts.isJsxElement(node) && tagName(node.openingElement.tagName) === "tr") {
      rows.push(
        node.children
          .filter((child): child is ts.JsxElement => ts.isJsxElement(child) && ["th", "td"].includes(tagName(child.openingElement.tagName)))
          .map((cell) => cell.children.map((child) => graph.jsxText(context.file, child, bindings)).filter(Boolean).join(" ")),
      );
      return;
    }
    if (ts.isJsxExpression(node) && node.expression && ts.isCallExpression(node.expression)) {
      const call = node.expression;
      if (ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === "map") {
        const values = graph.evaluate(context.file, call.expression.expression, bindings);
        const callback = call.arguments[0];
        if (
          Array.isArray(values) &&
          callback &&
          (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))
        ) {
          values.forEach((value, index) => {
            const next = new Map(bindings);
            bindCallback(callback, [value, index, values], next);
            collect(ts.isBlock(callback.body) ? callback.body.statements.find(ts.isReturnStatement)?.expression : callback.body, next);
          });
        } else if (callback && containsGuidance(callback)) {
          throw new Error(
            `guidance table map must be static at ${graph.location(context.file, call)}`,
          );
        }
        return;
      }
    }
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      for (const child of node.children) collect(child, bindings);
    }
  };
  for (const child of children) collect(child);
  if (rows.length < 2) return undefined;
  return { kind: "table", headers: rows[0]!, rows: rows.slice(1) };
}

function bindCallback(callback: ts.ArrowFunction | ts.FunctionExpression, values: unknown[], bindings: StaticBindings) {
  callback.parameters.forEach((parameter, index) => {
    bindName(parameter.name, values[index], bindings);
  });
}

function bindName(name: ts.BindingName, value: unknown, bindings: StaticBindings) {
  if (ts.isIdentifier(name)) {
    bindings.set(name.text, value);
    return;
  }
  if (ts.isObjectBindingPattern(name) && isRecord(value)) {
    for (const element of name.elements) {
      const key = element.propertyName?.getText().replace(/^['"]|['"]$/g, "") ??
        (ts.isIdentifier(element.name) ? element.name.text : "");
      bindName(element.name, value[key], bindings);
    }
    return;
  }
  if (ts.isArrayBindingPattern(name) && Array.isArray(value)) {
    name.elements.forEach((element, index) => {
      if (ts.isBindingElement(element)) bindName(element.name, value[index], bindings);
    });
  }
}

function requiredStringProp(name: string, prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): string {
  const value = optionalValueProp(prop, attributes, context, graph);
  if (typeof value !== "string" || value.trim() === "") invalidProp(name, prop, attributes, context, graph);
  return value.trim();
}

function optionalStringProp(name: string, prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): string | undefined {
  const value = optionalValueProp(prop, attributes, context, graph);
  if (value === undefined) return undefined;
  if (typeof value !== "string") invalidProp(name, prop, attributes, context, graph);
  return value.trim();
}

function optionalBooleanProp(name: string, prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): boolean | undefined {
  const value = optionalValueProp(prop, attributes, context, graph);
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") invalidProp(name, prop, attributes, context, graph);
  return value;
}

function requiredArrayProp(name: string, prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): unknown[] {
  const value = optionalValueProp(prop, attributes, context, graph);
  if (!Array.isArray(value)) invalidProp(name, prop, attributes, context, graph);
  return value;
}

function optionalValueProp(prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): unknown {
  const attribute = attributes.properties.find(
    (candidate): candidate is ts.JsxAttribute =>
      ts.isJsxAttribute(candidate) && jsxAttributeName(candidate.name) === prop,
  );
  return attribute ? attributeValue(attribute, context, graph) : undefined;
}

function attributeValue(attribute: ts.JsxAttribute, context: WalkContext, graph: StaticModuleGraph): unknown {
  if (!attribute.initializer) return true;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
  if (!ts.isJsxExpression(attribute.initializer)) return undefined;
  return graph.evaluate(context.file, attribute.initializer.expression, context.bindings);
}

function invalidProp(name: string, prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): never {
  throw new Error(`${name} prop "${prop}" is not statically extractable at ${graph.location(context.file, attributes)}`);
}

function recordString(record: Record<string, unknown>, key: string, name: string, prop: string, attributes: ts.JsxAttributes, context: WalkContext, graph: StaticModuleGraph): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") invalidProp(name, prop, attributes, context, graph);
  return value.trim();
}

function guidanceTone(value: unknown): GuidanceTone {
  return value === "do" || value === "avoid" ? value : "rule";
}

function tagName(name: ts.JsxTagNameExpression): string {
  return ts.isIdentifier(name) ? name.text : name.getText();
}

function containsGuidance(node: ts.Node): boolean {
  let found = false;
  const visit = (candidate: ts.Node) => {
    if (found) return;
    if (
      (ts.isJsxElement(candidate) &&
        GUIDANCE_COMPONENTS.has(tagName(candidate.openingElement.tagName))) ||
      (ts.isJsxSelfClosingElement(candidate) &&
        GUIDANCE_COMPONENTS.has(tagName(candidate.tagName)))
    ) {
      found = true;
      return;
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
}

function jsxAttributeName(name: ts.JsxAttributeName): string {
  return ts.isIdentifier(name) ? name.text : name.getText();
}
