// The built-in adapters — known coding-agent tools first, then the heuristic
// floor that claims every remaining call. Hosts are registered before both.

import type { ReactNode } from "react";
import type { ToolRenderAdapter, ToolRenderAdapterContext } from "./adapter";
import { ToolParams } from "./ToolParams";
import { ToolValue } from "./ToolValue";
import { defaultToolSummary } from "./summary";
import { knownToolRenderAdapters } from "./known-tools";

/** Context without the surface's own default view — what a default view is
 *  built from. */
export type ToolRenderBaseContext = Omit<
  ToolRenderAdapterContext,
  "defaultView"
>;

/** The built-in input rendering, also used as `ctx.defaultView` on that surface. */
export function defaultToolInputView(ctx: ToolRenderBaseContext): ReactNode {
  return (
    <ToolParams
      input={ctx.input}
      {...(ctx.tool?.inputSchema ? { schema: ctx.tool.inputSchema } : {})}
    />
  );
}

/** The built-in output rendering, also used as `ctx.defaultView` on that surface. */
export function defaultToolOutputView(ctx: ToolRenderBaseContext): ReactNode {
  return (
    <ToolValue
      value={ctx.output}
      isError={ctx.isError}
      {...(ctx.tool?.outputSchema ? { schema: ctx.tool.outputSchema } : {})}
      {...(ctx.tool?.entity ? { entity: ctx.tool.entity } : {})}
      {...(ctx.options.resolveEntityHref
        ? { resolveEntityHref: ctx.options.resolveEntityHref }
        : {})}
      {...(ctx.options.maxRows !== undefined
        ? { maxRows: ctx.options.maxRows }
        : {})}
    />
  );
}

export const defaultToolRenderAdapters: ToolRenderAdapter[] = [
  ...knownToolRenderAdapters,
  {
    id: "clicky:default",
    match: () => true,
    renderSummary: (ctx) => defaultToolSummary(ctx),
    renderInput: defaultToolInputView,
    renderOutput: defaultToolOutputView,
  },
];
