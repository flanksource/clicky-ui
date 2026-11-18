import { SegmentedControl } from "@flanksource/clicky-ui";
import { UiEye, UiMarkdown } from "@flanksource/clicky-ui/icons";

import type { PlaygroundView } from "./route";

export function PlaygroundViewActions({
  view,
  onViewChange,
  viewToggle,
}: {
  view: PlaygroundView;
  onViewChange: (view: PlaygroundView) => void;
  /** Shows the Preview/Markdown toggle; a markdown page renders its own view toggle. */
  viewToggle: boolean;
}) {
  return (
    <>
      {viewToggle && (
        <SegmentedControl
          value={view}
          options={[
            {
              id: "preview",
              label: <span className="sr-only">Preview</span>,
              icon: UiEye,
              title: "Preview",
            },
            {
              id: "markdown",
              label: <span className="sr-only">Markdown</span>,
              icon: UiMarkdown,
              title: "Markdown",
            },
          ]}
          onChange={onViewChange}
          size="sm"
          className="shrink-0 border border-border bg-background [&_button]:size-8 [&_button]:justify-center [&_button]:px-0 [@media(pointer:coarse)]:[&_button]:size-11"
          aria-label="Artifact view"
        />
      )}
    </>
  );
}
