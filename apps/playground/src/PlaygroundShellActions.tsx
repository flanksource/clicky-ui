import {
  DensitySwitcher,
  SplitButton,
  ThemeSwitcher,
  cn,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import { UiCode2, UiComment, UiFileText } from "@flanksource/clicky-ui/icons";

import { NewPageMenu, type PageAction } from "./editor/PageManagement";
import { PlaygroundViewActions } from "./PlaygroundViewActions";
import type { AnnotationVisibility, PlaygroundView } from "./route";

export type PlaygroundShellActionsProps = {
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  copyDisabled: boolean;
  pageMarkdownCopied: boolean;
  onViewChange: (view: PlaygroundView) => void;
  onAnnotationsChange: (annotations: AnnotationVisibility) => void;
  onCopyPage: () => void;
  filesystemActionsDisabled: boolean;
  filesystemActionsDisabledReason?: string;
  onNewPage: (action: PageAction) => void;
  active: boolean;
  editing: boolean;
  sourceDirty: boolean;
  onToggleEditing: () => void;
  reviewActive: boolean;
  reviewCount: number;
  onToggleReview: () => void;
  commentMode: boolean;
  onToggleCommentMode: () => void;
  onCommentWholePage: () => void;
  feedbackCopied: boolean;
  onCopyFeedback: () => void;
  feedbackCopyActions: DropdownMenuItem[];
  pageCommentCount: number;
};

export function PlaygroundShellActions(props: PlaygroundShellActionsProps) {
  return (
    <>
      <PlaygroundViewActions
        view={props.view}
        annotations={props.annotations}
        copyDisabled={props.copyDisabled}
        copied={props.pageMarkdownCopied}
        onViewChange={props.onViewChange}
        onAnnotationsChange={props.onAnnotationsChange}
        onCopy={props.onCopyPage}
      />
      <NewPageMenu
        disabled={props.filesystemActionsDisabled}
        disabledReason={props.filesystemActionsDisabledReason}
        onSelect={props.onNewPage}
      />
      <button
        type="button"
        onClick={props.onToggleEditing}
        aria-pressed={props.editing}
        disabled={!props.active}
        title="Edit this artifact's source"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
          props.editing
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:text-foreground",
        )}
      >
        <UiCode2 className="size-3.5" />
        Edit
        {props.sourceDirty && (
          <span className="size-1.5 rounded-full bg-amber-500" />
        )}
      </button>
      {props.view === "preview" && (
        <>
          <button
            type="button"
            aria-pressed={props.reviewActive}
            onClick={props.onToggleReview}
            disabled={props.reviewCount === 0}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
              props.reviewActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <UiComment className="size-3.5" />
            Review resolved ({props.reviewCount})
          </button>
          <SplitButton
            label={props.commentMode ? "Pick an element…" : "Comment"}
            icon={UiComment}
            onClick={props.onToggleCommentMode}
            items={[
              {
                label: "Comment on whole page",
                icon: UiFileText,
                onSelect: props.onCommentWholePage,
              },
            ]}
            variant={props.commentMode ? "default" : "outline"}
            size="sm"
            title="Choose comment scope"
          />
        </>
      )}
      <SplitButton
        label={props.feedbackCopied ? "Copied" : "Copy feedback"}
        onClick={props.onCopyFeedback}
        items={props.feedbackCopyActions}
        variant="outline"
        size="sm"
        primaryDisabled={props.pageCommentCount === 0}
        title="More copy actions"
      />
      <ThemeSwitcher />
      <DensitySwitcher />
    </>
  );
}
