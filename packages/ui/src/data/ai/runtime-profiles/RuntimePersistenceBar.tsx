import { Button } from "../../../components/button";
import { Icon } from "../../Icon";
import { UiSave } from "../../../icons";
import { cn } from "../../../lib/utils";
import type { RuntimeProfilesPersistence } from "./types";

export function RuntimePersistenceBar({
  persistence,
  className,
}: {
  persistence: RuntimeProfilesPersistence;
  className?: string | undefined;
}) {
  const locked = !persistence.dirty || persistence.saving;
  return (
    <div
      role="group"
      aria-label="Persistence"
      className={cn(
        "flex flex-wrap items-center gap-density-2 rounded-md border border-border bg-muted/30 px-density-3 py-density-1 text-xs",
        className,
      )}
    >
      <span className="text-muted-foreground">
        {persistence.saving
          ? "Saving…"
          : persistence.dirty
            ? "Unsaved changes"
            : "All changes saved"}
      </span>
      {persistence.error && (
        <span role="alert" className="font-medium text-destructive">
          {persistence.error}
        </span>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={locked}
        onClick={persistence.onDiscard}
      >
        Discard
      </Button>
      <Button size="sm" disabled={locked} onClick={persistence.onSave}>
        <Icon icon={UiSave} className="size-3.5" />
        Save
      </Button>
    </div>
  );
}
