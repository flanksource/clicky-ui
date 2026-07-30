import {
  CLAUDE_SESSION_EXAMPLE,
  CODEX_SESSION_EXAMPLE,
  SessionInspector,
} from "@flanksource/clicky-ui/ai";
import { DemoSection } from "./Section";

export function SessionInspectorDemo() {
  return (
    <DemoSection
      id="session-inspector"
      title="SessionInspector"
      description="A provider-aware session workspace with transcript and detail tabs, per-turn usage, and a responsive runtime sidebar. SessionViewer remains the transcript-only primitive."
    >
      <div className="min-w-0 space-y-density-2">
        <div className="text-xs text-muted-foreground">
          Recent Codex CLI session · sanitized from Captain history
        </div>
        <div className="h-[720px] min-w-0">
          <SessionInspector session={CODEX_SESSION_EXAMPLE} />
        </div>
      </div>
      <div className="min-w-0 space-y-density-2">
        <div className="text-xs text-muted-foreground">
          Recent Claude CLI session · sanitized from Captain history
        </div>
        <div className="h-[720px] min-w-0">
          <SessionInspector
            session={CLAUDE_SESSION_EXAMPLE}
            defaultTab="turns"
          />
        </div>
      </div>
    </DemoSection>
  );
}
