import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { EnumDisplay, JsonSchemaObject } from "./json-schema-form-types";

function stepSchema(display: EnumDisplay): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      mode: {
        type: "string",
        title: "Mode",
        enum: ["insert", "update", "skip"],
        default: "insert",
        "x-enum-display": display,
        "x-enum-descriptions": {
          insert: "Insert a new activity.",
          update: "Update the existing activity.",
          skip: "Leave the activity untouched.",
        },
      },
    },
  };
}

// applyDefaults={false} leaves an unset value unset, so the schema default shows
// as the implied (outlined, unchecked) choice instead of being written in.
function EnumChoicesDemo({ display, initial }: { display: EnumDisplay; initial: Record<string, unknown> }) {
  const [value, setValue] = useState<Record<string, unknown>>(initial);
  return (
    <div className="max-w-2xl space-y-4 p-4">
      <JsonSchemaForm
        schema={stepSchema(display)}
        value={value}
        onChange={setValue}
        applyDefaults={false}
        showPreferencesMenu={false}
      />
      <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "JsonSchemaForm/Enum choices",
  component: EnumChoicesDemo,
  args: { display: "radio", initial: {} },
  parameters: {
    docs: {
      description: {
        component: [
          "Radio (`x-enum-display: \"radio\"`) and segmented enums show each option's",
          "`x-enum-descriptions` entry as a native tooltip and mark the schema `default` option",
          "with a muted **default** suffix, which is also the option's accessible description.",
          "",
          "While the value is unset, the default option is drawn as the *implied* choice — a dashed",
          "primary outline, distinct from the filled selection — and stays unchecked, because",
          "nothing has been chosen yet. Choosing any option replaces the implied style with a real",
          "selection; the default option keeps its marker.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof EnumChoicesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RadioDefaultUnset: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const insert = canvas.getByRole("radio", { name: "insert" });

    await step("the default option is implied but not checked", async () => {
      await expect(insert).not.toBeChecked();
      await expect(insert.closest("label")).toHaveAttribute("data-implied", "true");
      await expect(insert.closest("label")).toHaveAttribute("title", "Insert a new activity. (default)");
      await expect(insert).toHaveAccessibleDescription("default");
    });

    await step("choosing an option replaces the implied state", async () => {
      await userEvent.click(canvas.getByText("skip"));
      await expect(canvas.getByRole("radio", { name: "skip" })).toBeChecked();
      await expect(canvasElement.querySelector("[data-implied]")).toBeNull();
    });
  },
};

export const RadioDefaultSet: Story = {
  args: { initial: { mode: "update" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: "update" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "insert" })).toHaveAccessibleDescription("default");
    await expect(canvasElement.querySelector("[data-implied]")).toBeNull();
  },
};

export const SegmentedDefaultUnset: Story = {
  args: { display: "segmented" },
};

export const SegmentedDefaultSet: Story = {
  args: { display: "segmented", initial: { mode: "update" } },
};
