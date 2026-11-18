import { readFile, realpath, stat } from "node:fs/promises";
import { globSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import ts from "typescript";
import type { SourceRoot } from "./source-roots";

type Options = { root: string; files: string[]; aliases: Record<string, string>; libraryImports: string[]; sourceRoots: readonly SourceRoot[]; allowedRoots?: readonly string[] };
const suffixes = ["", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".mdx", ".json", ".css", "/index.tsx", "/index.ts", "/index.js"];

function imports(file: string, code: string): string[] {
  if (extname(file) === ".css") return [...code.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)].map(match => match[1]!);
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  const result: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      if (clause?.isTypeOnly) return;
      if (clause && !clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.every(item => item.isTypeOnly)) return;
      result.push(node.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) result.push(node.moduleSpecifier.text);
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) result.push(node.arguments[0].text);
    else if (ts.isCallExpression(node) && node.expression.getText(source) === "import.meta.glob") {
      const argument = node.arguments[0];
      const patterns = argument && ts.isArrayLiteralExpression(argument) ? [...argument.elements] : argument ? [argument] : [];
      if (!patterns.length || !patterns.every(ts.isStringLiteralLike)) throw new Error(`${file}: import.meta.glob requires literal patterns`);
      const values = patterns.map(pattern => pattern.text);
      const matches = globSync(values.filter(pattern => !pattern.startsWith("!")), { cwd: dirname(file), exclude: values.filter(pattern => pattern.startsWith("!")).map(pattern => pattern.slice(1)) });
      result.push(...matches.map(match => resolve(dirname(file), match)).filter(match => statSync(match).isFile()).sort());
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

async function resolveFile(path: string): Promise<string> {
  for (const suffix of suffixes) {
    try { if ((await stat(path + suffix)).isFile()) return realpath(path + suffix); }
    catch (error) { if (!["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error; }
  }
  throw new Error(`Cannot resolve page source import ${path}`);
}

export async function liveSourceGraph(options: Options): Promise<string[]> {
  const pending = await Promise.all(options.files.map(file => realpath(resolve(options.root, file))));
  const files = new Set(pending);
  const pages = resolve(options.root, "src/pages");
  const roots = options.allowedRoots ?? [pages, ...options.sourceRoots.map(root => root.directory).filter(root => root !== resolve(options.root, "src"))];
  for (let index = 0; index < pending.length; index++) {
    const file = pending[index]!;
    if (!/\.(?:[cm]?jsx?|tsx?|css)$/.test(file)) continue;
    for (const dependency of imports(file, await readFile(file, "utf8"))) {
      const name = dependency.split("?")[0]!;
      if (options.libraryImports.includes(name) || /^(?:https?:|data:|tailwindcss(?:\/|$))/.test(name)) continue;
      const alias = Object.keys(options.aliases).sort((a, b) => b.length - a.length).find(alias => name === alias || name.startsWith(alias + "/"));
      if (!alias && !name.startsWith(".") && !name.startsWith("/")) continue;
      const target = await resolveFile(alias ? resolve(options.root, options.aliases[alias]!) + name.slice(alias.length) : resolve(dirname(file), name));
      if (!roots.some(root => target.startsWith(root + "/"))) throw new Error(`Page import leaves declared source roots: ${file} → ${target}; refresh the compatibility census`);
      if (!files.has(target)) { files.add(target); pending.push(target); }
    }
  }
  return [...files];
}
