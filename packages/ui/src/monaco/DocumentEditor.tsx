import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { Button } from "../components/button";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import type {
  JsonSchemaObject,
  JsonSchemaFormProps,
} from "../components/json-schema-form-types";
import { rehydrateRefs } from "../components/json-schema-form-refs";
import { MonacoEditor } from "./MonacoEditor";
import { sourceCommentActions, type SourceComments } from "./source-comments";
import {
  changeStructuredDocument,
  documentParts,
  structuredDocument,
} from "./document-source";

const RichEditor = lazy(() =>
  import("../mdx-editor").then((module) => ({
    default: module.MdxEditorField,
  })),
);
export type DocumentEditorProps = {
  mode?: "source" | "rich" | "form";
  onModeChange?: (mode: "source" | "rich" | "form") => void;
  sourceComments?: SourceComments;
  path: string;
  value: string;
  onChange: (source: string) => void;
  schema?: JsonSchemaObject | null;
  schemaError?: string;
  formOptions?: Pick<
    JsonSchemaFormProps,
    | "size"
    | "inline"
    | "layout"
    | "requiredFirst"
    | "showTypeIcons"
    | "objectDisplay"
    | "persistPreferences"
    | "preferencesStorageKey"
  >;
  reveal?: { line: number; column?: number };
  /**
   * The URL to load a markdown image from in Rich text, given the `src` the
   * author wrote (usually relative). Only the rendered image changes; the
   * markdown keeps the authored path.
   */
  resolveImageUrl?: (src: string) => string;
};

/** Controlled file editor; the host owns persistence and schema loading. */
export function DocumentEditor({
  path,
  value,
  onChange,
  schema,
  schemaError,
  formOptions,
  reveal,
  mode: controlledMode,
  onModeChange,
  sourceComments,
  resolveImageUrl,
}: DocumentEditorProps) {
  const [localMode, setLocalMode] = useState<"source" | "rich" | "form">(
    "source",
  );
  const mode = controlledMode ?? localMode;
  const setMode = (next: "source" | "rich" | "form") => {
    setLocalMode(next);
    onModeChange?.(next);
  };
  const commentsRef = useRef(sourceComments);
  commentsRef.current = sourceComments;
  const [mounted, setMounted] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );
  useEffect(() => {
    if (!mounted || !sourceComments || mode !== "source") return;
    const actions = sourceCommentActions(mounted, () => commentsRef.current);
    return () => actions.dispose();
  }, [mounted, Boolean(sourceComments), mode]);
  useEffect(() => {
    if (!mounted || !sourceComments || mode !== "source") return;
    const decorations = mounted.createDecorationsCollection(
      sourceComments.ranges.map((range) => ({
        range: {
          startLineNumber: range.startLine,
          startColumn: 1,
          endLineNumber: range.endLine,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          glyphMarginClassName: "rounded-full bg-primary",
          glyphMarginHoverMessage: { value: "Open comment" },
        },
      })),
    );
    return () => decorations.clear();
  }, [mounted, sourceComments, mode]);
  const instance = useRef<editor.IStandaloneCodeEditor | null>(null);
  const markdown = /\.mdx?$/i.test(path);
  useEffect(() => {
    if (reveal) {
      setMode("source");
      instance.current?.revealLineInCenter(reveal.line);
      instance.current?.setPosition({
        lineNumber: reveal.line,
        column: reveal.column ?? 1,
      });
    }
  }, [reveal]);
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Editor mode"
      >
        <Button
          size="sm"
          variant={mode === "source" ? "default" : "outline"}
          onClick={() => setMode("source")}
        >
          Source
        </Button>
        {markdown && (
          <Button
            size="sm"
            variant={mode === "rich" ? "default" : "outline"}
            onClick={() => setMode("rich")}
          >
            Rich text
          </Button>
        )}
        {schema && (
          <Button
            size="sm"
            variant={mode === "form" ? "default" : "outline"}
            onClick={() => setMode("form")}
          >
            {markdown ? "Frontmatter" : "Form"}
          </Button>
        )}
      </div>
      {schemaError && (
        <p role="alert" className="text-sm text-destructive">
          {schemaError}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-auto [&>[data-slot=monaco-editor]]:h-full">
        {mode === "source" && (
          <MonacoEditor
            path={path}
            language={
              markdown ? "markdown" : /\.json$/i.test(path) ? "json" : "yaml"
            }
            value={value}
            onChange={onChange}
            height="100%"
            onMount={(editor) => {
              instance.current = editor;
              setMounted(editor);
              if (reveal) {
                editor.revealLineInCenter(reveal.line);
                editor.setPosition({
                  lineNumber: reveal.line,
                  column: reveal.column ?? 1,
                });
              }
            }}
          />
        )}
        {mode === "rich" && (
          <DocumentRichEditor path={path} value={value} onChange={onChange} {...(resolveImageUrl ? { resolveImageUrl } : {})} />
        )}
        {mode === "form" && schema && (
          <DocumentForm path={path} value={value} onChange={onChange} schema={schema} {...(formOptions ? { formOptions } : {})} />
        )}
      </div>
    </div>
  );
}

export type DocumentFormProps = {
  path: string;
  value: string;
  onChange: (source: string) => void;
  schema: JsonSchemaObject;
  formOptions?: DocumentEditorProps["formOptions"];
};

/**
 * A schema form over a json/yaml document, or a markdown file's frontmatter.
 * An edit is written back into `value` in place, keeping the rest of the text;
 * a document that cannot be parsed (or an edit that cannot be written) is
 * shown as an alert and nothing is reported.
 */
export function DocumentForm({ path, value, onChange, schema, formOptions }: DocumentFormProps) {
  const [error, setError] = useState("");
  let form: ReturnType<typeof structuredDocument> | undefined;
  let parsingError = "";
  try {
    form = structuredDocument(value, path);
  } catch (cause) {
    parsingError = cause instanceof Error ? cause.message : String(cause);
  }
  const updateForm = (next: unknown) => {
    try {
      onChange(changeStructuredDocument(value, path, next));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };
  const resolvedSchema = rehydrateRefs(schema);
  const objectRoot =
    form?.value !== null &&
    typeof form?.value === "object" &&
    !Array.isArray(form?.value);
  return (
    <>
      {(parsingError || error) && (
        <p role="alert" className="text-sm text-destructive">
          {parsingError || error}
        </p>
      )}
      {form && (
        <JsonSchemaForm
          size="sm"
          inline
          requiredFirst
          showTypeIcons
          objectDisplay="accordion"
          {...formOptions}
          applyDefaults={false}
          schema={
            objectRoot
              ? resolvedSchema
              : {
                  type: "object",
                  properties: { document: { ...resolvedSchema, title: "" } },
                  ...(schema.$defs ? { $defs: schema.$defs } : {}),
                }
          }
          value={
            objectRoot
              ? (form.value as Record<string, unknown>)
              : { document: form.value }
          }
          onChange={(next) => updateForm(objectRoot ? next : next.document)}
        />
      )}
    </>
  );
}

export type DocumentRichEditorProps = {
  path: string;
  value: string;
  onChange: (source: string) => void;
  resolveImageUrl?: ((src: string) => string) | undefined;
};

/**
 * The MDX rich-text editor over a markdown file. Frontmatter stays out of the
 * editor and is written back unchanged ahead of each edit; `resolveImageUrl`
 * decides where a relative image previews from without touching the markdown.
 */
export function DocumentRichEditor(props: DocumentRichEditorProps) {
  return (
    <Suspense fallback={<p>Loading editor…</p>}>
      <RichBody {...props} />
    </Suspense>
  );
}

function RichBody({ path, value, onChange, resolveImageUrl }: DocumentRichEditorProps) {
  const images = useMemo(
    () =>
      resolveImageUrl
        ? { imagePreviewHandler: async (src: string) => resolveImageUrl(src) }
        : undefined,
    [resolveImageUrl],
  );
  try {
    const parts = documentParts(value, path);
    const body = parts.prefix
      ? parts.suffix.replace(/^---[^\n]*(?:\n|$)/, "")
      : value;
    const header = value.slice(0, value.length - body.length);
    return (
      <RichEditor
        value={body}
        onChange={(next) => onChange(header + next)}
        commitInitialMarkdownNormalize={false}
        {...(images ? { images } : {})}
      />
    );
  } catch (cause) {
    return (
      <p role="alert">
        {cause instanceof Error ? cause.message : String(cause)}. Use Source to
        recover.
      </p>
    );
  }
}
