import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { LOGGERS } from "../fixtures/classes";
import { LoggersTable } from "./LoggersTable";

function Demo({ filter: initial, canEdit }: { filter: string; canEdit: boolean }) {
  const [filter, setFilter] = useState(initial);
  return (
    <div className="flex h-[420px] flex-col p-3">
      <LoggersTable loggers={LOGGERS} filter={filter} onFilterChange={setFilter} onEdit={() => {}} canEdit={canEdit} />
    </div>
  );
}

const meta = {
  title: "JVM/LoggersTable",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { filter: "", canEdit: true },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllLoggers: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("(inherit) → FINE")).toBeInTheDocument();
  },
};

export const Filtering: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Filter loggers" }), "catalina");
    await expect(canvas.getByText("2 of 7 loggers")).toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  args: { canEdit: false },
};
