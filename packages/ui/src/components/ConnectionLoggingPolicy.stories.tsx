import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionLoggingPolicy } from "./ConnectionLoggingPolicy";
import {
  type ConnectionLoggingCapability,
  type ConnectionLoggingPolicyProps,
} from "./ConnectionLoggingPolicy.model";

const SQL_CAPABILITY: ConnectionLoggingCapability = {
  family: "sql",
  slowThreshold: "1s",
  thresholdLabel: "Slow threshold",
  events: [
    {
      event: "error",
      property: "log.level.error",
      label: "Errors",
      description:
        "Failed operations, including the sanitized statement identity.",
      default: "error",
      captures: ["error", "operation", "duration"],
      example: {
        event: "error",
        connection_level: "error",
        provider: "postgres",
        connection: "warehouse",
        duration_ms: 82,
        rows: 0,
        sql: "SELECT * FROM orders WHERE tenant_id = ?",
        error: "syntax error",
      },
      prettyExample:
        "[postgres/warehouse] ERROR >=[82ms] [rows:0] syntax error SELECT * FROM orders WHERE tenant_id = ?",
    },
    {
      event: "slow",
      property: "log.level.slow",
      label: "Slow operations",
      description: "Successful operations at or above the slow threshold.",
      default: "warn",
      captures: ["statement", "duration", "slow threshold"],
      example: {
        event: "slow",
        connection_level: "warn",
        provider: "postgres",
        connection: "warehouse",
        duration_ms: 1200,
        rows: 25,
        sql: "SELECT * FROM orders WHERE tenant_id = ?",
        slow_threshold_ms: 1000,
      },
      prettyExample:
        "[postgres/warehouse] SLOW SQL >= [1200ms] [rows:25] SELECT * FROM orders WHERE tenant_id = ?",
    },
    {
      event: "sql",
      property: "log.level.sql",
      label: "SQL statement",
      description: "The sanitized SQL statement and its completion metrics.",
      default: "trace",
      captures: ["statement", "duration", "rows"],
      example: {
        event: "sql",
        connection_level: "trace",
        provider: "postgres",
        connection: "warehouse",
        sql: "SELECT * FROM orders WHERE tenant_id = ?",
        duration_ms: 48,
        rows: 25,
      },
      prettyExample:
        "[postgres/warehouse] [48ms] [rows:25] SELECT * FROM orders WHERE tenant_id = ?",
    },
    {
      event: "sql_params",
      property: "log.level.sql.params",
      label: "SQL parameters",
      description: "Bound arguments, with string values masked before logging.",
      default: "trace1",
      captures: ["bound arguments"],
      example: {
        event: "sql_params",
        connection_level: "trace1",
        provider: "postgres",
        connection: "warehouse",
        duration_ms: 48,
        rows: 25,
        params: ["t****"],
      },
      prettyExample: "[postgres/warehouse] params [t****]",
    },
  ],
};

function StatefulPolicy(
  props: Omit<ConnectionLoggingPolicyProps, "value" | "onChange">,
) {
  const [value, setValue] = useState<Record<string, string>>({});
  return (
    <ConnectionLoggingPolicy {...props} value={value} onChange={setValue} />
  );
}

const meta = {
  title: "Components/ConnectionLoggingPolicy",
  component: ConnectionLoggingPolicy,
  parameters: { layout: "padded" },
  render: (args) => (
    <StatefulPolicy
      definition={args.definition}
      readOnly={args.readOnly ?? false}
    />
  ),
  args: { definition: SQL_CAPABILITY, readOnly: false },
} satisfies Meta<typeof ConnectionLoggingPolicy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SQLDefaults: Story = {};

export const ReadOnly: Story = { args: { readOnly: true } };
