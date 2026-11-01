import { useEffect, useState } from "react";
import { languageFromPath } from "../code-highlight";
import { FrameSourceWindow } from "../diagnostics/FrameSourceWindow";
import type { OpenFileTarget } from "../OpenInFilesLink";
import type { Violation } from "./types";
import { severityOf } from "./stats";

/** Loads a file's text, given the same work-dir-relative target "Open in Files" receives. */
export type LintSourceLoader = (target: Pick<OpenFileTarget, "file" | "workDir">) => Promise<string>;

/** Lines shown above and below the flagged range. */
export const VIOLATION_CONTEXT_LINES = 3;

// One load per file per loader: a file with many violations renders many cards.
const loads = new WeakMap<LintSourceLoader, Map<string, Promise<string>>>();

function loadOnce(loader: LintSourceLoader, file: string, workDir: string): Promise<string> {
  const byFile = loads.get(loader) ?? new Map<string, Promise<string>>();
  loads.set(loader, byFile);
  const key = `${workDir}\u0000${file}`;
  let load = byFile.get(key);
  if (!load) {
    load = loader({ file, ...(workDir ? { workDir } : {}) });
    byFile.set(key, load);
    load.catch(() => byFile.delete(key));
  }
  return load;
}

type Snippet = { status: "loading" } | { status: "ready"; text: string } | { status: "error"; message: string };

function useSource(loader: LintSourceLoader | undefined, file: string, workDir: string): Snippet | null {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  useEffect(() => {
    if (!loader || !file) {
      setSnippet(null);
      return;
    }
    let cancelled = false;
    setSnippet({ status: "loading" });
    loadOnce(loader, file, workDir).then(
      (text) => !cancelled && setSnippet({ status: "ready", text }),
      (error: unknown) =>
        !cancelled && setSnippet({ status: "error", message: error instanceof Error ? error.message : String(error) }),
    );
    return () => {
      cancelled = true;
    };
  }, [loader, file, workDir]);
  return snippet;
}

function Message({ text }: { text: string | undefined }) {
  return text ? <div className="mt-0.5 whitespace-pre-wrap text-sm">{text}</div> : null;
}

/**
 * The flagged lines of a violation with a few lines of context either side,
 * numbered and syntax-highlighted, with the full message above the scrolling
 * source. Without a loader (or a line) it shows the message and the
 * snippet the linter reported in `code`, if any.
 */
export function ViolationSnippet({
  violation,
  file,
  workDir,
  loadSource,
  showMessage = true,
}: {
  violation: Violation;
  showMessage?: boolean;
  file: string;
  workDir: string;
  loadSource?: LintSourceLoader | undefined;
}) {
  const line = violation.line ?? 0;
  const snippet = useSource(line > 0 ? loadSource : undefined, file, workDir);

  if (!snippet || snippet.status !== "ready") {
    return (
      <>
        {showMessage && <Message text={violation.message} />}
        {snippet?.status === "loading" && <div className="mt-1 text-xs text-muted-foreground">Loading source…</div>}
        {snippet?.status === "error" && (
          <div className="mt-1 text-xs text-red-700 dark:text-red-300" role="alert">
            Could not load {file}: {snippet.message}
          </div>
        )}
        {!snippet && violation.code && (
          <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{violation.code}</pre>
        )}
      </>
    );
  }

  const lines = snippet.text.split("\n");
  const first = Math.max(1, line - VIOLATION_CONTEXT_LINES);
  const last = Math.min(lines.length, Math.max(line, violation.end_line ?? line) + VIOLATION_CONTEXT_LINES);
  const language = languageFromPath(file);
  return (
    <>
      {showMessage && <Message text={violation.message} />}
      {line > lines.length && <p role="alert" className="text-xs text-destructive">Source location is outside this file.</p>}
      <FrameSourceWindow
        focalTone={severityOf(violation)}
        className="m-0 mt-1.5 max-sm:ml-0"
        frame={{
          sourceLines: lines.slice(first - 1, last),
          sourceStartLine: first,
          line,
          ...(language ? { sourceLanguage: language } : {}),
        }}
      />
    </>
  );
}
