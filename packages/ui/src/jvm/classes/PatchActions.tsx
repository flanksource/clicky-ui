import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { LEASE_OPTIONS } from "./patch-leases";

export type PatchBusy = "compile" | "patch" | "restore" | null;

export type PatchActionsProps = {
  editing: boolean;
  /** The draft differs from the decompiled source. */
  dirty: boolean;
  /** The compile preview succeeded for the draft as it is now. */
  compiledCurrent: boolean;
  /** The class is currently patched in the JVM. */
  patched: boolean;
  busy: PatchBusy;
  leaseSeconds: number;
  onLeaseSecondsChange: (seconds: number) => void;
  canEdit: boolean;
  /** Shown on the disabled Edit button; a control that is off without a reason reads as broken. */
  editDisabledReason?: string | undefined;
  /** The mutation gate passes: the agent, the host and the operator all allow writing. */
  mutationAllowed: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onCompile: () => void;
  onApply: () => void;
  onRestore: () => void;
};

const GATE_REASON = "Allow replacing class bytecode first.";

/** Edit, compile preview, lease choice, apply and restore for one class. Apply needs a clean compile of the current draft. */
export function PatchActions({
  editing,
  dirty,
  compiledCurrent,
  patched,
  busy,
  leaseSeconds,
  onLeaseSecondsChange,
  canEdit,
  editDisabledReason,
  mutationAllowed,
  onEdit,
  onCancel,
  onCompile,
  onApply,
  onRestore,
}: PatchActionsProps) {
  const idle = busy === null;
  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {patched ? (
          <Button
            size="sm"
            variant="outline"
            loading={busy === "restore"}
            disabled={!idle || !mutationAllowed}
            title={mutationAllowed ? undefined : GATE_REASON}
            onClick={onRestore}
          >
            Restore original
          </Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={!canEdit || !idle} title={canEdit ? undefined : editDisabledReason} onClick={onEdit}>
          Edit
        </Button>
      </div>
    );
  }
  const applyReason = !mutationAllowed ? GATE_REASON : !compiledCurrent ? "Compile the current source first." : undefined;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" disabled={!idle} onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" variant="outline" loading={busy === "compile"} disabled={!idle || !dirty} onClick={onCompile}>
        Compile preview
      </Button>
      <label className="flex items-center gap-1 text-xs text-muted-foreground" title="The agent restores the original bytecode when this ends">
        for
        <Select
          aria-label="Restore original bytecode after"
          className="h-7 w-28 text-xs"
          value={String(leaseSeconds)}
          disabled={!idle}
          onChange={(event) => onLeaseSecondsChange(Number(event.target.value))}
          options={LEASE_OPTIONS.map((option) => ({ value: String(option.seconds), label: option.label }))}
        />
      </label>
      <Button
        size="sm"
        loading={busy === "patch"}
        disabled={!idle || !dirty || !compiledCurrent || !mutationAllowed}
        title={applyReason}
        onClick={onApply}
      >
        Apply patch
      </Button>
    </div>
  );
}
