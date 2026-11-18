import { DropdownMenu, IconButton } from "@flanksource/clicky-ui";
import {
  UiArchive,
  UiDotsVertical,
  UiEye,
  UiEyeClosed,
} from "@flanksource/clicky-ui/icons";
import type { AnnotationVisibility } from "../route";

export function CommentVisibilityMenu({
  annotations,
  showRejected,
  onAnnotationsChange,
  onShowRejectedChange,
}: {
  annotations: AnnotationVisibility;
  showRejected: boolean;
  onAnnotationsChange: (value: AnnotationVisibility) => void;
  onShowRejectedChange: (value: boolean) => void;
}) {
  return (
    <DropdownMenu
      align="right"
      menuLabel="Comment visibility"
      trigger={
        <IconButton
          icon={UiDotsVertical}
          label="Comment options"
          className="size-8 hover:bg-accent [@media(pointer:coarse)]:size-11"
        />
      }
      items={[
        {
          label: showRejected ? "Hide rejected" : "Show rejected",
          icon: UiArchive,
          onSelect: () => onShowRejectedChange(!showRejected),
        },
        {
          label:
            annotations === "hidden" ? "Show annotations" : "Hide annotations",
          icon: annotations === "hidden" ? UiEye : UiEyeClosed,
          onSelect: () =>
            onAnnotationsChange(
              annotations === "visible" ? "hidden" : "visible",
            ),
        },
      ]}
    />
  );
}
