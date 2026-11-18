import {
  SplitButton,
  cn,
  type AppShellNavSection,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import {
  UiCode2,
  UiComment,
  UiDotsVertical,
  UiFileText,
  UiPalette,
} from "@flanksource/clicky-ui/icons";

import { PlaygroundPreferences } from "./PlaygroundPreferences";
import { VocabularyStatus } from "./vocabularies/VocabularyStatus";
import { NewPageMenu, type PageAction } from "./editor/PageManagement";
import { PlaygroundViewActions } from "./PlaygroundViewActions";
import type { AnnotationVisibility, PlaygroundView } from "./route";
import { BookmarkletInstall } from "./bookmarklet/BookmarkletInstall";
import { PlaygroundAgentInstructions } from "./PlaygroundAgentInstructions";
import { AgentSessionButton } from "./agent-runs/AgentSessionButton";
import { PlaygroundNotifications } from "./PlaygroundNotifications";

export type PlaygroundShellActionsProps = {
  recent: AppShellNavSection;
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  showRejected: boolean;
  onShowRejectedChange: (show: boolean) => void;
  copyDisabled: boolean;
  pageMarkdownCopied: boolean;
  onViewChange: (view: PlaygroundView) => void;
  onAnnotationsChange: (annotations: AnnotationVisibility) => void;
  onCopyPage: () => void;
  filesystemActionsDisabled: boolean;
  filesystemActionsDisabledReason?: string;
  onNewPage: (action: PageAction) => void;
  active: boolean;
  /** A markdown page has its own Rendered/Source toggle and editor. */
  markdownPage: boolean;
  editing: boolean;
  sourceDirty: boolean;
  onToggleEditing: () => void;
  /** Why Edit cannot switch right now (a visual edit in flight); unset when it can. */
  editingDisabledReason?: string;
  /** Design mode: visual editing of facet diagrams on the open page. */
  designing: boolean;
  onToggleDesign: () => void;
  /** Why Design cannot switch right now (unsaved source); unset when it can. */
  designDisabledReason?: string;
  reviewActive: boolean;
  reviewCount: number;
  onToggleReview: () => void;
  onCommentWholePage: () => void;
  feedbackCopied: boolean;
  onCopyFeedback: () => void;
  feedbackCopyActions: DropdownMenuItem[];
  pageCommentCount: number;
  /** Repository lint counts could not be loaded; reported in the status dropdown. */
  problemsError: string | undefined;
  /** The phone overflow row: leaves out what {@link PlaygroundMobileActions} already shows. */
  overflow?: boolean;
};

const MOBILE_ICON_BUTTON =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [@media(pointer:coarse)]:size-11";

/**
 * Keep page comments, agent sessions and preferences in the phone header.
 */
export function PlaygroundMobileActions(
  props: Pick<
    PlaygroundShellActionsProps,
    | "view"
    | "active"
    | "onCommentWholePage"
    | "sourceDirty"
    | "recent"
    | "problemsError"
  > & { moreOpen: boolean; onToggleMore: () => void },
) {
  return (
    <>
      {props.view === "preview" && props.active && (
        <button
          type="button"
          onClick={props.onCommentWholePage}
          aria-label="Comment on page"
          title="Comment on page"
          className={MOBILE_ICON_BUTTON}
        >
          <UiComment className="size-4" />
        </button>
      )}
      <button
        type="button"
        onClick={props.onToggleMore}
        aria-expanded={props.moreOpen}
        aria-label="More actions"
        title="More actions"
        className={cn(MOBILE_ICON_BUTTON, props.moreOpen && "bg-accent text-foreground")}
      >
        <UiDotsVertical className="size-4" />
      </button>
      <VocabularyStatus problemsError={props.problemsError} />
      <AgentSessionButton compact />
      <PlaygroundNotifications recent={props.recent} />
      <PlaygroundPreferences sourceDirty={props.sourceDirty} />
    </>
  );
}

export function PlaygroundShellActions(props: PlaygroundShellActionsProps) {
  return (
    <>
      <PlaygroundAgentInstructions />
      {!props.overflow && <AgentSessionButton />}
      <BookmarkletInstall />
      {props.active && (
        <PlaygroundViewActions
          view={props.view}
          annotations={props.annotations}
          showRejected={props.showRejected}
          onShowRejectedChange={props.onShowRejectedChange}
          copyDisabled={props.copyDisabled}
          copied={props.pageMarkdownCopied}
          onViewChange={props.onViewChange}
          onAnnotationsChange={props.onAnnotationsChange}
          onCopy={props.onCopyPage}
          viewToggle={!props.markdownPage}
        />
      )}
      <NewPageMenu
        disabled={props.filesystemActionsDisabled}
        disabledReason={props.filesystemActionsDisabledReason}
        onSelect={props.onNewPage}
      />
      {props.active && !props.markdownPage && (
        <>
          <button
            type="button"
            onClick={props.onToggleEditing}
            aria-pressed={props.editing}
            disabled={!props.active || props.editingDisabledReason !== undefined}
            title={props.editingDisabledReason ?? "Edit this artifact's source"}
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
            <button
              type="button"
              onClick={props.onToggleDesign}
              aria-pressed={props.designing}
              disabled={props.designDisabledReason !== undefined}
              title={props.designDisabledReason ?? "Edit diagram styles and text in place"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
                props.designing
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <UiPalette className="size-3.5" />
              Design
            </button>
          )}
        </>
      )}
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
          {!props.overflow && (
            <button
              type="button"
              onClick={props.onCommentWholePage}
              disabled={!props.active}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <UiFileText className="size-3.5" />
              Comment on page
            </button>
          )}
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
      {!props.overflow && <VocabularyStatus problemsError={props.problemsError} />}
      {!props.overflow && <PlaygroundNotifications recent={props.recent} />}
      {!props.overflow && <PlaygroundPreferences sourceDirty={props.sourceDirty} />}
    </>
  );
}
