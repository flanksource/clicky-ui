import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import ts from "typescript";
import type { IssueClass } from "./browser-mode-census-catalog";

// Resolve the exact lexer/compiler versions used by the runtime, including its TypeScript-aware lexer build.
const runtimeRequire = createRequire(new URL("../../../packages/page-runtime/package.json", import.meta.url));
type ImportRecord = { type: string; specifier: string | null | undefined; start: number; typeOnly: boolean; glob?: boolean };
const lexer = runtimeRequire("es-module-lexer") as { init: () => Promise<void>; parse: (source: string, name: string) => [ImportRecord[]] };
const sucrase = runtimeRequire("sucrase") as { transform: (source: string, options: { transforms: ("typescript" | "jsx")[]; jsxRuntime: "automatic"; filePath: string; disableESTransforms: boolean }) => { code: string } };
const postcss = runtimeRequire("postcss") as { parse: (source: string, options: { from: string }) => { walkAtRules: (visit: (rule: { name: string; params: string; source: { start: { line: number } } }) => void) => void } };

export type Observation = { class: IssueClass; line: number; specifier: string; blocking: boolean; reason: string };
export type Dependency = { specifier: string; line: number; glob?: { exclude: string[]; query: string } };
export type Analysis = { dependencies: Dependency[]; observations: Observation[]; sources: Dependency[] };
const CONTEXT_HOOKS = new Set(["useCommentContext", "useCommentsContext", "useAgentRuns", "useAgentRunsContext", "usePromptRuns", "usePromptRunsContext", "useReviewContext", "useReview", "useRouter", "useAnnotationsHidden"]);
const endpoint = (value: string): boolean => ["/__playground", "/oipa-api"].some((prefix) => value === prefix || value.startsWith(`${prefix}/`) || value.startsWith(`${prefix}?`));

function inspectCalls(source: ts.SourceFile, result: Analysis): void {
  const hooks = new Map<string, string>();
  const namespaces = new Set<string>();
  const constants = new Map<string, ts.Expression>();
  const pageRootIndex = source.fileName.lastIndexOf("/src/pages/");
  const appSource = pageRootIndex >= 0 ? `${source.fileName.slice(0, pageRootIndex)}/src/` : undefined;
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement) && statement.declarationList.flags & ts.NodeFlags.Const) {
      for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name) && declaration.initializer) constants.set(declaration.name.text, declaration.initializer);
    }
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const origin = statement.moduleSpecifier.text;
    const target = resolve(dirname(source.fileName), origin);
    const shell = appSource !== undefined && target.startsWith(appSource) && !target.startsWith(`${appSource}pages/`);
    if (!shell && !origin.startsWith("playground-runtime") && !origin.startsWith("@flanksource/clicky-ui")) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const item of bindings.elements) if (CONTEXT_HOOKS.has((item.propertyName ?? item.name).text)) hooks.set(item.name.text, (item.propertyName ?? item.name).text);
    } else if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
  }
  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const expression = node.expression;
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(expression) && ts.isMetaProperty(expression.expression) && expression.name.text === "glob") globDependencies(node, source, result);
      const hook = ts.isIdentifier(expression) ? hooks.get(expression.text) : ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression) && namespaces.has(expression.expression.text) && CONTEXT_HOOKS.has(expression.name.text) ? expression.name.text : undefined;
      if (hook) result.observations.push({ class: "shell-context", line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, specifier: hook, blocking: hook !== "useRouter", reason: `${hook} reads a provider that must exist inside the frame${hook === "useRouter" ? " (clicky-ui supplies the Router provider)" : ""}.` });
      const argument = node.arguments?.[0];
      if (argument) {
        const text = literalPrefix(argument, constants, new Set());
        const name = ts.isIdentifier(expression) ? expression.text : ts.isPropertyAccessExpression(expression) ? expression.name.text : "";
        if (["fetch", "get", "post", "put", "patch", "delete", "request", "EventSource", "WebSocket"].includes(name) && endpoint(text)) result.observations.push({ class: "same-origin-api", line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, specifier: text, blocking: false, reason: "This request depends on the P8 local frame sharing the playground API origin." });
      }
    }
    if (ts.isPropertyAccessExpression(node) && ts.isMetaProperty(node.expression) && ["glob", "env"].includes(node.name.text)) result.observations.push({ class: node.name.text === "glob" ? "import-meta-glob" : "import-meta-env", line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, specifier: node.getText(source), blocking: true, reason: `${node.getText(source)} requires explicit compiler wiring; native import.meta.url alone is supported.` });
    ts.forEachChild(node, visit);
  }
  visit(source);
}

function globDependencies(node: ts.CallExpression, source: ts.SourceFile, result: Analysis): void {
  const argument = node.arguments[0];
  if (!argument) throw new Error(`${source.fileName}: import.meta.glob must specify patterns`);
  const entries = ts.isArrayLiteralExpression(argument) ? [...argument.elements] : [argument];
  if (entries.some((entry) => !ts.isStringLiteralLike(entry))) throw new Error(`${source.fileName}: import.meta.glob patterns must be literal strings`);
  const patterns = entries.map((entry) => (entry as ts.StringLiteralLike).text);
  const exclude = patterns.filter((pattern) => pattern.startsWith("!")).map((pattern) => pattern.slice(1));
  const options = node.arguments[1];
  const query = options && ts.isObjectLiteralExpression(options) ? options.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(source) === "query") : undefined;
  if (query && (!ts.isPropertyAssignment(query) || !ts.isStringLiteralLike(query.initializer))) throw new Error(`${source.fileName}: glob query must be a literal string`);
  for (const pattern of patterns.filter((value) => !value.startsWith("!"))) result.dependencies.push({ specifier: pattern, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, glob: { exclude, query: query && ts.isPropertyAssignment(query) ? (query.initializer as ts.StringLiteralLike).text : "" } });
}

function literalPrefix(expression: ts.Expression, constants: Map<string, ts.Expression>, seen: Set<string>): string {
  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isIdentifier(expression) && constants.has(expression.text) && !seen.has(expression.text)) {
    seen.add(expression.text);
    return literalPrefix(constants.get(expression.text)!, constants, seen);
  }
  if (ts.isTemplateExpression(expression)) {
    let text = expression.head.text;
    for (const span of expression.templateSpans) {
      const prefix = literalPrefix(span.expression, constants, new Set(seen));
      if (!prefix) break;
      text += prefix + span.literal.text;
    }
    return text;
  }
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) return literalPrefix(expression.left, constants, seen) + literalPrefix(expression.right, constants, new Set(seen));
  return "";
}

export async function analyzeScript(options: { file: string; code: string }): Promise<Analysis> {
  const extension = extname(options.file);
  const code = sucrase.transform(options.code, { transforms: [...([".ts", ".tsx"].includes(extension) ? ["typescript" as const] : []), ...([".tsx", ".jsx"].includes(extension) ? ["jsx" as const] : [])], jsxRuntime: "automatic", filePath: options.file, disableESTransforms: true }).code;
  return analyzeModule({ file: options.file, code });
}

async function analyzeModule({ file, code }: { file: string; code: string }): Promise<Analysis> {
  const result: Analysis = { dependencies: [], observations: [], sources: [] };
  await lexer.init();
  const [imports] = lexer.parse(code, file);
  for (const item of imports) {
    if (item.type === "import-meta" || item.typeOnly) continue;
    const line = code.slice(0, item.start).split("\n").length;
    if (item.specifier === undefined || item.glob) {
      result.observations.push({ class: "dynamic-import", line, specifier: item.specifier ?? "<nonliteral import>", blocking: true, reason: "The runtime cannot resolve a dynamic import without a literal module name." });
      if (item.glob && item.specifier) result.dependencies.push({ specifier: item.specifier, line, glob: { exclude: [], query: "" } });
    }
    else if (item.specifier !== null) result.dependencies.push({ specifier: item.specifier, line });
  }
  inspectCalls(ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS), result);
  return result;
}

export function analyzeCss(options: { file: string; code: string }): Analysis {
  const result: Analysis = { dependencies: [], observations: [], sources: [] };
  postcss.parse(options.code, { from: options.file }).walkAtRules((rule) => {
    if (rule.name !== "source" && rule.name !== "import") return;
    const match = /^(?:not\s+)?(?:url\(\s*)?["']([^"']+)["']/.exec(rule.params);
    if (rule.name === "import" && match?.[1] && /^(?:https?:|data:)/.test(match[1])) return;
    if (match?.[1]) (rule.name === "source" ? result.sources : result.dependencies).push({ specifier: match[1], line: rule.source.start.line });
    else if (rule.name === "source" && !rule.params.startsWith("inline(")) throw new Error(`${options.file}:${rule.source.start.line}: unsupported @source ${rule.params}`);
  });
  return result;
}

export async function analyzeMdx(options: { file: string; code: string }): Promise<Analysis> {
  const mdx = await import(runtimeRequire.resolve("@mdx-js/mdx")) as { compile: (input: { value: string; path: string }, options: { development: boolean }) => Promise<unknown> };
  return analyzeModule({ file: options.file, code: String(await mdx.compile({ value: options.code, path: options.file }, { development: true })) });
}
