import { SegmentedControl, cn } from "@flanksource/clicky-ui";

import type { AnnotationVisibility, PlaygroundView } from "./route";

export function PlaygroundViewActions({
  view,
  annotations,
  showRejected,
  onShowRejectedChange,
  copyDisabled,
  copied,
  onViewChange,
  onAnnotationsChange,
  onCopy,
  viewToggle,
}: {
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  showRejected: boolean;
  onShowRejectedChange: (show: boolean) => void;
  copyDisabled: boolean;
  copied: boolean;
  onViewChange: (view: PlaygroundView) => void;
  onAnnotationsChange: (annotations: AnnotationVisibility) => void;
  onCopy: () => void;
  /** Shows the Preview/Markdown toggle; a markdown page renders its own view toggle. */
  viewToggle: boolean;
}) {
  return (
    <>
      {viewToggle && (
        <SegmentedControl
          value={view}
          options={[
            { id: "preview", label: "Preview" },
            { id: "markdown", label: "Markdown" },
          ]}
          onChange={onViewChange}
          size="sm"
          aria-label="Artifact view"
        />
      )}
      {view === "preview" && (
        <button type="button" aria-pressed={showRejected} onClick={() => onShowRejectedChange(!showRejected)} className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          {showRejected ? "Hide rejected" : "Show rejected"}
        </button>
      )}
      {view === "preview" && (
        <button
          type="button"
          onClick={() => onAnnotationsChange(annotations === "visible" ? "hidden" : "visible")}
          aria-pressed={annotations === "hidden"}
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
            annotations === "hidden"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {annotations === "hidden" ? "Show annotations" : "Hide annotations"}
        </button>
      )}
      <button
        type="button"
        onClick={onCopy}
        disabled={copyDisabled}
        className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        {copied ? "Copied page" : "Copy page"}
      </button>
    </>
  );
}
