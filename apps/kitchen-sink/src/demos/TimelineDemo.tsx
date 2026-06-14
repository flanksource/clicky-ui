import {
  Badge,
  Timeline,
  type TimelineItem,
  UiCheck,
  UiClose,
  UiComment,
  UiGitPr,
  UiWarningTriangle,
} from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const ITEMS: TimelineItem[] = [
  { id: 1, icon: UiGitPr, tone: "neutral", actor: "adityathebe", action: "opened this pull request", timestamp: "3d ago" },
  { id: 2, icon: UiCheck, tone: "success", actor: "moshloop", action: "approved these changes", timestamp: "1d ago" },
  {
    id: 3,
    icon: UiComment,
    tone: "info",
    actor: "yashmehrotra",
    action: "commented on internal/sse/reconnect.go:42",
    timestamp: "1d ago",
    bodyHeader: (
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-primary">internal/sse/reconnect.go:42</span>
        <Badge tone="warning" size="xs">
          Unresolved
        </Badge>
      </div>
    ),
    body: "Debounce the SSE reconnect — on flaky networks this hammers the controller.",
  },
  { id: 4, icon: UiWarningTriangle, tone: "warning", actor: "flankbot", action: "detected merge conflicts with main", timestamp: "5d ago" },
  { id: 5, icon: UiClose, tone: "danger", actor: "flankbot", action: 'check "e2e" failed — reconnect timeout', timestamp: "1d ago" },
];

export function TimelineDemo() {
  return (
    <DemoSection
      id="timeline"
      title="Timeline"
      description="Vertical activity feed (the Gavel PR TimelineCard) with tone-colored discs, a connector rail, and an optional threaded comment bubble."
    >
      <DemoRow>
        <div className="w-[560px] max-w-full rounded-lg border border-border bg-card p-density-4">
          <Timeline items={ITEMS} />
        </div>
      </DemoRow>
    </DemoSection>
  );
}
