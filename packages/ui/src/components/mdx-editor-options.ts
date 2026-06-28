import type { ReactNode } from "react";
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
}

export interface MdxEditorCodeBlockOptions {
  defaultLanguage?: string;
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
  diffMarkdown?: string;
  readOnlyDiff?: boolean;
}

export interface MdxEditorAdmonitionOptions {
  escapeUnknownTextDirectives?: boolean;
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
