import { SessionViewer, type SessionEntry } from "@flanksource/clicky-ui/ai";
import { DemoSection, DemoRow } from "./Section";

// A compact captain session (pkg/ai/history schema): a prompt, the agent's
// reasoning + prose, a handful of tool calls with responses, an MCP call and a
// terminal API error — enough to show every action icon and the expand affordance.
const SESSION: SessionEntry[] = [
  {
    type: "user",
    uuid: "u1",
    message: { role: "user", content: [{ type: "text", text: "Wire up the new gauge to the metrics endpoint." }] },
  },
  {
    type: "assistant",
    uuid: "a1",
    message: {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "First find where the timeseries fetcher is defined, then trace the route." },
        { type: "text", text: "I'll locate the fetcher and the metrics route, then connect them." },
      ],
    },
  },
  {
    type: "assistant",
    uuid: "a2",
    tool_use: {
      tool: "Grep",
      input: { pattern: "api/v1/metrics", path: "packages/ui/src" },
      source: "claude",
      model: "claude-opus-4-8",
      response: "packages/ui/src/data/TimeseriesGauge.tsx:42\npackages/ui/src/data.ts:317",
    },
  },
  {
    type: "assistant",
    uuid: "a3",
    tool_use: {
      tool: "Read",
      input: { file_path: "packages/ui/src/data/TimeseriesGauge.tsx" },
      response: "export function TimeseriesGauge({ baseUrl, value, max }: Props) { /* … */ }",
    },
  },
  {
    type: "assistant",
    uuid: "a4",
    tool_use: {
      tool: "Edit",
      input: { file_path: "packages/ui/src/data/TimeseriesGauge.tsx" },
      response: "Applied 1 edit",
    },
  },
  {
    type: "assistant",
    uuid: "a5",
    tool_use: {
      tool: "Bash",
      input: { command: "pnpm --filter @flanksource/clicky-ui test TimeseriesGauge" },
      response: "Test Files  1 passed (1)\n     Tests  6 passed (6)",
    },
  },
  {
    type: "assistant",
    uuid: "a6",
    tool_use: { tool: "Task", input: { description: "Verify gauge thresholds", prompt: "Check tone at 75% and 90%." } },
  },
  {
    type: "assistant",
    uuid: "a7",
    tool_use: { tool: "mcp__postgres__execute_sql", input: { sql: "SELECT count(*) FROM metrics" }, response: "1 row" },
  },
];

export function SessionViewerDemo() {
  return (
    <DemoSection
      id="session-viewer"
      title="SessionViewer"
      description="Renders a recorded AI coding-agent session (the captain pkg/ai/history JSON schema) as a vertical action log. Each entry sits on a tone-colored disc from the Flanksource Agent Action Icons set; user prompts are right-aligned. The 3-dot menu mirrors `captain history` filtering — set density and light/dark theme, and hide categories (explore, edit, run, …), tools or sources."
    >
      <DemoRow label="Default — open the 3-dot menu to set density or hide categories/tools">
        <div className="w-full max-w-2xl">
          <SessionViewer session={SESSION} />
        </div>
      </DemoRow>

      <DemoRow label="Expanded (tool input + output)">
        <div className="w-full max-w-2xl">
          <SessionViewer session={SESSION} defaultExpanded showHeader={false} />
        </div>
      </DemoRow>
    </DemoSection>
  );
}
