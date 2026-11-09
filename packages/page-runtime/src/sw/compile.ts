import { init, parse as lex } from "es-module-lexer";
import { transform, type Transform } from "sucrase";
import { defineNodeEnv } from "./module-transform.ts";
import { insertSourceMarkers } from "./markers.ts";
import { completeCompositeSources } from "./compiler-columns.ts";
import { sourceHash } from "./source-hash.ts";
import type { CommonJsSource } from "../link/types.ts";

// The service worker's page compiler: Sucrase for TS, TSX and JSX; the MDX compiler for MDX. Both run in the worker
// and in Node unchanged.

/** Where page modules import the development JSX runtime from: a shim that marks host elements. */
export const DEV_SHIM_URL = "/__runtime/jsx-dev-runtime.js";

/**
 * Adds `data-source` to host elements from jsxDEV's source argument. MDX's development output passes a full
 * `{fileName, lineNumber, columnNumber}`; TS, TSX and JSX modules already carry the attribute (see markers.ts).
 */
export const DEV_SHIM = [
  'import { jsxDEV as base } from "react/jsx-dev-runtime";',
  'export { Fragment } from "react/jsx-dev-runtime";',
  "export function jsxDEV(type, props, key, isStatic, source, self) {",
  '  if (typeof type === "string" && source && source.columnNumber !== undefined && !(props && "data-source" in props)) {',
  '    props = { ...props, "data-source": `${source.fileName}:${source.lineNumber}:${source.columnNumber}` };',
  "  }",
  "  return base(type, props, key, isStatic, source, self);",
  "}",
  "",
].join("\n");

/** The MDX plugins every page compiles with, in facet's build order (the reference and the worker load their own copies). */
export type MdxPlugins = { remarkFrontmatter: unknown; remarkGfm: unknown; remarkAlert: unknown; rehypeRaw: unknown };

/** `remark` appends library-declared plugins, as `[plugin, options]` pairs, after the base set; only exports pass them. */
export function mdxOptions(plugins: MdxPlugins, remark: unknown[] = []): { remarkPlugins: unknown[]; rehypePlugins: unknown[] } {
  return {
    remarkPlugins: [plugins.remarkFrontmatter, plugins.remarkGfm, [plugins.remarkAlert, { tagName: "blockquote" }], ...remark],
    rehypePlugins: [[plugins.rehypeRaw, { passThrough: ["mdxFlowExpression", "mdxJsxFlowElement", "mdxJsxTextElement", "mdxTextExpression", "mdxjsEsm"] }]],
  };
}

export type MdxCompile = (file: { value: string; path: string }, options: Record<string, unknown>) => Promise<{ toString(): string }>;

export type PageSourceInput = { path: string; extension: string; code: string; sourcePath?: string; commonjs?: CommonJsSource };

export function compileCommonJsSource(options: { path: string; code: string; conversion: CommonJsSource }): string {
  if (sourceHash(options.code) !== options.conversion.hash) throw new Error(`${options.path}: CommonJS source changed; rebuild its runtime conversion and named-export metadata`);
  if (!options.conversion.target.startsWith("/link/") && !options.conversion.target.startsWith("/src/")) throw new Error(`${options.path}: CommonJS conversion requires a declared source module URL`);
  return `export { default } from ${JSON.stringify(options.conversion.target)};\nexport * from ${JSON.stringify(options.conversion.target)};\n`;
}

/** Compiles one TS, TSX or JSX module with source markers and React's development runtime. */
export function compileScript({ path, extension, code, sourcePath = path }: PageSourceInput): string {
  const typescript = extension === ".ts" || extension === ".tsx";
  const jsx = extension !== ".ts";
  const marked = jsx ? insertSourceMarkers(code, sourcePath, typescript) : undefined;
  const transforms: Transform[] = [...(typescript ? (["typescript"] as const) : []), ...(jsx ? (["jsx"] as const) : [])];
  const { code: compiled } = transform(marked?.code ?? code, {
    transforms,
    jsxRuntime: "automatic",
    filePath: sourcePath,
    disableESTransforms: true,
  });
  return defineNodeEnv(marked ? completeCompositeSources({ code: compiled, sourceProperty: marked.sourceProperty }) : compiled).code;
}

/** Points a module's `react/jsx-dev-runtime` imports at the marker shim. */
export async function useDevShim(code: string): Promise<string> {
  await init();
  const [imports] = lex(code);
  let rewritten = code;
  for (const item of [...imports].reverse()) {
    if (item.specifier === "react/jsx-dev-runtime") rewritten = `${rewritten.slice(0, item.start)}${DEV_SHIM_URL}${rewritten.slice(item.end)}`;
  }
  return rewritten;
}

/** Compiles an MDX page with the base plugins (plus `remark`, for exports) and routes jsxDEV calls through the marker shim. */
export async function compileMdx({ path, code, sourcePath = path }: PageSourceInput, compile: MdxCompile, plugins: MdxPlugins, remark: unknown[] = []): Promise<string> {
  const output = await compile({ value: code, path: sourcePath }, { ...mdxOptions(plugins, remark), development: true });
  return useDevShim(defineNodeEnv(String(output)).code);
}

/** The compiler's entry: TS, TSX, JSX and MDX page sources to ESM. */
export async function compileSource(input: PageSourceInput, mdx: { compile: MdxCompile; plugins: MdxPlugins }): Promise<string> {
  if (input.commonjs) return compileCommonJsSource({ path: input.path, code: input.code, conversion: input.commonjs });
  if (input.extension === ".mdx" || input.extension === ".md") return compileMdx(input, mdx.compile, mdx.plugins);
  if ([".ts", ".tsx", ".jsx"].includes(input.extension)) return compileScript(input);
  throw new Error(`${input.path}: the compiler takes .ts, .tsx, .jsx, .md and .mdx sources, not ${input.extension}`);
}
