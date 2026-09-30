import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { ChangeListener, JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// A screen field shaped like a generated rule's action picker: every option
// resets and locks a different slice of a dozen sibling fields, so its debug
// card is far taller than a hover card can show.
const GROUP_FIELDS = ["groupName", "groupDate", "groupDescription"];
const CLASS_FIELDS = ["category", "loanOverride", "classDate", "classDescription", "loanType", "className", "classAction"];

const readOnly = (keys: string[], value: boolean) => Object.fromEntries(keys.map((key) => [key, { readOnly: value }]));

const groupActionListeners: ChangeListener[] = [
  { when: { const: "00" }, patch: { currentGroup: { readOnly: true } }, set: { currentGroup: "00000000-0000-0000-0000-000000000000" } },
  {
    when: { const: "00" },
    patch: { ...readOnly(GROUP_FIELDS, true), classAction: { readOnly: false } },
    set: { groupName: "", groupDate: "", groupDescription: "", classAction: "00" },
  },
  {
    when: { const: "01" },
    hide: ["benefitsTitle"],
    patch: { ...readOnly(CLASS_FIELDS, true), ...readOnly(GROUP_FIELDS, false), currentGroup: { readOnly: true } },
    set: { category: "", currentGroup: "00000000-0000-0000-0000-000000000000", loanOverride: "00", classDate: "", classDescription: "", loanType: "00", className: "", classAction: "00" },
  },
  {
    when: { const: "02" },
    hide: ["benefitsTitle"],
    patch: { ...readOnly(CLASS_FIELDS, true), ...readOnly(GROUP_FIELDS, false), currentGroup: { readOnly: false } },
    set: { category: "", loanOverride: "00", classDate: "", classDescription: "", loanType: "00", className: "", classAction: "00" },
  },
];

const text = (title: string): JsonSchemaProperty => ({ type: "string", title });

const largeFieldSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    groupAction: {
      type: "string",
      title: "Group action",
      enum: ["00", "01", "02"],
      "x-enum-labels": { "00": "-- Please select --", "01": "Add", "02": "Update" },
      "x-query": { type: "SQL", sql: "Select '00' CodeValue, '-- Please select --' ShortDescription Union Select CodeValue, ShortDescription From Codes Where CodeName = 'UserOption'" },
      "x-on-change": groupActionListeners,
    },
    currentGroup: text("Current group"),
    groupName: text("Group name"),
    groupDate: { type: "string", format: "date", title: "Group date" },
    groupDescription: text("Group description"),
    benefitsTitle: text("Benefits"),
    category: text("Category"),
    loanOverride: text("Loan override"),
    classDate: { type: "string", format: "date", title: "Class date" },
    classDescription: text("Class description"),
    loanType: text("Loan type"),
    className: text("Class name"),
    classAction: text("Class action"),
  },
};

const meta = {
  title: "JsonSchemaForm/Debug",
  component: JsonSchemaForm,
  args: { onChange: () => undefined },
} satisfies Meta<typeof JsonSchemaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LargeField: Story = {
  args: {
    schema: largeFieldSchema,
    value: { groupAction: "01" },
    preferencesStorageKey: "storybook-json-schema-form-debug-large",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A field whose debug card outgrows a hover card. Listener rows gather the fields a listener sets to one value or patches one way (`readOnly: true` → seven fields) so each listener stays a few rows. The card clamps behind **Show more**, and **Open in dialog** shows the full details in a modal that stays open after the hover card closes.",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("Turn on Debug", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Form display options" }));
      await userEvent.click(await body.findByRole("menuitemcheckbox", { name: /Show hidden fields/ }));
    });
    await step("The group action card is clamped behind Show more", async () => {
      await userEvent.hover(await canvas.findByRole("button", { name: "Debug groupAction" }));
      const card = await body.findByTestId("json-schema-form-debug-card");
      await waitFor(() => expect(within(card).getByRole("button", { name: "Show more" })).toBeInTheDocument());
    });
  },
};
