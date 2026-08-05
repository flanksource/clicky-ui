// Registry factories. Kept apart from adapter.ts so the contract file never
// has to import the built-in renderers (which would close an import cycle).

import {
  ToolRenderRegistry,
  type ToolRenderAdapter,
  type ToolRenderRegistryOptions,
} from "./adapter";
import { defaultToolRenderAdapters } from "./defaults";

/** Host adapters first, the built-in heuristics appended after — hosts win and
 *  the defaults are always the floor. */
export function createToolRenderRegistry(
  adapters: ToolRenderAdapter[] = [],
  options: ToolRenderRegistryOptions = {},
): ToolRenderRegistry {
  return new ToolRenderRegistry([...adapters, ...defaultToolRenderAdapters], options);
}

/** Accepts either form of the `toolRenderers` prop and merges registry options. */
export function toToolRenderRegistry(
  input: ToolRenderAdapter[] | ToolRenderRegistry | undefined,
  options: ToolRenderRegistryOptions = {},
): ToolRenderRegistry {
  if (input instanceof ToolRenderRegistry) return input.with(options);
  return createToolRenderRegistry(input ?? [], options);
}
