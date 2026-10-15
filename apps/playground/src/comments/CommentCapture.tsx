import type { Comment } from "@flanksource/clicky-ui/comments";
import type { CommentElementContext } from "../../plugins/comments-model";

export function CommentCapture({
  comment,
}: {
  comment: Comment & { element?: CommentElementContext };
}) {
  const element = comment.element;
  if (!element) return null;

  return (
    <div className="space-y-2 px-1 text-xs">
      {element.screenshot?.status === "captured" ? (
        <a
          href={element.screenshot.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md border border-border bg-muted/30 p-1 text-primary hover:border-primary"
        >
          <img
            src={element.screenshot.url}
            alt="Captured screenshot"
            loading="lazy"
            className="max-h-40 w-full rounded object-contain"
          />
          <span className="mt-1 block text-center font-medium">
            View full capture
          </span>
        </a>
      ) : element.screenshot?.status === "unavailable" ? (
        <p className="text-muted-foreground">
          Screenshot unavailable ({element.screenshot.reason})
        </p>
      ) : null}
      <details className="rounded-md border border-border bg-muted/30 px-2 py-1.5">
        <summary className="cursor-pointer font-medium text-foreground">
          Capture context
        </summary>
        {element.componentName && (
          <p className="mt-2 text-muted-foreground">
            Component: &lt;{element.componentName}&gt;
          </p>
        )}
        <p className="mt-2 font-medium text-foreground">Source</p>
        <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all text-muted-foreground">
          {element.source}
        </pre>
        <p className="mt-2 font-medium text-foreground">HTML</p>
        <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-all text-muted-foreground">
          {element.html}
        </pre>
      </details>
    </div>
  );
}
