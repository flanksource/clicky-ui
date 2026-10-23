// Lint violations and failed tests overlaid on the source of the files they
// name. A separate entry (like ./monaco) so the root bundle never pulls Monaco.
// Hosts must render a MonacoProvider (from "@flanksource/clicky-ui/monaco")
// above FileFindingsView and AnnotatedCode.
//
// Importing this entry does not load Monaco: AnnotatedCode is exported through
// a lazy wrapper, so monaco-editor and @monaco-editor/react arrive in a
// dynamically imported chunk the first time a code file is shown.

export { FileFindingsView, type FileFindingsViewProps } from "./file-findings/FileFindingsView";
export { AnnotatedCode, type AnnotatedCodeProps } from "./file-findings/LazyAnnotatedCode";
export { AnnotatedMarkdown, type AnnotatedMarkdownProps } from "./file-findings/AnnotatedMarkdown";
export { groupFindingsByFile, lintFindings, testFindings } from "./file-findings/adapters";
export {
  FINDINGS_COMMENT_CONFIG,
  blockAnchor,
  findingsToComments,
  lineAnchor,
  lineRangeAnchorResolver,
} from "./file-findings/findings-comments";
export { blankMdxPreamble } from "./file-findings/mdx-source";
export { monacoLanguageForPath } from "./file-findings/monaco-language";
export {
  fileRefKey,
  sameFileRef,
  type FileFinding,
  type FileRef,
  type FileTreeNode,
  type FindingKind,
  type FindingsViewMode,
  type LintSeverity,
} from "./file-findings/types";
