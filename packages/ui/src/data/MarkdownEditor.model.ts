import type { ClickyProps } from "./Clicky";

export const MARKDOWN_EDITOR_PREVIEW_FORMATS = [
  "react",
  "html",
  "markdown",
  "pdf",
  "json",
  "csv",
  "excel",
] as const;

export type MarkdownEditorPreviewFormat =
  (typeof MARKDOWN_EDITOR_PREVIEW_FORMATS)[number];

export type MarkdownEditorPreviewRequest = {
  markdown: string;
  format: MarkdownEditorPreviewFormat;
  signal: AbortSignal;
};

export type MarkdownEditorPreviewResult =
  | {
      kind: "clicky";
      data: NonNullable<ClickyProps["data"]>;
    }
  | {
      kind: "html";
      html: string;
    }
  | {
      kind: "json";
      data: unknown;
    }
  | {
      kind: "text";
      text: string;
      contentType?: string;
    }
  | {
      kind: "url";
      url: string;
      contentType?: string;
    }
  | {
      kind: "blob";
      blob: Blob;
      contentType?: string;
      filename?: string;
    };

export type MarkdownEditorPreviewHeaders =
  | HeadersInit
  | ((request: {
      markdown: string;
      format: MarkdownEditorPreviewFormat;
    }) => HeadersInit | undefined);

export function buildMarkdownPreviewUrl(
  endpoint: string,
  format: MarkdownEditorPreviewFormat,
) {
  const base =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const resolved = new URL(endpoint, base);
  resolved.searchParams.set("format", clickyFormatForMarkdownPreview(format));

  if (/^[a-z][a-z0-9+.-]*:/i.test(endpoint)) {
    return resolved.toString();
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

export function clickyFormatForMarkdownPreview(
  format: MarkdownEditorPreviewFormat,
) {
  return format === "react" ? "clicky-json" : format;
}
