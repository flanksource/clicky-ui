import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  ScheduleEditor,
  type ScheduleEditorProps,
  type ScheduleValue,
} from "./ScheduleEditor";

function ControlledScheduleEditor(args: ScheduleEditorProps) {
  const [value, setValue] = useState<ScheduleValue>(args.value);
  return (
    <div className="max-w-3xl space-y-3">
      <ScheduleEditor {...args} value={value} onChange={setValue} />
      <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "Components/ScheduleEditor",
  component: ScheduleEditor,
  render: (args) => <ControlledScheduleEditor {...args} />,
  args: {
    id: "report-schedule",
    value: { cron: "0 2 * * 0", timezone: "UTC", enabled: true },
    cronSuggestions: [
      { label: "Every hour", cron: "0 * * * *" },
      { label: "Every day", cron: "0 2 * * *" },
      { label: "Every Sunday", cron: "0 2 * * 0" },
    ],
    timezoneSuggestions: ["UTC", "Africa/Johannesburg", "Europe/London"],
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled cron, IANA timezone, and enabled fields for recurring operations. The host owns persistence, actions, permissions, and server-side cron validation.",
      },
    },
  },
} satisfies Meta<typeof ScheduleEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: { disabled: true },
};
