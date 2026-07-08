import type { ReactNode } from "react";
import { Button } from "../../../components/button";
import { Icon } from "../../Icon";
import { UiCheck, UiPlay } from "../../../icons";

// Sticky action bar (design .footer). Rendered by the shell only when the
// host wires onSave/onCancel.
export function Footer({
  status,
  saveLabel,
  onSave,
  onCancel,
}: {
  status: ReactNode;
  saveLabel: string;
  onSave?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
}) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-density-3 border-t border-border bg-background/90 px-density-4 py-density-2 backdrop-blur">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        <Icon icon={UiCheck} className="size-4" />
        {status}
      </span>
      <div className="flex items-center gap-density-2">
        {onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {onSave && (
          <Button size="sm" onClick={onSave}>
            <Icon icon={UiPlay} className="size-4" />
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
