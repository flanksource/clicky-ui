import { compile } from "@mdx-js/mdx";
import { init, parse } from "es-module-lexer";
import { compileMdx } from "../sw/compile.ts";
import { BASE_PLUGINS } from "../sw/compiler.ts";

/**
 * Compiles a Markdown page for an HTML or PDF export: the base plugins, then the library-declared `remark` plugins.
 * Imported Markdown is compiled by the worker without those plugins, so an export that would include it fails.
 */
export async function compileExportMdx(options: { path: string; code: string; remark: unknown[] }): Promise<string> {
  const extension = options.path.slice(options.path.lastIndexOf("."));
  const code = await compileMdx({ path: options.path, extension, code: options.code }, compile, BASE_PLUGINS, options.remark);
  await init();
  const [imports] = parse(code);
  const markdown = imports.map((item) => item.specifier).filter((specifier): specifier is string => typeof specifier === "string" && /^\.{0,2}\//.test(specifier) && /\.mdx?(?:\?|$)/.test(specifier));
  if (markdown.length) throw new Error(`${options.path}: export compiler plugins do not apply to imported Markdown (${markdown.join(", ")}); move that content into the exported page`);
  return code;
}
