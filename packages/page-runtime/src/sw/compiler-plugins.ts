import type { CompilerPlugins } from "../schema.ts";
import { validateJson } from "../host/message-values.ts";
import { keys, record } from "./profile.ts";

/** Validates a library's compiler plugin declaration; a library may only contribute modules it exports itself. */
export function validateCompilerPlugins(value: unknown, options: { library: string; path: string }): CompilerPlugins {
  const declared = record(value, options.path);
  keys(declared, ["remark"], options.path);
  if (!Array.isArray(declared.remark) || !declared.remark.length) throw new Error(`${options.path}.remark: expected a non-empty array of plugins`);
  for (const [index, entry] of declared.remark.entries()) {
    const path = `${options.path}.remark[${index}]`;
    const plugin = record(entry, path);
    keys(plugin, ["module", "options"], path);
    if (typeof plugin.module !== "string" || !plugin.module.startsWith(`${options.library}/`)) throw new Error(`${path}.module: expected a ${options.library}/… module the library exports, got ${String(plugin.module)}`);
    if (plugin.options !== undefined) validateJson(plugin.options);
  }
  return declared as CompilerPlugins;
}
