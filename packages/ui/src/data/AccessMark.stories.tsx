import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AccessMark } from "./AccessMark";

const meta = {
  title: "Data/AccessMark",
  component: AccessMark,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "How a name is accessed — read, written, or both — as the read and write icons the call graph draws its edges with. Merge what is known of one name with `mergeAccess`.",
      },
    },
  },
  args: { access: "read" },
} satisfies Meta<typeof AccessMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Read: Story = {};

export const Written: Story = { args: { access: "write" } };

export const ReadAndWritten: Story = {
  args: { access: "readwrite" },
  play: async ({ canvasElement }) => {
    const mark = within(canvasElement).getByRole("img", { name: "Read and written" });
    await expect(mark.querySelectorAll("[data-access-icon]")).toHaveLength(2);
  },
};

export const InARow: Story = {
  render: () => (
    <ul className="w-64 divide-y divide-border rounded-md border border-border text-xs">
      {([["POLICYGUID", "read"], ["STATUSCODE", "readwrite"], ["UPDATEDGMT", "write"]] as const).map(([name, access]) => (
        <li key={name} className="flex items-center gap-2 px-2 py-1 font-mono">
          {name}
          <AccessMark access={access} className="ml-auto" />
        </li>
      ))}
    </ul>
  ),
};
