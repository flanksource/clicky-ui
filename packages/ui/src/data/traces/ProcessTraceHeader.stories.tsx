import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProcessTraceHeader } from "./ProcessTraceHeader";
import type { ProcessHeaderRow } from "./process-header";

const rows: ProcessHeaderRow[] = [
  { runId: "example", stream: "capture", key: "123@start", pid: 123, name: "checkout", command: "checkout serve", cpuPercent: 24.5, rssBytes: 134217728, memoryPercent: 8 },
  { runId: "example", stream: "capture", key: "124@start", pid: 124, name: "worker", command: "worker queue", cpuPercent: 125, rssBytes: 67108864, memoryPercent: 4 },
  { runId: "example", stream: "capture", key: "125@start", pid: 125, name: "migrate", command: "checkout migrate", exitedAt: "2026-11-08T12:00:00Z", cpuPercent: null, rssBytes: 8388608, memoryPercent: 0.5 },
];

const meta = {
  title: "Data/Traces/ProcessTraceHeader",
  component: ProcessTraceHeader,
  args: { rows, showExited: false, onShowExitedChange: () => {} },
  render: function Header(args) {
    const [showExited, setShowExited] = useState(false);
    return <ProcessTraceHeader {...args} showExited={showExited} onShowExitedChange={setShowExited} />;
  },
} satisfies Meta<typeof ProcessTraceHeader>;
export default meta;
export const Processes: StoryObj<typeof meta> = {};
