import { lazy, Suspense } from "react";
import { Icon } from "../data/Icon";
import { UiLoader } from "../icons";
import type { AnnotatedCodeProps } from "./AnnotatedCode";

// The only path from this subpath to Monaco: `import()` keeps the editor, its
// language registrations and `@monaco-editor/react` out of the entry's static
// graph, so adapters and markdown viewing never load them.
const AnnotatedCodeEditor = lazy(() => import("./AnnotatedCode").then((module) => ({ default: module.AnnotatedCode })));

/** `AnnotatedCode`, loaded on first use; renders a loading state until the editor chunk arrives. */
export function AnnotatedCode(props: AnnotatedCodeProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
          <Icon icon={UiLoader} className="mr-2 animate-spin" />
          Loading editor
        </div>
      }
    >
      <AnnotatedCodeEditor {...props} />
    </Suspense>
  );
}

export type { AnnotatedCodeProps };
