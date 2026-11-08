import { useState } from "react";
import { Button } from "@flanksource/clicky-ui";

export function SvgDeleteButton({ disabled, saving, instances, onDelete }: {
  disabled: boolean;
  saving: boolean;
  instances: number;
  onDelete: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  return <div className="space-y-density-2 border-t border-border pt-density-2">
    {confirming ? <>
      <p>Delete this SVG element and its children from source?{instances > 1 ? ` This call site renders ${instances} instances; all will be removed.` : ""}</p>
      <div className="flex flex-wrap gap-density-2">
        <Button type="button" size="xs" variant="destructive" disabled={disabled || saving} onClick={() => void (async () => { await onDelete(); setConfirming(false); })()}>{saving ? "Deleting…" : "Confirm delete"}</Button>
        <Button type="button" size="xs" variant="ghost" disabled={saving} onClick={() => setConfirming(false)}>Cancel deletion</Button>
      </div>
    </> : <Button type="button" size="xs" variant="destructive" disabled={disabled || saving} onClick={() => setConfirming(true)}>Delete SVG element</Button>}
    {disabled && !saving ? <p className="text-muted-foreground">Save or revert pending edits before deleting.</p> : null}
  </div>;
}
