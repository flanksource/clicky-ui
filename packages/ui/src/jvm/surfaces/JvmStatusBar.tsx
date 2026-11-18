import type { ReactNode } from "react";
import { InlineError } from "../../rpc/InlineError";
import { useJvmStatus } from "./jvm-context";

export type JvmStatusBarProps = {
  /** Host identity of the JVM, e.g. an agent id or deployment name. */
  label?: ReactNode;
  /** Host actions on the right (refresh, links). */
  actions?: ReactNode;
};

function Fact({ tone, children }: { tone: "ok" | "off" | "pending"; children: ReactNode }) {
  const dot = tone === "ok" ? "bg-emerald-500" : tone === "off" ? "bg-amber-500" : "bg-muted-foreground/50";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`size-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

/** One line on what the JVM in scope allows: runtime mutations and bytecode instrumentation. */
export function JvmStatusBar({ label, actions }: JvmStatusBarProps) {
  const status = useJvmStatus();
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {label ? <span className="font-medium text-foreground">{label}</span> : null}
        {status.isPending ? <Fact tone="pending">Checking runtime capabilities…</Fact> : null}
        {status.data ? (
          <>
            <Fact tone={status.data.allowMutation ? "ok" : "off"}>Runtime changes {status.data.allowMutation ? "enabled" : "disabled"}</Fact>
            {status.data.instrumentation === undefined ? null : (
              <Fact tone={status.data.instrumentation ? "ok" : "off"}>Instrumentation {status.data.instrumentation ? "attached" : "not attached"}</Fact>
            )}
          </>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      {status.error ? <InlineError className="w-full" title="Cannot read JVM status" error={status.error} /> : null}
    </div>
  );
}
