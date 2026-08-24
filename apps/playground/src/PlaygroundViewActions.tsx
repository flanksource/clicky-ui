import { SegmentedControl, cn } from "@flanksource/clicky-ui";

import type { AnnotationVisibility, PlaygroundView } from "./route";

export function PlaygroundViewActions({
  view,
  annotations,
  copyDisabled,
  copied,
  onViewChange,
  onAnnotationsChange,
  onCopy,
}: {
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  copyDisabled: boolean;
  copied: boolean;
  onViewChange: (view: PlaygroundView) => void;
  onAnnotationsChange: (annotations: AnnotationVisibility) => void;
  onCopy: () => void;
}) {
  return (
    <>
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
