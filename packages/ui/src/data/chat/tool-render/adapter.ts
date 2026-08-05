// L3 of the tool-render pipeline: host adapters. A host claims a tool call via
// `match` and contributes domain rendering for one or more surfaces (the
// collapsed summary, the input params, the output). The first registered
// adapter with a renderer for that surface wins; the built-in heuristics are
// appended last so they are always the floor. Mirrors the cache-browser
// CacheNodeAdapter contract.

import type { ReactNode } from "react";
import type { AnyToolPart, ToolMeta } from "../types";

export type ToolRenderSurface = "summary" | "input" | "output";

export type ToolRenderAdapterContext = {
  part: AnyToolPart;
  toolName: string;
  /** Catalog entry for this tool, when the host supplied a tool catalog. */
  tool?: ToolMeta | undefined;
  state: AnyToolPart["state"];
  input: unknown;
  /** Normalized output — transport envelope unwrapped and JSON parsed. */
  output: unknown;
  isError: boolean;
  /** Built-in rendering for the surface being resolved, so an adapter can wrap
   *  rather than replace it. */
  defaultView: ReactNode;
  /** Registry options (`resolveEntityHref`, `maxRows`, …). */
  options: ToolRenderRegistryOptions;
};

export type ToolRenderAdapter = {
  /** Stable identifier, used as a React key and for debugging. */
  id: string;
  /** Claim the tool call. Evaluated per surface, in registration order. */
  match: (ctx: ToolRenderAdapterContext) => boolean;
  /** Collapsed header line, rendered beside the tool name. */
  renderSummary?: ((ctx: ToolRenderAdapterContext) => ReactNode) | undefined;
  renderInput?: ((ctx: ToolRenderAdapterContext) => ReactNode) | undefined;
  renderOutput?: ((ctx: ToolRenderAdapterContext) => ReactNode) | undefined;
};

export type ToolRenderRegistryOptions = {
  /** Deep-link a rendered entity record. clicky-ui knows no routes; hosts do. */
  resolveEntityHref?: ((entity: string, id: string) => string | undefined) | undefined;
  /** Row cap for list/paged rendering. Defaults to 25. */
  maxRows?: number | undefined;
  /** Tool catalog, used to resolve a `ToolMeta` (and its schemas) by name. */
  tools?: ToolMeta[] | undefined;
};

/** Ordered set of tool renderers. First match wins per surface, so an adapter
 *  that only defines `renderOutput` still leaves the input to the built-ins. */
export class ToolRenderRegistry {
  readonly adapters: ToolRenderAdapter[];
  readonly options: ToolRenderRegistryOptions;
  private readonly byName: Map<string, ToolMeta>;

  constructor(adapters: ToolRenderAdapter[] = [], options: ToolRenderRegistryOptions = {}) {
    this.adapters = adapters;
    this.options = options;
    this.byName = new Map((options.tools ?? []).map((tool) => [tool.name, tool]));
  }

  /** Catalog entry for a tool name, or undefined when no catalog was supplied. */
  tool(name: string): ToolMeta | undefined {
    return this.byName.get(name);
  }

  /** A copy sharing the same adapters with merged options — lets <Chat> fold
   *  its tool catalog into a registry the host built. */
  with(options: ToolRenderRegistryOptions): ToolRenderRegistry {
    return new ToolRenderRegistry(this.adapters, { ...this.options, ...options });
  }

  private resolve(
    ctx: ToolRenderAdapterContext,
    surface: ToolRenderSurface,
  ): ReactNode | null {
    for (const adapter of this.adapters) {
      const render =
        surface === "summary"
          ? adapter.renderSummary
          : surface === "input"
            ? adapter.renderInput
            : adapter.renderOutput;
      if (!render || !adapter.match(ctx)) continue;
      return render(ctx);
    }
    return null;
  }

  resolveSummary(ctx: ToolRenderAdapterContext): ReactNode | null {
    return this.resolve(ctx, "summary");
  }

  resolveInput(ctx: ToolRenderAdapterContext): ReactNode | null {
    return this.resolve(ctx, "input");
  }

  resolveOutput(ctx: ToolRenderAdapterContext): ReactNode | null {
    return this.resolve(ctx, "output");
  }
}

/** Convenience factory: claim tools by exact name, name list, or pattern. */
export function toolNameAdapter(
  id: string,
  names: string | string[] | RegExp,
  surfaces: Pick<ToolRenderAdapter, "renderSummary" | "renderInput" | "renderOutput">,
): ToolRenderAdapter {
  const matches =
    names instanceof RegExp
      ? (name: string) => names.test(name)
      : Array.isArray(names)
        ? (name: string) => names.includes(name)
        : (name: string) => name === names;
  return { id, match: (ctx) => matches(ctx.toolName), ...surfaces };
}
