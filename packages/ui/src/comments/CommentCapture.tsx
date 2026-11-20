export type CommentCaptureContext = {
  pageUrl?: string;
  componentName?: string;
  source: string;
  html: string;
  screenshot?: { status: "captured"; url: string } | { status: "unavailable"; reason: string };
};

export function CommentCapture({ capture, expanded = false }: { capture?: CommentCaptureContext | undefined; expanded?: boolean }) {
  if (!capture) return <p className="text-xs text-muted-foreground">No capture was recorded for this comment.</p>;
  const summary = capture.componentName ?? capture.pageUrl ?? capture.source.split("\n")[0];
  return (
    <details open={expanded} className="min-w-0 rounded-md border border-border bg-muted/30 px-2 py-1.5 text-xs">
      <summary className="cursor-pointer whitespace-nowrap text-muted-foreground">
        <span className="inline-flex max-w-[calc(100%-1rem)] items-center gap-2 align-middle">
          <span className="shrink-0 font-medium text-foreground">Capture context</span>
          <span className="min-w-0 truncate" title={summary}>{summary}</span>
        </span>
      </summary>
      <div className="mt-2 space-y-2">
        {capture.pageUrl && <a className="block break-all text-primary underline" href={capture.pageUrl} target="_blank" rel="noopener noreferrer">{capture.pageUrl}</a>}
        {capture.componentName && <p className="text-muted-foreground">Component: &lt;{capture.componentName}&gt;</p>}
        {capture.screenshot?.status === "captured" ? (
          <a href={capture.screenshot.url} target="_blank" rel="noopener noreferrer" className="block text-primary underline" aria-label="View full capture">
            <img src={capture.screenshot.url} alt="Captured screenshot" loading="lazy" className="max-h-40 max-w-full rounded object-contain" />
            View full capture
          </a>
        ) : capture.screenshot?.status === "unavailable" ? <p className="text-muted-foreground">Screenshot unavailable ({capture.screenshot.reason})</p> : null}
        {capture.source && <div>
          <p className="font-medium">Source</p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-muted-foreground">{capture.source}</pre>
        </div>}
        {capture.html && <div>
          <p className="font-medium">HTML</p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-muted-foreground">{capture.html}</pre>
        </div>}
      </div>
    </details>
  );
}
