import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { Callout } from "../../data/Callout";
import { UiRefresh } from "../../icons";
import { canRestorePatch, summarisePatches, type PatchFailure } from "../model/patches";
import type { JvmPatch } from "../protocol/types";
import { PatchRegisterTable } from "./PatchRegisterTable";
import { RegisterSummary } from "./RegisterSummary";

export type PatchRegisterProps = {
  patches: JvmPatch[];
  now: number;
  /** Restore, renew and "Restore all" are enabled. */
  canMutate: boolean;
  /** Key (`patchKey`) of the row being restored or renewed. */
  busyKey?: string | undefined;
  /** Name of the class "Restore all" is working on right now. */
  restoringAll?: string | undefined;
  /** Restores and renewals that failed, shown until the next attempt. */
  failures: PatchFailure[];
  onRestore: (patch: JvmPatch) => void;
  onRestoreAll: (patches: JvmPatch[]) => void;
  onRenew: (patch: JvmPatch) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  renderClassLink?: (patch: JvmPatch) => ReactNode;
  /** Rendered beside the buttons, e.g. a `MutationGate`. */
  toolbar?: ReactNode;
  /** Appended to the empty-register message, e.g. a link to a class workbench. */
  emptyHint?: ReactNode;
  className?: string;
};

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/** The patch register: summary, warnings, the table and Restore all. Props-only; see `PatchesSurface` for the data-wired version. */
export function PatchRegister({
  patches,
  now,
  canMutate,
  busyKey,
  restoringAll,
  failures,
  onRestore,
  onRestoreAll,
  onRenew,
  onRefresh,
  refreshing = false,
  renderClassLink,
  toolbar,
  emptyHint,
  className,
}: PatchRegisterProps) {
  const summary = summarisePatches(patches);
  const restorable = patches.filter(canRestorePatch);
  const working = restoringAll !== undefined;

  return (
    <div className={className ?? "flex h-full min-h-0 flex-col gap-3"}>
      <div className="flex flex-wrap items-center gap-3">
        <RegisterSummary summary={summary} />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {toolbar}
          {onRefresh ? (
            <Button size="sm" variant="outline" loading={refreshing} onClick={onRefresh}>
              <UiRefresh /> Refresh
            </Button>
          ) : null}
          <Button size="sm" variant="destructive" disabled={!canMutate || restorable.length === 0 || working || busyKey !== undefined} onClick={() => onRestoreAll(restorable)}>
            {working ? `Restoring ${restoringAll}…` : `Restore all (${restorable.length})`}
          </Button>
        </div>
      </div>

      {summary.unleased > 0 ? (
        <Callout variant="warning" label="No lease" className="my-0">
          {summary.unleased} {plural(summary.unleased, "class has", "classes have")} no lease, so nothing will restore {plural(summary.unleased, "it", "them")} automatically. The JVM runs the patched code
          until someone restores {plural(summary.unleased, "it", "them")} here.
        </Callout>
      ) : null}

      {failures.length > 0 ? (
        <Callout variant="caution" label="Change failed" className="my-0">
          <ul className="space-y-0.5 font-mono text-xs">
            {failures.map((failure) => (
              <li key={failure.key}>
                {failure.className}: {failure.message}
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {patches.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">This JVM is running its original bytecode.</p>
          <p className="max-w-md text-xs text-muted-foreground">Nothing has been patched, or everything that was has been restored. {emptyHint}</p>
        </div>
      ) : (
        <PatchRegisterTable
          patches={patches}
          now={now}
          canMutate={canMutate}
          busyKey={busyKey}
          busy={working}
          onRestore={onRestore}
          onRenew={onRenew}
          renderClassLink={renderClassLink}
        />
      )}
    </div>
  );
}
