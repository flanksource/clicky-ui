export * from "./comments/comment-types";
export type { CommentDetailOptions, CommentDetailTab } from "./comments/comment-detail";
export { CommentRail, type CommentRailProps } from "./comments/CommentRail";
export { useCommentRailWidth } from "./comments/use-comment-rail-width";
export { CommentDraftPopover, type CommentDraftPopoverProps } from "./comments/CommentDraftPopover";
export * from "./comments/comment-vocabulary";
export { CommentEditor } from "./comments/CommentEditor";
export * from "./comments/comment-utils";
export {
  assignTargetItems,
  assignmentMenuItems,
  type CommentActionRunner,
  type CommentAssignmentOptions,
} from "./comments/comment-assign";
export {
  resolveCommentStage,
  selectCommentThreadsByStage,
  statusForCommentStage,
} from "./lib/comment-stage";

export {
  CommentMarkdown,
  type CommentMarkdownProps,
} from "./comments/CommentMarkdown";
export {
  CommentAuthorAvatar,
  type CommentAuthorAvatarProps,
} from "./comments/CommentAuthor";
export {
  MentionTextarea,
  type MentionTextareaProps,
} from "./comments/MentionTextarea";
export { CommentCard, type CommentCardProps } from "./comments/CommentCard";
export {
  CommentComposer,
  type CommentComposerProps,
} from "./comments/CommentComposer";
export {
  CommentThreadList,
  type CommentThreadListProps,
} from "./comments/CommentThreadList";
export {
  CommentThread,
  type CommentThreadProps,
} from "./comments/CommentThread";
export { CommentProvider, type CommentProviderProps } from "./comments/CommentProvider";
export {
  useCommentContext,
  useCommentContextOptional,
  useCommentAnchorOptional,
  useCommentAnchorActionsOptional,
  exactAnchorResolver,
  dottedAnchorResolver,
  strictAnchorResolver,
  type CommentContextValue,
  type CommentAnchorState,
  type CommentAnchorActions,
  type CommentRailMode,
  type AnchorResolver,
  type CommentScrollOptions,
} from "./comments/comment-context";
export {
  CommentSidePanel,
  type CommentSidePanelProps,
} from "./comments/CommentSidePanel";
export {
  GroupedComments,
  type GroupedCommentsProps,
} from "./comments/GroupedComments";
export {
  CommentFilterBar,
  type CommentFilterBarProps,
} from "./comments/CommentFilterBar";
export {
  CommentProgress,
  type CommentProgressProps,
} from "./comments/CommentProgress";
