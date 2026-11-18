import {
  IconButton,
  cn,
  type AppShellNavSection,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import {
  UiChecks,
  UiChatDots,
  UiCopy,
  UiSliders,
} from "@flanksource/clicky-ui/icons";

import { PlaygroundPreferences } from "./PlaygroundPreferences";
import { VocabularyStatus } from "./vocabularies/VocabularyStatus";
import { pageActionItems, type PageAction } from "./editor/PageManagement";
import { PlaygroundViewActions } from "./PlaygroundViewActions";
import type { PlaygroundView } from "./route";
import { PlaygroundMoreActions } from "./PlaygroundMoreActions";
import { AgentSessionButton } from "./agent-runs/AgentSessionButton";
import { PlaygroundNotifications } from "./PlaygroundNotifications";

export type PlaygroundShellActionsProps = {
  recent: AppShellNavSection;
  view: PlaygroundView;
  copyDisabled: boolean;
  pageMarkdownCopied: boolean;
  onViewChange: (view: PlaygroundView) => void;
  onCopyPage: () => void;
  filesystemActionsDisabled: boolean;
  filesystemActionsDisabledReason?: string;
  onPageAction: (action: PageAction) => void;
  fileActions: boolean;
  active: boolean;
  /** A markdown page has its own Rendered/Source toggle and editor. */
  markdownPage: boolean;
  sourceDirty: boolean;
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
const TOOLBAR_BUTTON =
  "size-8 rounded hover:bg-accent aria-pressed:bg-accent aria-pressed:text-foreground [@media(pointer:coarse)]:size-11";
const TOOLBAR_GROUP =
  "inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-background p-0.5";

function PlaygroundPageMoreActions(props: PlaygroundShellActionsProps) {
  return (
    <PlaygroundMoreActions
      items={[
        ...pageActionItems({
          disabled: props.filesystemActionsDisabled,
          disabledReason: props.filesystemActionsDisabledReason,
          onSelect: props.onPageAction,
          active: props.fileActions,
        }),
        {
          label: props.pageMarkdownCopied ? "Copied page" : "Copy page",
          icon: UiCopy,
          group: "Export",
          disabled: props.copyDisabled,
          onSelect: props.onCopyPage,
        },
        ...props.feedbackCopyActions.map((item) => ({
          ...item,
          group: "Export",
        })),
      ]}
    />
  );
}

/**
 * Keep page comments, agent sessions and preferences in the phone header.
 */
export function PlaygroundMobileActions(
  props: PlaygroundShellActionsProps & {
    moreOpen: boolean;
    onToggleMore: () => void;
  },
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
          <UiChatDots className="size-4" />
        </button>
      )}
      <button
        type="button"
        onClick={props.onToggleMore}
        aria-expanded={props.moreOpen}
        aria-label="Page toolbar"
        title="Page toolbar"
        className={cn(
          MOBILE_ICON_BUTTON,
          props.moreOpen && "bg-accent text-foreground",
        )}
      >
        <UiSliders className="size-4" />
      </button>
      <VocabularyStatus problemsError={props.problemsError} />
      <AgentSessionButton compact />
      <PlaygroundNotifications recent={props.recent} review={{ active: props.reviewActive, count: props.reviewCount, onToggle: props.onToggleReview }} />
      <PlaygroundPreferences sourceDirty={props.sourceDirty} />
      <PlaygroundPageMoreActions {...props} />
    </>
  );
}

export function PlaygroundShellActions(props: PlaygroundShellActionsProps) {
  return (
    <>
      {!props.overflow && <AgentSessionButton compact />}
      {props.active && (
        <PlaygroundViewActions
          view={props.view}
          onViewChange={props.onViewChange}
          viewToggle={!props.markdownPage}
        />
      )}
      <div role="group" aria-label="Feedback tools" className={TOOLBAR_GROUP}>
        {props.view === "preview" && (
          <>
            {!props.overflow && (
              <IconButton
                icon={UiChatDots}
                label="Comment on page"
                onClick={props.onCommentWholePage}
                disabled={!props.active}
                className={TOOLBAR_BUTTON}
              />
            )}
          </>
        )}
        <IconButton
          icon={props.feedbackCopied ? UiChecks : UiCopy}
          label={props.feedbackCopied ? "Copied feedback" : "Copy feedback"}
          onClick={props.onCopyFeedback}
          disabled={props.pageCommentCount === 0}
          className={TOOLBAR_BUTTON}
        />
      </div>
      {!props.overflow && (
        <VocabularyStatus problemsError={props.problemsError} />
      )}
      {!props.overflow && <PlaygroundNotifications recent={props.recent} review={{ active: props.reviewActive, count: props.reviewCount, onToggle: props.onToggleReview }} />}
      {!props.overflow && (
        <PlaygroundPreferences sourceDirty={props.sourceDirty} />
      )}
      {!props.overflow && <PlaygroundPageMoreActions {...props} />}
    </>
  );
}
