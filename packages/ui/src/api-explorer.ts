import { createElement, lazy, Suspense } from "react";
import type { EntityExplorerAppProps } from "./rpc/EntityExplorerApp";

export { ApiExplorer, DEFAULT_OPENAPI_URL, type ApiExplorerProps } from "./rpc/ApiExplorer";

const LazyEntityExplorerApp = lazy(async () => {
  const mod = await import("./rpc/EntityExplorerApp");
  return { default: mod.EntityExplorerApp };
});

export type { EntityExplorerAppProps };

export function EntityExplorerApp(props: EntityExplorerAppProps) {
  return createElement(
    Suspense,
    {
      fallback: createElement(
        "div",
        { className: "p-4 text-sm text-muted-foreground" },
        "Loading explorer...",
      ),
    },
    createElement(LazyEntityExplorerApp, props),
  );
}
