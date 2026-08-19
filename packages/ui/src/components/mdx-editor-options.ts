import type { ComponentType, ReactNode } from "react";
import type { FormSize } from "./json-schema-form-size";

export type MdxEditorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type MdxEditorViewMode = "rich-text" | "source" | "diff";
export type MdxEditorPlugin = unknown;
export interface MdxEditorCodeBlockLanguage {
  name: string;
  [key: string]: unknown;
}
export type MdxEditorImageUploadHandler = (image: File) => Promise<string>;
export type MdxEditorImagePreviewHandler = (imageSource: string) => Promise<string>;

export interface MdxEditorToolbarOptions {
  className?: string;
  position?: "top" | "bottom";
  /**
   * Extra controls appended after the built-in ones — an insert button for a
   * block registered through `jsxComponents`, say.
   */
  extra?: ReactNode;
}

export interface MdxEditorCodeBlockOptions {
  defaultLanguage?: string;
  editorDescriptors?: readonly MdxEditorCodeBlockEditorDescriptor[];
}

export interface MdxEditorCodeBlockEditorContext {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setMeta: (meta: string) => void;
}

export interface MdxEditorCodeBlockEditorProps {
  code: string;
  language: string;
  meta: string;
  nodeKey: string;
  focusEmitter: {
    subscribe: (callback: () => void) => void;
  };
  context: MdxEditorCodeBlockEditorContext;
}

export interface MdxEditorCodeBlockEditorDescriptor {
  priority: number;
  match: (
    language: string | null | undefined,
    meta: string | null | undefined,
  ) => boolean;
  Editor: ComponentType<MdxEditorCodeBlockEditorProps>;
}

export interface MdxEditorCodeMirrorOptions {
  languages?: Record<string, string> | MdxEditorCodeBlockLanguage[];
  autoLoadLanguageSupport?: boolean;
}

export interface MdxEditorLinkOptions {
  disableAutoLink?: boolean;
  linkAutocompleteSuggestions?: string[];
  showLinkTitleField?: boolean;
}

export interface MdxEditorImageOptions {
  imageUploadHandler?: MdxEditorImageUploadHandler;
  imageAutocompleteSuggestions?: string[];
  imagePreviewHandler?: MdxEditorImagePreviewHandler;
  disableImageResize?: boolean;
  disableImageSettingsButton?: boolean;
  allowSetImageDimensions?: boolean;
}

export interface MdxEditorDiffModeOptions {
  viewMode?: MdxEditorViewMode;
  viewModes?: readonly MdxEditorViewMode[];
  diffMarkdown?: string;
  readOnlyDiff?: boolean;
}

export interface MdxEditorAdmonitionOptions {
  escapeUnknownTextDirectives?: boolean;
}

/** One attribute of an authored JSX block, as it appears in the mdast tree. */
export interface MdxEditorJsxAttribute {
  type: string;
  name?: string | null | undefined;
  value?: unknown;
}

/** An authored JSX block, narrowed to the parts a node editor reads and writes. */
export interface MdxEditorJsxNode {
  name?: string | null | undefined;
  attributes?: MdxEditorJsxAttribute[] | undefined;
  children?: unknown[] | undefined;
}

export interface MdxEditorJsxEditorProps {
  mdastNode: MdxEditorJsxNode;
}

/**
 * A JSX block registered with the editor, structurally typed so a consumer can
 * describe one without importing `@mdxeditor/editor` (an optional peer).
 *
 * Without a descriptor the editor treats a tag as unknown JSX and drops its
 * attributes on save, so every block type a document authors needs one.
 */
export interface MdxEditorJsxComponentDescriptor {
  name: string | null;
  kind: "flow" | "text";
  source?: string | undefined;
  defaultExport?: boolean | undefined;
  props: readonly { name: string; type: "string" | "number" | "expression" }[];
  hasChildren?: boolean | undefined;
  Editor: ComponentType<MdxEditorJsxEditorProps>;
}

/**
 * The MDXEditor module, as the JSX-block wiring uses it.
 *
 * Members are `unknown` and cast where they are used, rather than the whole
 * thing being typed `typeof import("@mdxeditor/editor")`. The peer is optional
 * and every consumer resolves its own copy — including its own transitive
 * `lexical` — so a nominal module type rejects a caller whose install differs
 * from this package's even when both satisfy the same version range. Listing
 * the members still states exactly what a caller has to supply.
 */
export interface MdxEditorRuntime {
  ButtonWithTooltip: unknown;
  NestedLexicalEditor: unknown;
  insertJsx$: unknown;
  useMdastNodeUpdater: unknown;
  usePublisher: unknown;
}

/** What a toolbar button publishes to insert a JSX block at the cursor. */
export interface MdxEditorInsertJsx {
  name: string;
  kind: "flow" | "text";
  props: Record<string, string>;
  children?: unknown[];
}

export interface MdxEditorCalloutOptions {
  /**
   * The tag to register. Defaults to `CalloutBox`; override only to match a
   * corpus that already authors callouts under a different name.
   */
  name?: string | undefined;
  /** Where the component is imported from, if the document needs the import. */
  source?: string | undefined;
}

export interface MdxEditorPluginOptions {
  toolbar?: boolean | MdxEditorToolbarOptions;
  headings?: boolean | { allowedHeadingLevels?: readonly MdxEditorHeadingLevel[] };
  lists?: boolean;
  quote?: boolean;
  links?: boolean | MdxEditorLinkOptions;
  tables?: boolean;
  thematicBreak?: boolean;
  codeBlocks?: boolean | MdxEditorCodeBlockOptions;
  codeMirror?: boolean | MdxEditorCodeMirrorOptions;
  frontmatter?: boolean;
  admonitions?: boolean | MdxEditorAdmonitionOptions;
  /** Register `<CalloutBox>` with its own node editor. Off by default. */
  callouts?: boolean | MdxEditorCalloutOptions;
  /**
   * Additional JSX blocks to register, for block types particular to the
   * consuming application. Combined with `callouts` into one `jsxPlugin`.
   */
  jsxComponents?: readonly MdxEditorJsxComponentDescriptor[];
  images?: boolean | MdxEditorImageOptions;
  markdownShortcuts?: boolean;
  diffMode?: boolean | MdxEditorViewMode | MdxEditorDiffModeOptions;
  plugins?: MdxEditorPlugin[];
}

export interface MdxEditorFieldProps extends MdxEditorPluginOptions {
  id?: string;
  value?: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
  size?: FormSize;
  placeholder?: ReactNode;
  className?: string;
  contentClassName?: string;
  textareaClassName?: string;
  "aria-label"?: string;
  commitInitialMarkdownNormalize?: boolean;
}
