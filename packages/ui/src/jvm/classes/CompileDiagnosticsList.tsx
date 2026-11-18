import { Callout } from "../../data/Callout";
import { cn } from "../../lib/utils";
import type { CompileDiagnostic, JvmCompilation } from "../protocol/types";

export type CompileDiagnosticsListProps = {
  /** The last compile or patch answer; nothing renders without one. */
  compilation: JvmCompilation | null;
  /** Replaces the success banner once the patch is applied, e.g. with when the class is restored. */
  appliedMessage?: string | undefined;
  /** Makes each row a button that jumps to the diagnostic's line. */
  onSelectDiagnostic?: ((diagnostic: CompileDiagnostic) => void) | undefined;
  className?: string | undefined;
};

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

function banner(compilation: JvmCompilation, appliedMessage: string | undefined) {
  const errors = compilation.diagnostics.filter((diagnostic) => diagnostic.kind === "ERROR").length;
  const warnings = compilation.diagnostics.length - errors;
  if (!compilation.success) {
    return {
      variant: "caution" as const,
      label: "Compilation failed",
      text: errors > 0 ? `Compilation failed with ${plural(errors, "error")}.` : "Compilation failed and the compiler reported no diagnostics.",
    };
  }
  if (compilation.applied && appliedMessage) return { variant: "tip" as const, label: "Applied", text: appliedMessage };
  return {
    variant: warnings > 0 ? ("warning" as const) : ("tip" as const),
    label: "Compiles",
    text: warnings > 0 ? `Compiles with ${plural(warnings, "warning")}. Not applied yet.` : "Compiles cleanly. Not applied yet.",
  };
}

function DiagnosticRow({ diagnostic, onSelect }: { diagnostic: CompileDiagnostic; onSelect: CompileDiagnosticsListProps["onSelectDiagnostic"] }) {
  const content = (
    <>
      <span className="w-12 shrink-0 tabular-nums">{diagnostic.line > 0 ? `${diagnostic.line}:${diagnostic.column}` : "—"}</span>
      <span className="w-16 shrink-0 uppercase">{diagnostic.kind}</span>
      <span className="min-w-0 flex-1 break-words">{diagnostic.message}</span>
    </>
  );
  const tone = diagnostic.kind === "ERROR" ? "text-destructive" : "text-muted-foreground";
  const row = "flex w-full gap-2 px-3 py-1 text-left font-mono text-[11px]";
  return (
    <li>
      {onSelect && diagnostic.line > 0 ? (
        <button type="button" className={cn(row, tone, "hover:bg-accent")} onClick={() => onSelect(diagnostic)}>
          {content}
        </button>
      ) : (
        <div className={cn(row, tone)}>{content}</div>
      )}
    </li>
  );
}

/** The compiler's answer for the current draft: a verdict banner and every javac message with its position. */
export function CompileDiagnosticsList({ compilation, appliedMessage, onSelectDiagnostic, className }: CompileDiagnosticsListProps) {
  if (!compilation) return null;
  const { variant, label, text } = banner(compilation, appliedMessage);
  return (
    <div className={cn("shrink-0 border-t border-border", className)}>
      <Callout variant={variant} label={label} className="my-0 rounded-none">
        {text}
      </Callout>
      {compilation.diagnostics.length > 0 ? (
        <ul aria-label="Compiler diagnostics" className="max-h-40 overflow-auto">
          {compilation.diagnostics.map((diagnostic, index) => (
            <DiagnosticRow key={`${diagnostic.line}:${diagnostic.column}:${index}`} diagnostic={diagnostic} onSelect={onSelectDiagnostic} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
