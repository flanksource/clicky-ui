import { SplitPane } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

export function SplitPaneDemo() {
  return (
    <DemoSection
      id="split-pane"
      title="SplitPane"
      description="Drag the divider to resize. Constraints: minLeft/minRight."
    >
      <div className="h-64 border border-border rounded-md overflow-hidden">
        <SplitPane
          defaultSplit={35}
          left={
            <div className="h-full bg-muted p-density-3 text-sm">
              <p className="font-medium">Left pane</p>
              <p className="text-xs text-muted-foreground mt-density-1">
                Typical use: a list or navigation tree.
              </p>
            </div>
          }
          right={
            <div className="h-full p-density-3 text-sm">
              <p className="font-medium">Right pane</p>
              <p className="text-xs text-muted-foreground mt-density-1">
                Typical use: a detail panel for the selected item.
              </p>
            </div>
          }
        />
      </div>
    </DemoSection>
  );
}
