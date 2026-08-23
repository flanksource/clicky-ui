import { lstatSync, readFileSync, readdirSync } from "node:fs";
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import ts from "typescript";

export type PageSourceDocument = {
  file: string;
  source: string;
};

export type PageReferenceEdit = PageSourceDocument & {
  nextSource: string;
  updatedReferences: number;
};

export type PageReferencePlan = {
  movedSource: string;
  edits: PageReferenceEdit[];
  updatedReferences: number;
};

type TextEdit = {
  start: number;
  end: number;
  text: string;
};

type RewriteOptions = {
  document: PageSourceDocument;
  oldFile: string;
  newFile: string;
  oldSlug: string;
  newSlug: string;
  moved: boolean;
};

type RewriteContext = RewriteOptions & {
  sourceFile: ts.SourceFile;
  edits: Map<string, TextEdit>;
};

const NAVIGATION_CALLS = new Set([
  "findPage",
  "navigatePage",
  "onNavigate",
  "pageHref",
]);
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const;

function normalized(path: string): string {
  return resolve(path);
}

function withDotPrefix(path: string): string {
  return path.startsWith(".") ? path : `./${path}`;
}

function splitSpecifier(specifier: string): { path: string; suffix: string } {
  const suffixStart = specifier.search(/[?#]/);
  if (suffixStart < 0) return { path: specifier, suffix: "" };
  return {
    path: specifier.slice(0, suffixStart),
    suffix: specifier.slice(suffixStart),
  };
}

function relativeSpecifier(fromFile: string, target: string): string {
  return withDotPrefix(relative(dirname(fromFile), target).split(sep).join("/"));
}

function rebaseSpecifier(specifier: string, oldFile: string, newFile: string): string {
  const { path, suffix } = splitSpecifier(specifier);
  if (!path.startsWith(".")) return specifier;
  return `${relativeSpecifier(newFile, resolve(dirname(oldFile), path))}${suffix}`;
}

function possibleModuleTargets(importer: string, specifier: string): string[] {
  const { path } = splitSpecifier(specifier);
  if (!path.startsWith(".")) return [];
  const target = resolve(dirname(importer), path);
  if (extname(path) !== "") return [target];
  return [
    ...SOURCE_EXTENSIONS.map((extension) => `${target}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => join(target, `index${extension}`)),
  ];
}

function resolvesToPage(importer: string, specifier: string, pageFile: string): boolean {
  const page = normalized(pageFile);
  return possibleModuleTargets(importer, specifier).some((target) => normalized(target) === page);
}

function destinationForStyle(specifier: string, oldFile: string, newFile: string): string {
  const { path } = splitSpecifier(specifier);
  if (extname(path) !== "") return newFile;
  if (basename(oldFile).startsWith("index.") && basename(newFile).startsWith("index.")) {
    return dirname(newFile);
  }
  return newFile.replace(/\.(?:tsx?|jsx?)$/, "");
}

function rewriteIncomingSpecifier(
  specifier: string,
  importer: string,
  oldFile: string,
  newFile: string,
): string {
  if (!resolvesToPage(importer, specifier, oldFile)) return specifier;
  const { suffix } = splitSpecifier(specifier);
  return `${relativeSpecifier(importer, destinationForStyle(specifier, oldFile, newFile))}${suffix}`;
}

function rewritePageUrl(value: string, oldSlug: string, newSlug: string): string {
  const oldValues = [oldSlug, encodeURIComponent(oldSlug)];
  let rewritten = value;
  for (const oldValue of oldValues) {
    const escaped = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(`([?&]page=)${escaped}(?=(&|#|$))`, "gi");
    const nextValue = oldValue === oldSlug ? newSlug : encodeURIComponent(newSlug);
    rewritten = rewritten.replace(expression, `$1${nextValue}`);
  }
  return rewritten;
}

function isStaticString(node: ts.Node | undefined): node is ts.StringLiteralLike {
  return Boolean(
    node &&
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)),
  );
}

function propertyName(node: ts.PropertyName): string | undefined {
  return ts.isIdentifier(node) || ts.isStringLiteralLike(node) ? node.text : undefined;
}

function callName(node: ts.Expression): string | undefined {
  if (ts.isIdentifier(node)) return node.text;
  return ts.isPropertyAccessExpression(node) ? node.name.text : undefined;
}

function isImportMetaUrl(node: ts.Expression | undefined): boolean {
  return Boolean(
    node &&
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "url" &&
      ts.isMetaProperty(node.expression) &&
      node.expression.keywordToken === ts.SyntaxKind.ImportKeyword,
  );
}

function quoteValue(value: string, original: string): string {
  const quote = ["\"", "'", "`"].includes(original[0] ?? "")
    ? (original[0] as "\"" | "'" | "`")
    : "\"";
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(new RegExp(quote === "`" ? "`|\\$\\{" : quote, "g"), (match) =>
      match === "${" ? "\\${" : `\\${match}`,
    );
  return `${quote}${escaped}${quote}`;
}

function applyEdits(source: string, edits: readonly TextEdit[]): string {
  const ordered = [...edits].sort((left, right) => right.start - left.start);
  let next = source;
  let boundary = source.length;
  for (const edit of ordered) {
    if (edit.end > boundary) throw new Error("overlapping page reference edits");
    next = `${next.slice(0, edit.start)}${edit.text}${next.slice(edit.end)}`;
    boundary = edit.start;
  }
  return next;
}

function replaceNode(
  context: RewriteContext,
  node: ts.StringLiteralLike,
  value: string,
): void {
  if (value === node.text) return;
  const { sourceFile, document, edits } = context;
  const start = node.getStart(sourceFile);
  const end = node.getEnd();
  const key = `${start}:${end}`;
  const edit = { start, end, text: quoteValue(value, document.source.slice(start, end)) };
  const existing = edits.get(key);
  if (existing && existing.text !== edit.text) {
    throw new Error(`conflicting page reference edits in ${document.file}`);
  }
  edits.set(key, edit);
}

function rewriteModule(context: RewriteContext, node: ts.StringLiteralLike): void {
  const { moved, oldFile, newFile, document } = context;
  replaceNode(
    context,
    node,
    moved
      ? rebaseSpecifier(node.text, oldFile, newFile)
      : rewriteIncomingSpecifier(node.text, document.file, oldFile, newFile),
  );
}

function rewriteCall(context: RewriteContext, node: ts.CallExpression): void {
  if (
    (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
    isStaticString(node.arguments[0])
  ) {
    rewriteModule(context, node.arguments[0]);
  }

  const name = callName(node.expression);
  const first = node.arguments[0];
  const value = name === "set" && isStaticString(first) && first.text === "page"
    ? node.arguments[1]
    : name && NAVIGATION_CALLS.has(name)
      ? first
      : undefined;
  if (isStaticString(value) && value.text === context.oldSlug) {
    replaceNode(context, value, context.newSlug);
  }
}

function rewriteReferenceNode(context: RewriteContext, node: ts.Node): void {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    if (isStaticString(node.moduleSpecifier)) rewriteModule(context, node.moduleSpecifier);
  } else if (
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    isStaticString(node.argument.literal)
  ) {
    rewriteModule(context, node.argument.literal);
  } else if (
    ts.isImportEqualsDeclaration(node) &&
    ts.isExternalModuleReference(node.moduleReference) &&
    isStaticString(node.moduleReference.expression)
  ) {
    rewriteModule(context, node.moduleReference.expression);
  } else if (ts.isCallExpression(node)) {
    rewriteCall(context, node);
  } else if (
    ts.isNewExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "URL" &&
    isStaticString(node.arguments?.[0]) &&
    isImportMetaUrl(node.arguments?.[1])
  ) {
    rewriteModule(context, node.arguments[0]);
  } else if (
    ts.isPropertyAssignment(node) &&
    propertyName(node.name) === "page" &&
    isStaticString(node.initializer) &&
    node.initializer.text === context.oldSlug
  ) {
    replaceNode(context, node.initializer, context.newSlug);
  }

  if (isStaticString(node)) {
    replaceNode(context, node, rewritePageUrl(node.text, context.oldSlug, context.newSlug));
  }
  ts.forEachChild(node, (child) => rewriteReferenceNode(context, child));
}

function rewriteDocument(options: RewriteOptions): {
  source: string;
  updatedReferences: number;
} {
  const sourceFile = ts.createSourceFile(
    options.document.file,
    options.document.source,
    ts.ScriptTarget.Latest,
    true,
    options.document.file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const context = { ...options, sourceFile, edits: new Map<string, TextEdit>() };
  rewriteReferenceNode(context, sourceFile);
  return {
    source: applyEdits(options.document.source, [...context.edits.values()]),
    updatedReferences: context.edits.size,
  };
}

export function planPageReferenceUpdates(options: {
  sources: readonly PageSourceDocument[];
  oldFile: string;
  newFile: string;
  oldSlug: string;
  newSlug: string;
}): PageReferencePlan {
  const oldFile = normalized(options.oldFile);
  const movedDocuments = options.sources.filter(
    (document) => normalized(document.file) === oldFile,
  );
  if (movedDocuments.length !== 1) {
    throw new Error(`expected exactly one source document for ${options.oldFile}`);
  }

  let movedSource = movedDocuments[0]!.source;
  let updatedReferences = 0;
  const edits: PageReferenceEdit[] = [];
  for (const document of options.sources) {
    const moved = normalized(document.file) === oldFile;
    const rewritten = rewriteDocument({ ...options, document, moved });
    updatedReferences += rewritten.updatedReferences;
    if (moved) movedSource = rewritten.source;
    else if (rewritten.source !== document.source) {
      edits.push({
        ...document,
        nextSource: rewritten.source,
        updatedReferences: rewritten.updatedReferences,
      });
    }
  }
  return { movedSource, edits, updatedReferences };
}

export function readTypeScriptSources(sourceRoot: string): PageSourceDocument[] {
  const sources: PageSourceDocument[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isSymbolicLink() || lstatSync(file).isSymbolicLink()) {
        throw new Error(`refusing to scan symbolic link ${file}`);
      }
      if (entry.isDirectory()) walk(file);
      else if (SOURCE_EXTENSIONS.includes(extname(entry.name) as (typeof SOURCE_EXTENSIONS)[number])) {
        sources.push({ file, source: readFileSync(file, "utf8") });
      }
    }
  };
  walk(normalized(sourceRoot));
  return sources.sort((left, right) => left.file.localeCompare(right.file));
}
