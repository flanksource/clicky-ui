import { cn } from "../../lib/utils";
import type { JvmClassRef, JvmPatch } from "../protocol/types";

export type PatchedClassListProps = {
  patches: JvmPatch[];
  /** The class in view. */
  selected?: JvmClassRef | undefined;
  onSelect: (ref: JvmClassRef) => void;
  className?: string | undefined;
};

/** The classes currently patched in the JVM, so one can be found again without searching the tree. */
export function PatchedClassList({ patches, selected, onSelect, className }: PatchedClassListProps) {
  const patched = patches.filter((patch) => patch.patched);
  if (patched.length === 0) return null;
  return (
    <div className={cn("shrink-0 rounded-md border border-border", className)}>
      <p className="border-b border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">Patched in this JVM ({patched.length})</p>
      <ul className="max-h-32 overflow-auto">
        {patched.map((patch) => {
          const current = selected?.name === patch.class && selected.loader === patch.loader;
          return (
            <li key={`${patch.loader}:${patch.class}`}>
              <button
                type="button"
                aria-current={current ? "true" : undefined}
                title={patch.error ?? patch.class}
                className={cn("w-full truncate px-2 py-1 text-left font-mono text-[11px] hover:bg-accent", current && "bg-primary/10")}
                onClick={() => onSelect({ name: patch.class, loader: patch.loader })}
              >
                {patch.class}
                {patch.error ? " (stale)" : ""}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
