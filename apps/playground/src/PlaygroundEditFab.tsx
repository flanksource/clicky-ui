import { IconButton, cn } from "@flanksource/clicky-ui";
import { UiCode2, UiPalette } from "@flanksource/clicky-ui/icons";

export type PlaygroundEditFabProps = {
  editing: boolean;
  sourceDirty: boolean;
  onToggleEditing: () => void;
  editingDisabledReason?: string;
  designing: boolean;
  showDesign: boolean;
  onToggleDesign: () => void;
  designDisabledReason?: string;
};

const FAB_BUTTON =
  "size-9 rounded-full hover:bg-accent aria-pressed:bg-accent aria-pressed:text-foreground [@media(pointer:coarse)]:size-11";

export function PlaygroundEditFab(props: PlaygroundEditFabProps) {
  return (
    <div
      role="group"
      aria-label="Page editing tools"
      className="absolute right-3 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-md"
    >
      <IconButton
        icon={UiCode2}
        label={
          props.sourceDirty ? "Edit source (unsaved changes)" : "Edit source"
        }
        onClick={props.onToggleEditing}
        aria-pressed={props.editing}
        disabled={props.editingDisabledReason !== undefined}
        title={props.editingDisabledReason ?? "Edit this artifact's source"}
        className={cn(
          FAB_BUTTON,
          props.sourceDirty &&
            "relative after:absolute after:right-1 after:top-1 after:size-1.5 after:rounded-full after:bg-warning",
        )}
      />
      {props.showDesign && (
        <IconButton
          icon={UiPalette}
          label="Design mode"
          onClick={props.onToggleDesign}
          aria-pressed={props.designing}
          disabled={props.designDisabledReason !== undefined}
          title={
            props.designDisabledReason ??
            "Edit diagram styles and text in place"
          }
          className={FAB_BUTTON}
        />
      )}
    </div>
  );
}
