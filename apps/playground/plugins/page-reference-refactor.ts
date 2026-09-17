import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import {
  Node,
  Project,
  ts,
  type NoSubstitutionTemplateLiteral,
  type SourceFile,
  type StringLiteral,
} from "ts-morph";

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

type StaticString = StringLiteral | NoSubstitutionTemplateLiteral;

type TextEdit = {
  start: number;
  end: number;
  text: string;
};

type RewriteContext = {
  sourceFile: SourceFile;
  document: PageSourceDocument;
  oldFile: string;
  newFile: string;
  oldSlug: string;
  newSlug: string;
  moved: boolean;
  moduleLiterals: Set<number>;
  changed: Set<string>;
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
  return withDotPrefix(
    relative(dirname(fromFile), target).split(sep).join("/"),
  );
}

function rebaseSpecifier(
  specifier: string,
  oldFile: string,
  newFile: string,
): string {
  const { path, suffix } = splitSpecifier(specifier);
  if (!path.startsWith(".")) return specifier;
  return `${relativeSpecifier(newFile, resolve(dirname(oldFile), path))}${suffix}`;
}

function possibleModuleTargets(importer: string, specifier: string): string[] {
  const { path } = splitSpecifier(specifier);
  if (!path.startsWith(".")) return [];
  const target = resolve(dirname(importer), path);
  const extension = extname(path);
  if (extension === ".js") {
    return [target, `${target.slice(0, -3)}.ts`, `${target.slice(0, -3)}.tsx`];
  }
  if (extension === ".jsx") return [target, `${target.slice(0, -4)}.tsx`];
  if (extension !== "") return [target];
  return [
    ...SOURCE_EXTENSIONS.map(
      (sourceExtension) => `${target}${sourceExtension}`,
    ),
    ...SOURCE_EXTENSIONS.map((sourceExtension) =>
      join(target, `index${sourceExtension}`),
    ),
  ];
}

function resolvesToPage(
  importer: string,
  specifier: string,
  pageFile: string,
): boolean {
  return (
    possibleModuleTargets(importer, specifier).find(existsSync) ===
    normalized(pageFile)
  );
}

function resolvesToAnotherFile(
  importer: string,
  specifier: string,
  pageFile: string,
): boolean {
  const target = possibleModuleTargets(importer, specifier).find(existsSync);
  return target !== undefined && target !== normalized(pageFile);
}

function destinationForStyle(
  specifier: string,
  oldFile: string,
  newFile: string,
): string {
  const { path } = splitSpecifier(specifier);
  const extension = extname(path);
  if (extension === ".js" || extension === ".jsx") {
    return newFile.replace(/\.(?:tsx?|jsx?)$/, extension);
  }
  if (extension !== "") return newFile;
  if (
    basename(oldFile).startsWith("index.") &&
    basename(newFile).startsWith("index.")
  ) {
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

function rewritePageUrl(
  value: string,
  oldSlug: string,
  newSlug: string,
): string {
  const oldValues = [oldSlug, encodeURIComponent(oldSlug)];
  let rewritten = value;
  for (const oldValue of oldValues) {
    const escaped = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(`([?&]page=)${escaped}(?=(&|#|$))`, "gi");
    const nextValue =
      oldValue === oldSlug ? newSlug : encodeURIComponent(newSlug);
    rewritten = rewritten.replace(expression, `$1${nextValue}`);
  }
  return rewritten;
}

function isStaticString(node: Node | undefined): node is StaticString {
  return Boolean(
    node &&
    (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)),
  );
}

function callName(node: Node): string | undefined {
  if (Node.isIdentifier(node)) return node.getText();
  return Node.isPropertyAccessExpression(node) ? node.getName() : undefined;
}

function quoteValue(value: string, original: string): string {
  const quote = ['"', "'", "`"].includes(original[0] ?? "")
    ? (original[0] as '"' | "'" | "`")
    : '"';
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
    if (edit.end > boundary)
      throw new Error("overlapping page reference edits");
    next = `${next.slice(0, edit.start)}${edit.text}${next.slice(edit.end)}`;
    boundary = edit.start;
  }
  return next;
}

function replaceNode(
  context: RewriteContext,
  node: StaticString,
  value: string,
): void {
  if (value === node.getLiteralValue()) return;
  const start = node.getStart();
  const end = node.getEnd();
  const key = `${start}:${end}`;
  const source = context.sourceFile.getFullText();
  const edit = {
    start,
    end,
    text: quoteValue(value, source.slice(start, end)),
  };
  const existing = context.edits.get(key);
  if (existing && existing.text !== edit.text) {
    throw new Error(
      `conflicting page reference edits in ${context.document.file}`,
    );
  }
  context.edits.set(key, edit);
  context.changed.add(key);
}

function rewriteModule(context: RewriteContext, node: StaticString): void {
  const { moved, oldFile, newFile, document } = context;
  replaceNode(
    context,
    node,
    moved
      ? rebaseSpecifier(node.getLiteralValue(), oldFile, newFile)
      : rewriteIncomingSpecifier(
          node.getLiteralValue(),
          document.file,
          oldFile,
          newFile,
        ),
  );
}

function rewriteCall(context: RewriteContext, node: Node): void {
  if (!Node.isCallExpression(node)) return;
  const expression = node.getExpression();
  const first = node.getArguments()[0];
  if (
    (expression.getKind() === ts.SyntaxKind.ImportKeyword ||
      (Node.isIdentifier(expression) && expression.getText() === "require")) &&
    isStaticString(first) &&
    !context.moduleLiterals.has(first.getStart())
  ) {
    rewriteModule(context, first);
  }
  const name = callName(expression);
  const value =
    name === "set" &&
    isStaticString(first) &&
    first.getLiteralValue() === "page"
      ? node.getArguments()[1]
      : name && NAVIGATION_CALLS.has(name)
        ? first
        : undefined;
  if (isStaticString(value) && value.getLiteralValue() === context.oldSlug) {
    replaceNode(context, value, context.newSlug);
  }
}

function rewriteReferenceNode(context: RewriteContext, node: Node): void {
  if (Node.isCallExpression(node)) rewriteCall(context, node);
  if (Node.isNewExpression(node) && node.getExpression().getText() === "URL") {
    const [path, base] = node.getArguments();
    if (isStaticString(path) && base?.getText() === "import.meta.url") {
      rewriteModule(context, path);
    }
  }
  if (Node.isPropertyAssignment(node) && node.getName() === "page") {
    const value = node.getInitializer();
    if (isStaticString(value) && value.getLiteralValue() === context.oldSlug) {
      replaceNode(context, value, context.newSlug);
    }
  }
  if (isStaticString(node)) {
    replaceNode(
      context,
      node,
      rewritePageUrl(node.getLiteralValue(), context.oldSlug, context.newSlug),
    );
  }
}

function rewriteDocument(
  context: RewriteContext,
  beforeModules: readonly string[],
): { source: string; updatedReferences: number } {
  const afterModules = context.sourceFile.getImportStringLiterals();
  if (afterModules.length !== beforeModules.length) {
    throw new Error(
      `module reference count changed while moving ${context.document.file}`,
    );
  }
  for (const [index, literal] of afterModules.entries()) {
    context.moduleLiterals.add(literal.getStart());
    const original = beforeModules[index];
    if (original === undefined)
      throw new Error(`missing module reference in ${context.document.file}`);
    if (literal.getLiteralValue() !== original) {
      const key = `${literal.getStart()}:${literal.getEnd()}`;
      if (
        !context.moved &&
        resolvesToAnotherFile(context.document.file, original, context.oldFile)
      ) {
        replaceNode(context, literal, original);
        context.changed.delete(key);
        continue;
      }
      context.changed.add(key);
      const styled = context.moved
        ? rebaseSpecifier(original, context.oldFile, context.newFile)
        : rewriteIncomingSpecifier(
            original,
            context.document.file,
            context.oldFile,
            context.newFile,
          );
      if (styled !== original) replaceNode(context, literal, styled);
    } else {
      rewriteModule(context, literal);
    }
  }
  context.sourceFile.forEachDescendant((node) =>
    rewriteReferenceNode(context, node),
  );
  return {
    source: applyEdits(context.sourceFile.getFullText(), [
      ...context.edits.values(),
    ]),
    updatedReferences: context.changed.size,
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
  const newFile = normalized(options.newFile);
  const movedDocuments = options.sources.filter(
    (document) => normalized(document.file) === oldFile,
  );
  if (movedDocuments.length !== 1) {
    throw new Error(
      `expected exactly one source document for ${options.oldFile}`,
    );
  }

  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      allowJs: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  });
  for (const document of options.sources) {
    project.createSourceFile(normalized(document.file), document.source);
  }
  const beforeModules = new Map(
    options.sources.map((document) => [
      normalized(document.file),
      project
        .getSourceFileOrThrow(normalized(document.file))
        .getImportStringLiterals()
        .map((literal) => literal.getLiteralValue()),
    ]),
  );
  if (oldFile !== newFile) project.getSourceFileOrThrow(oldFile).move(newFile);

  let movedSource = movedDocuments[0]!.source;
  let updatedReferences = 0;
  const edits: PageReferenceEdit[] = [];
  for (const document of options.sources) {
    const moved = normalized(document.file) === oldFile;
    const sourceFile = project.getSourceFileOrThrow(
      moved ? newFile : normalized(document.file),
    );
    const modules = beforeModules.get(normalized(document.file));
    if (!modules)
      throw new Error(`missing module references for ${document.file}`);
    const rewritten = rewriteDocument(
      {
        sourceFile,
        document,
        oldFile,
        newFile,
        oldSlug: options.oldSlug,
        newSlug: options.newSlug,
        moved,
        moduleLiterals: new Set<number>(),
        changed: new Set<string>(),
        edits: new Map<string, TextEdit>(),
      },
      modules,
    );
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

export function readTypeScriptSources(
  sourceRoot: string,
): PageSourceDocument[] {
  const sources: PageSourceDocument[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isSymbolicLink() || lstatSync(file).isSymbolicLink()) {
        throw new Error(`refusing to scan symbolic link ${file}`);
      }
      if (entry.isDirectory()) walk(file);
      else if (
        SOURCE_EXTENSIONS.includes(
          extname(entry.name) as (typeof SOURCE_EXTENSIONS)[number],
        )
      ) {
        sources.push({ file, source: readFileSync(file, "utf8") });
      }
    }
  };
  walk(normalized(sourceRoot));
  return sources.sort((left, right) => left.file.localeCompare(right.file));
}
