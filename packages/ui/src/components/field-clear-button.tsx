import { Icon } from "../data/Icon";
import { UiClose } from "../icons";

export type ClearableFieldProps = {
  /** Show an in-field clear action when a value is present. */
  clearable?: boolean;
  /** Commits the cleared value; the owner decides between null, empty and deletion. */
  onClear?: () => void;
  clearLabel?: string;
};

export function FieldClearButton({
  onClear,
  clearLabel = "Clear value",
}: ClearableFieldProps) {
  return (
    <button
      type="button"
      aria-label={clearLabel}
      title={clearLabel}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        if (!onClear) throw new Error("A clearable field requires onClear");
        onClear();
      }}
    >
      <Icon icon={UiClose} className="text-sm" />
    </button>
  );
}
