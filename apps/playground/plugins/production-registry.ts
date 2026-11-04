import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import ts from "typescript";

export async function sourceFiles(root: string): Promise<string[]> {
  return (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(tsx?|mdx?)$/.test(entry.name))
    .map((entry) => resolve(entry.parentPath, entry.name));
}

export async function pageFiles(root: string): Promise<string[]> {
  return (await sourceFiles(resolve(root, "src/pages")))
    .map((file) => file.slice(resolve(root, "src/pages").length + 1))
    .filter(
      (file) =>
        /\.(tsx|md|mdx)$/.test(file) &&
        !file.split("/").some((part) => /^[_.]/.test(part)) &&
        !/\.(test|stories)\./.test(file),
    )
    .sort();
}

export function liveRegistry(code: string): string {
  const source = ts.createSourceFile(
    "registry.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
  );
  const replacements: { start: number; end: number; kind: string }[] = [];
  function visit(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === "import.meta.glob"
    ) {
      const text = node.getText(source);
      const kind = text.includes("?playground-meta")
        ? "meta"
        : text.includes("?playground-markdown")
          ? "guidance"
          : text.includes("?raw")
            ? "markdown"
            : "component";
      replacements.push({ start: node.getStart(source), end: node.end, kind });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (replacements.length !== 4)
    throw new Error(`Expected four page globs, found ${replacements.length}`);
  for (const { start, end, kind } of replacements.reverse()) {
    code =
      code.slice(0, start) +
      `__liveModules(${JSON.stringify(kind)})` +
      code.slice(end);
  }
  return `
function __liveModules(kind) {
  const files = globalThis.__PLAYGROUND_FILES__;
  if (!Array.isArray(files)) throw new Error("Missing live playground page manifest");
  const query = {component: "", meta: "?playground-meta", guidance: "?playground-markdown", markdown: "?raw"}[kind];
  return Object.fromEntries(files.filter(file => kind === "markdown" ? /\\.mdx?$/.test(file) : file.endsWith(".tsx"))
    .map(file => ["./pages/" + file, () => import(/* @vite-ignore */ "/src/pages/" + file + query)
      .then(module => kind === "component" ? module : module.default)]));
}
${code}`;
}

const sharedPackage =
  /^(?:react(?:-dom)?(?:\/|$)|@flanksource\/(?:clicky-ui|facet)(?:\/|$)|@tanstack\/react-query(?:\/|$)|jotai(?:\/|$)|@iconify\/react$)/;

export async function sharedImports(root: string): Promise<string[]> {
  const imports = new Set([
    "react",
    "react/jsx-runtime",
    "react-dom",
    "react-dom/client",
    "react-dom/server.browser",
  ]);
  const pagesRoot = resolve(root, "src/pages") + "/";
  const files = await sourceFiles(resolve(root, "src"));
  const available = new Set(files);
  for (const file of files) {
    if (
      !/\.tsx?$/.test(file) ||
      /\.(test|stories)\./.test(file) ||
      file.includes("/test/")
    )
      continue;
    const code = await readFile(file, "utf8");
    if (!file.startsWith(pagesRoot) && code.includes("createContext"))
      imports.add(file);
    const source = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      false,
    );
    for (const statement of source.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      )
        continue;
      const clause = statement.importClause;
      if (clause?.isTypeOnly) continue;
      if (
        clause?.namedBindings &&
        ts.isNamedImports(clause.namedBindings) &&
        !clause.name &&
        clause.namedBindings.elements.every((item) => item.isTypeOnly)
      )
        continue;
      const specifier = statement.moduleSpecifier.text;
      if (extname(specifier) === ".css") continue;
      if (sharedPackage.test(specifier)) imports.add(specifier);
      else if (file.startsWith(pagesRoot) && specifier.startsWith(".")) {
        const target = resolve(dirname(file), specifier);
        const module = [
          target,
          target + ".ts",
          target + ".tsx",
          target + "/index.ts",
          target + "/index.tsx",
        ].find((path) => available.has(path));
        if (
          module &&
          !target.startsWith(pagesRoot) &&
          target.startsWith(resolve(root, "src") + "/")
        )
          imports.add(module);
      }
    }
  }
  return [...imports].sort();
}
