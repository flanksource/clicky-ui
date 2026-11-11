export const PAGE_AGENT_URL = "/__runtime/page-agent.js";
/** The MDX compiler the frame loads only to export a page with library compiler plugins. */
export const EXPORT_COMPILER_URL = "/__runtime/export-compiler.js";
/** Static runtime modules the worker serves with the page's import map applied, by their runtime URL. */
export const RUNTIME_MODULES: Record<string, string> = { "/__runtime/editing.js": "editing.js", [PAGE_AGENT_URL]: "page-agent.js", [EXPORT_COMPILER_URL]: "export-compiler.js" };

export async function runtimeModuleSource(options: { origin: string; fetch: typeof fetch; file: string }): Promise<string> {
  // Called unbound: the worker's native fetch throws "Illegal invocation" when `this` is the options object.
  const fetcher = options.fetch;
  const response = await fetcher(`${options.origin}/${options.file}`);
  if (!response.ok) throw new Error(`${options.file}: HTTP ${response.status}`);
  return response.text();
}
