import type { ReactNode } from "react";
import { cn } from "@flanksource/clicky-ui";

export function PlaygroundBanner({
  tone,
  children,
}: {
  tone: "danger" | "warning";
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "mb-density-3 rounded-md border px-3 py-2 text-xs",
        tone === "danger"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-amber-500/40 bg-amber-500/10 text-amber-700 [[data-theme=dark]_&]:text-amber-300",
      )}
    >
      {children}
    </div>
  );
}

export function EmptyPlayground() {
  return (
    <div className="mx-auto max-w-prose space-y-density-3 p-density-4 text-sm">
      <h1 className="text-lg font-semibold">No artifacts yet</h1>
      <p className="text-muted-foreground">
        Create{" "}
        <code className="rounded bg-muted px-1">src/pages/my-idea.tsx</code>{" "}
        with a default export and it appears here — no registration step.
      </p>
    </div>
  );
}
