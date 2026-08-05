// The registry is provided once by <Chat> and read by <ToolCall> through
// context, so no new props thread through Conversation/Message. A `.ts` file
// on purpose: oxlint's react/only-export-components forbids exporting a hook
// alongside components.

import { createContext, useContext } from "react";
import type { ToolRenderRegistry } from "./adapter";
import { createToolRenderRegistry } from "./registry";

const Context = createContext<ToolRenderRegistry | null>(null);

export const ToolRenderRegistryProvider = Context.Provider;

let fallback: ToolRenderRegistry | null = null;

/** The nearest provided registry, or a shared default one — so a standalone
 *  <ToolCall> in a test or story still renders heuristically. */
export function useToolRenderRegistry(): ToolRenderRegistry {
  const provided = useContext(Context);
  if (provided) return provided;
  fallback ??= createToolRenderRegistry();
  return fallback;
}
