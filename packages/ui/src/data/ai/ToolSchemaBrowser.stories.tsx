import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PermissionRule } from "../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../chat/types";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";

const TOOLS: ToolMeta[] = [
  {
    name: "records_list",
    label: "List records",
    group: "Records read",
    parent: "Records",
    method: "GET",
    defaultPermission: "allow",
    annotations: { readOnlyHint: true, idempotentHint: true },
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "records_update",
    label: "Update record",
    group: "Records write",
    parent: "Records",
    method: "PATCH",
    defaultPermission: "ask",
    annotations: { idempotentHint: true },
    inputSchema: { type: "object", properties: { id: { type: "string" } } },
  },
  {
    name: "records_delete",
    label: "Delete record",
    group: "Records write",
    parent: "Records",
    method: "DELETE",
    defaultPermission: "deny",
    annotations: { destructiveHint: true },
    inputSchema: { type: "object", properties: { id: { type: "string" } } },
  },
];

function EditableBrowser() {
  const [value, setValue] = useState<Record<string, ToolPolicy>>({
    records_list: "allow",
    records_update: "ask",
    records_delete: "deny",
  });
  const apply = (rule: PermissionRule) => {
    const names = typeof rule.name === "string" ? [rule.name] : rule.name ?? [];
    setValue((current) => ({
      ...current,
      ...Object.fromEntries(names.map((name) => [name, rule.policy])),
    }));
  };
  return <ToolSchemaBrowser tools={TOOLS} value={value} onRule={apply} className="h-[42rem]" />;
}

const meta = {
  title: "AI/ToolSchemaBrowser",
  component: ToolSchemaBrowser,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ToolSchemaBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  args: { tools: TOOLS, className: "h-dvh" },
};

export const EditablePermissions: Story = {
  render: () => <EditableBrowser />,
};
