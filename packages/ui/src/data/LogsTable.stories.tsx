import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogsTable } from "./LogsTable";

const meta: Meta<typeof LogsTable> = {
  title: "Data/LogsTable",
  component: LogsTable,
};

export default meta;
type Story = StoryObj<typeof LogsTable>;

const sampleLogs = [
  {
    pod: "policy-api-644b55c866-mg7tg",
    container: "policy-api",
    line: JSON.stringify({
      "@timestamp": "2026-05-03T10:09:30.288Z",
      "log.level": "INFO",
      message: "Filtering request path: appBanner/bannerInfo",
      "ecs.version": "1.2.0",
      "service.name": "policy-api",
      "event.dataset": "policy-api",
      "process.thread.name": "http-nio-8080-exec-6",
      "log.logger": "com.example.policy.filter.ServiceRequestFilter",
    }),
    timestamp: "2026-05-03T10:09:30.288130925Z",
    labels: { namespace: "claims-demo", pod: "policy-api-644b55c866-mg7tg" },
  },
  {
    pod: "policy-api-644b55c866-mg7tg",
    container: "policy-api",
    line: JSON.stringify({
      "@timestamp": "2026-05-03T10:09:31.144Z",
      "log.level": "WARN",
      message: "Slow policy lookup for tenant default",
      "service.name": "policy-api",
      "event.dataset": "policy-api",
      "process.thread.name": "http-nio-8080-exec-3",
      "log.logger": "com.example.policy.lookup.PolicyLookup",
    }),
    timestamp: "2026-05-03T10:09:31.144019003Z",
    labels: { namespace: "claims-demo", pod: "policy-api-644b55c866-mg7tg" },
  },
  "plain startup line before JSON logging is configured",
]
  .map((line) => (typeof line === "string" ? line : JSON.stringify(line)))
  .join("\n");

export const Default: Story = {
  args: {
    logs: sampleLogs,
  },
};

export const Light: Story = {
  args: {
    logs: sampleLogs,
    dark: false,
  },
};
