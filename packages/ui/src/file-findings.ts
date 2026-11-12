// Lint violations and failed tests overlaid on the source of the files they
// name. A separate entry (like ./monaco) so the root bundle never pulls Monaco.
// Hosts that make FileReview's source editable (`onSourceChange`) or use
// AnnotatedCode must render a MonacoProvider (from "@flanksource/clicky-ui/monaco").
//
// Importing this entry does not load Monaco: the editor is exported through
// a lazy wrapper, so monaco-editor and @monaco-editor/react arrive in a
// dynamically imported chunk the first time an editor is shown.

export {
  FileFindingsView,
  type FileFindingsViewProps,
  type FileTreeNodeSlots,
  type FileTreeSlotContext,
} from "./file-findings/FileFindingsView";
export {
  FolderFindings,
  type FolderFindingsProps,
  type FolderTab,
  type FolderTabContext,
} from "./file-findings/FolderFindings";
export { AnnotatedCode, type AnnotatedCodeProps } from "./file-findings/LazyAnnotatedCode";
export {
  FileReview,
  type FileReviewCommentTargets,
  type FileReviewComments,
  type FileReviewLayout,
  type FileReviewProps,
  type FileReviewTab,
  type FileReviewTabContext,
} from "./file-findings/file-review/FileReview";
export {
  BUILTIN_FILE_REVIEW_VIEWS,
  FOLDER_PROBLEMS_VIEW,
  isBuiltinFileReviewView,
  type BuiltinFileReviewView,
  type FileReviewView,
} from "./file-findings/file-review/views";
export {
  emptyProblemFilters,
  matchesProblemFilters,
  problemType,
  type ProblemFilters,
} from "./file-findings/file-review/problem-filters";
export {
  QUOTE_PREFIX,
  describeQuote,
  markdownOutline,
  parseQuoteAnchor,
  quoteAnchor,
  resolveQuote,
  type OutlineEntry,
  type QuoteLocator,
} from "./file-findings/file-review/quote-anchor";
export {
  SOURCE_PREFIX,
  describeSource,
  parseSourceAnchor,
  resolveSource,
  sourceAnchor,
  type SourceLocator,
} from "./file-findings/file-review/source-anchor";
export { blameAge, isUncommitted, type BlameCommit, type BlameRange } from "./file-findings/file-review/blame";
export { sourceBlockOf, type AnchorMode } from "./file-findings/file-review/geometry";
export { countFindingsBySeverity } from "./file-findings/severity-counts";
export { groupFindingsByFile, lintFindings, testFindings } from "./file-findings/adapters";
export {
  FINDINGS_COMMENT_CONFIG,
  blockAnchor,
  findingsToComments,
  lineAnchor,
  lineRangeAnchorResolver,
} from "./file-findings/findings-comments";
export { isImagePath, relativeUrlPath } from "./file-findings/file-urls";
export { blankMdxPreamble } from "./file-findings/mdx-source";
export { monacoLanguageForPath } from "./file-findings/monaco-language";
export {
  fileRefKey,
  sameFileRef,
  sameSelection,
  type FileFinding,
  type FileRef,
  type FileTreeNode,
  type FileTreeSelection,
  type FindingKind,
  type LintSeverity,
} from "./file-findings/types";
// Anchors of FileReview's other comment targets, for hosts that map them to and from their own selectors.
export {
  PATCH_PREFIX,
  capturePatch,
  describePatch,
  isPatchAnchor,
  matchPatch,
  parsePatchAnchor,
  patchAnchor,
  type PatchMatch,
} from "./comments/anchoring/patch-anchor";
export { ELEMENT_PREFIX, elementAnchor, isElementAnchor, parseElementAnchor } from "./comments/anchoring/dom-anchor";
