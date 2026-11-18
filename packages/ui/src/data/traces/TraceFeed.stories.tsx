import type { Meta, StoryObj } from "@storybook/react-vite";
import { TraceFeed } from "./TraceFeed";

const meta = {
  title: "Data/Traces/TraceFeed",
  component: TraceFeed,
  args: {
    kinds: ["logs", "query"],
    loadPage: async () => ({ rows: [
      { runId: "example", kind: "logs", stream: "application", seq: 1, timestamp: "2026-01-01T10:00:00Z", summary: "Worker ready", record: { level: "info", message: "Worker ready" } },
      { runId: "example", kind: "query", stream: "metrics", seq: 1, timestamp: "2026-01-01T10:00:01Z", summary: "Requests=12", record: { requests: 12 } },
    ], nextCursor: "" }),
  },
} satisfies Meta<typeof TraceFeed>;
export default meta;
export const Recorded: StoryObj<typeof meta> = {};
