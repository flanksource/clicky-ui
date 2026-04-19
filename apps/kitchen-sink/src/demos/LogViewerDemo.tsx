import { LogViewer } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const lines = Array.from({ length: 40 }, (_, i) => `[line ${i + 1}] processing item...`).join("\n");

export function LogViewerDemo() {
  return (
    <DemoSection
      id="log-viewer"
      title="LogViewer"
      description="Collapsible log block with expand/collapse toggle for long output."
    >
      <LogViewer logs={lines} />
    </DemoSection>
  );
}
