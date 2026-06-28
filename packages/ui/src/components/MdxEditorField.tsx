import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";
import type { FormSize } from "./json-schema-form-size";
import { inputClass } from "./json-schema-form-utils";
import { createMdxEditorPlugins } from "./mdx-editor-field-plugins";
import type { MdxEditorFieldProps } from "./mdx-editor-options";

type MdxEditorModule = typeof import("@mdxeditor/editor");

export type {
  MdxEditorAdmonitionOptions,
  MdxEditorCodeBlockLanguage,
  MdxEditorCodeBlockOptions,
  MdxEditorCodeMirrorOptions,
  MdxEditorDiffModeOptions,
  MdxEditorFieldProps,
  MdxEditorHeadingLevel,
  MdxEditorImageOptions,
  MdxEditorImagePreviewHandler,
  MdxEditorImageUploadHandler,
  MdxEditorLinkOptions,
  MdxEditorPlugin,
  MdxEditorPluginOptions,
  MdxEditorToolbarOptions,
  MdxEditorViewMode,
} from "./mdx-editor-options";

interface MdxEditorMethods {
  focus: () => void;
  getContentEditableHTML: () => string;
  getMarkdown: () => string;
  getSelectionMarkdown: () => string;
  insertMarkdown: (markdown: string) => void;
  setMarkdown: (markdown: string) => void;
}

const EDITOR_MIN_HEIGHT_CLASS: Record<FormSize, string> = {
  xs: "min-h-32",
  sm: "min-h-36",
  md: "min-h-40",
  lg: "min-h-48",
  xl: "min-h-56",
};

let mdxEditorModulePromise: Promise<MdxEditorModule> | null = null;

function loadMdxEditorModule(): Promise<MdxEditorModule> {
  mdxEditorModulePromise ??= import("@mdxeditor/editor");
  return mdxEditorModulePromise;
}

export function MdxEditorField({
  id,
  value = "",
  onChange,
  readOnly = false,
  disabled = false,
  size = "md",
  placeholder,
  className,
  contentClassName,
  textareaClassName,
  "aria-label": ariaLabel,
  commitInitialMarkdownNormalize = false,
  ...pluginOptions
}: MdxEditorFieldProps) {
  const [mdx, setMdx] = useState<MdxEditorModule | null>(null);
  const editorRef = useRef<MdxEditorMethods>(null);
  const lastValueRef = useRef(value);
  const readonly = readOnly || disabled;

  useEffect(() => {
    let cancelled = false;
    loadMdxEditorModule()
      .then((mod) => {
        if (!cancelled) setMdx(mod);
      })
      .catch(() => {
        if (!cancelled) setMdx(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mdx || value === lastValueRef.current) return;
    lastValueRef.current = value;
    editorRef.current?.setMarkdown(value);
  }, [mdx, value]);

  const commit = useCallback(
    (next: string, initialMarkdownNormalize = false) => {
      if (initialMarkdownNormalize && !commitInitialMarkdownNormalize) return;
      lastValueRef.current = next;
      onChange?.(next);
    },
    [commitInitialMarkdownNormalize, onChange],
  );

  const plugins = useMemo(
    () => (mdx ? createMdxEditorPlugins(mdx, pluginOptions) : []),
    [mdx, pluginOptions],
  );

  if (!mdx) {
    const fallbackAriaLabel = ariaLabel ?? (id ? undefined : "Markdown");
    return (
      <textarea
        id={id}
        data-jsf-input
        rows={6}
        aria-label={fallbackAriaLabel}
        className={cn(
          inputClass(size),
          "h-auto resize-y font-mono",
          EDITOR_MIN_HEIGHT_CLASS[size],
          textareaClassName,
        )}
        value={value}
        disabled={readonly}
        placeholder={typeof placeholder === "string" ? placeholder : undefined}
        onChange={(event) => commit(event.target.value)}
      />
    );
  }

  const { MDXEditor } = mdx;
  return (
    <div id={id} data-jsf-input className="min-w-0">
      <MDXEditor
        ref={editorRef}
        markdown={value}
        readOnly={readonly}
        placeholder={placeholder}
        plugins={plugins}
        className={cn("clicky-mdx-editor-field", readonly && "clicky-mdx-editor-field-readonly", className)}
        contentEditableClassName={cn("clicky-mdx-editor-content", EDITOR_MIN_HEIGHT_CLASS[size], contentClassName)}
        onChange={commit}
      />
    </div>
  );
}
