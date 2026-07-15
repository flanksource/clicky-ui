import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { JsonView } from "./JsonView";
import { highlightCode } from "./code-highlight";
import { sanitizeHtml } from "./html-utils";

export type CodeBlockProps = {
  /** Language label and highlighter hint, e.g. `json`, `tsx`, or `bash`. */
  language?: string | undefined;
  /** Raw source code to render or highlight. */
  source?: string | undefined;
  /** Trusted server-rendered highlighted HTML, sanitized before rendering. */
  highlightedHtml?: string | undefined;
  /** Classes applied to the code block shell. */
  className?: string | undefined;
  /** Default expansion depth when rendering JSON as a tree. */
  jsonDefaultOpenDepth?: number | undefined;
  /** Render only the code — no border, background, or language header. */
  bare?: boolean | undefined;
};

export function CodeBlock({
  language: languageProp,
  source = "",
  highlightedHtml,
  className,
  jsonDefaultOpenDepth = 2,
  bare = false,
}: CodeBlockProps) {
  const language = (languageProp ?? "").toLowerCase().replace(/^\.+/, "");
  const chromaHtml = highlightedHtml ? sanitizeHtml(highlightedHtml) : "";
  const parsedJson = useMemo(
    () => (language === "json" ? tryParseJson(source) : JSON_PARSE_FAILED),
    [language, source],
  );
  const [shikiHtml, setShikiHtml] = useState<string | null>(null);
  const wantsClientHighlight = !chromaHtml && !!language && !!source;

  useEffect(() => {
    if (!wantsClientHighlight) {
      setShikiHtml(null);
      return;
    }

    let cancelled = false;
    highlightCode(source, { lang: language }).then((out) => {
      if (!cancelled) setShikiHtml(out);
    });

    return () => {
      cancelled = true;
    };
  }, [wantsClientHighlight, language, source]);

  if (parsedJson !== JSON_PARSE_FAILED) {
    const tree = <JsonView data={parsedJson} defaultOpenDepth={jsonDefaultOpenDepth} />;
    if (bare) return <div className={cn("overflow-auto text-xs", className)}>{tree}</div>;
    return (
      <div className={cn("overflow-hidden rounded-md border border-border bg-muted/40", className)}>
        <div className="border-b border-border px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
          json
        </div>
        <div className="overflow-auto p-3 text-xs">{tree}</div>
      </div>
    );
  }

  const xmlClasses =
    language === "xml" || language === "xslt" || language === "html"
      ? " [&_.chroma_.nt]:text-pink-700 [&_.chroma_.nt]:dark:text-pink-300 [&_.chroma_.nt]:font-semibold" +
        " [&_.chroma_.na]:text-amber-700 [&_.chroma_.na]:dark:text-amber-300" +
        " [&_.chroma_.s]:text-emerald-700 [&_.chroma_.s]:dark:text-emerald-300" +
        " [&_.chroma_.c]:text-slate-500 [&_.chroma_.c]:italic" +
        " [&_.chroma_.cp]:text-slate-500 [&_.chroma_.cp]:italic" +
        " [&_pre]:leading-relaxed"
      : "";

  const pad = bare ? undefined : "p-3";
  const body = chromaHtml ? (
    <div
      className={cn(
        "overflow-auto text-xs font-mono [&_.chroma]:bg-transparent [&_pre]:m-0 [&_pre]:whitespace-pre-wrap [&_pre]:bg-transparent" +
          xmlClasses,
        pad,
        bare && className,
      )}
      dangerouslySetInnerHTML={{ __html: chromaHtml }}
    />
  ) : shikiHtml ? (
    <div
      className={cn(
        "overflow-auto text-xs font-mono [&_pre]:m-0 [&_pre.shiki]:!bg-transparent [&_pre]:whitespace-pre-wrap",
        pad,
        bare && className,
      )}
      dangerouslySetInnerHTML={{ __html: shikiHtml }}
    />
  ) : (
    <pre
      className={cn(
        "overflow-auto whitespace-pre-wrap break-words text-xs font-mono text-foreground",
        pad,
        bare && className,
      )}
    >
      {source}
    </pre>
  );

  if (bare) return body;
  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-muted/40", className)}>
      <div className="border-b border-border px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {languageProp || "text"}
      </div>
      {body}
    </div>
  );
}

const JSON_PARSE_FAILED: unique symbol = Symbol("json-parse-failed");

function tryParseJson(source: string): unknown | typeof JSON_PARSE_FAILED {
  const trimmed = source.trim();
  if (!trimmed) return JSON_PARSE_FAILED;
  try {
    return JSON.parse(trimmed);
  } catch {
    return JSON_PARSE_FAILED;
  }
}
